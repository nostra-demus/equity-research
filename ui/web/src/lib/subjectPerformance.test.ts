import assert from 'node:assert/strict'

const previousWindow = (globalThis as any).window
const previousDocument = (globalThis as any).document
const previousEventSource = (globalThis as any).EventSource
const previousFetch = globalThis.fetch

;(globalThis as any).window = {
  __ENGINE_LIVE__: true,
  WebGLRenderingContext: undefined,
  addEventListener: () => {},
  matchMedia: () => ({ matches: true }),
}
;(globalThis as any).document = {
  hidden: false,
  addEventListener: () => {},
  createElement: () => ({ getContext: () => null }),
}
;(globalThis as any).EventSource = class {
  close() {}
  addEventListener() {}
}

const { api } = await import('./api')
const { useStore } = await import('./store')
const { flushBrowserPerformance, setPerformanceCollectionMode } = await import('./performance')
const originalSwarm = api.swarm

try {
  const uploads: any[] = []
  globalThis.fetch = async (input, init) => {
    if (String(input).includes('/api/performance/samples')) uploads.push(JSON.parse(String(init?.body)))
    return new Response('{}', { status: 202, headers: { 'content-type': 'application/json' } })
  }
  setPerformanceCollectionMode('static')
  setPerformanceCollectionMode('live')
  api.swarm = async () => { throw new Error('graph unavailable') }
  useStore.setState({ activeSwarm: 'research', constellationSwarm: 'research', selectedTicker: null, selectToken: 0 })

  await assert.rejects(useStore.getState().selectTicker('TEST'), /graph unavailable/)
  await flushBrowserPerformance()

  const sample = uploads.flatMap((upload) => upload.samples).find((row) => row.name === 'browser.subject_ready')
  assert.equal(sample?.operation, '/subject/select')
  assert.equal(sample?.outcome, 'error', 'a failed company selection remains visible in speed diagnostics')
} finally {
  setPerformanceCollectionMode('static')
  api.swarm = originalSwarm
  globalThis.fetch = previousFetch
  ;(globalThis as any).window = previousWindow
  ;(globalThis as any).document = previousDocument
  ;(globalThis as any).EventSource = previousEventSource
}

console.log('subject performance: failed selections emit an error timing without launching work')
