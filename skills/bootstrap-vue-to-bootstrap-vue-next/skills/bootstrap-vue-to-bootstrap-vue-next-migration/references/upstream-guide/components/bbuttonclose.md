---
id: bbuttonclose
components:
- BButtonClose
- BCloseButton
- BLink
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BButtonClose
- BCloseButton
- text-variant
- <BButtonClose>
---

# BButtonClose Migration

## Summary

Migration notes for BButtonClose from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BButtonClose
- BCloseButton
- BLink

## Breaking Change

`BButtonClose` has been renamed to `BCloseButton` for consistency with [Bootstrap](https://getbootstrap.com/docs/5.3/components/close-button/)

> **Deprecated / not supported** — `content` and `text-variant` props on `BButtonClose` (deprecated by Bootstrap).

Bootstrap 5 moved to using an embedded svg for the close icon, so the rename to `BCloseButton` plus prop cleanup is largely mechanical.
  See [their migration guide](https://getbootstrap.com/docs/5.3/migration/#close-button-1) for details.

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
