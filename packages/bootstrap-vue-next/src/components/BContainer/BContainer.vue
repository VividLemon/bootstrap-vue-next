<template>
  <component :is="props.tag" :class="computedClasses">
    <slot />
  </component>
</template>

<script setup lang="ts">
import type {BContainerProps, BContainerSlots} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import {useContainerClasses} from '../../composables/useContainerClasses'
import {getResponsiveClasses} from '../../utils/responsive'
import {computed} from 'vue'

const _props = withDefaults(defineProps<BContainerProps>(), {
  fluid: false,
  gutterX: undefined,
  gutterY: undefined,
  tag: 'div',
})
const props = useDefaults(_props, 'BContainer')
defineSlots<BContainerSlots>()

// `fluid: false` is a fixed-width `.container`, `fluid: true` is `.container-fluid`
const {classes: containerClasses} = useContainerClasses(() =>
  props.fluid === false ? true : props.fluid === true ? 'fluid' : props.fluid
)

const computedClasses = computed(() => [
  containerClasses.value,
  getResponsiveClasses(props.gutterX, 'gx'),
  getResponsiveClasses(props.gutterY, 'gy'),
])
</script>
