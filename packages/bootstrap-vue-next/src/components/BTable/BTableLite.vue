<template>
  <BTableSimple
    :id="props.id"
    :bordered="props.bordered"
    :borderless="props.borderless"
    :border-variant="props.borderVariant"
    :caption-top="props.captionTop"
    :dark="props.dark"
    :fixed="props.fixed"
    :hover="props.hover"
    :no-border-collapse="props.noBorderCollapse"
    :outlined="props.outlined"
    :responsive="props.responsive"
    :small="props.small"
    :stacked="props.stacked"
    :sticky-header="props.stickyHeader"
    :striped="props.striped"
    :table-class="computedTableClasses"
    :variant="props.variant"
    :striped-columns="props.stripedColumns"
  >
    <BThead v-show="showComputedHeaders" :variant="props.headVariant" :class="props.theadClass">
      <slot v-if="$slots['thead-top']" name="thead-top" />
      <BTr :variant="props.headRowVariant" :class="props.theadTrClass">
        <BTh
          v-for="field in computedFields"
          :key="field.key"
          scope="col"
          :class="getFieldColumnClasses(field)"
          :title="field.headerTitle"
          :variant="field.variant"
          :abbr="field.headerAbbr"
          :style="field.thStyle"
          v-bind="callThAttr(null, field, 'top')"
          @click="headerClicked(field, $event)"
        >
          <slot
            :name="$slots[`head(${String(field.key)})`] ? `head(${String(field.key)})` : 'head()'"
            :label="field.label"
            :column="field.key"
            :field="field"
            :is-foot="false"
          >
            {{ getTableFieldHeadLabel(field) }}
          </slot>
        </BTh>
      </BTr>
      <BTr v-if="$slots['thead-sub']">
        <BTd
          v-for="field in computedFields"
          :key="field.key"
          scope="col"
          :variant="field.variant"
          :class="[field.class, field.thClass]"
        >
          <slot name="thead-sub" :items="computedFields" v-bind="field">
            {{ field.label }}
          </slot>
        </BTd>
      </BTr>
    </BThead>
    <BTbody :class="props.tbodyClass">
      <slot
        name="custom-body"
        :fields="computedFields"
        :items="props.items"
        :columns="computedFields.length"
      >
        <BTr
          v-if="!props.stacked && $slots['top-row']"
          :class="getRowClasses(null, 'row-top')"
          v-bind="callTbodyTrAttrs(null, 'row-top')"
        >
          <slot name="top-row" />
        </BTr>

        <template
          v-for="(item, itemIndex) in props.items"
          :key="props.primaryKey ? get(item, props.primaryKey) : itemIndex"
        >
          <BTr
            :class="getRowClasses(item, 'row')"
            :variant="isTableItem(item) ? item._rowVariant : undefined"
            v-bind="callTbodyTrAttrs(item, 'row')"
            @click="!filterEvent($event) && emit('row-clicked', item, itemIndex, $event)"
            @dblclick="!filterEvent($event) && emit('row-dblclicked', item, itemIndex, $event)"
            @contextmenu="!filterEvent($event) && emit('row-contextmenu', item, itemIndex, $event)"
            @mouseenter="!filterEvent($event) && emit('row-hovered', item, itemIndex, $event)"
            @mouseleave="!filterEvent($event) && emit('row-unhovered', item, itemIndex, $event)"
            @mousedown="handleMiddleClick(item, itemIndex, $event)"
          >
            <BTd
              v-for="field in computedFields"
              :key="field.key"
              :variant="
                (isTableItem(item) ? item._cellVariants?.[field.key as string] : false)
                  ? null
                  : field.variant
              "
              :class="getFieldRowClasses(field, item)"
              v-bind="itemAttributes(item, String(field.key), field.tdAttr)"
            >
              <label v-if="props.stacked && props.labelStacked" class="b-table-stacked-label">
                {{ getTableFieldHeadLabel(field) }}
              </label>
              <slot
                :name="
                  $slots[`cell(${String(field.key)})`] ? `cell(${String(field.key)})` : 'cell()'
                "
                :value="formatItem(item, String(field.key), field.formatter)"
                :unformatted="get(item, String(field.key))"
                :index="itemIndex"
                :item="item"
                :field="field"
                :items="items"
                :toggle-details="
                  () => {
                    toggleRowDetails(item)
                  }
                "
                :details-showing="isTableItem(item) ? (detailsMap.get(item) ?? false) : false"
              >
                <template v-if="!$slots[`cell(${String(field.key)})`] && !$slots['cell()']">
                  {{ formatItem(item, String(field.key), field.formatter) }}
                </template>
              </slot>
            </BTd>
          </BTr>

          <template
            v-if="isTableItem(item) && detailsMap.get(item) === true && $slots['row-details']"
          >
            <BTr aria-hidden="true" role="presentation" class="d-none" />
            <BTr
              :class="getRowClasses(item, 'row-details')"
              :variant="item._rowVariant"
              v-bind="callTbodyTrAttrs(item, 'row-details')"
            >
              <BTd :colspan="computedFieldsTotal" :class="detailsTdClass">
                <slot
                  name="row-details"
                  :item="item"
                  :toggle-details="
                    () => {
                      toggleRowDetails(item)
                    }
                  "
                  :fields="props.fields"
                  :index="itemIndex"
                />
              </BTd>
            </BTr>
          </template>
        </template>
        <!-- This class is for specific targetting of this slot element -->
        <BTr
          v-if="!props.stacked && $slots['bottom-row']"
          class="bottom-row"
          :class="getRowClasses(null, 'row-bottom')"
          v-bind="callTbodyTrAttrs(null, 'row-bottom')"
        >
          <slot name="bottom-row" />
        </BTr>
      </slot>
    </BTbody>
    <BTfoot v-if="props.footClone" :variant="props.footVariant" :class="props.tfootClass">
      <BTr :variant="props.footRowVariant" :class="props.tfootTrClass">
        <BTh
          v-for="field in computedFields"
          :key="field.key"
          scope="col"
          :class="getFieldColumnClasses(field)"
          :title="field.headerTitle"
          :abbr="field.headerAbbr"
          :style="field.thStyle"
          :variant="field.variant"
          v-bind="callThAttr(null, field, 'bottom')"
          @click="headerClicked(field, $event, true)"
        >
          <div class="d-inline-flex flex-nowrap align-items-center gap-1">
            <div>
              <slot
                :name="
                  $slots[`foot(${String(field.key)})`] ? `foot(${String(field.key)})` : 'foot()'
                "
                :label="field.label"
                :column="field.key"
                :field="field"
                :is-foot="true"
              >
                {{ getTableFieldHeadLabel(field) }}
              </slot>
            </div>
          </div>
        </BTh>
      </BTr>
    </BTfoot>
    <BTfoot v-else-if="$slots['custom-foot']">
      <slot
        name="custom-foot"
        :fields="computedFields"
        :items="props.items"
        :columns="computedFields.length"
      />
    </BTfoot>
    <caption v-if="$slots['table-caption'] || props.caption">
      <slot name="table-caption">
        {{ props.caption }}
      </slot>
    </caption>
  </BTableSimple>
