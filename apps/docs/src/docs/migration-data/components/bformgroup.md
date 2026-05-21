---
id: bformgroup
title: BFormGroup Migration
category: components
components:
  - BFormGroup
match:
  - BFormGroup
  - label-visually-hidden
  - label-sronly
  - <BFormGroup>
tags:
  - migration
  - components
  - bformgroup
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BFormGroup Migration

## Summary

Migration notes for BFormGroup from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BFormGroup

## Breaking Change

Use `label-visually-hidden` instead of `label-sronly` per
[Bootstrap Migration Guide](https://getbootstrap.com/docs/5.3/migration/#helpers-2)

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- None
