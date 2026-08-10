// Repair lifecycle for repeatedly failed connectors. Detection, failure state, post-merge live verification,
// and clearing remain active; privileged coding-agent dispatch is HARD-DISABLED until an OS/VM-enforced
// egress sandbox exists. Operators repair through the normal human-authored branch → PR path in the meantime.
// The dormant admission/cap state is retained for a future isolated adapter and remains fail-closed.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { CONNECTOR_REPAIR, REPO_ROOT, STATE_DIR, connectorDispatchReady } from './config'
import { runWorktreeAgent } from './connector-agent'
import { latestRepairStatusForSubject, recordRepair } from './connector-health'
import { connectorFingerprint, type ConnectorManifest } from './connector-registry'

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
  status: 'dispatched' | 'busy' | 'daily_cap' | 'not_ready' | 'already_running' | 'cooldown' | 'source_gone'
  message: string
}

const branchFor = (id: string) => `connector-repair/${id.toLowerCase()}`
const worktreeFor = (id: string) => path.join(WORKTREE_BASE, id)
function deployedCommit(): string | null {
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' }).trim() || null } catch { return null }
}

// The prompt. The connector CODE already exists in the worktree (from origin/main); the agent's job is to
// reproduce and FIX it within its own contract — never to widen scope.
export function buildRepairPrompt(m: ConnectorManifest, subject: string, lastError: string): string {
  const rel = `.claude/connectors/${m.id}`
  const host = m.host_allowlist[0] || ''
  return [
    `You are REPAIRING one broken data connector for the cross-swarm research engine, on a fresh branch`,
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
    'EVIDENCE BOUNDARY: WILTW is permanently methodology-only, including after rename, sidecar attachment,',
    'manual routing, or transformation; it can never become runtime or GOLD-forecast evidence. Never insert',
    'report figures into code, a runtime fixture, seed, or fallback. Other reports are evidence only after',
    'lawful ordinary ingestion with their actual source, tier, licensing, provenance, and verdict stripping.',
    '',
    'YOUR TASK:',
    `1. Read ${rel}/connector.json, ${rel}/fetch.py, ${rel}/test_fetch.py,`,
    '   frameworks/connector.schema.json, scripts/connector_contract.py, and frameworks/EXTERNAL_DATA.md §7.',
    '   The canonical schema + shared validator are authoritative; do not substitute a connector-local',
    '   approximation of the v2 contract.',
    `2. Reproduce the failure: run \`python3 ${rel}/fetch.py --verify\`. Diagnose WHY it fails — the usual`,
    '   cause is the source renamed a field, changed its JSON shape, or moved its endpoint path (NOT a change',
    '   in what data it provides).',
    `3. FIX ${rel}/fetch.py only when the source still supplies the SAME measurement. Preserve the full`,
    '   contract, not merely a filename:',
    `   - keep manifest_version, schema_version, id (${m.id}), dataset_id (${m.dataset_id}), series_id`,
    `     (${m.series_id}), series, satisfies, subjects, provider, authority_class, provider_priority,`,
    '     fallback role, acquisition, source_type, tier, license, and structured licensing unchanged. Never',
    '     downgrade v2, reuse the old IDs for a replacement dataset, or turn a primary into a fallback',
    '     (or vice versa).',
    `   - keep output_path (${m.output_path || 'data/<SUBJECT>/external/...'}), output_schema meaning, EVERY`,
    '     numeric units path, minimum_history rule, release-only cadence/timezone/expected lag/grace, and',
    '     revision_policy unchanged. Do not bump schema_version to hide an incompatible measurement.',
    '   - keep host_allowlist exact (bare hosts, no wildcard or implicit subdomain) and credential_env limited',
    '     to environment-variable NAMES already declared. Never read, print, persist, or add a credential',
    '     value. A move to an unapproved host or a new login is a contract/source change, not permission to',
    '     widen this repair. Record source_gone/assessed when it cannot be repaired within the boundary.',
    '   - keep the runner staging interface: `--subject`, runner-supplied `--data-root`, exactly one payload',
    '     plus `<payload>.source.json`, no extra staged files/directories, and `--verify` that writes NOTHING.',
    '     Never write `_connectors/` or publish directly to the live pool. The shared publisher alone owns',
    '     commit_protocol_version 1: immutable blobs, a vintage for every accepted retrieval, linked receipts,',
    '     the immutable zero-padded sequence marker BEFORE current, the atomic current advance, and projection.',
    '   - keep `as_of` sourced from the data; payload series equal to the manifest; and sidecar provider,',
    '     source_type, tier, connector_id, dataset_id, series_id, schema_version, as_of, license, licensing,',
    '     and lawful exact-host HTTPS source URLs internally consistent. Manual input is ephemeral,',
    '     runner-attested local bytes; it is not durable provenance. Every durable payload/sidecar source URL',
    '     must cite the lawful HTTPS source, and all `file:` URLs are forbidden. Preserve the manual file',
    '     argument too when this is an explicit manual connector.',
    `   If the source's SHAPE changed but its meaning did not, update ${rel}/test_fetch.py's fixed fixture and`,
    '   exact assertions honestly. The test MUST continue to run shared `validate_manifest` and',
    '   `validate_staged_output` against the real transformed fixture + sidecar. Add a regression assertion',
    '   for the failure you fixed. NEVER weaken, skip, or replace a test or shared validation to make it pass.',
    '   Do not edit the ordered shared-publisher file list or publisher/runtime code to bypass this connector.',
    '   Production publication requires tracked, clean connector/publisher bytes on main at local main and',
    '   known origin/main; preserve that reproducibility gate.',
    `4. Prove it: \`python3 ${rel}/test_fetch.py\` (must pass) AND \`python3 ${rel}/fetch.py --verify\` (must`,
    '   fetch + parse the declared live acquisition while writing nothing). Fix until both pass. A parser-only',
    '   success that cannot pass the canonical manifest/staged-output gates is not a repair.',
    `5. If the source is genuinely GONE (permanently 404/removed, now behind a login/paywall, or replaced by`,
    '   an incompatible feed) and no honest fix exists, make no code change and record outcome "source_gone"',
    '   explaining that — do NOT fabricate data or stub the fetch.',
    `6. On a real fix: commit ONLY ${rel}/ (never fetched bytes or anything under data/). Push the branch and open a pull`,
    '   request against main, READY for review (`gh pr create` WITHOUT --draft), whose body states what',
    '   broke and how you fixed it. Do NOT merge.',
    '',
    'ALWAYS, as your final step, write a JSON file at the worktree root named',
    `\`${OUTCOME_FILE}\` with exactly this shape:`,
    '  {"outcome": "pr_open" | "assessed" | "source_gone", "pr_url": "<url or empty>", "note": "<1-3 sentences>"}',
    'This file is how the cockpit records what happened — never skip it.',
  ].filter(Boolean).join('\n')
}

