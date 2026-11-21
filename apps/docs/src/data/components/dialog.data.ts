import type {
  BDialogActionsProps,
  BDialogActionsSlots,
  BDialogEmits,
  BDialogProps,
  BDialogSlots,
} from 'bootstrap-vue-next'
import type {
  ComponentReference,
  EmitRecord,
  ExposedRecord,
  PropRecord,
  SlotRecord,
  SlotScopeReference,
} from '../../types'
import { pick } from '../../utils/objectUtils'
import { buildCommonProps } from '../../utils/commonProps'
import { bvTriggerableEventArg, showHideEmits, showHideProps } from '../../utils/showHideData'

const sharedSlots: SlotScopeReference = {
  active: {
    type: 'boolean',
    description: '`true` from the start of a show until the dialog is hidden',
  },
  cancel: {
    type: '() => void',
    description: "Hides the dialog with `trigger = 'cancel'`",
  },
  close: {
    type: '() => void',
    description: "Hides the dialog with `trigger = 'close'`",
  },
  hide: {
    type: '(trigger?: string, value?: unknown) => Promise<boolean | string>',
    description:
      "Hides the dialog. `trigger` is passed to the `hide` and `hidden` events, `value` becomes the exposed `returnValue`. Resolves with the trigger (or `''`) once hidden, `'hide-prevented'` when prevented, or `false` when interrupted by a newer show/hide",
  },
  id: {
    type: 'string',
    description: 'The id of the dialog element',
  },
  ok: {
    type: '(value?: unknown) => void',
    description:
      "Emits the cancelable `ok` event, then hides the dialog with `trigger = 'ok'`. `value` becomes the exposed `returnValue`",
  },
  show: {
    type: '() => Promise<boolean | string>',
    description:
      "Shows the dialog. Resolves `true` once shown, `'show-prevented'` when prevented, or `false` when interrupted by a newer show/hide. Takes no arguments",
  },
  toggle: {
    type: '() => Promise<boolean | string>',
    description: 'Shows or hides the dialog. Resolves like `show` / `hide`. Takes no arguments',
  },
  visible: {
    type: 'boolean',
    description: '`true` while the dialog is shown or showing',
  },
} as const

