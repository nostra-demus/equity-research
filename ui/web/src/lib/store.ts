import { create } from 'zustand'
import { api, isStatic } from './api'
import { downstreamCascade, type CascadeNode } from './cascade'
import type { AgentNode, DataStatus, HealthState, LaunchPreflight, NodeRuntime, NodeStatus, SseEvent, SwarmGraph, TickerSummary, Usage } from './types'

const RUN_EVENT_TYPES = ['run-started', 'agent-started', 'agent-done', 'agent-failed', 'layer-advanced', 'module-done', 'cost-tick', 'run-done', 'run-error']

// Live SSE streams for the SELECTED ticker only, keyed by runId. A ticker switch closes them all;
// background runs keep executing server-side and are rediscovered via /api/runs on return.
const runSources = new Map<string, EventSource>()
let dataSource: EventSource | null = null
let bloomTimer: any = null
let reconnectTimer: any = null
let pollTimer: any = null
let selectGen = 0 // bumped on every selectTicker; async work bails if it changed (fast-switch guard)
let creditProbed = false

// ---- engine heartbeat (the real source of truth for the online/offline indicator) ----
// `connected` (below) only flips false on the INITIAL load failure; SSE onerror keeps run streams open,
// so a mid-session engine loss (the laptop sleeps) is invisible to it. This independent /api/health poll
// detects it and drives `health`. A generation counter lets checkHealthNow()/restart cancel an in-flight
// tick's continuation, so two timers never coexist.
let healthTimer: any = null
let healthAbort: AbortController | null = null
let healthLoopRunning = false
let healthListenersBound = false
let healthGen = 0
const HEALTH_OK_MS = 20000 // healthy cadence
const HEALTH_DEGRADED_MS = 5000 // faster while down — snappy detection + recovery
const HEALTH_TIMEOUT_MS = 4000 // a sleeping laptop must register quickly
const OFFLINE_THRESHOLD = 2 // consecutive fails before declaring the engine offline (anti-flicker)
const HARD_DOWN = new Set<HealthState>(['engine-offline', 'your-network', 'session-expired'])

export interface StreamRow { runId: string; ticker: string; key: string; name: string; module: string; layer: number; status: NodeStatus; verdict?: string | null; ts: number }
export interface ActiveRun { runId: string; ticker: string; kind: string; module?: string; agent?: string; status: string; costUsd?: number; willCommitToMain?: boolean; plannedCount?: number; startedAt?: number }
export interface Toast { msg: string; tone: 'info' | 'good' | 'bad' }

// A run is "live" (counts for launch guards) only while starting/running. Finished runs linger in
// activeRuns for the panel until the next ticker switch prunes them.
const LIVE_RUN = new Set(['starting', 'running'])
const runsForTicker = (runs: Record<string, ActiveRun>, t: string | null): ActiveRun[] =>
  t ? Object.values(runs).filter((r) => r.ticker === t && LIVE_RUN.has(r.status)) : []

interface State {
  connected: boolean
  health: HealthState
  healthFailCount: number
  lastHealthOkAt: number | null
  staticMode: boolean
  dataDir: string | null
  tickers: TickerSummary[]
  emptyState: boolean
  selectedTicker: string | null
  graph: SwarmGraph | null
  nodesByKey: Map<string, AgentNode>
  dataStatus: DataStatus | null
  credit: Usage | null
  creditChecking: boolean
  nodeRuntime: Record<string, NodeRuntime>
  activeRuns: Record<string, ActiveRun> // selected-ticker live runs (+ just-finished, until next switch)
  activeRunsByTicker: Set<string>
  selectToken: number
  runStream: StreamRow[]
  coreBloom: boolean
  decision: any | null
  runRoot: string | null
  reports: { memo: boolean; thesis: boolean; dossier: boolean }
  openOutput: { path?: string; title: string; verdict?: string | null; nodeKey?: string; pending?: boolean } | null
  selectedNodeKey: string | null
  launchConfirm: { kind: 'full' | 'rerun'; preflight: LaunchPreflight; cascade?: CascadeNode[]; node?: { module: string; name: string; key: string } } | null
  toast: Toast | null

