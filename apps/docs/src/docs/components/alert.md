---
title: Alert
description: 'Provide contextual feedback messages for typical user actions with the handful of available and flexible alert messages.'
---

## Overview

Alerts are available for any length of text, as well as an optional dismiss button (and optional auto-dismissing).

<<< DEMO ./demo/AlertOverview.vue

### `v-model` Support

You can use the `v-model` directive to create two-way data bindings as in `v-model="showDismissibleAlert"`. This is useful when you use dismissible because when the user closes the alert, your variable will be updated. The v-model prop accepts boolean `true` or `false` to show and hide the alert respectively. It can also be set to a positive integer (representing seconds) to create a self-dismissing alert. See the [Auto Dismissing Alerts](#auto-dismissing-alerts) section below for details. `:model-value="true"` can be used to unconditionally show the alert, as the `show` prop did in `bootstrap-vue`. See the
[migration knowledge base](/docs/migration-data/components/balert) for details.

## Contextual Variants

Set the `variant` prop to one of Bootstrap's theme keys (`primary`, `accent`, `success`, `danger`, `warning`, `info`, `inverse`, or `secondary`). The default is `info`. `BAlert` applies the Bootstrap 6 `.theme-{variant}` class next to `.alert`. Bootstrap 6 has no `light` or `dark` themes, so use a neutral surface, a color mode, or `inverse` instead. Set `variant` to `null` for the neutral alert.

<<< DEMO ./demo/AlertVariants.vue#template{vue-html}

### Conveying Meaning to Assistive Technologies

Using color variants to add meaning only provides a visual indication, which will not be conveyed to users of assistive technologies – such as screen readers. Ensure that information denoted by the color is either obvious from the content itself (e.g. the visible text) or is included through alternative means, such as additional text hidden with the `.visually-hidden` class.

## Additional Content Inside Alerts

`BAlerts` can also contain additional HTML elements like headings and paragraphs, which will be styled with the appropriate color matching the variant.

<<< DEMO ./demo/AlertContent.vue#template{vue-html}

### Color of Links Within Alerts

Use the `.alert-link` utility CSS class to quickly provide matching colored links within any alert. Use on `<a>` or `BLink`.

<<< DEMO ./demo/AlertLinkColors.vue#template{vue-html}

### Custom title

Use the `title` slot to render custom markup (icons, badges, styled text) in the alert heading.
When provided, the slot overrides the `title` prop. If neither the `title` slot nor the `title`
prop is set, the heading element is not rendered.

<<< DEMO ./demo/AlertTitleSlot.vue#template{vue-html}

## Dismissible Alerts

Using the `dismissible` prop it is possible to dismiss any `BAlert` inline. The alert must be v-modeled to a reactive value. This will add a close `X` button. Use the `dismiss-label` prop to change the hidden aria-label text associated with the dismiss button.

<<< DEMO ./demo/AlertDismissible.vue

### Auto-dismissing Alerts

To create a `BAlert` that dismisses automatically after a specified duration, set the `v-model` to the number of **milliseconds** you want the `BAlert` to remain visible. By default, the timer updates using `requestAnimationFrame`, which triggers an update approximately every second. Timed Alerts automatically pause when hovered over with a mouse, but you can disable this behavior using the `noHoverPause` prop. Ensure that the `v-model` value is an integer representing milliseconds. Any change to the `v-model` will reset the timer.

The **interval** prop determines how frequently the timer updates. While the default is `requestAnimationFrame`, you can set a custom interval. Negative values for either `v-model` or `interval` will stop the timer. If the `v-model` value does not divide evenly by the interval, the timer will continue to the nearest interval. For example, a `v-model` of 5400 ms with an interval of 1000 ms will run for 6000 ms. To avoid this, choose an interval that divides evenly into the `v-model`, such as 540 ms or 1080 ms.

<<< DEMO ./demo/AlertAutoDismissible.vue

## Transitions

An alert is visible as soon as it renders, so only the exit is animated. This follows Bootstrap's [transition model](https://getbootstrap.com/docs/6.0/customize/transitions/): CSS owns the motion and Vue only toggles state classes.

- While the alert leaves, `BAlert` adds `.hiding`. The `hidden` event fires and the promises returned by `hide()` and `toggle()` resolve after the CSS transition ends.
- The `noAnimation` prop (alias `noFade`) adds `.alert-instant` and skips the exit.
- Retune the motion with the `--bs-alert-transition-property`, `--bs-alert-transition-duration` and `--bs-alert-transition-timing` custom properties, or set the duration to `0s` to remove it. When the computed duration is `0s`, events resolve immediately.
- Bootstrap wraps its transitions in `prefers-reduced-motion: no-preference`, so users who ask for less motion get instant state changes.

::: warning Breaking change
Vue's `<Transition>` is no longer used, so the `transProps` prop is removed. Use the CSS options above instead. `BAlert` no longer adds the `.fade`, `.show` or `.alert-dismissible` classes.
:::

<<< DEMO ./demo/AlertTransitions.vue

## Exposed functions

`BAlert` exposes functions to manipulate the timer state through template refs. See the [Component Reference Exposed section](#comp-reference-balert-exposed) for details.

<<< DEMO ./demo/AlertFunctions.vue

## Accessibility

For information on managing ARIA attributes for alert triggers (when using dismissible alerts), see the [ARIA Trigger Registration for Component Visibility](/docs/reference/accessibility#aria-trigger-registration-for-component-visibility) section in the Accessibility reference.

## Timer Props

- `Immediate`: Setting this property to `false` will cause a timer to not start immediately upon render. A timer that is not started is not rendered. It must manually be started with `resume()` or `restart()`. Default is `true`.
- `showOnPause`: Setting this property to `false` will override the behavior of showing the Alert when the timer is paused. Default is `true`.

## Internationalization

<Internationalization />