import type { BMenuEmits, BMenuProps } from 'bootstrap-vue-next'
import type { EmitRecord, ExposedRecord, PropRecord, SlotRecord } from '../types'
import { buildCommonProps } from './commonProps'
import { pick } from './objectUtils'
import { showHideEmits, showHideProps, showHideSlotsData } from './showHideData'

export const menuProps = {
  autoClose: {
    type: "boolean | 'inside' | 'outside'",
    default: true,
    description:
      "Which clicks close the open menu: `true` any click (except on the toggle and on form controls in the menu), `'inside'` only clicks inside the menu, `'outside'` only clicks outside it, `false` none. Escape always closes it",
  },
  boundary: {
    type: "'clippingParents' | HTMLElement",
    default: 'clippingParents',
    description:
      'The area the menu is shifted to stay inside of: its clipping ancestors, or an element',
  },
  display: {
    type: "'dynamic' | 'static'",
    default: 'dynamic',
    description:
      "`'static'` turns positioning off (no Floating UI); use it for menus laid out by their container, such as menus in an expanded navbar drawer",
  },
  floatingConfig: {
    type: 'Partial<ComputePositionConfig> | ((defaultConfig: ComputePositionConfig) => ComputePositionConfig)',
    default: undefined,
    description:
      'Floating UI `computePosition` config merged over the default one (`placement`, `middleware`, `strategy`), or a function that receives the default config and returns the one to use',
  },
  menuAttrs: {
    type: 'Readonly<AttrsValue>',
    default: undefined,
    description:
      "Attributes for the `.menu` element (`class` and `style` merge with the component's own). Use `{role: 'menu'}` to opt into ARIA menu semantics",
  },
  offset: {
    type: 'readonly [number, number] | ((state: {placement, reference, floating}) => readonly [number, number])',
    default: '[0, 2]',
    description:
      'Distance of the menu from its reference in px as `[skidding, distance]`, or a function returning it',
  },
  placement: {
    type: 'MenuPlacement',
    default: 'bottom-start',
    description:
      'Where the menu opens: `top`, `bottom`, `left`, `right`, or the logical `start` / `end` (resolved from the document direction), each optionally with `-start` / `-end`. The menu flips when there is no room',
  },
  reference: {
    type: "'toggle' | 'parent' | HTMLElement | VirtualElement",
    default: 'toggle',
    description:
      "The element the menu is positioned against: the toggle, the toggle's parent element, or any element or Floating UI virtual element",
  },
  responsivePlacement: {
    type: 'Readonly<Responsive<MenuPlacement>>',
    default: undefined,
    description: "Overrides `placement` from a breakpoint up, for example `{ md: 'bottom-end' }`",
  },
  scrollable: {
    type: 'boolean',
    default: false,
    description: 'Limits the menu height (`.menu-scrollable`) so long menus scroll',
  },
  split: {
    type: 'boolean',
    default: false,
    description:
      'Renders a split button: a main button plus a separate toggle (`.menu-toggle-split`), in a `.btn-group` unless the menu is already inside a `BButtonGroup` or `BInputGroup`',
  },
  splitAttrs: {
    type: 'Readonly<AttrsValue>',
    default: undefined,
    description: 'Attributes for the main button in split mode',
  },
  splitButtonType: {
    type: 'ButtonType',
    default: 'button',
    description: "The `type` of the main button in split mode: 'button', 'submit' or 'reset'",
  },
  splitDisabled: {
    type: 'boolean',
    default: false,
    description: 'Disables the main button in split mode',
  },
  splitHref: {
    type: 'string',
    default: undefined,
    description: 'Renders the main button in split mode as a link to this URL',
  },
  splitTo: {
    type: 'RouteLocationRaw',
    default: undefined,
    description: 'Renders the main button in split mode as a router link to this route',
  },
  splitVariant: {
    type: 'ButtonVariant | null',
    default: undefined,
    description:
      "Button style of the main button in split mode ('solid', 'outline', 'subtle', 'text' or 'link'). Defaults to `variant`",
  },
  strategy: {
    type: "'absolute' | 'fixed'",
    default: 'absolute',
    description:
      "Floating UI positioning strategy. `'fixed'` escapes `overflow: hidden` ancestors without teleporting",
  },
  teleportTo: {
    type: 'string | HTMLElement',
    default: undefined,
    description:
      'Moves the menu to this element. By default the menu renders in place, next to its toggle. A teleported menu renders below an open native dialog (`BDialog`, drawers)',
  },
  text: {
    type: 'string',
    default: undefined,
    description: 'Content of the toggle (of the main button in split mode)',
  },
  toggleAttrs: {
    type: 'Readonly<AttrsValue>',
    default: undefined,
    description:
      'Attributes for the toggle (the split toggle in split mode). Fallthrough attributes go there too',
  },
  toggleText: {
    type: 'string',
    default: 'Toggle menu',
    description: 'Visually hidden label of the split toggle',
  },
  translucent: {
    type: 'boolean',
    default: false,
    description: 'Gives the menu a translucent background (`.menu-translucent`)',
  },
  ...showHideProps,
  ...pick(
    buildCommonProps({
      variant: {
        default: 'solid',
      },
      color: {
        default: { theme: 'secondary' },
      },
      disabled: {
        description:
          'Disables the toggle. A disabled menu cannot be opened (also not by `show()` or `v-model`) and closes when it becomes disabled',
      },
      id: {
        description: 'ID of the toggle. The menu gets `${id}-menu`',
      },
    }),
    ['color', 'disabled', 'id', 'size', 'variant', 'splitColor'],
  ),
} as const satisfies PropRecord<keyof BMenuProps>

export const menuEmits = {
  ...showHideEmits,
  'split-click': {
    description: 'Emitted when the main button is clicked in split mode',
    args: {
      value: {
        type: 'MouseEvent',
        description: 'Native click event object',
      },
    },
  },
} as const satisfies EmitRecord<keyof BMenuEmits>

export const menuSlots = {
  default: {
    description: 'Content of the menu',
    scope: showHideSlotsData,
  },
  activator: {
    description:
      'Replaces the toggle (the split toggle in split mode) with your own element. Bind `props` to it with `v-bind="props"`',
    scope: {
      ...showHideSlotsData,
      props: {
        type: 'BMenuToggleProps',
        description:
          'Bind with `v-bind="props"` on the opener: `ref`, `id`, `class` (`show`), `aria-expanded`, `aria-controls`, `onClick` and `onKeydown`',
      },
    },
  },
  toggle: {
    description: 'Content of the toggle (of the main button in split mode). Replaces `text`',
  },
  'split-toggle': {
    description:
      'Content of the split toggle. Default: a chevron icon and the visually hidden `toggle-text`',
  },
} as const satisfies SlotRecord

export const menuExposed = {
  show: {
    type: '(resolveOnHide?: boolean) => Promise<boolean | string>',
    description: 'Shows the menu',
  },
  hide: {
    type: '(trigger?: string) => Promise<boolean | string>',
    description: 'Hides the menu',
  },
  toggle: {
    type: '(resolveOnHide?: boolean) => Promise<boolean | string>',
    description: 'Toggles the menu',
  },
  update: {
    type: '() => Promise<void>',
    description: 'Recomputes the position of the open menu',
  },
} as const satisfies ExposedRecord
