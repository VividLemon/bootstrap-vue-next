---
title: usePasswordStrength
description: 'Score a password with the Bootstrap v6 password strength rules, without rendering a meter'
---

`usePasswordStrength` is the scoring behind [`BFormStrength`](/docs/components/form-strength). Use it
on its own when you need the score for validation or for your own UI. It is pure computation (no
DOM access), so it also works during server-side rendering.

<<< DEMO ./demo/UsePasswordStrengthBasic.vue

## Parameters

`password` accepts a plain value, a ref or a getter. `options` accepts a plain value or a ref: to derive the options from other state, pass a `computed`, so the object is only rebuilt when its inputs change.

- `password: MaybeRefOrGetter<string>`
- `options?: MaybeRef<PasswordStrengthOptions | undefined>`
  - `minLength` (default `8`): the length that earns the length point; `minLength + 4` earns another
  - `weights`: points per criterion, merged with the defaults (each `1`): `minLength`,
    `extraLength`, `lowercase`, `uppercase`, `numbers`, `special`, `multipleSpecial`, `longPassword`
    (16 characters or more)
  - `thresholds` (default `{weak: 2, fair: 4, good: 6}`): the highest score for each level, merged
    with the defaults key by key; anything above `good` is `strong`
  - `scorer`: `(password: string) => number`, replaces the built-in scoring. An empty password
    always scores `0`

## Return value

- `score: ComputedRef<number>`: `0` for an empty password
- `strength: ComputedRef<'weak' | 'fair' | 'good' | 'strong' | null>`: `null` when the score is `0`
