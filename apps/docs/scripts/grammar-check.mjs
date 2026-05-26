import {promises as fs} from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import ts from 'typescript'
import writeGood from 'write-good'

const docsRoot = path.resolve(import.meta.dirname, '..')
const sourceRoot = path.join(docsRoot, 'src')
const componentDataRoot = path.join(sourceRoot, 'data', 'components')

const writeGoodOptions = {
  adverb: false,
  duplicates: true,
  eprime: false,
  illusion: false,
  passive: false,
  so: false,
  thereIs: true,
  tooWordy: false,
  weasel: false,
}

const ignorePatterns = [
  /<https?:\/\/[^>]+>/g,
  /https?:\/\/\S+/g,
  /\bB[A-Z][A-Za-z0-9]+\b/g,
  /\bv-[a-z0-9-]+\b/g,
  /\b[A-Z][A-Za-z0-9]+Props\b/g,
  /\b[A-Z][A-Za-z0-9]+Slots\b/g,
  /\bBootstrapVueNext\b/g,
  /\bBootstrapVue\b/g,
  /\bVitePress\b/g,
  /\bWAI-ARIA\b/g,
  /\bNuxt\.js\b/g,
  /\bVue\.js\b/g,
  /\bv-model\b/g,
  /\b[0-9]+-based\b/g,
]

const normalizeForLint = (value) =>
  ignorePatterns.reduce((text, pattern) => text.replaceAll(pattern, ' '), value)

const hasLintableText = (value) => /[A-Za-z]/.test(value)

const getLineStarts = (value) => {
  const lineStarts = [0]

  for (let index = 0; index < value.length; index++) {
    if (value[index] === '\n') lineStarts.push(index + 1)
  }

  return lineStarts
}

const getLocationFromOffset = (lineStarts, offset) => {
  let lineIndex = 0

  while (lineIndex + 1 < lineStarts.length && lineStarts[lineIndex + 1] <= offset) {
    lineIndex++
  }

  return {
    lineIndex,
    column: offset - lineStarts[lineIndex] + 1,
  }
}

const lintText = (text) => writeGood(normalizeForLint(text), writeGoodOptions)

const createIssue = (filePath, line, column, reason) => ({
  filePath,
  line,
  column,
  reason,
})

const lintBlock = (filePath, segments) => {
  const text = segments.map((segment) => segment.text).join('\n')
  if (!hasLintableText(text)) return []

  const issues = lintText(text)
  const lineStarts = getLineStarts(text)

  return issues.map((issue) => {
    const {lineIndex, column} = getLocationFromOffset(lineStarts, issue.index)
    return createIssue(filePath, segments[lineIndex].lineNumber, column, issue.reason)
  })
}

