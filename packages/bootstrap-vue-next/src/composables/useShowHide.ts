import {
  type ComponentInternalInstance,
  computed,
  type ComputedRef,
  type EmitFn,
  getCurrentInstance,
  inject,
  type MaybeRefOrGetter,
  nextTick,
  onBeforeUnmount,
  onMounted,
  type Ref,
  ref,
  shallowRef,
  toValue,
  watch,
} from 'vue'
import {
  createShowHideMachine,
  type ShowHideEventInit,
  type ShowHideSnapshot,
  type ShowHideState,
} from './showHideMachine'
import {showHideRegistryKey} from '../utils/keys'
import {BvTriggerableEvent} from '../utils'

export type {ShowHideState}

/**
 * Registers a show/hide component in the app-wide show/hide registry (used by `useComponentToggle`,
 * `v-b-toggle`, `v-b-modal`, ...) and manages the triggers registered through it.
 *
 * Registered triggers get a listener for their event and an `aria-expanded` attribute that
 * follows `isExpanded`. `aria-controls` is owned by the directive that registers the trigger.
 *
 * Shared by `useShowHide` and the deprecated `useLegacyShowHide`.
 *
 * @internal
 */
export const useShowHideRegistration = ({
  id,
  isExpanded,
  value,
  show,
  hide,
  toggle,
  triggerToggle,
}: {
  id: Readonly<Ref<string>>
  /** Drives `aria-expanded` on registered triggers */
  isExpanded: () => boolean
  /** Exposed as `value` in the registry (`useComponentToggle().value`) */
  value: Readonly<Ref<boolean>>
  show: (resolveOnHide?: boolean) => Promise<boolean | string>
  hide: (trigger?: string, noTriggerEmit?: boolean) => Promise<boolean | string>
  toggle: (resolveOnHide?: boolean) => Promise<boolean | string>
  /** Listener added to registered triggers */
  triggerToggle: () => void
}) => {
  const triggerRegistry: {trigger: string; el: Element}[] = []

  const updateTrigger = (el: Element) => {
    el.setAttribute('aria-expanded', isExpanded() ? 'true' : 'false')
  }

  const registerTrigger = (trigger: string, el: Element) => {
    triggerRegistry.push({trigger, el})
    el.addEventListener(trigger, triggerToggle)
    updateTrigger(el)
  }

  const unregisterTrigger = (trigger: string, el: Element, clean = true) => {
    const idx = triggerRegistry.findIndex((t) => t?.trigger === trigger && t.el === el)
    if (idx > -1) {
      triggerRegistry.splice(idx, 1)
      el.removeEventListener(trigger, triggerToggle)
      if (clean) {
        el.removeAttribute('aria-expanded')
      }
    }
  }

  const appRegistry = inject(showHideRegistryKey, null)?.register({
    id: id.value,
    toggle,
    show,
    hide,
    value,
    registerTrigger,
    unregisterTrigger,
    component: getCurrentInstance() as ComponentInternalInstance,
  })

  watch(isExpanded, () => {
    triggerRegistry.forEach((t) => {
      updateTrigger(t.el)
    })
  })

  watch(id, (newId, oldId) => {
    appRegistry?.updateId(newId, oldId)
  })

  onBeforeUnmount(() => {
    appRegistry?.unregister()
    triggerRegistry.forEach((t) => {
      t.el.removeEventListener(t.trigger, triggerToggle)
    })
  })

  return {registerTrigger, unregisterTrigger}
}

/**
 * Props read by `useShowHide`. Components pass their whole props object.
 */
export interface UseShowHideProps {
  /** Initially shown without transition; changes show/hide without transition */
  visible?: boolean
  /** Shows on mount (with transition); changes show/hide */
  show?: boolean
  /** When `modelValue` is initially truthy, show with a transition on mount instead of instantly */
  initialAnimation?: boolean
  /** Content is not rendered until first shown (see `contentShowing`) */
  lazy?: boolean
  /** With `lazy`, content is unmounted again after `hidden` */
  unmountLazy?: boolean
  /** Waits before the state flips, after the `show` / `hide` event */
  delay?: number | {show: number; hide: number}
}

