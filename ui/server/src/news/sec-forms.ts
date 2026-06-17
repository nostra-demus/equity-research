// SEC EDGAR form-code legibility — the one place that turns a raw EDGAR feed title into something a
// non-specialist can read. The EDGAR "getcurrent" atom feeds hand us titles like
//   "424B2 - GOLDMAN SACHS GROUP INC (0000886982) (Filer)"
// which is pure code to anyone who hasn't worked in capital markets: the form number, the filer, a CIK,
// and an EDGAR role tag. This module does three jobs, all pure + dependency-free:
//   1. DICTIONARY  — map each form code to a short label and ONE plain-English sentence of what it is,
//                    plus a `routine` flag (a high-volume filing that rarely moves a stock on its own —
//                    a bank's 424B2 structured-note takedown, a 13F holdings list, an insider Form 4).
//   2. PARSE       — split that EDGAR title back into { form, filer, cik, role } so we can rebuild a
//                    readable line and explain the form.
//   3. TOKEN GUARD — expose the lowercased, alphanumeric-collapsed form codes that survive the themes
//                    tokenizer (424b2, 424b3, defa14a, …) so text-match/enrich can drop them. Without
//                    this, "424b2" + "filer" become theme keywords and every bank's routine prospectus
//                    gets vacuumed into one fake "theme" (the reported "Mortgage Finance Innovation" bug).
//
// The dictionary names are US/SEC form numbers by design — this module is ONLY for SEC EDGAR items
// (CLAUDE.md §27: other regimes file their own documents). Callers gate on the source being SEC EDGAR
// before treating a headline as an EDGAR form line.

export interface SecFormInfo {
  /** the canonical form code, normalized (e.g. "424B2", "8-K", "SC 13D") */
  code: string
  /** short human label for the form chip (e.g. "Prospectus — shelf takedown") */
  label: string
  /** one plain-English sentence: what this filing IS, written for a smart non-specialist */
  meaning: string
  /** true when this is a high-volume, usually-immaterial filing that rarely moves the stock by itself */
  routine: boolean
}

