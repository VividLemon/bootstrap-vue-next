---
name: bootstrap-vue-to-bootstrap-vue-next-migration
description: Migrate a Vue 2 + BootstrapVue (bootstrap-vue, Bootstrap 4) codebase to Vue 3 + BootstrapVueNext (bootstrap-vue-next, Bootstrap 5). Use when a project imports bootstrap-vue, uses b-* components, $bvModal/$bvToast, v-b-* directives or Bootstrap 4 classes and needs upgrading, or when asked what changed between BootstrapVue and BootstrapVueNext.
---

# BootstrapVue → BootstrapVueNext migration

**Scope:** BootstrapVue (Vue 2, Bootstrap 4) → BootstrapVueNext **v1** (Vue 3, Bootstrap 5). This skill does not cover
upgrading an existing BootstrapVueNext app to a newer major version; that is a separate skill set.

BootstrapVueNext is a **rewrite** for Vue 3 + Bootstrap 5, not a drop-in upgrade. Most component names survive, but
setup, registration, programmatic APIs, many props/slots/events, and Bootstrap's own classes change.

Facts here were taken from source at pinned commits: BootstrapVue `9a246f45` (v2.23.1) and BootstrapVueNext
`07767892` (v1.2.2), then re-verified against the published packages bootstrap-vue 2.23.1 and bootstrap-vue-next
1.2.4 (tag `bootstrapvuenext-v1.2.4`, Nov 2026). If the project targets a much newer bootstrap-vue-next, re-check
anything that fails.

## Files in this skill

| Need | Read |
|---|---|
| Install, `BApp`/`createBootstrap`, registration, Nuxt, CSS, deps | `references/setup-and-dependencies.md` |
| Which components/aliases/directives were removed, renamed or added; `$bvModal`/`$bvToast` replacements | `references/component-map.md` |
| Per-component recipe (props, slots, events, examples) | `references/upstream-guide/components/<name>.md` (index: `references/upstream-guide/README.md`) |
| Cross-cutting patterns (`.sync`, show/hide → v-model, `*-html` props → slots, aliases, native events) | `references/upstream-guide/patterns/*.md` |
| Old props/slots/events with no same-named counterpart, per component (⚠ = not in guide) | `references/api-surface-diff.md` |
| **Errors in the upstream guide + unresolved areas** (overrides the guide) | `references/guide-corrections-and-gaps.md` |
| **Changes that break silently and are not in the guide** (event payloads, units, `$refs` methods, slot scopes, defaults, TS types) | `references/silent-behaviour-changes.md` |
| Bootstrap 4 → 5 class renames in your own templates/CSS | `references/bootstrap4-to-5-classes.md` |
| Find every legacy usage in a project | `scripts/scan-legacy-usage.mjs` (rules: `assets/legacy-patterns.json`) |
| Starter `main.ts`, `App.vue`, `vite.config.ts` | `templates/*.template` |

Load reference files only when needed; the per-component files are long.

## Workflow

### 1. Inventory (before editing anything)

```bash
node <skill-dir>/scripts/scan-legacy-usage.mjs <project-dir> --summary      # counts per rule
node <skill-dir>/scripts/scan-legacy-usage.mjs <project-dir> > bv-hits.txt  # file:line:col [rule] … (see ref)
node <skill-dir>/scripts/scan-legacy-usage.mjs <project-dir> --category=component,alias,api,setup
```

Categories: `setup`, `api`, `vue3`, `component`, `alias`, `directive`, `prop`, `event`, `slot`, `bootstrap5`, `review`.
The scanner is regex-based: every hit is a place to look, not a guaranteed rewrite. It does not see props passed via
`v-bind="obj"` or render functions, and it cannot find every per-component prop change — use `api-surface-diff.md` for
each component the project uses.

Also list which BootstrapVue components the project uses (`grep -rhoE '<(b-[a-z-]+|B[A-Z][A-Za-z]+)' src | sort | uniq -c`)
so you only read the guide files you need.

### 2. Platform first: Vue 3 + Bootstrap 5

The component migration only works on Vue 3 and Bootstrap 5.3+. Do the Vue 3 migration (`createApp`, `v-model`
`value`/`input` → `modelValue`/`update:modelValue`, `.sync` → `v-model:prop`, `slot-scope` → `#slot="scope"`,
`.native` removed, no `$on` event bus, filters removed) alongside this one. Swap Bootstrap 4 → 5 CSS.

### 3. Setup (always required)

1. Dependencies: remove `bootstrap-vue` (and `popper.js`, `portal-vue` if only BV used them); add `bootstrap@^5.3`,
   `bootstrap-vue-next`. Nuxt: `@bootstrap-vue-next/nuxt`.
2. CSS: `bootstrap/dist/css/bootstrap.css` + `bootstrap-vue-next/dist/bootstrap-vue-next.css`
   (drop `bootstrap-vue/dist/bootstrap-vue.css`).
