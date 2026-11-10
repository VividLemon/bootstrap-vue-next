<template>
  <div class="progress-bar" :class="computedClasses" :style="{width: computedWidth}">
    <slot>
      {{ computedLabel }}
    </slot>
  </div>
</template>

<script setup lang="ts">
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import {useDefaults} from '../../composables/useDefaults'
import {computed, inject} from 'vue'
import {progressInjectionKey} from '../../utils/keys'
import {useToNumber} from '@vueuse/core'
import type {BProgressBarProps, BProgressBarSlots} from '../../types'

const _props = withDefaults(defineProps<BProgressBarProps>(), {
  animated: false,
  label: undefined,
  max: undefined,
  precision: 0,
  showProgress: false,
  showValue: false,
  striped: false,
  value: 0,
  color: undefined,
})
const props = useDefaults(_props, 'BProgressBar')
const computedColor = computed(() => resolvePartColor(props.color, {}))
defineSlots<BProgressBarSlots>()

const parentData = inject(progressInjectionKey, null)

const {classes: colorClasses} = useThemeClasses(
  computed(() => ({
    theme: computedColor.value.theme,
    bg: computedColor.value.bg,
    fg: computedColor.value.fg,
  }))
)
const computedClasses = computed(() => [
  colorClasses.value,
  {
    'progress-bar-animated': props.animated || parentData?.animated.value,
    'progress-bar-striped':
      props.striped || parentData?.striped.value || props.animated || parentData?.animated.value,
  },
])

const numberPrecision = useToNumber(() => props.precision)
const numberValue = useToNumber(() => props.value)
const numberMax = useToNumber(() => props.max ?? Number.NaN)
const parentMaxNumber = useToNumber(() => parentData?.max.value ?? Number.NaN)

const computedLabel = computed(() =>
  props.showValue || parentData?.showValue.value
    ? numberValue.value.toFixed(numberPrecision.value)
    : props.showProgress || parentData?.showProgress.value
      ? ((numberValue.value * 100) / (numberMax.value || 100)).toFixed(numberPrecision.value)
      : props.label !== undefined
        ? props.label
        : ''
)

const computedWidth = computed(() =>
  parentMaxNumber.value
    ? `${(numberValue.value * 100) / parentMaxNumber.value}%`
    : numberMax.value
      ? `${(numberValue.value * 100) / numberMax.value}%`
      : typeof props.value === 'string'
        ? props.value
        : `${props.value}%`
)
</script>
