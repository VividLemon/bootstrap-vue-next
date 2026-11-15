---
id: bpagination
components:
- BPagination
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BPagination
- <BPagination>
---

# BPagination Migration

## Summary

Migration notes for BPagination from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BPagination

## Breaking Change

See [Show and Hide](../patterns/show-hide.md) shared properties.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [show-hide](../patterns/show-hide.md)
