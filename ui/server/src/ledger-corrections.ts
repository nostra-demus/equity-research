// The server-side mirror of scripts/ledger_records.py — the append-only decision-record correction
// layer (frameworks/DECISION_LEDGER.md §4a). Decision records are immutable; a sibling append-only
// `corrections.json` records supersession + field errata, and every reader resolves records THROUGH
// this module so the corrected board is consistent across the Python commands (track/calibrate/size)
// and the live cockpit (GET /api/calls). The transform semantics here MUST match ledger_records.py
// (a shared fixture — test/ledger-corrections.test.ts — locks them together).
import fs from 'node:fs'
import path from 'node:path'
import { ANALYSES_DIR } from './config'

export const CORRECTIONS_SCHEMA = 'corrections/v1'

interface Erratum {
  field: string
  kind: string
  reason?: string
  evidence?: string
}
interface Corrections {
  schema?: string
  superseded_by?: { run_root?: string; reason?: string; date?: string }
  errata?: Erratum[]
}

// Parsed, schema-checked corrections sidecar for an ABSOLUTE run dir, or {} when absent/invalid.
// Absence never changes a record (fail toward the frozen original).
export function readCorrections(runDirAbs: string): Corrections {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(runDirAbs, 'corrections.json'), 'utf8'))
    if (data && typeof data === 'object' && data.schema === CORRECTIONS_SCHEMA) return data
  } catch {
    /* missing / malformed → no corrections */
  }
  return {}
}

// The run_root this record is superseded by (non-empty string) or null.
export function supersededTarget(c: Corrections): string | null {
  const rr = c.superseded_by?.run_root
  return typeof rr === 'string' && rr.trim() ? rr.trim() : null
}

function scaleFix(record: any, field: string) {
  const bumpProb = (o: any) => {
    if (o && typeof o.probability === 'number' && o.probability > 0 && o.probability <= 1) {
      o.probability = Math.round(o.probability * 100 * 1e6) / 1e6
    }
  }
  if (field === 'forecast_ledger[].probability' && Array.isArray(record?.forecast_ledger)) record.forecast_ledger.forEach(bumpProb)
  else if (field === 'scenarios[].probability' && Array.isArray(record?.scenarios)) record.scenarios.forEach(bumpProb)
  else if (!field.includes('[]') && record && typeof record === 'object') {
    // bare top-level probability field (mirrors ledger_records.py _walk_probability_fields)
    const v = record[field]
    if (typeof v === 'number' && v > 0 && v <= 1) record[field] = Math.round(v * 100 * 1e6) / 1e6
  }
}

function signFix(record: any, field: string) {
  if (typeof record?.[field] === 'number') record[field] = Math.abs(record[field])
}

function shapeFix(record: any, field: string) {
  if (field === 'kill_criteria' && Array.isArray(record?.kill_criteria)) {
    record.kill_criteria = record.kill_criteria.map((x: any) =>
      x && typeof x === 'object' ? x : { condition: String(x), what_it_means: null, monitor_via: null })
  } else if (field === 'red_flags' && Array.isArray(record?.red_flags)) {
    record.red_flags = record.red_flags.map((x: any) =>
      x && typeof x === 'object'
        ? { id: x.id ?? null, severity: x.severity ?? null, module: x.module ?? null, description: x.description ?? x.trigger ?? null }
        : { id: null, severity: null, module: null, description: String(x) })
  } else if (field === 'module_scores' && record?.module_scores && typeof record.module_scores === 'object') {
    for (const k of Object.keys(record.module_scores)) {
      const v = record.module_scores[k]
      if (typeof v !== 'object') record.module_scores[k] = { score: v, verdict: null }
    }
  }
}

// scale_fix/sign_fix/shape_fix transform; math_reconcile/note_clear are documentation-only (recorded,
// no transform). Unknown kinds are ignored — a future kind must never corrupt an old reader. A
// prototype-less map (Object.create(null)) so a kind that collides with an Object.prototype member
// ('__proto__', 'hasOwnProperty', 'toString', 'constructor') is treated as unknown — matching Python's
// dict.get, not JS's `in`/index which would walk the prototype chain (parity-critical, review finding).
const TRANSFORMS: Record<string, ((r: any, f: string) => void) | null> = Object.assign(Object.create(null), {
  scale_fix: scaleFix,
  sign_fix: signFix,
  shape_fix: shapeFix,
  math_reconcile: null,
  note_clear: null,
})

