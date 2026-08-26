import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CommandBar } from '../components/CommandBar'
import { api } from './api'
import { useStore } from './store'

const research = { id: 'research', label: 'Research', color: '#c0851d', unit: 'ticker', order: 1, layout: 'constellation' } as const
useStore.setState({
  activeSwarm: 'research',
  constellationSwarm: 'research',
  swarms: [research],
  selectedTicker: 'AMZN',
  activeRuns: {},
  health: 'online',
  staticMode: false,
  pipelines: null,
  toolsOpen: false,
  memoryOpen: true,
  activityOpen: true,
  callsOpen: true,
  dataLibraryOpen: true,
  reviewOpen: true,
})

useStore.getState().openTools()
assert.equal(useStore.getState().toolsOpen, true)
assert.equal(useStore.getState().memoryOpen, false)
assert.equal(useStore.getState().callsOpen, false)
assert.equal(useStore.getState().dataLibraryOpen, false)
assert.equal(useStore.getState().reviewOpen, false)
assert.equal(useStore.getState().activityOpen, false, 'Tools must replace the underlying Activity overlay')

useStore.getState().openMemory()
assert.equal(useStore.getState().toolsOpen, false, 'opening Memory closes Tools')
useStore.getState().openTools()
useStore.getState().openCalls()
assert.equal(useStore.getState().toolsOpen, false, 'opening Calls closes Tools')

const bar = renderToStaticMarkup(createElement(CommandBar))
assert.equal((bar.match(/data-tools-entry="true"/g) || []).length, 1, 'the shared top bar exposes one Tools entry')
assert.match(bar, />Workspace<span/, 'secondary tools are grouped under the compact Workspace menu')

const globalCss = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../styles/global.css'), 'utf8')
assert.match(globalCss, /@media \(max-width: 1700px\)[\s\S]*\.brand__name, \.swarmswitch__label \{ display: none; \}/,
  'the top bar yields brand and switcher text before a new action can create a clipping band')

const priorWindow = (globalThis as any).window
const priorFetch = globalThis.fetch
;(globalThis as any).window = { __ENGINE_LIVE__: true }
const streamedProgress: string[] = []
globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
  assert.equal(String(url), '/api/tools/reel-transcript')
  assert.equal(new Headers(init?.headers).get('accept'), 'text/event-stream')
  assert.deepEqual(JSON.parse(String(init?.body)), { url: 'https://www.instagram.com/reel/Test/' })
  const frames = [
    'event: reel-progress\ndata: {"type":"reel-progress","step":"prepare-output","status":"complete","elapsedMs":1,"detail":{"language":42}}',
    'event: reel-progress\ndata: {"type":"reel-progress","step":"validate-link","status":"running","elapsedMs":0}',
    'event: reel-progress\ndata: {"type":"reel-progress","step":"validate-link","status":"complete","elapsedMs":2,"stepElapsedMs":2}',
    'event: reel-result\ndata: {"type":"reel-result","elapsedMs":3,"result":{"transcript":"Spoken text.","sourceUrl":"https://www.instagram.com/reel/Test/","title":"Test Reel","author":"creator","durationSeconds":12,"language":"en"}}',
  ].join('\n\n') + '\n\n'
  return new Response(frames, { status: 200, headers: { 'content-type': 'text/event-stream' } })
}) as typeof fetch
const streamed = await api.reelTranscriptLive('https://www.instagram.com/reel/Test/', (event) => streamedProgress.push(`${event.step}:${event.status}`))
assert.equal(streamed.transcript, 'Spoken text.')
assert.deepEqual(streamedProgress, ['validate-link:running', 'validate-link:complete'], 'the UI receives real server stage transitions before the result and rejects malformed detail')

globalThis.fetch = (async () => new Response(JSON.stringify({ error: 'engine-offline' }), {
  status: 503,
  headers: { 'content-type': 'application/json' },
})) as typeof fetch
await assert.rejects(
  api.reelTranscriptLive('https://www.instagram.com/reel/Test/', () => undefined),
  /live engine connection was interrupted before transcription started/i,
  'the edge fallback is explained to a person instead of exposing the raw engine-offline code',
)

globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => new Promise((_resolve, reject) => {
  const signal = init?.signal
  if (signal?.aborted) return reject(signal.reason)
  signal?.addEventListener('abort', () => reject(signal.reason), { once: true })
})) as typeof fetch
const controller = new AbortController()
const pending = api.reelTranscriptLive('https://www.instagram.com/reel/Test/', () => undefined, controller.signal)
controller.abort()
await assert.rejects(pending, (cause: unknown) => cause instanceof DOMException && cause.name === 'AbortError')
globalThis.fetch = priorFetch
;(globalThis as any).window = priorWindow

console.log('tools workspace: overlay exclusivity, top-bar entry, live progress stream, and request cancellation passed')
