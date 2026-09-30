---
id: bformdatepicker
title: BFormDatePicker Migration
description: 'Migration notes for BFormDatepicker from BootstrapVue to BootstrapVueNext BDatePicker.'
category: components
components:
  - BFormDatePicker
  - BFormDatepicker
  - BDatePicker
match:
  - BFormDatePicker
  - BFormDatepicker
  - <BFormDatepicker>
tags:
  - migration
  - components
  - bformdatepicker
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: medium
---

# BFormDatePicker Migration

## Summary

`BFormDatepicker` has been replaced by `BDatePicker` (and `BDateRangePicker` for ranges), built on Reka UI's `DatePicker` primitives. Of all the date/time components, this is the closest match to its BootstrapVue predecessor, since `BDatePicker` **does** retain a built-in floating calendar popover — but the value type, several prop names, and some positioning controls have changed.

## Affected APIs

- BFormDatePicker
- BFormDatepicker

## Breaking Change

::: tip Popover behavior is preserved here
Unlike `BFormTimepicker` → `BTimeField` (see [that migration guide](/docs/migration-data/components/bformtimepicker)), `BDatePicker`/`BDateRangePicker` continue to render their calendar grid inside an automatically-positioned floating popover, toggled by a trigger button, matching `BFormDatepicker`'s original behavior reasonably closely.
:::

- **Component renamed**: `BFormDatepicker` → `BDatePicker` (or `BDateRangePicker` for a start/end range).
- **Value type changed**: `BFormDatepicker`'s `v-model` was a formatted **string** (e.g. `'2024-06-15'`, per the `value-as-date`/ISO formatting options). `BDatePicker`'s `v-model` is a `DateValue | null` object from `@internationalized/date` (`CalendarDate`, `CalendarDateTime`, or `ZonedDateTime`).
- **Prop renames**:
  - `start-weekday` → `week-starts-on` (`0`–`6`, `0` = Sunday)
  - `min`/`max` (string) → `min-value`/`max-value` (`DateValue` instance)
  - `date-disabled-fn` → `is-date-disabled` (`Matcher`)
  - `hide-header` and the header formatting props (`label-help`, `label-current-month`, etc.) have no direct equivalent; the calendar header is customizable via the `calendar` slot instead
  - `label-prev-decade`, `label-prev-year`, `label-next-year`, `label-next-decade` have no equivalent — `BDatePicker` only exposes month-level `label-prev`/`label-next` navigation by default (there's no decade/year paging control built in; compose your own via the `calendar` slot if needed)
  - `label-prev-month` / `label-next-month` → `label-prev` / `label-next`
  - `label-help` and other screen-reader-only helper text props have no equivalent
- **Positioning gap**: BootstrapVue exposed `no-flip`, `boundary`, `dropup`, `right`, and `menu-class` to control the popover's placement and collision handling. `BDatePicker` does not currently expose equivalent placement-tuning props (positioning is delegated to Reka UI's internal popper integration with a fixed `side-offset`). If you need custom positioning, this is a current functionality gap — track it or open an issue rather than expecting a prop-for-prop replacement.
- **`placeholder` prop meaning changed**: in `BFormDatepicker`, `placeholder` was a **display string** shown when no date was selected. In `BDatePicker`, `placeholder` is a **`DateValue`** used to determine which month/segments to display when no date is selected — it does not accept an arbitrary string.

## Migration Notes

- Replace `<BFormDatepicker v-model="stringValue" />` with `<BDatePicker v-model="dateValue" />`, converting the bound value from an ISO string to a `DateValue | null`.
- If you relied on `no-flip`/`boundary`/`dropup` for placement, note this is currently unsupported — verify the default popover placement works for your layout, or track this as an outstanding gap.
- See the [`BDatePicker` documentation](/docs/components/date-picker) for full prop/event/slot reference and usage examples.

## Safe Automatic Rewrite

No. The value type change and the loss of fine-grained popover placement controls require manual review of every usage site.

## Related Migrations

- [bcalendar](/docs/migration-data/components/bcalendar)
- [bformtimepicker](/docs/migration-data/components/bformtimepicker)
