import assert from 'node:assert/strict'

;(globalThis as any).window = { __ENGINE_LIVE__: true }
const { api } = await import('./api')
const originalFetch = globalThis.fetch

try {
  let requested = ''
  globalThis.fetch = (async (input) => {
    requested = String(input)
    return new Response(JSON.stringify({ path: 'analyses/ACME_2026-08-01/final_thesis.md', markdown: '# published' }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })
  }) as typeof fetch

  const path = 'analyses/ACME_2026-08-01/final_thesis.md'
  assert.equal((await api.callArtifact(path)).markdown, '# published')
  const url = new URL(requested, 'https://fixture.test')
  assert.equal(url.pathname, '/api/calls/artifact')
  assert.equal(url.searchParams.get('path'), path)

  globalThis.fetch = (async (input) => {
    requested = String(input)
    return new Response(JSON.stringify({ schema_version: 'ibkr-paper-portfolio/v1' }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })
  }) as typeof fetch
  await api.paperPortfolio()
  assert.equal(new URL(requested, 'https://fixture.test').pathname, '/api/calls/paper-portfolio')
} finally {
  globalThis.fetch = originalFetch
}
console.log('ok  Calls artifacts and IBKR Paper use separate published/live endpoints')
