import {type ComponentPublicInstance, inject, nextTick, provide, readonly, type Ref, ref} from 'vue'
import type {
  ComponentController,
  ControllerKey,
  OrchestratorShowOptions,
  PromiseWithController,
} from '../../types'
import {BvTriggerableEvent} from '../../utils'
import {orchestratorRegistryKey, type OrchestratorStoreObject} from '../../utils/keys'

/* oxlint-disable-next-line no-explicit-any */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ValueInMapRecord<MapRecord> = MapRecord extends Map<any, infer I> ? I : never

export const buildController = <
  TComponent,
  TStore extends Readonly<Ref<OrchestratorStoreObject[keyof OrchestratorStoreObject]>>,
>(
  id: ControllerKey,
  store: TStore
): PromiseWithController<TComponent, ValueInMapRecord<TStore['value']>> => {
  type RefWithMethods = ComponentPublicInstance<TComponent> & {
    show?: () => void
    hide?: (trigger?: string, noEmit?: boolean) => void
    toggle?: () => void
    visible?: boolean
  }
  const findItem = () => store.value.get(id)

  /**
   * True from a show() request until the component reports its dismissal. The store only learns
   * that the component is open once its show is revealed, and a show can still be waiting for its
   * frame or delay
   */
  let showRequested = false
  /**
   * The dismissal the current show/hide cycle is waiting for. Each cycle gets its own, so a
   * controller can be shown again after it was dismissed
   */
  let dismissal:
    {promise: Promise<BvTriggerableEvent>; resolve: (e: BvTriggerableEvent) => void} | undefined
  const nextDismissal = (): Promise<BvTriggerableEvent> => {
    if (!dismissal) {
      let resolve: (e: BvTriggerableEvent) => void = () => {}
      const promise = new Promise<BvTriggerableEvent>((r) => {
        resolve = r
      })
      dismissal = {promise, resolve}
    }
    return dismissal.promise
  }
  /**
   * Called with the component's hide or hidden event (or one made up when the component can't emit)
   */
  const settle = (event: BvTriggerableEvent) => {
    showRequested = false
    const current = dismissal
    dismissal = undefined
    current?.resolve(event)
  }

  const controller = {
    id,
    ref: null as RefWithMethods | null,
    async show({signal}: OrchestratorShowOptions = {}) {
      const withDispose = (event: BvTriggerableEvent) =>
        Object.assign(Object.create(event), {
          [Symbol.asyncDispose]: controller.destroy,
        })
      const currentModelValue = controller.get()?.value.props.modelValue
      // The stored modelValue misses visibility changes made through the component's own show(),
      // which this method uses once the component is mounted, so also ask the component
      const isShown =
        !!currentModelValue ||
        showRequested ||
        (controller.ref as RefWithMethods | null)?.visible === true
      if (signal?.aborted && !isShown) {
        return withDispose(new BvTriggerableEvent('hidden', {trigger: 'abort', ok: null}))
      }
      // Taken before anything below can settle it
      const dismissed = nextDismissal()
      const abort = () => controller.hide('abort')
      signal?.addEventListener('abort', abort, {once: true})
      try {
        if (signal?.aborted) {
          abort()
        } else if (!currentModelValue) {
          showRequested = true
          const refWithMethods = controller.ref
          if (
            refWithMethods !== null &&
            'show' in refWithMethods &&
            typeof refWithMethods.show === 'function'
          ) {
            refWithMethods.show()
          } else {
            controller.set({modelValue: true})
          }
          // A show listener may have aborted while the show was being requested, before there was
          // anything to hide. Hide now that the show is committed
          if (signal?.aborted) abort()
        }
        return withDispose(await dismissed)
      } finally {
        signal?.removeEventListener('abort', abort)
      }
    },
    hide(trigger?: string) {
      const refWithMethods = controller.ref
      if (
        refWithMethods !== null &&
        'hide' in refWithMethods &&
        typeof refWithMethods.hide === 'function'
      ) {
        refWithMethods.hide(trigger, true)
      } else {
        controller.set({modelValue: false})
        // A component that has not mounted can't emit a hidden event, so settle for it
        if (refWithMethods === null) {
          settle(new BvTriggerableEvent('hidden', {trigger: trigger ?? null, ok: null}))
        }
      }
    },
    toggle() {
      const currentItem = controller.get()
      const refWithMethods = controller.ref
      if (
        refWithMethods !== null &&
        'toggle' in refWithMethods &&
        typeof refWithMethods.toggle === 'function'
      ) {
        refWithMethods.toggle()
      } else {
        controller.set({modelValue: !currentItem?.value.props.modelValue})
      }
    },
    get: findItem,
    set(val: Partial<ValueInMapRecord<TStore['value']>['value']['props']>) {
      const current = findItem()
      if (current?.value) {
        current.value = {
          ...current.value,
          props: {
            ...current.value.props,
            ...val,
            /* oxlint-disable no-explicit-any */
            /* eslint-disable @typescript-eslint/no-explicit-any */
          } as any,
        }
      }
    },
    async destroy() {
      const item = findItem()
      if (!item) return
      try {
        if (item.value.props.modelValue || showRequested) {
          const dismissed = nextDismissal()
          controller.hide('destroy')
          await dismissed
          await nextTick()
        }
      } finally {
        store.value.delete(id)
        // Nothing can emit for a removed item, so settle a show() that is still waiting
        settle(new BvTriggerableEvent('hidden', {trigger: 'destroy', ok: null}))
      }
    },
    [Symbol.asyncDispose]() {
      return controller.destroy()
    },
  } as ComponentController<TComponent, ValueInMapRecord<TStore['value']>>

  return {
    controller,
    resolve: settle,
  }
}

export const _newOrchestratorRegistry = (): {
  store: Readonly<Ref<OrchestratorStoreObject>>
  _isToastAppend: Readonly<Ref<boolean>>
  _setToastAppend: (value: boolean) => void
  _isOrchestratorInstalled: Readonly<Ref<boolean>>
  _setOrchestratorInstalled: (value: boolean) => void
} => {
  const _isOrchestratorInstalled = ref(false)
  const _isToastAppend = ref(false)

  return {
    store: ref({
      modal: new Map(),
      tooltip: new Map(),
      popover: new Map(),
      toast: new Map(),
    }),
    _isOrchestratorInstalled: readonly(_isOrchestratorInstalled),
    _setOrchestratorInstalled: (v) => {
      _isOrchestratorInstalled.value = v
    },
    _isToastAppend: readonly(_isToastAppend),
    _setToastAppend: (v) => {
      _isToastAppend.value = v
    },
  }
}

export const useOrchestratorRegistry = () => {
  const orchestratorRegistry = inject(orchestratorRegistryKey, null)

  if (orchestratorRegistry) {
    return orchestratorRegistry
  }
  const newOrchestratorRegistry = _newOrchestratorRegistry()
  provide(orchestratorRegistryKey, newOrchestratorRegistry)
  return newOrchestratorRegistry
}

export const getOrchestratorControllerId = (propId: string | undefined) => {
  const id: ControllerKey = propId || Symbol('OrchestratorItem')

  return {
    /**
     * This id is used for stability in the store, using the createIdWatcher will update the store if the id ever changes
     */
    storeId: id,
    /**
     * Do not pass in the symbol as a prop. Html attribute cannot be a symbol. Thus it's internal
     */
    htmlAttributeId: typeof id === 'string' ? id : undefined,
  }
}
