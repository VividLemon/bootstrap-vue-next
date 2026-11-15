---
id: v-b-hover
components:
- BLink
safeRewrite: true
manualReviewRequired: true
confidence: high
match:
- Hover
- v-b-hover
- useElementHover()
---

# v-b-hover Migration

## Summary

Migration notes for v-b-hover from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BLink

## Breaking Change

> **Deprecated / not supported** — `v-b-hover` directive (not implemented (insufficient demand for initial release)).

This directive will not be implemented. Consider using VueUse's
  [`useElementHover()`](https://vueuse.org/core/useElementHover/)
  composable as a modern alternative. If your project does not already use VueUse, include that dependency as part of the migration.

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical, but review the result when surrounding behavior or adjacent props may affect the final markup.

## Related Migrations

- None

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
