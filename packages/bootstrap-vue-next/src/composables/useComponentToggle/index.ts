import {
  type ComponentInternalInstance,
  type ComponentPublicInstance,
  computed,
  getCurrentInstance,
  inject,
  type MaybeRefOrGetter,
  nextTick,
  shallowRef,
  toValue,
  watch,
} from 'vue'
import {unrefElement} from '@vueuse/core'

import {type RegisterShowHideMapValue, showHideRegistryKey} from '../../utils/keys'
import {getActiveShowHide} from '../../utils/registryAccess'
import type {ComponentToggleTriggerProps} from '../../types/ComponentToggle'

/**
 * Shows, hides or toggles a show/hide component (BCollapse, BDialog, BOffcanvas, ...), and turns
 * any element into its trigger through `props`.
 *
 * @param id The target's id, several ids (`props` then toggles them all), or nothing for the
 * closest show/hide component around the calling component
 */
export const useComponentToggle = (
  id: MaybeRefOrGetter<string | readonly string[] | undefined> = undefined
) => {
  const instance = getCurrentInstance()
  const storage = inject(showHideRegistryKey, null)

  if (!storage) {
    throw new Error(
      'useComponentToggle() must be called within setup(), and BApp, useRegistry or plugin must be installed/provided.'
    )
  }
  const registry = storage.values
  const findComponent = (
    component: ComponentInternalInstance
  ): ComponentInternalInstance | null => {
    if (!component.parent) {
      return null
    }

    if (
      component.parent.exposed?.['id'] &&
      registry.value.get(toValue(component.parent.exposed.id))
    ) {
      return component.parent
    }

    return findComponent(component.parent)
  }

  const ids = computed<string[]>(() => {
    const resolvedId = toValue(id)
    if (resolvedId === undefined) return []
    const list = typeof resolvedId === 'string' ? resolvedId.split(/\s+/) : [...resolvedId]
    return list.filter((value, index) => value !== '' && list.indexOf(value) === index)
  })

  /** Every target that is mounted right now. The registry is reactive, so late ones join */
  const targets = computed<RegisterShowHideMapValue[]>(() => {
    if (ids.value.length > 0) {
      return ids.value
        .map((targetId) => getActiveShowHide(registry, targetId))
        .filter((target): target is RegisterShowHideMapValue => !!target)
    }
    if (!instance) return []
    const component = findComponent(instance)
    const found = getActiveShowHide(registry, toValue(component?.exposed?.id))
    return found ? [found] : []
  })

  // The first target answers show / hide / toggle, as before multiple ids were accepted
  const myComponent = computed(() => targets.value[0])

  // The trigger elements, from the `ref` in `props`. Several elements may bind the same `props`.
  // Vue calls the ref with an element when one mounts, and with `null` (not saying which) when one
  // unmounts, so after a `null` the elements that left the document are dropped once it's patched
  const triggerElements = shallowRef<ReadonlySet<Element>>(new Set())
  let pruneQueued = false
  const pruneTriggerElements = () => {
    pruneQueued = false
    const connected = [...triggerElements.value].filter((el) => el.isConnected)
    if (connected.length !== triggerElements.value.size) triggerElements.value = new Set(connected)
  }
  const setTriggerElement = (el: Element | ComponentPublicInstance | null) => {
    const element =
      (unrefElement(el as Parameters<typeof unrefElement>[0]) as Element | null | undefined) ?? null
    if (!element) {
      if (!pruneQueued) {
        pruneQueued = true
        void nextTick(pruneTriggerElements)
      }
      return
    }
    // Vue calls the ref on every patch: only a new element changes the set
    if (!triggerElements.value.has(element)) {
      triggerElements.value = new Set([...triggerElements.value, element])
    }
  }

  // Register the triggers with each target. useShowHide then handles clicks (including the Dialog
  // swap) and keeps `aria-expanded` in step; unregistering removes both
  watch(
    [triggerElements, targets],
    ([elements, currentTargets], _old, onCleanup) => {
      for (const el of elements) {
        for (const target of currentTargets) {
          target.unregisterTrigger('click', el, false)
          target.registerTrigger('click', el)
        }
      }
      onCleanup(() => {
        for (const el of elements) {
          for (const target of currentTargets) target.unregisterTrigger('click', el, true)
        }
      })
    },
    {immediate: true, flush: 'post'}
  )

  const props = computed<ComponentToggleTriggerProps>(() => {
    const controls =
      ids.value.length > 0 ? ids.value : targets.value.map((target) => target.id).filter(Boolean)
    return {
      'ref': setTriggerElement,
      'aria-controls': controls.length > 0 ? controls.join(' ') : undefined,
    }
  })

  return {
    value: computed(() => myComponent.value?.value),
    show: (resolveOnHide?: boolean) =>
      myComponent.value?.show(resolveOnHide) || Promise.reject('not found'),
    hide: (trigger?: string) =>
      myComponent.value?.hide(trigger, true) || Promise.reject('not found'),
    toggle: (resolveOnHide?: boolean) =>
      myComponent.value?.toggle(resolveOnHide) || Promise.reject('not found'),
    component: computed(() => myComponent.value?.component),
    /**
     * Bind on the element that should toggle the target(s): `<BButton v-bind="toggle.props">`.
     * Registers it as the trigger (clicks, `aria-expanded`, the Dialog swap) and sets
     * `aria-controls`
     */
    props,
  }
}
