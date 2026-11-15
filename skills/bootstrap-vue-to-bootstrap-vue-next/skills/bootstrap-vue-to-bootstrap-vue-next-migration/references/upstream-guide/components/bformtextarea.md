---
id: bformtextarea
components:
- BFormTextarea
- BLink
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BFormTextarea
- $refs
- <BFormTextarea>
---

# BFormTextarea Migration

## Summary

Migration notes for BFormTextarea from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BFormTextarea
- BLink

## Breaking Change

> **Deprecated / not supported** — `trim`, `lazy`, and `number` props on `BFormTextarea` (Vue 3 or Bootstrap 5 changes made this less relevant).

We support the native modifiers
  [`trim`, `lazy`, and `number`](https://vuejs.org/guide/essentials/forms.html#modifiers).
  They work as documented in Vue.js, so there is no longer a need for the properties.

Access to the native `textarea` element is implemented differently due to changes in how Vue 3
handles references. Use the `element` property from the component's template ref instead of accessing `$refs` directly.
See the [BFormTextarea documentation](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/form-textarea#exposed-input-properties-and-methods) for more details.

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
