---
title: Collapse
description: >
  Easily toggle visibility of almost any content on your pages in a vertically collapsing container.
  Includes support for making accordions. Visibility can be easily toggled with our
  [`v-b-toggle` directive](/docs/directives/BToggle), or via [`v-model`](#v-model-support).
---

<<< DEMO ./demo/CollapseOverview.vue#template{vue-html}

## Usage

Other elements can easily toggle `BCollapse` components using the
[`v-b-toggle` directive](/docs/directives/BToggle).

<<< DEMO ./demo/CollapseUsage.vue#template{vue-html}

## Initial visibility (start expanded)

To make the `BCollapse` show initially, set the `v-model` prop:

<<< DEMO ./demo/CollapseInitial.vue#template{vue-html}

## `v-model` support

The component's collapsed (visible) state can also be set with `v-model`.

Note, when using `v-model` to control `BCollapse`, the `aria-*` attributes are not automatically
placed on the trigger button (as is the case when using the `v-b-toggle` directive). In this example
we **must control the attributes ourselves** for proper accessibility support.

By default, an initially visible collapse will not animate on mount. To enable the collapse expanding animation on mount,
set the `initial-animation` prop on `<BCollapse>` and leave the `visible` prop as false.

<<< DEMO ./demo/CollapseModel.vue

## Transitions

`BCollapse` uses Bootstrap's native, CSS-only collapse transition. The element always has the
`collapse` class and only the `show` class is toggled; the browser animates the size from `0` to
the content size by itself (via `interpolate-size` and `@starting-style`). There is no
`collapsing` class, no height measuring in JavaScript and no inline sizes.

- The `show` and `hide` events fire (and are cancelable) before the `show` class changes.
  `update:model-value` follows right after.
- The `shown` and `hidden` events fire once the element's CSS transition has finished. Toggling
  again while a transition is running reverses it; the interrupted transition never fires its
  `shown` / `hidden` event.
- Duration, easing and the animated properties come from the CSS variables
  `--bs-transition-collapse-duration` (default `0.35s`), `--bs-transition-collapse-timing`
  (default `ease`) and `--bs-transition-collapse-property`. Set them on the collapse (or an
  ancestor) to customise the transition.
- Set the `no-transition` prop to open and close instantly. Bootstrap has no `collapse-instant`
  class, so this adds the `transition-none` utility (and, because Bootstrap 6.0.0-alpha.1 ships
  the collapse transition outside a cascade layer, also sets `--bs-transition-collapse-duration: 0s`
  inline). With `prefers-reduced-motion: reduce` the collapse is always instant.
- With `lazy`, the content is mounted when a show starts. With `lazy` and `unmount-lazy`, it is
  unmounted only after `hidden`.
- Browsers without `interpolate-size` support open and close the collapse instantly.

## Horizontal collapse

Set the `horizontal` prop on `BCollapse` to collapse along the horizontal axis instead of the
default vertical axis (Bootstrap's `collapse-horizontal` class). The element still animates between
collapsed and expanded states, but its width (`inline-size`) is what transitions rather than its
height. When open, the element is as wide as its content (`fit-content`).

<<< DEMO ./demo/CollapseHorizontal.vue#template{vue-html}

## Trigger multiple collapse elements

You can even collapse multiple `BCollapse` components via a single `v-b-toggle` by providing
multiple target Ids using _modifiers_.

You can also pass multiple target Ids via the directive _value_ in BootstrapVueNext.

<<< DEMO ./demo/CollapseMultiple.vue#template{vue-html}

## Slots

The `header` and `footer` slots can be used to create custom toggles for your collapsible content. The default slot is
used for the content to be hidden or shown.

The following properties are available for the `header` and `footer` and `default` slots:

| Property  | Type     | Description                           |
| --------- | -------- | ------------------------------------- |
| `visible` | Boolean  | Visible state of the collapse         |
| `toggle`  | Function | When called, will toggle the collapse |
| `show`    | Function | When called, will open the collapse   |
| `hide`    | Function | When called, will close the collapse  |
| `id`      | String   | The ID of the collapsible element     |

`BCollapse` also [provides](https://vuejs.org/guide/components/provide-inject.html) the above variables
to its children as well as the value of the `isNav` prop.

<<< DEMO ./demo/CollapseContent.vue#template{vue-html}

## Exposed functions

`BCollapse` exposes several functions and properties through template refs. See the [Component Reference Exposed section](#comp-reference-bcollapse-exposed) for details.

<<< DEMO ./demo/CollapseExpose.vue

## Accessibility

The `v-b-toggle` directive will automatically add the ARIA attribute `aria-controls` to the trigger
element and register it with the target `BCollapse` component. The collapse component will then
automatically manage the `aria-expanded` attribute on the trigger element to reflect its visibility
state. Bootstrap v6 has no trigger state classes; to style a trigger by state, use the
`[aria-expanded="true"]` / `[aria-expanded="false"]` attribute selectors.

For detailed information on managing ARIA attributes for triggers, including examples of using `v-b-toggle` with `v-model` and manual ARIA management, see the [ARIA Trigger Registration for Component Visibility](/docs/reference/accessibility#aria-trigger-registration-for-component-visibility) section in the Accessibility reference.

While the `v-b-toggle` directive can be placed on almost any HTML element or Vue component, it is
recommended to use a button or link (or similar component) to act as your toggler; otherwise your
trigger elements may be inaccessible to keyboard or screen reader users. If you do place them on
something other than a button or link (or similar component), you should add the attributes
`tabindex="0"` and `role="button"` to allow users of assistive technology to reach your trigger
element.
