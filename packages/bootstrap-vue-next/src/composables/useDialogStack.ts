import {tryOnScopeDispose} from '@vueuse/core'
import {inject, readonly, type Ref, ref, shallowRef, watch} from 'vue'
import {dialogStackKey, type DialogStackEntry, type DialogStackValue} from '../utils/keys'

/**
 * A new registry of mounted dialogs and stack of open ones. Provided once per app (the plugin or
 * `useRegistry`), so nothing is shared between apps or SSR requests.
 *
 * The browser's top layer orders open dialogs; the stack is only bookkeeping for `useDialog()`
 * (`show()` / `hide()` without an id, `hideAll()`, `get()`) and for the v6 swap (`v-b-toggle`
 * inside an open dialog), which has to find the dialog it replaces.
 *
 * @internal
 */
export const _newDialogStack = (): DialogStackValue => {
  // Shallow, and replaced on every change: entries hold refs that must not be unwrapped
  const registry = shallowRef<readonly DialogStackEntry[]>([])
  const stack = shallowRef<readonly DialogStackEntry[]>([])

  const register = (entry: DialogStackEntry) => {
    registry.value = [...registry.value, entry]
    const setOpen = (open: boolean) => {
      const without = stack.value.filter((e) => e !== entry)
      stack.value = open ? [...without, entry] : without
    }
    return {
      setOpen,
      unregister() {
        setOpen(false)
        registry.value = registry.value.filter((e) => e !== entry)
      },
    }
  }

  return {registry, stack, register}
}

/**
 * Registers the current dialog and keeps it in the stack of open dialogs while `open` is true.
 *
 * @internal
 */
export const useDialogStack = (entry: DialogStackEntry, open: Readonly<Ref<boolean>>) => {
  const dialogStack = inject(dialogStackKey, null)
  if (!dialogStack) return
  const {setOpen, unregister} = dialogStack.register(entry)
  // A dialog is in the stack exactly while it is open, including one shown on mount
  watch(open, setOpen, {immediate: true})
  tryOnScopeDispose(unregister)
}

/** Bootstrap v6 marks the dialog that opens through a swap; its backdrop starts opaque */
const swapInClass = 'dialog-swap-in'

/**
 * The v6 Dialog swap: a `v-b-toggle` trigger inside an open dialog opens its target dialog
 * (`.dialog-swap-in`) and hides the dialog it sits in at once (`.dialog-instant`), instead of
 * stacking the new dialog on top. Both cancelable events are checked first: the new dialog's
 * `show`, then the current dialog's `hide` (trigger `'swap'`). If either is prevented, neither
 * dialog changes.
 *
 * Pass `onTrigger` and `beforeShowCommit` to `useDialogBase`, bind `swappingIn` to the
 * `dialog-swap-in` class, and call `settle()` whenever the dialog's state leaves `showing`.
 *
 * @internal
 */
export const useDialogSwap = (
  element: Readonly<Ref<HTMLDialogElement | null>>,
  isHidden: () => boolean
) => {
  const dialogStack = inject(dialogStackKey, null)
  const swappingIn = ref(false)
  /** The dialog to hide when the show this trigger starts commits */
  let partner: DialogStackEntry | undefined

  /** Called before a registered trigger toggles the dialog. `true` skips the toggle */
  const onTrigger = (trigger: Element): boolean => {
    const el = element.value
    const current = trigger.closest('dialog[open]')
    if (!el || !current || current === el || !isHidden()) return false
    // v6 ignores triggers in a dialog that is itself still swapping in
    if (current.classList.contains(swapInClass)) return true
    const entry = dialogStack?.stack.value.find((e) => e.element.value === current)
    // Not a dialog of this library: stack on top of it
    if (!entry) return false
    partner = entry
    swappingIn.value = true
    // The toggle runs synchronously after this. If its show never reached the commit (a
    // prevented `toggle` or `show`), forget the swap
    void Promise.resolve().then(() => {
      partner = undefined
      if (isHidden()) swappingIn.value = false
    })
    return false
  }

  /** The new dialog's `show` passed: hide the current one, which may refuse */
  const beforeShowCommit = (): boolean => {
    const current = partner
    partner = undefined
    if (current === undefined) return true
    const swapped = current.hideForSwap()
    if (!swapped) swappingIn.value = false
    return swapped
  }

  const settle = () => {
    swappingIn.value = false
  }

  return {swappingIn: readonly(swappingIn), onTrigger, beforeShowCommit, settle}
}
