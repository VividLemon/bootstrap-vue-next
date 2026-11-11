/**
 * Bootstrap v6 breakpoints. Widths: sm 576px, md 768px, lg 1024px, xl 1280px, 2xl 1536px.
 */
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * Keys of a responsive object. They match Bootstrap v6 class prefixes (`md:col-6`).
 * `xs` means "no prefix" (`col-6`).
 */
export type ResponsiveKey = 'xs' | Breakpoint

/**
 * A per-breakpoint value, for example `{xs: 12, md: 6, '2xl': 4}`.
 */
export type Responsive<T> = Partial<Record<ResponsiveKey, T>>

export type ColsBaseNumbers = 1 | 2 | 3 | 4 | 5 | '1' | '2' | '3' | '4' | '5'

export type ColsNumbers =
  ColsBaseNumbers | 6 | 7 | 8 | 9 | 10 | 11 | 12 | '6' | '7' | '8' | '9' | '10' | '11' | '12'

/**
 * Gutter values are passed straight through to the v6 spacing scale (`gx-0` … `gx-12`)
 */
export type GutterNumbers =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'

/**
 * Row columns (`row-cols-1` … `row-cols-6`, `row-cols-auto`)
 */
export type RowColsNumbers = 1 | 2 | 3 | 4 | 5 | 6 | '1' | '2' | '3' | '4' | '5' | '6' | 'auto'

/**
 * Column size. `true` renders an equal-width column (`col`, `md:col`)
 */
export type ColsValue = boolean | ColsNumbers | 'auto'

export type ColsOrderNumbers = ColsBaseNumbers | 0 | '0' | 'first' | 'last'

export type ColsOffsetNumbers = Exclude<ColsNumbers, 12 | '12'> | 0 | '0'
