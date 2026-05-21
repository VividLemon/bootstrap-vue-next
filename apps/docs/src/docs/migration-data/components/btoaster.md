---
id: btoaster
title: BToaster Migration
category: components
components:
  - BToaster
  - BApp
match:
  - BToaster
  - useToast
  - BApp
  - <BToaster>
tags:
  - migration
  - components
  - btoaster
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BToaster Migration

## Summary

Migration notes for BToaster from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BToaster
- BApp

## Breaking Change

The `BToaster` component has been deprecated. Its functionality has been replaced by the
[`useToast`](/docs/composables/useToast) composable working in concert with the
[`BApp`](/docs/components/app) component. See the documentation for
details.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- None
