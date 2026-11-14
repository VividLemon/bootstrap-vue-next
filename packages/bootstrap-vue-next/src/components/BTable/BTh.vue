<template>
  <th
    :scope="localScope"
    :class="computedClasses"
    :colspan="props.colspan"
    :rowspan="props.rowspan"
  >
    <slot />
  </th>
</template>

<script setup lang="ts">
import {resolvePartColor, toColorClasses} from '../../composables/useThemeClasses'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'
import type {BThProps, BThSlots} from '../../types'

const _props = withDefaults(defineProps<BThProps>(), {
  colspan: undefined,
  rowspan: undefined,
  stickyColumn: false,
  scope: undefined,
  color: undefined,
})
const props = useDefaults(_props, 'BTh')
const computedColor = computed(() => resolvePartColor(props.color, {}))
defineSlots<BThSlots>()

const computedClasses = computed(() => [
  toColorClasses('theme', computedColor.value.theme),
  toColorClasses('bg', computedColor.value.bg),
  toColorClasses('fg', computedColor.value.fg),
  {
    'b-table-sticky-column': props.stickyColumn,
  },
])

const localScope = computed(() =>
  props.scope ? props.scope : props.colspan ? 'colgroup' : props.rowspan ? 'rowgroup' : 'col'
)
</script>
