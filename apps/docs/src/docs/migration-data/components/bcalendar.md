---
id: bcalendar
title: BCalendar Migration
description: 'Migration notes for BCalendar from BootstrapVue, approximated via BootstrapVueNext BDatePicker.'
category: components
components:
  - BCalendar
  - BDatePicker
match:
  - BCalendar
  - <BCalendar>
tags:
  - migration
  - components
  - bcalendar
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: low
---

# BCalendar Migration

## Summary

BootstrapVueNext does not currently ship a standalone, always-visible calendar-grid component equivalent to BootstrapVue's `BCalendar`. The closest available building block is [`BDatePicker`](/docs/components/date-picker)'s `calendar` slot content, used outside of its popover, or the `calendar` slot itself if you're fine with the surrounding field/trigger markup.

## Affected APIs

- BCalendar

## Breaking Change

- **No direct replacement component exists.** `BCalendar` rendered an always-visible calendar grid with no accompanying text field or popover. `BDatePicker` always pairs its calendar with a segmented date field and trigger button, and only shows the calendar inside a popover by default.
- There is no BootstrapVueNext equivalent for many `BCalendar`-specific props such as `block`, `hide-header`, `header-tag`, `nav-button-variant`, `selected-variant`, `today-variant`, or the various `label-*` props for standalone calendar text.
- If your use case requires an inline, always-open calendar (e.g. a dashboard widget), you currently have two options, neither of which is a drop-in replacement:
  1. Force `BDatePicker`'s popover open permanently (e.g. via `v-model:open="true"` and hiding the trigger button with custom CSS), accepting that the field/trigger markup is still present in the DOM.
  2. Use Reka UI's underlying `CalendarRoot`/`CalendarGrid` primitives directly (the same primitives `BDatePicker`'s `calendar` slot content is built from) if you need a truly standalone calendar grid without the accompanying field.

## Migration Notes

- Treat this as a **component gap** rather than a finalized migration recipe — if an always-visible, field-free calendar is a hard requirement, consider filing an issue to request a dedicated `BCalendar`-equivalent component.
- If a popover-based date picker is acceptable for your use case, migrate directly to `BDatePicker` per the [`BFormDatepicker` migration guide](/docs/migration-data/components/bformdatepicker), which covers the closest supported equivalent.

## Safe Automatic Rewrite

No. There is no direct component mapping; every usage requires a manual design decision about which approximation (if any) is acceptable.

## Related Migrations

- [bformdatepicker](/docs/migration-data/components/bformdatepicker)
