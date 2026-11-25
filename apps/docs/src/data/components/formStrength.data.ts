import type { BFormStrengthEmits, BFormStrengthProps } from 'bootstrap-vue-next'
import { type ComponentReference, type EmitRecord, type PropRecord, StyleKind } from '../../types'

export default {
  load: (): ComponentReference => ({
    BFormStrength: {
      styleSpec: { kind: StyleKind.BootstrapClass, value: '.strength, .strength-bar' },
      props: {
        bar: {
          type: 'boolean',
          default: false,
          description: 'Renders a single `.strength-bar` instead of four `.strength-segment`s',
        },
        messages: {
          type: "Partial<Record<'weak' | 'fair' | 'good' | 'strong', string>>",
          default: undefined,
          description:
            "Text per level for `show-text`; missing levels use 'Weak', 'Fair', 'Good' and 'Strong'",
        },
        minLength: {
          type: 'number',
          default: 8,
          description:
            'Length that earns the length point (`minLength + 4` earns another). Ignored with `scorer`',
        },
        scorer: {
          type: '(password: string) => number',
          default: undefined,
          description:
            'Replaces the built-in scoring. Its score is mapped to a level with `thresholds`. An empty password always scores 0',
        },
        segmentAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description: 'Attributes for each `.strength-segment`',
        },
        showText: {
          type: 'boolean',
          default: false,
          description:
            'Renders the strength message in a `.strength-text` live region after the meter',
        },
        textAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description: 'Attributes for the `.strength-text` element',
        },
        thresholds: {
          type: 'Partial<PasswordStrengthThresholds>',
          default: '{weak: 2, fair: 4, good: 6}',
          description:
            'Highest score per level (`weak`, `fair`, `good`), merged with the defaults key by key; anything above `good` is `strong`',
        },
        value: {
          type: 'string',
          default: "''",
          description: 'The password to score',
        },
        weights: {
          type: 'Partial<PasswordStrengthWeights>',
          default: undefined,
          description:
            'Points per criterion (`minLength`, `extraLength`, `lowercase`, `uppercase`, `numbers`, `special`, `multipleSpecial`, `longPassword`), merged with the defaults (each 1)',
        },
      } satisfies PropRecord<keyof BFormStrengthProps>,
      emits: {
        change: {
          description: 'Emitted when the strength level changes',
          args: {
            value: {
              type: 'PasswordStrengthChange',
              description: '`{strength, score}`; `strength` is `null` for an empty password',
            },
          },
        },
      } satisfies EmitRecord<keyof BFormStrengthEmits>,
      slots: {},
    },
  }),
}
