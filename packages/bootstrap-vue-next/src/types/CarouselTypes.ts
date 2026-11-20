/**
 * What happens when a Bootstrap v6 carousel navigates past its first or last slide:
 * `'loop'` continues seamlessly (falls back to `'wrap'` where it can't), `'wrap'` jumps to the
 * other end, `'stop'` stops and disables the prev / next control at the ends
 */
export type CarouselEnds = 'loop' | 'wrap' | 'stop'

/**
 * Props of the `controls` slot of `BCarousel`
 */
export interface CarouselControlsSlotProps {
  prev: () => void
  next: () => void
  to: (index: number) => void
  cycle: () => void
  pause: () => void
  togglePlay: () => void
  playing: boolean
  index: number
  count: number
  canPrev: boolean
  canNext: boolean
}
