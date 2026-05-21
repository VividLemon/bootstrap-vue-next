---
id: bformdatepicker
title: BFormDatePicker Migration
category: components
components:
  - BFormDatePicker
  - BFormDatepicker
  - BLink
match:
  - BFormDatePicker
  - BFormDatepicker
  - <BFormDatePicker>
tags:
  - migration
  - components
  - bformdatepicker
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BFormDatePicker Migration

## Summary

Migration notes for BFormDatePicker from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BFormDatePicker
- BFormDatepicker
- BLink

## Breaking Change

<DeprecatedFeature :reason="DeprecationReason.MODERN_ALTERNATIVE" what="`BFormDatepicker` component">
  See <BLink href="https://github.com/bootstrap-vue-next/bootstrap-vue-next/issues/1860#event-14531487213">issue #1860</BLink> for details.
</DeprecatedFeature>

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- None

<script setup lang="ts">
import {DeprecationReason} from '../../types/deprecation'
</script>
