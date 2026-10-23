import {
  type ComponentInternalInstance,
  computed,
  type EmitFn,
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  readonly,
  ref,
  type Ref,
  watch,
} from 'vue'
import {showHideRegistryKey} from '../utils/keys'
import {BvTriggerableEvent} from '../utils'
import {getSafeWindow} from '../utils/dom'
import {useEventListener, useThrottleFn} from '@vueuse/core'

/**
 * NOTE FOR FUTURE AGENTS (Bootstrap 6 transition migration, temporary)
 *
 * What changed:
 * - This composable no longer uses Vue's `<Transition>`. The `onBeforeEnter`/`onEnter`/`onAfterEnter`/
 *   `onBeforeLeave`/`onLeave`/`onAfterLeave` hook arrays are gone, and so are the `transitionProps`
 *   and `backdropTransitionProps` returns, the `transitionProps` option, and the `transProps` prop.
 * - It now follows Bootstrap 6's model: CSS owns the motion, JS only toggles state and waits for it.
 *   The watcher on `showRef` runs `runEnter()`/`runLeave()`, which flip the refs below and then wait for
 *   the element's `transitionend` (see `waitForTransitionEnd`) before running the code that used to live
 *   in the `onAfter*` hooks (`shown`/`hidden` events, promise resolution, `renderRef` teardown).
 *
 * State a component renders from (instead of `<Transition>` classes):
 * - `isVisible`: the shown state (`.show`, or `.active` for tab panes). Set true on enter, false when leaving starts.
 * - `isLeaving`: true while the exit plays (`.hiding`, for alert/dialog/drawer, which must survive their own exit).
 * - `computedNoAnimation`: render the `.{component}-instant` class (e.g. `.alert-instant`). `noAnimation`/`noFade` are shorthands for it.
 * - `isActive`: stays true from enter start until the exit finishes. Use it to keep the element displayed during the exit.
 *
 * Timing: `waitForTransitionEnd` reads the computed `transition-duration`/`transition-delay` first. If the
 * total is `0s` (instant class, `--*-transition-duration: 0s`, reduced motion, or no CSS) it resolves immediately.
 *
 * Why: v6 removed `.fade`/`.collapsing`, and users restyle motion with CSS alone (token trio, `-instant`).
 * Reimplementing motion in Vue could not follow those customizations.
 *
 * Status: only BAlert has been migrated. BModal, BOffcanvas, BToast, BPopover, BDropdown and BCollapse still bind
 * `transitionProps`/`backdropTransitionProps` and are intentionally broken until they are migrated.
 * `backdropVisible`/`backdropReady`/`renderBackdropRef` are still driven here for those migrations.
 * This note should be removed once every consumer has moved over.
 */

const toMs = (value: string): number => {
  const n = Number.parseFloat(value)
  if (Number.isNaN(n)) return 0
  return value.trim().endsWith('ms') ? n : n * 1000
}

const getTransitionTimeMs = (el: Element): number => {
  const style = getSafeWindow()?.getComputedStyle(el)
  if (!style) return 0
  const durations = style.transitionDuration.split(',').map(toMs)
  const delays = style.transitionDelay.split(',').map(toMs)
  return Math.max(0, ...durations.map((d, i) => d + (delays[i % delays.length] ?? 0)))
}

