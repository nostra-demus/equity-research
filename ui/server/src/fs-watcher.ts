import chokidar from 'chokidar'
import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR, REPO_ROOT } from './config'
import { emit, type RunState } from './registry'
import { swarmById } from './swarms'
import { extractRouting, extractTriageStatus, extractVerdict } from './verdict'

function maybeLayerAdvanced(run: RunState, module: string, layer: number) {
  const expectedInLayer = [...run.expected.values()].filter((e) => e.module === module && e.layer === layer)
  if (!expectedInLayer.length) return
  const doneInLayer = expectedInLayer.filter((e) => run.agents.get(e.key)?.status === 'done')
  if (doneInLayer.length === expectedInLayer.length) {
    emit(run, { type: 'layer-advanced', runId: run.runId, module, toLayer: layer + 1, doneCount: doneInLayer.length, expectedCount: expectedInLayer.length, ts: Date.now() })
  }
}

function markDone(run: RunState, key: string, module: string, name: string, layer: number, outputPath: string, verdict: string | null, bytes: number) {
  const a = run.agents.get(key) || { key, module, name, layer, status: 'running' as const }
  if (a.status === 'done') return false
  a.status = 'done'
  a.verdict = verdict || undefined
  a.outputPath = outputPath
  run.agents.set(key, a)
  emit(run, { type: 'agent-done', runId: run.runId, agentKey: key, module, name, layer, outputPath, verdict, bytes, ts: Date.now() })
  return true
}

// Swarm routing contract: a synthesis (or terminal Layer-0 gate) ends with a labelled Routing line.
// Emits `module-routed`; a terminal route also closes the module as 'aborted' for the gate case so
// the cockpit shows the stop — research runs (no manifest routing) never enter this path.
function maybeEmitRouting(run: RunState, module: string, content: string, isTriage: boolean): { terminal: boolean } {
  const manifest = swarmById(run.swarmId)
  const contract = manifest?.routing
  if (!contract) return { terminal: false }
  const route = extractRouting(content, contract.verdictField)
  if (!route) return { terminal: false }
  const terminal = contract.terminal.some((t) => t.toLowerCase() === route.toLowerCase())
  // "Next module:" is part of the same Routing block; surface it when present and not "none"
  const next = extractRouting(content, 'Next module')
  emit(run, {
    type: 'module-routed',
    runId: run.runId,
    module,
    route,
    terminal,
    nextModule: next && !/^none\b/i.test(next) ? next : null,
    ts: Date.now(),
  })
  return { terminal }
}

// Run-root-prefix matcher (path-shape agnostic): a file belongs to a run iff it sits inside the
// run's resolved runRoot. Research folders (analyses/<T>_<D>/…) and swarm folders
// (screener/runs/<SIG>/…) flow through the SAME logic; emitted output paths are always
// `<runRoot>/…`, which for research is byte-identical to the old `analyses/<folder>/…` shape.
export function handleFile(run: RunState, fp: string) {
  if (!run.runRoot) return
  let rel: string
  try {
    rel = path.relative(REPO_ROOT, fp)
  } catch {
    return
  }
  if (rel.startsWith('..')) return
  // Strict: only files inside THIS run's resolved folder count. runRoot is concrete at launch for
  // every kind, so two same-subject runs sharing a folder are still disambiguated by the
  // expected-set check below, and an agent/rerun bound to a different folder never steals events.
  if (!(rel === run.runRoot || rel.startsWith(run.runRoot + path.sep))) return
  const inside = rel.slice(run.runRoot.length + 1)
  const parts = inside.split(path.sep)

  // master synthesizer output (research full runs): <runRoot>/final_thesis.md
  if (parts.length === 1 && parts[0] === 'final_thesis.md') {
    let content = ''
    let bytes = 0
    try {
      content = fs.readFileSync(fp, 'utf8')
      bytes = Buffer.byteLength(content)
    } catch {
      return
    }
    markDone(run, 'master/synthesizer', 'master', 'synthesizer', 99, `${run.runRoot}/final_thesis.md`, extractVerdict(content) || 'Final thesis written', bytes)
    return
  }

  if (parts.length !== 2 || !parts[1].endsWith('.md')) return
  const module = parts[0]
  const base = parts[1].replace(/\.md$/, '')
  const key = `${module}/${base}`
  const expected = run.expected.get(key)
  if (!expected) return // not part of this run

  let content = ''
  let bytes = 0
  try {
    content = fs.readFileSync(fp, 'utf8')
    bytes = Buffer.byteLength(content)
  } catch {
    return
  }
  if (bytes < 40) return // half-written / placeholder

  const isTriage = base.startsWith('00_')
  const isSynthesis = base.startsWith('99_')
  let verdict = extractVerdict(content)
  let aborted = false
  if (isTriage) {
    const status = extractTriageStatus(content)
    if (!verdict && status) verdict = `Data ${status}`
    if (status === 'Insufficient') aborted = true
  }

  const changed = markDone(run, key, module, expected.name, expected.layer, `${run.runRoot}/${module}/${base}.md`, verdict, bytes)
  if (!changed) return

  // swarm routing contract (gates + syntheses) — research runs no-op here
  if (isTriage || isSynthesis) {
    const routed = maybeEmitRouting(run, module, content, isTriage)
    if (routed.terminal && isTriage) {
      emit(run, { type: 'module-done', runId: run.runId, module, status: 'aborted', reason: 'routing:terminal', verdict, ts: Date.now() })
      return
    }
  }

  if (isTriage && aborted) {
    emit(run, { type: 'module-done', runId: run.runId, module, status: 'aborted', reason: 'fail_fast:insufficient_data', verdict, ts: Date.now() })
    return
  }
  maybeLayerAdvanced(run, module, expected.layer)
  if (isSynthesis) {
    emit(run, { type: 'module-done', runId: run.runId, module, status: 'completed', verdict, ts: Date.now() })
  }
}

