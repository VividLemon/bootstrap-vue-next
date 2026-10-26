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

/** `.bg-<theme>`, `.bg-subtle-<theme>`, `.bg-muted-<theme>` or a layer color */
export type BgColor = ThemeColor | `subtle-${ThemeColor}` | `muted-${ThemeColor}` | BgLayerColor
/** `.fg-<theme>`, `.fg-emphasis-<theme>`, `.fg-contrast-<theme>` or a layer color */
export type FgColor =
  ThemeColor | `emphasis-${ThemeColor}` | `contrast-${ThemeColor}` | FgLayerColor
/** `.border-<theme>`, `.border-subtle-<theme>` or a layer color */
export type BorderColor = ThemeColor | `subtle-${ThemeColor}` | BorderLayerColor

/** Button styles, rendered as `.btn-<style>` and combined with `.theme-<theme>` */
export interface BaseButtonVariant {
  solid: unknown
  outline: unknown
  subtle: unknown
  text: unknown
  styled: unknown
  link: unknown
}
export type ButtonVariant = keyof BaseButtonVariant

/** Props shared by components that can be themed or colored with utilities */
export type ColorExtendables = {
  theme?: ThemeColor | null
  bg?: BgColor | null
  fg?: FgColor | null
}
