// Pipeline API wire regressions: preserve server duplicate-coverage evidence and explanatory 409 messages.
import assert from 'node:assert/strict'

;(globalThis as any).window = { __ENGINE_LIVE__: true }
const { api } = await import('./api')
const originalFetch = globalThis.fetch

let passed = 0
const check = async (name: string, fn: () => Promise<void>) => {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}

await check('a rejected connector build preserves the server explanation, not just HTTP 409', async () => {
  globalThis.fetch = (async () => new Response(JSON.stringify({
    ok: false, status: 'connector_exists',
    message: 'Connector fixture already covers this need; repair it instead.',
  }), { status: 409, headers: { 'content-type': 'application/json' } })) as typeof fetch
  await assert.rejects(() => api.buildConnector('PIPE-fixture'),
    (error: any) => error?.message === 'Connector fixture already covers this need; repair it instead.')
})

await check('discovery forwards connector_exists through the SSE API boundary', async () => {
  const body = [
    'event: discover-found',
    'data: {"pipeline_id":"PIPE-fixture","source_url":"https://fixture.test/data","why":"fixture","verdict":{"matched_need_ids":[]},"building":false,"connector_exists":"existing-fixture"}',
    '',
    'event: discover-done',
    'data: {"found":1,"autoBuilt":0}',
    '',
  ].join('\n')
  globalThis.fetch = (async () => new Response(body, {
    status: 200, headers: { 'content-type': 'text/event-stream' },
  })) as typeof fetch
  const found: any[] = []
  await api.pipelineDiscoverStream('ZZZ', 'fixture', {}, {
    signal: new AbortController().signal,
    onFound: (feed) => found.push(feed), onDone: () => {}, onError: (message) => assert.fail(message),
  })
  assert.equal(found[0]?.connector_exists, 'existing-fixture')
})

globalThis.fetch = originalFetch
console.log(`\npipelineApi.test.ts: ${passed} passed${process.exitCode ? ' (with failures)' : ''}`)
