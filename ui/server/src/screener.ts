import fs from 'node:fs'
import path from 'node:path'
import { DATA_DIR, NEWS, REPO_ROOT, STATE_DIR } from './config'
import { IN_FLIGHT_STATUSES, listRuns } from './registry'
import { listModuleNames } from './roster'
import { resolveInsideScreener } from './sandbox'
import { swarmById } from './swarms'
import { extractRouting, extractVerdict } from './verdict'
import { ideasHealthLivenessMs, readIdeasHealth } from './news/ideas/ideas-health'
import { projectLiveIdeas } from './news/ideas/ideas-projection'
import { buildQualifiedIdeasBoard } from './qualified-ideas-store'
import { buildSupplyChainBoard } from './supply-chain'
import { autoResumeDue } from './resume-policy'
import { readLastProviderSelection } from './execution-provenance'
import type { ProviderExecutionProfile, RunProvider } from './providers/types'

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
  // interrupted runs the cockpit can auto-resume (a partial gauntlet broken by a closed laptop /
  // dropped connection). Computed fresh from disk every fetch — the in-memory registry is wiped on
  // an engine restart, so the run folders are the only surviving truth.
  const resumable = listResumableSignals(new Set(live.map((r) => r.subjectId)))
  const liveIdeas = projectLiveIdeas(REPO_ROOT, index)
  // Runtime projections override any older generated-index copy. `ideas: []` alone cannot say whether
  // the news-lead pass succeeded, never ran, or failed; qualified_ideas is a separate full-research gate.
  return {
    ...index,
    ideas: liveIdeas.ideas,
    ideas_archive: liveIdeas.ideas_archive,
    ideas_scorecard: liveIdeas.scorecard,
    ideas_health: readIdeasHealth(
      STATE_DIR,
      REPO_ROOT,
      NEWS.ideasEnabled,
      Date.now(),
      ideasHealthLivenessMs(NEWS.pollIntervalMin * 60_000),
    ),
    qualified_ideas: buildQualifiedIdeasBoard(REPO_ROOT),
    // The chain lane: outside suppliers, customers, and distributors read out of the CIQ relationship
    // exports in each standing run's pool. Deterministic and free — no provider call, no ledger — so it
    // is recomputed here for the same reason qualified_ideas is, rather than cached into the index.
    supply_chain: buildSupplyChainBoard(REPO_ROOT),
    live,
    resumable,
  }
}

// A screener signal run is RESUMABLE when its folder shows a partial gauntlet that neither finished
// nor stopped on purpose. We classify from disk (no registry): a run is NOT resumable if the user
// aborted it (`.aborted` marker), if it was launched to deliberately STOP at a target module (`.target`
// marker — a `--until` partial the user means to continue manually, NOT an interruption; auto-resume
// can't honor the target, so resurrecting it would over-run past the deferred stop), if any module
// reached a TERMINAL routing (LOG / PARK / suppress / watchlist_* / return_to_m0_2 — a real, recorded
// outcome, not a breakage), or if it ran to the end (candidates.json written). Everything else that was
// launched (intake.json present) but is missing its final artifact is an interruption we can pick up —
// the gauntlet command skips the modules whose `99_*-synthesis.md` already exists, so a relaunch only
// runs the rest.
export interface ResumableSignal {
  sigId: string
  headline: string
  doneCount: number
  totalCount: number
  reason?: string
  resetsAt?: number
  autoResumeDue: boolean
  provider?: RunProvider
  executionProfile?: ProviderExecutionProfile
}

