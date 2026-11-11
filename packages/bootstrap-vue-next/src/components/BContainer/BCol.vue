<template>
  <component :is="props.tag" :class="computedClasses">
    <slot />
  </component>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import type {BColProps, BColSlots} from '../../types'
import {getResponsiveClasses} from '../../utils/responsive'
import {useDefaults} from '../../composables/useDefaults'

const _props = withDefaults(defineProps<BColProps>(), {
  alignSelf: undefined,
  cols: undefined,
  offset: undefined,
  order: undefined,
  tag: 'div',
})
const props = useDefaults(_props, 'BCol')
defineSlots<BColSlots>()

const colClasses = computed(() => getResponsiveClasses(props.cols, 'col'))

const computedClasses = computed(() => [
  // Only fall back to an equal-width `.col` when no column size is set at any breakpoint
  colClasses.value.length === 0 ? 'col' : colClasses.value,
  getResponsiveClasses(props.offset, 'offset'),
  getResponsiveClasses(props.order, 'order'),
  getResponsiveClasses(props.alignSelf, 'align-self'),
])
</script>