  init: () => Promise<void>
  startHealth: () => void
  stopHealth: () => void
  checkHealthNow: () => Promise<void>
  _tickHealth: () => Promise<void>
  selectTicker: (t: string) => Promise<void>
  refreshData: () => Promise<void>
  refreshActiveRuns: () => Promise<void>
  checkCredit: () => Promise<void>
  selectNode: (key: string | null) => void
  nodeStatus: (key: string) => NodeStatus
  activeRunsForTicker: (t: string | null) => ActiveRun[]
  anyRunForTicker: (t: string | null) => boolean
  targetInFlight: (t: string | null, keys: string[]) => boolean
  launchAgent: (node: AgentNode) => Promise<void>
  launchModule: (module: string) => Promise<void>
  requestFull: () => Promise<void>
  confirmFull: () => Promise<void>
  launchRerun: (node: { module: string; name: string; key: string }) => Promise<void>
  confirmRerun: () => Promise<void>
  cancelLaunch: () => void
  cancelRun: (runId: string) => Promise<void>
  selectNodeForRun: (node: AgentNode) => void
  openOutputForNode: (node: AgentNode) => Promise<void>
  openThesis: () => Promise<void>
  openReport: (tier: 'memo' | 'thesis' | 'dossier') => Promise<void>
  closeOutput: () => void
  setToast: (t: Toast | null) => void
  _handleEvent: (e: SseEvent) => void
}

function flatten(graph: SwarmGraph): Map<string, AgentNode> {
  const m = new Map<string, AgentNode>()
  for (const mod of graph.modules) for (const a of Object.values(mod.layers).flat()) m.set(a.key, a)
  return m
}

