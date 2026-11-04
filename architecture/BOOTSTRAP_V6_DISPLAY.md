# Bootstrap v6 Display Components (G5)

## Summary

Research for the display group of the v6 new-components migration: Accordion, Avatar, Carousel, Stepper, Prose. Read-only; no code changed.

| Component | Approach                                                                                                                                 | Size of change                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Accordion | Redesign on native `<details>` / `<summary>`. No `BCollapse`, no Bootstrap JS. Exclusivity through the native `name` attribute           | Rewrite of both components; most `BCollapse`-derived props go       |
| Avatar    | Redesign on v6 `.avatar` / `.avatar-img` / `.avatar-status` / `.avatar-stack`. Delete the library `_avatar.scss`                         | Rewrite; `b-avatar*` classes, rounding and inline sizing go         |
| Carousel  | Redesign on v6 scroll-snap markup. Reimplement `carousel.ts` behavior in Vue (do not wrap Bootstrap's class). Remove `<TransitionGroup>` | Full rewrite; props map to v6 options (`autoplay`, `ends`, `pause`) |
| Stepper   | New: `BStepper` + `BStepperItem` (CSS only in v6)                                                                                        | New, small                                                          |
| Prose     | Recommend docs only (`.prose` / `.not-prose` classes); no component                                                                      | Docs only                                                           |

No new third-party dependency. `useCarousel` is not worth a public API (Q7). One foundation change is needed: `useCssTransition` cannot see the accordion's `::details-content` transition (see Cross-group dependencies).

## Sources read

- `AGENTS.md`, `architecture/BOOTSTRAP_V6_NEW_COMPONENTS.md`, `architecture/BOOTSTRAP_V6_MIGRATION.md` (cross-cutting decisions; Deferred components → BAccordion, BCarousel, BAvatar), `architecture/ARIA_VISIBILITY.md`.
- Foundations (this checkout): `src/composables/useShowHide.ts`, `useCssTransition.ts`, `useThemeClasses.ts` (`resolvePartColor`, `useThemeClasses` → `.theme-*`), `components/BCollapse/BCollapse.vue`.
- `bootstrap-v6-feedback` (#167): `BBadge.vue`, `types/BadgeTypes.ts` (`BadgeVariant = 'subtle' | 'outline'`, `BadgeSize = 'md' | 'lg'`).
- Current library: `components/BAccordion/*`, `components/BAvatar/*` (incl. `_avatar.scss`), `components/BCarousel/*`, `types/ComponentProps.ts` / `ComponentEmits.ts` / `ComponentSlots.ts`, `utils/keys.ts` (`accordionInjectionKey`, `avatarGroupInjectionKey`, `carouselInjectionKey`), `utils/classes.ts` (`BvCarouselEvent`), `styles/styles.scss`, `types/BootstrapVueOptions.ts`, `package.json` (peer deps, export map).
- Docs: `apps/docs/src/data/components/{accordion,avatar,carousel}.data.ts`, `apps/docs/src/docs/components/{accordion,avatar,carousel}.md` and their demos (3 accordion, 19 avatar, 17 carousel), `apps/playground/src/components/Comps/{TAccordion,TAvatar,TCarousel}.vue`.
- Bootstrap 6.0.0-alpha.1: `scss/_accordion.scss`, `_avatar.scss`, `_carousel.scss`, `_stepper.scss`, `content/_prose.scss`, `js/src/carousel.ts`, `dist/css/bootstrap.css` (every class / variable below checked there).
- v6 docs pages: `/docs/6.0/components/accordion/`, `/avatar/`, `/carousel/`, `/stepper/`, `/content/prose/`.
- Archived experiments (ideas only, not decisions): `refs/archive/bootstrap-v6-baccordion` (`e2c91c54`: `<details>` item, `open` model, `independent` / `gap` / `size` / `name` props), `refs/archive/bootstrap-v6-avatar` (`7ff01397`: `img`, `status`, `statusLabel`, `subtle`, `variant` props; group `size` only), `refs/archive/bootstrap-v6-badge` (`0eca653d`).

---

## Accordion

### v6 overview

- Markup is native `<details class="accordion-item">` with `<summary class="accordion-header">` and a sibling `<div class="accordion-body">`. The chevron is an inline `<svg class="accordion-icon">` (replaceable). There is **no** `.accordion-button`, `.accordion-collapse` or `.collapse` in v6 accordion CSS, and no accordion JS.
- Exclusive ("one open") behavior is the native `name` attribute: `<details>` sharing a `name` close each other, also when `open` is set from script. Omitting `name` = "always open".
- Open state is `[open]`. Styling: `.accordion-item[open]` (z-index, border), `[open] > .accordion-header` (active color/bg, rotated icon).
- Animation: `.accordion-item::details-content` transitions `content-visibility, block-size` (`--bs-accordion-panel-transition-property/-duration/-timing`, `.2s ease`, `transition-behavior: allow-discrete`) with `interpolate-size: allow-keywords` under `prefers-reduced-motion: no-preference`. Browsers without `interpolate-size` open and close at once. There is no `accordion-instant` class.
- Modifiers on `.accordion`: `.accordion-flush`, `.accordion-sm`, `.accordion-gap` (`--bs-accordion-gap`), `.theme-{color}` (open items use `--bs-theme-*`).
- Events: native `toggle` (`ToggleEvent` with `oldState` / `newState`), fired asynchronously after the change, not cancelable. Programmatic control is the `open` property.
- A11y per v6 docs: no ARIA needed; `<summary>` is focusable, Enter/Space toggle, AT announces expanded state. The browser also opens a closed `<details>` for find-in-page and fragment navigation.

### Current library

- `BAccordion`: `div.accordion`, provides state to items; two linked models (`v-model` of item ids, `v-model:index` of positions) synced through DOM-position sorting of registered items; `free` switches single/multi.
- `BAccordionItem`: `div.accordion-item` → `BCollapse` (`.accordion-collapse`) with a `header` slot rendering `<h2 class="accordion-header"><button class="accordion-button" :class="{collapsed}">`. Inherits all show/hide behavior, events and the show/hide registry (so `v-b-toggle` / `useToggle(id)` can drive an item).
- Already done in #164: native transitions through `BCollapse`; `BAccordionItem.noTransition`. Pending per migration plan: v5 `collapsed` class on the button, part attrs, `initialAnimation` naming, `BAccordion.noTransition`.

### Disposition: `BAccordion` props / models

| Prop               | Disposition           | Notes                                                                                                 |
| ------------------ | --------------------- | ----------------------------------------------------------------------------------------------------- |
| `flush`            | keep (v6 equivalent)  | `.accordion-flush`                                                                                    |
| `free`             | keep (small additive) | Omits the generated `name` on items (v6 "always open"). Name kept: no v6 prop exists (Q2)             |
| `id`               | keep                  | Also seeds the generated `name`                                                                       |
| `index` (model)    | remove                | Q2. Removes the DOM-position sorting machinery                                                        |
| `initialAnimation` | remove                | `open` is rendered (and SSR'd) as an attribute; animating on mount is not v6 behavior                 |
| `lazy`             | Q3                    | Recommend keep as item-inherited default                                                              |
| `modelValue`       | keep (Q2)             | Open item ids: `string \| undefined` (exclusive) or `string[]` (`free`)                               |
| `unmountLazy`      | remove (Q3)           |                                                                                                       |
| new `gap`          | add (v6)              | `.accordion-gap`                                                                                      |
| new `size`         | add (v6)              | `'sm' \| 'md'`, `sm` → `.accordion-sm` (mirrors `BadgeSize`)                                          |
| new `theme`        | add (v6)              | `ThemeProp \| null` → `.theme-*` via `useThemeClasses`; colors open items                             |
| new `noTransition` | add (convention)      | Inline token reset, see Implementation notes                                                          |
| new `name`         | add (small additive)  | Override the generated group name (e.g. to group items across two `BAccordion`s). Low value; optional |

### Disposition: `BAccordionItem` props

| Prop                         | Disposition                     | Notes                                                                      |
| ---------------------------- | ------------------------------- | -------------------------------------------------------------------------- |
| `bodyAttrs`                  | keep                            | `.accordion-body`                                                          |
| `bodyClass`                  | remove → `bodyAttrs`            | Part attrs rule                                                            |
| `buttonAttrs`                | replace → `headerAttrs`         | The `<summary>` is both header and button                                  |
| `buttonClass`                | remove → `headerAttrs`          |                                                                            |
| `collapseClass`              | remove                          | No collapse element                                                        |
| `headerAttrs`                | keep, retargeted to `<summary>` |                                                                            |
| `headerClass`                | remove → `headerAttrs`          |                                                                            |
| `headerTag`                  | remove                          | Heading semantics inside `<summary>` are not reliably exposed; v6 has none |
| `horizontal`, `isNav`, `tag` | remove                          | `BCollapse` leftovers; root is always `<details>`                          |
| `id`                         | keep                            | `<details id>`; key in the parent model                                    |
| `lazy`                       | Q3                              |                                                                            |
| `modelValue`                 | keep                            | Boolean `open`                                                             |
| `noTransition`               | keep                            |                                                                            |
| `show`, `visible`            | remove                          | `ShowHideProps`; use `v-model` / initial `true`                            |
| `title`                      | keep                            | Text in `<summary>`                                                        |
| `unmountLazy`                | remove (Q3)                     |                                                                            |
| `wrapperAttrs`               | remove                          | Root is the `<details>`; plain attrs fall through (`inheritAttrs: true`)   |

Slots: `title` keep; `default` keep (body); new `icon` (replaces the default `<svg class="accordion-icon">`). `BAccordion` `default` keep.

Emits (`BAccordionItemEmits = BCollapseEmits`): see Q1. Recommended: `update:modelValue` and `toggle` (native `ToggleEvent`); remove `show`, `shown`, `hide`, `hidden`, `show-prevented`, `hide-prevented`, `toggle-prevented`. `BAccordion` emits `update:modelValue` only (`update:index` removed).

Exposed: today none on `BAccordionItem` (the `BCollapse` inside exposes `show/hide/toggle`, not reachable). Proposed: none; `v-model` is the control.

### Proposed markup

```html
<div id="acc" class="accordion accordion-sm theme-primary">
  <details id="acc-item-1" class="accordion-item" name="acc" open>
    <summary class="accordion-header">
      Title
      <svg
        class="accordion-icon"
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m2 5 6 6 6-6" />
      </svg>
    </summary>
    <div class="accordion-body">…</div>
  </details>
</div>
```

`aria-hidden="true"` on the icon is an addition (v6 docs omit it, the SVG has no title).

### State model

- Item `open` is bound from Vue (`:open="isOpen"`) and read back from the native `toggle` event (`details.open`), which covers clicks, keyboard, find-in-page, fragment navigation and `name` exclusivity closing siblings. `toggle` is the single source of truth for user-driven changes.
- Exclusive mode: items get `name` = accordion id (or `name` prop). Setting `open` on one item makes the browser close the others; their `toggle` events update the parent model. The parent also writes the model directly so it never shows two ids.
- `free` mode: no `name`; model is an array.
- Item outside a `BAccordion`: plain `<details>` with its own `v-model`.

### A11y

Native: `<summary>` focusable, Enter/Space, expanded state announced, no `aria-expanded` / `aria-controls` / `aria-labelledby` needed (remove the current ones). Docs must say headings inside the title are not exposed as headings, and that `lazy` content cannot be found by find-in-page.

### SSR

- Server renders `open` and `name` attributes; no browser API at setup. `useId` keeps `id` / `name` stable for hydration.
- If an exclusive model holds an id for a non-first item, SSR output still has one `[open]`; no mismatch.
- The `toggle` listener only fires on the client.

### Transition core

- `noTransition` (accordion or item): inline `--bs-accordion-panel-transition-duration: 0s`, `--bs-accordion-transition-duration: 0s`, `--bs-accordion-btn-icon-transition: none`. The `transition-none` utility does not reach `::details-content`, and v6 has no `accordion-instant` class. Tokens are declared on `.accordion` only, so an inline value on the item inherits into its pseudo-element.
- Only needed if Q1 = B or Q3 keeps `unmountLazy`: `useCssTransition` must await the `::details-content` transition. `el.getAnimations()` returns only the element's own animations; pseudo-element transitions appear with `getAnimations({subtree: true})` filtered on `effect.target === el && effect.pseudoElement === '::details-content'`. Add an option such as `useCssTransition(el, {pseudoElement: '::details-content'})`.

### Composables

None. The show/hide registry (`useToggle`, `v-b-toggle`) no longer reaches accordion items under Q1 = A; document `v-model` instead.

---

## Avatar

### v6 overview (CSS only)

- `.avatar` (`span`): `inline-flex`, `--bs-avatar-size` (2.5rem), font size `calc(size * .4)`, uppercase, radius `--bs-avatar-border-radius` (50%), colors `var(--bs-theme-contrast/bg, --bs-avatar-*)`.
- `.avatar-img` inside (or standalone, then honors its own width/height).
- `.avatar-subtle` (uses `--bs-theme-fg` / `--bs-theme-bg-subtle`); `.theme-*` for color.
- Sizes `.avatar-xs|sm|lg|xl` (1.5 / 2 / 3 / 4 rem); custom via `--bs-avatar-size`.
- Status: `<span class="avatar-status status-online|offline|busy|away" role="img" aria-label="Online">`.
- Stack: `.avatar-stack` (`inline-flex; flex-direction: row-reverse`), children get a border, negative `margin-left: calc(size * --bs-avatar-stack-spacing)` (−.3), hover lift; `:last-child` has no margin. Stack sizes `.avatar-stack-xs|sm|lg|xl > .avatar`. "+N" overflow is a manual `.avatar.theme-secondary`.
- No badge, link, button, square or rounding feature.

### Current library

`BAvatar` renders `.b-avatar` as `span` / `button.btn` / `BLink`, with nested `.b-avatar-img|text|custom` spans, a default person icon, inline width/height/font-size for numeric sizes, `rounded*` utility classes, and a positioned `BBadge` (`badgeColor` done in "now"). `BAvatarGroup` renders `.b-avatar-group > .b-avatar-group-inner`, providing size, square, rounding, colors and overlap to children (inline margins). `_avatar.scss` (156 lines) styles all of it.

### Disposition: `BAvatar`

| Prop / group                                                                                                                                                                                                                                               | Disposition           | Notes                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `alt`                                                                                                                                                                                                                                                      | keep                  | `<img alt>`; default stays `'avatar'`                                                                                                                    |
| `src`                                                                                                                                                                                                                                                      | keep (small additive) | Renders `<img class="avatar-img">`                                                                                                                       |
| `text`                                                                                                                                                                                                                                                     | keep (small additive) | Initials; fallback when the image fails                                                                                                                  |
| `size`                                                                                                                                                                                                                                                     | keep, retyped         | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` → class; any other string/number → inline `--bs-avatar-size`                                                      |
| `theme`                                                                                                                                                                                                                                                    | keep                  | Default changes `'secondary'` → `null` (v6 neutral `--bs-bg-2`)                                                                                          |
| `bg`, `fg`                                                                                                                                                                                                                                                 | keep                  | Root color props stay flat (cross-cutting rule); note `bg-*` overrides the token look                                                                    |
| new `variant`                                                                                                                                                                                                                                              | add (v6)              | `'subtle' \| null` → `.avatar-subtle`; mirrors `BBadge.variant` from #167                                                                                |
| new `status`, `statusLabel`                                                                                                                                                                                                                                | add (v6)              | `'online' \| 'offline' \| 'busy' \| 'away'`; label defaults to the capitalized status (i18n via label)                                                   |
| `badge`, `badgeColor`, `badgePlacement`, `badgePill`, `badgeDotIndicator`                                                                                                                                                                                  | Q4                    | v6 replaced the dot badge with `status`. Recommend remove; keep a `badge` slot only                                                                      |
| `button`, `buttonType`, link props (`active`, `activeClass`, `disabled`, `exactActiveClass`, `href`, `noRel`, `opacity`, `prefetch*`, `noPrefetch`, `prefetchedClass`, `rel`, `replace`, `routerComponentName`, `stretched`, `target`, `to`, `underline*`) | Q4                    | Recommend keep link (`href`/`to`) and `button` as small additive, drop decoration props                                                                  |
| `rounded`, `roundedTop`, `roundedBottom`, `roundedStart`, `roundedEnd`, `square`                                                                                                                                                                           | remove                | Utilities round `.avatar` but `.avatar-img` follows `--bs-avatar-border-radius`, so corners would mismatch. Docs: `style="--bs-avatar-border-radius: …"` |

Emits: `click` keep only with Q4 = A/B (link/button); `img-error` keep (drives the fallback). Slots: `default` keep (custom content, e.g. an icon); `badge` per Q4; new `status` slot not needed.

### Disposition: `BAvatarGroup`

| Prop                 | Disposition           | Notes                                                                                                                                                              |
| -------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `size`               | keep                  | Literal → `.avatar-stack-{size}`; custom → injected to children (an inline variable on the stack does not reach children, `.avatar` redeclares `--bs-avatar-size`) |
| `overlap`            | keep (small additive) | Inline `--bs-avatar-stack-spacing: -{overlap}` on each avatar (also redeclared on `.avatar`). Default `0.3` = v6                                                   |
| `tag`                | keep                  |                                                                                                                                                                    |
| `theme`, `bg`, `fg`  | remove                | `class="theme-primary"` on the stack already colors children (`--bs-theme-*` inherit); `bg`/`fg` would color the container, not avatars                            |
| `square`, `rounded*` | remove                | As on `BAvatar`                                                                                                                                                    |

Markup: `<div class="avatar-stack avatar-stack-lg" role="group">` with avatars as direct children (the `.b-avatar-group-inner` wrapper goes; v6 needs `.avatar` as flex children). `role="group"` stays; docs recommend an `aria-label`.

### Proposed markup

```html
<span class="avatar avatar-lg avatar-subtle theme-primary">
  <img class="avatar-img" src="…" alt="mdo" />
  <span class="avatar-status status-online" role="img" aria-label="Online"></span>
</span>
<!-- link avatar (Q4 = A): .avatar on the <a> itself -->
<a class="avatar" href="/u/mdo"><img class="avatar-img" src="…" alt="mdo" /></a>
```

Content priority: default slot → `src` image (falls back on `error`) → `text` → empty. The default person icon is dropped (not in v6).

### A11y

- Image needs `alt`; status gets `role="img"` + `aria-label` (from `statusLabel`).
- A link/button avatar needs an accessible name (image `alt` or `aria-label`); the v6 hover lift in stacks is visual only.
- `.avatar-stack` is `row-reverse`: DOM order and visual order differ (first DOM child is drawn right-most). Document it; reading order stays DOM order.

### SSR

Pure render; image fallback state starts from `src` on both sides. No browser APIs.

### Implementation notes

- Delete `src/components/BAvatar/_avatar.scss` and its `meta.load-css` line in `styles.scss`. This also removes `$b-avatar-*` Sass variables (migration note).
- Why keeping links matters: wrapping `<BAvatar>` in `<BLink>` breaks stacks, because each avatar becomes its `<a>`'s `:last-child` (margin reset) and the flex children are the links, not `.avatar`.
- `avatarGroupInjectionKey` shrinks to `{size, overlap}`.

---

## Carousel

### v6 overview

- Engine is CSS scroll-snap: `.carousel` (flex column, `--bs-carousel-gap`) > `.carousel-inner` (horizontal scroller, `scroll-snap-type: x mandatory`, hidden scrollbar, smooth scroll unless reduced motion) > `.carousel-item` (`flex-basis` from `--bs-carousel-items`, `--bs-carousel-items-gap`; `--bs-carousel-items-peek` pads the viewport).
- Layout classes: `.carousel-center` (snap center), `.carousel-auto` (variable width), `.carousel-fade` (grid stack, `.active` fades over `--bs-carousel-fade-duration/-timing`), `.carousel-overlay` + `.carousel-overlay-controls` (classic overlay bar). Default (no overlay) is a "stacked" layout: the user places controls above or below the slides.
- Controls are ordinary buttons (`.btn-icon.btn-sm`) holding `.carousel-icon-prev|next|pause|play` mask icons; play/pause is `.carousel-control-play-pause` (`.paused` toggles the glyph). Indicators: `.carousel-indicators [data-bs-target]` buttons, `.active` + `aria-current="true"`, `aria-label="Slide N"`. While autoplay runs the root has `.carousel-playing` and `--bs-carousel-interval`, and the active indicator fills like a progress bar.
- Removed v5 classes: `.carousel-control-prev/next(-icon)`, `.carousel-caption`, `.carousel-dark`, `.slide`, `.carousel-item-next/prev/start/end`, `.pointer-event` (all absent from `bootstrap.css`; `slide` still appears in doc markup but has no CSS).
- JS (`carousel.ts`) options: `autoplay` (false), `ends` (`'loop'` default \| `'wrap'` \| `'stop'`), `interval` (5000, per item `data-bs-interval`), `keyboard` (true), `pause` (`'hover'` \| `false`). Methods: `next`, `prev`, `to(i)`, `cycle`, `pause`, `nextWhenVisible`. Events `slide` (cancelable; `direction`, `relatedTarget`, `from`, `to`) and `slid`.
- Behavior worth porting: IntersectionObserver picks the active slide (left-most near-fully visible, 0.05 tolerance); JS-stepped `scrollLeft` animation (300 ms, ease-in-out cubic, snap suspended) instead of `scrollBy({behavior:'smooth'})` (Safari zoom bug); `ends: 'loop'` clones a slide for a seamless wrap (single-item, no peek/center/auto, no reduced motion; else falls back to wrap); `ends: 'stop'` disables prev/next at the scroll extents and moves focus off a control it disables; autoplay stops for good on any interaction (control, keyboard, pointerdown on the track, pause button) per WCAG 2.2.2, pauses on hover, skips ticks while the page or carousel is hidden; RTL-aware.

### Current library

`BCarousel` renders v5 markup (`.carousel.slide.pointer-event`, `.carousel-control-prev/next`, indicators on top), slides through `<TransitionGroup>` with `v-show`, swipe via `useSwipe`, autoplay via `useIntervalFn`, keyboard via `onKeyStroke`. `BCarouselSlide` renders `.carousel-item` with a `BImg`, a `.carousel-caption`, and a hard-coded grey background. Slides are counted from slot vnodes (`getSlotElements`).

### Decision: reimplement in Vue, do not wrap Bootstrap's class

- `bootstrap/js/src/carousel.ts` registers `document` / `window` listeners at module load (data API): not SSR-safe as an import and not tree-shakable.
- It owns the DOM (`classList` toggles on items and indicators, `disabled` on controls, `cloneNode` of slides) and would fight Vue's rendering of `.active`, `aria-current`, `disabled`.
- The library does not import Bootstrap JS anywhere today; `bootstrap` is a peer dependency for CSS.
- Port the algorithm into an internal composable (`useCarouselEngine`, not exported), reusing `@vueuse/core` (already a peer): `useIntersectionObserver`, `useDocumentVisibility`, `usePreferredReducedMotion`, `useElementHover`. Credit `carousel.ts` (MIT) in the source.
- The loop clone stays a transient `cloneNode` (`aria-hidden`, `inert`, ids stripped) appended/prepended inside `.carousel-inner` and removed in the same frame as the teleport. Vue never sees it; navigation is ignored while it exists, so Vue cannot patch the list meanwhile.

### Disposition: `BCarousel` props

| Prop                                   | Disposition           | Notes                                                                                                               |
| -------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `background`                           | remove                | v4 leftover inline background                                                                                       |
| `controls`                             | keep                  | Renders the default prev/next buttons (Q5 decides the layout)                                                       |
| `controlsNextText`, `controlsPrevText` | keep                  | Visually hidden labels                                                                                              |
| `fade`                                 | keep (v6)             | `.carousel-fade`                                                                                                    |
| `id`                                   | keep                  | Also `data-bs-target="#id"` on indicators (v6 CSS selects `[data-bs-target]`)                                       |
| `imgHeight`, `imgWidth`                | remove                | With the slide `img*` props (Q6)                                                                                    |
| `indicators`                           | keep                  |                                                                                                                     |
| `indicatorsButtonLabel`                | keep                  | Becomes 1-based (`Slide 1`) as v6; today it is 0-based                                                              |
| `labelIndicators`                      | keep (small additive) | `aria-label` on the indicator group                                                                                 |
| `interval`                             | keep (v6)             |                                                                                                                     |
| `keyboard`                             | keep (v6)             |                                                                                                                     |
| `modelValue`                           | keep                  | Active index; updated when the active slide settles (also on user swipe)                                            |
| `noTransition`                         | keep (convention)     | Scroll: instant jump. Fade: inline `--bs-carousel-fade-duration: 0s`. No v6 `-instant` class                        |
| `noHoverPause`                         | replace → `pause`     | `pause: 'hover' \| false` (v6 option), default `'hover'`                                                            |
| `noTouch`                              | remove                | Native scroll owns touch; no v6 switch                                                                              |
| `noWrap`                               | replace → `ends`      | `'loop' \| 'wrap' \| 'stop'`, default `'loop'`                                                                      |
| `ride`                                 | replace → `autoplay`  | Boolean. v5 "start after first interaction" (`ride: true`) has no v6 equivalent                                     |
| `rideReverse`                          | remove                | No v6 equivalent                                                                                                    |
| `touchThreshold`                       | remove                | No swipe threshold with scroll-snap                                                                                 |
| new `overlay`                          | add (v6)              | `.carousel-overlay` + `.carousel-overlay-controls` bar                                                              |
| new `center`, `auto`                   | add (v6)              | `.carousel-center`, `.carousel-auto`                                                                                |
| new `playPause`                        | add (v6)              | Renders `.carousel-control-play-pause` (recommended with `autoplay`, WCAG 2.2.2); labels `playLabel` / `pauseLabel` |
| items / gap / peek                     | no props              | CSS variables: `:style="{'--bs-carousel-items': 3, '--bs-carousel-items-gap': '1rem'}"` (docs)                      |

### `BCarouselSlide`

| Prop                                                                                  | Disposition | Notes                                                                                 |
| ------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------- |
| `background`                                                                          | remove      |                                                                                       |
| `caption`, `captionTag`, `text`, `textTag`, `contentTag`, `contentVisibleUp`          | remove      | `.carousel-caption` is gone; content goes in the slot                                 |
| `id`                                                                                  | keep        |                                                                                       |
| `imgAlt`, `imgSrc`, `imgSrcset`, `imgWidth`, `imgHeight`, `imgBlank`, `imgBlankColor` | Q6          | Recommend keep `imgSrc`, `imgSrcset`, `imgAlt`, drop the rest                         |
| `interval`                                                                            | keep (v6)   | Per-item `data-bs-interval`; drop the `'requestAnimationFrame'` literal from the type |

Slots: `default` keep, `img` keep (Q6 = A) or remove (Q6 = B), `caption` / `text` remove.

### Emits, slots, exposed

| Item                               | Disposition                                                                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `slide`                            | keep, now **cancelable** (v6). `BvCarouselEvent` keeps `from`, `to`, `direction`, `relatedTarget`                     |
| `slid`                             | keep. In scroll mode fires when the observer settles; a multi-slide jump may emit intermediate `slid` (v6)            |
| `prev-click`, `next-click`         | remove (cancel through `slide`)                                                                                       |
| `update:modelValue`                | keep                                                                                                                  |
| slot `default`                     | keep (slides)                                                                                                         |
| new slot `controls`                | Replaces the default bar. Props `{prev, next, to, cycle, pause, togglePlay, playing, index, count, canPrev, canNext}` |
| new slots `prev-icon`, `next-icon` | optional; low value, can wait                                                                                         |
| exposed `next`, `prev`, `pause`    | keep                                                                                                                  |
| exposed `resume`                   | rename → `cycle` (v6)                                                                                                 |
| exposed `slideTo`                  | rename → `to` (v6)                                                                                                    |
| new exposed                        | `nextWhenVisible`, `playing` (readonly ref)                                                                           |

`slide` is emitted only for navigation the component starts (controls, keyboard, indicators, `to`, autoplay, model change), not for free scrolling by the user, as in v6. A prevented `slide` caused by a `v-model` change reverts the model.

### Proposed markup (default, `controls` + `indicators`, stacked)

```html
<div id="c1" class="carousel" role="region" aria-roledescription="carousel" aria-label="…">
  <div class="carousel-inner" aria-live="polite">
    <div
      id="c1-s0"
      class="carousel-item active"
      role="group"
      aria-roledescription="slide"
      aria-label="1 of 3"
    >
      …
    </div>
    <div class="carousel-item" role="group" aria-roledescription="slide" aria-label="2 of 3">…</div>
  </div>
  <div class="d-flex justify-content-between align-items-center">
    <div class="carousel-indicators" aria-label="Select a slide to display">
      <button
        type="button"
        data-bs-target="#c1"
        class="active"
        aria-current="true"
        aria-label="Slide 1"
      ></button>
      …
    </div>
    <div>
      <button type="button" class="btn-icon btn-sm carousel-control-play-pause" aria-label="Pause">
        <!-- playPause only -->
        <span class="carousel-icon-pause" aria-hidden="true"></span
        ><span class="carousel-icon-play" aria-hidden="true"></span>
      </button>
      <button type="button" class="btn-icon btn-sm">
        <span class="carousel-icon-prev" aria-hidden="true"></span
        ><span class="visually-hidden">Previous</span>
      </button>
      <button type="button" class="btn-icon btn-sm">
        <span class="carousel-icon-next" aria-hidden="true"></span
        ><span class="visually-hidden">Next</span>
      </button>
    </div>
  </div>
</div>
```

With `overlay`: root adds `.carousel-overlay`, the bar becomes `.carousel-overlay-controls` and the buttons add `btn-subtle theme-secondary` (as the v6 example). Root gets `.carousel-playing` and `--bs-carousel-interval` while autoplay runs.

### A11y

- v6 adds only indicator labels, control labels and the play/pause button. The WAI-ARIA carousel pattern items (`role="region"` + `aria-roledescription="carousel"` + label on the root; `role="group"` + `aria-roledescription="slide"` + "N of M" on slides; `aria-live` `off` while autoplaying, `polite` otherwise) are a library addition (Q8).
- Keyboard: ArrowLeft/ArrowRight on the root (RTL-aware), ignored in inputs/textareas; stops autoplay. The scroller gets `tabindex="0"` so it is keyboard-scrollable (axe `scrollable-region-focusable`) and so `ends: 'stop'` can move focus there.
- Autoplay: stops permanently on interaction; `playPause` documented as required for WCAG 2.2.2 when `autoplay` is on. Reduced motion: instant scroll, loop → wrap, no progress fill (CSS).
- Fade mode: non-active slides are `visibility: hidden` (not focusable). Scroll mode: off-screen slides stay focusable; tabbing scrolls them in and the observer updates the active index (v6 behavior).

### SSR

- Slide count for indicators and "N of M" labels comes from slot vnodes (`getSlotElements`), as today, so server and client agree. Slides register with the parent to learn their index (sorted by DOM position on the client, `sortSlotElementsByPosition`).
- `.active` on the `modelValue` slide is rendered on the server. On mount (client only) the scroller jumps to that slide without animation.
- IntersectionObserver, `matchMedia`, `requestAnimationFrame`, `document.visibilityState` only in `onMounted` / handlers, through `getSafeWindow()` / `getSafeDocument()` or VueUse. Autoplay timers start on mount only.

### Transition core

Not `useShowHide`: a carousel is not show/hide. Fade mode toggles `.active`; `useCssTransition` can await the item's opacity transition to time `slid` in fade mode. Scroll mode times `slid` from the observer and the JS scroll animation. `<TransitionGroup>` and all v5 direction classes are removed.

### Composables

`useCarousel` (public): not recommended (Q7). The exposed methods plus the `controls` slot props cover programmatic control; an id-based controller (like `useModal`) adds a registry for little gain. Keep the engine internal.

---

## Stepper

### v6 overview (CSS only)

- `<ol class="stepper">` > `<li class="stepper-item">`. Numbers come from a CSS counter (`::before`), connectors from `::after`. Vertical by default (grid rows).
- `.active` marks every completed step **and** the current one (examples mark the first N items). The connector after the last active item stays neutral (`:has` rule). Per-item `.theme-*` recolors the active circle/track.
- Horizontal: `.stepper-horizontal`, or container-query prefix classes `sm:` / `md:` / `lg:` / `xl:stepper-horizontal` (only these exist in `bootstrap.css`; no `2xl:`). They need a query container ancestor (`.contains-inline`, or `.stepper-overflow`, which sets `container-type: inline-size` and scrolls horizontally).
- The v6 docs mention `.stepper-vertical`, but it does not exist in the CSS (vertical is the default).
- Interactive variant: `<div class="stepper">` with `<a role="button" class="stepper-item">` or `<button>` items.
- Tokens: `--bs-stepper-size`, `-gap`, `-font-size`, `-text-gap`, `-track-size`, `-bg`, `-active-color`, `-active-bg`.
- No ARIA guidance in v6 beyond `role="button"` on links.

### Proposed API (Q9 = A)

`BStepper`

| Prop         | Type                    | Notes                                                                                                 |
| ------------ | ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `modelValue` | `number \| undefined`   | Current step (0-based). Items with index ≤ value get `.active`; the current one `aria-current="step"` |
| `horizontal` | `boolean \| Breakpoint` | `true` → `.stepper-horizontal`; `'md'` → `md:stepper-horizontal` (needs a container, see below)       |
| `overflow`   | `boolean`               | Wraps in `<div class="stepper-overflow">` (also a query container)                                    |
| `tag`        | `string`                | `'ol'`; `'div'` for interactive items                                                                 |

`BStepperItem`

| Prop                   | Type                   | Notes                                                                                                                                        |
| ---------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `active`               | `boolean \| undefined` | Overrides the parent-derived state                                                                                                           |
| `current`              | `boolean \| undefined` | Overrides `aria-current="step"`                                                                                                              |
| `theme`                | `ThemeProp \| null`    | `.theme-*`                                                                                                                                   |
| `tag`                  | `string`               | `'li'`                                                                                                                                       |
| `href`, `to`, `button` | link / button          | Optional interactive item (BLink or `<button type="button">`); clicking an item does not change `modelValue` unless the user handles `click` |

Slots: `BStepper` `default`; `BStepperItem` `default`. Emits: `BStepperItem` `click` when interactive. `BStepper` never changes the step itself, so `modelValue` can be a plain prop (`step`) instead of a model; implementation choice.

`horizontal` with a breakpoint emits a prefix class that only works inside a container. Options: document "wrap in `.contains-inline` or use `overflow`", or render the wrapper automatically. Recommend documenting, and following G6's container-query helper decision.

Markup:

```html
<ol class="stepper md:stepper-horizontal">
  <li class="stepper-item active">Create account</li>
  <li class="stepper-item active" aria-current="step">Confirm email</li>
  <li class="stepper-item">Finish</li>
</ol>
```

A11y: list semantics carry count and position; `aria-current="step"` marks the current step (addition). Completed vs. upcoming is visual only in v6; docs suggest visually hidden "Completed" text in the slot if needed.

SSR: item index comes from registration order during setup (deterministic for static and `v-for` lists); the client re-sorts by DOM position after reorders. No browser APIs.

Exports: `components/BStepper/` (`BStepper`, `BStepperItem`), `BootstrapVueOptions` entries, `ComponentProps` / `ComponentSlots` / `ComponentEmits`, `stepperInjectionKey` in `utils/keys.ts`, docs `stepper.data.ts` + page.

---

## Prose

v6: `.prose` (layer `content`) sets font size / line height (larger from 1024 px viewport width), flex column with `--bs-content-gap`, `max-width: 1000px`, `margin-inline: auto`, and spacing/typography for headings, lists, `hr`, links without classes, images, blockquotes, tables without classes, `dt`. `.not-prose` opts a subtree out (a `.prose` inside `.not-prose` does not work). Tokens: `--bs-content-font-size`, `--bs-content-line-height`, `--bs-content-gap`, `--bs-heading-color`. No JS.

Recommendation (Q10): docs only. A `BProse` would only add a class and a `tag` (rule 3: Vue already does this). Add a docs page or a section under "Styling" showing `<article class="prose" v-html="…">` and `.not-prose` around library components (e.g. a `BCard` inside prose content).

---

## Cross-group dependencies

| Item                                      | Direction  | Detail                                                                                                                                                                                |
| ----------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useCssTransition` pseudo-element support | G5 → #164  | Needed only if Accordion keeps `shown`/`hidden` or `unmountLazy` (Q1 = B or Q3 = B). Add `{pseudoElement}` option                                                                     |
| Show/hide registry                        | G5 → all   | Under Q1 = A accordion items leave the registry (`v-b-toggle` / `useToggle` stop working on them). Note for whoever owns `useToggle` docs                                             |
| `BCollapse` usage                         | G5         | `BAccordionItem` stops rendering `BCollapse`; nothing else in G5 depends on Collapse. The `collapsed` class issue disappears with it                                                  |
| Badge (#167)                              | G5 ← #167  | `BAvatar.variant: 'subtle'` mirrors `BBadge.variant`; `BAccordion.size` mirrors `BadgeSize`. If Q4 keeps a badge, it uses #167's `BBadge`                                             |
| `.btn-icon` on `BButton`                  | G5 ↔ G1–G4 | Carousel controls render plain `<button class="btn-icon btn-sm">`. When `BButton` gets a `.btn-icon` prop (migration plan "Deferred features"), the carousel can switch; not required |
| Container queries                         | G5 ← G6    | `BStepper` responsive `horizontal` needs a query container; follow G6's container-query helper decision                                                                               |
| `Breakpoint` prefix props                 | G5 ↔ G3    | `BStepper.horizontal: boolean \| Breakpoint` follows the same pattern as Navbar `toggleable` / Drawer `responsive`; keep them consistent                                              |
| `BvCarouselEvent`                         | G5         | Stays in `utils/classes.ts`; becomes cancelable for `slide`. No other group uses it                                                                                                   |

## Questions for the maintainer

### Q1 (High) — Accordion item events: native or show/hide?

Context: v6 accordion is a native `<details>`; its only event is the native, non-cancelable `toggle`, and the browser also opens/closes items itself (find-in-page, fragment links, `name` exclusivity). Today items emit the full show/hide set through `BCollapse` and sit in the show/hide registry.

- **A. Native only.** `v-model` (open) + `toggle` (native `ToggleEvent`). Remove `show/shown/hide/hidden/*-prevented`. Pro: exactly v6, simplest, always consistent with browser-driven changes. Con: no cancelable hide, no `shown` after animation; items leave the registry (`v-b-toggle`, `useToggle`).
- **B. Keep `useShowHide`.** Intercept `<summary>` clicks (`preventDefault`), run the cancelable flow, drive `open`; sync browser-driven changes from `toggle` without the cancelable events. Pro: keeps events and registry. Con: two event paths (browser-driven changes can't be prevented), needs pseudo-element support in `useCssTransition`, more code contrary to rule 1.
- **C. Native + non-cancelable `shown`/`hidden` only.** Pro: lets users react after the animation. Con: still needs the pseudo-element transition wait; half an API.

Recommendation: **A**.

### Q2 (Medium) — `BAccordion` v-model shape

Context: today two linked models (`v-model` ids and `v-model:index`), synced by sorting items by DOM position; `free` switches string ↔ array.

- **A.** Keep `v-model` of ids only (`string \| undefined`, or `string[]` with `free`); remove `v-model:index`; keep the name `free`. Pro: removes the sorting/sync code; ids are stable. Con: breaking for `index` users.
- **B.** Keep both models. Pro: no break. Con: keeps the most complex code in the component for a convenience.
- **C.** Like A but rename `free` → `alwaysOpen` (v6 docs wording). Pro: matches v6 docs. Con: extra rename with no behavior change.

Recommendation: **A**.

### Q3 (Medium) — Accordion `lazy` / `unmountLazy`

Context: v6 always renders the body (hidden by `content-visibility`), so find-in-page can open items. `lazy` defers heavy content; `unmountLazy` needs to know when the close animation ended (pseudo-element wait).

- **A.** Remove both. Pro: pure v6. Con: heavy bodies always render.
- **B.** Keep `lazy` only (render on first open, keep after); remove `unmountLazy`. Pro: one small additive, no transition wait. Con: lazy bodies are invisible to find-in-page (document it).
- **C.** Keep both. Con: needs the `useCssTransition` change and `toggle`/transition timing.

Recommendation: **B**.

### Q4 (High) — `BAvatar` additives beyond v6 (link/button, badge)

Context: v6 avatars are non-interactive and have no badge (status replaces the dot badge). Wrapping an avatar in `BLink` breaks `.avatar-stack` (each avatar becomes its link's `:last-child`).

- **A.** Keep `href`/`to` (render `.avatar` on the `BLink`) and `button` (+`buttonType`, `disabled`, `click`); drop link decoration props (`opacity`, `underline*`, `stretched`, `prefetch*`…). Remove `badge*` props, keep a `badge` slot (positioned `BBadge` by the user). Pro: interactive avatars keep working in stacks; small surface. Con: still beyond v6.
- **B.** As A, and keep `badge` / `badgeColor` / `badgePlacement` props. Pro: less breakage. Con: duplicates `status`, larger API.
- **C.** Pure v6: no link, button or badge. Pro: smallest. Con: link avatars in stacks become impossible without custom CSS.

Recommendation: **A**.

### Q5 (Medium) — Carousel default controls layout

Context: v6 has no fixed control position; examples show a bar above or below the slides, or the overlay bar. The current component puts prev/next over the slides (v5).

- **A.** `controls` / `indicators` / `playPause` render one bar **below** the slides (indicators start, buttons end); `overlay` turns it into `.carousel-overlay-controls`; a `controls` slot replaces the bar entirely. Pro: one predictable default, full escape hatch. Con: v5 users get controls below unless they set `overlay`.
- **B.** Same, default `overlay: true`. Pro: closest to the old look. Con: v6's default (unmodified `.carousel`) is stacked.
- **C.** Add `controlsPlacement: 'top' \| 'bottom'` too. Pro: covers v6's "top controls" example. Con: more props; the slot already covers it.

Recommendation: **A**.

### Q6 (Low) — `BCarouselSlide` image props

Context: v6 slides are any content; images are `<img class="d-block w-100">` written by the user.

- **A.** Keep `imgSrc`, `imgSrcset`, `imgAlt` and the `img` slot; remove `imgWidth`, `imgHeight`, `imgBlank`, `imgBlankColor` (and the carousel-level `imgWidth`/`imgHeight`). Pro: common case stays one line. Con: still an additive.
- **B.** Remove all `img*` props; content via default slot only. Pro: pure v6. Con: every slide needs an `<img>`.

Recommendation: **A**.

### Q7 (Low) — Public `useCarousel`

- **A.** No public composable; template-ref methods (`next`, `prev`, `to`, `cycle`, `pause`, `playing`) and `controls` slot props. Pro: no new API. Con: external controls need a template ref.
- **B.** `useCarousel(id)` controller through a registry (like `useModal`). Pro: control from anywhere. Con: registry, docs, tests for a rare need.

Recommendation: **A**.

### Q8 (Medium) — Carousel ARIA beyond v6

Context: v6 adds no `role` / `aria-roledescription` / live region. The WAI-ARIA carousel pattern recommends them.

- **A.** Add them by default (root `role="region"` + `aria-roledescription="carousel"`; slides `role="group"` + `aria-roledescription="slide"` + "N of M"; `aria-live` `off` while autoplaying, `polite` otherwise). Labels configurable (`slideLabel` formatter / i18n). Pro: accessible out of the box. Con: diverges from v6 markup; more i18n strings.
- **B.** Match v6 (only indicator/control labels); document the pattern. Pro: identical to v6. Con: weaker a11y than the current component's `aria-describedby` / `aria-owns` wiring.

Recommendation: **A**.

### Q9 (Medium) — Stepper API

- **A.** `BStepper` (`v-model` current index, `horizontal: boolean \| Breakpoint`, `overflow`, `tag`) + `BStepperItem` (`active` / `current` overrides, `theme`, `tag`, optional link/button). Pro: wizard-friendly; overrides cover v6's non-contiguous active example. Con: index registration code.
- **B.** `BStepper` + `BStepperItem` with per-item `active` / `current` only (no parent model). Pro: trivial, no registration. Con: users compute `:active="i <= step"` themselves.
- **C.** No component; docs only. Pro: nothing to maintain. Con: users write `stepper-item` markup by hand.

Recommendation: **A**.

### Q10 (Low) — Prose

- **A.** Docs only (`.prose` / `.not-prose` classes). Pro: rule 3; zero code. Con: none of note.
- **B.** `BProse` (`tag`, `notProse`?). Pro: discoverable in the component list. Con: a component that only adds a class.

Recommendation: **A**.

## Decisions

Answered by the maintainer on 2026-11-03. Where an answer differs from the proposal above, the answer wins.

- **Q1 — A. Native only.** `BAccordionItem` state syncs from the native `toggle` event into `v-model`; `show` / `shown` / `hide` / `hidden` / `*-prevented` are removed and items leave the show/hide registry (`v-b-toggle` / `useToggle` no longer target them). No `pseudoElement` option is needed in `useCssTransition` unless Q3 = C.
- **Q4 — C. Pure v6 avatar.** No `href` / `to` / `button` and no badge props or slot; `BAvatar` renders v6 `.avatar` / `.avatar-img` / `.avatar-status` only (plus the v6 status additions). Users compose links, buttons and badges themselves; docs must note that wrapping an avatar in a link breaks `.avatar-stack`.
- Q2, Q3, Q5–Q10: _Pending._

## Implementation split

Each PR follows the batch agent instructions and required checks in `BOOTSTRAP_V6_MIGRATION.md` (lint, unit tests, build; docs type-check), updates specs, `*.data.ts`, docs pages/demos and playground, and touches `ComponentProps.ts` line-locally.

1. **Avatar** (needs #167 merged for `BBadge`). `BAvatar` / `BAvatarGroup` rewrite, delete `_avatar.scss` + its `styles.scss` line, new `AvatarStatus` type, `avatarGroupInjectionKey` shrink, `avatar.data.ts`, `avatar.md` (19 demos → about 10), `TAvatar.vue`. Smallest; good warm-up.
2. **Accordion** (needs #164). `<details>` rewrite of both components, `accordionInjectionKey` reshape, delete `index` model code; `accordion.data.ts`, `accordion.md` (+ `gap`, `size`, `theme`, `icon` slot demos), `TAccordion.vue`, `ARIA_VISIBILITY.md` (drop BAccordionItem from the native-path table and the `collapsed` note). Includes the `useCssTransition` pseudo-element option only if Q1 = B or Q3 = C.
3. **Stepper** (independent; after G6 for the container note). New `BStepper` / `BStepperItem`, keys, types, `BootstrapVueOptions`, `stepper.data.ts`, docs page, playground page.
4. **Carousel** (largest; independent of 1–3). Internal engine composable (observer, JS scroll animation, loop clone, autoplay/pause/visibility, ends, keyboard, RTL), `BCarousel` / `BCarouselSlide` rewrite, cancelable `BvCarouselEvent`, remove `TransitionGroup` path; `carousel.data.ts`, `carousel.md` (17 demos rewritten: ride/touch demos go; ends, overlay, multi-item, peek, center, auto, play/pause demos added), `TCarousel.vue`. Update `ARIA_VISIBILITY.md` (BCarousel no longer uses Vue `<Transition>`). Specs need IntersectionObserver / `scrollTo` / `matchMedia` stubs in happy-dom.
5. **Prose** docs (any time): docs section only.

Migration notes to collect per PR (the plan says batch agents do not write `migration-data` pages; list them in the PR description): accordion markup and event changes, removed `index` model; avatar class rename `b-avatar*` → `avatar*`, rounding removal, `$b-avatar-*` variables gone, default theme `null`; carousel option renames (`ride` → `autoplay`, `noWrap` → `ends`, `noHoverPause` → `pause`, `resume` → `cycle`, `slideTo` → `to`), captions removed, 1-based indicator labels, `slide` cancelable.
