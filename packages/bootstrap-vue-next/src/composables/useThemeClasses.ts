import {computed, type MaybeRefOrGetter, toValue} from 'vue'
import type {
  BgColor,
  BorderColor,
  ButtonVariant,
  ColorExtendables,
  MaybeArray,
  ThemeValue,
} from '../types/ColorTypes'

/**
 * Expands a single value or an array of values into `<prefix>-<value>` classes.
 * `null` and `undefined` entries are skipped
 */
export const toColorClasses = (
  prefix: 'theme' | 'bg' | 'fg' | 'border',
  value: MaybeArray<string | number> | null | undefined
): string[] => {
  return (Array.isArray(value) ? value : [value]).reduce((out, v) => {
    if (v !== null && v !== undefined) {
      out.push(`${prefix}-${v}`)
      return out
    }
  }, [] as string[])
}

/**
 * Converts theme values to bg values. Theme names are valid bg values; modifiers such as `contrast` are dropped
 */
export const themeToBg = (
  theme: MaybeArray<ThemeValue> | null | undefined
): MaybeArray<BgColor> | null | undefined => {
  if (Array.isArray(theme)) return theme.filter((t) => t !== 'contrast') as BgColor[]
  return theme === 'contrast' ? null : (theme as BgColor | null | undefined)
}

/**
 * Converts `theme`, `bg`, `fg` and `border` props into Bootstrap v6 classes:
 * `.theme-<theme>`, `.bg-<bg>`, `.fg-<fg>` and `.border-<border>`
 */
export const useThemeClasses = (
  obj: MaybeRefOrGetter<ColorExtendables & {border?: MaybeArray<BorderColor> | null}>
) => {
  const classes = computed(() => {
    const props = toValue(obj)
    return [
      toColorClasses('theme', props.theme),
      toColorClasses('bg', props.bg),
      toColorClasses('fg', props.fg),
      toColorClasses('border', props.border),
    ].flat()
  })

  return {classes}
}

/**
 * Builds `.btn-<variant>` and `.theme-<theme>` classes
 */
export const getButtonThemeClasses = (
  variant: ButtonVariant | null | undefined,
  theme: ColorExtendables['theme'],
  bg?: ColorExtendables['bg'],
  fg?: ColorExtendables['fg'],
  styled = false
) => [
  variant !== null && variant !== undefined ? `btn-${variant}` : undefined,
  toColorClasses('theme', theme),
  toColorClasses('bg', bg),
  toColorClasses('fg', fg),
  {'btn-styled': styled},
]
