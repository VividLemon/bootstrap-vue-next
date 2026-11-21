<template>
  <BButton
    v-if="!props.okOnly"
    :color="{theme: 'secondary'}"
    :disabled="props.cancelDisabled"
    :autofocus="dialog?.focus.value === 'cancel' ? true : undefined"
    v-bind="props.cancelAttrs"
    @click="dialog?.cancel()"
  >
    <slot name="cancel">
      {{ props.cancelTitle }}
    </slot>
  </BButton>
  <BButton
    :color="{theme: 'primary'}"
    :disabled="props.okDisabled"
    :autofocus="dialog?.focus.value === 'ok' ? true : undefined"
    v-bind="props.okAttrs"
    @click="dialog?.ok()"
  >
    <slot name="ok">
      {{ props.okTitle }}
    </slot>
  </BButton>
</template>

<script setup lang="ts">
import {inject} from 'vue'
import type {BDialogActionsProps, BDialogActionsSlots} from '../../types'
import BButton from '../BButton/BButton.vue'
import {useDefaults} from '../../composables/useDefaults'
import {warn} from '../../utils/console'
import {dialogInjectionKey} from '../../utils/keys'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<BDialogActionsProps>(), {
  cancelAttrs: undefined,
  cancelDisabled: false,
  cancelTitle: 'Cancel',
  okAttrs: undefined,
  okDisabled: false,
  okOnly: false,
  okTitle: 'OK',
})
const props = useDefaults(_props, 'BDialogActions')
defineSlots<BDialogActionsSlots>()

// OK calls the enclosing dialog's `ok()` (cancelable `ok` event, then a hide with trigger
// `'ok'`), Cancel hides it with trigger `'cancel'`
const dialog = inject(dialogInjectionKey, null)
if (!dialog) {
  warn('BDialogActions', 'BDialogActions must be used inside a BDialog.')
}
</script>
