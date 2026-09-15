// Email for urgent watchlist messages only — a line the research (or you) drew was crossed, or new research
// says buy. Everything else stays in the cockpit and is never emailed; which messages count as urgent is fixed
// by type (evaluate.ts, and the monitor's "research says buy now"). The one exception is the single test email
// sent when email is first switched on for a set of addresses (monitor.ts), which says it is a test.
//
// Reuses the one email sender the engine already has (feedback-email.ts → the Munshot raw-email API). It is
// ON only when the operator names at least one address in ENGINE_WATCH_EMAIL_TO and the sender itself is
// configured on this machine, so a deploy without both behaves exactly as before: messages in the cockpit,
// no email.
import { FEEDBACK_EMAIL, feedbackEmailReady, WATCH } from '../config'
import { escapeHtml, looksLikeEmail, sendRawEmail, type SendResult } from '../feedback-email'
import { STATUS_LABEL } from './evaluate'
import { GROUP_WINDOW_MS, unsentUrgent, type WatchMessage, type WatchMessageItem } from './inbox'

export interface WatchEmailConfig { enabled: boolean; recipients: string[]; appUrl: string; reason: string | null }

export function watchEmailConfig(): WatchEmailConfig {
  const recipients = WATCH.emailTo.filter(looksLikeEmail)
  const appUrl = FEEDBACK_EMAIL.appUrl
  if (!WATCH.emailEnabled) return { enabled: false, recipients, appUrl, reason: 'Email is switched off for the watchlist.' }
  if (!recipients.length) return { enabled: false, recipients, appUrl, reason: 'No address is set for watchlist email.' }
  if (!feedbackEmailReady()) return { enabled: false, recipients, appUrl, reason: 'The email sender is not set up on this machine.' }
  return { enabled: true, recipients, appUrl, reason: null }
}

export interface EmailBatchEntry { message: WatchMessage; items: WatchMessageItem[] }

/**
 * What to email now. A name's first urgent message goes at once. If that name was emailed less than 30
 * minutes ago, anything new waits, so a burst becomes ONE follow-up rather than a stream. Messages already
 * read or deleted in the cockpit are not emailed at all.
 */
export function selectEmailBatch(pending: WatchMessage[], all: WatchMessage[], now: Date, windowMs = GROUP_WINDOW_MS): EmailBatchEntry[] {
  const lastSent = new Map<string, number>()
  for (const m of all) {
    if (!m.listing_key || !m.email.sent_at) continue
    const t = Date.parse(m.email.sent_at)
    if (Number.isFinite(t) && t > (lastSent.get(m.listing_key) ?? 0)) lastSent.set(m.listing_key, t)
  }
  const out: EmailBatchEntry[] = []
  for (const m of pending) {
    if (m.read_at || m.deleted_at) continue
    const items = unsentUrgent(m)
    if (!items.length) continue
    const last = m.listing_key ? lastSent.get(m.listing_key) : undefined
    if (last != null && now.getTime() - last < windowMs) continue
    out.push({ message: m, items })
  }
  return out
}

function itemHtml(i: WatchMessageItem): string {
  const detail = escapeHtml(i.detail).replace(/\n/g, '<br>')
  const quote = i.quote
    ? `<div style="margin:8px 0 0;padding:6px 10px;border-left:3px solid #c9c5ba;color:#3d3d44;font-size:13px;">“${escapeHtml(i.quote)}”${i.source ? `<div style="margin-top:4px;color:#75737c;font-size:11px;">${escapeHtml(i.source)}</div>` : ''}</div>`
    : ''
  return `<div style="margin:10px 0 0;"><div style="font-weight:600;font-size:14px;color:#1c1c21;">${escapeHtml(i.title)}</div>`
    + `<div style="margin-top:3px;font-size:13px;line-height:1.5;color:#3d3d44;">${detail}</div>${quote}</div>`
}

export function renderWatchEmail(batch: EmailBatchEntry[], appUrl: string): { subject: string; html: string } {
  const tickers = [...new Set(batch.map((b) => b.message.ticker ?? 'Watchlist'))]
  const subject = batch.length === 1
    ? `${batch[0].message.ticker ?? 'Watchlist'}: ${batch[0].items[0].title}`
    : `Watchlist: ${tickers.length} ${tickers.length === 1 ? 'name needs' : 'names need'} you — ${tickers.join(', ')}`
  const blocks = batch.map(({ message, items }) => {
    const label = message.status ? STATUS_LABEL[message.status] : ''
    return `<div style="margin:0 0 14px;padding:14px 16px;background:#ffffff;border:1px solid #dedbd2;border-radius:10px;">`
      + `<div style="font-family:ui-monospace,Menlo,monospace;font-weight:700;font-size:15px;color:#1c1c21;">${escapeHtml(message.ticker ?? '')}`
      + `${label ? ` <span style="font-family:-apple-system,Segoe UI,sans-serif;font-weight:600;font-size:12px;color:#8a5c0c;">· ${escapeHtml(label)}</span>` : ''}</div>`
      + `${message.company_name ? `<div style="font-size:12px;color:#75737c;">${escapeHtml(message.company_name)}</div>` : ''}`
      + items.map(itemHtml).join('')
      + `</div>`
  }).join('')
  const url = /^https?:\/\//.test(appUrl) ? appUrl : '#'
  const html = `<!doctype html><html><body style="margin:0;padding:24px 12px;background:#f4f3ef;font-family:-apple-system,'Segoe UI',system-ui,sans-serif;color:#1c1c21;">`
    + `<div style="max-width:560px;margin:0 auto;">`
    + `<div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#75737c;margin-bottom:10px;">Nostra watchlist</div>`
    + blocks
    + `<a href="${escapeHtml(url)}" style="display:inline-block;margin-top:4px;padding:9px 16px;background:#b27d1c;color:#1a1206;text-decoration:none;border-radius:8px;font-weight:600;font-size:13px;">Open the watchlist</a>`
    + `<p style="margin:18px 0 0;font-size:11.5px;line-height:1.5;color:#75737c;">You get an email only when something urgent happens: a line the research drew is crossed, or new research says buy. Everything else stays in the cockpit. Messages suggest — people decide; nothing is bought or sold. You can pause email for a name from its panel.</p>`
    + `</div></body></html>`
  return { subject, html }
}

export async function deliverWatchEmail(
  batch: EmailBatchEntry[],
  cfg: WatchEmailConfig,
  send: (p: { email: string; subject: string; html: string }) => Promise<SendResult> = sendRawEmail,
): Promise<{ ok: boolean; detail: string }> {
  if (!cfg.enabled || !cfg.recipients.length) return { ok: false, detail: cfg.reason ?? 'Email is not set up.' }
  const { subject, html } = renderWatchEmail(batch, cfg.appUrl)
  let ok = 0
  const failures: string[] = []
  for (const to of cfg.recipients) {
    const r = await send({ email: to, subject, html })
    if (r.ok) ok++
    else failures.push(r.detail)
  }
  // Addresses are deliberately left out of the detail: it is shown in the cockpit beside the message.
  const n = cfg.recipients.length
  if (ok === n) return { ok: true, detail: `Emailed to ${n} ${n === 1 ? 'address' : 'addresses'}.` }
  if (ok > 0) return { ok: true, detail: `Emailed to ${ok} of ${n} addresses; failed for the rest: ${failures[0]}` }
  return { ok: false, detail: `Could not email: ${failures[0] ?? 'unknown error'}` }
}
