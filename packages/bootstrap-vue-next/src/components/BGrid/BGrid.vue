<template>
  <component :is="props.tag" class="grid" :class="computedClasses" :style="computedStyle">
    <slot />
  </component>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import type {BGridProps, BGridSlots} from '../../types'
import {getResponsiveClasses} from '../../utils/responsive'
import {useDefaults} from '../../composables/useDefaults'

const _props = withDefaults(defineProps<BGridProps>(), {
  columns: undefined,
  flow: undefined,
  gap: undefined,
  rows: undefined,
  tag: 'div',
})
const props = useDefaults(_props, 'BGrid')
defineSlots<BGridSlots>()

// `grid-auto-flow-*` prefixes are viewport media queries (Bootstrap v6 utilities)
const computedClasses = computed(() => getResponsiveClasses(props.flow, 'grid-auto-flow'))

const isSet = (value: unknown): boolean => value !== undefined && value !== null && value !== ''

const computedStyle = computed(() => {
  const style: Record<string, string> = {}
  if (isSet(props.columns)) style['--bs-columns'] = String(props.columns)
  if (isSet(props.rows)) style['--bs-rows'] = String(props.rows)
  if (isSet(props.gap)) style['--bs-gap'] = String(props.gap)
  return Object.keys(style).length > 0 ? style : undefined
})
</script>
