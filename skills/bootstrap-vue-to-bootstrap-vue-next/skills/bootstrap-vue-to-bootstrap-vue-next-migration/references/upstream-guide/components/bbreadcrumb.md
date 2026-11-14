---
id: bbreadcrumb
components:
- BBreadcrumb
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BBreadcrumb
- <BBreadcrumb>
---

# BBreadcrumb Migration

## Summary

Migration notes for BBreadcrumb from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BBreadcrumb

## Breaking Change

See the [v-html](../patterns/v-html-props.md) section for information on deprecation of the `html` prop. In most migrations this is a straightforward rewrite from the `html` prop to the default slot using Vue template content.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [v-html-props](../patterns/v-html-props.md)
