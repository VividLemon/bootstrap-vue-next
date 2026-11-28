import type {
  BAvatarEmits,
  BAvatarGroupProps,
  BAvatarGroupSlots,
  BAvatarProps,
  BAvatarSlots,
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
    BAvatar: {
      styleSpec: { kind: StyleKind.OverrideClass, value: '.avatar' },
      props: {
        ...pick(
          buildCommonProps({
            color: {
              type: 'ColorExtendables | null',
              default: undefined,
              description:
                'Colors the avatar with one object: `theme` renders `theme-*`, `bg` renders `bg-*` and `fg` renders `fg-*`. Without a color the avatar uses the neutral `--bs-avatar-bg`. See [Color variants](/docs/reference/color-variants)',
            },
          }),
          ['color'],
        ),
        alt: {
          type: 'string',
          default: 'avatar',
          description: 'Value for the `alt` attribute of the image rendered by `src`',
        },
        size: {
          type: 'LiteralUnion<AvatarSize, Numberish>',
          default: undefined,
          description:
            "Avatar size. `'xs'`, `'sm'`, `'lg'` and `'xl'` render `.avatar-{size}` (`'md'` is the default and adds no class). Any other value is set as `--bs-avatar-size`; numbers are converted to pixels. Overridden by the `size` of a parent `BAvatarGroup`",
        },
        src: {
          type: 'string',
          default: undefined,
          description:
            'Image URL. Renders `<img class="avatar-img">`; falls back to `text` and emits `img-error` when the image fails to load',
        },
        status: {
          type: 'AvatarStatus',
          default: undefined,
          description:
            "Renders a status indicator (`.avatar-status.status-{status}`): `'online'`, `'offline'`, `'busy'` or `'away'`",
        },
        statusLabel: {
          type: 'string',
          default: undefined,
          description:
            'Accessible label (`aria-label`) of the status indicator. Defaults to the capitalized `status`',
        },
        text: {
          type: 'string',
          default: undefined,
          description: 'Short text (initials) to render when there is no image or default slot',
        },
        variant: {
          type: 'AvatarVariant | null',
          default: null,
          description: "Avatar style: `'subtle'` renders `.avatar-subtle`",
        },
      } satisfies PropRecord<keyof BAvatarProps>,
      emits: {
        'img-error': {
          description: 'Emitted when the `src` image fails to load',
          args: {
            'img-error': {
              description: 'The native error event of the image',
              type: 'Event',
            },
          },
        },
      } satisfies EmitRecord<keyof BAvatarEmits>,
      slots: {
        default: {
          description: 'Custom avatar content. Takes precedence over the `src` and `text` props',
        },
      } satisfies SlotRecord<keyof BAvatarSlots>,
    },
    BAvatarGroup: {
      styleSpec: { kind: StyleKind.OverrideClass, value: '.avatar-stack' },
      props: {
        overlap: {
          type: 'Numberish',
          default: 0.3,
          description:
            'Overlap of the child avatars as a fraction of their size, between `0` (none) and `1`. Set as `--bs-avatar-stack-spacing` on each child avatar',
        },
        size: {
          type: 'LiteralUnion<AvatarSize, Numberish>',
          default: undefined,
          description:
            "Size of the child avatars; wins over their own `size`. `'xs'`, `'sm'`, `'lg'` and `'xl'` render `.avatar-stack-{size}`; other values are set as `--bs-avatar-size` on each child",
        },
        tag: {
          type: 'string',
          default: 'div',
          description: 'Specify the HTML tag to render instead of the default tag',
        },
      } satisfies PropRecord<keyof BAvatarGroupProps>,
      slots: {
        default: {
          description: 'The avatars of the group. They must be direct children',
        },
      } satisfies SlotRecord<keyof BAvatarGroupSlots>,
    },
  }),
}
