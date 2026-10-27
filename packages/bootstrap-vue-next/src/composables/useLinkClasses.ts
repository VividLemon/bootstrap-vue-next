import {computed, type MaybeRefOrGetter, toValue} from 'vue'
import type {
  LinkIconProps,
  LinkOpacityProps,
  LinkThemeProps,
  LinkUnderlineProps,
} from '../types/ComponentProps'

export const useLinkClasses = (
  linkProps: MaybeRefOrGetter<
    LinkUnderlineProps & LinkOpacityProps & LinkIconProps & LinkThemeProps
  >
) => {
  const classes = computed(() => {
    const props = toValue(linkProps)
    return {
      [`theme-${props.theme}`]: props.theme !== null && props.theme !== undefined,
      [`link-${props.opacity}`]: props.opacity !== undefined,
      [`hover:link-${props.opacityHover}`]: props.opacityHover !== undefined,
      [`underline-${props.underlineTheme}`]:
        props.underlineTheme !== null && props.underlineTheme !== undefined,
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
