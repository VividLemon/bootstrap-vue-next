import type {
  BFormSpinbuttonEmits,
  BFormSpinbuttonProps,
  BFormSpinbuttonSlots,
} from 'bootstrap-vue-next'
import {
  type ComponentReference,
  type EmitRecord,
  type PropRecord,
  type SlotRecord,
  StyleKind,
} from '../../types'
import { pick } from '../../utils/objectUtils'
import { buildCommonProps } from '../../utils/commonProps'

export default {
  load: (): ComponentReference => ({
    BFormSpinbutton: {
      styleSpec: { kind: StyleKind.BsvnClass },
      props: {
        ...pick(buildCommonProps(), [
          'ariaControls',
          'ariaLabel',
          'disabled',
          'form',
          'id',
          'name',
          'readonly',
          'required',
          'size',
          'state',
        ]),
        formatterFn: {
          type: '(value: number) => string',
          default: undefined,
          // TODO missing description
        },
        inline: {
          type: 'boolean',
          default: 'false',
          description: 'When set, renders the component as an inline element',
        },
        labels: {
          type: '{ increment?: string; decrement?: string }',
          default: { increment: 'Increment', decrement: 'Decrement' },
          description:
            'Text for the `aria-label` attribute of the increment and decrement buttons. Keys left out keep their default',
        },
        locale: {
          type: 'string',
          default: 'undefined',
          description:
            'Specify the locale to use for formatting the number. Defaults to the browser locale. Only applicable when using the internal formatter',
        },
        max: {
          type: 'Numberish',
          default: '100',
          description:
            'The maximum value that can be selected. Must be greater than the `min` prop. Negative numbers are allowed',
        },
        min: {
          type: 'Numberish',
          default: '1',
          description: 'The minimum value that can be selected. Negative numbers are allowed',
        },
        placeholder: {
          type: 'string',
          default: 'undefined',
          description: 'Value to show when the v-model is `null`',
        },
        repeat: {
          type: '{ delay?: Numberish; interval?: Numberish; threshold?: Numberish; stepMultiplier?: Numberish }',
          default: { delay: 500, interval: 100, threshold: 10, stepMultiplier: 4 },
          description:
            'Auto-repeat while a button or arrow key is held: `delay` (milliseconds before repeating starts), `interval` (milliseconds between repeats), `threshold` (repeats before the step size grows) and `stepMultiplier` (steps to jump once the threshold is reached, also used by Page Up / Page Down). Each must be a positive integer; keys left out keep their default',
        },
        step: {
          type: 'Numberish',
          default: '1',
          description:
            'A positive number that specifies the granularity that the value must adhere to',
        },
        vertical: {
          type: 'boolean',
          default: 'false',
          description: 'When set, renders the component with a vertical layout',
        },
        wrap: {
          type: 'boolean',
          default: 'false',
          description: 'When set, allows the value to wrap around when reaching min/max bounds',
        },
        modelValue: {
          // TODO missing description
          // TODO missing type
          // TODO missing default
        },
      } satisfies PropRecord<keyof BFormSpinbuttonProps>,
      emits: {
        change: {
          description: 'Emitted when the user releases the mouse button or key',
          args: {
            value: {
              type: 'number | null',
              description: 'Currently value of the spinbutton control.',
            },
          },
        },
        'update:model-value': {
          description: 'Emitted to update the v-model on each value change', // TODO similar content to BFormInput/update:model-value (similar purpose)
          args: {
            value: {
              type: 'number | null',
              description: 'Currently value of the spinbutton control.',
            },
          },
        },
      } satisfies EmitRecord<keyof BFormSpinbuttonEmits | 'update:model-value'>,
      slots: {
        decrement: {
          description: 'Custom content to place in the decrement button',
          scope: {
            hasFocus: {
              type: 'boolean',
              description: '`true` when the spinbutton has focus',
            },
          },
        },
        increment: {
          description: 'Custom content to place in the increment button',
          scope: {
            hasFocus: {
              type: 'boolean',
              description: '`true` when the spinbutton has focus',
            },
          },
        },
      } satisfies SlotRecord<keyof BFormSpinbuttonSlots>,
    },
  }),
}
