/**
 * Build-time data loader that fetches contributors per docs page
 * from GitHub commit history for the resolved source files.
 *
 * Follows the async data-loader pattern used by opencollective.data.ts.
 */

import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readdirSync, existsSync } from 'node:fs'
import {
  resolveSourcePaths,
  resolveComponentSourcePaths,
  toCamelCase,
} from '../utils/sourcePathResolver'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export interface Contributor {
  login: string
  name: string
  avatarUrl: string
  profileUrl: string
  commits: number
}

export interface PageContributors {
  sourcePaths: string[]
  contributors: Contributor[]
}

export type ContributorsData = Record<string, PageContributors>

const GITHUB_API_BASE = 'https://api.github.com'
const REPO_OWNER = 'bootstrap-vue-next'
const REPO_NAME = 'bootstrap-vue-next'
const PACKAGE_SRC_PREFIX = 'packages/bootstrap-vue-next/src'

// Cache per source path to avoid re-fetching the same file history
const commitCache = new Map<string, Map<string, { name: string; commits: number }>>()

/**
 * Fetch contributors for a source file from GitHub commit history.
 */
async function fetchFileContributors(
  filePath: string,
): Promise<Map<string, { name: string; commits: number }>> {
  if (commitCache.has(filePath)) {
    return commitCache.get(filePath)!
  }

  const token = process.env.GITHUB_TOKEN || ''
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const contributors = new Map<string, { name: string; commits: number }>()

  try {
    // Fetch commits for this file path (limited to 100 most recent commits per file)
    const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/commits?path=${encodeURIComponent(filePath)}&per_page=100`
    const response = await fetch(url, { headers })

    if (!response.ok) {
      console.warn(`[contributors] GitHub API returned ${response.status} for ${filePath}`)
      commitCache.set(filePath, contributors)
      return contributors
    }

    const commits: Array<{
      author?: { login: string; avatar_url: string; html_url: string } | null
      commit: { author?: { name?: string } | null }
    }> = await response.json()

    for (const commit of commits) {
      if (!commit.author?.login) continue

      const login = commit.author.login
      const existing = contributors.get(login)
      if (existing) {
        existing.commits++
      } else {
        contributors.set(login, {
          name: commit.commit.author?.name || login,
          commits: 1,
        })
      }
    }
  } catch (error) {
    console.warn(`[contributors] Failed to fetch contributors for ${filePath}:`, error)
  }

  commitCache.set(filePath, contributors)
  return contributors
}

/**
 * Aggregate contributors across multiple source files and deduplicate by login.
 */
async function aggregateContributors(sourcePaths: string[]): Promise<Contributor[]> {
  const aggregated = new Map<
    string,
    { name: string; commits: number; avatarUrl: string; profileUrl: string }
  >()

  for (const sourcePath of sourcePaths) {
    const fullPath = `${PACKAGE_SRC_PREFIX}/${sourcePath}`
    const fileContributors = await fetchFileContributors(fullPath)

    for (const [login, data] of fileContributors) {
      const existing = aggregated.get(login)
      if (existing) {
        existing.commits += data.commits
      } else {
        aggregated.set(login, {
          name: data.name,
          commits: data.commits,
          avatarUrl: `https://avatars.githubusercontent.com/${login}?s=64`,
          profileUrl: `https://github.com/${login}`,
        })
      }
    }
  }

  // Sort by commit count descending
  return Array.from(aggregated.entries())
    .map(([login, data]) => ({
      login,
      ...data,
    }))
    .sort((a, b) => b.commits - a.commits)
}

/**
 * Resolve source paths for a component page by dynamically importing its .data.ts file.
 */
async function resolveComponentPagePaths(filename: string): Promise<string[]> {
  const dataFileName = toCamelCase(filename)
  const dataFilePath = resolve(__dirname, `components/${dataFileName}.data.ts`)

  if (!existsSync(dataFilePath)) {
    // Fallback to default derivation
    const result = resolveSourcePaths(`docs/components/${filename}.md`)
    return result?.paths ?? []
  }

  try {
    const mod = await import(dataFilePath)
    const data = typeof mod.default?.load === 'function' ? mod.default.load() : mod.default
    if (data && typeof data === 'object') {
      return resolveComponentSourcePaths(data)
    }
  } catch (error) {
    console.warn(`[contributors] Failed to load component data for ${filename}:`, error)
  }

  // Fallback
  const result = resolveSourcePaths(`docs/components/${filename}.md`)
  return result?.paths ?? []
}

/**
 * Enumerate all docs pages that should have contributors.
 */
function enumerateDocPages(): Array<{ pagePath: string; relativeMdPath: string }> {
  const docsBase = resolve(__dirname, '../docs')
  const pages: Array<{ pagePath: string; relativeMdPath: string }> = []

  const categories = ['components', 'composables', 'directives'] as const
  for (const category of categories) {
    const dir = resolve(docsBase, category)
    if (!existsSync(dir)) continue

    const files = readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_'))

    for (const file of files) {
      const filename = file.replace(/\.md$/, '')
      pages.push({
        pagePath: `docs/${category}/${filename}`,
        relativeMdPath: `docs/${category}/${file}`,
      })
    }
  }

  return pages
}

export default {
  load: async (): Promise<ContributorsData> => {
    const pages = enumerateDocPages()
    const result: ContributorsData = {}

    // Process pages with rate limiting consideration
    for (const { pagePath, relativeMdPath } of pages) {
      const filename = pagePath.split('/').pop()!
      const pageType = pagePath.split('/')[1] as 'components' | 'composables' | 'directives'

      let sourcePaths: string[]

      if (pageType === 'components') {
        sourcePaths = await resolveComponentPagePaths(filename)
      } else {
        const resolved = resolveSourcePaths(relativeMdPath)
        sourcePaths = resolved?.paths ?? []
      }

      if (sourcePaths.length === 0) continue

      const contributors = await aggregateContributors(sourcePaths)

      if (contributors.length > 0) {
        result[pagePath] = {
          sourcePaths,
          contributors,
        }
      }
    }

    return result
  },
}
