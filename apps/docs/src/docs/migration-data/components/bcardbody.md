---
id: bcardbody
title: BCardBody Migration
category: components
components:
  - BCardBody
match:
  - BCardBody
  - border-variant
  - <BCardBody>
tags:
  - migration
  - components
  - bcardbody
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BCardBody Migration

## Summary

Migration notes for BCardBody from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BCardBody

## Breaking Change

<DeprecatedFeature :reason="DeprecationReason.INSUFFICIENT_DEMAND" what="`border-variant`" />

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- None

<script setup lang="ts">
import {DeprecationReason} from '../../types/deprecation'
</script>
