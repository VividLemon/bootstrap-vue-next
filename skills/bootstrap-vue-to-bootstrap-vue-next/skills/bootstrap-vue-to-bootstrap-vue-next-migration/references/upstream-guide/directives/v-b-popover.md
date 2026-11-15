---
id: v-b-popover
components:
- BPopover
safeRewrite: false
manualReviewRequired: true
confidence: high
deprecated:
- .inline
match:
- Popover
- v-b-popover
- .click
- .hover
- .focus
- .manual
- .top
- .bottom
- .left
- .right
- .body
- .child
- .inline
- .lazy
- .realtime
- .interactive
---

# v-b-popover Migration

## Summary

Migration notes for v-b-popover from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BPopover

## Breaking Change

The `v-b-popover` directive syntax has changed to use modifier-based configuration instead of configuration objects.

### Trigger Configuration

BSV used string-based triggers while BSVN uses modifiers:

```vue-html
<!-- BootstrapVue -->
<button
  v-b-popover.hover.bottom="'Content'"
  title="Title"
>
  Hover
</button>

<!-- BootstrapVueNext -->
<BButton
  v-b-popover.hover.bottom="'Content'"
  title="Title"
>
  Hover
</BButton>
```

Available trigger modifiers:

- `.click` - Toggle on click (BSV: `'click'`)
- `.hover` - Show on hover (BSV: `'hover'`)
- `.focus` - Show on focus (BSV: `'focus'`)
- `.manual` - Manual control (BSV: `'manual'`)

Default behavior: If no trigger modifier is specified, BSVN defaults to **both hover and focus** triggers (same as BSV).

### Placement Configuration

BSV used complex placement strings while BSVN uses simple modifiers:

```vue-html
<!-- BootstrapVue -->
<button v-b-popover.hover.topleft="'Content'">Top Left</button>
<button v-b-popover.hover.bottomright="'Content'">Bottom Right</button>

<!-- BootstrapVueNext -->
<BButton v-b-popover.hover.top="'Content'">Top</BButton>
<BButton v-b-popover.hover.right="'Content'">Right</BButton>
```

BSVN uses four simple placement modifiers:

- `.top`
- `.bottom`
- `.left`
- `.right`

BSV's fine-grained placements (`topleft`, `topright`, `bottomleft`, `bottomright`, `lefttop`, `leftbottom`, `righttop`, `rightbottom`) are not available as modifiers. Use the component version `<BPopover>` for precise placement control.

### Value Configuration

The directive value can be a string or an object:

```vue-html
<!-- Simple string content (same in both) -->
<BButton v-b-popover="'Popover content'">Button</BButton>
```

```vue-html
<!-- BootstrapVue -->
<button
  v-b-popover="{
    title: 'Title',
    content: 'Body',
    delay: { show: 500, hide: 100 }
  }"
>
  Button
</button>
```

```vue-html
<!-- BootstrapVueNext -->
<BButton
  v-b-popover.hover.top="{
    title: 'Title',
    body: 'Body',
    delay: { show: 500, hide: 100 }
  }"
>
  Button
</BButton>
```

Note: BSV used `content` property, BSVN uses `body` property in object configuration.

### Custom Class Properties

BSV used a `customClass` property, while BSVN provides more granular control:

**BSV:**

```vue-html
<!-- BSV (BootstrapVue) -->
<BButton v-b-popover="{title: 'Title', content: 'Content', customClass: 'my-custom-class'}">
  Button
</BButton>
```

**BSVN:**

```vue-html
<!-- BSVN (BootstrapVueNext) -->
<BButton
  v-b-popover="{title: 'Title', body: 'Content', bodyClass: 'my-body-class', titleClass: 'my-title-class'}"
>
  Button
</BButton>
```

BSVN provides separate `bodyClass` and `titleClass` properties for more precise styling control.

### Special Modifiers

BSVN adds new modifiers not available in BSV:

- `.body` - Append to `<body>` (BSV: no equivalent modifier)
- `.child` - Append as child element
- `.inline` - Use inline positioning for multi-line text
- `.lazy` - Defer rendering until first shown
- `.realtime` - Update position in real-time
- `.interactive` - Allow interactive content

### Title Attribute Handling

Both versions support using the element's `title` attribute:

```vue-html
<!-- Same in both -->
<button
  v-b-popover.hover.top="'Content'"
  title="Title"
>
  Button
</button>
```

BSVN automatically removes the `title` attribute and stores it as `data-original-title` to prevent browser tooltips.

### Migration Examples

**Basic hover popover:**

```vue-html
<!-- BootstrapVue -->
<button
  v-b-popover.hover="'Content'"
  title="Title"
>
  Hover
</button>
```

```vue-html
<!-- BootstrapVueNext -->
<BButton
  v-b-popover.hover="'Content'"
  title="Title"
  >Hover</BButton
>
```

**Click popover with placement:**

```vue-html
<!-- BootstrapVue -->
<button v-b-popover.click.bottom="'Content'">Click</button>
```

```vue-html
<!-- BootstrapVueNext -->
<BButton v-b-popover.click.bottom="'Content'">Click</BButton>
```

**Manual control:**

```vue
<template>
  <button
    ref="btn"
    v-b-popover.manual="popoverConfig"
  >
    Manual
  </button>
</template>
<script lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck -- BSV example demonstrating deprecated $root.$emit pattern
export default {
  data() {
    return {
      popoverConfig: {
        title: 'Title',
        content: 'Content',
      },
    }
  },
  methods: {
    showPopover() {
      this.$root.$emit('bv::show::popover', 'btn')
    },
  },
}
</script>
```

```vue
<template>
  <BButton v-b-popover.manual.show="isShown && popoverConfig">Manual</BButton>
</template>
<script setup lang="ts">
import {ref} from 'vue'

const isShown = ref(false)
const popoverConfig = {
  title: 'Title',
  body: 'Content',
}
</script>
```

**Complex configuration:**

```vue-html
<!-- BootstrapVue -->
<button
  v-b-popover="{
    title: 'Title',
    content: 'Body',
    placement: 'top',
    trigger: 'hover',
    delay: { show: 500, hide: 100 }
  }"
>
  Button
</button>
```

```vue-html
<!-- BootstrapVueNext -->
<BButton
  v-b-popover.hover.top="{
    title: 'Title',
    body: 'Body',
    delay: { show: 500, hide: 100 }
  }"
>
  Button
</BButton>
```

### When to Use Component Instead

For complex scenarios, migrate to the `<BPopover>` component:

- Fine-grained placement control (`top-start`, `bottom-end`, etc.)
- Rich HTML content via slots
- Programmatic control with full API
- Interactive content (forms, buttons)
- Custom variants and styling

```vue-html
<!-- BSV directive -->
<button v-b-popover.hover.topleft="complexContent">Button</button>
```

```vue-html
<!-- BSVN component (recommended for complex cases) -->
<BButton id="btn">Button</BButton>
<BPopover
  target="btn"
  placement="top-start"
  hover
>
  <template #title>Custom Title</template>
  <div>
    <p>Rich content with <strong>HTML</strong></p>
    <BButton size="sm">Action</BButton>
  </div>
</BPopover>
```

## Migration Notes

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- None
