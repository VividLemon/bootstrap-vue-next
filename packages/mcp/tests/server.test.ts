import assert from 'node:assert/strict'
import {describe, it} from 'node:test'

import {Client} from '@modelcontextprotocol/sdk/client'
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory'

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

const createConnectedClient = async (fetch: typeof globalThis.fetch = createDocsFetch()) => {
  const server = createServer({fetch})
  const client = new Client({
    name: 'mcp-server-test-client',
    version: '1.0.0',
  })
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])

  return {client, server}
}

describe('createServer', () => {
  it('lists the public tools', async () => {
    const {client} = await createConnectedClient()
    const response = await client.listTools()

    assert.deepEqual(response.tools.map((tool) => tool.name), [
      'fetch_migration_overview',
      'fetch_migration_entry',
      'search_migration_entries',
      'expand_related_migration_entries',
      'identify_migration_entries',
      'generate_upgrade_checklist',
    ])

    await client.close()
  })

  it('lists and reads the public resources', async () => {
    const {client} = await createConnectedClient()
    const listResponse = await client.listResources()

    assert.deepEqual(
      listResponse.resources.map((resource) => resource.name),
      ['llms.txt', 'llms-full.txt', 'migration-overview', 'v-html-props', 'balert', 'bmodal']
    )

    const overviewResponse = await client.readResource({
      uri: 'bootstrap-vue-next://migration/overview',
    })
    const entryResponse = await client.readResource({
      uri: 'bootstrap-vue-next://migration/entry/bmodal',
    })
    const unknownResponse = await client.readResource({
      uri: 'bootstrap-vue-next://migration/unknown',
    })

    assert.equal(overviewResponse.contents[0]?.mimeType, 'text/markdown')
    assert.match(overviewResponse.contents[0]?.text ?? '', /Migration Knowledge Base/)
    assert.match(entryResponse.contents[0]?.text ?? '', /# BModal Migration/)
    assert.match(unknownResponse.contents[0]?.text ?? '', /Unknown resource URI/)

    await client.close()
  })

  it('returns representative tool success responses', async () => {
    const {client} = await createConnectedClient()
    const overviewResponse = await client.callTool({
      name: 'fetch_migration_overview',
    })
    const entryResponse = await client.callTool({
      name: 'fetch_migration_entry',
      arguments: {id: 'bmodal'},
    })
    const searchResponse = await client.callTool({
      name: 'search_migration_entries',
      arguments: {query: 'html', category: 'patterns', limit: 1},
    })
    const relatedResponse = await client.callTool({
      name: 'expand_related_migration_entries',
      arguments: {id: 'bmodal'},
    })
    const identifyResponse = await client.callTool({
      name: 'identify_migration_entries',
      arguments: {terms: ['BModal', 'html'], includeRelated: true},
    })
    const checklistResponse = await client.callTool({
      name: 'generate_upgrade_checklist',
      arguments: {terms: ['alert']},
    })
    const entryStructuredContent = entryResponse.structuredContent as {entry: {metadata: {id: string}}}
    const searchStructuredContent = searchResponse.structuredContent as {
      matches: Array<{metadata: {id: string}}>
    }
    const relatedStructuredContent = relatedResponse.structuredContent as {
      entries: Array<{metadata: {id: string}}>
    }
    const checklistStructuredContent = checklistResponse.structuredContent as {
      checklist: {safeRewriteCandidates: Array<{entry: {metadata: {id: string}}}>}
    }

    assert.match(overviewResponse.content[0]?.text ?? '', /Canonical migration overview/)
    assert.equal(
      (overviewResponse.structuredContent as {docsBaseUrl: string}).docsBaseUrl,
      'https://bootstrap-vue-next.github.io/bootstrap-vue-next/'
    )
    assert.equal(entryStructuredContent.entry.metadata.id, 'bmodal')
    assert.equal(searchStructuredContent.matches.length, 1)
    assert.equal(searchStructuredContent.matches[0]?.metadata.id, 'v-html-props')
    assert.deepEqual(relatedStructuredContent.entries.map((entry) => entry.metadata.id), ['v-html-props', 'bmodal'])
    assert.match(identifyResponse.content[0]?.text ?? '', /Identified migration entries:/)
    assert.equal(checklistStructuredContent.checklist.safeRewriteCandidates[0]?.entry.metadata.id, 'balert')

    await client.close()
  })

  it('returns representative tool validation and error responses', async () => {
    const {client} = await createConnectedClient()
    const missingEntryId = await client.callTool({
      name: 'fetch_migration_entry',
      arguments: {},
    })
    const missingQuery = await client.callTool({
      name: 'search_migration_entries',
      arguments: {},
    })
    const missingTerms = await client.callTool({
      name: 'identify_migration_entries',
      arguments: {terms: []},
    })
    const missingChecklistTerms = await client.callTool({
      name: 'generate_upgrade_checklist',
      arguments: {terms: []},
    })
    const unknownTool = await client.callTool({
      name: 'unknown_tool',
    })
    const {client: missingOverviewClient} = await createConnectedClient(
      createFetch({
        'https://bootstrap-vue-next.github.io/bootstrap-vue-next/llms.txt': createResponse('Not Found', 404),
        'https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/migration-data.md': createResponse(
          'Not Found',
          404
        ),
      })
    )
    const missingOverview = await missingOverviewClient.callTool({
      name: 'fetch_migration_overview',
    })

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

    await Promise.all([client.close(), missingOverviewClient.close()])
  })
})
