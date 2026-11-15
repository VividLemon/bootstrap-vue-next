---
id: bformspinbutton
components:
- BFormSpinButton
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BFormSpinButton
---

# BFormSpinButton Migration

## Summary

Migration notes for BFormSpinButton from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BFormSpinButton

## Breaking Change

See [BForm Components](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/form-spinbutton)
The locale property in BootstrapVueNext only allows for a single locale, while BSV allows for an array of locales. If this is
a limitation that affects your scenario, please [file an issue](https://github.com/bootstrap-vue-next/bootstrap-vue-next/issues) with an explanation of the expected behavior.

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None