export const useShowHide = (
  {
    modelValue,
    element,
    props,
    emit,
    id,
  }: {
    modelValue: Ref<boolean | number>
    props: {
      visible?: boolean
      show?: boolean
      noAnimation?: boolean
      noFade?: boolean
      noCloseOnBackdrop?: boolean
      noCloseOnEsc?: boolean
      lazy?: boolean
      initialAnimation?: boolean
      delay?:
        | number
        | {
            show: number
            hide: number
          }
    } & Record<string, unknown>
    emit: EmitFn
    element: Ref<HTMLElement | null>
    id: Ref<string>
  },
  options: {
    showFn?: () => void
    hideFn?: () => void
  } = {
    showFn: () => {},
    hideFn: () => {},
  }
) => {
  let noAction = false
  const initialShow = (!!modelValue.value && !props.initialAnimation) || props.visible || false
  const showRef = ref<boolean>(initialShow)
  const renderRef = ref<boolean>(initialShow)
  const renderBackdropRef = ref<boolean>(initialShow)

  let isCountdown = typeof modelValue.value !== 'boolean'

  watch(modelValue, () => {
    isCountdown = typeof modelValue.value !== 'boolean'
    if (noAction) {
      noAction = false
      return
    }
    if (modelValue.value) {
      show()
    } else {
      hide('modelValue', true)
    }
  })

  const localNoAnimation = ref(initialShow)
  const localTemporaryHide = ref(false)
  const computedNoAnimation = computed(
    () => props.noAnimation || props.noFade || localNoAnimation.value || false
  )
  let isMounted = false
  onMounted(() => {
    isMounted = true
    if (!props.show && initialShow) {
      // show without delay or animation
      const event = buildTriggerableEvent('show', {cancelable: true})
      emit('show', event)

      if (event.defaultPrevented) {
        emit('show-prevented', buildTriggerableEvent('show-prevented'))
        return
      }
      localNoAnimation.value = true
      if (!modelValue.value) {
        noAction = true
        modelValue.value = true
      }
      renderRef.value = true
      renderBackdropRef.value = true
      isVisible.value = true
      backdropVisible.value = true
      backdropReady.value = true
      // showRef starts true here, so its watcher does not run
      showRef.value = true
      runEnter()
      options.showFn?.()
    } else if (props.show || (!!modelValue.value && props.initialAnimation)) {
      show()
    }
  })

  watch(
    () => props.visible,
    (newVal) => {
      localNoAnimation.value = true

      nextTick(() => {
        if (newVal) isVisible.value = true
        if (newVal) {
          show()
        } else {
          hide('visible-prop', true)
        }
      })
    }
  )
  watch(
    () => props.show,
    (newVal) => {
      if (newVal) {
        show()
      } else {
        hide('show-prop', true)
      }
    }
  )
  // todo: remove
  useEventListener(
    element,
    'bv-toggle',
    () => {
      modelValue.value = !modelValue.value
    },
    {passive: true}
  )

  const buildTriggerableEvent = (
    type: string,
    opts: Readonly<Partial<BvTriggerableEvent>> = {}
  ): BvTriggerableEvent =>
    new BvTriggerableEvent(type, {
      cancelable: false,
      target: element?.value || null,
      relatedTarget: null,
      trigger: null,
      ...opts,
      componentId: id?.value,
    })

  let showTimeout: ReturnType<typeof setTimeout> | undefined
  let hideTimeout: ReturnType<typeof setTimeout> | undefined
  let _Resolve: ((value: boolean | string) => void) | undefined
  let _Promise: Promise<boolean | string> | undefined
  let _resolveOnHide: boolean | undefined
  const show = (resolveOnHide: boolean = false): Promise<boolean | string> => {
    if (showRef.value && !hideTimeout && !_Promise) return Promise.resolve(true)
    _resolveOnHide = resolveOnHide
    if (showRef.value && !hideTimeout && _Promise) return _Promise

    _Promise = new Promise<boolean | string>((resolve) => {
      _Resolve = resolve
    })

    const event = buildTriggerableEvent('show', {cancelable: true})
    emit('show', event)

    if (event.defaultPrevented) {
      emit('show-prevented', buildTriggerableEvent('show-prevented'))
      if (isVisible.value) {
        isVisible.value = false
      }
      if (modelValue.value && !isCountdown) {
        noAction = true
        nextTick(() => {
          modelValue.value = false
        })
      }
      _Resolve?.('show-prevented')
      return _Promise
    }
    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = undefined
    }
    renderRef.value = true
    renderBackdropRef.value = true
    requestAnimationFrame(() => {
      if (localNoAnimation.value || props.delay === undefined) {
        if (!isMounted) return
        showTimeout = undefined
        showRef.value = true
        options.showFn?.()
        if (!modelValue.value) {
          noAction = true
          nextTick(() => {
            modelValue.value = true
          })
        }
        return
      }
      showTimeout = setTimeout(
        () => {
          if (!isMounted) return
          showTimeout = undefined
          showRef.value = true
          options.showFn?.()
          if (!modelValue.value) {
            noAction = true
            nextTick(() => {
              modelValue.value = true
            })
          }
        },
        typeof props.delay === 'number' ? props.delay : props.delay?.show || 0
      )
    })
    return _Promise
  }

  let leaveTrigger: string | undefined
  const hide = (trigger?: string, noTriggerEmit?: boolean): Promise<string> => {
    if (!showRef.value && !showTimeout && !renderRef.value) return Promise.resolve('')
    if (!_Promise)
      _Promise = new Promise<string>((resolve) => {
        ;(_Resolve as (value: string | PromiseLike<string>) => void) = resolve
      })
    if (typeof trigger !== 'string') trigger = undefined
    leaveTrigger = trigger
    const event = buildTriggerableEvent('hide', {cancelable: true, trigger})
    const event2 = buildTriggerableEvent(trigger || 'ignore', {cancelable: true, trigger})
    if (
      (trigger === 'backdrop' && props.noCloseOnBackdrop) ||
      (trigger === 'esc' && props.noCloseOnEsc)
    ) {
      emit('hide-prevented', buildTriggerableEvent('hide-prevented', {trigger}))
      _Resolve?.('hide-prevented')
      return _Promise as Promise<string>
    }
    if (showTimeout) {
      clearTimeout(showTimeout)
      showTimeout = undefined
    }
    if (trigger && !noTriggerEmit) {
      emit(trigger, event2)
    }
    emit('hide', event)

    if (event.defaultPrevented || event2.defaultPrevented) {
      emit('hide-prevented', buildTriggerableEvent('hide-prevented', {trigger}))
      if (!modelValue.value) {
        nextTick(() => {
          noAction = true
          modelValue.value = true
        })
      }
      _Resolve?.('hide-prevented')
      return _Promise as Promise<string>
    }
    trapActive.value = false
    if (showTimeout) {
      clearTimeout(showTimeout)
      showTimeout = undefined
      if (!localTemporaryHide.value) renderRef.value = false
      renderBackdropRef.value = false
    }
    hideTimeout = setTimeout(
      () => {
        if (!isMounted) return
        hideTimeout = undefined
        isLeaving.value = true
        showRef.value = false
        options.hideFn?.()
        if (modelValue.value) {
          noAction = true
          modelValue.value = isCountdown ? 0 : false
        }
      },
      localNoAnimation.value
        ? 0
        : typeof props.delay === 'number'
          ? props.delay
          : props.delay?.hide || 0
    )
    return _Promise as Promise<string>
  }
  const throttleHide = useThrottleFn((a) => hide(a), 500)
  const throttleShow = useThrottleFn(() => show(), 500)

  const toggle = (resolveOnHide: boolean = false): Promise<boolean | string> => {
    const e = buildTriggerableEvent('toggle', {cancelable: true})
    emit('toggle', e)
    if (e.defaultPrevented) {
      emit('toggle-prevented', buildTriggerableEvent('toggle-prevented'))
      return Promise.resolve('toggle-prevented')
    }
    if (showRef.value) {
      return hide('toggle-function', true)
    }
    return show(resolveOnHide)
  }
  const triggerToggle = () => {
    const e = buildTriggerableEvent('toggle', {cancelable: true})
    emit('toggle', e)
    if (e.defaultPrevented) {
      emit('toggle-prevented', buildTriggerableEvent('toggle-prevented'))
      return
    }
    if (showRef.value) {
      hide('toggle-trigger', true)
    } else {
      show()
    }
  }
  const triggerRegistry: {trigger: string; el: Element}[] = []
  const registerTrigger = (trigger: string, el: Element) => {
    triggerRegistry.push({trigger, el})
    el.addEventListener(trigger, triggerToggle)
    checkVisibility(el)
  }
  const unregisterTrigger = (trigger: string, el: Element, clean = true) => {
    const idx = triggerRegistry.findIndex((t) => t?.trigger === trigger && t.el === el)
    if (idx > -1) {
      triggerRegistry.splice(idx, 1)
      el.removeEventListener(trigger, triggerToggle)
      if (clean) {
        el.removeAttribute('aria-expanded')
        el.classList.remove('collapsed')
        el.classList.remove('not-collapsed')
      }
    }
  }

  const appRegistry = inject(showHideRegistryKey, null)?.register({
    id: id.value,
    toggle,
    show,
    hide,
    value: readonly(showRef),
    registerTrigger,
    unregisterTrigger,
    component: getCurrentInstance() as ComponentInternalInstance,
  })
  const checkVisibility = (el: Element) => {
    el.setAttribute('aria-expanded', modelValue.value ? 'true' : 'false')
    el.classList.toggle('collapsed', !modelValue.value)
    el.classList.toggle('not-collapsed', !!modelValue.value)
  }

  watch(modelValue, () => {
    triggerRegistry.forEach((t) => {
      checkVisibility(t.el)
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
  onUnmounted(() => {
    isMounted = false
    transitionToken++
    cancelWait?.()
    clearTimeout(showTimeout)
    clearTimeout(hideTimeout)
    showTimeout = undefined
    hideTimeout = undefined
  })

  const lazyLoadCompleted = ref(false)
  const markLazyLoadCompleted = () => {
    if (props.lazy === true) lazyLoadCompleted.value = true
  }

  const isLeaving = ref(false)
  const isActive = ref(initialShow)
  const isVisible = ref(initialShow)

  let transitionToken = 0
  let cancelWait: (() => void) | undefined

  const waitForTransitionEnd = (): Promise<void> =>
    new Promise<void>((resolve) => {
      cancelWait?.()
      const el = element.value
      const duration = el && !computedNoAnimation.value ? getTransitionTimeMs(el) : 0
      if (!el || duration === 0) {
        resolve()
        return
      }
      const cleanup = () => {
        el.removeEventListener('transitionend', onEnd)
        clearTimeout(timeout)
        cancelWait = undefined
      }
      const onEnd = (e: Event) => {
        if (e.target !== el) return
        cleanup()
        resolve()
      }
      // transitionend never fires if the transition is cancelled or the element is hidden
      const timeout = setTimeout(() => {
        cleanup()
        resolve()
      }, duration + 50)
      el.addEventListener('transitionend', onEnd)
      cancelWait = cleanup
    })

  const runEnter = async () => {
    const token = ++transitionToken
    isLeaving.value = false
    isActive.value = true
    backdropReady.value = false
    await nextTick()
    if (token !== transitionToken) return
    // Commit the hidden state so the browser has a style to transition from
    void element.value?.offsetHeight
    isVisible.value = true
    backdropVisible.value = true
    await waitForTransitionEnd()
    if (token !== transitionToken) return

    markLazyLoadCompleted()
    backdropReady.value = true
    if (localNoAnimation.value) {
      requestAnimationFrame(() => {
        localNoAnimation.value = false
      })
    }
    if (localTemporaryHide.value) {
      localTemporaryHide.value = false
    }
    requestAnimationFrame(() => {
      trapActive.value = true
      nextTick(() => {
        emit('shown', buildTriggerableEvent('shown', {cancelable: false}))
      })
    })
    if (!_resolveOnHide) {
      _Resolve?.(true)
      _Promise = undefined
      _Resolve = undefined
    }
  }

  const runLeave = async () => {
    const token = ++transitionToken
    isLeaving.value = true
    trapActive.value = false
    isVisible.value = false
    backdropVisible.value = false
    await nextTick()
    if (token !== transitionToken) return
    await waitForTransitionEnd()
    if (token !== transitionToken) return

    emit('hidden', buildTriggerableEvent('hidden', {trigger: leaveTrigger, cancelable: false}))
    isLeaving.value = false
    isActive.value = false
    backdropReady.value = false
    if (localNoAnimation.value) {
      requestAnimationFrame(() => {
        localNoAnimation.value = false
      })
    }
    requestAnimationFrame(() => {
      if (!localTemporaryHide.value) renderRef.value = false
      renderBackdropRef.value = false
    })
    _Resolve?.(leaveTrigger || '')
    _Promise = undefined
    _Resolve = undefined
    leaveTrigger = undefined
  }

  watch(
    showRef,
    (value) => {
      if (value) {
        runEnter()
      } else {
        runLeave()
      }
    },
    {flush: 'post'}
  )

  const contentShowing = computed(
    () =>
      localTemporaryHide.value === true ||
      isActive.value === true ||
      props.lazy === false ||
      (props.lazy === true && lazyLoadCompleted.value === true && props.unmountLazy === false)
  )
  const trapActive = ref(false)
  const backdropVisible = ref(false)
  const backdropReady = ref(false)

  return {
    showRef: readonly(showRef),
    renderRef: readonly(renderRef),
    renderBackdropRef: readonly(renderBackdropRef),
    isVisible: readonly(isVisible),
    isActive: readonly(isActive),
    trapActive: readonly(trapActive),
    show,
    hide,
    toggle,
    throttleHide,
    throttleShow,
    buildTriggerableEvent,
    computedNoAnimation,
    localNoAnimation: readonly(localNoAnimation),
    setLocalNoAnimation: (value: boolean) => {
      localNoAnimation.value = value
    },
    localTemporaryHide: readonly(localTemporaryHide),
    setLocalTemporaryHide: (value: boolean) => {
      localTemporaryHide.value = value
    },
    isLeaving: readonly(isLeaving),
    lazyLoadCompleted: readonly(lazyLoadCompleted),
    markLazyLoadCompleted,
    contentShowing,
    backdropReady: readonly(backdropReady),
    backdropVisible: readonly(backdropVisible),
  }
}
