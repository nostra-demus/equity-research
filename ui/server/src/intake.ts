// Document-intake reader — the SERVER-side authority over the scoped rerun plan the
// `/research:intake` command writes (frameworks/INTAKE.md). It reads the latest
// analyses/<TICKER>_<DATE>/intake/*_intake_plan.json, then does the two things a prompt-written
// plan must NOT be trusted to have gotten right on its own:
//   1. VALIDATES every module/agent name against the discovered roster (a hallucinated name is
//      dropped, its document widened to blanket-stale) — so the cockpit can never be handed a
//      launchable `/research:rerun badmodule …` command (fail-closed, CLAUDE.md §26 + INTAKE.md §4).
//   2. RE-EXPANDS each surviving command's downstream cascade from the live DAG (roster.ts
//      downstreamCascade) — the single source of truth, so a hand-written cascade can never drift.
//
// It NEVER launches anything and NEVER touches the staleness floor (completion.ts) — the plan is
// advisory guidance layered on top of the honest floor (INTAKE.md §1). Returns null when there is
// no run or no readable plan, so the client shows the honest floor rather than a fabricated one.
import fs from 'node:fs'
import path from 'node:path'
import { findLatestRunRoot, listModuleNames, agentNamesForModule, downstreamCascade } from './roster'
import { RESEARCH_SWARM_ID } from './swarms'

export interface IntakeEntryOrb {
  module: string
  agent: string
  why: string
  confidence: number
}
export interface IntakeNewDoc {
  path: string
  sha256?: string | null
  provider?: string | null
  source_type?: string | null
  tier?: number | null
  as_of?: string | null
  claims_summary: string
  materiality_score: number
  impact_direction: string
  entry_orbs: IntakeEntryOrb[]
}
export interface IntakeRerunCommand {
  command: string
  module: string
  agent: string
  cascade_modules: string[]
  triggered_by: string[]
}
export interface IntakeRerunPlan {
  materiality_gate: number
  entry_orbs: { module: string; agent: string }[]
  commands: IntakeRerunCommand[]
  note_only: { path: string; reason: string }[]
}
export interface IntakePlan {
  schema_version: string
  ticker: string
  run_root: string
  scan_date: string
  watermark?: string
  new_docs: IntakeNewDoc[]
  rerun_plan: IntakeRerunPlan
  verdict: 'scoped_rerun' | 'note_only' | 'insufficient'
  summary: string
  // stamped by the reader (never trusted from the file):
  analyzed_at: string // the plan file's mtime, ISO
  widened: string[] // human-readable notes about dropped/widened entries (fail-closed audit trail)
}

// The downstream module set a single-orb rerun re-runs, recomputed from the live DAG. Mirrors
// launcher.ts coveredModulesFor('rerun') exactly (minus the master synthesizer, which is not a module).
function cascadeModulesFor(module: string, agent: string): string[] {
  try {
    return [...new Set(downstreamCascade(module, agent, RESEARCH_SWARM_ID).filter((c) => c.module !== 'master').map((c) => c.module))]
  } catch {
    return []
  }
}

// Find the latest intake_plan.json under a run root. Naming: <DATE>_intake_plan[_vN].json — a plain
// lexical max picks the newest date and, within a date, the highest single-digit _vN (same
// convention as reviews/; a same-day _v10 is not handled, and does not happen in practice).
function latestPlanFile(runRootAbs: string): string | null {
  const dir = path.join(runRootAbs, 'intake')
  let names: string[]
  try {
    names = fs.readdirSync(dir).filter((n) => /_intake_plan(_v\d+)?\.json$/.test(n))
  } catch {
    return null
  }
  if (!names.length) return null
  names.sort()
  return path.join(dir, names[names.length - 1])
}