// End-of-run sweep: deterministically re-check every expected output on disk and dispatch any the
// watcher missed. chokidar's awaitWriteFinish holds events ~500ms — an agent that writes its file
// moments before the process exits can otherwise lose its event and strand the orb at queued/running
// while the run reports done. Called by the launcher just before it finalizes a run. Idempotent
// (markDone ignores already-done orbs).
export function sweepRunOutputs(run: RunState) {
  if (!run.runRoot) return
  for (const e of run.expected.values()) {
    const a = run.agents.get(e.key)
    if (a?.status === 'done') continue
    const abs = path.join(REPO_ROOT, run.runRoot, e.outputRel)
    try {
      if (fs.existsSync(abs)) handleFile(run, abs)
    } catch {
      /* sweep is best-effort */
    }
  }
}

// ONE shared chokidar watcher PER WATCH ROOT dispatches to every active run — not one full-tree
// watcher per run. With N concurrent runs that's one OS watcher per root (analyses/ for research,
// each swarm's runs root), not N. Each run's handleFile still binds strictly to its own runRoot +
// expected-set, so a file event never crosses into another run. (Watching the always-present root
// is more robust than scoping to each run's subtree, since a run's folder may not exist at launch.)
const activeRuns = new Set<RunState>()
const watchers = new Map<string, ReturnType<typeof chokidar.watch>>() // absolute root -> watcher

function dispatch(fp: string) {
  for (const run of activeRuns) {
    try {
      handleFile(run, fp)
    } catch {
      /* ignore watcher errors */
    }
  }
}

// The absolute directory to watch for a run: the parent that holds its run folders.
function watchRootForRun(run: RunState): string {
  const manifest = swarmById(run.swarmId)
  if (manifest && manifest.id !== 'research') {
    const root = path.join(REPO_ROOT, manifest.runsRoot)
    // sweep/handoff runs write inbox/ledger/board rather than a run folder — watch the swarm's
    // top-level store so their (non-expected) writes still keep the watcher harmless and cheap.
    return fs.existsSync(root) ? root : path.join(REPO_ROOT, path.dirname(manifest.runsRoot))
  }
  return ANALYSES_DIR
}

export function startRunWatcher(run: RunState) {
  activeRuns.add(run)
  const root = watchRootForRun(run)
  if (!watchers.has(root)) {
    const w = chokidar.watch(root, {
      ignoreInitial: true,
      depth: 3,
      awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
    })
    w.on('add', dispatch)
    w.on('change', dispatch)
    watchers.set(root, w)
  }
  // finishRun() calls this; drop the run from dispatch and close a root's watcher once idle.
  run.closeWatcher = () => {
    activeRuns.delete(run)
    const stillNeeded = new Set([...activeRuns].map((r) => watchRootForRun(r)))
    for (const [r, w] of watchers) {
      if (!stillNeeded.has(r)) {
        void w.close()
        watchers.delete(r)
      }
    }
  }
}
