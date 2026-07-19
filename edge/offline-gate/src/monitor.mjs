// monitor.mjs — pure, dependency-free uptime-monitor logic for the edge worker.
//
// The offline-gate Worker only REACTS to inbound visitors; nothing watches the site from OUTSIDE
// both Macs and nobody is told when it goes down. This module is the brain of a cron-driven external
// heartbeat (see worker.ts `scheduled`) that fixes that: every minute Cloudflare invokes the Worker,
// it probes the origin health endpoint, and this code decides — with hysteresis so a normal ~15-30s
// engine redeploy never alarms — whether to push a DOWN / RECOVERY / still-DOWN / can't-authenticate
// alert.
//
// It is deliberately pure (state in → {state, alerts} out, no fetch, no clock, no KV) so it is
// exhaustively unit-testable by node:test with ZERO install and ZERO network — see
// test/monitor.test.mjs, wired into CI. All I/O lives in worker.ts.

export const STATE_VERSION = 1

/** One probe outcome. @typedef {'up'|'down'|'auth'|'error'} ProbeResult */

/**
 * @typedef {Object} MonitorState
 * @property {number}  v                schema version (STATE_VERSION)
 * @property {'up'|'down'|'unknown'} status  the monitor's committed public verdict
 * @property {number}  consecutiveDown  failures in a row (reset by any 'up')
 * @property {number|null} downSince     epoch ms of the FIRST failure in the current streak
 * @property {number|null} lastUp        epoch ms the origin was last seen healthy
 * @property {number}  lastChange       epoch ms of the last status transition
 * @property {boolean} alertedDown       have we already pushed the DOWN alert for this outage?
 * @property {number|null} lastDownAlert epoch ms of the last down/reminder push (for remind cadence)
 * @property {boolean} authWarned        have we already warned that the probe can't authenticate?
 * @property {ProbeResult} lastResult    the most recent raw probe outcome
 * @property {number}  updatedAt         epoch ms this state was written
 */

/**
 * A fresh, never-observed state.
 * @param {number} now epoch ms
 * @returns {MonitorState}
 */
export function initialState(now) {
  return {
    v: STATE_VERSION,
    status: 'unknown',
    consecutiveDown: 0,
    downSince: null,
    lastUp: null,
    lastChange: now,
    alertedDown: false,
    lastDownAlert: null,
    authWarned: false,
    lastResult: 'up',
    updatedAt: now,
  }
}

/**
 * Classify ONE probe of the origin health endpoint. The probe is done with `redirect: 'manual'`
 * so we can SEE an Access challenge (302 → *.cloudflareaccess.com) rather than silently following
 * it into a login page and misreading it. Conservative on purpose: anything we can't confidently
 * read as down is 'error' (counts toward the streak but the threshold guards it) or 'auth' (never
 * counts — we literally cannot tell, so we must not fabricate an outage).
 *
 * @param {number|null} status         HTTP status of the probe, or null if fetch threw/aborted.
 * @param {string|null} engineStatus   the `x-engine-status` header (offline-gate's own marker).
 * @param {string|null} location       the `location` header on a 3xx (to spot an Access redirect).
 * @returns {ProbeResult}
 */
export function interpretProbe(status, engineStatus, location) {
  if (status === null) return 'error' // fetch threw / aborted — origin likely unreachable
  if (engineStatus === 'offline') return 'down' // the offline-gate itself declared the origin down
  // Cloudflare Access answers a request it won't let through: a browser-style (Accept: text/html) probe
  // gets a 302 to *.cloudflareaccess.com; an API-style (Accept: application/json) or a rejected/expired
  // service token gets a 401/403. All of these mean "the probe couldn't authenticate", NOT "the site is
  // down" — the engine's own /api/health only ever returns 200/503, so a 401/403 on THIS path can only
  // come from Access. Classify every one as 'auth' so decide() never fabricates an outage from a token
  // problem (that would be the exact false-alarm this monitor exists to avoid).
  if (status === 401 || status === 403) return 'auth'
  if (status >= 300 && status < 400) {
    if (location && /(^|\.)cloudflareaccess\.com/i.test(location)) return 'auth' // Access login redirect
    return 'error' // some other redirect — inconclusive
  }
  if (status >= 520) return 'down' // Cloudflare origin-down family (521-527, 530/1033)
  if (status === 502 || status === 504) return 'down' // cloudflared: no origin / origin timed out
  if (status >= 200 && status < 300) return 'up' // the engine answered its health check
  return 'error' // a bare 503 with no marker, other 4xx, etc. — do not alarm on ambiguous codes
}

/**
 * The pure state machine. Given the prior state and a fresh probe, return the next state and any
 * alerts to push. Never mutates `prev`.
 *
 * Rules:
 *  - 'auth'  → HOLD status. We can't tell up from down, so never invent an outage; warn ONCE so the
 *              operator fixes the service token, then stay silent until a real probe clears it.
 *  - 'up'    → reset the streak; if we were DOWN and had alerted, emit a RECOVERY.
 *  - 'down'/'error' → increment the streak. Only once it reaches `threshold` do we flip to DOWN and
 *              alert (this grace window swallows the normal engine-redeploy blip). One DOWN alert per
 *              outage; optional reminders every `remindMs` while still down.
 *
 * @param {MonitorState} prev
 * @param {ProbeResult} probe
 * @param {number} now epoch ms
 * @param {{threshold:number, remindMs:number}} cfg
 * @returns {{next: MonitorState, alerts: Array<{kind:'down'|'recovery'|'reminder'|'auth', downSince:number|null, now:number}>}}
 */
export function decide(prev, probe, now, cfg) {
  const threshold = Math.max(1, Math.trunc(cfg.threshold) || 1)
  const remindMs = Math.max(0, Math.trunc(cfg.remindMs) || 0)
  const next = { ...prev, v: STATE_VERSION, lastResult: probe, updatedAt: now }
  /** @type {Array<{kind:'down'|'recovery'|'reminder'|'auth', downSince:number|null, now:number}>} */
  const alerts = []

  if (probe === 'auth') {
    if (!prev.authWarned) {
      alerts.push({ kind: 'auth', downSince: null, now })
      next.authWarned = true
    }
    return { next, alerts }
  }

  if (probe === 'up') {
    if (prev.status === 'down' && prev.alertedDown) {
      alerts.push({ kind: 'recovery', downSince: prev.downSince, now })
    }
    if (prev.status !== 'up') next.lastChange = now
    next.status = 'up'
    next.consecutiveDown = 0
    next.downSince = null
    next.alertedDown = false
    next.lastDownAlert = null
    next.authWarned = false // a healthy probe means auth works again; re-warn if it breaks later
    next.lastUp = now
    return { next, alerts }
  }

  // probe === 'down' || 'error' → a failure. Hysteresis absorbs transients.
  next.consecutiveDown = prev.consecutiveDown + 1
  next.downSince = prev.consecutiveDown === 0 ? now : prev.downSince ?? now

  if (next.consecutiveDown >= threshold) {
    if (prev.status !== 'down') next.lastChange = now
    next.status = 'down'
    if (!prev.alertedDown) {
      alerts.push({ kind: 'down', downSince: next.downSince, now })
      next.alertedDown = true
      next.lastDownAlert = now
    } else if (remindMs > 0 && prev.lastDownAlert != null && now - prev.lastDownAlert >= remindMs) {
      alerts.push({ kind: 'reminder', downSince: next.downSince, now })
      next.lastDownAlert = now
    }
  } else {
    // Still inside the grace window — keep the prior PUBLIC status (do not flip to down, do not alert).
    next.status = prev.status
  }
  return { next, alerts }
}
