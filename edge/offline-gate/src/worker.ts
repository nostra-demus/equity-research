// Edge "offline gate" for app.nostra-demus.com.
//
// The cockpit is served BY the operator's laptop (a Fastify engine behind a Cloudflare Tunnel). When the
// laptop sleeps/shuts off the origin dies and a fresh visitor would get Cloudflare's raw error page. This
// Worker sits on the hostname route and, when the origin is down, returns an honest "offline" response
// instead — BUT it is request-intent aware:
//   - document navigations -> a branded offline HTML page (so people SEE "offline")
//   - /api/* -> JSON 503 (never HTML-as-API, which would make the in-app heartbeat misread an outage as
//     a sign-in/Access problem)
//   - other assets -> 503 text (never offline HTML as JS/CSS)
// Every offline response carries `x-engine-status: offline` so the in-app heartbeat can tell an engine
// outage apart from an Access/session expiry. When the origin is UP, the Worker passes everything through
// unchanged (SSE streams, POST /api/launch, hashed assets — all behave exactly as before).
//
// Timeout policy — the gate must declare "offline" ONLY when the origin is genuinely unreachable, never
// merely slow. A single short blanket abort used to guillotine the heavier control-plane calls
// (/api/swarm, /api/tickers) the cockpit must complete before it goes live, pinning a HEALTHY engine at
// "connecting"/"offline" whenever those round-trips through the tunnel took >4s (cold start, load). So the
// budget is now per request-class:
//   - SSE (text/event-stream): no abort timer at all. The engine writes headers immediately and pings
//     every 15s; the timer only bounds time-to-headers, so for a stream it is pure risk with no benefit.
//   - /api/health: a short budget — it must stay >= the app's own health probes (4s in the heartbeat, 6s
//     in ensureMode) so the Worker is never the FIRST layer to give up on a reachable engine.
//   - everything else (other /api/*, documents, assets): a generous budget that covers a cold engine
//     start + the tunnel hop + heavy JSON under load.
// A genuine Cloudflare origin-down (status >= 520) is still instant-offline with no wait. A transient
// fast throw (connection reset/refused) gets ONE quick retry only for the health probe and non-API
// documents/assets; method alone is not enough because some historical GET API routes have side effects.
// A budget TIMEOUT does not retry (the origin is alive but slow — retrying just doubles the wait). Raw
// 502/504 follows the same narrow allowlist; exact GET /api/health waits 750ms first so a watchdog probe can
// route around a stale, draining Tunnel connector. Both health attempts share ONE deadline, and other API
// calls, POST, and SSE are never replayed.
import OFFLINE_HTML from '../offline.html'
import { STATE_VERSION, initialState, interpretProbe, decide } from './monitor.mjs'
import { alertText, sendAlert } from './alert.mjs'
import { classifyRequest, proxyOrigin } from './proxy.mjs'

// ── external uptime monitor (see monitor.mjs / alert.mjs) ──────────────────────────────────────
// The `fetch` proxy (below) only REACTS to visitors; this adds a cron-driven heartbeat that watches
// the origin from Cloudflare's edge — independent of both Macs and of the operator's laptop network —
// and PUSHES an alert when the site is down (and when it recovers). The heartbeat is opt-in: with no KV
// binding the scheduled() tick no-ops, so the PROXY behaviour is byte-for-byte unchanged until the
// monitor is enabled (wrangler.toml "ENABLE THE UPTIME MONITOR" block + secrets). Two small things DO
// ship active regardless of the opt-in: `GET /__status` is answered by the Worker on both hosts (it
// returns {monitor:"disabled"} until enabled), and the workers.dev host now returns 404 instead of
// proxying (which would loop). All of it is wrapped so it can never crash the Worker or touch the proxy.
//
// CONSISTENCY NOTE: state lives in KV, which is eventually consistent (~60s) and cron ticks have no colo
// affinity. The "exactly one DOWN page per outage" guarantee can therefore, rarely, emit a duplicate
// page if two consecutive ticks land on colos before the alertedDown write has propagated. That is a
// tolerable extra notification (never a missed or false outage); a Durable Object would make it strict.

