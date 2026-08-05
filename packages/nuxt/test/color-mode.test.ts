import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('nuxt color mode integration', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/color-mode', import.meta.url)),
  })

  it('uses the Nuxt color mode composable and renders SSR theme attributes', async () => {
    const html = await $fetch('/')
    expect(html).toContain('id="color-mode-page"')
    expect(html).toContain('id="theme-mode">light<')
    expect(html).toContain('data-bs-theme="light"')
    expect(html).not.toContain('Hydration')
  })
})
