---
id: boverlay
components:
- BOverlay
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BOverlay
- <BOverlay>
---

# BOverlay Migration

## Summary

Migration notes for BOverlay from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BOverlay

## Breaking Change

See the [Rounding](../props/rounded-radius-element.md) section.

prop `blur` does not work when the prop `bgColor` is defined. It also will not work if the prop `variant` is anything other than `white` or `transparent`. This overcomes a browser change.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [rounded-radius-element](../props/rounded-radius-element.md)
