---
id: bcalendar
title: BCalendar Migration
category: components
components:
  - BCalendar
  - BLink
match:
  - BCalendar
  - <BCalendar>
tags:
  - migration
  - components
  - bcalendar
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BCalendar Migration

## Summary

Migration notes for BCalendar from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BCalendar
- BLink

## Breaking Change

<DeprecatedFeature :reason="DeprecationReason.INSUFFICIENT_DEMAND" what="`BCalendar` component">
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
