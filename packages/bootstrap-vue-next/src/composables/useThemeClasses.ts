import {computed, type MaybeRef, unref} from 'vue'
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
 * `null` and `undefined` entries are represented as disabled classes.
 */
export const toColorClasses = (
  prefix: 'theme' | 'bg' | 'fg' | 'border',
  value: MaybeArray<string | number> | null | undefined
): Record<string, boolean> => {
  const values: readonly (string | number | null | undefined)[] = Array.isArray(value)
    ? value
    : [value]
  return values.reduce<Record<string, boolean>>((out, v) => {
    out[`${prefix}-${v}`] = v !== null && v !== undefined
    return out
  }, {})
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
  obj: MaybeRef<ColorExtendables & {border?: MaybeArray<BorderColor> | null}>
) => {
  const classes = computed(() => {
    const props = unref(obj)
    return {
      ...toColorClasses('theme', props.theme),
      ...toColorClasses('bg', props.bg),
      ...toColorClasses('fg', props.fg),
      ...toColorClasses('border', props.border),
    }
  })

  return {classes}
}

type ButtonThemeClassesInput = ColorExtendables & {
  variant?: ButtonVariant | null
  styled?: boolean
}

/**
 * Builds `.btn-<variant>` and color utility classes for buttons
 */
export const useButtonThemeClasses = (obj: MaybeRef<ButtonThemeClassesInput>) => {
  const {classes: colorClasses} = useThemeClasses(
    computed(() => {
      const props = unref(obj)
      return {theme: props.theme, bg: props.bg, fg: props.fg}
    })
  )

  const classes = computed(() => {
    const props = unref(obj)
    return {
      ...colorClasses.value,
      [`btn-${props.variant}`]: props.variant !== null && props.variant !== undefined,
      'btn-styled': props.styled === true,
    }
  })
  return {classes}
}
