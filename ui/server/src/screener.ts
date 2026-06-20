import fs from 'node:fs'
import path from 'node:path'
import { DATA_DIR, REPO_ROOT } from './config'
import { listRuns } from './registry'
import { resolveInsideScreener } from './sandbox'
import { swarmById } from './swarms'
import { extractRouting, extractVerdict } from './verdict'

// Read-only API surface over the screener swarm's canonical stores. Every path is derived from the
// SWARM.md manifest (never hardcoded beyond the swarm id this API is named for) and sandboxed to
// the screener/ tree. State comes from the BOARD INDEX + ledger files — agent prose is read only
// to render a specific report the user opened.

function manifest() {
  const m = swarmById('screener')
  if (!m) throw Object.assign(new Error('screener swarm not installed (.claude/agents/screener/SWARM.md missing)'), { statusCode: 404 })
  return m
}

function readJson(absOrRel: string): any {
  const real = resolveInsideScreener(absOrRel)
  return JSON.parse(fs.readFileSync(real, 'utf8'))
}

// The board: the canonical index file + live in-flight screener runs merged in, so the cockpit
// shows a signal as "in gauntlet" the moment it launches (the index only updates on module ends).
export function screenerBoard() {
  const m = manifest()
  let index: any = { generated_at: null, inbox: [], signals: [], theses: [], handoffs: [], counts: {} }
  try {
    if (m.boardIndex) index = readJson(m.boardIndex)
  } catch {
    /* missing board index = empty board, not an error */
  }
  const live = listRuns()
    .filter((r) => r.swarmId === 'screener' && (r.status === 'starting' || r.status === 'running'))
    .map((r) => ({ runId: r.runId, kind: r.kind, subjectId: r.subjectId, runRoot: r.runRoot, startedAt: r.startedAt }))
  return { ...index, live }
}

export function readThesis(thesisId: string) {
  const m = manifest()
  const ledger = m.ledgerRoot || 'screener/ledger'
  return readJson(`${ledger}/theses/${thesisId}.json`)
}

export function readCandidates(thesisId: string) {
  const m = manifest()
  const ledger = m.ledgerRoot || 'screener/ledger'
  return readJson(`${ledger}/candidates/${thesisId}.json`)
}

export function readHandoffs(thesisId?: string) {
  const m = manifest()
  const ledger = m.ledgerRoot || 'screener/ledger'
  let lines: string[] = []
  try {
    const real = resolveInsideScreener(`${ledger}/handoffs.ndjson`)
    lines = fs.readFileSync(real, 'utf8').split('\n')
  } catch {
    return []
  }
  const out: any[] = []
  for (const ln of lines) {
    const t = ln.trim()
    if (!t) continue
    try {
      const obj = JSON.parse(t)
      if (!thesisId || obj.thesis_id === thesisId) out.push(obj)
    } catch {}
  }
  return out
}

// Phase 3 conviction loop: the per-thesis live-book detail — the current snapshot, the full dated
// checkpoint calendar, and the tick history (validations + moves). Read-only; powers the card's
// checkpoint timeline + "why it moved". Missing files = empty (the loop is additive).
export function readConviction(thesisId: string) {
  const m = manifest()
  const conv = `${m.ledgerRoot || 'screener/ledger'}/conviction`
  const readLines = (rel: string): any[] => {
    try {
      return fs.readFileSync(resolveInsideScreener(rel), 'utf8').split('\n').map((l) => l.trim()).filter(Boolean)
        .map((l) => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean)
    } catch {
      return []
    }
  }
  let state: any = null
  try {
    state = readJson(`${conv}/conviction_state/${thesisId}.json`)
  } catch {
    /* not seeded yet */
  }
  return {
    state,
    checkpoints: readLines(`${conv}/checkpoints.ndjson`).filter((c) => c.thesis_id === thesisId),
    events: readLines(`${conv}/conviction.ndjson`).filter((r) => r.thesis_id === thesisId),
  }
}

// The latest conviction track record (from /screener:calibrate). Null until one has been written.
export function readConvictionCalibration() {
  const conv = `${manifest().ledgerRoot || 'screener/ledger'}/conviction`
  try {
    const dir = resolveInsideScreener(conv)
    const files = fs.readdirSync(dir).filter((f) => /_conviction_calibration\.json$/.test(f)).sort()
    return files.length ? readJson(`${conv}/${files[files.length - 1]}`) : null
  } catch {
    return null
  }
}

