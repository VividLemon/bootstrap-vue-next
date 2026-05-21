---
id: binputgroup
title: BInputGroup Migration
category: components
components:
  - BInputGroup
  - BInputGroupAppend
  - BInputGroupPrepend
  - BInputGroupAddon
  - BLink
  - BInputGroupText
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
tags:
  - migration
  - components
  - binputgroup
safeRewrite: false
migrationType: component-migration
introducedIn: bootstrap-vue-next
manualReviewRequired: true
related:
  - v-html-props
confidence: high
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

<DeprecatedFeature :reason="DeprecationReason.BOOTSTRAP_DEPRECATED" what="`BInputGroupAppend`, `BInputGroupPrepend`, and `BInputGroupAddon` components" :plural="true">
  Bootstrap 5 <BLink href="https://getbootstrap.com/docs/5.3/migration/#forms-1">no longer requires</BLink> `input-group-append` or `input-group-prepend`
  on elements to append or prepend them to the control, they can just be added as direct children of the input group.
</DeprecatedFeature>

This also has implications on the use of `<BInputGroupText>` - in BootstrapVue, this component was used form grouping
sub-components. In BootstrapVueNext, `<BInputGroupText>` should only be used to apply styles to textual elements
appended or prepended to a group. Using it to group components breaks the automatic append and prepend stylings.

See the [v-html](/docs/migration-data/patterns/v-html-props) section for information on deprecation of the `append-html` and `prepend-html` props.

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
