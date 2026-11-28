import {fileURLToPath} from 'node:url'
import {describe, it, expect} from 'vitest'
import {setup, $fetch, createPage} from '@nuxt/test-utils/e2e'

// The trigger patterns that replaced the v1 directives: `BTooltip` / `BPopover` with the
// `activator` slot, and `useComponentToggle().props`
describe('triggers', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/triggers', import.meta.url)),
  })

  it('a BTooltip activator renders without SSR error', async () => {
    const html = await $fetch('/')
    expect(html).toContain('tooltip-el')
    expect(html).toContain('Tooltip target')
  })

  it('a BTooltip activator shows the tooltip after hydration', async () => {
    const page = await createPage('/')

    await page.hover('#tooltip-el')
    await page.waitForSelector('.tooltip.show .tooltip-inner')
    expect(await page.locator('.tooltip.show .tooltip-inner').textContent()).toContain('A tooltip')

    await page.close()
  })

  it('a useComponentToggle trigger renders without SSR error', async () => {
    const html = await $fetch('/')
    expect(html).toContain('modal-trigger')
    expect(html).toContain('Open dialog')
    expect(html).toContain('aria-controls="my-modal"')
  })

  it('a useComponentToggle trigger opens its dialog after hydration', async () => {
    const page = await createPage('/')

    await page.click('#modal-trigger')
    await page.waitForSelector('#my-modal[open]')
    expect(await page.locator('#my-modal .dialog-body').textContent()).toContain(
      'Toggled modal body'
    )

    await page.close()
  })

  it('a BPopover activator renders without SSR error', async () => {
    const html = await $fetch('/')
    expect(html).toContain('popover-el')
    expect(html).toContain('Popover target')
  })

  it('a BPopover activator shows the popover after hydration', async () => {
    const page = await createPage('/')

    await page.hover('#popover-el')
    await page.waitForSelector('.popover.show')
    expect(await page.locator('.popover.show').textContent()).toContain('A popover')

    await page.close()
  })

  it('all elements in the triggers page render in SSR output', async () => {
    const html = await $fetch('/')
    expect(html).toContain('triggers-page')
  })
})
