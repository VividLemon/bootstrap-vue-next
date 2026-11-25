import type {
  BMenuHeaderProps,
  BMenuHeaderSlots,
  BMenuItemEmits,
  BMenuItemProps,
  BMenuItemSlots,
  BMenuTextProps,
  BMenuTextSlots,
} from 'bootstrap-vue-next'
import {
  type ComponentReference,
  defaultPropSectionSymbol,
  type EmitRecord,
  type PropRecord,
  type SlotRecord,
} from '../../types'
import { linkProps, linkTo } from '../../utils/linkProps'
import { menuEmits, menuExposed, menuProps, menuSlots } from '../../utils/menuCommon'
import { omit } from '../../utils/objectUtils'

export default {
  load: (): ComponentReference => ({
    BMenu: {
      props: menuProps,
      emits: menuEmits,
      slots: menuSlots,
      exposed: menuExposed,
    },
    BMenuItem: {
      props: {
        [defaultPropSectionSymbol]: {
          color: {
            type: "Pick<ColorExtendables, 'theme'> | null",
            default: undefined,
            description: 'Theme of the item: `{ theme }` renders `theme-*` on `.menu-item`',
          },
          description: {
            type: 'string',
            default: undefined,
            description:
              'Secondary text below the content (`.menu-item-description` in `.menu-item-content`)',
          },
          selected: {
            type: 'boolean',
            default: undefined,
            description:
              '`true` marks the item selected (`.selected`). Any boolean renders the check mark (`.menu-item-check`), which is only visible while selected; leave it unset for items that are never selectable',
          },
          text: {
            type: 'string',
            default: undefined,
            description: 'Content of the item. The default slot takes precedence',
          },
        } satisfies PropRecord<Exclude<keyof BMenuItemProps, keyof typeof linkProps> | 'color'>,
        'BLink props': {
          _opts: {
            linkTo,
          },
          _data: omit(linkProps, ['color']),
        },
      },
      emits: {
        click: {
          description:
            'Emitted when the item is clicked (not when disabled). The menu closes afterwards unless `auto-close` is `false` or `outside`',
          args: {
            value: {
              type: 'MouseEvent',
              description: 'Native click event object',
            },
          },
        },
      } satisfies EmitRecord<keyof BMenuItemEmits>,
      slots: {
        default: {
          description: 'Content of the item',
        },
        description: {
          description: 'Secondary text below the content (`.menu-item-description`)',
        },
        icon: {
          description: 'An icon before the content. Give it the `menu-item-icon` class',
        },
      } satisfies SlotRecord<keyof BMenuItemSlots>,
    },
    BMenuHeader: {
      props: {
        tag: {
          type: 'string',
          default: 'h6',
          description: 'The element to render',
        },
        text: {
          type: 'string',
          default: undefined,
          description: 'Content of the header. The default slot takes precedence',
        },
      } satisfies PropRecord<keyof BMenuHeaderProps>,
      emits: {},
      slots: {
        default: {
          description: 'Content of the header',
        },
      } satisfies SlotRecord<keyof BMenuHeaderSlots>,
    },
    BMenuText: {
      props: {
        tag: {
          type: 'string',
          default: 'span',
          description: 'The element to render',
        },
        text: {
          type: 'string',
          default: undefined,
          description: 'Content of the text. The default slot takes precedence',
        },
      } satisfies PropRecord<keyof BMenuTextProps>,
      emits: {},
      slots: {
        default: {
          description: 'Free text in the menu (`.menu-text`)',
        },
      } satisfies SlotRecord<keyof BMenuTextSlots>,
    },
    BMenuDivider: {
      props: {},
      emits: {},
      slots: {},
    },
  }),
}
