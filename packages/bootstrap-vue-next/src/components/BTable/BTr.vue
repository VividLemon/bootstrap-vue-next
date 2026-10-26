<template>
  <tr :class="computedClasses">
    <slot />
  </tr>
</template>

<script setup lang="ts">
import {useDefaults} from '../../composables/useDefaults'
import type {BTrProps, BTrSlots} from '../../types'
import {computed} from 'vue'

const _props = withDefaults(defineProps<BTrProps>(), {
  theme: null,
})
const props = useDefaults(_props, 'BTr')
defineSlots<BTrSlots>()

const computedClasses = computed(() => ({
  [`theme-${props.theme}`]: props.theme !== null && props.theme !== undefined,
}))
</script>