export interface UseShowHideOptions {
  /**
   * Called right after `visible` flipped (the component's state class is about to be patched).
   * Resolve `true` once the component's CSS transition finished and this call is still the
   * latest, `false` when it was superseded. Pass `() => run()` from `useCssTransition`.
   *
   * Defaults to resolving `true` after `nextTick`, for components without motion.
   */
  transition?: (visible: boolean) => Promise<boolean>
  /**
   * While `true`, `show()` (and `v-model` / the `visible` and `show` props asking for a show)
   * resolves `'show-prevented'` without emitting events. Turning it on while the component is
   * showing or shown hides it with trigger `'disabled'`.
   */
  disabled?: MaybeRefOrGetter<boolean | undefined>
  /**
   * The event `hide(trigger)` emits for its trigger before `hide`, by trigger. Return `undefined`
   * for a trigger without an event of its own. Defaults to an event named like the trigger.
   */
  triggerEvent?: (trigger: string) => string | undefined
}

export interface UseShowHideReturn {
  /**
   * Where the component is in its lifecycle: `hidden` → `showing` → `shown` → `hiding` → `hidden`.
   * `showing` / `hiding` start when a show / hide request is accepted (before any `delay`) and end
   * when `shown` / `hidden` is emitted. Read-only; `visible`, `isActive` and `instant` are derived
   * from the same machine.
   */
  state: Readonly<Ref<ShowHideState>>
  /**
   * The state class is applied. Flips at the start of a show / hide (after the cancelable event
   * and any `delay`). Bind the component's state class to it (`.show`, or `.hiding` on `!visible`), it
   * drives `aria-expanded` on registered triggers and is the `visible` slot prop.
   */
  visible: Readonly<Ref<boolean>>
  /**
   * `true` from the start of a show until `hidden` fired, i.e. while anything is on screen.
   * Use it to keep transient elements mounted (`v-if`) until their hide transition ended.
   */
  isActive: Readonly<Ref<boolean>>
  /**
   * `true` while the current change must skip the transition: the initial render of an
   * initially shown component, and changes of the `visible` prop. Add the component's
   * `-instant` class while it is set (`props.noTransition || instant.value`).
   */
  instant: Readonly<Ref<boolean>>
  /**
   * Whether the default content should be rendered, honouring `lazy` / `unmountLazy`.
   * Lazy content mounts when a show starts and unmounts only after `hidden`.
   */
  contentShowing: ComputedRef<boolean>
  /**
   * Shows the component. Emits `show` (cancelable → `show-prevented`), flips `visible`,
   * updates `modelValue`, awaits the transition and emits `shown`.
   *
   * Resolves `true` after `shown` (at once when already shown), `'show-prevented'`, or `false`
   * when superseded by a hide or when the component unmounts first. While `showing`, it returns
   * the promise of the show in progress.
   *
   * With `resolveOnHide` the promise stays pending after `shown` and resolves with the trigger
   * (`trigger ?? ''`) once the component is hidden again, also when the hide starts before
   * `shown` or when the component was already shown. It resolves `'dispose'` when the component
   * unmounts first.
   */
  show: (resolveOnHide?: boolean) => Promise<boolean | string>
  /**
   * Hides the component. Emits the `trigger` event (unless `noTriggerEmit`) and `hide`, both
   * cancelable (→ `hide-prevented`), flips `visible`, updates `modelValue`, awaits the
   * transition and emits `hidden` (with `trigger`).
   *
   * Resolves `trigger ?? ''` after `hidden` (`''` at once when already hidden),
   * `'hide-prevented'`, or `false` when superseded by a show or when the component unmounts
   * first. While `hiding`, it returns the promise of the hide in progress, which keeps its
   * trigger.
   */
  hide: (trigger?: string, noTriggerEmit?: boolean) => Promise<boolean | string>
  /**
   * Emits `toggle` (cancelable → `toggle-prevented`), then hides with trigger
   * `'toggle-function'` (while `showing` / `shown`) or shows (passing `resolveOnHide` on to
   * `show`).
   */
  toggle: (resolveOnHide?: boolean) => Promise<boolean | string>
  /**
   * The component was already hidden from outside (the browser closed a native `<dialog>`): a
   * hide that cannot be refused and skips the delay and the transition. It still emits `hide`
   * (with `cancelable: false`), updates `modelValue` and emits `hidden`. Does nothing unless the
   * component is `showing` or `shown`.
   */
  syncHidden: (trigger?: string) => Promise<boolean | string>
  buildTriggerableEvent: (
    type: string,
    opts?: Readonly<Partial<BvTriggerableEvent>>
  ) => BvTriggerableEvent
  registerTrigger: (trigger: string, el: Element) => void
  unregisterTrigger: (trigger: string, el: Element, clean?: boolean) => void
}

