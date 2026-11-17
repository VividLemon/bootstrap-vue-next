import type { BFormAdornProps, BFormAdornSlots } from 'bootstrap-vue-next'
import { type ComponentReference, type PropRecord, type SlotRecord, StyleKind } from '../../types'

export default {
  load: (): ComponentReference => ({
    BFormAdorn: {
      styleSpec: { kind: StyleKind.BootstrapClass, value: '.form-adorn' },
      props: {
        endText: {
          type: 'string',
          default: undefined,
          description:
            'Text adornment after the control, rendered as `.form-adorn-text`. The `end` slot takes precedence',
        },
        size: {
          type: 'Size',
          default: undefined,
          description: "Control size: 'sm' or 'lg' (`.form-control-sm` / `.form-control-lg`)",
        },
        startText: {
          type: 'string',
          default: undefined,
          description:
            'Text adornment before the control, rendered as `.form-adorn-text`. The `start` slot takes precedence',
        },
        tag: {
          type: 'string',
          default: 'label',
          description:
            'Wrapper element. The default `label` focuses the control when the wrapper is clicked',
        },
      } satisfies PropRecord<keyof BFormAdornProps>,
      slots: {
        default: {
          description:
            'The control. `BFormInput` renders as a `.form-ghost` input inside `BFormAdorn`',
        },
        end: {
          description:
            'Adornment after the control (usually an icon), wrapped in an `aria-hidden` `.form-adorn-icon`',
        },
        start: {
          description:
            'Adornment before the control (usually an icon), wrapped in an `aria-hidden` `.form-adorn-icon`',
        },
      } satisfies SlotRecord<keyof BFormAdornSlots>,
    },
  }),
}
