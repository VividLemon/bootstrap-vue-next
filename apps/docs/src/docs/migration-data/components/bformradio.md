---
id: bformradio
title: BFormRadio Migration
category: components
components:
  - BFormRadio
  - BFormRadioGroup
  - BFormCheckboxGroup
  - BFormSelect
match:
  - BFormRadio
  - BFormRadioGroup
  - BFormCheckboxGroup
  - BFormSelect
  - v-model
  - <BFormRadio>
tags:
  - migration
  - components
  - bformradio
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BFormRadio Migration

## Summary

Migration notes for BFormRadio from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BFormRadio
- BFormRadioGroup
- BFormCheckboxGroup
- BFormSelect

## Breaking Change

See [BForm Components](/docs/components/form-radio)

`BFormRadioGroup`, `BFormCheckboxGroup`, and `BFormSelect` now provide TypeScript type safety for the `options` prop:
the `v-model` type is inferred from the option values. See the
[Type-Safe Options](/docs/reference/type-safe-options) reference for details.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- None
