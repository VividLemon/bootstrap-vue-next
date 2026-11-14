---
id: bformgroup
components:
- BFormGroup
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BFormGroup
- label-visually-hidden
- label-sronly
- <BFormGroup>
---

# BFormGroup Migration

## Summary

Migration notes for BFormGroup from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BFormGroup

## Breaking Change

Use `label-visually-hidden` instead of `label-sronly` per
[Bootstrap Migration Guide](https://getbootstrap.com/docs/5.3/migration/#helpers-2)

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None
