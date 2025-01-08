import {createMarkdownRenderer} from 'vitepress'
import {join} from 'node:path'
import {readFile} from 'node:fs/promises'

export type ExtractedTypes = {type: 'interface' | 'type'; value: string}

const findClosingBrace = (input: string, openIndex: number): number => {
  let depth = 1
  for (let i = openIndex + 1; i < input.length; i++) {
    if (input[i] === '{') depth++
    else if (input[i] === '}') depth--
    if (depth === 0) return i
  }
  throw new Error('Unmatched opening brace')
}
const extractTypes = (input: string): Record<string, ExtractedTypes> => {
  const typeRegex = /(?:export\s+)?type\s+([a-zA-Z0-9_]+)\s*=\s*([\s\S]*?);/g
  const interfaceRegex = /(?:export\s+)?interface\s+([a-zA-Z0-9_]+)\s*{/g

  const extractedTypes: Record<string, ExtractedTypes> = {}
  let match: RegExpExecArray | null

  // Match type definitions
  while ((match = typeRegex.exec(input)) !== null) {
    const [, typeName, typeDef] = match
    extractedTypes[typeName] = {
      type: 'type',
      value: typeDef.trim(),
    }
  }

  // Match interface definitions
  while ((match = interfaceRegex.exec(input)) !== null) {
    const [, typeName] = match
    const braceIndex = input.indexOf('{', match.index)
    const closingBraceIndex = findClosingBrace(input, braceIndex)
    const interfaceDef = input.substring(braceIndex, closingBraceIndex + 1).trim()
    extractedTypes[typeName] = {
      type: 'interface',
      value: interfaceDef,
    }
  }

  return extractedTypes
}

export default {
  async load() {
    const fetchPackage = (input: string) => readFile(join(process., 'node_modules', input), 'utf8')

    const [AlignmentTypesRaw, BreadcrumbTypesRaw] = await Promise.all([
      fetchPackage('bootstrap-vue-next/types/Alignment'),
      fetchPackage('bootstrap-vue-next/types/BreadcrumbTypes'),
    ])

    // @ts-expect-error global in vitepress (node)
    const config = globalThis.VITEPRESS_CONFIG

    const md = await createMarkdownRenderer(
      config.srcDir,
      config.markdown,
      config.site.base,
      config.logger
    )

    const getTsString = ({type: tsType, name, value}: ExtractedTypes & {name: string}) =>
      `${tsType} ${name} ${tsType === 'interface' ? '' : '='} ${value}`

    const convertExtractedTypes = ({fileName, value}: {fileName: string; value: string}) => {
      const input = extractTypes(value)
      Object.entries(input).forEach(([name, v]) => {
        input[name] = {
          ...v,
          value: md.render(getTsString({type: v.type, name, value: v.value})),
        }
      })
      return {
        [fileName]: input,
      }
    }

    return {
      ...convertExtractedTypes({fileName: 'alignment', value: String(AlignmentTypesRaw)}),
      ...convertExtractedTypes({fileName: 'breadcrumb', value: String(BreadcrumbTypesRaw)}),
    }
  },
}
