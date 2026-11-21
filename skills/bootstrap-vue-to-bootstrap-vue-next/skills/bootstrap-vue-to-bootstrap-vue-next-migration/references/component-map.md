# Component, alias and directive map

Source: export lists diffed between BootstrapVue `src/components/*/package.json` meta (commit `9a246f45`, v2.23.1) and
BootstrapVueNext `packages/bootstrap-vue-next/src/components/**/index.ts` + `src/directives/index.ts` (commit `07767892`, v1.2.2;
re-verified against v1.2.4 and the published bootstrap-vue 2.23.1 package).
Status column: **verified** = checked against the export lists; **guide** = taken from the upstream migration guide.

## Components that are gone or renamed

| BootstrapVue | BootstrapVueNext | Status | Notes / guide file |
|---|---|---|---|
| `BSidebar` | `BOffcanvas` | verified | `right` → `placement="end"`; `no-slide` → `no-animation`; `no-enforce-focus` → `no-trap`; `bg-variant`/`text-variant` → utility classes. `upstream-guide/components/bsidebar.md` |
| `BButtonClose` (`BBtnClose`) | `BCloseButton` | verified | `content`, `text-variant` removed (Bootstrap 5 SVG close icon). `bbuttonclose.md` |
| `BCardSubTitle` | `BCardSubtitle` | verified | Lower-case **t**. Props become `text`, `tag`, `text-variant`. On `BCard`/`BCardBody`, `sub-title*` props → `subtitle*`. Not in the upstream guide. |
| `BJumbotron` | — | verified | Removed by Bootstrap 5. Use utilities: `<div class="p-5 mb-4 bg-body-tertiary rounded-3">`. `bjumbotron.md` |
| `BMedia`, `BMediaAside`, `BMediaBody` | — | verified | Use flex utilities (`d-flex` / `flex-shrink-0` / `flex-grow-1 ms-3`). `bmedia.md` |
| `BEmbed` | — | verified | Use Bootstrap 5 `.ratio .ratio-16x9` (or `BAspect`). `bembed.md` |
| `BImgLazy`, `BCardImgLazy` | `BImg lazy` / `BCardImg lazy` | verified | Native `loading="lazy"`. `bimglazy.md`, `bcardimglazy.md` |
| `BInputGroupAppend`, `BInputGroupPrepend`, `BInputGroupAddon` | — | verified | Put children directly inside `BInputGroup`, or use its `append`/`prepend` props or slots. `BInputGroupText` is only for text. `binputgroup.md` |
| `BPaginationNav` | — | verified | Not implemented. Use `BPagination` + router, or plain links. `bpaginationnav.md` |
| `BToaster` | `<BApp>` + `useToast()` (or `<BOrchestrator>`) | verified | Named toasters are gone; position via `useToast().create({ position })` / Teleport. `btoaster.md`, `btoast.md` |
| `BSkeleton`, `BSkeletonWrapper`, `BSkeletonTable`, `BSkeletonImg`, `BSkeletonIcon` | `BPlaceholder`, `BPlaceholderWrapper`, `BPlaceholderTable`, `BPlaceholderCard`, `BPlaceholderButton` | verified | Different props; wrapper uses `loading` prop + `loading` slot. `bskeleton.md` |
| `BFormDatepicker`, `BCalendar` | (experimental `BDatePicker`, `BDateField`, `BDateRangePicker`, `BDateRangeField`) | verified exports; mapping **unresolved** | Upstream marks these "placeholder — not a finalized recipe". Different API. Migrate manually or keep a 3rd-party picker. |
| `BFormTimepicker`, `BTime` | (experimental `BTimeField`, `BTimeRangeField`) | verified exports; mapping **unresolved** | Segmented-field model; `hour12`, `show-seconds`, step and label props differ. Migrate manually. |
| `BFormRow` | `BFormRow` (still exported, deprecated) | verified | **The upstream guide wrongly says it does not exist.** It renders `<div class="row d-flex flex-wrap">` — Bootstrap 5 gutters, not BS4 `.form-row` tight gutters. Prefer `<BRow class="g-2">`; check spacing visually. |
| `BIcon*`, `BIconstack` (icons plugin) | — | verified | Not shipped. Use `unplugin-icons` (`<IBiCheck />`) or `bootstrap-icons`. Site page: /docs/icons |

## Aliases (not registered by BootstrapVueNext)

BootstrapVueNext registers only canonical names (the one exception is `BInput`, below). Rename the tag, or keep the alias with
`BootstrapVueNextResolver({ aliases: { BBtn: 'BButton' } })` (unplugin-vue-components). Kebab-case (`<b-button>`) still works.
This table is generated from the old library's metadata and is **more complete than the upstream `component-aliases.md`**
(see `guide-corrections-and-gaps.md`).

