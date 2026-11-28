import {
  type ComponentPublicInstance,
  inject,
  provide,
  readonly,
  type Ref,
  ref,
  shallowReactive,
  shallowRef,
} from 'vue'
import type {
  ComponentController,
  ControllerKey,
  OrchestratedShowHide,
  OrchestratorArrayValue,
  OrchestratorCreateOptions,
  OrchestratorItemConnection,
  OrchestratorItemLink,
  OrchestratorShowOptions,
  PromiseWithController,
} from '../../types'
import type {ShowHideState} from '../showHideMachine'
import {BvTriggerableEvent} from '../../utils'
import {orchestratorRegistryKey, type OrchestratorStoreObject} from '../../utils/keys'

/* oxlint-disable-next-line no-explicit-any */
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ValueInMapRecord<MapRecord> = MapRecord extends Map<any, infer I> ? I : never

export interface BuildControllerOptions<TResult> {
  /** The `create()` options: defaults for every show */
  createOptions?: Readonly<OrchestratorCreateOptions>
  /**
   * Turns the event that settled a cycle into what `show()` resolves with. Runs once the
   * component's hide call has returned, so state it sets while hiding (BDialog's
   * `returnValue`) can be read from `instance`
   */
  toResult?: (event: BvTriggerableEvent, instance: unknown) => TResult
}

/**
 * The controller as the library sees it: `state` is internal, not part of `ComponentController`
 *
 * @internal
 */
export type InternalComponentController<
  TComponent,
  TItem extends Ref<OrchestratorArrayValue>,
  TResult extends object,
> = ComponentController<TComponent, TItem, TResult> & {
  /**
   * Where the item is in its show/hide lifecycle: the connected component's machine state. An
   * item without a mounted component is `showing` while a show waits for it to mount
   */
  readonly state: ShowHideState
}

/** One `show()` call's wait: from the show until the hide that ends it */
interface Cycle {
  readonly promise: Promise<BvTriggerableEvent>
  readonly resolve: (event: BvTriggerableEvent) => void
  /** Settles on the `hide` that starts hiding rather than on `hidden` */
  resolveOnHide: boolean
  /** The `show({signal})` of the call that opened it. Aborting it hides the item */
  signal: AbortSignal | undefined
}

/**
 * Builds the controller `create()` returns. The single source of truth for whether the item is
 * shown is the state machine of the show/hide component the item renders: it connects through
 * `fns.link` when it is set up, and the controller sends it requests and reads its state and
 * events. The store item only says what to render.
 *
 * Results are per cycle: each `show()` waits for the hide that ends the cycle it opened or
 * joined, and only that hide (or the prevention of its own show) settles it.
 */
export const buildController = <
  TComponent,
  TItems extends OrchestratorStoreObject[keyof OrchestratorStoreObject],
  TResult extends object = BvTriggerableEvent,
