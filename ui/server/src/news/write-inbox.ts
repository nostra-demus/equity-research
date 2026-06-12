// The write stage: land triaged items into the SAME inbox contract /screener:sweep already fills, so
// the cockpit and the gauntlet pick them up with zero changes. Three jobs:
//   - mergeInbox: idempotent merge into screener/inbox/<DATE>_sweep.json (by URL), PRESERVING any
//     human state (consumed / launched_signal_id), ranked by triage score and capped;
//   - appendFirehoseSummary: one compact line per cycle into <DATE>_firehose.ndjson (powers the
//     "seen / picked / dropped" board header without bloating the inbox with dropped items);
//   - refreshBoard: rebuild screener/board/index.json via the existing python script.

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import type { CycleSummary, InboxRow, TriagedItem } from './types'

function inboxPath(repoRoot: string, date: string): string {
  return path.join(repoRoot, 'screener', 'inbox', `${date}_sweep.json`)
}
function firehosePath(repoRoot: string, date: string): string {
  return path.join(repoRoot, 'screener', 'inbox', `${date}_firehose.ndjson`)
}

function nextInboxSeq(rows: InboxRow[]): number {
  let max = 0
  for (const r of rows) {
    const m = /-(\d+)$/.exec(r.inbox_id || '')
    if (m) max = Math.max(max, Number(m[1]))
  }
  return max + 1
}

export interface MergeOptions {
  maxRows?: number // cap on UNCONSUMED rows (ranked by score); consumed rows are always kept
  now?: () => Date
}

/**
 * Merge pick/watch items into today's inbox file. Existing rows keep their consumed/launched state;
 * a re-seen URL refreshes its triage fields only. Returns the number of rows the inbox now holds.
 */
export function mergeInbox(repoRoot: string, date: string, items: TriagedItem[], opts: MergeOptions = {}): number {
  const maxRows = opts.maxRows && opts.maxRows > 0 ? Math.floor(opts.maxRows) : 40
  const now = opts.now || (() => new Date())
  const fp = inboxPath(repoRoot, date)
  let existing: { rows?: InboxRow[] } = {}
  try { existing = JSON.parse(fs.readFileSync(fp, 'utf8')) } catch { existing = {} }
  const byUrl = new Map<string, InboxRow>()
  for (const r of existing.rows || []) if (r && r.url) byUrl.set(r.url, r)

  const dateCompact = date.replace(/-/g, '')
  let seq = nextInboxSeq(existing.rows || [])

  for (const it of items) {
    const prior = byUrl.get(it.url)
    const triageFields = {
      triage_score: it.triage_score,
      triage_reason: it.triage_reason,
      region: it.region,
      relevance: it.relevance,
      materiality_pre_score: it.materiality_pre_score,
      prelim_note: it.triage_reason, // keep the legacy field populated for any reader that uses it
      dedup_status: it.dedup_status,
    }
    if (prior) {
      Object.assign(prior, triageFields) // refresh score; NEVER touch consumed / launched_signal_id
    } else {
      byUrl.set(it.url, {
        inbox_id: `INB-${dateCompact}-${String(seq++).padStart(3, '0')}`,
        headline: it.headline,
        url: it.url,
        source_name: it.source_name,
        input_nature: it.input_nature,
        found_at: it.found_at,
        consumed: false,
        launched_signal_id: null,
        ...triageFields,
      })
    }
  }

  // rank by score; always keep consumed rows (history), cap the unconsumed tail
  const all = [...byUrl.values()]
  all.sort((a, b) => (b.triage_score ?? -1) - (a.triage_score ?? -1))
  const consumed = all.filter((r) => r.consumed)
  const unconsumed = all.filter((r) => !r.consumed).slice(0, maxRows)
  const rows = [...consumed, ...unconsumed].sort((a, b) => (b.triage_score ?? -1) - (a.triage_score ?? -1))

  const doc = {
    date,
    updated_at: now().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    focus_hint: null,
    source: 'auto_ingester', // distinguishes a Groq-scored file from a manual /screener:sweep
    rows,
  }
  fs.mkdirSync(path.dirname(fp), { recursive: true })
  fs.writeFileSync(fp, JSON.stringify(doc, null, 2) + '\n')
  return rows.length
}

export function appendFirehoseSummary(repoRoot: string, date: string, summary: CycleSummary): void {
  const fp = firehosePath(repoRoot, date)
  try {
    fs.mkdirSync(path.dirname(fp), { recursive: true })
    fs.appendFileSync(fp, JSON.stringify({ kind: 'cycle_summary', ...summary }) + '\n')
  } catch {
    // a missed firehose line only loses a board counter for the cycle — never fail ingestion for it
  }
}

/** Rebuild the board index using the existing python script. Best-effort; logs but never throws. */
export function refreshBoard(repoRoot: string, log: (m: string) => void = () => {}): void {
  try {
    execFileSync('python3', [path.join(repoRoot, 'scripts', 'update_board_index.py')], { cwd: repoRoot, stdio: 'ignore' })
  } catch (e: any) {
    log(`board refresh failed: ${e?.message || e}`)
  }
}
