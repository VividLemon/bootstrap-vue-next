---
id: bbadge
title: BBadge Migration
category: components
components:
  - BBadge
match:
  - BBadge
  - <BBadge>
tags:
  - migration
  - components
  - bbadge
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# BBadge Migration

## Summary

Migration notes for BBadge from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BBadge

## Breaking Change

Badges no longer have focus or hover styles for links. See the
[Bootstrap migration guide](https://getbootstrap.com/docs/5.3/migration/#badges) for more information.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- None