</template>

<script setup lang="ts" generic="T">
import {computed, ref, watch} from 'vue'
import type {BTableLiteProps} from '../../types/ComponentProps'
import {
  isTableField,
  isTableItem,
  type TableField,
  type TableItem,
  type TableRowEvent,
  type TableRowThead,
  type TableRowType,
} from '../../types/TableTypes'
import BTableSimple from './BTableSimple.vue'
import BTbody from './BTbody.vue'
import BTd from './BTd.vue'
import BTfoot from './BTfoot.vue'
import BTh from './BTh.vue'
import BThead from './BThead.vue'
import BTr from './BTr.vue'
import {useDefaults} from '../../composables/useDefaults'
import {get} from '../../utils/object'
import {getTableFieldHeadLabel} from '../../utils/getTableFieldHeadLabel'
import {formatItem} from '../../utils/formatItem'
import {filterEvent} from '../../utils/filterEvent'
import {startCase} from '../../utils/stringUtils'

const _props = withDefaults(defineProps<BTableLiteProps<T>>(), {
  caption: undefined,
  align: undefined,
  fields: () => [],
  footClone: false,
  items: () => [],
  labelStacked: false,
  fieldColumnClass: undefined,
  tbodyTrClass: undefined,
  captionHtml: undefined,
  detailsTdClass: undefined,
  headVariant: undefined,
  headRowVariant: undefined,
  footRowVariant: undefined,
  footVariant: undefined,
  modelValue: undefined,
  primaryKey: undefined,
  tbodyClass: undefined,
  tbodyTrAttrs: undefined,
  tfootClass: undefined,
  tfootTrClass: undefined,
  theadClass: undefined,
  theadTrClass: undefined,
  // BTableSimpleProps props
  borderVariant: undefined,
  tableClass: undefined,
  variant: undefined,
  bordered: undefined,
  borderless: undefined,
  captionTop: undefined,
  dark: undefined,
  hover: undefined,
  id: undefined,
  noBorderCollapse: undefined,
  outlined: undefined,
  fixed: undefined,
  responsive: undefined,
  stacked: undefined,
  striped: undefined,
  stripedColumns: undefined,
  small: undefined,
  stickyHeader: undefined,
  // End BTableSimpleProps props
})
const props = useDefaults(_props, 'BTableLite')

