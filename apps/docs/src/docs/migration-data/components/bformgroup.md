---
id: bformgroup
title: BFormGroup Migration
category: components

components:
  - BFormGroup
directives: []
composables: []

tags:
  - migration
  - components
  - bformgroup

match:
  - BFormGroup
  - label-visually-hidden
  - label-sronly
  - <BFormGroup>
replacement: {}

safeRewrite: true
manualReviewRequired: false

versionAdded: ""
versionRemoved: ""

description: Migration notes for BFormGroup from BootstrapVue to BootstrapVueNext.

migrationType: component-migration
introducedIn: bootstrap-vue-next
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

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None
