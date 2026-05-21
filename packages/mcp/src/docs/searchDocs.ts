import type {DocChunk} from './chunkDocs.js'

type SearchResult = DocChunk & {
  score: number
}

const tokenize = (value: string): string[] =>
  [...new Set((value.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((token) => token.length > 1))]

const getPositionBonus = (content: string, query: string): number => {
  const index = content.indexOf(query)

  if (index < 0) {
    return 0
  }

  return Math.max(0, 250 - index)
}

const scoreChunk = (chunk: DocChunk, query: string, keywords: string[]): SearchResult | null => {
  const content = chunk.content

  if (content.includes(query)) {
    return {
      ...chunk,
      score: 3000 + getPositionBonus(content, query),
    }
  }

  const loweredContent = content.toLowerCase()
  const loweredQuery = query.toLowerCase()

  if (loweredContent.includes(loweredQuery)) {
    return {
      ...chunk,
      score: 2000 + getPositionBonus(loweredContent, loweredQuery),
    }
  }

  const contentKeywords = new Set(tokenize(content))
  let overlap = 0

  for (const keyword of keywords) {
    if (contentKeywords.has(keyword)) {
      overlap += 1
    }
  }

  if (overlap === 0) {
    return null
  }

  return {
    ...chunk,
    score: 1000 + overlap * 100,
  }
}

export const searchDocs = (chunks: DocChunk[], query: string, limit = 5): DocChunk[] => {
  const normalizedQuery = query.trim()

  if (normalizedQuery.length === 0) {
    return []
  }

  const keywords = tokenize(normalizedQuery)

  return chunks
    .map((chunk) => scoreChunk(chunk, normalizedQuery, keywords))
    .filter((result): result is SearchResult => result !== null)
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
    .slice(0, limit)
    .map(({id, content}) => ({id, content}))
}
