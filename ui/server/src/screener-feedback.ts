// Human feedback on screener news-wire cards — "this is wrong" for a flagged reason (irrelevant,
// mis-scored, wrong company/sector, stale duplicate, under-rated, other). An APPEND-ONLY ledger,
// same shape as screener-actions.ts's thesis overrides: nothing is ever rewritten, so an "undo" is a
// second line (kind: 'feedback_undo') that references the original by id, never a mutation of it.
// Kept structured (event/score/source/company/sector snapshot at flag time) so a later pass — human
// or LLM — can read the whole ledger and recommend scoring changes.

import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from './config'

export const FEEDBACK_TYPES = [
  'irrelevant',
  'score_too_high',
  'score_too_low',
  'wrong_company',
  'wrong_sector',
  'duplicate_stale',
  'should_be_higher',
  'other',
] as const
export type FeedbackType = (typeof FEEDBACK_TYPES)[number]

export interface FeedbackInput {
  event_id: string
  feedback_type: FeedbackType
  feedback_reason?: string
  current_score?: number | null
  event_title?: string
  source?: string
  company_name?: string
  company_ticker?: string
  sector_theme?: string
  score_breakdown?: Record<string, unknown> | null
}

export interface FeedbackRecord {
  feedback_id: string // FDB-YYYYMMDD-<8hex>
  kind: 'feedback' | 'feedback_undo'
  event_id: string
  undoes?: string // present only when kind === 'feedback_undo'
  user_id: string // identify(req).user — 'local' when unavailable, never blocks the write
  current_score: number | null
  feedback_type: FeedbackType | null // null on an undo record
  feedback_reason: string // '' when omitted
  event_title: string
  source: string
  company_name: string | null
  company_ticker: string | null
  sector_theme: string | null
  score_breakdown: Record<string, unknown> | null
  submitted_at: string
}

export interface FeedbackSummary {
  total: number
  active_total: number
  by_type: Record<FeedbackType, number>
  top_reasons: { reason: string; count: number }[]
  generated_at: string
}

const LEDGER = (repoRoot: string) => path.join(repoRoot, 'screener', 'ledger', 'screener_feedback.ndjson')

function nowIso(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
}

function newFeedbackId(at: string): string {
  return `FDB-${at.slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 8)}`
}

function appendLedger(record: FeedbackRecord, repoRoot: string): void {
  execFileSync('bash', [path.join(REPO_ROOT, 'scripts', 'append-ndjson.sh'), LEDGER(repoRoot), JSON.stringify(record), 'feedback_id', record.feedback_id], {
    cwd: repoRoot,
    stdio: 'ignore',
  })
}

/** Append a feedback record. `user` is best-effort (identify()'s 'local' fallback is always safe here). */
export function submitFeedback(input: FeedbackInput, user: string, repoRoot: string = REPO_ROOT): FeedbackRecord {
  const submitted_at = nowIso()
  const record: FeedbackRecord = {
    feedback_id: newFeedbackId(submitted_at),
    kind: 'feedback',
    event_id: input.event_id,
    user_id: user || 'local',
    current_score: typeof input.current_score === 'number' ? input.current_score : null,
    feedback_type: input.feedback_type,
    feedback_reason: (input.feedback_reason || '').trim().slice(0, 500),
    event_title: (input.event_title || '').slice(0, 500),
    source: (input.source || '').slice(0, 200),
    company_name: input.company_name ? input.company_name.slice(0, 200) : null,
    company_ticker: input.company_ticker ? input.company_ticker.slice(0, 20) : null,
    sector_theme: input.sector_theme ? input.sector_theme.slice(0, 200) : null,
    score_breakdown: input.score_breakdown ?? null,
    submitted_at,
  }
  appendLedger(record, repoRoot)
  return record
}

/**
 * Append a tombstone for a prior feedback record — the ledger is append-only, so this is a new line,
 * never a rewrite. Returns null when the target feedback_id doesn't exist in the ledger.
 */
export function undoFeedback(feedbackId: string, user: string, repoRoot: string = REPO_ROOT): FeedbackRecord | null {
  const all = readAllFeedback(repoRoot)
  const target = all.find((r) => r.feedback_id === feedbackId && r.kind === 'feedback')
  if (!target) return null
  const submitted_at = nowIso()
  const record: FeedbackRecord = {
    feedback_id: newFeedbackId(submitted_at),
    kind: 'feedback_undo',
    event_id: target.event_id,
    undoes: feedbackId,
    user_id: user || 'local',
    current_score: null,
    feedback_type: null,
    feedback_reason: '',
    event_title: target.event_title,
    source: target.source,
    company_name: target.company_name,
    company_ticker: target.company_ticker,
    sector_theme: target.sector_theme,
    score_breakdown: null,
    submitted_at,
  }
  appendLedger(record, repoRoot)
  return record
}

/** Read every ledger line. [] on a missing file (a fresh install has no feedback yet) — never throws. */
export function readAllFeedback(repoRoot: string = REPO_ROOT): FeedbackRecord[] {
  let raw: string
  try {
    raw = fs.readFileSync(LEDGER(repoRoot), 'utf8')
  } catch {
    return []
  }
  const out: FeedbackRecord[] = []
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      out.push(JSON.parse(trimmed) as FeedbackRecord)
    } catch {
      // skip a malformed line rather than fail the whole read
    }
  }
  return out
}

/** Aggregate counts + top reasons over the ACTIVE (non-undone) feedback records. */
export function summarizeFeedback(records: FeedbackRecord[]): FeedbackSummary {
  const undone = new Set(records.filter((r) => r.kind === 'feedback_undo' && r.undoes).map((r) => r.undoes as string))
  const active = records.filter((r) => r.kind === 'feedback' && !undone.has(r.feedback_id))
  const by_type = Object.fromEntries(FEEDBACK_TYPES.map((t) => [t, 0])) as Record<FeedbackType, number>
  const reasonCounts = new Map<string, number>()
  for (const r of active) {
    if (r.feedback_type) by_type[r.feedback_type] = (by_type[r.feedback_type] || 0) + 1
    const reason = r.feedback_reason.trim()
    if (reason) reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1)
  }
  const top_reasons = [...reasonCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([reason, count]) => ({ reason, count }))
  return {
    total: records.filter((r) => r.kind === 'feedback').length,
    active_total: active.length,
    by_type,
    top_reasons,
    generated_at: nowIso(),
  }
}
