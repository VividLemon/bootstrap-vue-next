import {fetchDocs} from './fetchDocs.js'

const normalizeDocs = (content: string): string =>
  content
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .trim()

export const loadDocs = async (): Promise<string> => {
  const docs = await fetchDocs()

  if (docs === null) {
    return ''
  }

  return normalizeDocs(docs)
}
