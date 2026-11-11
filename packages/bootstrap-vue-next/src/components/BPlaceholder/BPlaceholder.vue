<template>
  <component :is="props.wrapperTag" :class="wrapperClasses">
    <component
      v-bind="$attrs"
      :is="tag"
      class="placeholder"
      :class="computedClasses"
      :style="computedStyle"
    />
  </component>
</template>

<script setup lang="ts">
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import {computed, type CSSProperties} from 'vue'
import type {BPlaceholderProps} from '../../types'
import {useDefaults} from '../../composables/useDefaults'

defineOptions({
  inheritAttrs: false,
})

const _props = withDefaults(defineProps<BPlaceholderProps>(), {
  animation: undefined,
  cols: 12,
  size: undefined,
  tag: 'span',
  width: undefined,
  wrapperTag: 'span',
  color: undefined,
})
const props = useDefaults(_props, 'BPlaceholder')
const computedColor = computed(() => resolvePartColor(props.color, {}))

const widthString = computed(() =>
  props.width === undefined
    ? undefined
    : typeof props.width === 'number'
      ? props.width.toString()
      : props.width.replace('%', '')
)

const colsString = computed(() =>
  props.cols === undefined
    ? undefined
    : typeof props.cols === 'number'
      ? props.cols.toString()
      : props.cols
)

const {classes: colorClasses} = useThemeClasses(
  computed(() => ({bg: computedColor.value.bg, fg: computedColor.value.fg}))
)
const computedClasses = computed(() => [
  colorClasses.value,
  {
    [`col-${colsString.value}`]: colsString.value !== undefined && widthString.value === undefined,
    [`placeholder-${props.size}`]: props.size !== undefined,
  },
])

const wrapperClasses = computed(() => ({
  [`placeholder-${props.animation}`]: props.animation !== undefined,
}))

const computedStyle = computed<CSSProperties>(() => ({
  width: widthString.value === undefined ? undefined : `${widthString.value}%`,
}))
</script>
