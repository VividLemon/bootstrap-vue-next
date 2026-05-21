---
id: bformtimepicker
title: BFormTimePicker Migration
category: components
components:
  - BFormTimePicker
  - BFormTimepicker
  - BLink
match:
  - BFormTimePicker
  - BFormTimepicker
  - <BFormTimePicker>
tags:
  - migration
  - components
  - bformtimepicker
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BFormTimePicker Migration

## Summary

Migration notes for BFormTimePicker from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BFormTimePicker
- BFormTimepicker
- BLink

## Breaking Change

<DeprecatedFeature :reason="DeprecationReason.INSUFFICIENT_DEMAND" what="`BFormTimepicker` component">
  This component will not be implemented for v1.
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
