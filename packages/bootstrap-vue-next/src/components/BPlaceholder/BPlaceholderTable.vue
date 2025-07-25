<template>
  <BTableSimple>
    <slot v-if="!props.noHeader" name="thead">
      <thead>
        <tr>
          <th v-for="(_, i) in computedHeaderColumnsLength" :key="i">
            <BPlaceholder
              :size="props.headerSize"
              :variant="props.headerVariant"
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
              :variant="props.variant"
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
              :variant="props.footerVariant"
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
import type {BPlaceholderTableProps} from '../../types/ComponentProps'
import BTableSimple from '../BTable/BTableSimple.vue'
import BPlaceholder from './BPlaceholder.vue'
import {useToNumber} from '@vueuse/core'
import {useDefaults} from '../../composables/useDefaults'
import {computed} from 'vue'
import type {BPlaceholderTableSlots} from '../../types'

const _props = withDefaults(defineProps<BPlaceholderTableProps>(), {
  animation: undefined,
  cellWidth: 100,
  columns: 5,
  footerAnimation: undefined,
  footerCellWidth: 100,
  footerColumns: undefined,
  footerSize: 'md',
  footerVariant: undefined,
  headerAnimation: undefined,
  headerCellWidth: 100,
  headerColumns: undefined,
  headerSize: 'md',
  headerVariant: undefined,
  noHeader: false,
  rows: 3,
  showFooter: false,
  size: 'md',
  variant: undefined,
})
const props = useDefaults(_props, 'BPlaceholderTable')
defineSlots<BPlaceholderTableSlots>()

const columnsToNumber = useToNumber(() => props.columns)
const rowsToNumber = useToNumber(() => props.rows)
const computedHeaderColumns = computed(() => props.headerColumns ?? NaN)
const computedFooterColumns = computed(() => props.footerColumns ?? NaN)
const headerColumnsNumber = useToNumber(computedHeaderColumns)
const footerColumnsNumber = useToNumber(computedFooterColumns)

const columnsNumber = computed(() => columnsToNumber.value || 5)
const rowsNumber = computed(() => rowsToNumber.value || 3)

const computedHeaderColumnsLength = computed(() =>
  props.headerColumns === undefined ? columnsNumber.value : headerColumnsNumber.value
)
const computedFooterColumnsLength = computed(() =>
  props.footerColumns === undefined ? columnsNumber.value : footerColumnsNumber.value
)
</script>
