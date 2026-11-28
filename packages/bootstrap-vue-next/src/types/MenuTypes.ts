import type {ComputePositionConfig, Placement, Rect, VirtualElement} from '@floating-ui/vue'

/**
 * A menu side. `start` / `end` are logical: they resolve to `left` / `right` from the
 * document direction (`<html dir="rtl">` swaps them), as Bootstrap v6 does.
 */
export type MenuSide = 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end'

/**
 * Where a menu opens relative to its reference (Bootstrap v6 `placement`)
 */
export type MenuPlacement = MenuSide | `${MenuSide}-${'start' | 'end'}`

/**
 * Bootstrap v6 `offset`: `[skidding, distance]` in px, or a function returning it
 */
export type MenuOffset =
  | readonly [number, number]
  | ((state: {placement: Placement; reference: Rect; floating: Rect}) => readonly [number, number])

/**
 * Bootstrap v6 `floatingConfig`: merged over the default Floating UI config, or a function that
 * receives the default config and returns the one to use
 */
export type MenuFloatingConfig =
  | Readonly<Partial<ComputePositionConfig>>
  | ((defaultConfig: ComputePositionConfig) => ComputePositionConfig)

/**
 * The element a menu is positioned against (Bootstrap v6 `reference`): its toggle, the toggle's
 * parent element, or any element or virtual element
 */
export type MenuReference = 'toggle' | 'parent' | HTMLElement | VirtualElement

/**
 * Which clicks close an open menu (Bootstrap v6 `autoClose`). Escape always closes it
 */
export type MenuAutoClose = boolean | 'inside' | 'outside'