// Minimal runtime shapes — declared here so the Worker needs no @cloudflare/workers-types dependency.
interface KVNamespace {
  get(key: string): Promise<string | null>
  put(key: string, value: string): Promise<void>
}
interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void
}
interface ScheduledController {
  scheduledTime: number
  cron: string
}
export interface Env {
  MONITOR_STATE?: KVNamespace
  MONITOR_ENABLED?: string
  MONITOR_PROBE_URL?: string
  MONITOR_FAIL_THRESHOLD?: string
  MONITOR_REMIND_MINUTES?: string
  MONITOR_ALERT_FORMAT?: string
  MONITOR_ALERT_WEBHOOK_URL?: string
  MONITOR_ACCESS_CLIENT_ID?: string
  MONITOR_ACCESS_CLIENT_SECRET?: string
  MONITOR_TELEGRAM_TOKEN?: string
  MONITOR_TELEGRAM_CHAT_ID?: string
  MONITOR_PUSHOVER_TOKEN?: string
  MONITOR_PUSHOVER_USER?: string
}

const STATE_KEY = 'state'
const PROBE_TIMEOUT_MS = 10_000
const MONITOR_HEARTBEAT_MS = 30 * 60_000 // persist at least this often (keeps /__status fresh, proves liveness)

function hostOf(u: string | undefined, fallback = 'app.nostra-demus.com'): string {
  try {
    return u ? new URL(u).hostname : fallback
  } catch {
    return fallback
  }
}

// Probe the origin health endpoint. `redirect: 'manual'` so an Access challenge is visible as a 302
// (→ 'auth') rather than silently followed into a login page.
async function probeOrigin(env: Env): Promise<{ probe: ReturnType<typeof interpretProbe>; detail: string }> {
  const url = env.MONITOR_PROBE_URL || 'https://app.nostra-demus.com/api/health'
  const headers: Record<string, string> = { accept: 'application/json', 'user-agent': 'nostra-uptime-monitor/1' }
  if (env.MONITOR_ACCESS_CLIENT_ID && env.MONITOR_ACCESS_CLIENT_SECRET) {
    headers['CF-Access-Client-Id'] = env.MONITOR_ACCESS_CLIENT_ID
    headers['CF-Access-Client-Secret'] = env.MONITOR_ACCESS_CLIENT_SECRET
  }
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), PROBE_TIMEOUT_MS)
  try {
    const res = await fetch(url, { method: 'GET', headers, redirect: 'manual', signal: ac.signal })
    const probe = interpretProbe(res.status, res.headers.get('x-engine-status'), res.headers.get('location'))
    return { probe, detail: `status=${res.status} x-engine-status=${res.headers.get('x-engine-status') || '-'}` }
  } catch (e) {
    return { probe: 'error', detail: `probe threw: ${String((e as { message?: string })?.message || e)}` }
  } finally {
    clearTimeout(timer)
  }
}

// One cron tick: read state → probe → decide → persist → push any alerts. Never throws.
async function runMonitorTick(env: Env, ctx: ExecutionContext): Promise<void> {
  if (!env.MONITOR_STATE) return // no KV bound → monitor disabled (offline-gate unaffected)
  if ((env.MONITOR_ENABLED ?? '1') === '0') return
  const now = Date.now()

  let prev
  try {
    const raw = await env.MONITOR_STATE.get(STATE_KEY)
    prev = raw ? JSON.parse(raw) : initialState(now)
    if (!prev || prev.v !== STATE_VERSION) prev = initialState(now)
  } catch {
    prev = initialState(now)
  }

  const { probe, detail } = await probeOrigin(env)
  const cfg = {
    threshold: Number(env.MONITOR_FAIL_THRESHOLD || 3),
    remindMs: Number(env.MONITOR_REMIND_MINUTES || 0) * 60_000,
  }
  const { next, alerts } = decide(prev, probe, now, cfg)
  ;(next as Record<string, unknown>).detail = detail

  // Coalesce writes: a naive 1-write-per-minute is 1,440/day, over the free plan's ~1,000/day cap — and
  // a 429'd write would then FREEZE the state so the hysteresis never advances (a real outage wouldn't
  // page). So persist only when something behaviour-affecting moved, or on a slow heartbeat to keep
  // /__status fresh. A steady site writes ~48/day; an outage writes only on its transitions.
  // (`consecutiveDown` / `updatedAt` / `detail` alone never force a write.)
  const material =
    alerts.length > 0 ||
    next.status !== prev.status ||
    next.downSince !== prev.downSince ||
    next.alertedDown !== prev.alertedDown ||
    next.authWarned !== prev.authWarned ||
    next.lastDownAlert !== prev.lastDownAlert
  const heartbeatDue = now - (prev.updatedAt || 0) >= MONITOR_HEARTBEAT_MS
  if (material || heartbeatDue) {
    try {
      await env.MONITOR_STATE.put(STATE_KEY, JSON.stringify(next))
    } catch {
      /* a persist failure must not stop us from alerting */
    }
  }

  const host = hostOf(env.MONITOR_PROBE_URL)
  console.log(`[monitor] probe=${probe} status=${next.status} consecutiveDown=${next.consecutiveDown} alerts=${alerts.length} (${detail})`)
  for (const a of alerts) {
    const text = alertText(a, host)
    ctx.waitUntil(
      // alert.mjs reads only string-valued channel settings; MONITOR_STATE is the one non-string Env
      // member and is never inspected there. Keep that JS boundary explicit for standalone tsc checks.
      sendAlert(env as unknown as Record<string, string | undefined>, text).then((r) =>
        console.log(`[monitor] alert kind=${a.kind} -> ${JSON.stringify(r)}`),
      ),
    )
  }
}

