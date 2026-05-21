---
id: v-b-hover
title: v-b-hover Migration
category: directives
components:
  - BLink
match:
  - Hover
  - v-b-hover
  - useElementHover()
tags:
  - migration
  - directives
  - hover
safeRewrite: false
migrationType: directive-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# v-b-hover Migration

## Summary

Migration notes for v-b-hover from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BLink

## Breaking Change

<DeprecatedFeature :reason="DeprecationReason.INSUFFICIENT_DEMAND" what="`v-b-hover` directive">
  This directive will not be implemented. Consider using VueUse's
  <BLink href="https://vueuse.org/core/useElementHover/">`useElementHover()`</BLink>
  composable as a modern alternative.
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
