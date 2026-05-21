---
id: btablelight
title: BTableLight Migration
category: components

components:
  - BTableLight
directives: []
composables: []

tags:
  - migration
  - components
  - btablelight

match:
  - BTableLight
  - table-colgroup
  - <BTableLight>
replacement: {}

safeRewrite: true
manualReviewRequired: false

versionAdded: ""
versionRemoved: ""

description: Migration notes for BTableLight from BootstrapVue to BootstrapVueNext.

migrationType: component-migration
introducedIn: bootstrap-vue-next
related:
  - v-html-props
confidence: high
---

# BTableLight Migration

## Summary

Migration notes for BTableLight from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BTableLight

## Breaking Change

See the [v-html](/docs/migration-data/patterns/v-html-props) section for information on deprecation of the `html` prop.

The slot scope for `table-colgroup` slot now only contains the `fields` prop, with the `columns` prop removed.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [v-html-props](/docs/migration-data/patterns/v-html-props)
