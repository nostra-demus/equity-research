// In-server scheduler — the "runs whenever the cockpit is up" hosting mode. One guarded call from
// server.ts after the control plane binds; if there's no Groq key (or NEWS_INGEST_ENABLED=0) it logs
// once and stays dark, so a keyless deploy behaves exactly as before. A cycle never throws and never
// blocks the event loop; the interval is unref'd so it can't, by itself, keep the process alive.
//
// The scheduler also carries the ingester's STATUS for the cockpit's auto-scan chip: when the last
// cycle ran, when the next is due, and today's read/kept/dropped — the daily counts are summed from
// the firehose file on disk so a server restart never zeroes them.

import fs from 'node:fs'
import path from 'node:path'
import { NEWS, REPO_ROOT, STATE_DIR } from '../config'
import { readFeed } from './feed'
import { runIngestCycle } from './runCycle'
import type { CycleSummary } from './types'

let timer: ReturnType<typeof setInterval> | null = null
let running = false
let lastCycleAt: string | null = null
let nextCycleAt: string | null = null
let lastNote: string | null = null

export interface NewsStatus {
  enabled: boolean
  running: boolean
  intervalMin: number
  model: string
  rssEnabled: boolean
  lastCycleAt: string | null
  nextCycleAt: string | null
  lastNote: string | null
  today: { read: number; kept: number; dropped: number; cycles: number }
  budget: { requests: number; tokens: number; reqCap: number; tokenCap: number }
}

/** Status for the cockpit. Daily counts come from today's firehose ON DISK (restart-proof). */
export function getNewsStatus(): NewsStatus {
  const todayDate = new Date().toISOString().slice(0, 10)
  const today = { read: 0, kept: 0, dropped: 0, cycles: 0 }
  try {
    const { cycles } = readFeed(REPO_ROOT, 1)
    for (const c of cycles as CycleSummary[]) {
      if ((c.ts || '').slice(0, 10) !== todayDate) continue
      today.cycles++
      today.read += c.candidates || 0
      today.kept += (c.picked || 0) + (c.watched || 0)
      today.dropped += c.dropped || 0
    }
  } catch {
    // a status read never throws
  }
  const budget = { requests: 0, tokens: 0, reqCap: NEWS.groqDailyReqCap, tokenCap: NEWS.groqDailyTokenCap }
  try {
    // read the persisted daily counter directly (same file Budget writes); counts only if today's
    const b = JSON.parse(fs.readFileSync(path.join(STATE_DIR, 'groq-budget.json'), 'utf8'))
    if (b?.date === todayDate) {
      budget.requests = Number(b.requests) || 0
      budget.tokens = Number(b.tokens) || 0
    }
  } catch {
    // best-effort
  }
  return {
    enabled: NEWS.enabled,
    running,
    intervalMin: NEWS.pollIntervalMin,
    model: NEWS.groqModel,
    rssEnabled: NEWS.rssEnabled,
    lastCycleAt,
    nextCycleAt: NEWS.enabled ? nextCycleAt : null,
    lastNote,
    today,
    budget,
  }
}

export function startNewsIngester(): void {
  if (!NEWS.enabled) {
    // eslint-disable-next-line no-console
    console.log(NEWS.groqApiKey ? '[news] ingester disabled (NEWS_INGEST_ENABLED=0)' : '[news] ingester idle — set GROQ_API_KEY to turn it on')
    return
  }
  if (timer) return
  const log = (m: string) => console.log(`[news] ${m}`) // eslint-disable-line no-console
  const tick = async () => {
    if (running) return // never overlap cycles
    running = true
    // next fire is interval-anchored from the tick START (matches setInterval's cadence)
    nextCycleAt = new Date(Date.now() + NEWS.pollIntervalMin * 60_000).toISOString().replace(/\.\d{3}Z$/, 'Z')
    try {
      const summary = await runIngestCycle({ log })
      lastNote = summary.note || null
    } catch (e: any) {
      log(`cycle error: ${e?.message || e}`)
      lastNote = `cycle error: ${e?.message || e}`
    } finally {
      running = false
      lastCycleAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
    }
  }
  setTimeout(tick, 5000) // let the server settle, then run the first cycle
  nextCycleAt = new Date(Date.now() + 5000).toISOString().replace(/\.\d{3}Z$/, 'Z')
  timer = setInterval(tick, NEWS.pollIntervalMin * 60_000)
  timer.unref?.()
  log(`ingester on — every ${NEWS.pollIntervalMin} min · model ${NEWS.groqModel}${NEWS.rssEnabled ? ' · gdelt+rss' : ' · gdelt only'}`)
}

export function stopNewsIngester(): void {
  if (timer) { clearInterval(timer); timer = null }
}
