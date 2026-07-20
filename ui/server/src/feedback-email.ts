// Resolution email — when a teammate marks a feedback item "done", the person who filed it is emailed that
// it's resolved. Sends a hand-built, email-client-safe HTML message through the Munshot raw-email API
// (POST /email/send/raw with { email, subject, html } and a Bearer token). Three properties matter:
//
//   1. FAIL-SAFE. Every function here is best-effort and NEVER throws to the caller: a missing token, a
//      down email service, or a reporter with no email on file all resolve to a NotifyResult, never an
//      exception. The "mark done" request path must never break or block because of an email.
//   2. UNTRUSTED CONTENT. The feedback text + resolution note are user-supplied — every interpolation into
//      the HTML goes through escapeHtml first, so a reporter can't inject markup/styles into the email.
//   3. TESTABLE + PURE render. renderResolvedEmail is a pure function of its inputs (no I/O, no clock), so
//      the template is unit-tested directly; the network send injects fetch + clock via `deps`.
//
// The token is a secret loaded from the out-of-repo config dir (providers.env → load-env.ts) and scrubbed
// from every child run (launcher.childEnv). See config.ts FEEDBACK_EMAIL / feedbackEmailReady().

import { FEEDBACK_EMAIL, feedbackEmailReady } from './config'
import { appendFeedbackNotification, type FeedbackCategory, type FeedbackItemRecord } from './feedback-store'

// ---- small pure helpers -----------------------------------------------------------------------------

/** HTML-escape untrusted text before it goes into the email body. Covers the five significant chars. */
export function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Escape, then turn newlines into <br> so multi-line feedback keeps its shape in the email. */
function escapeMultiline(s: string): string {
  return escapeHtml(s).replace(/\r\n|\r|\n/g, '<br>')
}

// A conservative address check: local@domain.tld. Not RFC-exhaustive — its only job is to reject the
// sentinels ('local', '') and obvious non-addresses so we never POST a junk recipient. The reporter's
// user_id comes from Cloudflare Access (a real email) or is 'local' in local dev.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function looksLikeEmail(s: string): boolean {
  const e = (s || '').trim()
  return e.length <= 254 && e.toLowerCase() !== 'local' && EMAIL_RE.test(e)
}

