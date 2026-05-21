---
id: bcard
title: BCard Migration
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
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
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
  Note that `end` and `start` placements are not yet fully implemented as Bootstrap 5 does not provide the necessary CSS classes (`card-img-end` and `card-img-start`).
  If these placements are needed, custom CSS will be required.
</DeprecatedFeature>

The `sub-title`, `sub-title-tag` and `sub-title-text-variant` props have been renamed to
`subtitle`, `subtitle-tag` and `subtitle-text-variant`, respectively.

<DeprecatedFeature :reason="DeprecationReason.VUE3_BOOTSTRAP5_CHANGES" what="Component-specific variant props (e.g. `footer-bg-variant`)" :plural="true">
  For `BCardBody`, `BCardHeader`, `BCardFooter`, `BCardTitle`, and `BCardText` components, the component name specific
  props are replaced by the generalized props. For example `footer-bg-variant` is replaced by `bg-variant`.
  This is true for all of the `body-*`, `header-*`, and `footer-*` props on these components. Note
  that the specific props are still retained on the main `BCard` component.

Similarly the `text-tag` and `title-tag` props have been replaced by `tag` on the `BCardText`
and `BCardTitle` components.
</DeprecatedFeature>

<DeprecatedFeature :reason="DeprecationReason.INSUFFICIENT_DEMAND" what="`body-border-variant` and `body-variant`" :plural="true" />

`body-border-variant` and `body-variant` are not implemented on `BCard` and `border-variant` is not
implemented on `BCardBody`.

See the [v-html](/docs/migration-data/patterns/v-html-props) section for information on deprecation of the `footer-html` and `header-html` props on
`BCard` and the `html` props on `BCardFooter` and `BCardHeader`.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- [v-html-props](/docs/migration-data/patterns/v-html-props)

<script setup lang="ts">
import {DeprecationReason} from '../../types/deprecation'
</script>
