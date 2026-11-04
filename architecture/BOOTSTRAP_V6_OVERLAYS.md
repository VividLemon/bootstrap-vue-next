# Bootstrap v6 Overlays (G1): Dialog, Drawer, `useModal`

## Summary

- **Dialog** supersedes `BModal`, **Drawer** supersedes `BOffcanvas` (rule 1: redesign). Both become a native `<dialog>` with v6 markup (`.dialog` / `.drawer`, no `.modal-dialog` / `.modal-content` wrappers, no backdrop element), opened with `showModal()` / `show()` and animated by the v6 CSS through `useShowHide` + `useCssTransition`.
- Today both components render v5 classes (`.modal`, `.offcanvas`, `.modal-backdrop`, …) that **do not exist** in 6.0.0-alpha.1 `bootstrap.css` (0 matches), so they are unstyled on the v6 branch. This redesign is required, not optional.
- The top layer, `inert`, focus containment, Escape and the `::backdrop` come from the browser. The library's z-index stacking (`useModalManager` math, `--b-*` vars, `stack-*` classes), `useActivatedFocusTrap` (and with it the `focus-trap` and `@vueuse/integrations` peers), the custom backdrop, `backdropFirst`, `useSafeScrollLock` and the JS-driven responsive offcanvas all go away.
- Port Bootstrap's `dialog-base.ts` / `dialog.ts` / `drawer.ts` behavior into Vue (about 300 lines of logic). Don't wrap Bootstrap's classes: they register document/window listeners at import time (not SSR-safe) and mutate `classList` that Vue patches.
- `useModal` resolves with a plain `{trigger, ok, value}` result (no `BvTriggerableEvent`), and its show/hide/get/current helpers fold into `useToggle`. No `useDrawer`: the orchestrator controller stays generic internally.
- 9 questions for the maintainer; the high-impact ones are naming (Q1), the built-in OK/Cancel footer (Q2), trigger events (Q3) and the `useModal` result (Q4).

## Sources read

- `AGENTS.md`, `architecture/BOOTSTRAP_V6_NEW_COMPONENTS.md`, `architecture/BOOTSTRAP_V6_MIGRATION.md` (Deferred components: BModal → Dialog, BOffcanvas → Drawer, BApp / BOrchestrator), `architecture/ARIA_VISIBILITY.md`.
- #164 foundations: `src/composables/useShowHide.ts`, `useCssTransition.ts`, `useLegacyShowHide.ts`, `src/utils/responsive.ts` (`breakpointWidths`), `resolvePartColor`. Checked #167 (feedback): it doesn't touch `BOrchestrator`.
- Library: `BModal.vue`, `BOffcanvas.vue`, `BApp.vue`, `BOrchestrator.vue`, `useModal/index.ts`, `useModalManager.ts`, `orchestratorShared/index.ts`, `useToggle/index.ts`, `directives/BModal` (a re-export of `vBToggle`), `useActivatedFocusTrap.ts`, `useSafeScrollLock.ts`, `useScrollLock`, `utils/keys.ts` (`modalManagerKey`, `orchestratorRegistryKey`), `plugins/registry`, `types/ComponentProps.ts` / `ComponentEmits.ts` / `ComponentSlots.ts` / `ComponentOrchestratorTypes.ts`, `BvTriggerableEvent`, `src/styles/styles.scss` (`--bs-modal-zindex`), `package.json`, `packages/nuxt/src/runtime/createBootstrap.ts`.
- Docs: `components/modal.md`, `offcanvas.md`, `composables/useModal.md`, `directives/BModal.md`, `.vitepress/theme/Layout.vue` (two responsive `BOffcanvas` in `<ClientOnly>`), `src/components/ShowHideProps.vue`, `data/components/modal.data.ts` / `offcanvas.data.ts` / `app.data.ts`. Playground `TModal.vue`, `TOffcanvas.vue`, `TTable.vue`.
- Bootstrap 6.0.0-alpha.1: `js/src/dialog-base.ts`, `dialog.ts`, `drawer.ts`, `util/component-functions.ts`, `util/swipe.ts`, `tooltip.ts` (container redirect into `dialog[open]`); `scss/_dialog.scss`, `_drawer.scss`, `mixins/_dialog-shared.scss`, `_config.scss` (`$zindex-levels`); `dist/css/bootstrap.css` (every class and token below was checked there). Docs at getbootstrap.com/docs/6.0/components/dialog/ and /drawer/.

## Shared base (`dialog-base.ts`)

What v6 does for both components, and how the Vue port maps it:

| v6 behavior                                                                                                                       | Vue port                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `show()`: cancelable `show`, then `showModal()` (modal) or `show()`; adds `dialog-open` to `<html>` when it locks scroll          | `useShowHide` emits `show`; the `transition` callback awaits `nextTick` (lazy content is patched), calls `showModal()` / `show()` if `!el.open`, then `run()`                                                                                   |
| `hide()`: cancelable `hide`, adds `.hiding`, `close()` now (Drawer) or after the transition (Dialog, `_shouldDeferClose`), removes `.hiding`, fires `hidden` | `:class="{hiding: !visible && isActive}"`; the callback calls `close()` before `run()` (Drawer, or `-instant`) or after `run()` resolves `true` (animated Dialog). `isActive` goes `false` after that, so `.hiding` is removed after `close()`, as in v6 |
| Escape: native `cancel` (modal) / `keydown` Escape (non-modal), `preventDefault()`; `keyboard: false` → static bounce + `hidePrevented` | Same listeners on the `<dialog>`; route to `hide('esc')` or the bounce                                                                                                                                                                          |
| Backdrop click: `click` with `event.target === dialog` and modal; `backdrop: 'static'` → bounce                                   | Same, with a `pointerdown` target check so a drag that starts inside and ends on the backdrop doesn't close (the current `mousedown.self` behavior)                                                                                              |
| Static bounce: `hidePrevented` (cancelable), add `.dialog-static` / `.drawer-static`, remove after the transition                  | A `bouncing` ref bound to the class; a second `useCssTransition` instance awaits it                                                                                                                                                              |
| Scroll lock: `:root.dialog-open {overflow: hidden}`; removed only when no `dialog[open]:modal` remains                             | Same class through `getSafeDocument()`, checked after each `close()`. Replaces `useSafeScrollLock` / `useScrollLock`                                                                                                                              |
| `dispose()` while open: `close()` and restore the scroll lock                                                                      | `onBeforeUnmount`: same                                                                                                                                                                                                                           |
| Hides child tooltips, popovers and toasts on hide                                                                                 | Not needed for components rendered in the dialog (they unmount or stay inside). See the cross-group notes on orchestrated popovers and toasts                                                                                                     |

