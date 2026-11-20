import type {
  BBreadcrumbDividerSlots,
  BBreadcrumbItemEmits,
  BBreadcrumbItemProps,
  BBreadcrumbItemSlots,
  BBreadcrumbProps,
  BBreadcrumbSlots,
} from 'bootstrap-vue-next'
import {
  type ComponentReference,
  defaultPropSectionSymbol,
  type EmitRecord,
  type PropRecord,
  type SlotRecord,
} from '../../types'
import { linkedBLinkSection, linkProps } from '../../utils/linkProps'

export default {
  load: (): ComponentReference => ({
    BBreadcrumb: {
      props: {
        items: {
          type: 'BreadcrumbItemRaw[]',
          default: undefined,
          description: 'Array of `BreadCrumbItem`s or strings to render. See above for details.',
        },
        id: {
          type: 'string',
          default: undefined,
          description:
            'ID of the breadcrumb component. When combined with the `useBreadcrumb` composable, it will use this id as a breadcrumb trail instead of the global trail.',
        },
        olAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            'Attributes to be applied to the inner ol element. `class` and `style` are merged',
        },
      } satisfies PropRecord<keyof BBreadcrumbProps>,
      emits: {},
      slots: {
        default: {
          description:
            'Content (breadcrumb items) to place in the breadcrumb. Place a `BBreadcrumbDivider` between manually placed items.',
        },
        divider: {
          description:
            'Content of the dividers rendered between the items of the `items` prop. Without it, the default chevron is shown',
        },
        append: {
          description: 'Content to append to the breadcrumb',
        },
        prepend: {
          description: 'Content to prepend to the breadcrumb',
        },
      } satisfies SlotRecord<keyof BBreadcrumbSlots>,
    },
    BBreadcrumbDivider: {
      props: {},
      emits: {},
      slots: {
        default: {
          description:
            'Content of the divider, such as `/` or an icon. Without it, the default chevron is shown',
        },
      } satisfies SlotRecord<keyof BBreadcrumbDividerSlots>,
    },
    BBreadcrumbItem: {
      props: {
        [defaultPropSectionSymbol]: {
          ariaCurrent: {
            type: 'string',
            default: 'page',
            description:
              "Sets the value of the 'aria-current' attribute on the `.breadcrumb-item` (when the item is the active item). Supported string values are 'page', 'location', or 'true'",
          },
          text: {
            type: 'string',
            default: undefined,
            description: 'Text to render in the breadcrumb item',
          },
        } satisfies PropRecord<Exclude<keyof BBreadcrumbItemProps, keyof typeof linkProps>>,
        'BLink props': linkedBLinkSection,
      },
      emits: {
        click: {
          description: 'Emitted when the breadcrumb item is clicked',
          args: {
            click: {
              type: 'MouseEvent',
              description: 'Native click event object',
            },
          },
        },
      } satisfies EmitRecord<keyof BBreadcrumbItemEmits>,
      slots: {
        default: {
          description: 'Content to place in the breadcrumb item',
        },
      } satisfies SlotRecord<keyof BBreadcrumbItemSlots>,
    },
  }),
}
