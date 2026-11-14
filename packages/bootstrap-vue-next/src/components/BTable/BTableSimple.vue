<template>
  <!-- tables definitions are shared. Can't use createReusableTemplate cause it becomes a non-root node -->
  <div v-if="isResponsive" :class="responsiveClasses" :style="responsiveStyles">
    <table v-bind="computedTableAttrs">
      <slot />
    </table>
  </div>
  <table v-else v-bind="computedTableAttrs">
    <slot />
  </table>
</template>

<script setup lang="ts">
import {computed, mergeProps, type StyleValue} from 'vue'
import {resolvePartColor, useThemeClasses} from '../../composables/useThemeClasses'
import {useDefaults} from '../../composables/useDefaults'
import {useNumberishToStyle} from '../../composables/useNumberishToStyle'
import {useId} from '../../composables/useId'
import type {BTableSimpleProps, BTableSimpleSlots} from '../../types'

const defaultStickyHeaderHeight = '300px'

const _props = withDefaults(defineProps<BTableSimpleProps>(), {
  bordered: false,
  borderless: false,
  captionTop: false,
  hover: false,
  id: undefined,
  noBorderCollapse: false,
  outlined: false,
  fixed: false,
  responsive: false,
  stacked: false,
  striped: false,
  stripedColumns: false,
  small: false,
  stickyHeader: false,
  tableAttrs: undefined,
  color: undefined,
})
const props = useDefaults(_props, 'BTableSimple')
const computedColor = computed(() => resolvePartColor(props.color, {}))
defineSlots<BTableSimpleSlots>()

const computedId = useId(() => props.id)

const {classes: colorClasses} = useThemeClasses(
  computed(() => ({
    border: computedColor.value.border,
    theme: computedColor.value.theme,
    bg: computedColor.value.bg,
    fg: computedColor.value.fg,
  }))
)
const computedClasses = computed(() => [
  'table',
  'b-table',
  colorClasses.value,
  {
    'border': props.outlined,
    'table-bordered': props.bordered,
    'table-borderless': props.borderless,
    'caption-top': props.captionTop,
    'table-hover': props.hover,
    'table-stacked': props.stacked === true,
    [`${props.stacked}:table-stacked`]: typeof props.stacked === 'string',
    'table-striped': props.striped,
    'table-sm': props.small,
    'table-striped-columns': props.stripedColumns,
    'b-table-fixed': props.fixed,
    'b-table-no-border-collapse': props.noBorderCollapse,
  },
])
const computedTableAttrs = computed(() =>
  mergeProps({id: computedId.value, class: computedClasses.value}, props.tableAttrs ?? {})
)

const {style: computedSticky} = useNumberishToStyle(
  computed(
    () =>
      (props.stickyHeader === true ? defaultStickyHeaderHeight : props.stickyHeader) || Number.NaN
  )
)
const stickyIsValid = computed(() => props.stickyHeader !== false)

const isStacked = computed(() => props.stacked !== false)
// Bootstrap's stacked tables use container queries: the `table-responsive` wrapper is the query container
const isResponsive = computed(
  () => props.responsive !== false || stickyIsValid.value || isStacked.value
)
const responsiveStyles = computed<StyleValue | undefined>(() =>
  stickyIsValid.value ? {maxHeight: computedSticky.value} : undefined
)
const responsiveClasses = computed(() => ({
  'table-responsive': props.responsive === true || (props.responsive === false && isStacked.value),
  [`${props.responsive}:table-responsive`]: typeof props.responsive === 'string',
  'b-table-sticky-header': stickyIsValid.value,
}))
</script>
