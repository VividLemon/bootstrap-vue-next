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
})
const props = useDefaults(_props, 'BTfoot')
defineSlots<BTfootSlots>()

const computedClasses = computed(() => ({
  [`theme-${props.theme}`]: props.theme !== null && props.theme !== undefined,
}))
</script>
