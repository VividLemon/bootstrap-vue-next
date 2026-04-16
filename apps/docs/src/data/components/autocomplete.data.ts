import {type ComponentReference, type EmitRecord, type PropRecord, type SlotRecord, StyleKind} from '../../types'

export default {
  load: (): ComponentReference => ({
    BAutocomplete: {
      styleSpec: {kind: StyleKind.BsvnClass},
      props: {
        disabled: {
          type: 'boolean',
          default: false,
          description:
            "When set to `true`, disables the component's functionality and places it in a disabled state",
        },
        modelValue: {
          type: 'string',
          default: "''",
          description: 'The currently selected value. Can be bound with `v-model`',
        },
        options: {
          type: 'string[]',
          default: '() => []',
          description: 'Array of option strings to display in the dropdown list',
        },
        placeholder: {
          type: 'string',
          default: undefined,
          description: 'Placeholder text for the input element when no value is selected',
        },
        search: {
          type: 'string',
          default: "''",
          description:
            'The current search / filter text. Can be bound with `v-model:search` for custom filtering or async fetching',
        },
      } satisfies PropRecord,
      emits: {
        'update:model-value': {
          description: 'Emitted when the selected value changes',
          args: {
            value: {
              type: 'string',
              description: 'The newly selected value',
            },
          },
        },
        'update:search': {
          description:
            'Emitted when the search text changes. Use with `v-model:search` for custom filtering',
          args: {
            value: {
              type: 'string',
              description: 'The current search / filter text',
            },
          },
        },
      } satisfies EmitRecord,
      slots: {
        default: {
          description:
            'Slot to override the rendering of individual items in the dropdown. Receives each option in scope',
          scope: {
            option: {
              type: 'string',
              description: 'The current option value being rendered',
            },
          },
        },
      } satisfies SlotRecord,
    },
  }),
}
