import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('nuxt-link integration', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/nuxt-link', import.meta.url)),
  })

  it('renders BLink and BLink-consuming components using NuxtLink by default', async () => {
    const html = await $fetch<string>('/')

    // One anchor per link: NuxtLink runs in `custom` mode and only supplies the slot scope
    expect(html).not.toMatch(/<a[^>]*>\s*<a/)

    expect(html).toMatch(
      /<a(?=[^>]*id="direct-link")(?=[^>]*class="[^"]*\brouter-link-active\b)[^>]+>/,
    )
    expect(html).toMatch(
      /<a(?=[^>]*id="button-link")(?=[^>]*class="[^"]*\brouter-link-active\b)[^>]+>/,
    )
    expect(html).toMatch(
      /<a(?=[^>]*id="nav-item-link")(?=[^>]*class="[^"]*\brouter-link-active\b)[^>]+>/,
    )
    expect(html).toMatch(
      /<a(?=[^>]*id="menu-item-link")(?=[^>]*class="[^"]*\brouter-link-active\b)[^>]+>/,
    )
  })
})
