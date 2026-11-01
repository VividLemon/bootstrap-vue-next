# ARIA Visibility and Show/Hide Architecture

## Overview

Show/hide components (BCollapse, BOffcanvas, BModal, BDropdown, BAlert, BToast, BPopover, BTooltip) share one system for visibility state, `v-model`, cancelable events and ARIA attributes on registered triggers.

With Bootstrap v6 the system is being moved to Bootstrap's **native transition** model: CSS owns all motion, JavaScript toggles a state class, waits for the element's transition to end, then fires the event. See `architecture/BOOTSTRAP_V6_MIGRATION.md`, section "Transitions (native, no Vue `<Transition>`)".

During the migration there are two paths:

| Path               | Composables                              | Components                                                                  |
| ------------------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| Native (v6)        | `useShowHide` + `useCssTransition`       | BCollapse (+ BAccordionItem, which renders it), BAlert, BToast              |
| Legacy (to delete) | `useLegacyShowHide` + Vue `<Transition>` | BModal, BOffcanvas, BDropdown (deferred); BPopover / BTooltip (later batch) |

Both paths share `useShowHideRegistration` (app registry + trigger registry + `aria-expanded`), so ARIA behavior is identical on both.

`useLegacyShowHide.ts` is marked `@deprecated` and must be deleted once the last component has moved to the native path. BCarousel, BOverlay (`useFadeTransition` in `useTransitions.ts`) and BOrchestrator use Vue `<Transition>` directly and are migrated with their own components.

## Files

- `packages/bootstrap-vue-next/src/composables/useCssTransition.ts` - waits for an element's own CSS transition
- `packages/bootstrap-vue-next/src/composables/useShowHide.ts` - native-path state/v-model/events, plus the shared `useShowHideRegistration`
- `packages/bootstrap-vue-next/src/composables/useLegacyShowHide.ts` - deprecated pre-v6 path
- `packages/bootstrap-vue-next/src/directives/BToggle/index.ts` - `v-b-toggle` (and `v-b-modal`)

## Native path

### Division of responsibilities

| Concern                                                      | Owner                                 |
| ------------------------------------------------------------ | ------------------------------------- |
| Visibility state, `v-model`, `show`/`hide`/`toggle`, events  | `useShowHide`                         |
| Mapping state to v6 classes (`.show`, `.hiding`, `-instant`) | The component                         |
| Waiting for the transition                                   | `useCssTransition`                    |
| Duration, easing, animated properties                        | CSS (`--bs-{component}-transition-*`) |
| `aria-controls` on triggers                                  | `v-b-toggle`                          |
| `aria-expanded` on registered triggers                       | `useShowHideRegistration`             |

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

### `useShowHide({modelValue, props, emit, element, id}, {transition})`

Props read: `visible`, `show`, `initialAnimation`, `lazy`, `unmountLazy`, `noCloseOnBackdrop`, `noCloseOnEsc`, `delay`.

`transition(visible)` is called right after the state flipped and must resolve `true` once the transition ended (and is current). Components pass `() => run()`. Without it, the composable resolves after `nextTick`.

Returns:

| Name                                                            | Meaning                                                                                                                                                               |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `visible`                                                       | Target state. Flips at the start of a show/hide (after the cancelable event and any `delay`). Drives the state class, `aria-expanded` and the `visible` slot prop     |
| `isActive`                                                      | `true` from the start of a show until `hidden`. Use for `v-if` of transient elements; the `active` slot prop                                                          |
| `instant`                                                       | `true` while the current change must skip the transition (initial render of an initially shown component, `visible` prop changes). Add the `-instant` class while set |
| `contentShowing`                                                | Default content should render (`lazy` / `unmountLazy`)                                                                                                                |
| `show()`                                                        | Resolves `true` after `shown`, `'show-prevented'`, or `false` when superseded                                                                                         |
| `hide(trigger?, noTriggerEmit?)`                                | Resolves `trigger ?? ''` after `hidden`, `'hide-prevented'`, or `false` when superseded                                                                               |
| `toggle()`                                                      | Emits `toggle` (cancelable), then hides (trigger `'toggle-function'`) or shows                                                                                        |
| `buildTriggerableEvent`, `registerTrigger`, `unregisterTrigger` | Helpers / registry                                                                                                                                                    |

Event order:

```
show():  'show' (cancelable → 'show-prevented') → visible = true, isActive = true, update:modelValue
         → transition(true) → 'shown'
hide():  [trigger] + 'hide' (cancelable → 'hide-prevented') → visible = false, update:modelValue
         → transition(false) → isActive = false, 'hidden' {trigger}
```

- A newer show/hide supersedes a pending one. The older one never emits `shown` / `hidden`; its promise resolves `false`. Repeating the same direction while pending returns the pending promise.
- A prevented show/hide that was requested through `v-model` reverts `modelValue`.
- Numeric `modelValue` (countdown) is set to `0` on hide; changes between truthy numbers do nothing.
- Initially shown (`modelValue` without `initialAnimation`, or `visible`): rendered shown with `instant = true`; on mount it emits `show` (cancelable) and, one frame later, `shown`.
- `initialAnimation` with `modelValue`, or the `show` prop: rendered hidden, then shown with a transition on mount.
- `lazy`: content mounts when a show starts (so it is laid out for the transition). With `unmountLazy` it unmounts after `hidden`.
- Unmounting resolves a pending change with `false` and emits nothing more.

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

