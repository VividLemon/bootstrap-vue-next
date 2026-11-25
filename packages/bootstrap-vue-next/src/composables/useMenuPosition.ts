import {
  autoUpdate,
  type ComputePositionConfig,
  computePosition,
  flip,
  type Middleware,
  offset,
  type Placement,
  type ReferenceElement,
  shift,
  type Strategy,
} from '@floating-ui/vue'
import {
  computed,
  type MaybeRefOrGetter,
  onBeforeUnmount,
  onMounted,
  type Ref,
  ref,
  toValue,
  watch,
} from 'vue'
import type {Responsive} from '../types/BreakpointProps'
import type {MenuFloatingConfig, MenuOffset, MenuPlacement, MenuReference} from '../types/MenuTypes'
import {breakpoints, breakpointWidths} from '../utils/responsive'
import {getSafeDocument, getSafeWindow} from '../utils/dom'

/**
 * Bootstrap v6 `menu.ts` flip fallbacks per (physical) placement
 */
const fallbackMap: Record<string, Placement[]> = {
  'bottom': ['top', 'bottom-start', 'bottom-end', 'top-start', 'top-end'],
  'bottom-start': ['top-start', 'bottom-end', 'top-end'],
  'bottom-end': ['top-end', 'bottom-start', 'top-start'],
  'top': ['bottom', 'top-start', 'top-end', 'bottom-start', 'bottom-end'],
  'top-start': ['bottom-start', 'top-end', 'bottom-end'],
  'top-end': ['bottom-end', 'top-start', 'bottom-start'],
  'right': ['left', 'right-start', 'right-end', 'left-start', 'left-end'],
  'right-start': ['left-start', 'right-end', 'left-end', 'top-start', 'bottom-start'],
  'right-end': ['left-end', 'right-start', 'left-start', 'top-end', 'bottom-end'],
  'left': ['right', 'left-start', 'left-end', 'right-start', 'right-end'],
  'left-start': ['right-start', 'left-end', 'right-end', 'top-start', 'bottom-start'],
  'left-end': ['right-end', 'left-start', 'right-start', 'top-end', 'bottom-end'],
}

const isRtl = (): boolean => getSafeDocument()?.documentElement.dir === 'rtl'

/**
 * Resolves the logical sides `start` / `end` to `left` / `right` from the document direction, as
 * Bootstrap v6 does (`<html dir="rtl">`)
 *
 * @internal
 */
export const resolveMenuPlacement = (placement: MenuPlacement, rtl = isRtl()): Placement =>
  (rtl
    ? placement.replace(/^start(?=-|$)/, 'right').replace(/^end(?=-|$)/, 'left')
    : placement.replace(/^start(?=-|$)/, 'left').replace(/^end(?=-|$)/, 'right')) as Placement

/**
 * Returns the `fallbackPlacements` Bootstrap v6 gives `flip` for a placement
 *
 * @internal
 */
export const getMenuFallbackPlacements = (placement: Placement): Placement[] =>
  fallbackMap[placement] ?? ['top', 'bottom', 'right', 'left']

export interface UseMenuPositionOptions {
  /** The element the menu is positioned against when `reference` is `'toggle'` */
  toggle: Readonly<Ref<HTMLElement | null>>
  /** The `.menu` element */
  menu: Readonly<Ref<HTMLElement | null>>
  placement: MaybeRefOrGetter<MenuPlacement>
  responsivePlacement: MaybeRefOrGetter<Readonly<Responsive<MenuPlacement>> | undefined>
  offset: MaybeRefOrGetter<MenuOffset>
  boundary: MaybeRefOrGetter<'clippingParents' | HTMLElement>
  strategy: MaybeRefOrGetter<Strategy>
  reference: MaybeRefOrGetter<MenuReference>
  display: MaybeRefOrGetter<'dynamic' | 'static'>
  floatingConfig: MaybeRefOrGetter<MenuFloatingConfig | undefined>
}

/**
 * Positions a Bootstrap v6 `.menu` with Floating UI, porting v6 `menu.ts`: `offset`, `flip` with
 * v6's fallback map and `fallbackStrategy: 'initialPlacement'`, `shift` on `boundary`, and no
 * `size`. The position is written as `position` / `left` / `top` / `margin: 0` (never
 * `transform`, which v6's CSS animates), and the final placement as `data-bs-placement` for
 * v6's `transform-origin` rules.
 *
 * Call `start()` when a show starts and `stop()` once the menu is hidden (v6 keeps positioning
 * during the exit transition). Nothing runs on the server.
 *
 * @internal
 */
export interface UseMenuPositionReturn {
  /** `position`, `left`, `top` and `margin` for the menu's `style` */
  floatingStyles: Readonly<Ref<Record<string, string>>>
  /** The placement Floating UI settled on, for `data-bs-placement` */
  finalPlacement: Readonly<Ref<Placement | undefined>>
  /** `display: 'static'` is active: no positioning, `data-bs-display="static"` */
  isStatic: Readonly<Ref<boolean>>
  start: () => void
  update: () => Promise<void>
  reset: () => void
}