The browser can also close the dialog without going through `hide()`: Chrome's close-watcher anti-abuse rule makes a second Escape without user activation non-cancelable, and `<form method="dialog">` or an Invoker Command `command="close"` closes it directly. So the port also listens to the native **`close`** event: if `visible` is still `true`, it syncs the state through `hide(trigger, true)` without a transition (the dialog is already closed) so `v-model`, `hidden` and the `useModal` promise still settle. A `<form method="dialog">` submit is intercepted on `submit` (`preventDefault`) and routed to `hide('submit')`, with the submitter's `value` as the result `value`, so the exit transition still plays (see Q4).

`closedby` (native `any` / `closerequest` / `none`): v6's JS and CSS don't use it, and browser support is incomplete (Chromium and Firefox; not Safari when this was written; verify before implementing). Q7 covers whether to render it.

## Dialog

### v6 overview

- Markup: `<dialog class="dialog">` › `.dialog-header` (`.dialog-title`, `.btn-close` with `margin-inline-start: auto`) › `.dialog-body` › `.dialog-footer` (flex, `justify-content: flex-end`, `gap: var(--bs-dialog-footer-gap)`).
- Options: `backdrop` (`true` | `'static'`, default `true`; no effect for non-modal), `keyboard` (default `true`), `modal` (default `true`: `showModal()`; `false`: `show()` + `.dialog-nonmodal`, which is `position: fixed; z-index: var(--bs-z-dialog)` (1040), with no backdrop, no focus trap and no inert page).
- Classes: sizes `.dialog-sm` (280px), default 500px, `.dialog-lg` (800px), `.dialog-xl` (1140px); `.dialog-fullscreen`; `.{sm,md,lg,xl,2xl}-down:dialog-fullscreen`; `.dialog-scrollable`; `.dialog-slide-down` / `.dialog-slide-up` (default is a fade); `.dialog-instant`; state `.hiding`, `.dialog-static`, `.dialog-swap-in`, `.dialog-nonmodal`. There is **no centered modifier** (the native modal dialog is always centered with `margin: auto`), and there is no `.modal-dialog` / `.modal-content`.
- Events: `show`, `shown`, `hide`, `hidden`, `hidePrevented` (static backdrop or `keyboard: false`), `cancel` (Escape, before the hide).
- Swap: a `data-bs-toggle="dialog"` trigger inside an open dialog opens the new dialog with `.dialog-swap-in` (its backdrop starts opaque), then hides the current one with `.dialog-instant`. Both cancelable events are checked first.
- Focus: native. `showModal()` focuses the autofocus or first focusable element and makes the page inert; v6 additionally focuses the data-API trigger on `hidden`.
- Tokens (`--bs-dialog-*`): `padding`, `width`, `margin`, `color`, `bg`, `border-color`, `border-width`, `border-radius`, `box-shadow`, `transition-property` (`opacity, transform, visibility`), `transition-duration` (.3s), `transition-timing`, `backdrop-bg`, `backdrop-blur`, `header-padding`, `header-border-*`, `footer-padding`, `footer-border-*`, `footer-gap`.

### Current library

`BModal` renders `.modal` › `.modal-dialog` › `.modal-content` plus a sibling `.modal-backdrop`, inside `<Transition>`, teleported to `body`. It manages z-index per stack position (`getModalZIndex`, `useModalManager`, `--b-position` / `--b-count` / `--b-inverse-position`, `stack-position-*` classes), focus with `focus-trap` (`useActivatedFocusTrap`, fallback focus element), Escape with `onKeyStroke`, and scroll with `useSafeScrollLock`. It renders a built-in OK/Cancel footer by default. It runs on `useLegacyShowHide`.

### Prop disposition

