import {computed, type MaybeRefOrGetter, toValue} from 'vue'
import type {AlignmentJustifyContent} from '../types/Alignment'

export const useAlignment = (align: MaybeRefOrGetter<AlignmentJustifyContent | undefined>) => {
  const alignment = computed(() => {
    const value = toValue(align)
    return !value ? '' : `justify-content-${value}`
  })

  return {alignment}
}
