# ARIA Visibility and Show/Hide Architecture

## Overview

Show/hide components (BCollapse, BOffcanvas, BDialog, BDropdown, BAlert, BToast, BPopover, BTooltip) share one system for visibility state, `v-model`, cancelable events and ARIA attributes on registered triggers.

With Bootstrap v6 the system is being moved to Bootstrap's **native transition** model: CSS owns all motion, JavaScript toggles a state class, waits for the element's transition to end, then fires the event. See `architecture/BOOTSTRAP_V6_MIGRATION.md`, section "Transitions (native, no Vue `<Transition>`)".

During the migration there are two paths:

| Path               | Composables                              | Components                                                                                                             |
| ------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Native (v6)        | `useShowHide` + `useCssTransition`       | BCollapse (+ BAccordionItem, which renders it), BAlert, BToast, BPopover / BTooltip, BDialog (through `useDialogBase`) |
| Legacy (to delete) | `useLegacyShowHide` + Vue `<Transition>` | BOffcanvas, BDropdown (deferred)                                                                                       |

Both paths share `useShowHideRegistration` (app registry + trigger registry + `aria-expanded`), so ARIA behavior is identical on both.

`useLegacyShowHide.ts` is marked `@deprecated` and must be deleted once the last component has moved to the native path. BCarousel, BOverlay (`useFadeTransition` in `useTransitions.ts`) and BOrchestrator use Vue `<Transition>` directly and are migrated with their own components.

## Files