| Prop                                                                           | Disposition                                                       | Notes                                                                                                                                       |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`                                                                   | keep                                                              | `v-model`                                                                                                                                    |
| `id`                                                                           | keep                                                              |                                                                                                                                             |
| `show`, `visible`, `initialAnimation`, `lazy`, `unmountLazy`                   | keep (shared `ShowHideProps`)                                     | `lazy` covers the content only; the `<dialog>` element always stays mounted                                                                 |
| `noTransition`                                                                 | keep                                                              | → `.dialog-instant`                                                                                                                          |
| `noBackdrop`                                                                   | replace with v6 `backdrop`                                        | v6 always renders `::backdrop` for a modal dialog; a non-modal dialog (`modal: false`) has none. To hide it visually, set `--bs-dialog-backdrop-bg` |
| `noCloseOnBackdrop`                                                            | replace with v6 `backdrop: 'static'` (bounce) or `backdrop: false` | `backdrop?: boolean \| 'static'`, default `true`                                                                                            |
| `noCloseOnEsc`                                                                 | replace with v6 `keyboard` (default `true`)                       | `false` → bounce + `hide-prevented`                                                                                                          |
| —                                                                              | **new** `modal` (default `true`)                                  | `show()` + `.dialog-nonmodal` when `false`                                                                                                   |
| —                                                                              | **new** `slide?: 'down' \| 'up'`                                  | → `.dialog-slide-down` / `.dialog-slide-up`                                                                                                  |
| `size`                                                                         | keep, retype                                                      | `'sm' \| 'lg' \| 'xl'` → `.dialog-{size}` (no `md`)                                                                                         |
| `fullscreen`                                                                   | keep                                                              | `true` → `.dialog-fullscreen`; `Breakpoint` → `{bp}-down:dialog-fullscreen`. Stays `boolean \| Breakpoint`, not `Responsive<T>`: it is a single "below bp" switch |
| `scrollable`                                                                   | keep                                                              | → `.dialog-scrollable`                                                                                                                       |
| `centered`                                                                     | remove                                                            | Always centered natively                                                                                                                     |
| `teleportTo`, `teleportDisabled`                                               | remove (Q6)                                                       | Top layer                                                                                                                                    |
| `noTrap`                                                                       | remove                                                            | Native; use `modal: false` for no containment                                                                                                |
| `bodyScrolling`                                                                | remove                                                            | v6: a modal dialog locks scroll, a non-modal one doesn't                                                                                     |
| `backdropFirst`                                                                | remove                                                            | `::backdrop` belongs to the dialog                                                                                                           |
| `noStacking`                                                                   | remove (Q5)                                                       |                                                                                                                                             |
| `focus`                                                                        | keep reduced (Q8)                                                 | `'ok' \| 'cancel' \| 'close'` → `autofocus` on that built-in button; other targets use `autofocus` in content                                |
| `title`, `titleTag`                                                            | keep                                                              | `titleTag` default `'h5'`                                                                                                                    |
| `body`                                                                         | keep                                                              | Plain-text body for programmatic dialogs (`create({title, body})`)                                                                           |
| `titleVisuallyHidden`                                                          | remove (Q8)                                                       | `titleAttrs: {class: 'visually-hidden'}`                                                                                                    |
| `noHeader`, `noHeaderClose`, `headerCloseLabel`                                | keep                                                              | Small additives; `headerCloseLabel` is i18n                                                                                                  |
| `headerCloseVariant`, `headerCloseColor`                                       | remove                                                            | The `header-close` slot replaces the whole button (see slots); style the slotted button directly                                            |
| `noFooter`                                                                     | depends on Q2                                                     |                                                                                                                                             |
| `okTitle`, `okOnly`, `okDisabled`, `cancelTitle`, `cancelDisabled`              | depends on Q2 (recommended keep)                                  |                                                                                                                                             |
| `okVariant`, `okColor`, `cancelVariant`, `cancelColor`, `buttonSize`            | depends on Q2 (recommended → `okAttrs` / `cancelAttrs`)           | BButton props through attrs                                                                                                                  |
| `busy`                                                                         | remove (Q2)                                                       | Same as `okDisabled` + `cancelDisabled`                                                                                                      |
| `headerColor`, `bodyColor`, `footerColor`                                      | keep                                                              | Rule 5 (`<part>Color` objects)                                                                                                               |
| `headerAttrs`, `bodyAttrs`                                                     | keep                                                              |                                                                                                                                             |
| `headerClass`, `bodyClass`, `footerClass`, `titleClass`                        | replace with `headerAttrs` / `bodyAttrs` / `footerAttrs` / `titleAttrs` | Rule 5                                                                                                                                 |
| `headerCloseClass`                                                             | replace with `headerCloseAttrs`                                   |                                                                                                                                             |
| `okClass`, `cancelClass`                                                       | replace with `okAttrs`, `cancelAttrs`                             |                                                                                                                                             |
| `modalClass`, `dialogClass`, `contentClass`                                    | remove                                                            | The `<dialog>` is the only wrapper; `class` / `$attrs` land on it                                                                            |

### Slots, emits, exposed

| Item                                        | Disposition                                                                                                       |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| slots `default`, `header`, `title`, `footer` | keep                                                                                                              |
| slot `header-close`                         | keep; replaces the close button entirely (today its content goes inside a `BButton`)                              |
| slots `ok`, `cancel`                        | keep if Q2 keeps the built-in footer                                                                              |
| slot `backdrop`                             | remove (`::backdrop` is a pseudo-element)                                                                         |
| slot props                                  | `id`, `visible`, `active`, `show`, `hide(trigger?, value?)`, `toggle`, `ok(value?)`, `cancel()`, `close()`        |
| emits `show`, `shown`, `hide`, `hidden`, `show-prevented`, `hide-prevented`, `toggle`, `toggle-prevented`, `update:modelValue` | keep (`hide-prevented` covers v6 `hidePrevented`) |
| emits `ok`, `cancel`, `close`, `esc`, `backdrop` | Q3                                                                                                           |
| exposed `show`, `hide`, `toggle`, `id`, `visible` | keep. `hide(trigger?, value?)`. v6 `handleUpdate()` isn't needed                                            |

### Proposed API

```ts
export interface BDialogProps extends ShowHideProps {
  id?: string
  modelValue?: boolean
  modal?: boolean // true
  backdrop?: boolean | 'static' // true
  keyboard?: boolean // true
  size?: 'sm' | 'lg' | 'xl'
  fullscreen?: boolean | Breakpoint
  scrollable?: boolean
  slide?: 'down' | 'up'
  title?: string
  titleTag?: string // 'h5'
  body?: string
  focus?: 'ok' | 'cancel' | 'close'
  noHeader?: boolean
  noHeaderClose?: boolean
  headerCloseLabel?: string // 'Close'
  noFooter?: boolean // Q2
  okTitle?: string // 'OK', Q2
  okOnly?: boolean
  okDisabled?: boolean
  cancelTitle?: string // 'Cancel'
  cancelDisabled?: boolean
  okAttrs?: Readonly<AttrsValue> // BButton props too: {variant, theme, size, class}
  cancelAttrs?: Readonly<AttrsValue>
  headerColor?: ColorBorderExtendables
  bodyColor?: ColorExtendables
  footerColor?: ColorBorderExtendables
  headerAttrs?: Readonly<AttrsValue>
  titleAttrs?: Readonly<AttrsValue>
  headerCloseAttrs?: Readonly<AttrsValue>
  bodyAttrs?: Readonly<AttrsValue>
  footerAttrs?: Readonly<AttrsValue>
}
```

### Markup

```html
<dialog
  id="…"
  class="dialog dialog-lg dialog-scrollable dialog-slide-down md-down:dialog-fullscreen"
  :class="{'dialog-nonmodal': !modal, 'dialog-instant': noTransition || instant, hiding: !visible && isActive, 'dialog-static': bouncing}"
  aria-labelledby="…-label"
