import type {
  BPlaceholderButtonProps,
  BPlaceholderCardProps,
  BPlaceholderCardSlots,
  BPlaceholderProps,
  BPlaceholderTableProps,
  BPlaceholderTableSlots,
  BPlaceholderWrapperProps,
  BPlaceholderWrapperSlots,
} from 'bootstrap-vue-next'
import { type ComponentReference, type PropRecord, type SlotRecord, StyleKind } from '../../types'
import { pick } from '../../utils/objectUtils'
import { buildCommonProps } from '../../utils/commonProps'

export default {
  load: (): ComponentReference => ({
    BPlaceholder: {
      props: {
        ...pick(buildCommonProps(), ['fg']),
        animation: {
          type: 'PlaceholderAnimation',
          default: undefined,
        },
        cols: {
          type: 'Numberish',
          default: 12,
        },
        size: {
          type: 'PlaceholderSize',
          default: undefined,
        },
        tag: {
          type: 'string',
          default: 'span',
        },
        bg: {
          type: 'MaybeArray<BgColor> | null',
          default: null,
        },
        width: {
          type: 'Numberish',
          default: undefined,
        },
        wrapperTag: {
          type: 'string',
          default: 'span',
        },
      } satisfies PropRecord<keyof BPlaceholderProps>,
      emits: {},
      slots: {},
    },
    BPlaceholderCard: {
      styleSpec: { kind: StyleKind.OverrideClass, value: '.card' },
      props: {
        ...pick(buildCommonProps(), ['bg', 'fg', 'footerBg', 'footerFg', 'headerBg', 'headerFg']),
        animation: {
          type: 'PlaceholderAnimation',
          default: undefined,
        },
        footerAnimation: {
          type: 'PlaceholderAnimation',
          default: undefined,
        },
        footerSize: {
          type: 'PlaceholderSize',
          default: undefined,
        },
        footerTheme: {
          type: 'ThemeProp | null',
          default: undefined,
        },
        footerWidth: {
          type: 'Numberish',
          default: 100,
        },
        headerAnimation: {
          type: 'PlaceholderAnimation',
          default: undefined,
        },
        headerSize: {
          type: 'PlaceholderSize',
          default: undefined,
        },
        headerTheme: {
          type: 'ThemeProp | null',
          default: undefined,
        },
        headerWidth: {
          type: 'Numberish',
          default: 100,
        },
        imgBlankColor: {
          type: 'string',
          default: '#868e96',
        },
        imgPlacement: {
          type: "'top' | 'bottom'",
          default: 'top',
        },
        imgHeight: {
          type: 'Numberish',
          default: 100,
        },
        imgSrc: {
          type: 'string',
          default: undefined,
        },
        noButton: {
          type: 'boolean',
          default: false,
        },
        noFooter: {
          type: 'boolean',
          default: false,
        },
        noHeader: {
          type: 'boolean',
          default: false,
        },
        noImg: {
          type: 'boolean',
          default: false,
        },
        size: {
          type: 'PlaceholderSize',
          default: undefined,
        },
        theme: {
          type: 'ThemeProp | null',
          default: undefined,
        },
      } satisfies PropRecord<keyof BPlaceholderCardProps>,
      emits: {},
      slots: {
        img: {
          description: 'Overrides the default image placeholder',
          scope: {},
        },
        header: {
          description: 'Overrides the default header placeholder',
          scope: {},
        },
        default: {
          description: 'Overrides the default placeholders',
          scope: {},
        },
        footer: {
          description: 'Overrides the default footer placeholder',
          scope: {},
        },
      } satisfies SlotRecord<keyof BPlaceholderCardSlots>,
    },
    BPlaceholderWrapper: {
      styleSpec: { kind: StyleKind.None },
      props: {
        ...pick(buildCommonProps(), ['bg', 'fg', 'footerBg', 'footerFg', 'headerBg', 'headerFg']),
        loading: {
          description: 'Determines whether the loading slot is displayed',
          type: 'boolean',
          default: false,
        },
      } satisfies PropRecord<keyof BPlaceholderWrapperProps>,
      emits: {},
      slots: {
        default: {
          description: 'Content to show when the `loading` prop is `false`',
          scope: {},
        },
        loading: {
          description: 'Content to show when the `loading` prop is `true`',
          scope: {},
        },
      } satisfies SlotRecord<keyof BPlaceholderWrapperSlots>,
    },
    BPlaceholderTable: {
      styleSpec: { kind: StyleKind.OverrideClass, value: '.table' },
      props: {
        ...pick(buildCommonProps(), ['bg', 'fg', 'footerBg', 'footerFg', 'headerBg', 'headerFg']),
        animation: {
          type: 'PlaceholderAnimation',
          default: undefined,
        },
        cellWidth: {
          type: 'Numberish',
          default: 100,
        },
        columns: {
          type: 'Numberish',
          default: 5,
        },
        footerAnimation: {
          type: 'PlaceholderAnimation',
          default: undefined,
        },
        footerCellWidth: {
          type: 'Numberish',
          default: 100,
        },
        footerColumns: {
          type: 'Numberish',
          default: undefined,
        },
        footerSize: {
          type: 'PlaceholderSize',
          default: undefined,
        },
        footerTheme: {
          type: 'ThemeProp | null',
          default: undefined,
        },
        headerAnimation: {
          type: 'PlaceholderAnimation',
          default: undefined,
        },
        headerCellWidth: {
          type: 'Numberish',
          default: 100,
        },
        headerColumns: {
          type: 'Numberish',
          default: undefined,
        },
        headerSize: {
          type: 'PlaceholderSize',
          default: undefined,
        },
        headerTheme: {
          type: 'ThemeProp | null',
          default: undefined,
        },
        noHeader: {
          type: 'boolean',
          default: false,
        },
        rows: {
          type: 'Numberish',
          default: 3,
        },
        showFooter: {
          type: 'boolean',
          default: false,
        },
        size: {
          type: 'PlaceholderSize',
          default: undefined,
        },
        theme: {
          type: 'ThemeProp | null',
          default: undefined,
        },
      } satisfies PropRecord<keyof BPlaceholderTableProps>,
      emits: {},
      slots: {
        thead: {
          description: 'Overrides the table header (thead) placeholder',
          scope: {},
        },
        tfoot: {
          description: 'Overrides the table footer (tfoot) placeholder',
          scope: {},
        },
        default: {
          description: 'Overrides the table body (tbody) placeholder',
          scope: {},
        },
      } satisfies SlotRecord<keyof BPlaceholderTableSlots>,
    },
    BPlaceholderButton: {
      styleSpec: { kind: StyleKind.OverrideClass, value: '.placeholder.btn' },
      props: {
        ...pick(buildCommonProps(), ['bg', 'fg']),
        animation: {
          type: 'PlaceholderAnimation',
          default: undefined,
        },
        cols: {
          type: 'Numberish',
          default: undefined,
        },
        tag: {
          type: 'string',
          default: 'div',
        },
        theme: {
          type: 'ThemeProp | null',
          default: 'primary',
        },
        width: {
          type: 'Numberish',
          default: undefined,
        },
      } satisfies PropRecord<keyof BPlaceholderButtonProps>,
      emits: {},
      slots: {},
    },
  }),
}
