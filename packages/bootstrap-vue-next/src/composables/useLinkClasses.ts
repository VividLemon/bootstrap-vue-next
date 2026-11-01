import {computed, type MaybeRef, unref} from 'vue'
import {useThemeClasses} from './useThemeClasses'
import type {HoverState} from '../types/HoverState'
import type {
  LinkIconProps,
  LinkOpacityProps,
  LinkThemeProps,
  LinkUnderlineProps,
} from '../types/ComponentProps'

/**
 * Expands a `HoverState` object into `<base>-<value>` (`xs`) and `hover:<base>-<value>` (`hover`) classes
 */
export const toHoverStateClasses = (
  base: string,
  state: HoverState<string | number> | null | undefined
): Record<string, boolean> => {
  if (state === null || state === undefined) return {}
  const out: Record<string, boolean> = {}
  if (state.xs !== undefined && state.xs !== null) out[`${base}-${state.xs}`] = true
  if (state.hover !== undefined && state.hover !== null) out[`hover:${base}-${state.hover}`] = true
  return out
}

export const useLinkClasses = (
  linkProps: MaybeRef<LinkUnderlineProps & LinkOpacityProps & LinkIconProps & LinkThemeProps>
) => {
  const {classes: themeClasses} = useThemeClasses(linkProps)

  const classes = computed(() => {
    const props = unref(linkProps)
    return {
      ...themeClasses.value,
      ...toHoverStateClasses('link', props.opacity),
      [`underline-${props.underlineTheme}`]:
        props.underlineTheme !== null && props.underlineTheme !== undefined,
      ...toHoverStateClasses('underline-offset', props.underlineOffset),
      ...toHoverStateClasses('underline', props.underlineOpacity),
      'icon-link': props.icon === true,
    }
  })

  return {classes}
}
