---
id: v-b-visible
components:
- BLink
safeRewrite: true
manualReviewRequired: true
confidence: high
match:
- Visible
- v-b-visible
- useElementVisibility()
---

# v-b-visible Migration

## Summary

Migration notes for v-b-visible from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BLink

## Breaking Change

> **Deprecated / not supported** — `v-b-visible` directive (a modern alternative exists).

This directive will not be implemented. Use VueUse's
  [`useElementVisibility()`](https://vueuse.org/core/useElementVisibility/)
  composable instead, which provides the same functionality with better performance. If your project does not already use VueUse, include that dependency as part of the migration.

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical, but review the result when surrounding behavior or adjacent props may affect the final markup.

## Related Migrations

- None

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
