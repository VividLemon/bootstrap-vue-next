---
id: v-b-popover
title: v-b-popover Migration
description: 'Migration notes for v-b-popover from BootstrapVue to BootstrapVueNext.'
category: directives
components:
  - BPopover
match:
  - Popover
  - v-b-popover
  - bv::show::popover
  - .click
  - .hover
  - .focus
  - .manual
  - .top
  - .bottom
  - .left
  - .right
tags:
  - migration
  - directives
  - popover
safeRewrite: false
migrationType: directive-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
confidence: high
---

# v-b-popover Migration

## Summary

BootstrapVueNext has no `v-b-popover` directive. Use the `<BPopover>` component with its
`activator` slot, or the [`usePopover`](/docs/composables/usePopover) composable's `popover()`.

## Affected APIs

- BPopover

## Breaking Change

<DeprecatedFeature :reason="DeprecationReason.MODERN_ALTERNATIVE" what="`v-b-popover` directive">
  Wrap the element in <code>&lt;BPopover&gt;</code> and bind the <code>activator</code> slot's
  <code>props</code> on it. <code>props</code> carries the element's ref, the trigger listeners and
  <code>aria-describedby</code>.
</DeprecatedFeature>

<<< FRAGMENT ../../demo/PopoverDirectiveMigration.html#basic-bsv{vue-html}

<<< FRAGMENT ../../demo/PopoverDirectiveMigration.html#basic-bsvn{vue-html}

### Modifiers and the value object

Each modifier and each key of the directive's value object becomes a `<BPopover>` prop:

| `v-b-popover`                           | `<BPopover>`                                   |
| --------------------------------------- | ---------------------------------------------- |
| value string or `content` key           | `body` prop (or the default slot)              |
| `title` attribute or `title` key        | `title` prop (or the `title` slot)             |
| `.hover`, `.focus`, `.click`            | `hover`, `focus`, `click`                      |
| `.manual`                               | `manual`, with `v-model` for the visibility    |
| `.top`, `.topright`, `.bottomleft`, ... | `placement` (`top`, `top-end`, `bottom-start`) |
| `.html`                                 | the default and `title` slots                  |
| `delay`                                 | `delay` (a number or `{show, hide}`)           |
| `customClass`                           | `body-attrs` / `title-attrs` (or a `class`)    |
| `variant`                               | Bootstrap v6 `.theme-*` classes                |
| `boundary`, `container`                 | `boundary`, `teleport-to`                      |

<<< FRAGMENT ../../demo/PopoverDirectiveMigration.html#click-bsv{vue-html}

<<< FRAGMENT ../../demo/PopoverDirectiveMigration.html#click-bsvn{vue-html}

### Manual control

BootstrapVue opened a manual popover with `this.$root.$emit('bv::show::popover', id)`. Bind
`v-model` instead:

<<< DEMO ../../demo/PopoverDirectiveManualBSV.vue

<<< FRAGMENT ../../demo/PopoverDirectiveMigration.html#manual-bsvn{vue-html}

### Elements you don't render

When the trigger is not in your template, pass it as `<BPopover>`'s `activator` prop, or call
`usePopover().popover({activator})`. See [Popover](/docs/components/popover) and
[`usePopover`](/docs/composables/usePopover).

## Migration Notes

- `v-b-popover` was removed in the Bootstrap v6 release of BootstrapVueNext in favor of the component and
  the composable.

## Safe Automatic Rewrite

No. The trigger element moves into the `activator` slot, which changes the template structure.

## Related Migrations

- [BPopover Migration](/docs/migration-data/components/bpopover)
- [v-b-tooltip Migration](/docs/migration-data/directives/v-b-tooltip)

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
