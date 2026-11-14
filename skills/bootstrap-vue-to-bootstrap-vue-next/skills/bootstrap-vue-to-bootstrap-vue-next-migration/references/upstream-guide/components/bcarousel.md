---
id: bcarousel
components:
- BCarousel
- BCarouselSlide
safeRewrite: true
manualReviewRequired: false
confidence: high
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

See the [v-html](../patterns/v-html-props.md) section for information on deprecation of the `caption-html` and `text-html` props
on `BCarouselSlide`.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [v-html-props](../patterns/v-html-props.md)
