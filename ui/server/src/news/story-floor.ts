// THE STORY — guaranteed floor. The cheap triage is title-only, and enrich.ts reads the source body
// when it can. But a huge slice of the wire has NO readable body: BSE/NSE exchange filings fold the
// whole disclosure into the title and link to a PDF attachment; many articles are JS shells or paywalls.
// For those the old reader showed a raw fetch error ("source is not an HTML page") as the story — empty
// and useless. This module is the floor: it ALWAYS produces a meaningful, ACCURATE story from what we
// already hold — for a filing the headline IS the disclosure ("COMPANY: subject"), so we restate the
// subject cleanly + note the attachment; for an unreadable article we lead with the feed lede or restate
// the headline. Pure, dependency-free, never throws, and NEVER fabricates a fact — every word comes from
// the headline/snippet/filing metadata the engine already has.

import { cleanText } from './clean'

// input_nature values that mean "a regulatory filing / exchange disclosure" (deriveSourceTier maps both
// of these to the 'primary_filing' tier). Their body is a PDF/attachment, so the headline carries the story.
const FILING_NATURES = new Set(['regulatory_filing', 'exchange_announcement'])

// Boilerplate that REPEATS the company name then connects to the real subject ("ACME LTD: ACME LTD has
// informed the Exchange about <subject>"). Deliberately narrow — it strips only this repetition, never a
// meaningful subject like "Disclosure under Reg 31(2)" or "Regulation 30 of SEBI LODR".
const CONNECTIVES: RegExp[] = [
  /^has informed (?:the )?(?:exchange|bse|nse)\b[a-z ]*?\b(?:about|regarding|of|that|on|for)\s+/i,
  /^informed (?:the )?(?:exchange|bse|nse)\b[a-z ]*?\b(?:about|regarding|of|that|on)\s+/i,
  /^has submitted to (?:bse|nse|the exchange)\b\s+(?:a copy of\s+)?/i,
  /^has submitted\s+(?:a copy of\s+)?/i,
]

export interface StoryFloorInput {
  headline?: string | null
  url?: string | null
  snippet?: string | null // the feed's own lede, when an adapter carries one
  input_nature?: string | null
  source_tier?: string | null
  source_name?: string | null
  domain?: string | null
  companies?: { name?: string | null }[] | null
}

export interface StoryFloorResult {
  summary: string // the guaranteed THE STORY text
  kind: 'filing' | 'article'
  subject?: string // the parsed disclosure subject (filings only), for callers that want it structured
}

const hasLetters = (s: string): boolean => /[a-z]{3}/i.test(s)

/** Is this event a regulatory/exchange filing — i.e. one whose meaning lives in the headline, not a
 *  fetchable article body? Several independent signals so it's right regardless of which one is present. */
