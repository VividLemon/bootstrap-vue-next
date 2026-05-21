---
id: v-b-toggle
title: v-b-toggle Migration
category: directives
components:
  - BModal
  - BOffcanvas
match:
  - Toggle
  - v-b-toggle
  - "v-b-toggle=\"['target-1', 'target-2']\""
  - <b-sidebar>
  - @click.prevent
tags:
  - migration
  - directives
  - toggle
safeRewrite: true
migrationType: directive-migration
introducedIn: bootstrap-vue-next
replacement:
  <b-sidebar>: <BOffcanvas>
manualReviewRequired: false
deprecated:
  - <b-sidebar>
confidence: high
---

# v-b-toggle Migration

## Summary

Migration notes for v-b-toggle from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BModal
- BOffcanvas

## Breaking Change

The `v-b-toggle` directive syntax is fully compatible between BSV and BSVN with no changes required for most usage.

**New features:**

- Array value support: `v-b-toggle="['target-1', 'target-2']"`
- Works with `<BModal>` (in addition to collapse/offcanvas)

**Component changes:**

- `<b-sidebar>` → `<BOffcanvas>`

**Recommendations:**

- When using on links with `href`, add `@click.prevent` to avoid URL changes

See the [BToggle Directive documentation](/docs/directives/BToggle) for complete details.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None
