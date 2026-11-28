import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('ssr-smoke', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/ssr-smoke', import.meta.url)),
  })

  it('BDialog renders without SSR error', async () => {
    const html = await $fetch('/modal')
    expect(html).toContain('modal-page')
  })

  it('BOffcanvas renders without SSR error', async () => {
    const html = await $fetch('/offcanvas')
    expect(html).toContain('offcanvas-page')
  })

  it('BOrchestrator renders without SSR error', async () => {
    const html = await $fetch('/orchestrator')
    expect(html).toContain('orchestrator-page')
  })

  it('BCarousel renders without SSR error', async () => {
    const html = await $fetch('/carousel')
    expect(html).toContain('carousel-page')
  })

  it('BMenu renders without SSR error', async () => {
    const html = await $fetch<string>('/menu')
    expect(html).toContain('menu-page')
    // Toggle and menu are siblings; the menu has no inline position until the client opens it
    expect(html).toMatch(/<button[^>]*id="ssr-menu"[^>]*aria-controls="ssr-menu-menu"/)
    // (Vue's SSR renders an unset style binding as `style=""`)
    expect(html).toMatch(/<div id="ssr-menu-menu" class="menu"(?: style="")?>/)
    // An initially open menu renders `.show`
    expect(html).toMatch(/<div class="btn-group show">/)
    expect(html).toMatch(/<div id="ssr-menu-open-menu" class="menu show[ "]/)
  })
})