// The dictionary. Keys are the uppercased form codes EDGAR emits. Meanings follow CLAUDE.md §21:
// plain words, keep the term, explain it in place. `routine` marks the filings that flood the wire and
// almost never carry a single-stock thesis on their own.
const FORMS: Record<string, Omit<SecFormInfo, 'code'>> = {
  // --- periodic / event reports ---
  '8-K': { label: 'Material event report', meaning: 'A US company is flagging a development big enough to tell investors about right away — an acquisition, a results release, a management change, and the like.', routine: false },
  '10-K': { label: 'Annual report', meaning: 'The full, audited financial year — the most complete and trustworthy filing a US company makes.', routine: false },
  '10-Q': { label: 'Quarterly report', meaning: 'The latest three months of results — reviewed, not fully audited.', routine: false },
  '6-K': { label: 'Foreign-filer update', meaning: 'A non-US company passing the SEC whatever it just disclosed in its home market.', routine: false },
  '20-F': { label: 'Foreign annual report', meaning: "A non-US company's audited annual report — the 10-K equivalent for a foreign filer.", routine: false },
  '40-F': { label: 'Canadian annual report', meaning: "A Canadian company's annual report, filed under the US–Canada cross-border (MJDS) system.", routine: false },
  '11-K': { label: 'Employee stock-plan report', meaning: "The annual report for the company's employee share-purchase or savings plan — an administrative filing.", routine: true },

  // --- prospectuses / offerings (the high-volume noise on the bank wire) ---
  '424B2': { label: 'Prospectus — shelf takedown', meaning: 'A prospectus used to sell securities off a registration the company already has on file (a "shelf"). For a large bank this is almost always a routine structured-note or medium-term-note program, not a company-changing event.', routine: true },
  '424B3': { label: 'Prospectus supplement', meaning: 'An update to the terms of an offering that was already registered — usually housekeeping, not new news.', routine: true },
  '424B4': { label: 'Final IPO prospectus', meaning: 'The final, priced prospectus for a deal that is actually happening — often an IPO. This one can matter.', routine: false },
  '424B5': { label: 'Final shelf-offering prospectus', meaning: 'The final, priced terms of a real capital raise (shares or bonds) sold off an existing shelf — it can dilute holders or add debt, so it can matter.', routine: false },
  '424B1': { label: 'Final prospectus', meaning: 'The final prospectus for a registered offering — the priced, definitive terms.', routine: false },
  FWP: { label: 'Offering marketing material', meaning: "A 'free writing prospectus' — marketing material for a securities offering already in progress.", routine: true },
  'S-1': { label: 'IPO registration', meaning: 'A company registering to sell shares to the public for the first time — the start of an IPO.', routine: false },
  'S-3': { label: 'Shelf registration', meaning: 'Pre-clearance to sell securities later, on short notice, without a fresh full filing each time.', routine: true },
  'S-4': { label: 'M&A / exchange-offer registration', meaning: 'Shares being registered for a merger or a share-swap deal.', routine: false },
  'S-8': { label: 'Employee stock-plan registration', meaning: 'Registering shares set aside for employee stock and option plans — an administrative filing.', routine: true },
  'F-1': { label: 'Foreign IPO registration', meaning: 'A non-US company registering to sell shares to the US public for the first time.', routine: false },
  EFFECT: { label: 'Registration now effective', meaning: 'The SEC has cleared a registration statement, so the related offering can proceed — a procedural notice.', routine: true },

  // --- ownership, insiders, M&A communications ---
  'SC 13D': { label: 'Activist / >5% stake', meaning: 'Someone has taken a stake above 5% and may push for change — an activist-style position worth noticing.', routine: false },
  'SC 13D/A': { label: 'Activist stake — update', meaning: 'An update to a previously disclosed stake above 5% (size changed, or intentions did).', routine: false },
  'SC 13G': { label: 'Passive >5% stake', meaning: 'A large holder crossing 5%, but as a passive investor not seeking control — typically an index or fund.', routine: true },
  'SC 13G/A': { label: 'Passive stake — update', meaning: 'An update to a previously disclosed passive holding above 5%.', routine: true },
  'SC TO-T': { label: 'Takeover bid (tender offer)', meaning: 'An outside bidder is offering to buy shares directly from holders — a third-party tender offer.', routine: false },
  'SC 14D9': { label: "Target's bid response", meaning: "The target company's official response to a tender offer — recommend, reject, or stay neutral.", routine: false },
  '425': { label: 'Merger communication', meaning: 'A communication tied to an announced merger or business combination.', routine: false },
  '4': { label: 'Insider trade', meaning: "A director or officer reporting that they bought or sold the company's stock — one transaction, watched in aggregate.", routine: true },
  '3': { label: 'Insider — initial holdings', meaning: "A new insider's first report of what company stock they hold.", routine: true },
  '5': { label: 'Insider — annual summary', meaning: "An insider's year-end summary of transactions not reported earlier.", routine: true },
  '144': { label: 'Planned insider sale', meaning: 'Notice that an insider intends to sell restricted stock — an intention, not yet a sale.', routine: true },
  '13F-HR': { label: 'Institutional holdings', meaning: "A large investment manager's quarterly list of its US stock positions — backward-looking by up to 45 days.", routine: true },

  // --- proxies / governance ---
  'DEF 14A': { label: 'Proxy statement', meaning: 'The agenda, board nominees, and executive pay package shareholders vote on at the annual meeting.', routine: false },
  DEFA14A: { label: 'Extra proxy material', meaning: 'Additional material sent to shareholders around a vote — often a campaign for or against a proposal.', routine: true },
  PRE14A: { label: 'Preliminary proxy', meaning: 'A draft of the annual-meeting proxy statement, filed before the final version.', routine: true },

  // --- distress / structural signals (low-volume but can matter) ---
  'NT 10-K': { label: 'Late annual filing notice', meaning: "A notice that the company can't file its annual report on time — sometimes a sign of accounting or audit trouble.", routine: false },
  'NT 10-Q': { label: 'Late quarterly filing notice', meaning: "A notice that the company can't file its quarterly report on time — worth a second look.", routine: false },
  '25-NSE': { label: 'Delisting notice', meaning: 'A security is being removed from an exchange listing.', routine: false },
  '15-12B': { label: 'Deregistration', meaning: 'The company is ending its SEC reporting obligations — it will go dark to public investors.', routine: false },
  SD: { label: 'Specialized disclosure', meaning: 'A special-topic disclosure such as the annual conflict-minerals report — usually administrative.', routine: true },
}

const EDGAR_ROLES = new Set(['filer', 'subject', 'reporting', 'issuer', 'filed by', 'subject company'])

/** Normalize a raw form string to a dictionary key: collapse whitespace, uppercase. */
function normForm(raw: string): string {
  return String(raw || '').replace(/\s+/g, ' ').trim().toUpperCase()
}

/**
 * Look up the plain-English meaning of an EDGAR form code. Tolerant of the amendment suffix "/A"
 * (e.g. "10-K/A" → the 10-K meaning, prefixed "Amended"). Returns undefined for an unknown code so the
 * caller can fall back to a neutral "regulatory filing" line rather than inventing meaning.
 */
export function lookupSecForm(raw: string): SecFormInfo | undefined {
  const code = normForm(raw)
  if (!code) return undefined
  const direct = FORMS[code]
  if (direct) return { code, ...direct }
  // amendment: "<BASE>/A" — describe it as an amended version of the base form
  const amend = /^(.+?)\/A$/.exec(code)
  if (amend) {
    const base = FORMS[amend[1]]
    if (base) return { code, label: `${base.label} — amended`, meaning: `An amended version of an earlier filing. ${base.meaning}`, routine: base.routine }
  }
  return undefined
}

export interface EdgarFilingHeadline {
  form: string // the form code as it appeared, e.g. "424B2"
  filer: string // the cleaned filer name, e.g. "Goldman Sachs Group Inc"
  cik?: string // the 6–10 digit CIK, when present
  role?: string // the EDGAR role tag (Filer / Subject / …), when present
}

