---
id: btabs
title: BTabs Migration
category: components
components:
  - BTabs
match:
  - BTabs
  - v-model
  - "v-model:index"
  - activate-tab
  - <BTabs>
tags:
  - migration
  - components
  - btabs
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BTabs Migration

## Summary

Migration notes for BTabs from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BTabs

## Breaking Change

`align` prop now takes values from [`AlignmentJustifyContent`](/docs/types#alignment): `start`, `center`, `end`, `between`, `around`, and `evenly`

The primary `v-model` now reflects the `id` of the currently selected tag. Use `v-model:index` to syncronize to
the current tab index. See [programmatically activating and deactivating tabs](/docs/components/tabs#programmatically-activating-and-deactivating-tabs) for details.

The `changed` event on `BTabs` is deprecated.

`activate-tab` now emits a single payload object (`{newTabId, prevTabId, newTabIndex, prevTabIndex, event}`)
instead of positional arguments.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- None
