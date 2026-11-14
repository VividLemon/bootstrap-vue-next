---
id: bdropdown
components:
- BDropdown
- BDropdownDivider
- BDropdownForm
- BForm
- BLink
- BDropdownGroup
safeRewrite: false
manualReviewRequired: true
confidence: high
match:
- BDropdown
- floating-middleware
- popper-opts
- top-start
- top-end
- bottom-start
- bottom-end
- left-start
- left-end
- right-start
- right-end
- button-content
- $root
- bv::dropdown::hide
- bv::dropdown::show
- split-click
---

# BDropdown Migration

## Summary

Migration notes for BDropdown from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BDropdown
- BDropdownDivider
- BDropdownForm
- BForm
- BLink
- BDropdownGroup

## Breaking Change

BootstrapVueNext uses [floating-ui](https://floating-ui.com/) to implemented dropdowns. This affects values and behaviors
for properties such as `boundary` as well as the alignment and placement properties. For fine control, use `floating-middleware`
in place of `popper-opts`. Check out [our documentation](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/dropdown) and [theirs](https://floating-ui.com/) for details.

BootstrapVueNext replaces `dropup`, `dropleft`, `dropright`, and `right` props with a single `placement` prop.
Valid values for `placement` are: `top`, `top-start`, `top-end`, `bottom`, `bottom-start` (default), `bottom-end`, `left`, `left-start`, `left-end`, `right`, `right-start`, `right-end`.
See [floating-ui's docs](https://floating-ui.com/docs/computeposition#placement) for details.

| BootstrapVue prop | BootstrapVueNext `placement` value |
| ----------------- | ---------------------------------- |
| (default)         | `bottom-start`                     |
| `right`           | `bottom-end`                       |
| `dropup`          | `top-start`                        |
| `dropright`       | `right-start`                      |
| `dropleft`        | `left-start`                       |

Additionally, BootstrapVueNext supports new placement options that were not available in BootstrapVue, such as `bottom` for center alignment, `top-end`, `left-end`, `right-end`, and others.

> **Deprecated / not supported** — `block` prop on `BDropdown` (deprecated by Bootstrap).

See our [`BDropdown` documentation](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/dropdown#block-level-dropdowns)
  and [Bootstrap's documentation](https://getbootstrap.com/docs/5.3/components/buttons/#block-buttons) for
  details on creating block-level dropdowns.

> **Deprecated / not supported** — `html` prop on `BDropdown` (Vue 3 or Bootstrap 5 changes made this less relevant).

Use the `button-content` slot instead.

`$root` instance events `bv::dropdown::hide` and `bv::dropdown::show` are deprecated.

The boolean argument to control returning focus to the toggle button on the `hide` scoped property of the default slot is deprecated.
It is less important in BootstrapVueNext since bootstrap v5 by default doesn't have the focus ring that v4 has.

See [Show and Hide](../patterns/show-hide.md) shared properties.

See the [v-html](../patterns/v-html-props.md) section for information on deprecation of the `html` prop.

The `click` event that was emitted when clicking on the left or button side of a `split` dropdown
has been replaced by a `split-click` which provides the native mouse event. This is because
naming the event 'click' was hiding the native `click` event so supressing the that event for
parents that might have unexpected actions (such as a link navigating to a new page) was difficult.

> **Deprecated / not supported** — `toggleAttrs` prop on `BDropdown` (not implemented (insufficient demand for initial release)).

This prop will not be implemented for v1 due to insufficient demand.

### Dropdown sub-components

BootstrapVueNext makes extensive use of inherited attributes to implement customization in dropdown sub-components
in places where BootstrapVue used explicit props on the sub-components. In general the sub-components are
implemented as an `<li>` element wrapping the actual sub-component. In these cases, there is a `wrapper-class` prop
that is used to apply classes to the `<li>` element and an `*-class` prop that is used to apply classes to the
sub-component where `*-class` is related the name of the sub-component. e.g. `BDropdownDivider` has a `divider-class`
prop that is used to add classes to the actual divider element. In addition, the inherited attributes are applied to
the sub-component rather than the wrapper `<li>` tag and there is an explicit `wrapper-attr` tag defined to place
additional attributes on the `<li>` tag.

Looking at the code for
[`BDropdownDivider`](https://github.com/bootstrap-vue-next/bootstrap-vue-next/blob/main/packages/bootstrap-vue-next/src/components/BDropdown/BDropdownDivider.vue)
should give a clear picture how how the above fits together and the remainder of this section will give specifics
on how to handle migration from BootstrapVue.

Several of the BootstrapVue sub-components have an explicit `id` prop, which sets the id on the inner component. In
BootstrapVueNext the `id` as well as any other unspecified props will be set will be set on the inner component, having
the same effect as in BootstrapVue.

For example:

```vue-html
<BDropdown text="Dropdown">
  <BDropdownHeader id="my-header">Header Text</BDropdownHeader>
</BDropdown>
```

yields

```vue-html
<li role="presentation">
  <h6
    id="my-header"
    class="dropdown-header"
  >
    Header Text
  </h6>
</li>
```

The exception to this rule is `<BDropdownGroup>` where we explicitly implement `id` in order to be able to generate
a header id.

#### BDropdownForm

> **Deprecated / not supported** — `inline` prop on `BDropdownForm` (deprecated by Bootstrap).

See the [BForm](#bform) migration information. To add classes to the `&lt;form&gt;` tag in `BDropdownForm`
  use the `form-class` prop.

> **Deprecated / not supported** — `disabled` prop on `BDropdownForm` (Vue 3 or Bootstrap 5 changes made this less relevant).

Set the disabled prop on individual components as you do with `BForm`.

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- [show-hide](../patterns/show-hide.md)
- [v-html-props](../patterns/v-html-props.md)

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
