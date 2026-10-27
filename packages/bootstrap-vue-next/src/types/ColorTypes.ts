/**
 * Theme colors, mirroring Bootstrap's `$theme-colors` Sass map.
 * Augment this interface to register custom themes. The consumer must also ship the matching
 * `.theme-<name>` class (and `bg`/`fg`/`border` utilities if those props are used with it):
 *
 * ```ts
 * declare module 'bootstrap-vue-next' {
 *   interface ThemeColors { brand: unknown }
 * }
 * ```
 */
export interface ThemeColors {
  primary: unknown
  accent: unknown
  success: unknown
  danger: unknown
  warning: unknown
  info: unknown
  inverse: unknown
  secondary: unknown
}
export type ThemeColor = keyof ThemeColors

/** Neutral layer backgrounds from `$theme-bgs`, rendered as `.bg-<value>` */
export type BgLayerColor = 'body' | '1' | '2' | '3' | '4' | 'fg' | 'white' | 'black' | 'transparent'
/** Neutral layer foregrounds from `$theme-fgs`, rendered as `.fg-<value>` */
export type FgLayerColor = 'body' | '1' | '2' | '3' | '4' | 'bg' | 'white' | 'black' | 'reset'
/** Neutral layer borders from `$theme-borders`, rendered as `.border-<value>` */
export type BorderLayerColor = 'bg' | 'body' | 'muted' | 'subtle' | 'emphasized' | 'white' | 'black'
/** Opacity utilities for theme-aware backgrounds, foregrounds, and borders */
export type ColorOpacity =
  | 10
  | 20
  | 30
  | 40
  | 50
  | 60
  | 70
  | 80
  | 90
  | 100
  | '10'
  | '20'
  | '30'
  | '40'
  | '50'
  | '60'
  | '70'
  | '80'
  | '90'
  | '100'

/** `.bg-<theme>`, `.bg-subtle-<theme>`, `.bg-muted-<theme>` or a layer color */
export type BgColor =
  ThemeColor | `subtle-${ThemeColor}` | `muted-${ThemeColor}` | BgLayerColor | ColorOpacity
/** `.fg-<theme>`, `.fg-emphasis-<theme>`, `.fg-contrast-<theme>` or a layer color */
export type FgColor =
  ThemeColor | `emphasis-${ThemeColor}` | `contrast-${ThemeColor}` | FgLayerColor | ColorOpacity
/** `.border-<theme>`, `.border-subtle-<theme>` or a layer color */
export type BorderColor = ThemeColor | `subtle-${ThemeColor}` | BorderLayerColor | ColorOpacity

/** Button styles, rendered as `.btn-<style>` and combined with `.theme-<theme>` */
export interface BaseButtonVariant {
  solid: unknown
  outline: unknown
  subtle: unknown
  text: unknown
  link: unknown
}
export type ButtonVariant = keyof BaseButtonVariant

/** Props shared by components that can be themed or colored with utilities */
export interface ColorExtendables {
  theme?: ThemeColor | null
  bg?: BgColor | null
  fg?: FgColor | null
}

// Keep prefixed color props explicit: Vue's SFC compiler cannot resolve generic mapped interface bases
// when extracting defineProps, so these concrete interfaces are needed for component prop inference.
export interface UnderlineColorExtendables {
  underlineTheme?: ThemeColor | null
  underlineBg?: BgColor | null
  underlineFg?: FgColor | null
}

export interface ButtonColorExtendables {
  buttonTheme?: ThemeColor | null
  buttonBg?: BgColor | null
  buttonFg?: FgColor | null
}

export interface HeaderColorExtendables {
  headerTheme?: ThemeColor | null
  headerBg?: BgColor | null
  headerFg?: FgColor | null
}

export interface AddButtonColorExtendables {
  addButtonTheme?: ThemeColor | null
  addButtonBg?: BgColor | null
  addButtonFg?: FgColor | null
}

export interface TagColorExtendables {
  tagTheme?: ThemeColor | null
  tagBg?: BgColor | null
  tagFg?: FgColor | null
}

export interface HeaderCloseColorExtendables {
  headerCloseTheme?: ThemeColor | null
  headerCloseBg?: BgColor | null
  headerCloseFg?: FgColor | null
}

export interface SpinnerColorExtendables {
  spinnerTheme?: ThemeColor | null
  spinnerBg?: BgColor | null
  spinnerFg?: FgColor | null
}

export interface CloseColorExtendables {
  closeTheme?: ThemeColor | null
  closeBg?: BgColor | null
  closeFg?: FgColor | null
}

export interface BodyColorExtendables {
  bodyTheme?: ThemeColor | null
  bodyBg?: BgColor | null
  bodyFg?: FgColor | null
}

export interface FooterColorExtendables {
  footerTheme?: ThemeColor | null
  footerBg?: BgColor | null
  footerFg?: FgColor | null
}

export interface FootRowColorExtendables {
  footRowTheme?: ThemeColor | null
  footRowBg?: BgColor | null
  footRowFg?: FgColor | null
}

export interface FootColorExtendables {
  footTheme?: ThemeColor | null
  footBg?: BgColor | null
  footFg?: FgColor | null
}

export interface HeadRowColorExtendables {
  headRowTheme?: ThemeColor | null
  headRowBg?: BgColor | null
  headRowFg?: FgColor | null
}

export interface HeadColorExtendables {
  headTheme?: ThemeColor | null
  headBg?: BgColor | null
  headFg?: FgColor | null
}

export interface SelectionColorExtendables {
  selectionTheme?: ThemeColor | null
  selectionBg?: BgColor | null
  selectionFg?: FgColor | null
}

export interface SplitColorExtendables {
  splitTheme?: ThemeColor | null
  splitBg?: BgColor | null
  splitFg?: FgColor | null
}

export interface CancelColorExtendables {
  cancelTheme?: ThemeColor | null
  cancelBg?: BgColor | null
  cancelFg?: FgColor | null
}

export interface OkColorExtendables {
  okTheme?: ThemeColor | null
  okBg?: BgColor | null
  okFg?: FgColor | null
}
