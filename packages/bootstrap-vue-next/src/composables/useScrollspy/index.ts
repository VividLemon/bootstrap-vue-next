/**
 * Port of Bootstrap v6 Scrollspy (`bootstrap/js/src/scrollspy.ts`, 6.0.0-alpha.1) to a reactive
 * composable. Diff upstream fixes against that file.
 *
 * Differences from upstream, all deliberate:
 * - Reactive only: the composable never writes `.active` (or any other state) to the links. It
 *   exposes the active section id (`current`) and the active parent chain (`activeIds`,
 *   `activeLinks`) for templates to bind. The only DOM it adds is v6's bottom sentinel.
 * - No `activate` event: watch `current`.
 * - `watchChanges` re-scans sections when the content or target changes (v6 needs `refresh()`).
 * - Scroll positions are measured against the scroll root with `getBoundingClientRect()`
 *   instead of `offsetTop`, so sections inside positioned wrappers land correctly.
 * - The parent chain only looks at ancestors inside the target.
 */
import {tryOnMounted, tryOnScopeDispose} from '@vueuse/core'
import {
  type ComponentPublicInstance,
  type MaybeRefOrGetter,
  nextTick,
  readonly,
  type Ref,
  ref,
  shallowReadonly,
  shallowRef,
  toValue,
  watch,
} from 'vue'
import type {ScrollspySection, UseScrollspyOptions} from '../../types/Scrollspy'
import {getElement} from '../../utils/getElement'
import {getSafeDocument, getSafeWindow} from '../../utils/dom'

const SELECTOR_TARGET_LINKS = '[href]'
const SELECTOR_NAV_LIST_GROUP = '.nav, .list-group'
const SELECTOR_LINK_ITEMS = '.nav-link, .nav-item > .nav-link, .list-group-item'
const SELECTOR_MENU_TOGGLE = '[data-bs-toggle="menu"]'
const CLASS_NAME_MENU_ITEM = 'menu-item'

// How long (ms) to wait after the last scroll event before settling a pending smooth-scroll
// navigation when the native `scrollend` event is unavailable
const SCROLL_IDLE_TIMEOUT = 100
// Debounce (ms) for rebuilding the observer on resize (px activation lines only)
const RESIZE_DEBOUNCE = 100

type ElementSource = string | ComponentPublicInstance | HTMLElement | null

export interface UseScrollspyReturn {
  /**
   * Id of the active section, `null` until the first activation (after mount)
   */
  current: Readonly<Ref<string | null>>
  /**
   * Ids of the active section and of its parent sections in nested navs, nearest first.
   * Bind `:active="activeIds.includes(id)"` on nested nav links
   */
  activeIds: Readonly<Ref<readonly string[]>>
  /**
   * The active link followed by the parent links Bootstrap would activate
   * (previous `.nav-link` / `.list-group-item` of each ancestor `.nav` / `.list-group`,
   * or the `[data-bs-toggle="menu"]` toggle of a `.menu-item`)
   */
  activeLinks: Readonly<Ref<readonly HTMLElement[]>>
  /**
   * Spied sections, top to bottom
   */
  sections: Readonly<Ref<readonly ScrollspySection[]>>
  /**
   * The resolved content (spied) element
   */
  content: Readonly<Ref<HTMLElement | null>>
  /**
   * The resolved target (nav) element
   */
  target: Readonly<Ref<HTMLElement | null>>
  /**
   * Scrolls to a section by id, or to the section of the clicked link when passed a click event.
   * Then replaces the URL hash (no history entry) and focuses the section.
   * `smooth` defaults to the `smoothScroll` option; reduced motion always scrolls instantly
   */
  scrollTo: (idOrEvent: string | Event, opts?: {smooth?: boolean}) => void
  /**
   * Re-scans the target's links and rebuilds the observers
   */
  refresh: () => void
  /**
   * Stops observing and removes the sentinel. Runs automatically when the scope is disposed
   */
  dispose: () => void
}

// Decode a URL fragment id, tolerating malformed escapes (returns it as-is)
const decodeFragment = (hash: string): string => {
  try {
    return decodeURIComponent(hash)
  } catch {
    return hash
  }
}

const getHash = (link: Element): string => {
  const href = link.getAttribute('href')
  if (!href) return ''
  const index = href.indexOf('#')
  return index === -1 ? '' : href.slice(index)
}

const getLinkId = (link: Element): string => {
  const hash = getHash(link)
  return hash.length > 1 ? decodeFragment(hash.slice(1)) : ''
}

