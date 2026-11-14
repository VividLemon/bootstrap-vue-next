# Silent behaviour changes (not in the upstream guide)

Found by an independent source-level audit of the published packages **bootstrap-vue 2.23.1** and
**bootstrap-vue-next 1.2.4** (Nov 2026): prop defaults, `v-model` wiring, emitted events and payloads, slot scopes,
exposed instance methods, directive implementations, table field types and exported TypeScript types were diffed
directly, and every difference was then checked against `upstream-guide/`. This file lists only what the guide does
**not** say. Everything here compiles and renders without a warning after a mechanical migration — that is why it is
dangerous. Each item was confirmed in source on both sides unless marked *Proposed*.

Areas the audit found the guide already covers well (no additions needed): BTable row/head event payloads, field
`formatter` object argument, selection/expansion APIs and provider context; BPopover/BTooltip default placement, delay
and triggers; BToast auto-hide; BModal teleport; object-form `options`.

## 1. Form `@input` / `@change` handlers no longer receive the value

BootstrapVue form components emitted `input` and `change` **with the new value** (`@change="onChange"` got `'abc'`, `true`,
`[1, 2]`, a page number…). BootstrapVueNext declares no such component events (only `update:model-value`), so an old
listener falls through to the root element as a **native DOM listener** and receives an `Event` object — or never fires.

| Component | Old `@input` / `@change` payload | In BootstrapVueNext | Use instead |
|---|---|---|---|
| `BFormInput`, `BFormTextarea` | string (also `@update`, debounced/lazy value) | native `Event` (root is the `<input>` / `<textarea>`) | `@update:model-value="v => …"`; `@change` / `@blur` remain usable as native events (`$event.target.value`) |
| `BFormSelect` | selected value | native `Event` | `@update:model-value` |
| `BFormCheckbox`, `BFormRadio` | checked value | native `Event` (listeners are bound to the inner `<input>`) | `@update:model-value` |
| `BFormCheckboxGroup`, `BFormRadioGroup` | array / value | native `change` bubbling to the wrapper `<div>` — an `Event` | `@update:model-value` |
| `BFormRating`, `BFormTags`, `BFormSpinbutton` (`@input`) | value | not emitted | `@update:model-value` (`BFormSpinbutton` still emits `change` with the value) |
| `BFormFile` `@input` | `File` / `File[]` | not emitted | `@update:model-value`; `@change` still emits the native event |
| `BPagination` `@input` / `@change` | page number | not emitted at all | `@update:model-value`; `@page-click` keeps `(bvEvent, page)` |

Typical breakage: `@input="value = $event"` now stores an `Event`; `@change="save"` calls `save(Event)`.
Rewrite every `@input` / `@change` / `@update` on these components (scanner rule `event-form-value-payload`).

## 2. `BAlert` auto-dismiss is in milliseconds, not seconds

BootstrapVue: `:show="10"` kept the alert open for 10 **seconds** and `@dismiss-count-down` reported whole seconds left.
BootstrapVueNext: a numeric `v-model` / `model-value` is **milliseconds** (same convention as `BToast`), and
`@close-countdown` reports milliseconds remaining. A mechanical `:show="10"` → `:model-value="10"` makes the alert vanish
after 10 ms. Multiply by 1000, and divide in any countdown display (or use the built-in progress bar via
`progress-props`). The upstream component page contradicts itself on this (one paragraph says seconds); the code
(`useCountdown`, length "in ms") is authoritative.

## 3. Instance methods called through `$refs`

