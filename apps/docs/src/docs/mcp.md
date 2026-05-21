---
description: >
  Learn what the BootstrapVueNext MCP server can do today, how to install it, and how to connect it to clients such as Cursor or Claude Desktop.
---

# Mcp

`@bootstrap-vue-next/mcp` is a small [Model Context Protocol](https://modelcontextprotocol.io/) server for retrieving BootstrapVueNext migration help from the hosted documentation artifacts.

It is intentionally narrow in scope: it fetches the hosted LLM-ready markdown, searches it deterministically, and returns the most relevant chunks to an MCP client.

## Current abilities

- Fetches hosted markdown artifacts from `https://bootstrap-vue-next.github.io/bootstrap-vue-next/`
- Prefers `llms-full.txt` and falls back to `llms.txt`
- Caches the fetched docs in memory for 10 minutes
- Searches migration docs with deterministic ranking
- Exposes the `get_migration_help` and `search_docs` MCP tools

The current server does **not** scrape HTML, generate codemods, rewrite migrations, or run embeddings/vector search.

## Download

Install the package in a project where your MCP client can access it:

```bash
pnpm add -D @bootstrap-vue-next/mcp
```

or:

```bash
npm install -D @bootstrap-vue-next/mcp
```

If you are running it from a checkout of this repository instead of an installed package, build it first:

```bash
pnpm install --ignore-scripts --frozen-lockfile
pnpm --filter @bootstrap-vue-next/mcp run build
```

## How to use it

The MCP server runs over stdio, so most clients should launch it with `node` and point to the built entry file.

### Cursor

Add an MCP server entry that points to the installed package:

```json
{
  "mcpServers": {
    "bootstrap-vue-next": {
      "command": "node",
      "args": [
        "/absolute/path/to/your/project/node_modules/@bootstrap-vue-next/mcp/dist/index.js"
      ]
    }
  }
}
```

### Claude Desktop

Use the same command pattern in your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "bootstrap-vue-next": {
      "command": "node",
      "args": [
        "/absolute/path/to/your/project/node_modules/@bootstrap-vue-next/mcp/dist/index.js"
      ]
    }
  }
}
```

### Run from this repository

If you want to run the server directly from this repository clone:

```bash
pnpm --filter @bootstrap-vue-next/mcp run build
node packages/mcp/dist/index.js
```

## Available tools

### `get_migration_help`

Use this when you want the most relevant migration chunks back.

Input:

```json
{
  "query": "modal migration"
}
```

Output:

```json
{
  "results": [
    {
      "id": "002-modals",
      "content": "## Modals\n..."
    }
  ]
}
```

### `search_docs`

Use this when you want a broader result set for exploration or debugging.

Input:

```json
{
  "query": "form select migration"
}
```

## Configuration

You can override the default hosted docs URL with `MCP_DOCS_BASE_URL`.

Example:

```json
{
  "mcpServers": {
    "bootstrap-vue-next": {
      "command": "node",
      "args": [
        "/absolute/path/to/your/project/node_modules/@bootstrap-vue-next/mcp/dist/index.js"
      ],
      "env": {
        "MCP_DOCS_BASE_URL": "https://bootstrap-vue-next.github.io/bootstrap-vue-next/"
      }
    }
  }
}
```

## Accessing the LLM documentation

BootstrapVueNext publishes hosted LLM-oriented documentation artifacts alongside the regular docs site.

- `llms-full.txt` contains the full compiled documentation in a single file
- `llms.txt` contains the top-level LLM entry document with links to the available documentation sections
- Individual documentation pages are also published as `.md` files that mirror the normal docs routes

The generated docs build follows this pattern:

```plaintext
.vitepress/dist
├── llms-full.txt
├── llms.txt
├── docs/components/alert.html
└── docs/components/alert.md
```

Examples:

```text
https://bootstrap-vue-next.github.io/bootstrap-vue-next/llms-full.txt
https://bootstrap-vue-next.github.io/bootstrap-vue-next/llms.txt
https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components/alert.md
```

That means a normal docs page such as:

```text
/docs/components/alert.html
```

also has a markdown artifact at:

```text
/docs/components/alert.md
```

The MCP server currently targets the hosted LLM artifacts instead of scraping the rendered HTML pages.

The per-page markdown route above was verified locally by running the docs server and checking `/bootstrap-vue-next/docs/components/alert.md`. The root `llms.txt` and `llms-full.txt` artifacts are generated into the docs build output and are the hosted entry points consumed by the MCP server.

## Notes

- Documentation is loaded lazily on the first tool call
- Cache is in-memory only and resets when the process restarts
- Results come from the hosted markdown artifacts, not the local docs checkout
