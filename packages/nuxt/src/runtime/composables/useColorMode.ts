import { computed } from 'vue'
import { useHead, useState } from '#imports'
import type { ColorModeOptions } from 'bootstrap-vue-next/composables/useColorMode'

interface NuxtColorModeState {
  preference?: string
  value?: string
}

const resolveTheme = (value: string | undefined, fallback: string | undefined) => {
  if (value === 'system' || value === 'auto') {
    if (fallback === 'system' || fallback === undefined) {
      return 'auto'
    }
    return fallback
  }
  return value ?? 'auto'
}

export const useColorMode = (_opts: Readonly<ColorModeOptions> = {}) => {
  const nuxtColorMode = useState<NuxtColorModeState>('color-mode').value
  const resolvedTheme = computed(() =>
    resolveTheme(
      nuxtColorMode.value,
      nuxtColorMode.preference,
    ),
  )

  useHead({
    htmlAttrs: {
      'data-bs-theme': resolvedTheme,
    },
  })

  return computed({
    get: () => resolvedTheme.value,
    set: (val) => {
      nuxtColorMode.preference = val === 'auto' ? 'system' : val
    },
  })
}
