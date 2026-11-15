---
id: bskeleton
components:
- BSkeleton
- BPlaceholderButton
- BPlaceholder
- BSkeletonIcon
- BPlaceholderWrapper
- BSkeletonImg
safeRewrite: false
manualReviewRequired: true
confidence: high
match:
- BSkeleton
- BPlaceholderButton
- <BSkeleton>
---

# BSkeleton Migration

## Summary

BootstrapVueNext removes the `BSkeleton` family in favor of Bootstrap 5 placeholder components, so migrations require manual review.

## Affected APIs

- BSkeleton
- BPlaceholderButton
- BPlaceholder
- BSkeletonIcon
- BPlaceholderWrapper
- BSkeletonImg

## Breaking Change

`<BSkeleton*>` components are removed in favor of the Bootstrap 5 placeholder model exposed by
`<BPlaceholder*>` and `<BPlaceholderWrapper>`.

`<BSkeletonIcon>` is deprecated along with the rest of the BootstrapVue icon support. See our
[icon documentation](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/icons) for details. This functionality can be replicated by using
`<BPlaceholderWrapper>` with your choice of icon replacement in the `loading` slot.

`<BSkeletonImg>` is deprecated, using `<BPlaceholderWrapper>` should be a workable replacement.

`animation` values have changed from `Wave`, `Fade`, `Throb` and `None` to `wave`, `glow`,
and `undefined` to reflect the [Bootstrap 5 animations](https://getbootstrap.com/docs/5.3/components/placeholders/#animation)

`type` has been deprecated. [`BPlaceholderButton`](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/placeholder#placeholder-buttons) is a replacement for the button type. Because Bootstrap 5 placeholder styling differs from the BootstrapVue skeleton styling, review the visual result even when the API mapping is straightforward.
If you find a need for the other types (Avatar or Input), please open an issue or propose a pull request.

In practice, teams that are already comfortable with Bootstrap 5 placeholder design can script parts
of this migration, but the resulting layout, spacing, and loading behavior should still be reviewed
by hand.

## Migration Notes
- Manual review is required because Bootstrap 5 placeholders are not a drop-in visual replacement for
  BootstrapVue skeletons.

## Safe Automatic Rewrite

No. You may choose to automate some tag and prop rewrites if you are intentionally adopting the
Bootstrap 5 placeholder design, but there is no generally safe automatic rewrite.

## Related Migrations

- None
