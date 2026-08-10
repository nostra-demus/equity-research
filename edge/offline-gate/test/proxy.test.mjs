// node:test — origin retry policy. Zero deps, zero network; only the deadline case uses a short timer.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { HEALTH_GATEWAY_RETRY_DELAY_MS, classifyRequest, proxyOrigin } from '../src/proxy.mjs'

function request(path = '/api/health', init = {}) {
  return new Request(`https://app.nostra-demus.com${path}`, init)
}

function sequence(items) {
  const requests = []
  return {
    fetch: async (req) => {
      requests.push(req)
      const item = items[requests.length - 1]
      if (item instanceof Error) throw item
      return item
    },
    requests,
  }
}

function gatewayResponse(status, label, cancelled) {
  return new Response(new ReadableStream({
    cancel: () => { cancelled.push(label) },
  }), { status })
}

const noWait = async () => undefined

test('classifies SSE before the health path', () => {
  assert.equal(classifyRequest(request('/api/health')), 'health')
  assert.equal(classifyRequest(request('/api/health?source=watchdog')), 'health')
  assert.equal(classifyRequest(request('/api/health', { headers: { accept: 'text/event-stream' } })), 'sse')
  assert.equal(classifyRequest(request('/api/swarm')), 'other')
})

for (const gatewayStatus of [502, 504]) {
  test(`GET health delays one fresh retry after raw ${gatewayStatus}, then returns the real 200`, async () => {
    const cancelled = []
    const healthy = new Response('{"ok":true}', { status: 200 })
    const origin = sequence([gatewayResponse(gatewayStatus, 'first', cancelled), healthy])
    const sleeps = []

    const result = await proxyOrigin(request(), origin.fetch, {
      budgetMs: 8000,
      sleepImpl: async (ms, signal) => {
        assert.equal(signal.aborted, false)
        sleeps.push(ms)
      },
    })

    assert.equal(result.kind, 'response')
    assert.equal(result.response, healthy, 'success must be the actual second origin response')
    assert.equal(origin.requests.length, 2)
    assert.notEqual(origin.requests[0], origin.requests[1], 'retry uses a fresh Request')
    assert.deepEqual(sleeps, [HEALTH_GATEWAY_RETRY_DELAY_MS])
    assert.deepEqual(cancelled, ['first'], 'unused gateway body was cancelled before retry')
  })
}

test('502 -> 502 is bounded at one retry and becomes an honest offline result', async () => {
  const cancelled = []
  const origin = sequence([
    gatewayResponse(502, 'first', cancelled),
    gatewayResponse(502, 'second', cancelled),
  ])
  const sleeps = []

  const result = await proxyOrigin(request(), origin.fetch, {
    budgetMs: 8000,
    sleepImpl: async (ms) => { sleeps.push(ms) },
  })

  assert.deepEqual(result, { kind: 'offline' })
  assert.equal(origin.requests.length, 2)
  assert.deepEqual(sleeps, [HEALTH_GATEWAY_RETRY_DELAY_MS])
  assert.deepEqual(cancelled, ['first', 'second'])
})

test('only exact GET health receives the delayed retry; other safe requests keep the immediate retry', async () => {
  for (const req of [
    request('/api/swarm'),
    request('/', { headers: { accept: 'text/html' } }),
    request('/api/health', { method: 'HEAD' }),
  ]) {
    const cancelled = []
    const healthy = new Response('ok', { status: 200 })
    const origin = sequence([gatewayResponse(502, 'first', cancelled), healthy])
    const sleeps = []
    const controllers = []
    const result = await proxyOrigin(req, origin.fetch, {
      budgetMs: 8000,
      sleepImpl: async (ms) => { sleeps.push(ms) },
      controllerFactory: () => {
        const controller = new AbortController()
        controllers.push(controller)
        return controller
      },
    })

    assert.equal(result.kind, 'response', `${req.method} ${req.url}`)
    assert.equal(result.response, healthy, `${req.method} ${req.url}`)
    assert.equal(origin.requests.length, 2, `${req.method} ${req.url}`)
    assert.equal(controllers.length, 2, `${req.method} ${req.url} must retain a fresh per-attempt deadline`)
    assert.deepEqual(sleeps, [], `${req.method} ${req.url}`)
    assert.deepEqual(cancelled, ['first'], `${req.method} ${req.url}`)
  }
})

