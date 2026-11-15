---
id: bmodal
components:
- BModal
- BLink
- BApp
safeRewrite: false
manualReviewRequired: true
confidence: high
replacement:
  hide-header-close: no-header-close
  hide-footer: no-footer
  hide-header: no-header
  hide-backdrop: no-backdrop
  no-enforce-focus: no-trap
  title-sr-only: title-visually-hidden
deprecated:
- hide-header-close
- hide-footer
- hide-header
- hide-backdrop
- no-enforce-focus
- title-sr-only
- aria-label
- auto-focus-button
- ignore-enforce-focus-selector
match:
- BModal
- footer-tag
- header-tag
- $bvModal
- this.$bvModal.show(id)
- useModal
- .show()
- this.$bvModal.hide(id)
- .hide()
- this.$bvModal.msgBoxOk()
- useModal().create()
- ok-only
- this.$bvModal.msgBoxConfirm()
- $root.$emit('bv::show::modal', id)
- $root.$emit('bv::hide::modal', id)
- $root.$emit('bv::toggle::modal', id)
---

# BModal Migration

## Summary

Migration notes for BModal from BootstrapVue to BootstrapVueNext.

## Affected APIs

- BModal
- BLink
- BApp

## Breaking Change

> **Deprecated / not supported** — `footer-tag` and `header-tag` props on `BModal` (Vue 3 or Bootstrap 5 changes made this less relevant).

