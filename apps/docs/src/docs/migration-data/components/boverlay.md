---
id: boverlay
title: BOverlay Migration
category: components
components:
  - BOverlay
match:
  - BOverlay
  - <BOverlay>
tags:
  - migration
  - components
  - boverlay
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
related:
  - rounded-radius-element
confidence: high
---

# BOverlay Migration

## Summary

Migration notes for BOverlay from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BOverlay

## Breaking Change

See the [Rounding](/docs/migration-data/props/rounded-radius-element) section.

prop `blur` does not work when the prop `bgColor` is defined. It also will not work if the prop `variant` is anything other than `white` or `transparent`. This overcomes a browser change.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- [rounded-radius-element](/docs/migration-data/props/rounded-radius-element)