export function listResumableSignals(liveSubjectIds: Set<string>): ResumableSignal[] {
  const m = manifest()
  const tmpl = m.runRootTemplate || 'screener/runs/{signal_id}'
  const runsRel = tmpl.slice(0, tmpl.indexOf('{')).replace(/\/+$/, '') || 'screener/runs'
  const verdictField = m.routing?.verdictField || 'Routing'
  const terminal = new Set((m.routing?.terminal || []).map((s: string) => s.toLowerCase().trim()))
  let modules: string[] = []
  try {
    modules = listModuleNames('screener')
  } catch {
    /* no screener swarm graph yet */
  }
  let entries: string[] = []
  try {
    entries = fs.readdirSync(resolveInsideScreener(runsRel))
  } catch {
    return []
  }
  const synthesisPresent = (absRoot: string, mod: string): boolean => {
    try {
      return fs.statSync(path.join(absRoot, mod, `99_${mod}-synthesis.md`)).size > 0
    } catch {
      return false
    }
  }
  // any module file (the 00 intake gate OR the 99 synthesis) carrying a terminal routing = a real,
  // recorded stop, not a breakage. Reading only those two files per module keeps the scan cheap.
  const hitTerminal = (absRoot: string): boolean => {
    for (const mod of modules) {
      const dir = path.join(absRoot, mod)
      let files: string[] = []
      try {
        files = fs.readdirSync(dir).filter((f) => /^(00|99)_.*\.md$/.test(f))
      } catch {
        continue
      }
      for (const f of files) {
        try {
          const r = extractRouting(fs.readFileSync(path.join(dir, f), 'utf8'), verdictField)
          if (r && terminal.has(r.toLowerCase().trim())) return true
        } catch {
          /* unreadable file = ignore */
        }
      }
    }
    return false
  }
  const out: ResumableSignal[] = []
  for (const sigId of entries) {
    if (!/^SIG-/.test(sigId)) continue
    if (liveSubjectIds.has(sigId)) continue // currently running — not interrupted
    let absRoot: string
    try {
      absRoot = resolveInsideScreener(`${runsRel}/${sigId}`)
      if (!fs.statSync(absRoot).isDirectory()) continue
    } catch {
      continue
    }
    if (!fs.existsSync(path.join(absRoot, 'intake.json'))) continue // never actually launched
    if (fs.existsSync(path.join(absRoot, '.aborted'))) continue // user cancelled on purpose
    if (fs.existsSync(path.join(absRoot, '.target'))) continue // launched to STOP at a target (`--until`) — a deliberate partial, continued manually; never auto-resume (would over-run the deferred stop)
    if (fs.existsSync(path.join(absRoot, 'candidates.json'))) continue // ran to the end
    if (hitTerminal(absRoot)) continue // stopped at a gate — a valid outcome, not a breakage
    const doneCount = modules.filter((mod) => synthesisPresent(absRoot, mod)).length
    let headline = sigId
    try {
      headline = JSON.parse(fs.readFileSync(path.join(absRoot, 'intake.json'), 'utf8')).headline || sigId
    } catch {
      /* keep the id */
    }
    let pause: any = null
    try { pause = JSON.parse(fs.readFileSync(path.join(absRoot, '.interrupted'), 'utf8')) } catch { /* ordinary partial */ }
    const selection = readLastProviderSelection(`${runsRel}/${sigId}`)
    out.push({
      sigId, headline, doneCount, totalCount: modules.length,
      ...(typeof pause?.reason === 'string' ? { reason: pause.reason } : {}),
      ...(typeof pause?.resetsAt === 'number' ? { resetsAt: pause.resetsAt } : {}),
      ...(selection ? { provider: selection.provider, executionProfile: selection.executionProfile } : {}),
      autoResumeDue: Boolean(selection?.provider) && autoResumeDue(
        typeof pause?.reason === 'string' ? pause.reason : undefined,
        typeof pause?.resetsAt === 'number' ? pause.resetsAt : undefined,
      ),
    })
  }
  return out
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
    runMetadata: has('RUN_METADATA.md'), // the whole-run summary — offered as the top "Run summary" report when present
    intake: has('intake.json') ? readJson(`${runRoot}/intake.json`) : null,
    signalPayload: has('signal_payload.json') ? readJson(`${runRoot}/signal_payload.json`) : null,
    thesisRecord: has('thesis_record.json') ? readJson(`${runRoot}/thesis_record.json`) : null,
    candidates: has('candidates.json') ? readJson(`${runRoot}/candidates.json`) : null,
  }
}

export type SignalRunState = 'never' | 'running' | 'parked' | 'logged' | 'watchlist' | 'partial' | 'complete'
export interface SignalStateResult {
  sigId: string
  state: SignalRunState
  running: boolean
  runningModule?: string | null
  materiality?: number | null
  routing?: string | null
  locked?: boolean
  hasCandidates?: boolean
  doneModules?: string[]
}

/** Derive the run state of a signal (by its SIG-id) for the cockpit's "Run the checks" control — a pure
 *  READ over the run folder + the live-run registry, never a launch. `never` when no folder exists;
 *  `running` when a live screener run owns the id; otherwise terminal-vs-partial is decided from the SAME
 *  authoritative sources the sibling `listResumableSignals` uses — the swarm manifest's `routing.terminal`
 *  set (case-normalized, reused not re-encoded) plus `thesis_record.meta.status` — so the manual control and
 *  the auto-resume detector agree about every run:
 *    • PARK / LOG (signal-gate held it) → parked / logged — overridable.
 *    • locked AND candidates.json present → complete (ran to the end).
 *    • any other terminal verdict (suppress / watchlist_no_source / watchlist_no_world_change /
 *      return_to_m0_2 / watchlist_no_edge) on the payload routing, the thesis status, OR any recorded module
 *      verdict → watchlist — a real, terminal rejection with nothing to continue.
 *    • everything else that PROMOTEd but is neither terminal nor complete (a `--until` stop-after, a locked
 *      provisional/full_machine still pending candidate-surfacing, or a break) → partial — resumable.
 *  Field names mirror the committed signal_payload.json / thesis_record.json schemas. */
