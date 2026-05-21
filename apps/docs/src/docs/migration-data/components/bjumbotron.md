---
id: bjumbotron
title: BJumbotron Migration
category: components
components:
  - BJumbotron
match:
  - BJumbotron
  - <BJumbotron>
tags:
  - migration
  - components
  - bjumbotron
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BJumbotron Migration

## Summary

Migration notes for BJumbotron from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BJumbotron

## Breaking Change

<DeprecatedFeature :reason="DeprecationReason.INSUFFICIENT_DEMAND" what="`BJumbotron` component">
  This component will not be implemented for v1 due to insufficient demand.
  Bootstrap has deprecated their Jumbotron component, but it can be replicated using
  utility classes if needed.
</DeprecatedFeature>

Note that Bootstrap has deprecated their Jumbotron component, but it can be replicated using
utility classes. See their [migration guide](https://getbootstrap.com/docs/5.3/migration/#jumbotron)
for details.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- None

<script setup lang="ts">
import {DeprecationReason} from '../../types/deprecation'
</script>
