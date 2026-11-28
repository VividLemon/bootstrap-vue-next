/**
 * Internal scroll-snap carousel engine for `BCarousel`. Not exported.
 *
 * Ported from Bootstrap v6 `js/src/carousel.ts` (MIT, https://github.com/twbs/bootstrap/blob/main/LICENSE)
 * rather than wrapping Bootstrap's class: that module registers `document` / `window` listeners at
 * import time and owns the DOM (`.active`, `aria-current`, `disabled`, cloned slides), which would
 * fight Vue's rendering. Vue renders every state here; the engine only reads layout, scrolls the
 * viewport and keeps the transient loop clone, which Vue never sees.
 */
import {
  computed,
  type MaybeRefOrGetter,
  onBeforeUnmount,
  onMounted,
  readonly,
  ref,
  type Ref,
  toValue,
} from 'vue'
import {getSafeDocument, getSafeWindow} from '../../utils/dom'
import type {CarouselEnds} from '../../types/CarouselTypes'

export type CarouselDirection = 'left' | 'right'

/** Result of a navigation request */
export type CarouselNavigation = 'started' | 'noop' | 'prevented' | 'invalid' | 'busy'

export interface CarouselSlideDetail {
  from: number
  to: number
  direction: CarouselDirection
  relatedTarget: HTMLElement | null
}

export interface CarouselEngineOptions {
  root: Readonly<Ref<HTMLElement | null>>
  viewport: Readonly<Ref<HTMLElement | null>>
  prevControl: Readonly<Ref<HTMLElement | null>>
  nextControl: Readonly<Ref<HTMLElement | null>>
  /** The active index (the component's `v-model`) */
  activeIndex: Ref<number>
  count: MaybeRefOrGetter<number>
  autoplay: MaybeRefOrGetter<boolean>
  ends: MaybeRefOrGetter<CarouselEnds>
  fade: MaybeRefOrGetter<boolean>
  center: MaybeRefOrGetter<boolean>
  auto: MaybeRefOrGetter<boolean>
  interval: MaybeRefOrGetter<number>
  keyboard: MaybeRefOrGetter<boolean>
  pauseOnHover: MaybeRefOrGetter<boolean>
  noTransition: MaybeRefOrGetter<boolean>
  /** Emits the cancelable `slide` event; returns `false` when it was prevented */
  onSlide: (detail: CarouselSlideDetail) => boolean
  onSlid: (detail: CarouselSlideDetail) => void
}

// Duration (ms) of the JS-driven scroll animation. Bootstrap steps `scrollLeft` itself instead of
// `scrollBy({behavior: 'smooth'})` because Safari mis-scales programmatic smooth scrolls under zoom.
const SCROLL_DURATION = 300
// How far below the most visible slide a slide's ratio may be while still counting as active
const ACTIVE_RATIO_TOLERANCE = 0.05
const CLONE_CLASS = 'carousel-item-clone'
const ITEM_SELECTOR = `:scope > .carousel-item:not(.${CLONE_CLASS})`

const easeInOutCubic = (progress: number): number =>
  progress < 0.5 ? 4 * progress * progress * progress : 1 - (-2 * progress + 2) ** 3 / 2