export function deriveSignalState(sigId: string): SignalStateResult {
  // IN_FLIGHT_STATUSES (not the two literals 'starting'/'running') — the registry warns these statuses
  // drift, so a future screener readiness gate would otherwise read an at-gate run as not-running.
  const live = listRuns().find((r) => r.swarmId === 'screener' && r.subjectId === sigId && IN_FLIGHT_STATUSES.has(r.status))
  if (live) return { sigId, state: 'running', running: true, runningModule: (live as { module?: string }).module ?? null }

  let man: ReturnType<typeof screenerRunManifest>
  try {
    man = screenerRunManifest(sigId)
  } catch {
    return { sigId, state: 'never', running: false } // ENOENT (no folder) or unreadable → treat as never-run
  }

  const sp = man.signalPayload as { routing?: string; materiality_score?: number } | null
  const tr = man.thesisRecord as { meta?: { locked?: boolean; status?: string } } | null
  const routing0 = sp?.routing ?? null // PROMOTE | PARK | LOG | watchlist_no_source | suppress
  const status0 = tr?.meta?.status ?? null // provisional | full_machine | watchlist_no_edge | watchlist_no_world_change | …
  const materiality = typeof sp?.materiality_score === 'number' ? sp.materiality_score : null
  const locked = tr?.meta?.locked === true
  const hasCandidates = !!man.candidates
  // "module done" = a NON-EMPTY 99_ synthesis on disk — matches listResumableSignals' synthesisPresent.
  // (screenerRunManifest lists every NN_*.md regardless of size, so an empty/half-written synthesis from a
  // crash would otherwise over-count "Paused · N/M" and mis-target Continue-through.)
  const runAbs = resolveInsideScreener(man.runRoot)
  const doneModules = Object.keys(man.modules).filter((mod) => {
    try {
      return fs.statSync(path.join(runAbs, mod, `99_${mod}-synthesis.md`)).size > 0
    } catch {
      return false
    }
  })

  // the swarm's authoritative terminal verdict set (case-normalized), reused from the manifest exactly as
  // listResumableSignals does — never hardcoded literals, so a new terminal routing added to SWARM.md is
  // honored here automatically. Falls back to the known set only if the manifest can't be read.
  const norm = (v: string | null | undefined) => (v || '').toLowerCase().trim()
  let terminal: Set<string>
  try {
    terminal = new Set((manifest().routing?.terminal || []).map((s: string) => s.toLowerCase().trim()))
  } catch {
    terminal = new Set(['log', 'park', 'suppress', 'watchlist_no_source', 'watchlist_no_world_change', 'return_to_m0_2', 'watchlist_no_edge'])
  }
  const isTerminal = (v: string | null | undefined) => !!norm(v) && terminal.has(norm(v))
  // also scan every recorded module verdict (mirrors listResumableSignals' hitTerminal, off the parsed
  // manifest) — catches a terminal Gate-0 stop that short-circuited before signal_payload.json was written.
  const hitTerminal = Object.values(man.modules).some((agents) => agents.some((a) => isTerminal(a.routing)))
  // The GATE's own terminal verdict (PARK/LOG) is preserved on disk by design even when a human explicitly
  // overrode it and ran on — signal_payload.routing keeps the original gate call (see the override note
  // below). So once a thesis is LOCKED (which only happens past the gate), that verdict is spent, not live:
  // counting it would read a finished override run as 'watchlist' and strip its Continue. A terminal verdict
  // whose value DIFFERS from the recorded gate call is therefore the only genuine post-lock rejection (e.g.
  // thesis-integrity's watchlist_integrity_*). Compared by VALUE, not module name, so this stays §26-generic.
  const hitTerminalPostGate = Object.values(man.modules).some((agents) =>
    agents.some((a) => isTerminal(a.routing) && norm(a.routing) !== norm(routing0)))

  // Check COMPLETION/progress before the gate routing: a locked thesis means the run progressed past the
  // gate — including a human override of a PARK/LOG (signal_payload.routing still records the original gate
  // verdict, so a gate-first test would wrongly show 'parked'/'logged' for a finished override run).
  let state: SignalRunState
  // A terminal MODULE verdict wins first — even over candidate presence. thesis-integrity red-teams the
  // record post-lock and can record its OWN terminal routing (watchlist_integrity_downgrade /
  // watchlist_integrity_broken) WITHOUT ever touching thesis_record.json (meta stays locked at
  // provisional/full_machine). That review is append-only and can be re-run AFTER candidate-surfacing already
  // wrote candidates.json (the module writes _v2/_v3 on reruns); testing `locked && hasCandidates` first would
  // then read a since-broken thesis as 'complete' and keep offering its now-stale shortlist. hitTerminal scans
  // every recorded module verdict generically (no module names hardcoded — it reads SWARM.md's routing.terminal
  // set); a healthy completed run carries no terminal module verdict, so this never swallows a real 'complete'.
  if (locked && hitTerminalPostGate) state = 'watchlist'
  else if (locked && hasCandidates) state = 'complete' // ran to the end, candidates surfaced, none rejected
  // A terminal THESIS status means the run progressed past Gate 0 and then dead-ended downstream — even when
  // signal_payload.routing still records the original PARK/LOG (a human override runs on past the gate, and a
  // thesis-structure terminal like watchlist_no_world_change / return_to_m0_2 is written with locked:false).
  // Check this BEFORE the gate holds below, or such a run would read 'parked'/'logged' and offer a useless
  // override that just stops at the same thesis gate. (Gate-level PARK/LOG stay AFTER — they are themselves in
  // the terminal set, so testing routing0/hitTerminal here would swallow a genuine Gate-0 hold into watchlist.)
  else if (isTerminal(status0)) state = 'watchlist'
  else if (locked) state = 'partial' // locked provisional/full_machine, candidate-surfacing still pending — resumable
  else if (norm(routing0) === 'park') state = 'parked' // held AT Gate 0, no downstream thesis (materiality 40–69) — override to run
  else if (norm(routing0) === 'log') state = 'logged' // held AT Gate 0, no downstream thesis (<40) — override to run
  else if (isTerminal(routing0) || hitTerminal) state = 'watchlist' // a Gate-0 terminal with no thesis (suppress / watchlist_no_source) or a terminal module verdict — no Continue
  else state = 'partial' // PROMOTEd, neither terminal nor complete — a stop-after, mid-run, or break (resumable)

  return { sigId, state, running: false, materiality, routing: status0 ?? routing0, locked, hasCandidates, doneModules }
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

/** The display label for one event-ledger record: the cleaned primary issuer, else the event headline.
 *  Exported + pure so a test locks the field name — the ledger names issuers under `issuers` (per the
 *  signal-gate synthesis schema); reading `primary_issuers` (which lives only in signal_payload.json,
 *  nested under entities) always missed and silently fell back to the raw, often-truncated headline. */
export function subjectLabelFromEvent(d: any): string {
  return cleanIssuer((d?.issuers || [])[0]) || (typeof d?.headline === 'string' ? d.headline.trim() : '')
}

/** Build the `signal_id -> best display label` map from the raw events.ndjson text. Pure + exported so a
 *  test can exercise the multi-line-per-signal path: a signal accrues several ledger lines, and the common
 *  shape is that the FIRST names the issuer while later corrections carry only a headline. A named-issuer
 *  label must NOT be clobbered by a later headline-only line (the bug this fixes); among same-quality
 *  labels the later (richer / corrected) line still wins. */
export function subjectLabelsFromLedger(text: string): Map<string, string> {
  const map = new Map<string, string>()
  const fromIssuer = new Set<string>() // signal_ids whose current label came from a NAMED issuer
  for (const ln of text.split('\n')) {
    const t = ln.trim()
    if (!t) continue
    let d: any
    try {
      d = JSON.parse(t)
    } catch {
      continue
    }
    if (!d?.signal_id) continue
    const issuer = cleanIssuer((d.issuers || [])[0])
    const label = issuer || (typeof d.headline === 'string' ? d.headline.trim() : '')
    if (!label) continue
    if (issuer) {
      map.set(d.signal_id, label) // a named issuer is the best label and locks it against later headline-only lines
      fromIssuer.add(d.signal_id)
    } else if (!fromIssuer.has(d.signal_id)) {
      map.set(d.signal_id, label) // headline fallback — only while no issuer line has been seen for this signal
    }
  }
  return map
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
  let map: Map<string, string>
  try {
    map = subjectLabelsFromLedger(fs.readFileSync(real, 'utf8'))
  } catch {
    map = new Map() // unreadable ledger = empty map
  }
  _sigLabelCache = { key, map }
  return map
}
