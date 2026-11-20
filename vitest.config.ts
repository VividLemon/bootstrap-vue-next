import {defineConfig} from 'vite-plus'

export default defineConfig({
  test: {
    projects: [
      'packages/*',
      // packages/mcp uses node:test through its own `test:unit:ci` script, not Vitest
      '!packages/mcp',
      'apps/*'
    ]
  }
})
