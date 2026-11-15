# Corrections to the upstream guide, and known unresolved areas

The files in `upstream-guide/` are a faithful, plain-markdown copy of BootstrapVueNext's own migration knowledge base
(`apps/docs/src/docs/migration-data`, commit `07767892`). They are the best single source, but they are not complete
and a few statements are wrong. **When this file disagrees with `upstream-guide/`, this file wins** — each item below was
checked against source at the pinned commits, and re-checked against bootstrap-vue-next v1.2.4 and the published
bootstrap-vue 2.23.1 package (items 9–13 were found in that second pass).

Labels: **Verified** = confirmed from exports/types/implementation. **Proposed** = plausible recipe, test it.
**Unresolved** = evidence does not settle it; do not auto-migrate.

## Verified corrections

1. **`BFormRow` does exist.** `upstream-guide/components/bform.md` says "nor is there a `BFormRow` component". It is
   exported (`components/BForm/index.ts`) and renders `<div class="row d-flex flex-wrap">`. It is not BS4's `.form-row`
   (tight 5px gutters), so layouts change visually. *Proposed:* replace with `<BRow class="g-2">` and check spacing.
2. **Alias table targets that don't exist** (`upstream-guide/patterns/component-aliases.md`):
   - `b-datepicker` → `BFormDatepicker` and `b-timepicker` → `BFormTimepicker`: neither target exists in BootstrapVueNext.
     There is no stable replacement (experimental `BDatePicker`/`BTimeField` have different APIs).
   - `b-option-group` → `BFormOptionGroup`: there is no `BFormOptionGroup`. The old alias was `b-select-option-group`
     and the target is `BFormSelectOptionGroup`.
3. **Aliases missing from the upstream table:** `b-btn-close` (→ `BCloseButton`), `b-checkbox-group` / `b-check-group`
   (→ `BFormCheckboxGroup`), `b-radio` (→ `BFormRadio`), `b-spinbutton` (→ `BFormSpinbutton`),
   `b-select-option-group` (→ `BFormSelectOptionGroup`). Full list in `component-map.md`.
4. **`BModal` `ok-title` is not removed.** The v-html table in `upstream-guide/patterns/v-html-props.md` lists
   "`BModal` | `ok-title` | `ok`". `ok-title` (plain string) still exists; the removed prop is **`ok-title-html`** → `ok` slot.
5. **`BToast` `href` / `to` are not removed.** `upstream-guide/components/btoast.md` lists them under "Removed props".
   `BToastProps extends Omit<BLinkProps, 'routerTag'>` (`types/ComponentProps.ts`), so `href`, `to`, `target`, etc. exist.
6. **`BCardSubTitle` was renamed `BCardSubtitle`** (and its `sub-title`, `sub-title-tag`, `sub-title-text-variant` props
   became `text`, `tag`, `text-variant`; on `BCard`/`BCardBody` they are `subtitle`, `subtitle-tag`, `subtitle-text-variant`).
   Not mentioned in the guide.
7. **Setup, dependencies, registration and icons are missing from the guide.** See `setup-and-dependencies.md`
   (BApp/createBootstrap is mandatory; no global component plugin; icons not shipped).
8. **Composables need a mounted `BApp` (or `createBootstrap`) ancestor.** `useModal`/`useToast`/`usePopover` fail if called in
   the same component that renders `<BApp>`. Only the BModal/BToaster guide entries mention BApp.
9. **BAlert has no `closed` event.** `upstream-guide/components/balert.md` says "`dismissed` becomes `closed`".
   `BAlertEmits` is `close`, `close-countdown`, `show`, `shown`, `hide`, `hidden`, `toggle` (+ `*-prevented`). Map
   `@dismissed` to `@hidden` (any hide, including countdown expiry) or `@close` (close button only). An `@closed`
   listener is silently ignored. The `dismiss` → `close` **slot** and `dismiss-label` → `close-label` mappings are correct.
10. **`skip-animation` and `skip-wrapper` were never BootstrapVue props.** `upstream-guide/patterns/show-hide.md` lists
    `skip-animation` → `no-animation` and `skip-wrapper` → `no-wrapper`. No component in bootstrap-vue 2.23.1 has either
    prop (they are renames from early BootstrapVueNext releases). Nothing to migrate; BCollapse's real old prop is
    `appear` → `initial-animation`.
11. **The plugin approach also needs `<BOrchestrator />`.** The guide and the upstream docs present `createBootstrap()`
    as a full alternative to `<BApp>`. The plugin only provides the registries; `create()` on `useModal`/`useToast`/
    `usePopover` throws until a `<BOrchestrator>` (which `BApp` renders for you) is mounted. See `setup-and-dependencies.md`.
12. **`hide` on `useModal`/`useToast` is `hide(trigger?, id?)`.** `this.$bvModal.hide(id)` must become
    `useModal().hide(undefined, id)`; `hide(id)` treats the id as the trigger and hides the topmost modal (for toasts:
    every toast).
13. **`BInput` is still exported.** It is the same component as `BFormInput` and is in the resolver's component list, so
    `<b-input>` / `<BInput>` keep working. The upstream alias table and earlier versions of this skill listed it as an
    unregistered alias.
