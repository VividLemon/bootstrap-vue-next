import type {Ref, Slot} from 'vue'
import type {AttrsValue} from './AnyValuedAttributes'

export interface TabType {
  internalId: string
  id: string
  title?: string
  active: boolean
  buttonId: string
  disabled: boolean
  titleComponent?: Slot
  titleItemAttrs?: Readonly<AttrsValue>
  titleLinkAttrs?: Readonly<AttrsValue>
  onClick?: (event: Event) => void
  navItemAttrs?: Readonly<AttrsValue>
  el: Ref<HTMLElement | null>
}
