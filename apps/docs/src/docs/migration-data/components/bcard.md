---
id: bcard
title: BCard Migration
description: 'Migration notes for BCard from BootstrapVue to BootstrapVueNext.'
category: components
components:
  - BCard
  - BCardImg
  - BCardBody
  - BCardHeader
  - BCardFooter
  - BCardTitle
  - BCardText
match:
  - BCard
  - img-placement
  - BCardImg
  - card-img-end
  - card-img-start
  - sub-title
  - sub-title-tag
  - sub-title-text-variant
  - subtitle-tag
  - subtitle-text-variant
  - footer-bg-variant
  - BCardBody
  - BCardHeader
  - BCardFooter
  - BCardTitle
  - BCardText
tags:
  - migration
  - components
  - bcard
safeRewrite: true
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: false
related:
  - v-html-props
confidence: high
---

# BCard Migration

## Summary

Migration notes for BCard from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BCard
- BCardImg
- BCardBody
- BCardHeader
- BCardFooter
- BCardTitle
- BCardText

## Breaking Change

Image placement is accomplished by the single `img-placement` prop, which takes the values
`top`, `bottom`, `start`, `end`, or `overlay`. This allows us to deprecate the `imgBottom`,
`imgEnd`, `imgLeft`, `imgRight`, `imgStart`, and `imgTop` props from `BCard`.

<DeprecatedFeature :reason="DeprecationReason.BOOTSTRAP_DEPRECATED" what="`top`, `bottom`, `left`, and `right` props on `BCardImg`" :plural="true">
  Use a single `placement` prop that takes the values `top` or `bottom` instead.
</DeprecatedFeature>

## Bootstrap 5 → 6 (v1 → v100)

| Before (Bootstrap 5) | After (Bootstrap 6) |
| --- | --- |
| `BCard` with `img-placement="start"` rendered `.flex-row` | Renders `.card-row`; the image gets `.card-img-start` |
| `BCard` with `img-placement="end"` rendered `.flex-row-reverse` | Renders `.card-row`; the image gets `.card-img-end` |
| `BCardSubtitle` rendered `.card-subtitle.mb-2` | Renders `.card-subtitle` only; Bootstrap 6 handles the spacing |
| `BCardGroup deck` / `columns` (`.card-deck`, `.card-columns`) | Removed. Use `BCardGroup` inside a `.contains-inline` parent, or `BRow`/`BCol` for grids |
| `.card-link` | Removed from Bootstrap 6. Use a plain link with flex/gap utilities |
| `BPlaceholderCard` forwarded `img-placement` to `BCardImg` as a stray attribute | Now passes `placement`, so the image class matches the card |

The `.card-deck` and `.card-columns` styles previously shipped by BootstrapVueNext have been removed.
`BCardFooter` now correctly uses `BCardFooterProps` (an alias of the header props, so there is no type change).

Card color props now use the Bootstrap 6 theme API: `variant` is replaced by `theme` (class `theme-*`),
`bg-variant` by `bg` (class `bg-*`), `text-variant` by `fg` (class `fg-*`) and `border-variant` by `border`
(class `border-*`). Values such as `primary-subtle` become `subtle-primary`, and `danger-emphasis` becomes
`emphasis-danger`. See [Color Themes](/docs/reference/color-variants).

The `sub-title`, `sub-title-tag` and `sub-title-text-variant` props have been renamed to
`subtitle`, `subtitle-tag` and `subtitle-fg`, respectively.

<DeprecatedFeature :reason="DeprecationReason.VUE3_BOOTSTRAP5_CHANGES" what="Component-specific variant props (e.g. `footer-bg-variant`)" :plural="true">
  For `BCardBody`, `BCardHeader`, `BCardFooter`, `BCardTitle`, and `BCardText` components, the component name specific
  props are replaced by the generalized props. For example `footer-bg-variant` is replaced by `bg`.
  This is true for all of the `body-*`, `header-*`, and `footer-*` props on these components. Note
  that the specific props are still retained on the main `BCard` component. These renames are simple prop-to-prop mappings.

Similarly the `text-tag` and `title-tag` props have been replaced by `tag` on the `BCardText`
and `BCardTitle` components.
</DeprecatedFeature>

See the [v-html](/docs/migration-data/patterns/v-html-props) section for information on deprecation of the `footer-html` and `header-html` props on
`BCard` and the `html` props on `BCardFooter` and `BCardHeader`.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [v-html-props](/docs/migration-data/patterns/v-html-props)

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
