import process from 'node:process'

import {Server} from '#mcp-sdk/server'
import {StdioServerTransport} from '#mcp-sdk/stdio'
import {CallToolRequestSchema, ListToolsRequestSchema, type Tool} from '#mcp-sdk/types'

import packageJson from '../package.json' with {type: 'json'}
import {chunkDocs, type DocChunk} from './docs/chunkDocs.js'
import {loadDocs} from './docs/loadDocs.js'
import {searchDocs} from './docs/searchDocs.js'

const SERVER_INFO = {
  name: packageJson.name,
  version: packageJson.version,
} as const

const TOOL_DEFINITIONS = [
  {
    name: 'get_migration_help',
    description:
      'Search BootstrapVueNext hosted migration documentation and return the most relevant markdown chunks.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Migration-related search query.',
        },
      },
      required: ['query'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {type: 'string'},
              content: {type: 'string'},
            },
            required: ['id', 'content'],
          },
        },
      },
      required: ['results'],
    },
  },
  {
    name: 'search_docs',
    description:
      'Search BootstrapVueNext hosted markdown documentation and return a broader set of raw chunks.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Documentation search query.',
        },
      },
      required: ['query'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {type: 'string'},
              content: {type: 'string'},
            },
            required: ['id', 'content'],
          },
        },
      },
      required: ['results'],
    },
  },
] satisfies Tool[]

const createToolText = (results: DocChunk[]): string => {
  if (results.length === 0) {
    return 'No matching documentation chunks were found.'
  }

  return results.map((result) => `## ${result.id}\n${result.content}`).join('\n\n')
}

const runDocsSearch = async (query: string, limit: number): Promise<{results: DocChunk[]}> => {
  const docs = await loadDocs()

  if (docs.length === 0) {
    return {results: []}
  }

  return {
    results: searchDocs(chunkDocs(docs), query, limit),
  }
}

const getQuery = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null
  }

  const query = value.trim()

  return query.length > 0 ? query : null
}

const registerTools = (server: Server): void => {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOL_DEFINITIONS,
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const {name, arguments: input} = request.params

    switch (name) {
      case 'get_migration_help': {
        const query = getQuery(input?.query)

        if (query === null) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: 'The "query" argument is required and must be a non-empty string.',
              },
            ],
          }
        }

        const response = await runDocsSearch(query, 3)

        return {
          content: [
            {
              type: 'text',
              text: createToolText(response.results),
            },
          ],
          structuredContent: response,
        }
      }
      case 'search_docs': {
        const query = getQuery(input?.query)

        if (query === null) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: 'The "query" argument is required and must be a non-empty string.',
              },
            ],
          }
        }

        const response = await runDocsSearch(query, 5)

        return {
          content: [
            {
              type: 'text',
              text: createToolText(response.results),
            },
          ],
          structuredContent: response,
        }
      }
      default:
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
        }
    }
  })
}

export const createServer = (): Server => {
  const server = new Server(SERVER_INFO, {
    capabilities: {
      tools: {},
    },
  })

  registerTools(server)

  return server
}

const startServer = async (): Promise<void> => {
  const server = createServer()
  const transport = new StdioServerTransport()

  await server.connect(transport)
}

void startServer().catch((error: unknown) => {
  console.error('Failed to start BootstrapVueNext MCP server.', error)
  process.exit(1)
})
