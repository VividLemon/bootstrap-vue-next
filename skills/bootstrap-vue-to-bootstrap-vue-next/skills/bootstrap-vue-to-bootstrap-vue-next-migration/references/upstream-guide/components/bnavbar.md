---
id: bnavbar
components:
- BNavbar
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BNavbar
- v-b-color-mode
- useColorMode
- <BNavbar>
---

# BNavbar Migration

## Summary

Migration notes for BNavbar from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BNavbar

## Breaking Change

The `type` prop is deprecated. Use the `v-b-color-mode` directive or `useColorMode` composable instead. Details in our [docs](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/navbar#color-schemes)

### BNavbarNav

`align` prop now takes values from [`AlignmentJustifyContent`](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/types#alignment): `start`, `center`, `end`, `between`, `around`, and `evenly`

See [Show and Hide](../patterns/show-hide.md) shared properties.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [show-hide](../patterns/show-hide.md)
