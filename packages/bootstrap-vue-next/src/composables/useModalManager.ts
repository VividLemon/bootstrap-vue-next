import {tryOnScopeDispose} from '@vueuse/core'
import {type ComponentInternalInstance, getCurrentInstance, inject, type Ref, watch} from 'vue'
import {modalManagerKey} from '../utils/keys'

export const useSharedModalStack = () => {
  const modalManagerPlugin = inject(modalManagerKey, null)

  /**
   * Removes an item from both the stack and registry
   */
  const dispose = (modal: Readonly<ComponentInternalInstance>): void => {
    modalManagerPlugin?.removeStack(modal)
    modalManagerPlugin?.removeRegistry(modal)
  }

  return {
    ...modalManagerPlugin,
    dispose,
  }
}

/**
 * Registers the current `BDialog` and keeps it in the stack of open dialogs while it is open.
 * The stack is only bookkeeping for `useModal()` (`show` / `hide` / `hideAll` / `get`): the
 * browser's top layer orders open dialogs, so there is no z-index or position math.
 */
export const useModalManager = (modalOpen: Readonly<Ref<boolean>>) => {
  const {pushRegistry, pushStack, removeStack, dispose} = useSharedModalStack()

  const currentModal = getCurrentInstance()

  if (!currentModal || currentModal.type.__name !== 'BDialog') {
    throw new Error('useModalManager must only be used in the BDialog component')
  }

  pushRegistry?.(currentModal)

  tryOnScopeDispose(() => {
    dispose(currentModal)
  })

  // The stack follows `modalOpen` alone, from the start: a dialog is in it exactly while it is
  // open, including one shown on mount and one whose initial show is prevented
  watch(
    modalOpen,
    (open) => {
      if (open) {
        pushStack?.(currentModal)
      } else {
        removeStack?.(currentModal)
      }
    },
    {immediate: true}
  )
}
