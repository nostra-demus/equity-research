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
import { isCompanyName } from './entities'
import { secFilingStory } from './sec-forms'

// junk the cheap triage sometimes emits as a "company" name — never a real issuer
const JUNK_NAME = /^(?:null|undefined|n\/?a|none|nil|-+|\.+|the company|company|unknown)$/i

// input_nature values that mean "a regulatory filing / exchange disclosure" (deriveSourceTier maps both
// of these to the 'primary_filing' tier). Their body is a PDF/attachment, so the headline carries the story.
const FILING_NATURES = new Set(['regulatory_filing', 'exchange_announcement'])

// Boilerplate that REPEATS the company name then connects to the real subject ("ACME LTD: ACME LTD has
// informed the Exchange about <subject>"). Deliberately narrow — it strips only this repetition, never a
// meaningful subject like "Disclosure under Reg 31(2)" or "Regulation 30 of SEBI LODR". The "to"/"of"
// after submitted are optional (BSE text is inconsistent: "submitted the Exchange a copy …").
const CONNECTIVES: RegExp[] = [
  /^has informed (?:the )?(?:exchange|bse|nse)\b[a-z ,]*?\b(?:about|regarding|of|that|on|for)\s+/i,
  /^informed (?:the )?(?:exchange|bse|nse)\b[a-z ,]*?\b(?:about|regarding|of|that|on)\s+/i,
  /^has submitted\s+(?:to\s+)?(?:bse|nse|the exchange)?\b\s*(?:a copy\s+(?:of\s+)?)?/i,
  /^submitted\s+(?:to\s+)?(?:bse|nse|the exchange)?\b\s*(?:a copy\s+(?:of\s+)?)?/i,
]

// Cover-letter openers BSE/NSE filers prepend before the real subject. Stripped only when something
// substantial remains after (guarded in stripCoverLetter), so we never blank a real subject.
const COVER_OPENERS: RegExp[] = [
  /^with reference to [^.]*?\b(?:inform(?:ed|s)?|advise[ds]?|intimate[ds]?|state[ds]?|report(?:ed)?|submit(?:ted)?)\b[^.]*?\bthat\b[\s,:]*/i,
  /^with reference to [^,.]*[,]\s+/i,
  /^(?:please|pl\.?|kindly)\s+find\s+(?:attached|enclosed)(?:\s+herewith)?\s*(?:the\s+|a\s+)?/i,
  /^enclosed\s+(?:herewith|please find)\s*(?:is|are|the)?\s*/i,
  /^(?:we\s+(?:wish|would like|hereby)\s+to\s+inform|this\s+is\s+to\s+inform)[^.]*?\bthat\b\s*/i,
  /^the exchange has received\s+(?:the\s+)?(?:following\s+)?/i, // "The Exchange has received the Disclosure under…"
]

// EDGAR/BSE scrip junk that leaks into a company name or subject: a leading "8-K - " / "6-K - " form
// prefix, a trailing CIK "(0001595248)" + EDGAR role "(Filer)"/"(Subject)"/"(Reporting)", a BSE "-$"
// marker, and a trailing scrip code "(506734)". Stripped from BOTH the company and the subject.
function cleanEntity(s: string): string {
  let t = String(s || '').trim()
  t = t.replace(/^(?:form\s+)?[0-9]{1,2}-[A-Za-z](?:\/A)?\s*[-–—:]\s*/i, '') // "8-K - ", "6-K/A — "
  t = t.replace(/\s*\((?:Filer|Subject|Reporting|Issuer)\)\s*$/gi, '') // EDGAR role tag
  t = t.replace(/\s*\(\d{6,10}\)\s*$/g, '') // trailing CIK (7-10) or BSE scrip code (6-7)
  t = t.replace(/-\$\s*$/g, '') // BSE "-$" marker
  t = t.replace(/\s*\((?:Filer|Subject|Reporting|Issuer)\)\s*$/gi, '') // a second role tag after the code
  t = t.replace(/[\s,:;.\-–—]+$/g, '').replace(/\s+/g, ' ').trim()
  return t
}

const CORP_SUFFIX = /\b(?:ltd|limited|inc|inc\.|corp|corporation|plc|llc|llp|co|company|holdings?|industries|enterprises|technologies|pharma|pharmaceuticals?|finance|fin|bank|motors?|cements?|chemicals?|infra|infrastructure|mills?|steels?|power|energy|capital|securities|ventures?|labs?|laboratories|systems?|solutions?|services?|textiles?|petrochemicals?)\.?$/i