>
  <div class="dialog-header">
    <h5 id="…-label" class="dialog-title">Title</h5>
    <button type="button" class="btn-close" aria-label="Close"></button>
  </div>
  <div class="dialog-body">…</div>
  <div class="dialog-footer">
    <button class="btn-solid theme-secondary">Cancel</button>
    <button class="btn-solid theme-primary">OK</button>
  </div>
</dialog>
```

- Vue never binds the `open` attribute: only `showModal()` / `show()` / `close()` set it. Binding `open` would give a non-modal open state and make `showModal()` throw `InvalidStateError`.
- `.dialog-nonmodal` can be bound statically from the `modal` prop (it only positions the element; a closed dialog is `visibility: hidden`).
- Drop `aria-describedby` on the body by default (v6 doesn't set it; a long body would be read in full). Users can add it through `$attrs`.

### a11y

- Role, `aria-modal`, inert page, focus containment and Escape are native for `showModal()`. A non-modal dialog doesn't trap focus or make the page inert (v6 behavior).
- Initial focus: the browser's dialog focusing steps (first `autofocus` element, else the first focusable). `focus` maps to `autofocus` on a built-in button. Lazy content must be patched before `showModal()` (the transition callback awaits `nextTick` first).
- Return focus: the browser restores focus on `close()`. Registered `v-b-toggle` triggers are also refocused on `hidden` when still visible (v6 `_registerFocusRestoration`).
- `aria-labelledby` points at the title while the header renders. With `noHeader`, users pass `aria-label`.
- `aria-expanded` on registered triggers stays with `useShowHideRegistration`.

### SSR

- SSR renders a closed `<dialog class="dialog …">`. `showModal()` / `show()` / `close()`, the `cancel` / `close` / `submit` listeners and the `dialog-open` class run on the client only (`onMounted` / transition callback, `getSafeDocument()`).
- An initially shown dialog (`v-model` true or `visible`) renders closed on the server, then `showModal()` runs instantly on mount (`instant` → `.dialog-instant`). There is no hydration mismatch, because no class depends on client-only state.

## Drawer

### v6 overview

- Markup: `<dialog class="drawer drawer-start" aria-labelledby="…">` › `.drawer-header` (`.drawer-title`, `.btn-close`) › `.drawer-body` › optional `.drawer-footer`.
- Placement is **required** (no default rule): `.drawer-start`, `.drawer-end`, `.drawer-top`, `.drawer-bottom`, `.drawer-fullscreen`.
- Variants: `.drawer-sheet` (flush to the edge, no inset or radius), `.drawer-translucent`, `.drawer-instant`; `.drawer-fit-content` exists in the CSS but isn't documented.
- Responsive: `.{sm,md,lg,xl,2xl}:drawer` instead of `.drawer`. Below the breakpoint it is a drawer (`@media (width < bp)`, viewport media queries, not container queries); at and above it, it renders inline (static, `display: flex !important`, `visibility: visible !important`, `.drawer-header` hidden, `.drawer-body` a flex row). This is pure CSS. On window resize, the JS hides an open drawer whose `position` is no longer `fixed`, and does the same for a drawer inside a `.navbar` through a `ResizeObserver`.
- Options: `backdrop` (`true` | `'static'` | `false`), `keyboard`, `scroll` (default `false`). It is modal when `backdrop || !scroll`; scroll is locked when `!scroll`. So `scroll: true` + `backdrop: false` is the only non-modal mode. With `backdrop: false` and `scroll: false`, the drawer is still modal and the CSS still paints `::backdrop`, although the docs say `false` "hides the backdrop". This is an upstream inconsistency; follow the code.
- `hide()` adds `.hiding` and calls `close()` immediately (no deferred close); the slide-out runs because the CSS keeps `display: flex` and transitions `transform, visibility`.
- Swipe to dismiss (direction from placement and RTL), using touch/pointer events in `util/swipe.ts`.
- Data API: opening one drawer hides another open one. There is no `cancel` event (`_onCancel` is a no-op).
- Tokens (`--bs-drawer-*`): `inset`, `zindex` (`var(--bs-z-drawer)`, 1030), `width` (400px), `height` (30vh), `padding-x/y`, `color`, `bg`, `border-*`, `box-shadow`, `transition-*`, `title-line-height`, `backdrop-bg`, `backdrop-blur`, `sheet-width`.

### Current library

`BOffcanvas` renders `.offcanvas` / `.offcanvas-{bp}` + `.offcanvas-{placement}` and a `.offcanvas-backdrop` element, with `<Transition>` (`showing` / `hiding` classes), `focus-trap`, `useSafeScrollLock` and `onKeyStroke`. Its `responsive` mode is JS-driven (`useBreakpoints` + `breakpointWidths`, `isOpenByBreakpoint`, teleport disabled while inline, `breakpoint` emit, fake `show` / `hide` emits), so the docs layout wraps it in `<ClientOnly>` to avoid hydration mismatches.

### Prop disposition

| Prop                                                                     | Disposition                                                 | Notes                                                                                 |
| ------------------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `modelValue`, `id`                                                       | keep                                                        |                                                                                       |
| `show`, `visible`, `initialAnimation`, `lazy`, `unmountLazy`             | keep (shared)                                               | Lazy content still renders while inline (responsive)                                  |
| `noTransition`                                                           | keep                                                        | → `.drawer-instant`                                                                   |
| `placement`                                                              | keep, retype                                                | `'start' \| 'end' \| 'top' \| 'bottom' \| 'fullscreen'`, default `'start'`, always rendered |
| `responsive`                                                             | keep                                                        | `Breakpoint` → `{bp}:drawer` instead of `drawer`; CSS-only                            |
| `noBackdrop`, `noCloseOnBackdrop`                                        | replace with v6 `backdrop?: boolean \| 'static'`            |                                                                                       |
| `noCloseOnEsc`                                                           | replace with v6 `keyboard`                                  |                                                                                       |
| `bodyScrolling`                                                          | replace with v6 `scroll`                                    | `scroll && !backdrop` → non-modal `show()`                                             |
| —                                                                        | **new** `sheet`, `translucent`                              | → `.drawer-sheet`, `.drawer-translucent` (`translucent` matches BToast / BCard)        |
| `backdropFirst`, `noTrap`, `teleportTo`, `teleportDisabled`              | remove                                                      | As for Dialog (Q6)                                                                    |
| `shadow`                                                                 | remove                                                      | v6 drawer has `--bs-drawer-box-shadow`; utilities through `class`                      |
| `width`                                                                  | remove (Q8)                                                 | `style="--bs-drawer-width: 20rem"` (and `--bs-drawer-height` for top/bottom)          |
| `focus`                                                                  | keep reduced (Q8)                                           | `'close'` → `autofocus` on the close button                                           |
| `title`                                                                  | keep                                                        | Renders `h5.drawer-title`                                                             |
| `noHeader`, `noHeaderClose`, `headerCloseLabel`                          | keep                                                        |                                                                                       |
| `headerCloseVariant`, `headerCloseColor`                                 | remove                                                      | As for Dialog                                                                         |
| `headerAttrs`, `bodyAttrs`                                               | keep                                                        |                                                                                       |
| `headerClass`, `bodyClass`, `footerClass`, `headerCloseClass`            | replace with `headerAttrs`, `bodyAttrs`, `footerAttrs`, `headerCloseAttrs` |                                                                         |

| Slot / emit / exposed                                                    | Disposition                                                                                      |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| slots `default`, `header`, `title`, `header-close`, `footer`             | keep; `footer` renders `.drawer-footer` (today a bare `<div>`)                                    |
| slot `backdrop`                                                          | remove                                                                                           |
| slot props                                                               | `id`, `visible`, `active`, `show`, `hide`, `toggle`, `placement`                                  |
| emits `show` … `toggle-prevented`, `update:modelValue`                   | keep                                                                                             |
| emits `close`, `esc`, `backdrop`                                         | follow Q3                                                                                        |
| emit `breakpoint`                                                        | remove: the inline state is CSS; use `useBreakpoints` / `useMediaQuery` from `@vueuse/core`       |
| exposed `isOpenByBreakpoint`                                             | remove                                                                                           |
| exposed `show`, `hide`, `toggle`                                         | keep; add `id`, `visible` (as Dialog)                                                            |

### Markup

```html
<dialog
  id="…"
  class="md:drawer drawer-end drawer-sheet"
  :class="{'drawer-instant': noTransition || instant, hiding: !visible && isActive, 'drawer-static': bouncing}"
  tabindex="-1"
  aria-labelledby="…-label"
