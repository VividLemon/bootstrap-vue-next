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
    captionTop: 0,
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
    color: 0,
    tableAttrs: 0,
  } satisfies Record<keyof BTableSimpleProps, 0>)
) as readonly (keyof BTableSimpleProps)[]

export const bTableLiteProps = Object.freeze(
  Object.keys({
    align: 0,
    caption: 0,
    detailsTdAttrs: 0,
    fieldColumnAttrs: 0,
    fields: 0,
    footClone: 0,
    footColor: 0,
    footRowColor: 0,
    headColor: 0,
    headRowColor: 0,
    items: 0,
    modelValue: 0,
    primaryKey: 0,
    tbodyAttrs: 0,
    tbodyTrAttrs: 0,
    tfootAttrs: 0,
    expandedItems: 0,
    tfootTrAttrs: 0,
    theadAttrs: 0,
    theadTrAttrs: 0,
  } satisfies Record<keyof Omit<BTableLiteProps<unknown>, keyof BTableSimpleProps>, 0>)
) as readonly (keyof Omit<BTableLiteProps<unknown>, keyof BTableSimpleProps>)[]

/**
 * The `data-cell` attribute Bootstrap's `.table-stacked` uses as the label of a stacked `<td>`.
 * Only rendered while the table is stacked.
 */
export const getDataCellAttr = (stacked: boolean | Breakpoint | undefined, label: string) =>
  stacked ? {'data-cell': label} : undefined