### BCollapse

- The element always has `.collapse`; only `.show` is toggled. `navbar-collapse` / `collapse-horizontal` follow `isNav` / `horizontal`.
- v6 CSS animates `block-size` (or `inline-size` for `.collapse-horizontal`) with `interpolate-size: allow-keywords`, `@starting-style` and a discrete `display` transition. No `.collapsing`, no JS height measuring, no inline sizes, no `<Transition>`.
- Bootstrap v6 has **no `collapse-instant` class**. `noTransition` (and `instant`) add the `transition-none` utility, which v6's own collapse JS also treats as "no transition".
- Workaround: in 6.0.0-alpha.1 `.fade` / `.collapse` (from `_transitions.scss`) are emitted **outside any cascade layer**, so they beat the layered `transition-none` utility. While instant, BCollapse therefore also sets `--bs-transition-collapse-duration: 0s` inline. Remove that once upstream layers the transition rules.

## Trigger registration and ARIA (both paths)

Registration is **opt-in**: `v-b-toggle` / `v-b-modal` register their element with the target through the app-wide show/hide registry (`showHideRegistryKey`). Unregistered triggers must manage their own ARIA attributes.

| Attribute       | Owner                     | Lifecycle                                                                                                |
| --------------- | ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `aria-controls` | `v-b-toggle`              | Static: set from the binding (modifiers, arg, value, `href`), removed on unmount                         |
| `aria-expanded` | `useShowHideRegistration` | Dynamic: set on registration, updated on every visibility change, removed on unregister (`clean = true`) |

There are **no trigger state classes**. The v5 `collapsed` / `not-collapsed` classes were removed; style triggers with `[aria-expanded="true"]` / `[aria-expanded="false"]`. (BAccordionItem's own header button still renders the v5 accordion `collapsed` class until the accordion markup is migrated; that is accordion markup, not the trigger system.)

`aria-expanded` follows `visible` on the native path (changes when a show/hide starts, like v6) and `!!modelValue` on the legacy path.

### Registration flow

```
v-b-toggle mounted/updated
  → parse targets, set aria-controls, store targets in data-bvtoggle
  → find target in the registry (retries 5 × 100 ms)
  → target.registerTrigger('click', el)
      → push to the trigger registry, add the click listener, set aria-expanded
```

### Visibility change flow

```
any source (trigger click, v-model, slot function, exposed method, useToggle)
  → show()/hide() → state changes
  → watch(isExpanded) → aria-expanded updated on every registered trigger
```

### Unregistration flow

```
v-b-toggle unmounted
  → target.unregisterTrigger('click', el, true) → remove listener and aria-expanded
  → directive removes aria-controls and data-bvtoggle
```

`unregisterTrigger(..., false)` keeps `aria-expanded`; the directive uses it when targets change before re-registering.

### `useShowHideRegistration`

```ts
useShowHideRegistration({id, isExpanded, value, show, hide, toggle, triggerToggle})
// → {registerTrigger, unregisterTrigger}
```

Registers the component in the app registry (`useToggle`, directives), follows `id` changes, keeps `aria-expanded` of registered triggers in sync with `isExpanded()`, and removes listeners and the registry entry before unmount.

## Usage patterns

1. **`v-b-toggle`** - automatic `aria-controls`, `aria-expanded` and click handling.
2. **`v-b-toggle` + `v-model`** - programmatic control; registered triggers stay in sync whatever changed the state. Other buttons get no ARIA.
3. **Slot functions** (`toggle`, `show`, `hide`) - use the same show/hide functions; external triggers still need `v-b-toggle` or manual ARIA.
4. **Manual** - the author sets `aria-controls` and `:aria-expanded`.

Components with internal triggers manage ARIA in their template (BAccordionItem header button, BDropdown toggle / split button).

## Testing

- `useCssTransition.spec.ts`: frame wait, awaiting animations, cancelled/infinite animations, invalidation by a newer run / `cancel()` / scope disposal, missing element or API, no `requestAnimationFrame`.
- `useShowHide.spec.ts`: event order, superseded changes, trigger events, `noCloseOnEsc` / `noCloseOnBackdrop`, prevented changes reverting `v-model`, numeric `modelValue`, `delay`, trigger registry and `aria-expanded`, unmount, `lazy`.
- `collapse.spec.ts`: native mechanism (no `<Transition>`, no inline sizes, no `.collapsing`), event timing with a fake `getAnimations()` (happy-dom has no Web Animations API), rapid toggling, `noTransition`, `lazy` / `unmountLazy`.
- `toggle.spec.ts`: `aria-controls` / `aria-expanded` across target changes and unmount; no state classes.

Real transition timing (that `getAnimations()` reports the collapse transition and `shown` / `hidden` wait for it) can only be verified in a browser.

## Non-goals

- Automatic registration of all buttons (opt-in is intentional).
- `aria-expanded` on the target element itself.
- Transition timing or class logic inside `useShowHide`.
