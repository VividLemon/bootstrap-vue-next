import type {BPopoverEmits, BPopoverProps, BPopoverSlots} from 'bootstrap-vue-next'
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
    BPopover: {
      styleSpec: {kind: StyleKind.OverrideClass, value: '.tooltip, .popover'},
      props: popoverSharedProps('popover') satisfies PropRecord<keyof BPopoverProps>,
      emits: popoverSharedEmits('popover') satisfies EmitRecord<
        keyof BPopoverEmits | 'update:model-value'
      >,
      slots: {
        title: {
          description: 'Content for the popover title.',
          scope: showHideSlotsData,
        },
        default: {
          description: 'Content for the popover body.',
          scope: showHideSlotsData,
        },
        activator: {
          description:
            'The element that opens the popover. Bind `props` on it with `v-bind="props"`.',
          scope: {
            ...showHideSlotsData,
            props: {
              type: 'ActivatorProps',
              description:
                'Bind on the activator element with `v-bind="props"`: its ref, the listeners for the active triggers and `aria-describedby` while the popover is on screen',
            },
          },
        },
      } satisfies SlotRecord<keyof BPopoverSlots>,
      exposed: {
        show: {
          type: '() => void',
          description: 'Shows the popover',
        },
        hide: {
          type: '() => void',
          description: 'Hides the popover',
        },
        toggle: {
          type: '() => void',
          description: 'Toggles the visibility of the popover',
        },
      } satisfies ExposedRecord,
    },
  }),
}
