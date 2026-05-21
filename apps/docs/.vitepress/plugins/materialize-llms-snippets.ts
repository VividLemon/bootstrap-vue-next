import type { Plugin, ResolvedConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { rebuildLLMSFullContent, resolveLLMSnippetDirectives, toLLMOutputPath } from '../../src/utils/llmsSnippetResolution'

const findFiles = (directory: string, filename?: string): string[] => {
  if (!fs.existsSync(directory)) {
    return []
  }

  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      return findFiles(fullPath, filename)
    }

    if (entry.isFile() && (filename === undefined || entry.name === filename)) {
      return [fullPath]
    }

    return []
  })
}

export const materializeLLMSSnippets = (): Plugin => {
  let resolvedConfig: ResolvedConfig | undefined

  return {
    name: 'materialize-llms-snippets',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      resolvedConfig = config
    },
    closeBundle() {
      if (resolvedConfig === undefined) {
        return
      }

      const srcDir = path.resolve(resolvedConfig.root, resolvedConfig.vitepress.srcDir)
      const outDir = path.resolve(resolvedConfig.root, resolvedConfig.vitepress.outDir)

      for (const sourceMarkdownPath of findFiles(srcDir).filter((file) => file.endsWith('.md'))) {
        const outputPath = path.join(outDir, toLLMOutputPath(sourceMarkdownPath, srcDir))

        if (!fs.existsSync(outputPath)) {
          continue
        }

        const existingContent = fs.readFileSync(outputPath, 'utf8')
        const resolvedContent = resolveLLMSnippetDirectives(existingContent, sourceMarkdownPath)

        if (resolvedContent !== existingContent) {
          fs.writeFileSync(outputPath, resolvedContent)
        }
      }

      for (const llmsTxtPath of findFiles(outDir, 'llms.txt')) {
        const llmsFullPath = path.join(path.dirname(llmsTxtPath), 'llms-full.txt')

        if (!fs.existsSync(llmsFullPath)) {
          continue
        }

        const rebuiltContent = rebuildLLMSFullContent(
          fs.readFileSync(llmsTxtPath, 'utf8'),
          (outputPath) => {
            const pagePath = path.join(outDir, outputPath)
            return fs.existsSync(pagePath) ? fs.readFileSync(pagePath, 'utf8') : undefined
          },
          resolvedConfig.base
        )

        if (rebuiltContent !== undefined) {
          fs.writeFileSync(llmsFullPath, rebuiltContent)
        }
      }
    },
  }
}
