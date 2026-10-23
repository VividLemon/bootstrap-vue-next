---
id: bavatar
title: BAvatar Migration
description: 'Migration notes for the BAvatar and BAvatarGroup rewrite on top of the Bootstrap 6 avatar (v1 to v100).'
category: components
components:
  - BAvatar
  - BAvatarGroup
match:
  - BAvatar
  - .svg
  - badge-placement
  - badge-placement='top'
  - badge-top
  - badge-placement='end'
  - badge-right
  - badge-offset
  - <BAvatar>
tags:
  - migration
  - components
  - bavatar
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BAvatar Migration (v1 → v100)

## Summary

`BAvatar` and `BAvatarGroup` were rewritten as thin wrappers over Bootstrap 6's CSS-only
[avatar component](https://getbootstrap.com/docs/6.0/components/avatar/). The custom `.b-avatar*`
styles and the legacy BootstrapVue API were removed with no backward compatibility.

## Affected APIs

- BAvatar
- BAvatarGroup

## Breaking Change

### Markup

| Old | New |
| --- | --- |
| `.b-avatar` | `.avatar` |
| `.b-avatar-img` / inner `img` | `.avatar-img` |
| `.b-avatar-group` + `.b-avatar-group-inner` | `.avatar-stack` (no inner wrapper, no `role="group"`) |
| badge (`.b-avatar-custom` / `BBadge`) | `.avatar-status.status-*` |

### `BAvatar` props

| Old | New |
| --- | --- |
| `src` | `img` |
| `alt` | `img-alt` |
| `text` | Default slot (for example initials) |
| `size` (`sm`, `lg`, number, CSS unit) | `size`: `xs`, `sm`, `lg`, `xl` (unset is the default size). Use `style="--bs-avatar-size: 8rem"` for custom sizes |
| `variant`, `bg-variant`, `text-variant` | `variant` (maps to `theme-*`), plus `subtle`. `light` and `dark` do not exist in Bootstrap 6 |
| `badge`, `badge-*` | `status`: `online`, `offline`, `busy`, `away` (with optional `status-label`), or a separate `BBadge` |
| `button`, `button-type`, `@click` | Wrap the avatar in `BButton` or a native `button` |
| `href`, `to`, `target`, other `BLink` props | Wrap the avatar in `BLink` |
| `rounded*`, `square` | Removed. Override the `--bs-avatar-border-radius` token |
| `@img-error` | Removed |
| default person icon | Removed. Provide content with the default slot |

The `badge` slot was removed. The `default` slot is now only rendered when `img` is not set.

### `BAvatarGroup`

| Old | New |
| --- | --- |
| `overlap`, `tag` | Removed |
| `variant`, `bg-variant`, `text-variant`, `rounded*`, `square` | Removed. Set them on each `BAvatar` |
| `size` (`sm`, `lg`, number, CSS unit) | `size`: `xs`, `sm`, `lg`, `xl`; passed down to every child |
| default slot (no scope) | Default slot scope `{count}`: the number of avatars in the group |

## Before and After

<<< FRAGMENT ../../demo/AvatarMigration.vue#template{vue-html}

## Migration Notes

- Icons are no longer built in. Use the default slot with [unplugin-icons](/docs/icons) or an `.svg`.
- Bootstrap 6 is required for the avatar styles.

## Safe Automatic Rewrite

No. The prop removals need manual review.
