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
) =>
  computed(() => {
    const props = toValue(linkProps)
    return {
      [`theme-${props.theme}`]: props.theme !== null && props.theme !== undefined,
      [`bg-${props.bg}`]: props.bg !== null && props.bg !== undefined,
      [`fg-${props.fg}`]: props.fg !== null && props.fg !== undefined,
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
