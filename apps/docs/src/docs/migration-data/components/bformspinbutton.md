---
id: bformspinbutton
title: BFormSpinButton Migration
category: components
components:
  - BFormSpinButton
match:
  - BFormSpinbutton
tags:
  - migration
  - components
  - bformspinbutton
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BFormSpinButton Migration

## Summary

Migration notes for BFormSpinButton from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BFormSpinButton

## Breaking Change

See [BForm Components](/docs/components/form-spinbutton)



The locale property in BootstrapVueNext only allows a for a single locale, while BSV allows for an array of locales. If this is
a limitation that affect your scenario, please [file an issue](https://github.com/bootstrap-vue-next/bootstrap-vue-next/issues) with an explanation of the expected behavior.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- None
