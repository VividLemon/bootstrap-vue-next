---
id: btablesimple
components:
- BTableSimple
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BTableSimple
- table-attrs
- caption-html
- foot-variant
- head-variant
- <BTableSimple>
---

# BTableSimple Migration

## Summary

Migration notes for BTableSimple from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BTableSimple

## Breaking Change

Use `table-attrs` to apply additional attributes to the `<table>` element in responsive mode.

See the [v-html](../patterns/v-html-props.md) section for information on deprecation of the `caption-html` prop.

### BTBody

> **Deprecated / not supported** — this feature (not implemented (insufficient demand for initial release)).

The <code>tbody-transition-props</code> and <code>tbody-transition-handlers</code> props. Wrap the table in a custom transition component if needed.

### BTFoot

`foot-variant` has been replaced with `variant`, which can used on other table elements.

### BTHead

`head-variant` has been replaced with `variant`, which can used on other table elements.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [v-html-props](../patterns/v-html-props.md)

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
