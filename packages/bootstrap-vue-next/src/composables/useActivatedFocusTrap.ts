import {type MaybeRefOrGetter, onMounted, readonly, ref, type Ref, toRef, watch} from 'vue'
import {useFocusTrap, type UseFocusTrapOptions} from '@vueuse/integrations/useFocusTrap'
import {useMutationObserver} from '@vueuse/core'

export const useActivatedFocusTrap = (
  {
    element,
    isActive,
    noTrap,
    fallbackFocus,
    focus,
  }: {
    element: Ref<HTMLElement | null>
    isActive: MaybeRefOrGetter<boolean>
    noTrap: MaybeRefOrGetter<boolean>
    /**
     * We need this in the case when there are no focusable elements in the trap. So elements that use this need to implement a fallback focus element.
     *
     * Use the `needsFallback` ref to check if you can v-if the element or not. So it's not included in the component tree when not needed.
     */
    fallbackFocus: {
      ref: Ref<HTMLElement | null>
      /**
       * The fallback focus element needs some specific selector to ensure it's not included when checking for focusable elements
       */
      classSelector: string
    }
    focus: () => HTMLElement | boolean | undefined
  },
  focusTrapOpts: UseFocusTrapOptions = {
    allowOutsideClick: true,
    fallbackFocus: fallbackFocus.ref.value ?? undefined,
    escapeDeactivates: false,
    clickOutsideDeactivates: false,
    initialFocus: focus,
  }
) => {
  const resolvedIsActive = readonly(toRef(isActive))
  const resolvedNoTrap = readonly(toRef(noTrap))

  const checkNeedsFallback = () => {
    const tabbableElements = element.value?.querySelectorAll(
      `a, button, input, select, textarea, [tabindex]:not([tabindex="-1"]):not(.${fallbackFocus.classSelector})`
    )
    return !tabbableElements?.length
  }
  const needsFallback = ref(false)
  onMounted(() => {
    needsFallback.value = checkNeedsFallback()
    useMutationObserver(
      element,
      () => {
        needsFallback.value = checkNeedsFallback()
      },
      {childList: true, subtree: true}
    )
  })

  const trap = useFocusTrap(element, focusTrapOpts)
  watch(resolvedIsActive, async (newValue) => {
    if (newValue && resolvedNoTrap.value === false) {
      trap.activate()
    } else {
      trap.deactivate()
    }
  })

  watch(resolvedNoTrap, (newValue) => {
    if (newValue === true) {
      trap.deactivate()
    }
  })

  return {
    needsFallback: readonly(needsFallback),
  }
}
