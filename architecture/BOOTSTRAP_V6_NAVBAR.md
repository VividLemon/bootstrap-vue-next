# Bootstrap v6 Navbar (G3)

## Summary

- v6 Navbar has **no JavaScript of its own**. The collapsible region is a Drawer (`<dialog class="drawer">`), not a Collapse. The v5 `.navbar-collapse`, `.navbar-expand-{bp}`, `.navbar-light` / `.navbar-dark` and `.navbar-nav-scroll` classes are gone from 6.0.0-alpha.1.
- Expansion is `.navbar-expand` (always) or `.{bp}:navbar-expand`, and it is a **container query**: `.navbar` sets `container-type: inline-size`, so the navbar expands based on its own width, not the viewport. No class means "always collapsed into the drawer".
- When expanded, v6 CSS forces any `[class*=drawer]` descendant inline (static, visible, no header). So the responsive switch is pure CSS: no JS breakpoint detection, no hydration mismatch. The Drawer JS only closes an open drawer when the navbar becomes expanded (`ResizeObserver` on `.closest('.navbar')`).
- Proposal: keep the four components, redesign them to v6 markup. `toggleable` becomes `expand`; `print` is removed (dead class); add `translucent`; `BNavbarToggle` renders `btn-icon navbar-toggler`, gets `aria-controls` / `aria-expanded`; the responsive region is the G1 Drawer component placed inside the navbar. `BCollapse isNav` is removed. `noAutoClose` stays as a small additive, rewired to the drawer.
- No third-party deps. No new public composable (container-query helpers belong to G6).

## Sources read

- `AGENTS.md`, `architecture/BOOTSTRAP_V6_NEW_COMPONENTS.md`, `architecture/BOOTSTRAP_V6_MIGRATION.md` (Deferred components → BNavbar, BOffcanvas, BDropdown), `architecture/ARIA_VISIBILITY.md`.
- Library: `src/components/BNavbar/*` (4 components, 4 specs: 23 + 12 + 14 + 25 tests), `BNav/BNavItemDropdown.vue`, `BNavForm.vue`, `BNavText.vue`, `BCollapse/BCollapse.vue`, `BOffcanvas/BOffcanvas.vue`, `BLink/BLink.vue`, `BDropdown/BDropdownItem.vue`, `directives/BToggle`, `directives/BColorMode`, `composables/useContainerClasses.ts`, `useShowHide.ts`, `useThemeClasses.ts`, `utils/keys.ts` (`navbarInjectionKey`, `collapseInjectionKey`), `types/ComponentProps.ts` / `ComponentSlots.ts` / `ComponentEmits.ts`.
- PR #168 (`bootstrap-v6-navigation`): `BNavForm formClass → formAttrs`, `BNav` prop set.
- Docs: `apps/docs/src/data/components/navbar.data.ts`, `docs/components/navbar.md`, 13 `demo/Navbar*.vue`, `migration-data/components/bnavbar.md`; playground `Comps/TNavbar.vue`, `TScrollspy.vue`.
- Bootstrap 6.0.0-alpha.1: `scss/_navbar.scss`, `scss/_drawer.scss`, `scss/layout/_breakpoints.scss`, `scss/_utilities.scss`, `dist/css/bootstrap.css` (navbar ≈ lines 7724–8128, drawer 8129+, position utilities 9960+), `js/src/drawer.ts`, `dialog-base.ts`, `menu.ts` (navbar-related parts), `collapse.ts`.
- https://getbootstrap.com/docs/6.0/components/navbar/ and /docs/6.0/guides/migration/ (Navbar, Offcanvas → Drawer, prefix table).

## v6 overview

### Markup (from the v6 docs)

```html
<nav class="navbar md:navbar-expand bg-1">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Navbar</a>
    <button
      class="btn-icon navbar-toggler"
      type="button"
      data-bs-toggle="drawer"
      data-bs-target="#navbarDrawer"
      aria-controls="navbarDrawer"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon" aria-hidden="true"></span>
    </button>
    <dialog
      class="drawer drawer-end"
      tabindex="-1"
      id="navbarDrawer"
      aria-labelledby="navbarDrawerLabel"
    >
      <div class="drawer-header">
        <h5 class="drawer-title" id="navbarDrawerLabel">Menu</h5>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="drawer"
          aria-label="Close"
        ></button>
      </div>
      <div class="drawer-body">
        <ul class="navbar-nav me-auto">
          <li class="nav-item"><a class="nav-link active" aria-current="page" href="#">Home</a></li>
          <li class="nav-item">
            <button class="nav-link" type="button" data-bs-toggle="menu" aria-expanded="false">
              Menu
            </button>
            <div class="menu">…<a class="menu-item" href="#">Action</a>…</div>
          </li>
        </ul>
        <form class="hstack gap-2" role="search">…</form>
      </div>
    </dialog>
  </div>
</nav>
```

