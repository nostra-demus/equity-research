// alert.mjs — turn a monitor decision into a phone push. Pure formatter (alertText / buildRequest)
// plus a thin sender (sendAlert) with `fetch` injectable, so everything is unit-testable offline.
//
// The delivery channel is whatever YOU already carry a phone app for — pick one with
// MONITOR_ALERT_FORMAT and give it its URL/keys as Worker secrets. No new account beyond the one
// you choose. Supported formats: json (generic {title,message,level} POST — default), slack, discord,
// ntfy, telegram, pushover. If nothing is configured the monitor stays silent (and says so).

/**
 * Human-readable elapsed time. Coarse on purpose — an alert wants "3m" / "1h 20m", not "184s".
 * @param {number|null|undefined} ms
 * @returns {string}
 */
export function humanDuration(ms) {
  let n = typeof ms === 'number' && ms > 0 ? ms : 0
  const s = Math.round(n / 1000)
  if (s < 90) return `${s}s`
  const m = Math.round(s / 60)
  if (m < 90) return `${m}m`
  const h = Math.floor(m / 60)
  const mr = m % 60
  return mr ? `${h}h ${mr}m` : `${h}h`
}

/**
 * Render an alert into a title/message/level. `level` maps to per-provider priority downstream.
 * @param {{kind:'down'|'recovery'|'reminder'|'auth', downSince:number|null, now:number}} a
 * @param {string} host e.g. 'app.nostra-demus.com'
 * @returns {{title:string, message:string, level:'error'|'warning'|'info'}}
 */
export function alertText(a, host) {
  const dur = a.downSince != null ? humanDuration(a.now - a.downSince) : ''
  switch (a.kind) {
    case 'down':
      return {
        level: 'error',
        title: `🔴 ${host} is DOWN`,
        message: `Unreachable from Cloudflare's edge for ${dur}. The origin (the Mac Pro engine behind the tunnel) is not answering. This check runs on Cloudflare, independent of your laptop — so this is the server, not your connection. Check the Pro.`,
      }
    case 'reminder':
      return {
        level: 'error',
        title: `🔴 ${host} still DOWN`,
        message: `Still unreachable — down ${dur} and counting.`,
      }
    case 'recovery':
      return {
        level: 'info',
        title: `🟢 ${host} recovered`,
        message: `Back up${dur ? ` after ${dur} down` : ''}. The origin is answering again.`,
      }
    case 'auth':
      return {
        level: 'warning',
        title: `⚠️ ${host} monitor can't authenticate`,
        message: `The uptime monitor got a Cloudflare Access challenge instead of the health endpoint, so it CANNOT tell whether the site is up. Set the Access service-token secrets (MONITOR_ACCESS_CLIENT_ID / MONITOR_ACCESS_CLIENT_SECRET). Until then, no outage alerts can fire.`,
      }
    default:
      return { level: 'info', title: `${host} status`, message: String(a.kind) }
  }
}

function jsonInit(obj) {
  return { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(obj) }
}

/**
 * Build the concrete HTTP request for the configured provider, or null if it isn't configured.
 * Pure — no network. Reads config off `env`.
 * @param {Record<string,string|undefined>} env
 * @param {{title:string, message:string, level:'error'|'warning'|'info'}} text
 * @returns {{url:string, init:RequestInit}|null}
 */
export function buildRequest(env, text) {
  const fmt = (env.MONITOR_ALERT_FORMAT || 'json').toLowerCase()
  const url = env.MONITOR_ALERT_WEBHOOK_URL || ''
  const oneLine = `${text.title}\n${text.message}`
  switch (fmt) {
    case 'ntfy': {
      if (!url) return null
      // The Title is an HTTP HEADER — its value must be a ByteString (code points <= 255), so the emoji
      // in text.title (🔴/🟢/⚠️ are > 255) would make fetch() throw. Strip to printable ASCII; the emoji
      // still shows via the `Tags` header (ntfy renders tag names as emoji).
      const asciiTitle = text.title.replace(/[^\x20-\x7E]/g, '').replace(/\s+/g, ' ').trim() || 'nostra alert'
      return {
        url,
        init: {
          method: 'POST',
          body: text.message,
          headers: {
            Title: asciiTitle,
            Priority: text.level === 'error' ? 'urgent' : text.level === 'warning' ? 'high' : 'default',
            Tags: text.level === 'error' ? 'rotating_light' : text.level === 'info' ? 'white_check_mark' : 'warning',
          },
        },
      }
    }
    case 'slack':
      if (!url) return null
      return { url, init: jsonInit({ text: oneLine }) }
    case 'discord':
      if (!url) return null
      return { url, init: jsonInit({ content: oneLine }) }
    case 'telegram': {
      const token = env.MONITOR_TELEGRAM_TOKEN
      const chat = env.MONITOR_TELEGRAM_CHAT_ID
      if (!token || !chat) return null
      return { url: `https://api.telegram.org/bot${token}/sendMessage`, init: jsonInit({ chat_id: chat, text: oneLine }) }
    }
    case 'pushover': {
      const token = env.MONITOR_PUSHOVER_TOKEN
      const user = env.MONITOR_PUSHOVER_USER
      if (!token || !user) return null
      const form = new URLSearchParams({
        token,
        user,
        title: text.title,
        message: text.message,
        priority: text.level === 'error' ? '1' : '0',
      })
      return {
        url: 'https://api.pushover.net/1/messages.json',
        init: { method: 'POST', body: form, headers: { 'content-type': 'application/x-www-form-urlencoded' } },
      }
    }
    case 'json':
    default:
      if (!url) return null
      return { url, init: jsonInit({ title: text.title, message: text.message, level: text.level }) }
  }
}

/**
 * Send one alert (best-effort — never throws). `fetchImpl` is injectable for tests.
 * @param {Record<string,string|undefined>} env
 * @param {{title:string, message:string, level:'error'|'warning'|'info'}} text
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<{ok:boolean, status?:number, skipped?:boolean, reason?:string, error?:string}>}
 */
export async function sendAlert(env, text, fetchImpl) {
  const f = fetchImpl || fetch
  const req = buildRequest(env, text)
  if (!req) return { ok: false, skipped: true, reason: 'no push channel configured (set MONITOR_ALERT_FORMAT + its URL/keys)' }
  try {
    const res = await f(req.url, req.init)
    return { ok: !!res.ok, status: res.status }
  } catch (e) {
    return { ok: false, error: String((e && e.message) || e) }
  }
}
