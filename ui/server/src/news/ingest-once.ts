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
  runConfiguredRescueShadow,
} from './scheduler'
import { NEWS, STATE_DIR } from '../config'
import { withProviderRunDeployLease } from '../deploy-barrier'
import { pathToFileURL } from 'node:url'
import { runNormalIdeasThenSecondLook } from './rescue/order'

const log = (m: string) => console.log(`[news] ${m}`) // eslint-disable-line no-console

export interface StandalonePassResult<TSummary, TIdea, TSecondLook, TOutcomes> {
  summary: TSummary | null
  ideaPass: TIdea | null
  secondLook: TSecondLook | null
  qualifiedOutcomes: TOutcomes
  ingestError: unknown | null
  ideaError: unknown | null
  error: unknown | null
}

/** Run the three standalone phases in separate failure domains. The lead skim is safe after an ingest
 * failure because it independently rejects stale/corrupt sweeps and source timestamps. Thus a transient
 * fetch failure cannot suppress a pass over still-current inputs, and neither news phase can prevent a
 * due 3–6-month research forecast from being graded. */
export async function runStandalonePasses<TSummary, TIdea, TSecondLook, TOutcomes>(deps: {
  ingest: () => Promise<TSummary>
  ideas: () => Promise<{ ideaPass: TIdea; secondLook: TSecondLook | null }>
  outcomes: () => Promise<TOutcomes>
}): Promise<StandalonePassResult<TSummary, TIdea, TSecondLook, TOutcomes>> {
  let summary: TSummary | null = null
  let ideaPass: TIdea | null = null
  let secondLook: TSecondLook | null = null
  let ingestError: unknown | null = null
  let ideaError: unknown | null = null
  try { summary = await deps.ingest() } catch (e) { ingestError = e }
  try {
    const ideaResult = await deps.ideas()
    ideaPass = ideaResult.ideaPass
    secondLook = ideaResult.secondLook
  } catch (e) { ideaError = e }
  // Intentionally after the catch, not inside the news try: this always runs once.
  const qualifiedOutcomes = await deps.outcomes()
  return { summary, ideaPass, secondLook, qualifiedOutcomes, ingestError, ideaError, error: ingestError || ideaError }
}

async function main(): Promise<void> {
  if (!NEWS.enabled) {
    // The Ideas pass can still spend provider capacity when title ingestion is explicitly disabled. Take
    // the same lease as a full pass so two cron invocations cannot run independent minute limiters against
    // one account. An HTTP-only cockpit never retains this lease; it degrades provider reads instead.
    if (!acquireIngesterLock(STATE_DIR)) {
      log('another standalone news pass owns the provider lease — skipping this cycle')
      const qualifiedOutcomes = await withProviderRunDeployLease(
        STATE_DIR, () => runConfiguredQualifiedIdeaOutcomes(log),
      )
      console.log(JSON.stringify({ ok: true, skipped: 'ingester_lock_held', qualified_idea_outcomes: qualifiedOutcomes })) // eslint-disable-line no-console
      return
    }
    process.once('exit', () => releaseIngesterLock(STATE_DIR))
    try {
      await withProviderRunDeployLease(STATE_DIR, async () => {
        const { ideaPass, secondLook } = await runNormalIdeasThenSecondLook({
          ideas: () => runConfiguredIdeaPass(log),
          secondLook: () => runConfiguredRescueShadow(log, true),
          onSecondLookBlocked: () =>
            runConfiguredRescueShadow(log, false, 'The normal Ideas scan did not finish, so the second look waited.'),
        })
        const qualifiedOutcomes = await runConfiguredQualifiedIdeaOutcomes(log)
        log('news ingestion is disabled; skipped fetching and ran only independent outcome settlement')
        console.log(JSON.stringify({ ok: true, skipped: 'news_disabled', idea_pass: ideaPass, second_look: secondLook, qualified_idea_outcomes: qualifiedOutcomes })) // eslint-disable-line no-console
      })
    } finally {
      releaseIngesterLock(STATE_DIR)
    }
    return
  }
  // Single-instance lock keyed on the data dir, shared with the cockpit's in-process ingester
  // (startNewsIngester takes the SAME lock). Without it, this standalone run + an open cockpit pointed at
  // the same ENGINE_STATE_DIR would BOTH fetch, triage, and write — double-spending budgets and racing the
  // firehose/ledger writes. If the owner is alive, skip this cycle (exit 0 — not a failure; the owner does
  // the work); a dead owner's retained kernel lease disappears automatically when its process exits.
  if (!acquireIngesterLock(STATE_DIR)) {
    log('another engine already owns the ingester for this data dir — skipping this cycle (no duplicate fetching)')
    const qualifiedOutcomes = await withProviderRunDeployLease(
      STATE_DIR, () => runConfiguredQualifiedIdeaOutcomes(log),
    )
    console.log(JSON.stringify({ ok: true, skipped: 'ingester_lock_held', qualified_idea_outcomes: qualifiedOutcomes })) // eslint-disable-line no-console
    return
  }
  // Backstop: release on ANY exit path (signal / uncaught throw) so a crash can't strand the lock beyond
  // its stale-reclaim window. The explicit finally below covers normal settle paths.
  process.once('exit', () => releaseIngesterLock(STATE_DIR))
  try {
    const result = await withProviderRunDeployLease(STATE_DIR, () => runStandalonePasses({
      ingest: () => runIngestCycle({ log }),
      ideas: async () => {
        return runNormalIdeasThenSecondLook({
          ideas: () => runConfiguredIdeaPass(log),
          secondLook: () => runConfiguredRescueShadow(log, true),
          onSecondLookBlocked: () =>
            runConfiguredRescueShadow(log, false, 'The normal Ideas scan did not finish, so the second look waited.'),
        })
      },
      outcomes: () => runConfiguredQualifiedIdeaOutcomes(log),
    }))
    if (result.error) console.error('[news] fatal', result.error) // eslint-disable-line no-console
    // Keep the machine-readable settlement result visible even on a failed ingest.
    console.log(JSON.stringify(result.summary // eslint-disable-line no-console
      ? { ...result.summary, idea_pass: result.ideaPass, second_look: result.secondLook, qualified_idea_outcomes: result.qualifiedOutcomes,
          ingest_error: result.ingestError instanceof Error ? result.ingestError.message : result.ingestError,
          idea_error: result.ideaError instanceof Error ? result.ideaError.message : result.ideaError }
      : { ok: false, idea_pass: result.ideaPass, second_look: result.secondLook, qualified_idea_outcomes: result.qualifiedOutcomes,
          ingest_error: result.ingestError instanceof Error ? result.ingestError.message : result.ingestError,
          idea_error: result.ideaError instanceof Error ? result.ideaError.message : result.ideaError,
          error: result.error instanceof Error ? result.error.message : String(result.error || 'news cycle failed') }))
    process.exitCode = result.error || !result.summary?.ok ? 1 : 0
  } finally {
    releaseIngesterLock(STATE_DIR)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) void main()
