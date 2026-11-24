import {useEventListener} from '@vueuse/core'
import {
  computed,
  type ComputedRef,
  type EmitFn,
  nextTick,
  onBeforeUnmount,
  type Ref,
  ref,
  shallowRef,
  watch,
} from 'vue'
import {getSafeDocument} from '../utils/dom'
import {warn} from '../utils/console'
import {useCssTransition} from './useCssTransition'
import {useShowHide, type UseShowHideProps, type UseShowHideReturn} from './useShowHide'

/** Bootstrap v6 locks page scroll with this class on `<html>` (`:root.dialog-open`) */
const scrollLockClass = 'dialog-open'

/**
 * The open dialogs that lock page scroll. The class is removed when the last one closes, so
 * stacked dialogs keep the page locked.
 */
const scrollLocks = new Set<HTMLDialogElement>()
const updateScrollLock = () => {
  getSafeDocument()?.documentElement.classList.toggle(scrollLockClass, scrollLocks.size > 0)
}

/**
 * The v6 CSS keeps a closed dialog `visibility: hidden` and transitions `visibility` when it
 * opens. At the moment of `showModal()` / `show()` the content therefore still computes to
 * hidden, the browser's dialog focusing steps find nothing focusable, and focus is dropped on
 * `<body>`. This makes the element visible without a transition first (it is still closed and
 * transparent) and returns a function that removes the inline style again. Opacity and transform
 * still animate from their closed values.
 */
const revealForFocus = (el: HTMLDialogElement): (() => void) => {
  const {style} = el
  const previous = {transition: style.transition, visibility: style.visibility}
  style.transition = 'none'
  style.visibility = 'visible'
  // Commit the visible state before the transition is allowed again
  void el.offsetWidth
  style.transition = previous.transition
  return () => {
    style.visibility = previous.visibility
  }
}

export interface UseDialogBaseOptions {
  /** Open with `showModal()` (top layer, `::backdrop`, inert page) instead of `show()` */
  modal: () => boolean
  /** Lock page scroll while open */
  lockScroll: () => boolean
  /**
   * A click on the backdrop: `true` hides (trigger `'backdrop'`), `'static'` bounces, `false`
   * does nothing
   */
  backdrop: () => boolean | 'static'
  /** Escape hides (trigger `'esc'`). `false` bounces */
  keyboard: () => boolean
  noTransition: () => boolean
  /**
   * Keep the element open until the exit transition ended (v6 Dialog). `false` closes it at
   * once and lets the CSS animate the closed element (v6 Drawer)
   */
  deferClose: boolean
  /** See `UseShowHideOptions.triggerEvent` */
  triggerEvent: (trigger: string) => string | undefined
}

export interface UseDialogBaseReturn extends Omit<UseShowHideReturn, 'hide'> {
  /**
   * Hides the dialog. `value` is kept as `returnValue` when this hide is the one carried out.
   * `noTriggerEmit` skips the trigger's own event (`ok` / `cancel`), as `useShowHide().hide`.
   * Resolves like `useShowHide().hide`.
   */
  hide: (trigger?: string, value?: unknown, noTriggerEmit?: boolean) => Promise<boolean | string>
  /** The `value` of the hide that closed the dialog last, reset when it is shown again */
  returnValue: Readonly<Ref<unknown>>
  /** The component's `-instant` class applies: `noTransition`, or an instant change */
  isInstant: ComputedRef<boolean>
  /** The component's `.hiding` class applies: from the start of a hide until `hidden` */
  isHiding: ComputedRef<boolean>
  /** The component's `-static` class applies: a refused close request is bouncing */
  bouncing: Readonly<Ref<boolean>>
  /** `'none'` while Escape must not close the dialog, for the native `closedby` attribute */
  closedby: ComputedRef<'none' | undefined>
}

/**
 * The behavior Bootstrap v6 Dialog and Drawer share (`dialog-base.ts`), on a native `<dialog>`:
 *
 * - opens with `showModal()` / `show()` and closes with `close()` from the show/hide transition,
 *   so the top layer, the `::backdrop`, focus containment and the inert page are the browser's
 * - Escape (native `cancel`, or `keydown` for a non-modal dialog) and backdrop clicks, with the
 *   static bounce when they are disabled
 * - page scroll lock (`dialog-open` on `<html>`)
 * - a `<dialog>` the browser closed itself (native `close`) is synced as a hide that already
 *   happened; `<form method="dialog">` submits become `hide('submit', submitter.value)` so the
 *   exit transition plays
 *
 * The component binds `isHiding`, `isInstant` and `bouncing` to its v6 classes and never binds
 * the `open` attribute.
 *
 * @internal
 */
