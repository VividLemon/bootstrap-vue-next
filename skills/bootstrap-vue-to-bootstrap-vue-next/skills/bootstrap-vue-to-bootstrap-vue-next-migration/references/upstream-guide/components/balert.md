---
id: balert
components:
- BAlert
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- BAlert
- bootstrap-vue
- v-model
- model-value
- <BAlert>
---

# BAlert Migration

## Summary

Migration notes for BAlert from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BAlert

## Breaking Change

As in `bootstrap-vue`, a simple `BAlert` is not visible by default. However, the means of showing the alert are different.

The primary way to control alert visibility is via `v-model` (or `model-value` in props). In practice this means the old `show.sync` pattern maps cleanly to `v-model`, while the `show` and `visible` props remain available for controlling initial visibility. See [Show and Hide](../patterns/show-hide.md) shared properties for details.

```vue-html
<BAlert show dismissible>I am an alert!</BAlert>
```

becomes

```vue-html
<BAlert model-value dismissible>I am an alert!</BAlert>
```

For consistency with other component properties, slots, and events, BootstrapVueNext uses the term `close` where BootstrapVue used `dismiss`. The mappings are mechanical: `dismissed` becomes `closed`, the `dismiss` slot becomes the `close` slot, and dismissible alert flows move cleanly to the new close naming.

> **Skill correction (not in upstream):** there is no `closed` event in bootstrap-vue-next 1.2.4. Use `@hidden` (any
> hide, including countdown expiry) or `@close` (close button only). See `../../guide-corrections-and-gaps.md` item 9.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- [show-hide](../patterns/show-hide.md)
