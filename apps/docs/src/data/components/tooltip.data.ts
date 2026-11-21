import type {BTooltipEmits, BTooltipProps, BTooltipSlots} from 'bootstrap-vue-next'
import {
  type ComponentReference,
  type EmitRecord,
  type ExposedRecord,
  type PropRecord,
  type SlotRecord,
  StyleKind,
} from '../../types'
import {showHideSlotsData} from '../../utils/showHideData'
import {popoverSharedEmits, popoverSharedProps} from '../../utils/popover-shared'

export default {
  load: (): ComponentReference => ({
    BTooltip: {
      styleSpec: {kind: StyleKind.OverrideClass, value: '.tooltip, .popover'},
      props: {
        ...popoverSharedProps('tooltip'),
        interactive: {
          type: 'boolean',
          default: false,
          description:
            'Whether the tooltip is interactive (can be hovered/focused without closing).',
        },
      } satisfies PropRecord<keyof BTooltipProps>,
      emits: popoverSharedEmits('tooltip') satisfies EmitRecord<
        keyof BTooltipEmits | 'update:model-value'
      >,
      slots: {
        title: {
          description: 'Content for the tooltip title.',
          scope: showHideSlotsData,
        },
        default: {
          description: 'Content for the tooltip body.',
          scope: showHideSlotsData,
        },
        activator: {
          description:
            'The element that opens the tooltip. Bind `props` on it with `v-bind="props"`.',
          scope: {
            ...showHideSlotsData,
            props: {
              type: 'ActivatorProps',
              description:
                'Bind on the activator element with `v-bind="props"`: its ref, the listeners for the active triggers and `aria-describedby` while the tooltip is on screen',
            },
          },
        },
      } satisfies SlotRecord<keyof BTooltipSlots>,
      exposed: {
        show: {
          type: '() => void',
          description: 'Shows the tooltip',
        },
        hide: {
          type: '() => void',
          description: 'Hides the tooltip',
        },
        toggle: {
          type: '() => void',
          description: 'Toggles the visibility of the tooltip',
        },
      } satisfies ExposedRecord,
    },
  }),
}