>
  <div class="drawer-header">
    <h5 id="…-label" class="drawer-title">Title</h5>
    <button type="button" class="btn-close" aria-label="Close"></button>
  </div>
  <div class="drawer-body">…</div>
  <div class="drawer-footer">…</div>
</dialog>
```

### Behavior to port

- Modal / scroll matrix from `_getShowOptions`: modal = `backdrop !== false || !scroll`; lock scroll = `!scroll`.
- Responsive: while the viewport is at or above the breakpoint, the element is inline. Port v6's guard: on resize (`useMediaQuery` with `breakpointWidths`, or `getComputedStyle(el).position !== 'fixed'` in a rAF-throttled `resize` listener), hide an open drawer. When the drawer is inline, `visible` stays `false`, so `v-model` means "opened as a drawer". This is a behavior change from today, where `isOpenByBreakpoint` emitted `show` / `hide`.
- The navbar `ResizeObserver` (hide when the navbar expands) belongs with G3; Drawer exposes nothing extra for it because the resize guard above covers it if it checks computed `position`.
- Swipe: use `usePointerSwipe` (or `useSwipe`) from `@vueuse/core` (already a dependency), enabled only while open, with the direction from `placement` and `useRtl`. No new dependency.
- One open drawer at a time: v6 does this only in the data API. Port it into `v-b-toggle` when the target is a drawer, or skip it. Recommendation: skip it; v-model users decide.

### a11y and SSR

- Same as Dialog. A non-modal drawer (`scroll` without backdrop) doesn't contain focus.
- An inline responsive drawer is still a `<dialog>` element (v6 accepts this); its header is hidden by CSS. Keep `aria-labelledby` only while the header renders.
- SSR: responsive mode is CSS-only, so the server output matches the client and the docs `Layout.vue` can drop `<ClientOnly>` around both sidebars.

## Composables, directives and the orchestrator

### `useModal` (redesign)

- `create(props)` returns the controller as today (`show`, `hide`, `toggle`, `set`, `get`, `destroy`, `[Symbol.asyncDispose]`). `controller.show()` resolves with a plain result object (Q4):

  ```ts
  interface DialogResult<T = string> {
    trigger: string | null // 'ok' | 'cancel' | 'close' | 'esc' | 'backdrop' | 'submit' | custom | null
    ok: boolean | null // trigger 'ok' → true, 'cancel' → false, else null
    value?: T // hide(trigger, value) / ok(value) / <form method="dialog"> submitter value (native returnValue)
  }
  ```

  It is built in `BOrchestrator` from `hidden` (or `hide` with `resolveOnHide`), replacing `setEventOk`, which mutates `BvTriggerableEvent.ok`. `BvTriggerableEvent.ok` can then be removed.
- Remove `show(id)`, `hide(trigger, id)`, `get(id)` and `current()`: they duplicate `useToggle(id)` / `useToggle()` (nearest parent), which works for every show/hide component. Keep `hideAll(trigger?)` (Q5). `useModal` becomes `{create, hideAll}`.
- Rename it with the component (Q1).

### `useDrawer` / shared controller

Not worth a public API: programmatic drawers are rare, and `create({component: BDrawer, …})` through the dialog controller already works because the orchestrator's `component` field is free. Keep `buildController` generic internally (it already is). Q9 asks for confirmation.

### `useModalManager` / `modalManagerKey`

- Remove the z-index math, `--b-*` CSS variables, `stack-position-*` / `stack-inverse-position-*` classes, the `modal-open` body class (v6 uses `dialog-open` on `<html>`), `getModalZIndex` in `utils/dom.ts`, and `--bs-modal-zindex` in `styles.scss`.
- The top layer orders modal dialogs by open order; Escape goes to the topmost one natively.
- Keep only an ordered stack of open dialogs (for `hideAll` and swap), or derive it from `document.querySelectorAll('dialog[open]')`. Q5.

### `vBModal`

`directives/BModal/index.ts` is `export {vBToggle as vBModal}`. Under rule 4 (no aliases), remove it and document `v-b-toggle` (Q1). `v-b-toggle` keeps `aria-controls` / `aria-expanded`. It gains the v6 swap when the trigger sits inside an open dialog (Q5).

### `useToggle`

No change. `show()` / `hide()` / `toggle()` keep returning the `useShowHide` promise values.

### `useScrollLock` (public) / `useSafeScrollLock`

`useScrollLock` is a public re-export of `@vueuse/core`'s `useScrollLock` wrapped in `createSharedComposable`; only `useSafeScrollLock` (BModal / BOffcanvas) uses it. Once the `dialog-open` class replaces it, remove both (Q9).

### `BApp` / `BOrchestrator`

- Modal items render through `<TransitionGroup>` (with no name for the modal group) inside `<span>` wrappers. Replace them with a plain `v-for`: the dialog animates itself. Stop passing `teleport-disabled` if teleport is removed (Q6). Keep `initial-animation`.
- The orchestrator container's position doesn't matter for modal dialogs (top layer). A non-modal dialog in the container is `position: fixed` with `z-index: var(--bs-z-dialog)`.
- **Toast container (noted for the toast owner, not decided here):** `toast-container` groups use `<TransitionGroup name="b-list">`; per the migration plan they must follow the native transition path. Toasts and orchestrated popovers rendered in the orchestrator are **below an open modal dialog's top layer and inert**. See Cross-group dependencies.

## Port vs wrap Bootstrap JS

**Reimplement in Vue.**

- Bootstrap's modules register listeners at import time (`Dialog`'s `static {}` block on `document`, `drawer.ts` on `window` for `load` / `resize`). Importing them on the server throws or leaks; on the client they would also act on every `[data-bs-toggle]` in the page.
- They own state through `classList` (`.hiding`, `.dialog-nonmodal`, `.dialog-instant`, `.dialog-swap-in`), which Vue's `:class` patch would overwrite, and through `BaseComponent`'s `Data` map. The library also needs `v-model`, cancelable events with triggers, `lazy`, and promise results.
- The logic is small (`dialog-base.ts` 350 lines including comments; the Vue port is the table in "Shared base"). `useShowHide` + `useCssTransition` already provide the lifecycle.
- No third-party dependency: v6 Dialog / Drawer use none. Swipe uses `@vueuse/core`.

Dependency changes: remove the `focus-trap` and `@vueuse/integrations` peer and dev dependencies (`useActivatedFocusTrap` is only used by BModal and BOffcanvas). `@vueuse/core` stays.

## Cross-group dependencies

| Item                                                     | Owner          | Note                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Navbar collapsed menu                                    | G3 Navbar      | Uses `BDrawer` with `responsive` (`lg:drawer`), CSS-only. Drawer's resize guard hides an open drawer once it is inline. v6's `.navbar` `ResizeObserver` and the navbar `:not([open])` transition-kill rule (the reason `.hiding` is added before `close()`) are G3's to check |
| Menus / Combobox inside a dialog                         | G2 Menus       | Anything teleported out of the `<dialog>` (to `body`) is under the top layer and inert. Menus inside a modal dialog must render inside the dialog (v6 `tooltip.ts` redirects its `container` to `closest('dialog[open]')`) or use the popover API                                          |
| Tooltips / popovers (Floating UI batch)                  | wave 2         | Same rule. `BPopover` renders in place by default (fine), but `usePopover` items rendered in `BOrchestrator` are behind an open modal dialog                                                                                                                                                 |
| Toasts / orchestrator toast container                    | Toast owner    | Orchestrated toasts render behind an open modal dialog and are inert. Option: make each toast container `popover="manual"` and call `showPopover()` when a toast appears (it then enters the top layer above earlier dialogs). Also replace `<TransitionGroup name="b-list">` with the native path |
| `Responsive<T>` vs `fullscreen: Breakpoint`              | all            | `fullscreen` keeps a single breakpoint (`{bp}-down:` is a "below" switch), the same pattern as Drawer `responsive` and Navbar `toggleable`                                                                                                                                                   |
| `backdrop` / `keyboard` names in `useShowHide`           | foundations    | `useShowHide` reads `noCloseOnBackdrop` / `noCloseOnEsc`; after this change no component sets them. Dialog / Drawer check `backdrop` / `keyboard` before calling `hide()`, and the two props can be removed from `UseShowHideProps`                                                         |
| `BvTriggerableEvent.ok`                                  | foundations    | Only `BOrchestrator.setEventOk` writes it; remove with Q4                                                                                                                                                                                                                                   |

## Questions for the maintainer

### Q1. Component and API names (High)

Bootstrap renamed Modal → Dialog and Offcanvas → Drawer; the classes are `.dialog` / `.drawer`.

- **A. Rename everything:** `BDialog`, `BDrawer`, `useDialog`; remove `vBModal` (use `v-b-toggle`). Matches v6 docs and classes; rule 4, no aliases. Cons: churn in user code, docs URLs and the Nuxt module.
- **B. Keep `BModal` / `BOffcanvas` / `useModal` / `vBModal`**, with v6 internals. Less churn, but the names no longer match the markup or the Bootstrap docs, and `vBModal` stays an alias.
- **C. Rename components, keep `useModal`** (a well-known name for programmatic dialogs).

**Recommendation: A.** Both components are rebuilt and every user touches them anyway.

### Q2. Built-in OK/Cancel footer (High)

v6 Dialog has no built-in buttons; the footer is user markup. `BModal` renders OK + Cancel by default, and `useModal` message boxes (`create({title, body}).show()` → `ok`) depend on it.

- **A. Remove it** (pure v6). The footer is slot-only; message boxes need `slots`. Cons: breaks the main `useModal` use case, and every confirm dialog becomes boilerplate.
- **B. Keep it reduced and opt-in:** `okTitle`, `okOnly`, `okDisabled`, `cancelTitle`, `cancelDisabled`, `okAttrs` / `cancelAttrs` (BButton props through attrs); remove `okVariant`, `okColor`, `cancelVariant`, `cancelColor`, `buttonSize`, `busy`. The footer renders when the `footer` slot is used, or when `okTitle` / `cancelTitle` is set, or always for `useModal().create` (decide default below).
- **C. Keep everything as today** (default footer, all variant/color/size props).

Sub-choice for B: render the footer by default (as today) or only on request (as v6). **Recommendation: B, with the footer rendered by default** (keeps message boxes one-liners; `noFooter` stays).

### Q3. Trigger events (High)

Today: cancelable `ok`, `cancel` (Cancel button), `close` (X), `esc`, `backdrop`, plus `hide` with a `trigger`. v6 and native `cancel` mean Escape (a close request), which conflicts with the library's `cancel`.

- **A. Keep all trigger events.** No user rewrites, but `cancel` keeps a meaning opposite to native/v6.
- **B. Keep only `hide` (cancelable, with `trigger`), plus `ok`, plus v6 `cancel` = Escape.** Remove `close`, `esc`, `backdrop` and the Cancel-button `cancel` (use `@hide` and `e.trigger`). Keeps the common `@ok` validation pattern.
- **C. Only `hide` + v6 `cancel`.** Smallest, but `@ok="e => !valid && e.preventDefault()"` becomes `@hide="e => e.trigger === 'ok' && …"`.

**Recommendation: B.** Drawer follows the same rule without `ok` and without `cancel` (v6 Drawer has none).

### Q4. `useModal` result (High)

- **A. Plain `{trigger, ok, value?}`** object (plus `[Symbol.asyncDispose]`), where `value` is generic: set by `hide(trigger, value)` / `ok(value)` slot functions, or the submitter's value from `<form method="dialog">` (native `returnValue`). Drop `BvTriggerableEvent.ok`.
- **B. Keep `BvTriggerableEvent`** and add `value`. Less churn, but it keeps an event object (with `preventDefault` that does nothing after the fact) as a result.
- **C. Like A, but `value` is only the native `returnValue` string.** Simplest mapping, but you can't return data from a programmatic form.

**Recommendation: A.** Also intercept `<form method="dialog">` submissions so they play the exit transition (`trigger: 'submit'`).

### Q5. Stacking and swap (Medium)

The top layer stacks modal dialogs natively (each one has its own `::backdrop`, so backdrops darken twice). `noStacking` hides other dialogs when a new one opens. v6 instead "swaps" when a `data-bs-toggle` trigger inside an open dialog opens another one (`.dialog-swap-in`, the old one closes instantly).

- **A. Native stacking only.** Remove `noStacking`; keep a slim ordered stack for `hideAll`.
- **B. A + v6 swap** for `v-b-toggle` triggers inside an open dialog.
- **C. Keep `noStacking`** as a small additive (applied on top of A).

**Recommendation: B.** It matches v6 for the common "next step" case; v-model users can still stack.

### Q6. Teleport (Medium)

Modal dialogs and modal drawers live in the top layer, so ancestors' `overflow`, `transform` and `z-index` no longer matter. Non-modal ones (`modal: false`, drawer `scroll` without backdrop) are `position: fixed` and still affected by a transformed ancestor. A closed `.dialog` is absolutely positioned and `visibility: hidden`, so it can add scrollable overflow inside an `overflow: auto` container.

- **A. Remove `teleportTo` / `teleportDisabled`.** Render in place; users wrap in Vue's `<Teleport>` (rule 3) when they need to. Remove the Nuxt module's `#teleports` defaults for BModal / BOffcanvas. Fixes SSR teleport hydration issues.
- **B. Keep them, default changed to in place** (`teleportTo` undefined).
- **C. Keep them as today** (default `body`).

