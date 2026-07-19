// Valuation Playground backend — read the machine-readable valuation LEVERS a run emitted
// (analyses/<run>/valuation/valuation_summary.json, schema frameworks/valuation_summary.schema.json) and
// persist the user's what-if OVERRIDES + reason. The recompute itself is client-side (ui/web/src/lib/
// valuationLevers.ts, a mirror of scripts/valuation_math.py) — the server only serves the baseline and
// keeps an append-only, gitignored record of the overrides (the rank-weights / corrections pattern), so a
// judgment call ("this WACC is too high — here's mine, and why") is captured for later learning without
// touching the frozen run.

import fs from 'node:fs'
import path from 'node:path'
import { STATE_DIR } from './config'
import { resolveInsideAnalyses } from './sandbox'

export function readValuationSummary(runRoot: string, resolve: (p: string) => string = resolveInsideAnalyses): any | null {
  // runRoot is caller-supplied. resolveInsideAnalyses realpath-confines the result to analyses/, but
  // validate the raw string here too — reject traversal and any non-path character BEFORE it reaches the
  // filesystem. Defense-in-depth, and an explicit barrier for the path-injection scanner (which cannot see
  // through the resolver's realpath check).
  if (typeof runRoot !== 'string' || runRoot.includes('..') || !/^[A-Za-z0-9._/-]+$/.test(runRoot)) return null
  try {
    const p = resolve(`${runRoot}/valuation/valuation_summary.json`)
    const j = JSON.parse(fs.readFileSync(p, 'utf8'))
    return j && typeof j === 'object' && !Array.isArray(j) ? j : null
  } catch {
    return null // absent (a run that predates the emission) or malformed — the Playground falls back to decision_record
  }
}

export interface ValuationOverride {
  id: string
  run_root: string
  ts: string
  reason: string
  overrides: Record<string, unknown>
  levels: Record<string, number> | null
}

// One gitignored JSON list under the engine state dir (survives restarts, never a git commit). Append-only:
// each save is a new record, so the history of judgment calls is preserved (undo = a later record, never a
// delete) — the same durability contract as the rank-weights change log and the ledger corrections layer.
const FILE = path.join(STATE_DIR, 'valuation-overrides.json')

function readAll(): ValuationOverride[] {
  try {
    const j = JSON.parse(fs.readFileSync(FILE, 'utf8'))
    return Array.isArray(j) ? (j as ValuationOverride[]) : []
  } catch {
    return []
  }
}

function writeAll(list: ValuationOverride[]): void {
  fs.mkdirSync(path.dirname(FILE), { recursive: true })
  // Atomic write: a crash/ENOSPC mid-write must never truncate the append-only ledger (readAll would then
  // silently return [] and the next save would replace the damaged file with only its own record, losing
  // every prior judgment). Write to a temp file, then rename — rename is atomic on the same filesystem.
  const tmp = `${FILE}.tmp-${process.pid}`
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2) + '\n')
  fs.renameSync(tmp, FILE)
}

export function readOverrides(runRoot: string): ValuationOverride[] {
  return readAll().filter((o) => o.run_root === runRoot)
}

export function appendOverride(rec: { run_root: string; reason: string; overrides: Record<string, unknown>; levels: Record<string, number> | null }): ValuationOverride {
  const full: ValuationOverride = {
    ...rec,
    id: `VO-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    ts: new Date().toISOString(),
  }
  const list = readAll()
  list.push(full)
  writeAll(list)
  return full
}
