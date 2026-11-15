---
id: bcardimglazy
components:
- BCardImgLazy
- BImg
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BCardImgLazy
- <BCardImgLazy>
---

# BCardImgLazy Migration

## Summary

Migration notes for BCardImgLazy from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BCardImgLazy
- BImg

## Breaking Change

This functionality has been replaced by lazy loading on `<BImg>`. In most cases this is a direct component swap plus the `lazy`/native loading configuration described in [BImg notes](../components/bimg.md).

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [bimg](../components/bimg.md)
