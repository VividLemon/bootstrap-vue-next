---
id: native-events
title: Native Event Documentation Migration
category: patterns
components: []
match:
  - native events
  - click
  - bubbled events
tags:
  - migration
  - patterns
  - events
safeRewrite: false
migrationType: pattern-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# Native Event Documentation Migration

## Summary

BootstrapVueNext no longer documents bubbled native DOM events as component API events.

## Affected APIs

- None explicitly listed

## Breaking Change

BootstrapVue sometimes listed the native events such as `click` that were bubbled from the underlying
HTML element. We're not currently doing that, as we would like to keep the list of events
consistent between the documentation and the code.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- None
