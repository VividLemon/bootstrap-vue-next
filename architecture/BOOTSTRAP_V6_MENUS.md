# Bootstrap v6 Menus (G2): Menu, Combobox, Nav overflow

## Summary

- **Menu** (`menu.ts`) replaces v5 Dropdown. It is a generic floating panel (`.menu`, `.menu-item`, `.menu-header`, `.menu-text`, `hr.menu-divider`, `.submenu`) positioned with Floating UI. It does **not** use the Popover API or the top layer, and it adds **no ARIA menu roles** and **no typeahead**. `BDropdown` and its eight subcomponents are redesigned to it. Most of the current props go: `noCaret`, `noFlip`, `noShift`, `noSize`, `boundaryPadding`, `role`, `isNav`, `icon`, `*Class`. Two things are new: submenus and the v6 keyboard model.
- **Combobox** (`combobox.ts`) is a **select-only** combobox: a `button.form-control.combobox-toggle` opening a Menu of `[data-bs-value]` items, with optional search, `multiple`, `name` and `placeholder`. It has no free-text entry and no async options. `BAutocomplete` (reka-ui, free-text input) is removed and replaced (rule 2).
- **Nav overflow** (`nav-overflow.ts`) is the Priority+ pattern. A `.nav-overflow` wrapper (a container query container) measures the nav with a `ResizeObserver` and moves items that don't fit into a "More" Menu. Bootstrap clones and moves DOM nodes, which can't be ported to Vue as-is. The proposal is an `overflow` feature on `BNav` built on item registration.
- **Port, don't wrap.** Every behavior is reimplemented in Vue on `useShowHide` + `useCssTransition` (#164) and the existing `@floating-ui/vue` dependency. Bootstrap's JS classes mutate DOM that Vue owns (they move menus, clone items and toggle classes), so wrapping them is not viable.
- **reka-ui:** once `BAutocomplete` goes, reka-ui is still used by `BFormOtp` and the six date/time components (G4) and their types in `ComponentProps.ts` / `ComponentEmits.ts` / `ComponentSlots.ts`. Nothing else in `packages/`, `apps/` or `packages/nuxt` imports it, so it can be dropped once G4 lands.

## Sources read

- `AGENTS.md`, `architecture/BOOTSTRAP_V6_NEW_COMPONENTS.md`, `architecture/BOOTSTRAP_V6_MIGRATION.md` (cross-cutting decisions; Deferred components → "BDropdown / BNavItemDropdown → Menu"), `architecture/ARIA_VISIBILITY.md`.
- Bootstrap 6.0.0-alpha.1 in `packages/bootstrap-vue-next/node_modules/bootstrap/`: `js/src/menu.ts`, `combobox.ts`, `nav-overflow.ts`, `util/floating-ui.ts`, `util/index.ts` (`getNextActiveElement`), `dialog-base.ts`; `scss/_menu.scss`, `_nav-overflow.scss`, `forms/_combobox.scss`, `forms/_input-group.scss`, `buttons/_button-group.scss`, `_nav.scss`, `_navbar.scss`; `dist/css/bootstrap.css` (every class and token below was checked there); `package.json` (peer deps).
- Docs: https://getbootstrap.com/docs/6.0/components/menu/, /forms/combobox/, /components/nav-overflow/.
- Library: `src/components/BDropdown/*` (8 components + 8 specs), `BNav/BNavItemDropdown.vue`, `BAutocomplete/*`, `src/types/ComponentProps.ts` / `ComponentEmits.ts` / `ComponentSlots.ts`, `src/utils/floatingUi.ts`, `utils/keys.ts`, `utils/filterEvent.ts`, `composables/useScrollspy/index.ts`, `composables/useShowHide.ts`, `utils/responsive.ts`, `styles/styles.scss`, `types/BootstrapVueOptions.ts`, `package.json`.
- PR #168 (`bootstrap-v6-navigation`): `BNav.vue`, `BTabs.vue` and the PR description.
- Docs app: `apps/docs/src/data/components/{dropdown,nav,autocomplete}.data.ts`, `src/utils/dropdownCommon.ts`, `docs/components/{dropdown,autocomplete,nav}.md`, 27 `Dropdown*` demos and 4 `Autocomplete*` demos, plus the other users listed under "Docs and playground".

## Menu

### v6 overview

Markup: the toggle and the `.menu` are siblings. The JS finds the menu next to or before the toggle, or inside the closest ancestor that contains one. That ancestor is the "wrapper": it gets `.show` and is the `reference: 'parent'` anchor.

```html
<button class="btn-solid theme-primary" type="button" data-bs-toggle="menu" aria-expanded="false">
  Toggle
</button>
<div class="menu">
  <h6 class="menu-header">Header</h6>
  <button class="menu-item" type="button">Action</button>
  <a class="menu-item active" href="#" aria-current="true">Active link</a>
  <a class="menu-item disabled" aria-disabled="true">Disabled</a>
  <span class="menu-text">Text</span>
  <hr class="menu-divider" />
  <div class="submenu">
    <button class="menu-item" type="button">More</button>
    <div class="menu">…</div>
  </div>
</div>
```

| Area        | v6 behavior (verified)                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Classes     | `.menu`, `.menu-item` (`.active`, `.selected`, `.disabled`, `theme-*`), `.menu-item-icon`, `.menu-item-content`, `.menu-item-description`, `.menu-item-check` (visible on `.selected`), `.menu-header`, `.menu-text`, `.menu-divider`, `.submenu`, `.menu-translucent`, `.menu-scrollable`, `.menu-toggle-split`. There is **no** `.dropdown*`, caret class, `.dropup` / `.dropend`, `.menu-instant` or `.menu-end`                          |
| Show state  | `.show` on the menu, on the toggle and on the wrapper. `aria-expanded` on the toggle                                                                                                                                                                                                                                                                                                                                                         |
| Transition  | `.menu` is `display: none; opacity: 0; transform: scale(.95)`. `.menu.show` is `display: flex`. `@starting-style` plus a discrete `display` transition, `--menu-transition-{property,duration,timing}`. `transform-origin` follows `[data-bs-placement]`, which the JS writes on the menu. Everything is in `@layer components`, so the `transition-none` utility wins. The JS waits on the computed duration, then fires `shown` / `hidden` |
| Positioning | `@floating-ui/dom` `computePosition` + `autoUpdate`. Middleware: `offset` (`[skidding, distance]`, default `[0, 2]`), `flip` with a fixed fallback map and `fallbackStrategy: 'initialPlacement'`, `shift({boundary})`. **No `size` middleware.** Writes `position`, `left`, `top`, `margin: 0` inline (no `transform`, which CSS uses for the animation). `display: 'static'` skips positioning                                             |
| Placement   | Physical (`top`, `bottom-end`, …) and logical (`start`, `end`, `end-start`, …; resolved for RTL). Responsive strings such as `"bottom-start md:bottom-end"` use `matchMedia` listeners on the v6 breakpoints                                                                                                                                                                                                                                 |
| Layering    | `z-index: var(--menu-zindex)` = `--z-menu` (1000). `container` (`false` / `true` / element) appends the menu elsewhere while shown and restores it after `hidden`. **No Popover API, no top layer**                                                                                                                                                                                                                                          |
| Auto-close  | `autoClose: true \| false \| 'inside' \| 'outside'` through a document click/keyup handler. Clicks on form controls, or anywhere inside a `<form>` in the menu, never close it. A keyup `Tab` inside the menu doesn't close it; a Tab elsewhere does. Esc always closes, even with `autoClose: false`                                                                                                                                        |
| Submenus    | `.submenu > .menu-item + .menu`. Positioned `end-start` (fallbacks `start-start`, `end-end`, `start-end`), `offset({mainAxis: 0, crossAxis: -4})`, `shift({padding: 8})`. Open on hover, click or both (`submenuTrigger`, default `'both'`). Close after `submenuDelay` (100 ms), with a "safe triangle" hover intent. Siblings close each other. Triggers get `aria-haspopup="true"` and `aria-expanded` from init                          |
| Keyboard    | ↑/↓ open the menu and move focus (no wrap, except that entering from outside the list goes to the first or last item). Home/End. →/← enter or exit a submenu (mirrored in RTL). Enter/Space on a submenu trigger opens it and focuses its first item. Esc closes the innermost submenu first, then the menu, and refocuses the toggle. Tab closes. Arrow keys are ignored in inputs and contenteditable                                      |
| ARIA        | The docs say Bootstrap does **not** add `role="menu"` / `menuitem` ("menus are designed to be generic"). It sets `aria-expanded` on the toggle and `aria-haspopup` / `aria-expanded` on submenu triggers. Use `aria-current` on active items                                                                                                                                                                                                 |
| Focus       | `show()` focuses the toggle (`focusVisible: false`). No focus trap. On touch devices it adds no-op `mouseover` listeners to `body` children (an iOS click-delegation workaround), except inside `.navbar-nav`                                                                                                                                                                                                                                |
| Events      | `show` (cancelable), `shown`, `hide` (cancelable), `hidden` (with `clickEvent` when a click closed it). Methods `show` / `hide` / `toggle` / `update` / `dispose`                                                                                                                                                                                                                                                                            |
| Groups      | Split: `.btn-group` > button + `button.menu-toggle-split` (chevron SVG + `.visually-hidden` text) + `.menu`. `.btn-group` and `.input-group` CSS expect the `.menu` as a **direct sibling** (`:has(+ .menu)`, `.menu-toggle-split`, `.input-group > .menu`). `.nav-tabs .menu` and `.nav-tabs .nav-item.show .nav-link` style nav menus                                                                                                      |

