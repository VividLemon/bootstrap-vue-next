---
id: btablesimple
title: BTableSimple Migration
category: components
components:
  - BTableSimple
match:
  - BTableSimple
  - table-attrs
  - caption-html
  - foot-variant
  - head-variant
  - <BTableSimple>
tags:
  - migration
  - components
  - btablesimple
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
related:
  - v-html-props
confidence: high
---

# BTableSimple Migration

## Summary

Migration notes for BTableSimple from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BTableSimple

## Breaking Change

Use `table-attrs` to apply additional attributes to the `<table>` element in reponsive mode.

See the [v-html](/docs/migration-data/patterns/v-html-props) section for information on deprecation of the `caption-html` prop.

### BTBody

<DeprecatedFeature :reason="DeprecationReason.INSUFFICIENT_DEMAND">
  The <code>tbody-transition-props</code> and <code>tbody-transition-handlers</code> props. Wrap the table in a custom transition component if needed.
</DeprecatedFeature>

### BTFoot

`foot-variant` has been replaced with `variant`, which can used on other table elements.

### BTHead

`head-variant` has been replaced with `variant`, which can used on other table elements.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- [v-html-props](/docs/migration-data/patterns/v-html-props)

<script setup lang="ts">
import {DeprecationReason} from '../../types/deprecation'
</script>
