---
id: bform
components:
- BForm
- BFormRow
- BFormDatalist
- BFormRadioGroup
- BFormSelect
- BFormSelectOptionGroup
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BForm
- BFormRow
- v-model
- bootstrap-vue-next
- update:model-value
- BFormDatalist
- BFormRadioGroup
- BFormSelect
- BFormSelectOptionGroup
- <BForm>
---

# BForm Migration

## Summary

Migration notes for BForm from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BForm
- BFormRow
- BFormDatalist
- BFormRadioGroup
- BFormSelect
- BFormSelectOptionGroup

## Breaking Change

Bootstrap 5 has dropped form-specific layout classes for the grid system. See the
[Bootstrap 5 Changelog](https://getbootstrap.com/docs/5.3/migration/#forms), so we no longer
explicitly implement and `inline` property on the `BForm` component nor is there a `BFormRow` component.
Inline forms are still supported through use of bootstrap classes. See the [inline form](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/form#inline-form)
documentation for more info.

### BForm Components

`Vue 3` changed the way that `v-model` binding works and in the process changed the guidance
when naming the main model property and events for the primary model. `bootstrap-vue-next` follows
this guidance, which affects all of the wrappers for form input. If you're looking for the `value`
property or the `change` and `input` events, you'll find that functionality in the `modelValue`
property and `update:model-value` events. Bootstrap-vue-next no longer provides custom `change` and
`input` events, so the native versions of those events are now exposed.

See the [Vue 3 migration guide](https://v3-migration.vuejs.org/breaking-changes/v-model.html)
for more info.

See the [v-html](../patterns/v-html-props.md) section for information on deprecation of the `html` prop on
`BFormDatalist`, `BFormRadioGroup`, `BFormSelect`, and`BFormSelectOptionGroup`

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [v-html-props](../patterns/v-html-props.md)
