import process from 'node:process'

import {Server} from '@modelcontextprotocol/sdk/server/index.js'
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js'
import {ListToolsRequestSchema} from '@modelcontextprotocol/sdk/types.js'

const SERVER_INFO = {
  name: '@bootstrap-vue-next/mcp',
  version: '0.45.3',
} as const

const registerTools = (_server: Server): void => {}

export const createServer = (): Server => {
  const server = new Server(SERVER_INFO, {
    capabilities: {
      tools: {},
    },
  })

  registerTools(server)

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [],
  }))

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
