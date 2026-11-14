---
id: v-b-tooltip
components: []
safeRewrite: true
manualReviewRequired: false
confidence: high
match:
- Tooltip
- v-b-tooltip
- data-original-title
- .top
- .bottom
---

# v-b-tooltip Migration

## Summary

Migration notes for v-b-tooltip from BootstrapVue to BootstrapVueNext.

## Affected APIs

- None explicitly listed

## Breaking Change

The `v-b-tooltip` directive works similarly between BSV and BSVN, but has some important differences:

### Basic Usage

Simple string tooltips work the same:

**BSV:**

```html
<!-- BSV (BootstrapVue) -->
<BButton v-b-tooltip="'Tooltip text'"> Button </BButton>
```

**BSVN:**

```html
<!-- BSVN (BootstrapVueNext) -->
<BButton v-b-tooltip="'Tooltip text'"> Button </BButton>
```

### Trigger Modifiers

When using modifiers, BSVN recommends providing tooltip content via the directive value, although it will still fall back to the element's `title`/`data-original-title` attributes when no value is given.

**BSV:**

```html
<!-- BSV (BootstrapVue) -->
<BButton
  v-b-tooltip.hover.bottom
  title="Tooltip text"
>
  Button
</BButton>
```

**BSVN:**

```html
<!-- BSVN (BootstrapVueNext) -->
<BButton v-b-tooltip.hover.bottom="'Tooltip text'"> Button </BButton>
```

BSVN automatically removes the `title` attribute and stores it as `data-original-title` to prevent browser tooltips.

### Object Configuration

The object configuration interface has changed:

**BSV:**

```html
<!-- BSV (BootstrapVue) -->
<BButton
  v-b-tooltip="{
    title: 'Tooltip text',
    delay: 500,
    placement: 'bottom'
  }"
>
  Button
</BButton>
```

**BSVN:**

```html
<!-- BSVN (BootstrapVueNext) -->
<BButton
  v-b-tooltip.bottom="{
    title: 'Tooltip text',
    delay: {show: 500, hide: 100}
  }"
>
  Button
</BButton>
```

Key changes:

- `placement` is now specified via modifier (`.top`, `.bottom`, etc.) instead of in the object
- `delay` accepts either a scalar number (applies to both show and hide) or an object `{show: number, hide: number}` for independent control
- Floating UI (instead of Popper.js) is used for positioning

### Custom Classes (Directive)

BSV's `customClass` property has been replaced with `bodyClass` and `titleClass` for more granular control:

**BSV:**

```html
<!-- BSV (BootstrapVue) -->
<BButton v-b-tooltip="{title: 'My tooltip', customClass: 'my-tooltip-class'}">Hover me</BButton>
```

**BSVN:**

```html
<!-- Use titleClass when rendering title content -->
<button v-b-tooltip="{title: 'My tooltip', titleClass: 'my-title-class'}">Hover me</button>

<!-- Use bodyClass when rendering body content -->
<!-- Note: tooltips render EITHER title OR body, never both -->
<button v-b-tooltip="{body: 'Content', bodyClass: 'my-body-class'}">Hover me</button>
```

::: tip Tooltip Rendering Behavior
Unlike popovers which can display both title and body simultaneously, tooltips only display **either** title **or** body content. The `titleClass` and `bodyClass` properties are mutually exclusive - only one will apply at a time depending on which content is rendered.
:::

See the [Tooltip Directive documentation](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/directives/BTooltip) for complete details.

## Migration Notes

## Safe Automatic Rewrite

Yes. This entry is mostly mechanical and can usually be rewritten automatically when the surrounding code matches the documented patterns.

## Related Migrations

- None
