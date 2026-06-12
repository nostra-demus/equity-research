// In-server scheduler — the "runs whenever the cockpit is up" hosting mode. One guarded call from
// server.ts after the control plane binds; if there's no Groq key (or NEWS_INGEST_ENABLED=0) it logs
// once and stays dark, so a keyless deploy behaves exactly as before. A cycle never throws and never
// blocks the event loop; the interval is unref'd so it can't, by itself, keep the process alive.

import { NEWS } from '../config'
import { runIngestCycle } from './runCycle'

let timer: ReturnType<typeof setInterval> | null = null
let running = false

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
    try { await runIngestCycle({ log }) } catch (e: any) { log(`cycle error: ${e?.message || e}`) } finally { running = false }
  }
  setTimeout(tick, 5000) // let the server settle, then run the first cycle
  timer = setInterval(tick, NEWS.pollIntervalMin * 60_000)
  timer.unref?.()
  log(`ingester on — every ${NEWS.pollIntervalMin} min · model ${NEWS.groqModel}`)
}

export function stopNewsIngester(): void {
  if (timer) { clearInterval(timer); timer = null }
}
