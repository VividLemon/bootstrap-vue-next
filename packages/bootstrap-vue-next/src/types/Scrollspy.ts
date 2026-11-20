/**
 * Options for `useScrollspy`
 */
export interface UseScrollspyOptions {
  /**
   * Position of the activation line, measured from the top of the scroll root.
   * The active section is the deepest one whose top has scrolled to or above it.
   * A percentage of the root height (`'12%'`) or pixels (`'96px'`, e.g. below a sticky navbar).
   *
   * @default '12%'
   */
  topMargin?: string
  /**
   * Raw IntersectionObserver `rootMargin`. When set it overrides `topMargin`.
   *
   * @default null
   */
  rootMargin?: string | null
  /**
   * IntersectionObserver `threshold`
   *
   * @default [0]
   */
  threshold?: number | number[]
  /**
   * Smoothly scroll to a section when one of the target's links is clicked, then replace the
   * URL hash and move focus to the section once scrolling settles.
   *
   * @default false
   */
  smoothScroll?: boolean
  /**
   * Re-scan sections when the content or the target changes (children, `href` or `id`).
   *
   * @default true
   */
  watchChanges?: boolean
}

/**
 * A spied section: a link in the target whose hash resolves to an element inside the content
 */
export interface ScrollspySection {
  /**
   * The section element's `id`
   */
  id: string
  /**
   * The section element
   */
  el: HTMLElement
  /**
   * The target link pointing at the section (the last one wins when several links point at it)
   */
  link: HTMLElement
}