// Read + normalize the latest scoped rerun plan for a ticker. Returns null when there is no finished
// run, no plan yet, or the plan is unreadable/malformed (fail toward the honest floor, INTAKE.md §1).
export function readIntakePlan(ticker: string): IntakePlan | null {
  const runRootAbs = findLatestRunRoot(ticker)
  if (!runRootAbs) return null
  const file = latestPlanFile(runRootAbs)
  if (!file) return null

  let raw: any
  let mtime: string
  try {
    const stat = fs.statSync(file)
    mtime = stat.mtime.toISOString()
    raw = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null // malformed → show the blunt floor, never a fabricated plan
  }
  if (!raw || typeof raw !== 'object') return null

  const moduleNames = new Set(listModuleNames(RESEARCH_SWARM_ID))
  const agentsByModule = new Map<string, Set<string>>()
  const orbValid = (module: string, agent: string): boolean => {
    if (!moduleNames.has(module)) return false
    let set = agentsByModule.get(module)
    if (!set) {
      set = new Set(agentNamesForModule(module, RESEARCH_SWARM_ID))
      agentsByModule.set(module, set)
    }
    return set.has(agent)
  }

  const widened: string[] = []

  // ---- validate new_docs[].entry_orbs (drop hallucinated names; note the widen) ----
  const newDocs: IntakeNewDoc[] = Array.isArray(raw.new_docs) ? raw.new_docs.map((d: any): IntakeNewDoc => {
    const entryOrbs: IntakeEntryOrb[] = Array.isArray(d?.entry_orbs) ? d.entry_orbs.filter((o: any) => {
      const ok = orbValid(String(o?.module), String(o?.agent))
      if (!ok) widened.push(`${d?.path ?? 'a document'}: dropped ${o?.module}/${o?.agent} (not in the roster) — widened to blanket-stale`)
      return ok
    }).map((o: any): IntakeEntryOrb => ({
      module: String(o.module),
      agent: String(o.agent),
      why: String(o.why ?? ''),
      confidence: typeof o.confidence === 'number' ? o.confidence : 0,
    })) : []
    return {
      path: String(d?.path ?? ''),
      sha256: d?.sha256 ?? null,
      provider: d?.provider ?? null,
      source_type: d?.source_type ?? null,
      tier: typeof d?.tier === 'number' ? d.tier : null,
      as_of: d?.as_of ?? null,
      claims_summary: String(d?.claims_summary ?? ''),
      materiality_score: typeof d?.materiality_score === 'number' ? d.materiality_score : 0,
      impact_direction: String(d?.impact_direction ?? 'neutral'),
      entry_orbs: entryOrbs,
    }
  }) : []

  // ---- validate + re-expand the rerun plan (authoritative cascade from the live DAG) ----
  const rawPlan = raw.rerun_plan ?? {}
  const commands: IntakeRerunCommand[] = Array.isArray(rawPlan.commands) ? rawPlan.commands
    .filter((c: any) => {
      const ok = orbValid(String(c?.module), String(c?.agent))
      if (!ok) widened.push(`dropped command for ${c?.module}/${c?.agent} (not in the roster)`)
      return ok
    })
    .map((c: any): IntakeRerunCommand => {
      const module = String(c.module)
      const agent = String(c.agent)
      return {
        command: `/research:rerun ${module} ${agent} ${ticker}`, // rebuilt, never trusted from the file
        module,
        agent,
        cascade_modules: cascadeModulesFor(module, agent), // recomputed from the live DAG
        triggered_by: Array.isArray(c.triggered_by) ? c.triggered_by.map(String) : [],
      }
    }) : []

  const planEntryOrbs = Array.isArray(rawPlan.entry_orbs)
    ? rawPlan.entry_orbs.filter((o: any) => orbValid(String(o?.module), String(o?.agent))).map((o: any) => ({ module: String(o.module), agent: String(o.agent) }))
    : []

  const rerunPlan: IntakeRerunPlan = {
    materiality_gate: typeof rawPlan.materiality_gate === 'number' ? rawPlan.materiality_gate : 60,
    entry_orbs: planEntryOrbs,
    commands,
    note_only: Array.isArray(rawPlan.note_only) ? rawPlan.note_only.map((n: any) => ({ path: String(n?.path ?? ''), reason: String(n?.reason ?? '') })) : [],
  }

  // verdict is derived from the VALIDATED commands, not trusted from the file: if every command was
  // dropped as invalid, this is not a scoped rerun anymore.
  const verdict: IntakePlan['verdict'] = commands.length > 0 ? 'scoped_rerun'
    : (newDocs.length > 0 ? 'note_only' : (raw.verdict === 'insufficient' ? 'insufficient' : 'note_only'))

  return {
    schema_version: String(raw.schema_version ?? '1.0'),
    ticker: ticker.toUpperCase(),
    run_root: String(raw.run_root ?? path.relative(process.cwd(), runRootAbs)),
    scan_date: String(raw.scan_date ?? ''),
    watermark: raw.watermark ? String(raw.watermark) : undefined,
    new_docs: newDocs,
    rerun_plan: rerunPlan,
    verdict,
    summary: String(raw.summary ?? ''),
    analyzed_at: mtime,
    widened,
  }
}