export const useStore = create<State>((set, get) => ({
  connected: true,
  health: 'connecting',
  healthFailCount: 0,
  lastHealthOkAt: null,
  staticMode: false,
  dataDir: null,
  tickers: [],
  emptyState: false,
  selectedTicker: null,
  graph: null,
  nodesByKey: new Map(),
  dataStatus: null,
  credit: null,
  creditChecking: false,
  nodeRuntime: {},
  activeRuns: {},
  activeRunsByTicker: new Set(),
  selectToken: 0,
  runStream: [],
  coreBloom: false,
  decision: null,
  runRoot: null,
  reports: { memo: false, thesis: false, dossier: false },
  openOutput: null,
  selectedNodeKey: null,
  launchConfirm: null,
  toast: null,

  init: async () => {
    try {
      const [graph, tk, credit] = await Promise.all([api.swarm(), api.tickers(), api.credit().catch(() => null)])
      const stat = isStatic()
      set({ connected: true, staticMode: stat, graph, nodesByKey: flatten(graph), tickers: tk.tickers, emptyState: tk.emptyState, dataDir: (tk as any).dataDir ?? null, credit })
      if (!stat) get().startHealth() // begin the engine heartbeat (live mode only); idempotent across reconnects
      // live data-folder watcher (Drive sync) — backend only
      if (!stat && !dataSource) {
        dataSource = new EventSource(api.dataStreamUrl())
        dataSource.addEventListener('data-changed', (ev: MessageEvent) => {
          try {
            const d = JSON.parse(ev.data)
            if (d.ticker === get().selectedTicker) get().refreshData()
            api.tickers().then((t) => set({ tickers: t.tickers, emptyState: t.emptyState, dataDir: (t as any).dataDir ?? get().dataDir })).catch(() => {})
          } catch {}
        })
      }
      if (tk.tickers.length && !get().selectedTicker) await get().selectTicker(tk.tickers[0].ticker)
      // one cheap usage probe on first connect (backend only)
      if (!stat && !creditProbed) {
        creditProbed = true
        get().checkCredit()
      }
    } catch {
      // control plane unreachable — show offline and keep retrying so the UI auto-recovers when it starts
      set({ connected: false })
      if (reconnectTimer) clearTimeout(reconnectTimer)
      reconnectTimer = setTimeout(() => get().init(), 2500)
    }
  },

  selectTicker: async (t) => {
    closeAllRunSources() // stop the previous company's live streams before anything else (no event bleed)
    const token = ++selectGen
    // keep only still-live runs across tickers (drop finished); the new ticker rebuilds from snapshots
    const activeRuns = Object.fromEntries(Object.entries(get().activeRuns).filter(([, r]) => LIVE_RUN.has(r.status)))
    set({ selectToken: token, selectedTicker: t, dataStatus: null, nodeRuntime: {}, decision: null, runRoot: null, reports: { memo: false, thesis: false, dossier: false }, coreBloom: false, selectedNodeKey: null, runStream: [], activeRuns, openOutput: null })
    const graph = await api.swarm(t)
    if (get().selectToken !== token) return // a newer selection superseded this one
    set({ graph, nodesByKey: flatten(graph) })
    await get().refreshData()
    if (get().selectToken !== token) return
    // seed prior-run results into the swarm
    try {
      const manifest = await api.runManifest(t)
      if (get().selectToken !== token) return
      const seed: Record<string, NodeRuntime> = {}
      for (const [, agents] of Object.entries<any>(manifest.modules || {})) {
        for (const a of agents) seed[a.agentKey] = { status: 'done', verdict: a.verdict, outputPath: `${manifest.runRoot}/${a.agentKey}.md` }
      }
      if (manifest.finalThesis) seed['master/synthesizer'] = { status: 'done', outputPath: `${manifest.runRoot}/final_thesis.md` }
      set({ nodeRuntime: seed, runRoot: manifest.runRoot ?? null, reports: { memo: !!manifest.memo, thesis: !!manifest.finalThesis, dossier: !!manifest.fullDossier } })
    } catch {}
    try {
      const decision = await api.decision(t)
      if (get().selectToken !== token) return
      set({ decision })
    } catch {
      if (get().selectToken === token) set({ decision: null })
    }
    // reconnect to EVERY run in flight for this company (concurrent runs are supported)
    try {
      const { active } = await api.activeRuns()
      if (get().selectToken !== token) return
      set({ activeRunsByTicker: new Set(active.map((r) => r.ticker)) })
      for (const r of active.filter((r) => r.ticker === t)) await reconnectRun(set, get, r.runId, token)
      schedulePoll(get, active.length > 0)
    } catch {}
  },

  refreshData: async () => {
    const t = get().selectedTicker
    if (!t) return
    try {
      const dataStatus = await api.dataStatus(t)
      set({ dataStatus })
    } catch {}
  },

  // which companies have a run in flight (drives the ticker-menu dots). Self-polls while any run is active.
  refreshActiveRuns: async () => {
    if (get().staticMode) return
    try {
      const { active } = await api.activeRuns()
      set({ activeRunsByTicker: new Set(active.map((r) => r.ticker)) })
      schedulePoll(get, active.length > 0)
    } catch {}
  },

  checkCredit: async () => {
    if (get().staticMode) return
    set({ creditChecking: true })
    try {
      const credit = await api.creditCheck()
      set({ credit })
    } catch {
      // keep last-known usage on a transient failure — don't wipe the windows we already have
    } finally {
      set({ creditChecking: false })
    }
  },

  selectNode: (key) => set({ selectedNodeKey: key }),

  nodeStatus: (key) => {
    const { nodeRuntime, nodesByKey, dataStatus, selectedTicker } = get()
    const rt = nodeRuntime[key]
    if (rt) return rt.status
    if (!selectedTicker || !dataStatus) return 'dormant'
    const node = nodesByKey.get(key)
    if (!node) return 'dormant'
    const mod = dataStatus.modules[node.module]
    if (mod?.status === 'Insufficient') return 'locked'
    return node.soloRunnable ? 'ready' : 'notready'
  },

  // LIVE runs for a ticker (launch-guard truth); finished runs are excluded.
  activeRunsForTicker: (t) => runsForTicker(get().activeRuns, t),
  anyRunForTicker: (t) => runsForTicker(get().activeRuns, t).length > 0,
  // is any of these orb keys already queued/running for this ticker? (disjoint-target client guard)
  targetInFlight: (t, keys) => {
    if (!runsForTicker(get().activeRuns, t).length) return false
    const rt = get().nodeRuntime
    return keys.some((k) => rt[k]?.status === 'queued' || rt[k]?.status === 'running')
  },

  launchAgent: async (node) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — runs happen on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const t = get().selectedTicker
    if (!t) return
    if (get().targetInFlight(t, [node.key])) return get().setToast({ msg: `${node.name} is already running`, tone: 'info' })
    if (!node.soloRunnable) {
      get().setToast({ msg: `${node.name} needs upstream — run the module first`, tone: 'info' })
      return
    }
    try {
      const { runId } = await api.launch({ kind: 'agent', ticker: t, module: node.module, agent: node.name })
      beginRun(set, get, runId, { kind: 'agent', module: node.module, agent: node.name, willCommitToMain: false }, [node.key])
      get().setToast({ msg: `Launched ${node.name} on ${t}`, tone: 'good' })
    } catch (e: any) {
      launchErrorToast(get, e, t, node.name)
    }
  },

  launchModule: async (module) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — runs happen on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const t = get().selectedTicker
    if (!t) return
    const planned = [...get().nodesByKey.values()].filter((n) => n.module === module).map((n) => n.key)
    if (get().targetInFlight(t, planned)) return get().setToast({ msg: `${module} is already running`, tone: 'info' })
    try {
      const { runId } = await api.launch({ kind: 'module', ticker: t, module })
      beginRun(set, get, runId, { kind: 'module', module, willCommitToMain: true }, planned)
      get().setToast({ msg: `Launched ${module} module on ${t}`, tone: 'good' })
    } catch (e: any) {
      launchErrorToast(get, e, t, `${module} module`)
    }
  },

  requestFull: async () => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — a full run executes on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const t = get().selectedTicker
    if (!t) return
    if (get().anyRunForTicker(t)) return get().setToast({ msg: `Finish the in-flight run on ${t} first — a full run needs exclusive access`, tone: 'info' })
    const preflight = await api.estimate('full', t)
    set({ launchConfirm: { kind: 'full', preflight } })
  },

  confirmFull: async () => {
    const t = get().selectedTicker
    if (!t) return
    if (HARD_DOWN.has(get().health)) { set({ launchConfirm: null }); return get().setToast({ msg: 'Engine offline — the run was not started.', tone: 'bad' }) }
    set({ launchConfirm: null })
    const planned = [...get().nodesByKey.keys()]
    try {
      const { runId } = await api.launch({ kind: 'full', ticker: t, confirmTicker: t })
      beginRun(set, get, runId, { kind: 'full', willCommitToMain: true }, planned)
      get().setToast({ msg: `Launched full run on ${t}`, tone: 'good' })
    } catch (e: any) {
      launchErrorToast(get, e, t, 'full run')
    }
  },

  // re-run one orb + everything downstream of it (its module synthesis -> dependent module syntheses -> master Memo).
  // opens the cascade confirm dialog; confirmRerun() actually launches. Live-only.
  launchRerun: async (node) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — re-runs happen on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    const t = get().selectedTicker
    if (!t) return
    const cascade = downstreamCascade(get().graph, node.module, node.name)
    if (!cascade.length) return get().setToast({ msg: `Can't resolve the downstream of ${node.name}`, tone: 'bad' })
    if (get().targetInFlight(t, cascade.map((c) => c.key))) return get().setToast({ msg: `${node.name} or its downstream is already running`, tone: 'info' })
    try {
      const preflight = await api.estimate('rerun', t, node.module, node.name)
      set({ launchConfirm: { kind: 'rerun', preflight, cascade, node } })
    } catch (e: any) {
      get().setToast({ msg: `Re-run estimate failed: ${e?.message || e}`, tone: 'bad' })
    }
  },

  confirmRerun: async () => {
    const t = get().selectedTicker
    const lc = get().launchConfirm
    if (!t || !lc?.node) return
    if (HARD_DOWN.has(get().health)) { set({ launchConfirm: null }); return get().setToast({ msg: 'Engine offline — the run was not started.', tone: 'bad' }) }
    const node = lc.node
    const planned = (lc.cascade ?? downstreamCascade(get().graph, node.module, node.name)).map((c) => c.key)
    set({ launchConfirm: null, openOutput: null })
    try {
      const { runId } = await api.launch({ kind: 'rerun', ticker: t, module: node.module, agent: node.name })
      beginRun(set, get, runId, { kind: 'rerun', module: node.module, agent: node.name, willCommitToMain: true }, planned)
      get().setToast({ msg: `Re-running ${node.name} + downstream on ${t}`, tone: 'good' })
    } catch (e: any) {
      launchErrorToast(get, e, t, `re-run of ${node.name}`)
    }
  },

  cancelLaunch: () => set({ launchConfirm: null }),

  cancelRun: async (runId) => {
    try {
      await api.cancel(runId)
    } catch {}
  },

  // select a not-yet-run orb and open the panel in "pending" mode (no output to load) so the
  // Run button sits in the same place as Re-run, with the orb visibly selected.
  selectNodeForRun: (node) => {
    set({ selectedNodeKey: node.key, openOutput: { title: node.name, nodeKey: node.key, pending: true } })
  },

  openOutputForNode: async (node) => {
    const rt = get().nodeRuntime[node.key]
    if (!rt?.outputPath) {
      get().setToast({ msg: `${node.name} has no output yet`, tone: 'info' })
      return
    }
    set({ selectedNodeKey: node.key, openOutput: { path: rt.outputPath, title: node.name, verdict: rt.verdict, nodeKey: node.key } })
  },

  openThesis: async () => {
    const t = get().selectedTicker
    if (!t) return
    try {
      const res = await api.thesis(t)
      set({ openOutput: { path: res.path, title: `Investment Thesis — ${t}`, verdict: get().decision?.decision ?? null, nodeKey: 'master/synthesizer' } })
    } catch {
      get().setToast({ msg: 'No final thesis yet', tone: 'info' })
    }
  },

  // open one of the three run tiers (memo / thesis / dossier) by resolving its file under the run root.
  // routes through OutputReader -> api.output, so it works in both live and static modes.
  openReport: async (tier) => {
    const t = get().selectedTicker
    const runRoot = get().runRoot
    if (!t || !runRoot) return get().setToast({ msg: 'No run output yet', tone: 'info' })
    const file = tier === 'memo' ? 'memo.md' : tier === 'dossier' ? 'audit_dossier.md' : 'final_thesis.md'
    const title = tier === 'memo' ? `Memo — ${t}` : tier === 'dossier' ? `Full Dossier — ${t}` : `Investment Thesis — ${t}`
    set({ openOutput: { path: `${runRoot}/${file}`, title, verdict: get().decision?.decision ?? null, nodeKey: 'master/synthesizer' } })
  },

  closeOutput: () => set({ openOutput: null, selectedNodeKey: null }),
  setToast: (t) => {
    set({ toast: t })
    if (t) setTimeout(() => { if (get().toast === t) set({ toast: null }) }, 3200)
  },

  startHealth: () => {
    if (get().staticMode || healthLoopRunning) return
    healthLoopRunning = true
    if (!healthListenersBound && typeof window !== 'undefined') {
      healthListenersBound = true
      // re-check instantly when the visitor's own network returns or the tab refocuses
      window.addEventListener('online', () => get().checkHealthNow())
      window.addEventListener('offline', () => set({ health: 'your-network', connected: false }))
      document.addEventListener('visibilitychange', () => { if (!document.hidden) get().checkHealthNow() })
    }
    pumpHealth(get)
  },

  stopHealth: () => {
    healthLoopRunning = false
    healthGen++
    if (healthTimer) { clearTimeout(healthTimer); healthTimer = null }
    healthAbort?.abort()
    healthAbort = null
  },

  checkHealthNow: async () => {
    if (!healthLoopRunning) return
    pumpHealth(get) // immediate probe + reschedule (gen guard voids the prior in-flight continuation)
  },

  _tickHealth: async () => {
    if (get().staticMode) return
    // the visitor's OWN connection is down — never blame the engine
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      set({ health: 'your-network', connected: false })
      return
    }
    healthAbort?.abort()
    const ac = new AbortController()
    healthAbort = ac
    const to = setTimeout(() => ac.abort(), HEALTH_TIMEOUT_MS)
    let outcome: 'ok' | 'engine' | 'session' = 'engine'
    try {
      const r = await fetch('/api/health', { cache: 'no-store', headers: { accept: 'application/json' }, signal: ac.signal })
      const ct = r.headers.get('content-type') || ''
      if (r.headers.get('x-engine-status') === 'offline' || r.status >= 520) {
        outcome = 'engine' // the edge Worker / Cloudflare says the origin is down
      } else if (r.ok && ct.includes('application/json')) {
        const j = await r.json().catch(() => null)
        outcome = j && j.ok === true ? 'ok' : 'engine' // {ok:true}=live; {ok:false}=worker offline marker
      } else if (r.status === 401 || r.status === 403 || r.redirected || !ct.includes('application/json')) {
        outcome = 'session' // Access login/redirect (HTML) — an auth issue, not an engine outage
      } else {
        outcome = 'engine'
      }
    } catch {
      outcome = 'engine' // network error / abort / timeout (navigator.onLine was true)
    } finally {
      clearTimeout(to)
      if (healthAbort === ac) healthAbort = null
    }

    if (outcome === 'ok') {
      set({ health: 'online', healthFailCount: 0, lastHealthOkAt: Date.now(), connected: true })
    } else if (outcome === 'session') {
      set({ health: 'session-expired', connected: false })
    } else {
      const n = get().healthFailCount + 1
      const health: HealthState = n >= OFFLINE_THRESHOLD ? 'engine-offline' : 'reconnecting'
      // back-fill legacy `connected` (online/reconnecting = true) so the TickerPicker dot stays consistent
      set({ health, healthFailCount: n, connected: health === 'reconnecting' })
    }
  },

  _handleEvent: (e) => {
    const selected = get().selectedTicker
    // only run-started carries ticker; for every other event derive it from the owning run
    const evTicker = e.type === 'run-started' ? e.ticker : get().activeRuns[e.runId]?.ticker
    const forSelected = !evTicker || evTicker === selected

    const patch: Partial<State> = {}
    const rt = { ...get().nodeRuntime }
    const stream = get().runStream.slice()
    const upsertRow = (runId: string, key: string, name: string, module: string, layer: number, status: NodeStatus, verdict?: string | null) => {
      const i = stream.findIndex((r) => r.key === key)
      const row: StreamRow = { runId, ticker: evTicker || selected || '', key, name, module, layer, status, verdict, ts: Date.now() }
      if (i >= 0) stream[i] = row
      else stream.unshift(row)
    }

    switch (e.type) {
      case 'agent-started':
        if (forSelected) {
          rt[e.agentKey] = { ...rt[e.agentKey], status: 'running', runId: e.runId }
          upsertRow(e.runId, e.agentKey, e.name, e.module, e.layer, 'running')
        }
        break
      case 'agent-done':
        if (forSelected) {
          rt[e.agentKey] = { status: 'done', verdict: e.verdict, outputPath: e.outputPath, runId: e.runId }
          upsertRow(e.runId, e.agentKey, e.name, e.module, e.layer, 'done', e.verdict)
        }
        break
      case 'agent-failed':
        if (forSelected) {
          rt[e.agentKey] = { ...rt[e.agentKey], status: 'failed', runId: e.runId }
          upsertRow(e.runId, e.agentKey, e.name, e.module, e.layer, 'failed')
        }
        break
      case 'cost-tick': {
        const r = get().activeRuns[e.runId]
        if (r) patch.activeRuns = { ...get().activeRuns, [e.runId]: { ...r, costUsd: e.costUsdSoFar ?? r.costUsd } }
        if (e.rateLimit) api.credit().then((c) => set({ credit: c })).catch(() => {})
        break
      }
      case 'run-done': {
        get().refreshActiveRuns() // the finishing run drops out of the ticker dots
        closeRunSource(e.runId)
        const r = get().activeRuns[e.runId]
        if (r) patch.activeRuns = { ...get().activeRuns, [e.runId]: { ...r, status: 'done', costUsd: e.costUsd ?? r.costUsd } }
        if (r && r.ticker === selected) {
          patch.coreBloom = true
          if (bloomTimer) clearTimeout(bloomTimer)
          bloomTimer = setTimeout(() => set({ coreBloom: false }), 4500)
          api.decision(selected).then((d) => set({ decision: d })).catch(() => {})
          api.runManifest(selected).then((m) => {
            if (m.finalThesis) set({ nodeRuntime: { ...get().nodeRuntime, ['master/synthesizer']: { status: 'done', outputPath: `${m.runRoot}/final_thesis.md` } } })
            set({ runRoot: m.runRoot ?? get().runRoot, reports: { memo: !!m.memo, thesis: !!m.finalThesis, dossier: !!m.fullDossier } })
          }).catch(() => {})
          get().setToast({ msg: 'Run complete', tone: 'good' })
        }
        break
      }
      case 'run-error': {
        get().refreshActiveRuns()
        closeRunSource(e.runId)
        const r = get().activeRuns[e.runId]
        if (r) patch.activeRuns = { ...get().activeRuns, [e.runId]: { ...r, status: e.status } }
        if (!r || r.ticker === selected) {
          get().setToast({ msg: e.reason === 'out_of_credits' ? 'Out of credits — run could not execute' : `Run ${e.status}: ${e.reason}`, tone: 'bad' })
          if (e.reason === 'out_of_credits') patch.credit = { ok: false, reason: 'out_of_credits', checked: true }
        }
        break
      }
    }
    patch.nodeRuntime = rt
    patch.runStream = stream
    set(patch)
  },
}))