const stripMarkdownSyntax = (value) =>
  value
    .replaceAll(/`[^`]*`/g, ' ')
    .replaceAll(/!\[([^\]]*)\]\([^)]+\)/g, ' $1 ')
    .replaceAll(/\[([^\]]+)\]\([^)]+\)/g, ' $1 ')
    .replaceAll(/<[^>]+>/g, ' ')
    .replaceAll(/[*_~]/g, '')
    .replaceAll(/\|/g, ' ')
    .replaceAll(/&[a-z0-9#]+;/gi, ' ')
    .replace(/^\s{0,3}(?:#{1,6}\s+|>\s+|[-*+]\s+|\d+\.\s+)/, '')
    .replaceAll(/\s+/g, ' ')
    .trim()

const extractFrontmatterBlocks = (lines) => {
  if (lines[0] !== '---') return {contentStart: 0, blocks: []}

  const blocks = []
  let index = 1
  const pushScalar = (lineNumber, value) => {
    if (!value.trim()) return
    blocks.push([{lineNumber, text: value.trim()}])
  }

  while (index < lines.length) {
    const rawLine = lines[index]
    if (rawLine === '---') {
      return {
        contentStart: index + 1,
        blocks,
      }
    }

    const match = rawLine.match(/^(title|description):\s*(.*)$/)
    if (!match) {
      index++
      continue
    }

    const [, key, rest] = match
    const lineNumber = index + 1
    const normalizedRest = rest.trim()

    if (
      key === 'description' &&
      (normalizedRest === '>' ||
        normalizedRest === '>-' ||
        normalizedRest === '|' ||
        normalizedRest === '|-')
    ) {
      const block = []
      index++

      while (index < lines.length) {
        const continuation = lines[index]
        if (continuation === '---') break
        if (!continuation.startsWith(' ') && !continuation.startsWith('\t')) break

        const text = continuation.trim()
        if (text) block.push({lineNumber: index + 1, text})
        index++
      }

      if (block.length > 0) blocks.push(block)
      continue
    }

    pushScalar(lineNumber, normalizedRest)
    index++
  }

  return {
    contentStart: 0,
    blocks: [],
  }
}

const lintMarkdownFile = async (filePath) => {
  const source = await fs.readFile(filePath, 'utf8')
  const lines = source.split('\n')
  const {contentStart, blocks: frontmatterBlocks} = extractFrontmatterBlocks(lines)
  const issues = frontmatterBlocks.flatMap((block) => lintBlock(filePath, block))

  let currentBlock = []
  let inFence = false
  let fenceMarker = ''
  let inScriptBlock = false
  let inStyleBlock = false

  const flushBlock = () => {
    if (currentBlock.length === 0) return
    issues.push(...lintBlock(filePath, currentBlock))
    currentBlock = []
  }

  for (let index = contentStart; index < lines.length; index++) {
    const rawLine = lines[index] ?? ''
    const trimmed = rawLine.trim()

    const fenceMatch = trimmed.match(/^(```+|~~~+)/)
    if (fenceMatch) {
      if (!inFence) {
        flushBlock()
        inFence = true
        fenceMarker = fenceMatch[1][0]
      } else if (fenceMatch[1][0] === fenceMarker) {
        inFence = false
        fenceMarker = ''
      }
      continue
    }

    if (inFence) continue

    if (trimmed.startsWith('<script')) {
      flushBlock()
      inScriptBlock = true
    }

    if (trimmed.startsWith('<style')) {
      flushBlock()
      inStyleBlock = true
    }

    if (inScriptBlock || inStyleBlock) {
      if (trimmed.includes('</script>')) inScriptBlock = false
      if (trimmed.includes('</style>')) inStyleBlock = false
      continue
    }

    if (
      trimmed === '' ||
      /^(-{3,}|\*{3,})$/.test(trimmed) ||
      /^[:| -]+$/.test(trimmed)
    ) {
      flushBlock()
      continue
    }

    const text = stripMarkdownSyntax(rawLine)
    if (!hasLintableText(text)) {
      flushBlock()
      continue
    }

    currentBlock.push({
      lineNumber: index + 1,
      text,
    })
  }

  flushBlock()
  return issues
}

const getStringValue = (node) => {
  if (ts.isStringLiteralLike(node)) return node.text
  return null
}

const lintComponentDataFile = async (filePath) => {
  const source = await fs.readFile(filePath, 'utf8')
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true)
  const issues = []

  const visit = (node) => {
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'description'
    ) {
      const value = getStringValue(node.initializer)
      if (!value?.trim()) {
        ts.forEachChild(node, visit)
        return
      }

      const start = node.initializer.getStart(sourceFile) + 1
      const base = sourceFile.getLineAndCharacterOfPosition(start)
      const lineStarts = getLineStarts(value)

      for (const issue of lintText(value)) {
        const {lineIndex, column} = getLocationFromOffset(lineStarts, issue.index)
        issues.push(
          createIssue(
            filePath,
            base.line + lineIndex + 1,
            (lineIndex === 0 ? base.character : 0) + column,
            issue.reason
          )
        )
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return issues
}

const walk = async (directoryPath, predicate) => {
  const entries = await fs.readdir(directoryPath, {withFileTypes: true})
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directoryPath, entry.name)
      if (entry.isDirectory()) return walk(entryPath, predicate)
      return predicate(entryPath) ? [entryPath] : []
    })
  )

  return files.flat().sort()
}

const markdownFiles = await walk(sourceRoot, (filePath) => filePath.endsWith('.md'))
const componentDataFiles = await walk(componentDataRoot, (filePath) => filePath.endsWith('.data.ts'))
const strict = process.argv.includes('--strict')

const issues = [
  ...(await Promise.all(markdownFiles.map((filePath) => lintMarkdownFile(filePath)))).flat(),
  ...(await Promise.all(componentDataFiles.map((filePath) => lintComponentDataFile(filePath)))).flat(),
].sort((left, right) => {
  return (
    left.filePath.localeCompare(right.filePath) ||
    left.line - right.line ||
    left.column - right.column
  )
})

if (issues.length === 0) {
  console.log(
    `Grammar check passed for ${markdownFiles.length} markdown files and ${componentDataFiles.length} component data files.`
  )
  process.exit(0)
}

for (const issue of issues) {
  const displayPath = path.relative(docsRoot, issue.filePath)
  console.error(`${displayPath}:${issue.line}:${issue.column} ${issue.reason}`)
}

console.error(
  `Grammar check reported ${issues.length} issue${issues.length === 1 ? '' : 's'} across ${markdownFiles.length} markdown files and ${componentDataFiles.length} component data files.`
)
process.exit(strict ? 1 : 0)
