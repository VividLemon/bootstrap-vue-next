import type {ComponentPublicInstance} from 'vue'

/**
 * Props for the element that toggles a show/hide component. Bind them with `v-bind="props"` on
 * the trigger, or on several triggers: the `ref` registers each as the component's trigger (click handling, the
 * `aria-expanded` state, and the Dialog swap), and `aria-controls` names the target(s).
 */
export interface ComponentToggleTriggerProps {
  'ref': (el: Element | ComponentPublicInstance | null) => void
  'aria-controls': string | undefined
}