export interface StoryFloorInput {
  headline?: string | null
  headline_en?: string | null // English translation of a non-English headline (news/lang.ts) — restated in preference to the original
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

/** Split a filing headline into the company and the disclosure subject.
 *  - "COMPANY: subject" (BSE/NSE/EDGAR shape) → that split, company cleaned of scrip/CIK/form junk.
 *  - a bare company stub ("Kabra Drugs Ltd (524322)", "Foo Ltd-$ (506734)", "8-K - Acme (123) (Filer)")
 *    → company = cleaned name, NO subject.
 *  - otherwise → the first guessed company name, rest = the whole headline. */
function splitCompany(headline: string, guesses?: { name?: string | null }[] | null): { company: string; rest: string } {
  const ci = headline.indexOf(': ')
  if (ci > 0 && ci <= 110) {
    const c = cleanEntity(headline.slice(0, ci))
    if (hasLetters(c) && !JUNK_NAME.test(c) && c.split(/\s+/).length <= 12) return { company: c, rest: headline.slice(ci + 2).trim() }
  }
  // no colon: is the WHOLE headline just a company stub (with a scrip code / form prefix / corp suffix)?
  const cleaned = cleanEntity(headline)
  const wasJunky = cleaned !== headline.trim()
  if (hasLetters(cleaned) && cleaned.split(/\s+/).length <= 10 && (wasJunky || CORP_SUFFIX.test(cleaned))) {
    return { company: cleaned, rest: '' }
  }
  const g = (guesses || [])
    .map((x) => cleanEntity(String(x?.name || '')))
    .find((n) => n && hasLetters(n) && !JUNK_NAME.test(n) && isCompanyName(n)) // real issuer only — no "null"/"FCA"/"China"
  return { company: g || '', rest: headline }
}

const SUFFIX_WORDS = 'ltd|limited|inc|corp|corporation|plc|llc|llp|co|company|holdings?|industries|enterprises|technologies|pharmaceuticals?|pharma|finance|fin|bank|motors?|cements?|chemicals?|petrochemicals?|infra|infrastructure|mills?|steels?|power|energy|capital|securities|ventures?|labs?|laboratories|systems?|solutions?|services?|textiles?|developers?|india'
const esc = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** The company's distinctive core words (corporate suffix + punctuation removed) — for a form-tolerant
 *  match ("Indian Toners & Developers Ltd" ≈ "Indian Toners & Developers Limited"). */
function companyCore(name: string): string {
  return cleanEntity(name).toLowerCase().replace(new RegExp(`\\b(?:${SUFFIX_WORDS})\\b\\.?`, 'gi'), ' ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Drop a leading repeat of the company name (in ANY suffix form) + the connective boilerplate after it,
 *  leaving the real subject. Tolerant of "Ltd"/"Limited"/punctuation differences between the two mentions. */
function stripRepeatedCompany(rest: string, company: string): string {
  const r = rest.trim()
  const core = companyCore(company)
  const stripConnective = (tail: string): string => {
    let t = tail.trim()
    for (const re of CONNECTIVES) { const m = re.exec(t); if (m) { return t.slice(m[0].length).trim() } }
    return t
  }
  if (core.length >= 4) {
    const words = core.split(' ').map(esc)
    // the core words, then ZERO+ trailing corporate-suffix tokens (each on a word boundary so "co" never
    // eats the "Co" in "Company"), then separators — matches either suffix form ("Ltd" ≈ "Limited")
    const re = new RegExp(`^${words.join('[^a-z0-9]+')}(?:[^a-z0-9]+(?:${SUFFIX_WORDS})\\b)*\\.?[\\s:,.–—-]*`, 'i')
    const m = re.exec(r)
    if (m && m[0].length) {
      const tail = stripConnective(r.slice(m[0].length))
      if (tail && hasLetters(tail)) return tail
    }
  }
  // fallback: exact/cleaned prefix
  for (const variant of [company, cleanEntity(company)]) {
    if (variant && r.toLowerCase().startsWith(variant.toLowerCase())) {
      const tail = stripConnective(r.slice(variant.length).replace(/^[\s:,.–—-]+/, ''))
      if (tail && hasLetters(tail)) return tail
    }
  }
  return r
}

/** Strip a leading cover-letter opener ("With reference to the captioned subject, we wish to inform that …")
 *  only when a substantial real subject remains after — never blank a genuine subject. */
function stripCoverLetter(subject: string): string {
  let s = subject.trim()
  for (const re of COVER_OPENERS) {
    const m = re.exec(s)
    if (m && m[0].length) {
      const tail = s.slice(m[0].length).trim()
      if (tail.length >= 12 && hasLetters(tail)) { s = tail; break }
    }
  }
  return s
}

/**
 * The guaranteed THE STORY for an event whose source body couldn't be read. Never empty, never a raw
 * error, never fabricated. For a filing: "Exchange disclosure by <Company>. Subject — <subject>. <hint>".
 * For an article: the feed lede, else an honest "from the headline: …".
 */
export function storyFloor(i: StoryFloorInput): StoryFloorResult {
  // restate the English translation when we have one (non-English filings), else the original — so the
  // guaranteed "THE STORY" text reads in English too. English items pass no headline_en → unchanged.
  const src = (i.headline_en && i.headline_en.trim()) || i.headline
  const headline = (cleanText(src) || String(src || '')).trim()
  const snippet = cleanText(i.snippet)

  if (isFilingEvent(i)) {
    // An SEC EDGAR filing carries its form code IN the title ("424B2 - GOLDMAN SACHS GROUP INC (Filer)").
    // Explain it in plain English from the dictionary instead of the bland "Exchange disclosure by X" —
    // this is what makes a routine bank prospectus legible to a non-specialist.
    const edgarSrc = /(^|\.)sec\.gov$/i.test(String(i.domain || '')) || /edgar/i.test(String(i.source_name || ''))
    if (edgarSrc) {
      const edgarStory = secFilingStory(headline)
      if (edgarStory) return { summary: edgarStory.slice(0, 600), kind: 'filing' }
    }
    const { company, rest } = splitCompany(headline, i.companies)
    let subject = company ? stripRepeatedCompany(rest, company) : rest
    subject = cleanEntity(stripCoverLetter(subject)).replace(/\s+/g, ' ').trim()
    // a bare scrip code "(532794)" / a code-only remnant / a re-clean that emptied it → no subject
    if (!hasLetters(subject) || subject.replace(/[^a-z]/gi, '').length < 3) subject = ''
    const who = company.replace(/[.:]+$/, '').trim()
    // name the issuer when we know it; otherwise a neutral lead (a regulator press release, or a filing
    // whose company we couldn't parse, must not be mislabelled "by A listed company")
    const parts: string[] = [who ? `Exchange disclosure by ${who}.` : 'Regulatory / exchange disclosure.']
    const subjLc = subject.toLowerCase()
    const whoLc = who.toLowerCase()
    if (subject && subjLc !== whoLc && !subjLc.startsWith(whoLc + ' ')) {
      parts.push(`Subject — ${subject.replace(/[.\s]+$/, '')}.`)
    } else if (!subject) {
      // no parsed subject: only restate the headline if (cleaned) it carries MORE than the company name —
      // never re-leak a bare "Company (scrip)" stub as a subject.
      const ch = cleanEntity(headline)
      const chLc = ch.toLowerCase()
      if (hasLetters(ch) && chLc !== whoLc && !chLc.startsWith(whoLc) && !whoLc.startsWith(chLc)) {
        parts.push(`Subject — ${ch.replace(/[.\s]+$/, '')}.`)
      }
    }
    // an adapter snippet occasionally carries more than the title — append when it ADDS material text.
    // Run it through the SAME company/connective/cover-letter cleanup so it never re-introduces the
    // "Company has informed the Exchange…" boilerplate we just stripped from the subject.
    if (snippet) {
      const sn = cleanEntity(stripCoverLetter(stripRepeatedCompany(snippet, who))).replace(/\s+/g, ' ').trim()
      const snLc = sn.toLowerCase()
      const adds = sn.length >= 40 && hasLetters(sn) && snLc !== subjLc && !subjLc.includes(snLc.slice(0, 24)) && !snLc.includes(subjLc.slice(0, 24)) && !/^(?:has |informed|submitted|the exchange)/i.test(sn)
      if (adds) parts.push(sn.slice(0, 360))
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
