import {computed, type MaybeRefOrGetter, toValue} from 'vue'
import type {
  LinkIconProps,
  LinkOpacityProps,
  LinkThemeProps,
  LinkUnderlineProps,
} from '../types/ComponentProps'
import {useThemeClasses} from './useThemeClasses'

export const useLinkClasses = (
  linkProps: MaybeRefOrGetter<
    LinkUnderlineProps & LinkOpacityProps & LinkIconProps & LinkThemeProps
  >
) => {
  const {classes: themeClasses} = useThemeClasses(linkProps)

  const classes = computed(() => {
    const props = toValue(linkProps)
    return {
      ...themeClasses.value,
      [`link-${props.opacity}`]: props.opacity !== undefined,
      [`hover:link-${props.opacityHover}`]: props.opacityHover !== undefined,
      [`underline-${props.underlineTheme}`]:
        props.underlineTheme !== null && props.underlineTheme !== undefined,
      [`bg-${props.underlineBg}`]: props.underlineBg !== null && props.underlineBg !== undefined,
      [`fg-${props.underlineFg}`]: props.underlineFg !== null && props.underlineFg !== undefined,
      [`underline-offset-${props.underlineOffset}`]: props.underlineOffset !== undefined,
      [`hover:underline-offset-${props.underlineOffsetHover}`]:
        props.underlineOffsetHover !== undefined,
      [`underline-${props.underlineOpacity}`]: props.underlineOpacity !== undefined,
      [`hover:underline-${props.underlineOpacityHover}`]: props.underlineOpacityHover !== undefined,
      'icon-link': props.icon === true,
    }
  })

  return {classes}
}