function beginRun(set: any, get: () => State, runId: string, info: { kind: string; module?: string; agent?: string; willCommitToMain?: boolean }, plannedKeys: string[]) {
  const ticker = get().selectedTicker || ''
  const rt = { ...get().nodeRuntime }
  for (const k of plannedKeys) rt[k] = { status: 'queued', runId }
  if (info.kind === 'full') rt['master/synthesizer'] = { status: 'queued', runId }
  const plannedCount = plannedKeys.length + (info.kind === 'full' ? 1 : 0)
  // drop finished runs for this ticker, add the new live one (other tickers' / other runs' state kept)
  const activeRuns = Object.fromEntries(Object.entries(get().activeRuns).filter(([, r]) => r.ticker !== ticker || LIVE_RUN.has(r.status)))
  activeRuns[runId] = { runId, ticker, ...info, status: 'running', plannedCount, startedAt: Date.now() }
  // close the output panel so the user is dropped back to the swarm to watch the run live; keep
  // other concurrent runs' stream rows, just clear any stale rows from this runId
  set({ activeRuns, nodeRuntime: rt, runStream: get().runStream.filter((r) => r.runId !== runId), coreBloom: false, selectedNodeKey: null, openOutput: null })
  connectRun(get, runId)
  get().refreshActiveRuns()
}

