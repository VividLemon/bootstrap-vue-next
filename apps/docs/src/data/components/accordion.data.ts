import type {
  BAccordionItemEmits,
  BAccordionItemProps,
  BAccordionItemSlots,
  BAccordionProps,
  BAccordionSlots,
} from 'bootstrap-vue-next'
import type {ComponentReference, EmitRecord, PropRecord, SlotRecord} from '../../types'
import {buildCommonProps} from '../../utils/commonProps'
import {pick} from '../../utils/objectUtils'

export default {
  load: (): ComponentReference => ({
    BAccordion: {
      props: {
        ...pick(
          buildCommonProps({
            id: {
              description:
                'The Id of the accordion. Used as the shared `name` of the native details elements to make them exclusive',
            },
          }),
          ['id']
        ),
        flush: {
          type: 'boolean',
          default: false,
          description:
            'Removes the default background color, certain borders, and rounded corners to render accordions edge-to-edge with their parent container',
        },
        free: {
          type: 'boolean',
          default: false,
          description: 'Accordion items will stay open when another item is opened',
        },
        modelValue: {
          type: 'string | string[]',
          default: undefined,
          description: 'Id (or ids when `free`) of the accordion item(s) that are open',
        },
      } satisfies PropRecord<keyof BAccordionProps>,
      emits: {
        'update:model-value': {
          description: 'Update the currently opened accordion item(s)',
          args: {
            value: {
              description: 'Id of the accordion item that is open',
              type: 'string | string[]',
            },
          },
        },
      },
      slots: {
        default: {
          description: 'Content to place in the Accordion',
        },
      } satisfies SlotRecord<keyof BAccordionSlots>,
    },
    BAccordionItem: {
      props: {
        ...pick(
          buildCommonProps({
            id: {
              description: 'The Id of the accordion item, used for state management',
            },
          }),
          ['bodyAttrs', 'bodyClass', 'id']
        ),
        modelValue: {
          type: 'boolean',
          default: false,
          description: 'Whether the accordion item is open',
        },
        headerAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description: 'Attributes to be applied to the summary (header) element',
        },
        headerClass: {
          type: 'ClassValue',
          default: undefined,
          description: 'Class to be applied to the summary (header) element',
        },
        title: {
          type: 'string',
          default: undefined,
          description:
            'Text to place in the header of the AccordionItem (title slot takes precedence)',
        },
      } satisfies PropRecord<keyof BAccordionItemProps>,
      emits: {
        'toggle': {
          description: 'Emitted when the native details element toggles',
          args: {
            value: {
              type: 'ToggleEvent',
              description: 'The native toggle event',
            },
          },
        },
        'update:model-value': {
          description: 'Emitted when the open state of the AccordionItem is changed',
          args: {
            value: {
              type: 'boolean',
              description: 'Current open state of the AccordionItem',
            },
          },
        },
      } satisfies EmitRecord<keyof BAccordionItemEmits | 'update:model-value'>,
      slots: {
        default: {
          description: 'Content to place in the AccordionItem',
        },
        title: {
          description: 'Content to place in the header of the AccordionItem',
        },
      } satisfies SlotRecord<keyof BAccordionItemSlots>,
    },
  }),
}
