import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch, createPage, url } from '@nuxt/test-utils/e2e'

/** The opening tag of the element with this id */
const tagOf = (html: string, id: string): string => {
  const match = html.match(new RegExp(`<a(?=[^>]*\\sid="${id}")[^>]*>`))
  if (!match) throw new Error(`No <a id="${id}"> in the page`)
  return match[0]
}

// Runs against the real NuxtLink, in dev mode so that Vue and NuxtLink warnings are not stripped
describe('BLink with the real NuxtLink', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/nuxt-link-real', import.meta.url)),
    dev: true,
  })

  it('server-renders one anchor per link, with href from the router and no stray attributes', async () => {
    const html = await $fetch<string>('/')

    expect(tagOf(html, 'about')).toContain('href="/about"')
    expect(tagOf(html, 'about')).toContain('data-x="1"')
    expect(tagOf(html, 'about')).toMatch(/class="[^"]*\bmine\b/)
    expect(tagOf(html, 'user')).toContain('href="/users/7"')
    expect(tagOf(html, 'button')).toMatch(/class="[^"]*\bbtn\b/)
    expect(tagOf(html, 'nav-item')).toMatch(/class="[^"]*\bnav-link\b/)
    expect(tagOf(html, 'external')).toContain('href="https://example.com/"')
    expect(tagOf(html, 'blank')).toContain('href="/about"')
    expect(tagOf(html, 'blank')).toContain('target="_blank"')
    expect(tagOf(html, 'href-only')).toContain('href="/about"')
    expect(tagOf(html, 'disabled')).toContain('aria-disabled="true"')

    // The current page is active, straight from the server
    expect(tagOf(html, 'home')).toMatch(/class="[^"]*\brouter-link-exact-active\b/)
    expect(tagOf(html, 'home')).toContain('aria-current="page"')
    expect(tagOf(html, 'about')).not.toContain('router-link-active')

    // Props of the link components never leak into the DOM
    for (const id of [
      'home',
      'about',
      'user',
      'interaction',
      'no-prefetch',
      'button',
      'nav-item',
    ]) {
      expect(tagOf(html, id)).not.toMatch(/\s(to|custom|replace|prefetch|no-prefetch|prefetch-on)=/)
    }
  })

  it('navigates on the client, tracks the active link, prefetches, and logs no warnings', async () => {
    const messages: string[] = []
    const page = await createPage()
    page.on('console', (message) => {
      if (message.type() === 'warning' || message.type() === 'error') messages.push(message.text())
    })
    // Listeners first, then the page, so nothing logged while it loads is missed
    await page.goto(url('/'), { waitUntil: 'hydration' })
    const prefetched = () =>
      page.evaluate(() => (window as unknown as { __prefetched: string[] }).__prefetched)

    // Visible links are prefetched by BLink through NuxtLink's slot, since NuxtLink does not
    // observe anything in `custom` mode
    await page.waitForFunction(() =>
      (window as unknown as { __prefetched: string[] }).__prefetched.includes('/users/7'),
    )
    expect(await prefetched()).toContain('/about')
    expect(await prefetched()).not.toContain('/users/9')
    expect(await prefetched()).not.toContain('/users/8')

    await page.hover('#interaction')
    await page.waitForFunction(() =>
      (window as unknown as { __prefetched: string[] }).__prefetched.includes('/users/8'),
    )
    await page.waitForSelector('#interaction.was-prefetched')

    // A client-side navigation keeps the window (a full page load would lose the marker)
    await page.evaluate(() => {
      ;(window as unknown as { __marker: boolean }).__marker = true
    })
    await page.click('#about')
    await page.waitForFunction(
      () => document.querySelector('#page')?.textContent?.trim() === 'about',
    )
    expect(new URL(page.url()).pathname).toBe('/about')
    expect(await page.evaluate(() => (window as unknown as { __marker?: boolean }).__marker)).toBe(
      true,
    )
    await page.waitForSelector('#about.router-link-exact-active[aria-current="page"]')
    expect(await page.getAttribute('#home', 'aria-current')).toBeNull()
    // Every link to /about is active, each through its own component
    await page.waitForSelector('#button.router-link-exact-active')
    await page.waitForSelector('#nav-item.router-link-exact-active')

    await page.click('#user')
    await page.waitForFunction(
      () => document.querySelector('#page')?.textContent?.trim() === 'user 7',
    )

    await page.click('#button')
    await page.waitForFunction(
      () => document.querySelector('#page')?.textContent?.trim() === 'about',
    )

    // Disabled: nothing happens
    await page.click('#home')
    await page.waitForFunction(
      () => document.querySelector('#page')?.textContent?.trim() === 'home',
    )
    await page.click('#disabled', { force: true })
    await page.waitForTimeout(200)
    expect(new URL(page.url()).pathname).toBe('/')
    expect(await page.evaluate(() => (window as unknown as { __marker?: boolean }).__marker)).toBe(
      true,
    )

    // Each link is exactly one element
    expect(await page.locator('nav a').count()).toBe(12)

    expect(messages.filter(text => /NuxtLink|Vue warn|Hydration/i.test(text))).toEqual([])
    await page.close()
  })
})