**Recommendation: A.** Keep `teleportTo` on `BApp` / `BOrchestrator` (toasts, popovers).

### Q7. `closedby` and Escape guarantees (Low)

Chrome makes a second Escape without user activation non-cancelable, so `keyboard: false` can't be fully enforced through `cancel.preventDefault()` alone. `closedby="none"` blocks close requests natively but isn't supported everywhere, and no `cancel` event fires then, so there is no bounce.

- **A. Follow v6:** `cancel` + `preventDefault()`, plus the native `close` fallback that syncs state when the browser closes anyway.
- **B. A + render `closedby="none"` when `keyboard === false`** (in browsers that support it), with a `keydown` Escape listener for the bounce.
- **C. Expose `closedby` as a prop.**

**Recommendation: B** (A is required anyway).

### Q8. Borderline additives (Medium)

Rule 1 allows a handful of small additives. Proposed:

| Keep                                                                            | Remove                                                                                    |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `title`, `titleTag`, `body`, `noHeader`, `noHeaderClose`, `headerCloseLabel`, `lazy` / `unmountLazy`, `focus` reduced to `'ok' \| 'cancel' \| 'close'` | `centered`, `titleVisuallyHidden`, `width` / `shadow` (Drawer), `busy`, the element / selector / `false` forms of `focus`, `breakpoint` emit |

