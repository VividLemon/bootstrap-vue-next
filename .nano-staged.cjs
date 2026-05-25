const path = require('node:path')

const allowedCommands = new Set([
  'eslint --cache --fix',
  'prettier --write --ignore-unknown',
  'oxfmt',
])
const toPosixPath = (filename) => filename.split(path.sep).join('/')
const toRelativePath = (filename) => toPosixPath(path.relative(process.cwd(), filename))
const safePathPattern = /^[A-Za-z0-9._/-]+$/
const isSafePath = (filename) => safePathPattern.test(filename)

const validateSafePath = (filename, description) => {
  if (!isSafePath(filename)) {
    throw new Error(`Unsupported ${description}: ${filename}`)
  }
}

const validateAllowedCommand = (command) => {
  if (!allowedCommands.has(command)) {
    throw new Error(`Unsupported command: ${command}`)
  }
}

const toWorkspaceRelativePath = (filename, workspacePath) => {
  const relativePath = toRelativePath(filename)
  const workspacePrefix = `${workspacePath}/`

  if (!relativePath.startsWith(workspacePrefix)) {
    throw new Error(`Expected ${relativePath} to be inside ${workspacePath}`)
  }

  validateSafePath(relativePath, 'staged filename')

  return relativePath.slice(workspacePrefix.length)
}

const buildCommand = (workspacePath, command, filenames) => {
  if (filenames.length === 0) {
    return null
  }

  validateSafePath(workspacePath, 'workspace path')
  validateAllowedCommand(command)

  const workspaceFiles = filenames.map((filename) => toWorkspaceRelativePath(filename, workspacePath))

  return `corepack pnpm --dir ${workspacePath} exec ${command} ${workspaceFiles.join(' ')}`
}

const hasExtension = (filename, extensions) => extensions.includes(path.extname(filename))
const isMarkdown = (filename) => path.extname(filename) === '.md'
const isChangelogMarkdown = (filename) => isMarkdown(filename) && path.basename(filename).startsWith('CHANGELOG')

const collectWorkspaceFiles = (filenames, workspacePath) =>
  filenames.filter((filename) => toRelativePath(filename).startsWith(`${workspacePath}/`))

module.exports = (api) => {
  const coreWorkspaceFiles = collectWorkspaceFiles(api.filenames, 'packages/bootstrap-vue-next')
  const nuxtWorkspaceFiles = collectWorkspaceFiles(api.filenames, 'packages/nuxt')
  const docsWorkspaceFiles = collectWorkspaceFiles(api.filenames, 'apps/docs')

  const coreEslintFiles = coreWorkspaceFiles.filter((filename) => hasExtension(filename, ['.js', '.ts', '.vue']))
  const coreMarkdownFiles = coreWorkspaceFiles.filter(
    (filename) => isMarkdown(filename) && !isChangelogMarkdown(filename)
  )
  const coreNonMarkdownFiles = coreWorkspaceFiles.filter((filename) => !isMarkdown(filename))

  const nuxtEslintFiles = nuxtWorkspaceFiles.filter((filename) => hasExtension(filename, ['.js', '.ts', '.vue']))
  const nuxtMarkdownFiles = nuxtWorkspaceFiles.filter(
    (filename) => isMarkdown(filename) && !isChangelogMarkdown(filename)
  )
  const nuxtNonMarkdownFiles = nuxtWorkspaceFiles.filter((filename) => !isMarkdown(filename))

  const docsEslintFiles = docsWorkspaceFiles.filter((filename) =>
    hasExtension(filename, ['.js', '.ts', '.vue'])
  )
  const docsOxfmtFiles = docsWorkspaceFiles.filter((filename) =>
    hasExtension(filename, ['.js', '.ts', '.mts', '.tsx', '.vue'])
  )

  return [
    buildCommand('packages/bootstrap-vue-next', 'eslint --cache --fix', coreEslintFiles),
    buildCommand('packages/bootstrap-vue-next', 'prettier --write --ignore-unknown', coreMarkdownFiles),
    buildCommand('packages/bootstrap-vue-next', 'prettier --write --ignore-unknown', coreNonMarkdownFiles),
    buildCommand('packages/nuxt', 'eslint --cache --fix', nuxtEslintFiles),
    buildCommand('packages/nuxt', 'prettier --write --ignore-unknown', nuxtMarkdownFiles),
    buildCommand('packages/nuxt', 'prettier --write --ignore-unknown', nuxtNonMarkdownFiles),
    buildCommand('apps/docs', 'eslint --cache --fix', docsEslintFiles),
    buildCommand('apps/docs', 'oxfmt', docsOxfmtFiles),
  ].filter(Boolean)
}
