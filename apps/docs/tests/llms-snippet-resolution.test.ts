import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { rebuildLLMSFullContent, resolveLLMSnippetDirectives, toLLMOutputPath } from '../src/utils/llmsSnippetResolution'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const docsRoot = path.resolve(__dirname, '../src/docs')

describe('LLMS snippet resolution', () => {
  it('materializes fragment directives into fenced code blocks', () => {
    const sourceMarkdownPath = path.join(docsRoot, 'migration-guide.md')
    const content = '<<< FRAGMENT ./demo/AlertBefore.vue#template{vue-html}'

    expect(resolveLLMSnippetDirectives(content, sourceMarkdownPath)).toBe(
      '```vue-html\n<BAlert show dismissible>I am an alert!</BAlert>\n```'
    )
  })

  it('materializes demo directives into fenced code blocks', () => {
    const sourceMarkdownPath = path.join(docsRoot, 'migration-guide.md')
    const content = '<<< DEMO ./demo/AlertAfter.vue#template{vue-html}'

    expect(resolveLLMSnippetDirectives(content, sourceMarkdownPath)).toBe(
      '```vue-html\n<BAlert model-value dismissible>I am an alert!</BAlert>\n```'
    )
  })

  it('maps nested index pages to LLM markdown output paths', () => {
    expect(toLLMOutputPath(path.join(docsRoot, 'components/index.md'), docsRoot)).toBe('components.md')
    expect(toLLMOutputPath(path.join(docsRoot, 'migration-guide.md'), docsRoot)).toBe('migration-guide.md')
  })

  it('rebuilds llms-full content from llms.txt links', () => {
    const rebuilt = rebuildLLMSFullContent(
      `- [Guide](/bootstrap-vue-next/migration-guide.md)\n- [Components](/bootstrap-vue-next/components.md)`,
      (outputPath) =>
        ({
          'components.md': '---\nurl: /bootstrap-vue-next/components.md\n---\n\n# Components',
          'migration-guide.md': '---\nurl: /bootstrap-vue-next/migration-guide.md\n---\n\n# Migration Guide',
        })[outputPath],
      '/bootstrap-vue-next/'
    )

    expect(rebuilt).toBe(
      '---\nurl: /bootstrap-vue-next/migration-guide.md\n---\n\n# Migration Guide\n---\n\n---\nurl: /bootstrap-vue-next/components.md\n---\n\n# Components'
    )
  })
})
