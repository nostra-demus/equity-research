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
  // newsletter / engagement nags — the overlay popups that dilute the rendered paragraphs
  /\bsign up (?:for|to) (?:our|the|a) (?:free )?(?:daily |weekly |morning |breaking[- ]news )?newsletters?\b/i,
  /\b(?:delivered|sent) (?:straight |right |directly )?to your inbox\b/i,
  /\bby (?:signing up|subscribing|registering|creating an account),? you (?:agree|accept|consent)\b/i,
  /\bgift this article\b/i,
  /\bsupport (?:our|independent|quality|local|fearless) journalism\b.{0,80}\b(?:subscri|donat|contribut)/i,
  /\b(?:turn off|disable|pause) your ad ?blocker\b/i,
  /\bthank you for (?:reading|your support)\b.{0,60}\b(?:subscri|regist|sign)/i,
  /\bfor the best experience,? (?:use|download|open|upgrade|switch)\b/i,
  // finance-portal QUOTE / SEARCH WIDGET shells — the empty-state and control text a market site (Nasdaq
  // and Nasdaq-family portals) renders AROUND the article. Server-side these ticker/quote widgets often
  // fail to load their data and ship a placeholder ("Data is currently not available"), and the site's
  // symbol-search box ships its own empty-state ("We couldn't find any results matching your search").
  // None of it is article prose, yet it is grammatical enough to clear the prose gate — and, rendered
  // ABOVE the story in the served HTML, it LED "THE STORY" on the reported Chevron/Nasdaq read. Nasdaq
  // ships no JSON-LD articleBody, so the structured-data rescue lane cannot route around it; this
  // vocabulary is the fix. Each phrase is unmistakable widget/error chrome — never genuine article prose.
  /\bdata is currently not available\b/i,
  /\bwe (?:couldn'?t|could ?not|did ?n'?t|did not) find any results matching your search\b/i,
  /\bplease try (?:using )?(?:other|different) (?:words|keywords|search terms) for your search\b/i,
  /\bour team is working diligently to resolve (?:the|this) (?:issue|problem)\b/i,
  /\bedit (?:my|your) (?:european )?(?:quotes|watchlist)\b/i,
  /\badd up to \d+ (?:symbols|instruments)\b/i,
  /\byour symbols have been updated\b/i,
  /\badd a symbol to your watchlist\b/i,
  // syndicated STOCK-PROMO insert — the Motley Fool "Stock Advisor" / "Double Down" advertisement injected
  // into every Fool article and carried verbatim into the finance-portal syndication (Nasdaq runs many).
  // It is advertising mid-article, not the story — unmistakable ad copy, safe to drop wherever it appears.
  /\bthis rare signal is flashing again\b/i,
  /\ba\s+"?double down"?\s+(?:stock\s+)?signal\b/i,
  /\bthe motley fool stock advisor\b/i,
  /\bstock advisor'?s (?:total )?average return\b/i,
  /\b10 best stocks for investors to buy (?:right )?now\b/i,
  /\bbefore you buy stock in .{1,60}?,\s*consider this\b/i,
]

// paywall / registration-wall phrasing — its own set so the verdict can name the cause
const PAYWALL_RE: RegExp[] = [
  /\b(?:to continue reading|continue reading this article|to read (?:this|the full))\b/i,
  /\b(?:subscribe|sign in|log ?in|register|create (?:a |your )?(?:free )?account)\b.{0,50}\bto (?:continue|read|view|access)\b/i,
  /\balready a subscriber\b/i,
  /\bsubscription (?:is )?required\b/i,
  /\bthis (?:article|content|story) is (?:reserved|exclusive|available) (?:for|to) (?:our )?(?:subscribers|members)\b/i,
  /\bunlock (?:unlimited|full) access\b/i,
  // subscription-OFFER modal copy — the "$1.99 your first month" overlay that covers a loaded article.
  // Every entry is second-person / imperative WALL copy: descriptive prose must survive — a company
  // that "will start a trial" (clinical), customers who "already have an account" (onboarding), or
  // readers who "reached their free article limit" (media-business coverage) are all reporting, not walls
  /\bclaim (?:this|your) offer\b/i,
  /\bstart (?:your|a) free trial\b/i,
  /\byou(?:'ve|’ve| have) (?:reached|read) your\b.{0,30}\b(?:article|story) limit\b/i,
  /\byou have \d+ free articles? (?:remaining|left)\b/i,
  /\balready have an account\s*\?/i,
]

// two-signal combinations for offer copy whose words also live in genuine financial prose. A
// money-per-period price counts as chrome only NEXT TO an imperative offer CTA, so an article
// REPORTING a price ("ARPU fell to $7.28 a month … as free trial conversions slowed") survives —
// and the pair is deliberately chrome, NOT a paywall hit: a pricing paragraph must never flip a
// thin page's verdict to 'paywall' on its own. "unlimited access" is wall copy only next to a
// price or CTA ("Prime members get unlimited access to the library" is product prose).
// NOTE: period words are week/month/year only, and "first" only as second-person "your first" —
// "$5.58 for the first quarter" is earnings guidance, never an offer.
const OFFER_PRICE_RE = /[$€£₹¥]\s?\d[\d.,]*\s*(?:\/\s*|per |a |an |(?:for )?your first )(?:week|month|year)\b/i
const OFFER_CTA_RE = /\b(?:cancel (?:anytime|at any time)|billed (?:annually|monthly)|subscribe (?:now|today|for)|sign up (?:now|today)|claim (?:this|your)|start your|your first (?:week|month|year)|special offer|offer ends)\b/i
const UNLIMITED_ACCESS_RE = /\b(?:get|enjoy|claim) unlimited (?:digital )?access\b/i

/** Wall copy addressed at the reader — an unambiguous PAYWALL_RE phrase, or "unlimited access"
 *  offer copy next to a price / offer CTA (the two-signal guard keeps perk prose alive). */
function isPaywallCopy(t: string): boolean {
  for (const re of PAYWALL_RE) if (re.test(t)) return true
  return UNLIMITED_ACCESS_RE.test(t) && (OFFER_PRICE_RE.test(t) || OFFER_CTA_RE.test(t))
}

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
  if (isPaywallCopy(t)) return true
  if (TERMS_RE.test(t) && CONSENT_RE.test(t)) return true
  if (OFFER_PRICE_RE.test(t) && OFFER_CTA_RE.test(t)) return true
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
    if (isPaywallCopy(p)) paywallHit = true
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
