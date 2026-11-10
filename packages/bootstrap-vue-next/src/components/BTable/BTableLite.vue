<template>
  <BTableSimple v-bind="computedSimpleProps">
    <colgroup v-if="slots['table-colgroup']">
      <slot name="table-colgroup" :fields="computedFields" />
    </colgroup>
    <BThead v-show="showComputedHeaders" :color="props.thead?.color" v-bind="props.thead?.attrs">
      <slot name="thead-top" :columns="computedFieldsTotal" :fields="computedFields" />
      <BTr :color="props.thead?.rowColor" v-bind="props.thead?.trAttrs">
        <BTh
          v-for="field in computedFields"
          :key="field.key"
          :scope="field.scope"
          :class="getFieldColumnClasses(field)"
          :title="field.header?.title"
          :color="field.color"
          :abbr="field.header?.abbr"
          :style="field.th?.style"
          :tabindex="keyboardController.shouldHeaderBeFocusable(field) ? '0' : undefined"
          v-bind="mergeProps(callFieldColumnAttrs(field), callThAttr(null, field, 'top') ?? {})"
          @click="keyboardController.headerClicked(field, $event)"
          @keydown="keyboardController.handleHeaderKeydown(field, $event)"
        >
          <!-- eslint-disable prettier/prettier -->
          <slot
            :name="slots[`head(${field.key})`] ? (`head(${field.key})` as 'head()') : 'head()'"
            :label="field.label"
            :column="field.key"
            :field
            :is-foot="false"
          >
            <!-- eslint-enable prettier/prettier -->
            {{ getTableFieldHeadLabel(field) }}
          </slot>
        </BTh>
      </BTr>
      <BTr v-if="slots['thead-sub']">
        <BTd
          v-for="field in computedFields"
          :key="field.key"
          scope="col"
          :color="field.color"
          :class="[field.class, field.th?.class]"
        >
          <slot name="thead-sub" :items="props.items" :fields="computedFields" :field>
            {{ field.label }}
          </slot>
        </BTd>
      </BTr>
    </BThead>
    <BTbody v-bind="props.tbody?.attrs">
      <slot
        name="custom-body"
        :fields="computedFields"
        :items="props.items"
        :columns="computedFieldsTotal"
      >
        <BTr v-if="!props.stacked && slots['top-row']" v-bind="callTbodyTrAttrs(null, 'row-top')">
          <slot name="top-row" :columns="computedFieldsTotal" :fields="computedFields" />
        </BTr>

        <template
          v-for="(item, itemIndex) in props.items"
          :key="
            props.primaryKey && isTableItem(item) && getWithGetter(item, props.primaryKey)
              ? getWithGetter(item, props.primaryKey)
              : itemIndex
          "
        >
          <BTr
            :id="
              props.primaryKey && isTableItem(item) && getWithGetter(item, props.primaryKey)
                ? generateTableRowId(getWithGetter(item, props.primaryKey) as string)
                : undefined
            "
            :color="isTableItem(item) ? item._rowColor : undefined"
            :tabindex="keyboardController.shouldRowBeFocusable.value ? '0' : undefined"
            v-bind="callTbodyTrAttrs(item, 'row')"
            @click="
              !filterEvent($event) && emit('row-clicked', {item, index: itemIndex, event: $event})
            "
            @dblclick="
              !filterEvent($event) &&
              emit('row-dblclicked', {item, index: itemIndex, event: $event})
            "
            @contextmenu="
              !filterEvent($event) &&
              emit('row-contextmenu', {item, index: itemIndex, event: $event})
            "
            @mouseenter="
              !filterEvent($event) && emit('row-hovered', {item, index: itemIndex, event: $event})
            "
            @mouseleave="
              !filterEvent($event) && emit('row-unhovered', {item, index: itemIndex, event: $event})
            "
            @mousedown="keyboardController.handleMiddleClick(item, itemIndex, $event)"
            @keydown="keyboardController.handleRowKeydown(item, itemIndex, $event)"
          >
            <component
              :is="getCellComponent(field)"
              v-for="field in computedFields"
              :key="field.key"
              :color="getCellColor(item, field)"
              :class="getFieldRowClasses(field, item)"
              v-bind="{
                ...(field.isRowHeader ? {scope: 'row'} : undefined),
                ...itemAttributes(item, field),
              }"
            >
              <slot
                :name="slots[`cell(${field.key})`] ? (`cell(${field.key})` as 'cell()') : 'cell()'"
                :value="formatItem(item, field)"
                :unformatted="getByFieldKey(item, field)"
                :index="itemIndex"
                :item="item"
                :field="field"
                :items="props.items"
                :toggle-expansion="() => expandedItemsController.toggle(item)"
                :expansion-showing="expandedItemsController.has(item)"
              >
                <template v-if="!slots[`cell(${field.key})`] && !slots['cell()']">
                  {{ formatItem(item, field) }}
                </template>
              </slot>
            </component>
          </BTr>

          <template v-if="expandedItemsController.has(item) && slots['row-expansion']">
            <BTr aria-hidden="true" role="presentation" class="d-none" />
            <BTr
              :color="isTableItem(item) ? item._rowColor : undefined"
              v-bind="callTbodyTrAttrs(item, 'row-expansion')"
            >
              <BTd :colspan="computedFieldsTotal" v-bind="props.detailsTdAttrs">
                <slot
                  name="row-expansion"
                  :item="item"
                  :toggle-expansion="() => expandedItemsController.toggle(item)"
                  :fields="computedFields"
                  :index="itemIndex"
                />
              </BTd>
            </BTr>
          </template>
        </template>
        <!-- This class is for specific targetting of this slot element -->
        <BTr
          v-if="!props.stacked && slots['bottom-row']"
          class="bottom-row"
          v-bind="callTbodyTrAttrs(null, 'row-bottom')"
        >
          <slot name="bottom-row" :columns="computedFieldsTotal" :fields="computedFields" />
        </BTr>
      </slot>
    </BTbody>
    <BTfoot v-if="props.footClone" v-bind="footerProps">
      <BTr :color="computedFootRowColor" v-bind="props.tfoot?.trAttrs ?? props.thead?.trAttrs">
        <BTh
          v-for="field in computedFields"
          :key="field.key"
          scope="col"
          :class="getFieldColumnClasses(field)"
          :title="field.header?.title"
          :abbr="field.header?.abbr"
          :style="field.th?.style"
          :color="field.color"
          :tabindex="keyboardController.shouldHeaderBeFocusable(field) ? '0' : undefined"
          v-bind="mergeProps(callFieldColumnAttrs(field), callThAttr(null, field, 'bottom') ?? {})"
          @click="keyboardController.headerClicked(field, $event, true)"
          @keydown="keyboardController.handleHeaderKeydown(field, $event, true)"
        >
          <div class="d-inline-flex flex-nowrap align-items-center gap-1">
            <div>
              <!-- eslint-disable prettier/prettier -->
              <!-- @vue-expect-error - typescript is generating 2322 errors for all properties after name, which is wrong -->
              <slot
                :name="calculatedFooterSlot(field.key)"
                :label="field.label"
                :column="field.key"
                :field="field"
                :is-foot="true"
              >
                <!-- eslint-enable prettier/prettier -->
                {{ getTableFieldHeadLabel(field) }}
              </slot>
            </div>
          </div>
        </BTh>
      </BTr>
    </BTfoot>
    <BTfoot v-else-if="slots['custom-foot']" v-bind="footerProps">
      <slot
        name="custom-foot"
        :fields="computedFields"
        :items="props.items"
        :columns="computedFieldsTotal"
      />
    </BTfoot>
    <caption v-if="slots['table-caption'] || props.caption">
      <slot name="table-caption">
        {{ props.caption }}
      </slot>
    </caption>
  </BTableSimple>