// open the live SSE for a run and pipe its events (incl. the server's replayed backlog) into the store.
// Does NOT close other runs' streams — concurrent same-ticker runs each get their own EventSource.
function connectRun(get: () => State, runId: string) {
  if (runSources.has(runId)) return
  const es = new EventSource(api.runStreamUrl(runId))
  for (const t of RUN_EVENT_TYPES) {
    es.addEventListener(t, (ev: MessageEvent) => {
      try {
        get()._handleEvent(JSON.parse(ev.data))
      } catch {}
    })
  }
  es.onerror = () => { /* keep open; server may still be streaming */ }
  runSources.set(runId, es)
}

// rebuild the live view for one in-flight run from its snapshot, then attach the stream.
// Merges into the existing view so multiple concurrent runs for the ticker coexist.
async function reconnectRun(set: any, get: () => State, runId: string, token: number) {
  try {
    const snap = await api.runSnapshot(runId)
    if (get().selectToken !== token) return
    const rt = { ...get().nodeRuntime }
    const stream = get().runStream.filter((r) => r.runId !== runId)
    for (const a of snap.agents || []) {
      rt[a.key] = { status: a.status, verdict: a.verdict ?? null, outputPath: a.outputPath, runId }
      if (a.status !== 'queued') stream.unshift({ runId, ticker: snap.ticker, key: a.key, name: a.name, module: a.module, layer: a.layer, status: a.status, verdict: a.verdict ?? null, ts: Date.now() })
    }
    const plannedCount = (snap.expected?.length ?? snap.agents?.length ?? 0) + (snap.kind === 'full' ? 1 : 0)
    const activeRuns = { ...get().activeRuns, [runId]: { runId, ticker: snap.ticker, kind: snap.kind, module: snap.module, agent: snap.agent, status: snap.status, costUsd: snap.costUsd, willCommitToMain: snap.willCommitToMain, plannedCount, startedAt: snap.startedAt } }
    set({ activeRuns, nodeRuntime: rt, runStream: stream })
    connectRun(get, runId)
  } catch {}
}