/**
 * State, `v-model` and events for show/hide components on the native Bootstrap v6 transition
 * path. It holds **no class and no timing logic**: the component maps `visible` / `instant` to
 * its v6 classes and passes a `transition` callback (normally `useCssTransition().run`) that
 * resolves when its CSS transition ended.
 *
 * Event order for a show: `show` (cancelable) → `visible = true` + `update:modelValue` → CSS
 * transition → `shown`. For a hide: `[trigger]` + `hide` (cancelable) → `visible = false` +
 * `update:modelValue` → CSS transition → `hidden`. A newer show / hide supersedes a pending one:
 * the older one never emits its `shown` / `hidden` and its promise resolves `false`.
 *
 * The lifecycle itself is an explicit state machine (`showHideMachine.ts`): `state` is one of
 * `hidden`, `showing`, `shown`, `hiding`, and every request has one defined outcome in every
 * state. `architecture/ARIA_VISIBILITY.md` has the transition table and the event-order
 * guarantees.
 *
 * Adopting it in a component:
 *
 * ```ts
 * const element = useTemplateRef<HTMLElement>('_element')
 * const {run} = useCssTransition(element)
 * const {visible, isActive, instant, contentShowing, show, hide, toggle} = useShowHide(
 *   {modelValue, props, emit: emit as EmitFn, element, id: computedId},
 *   {transition: () => run()}
 * )
 * // template: <div v-if="isActive" ref="_element" class="toast" :class="classes">
 * const classes = computed(() => ({
 *   'show': visible.value,
 *   'toast-instant': props.noTransition || instant.value,
 * }))
 * ```
 */
