import type {
  BStepperItemEmits,
  BStepperItemProps,
  BStepperItemSlots,
  BStepperProps,
  BStepperSlots,
} from 'bootstrap-vue-next'
import {
  type ComponentReference,
  type EmitRecord,
  type PropRecord,
  type SlotRecord,
  StyleKind,
} from '../../types'

export default {
  load: (): ComponentReference => ({
    BStepper: {
      styleSpec: { kind: StyleKind.OverrideClass, value: '.stepper' },
      props: {
        horizontal: {
          type: 'boolean | Breakpoint',
          default: false,
          description:
            "Lays the steps out horizontally. `true` renders `.stepper-horizontal`; a breakpoint such as `'md'` renders `md:stepper-horizontal`, which needs a query-container ancestor (`.contains-inline`, or `overflow`). Bootstrap has prefix classes for `sm`, `md`, `lg` and `xl` only",
        },
        modelValue: {
          type: 'number',
          default: undefined,
          description:
            'Index (0-based) of the current step. Items up to and including it get `.active`; the current item gets `aria-current="step"`. The stepper never changes it itself',
        },
        overflow: {
          type: 'boolean',
          default: false,
          description:
            'Wraps the stepper in `<div class="stepper-overflow">`, which scrolls horizontally and is a query container',
        },
        tag: {
          type: 'string',
          default: 'ol',
          description:
            "Element of the stepper. Use `'div'` with interactive (link or button) items",
        },
      } satisfies PropRecord<keyof BStepperProps>,
      emits: {
        'update:model-value': {
          description: 'Emitted when the model changes',
          args: {
            value: {
              type: 'number | undefined',
              description: 'Index of the current step',
            },
          },
        },
      },
      slots: {
        default: {
          description: 'The `BStepperItem` components',
        },
      } satisfies SlotRecord<keyof BStepperSlots>,
    },
    BStepperItem: {
      styleSpec: { kind: StyleKind.OverrideClass, value: '.stepper-item' },
      props: {
        active: {
          type: 'boolean',
          default: undefined,
          description:
            'Renders `.active`, overriding the state derived from the parent `v-model` (completed or current step)',
        },
        button: {
          type: 'boolean',
          default: false,
          description: 'Renders the item as `<button type="button" class="stepper-item">`',
        },
        color: {
          type: "Pick<ColorExtendables, 'theme'> | null",
          default: undefined,
          description:
            'Theme color of the active circle and track (`theme` renders `.theme-*`). See [Color variants](/docs/reference/color-variants)',
        },
        current: {
          type: 'boolean',
          default: undefined,
          description:
            'Renders `aria-current="step"`, overriding the state derived from the parent `v-model`',
        },
        disabled: {
          type: 'boolean',
          default: false,
          description: 'Disables an interactive (button or link) item',
        },
        href: {
          type: 'string',
          default: undefined,
          description: 'Renders the item as a link (`BLink`) to this URL',
        },
        tag: {
          type: 'string',
          default: 'li',
          description: 'Element of a non-interactive item',
        },
        to: {
          type: 'RouteLocationRaw',
          default: undefined,
          description: 'Renders the item as a router link (`BLink`)',
        },
      } satisfies PropRecord<keyof BStepperItemProps>,
      emits: {
        click: {
          description:
            'Emitted when an interactive (button or link) item is clicked. The stepper does not change its step by itself',
          args: {
            click: {
              type: 'MouseEvent',
              description: 'Native click event',
            },
          },
        },
      } satisfies EmitRecord<keyof BStepperItemEmits>,
      slots: {
        default: {
          description: 'Label of the step',
        },
      } satisfies SlotRecord<keyof BStepperItemSlots>,
    },
  }),
}