- `packages/bootstrap-vue-next/src/composables/useCssTransition.ts` - waits for an element's own CSS transition
- `packages/bootstrap-vue-next/src/composables/useShowHide.ts` - native-path state/v-model/events, plus the shared `useShowHideRegistration`
- `packages/bootstrap-vue-next/src/composables/showHideMachine.ts` - the lifecycle state machine behind `useShowHide` (internal, no Vue)
- `packages/bootstrap-vue-next/src/composables/useLegacyShowHide.ts` - deprecated pre-v6 path
- `packages/bootstrap-vue-next/src/composables/useComponentToggle/index.ts` - `useComponentToggle(id).props`, the trigger binding (replaced `v-b-toggle` / `v-b-modal` in #195)

## Native path

### Division of responsibilities

| Concern                                                      | Owner                                  |
| ------------------------------------------------------------ | -------------------------------------- |
| Visibility state, `v-model`, `show`/`hide`/`toggle`, events  | `useShowHide` (lifecycle: its machine) |
| Mapping state to v6 classes (`.show`, `.hiding`, `-instant`) | The component                          |
| Waiting for the transition                                   | `useCssTransition`                     |
| Duration, easing, animated properties                        | CSS (`--bs-{component}-transition-*`)  |
| `aria-controls` on triggers                                  | `useComponentToggle().props`           |
| `aria-expanded` on registered triggers                       | `useShowHideRegistration`              |

`useShowHide` has **no class and no timing logic**. The only "timing" it knows about is the optional `delay` prop (a wait before the state flips, used by popovers).

### `useCssTransition(element)`

```ts
const {run, cancel, isTransitioning} = useCssTransition(elementRef)
const finished: boolean = await run(applyFn?)
```

`run(apply?)`:

1. calls `apply()` synchronously (optional; a `classList` change or a reactive change that drives `:class`);
2. awaits `nextTick()` (Vue patched the DOM) and one animation frame;
3. awaits `Promise.allSettled(el.getAnimations().map((a) => a.finished))` for the element's **own** finite animations (no subtree, infinite animations ignored, cancelled ones count as settled).

It resolves `true` when finished **and still the latest call**, `false` when a newer `run()` or `cancel()` happened. Zero duration, `prefers-reduced-motion`, an `-instant` class, `transition-none` or a missing element all mean "no animations", so it resolves right after the frame. It is SSR-safe: nothing touches browser globals before `run()`, `requestAnimationFrame` is read through `getSafeWindow()` and falls back to a timeout (also when no frame arrives within 100 ms, e.g. background tabs that throttle or pause rAF), and `getAnimations` is feature-checked. Pending runs are cancelled when the owning effect scope is disposed.

### `useShowHide({modelValue, props, emit, element, id}, {transition, disabled})`

Props read: `visible`, `show`, `initialAnimation`, `lazy`, `unmountLazy`, `delay`. It does not know triggers such as `'esc'` or `'backdrop'`: a component that must not close on them (BDialog / BDrawer `backdrop` / `keyboard`) decides that before it calls `hide()`.

`triggerEvent` (optional): maps a hide trigger to the name of the event emitted for it before `hide`, or `undefined` for none. The default is an event named like the trigger. BDialog maps `'ok'` → `ok`, `'esc'` → `cancel` and nothing else.

`syncHidden(trigger?)` (returned): the component was already hidden from outside (the browser closed a native `<dialog>`). A hide that cannot be refused and skips the transition: `hide` is emitted with `cancelable: false`, then `update:modelValue` and `hidden`.

`disabled` (optional, a ref or getter; **not** read from `props`, because BAlert and BToast have a `disabled` prop with another meaning): while it is `true`, a show request resolves `'show-prevented'` without events (and writes `modelValue` back); turning it on while `showing` / `shown` hides with trigger `'disabled'` (an ordinary, cancelable hide without a trigger event). For Menu (G2).

`transition(visible)` is called right after the state flipped and must resolve `true` once the transition ended (and is current). Components pass `() => run()`. Without it, the composable resolves after `nextTick`.

Returns:

| Name                                                            | Meaning                                                                                                                                                                         |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state`                                                         | `'hidden' \| 'showing' \| 'shown' \| 'hiding'`, read-only. See [State machine](#state-machine)                                                                                  |
| `visible`                                                       | The state class is applied. Flips at the start of a show/hide (after the cancelable event and any `delay`). Drives the state class, `aria-expanded` and the `visible` slot prop |
| `isActive`                                                      | `true` from the start of a show until `hidden`. Use for `v-if` of transient elements; the `active` slot prop                                                                    |
| `instant`                                                       | `true` while the current change must skip the transition (initial render of an initially shown component, `visible` prop changes). Add the `-instant` class while set           |
| `contentShowing`                                                | Default content should render (`lazy` / `unmountLazy`)                                                                                                                          |
| `show(resolveOnHide?)`                                          | Resolves `true` after `shown`, `'show-prevented'`, or `false` when superseded. With `resolveOnHide` it resolves with the trigger once hidden again, or `'dispose'` on unmount   |
| `hide(trigger?, noTriggerEmit?)`                                | Resolves `trigger ?? ''` after `hidden`, `'hide-prevented'`, or `false` when superseded                                                                                         |
| `toggle(resolveOnHide?)`                                        | Emits `toggle` (cancelable), then hides (trigger `'toggle-function'`) or shows                                                                                                  |
| `buildTriggerableEvent`, `registerTrigger`, `unregisterTrigger` | Helpers / registry                                                                                                                                                              |

Event order:

```
show():  'show' (cancelable → 'show-prevented') → visible = true, isActive = true, update:modelValue
         → transition(true) → 'shown'
hide():  [trigger] + 'hide' (cancelable → 'hide-prevented') → visible = false, update:modelValue
         → transition(false) → isActive = false, 'hidden' {trigger}
```

- A newer show/hide supersedes a pending one. The older one never emits `shown` / `hidden`; its promise resolves `false`. Repeating the same direction while pending returns the pending promise; `show()` and `show(true)` each keep their own, so one caller cannot change what another waits for.
- The promise of a finished show/hide is resolved before `shown` / `hidden` is emitted, so a listener may start the next change synchronously.
- A prevented show/hide that was requested through `v-model` reverts `modelValue`.
- Numeric `modelValue` (countdown) is set to `0` on hide; changes between truthy numbers do nothing.
- Initially shown (`modelValue` without `initialAnimation`, or `visible`): rendered shown with `instant = true`; on mount it emits `show` (cancelable) and, one frame later, `shown`.
- `initialAnimation` with `modelValue`, or the `show` prop: rendered hidden, then shown with a transition on mount.
- `lazy`: content mounts when a show starts (so it is laid out for the transition). With `unmountLazy` it unmounts after `hidden`.
- Unmounting resolves a pending change with `false` and emits nothing more.

### State machine

The lifecycle is an explicit machine (`showHideMachine.ts`, internal). `useShowHide` owns one and only translates its entry points into requests: `show()` / `hide()` / `toggle()`, `v-model` and the `visible` / `show` props (cancelable like any other request; a refused one writes `modelValue` back), registered triggers, and unmount (`dispose`).

```
hidden ─show→ showing ──transition done──→ shown
  ↑              │ ↑                         │
  │         hide ↓ │ show (reverses)         │
  └─transition done── hiding ←─────hide──────┘
```

- `showing` / `hiding` start when the request is accepted and end when `shown` / `hidden` is emitted. A configured `delay` is the first phase of the state: `state` is already `showing`, while `visible` (the state class) flips only after the delay.
- `visible` is `true` in `showing` and `shown`, except during a delay phase, where it keeps its previous value. `isActive` is `true` from the moment a show flips `visible` until `hidden`. `instant` belongs to the operation in progress.
- An initially shown component starts in `showing` (instant) and becomes `shown` one frame after mount.

Transition table (`showHideTransitions`; `useShowHide.spec.ts` has one test per cell and listener behavior):

| State     | `show`                                                                        | `hide`                                                            | unmount (`dispose`)       |
| --------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------- |
| `hidden`  | `show` event → `showing`                                                      | nothing, resolves `''`                                            | nothing                   |
| `showing` | joins the show in progress (same promise)                                     | `[trigger]` + `hide` events → `hiding`; the show resolves `false` | the show resolves `false` |
| `shown`   | nothing, resolves `true`                                                      | `[trigger]` + `hide` events → `hiding`                            | nothing                   |
| `hiding`  | `show` event → `showing` (the transition reverses); the hide resolves `false` | joins the hide in progress (same promise); its trigger stays      | the hide resolves `false` |

A refused request (`preventDefault()`, or `disabled` for a show) leaves the state and the operation in progress as they are and resolves `'show-prevented'` / `'hide-prevented'`.

Guarantees:

1. **Request events see the old state.** `show`, `hide` and trigger events (`ok`, `close`, ...) are emitted before anything changed.
2. **A nested request replaces the outer one.** When a listener of a request event (or of `toggle`) makes a request that is carried out (for example `@ok="hide()"`, or `@hide` that prevents and then calls `hide('cancel')`), the outer request emits nothing more, not even `hide-prevented`, and returns the nested request's result. A nested request that changes nothing (joined, refused, or already in that state) does not replace it.
3. **State first, then events.** `state`, `visible` and `isActive` change before `update:modelValue`. `shown` / `hidden` are emitted with the state final and the operation's promise already resolved, so a listener may start the next change synchronously and gets a clean new operation.
4. **Every operation settles exactly once:** finished (`true` / the trigger), superseded or unmounted (`false`). A superseded operation never emits its `shown` / `hidden`.
5. **`show(true)` is a promise for the cycle,** not the operation: it resolves with the trigger of the hide that ends in `hidden`, also when the show was superseded by that hide, when the component was already shown, and across a hide that was reversed. Unmount resolves it `'dispose'`.
6. **Unmount is silent.** No `hide` / `hidden`; `state` keeps its last value; later requests resolve `false` without events.
7. **`event.signal`** on request events (and their `-prevented` events) aborts when the machine next carries out a show or hide, or on unmount. A refused request leaves it running.

The machine also takes a hide that already happened and cannot be refused (`hide(trigger, {cancelable: false})`: events with `cancelable: false`). `useShowHide` exposes it as `syncHidden()`; `useDialogBase` calls it on a native `<dialog>` `close`.

### Adopting it in a component

```ts
const element = useTemplateRef<HTMLElement>('_element')
const {run} = useCssTransition(element)
const {visible, isActive, instant, contentShowing, show, hide, toggle} = useShowHide(
  {modelValue, props, emit: emit as EmitFn, element, id: computedId},
  {transition: () => run()}
)
const classes = computed(() => ({
  'show': visible.value,
  'toast-instant': props.noTransition || instant.value,
}))
```

Checklist: check the `-instant` class exists in `node_modules/bootstrap/dist/css/bootstrap.css`; remove the Vue `<Transition>`; keep the element mounted while hidden unless the v6 component removes it (then `v-if="isActive"`); emit component-specific events from `shown` / `hidden`.

### BPopover / BTooltip

- BTooltip renders BPopover with `tooltip`, so both share one implementation. The floating element toggles only `.show` (v6 fades it in CSS, with `@starting-style` for the entry); `noTransition` and instant changes add `popover-instant` / `tooltip-instant`. There is no `fade` class and no `<Transition>`.
- The element is rendered while `contentShowing` and displayed (`v-show`) while `isActive`, so the fade-out finishes before it is hidden. `autoUpdate` from Floating UI runs from the start of a show until `hidden`.
- The `delay` prop is the machine's delay phase. A trigger that fires while a show is in progress (hover, then focus) joins it and emits no second `show`.
- Escape (document `keydown`, capture phase, key press consumed) hides with trigger `'esc'` unless `manual` or `noAutoClose` is set. It has no event of its own.
- While `isActive`, the id is added to the trigger's `aria-describedby` (existing ids are kept) and removed after `hidden` or on unmount.
- BTooltip's exposed `show` / `hide` / `toggle` forward every argument.

### `useDialogBase` (BDialog; BDrawer will reuse it)

`src/composables/useDialogBase.ts` wraps `useShowHide` for a native `<dialog>` (the port of v6 `dialog-base.ts`):

- The `transition` callback opens and closes the element: on show it awaits `nextTick` (lazy content is in the DOM), calls `showModal()` / `show()` and then `run()`; on hide it runs the exit transition and calls `close()` afterwards (`deferClose`, v6 Dialog) or closes first (instant, and v6 Drawer). Vue never binds `open`.
- It returns `isHiding` (`.hiding`: from the start of a hide until `hidden`), `isInstant` (`-instant`), `bouncing` (`-static`) and `closedby` for the component's class and attribute bindings.
- Escape (`keydown` on the dialog, plus the native `cancel` for close requests without a key press) and backdrop clicks (`pointerdown` + `click` on the dialog element itself) are checked against `keyboard` / `backdrop` **before** `hide()`. A disabled one emits `hide-prevented` (cancelable) and bounces.
- Page scroll lock is `dialog-open` on `<html>`, kept while any locking dialog is open.
- A native `close` that the library did not cause becomes `syncHidden('native')`. A `<form method="dialog">` submit is prevented and becomes `hide('submit', submitter.value)`.
- `hide(trigger, value)` keeps `value` as `returnValue` when the hide is carried out.
- v6 transitions `visibility`, so at the moment of `showModal()` the content still computes to hidden and the browser's focusing steps would find nothing. The element is made visible without a transition just before opening (inline style, removed right after), so native initial focus works.

### BCollapse

- The element always has `.collapse`; only `.show` is toggled. `navbar-collapse` / `collapse-horizontal` follow `isNav` / `horizontal`.
- v6 CSS animates `block-size` (or `inline-size` for `.collapse-horizontal`) with `interpolate-size: allow-keywords`, `@starting-style` and a discrete `display` transition. No `.collapsing`, no JS height measuring, no inline sizes, no `<Transition>`.
- Bootstrap v6 has **no `collapse-instant` class**. `noTransition` (and `instant`) add the `transition-none` utility, which v6's own collapse JS also treats as "no transition".
- Workaround: in 6.0.0-alpha.1 `.fade` / `.collapse` (from `_transitions.scss`) are emitted **outside any cascade layer**, so they beat the layered `transition-none` utility. While instant, BCollapse therefore also sets `--bs-transition-collapse-duration: 0s` inline. Remove that once upstream layers the transition rules: alpha.2 does, and adds `.collapse-instant` ([twbs/bootstrap#43403](https://github.com/twbs/bootstrap/pull/43403)), so the workaround goes with the move to alpha.2.

## Trigger registration and ARIA (both paths)

Registration is **opt-in**: binding `useComponentToggle(id).props` registers the element with the target through the app-wide show/hide registry (`showHideRegistryKey`). Unregistered triggers must manage their own ARIA attributes.

| Attribute       | Owner                     | Lifecycle                                                                                                |
| --------------- | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `aria-controls` | `useComponentToggle`      | From the ids passed (or the found parent's id), rendered through `props`; leaves with the element        |
| `aria-expanded` | `useShowHideRegistration` | Dynamic: set on registration, updated on every visibility change, removed on unregister (`clean = true`) |

There are **no trigger state classes**. The v5 `collapsed` / `not-collapsed` classes were removed; style triggers with `[aria-expanded="true"]` / `[aria-expanded="false"]`. (BAccordionItem's own header button still renders the v5 accordion `collapsed` class until the accordion markup is migrated; that is accordion markup, not the trigger system.)

`aria-expanded` follows `visible` on the native path (changes when a show/hide starts, like v6) and `!!modelValue` on the legacy path.

### Registration flow

```
element bound with useComponentToggle(ids).props mounts
  → the `ref` in props adds it to the composable's trigger elements
  → a post-flush watch over (elements, targets found in the reactive registry)
  → target.registerTrigger('click', el) for every element × target
      → push to the trigger registry, add the click listener, set aria-expanded
  (a target that mounts later appears in the registry and re-runs the watch: no polling)
```

### Visibility change flow

```
any source (trigger click, v-model, slot function, exposed method, useComponentToggle)
  → show()/hide() → state changes
  → watch(isExpanded) → aria-expanded updated on every registered trigger
```

### Unregistration flow

```
a bound element unmounts (the ref gets null) or the composable's scope stops
  → after the patch, elements no longer in the document leave the set
  → the watch cleanup: target.unregisterTrigger('click', el, true) → remove listener and aria-expanded
```

`unregisterTrigger(..., false)` keeps `aria-expanded`; `useComponentToggle` uses it before re-registering so a re-run never stacks a second click listener.

### `useShowHideRegistration`

```ts
useShowHideRegistration({id, isExpanded, value, show, hide, toggle, triggerToggle})
// → {registerTrigger, unregisterTrigger}
```

Registers the component in the app registry (for `useComponentToggle`), follows `id` changes, keeps `aria-expanded` of registered triggers in sync with `isExpanded()`, and removes listeners and the registry entry before unmount.

## Usage patterns

1. **`useComponentToggle(id).props`** - automatic `aria-controls`, `aria-expanded` and click handling.
2. **`useComponentToggle` + `v-model`** - programmatic control; registered triggers stay in sync whatever changed the state. Other buttons get no ARIA.
3. **Slot functions** (`toggle`, `show`, `hide`) - use the same show/hide functions; external triggers still need `useComponentToggle().props` or manual ARIA.
4. **Manual** - the author sets `aria-controls` and `:aria-expanded`.

Components with internal triggers manage ARIA in their template (BAccordionItem header button, BDropdown toggle / split button).

## Testing

- `useCssTransition.spec.ts`: frame wait, awaiting animations, cancelled/infinite animations, invalidation by a newer run / `cancel()` / scope disposal, missing element or API, no `requestAnimationFrame`.
- `useShowHide.spec.ts`: the transition table (state × request × listener behavior: none, prevents, nested `show`, nested `hide`, throws → events, final state, every promise's result), `state`, the edge-case catalog rows of `BOOTSTRAP_V6_SHOW_HIDE_STATE_MACHINE.md`, invariants over generated request sequences, `disabled`, unmount, plus event order, trigger events, prevented changes reverting `v-model`, numeric `modelValue`, `delay`, trigger registry and `aria-expanded`, `lazy`. The machine is also tested without a component.
- `collapse.spec.ts`: native mechanism (no `<Transition>`, no inline sizes, no `.collapsing`), event timing with a fake `getAnimations()` (happy-dom has no Web Animations API), rapid toggling, `noTransition`, `lazy` / `unmountLazy`.
- `toggle.spec.ts`: `aria-controls` / `aria-expanded` across target changes and unmount; no state classes.

Real transition timing (that `getAnimations()` reports the collapse transition and `shown` / `hidden` wait for it) can only be verified in a browser.

## Non-goals

- Automatic registration of all buttons (opt-in is intentional).
- `aria-expanded` on the target element itself.
- Transition timing or class logic inside `useShowHide`.
