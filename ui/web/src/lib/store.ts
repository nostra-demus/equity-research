import { create } from 'zustand'
import { api, isStatic } from './api'
import { downstreamCascade, type CascadeNode } from './cascade'
import type { AgentNode, DataStatus, HealthState, LaunchPreflight, NodeRuntime, NodeStatus, ScreenerBoard, SignalIntakeInput, SseEvent, SwarmGraph, SwarmMeta, TickerSummary, Usage } from './types'

const RUN_EVENT_TYPES = ['run-started', 'agent-started', 'agent-done', 'agent-failed', 'layer-advanced', 'module-done', 'module-routed', 'cost-tick', 'run-done', 'run-error']

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
  dataLoading: boolean
  credit: Usage | null
  creditChecking: boolean
  nodeRuntime: Record<string, NodeRuntime>
  now: number // shared 1s clock for every live timer (orb/module/panel/tooltip); ticked only while orbs run
  activeRuns: Record<string, ActiveRun> // selected-ticker live runs (+ just-finished, until next switch)
  activeRunsByTicker: Set<string>
  chainTickers: Set<string> // tickers whose full run is a per-module CHAIN — defer the "complete" celebration to the master step
  selectToken: number
  runStream: StreamRow[]
  coreBloom: boolean
  decision: any | null
  runRoot: string | null
  reports: { memo: boolean; thesis: boolean; dossier: boolean }
  // per-module three tiers (run-root-relative paths), keyed by module folder name. Generic — any module lights up.
  moduleReports: Record<string, { synthesis?: string; memo?: string; dossier?: string }>
  openOutput: { path?: string; title: string; verdict?: string | null; nodeKey?: string; pending?: boolean } | null
  activityOpen: boolean
  callsOpen: boolean
  selectedNodeKey: string | null
  launchConfirm: { kind: 'full' | 'rerun'; preflight: LaunchPreflight; cascade?: CascadeNode[]; node?: { module: string; name: string; key: string } } | null
  toast: Toast | null

  // ---- swarms (multi-swarm cockpit; research is the grandfathered default) ----
  swarms: SwarmMeta[]
  activeSwarm: string // 'research' | 'screener' | future swarms
  // the warp transition between swarms; landing carries an optional research ticker to preselect
  warp: { from: string; to: string; payloadTicker?: string; landTicker?: string; phase: 'collapse' | 'traverse' | 'bloom' } | null
  // screener slice (self-contained so the research paths stay untouched)
  scGraph: SwarmGraph | null
  scNodesByKey: Map<string, AgentNode>
  scRuntime: Record<string, NodeRuntime>
  scSelectedSignal: string | null // SIG id whose run folder is shown on the gauntlet
  scBoard: ScreenerBoard | null
  scRouted: Record<string, { route: string; terminal: boolean }> // module -> latest routing (lights the switchyard)
  signalIntakeOpen: boolean
  pipelineOpen: boolean
  scThesisDetail: { thesis: any; candidates: any; handoffs: any[] } | null

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
  setNow: (n: number) => void
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
  openModuleReport: (module: string, tier: 'synthesis' | 'memo' | 'dossier') => void
  closeOutput: () => void
  openActivity: () => void
  closeActivity: () => void
  openCalls: () => void
  closeCalls: () => void
  openCallFile: (path: string, title: string) => void
  updateCall: (ticker: string) => Promise<void>
  fileDueReview: (ticker: string, window: string) => Promise<void>
  refreshDashboard: () => Promise<void>
  setToast: (t: Toast | null) => void
  _handleEvent: (e: SseEvent) => void

  // ---- swarm/screener actions ----
  switchSwarm: (to: string, opts?: { payloadTicker?: string; landTicker?: string }) => void
  _advanceWarp: () => void
  scInit: () => Promise<void>
  scRefreshBoard: () => Promise<void>
  scSelectSignal: (sigId: string | null) => Promise<void>
  scNodeStatus: (key: string) => NodeStatus
  openSignalIntake: () => void
  closeSignalIntake: () => void
  submitSignal: (intake: SignalIntakeInput) => Promise<void>
  relaunchSignal: (sigId: string) => Promise<void>
  runSweep: () => Promise<void>
  openPipeline: () => void
  closePipeline: () => void
  openThesisDetail: (thesisId: string) => Promise<void>
  closeThesisDetail: () => void
  sendToResearch: (thesisId: string, ticker: string, poolPresent: boolean) => Promise<void>
  openScreenerOutput: (node: AgentNode) => void
  _handleScreenerEvent: (e: SseEvent) => void
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
  dataLoading: false,
  credit: null,
  creditChecking: false,
  nodeRuntime: {},
  now: Date.now(),
  activeRuns: {},
  activeRunsByTicker: new Set(),
  chainTickers: new Set(),
  selectToken: 0,
  runStream: [],
  coreBloom: false,
  decision: null,
  runRoot: null,
  reports: { memo: false, thesis: false, dossier: false },
  moduleReports: {},
  openOutput: null,
  activityOpen: false,
  callsOpen: false,
  selectedNodeKey: null,
  launchConfirm: null,
  toast: null,

  swarms: [],
  activeSwarm: 'research',
  warp: null,
  scGraph: null,
  scNodesByKey: new Map(),
  scRuntime: {},
  scSelectedSignal: null,
  scBoard: null,
  scRouted: {},
  signalIntakeOpen: false,
  pipelineOpen: false,
  scThesisDetail: null,

  init: async () => {
    try {
      const [graph, tk, credit] = await Promise.all([api.swarm(), api.tickers(), api.credit().catch(() => null)])
      const stat = isStatic()
      set({ connected: true, staticMode: stat, graph, nodesByKey: flatten(graph), tickers: tk.tickers, emptyState: tk.emptyState, dataDir: (tk as any).dataDir ?? null, credit })
      api.swarms().then((swarms) => set({ swarms })).catch(() => set({ swarms: [{ id: 'research', label: 'Research', color: '#e0a33e', unit: 'ticker', order: 1, layout: 'constellation' }] }))
      if (!stat) get().startHealth() // begin the engine heartbeat (live mode only); idempotent across reconnects
      // live data-folder watcher (Drive sync) — backend only
      if (!stat && !dataSource) {
        dataSource = new EventSource(api.dataStreamUrl())
        dataSource.addEventListener('data-changed', (ev: MessageEvent) => {
          try {
            const d = JSON.parse(ev.data)
            if (d.ticker === get().selectedTicker) get().refreshData()
            refreshTickersSoon(get, set) // live count update + keep polling while Drive is still syncing
          } catch {}
        })
      }
      reconcileSelection(get, set) // a reconnect may carry a now-removed selection — drop it so auto-select picks a live ticker
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
    set({ selectToken: token, selectedTicker: t, dataStatus: null, dataLoading: true, nodeRuntime: {}, decision: null, runRoot: null, reports: { memo: false, thesis: false, dossier: false }, moduleReports: {}, coreBloom: false, selectedNodeKey: null, runStream: [], activeRuns, openOutput: null })
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
      set({ nodeRuntime: seed, runRoot: manifest.runRoot ?? null, reports: { memo: !!manifest.memo, thesis: !!manifest.finalThesis, dossier: !!manifest.fullDossier }, moduleReports: manifest.moduleReports ?? {} })
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
    // token-guard so a slow response for a just-deselected ticker can't overwrite the new selection or
    // clear its loading flag (mirrors selectTicker's selectToken invariant)
    const token = get().selectToken
    // an unusable folder name (e.g. "TATA MOTORS") would 400 on data-status — skip the fetch and let the
    // empty-state surface the rename guidance instead of failing silently
    const sel = get().tickers.find((x) => x.ticker === t)
    if (sel && sel.valid === false) { if (get().selectToken === token) set({ dataStatus: null, dataLoading: false }); return }
    set({ dataLoading: true })
    try {
      const dataStatus = await api.dataStatus(t)
      if (get().selectToken !== token) return // a newer selection superseded this fetch
      set({ dataStatus })
    } catch {
      // leave dataStatus as-is; the loading flag clears below so the UI stops showing "reading…"
    } finally {
      if (get().selectToken === token) set({ dataLoading: false })
    }
  },

  // which companies have a run in flight (drives the ticker-menu dots). Self-polls while any run is active.
  refreshActiveRuns: async () => {
    if (get().staticMode) return
    try {
      const { active } = await api.activeRuns()
      set({ activeRunsByTicker: new Set(active.map((r) => r.ticker)) })
      // live-follow: connect to any active run for the SELECTED ticker we're not already streaming. A
      // chained full run launches each step under a new runId server-side; without this the swarm would
      // go dark between steps. Benign for normal runs (it only attaches to this ticker's own live runs).
      const sel = get().selectedTicker
      if (sel) {
        const token = get().selectToken
        for (const r of active) if (r.ticker === sel && !runSources.has(r.runId)) reconnectRun(set, get, r.runId, token)
      }
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
  setNow: (n) => set({ now: n }),

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
      const { runId, chained } = await api.launch({ kind: 'full', ticker: t, confirmTicker: t })
      // a chained full run is a sequence of per-module runs + master; mark the ticker so run-done defers
      // the "complete" celebration to the master step and the cockpit live-follows every step.
      if (chained) set({ chainTickers: new Set(get().chainTickers).add(t) })
      beginRun(set, get, runId, { kind: 'full', willCommitToMain: true }, planned)
      get().setToast({ msg: `Launched full run on ${t}${chained ? ' (per-module)' : ''}`, tone: 'good' })
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

  // open one of a module's three tiers (synthesis / memo / dossier). The path comes straight from the
  // manifest's moduleReports (already run-root-relative), so this works in both live and static modes.
  // nodeKey points at the module synthesis so the reader has a valid prompt + Re-run target.
  openModuleReport: (module, tier) => {
    const path = get().moduleReports[module]?.[tier]
    if (!path) return get().setToast({ msg: 'That document was not generated', tone: 'info' })
    const titleTier = tier === 'memo' ? 'Memo' : tier === 'dossier' ? 'Dossier' : 'Synthesis'
    const name = module.replace(/-/g, ' ')
    set({ openOutput: { path, title: `${name} — ${titleTier}`, verdict: null, nodeKey: `${module}/99_${module}-synthesis` } })
  },

  closeOutput: () => set({ openOutput: null, selectedNodeKey: null }),
  openActivity: () => set({ activityOpen: true }),
  closeActivity: () => set({ activityOpen: false }),
  openCalls: () => set({ callsOpen: true }),
  closeCalls: () => set({ callsOpen: false }),
  // open any analyses/ file (review JSON / thesis md / dashboard md) in the OutputReader (renders text).
  openCallFile: (path, title) => set({ openOutput: { path, title } }),

  // file an ad-hoc outcome review for one call ("update what's happened since now"). Delegates to
  // Phase 3 /research:review-decisions <ticker> ad-hoc via the launch system; the tracker auto-refreshes.
  updateCall: async (ticker) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — updates run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live updates are paused until it reconnects.', tone: 'info' })
    try {
      await api.launch({ kind: 'review', ticker, window: 'ad-hoc' })
      get().setToast({ msg: `Filing an ad-hoc review for ${ticker} — see Activity; the tracker refreshes when it lands`, tone: 'good' })
    } catch (e: any) {
      launchErrorToast(get, e, ticker, `${ticker} review`)
    }
  },
  // file a specific scheduled (due/overdue) review window — never silently ad-hoc.
  fileDueReview: async (ticker, window) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — updates run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live updates are paused until it reconnects.', tone: 'info' })
    try {
      await api.launch({ kind: 'review', ticker, window })
      get().setToast({ msg: `Filing the ${window} review for ${ticker} — see Activity`, tone: 'good' })
    } catch (e: any) {
      launchErrorToast(get, e, ticker, `${ticker} ${window} review`)
    }
  },
  // regenerate the committed markdown/JSON calls dashboard (/research:track). It is cross-ticker and
  // ignores the ticker; the launch validator requires a roster ticker, so pass an ignored placeholder.
  refreshDashboard: async () => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — the dashboard regenerates on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — paused until it reconnects.', tone: 'info' })
    const t = get().selectedTicker || get().tickers[0]?.ticker
    if (!t) return get().setToast({ msg: 'No company loaded to run the dashboard from', tone: 'info' })
    try {
      await api.launch({ kind: 'track', ticker: t })
      get().setToast({ msg: 'Rebuilding the calls dashboard — see Activity; it commits when done', tone: 'good' })
    } catch (e: any) {
      launchErrorToast(get, e, t, 'calls dashboard')
    }
  },
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
          // e.ts (server) marks when the orb's clock starts; clear any stale endedAt (e.g. a re-run)
          rt[e.agentKey] = { ...rt[e.agentKey], status: 'running', runId: e.runId, startedAt: e.ts, endedAt: undefined }
          upsertRow(e.runId, e.agentKey, e.name, e.module, e.layer, 'running')
        }
        break
      case 'agent-done':
        if (forSelected) {
          // preserve startedAt (set on agent-started, incl. the replayed backlog on reconnect) so the
          // finished orb can show its true duration
          rt[e.agentKey] = { ...rt[e.agentKey], status: 'done', verdict: e.verdict, outputPath: e.outputPath, runId: e.runId, endedAt: e.ts }
          upsertRow(e.runId, e.agentKey, e.name, e.module, e.layer, 'done', e.verdict)
        }
        break
      case 'agent-failed':
        if (forSelected) {
          rt[e.agentKey] = { ...rt[e.agentKey], status: 'failed', runId: e.runId, endedAt: e.ts }
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
        get().refreshActiveRuns() // drops the finished run from the dots AND connects the next chain step
        closeRunSource(e.runId)
        const r = get().activeRuns[e.runId]
        if (r) patch.activeRuns = { ...get().activeRuns, [e.runId]: { ...r, status: 'done', costUsd: e.costUsd ?? r.costUsd } }
        if (r && r.ticker === selected) {
          // a chained full run finishes once PER STEP; only the master step (the last) is "complete".
          const chained = get().chainTickers.has(r.ticker)
          const isFinal = !chained || r.module === 'master'
          // keep reports/decision current as each step lands (memo/thesis stay false until the master)
          api.runManifest(selected).then((m) => {
            if (m.finalThesis) set({ nodeRuntime: { ...get().nodeRuntime, ['master/synthesizer']: { status: 'done', outputPath: `${m.runRoot}/final_thesis.md` } } })
            set({ runRoot: m.runRoot ?? get().runRoot, reports: { memo: !!m.memo, thesis: !!m.finalThesis, dossier: !!m.fullDossier }, moduleReports: m.moduleReports ?? get().moduleReports })
          }).catch(() => {})
          if (isFinal) {
            patch.coreBloom = true
            if (bloomTimer) clearTimeout(bloomTimer)
            bloomTimer = setTimeout(() => set({ coreBloom: false }), 4500)
            api.decision(selected).then((d) => set({ decision: d })).catch(() => {})
            if (chained) set({ chainTickers: new Set([...get().chainTickers].filter((x) => x !== r.ticker)) })
            get().setToast({ msg: 'Run complete', tone: 'good' })
          } else {
            // mid-chain step done — the next module auto-starts (and is now being streamed); show progress
            get().setToast({ msg: `${r.module || 'Module'} done — continuing the pipeline…`, tone: 'good' })
          }
        }
        break
      }
      case 'run-error': {
        get().refreshActiveRuns()
        closeRunSource(e.runId)
        const r = get().activeRuns[e.runId]
        if (r) patch.activeRuns = { ...get().activeRuns, [e.runId]: { ...r, status: e.status } }
        // a chained full run stops advancing when a step fails/cancels/comes back incomplete — the engine
        // won't launch the next step, so clear the chain and say exactly where it stopped.
        if (r && get().chainTickers.has(r.ticker)) {
          set({ chainTickers: new Set([...get().chainTickers].filter((x) => x !== r.ticker)) })
          if (r.ticker === selected) {
            const msg = e.status === 'incomplete'
              ? (e.message || 'The pipeline finished but the final thesis & memo were not produced.')
              : `Pipeline stopped at ${r.module || 'a step'} (${e.status}) — fix it and re-run from there.`
            get().setToast({ msg, tone: 'bad' })
            api.runManifest(selected).then((m) => set({ runRoot: m.runRoot ?? get().runRoot, reports: { memo: !!m.memo, thesis: !!m.finalThesis, dossier: !!m.fullDossier }, moduleReports: m.moduleReports ?? get().moduleReports })).catch(() => {})
          }
          break
        }
        if (!r || r.ticker === selected) {
          if (e.status === 'incomplete') {
            // honest signal: the process exited but the final memos weren't produced (budget/turn cut-off)
            get().setToast({ msg: e.message || 'Run finished but the final thesis & memo were not produced — re-run from the master to finish.', tone: 'bad' })
            // surface whatever DID get written so the cockpit isn't blank
            if (r && r.ticker === selected) api.runManifest(selected).then((m) => set({ runRoot: m.runRoot ?? get().runRoot, reports: { memo: !!m.memo, thesis: !!m.finalThesis, dossier: !!m.fullDossier }, moduleReports: m.moduleReports ?? get().moduleReports })).catch(() => {})
          } else {
            get().setToast({ msg: e.reason === 'out_of_credits' ? 'Out of credits — run could not execute' : `Run ${e.status}: ${e.reason}`, tone: 'bad' })
            if (e.reason === 'out_of_credits') patch.credit = { ok: false, reason: 'out_of_credits', checked: true }
          }
        }
        break
      }
    }
    patch.nodeRuntime = rt
    patch.runStream = stream
    set(patch)
  },

  // ================= swarm switcher + warp =================
  // The warp is the cinematic transition between swarms: collapse (current constellation implodes)
  // -> traverse (a comet crosses the void; the swarm flips mid-flight) -> bloom (the target
  // constellation awakens). Reduced-motion visitors get a quick crossfade (the CSS handles it);
  // the phase timings here match the keyframes in global.css.
  switchSwarm: (to, opts) => {
    const from = get().activeSwarm
    if (to === from || get().warp) return
    if (!get().swarms.some((s) => s.id === to)) return
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      set({ activeSwarm: to, warp: null, openOutput: null, selectedNodeKey: null })
      if (to !== 'research') void get().scInit()
      if (opts?.landTicker) void get().selectTicker(opts.landTicker)
      return
    }
    set({ warp: { from, to, payloadTicker: opts?.payloadTicker, landTicker: opts?.landTicker, phase: 'collapse' }, openOutput: null, selectedNodeKey: null, signalIntakeOpen: false, pipelineOpen: false, scThesisDetail: null })
    if (warpTimer) clearTimeout(warpTimer)
    warpTimer = setTimeout(() => get()._advanceWarp(), 420) // collapse -> traverse
  },

  _advanceWarp: () => {
    const w = get().warp
    if (!w) return
    if (w.phase === 'collapse') {
      // mid-flight: flip the active swarm so the target constellation mounts underneath the void
      set({ warp: { ...w, phase: 'traverse' }, activeSwarm: w.to })
      if (w.to !== 'research') void get().scInit()
      if (w.landTicker) void get().selectTicker(w.landTicker)
      if (warpTimer) clearTimeout(warpTimer)
      warpTimer = setTimeout(() => get()._advanceWarp(), 520)
    } else if (w.phase === 'traverse') {
      set({ warp: { ...w, phase: 'bloom' } })
      if (warpTimer) clearTimeout(warpTimer)
      warpTimer = setTimeout(() => get()._advanceWarp(), 520)
    } else {
      set({ warp: null })
    }
  },

  // ================= screener slice =================
  scInit: async () => {
    try {
      if (!get().scGraph) {
        const g = await api.swarmGraph('screener')
        set({ scGraph: g, scNodesByKey: flatten(g) })
      }
      await get().scRefreshBoard()
      // auto-show the most recent signal on the gauntlet so the stage is never empty
      if (!get().scSelectedSignal) {
        const latest = get().scBoard?.signals?.[0]?.signal_id || get().scBoard?.live?.find((l) => l.kind === 'signal')?.subjectId || null
        if (latest) await get().scSelectSignal(latest)
      }
      // attach to any screener runs already in flight
      const live = get().scBoard?.live || []
      for (const l of live) if (!scRunSources.has(l.runId)) connectScreenerRun(get, l.runId)
    } catch {}
  },

  scRefreshBoard: async () => {
    try {
      const scBoard = await api.screenerBoard()
      set({ scBoard })
    } catch {}
  },

  // load one signal's run folder onto the gauntlet: seed orb states from its saved outputs
  scSelectSignal: async (sigId) => {
    set({ scSelectedSignal: sigId, scRuntime: {}, scRouted: {} })
    if (!sigId) return
    try {
      const m = await api.screenerRun(sigId)
      if (get().scSelectedSignal !== sigId) return
      const seed: Record<string, NodeRuntime> = {}
      const routed: Record<string, { route: string; terminal: boolean }> = {}
      for (const [mod, agents] of Object.entries<any>(m?.modules || {})) {
        for (const a of agents) {
          seed[a.agentKey] = { status: 'done', verdict: a.verdict, outputPath: `${m.runRoot}/${a.agentKey}.md` }
          if (a.routing) routed[mod] = { route: a.routing, terminal: isTerminalRoute(a.routing) }
        }
      }
      // thesis status is the authoritative switchyard light once Phase 1 locked
      const status = m?.thesisRecord?.meta?.status
      if (status) routed['__thesis__'] = { route: status, terminal: true }
      set({ scRuntime: seed, scRouted: routed })
    } catch {
      if (get().scSelectedSignal === sigId) set({ scRuntime: {}, scRouted: {} })
    }
  },

  scNodeStatus: (key) => {
    const rt = get().scRuntime[key]
    if (rt) return rt.status
    return get().scSelectedSignal ? 'dormant' : 'dormant'
  },

  openSignalIntake: () => set({ signalIntakeOpen: true }),
  closeSignalIntake: () => set({ signalIntakeOpen: false }),

  submitSignal: async (intake) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — signals run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    try {
      const { runId, preflight } = await api.launchSignal({ intake })
      set({ signalIntakeOpen: false })
      const sigId = preflight.ticker
      set({ scSelectedSignal: sigId, scRuntime: {}, scRouted: {} })
      beginScreenerRun(set, get, runId, sigId)
      get().setToast({ msg: `Signal ${sigId} entering the gauntlet`, tone: 'good' })
    } catch (e: any) {
      get().setToast({ msg: e?.message ? String(e.message) : 'Signal launch failed', tone: e?.body?.code ? 'info' : 'bad' })
    }
  },

  // re-run an existing signal (e.g. a PARK the human overrides, or an inbox row promoted to a run)
  relaunchSignal: async (sigId) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — signals run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    try {
      const { runId } = await api.launchSignal({ sigId })
      set({ scSelectedSignal: sigId, scRuntime: {}, scRouted: {}, pipelineOpen: false })
      beginScreenerRun(set, get, runId, sigId)
      get().setToast({ msg: `Re-running ${sigId} through the gauntlet`, tone: 'good' })
    } catch (e: any) {
      get().setToast({ msg: e?.message ? String(e.message) : 'Signal launch failed', tone: e?.body?.code ? 'info' : 'bad' })
    }
  },

  runSweep: async () => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — sweeps run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    try {
      const { runId } = await api.launchSweep()
      beginScreenerRun(set, get, runId, 'sweep')
      get().setToast({ msg: 'Scanning approved sources — the Inbox fills when it lands', tone: 'good' })
    } catch (e: any) {
      get().setToast({ msg: e?.message ? String(e.message) : 'Sweep launch failed', tone: e?.body?.code ? 'info' : 'bad' })
    }
  },

  openPipeline: () => {
    set({ pipelineOpen: true })
    void get().scRefreshBoard()
  },
  closePipeline: () => set({ pipelineOpen: false, scThesisDetail: null }),

  openThesisDetail: async (thesisId) => {
    try {
      const d = await api.screenerThesis(thesisId)
      set({ scThesisDetail: d })
    } catch {
      get().setToast({ msg: 'Could not load the thesis record', tone: 'bad' })
    }
  },
  closeThesisDetail: () => set({ scThesisDetail: null }),

  // The handoff: seed data/<TICKER>/ from the locked thesis (idempotent server-side), then warp to
  // the research swarm with the ticker preselected. The research run itself stays a separate,
  // human-confirmed launch — if the pool already has filings we open the full-run confirm on landing.
  sendToResearch: async (thesisId, ticker, poolPresent) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — handoffs run on your machine via npm run dev', tone: 'info' })
    if (HARD_DOWN.has(get().health)) return get().setToast({ msg: 'Engine offline — live runs are paused until it reconnects.', tone: 'info' })
    try {
      const res = await api.handoff(thesisId, ticker)
      const already = res.alreadyHandedOff
      set({ pipelineOpen: false, scThesisDetail: null })
      get().switchSwarm('research', { payloadTicker: ticker, landTicker: poolPresent ? ticker : undefined })
      if (already) {
        get().setToast({ msg: `${ticker} was already handed off — memo in place. ${poolPresent ? 'Launch when ready.' : 'Drop filings into its data folder first.'}`, tone: 'info' })
      } else {
        // The API returns at CLI spawn, not at memo/ledger completion — say "started", and attach
        // the run stream so run-done can confirm "seeded" truthfully (see _handleScreenerEvent).
        if (res.runId) {
          scHandoffWatch.set(res.runId, { ticker, poolPresent })
          connectScreenerRun(get, res.runId)
        }
        get().setToast({ msg: `Handoff started — seeding the thesis memo into data/${ticker}/…`, tone: 'good' })
        // fallback board refresh in case the stream drops before run-done lands
        setTimeout(() => void get().scRefreshBoard(), 8000)
      }
    } catch (e: any) {
      // admission rejections (e.g. exclusivity: this exact handoff is already running) are expected
      // and actionable — surface them as info like the sibling launchers, not as a failure
      get().setToast({ msg: e?.message ? String(e.message) : 'Handoff failed', tone: e?.body?.code ? 'info' : 'bad' })
    }
  },

  openScreenerOutput: (node) => {
    const rt = get().scRuntime[node.key]
    if (!rt?.outputPath) return get().setToast({ msg: `${node.name} has no output yet`, tone: 'info' })
    set({ selectedNodeKey: node.key, openOutput: { path: rt.outputPath, title: node.name, verdict: rt.verdict, nodeKey: node.key } })
  },

  // screener SSE -> the screener slice (the research handler stays untouched)
  _handleScreenerEvent: (e) => {
    const rt = { ...get().scRuntime }
    const stream = get().runStream.slice()
    const upsert = (runId: string, key: string, name: string, module: string, layer: number, status: NodeStatus, verdict?: string | null) => {
      const i = stream.findIndex((r) => r.key === key)
      const row: StreamRow = { runId, ticker: get().scSelectedSignal || 'screener', key, name, module, layer, status, verdict, ts: Date.now() }
      if (i >= 0) stream[i] = row
      else stream.unshift(row)
    }
    switch (e.type) {
      case 'agent-started':
        rt[e.agentKey] = { ...rt[e.agentKey], status: 'running', runId: e.runId, startedAt: e.ts, endedAt: undefined }
        upsert(e.runId, e.agentKey, e.name, e.module, e.layer, 'running')
        break
      case 'agent-done':
        rt[e.agentKey] = { ...rt[e.agentKey], status: 'done', verdict: e.verdict, outputPath: e.outputPath, runId: e.runId, endedAt: e.ts }
        upsert(e.runId, e.agentKey, e.name, e.module, e.layer, 'done', e.verdict)
        break
      case 'agent-failed':
        rt[e.agentKey] = { ...rt[e.agentKey], status: 'failed', runId: e.runId, endedAt: e.ts }
        upsert(e.runId, e.agentKey, e.name, e.module, e.layer, 'failed')
        break
      case 'module-routed': {
        const scRouted = { ...get().scRouted, [e.module]: { route: e.route, terminal: e.terminal } }
        set({ scRouted })
        if (e.terminal) get().setToast({ msg: `${e.module}: routed ${e.route} — pipeline stops there (a valid outcome)`, tone: 'info' })
        break
      }
      case 'run-done': {
        closeScreenerRunSource(e.runId)
        void get().scRefreshBoard()
        const handoff = scHandoffWatch.get(e.runId)
        if (handoff) {
          scHandoffWatch.delete(e.runId)
          get().setToast({
            msg: handoff.poolPresent
              ? `${handoff.ticker} memo seeded ✓ — review and launch the full run when ready.`
              : `${handoff.ticker} memo seeded ✓ — its pool has no filings yet; add them before a research run.`,
            tone: 'good',
          })
          break
        }
        const sig = get().scSelectedSignal
        if (sig) void get().scSelectSignal(sig) // reload saved outputs + final routing lights
        get().setToast({ msg: 'Screener run complete', tone: 'good' })
        break
      }
      case 'run-error': {
        closeScreenerRunSource(e.runId)
        void get().scRefreshBoard()
        const handoff = scHandoffWatch.get(e.runId)
        if (handoff) {
          scHandoffWatch.delete(e.runId)
          get().setToast({ msg: `Handoff for ${handoff.ticker} ${e.status}: ${e.reason} — the memo may not be seeded; retry from the Pipeline board.`, tone: 'bad' })
          break
        }
        get().setToast({ msg: `Screener run ${e.status}: ${e.reason}`, tone: 'bad' })
        break
      }
    }
    set({ scRuntime: rt, runStream: stream })
  },
}))

