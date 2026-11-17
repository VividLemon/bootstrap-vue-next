---
title: Form Adorn
description: 'Place icons and text inside a form control, around a borderless input, with the Bootstrap v6 Form adorn.'
---

<<< DEMO ./demo/FormAdornOverview.vue#template{vue-html}

## Overview

`BFormAdorn` renders Bootstrap v6's `<label class="form-control form-adorn">` wrapper. The wrapper
draws the border, background, padding and focus ring, and the control inside it becomes a
borderless "ghost" input: a `BFormInput` in `BFormAdorn` renders `.form-ghost` instead of
`.form-control`.

Content of the `start` and `end` slots is wrapped in `.form-adorn-icon` and hidden from assistive
technology (`aria-hidden="true"`). The wrapper is a `<label>`, so clicking an adornment focuses the
input.

::: warning
Don't put interactive content (buttons, links) inside `BFormAdorn`: the wrapper is a `<label>` and
adornments ignore pointer events. Use [`BInputGroup`](/docs/components/input-group) for buttons and
addons.
:::

## Position

Use the `start` slot for an adornment before the control and the `end` slot for one after it. When
there is only an end adornment, `BFormAdorn` adds `.form-adorn-end` (as Bootstrap does); both slots
can be used together.

<<< DEMO ./demo/FormAdornPosition.vue#template{vue-html}

## Text adornments

`start-text` and `end-text` render text adornments (`.form-adorn-text`), for currency symbols, units
and domain parts.

<<< DEMO ./demo/FormAdornText.vue#template{vue-html}

## With a label

Adornments are hidden from assistive technology, so give the input its own label. Inside a
[`BFormGroup`](/docs/components/form-group) the label is linked to the input automatically.

<<< DEMO ./demo/FormAdornLabel.vue#template{vue-html}

## Sizing

Set `size` to `sm` or `lg` on `BFormAdorn` (not on the input) to size the control.

<<< DEMO ./demo/FormAdornSize.vue#template{vue-html}

## Validation

Set `state` on the inner control. Bootstrap styles the wrapper through
`.form-adorn:has(.form-ghost.is-invalid)`, and inside a `BForm` with `validate` through native
`:user-invalid`.

<<< DEMO ./demo/FormAdornState.vue#template{vue-html}
