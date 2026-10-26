<template>
  <tbody :class="computedClasses">
    <slot />
  </tbody>
</template>

<script setup lang="ts">
import type {BTbodyProps, BTbodySlots} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'

const _props = withDefaults(defineProps<BTbodyProps>(), {
  theme: null,
  bg: null,
  fg: null,
})
const props = useDefaults(_props, 'BTbody')
defineSlots<BTbodySlots>()

const computedClasses = computed(() => ({
  [`theme-${props.theme}`]: props.theme !== null && props.theme !== undefined,
  [`bg-${props.bg}`]: props.bg !== null && props.bg !== undefined,
  [`fg-${props.fg}`]: props.fg !== null && props.fg !== undefined,
}))
</script>