>(
  id: ControllerKey,
  /** The store's reactive map for this kind of item. The registry never replaces it */
  items: TItems,
  {createOptions = {}, toResult}: BuildControllerOptions<TResult> = {}
): PromiseWithController<TComponent, ValueInMapRecord<TItems>, TResult> => {
  type Item = ValueInMapRecord<TItems>
  const findItem = (): Item | undefined => items.get(id) as Item | undefined

  /** The connected component's machine. Set from its setup until it unmounts */
  let showHide: OrchestratedShowHide | undefined
  /** The connected component mounted: requests can reach it */
  let mounted = false
  /**
   * A show was asked for while no mounted component could take it. The component requests it
   * once it mounts; a hide before that cancels it
   */
  let showPending = false
  /** The open cycle, if any. Cleared in the same step that settles it */
  let cycle: Cycle | undefined
  /**
   * Set while this controller's own show request runs (its listeners are called synchronously),
   * to the cycle it shows. Lets the `show` and `show-prevented` events be attributed to it
   */
  let ownShowRequest: {cycle: Cycle | undefined} | undefined
  /** The `hide` event of the last hide request, for the cycle that settles when it commits */
  let lastHideEvent: BvTriggerableEvent | undefined
  let destroyed = false

  // Backs controller.ref. Shallow because component instances must not be made deeply reactive
  const instance = shallowRef<ComponentPublicInstance<TComponent> | null>(null)

  const newCycle = (): Cycle => {
    let resolve: (event: BvTriggerableEvent) => void = () => {}
    const promise = new Promise<BvTriggerableEvent>((r) => {
      resolve = r
    })
    return {
      promise,
      resolve,
      resolveOnHide: createOptions.resolveOnHide === true,
      signal: undefined,
    }
  }

  const settle = (current: Cycle | undefined, event: BvTriggerableEvent) => {
    if (!current || cycle !== current) return
    cycle = undefined
    current.resolve(event)
  }

  /** `showing` or `shown`, or a show waiting for the component to mount */
  const isShowing = (): boolean =>
    mounted && showHide
      ? showHide.state.value === 'showing' || showHide.state.value === 'shown'
      : showPending

  const state = (): ShowHideState =>
    mounted && showHide ? showHide.state.value : showPending ? 'showing' : 'hidden'

  /**
   * A toast created with a numeric `modelValue` counts it down to 0. Showing it again has to put
   * the countdown back, since the component only counts down a numeric `modelValue`
   */
  const restoreCountdown = (target: OrchestratedShowHide) => {
    const countdown = findItem()?.value.props.modelValue
    if (typeof countdown === 'number' && countdown > 0 && !target.model()) {
      target.setModel(countdown)
    }
  }

  /** Sends a show request to the mounted component, attributing its outcome to `forCycle` */
  const requestShow = (target: OrchestratedShowHide, forCycle: Cycle | undefined) => {
    restoreCountdown(target)
    const request = {cycle: forCycle}
    const previous = ownShowRequest
    ownShowRequest = request
    let result: Promise<boolean | string>
    try {
      result = target.show()
    } finally {
      ownShowRequest = previous
    }
    // A disabled component refuses without events
    void result.then((value) => {
      if (value === 'show-prevented') settle(forCycle, new BvTriggerableEvent('show-prevented'))
    })
  }

  const connection: OrchestratorItemConnection = {
    onEvent: (event) => {
      switch (event.eventType) {
        case 'show': {
          // Aborting during the show request (in an `onShow` listener) prevents the show: there
          // is nothing to hide yet
          if (ownShowRequest?.cycle?.signal?.aborted) event.preventDefault()
          break
        }
        case 'show-prevented': {
          // Any entry point can emit it; only the request this controller made ends a cycle
          const request = ownShowRequest
          if (!request) break
          settle(
            request.cycle,
            request.cycle?.signal?.aborted
              ? new BvTriggerableEvent('hidden', {trigger: 'abort'})
              : event
          )
          break
        }
        case 'hide': {
          if (!event.defaultPrevented) lastHideEvent = event
          break
        }
        case 'hidden': {
          settle(cycle, event)
          break
        }
      }
    },
    onState: (next) => {
      if (next === 'hiding' && cycle?.resolveOnHide && lastHideEvent) {
        settle(cycle, lastHideEvent)
      }
    },
    mounted: () => {
      mounted = true
      if (!showPending || !showHide) return
      showPending = false
      requestShow(showHide, cycle)
    },
    disconnect: () => {
      showHide = undefined
      mounted = false
      // The machine settles its own requests silently when it is disposed; so does this cycle
      settle(cycle, new BvTriggerableEvent('hidden', {trigger: 'dispose'}))
    },
  }

  const link: OrchestratorItemLink = {
    connect: (target) => {
      showHide = target
      mounted = false
      return connection
    },
    connected: () => showHide !== undefined,
  }

  /** Shows the item: through its mounted component, or once one mounts */
  const startShow = (forCycle: Cycle | undefined) => {
    if (isShowing()) return
    if (showHide && mounted) {
      requestShow(showHide, forCycle)
    } else {
      showPending = true
    }
  }

  const hide = (trigger?: string) => {
    if (showHide && mounted) {
      void showHide.hide(trigger)
      return
    }
    // Nothing is on screen: cancel the show waiting for the component
    showPending = false
    // A `modelValue` from the item's props would still show it when it mounts
    const item = findItem()
    if (item?.value.props.modelValue) controller.set({modelValue: false} as never)
    settle(cycle, new BvTriggerableEvent('hidden', {trigger: trigger ?? null}))
  }

  const toResultWithDispose = (event: BvTriggerableEvent) => {
    const dispose = {[Symbol.asyncDispose]: controller.destroy}
    // A plain result is copied; an event keeps its prototype (getters such as `defaultPrevented`)
    return toResult
      ? Object.assign({...toResult(event, instance.value)}, dispose)
      : Object.assign(Object.create(event), dispose)
  }

  const controller = {
    id,
    // A getter so the public API keeps returning the instance itself rather than the ref
    // v100 TODO: expose it as `ref: readonly(instance)`. Exposing a Ref is a breaking change, so it waits for a major
    get ref() {
      return instance.value
    },
    set ref(value: ComponentPublicInstance<TComponent> | null) {
      instance.value = value
    },
    get state() {
      return state()
    },
    async show({signal, resolveOnHide}: OrchestratorShowOptions = {}) {
      if (signal?.aborted && !isShowing()) {
        return toResultWithDispose(new BvTriggerableEvent('hidden', {trigger: 'abort'}))
      }
      // Joining the open cycle overrides its settings too
      const current = (cycle ??= newCycle())
      current.resolveOnHide = resolveOnHide ?? createOptions.resolveOnHide === true
      if (signal) current.signal = signal
      const abort = () => {
        // During this controller's own show request, the `show` event is prevented instead
        if (ownShowRequest?.cycle === current) return
        hide('abort')
      }
      signal?.addEventListener('abort', abort, {once: true})
      try {
        if (signal?.aborted) {
          hide('abort')
        } else {
          startShow(current)
        }
        return toResultWithDispose(await current.promise)
      } finally {
        signal?.removeEventListener('abort', abort)
      }
    },
    hide,
    toggle() {
      if (showHide && mounted) {
        if (!isShowing()) restoreCountdown(showHide)
        void showHide.toggle()
      } else if (showPending) {
        hide('toggle-function')
      } else {
        startShow(cycle)
      }
    },
    get: findItem,
    set(val: Partial<Item['value']['props']>) {
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
      if (destroyed) return
      destroyed = true
      try {
        if (showHide && mounted && state() !== 'hidden') {
          // Settles once hidden (joining a hide in progress), or when the hide is prevented or
          // superseded. The item is removed either way, which disposes the component
          await showHide.hide('destroy')
        } else {
          hide('destroy')
        }
      } finally {
        items.delete(id)
      }
    },
    [Symbol.asyncDispose]() {
      return controller.destroy()
    },
  } as InternalComponentController<TComponent, Item, TResult>

  return {
    controller,
    fns: {
      link,
      setRef: (value) => {
        controller.ref = value as ComponentPublicInstance<TComponent> | null
      },
      destroy: controller.destroy,
      show: () => {
        startShow(cycle)
      },
      hide,
    },
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
    // Shallow maps: adding and removing items is tracked, and each item is a computed that tracks
    // its own value. A deep map would hand out reactive proxies of the items, so callers'
    // components would render as proxies (Vue warns about that)
    store: ref({
      dialog: shallowReactive(new Map()),
      tooltip: shallowReactive(new Map()),
      popover: shallowReactive(new Map()),
      toast: shallowReactive(new Map()),
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
