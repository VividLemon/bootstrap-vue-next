---
title: Date Picker
description: 'A segmented date field paired with a floating calendar popover, built on top of Reka UI DatePicker primitives, with Bootstrap form-control and dropdown styling.'
---

## Overview

`BDatePicker` combines a segmented [date field](/docs/components/date-field) with a button that opens a calendar grid in a floating popover, letting users either type a date directly or pick one visually. It wraps Reka UI's [`DatePicker`](https://reka-ui.com/docs/components/date-picker) primitives.

`BDateRangePicker` is the range variant, allowing selection of a start and end date from the same calendar.

<<< DEMO ./demo/DatePickerOverview.vue

::: tip Built-in popover
Unlike every other component in this family (`BTimeField`, `BDateField`, and their range variants), `BDatePicker`/`BDateRangePicker` **do** ship their own floating calendar popover out of the box — positioning is handled internally via Reka UI's popper integration, so no extra composition with `BDropdown` or `BPopover` is required.
:::

## `v-model`

The `v-model` of `BDatePicker` is a `DateValue | null` value from `@internationalized/date` — **not** a string like BootstrapVue's `BFormDatepicker`. `null` represents "no date selected".

`BDateRangePicker`'s `v-model` is a `{start: DateValue | undefined; end: DateValue | undefined} | null` object.

<<< DEMO ./demo/DateRangePickerOverview.vue

## Open state

The popover's open state can be controlled with `v-model:open`, independently of the selected date. Use `close-on-select` (default `true`) to control whether selecting a date automatically closes the popover.

## Sizing

Control the size of the field and trigger button using the `size` prop. Supports `sm`, `md` (default), and `lg`.

<<< DEMO ./demo/DatePickerSize.vue

## Multiple months

Use `number-of-months` to render more than one month at a time, and `paged-navigation` so the prev/next buttons move by a full page of months instead of one month at a time.

<<< DEMO ./demo/DatePickerMultipleMonths.vue

## Week start day

Use `week-starts-on` (`0`–`6`, where `0` is Sunday) to control which day of the week each row begins with.

<<< DEMO ./demo/DatePickerWeekStart.vue

## Disabled and unavailable dates

`is-date-disabled` fully prevents a date from being focused or selected. `is-date-unavailable` allows the date to be focused but marks it visually as unavailable and prevents selection.

<<< DEMO ./demo/DatePickerDisabledUnavailable.vue

## Slots for customization

- `field` — replaces the segmented date field
- `calendar` — replaces the entire calendar grid
- `trigger-icon`, `prev-icon`, `next-icon` — replace the individual icons in the default field/calendar markup

## Accessibility

The previous-month, next-month, and popover-trigger buttons are icon-only by default and are labeled via the `label-prev`, `label-next`, and `label-trigger` props (all default to sensible English text — override them for localization).

## Migrating from BootstrapVue

See the [`BFormDatepicker` migration guide](/docs/migration-data/components/bformdatepicker) and the [`BCalendar` migration guide](/docs/migration-data/components/bcalendar) for a detailed breakdown of breaking changes, including the **value type change** and prop renames.
