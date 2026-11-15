---
id: bbutton
components:
- BButton
- BLink
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BButton
- <BButton>
---

# BButton Migration

## Summary

Migration notes for BButton from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BButton
- BLink

## Breaking Change

> **Deprecated / not supported** — `block` prop on `BButton` (deprecated by Bootstrap).

See our [`BButton` documentation](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/button#block-level-buttons)
  and [Bootstrap's documentation](https://getbootstrap.com/docs/5.3/components/buttons/#block-buttons) for
  details on creating block-level buttons with utility classes such as `d-grid` or width utilities.

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