### Current library

- `BDropdown` renders a `ConditionalWrapper` with v5 classes (`btn-group`, `drop{up,down,start,end}`, `position-static`), a `BButton` toggle (`dropdown-toggle`, `dropdown-toggle-no-caret`), an optional split toggle (`dropdown-toggle-split dropdown-toggle`), and a `<ul class="dropdown-menu overflow-auto b-floating-size fade">` with `role="menu"`, inside `ConditionalTeleport` and a Vue `<Transition>`.
- Still on `useLegacyShowHide`. `@floating-ui/vue` `useFloating` with offset/flip/shift/**size** (writes `--bv-floating-max-*`) and `floatingStyles`, whose default is a **`transform`** position. That conflicts with v6's `transform: scale()` animation, so the port must pass `transform: false` (or set `left` / `top` itself).
- Keyboard: ↑/↓ only, polling with `setInterval` until visible. Esc through `onKeyStroke`. No Home/End, no submenus.
- Subcomponents wrap every item in `<li role="presentation">` and set `role="menuitem"`. `BDropdownItemButton` wrongly sets `role="menu"`. Class props: `linkClass`, `buttonClass`, `activeClass`, `dividerClass`, `headerClass`, `textClass`, `formClass`.
- Other code that knows the v5 classes: `utils/filterEvent.ts` (`.dropdown-menu`, used by `BTableLite` row clicks), `composables/useScrollspy` (`.dropdown`, `.dropdown-toggle`), `BAutocomplete` and `BDatePicker` / `BDateRangePicker` (`dropdown-menu`, `dropdown-item`), `styles.scss` (`.dropdown-toggle-no-caret` and the `.input-group > .form-floating` `:not(.dropdown-*)` rules; the latter are already removed by #165).

### Disposition: `BDropdown` props

"Replace" = replaced by the named v6 equivalent; "keep" = small additive on top of v6 behavior (rule 1); "remove" = gone with no replacement.

| Prop                                                       | Disposition      | Notes                                                                                                                                                                        |
| ---------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` (v-model)                                     | keep             | Visibility. `useShowHide`                                                                                                                                                    |
| `id`                                                       | keep             | Toggle id; the menu gets `${id}-menu`                                                                                                                                        |
| `text`                                                     | keep             | Toggle text (with a `toggle` slot)                                                                                                                                           |
| `disabled`                                                 | keep             | v6 skips disabled toggles                                                                                                                                                    |
| `placement`                                                | replace          | v6 placements, including logical `start` / `end` sides, plus the responsive object (see API). Default `'bottom-start'` (unchanged)                                           |
| `offset`                                                   | replace          | v6 `[skidding, distance]` tuple or a function `({placement, reference, floating}) => [x, y]`; default `[0, 2]` (was `0`). Drop string / number / axis-object forms           |
| `boundary`                                                 | replace          | v6 default `'clippingParents'` (maps to Floating UI `clippingAncestors`) or an element. Used for `shift` only, as v6. `RootBoundary` values go                               |
| `boundaryPadding`                                          | remove           | v6 has none; use `floatingConfig`                                                                                                                                            |
| `strategy`                                                 | keep             | `'absolute' \| 'fixed'` (v6 option)                                                                                                                                          |
| `floatingMiddleware`                                       | replace          | `floatingConfig`: an object, or a function that refines the default config (v6)                                                                                              |
| `noFlip`, `noShift`, `noSize`                              | remove           | v6 always flips and shifts and never sizes. Use `floatingConfig`, `scrollable` or `--bs-menu-max-height`                                                                     |
| `autoClose`                                                | keep             | Same values as v6, plus v6's form exemption and Tab handling                                                                                                                 |
| `teleportTo`, `teleportDisabled`                           | replace          | v6 `container`. Keep the library name `teleportTo` (`string \| HTMLElement`). Default: no teleport. Drop `teleportDisabled` (an unset `teleportTo` means "in place"). See Q6 |
| `lazy`, `unmountLazy`                                      | keep             | Library additive from `ShowHideProps`; `useShowHide` handles it                                                                                                              |
| `show`, `visible`, `initialAnimation`                      | keep             | `ShowHideProps`, unchanged semantics                                                                                                                                         |
| `noTransition`                                             | keep             | Adds the **`transition-none`** utility to `.menu` (no `menu-instant` in v6). Layered, so it wins; no inline workaround needed, unlike `BCollapse`                            |
| `noCaret`                                                  | remove           | v6 toggles have no caret. Remove the `.dropdown-toggle-no-caret` rules from `styles.scss` (Q4)                                                                               |
| `split`                                                    | keep             | v6 split-button pattern                                                                                                                                                      |
| `splitHref`, `splitTo`, `splitButtonType`, `splitDisabled` | keep             | Behavior of the main split button                                                                                                                                            |
| `splitVariant`, `splitColor`                               | keep             | Style of the main split button (`splitColor` landed in part one)                                                                                                             |
| `splitClass`                                               | replace          | `splitAttrs`                                                                                                                                                                 |
| `toggleClass`                                              | replace          | merged into `toggleAttrs` (already exists)                                                                                                                                   |
| `menuClass`                                                | replace          | `menuAttrs`                                                                                                                                                                  |
| `wrapperClass`                                             | replace          | `wrapperAttrs` (Q3 decides whether a wrapper exists by default)                                                                                                              |
| `noWrapper`                                                | replace          | Settled by Q3                                                                                                                                                                |
| `toggleText`                                               | keep             | Visually hidden label of the split toggle. Default `'Toggle menu'` (v6 wording)                                                                                              |
| `ariaLabel`                                                | remove           | Use `toggleAttrs: {'aria-label': …}`                                                                                                                                         |
| `variant`, `theme`, `bg`, `fg`, `size`                     | keep             | Toggle `BButton` style (`btn-solid theme-secondary` by default, matching v6 examples)                                                                                        |
| `icon`                                                     | remove           | Link-variant `icon-link` styling is unrelated to menus; put icons in the `toggle` slot                                                                                       |
| `isNav`                                                    | remove           | Replaced by `BNavItemMenu` (below), which renders `li.nav-item` + `button.nav-link`                                                                                          |
| `role`                                                     | remove           | v6 sets no menu roles. Use `menuAttrs: {role: 'menu'}` (Q5)                                                                                                                  |
| _new_ `reference`                                          | add (v6)         | `'toggle' \| 'parent' \| HTMLElement \| VirtualElement`                                                                                                                      |
| _new_ `display`                                            | add (v6)         | `'dynamic' \| 'static'`; static skips Floating UI (menus inside navbars or drawers)                                                                                          |
| _new_ `submenuTrigger`, `submenuDelay`                     | add (v6)         | Defaults `'both'`, `100`                                                                                                                                                     |
| _new_ `translucent`, `scrollable`                          | add (v6 classes) | `.menu-translucent`, `.menu-scrollable`                                                                                                                                      |
| _new_ `splitAttrs`, `menuAttrs`, `wrapperAttrs`            | add              | Part attrs rule                                                                                                                                                              |

Slots: `button-content` → `toggle` (renamed: it is the toggle's content in both modes, including the main button in split mode; see Q1), `toggle-text` → kept as `split-toggle` (content of the split toggle; default: v6 chevron SVG plus the visually hidden `toggleText`), `default` keeps its slot props (`id`, `show`, `hide`, `toggle`, `visible`, `active`; drop `click`).

Emits: `show` / `shown` / `hide` / `hidden` / `*-prevented` / `toggle` from `useShowHide` (keep), `update:modelValue` (keep), `split-click` (keep). `hide` / `hidden` carry the trigger (`'click-outside'`, `'click-inside'`, `'esc'`, `'tab'`, `'toggle'`, `'item'`) in `BvTriggerableEvent.trigger`. That replaces v6's `clickEvent`.

Exposed: `show`, `hide`, `toggle` (keep); add `update()` (v6: recompute the position).

### Disposition: subcomponents

| Current               | v6                                          | Disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BDropdownItem`       | `a.menu-item` / `button.menu-item`          | **Merge** with `BDropdownItemButton` into one item. It renders `BLink` / `<a>` when `href` / `to` is set, otherwise `<button type="button">`. Keep: BLink props, `active` (adds `aria-current="true"`), `disabled`, `theme` (v6 `theme-*` on `.menu-item`). Remove: the `<li>` wrapper and `wrapperAttrs`, `linkClass` (attrs fall through to the item), `role="menuitem"`, `bg` / `fg` (v6 items only take `theme-*`). Add: `selected` (`.selected` + `.menu-item-check`), `description` prop/slot (`.menu-item-content` + `.menu-item-description`), an `icon` slot (`.menu-item-icon`). Emits `click`, then closes the menu (as now) |
| `BDropdownItemButton` | —                                           | **Remove** (merged)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `BDropdownHeader`     | `.menu-header`                              | Keep as a header: `tag` (default `h6`), `text`. Remove `<li>`, `wrapperAttrs`, `headerClass` and all colors (`theme` / `bg` / `fg`; v6 styles headers with `--menu-header-color`)                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `BDropdownDivider`    | `hr.menu-divider`                           | Keep: `<hr class="menu-divider">`. Remove `<li>`, `wrapperAttrs`, `dividerClass`, `tag`, `role` / `aria-orientation` (`<hr>` already has separator semantics), and the inherited `ColorExtendables` (unused today)                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `BDropdownText`       | `.menu-text`                                | Keep: `tag` (default `span`), `text`. Remove `<li>`, `wrapperAttrs`, `textClass`, colors                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `BDropdownGroup`      | — (headers + dividers)                      | **Remove.** v6 groups are a `.menu-header` followed by items. A `role="group"` wrapper breaks the `.menu` flex gap and v6's `:scope > .menu-item` navigation                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `BDropdownForm`       | `<form>` inside `.menu`                     | **Remove.** Put a `BForm` (with `validate`, #165) in the menu. Auto-close already exempts forms                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `BNavItemDropdown`    | `li.nav-item` > `button.nav-link` + `.menu` | **Redesign as `BNavItemMenu`** (Q1): the `li` is the v6 wrapper and gets `.show` (needed by `.nav-tabs .nav-item.show .nav-link`). Same props as the menu except `split*`, `variant`, `size`, the button colors and `wrapperAttrs` (the `li` takes fallthrough `class`)                                                                                                                                                                                                                                                                                                                                                                 |
| _new_                 | `.submenu`                                  | **Add `BSubmenu`**: `div.submenu` > `button.menu-item` (`text` prop / `toggle` slot) + nested `.menu` (default slot). Registers with the parent menu for hover, click and keyboard handling. No v-model in the first pass                                                                                                                                                                                                                                                                                                                                                                                                               |

### Proposed API

Component names follow Q1 (recommended: `BMenu`, `BMenuItem`, `BMenuHeader`, `BMenuText`, `BMenuDivider`, `BSubmenu`, `BNavItemMenu`).

```ts
type MenuSide = "top" | "bottom" | "left" | "right" | "start" | "end";
type MenuPlacement = MenuSide | `${MenuSide}-${"start" | "end"}`;

interface BMenuProps extends ShowHideProps, ColorExtendables {
  id?: string;
  text?: string;
  disabled?: boolean;
  placement?: MenuPlacement | Responsive<MenuPlacement>; // object-only responsive form, see Q2
  offset?:
    | readonly [number, number]
    | ((s: { placement: Placement; reference: Rect; floating: Rect }) => [number, number]);
  boundary?: "clippingParents" | HTMLElement;
  strategy?: "absolute" | "fixed";
  reference?: "toggle" | "parent" | HTMLElement | VirtualElement;
  display?: "dynamic" | "static";
  floatingConfig?:
    Partial<ComputePositionConfig> | ((d: ComputePositionConfig) => ComputePositionConfig);
  autoClose?: boolean | "inside" | "outside";
  teleportTo?: string | HTMLElement;
  submenuTrigger?: "click" | "hover" | "both";
  submenuDelay?: number;
  translucent?: boolean;
  scrollable?: boolean;
  split?: boolean;
  splitHref?: string;
  splitTo?: RouteLocationRaw;
  splitButtonType?: ButtonType;
  splitDisabled?: boolean;
  splitVariant?: ButtonVariant | null;
  splitColor?: ColorExtendables;
  toggleText?: string;
  variant?: ButtonVariant | null;
  size?: Size;
  toggleAttrs?: AttrsValue;
  splitAttrs?: AttrsValue;
  menuAttrs?: AttrsValue;
  wrapperAttrs?: AttrsValue;
}
```

`Responsive<T>` placement is the one place where `T | object` is tempting. The part-one rule ("object only, never a union") means either `placement` stays a plain string and a separate `responsivePlacement` object is added, or `placement` becomes object-only. See Q2.

### Markup

```html
<!-- default (wrapper per Q3) -->
<div class="d-inline-flex [show]">
  <!-- wrapperAttrs -->
  <button
    id="m1"
    class="btn-solid theme-secondary [show]"
    type="button"
    aria-expanded="false"
    aria-controls="m1-menu"
  >
    Text
  </button>
  <div
    id="m1-menu"
    class="menu [show] [transition-none]"
    data-bs-placement="bottom-start"
    style="position:absolute;left:…px;top:…px;margin:0"
  >
    <button class="menu-item" type="button">Action</button>
  </div>
</div>

<!-- split -->
<div class="btn-group">
  <button class="btn-solid theme-secondary" type="button">Split</button>
  <button
    class="btn-solid theme-secondary menu-toggle-split"
    type="button"
    aria-expanded="false"
    aria-controls="m2-menu"
  >
    <svg aria-hidden="true">…chevron…</svg><span class="visually-hidden">Toggle menu</span>
  </button>
  <div class="menu">…</div>
</div>
```

- Inside `BButtonGroup` (`buttonGroupKey`) and `BInputGroup` (`inputGroupKey`), no wrapper is rendered: the toggle and `.menu` must be direct children for v6's `:has(+ .menu)` and `.input-group > .menu` rules (current `inInputGroup` logic, now also for button groups).
- `aria-controls` on the toggle is new (v6 doesn't add it). It costs nothing and links the disclosure to its panel, also when the menu is teleported.

### Behavior and a11y

- **State:** `useShowHide` + `useCssTransition` on the `.menu` element, with `{transition: () => run()}`. Bind `.show` on the menu, the toggle and the wrapper from `visible`. The menu stays mounted while hidden (v6 `display: none`), unless `lazy`.
- **Floating:** `useFloating(reference, menu, {placement, middleware, strategy, transform: false, whileElementsMounted})`, or plain `computePosition` + `autoUpdate` from `@floating-ui/vue`'s re-exports. Start `autoUpdate` when a show starts and stop it after `hidden` (v6 keeps positioning during the exit fade). Write `data-bs-placement` from the final placement for `transform-origin`. Port v6's flip fallback map and `fallbackStrategy: 'initialPlacement'`. Resolve logical placements with the document `dir`.
- **Keyboard:** port `dataApiKeydownHandler` exactly (table in the v6 overview), scoped to the component's toggle and menu elements instead of document delegation. It replaces the `setInterval` polling. Items are queried as `:scope > .menu-item:not(.disabled):not(:disabled), :scope > .submenu > .menu-item…`, which only works when items are direct children: another reason to drop the `<li>` wrappers.
- **Typeahead:** not in v6, not in the library today. Not proposed.
- **Auto-close:** one document `click` / `keyup` listener per open menu (added on show, removed on hide, through `getSafeDocument()`), porting `clearMenus`: right-click ignored, form exemption, Tab handling, `autoClose` modes. This replaces `onClickOutside` plus `onClickInside`. `BMenuItem` click still calls the injected `hide('item')` unless `autoClose` is `false` / `'outside'`.
- **Focus:** focus the toggle on show (v6), focus the first or last item on ↓ / ↑, return focus to the toggle on Esc. No focus trap.
- **Roles:** follow v6: no `menu` / `menuitem` roles by default (Q5). `aria-expanded` on the toggle and `aria-haspopup` / `aria-expanded` on submenu triggers, as v6. `v-b-toggle` registration keeps working through `useShowHide`'s registry (external toggles).
- **Touch workaround:** port the no-op `mouseover` listeners on touch devices (outside `.navbar-nav`), behind `getSafeDocument()`.

### SSR

- Render the menu hidden with no inline position. Floating UI and `autoUpdate` run only on show (client). `data-bs-placement` is absent until then, which matches v6's initial DOM.
- The responsive placement uses `matchMedia` on `breakpointWidths` from `utils/responsive.ts` (#164), created on client mount and only when placement is responsive. Do not read `--bs-breakpoint-*` from CSS.
- Initially open menus (`v-model` true, `visible`): the server renders `.show`. Position is computed after hydration, so the first paint is at the CSS fallback position. This is the same as today; document it.
- Teleport: `ConditionalTeleport` is already SSR-aware (it renders in place when disabled).

### Composables

None public. Internals: a `useMenuKeyboard` and a `useMenuPosition` (Floating UI config + responsive placement) inside `src/composables/`, not exported. `useCombobox` (below) and Nav overflow reuse them.

### Implementation notes

- Floating UI: the library keeps `@floating-ui/vue` (dependency) and does not need v6's `@floating-ui/dom` peer directly; `@floating-ui/vue` re-exports `computePosition`, `autoUpdate` and the middleware from `@floating-ui/dom`. `bootstrap`'s JS is never imported, so v6's peer deps (`@floating-ui/dom`, `vanilla-calendar-pro`) don't apply to Menu. Clean up `package.json`: `@floating-ui/vue` is both a dependency and an optional peer, and `@floating-ui/core` is a direct dependency. Check whether that is still needed once `size` and `RootBoundary` go (BPopover still uses them). Tree-shaking is unchanged.
- `utils/floatingUi.ts`: `resolveBootstrapCaret` becomes unused; delete it. `BPopover` keeps its own placement handling (part one).
- `utils/filterEvent.ts`: `.dropdown-menu` → `.menu`. `useScrollspy`: `.dropdown` / `.dropdown-toggle` → the v6 menu wrapper (G6 owns Scrollspy; see Cross-group).
- `utils/keys.ts`: `dropdownInjectionKey` → `menuInjectionKey`, adding `registerSubmenu` and `autoClose`.
- `BootstrapVueOptions.ts`: rename the component entries and props map; remove `BDropdownItemButton`, `BDropdownGroup`, `BDropdownForm`.
- Remove `.dropdown-toggle-no-caret` from `styles.scss`, and `b-floating-size` from menus if it is no longer used by the popover. `BDatePicker` / `BDateRangePicker` stop using `dropdown-menu` when G4 replaces them.

## Combobox

### v6 overview

```html
<div class="form-field">
  <label for="cb" class="form-label">Country</label>
  <input type="hidden" name="country" value="us" />
  <!-- JS-inserted when name -->
  <button
    id="cb"
    class="form-control combobox-toggle [form-control-sm|lg] [show]"
    type="button"
    aria-haspopup="listbox"
    aria-expanded="false"
  >
    <span class="combobox-value [combobox-placeholder]">Pick a country…</span>
    <svg class="combobox-caret">…</svg>
  </button>
  <div class="menu">
    <!-- --menu-max-height: 300px; overflow auto -->
    <div class="combobox-search">
      <input class="form-control combobox-search-input" aria-label="Search…" />
    </div>
    <div class="menu-header">Group</div>
    <button class="menu-item [selected]" type="button" data-bs-value="us" aria-selected="true">
      United States <svg class="menu-item-check">…</svg>
    </button>
    <div class="combobox-no-results d-none">No results found</div>
  </div>
</div>
```

- Options: `multiple`, `name`, `placeholder`, `search`, `searchNormalize` (NFD diacritic strip), `placement` (default `bottom-start`), `offset` (`[0, 2]`), `boundary`. Events: `show` / `shown` / `hide` / `hidden` (cancelable `show` / `hide`), `change` with `{value, item}` (`value` is an array when `multiple`).
- Single: selecting marks the item `.selected` / `aria-selected="true"`, updates the value text, closes the menu and refocuses the toggle. Multiple: toggles the item, the menu stays open (`autoClose: 'outside'`), and the value shows `"N selected"` (hard-coded English) once more than one item is selected. The hidden input holds a comma-joined value.
- Search: on show, clear and focus the search input. Filtering is a case-insensitive `includes` on `textContent` (optionally normalized). Filtered items get `display: none`, and `.combobox-no-results` toggles `d-none`. ↓ in the search input focuses the first visible item.
- Keyboard on the toggle: ↓ / ↑ open and focus the first or last item; Enter / Space open. In the menu: ↓ / ↑ / Home / End move, Enter / Space select, Esc closes and refocuses, Tab closes.
- A11y (docs): the toggle gets `aria-haspopup="listbox"` + `aria-expanded`, items **should** have `role="option"` + `aria-selected`, and disabled items `disabled` + `aria-disabled`. The JS only sets `aria-selected`; roles are left to the author.
- **No free text, no async options, no clear button, no chips / tags, no validation styles of its own** (the toggle is a `.form-control`, so `.is-valid` / `.is-invalid` from #165 apply).

### Current library (`BAutocomplete`)

- Built on reka-ui `Combobox*`. It is a text **input** with filtering, optional toggle button, clear button, tags mode (`BFormTag`), `multiple`, custom `filterFunction`, `formatter`, `openOnFocus`, `resetSearchTerm*`, and `v-model`, `v-model:open`, `v-model:search` (the async pattern in the docs).
- Props: `ariaInvalid`, `autocomplete`, `autofocus`, `by`, `dir`, `disabled`, `disabledField`, `filterFunction`, `form`, `formatter`, `id`, `lazyFormatter`, `modelValue`, `multiple`, `name`, `noClearButton`, `noToggle`, `open`, `openOnFocus`, `options`, `placeholder`, `plaintext`, `readonly`, `required`, `resetSearchTermOnBlur`, `resetSearchTermOnSelect`, `search`, `size`, `state`, `tags`, `teleportTo`, `textField`, `valueField`. Slots: `default`, `empty`, `option`, `option-indicator`, `tags`, `toggle`, `toggle-icon`, `input`. Emits: `blur`, `change`, `clear`, `focus` (+ the `update:*` events).

### Disposition (rule 2: replace, nothing carried over)

`BAutocomplete` is **removed**, with its specs, SCSS (`_autocomplete.scss`), types (`BAutocompleteProps` / `Emits` / `Slots`, the `AcceptableValue` import), docs page, data file and demos. `BCombobox` is new. Where a `BCombobox` prop has the same name, it comes from v6 or from library-wide form conventions (`BFormSelect`), not from `BAutocomplete`.

| `BAutocomplete` prop / slot / emit                                                                                                                                                                                                   | Disposition                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `multiple`, `name`, `placeholder`, `disabled`, `id`, `size`, `state`, `options`, `textField`, `valueField`, `disabledField`, `form`, `required`                                                                                      | replaced by the `BCombobox` prop of the same name (v6 option or `BFormSelect` convention) |
| `modelValue` (`AcceptableValue`)                                                                                                                                                                                                     | replaced: `BCombobox` `v-model` (shape below)                                             |
| `search` (`v-model:search`), `filterFunction`, `open` (`v-model:open`)                                                                                                                                                               | replaced by `search: boolean` (v6). Async / custom filtering per Q8                       |
| `formatter`, `lazyFormatter`, `autocomplete`, `autofocus`, `openOnFocus`, `resetSearchTermOnBlur`, `resetSearchTermOnSelect`, `noClearButton`, `noToggle`, `tags`, `plaintext`, `readonly`, `ariaInvalid`, `by`, `dir`, `teleportTo` | removed (free-text or reka-only behavior; Q7)                                             |
| Slots `input`, `tags`, `toggle`, `toggle-icon`, `option-indicator`, `empty`, `default`, `option`                                                                                                                                     | removed; `BCombobox` has its own slots (below)                                            |
| Emits `blur`, `focus`, `clear`, `change`                                                                                                                                                                                             | removed; `BCombobox` emits `change` (v6) and the show/hide events                         |

### Proposed API (`BCombobox`)

```ts
interface BComboboxProps<Option, Value> {
  id?: string
  modelValue?: Value | null | readonly Value[]       // single: Value | null; multiple: Value[]
  options?: readonly Option[]                         // BFormSelect-style normalization (value/text/disabled + description), groups via `options` per Q9
  textField?: string; valueField?: string; disabledField?: string
  multiple?: boolean
  search?: boolean
  searchNormalize?: boolean
  searchPlaceholder?: string                           // default 'Search…' (v6 example text)
  noResultsText?: string                               // default 'No results found'
  placeholder?: string
  multipleText?: (count: number) => string             // i18n for v6's hard-coded "N selected" (small additive)
  name?: string                                        // renders <input type="hidden"> (comma-joined for multiple, as v6)
  form?: string; required?: boolean
  disabled?: boolean
  size?: Size                                          // form-control-sm / -lg
  state?: ValidationState                              // is-valid / is-invalid on the toggle (#165)
  placement?: MenuPlacement; offset?: …; boundary?: …  // forwarded to the internal menu, v6 options only
  toggleAttrs?: AttrsValue; menuAttrs?: AttrsValue; searchAttrs?: AttrsValue
}
```

- **v-model:** `Value | null` (single) or `Value[]` (multiple), typed through the same generic `options` approach as `BFormSelect` (`FORM_OPTIONS_WRAPPERS.md`). `null` means nothing is selected and shows the placeholder. Hidden input: `name` + comma-joined values (v6).
- **Slots:** `option` (`{option, selected, disabled}`; default text, description and check), `value` (`{selected: Option[]}`; replaces the value text), `caret`, `no-results`, `header` / `footer` inside the menu (optional). Groups per Q9.
- **Emits:** `update:modelValue`, `change` (`{value, option}`, mirroring v6's `change.bs.combobox`), and `show` / `shown` / `hide` / `hidden` / `*-prevented` from `useShowHide`.
- **Exposed:** `show`, `hide`, `toggle`, `focus`.

### Markup and a11y

- Root: `.form-field` is **not** rendered (that is `BFormGroup`'s job, #165). Root = toggle + menu inside a single wrapper (Q3 decides the wrapper, as for `BMenu`). Hidden input before the toggle.
- Toggle: `button.form-control.combobox-toggle` with `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, and `aria-labelledby` pointing at the label via `id` (as other inputs). Value `span.combobox-value` with `.combobox-placeholder` when empty. Caret `svg.combobox-caret` (v6 SVG inline, `aria-hidden`).
- Menu: `div.menu` with **`role="listbox"`** (+ `aria-multiselectable` when `multiple`). Items are `button.menu-item` with **`role="option"`**, `aria-selected`, `disabled` + `aria-disabled`, `.selected` and `.menu-item-check`. Applying the roles the v6 docs ask for is safe here (unlike `BMenu`, the content is fully controlled). Note the arrow-key model moves real focus onto options, as v6 does, instead of `aria-activedescendant`.
- Filtering renders only matching options (`v-for` over the filtered list) instead of `display: none`. The no-results element is `v-if`-ed (no `d-none` toggling) and announced through `role="status"` (small a11y addition).

### SSR

The server renders the toggle with the selected text or placeholder, the hidden input and the closed menu (options rendered unless `lazy`), so there is no layout shift. Search focus and Floating UI run only on the client.

### Composables

`useCombobox` / a filtering helper is **not worth a public API**: v6's filter is a one-line normalized `includes`, and the option state is the `BFormSelect` normalization that already exists (`useFormSelect`). Keep an internal `filterOptions(options, query, normalize)` util.

## Nav overflow

### v6 overview

- Markup: `div.nav-overflow[data-bs-toggle="nav-overflow"] > ul.nav.(nav-pills|nav-tabs|nav-underline|navbar-nav)`. The JS adds `.nav-overflow-initialized` and appends `li.nav-item.nav-overflow-item > button.nav-link.nav-overflow-toggle[data-bs-toggle=menu][data-bs-placement][data-bs-strategy] (span.nav-overflow-icon + span.nav-overflow-text) + div.nav-overflow-menu.menu`. Or it uses an author-written toggle.
- CSS: `.nav-overflow` is `container-type: inline-size; flex: 1 1 0; min-width: 0`. Before init it is `overflow: clip` with the nav hidden. `.nav-overflow > .nav` doesn't wrap; items don't shrink; `.nav-overflow-item` has `margin-inline-start: auto`; `[data-bs-nav-overflow="true"]` is hidden.
- Algorithm per `ResizeObserver` tick on the **wrapper** (never the nav, to avoid feedback loops): restore everything, measure each item's `offsetWidth` + the nav `column-gap`, subtract `.nav-overflow-keep` items and the toggle width, then overflow every item past the limit (1 px slack). Below `collapseBelow` (px or breakpoint name from `--bs-breakpoint-*`), everything except keep items overflows. `threshold` keeps at least N items visible. The toggle `li` gets `d-none` when nothing overflows.
- Overflowed links are **cloned** into the overflow menu as `.menu-item` (keeping `active` / `disabled`). A nav item that hosts a Menu has its **original `.menu` moved** into a `.submenu` of the overflow menu. Originals get `d-none` + `data-bs-nav-overflow="true"`.
- Options: `collapseBelow` (0), `iconPlacement` (`'start'` / `'end'`), `menuPlacement` (`'bottom-end'`), `menuStrategy` (`'absolute'`), `moreText` (`'More'`, or `false` for icon-only with `aria-label="More"`), `moreIcon` (sanitized SVG string), `threshold` (0). Events: `update`, `overflow` (`{overflowCount, visibleCount}`). Method `update()`.
- Tabs: the docs only show `.nav-tabs` styling. There is no tab-pane integration, and overflowed tab links become plain menu items without `role="tab"`.

### Current library

None. `BNav` (#168) renders `component(tag).nav` with `nav-tabs` / `nav-pills` / `nav-pills-vertical` / `nav-underline` / `nav-fill` / `nav-justified` / alignment classes and a default slot of `BNavItem` / `BNavItemDropdown` / `BNavText` / `BNavForm`. `BTabs` (#168) renders its own `ul.nav[role=tablist]` from registered `BTab` data, with `tabs-start` / `tabs-end` slots.

### Approach: reimplement, not clone

v6's DOM cloning and moving can't run on Vue-owned nodes. Proposal:

1. `BNavItem` and `BNavItemMenu` **register** with a parent `BNav` (provide/inject, like `BTab` → `BTabs`), passing their link props, `keep` flag and a render function for their content (the same `titleComponent` technique `BTabs` uses).
2. `useNavOverflow` (internal) observes the wrapper and, inside one `ResizeObserver` callback, removes `data-bs-nav-overflow` from the registered `li`s, measures them, puts the attribute back and updates `overflowCount`. The restore and re-hide happen synchronously on the DOM, as in v6, so nothing paints and the observer isn't re-triggered. Then it sets reactive state; Vue re-renders the `data-bs-nav-overflow` bindings and the menu.
3. `BNav` renders the overflow `li.nav-item.nav-overflow-item` with an internal menu toggle (`button.nav-link.nav-overflow-toggle`). Its menu renders a `BMenuItem` per overflowed `BNavItem` (link props + content render function) and a `BSubmenu` per overflowed `BNavItemMenu` (re-rendering that item's default slot). That re-render replaces v6's DOM move. Both copies exist only while the original is hidden, and the original's menu is closed first, which matches `_resetMenu`.
4. `BNavText` / `BNavForm` don't register, so they are never overflowed and count as fixed width (v6 only considers `.nav-item` with a `.nav-link`).

### Proposed API (feature on `BNav`, Q10)

| `BNav` prop                        | Type                    | Default        | v6 option                                                              |
| ---------------------------------- | ----------------------- | -------------- | ---------------------------------------------------------------------- |
| `overflow`                         | `boolean`               | `false`        | `data-bs-toggle="nav-overflow"`                                        |
| `collapseBelow`                    | `number \| Breakpoint`  | `0`            | `collapseBelow` (breakpoint resolved from `breakpointWidths`, not CSS) |
| `threshold`                        | `number`                | `0`            | `threshold`                                                            |
| `moreText`                         | `string`                | `'More'`       | `moreText` (`''` = icon only, `aria-label` falls back to `'More'`)     |
| `moreIconPlacement`                | `'start' \| 'end'`      | `'start'`      | `iconPlacement`                                                        |
| `overflowPlacement`                | `MenuPlacement`         | `'bottom-end'` | `menuPlacement`                                                        |
| `overflowStrategy`                 | `'absolute' \| 'fixed'` | `'absolute'`   | `menuStrategy`                                                         |
| `overflowAttrs`                    | `AttrsValue`            | —              | attrs on the `.nav-overflow` wrapper                                   |
| `BNavItem` / `BNavItemMenu` `keep` | `boolean`               | `false`        | `.nav-overflow-keep`                                                   |

- Slots on `BNav`: `more-icon` (replaces the sanitized `moreIcon` string and the `[data-bs-overflow-icon]` element; default v6 three-dots SVG), `more` (the whole toggle content).
- Emits on `BNav`: `overflow` (`{overflowCount, visibleCount}`). `update` is dropped: it fires on every measurement and only exists for the imperative API.
- Exposed: `update()`.
- Markup when `overflow`: `div.nav-overflow[.nav-overflow-initialized]` (wrapper; `overflowAttrs`) > `ul.nav…` (the current BNav root, so `tag` / attrs still target the nav). Without `overflow`, markup is unchanged.
- **BTabs:** not in the first pass (Q11). Overflowed tabs would need `role="tab"` items in a menu, which breaks the tablist pattern; v6 doesn't solve it either.
- **Navbar:** works with `BNavbarNav` (G3) if it renders `BNav` or shares the registration; `.navbar-nav` inside `.nav-overflow` is shown in the v6 docs.

### A11y

The toggle gets an accessible name (`moreText` or `aria-label="More"`) and `aria-expanded` via the menu. Overflowed items keep `aria-current` / `aria-disabled` (copied from the registered props). Hidden originals are `display: none`, so they are out of the accessibility tree.

### SSR

The server renders `div.nav-overflow` **without** `.nav-overflow-initialized`. v6's CSS then hides the nav (`visibility: hidden`, `overflow: clip`) until the client measures, so there is no flash or scrollbar. The first measurement runs in `onMounted`, and `ResizeObserver` is feature-checked with a fallback to a `resize` listener via `getSafeWindow()`. Trade-off: SSR shows an empty bar until hydration. That is v6 behavior; document it.

### Composables

`useNavOverflow(wrapper, items, {gap, keep, threshold, collapseBelow})` → `{overflowCount, visibleCount, update}`. It is generic Priority+ measuring (toolbars, breadcrumbs). Recommendation: **internal first** (Q12).

## Cross-group dependencies

| Item                          | Direction | Note                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G3 Navbar                     | G2 → G3   | Navbar uses `BNavItemMenu`, `display: 'static'` for menus inside an expanded `[class*="drawer"]`, and `BNav overflow`. The naming (Q1) and wrapper (Q3) answers apply to the navbar menus                                                                                                                                                                                                                                                         |
| G1 Overlays (Dialog / Drawer) | G1 ↔ G2   | Native `<dialog>` is in the top layer. A menu teleported to `body` from inside a dialog or drawer renders **behind** it. Default must stay in place (v6 `container: false`); docs must warn. v6 `dialog-base._hideChildComponents` hides tooltips and popovers but not menus: closing a dialog should close open `BMenu`s inside it (`useShowHide` unmount handles it if the dialog content unmounts; otherwise G1 should call into the registry) |
| G4 Form inputs                | G2 ↔ G4   | `BCombobox` sits in Field (`.form-field`, `BFormGroup` label `for`). Datepicker in v6 positions with `--z-menu` and Floating UI: it could reuse `useMenuPosition`. Dropping reka-ui needs G4's OTP and Datepicker replacements too                                                                                                                                                                                                                |
| G6 Scrollspy                  | G2 → G6   | `useScrollspy` marks `.dropdown-toggle` active inside `.dropdown`; it must look for the menu wrapper's toggle (`[aria-controls]` of a `.menu`) instead                                                                                                                                                                                                                                                                                            |
| `BTableLite` (`filterEvent`)  | G2        | `.dropdown-menu` → `.menu`                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `BPopover` (part one)         | G2        | Keeps its own Floating UI config; the shared parts are only the `floatingConfig` naming. Consider aligning `BPopover.floatingMiddleware` → `floatingConfig` in a later pass for consistency (not required by rule 1)                                                                                                                                                                                                                              |

## Docs and playground (must change)

- Data: `dropdown.data.ts` → `menu.data.ts` (Q1), `nav.data.ts` (`BNavItemDropdown` → `BNavItemMenu`, BNav overflow props, `keep`), `autocomplete.data.ts` → `combobox.data.ts`, `apps/docs/src/utils/dropdownCommon.ts`, `ShowHideProps.vue`.
- Pages: `dropdown.md` (rewrite: v6 sections Items, Icons, Descriptions, Selected, Headers, Dividers, Text, Forms, Submenus, Placement, Responsive placement, Split, Auto close, Translucent, Scrollable, Accessibility, Keyboard), `autocomplete.md` → `combobox.md`, `nav.md` (Overflow section), plus the mentions in `button-group.md`, `button-toolbar.md`, `navbar.md`, `form-tags.md`, `reference/accessibility.md`, `reference/color-variants.md`, `reference/router-links.md`, `mcp.md`.
- Demos: 27 `Dropdown*.vue`, 4 `Autocomplete*.vue`, and `NavDropdown`, `NavbarOverview`, `NavbarScroll`, `NavbarItemDropdown`, `NavbarOffcanvas`, `ButtonGroupDropdown`, `ButtonToolbarExample3/Justify/Sizing`, `InputGroupDropdown`, `InputGroupSlots`, `FormTagsDropdown`.
- The docs site's own UI uses the components: `.vitepress/theme/Layout.vue`, `src/components/MarkdownActionsDropdown.vue`.
- Playground: `TDropdown.vue`, `TNav.vue`, `TNavbar.vue`, `TScrollspy.vue`.
- Migration notes (`migration-data/components/bdropdown.md`, `bnav.md`, autocomplete): written by the implementation phase per the plan's rules.

## Questions for the maintainer

**Q1 (High) — Rename the Dropdown family to Menu?**
Context: v6 renames Dropdown to Menu; every class changes, two subcomponents merge, two are removed and submenus are new. Rule 4 allows breaking renames, with no aliases.

- A. Rename: `BMenu`, `BMenuItem`, `BMenuHeader`, `BMenuText`, `BMenuDivider`, `BSubmenu`, `BNavItemMenu`; delete the `BDropdown*` names. Pros: matches v6 docs, classes and the plan's naming ("Dialog", "Drawer"); the scale of the change is obvious to users. Cons: every consumer edits imports and tags; the docs URL changes.
- B. Keep the `BDropdown*` names on the new markup. Pros: smaller diff for users. Cons: names no longer match v6 classes or docs, and the "dropdown" term disappears from Bootstrap.
- Recommendation: **A**, consistent with the Dialog and Drawer groups (check G1's naming answer so both go the same way).

**Q2 (Medium) — Responsive placement shape.**
Context: v6 accepts `"bottom-start md:bottom-end"`. Part one's rule is object-only responsive props, never a `T | object` union.

- A. `placement: Responsive<MenuPlacement>` object-only (`{xs: 'bottom-start', md: 'bottom-end'}`). Pros: one prop, follows the rule. Cons: the common case needs `{xs: 'top'}` instead of `'top'`.
- B. `placement: MenuPlacement` (string) + `responsivePlacement?: Responsive<MenuPlacement>` (overrides per breakpoint). Pros: simple common case, follows the rule. Cons: two props for one concept.
- C. Skip responsive placement. Pros: least code (no `matchMedia`). Cons: drops a v6 feature.
- Recommendation: **B**.

**Q3 (Medium) — Root element of `BMenu` (and `BCombobox`).**
Context: v6 needs no wrapper (Floating UI positions the menu); a wrapper is only the `.show` / `reference: 'parent'` anchor. `.btn-group` / `.input-group` need the toggle and `.menu` as direct children. Today a wrapper with v5 classes is always rendered (skipped only in input groups or with `noWrapper`).

- A. Always render a wrapper (`div`, no Bootstrap class, `display: inline-flex` via a small library class or `d-inline-flex`), skipped inside `BButtonGroup` / `BInputGroup`; split mode renders `.btn-group`. `wrapperAttrs` for it; fallthrough attrs go to the wrapper. Pros: single root, stable `$el`, matches today's layout. Cons: an extra element that v6 doesn't have.
- B. Fragment root (toggle + menu), fallthrough attrs on the toggle. Pros: exactly v6 markup everywhere. Cons: multi-root components lose automatic attr inheritance and `$el`, and need `inheritAttrs: false` plumbing; layout differences for users who styled the wrapper.
- Recommendation: **A**, with `noWrapper` removed (groups are detected by injection).

**Q4 (Low) — Caret on the toggle.**
Context: v6 menu toggles have no caret; split toggles show a chevron SVG. Today a v5 `::after` caret is shown unless `noCaret`.

- A. No caret (v6); remove `noCaret` and the `.dropdown-toggle-no-caret` CSS; users add an icon in the `toggle` slot. Pros: v6 parity, less CSS. Cons: a visible change for every dropdown.
- B. Keep a `caret` boolean that renders a chevron SVG after the text. Pros: a common need. Cons: a library-only additive with styling to maintain.
- Recommendation: **A**.

**Q5 (Medium) — ARIA roles on `BMenu`.**
Context: the library sets `role="menu"` / `menuitem` today (with a `role` prop, and a `role="menu"` bug on `BDropdownItemButton`). v6 deliberately adds no menu roles because its menus hold arbitrary content (forms, text); a wrong `role="menu"` hurts screen-reader users more than none.

- A. Follow v6: no roles by default; `aria-expanded` + `aria-controls` (disclosure pattern); users opt in via `menuAttrs: {role: 'menu'}` plus their own item roles. Pros: correct for mixed content; matches v6. Cons: action menus lose `menu` semantics unless authors add them.
- B. Keep `role="menu"` / `menuitem` by default with a `role` prop. Pros: continuity. Cons: invalid for forms and text content; needs roving tabindex and typeahead to be a correct ARIA menu.
- Recommendation: **A**.

**Q6 (Medium) — Teleport default.**
Context: v6 keeps the menu in place by default (`container: false`); menus inside native `<dialog>` (Dialog, Drawer, Navbar drawer) only work in place, because the top layer covers body-level elements. `teleportTo` exists today, default off.

- A. Keep `teleportTo` opt-in (default in place), and document the dialog caveat. Pros: v6 parity; dialogs work. Cons: `overflow: hidden` ancestors clip menus unless `strategy: 'fixed'` or `teleportTo` is used.
- B. Use the Popover API (`popover="manual"`) to put menus in the top layer. Pros: escapes clipping and dialogs. Cons: not v6; `@starting-style` / `display` CSS and `:popover-open` interplay are untested with v6 menu CSS; browser support caveats.
- Recommendation: **A**.

**Q7 (High) — Free-text autocomplete after `BAutocomplete` is removed.**
Context: v6 Combobox is select-only (button + optional search). `BAutocomplete` users with free text, creatable values or tags have no v6 equivalent. Rule 2 forbids carrying `BAutocomplete`'s API over.

- A. Ship `BCombobox` exactly as v6 (select-only + search); point free-text users to `BFormInput` + `BFormDatalist` (native `<datalist>`) and tag users to Chips (G4). Pros: rule 2 as written, small surface. Cons: loses rich typeahead UI.
- B. Add an `input` mode to `BCombobox` (text input as the toggle, free text allowed). Pros: covers the old use case. Cons: it is not v6 and re-creates `BAutocomplete` under a new name.
- Recommendation: **A**.

**Q8 (Medium) — Custom filtering and async options in `BCombobox`.**
Context: v6 filters items in the DOM with a fixed `includes`. Vue renders from `options`, so async loading is just reactive `options`, but users need the query to trigger it.

- A. Add `v-model:search` (the search text) and `filter?: false | ((option, query) => boolean)` (`false` = don't filter, for server-side search). Pros: two small additives cover async and custom matching. Cons: beyond v6.
- B. v6 only (`search`, `searchNormalize`). Pros: minimal. Cons: no async pattern; users must pre-filter `options` without knowing the query.
- Recommendation: **A** (small additive per rule 1; not a carry-over, because the names and semantics differ from `filterFunction` / `search`).

**Q9 (Low) — Option groups in `BCombobox`.**
Context: v6 shows groups as `.menu-header` + dividers. `BFormSelect` supports `{label, options}` groups.

- A. Accept `BFormSelect`-style groups in `options` and render `.menu-header` for each. Pros: consistent with `BFormSelect`. Cons: a little extra normalization.
- B. Flat options only; headers through a slot. Pros: simpler. Cons: inconsistent with selects.
- Recommendation: **A**.

**Q10 (High) — Nav overflow: `BNav` feature or a separate component?**

- A. `overflow` prop on `BNav` (+ `keep` on `BNavItem` / `BNavItemMenu`), using item registration. Pros: one nav API, works with existing children, the wrapper only appears when needed. Cons: `BNav` grows from a stateless class component into a registering one (needs provide/inject and measuring).
- B. `BNavOverflow` wrapper component around a `BNav`. Pros: mirrors v6 markup (`.nav-overflow` wrapper); `BNav` stays simple. Cons: still needs the same registration through two components; the wrapper must reach into the child nav.
- C. Data-driven `BNavOverflow :items="[…]"`. Pros: simplest to implement (no slot re-rendering). Cons: a different authoring model from every other nav; no arbitrary content.
- Recommendation: **A**.

**Q11 (Low) — Nav overflow in `BTabs`.**

- A. Not in the first pass; revisit after `BNav` overflow lands. Pros: avoids an unsolved tab-in-menu a11y pattern (v6 doesn't solve it either). Cons: long tab strips still wrap.
- B. Support it now (overflowed tabs become menu items that activate the tab). Pros: feature parity for tabs. Cons: `role="tab"` outside a `tablist`; keyboard model conflicts.
- Recommendation: **A**.

**Q12 (Low) — Public `useNavOverflow`?**

- A. Internal for now; export later if Navbar (G3) or users need it. Pros: no API to freeze yet. Cons: users can't build Priority+ toolbars.
- B. Public composable now. Pros: reusable. Cons: the API (registration and measuring contract) is still forming.
- Recommendation: **A**.

## Decisions

Answered by the maintainer on 2026-11-03. Where an answer differs from the proposal above, the answer wins.

- **Q1 — A. Rename to Menu:** `BMenu`, `BMenuItem`, `BMenuHeader`, `BMenuText`, `BMenuDivider`, `BSubmenu`, `BNavItemMenu`; the `BDropdown*` names are deleted with no aliases. This follows the cross-group naming rule: redesigned components take their v6 names (`BDialog`, `BDrawer`, `BFormField`, …).
- **Q6 — A. In place by default.** Menus render next to their toggle (as v6), positioned by Floating UI; `teleportTo` stays opt-in, with a docs warning that a teleported menu renders below an open native dialog. This is the shared popup mechanism for every floating popup in the new components: G4's Datepicker reuses it (vanilla-calendar-pro mounted inline inside a library-owned popup).
- **Q7 — A. `BCombobox` as v6 (select-only).** Free-text users go to `BFormInput` + `BFormDatalist`, tag input to Chips (G4).
- **Q8 — A. Small additives:** `v-model:search` and `filter?: false | fn`, so custom and async filtering work.
- **Q10 — B. Separate `BNavOverflow` wrapper component around a `BNav`** (mirrors v6's `.nav-overflow` wrapper; `BNav` itself stays simple). Item registration and measuring still work as proposed, but the wrapper owns them; rework the "Proposed API (feature on `BNav`)" section into a `BNavOverflow` API at implementation.
- **Q2 — B.** `placement: MenuPlacement` (string) plus optional `responsivePlacement?: Responsive<MenuPlacement>` that overrides per breakpoint.
- **Q3 — B. Fragment root.** `BMenu` / `BCombobox` render the toggle and the `.menu` with no wrapper (exact v6 markup, including inside `.btn-group` / `.input-group`); `inheritAttrs: false`, fallthrough attrs go to the toggle; `wrapperAttrs` and `noWrapper` are removed. Split mode: decide at implementation whether `.btn-group` is rendered by the component or left to the user, and note that there is no stable `$el`.
- **Q4 — A. No caret**, as v6; remove `noCaret` and the `.dropdown-toggle-no-caret` CSS; users add an icon in the `toggle` slot.
- **Q5 — A. Follow v6:** no menu roles by default; `aria-expanded` + `aria-controls` (disclosure pattern); users opt in through `menuAttrs: {role: 'menu'}` and their own item roles. The `role` prop is removed.
- **Q9 — A.** `BCombobox` accepts `BFormSelect`-style `{label, options}` groups and renders a `.menu-header` per group.
- **Q11 — A.** No nav overflow in `BTabs` in the first pass; revisit after `BNavOverflow` lands.
- **Q12 — A.** `useNavOverflow` stays internal for now.

## Implementation split

1. **Menu core** (`BMenu`, `BMenuItem`, `BMenuHeader`, `BMenuText`, `BMenuDivider`): native transition path on the show/hide machine (S1 in [`BOOTSTRAP_V6_SHOW_HIDE_STATE_MACHINE.md`](./BOOTSTRAP_V6_SHOW_HIDE_STATE_MACHINE.md)) with its `disabled` guard, so a disabled menu can't be opened by `show()`, `v-model` or an injected `show`, and closes when it becomes disabled (bootstrap-vue-next#3373, D8), Floating UI port (`transform: false`, `data-bs-placement`, flip map), keyboard and auto-close ports, split, groups injection, part attrs, specs; remove `BDropdown*`, the `.dropdown-toggle-no-caret` CSS and `resolveBootstrapCaret`; `filterEvent` selector; exports, `BootstrapVueOptions`, docs data, page and demos, playground, docs site UI.
2. **Submenus** (`BSubmenu`): hover intent, safe triangle, nested positioning, ←/→ keys.
3. **`BNavItemMenu`** replacing `BNavItemDropdown` (+ nav docs). Unblocks G3.
4. **`BCombobox`** + removal of `BAutocomplete` (types, SCSS, docs, demos). Separate PR because it touches forms docs.
5. **Nav overflow** on `BNav` (registration, `useNavOverflow`, overflow menu) + docs. Depends on 1–3.
6. **Dependency cleanup** after G4 lands: remove `reka-ui` (dependency + optional peer) and `@internationalized/date` if unused; recheck `@floating-ui/core`.
