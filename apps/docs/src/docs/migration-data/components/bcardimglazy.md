---
id: bcardimglazy
title: BCardImgLazy Migration
category: components
components:
  - BCardImgLazy
  - BImg
match:
  - BCardImgLazy
  - <BCardImgLazy>
tags:
  - migration
  - components
  - bcardimglazy
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
related:
  - bimg
confidence: high
---

# BCardImgLazy Migration

## Summary

Migration notes for BCardImgLazy from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BCardImgLazy
- BImg

## Breaking Change

This functionality has been replaced by lazy loading on `<BImg>` see [BImg notes](/docs/migration-data/components/bimg) for details.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- [bimg](/docs/migration-data/components/bimg)
