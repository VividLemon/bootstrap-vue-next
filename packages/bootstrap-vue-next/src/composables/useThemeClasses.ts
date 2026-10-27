import {computed, type MaybeRefOrGetter, toValue} from 'vue'
import type {BorderColor, ButtonVariant, ColorExtendables} from '../types/ColorTypes'

/**
 * Converts `theme`, `bg`, `fg` and `border` props into Bootstrap v6 classes:
 * `.theme-<theme>`, `.bg-<bg>`, `.fg-<fg>` and `.border-<border>`
 */
export const useThemeClasses = (
  obj: MaybeRefOrGetter<ColorExtendables & {border?: BorderColor | null}>
) => {
  const classes = computed(() => {
    const props = toValue(obj)
    return {
      [`theme-${props.theme}`]: props.theme !== null && props.theme !== undefined,
      [`bg-${props.bg}`]: props.bg !== null && props.bg !== undefined,
      [`fg-${props.fg}`]: props.fg !== null && props.fg !== undefined,
      [`border-${props.border}`]: props.border !== null && props.border !== undefined,
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
export const useButtonThemeClasses = (obj: MaybeRefOrGetter<ButtonThemeClassesInput>) => {
  const {classes: colorClasses} = useThemeClasses(() => {
    const props = toValue(obj)
    return {theme: props.theme, bg: props.bg, fg: props.fg}
  })

  const classes = computed(() => {
    const props = toValue(obj)
    return {
      ...colorClasses.value,
      [`btn-${props.variant}`]: props.variant !== null && props.variant !== undefined,
      'btn-styled': props.styled === true,
    }
  })

  return {classes}
}
