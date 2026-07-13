// Data-needs reader — the SERVER-side authority over the `data_needs[]` a run's terminal synthesizer
// writes onto decision_record.json (frameworks/commodity/decision_record.schema.json; the "surface a data
// gap → build a durable connector → re-score" loop). It reads the latest run's decision_record for a
// subject and normalizes the array the same way readIntakePlan() treats a prompt-written plan — it does
// NOT trust the file:
//   1. VALIDATES every entry_module against the live roster (a hallucinated module name is dropped, noted
//      in `widened`) — so the cockpit can never light a module that isn't there (fail-closed, §26).
//   2. DROPS a structurally-invalid need (bad tier / acquisition / cadence / need_id) rather than surface a
//      malformed card — the same defensive posture the dock reads with (deploy-skew fail-closed).
// It launches nothing and writes nothing. Returns null when there is no run or the record is unreadable,
// so the dock stays hidden rather than showing a fabricated need.
import fs from 'node:fs'
import path from 'node:path'
import { findRunRootForSubject, listModuleNames } from './roster'

export interface DataNeedSource {
  name: string
  acquisition: string
  licensing?: string
}
export interface DataNeed {
  need_id: string
  series: string
  why_it_caps: string
  cap_lifted?: string
  filing_required: boolean
  entry_modules: string[]
  suggested_source: DataNeedSource
  tier: number
  cadence: string
  next_release?: string
}
export interface DataNeedsRead {
  subject: string
  swarm: string
  run_root: string
  decided_at: string // decision_record.json mtime, ISO — stamped by the reader, never trusted from the file
  needs: DataNeed[]
  widened: string[] // fail-closed audit trail (entry_modules dropped / needs dropped as malformed)
}

// The enums the decision_record schema pins — a connector-feedable tier is NEVER a filing (1-4); a scrape
// forces 9/10. Mirrored here so a malformed emit is dropped at read time, not surfaced.
const ACQUISITION = new Set(['official_api', 'free_key_api', 'paid_api', 'scrape', 'manual'])
const TIERS = new Set([5, 9, 10])
const CADENCE = new Set(['realtime', 'daily', 'weekly', 'monthly', 'event_driven'])
const NEED_ID_RE = /^[a-z0-9][a-z0-9_-]*$/

export function readDataNeeds(swarmId: string, subject: string): DataNeedsRead | null {
  const runRootAbs = findRunRootForSubject(swarmId, subject)
  if (!runRootAbs) return null
  const file = path.join(runRootAbs, 'decision_record.json')

  let raw: any
  let mtime: string
  try {
    mtime = fs.statSync(file).mtime.toISOString()
    raw = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null // no record / unreadable / malformed → dock hidden, never a fabricated need
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  const modules = new Set(listModuleNames(swarmId))
  const widened: string[] = []
  const seen = new Set<string>()
  const arr: any[] = Array.isArray(raw.data_needs) ? raw.data_needs : []
  const needs: DataNeed[] = []

  for (const n of arr) {
    if (!n || typeof n !== 'object') continue
    const need_id = String(n.need_id ?? '')
    if (!NEED_ID_RE.test(need_id) || seen.has(need_id)) {
      widened.push(`dropped a data_need with a bad or duplicate need_id (${JSON.stringify(n.need_id)})`)
      continue
    }
    const src = n.suggested_source && typeof n.suggested_source === 'object' ? n.suggested_source : {}
    const acquisition = String(src.acquisition ?? '')
    const tier = typeof n.tier === 'number' ? n.tier : NaN
    const cadence = String(n.cadence ?? '')
    // Fail closed: a need whose source/tier/cadence violate the schema enums is dropped, not shown malformed.
    if (!n.series || !ACQUISITION.has(acquisition) || !TIERS.has(tier) || !CADENCE.has(cadence) || !String(src.name ?? '')) {
      widened.push(`${need_id}: dropped (source, tier ${tier}, or cadence outside the allowed set)`)
      continue
    }
    // entry_modules validated against the live roster — a hallucinated module is dropped (never lit).
    const entry_modules = (Array.isArray(n.entry_modules) ? n.entry_modules.map(String) : []).filter((m: string) => {
      const ok = modules.has(m)
      if (!ok) widened.push(`${need_id}: dropped entry_module '${m}' (not in the ${swarmId} roster)`)
      return ok
    })
    seen.add(need_id)
    needs.push({
      need_id,
      series: String(n.series),
      why_it_caps: String(n.why_it_caps ?? ''),
      cap_lifted: n.cap_lifted ? String(n.cap_lifted) : undefined,
      filing_required: n.filing_required === true,
      entry_modules,
      suggested_source: {
        name: String(src.name),
        acquisition,
        licensing: src.licensing ? String(src.licensing) : undefined,
      },
      tier,
      cadence,
      next_release: n.next_release ? String(n.next_release) : undefined,
    })
  }

  return {
    subject: subject.toUpperCase(),
    swarm: swarmId,
    run_root: path.relative(process.cwd(), runRootAbs),
    decided_at: mtime,
    needs,
    widened,
  }
}
