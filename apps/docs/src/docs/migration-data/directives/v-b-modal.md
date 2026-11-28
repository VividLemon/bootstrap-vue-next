---
id: v-b-modal
title: v-b-modal Migration
description: 'Migration notes for v-b-modal from BootstrapVue to BootstrapVueNext.'
category: directives
components:
  - BDialog
match:
  - Modal
  - v-b-modal
  - v-b-toggle
  - not-collapsed
  - this.$bvModal.show(id)
  - useComponentToggle
tags:
  - migration
  - directives
  - modal
safeRewrite: true
migrationType: directive-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: false
confidence: high
---

# v-b-modal Migration

## Summary

BootstrapVueNext has no `v-b-modal` directive. Call
[`useComponentToggle`](/docs/composables/useComponentToggle) with the dialog's id and bind the
`props` it returns on the trigger.

## Affected APIs

- BDialog

## Breaking Change

<DeprecatedFeature :reason="DeprecationReason.MODERN_ALTERNATIVE" what="`v-b-modal` directive">
  <code>v-b-modal.my-modal</code> becomes <code>useComponentToggle('my-modal')</code>, with its
  <code>props</code> bound on the trigger.
</DeprecatedFeature>

It works the same way for `BCollapse` and `BOffcanvas`; see the
[v-b-toggle migration](/docs/migration-data/directives/v-b-toggle).

<<< FRAGMENT ../../demo/ToggleDirectiveMigrationBSV.html{vue-html}

<<< DEMO ../../demo/ToggleDirectiveMigrationBSVN.vue

**Trigger state:** `aria-expanded` on the trigger follows the dialog. There are no
`collapsed` / `not-collapsed` classes; style triggers with `[aria-expanded="true"]` and
`[aria-expanded="false"]`.

**Migration from `this.$bvModal.show(id)`:** call `show()` from `useComponentToggle(id)`, bind
the dialog's `v-model`, or create the dialog with [`useDialog`](/docs/composables/useDialog). See
[Dialog](/docs/components/dialog#toggle-dialog-visibility).

## Migration Notes

- `v-b-modal` was removed in the Bootstrap v6 release of BootstrapVueNext in favor of
  `useComponentToggle`.

## Safe Automatic Rewrite

Yes. Each directive maps to one `useComponentToggle` call and a `v-bind` on the same element.

## Related Migrations

- [v-b-toggle Migration](/docs/migration-data/directives/v-b-toggle)
- [BModal Migration](/docs/migration-data/components/bmodal)

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