export const useMenuPosition = (options: UseMenuPositionOptions): UseMenuPositionReturn => {
  const floatingStyles = ref<Record<string, string>>({})
  const finalPlacement = ref<Placement | undefined>(undefined)
  const isStatic = ref(false)

  // The largest breakpoint that matches, from `matchMedia` listeners created on the client and
  // only while a responsive placement is set
  const activeBreakpoint = ref<keyof typeof breakpointWidths>('xs')
  let mediaCleanup: (() => void) | undefined
  const setupMedia = () => {
    mediaCleanup?.()
    mediaCleanup = undefined
    const win = getSafeWindow()
    if (!toValue(options.responsivePlacement) || !win?.matchMedia) return
    const queries = breakpoints.map(
      (bp) => [bp, win.matchMedia(`(min-width: ${breakpointWidths[bp]}px)`)] as const
    )
    const read = () => {
      activeBreakpoint.value = queries.reduce<keyof typeof breakpointWidths>(
        (active, [bp, mql]) => (mql.matches ? bp : active),
        'xs'
      )
    }
    read()
    queries.forEach(([, mql]) => mql.addEventListener('change', read))
    mediaCleanup = () => queries.forEach(([, mql]) => mql.removeEventListener('change', read))
  }
  onMounted(() => {
    watch(() => !!toValue(options.responsivePlacement), setupMedia, {immediate: true})
  })

  const placement = computed<Placement>(() => {
    let value = toValue(options.placement)
    const responsive = toValue(options.responsivePlacement)
    if (responsive) {
      const width = breakpointWidths[activeBreakpoint.value]
      ;(['xs', ...breakpoints] as const).forEach((bp) => {
        const entry = responsive[bp]
        if (entry && breakpointWidths[bp] <= width) value = entry
      })
    }
    return resolveMenuPlacement(value)
  })

  const resolveReference = (): ReferenceElement | null => {
    const reference = toValue(options.reference)
    if (reference === 'toggle') return options.toggle.value
    if (reference === 'parent') return options.toggle.value?.parentElement ?? null
    return reference
  }

  const getConfig = (): ComputePositionConfig => {
    const offsetValue = toValue(options.offset)
    const boundary = toValue(options.boundary)
    const middleware: Middleware[] = [
      offset(
        typeof offsetValue === 'function'
          ? ({placement, rects}) => {
              const [skidding, distance] = offsetValue({
                placement,
                reference: rects.reference,
                floating: rects.floating,
              })
              return {mainAxis: distance || 0, crossAxis: skidding || 0}
            }
          : {mainAxis: offsetValue[1] || 0, crossAxis: offsetValue[0] || 0}
      ),
      flip({
        fallbackPlacements: getMenuFallbackPlacements(placement.value),
        // When no placement fits, keep the initial one. Overflow below can be scrolled to;
        // overflow above the scroll origin can never be reached
        fallbackStrategy: 'initialPlacement',
      }),
      shift({boundary: boundary === 'clippingParents' ? 'clippingAncestors' : boundary}),
    ]
    const defaultConfig: ComputePositionConfig = {
      placement: placement.value,
      middleware,
      strategy: toValue(options.strategy),
    }
    const floatingConfig = toValue(options.floatingConfig)
    return typeof floatingConfig === 'function'
      ? floatingConfig(defaultConfig)
      : {...defaultConfig, ...floatingConfig}
  }

  // Each computation gets a number, so a slow older one never overwrites a newer result
  let revision = 0
  const update = async () => {
    const reference = resolveReference()
    const menu = options.menu.value
    if (!reference || !menu || !menu.isConnected || isStatic.value) return
    const current = ++revision
    const config = getConfig()
    const result = await computePosition(reference, menu, config)
    if (current !== revision || !menu.isConnected) return
    floatingStyles.value = {
      position: config.strategy ?? 'absolute',
      left: `${result.x}px`,
      top: `${result.y}px`,
      margin: '0',
    }
    finalPlacement.value = result.placement
  }

  let cleanup: (() => void) | undefined
  const stop = () => {
    cleanup?.()
    cleanup = undefined
    revision++
  }

  const start = () => {
    stop()
    if (toValue(options.display) === 'static') {
      isStatic.value = true
      return
    }
    isStatic.value = false
    const reference = resolveReference()
    const menu = options.menu.value
    if (!reference || !menu) return
    cleanup = autoUpdate(reference, menu, () => {
      void update()
    })
  }

  /** Stops positioning and clears the attributes v6 removes after `hidden` */
  const reset = () => {
    stop()
    finalPlacement.value = undefined
    isStatic.value = false
  }

  // A placement change while open (breakpoint crossed, prop changed) repositions at once
  watch(placement, () => {
    if (cleanup) void update()
  })

  onBeforeUnmount(() => {
    stop()
    mediaCleanup?.()
  })

  return {floatingStyles, finalPlacement, isStatic, start, update, reset}
}
