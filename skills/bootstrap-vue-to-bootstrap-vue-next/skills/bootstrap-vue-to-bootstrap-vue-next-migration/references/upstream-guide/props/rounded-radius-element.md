---
id: rounded-radius-element
components:
- BAvatar
- BAvatarGroup
- BCardImg
- BImg
- BOverlay
safeRewrite: true
manualReviewRequired: false
confidence: high
replacement:
  top: rounded-top
  bottom: rounded-bottom
  left: rounded-start
  right: rounded-end
deprecated:
- rounded="left"
- rounded="right"
match:
- rounded="top"
- rounded="bottom"
- rounded="left"
- rounded="right"
- rounded-top
- rounded-bottom
- rounded-start
- rounded-end
---

# RadiusElementExtendables Rounding Migration

## Summary

Directional `rounded` prop values from BootstrapVue are replaced by edge-specific RadiusElement props in BootstrapVueNext.

## Affected APIs

- BAvatar
- BAvatarGroup
- BCardImg
- BImg
- BOverlay

## Breaking Change

`BAvatar`, `BAvatarGroup`, `BCardImg`, `BImg` and `BOverlay` all implement
[`RadiusElementExtendables`](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/types#radiuselementextendables) in order to support complex
rounding behavior. The `rounded`, `rounded-top`, `rounded-bottom`, `rounded-start`, and `rounded-end`
props each takes a [`RadiusElement`](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/types#radiuselement) value to specify how the component
is rounded. The edge specific props such as `rounded-top` override the `rounded` prop for that edge.

This takes the place of `top`, `bottom`, `left`, and `right` values for the `rounded` prop.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [bavatar](../components/bavatar.md)
- [bimg](../components/bimg.md)
- [boverlay](../components/boverlay.md)
