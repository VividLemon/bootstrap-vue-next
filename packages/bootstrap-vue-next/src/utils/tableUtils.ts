import {titleCase} from './stringUtils'
import {type TableFieldRaw} from '../types/TableTypes'
import type {Breakpoint, BTableLiteProps, BTableSimpleProps, TableField} from '../types'

export const getTableFieldHeadLabel = (field: Readonly<TableFieldRaw<unknown>>) =>
  typeof field === 'string'
    ? titleCase(field)
    : field.label !== undefined
      ? field.label
      : titleCase(field.key)

export const getWithGetter = <Obj extends object>(
  item: Obj,
  key: string | ((item: Obj) => unknown)
): unknown => {
  if (typeof key === 'function') {
    return key(item)
  }
  return item[key as unknown as keyof Obj]
}

export const getByFieldKey = (item: unknown, field: TableField) =>
  typeof item === 'object' && item !== null
    ? getWithGetter(item, field.accessor ?? field.key)
    : item

export const formatItem = (item: unknown, field: TableField) => {
  const val = getByFieldKey(item, field)

  return typeof field.formatter === 'function'
    ? field.formatter({value: val, key: field.key, item})
    : val
}

export const bTableSimpleProps = Object.freeze(
  Object.keys({
    bordered: 0,
    borderless: 0,
    border: 0,
    captionTop: 0,
    dark: 0,
    fixed: 0,
    hover: 0,
    id: 0,
    noBorderCollapse: 0,
    outlined: 0,
    responsive: 0,
    small: 0,
    stacked: 0,
    stickyHeader: 0,
    striped: 0,
    stripedColumns: 0,
    theme: 0,
    bg: 0,
    fg: 0,
    tableAttrs: 0,
    tableClass: 0,
  } satisfies Record<keyof BTableSimpleProps, 0>)
) as readonly (keyof BTableSimpleProps)[]

export const bTableLiteProps = Object.freeze(
  Object.keys({
    align: 0,
    caption: 0,
    detailsTdClass: 0,
    fieldColumnClass: 0,
    fields: 0,
    footClone: 0,
    footBg: 0,
    footFg: 0,
    footRowTheme: 0,
    footRowBg: 0,
    footRowFg: 0,
    footTheme: 0,
    headBg: 0,
    headFg: 0,
    headRowTheme: 0,
    headRowBg: 0,
    headRowFg: 0,
    headTheme: 0,
    items: 0,
    labelStacked: 0,
    modelValue: 0,
    primaryKey: 0,
    tbodyClass: 0,
    tbodyTrAttrs: 0,
    tbodyTrClass: 0,
    tfootClass: 0,
    expandedItems: 0,
    tfootTrClass: 0,
    theadClass: 0,
    theadTrClass: 0,
  } satisfies Record<keyof Omit<BTableLiteProps<unknown>, keyof BTableSimpleProps>, 0>)
) as readonly (keyof Omit<BTableLiteProps<unknown>, keyof BTableSimpleProps>)[]

export type StackedProps = {
  stacked: boolean | Breakpoint | undefined
  labelStacked: boolean | undefined
}

export const getDataLabelAttr = (props: StackedProps, label: string) =>
  props.stacked && props.labelStacked !== true ? {'data-label': label} : undefined