export default {
  load: (): ComponentReference => ({
    BDialog: {
      props: {
        ...showHideProps,
        ...pick(
          buildCommonProps({
            footerColor: {
              type: 'ColorBorderExtendables',
              description:
                'Color object for the footer: `theme`, `bg`, `fg` and `border` keys render `theme-*`, `bg-*`, `fg-*` and `border-*` classes. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
            },
            headerColor: {
              type: 'ColorBorderExtendables',
              description:
                'Color object for the header: `theme`, `bg`, `fg` and `border` keys render `theme-*`, `bg-*`, `fg-*` and `border-*` classes. See [Prefixed color objects](/docs/reference/color-variants#prefixed-color-objects)',
            },
            titleTag: {
              default: 'h5',
            },
          }),
          [
            'body',
            'bodyAttrs',
            'bodyColor',
            'footerColor',
            'headerColor',
            'id',
            'noHeader',
            'noHeaderClose',
            'title',
            'titleTag',
          ],
        ),
        backdrop: {
          type: "boolean | 'static'",
          default: true,
          description:
            "What a click on the backdrop does: `true` hides the dialog (trigger `'backdrop'`), `'static'` refuses with a short bounce and emits `hide-prevented`, `false` ignores the click. A non-modal dialog has no backdrop",
        },
        focus: {
          type: "'ok' | 'cancel' | 'close'",
          default: undefined,
          description:
            'Puts `autofocus` on a built-in button: the header close button, or the OK / Cancel button of `BDialogActions`. For anything else, set `autofocus` on an element in the content',
        },
        footerAttrs: {
          type: 'AttrsValue',
          default: undefined,
          description:
            'Attributes for the `.dialog-footer` element. `class` and `style` are merged',
        },
        fullscreen: {
          type: 'boolean | Breakpoint',
          default: false,
          description:
            "`true` makes the dialog fullscreen (`.dialog-fullscreen`). A breakpoint makes it fullscreen below that breakpoint (for example `'md'` renders `md-down:dialog-fullscreen`)",
        },
        headerAttrs: {
          type: 'AttrsValue',
          default: undefined,
          description:
            'Attributes for the `.dialog-header` element. `class` and `style` are merged',
        },
        headerClose: {
          type: '{ label?: string; attrs?: AttrsValue }',
          default: undefined,
          description:
            "Options for the header close button: `label` is its `aria-label` (default `'Close'`), `attrs` are bound to the button. To replace the button, use the `header-close` slot",
        },
        keyboard: {
          type: 'boolean',
          default: true,
          description:
            'Whether <kbd>Esc</kbd> hides the dialog (trigger `\'esc\'`). When `false`, the dialog refuses with a short bounce, emits `hide-prevented` and renders `closedby="none"`',
        },
        modal: {
          type: 'boolean',
          default: true,
          description:
            'Opens the dialog as a modal dialog (`showModal()`): top layer, backdrop, focus containment, the rest of the page inert, page scroll locked. `false` opens a non-modal dialog (`show()`, `.dialog-nonmodal`) that leaves the page usable',
        },
        modelValue: {
          type: 'boolean',
          default: false,
          description: 'Controls the visibility of the dialog',
        },
        scrollable: {
          type: 'boolean',
          default: false,
          description: 'Makes the dialog body scroll when the content is taller than the viewport',
        },
        size: {
          type: "'sm' | 'lg' | 'xl'",
          default: undefined,
          description: "Sets the dialog's width (`.dialog-sm`, `.dialog-lg`, `.dialog-xl`)",
        },
        slide: {
          type: "'down' | 'up'",
          default: undefined,
          description:
            'Slides the dialog in from above (`down`) or below (`up`) on top of the default fade',
        },
        titleAttrs: {
          type: 'AttrsValue',
          default: undefined,
          description:
            "Attributes for the `.dialog-title` element. `class` and `style` are merged, for example `{ class: 'visually-hidden' }`",
        },
      } satisfies PropRecord<keyof BDialogProps>,
      emits: {
        ...showHideEmits,
        'update:model-value': {
          description: 'Emitted when the dialog visibility changes',
          args: {
            value: {
              type: 'boolean',
              description: 'The new visibility of the dialog',
            },
          },
        },
        cancel: {
          description:
            "Emitted on a close request (the <kbd>Esc</kbd> key), before `hide`. Cancelable. The Cancel button has no event of its own: read `trigger === 'cancel'` from `hide`",
          args: {
            value: bvTriggerableEventArg,
          },
        },
        ok: {
          description:
            'Emitted when `ok()` is called (for example by the `BDialogActions` OK button), before `hide`. Cancelable, so it is the place to validate before closing',
          args: {
            value: bvTriggerableEventArg,
          },
        },
      } satisfies EmitRecord<keyof BDialogEmits | 'update:model-value'>,
      slots: {
        default: {
          description: 'Content for the dialog body',
          scope: sharedSlots,
        },
        footer: {
          description:
            'Content for the dialog footer. The footer is only rendered when this slot has content',
          scope: sharedSlots,
        },
        header: {
          description: 'Replaces the content of the header, including the title and close button',
          scope: sharedSlots,
        },
        'header-close': {
          description: "Replaces the header close button. Not used when the 'header' slot is used",
          scope: sharedSlots,
        },
        title: {
          description: "Content for the dialog title. Not used when the 'header' slot is used",
          scope: sharedSlots,
        },
      } satisfies SlotRecord<keyof BDialogSlots>,
      exposed: {
        show: {
          type: '() => Promise<boolean | string>',
          description: 'Shows the dialog',
        },
        hide: {
          type: '(trigger?: string, value?: unknown) => Promise<boolean | string>',
          description:
            'Hides the dialog. `trigger` is included in the `hide` and `hidden` events, `value` becomes `returnValue`',
        },
        toggle: {
          type: '() => Promise<boolean | string>',
          description: 'Toggles the visibility of the dialog',
        },
        id: {
          type: 'string',
          description: 'The id of the dialog element',
        },
        visible: {
          type: 'boolean',
          description: '`true` while the dialog is shown or showing',
        },
        returnValue: {
          type: 'unknown',
          description:
            'The `value` passed to the `hide()` / `ok()` that closed the dialog last, or the value of the `<form method="dialog">` submit button. Reset when the dialog is shown again',
        },
      } satisfies ExposedRecord,
    },
    BDialogActions: {
      props: {
        cancelAttrs: {
          type: 'AttrsValue',
          default: undefined,
          description:
            "Attributes and `BButton` props for the Cancel button, for example `{ variant: 'outline', color: { theme: 'danger' }, size: 'sm', class: '...' }`",
        },
        cancelDisabled: {
          type: 'boolean',
          default: false,
          description: 'Disables the Cancel button',
        },
        cancelTitle: {
          type: 'string',
          default: 'Cancel',
          description: 'Text of the Cancel button',
        },
        okAttrs: {
          type: 'AttrsValue',
          default: undefined,
          description: 'Attributes and `BButton` props for the OK button',
        },
        okDisabled: {
          type: 'boolean',
          default: false,
          description: 'Disables the OK button',
        },
        okOnly: {
          type: 'boolean',
          default: false,
          description: 'Renders only the OK button',
        },
        okTitle: {
          type: 'string',
          default: 'OK',
          description: 'Text of the OK button',
        },
      } satisfies PropRecord<keyof BDialogActionsProps>,
      slots: {
        cancel: {
          description: 'Content of the Cancel button',
          scope: {},
        },
        ok: {
          description: 'Content of the OK button',
          scope: {},
        },
      } satisfies SlotRecord<keyof BDialogActionsSlots>,
    },
  }),
}
