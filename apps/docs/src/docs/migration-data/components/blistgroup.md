---
id: blistgroup
title: BListGroup Migration
category: components

components:
  - BListGroup
directives: []
composables: []

tags:
  - migration
  - components
  - blistgroup

match:
  - BListGroup
  - <BListGroup>
replacement: {}

safeRewrite: true
manualReviewRequired: false

versionAdded: ""
versionRemoved: ""

description: Migration notes for BListGroup from BootstrapVue to BootstrapVueNext.

migrationType: component-migration
introducedIn: bootstrap-vue-next
related:
  - blink
confidence: high
---

# BListGroup Migration

## Summary

Migration notes for BListGroup from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BListGroup

## Breaking Change

See [BLink](/docs/migration-data/components/blink) for changes to link and router behavior.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [blink](/docs/migration-data/components/blink)