// Return a normalised COPY of `record` with the sidecar's errata applied. Original never mutated.
export function applyErrata(record: any, c: Corrections): any {
  const out = JSON.parse(JSON.stringify(record ?? null))
  const applied: any[] = []
  for (const e of c.errata ?? []) {
    if (!e || typeof e !== 'object') continue
    // own-property check (not `e.kind in TRANSFORMS`) so a prototype-member kind is 'unknown-kind', never
    // an accidentally-resolved Object.prototype function that would throw or mis-apply (matches dict.get).
    if (!Object.prototype.hasOwnProperty.call(TRANSFORMS, e.kind)) {
      applied.push({ field: e.field, kind: e.kind, status: 'unknown-kind' })
      continue
    }
    const fn = TRANSFORMS[e.kind]
    if (fn && typeof e.field === 'string') fn(out, e.field)
    applied.push({ field: e.field, kind: e.kind, status: fn ? 'applied' : 'recorded' })
  }
  if (applied.length && out && typeof out === 'object') out._corrections_applied = applied
  return out
}

// True iff this run (repo-relative run_root, e.g. "analyses/EMAAR_2026-07-03") is superseded and must
// be dropped from the standing set (the tracker / calls view).
export function isSupersededRun(runRoot: string): boolean {
  const abs = path.join(ANALYSES_DIR, path.basename(runRoot))
  return supersededTarget(readCorrections(abs)) !== null
}

// The errata-normalised record for a run given its already-parsed raw record + repo-relative run_root.
export function normalizeRecord(runRoot: string, record: any): any {
  const abs = path.join(ANALYSES_DIR, path.basename(runRoot))
  return applyErrata(record, readCorrections(abs))
}

// ── truth-integrity status (DECISION_LEDGER.md §18a) ────────────────────────────────────────────
// Mirrors scripts/ledger_records.py's resolve_integrity_status() EXACTLY — same two signals (the
// finish-gate PROVISIONAL banner in final_thesis.md, and the latest verification_report*.json verdict),
// same fail-closed rule, same "unaudited is not a defect" distinction. Until this existed, the only two
// ledger consumers that applied it were scripts/calibrate.py and /research:track — the live cockpit's
// GET /api/calls showed a flagged, possibly-wrong run identically to a verified one (§18a "What it does
// not yet do"). A shared fixture (test/ledger-corrections.test.ts) locks this against the Python selftest.
const PROVISIONAL_MARK = 'PROVISIONAL — the automated finish-gate'
const CLEAN_VERDICTS = new Set(['Clean', 'Minor issues'])
const VERIFY_REPORT_NAME_RE = /^verification_report(_v\d+)?$/
const VERIFY_REPORT_VERSION_RE = /_v(\d+)\.json$/

export interface IntegrityStatus {
  status: 'verified' | 'provisional' | 'unaudited'
  verdict: string | null
  integrity_score: number | null
  banner: boolean
  report_file: string | null
}

function reportVersion(fileName: string): number {
  const m = VERIFY_REPORT_VERSION_RE.exec(fileName)
  return m ? parseInt(m[1], 10) : 1
}

