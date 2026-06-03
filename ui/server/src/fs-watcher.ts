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

function handleFile(run: RunState, fp: string) {
  let rel: string
  try {
    rel = path.relative(REPO_ROOT, fp)
  } catch {
    return
  }
  const parts = rel.split(path.sep)
  if (parts[0] !== 'analyses') return
  const folder = parts[1]
  if (!folder || !folder.startsWith(run.ticker + '_')) return
  if (!run.runRoot) run.runRoot = `analyses/${folder}`

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

  const changed = markDone(run, key, module, expected.name, expected.layer, `analyses/${folder}/${base}.md`, verdict, bytes)
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

export function startRunWatcher(run: RunState) {
  const watcher = chokidar.watch(ANALYSES_DIR, {
    ignoreInitial: true,
    depth: 3,
    awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
  })
  const onFile = (fp: string) => {
    try {
      handleFile(run, fp)
    } catch {
      /* ignore watcher errors */
    }
  }
  watcher.on('add', onFile)
  watcher.on('change', onFile)
  run.closeWatcher = () => watcher.close()
}
