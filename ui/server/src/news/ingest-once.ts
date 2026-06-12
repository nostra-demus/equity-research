// Standalone single-cycle entrypoint — the "true 24/7" hosting mode. Run it from cron or launchd
// (see scripts/ops/) so ingestion is independent of whether the cockpit UI is open:
//
//   GROQ_API_KEY=… npm --prefix ui/server run ingest:once
//
// It runs exactly one cycle, prints the JSON summary, and exits 0 on success / 1 on failure, so a
// scheduler can detect a bad run. The Groq key must be in the environment.

import { runIngestCycle } from './runCycle'

const log = (m: string) => console.log(`[news] ${m}`) // eslint-disable-line no-console

runIngestCycle({ log })
  .then((summary) => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(summary))
    process.exit(summary.ok ? 0 : 1)
  })
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('[news] fatal', e)
    process.exit(1)
  })
