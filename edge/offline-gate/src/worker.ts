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
import OFFLINE_HTML from '../offline.html'

const ORIGIN_TIMEOUT_MS = 4000

export default {
  async fetch(request: Request): Promise<Response> {
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), ORIGIN_TIMEOUT_MS)
    try {
      // fetch() on the incoming request goes to the application-server origin defined in DNS (the
      // cloudflared tunnel), not back to this Worker. Preserve method/headers/body; return unchanged.
      const res = await fetch(new Request(request, { signal: ac.signal }))
      // Cloudflare origin-down statuses: 521/522/523/525/526, and 530/1033 for a dead tunnel.
      if (res.status >= 520) return offline(request)
      return res
    } catch {
      // threw / aborted / timed out waiting for the origin
      return offline(request)
    } finally {
      clearTimeout(timer) // only bounds time-to-headers; once res is returned, SSE streams continue
    }
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
