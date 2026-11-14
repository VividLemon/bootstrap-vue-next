---
id: binputgroup
components:
- BInputGroup
- BInputGroupAppend
- BInputGroupPrepend
- BInputGroupAddon
- BLink
- BInputGroupText
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BInputGroup
- BInputGroupAppend
- BInputGroupPrepend
- BInputGroupAddon
- input-group-append
- input-group-prepend
- append-html
- prepend-html
- <BInputGroup>
---

# BInputGroup Migration

## Summary

Migration notes for BInputGroup from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BInputGroup
- BInputGroupAppend
- BInputGroupPrepend
- BInputGroupAddon
- BLink
- BInputGroupText

## Breaking Change

> **Deprecated / not supported** — `BInputGroupAppend`, `BInputGroupPrepend`, and `BInputGroupAddon` components (deprecated by Bootstrap).

Bootstrap 5 [no longer requires](https://getbootstrap.com/docs/5.3/migration/#forms-1) `input-group-append` or `input-group-prepend`
  on elements to append or prepend them to the control, they can just be added as direct children of the input group.

This also has implications on the use of `<BInputGroupText>` - in BootstrapVue, this component was used form grouping
sub-components. In BootstrapVueNext, `<BInputGroupText>` should only be used to apply styles to textual elements
appended or prepended to a group. Using it to group components breaks the automatic append and prepend stylings.

See the [v-html](../patterns/v-html-props.md) section for information on deprecation of the `append-html` and `prepend-html` props.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [v-html-props](../patterns/v-html-props.md)

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
