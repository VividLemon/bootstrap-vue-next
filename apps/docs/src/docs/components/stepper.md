---
title: Stepper
description: >
  Show progress through a sequence of steps. `BStepper` and `BStepperItem` render Bootstrap's
  CSS-only `.stepper` markup, with the current step driven by `v-model`.
---

## Overview

`BStepper` renders an ordered list (`<ol class="stepper">`) and each `BStepperItem` a
`<li class="stepper-item">`. Bootstrap numbers the steps with a CSS counter and draws the connecting
track. Set `v-model` to the index (0-based) of the current step: that step and every step before it
get `.active`, and the current step gets `aria-current="step"`.

<<< DEMO ./demo/StepperOverview.vue

The stepper never changes the step by itself; update `v-model` from your own controls.

## Horizontal

Steps are vertical by default. Set `horizontal` to lay them out in a row.

<<< DEMO ./demo/StepperHorizontal.vue#template{vue-html}

### Responsive

Set `horizontal` to a breakpoint to switch to the row layout from that width up (`md` renders
`md:stepper-horizontal`). Bootstrap's responsive stepper classes are container queries: they compare
against the nearest query container, not the viewport. Wrap the stepper in an element with the
`.contains-inline` class (or use `overflow`). Bootstrap has these classes for `sm`, `md`, `lg` and
`xl`.

<<< DEMO ./demo/StepperResponsive.vue#template{vue-html}

### Overflow

Set `overflow` to wrap the stepper in a `.stepper-overflow` container that scrolls horizontally when
the steps do not fit. The wrapper is also a query container. Attributes and classes set on
`BStepper` stay on the `.stepper` element.

<<< DEMO ./demo/StepperOverflow.vue#template{vue-html}

## Item state

`active` and `current` on an item override the state derived from `v-model`, for example to mark
steps that are not contiguous.

<<< DEMO ./demo/StepperOverrides.vue#template{vue-html}

## Colors

The `color` prop's `theme` key colors the circle and track of an active item.

<<< DEMO ./demo/StepperColor.vue#template{vue-html}

## Interactive steps

Set `button` (or `href` / `to` for links) to make an item interactive. Use `tag="div"` on the
stepper so the items are not inside an `<ol>`. Clicking emits `click`; the stepper does not change
the step by itself.

<<< DEMO ./demo/StepperInteractive.vue

## Accessibility

- The list markup conveys the number of steps and the position of each step.
- `aria-current="step"` marks the current step.
- Bootstrap shows completed and upcoming steps visually only. If that matters, add visually hidden
  text to the item, such as `<span class="visually-hidden">Completed: </span>`.
- Give interactive items a clear label; disabled steps should use `disabled`.
