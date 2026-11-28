<template>
  <component :is="props.tag" :class="computedClasses">
    <slot />
  </component>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import type {BGridItemProps, BGridItemSlots} from '../../types'
import {getResponsiveClasses} from '../../utils/responsive'
import {useDefaults} from '../../composables/useDefaults'

const _props = withDefaults(defineProps<BGridItemProps>(), {
  cols: undefined,
  fill: undefined,
  start: undefined,
  tag: 'div',
})
const props = useDefaults(_props, 'BGridItem')
defineSlots<BGridItemSlots>()

// `g-col-*` / `g-start-*` prefixes are container queries against the parent `.grid`;
// `grid-cols-fill` prefixes are viewport media queries (Bootstrap v6 utilities)
const computedClasses = computed(() => [
  getResponsiveClasses(props.cols, 'g-col'),
  getResponsiveClasses(props.start, 'g-start'),
  getResponsiveClasses(props.fill, 'grid-cols-fill'),
])
</script>
