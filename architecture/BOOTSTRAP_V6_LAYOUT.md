# Bootstrap v6 Layout and Behavior (G6)

Research group G6 of the [new components plan](./BOOTSTRAP_V6_NEW_COMPONENTS.md): Scrollspy, CSS Grid, container-query helpers, and the CSS-only helpers from the plan's "Excluded" table.
Research only: nothing here is implemented. Decisions wait for the maintainer (see [Questions](#questions-for-the-maintainer)).

## Summary

- **Scrollspy:** rebuild `useScrollspy` on v6's algorithm (an IntersectionObserver strip from the top of the root down to a `topMargin` activation line, a bottom sentinel, keep-last-active, smooth-scroll settle with hash and focus). Port the logic into Vue rather than wrapping Bootstrap's `ScrollSpy` class. Keep `vBScrollspy` as a thin wrapper, but move it to the scroll container as v6 does (`data-bs-spy` sits on the content). Sections come from the target's links as in v6; keeping the library's content-query mode (used by the docs "On this page" sidebar) is the main open question.
- **CSS Grid:** add `BGrid` and `BGridItem`. `BGrid` renders `.grid` and sets `--bs-columns` / `--bs-rows` / `--bs-gap` inline. `BGridItem` maps `Responsive<…>` objects to `g-col-*` / `g-start-*` with the existing `getResponsiveClasses`. In v6 the `g-col-*` prefixes are **container** queries against the `.grid` itself, while `BRow` / `BCol` stay **viewport** media queries.
- **Container queries:** no public API. Only some v6 classes use container queries (navbar expand, list group horizontal, card group, stacked tables, stacks, stepper, CSS grid items). Utilities and the `.row` grid stay viewport-based. An element cannot query itself, so a `container` prop on the component that needs the container does nothing. Document `.contains-inline` instead. The library's only viewport JS (`BOffcanvas` `responsive`) matches v6 Drawer, which also uses media queries.
- **CSS-only helpers** (hover lift, theme, color scheme, motion, space, divide): docs only. Class fallthrough already reaches every root element, and the `theme` prop from part one already covers the theme utilities.
- 8 questions. The high-impact ones are Q1 (scrollspy section source) and Q5 (grid component shape).

## Sources read

- `AGENTS.md`, `architecture/BOOTSTRAP_V6_NEW_COMPONENTS.md`, `architecture/BOOTSTRAP_V6_MIGRATION.md` (Grid, Navigation, Content and Deferred sections), `architecture/ARIA_VISIBILITY.md`.
- Library: `src/composables/useScrollspy/index.ts`, `src/directives/BScrollspy/index.ts`, `src/directives/utils.ts`, `src/utils/responsive.ts`, `src/types/BreakpointProps.ts`, `src/components/BContainer/*` (`BRow`, `BCol`, `BContainer`), `BCardGroup.vue`, `BListGroupItem.vue`, `BOffcanvas.vue` (`useBreakpoints(breakpointWidths)`), `src/types/BootstrapVueOptions.ts`, `src/composables/index.ts`, `src/directives/index.ts`, `useThemeClasses.ts`, `package.json` (peers: `@vueuse/core`, `bootstrap ^6.0.0-alpha.1`).
- Docs and apps: `apps/docs/src/docs/directives/BScrollspy.md` + demo, `apps/docs/src/docs/composables/useScrollspy.md` + 6 demos, `apps/docs/src/docs/types.md` (`ScrollspyList`), `apps/docs/.vitepress/theme/Layout.vue` (the docs "On this page" sidebar uses `useScrollspy` with `contentQuery` + `manual`), `apps/docs/src/data/components/gridSystem.data.ts`, `apps/playground/src/components/Comps/TScrollspy.vue`.
- Batch branches: `bootstrap-v6-tables` (stacked tables always wrapped in `table-responsive`, the query container), `bootstrap-v6-navigation` (`listGroup.data.ts` documents the `.contains-inline` requirement; card demos wrap `.card-group` in `.contains-inline`).
- Bootstrap 6.0.0-alpha.1: `js/src/scrollspy.ts`, `js/src/menu.ts` (toggle selector), `scss/layout/_grid.scss`, `scss/layout/_breakpoints.scss` (container mixins), `scss/mixins/_grid.scss` (`make-cssgrid`), `scss/_utilities.scss` (`contains-*`, `grid-cols-*`, `grid-auto-flow-*`, `space-*`, `divide-*`, `color-scheme-*`, `transition-none`, `animation-*`), `scss/helpers/_hover-lift.scss`, `scss/helpers/_stacks.scss`, `_navbar.scss`, `_list-group.scss`, `_card.scss`, `_stepper.scss`, `content/_tables.scss`, `_nav-overflow.scss`, `dist/css/bootstrap.css`.
- v6 docs: `/docs/6.0/components/scrollspy/`, `/layout/css-grid/`, `/layout/breakpoints/`, `/utilities/container-queries/`, `/utilities/grid/`. v5.3 Scrollspy options from memory of the v5 source (`rootMargin: '0px 0px -25%'`, `threshold: [0.1, 0.5, 1]`, `smoothScroll`, `target`, deprecated `offset` / `method`).

All classes and variables cited below were checked against `dist/css/bootstrap.css`. The built CSS uses the `--bs-` prefix (`--bs-columns`), while the Sass sources write tokens without it (`--columns`).

---

## Scrollspy

### v6 overview

`ScrollSpy` (`js/src/scrollspy.ts`) is placed on the **scroll container** (`data-bs-spy="scroll"`). `target` points at the nav.

| Option         | Type                 | Default | Notes                                                                                                                                                                                                                                                                                     |
| -------------- | -------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `topMargin`    | `string`             | `'12%'` | Activation line measured from the top of the root; `%` or `px`. A `px` line rebuilds the observer on resize (100 ms debounce)                                                                                                                                                             |
| `rootMargin`   | `string \| null`     | `null`  | Raw IntersectionObserver `rootMargin`; when set it overrides `topMargin`                                                                                                                                                                                                                  |
| `threshold`    | `number[] \| string` | `[0]`   | Passed to the observer                                                                                                                                                                                                                                                                    |
| `smoothScroll` | `boolean`            | `false` | Delegated click on the target's `[href]` links; scrolls smoothly, then on `scrollend` (or a 100 ms idle fallback) calls `history.replaceState` with the hash and focuses the section (`tabindex="-1"` added if missing). With reduced motion or when already in place, it settles at once |
| `target`       | `string \| Element`  | `null`  | Nav wrapper; falls back to `document.body`                                                                                                                                                                                                                                                |

Behavior:

- **Sections come from links.** Each `[href]` in the target with a hash and not disabled is resolved with `getElementById(decodeURIComponent(hash))`. It is kept only when it lies inside the spied element and is visible. Sections are sorted by `getBoundingClientRect().top` once per refresh.
- **Root:** the spied element if its `overflow-y` is not `visible`, otherwise the viewport.
- **Active section:** the deepest section crossing the activation line. In a gap the last active one stays active; above the first section, the first one is active. A zero-size, `aria-hidden` sentinel appended to the spied element marks "at bottom" (only while the content overflows), and then the last section wins.
- **Applying state:** clears `[href].active` inside the target and adds `.active` to the link. Parents are activated too: a `.menu-item` activates `closest('.menu').previousElementSibling` when it matches `[data-bs-toggle="menu"]`; otherwise, for each `.nav` / `.list-group` ancestor, the previous `.nav-link`, `.nav-item > .nav-link` or `.list-group-item` sibling gets `.active`.
- **Event:** `activate.bs.scrollspy` on the spied element, with `relatedTarget` = link.
- **Methods:** `refresh()` (re-scan, rebuild observers), `dispose()`.
- **No ARIA:** v6 sets no `aria-current`. The docs only ask for `tabindex="0"` on a scroll container that has no focusable children.

Changes from v5: v5 used `rootMargin: '0px 0px -25%'` and `threshold: [0.1, 0.5, 1]`, picked the active section by scroll direction, activated `.dropdown` parents, and had no `topMargin`, sentinel or hash/focus settle.

### Current library

`useScrollspy(content, target, options)` (`src/composables/useScrollspy/index.ts`) and `vBScrollspy` (`src/directives/BScrollspy/index.ts`, placed on the **nav**, content passed as arg or value). No specs exist for either.

The current model is **content-driven**: sections are `content.querySelectorAll(contentQuery)` (default `:scope > [id]`), and `list` exposes `{id, el, visible, text}` so users can render their own nav. The docs sidebar (`apps/docs/.vitepress/theme/Layout.vue`) depends on this: it selects headings with a long `contentQuery`, sets `manual: true`, and builds "On this page" from `list`.

Defects to fix in the rebuild:

| Defect                                                                                                      | Effect                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Active section picked by scroll direction with thresholds `[0.1, 0.5, 1]` (v5 approach)                     | Flicker between sections; no reliable bottom-of-page result                                                                                                                                             |
| Directive `updated: bind` disposes and re-creates the instance on every host re-render                      | Observers torn down and rebuilt constantly                                                                                                                                                              |
| Directive calls the composable outside any effect scope                                                     | vueuse watchers and observers are never collected (relies on `cleanup`)                                                                                                                                 |
| `classList` mutation on component-rendered links                                                            | Vue's `patchClass` replaces `className` when the link's class binding changes, so a re-render silently drops the scrollspy `.active` (and the spy won't re-add it because the active id hasn't changed) |
| Parent activation walks `previousSibling` (can be a text node) and matches `.dropdown` / `.dropdown-toggle` | Breaks with whitespace nodes; doesn't match v6 `.menu` markup                                                                                                                                           |
| `scrollIntoView` uses `document.querySelector(href)` and `el.offsetTop`                                     | Throws on ids with `.` / `:`; offset relative to `offsetParent`, not the scroller                                                                                                                       |
| `watchChanges` watches `childList` on the content only                                                      | Nav changes (new links) are not picked up                                                                                                                                                               |

### Disposition: `useScrollspy` options

| Option         | Disposition                                             | Notes                                                                                                                                                                                                                                   |
| -------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contentQuery` | **Keep (small additive), renamed `sections`** — Q1      | Only used when there's no `target` (content-driven mode, docs TOC). If Q1 = A, remove                                                                                                                                                   |
| `targetQuery`  | **Remove**                                              | v6 always uses `[href]`; the docs pass `':scope [href]'`, which is the same                                                                                                                                                             |
| `manual`       | **Keep (small additive)**                               | Don't touch the DOM; bind `current` yourself. The recommended mode for library nav components (see Q3)                                                                                                                                  |
| `root`         | **Remove**                                              | v6 derives the root (content if scrollable, else viewport). The `UseScrollspyCustomRoot` demo goes                                                                                                                                      |
| `rootMargin`   | **Replace with v6 equivalent**                          | Default `null`; overrides `topMargin` when set (was `'0px 0px -25%'`)                                                                                                                                                                   |
| `threshold`    | **Replace with v6 equivalent**                          | Default `[0]` (was `[0.1, 0.5, 1]`); `number \| number[]`                                                                                                                                                                               |
| `watchChanges` | **Keep (small additive)**                               | v6 needs a manual `refresh()`; Vue content changes all the time. Now observes content **and** target (`childList`, `subtree`, `attributes: ['href', 'id']`), batched to one `refresh()` per tick, ignoring the sentinel's own insertion |
| —              | **New** `topMargin` (`'12%'`), `smoothScroll` (`false`) | From v6                                                                                                                                                                                                                                 |

### Disposition: `useScrollspy` return values

| Return                  | Disposition                                       | Notes                                                                                                                                                                |
| ----------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `current`               | **Keep**                                          | `Readonly<Ref<string \| null>>`, id of the active section                                                                                                            |
| `list`                  | **Keep, renamed `sections`** — Q1                 | `{id, el, text, link}`; `visible` is dropped (v6 has "crossing the line", not visibility, and it changes on every scroll tick)                                       |
| `content`, `target`     | **Keep**                                          | Resolved elements, readonly                                                                                                                                          |
| `scrollIntoView(event)` | **Replace** with `scrollTo(idOrEvent, {smooth?})` | Same settle as v6 `smoothScroll` (scroll root, `replaceState` hash, focus). Needed in manual / content-driven mode, where there are no links to delegate clicks from |
| `updateList`            | **Replace** with `refresh()`                      | v6 method name                                                                                                                                                       |
| `cleanup`               | **Replace** with `dispose()`                      | v6 method name; also runs automatically through `tryOnScopeDispose`                                                                                                  |

### Disposition: `vBScrollspy`

| Today                                                 | Disposition                                                                                                           |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Placed on the nav; arg or value = content             | **Replace** (Q2): placed on the scroll container; arg or value = target, as `data-bs-spy`                             |
| Value object forwards options (incl. `element` alias) | **Keep** (options as above); **remove** `content` / `element` aliases                                                 |
| `updated` re-binds every render                       | **Replace**: re-bind only when the binding value changes (JSON compare, as `vBTooltip` does in `directives/utils.ts`) |

### Proposed API

```ts
interface UseScrollspyOptions {
  topMargin?: string; // '12%'; '%' or 'px'
  rootMargin?: string | null; // null; overrides topMargin
  threshold?: number | number[]; // [0]
  smoothScroll?: boolean; // false
  manual?: boolean; // false: don't touch link classes
  watchChanges?: boolean; // true
  sections?: string; // Q1: content-driven selector, used when target is null
}

declare function useScrollspy(
  content: MaybeRefOrGetter<string | ComponentPublicInstance | HTMLElement | null>,
  target?: MaybeRefOrGetter<string | ComponentPublicInstance | HTMLElement | null>,
  options?: MaybeRefOrGetter<UseScrollspyOptions>, // re-reads on change, then refresh()
): {
  current: Readonly<Ref<string | null>>;
  sections: Readonly<Ref<readonly ScrollspySection[]>>; // {id, el, text, link: HTMLElement | null}
  content: Readonly<Ref<HTMLElement | null>>;
  target: Readonly<Ref<HTMLElement | null>>;
  scrollTo: (idOrEvent: string | Event, opts?: { smooth?: boolean }) => void;
  refresh: () => void;
  dispose: () => void;
};
```

```vue-html
<!-- Directive: on the scroll container, like data-bs-spy -->
<div v-b-scrollspy="'#toc'" style="height: 300px; overflow-y: auto" tabindex="0" @activate="onActivate">…</div>
<div v-b-scrollspy="{target: '#toc', topMargin: '96px', smoothScroll: true}">…</div>

<!-- Reactive: the recommended path for BNav / BListGroup -->
<BListGroup ref="toc">
  <BListGroupItem v-for="s in items" :key="s" :href="`#${s}`" :active="current === s">…</BListGroupItem>
</BListGroup>
<script setup lang="ts">
const {current} = useScrollspy(content, toc, {manual: true, smoothScroll: true})
</script>
```

- **Event:** the composable has no event (watch `current`). The directive dispatches a non-bubbling native `CustomEvent('activate', {detail: {link, section}})` on its element, the Vue counterpart of `activate.bs.scrollspy`, so `@activate` works on a plain element.
- **Nested navs and menus** (DOM mode only): port v6 `_activateParents` exactly, using `previousElementSibling` and the v6 selectors (`.nav-link`, `.nav-item > .nav-link`, `.list-group-item`; `.menu-item` → toggle). The menu toggle selector depends on G2 (see [Cross-group dependencies](#cross-group-dependencies)). In manual mode, nested activation is up to the user; the docs show a `computed` set of active ancestor ids.

### Markup

No markup of its own. The directive adds nothing to the element. While active, the composable appends one sentinel `<div aria-hidden="true" style="position:relative;width:0;height:0;margin:0;padding:0;border:0;visibility:hidden">` to the content element, as v6 does, and re-appends it on each `refresh()`. This keeps it last after Vue inserts new children, because Vue appends after foreign nodes.

### Accessibility

- DOM mode: `.active` plus `aria-current="location"` on the active link (Q4; v6 sets no ARIA). Remove both from the previous link.
- `smoothScroll` / `scrollTo`: move focus to the section (`tabindex="-1"` if it isn't focusable) with `preventScroll`, and replace the URL hash without a history entry. Reduced motion → instant scroll.
- Docs: a scroll container without focusable children needs `tabindex="0"` (v6 guidance).

### SSR

- Nothing runs on the server: `IntersectionObserver`, `MutationObserver`, `matchMedia`, `history` and `getElementById` are reached only in `onMounted` (composable) or `mounted` (directive), through `getSafeWindow()` / `getSafeDocument()`. Each is feature-checked before use.
- `current` starts as `null` on both server and client, so `:active="current === id"` hydrates without a mismatch. The first activation happens after mount.
- The directive gets SSR props from `getSSRProps` returning `{}` (nothing to render).

### Port vs wrap Bootstrap JS

**Port.** Wrapping `bootstrap/js/src/scrollspy.ts` would:

- pull in `BaseComponent`, `EventHandler`, `SelectorEngine` and the data API, whose `load` handler auto-initializes `[data-bs-spy]` elements;
- only report state through DOM events and class mutation, so a reactive `current` needs event listeners on top;
- keep the `className` clobbering problem;
- lack `manual`, content-driven sections and `watchChanges`.

The algorithm is about 200 lines with no third-party dependency. Port it faithfully, using `@vueuse/core` (already a peer) only for `useMutationObserver` / `tryOnScopeDispose`, and cite the upstream file in a header comment so later upstream fixes can be diffed in.

### Composables

`useScrollspy` stays public (it is already exported and documented). Export path unchanged: `bootstrap-vue-next/composables/useScrollspy`.

### Implementation notes

- Files: rewrite `src/composables/useScrollspy/index.ts`; rewrite `src/directives/BScrollspy/index.ts` to run the composable inside an `effectScope()` stopped in `beforeUnmount`; add `useScrollspy.spec.ts` and `scrollspy.spec.ts` (mock IntersectionObserver; cover active selection, gap, top, bottom sentinel, px resize rebuild, nested parents, manual, settle).
- Types: replace `ScrollspyList` / `ScrollspyListItem` with `ScrollspySection` / `UseScrollspyOptions` and export them from `src/types`. Update `apps/docs/src/docs/types.md` and `apps/docs/src/types/index.ts`.
- Docs: rewrite `useScrollspy.md` (option table, return table, migration), `BScrollspy.md` (new orientation, `@activate`). Demos: drop `UseScrollspyCustomRoot` and `UseScrollspyCleanup`; rewrite the others for the new names; add nested-nav, `topMargin: '96px'` sticky-header and `smoothScroll` demos. Update `apps/docs/.vitepress/theme/Layout.vue` (`list` → `sections`, `contentQuery` → `sections`, drop `targetQuery` / `rootMargin`). Update the playground `TScrollspy.vue` (directive orientation, `BNavItemDropdown` → Menu once G2 lands).
- Migration notes: options renamed/removed, defaults changed (`rootMargin`, `threshold`), directive moved to the content element, `scrollIntoView` → `scrollTo`, `updateList` → `refresh`, `cleanup` → `dispose`, `list` → `sections` without `visible`.

---

## CSS Grid

### v6 overview

| Piece                            | v6                                                                                                                                                                                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.grid`                          | `display: grid; container-type: inline-size; grid-template-rows: repeat(var(--bs-rows), 1fr); grid-template-columns: repeat(var(--bs-columns), 1fr); gap: var(--bs-gap)`; defaults `--bs-columns: 12`, `--bs-rows: 1`, `--bs-gap: 1.5rem` |
| `.g-col-{1..12}`                 | `grid-column: auto / span N`                                                                                                                                                                                                              |
| `.g-start-{1..11}`               | `grid-column-start: N`                                                                                                                                                                                                                    |
| `{bp}:g-col-*`, `{bp}:g-start-*` | **`@container (width >= …)`**: items respond to the width of their `.grid`, not the viewport                                                                                                                                              |
| Children without `g-col-*`       | One track each (auto placement)                                                                                                                                                                                                           |
| Nesting                          | Nested `.grid` inherits `--bs-columns` / `--bs-rows` / `--bs-gap` unless overridden                                                                                                                                                       |
| Grid utilities                   | `grid-cols-{1,2,3,4,6,subgrid}` (sets `grid-template-columns` directly), `grid-cols-fill` (`grid-column: 1 / -1`), `grid-auto-flow-{row,column,dense}`; all responsive through **viewport** `@media`                                      |
| Gap utilities                    | `gap-*`, `row-gap-*`, `column-gap-*`, responsive through viewport `@media`; the utilities layer beats `.grid`'s `gap`                                                                                                                     |
| Sass                             | `$enable-cssgrid` is `true` in alpha.1 `_config.scss` and the dist CSS includes `.grid`. The v6 docs page still says it is opt-in; treat the installed CSS as authoritative and note that users who disable it get an unstyled `BGrid`    |

The `.row` grid (`BRow` / `BCol`) is unchanged and uses viewport media queries (`make-grid-columns` → `media-breakpoint-up`).

### Current library

No counterpart. `BGrid` was deferred in part one (`BOOTSTRAP_V6_MIGRATION.md` → Deferred features). `BRow` / `BCol` / `BContainer` already use `Responsive<…>` objects through `getResponsiveClasses` (`src/utils/responsive.ts`), and their types live in `src/types/BreakpointProps.ts`. Nothing to keep or remove.

### Proposed API

`BGrid`:

| Prop      | Type                                       | Default | Renders                                                          |
| --------- | ------------------------------------------ | ------- | ---------------------------------------------------------------- |
| `tag`     | `string`                                   | `'div'` | —                                                                |
| `columns` | `Numberish`                                | —       | `style="--bs-columns: N"`                                        |
| `rows`    | `Numberish`                                | —       | `style="--bs-rows: N"`                                           |
| `gap`     | `string`                                   | —       | `style="--bs-gap: …"` (any CSS length or `row column` pair) — Q6 |
| `flow`    | `Responsive<'row' \| 'column' \| 'dense'>` | —       | `grid-auto-flow-dense md:grid-auto-flow-column`                  |

Slot: `default`. No emits. Class `grid` always.

`BGridItem`:

| Prop    | Type                           | Default | Renders                                                         |
| ------- | ------------------------------ | ------- | --------------------------------------------------------------- |
| `tag`   | `string`                       | `'div'` | —                                                               |
| `cols`  | `Responsive<ColsNumbers>`      | —       | `g-col-6 md:g-col-4` (container queries)                        |
| `start` | `Responsive<GridStartNumbers>` | —       | `g-start-2 lg:g-start-4` (`GridStartNumbers` = 1…11)            |
| `fill`  | `Responsive<boolean>`          | —       | `grid-cols-fill md:grid-cols-fill` (viewport, from the utility) |

Slot: `default`. Named `cols` (not `span`) to match `BCol`. Plain children work too: auto columns need no `BGridItem`.

```vue-html
<BGrid :columns="4" gap=".25rem 1rem">
  <BGridItem :cols="{ xs: 4, md: 2 }">A</BGridItem>
  <BGridItem :cols="{ xs: 4, md: 2 }" :start="{ md: 3 }">B</BGridItem>
  <div>auto</div>
</BGrid>
<!-- <div class="grid" style="--bs-columns:4;--bs-gap:.25rem 1rem">
       <div class="g-col-4 md:g-col-2">A</div><div class="g-col-4 md:g-col-2 md:g-start-3">B</div>… -->
```

### Relation to `Responsive<T>` and `BRow` / `BCol`

- Same `Responsive<T>` objects and `getResponsiveClasses`; no new helper.
- Docs must say plainly that `BGridItem` breakpoints compare against the grid's width, while `BCol` breakpoints and the `flow` / `fill` utilities compare against the viewport. This mixed behavior comes from v6 itself.
- `BRow` gutters (`gx-*` / `g-*`) do nothing on `.grid`; use `gap`.

### Accessibility and SSR

Pure markup and classes: no ARIA, no client-only code, SSR-identical. Docs note that visual order (`start`, `dense`) can diverge from DOM order (WCAG 1.3.2), as with `BCol` `order`.

### Implementation notes

- New `src/components/BGrid/{BGrid.vue, BGridItem.vue, index.ts}`; export from `src/components/index.ts`; add both to the component and props maps in `src/types/BootstrapVueOptions.ts` (path `/components/BGrid`); `BGridProps` / `BGridItemProps` in `ComponentProps.ts`, slots in `ComponentSlots.ts`; `GridStartNumbers` and `GridFlow` in `BreakpointProps.ts`. Check the Nuxt module picks the new components up from the shared map.
- Specs: class output per breakpoint, inline variables, auto children, `class` / `style` merge.
- Docs: add a CSS Grid section to `grid-system.md` (or a new `css-grid.md` page) and add `BGrid` / `BGridItem` to `gridSystem.data.ts`. Demos: basic, responsive (resize the parent, not the window), starts, auto columns, nesting, `--bs-columns: 18` with inline `grid-column: span 14`, `dense`. Remove "CSS Grid mode (`BGrid`): deferred" from `BOOTSTRAP_V6_MIGRATION.md` when it lands.

---

## Container-query helpers

### Which v6 classes use container queries

| Container query (needs a query-container **ancestor**) | Container provided by v6?                                                   | Library component                                  |
| ------------------------------------------------------ | --------------------------------------------------------------------------- | -------------------------------------------------- |
| `{bp}:g-col-*`, `{bp}:g-start-*`                       | Yes: `.grid`                                                                | `BGridItem` (new)                                  |
| `{bp}:table-stacked`                                   | Yes: `.table-responsive` (`container-type: inline-size`)                    | `BTable` / `BTableSimple`: always wraps since #166 |
| `{bp}:navbar-expand`                                   | `.navbar` is a container, but it queries the nearest **ancestor** container | `BNavbar` (G3)                                     |
| `{bp}:list-group-horizontal`                           | No: wrap in `.contains-inline`                                              | `BListGroup horizontal` (#168 documents it)        |
| `.card-group` row layout (≥ sm)                        | No                                                                          | `BCardGroup` (card demos already wrap)             |
| `{bp}:hstack` / `{bp}:vstack`                          | `.stack-container` helper                                                   | none (no `BStack`)                                 |
| `{bp}:stepper-horizontal`                              | `.stepper-overflow`                                                         | Stepper (G5)                                       |
| `.nav-overflow`                                        | Yes: itself                                                                 | Nav overflow (G2)                                  |

Everything else uses viewport `@media`: all responsive utilities (`md:d-none`, `md:gap-3`, `md:grid-cols-3`, …), `.row` / `col-*`, containers, Dialog fullscreen, Drawer responsive, position helpers.

Utilities: `.contains-inline` (`container-type: inline-size`), `.contains-size` (`container-type: size`; needs an explicit height). Sass mixins: `set-container()`, `container-breakpoint-up/down/between/only()` with optional container names. v6 ships no named-container classes.

### Existing viewport JS in the library

| Code                                                                   | Verdict                                                                                                                    |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `BOffcanvas` `responsive`: `useBreakpoints(breakpointWidths)` (vueuse) | Correct as viewport: v6 Drawer's responsive styles use `media-breakpoint-down`. Stays viewport in the Drawer redesign (G1) |
| `BTable` stacked                                                       | Pure CSS since #166; no JS                                                                                                 |
| `BListGroup horizontal`                                                | Pure CSS since #168; no JS                                                                                                 |
| `BNavbar` `toggleable`                                                 | Class only; G3 decides the `{bp}:navbar-expand` markup                                                                     |
| Docs `Layout.vue`: `useMediaQuery('(min-width: 992px)')`               | v5 `lg` width; should be `1024px` (docs cleanup, not library)                                                              |

There is no public `useBreakpoints` in the library, and `breakpointWidths` is internal.

### Proposal

Docs only (Q7):

- A "Container queries" page (or a section of the grid page) listing the table above, the "an element cannot query itself" rule, `.contains-inline` vs `.contains-size`, and the Sass mixins for custom components.
- A cross-link from every component prop whose breakpoint values are container-based (`BListGroup horizontal`, `BTable stacked`, `BNavbar toggleable`, `BGridItem`, Stepper), using one shared sentence in `apps/docs/src/utils` so the wording stays consistent.

Why no prop: the component that needs the container (`BListGroup`, `BCardGroup`) can't be its own container, so a `container` prop would have to render an extra wrapper element. That changes the markup and fallthrough-attrs target for a one-class saving, and plain `class="contains-inline"` on any ancestor (`BContainer`, `BCol`, a `div`) already works through attribute fallthrough.

Why no `useContainerBreakpoint`: nothing in the library needs JS container breakpoints. Users who do can write `useElementSize(el)` + widths in a few lines. If a later component needs it, add it internally first.

---

## CSS-only helpers and utilities

| Helper            | v6 classes (verified)                                                                                                                                        | Proposal                                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hover lift        | `.hover-lift`; tokens `--bs-hover-lift-transform`, `-box-shadow`, `-transition-duration`, `-transition-timing`; lifts on `:hover` and `:focus-visible`       | Docs only (`class="hover-lift"` on `BCard`, `BButton`, `BLink`). A card demo shows it. No prop (Q8)                                                                                                   |
| Theme utilities   | `.theme-{primary,accent,success,danger,warning,info,inverse,secondary}`, `.theme-contrast`, `.theme-subtle`, `.theme-muted`, `.theme-border`, `.theme-reset` | Already covered: the `theme` prop (`ThemeProp`, modifiers `contrast` / `subtle` / `muted` / `border` / `reset` in `useThemeClasses.ts`). Docs cross-link only                                         |
| Color scheme      | `.color-scheme-light`, `.color-scheme-dark`, `.color-scheme-auto` (CSS `color-scheme`)                                                                       | Docs only. Different from `data-bs-theme` (`useColorMode` / `vBColorMode`); the docs should explain both: `color-scheme` changes UA controls and scrollbars, `data-bs-theme` changes Bootstrap tokens |
| Motion            | `.transition-none`, `.animation-none`, `.animation-shake`, `.animation-pop`                                                                                  | Docs only. `transition-none` is already the documented escape hatch (and `BCollapse` uses it for `noTransition`). `animation-shake` on invalid submit belongs to G4 if anywhere                       |
| Space             | `space-x-*`, `space-y-*` (`> :not(:last-child)` margins), responsive (viewport)                                                                              | Docs only                                                                                                                                                                                             |
| Divide            | `divide-x`, `divide-y`, `divide-x-0`, `divide-y-0`, responsive (viewport)                                                                                    | Docs only                                                                                                                                                                                             |
| Container queries | `.contains-inline`, `.contains-size`                                                                                                                         | See above                                                                                                                                                                                             |

None of these is a component state the library manages, so a prop would only rename a class.

---

## Cross-group dependencies

| With            | Item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| G2 Menus        | Scrollspy parent activation for `.menu-item` looks for `closest('.menu').previousElementSibling` matching `[data-bs-toggle="menu"]`. If the Vue Menu toggle doesn't render `data-bs-toggle="menu"`, either G2 adds that attribute (harmless, and it helps users copying v6 markup) or the port matches a library class such as `.menu-toggle`. **G6 recommends G2 render `data-bs-toggle="menu"` on the toggle**, with the `.menu` as its next element sibling. Also: Menu items should keep `.menu-item` and accept `href` (anchor items) |
| G2 Nav overflow | Overflowed links move into a menu; scrollspy in DOM mode needs `watchChanges` to pick up moved links (covered by observing the target subtree)                                                                                                                                                                                                                                                                                                                                                                                             |
| G3 Navbar       | `{bp}:navbar-expand` is a container query against the navbar's ancestor container; G3 decides markup. G6 docs page lists it. Navbar + scrollspy demo (v6 docs example) needs the G3 + G2 markup                                                                                                                                                                                                                                                                                                                                            |
| G1 Drawer       | `responsive` stays viewport (`useBreakpoints(breakpointWidths)`), matching v6 media queries. Not a container-query case                                                                                                                                                                                                                                                                                                                                                                                                                    |
| G5 Stepper      | `{bp}:stepper-horizontal` is container-based; reuse the G6 shared docs sentence                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Docs app        | `Layout.vue` is the main `useScrollspy` consumer (content-driven, manual). Q1 decides whether it keeps working with a rename or must switch to rendering links first                                                                                                                                                                                                                                                                                                                                                                       |

## Questions for the maintainer

### Q1 — Scrollspy section source (High)

Context: v6 derives sections from the target's links. The library derives them from `contentQuery` and exposes `list` so users (and the docs sidebar) can build the nav from the headings. Rule 1 allows only small additives.

| Option                                                                                                          | Pros                                                                                             | Cons                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A. v6 only: sections from links                                                                                 | Pure v6; smallest API                                                                            | Breaks "build a TOC from headings" (the docs sidebar would have to render links first and couldn't read heading text from the composable) |
| B. v6 by default, plus one `sections` selector option used when `target` is null; return `sections` with `text` | Keeps the docs TOC and the common Vue pattern with one option; algorithm is identical either way | One extra option and mode to document and test                                                                                            |
| C. Keep today's content-driven model and add v6 options on top                                                  | Least migration                                                                                  | Not Bootstrap's model; contradicts rule 1                                                                                                 |

Recommendation: **B**.

### Q2 — `vBScrollspy`: keep, and where it goes (Medium)

Context: v6 puts `data-bs-spy` on the scroll container with `target` = nav. The library directive sits on the nav with content as arg.

| Option                                                        | Pros                                                                  | Cons                                                    |
| ------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------- |
| A. Keep; move to the content element, value/arg = target (v6) | Mirrors v6 markup and docs; `@activate` on the spied element as in v6 | Breaking for every directive user                       |
| B. Keep on the nav (today)                                    | No migration                                                          | Diverges from v6 docs and examples                      |
| C. Remove the directive; composable only                      | One API                                                               | Loses the zero-script path v6 offers with `data-bs-spy` |

Recommendation: **A**.

### Q3 — How active state is applied (Medium)

Context: v6 mutates `.active` on links. On Vue-rendered links (`BNavItem`, `BListGroupItem`) a re-render that changes the class binding replaces `className` and drops the spy's class.

| Option                                                                                                                                                | Pros                                                    | Cons                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| A. DOM mode by default (v6 parity, incl. nested parents), `manual` for reactive binding; docs recommend `manual` + `:active` for dynamic library navs | Works with plain v6 markup; one documented escape hatch | The clobbering edge case remains in DOM mode                                      |
| B. Reactive only (no DOM writes); users always bind `current`                                                                                         | No conflict with Vue                                    | Directive becomes nearly useless; nested parents become the user's job            |
| C. A, plus library nav components (`BNavItem`, `BListGroupItem`, Menu item) inject a scrollspy context and compute `active` themselves                | Correct with library components and no DOM writes       | Cross-component coupling and more API surface; touches G2 / navigation components |

Recommendation: **A** (revisit C only if users report the edge case).

### Q4 — `aria-current` on the active link (Low)

Context: v6 sets no ARIA. `BListGroupItem active` already renders `aria-current="true"`.

| Option                                          | Pros                                                        | Cons                        |
| ----------------------------------------------- | ----------------------------------------------------------- | --------------------------- |
| A. DOM mode also sets `aria-current="location"` | Screen readers announce the current section; small additive | Not in v6                   |
| B. Classes only, as v6                          | Pure v6                                                     | Active state is visual only |

Recommendation: **A**.

### Q5 — CSS Grid component shape (High)

| Option                                                                                                   | Pros                                                                                               | Cons                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. New `BGrid` + `BGridItem`                                                                             | Clear mapping to `.grid` / `g-col-*`; container-query semantics stay separate from `BRow` / `BCol` | Two new components                                                                                                                                |
| B. `BRow grid` prop; `BCol` injects it and emits `g-col-*` / `g-start-*` instead of `col-*` / `offset-*` | No new components                                                                                  | Same prop means viewport or container depending on the parent; `offset` vs `start` semantics differ; `BRow` gutter / `alignH` props become no-ops |
| C. Docs only (`class="grid"`, `class="g-col-6 md:g-col-4"`)                                              | Zero API                                                                                           | Loses `Responsive<T>` consistency; the plan lists `BGrid` as a deferred component                                                                 |

Recommendation: **A**.

### Q6 — `BGrid` sizing props (Medium)

Context: `columns` / `rows` / `gap` can be inline CSS variables (any value; nested grids inherit) or utilities (`grid-cols-*` only 1/2/3/4/6 and viewport-based; `gap-*` on the spacing scale, viewport-based).

| Option                                                                                            | Pros                                                       | Cons                                                                                                               |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| A. CSS variables: `columns` / `rows` (`Numberish`), `gap` (CSS string); `flow` as `Responsive<…>` | Matches the v6 CSS Grid docs; any value; inheritance works | `gap` isn't on the spacing scale and isn't responsive                                                              |
| B. Utilities: `columns: Responsive<1\|2\|3\|4\|6\|'subgrid'>`, `gap: Responsive<GutterNumbers>`   | Responsive and on the spacing scale, like `BRow` gutters   | Limited column counts; viewport-based while items are container-based; `grid-cols-*` doesn't update `--bs-columns` |
| C. A plus a `Responsive` `gap` through `gap-*` classes                                            | Both                                                       | Two ways to set the gap                                                                                            |

Recommendation: **A** (users can still add `md:gap-3` or `grid-cols-*` as classes).

### Q7 — Public container-query helper (Medium)

| Option                                                                           | Pros                                     | Cons                                                                               |
| -------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------- |
| A. Docs only (`.contains-inline`, shared docs sentence on container-based props) | No API; v6-native; works on any ancestor | Users must read the docs to know a wrapper is needed                               |
| B. `contained` / `queryContainer` prop on `BContainer`, `BRow`, `BCol`, `BCard`  | Discoverable                             | Just renames a class; cannot help the component that needs it (can't query itself) |
| C. `useContainerBreakpoint(el)` composable (ResizeObserver + `breakpointWidths`) | JS access to container breakpoints       | No library consumer; trivial with `useElementSize`; another public API to maintain |

Recommendation: **A**.

### Q8 — Expose any CSS-only helper as a prop (Low)

| Option                                                    | Pros                                 | Cons                                                  |
| --------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------- |
| A. None; docs only                                        | No API growth; classes fall through  | Less discoverable                                     |
| B. `hoverLift` on `BCard` (and maybe `BButton` / `BLink`) | Discoverable for the most common use | Renames one class; sets a precedent for every utility |

Recommendation: **A**.

## Decisions

Answered by the maintainer on 2026-11-03. Where an answer differs from the proposal above, the answer wins.

- **Q5 — A.** New `BGrid` + `BGridItem`.
- **Q6 — A** (accepted with Q5). `BGrid` `columns` / `rows` / `gap` as inline `--bs-*` variables plus a responsive `flow`; `BGridItem` `cols` / `start` / `fill` as `Responsive<T>` objects. Docs state that `md:g-col-*` follows the grid's width while `BCol` and utilities follow the viewport.
- **Q1 — A. Links only, as v6.** Sections come from the target nav's links; the heading-based mode is removed. The docs "On this page" sidebar (`apps/docs/.vitepress/theme/Layout.vue`) must render its nav first and spy on it.
- **Q2 — C. Remove `vBScrollspy`**; `useScrollspy` is the only API.
- Q3, Q4, Q7, Q8: _Pending._

## Implementation split

Each PR stacks on `bootstrap-v6-foundations` (or `bootstrap-v6` after #164 merges) and runs the required checks in `BOOTSTRAP_V6_MIGRATION.md`.

1. **`BGrid` / `BGridItem`** (independent, small): components, types, exports, specs, `gridSystem.data.ts`, docs section and demos.
2. **`useScrollspy` rebuild:** composable port, types, specs, `useScrollspy.md` + demos, docs `Layout.vue` update, `types.md`.
3. **`vBScrollspy`:** new orientation, effect scope, value-change re-bind, `activate` event, specs, `BScrollspy.md` + demo, playground `TScrollspy.vue`. Can merge with 2 if small. Menu parent activation is verified once G2 lands.
4. **Docs: container queries and CSS-only helpers:** container-queries page or section, shared sentence wired into `listGroup.data.ts`, `table.data.ts`, navbar and grid data; hover-lift / color-scheme / motion / space / divide notes; fix `Layout.vue` `992px` → `1024px`. Land after G3 / G5 settle their container-based props.
5. **Migration notes** (Phase 3): `usescrollspy` / `vbscrollspy` notes, new `BGrid`.
