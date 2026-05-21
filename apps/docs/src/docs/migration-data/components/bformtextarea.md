---
id: bformtextarea
title: BFormTextarea Migration
category: components
components:
  - BFormTextarea
  - BLink
match:
  - BFormTextarea
  - $refs
  - <BFormTextarea>
tags:
  - migration
  - components
  - bformtextarea
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BFormTextarea Migration

## Summary

Migration notes for BFormTextarea from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BFormTextarea
- BLink

## Breaking Change

<DeprecatedFeature :reason="DeprecationReason.VUE3_BOOTSTRAP5_CHANGES" what="`trim`, `lazy`, and `number` props on `BFormTextarea`" :plural="true">
  We support the native modifiers
  <BLink href="https://vuejs.org/guide/essentials/forms.html#modifiers">`trim`, `lazy`, and `number`</BLink>.
  They work as documented in Vue.js, so there is no longer a need for the properties.
</DeprecatedFeature>

Access to the native `textarea` element is implemented differently due to changes in how Vue 3
handles references. Use the `element` property from the component's template ref instead of accessing `$refs` directly.
See the [BFormTextarea documentation](/docs/components/form-textarea#exposed-input-properties-and-methods) for more details.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- None

<script setup lang="ts">
import {DeprecationReason} from '../../types/deprecation'
</script>
