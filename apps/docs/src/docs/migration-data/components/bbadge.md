---
id: bbadge
title: BBadge Migration
description: 'Migration notes for BBadge from BootstrapVue to BootstrapVueNext.'
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
safeRewrite: true
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: false
confidence: high
---

# BBadge Migration

## Summary

Migration notes for BBadge from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BBadge

## Breaking Change

Badges no longer have the automatic focus or hover styles that Bootstrap 4 applied to linked badges. In practice this is a straightforward cleanup: the old behavior can simply be dropped, and custom classes can be added if you still want bespoke link styling. See the
[Bootstrap migration guide](https://getbootstrap.com/docs/5.3/migration/#badges) for more information.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None

## BootstrapVueNext v1 → v100 (Bootstrap 6)

The following BBadge changes apply when migrating this component to Bootstrap 6:

| Previous BBadge API | Bootstrap 6 approach                                                                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pill`              | Remove the prop and add `class="rounded-pill"` when needed.                                                                                                                                          |
| `placement`         | Remove the prop and compose position utilities such as `position-absolute top-0 start-100 translate-middle`. Set `position-relative` on the containing element.                                      |
| `dot-indicator`     | Remove the prop and use a utility-only element, for example `p-2 bg-danger border border-bg rounded-circle`, with a `.visually-hidden` description when appropriate. Do not add `.badge` to the dot. |

`tag`, the default slot, link rendering, and active/disabled behavior remain unchanged. BBadge does not emit component-specific events. `BAvatar` retains its own `badge-pill`, `badge-placement`, and `badge-dot-indicator` convenience props; internally it now uses utility classes and renders a generic utility-only element for dots.

Color `variant`, `bg-variant`, and `text-variant` API changes are intentionally deferred; see the repository-root `v6-todos.md` before changing those props or their mappings.
