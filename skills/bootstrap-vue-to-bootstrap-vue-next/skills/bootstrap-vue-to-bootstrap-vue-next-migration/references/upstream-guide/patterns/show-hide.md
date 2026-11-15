---
id: show-hide
components:
- BCollapse
- BModal
- BPlaceholder
- BToast
safeRewrite: false
manualReviewRequired: true
confidence: high
match:
- visible
- show
- hide-
- no-
- skipAnimation
- noAnimation
- v-model
---

# Show and Hide Prop Migration

## Summary

BootstrapVueNext standardizes visibility control around `v-model` and `no*`-prefixed rendering props.

## Affected APIs

- BCollapse
- BModal
- BPlaceholder
- BToast

## Breaking Change

We have made an effort to standardize the names and behaviors of props that are related to the showing
and hiding of components and sub-components.

The primary reactive way to control the visibility of a component is generally by use of the `v-model` rather
than `visible` as in `BCollapse`, `BModal`, `BToast`. Note that `show` and `visible` are still supported for
specifying the initial visibility of these components.

Rather than using `hide` as a prefix to specify that you don't want a sub-component to be rendered, we've moved to using `no`
as the prefix. For instant in `BPlaceholder`, `hideHeader` becomes `noHeader`. Similarly we use the 'no' prefix in place
of 'skip' in places like `BCollapse` where `skipAnimation` becomes `noAnimation`.

The properties and components that are affected by this change are shown in the following table:

| BootstrapVue prop | BootstrapVueNext prop | Components |
|---|---|---|
| `visible` (with `.sync`/v-model) | `v-model` / `model-value` (`visible` still sets initial state) | BCollapse, BDropdown, BModal, BNavItemDropdown, BOffcanvas, BPopover, BToast, BTooltip |
| `appear` | `initial-animation` | BAccordion, BAccordionItem, and the components above |
| `lazy` | `lazy` (+ new `unmount-lazy`) | BAccordion, BAccordionItem, and the components above |
| `skip-animation` | `no-animation` (also `no-fade`) | the components above |
| `hide-backdrop` | `no-backdrop` | BModal, BOffcanvas |
| `hide-ellipsis` | `no-ellipsis` | BPagination |
| `hide-footer` | `no-footer` | BModal |
| `hide-goto-end-buttons` | `no-goto-end-buttons` | BPagination |
| `hide-header` | `no-header` | BModal, BOffcanvas, BPlaceholderCard, BPlaceholderTable |
| `hide-header-close` | `no-header-close` | BModal, BOffcanvas |
| `skip-wrapper` | `no-wrapper` | BDropdown, BNavItemDropdown |

> **Skill correction (not in upstream):** `skip-animation` and `skip-wrapper` were never props in bootstrap-vue 2.23.1
> (they are renames from early bootstrap-vue-next releases). Nothing to migrate for them. See
> `../../guide-corrections-and-gaps.md` item 10.
| (new) | `show`, `trans-props` | the components above |

_Table transcribed from `apps/docs/src/components/ShowHideProps.vue` (migrationMap)._

## Migration Notes

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- None