const isDisabled = (element: Element): boolean => {
  if (element.classList.contains('disabled')) return true
  const disableable = element as HTMLElement & {disabled?: boolean}
  if (typeof disableable.disabled !== 'undefined') return disableable.disabled
  return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false'
}

const isVisible = (element: HTMLElement): boolean => {
  if (element.getClientRects().length === 0) return false
  // Upstream compares with 'visible'; the only other values are 'hidden' and 'collapse'
  const visibility = getComputedStyle(element).getPropertyValue('visibility')
  const elementIsVisible = visibility !== 'hidden' && visibility !== 'collapse'
  // Handle `details` element as its content may falsely appear visible when it is closed
  const closedDetails = element.closest('details:not([open])')
  if (!closedDetails) return elementIsVisible
  if (closedDetails !== element) {
    const summary = element.closest('summary')
    if (summary && summary.parentNode !== closedDetails) return false
    if (summary === null) return false
  }
  return elementIsVisible
}

export const useScrollspy = (
  content: MaybeRefOrGetter<ElementSource>,
  target: MaybeRefOrGetter<ElementSource> = null,
  options: MaybeRefOrGetter<UseScrollspyOptions> = {}
): UseScrollspyReturn => {
  const current = ref<string | null>(null)
  const activeIds = shallowRef<readonly string[]>([])
  const activeLinks = shallowRef<readonly HTMLElement[]>([])
  const sections = shallowRef<readonly ScrollspySection[]>([])
  const resolvedContent = shallowRef<HTMLElement | null>(null)
  const resolvedTarget = shallowRef<HTMLElement | null>(null)

  const resolveOptions = () => {
    const value = toValue(options) ?? {}
    return {
      topMargin: value.topMargin ?? '12%',
      rootMargin: value.rootMargin ?? null,
      threshold: value.threshold ?? [0],
      smoothScroll: value.smoothScroll ?? false,
      watchChanges: value.watchChanges ?? true,
    }
  }
  let config = resolveOptions()

  // Internal state, mirrors the upstream class fields
  let sectionEls: HTMLElement[] = []
  let linkBySection = new Map<HTMLElement, HTMLElement>()
  let sectionByLink = new Map<HTMLElement, HTMLElement>()
  const intersecting = new Set<Element>()
  let activeLink: HTMLElement | null = null
  let lastActive: HTMLElement | null = null
  let atBottom = false
  let rootElement: HTMLElement | null = null
  let observer: IntersectionObserver | null = null
  let sentinel: HTMLElement | null = null
  // Every sentinel this instance created, so their insertion and removal never trigger a refresh
  const sentinels = new WeakSet<Node>()
  let sentinelObserver: IntersectionObserver | null = null
  let pendingNavigation: {hash: string; section: HTMLElement} | null = null
  let settleTimeout: ReturnType<typeof setTimeout> | undefined
  let settleTarget: HTMLElement | Document | null = null
  let resizeTimeout: ReturnType<typeof setTimeout> | undefined
  let resizeListening = false
  let clickTarget: HTMLElement | null = null
  let mutationObserver: MutationObserver | null = null
  let refreshQueued = false
  let mounted = false
  let disposed = false

  // --- Active state (reactive output only) --------------------------------

  const getParentChain = (link: HTMLElement): HTMLElement[] => {
    const chain: HTMLElement[] = [link]
    const container = resolvedTarget.value

    // Menu parents
    if (link.classList.contains(CLASS_NAME_MENU_ITEM)) {
      const menuToggle = link.closest('.menu')?.previousElementSibling
      if (menuToggle?.matches(SELECTOR_MENU_TOGGLE)) chain.push(menuToggle as HTMLElement)
      return chain
    }

    // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor
    let listGroup = link.parentElement?.closest(SELECTOR_NAV_LIST_GROUP) ?? null
    while (listGroup && (!container || container.contains(listGroup))) {
      let previous = listGroup.previousElementSibling
      while (previous) {
        if (previous.matches(SELECTOR_LINK_ITEMS)) {
          chain.push(previous as HTMLElement)
          break
        }
        previous = previous.previousElementSibling
      }
      listGroup = listGroup.parentElement?.closest(SELECTOR_NAV_LIST_GROUP) ?? null
    }
    return chain
  }

  const process = (link: HTMLElement, section: HTMLElement) => {
    if (activeLink === link && current.value === section.id) return
    activeLink = link
    const chain = getParentChain(link)
    const ids = [section.id]
    chain.slice(1).forEach((el) => {
      const id = getLinkId(el)
      if (id && !ids.includes(id)) ids.push(id)
    })
    current.value = section.id
    activeIds.value = ids
    activeLinks.value = chain
  }

  const clearActive = () => {
    activeLink = null
    lastActive = null
    current.value = null
    activeIds.value = []
    activeLinks.value = []
  }

  // The active section is the deepest (top-to-bottom) one crossing the activation line; in a gap
  // the last one stays active; above the first section the first is active; at the very bottom
  // the last section wins
  const computeActive = () => {
    if (!resolvedContent.value?.isConnected || sectionEls.length === 0) return

    let active: HTMLElement | null | undefined = null
    if (atBottom) {
      active = sectionEls.at(-1)
    } else {
      for (const section of sectionEls) {
        if (intersecting.has(section)) active = section
      }
      active ||= lastActive ?? sectionEls.at(0)
    }
    if (!active) return

    lastActive = active
    const link = linkBySection.get(active)
    if (link) process(link, active)
  }

  // --- Detection ----------------------------------------------------------

  const parseTopMargin = (): {value: number; unit: '%' | 'px'} => {
    const value = String(config.topMargin)
    return {value: Number.parseFloat(value) || 0, unit: value.endsWith('%') ? '%' : 'px'}
  }

  // Collapse the observer root to a strip from the top down to the activation line, so a section
  // is "intersecting" exactly while it crosses that line
  const getDerivedRootMargin = (): string => {
    const {value, unit} = parseTopMargin()
    let percent = value
    if (unit === 'px') {
      const win = getSafeWindow()
      const doc = getSafeDocument()
      const rootHeight = rootElement
        ? rootElement.clientHeight
        : doc?.documentElement.clientHeight || win?.innerHeight || 0
      percent = rootHeight ? (value / rootHeight) * 100 : 12
    }
    const bottom = Math.min(Math.max(100 - percent, 0), 100)
    return `0px 0px -${bottom}% 0px`
  }

  const usesPixelMargin = () => !config.rootMargin && parseTopMargin().unit === 'px'

  const onIntersect = (entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      if (entry.isIntersecting) intersecting.add(entry.target)
      else intersecting.delete(entry.target)
    }
    computeActive()
  }

  const rebuildObserver = () => {
    observer?.disconnect()
    observer = null
    intersecting.clear()
    const win = getSafeWindow()
    if (!win || typeof win.IntersectionObserver === 'undefined' || sectionEls.length === 0) return
    const threshold = config.threshold
    observer = new win.IntersectionObserver(onIntersect, {
      root: rootElement,
      threshold,
      rootMargin: config.rootMargin ?? getDerivedRootMargin(),
    })
    sectionEls.forEach((section) => observer?.observe(section))
  }

  // --- Bottom sentinel ----------------------------------------------------

  const isOverflowing = () => {
    const doc = getSafeDocument()
    const scroller = rootElement || doc?.scrollingElement || doc?.documentElement
    return scroller ? scroller.scrollHeight > scroller.clientHeight : false
  }

  const onSentinel = (entries: IntersectionObserverEntry[]) => {
    const entry = entries.at(-1)
    // Only treat the sentinel as "bottom reached" when content actually overflows
    atBottom = Boolean(entry?.isIntersecting) && isOverflowing()
    computeActive()
  }

  const teardownSentinel = () => {
    sentinelObserver?.disconnect()
    sentinelObserver = null
    sentinel?.remove()
    sentinel = null
    atBottom = false
  }

  const setUpSentinel = () => {
    teardownSentinel()
    const doc = getSafeDocument()
    const win = getSafeWindow()
    const contentEl = resolvedContent.value
    if (!doc || !win || !contentEl || sectionEls.length === 0) return
    if (typeof win.IntersectionObserver === 'undefined') return

    const el = doc.createElement('div')
    el.setAttribute('aria-hidden', 'true')
    el.style.cssText =
      'position:relative;width:0;height:0;margin:0;padding:0;border:0;visibility:hidden;'
    sentinels.add(el)
    contentEl.append(el)
    sentinel = el

    sentinelObserver = new win.IntersectionObserver(onSentinel, {root: rootElement, threshold: [0]})
    sentinelObserver.observe(el)
  }

  // --- Resize (px activation lines only) ----------------------------------

  const onResize = () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      if (observer) rebuildObserver()
    }, RESIZE_DEBOUNCE)
  }

  const removeResizeListener = () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = undefined
    if (resizeListening) {
      getSafeWindow()?.removeEventListener('resize', onResize)
      resizeListening = false
    }
  }

  const maybeAddResizeListener = () => {
    removeResizeListener()
    if (!usesPixelMargin()) return
    const win = getSafeWindow()
    if (!win) return
    win.addEventListener('resize', onResize)
    resizeListening = true
  }

  // --- Scroll and settle (hash + focus) -----------------------------------

  const settleNavigation = (hash: string, section: HTMLElement) => {
    pendingNavigation = null
    const win = getSafeWindow()
    if (win?.history?.replaceState) win.history.replaceState(win.history.state, '', hash)
    if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1')
    section.focus({preventScroll: true})
  }

  const onSettleScroll = () => {
    clearTimeout(settleTimeout)
    settleTimeout = setTimeout(onSettle, SCROLL_IDLE_TIMEOUT)
  }

  const disarmSettle = () => {
    clearTimeout(settleTimeout)
    settleTimeout = undefined
    if (settleTarget) {
      settleTarget.removeEventListener('scrollend', onSettle)
      settleTarget.removeEventListener('scroll', onSettleScroll)
      settleTarget = null
    }
  }

  function onSettle() {
    disarmSettle()
    if (!pendingNavigation) return
    const {hash, section} = pendingNavigation
    settleNavigation(hash, section)
  }

  const armSettle = () => {
    disarmSettle()
    const doc = getSafeDocument()
    settleTarget = rootElement || doc
    settleTarget?.addEventListener('scrollend', onSettle)
    settleTarget?.addEventListener('scroll', onSettleScroll)
  }

  const navigate = (section: HTMLElement, hash: string, smooth: boolean) => {
    const win = getSafeWindow()
    if (!win) return

    const sectionTop = section.getBoundingClientRect().top
    const currentTop = rootElement ? rootElement.scrollTop : win.scrollY
    const top = rootElement
      ? currentTop + sectionTop - rootElement.getBoundingClientRect().top - rootElement.clientTop
      : currentTop + sectionTop
    const scroller: Pick<Window, 'scrollTo'> = rootElement ?? win
    const reduceMotion = win.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    // Already in place, instant, or reduced motion: no `scrollend` to wait for, settle at once
    if (!smooth || reduceMotion || Math.abs(currentTop - top) <= 2) {
      scroller.scrollTo({top, behavior: 'auto'})
      settleNavigation(hash, section)
      return
    }

    // Defer the hash and focus updates until the scroll settles
    pendingNavigation = {hash, section}
    armSettle()
    scroller.scrollTo({top, behavior: 'smooth'})
  }

  const resolveSection = (id: string): HTMLElement | null => {
    const contentEl = resolvedContent.value
    const section = id ? (getSafeDocument()?.getElementById(id) ?? null) : null
    return section && contentEl?.contains(section) ? section : null
  }

  const scrollTo: UseScrollspyReturn['scrollTo'] = (idOrEvent, opts = {}) => {
    const smooth = opts.smooth ?? config.smoothScroll
    if (typeof idOrEvent === 'string') {
      const id = idOrEvent.startsWith('#') ? decodeFragment(idOrEvent.slice(1)) : idOrEvent
      const section = resolveSection(id)
      if (section) navigate(section, `#${id}`, smooth)
      return
    }
    const origin = idOrEvent.target as Element | null
    const link = origin?.closest?.(SELECTOR_TARGET_LINKS) as HTMLElement | null | undefined
    if (!link) return
    const section = sectionByLink.get(link) ?? resolveSection(getLinkId(link))
    if (!section) return
    idOrEvent.preventDefault()
    navigate(section, getHash(link), smooth)
  }

  const onTargetClick = (event: Event) => {
    const link = (event.target as Element | null)?.closest?.(SELECTOR_TARGET_LINKS) as
      HTMLElement | null | undefined
    const section = link ? sectionByLink.get(link) : undefined
    if (!link || !section || !resolvedContent.value) return
    event.preventDefault()
    navigate(section, getHash(link), true)
  }

  const removeClickListener = () => {
    clickTarget?.removeEventListener('click', onTargetClick)
    clickTarget = null
  }

  const maybeEnableSmoothScroll = () => {
    removeClickListener()
    if (!config.smoothScroll || !resolvedTarget.value) return
    clickTarget = resolvedTarget.value
    clickTarget.addEventListener('click', onTargetClick)
  }

  // --- Targets and observables --------------------------------------------

  const initializeTargetsAndObservables = () => {
    sectionEls = []
    linkBySection = new Map()
    sectionByLink = new Map()

    const doc = getSafeDocument()
    const contentEl = resolvedContent.value
    const targetEl = resolvedTarget.value
    if (!doc || !contentEl || !targetEl) return

    const seen = new Set<HTMLElement>()
    for (const link of targetEl.querySelectorAll<HTMLElement>(SELECTOR_TARGET_LINKS)) {
      if (isDisabled(link)) continue
      // Resolve by id rather than a CSS selector, so any literal id works without escaping
      const id = getLinkId(link)
      if (!id) continue
      const section = doc.getElementById(id)
      if (!section || !contentEl.contains(section) || !isVisible(section)) continue

      sectionByLink.set(link, section)
      linkBySection.set(section, link) // last link wins for a section
      if (!seen.has(section)) {
        seen.add(section)
        sectionEls.push(section)
      }
    }

    // Top-to-bottom order so "deepest" is well-defined
    sectionEls.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
  }

  // --- Watching changes ---------------------------------------------------

  const isSentinelRecord = (record: MutationRecord) =>
    record.target === sentinel ||
    (record.type === 'childList' &&
      [...record.addedNodes, ...record.removedNodes].every((node) => sentinels.has(node)))

  const queueRefresh = () => {
    if (refreshQueued) return
    refreshQueued = true
    nextTick(() => {
      refreshQueued = false
      if (!disposed) refresh()
    })
  }

  const stopMutationObserver = () => {
    mutationObserver?.disconnect()
    mutationObserver = null
  }

  const setUpMutationObserver = () => {
    stopMutationObserver()
    const win = getSafeWindow()
    if (!config.watchChanges || !win || typeof win.MutationObserver === 'undefined') return
    const observed = [resolvedContent.value, resolvedTarget.value].filter(
      (el): el is HTMLElement => !!el
    )
    if (observed.length === 0) return
    mutationObserver = new win.MutationObserver((records) => {
      if (records.every(isSentinelRecord)) return
      queueRefresh()
    })
    new Set(observed).forEach((el) =>
      mutationObserver?.observe(el, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['href', 'id'],
      })
    )
  }

  // --- Public -------------------------------------------------------------

  const resolveElements = () => {
    const contentEl = getElement(toValue(content)) ?? null
    const targetEl = getElement(toValue(target)) ?? getSafeDocument()?.body ?? null
    const changed = contentEl !== resolvedContent.value || targetEl !== resolvedTarget.value
    resolvedContent.value = contentEl
    resolvedTarget.value = targetEl
    return changed
  }

  function refresh() {
    if (disposed || !getSafeDocument()) return
    config = resolveOptions()
    const contentEl = resolvedContent.value
    rootElement =
      contentEl && getComputedStyle(contentEl).overflowY !== 'visible' ? contentEl : null

    initializeTargetsAndObservables()
    maybeEnableSmoothScroll()
    rebuildObserver()
    setUpSentinel()
    maybeAddResizeListener()

    if (lastActive && !sectionEls.includes(lastActive)) clearActive()
    if (sectionEls.length === 0) clearActive()

    sections.value = sectionEls.map((el) => ({
      id: el.id,
      el,
      link: linkBySection.get(el) as HTMLElement,
    }))
  }

  const teardown = () => {
    observer?.disconnect()
    observer = null
    intersecting.clear()
    teardownSentinel()
    disarmSettle()
    pendingNavigation = null
    removeResizeListener()
    removeClickListener()
    stopMutationObserver()
  }

  const stopWatchers: (() => void)[] = []

  const dispose = () => {
    if (disposed) return
    disposed = true
    stopWatchers.forEach((stop) => stop())
    teardown()
  }

  tryOnMounted(() => {
    if (disposed || !getSafeDocument()) return
    mounted = true
    resolveElements()
    refresh()
    setUpMutationObserver()
  }, false)

  stopWatchers.push(
    watch(
      () => [toValue(content), toValue(target)],
      () => {
        if (!mounted || disposed) return
        if (resolveElements()) {
          clearActive()
          refresh()
          setUpMutationObserver()
        }
      },
      {flush: 'post'}
    ),
    watch(
      () => ({...toValue(options)}),
      () => {
        if (!mounted || disposed) return
        refresh()
        setUpMutationObserver()
      },
      {flush: 'post', deep: true}
    )
  )

  tryOnScopeDispose(dispose)

  return {
    current: readonly(current),
    activeIds: readonly(activeIds),
    // shallowReadonly: elements must not be wrapped in readonly proxies
    activeLinks: shallowReadonly(activeLinks),
    sections: shallowReadonly(sections),
    content: shallowReadonly(resolvedContent),
    target: shallowReadonly(resolvedTarget),
    scrollTo,
    refresh,
    dispose,
  }
}
