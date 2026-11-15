---
id: btablelight
components:
- BTableLight
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BTableLight
- table-colgroup
- <BTableLight>
---

# BTableLight Migration

## Summary

Migration notes for BTableLight from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BTableLight

## Breaking Change

See the [v-html](../patterns/v-html-props.md) section for information on deprecation of the `html` prop.

The slot scope for `table-colgroup` slot now only contains the `fields` prop, with the `columns` prop removed.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [v-html-props](../patterns/v-html-props.md)