export function isFilingEvent(i: StoryFloorInput): boolean {
  if (FILING_NATURES.has(String(i.input_nature || '').toLowerCase())) return true
  if (String(i.source_tier || '') === 'primary_filing') return true
  const d = String(i.domain || '').toLowerCase()
  if (/(^|\.)(bseindia|nseindia)\.com$/.test(d)) return true
  if (/exchange filing|exchange announcement/i.test(String(i.source_name || ''))) return true
  const h = String(i.headline || '')
  if (/informed the exchange|submitted to (?:bse|nse)\b|sebi\s*\(?\s*lodr|\bregulation\s*\d|\breg\.?\s*\d{1,2}\b|disclosure under|board meeting|postal ballot|newspaper (?:advertisement|advertisment|publication)|outcome of (?:the )?(?:board|agm|egm|meeting)|\bintimation\b/i.test(h)) return true
  return false
}

function attachmentHint(url?: string | null): string {
  const u = String(url || '').toLowerCase()
  if (/\.pdf(?:[?#]|$)/.test(u)) return 'The full document is filed as a PDF attachment — open the source to read it.'
  if (/\.(?:xlsx?|docx?|zip|csv|xml)(?:[?#]|$)/.test(u)) return 'The full document is filed as an attachment — open the source to read it.'
  return 'Open the source to read the full disclosure.'
}

/** Split "COMPANY: subject" (BSE/NSE shape) into the company and the rest; else take the first guessed
 *  company name. A prefix that's a whole sentence (no colon, or >10 words) is not treated as a company. */
function splitCompany(headline: string, guesses?: { name?: string | null }[] | null): { company: string; rest: string } {
  const ci = headline.indexOf(': ')
  if (ci > 0 && ci <= 90) {
    const c = headline.slice(0, ci).trim()
    if (hasLetters(c) && c.split(/\s+/).length <= 10) return { company: c, rest: headline.slice(ci + 2).trim() }
  }
  const g = (guesses || []).map((x) => String(x?.name || '').trim()).find((n) => n && hasLetters(n))
  return { company: g || '', rest: headline }
}

/** Drop a leading repeat of the company name + the connective boilerplate after it, leaving the subject. */
function stripRepeatedCompany(rest: string, company: string): string {
  const r = rest.trim()
  if (company && r.toLowerCase().startsWith(company.toLowerCase())) {
    let tail = r.slice(company.length).replace(/^[\s:,.–—-]+/, '')
    for (const re of CONNECTIVES) { const m = re.exec(tail); if (m) { tail = tail.slice(m[0].length).trim(); break } }
    if (tail && hasLetters(tail)) return tail
  }
  return r
}

/**
 * The guaranteed THE STORY for an event whose source body couldn't be read. Never empty, never a raw
 * error, never fabricated. For a filing: "Exchange disclosure by <Company>. Subject — <subject>. <hint>".
 * For an article: the feed lede, else an honest "from the headline: …".
 */
export function storyFloor(i: StoryFloorInput): StoryFloorResult {
  const headline = (cleanText(i.headline) || String(i.headline || '')).trim()
  const snippet = cleanText(i.snippet)

  if (isFilingEvent(i)) {
    const { company, rest } = splitCompany(headline, i.companies)
    let subject = (company ? stripRepeatedCompany(rest, company) : rest).replace(/\s+/g, ' ').trim()
    if (!hasLetters(subject)) subject = '' // a bare scrip code like "(532794)" is not a subject
    const who = (company || 'A listed company').replace(/[.:]+$/, '').trim()
    const parts: string[] = [`Exchange disclosure by ${who}.`]
    const subjLc = subject.toLowerCase()
    const whoLc = who.toLowerCase()
    if (subject && subjLc !== whoLc && !subjLc.startsWith(whoLc + ' ')) {
      parts.push(`Subject — ${subject.replace(/[.\s]+$/, '')}.`)
    } else if (!subject && hasLetters(headline) && headline.toLowerCase() !== whoLc) {
      parts.push(`Subject — ${headline.replace(/[.\s]+$/, '')}.`)
    }
    // an adapter snippet occasionally carries more than the title — append when it adds material text
    if (snippet && snippet.length > subject.length + 24 && !subjLc.includes(snippet.slice(0, 24).toLowerCase())) {
      parts.push(snippet.slice(0, 360))
    }
    parts.push(attachmentHint(i.url))
    return { summary: parts.join(' ').replace(/\s+/g, ' ').trim().slice(0, 600), subject: subject || undefined, kind: 'filing' }
  }

  // a non-filing article whose body we couldn't read: lead with the feed's own lede if we have one,
  // else restate the headline honestly. Either way, never blank and never a raw error string.
  if (snippet && snippet.length >= 40) return { summary: snippet.slice(0, 600), kind: 'article' }
  const base = headline && hasLetters(headline) ? headline : ''
  return {
    summary: base ? `We couldn't open the article body — from the headline: ${base.replace(/[.\s]+$/, '')}.` : 'Headline only — open the source to read it.',
    kind: 'article',
  }
}
