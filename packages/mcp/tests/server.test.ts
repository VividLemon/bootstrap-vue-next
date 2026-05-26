import assert from 'node:assert/strict'
import {describe, it} from 'node:test'

import {createServer} from '../src/index.js'

const createResponse = (body: string, status: number = 200): Response => new Response(body, {status})

const createFetch = (responses: Record<string, Response | Error>) => async (input: string | URL | Request) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  const response = responses[url]

  if (response instanceof Error) {
    throw response
  }

  return response ?? createResponse('Not Found', 404)
}

const createDocsFetch = () =>
  createFetch({
    'https://bootstrap-vue-next.github.io/bootstrap-vue-next/llms.txt': createResponse(
      [
        '- [Migration Knowledge Base](/bootstrap-vue-next/docs/migration-data.md)',
        '- [BModal](/bootstrap-vue-next/docs/migration-data/components/bmodal.md)',
        '- [BAlert](/bootstrap-vue-next/docs/migration-data/components/balert.md)',
        '- [HTML Prop to Slot Migration](/bootstrap-vue-next/docs/migration-data/patterns/v-html-props.md)',
      ].join('\n')
    ),
    'https://bootstrap-vue-next.github.io/bootstrap-vue-next/llms-full.txt': createResponse(
      '# BootstrapVueNext docs corpus'
    ),
    'https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/migration-data.md': createResponse(`---
title: Migration Knowledge Base
---

# Migration Knowledge Base

## Summary

Canonical migration overview.

Review the component and pattern migration entries together.`),
    'https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/migration-data/components/balert.md':
      createResponse(`---
id: balert
title: BAlert Migration
description: Alert migration
category: components
match:
  - BAlert
  - alert
safeRewrite: true
manualReviewRequired: false
related:
  - migration-overview
---

# BAlert Migration

## Summary

Safe alert rewrite.`),
    'https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/migration-data/components/bmodal.md':
      createResponse(`---
id: bmodal
title: BModal Migration
description: Modal migration
category: components
match:
  - BModal
  - modal
safeRewrite: false
manualReviewRequired: true
related:
  - migration-overview
  - v-html-props
---

# BModal Migration

## Summary

Manual modal migration.`),
    'https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/migration-data/patterns/v-html-props.md':
      createResponse(`---
id: v-html-props
title: HTML Prop to Slot Migration
description: Replace HTML props with slots
category: patterns
match:
  - html
  - v-html
safeRewrite: false
manualReviewRequired: true
related:
  - bmodal
---

# HTML Prop to Slot Migration

## Summary

Manual HTML prop migration.`),
  })

type RequestHandler = (request?: {method: string; params?: Record<string, unknown>}) => Promise<unknown>

const getRequestHandler = (server: object, method: string): RequestHandler => {
  const requestHandlers = (server as {_requestHandlers: Map<string, RequestHandler>})._requestHandlers
  const handler = requestHandlers.get(method)

  assert.ok(handler, `Expected request handler for ${method}`)
  return handler
}

const invokeRequestHandler = (server: object, method: string, params: Record<string, unknown> = {}) =>
  getRequestHandler(server, method)({
    method,
    params,
  } as {method: string; params: Record<string, unknown>})

