---
id: bformtimepicker
title: BFormTimePicker Migration
description: 'Migration notes for BFormTimepicker from BootstrapVue to BootstrapVueNext BTimeField.'
category: components
components:
  - BFormTimePicker
  - BFormTimepicker
  - BTimeField
match:
  - BFormTimePicker
  - BFormTimepicker
  - <BFormTimepicker>
tags:
  - migration
  - components
  - bformtimepicker
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: medium
---

# BFormTimePicker Migration

## Summary

`BFormTimepicker` has been replaced by `BTimeField` (and `BTimeRangeField` for ranges), segmented time inputs built on Reka UI's `TimeField` primitives. This is one of the largest behavioral changes in the date/time component family: **the automatic floating dropdown menu is gone**.

## Affected APIs

- BFormTimePicker
- BFormTimepicker

## Breaking Change

::: warning No more automatic floating menu
BootstrapVue's `BFormTimepicker` always rendered its spinbutton/clock-face picker inside an automatically-managed floating dropdown menu, toggled by a button. **`BTimeField` does not do this.** It renders as a plain, always-visible, inline segmented input (like a native `<input type="time">`, but composed of individually focusable segments).

This is an intentional design decision across this component family: BootstrapVueNext leaves floating/overlay placement entirely up to you, **except** for `BDatePicker`/`BDateRangePicker`, which still ship a built-in popover because a full calendar grid benefits from being tucked away by default. `BTimeField` has no equivalent grid UI to hide, so no popover is provided.

If you want a dropdown-style presentation (button that reveals the time field on click), you must compose it yourself, e.g. by wrapping `BTimeField` in [`BDropdown`](/docs/components/dropdown) or [`BPopover`](/docs/components/popover):

```vue-html
<BDropdown text="Pick a time">
  <div class="p-2">
    <BTimeField v-model="value" />
  </div>
</BDropdown>
```
:::

- **Component renamed**: `BFormTimepicker` → `BTimeField` (or `BTimeRangeField` for a start/end range).
- **Value type changed**: `BFormTimepicker`'s `v-model` was a formatted **string** (e.g. `'14:20:18'`). `BTimeField`'s `v-model` is a `Time | null` object from `@internationalized/date`.
- **No button-only / popup controls**: `button-only`, `no-close-button`, `close-button-variant`, `now-button`, `reset-button`, `label-now-button`, `label-reset-button`, `label-close-button`, `label-no-time-selected`, and the spinbutton/clock-face toggle (`show-seconds` aside) have no direct equivalent, because there is no popup to control. Build any of this UI yourself around a composed `BDropdown`/`BPopover` + `BTimeField` if needed.
- **Prop renames**:
  - `hour12` → `hour-cycle` (`12 | 24`)
  - `min`/`max` (string) → `min-value`/`max-value` (`Time` instance)
  - `show-seconds` → `granularity="second"`
  - `locale` retains the same meaning

## Migration Notes

- Replace `<BFormTimepicker v-model="stringValue" />` with `<BTimeField v-model="timeValue" />`, converting the bound value from a string to a `Time | null`.
- If your app previously relied on the built-in dropdown for space-constrained layouts (e.g. inside a table cell), wrap `BTimeField` in `BDropdown` or `BPopover` yourself — see the example above.
- The `placeholder` prop is **not** a display string in `BTimeField` — it is a `Time` value used to determine which segments to show when no value is selected. Do not pass a string like BootstrapVue's `placeholder="HH:MM:SS"`.
- See the [`BTimeField` documentation](/docs/components/time-field) for full prop/event/slot reference and usage examples.

## Safe Automatic Rewrite

No. The value type change, the removal of the popup/button UI, and the `placeholder` semantic change all require manual review and re-composition at every usage site.

## Related Migrations

- [btime](/docs/migration-data/components/btime)
- [bformdatepicker](/docs/migration-data/components/bformdatepicker)
