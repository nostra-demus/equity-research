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
import { REPO_ROOT } from './config'
import { dataPoolNewest, todayDate } from './completion'
import { finalDeliverablesPresent } from './launcher'
import { resolveRunRoot } from './outputs'
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
  scanned_at?: string // ISO wall-clock the command stamps BEFORE it reads the pool — the durable "as-of"
  watermark?: string
  new_docs: IntakeNewDoc[]
  rerun_plan: IntakeRerunPlan
  verdict: 'scoped_rerun' | 'note_only' | 'insufficient'
  summary: string
  // stamped by the reader (never trusted from the file):
  analyzed_at: string // the plan file's mtime, ISO — used only for "did the plan file change" detection
  widened: string[] // human-readable notes about dropped/widened entries (fail-closed audit trail)
  // True iff this analysis provably accounts for the WHOLE current pool — no pool file arrived after the
  // analysis read it. It is the safety gate on the cockpit's affirmative "no new data — everything's been
  // read and considered" message: that claim may ONLY be shown when `new_docs` is empty AND `pool_current`
  // is true, so a document dropped after the analysis can never be reported as "nothing new".
  //
  // The witness is DURABLE, never the plan file's mtime. Plan files live under analyses/ (git-tracked), and
  // any checkout / clone / worktree / rebase / fresh-deploy tree rewrites their mtime FORWARD to the
  // operation time — always toward a falsely-fresh verdict — while data/ mtimes are durable (gitignored).
  // So `pool_current` compares the live pool against the plan's own recorded `scanned_at` (precise), or
  // `scan_date` (date-granular, strict — a same-day file counts as unread) for older plans, and is false
  // when neither witness is provable. Fail-safe by construction: any doubt → false → the cockpit prompts a
  // re-analysis instead of claiming "nothing new".
  pool_current: boolean
  // True iff this plan is a copy `carryForwardScoped` staged into THIS run root, and that root's scoped
  // rerun has since actually finished (final_thesis.md + decision_record.json on disk) — its commands were
  // already carried out here. Serving them again would tell the cockpit that already-incorporated data
  // still needs a rerun (Codex #358 r3673980745). The file is never deleted (kept for the audit trail);
  // `rerun_plan.commands`/`entry_orbs` are emptied instead, so the client's existing "nothing to re-run"
  // state covers it with no UI change needed.
  consumed: boolean
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
/** ABSOLUTE path of the ticker's current intake plan file, or null. Exported for the scoped-rerun route,
 *  which copies the plan into the target run root it stages — so after staging creates a newer dated root,
 *  a retry (and the audit trail) still finds the plan under the LATEST root (Codex #358 r3672400212). */
