<template>
  <component :is="props.tag" class="row" :class="computedClasses">
    <slot />
  </component>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {getResponsiveClasses} from '../../utils/responsive'
import {useDefaults} from '../../composables/useDefaults'
import type {BRowProps, BRowSlots} from '../../types'

const _props = withDefaults(defineProps<BRowProps>(), {
  tag: 'div',
  gutterX: undefined,
  gutterY: undefined,
  noGutters: false,
  alignV: undefined,
  alignH: undefined,
  alignContent: undefined,
  cols: undefined,
})
const props = useDefaults(_props, 'BRow')
defineSlots<BRowSlots>()

const computedClasses = computed(() => [
  getResponsiveClasses(props.cols, 'row-cols'),
  getResponsiveClasses(props.gutterX, 'gx'),
  getResponsiveClasses(props.gutterY, 'gy'),
  {'g-0': props.noGutters},
  getResponsiveClasses(props.alignV, 'align-items'),
  getResponsiveClasses(props.alignH, 'justify-content'),
  getResponsiveClasses(props.alignContent, 'align-content'),
])
</script>
