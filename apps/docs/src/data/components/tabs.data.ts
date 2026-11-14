import type { BTabProps, BTabsEmits, BTabsProps, BTabsSlots } from 'bootstrap-vue-next'
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
import { showHideProps } from '../../utils/showHideData'

export default {
  load: (): ComponentReference => ({
    BTabs: {
      sourcePath: '/BTabs/BTabs.vue',
      props: {
        ...pick(buildCommonProps(), ['id', 'tag']),
        index: {
          type: 'number',
          default: -1, // TODO item not in string format
          description:
            'Sets the zero-based index of the active tab. The `modelValue` (tab ID) takes priority over `index`.',
        },
        activeNavItemAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            "Attributes for the active tab's control button (`.nav-link`). `class` and `style` merge with the component's own.",
        },
        activeNavLinkAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            "Attributes for the active tab's control button (`.nav-link`). Applied after `activeNavItemAttrs`. `class` and `style` merge with the component's own.",
        },
        activeTabAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            "Attributes for the active tab pane. `class` and `style` merge with the component's own.",
        },
        align: {
          type: 'AlignmentJustifyContent',
          default: undefined,
          description:
            "Aligns the nav items: 'start', 'end', 'center', 'between', 'around', or 'evenly'.",
        },
        card: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description: 'Applies styles for tabs placed within a `BCard` component.',
        },
        contentAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            "Attributes for the `.tab-content` wrapper. `class` and `style` merge with the component's own.",
        },
        end: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description:
            'Positions tab controls at the bottom (horizontal tabs) or right (vertical tabs).',
        },
        fill: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description:
            'Proportionately fills horizontal space with nav items, with varying widths.',
        },
        inactiveNavItemAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            "Attributes for inactive tab control buttons (`.nav-link`). `class` and `style` merge with the component's own.",
        },
        inactiveNavLinkAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            "Attributes for inactive tab control buttons (`.nav-link`). Applied after `inactiveNavItemAttrs`. `class` and `style` merge with the component's own.",
        },
        inactiveTabAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            "Attributes for inactive tab panes. `class` and `style` merge with the component's own.",
        },
        justified: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description: 'Fills horizontal space with nav items, each having equal width.',
        },
        lazy: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description: 'Lazily renders tab contents when shown.',
        },
        modelValue: {
          type: 'string',
          default: undefined,
          description: 'Sets the ID of the active tab.',
        },
        navAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            "Attributes for the tablist (`ul.nav`). `class` and `style` merge with the component's own.",
        },
        navItemAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            "Attributes for every tab control button (`.nav-link`). `class` and `style` merge with the component's own.",
        },
        navWrapperAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            "Attributes for the element that wraps the tab controls. `class` and `style` merge with the component's own.",
        },
        noTransition: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description:
            'Disables the fade-in of the newly active tab pane (adds `tab-pane-instant` to each pane).',
        },
        noKeyNav: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description: 'Disables keyboard navigation for the tab controls.',
        },
        noNavStyle: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description: 'Disables tab styling for the tab controls.',
        },
        pills: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description: 'Renders nav items as pill buttons.',
        },
        small: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description: 'Renders the nav with a smaller size.',
        },
        underline: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description: 'Renders the active nav item with an underline.',
        },
        tabAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            "Attributes for every tab pane. `class` and `style` merge with the component's own.",
        },
        vertical: {
          type: 'boolean',
          default: false, // TODO item not in string format
          description:
            'Renders the tab controls vertically (`flex-column`, or `nav-pills-vertical` with `pills`).',
        },
      } satisfies PropRecord<keyof BTabsProps>,
      emits: {
        'update:model-value': {
          description: 'Emitted when the active tab changes, providing the ID of the active tab.', // TODO similar content to BAlert/update:model-value (similar purpose)
          args: {
            value: {
              type: 'string',
              description: 'The ID of the currently active tab.',
            },
          },
        },
        'update:index': {
          description:
            'Emitted when the active tab changes, providing the zero-based index of the active tab.',
          args: {
            value: {
              type: 'number',
              description: 'The zero-based index of the currently active tab.',
            },
          },
        },
        'activate-tab': {
          description: 'Emitted before a tab is shown or activated. Cancelable.',
          args: {
            value: {
              type: '{newTabId: string; prevTabId: string; newTabIndex: number; prevTabIndex: number; event: BvEvent}',
              description:
                'Object payload with the activating tab id/index, previous tab id/index, and the cancelable BvEvent.',
            },
          },
        },
      } satisfies EmitRecord<keyof BTabsEmits | 'update:index' | 'update:model-value'>,
      slots: {
        default: {
          description: 'Content (tabs) for the tabs element.',
        },
        empty: {
          description: 'Content to render when no tabs are present.',
        },
        'tabs-end': {
          description: 'Additional tab buttons without content, placed after content tab buttons.',
        },
        'tabs-start': {
          description: 'Additional tab buttons without content, placed before content tab buttons.',
        },
      } satisfies SlotRecord<keyof BTabsSlots>,
    },
    BTab: {
      styleSpec: { kind: StyleKind.OverrideClass, value: '.tab-pane' },
      sourcePath: '/BTabs/BTab.vue',
      props: {
        ...pick(showHideProps, ['lazy', 'unmountLazy']),
        ...pick(buildCommonProps(), ['active', 'disabled', 'id', 'tag', 'title']),
        buttonId: {
          type: 'string',
          default: undefined,
          description:
            "Use a specific ID for this tab's tab control button. If not provided, one will automatically be generated",
        },
        noBody: {
          type: 'boolean',
          default: false,
          description:
            "When the parent b-tabs has the 'card' prop set, do not render a card-body wrapper",
        },
        titleItemAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            "Attributes to apply to the tab's control `li` element. `class` and `style` merge with the component's own",
        },
        titleLinkAttrs: {
          type: 'Readonly<AttrsValue>',
          default: undefined,
          description:
            "Attributes to apply to the tab's control button (`.nav-link`). `class` and `style` merge with the component's own",
        },
      } satisfies PropRecord<keyof BTabProps>,
      exposed: {
        activate: {
          type: '() => void',
          description: 'Activates the tab',
        },
        deactivate: {
          type: '() => void',
          description: 'Deactivates the tab',
        },
      } satisfies ExposedRecord,
    },
  }),
}
