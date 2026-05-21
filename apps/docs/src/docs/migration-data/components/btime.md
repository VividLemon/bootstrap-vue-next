---
id: btime
title: BTime Migration
category: components
components:
  - BTime
  - BLink
match:
  - BTime
  - <BTime>
tags:
  - migration
  - components
  - btime
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BTime Migration

## Summary

Migration notes for BTime from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BTime
- BLink

## Breaking Change

<DeprecatedFeature :reason="DeprecationReason.INSUFFICIENT_DEMAND" what="`BTime` component">
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