Use the `footer` and `title` slots instead. See the
  [modal documentation](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/modal#custom-rendering-with-slots) for details.

### Removed Global Modal Management

> **Deprecated / not supported** — `$bvModal` instance methods (Vue 3 or Bootstrap 5 changes made this less relevant).

- `this.$bvModal.show(id)` → Use `useModal` composable or template refs with `.show()`
- `this.$bvModal.hide(id)` → Use `useModal` composable or template refs with `.hide()`
- `this.$bvModal.msgBoxOk()` → Use `useModal().create()` with `ok-only` prop - see [below](#replacement-for-modal-message-boxes)
- `this.$bvModal.msgBoxConfirm()` → Use `useModal().create()`- see [below](#replacement-for-modal-message-boxes)

**$root event system is deprecated:**

- `$root.$emit('bv::show::modal', id)` → Use composables or template refs
- `$root.$emit('bv::hide::modal', id)` → Use composables or template refs
- `$root.$emit('bv::toggle::modal', id)` → Use composables or template refs

**Alternative approaches:**

Please see [useModal](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/composables/useModal) and [useToggle](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/composables/useToggle) for alternative methods of
accessing modals globally.

### Modal Event System Changes

The event system has been significantly updated in BootstrapVueNext:

BootstrapVueNext does not support listening to modal changes via `$root` events.

**New Events**: BootstrapVueNext adds several new events not present in BootstrapVue:

- `backdrop` - Emitted when the backdrop is clicked
- `esc` - Emitted when the Esc key is pressed
- `show-prevented`, `hide-prevented`, `toggle-prevented` - Emitted when actions are prevented

**Event Object Changes**: The event object structure has changed:

- `BvModalEvent` is now `BvTriggerableEvent`
- `vueTarget` property is **no longer available** - use template refs or the `target` property instead
- Event properties are now more consistent across all BootstrapVueNext components

**Trigger Values**: The `trigger` property values have been simplified:

- BootstrapVue: `'headerclose'` → BootstrapVueNext: `'close'`
- All other trigger values remain the same: `'ok'`, `'cancel'`, `'esc'`, `'backdrop'`

### Modal Props Changes

**Renamed props:**

- `hide-header-close` → `no-header-close`
- `hide-footer` → `no-footer`
- `hide-header` → `no-header`
- `hide-backdrop` → `no-backdrop`
- `no-enforce-focus` → `no-trap`
- `title-sr-only` → `title-visually-hidden`

**Removed props (not implemented in BootstrapVueNext):**

- `aria-label` - Use standard HTML attributes directly on the component. **Note**: Unlike BootstrapVue, BootstrapVueNext does not automatically remove `aria-labelledby` when `aria-label` is present. If using `aria-label`, set `no-header="true"` to prevent conflicts, or ensure your `aria-label` is descriptive enough to work alongside `aria-labelledby`
- `auto-focus-button` - Use the `focus` prop with values `'ok'`, `'cancel'`, or `'close'`
- `ignore-enforce-focus-selector` - Use `no-trap` to disable focus trapping entirely
- `return-focus` - Focus return is handled automatically by the focus trap system
- `static` - All modals use teleport by default. Use `teleport-disabled` for local rendering

See the [v-html](../patterns/v-html-props.md) section for information on deprecation of the `cancel-title-html`, `ok-title-html`, and `title-html` props.

**New props in BootstrapVueNext:**

- `teleport-to` - Specify where the modal should be teleported (default: `'body'`)
- `teleport-disabled` - Render modal in place instead of teleporting
- `body-scrolling` - Allow body scrolling while modal is open
- `backdrop-first` - Control backdrop animation timing
- `no-trap` - Disable focus trapping (replaces `no-enforce-focus`)
- `focus` - Enhanced focus control replacing `auto-focus-button`
- `title-visually-hidden` - Hide title visually but keep for screen readers
- `header-close-variant` - Control close button variant
- `header-close-label` - Accessibility label for close button
- `lazy` - **Available in BootstrapVueNext** - When set, the content will not be mounted until opened
- `no-fade` - **Available in BootstrapVueNext** - Disables animation (alias for `no-animation`)
- `no-animation` - Disables animation
- `unmount-lazy` - When set and `lazy` is true, content will be unmounted when closed
- `initial-animation` - When set, enables the initial animation on mount

**Changed behavior:**

- `header-close-content` - This prop is **removed** in BootstrapVueNext. In BootstrapVue, this prop allowed customizing the close button content (defaulted to `'&times;'`). In BootstrapVueNext, use the `header-close` slot instead, which provides more flexibility than the simple string prop:

```vue-html
<BModal>
  <template #header-close>
    <span aria-hidden="true">&times;</span>
  </template>
</BModal>
```

```vue-html
<BModal>
  <template #header-close>
    <BIcon icon="x-lg" />
  </template>
</BModal>
```

### Modal Slot changes

[BootstrapVue](https://bootstrap-vue.github.io/bootstrap-vue/docs/components/modal#custom-rendering-with-slots) provides different slots to configure some pieces of the modal component. These slots are slightly different in [BootstrapVueNext](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/modal#comp-reference-bmodal-slots):

| BootstrapVue       | BootstrapVueNext |
| ------------------ | ---------------- |
| default            | default          |
| modal-backdrop     | backdrop         |
| modal-cancel       | cancel           |
| modal-footer       | footer           |
| modal-header       | header           |
| modal-header-close | header-close     |
| modal-ok           | ok               |
| modal-title        | title            |

### Modal Slot Scoped Variables Changes

The scoped variables available to modal slots have changed between BootstrapVue and BootstrapVueNext:

**BootstrapVue slot scope:**

```typescript
interface BSVSlotScope {
  visible: boolean
  ok: () => void
  cancel: () => void
  close: () => void
}
```

**BootstrapVueNext slot scope (BModalSlotsData):**

```typescript
interface BModalSlotsData {
  id: string
  visible: boolean
  active: boolean // Same as visible
  cancel: () => void
  close: () => void
  ok: () => void
  show: (trigger?: string, noTriggerEmit?: boolean) => void
  hide: (trigger?: string, noTriggerEmit?: boolean) => void
  toggle: (trigger?: string, noTriggerEmit?: boolean) => void
}
```

**Key changes:**

- **New properties**: `id`, `show()`, `toggle()` are now available
- **Enhanced `hide()` method**: Now accepts optional `noTriggerEmit` parameter
- **Trigger value change**: `close()` now emits trigger `'close'` instead of `'headerclose'`
- **Dual visibility properties**: Both `active` and `visible` provide the same visibility state

### Modal Z-Index and Stacking Changes

BootstrapVueNext has completely rewritten modal stacking:

- **Automatic z-index management**: No manual z-index calculation needed
- **CSS variables for stacking**: Uses `--b-position`, `--b-inverse-position`, `--b-count`
- **Stack positioning classes**: Automatically applies `.stack-position-*` classes
- **Multiple modal support**: Enhanced support for multiple modals with proper layering

### Replacement for Modal Message boxes

[BootstrapVue](https://bootstrap-vue.github.io/bootstrap-vue/docs/components/modal#modal-message-boxes) provided two methods on the `this.$bvModal` object called `msgBoxOk` and `msgBoxConfirm`.
In keeping with the Vue3 first philosophy, BootstrapVueNext provides a composable called [`useModal`](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/composables/useModal) that
fills the same use cases (and more).

Please read the [`useModal`](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/composables/useModal) documentation and then return here for examples of replacements
for `msgBoxOk` and `msgBoxConfirm`.

Example using `useModal.create` to replace `msgBoxOk`:
Note: If you use `<BApp>`, the modal orchestrator is included by default.

```vue
<template>
  <div>
    <BButton @click="okBox">Show Message</BButton>
    <div>Result: {{ okResult }}</div>
  </div>
</template>

<script setup lang="ts">
import { useModal } from 'bootstrap-vue-next/composables/useModal'
import { ref } from 'vue'

const { create } = useModal()

const okResult = ref<boolean | null | undefined>(null)

const okBox = async () => {
  await using value = await create({
    body: 'This is an informational message',
    title: 'Message',
    okOnly: true,
  }).show()
  okResult.value = typeof value === 'object' && value !== null && 'ok' in value ? value.ok : null
}
</script>
```

Example using `useModal.create` to replace `msgBoxConfirm`:
Note: If you use `<BApp>`, the modal orchestrator is included by default.

```vue
<template>
  <div>
    <BButton @click="confirmBox">Show Confirm</BButton>
    <div>Result: {{ confirmResult ?? 'null' }}</div>
  </div>
</template>

<script setup lang="ts">
import { useModal } from 'bootstrap-vue-next/composables/useModal'

import { ref } from 'vue'

const { create } = useModal()
const confirmResult = ref<boolean | null | undefined>(null)

const confirmBox = async () => {
  await using value = await create({
    body: 'Are you sure you want to do this?',
    title: 'Confirm',
    okTitle: 'Yes',
    cancelTitle: 'No',
  }).show()
  confirmResult.value =
    typeof value === 'object' && value !== null && 'ok' in value ? value.ok : null
}
</script>
```

The `create` method accepts all properties defined on
[BModal](https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/modal#component-reference).

See [Show and Hide](../patterns/show-hide.md) shared properties.

### Modal Focus Management Changes

BootstrapVueNext uses a modern focus trap system with enhanced accessibility:

**Enhanced focus prop**: The `focus` prop replaces `auto-focus-button` and accepts:

- `'ok'`, `'cancel'`, `'close'` - Focus built-in buttons
- Element references, selectors, or HTMLElements for custom focus targets
- `false` to disable initial focus (not recommended for accessibility)

**Automatic focus return**: Focus is automatically returned to the triggering element when the modal closes,
eliminating the need for:

- `return-focus` prop - Handled automatically by focus trap
- Manual focus management in most cases

**Focus trapping**: Enabled by default using `@vueuse/integrations/useFocusTrap`:

- `no-trap` replaces `no-enforce-focus` to disable focus trapping
- `ignore-enforce-focus-selector` is not available - use `no-trap` if needed
- Focus automatically cycles within the modal

**ARIA improvements**:

- `title-visually-hidden` replaces `title-sr-only` with better semantic naming
- Standard HTML `aria-*` attributes work directly on the component
- Enhanced screen reader support with proper labeling

## Migration Notes
- Review related migrations for shared prop, event, and slot changes.

## Safe Automatic Rewrite

No. This entry includes behavioral or structural changes and should be reviewed manually before applying automated transforms.

## Related Migrations

- [v-html-props](../patterns/v-html-props.md)
- [show-hide](../patterns/show-hide.md)

<script setup lang="ts">
import {DeprecationReason} from '../../../types/deprecation'
</script>
