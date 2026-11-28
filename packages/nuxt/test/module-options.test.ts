import {fileURLToPath} from 'node:url'
import {describe, it, expect} from 'vitest'
import {setup, $fetch, createPage} from '@nuxt/test-utils/e2e'

describe('module-options', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/module-options', import.meta.url)),
  })

  it('css: false — no bootstrap-vue-next CSS link tag in SSR output', async () => {
    const html = await $fetch('/')
    expect(html).not.toContain('bootstrap-vue-next.css')
  })

  it('renders BButton without errors when CSS is disabled', async () => {
    const html = await $fetch('/')
    expect(html).toContain('btn')
  })

  it('configured useToast works at runtime', async () => {
    const page = await createPage('/')

    expect(await page.locator('#toast-status').textContent()).toContain('toast-ready')
    await page.click('#toast-trigger')
    await page.waitForSelector('.toast')
    expect(await page.locator('.toast').textContent()).toContain('Configured toast body')

    await page.close()
  })

  it('configured BDialog defaults are applied at runtime', async () => {
    const page = await createPage('/')

    await page.click('#configured-dialog-trigger')
    await page.waitForSelector('#configured-dialog[open].dialog-lg')
    expect(await page.locator('#configured-dialog .dialog-body').textContent()).toContain(
      'Configured dialog body'
    )

    await page.close()
  })

  it('configured BLink.routerComponentName is applied at runtime', async () => {
    const page = await createPage('/')

    // The stand-in NuxtLink marks its links active through the `custom` slot scope
    expect(await page.locator('#configured-link').getAttribute('class')).toContain(
      'router-link-active'
    )
    expect(await page.locator('#configured-link').getAttribute('href')).toBe(
      '/module-options-target'
    )

    await page.close()
  })
})