// A form code shaped like EDGAR emits: an optional multi-word prefix (SC / NT / DEF / DEFA / PRE / S /
// F), digits and letters, optional internal hyphen, optional "/A" amendment. Used only to confirm that
// the left side of a "<FORM> - <FILER>" title really is a form code (so we never mangle an ordinary
// "Acme - Q2 beats" headline).
const FORM_SHAPE = /^(?:SC|NT|DEF|DEFA|PRE|S|F|N|T|U|POS)?\s?[0-9A-Z]{1,5}(?:[-/][0-9A-Z]{1,4})*(?:\/A)?$/i

/**
 * Parse an EDGAR "getcurrent" feed title — "424B2 - GOLDMAN SACHS GROUP INC (0000886982) (Filer)" —
 * back into its parts. Splits on the FIRST " - " (the form/filer separator; form codes carry their own
 * hyphens WITHOUT surrounding spaces, so this is unambiguous), then peels a trailing "(CIK)" and
 * "(Role)" off the filer. Returns undefined when the left side isn't a form code OR the form is unknown
 * to the dictionary — so a normal hyphenated headline is never misread as a filing.
 */
export function parseEdgarFilingHeadline(headline: string): EdgarFilingHeadline | undefined {
  const h = String(headline || '').replace(/\s+/g, ' ').trim()
  const m = /^(.+?)\s-\s(.+)$/.exec(h)
  if (!m) return undefined
  const form = m[1].trim()
  if (!FORM_SHAPE.test(form)) return undefined
  // require the form to be one we actually understand — guards against false positives on real headlines
  if (!lookupSecForm(form)) return undefined
  let rest = m[2].trim()
  let role: string | undefined
  let cik: string | undefined
  // peel trailing "(Role)" — only when the parenthetical is an EDGAR role word
  const roleM = /\(([^)]+)\)\s*$/.exec(rest)
  if (roleM && EDGAR_ROLES.has(roleM[1].trim().toLowerCase())) {
    role = roleM[1].trim()
    rest = rest.slice(0, roleM.index).trim()
  }
  // peel trailing "(CIK)" — 6–10 digits
  const cikM = /\((\d{6,10})\)\s*$/.exec(rest)
  if (cikM) {
    cik = cikM[1]
    rest = rest.slice(0, cikM.index).trim()
  }
  // strip a dangling separator left after peeling the parens, but KEEP a legit abbreviation period
  // ("Genprex, Inc." stays "Genprex, Inc.", while "Foo Corp," → "Foo Corp")
  const filer = rest.replace(/[\s,;:-]+$/, '').trim()
  if (!filer) return undefined
  return { form, filer, cik, role }
}

/** Title-case an ALL-CAPS EDGAR filer name ("GOLDMAN SACHS GROUP INC" → "Goldman Sachs Group Inc"),
 *  leaving an already-mixed-case name alone. Cosmetic only — for the readable story. */
export function tidyFilerName(name: string): string {
  const n = String(name || '').trim()
  if (/[a-z]/.test(n)) return n // already has lowercase → leave brand casing intact
  return n.toLowerCase().replace(/(^|[^a-z])([a-z])/g, (_, sep, c) => sep + c.toUpperCase())
}

/**
 * The guaranteed plain-English story for an SEC EDGAR filing, built from the headline alone (no fetch).
 * "Goldman Sachs Group Inc filed a 424B2 with the SEC — <meaning> <routine hint>." Returns undefined
 * when the headline isn't a recognizable EDGAR form line, so the caller keeps its generic floor.
 */
export function secFilingStory(headline: string): string | undefined {
  const parsed = parseEdgarFilingHeadline(headline)
  if (!parsed) return undefined
  const info = lookupSecForm(parsed.form)
  if (!info) return undefined
  const who = tidyFilerName(parsed.filer)
  // "filed Form 424B2" avoids the a/an pronunciation trap ("an 8-K" vs "a 10-K") and matches how
  // filings are conventionally referenced.
  const lead = who ? `${who} filed Form ${info.code} with the SEC` : `Form ${info.code} was filed with the SEC`
  const parts = [`${lead} — ${info.meaning}`]
  if (info.routine) parts.push('These filings come in high volume and rarely move the stock on their own.')
  return parts.join(' ')
}

// The form-code tokens that would otherwise LEAK into theme keywords — e.g. "424b2", "424b3", "defa14a".
// The themes tokenizer keeps tokens of length ≥ 4 and drops pure numbers, so most codes vanish on their
// own ("8-K" → "8"/"k", "13F-HR" → "13f"/"hr"). What survives is the digit+letter codes; we require BOTH
// a digit AND a letter so a word-shaped form ("EFFECT") is NOT swept up (it's also the English word
// "effect" and must still anchor a real theme). Derived from the dictionary so a newly-added form is
// auto-excluded — no second list to keep in sync.
export const SEC_FORM_TOKENS: Set<string> = new Set(
  Object.keys(FORMS)
    .map((code) => code.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter((tok) => tok.length >= 4 && /\d/.test(tok) && /[a-z]/.test(tok)),
)