// GET /__status → the monitor's current view as JSON. Timestamps are rendered ISO for humans.
async function statusResponse(env: Env): Promise<Response> {
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  if (!env.MONITOR_STATE) {
    return new Response(JSON.stringify({ monitor: 'disabled', reason: 'no KV binding' }, null, 2), { headers })
  }
  const iso = (ms: number | null | undefined) => (typeof ms === 'number' ? new Date(ms).toISOString() : null)
  try {
    const raw = await env.MONITOR_STATE.get(STATE_KEY)
    if (!raw) return new Response(JSON.stringify({ monitor: 'enabled', status: 'unknown', note: 'no tick yet' }, null, 2), { headers })
    const s = JSON.parse(raw)
    const body = {
      monitor: 'enabled',
      status: s.status,
      lastResult: s.lastResult,
      consecutiveDown: s.consecutiveDown,
      downSince: iso(s.downSince),
      lastUp: iso(s.lastUp),
      lastChange: iso(s.lastChange),
      updatedAt: iso(s.updatedAt),
      detail: s.detail ?? null,
      probeUrl: env.MONITOR_PROBE_URL || 'https://app.nostra-demus.com/api/health',
    }
    return new Response(JSON.stringify(body, null, 2), { headers })
  } catch (e) {
    return new Response(JSON.stringify({ monitor: 'enabled', error: String((e as { message?: string })?.message || e) }, null, 2), { headers })
  }
}

const T_HEALTH_MS = 8000 // one shared deadline: > app probes (4s/6s), < watchdog's 12s public limit
const T_OTHER_MS = 15000 // cold engine start + tunnel hop + heavy control-plane JSON under load
// SSE has NO budget (0) — never abort a stream.

function budgetFor(cls: ReturnType<typeof classifyRequest>): number {
  if (cls === 'sse') return 0
  if (cls === 'health') return T_HEALTH_MS
  return T_OTHER_MS
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // The monitor's status surface. On the custom domain it sits behind Access (team-only, fine); on
    // the workers.dev host it is the ONLY thing served (an Access-free external status URL a status
    // page / nostra-status.sh can poll from anywhere).
    if (url.pathname === '/__status') return statusResponse(env)
    if (url.hostname.endsWith('.workers.dev')) {
      // Never proxy on workers.dev — fetch(request) would resolve back to this Worker and loop.
      return new Response('not found — try /__status', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } })
    }

    const cls = classifyRequest(request)
    const budget = budgetFor(cls)

    // proxyOrigin constructs a fresh Request for its one safe retry, while one AbortController deadline
    // covers the complete sequence. Successful responses are always the actual origin Response.
    const result = await proxyOrigin(request, fetch, { budgetMs: budget })
    return result.kind === 'response' ? result.response : offline(request)
  },

  // Cron heartbeat (wrangler.toml [triggers].crons). Wrapped so a monitor failure can never surface
  // to a visitor — the proxy above is entirely independent of this.
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runMonitorTick(env, ctx).catch((e) => console.log(`[monitor] tick failed: ${String(e)}`)))
  },
}

function offline(request: Request): Response {
  const url = new URL(request.url)
  const accept = request.headers.get('accept') || ''
  const isApi = url.pathname.startsWith('/api/')
  const isDocument =
    request.method === 'GET' && (accept.includes('text/html') || request.headers.get('sec-fetch-dest') === 'document')
  const marker = { 'cache-control': 'no-store', 'x-engine-status': 'offline' }

  if (isApi) {
    const body = url.pathname === '/api/health' ? { ok: false, reason: 'engine-offline' } : { error: 'engine-offline' }
    return new Response(JSON.stringify(body), {
      status: 503,
      headers: { 'content-type': 'application/json; charset=utf-8', ...marker },
    })
  }
  if (isDocument) {
    return new Response(OFFLINE_HTML, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', ...marker } })
  }
  // asset / non-document request — never return HTML as JS/CSS
  return new Response('engine offline', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8', ...marker } })
}
