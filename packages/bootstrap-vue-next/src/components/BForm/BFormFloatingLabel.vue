<template>
  <div class="form-floating">
    <slot />
    <label :for="props.labelFor">
      <slot name="label">
        {{ props.label }}
      </slot>
    </label>
  </div>
</template>

<script setup lang="ts">
import {useDefaults} from '../../composables/useDefaults'
import type {BFormFloatingLabelProps} from '../../types/ComponentProps'

const _props = withDefaults(defineProps<BFormFloatingLabelProps>(), {
  label: undefined,
  labelFor: undefined,
  text: undefined,
})
const props = useDefaults(_props, 'BFormFloatingLabel')

defineSlots<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: Record<string, never>) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  label?: (props: Record<string, never>) => any
}>()
</script>
