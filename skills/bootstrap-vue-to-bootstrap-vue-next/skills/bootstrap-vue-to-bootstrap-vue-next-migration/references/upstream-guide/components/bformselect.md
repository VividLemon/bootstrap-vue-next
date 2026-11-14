---
id: bformselect
components:
- BFormSelect
safeRewrite: true
manualReviewRequired: true
confidence: high
match:
- BFormSelect
- <BFormSelect>
---

# BFormSelect Migration

## Summary

Migration notes for BFormSelect from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BFormSelect

## Breaking Change

[Options as an object](https://bootstrap-vue.github.io/bootstrap-vue/docs/components/form-select#options-as-an-object) was deprecated in BootstrapVue and never implemented in BootstrapVueNext. This is usually a direct object-to-array rewrite, but review the mapping if the original object keys carry semantic meaning in your app.

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical, but review the result when surrounding behavior or adjacent props may affect the final markup.

## Related Migrations

- None
