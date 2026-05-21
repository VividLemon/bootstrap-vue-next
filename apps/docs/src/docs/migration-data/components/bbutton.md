---
id: bbutton
title: BButton Migration
category: components
components:
  - BButton
  - BLink
match:
  - BButton
  - <BButton>
tags:
  - migration
  - components
  - bbutton
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BButton Migration

## Summary

Migration notes for BButton from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BButton
- BLink

## Breaking Change

<DeprecatedFeature :reason="DeprecationReason.BOOTSTRAP_DEPRECATED" what="`block` prop on `BButton`">
  See our <BLink href="/docs/components/button#block-level-buttons">`BButton` documentation</BLink>
  and <BLink href="https://getbootstrap.com/docs/5.3/components/buttons/#block-buttons">Bootstrap's documentation</BLink> for
  details on creating block-level buttons with utility classes.
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
