// Auto-repair — the SELF-HEALING half. When the cadence runner sees a connector's fetch fail repeatedly
// (the source changed its response shape or moved its endpoint — the realistic break, the one the offline
// test_fetch.py is designed to catch), it sends the BROKEN connector to a coding agent that reproduces the
// failure, fixes fetch.py within the SAME manifest contract, re-proves it (test + --verify), and opens a PR.
// The isolation + PR plumbing is the shared connector-agent.ts (identical to build). This is what turns "a
// connector got built once" into a feed that keeps itself alive.
//
// FAIL-CLOSED with its OWN caps: needs a PR token + dispatch enabled (connectorDispatchReady). The AUTOMATIC
// path is additionally gated by the runner (connectorAutoRepairReady); a manual repair goes through the
// admin route. Never stacks: one repair in flight per connector, an in-memory cooldown, and a daily cap.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { CONNECTOR_REPAIR, STATE_DIR, connectorDispatchReady } from './config'
import { runWorktreeAgent } from './connector-agent'
import { recordRepair } from './connector-health'
import type { ConnectorManifest } from './connector-registry'

const WORKTREE_BASE = process.env.ENGINE_CONNECTOR_REPAIR_WORKTREE_DIR || path.join(os.tmpdir(), 'nostra-connector-repair-worktrees')
const BUDGET_FILE = path.join(STATE_DIR, 'connector-repair.json')
const OUTCOME_FILE = '.connector-repair-outcome.json'

const inflight = new Set<string>()
const lastDispatchMs = new Map<string, number>() // connector_id → last repair dispatch (in-memory cooldown)
const log = (m: string) => console.log(`[connector-repair] ${m}`) // eslint-disable-line no-console
const today = () => new Date().toISOString().slice(0, 10)

