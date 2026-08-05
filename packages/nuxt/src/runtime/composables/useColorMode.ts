import { computed } from 'vue'
import { useHead } from '#imports'
import { useColorMode as useNuxtColorMode } from '#bootstrap-vue-next-nuxt-color-mode'
import type { ColorModeOptions } from 'bootstrap-vue-next/composables/useColorMode'

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
  const nuxtColorMode = useNuxtColorMode()
  const resolvedTheme = computed(() =>
    resolveTheme(
      nuxtColorMode.value,
      nuxtColorMode.preference,
    )
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
