#!/usr/bin/env tsx
/** Refresh the production pulse cache before a headless research coverage check. */
import { getPulse } from '../ui/server/src/news/commodity-pulse'

async function main(): Promise<void> {
  const [swarm, rawSubject] = process.argv.slice(2)
  const subject = rawSubject?.trim().toUpperCase()
  if (!swarm || !subject) {
    console.error('usage: bash scripts/refresh-swarm-pulse.sh <swarm> <subject>')
    process.exitCode = 2
    return
  }

  const snapshot = await getPulse(swarm, { requirePriceHistory: true })
  const price = snapshot?.subjects?.[subject]?.price
  if (!price) {
    console.log(`PULSE-MISSING: ${swarm}/${subject}; coverage will abstain if no current cached quote exists`)
    return
  }
  console.log(`PULSE-REFRESHED: ${swarm}/${subject} ${price.symbol} ${price.last} ${price.unit} as of ${price.as_of}`)
}

main().catch((error: unknown) => {
  console.error(`PULSE-REFRESH-FAIL: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
