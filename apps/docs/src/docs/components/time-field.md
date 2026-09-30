---
title: Time Field
description: 'Segmented, accessible time input controls built on top of Reka UI TimeField primitives, with Bootstrap form-control styling.'
---

## Overview

`BTimeField` renders a segmented time input — separate, independently-navigable fields for hour, minute, second, and (optionally) AM/PM and time zone — instead of a single free-text input. It wraps Reka UI's [`TimeField`](https://reka-ui.com/docs/components/time-field) primitives and applies Bootstrap `form-control` styling.

`BTimeRangeField` is the range variant, rendering two linked segmented groups (`start` and `end`) for capturing a time range.

<<< DEMO ./demo/TimeFieldOverview.vue

## `v-model`

The `v-model` of `BTimeField` is a `Time | null` value from [`@internationalized/date`](https://github.com/adobe/react-spectrum/tree/main/packages/@internationalized/date) — **not** a string like BootstrapVue's `BTime`/`BFormTimepicker`. `null` represents "no time selected".

`BTimeRangeField`'s `v-model` is a `{start: Time | undefined; end: Time | undefined} | null` object.

<<< DEMO ./demo/TimeRangeFieldOverview.vue

::: tip
`@internationalized/date` is a peer dependency of `bootstrap-vue-next` (via Reka UI) and is already available in your project if you have `bootstrap-vue-next` installed.
:::

## Granularity and hour cycle

Use the `granularity` prop (`hour`, `minute`, or `second`) to control which segments are rendered. Defaults to `minute`. Use `hour-cycle` (`12` or `24`) to control whether an AM/PM segment is shown; if omitted, it is inferred from the `locale`.

<<< DEMO ./demo/TimeFieldGranularity.vue

## Min and max values

Use `min-value` and `max-value` to constrain the selectable time. Both accept a `Time` instance.

<<< DEMO ./demo/TimeFieldMinMax.vue

## Sizing

Control the size of the field using the `size` prop. Supports `sm`, `md` (default), and `lg`.

<<< DEMO ./demo/TimeFieldSize.vue

## Validation states

Use the `state` prop to apply contextual validation styles. Set to `true` for valid, `false` for invalid, or `null` for no validation state.

<<< DEMO ./demo/TimeFieldState.vue

## Disabled and readonly states

Set `disabled` to prevent all interaction, or `readonly` to prevent changes while keeping the field focusable.

<<< DEMO ./demo/TimeFieldDisabled.vue

## Unavailable times (range only)

`BTimeRangeField` accepts an `is-time-unavailable` matcher function, invoked for each time within the selected range, to mark specific times as unavailable independently of `min-value`/`max-value`.

<<< DEMO ./demo/TimeRangeFieldUnavailable.vue

## Custom rendering

Both components expose their segment data via the default slot, allowing full control over markup while retaining the underlying accessibility and keyboard behavior.

`BTimeField` provides `modelValue`, `segments`, and `isInvalid`. `BTimeRangeField` provides the same, except `segments` is split into `segments.start` and `segments.end`.

## Accessibility and keyboard interactions

Keyboard support is provided natively by Reka UI:

- <kbd>ArrowUp</kbd> / <kbd>ArrowDown</kbd> Increment or decrement the focused segment
- <kbd>ArrowLeft</kbd> / <kbd>ArrowRight</kbd> Move focus between segments
- <kbd>Backspace</kbd> Clears the focused segment
- Typing digits fills the focused segment and automatically advances to the next one when it is complete

## Migrating from BootstrapVue

See the [`BTime` migration guide](/docs/migration-data/components/btime) and [`BFormTimepicker` migration guide](/docs/migration-data/components/bformtimepicker) for a detailed breakdown of breaking changes, including the **value type change** and the move away from an automatic floating dropdown presentation.
