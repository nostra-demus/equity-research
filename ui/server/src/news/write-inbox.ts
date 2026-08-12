// The write stage: land triaged items into the SAME inbox contract /screener:sweep already fills, so
// the cockpit and the gauntlet pick them up with zero changes. Three jobs:
//   - mergeInbox: idempotent merge into screener/inbox/<DATE>_sweep.json (by URL + revision lane), PRESERVING any
//     human state (consumed / launched_signal_id), ranked by triage score and capped;
//   - appendFirehoseSummary: one compact line per cycle into <DATE>_firehose.ndjson (powers the
//     "seen / picked / dropped" board header without bloating the inbox with dropped items);
//   - refreshBoard: rebuild screener/board/index.json via the existing python script.

import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { CycleSummary, InboxRow, TriagedItem } from './types'
import { deriveScope, deriveSourceTier, SOURCE_TIERS, type SourceTierId } from './scope'
import { deriveScheduledEventEvidence } from './schedule'
import { themeStoryKey } from './themes/story-key'

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

/** A publisher can correct or retract an article in place at the same URL. URL-only identity would
 * overwrite that falsifying observation with the old headline before revision-aware story collapse can
 * see it. Keep URL idempotence within each canonical ordinary/correction/reversal lane instead. */
function inboxUrlRevisionKey(row: { url: string; headline?: unknown; headline_en?: unknown; event_types?: unknown }): string {
  const lane = themeStoryKey({
    dedup_group: '__url_revision__',
    headline: row.headline,
    headline_en: row.headline_en,
    event_types: row.event_types,
  })
  return `${row.url}\u0000${lane}`
}

/**
 * Collapse rows sharing a story-cluster id (news/dedup.ts) to one representative per canonical revision
 * lane. Ordinary publisher copies share one lane, while corrections and reversals must survive as their
 * own observations so downstream Theme/Ideas readers can see thesis-changing evidence. Rows with no
 * dedup_group stay standalone. A group that already touched a run (any member launched) is left intact —
 * never silently drop a row that spawned work. Representative = best §4 source tier, then highest triage
 * score within that lane. The caller has already removed consumed/dismissed rows, so this only ever folds
 * away fresh, never-acted-on duplicates.
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
    const byRevisionLane = new Map<string, InboxRow[]>()
    for (const member of members) {
      const key = themeStoryKey(member)
      const lane = byRevisionLane.get(key)
      if (lane) lane.push(member)
      else byRevisionLane.set(key, [member])
    }
    for (const lane of byRevisionLane.values()) {
      const rep = lane.slice().sort((a, b) => tierRank(b.source_tier) - tierRank(a.source_tier) || (b.triage_score ?? -1) - (a.triage_score ?? -1))[0]
      kept.push(rep)
    }
  }
  return kept
}

/**
 * Merge pick/watch items into today's inbox file. Existing rows keep their consumed/launched state;
 * a re-seen URL in the same revision lane replaces the prior source observation and triage payload while
 * preserving only its inbox id and human lifecycle. A correction or reversal at that URL remains a
 * distinct observation. Returns the number of rows the inbox now holds.
 */
export function mergeInbox(repoRoot: string, date: string, items: TriagedItem[], opts: MergeOptions = {}): number {
  const maxRows = opts.maxRows && opts.maxRows > 0 ? Math.floor(opts.maxRows) : 40
  const now = opts.now || (() => new Date())
  const fp = inboxPath(repoRoot, date)
  let existing: { rows?: InboxRow[] } = {}
  try { existing = JSON.parse(fs.readFileSync(fp, 'utf8')) } catch { existing = {} }
  const byUrlRevision = new Map<string, InboxRow>()
  for (const r of existing.rows || []) if (r && r.url) byUrlRevision.set(inboxUrlRevisionKey(r), r)

  const dateCompact = date.replace(/-/g, '')
  let seq = nextInboxSeq(existing.rows || [])

  for (const it of items) {
    const urlRevisionKey = inboxUrlRevisionKey(it)
    const prior = byUrlRevision.get(urlRevisionKey)
    const sourceFields = {
      headline: it.headline,
      headline_en: it.headline_en, // latest translated content, not the first copy seen at this URL
      headline_lang: it.headline_lang,
      url: it.url,
      source_name: it.source_name,
      input_nature: it.input_nature,
      found_at: it.found_at,
    }
    const triageFields = {
      triage_score: it.triage_score,
      triage_reason: it.triage_reason,
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
      // Trade timing must come from the source row, never from the later model-authored `why_now`.
      // Category-only schedule tags are useful UI facets but are not dated catalyst evidence.
      scheduled_events: deriveScheduledEventEvidence({ headline: it.headline }),
      rank_factors: it.rank_factors, // composite-priority breakdown; triage_score IS the composite
      prelim_note: it.triage_reason, // keep the legacy field populated for any reader that uses it
      dedup_status: it.dedup_status,
      dedup_group: it.dedup_group, // story-cluster id — collapse duplicate stories below
    }
    if (prior) {
      // A publisher may rewrite the correction text in place. Retaining the old source fields would pair
      // a new score with stale evidence. Rebuild the owned row from the newest observation, carrying only
      // stable identity and explicit human state across the refresh.
      byUrlRevision.set(urlRevisionKey, {
        ...sourceFields,
        ...triageFields,
        inbox_id: prior.inbox_id,
        consumed: prior.consumed === true,
        launched_signal_id: prior.launched_signal_id ?? null,
        ...(typeof prior.dismissed === 'boolean' ? { dismissed: prior.dismissed } : {}),
        ...(typeof prior.dismissed_at === 'string' ? { dismissed_at: prior.dismissed_at } : {}),
        ...(typeof prior.dismissed_by === 'string' ? { dismissed_by: prior.dismissed_by } : {}),
      })
    } else {
      byUrlRevision.set(urlRevisionKey, {
        inbox_id: `INB-${dateCompact}-${String(seq++).padStart(3, '0')}`,
        ...sourceFields,
        consumed: false,
        launched_signal_id: null,
        ...triageFields,
      })
    }
  }

  // rank by score; always keep consumed AND dismissed rows (human state is history — never evicted,
  // never resurrected by a re-seen URL), cap only the live unconsumed tail
  const all = [...byUrlRevision.values()]
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

const execFileAsync = promisify(execFile)

/**
 * Rebuild the board index using the existing python script. Best-effort by default (logs but never
 * throws) — every auto-poll / best-effort caller relies on that so a rebuild hiccup never breaks the
 * click it rode in on. Pass `throwOnFailure: true` for a caller that must know the rebuild actually
 * happened (e.g. the manual "rebuild from ledger" endpoint) — it rethrows instead of swallowing, so the
 * caller can surface a real failure instead of quietly returning the stale, pre-rebuild index.
 */
// async execFile (never execFileSync — a multi-second rebuild must not block the event loop; see
// readiness.ts). Concurrent rebuilds are safe: the python script writes per-PID tmp + rename, and
// each rebuild is deterministic from the stores, so last-rename-wins converges to the truth.
export async function refreshBoard(repoRoot: string, log: (m: string) => void = () => {}, opts: { throwOnFailure?: boolean } = {}): Promise<void> {
  try {
    await execFileAsync('python3', [path.join(repoRoot, 'scripts', 'update_board_index.py')], { cwd: repoRoot, timeout: 60_000, maxBuffer: 8_000_000 })
  } catch (e: any) {
    log(`board refresh failed: ${e?.message || e}`)
    if (opts.throwOnFailure) throw e
  }
}
