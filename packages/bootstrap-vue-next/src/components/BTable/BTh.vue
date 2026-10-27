<template>
  <th
    :scope="localScope"
    :class="computedClasses"
    :colspan="props.colspan"
    :rowspan="props.rowspan"
    :data-label="props.stackedHeading"
  >
    <div v-if="props.stackedHeading !== undefined">
      <slot />
    </div>
    <slot v-else />
  </th>
</template>

<script setup lang="ts">
import {toColorClasses} from '../../composables/useThemeClasses'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'
import type {BThProps, BThSlots} from '../../types'

const _props = withDefaults(defineProps<BThProps>(), {
  colspan: undefined,
  rowspan: undefined,
  stackedHeading: undefined,
  stickyColumn: false,
  theme: null,
  bg: null,
  fg: null,
  scope: undefined,
})
const props = useDefaults(_props, 'BTh')
defineSlots<BThSlots>()

const computedClasses = computed(() => [
  toColorClasses('theme', props.theme),
  toColorClasses('bg', props.bg),
  toColorClasses('fg', props.fg),
  {
    'b-table-sticky-column': props.stickyColumn,
    'table-b-table-default': props.stickyColumn && props.theme === null,
  },
])

const localScope = computed(() =>
  props.scope ? props.scope : props.colspan ? 'colgroup' : props.rowspan ? 'rowgroup' : 'col'
)
</script>
