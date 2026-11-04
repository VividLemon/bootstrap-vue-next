import {
  type ComponentInternalInstance,
  computed,
  type ComputedRef,
  type EmitFn,
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  readonly,
  type Ref,
  ref,
  watch,
} from 'vue'
import {showHideRegistryKey} from '../utils/keys'
import {BvTriggerableEvent} from '../utils'

/**
 * Registers a show/hide component in the app-wide show/hide registry (used by `useToggle`,
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
  /** Exposed as `value` in the registry (`useToggle().value`) */
  value: Readonly<Ref<boolean>>
  show: (resolveOnHide?: boolean) => Promise<boolean | string>
  hide: (trigger?: string) => Promise<boolean | string>
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
  /** `hide('backdrop')` is prevented */
  noCloseOnBackdrop?: boolean
  /** `hide('esc')` is prevented */
  noCloseOnEsc?: boolean
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
}

export interface UseShowHideReturn {
  /**
   * Target visibility. Flips at the start of a show / hide (after the cancelable event and any
   * `delay`). Bind the component's state class to it (`.show`, or `.hiding` on `!visible`), it
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
   * Resolves `true` after `shown`, `'show-prevented'`, or `false` when superseded by a newer
   * show / hide.
   */
  show: () => Promise<boolean | string>
  /**
   * Hides the component. Emits the `trigger` event (unless `noTriggerEmit`) and `hide`, both
   * cancelable (→ `hide-prevented`), flips `visible`, updates `modelValue`, awaits the
   * transition and emits `hidden` (with `trigger`).
   *
   * Resolves `trigger ?? ''` after `hidden`, `'hide-prevented'`, or `false` when superseded.
   */
  hide: (trigger?: string, noTriggerEmit?: boolean) => Promise<boolean | string>
  /**
   * Emits `toggle` (cancelable → `toggle-prevented`), then hides with trigger
   * `'toggle-function'` or shows.
   */
  toggle: () => Promise<boolean | string>
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
  const visible = ref(initialShow)
  const isActive = ref(initialShow)
  const instant = ref(initialShow)
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

  let operation = 0
  let delayTimer: ReturnType<typeof setTimeout> | undefined
  let pending:
    | {visible: boolean; promise: Promise<boolean | string>; resolve: (v: boolean | string) => void}
    | undefined

  /** The state the component is heading to, including a pending (delayed) change */
  const targetVisible = () => (pending ? pending.visible : visible.value)

  const syncModelValue = (value: boolean) => {
    if (value && !modelValue.value) {
      modelValue.value = true
    } else if (!value && modelValue.value) {
      modelValue.value = typeof modelValue.value === 'number' ? 0 : false
    }
  }

  const getDelay = (value: boolean) =>
    typeof props.delay === 'number' ? props.delay : (props.delay?.[value ? 'show' : 'hide'] ?? 0)

  const settle = (value: boolean | string) => {
    const current = pending
    pending = undefined
    current?.resolve(value)
  }

  const start = (value: boolean, trigger?: string): Promise<boolean | string> => {
    const op = ++operation
    clearTimeout(delayTimer)
    delayTimer = undefined
    // A superseded change never emits its `shown` / `hidden`
    settle(false)

    let resolve!: (v: boolean | string) => void
    const promise = new Promise<boolean | string>((res) => {
      resolve = res
    })
    pending = {visible: value, promise, resolve}

    const apply = async () => {
      delayTimer = undefined
      if (op !== operation) return
      visible.value = value
      if (value) {
        isActive.value = true
        lazyLoaded.value = true
      }
      syncModelValue(value)

      const finished = await (options.transition
        ? options.transition(value)
        : nextTick().then(() => true))
      if (op !== operation || !finished) return

      instant.value = false
      if (value) {
        emit('shown', buildTriggerableEvent('shown'))
      } else {
        isActive.value = false
        emit('hidden', buildTriggerableEvent('hidden', {trigger}))
      }
      settle(value ? true : (trigger ?? ''))
    }

    const delay = instant.value ? 0 : getDelay(value)
    if (delay > 0) {
      delayTimer = setTimeout(apply, delay)
    } else {
      apply()
    }
    return promise
  }

