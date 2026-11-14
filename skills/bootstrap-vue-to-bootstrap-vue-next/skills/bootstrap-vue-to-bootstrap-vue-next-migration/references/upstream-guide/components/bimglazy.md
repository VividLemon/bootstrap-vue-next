---
id: bimglazy
components:
- BImgLazy
- BImg
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BImgLazy
- <BImgLazy>
---

# BImgLazy Migration

## Summary

Migration notes for BImgLazy from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BImgLazy
- BImg

## Breaking Change

This functionality has been replaced by lazy loading on `<BImg>` see [BImg](../components/bimg.md) for details.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [bimg](../components/bimg.md)
