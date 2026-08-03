// Standalone single-cycle entrypoint — the "true 24/7" hosting mode. Run it from cron or launchd
// (see scripts/ops/) so ingestion is independent of whether the cockpit UI is open:
//
//   GROQ_API_KEY=… npm --prefix ui/server run ingest:once
//
// It runs exactly one cycle, prints the JSON summary, and exits 0 on success / 1 on failure, so a
// scheduler can detect a bad run. The Groq key must be in the environment.

import { runIngestCycle } from './runCycle'
import {
  acquireIngesterLock, releaseIngesterLock, runConfiguredIdeaPass, runConfiguredQualifiedIdeaOutcomes,
} from './scheduler'
import { NEWS, STATE_DIR } from '../config'
import { pathToFileURL } from 'node:url'

const log = (m: string) => console.log(`[news] ${m}`) // eslint-disable-line no-console

export interface StandalonePassResult<TSummary, TIdea, TOutcomes> {
  summary: TSummary | null
  ideaPass: TIdea | null
  qualifiedOutcomes: TOutcomes
  ingestError: unknown | null
  ideaError: unknown | null
  error: unknown | null
}

/** Run the three standalone phases in separate failure domains. The lead skim is safe after an ingest
 * failure because it independently rejects stale/corrupt sweeps and source timestamps. Thus a transient
 * fetch failure cannot suppress a pass over still-current inputs, and neither news phase can prevent a
 * due 3–6-month research forecast from being graded. */
export async function runStandalonePasses<TSummary, TIdea, TOutcomes>(deps: {
  ingest: () => Promise<TSummary>
  ideas: () => Promise<TIdea>
  outcomes: () => Promise<TOutcomes>
}): Promise<StandalonePassResult<TSummary, TIdea, TOutcomes>> {
  let summary: TSummary | null = null
  let ideaPass: TIdea | null = null
  let ingestError: unknown | null = null
  let ideaError: unknown | null = null
  try { summary = await deps.ingest() } catch (e) { ingestError = e }
  try { ideaPass = await deps.ideas() } catch (e) { ideaError = e }
  // Intentionally after the catch, not inside the news try: this always runs once.
  const qualifiedOutcomes = await deps.outcomes()
  return { summary, ideaPass, qualifiedOutcomes, ingestError, ideaError, error: ingestError || ideaError }
}

async function main(): Promise<void> {
  if (!NEWS.enabled) {
    const ideaPass = await runConfiguredIdeaPass(log)
    const qualifiedOutcomes = await runConfiguredQualifiedIdeaOutcomes(log)
    log('news ingestion is disabled; skipped fetching and ran only independent outcome settlement')
    console.log(JSON.stringify({ ok: true, skipped: 'news_disabled', idea_pass: ideaPass, qualified_idea_outcomes: qualifiedOutcomes })) // eslint-disable-line no-console
    return
  }
  // Single-instance lock keyed on the data dir, shared with the cockpit's in-process ingester
  // (startNewsIngester takes the SAME lock). Without it, this standalone run + an open cockpit pointed at
  // the same ENGINE_STATE_DIR would BOTH fetch, triage, and write — double-spending budgets and racing the
  // firehose/ledger writes. If the owner is alive, skip this cycle (exit 0 — not a failure; the owner does
  // the work); a dead owner's stale lock is reclaimed by acquireIngesterLock's PID-liveness check.
  if (!acquireIngesterLock(STATE_DIR)) {
    log('another engine already owns the ingester for this data dir — skipping this cycle (no duplicate fetching)')
    const qualifiedOutcomes = await runConfiguredQualifiedIdeaOutcomes(log)
    console.log(JSON.stringify({ ok: true, skipped: 'ingester_lock_held', qualified_idea_outcomes: qualifiedOutcomes })) // eslint-disable-line no-console
    return
  }
  // Backstop: release on ANY exit path (signal / uncaught throw) so a crash can't strand the lock beyond
  // its stale-reclaim window. The explicit finally below covers normal settle paths.
  process.once('exit', () => releaseIngesterLock(STATE_DIR))
  try {
    const result = await runStandalonePasses({
      ingest: () => runIngestCycle({ log }),
      ideas: () => runConfiguredIdeaPass(log),
      outcomes: () => runConfiguredQualifiedIdeaOutcomes(log),
    })
    if (result.error) console.error('[news] fatal', result.error) // eslint-disable-line no-console
    // Keep the machine-readable settlement result visible even on a failed ingest.
    console.log(JSON.stringify(result.summary // eslint-disable-line no-console
      ? { ...result.summary, idea_pass: result.ideaPass, qualified_idea_outcomes: result.qualifiedOutcomes,
          ingest_error: result.ingestError instanceof Error ? result.ingestError.message : result.ingestError,
          idea_error: result.ideaError instanceof Error ? result.ideaError.message : result.ideaError }
      : { ok: false, idea_pass: result.ideaPass, qualified_idea_outcomes: result.qualifiedOutcomes,
          ingest_error: result.ingestError instanceof Error ? result.ingestError.message : result.ingestError,
          idea_error: result.ideaError instanceof Error ? result.ideaError.message : result.ideaError,
          error: result.error instanceof Error ? result.error.message : String(result.error || 'news cycle failed') }))
    process.exitCode = result.error || !result.summary?.ok ? 1 : 0
  } finally {
    releaseIngesterLock(STATE_DIR)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main()
