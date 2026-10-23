import type { BBadgeProps, BBadgeSlots } from 'bootstrap-vue-next'
import {
  type ComponentReference,
  defaultPropSectionSymbol,
  type PropRecord,
  type SlotRecord,
} from '../../types'
import { linkedBLinkSection, linkProps } from '../../utils/linkProps'
import { pick } from '../../utils/objectUtils'
import { buildCommonProps } from '../../utils/commonProps'

export default {
  load: (): ComponentReference => ({
    BBadge: {
      props: {
        [defaultPropSectionSymbol]: {
          ...pick(
            buildCommonProps({
              variant: {
                default: 'secondary',
              },
            }),
            ['bgVariant', 'variant', 'textVariant'],
          ),
          tag: {
            type: 'string',
            default: 'span',
            description: 'Specify the HTML tag to render instead of the default tag',
          },
        } satisfies PropRecord<Exclude<keyof BBadgeProps, keyof typeof linkProps>>,
        'BLink props': linkedBLinkSection,
      },
      emits: {},
      slots: {
        default: {
          description: 'Content to place in the badge',
          scope: {},
        },
      } satisfies SlotRecord<keyof BBadgeSlots>,
    },
  }),
}
