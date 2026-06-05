import chokidar from 'chokidar'
import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR, REPO_ROOT } from './config'
import { emit, type RunState } from './registry'
import { extractTriageStatus, extractVerdict } from './verdict'

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

export function handleFile(run: RunState, fp: string) {
  let rel: string
  try {
    rel = path.relative(REPO_ROOT, fp)
  } catch {
    return
  }
  const parts = rel.split(path.sep)
  if (parts[0] !== 'analyses') return
  const folder = parts[1]
  // Strict: only files inside THIS run's resolved folder count. runRoot is concrete at launch for
  // every kind, so two same-ticker runs sharing today's folder are still disambiguated by the
  // expected-set check below, and an agent/rerun bound to a different folder never steals events.
  if (!folder || run.runRoot !== `analyses/${folder}`) return

  // master synthesizer output (full runs): analyses/<t>_<d>/final_thesis.md
  if (parts.length === 3 && parts[2] === 'final_thesis.md') {
    let content = ''
    let bytes = 0
    try {
      content = fs.readFileSync(fp, 'utf8')
      bytes = Buffer.byteLength(content)
    } catch {
      return
    }
    markDone(run, 'master/synthesizer', 'master', 'synthesizer', 99, `analyses/${folder}/final_thesis.md`, extractVerdict(content) || 'Final thesis written', bytes)
    return
  }

  if (parts.length !== 4 || !parts[3].endsWith('.md')) return
  const module = parts[2]
  const base = parts[3].replace(/\.md$/, '')
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

  const changed = markDone(run, key, module, expected.name, expected.layer, `analyses/${folder}/${module}/${base}.md`, verdict, bytes)
  if (!changed) return

  if (isTriage && aborted) {
    emit(run, { type: 'module-done', runId: run.runId, module, status: 'aborted', reason: 'fail_fast:insufficient_data', verdict, ts: Date.now() })
    return
  }
  maybeLayerAdvanced(run, module, expected.layer)
  if (isSynthesis) {
    emit(run, { type: 'module-done', runId: run.runId, module, status: 'completed', verdict, ts: Date.now() })
  }
}

// ONE shared chokidar watcher over ANALYSES_DIR dispatches to every active run — not one full-tree
// watcher per run. With N concurrent runs that's 1 OS watcher, not N. Each run's handleFile still
// binds strictly to its own runRoot + expected-set, so a file event never crosses into another run.
// (Watching the always-present ANALYSES_DIR is more robust than scoping to each run's subtree, since
// a module/full run's dated folder doesn't exist yet at launch.)
const activeRuns = new Set<RunState>()
let sharedWatcher: ReturnType<typeof chokidar.watch> | null = null

function dispatch(fp: string) {
  for (const run of activeRuns) {
    try {
      handleFile(run, fp)
    } catch {
      /* ignore watcher errors */
    }
  }
}

export function startRunWatcher(run: RunState) {
  activeRuns.add(run)
  if (!sharedWatcher) {
    sharedWatcher = chokidar.watch(ANALYSES_DIR, {
      ignoreInitial: true,
      depth: 3,
      awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
    })
    sharedWatcher.on('add', dispatch)
    sharedWatcher.on('change', dispatch)
  }
  // finishRun() calls this; drop the run from dispatch and close the shared watcher once idle.
  run.closeWatcher = () => {
    activeRuns.delete(run)
    if (activeRuns.size === 0 && sharedWatcher) {
      void sharedWatcher.close()
      sharedWatcher = null
    }
  }
}
