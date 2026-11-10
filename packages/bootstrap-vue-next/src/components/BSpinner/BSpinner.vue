<template>
  <component
    :is="props.tag"
    :class="computedClasses"
    :role="props.label || hasLabelSlot ? props.role : null"
    :aria-hidden="props.label || hasLabelSlot ? null : true"
  >
    <span v-if="props.label || hasLabelSlot" class="visually-hidden">
      <slot name="label">{{ props.label }}</slot>
    </span>
  </component>
</template>

<script setup lang="ts">
import {getThemeColor, resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import {computed} from 'vue'
import {isEmptySlot} from '../../utils/dom'
import {useDefaults} from '../../composables/useDefaults'
import type {BSpinnerProps, BSpinnerSlots} from '../../types'

const _props = withDefaults(defineProps<BSpinnerProps>(), {
  label: undefined,
  role: 'status',
  small: false,
  tag: 'span',
  type: 'border',
  color: undefined,
})
const props = useDefaults(_props, 'BSpinner')
const computedColor = computed(() => resolvePartColor(props.color, {}))
const slots = defineSlots<BSpinnerSlots>()

const {classes: colorClasses} = useThemeClasses(
  computed(() => ({
    theme: computedColor.value.theme,
    bg: computedColor.value.bg,
    fg: computedColor.value.fg ?? getThemeColor(computedColor.value.theme),
  }))
)
const computedClasses = computed(() => [
  `spinner-${props.type}`,
  colorClasses.value,
  {
    [`spinner-${props.type}-sm`]: props.small,
  },
])

const hasLabelSlot = computed(() => !isEmptySlot(slots.label))
</script>