// Human noun per category — reads naturally in the subject + body ("your bug report has been resolved").
const CATEGORY_NOUN: Record<FeedbackCategory, string> = {
  bug: 'bug report',
  ui: 'UI note',
  idea: 'idea',
  research_quality: 'research-quality note',
  other: 'feedback',
}
function categoryNoun(cat: FeedbackCategory): string {
  return CATEGORY_NOUN[cat] || 'feedback'
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** "19 Jul 2026" from an ISO string, in UTC (deterministic — no locale/timezone drift in tests). */
function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** First non-empty line of the feedback, trimmed — used for the subject + preheader excerpt. */
function firstLine(s: string): string {
  return (s || '').split(/\r?\n/).map((l) => l.trim()).find(Boolean) || ''
}

// The CTA target: the public cockpit, deep-linked back to the page the feedback was filed from when that
// is a safe same-origin relative path (it always is — the client sends location.pathname + hash). Anything
// that isn't a clean "/..."-relative path collapses to the app root, so a malformed stored url can't
// redirect the reporter off-site.
function ctaUrl(appUrl: string, filedFrom: string): string {
  const rel = (filedFrom || '').trim()
  if (/^\/[^\s/\\][^\s]*$/.test(rel) && !rel.startsWith('//')) return appUrl + rel
  return appUrl || '#'
}

// ---- the email template (pure) ----------------------------------------------------------------------

export interface RenderInput {
  item: FeedbackItemRecord
  note?: string // resolution note (the done-event note), optional
  prUrl?: string | null // the change/PR link, optional
  appUrl?: string // override the CTA origin (defaults to config)
  resolvedAt?: string // ISO; defaults handled by the caller
}
export interface RenderedEmail {
  subject: string
  html: string
}

/**
 * Build the resolution email. PURE — no I/O, no clock. All untrusted text is escaped. The layout is
 * table-based with inline styles (the only thing email clients render reliably), 600px capped, with a
 * hidden preheader and a prefers-color-scheme dark variant for clients that honor <style> (Apple Mail,
 * iOS). Light styles are inline so a client that strips <style> still looks right.
 */
export function renderResolvedEmail(input: RenderInput): RenderedEmail {
  const { item } = input
  const noun = categoryNoun(item.category)
  const appUrl = (input.appUrl ?? FEEDBACK_EMAIL.appUrl).replace(/\/+$/, '')
  const resolvedAt = input.resolvedAt || item.submitted_at

  const excerptRaw = firstLine(item.text)
  const excerpt = excerptRaw.length > 64 ? excerptRaw.slice(0, 63).trimEnd() + '…' : excerptRaw
  const subject = excerpt ? `Resolved: ${excerpt}` : `Your ${noun} has been resolved`

  const preheader = escapeHtml(`Good news — the ${noun} you reported in the Nostradamus cockpit is fixed.`)
  const bodyText = item.text ? escapeMultiline(item.text.slice(0, 800)) : ''
  const noteText = (input.note || '').trim()
  const noteHtml = noteText ? escapeMultiline(noteText.slice(0, 600)) : ''
  const pr = input.prUrl && /^https:\/\/[^\s"'<>]+$/.test(input.prUrl) ? input.prUrl : ''
  const cta = ctaUrl(appUrl, item.url)
  const ref = escapeHtml(item.feedback_id)
  const reported = fmtDate(item.submitted_at)
  const resolved = fmtDate(resolvedAt)

  // palette (light) — matches the cockpit's warm-neutral + amber accent
  const c = {
    pageBg: '#f4f2ef', card: '#ffffff', ink: '#1c1917', muted: '#6b645d', faint: '#9c948c',
    hair: '#eae7e2', quoteBg: '#faf9f7', accent: '#e0a33e', accentDeep: '#b9842c', accentInk: '#1a1206',
    good: '#15803d', goodBg: '#eaf5ee', goodBorder: '#bfe0cb',
  }

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(subject)}</title>
<!--[if mso]><style>* { font-family: Arial, sans-serif !important; }</style><![endif]-->
<style>
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body,table,td { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
  a { text-decoration:none; }
  .btn:hover { background:${c.accentDeep} !important; }
  @media (max-width:620px){
    .container{ width:100% !important; }
    .px{ padding-left:24px !important; padding-right:24px !important; }
  }
  @media (prefers-color-scheme: dark){
    .bg{ background:#0c0a09 !important; }
    .card{ background:#1c1917 !important; border-color:#2b2724 !important; }
    .ink{ color:#f5f3f0 !important; }
    .muted{ color:#b3aaa1 !important; }
    .faint{ color:#8a8179 !important; }
    .hair{ border-color:#2b2724 !important; }
    .quote{ background:#232019 !important; border-color:${c.accentDeep} !important; }
    .quote .ink{ color:#ece7e1 !important; }
    .wordmark{ color:#f5f3f0 !important; }
    .goodpill{ background:#14261b !important; border-color:#2c5138 !important; color:#7fd39a !important; }
    .divider{ border-color:#2b2724 !important; }
  }
</style>
</head>
<body class="bg" style="margin:0; padding:0; width:100%; background:${c.pageBg}; -webkit-font-smoothing:antialiased;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all; font-size:1px; line-height:1px; color:${c.pageBg};">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg" style="background:${c.pageBg};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="container" style="width:600px; max-width:600px;">

        <!-- wordmark -->
        <tr><td class="px" style="padding:4px 8px 18px;">
          <span class="wordmark" style="font-family:'Helvetica Neue',Arial,sans-serif; font-size:13px; font-weight:700; letter-spacing:2.5px; color:${c.ink};">NOSTRADAMUS</span>
          <span class="faint" style="font-family:'Helvetica Neue',Arial,sans-serif; font-size:11px; letter-spacing:0.4px; color:${c.faint};">&nbsp;&middot;&nbsp;Equity Research Cockpit</span>
        </td></tr>

        <!-- card -->
        <tr><td class="card hair" style="background:${c.card}; border:1px solid ${c.hair}; border-radius:16px; overflow:hidden;">
          <!-- accent top rule -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:4px; background:${c.accent}; line-height:4px; font-size:4px;">&nbsp;</td></tr></table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td class="px" style="padding:34px 40px 8px;">
              <!-- resolved pill -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td class="goodpill" style="background:${c.goodBg}; border:1px solid ${c.goodBorder}; border-radius:999px; padding:5px 13px; font-family:'Helvetica Neue',Arial,sans-serif; font-size:11px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; color:${c.good};">
                &#10003;&nbsp; Resolved
              </td></tr></table>
            </td></tr>

            <tr><td class="px" style="padding:16px 40px 0;">
              <h1 class="ink" style="margin:0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:25px; line-height:1.25; font-weight:700; letter-spacing:-0.3px; color:${c.ink};">Your ${escapeHtml(noun)} has been resolved</h1>
            </td></tr>

            <tr><td class="px" style="padding:14px 40px 0;">
              <p class="muted" style="margin:0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:15px; line-height:1.6; color:${c.muted};">
                Thanks for flagging this. The team has resolved the ${escapeHtml(noun)} you reported${excerpt ? ' — here&#39;s what you sent us:' : '.'}
              </p>
            </td></tr>

            ${bodyText ? `<!-- quoted feedback -->
            <tr><td class="px" style="padding:18px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="quote" style="background:${c.quoteBg}; border-left:3px solid ${c.accent}; border-radius:6px; padding:16px 18px;">
                <div class="ink" style="font-family:'Helvetica Neue',Arial,sans-serif; font-size:14px; line-height:1.6; color:${c.ink};">${bodyText}</div>
              </td></tr></table>
            </td></tr>` : ''}

            ${noteHtml ? `<!-- resolution note -->
            <tr><td class="px" style="padding:20px 40px 0;">
              <div class="faint" style="font-family:'Helvetica Neue',Arial,sans-serif; font-size:11px; font-weight:700; letter-spacing:0.6px; text-transform:uppercase; color:${c.faint};">What we did</div>
              <p class="muted" style="margin:6px 0 0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:14px; line-height:1.6; color:${c.muted};">${noteHtml}</p>
            </td></tr>` : ''}

            <!-- CTA -->
            <tr><td class="px" style="padding:28px 40px 4px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-radius:10px;" bgcolor="${c.accent}">
                <a class="btn" href="${escapeHtml(cta)}" target="_blank" style="display:inline-block; padding:13px 26px; font-family:'Helvetica Neue',Arial,sans-serif; font-size:14px; font-weight:700; color:${c.accentInk}; background:${c.accent}; border-radius:10px; letter-spacing:0.2px;">Open the cockpit &rarr;</a>
              </td></tr></table>
            </td></tr>

            ${pr ? `<tr><td class="px" style="padding:14px 40px 0;">
              <a href="${escapeHtml(pr)}" target="_blank" class="muted" style="font-family:'Helvetica Neue',Arial,sans-serif; font-size:13px; color:${c.accentDeep}; text-decoration:underline;">View the change &#8599;</a>
            </td></tr>` : ''}

            <!-- meta -->
            <tr><td class="px" style="padding:30px 40px 34px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="divider" style="border-top:1px solid ${c.hair}; padding-top:16px;">
                <span class="faint" style="font-family:'Helvetica Neue',Arial,sans-serif; font-size:12px; line-height:1.7; color:${c.faint};">
                  Reference <span style="font-family:'SFMono-Regular',Consolas,monospace;">${ref}</span>${reported ? `&nbsp;&middot;&nbsp;Reported ${escapeHtml(reported)}` : ''}${resolved ? `&nbsp;&middot;&nbsp;Resolved ${escapeHtml(resolved)}` : ''}
                </span>
              </td></tr></table>
            </td></tr>
          </table>
        </td></tr>

        <!-- footer -->
        <tr><td class="px" style="padding:20px 8px 8px;">
          <p class="faint" style="margin:0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:11.5px; line-height:1.6; color:${c.faint};">
            You&#39;re receiving this because you reported an issue in the Nostradamus cockpit. This mailbox isn&#39;t monitored — reply with more feedback right inside the app.
          </p>
        </td></tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`

  return { subject, html }
}

// ---- the network send (impure, injectable) ----------------------------------------------------------

export interface SendResult { ok: boolean; status: number; detail: string }
export interface SendDeps { fetchFn?: typeof fetch }

/**
 * POST one HTML email to the Munshot raw-email API. NEVER throws: a network error, timeout, or non-2xx
 * resolves to { ok:false, ... }. Auth is a Bearer token (the god/team token or a user token both work).
 */
export async function sendRawEmail(
  payload: { email: string; subject: string; html: string },
  deps: SendDeps = {},
): Promise<SendResult> {
  const fetchFn = deps.fetchFn || fetch
  if (!feedbackEmailReady()) return { ok: false, status: 0, detail: 'email not configured' }
  try {
    const res = await fetchFn(FEEDBACK_EMAIL.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${FEEDBACK_EMAIL.token}` },
      signal: AbortSignal.timeout(FEEDBACK_EMAIL.timeoutMs), // a hung email service must never block the request path
      body: JSON.stringify({ email: payload.email, subject: payload.subject, html: payload.html }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { ok: false, status: res.status, detail: `HTTP ${res.status}${body ? ': ' + body.slice(0, 160) : ''}` }
    }
    return { ok: true, status: res.status, detail: '' }
  } catch (e: any) {
    const msg = e?.name === 'TimeoutError' ? `timed out after ${FEEDBACK_EMAIL.timeoutMs}ms` : (e?.message || 'send error')
    return { ok: false, status: 0, detail: msg }
  }
}

// ---- the orchestrator -------------------------------------------------------------------------------

export type NotifyReason = 'not_ready' | 'no_recipient' | 'sent' | 'send_failed'
export interface NotifyResult {
  attempted: boolean // did we actually POST to the email service?
  ok: boolean // did the reporter get the email?
  recipient: string // the address we used (or the reporter's user_id when we couldn't send)
  detail: string
  reason: NotifyReason
}
export interface NotifyDeps extends SendDeps {
  now?: () => Date
  append?: typeof appendFeedbackNotification
}

/**
 * Send the resolution email to the reporter of `item` and record the attempt in the feedback ledger.
 * NEVER throws — the "mark done" route calls this fire-and-forget. Skips silently (no ledger line) when the
 * feature is off or the reporter has no email on file, so those non-events don't clutter the panel; records
 * a notification line only when a send is actually attempted (so a failure is visible and retryable).
 */
export async function notifyFeedbackResolved(
  item: FeedbackItemRecord,
  opts: { note?: string; prUrl?: string | null; user: string; stateDir?: string },
  deps: NotifyDeps = {},
): Promise<NotifyResult> {
  const recipient = (item.user_id || '').trim()
  if (!feedbackEmailReady()) return { attempted: false, ok: false, recipient, detail: 'email not configured', reason: 'not_ready' }
  if (!looksLikeEmail(recipient)) return { attempted: false, ok: false, recipient, detail: 'reporter has no email on file', reason: 'no_recipient' }

  const now = deps.now ? deps.now() : new Date()
  const { subject, html } = renderResolvedEmail({ item, note: opts.note, prUrl: opts.prUrl ?? null, resolvedAt: now.toISOString() })
  const sent = await sendRawEmail({ email: recipient, subject, html }, deps)

  // record the attempt (best-effort — a ledger hiccup must not turn a sent email into a thrown error)
  const append = deps.append || appendFeedbackNotification
  try {
    await append(item.feedback_id, { channel: 'email', recipient, ok: sent.ok, detail: sent.detail, user: opts.user }, opts.stateDir)
  } catch { /* ledger best-effort */ }

  return { attempted: true, ok: sent.ok, recipient, detail: sent.detail, reason: sent.ok ? 'sent' : 'send_failed' }
}
