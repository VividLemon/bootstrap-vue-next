---
id: bavatar
components:
- BAvatar
- BLink
safeRewrite: true
manualReviewRequired: true
confidence: high
match:
- BAvatar
- .svg
- badge-placement
- badge-placement='top'
- badge-top
- badge-placement='end'
- badge-right
- badge-offset
- <BAvatar>
---

# BAvatar Migration

## Summary

Migration notes for BAvatar from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BAvatar
- BLink

## Breaking Change

> **Deprecated / not supported** — Icon support on `BAvatar` (a modern alternative exists).

Icons can be implemented using the default slot with either [unplugin-icons](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/icons)
  or by embedding an `.svg`. See the [Icons](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/icons) guide for the recommended approach.

```vue-html
  <BAvatar>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="80%"
      height="80%"
      fill="currentColor"
      class="bi bi-person-hearts"
      viewBox="0 0 16 16"
    >
      <path
        fill-rule="evenodd"
        d="M11.5 1.246c.832-.855 2.913.642 0 2.566-2.913-1.924-.832-3.421 0-2.566M9 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h10s1 0 1-1-1-4-6-4-6 3-6 4m13.5-8.09c1.387-1.425 4.855 1.07 0 4.277-4.854-3.207-1.387-5.702 0-4.276ZM15 2.165c.555-.57 1.942.428 0 1.711-1.942-1.283-.555-2.281 0-1.71Z"
      />
    </svg>
  </BAvatar>
```

### Badge Positioning

Badge positioning has changed to using a single property `badge-placement` and our
[`CombinedPlacement` utility](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/types#combinedplacement) rather than individual properties.

For instance, use `badge-placement='top'` in place of `badge-top` or `badge-placement='end'` in place of
`badge-right`. For combined props, rather than using `badge-top` and `badge-right`, use
`badge-placement='top-end'`. This before/after mapping is straightforward and is a good candidate for codemod-style replacement.

> **Deprecated / not supported** — `badge-offset` (not implemented (insufficient demand for initial release)).

This property is [significantly more complex](https://github.com/bootstrap-vue-next/bootstrap-vue-next/pull/2692) to implement in BootstrapVueNext (due to Bootstrap 5.0's implementation).

### Rounding Sides

See the [Rounding](../props/rounded-radius-element.md) section. The directional rounding changes are also straightforward to map automatically.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical, but review the result when surrounding behavior or adjacent props may affect the final markup.

## Related Migrations

- [rounded-radius-element](../props/rounded-radius-element.md)

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
