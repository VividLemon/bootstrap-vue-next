---
id: bprogressbar
components:
- BProgressBar
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BProgressBar
- label-html
- <BProgressBar>
---

# BProgressBar Migration

## Summary

Migration notes for BProgressBar from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BProgressBar

## Breaking Change

See the [v-html](../patterns/v-html-props.md) section for information on deprecation of the `label-html` prop.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [v-html-props](../patterns/v-html-props.md)
