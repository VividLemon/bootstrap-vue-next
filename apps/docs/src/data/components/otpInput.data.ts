import {type ComponentReference, type EmitRecord, type SlotRecord, StyleKind} from '../../types'
import {pick} from '../../utils/objectUtils'
import {buildCommonProps} from '../../utils/commonProps'

export default {
  load: (): ComponentReference => ({
    BOtpInput: {
      styleSpec: {kind: StyleKind.BsvnClass},
      props: {
        ...pick(buildCommonProps(), ['disabled', 'id', 'name', 'required', 'size', 'state']),
        defaultValue: {
          type: 'string[]',
          default: undefined,
          description:
            'The default value of the OTP inputs when initially rendered. Use when you do not need to control its state',
        },
        dir: {
          type: "'ltr' | 'rtl'",
          default: undefined,
          description:
            'The reading direction of the OTP input. If omitted, inherits globally from ConfigProvider or assumes LTR (left-to-right) reading mode',
        },
        length: {
          type: 'Numberish',
          default: '5',
          description: 'The number of input fields to render',
        },
        mask: {
          type: 'boolean',
          default: 'false',
          description:
            'When set to `true`, the OTP inputs will be treated as password fields, masking the entered characters',
        },
        modelValue: {
          type: 'string[] | null',
          default: 'null',
          description:
            'The controlled value of the OTP input. Can be bound as `v-model`. Each element in the array represents one input field',
        },
        otp: {
          type: 'boolean',
          default: 'false',
          description:
            'When set to `true`, mobile devices will autodetect the OTP from messages or clipboard, and enable the autocomplete field',
        },
        placeholder: {
          type: 'string',
          default: "''",
          description: 'The placeholder character to use for empty OTP input fields',
        },
        type: {
          type: "'number' | 'text'",
          default: "'text'",
          description:
            "The input type for the OTP fields. Set to `'number'` to restrict input to numeric values only",
        },
      },
      emits: {
        'complete': {
          description: 'Emitted when all OTP input fields have been filled',
          args: {
            value: {
              type: 'string[]',
              description: 'The complete array of input values',
            },
          },
        },
        'update:model-value': {
          description: 'Emitted when the OTP input value changes',
          args: {
            value: {
              type: 'string[]',
              description: 'The current array of input values',
            },
          },
        },
      } satisfies EmitRecord,
      slots: {
        default: {
          description: 'Content to place in the OTP input. Receives current model value in scope',
          scope: {
            modelValue: {
              type: 'string[]',
              description: 'Current input values',
            },
          },
        },
      } satisfies SlotRecord,
    },
  }),
}