- **A. As proposed.**
- **B. Keep more** (`width`, `titleVisuallyHidden`, full `focus`).
- **C. Keep less** (also remove `body`, `focus`, `noHeaderClose`).

**Recommendation: A.**

### Q9. Composables removed or not added (Low)

- **A.** No `useDrawer`; slim `useModal` (or `useDialog`) to `{create, hideAll}`; remove public `useScrollLock`, internal `useSafeScrollLock`, `useActivatedFocusTrap`, `useModalManager` z-index code, and the `focus-trap` / `@vueuse/integrations` peers.
- **B. A, but keep `useModal`'s `show` / `hide` / `get` / `current`** next to `useToggle`.
- **C. A + add `useDrawer`** mirroring `useDialog`.

**Recommendation: A.**

## Decisions

_Pending maintainer answers._

## Exports, docs and migration notes

- Exports: `components/index.ts` (`BModal` → `BDialog`, `BOffcanvas` → `BDrawer` per Q1), `directives/index.ts` (remove `vBModal`), `composables/index.ts` (`useModal` → `useDialog`, remove `useScrollLock`), `BootstrapVueOptions.ts` (component, directive and composable paths; `BvnComponentProps` keys), `ComponentProps.ts` / `ComponentEmits.ts` / `ComponentSlots.ts` / `ComponentOrchestratorTypes.ts` (`ModalOrchestrator*` → `DialogOrchestrator*`), `utils/keys.ts` (`modalManagerKey`), `plugins/registry`, `useRegistry`, `utils/dom.ts` (`getModalZIndex`), `styles.scss` (`--bs-modal-zindex`), `package.json` peers.
- Nuxt: `createBootstrap.ts` drops the BModal / BOffcanvas `teleportTo` defaults (Q6); check auto-import names after the renames.
- Docs data: `modal.data.ts` → `dialog.data.ts`, `offcanvas.data.ts` → `drawer.data.ts`, `app.data.ts` (orchestrator), `ShowHideProps.vue` (component list, `noBackdrop` / `noHeaderClose` rows).
- Docs pages: `components/modal.md` → `dialog.md` (drop the stacking z-index / CSS variables sections, centered, backdrop slot; add modal / non-modal, slide, fullscreen breakpoints, static backdrop, swap), `offcanvas.md` → `drawer.md` (placement incl. fullscreen, sheet, translucent, responsive CSS-only, scroll / backdrop matrix, swipe), `composables/useModal.md`, `directives/BModal.md` (remove), `useToggle.md`, `.vitepress/theme/Layout.vue` (drop `<ClientOnly>`, `responsive="lg"` stays, `header-class` → `header-attrs`, replace `offcanvas-hidden-width`), about 17 modal, 10 offcanvas and 4 `useModal` demos, `ModalHeaderCloseBSV(N).vue`. Playground: `TModal.vue`, `TOffcanvas.vue`, `TTable.vue`.
- Migration notes (`migration-data/components/bmodal.md`, a new `boffcanvas.md`): renames; native `<dialog>` markup and the removed wrappers (`modalClass` / `dialogClass` / `contentClass`); `noBackdrop` / `noCloseOn*` / `bodyScrolling` → `backdrop` / `keyboard` / `scroll`; no z-index stacking variables or classes; no `centered`; no teleport; footer and trigger event changes; result object instead of `BvTriggerableEvent`; responsive drawer is CSS-only and no longer emits `show` / `hide` / `breakpoint` when crossing the breakpoint; `focus-trap` / `@vueuse/integrations` are no longer needed.

