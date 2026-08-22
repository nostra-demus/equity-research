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
assert.match(bar, />Tools<\/button>/)

const globalCss = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../styles/global.css'), 'utf8')
assert.match(globalCss, /@media \(max-width: 1700px\)[\s\S]*\.brand__name, \.swarmswitch__label \{ display: none; \}/,
  'the top bar yields brand and switcher text before a new action can create a clipping band')

const priorWindow = (globalThis as any).window
const priorFetch = globalThis.fetch
;(globalThis as any).window = { __ENGINE_LIVE__: true }
globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => new Promise((_resolve, reject) => {
  const signal = init?.signal
  if (signal?.aborted) return reject(signal.reason)
  signal?.addEventListener('abort', () => reject(signal.reason), { once: true })
})) as typeof fetch
const controller = new AbortController()
const pending = api.reelTranscript('https://www.instagram.com/reel/Test/', controller.signal)
controller.abort()
await assert.rejects(pending, (cause: unknown) => cause instanceof DOMException && cause.name === 'AbortError')
globalThis.fetch = priorFetch
;(globalThis as any).window = priorWindow

console.log('tools workspace: overlay exclusivity, top-bar entry, responsive width, and request cancellation passed')
