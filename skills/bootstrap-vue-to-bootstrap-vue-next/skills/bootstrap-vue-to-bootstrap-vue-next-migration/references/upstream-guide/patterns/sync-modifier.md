---
id: sync-modifier
components:
- BFormCheckbox
safeRewrite: true
manualReviewRequired: false
confidence: high
replacement:
  '*.sync': v-model:<prop>
deprecated:
- '*.sync'
match:
- .sync
- v-bind.sync
- indeterminate.sync
- v-model
---

# Sync Modifier Migration

## Summary

Replace BootstrapVue `.sync` bindings with Vue 3 model bindings in BootstrapVueNext.

## Affected APIs

- BFormCheckbox

## Breaking Change

A number of components in `bootstrap-vue` use `v-bind`'s `.sync` modifier. This modifier has been replaced by properties
on the model (generally named models).

For instance, in order to two-way bind to the `indeterminate` property in `BFormCheckBox` you `v-bind` to the model
named `indeterminate` rather than adding the sync modifier to the `indeterminate` property:

```vue-html
<BFormCheckbox v-model="checked" :indeterminate.sync="indeterminate">
  Click me to see what happens
</BFormCheckbox>
```

becomes

```vue-html
<BFormCheckbox v-model="checked" v-model:indeterminate="indeterminate">
  Click me to see what happens
</BFormCheckbox>
```

See the [Vue 3 migration guide](https://v3-migration.vuejs.org/breaking-changes/v-model.html)
for more info.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [show-hide](../patterns/show-hide.md)