export const useCarouselEngine = (options: CarouselEngineOptions) => {
  const {root, viewport, activeIndex} = options

  /** Runtime autoplay intent: starts from `autoplay`, turned off for good on user interaction */
  const playing = ref(false)
  /** Whether the autoplay timer runs (renders `.carousel-playing`) */
  const cycling = ref(false)
  /** Wait of the current autoplay tick, for `--bs-carousel-interval` */
  const currentInterval = ref(toValue(options.interval))
  const atStart = ref(false)
  const atEnd = ref(false)

  let timer: ReturnType<typeof setTimeout> | null = null
  let observer: IntersectionObserver | null = null
  let scrollFrame: number | null = null
  let looping = false
  const visibility = new Map<Element, number>()

  const getItems = (): HTMLElement[] =>
    viewport.value ? Array.from(viewport.value.querySelectorAll<HTMLElement>(ITEM_SELECTOR)) : []

  const prefersReducedMotion = () => {
    const win = getSafeWindow()
    return (
      toValue(options.noTransition) ||
      (typeof win?.matchMedia === 'function' &&
        win.matchMedia('(prefers-reduced-motion: reduce)').matches)
    )
  }

  const isRTL = () => {
    const el = root.value
    const win = getSafeWindow()
    return !!el && !!win && win.getComputedStyle(el).direction === 'rtl'
  }

  const direction = (from: number, to: number): CarouselDirection => {
    const isNext = to > from
    if (isRTL()) return isNext ? 'right' : 'left'
    return isNext ? 'left' : 'right'
  }

  const wrapsAround = () => toValue(options.ends) !== 'stop'

  const normalizeIndex = (index: number, length: number): number | null => {
    if (Number.isNaN(index) || length === 0) return null
    if (index < 0) return wrapsAround() ? length - 1 : null
    if (index > length - 1) return wrapsAround() ? 0 : null
    return index
  }

  const isScrollable = () => {
    const vp = viewport.value
    return !!vp && vp.scrollWidth - vp.clientWidth > 0
  }

  // Distance to scroll the viewport so `element` rests where the active slide sits. Scrolls the
  // viewport itself (not `scrollIntoView`, which would also scroll the page). RTL-safe.
  const scrollDelta = (element: HTMLElement): number => {
    const vp = viewport.value
    if (!vp) return 0
    const viewportRect = vp.getBoundingClientRect()
    const rect = element.getBoundingClientRect()
    if (toValue(options.center)) {
      return rect.left + rect.width / 2 - (viewportRect.left + viewportRect.width / 2)
    }
    const padStart =
      Number.parseFloat(getSafeWindow()?.getComputedStyle(vp).scrollPaddingInlineStart ?? '') || 0
    return isRTL()
      ? rect.right - (viewportRect.right - padStart)
      : rect.left - (viewportRect.left + padStart)
  }

  // The index a step is measured from. Scroll layouts read the live scroll position, because the
  // observer updates the active index asynchronously.
  const navIndex = (): number => {
    if (toValue(options.fade) || !isScrollable()) return activeIndex.value
    let index = activeIndex.value
    let smallest = Number.POSITIVE_INFINITY
    getItems().forEach((item, i) => {
      const delta = Math.abs(scrollDelta(item))
      if (delta < smallest) {
        smallest = delta
        index = i
      }
    })
    return index
  }

  const scrollToLeft = (left: number) => {
    viewport.value?.scrollTo?.({left, behavior: 'instant'})
  }

  const setSnap = (value: string) => {
    if (viewport.value) viewport.value.style.scrollSnapType = value
  }

  const animateScroll = (targetLeft: number, onComplete: () => void) => {
    const vp = viewport.value
    if (!vp) return
    if (scrollFrame !== null) {
      cancelAnimationFrame(scrollFrame)
      scrollFrame = null
    }
    const startLeft = vp.scrollLeft
    const distance = targetLeft - startLeft
    if (prefersReducedMotion() || typeof requestAnimationFrame === 'undefined') {
      scrollToLeft(targetLeft)
      onComplete()
      return
    }
    let startTime: number | null = null
    const step = (now: number) => {
      if (startTime === null) startTime = now
      const progress = Math.min((now - startTime) / SCROLL_DURATION, 1)
      scrollToLeft(startLeft + distance * easeInOutCubic(progress))
      if (progress < 1) {
        scrollFrame = requestAnimationFrame(step)
        return
      }
      scrollToLeft(targetLeft)
      scrollFrame = null
      onComplete()
    }
    scrollFrame = requestAnimationFrame(step)
  }

  const jumpScroll = (delta: number) => {
    setSnap('none')
    viewport.value?.scrollBy?.({left: delta, top: 0, behavior: 'instant'})
  }

  const releaseFocus = (
    control: HTMLElement | null,
    opposite: HTMLElement | null,
    disabled: boolean
  ) => {
    // Move focus off a control that is about to be disabled
    if (disabled && control && control === getSafeDocument()?.activeElement) {
      ;(opposite ?? viewport.value)?.focus({preventScroll: true})
    }
  }

  const updateEndControls = () => {
    if (toValue(options.ends) !== 'stop') {
      atStart.value = false
      atEnd.value = false
      return
    }
    const vp = viewport.value
    let start: boolean
    let end: boolean
    if (vp && isScrollable()) {
      const progress = Math.abs(vp.scrollLeft)
      const max = vp.scrollWidth - vp.clientWidth
      start = progress <= 1
      end = progress >= max - 1
    } else {
      const last = toValue(options.count) - 1
      start = activeIndex.value <= 0
      end = activeIndex.value >= last
    }
    releaseFocus(options.prevControl.value, options.nextControl.value, start)
    releaseFocus(options.nextControl.value, options.prevControl.value, end)
    atStart.value = start
    atEnd.value = end
  }

  const setActive = (index: number) => {
    const items = getItems()
    if (index === activeIndex.value || !items[index]) return
    const from = activeIndex.value
    activeIndex.value = index
    updateEndControls()
    options.onSlid({
      from,
      to: index,
      direction: direction(from, index),
      relatedTarget: items[index],
    })
  }

  const scrollToIndex = (index: number) => {
    const item = getItems()[index]
    if (!item) return
    const left = scrollDelta(item)
    if (Math.abs(left) < 1) {
      // Already resting there (or no layout): nothing to scroll, settle right away
      setActive(index)
      updateEndControls()
      return
    }
    const vp = viewport.value
    if (!vp) return
    // `scroll-snap-stop: always` would clamp a multi-slide jump; suspend snapping while animating
    setSnap('none')
    animateScroll(vp.scrollLeft + left, () => {
      setSnap('')
      if (!observer) setActive(index)
      updateEndControls()
    })
  }

  // Seamless loop is only supported for the simple single-slide scroll layout
  const canLoop = () => {
    const el = root.value
    if (toValue(options.fade) || getItems().length < 2 || !el) return false
    const styles = getSafeWindow()?.getComputedStyle(el)
    const num = (name: string) => Number.parseFloat(styles?.getPropertyValue(name) ?? '') || 0
    return (
      (num('--bs-carousel-items') || 1) === 1 &&
      num('--bs-carousel-items-peek') === 0 &&
      !toValue(options.center) &&
      !toValue(options.auto)
    )
  }

  // Continue past an end into a transient clone of the destination, then teleport to the real slide.
  // The clone is never seen by Vue; navigation is ignored while it exists.
  const loopTransition = (isNext: boolean): CarouselNavigation => {
    const vp = viewport.value
    if (!vp) return 'invalid'
    const items = getItems()
    const last = items.length - 1
    const fromIndex = activeIndex.value
    const toIndex = isNext ? 0 : last
    const dir: CarouselDirection = isRTL() ? (isNext ? 'right' : 'left') : isNext ? 'left' : 'right'
    const target = items[toIndex] as HTMLElement
    if (!options.onSlide({from: fromIndex, to: toIndex, direction: dir, relatedTarget: target})) {
      return 'prevented'
    }
    looping = true
    const clone = target.cloneNode(true) as HTMLElement
    clone.classList.add(CLONE_CLASS)
    clone.classList.remove('active')
    clone.removeAttribute('id')
    clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'))
    clone.setAttribute('aria-hidden', 'true')
    clone.inert = true
    setSnap('none')
    if (isNext) {
      vp.append(clone)
    } else {
      vp.prepend(clone)
      const current = items[fromIndex]
      if (current) jumpScroll(scrollDelta(current))
    }
    animateScroll(vp.scrollLeft + scrollDelta(clone), () => {
      clone.remove()
      jumpScroll(scrollDelta(target))
      activeIndex.value = toIndex
      updateEndControls()
      options.onSlid({from: fromIndex, to: toIndex, direction: dir, relatedTarget: target})
      setSnap('')
      looping = false
    })
    return 'started'
  }

  const to = (index: number): CarouselNavigation => {
    if (looping) return 'busy'
    const items = getItems()
    const raw = Math.trunc(index)
    if (toValue(options.ends) === 'loop' && !prefersReducedMotion() && canLoop()) {
      if (raw > items.length - 1) return loopTransition(true)
      if (raw < 0) return loopTransition(false)
    }
    const target = normalizeIndex(raw, items.length)
    const current = navIndex()
    if (target === null) return 'invalid'
    if (target === current) return 'noop'
    const proceed = options.onSlide({
      from: current,
      to: target,
      direction: direction(current, target),
      relatedTarget: items[target] ?? null,
    })
    if (!proceed) return 'prevented'
    if (toValue(options.fade)) {
      setActive(target)
      return 'started'
    }
    scrollToIndex(target)
    return 'started'
  }

  const next = () => {
    to(navIndex() + 1)
  }
  const prev = () => {
    to(navIndex() - 1)
  }

  const isVisible = () => {
    const el = root.value
    return !!el && el.getClientRects().length > 0
  }

  const nextWhenVisible = () => {
    if (getSafeDocument()?.visibilityState === 'visible' && isVisible()) next()
  }

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  const itemInterval = (index: number) => {
    const value = Number.parseInt(getItems()[index]?.getAttribute('data-bs-interval') ?? '', 10)
    return Number.isNaN(value) ? toValue(options.interval) : value
  }

  const scheduleAutoplay = (index = activeIndex.value) => {
    const wait = itemInterval(index)
    currentInterval.value = wait
    timer = setTimeout(() => {
      // Capture where the advance lands before navigating; the active index updates asynchronously
      const upcoming = normalizeIndex(navIndex() + 1, getItems().length)
      nextWhenVisible()
      if (upcoming === null) {
        pause()
        return
      }
      scheduleAutoplay(upcoming)
    }, wait)
  }

  const pause = () => {
    clearTimer()
    cycling.value = false
  }

  const cycle = () => {
    clearTimer()
    scheduleAutoplay()
    cycling.value = true
  }

  /** Stops autoplay for good once the user takes control (WCAG 2.2.2) */
  const pauseFromInteraction = () => {
    playing.value = false
    pause()
  }

  const togglePlay = () => {
    if (playing.value) {
      pauseFromInteraction()
      return
    }
    playing.value = true
    cycle()
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (!toValue(options.keyboard)) return
    if (/input|textarea/i.test((event.target as HTMLElement | null)?.tagName ?? '')) return
    const isLeft = event.key === 'ArrowLeft'
    const isRight = event.key === 'ArrowRight'
    if (!isLeft && !isRight) return
    event.preventDefault()
    pauseFromInteraction()
    // ArrowLeft moves back in LTR and forward in RTL
    if (isLeft !== isRTL()) prev()
    else next()
  }

  const onMouseenter = () => {
    if (toValue(options.pauseOnHover)) pause()
  }
  const onMouseleave = () => {
    if (toValue(options.pauseOnHover) && playing.value) cycle()
  }
  const onPointerdown = () => pauseFromInteraction()

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    if (looping) return
    for (const entry of entries) {
      visibility.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0)
    }
    const ratios = getItems().map((item) => visibility.get(item) ?? 0)
    const maxRatio = Math.max(...ratios)
    let best = activeIndex.value
    // Left-most slide that is near fully visible (not the strict maximum, see Bootstrap)
    if (maxRatio > 0) best = ratios.findIndex((r) => r >= maxRatio - ACTIVE_RATIO_TOLERANCE)
    setActive(best)
    updateEndControls()
  }

  /** (Re)observes the slides; call after the slide list changed */
  const refresh = () => {
    observer?.disconnect()
    observer = null
    visibility.clear()
    const vp = viewport.value
    if (vp && !toValue(options.fade) && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(handleIntersection, {
        root: vp,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      })
      getItems().forEach((item) => observer?.observe(item))
    }
    updateEndControls()
  }

  /** Jumps to the active slide without animation (initial render, layout changes) */
  const syncScroll = () => {
    if (toValue(options.fade)) return
    const item = getItems()[activeIndex.value]
    if (!item) return
    const delta = scrollDelta(item)
    if (Math.abs(delta) >= 1) {
      jumpScroll(delta)
      setSnap('')
    }
  }

  onMounted(() => {
    syncScroll()
    refresh()
    playing.value = toValue(options.autoplay)
    if (playing.value) cycle()
  })

  onBeforeUnmount(() => {
    clearTimer()
    observer?.disconnect()
    if (scrollFrame !== null) cancelAnimationFrame(scrollFrame)
    viewport.value?.querySelectorAll(`.${CLONE_CLASS}`).forEach((clone) => clone.remove())
    setSnap('')
  })

  return {
    playing: readonly(playing),
    cycling: readonly(cycling),
    currentInterval: readonly(currentInterval),
    canPrev: computed(() => !atStart.value),
    canNext: computed(() => !atEnd.value),
    to,
    next,
    prev,
    nextWhenVisible,
    cycle,
    pause,
    togglePlay,
    pauseFromInteraction,
    setPlaying: (value: boolean) => {
      playing.value = value
      if (value) cycle()
      else pause()
    },
    refresh,
    syncScroll,
    onKeydown,
    onMouseenter,
    onMouseleave,
    onPointerdown,
  }
}