| Component | BootstrapVue method | BootstrapVueNext |
|---|---|---|
| `BCarousel` | `setSlide(i)` | `slideTo(i)` |
| `BCarousel` | `start()` | `resume()` (`pause()`, `next()`, `prev()` unchanged) |
| `BFormInput`, `BFormTextarea` | `select()`, `setSelectionRange()`, `setRangeText()`, `setCustomValidity()`, `checkValidity()`, `reportValidity()` | not proxied — call them on the exposed native element: `inputRef.value.element.select()`. `focus()` / `blur()` still exist |
| `BFormSpinbutton`, `BFormRating`, `BLink` | `focus()`, `blur()` | nothing exposed — focus the DOM element yourself (`ref.value.$el`) |
| `BFormSpinbutton` | `stepUp()`, `stepDown()` | not exposed — change the `v-model` |
| `BFormTags` | `addTag()`, `removeTag()`, `reset()` | not exposed on the ref (`focus`, `blur`, `element`, `inputValue` are) — use the default-slot scope (`addTag`, `removeTag`) or mutate the `v-model` |
| `BTabs` | `firstTab()`, `previousTab()`, `nextTab()`, `lastTab()` | nothing exposed — drive `v-model:index` (or `v-model` = tab id). `BTab` `activate()` / `deactivate()` still exist |
| `BDropdown`, `BNavItemDropdown` | `updatePopper()` | gone (Floating UI repositions itself). `show()` / `hide()` / `toggle()` unchanged |
| `BPagination`, `BButtonToolbar` | `focusFirst()`, `focusLast()`, `focusNext()`, `focusPrev()`, `focusCurrent()` | not exposed |
| `BModal` | `focusFirst()` | gone — use the `focus` prop |
| `BTable` | `selectRow()`, `unselectRow()`, `selectAllRows()`, `clearSelected()`, `isRowSelected()` | under `selection.*` (covered in `btable.md`); `refresh()` unchanged |

A missing method is a runtime `TypeError` only when that code path runs, so grep for these names (scanner rule
`method-renamed`).

## 4. `left` / `right` **values** that the left/right → start/end rule also applies to

The guide documents this for `BNav`, `BTabs` and `BNavbarNav` `align`. The same applies, undocumented, to:

- `BPagination` `align`: `left` (old default) / `right` → `start` / `end` (`center`, `fill` unchanged). `align="right"`
  renders the non-existent class `justify-content-right`, i.e. silently left-aligned.
- `BCard` `align`: `left` / `right` → `start` / `end` (it renders `text-${align}`; Bootstrap 5 has no `text-left`).
- `BFormGroup` `label-align` and `label-align-{sm,md,lg,xl}`: same reason.

## 5. Slot scope properties that were renamed or dropped

| Component / slot | BootstrapVue scope | BootstrapVueNext scope |
|---|---|---|
| `BCollapse` `#default` | `{visible, close}` | `{visible, hide, show, toggle, active, id}` — `close()` → `hide()` |
| `BSidebar` → `BOffcanvas` `#default`, `#header`, `#footer`, `#title` | `{right, hide, visible, …}` | `right` (boolean) → `placement` (string) |
| `BOverlay` `#overlay` | `{spinnerType, spinnerVariant, spinnerSmall}` | `{type, variant, small}` |
| `BFormFile` `#file-name` | `{files, names, filesTraversed}` | `{files, names}` |
| `BFormFile` `#drop-placeholder` | `{allowed}` | no scope |
| `BTable` / `BTableLite` `#table-colgroup` | `{columns, fields}` | `{fields}` (use `fields.length`) |
| `BTableLite` `#thead-top` | `{columns, fields, selectAllRows, clearSelected}` | `{columns, fields}` (selection helpers only on `BTable`) |
| `BTable` `#empty` / `#empty-filtered` | included `emptyHtml`, `emptyFilteredHtml` | text versions only |

(`BTable` cell-scope `toggleDetails` / `detailsShowing` → `toggleExpansion` / `expansionShowing` is already in `btable.md`.)
Destructuring a missing scope key yields `undefined` without any warning.

## 6. Defaults that changed without a guide entry