const emit = defineEmits<{
  'head-clicked': [key: string, field: TableField<T>, event: MouseEvent, isFooter: boolean]
  'row-clicked': TableRowEvent<T>
  'row-dblclicked': TableRowEvent<T>
  'row-contextmenu': TableRowEvent<T>
  'row-hovered': TableRowEvent<T>
  'row-unhovered': TableRowEvent<T>
  'row-middle-clicked': TableRowEvent<T>
}>()

const generateDetailsItem = (item: TableItem): [object, boolean | undefined] => [
  item,
  item._showDetails,
]
const detailsMap = ref(new WeakMap<object, boolean | undefined>())
watch(
  () => props.items,
  (items) => {
    items.forEach((item) => {
      if (!isTableItem(item)) return
      detailsMap.value.set(...generateDetailsItem(item))
    })
  },
  {deep: true, immediate: true}
)

const computedTableClasses = computed(() => [
  props.tableClass,
  {
    [`align-${props.align}`]: props.align !== undefined,
  },
])

const computedFields = computed<(TableField & {_noHeader?: true})[]>(() => {
  if (!props.fields.length && props.items.length) {
    const [firstItem] = props.items
    if (isTableItem(firstItem) || Array.isArray(firstItem)) {
      return Object.keys(firstItem).map((k) => {
        const label = startCase(k)
        return {
          key: k,
          label,
          tdAttr: props.stacked === true ? {'data-label': label} : undefined,
        }
      })
    }
    // The items are primitives, so we just return a single empty field
    // No header will be shown, as we don't know what to show
    return [{key: '', _noHeader: true}]
  }

  return props.fields.map((f) => {
    if (isTableField(f)) {
      return {
        ...(f as TableField),
        tdAttr:
          props.stacked === true
            ? {'data-label': startCase(f.key as string), ...f.tdAttr}
            : f.tdAttr,
      }
    }
    const label = startCase(f as string)
    return {
      key: f as string,
      label,
      tdAttr: props.stacked === true ? {'data-label': label} : undefined,
    }
  })
})
const computedFieldsTotal = computed(() => computedFields.value.length)
const showComputedHeaders = computed(() => {
  // We only hide the header if all fields have _noHeader set to true. Which would be our doing
  // This usually happens under a circumstance of displaying an array of primitives
  // Under any other circumstance, I'm not sure how this would apply
  if (computedFields.value.length > 0 && computedFields.value.every((el) => el._noHeader === true))
    return false
  return true
})

const itemAttributes = (item: T, fieldKey: string, attr?: unknown) => {
  const val = get(item, fieldKey)
  return attr && typeof attr === 'function' ? attr(val, fieldKey, item) : attr
}

const callThAttr = (item: T | null, field: TableField<T>, type: TableRowThead) => {
  const fieldKey = String(field.key)
  const val = get(item, fieldKey)
  return field.thAttr && typeof field.thAttr === 'function'
    ? field.thAttr(val, fieldKey, item, type)
    : field.thAttr
}

const headerClicked = (field: TableField<T>, event: Readonly<MouseEvent>, isFooter = false) => {
  emit('head-clicked', field.key as string, field, event, isFooter)
}

const toggleRowDetails = (tr: T) => {
  if (isTableItem(tr)) {
    const prevValue = detailsMap.value.get(tr)
    detailsMap.value.set(tr, !prevValue)
    tr._showDetails = !prevValue
  }
}

const getFieldColumnClasses = (field: TableField) => [
  field.class,
  field.thClass,
  {
    'b-table-sticky-column': field.stickyColumn,
  },
  props.fieldColumnClass
    ? typeof props.fieldColumnClass === 'function'
      ? props.fieldColumnClass(field)
      : props.fieldColumnClass
    : null,
]

const getFieldRowClasses = (field: Readonly<TableField>, tr: T) => {
  const val = get(tr, String(field.key))
  return [
    field.class,
    typeof field.tdClass === 'function' ? field.tdClass(val, String(field.key), tr) : field.tdClass,
    (isTableItem(tr) ? tr._cellVariants?.[field.key as string] : false)
      ? `table-${(tr as TableItem)._cellVariants?.[field.key as string]}`
      : null,
    {
      'b-table-sticky-column': field.stickyColumn,
    },
  ]
}

const handleMiddleClick = (item: T, itemIndex: number, event: MouseEvent) => {
  if (event.button === 1 && !filterEvent(event)) {
    emit('row-middle-clicked', item, itemIndex, event)
  }
}
const callTbodyTrAttrs = (item: T | null, type: TableRowType) =>
  props.tbodyTrAttrs
    ? typeof props.tbodyTrAttrs === 'function'
      ? props.tbodyTrAttrs(item, type)
      : props.tbodyTrAttrs
    : null

const getRowClasses = (item: T | null, type: TableRowType) =>
  props.tbodyTrClass
    ? typeof props.tbodyTrClass === 'function'
      ? props.tbodyTrClass(item, type)
      : props.tbodyTrClass
    : null
</script>
