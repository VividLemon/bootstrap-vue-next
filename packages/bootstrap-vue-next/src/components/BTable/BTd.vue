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

const computedClasses = computed(() => ({
  [`theme-${props.theme}`]: props.theme !== null && props.theme !== undefined,
  [`bg-${props.bg}`]: props.bg !== null && props.bg !== undefined,
  [`fg-${props.fg}`]: props.fg !== null && props.fg !== undefined,
  'b-table-sticky-column': props.stickyColumn,
  'table-b-table-default': props.stickyColumn && props.theme === null,
}))
</script>
