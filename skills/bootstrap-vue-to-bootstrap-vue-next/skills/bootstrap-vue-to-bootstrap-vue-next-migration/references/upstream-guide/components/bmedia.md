---
id: bmedia
components:
- BMedia
- BLink
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BMedia
- <BMedia>
---

# BMedia Migration

## Summary

Migration notes for BMedia from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BMedia
- BLink

## Breaking Change

> **Deprecated / not supported** — `BMedia` component (not implemented (insufficient demand for initial release)).

This component will not be implemented for v1 due to insufficient demand.
  Bootstrap has deprecated their Media object, but it can be replicated using flex utility classes.
  See their [documentation](https://getbootstrap.com/docs/5.3/utilities/flex/#media-object) for details.

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
