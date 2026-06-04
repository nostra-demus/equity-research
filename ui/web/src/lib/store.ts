import { create } from 'zustand'
import { api, isStatic } from './api'
import type { AgentNode, DataStatus, LaunchPreflight, NodeRuntime, NodeStatus, SseEvent, SwarmGraph, TickerSummary, Usage } from './types'

const RUN_EVENT_TYPES = ['run-started', 'agent-started', 'agent-done', 'agent-failed', 'layer-advanced', 'module-done', 'cost-tick', 'run-done', 'run-error']

let runSource: EventSource | null = null
let dataSource: EventSource | null = null
let bloomTimer: any = null
let reconnectTimer: any = null
let creditProbed = false

export interface StreamRow { key: string; name: string; module: string; layer: number; status: NodeStatus; verdict?: string | null; ts: number }
export interface ActiveRun { runId: string; kind: string; module?: string; agent?: string; status: string; costUsd?: number; willCommitToMain?: boolean }
export interface Toast { msg: string; tone: 'info' | 'good' | 'bad' }

interface State {
  connected: boolean
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
  activeRun: ActiveRun | null
  runStream: StreamRow[]
  coreBloom: boolean
  decision: any | null
  runRoot: string | null
  reports: { memo: boolean; thesis: boolean; dossier: boolean }
  openOutput: { path: string; title: string; verdict?: string | null } | null
  selectedNodeKey: string | null
  launchConfirm: { preflight: LaunchPreflight } | null
  toast: Toast | null

