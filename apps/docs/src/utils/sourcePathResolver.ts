/**
 * Shared utility for resolving source file paths from docs page paths.
 *
 * Consolidates the filename-to-source logic from PageHeader.vue and
 * ComponentReference.vue into a single reusable module.
 */

import { kebabToTitleCase } from './dataLoaderUtils'

/**
 * Convert kebab-case to PascalCase
 * @example toPascalCase('form-input') => 'FormInput'
 */
export function toPascalCase(str: string): string {
  return kebabToTitleCase(str).replace(/\s+/g, '')
}

/**
 * Convert kebab-case to camelCase
 * @example toCamelCase('use-toast') => 'useToast'
 */
export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

export type DocPageType = 'components' | 'composables' | 'directives'

/**
 * Determines the doc page type from a relative markdown path.
 */
export function inferPageType(relativePath: string): DocPageType | null {
  if (relativePath.includes('/components/')) return 'components'
  if (relativePath.includes('/composables/')) return 'composables'
  if (relativePath.includes('/directives/')) return 'directives'
  return null
}

/**
 * Extracts the filename (without extension) from a relative path.
 */
export function extractFilenameFromPath(relativePath: string): string | null {
  const segments = relativePath.split('/')
  const last = segments[segments.length - 1]
  return last?.replace(/\.md$/i, '') || null
}

/**
 * Override map for edge cases where the default derivation is incorrect.
 * Keys are markdown filenames (without extension), values are source paths
 * relative to the package src directory.
 */
const sourcePathOverrides: Record<string, string[]> = {
  // Add edge-case overrides here as needed
  // e.g. 'some-alias': ['composables/realName/index.ts']
}

export interface ResolvedSourcePaths {
  type: DocPageType
  /** Source paths relative to the package src directory (e.g. 'components/BButton/BButton.vue') */
  paths: string[]
}

/**
 * Resolves package source file paths for a given docs page relative path.
 *
 * For component pages, derives the primary component path. Use
 * `resolveComponentSourcePaths` with the .data.ts entries for full coverage.
 *
 * For composables/directives, derives from the filename pattern.
 */
export function resolveSourcePaths(relativePath: string): ResolvedSourcePaths | null {
  const pageType = inferPageType(relativePath)
  if (!pageType) return null

  const filename = extractFilenameFromPath(relativePath)
  if (!filename || filename.startsWith('_')) return null

  // Check override map
  if (sourcePathOverrides[filename]) {
    return { type: pageType, paths: sourcePathOverrides[filename] }
  }

  switch (pageType) {
    case 'components': {
      const componentName = `B${toPascalCase(filename)}`
      return {
        type: pageType,
        paths: [`components/${componentName}/${componentName}.vue`],
      }
    }
    case 'composables': {
      const composableName = toCamelCase(filename)
      return {
        type: pageType,
        paths: [`composables/${composableName}/index.ts`],
      }
    }
    case 'directives': {
      const directiveName = toPascalCase(filename)
      return {
        type: pageType,
        paths: [`directives/${directiveName}/index.ts`],
      }
    }
  }
}

/**
 * Resolves source paths for component pages using their .data.ts entries.
 * This covers multi-component pages and explicit sourcePath overrides.
 *
 * @param componentData - The ComponentReference data from the .data.ts file
 * @returns Array of relative source paths (e.g. ['components/BTabs/BTabs.vue', 'components/BTabs/BTab.vue'])
 */
export function resolveComponentSourcePaths(
  componentData: Record<string, { sourcePath?: string | null }>,
): string[] {
  const componentNames = Object.keys(componentData)
  const baseDirectory = componentNames[0]

  return componentNames
    .map((name) => {
      const entry = componentData[name]
      if (entry.sourcePath === null) return null

      const sourcePath = entry.sourcePath ?? `/${baseDirectory}/${name}.vue`
      // sourcePath is like '/BTabs/BTabs.vue', prefix with 'components'
      return `components${sourcePath}`
    })
    .filter((p): p is string => p !== null)
}