export const useDialogBase = (
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
    element: Readonly<Ref<HTMLDialogElement | null>>
    id: Readonly<Ref<string>>
  },
  options: UseDialogBaseOptions
): UseDialogBaseReturn => {
  const {run} = useCssTransition(element)
  const {run: runBounce} = useCssTransition(element)

  /** Whether the element is open through `showModal()`. Props may change while it is open */
  let openedAsModal = false

  const closeElement = () => {
    const el = element.value
    if (!el) return
    if (el.open) el.close()
    openedAsModal = false
    scrollLocks.delete(el)
    updateScrollLock()
  }

  const openElement = () => {
    const el = element.value
    if (!el || el.open) return
    const modal = options.modal()
    const restore = revealForFocus(el)
    try {
      if (modal) {
        el.showModal()
      } else {
        el.show()
      }
    } catch (error) {
      // `showModal()` throws on an element that is not in the document
      warn('useDialogBase', 'The dialog could not be opened.', error)
      return
    } finally {
      restore()
    }
    openedAsModal = modal
    if (options.lockScroll()) {
      scrollLocks.add(el)
      updateScrollLock()
    }
  }

  /** Invalidates the callback of an older change that is still waiting */
  let generation = 0
  const transition = async (visible: boolean): Promise<boolean> => {
    const current = ++generation
    if (visible) {
      // Lazy content must be in the DOM first: the browser picks the element to focus on open
      await nextTick()
      if (current !== generation) return false
      openElement()
      return run()
    }
    const deferred = options.deferClose && !isInstant.value
    if (!deferred) closeElement()
    const finished = await run()
    if (finished && current === generation) closeElement()
    return finished
  }

  const showHide = useShowHide(
    {modelValue, props, emit, element, id},
    {transition, triggerEvent: options.triggerEvent}
  )
  const {state, visible, isActive, instant, syncHidden, buildTriggerableEvent} = showHide

  const isInstant = computed(() => options.noTransition() || instant.value)
  const isHiding = computed(() => !visible.value && isActive.value)

  const returnValue = shallowRef<unknown>()
  watch(state, (next, previous) => {
    if (next === 'showing' && previous === 'hidden') returnValue.value = undefined
  })

  const isShowingState = () => state.value === 'showing' || state.value === 'shown'
  // A trigger listener can call `hide()` again while an outer `hide()` is still running (an `ok`
  // listener calling `hide('saved', payload)`): the value belongs to the request that carried the
  // hide out, so an outer request that returns afterwards must not overwrite it
  let requestCount = 0
  let committedRequest = 0
  const hide = (
    trigger?: string,
    value?: unknown,
    noTriggerEmit = false
  ): Promise<boolean | string> => {
    const wasShowing = isShowingState()
    const request = ++requestCount
    const promise = showHide.hide(trigger, noTriggerEmit === true)
    // Carried out (not refused, not already hiding, and not by a nested request)
    if (wasShowing && !isShowingState() && committedRequest < request) {
      committedRequest = request
      returnValue.value = value
    }
    return promise
  }

  const bouncing = ref(false)
  /** A close request that is disabled: `hide-prevented` and the static bounce */
  const bounce = (trigger: string) => {
    const event = buildTriggerableEvent('hide-prevented', {cancelable: true, trigger})
    emit('hide-prevented', event)
    if (event.defaultPrevented || bouncing.value) return
    bouncing.value = true
    void runBounce().then(() => {
      bouncing.value = false
    })
  }

  const requestEscape = () => {
    if (options.keyboard()) {
      void hide('esc')
    } else {
      bounce('esc')
    }
  }

  /** Set while an Escape `keydown` was handled, so the `cancel` it may cause is not handled too */
  let escapeHandled = false
  useEventListener(element, 'keydown', (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented || !element.value?.open) return
    // Also keeps the browser from closing the dialog itself. A second Escape without user
    // activation in between cannot be cancelled through the `cancel` event alone. This runs while
    // the element is still open in its exit transition too, so the key press never reaches a
    // parent dialog that is still shown
    event.preventDefault()
    if (!isShowingState()) return
    escapeHandled = true
    setTimeout(() => {
      escapeHandled = false
    }, 0)
    requestEscape()
  })

  // Close requests that are not a key press on the dialog (Android back, assistive technology)
  useEventListener(element, 'cancel', (event: Event) => {
    if (event.target !== element.value) return
    event.preventDefault()
    if (escapeHandled || !isShowingState()) return
    requestEscape()
  })

  // Only a click that starts and ends on the backdrop counts, not a drag out of the dialog
  let pointerDownOnBackdrop = false
  useEventListener(element, 'pointerdown', (event: PointerEvent) => {
    pointerDownOnBackdrop = event.target === element.value
  })
  useEventListener(element, 'click', (event: MouseEvent) => {
    const onBackdrop = pointerDownOnBackdrop && event.target === element.value
    pointerDownOnBackdrop = false
    if (!onBackdrop || !openedAsModal || !isShowingState()) return
    const backdrop = options.backdrop()
    if (backdrop === false) return
    if (backdrop === 'static') {
      bounce('backdrop')
    } else {
      void hide('backdrop')
    }
  })

  // `<form method="dialog">` would close the dialog without the exit transition
  useEventListener(element, 'submit', (event: SubmitEvent) => {
    const form = event.target as HTMLFormElement | null
    const {submitter} = event
    const method = submitter?.getAttribute('formmethod') ?? form?.getAttribute('method')
    if (method?.toLowerCase() !== 'dialog' || event.defaultPrevented) return
    event.preventDefault()
    void hide('submit', (submitter as HTMLButtonElement | null)?.value || undefined)
  })

  // The browser closed the dialog itself. The `close` event of our own `close()` arrives here
  // too, after the state already left `showing` / `shown`, or after the dialog was reopened
  useEventListener(element, 'close', (event: Event) => {
    const el = element.value
    if (!el || event.target !== el || el.open) return
    scrollLocks.delete(el)
    updateScrollLock()
    openedAsModal = false
    if (!isShowingState()) return
    returnValue.value = el.returnValue || undefined
    void syncHidden('native')
  })

  onBeforeUnmount(() => {
    generation++
    closeElement()
  })

  const closedby = computed(() => (options.keyboard() ? undefined : ('none' as const)))

  return {
    ...showHide,
    hide,
    returnValue,
    isInstant,
    isHiding,
    bouncing,
    closedby,
  }
}
