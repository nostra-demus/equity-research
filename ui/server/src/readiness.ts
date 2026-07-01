// Pre-flight data-readiness GATE — deterministic, no LLM (the pre-spawn check).
//
// Joins TWO truth sources, both already canonical in the engine:
//   1. extraction + entity truth  -> .claude/tools/extract_pool.py --readiness-json
//      (zero/empty/unreadable files; mixed-entity pool — the PV-vs-CV incident)
//   2. file-type + §26 module readiness -> analyzeTicker() in data-status.ts
//      (which modules are Insufficient, what caps bind — no-price, missing statements, …)
// It NEVER spawns `claude` and NEVER reads document content semantically — the FY/period/
// jurisdiction correctness stays with the in-run 00_*-data-triage agents (the "during-run" layer).

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import os from 'node:os'
import { DATA_DIR, REPO_ROOT } from './config'
import { analyzeTicker } from './data-status'
import type { ModuleReadiness, ReadinessReport, ReadinessIssue, ReadinessSeverity, RunKind } from './types'

interface PyIssue { code: string; severity: ReadinessSeverity; message: string; evidence?: string; file?: string }
interface PyReadiness {
  data_path: string
  file_count: number
  usable_count: number
  issues: PyIssue[]
  entities: { file: string; entity: string }[]
}

// suggested-fix hints by issue code (shown in the panel; only the user-fixable ones get "Fix & re-check")
const FIX_HINT: Record<string, string> = {
  zero_files: 'Add the company\'s filings to the data folder, then re-check.',
  zero_usable_data: 'Re-upload readable files (PDF/XLSX/HTML), then re-check.',
  extraction_failed: 'Re-export or re-upload this file; if a dependency is missing, run setup-tools.sh.',
  missing_dependency: 'Run .claude/tools/setup-tools.sh to install the extractor dependency, then re-check.',
  empty_file: 'Replace the empty file with the real export, then re-check.',
  entity_disagreement: 'The pool appears to mix companies — remove the wrong-entity files, then re-check.',
}

const execFileAsync = promisify(execFile)

// The pre-flight extracts every file — now including OCR of image-only/scanned PDFs, which is the
// slow part on a FRESH pool (cached thereafter, so only the first check on a new scan pays it). Give
// it a generous, env-tunable wall-clock, and bound OCR itself to a budget safely UNDER that clock so
// python returns a result rather than being SIGKILL'd mid-OCR (a kill would surface as the "check
// could not run" blocker). Whatever OCR completed is cached; the uncapped in-run extraction finishes
// the rest, so a later re-check comes back clean.
const READINESS_TIMEOUT_MS = Math.max(60_000, Number(process.env.READINESS_TIMEOUT_MS) || 300_000)
const READINESS_OCR_BUDGET_S = Math.max(
  30, Number(process.env.READINESS_OCR_BUDGET_S) || Math.floor(READINESS_TIMEOUT_MS / 1000) - 60,
)

// ASYNC on purpose: extract_pool extracts every file in the pool (the bulk of the gate's cost — seconds
// on a real pool, up to the 180s timeout). execFileSync would block the whole Node event loop for that
// time, freezing every other request (SSE, /api/runs, and crucially a cancel POST). execFile yields.
async function runPhaseAPython(dataDir: string, outDir: string, force: boolean): Promise<PyReadiness | null> {
  try {
    const script = path.join(REPO_ROOT, '.claude', 'tools', 'extract_pool.py')
    const args = [script, '--readiness-json', dataDir, outDir]
    if (force) args.push('--force')
    const { stdout } = await execFileAsync('python3', args, {
      timeout: READINESS_TIMEOUT_MS,
      maxBuffer: 32_000_000,
      // OCR self-limits under the Node timeout (see READINESS_OCR_BUDGET_S). The in-run extraction
      // (the agents' own extract_pool call) sets no budget, so it OCRs the whole pool + caches it.
      env: { ...process.env, EXTRACT_OCR_BUDGET_S: String(READINESS_OCR_BUDGET_S) },
    })
    return JSON.parse(stdout.toString()) as PyReadiness
  } catch (e: any) {
    // never swallow silently: a failed gate check surfaces as the generic "The data-readiness check could
    // not run" blocker, and WHY (timeout / non-zero exit / bad JSON) was undiagnosable before this. Log the
    // real reason + the python stderr tail (the traceback) so the next failure isn't a guessing game.
    console.warn(
      `[readiness] extract_pool --readiness-json failed for ${dataDir}:`,
      e?.shortMessage || e?.message || String(e),
      e?.stderr ? `\n  stderr(tail): ${String(e.stderr).slice(-600)}` : '',
    )
    return null
  }
}

