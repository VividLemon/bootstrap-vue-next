---
id: balert
title: BAlert Migration
category: components
components:
  - BAlert
match:
  - BAlert
  - bootstrap-vue
  - v-model
  - model-value
  - <BAlert>
tags:
  - migration
  - components
  - balert
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
related:
  - show-hide
confidence: high
---

# BAlert Migration

## Summary

Migration notes for BAlert from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BAlert

## Breaking Change

As in `bootstrap-vue`, a simple `BAlert` is not visible by default. However, the means of showing the alert are different.

The primary way to control alert visibility is via `v-model` (or `model-value` in props). The `show` and `visible` props are still available for controlling initial visibility, with `show` enabling the initial animation on mount. See [Show and Hide](/docs/migration-data/patterns/show-hide) shared properties for details.

<<< FRAGMENT ../../demo/AlertBefore.vue#template{vue-html}

becomes

<<< FRAGMENT ../../demo/AlertAfter.vue#template{vue-html}

For consistency with other components properties, slots and events that use the term `dismissible` in `bootstrap-vue`
now use the term `close`. For example the `dismissed` event is now the `closed` event and the `dismiss` slot is
now the `close` slot.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- [show-hide](/docs/migration-data/patterns/show-hide)
