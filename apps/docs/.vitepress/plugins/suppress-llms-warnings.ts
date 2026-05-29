import type { Plugin } from 'vite'

/**
 * Suppresses known harmless warnings from vitepress-plugin-llms remark-include.
 *
 * The llms plugin internally uses remark-include which attempts to resolve
 * custom `<<< DEMO` / `<<< FRAGMENT` directives as file snippets.
 * These directives are handled by our own materialize-llms-snippets plugin
 * at a later stage, so the "Snippet file not found" warnings are expected
 * and should be silenced.
 */
export const suppressLlmsWarnings = (): Plugin => {
  const originalWarn = console.warn
  let patched = false

  return {
    name: 'suppress-llms-warnings',
    buildStart() {
      if (patched) return
      patched = true
      console.warn = (...args: unknown[]) => {
        const msg = typeof args[0] === 'string' ? args[0] : ''
        if (msg.includes('[remark-include] Snippet file not found:')) return
        if (msg.includes('[remark-include] Include file not found:')) return
        if (msg.includes('[remark-include] Region') && msg.includes('not found in')) return
        originalWarn.apply(console, args)
      }
    },
    closeBundle() {
      if (patched) {
        console.warn = originalWarn
        patched = false
      }
    },
  }
}