| Component / prop | BootstrapVue default | BootstrapVueNext default | Effect |
|---|---|---|---|
| `BSkeleton` → `BPlaceholder` `animation` | `'wave'` | none | Placeholders are static unless you pass `animation="wave"` or `"glow"` (the guide lists the new values, not the default change) |
| `BDropdown` / `BNavItemDropdown` `boundary` | `'scrollParent'` | `'clippingAncestors'` | Popper value names are gone: `scrollParent` → `clippingAncestors`; `window` → `document`; `viewport` unchanged; an element still works |
| `BPopover` `boundary` | `'scrollParent'` | `'clippingAncestors'` | same value rename |
| `BPopover` `boundary-padding` | `50` | unset | flips/shifts closer to the edge |
| `BDropdownHeader` `tag` | `header` | `h6` | CSS/test selectors |
| `BDropdownText` `tag` | `p` | `span` | CSS/test selectors, block → inline |
| `BToast` `header-tag` | `header` | `div` | CSS/test selectors |
| `BFormText` `text-variant` | `muted` | `body-secondary` | colour-mode aware |
| `BFormRadio` `value` | none | `true` | an unvalued radio now writes `true` to the model |
| `BModal` `header-close-variant` | none | `secondary` | — |

Generated element ids also changed format (BootstrapVue `__BVID__12`), which matters for snapshot tests and any CSS or
test selector that matched them.

## 7. `sort-compare` signature (`BTable`)

BootstrapVue: `sortCompare(aRow, bRow, key, sortDesc, formatter, compareOptions, compareLocale)`, returning
`null`/`false` to fall back to the built-in comparison. BootstrapVueNext: `(a, b, key) => number` — no direction, no
formatter, no fallback (returning `null` is treated as "equal"). Write it for ascending order; the table negates the
result for descending. It can also be set per field
(`field.sortCompare`). `btable.md` only says the routine "has been simplified".

## 8. Per-component plugins and TypeScript types

- Every `XxxPlugin` export (`ModalPlugin`, `TablePlugin`, `FormInputPlugin`, `VBTooltipPlugin`, `BVModalPlugin`,
  `BVToastPlugin`, `BVConfigPlugin`, `LayoutPlugin`, …) is gone. There is nothing to `app.use()` per component; import
  components directly or use the resolver. The custom `breakpoints` global config option has no equivalent.
- Types exported by `bootstrap-vue` and their closest BootstrapVueNext exports:

| `bootstrap-vue` | `bootstrap-vue-next` |
|---|---|
| `BvTableField`, `BvTableFieldArray` | `TableField<T>` / `TableFieldRaw<T>` (`TableFieldRaw<T>[]` for the `fields` prop) |
| `BvTableCtxObject` | `BTableProviderContext` |
| `BvTableProviderCallback` | `BTableProvider<T>` (no callback argument; return the array or a promise) |
| `BvTableFormatterCallback` | `TableFieldFormatter<T>` (one `{value, key, item}` argument) |
| `BvTableSortCompareCallback` | `BTableSortByComparerFunction<T>` |
| `BvTableFilterCallback` | `BTableFilterFunction<T>` |
| `BvTableVariant` | `ColorVariant` |
| `BvModalEvent` | `BvTriggerableEvent` |
| `BvEvent` | `BvEvent` |
| `BvMsgBoxOptions` | `ModalOrchestratorCreateParam` (argument of `useModal().create`) |
| `BvToastOptions` | `ToastOrchestratorCreateParam` (argument of `useToast().create`) |
| `BvModal`, `BvToast` (the `$bvModal` / `$bvToast` instance types) | `ReturnType<typeof useModal>` / `ReturnType<typeof useToast>` |
| `BvTableLocaleCompareOptions`, `BvTableTbodyTransition*` | none (features removed) |

## Checked and found unchanged

So nobody re-audits them: the `v-b-toggle` binding forms (modifier, argument, string/array value, `href="#id"`) and the
`collapsed` / `not-collapsed` classes plus `aria-expanded` on the trigger; `BFormInput` `formatter(value, event)`;
table field `tdClass(value, key, item)`; `BTable` `:per-page="0"` still means "all rows"; `BFormTags` `tag-state` arguments; `BPagination` `page-click` arguments;
`BTab` `activate()` / `deactivate()`; `BRow` `align-h` / `align-v` and `BCol` `align-self` value sets.