| Old alias (Pascal / kebab) | Canonical BootstrapVueNext name |
|---|---|
| `BBtn` / `b-btn` | `BButton` |
| `BBtnGroup` / `b-btn-group` | `BButtonGroup` |
| `BBtnToolbar` / `b-btn-toolbar` | `BButtonToolbar` |
| `BBtnClose` / `b-btn-close` | `BCloseButton` |
| `BDd` / `b-dd` | `BDropdown` |
| `BDdItem` / `b-dd-item` | `BDropdownItem` |
| `BDropdownItemBtn`, `BDdItemButton`, `BDdItemBtn` | `BDropdownItemButton` |
| `BDdDivider` / `b-dd-divider` | `BDropdownDivider` |
| `BDdForm` / `b-dd-form` | `BDropdownForm` |
| `BDdText` / `b-dd-text` | `BDropdownText` |
| `BDdGroup` / `b-dd-group` | `BDropdownGroup` |
| `BDdHeader` / `b-dd-header` | `BDropdownHeader` |
| `BCheckbox`, `BCheck` | `BFormCheckbox` |
| `BCheckboxGroup`, `BCheckGroup` | `BFormCheckboxGroup` |
| `BRadio` | `BFormRadio` |
| `BRadioGroup` | `BFormRadioGroup` |
| `BInput` | **Still exported** — `BInput` is the same component as `BFormInput` and the resolver knows it. No rename needed (renaming to `BFormInput` is still the tidier end state). |
| `BTextarea` | `BFormTextarea` |
| `BSelect` | `BFormSelect` |
| `BSelectOption` | `BFormSelectOption` |
| `BSelectOptionGroup` | `BFormSelectOptionGroup` |
| `BFile` | `BFormFile` |
| `BRating` | `BFormRating` |
| `BSpinbutton` | `BFormSpinbutton` |
| `BTags` | `BFormTags` |
| `BTag` | `BFormTag` |
| `BDatalist` | `BFormDatalist` |
| `BDatepicker` | (no stable equivalent — see BFormDatepicker above) |
| `BTimepicker` | (no stable equivalent — see BFormTimepicker above) |
| `BNavItemDd`, `BNavDropdown`, `BNavDd` | `BNavItemDropdown` |
| `BNavToggle` | `BNavbarToggle` |

## Components that are new in BootstrapVueNext

`BApp` (required host — see setup), `BOrchestrator`, `BAccordion`, `BAccordionItem`, `BOffcanvas`, `BCloseButton`,
`BCardSubtitle`, `BFormFloatingLabel`, `BFormOtp`, `BAutocomplete`, `BPlaceholder*`, `BDatePicker`, `BDateField`,
`BDateRangePicker`, `BDateRangeField`, `BTimeField`, `BTimeRangeField`.

Everything else in BootstrapVue (BAlert, BAspect, BAvatar(Group), BBadge, BBreadcrumb(Item), BButton(Group/Toolbar), BCard*,
BCarousel(Slide), BCollapse, BContainer/BRow/BCol, BDropdown*, BForm* inputs, BImg, BInputGroup(Text), BLink, BListGroup(Item),
BModal, BNav*, BNavbar*, BOverlay, BPagination, BPopover, BProgress(Bar), BSpinner, BTable/BTableLite/BTableSimple + BTbody/BThead/BTfoot/BTr/BTd/BTh,
BTabs/BTab, BToast, BTooltip) **still exists under the same name** — but most have prop/slot/event changes. Always read
`api-surface-diff.md` and the component's `upstream-guide/components/*.md` file.

## Directives

| BootstrapVue | BootstrapVueNext | Notes |
|---|---|---|
| `v-b-modal` (`VBModal`) | `v-b-modal` (`vBModal`) | Still exists. `$root` `bv::show::modal` events are gone. |
| `v-b-toggle` (`VBToggle`) | `v-b-toggle` (`vBToggle`) | Still exists; `useComponentToggle()` composable is the programmatic alternative. |
| `v-b-tooltip` (`VBTooltip`) | `v-b-tooltip` (`vBTooltip`) | Modifiers / value object changed. `directives/v-b-tooltip.md` |
| `v-b-popover` (`VBPopover`) | `v-b-popover` (`vBPopover`) | Value object, triggers, `custom-class` → `body-class`. `directives/v-b-popover.md` |
| `v-b-scrollspy` (`VBScrollspy`) | `v-b-scrollspy` (`vBScrollspy`) | Also `useScrollspy()`. Not covered in the upstream guide — test it. |
| `v-b-hover` (`VBHover`) | — | VueUse `useElementHover()`. |
| `v-b-visible` (`VBVisible`) | — | VueUse `useElementVisibility()`. |
| — | `v-b-color-mode` (`vBColorMode`) | New. Also `useBootstrapColorMode()`. |

## Programmatic APIs

| BootstrapVue | BootstrapVueNext |
|---|---|
| `this.$bvModal.show(id)` / `.hide(id)` | `useModal().show(id)` / `.hide(undefined, id)` — signature is `hide(trigger?, id?)`, so `hide(id)` would use the id as the trigger and close the topmost modal. Or a template ref `.show()` / `.hide()` |
| `this.$bvModal.msgBoxOk(msg, opts)` | `useModal().create({ body: msg, okOnly: true, ...opts }).show()` (returns a promise) |
| `this.$bvModal.msgBoxConfirm(msg, opts)` | `const r = await useModal().create({ body: msg, ...opts }).show(); r.ok` |
| `this.$bvToast.toast(msg, opts)` | `useToast().create({ body: msg, title, variant, position, modelValue: 5000 }).show()` |
| `this.$bvToast.hide(id)` | `useToast().hide(undefined, id)` (`hide(trigger?, id?)`; without an id it hides every toast) |
| `this.$root.$emit('bv::toggle::collapse', id)` | `useComponentToggle(id).toggle()` or `v-model` on `BCollapse` |
| `this.$root.$on('bv::modal::shown', …)` | Listen on the component (`@shown`) or use composables; no global bus |

Composables exported: `useModal`, `useToast`, `usePopover`, `useComponentToggle`, `useBreadcrumb`, `useBootstrapColorMode`, `useScrollspy`,
`useSharedScrollLock`, `useRegistry`, `useProvideDefaults`, `useOrchestratorRegistry`.
**`useModal`/`useToast`/`usePopover` need `<BApp>` (or `createBootstrap` + a rendered `<BOrchestrator />`) in an ancestor
component — not in the component that calls them.** Controllers returned by `create()` stay in the orchestrator store
until destroyed: `await ctrl.destroy()`, or `await using ctrl = create({...})`.
