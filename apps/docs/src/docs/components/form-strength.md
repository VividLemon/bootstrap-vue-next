---
title: Form Strength
description: 'A password strength meter with segments or a single bar and optional text feedback, built on the Bootstrap v6 Password strength component.'
---

<<< DEMO ./demo/FormStrengthOverview.vue

## Overview

`BFormStrength` renders Bootstrap v6's password strength meter. Bind the password with the `value`
prop; the component scores it with the same rules as Bootstrap's `strength.ts` and sets
`data-bs-strength="weak|fair|good|strong"` and the `.active` segments. Scoring is pure
computation, so the meter also renders on the server.

The scoring is available on its own as the
[`usePasswordStrength`](/docs/composables/usePasswordStrength) composable.

## Bar

Set `bar` to render a single `.strength-bar` that grows with the strength instead of four
segments.

<<< DEMO ./demo/FormStrengthBar.vue#template{vue-html}

## Text feedback

Set `show-text` to render a `.strength-text` message after the meter. It is a polite live region,
so screen readers announce changes. Change the wording per level with `messages`.

<<< DEMO ./demo/FormStrengthText.vue

## Custom scoring

`min-length`, `weights` and `thresholds` adjust the built-in rules. `scorer` replaces them with your
own function, which receives the password and returns a score that `thresholds` maps to a level.

<<< DEMO ./demo/FormStrengthScorer.vue

## Events

`change` is emitted with `{strength, score}` whenever the level changes. It never contains the
password.

## Accessibility

The meter is decorative (`aria-hidden="true"`). Describe your password requirements in text and
link that text to the input with `aria-describedby`, and use `show-text` (a live region) to
announce the current strength.

::: info NOTE
Bootstrap 6.0.0-alpha.1's `strength.ts` writes the text color to a variable that the shipped CSS
doesn't read, so its text stays gray. `BFormStrength` sets `--bs-strength-color` to the level's
`--bs-{danger|warning|info|success}-fg` color.
:::
