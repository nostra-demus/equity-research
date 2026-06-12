// Groq free-tier guardrails. Two independent protections so the loop "never hits a rate limit":
//   - Budget: a persisted daily counter (requests + tokens). A cycle refuses to call Groq once
//     either daily cap is reached; the counter resets when the UTC date rolls over. Survives restarts
//     (STATE_DIR), so a server bounce can't silently reset and overspend.
//   - RateLimiter: minimum spacing between calls to stay under the requests-per-minute ceiling.
// Defaults (config.NEWS) sit under Groq's published free limits with margin; both are env-tunable.

import fs from 'node:fs'
import path from 'node:path'

function utcDate(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10) // YYYY-MM-DD
}

interface BudgetState { date: string; requests: number; tokens: number }

export class Budget {
  private state: BudgetState
  constructor(private file: string, private reqCap: number, private tokenCap: number, now = Date.now()) {
    this.state = { date: utcDate(now), requests: 0, tokens: 0 }
    try {
      const loaded = JSON.parse(fs.readFileSync(file, 'utf8')) as BudgetState
      // carry the counters only if they belong to today; otherwise a fresh day starts at zero
      if (loaded && loaded.date === this.state.date) this.state = loaded
    } catch {
      // no prior file → today starts at zero
    }
  }

  static load(stateDir: string, reqCap: number, tokenCap: number, now = Date.now()): Budget {
    return new Budget(path.join(stateDir, 'groq-budget.json'), reqCap, tokenCap, now)
  }

  /** Headroom for one more call expected to cost ~estTokens. False when either daily cap is reached. */
  canSpend(estTokens: number): boolean {
    if (this.state.requests >= this.reqCap) return false
    if (this.state.tokens + Math.max(0, estTokens) > this.tokenCap) return false
    return true
  }

  record(requests: number, tokens: number): void {
    this.state.requests += Math.max(0, requests)
    this.state.tokens += Math.max(0, tokens)
  }

  save(): void {
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true })
      fs.writeFileSync(this.file, JSON.stringify(this.state))
    } catch {
      // best-effort; a missed write only risks a slightly stale counter next cycle
    }
  }

  get requests(): number { return this.state.requests }
  get tokens(): number { return this.state.tokens }
}

/** Minimum-spacing throttle: acquire() resolves only once `60s / rpm` has passed since the last call. */
export class RateLimiter {
  private last = 0
  private minGapMs: number
  constructor(rpm: number) {
    this.minGapMs = rpm > 0 ? Math.ceil(60_000 / rpm) : 0
  }

  async acquire(sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)), now = () => Date.now()): Promise<void> {
    const wait = this.last + this.minGapMs - now()
    if (wait > 0) await sleep(wait)
    this.last = now()
  }
}
