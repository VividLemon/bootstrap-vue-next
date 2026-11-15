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
export const useModalManager = (modalOpen: Readonly<Ref<boolean>>, initialValue: boolean) => {
  const {pushRegistry, pushStack, removeStack, dispose} = useSharedModalStack()

  const currentModal = getCurrentInstance()

  if (!currentModal || currentModal.type.__name !== 'BDialog') {
    throw new Error('useModalManager must only be used in the BDialog component')
  }

  pushRegistry?.(currentModal)

  tryOnScopeDispose(() => {
    dispose(currentModal)
  })

  const setInStack = (newValue: boolean, oldValue: boolean) => {
    if (newValue) {
      pushStack?.(currentModal)
    } else if (oldValue && !newValue) {
      removeStack?.(currentModal)
    }
  }

  // (initialValue, initialValue) is meant to always only ever trigger the first `if (newValue) {` block. The other block is skipped _always_
  setInStack(initialValue, initialValue)

  watch(modalOpen, setInStack)
}