### Classes and tokens (verified in `bootstrap.css`)

| Class / token                                  | Notes                                                                                                                                                                                                                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.navbar`                                      | flex, wrap, `min-height: var(--bs-navbar-min-height)` (3.5rem), **`container-type: inline-size`**, `background-color: var(--bs-navbar-bg, var(--bs-bg-body))`. Direct `> .container`, `> .container-fluid`, `> .{bp}:container` children become flex rows. |
| `.navbar-expand`                               | Always expanded. Also sets `flex-wrap: nowrap` on `.navbar` itself.                                                                                                                                                                                        |
| `.sm:` … `.2xl:navbar-expand`                  | Inside `@container (width >= …)`. Styles only descendants (a container query cannot style the container): `> .container`, `> .container-fluid`, `.navbar-nav` (row), `.navbar-toggler` (`display: none !important`), `[class*=drawer]` (forced inline).    |
| `.navbar-brand`                                | Color `var(--bs-theme-fg, var(--bs-navbar-brand-color))`, so a `.theme-*` on the brand or navbar tints it.                                                                                                                                                 |
| `.navbar-nav`                                  | Column by default, row when expanded. Works without `.nav`. Active/`.show` links use `--bs-theme-fg`.                                                                                                                                                      |
| `.navbar-text`                                 | Unchanged role.                                                                                                                                                                                                                                            |
| `.navbar-toggler`                              | Only sets `--bs-btn-bg: transparent`, `--bs-btn-hover-bg` and a transition. It needs a button base class: the docs use **`.btn-icon`** (a base class in `.btn, .btn-link, .btn-icon, …`, square, `padding: 0`).                                            |
| `.navbar-toggler-icon`                         | CSS mask (`--bs-navbar-toggler-icon`) tinted with `currentcolor`; follows dark mode automatically.                                                                                                                                                         |
| `.navbar-translucent`                          | New: `::before` with 80% bg + `backdrop-filter`.                                                                                                                                                                                                           |
| `.navbar[data-bs-theme=dark]`                  | Dark navbar tokens. Replaces `.navbar-dark`.                                                                                                                                                                                                               |
| `.navbar [class*=drawer]:not([open], .hiding)` | `transition: none !important` — prevents the slide animation when crossing the breakpoint.                                                                                                                                                                 |
| `--bs-navbar-*` tokens                         | `padding-x/y`, `min-height`, `color`, `hover-color`, `disabled-color`, `active-color`, `brand-*`, `nav-link-padding-x`, `toggler-*`. `--bs-navbar-bg` is read but not defined (set it, or use a `bg-*` utility).                                           |
| **Absent**                                     | `.navbar-collapse`, `.navbar-expand-{bp}`, `.navbar-light`, `.navbar-dark`, `.navbar-nav-scroll`, `.d-print*` / `.print:*` (the display utility has no `print: true` in alpha.1, although the migration guide mentions `.print:d-none`).                   |
| Still present                                  | `.fixed-top`, `.fixed-bottom`, `.sticky-top`, `.sticky-bottom`, `.{bp}:sticky-top` / `-bottom` (viewport media queries).                                                                                                                                   |

### Container query vs viewport

- `md:navbar-expand` means "expand when **the navbar** is at least 768px wide". A navbar inside a 600px sidebar never expands at `md`, even on a wide screen. This is different from `md:drawer` (viewport media query) and `md:sticky-top` (viewport). The migration guide states it explicitly: navbar expansion uses container queries, drawers use viewport queries.
- Consequences:
  - Inside a navbar, use a **plain `.drawer`**, not `md:drawer`. The navbar's expand rules make it inline; a responsive drawer would switch on viewport width and disagree with the navbar.
  - `container-type: inline-size` means the navbar's width cannot come from its content. A navbar in a shrink-to-fit parent (inline-flex, a `float`, an absolutely positioned box without `inset`/`width`) collapses to zero width. `fixed-top`/`fixed-bottom` set `inset: 0 0 auto` / `auto 0 0`, so they are fine. Docs note.
  - Breakpoint width is the navbar's content box; `--bs-navbar-padding-x` defaults to `0`.
  - Since the switch is CSS-only, nothing in Vue needs to know the breakpoint. SSR renders the correct layout from the first paint.
- Upstream gap: the expanded rule targets only `> .container` / `> .container-fluid`, not `> .md:container` (the `%navbar-expand-container` placeholder is never extended). With `container="md"` the inner container keeps `flex-wrap: wrap` when expanded. Note it; no workaround.

### Drawer behavior inside a navbar (from `drawer.ts` / `dialog-base.ts`)

- `Drawer` constructor: if `element.closest('.navbar')`, observe the navbar with a `ResizeObserver`; on resize (rAF-debounced), if the drawer is `open` and its computed `position` is not `fixed` (the navbar's expanded rule made it static; top-layer coerces it to `absolute`), call `hide()`.
- A window `resize` handler does the same for every open `dialog.drawer[open]` / `dialog[open][class*="\:drawer"]`.
- Show: `showModal()` when `backdrop` or not `scroll`; adds `dialog-open` to `<html>` for scroll lock. Hide: adds `.hiding`, `close()`, waits for the transition, removes `.hiding`. The `.hiding` class is what lets the exit slide play despite the navbar's `:not([open], .hiding)` rule.
- Data API toggle: clicking a toggler while a different drawer is open hides that one first; focus returns to the toggler on `hidden`.
- There is **no auto-close on link click** in v6 (full page loads make it unnecessary there).

### Menu inside a navbar (from `menu.ts`)

- Markup: `<li class="nav-item"><button class="nav-link" data-bs-toggle="menu">…</button><div class="menu">…</div></li>`.
- Only navbar-specific JS: the iOS `mouseover` no-op hack is skipped when the parent is inside `.navbar-nav`. Positioning is Floating UI in both drawer and expanded modes (no `display: static` special case like v5 Popper).
- A menu in an open drawer lives in the dialog's top layer, so it must stay inside the dialog (`container: false`, the default). G2 must not teleport menus that are inside a `<dialog>`.

## Current library

| Component         | Renders                                                                                                                                    | Notes                                                                                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BNavbar`         | `<nav class="navbar …">` + inner container from `useContainerClasses` (fixed in #164: `container`, `container-fluid`, `{bp}:container`)    | Emits `navbar-expand` (toggleable `false`), **`navbar-expand-{bp}` (no v6 CSS)**, `d-print` (never existed in v5 or v6 CSS), `sticky-*`, `fixed-*`, theme classes. Provides `navbarInjectionKey {tag, noAutoClose}`. |
| `BNavbarBrand`    | `BLink` when linked, else `<div class="navbar-brand">`                                                                                     | All link props forwarded. Docs data wrongly says `tag` default `'ul'`.                                                                                                                                               |
| `BNavbarNav`      | `<ul class="navbar-nav">` + `nav-fill`, `nav-justified`, `justify-content-*`, `small`                                                      | Mirrors `BNav` props (kept by #168).                                                                                                                                                                                 |
| `BNavbarToggle`   | `<button class="navbar-toggler">` + `<span class="navbar-toggler-icon">`                                                                   | **No `.btn-icon`** (unstyled in v6), **no `aria-controls` / `aria-expanded`**, toggles registry entries directly. Docs claim it uses `v-b-toggle` internally; it does not.                                           |
| `BCollapse isNav` | adds `navbar-collapse` (no v6 CSS) and renders a stray `is-nav` attribute; provides `isNav` so `BLink` / `BDropdownItem` close it on click | Auto-close only works for `BCollapse`; `BOffcanvas` provides no injection, so the docs' offcanvas navbar never auto-closes.                                                                                          |
| `BOffcanvas`      | `<div class="offcanvas">`, teleported to `body`, viewport `responsive` via `useBreakpoints` (client only)                                  | Teleport breaks the v6 navbar CSS (drawer must be a descendant of `.navbar`).                                                                                                                                        |
| `vBColorMode`     | sets `data-bs-theme` in `mounted` / `updated`                                                                                              | No `getSSRProps`, so SSR output has no `data-bs-theme` → a dark navbar flashes light until hydration.                                                                                                                |

Docs (`navbar.md`) still describe v5: `<BCollapse is-nav>`, `navbar-nav-scroll`, a 4-option `auto-close` that doesn't exist on `BNavbar`, `BSidebar`, printing, "Bootstrap v5 hamburger".

## Disposition tables

### `BNavbar`

| Prop                | Disposition                               | Notes                                                                                                                                          |
| ------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `tag`               | keep                                      | `role="navigation"` when not `nav` stays.                                                                                                      |
| `container`         | keep                                      | `boolean \| 'fluid' \| Breakpoint`, default `'fluid'` (v6 docs: an inner container is still required). Already fixed in #164.                  |
| `toggleable`        | **replace with v6 equivalent** → `expand` | See Q2. `true` → `navbar-expand`, `'md'` → `md:navbar-expand`, `false` → no class (always drawer).                                             |
| `fixed`             | keep                                      | `'top' \| 'bottom'` → `fixed-top` / `fixed-bottom` (exist in v6).                                                                              |
| `sticky`            | keep                                      | `'top' \| 'bottom'` → `sticky-top` / `sticky-bottom`. Responsive `{bp}:sticky-top` reachable via `class`; no prop change.                      |
| `print`             | **remove**                                | Emits `d-print`, which never existed. v6 alpha.1 ships no print utilities; navbars are not hidden when printing.                               |
| `noAutoClose`       | keep (small additive)                     | Rewired to the drawer. See Q3.                                                                                                                 |
| `theme`, `bg`, `fg` | keep (root flat props)                    | `theme` tints brand / active link / navbar-text links via `--bs-theme-fg`; it does **not** color the background (`bg` does). Docs must say so. |
| _new_ `translucent` | add (v6 equivalent)                       | `.navbar-translucent`. Same name as `BToast` / `BCard` `translucent`.                                                                          |
| Slot `default`      | keep                                      |                                                                                                                                                |

### `BNavbarBrand`

| Prop / slot                   | Disposition | Notes                                                   |
| ----------------------------- | ----------- | ------------------------------------------------------- |
| `tag` (default `'div'`)       | keep        | Fix docs data default (`'ul'` → `'div'`).               |
| BLink props (`href`, `to`, …) | keep        | Follow `BLink`'s own v6 changes (`HoverState` objects). |
| Slot `default`                | keep        |                                                         |

### `BNavbarNav`

| Prop / slot         | Disposition           | Notes                                                                  |
| ------------------- | --------------------- | ---------------------------------------------------------------------- |
| `tag` (`'ul'`)      | keep                  |                                                                        |
| `fill`, `justified` | keep                  | v6 `.nav-fill` / `.nav-justified` apply to `.nav-item`s in any parent. |
| `align`, `small`    | keep (small additive) | Same as `BNav` after #168; utilities only.                             |
| Slot `default`      | keep                  |                                                                        |

### `BNavbarToggle`

| Prop / slot / emit              | Disposition                    | Notes                                                                                           |
| ------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| `target: string \| string[]`    | **replace** → `target: string` | See Q4. v6 toggles one drawer; opening two modal dialogs at once makes no sense.                |
| `label` (`'Toggle navigation'`) | keep                           | `aria-label`.                                                                                   |
| `disabled`                      | keep                           | Render native `disabled` only; drop the extra `.disabled` class (v6 `.btn:disabled` styles it). |
| _new_ markup                    | replace with v6 equivalent     | `class="btn-icon navbar-toggler"`, `aria-controls`, `aria-expanded`, icon `aria-hidden="true"`. |
| Emit `click`                    | keep                           |                                                                                                 |
| Slot `default({expanded})`      | keep                           | Custom icon.                                                                                    |

### Related components (changes driven by the navbar)

| Item                                                                                        | Disposition                    | Notes                                                                                                                                          |
| ------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `BCollapse isNav` (+ `BAccordionItem isNav`, exposed `isNav`, `collapseInjectionKey.isNav`) | **remove**                     | No `.navbar-collapse` CSS; a collapse inside a v6 navbar is never forced visible when expanded. Also removes the stray `is-nav` DOM attribute. |
| `BLink` / `BDropdownItem` close-on-click via `collapseInjectionKey`                         | **replace**                    | Inject a navbar-drawer context instead (see Proposed API → auto-close).                                                                        |
| `navbarInjectionKey`                                                                        | keep, extend (internal)        | `{tag, noAutoClose, registerDrawer?}`; internal, not exported publicly.                                                                        |
| `BNavText`                                                                                  | no change                      | Still `<li class="navbar-text">` (valid only inside `BNavbarNav`). Docs: plain `<span class="navbar-text">` outside a nav.                     |
| `BNavForm`                                                                                  | no change (#165 / #168 own it) | Renders `<li>`; docs show it inside `BNavbarNav`, or a plain `BForm class="hstack gap-2" role="search"` in the drawer body as v6 does.         |
| `BNavItemDropdown`                                                                          | G2 decides                     | Becomes a Menu in a `.nav-item`.                                                                                                               |

## Proposed API

```ts
interface BNavbarProps extends ColorExtendables {
  tag?: string; // 'nav'
  container?: boolean | "fluid" | Breakpoint; // 'fluid'
  expand?: boolean | Breakpoint; // true  (Q2)
  fixed?: "top" | "bottom";
  sticky?: "top" | "bottom";
  translucent?: boolean; // false
  noAutoClose?: boolean; // false (Q3)
}
interface BNavbarToggleProps {
  target?: string; // drawer (or any show/hide) id
  label?: string; // 'Toggle navigation'
  disabled?: boolean;
}
```

No exposed methods on `BNavbar`; open/close goes through the Drawer's `v-model` / registry (`useToggle(id)`), as today.

### Usage

```vue-html
<BNavbar expand="md" bg="1">
  <BNavbarBrand href="#">Navbar</BNavbarBrand>
  <BNavbarToggle target="nav-drawer" />
  <BDrawer id="nav-drawer" placement="end" title="Menu">
    <BNavbarNav class="me-auto">
      <BNavItem href="#" active>Home</BNavItem>
      <BNavItemDropdown text="Menu">…</BNavItemDropdown>  <!-- G2 Menu -->
    </BNavbarNav>
    <BForm class="hstack gap-2" role="search">…</BForm>
  </BDrawer>
</BNavbar>
```

### Rendered markup

```html
<nav class="navbar md:navbar-expand bg-1">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Navbar</a>
    <button
      class="btn-icon navbar-toggler"
      type="button"
      aria-label="Toggle navigation"
      aria-controls="nav-drawer"
      aria-expanded="false"
    >
      <span class="navbar-toggler-icon" aria-hidden="true"></span>
    </button>
    <dialog id="nav-drawer" class="drawer drawer-end" aria-labelledby="nav-drawer-label">
      <!-- G1 -->
      <div class="drawer-header">…</div>
      <div class="drawer-body">
        <ul class="navbar-nav me-auto">
          …
        </ul>
        …
      </div>
    </dialog>
  </div>
</nav>
```

### Class mapping

| Prop                  | Class                                           |
| --------------------- | ----------------------------------------------- |
| `expand: true`        | `navbar-expand`                                 |
| `expand: 'md'`        | `md:navbar-expand`                              |
| `expand: false`       | — (always drawer)                               |
| `translucent`         | `navbar-translucent`                            |
| `fixed: 'top'`        | `fixed-top`                                     |
| `sticky: 'bottom'`    | `sticky-bottom`                                 |
| `theme` / `bg` / `fg` | `theme-*` / `bg-*` / `fg-*` (`useThemeClasses`) |

### Auto-close (`noAutoClose`)

- `BNavbar` provides its context; the Drawer (G1), when it finds a navbar context, provides a "nav drawer" context `{hide}`.
- `BLink` (and the G2 menu item) inject it and call `hide()` on click unless `noAutoClose`. When the navbar is expanded the drawer is closed, so `hide()` is a no-op.
- Replaces the `collapseInjectionKey.isNav` path.

### Dark navbars

- v6: `data-bs-theme="dark"` on `.navbar`. Docs and demos use the plain attribute (`<BNavbar data-bs-theme="dark" bg="black">`); it falls through as an attr and is SSR-rendered. See Q5 for `v-b-color-mode`.

## a11y

- `<nav>` landmark (or `role="navigation"`); users add `aria-label` when there are several.
- Toggle: `aria-controls="<target>"` rendered in the template; `aria-expanded` bound from the registry value (`getShowHideValue`), so it is in the SSR output (`"false"` until the drawer registers or opens). `aria-label` from `label`; icon `aria-hidden="true"`.
- Drawer: native `<dialog>` + `showModal()` gives focus containment, `inert` background and Escape (G1). Focus returns to the toggle on `hidden` (as v6 data API): G1 should restore focus to the opener; the toggle passes itself as the trigger.
- Expanded: the closed `<dialog>` is shown inline by CSS; it is not in the top layer and not modal, so its links are normal tab stops. Collapsed and closed: `visibility: hidden` removes it from the a11y tree.
- `aria-current="page"` on the active `BNavItem` (already done by `BLink` for router links; docs show `active` + `aria-current`).

## SSR

- No breakpoint JS: the expanded/collapsed switch is a container query. Remove any thought of `useBreakpoints` for navbars (the current `BOffcanvas responsive` path stays a G1 concern for standalone drawers).
- The drawer inside a navbar must render on the server **with its content** (no `lazy`, no teleport), or the expanded navbar is empty until hydration.
- `ResizeObserver` (auto-hide on expansion) is created in `onMounted` and guarded (`typeof ResizeObserver`), via `getSafeWindow()`.
- `vBColorMode` has no `getSSRProps` (see Q5).
- `container-type: inline-size` is CSS; nothing to do.

## Transitions

- Navbar itself has none. Drawer motion is G1's native path (`useShowHide` + `useCssTransition`, `.hiding`, `drawer-instant` for `noTransition`). The navbar relies on `.hiding` being present during the exit, because `.navbar [class*=drawer]:not([open], .hiding)` kills transitions.
- The toggler's `box-shadow` transition is CSS only.

## Composables

- None new. Container-query helpers (G6) are not needed: the navbar never reads its width in JS. `useToggle(id)` already opens/closes the drawer programmatically.

## JS: port vs. wrap

- Navbar has no JS to port. The only behavior (close an open drawer when the navbar becomes expanded) is ~15 lines and belongs in the Vue Drawer (G1), reimplemented, not wrapped. Wrapping Bootstrap's `Drawer` class would fight Vue's state (`v-model`, registry) for little gain.

## Cross-group dependencies

### Assumptions about G1 (Drawer)

| #   | Assumption                                                                                                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | `BOffcanvas` becomes a Drawer component rendering native `<dialog class="drawer drawer-{start\|end\|top\|bottom}">` with `.drawer-header`, `.drawer-title` (id for `aria-labelledby`), `.drawer-body`.                   |
| D2  | It is **not teleported** when inside a navbar (ideally never: native `<dialog>` uses the top layer). v6 navbar CSS only works when the dialog is a descendant of `.navbar`.                                              |
| D3  | Inside a navbar, content renders always (no `lazy` / `unmountLazy`), and the dialog has no `v-show` / inline `display`. The expanded navbar shows the closed dialog inline via CSS.                                      |
| D4  | It registers in the show/hide registry by `id` (toggle via `BNavbarToggle`, `v-b-toggle`, `useToggle`), on the native transition path, adding `.hiding` during the exit.                                                 |
| D5  | When inside `.navbar` (inject `navbarInjectionKey`, or `closest('.navbar')` on mount) it observes the navbar and hides itself when open and `getComputedStyle(el).position !== 'fixed'` (port of `_initResizeObserver`). |
| D6  | Inside a navbar it uses a plain `.drawer`; its `responsive` (`md:drawer`, viewport) prop is documented as not for navbars.                                                                                               |
| D7  | It provides a context with `hide()` for auto-close (consumed by `BLink` / menu items), honoring the navbar's `noAutoClose`.                                                                                              |
| D8  | Opening one drawer hides another open drawer (v6 data API behavior), or at least the navbar case works with a single drawer.                                                                                             |
| D9  | Focus returns to the trigger (`BNavbarToggle`) after `hidden`.                                                                                                                                                           |

### Assumptions about G2 (Menu, Nav overflow)

| #   | Assumption                                                                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | `BNavItemDropdown` (or its successor) renders `<li class="nav-item"><button class="nav-link" aria-expanded>…</button><div class="menu">…</div></li>` and works inside `BNavbarNav`. |
| M2  | A menu inside an open drawer is not moved out of the `<dialog>` (top layer); teleport/container default stays off there.                                                            |
| M3  | Menu items close the menu and then the nav drawer (auto-close, D7) on activation, unless `noAutoClose`.                                                                             |
| M4  | Nav overflow inside an expanded navbar is G2's call; G3 assumes it is optional and not used in the collapsed (drawer, column) state.                                                |

### Decided here for others

- `BCollapse isNav` is removed (touches `BCollapse`, `BAccordionItem`, `collapseInjectionKey`, `BLink`, `BDropdownItem`).
- `BNavbarToggle` targets any registry id, so it also works for a collapse placed outside the navbar ("external content" pattern).

## Questions for the maintainer

### Q1 — How is the responsive region authored? (High)

Context: v6 puts a Drawer inside the navbar. The Vue side can use the G1 Drawer component directly, or ship a navbar-specific wrapper.

- **A. Use the Drawer component directly** (`<BDrawer id>` inside `BNavbar`); the Drawer detects the navbar via inject and adjusts (no teleport, eager content, resize auto-hide). Pros: matches v6 markup 1:1, no new component, one API to learn. Cons: users repeat `id` / `target`, `placement`, `title`.
- **B. New `BNavbarDrawer`** wrapper (preset placement `end`, auto id shared with `BNavbarToggle` through the navbar context). Pros: less boilerplate. Cons: extra component and docs; duplicates Drawer props; drifts from Bootstrap's API (rule 1).
- **C. A and B.** Cons: two ways to do one thing.

Recommendation: **A**.

### Q2 — `toggleable` → `expand`, and its default (High)

Context: v6 class is `navbar-expand` / `{bp}:navbar-expand`; no class = always collapsed. The library default `toggleable=false` emits `navbar-expand`. Without it, `.navbar-nav` stacks as a column, so simple navbars with nav links would break if the default became "no class".

- **A. Rename to `expand?: boolean | Breakpoint`, default `true`.** Pros: name matches the class; keeps today's visual default (expanded). Cons: rename is breaking (expected).
- **B. `expand`, default `false`** (Bootstrap's no-class default). Pros: mirrors raw Bootstrap. Cons: every existing navbar without a drawer turns into a column layout.
- **C. Keep `toggleable` with its inverted meaning, emit v6 classes.** Pros: smallest diff. Cons: name no longer matches Bootstrap; `true` meaning "never expand" stays confusing.

Recommendation: **A**.

### Q3 — Keep `noAutoClose` (close the drawer on link click)? (Medium)

Context: v6 does not close the drawer on link click (page loads do it). In an SPA, router navigation leaves the drawer open. Today auto-close works only with `BCollapse isNav`.

- **A. Keep `noAutoClose` on `BNavbar` (default auto-close on).** Drawer provides `hide()`; `BLink` / menu items call it. Pros: correct SPA behavior out of the box; small additive. Cons: library-only behavior, cross-component injection.
- **B. Remove it**; document a `router.afterEach` / `@click` recipe. Pros: pure Bootstrap. Cons: every SPA user writes the same code; regression from today.
- **C. Move it to the Drawer as `closeOnNavigate`**. Pros: works for any drawer. Cons: bigger API change on G1's component; still needs the injection.

Recommendation: **A**.

### Q4 — `BNavbarToggle` `target` shape (Low)

Context: `target` accepts an array today; v6 toggles one drawer, and `expanded` slot prop only works for a string.

- **A. `target: string` only.** Pros: simple; one `aria-controls`; consistent `expanded`. Cons: breaking for array users (rare).
- **B. Keep `string | string[]`.** Pros: no break. Cons: semantics unclear with modal drawers.
- **C. Optional `target`, auto-wired to the drawer registered in the parent navbar.** Pros: less boilerplate. Cons: hidden coupling; overlaps Q1-B.

Recommendation: **A**.

### Q5 — Dark navbar and SSR (`v-b-color-mode`) (Low)

Context: v6 uses `.navbar[data-bs-theme=dark]`. `vBColorMode` sets the attribute only on the client (no `getSSRProps`), so SSR pages flash.

- **A. Docs use the plain `data-bs-theme` attribute; add `getSSRProps` to `vBColorMode` as a cross-cutting fix.** Pros: no new prop; fixes every component. Cons: touches a directive outside G3.
- **B. Add a `colorMode?: 'light' | 'dark'` prop on `BNavbar`.** Pros: discoverable. Cons: a prop for one attribute; inconsistent with other components.
- **C. Leave as is.** Cons: SSR flash.

Recommendation: **A**.

## Decisions

Answered by the maintainer on 2026-11-03. Where an answer differs from the proposal above, the answer wins.

- **Q1 — C. Both.** `BDrawer` placed directly inside `BNavbar` works (`BNavbar` provides the context that wires `BNavbarToggle` and auto-close), and a convenience `BNavbarDrawer` renders `BDrawer` with the navbar defaults (plain `.drawer`, no `responsive`, no teleport). Docs show both.
- **Q2 — A.** `toggleable` is replaced by `expand?: boolean | Breakpoint`, default `true` (`.navbar-expand`); a breakpoint renders `.{bp}:navbar-expand`; `false` renders no class (always collapsed).
- Q3–Q5: _Pending._
- Cross-group (G1, answered): `BOffcanvas` is renamed `BDrawer`, `useModal` → `useDialog`; read assumptions D1–D9 with those names.

## Migration notes (for `bnavbar.md` / navbar docs)

- `toggleable` → `expand` (Q2). `navbar-expand-{bp}` → `{bp}:navbar-expand`, which reacts to the **navbar's width** (container query), not the viewport.
- `<BCollapse is-nav>` → a Drawer inside the navbar (Q1). `BCollapse` loses `isNav`.
- `BOffcanvas` inside a navbar: no teleport, plain drawer (not `responsive`).
- `BNavbarToggle` renders `.btn-icon`, `aria-controls`, `aria-expanded`; `target` is a string (Q4).
- `print` removed. Add `class="print:d-none"` only if the user's build enables print utilities (alpha.1 ships none).
- `.navbar-nav-scroll`, `.navbar-dark`, `.navbar-light` removed upstream; use `data-bs-theme` and `bg-*` (`bg-body-tertiary` → `bg-1`).
- `theme` tints brand / active links, not the background; use `bg`.
- New `translucent`.
- A navbar must not be inside a shrink-to-fit parent (`container-type: inline-size`).

## Docs and data changes

- `navbar.data.ts`: `toggleable` → `expand`; remove `print`; add `translucent`; fix `BNavbarBrand` `tag` default; `BNavbarToggle.target` type and description (drawer, not "collapse/sidebar").
- `navbar.md`: rewrite responsive section around the Drawer; remove `BSidebar`, `navbar-nav-scroll` (and `NavbarScroll.vue`), the 4-option `auto-close` text, printing; container-query note; color schemes (`bg` + `data-bs-theme`).
- Demos: `NavbarOverview`, `NavbarOffcanvas`, `NavbarToggle`, `NavbarColorMode`, `NavbarItemDropdown`, `NavbarForm`, `NavbarInlineGroup`, `NavbarText` (fix `mb-lg-0` → `lg:mb-0`, `right` dropdown prop per G2).
- Playground `TNavbar.vue`, `TScrollspy.vue`.
- `collapse.data.ts` / `accordion.data.ts`: remove `isNav`.
- Exports: none added or removed (`BNavbar*` stay in `components/BNavbar/index.ts`).

## Implementation split

1. **PR A — Navbar core** (independent of G1/G2): `expand` + class mapping, `translucent`, remove `print`, `BNavbarToggle` v6 markup + `aria-controls` / `aria-expanded` + `target: string`, remove `BCollapse isNav` and the `collapseInjectionKey.isNav` close path, data/spec updates. Demos temporarily keep `BOffcanvas` (no teleport) for the drawer.
2. **PR B — Navbar + Drawer integration** (after G1's Drawer PR): navbar context consumed by the Drawer (no teleport, eager content, resize auto-hide), auto-close via the drawer context in `BLink`, docs rewrite and demos with `BDrawer`.
3. **PR C — Navbar + Menu** (after G2): `BNavItemDropdown` successor in `BNavbarNav`, menu-item auto-close, demo updates.
4. Cross-cutting (Q5-A): `vBColorMode` `getSSRProps`, any time.

Checks per AGENTS.md: library `test:lint`, `test:unit:ci`, `build`; `pnpm --filter docs run type-check`; playground type-check; manual check of `md:navbar-expand` at different navbar widths and the drawer exit animation inside a navbar.
