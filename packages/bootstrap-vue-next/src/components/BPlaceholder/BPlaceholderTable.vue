<template>
  <BTableSimple>
    <slot v-if="!props.noHeader" name="thead">
      <thead>
        <tr>
          <th v-for="(_, i) in computedHeaderColumnsLength" :key="i">
            <BPlaceholder
              :size="props.headerSize"
              :bg="props.headerBg ?? themeToBg(props.headerTheme)"
              :fg="props.headerFg"
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
              :bg="props.bg ?? themeToBg(props.theme)"
              :fg="props.fg"
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
              :bg="props.footerBg ?? themeToBg(props.footerTheme)"
              :fg="props.footerFg"
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
import {themeToBg} from '../../composables/useThemeClasses'
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
  footerColumns: undefined,
  footerSize: undefined,
  footerTheme: undefined,
  footerBg: null,
  footerFg: null,
  headerAnimation: undefined,
  headerCellWidth: 100,
  headerColumns: undefined,
  headerSize: undefined,
  headerTheme: undefined,
  headerBg: null,
  headerFg: null,
  noHeader: false,
  rows: 3,
  showFooter: false,
  size: undefined,
  theme: undefined,
  bg: null,
  fg: null,
})
const props = useDefaults(_props, 'BPlaceholderTable')
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
