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
})
const props = useDefaults(_props, 'BThead')
defineSlots<BTheadSlots>()

const computedClasses = computed(() => ({
  [`theme-${props.theme}`]: props.theme !== null && props.theme !== undefined,
}))
</script>
