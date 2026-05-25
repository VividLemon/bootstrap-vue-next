import {basename, extname} from 'node:path'
import {spawnSync} from 'node:child_process'

const [mode, extensionList = '', ...files] = process.argv.slice(2)

const hasExtension = (file, extensions) => extensions.includes(extname(file))
const isMarkdown = (file) => extname(file) === '.md'

const commandMap = {
  eslint: {
    command: 'eslint',
    args: ['--cache', '--fix'],
    filter: (file) => hasExtension(file, extensionList.split(',').filter(Boolean)),
  },
  oxfmt: {
    command: 'oxfmt',
    args: [],
    filter: (file) => hasExtension(file, extensionList.split(',').filter(Boolean)),
  },
  'prettier-markdown': {
    command: 'prettier',
    args: ['--write', '--ignore-unknown'],
    filter: (file) => isMarkdown(file) && !basename(file).startsWith('CHANGELOG'),
  },
  'prettier-non-markdown': {
    command: 'prettier',
    args: ['--write', '--ignore-unknown'],
    filter: (file) => !isMarkdown(file),
  },
}

const selectedCommand = commandMap[mode]

if (!selectedCommand) {
  process.exit(1)
}

const filteredFiles = files.filter(selectedCommand.filter)

if (filteredFiles.length === 0) {
  process.exit(0)
}

const result = spawnSync(selectedCommand.command, [...selectedCommand.args, ...filteredFiles], {
  stdio: 'inherit',
})

if (result.error) {
  throw result.error
}

process.exit(result.status ?? 0)