// §26 module readiness scoped by run kind (exported for testing):
//   full   -> every module; an Insufficient module is a DEGRADE (the other modules still run)
//   module -> the target module only; an Insufficient target is a BLOCKER (the run is pointless)
//   agent / rerun -> [] (a re-run isn't recomputing module sufficiency, so don't gate on it)
// Partial just runs capped — that's normal, not a gate concern (the in-run triage carries those caps).
export function moduleReadinessIssues(
  kind: RunKind, module: string | undefined, modules: Record<string, ModuleReadiness>,
): ReadinessIssue[] {
  if (kind !== 'full' && kind !== 'module') return []
  const scope = kind === 'module' && module ? [module] : Object.keys(modules)
  const out: ReadinessIssue[] = []
  for (const m of scope) {
    const mod = modules[m]
    if (!mod || mod.status !== 'Insufficient') continue
    out.push({
      code: 'module_insufficient', severity: kind === 'module' ? 'blocker' : 'degrade', module: m,
      message: `${m}: insufficient data — ${mod.reasons.join('; ') || 'required inputs missing'}.`,
      affectedModules: [m],
      capIfProceeded: mod.caps.join('; ') || `${m} will fail-fast or run capped`,
      suggestedFix: 'Add the missing document type for this module, then re-check.',
    })
  }
  return out
}

/**
 * Run the deterministic pre-flight readiness check for a ticker.
 * @param outDir where extract_pool caches its manifest/extracts (the run's _pool_extracts at launch;
 *               a stable temp cache for the read-only endpoint). force re-reads a just-fixed pool.
 */
export async function runReadiness(
  ticker: string,
  kind: RunKind = 'full',
  module?: string,
  opts: { outDir?: string; force?: boolean } = {},
): Promise<ReadinessReport> {
  const dataDir = path.join(DATA_DIR, ticker)
  const outDir = opts.outDir ?? path.join(os.tmpdir(), 'nostra-readiness', ticker)
  const issues: ReadinessIssue[] = []

  // (1) extraction + entity truth (Python) — awaited, so the event loop stays responsive during it
  const py = await runPhaseAPython(dataDir, outDir, opts.force ?? false)
  if (!py) {
    // the check itself could not run — fail SAFE (a blocker), never let the run proceed blind
    issues.push({
      code: 'check_failed', severity: 'blocker',
      message: 'The data-readiness check could not run.',
      evidence: 'extract_pool.py --readiness-json failed (see server logs)',
    })
    return finalize(ticker, kind, module, issues, 0, 0, [])
  }
  for (const i of py.issues) {
    issues.push({ ...i, suggestedFix: FIX_HINT[i.code] })
  }

  // (2) file-type + §26 module readiness, scoped by kind (see moduleReadinessIssues). Only when files
  // exist and the kind recomputes module sufficiency (full/module) — agent/rerun skip the analyzeTicker I/O.
  if (py.file_count > 0 && (kind === 'full' || kind === 'module')) {
    issues.push(...moduleReadinessIssues(kind, module, (await analyzeTicker(ticker)).modules))
  }

  return finalize(ticker, kind, module, issues, py.file_count, py.usable_count, py.entities)
}

function finalize(
  ticker: string, kind: RunKind, module: string | undefined,
  issues: ReadinessIssue[], fileCount: number, usableCount: number,
  entities: { file: string; entity: string }[],
): ReadinessReport {
  const overall: ReadinessReport['overall'] =
    issues.some((i) => i.severity === 'blocker') ? 'blocked'
    : issues.some((i) => i.severity === 'degrade') ? 'degraded'
    : 'clean'
  return { ticker, kind, module, overall, fileCount, usableCount, entities, issues, ts: Date.now() }
}
