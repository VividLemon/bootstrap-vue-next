---
id: bbuttonclose
title: BButtonClose Migration
category: components
components:
  - BButtonClose
  - BCloseButton
  - BLink
match:
  - BButtonClose
  - BCloseButton
  - text-variant
  - <BButtonClose>
tags:
  - migration
  - components
  - bbuttonclose
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BButtonClose Migration

## Summary

Migration notes for BButtonClose from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BButtonClose
- BCloseButton
- BLink

## Breaking Change

`BButtonClose` has been renamed to `BCloseButton` for consistency with [Bootstrap](https://getbootstrap.com/docs/5.3/components/close-button/)

<DeprecatedFeature :reason="DeprecationReason.BOOTSTRAP_DEPRECATED" what="`content` and `text-variant` props on `BButtonClose`" :plural="true">
  Bootstrap 5 moved to using an embedded svg for the close icon.
  See <BLink href="https://getbootstrap.com/docs/5.3/migration/#close-button-1">their migration guide</BLink> for details.
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
