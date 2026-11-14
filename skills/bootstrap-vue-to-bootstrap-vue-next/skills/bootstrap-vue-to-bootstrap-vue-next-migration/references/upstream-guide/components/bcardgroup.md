---
id: bcardgroup
components:
- BCardGroup
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BCardGroup
- .card-deck
- .card-columns
- .row-cols-*
- <BCardGroup>
---

# BCardGroup Migration

## Summary

Migration notes for BCardGroup from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BCardGroup

## Breaking Change

> **Deprecated / not supported** — card deck and card columns props (deprecated by Bootstrap).

The `deck` and `columns` props output CSS classes (`.card-deck` and `.card-columns`) that were removed from Bootstrap 5.
  Use Bootstrap's grid system with `.row-cols-*` classes for responsive card layouts instead, which makes this a straightforward class-based rewrite.
  Only the default card group (without `deck` or `columns` props) works with Bootstrap 5 and is responsive.

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
