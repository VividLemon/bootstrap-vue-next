<template>
  <thead :class="computedClasses">
    <slot />
  </thead>
</template>

<script setup lang="ts">
import type {BTheadProps, BTheadSlots} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'

const _props = withDefaults(defineProps<BTheadProps>(), {
  theme: null,
  bg: null,
  fg: null,
})
const props = useDefaults(_props, 'BThead')
defineSlots<BTheadSlots>()

const computedClasses = computed(() => ({
  [`theme-${props.theme}`]: props.theme !== null && props.theme !== undefined,
  [`bg-${props.bg}`]: props.bg !== null && props.bg !== undefined,
  [`fg-${props.fg}`]: props.fg !== null && props.fg !== undefined,
}))
</script>
