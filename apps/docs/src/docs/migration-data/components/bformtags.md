---
id: bformtags
title: BFormTags Migration
category: components

components:
  - BFormTags
  - BFormSelect
directives: []
composables: []

tags:
  - migration
  - components
  - bformtags

match:
  - BFormTags
  - BFormSelect
  - <BFormTags>
replacement: {}

safeRewrite: true
manualReviewRequired: false

versionAdded: ""
versionRemoved: ""

description: Migration notes for BFormTags from BootstrapVue to BootstrapVueNext.

migrationType: component-migration
introducedIn: bootstrap-vue-next
confidence: high
---

# BFormTags Migration

## Summary

Migration notes for BFormTags from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BFormTags
- BFormSelect

## Breaking Change

In BootstrapVue, the event handlers for some of the other input controls, like `BFormSelect`, lined up with
the `inputHandlers` for the default slot's scoped properties such that one could directly bind them. See the
[BootstrapVue](https://bootstrap-vue.github.io/bootstrap-vue/docs/components/form-tags#advanced-custom-rendering-usage) documentation
for an example. This is no longer the case with BootstrapVueNext.

In general BootstrapVueNext preferred clean APIs to enabling this kind of matching of events, so many of the advanced
examples in the [BFormTags docs](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/form-tags.html#custom-rendering-with-default-scoped-slot) are more explicit when binding attributes from other controls. Please
take a look at these examples for guidance when migrating.

## Migration Notes

- Extracted from the canonical BootstrapVue → BootstrapVueNext migration guide.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None
