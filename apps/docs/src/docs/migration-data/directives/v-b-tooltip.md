---
id: v-b-tooltip
title: v-b-tooltip Migration
description: 'Migration notes for v-b-tooltip from BootstrapVue to BootstrapVueNext.'
category: directives
components:
  - BTooltip
match:
  - Tooltip
  - v-b-tooltip
  - data-original-title
  - .hover
  - .focus
  - .click
  - .top
  - .bottom
  - .left
  - .right
tags:
  - migration
  - directives
  - tooltip
safeRewrite: false
migrationType: directive-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# v-b-tooltip Migration

## Summary

BootstrapVueNext has no `v-b-tooltip` directive. Use the `<BTooltip>` component with its
`activator` slot, or the [`usePopover`](/docs/composables/usePopover) composable's `tooltip()`.

## Affected APIs

- BTooltip

## Breaking Change

<DeprecatedFeature :reason="DeprecationReason.MODERN_ALTERNATIVE" what="`v-b-tooltip` directive">
  Wrap the element in <code>&lt;BTooltip&gt;</code> and bind the <code>activator</code> slot's
  <code>props</code> on it. <code>props</code> carries the element's ref, the trigger listeners and
  <code>aria-describedby</code>.
</DeprecatedFeature>

<<< FRAGMENT ../../demo/TooltipDirectiveMigration.html#basic-bsv{vue-html}

<<< FRAGMENT ../../demo/TooltipDirectiveMigration.html#basic-bsvn{vue-html}

### Modifiers and the value object

Each modifier and each key of the directive's value object becomes a `<BTooltip>` prop:

| `v-b-tooltip`                                  | `<BTooltip>`                                |
| ---------------------------------------------- | ------------------------------------------- |
| value string, `title` attribute or `title` key | `title` prop (or the default slot)          |
| `.hover`, `.focus`, `.click`                   | `hover`, `focus`, `click`                   |
| `.manual`                                      | `manual`, with `v-model` for the visibility |
| `.top`, `.bottom`, `.left`, `.right`           | `placement` (any Floating UI placement)     |
| `.html`                                        | the default slot                            |
| `delay`                                        | `delay` (a number or `{show, hide}`)        |
| `customClass`                                  | `body-attrs` / `title-attrs` (or a `class`) |
| `variant`                                      | Bootstrap v6 `.theme-*` classes             |
| `boundary`, `container`                        | `boundary`, `teleport-to`                   |

<<< FRAGMENT ../../demo/TooltipDirectiveMigration.html#object-bsv{vue-html}

<<< FRAGMENT ../../demo/TooltipDirectiveMigration.html#object-bsvn{vue-html}

### Elements you don't render

When the trigger is not in your template (a third-party component's element, or one found at run
time), pass it as `<BTooltip>`'s `activator` prop, or call `usePopover().tooltip({activator})`.
See [Tooltip](/docs/components/tooltip) and [`usePopover`](/docs/composables/usePopover).

## Migration Notes

- `v-b-tooltip` was removed in the Bootstrap v6 release of BootstrapVueNext in favor of the component and
  the composable.

## Safe Automatic Rewrite

No. The trigger element moves into the `activator` slot, which changes the template structure.

## Related Migrations

- [BTooltip Migration](/docs/migration-data/components/btooltip)
- [v-b-popover Migration](/docs/migration-data/directives/v-b-popover)

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
