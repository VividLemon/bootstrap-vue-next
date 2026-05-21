---
id: bskeleton
title: BSkeleton to BPlaceholder Migration
category: components
components:
  - BSkeleton
  - BPlaceholderButton
  - BPlaceholder
  - BSkeletonIcon
  - BPlaceholderWrapper
  - BSkeletonImg
match:
  - BSkeleton
  - BPlaceholderButton
  - <BSkeleton>
tags:
  - migration
  - components
  - bskeleton
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BSkeleton to BPlaceholder Migration

## Summary

Migration notes for BSkeleton from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BSkeleton
- BPlaceholderButton
- BPlaceholder
- BSkeletonIcon
- BPlaceholderWrapper
- BSkeletonImg

## Breaking Change

`<BSkeleton*>` components have been replaced by the more appropriately named `<BPlaceholder*>` components.

`<BSkeletonIcon>` is deprecated along with the rest of the BootstrapVue icon support. See our
[icon documentation](/docs/icons) for details. This functionality can be replicated by using
`<BPlaceholderWrapper>` with your choice of icon replacement in the `loading` slot.

`<BSkeletonImg>` is deprecated, using `<BPlaceholderWrapper>` should be a workable replacement.

`animation` values have changed from `Wave`, `Fade`, `Throb` and `None` to `wave`, `glow`,
and `undefined` to reflect the [Bootstrap 5 animations](https://getbootstrap.com/docs/5.3/components/placeholders/#animation)

`type` has been deprecated. [`BPlaceholderButton`](/docs/components/placeholder#placeholder-buttons) is a replacement for the button type.
If you find a need for the other types (Avatar or Input), please open an issue or propose a pull request.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- None
