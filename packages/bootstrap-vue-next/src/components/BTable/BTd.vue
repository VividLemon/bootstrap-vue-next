<template>
  <td
    :class="computedClasses"
    :colspan="props.colspan"
    :rowspan="props.rowspan"
    :data-label="props.stackedHeading"
  >
    <div v-if="props.stackedHeading">
      <slot />
    </div>
    <slot v-else />
  </td>
</template>

<script setup lang="ts">
import {toColorClasses} from '../../composables/useThemeClasses'
import type {BTdProps, BTdSlots} from '../../types'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'

const _props = withDefaults(defineProps<BTdProps>(), {
  colspan: undefined,
  rowspan: undefined,
  stackedHeading: undefined,
  stickyColumn: false,
  theme: null,
  bg: null,
  fg: null,
})
const props = useDefaults(_props, 'BTd')
defineSlots<BTdSlots>()

const computedClasses = computed(() => [
  toColorClasses('theme', props.theme),
  toColorClasses('bg', props.bg),
  toColorClasses('fg', props.fg),
  {
    'b-table-sticky-column': props.stickyColumn,
    'table-b-table-default': props.stickyColumn && props.theme === null,
  },
])
</script>