describe('createServer', () => {
  it('lists the public tools', async () => {
    const server = createServer({fetch: createDocsFetch()})
    const response = (await invokeRequestHandler(server, 'tools/list')) as {tools: Array<{name: string}>}

    assert.deepEqual(response.tools.map((tool) => tool.name), [
      'fetch_migration_overview',
      'fetch_migration_entry',
      'search_migration_entries',
      'expand_related_migration_entries',
      'identify_migration_entries',
      'generate_upgrade_checklist',
    ])
  })

  it('lists and reads the public resources', async () => {
    const server = createServer({fetch: createDocsFetch()})
    const listResponse = (await invokeRequestHandler(server, 'resources/list')) as {
      resources: Array<{name: string; uri: string}>
    }

    assert.deepEqual(
      listResponse.resources.map((resource) => resource.name),
      ['llms.txt', 'llms-full.txt', 'migration-overview', 'v-html-props', 'balert', 'bmodal']
    )

    const overviewResponse = (await invokeRequestHandler(server, 'resources/read', {
      uri: 'bootstrap-vue-next://migration/overview',
    })) as {
      contents: Array<{mimeType: string; text: string}>
    }
    const entryResponse = (await invokeRequestHandler(server, 'resources/read', {
      uri: 'bootstrap-vue-next://migration/entry/bmodal',
    })) as {
      contents: Array<{mimeType: string; text: string}>
    }
    const unknownResponse = (await invokeRequestHandler(server, 'resources/read', {
      uri: 'bootstrap-vue-next://migration/unknown',
    })) as {
      contents: Array<{mimeType: string; text: string}>
    }

    assert.equal(overviewResponse.contents[0]?.mimeType, 'text/markdown')
    assert.match(overviewResponse.contents[0]?.text ?? '', /Migration Knowledge Base/)
    assert.match(entryResponse.contents[0]?.text ?? '', /# BModal Migration/)
    assert.match(unknownResponse.contents[0]?.text ?? '', /Unknown resource URI/)
  })

  it('returns representative tool success responses', async () => {
    const server = createServer({fetch: createDocsFetch()})
    const overviewResponse = (await invokeRequestHandler(server, 'tools/call', {
      name: 'fetch_migration_overview',
    })) as {content: Array<{text: string}>; structuredContent: {docsBaseUrl: string}}
    const entryResponse = (await invokeRequestHandler(server, 'tools/call', {
      name: 'fetch_migration_entry',
      arguments: {id: 'bmodal'},
    })) as {
      content: Array<{text: string}>
      structuredContent: {entry: {metadata: {id: string}}}
    }
    const searchResponse = (await invokeRequestHandler(server, 'tools/call', {
      name: 'search_migration_entries',
      arguments: {query: 'html', category: 'patterns', limit: 1},
    })) as {
      content: Array<{text: string}>
      structuredContent: {matches: Array<{metadata: {id: string}}>}
    }
    const relatedResponse = (await invokeRequestHandler(server, 'tools/call', {
      name: 'expand_related_migration_entries',
      arguments: {id: 'bmodal'},
    })) as {
      content: Array<{text: string}>
      structuredContent: {entries: Array<{metadata: {id: string}}>}
    }
    const identifyResponse = (await invokeRequestHandler(server, 'tools/call', {
      name: 'identify_migration_entries',
      arguments: {terms: ['BModal', 'html'], includeRelated: true},
    })) as {
      content: Array<{text: string}>
      structuredContent: {matches: Array<{entry: {metadata: {id: string}}}>}
    }
    const checklistResponse = (await invokeRequestHandler(server, 'tools/call', {
      name: 'generate_upgrade_checklist',
      arguments: {terms: ['alert']},
    })) as {
      content: Array<{text: string}>
      structuredContent: {checklist: {safeRewriteCandidates: Array<{entry: {metadata: {id: string}}}>}}
    }

    assert.match(overviewResponse.content[0]?.text ?? '', /Canonical migration overview/)
    assert.equal(
      overviewResponse.structuredContent.docsBaseUrl,
      'https://bootstrap-vue-next.github.io/bootstrap-vue-next/'
    )
    assert.equal(entryResponse.structuredContent.entry.metadata.id, 'bmodal')
    assert.equal(searchResponse.structuredContent.matches.length, 1)
    assert.equal(searchResponse.structuredContent.matches[0]?.metadata.id, 'v-html-props')
    assert.deepEqual(
      relatedResponse.structuredContent.entries.map((entry) => entry.metadata.id),
      ['v-html-props', 'bmodal']
    )
    assert.match(identifyResponse.content[0]?.text ?? '', /Identified migration entries:/)
    assert.equal(checklistResponse.structuredContent.checklist.safeRewriteCandidates[0]?.entry.metadata.id, 'balert')
  })

  it('returns representative tool validation and error responses', async () => {
    const server = createServer({fetch: createDocsFetch()})
    const missingEntryId = (await invokeRequestHandler(server, 'tools/call', {
      name: 'fetch_migration_entry',
      arguments: {},
    })) as {content: Array<{text: string}>; isError?: boolean}
    const missingQuery = (await invokeRequestHandler(server, 'tools/call', {
      name: 'search_migration_entries',
      arguments: {},
    })) as {content: Array<{text: string}>; isError?: boolean}
    const missingTerms = (await invokeRequestHandler(server, 'tools/call', {
      name: 'identify_migration_entries',
      arguments: {terms: []},
    })) as {content: Array<{text: string}>; isError?: boolean}
    const missingChecklistTerms = (await invokeRequestHandler(server, 'tools/call', {
      name: 'generate_upgrade_checklist',
      arguments: {terms: []},
    })) as {content: Array<{text: string}>; isError?: boolean}
    const unknownTool = (await invokeRequestHandler(server, 'tools/call', {
      name: 'unknown_tool',
    })) as {content: Array<{text: string}>; isError?: boolean}
    const missingOverviewServer = createServer({
      fetch: createFetch({
        'https://bootstrap-vue-next.github.io/bootstrap-vue-next/llms.txt': createResponse('Not Found', 404),
        'https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/migration-data.md': createResponse(
          'Not Found',
          404
        ),
      }),
    })
    const missingOverview = (await invokeRequestHandler(missingOverviewServer, 'tools/call', {
      name: 'fetch_migration_overview',
    })) as {content: Array<{text: string}>; isError?: boolean}

    assert.equal(missingEntryId.isError, true)
    assert.match(missingEntryId.content[0]?.text ?? '', /"id" argument is required/)
    assert.equal(missingQuery.isError, true)
    assert.match(missingQuery.content[0]?.text ?? '', /"query" argument is required/)
    assert.equal(missingTerms.isError, true)
    assert.match(missingTerms.content[0]?.text ?? '', /non-empty string array/)
    assert.equal(missingChecklistTerms.isError, true)
    assert.match(missingChecklistTerms.content[0]?.text ?? '', /non-empty string array/)
    assert.equal(unknownTool.isError, true)
    assert.match(unknownTool.content[0]?.text ?? '', /Unknown tool/)
    assert.equal(missingOverview.isError, true)
    assert.match(missingOverview.content[0]?.text ?? '', /Unable to load the migration overview/)
  })
})
