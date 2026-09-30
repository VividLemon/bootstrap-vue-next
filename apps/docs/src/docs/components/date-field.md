---
title: Date Field
description: 'Segmented, accessible date input controls built on top of Reka UI DateField primitives, with Bootstrap form-control styling.'
---

## Overview

`BDateField` renders a segmented date input — separate, independently-navigable fields for year, month, day, and (optionally) time and time zone segments — instead of a single free-text input. It wraps Reka UI's [`DateField`](https://reka-ui.com/docs/components/date-field) primitives and applies Bootstrap `form-control` styling.

`BDateRangeField` is the range variant, rendering two linked segmented groups (`start` and `end`) for capturing a date range.

<<< DEMO ./demo/DateFieldOverview.vue

## `v-model`

The `v-model` of `BDateField` is a `DateValue | null` value from [`@internationalized/date`](https://github.com/adobe/react-spectrum/tree/main/packages/@internationalized/date) (a `CalendarDate`, `CalendarDateTime`, or `ZonedDateTime`) — **not** a string like BootstrapVue's `BFormDatepicker`. `null` represents "no date selected".

`BDateRangeField`'s `v-model` is a `{start: DateValue | undefined; end: DateValue | undefined} | null` object.

<<< DEMO ./demo/DateRangeFieldOverview.vue

::: tip
`@internationalized/date` is a peer dependency of `bootstrap-vue-next` (via Reka UI) and is already available in your project if you have `bootstrap-vue-next` installed.
:::

## Granularity

Use the `granularity` prop (`day`, `hour`, `minute`, or `second`) to control which segments are rendered, including time-of-day segments. Defaults to `day` when the bound value is a plain `CalendarDate`, otherwise `minute`.

## Min and max values

Use `min-value` and `max-value` to constrain the selectable date. Both accept a `DateValue` instance.

<<< DEMO ./demo/DateFieldMinMax.vue

## Sizing

Control the size of the field using the `size` prop. Supports `sm`, `md` (default), and `lg`.

<<< DEMO ./demo/DateFieldSize.vue

## Validation states

Use the `state` prop to apply contextual validation styles. Set to `true` for valid, `false` for invalid, or `null` for no validation state.

<<< DEMO ./demo/DateFieldState.vue

## Disabled and readonly states

Set `disabled` to prevent all interaction, or `readonly` to prevent changes while keeping the field focusable.

<<< DEMO ./demo/DateFieldDisabled.vue

## Unavailable dates (range only)

`BDateRangeField` accepts an `is-date-unavailable` matcher function, invoked for each date within the selected range, to mark specific dates as unavailable independently of `min-value`/`max-value`.

<<< DEMO ./demo/DateRangeFieldUnavailable.vue

## Custom rendering

Both components expose their segment data via the default slot, allowing full control over markup while retaining the underlying accessibility and keyboard behavior.

`BDateField` provides `modelValue`, `segments`, and `isInvalid`. `BDateRangeField` provides the same, except `segments` is split into `segments.start` and `segments.end`.

## Accessibility and keyboard interactions

Keyboard support is provided natively by Reka UI:

- <kbd>ArrowUp</kbd> / <kbd>ArrowDown</kbd> Increment or decrement the focused segment
- <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> Move focus between segments
- <kbd>Backspace</kbd> Clears the focused segment
- Typing digits fills the focused segment and automatically advances to the next one when it is complete

## Migrating from BootstrapVue

See the [`BFormDatepicker` migration guide](/docs/migration-data/components/bformdatepicker) for a detailed breakdown of breaking changes, including the **value type change**. If you need a popover calendar rather than a plain segmented field, see [`BDatePicker`](/docs/components/date-picker).
