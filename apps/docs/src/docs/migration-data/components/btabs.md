---
id: btabs
title: BTabs Migration
description: 'Migration notes for BTabs from BootstrapVue to BootstrapVueNext.'
category: components
components:
  - BTabs
match:
  - BTabs
  - v-model
  - activate-tab
  - <BTabs>
tags:
  - migration
  - components
  - btabs
safeRewrite: true
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: false
confidence: high
---

# BTabs Migration

## Summary

Migration notes for BTabs from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BTabs

## Breaking Change

`align` prop now takes values from [`AlignmentJustifyContent`](/docs/types#alignment): `start`, `center`, `end`, `between`, `around`, and `evenly`

`BTabs` now supports only ID-based selection through `v-model` (the active tab `id`). `v-model:index` is no longer supported.
See [programmatically activating and deactivating tabs](/docs/components/tabs#programmatically-activating-and-deactivating-tabs) for details.

The `changed` event on `BTabs` is deprecated.

`activate-tab` now emits a single payload object (`{newTabId, prevTabId, newTabIndex, prevTabIndex, event}`)
instead of positional arguments.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None
