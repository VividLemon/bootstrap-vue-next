<template>
  <td :class="computedClasses" :colspan="props.colspan" :rowspan="props.rowspan">
    <slot />
  </td>
</template>

<script setup lang="ts">
import {resolvePartColor, toColorClasses} from '../../composables/useThemeClasses'
import type {BTdProps, BTdSlots} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'

const _props = withDefaults(defineProps<BTdProps>(), {
  colspan: undefined,
  rowspan: undefined,
  stickyColumn: false,
  color: undefined,
})
const props = useDefaults(_props, 'BTd')
const computedColor = computed(() => resolvePartColor(props.color, {}))
defineSlots<BTdSlots>()

const computedClasses = computed(() => [
  toColorClasses('theme', computedColor.value.theme),
  toColorClasses('bg', computedColor.value.bg),
  toColorClasses('fg', computedColor.value.fg),
  {
    'b-table-sticky-column': props.stickyColumn,
  },
])
</script>
