---
id: bcollapse
components:
- BCollapse
- BAccordion
- BLink
safeRewrite: true
manualReviewRequired: true
confidence: high
match:
- BCollapse
- BootstrapVue
- Bootstrap4
- BootstrapVueNext
- Bootstrap5
- BAccordion
- $root
- bv::collapse::state
- bv::toggle::collapse
- <BCollapse>
---

# BCollapse Migration

## Summary

Migration notes for BCollapse from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BCollapse
- BAccordion
- BLink

## Breaking Change

> **Deprecated / not supported** — `accordion` prop on `BCollapse` (deprecated by Bootstrap).

In `BootstrapVue`/`Bootstrap4`, accordions are implemented via `BCollapse`.
  In `BootstrapVueNext`/`Bootstrap5` accordions are first class citizens, so please use the
  [`BAccordion`](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/accordion) component instead.

The prop `toggle` has replaced the prop `appear` with slightly different semantics. In order to create a
collapse that is closed and transitions to open on the initial mount, set `visible` to false and `toggle` to true.

The `close` scoped slot element has been replaced by `hide` for consistency with the other props and
events on this component.

`$root` instance events `bv::collapse::state` and `bv::toggle::collapse` are deprecated.

See [Show and Hide](../patterns/show-hide.md) shared properties.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical, but review the result when surrounding behavior or adjacent props may affect the final markup.

## Related Migrations

- [show-hide](../patterns/show-hide.md)

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
