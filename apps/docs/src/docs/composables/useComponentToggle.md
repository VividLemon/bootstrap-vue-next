---
title: useComponentToggle
description: 'You can use `useComponentToggle` to get the closest toggleable component in **child component** and show,hide or toggle it. It can also be supplied a target id to show, hide or toggle a specific component'
---

<HighlightCard>
  <template #html>

```vue
<BDialog @hide="(e) => e.trigger === 'sometrigger' && doSomething()">
  <MyComponent />
</BDialog>
```

<hr />
MyComponent.vue

```vue
<template>
  <BButton @click="hide('sometrigger')">Done</BButton>
</template>

<script setup lang="ts">
const {hide} = useComponentToggle()
</script>
```

  </template>
</HighlightCard>

You can also provide an id to get particular component and show/hide it. Currently, we do not support using CSS selector to
find modal since the component in lazy mode may not render at page initial. If the modal component does not exist and you attempt to call any of the exposed methods, the methods will safely no-op without throwing errors.

<<< DEMO ./demo/UseComponentToggleWithId.vue

## Trigger props

`props` turns an element into the target's trigger. Bind it with `v-bind` on a button (or any
element or component): a click toggles the target, `aria-controls` names it, and the target keeps
`aria-expanded` on the trigger in step with its visibility. A trigger inside an open `BDialog`
swaps that dialog for its target (see [Swapping dialogs](/docs/components/dialog#swapping-dialogs)).

Pass several ids, as an array or a space-separated string, and one trigger toggles them all.
`show`, `hide`, `toggle` and `value` keep acting on the first of them.

<<< DEMO ./demo/UseComponentToggleTrigger.vue

The same `props` can be bound on several triggers.

## Promise Flow

The `show` and `toggle` methods take a boolean argument to control wether to resolve the promise on show (`false`) or on hide (`true`). On `show` the promise resolves to `true` when shown and to `'show-prevented'` if show is prevented. On `hide` the promise resolves to the trigger that caused the hide event. The promise can be awaited to get the result.

<<< DEMO ./demo/UseComponentTogglePromise.vue