test('exact GET health shares one deadline signal across its delayed retry', async () => {
  const cancelled = []
  const origin = sequence([
    gatewayResponse(502, 'first', cancelled),
    new Response('ok', { status: 200 }),
  ])
  const controllers = []

  const result = await proxyOrigin(request(), origin.fetch, {
    budgetMs: 8000,
    sleepImpl: noWait,
    controllerFactory: () => {
      const controller = new AbortController()
      controllers.push(controller)
      return controller
    },
  })

  assert.equal(result.kind, 'response')
  assert.equal(origin.requests.length, 2)
  assert.equal(controllers.length, 1, 'health attempts and backoff must stay under one overall deadline')
  assert.deepEqual(cancelled, ['first'])
})

test('non-idempotent and SSE gateway responses never retry', async () => {
  for (const req of [
    request('/api/health', { method: 'POST' }),
    request('/api/health', { headers: { accept: 'text/event-stream' } }),
  ]) {
    const cancelled = []
    const origin = sequence([gatewayResponse(502, 'only', cancelled), new Response('must not run', { status: 200 })])
    const result = await proxyOrigin(req, origin.fetch, { budgetMs: 8000, sleepImpl: noWait })
    assert.deepEqual(result, { kind: 'offline' }, `${req.method} ${req.url}`)
    assert.equal(origin.requests.length, 1, `${req.method} ${req.url}`)
    assert.deepEqual(cancelled, ['only'], `${req.method} ${req.url}`)
  }
})

test('one overall deadline covers the first response, health backoff, and retry', async () => {
  const cancelled = []
  const origin = sequence([
    gatewayResponse(502, 'first', cancelled),
    new Response('must not run after deadline', { status: 200 }),
  ])
  const started = Date.now()

  // Use the real abort-aware delay. The 15ms overall budget must stop the 750ms health backoff and must
  // not start a second attempt, proving the timer is shared rather than reset for each fetch.
  const result = await proxyOrigin(request(), origin.fetch, { budgetMs: 15 })

  assert.deepEqual(result, { kind: 'offline' })
  assert.equal(origin.requests.length, 1)
  assert.deepEqual(cancelled, ['first'])
  assert.ok(Date.now() - started < 250, 'shared deadline should interrupt the 750ms retry delay')
})

test('a deliberate origin 503 passes through unchanged without retry or synthetic success', async () => {
  const deliberate = new Response('maintenance', { status: 503 })
  const origin = sequence([deliberate])
  const result = await proxyOrigin(request(), origin.fetch, { budgetMs: 8000, sleepImpl: noWait })

  assert.equal(result.kind, 'response')
  assert.equal(result.response, deliberate)
  assert.equal(origin.requests.length, 1)
})

test('firm Cloudflare origin-down status goes offline immediately', async () => {
  const cancelled = []
  const origin = sequence([gatewayResponse(521, 'only', cancelled)])
  const result = await proxyOrigin(request(), origin.fetch, { budgetMs: 8000, sleepImpl: noWait })

  assert.deepEqual(result, { kind: 'offline' })
  assert.equal(origin.requests.length, 1)
  assert.deepEqual(cancelled, ['only'])
})

test('fast idempotent throw still retries once, while POST and SSE throws never retry', async () => {
  const recovered = new Response('ok', { status: 200 })
  const safeOrigin = sequence([new Error('connection reset'), recovered])
  const safe = await proxyOrigin(request('/api/swarm'), safeOrigin.fetch, { budgetMs: 8000, sleepImpl: noWait })
  assert.equal(safe.kind, 'response')
  assert.equal(safe.response, recovered)
  assert.equal(safeOrigin.requests.length, 2)

  for (const req of [
    request('/api/launch', { method: 'POST', body: '{}' }),
    request('/api/events', { headers: { accept: 'text/event-stream' } }),
  ]) {
    const origin = sequence([new Error('connection reset'), new Response('must not run', { status: 200 })])
    const result = await proxyOrigin(req, origin.fetch, { budgetMs: 8000, sleepImpl: noWait })
    assert.deepEqual(result, { kind: 'offline' })
    assert.equal(origin.requests.length, 1)
  }
})
