import process from 'node:process'

export const DEFAULT_DOCS_BASE_URL =
  'https://bootstrap-vue-next.github.io/bootstrap-vue-next/'

const CACHE_TTL_MINUTES = 10
export const CACHE_TTL = CACHE_TTL_MINUTES * 60 * 1000
const MAX_FETCH_ATTEMPTS = 2

const DOC_PATHS = ['llms-full.txt', 'llms.txt'] as const

let cache: string | null = null
let lastFetch = 0
let inFlightFetch: Promise<string | null> | null = null

const normalizeBaseUrl = (value: string): string => {
  const url = new URL(value)

  if (url.pathname.endsWith('/') === false) {
    url.pathname = `${url.pathname}/`
  }

  return url.toString()
}

export const getDocsBaseUrl = (): string => {
  const configuredBaseUrl = process.env.MCP_DOCS_BASE_URL?.trim()

  if (configuredBaseUrl === undefined || configuredBaseUrl.length === 0) {
    return DEFAULT_DOCS_BASE_URL
  }

  try {
    return normalizeBaseUrl(configuredBaseUrl)
  } catch {
    return DEFAULT_DOCS_BASE_URL
  }
}

const fetchArtifact = async (url: string): Promise<string> => {
  const response = await fetch(url, {
    headers: {
      accept: 'text/markdown, text/plain;q=0.9, */*;q=0.1',
    },
  })

  if (response.ok === false) {
    throw new Error(`Unable to fetch docs artifact: ${response.status} ${response.statusText}`)
  }

  const content = await response.text()

  if (content.trim().length === 0) {
    throw new Error(`Received empty docs artifact from ${url}`)
  }

  return content
}

const fetchWithRetry = async (url: string): Promise<string> => {
  let lastError: unknown

  for (let attempt = 0; attempt < MAX_FETCH_ATTEMPTS; attempt += 1) {
    try {
      return await fetchArtifact(url)
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

const fetchLatestDocs = async (): Promise<string> => {
  let lastError: unknown = new Error('Unable to fetch hosted documentation.')

  for (const docPath of DOC_PATHS) {
    try {
      const url = new URL(docPath, getDocsBaseUrl()).toString()
      const content = await fetchWithRetry(url)

      cache = content
      lastFetch = Date.now()

      return content
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

const refreshDocsCache = async (): Promise<string | null> => {
  if (inFlightFetch !== null) {
    return inFlightFetch
  }

  inFlightFetch = (async () => {
    try {
      return await fetchLatestDocs()
    } catch {
      return cache
    } finally {
      inFlightFetch = null
    }
  })()

  return inFlightFetch
}

export const fetchDocs = async (): Promise<string | null> => {
  const now = Date.now()

  if (cache !== null) {
    if (now - lastFetch < CACHE_TTL) {
      return cache
    }

    void refreshDocsCache()

    return cache
  }

  return refreshDocsCache()
}
