# @bootstrap-vue-next/mcp

Minimal Model Context Protocol server package for BootstrapVueNext migration tooling.

## Development

```bash
pnpm --filter @bootstrap-vue-next/mcp run dev
```

## Build

```bash
pnpm --filter @bootstrap-vue-next/mcp run build
pnpm --filter @bootstrap-vue-next/mcp run typecheck
```

## Run

```bash
pnpm --filter @bootstrap-vue-next/mcp run build
pnpm --filter @bootstrap-vue-next/mcp run start
```

## Notes

- `src/index.ts` initializes the MCP server and stdio transport.
- Hosted docs are fetched lazily from `llms-full.txt` with in-memory caching and a fallback to `llms.txt`.
- Available tools include `get_migration_help` and `search_docs`.
- No migration logic or codemods are included in this package.
