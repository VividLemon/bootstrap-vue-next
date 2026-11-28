---
title: Avatar
description: >
  Avatars display a user or entity as an image, initials or custom content, with optional status
  indicators, sizes, theme colors and overlapping stacks. `BAvatar` and `BAvatarGroup` render
  Bootstrap's `.avatar` and `.avatar-stack` markup.
---

## Overview

Avatars are lightweight, inline components rendering Bootstrap's `.avatar` markup. They are
vertically centered beside adjoining text and can be used inside other components.

<<< DEMO ./demo/AvatarOverview.vue#template{vue-html}

## Avatar content

An avatar shows, in order of precedence: the default slot, the `src` image, the `text`, or nothing.
There is no default icon.

### Image content

Use the `src` prop to render an `<img class="avatar-img">` that covers the avatar (`object-fit: cover`).
Set `alt` to describe the image (it defaults to `'avatar'`).

<<< DEMO ./demo/AvatarImage.vue#template{vue-html}

**Notes:**

- When using a module bundler and project relative image URLs, please refer to the
  [Image Support](/docs/reference/images) reference section for additional details
- If the image fails to load, the avatar falls back to the `text` prop (or renders empty) and emits
  the `img-error` event

### Text content

Use the `text` prop for short initials (1 to 3 characters). Bootstrap transforms them to uppercase
and scales the font with the avatar size.

<<< DEMO ./demo/AvatarText.vue#template{vue-html}

### Custom content

Use the `default` slot for custom content such as an icon or SVG. The slot takes precedence over the
`src` and `text` props.

<<< DEMO ./demo/AvatarCustom.vue#template{vue-html}

## Styling

### Colors

Without a color the avatar uses Bootstrap's neutral avatar background. Use the `color` prop's `theme`
key to apply one of the theme colors (`.theme-<theme>`).

<<< DEMO ./demo/AvatarVariants.vue#template{vue-html}

Set `variant="subtle"` for the subtle style (`.avatar-subtle`), which uses the theme's subtle
background and foreground colors.

<<< DEMO ./demo/AvatarSubtle.vue#template{vue-html}

The `bg` and `fg` keys of `color` override the theme colors with utility classes. See the
[Color Themes Reference](/docs/reference/color-variants#key-interactions) for details.

<<< DEMO ./demo/AvatarVariantOverride.vue#template{vue-html}

### Sizing

The `size` prop accepts `'xs'`, `'sm'`, `'md'` (the default), `'lg'` and `'xl'`, which map to
Bootstrap's `.avatar-{size}` classes (1.5rem, 2rem, 2.5rem, 3rem and 4rem). Any other value is set as
the `--bs-avatar-size` CSS variable: numbers are converted to pixels, strings must include their unit.

<<< DEMO ./demo/AvatarSize.vue#template{vue-html}

### Shape

Avatars are circles. The `rounded`, `rounded-sides` and `square` props were removed: rounding
utility classes do not reach the inner image. Change the shape with the `--bs-avatar-border-radius`
CSS variable instead, for example `<BAvatar text="BV" style="--bs-avatar-border-radius: 0.5rem" />`.

### Alignment

`BAvatar` is vertically centered with adjoining content. Use a
[vertical alignment utility](/docs/reference/utility-classes) class such as `align-baseline` or
`align-top` to change it.

## Status

Set `status` to `'online'`, `'offline'`, `'busy'` or `'away'` to render a status indicator
(`.avatar-status`) in the bottom corner. The indicator has `role="img"` and an `aria-label` that
defaults to the capitalized status. Use `status-label` to translate or describe it.

<<< DEMO ./demo/AvatarStatus.vue#template{vue-html}

## Links, buttons and badges

`BAvatar` always renders a non-interactive `<span>`, as Bootstrap's avatar does. Wrap it in a link or
button yourself, and give the wrapper an accessible name (the image `alt` or an `aria-label`).

<<< DEMO ./demo/AvatarLink.vue#template{vue-html}

Badges are composed the same way: put the avatar and a positioned [`BBadge`](/docs/components/badge)
in a `position-relative` wrapper. For presence information, prefer the `status` prop.

<<< DEMO ./demo/AvatarBadge.vue#template{vue-html}

<BAlert :color="{ theme: 'warning' }" :model-value="true">

Wrapping avatars in links or other elements breaks `BAvatarGroup`: the stack styles its `.avatar`
direct children, so wrapped avatars lose the overlap and border.

</BAlert>

## Avatar groups

`BAvatarGroup` renders Bootstrap's `.avatar-stack` with `role="group"`. Give it an `aria-label`.
Avatars must be its direct children.

<<< DEMO ./demo/AvatarGroups.vue#template{vue-html}

**Note:** `.avatar-stack` uses `flex-direction: row-reverse`, so the first avatar in the markup is
drawn right-most and on top. Screen readers still read the avatars in markup order. A "+N" overflow
avatar is a plain `BAvatar` with `text`.

### Group size

The group `size` prop takes the same values as `BAvatar`'s and wins over the size of each avatar.
Literal sizes render `.avatar-stack-{size}`; custom sizes are set on every child avatar.

<<< DEMO ./demo/AvatarGroupSize.vue#template{vue-html}

### Group color

A `.theme-*` class on the group colors every avatar that has no color of its own.

<<< DEMO ./demo/AvatarGroupVariant.vue#template{vue-html}

### Group overlap

Avatars in a group overlap by `0.3` of their size by default. Set `overlap` to a number between `0`
(no overlap) and `1`; it is applied as `--bs-avatar-stack-spacing` on every child avatar.

<<< DEMO ./demo/AvatarGroupOverlap.vue#template{vue-html}

## Accessibility

- Image avatars need a meaningful `alt` (or an empty `alt=""` when a wrapping link or button already
  carries the name).
- Status indicators are announced through their `aria-label`; set `status-label` for other languages.
- A link or button wrapping an avatar needs an accessible name.
- `BAvatarGroup` has `role="group"`; add an `aria-label` describing the group.
