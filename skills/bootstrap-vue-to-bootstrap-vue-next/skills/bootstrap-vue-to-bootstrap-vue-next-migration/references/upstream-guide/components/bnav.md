---
id: bnav
components:
- BNav
- BDropdown
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BNav
- BDropdown
- <BNav>
---

# BNav Migration

## Summary

Migration notes for BNav from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BNav
- BDropdown

## Breaking Change

`align` prop now takes values from [`AlignmentJustifyContent`](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/types#alignment): `start`, `center`, `end`, `between`, `around`, and `evenly`

### BNavItemDropdown

See [`BDropdown`](../components/bdropdown.md) for details

See the [v-html](../patterns/v-html-props.md) section for information on deprecation of the `html` prop.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [bdropdown](../components/bdropdown.md)
- [v-html-props](../patterns/v-html-props.md)
