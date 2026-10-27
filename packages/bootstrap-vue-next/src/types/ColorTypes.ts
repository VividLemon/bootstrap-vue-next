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

/** Modifiers that stack with a theme, rendered as `.theme-<modifier>` */
export interface ThemeModifiers {
  contrast: unknown
}
export type ThemeModifier = keyof ThemeModifiers
export type ThemeValue = ThemeColor | ThemeModifier

/** A single value or a list of values, rendered as one class per value */
export type MaybeArray<T> = T | readonly T[]

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
  theme?: MaybeArray<ThemeValue> | null
  bg?: MaybeArray<BgColor> | null
  fg?: MaybeArray<FgColor> | null
}

// Keep prefixed color props explicit: Vue's SFC compiler cannot resolve generic mapped interface bases
// when extracting defineProps, so these concrete interfaces are needed for component prop inference.
export interface UnderlineColorExtendables {
  underlineTheme?: ThemeColor | null
  underlineBg?: MaybeArray<BgColor> | null
  underlineFg?: MaybeArray<FgColor> | null
}

export interface ButtonColorExtendables {
  buttonTheme?: MaybeArray<ThemeValue> | null
  buttonBg?: MaybeArray<BgColor> | null
  buttonFg?: MaybeArray<FgColor> | null
}

export interface HeaderColorExtendables {
  headerTheme?: MaybeArray<ThemeValue> | null
  headerBg?: MaybeArray<BgColor> | null
  headerFg?: MaybeArray<FgColor> | null
}

export interface AddButtonColorExtendables {
  addButtonTheme?: MaybeArray<ThemeValue> | null
  addButtonBg?: MaybeArray<BgColor> | null
  addButtonFg?: MaybeArray<FgColor> | null
}

export interface TagColorExtendables {
  tagTheme?: MaybeArray<ThemeValue> | null
  tagBg?: MaybeArray<BgColor> | null
  tagFg?: MaybeArray<FgColor> | null
}

export interface HeaderCloseColorExtendables {
  headerCloseTheme?: MaybeArray<ThemeValue> | null
  headerCloseBg?: MaybeArray<BgColor> | null
  headerCloseFg?: MaybeArray<FgColor> | null
}

export interface SpinnerColorExtendables {
  spinnerTheme?: ThemeColor | null
  spinnerBg?: MaybeArray<BgColor> | null
  spinnerFg?: MaybeArray<FgColor> | null
}

export interface CloseColorExtendables {
  closeTheme?: MaybeArray<ThemeValue> | null
  closeBg?: MaybeArray<BgColor> | null
  closeFg?: MaybeArray<FgColor> | null
}

export interface BodyColorExtendables {
  bodyTheme?: MaybeArray<ThemeValue> | null
  bodyBg?: MaybeArray<BgColor> | null
  bodyFg?: MaybeArray<FgColor> | null
}

export interface FooterColorExtendables {
  footerTheme?: MaybeArray<ThemeValue> | null
  footerBg?: MaybeArray<BgColor> | null
  footerFg?: MaybeArray<FgColor> | null
}

export interface FootRowColorExtendables {
  footRowTheme?: MaybeArray<ThemeValue> | null
  footRowBg?: MaybeArray<BgColor> | null
  footRowFg?: MaybeArray<FgColor> | null
}

export interface FootColorExtendables {
  footTheme?: MaybeArray<ThemeValue> | null
  footBg?: MaybeArray<BgColor> | null
  footFg?: MaybeArray<FgColor> | null
}

export interface HeadRowColorExtendables {
  headRowTheme?: MaybeArray<ThemeValue> | null
  headRowBg?: MaybeArray<BgColor> | null
  headRowFg?: MaybeArray<FgColor> | null
}

export interface HeadColorExtendables {
  headTheme?: MaybeArray<ThemeValue> | null
  headBg?: MaybeArray<BgColor> | null
  headFg?: MaybeArray<FgColor> | null
}

export interface SelectionColorExtendables {
  selectionTheme?: MaybeArray<ThemeValue> | null
  selectionBg?: MaybeArray<BgColor> | null
  selectionFg?: MaybeArray<FgColor> | null
}

export interface SplitColorExtendables {
  splitTheme?: MaybeArray<ThemeValue> | null
  splitBg?: MaybeArray<BgColor> | null
  splitFg?: MaybeArray<FgColor> | null
}

export interface CancelColorExtendables {
  cancelTheme?: MaybeArray<ThemeValue> | null
  cancelBg?: MaybeArray<BgColor> | null
  cancelFg?: MaybeArray<FgColor> | null
}

export interface OkColorExtendables {
  okTheme?: MaybeArray<ThemeValue> | null
  okBg?: MaybeArray<BgColor> | null
  okFg?: MaybeArray<FgColor> | null
}
