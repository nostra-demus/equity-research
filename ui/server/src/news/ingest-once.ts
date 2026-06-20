// Standalone single-cycle entrypoint — the "true 24/7" hosting mode. Run it from cron or launchd
// (see scripts/ops/) so ingestion is independent of whether the cockpit UI is open:
//
//   GROQ_API_KEY=… npm --prefix ui/server run ingest:once
//
// It runs exactly one cycle, prints the JSON summary, and exits 0 on success / 1 on failure, so a
// scheduler can detect a bad run. The Groq key must be in the environment.

import { runIngestCycle } from './runCycle'
import { acquireIngesterLock, releaseIngesterLock } from './scheduler'
import { STATE_DIR } from '../config'

const log = (m: string) => console.log(`[news] ${m}`) // eslint-disable-line no-console

// Single-instance lock keyed on the data dir, shared with the cockpit's in-process ingester
// (startNewsIngester takes the SAME lock). Without it, this standalone run + an open cockpit pointed at
// the same ENGINE_STATE_DIR would BOTH fetch, triage, and write — double-spending budgets and racing the
// firehose/ledger writes. If the owner is alive, skip this cycle (exit 0 — not a failure; the owner does
// the work); a dead owner's stale lock is reclaimed by acquireIngesterLock's PID-liveness check.
if (!acquireIngesterLock(STATE_DIR)) {
  log('another engine already owns the ingester for this data dir — skipping this cycle (no duplicate fetching)')
  process.exit(0)
}
// Backstop: release on ANY exit path (signal / uncaught throw) so a crash can't strand the lock beyond its
// stale-reclaim window. The explicit releases below cover the normal settle paths.
process.once('exit', () => releaseIngesterLock(STATE_DIR))

runIngestCycle({ log })
  .then((summary) => {
    releaseIngesterLock(STATE_DIR)
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(summary))
    process.exit(summary.ok ? 0 : 1)
  })
  .catch((e) => {
    releaseIngesterLock(STATE_DIR)
    // eslint-disable-next-line no-console
    console.error('[news] fatal', e)
    process.exit(1)
  })
