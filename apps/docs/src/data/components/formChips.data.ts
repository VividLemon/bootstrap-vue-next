import type {
  BChipEmits,
  BChipProps,
  BChipSlots,
  BFormChipsEmits,
  BFormChipsProps,
  BFormChipsSlots,
} from 'bootstrap-vue-next'
import {
  type ComponentReference,
  type EmitRecord,
  type ExposedRecord,
  type PropRecord,
  type SlotRecord,
  StyleKind,
} from '../../types'
import { pick } from '../../utils/objectUtils'
import { buildCommonProps } from '../../utils/commonProps'

export default {
  load: (): ComponentReference => ({
    BFormChips: {
      styleSpec: { kind: StyleKind.BootstrapClass, value: '.chip-input' },
      props: {
        ...pick(buildCommonProps(), [
          'ariaInvalid',
          'autofocus',
          'disabled',
          'form',
          'placeholder',
          'required',
          'state',
        ]),
        allowDuplicates: {
          type: 'boolean',
          default: false,
          description: 'Allows the same value more than once',
        },
        chipAttrs: {
          type: '(value: string, index: number) => Readonly<AttrsValue> | undefined',
          default: undefined,
          description: 'Attributes for each rendered chip, computed per value',
        },
        color: {
          type: "Pick<ColorExtendables, 'theme'> | null",
          default: undefined,
          description:
            '`theme` adds `.theme-{color}` to the wrapper; chips and the focus ring follow it',
        },
        createOnBlur: {
          type: 'boolean',
          default: true,
          description: 'Turns the typed text into a chip when the input loses focus',
        },
        dismissLabel: {
          type: 'string',
          default: 'Remove',
          description:
            "Accessible label prefix of each chip's dismiss button, rendered as '{dismissLabel} {value}'",
        },
        dismissible: {
          type: 'boolean',
          default: true,
          description: 'Renders a dismiss button on each chip',
        },
        id: {
          type: 'string',
          default: undefined,
          description: 'ID of the text input, so a `BFormGroup` label (or `label-for`) targets it',
        },
        inputAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description: 'Attributes (and listeners) for the text input',
        },
        maxChips: {
          type: 'number | null',
          default: null,
          description: 'Maximum number of chips; further values are rejected',
        },
        modelValue: {
          type: 'string[]',
          default: '[]',
          description: 'The chip values (`v-model`)',
        },
        name: {
          type: 'string',
          default: undefined,
          description: 'When set, renders one hidden input with this name per value',
        },
        separator: {
          type: 'string | null',
          default: "','",
          description:
            'Typing or pasting this character splits the text into chips; `null` disables splitting',
        },
      } satisfies PropRecord<keyof BFormChipsProps>,
      emits: {
        'update:model-value': {
          description: 'Emitted when chips are added or removed',
          args: { value: { type: 'string[]', description: 'The new values' } },
        },
        add: {
          description: 'Emitted before a chip is added. Call `event.preventDefault()` to reject it',
          args: {
            value: { type: 'string', description: 'The trimmed value' },
            event: { type: 'BvEvent', description: 'Cancelable event' },
          },
        },
        remove: {
          description: 'Emitted before a chip is removed. Call `event.preventDefault()` to keep it',
          args: {
            value: { type: 'string', description: 'The value' },
            event: { type: 'BvEvent', description: 'Cancelable event' },
          },
        },
        select: {
          description: 'Emitted when the chip selection changes',
          args: { values: { type: 'string[]', description: 'The selected values' } },
        },
      } satisfies EmitRecord<keyof BFormChipsEmits | 'update:model-value'>,
      slots: {
        chip: {
          description:
            'Replaces a chip. Bind `props` on the chip element (`<BChip v-bind="props">`) so keyboard navigation and selection find it',
          scope: {
            value: { type: 'string', description: 'The value' },
            index: { type: 'number', description: 'Position in the model' },
            selected: { type: 'boolean', description: 'Whether the chip is selected' },
            remove: { type: '() => boolean', description: 'Removes the chip' },
            props: {
              type: 'ChipProps',
              description:
                'Bind with `v-bind="props"` on the chip element: its `ref`, `tabindex` and `aria-pressed`',
            },
          },
        },
        'dismiss-icon': {
          description: "Content of each chip's dismiss button",
          scope: {
            value: { type: 'string', description: "The chip's value" },
            index: { type: 'number', description: "The chip's position in the model" },
          },
        },
      } satisfies SlotRecord<keyof BFormChipsSlots>,
      exposed: {
        add: { type: '(value: string) => boolean', description: 'Adds a chip' },
        blur: { type: '() => void', description: 'Blurs the text input' },
        clear: { type: '() => void', description: 'Removes every chip' },
        element: { type: 'HTMLDivElement', description: 'The `.chip-input` element' },
        focus: { type: '() => void', description: 'Focuses the text input' },
        remove: {
          type: '(value: string) => boolean',
          description: 'Removes the first chip with this value',
        },
        removeSelected: { type: '() => void', description: 'Removes the selected chips' },
        selection: {
          type: 'object',
          description:
            'The chip selection, shaped like `BTable`\'s `selection`. Chips are addressed by index, so duplicate values stay distinct',
          properties: {
            add: { type: '(index: number) => void', description: 'Selects a chip' },
            remove: { type: '(index: number) => void', description: 'Deselects a chip' },
            set: {
              type: '(indices: readonly number[]) => void',
              description: 'Selects exactly these chips',
            },
            setAll: { type: '() => void', description: 'Selects every chip' },
            clear: { type: '() => void', description: 'Deselects every chip' },
            has: { type: '(index: number) => boolean', description: 'Whether a chip is selected' },
            selectedItems: {
              type: 'Readonly<Ref<readonly string[]>>',
              description: 'The selected values, in model order',
            },
          },
        },
      } satisfies ExposedRecord,
    },
    BChip: {
      styleSpec: { kind: StyleKind.BootstrapClass, value: '.chip' },
      props: {
        ...pick(buildCommonProps(), ['disabled', 'id', 'tag']),
        active: {
          type: 'boolean',
          default: false,
          description: 'Renders the selected (solid) style',
        },
        color: {
          type: 'ColorExtendables | null',
          default: undefined,
          description: 'Color object; `theme` recolors the chip',
        },
        dismissLabel: {
          type: 'string',
          default: 'Remove',
          description: 'Accessible label of the dismiss button',
        },
        dismissible: {
          type: 'boolean',
          default: false,
          description: 'Renders a dismiss button that emits `remove`',
        },
        value: {
          type: 'string',
          default: undefined,
          description:
            'The chip value: default content, `data-bs-chip-value` and the `remove` payload',
        },
      } satisfies PropRecord<keyof BChipProps>,
      emits: {
        remove: {
          description: 'Emitted when the dismiss button is clicked',
          args: {
            value: { type: 'string', description: 'The `value` prop' },
            event: { type: 'MouseEvent', description: 'The click event' },
          },
        },
      } satisfies EmitRecord<keyof BChipEmits>,
      slots: {
        default: { description: 'Chip content (defaults to `value`)' },
        'dismiss-icon': { description: 'Content of the dismiss button' },
        icon: { description: 'Leading icon, wrapped in `.chip-icon`' },
        img: {
          description:
            'Leading image. Bind `props` on it (`<img v-bind="props" src="...">`) for the `.chip-img` class',
          scope: {
            props: { type: '{class: string}', description: 'Bind with `v-bind="props"` on the image' },
          },
        },
      } satisfies SlotRecord<keyof BChipSlots>,
    },
  }),
}