function schedulePoll(get: () => State, keepGoing: boolean) {
  if (pollTimer) { clearTimeout(pollTimer); pollTimer = null }
  if (keepGoing && !get().staticMode) pollTimer = setTimeout(() => get().refreshActiveRuns(), 5000)
}

// One health probe now, then self-reschedule (20s healthy / 5s degraded). The generation guard makes a
// restart/checkHealthNow cancel any in-flight tick's continuation, so two timers never coexist.
function pumpHealth(get: () => State) {
  const gen = ++healthGen
  if (healthTimer) { clearTimeout(healthTimer); healthTimer = null }
  const tick = async () => {
    if (gen !== healthGen) return
    await get()._tickHealth()
    if (gen !== healthGen || !healthLoopRunning) return
    healthTimer = setTimeout(tick, get().health === 'online' ? HEALTH_OK_MS : HEALTH_DEGRADED_MS)
  }
  void tick()
}

function closeRunSource(runId?: string) {
  if (!runId) return closeAllRunSources()
  const es = runSources.get(runId)
  if (es) {
    es.close()
    runSources.delete(runId)
  }
}

function closeAllRunSources() {
  for (const es of runSources.values()) es.close()
  runSources.clear()
}

// Map a launch failure to a clear toast. Admission rejections (expected, user can act) read as
// info; genuine failures read as bad. The server's discriminated body.code drives the split.
function launchErrorToast(get: () => State, e: any, ticker: string, what: string) {
  const code = e?.body?.code
  const info = code === 'target_conflict' || code === 'exclusivity' || code === 'dependency_conflict' || code === 'upstream_incomplete'
  const msg = e?.message ? String(e.message) : `Launch failed for ${what} on ${ticker}`
  get().setToast({ msg, tone: info ? 'info' : 'bad' })
}