export const useShowHide = (
  {
    modelValue,
    element,
    props,
    emit,
    id,
  }: {
    modelValue: Ref<boolean | number>
    props: UseShowHideProps & Record<string, unknown>
    emit: EmitFn
    element: Readonly<Ref<HTMLElement | null>>
    id: Readonly<Ref<string>>
  },
  options: UseShowHideOptions = {}
): UseShowHideReturn => {
  const initialShow = (!!modelValue.value && !props.initialAnimation) || !!props.visible
  const lazyLoaded = ref(initialShow)

  const buildTriggerableEvent = (
    type: string,
    opts: Readonly<Partial<BvTriggerableEvent>> = {}
  ): BvTriggerableEvent =>
    new BvTriggerableEvent(type, {
      cancelable: false,
      target: element.value || null,
      relatedTarget: null,
      trigger: null,
      ...opts,
      componentId: id.value,
    })

  /** Emits a `BvTriggerableEvent` and returns whether a listener prevented it */
  const emitEvent = (name: string, init: ShowHideEventInit = {}): boolean => {
    const event = buildTriggerableEvent(name, init)
    emit(name, event)
    return event.defaultPrevented
  }

  /** The value this composable last wrote to `modelValue`, until its watcher saw it */
  let ownModelWrite: {value: boolean} | undefined
  const markOwnModelWrite = (value: boolean) => {
    const write = {value}
    ownModelWrite = write
    // The watcher never runs when the parent does not apply the update. Left set, the mark would
    // make it skip the parent's next real change to that value
    void nextTick(() => {
      if (ownModelWrite === write) ownModelWrite = undefined
    })
  }

  const syncModelValue = (value: boolean) => {
    if (value && !modelValue.value) {
      markOwnModelWrite(true)
      modelValue.value = true
    } else if (!value && modelValue.value) {
      markOwnModelWrite(false)
      modelValue.value = typeof modelValue.value === 'number' ? 0 : false
    }
  }

  // The machine owns the lifecycle. This composable mirrors its snapshot into one ref for
  // rendering and translates every entry point (methods, `v-model`, props, triggers) into
  // requests to it
  const snapshot = shallowRef<ShowHideSnapshot>(undefined as unknown as ShowHideSnapshot)
  const machine = createShowHideMachine({
    initiallyShown: initialShow,
    emit: emitEvent,
    getDelay: (value) =>
      typeof props.delay === 'number' ? props.delay : (props.delay?.[value ? 'show' : 'hide'] ?? 0),
    transition: (value) =>
      options.transition ? options.transition(value) : nextTick().then(() => true),
    isDisabled: () => toValue(options.disabled) === true,
    onChange: (next) => {
      snapshot.value = next
      if (next.active) lazyLoaded.value = true
    },
    onCommit: syncModelValue,
    // Revert a `v-model` change that asked for the refused show / hide
    onRefused: () => syncModelValue(machine.targetVisible()),
  })
  snapshot.value = machine.snapshot()

  const state = computed(() => snapshot.value.state)
  const visible = computed(() => snapshot.value.visible)
  const isActive = computed(() => snapshot.value.active)
  const instant = computed(() => snapshot.value.instant)

  const show = (resolveOnHide: boolean = false): Promise<boolean | string> =>
    // Ignore event objects from `@click="show"`
    machine.show({resolveOnHide: resolveOnHide === true})

  const hide = (trigger?: string, noTriggerEmit = false): Promise<boolean | string> => {
    // Ignore event objects from `@click="hide"`
    if (typeof trigger !== 'string') trigger = undefined
    const triggerEvent =
      trigger === undefined || noTriggerEmit === true
        ? undefined
        : options.triggerEvent
          ? options.triggerEvent(trigger)
          : trigger
    return machine.hide(trigger, {noTriggerEmit: triggerEvent === undefined, triggerEvent})
  }

  const syncHidden = (trigger?: string): Promise<boolean | string> =>
    machine.targetVisible()
      ? machine.hide(trigger, {noTriggerEmit: true, cancelable: false, instant: true})
      : Promise.resolve(false)

  const runToggle = (hideTrigger: string, resolveOnHide = false): Promise<boolean | string> =>
    machine.guarded(
      () => emitEvent('toggle', {cancelable: true}),
      () => {
        emitEvent('toggle-prevented')
        return Promise.resolve('toggle-prevented')
      },
      () =>
        machine.targetVisible()
          ? machine.hide(hideTrigger, {noTriggerEmit: true})
          : machine.show({resolveOnHide: resolveOnHide === true})
    )
  const toggle = (resolveOnHide: boolean = false) => runToggle('toggle-function', resolveOnHide)
  const triggerToggle = () => {
    void runToggle('toggle-trigger')
  }

  /**
   * `v-model` and the `visible` / `show` props are requests like any other: they emit the
   * cancelable events, and a refused one writes `modelValue` back
   */
  const sync = (value: boolean, trigger: string, instant = false) => {
    if (value) {
      void machine.show({instant})
    } else {
      void machine.hide(trigger, {noTriggerEmit: true, instant})
    }
  }

  watch(modelValue, (value) => {
    // The change this composable made itself is not a request: reacting to it would cancel a
    // newer pending (delayed) change in the other direction
    const own = ownModelWrite
    ownModelWrite = undefined
    if (own !== undefined && !!value === own.value) return
    if (!!value === machine.targetVisible()) return
    sync(!!value, 'modelValue')
  })

  watch(
    () => props.visible,
    (value) => {
      if (!!value === machine.targetVisible()) return
      sync(!!value, 'visible-prop', true)
    }
  )

  watch(
    () => props.show,
    (value) => {
      sync(!!value, 'show-prop')
    }
  )

  watch(
    () => toValue(options.disabled) === true,
    (disabled) => {
      if (disabled) void machine.hide('disabled', {noTriggerEmit: true})
    }
  )

  onMounted(() => {
    if (initialShow) {
      machine.mount()
    } else if (props.show || (!!modelValue.value && props.initialAnimation)) {
      void show()
    }
  })

  onBeforeUnmount(() => {
    machine.dispose()
  })

  const {registerTrigger, unregisterTrigger} = useShowHideRegistration({
    id,
    isExpanded: () => visible.value,
    value: visible,
    show,
    // `useComponentToggle().hide(trigger)` passes `noTriggerEmit`
    hide,
    toggle,
    triggerToggle,
  })

  const contentShowing = computed(
    () => !props.lazy || isActive.value || (lazyLoaded.value && props.unmountLazy !== true)
  )

  return {
    state,
    visible,
    isActive,
    instant,
    contentShowing,
    show,
    hide,
    toggle,
    syncHidden,
    buildTriggerableEvent,
    registerTrigger,
    unregisterTrigger,
  }
}
