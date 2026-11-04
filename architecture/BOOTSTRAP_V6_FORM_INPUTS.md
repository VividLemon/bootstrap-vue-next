# Bootstrap v6 Form Inputs (G4)

## Summary

Research group G4 of the [new components plan](./BOOTSTRAP_V6_NEW_COMPONENTS.md): Field, Range, Chips, OTP input, Datepicker, Password strength and Form adorn. It builds on the forms batch ([#165](https://github.com/VividLemon/bootstrap-vue-next/pull/165), branch `bootstrap-v6-forms`): `.form-field`, `validate` / `data-bs-validate`, v6 check markup.

Findings:

- **Reimplement every v6 plugin in Vue; do not wrap Bootstrap's JS.** Range and Password strength reduce to computed values (no DOM access at all, so they render fully on the server). Chips and OTP are event-handling ports of `chips.ts` / `otp-input.ts`. Datepicker drives `vanilla-calendar-pro` (VCP) directly instead of going through Bootstrap's `datepicker.ts`. Bootstrap's `datepicker.js` registers document listeners when imported, so it cannot be imported during SSR. It reads its config once and has to be rebuilt on every prop change. It also positions its popup in a way that breaks inside native dialogs.
- **Field:** `BFormGroup` already renders `.form-field`; only a markup cleanup is needed (a `div` root for a single control, `fieldset.form-group` for groups, v5 leftovers out). Horizontal mode stays `row` + `col-form-label`, which matches the v6 layout docs.
- **New components:** `BFormRange` (removes the range handling from `BFormInput`), `BFormStrength` plus a public `usePasswordStrength`, `BFormAdorn` (wrapper that turns inner controls into `.form-ghost`), `BChip` plus a chip input that replaces `BFormTags` / `BFormTag`, a new `BFormOtp` (single input + decorative slots), and one `BDatepicker` that replaces six reka-ui components.
- **reka-ui:** after this group (OTP, six date/time components) and G2 (`BAutocomplete`), nothing imports `reka-ui`. Remove it from `dependencies` **and** `peerDependencies`, and remove `@internationalized/date` too (peer + dev, only used by the date components).
- **v6 has no time picker.** The recommendation is to drop `BTimeField` / `BTimeRangeField` and document `<BFormInput type="time">` (Q4).
- **Upstream issues found:** `strength.ts` writes `--strength-color: var(--danger-text)`, which is unprefixed and not a v6 token, so the strength text is never colored. The v6 docs mention a `.chip-input-label` class, but it is missing from `bootstrap.css`. The Datepicker popup sits at `--bs-datepicker-zindex: var(--bs-z-menu)` (1000), below `dialog` (1040) and `drawer` (1030), and VCP appends it to `document.body`.

## Sources read

- `AGENTS.md`, `architecture/BOOTSTRAP_V6_NEW_COMPONENTS.md`, `architecture/BOOTSTRAP_V6_MIGRATION.md`.
- `git diff bootstrap-v6-foundations..bootstrap-v6-forms` (BFormGroup, BFormGroupLabel, checks, BForm `validate`, ComponentProps), PR #165 description.
- Current library: `BFormGroup` (+ `BFormGroupLabel.vue`, `BFormGroupContent.vue`), `BFormInput` (+ `_form-input.scss`), `BInputGroup`, `BFormTags` / `BFormTag`, `BFormOtp`, `BDatePicker`, `BDateRangePicker`, `BDateField`, `BDateRangeField`, `BTimeField`, `BTimeRangeField`, `types/Component{Props,Slots,Emits}.ts`, `types/BootstrapVueOptions.ts`, `components/index.ts`, `styles/styles.scss`, `package.json`, `vite.config.ts`, `useShowHide.ts`.
- Bootstrap 6.0.0-alpha.1: `js/src/{range,strength,otp-input,chips,datepicker}.ts`, `js/dist/datepicker.js`, `scss/forms/{_form-field,_form-range,_strength,_otp-input,_chip-input,_form-adorn,_form-control,_floating-labels,_validation}.scss`, `scss/_chip.scss`, `scss/_datepicker.scss`, `dist/css/bootstrap.css` (every class and token cited below was grepped there), `package.json` (peer deps).
- `vanilla-calendar-pro@3.4.0` (`options.d.ts`, `types.d.ts`, `labels.d.ts`, `index.mjs`; a Node import test).
- Docs: getbootstrap.com/docs/6.0/forms/{field,layout,range,chips,otp-input,datepicker,password-strength,form-adorn}.
- Prior art (archived): `bdbd7fd3` (`bootstrap-v6-otp`, a Vue port of the OTP input) and `b6b763df` (`bootstrap-v6-time-components`, a `BDatepicker` that wrapped Bootstrap's JS through a dynamic import and a `bootstrap-v6` alias).
- Docs app: `apps/docs/src/data/components/{formGroup,formInput,formTags,formOtp,datePicker,dateField,timeField}.data.ts`, `form-group.md`, `form-input.md`, `form-tags.md`, `form-otp.md`, demos. Date/time components have data files but no docs pages.

## Shared decisions (all components in this group)

| Topic             | Decision                                                                                                                                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JS behavior       | Reimplement in Vue. Bootstrap's plugins query and mutate DOM they did not render, register document-level data-API listeners on import (not SSR-safe), and read their config once.                             |
| v-model           | Each control has a `defineModel` value. v6 `change.bs.*` events map to `update:modelValue`. Cancelable v6 events (`add.bs.chips`, `remove.bs.chips`) become cancelable `BvEvent` emits.                        |
| Field integration | Every new control registers with `useProvideFormGroupData` (the same way `BFormInput` does) so that `BFormGroup` auto-resolves `labelFor`, `state` and `disabled`.                                             |
| Validation        | `state` renders `.is-valid` / `.is-invalid` on the element v6 expects (input, `.form-ghost`, `.form-range-input`, or the `.otp` wrapper). The `data-bs-validate` CSS from #165 covers native `:user-invalid`.  |
| Colors            | Root `theme` emits `.theme-{color}` (v6 recolors `.form-range`, `.chip`, `.chip-input` through `--theme-*`).                                                                                                   |
| Attrs             | `*Attrs` for inner parts; no `*Class` props.                                                                                                                                                                   |
| SSR               | All markup renders on the server. Only Datepicker creates a third-party instance, and only in `onMounted`. Document listeners (`selectionchange` for OTP) go through `useEventListener(getSafeDocument(), …)`. |

## Field (`BFormGroup`)

### v6 overview

CSS only. `.form-field` is a grid (`gap: .5rem`) for a label, a control, `.form-text` and feedback. When a `.check`, `.radio` or `.switch` is a direct child it switches to two columns, and `.form-field-content` wraps the label and description next to a check. `.form-field-card` is a card-style option. `.form-group` is a grid that groups several fields under one `label` / `.form-label` / `legend`. The horizontal layout ([forms/layout](https://getbootstrap.com/docs/6.0/forms/layout/)) does **not** use `.form-field` for text controls: it is `.row` + `{bp}:col-*` + `.col-form-label` (`pt-0` on a radio `legend`).

### Current library (after #165)

Root is always `<fieldset class="b-form-group">`, plus `.form-field` when not horizontal. The label is a `<label for>` when a target exists, otherwise a `<legend tabindex="-1">` with `bv-no-focus-ring col-form-label pt-0`. Floating mode wraps the label, the control and the feedback in `.form-floating`. Horizontal mode uses `BFormRow` + `BCol`, unchanged by #165.

### Disposition

All props compose Field markup; none duplicate a v6 JS behavior. Field is CSS only, so rule 1 changes markup, not the API.

| Prop / slot                                                                            | Disposition | Note                                                  |
| -------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------- |
| `id`, `ariaInvalid`, `disabled`, `state`                                               | keep        |                                                       |
| `label`, `labelFor`, `labelAttrs`, `labelVisuallyHidden`, `labelSize`                  | keep        | `labelSize` → `col-form-label-{sm,lg}` (exists in v6) |
| `labelCols`, `contentCols`, `labelAlign`                                               | keep        | `Responsive<…>` since #165; horizontal mode           |
| `description`                                                                          | keep        | renders `.form-text`                                  |
| `invalidFeedback`, `validFeedback`, `tooltip`, `feedbackAriaLive`                      | keep        |                                                       |
| `floating`                                                                             | keep        |                                                       |
| slots `default` (scoped), `label`, `description`, `invalid-feedback`, `valid-feedback` | keep        |                                                       |

### Proposed markup

| Mode                                                     | Root                                                                          | Label                                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Single control (explicit or auto-detected `labelFor`)    | `<div class="form-field">`                                                    | `<label class="form-label" for>`                                             |
| Group (no single target: checks, radios, several inputs) | `<fieldset class="form-group">`                                               | `<legend class="form-label">`                                                |
| Floating                                                 | `<div class="form-field">` > `.form-floating` (label before control, as #165) | `<label for>`                                                                |
| Horizontal                                               | `<div class="row">` / `<fieldset class="row">` (unchanged)                    | `col-form-label` (`pt-0` only on a horizontal `legend`, as the v6 docs show) |

- Drop the v5 leftovers `bv-no-focus-ring`, `d-block`, and `col-form-label pt-0` on stacked legends.
- `b-form-group` stays as a library hook class.
- A rendered `<legend>` is not a grid item of the fieldset's anonymous box. Check the `.form-group` gap visually.
- Gap: v6 shows `.invalid-feedback` inside an `.input-group` field through `.form-field:has(.input-group .form-control:user-invalid)`. Horizontal mode has no `.form-field`, so native `:user-invalid` feedback for input groups does not show there. Prop-driven `state` still works because `BFormInvalidFeedback` force-shows. Document this; no workaround.

### Name

Whether `BFormGroup` keeps its name or becomes `BFormField` is part of Q1. Note that v6 `.form-group` now means "several fields under one label", which the proposed group mode renders.

## Range

### v6 overview

Markup moves from `<input class="form-range">` (v5) to a wrapper: `<div class="form-range [theme-*]"><input type="range" class="form-range-input"></div>`. `range.ts` options: `bubble` (bool) and `formatter` (`value => string`). It sets `--bs-range-fill` (0–1) on the wrapper, which draws the filled track and positions the bubble. When `bubble` is on, it inserts `<output class="form-range-bubble tooltip bs-tooltip-top show" aria-hidden="true"><div class="tooltip-arrow"></div><div class="tooltip-inner">`. Ticks come from the input's `list` → `<datalist>`: it appends `.form-range-ticks` (grid with `grid-template-columns` from value gaps) > `.form-range-tick` > `.form-range-tick-label`. Event `changed.bs.range`, method `update()`. Validation: `.form-range-input.is-*`, with feedback after the wrapper (`.form-range:has(.form-range-input.is-*) ~ .*-feedback`). Without JS the fill never renders.

### Current library

`BFormInput type="range"` puts `.form-range` (now the v6 **wrapper** class) on the bare input, so ranges are unstyled under v6 today. `_form-input.scss` only holds v5-era range validation styles, which v6 `_validation.scss` now covers.

### Decision: new `BFormRange` (Q6)

The v6 range is a wrapper with generated children (bubble, ticks, fill variable), and `BFormInput` is a single `<input>` whose attrs fall through to that input. Adding a conditional wrapper to `BFormInput` would split attrs and root semantics by `type`. Instead, add a dedicated component and remove range handling from `BFormInput` (`form-range` class branch, `_form-input.scss`, docs range section, `FormInputRange*.vue` demos).

### Proposed API

| Prop                                                                 | Type                                                     | Default                     | Note                                                                                                                              |
| -------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`                                                         | `number`                                                 | `50` (midpoint like native) | `v-model`, numeric                                                                                                                |
| `min` / `max` / `step`                                               | `Numberish`                                              | `0` / `100` / `1`           |                                                                                                                                   |
| `bubble`                                                             | `boolean`                                                | `false`                     | v6 option                                                                                                                         |
| `formatter`                                                          | `(value: number) => string`                              | `String`                    | v6 option; bubble and tick labels                                                                                                 |
| `ticks`                                                              | `readonly (number \| {value: number; label?: string})[]` | —                           | Replaces `list` + `<datalist>`; renders the ticks grid **and** a real `<datalist>` (`list` on the input) for native snapping/a11y |
| `theme`                                                              | `ColorVariant`                                           | —                           | `.theme-*` on the wrapper                                                                                                         |
| `id`, `name`, `form`, `disabled`, `required`, `state`, `ariaInvalid` |                                                          |                             | standard                                                                                                                          |
| `wrapperAttrs`                                                       | `AttrsValue`                                             | —                           | root `.form-range`                                                                                                                |

- `$attrs` (and `class`) go to the input (`inheritAttrs: false`), the same way `BFormInput` treats attrs.
- Emits: `update:modelValue` on `input`, `change` on `change`.
- Expose: `element`, `focus()`, `blur()`.
- Markup: `--bs-range-fill` is an inline style computed from the value, so the fill renders on the server. Bubble and ticks are template elements with the v6 classes and `aria-hidden="true"`. Tick label text uses `formatter` when the tick has no `label` (v6 uses only `option.label`; using the formatter is a small additive).
- a11y: native range semantics. Add `aria-valuetext` from `formatter` when it is set, so screen readers get the formatted value (small additive).
- SSR: no DOM access.

## Chips (redesign of `BFormTags` / `BFormTag`)

### v6 overview

Standalone `.chip` (`.chip-icon`, `.chip-img`, `.chip-dismiss`, `.active`, `.disabled`, `theme-*`; subtle by default, solid when active) and `.chip-input` (wrapper styled like a control: `--control-*` tokens, `:focus-within` ring) containing chips and a borderless `<input class="form-ghost">`.

`chips.ts` behavior:

- **Config:** `separator` (`','` or `null`), `allowDuplicates` (false), `maxChips`, `placeholder`, `dismissible` (true), `dismissIcon` (sanitized HTML), `createOnBlur` (true).
- **Events:** `add` (cancelable), `remove` (cancelable), `change` (`values`), `select` (`selected`).
- **Methods:** `add`, `remove`, `removeSelected`, `getValues`, `getSelectedValues`, `clear`, `clearSelection`, `selectChip`, `focus`.
- **Keyboard:** Enter / separator adds; Backspace on an empty input selects the last chip, then deletes it; arrow keys, Shift-range, Home/End, Ctrl/Cmd+A, Escape; click / Ctrl-click / Shift-click selection.
- **Paste:** splits on the separator.
- **Chip markup:** each chip gets `tabindex="0"`; the dismiss button gets `tabindex="-1"` and `aria-label="Remove"`.
- **Validation:** `.chip-input:has(.form-ghost.is-*)` and `[data-bs-validate] .chip-input:has(.form-ghost:user-invalid)`.
- **Classes:** no size classes. `.chip-input-label` appears in the docs but **not in `bootstrap.css`**.

### Current library

`BFormTags` renders a `.form-control` with a `<ul>` of `BFormTag` (`.badge`) items, an input, an optional add button, three feedback texts, two visually hidden live regions and hidden inputs for `name`. Its default scoped slot exposes about 30 values for fully custom UIs. `BFormTag` is a `.badge` with a `BCloseButton`.

### Disposition: `BFormTags`

| Prop                                                                      | Disposition                  | v6 / new                                                                                                    |
| ------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `modelValue`                                                              | keep                         | `string[]`                                                                                                  |
| `disabled`, `placeholder`, `state`, `autofocus`                           | keep                         | ghost input                                                                                                 |
| `name`, `form`, `required`                                                | keep (small additive)        | `name` renders one hidden input per value. `required` sits on the ghost input only while there are no chips |
| `inputAttrs`                                                              | keep                         | ghost input                                                                                                 |
| `inputClass`                                                              | remove                       | use `inputAttrs.class` (already planned)                                                                    |
| `inputId`                                                                 | replace                      | `id` targets the ghost input, so `BFormGroup` `labelFor` works                                              |
| `inputType`                                                               | remove                       | v6 ghost is text                                                                                            |
| `separator` (`string \| string[]`)                                        | replace                      | v6 `separator: string \| null`, default `','` (was "none")                                                  |
| `limit`                                                                   | replace                      | `maxChips`                                                                                                  |
| `noTagRemove`                                                             | replace                      | `dismissible` (default `true`)                                                                              |
| `tagRemoveLabel`                                                          | replace                      | `dismissLabel` (default `'Remove'`, rendered as `"Remove {value}"`)                                         |
| `tagColor`                                                                | replace                      | root `theme` (chips inherit) + per-chip color through the `chip` slot / `BChip`                             |
| `tagClass`                                                                | replace                      | `chipAttrs?: (value: string, index: number) => AttrsValue` (function-valued, as #166)                       |
| `tagPills`                                                                | remove                       | chips are always pills                                                                                      |
| `tagValidator`                                                            | replace                      | cancelable `add` event (v6)                                                                                 |
| `addOnChange`                                                             | replace                      | `createOnBlur` (default `true`)                                                                             |
| `noAddOnEnter`                                                            | remove                       | Enter always adds (v6)                                                                                      |
| `removeOnDelete`                                                          | remove                       | v6 Backspace behavior is built in                                                                           |
| `addButtonText`, `addButtonVariant`, `addButtonColor`                     | remove                       | v6 has no add button                                                                                        |
| `duplicateTagText`, `invalidTagText`, `limitTagsText`, `feedbackAriaLive` | remove                       | v6 rejects silently; show messages through `BFormGroup` feedback driven by the `add` event (Q8)             |
| `ignoreInputFocusSelector`, `noOuterFocus`                                | remove                       | v6 focuses the input only on a background click                                                             |
| `size`                                                                    | remove                       | v6 has no chip sizes                                                                                        |
| `tagRemovedLabel`                                                         | keep, renamed `removedLabel` | built-in live region (v6 docs promise announcements but `chips.ts` has none)                                |
| new                                                                       | add                          | `allowDuplicates`, `theme`                                                                                  |

| Slot / emit / expose                            | Disposition                                                                                                                |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| slot `default` (full custom UI scope)           | remove. The `FormTagsDropdown` / `FormTagsSelect` / `FormTagsCustom` / `FormTagsNative` demos must be rewritten or dropped |
| slot `tag`                                      | replace → `chip` `{value, index, selected, remove}`                                                                        |
| slot `add-button-text`                          | remove                                                                                                                     |
| new slot `dismiss-icon`                         | replaces v6 `dismissIcon` HTML (no sanitizer needed)                                                                       |
| emits `focus`, `blur`, `focusin`, `focusout`    | remove (listeners via `inputAttrs`, native root listeners fall through)                                                    |
| emit `tag-added`                                | replace → `add` (cancelable `BvEvent`, `value`)                                                                            |
| emit `tag-state`                                | remove                                                                                                                     |
| new emits                                       | `remove` (cancelable), `select` (`string[]`)                                                                               |
| expose `focus`, `blur`, `element`, `inputValue` | replace → `focus()`, `blur()`, `add(value)`, `remove(value)`, `clear()`, `clearSelection()`, `removeSelected()`, `element` |

### Disposition: `BFormTag`

| Prop / emit                              | Disposition                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------------- |
| `id`, `disabled`, `tag` (default `span`) | keep                                                                                   |
| `theme` / `bg` / `fg`                    | keep (root color props stay flat)                                                      |
| `noRemove`                               | replace → `dismissible` (default `false` for a standalone chip)                        |
| `removeLabel`                            | replace → `dismissLabel`                                                               |
| `pill`                                   | remove                                                                                 |
| `title`                                  | remove (falls through as a native attribute)                                           |
| emit `remove`                            | keep                                                                                   |
| new                                      | `active` (`.active`), slots `icon` (`.chip-icon`), `img` (`.chip-img`), `dismiss-icon` |

### Proposed markup

```html
<div class="chip-input theme-primary" role="group">
  <span class="chip" tabindex="0" data-bs-chip-value="React"
    >React
    <button type="button" class="chip-dismiss" tabindex="-1" aria-label="Remove React">…</button>
  </span>
  <input type="text" class="form-ghost" id="…" />
  <span class="visually-hidden" aria-live="polite">…</span>
</div>
```

- Selection state lives in a `shallowRef<Set<number>>` (by index, so duplicates are safe).
- The keyboard map is ported from `chips.ts`.
- Selected chips get `.active` plus `aria-pressed="true"`. A role-less `<span>` cannot carry `aria-selected`, and `option` cannot contain a button.

## OTP input (replace `BFormOtp`)

### v6 overview

One real `<input class="otp-input">` (`maxlength`, `inputmode`, `pattern`, `autocomplete="one-time-code"`) inside `.otp`. JS appends `.otp-slots[aria-hidden]` > `.otp-slot` (`.otp-slot-filled`, `.otp-slot-active`) and `.otp-separator`, and adds `.otp-rendered`, which turns the input into a transparent overlay.

- **Config:** `length` (else `maxlength`, else 6), `type` (`numeric` | `alphanumeric` | `alpha`), `mask` (`•`), `groups` (`[3,3]`), `separator` (`'·'`).
- **Typing and editing:** `beforeinput` overwrites in place; Backspace steps back; selection drives the active slot.
- **Paste:** sanitizes before the length cut.
- **Pointer:** pointer position maps to a slot; iOS keyboard handling.
- **Events:** `input`, `complete`. Methods: `getValue`, `setValue`, `clear`, `focus`.
- **Classes:** `.otp-connected`, `.otp-sm` / `.otp-lg`. Validation is `.otp.is-*` on the wrapper.

### Disposition (rule 2: new API; overlaps listed for migration notes)

| Old prop                                                              | New                                                                     |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `modelValue: string[]`                                                | `modelValue: string`                                                    |
| `length`                                                              | `length` (v6)                                                           |
| `type: 'text' \| 'number'`                                            | `type: 'numeric' \| 'alphanumeric' \| 'alpha'` (v6)                     |
| `mask` (password inputs)                                              | `mask` (v6 `•` in slots, value untouched)                               |
| `separator` (documented, did nothing)                                 | `separator` + new `groups` (v6)                                         |
| `otp`                                                                 | removed; `autocomplete="one-time-code"` always (override through attrs) |
| `placeholder`, `plaintext`, `dir`                                     | removed                                                                 |
| `size`                                                                | `size` → `.otp-sm` / `.otp-lg`                                          |
| `state`, `ariaInvalid`                                                | `.is-*` on `.otp`, `aria-invalid` on the input                          |
| `ariaLabel`                                                           | single accessible name on the one input (was "Pin n of m" per input)    |
| `id`, `name`, `form`, `disabled`, `readonly`, `required`, `autofocus` | standard attributes on the one input                                    |
| new                                                                   | `connected` (`.otp-connected`)                                          |
| emit `complete: string[]`                                             | `complete: string`                                                      |
| new expose                                                            | `focus()`, `blur()`, `clear()`, `element`                               |

### Implementation notes

- Render the slots in the template (SSR) with `.otp-rendered` from the start, since the overlay works without JS.
- Port the `beforeinput` / paste / pointer / `selectionchange` logic. `selectionchange` is a document listener and goes through `useEventListener(getSafeDocument(), …)`.
- The archived `bdbd7fd3` is a near-complete port (component, specs, docs, migration page) and can be revived on the new base.
- a11y as in v6: one field, slots `aria-hidden`, paste and autofill never blocked.

## Datepicker (replace the six reka-ui date/time components)

### v6 overview

`datepicker.ts` wraps `Calendar` from `vanilla-calendar-pro` with only the `months` extension. The v6 docs say options of the other extensions throw, including `selectionTimeMode`.

- **Triggers:** an input (shows on focus), a button (toggle, with `[data-bs-datepicker-display]` showing the value), or inline (`data-bs-inline`, optional hidden input for forms).
- **Options:** `dateMin` / `dateMax`, `dateFormat` (Intl options or `(date, locale) => string`), `displayElement`, `displayMonthsCount`, `firstWeekday` (default 1), `inline`, `locale` (`'default'`), `positionElement` (auto-detects a `.form-adorn` parent), `selectedDates` (`YYYY-MM-DD`), `selectionMode` (`single` | `multiple` | `multiple-ranged`), `placement` (`left` | `center` | `right` | `auto`), `datepickerTheme`, `vcpOptions` passthrough.
- **Events:** `show` / `shown` / `hide` / `hidden` / `change` (`dates`). Methods: `show`, `hide`, `toggle`, `getSelectedDates`, `setSelectedDates`.
- **Closing:** closes 100 ms after a single date or a complete range is picked, on outside `pointerdown` / `focusin`, and on Escape (VCP).
- **Theme:** copies `data-bs-theme` to the popup with a MutationObserver, because VCP appends the popup to `document.body`.
- **Range display:** joined with `' – '`; multiple dates with `', '`.
- **CSS:** `_datepicker.scss` styles VCP's `[data-vc=…]` attributes with `--bs-datepicker-*` tokens. VCP's own CSS is not needed. The popup is `position: absolute; z-index: var(--bs-datepicker-zindex)` = `--bs-z-menu` (1000). Inline calendars (`:not([data-vc-input])`) have no chrome. There are **no time styles**.

### vanilla-calendar-pro

| Aspect                  | Finding                                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dependency of Bootstrap | **Required** peer of `bootstrap@6.0.0-alpha.1` (with `@floating-ui/dom`). In this workspace pnpm auto-installs it (lockfile 3.4.0). BVN does not list it today.                                                    |
| Size / deps             | Zero dependencies; `index.mjs` about 82 KB unminified-ish single file; `sideEffects` only CSS. Extensions: `months`, `time`, `weeks`, `annotations`, `motion`.                                                     |
| SSR                     | `import('vanilla-calendar-pro')` succeeds in Node (verified), so a static import is safe. `new Calendar()` / `init()` must run only in `onMounted`.                                                                |
| Locale / i18n           | `locale: string \| {months, weekdays}` (BCP 47 or an explicit name table). UI strings via `labels` (aria labels, navigation). `firstWeekday`.                                                                      |
| Value format            | `selectedDates: (Date \| number \| string)[]`, context returns `YYYY-MM-DD` strings. Ranges are `[start, end]` with `selectionDatesMode: 'multiple-ranged'` (VCP fills the in-between dates; take first and last). |
| Disabling               | `disableDates`, `disableWeekdays`, `disableDatesPast`, `enableDates`, `disableAllDates`; no predicate function.                                                                                                    |
| Time                    | `time` extension (`selectionTimeMode: 12 \| 24`, `selectedTime`, min/max hour/minute, step) is part of the calendar layout, so there is **no time-only mode**. Bootstrap does not style it.                        |
| a11y                    | Grid roles, `aria-selected`, `aria-current="date"`, `aria-disabled`, arrow-key navigation, Escape, live region on the header.                                                                                      |
| Positioning             | Input mode appends the popup to the root node's `body` (or shadow root) and positions it absolutely. Inside a modal `<dialog>` (top layer) a body-level popup is always behind the dialog, whatever its z-index.   |

### Current library

Six reka-ui components:

- `BDatePicker` / `BDateRangePicker`: popover calendar + segmented field; `@internationalized/date` `DateValue` models; `v-model:open`, `v-model:placeholder`; `field`, `calendar`, `trigger-icon`, `prev-icon`, `next-icon` slots; hard-coded `z-index: 1050` in `_date-picker.scss` / `_date-range-picker.scss`, which ties with `--bs-z-popover`.
- `BDateField` / `BDateRangeField` / `BTimeField` / `BTimeRangeField`: segmented spinbutton fields.

No docs pages exist, only `datePicker.data.ts`, `dateField.data.ts`, `timeField.data.ts`.

### Disposition (rule 2: everything replaced; mapping for the migration notes)

| Old prop(s) (any of the six)                                                                         | New                                                                                                     |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `modelValue` (`DateValue` / `DateRange` / `TimeValue` / `TimeRange`)                                 | `modelValue` ISO `YYYY-MM-DD` strings (Q3)                                                              |
| `minValue` / `maxValue`                                                                              | `dateMin` / `dateMax`                                                                                   |
| `numberOfMonths`                                                                                     | `displayMonthsCount`                                                                                    |
| `weekStartsOn`                                                                                       | `firstWeekday`                                                                                          |
| `locale`                                                                                             | `locale`                                                                                                |
| `open`, `defaultOpen` (`v-model:open`)                                                               | `v-model:open` (through `useShowHide`)                                                                  |
| `isDateDisabled`, `isDateUnavailable`                                                                | `vcpOptions.disableDates` / `disableWeekdays` / `disableDatesPast` (no predicates)                      |
| `id`, `name`, `disabled`, `readonly`, `required`, `size`, `state`                                    | same names on the trigger input                                                                         |
| `defaultValue`, `defaultPlaceholder`, `placeholder` (calendar month), `v-model:placeholder`          | removed (`vcpOptions.selectedMonth` / `selectedYear`); `placeholder` becomes the input placeholder text |
| `closeOnSelect`, `preventDeselect`, `fixedWeeks`, `pagedNavigation`, `weekdayFormat`, `modal`, `dir` | removed                                                                                                 |
| `granularity`, `hourCycle`, `hideTimeZone`, `step`, `stepSnapping`                                   | removed (no time; Q4)                                                                                   |
| `allowNonContiguousRanges`, `fixedDate`, `maximumDays`, `isDateHighlightable`                        | removed                                                                                                 |
| slots `field`, `calendar`, `trigger-icon`, `prev-icon`, `next-icon`, field `default` (segments)      | removed; new `display` slot (button trigger)                                                            |
| emits `update:placeholder`, `update:startValue`                                                      | removed                                                                                                 |

### Proposed API: `BDatepicker`

| Prop                                                                                                                              | Type                                                                                                          | Default                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `modelValue`                                                                                                                      | `string \| null` (single), `string[]` (multiple), `[string, string] \| []` (range), typed by a `Mode` generic | `null` / `[]`                                                                        |
| `selectionMode`                                                                                                                   | `'single' \| 'multiple' \| 'multiple-ranged'`                                                                 | `'single'`                                                                           |
| `dateMin`, `dateMax`                                                                                                              | `string \| Date`                                                                                              | —                                                                                    |
| `dateFormat`                                                                                                                      | `Intl.DateTimeFormatOptions \| (date: Date, locale?: string) => string`                                       | —                                                                                    |
| `locale`                                                                                                                          | `string`                                                                                                      | — (see SSR)                                                                          |
| `firstWeekday`                                                                                                                    | `0…6`                                                                                                         | `1`                                                                                  |
| `displayMonthsCount`                                                                                                              | `1…12`                                                                                                        | `1`                                                                                  |
| `inline`                                                                                                                          | `boolean`                                                                                                     | `false`                                                                              |
| `button`                                                                                                                          | `boolean`                                                                                                     | `false` (button trigger, `.btn-outline theme-secondary`, text in the `display` slot) |
| `placement`                                                                                                                       | VCP `PositionToInput` or Floating UI placement (Q2)                                                           | `'bottom-start'`                                                                     |
| `datepickerTheme`                                                                                                                 | `'light' \| 'dark' \| 'auto'`                                                                                 | inherit                                                                              |
| `vcpOptions`                                                                                                                      | VCP `Options` (minus the keys the component owns)                                                             | `{}`                                                                                 |
| `open`                                                                                                                            | `boolean` (`v-model:open`)                                                                                    | `false`                                                                              |
| `noTransition`                                                                                                                    | `boolean`                                                                                                     | `false`                                                                              |
| `id`, `name`, `form`, `placeholder`, `disabled`, `readonly`, `required`, `size`, `state`, `ariaInvalid`, `autocomplete` (`'off'`) |                                                                                                               |                                                                                      |

- Emits: `update:modelValue`, `update:open`, `change` (`{dates}`), `show` / `shown` / `hide` / `hidden` (cancelable show/hide, `useShowHide`).
- Expose: `show()`, `hide()`, `toggle()`, `element`.
- Inline mode renders a hidden `<input name>` (value `dates.join(',')`) when `name` is set, as v6 does.
- Markup: input trigger is `<input type="text" class="form-control" autocomplete="off" aria-haspopup="dialog" aria-expanded>`. Inside `BFormAdorn` the input becomes `.form-ghost` and the popup anchors to the adorn wrapper (v6 `positionElement` auto-detect).
- Behavior ported from `datepicker.ts`: formatting (`Intl.DateTimeFormat`, `' – '` / `', '` joins), hide after a complete selection, outside `pointerdown` / `focusin` dismiss, theme sync (only needed if the popup is teleported).
- Re-create the VCP instance on option changes (`calendar.set()` covers most options; destroy/init for `selectionMode` / `inline`).
- SSR: render the input with the formatted value. With no `locale`, server and browser default locales can differ and cause a hydration mismatch, so format on the client when `locale` is unset (render ISO on the server) and recommend `locale` through `BApp` defaults. Calendar creation in `onMounted` only.
- z-index: remove the library's 1050. Use v6 `--bs-datepicker-zindex` (`--bs-z-menu`). With Q2 option B the popup is in the top layer and needs no z-index.

### Time fields (Q4)

v6 has no time-only picker; VCP's time UI is attached to the calendar and unstyled by Bootstrap. Recommended: remove `BTimeField` / `BTimeRangeField` (and the segmented `BDateField` / `BDateRangeField`), and document `<BFormInput type="time">` (and `type="date"` for a native date field) in the Datepicker and form-input docs.

### Composable: `useDatepicker` / date helpers

Not worth a public API now. VCP owns calendar state, and the only helpers (ISO parse/format, Intl display formatting, range normalization) are about 30 lines of internal `utils/date.ts`. Revisit if users ask.

## Password strength

### v6 overview

- **Markup:** `.strength[data-bs-strength]` > 4 × `.strength-segment` (`.active` up to the level), or `.strength-bar` (width 25 % per level), plus an optional `.strength-text`. Level via the `data-bs-strength="weak|fair|good|strong"` attribute (CSS reads the attribute).
- **`strength.ts`:** finds the password input (`input` option, or a sibling `input[type=password]`), scores on `input` / `change`, sets the attribute and `.active`, writes the message, fires `strengthChange` (`strength`, `score`). Options: `minLength` (8), `messages`, `weights` (8 criteria, 1 point each), `thresholds` (`[2,4,6]`), `scorer`.
- **Upstream bug:** the text color is written as unprefixed `--strength-color: var(--danger-text)`. Neither name matches the shipped CSS (`--bs-strength-color`, `--bs-danger-fg`), so the text stays `--bs-fg-3`.
- The docs call the meter decorative and say the text "announces" changes, but nothing sets a live region.

### Proposed API: `BFormStrength` + `usePasswordStrength`

- `usePasswordStrength(password: MaybeRefOrGetter<string>, options?: MaybeRefOrGetter<PasswordStrengthOptions>)` returns `{score: ComputedRef<number>, strength: ComputedRef<'weak' \| 'fair' \| 'good' \| 'strong' \| null>}`. It is a pure port of `_calculateScore` / `_scoreToStrength` and follows the `create-adaptable-composable` skill. **Public**, because scoring is useful for validation without the meter.
- `BFormStrength` props:
  - `value` (the password, bound by the user: `<BFormStrength :value="password" />`; no DOM lookup of an input, rule 3)
  - `bar` (`.strength-bar` instead of segments)
  - `minLength`, `weights`, `thresholds`, `scorer`, `messages`
  - `showText` (renders `.strength-text`)
  - `segmentAttrs`, `textAttrs`
- Emits `change` (`{strength, score}`) when the level changes.
- Markup: `data-bs-strength` bound from the computed level, `.active` on segments, text `<span class="strength-text" aria-live="polite">`. The text color is set correctly (`--bs-strength-color: var(--bs-{danger|warning|info|success}-fg)`), fixing the upstream bug.
- Docs: tell users to link requirements text with `aria-describedby` on the input; the meter is `aria-hidden`.
- SSR: pure computation.

## Form adorn

### v6 overview

CSS only. `<label class="form-control [form-control-sm|lg] form-adorn [form-adorn-end]">` containing `.form-adorn-icon` / `.form-adorn-text` (both `pointer-events: none`, should be `aria-hidden`) and `<input class="form-ghost">`. `.form-adorn-end` uses `order: -1` on the ghost to put the adornments after it. The wrapper is a `<label>`, so clicks focus the input and **no interactive content** is allowed inside (no buttons). Validation is `.form-adorn:has(.form-ghost.is-*)` and `[data-bs-validate] .form-adorn:has(.form-ghost:user-invalid)`. Datepicker auto-anchors to `.form-adorn`. `.form-adorn-sm` / `-lg` are named in the docs but not in CSS; sizing is `.form-control-{sm,lg}` on the wrapper.

### Decision: wrapper component `BFormAdorn` (Q7)

```vue-html
<BFormAdorn size="sm">
  <template #start><SearchIcon /></template>
  <BFormInput v-model="q" />
  <template #end>USD</template>
</BFormAdorn>
```

- Renders `<label class="form-control form-adorn">`. `start` / `end` slot contents are wrapped in `.form-adorn-icon` (or `.form-adorn-text` when `text` / `startText` / `endText` props are used) with `aria-hidden="true"`.
- Both slots in DOM order, so `.form-adorn-end` is only emitted when there is only an `end` slot.
- Props: `size`, `startText`, `endText`, `tag` (default `label`).
- Provides `formAdornKey`, so `BFormInput`, `BDatepicker` and the chip input render `.form-ghost` instead of `.form-control` (same pattern as `inputGroupKey`).
- Docs: no buttons inside (`BInputGroup` remains the tool for buttons and addons).
- SSR: none.

## Composables

| Candidate                       | Decision                                                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `usePasswordStrength`           | **Public.** Pure, adaptable inputs, typed options. Export from `composables/index.ts` and add a docs page under composables. |
| `useDatepicker` / date helpers  | Internal only (see Datepicker).                                                                                              |
| Chip selection, OTP caret logic | Internal composables (`useChipSelection`, `useOtpInput`) if it keeps the components small; not exported.                     |

## Exports, docs and cleanup

| Area                                                                | Change                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/index.ts`, `types/BootstrapVueOptions.ts`               | Add `BFormRange`, `BFormStrength`, `BFormAdorn`, `BChip`, chip input (name per Q1), `BDatepicker`. Remove `BDatePicker`, `BDateRangePicker`, `BDateField`, `BDateRangeField`, `BTimeField`, `BTimeRangeField`, `BFormTags` / `BFormTag` (if renamed).                                                                                                                                                                        |
| `types/ComponentProps.ts`, `ComponentSlots.ts`, `ComponentEmits.ts` | Remove every `reka-ui` type import (`AcceptableValue` goes with G2), `TimeRange` and the date types; add the new interfaces.                                                                                                                                                                                                                                                                                                 |
| `styles/styles.scss`                                                | Remove `form-input`, `form-otp`, `time-field`, `date-field`, `date-range-field`, `time-range-field`, `date-picker`, `date-range-picker` partials. `form-tags` → whatever little chip-input CSS is needed (probably none).                                                                                                                                                                                                    |
| `package.json`                                                      | Remove `reka-ui` (dependency + optional peer) and `@internationalized/date` (optional peer + dev) once G2's Combobox lands. Add `vanilla-calendar-pro` per Q5.                                                                                                                                                                                                                                                               |
| `vite.config.ts`                                                    | `external` is only `['vue']` today, so every other dependency, `reka-ui` included, is bundled into `dist`. Add `vanilla-calendar-pro` to `external` (Q5).                                                                                                                                                                                                                                                                    |
| Docs data                                                           | Update `formGroup.data.ts`, `formInput.data.ts`, `formOtp.data.ts`, `formTags.data.ts` (→ chips); add `formRange`, `formStrength`, `formAdorn`, `datepicker`; delete `datePicker`, `dateField`, `timeField`.                                                                                                                                                                                                                 |
| Docs pages                                                          | Edit `form-group.md`, `form-input.md` (drop range section, add native date/time note), `form-otp.md`, `form-tags.md` (→ chips); add `form-range.md`, `form-strength.md`, `form-adorn.md`, `datepicker.md`, `composables/usePasswordStrength.md`; `ComponentReference.vue` lists. Demos: rewrite `FormTags*`, `FormOtp*`, `FormInputRange*`; check `InputGroupXPend.vue` and `OverlayBackdropColor.vue` (use `type="range"`). |
| Playground                                                          | `TFormTags.vue`, `TFormGroup.vue`, `TFormInput.vue` (range).                                                                                                                                                                                                                                                                                                                                                                 |
| Migration notes                                                     | `bformtags.md` (exists), `bformotp.md` (archived `bdbd7fd3` has one), `bcalendar.md` / `bformdatepicker.md` / `btime.md` point to `BDatepicker`; new notes for the six removed date/time components and for `BFormInput type="range"`.                                                                                                                                                                                       |

## reka-ui usage (full list, for confirming removal)

| File                                                                                 | Import                                             | Removed by    |
| ------------------------------------------------------------------------------------ | -------------------------------------------------- | ------------- |
| `components/BAutocomplete/BAutocomplete.vue`                                         | `AcceptableValue` (type) + components              | G2 (Combobox) |
| `components/BAutocomplete/BAutocomplete.spec.ts`                                     | reka-ui                                            | G2            |
| `components/BFormOtp/BFormOtp.vue`                                                   | `PinInputInput`, `PinInputRoot`                    | G4 OTP        |
| `components/BFormOtp/form-otp.spec.ts`                                               | reka-ui                                            | G4 OTP        |
| `components/BDatePicker/BDatePicker.vue`, `BDateRangePicker.vue`                     | calendar/popover primitives                        | G4 Datepicker |
| `components/BDateField/BDateField.vue`, `BDateRangeField.vue`, `BTimeRangeField.vue` | field primitives                                   | G4 Datepicker |
| `components/BTimeField/BTimeField.vue`                                               | `TimeFieldInput`, `TimeFieldRoot`                  | G4 Datepicker |
| `types/ComponentProps.ts`                                                            | `AcceptableValue, DateRange, DateValue, TimeValue` | G2 + G4       |
| `types/ComponentSlots.ts`                                                            | `DateRange, DateValue, SegmentPart, TimeValue`     | G4            |
| `types/ComponentEmits.ts`                                                            | `AcceptableValue, DateValue, TimeValue`            | G2 + G4       |
| `package.json`                                                                       | `dependencies` `^2.10.3` **and** optional peer `*` | after both    |
| `apps/docs/src/docs/components/autocomplete.md`                                      | prose mention                                      | G2            |

There is no reka-ui usage in `apps/` code, the playground or `packages/nuxt` (only CHANGELOG). After G2 and G4, `reka-ui` and `@internationalized/date` can both go.

## Cross-group dependencies

| With                     | Topic                                                                                                                                                                                                                                                                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 Overlays              | Native modal `<dialog>` / drawer are top-layer. Any popup appended to `body` (VCP input mode, today's reka popovers) renders behind them. Datepicker must use the same top-layer strategy G1/G2 settle on (Q2). Naming policy: if G1 renames `BModal` → `BDialog` / `BOffcanvas` → `BDrawer`, apply the same principle to Q1. |
| G2 Menus                 | Datepicker popup can reuse Menu's popup/positioning mechanism (Floating UI, popover attribute, outside dismiss). Combobox sits inside `BFormGroup` (`.form-field`) and `BFormAdorn` (ghost injection), so G2 should register with `useProvideFormGroupData` and honor `formAdornKey`. reka-ui removal needs G2's Combobox.    |
| G5 Display               | `BChip` `img` slot vs `BAvatar`: `.chip-img` is a plain image; no avatar coupling. Badge and chip stay separate (`BFormTag` was a `.badge`).                                                                                                                                                                                  |
| Wave 2 Floating UI batch | v6 z-index scale (`--bs-z-menu` 1000 … `--bs-z-tooltip` 1060); the library's hard-coded 1050 for date pickers goes away with this group.                                                                                                                                                                                      |
| Forms (#165)             | Builds on `.form-field`, `validate`, `useProvideFormGroupData`; no change requested to #165.                                                                                                                                                                                                                                  |

## Questions for the maintainer

### Q1. Component names (High)

Context: Bootstrap names are Field, Range, Chips, OTP input, Datepicker, Password strength, Form adorn. The library uses a `BForm*` prefix for controls. Existing names: `BFormGroup`, `BFormTags` / `BFormTag`, `BFormOtp`, `BDatePicker` (+5). v6 `.form-group` now means "several fields under one label".

- **A. Keep existing names** with new APIs (`BFormGroup`, `BFormTags` / `BFormTag`, `BFormOtp`, `BDatePicker`). Least churn. But old and new APIs share a name while behaving differently, and "tags" no longer matches the v6 markup or docs.
- **B. v6 names everywhere:** `BFormField`, `BFormChips` + `BChip`, `BFormOtp` (unchanged), `BFormRange`, `BDatepicker`, `BFormStrength`, `BFormAdorn`. Matches Bootstrap's docs. Renaming `BFormGroup` (the most used form component) is large churn for a CSS-only change.
- **C. Mixed (recommended):** keep `BFormGroup` and `BFormOtp`; rename where the concept changed or a component is new: `BChip` + `BFormChips` (replace `BFormTag` / `BFormTags`), `BDatepicker` (one component replaces six; the different casing avoids silent use of the old API), `BFormRange`, `BFormStrength`, `BFormAdorn`. Revisit `BFormGroup` → `BFormField` only if G1 adopts v6 names for `BModal` / `BOffcanvas`.

Recommendation: **C**.

### Q2. Datepicker popup mechanism (High)

Context: VCP input mode appends the popup to `document.body` and positions it itself. The v6 z-index is `--bs-z-menu` (1000), below drawer (1030) and dialog (1040). Body-level elements can never cover a native modal `<dialog>` in the top layer. Today's library popup is hard-coded to 1050, which ties with popovers.

- **A. VCP input mode (v6 behavior).** Least code, identical to Bootstrap. Breaks inside native dialogs/drawers (G1); needs the theme MutationObserver; placement options limited to `left` / `center` / `right` / `auto`.
- **B. Library-owned popup with VCP in inline mode (recommended).** The component renders a popup element positioned with Floating UI and shown in the top layer (`popover="manual"`, or Menu's mechanism from G2). The VCP calendar is mounted inline inside it, and the `--bs-datepicker-*` chrome is reapplied to the popup with a small library rule (v6 strips chrome from inline calendars). Works in dialogs, inherits `data-bs-theme` naturally, consistent with Menu/Combobox, and gets native transitions through `useShowHide` + `noTransition`. Costs about 30 lines of SCSS and a dependency on G2's decision.
- **C. Teleport VCP input-mode popup into the nearest open dialog.** Patches the dialog case only; keeps the z-index issue elsewhere.

Recommendation: **B**, aligned with G2's Menu popup.

### Q3. Datepicker v-model value type (Medium)

- **A. ISO `YYYY-MM-DD` strings (recommended).** VCP and v6 native format, timezone-safe (no midnight-UTC shift), serializable, SSR/hydration-stable, works directly with `<input type="hidden">` and `dateMin` / `dateMax`. Users convert to `Date` themselves.
- **B. `Date` objects.** Familiar, but timezone pitfalls and object identity in `v-model`.
- **C. Both via a `valueAs` prop.** More API surface and typing complexity.

Single: `string | null`; multiple: `string[]`; range: `[start, end]` tuple (or `[]`), typed by a `selectionMode` generic. Recommendation: **A**.

### Q4. Replacement for `BTimeField` / `BTimeRangeField` (Medium)

- **A. Drop them; document `<BFormInput type="time">` (recommended).** No v6 counterpart, native picker, accessible, zero code. Loses segmented/12-24 h control and time ranges (two inputs instead).
- **B. Add VCP's `time` extension to `BDatepicker`** (`time` prop → `selectionTimeMode`). Gives date+time, but no time-only mode, Bootstrap ships no styles for it (the library would own `[data-vc="time"]` CSS), and it goes beyond v6's supported options.
- **C. A small library `BTimepicker`.** Custom component with no Bootstrap markup to follow; maintenance cost.

Recommendation: **A**. Revisit B if users ask for date-time.

### Q5. How to depend on vanilla-calendar-pro (Medium)

Context: `bootstrap@6` lists it as a required peer, so Bootstrap users already install it. BVN's Vite build externalizes only `vue`, so anything imported is bundled into `dist`.

- **A. Required peer `^3.4.0` + externalized in `vite.config.ts` + static import (recommended).** Matches Bootstrap's own peer, so it is already installed. One copy shared with any direct VCP use. Import is SSR-safe (verified), and only the `BDatepicker` entry references it. The cost is one more peer.
- **B. Bundled `dependency`.** Zero setup, but duplicated if the user also uses Bootstrap's JS datepicker, and version drift from Bootstrap.
- **C. Optional peer + dynamic import on mount.** Consumers' bundlers still try to resolve the specifier; a missing package fails builds anyway, so "optional" is misleading.

Recommendation: **A**. Related: decide separately whether other bundled deps (`@vueuse/core`, `@floating-ui/*`) should be externalized too (out of scope here).

### Q6. Range as a new component or a `BFormInput` feature (Medium)

- **A. New `BFormRange` (recommended); remove range handling from `BFormInput`.** Clean wrapper root, `number` v-model, `bubble` / `ticks` / `theme` props, server-rendered fill. Breaking for `type="range"` users.
- **B. Keep `BFormInput type="range"` and wrap conditionally.** No new component, but the root element and attrs target change with `type`, range-only props clutter `BFormInput`, and the model stays string-ish.

Recommendation: **A**.

### Q7. Form adorn: wrapper component or slots on inputs (Medium)

- **A. `BFormAdorn` wrapper with `start` / `end` slots, injecting `.form-ghost` into child controls (recommended).** Mirrors v6 markup (`<label class="form-control form-adorn">`), works for `BFormInput`, `BDatepicker`, Combobox and the chip input alike, and keeps the `BFormInput` root a plain `<input>`.
- **B. `start` / `end` slots on `BFormInput` (and others).** Terse usage, but the root changes from `<input>` to `<label>` only when slots are present (attrs/ref ambiguity), and it has to be repeated on each control.

Recommendation: **A**.

### Q8. `BFormTags` features without a v6 equivalent (Medium)

Context: rule 1 keeps only small additives. Proposed keep: `name` / `form` hidden inputs, `required`, `state`, `autofocus`, `inputAttrs`, a live region (`removedLabel`). Proposed removals: the add button (3 props + slot), `tagValidator` (→ cancelable `add` event), `invalidTagText` / `duplicateTagText` / `limitTagsText` / `feedbackAriaLive` feedback, `addOnChange`, `noAddOnEnter`, `removeOnDelete`, `ignoreInputFocusSelector`, `noOuterFocus`, `size`, `inputType`, `tagPills`, array separators, and the full-custom default scoped slot.

- **A. Remove as proposed (recommended).** Matches v6; validation messages move to `BFormGroup` feedback driven by `add` / `state`.
- **B. Also keep `tagValidator` and the three feedback texts.** Convenient built-in validation, but it renders non-v6 feedback markup inside the control and duplicates the `add` event.
- **C. Also keep the default scoped slot** for fully custom UIs (dropdown/select-driven tags). Powerful, but about 30 scope values freeze the old internals into the new API.

Recommendation: **A**.

## Decisions

Answered by the maintainer on 2026-11-03. Where an answer differs from the proposal above, the answer wins.

- **Q1 — B. v6 names everywhere:** `BFormGroup` → `BFormField`, `BFormTags` / `BFormTag` → `BFormChips` + `BChip`, the six date/time components → `BDatepicker`, plus new `BFormRange`, `BFormStrength`, `BFormAdorn`; `BFormOtp` keeps its name (already matches). No aliases. Cross-group rule: redesigned components take their v6 names (`BDialog`, `BDrawer`, `BMenu`).
- **Q2 — B. Library-owned popup** using G2's shared Menu mechanism (rendered in place, Floating UI, `teleportTo` opt-in), with vanilla-calendar-pro mounted inline inside it, so the datepicker works inside native dialogs.
- **Q3 — A. ISO strings.** `'YYYY-MM-DD'`: `string | null` (single), `string[]` (multiple), `[start, end]` tuple (range).
- **Q4 — A.** `BTimeField` / `BTimeRangeField` are removed with no replacement component; docs show `<BFormInput type="time">` (two inputs for a range).
- Q5–Q8: _Pending._

## Implementation split

Suggested PR order (each stacked, each with the required checks from `BOOTSTRAP_V6_MIGRATION.md`):

1. **Range:** `BFormRange`, remove range from `BFormInput` and `_form-input.scss`, docs/demos. Independent.
2. **Password strength:** `usePasswordStrength` (public) + `BFormStrength`. Independent.
3. **Form adorn:** `BFormAdorn` + `formAdornKey` ghost injection in `BFormInput`. Needed before the Datepicker adorn usage.
4. **Field:** `BFormGroup` root/label markup cleanup (`div.form-field` / `fieldset.form-group`), plus rename if Q1 says so.
5. **OTP:** replace `BFormOtp` (revive `bdbd7fd3` on the new base).
6. **Chips:** `BChip` + chip input replacing `BFormTags` / `BFormTag`; rewrite demos and migration notes.
7. **Datepicker:** `BDatepicker`, `vanilla-calendar-pro` dependency, remove the six reka-ui components, `@internationalized/date` and their SCSS / data / types. Waits for Q2 and G2's popup decision.
8. **reka-ui removal:** drop `reka-ui` from `package.json` once 5, 7 and G2's Combobox have landed; grep confirms zero imports.
