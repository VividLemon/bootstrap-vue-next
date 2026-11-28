import type {
  BAccordionItemEmits,
  BAccordionItemProps,
  BAccordionItemSlots,
  BAccordionProps,
  BAccordionSlots,
} from 'bootstrap-vue-next'
import type { ComponentReference, EmitRecord, PropRecord, SlotRecord } from '../../types'

export default {
  load: (): ComponentReference => ({
    BAccordion: {
      props: {
        color: {
          type: "Pick<ColorExtendables, 'theme'> | null",
          default: undefined,
          description:
            'Theme color of the open items (`theme` renders `.theme-*`). See [Color variants](/docs/reference/color-variants)',
        },
        flush: {
          type: 'boolean',
          default: false,
          description:
            'Removes the outer borders and rounded corners to render the accordion edge-to-edge with its parent container (`.accordion-flush`)',
        },
        free: {
          type: 'boolean',
          default: false,
          description:
            'Items stay open when another item opens ("always open"). Items then get no shared `name` and `v-model` is an array of ids',
        },
        gap: {
          type: 'boolean',
          default: false,
          description: 'Separates the items with a gap (`.accordion-gap`, `--bs-accordion-gap`)',
        },
        id: {
          type: 'string',
          default: undefined,
          description: 'Id of the accordion. Also the default `name` shared by its items',
        },
        lazy: {
          type: 'boolean',
          default: false,
          description:
            'Default `lazy` for every item: an item body renders on its first open and stays rendered',
        },
        modelValue: {
          type: 'string | readonly string[]',
          default: undefined,
          description:
            'Id of the open item, or an array of open item ids when `free` is set. `undefined` when no item is open',
        },
        name: {
          type: 'string',
          default: undefined,
          description:
            'Overrides the `name` shared by the items (defaults to the accordion id). Items in different accordions with the same name close each other. Ignored when `free` is set',
        },
        noTransition: {
          type: 'boolean',
          default: false,
          description:
            'Disables the open/close and header transitions of every item (sets the accordion transition tokens to `0s` inline)',
        },
        size: {
          type: 'AccordionSize',
          default: 'md',
          description: "Accordion size: `'sm'` renders `.accordion-sm`",
        },
      } satisfies PropRecord<keyof BAccordionProps>,
      emits: {
        'update:model-value': {
          description: 'Emitted when the open item(s) change',
          args: {
            value: {
              type: 'string | readonly string[] | undefined',
              description: 'Id of the open item, or the open item ids when `free` is set',
            },
          },
        },
      },
      slots: {
        default: {
          description: 'The `BAccordionItem` components of the accordion',
        },
      } satisfies SlotRecord<keyof BAccordionSlots>,
    },
    BAccordionItem: {
      props: {
        bodyAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            'Attributes for the `.accordion-body` element; `class` and `style` merge with the defaults',
        },
        headerAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            'Attributes for the `<summary class="accordion-header">` element; `class` and `style` merge with the defaults',
        },
        id: {
          type: 'string',
          default: undefined,
          description:
            'Id of the `<details>` element and the key of the item in the parent `v-model`. Generated when not set',
        },
        lazy: {
          type: 'boolean',
          default: false,
          description:
            'Renders the body content on the first open and keeps it afterwards. Lazy content cannot be found with find-in-page',
        },
        modelValue: {
          type: 'boolean',
          default: false,
          description: 'Whether the item is open (the `open` attribute of the `<details>`)',
        },
        noTransition: {
          type: 'boolean',
          default: false,
          description: 'Disables the open/close and header transitions of this item',
        },
        title: {
          type: 'string',
          default: undefined,
          description: 'Text of the `<summary>` header',
        },
      } satisfies PropRecord<keyof BAccordionItemProps>,
      emits: {
        'update:model-value': {
          description: 'Emitted when the item opens or closes, including browser-driven changes',
          args: {
            value: {
              type: 'boolean',
              description: 'Whether the item is open',
            },
          },
        },
        toggle: {
          description:
            'The native `toggle` event of the `<details>`. Fired after the state changed and not cancelable',
          args: {
            value: {
              type: 'ToggleEvent',
              description: 'Native toggle event (`oldState`, `newState`)',
            },
          },
        },
      } satisfies EmitRecord<keyof BAccordionItemEmits | 'update:model-value'>,
      slots: {
        default: {
          description: 'Content of the accordion body',
        },
        icon: {
          description: 'Replaces the default chevron `<svg class="accordion-icon">`',
          scope: {
            open: {
              type: 'boolean',
              description: 'Whether the item is open',
            },
          },
        },
        title: {
          description: 'Content of the `<summary>` header. Overrides the `title` prop',
          scope: {
            open: {
              type: 'boolean',
              description: 'Whether the item is open',
            },
          },
        },
      } satisfies SlotRecord<keyof BAccordionItemSlots>,
    },
  }),
}
