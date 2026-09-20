import assert from 'node:assert/strict'

;(globalThis as any).window = { __ENGINE_LIVE__: true }
const { api } = await import('./api')
const originalFetch = globalThis.fetch
try {
  for (const [body, contentType, message] of [
    [JSON.stringify({ code: 'EBUSY', message: 'A saved-data update is in progress. Please retry shortly.' }), 'application/json', 'A saved-data update is in progress. Please retry shortly.'],
    [JSON.stringify({ error: 'Saved archive history could not be read.' }), 'application/json', 'Saved archive history could not be read.'],
    ['<html>upstream unavailable</html>', 'text/html', 'Request failed (503). Please retry.'],
    [JSON.stringify({ message: { internal: 'invalid error' } }), 'application/json', 'Request failed (503). Please retry.'],
  ]) {
    globalThis.fetch = async () => new Response(body, { status: 503, headers: { 'content-type': contentType } })
    await assert.rejects(api.ideasWorkspace('events', 'HK,IN'), (error: any) => {
      assert.equal(error.status, 503)
      assert.equal(error.message, message)
      return true
    })
  }
  console.log('Ideas API: temporary update explanations survive GET failures; non-JSON errors stay readable')
} finally { globalThis.fetch = originalFetch }
