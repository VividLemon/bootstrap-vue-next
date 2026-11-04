import type { BFormGroupProps, BFormGroupSlots } from 'bootstrap-vue-next'
import type { ComponentReference, PropRecord, SlotRecord } from '../../types'
import { pick } from '../../utils/objectUtils'
import { buildCommonProps } from '../../utils/commonProps'

export default {
  load: (): ComponentReference => ({
    BFormGroup: {
      props: {
        ...pick(
          buildCommonProps({
            disabled: {
              description:
                'Disables the fieldset element, which in turn disables the form controls (on browsers that support disabled fieldsets). Has no effect if `label-for` is set',
            },
          }),
          ['ariaInvalid', 'disabled', 'id', 'state', 'tooltip'],
        ),
        contentCols: {
          type: 'Responsive<ColsValue>',
          default: 'undefined',
          description:
            "Number of columns (1 to 12), 'auto', or `true` for an equal-width column, for the content (`{md: 8}` renders `md:col-8`). Takes a responsive object keyed by breakpoint ('xs', 'sm', 'md', 'lg', 'xl', '2xl'). Setting it switches the form group into horizontal layout",
        },
        description: {
          type: 'string',
          default: 'undefined',
          description: 'Text to place in the help text area of the form group',
        },
        feedbackAriaLive: {
          type: 'string',
          default: "'assertive'",
          description: 'Value to use for the `aria-live` attribute on the feedback text',
        },
        floating: {
          type: 'boolean',
          default: 'undefined',
          description: 'When set, renders the label in the floating style',
        },
        invalidFeedback: {
          type: 'string',
          default: 'undefined',
          description: 'Text to show when the form group has an invalid state',
        },
        label: {
          type: 'string',
          default: 'undefined',
          description: 'Text to place in the label/legend of the form group',
        },
        labelAlign: {
          type: 'Responsive<AlignmentTextHorizontal>',
          default: 'undefined',
          description:
            "Text alignment 'start', 'center' or 'end' of the label (`{md: 'end'}` renders `md:text-end`). Takes a responsive object keyed by breakpoint ('xs', 'sm', 'md', 'lg', 'xl', '2xl'); 'xs' has no class prefix",
        },
        labelAttrs: {
          type: 'Readonly<AttrsValue>',
          default: 'undefined',
          description:
            'Attributes to apply to the label/legend element. `class` and `style` merge with the component classes',
        },
        labelCols: {
          type: 'Responsive<ColsValue>',
          default: 'undefined',
          description:
            "Number of columns (1 to 12), 'auto', or `true` for an equal-width column, for the label (`{xs: 12, md: 4}` renders `col-12 md:col-4`). Takes a responsive object keyed by breakpoint ('xs', 'sm', 'md', 'lg', 'xl', '2xl'). Setting it switches the form group into horizontal layout",
        },
        labelFor: {
          type: 'string',
          default: 'undefined',
          description:
            'Set to the ID of the singular form control in the form group. Do not set a value if there is more than one form control in the group',
        },
        labelSize: {
          type: 'string',
          default: 'undefined',
          description:
            "Sets the text size of the label: 'sm' or 'lg'. Use this prop to have the label size match the form control size",
        },
        labelVisuallyHidden: {
          type: 'boolean',
          default: 'false',
          description:
            'Visually hides the label content, but makes it available to screen reader users',
        },
        validFeedback: {
          type: 'string',
          default: 'undefined',
          description: 'Text to show when the form group has a valid state',
        },
      } satisfies PropRecord<keyof BFormGroupProps>,
      emits: {},
      slots: {
        default: {
          description: 'Content to place in the form group',
          scope: {
            ariaDescribedby: {
              type: 'string',
              description:
                'The value for the `aria-describedby` attribute for input elements in the form group. Will be auto-assigned when `label-for` prop is given',
            },
            id: {
              type: 'string',
              description: 'The ID of the form group. Will equal `id` prop, when provided',
            },
            descriptionId: {
              type: 'string',
              description:
                'The ID of the description element. Will be `null` when no description content given',
            },
            labelId: {
              type: 'string',
              description:
                'The ID of the label element. Will be `null` when no description content given',
            },
          },
        },
        description: {
          description: 'Content to place in the description area. Overrides the `description` prop',
        },
        'invalid-feedback': {
          description:
            'Content to place in the invalid feedback area. Overrides the `invalid-feedback` prop',
        },
        label: {
          description: 'Content to place inside the label element. Overrides the `label` prop',
        },
        'valid-feedback': {
          description:
            'Content to place in the valid feedback area. Overrides the `valid-feedback` prop',
        },
      } satisfies SlotRecord<keyof BFormGroupSlots>,
    },
  }),
}