  init: () => Promise<void>
  selectTicker: (t: string) => Promise<void>
  refreshData: () => Promise<void>
  checkCredit: () => Promise<void>
  selectNode: (key: string | null) => void
  nodeStatus: (key: string) => NodeStatus
  launchAgent: (node: AgentNode) => Promise<void>
  launchModule: (module: string) => Promise<void>
  requestFull: () => Promise<void>
  confirmFull: () => Promise<void>
  cancelLaunch: () => void
  cancelRun: () => Promise<void>
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
  activeRun: null,
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
    set({ selectedTicker: t, dataStatus: null, nodeRuntime: {}, decision: null, runRoot: null, reports: { memo: false, thesis: false, dossier: false }, coreBloom: false, selectedNodeKey: null, runStream: [], activeRun: null })
    const graph = await api.swarm(t)
    set({ graph, nodesByKey: flatten(graph) })
    await get().refreshData()
    // seed prior-run results into the swarm
    try {
      const manifest = await api.runManifest(t)
      const seed: Record<string, NodeRuntime> = {}
      for (const [mod, agents] of Object.entries<any>(manifest.modules || {})) {
        for (const a of agents) seed[a.agentKey] = { status: 'done', verdict: a.verdict, outputPath: `${manifest.runRoot}/${a.agentKey}.md` }
      }
      if (manifest.finalThesis) seed['master/synthesizer'] = { status: 'done', outputPath: `${manifest.runRoot}/final_thesis.md` }
      set({ nodeRuntime: seed, runRoot: manifest.runRoot ?? null, reports: { memo: !!manifest.memo, thesis: !!manifest.finalThesis, dossier: !!manifest.fullDossier } })
    } catch {}
    try {
      const decision = await api.decision(t)
      set({ decision })
    } catch {
      set({ decision: null })
    }
  },

  refreshData: async () => {
    const t = get().selectedTicker
    if (!t) return
    try {
      const dataStatus = await api.dataStatus(t)
      set({ dataStatus })
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

  launchAgent: async (node) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — runs happen on your machine via npm run dev', tone: 'info' })
    const t = get().selectedTicker
    if (!t || get().activeRun) return
    if (!node.soloRunnable) {
      get().setToast({ msg: `${node.name} needs upstream — run the module first`, tone: 'info' })
      return
    }
    try {
      const { runId } = await api.launch({ kind: 'agent', ticker: t, module: node.module, agent: node.name })
      beginRun(set, get, runId, { kind: 'agent', module: node.module, agent: node.name, willCommitToMain: false }, [node.key])
      get().setToast({ msg: `Launched ${node.name} on ${t}`, tone: 'good' })
    } catch (e: any) {
      get().setToast({ msg: `Launch failed: ${e?.message || e}`, tone: 'bad' })
    }
  },

  launchModule: async (module) => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — runs happen on your machine via npm run dev', tone: 'info' })
    const t = get().selectedTicker
    if (!t || get().activeRun) return
    const planned = [...get().nodesByKey.values()].filter((n) => n.module === module).map((n) => n.key)
    try {
      const { runId } = await api.launch({ kind: 'module', ticker: t, module })
      beginRun(set, get, runId, { kind: 'module', module, willCommitToMain: true }, planned)
      get().setToast({ msg: `Launched ${module} module on ${t}`, tone: 'good' })
    } catch (e: any) {
      get().setToast({ msg: `Launch failed: ${e?.message || e}`, tone: 'bad' })
    }
  },

  requestFull: async () => {
    if (get().staticMode) return get().setToast({ msg: 'Read-only showcase — a full run executes on your machine via npm run dev', tone: 'info' })
    const t = get().selectedTicker
    if (!t || get().activeRun) return
    const preflight = await api.estimate('full', t)
    set({ launchConfirm: { preflight } })
  },

  confirmFull: async () => {
    const t = get().selectedTicker
    if (!t) return
    set({ launchConfirm: null })
    const planned = [...get().nodesByKey.keys()]
    try {
      const { runId } = await api.launch({ kind: 'full', ticker: t, confirmTicker: t })
      beginRun(set, get, runId, { kind: 'full', willCommitToMain: true }, planned)
      get().setToast({ msg: `Launched full run on ${t}`, tone: 'good' })
    } catch (e: any) {
      get().setToast({ msg: `Launch failed: ${e?.message || e}`, tone: 'bad' })
    }
  },

  cancelLaunch: () => set({ launchConfirm: null }),

  cancelRun: async () => {
    const r = get().activeRun
    if (!r) return
    try {
      await api.cancel(r.runId)
    } catch {}
  },

  openOutputForNode: async (node) => {
    const rt = get().nodeRuntime[node.key]
    if (!rt?.outputPath) {
      get().setToast({ msg: `${node.name} has no output yet`, tone: 'info' })
      return
    }
    set({ openOutput: { path: rt.outputPath, title: node.name, verdict: rt.verdict } })
  },

  openThesis: async () => {
    const t = get().selectedTicker
    if (!t) return
    try {
      const res = await api.thesis(t)
      set({ openOutput: { path: res.path, title: `Investment Thesis — ${t}`, verdict: get().decision?.decision ?? null } })
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
    set({ openOutput: { path: `${runRoot}/${file}`, title, verdict: get().decision?.decision ?? null } })
  },

  closeOutput: () => set({ openOutput: null }),
  setToast: (t) => {
    set({ toast: t })
    if (t) setTimeout(() => { if (get().toast === t) set({ toast: null }) }, 3200)
  },

  _handleEvent: (e) => {
    const patch: Partial<State> = {}
    const rt = { ...get().nodeRuntime }
    const stream = get().runStream.slice()

    const upsertRow = (key: string, name: string, module: string, layer: number, status: NodeStatus, verdict?: string | null) => {
      const i = stream.findIndex((r) => r.key === key)
      const row: StreamRow = { key, name, module, layer, status, verdict, ts: Date.now() }
      if (i >= 0) stream[i] = row
      else stream.unshift(row)
    }

    switch (e.type) {
      case 'agent-started':
        rt[e.agentKey] = { ...rt[e.agentKey], status: 'running' }
        upsertRow(e.agentKey, e.name, e.module, e.layer, 'running')
        break
      case 'agent-done':
        rt[e.agentKey] = { status: 'done', verdict: e.verdict, outputPath: e.outputPath }
        upsertRow(e.agentKey, e.name, e.module, e.layer, 'done', e.verdict)
        break
      case 'agent-failed':
        rt[e.agentKey] = { ...rt[e.agentKey], status: 'failed' }
        upsertRow(e.agentKey, e.name, e.module, e.layer, 'failed')
        break
      case 'cost-tick':
        if (get().activeRun) patch.activeRun = { ...get().activeRun!, costUsd: e.costUsdSoFar ?? get().activeRun!.costUsd }
        // the run's own rate_limit_event already updated the server — pull the rich status
        if (e.rateLimit) api.credit().then((c) => set({ credit: c })).catch(() => {})
        break
      case 'run-done':
        if (get().activeRun) patch.activeRun = { ...get().activeRun!, status: 'done', costUsd: e.costUsd ?? get().activeRun!.costUsd }
        patch.coreBloom = true
        if (bloomTimer) clearTimeout(bloomTimer)
        bloomTimer = setTimeout(() => set({ coreBloom: false }), 4500)
        closeRunSource()
        if (get().selectedTicker) {
          api.decision(get().selectedTicker!).then((d) => set({ decision: d })).catch(() => {})
          api.runManifest(get().selectedTicker!).then((m) => {
            if (m.finalThesis) set({ nodeRuntime: { ...get().nodeRuntime, ['master/synthesizer']: { status: 'done', outputPath: `${m.runRoot}/final_thesis.md` } } })
            set({ runRoot: m.runRoot ?? get().runRoot, reports: { memo: !!m.memo, thesis: !!m.finalThesis, dossier: !!m.fullDossier } })
          }).catch(() => {})
        }
        get().setToast({ msg: 'Run complete', tone: 'good' })
        break
      case 'run-error':
        if (get().activeRun) patch.activeRun = { ...get().activeRun!, status: e.status }
        closeRunSource()
        get().setToast({ msg: e.reason === 'out_of_credits' ? 'Out of credits — run could not execute' : `Run ${e.status}: ${e.reason}`, tone: 'bad' })
        if (e.reason === 'out_of_credits') patch.credit = { ok: false, reason: 'out_of_credits', checked: true }
        break
    }
    patch.nodeRuntime = rt
    patch.runStream = stream
    set(patch)
  },
}))

function beginRun(set: any, get: () => State, runId: string, info: { kind: string; module?: string; agent?: string; willCommitToMain?: boolean }, plannedKeys: string[]) {
  const rt = { ...get().nodeRuntime }
  for (const k of plannedKeys) rt[k] = { status: 'queued' }
  if (info.kind === 'full') rt['master/synthesizer'] = { status: 'queued' }
  set({ activeRun: { runId, ...info, status: 'running' }, nodeRuntime: rt, runStream: [], coreBloom: false, selectedNodeKey: null })
  closeRunSource()
  runSource = new EventSource(api.runStreamUrl(runId))
  for (const t of RUN_EVENT_TYPES) {
    runSource.addEventListener(t, (ev: MessageEvent) => {
      try {
        get()._handleEvent(JSON.parse(ev.data))
      } catch {}
    })
  }
  runSource.onerror = () => { /* keep open; server may still be streaming */ }
}

function closeRunSource() {
  if (runSource) {
    runSource.close()
    runSource = null
  }
}
