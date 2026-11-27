---
title: Form Range
description: 'A range slider with a filled track, an optional value bubble and tick marks, built on the Bootstrap v6 Range.'
---

<<< DEMO ./demo/FormRangeOverview.vue

## Overview

`BFormRange` renders Bootstrap v6's range markup: a `.form-range` wrapper around an
`<input type="range" class="form-range-input">`. The filled part of the track is drawn from the
`--bs-range-fill` custom property, which the component computes from the value, so the fill also
renders on the server.

The `v-model` value is always a `number`. Attributes (including `class`) are applied to the input;
use `wrapper-attrs` for the `.form-range` wrapper.

::: info NOTE
Range inputs used to be `<BFormInput type="range">`. That type has been removed from
`BFormInput`; use `BFormRange` instead.
:::

## Min, max and step

The range defaults to `min` `0`, `max` `100` and `step` `1`.

<<< DEMO ./demo/FormRangeStep.vue#template{vue-html}

## Value bubble

Set `bubble` to show the current value above the thumb. Use `formatter` to change the displayed
text. When `formatter` is set, the formatted value is also given to screen readers through
`aria-valuetext`.

<<< DEMO ./demo/FormRangeBubble.vue

## Ticks

Pass `ticks` to draw tick marks under the track. A tick is a number, or `{value, label}` to set
its label. Without a label, the tick label is the formatted value; `label: ''` draws the tick
without a label. The ticks also render a linked `<datalist>`, so browsers can snap the thumb to
them.

<<< DEMO ./demo/FormRangeTicks.vue#template{vue-html}

## Color

Use `color.theme` to recolor the filled track and the thumb.

<<< DEMO ./demo/FormRangeColor.vue#template{vue-html}

## Validation

`state` adds `.is-valid` / `.is-invalid` to the input. Feedback placed after the component (for
example by [`BFormField`](/docs/components/form-group)) is shown by Bootstrap's
`.form-range:has(.form-range-input.is-invalid) ~ .invalid-feedback` rule. Inside a `BForm` with
`validate`, native `:user-invalid` styling applies too.

<<< DEMO ./demo/FormRangeState.vue#template{vue-html}
