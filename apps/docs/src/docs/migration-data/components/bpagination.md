---
id: bpagination
title: BPagination Migration
category: components

components:
  - BPagination
directives: []
composables: []

tags:
  - migration
  - components
  - bpagination

match:
  - BPagination
  - <BPagination>
replacement: {}

safeRewrite: true
manualReviewRequired: false

versionAdded: ""
versionRemoved: ""

description: Migration notes for BPagination from BootstrapVue to BootstrapVueNext.

migrationType: component-migration
introducedIn: bootstrap-vue-next
related:
  - show-hide
confidence: high
---

# BPagination Migration

## Summary

Migration notes for BPagination from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BPagination

## Breaking Change

See [Show and Hide](/docs/migration-data/patterns/show-hide) shared properties.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [show-hide](/docs/migration-data/patterns/show-hide)
