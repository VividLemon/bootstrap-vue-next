---
id: bformtextarea
title: BFormTextarea Migration
category: components

components:
  - BFormTextarea
  - BLink
directives: []
composables: []

tags:
  - migration
  - components
  - bformtextarea

match:
  - BFormTextarea
  - $refs
  - <BFormTextarea>
replacement: {}

safeRewrite: true
manualReviewRequired: false

versionAdded: ""
versionRemoved: ""

description: Migration notes for BFormTextarea from BootstrapVue to BootstrapVueNext.

migrationType: component-migration
introducedIn: bootstrap-vue-next
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

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
