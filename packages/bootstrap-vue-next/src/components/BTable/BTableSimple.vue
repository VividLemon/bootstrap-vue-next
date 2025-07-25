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
import {computed, type StyleValue} from 'vue'
import type {BTableSimpleProps} from '../../types/ComponentProps'
import {useDefaults} from '../../composables/useDefaults'
import {useNumberishToStyle} from '../../composables/useNumberishToStyle'
import {useColorVariantClasses} from '../../composables/useColorVariantClasses'
import {useId} from '../../composables/useId'
import type {BTableSimpleSlots} from '../../types'

const defaultStickyHeaderHeight = '300px'

const _props = withDefaults(defineProps<BTableSimpleProps>(), {
  borderVariant: null,
  tableClass: undefined,
  variant: null,
  bordered: false,
  borderless: false,
  captionTop: false,
  dark: false,
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
})
const props = useDefaults(_props, 'BTableSimple')
defineSlots<BTableSimpleSlots>()

const computedId = useId(() => props.id)

const colorClasses = useColorVariantClasses(
  computed(() => ({
    borderVariant: props.borderVariant,
  }))
)
const computedClasses = computed(() => [
  props.tableClass,
  'table',
  'b-table',
  colorClasses.value,
  {
    'border': props.outlined,
    'table-bordered': props.bordered,
    'table-borderless': props.borderless,
    'caption-top': props.captionTop,
    'table-dark': props.dark,
    'table-hover': props.hover,
    'b-table-stacked': props.stacked === true,
    [`b-table-stacked-${props.stacked}`]: typeof props.stacked === 'string',
    'table-striped': props.striped,
    'table-sm': props.small,
    [`table-${props.variant}`]: props.variant !== null,
    'table-striped-columns': props.stripedColumns,
    'b-table-fixed': props.fixed,
    'b-table-no-border-collapse': props.noBorderCollapse,
  },
])
const computedTableAttrs = computed(() => ({
  id: computedId.value,
  class: computedClasses.value,
  ...props.tableAttrs,
}))

const computedSticky = useNumberishToStyle(
  computed(
    () => (props.stickyHeader === true ? defaultStickyHeaderHeight : props.stickyHeader) || NaN
  )
)
const stickyIsValid = computed(() => props.stickyHeader !== false)

const isResponsive = computed(() => props.responsive !== false || stickyIsValid.value)
const responsiveStyles = computed<StyleValue | undefined>(() =>
  stickyIsValid.value ? {maxHeight: computedSticky.value} : undefined
)
const responsiveClasses = computed(() => ({
  'table-responsive': props.responsive === true,
  [`table-responsive-${props.responsive}`]: typeof props.responsive === 'string',
  'b-table-sticky-header': stickyIsValid.value,
}))
</script>
