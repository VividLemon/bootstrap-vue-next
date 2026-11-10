import type { BPaginationEmits, BPaginationProps, BPaginationSlots } from 'bootstrap-vue-next'
import type {
  ComponentReference,
  EmitRecord,
  PropRecord,
  SlotRecord,
  SlotScopeReference,
} from '../../types'
import { pick } from '../../utils/objectUtils'
import { buildCommonProps } from '../../utils/commonProps'

const sharedScope: SlotScopeReference = {
  disabled: {
    type: 'Boolean',
    description: 'Will be `true` if this button is disabled (non-clickable)',
  },
  index: {
    type: 'Number',
    description: 'Page number (indexed from `0` to `numberOfPages - 1`)',
  },
  page: {
    type: 'Number',
    description: 'Page number (from `1` to `numberOfPages`)',
  },
} as const

export default {
  load: (): ComponentReference => ({
    BPagination: {
      props: {
        ...pick(
          buildCommonProps({
            ariaLabel: {
              default: 'Pagination',
            },
            size: {
              default: undefined,
            },
            color: {
              type: "Pick<ColorExtendables, 'theme'> | null",
              description:
                'Colors the pagination with its `theme` key (`theme-*` class), coloring the active page and hover/focus states',
            },
          }),
          [
            'ariaControls',
            'ariaLabel',
            'color',
            'disabled',
            'noEllipsis',
            'noGotoEndButtons',
            'size',
          ],
        ),
        align: {
          type: 'AlignmentJustifyContent | fill',
          description:
            "Alignment of the page buttons: 'start' (or 'left'), 'center', 'end' (or 'right'), or 'fill'",
        },
        ellipsis: {
          type: 'PaginationButtonOptions',
          default: undefined,
          description:
            "The ellipsis placeholder: `text` (content, default '\u2026'), `attrs` (attributes for its page item)",
        },
        first: {
          type: 'PaginationEndButtonOptions',
          default: undefined,
          description:
            "The go-to-first-page button: `text` (content, default '\u00AB'), `attrs` (attributes for its page item), and `number` (show the page number instead of the button, default `false`)",
        },
        labels: {
          type: '{ firstPage?: string; prevPage?: string; nextPage?: string; lastPage?: string; page?: string }',
          default: {
            firstPage: 'Go to first page',
            prevPage: 'Go to previous page',
            nextPage: 'Go to next page',
            lastPage: 'Go to last page',
            page: 'Go to page',
          },
          description:
            "Values for the 'aria-label' attributes of the go-to buttons; `page` is appended with the page number. Keys left out keep their default; an empty string removes the label",
        },
        last: {
          type: 'PaginationEndButtonOptions',
          default: undefined,
          description:
            "The go-to-last-page button: `text` (content, default '\u00BB'), `attrs` (attributes for its page item), and `number` (show the page number instead of the button, default `false`)",
        },
        limit: {
          type: 'Numberish',
          default: 5, // TODO item not in string format
          description:
            'Maximum number of buttons to show (including ellipsis if shown, but excluding the bookend buttons)',
        },
        modelValue: {
          type: 'Numberish',
          default: 1, // TODO item not in string format
          description: 'Current page number, starting from 1',
        },
        next: {
          type: 'PaginationButtonOptions',
          default: undefined,
          description:
            "The go-to-next-page button: `text` (content, default '\u203A'), `attrs` (attributes for its page item)",
        },
        pageAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            "Attributes to apply to the go-to-page button `<li>` items. `class` and `style` merge with the component's own",
        },
        perPage: {
          type: 'Numberish',
          default: 20, // TODO item not in string format
          description: 'Number of rows per page',
        },
        pills: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description: 'Applies pill styling to the pagination buttons',
        },
        prev: {
          type: 'PaginationButtonOptions',
          default: undefined,
          description:
            "The go-to-previous-page button: `text` (content, default '\u2039'), `attrs` (attributes for its page item)",
        },
        totalRows: {
          type: 'Numberish',
          default: 0, // TODO item not in string format
          description: 'Total number of rows in the dataset',
        },
      } satisfies PropRecord<keyof BPaginationProps>,
      emits: {
        'update:model-value': {
          description: 'Emitted when page changes via user interaction', // TODO similar content to BAlert/update:model-value (similar purpose)
          args: {
            page: {
              type: 'number',
              description: 'Selected page number (starting with `1`)',
            },
          },
        },
        'page-click': {
          description: 'Emitted when a page button is clicked. Cancelable',
          args: {
            BvEvent: {
              type: 'BvEvent',
              description:
                'The `BvEvent` object. Call `BvEvent.preventDefault()` to cancel page selection',
            },
            page: {
              type: 'number',
              description: 'Page number to select (starting with `1`)',
            },
          },
        },
      } satisfies EmitRecord<keyof BPaginationEmits | 'update:model-value'>,
      slots: {
        'ellipsis-text': {
          scope: {},
          description: "The '...' indicator content. Overrides the `ellipsis-text` prop",
        },
        'first-text': {
          description: 'The go-to-first-page button content',
          scope: sharedScope,
        },
        'last-text': {
          description: 'The go-to-last-page button content',
          scope: sharedScope,
        },
        'next-text': {
          description: 'The go-to-next-page button content',
          scope: sharedScope,
        },
        page: {
          description: 'Page number button content',
          scope: {
            ...sharedScope,
            active: {
              type: 'Boolean',
              description: 'Whether the page is the active page',
            },
            content: {
              type: 'String',
              description: 'Default button content',
            },
          },
        },
        'prev-text': {
          description: 'The go-to-previous-page button content',
          scope: sharedScope,
        },
      } satisfies SlotRecord<keyof BPaginationSlots>,
    },
  }),
}