3. **Wrap the app in `<BApp>`** in `App.vue`. Without it, modals/toasts/popovers created from code and other services
   do not work. The legacy alternative is `app.use(createBootstrap())` **plus a `<BOrchestrator />` rendered once in
   the root template** — the plugin alone provides the registries, but `useModal/useToast/usePopover().create()` throw
   "BApp component must be mounted" until an orchestrator is rendered. Former `Vue.use(BootstrapVue, config)` defaults → `<BApp :defaults>`
   or `createBootstrap({components: {...}})`.
4. Registration: there is no global "register everything" plugin. Use `unplugin-vue-components` +
   `BootstrapVueNextResolver` (closest to old behaviour; `aliases` option keeps `<b-btn>` etc. working), or explicit
   imports from `bootstrap-vue-next`.
5. Icons: BootstrapVue icons are not shipped. Replace `<b-icon-*>`/`<BIcon*>` with `unplugin-icons` (e.g. `<IBiCheck />`)
   or `bootstrap-icons`.

Templates for steps 3–4 are in `templates/`.

### 4. Global API rewrites

- `this.$bvModal.show(id)` → `useModal().show(id)`; `this.$bvModal.hide(id)` → `useModal().hide(undefined, id)`.
  The signature is `hide(trigger?, id?)` — **`hide(id)` passes the id as the trigger and closes the topmost modal
  instead.** A template ref `.show()` / `.hide()` also works.
- `this.$bvModal.msgBoxOk/msgBoxConfirm` → `await useModal().create({body, title, okOnly, okTitle, cancelTitle}).show()`;
  the result object has `ok`.
- `this.$bvToast.toast(msg, opts)` → `useToast().create({body: msg, title, variant, position, modelValue: ms}).show()`
  (`modelValue` number = auto-hide delay in ms). `this.$bvToast.hide(id)` → `useToast().hide(undefined, id)`.
- `$root.$emit/$on('bv::…')` → composables (`useModal`, `useToggle`, `useToast`), component events, or `v-model`.
- **Composables must be called in a descendant of `<BApp>`, never in the component that renders `<BApp>`.** Call
  `useModal()` / `useToast()` during `setup` and keep the returned functions; do not call them inside event handlers.
- Options-API components: call the composable in `setup()` and expose it, or convert to `<script setup>`.

### 5. Component-level changes (per component the project uses)

For each component found in step 1:

1. Check `component-map.md` — removed/renamed? (e.g. `BSidebar` → `BOffcanvas`, `BButtonClose` → `BCloseButton`,
   `BCardSubTitle` → `BCardSubtitle`, `BJumbotron`/`BMedia`/`BEmbed`/`BInputGroupAppend|Prepend` → plain Bootstrap 5 markup,
   `BSkeleton*` → `BPlaceholder*`, `BToaster` → `BApp` + `useToast`).
2. Read `upstream-guide/components/<name>.md`, then its row in `api-surface-diff.md`, then
   `guide-corrections-and-gaps.md` for anything that contradicts the guide, then search
   `silent-behaviour-changes.md` for the component name (payloads, slot scopes, defaults, `$refs` methods).
3. Apply the cross-cutting rules below.

Cross-cutting rules (verified across many components):

- **Visibility via v-model.** `visible` + `.sync` / `@change` → `v-model` (`model-value`) on BCollapse, BModal, BOffcanvas,
  BToast, BDropdown, BPopover, BTooltip. `visible`/`show` still set initial state only.
- **`hide-*` → `no-*`** (`hide-footer` → `no-footer`, `hide-header-close` → `no-header-close`, `hide-backdrop` → `no-backdrop`,
  `hide-ellipsis` → `no-ellipsis`, `hide-goto-end-buttons` → `no-goto-end-buttons`); BCollapse
  `appear` → `initial-animation`; `no-enforce-focus` → `no-trap`; `*-sr-only` → `*-visually-hidden`.
- **`html` / `*-html` props removed** → use the matching slot (`title-html` → `#title`, `ok-title-html` → `#ok`, …).
  Table in `upstream-guide/patterns/v-html-props.md`.
- **left/right → start/end** in props and values (`BDropdown right` → `placement="bottom-end"`,
  `dropup/dropleft/dropright` → `placement`, `BSidebar right` → `BOffcanvas placement="end"`, `rounded="left"` → `rounded-start`).
- **`dismiss` → `close`** naming (BAlert `#dismiss` → `#close`, `dismiss-label` → `close-label`). BAlert
  `@dismissed` → **`@hidden`** (fires after any hide, including countdown expiry) or `@close` (close button only).
  There is **no `closed` event** — the upstream guide is wrong here, and an `@closed` listener silently never fires.
