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
// fast throw (connection reset/refused) on an idempotent GET/HEAD gets ONE quick retry; a budget TIMEOUT
// does not retry (the origin is alive but slow — retrying just doubles the wait).
import OFFLINE_HTML from '../offline.html'

type ReqClass = 'sse' | 'health' | 'other'

const T_HEALTH_MS = 8000 // > app heartbeat (4s) and ensureMode (6s) so the Worker never gives up first
const T_OTHER_MS = 15000 // cold engine start + tunnel hop + heavy control-plane JSON under load
// SSE has NO budget (0) — never abort a stream.

function classify(request: Request): ReqClass {
  const accept = request.headers.get('accept') || ''
  if (accept.includes('text/event-stream')) return 'sse'
  if (new URL(request.url).pathname === '/api/health') return 'health'
  return 'other'
}

function budgetFor(cls: ReqClass): number {
  if (cls === 'sse') return 0
  if (cls === 'health') return T_HEALTH_MS
  return T_OTHER_MS
}

export default {
  async fetch(request: Request): Promise<Response> {
    const cls = classify(request)
    const budget = budgetFor(cls)
    const idempotent = request.method === 'GET' || request.method === 'HEAD'
    // Retry once only for an idempotent, non-stream request — never replay a POST /api/launch, and never
    // re-open an SSE stream from here (a thrown stream is a real failure the client reconnects itself).
    const maxAttempts = cls === 'sse' || !idempotent ? 1 : 2

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const ac = new AbortController()
      let timedOut = false
      const timer = budget ? setTimeout(() => { timedOut = true; ac.abort() }, budget) : null
      try {
        // fetch() on the incoming request goes to the application-server origin defined in DNS (the
        // cloudflared tunnel), not back to this Worker. Preserve method/headers/body; return unchanged.
        const res = await fetch(new Request(request, { signal: ac.signal }))
        // Cloudflare origin-down statuses: 521/522/523/525/526, and 530/1033 for a dead tunnel.
        if (res.status >= 520) return offline(request) // genuinely unreachable — no retry
        return res // healthy (even if slow) — pass through unchanged (SSE bodies continue after headers)
      } catch {
        // threw / aborted / timed out waiting for the origin. A budget timeout means the origin is alive
        // but slow, so a retry only doubles the wait — give up. A fast throw is a transient blip worth one
        // quick retry on an idempotent request.
        if (timedOut || attempt === maxAttempts - 1) return offline(request)
      } finally {
        if (timer) clearTimeout(timer) // only bounds time-to-headers; once res is returned SSE continues
      }
    }
    return offline(request) // unreachable (loop always returns) — keeps the type-checker happy
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
