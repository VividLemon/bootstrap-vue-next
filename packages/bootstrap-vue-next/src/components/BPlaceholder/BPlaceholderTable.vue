<template>
  <BTableSimple>
    <slot v-if="!props.noHeader" name="thead">
      <thead>
        <tr>
          <th v-for="(_, i) in computedHeaderColumnsLength" :key="i">
            <BPlaceholder
              :size="props.headerSize"
              :color="{
                bg: props.headerColor?.bg ?? getThemeColor(props.headerColor?.theme),
                fg: props.headerColor?.fg,
              }"
              :animation="props.headerAnimation"
              :width="props.headerCellWidth"
            />
          </th>
        </tr>
      </thead>
    </slot>
    <slot>
      <tbody>
        <tr v-for="(_, j) in rowsNumber" :key="j">
          <td v-for="(__, k) in columnsNumber" :key="k">
            <BPlaceholder
              :size="props.size"
              :color="{
                bg: computedColor.bg ?? getThemeColor(computedColor.theme),
                fg: computedColor.fg,
              }"
              :animation="props.animation"
              :width="props.cellWidth"
            />
          </td>
        </tr>
      </tbody>
    </slot>
    <slot v-if="props.showFooter" name="tfoot">
      <tfoot>
        <tr>
          <th v-for="(_, l) in computedFooterColumnsLength" :key="l">
            <BPlaceholder
              :size="props.footerSize"
              :color="{
                bg: props.footerColor?.bg ?? getThemeColor(props.footerColor?.theme),
                fg: props.footerColor?.fg,
              }"
              :animation="props.footerAnimation"
              :width="props.footerCellWidth"
            />
          </th>
        </tr>
      </tfoot>
    </slot>
  </BTableSimple>
</template>

<script setup lang="ts">
import {getThemeColor, resolvePartColor} from '../../composables/useThemeClasses'
import BTableSimple from '../BTable/BTableSimple.vue'
import BPlaceholder from './BPlaceholder.vue'
import {useToNumber} from '@vueuse/core'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'
import type {BPlaceholderTableProps, BPlaceholderTableSlots} from '../../types'

const _props = withDefaults(defineProps<BPlaceholderTableProps>(), {
  animation: undefined,
  cellWidth: 100,
  columns: 5,
  footerAnimation: undefined,
  footerCellWidth: 100,
  footerColor: undefined,
  footerColumns: undefined,
  footerSize: undefined,
  headerAnimation: undefined,
  headerCellWidth: 100,
  headerColor: undefined,
  headerColumns: undefined,
  headerSize: undefined,
  noHeader: false,
  rows: 3,
  showFooter: false,
  size: undefined,
  color: undefined,
})
const props = useDefaults(_props, 'BPlaceholderTable')
const computedColor = computed(() => resolvePartColor(props.color, {}))
defineSlots<BPlaceholderTableSlots>()

const columnsToNumber = useToNumber(() => props.columns)
const rowsToNumber = useToNumber(() => props.rows)
const computedHeaderColumns = computed(() => props.headerColumns ?? Number.NaN)
const computedFooterColumns = computed(() => props.footerColumns ?? Number.NaN)
const headerColumnsNumber = useToNumber(computedHeaderColumns)
const footerColumnsNumber = useToNumber(computedFooterColumns)

const columnsNumber = computed(() => columnsToNumber.value || 5)
const rowsNumber = computed(() => rowsToNumber.value || 3)

const computedHeaderColumnsLength = computed(() =>
  props.headerColumns === undefined
    ? columnsNumber.value
    : Number.isNaN(headerColumnsNumber.value)
      ? columnsNumber.value
      : headerColumnsNumber.value
)
const computedFooterColumnsLength = computed(() =>
  props.footerColumns === undefined
    ? columnsNumber.value
    : Number.isNaN(footerColumnsNumber.value)
      ? columnsNumber.value
      : footerColumnsNumber.value
)
</script>
