---
title: Avatar
description: >
  Avatars display a user profile as an image or short text such as initials. `BAvatar` wraps
  Bootstrap's CSS-only avatar component, and `BAvatarGroup` wraps the avatar stack.
---

## Overview

`BAvatar` renders `<span class="avatar">`. Provide initials (or any content) with the default slot, or an
image with the `img` prop. When `img` is set the default slot is not rendered. Provide `img-alt`
for the image's `alt` text.

<<< DEMO ./demo/AvatarOverview.vue#template{vue-html}

## Sizes

Use the `size` prop with `xs`, `sm`, `lg` or `xl`. Leave it unset for the default size.

<<< DEMO ./demo/AvatarSize.vue#template{vue-html}

For other sizes, set the `--bs-avatar-size` CSS variable with `style`.

## Variants

The `variant` prop applies a Bootstrap `theme-*` class. Add `subtle` to apply the `avatar-subtle` style.

<<< DEMO ./demo/AvatarVariants.vue#template{vue-html}

## Status

The `status` prop renders a status indicator (`online`, `offline`, `busy` or `away`) with
`role="img"`. The label defaults to the capitalized status and can be changed with `status-label`.

<<< DEMO ./demo/AvatarStatus.vue#template{vue-html}

## Avatar groups

`BAvatarGroup` renders `<div class="avatar-stack">`. Its `size` prop is passed down to
all child avatars. The default slot receives `count`, the number of avatars in the group, which is useful
for an overflow indicator.

<<< DEMO ./demo/AvatarGroups.vue#template{vue-html}

## Migrating from the previous implementation

See the [BAvatar migration notes](/docs/migration-data/components/bavatar) for the old to new API mapping.
