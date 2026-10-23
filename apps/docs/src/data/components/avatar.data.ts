import type {
  BAvatarGroupProps,
  BAvatarGroupSlots,
  BAvatarProps,
  BAvatarSlots,
} from 'bootstrap-vue-next'
import {
  type ComponentReference,
  defaultPropSectionSymbol,
  type PropRecord,
  type SlotRecord,
  StyleKind,
} from '../../types'

export default {
  load: (): ComponentReference => ({
    BAvatar: {
      styleSpec: { kind: StyleKind.BsvnClass },
      props: {
        [defaultPropSectionSymbol]: {
          img: {
            type: 'string',
            default: undefined,
            description: 'Image URL for the avatar. Replaces the default slot content',
          },
          imgAlt: {
            type: 'string',
            default: undefined,
            description: 'The `alt` text of the rendered image',
          },
          size: {
            type: "Size | 'xs' | 'xl'",
            default: undefined,
            description:
              "Size of the avatar: `'xs'`, `'sm'`, `'lg'` or `'xl'`. Leave unset for the Bootstrap default size. Overridden by the parent `BAvatarGroup` size when set there",
          },
          status: {
            type: 'AvatarStatus',
            default: undefined,
            description:
              "Renders a status indicator: `'online'`, `'offline'`, `'busy'` or `'away'`",
          },
          statusLabel: {
            type: 'string',
            default: undefined,
            description:
              'Accessible label of the status indicator. Defaults to the capitalized `status`',
          },
          subtle: {
            type: 'boolean',
            default: false,
            description: 'Applies the `avatar-subtle` style',
          },
          variant: {
            type: 'ColorVariant | null',
            default: null,
            description: 'Applies a Bootstrap theme through the `theme-*` class',
          },
        } satisfies PropRecord<keyof BAvatarProps>,
      },
      slots: {
        default: {
          description: 'Content of the avatar, typically initials. Not rendered when `img` is set',
          scope: {},
        },
      } satisfies SlotRecord<keyof BAvatarSlots>,
    },
    BAvatarGroup: {
      styleSpec: { kind: StyleKind.BsvnClass },
      props: {
        [defaultPropSectionSymbol]: {
          size: {
            type: "Size | 'xs' | 'xl'",
            default: undefined,
            description: 'Size passed down to every child `BAvatar`',
          },
        } satisfies PropRecord<keyof BAvatarGroupProps>,
      },
      slots: {
        default: {
          description: 'Content (avatars) to place in the stack',
          scope: {
            count: {
              type: 'number',
              description: 'Number of `BAvatar` instances currently registered in the group',
            },
          },
        },
      } satisfies SlotRecord<keyof BAvatarGroupSlots>,
    },
  }),
}
