// Page-junk detection — the guarantee that a consent popup, a terms-of-use interstitial, a cookie
// banner, or a paywall stub can NEVER be presented as THE STORY. The reported defect: the ASX
// announcements page serves an "agree and proceed" terms interstitial (plus a cookie dialog and the
// site's market-data attributions), and the reader extracted THAT text — template placeholders like
// "{{verificationEmail}}" included — and showed it as the article, with a stale meta date as
// "Published". Trust in the whole reader dies the moment that happens once (CLAUDE.md §3: no source =
// no claim; boilerplate is not a source).
//
// Two layers, both deterministic and dependency-free:
//   - isBoilerplateParagraph: per-paragraph vocabulary test. Used by the readable-text extractor to
//     DROP chrome paragraphs so they never reach the LLM or the fallback summary.
//   - classifyParagraphs: page-level verdict. When what remains after dropping chrome is nothing (or
//     nearly nothing), the page IS an interstitial / paywall — the caller must treat it as "no article
//     body" (degrade honestly, try the real document / an alternate outlet / the wire), never as prose.
//
// The vocabulary is deliberately phrased-as-chrome: multi-signal AND-combinations guard the words a
// real article could legitimately contain (an article ABOUT a terms-of-use lawsuit must not be eaten).
// A single dropped paragraph in a real article is harmless — the verdict needs the page to be
// DOMINATED by chrome before it flips.

export type PageTextVerdict = 'ok' | 'interstitial' | 'paywall' | 'empty'

// hard, phrase-level chrome — safe to match anywhere in a paragraph
const CHROME_RE: RegExp[] = [
  /\{\{\s*[\w.]+\s*\}\}/, // an unrendered template placeholder ("{{verificationEmail}}") — an app shell, never prose
  /\b(?:we use cookies|use of cookies|cookies? (?:policy|settings|preferences)|accept all cookies|manage cookie|these cookies are (?:necessary|optional)|which types? of cookies)\b/i,
  /\bverification (?:link|email|code) has been sent\b/i,
  /\b(?:market|index) data is (?:provided|delayed|copyrighted)\b/i,
  /\bcopyrighted by .{0,60}(?:morningstar|lseg|refinitiv|factset|s&p)/i,
  /\bclick for restrictions\b/i,
  /\bfor personal use only\b/i,
  /\b(?:freely available|available) for .{0,40}(?:private and personal|personal and private) use\b/i,
  /\bcannot be used for any commercial purpose\b/i,
  /\bexpressly disclaims (?:any|all)\b|\bdisclaims (?:any|all) (?:responsibility|liability)\b/i,
  /\bmakes no representation or warranty\b/i,
  /\bby clicking .{0,40}\b(?:below|above|here)\b.{0,60}\backnowledg/i,
  /\backnowledge that you have read\b/i,
  /\bagree(?:s)? to be bound by\b/i,
  /\b(?:agree and proceed|i agree|i accept)\b.{0,60}\b(?:terms|notice|conditions)\b/i,
  /\bjavascript is (?:disabled|required|not enabled)\b|\benable javascript\b|\bbrowser is (?:not |un)supported\b/i,
  /\byour access and use of .{0,40} is (?:entirely )?at your own risk\b/i,
]

// paywall / registration-wall phrasing — its own set so the verdict can name the cause
const PAYWALL_RE: RegExp[] = [
  /\b(?:to continue reading|continue reading this article|to read (?:this|the full))\b/i,
  /\b(?:subscribe|sign in|log ?in|register|create (?:a |your )?(?:free )?account)\b.{0,50}\bto (?:continue|read|view|access)\b/i,
  /\balready a subscriber\b/i,
  /\bsubscription (?:is )?required\b/i,
  /\bthis (?:article|content|story) is (?:reserved|exclusive|available) (?:for|to) (?:our )?(?:subscribers|members)\b/i,
  /\bunlock (?:unlimited|full) access\b/i,
]

// two-signal combination: terms-of-use vocabulary counts as chrome only NEXT TO agreement/consent
// phrasing, so an article REPORTING on someone's terms of use survives
const TERMS_RE = /\b(?:terms of use|terms and conditions|terms of service|privacy policy)\b/i
const CONSENT_RE = /\b(?:agree|accept|acknowledge|consent|bound by|subject to|by (?:using|accessing|clicking|continuing))\b/i

// start-anchored chrome the old extractor already dropped — kept so behaviour never regresses
const CHROME_START_RE = /^(?:cookie|we use cookies|sign in|sign up|subscribe|advertis|read more|share this|all rights reserved|follow us|by using this)/i

/** Is this ONE paragraph site chrome (consent/terms/attribution/paywall) rather than article prose? */
export function isBoilerplateParagraph(p: string): boolean {
  const t = String(p || '').trim()
  if (!t) return false
  if (CHROME_START_RE.test(t)) return true
  for (const re of CHROME_RE) if (re.test(t)) return true
  for (const re of PAYWALL_RE) if (re.test(t)) return true
  if (TERMS_RE.test(t) && CONSENT_RE.test(t)) return true
  return false
}

export interface PageJunkResult {
  verdict: PageTextVerdict
  kept: string[] // the paragraphs that ARE prose (chrome dropped), in order
  droppedChars: number
  keptChars: number
}

/**
 * Classify a page's extracted paragraphs. `kept` is what a reader may treat as article text; the
 * verdict says what the page IS when the chrome dominates:
 *   - 'interstitial' — a consent/terms/cookie wall (or an app shell): what remains is not an article
 *   - 'paywall'      — a subscription stub: a teaser at most
 *   - 'empty'        — nothing readable at all (a JS shell)
 *   - 'ok'           — real prose remains; read it
 */
export function classifyParagraphs(paras: string[]): PageJunkResult {
  const all = (paras || []).map((p) => String(p || '').trim()).filter(Boolean)
  let droppedChars = 0
  let keptChars = 0
  let paywallHit = false
  const kept: string[] = []
  for (const p of all) {
    if (PAYWALL_RE.some((re) => re.test(p))) paywallHit = true
    if (isBoilerplateParagraph(p)) droppedChars += p.length
    else { kept.push(p); keptChars += p.length }
  }
  const total = droppedChars + keptChars
  let verdict: PageTextVerdict = 'ok'
  if (total === 0) verdict = 'empty'
  else if (paywallHit && keptChars < 400) verdict = 'paywall' // a teaser under the wall is not a body
  else if (droppedChars / total >= 0.8) verdict = 'interstitial' // chrome-dominated, whatever remains
  else if (droppedChars / total >= 0.45 && keptChars < 500) verdict = 'interstitial'
  else if (keptChars < 80) verdict = 'empty' // nothing substantive survived
  return { verdict, kept, droppedChars, keptChars }
}
