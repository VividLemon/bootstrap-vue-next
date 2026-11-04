import type {Breakpoint} from '../types/BreakpointProps'
import {computed, type MaybeRefOrGetter, toValue} from 'vue'

/**
 * Bootstrap v6 container classes
 *
 * - `true` → `container`
 * - `'fluid'` → `container-fluid`
 * - a breakpoint → `{bp}:container` (100% wide until that breakpoint)
 * - `false` → no class
 */
export const useContainerClasses = (value: MaybeRefOrGetter<boolean | Breakpoint | 'fluid'>) => {
  const classes = computed(() => {
    const resolvedValue = toValue(value)
    if (resolvedValue === true) return 'container'
    if (resolvedValue === 'fluid') return 'container-fluid'
    if (typeof resolvedValue === 'string') return `${resolvedValue}:container`
    return ''
  })

  return {classes}
}
