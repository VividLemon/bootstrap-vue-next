---
id: bprogressbar
title: BProgressBar Migration
category: components
components:
  - BProgressBar
match:
  - BProgressBar
  - label-html
  - <BProgressBar>
tags:
  - migration
  - components
  - bprogressbar
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
related:
  - v-html-props
confidence: high
---

# BProgressBar Migration

## Summary

Migration notes for BProgressBar from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BProgressBar

## Breaking Change

See the [v-html](/docs/migration-data/patterns/v-html-props) section for information on deprecation of the `label-html` prop.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- [v-html-props](/docs/migration-data/patterns/v-html-props)