// DEV-only: expose the store so live timer/ETA visuals can be exercised locally without paying for a real
// run (simulate running orbs via __store.setState). Tree-shaken out of the production build.
if (import.meta.env.DEV && typeof window !== 'undefined') (window as any).__store = useStore

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

// If the currently-selected company's folder was renamed or removed (so it's no longer in the list),
// drop the stale selection — otherwise the picker keeps showing a ghost ticker that can't be loaded.
// Returns the cleared name (for a toast) or null. Guards on a non-empty list so a transient/failed
// fetch never clears a valid selection.
function reconcileSelection(get: () => State, set: (p: Partial<State>) => void): string | null {
  const sel = get().selectedTicker
  const list = get().tickers
  if (sel && list.length > 0 && !list.some((t) => t.ticker === sel)) {
    set({ selectedTicker: null, dataStatus: null, dataLoading: false, decision: null, runRoot: null, nodeRuntime: {}, reports: { memo: false, thesis: false, dossier: false }, moduleReports: {}, selectedNodeKey: null, openOutput: null })
    return sel
  }
  return null
}

// Refresh the ticker list (live file counts + sync state). While any ticker is still syncing from Drive,
// keep re-polling so the count keeps climbing and the "syncing…" flag clears once files stop arriving —
// even after the file-event stream goes quiet.
let tickersSyncTimer: any = null
function refreshTickersSoon(get: () => State, set: (p: Partial<State>) => void) {
  api
    .tickers()
    .then((t) => {
      set({ tickers: t.tickers, emptyState: t.emptyState, dataDir: (t as any).dataDir ?? get().dataDir })
      const removed = reconcileSelection(get, set)
      if (removed) get().setToast({ msg: `${removed} is no longer in the data folder — pick a ticker`, tone: 'info' })
      if (tickersSyncTimer) { clearTimeout(tickersSyncTimer); tickersSyncTimer = null }
      if (!get().staticMode && t.tickers.some((x) => x.syncing)) tickersSyncTimer = setTimeout(() => refreshTickersSoon(get, set), 5000)
    })
    .catch(() => {})
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

// ---- screener run streams (separate map so research streams are never disturbed) ----
const scRunSources = new Map<string, EventSource>()
// Handoff runs being watched for completion: runId → toast context. The launch API returns as soon
// as the CLI spawns, so "memo seeded" is only true at run-done — these runs get a tailored
// completion/failure toast instead of the generic "Screener run complete".
const scHandoffWatch = new Map<string, { ticker: string; poolPresent: boolean }>()
let warpTimer: any = null

// Terminal routing values mirror the SWARM.md routing contract. Kept as a display heuristic only —
// the server's module-routed events carry the authoritative `terminal` flag; this covers seeding
// from saved run folders where only the routing string is known.
const TERMINAL_ROUTES = new Set(['log', 'park', 'suppress', 'watchlist_no_source', 'watchlist_no_world_change', 'return_to_m0_2', 'watchlist_no_edge'])
function isTerminalRoute(route: string): boolean {
  return TERMINAL_ROUTES.has(String(route).toLowerCase())
}

function connectScreenerRun(get: () => State, runId: string) {
  if (scRunSources.has(runId)) return
  const es = new EventSource(api.runStreamUrl(runId))
  for (const t of RUN_EVENT_TYPES) {
    es.addEventListener(t, (ev: MessageEvent) => {
      try {
        get()._handleScreenerEvent(JSON.parse(ev.data))
      } catch {}
    })
  }
  es.onerror = () => { /* keep open; server may still be streaming */ }
  scRunSources.set(runId, es)
}

function beginScreenerRun(set: any, get: () => State, runId: string, subject: string) {
  // seed every screener orb as queued when a full signal enters the gauntlet (sweeps have no orbs)
  if (subject.startsWith('SIG-')) {
    const rt: Record<string, NodeRuntime> = {}
    for (const k of get().scNodesByKey.keys()) rt[k] = { status: 'queued', runId }
    set({ scRuntime: rt, runStream: get().runStream.filter((r) => r.runId !== runId) })
  }
  connectScreenerRun(get, runId)
}

function closeScreenerRunSource(runId: string) {
  const es = scRunSources.get(runId)
  if (es) {
    es.close()
    scRunSources.delete(runId)
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
