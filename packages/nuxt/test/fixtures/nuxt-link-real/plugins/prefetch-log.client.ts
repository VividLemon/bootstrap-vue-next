import { defineNuxtPlugin } from '#app'

// Records what NuxtLink prefetches, so the tests can tell that BLink triggers it
export default defineNuxtPlugin((nuxtApp) => {
  const target = window as unknown as { __prefetched?: string[] }
  target.__prefetched = []
  nuxtApp.hook('link:prefetch', (url) => {
    target.__prefetched?.push(url)
  })
})
