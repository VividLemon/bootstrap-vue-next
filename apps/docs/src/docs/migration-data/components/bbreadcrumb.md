---
id: bbreadcrumb
title: BBreadcrumb Migration
description: 'Migration notes for BBreadcrumb from BootstrapVue to BootstrapVueNext.'
category: components
components:
  - BBreadcrumb
match:
  - BBreadcrumb
  - <BBreadcrumb>
tags:
  - migration
  - components
  - bbreadcrumb
safeRewrite: true
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: false
related:
  - v-html-props
confidence: high
---

# BBreadcrumb Migration

## Summary

Migration notes for BBreadcrumb from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BBreadcrumb

## Breaking Change

See the [v-html](/docs/migration-data/patterns/v-html-props) section for information on deprecation of the `html` prop. In most migrations this is a straightforward rewrite from the `html` prop to the default slot using Vue template content.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [v-html-props](/docs/migration-data/patterns/v-html-props)

## BootstrapVueNext v1 → v100 (Bootstrap 6)

| Previous behavior                                                           | Bootstrap 6 approach                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Separators drawn by CSS `::before` on `.breadcrumb-item + .breadcrumb-item` | Explicit `<li class="breadcrumb-divider" />` elements between items. `BBreadcrumb` renders them automatically for the `items` prop (and `useBreadcrumb`); add them yourself between manually slotted `BBreadcrumbItem`s. An empty divider renders the default chevron; add content for a custom separator. |
| `--bs-breadcrumb-divider` CSS variable                                      | `--bs-breadcrumb-divider-icon`, `--bs-breadcrumb-divider-width`, `--bs-breadcrumb-divider-height`, or custom divider content.                                                                                                                                                                              |
| `.breadcrumb-item.active` on the `li`                                       | `.breadcrumb-link.active` on the inner link or `span`.                                                                                                                                                                                                                                                     |
| `aria-current` on the active inner element, default `location`              | `aria-current` on the active `.breadcrumb-item`, default `page` (`ariaCurrent` prop remains).                                                                                                                                                                                                              |
| Default bottom margin on `.breadcrumb`                                      | Removed; add a spacing utility such as `mb-3` via `olClass` if needed.                                                                                                                                                                                                                                     |

Props, slots, events, and link props of `BBreadcrumb` and `BBreadcrumbItem` are otherwise unchanged. Links now carry `.breadcrumb-link`.
