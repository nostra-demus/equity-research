// Connector repair-events ledger — the durable record of every AUTO-REPAIR the watchdog opened for a built
// feed. When the repair watchdog (connector-runner.ts) sees #287's run_connectors.py fetch ledger report a
// connector's latest fetch as `failed`, it hands the connector to connector-repair.ts, which appends a
// `connector_repair` event here (repairing → pr_open | assessed). This module owns ONLY that repair-event
// ledger — the watchdog reads it to skip a connector that already has a repair in flight. Append-only, under
// STATE_DIR/connectors/ (gitignored, durable across restarts), same shape + guarantees as the other ledgers.
// Fetching a feed and tracking its freshness is #287's job (run_connectors.py + pipelines.ts / GET
// /api/pipelines); this file no longer records fetch attempts or derives feed health.

import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { REPO_ROOT, STATE_DIR } from './config'

const execFileAsync = promisify(execFile)

export type RepairStatus = 'none' | 'repairing' | 'pr_open' | 'assessed'

export interface ConnectorRepairEvent {
  record_id: string
  kind: 'connector_repair'
  connector_id: string
  status: RepairStatus // repairing → pr_open | assessed
  pr_url: string | null
  note: string
  at: string
}

const DIR = (stateDir: string) => path.join(stateDir, 'connectors')
const LEDGER = (stateDir: string) => path.join(DIR(stateDir), 'health.ndjson')

export function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
}
function newId(): string {
  return randomUUID().slice(0, 12)
}

async function append(record: ConnectorRepairEvent, stateDir: string): Promise<void> {
  fs.mkdirSync(DIR(stateDir), { recursive: true })
  await execFileAsync(
    'bash',
    [path.join(REPO_ROOT, 'scripts', 'append-ndjson.sh'), LEDGER(stateDir), JSON.stringify(record), 'record_id', record.record_id],
    { cwd: REPO_ROOT },
  )
}

export async function recordRepair(
  connector_id: string, status: RepairStatus,
  opts: { pr_url?: string | null; note?: string } = {}, stateDir: string = STATE_DIR,
): Promise<void> {
  await append({
    record_id: newId(), kind: 'connector_repair', connector_id, status,
    pr_url: opts.pr_url ? String(opts.pr_url).slice(0, 2000) : null,
    note: (opts.note || '').slice(0, 500), at: nowIso(),
  }, stateDir)
}

/** Every repair event on the ledger, in file (chronological) order. [] when the ledger is absent — never throws. */
export function readAll(stateDir: string = STATE_DIR): ConnectorRepairEvent[] {
  let raw: string
  try { raw = fs.readFileSync(LEDGER(stateDir), 'utf8') } catch { return [] }
  const out: ConnectorRepairEvent[] = []
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t) continue
    try {
      const p = JSON.parse(t)
      if (p && typeof p === 'object' && !Array.isArray(p) && p.kind === 'connector_repair') out.push(p as ConnectorRepairEvent)
    } catch { /* skip */ }
  }
  return out
}

/**
 * The latest repair event's status + PR url for one connector, or {status:'none', pr_url:null} if none. The
 * watchdog uses this to skip a connector that already has a repair in flight (repairing / pr_open).
 */
export function latestRepairStatus(connectorId: string, stateDir: string = STATE_DIR): { status: RepairStatus; pr_url: string | null } {
  let latest: ConnectorRepairEvent | null = null
  for (const r of readAll(stateDir)) {
    if (r.connector_id !== connectorId) continue
    if (!latest || r.at >= latest.at) latest = r
  }
  return latest ? { status: latest.status, pr_url: latest.pr_url } : { status: 'none', pr_url: null }
}