// A screener run folder's manifest: module outputs + per-file verdict/routing + run-root artifacts.
// Mirrors outputs.runManifest but lives in the screener sandbox.
export function screenerRunManifest(sigId: string) {
  const m = manifest()
  const runRoot = m.runRootTemplate.replace(`{${m.placeholder}}`, sigId)
  const abs = resolveInsideScreener(runRoot)
  const modules: Record<string, { agentKey: string; name: string; verdict: string | null; routing: string | null }[]> = {}
  for (const entry of fs.readdirSync(abs)) {
    const sub = path.join(abs, entry)
    let isDir = false
    try {
      isDir = fs.statSync(sub).isDirectory()
    } catch {}
    if (!isDir) continue
    const files = fs.readdirSync(sub).filter((f) => /^[0-9]{2}_.*\.md$/.test(f)).sort()
    modules[entry] = files.map((f) => {
      const base = f.replace(/\.md$/, '')
      let verdict: string | null = null
      let routing: string | null = null
      try {
        const content = fs.readFileSync(path.join(sub, f), 'utf8')
        verdict = extractVerdict(content)
        if (m.routing) routing = extractRouting(content, m.routing.verdictField)
      } catch {}
      return { agentKey: `${entry}/${base}`, name: base.slice(3), verdict, routing }
    })
  }
  const has = (f: string) => fs.existsSync(path.join(abs, f))
  return {
    runRoot,
    modules,
    intake: has('intake.json') ? readJson(`${runRoot}/intake.json`) : null,
    signalPayload: has('signal_payload.json') ? readJson(`${runRoot}/signal_payload.json`) : null,
    thesisRecord: has('thesis_record.json') ? readJson(`${runRoot}/thesis_record.json`) : null,
    candidates: has('candidates.json') ? readJson(`${runRoot}/candidates.json`) : null,
  }
}

// A screener markdown output (for the cockpit's reader panel) — sandboxed to screener/.
export function readScreenerMarkdown(relPath: string): { path: string; markdown: string } {
  if (!relPath.endsWith('.md')) throw new Error('only .md outputs are served')
  const real = resolveInsideScreener(relPath)
  return { path: relPath, markdown: fs.readFileSync(real, 'utf8') }
}

// Does a ticker have a data pool (drives the candidate card's "pool present" dot)?
export function dataPoolPresent(ticker: string): boolean {
  try {
    const dir = path.join(DATA_DIR, ticker)
    return fs.existsSync(dir) && fs.readdirSync(dir).length > 0
  } catch {
    return false
  }
}

// Resolve the screener run root (repo-relative) for a signal id; null when it doesn't exist.
export function screenerRunRoot(sigId: string): string | null {
  const m = manifest()
  const rel = m.runRootTemplate.replace(`{${m.placeholder}}`, sigId)
  return fs.existsSync(path.join(REPO_ROOT, rel)) ? rel : null
}

// Drop a trailing "(Exchange: TICKER)" qualifier so the table shows the company name, not the listing
// (e.g. "Schneider Electric SE (Euronext Paris: SU)" -> "Schneider Electric SE").
function cleanIssuer(s: unknown): string | undefined {
  if (typeof s !== 'string') return undefined
  const t = s.replace(/\s*\([^)]*\)\s*$/, '').trim()
  return t || undefined
}

// Map every signal id the engine has processed -> the company/headline it concerns, for the activity
// log's Company column (which otherwise shows the opaque SIG-… subject id). Source: the swarm's
// append-only event ledger (named issuer when present, else the event headline). Cached by ledger
// mtime+size — the file is small but the activity log polls every 15s. Pure read; never throws (a
// missing ledger just yields an empty map, so the column falls back to the raw subject id).
let _sigLabelCache: { key: string; map: Map<string, string> } | null = null
export function screenerSubjectLabels(): Map<string, string> {
  const m = swarmById('screener')
  if (!m) return new Map()
  const ledgerRel = `${m.ledgerRoot || 'screener/ledger'}/events.ndjson`
  let real: string
  try {
    real = resolveInsideScreener(ledgerRel)
  } catch {
    return new Map()
  }
  let key: string
  try {
    const st = fs.statSync(real)
    key = `${st.mtimeMs}:${st.size}`
  } catch {
    return new Map() // no ledger yet
  }
  if (_sigLabelCache && _sigLabelCache.key === key) return _sigLabelCache.map
  const map = new Map<string, string>()
  try {
    for (const ln of fs.readFileSync(real, 'utf8').split('\n')) {
      const t = ln.trim()
      if (!t) continue
      let d: any
      try {
        d = JSON.parse(t)
      } catch {
        continue
      }
      if (!d?.signal_id) continue
      const label = cleanIssuer((d.primary_issuers || [])[0]) || (typeof d.headline === 'string' ? d.headline.trim() : '')
      if (label) map.set(d.signal_id, label) // later lines (richer / corrected) win; empty labels never overwrite
    }
  } catch {
    /* unreadable ledger = empty map */
  }
  _sigLabelCache = { key, map }
  return map
}
