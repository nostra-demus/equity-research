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
