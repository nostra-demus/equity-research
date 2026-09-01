interface ReplayResult {
  events: number
  p95EventToPaintMs: number
  maxEventToPaintMs: number
  totalMs: number
  activityRows: number
}

declare global {
  interface Window { runSyntheticPerformanceReplay: () => Promise<ReplayResult> }
}

const NODE_COUNT = 240
const EVENT_COUNT = 360
const EVENTS_PER_FRAME = 24
const ACTIVITY_CAP = 80
const root = document.querySelector<HTMLElement>('[data-testid="performance-replay"]')!
const nodes = document.querySelector<HTMLElement>('#nodes')!
const activity = document.querySelector<HTMLElement>('#activity')!
const cards: HTMLElement[] = []

for (let index = 0; index < NODE_COUNT; index++) {
  const card = document.createElement('div')
  card.className = 'node'
  card.dataset.status = 'queued'
  card.textContent = `module-${index} · queued`
  nodes.appendChild(card)
  cards.push(card)
}
root.dataset.ready = 'yes'

function percentile(sorted: number[], pct: number): number {
  return sorted[Math.max(0, Math.ceil(sorted.length * pct / 100) - 1)] ?? 0
}

const nextPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

window.runSyntheticPerformanceReplay = async () => {
  const startedAt = performance.now()
  const paintTimings: number[] = []
  for (let offset = 0; offset < EVENT_COUNT; offset += EVENTS_PER_FRAME) {
    const batchStarts: number[] = []
    const limit = Math.min(EVENT_COUNT, offset + EVENTS_PER_FRAME)
    for (let index = offset; index < limit; index++) {
      batchStarts.push(performance.now())
      const nodeIndex = (index * 37) % NODE_COUNT
      const status = index % 5 === 0 ? 'done' : 'running'
      const card = cards[nodeIndex]
      card.dataset.status = status
      card.textContent = `module-${nodeIndex} · ${status} · event-${index}`
      const row = document.createElement('div')
      row.className = 'event'
      row.textContent = `event-${index} · module-${nodeIndex} · ${status}`
      activity.prepend(row)
      while (activity.childElementCount > ACTIVITY_CAP) activity.lastElementChild?.remove()
    }
    await nextPaint()
    const paintedAt = performance.now()
    for (const eventStartedAt of batchStarts) paintTimings.push(paintedAt - eventStartedAt)
  }
  paintTimings.sort((a, b) => a - b)
  return {
    events: EVENT_COUNT,
    p95EventToPaintMs: percentile(paintTimings, 95),
    maxEventToPaintMs: paintTimings[paintTimings.length - 1] ?? 0,
    totalMs: performance.now() - startedAt,
    activityRows: activity.childElementCount,
  }
}

export {}