</template>

<script setup lang="ts" generic="Item">
import {resolvePartColor} from '../../composables/useThemeClasses'
import {computed, mergeProps, readonly, toRef} from 'vue'
import {
  isTableItem,
  type TableField,
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
import {pick} from '../../utils/object'
import {
  bTableSimpleProps,
  formatItem,
  getByFieldKey,
  getTableFieldHeadLabel,
  getWithGetter,
} from '../../utils/tableUtils'
import {filterEvent} from '../../utils/filterEvent'
import {useId} from '../../composables/useId'
import type {BTableLiteEmits, BTableLiteProps, BTableLiteSlots} from '../../types'
import {
  useItemExpansion,
  useTableFieldsMapper,
  useTableKeyboardNavigation,
} from '../../composables/useTableLiteHelpers'

const _props = withDefaults(defineProps<Omit<BTableLiteProps<Item>, 'expandedItems'>>(), {
  caption: undefined,
  align: undefined,
  fields: () => [],
  footClone: false,
  items: () => [],
  fieldColumnAttrs: undefined,
  detailsTdAttrs: undefined,
  modelValue: undefined,
  primaryKey: undefined,
  tbody: undefined,
  tfoot: undefined,
  thead: undefined,
  // BTableSimpleProps props
  tableAttrs: undefined,
  bordered: undefined,
  borderless: undefined,
  captionTop: undefined,
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
  color: undefined,
})
const props = useDefaults(_props, 'BTableLite')
const emit = defineEmits<BTableLiteEmits<Item>>()
const slots = defineSlots<BTableLiteSlots<Item>>()

const expandedItems = defineModel<Exclude<BTableLiteProps<Item>['expandedItems'], undefined>>(
  'expandedItems',
  {
    default: () => [],
  }
)

const computedId = useId(() => props.id)
const expandedItemsController = useItemExpansion({
  allItems: () => props.items,
  primaryKey: toRef(() => props.primaryKey),
  expandedItems,
})
const keyboardController = useTableKeyboardNavigation(
  {
    items: () => props.items,
    id: computedId,
  },
  {
    onHeadClicked: (obj) => {
      emit('head-clicked', obj)
    },
    onRowClicked: (obj) => {
      emit('row-clicked', obj)
    },
    onRowMiddleClicked: (obj) => {
      emit('row-middle-clicked', obj)
    },
  }
)
const {
  fields: computedFields,
  total: computedFieldsTotal,
  showHeaders: showComputedHeaders,
} = useTableFieldsMapper({
  fields: () => props.fields,
  items: () => props.items,
  stacked: () => props.stacked,
})

const calculatedFooterSlot = (key: string): keyof typeof slots =>
  slots[`foot(${key})`]
    ? `foot(${key})`
    : slots['foot()']
      ? 'foot()'
      : slots[`head(${key})`]
        ? `head(${key})`
        : 'head()'

const computedTableAttrs = computed(() =>
  mergeProps({class: {[`align-${props.align}`]: props.align !== undefined}}, props.tableAttrs ?? {})
)
const getFieldColumnClasses = (field: TableField) => [
  field.class,
  field.th?.class,
  {
    'b-table-sticky-column': field.stickyColumn,
  },
]
const callFieldColumnAttrs = (field: TableField<Item>) =>
  (typeof props.fieldColumnAttrs === 'function'
    ? props.fieldColumnAttrs(field)
    : props.fieldColumnAttrs) ?? {}
const getFieldRowClasses = (field: Readonly<TableField>, tr: Item) => [
  field.class,
  typeof field.td?.class === 'function'
    ? field.td.class(getByFieldKey(tr, field), field.key, tr)
    : field.td?.class,
  {
    'b-table-sticky-column': field.stickyColumn,
  },
]
const itemAttributes = (item: Item, field: TableField) =>
  field.td?.attr && typeof field.td.attr === 'function'
    ? field.td.attr({value: getByFieldKey(item, field), key: field.key, item})
    : field.td?.attr
const callThAttr = (item: Item | null, field: TableField<Item>, type: TableRowThead) =>
  field.th?.attr && typeof field.th.attr === 'function'
    ? field.th.attr({value: getByFieldKey(item, field), key: field.key, item, type})
    : field.th?.attr
const callTbodyTrAttrs = (item: Item | null, type: TableRowType) =>
  props.tbody?.trAttrs
    ? typeof props.tbody.trAttrs === 'function'
      ? props.tbody.trAttrs(item, type)
      : props.tbody.trAttrs
    : null

const generateTableRowId = (primaryKeyValue: string) =>
  `${computedId.value}__row_${primaryKeyValue}`

const getCellComponent = (field: Readonly<TableField>) => {
  if (field?.isRowHeader) {
    return BTh
  }
  return BTd
}

// The cloned footer falls back to the head colors key by key; `null` clears the fallback
const computedFootColor = computed(() =>
  resolvePartColor(props.tfoot?.color, props.thead?.color ?? {})
)
const computedFootRowColor = computed(() =>
  resolvePartColor(props.tfoot?.rowColor, props.thead?.rowColor ?? {})
)

// A cell's color: its `_cellColors` entry, falling back to the field's color key by key
const getCellColor = (item: Item, field: TableField<Item>) =>
  resolvePartColor(isTableItem(item) ? item._cellColors?.[field.key] : undefined, field.color ?? {})

const footerProps = computed(() => ({
  color: computedFootColor.value,
  ...(props.tfoot?.attrs ?? props.thead?.attrs),
}))

const computedSimpleProps = computed(() => ({
  ...pick(props, bTableSimpleProps),
  tableAttrs: computedTableAttrs.value,
  id: computedId.value,
}))

defineExpose({
  expansion: {
    ...expandedItemsController,
    expandedItems: readonly(expandedItems),
  },
})
</script>