  const show = (): Promise<boolean | string> => {
    if (pending?.visible === true) return pending.promise
    if (visible.value && !pending) return Promise.resolve(true)

    const event = buildTriggerableEvent('show', {cancelable: true})
    emit('show', event)
    if (event.defaultPrevented) {
      emit('show-prevented', buildTriggerableEvent('show-prevented'))
      instant.value = false
      // Revert a v-model change that asked for the show
      if (!targetVisible()) syncModelValue(false)
      return Promise.resolve('show-prevented')
    }
    return start(true)
  }

  const hide = (trigger?: string, noTriggerEmit = false): Promise<boolean | string> => {
    if (typeof trigger !== 'string') trigger = undefined
    if (pending?.visible === false) return pending.promise
    if (!visible.value && !pending) return Promise.resolve('')

    if (
      (trigger === 'backdrop' && props.noCloseOnBackdrop) ||
      (trigger === 'esc' && props.noCloseOnEsc)
    ) {
      emit('hide-prevented', buildTriggerableEvent('hide-prevented', {trigger}))
      return Promise.resolve('hide-prevented')
    }

    let prevented = false
    if (trigger && !noTriggerEmit) {
      const triggerEvent = buildTriggerableEvent(trigger, {cancelable: true, trigger})
      emit(trigger, triggerEvent)
      prevented = triggerEvent.defaultPrevented
    }
    const event = buildTriggerableEvent('hide', {cancelable: true, trigger})
    emit('hide', event)
    if (prevented || event.defaultPrevented) {
      emit('hide-prevented', buildTriggerableEvent('hide-prevented', {trigger}))
      instant.value = false
      // Revert a v-model change that asked for the hide
      if (targetVisible()) syncModelValue(true)
      return Promise.resolve('hide-prevented')
    }
    return start(false, trigger)
  }

  const runToggle = (hideTrigger: string): Promise<boolean | string> => {
    const event = buildTriggerableEvent('toggle', {cancelable: true})
    emit('toggle', event)
    if (event.defaultPrevented) {
      emit('toggle-prevented', buildTriggerableEvent('toggle-prevented'))
      return Promise.resolve('toggle-prevented')
    }
    return targetVisible() ? hide(hideTrigger, true) : show()
  }
  const toggle = () => runToggle('toggle-function')
  const triggerToggle = () => {
    runToggle('toggle-trigger')
  }

  watch(modelValue, (value) => {
    if (!!value === targetVisible()) return
    if (value) {
      show()
    } else {
      hide('modelValue', true)
    }
  })

  watch(
    () => props.visible,
    (value) => {
      if (!!value === targetVisible()) return
      instant.value = true
      if (value) {
        show()
      } else {
        hide('visible-prop', true)
      }
    }
  )

  watch(
    () => props.show,
    (value) => {
      if (value) {
        show()
      } else {
        hide('show-prop', true)
      }
    }
  )

  onMounted(() => {
    if (initialShow) {
      // Already rendered as shown: announce it, then let the instant "transition" settle
      const event = buildTriggerableEvent('show', {cancelable: true})
      emit('show', event)
      if (event.defaultPrevented) {
        emit('show-prevented', buildTriggerableEvent('show-prevented'))
        visible.value = false
        isActive.value = false
        instant.value = false
        syncModelValue(false)
        return
      }
      start(true)
    } else if (props.show || (!!modelValue.value && props.initialAnimation)) {
      show()
    }
  })

  onBeforeUnmount(() => {
    operation++
    clearTimeout(delayTimer)
    delayTimer = undefined
    settle(false)
  })

  const {registerTrigger, unregisterTrigger} = useShowHideRegistration({
    id,
    isExpanded: () => visible.value,
    value: readonly(visible),
    show,
    hide: (trigger?: string) => hide(trigger),
    toggle,
    triggerToggle,
  })

  const contentShowing = computed(
    () => !props.lazy || isActive.value || (lazyLoaded.value && props.unmountLazy !== true)
  )

  return {
    visible: readonly(visible),
    isActive: readonly(isActive),
    instant: readonly(instant),
    contentShowing,
    show,
    hide,
    toggle,
    buildTriggerableEvent,
    registerTrigger,
    unregisterTrigger,
  }
}