- **Modal slots lose the `modal-` prefix** (`#modal-footer` → `#footer`, `#modal-title` → `#title`, `#modal-ok` → `#ok`, …).
- **Form inputs:** `trim`/`lazy`/`number` props → `v-model.trim` / `.lazy` / `.number`; `no-wheel` → `@wheel.prevent`;
  BFormCheckbox `checked` → `v-model`.
- **Form `@input` / `@change` / `@update` no longer deliver the value.** They are not component events any more: the
  listener falls through to the DOM and receives a native `Event` (or never fires, e.g. on BPagination, BFormRating,
  BFormTags). Rewrite to `@update:model-value` on every form control and on BPagination.
- **BAlert countdown is milliseconds:** `:show="10"` (10 s) → `:model-value="10000"`; `@dismiss-count-down` (seconds)
  → `@close-countdown` (ms).
- **`$refs` method calls:** BCarousel `setSlide()` → `slideTo()`, `start()` → `resume()`; BFormInput `select()` and the
  validity methods → `ref.element.select()`; BTabs `nextTab()` etc. and several `focus()` helpers are gone. Full table in
  `silent-behaviour-changes.md` §3.
- **`align="left|right"`** on BPagination and BCard, and BFormGroup `label-align*`, must become `start` / `end`.
- **BTabs:** `v-model` is now the active tab **id**; use `v-model:index` for the index. `activate-tab` gets one object payload.
- **BTable:** biggest change — `sort-by` is an array of `{key, order}`, `sort-desc`/`sort-changed` gone (`update:sort-by`),
  selection/expansion via `selection.*` / `expansion.*` exposed APIs, provider context changed. Rewrite by hand from
  `upstream-guide/components/btable.md`; test each table.
- **BButton `block`** → wrap in `<div class="d-grid">`.
- **Aliases** (`b-btn`, `b-dd-*`, `b-checkbox`, `b-select`, `b-nav-item-dd`, …) are not registered → rename
  (full table in `component-map.md`) or configure resolver `aliases`. Exception: `BInput` / `<b-input>` is still
  exported (same component as `BFormInput`) and keeps working.
- **Router-link props** `append`, `exact`, `exact-path`, `exact-path-active-class`, `event` are gone from every
  link-capable component (BLink, BButton, BBadge, BAvatar, BNavItem, BDropdownItem, BListGroupItem, BBreadcrumbItem,
  BNavbarBrand) — Vue Router 4 removed them. See `upstream-guide/components/blink.md`.
- **`html-field`** is gone from BFormSelect, BFormSelectOptionGroup, BFormCheckboxGroup, BFormRadioGroup and
  BFormDatalist options handling — render HTML through the option slots instead.
- **Directives:** `v-b-hover` → VueUse `useElementHover`; `v-b-visible` → VueUse `useElementVisibility`; `v-b-tooltip`,
  `v-b-popover`, `v-b-modal`, `v-b-toggle`, `v-b-scrollspy` still exist (import `vBTooltip` etc.) but check modifiers.

### 6. Bootstrap 5 classes

Fix your own markup/CSS with `bootstrap4-to-5-classes.md` (`ml-`/`mr-` → `ms-`/`me-`, `float/text-left|right` → `start|end`,
`sr-only` → `visually-hidden`, `badge-*` → `text-bg-*`, `form-row`/`form-group`/`custom-*` removed, `no-gutters` → `g-0`, …).
`scan-legacy-usage.mjs --category=bootstrap5` lists them.

### 7. Verify

1. Re-run the scanner; remaining hits should be intentional (e.g. `review` items you checked).
2. Type-check (`vue-tsc --noEmit`) and build — unknown props on BootstrapVueNext components surface as type errors.
3. Run the app and tests; watch the console for Vue warnings (`Failed to resolve component`, `injection … not found`
   → missing `<BApp>` or import).
4. Visually check: grids/gutters, forms, modals, dropdown placement, toasts, tables, date/time inputs.
5. Exercise behaviour, not just rendering — type-checking does not catch the items in `silent-behaviour-changes.md`:
   type into inputs and tick checkboxes that had `@input`/`@change` handlers, let timed alerts expire, and trigger
   every code path that calls a component method through a ref.

## Rules for the migrating agent

- Do not "fix" date/time pickers (`BFormDatepicker`, `BCalendar`, `BFormTimepicker`, `BTime`) automatically — there is no
  stable equivalent. Flag them to the user with options (experimental `BDatePicker`/`BTimeField`, a third-party picker,
  or native `<input type="date|time">`).
- Prefer `guide-corrections-and-gaps.md` over `upstream-guide/` when they conflict.
- An ⚠ in `api-surface-diff.md` means "unknown — look it up", not "removed". Check the component docs at
  `https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/<name>` before deleting a prop.
- Keep changes reviewable: migrate setup first, then one component family at a time, building after each.
- Report to the user: what was migrated, what was flagged as unresolved, and which visual checks remain.
