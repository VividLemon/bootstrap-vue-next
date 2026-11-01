import type {Breakpoint, Responsive, ResponsiveKey} from '../types/BreakpointProps'

/**
 * Bootstrap v6 breakpoint widths in px
 */
export const breakpointWidths = {
  'xs': 0,
  'sm': 576,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
} as const satisfies Record<ResponsiveKey, number>

export const breakpoints: readonly Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl']

export const responsiveKeys: readonly ResponsiveKey[] = ['xs', ...breakpoints]

/**
 * Turns a responsive object into Bootstrap v6 prefix classes.
 *
 * - The `xs` key has no prefix, every other key is used as a `{key}:` prefix
 * - `true` renders the bare base class (`{md: true}` → `md:col`)
 * - `false`, `null`, `undefined` and `''` render nothing
 * - Any other value is appended to the base (`{md: 6}` → `md:col-6`)
 *
 * Output follows breakpoint order, unknown keys are ignored.
 *
 * @example getResponsiveClasses({xs: 12, md: 6}, 'col') // ['col-12', 'md:col-6']
 */
export const getResponsiveClasses = (
  value: Readonly<Responsive<unknown>> | null | undefined,
  base: string
): string[] => {
  if (value === null || value === undefined || typeof value !== 'object') return []

  return responsiveKeys.reduce<string[]>((classes, key) => {
    const entry = value[key]
    if (entry === undefined || entry === null || entry === false || entry === '') return classes

    const prefix = key === 'xs' ? '' : `${key}:`
    classes.push(entry === true ? `${prefix}${base}` : `${prefix}${base}-${entry}`)
    return classes
  }, [])
}