14. **`BNavItemDropdown` accepts BDropdown's props and events** (`Omit<BDropdownProps, 'modelValue'>` + `BDropdownEmits`).
    `text`, `toggle-class`, `menu-class`, `no-caret`, `no-flip`, `boundary`, `lazy` and the `show`/`shown`/`hide`/`hidden`/
    `toggle` events all still work. Only `dropleft`/`dropright`/`dropup`/`right` (→ `placement`), `html` and `popper-opts` are gone.
15. **Most BTable slots survive.** `top-row`, `bottom-row`, `thead-top`, `custom-foot`, `table-busy`, `table-caption`,
    `table-colgroup`, `empty`, and `cell()`/`cell(key)`, `head()`/`head(key)`, `foot()`/`foot(key)` all exist (also on
    BTableLite, minus the provider/empty ones). The only renames are `emptyfiltered` → `empty-filtered` and
    `row-details` → `row-expansion`. Slot **scopes** did change — check `upstream-guide/components/btable.md`.
16. **`BCol` zero offsets/orders** (was listed as unresolved). Verified from `utils/getClasses.ts`: breakpoint props are
    skipped when falsy, so numeric `:offset-md="0"` / `:order-md="0"` render **no class**, while the string form
    `offset-md="0"` renders `offset-md-0`. The base props `:offset="0"` / `:order="0"` work either way. Use string
    values for zero at breakpoints.

## Known gaps in the guide (props/slots not mentioned anywhere)

`api-surface-diff.md` marks with ⚠ every BootstrapVue prop/slot that has no same-named counterpart on the target
component **and** is not mentioned in that component's guide file (≈260 items). High-traffic examples:

- `BAlert`: `dismiss-label` (→ `close-label`), `fade`; event `dismiss-count-down` (countdown now via numeric `v-model`
  + `interval`).
- `BCarousel`: `label-next`, `label-prev`, `label-goto-slide` (→ `controls-next-text`, `controls-prev-text`,
  `indicators-button-label` — *Proposed*, check docs).
- `BFormGroup`: `label-sr-only` (→ `label-visually-hidden`, verified prop exists).
- `BDropdown`: `toggle-tag`.
- Every link-capable component (`BLink`, `BButton`, `BBadge`, `BAvatar`, `BNavItem`, `BDropdownItem`, `BListGroupItem`,
  `BBreadcrumbItem`, `BNavbarBrand`): `append`, `exact`, `exact-path`, `exact-path-active-class` (and `event` on `BLink`)
  are gone. Only `blink.md` covers this.
- `html-field` on `BFormSelect`, `BFormSelectOptionGroup`, `BFormCheckboxGroup`, `BFormRadioGroup`, `BFormDatalist`
  (use the option slots).
- `BPopover`/`BTooltip`: the `disabled` **prop** (the guide covers it under "programmatic disabling": use `manual` + `v-model`).
- `BCardBody`/`BCardHeader`/`BCardFooter` used as standalone components: prefixed props (`body-bg-variant`,
  `header-tag`, `footer-text-variant`, …) → unprefixed (`bg-variant`, `tag`, `text-variant`, …). The prefixed forms
  still exist on `BCard` itself.
- `BCardHeader`/`BCardFooter`: `header`/`footer` and `*-class` props (→ `text`, class attrs).
- `BFormCheckbox(Group)`: `checked` (→ `v-model` / `model-value`; Vue 3 general change).
- `BCalendar`, `BFormDatepicker`, `BFormTimepicker`, `BTime`: almost every prop — see Unresolved.

Treat each ⚠ as "look it up in the component's docs page before rewriting", not as proof of removal.

Beyond missing props, the guide also omits several **behaviour** changes that produce no error: value payloads of form
`@input`/`@change`, BAlert countdown units, methods called through `$refs`, `left`/`right` values on more `align` props,
slot-scope renames, changed defaults, the `sort-compare` signature and TypeScript type names. Those are collected in
`silent-behaviour-changes.md`.

## Unresolved — do not auto-migrate

- **Date/time components** (`BFormDatepicker`, `BCalendar`, `BFormTimepicker`, `BTime`). Upstream marks them as
  placeholders. The new `BDatePicker`/`BDateField`/`BTimeField` are experimental with a different model (segmented
  fields, `@internationalized/date`). Differences include `hour12`, `show-seconds`, step props, label props, `context`
  events, locale/week-start/direction handling and button/popup behaviour. Default granularity and some defaults are not
  established. Recommend keeping a third-party picker or a manual rewrite with tests.
- **`BTable`** has the largest API change (sorting → `sort-by` array of `{key, order}`, selection/expansion APIs moved to
  `selection.*` / `expansion.*`, provider function signature, `primary-key`, events like `sort-changed`, `refreshed`).
  Read `upstream-guide/components/btable.md` fully and test each table; no regex rewrite is safe.
- **Directive modifiers** for `v-b-tooltip` / `v-b-popover` (placement/trigger/delay modifiers). Mapped in the guide but
  behaviour (floating-ui vs popper.js positioning) can differ visually.
- **Visual parity**: gutters, focus-trap behaviour (`no-enforce-focus` → `no-trap`), transitions (`no-fade`,
  `no-animation`), and teleport targets differ from BS4/BootstrapVue. Check the rendered UI.
