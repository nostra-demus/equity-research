import assert from 'node:assert/strict'

;(globalThis as any).window = { __ENGINE_LIVE__: true }
const { api } = await import('./api')
const originalFetch = globalThis.fetch

const response = (text: string) => new Response(new ReadableStream<Uint8Array>({
  start(controller) {
    controller.enqueue(new TextEncoder().encode(text))
    controller.close()
  },
}), { status: 200, headers: { 'content-type': 'text/event-stream' } })

let passed = 0
const check = async (name: string, fn: () => Promise<void>) => { await fn(); passed++; console.log(`  ok  ${name}`) }

await check('reports a clean EOF when no done frame commits the answer', async () => {
  let accept = ''
  globalThis.fetch = (async (_input, init) => {
    accept = new Headers(init?.headers).get('accept') || ''
    return response('event: news-chat-token\ndata: {"content":"partial"}\n\n')
  }) as typeof fetch
  const errors: string[] = []
  await api.newsChatStream(
    { window: '24h', messages: [{ role: 'user', content: 'Question' }] },
    {
      signal: new AbortController().signal,
      onMeta: () => {}, onToken: () => {}, onDone: () => assert.fail('EOF must not complete the turn'),
      onError: (message) => errors.push(message),
    },
  )
  assert.deepEqual(errors, ['News chat ended before the answer completed. Please retry.'])
  assert.equal(accept, 'text/event-stream', 'news Ask must bypass the edge request deadline as an explicit SSE stream')
})

await check('keeps an aborted EOF silent', async () => {
  globalThis.fetch = (async () => response('')) as typeof fetch
  const controller = new AbortController()
  controller.abort()
  const errors: string[] = []
  await api.newsChatStream(
    { window: '24h', messages: [{ role: 'user', content: 'Question' }] },
    { signal: controller.signal, onMeta: () => {}, onToken: () => {}, onDone: () => {}, onError: (message) => errors.push(message) },
  )
  assert.deepEqual(errors, [])
})

globalThis.fetch = originalFetch
console.log(`\n${passed} checks passed`)
