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
import { deriveScope, deriveSourceTier, SOURCE_TIERS, type SourceTierId } from './scope'

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

const tierRank = (t?: string | null): number => (t ? SOURCE_TIERS[t as SourceTierId]?.rank ?? 0 : 0)

/**
 * Collapse rows sharing a story-cluster id (news/dedup.ts) to ONE representative, so the curated inbox
 * shows one row per story like the wire does. Rows with no dedup_group stay standalone. A group that
 * already touched a run (any member launched) is left intact — never silently drop a row that spawned
 * work. Representative = best §4 source tier, then highest triage score. The caller has already removed
 * consumed/dismissed rows, so this only ever folds away fresh, never-acted-on duplicates.
 */
function collapseInboxByGroup(rows: InboxRow[]): InboxRow[] {
  const byGroup = new Map<string, InboxRow[]>()
  const kept: InboxRow[] = []
  for (const r of rows) {
    const g = r.dedup_group
    if (!g) { kept.push(r); continue } // ungrouped → standalone
    const arr = byGroup.get(g)
    if (arr) arr.push(r)
    else byGroup.set(g, [r])
  }
  for (const members of byGroup.values()) {
    if (members.length === 1 || members.some((m) => m.launched_signal_id)) { kept.push(...members); continue }
    const rep = members.slice().sort((a, b) => tierRank(b.source_tier) - tierRank(a.source_tier) || (b.triage_score ?? -1) - (a.triage_score ?? -1))[0]
    kept.push(rep)
  }
  return kept
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
      headline_en: it.headline_en, // English translation of a non-English headline (news/lang.ts)
      headline_lang: it.headline_lang, // the source language named, for the "original · X" label
      region: it.region,
      relevance: it.relevance,
      materiality_pre_score: it.materiality_pre_score,
      event_types: it.event_types,
      issuer_linkage: it.issuer_linkage,
      companies: it.companies,
      size_bucket: it.size_bucket,
      scope: deriveScope(it),
      source_tier: deriveSourceTier(it),
      event_materiality_label: it.event_materiality_label,
      event_direction: it.event_direction,
      event_scope: it.event_scope,
      rank_factors: it.rank_factors, // composite-priority breakdown; triage_score IS the composite
      prelim_note: it.triage_reason, // keep the legacy field populated for any reader that uses it
      dedup_status: it.dedup_status,
      dedup_group: it.dedup_group, // story-cluster id — collapse duplicate stories below
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

  // rank by score; always keep consumed AND dismissed rows (human state is history — never evicted,
  // never resurrected by a re-seen URL), cap only the live unconsumed tail
  const all = [...byUrl.values()]
  all.sort((a, b) => (b.triage_score ?? -1) - (a.triage_score ?? -1))
  const humanState = all.filter((r) => r.consumed || r.dismissed)
  // collapse duplicate STORIES before the cap, so one story never eats several inbox slots and the cap
  // counts distinct stories (news/dedup.ts). Ungrouped rows and run-touched groups pass through intact.
  const live = collapseInboxByGroup(all.filter((r) => !r.consumed && !r.dismissed)).slice(0, maxRows)
  const rows = [...humanState, ...live].sort((a, b) => (b.triage_score ?? -1) - (a.triage_score ?? -1))

  // preserve whatever the existing document carried (a manual sweep's focus_hint, its source label,
  // any future fields) — this merge only owns `rows` and the freshness stamps
  const doc = {
    ...existing,
    date,
    updated_at: now().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    focus_hint: (existing as any).focus_hint ?? null,
    source: (existing as any).source || 'auto_ingester',
    rows,
  }
  fs.mkdirSync(path.dirname(fp), { recursive: true })
  // atomic tmp+rename: this file is the ground truth for human state (consumed/dismissed) and is
  // read by the CLI sweep and the python board builder — neither may ever see a half-written file
  const tmpFp = `${fp}.tmp.${process.pid}`
  try {
    fs.writeFileSync(tmpFp, JSON.stringify(doc, null, 2) + '\n')
    fs.renameSync(tmpFp, fp)
  } finally {
    if (fs.existsSync(tmpFp)) fs.unlinkSync(tmpFp)
  }
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
