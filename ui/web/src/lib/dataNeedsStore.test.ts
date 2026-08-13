import assert from 'node:assert/strict'
import type { DataNeedsRead } from './types'

const previousWindow = (globalThis as any).window
const previousDocument = (globalThis as any).document
const previousSetTimeout = globalThis.setTimeout

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

const { api } = await import('./api')
const { DATA_NEEDS_RETRY_MS, useStore } = await import('./store')
const originalDataNeeds = api.dataNeeds

type RetryJob = { run: () => void }
const retryJobs: RetryJob[] = []
;(globalThis as any).setTimeout = ((callback: (...args: any[]) => void, delay?: number, ...args: any[]) => {
  if (delay === DATA_NEEDS_RETRY_MS) {
    const job = { run: () => callback(...args) }
    retryJobs.push(job)
    return job
  }
  return previousSetTimeout(callback, delay, ...args)
}) as typeof setTimeout

const fingerprint = (char: string) => `sha256:${char.repeat(64)}`
const read = (subject: string, runRoot: string, char: string): DataNeedsRead => ({
  contract_version: 'data-needs-read/2', subject, swarm: 'research', run_root: runRoot,
  decision_fingerprint: fingerprint(char), decided_at: '2026-08-13T10:00:00Z', needs: [], widened: [],
})

try {
  const runA = 'analyses/AAA_2026-08-13'
  const oldA = read('AAA', runA, 'a')
  const freshA = read('AAA', runA, 'b')
  useStore.setState({
    staticMode: false, activeSwarm: 'research', selectedTicker: 'AAA', selectToken: 101,
    runRoot: runA, dataNeeds: oldA,
  })
  let calls = 0
  api.dataNeeds = async () => {
    calls++
    if (calls === 1) throw new Error('cold host timeout')
    return freshA
  }
  const recovered = useStore.getState().refreshDataNeeds(runA)
  await Promise.resolve()
  assert.equal(retryJobs.length, 1, 'one delayed retry is scheduled after a transient failure')
  retryJobs.shift()!.run()
  await recovered
  assert.equal(calls, 2)
  assert.equal(useStore.getState().dataNeeds, freshA, 'the same exact call receives the recovered projection')

  calls = 0
  let resolveRetry!: (value: DataNeedsRead | null) => void
  api.dataNeeds = () => {
    calls++
    if (calls === 1) return Promise.reject(new Error('cold host timeout'))
    return new Promise((resolve) => { resolveRetry = resolve })
  }
  useStore.setState({
    activeSwarm: 'research', selectedTicker: 'AAA', selectToken: 102, runRoot: runA, dataNeeds: freshA,
  })
  const staleRequest = useStore.getState().refreshDataNeeds(runA)
  await Promise.resolve()
  assert.equal(retryJobs.length, 1)
  retryJobs.shift()!.run()
  await Promise.resolve()
  assert.equal(calls, 2)
  const runB = 'analyses/BBB_2026-08-13'
  const currentB = read('BBB', runB, 'c')
  useStore.setState({ selectedTicker: 'BBB', selectToken: 103, runRoot: runB, dataNeeds: currentB })
  resolveRetry(freshA)
  await staleRequest
  assert.equal(useStore.getState().dataNeeds, currentB, 'a late retry cannot cross the selected-call boundary')

  console.log('data-needs store: cold retry and exact-selection race guard passed')
} finally {
  api.dataNeeds = originalDataNeeds
  ;(globalThis as any).setTimeout = previousSetTimeout
  ;(globalThis as any).window = previousWindow
  ;(globalThis as any).document = previousDocument
}
