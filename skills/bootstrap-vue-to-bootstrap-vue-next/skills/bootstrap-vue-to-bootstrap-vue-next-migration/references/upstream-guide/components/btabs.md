---
id: btabs
components:
- BTabs
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BTabs
- v-model
- v-model:index
- activate-tab
- <BTabs>
---

# BTabs Migration

## Summary

Migration notes for BTabs from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BTabs

## Breaking Change

`align` prop now takes values from [`AlignmentJustifyContent`](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/types#alignment): `start`, `center`, `end`, `between`, `around`, and `evenly`

The primary `v-model` now reflects the `id` of the currently selected tag. Use `v-model:index` to synchronize to
the current tab index. See [programmatically activating and deactivating tabs](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/tabs#programmatically-activating-and-deactivating-tabs) for details.

The `changed` event on `BTabs` is deprecated.

`activate-tab` now emits a single payload object (`{newTabId, prevTabId, newTabIndex, prevTabIndex, event}`)
instead of positional arguments.

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None
