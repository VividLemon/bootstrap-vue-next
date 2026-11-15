---
id: btoaster
components:
- BToaster
- BApp
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BToaster
- useToast
- BApp
- <BToaster>
---

# BToaster Migration

## Summary

Migration notes for BToaster from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BToaster
- BApp

## Breaking Change

The `BToaster` component has been deprecated. Its functionality has been replaced by the
[`useToast`](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/composables/useToast) composable working in concert with the
[`BApp`](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/app) component. In practice this is usually a straightforward migration: move toast orchestration to `useToast` and make sure `BApp` exists at the root.

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None
