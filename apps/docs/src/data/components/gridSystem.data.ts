import type { BColSlots, BRowSlots } from 'bootstrap-vue-next'
import { type ComponentReference, type PropRecord, type SlotRecord, StyleKind } from '../../types'
import { pick } from '../../utils/objectUtils'
import { buildCommonProps } from '../../utils/commonProps'
import type { BColProps, BContainerProps, BContainerSlots, BRowProps } from 'bootstrap-vue-next'

const responsiveNote =
  "Takes a responsive object keyed by breakpoint ('xs', 'sm', 'md', 'lg', 'xl', '2xl'); 'xs' has no class prefix"

export default {
  load: (): ComponentReference => ({
    BContainer: {
      styleSpec: {
        kind: StyleKind.OverrideClass,
        value: '.container, .container-fluid, .{bp}:container',
      },
      props: {
        ...pick(buildCommonProps(), ['tag']),
        fluid: {
          type: 'boolean | Breakpoint',
          default: false, // TODO item not in string format
          description:
            'When set to true, makes the container 100% wide all the time (`container-fluid`), or set to one of the breakpoint names for 100% width up to that breakpoint (`fluid="md"` renders `md:container`)',
        },
        gutterX: {
          type: 'Responsive<GutterNumbers>',
          default: undefined,
          description: `Horizontal gutter, 0 to 12 on the spacing scale (\`{ xs: 3, md: 5 }\` renders \`gx-3 md:gx-5\`). ${responsiveNote}`,
        },
        gutterY: {
          type: 'Responsive<GutterNumbers>',
          default: undefined,
          description: `Vertical gutter, 0 to 12 on the spacing scale (\`{ xs: 3, md: 5 }\` renders \`gy-3 md:gy-5\`). ${responsiveNote}`,
        },
      } satisfies PropRecord<keyof BContainerProps>,
      slots: {
        default: {
          description: 'Content to place in the container',
        },
      } satisfies SlotRecord<keyof BContainerSlots>,
    },
    BRow: {
      props: {
        ...pick(buildCommonProps(), ['tag']),
        alignContent: {
          type: 'Responsive<AlignmentContent>',
          default: undefined,
          description: `Aligns column items together on the cross axis: 'start', 'center', 'end', 'around', 'between' or 'stretch' (\`{ md: 'between' }\` renders \`md:align-content-between\`). Has no effect on single rows of items. ${responsiveNote}`,
        },
        alignH: {
          type: 'Responsive<AlignmentJustifyContent>',
          default: undefined,
          description: `Horizontal alignment/spacing of all columns: 'start', 'center', 'end', 'around', 'between', or 'evenly' (\`{ md: 'center' }\` renders \`md:justify-content-center\`). ${responsiveNote}`,
        },
        alignV: {
          type: 'Responsive<AlignmentVertical>',
          default: undefined,
          description: `Vertical alignment of all columns in a row: 'start', 'center', 'end', 'baseline', or 'stretch' (\`{ md: 'center' }\` renders \`md:align-items-center\`). ${responsiveNote}`,
        },
        cols: {
          type: 'Responsive<RowColsNumbers>',
          default: undefined,
          description: `The number of row columns to create, 1 to 6 or 'auto' (\`{ xs: 1, md: 3 }\` renders \`row-cols-1 md:row-cols-3\`). ${responsiveNote}`,
        },
        gutterX: {
          type: 'Responsive<GutterNumbers>',
          default: undefined,
          description: `Horizontal gutter, 0 to 12 on the spacing scale (\`{ xs: 3, md: 5 }\` renders \`gx-3 md:gx-5\`). ${responsiveNote}`,
        },
        gutterY: {
          type: 'Responsive<GutterNumbers>',
          default: undefined,
          description: `Vertical gutter, 0 to 12 on the spacing scale (\`{ xs: 3, md: 5 }\` renders \`gy-3 md:gy-5\`). ${responsiveNote}`,
        },
        noGutters: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description:
            'When set, removes the margin from the row and removes the padding from the child columns',
        },
      } satisfies PropRecord<keyof BRowProps>,
      slots: {
        default: {
          description: 'Content to place in the row',
        },
      } satisfies SlotRecord<keyof BRowSlots>,
    },
    BCol: {
      styleSpec: { kind: StyleKind.OverrideClass, value: '.col[-*], .{bp}:col[-*]' },
      props: {
        ...pick(buildCommonProps(), ['tag']),
        alignSelf: {
          type: "Responsive<AlignmentVertical | 'auto'>",
          default: undefined,
          description: `Vertical alignment of the grid cell with respect to the row: 'auto', 'start', 'center', 'end', 'baseline', or 'stretch' (\`{ md: 'end' }\` renders \`md:align-self-end\`). ${responsiveNote}`,
        },
        cols: {
          type: 'Responsive<ColsValue>',
          default: undefined,
          description: `Number of columns (1 to 12) the grid cell spans, 'auto' for its natural width, or \`true\` for an equal-width column (\`{ xs: 12, md: 6 }\` renders \`col-12 md:col-6\`, \`{ md: true }\` renders \`md:col\`). When no breakpoint sets a column size the cell renders \`.col\`. ${responsiveNote}`,
        },
        offset: {
          type: 'Responsive<ColsOffsetNumbers>',
          default: undefined,
          description: `Number of columns (0 to 11) the grid cell is offset (\`{ md: 2 }\` renders \`md:offset-2\`). ${responsiveNote}`,
        },
        order: {
          type: 'Responsive<ColsOrderNumbers>',
          default: undefined,
          description: `Flex order of the grid cell: 0 to 5, 'first', or 'last' (\`{ lg: 'first' }\` renders \`lg:order-first\`). ${responsiveNote}`,
        },
      } satisfies PropRecord<keyof BColProps>,
      emits: {},
      slots: {
        default: {
          description: 'Content to place in the col',
        },
      } satisfies SlotRecord<keyof BColSlots>,
    },
  }),
}
