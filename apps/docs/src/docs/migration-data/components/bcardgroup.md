---
id: bcardgroup
title: BCardGroup Migration
description: 'Migration notes for BCardGroup from BootstrapVue to BootstrapVueNext.'
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
safeRewrite: true
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: false
confidence: high
---

# BCardGroup Migration

## Summary

Migration notes for BCardGroup from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BCardGroup

## Breaking Change

<DeprecatedFeature :reason="DeprecationReason.BOOTSTRAP_DEPRECATED" what="card deck and card columns props">
  The `deck` and `columns` props output CSS classes (`.card-deck` and `.card-columns`) that were removed from Bootstrap 5 and remain absent in Bootstrap 6.
  Use Bootstrap's grid system with `.row-cols-*` (`.md:row-cols-3` in Bootstrap 6) for responsive card layouts instead.
</DeprecatedFeature>

## Bootstrap 5 → 6 (v1 → v100)

| Before | After |
| --- | --- |
| `<BCardGroup deck>` | `<div class="contains-inline"><BCardGroup>…</BCardGroup></div>` |
| `<BCardGroup columns>` | Grid with `BRow` / `BCol`, or `.row.row-cols-*` |
| `BCardGroup` as a bare element | Needs a parent with `.contains-inline`; card groups now use a container query and stay stacked otherwise |

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
