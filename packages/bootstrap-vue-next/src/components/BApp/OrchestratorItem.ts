import {defineComponent, onMounted, type PropType, provide} from 'vue'
import {orchestratorItemKey} from '../../utils/keys'
import type {OrchestratorItemLink} from '../../types/ComponentOrchestratorTypes'
import {warn} from '../../utils/console'

/**
 * Wraps one item `BOrchestrator` renders. It provides the item's link, through which the first
 * show/hide component inside connects its state machine to the item's controller.
 *
 * @internal
 */
export default defineComponent({
  name: 'BOrchestratorItem',
  props: {
    link: {type: Object as PropType<OrchestratorItemLink>, required: true},
  },
  setup(props, {slots}) {
    provide(orchestratorItemKey, props.link)
    onMounted(() => {
      // Children mount first, so a show/hide component has connected by now
      if (!props.link.connected()) {
        warn(
          'BOrchestrator',
          'An orchestrated item rendered no show/hide component (such as BDialog, BToast or BPopover), so its controller cannot show or hide it.'
        )
      }
    })
    return () => slots.default?.()
  },
})