// Truth-integrity status for one run dir (ABSOLUTE path). Tolerant: a missing/unreadable
// final_thesis.md or verification_report never throws — each resolves to its honest default,
// same contract as the Python resolver (a crash here must not break the whole /api/calls response).
export function resolveIntegrityStatus(runDirAbs: string): IntegrityStatus {
  let banner = false
  try {
    // Node's default utf8 decode is lossy (replaces invalid sequences), so a non-UTF-8 byte anywhere
    // in the file can't throw here — mirrors the Python resolver's errors="replace" read.
    const head = fs.readFileSync(path.join(runDirAbs, 'final_thesis.md'), 'utf8').slice(0, 2000)
    banner = head.includes(PROVISIONAL_MARK)
  } catch {
    /* missing/unreadable thesis → banner stays false */
  }

  let verdict: string | null = null
  let score: number | null = null
  let reportFile: string | null = null
  let reports: string[] = []
  try {
    reports = fs
      .readdirSync(runDirAbs)
      .filter((f) => f.startsWith('verification_report') && f.endsWith('.json') && VERIFY_REPORT_NAME_RE.test(f.slice(0, -5)))
      .sort((a, b) => reportVersion(a) - reportVersion(b))
  } catch {
    reports = []
  }
  if (reports.length) {
    reportFile = reports[reports.length - 1]
    try {
      const v = JSON.parse(fs.readFileSync(path.join(runDirAbs, reportFile), 'utf8'))
      if (v && typeof v === 'object') {
        verdict = typeof v.verdict === 'string' && v.verdict ? v.verdict : null
        score = typeof v.integrity_score === 'number' ? v.integrity_score : null
      }
    } catch {
      verdict = null // unreadable report — fail closed below, exactly like the finish-gate
    }
  }

  let status: IntegrityStatus['status']
  if (banner) {
    status = 'provisional'
  } else if (reports.length) {
    // Strip before comparing (full.md's own finish-gate does the same) — incidental whitespace in the
    // verdict string must not disagree with the finish-gate's own banner decision on the SAME report.
    const vNorm = typeof verdict === 'string' ? verdict.trim() : verdict
    status = vNorm !== null && CLEAN_VERDICTS.has(vNorm) ? 'verified' : 'provisional'
  } else {
    status = 'unaudited'
  }

  return { status, verdict, integrity_score: score, banner, report_file: reportFile }
}

// Truth-integrity status for a run given its repo-relative run_root — the wrapper every live caller
// (outputs.ts) actually uses, matching the isSupersededRun/normalizeRecord convention above.
export function resolveIntegrityStatusForRun(runRoot: string): IntegrityStatus {
  return resolveIntegrityStatus(path.join(ANALYSES_DIR, path.basename(runRoot)))
}

// ── post-mortem display fields (DECISION_LEDGER.md §5 post_mortem_decision/basket, fix F28b; and
// post_review_confidence_score, fix F28) ─────────────────────────────────────────────────────────
// /research:track already prefers the post-mortem rating cap and the post-red-team confidence over the
// synthesizer's original, uncapped fields (a terminal pre-mortem verdict — "Thesis broken" — caps a
// Selected/Short call to Watchlist per full.md's finish-gate). The live cockpit ignored both and showed
// the ORIGINAL decision/confidence — so a "Strong Buy" the engine's own red-team downgraded could still
// render as "Strong Buy" on the one surface a human checks in real time. Display-only: never written back.
export interface LedgerDisplay {
  decision: string | null
  basket: string | null
  decisionIsPostMortemCapped: boolean
  confidence: number | null
  confidenceIsPostReview: boolean
}

export function resolveDisplayFields(record: any): LedgerDisplay {
  const rec = record ?? {}
  const pmDecision = rec.post_mortem_decision
  const pmBasket = rec.post_mortem_basket
  const decision = (typeof pmDecision === 'string' && pmDecision ? pmDecision : null) ?? (rec.decision ?? null)
  const basket = (typeof pmBasket === 'string' && pmBasket ? pmBasket : null) ?? (rec.basket ?? null)
  // Flag capped ONLY when the post-mortem value is the one actually displayed — i.e. a non-empty string
  // that differs from the original. This must track the `decision` selection above (which falls back to
  // rec.decision unless pmDecision is a non-empty string); otherwise an empty-string post_mortem_decision
  // would display the uncapped original yet still raise the ⚠ CAPPED badge (false positive).
  const decisionIsPostMortemCapped = typeof pmDecision === 'string' && pmDecision !== '' && pmDecision !== rec.decision
  const postReview = typeof rec.post_review_confidence_score === 'number' ? rec.post_review_confidence_score : null
  const confidence = postReview !== null ? postReview : typeof rec.confidence_score === 'number' ? rec.confidence_score : null
  return { decision, basket, decisionIsPostMortemCapped, confidence, confidenceIsPostReview: postReview !== null }
}
