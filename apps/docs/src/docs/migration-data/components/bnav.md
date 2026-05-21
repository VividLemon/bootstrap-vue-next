---
id: bnav
title: BNav Migration
category: components
components:
  - BNav
  - BDropdown
match:
  - BNav
  - BDropdown
  - <BNav>
tags:
  - migration
  - components
  - bnav
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
related:
  - bdropdown
  - v-html-props
confidence: high
---

# BNav Migration

## Summary

Migration notes for BNav from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BNav
- BDropdown

## Breaking Change

`align` prop now takes values from [`AlignmentJustifyContent`](/docs/types#alignment): `start`, `center`, `end`, `between`, `around`, and `evenly`

### BNavItemDropdown

See [`BDropdown`](/docs/migration-data/components/bdropdown) for details

See the [v-html](/docs/migration-data/patterns/v-html-props) section for information on deprecation of the `html` prop.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- [bdropdown](/docs/migration-data/components/bdropdown)
- [v-html-props](/docs/migration-data/patterns/v-html-props)
