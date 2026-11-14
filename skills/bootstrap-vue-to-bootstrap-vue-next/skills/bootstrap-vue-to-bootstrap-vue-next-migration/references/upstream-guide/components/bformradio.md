---
id: bformradio
components:
- BFormRadio
- BFormRadioGroup
- BFormCheckboxGroup
- BFormSelect
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BFormRadio
- BFormRadioGroup
- BFormCheckboxGroup
- BFormSelect
- v-model
- <BFormRadio>
---

# BFormRadio Migration

## Summary

Migration notes for BFormRadio from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BFormRadio
- BFormRadioGroup
- BFormCheckboxGroup
- BFormSelect

## Breaking Change

See [BForm Components](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/form-radio)

`BFormRadioGroup`, `BFormCheckboxGroup`, and `BFormSelect` now provide TypeScript type safety for the `options` prop:
the `v-model` type is inferred from the option values. See the
[Type-Safe Options](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/reference/type-safe-options) reference for details.

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None
