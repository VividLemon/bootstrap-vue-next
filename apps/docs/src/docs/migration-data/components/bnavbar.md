---
id: bnavbar
title: BNavbar Migration
category: components
components:
  - BNavbar
match:
  - BNavbar
  - v-b-color-mode
  - useColorMode
  - <BNavbar>
tags:
  - migration
  - components
  - bnavbar
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
related:
  - show-hide
confidence: high
---

# BNavbar Migration

## Summary

Migration notes for BNavbar from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BNavbar

## Breaking Change

The `type` prop is deprecated. Use the `v-b-color-mode` directive or `useColorMode` composable instead. Details in our [docs](/docs/components/navbar#color-schemes)

### BNavbarNav

`align` prop now takes values from [`AlignmentJustifyContent`](/docs/types#alignment): `start`, `center`, `end`, `between`, `around`, and `evenly`

See [Show and Hide](/docs/migration-data/patterns/show-hide) shared properties.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- [show-hide](/docs/migration-data/patterns/show-hide)
