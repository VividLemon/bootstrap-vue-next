export type DocChunk = {
  id: string
  content: string
}

const MAX_CHUNK_SIZE = 2000
const HEADING_PATTERN = /^#{1,2}\s+.+$/gm

const createChunkId = (content: string, index: number): string => {
  const heading = content.match(/^#{1,2}\s+(.+)$/m)?.[1] ?? `chunk-${index + 1}`
  const slug = heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)

  return `${String(index + 1).padStart(3, '0')}-${slug || 'section'}`
}

const splitBySize = (content: string): string[] => {
  const chunks: string[] = []
  let remaining = content.trim()

  while (remaining.length > MAX_CHUNK_SIZE) {
    const slice = remaining.slice(0, MAX_CHUNK_SIZE)
    const splitIndex = Math.max(
      slice.lastIndexOf('\n\n'),
      slice.lastIndexOf('\n'),
      slice.lastIndexOf(' ')
    )
    const safeSplitIndex = splitIndex > 0 ? splitIndex : MAX_CHUNK_SIZE
    const chunk = remaining.slice(0, safeSplitIndex).trim()

    if (chunk.length > 0) {
      chunks.push(chunk)
    }

    remaining = remaining.slice(safeSplitIndex).trim()
  }

  if (remaining.length > 0) {
    chunks.push(remaining)
  }

  return chunks
}

const splitByHeading = (docs: string): string[] => {
  const matches = [...docs.matchAll(HEADING_PATTERN)]

  if (matches.length === 0) {
    return []
  }

  const sections: string[] = []
  const intro = docs.slice(0, matches[0]?.index).trim()

  if (intro.length > 0) {
    sections.push(intro)
  }

  for (const [index, match] of matches.entries()) {
    const start = match.index ?? 0
    const end = matches[index + 1]?.index ?? docs.length
    const section = docs.slice(start, end).trim()

    if (section.length > 0) {
      sections.push(section)
    }
  }

  return sections
}

export const chunkDocs = (docs: string): DocChunk[] => {
  const sections = splitByHeading(docs)
  const contentChunks =
    sections.length > 0 ? sections.flatMap((section) => splitBySize(section)) : splitBySize(docs)

  return contentChunks.map((content, index) => ({
    id: createChunkId(content, index),
    content,
  }))
}
