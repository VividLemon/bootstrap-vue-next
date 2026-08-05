import { computed } from 'vue'
import { useHead, useState } from '#imports'
import type { ColorModeOptions } from 'bootstrap-vue-next/composables/useColorMode'

interface NuxtColorModeState {
  preference?: string
  value?: string
}

// This wraps @nuxtjs/color-mode's own shared state (the same state its composable
// and plugins read from/write to) and only adds bootstrap-vue-next's defaults on
// top of it, mirroring how the core `useColorMode` wraps `@vueuse/core`'s
// `useColorMode`: it does not re-derive or duplicate the resolved theme logic that
// `@nuxtjs/color-mode` already computes (`nuxtColorMode.value`).
export const useColorMode = (_opts: Readonly<ColorModeOptions> = {}) => {
  const nuxtColorMode = useState<NuxtColorModeState>('color-mode').value

  useHead({
    htmlAttrs: {
      'data-bs-theme': computed(() => nuxtColorMode.value ?? 'light'),
    },
  })

  return computed({
    get: () => (nuxtColorMode.preference === 'system' ? 'auto' : nuxtColorMode.preference) ?? 'auto',
    set: (val) => {
      nuxtColorMode.preference = val === 'auto' ? 'system' : val
    },
  })
}