async function runRepair(m: ConnectorManifest, subject: string, lastError: string): Promise<void> {
  const id = m.id
  const baseFingerprint = connectorFingerprint(m.dir)
  const baseCommit = deployedCommit()
  try {
    await recordRepair(id, 'repairing', {
      subject, base_fingerprint: baseFingerprint, base_commit: baseCommit,
      note: `Auto-repair started (subject ${subject}).`,
    }).catch(() => {})
    const res = await runWorktreeAgent({
      branch: branchFor(id), worktree: worktreeFor(id), prompt: buildRepairPrompt(m, subject, lastError),
      outcomeFile: OUTCOME_FILE, logName: '.connector-repair.log',
      maxTurns: CONNECTOR_REPAIR.maxTurns, budgetUsd: CONNECTOR_REPAIR.budgetUsd, log,
    })
    await recordRepair(id, res.outcome === 'pr_open' ? 'pr_open' : (res.outcome === 'source_gone' ? 'source_gone' : 'assessed'), {
      subject, base_fingerprint: baseFingerprint, base_commit: baseCommit,
      pr_url: res.pr_url || null, note: res.note || '',
    }).catch(() => {})
    log(`recorded ${res.outcome} for ${id}${res.pr_url ? ` → ${res.pr_url}` : ''}`)
  } catch (e: any) {
    log(`repair failed ${id}: ${e?.message || e}`)
    try { await recordRepair(id, 'assessed', {
      subject, base_fingerprint: baseFingerprint, base_commit: baseCommit,
      note: `Repair failed: ${e?.message || 'error'}`,
    }) } catch { /* best-effort */ }
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
  if (!connectorDispatchReady()) return {
    accepted: false, status: 'not_ready',
    message: 'Automatic connector repair is unavailable until a network-enforced isolated runner exists. Use the manual branch and pull-request workflow.',
  }
  if (inflight.has(m.id)) return { accepted: false, status: 'already_running', message: 'This connector is already being repaired.' }
  const prior = latestRepairStatusForSubject(m.id, subject)
  if (prior.status === 'source_gone' && prior.base_fingerprint === connectorFingerprint(m.dir)) {
    return { accepted: false, status: 'source_gone', message: 'This source was verified permanently unavailable; change the connector contract before retrying.' }
  }
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
