import type {
  BFormSelectOptionGroupSlots,
  BFormSelectOptionSlots,
  BFormSelectSlots,
  BvnComponentProps,
} from 'bootstrap-vue-next'
import {
  type ComponentReference,
  type PropertyReference,
  type SlotsRecord,
  type SlotsReference,
  StyleKind,
} from '../../types'
import {pick} from '../../utils/objectUtils'
import {buildCommonProps} from '../../utils/commonProps'

const optionSlot: SlotsRecord = {
  option: {
    description:
      'Use this slot to have finer control over the content render inside each select item', // TODO grammar check (should say "rendered" instead of "render")
    scope: {
      value: {
        type: 'any (T)',
        description: 'The value of the option',
      },
      text: {
        type: 'string',
        description: 'The text of the option',
      },
      disabled: {
        type: 'boolean',
        description: 'Is the option disabled', // TODO grammar check (should end with a period for consistency with other descriptions)
      },
    },
  },
} as const

export default {
  load: (): ComponentReference => ({
    BFormSelect: {
      styleSpec: {kind: StyleKind.Tag, value: 'select'},
      sourcePath: '/BFormSelect/BFormSelect.vue',
      props: {
        ...pick(
          buildCommonProps({
            options: {type: 'unknown[] | Record<string, unknown>'},
          }),
          [
            'ariaInvalid',
            'autofocus',
            'disabled',
            'disabledField',
            'form',
            'id',
            'name',
            'options',
            'plain',
            'required',
            'size',
            'state',
            'textField',
            'valueField',
          ]
        ),
        labelField: {
          type: 'string',
          default: 'label',
          description: 'The key to use from the option object to get the label',
        },
        modelValue: {
          type: `SelectValue`,
          default: '',
          description: 'The value of the select control',
        },
        multiple: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description: 'When set, allows multiple options to be selected (multi-select)',
        },
        optionsField: {
          type: 'string',
          default: 'options',
          description: 'The key to use from the option object to get the options',
        },
        selectSize: {
          type: 'Numberish',
          default: 0, // TODO item not in string format
          description:
            'When set to a number larger than 0, will set the number of display option rows. Note not all browser will respect this setting', // TODO grammar check (should say "browsers" instead of "browser")
        },
      } satisfies Record<keyof BvnComponentProps['BFormSelect'], PropertyReference>,
      emits: {
        'update:model-value': {
          description:
            'Emitted when the selected value(s) are changed. Looking for the `input` or `change` event - use `update:model-value` instead.', // TODO similar content to BFormRadioGroup/update:model-value (identical description)
          args: {
            value: {
              description: 'Currently selected value of the select control.',
              type: 'SelectValue',
            },
          },
        },
      },
      slots: {
        ...optionSlot,
        default: {
          description: 'Content to place in the form select',
        },
        first: {
          description:
            "Slot to place options or option groups above options provided via the 'options' prop",
        },
      } satisfies Record<keyof BFormSelectSlots, SlotsReference>,
    },
    BFormSelectOption: {
      styleSpec: {kind: StyleKind.Tag, value: 'option'},
      sourcePath: '/BFormSelect/BFormSelectOption.vue',
      props: {
        value: {
          type: 'any',
          default: undefined,
          description: 'The value of the option',
        },
        disabled: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description: 'The disabled state of the option',
        },
      } satisfies Record<keyof BvnComponentProps['BFormSelectOption'], PropertyReference>,
      slots: {
        default: {
          description: 'Content to place in the form select option',
        },
      } satisfies Record<keyof BFormSelectOptionSlots, SlotsReference>,
    },
    BFormSelectOptionGroup: {
      styleSpec: {kind: StyleKind.Tag, value: 'optgroup'},
      sourcePath: '/BFormSelect/BFormSelectOptionGroup.vue',
      props: {
        ...pick(
          buildCommonProps({
            options: {type: 'readonly (unknown | Record<string, unknown>)[]'},
          }),
          ['disabledField', 'options', 'textField', 'valueField']
        ),
        label: {
          type: 'string',
          default: undefined,
          description: 'The label for the option group',
        },
      } satisfies Record<keyof BvnComponentProps['BFormSelectOptionGroup'], PropertyReference>,
      slots: {
        ...optionSlot,
        first: {
          description: 'Content to place in the form select option group',
        },
        default: {
          description: "Slot to place options above options provided via the 'options' prop",
        },
      } satisfies Record<keyof BFormSelectOptionGroupSlots, SlotsReference>,
    },
  }),
}
