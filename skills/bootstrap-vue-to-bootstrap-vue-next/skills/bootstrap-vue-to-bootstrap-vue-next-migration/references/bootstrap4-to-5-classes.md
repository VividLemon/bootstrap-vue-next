# Bootstrap 4 → 5 changes that hit BootstrapVue apps

BootstrapVueNext cannot insulate you from Bootstrap 5 class changes in your own templates and CSS. These are the ones
that show up most in BootstrapVue apps. Authoritative list: https://getbootstrap.com/docs/5.3/migration/

General rule: **`left`/`right` → `start`/`end`** (`l`/`r` → `s`/`e`) in utilities *and* in BootstrapVueNext props/values.

| Bootstrap 4 | Bootstrap 5 |
|---|---|
| `ml-*`, `mr-*`, `pl-*`, `pr-*` (incl. `ml-auto`, `mr-n2`, breakpoints) | `ms-*`, `me-*`, `ps-*`, `pe-*` |
| `float-left`, `float-right`, `text-left`, `text-right` (+ breakpoints) | `float-start`, `float-end`, `text-start`, `text-end` |
| `border-left`, `border-right`, `rounded-left`, `rounded-right` | `border-start`, `border-end`, `rounded-start`, `rounded-end` |
| `rounded-sm`, `rounded-lg` | `rounded-1`, `rounded-3` |
| `dropdown-menu-left/right` | `dropdown-menu-start/end` |
| `sr-only`, `sr-only-focusable` | `visually-hidden`, `visually-hidden-focusable` |
| `badge-primary` … `badge-dark` | `text-bg-primary` … (BBadge `variant` prop still works) |
| `badge-pill` | `rounded-pill` (BBadge `pill` prop still works) |
| `font-weight-bold`, `font-italic`, `text-monospace` | `fw-bold`, `fst-italic`, `font-monospace` |
| `no-gutters` | `g-0` (BRow `no-gutters` prop still accepted and renders `g-0`) |
| `form-row` | `row g-2` (or `g-3`) — BS4 `form-row` had 5px gutters; spacing will differ |
| `form-group` | `mb-3` (BFormGroup still renders its wrapper; check spacing) |
| `form-inline` | grid / flex utilities (`row row-cols-lg-auto g-3 align-items-center`) |
| `custom-select` | `form-select` |
| `custom-control custom-checkbox/radio/switch` | `form-check` (+ `form-switch`) |
| `custom-file` | plain `form-control` file input |
| `custom-range` | `form-range` |
| `embed-responsive embed-responsive-16by9` | `ratio ratio-16x9` |
| `jumbotron` | utilities (`p-5 mb-4 bg-body-tertiary rounded-3`) |
| `media`, `media-body` | `d-flex`, `flex-shrink-0`, `flex-grow-1 ms-3` |
| `card-deck`, `card-columns` | grid (`row row-cols-* g-4`) / masonry |
| `close` (button class) | `btn-close` (use `BCloseButton`) |
| `data-toggle`, `data-target`, `data-dismiss` | `data-bs-*` (only relevant if you use Bootstrap's own JS) |
| `thead-light`, `thead-dark` | `table-light`, `table-dark` |
| `btn-block` (BButton `block` prop) | wrap in `<div class="d-grid">` |
| `text-hide`, `text-justify` | removed |
| `input-group-append/prepend` wrappers | not needed — place elements directly in `.input-group` |

Sass: Bootstrap 5 dropped some variables/mixins (e.g. `$enable-prefers-reduced-motion-media-query`, `make-container-max-widths`),
renamed `$custom-select-*` → `$form-select-*`, `$custom-control-*` → `$form-check-*`. If you have a custom `_variables.scss`,
diff it against Bootstrap 5's.

Color modes: Bootstrap 5.3 supports `data-bs-theme="dark"`; BootstrapVueNext exposes `useBootstrapColorMode()` and `v-b-color-mode`.