## Implementation split

1. **Dialog core** (`BDialog`): native `<dialog>`, shared behavior (scroll lock, Escape / backdrop / bounce, native `close` / `submit` handling) in an internal `useDialogBase` composable used by both components, the transition callback, props and slots per the decisions, specs (happy-dom has no `showModal()` / `getAnimations()`: stub them, as `collapse.spec.ts` does for animations), docs data and page, demos, playground. Remove `useActivatedFocusTrap`, `useModalManager` z-index code, `getModalZIndex`, `--bs-modal-zindex`, the focus-trap peers.
2. **Orchestrator and `useDialog`**: result object, `BOrchestrator` modal group without `<TransitionGroup>`, `useDialog` = `{create, hideAll}`, slim stack, swap in `v-b-toggle` (Q5), remove `vBModal`, `BvTriggerableEvent.ok`, `useScrollLock`. Docs `useModal.md` → `useDialog.md`.
3. **Drawer** (`BDrawer`) on the same base: placement, responsive CSS, scroll / backdrop matrix, resize guard, swipe, docs, `Layout.vue`. G3 Navbar builds on it.
4. **Cleanup**: `useLegacyShowHide` once BDropdown (G2) is migrated as well; Nuxt defaults; migration notes. Verify in a real browser (headless Chromium): top layer, `::backdrop` fade, deferred `close()` exit, Escape twice, `<form method="dialog">`, responsive drawer resize, scroll lock with stacked dialogs.
