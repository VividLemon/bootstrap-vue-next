import {
  getCurrentScope,
  type MaybeRefOrGetter,
  nextTick,
  onScopeDispose,
  readonly,
  type Ref,
  ref,
  toValue,
} from 'vue'
import {getSafeWindow} from '../utils/dom'

/**
 * Browsers throttle (about 1 Hz) or pause `requestAnimationFrame` in background tabs and
 * occluded views. The frame wait gives up after this long so events never stall there.
 */
const FRAME_FALLBACK_MS = 100

/**
 * `animation.finished` only settles while the page renders. In a background tab or an occluded
 * view a transition stays pending and never finishes, so the wait also ends this long after the
 * time the animations had left.
 */
const FINISH_FALLBACK_MARGIN_MS = 100

/**
 * Resolves on the next animation frame, or after `FRAME_FALLBACK_MS` when no frame comes.
 * Falls back to a macrotask when `requestAnimationFrame` is not available (SSR, some test
 * environments), so callers never hang.
 */
const nextFrame = (): Promise<void> =>
  new Promise((resolve) => {
    const win = getSafeWindow()
    if (win && typeof win.requestAnimationFrame === 'function') {
      const timer = setTimeout(resolve, FRAME_FALLBACK_MS)
      win.requestAnimationFrame(() => {
        clearTimeout(timer)
        resolve()
      })
      return
    }
    setTimeout(resolve, 0)
  })

/**
 * Infinite animations (spinners, pulses, ...) never finish, so waiting for them would hang the
 * transition forever. They are not show/hide transitions, so they are ignored.
 */
const isFiniteAnimation = (animation: Animation): boolean => {
  const timing = animation.effect?.getComputedTiming?.()
  return timing?.endTime !== Infinity
}

/** The time an animation still needs, in ms. `0` when it cannot be told */
const getRemainingTime = (animation: Animation): number => {
  const endTime = Number(animation.effect?.getComputedTiming?.().endTime)
  if (!Number.isFinite(endTime)) return 0
  const currentTime = Number(animation.currentTime ?? 0)
  const playbackRate = Math.abs(animation.playbackRate) || 1
  return Math.max(endTime - (Number.isFinite(currentTime) ? currentTime : 0), 0) / playbackRate
}

/**
 * Resolves once every animation settled (finished or cancelled), or once they should have
 * finished by the clock, whichever comes first.
 */
const waitForAnimations = (animations: readonly Animation[]): Promise<void> =>
  new Promise((resolve) => {
    const timer = setTimeout(
      resolve,
      Math.max(...animations.map(getRemainingTime)) + FINISH_FALLBACK_MARGIN_MS
    )
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      clearTimeout(timer)
      resolve()
    })
  })

const getOwnAnimations = (el: Element | null | undefined): Animation[] => {
  if (!el || typeof el.getAnimations !== 'function') return []
  // `getAnimations()` without `{subtree: true}` only returns the element's own animations,
  // so a transition on a descendant never delays the element's events.
  return el.getAnimations().filter(isFiniteAnimation)
}

export interface UseCssTransitionReturn {
  /**
   * Runs one transition step:
   *
   * 1. calls `apply` (optional) to change the element's state class, synchronously, either by
   *    touching `classList` or by changing reactive state that drives `:class`;
   * 2. waits for Vue to patch the DOM (`nextTick`) and for one animation frame;
   * 3. awaits every finite animation / CSS transition running on the element itself
   *    (`el.getAnimations()`, settled with `Promise.allSettled`, so a cancelled transition
   *    counts as settled). The wait is bounded by the time the animations have left, so it
   *    also ends where the browser does not run them (background tabs).
   *
   * With no running animations (zero duration, `prefers-reduced-motion`, an `-instant` class,
   * `transition-none`, or no element) it resolves right after that frame.
   *
   * Resolves `true` when the step finished **and** is still the latest call. Resolves `false`
   * when a newer `run()` or `cancel()` happened in the meantime, so the caller must not fire its
   * "finished" event (`shown` / `hidden`).
   */
  run: (apply?: () => void) => Promise<boolean>
  /** Invalidates the pending `run()`, which then resolves `false`. */
  cancel: () => void
  /** `true` while a `run()` is pending and has not been invalidated. */
  isTransitioning: Readonly<Ref<boolean>>
}

/**
 * Waits for a Bootstrap v6 CSS transition on an element.
 *
 * Bootstrap v6 lets CSS own all motion: JavaScript toggles a state class (`.show`, `.active`,
 * `.hiding`, ...), waits for the element's transition to end, then fires its event. This
 * composable is the "wait" part. It holds no class or visibility logic of its own.
 *
 * SSR-safe: no browser globals are touched until `run()` is called, and every browser API is
 * feature-checked.
 *
 * Typical use together with `useShowHide`:
 *
 * ```ts
 * const element = useTemplateRef<HTMLElement>('_element')
 * const {run} = useCssTransition(element)
 * const {visible, instant} = useShowHide(
 *   {modelValue, props, emit, element, id},
 *   // `visible` was already updated (and drives `:class="{show: visible}"`) when this is called
 *   {transition: () => run()}
 * )
 * const classes = computed(() => ({
 *   'show': visible.value,
 *   'toast-instant': props.noTransition || instant.value,
 * }))
 * ```
 *
 * Standalone use, applying the class change itself:
 *
 * ```ts
 * const {run} = useCssTransition(el)
 * const done = await run(() => el.value?.classList.add('hiding'))
 * if (done) emit('closed')
 * ```
 *
 * Components opt out of motion with their v6 `{component}-instant` class or the
 * `transition-none` utility; `run()` then resolves on the next frame.
 *
 * @param element The element whose own animations are awaited. A ref, getter or plain value;
 *   read when the frame has passed, so it may still be `null` when `run()` is called.
 */
export const useCssTransition = (
  element: MaybeRefOrGetter<Element | null | undefined>
): UseCssTransitionReturn => {
  let generation = 0
  const isTransitioning = ref(false)

  const run = async (apply?: () => void): Promise<boolean> => {
    const id = ++generation
    isTransitioning.value = true
    apply?.()

    await nextTick()
    await nextFrame()
    if (id !== generation) return false

    const animations = getOwnAnimations(toValue(element))
    if (animations.length > 0) {
      await waitForAnimations(animations)
    }
    if (id !== generation) return false

    isTransitioning.value = false
    return true
  }

  const cancel = () => {
    generation++
    isTransitioning.value = false
  }

  if (getCurrentScope()) {
    onScopeDispose(cancel)
  }

  return {
    run,
    cancel,
    isTransitioning: readonly(isTransitioning),
  }
}
