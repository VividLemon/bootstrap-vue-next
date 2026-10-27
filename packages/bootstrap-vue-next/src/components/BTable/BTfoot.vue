<template>
  <tfoot :class="computedClasses">
    <slot />
  </tfoot>
</template>

<script setup lang="ts">
import {useDefaults} from '../../composables/useDefaults'
import type {BTfootProps, BTfootSlots} from '../../types'
import {computed} from 'vue'

const _props = withDefaults(defineProps<BTfootProps>(), {
  theme: null,
  bg: null,
  fg: null,
})
const props = useDefaults(_props, 'BTfoot')
defineSlots<BTfootSlots>()

const computedClasses = computed(() => ({
  [`theme-${props.theme}`]: props.theme !== null && props.theme !== undefined,
  [`bg-${props.bg}`]: props.bg !== null && props.bg !== undefined,
  [`fg-${props.fg}`]: props.fg !== null && props.fg !== undefined,
}))
</script>
