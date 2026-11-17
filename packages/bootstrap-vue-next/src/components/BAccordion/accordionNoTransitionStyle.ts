import type {CSSProperties} from 'vue'

/**
 * Inline tokens that switch off the accordion transitions (`noTransition`).
 *
 * Bootstrap v6 has no `accordion-instant` class and the `transition-none` utility does not reach the
 * `::details-content` pseudo-element. The tokens are declared on `.accordion` only, so an inline value
 * on the accordion or on one item inherits into the item, its header, icon and pseudo-element.
 */
export const accordionNoTransitionStyle: Readonly<CSSProperties> = Object.freeze({
  '--bs-accordion-panel-transition-duration': '0s',
  '--bs-accordion-transition-duration': '0s',
  '--bs-accordion-btn-icon-transition': 'none',
} as CSSProperties)
