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

/**
 * Builds `.btn-<variant>` and `.theme-<theme>` classes
 */
export const getButtonThemeClasses = (
  variant: ButtonVariant | null | undefined,
  theme: ColorExtendables['theme']
) => ({
  [`btn-${variant}`]: variant !== null && variant !== undefined,
  [`theme-${theme}`]: theme !== null && theme !== undefined,
})
