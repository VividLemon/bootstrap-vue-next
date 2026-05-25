const path = require('node:path')

const quoteFile = (filename) => JSON.stringify(filename)

const buildCommand = (command, filenames) =>
  filenames.length > 0 ? `${command} ${filenames.map(quoteFile).join(' ')}` : null

const hasExtension = (filename, extensions) => extensions.includes(path.extname(filename))
const isMarkdown = (filename) => path.extname(filename) === '.md'
const isChangelogMarkdown = (filename) => isMarkdown(filename) && path.basename(filename).startsWith('CHANGELOG')

const collectWorkspaceFiles = (filenames, workspacePath) =>
  filenames.filter((filename) => filename.startsWith(`${workspacePath}/`))

module.exports = (api) => {
  const coreWorkspaceFiles = collectWorkspaceFiles(api.filenames, 'packages/bootstrap-vue-next')
  const nuxtWorkspaceFiles = collectWorkspaceFiles(api.filenames, 'packages/nuxt')
  const docsWorkspaceFiles = collectWorkspaceFiles(api.filenames, 'apps/docs')

  const prettierWorkspaceFiles = [...coreWorkspaceFiles, ...nuxtWorkspaceFiles]
  const eslintWorkspaceFiles = prettierWorkspaceFiles.filter((filename) =>
    hasExtension(filename, ['.js', '.ts', '.vue'])
  )
  const markdownWorkspaceFiles = prettierWorkspaceFiles.filter(
    (filename) => isMarkdown(filename) && !isChangelogMarkdown(filename)
  )
  const nonMarkdownWorkspaceFiles = prettierWorkspaceFiles.filter((filename) => !isMarkdown(filename))

  const docsEslintFiles = docsWorkspaceFiles.filter((filename) =>
    hasExtension(filename, ['.js', '.ts', '.vue'])
  )
  const docsOxfmtFiles = docsWorkspaceFiles.filter((filename) =>
    hasExtension(filename, ['.js', '.ts', '.mts', '.tsx', '.vue'])
  )

  return [
    buildCommand('eslint --cache --fix', eslintWorkspaceFiles),
    buildCommand('prettier --write --ignore-unknown', markdownWorkspaceFiles),
    buildCommand('prettier --write --ignore-unknown', nonMarkdownWorkspaceFiles),
    buildCommand('eslint --cache --fix', docsEslintFiles),
    buildCommand('oxfmt', docsOxfmtFiles),
  ].filter(Boolean)
}
