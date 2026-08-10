// Pure origin-proxy retry policy for the offline-gate Worker.
//
// A tunnel restart can briefly leave one draining connector alongside its healthy replacement. During
// that overlap, one /api/health request can land on the stale connector and receive a fast raw 502/504.
// The legacy watchdog treats that single public failure as a reason to restart the tunnel again, which
// can prolong the overlap. Delay its ONE safe response retry long enough for a fresh request to have a
// better chance of reaching the healthy connector. Application traffic keeps its existing behavior.

export const HEALTH_GATEWAY_RETRY_DELAY_MS = 750

/** @typedef {'sse'|'health'|'other'} RequestClass */

/**
 * @param {Request} request
 * @returns {RequestClass}
 */
export function classifyRequest(request) {
  const accept = request.headers.get('accept') || ''
  if (accept.includes('text/event-stream')) return 'sse'
  if (new URL(request.url).pathname === '/api/health') return 'health'
  return 'other'
}

function isIdempotent(request) {
  return request.method === 'GET' || request.method === 'HEAD'
}

function isRawGatewayFailure(status) {
  return status === 502 || status === 504
}

function isDelayedHealthRetry(request, cls) {
  return cls === 'health' && request.method === 'GET'
}

async function discard(response) {
  if (response.body) await response.body.cancel().catch(() => undefined)
}

function abortableSleep(ms, signal) {
  if (signal.aborted) return Promise.resolve()
  return new Promise((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      signal.removeEventListener('abort', onAbort)
      resolve()
    }
    const timer = setTimeout(finish, ms)
    const onAbort = () => {
      clearTimeout(timer)
      finish()
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * Proxy one request. Every retry constructs a fresh Request. Exact GET health retries share one overall
 * AbortController/deadline so the first attempt, health backoff, and retry stay inside the watchdog's public
 * timeout. Other requests preserve the prior per-attempt budget. The function returns either a real origin
 * Response or an offline decision; it never invents success.
 *
 * Raw gateway responses keep the established one retry for idempotent, non-SSE requests. Only an exact
 * GET /api/health inserts a delay before that retry. POST/other unsafe methods and SSE never replay.
 * A thrown idempotent request retains its existing one immediate retry; a deadline abort never retries.
 *
 * @param {Request} request
 * @param {(request:Request) => Promise<Response>} fetchImpl
 * @param {{budgetMs:number, sleepImpl?:(ms:number, signal:AbortSignal)=>Promise<void>, controllerFactory?:()=>AbortController}} options
 * @returns {Promise<{kind:'response', response:Response}|{kind:'offline'}>}
 */
export async function proxyOrigin(request, fetchImpl, options) {
  const cls = classifyRequest(request)
  const idempotent = isIdempotent(request)
  const canRetry = cls !== 'sse' && idempotent
  const maxAttempts = canRetry ? 2 : 1
  const sharesHealthDeadline = isDelayedHealthRetry(request, cls)
  const controllerFactory = options.controllerFactory || (() => new AbortController())
  const sharedController = sharesHealthDeadline ? controllerFactory() : null
  const sleepImpl = options.sleepImpl || abortableSleep
  let sharedTimedOut = false
  const sharedDeadline = sharesHealthDeadline && options.budgetMs > 0
    ? setTimeout(() => {
        sharedTimedOut = true
        sharedController?.abort()
      }, options.budgetMs)
    : null

  try {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const controller = sharedController || controllerFactory()
      let attemptTimedOut = false
      const attemptDeadline = !sharesHealthDeadline && options.budgetMs > 0
        ? setTimeout(() => {
            attemptTimedOut = true
            controller.abort()
          }, options.budgetMs)
        : null
      let response
      try {
        // A new Request is required for the retry; safe because canRetry excludes methods with bodies.
        response = await fetchImpl(new Request(request, { signal: controller.signal }))
      } catch {
        // A budget timeout means the origin was slow. Do not multiply its load or overrun the applicable
        // deadline. Fast connection throws retain the established one retry for safe requests.
        const timedOut = sharesHealthDeadline ? sharedTimedOut : attemptTimedOut
        if (timedOut || controller.signal.aborted || attempt === maxAttempts - 1) return { kind: 'offline' }
        continue
      } finally {
        if (attemptDeadline) clearTimeout(attemptDeadline)
      }

      // Cloudflare origin-down statuses: 521/522/523/525/526 and 530/1033. These are already a firm
      // outage signal, so do not delay the honest offline response.
      if (response.status >= 520) {
        await discard(response)
        return { kind: 'offline' }
      }

      if (isRawGatewayFailure(response.status)) {
        await discard(response)
        if (attempt === maxAttempts - 1) return { kind: 'offline' }

        // Only the watchdog's exact GET health probe gets backoff. Other safe requests preserve the
        // prior immediate retry, while POST/SSE never reach this branch with another attempt available.
        if (isDelayedHealthRetry(request, cls)) {
          await sleepImpl(HEALTH_GATEWAY_RETRY_DELAY_MS, controller.signal)
          if (sharedTimedOut || controller.signal.aborted) return { kind: 'offline' }
        }
        continue
      }

      // In particular, a bare 503 can be a deliberate engine response. Pass it through unchanged; only
      // offline(request) may turn a proven origin failure into the marked x-engine-status response.
      return { kind: 'response', response }
    }

    return { kind: 'offline' }
  } finally {
    if (sharedDeadline) clearTimeout(sharedDeadline)
  }
}