export function latestPlanFileFor(ticker: string): string | null {
  const root = findLatestRunRoot(ticker)
  return root ? latestPlanFile(root) : null
}

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
  // Resolve the STANDING run — the newest one that actually decided — not the literal newest folder.
  // This has to match where `/research:intake` WRITES: that command is told to find "the latest FINISHED
  // run root" and to "skip over a newer but incomplete/failed run folder". This reader used
  // findLatestRunRoot, a lexical newest-`<TICKER>_*` pick with no completeness check, so a decision-less
  // shell (an aborted run that left only a couple of agent_metrics files) won the pick, its absent intake/
  // read as "no plan", and this returned null. Downstream that is indistinguishable from "nothing to do":
  // zero orbs lit, the New-data dock hidden, and the decision banner left offering only the blunt full
  // re-run — which is exactly what the feature exists to avoid. Writer and reader must agree on which
  // folder IS the run. preferComplete is the SAME standing-run pick the other display routes already use
  // (server.ts), so reuse it rather than teach a second definition of "the run" (CLAUDE.md §2).
  //
  // NOTE this is deliberately NOT the resolution latestPlanFileFor() above uses: that one serves the
  // scoped-rerun STAGING path, which copies the plan into the newer root it just staged and therefore
  // genuinely wants newest-wins. Display reads the standing run; staging reads the newest. Both correct.
  const runRootRel = resolveRunRoot({ ticker, preferComplete: true })
  if (!runRootRel) return null
  const runRootAbs = path.join(REPO_ROOT, runRootRel)
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
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  const pool = dataPoolNewest(ticker)

  // ---- durable freshness witnesses (NEVER the plan file's mtime) ----
  // Plan files live under analyses/ (git-tracked); any checkout / clone / worktree / rebase / fresh-deploy
  // tree rewrites their mtime FORWARD to the operation time — always toward a falsely-fresh verdict — while
  // data/ mtimes are durable (gitignored). So freshness is judged against the plan's OWN recorded values,
  // which survive materialization: `scanned_at` (an ISO wall-clock the command stamps before it reads the
  // pool — precise) preferred, else the date-only `scan_date`. A future `scanned_at` is a prompt bug, not a
  // witness → discard it (fail closed).
  const nowMs = Date.now()
  const today = todayDate(new Date(nowMs))
  const scannedAtMs = (() => {
    const s = raw.scanned_at
    if (typeof s !== 'string') return null
    const ms = Date.parse(s)
    if (!Number.isFinite(ms) || ms > nowMs) return null // a future stamp is a prompt/clock-skew bug → discard
    return ms
  })()
  const scanDate = String(raw.scan_date ?? '')
  const scanDateValid = /^\d{4}-\d{2}-\d{2}$/.test(scanDate) && scanDate <= today // a future scan_date is not a witness
  // The run's DURABLE vintage — parsed from the run-folder NAME (analyses/<TICKER>_<DATE>), which git cannot
  // rewrite, unlike the folder's file mtimes. This is the same basis the staleness floor uses.
  const runDate = (() => { const m = path.basename(runRootAbs).match(/(\d{4}-\d{2}-\d{2})/); return m ? m[1] : null })()

  // Expire a stale SCOPED plan (never an empty one — those are served so the cockpit can nudge a re-analysis
  // rather than silently hiding): if the pool gained a file the analysis never saw, its scoping is missing
  // that document, so don't trust it (null → the honest floor, INTAKE.md §1). Date-granular / same-day
  // tolerant here (matching stalenessOf's convention) so a plan is not nulled the same day it was written;
  // the stricter bar is reserved for the user-facing affirmative below. Falls back to the (legacy,
  // non-durable) mtime date only when scan_date is somehow absent — never worse than the prior behaviour.
  const rawScoped = (Array.isArray(raw.new_docs) && raw.new_docs.length > 0) ||
    (Array.isArray(raw.rerun_plan?.commands) && raw.rerun_plan.commands.length > 0)
  const freshnessDate = scanDateValid ? scanDate : todayDate(new Date(mtime))
  if (rawScoped && pool.newestDate && pool.newestDate > freshnessDate) return null

  // Pool-currency proof for the affirmative "no new data — everything read and considered". Held to a
  // STRICTER, fail-safe bar than the scoped-trust decision above, because a false affirmative is the exact
  // failure mode this feature exists to prevent. It layers two DURABLE checks, and both must pass:
  //
  //  (1) witnessCurrent — nothing landed since the analysis READ the pool. Precise when `scanned_at` is
  //      present (a file whose newest timestamp is after the scan is unread); else date-granular and STRICT
  //      on `scan_date` (a same-day file counts as unread); else false (never affirm on an unprovable
  //      basis — old plans / deploy-skew). Uses dataPoolNewest's max(mtime, ctime) so a doc dropped with a
  //      preserved-older mtime (Google-Drive / cp -p / rsync -t materialise files with their ORIGINAL
  //      mtime) still trips it via its local ctime.
  //  (2) NOT floorStale — the DURABLE staleness floor agrees the pool has gained nothing dated after the
  //      RUN itself (pool.newestDate ≤ the run-folder date). This is the belt-and-suspenders the first fix
  //      missed: the intake COMMAND discovers new docs with `find -newer final_thesis.md`, and that
  //      watermark's mtime is rewritten forward by a git checkout exactly like the plan file's — so after
  //      materialisation the command can MISS a real post-run document and write an empty plan. If the floor
  //      disagrees, that empty plan cannot be trusted → withhold the affirmative, and never contradict the
  //      stale badges the constellation already shows for the same document.
  let witnessCurrent: boolean
  if (scannedAtMs !== null) witnessCurrent = !pool.newestMs || pool.newestMs <= scannedAtMs
  else if (scanDateValid) witnessCurrent = !pool.newestDate || pool.newestDate < scanDate
  else witnessCurrent = false
  const floorStale = !!runDate && !!pool.newestDate && pool.newestDate > runDate
  const poolCurrent = witnessCurrent && !floorStale

  // Consumed: this file is a copy `carryForwardScoped` staged into THIS root (stamped when it copied the
  // plan — see completion.ts), and the root has since actually finished. `finalDeliverablesPresent` proves
  // real completion, not merely presence-after-relaunch, which is exactly the distinction the copied plan
  // needs: a plan staged for a run still IN FLIGHT (root exists, deliverables don't yet) must stay live so
  // a retry after a failed launch can still find it (Codex #358 r3672400212's whole point).
  const consumed = raw.staged_for_scoped_rerun === true && finalDeliverablesPresent(runRootAbs)

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

  // A CONSUMED plan's own commands were already carried out against this very root — report nothing
  // actionable (the client's existing zero-commands "nothing to re-run" state covers it), while every
  // other field (new_docs, summary, widened) stays intact for the audit trail.
  const effectiveCommands = consumed ? [] : commands
  const effectiveEntryOrbs = consumed ? [] : planEntryOrbs

  const rerunPlan: IntakeRerunPlan = {
    materiality_gate: typeof rawPlan.materiality_gate === 'number' ? rawPlan.materiality_gate : 60,
    entry_orbs: effectiveEntryOrbs,
    commands: effectiveCommands,
    note_only: Array.isArray(rawPlan.note_only) ? rawPlan.note_only.map((n: any) => ({ path: String(n?.path ?? ''), reason: String(n?.reason ?? '') })) : [],
  }

  // verdict is derived from the VALIDATED commands, not trusted from the file: if every command was
  // dropped as invalid, this is not a scoped rerun anymore.
  //   - A file-declared `insufficient` is preserved regardless of new_docs (it means "the run/data
  //     can't support a judgment", which new documents existing does not resolve).
  //   - Fail closed (INTAKE.md §1): if a command was dropped as invalid AND none survived AND a
  //     dropped document actually cleared the materiality gate, this is NOT a quiet "nothing to
  //     re-run" — a material recommendation was lost to a hallucinated name, so treat it the same as
  //     `insufficient` rather than silently reporting note_only.
  //   - A CONSUMED plan never falls into `insufficient` on this ground — its commands were withheld
  //     because they already ran, not because roster validation dropped anything material.
  const droppedMaterialCommand = !consumed && effectiveCommands.length === 0 && widened.length > 0 &&
    newDocs.some((d) => d.materiality_score >= rerunPlan.materiality_gate)
  const verdict: IntakePlan['verdict'] = effectiveCommands.length > 0
    ? 'scoped_rerun'
    : (raw.verdict === 'insufficient' || droppedMaterialCommand ? 'insufficient' : 'note_only')

  return {
    schema_version: String(raw.schema_version ?? '1.0'),
    ticker: ticker.toUpperCase(),
    run_root: String(raw.run_root ?? path.relative(process.cwd(), runRootAbs)),
    scan_date: String(raw.scan_date ?? ''),
    scanned_at: scannedAtMs !== null ? new Date(scannedAtMs).toISOString() : undefined,
    watermark: raw.watermark ? String(raw.watermark) : undefined,
    new_docs: newDocs,
    rerun_plan: rerunPlan,
    verdict,
    summary: String(raw.summary ?? ''),
    analyzed_at: mtime,
    widened,
    pool_current: poolCurrent,
    consumed,
  }
}
