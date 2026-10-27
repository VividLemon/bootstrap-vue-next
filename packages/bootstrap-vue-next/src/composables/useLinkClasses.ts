import {computed, type MaybeRef, unref} from 'vue'
import {toColorClasses, useThemeClasses} from './useThemeClasses'
import type {
  LinkIconProps,
  LinkOpacityProps,
  LinkThemeProps,
  LinkUnderlineProps,
} from '../types/ComponentProps'

export const useLinkClasses = (
  linkProps: MaybeRef<LinkUnderlineProps & LinkOpacityProps & LinkIconProps & LinkThemeProps>
) => {
  const {classes: themeClasses} = useThemeClasses(linkProps)

  const classes = computed(() => {
    const props = unref(linkProps)
    return {
      ...themeClasses.value,
      [`link-${props.opacity}`]: props.opacity !== undefined,
      [`hover:link-${props.opacityHover}`]: props.opacityHover !== undefined,
      [`underline-${props.underlineTheme}`]:
        props.underlineTheme !== null && props.underlineTheme !== undefined,
      ...toColorClasses('bg', props.underlineBg),
      ...toColorClasses('fg', props.underlineFg),
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
