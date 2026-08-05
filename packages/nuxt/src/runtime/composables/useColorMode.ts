import { computed } from 'vue'
import { useColorMode as useNuxtColorMode, useHead } from '#imports'
import type { ColorModeOptions } from 'bootstrap-vue-next/composables/useColorMode'

const resolveTheme = (value: string, fallback: string) => {
  if (value === 'system' || value === 'auto') {
    return fallback === 'system' ? 'auto' : fallback
  }
  return value
}

export const useColorMode = (_opts: Readonly<ColorModeOptions> = {}) => {
  const nuxtColorMode = useNuxtColorMode()

  useHead({
    htmlAttrs: {
      'data-bs-theme': computed(() =>
        resolveTheme(nuxtColorMode.value, nuxtColorMode.preference)
      ),
    },
  })

  return computed({
    get: () => resolveTheme(nuxtColorMode.value, nuxtColorMode.preference),
    set: (val) => {
      nuxtColorMode.preference = val
    },
  })
}
