---
id: bcarousel
title: BCarousel Migration
category: components
components:
  - BCarousel
  - BCarouselSlide
match:
  - BCarousel
  - sliding-start
  - sliding-end
  - label-indicators
  - indicators-button-label
  - caption-html
  - text-html
  - BCarouselSlide
  - <BCarousel>
tags:
  - migration
  - components
  - bcarousel
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
related:
  - v-html-props
confidence: high
---

# BCarousel Migration

## Summary

Migration notes for BCarousel from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BCarousel
- BCarouselSlide

## Breaking Change

The `sliding-start` and `sliding-end` events have been renamed to `slide` and `slid`.
The `label-indicators` prop has been renamed to `indicators-button-label`.

See the [v-html](/docs/migration-data/patterns/v-html-props) section for information on deprecation of the `caption-html` and `text-html` props
on `BCarouselSlide`.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- [v-html-props](/docs/migration-data/patterns/v-html-props)
