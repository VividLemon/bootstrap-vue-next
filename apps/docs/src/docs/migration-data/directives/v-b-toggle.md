---
id: v-b-toggle
title: v-b-toggle Migration
description: 'Migration notes for v-b-toggle from BootstrapVue to BootstrapVueNext.'
category: directives
components:
  - BCollapse
  - BDialog
  - BOffcanvas
match:
  - Toggle
  - v-b-toggle
  - collapsed
  - not-collapsed
  - useComponentToggle
tags:
  - migration
  - directives
  - toggle
  - collapse
safeRewrite: true
migrationType: directive-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: false
confidence: high
---

# v-b-toggle Migration

## Summary

BootstrapVueNext has no `v-b-toggle` directive. Call
[`useComponentToggle`](/docs/composables/useComponentToggle) with the target id and bind the
`props` it returns on the trigger.

## Affected APIs

- BCollapse
- BDialog
- BOffcanvas

## Breaking Change

<DeprecatedFeature :reason="DeprecationReason.MODERN_ALTERNATIVE" what="`v-b-toggle` directive">
  <code>useComponentToggle(id).props</code> does what the directive did: clicks toggle the target,
  <code>aria-controls</code> names it, and <code>aria-expanded</code> follows its state.
</DeprecatedFeature>

<<< FRAGMENT ../../demo/ToggleDirectiveMigrationBSV.html{vue-html}

<<< DEMO ../../demo/ToggleDirectiveMigrationBSVN.vue

- The id goes in the call: `v-b-toggle.my-collapse` and `v-b-toggle="'my-collapse'"` both become
  `useComponentToggle('my-collapse')`.
- Several targets: pass an array of ids or a space-separated string.
- Triggers for the same target can share one `useComponentToggle` call and bind the same `props`.
- There are no `collapsed` / `not-collapsed` classes. Style the trigger with
  `[aria-expanded="true"]` and `[aria-expanded="false"]`.
- A trigger inside an open `BDialog` swaps that dialog for its target. See
  [Swapping dialogs](/docs/components/dialog#swapping-dialogs).

## Migration Notes

- `v-b-toggle` was removed in the Bootstrap v6 release of BootstrapVueNext in favor of
  `useComponentToggle`.

## Safe Automatic Rewrite

Yes. Each directive maps to one `useComponentToggle` call and a `v-bind` on the same element.

## Related Migrations

- [v-b-modal Migration](/docs/migration-data/directives/v-b-modal)

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