function firedToday(): number {
  try { const b = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8')); return b?.date === today() ? Number(b.fired) || 0 : 0 } catch { return 0 }
}
function bumpFired(): void {
  try { fs.mkdirSync(STATE_DIR, { recursive: true }); fs.writeFileSync(BUDGET_FILE, JSON.stringify({ date: today(), fired: firedToday() + 1 })) } catch { /* best-effort */ }
}

export interface RepairAccept {
  accepted: boolean
  status: 'dispatched' | 'busy' | 'daily_cap' | 'not_ready' | 'already_running' | 'cooldown'
  message: string
}

const branchFor = (id: string) => `connector-repair/${id.toLowerCase()}`
const worktreeFor = (id: string) => path.join(WORKTREE_BASE, id)

// The prompt. The connector CODE already exists in the worktree (from origin/main); the agent's job is to
// reproduce and FIX it within its own contract — never to widen scope.
export function buildRepairPrompt(m: ConnectorManifest, subject: string, lastError: string): string {
  const rel = `.claude/connectors/${m.id}`
  const host = m.host_allowlist[0] || ''
  return [
    `You are REPAIRING one broken data connector for the equity-research engine, on a fresh branch`,
    `(${branchFor(m.id)}) cut from origin/main, in this worktree. The connector's scheduled fetch is failing.`,
    '',
    'SECURITY BOUNDARY. Stay strictly within this one connector. Do NOT: read or exfiltrate secrets, weaken',
    'CI or tests, push to main, change access controls, or contact any external service OTHER THAN the',
    `connector's own allowed host(s): ${m.host_allowlist.join(', ') || '(see connector.json host_allowlist)'}.`,
    '',
    `CONNECTOR: ${rel}/   (id ${m.id}, provider ${m.provider}, feeds subject(s) ${m.subjects.join(', ')})`,
    `FAILING SUBJECT: ${subject}`,
    `LAST FETCH ERROR (may be truncated):`,
    '"""',
    (lastError || '(no error text captured)').slice(0, 1200),
    '"""',
    '',
    'YOUR TASK:',
    `1. Read ${rel}/connector.json, ${rel}/fetch.py, ${rel}/test_fetch.py, and frameworks/EXTERNAL_DATA.md.`,
    `2. Reproduce the failure: run \`python3 ${rel}/fetch.py --verify\`. Diagnose WHY it fails — the usual`,
    '   cause is the source renamed a field, changed its JSON shape, or moved its endpoint path (NOT a change',
    '   in what data it provides).',
    `3. FIX ${rel}/fetch.py to handle the current source, keeping the SAME contract: the same output_path`,
    `   (${m.output_path || 'data/<SUBJECT>/external/...'}), the same output_schema meaning, the same tier`,
    `   (${m.tier}), and the fail-CLOSED behaviour. Update host_allowlist ONLY if the host genuinely moved`,
    `   (keep it an exact host, no wildcards). If the source's real DATA changed (not just its shape), update`,
    `   ${rel}/test_fetch.py's fixture + assertions to match honestly — never weaken a test just to pass.`,
    `4. Prove it: \`python3 ${rel}/test_fetch.py\` (must pass) AND \`python3 ${rel}/fetch.py --verify\` (must`,
    '   fetch + parse the live endpoint). Fix until both pass.',
    `5. If the source is genuinely GONE (permanently 404/removed, now behind a login/paywall, or replaced by`,
    '   an incompatible feed) and no honest fix exists, make no code change and record outcome "assessed"',
    '   explaining that — do NOT fabricate data or stub the fetch.',
    `6. On a real fix: commit ONLY ${rel}/ (never anything under data/). Push the branch and open a pull`,
    '   request against main, READY for review (`gh pr create` WITHOUT --draft), whose body states what',
    '   broke and how you fixed it. Do NOT merge.',
    '',
    'ALWAYS, as your final step, write a JSON file at the worktree root named',
    `\`${OUTCOME_FILE}\` with exactly this shape:`,
    '  {"outcome": "pr_open" | "assessed", "pr_url": "<url or empty>", "note": "<1-3 sentences>"}',
    'This file is how the cockpit records what happened — never skip it.',
  ].filter(Boolean).join('\n')
}

async function runRepair(m: ConnectorManifest, subject: string, lastError: string): Promise<void> {
  const id = m.id
  try {
    await recordRepair(id, 'repairing', { note: `Auto-repair started (subject ${subject}).` }).catch(() => {})
    const res = await runWorktreeAgent({
      branch: branchFor(id), worktree: worktreeFor(id), prompt: buildRepairPrompt(m, subject, lastError),
      outcomeFile: OUTCOME_FILE, logName: '.connector-repair.log',
      maxTurns: CONNECTOR_REPAIR.maxTurns, budgetUsd: CONNECTOR_REPAIR.budgetUsd, log,
    })
    await recordRepair(id, res.outcome === 'pr_open' ? 'pr_open' : 'assessed', { pr_url: res.pr_url || null, note: res.note || '' }).catch(() => {})
    log(`recorded ${res.outcome} for ${id}${res.pr_url ? ` → ${res.pr_url}` : ''}`)
  } catch (e: any) {
    log(`repair failed ${id}: ${e?.message || e}`)
    try { await recordRepair(id, 'assessed', { note: `Repair failed: ${e?.message || 'error'}` }) } catch { /* best-effort */ }
  } finally {
    inflight.delete(id)
  }
}

/**
 * Kick off an auto-repair for a broken connector. Synchronous fail-closed guards, then the run in the
 * background. The caller decides POLICY (the runner calls this only when connectorAutoRepairReady(); a manual
 * admin route calls it directly) — this function enforces the hard capability + caps + cooldown.
 */
export function startConnectorRepair(m: ConnectorManifest, subject: string, lastError: string): RepairAccept {
  if (!connectorDispatchReady()) return { accepted: false, status: 'not_ready', message: 'Connector repair needs the connector dispatch enabled and a PR token configured.' }
  if (inflight.has(m.id)) return { accepted: false, status: 'already_running', message: 'This connector is already being repaired.' }
  if (inflight.size >= CONNECTOR_REPAIR.maxConcurrent) return { accepted: false, status: 'busy', message: `The repair engine is busy (max ${CONNECTOR_REPAIR.maxConcurrent}).` }
  if (firedToday() >= CONNECTOR_REPAIR.dailyCap) return { accepted: false, status: 'daily_cap', message: `Daily repair cap (${CONNECTOR_REPAIR.dailyCap}) reached.` }
  const last = lastDispatchMs.get(m.id)
  if (last && Date.now() - last < CONNECTOR_REPAIR.cooldownHours * 3600_000) {
    return { accepted: false, status: 'cooldown', message: `A repair for ${m.id} ran recently — cooling down.` }
  }
  inflight.add(m.id)
  lastDispatchMs.set(m.id, Date.now())
  bumpFired()
  void runRepair(m, subject, lastError)
  log(`dispatched repair for ${m.id} (subject ${subject})`)
  return { accepted: true, status: 'dispatched', message: 'Sent to the repair engine — a fix-it pull request will appear when it\'s ready.' }
}

export function isRepairInflight(id: string): boolean {
  return inflight.has(id)
}
