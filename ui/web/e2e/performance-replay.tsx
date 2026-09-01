import React from 'react'
import { createRoot } from 'react-dom/client'
import { RunNowSection } from '../src/components/RunStreamPanel'
import { useStore } from '../src/lib/store'
import type { AgentNode, SseEvent } from '../src/lib/types'
import '../src/styles/global.css'

interface ReplayResult {
  events: number
  p95EventToPaintMs: number
  maxEventToPaintMs: number
  totalMs: number
  projectedRows: number
  renderedRows: number
}

declare global {
  interface Window { runSyntheticPerformanceReplay: () => Promise<ReplayResult> }
}

const NODE_COUNT = 240
const EVENT_COUNT = 360
// Thirty independently painted batches make p95 the second-slowest frame, so one unrelated runner
// scheduling pause cannot fail the gate while two slow frames still do. With 24/event batches, one pause
// represented 6.7% of every sample and therefore became the p95 by construction.
const EVENTS_PER_FRAME = 12
const RUN_ID = 'synthetic-performance-run'
const SUBJECT = 'PERF-SYNTHETIC'
const rootElement = document.querySelector<HTMLElement>('[data-testid="performance-replay"]')!

const agents: AgentNode[] = Array.from({ length: NODE_COUNT }, (_, index) => ({
  key: `performance-orb-${index}`,
  module: `module-${Math.floor(index / 12)}`,
  nn: String(index + 1),
  name: `Synthetic orb ${index + 1}`,
  slug: `synthetic-orb-${index + 1}`,
  layer: index % 4,
  failFast: false,
  description: 'Synthetic performance fixture; no provider work exists.',
  tools: [],
  requiredUpstream: [],
  soloRunnable: true,
  isSynthesis: index % 12 === 11,
}))

useStore.setState({
  selectedTicker: SUBJECT,
  activeSwarm: 'research',
  nodesByKey: new Map(agents.map((agent) => [agent.key, agent])),
  nodeRuntime: {},
  runStream: [],
  now: Date.now(),
  activeRuns: {
    [RUN_ID]: {
      runId: RUN_ID,
      ticker: SUBJECT,
      swarmId: 'research',
      kind: 'module',
      module: 'performance-fixture',
      status: 'running',
      plannedCount: NODE_COUNT,
      startedAt: Date.now(),
      willCommitToMain: false,
    },
  },
})

createRoot(rootElement).render(
  <React.StrictMode>
    <div className="performance-replay-shell">
      <RunNowSection />
    </div>
  </React.StrictMode>,
)

function percentile(sorted: number[], pct: number): number {
  return sorted[Math.max(0, Math.ceil(sorted.length * pct / 100) - 1)] ?? 0
}

// The second frame begins only after the first frame's layout and paint opportunity. This matches the
// production recordNextPaint boundary and prevents the benchmark from measuring just React scheduling.
const afterPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

function syntheticEvent(index: number): SseEvent {
  const agent = agents[index < NODE_COUNT ? index : index - NODE_COUNT]
  const common = {
    runId: RUN_ID,
    agentKey: agent.key,
    name: agent.name,
    module: agent.module,
    layer: agent.layer,
    ts: Date.now() + index,
  }
  return index < NODE_COUNT
    ? { type: 'agent-started', ...common }
    : {
        type: 'agent-done', ...common,
        outputPath: 'synthetic/performance-output.md',
        verdict: 'Synthetic completion',
        bytes: 1,
        terminalValidated: true,
      }
}

window.runSyntheticPerformanceReplay = async () => {
  await afterPaint()
  const startedAt = performance.now()
  const paintTimings: number[] = []
  for (let offset = 0; offset < EVENT_COUNT; offset += EVENTS_PER_FRAME) {
    const batchStarts: number[] = []
    const limit = Math.min(EVENT_COUNT, offset + EVENTS_PER_FRAME)
    for (let index = offset; index < limit; index++) {
      batchStarts.push(performance.now())
      // This is the exact production SSE projection. It mutates nodeRuntime + newest-first runStream;
      // RunNowSection is the exact production Activity renderer subscribed to those same store slices.
      useStore.getState()._handleEvent(syntheticEvent(index))
    }
    await afterPaint()
    const paintedAt = performance.now()
    for (const eventStartedAt of batchStarts) paintTimings.push(paintedAt - eventStartedAt)
  }
  paintTimings.sort((a, b) => a - b)
  return {
    events: EVENT_COUNT,
    p95EventToPaintMs: percentile(paintTimings, 95),
    maxEventToPaintMs: paintTimings[paintTimings.length - 1] ?? 0,
    totalMs: performance.now() - startedAt,
    projectedRows: useStore.getState().runStream.length,
    renderedRows: rootElement.querySelectorAll('.streamrow').length,
  }
}

rootElement.dataset.ready = 'yes'

export {}
