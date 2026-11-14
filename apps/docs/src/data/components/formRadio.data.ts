import type {
  BFormRadioGroupProps,
  BFormRadioGroupSlots,
  BFormRadioProps,
  BFormRadioSlots,
} from 'bootstrap-vue-next'
import {
  type ComponentReference,
  type ExposedRecord,
  type PropRecord,
  type SlotRecord,
  StyleKind,
} from '../../types'
import { pick } from '../../utils/objectUtils'
import { buildCommonProps } from '../../utils/commonProps'

export default {
  load: (): ComponentReference => ({
    BFormRadio: {
      styleSpec: { kind: StyleKind.Tag, value: 'input[type="radio"]' },
      props: {
        ...pick(buildCommonProps(), [
          'ariaLabel',
          'ariaLabelledby',
          'autofocus',
          'disabled',
          'form',
          'id',
          'name',
          'plain',
          'required',
          'size',
          'state',
        ]),
        button: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description:
            'When set, renders the radio as a toggle button: `<label class="btn btn-check …">` wrapping the input, with no wrapper `<div>`',
        },
        buttonColor: {
          type: 'ColorExtendables',
          default: { theme: 'secondary' },
          description:
            'Color object for the button in `button` mode: `theme`, `bg`, `fg` keys. Keys left out (or `undefined`) keep the default; `null` clears it. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
        },
        buttonVariant: {
          type: 'ButtonVariant | null',
          default: 'solid',
          description:
            "Sets the button style ('solid', 'outline', 'subtle', 'text' or 'link') when in `button` mode",
        },
        modelValue: {
          type: 'RadioValue | undefined',
          default: undefined,
          description:
            'The current value of the radio. Looking for `checked` - use `modelValue` instead.',
        },
        value: {
          type: 'RadioValue | undefined',
          default: true, // TODO item not in string format
          description: 'Value returned when this radio button is selected',
        },
      } satisfies PropRecord<keyof BFormRadioProps>,
      emits: {
        'update:model-value': {
          description: 'Emitted when the radio button value is changed', // TODO similar content to BFormCheckbox/update:model-value (similar purpose)
          args: {
            value: {
              description: 'Value of the radio button.',
              type: 'RadioValue',
            },
          },
        },
      },
      slots: {
        default: {
          description: 'Content to place in the label of the radio button',
        },
      } satisfies SlotRecord<keyof BFormRadioSlots>,
      exposed: {
        blur: {
          type: '() => void',
          description: 'Removes focus from the radio button',
        },
        focus: {
          type: '() => void',
          description: 'Sets focus on the radio button',
        },
        element: {
          type: 'HTMLInputElement',
          description: 'Reference to the underlying input element',
        },
      } satisfies ExposedRecord,
    },
    BFormRadioGroup: {
      styleSpec: { kind: StyleKind.Tag, value: 'div[role="radiogroup"]' },
      props: {
        ...pick(buildCommonProps(), [
          'ariaInvalid',
          'autofocus',
          'disabled',
          'fields',
          'form',
          'id',
          'name',
          'options',
          'plain',
          'required',
          'size',
          'state',
        ]),
        buttonColor: {
          type: 'ColorExtendables',
          default: { theme: 'secondary' },
          description:
            'Color object for the button in `button` mode: `theme`, `bg`, `fg` keys. Keys left out (or `undefined`) keep the default; `null` clears it. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
        },
        buttonVariant: {
          type: 'ButtonVariant | null',
          default: 'solid',
          description:
            "Specifies the button style ('solid', 'outline', 'subtle', 'text' or 'link') to apply to the button style radio buttons",
        },
        buttons: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description: 'When set, renders the radio buttons in this group with button styling',
        },
        modelValue: {
          type: 'RadioValue | undefined',
          default: undefined,
          description:
            'The current value of the checked radio in the group. Looking for `checked` - use `modelValue` instead.',
        },
        stacked: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description:
            'When set, renders the radio button group in stacked mode. When not set, the radios are laid out inline using the `d-flex flex-wrap column-gap-5` utilities (or as a `btn-group` in `buttons` mode)',
        },
      } satisfies PropRecord<keyof BFormRadioGroupProps>,
      emits: {
        'update:model-value': {
          description:
            'Emitted when the selected value(s) are changed. Looking for the `input` or `change` event - use `update:model-value` instead.', // TODO similar content to BFormCheckboxGroup/update:model-value (identical description)
          args: {
            value: {
              description: 'Currently selected value of the radio group.',
              type: 'RadioValue | null',
            },
          },
        },
      },
      slots: {
        default: {
          description: 'Content (form radio buttons) to place in the form radio button group',
        },
        first: {
          description:
            'Slot to place for radio buttons so that they appear before radios generated from options prop',
        },
        option: {
          description:
            'Use this slot to have finer control over the content rendered inside each radio button',
          scope: {
            value: {
              type: 'string | number | undefined',
              description: 'The value of the radio button',
            },
            disabled: {
              type: 'boolean | undefined',
              description: 'Whether the radio button is disabled',
            },
            text: {
              type: 'string | undefined',
              description: 'The text to display for the radio button',
            },
          },
        },
      } satisfies SlotRecord<keyof BFormRadioGroupSlots>,
      exposed: {
        blur: {
          type: '() => void',
          description: 'Removes focus from the radio group',
        },
        focus: {
          type: '() => void',
          description: 'Sets focus on the first radio button in the group',
        },
      } satisfies ExposedRecord,
    },
  }),
}
