---
id: bcardgroup
title: BCardGroup Migration
category: components
components:
  - BCardGroup
match:
  - BCardGroup
  - .card-deck
  - .card-columns
  - .row-cols-*
  - <BCardGroup>
tags:
  - migration
  - components
  - bcardgroup
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BCardGroup Migration

## Summary

Migration notes for BCardGroup from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BCardGroup

## Breaking Change

<DeprecatedFeature :reason="DeprecationReason.BOOTSTRAP_5_REMOVED" what="card deck and card columns props">
  The `deck` and `columns` props output CSS classes (`.card-deck` and `.card-columns`) that were removed from Bootstrap 5.
  Use Bootstrap's grid system with `.row-cols-*` classes for responsive card layouts instead.
  Only the default card group (without `deck` or `columns` props) works with Bootstrap 5 and is responsive.
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
