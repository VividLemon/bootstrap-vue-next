import type { BFormRangeEmits, BFormRangeProps } from 'bootstrap-vue-next'
import {
  type ComponentReference,
  type EmitRecord,
  type ExposedRecord,
  type PropRecord,
  StyleKind,
} from '../../types'
import { pick } from '../../utils/objectUtils'
import { buildCommonProps } from '../../utils/commonProps'

export default {
  load: (): ComponentReference => ({
    BFormRange: {
      styleSpec: { kind: StyleKind.BootstrapClass, value: '.form-range' },
      props: {
        ...pick(buildCommonProps(), [
          'ariaInvalid',
          'disabled',
          'form',
          'id',
          'name',
          'required',
          'state',
        ]),
        bubble: {
          type: 'boolean',
          default: false,
          description: 'Shows the current value in a bubble above the thumb',
        },
        color: {
          type: "Pick<ColorExtendables, 'theme'> | null",
          default: undefined,
          description:
            'Color of the filled track and the thumb. `theme` adds `.theme-{color}` to the wrapper',
        },
        formatter: {
          type: '(value: number) => string',
          default: undefined,
          description:
            'Formats the value shown in the bubble and in tick labels without an explicit label. When set, also sets `aria-valuetext` on the input',
        },
        max: {
          type: 'Numberish',
          default: 100,
          description: 'The maximum value',
        },
        min: {
          type: 'Numberish',
          default: 0,
          description: 'The minimum value',
        },
        modelValue: {
          type: 'number',
          default: 50,
          description: 'The current value (`v-model`), always a number',
        },
        step: {
          type: 'Numberish',
          default: 1,
          description: 'The step between values',
        },
        ticks: {
          type: 'readonly FormRangeTick[]',
          default: undefined,
          description:
            'Tick marks under the track. Each tick is a number or `{value, label}`; also renders a linked `<datalist>` so the thumb snaps to the ticks',
        },
        wrapperAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            'Attributes for the `.form-range` wrapper. Other attributes (including `class`) go to the input',
        },
      } satisfies PropRecord<keyof BFormRangeProps>,
      emits: {
        'update:model-value': {
          description: 'Emitted on each `input` event of the range input',
          args: {
            value: { type: 'number', description: 'The new value' },
          },
        },
        change: {
          description: 'Emitted on the native `change` event, when the user commits a value',
          args: {
            value: { type: 'number', description: 'The committed value' },
          },
        },
      } satisfies EmitRecord<keyof BFormRangeEmits | 'update:model-value'>,
      slots: {},
      exposed: {
        blur: {
          type: '() => void',
          description: 'Removes focus from the input',
        },
        element: {
          type: 'HTMLInputElement',
          description: 'Reference to the range input',
        },
        focus: {
          type: '() => void',
          description: 'Focuses the input',
        },
      } satisfies ExposedRecord,
    },
  }),
}
