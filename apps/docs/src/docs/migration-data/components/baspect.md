---
id: baspect
title: BAspect Migration
category: components
components:
  - BAspect
  - BLink
match:
  - BAspect
  - <BAspect>
tags:
  - migration
  - components
  - baspect
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BAspect Migration

## Summary

Migration notes for BAspect from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BAspect
- BLink

## Breaking Change

<DeprecatedFeature :reason="DeprecationReason.INSUFFICIENT_DEMAND" what="`BAspect` component">
  This component will not be implemented for v1 due to insufficient demand.
  Bootstrap's <BLink href="https://getbootstrap.com/docs/5.3/helpers/ratio/">ratio helper utilities</BLink> can be used directly instead.
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
