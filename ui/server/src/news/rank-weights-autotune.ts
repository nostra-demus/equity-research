// The auto-apply orchestrator — the bridge that turns captured feedback into a live scoring change with
// no human in the loop, safely. Once a day (in-process tick, mirrors conviction-dispatch.ts) it:
//   1. reads the LIVE weights and hands them to the tuner as its baseline (--baseline-weights), so every
//      guardrail — the 3-point step cap, the no-sign-flip clamp, the backtest — is computed against reality,
//      not the shipped defaults;
//   2. applies the patch ONLY when the tuner returns status 'recommendations' AND the train/holdout
//      backtest passed (all the tuner's floors — 20 flags, 8/category, 70% consistency — already held);
//   3. drops any pinned weight, records the change (audit-FIRST) with the feedback ids that drove it, then
//      moves the weights via saveRankWeights so the very next ingest re-scores.
// Bounded and reversible: a per-day cap, a pause switch, and a full revert live in rank-weights-audit.ts.
// OFF by default (SCREENER_AUTOTUNE_ENABLED=1 turns it on) — the same opt-in posture as the conviction loop.
// The math converges on its own: after an apply the live baseline moves, so the same signal yields delta 0
// next run — a persistent signal nudges at most MAX_STEP points/day, never a runaway.

import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { REPO_ROOT } from '../config'
import { getRankWeights, saveRankWeights, type RankWeights } from './rank-weights'
import { bumpAutotuneDaily, getAutotuneState, recordApply, type WeightChange, type WeightDelta } from './rank-weights-audit'

const execFileAsync = promisify(execFile)
const TUNER = path.join(REPO_ROOT, 'scripts', 'screener_feedback_tune.py')

const ENABLED = process.env.SCREENER_AUTOTUNE_ENABLED === '1'
const TICK_MS = Math.max(300, Number(process.env.SCREENER_AUTOTUNE_TICK_SEC) || 86_400) * 1000
const DAILY_CAP = Math.max(1, Number(process.env.SCREENER_AUTOTUNE_DAILY_CAP) || 8)
const TIMEOUT_MS = Math.max(30_000, Number(process.env.SCREENER_AUTOTUNE_TIMEOUT_SEC) || 120) * 1000

let running = false // one run at a time (the daily tick and a manual /run must never overlap)

const log = (m: string) => console.log(`[autotune] ${m}`) // eslint-disable-line no-console

export interface AutotuneResult {
  applied: boolean
  status: string // 'applied' | 'paused' | 'daily_cap' | 'busy' | 'all_pinned' | 'audit_failed' | a tuner status
  change?: WeightChange
  reason?: string
}

/** One pass: read live weights → run the tuner against them → apply a passing, non-pinned patch + audit it. */
export async function runAutotuneOnce(actor = 'auto'): Promise<AutotuneResult> {
  if (running) return { applied: false, status: 'busy' }
  running = true
  try {
    const st = getAutotuneState()
    if (st.paused) return { applied: false, status: 'paused' }
    if (st.daily.count >= DAILY_CAP) return { applied: false, status: 'daily_cap' }

    const live = getRankWeights()
    const tmp = path.join(os.tmpdir(), `rw-baseline-${process.pid}-${Date.now()}.json`)
    let report: any
    try {
      fs.writeFileSync(tmp, JSON.stringify(live))
      const { stdout } = await execFileAsync('python3', [TUNER, '--baseline-weights', tmp, '--emit-json'], {
        cwd: REPO_ROOT,
        timeout: TIMEOUT_MS,
        maxBuffer: 32_000_000,
      })
      report = JSON.parse(stdout.toString())
    } finally {
      try { fs.rmSync(tmp, { force: true }) } catch { /* ignore */ }
    }

    if (report?.status !== 'recommendations' || !report?.backtest?.passes) {
      return { applied: false, status: report?.status || 'no_report' }
    }

    const pins = new Set(st.pins)
    const patch: Partial<RankWeights> = {}
    const deltas: WeightDelta[] = []
    const evidence: string[] = []
    for (const rec of report.recommendations || []) {
      if (pins.has(`${rec.dimension}:${rec.category}`)) continue
      ;(patch as any)[rec.dimension] = (patch as any)[rec.dimension] || {}
      ;(patch as any)[rec.dimension][rec.category] = rec.proposed
      deltas.push({ dimension: rec.dimension, category: rec.category, before: rec.current, after: rec.proposed })
      for (const fid of rec.evidence_feedback_ids || []) evidence.push(fid)
    }
    if (!deltas.length) return { applied: false, status: 'all_pinned' }

    // audit-FIRST: never move a weight we can't record. A failed audit write aborts the apply.
    let change: WeightChange
    try {
      change = recordApply({
        actor,
        deltas,
        evidence_feedback_ids: [...new Set(evidence)],
        backtest: report.backtest,
        status: report.status,
        tuner_generated_at: report.generated_at,
      })
    } catch (e: any) {
      log(`audit write failed — NOT applying: ${e?.message || e}`)
      return { applied: false, status: 'audit_failed', reason: e?.message || String(e) }
    }

    saveRankWeights(patch)
    bumpAutotuneDaily()
    log(`applied ${deltas.length} nudge(s) [${actor}]: ${deltas.map((d) => `${d.dimension}:${d.category} ${d.before}→${d.after}`).join(', ')}`)
    return { applied: true, status: 'applied', change }
  } catch (e: any) {
    log(`run error: ${e?.message || e}`)
    return { applied: false, status: 'error', reason: e?.message || String(e) }
  } finally {
    running = false
  }
}

/** Start the daily in-process tick (a kick shortly after boot + a fixed interval). No-op when disabled. */
export function startAutotuneLoop(): void {
  if (!ENABLED) {
    log('idle — set SCREENER_AUTOTUNE_ENABLED=1 to auto-apply feedback-driven weight nudges (guardrailed + audited + revertible; the Scoring panel still works by hand)')
    return
  }
  setTimeout(() => { runAutotuneOnce().catch(() => {}) }, 15_000)
  const t = setInterval(() => { runAutotuneOnce().catch(() => {}) }, TICK_MS)
  t.unref?.()
  log(`loop on — auto-tune every ${Math.round(TICK_MS / 1000)}s · cap ${DAILY_CAP}/day · guardrailed by the tuner (20-flag floor, backtest, 3pt/run) + pins/pause`)
}
