import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { DATA_DIR, ANALYSES_DIR, REPO_ROOT, isReservedDataFolder } from './config'
import { syncingState } from './data-activity'
import { listModuleNames, moduleReadinessDecls } from './roster'
import { isValidTicker, safeSubjectSegment, suggestTicker, tickerInvalidReason } from './sandbox'
import type { ClassifiedFile, CoverageGroup, DataReadinessDecl, DataStatus, FileType, ModuleReadiness, ReadinessToken, Sufficiency, TickerSummary, WorkbookSheet } from './types'
import type { DataScanUpdate } from './data-scan'

// ---- persistent extract cache ----
// Reading workbook tabs / pdf-rtf content spawns python over the Google Drive mount,
// which is slow on a cold load — and we clear in-memory caches on every restart. Persist
// the results to local disk keyed by path:size:mtime, so each file is read at most once
// EVER; repeat loads (and loads after a restart) are instant. A changed file (new mtime
// or size) re-reads automatically.
const CACHE_FILE = path.join(REPO_ROOT, '.cache', 'cockpit-extract.json')
let diskCache: Record<string, unknown> = {}
try {
  diskCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
} catch {
  diskCache = {}
}
let cacheDirty = false
let persistTimer: ReturnType<typeof setTimeout> | null = null
function persistCache(): void {
  if (persistTimer) return
  persistTimer = setTimeout(() => {
    persistTimer = null
    if (!cacheDirty) return
    cacheDirty = false
    try {
      fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true })
      fs.writeFileSync(CACHE_FILE, JSON.stringify(diskCache))
    } catch {}
  }, 800)
}
function cacheGet<T>(key: string): T | undefined {
  return key in diskCache ? (diskCache[key] as T) : undefined
}
function cacheSet(key: string, val: unknown): void {
  diskCache[key] = val
  cacheDirty = true
  persistCache()
}

// in-flight de-dup: the extractor calls are async (execFile, never execFileSync — a 20-30s cold read
// over the Drive mount must not freeze the event loop; see readiness.ts for the same rule), so two
// concurrent requests can now miss the cache together. Share one spawn per key so a file is still
// read at most once EVER, exactly as the cache header promises.
const inflight = new Map<string, Promise<unknown>>()
function singleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const cur = inflight.get(key)
  if (cur) return cur as Promise<T>
  const p = fn().finally(() => inflight.delete(key))
  inflight.set(key, p)
  return p
}

const execFileAsync = promisify(execFile)

// ---- light content sniffing (memoized) ----
const sniffCache = new Map<string, string>()
async function sniffText(filePath: string, sizeBytes: number, mtimeMs: number): Promise<string> {
  const key = `${filePath}:${sizeBytes}:${Math.round(mtimeMs)}`
  const hit = sniffCache.get(key)
  if (hit !== undefined) return hit
  let text = ''
  try {
    const ext = path.extname(filePath).toLowerCase()
    const base = filePath.slice(0, -ext.length)
    const sibling = base + '.txt'
    if (ext === '.txt') {
      text = fs.readFileSync(filePath, 'utf8').slice(0, 8000)
    } else if (fs.existsSync(sibling)) {
      text = fs.readFileSync(sibling, 'utf8').slice(0, 8000)
    } else if (ext === '.pdf' || ext === '.rtf') {
      // extract REAL text via the canonical extractor (pdftotext / textutil) so we
      // classify on contents, not raw bytes. Fall back to printable bytes if it fails.
      text = (await extractSniffText(filePath, sizeBytes, mtimeMs)).slice(0, 8000)
      if (!text) {
        const buf = fs.readFileSync(filePath).subarray(0, 16000).toString('latin1')
        text = buf.replace(/[^\x20-\x7e\n]/g, ' ').slice(0, 8000)
      }
    }
  } catch {
    text = ''
  }
  sniffCache.set(key, text)
  return text
}

// real text for a pdf/rtf (and any supported type) via the canonical extractor —
// the SAME extract_pool.py the pipeline uses, so the cockpit reads pdf/rtf instead
// of guessing from raw bytes. Returns '' on any failure (pdftotext/textutil absent).
function extractSniffText(filePath: string, sizeBytes: number, mtimeMs: number): Promise<string> {
  const key = `sniff:${filePath}:${sizeBytes}:${Math.round(mtimeMs)}`
  const cached = cacheGet<string>(key)
  if (cached !== undefined) return Promise.resolve(cached)
  return singleFlight(key, async () => {
    let text = ''
    try {
      const script = path.join(REPO_ROOT, '.claude', 'tools', 'extract_pool.py')
      const { stdout } = await execFileAsync('python3', [script, '--text', filePath, '--max-chars', '16000'], { timeout: 30000, maxBuffer: 8_000_000 })
      text = stdout
    } catch {
      text = ''
    }
    cacheSet(key, text)
    return text
  })
}

// ---- workbook tab reader (memoized) ----
// Reuses the engine's ONE canonical extractor (.claude/tools/extract_pool.py --list-json)
// so the cockpit and the research pipeline agree on what tabs a workbook holds. A multi-tab
// Capital IQ / NSE export must never show up as one opaque "other / low" row.
function readWorkbookSheets(filePath: string, sizeBytes: number, mtimeMs: number): Promise<WorkbookSheet[] | undefined> {
  const key = `sheets:${filePath}:${sizeBytes}:${Math.round(mtimeMs)}`
  const cached = cacheGet<WorkbookSheet[] | null>(key)
  if (cached !== undefined) return Promise.resolve(cached ?? undefined)
  return singleFlight(key, async () => {
    let sheets: WorkbookSheet[] | undefined
    try {
      const script = path.join(REPO_ROOT, '.claude', 'tools', 'extract_pool.py')
      const { stdout } = await execFileAsync('python3', [script, '--list-json', filePath], { timeout: 20000, maxBuffer: 8_000_000 })
      const parsed = JSON.parse(stdout)
      if (parsed && parsed.kind === 'workbook' && parsed.status === 'ok' && Array.isArray(parsed.sheets)) {
        sheets = parsed.sheets.map((s: { name?: unknown; rows?: unknown; cols?: unknown; cells?: unknown }) => ({
          name: String(s.name ?? ''),
          rows: Number(s.rows) || 0,
          cols: Number(s.cols) || 0,
          cells: Number(s.cells) || 0,
        }))
      }
    } catch {
      sheets = undefined // missing python/xlrd, HTML-disguised .xls, or corrupt file — degrade gracefully
    }
    // [fix F34] cache ONLY successful reads. A transient failure (FUSE deadlock, a momentary lock,
    // a missing dep before bootstrap) must not be memoized as a permanent "no tabs": the disk cache
    // persists across restarts and the key (path:size:mtime) won't change on a re-flake, so a one-off
    // failure would stick forever. Leaving the key absent makes the next refresh re-attempt the read.
    if (sheets !== undefined) cacheSet(key, sheets)
    return sheets
  })
}

// when a workbook's filename gave no signal, classify on the tab names we actually read
const SHEET_TYPE_RULES: [RegExp, FileType][] = [
  // tab-name first: a workbook saved as "Haier 600690.xls" whose only tab is "Suppliers" is still a
  // relationship export, and the filename rule above would never have seen it.
  [/^suppliers?$|^customers?$|relationship/i, 'business_relationships'],
  [/multiple/i, 'multiples_export'],
  [/peer|comp/i, 'peer_comps'],
  [/consensus|estimate|revision|surprise|trend|guidance/i, 'consensus_estimates'],
  [/ownership|insider|holding/i, 'ownership_insider'],
  [/financ|income|balance|cash[\s_]?flow|profit|p&l/i, 'financials'],
]
function inferTypeFromSheets(sheets: WorkbookSheet[]): FileType {
  const names = sheets.map((s) => s.name).join(' | ')
  for (const [re, t] of SHEET_TYPE_RULES) if (re.test(names)) return t
  return 'other'
}

// ---- period / age ----
function monthsSince(year: number, month: number): number {
  const now = new Date()
  return (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month)
}

export function extractPeriod(filename: string, sniff: string): { hint: string | null; ageMonths: number | null } {
  // The FILENAME's own period wins over content-scraped years: a doc titled "…_2024" IS the FY2024 doc, even
  // though its BODY routinely names the following year (outlook, AGM date, forward statements). Scanning
  // filename+content TOGETHER and taking Math.max let that next-year read as the period — so the 2024 annual
  // report (body mentions 2025) tied the 2025 one at ~1.1yr, and the freshest-pick's strict `<` then kept the
  // alphabetically-earlier 2024. Scan the filename ALONE first; fall to content only when it carries no period.
  // `precise` marks an exact fiscal/quarter period (real month-end anchor); a bare calendar year is NOT
  // precise (it falls to the neutral June default). `year` is the resolved END year, used to keep a body
  // upgrade on the SAME year the filename already named — so it never re-opens the next-year leak.
  const scan = (hay: string): { hint: string; ageMonths: number | null; year: number; precise: boolean } | null => {
    // fiscal year e.g. FY24-25, FY2024-25, FY25
    let m = hay.match(/FY\s?(\d{4})[-/](\d{2,4})/i)
    if (m) {
      const endY = m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2])
      return { hint: `FY${m[1]}-${m[2]}`, ageMonths: Math.max(0, monthsSince(endY, 3)), year: endY, precise: true }
    }
    m = hay.match(/\bFY\s?(\d{2})\b/i)
    if (m) {
      const endY = 2000 + Number(m[1])
      return { hint: `FY${m[1]}`, ageMonths: Math.max(0, monthsSince(endY, 3)), year: endY, precise: true }
    }
    // quarter e.g. Q1 2026 / q1-2026
    m = hay.match(/\bQ([1-4])[\s\-_]?(20\d{2})\b/i)
    if (m) {
      const q = Number(m[1])
      return { hint: `Q${m[1]} ${m[2]}`, ageMonths: Math.max(0, monthsSince(Number(m[2]), q * 3)), year: Number(m[2]), precise: true }
    }
    // broker-style quarter e.g. 4Q25 / 1Q2026 (sell-side note convention) — parse to the SAME `Q<n> <yyyy>`
    // hint as a verbatim "Q4 2025" transcript, so a broker note and the real transcript for one call dedupe to
    // a single period (and 4Q25 vs 1Q26 count as two). Without this both fall to the bare-year max and collapse
    // to the same "2026" periodHint, mis-counting distinct recent calls (Codex #195).
    m = hay.match(/\b([1-4])Q\s?(20\d{2}|\d{2})\b/i)
    if (m) {
      const q = Number(m[1])
      const yr = m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2])
      return { hint: `Q${m[1]} ${yr}`, ageMonths: Math.max(0, monthsSince(yr, q * 3)), year: yr, precise: true }
    }
    // bare fiscal range e.g. 2024-25 / 2024-2025 — the common Indian annual-report filename with NO `FY`
    // prefix (`Annual_Report_2024-25.pdf`). Without this branch the plain-year scan below grabs only the
    // START year (2024) and dates it to June, so a current FY2024-25 report reads ~9-12 months too old and
    // wrongly trips the staleness gate. Require CONSECUTIVE years (end === start+1) so it is a real fiscal
    // year, not an ISO date (`2024-05`) or a multi-year span (`2019-2024`); resolve to the END year, 31-Mar.
    m = hay.match(/(?<![0-9])(20\d{2})[-/](\d{4}|\d{2})(?![0-9])/)
    if (m) {
      const startY = Number(m[1])
      const endY = m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2])
      if (endY === startY + 1) {
        return { hint: `FY${m[1]}-${m[2]}`, ageMonths: Math.max(0, monthsSince(endY, 3)), year: endY, precise: true }
      }
    }
    // plain 4-digit year, take the most recent plausible one. NB: not \b(…)\b — `_` is a word char, so \b
    // never fires between "_" and a digit and a filename year like "…_2024.pdf" would go UNMATCHED (the very
    // case this fix targets). Use digit-boundary lookaround so "_2024.", " 2024 " and "-2024-" all match while
    // a digit-embedded "12024"/"20245" does not.
    const years = [...hay.matchAll(/(?<![0-9])(20[1-3]\d)(?![0-9])/g)].map((x) => Number(x[1])).filter((y) => y <= new Date().getFullYear() + 1)
    if (years.length) {
      const y = Math.max(...years)
      return { hint: String(y), ageMonths: Math.max(0, monthsSince(y, 6)), year: y, precise: false }
    }
    return null
  }
  const fromName = scan(filename)
  // When the filename carries only a bare calendar year (not precise), a MORE-PRECISE fiscal/quarter period
  // in the body for the SAME end-year sharpens the age (e.g. "Annual Report 2025" + body "FY2024-25" → a
  // 31-March-2025 year-end per §27, not the June default). Constraining to the same end-year keeps the pick
  // stable and cannot reintroduce the next-year leak (a body year ≠ the filename year is ignored).
  if (fromName && !fromName.precise) {
    const fromBody = scan(sniff.slice(0, 2000))
    // A bare filename year that is actually a DOWNLOAD / SAVED / EXPORT / DATED stamp (e.g.
    // `Annual_Report_downloaded_2026.pdf`) is NOT the report period — it would otherwise read a FY2024-25
    // report as ~1mo fresh off the 2026 stamp and slip past the staleness gate. When the picked bare year is
    // such a stamp, prefer the body's precise fiscal/quarter period even on a DIFFERENT year (Codex #196
    // r3553859966). This does NOT reopen the next-year leak: a real period filename (`Annual_Report_2024.pdf`)
    // has no stamp token, so its year is not a stamp and the strict same-year rule below still guards it.
    const stamp = filename.match(/(?:downloaded?|saved?|exported?|printed?|retrieved?|generated?|accessed?|dated|as[\s_]?(?:of|at))[\s_:.\-]*(?:on[\s_]*)?(20[1-3]\d)(?![0-9])/i)
    const nameYearIsStamp = stamp != null && Number(stamp[1]) === fromName.year
    if (fromBody && fromBody.precise && (fromBody.year === fromName.year || nameYearIsStamp)) {
      return { hint: fromBody.hint, ageMonths: fromBody.ageMonths }
    }
  }
  const chosen = fromName ?? scan(sniff.slice(0, 2000))
  return chosen ? { hint: chosen.hint, ageMonths: chosen.ageMonths } : { hint: null, ageMonths: null }
}

const MONTH_NUM: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
}
// Age (in months) implied by the QUOTE / as-of date of a price document — the Capital IQ "Delayed Quote …
// Last Updated on Jul-02-2026" / "close price as of Jul-02-2026" line, an ISO 2026-07-02, etc. A full date
// counts ONLY when it sits right after a quote-context phrase, so neither a bare body year (a founding
// year — the stray "2010" that read a same-day tearsheet 16y stale) NOR a newer UNRELATED date elsewhere
// in the tearsheet (an upcoming-earnings / ex-dividend / analyst-target date) can set the quote age.
//
// Context comes in two tiers. STRONG phrases ("last updated", "delayed quote", "real-time quote") are used
// ONLY for an actual quote timestamp in these vendor exports. WEAK phrasing ("as of" / "as at") is generic —
// it also introduces consensus-estimate dates, filing dates, shareholding-as-of dates, and the like. So a
// weak "as of" must never outrank a strong quote phrase elsewhere in the same document (Codex: "consensus
// estimates as of Jul-02-2026" sitting next to a stale "Delayed Quote Last Updated Jan-02-2026" must not
// make the quote read as July). Weak matches are used ONLY when no strong match exists anywhere in the text;
// within a tier, the most-recent qualifying date wins. Null when nothing qualifies.
export function quoteAsOfMonths(sniff: string): number | null {
  if (!sniff) return null
  const text = sniff.slice(0, 16000)
  const strongCtx = /(?:last[\s_]?updated|updated[\s_]?on|delayed[\s_]?quote|real[\s_-]?time[\s_]?quote)/gi
  const weakCtx = /(?:as[\s_]?of|as[\s_]?at)/gi
  const fullDate = /\b([A-Za-z]{3})[a-z]*[-.\s](\d{1,2})(?:st|nd|rd|th)?,?[-\s](\d{4})\b|\b(\d{4})-(\d{2})-\d{2}\b/

  const scan = (re: RegExp): Array<{ y: number; mo: number }> => {
    const hits: Array<{ y: number; mo: number }> = []
    let ctx: RegExpExecArray | null
    while ((ctx = re.exec(text))) {
      // a full date in the ~50 chars immediately FOLLOWING the context phrase (else ignore it)
      const tail = text.slice(ctx.index + ctx[0].length, ctx.index + ctx[0].length + 50)
      const d = tail.match(fullDate)
      if (!d) continue
      if (d[1]) { const mo = MONTH_NUM[d[1].toLowerCase()]; if (mo) hits.push({ y: Number(d[3]), mo }) }
      else if (d[4]) hits.push({ y: Number(d[4]), mo: Number(d[5]) })
    }
    return hits
  }

  const strongHits = scan(strongCtx)
  const hits = strongHits.length ? strongHits : scan(weakCtx)

  let bestKey = -1, bestY = 0, bestMo = 0
  for (const h of hits) {
    if (h.y < 2000 || h.y > new Date().getFullYear() + 1 || h.mo < 1 || h.mo > 12) continue
    const key = h.y * 12 + h.mo
    if (key > bestKey) { bestKey = key; bestY = h.y; bestMo = h.mo }
  }
  return bestKey < 0 ? null : Math.max(0, monthsSince(bestY, bestMo))
}

// The as-of age of an earnings CALL from an explicit date in its FILENAME (e.g.
// "… Q4 2025 Earnings Call, Feb 05, 2026.rtf" or an ISO "2026-02-05"). A call is held AFTER the quarter it
// covers closes, so for RECENCY its call date is sharper than the quarter-END that extractPeriod anchors to —
// without it a Q4 call held in February reads a quarter (~2mo) too old and can fall outside the 6-month
// "recent call" window (Codex #195). periodHint keeps the quarter for distinctness; only the age uses the
// call date. Filename only — a bare body date is too easily a forward-looking one (next-earnings / ex-div).
export function callDateMonths(name: string): number | null {
  const cands: Array<{ y: number; mo: number }> = []
  // A later EXPORT / DOWNLOAD / PRINT stamp is not the call date. Taking the max of every filename date would
  // let "…Aug 05 2025 - exported 2026-07-01.rtf" age a stale Q2-2025 call from the export date (→ falsely
  // recent, suppressing the "<2 recent calls" cap). Skip any date immediately preceded by such a stamp word
  // so recency binds to the call date, never the housekeeping stamp (Codex #195 r3554298641).
  const STAMP = /(?:exported?|downloaded?|printed?|generated?|retrieved?|accessed?|saved?|created?|updated?|as[\s_]?of)[\s_:.\-]*$/i
  const push = (idx: number, y: number, mo: number) => {
    if (STAMP.test(name.slice(Math.max(0, idx - 16), idx))) return
    cands.push({ y, mo })
  }
  for (const m of name.matchAll(/\b([A-Za-z]{3})[a-z]*[-.\s](\d{1,2})(?:st|nd|rd|th)?,?[-\s](\d{4})\b/gi)) {
    const mo = MONTH_NUM[m[1].toLowerCase()]
    if (mo) push(m.index!, Number(m[3]), mo)
  }
  for (const m of name.matchAll(/\b(\d{4})-(\d{2})-\d{2}\b/g)) push(m.index!, Number(m[1]), Number(m[2]))
  let best: { y: number; mo: number } | null = null
  for (const c of cands) {
    if (c.y < 2000 || c.y > new Date().getFullYear() + 1 || c.mo < 1 || c.mo > 12) continue
    if (!best || c.y * 12 + c.mo > best.y * 12 + best.mo) best = c
  }
  return best ? Math.max(0, monthsSince(best.y, best.mo)) : null
}

// A sell-side note by CONTENT: a directional verdict block (Target Price + Rating/Recommendation) riding on
// an earnings-call summary. Specific to broker notes — a company / verbatim transcript never carries a
// Target-Price-and-Rating block. Keyed on the verdict block, NOT on "our estimate" (which management also
// says when guiding). Used both before the transcript-filename fallback and in the opaque-name content
// sniff, so a broker note is tagged the same however it is named.
function isSellSideNoteContent(sniff: string): boolean {
  if (!sniff) return false
  // "Target Price" OR the "Price Target" / hyphenated variant a note may use (Codex #195 r3552380160).
  const hasTargetPrice = /target[\s\-]?price|price[\s\-]?target/i.test(sniff)
  // A verdict LABEL, not free text: "Rating"/"Recommendation"/"Overweight"/"Underweight" are unambiguous
  // analyst-verdict labels a real broker note always prints. A bare "buy"/"sell"/"hold" is deliberately NOT
  // accepted on its own — a verbatim transcript routinely says "buy back", "hold cash", or "sell-side" in
  // passing, and pairing that with a quoted "price target" would mis-tag it a broker note and strip its
  // transcript status (§24 — Codex #195 r3552380164). A genuine broker note labels its call ("Rating BUY",
  // "Recommendation: BUY"), so this loses no real proxy.
  // A bare "rating" preceded by "credit" is a company's CREDIT rating (management colour on a verbatim
  // transcript), NOT an analyst verdict label — exclude it so a real transcript that mentions its credit
  // rating alongside an analyst "price target" question is not mis-tagged a broker note (§24 — Codex #195
  // r3553999647). "Recommendation"/"Overweight"/"Underweight", and a non-credit "Rating: BUY", still qualify.
  const hasVerdict = /(?<!credit )\brating\b|recommendation|overweight|underweight/i.test(sniff)
  const summarisesCall = /earnings call|earnings call summary|prepared remarks|conference call/i.test(sniff)
  return hasTargetPrice && hasVerdict && summarisesCall
}

// ---- classification ----
export function classify(filename: string, sniff: string): { type: FileType; confidence: 'high' | 'medium' | 'low'; basis: 'filename' | 'content' | 'extension' } {
  const f = filename.toLowerCase()
  const ext = path.extname(f)
  const test = (re: RegExp) => re.test(f)
  const testC = (re: RegExp) => re.test(sniff)

  if (test(/\.gdoc$/)) return { type: 'user_note', confidence: 'high', basis: 'filename' }
  if (test(/annual[\s_]?report|10-?k|integrated annual/)) return { type: 'annual_filing', confidence: 'high', basis: 'filename' }
  // A results/earnings PRESENTATION or slide deck is slides, not prepared remarks — route it to deck BEFORE
  // the transcript rule (which matches "earnings call", a token an "…Earnings Call Presentation" deck also
  // carries), so a deck can't fill the CORE "Earnings transcript" coverage slot. `\bdeck\b` (word-bounded)
  // so an issuer like "Deckers" isn't swept in. BUT an explicit transcript that a vendor happens to title
  // with a presentation-event name ("Q1 Earnings Presentation Transcript", "Investor Presentation
  // Transcript") is prepared remarks, not slides — the `transcript` token wins, so exclude it here and let
  // it fall through to the transcript rule below.
  if (test(/presentation|slides|\bdeck\b/) && !test(/transcript/)) return { type: 'investor_deck', confidence: 'high', basis: 'filename' }
  // A SELL-SIDE / analyst earnings-CALL note (a broker "Earnings Call Insight / Summary / Recap") is a
  // hybrid: a call summary bundled with a directional verdict (Rating / Target Price). It is NOT a verbatim
  // transcript — tag it distinctly so the reading layer strips the verdict and caps it (earnings
  // MODULE_RULES → Transcript Sourcing). The FILENAME shortcut REQUIRES the "earnings"/"conference" qualifier
  // on the call token: an "…Earnings Call Summary/Insight/Recap" is the proxy, but a bare "Capital Call
  // Summary" / "Customer Call Recap" is NOT an earnings call and must not fill the Earnings-transcript slot
  // (§11 — Codex #195 r3551600913). A bare "Equity Research … Earnings" or "Analyst Report … Results" name is
  // an ORDINARY results/target-price note, not a call summary, so it too needs the content verdict block
  // (below) to prove it summarises a call. Tested BEFORE the transcript rule so an "…Earnings Call Summary"
  // name is a proxy, not a plain transcript; a verbatim CIQ transcript ("…Q1 2026 Earnings Call…") carries
  // no insight/summary/recap token, so it falls through untouched.
  // The separator between "call" and the summary token is a RUN (`[\s\-_–—]*`), so a broker note titled
  // "…Earnings Call - Summary" / "…Earnings Call – Recap" (space-dash-space, en/em dash) still matches — a
  // single-char class missed these and let them fall through to the plain-transcript rule untagged (§24 —
  // Codex #195 r3553999643). The trailing token list is still required, so a verbatim "…Earnings Call.pdf"
  // (no insight/summary/recap token) is unaffected and falls through to the transcript rule below.
  if (test(/(?:earnings|conference)[\s\-_–—]?call[\s\-_–—]*(?:insight|summary|recap|review|takeaways?|highlights?)/)) return { type: 'sell_side_earnings_note', confidence: 'high', basis: 'filename' }
  // A file whose NAME says "earnings call" but whose BODY carries a broker verdict block (Target Price +
  // Rating on a call summary) is a sell-side note, not a verbatim transcript — check content BEFORE the
  // transcript-filename fallback below claims it, otherwise the directional verdict rides along untagged
  // (§24) and fills the call slot as if it were a real transcript. EXCLUDE the tearsheet / Key-Developments /
  // company-profile / landscape NAMES here: those are Capital IQ material-events/reference feeds that can
  // quote an earnings call plus an analyst target/rating and would be mis-typed as a call proxy, satisfying
  // the transcript slot (§11 — Codex #195 r3551600915). They are pinned to 'other' by name just below.
  // The excluded NAMES are separator-tolerant (`company[\s_]?profile`, `tear[\s_]?sheet`) so `Public_Company_
  // Profile.pdf` / `tear_sheet.pdf` are caught too (a literal-space list missed the underscore/hyphen exports —
  // Codex #195 r3554298632). Also exclude an ANALYST-COVERAGE / BROKER-RECOMMENDATION name here: a file the
  // filename rule below pins to `consensus_estimates` must not be hijacked into the transcript slot by a
  // Recommendation+Target-Price body that also quotes a call (§4/§11 — Codex #195 r3553999649).
  if (!test(/company[\s_]?profile|tear[\s_]?sheet|landscape|key[\s_]?developments|strategic[\s_]?alliances|analyst[\s_]?coverage|research[\s_]?coverage|broker[\s_]?(?:recommendation|rating)/) && isSellSideNoteContent(sniff)) return { type: 'sell_side_earnings_note', confidence: 'medium', basis: 'content' }
  // Transcript is tested BEFORE quarterly on purpose: an earnings-call transcript filename carries a
  // quarter token ("…Q1 2026 Earnings Call…") that the quarterly rule's `q[1-4] 20\d{2}` would otherwise
  // claim first — and once quarterly returns, the content sniff (line ~223) never runs. The
  // "earnings call"/"transcript"/"conference call" signal is the stronger, more specific one, so it wins.
  if (test(/transcript|conference[\s\-_]?call|earnings[\s\-_]?call|_call\b/)) return { type: 'transcript', confidence: 'high', basis: 'filename' }
  if (test(/10-?q|quarterly|interim[\s_]?(results?|report|financ|statement)|half[\s\-]?year|q[1-4][\s\-_]?20\d{2}/)) return { type: 'quarterly_filing', confidence: 'high', basis: 'filename' }
  if (test(/estimates?|consensus/)) return { type: 'consensus_estimates', confidence: 'high', basis: 'filename' }
  if (test(/revision|surprise|recent[\s_]?changes|trends/)) return { type: 'consensus_estimates', confidence: 'medium', basis: 'filename' }
  if (test(/analyst[\s_]?coverage|research[\s_]?coverage|broker[\s_]?(recommendation|rating)/)) return { type: 'consensus_estimates', confidence: 'high', basis: 'filename' }
  if (test(/multiples/)) return { type: 'multiples_export', confidence: 'high', basis: 'filename' }
  if (test(/comparable|comps|peer/)) return { type: 'peer_comps', confidence: 'high', basis: 'filename' }
  if (test(/ownership|insider|shareholding|public[\s_]?holding|holding[\s_]?pattern/)) return { type: 'ownership_insider', confidence: 'high', basis: 'filename' }
  if (test(/proxy|def[\s_]?14a|compensation|remuneration|professionals/)) return { type: 'proxy_comp', confidence: 'medium', basis: 'filename' }
  if (test(/guidance/)) return { type: 'guidance', confidence: 'high', basis: 'filename' }
  if (test(/financials|income|balance|cash[\s_]?flow/)) return { type: 'financials', confidence: 'high', basis: 'filename' }
  if (test(/presentation|deck|investor/)) return { type: 'investor_deck', confidence: 'high', basis: 'filename' }
  // Supplementary Capital IQ landscape/reference exports — pinned to 'other' by NAME so the loose content
  // sniff below can't mis-toptier them. "Key Developments" is a material-events/news feed that quotes
  // phrases like "Independent Auditor" and would otherwise false-match the annual_filing content rule and
  // hijack the "Annual report" coverage slot from the real 10-K (a §4 source-hierarchy error).
  // A Suppliers / Customers export is NOT supplementary chrome: it is the only pool document that names
  // the company's counterparties, and the engine parses it into the supply-chain graph every module and
  // the Ideas chain lane read. Typed before the generic landscape sweep-up below so it stops being an
  // opaque "other / low" row. Still readiness-neutral — no readiness rule keys on this type.
  if (test(/supplier|customer/) && !test(/customer[\s_]?call|customer[\s_]?recap/)) return { type: 'business_relationships', confidence: 'high', basis: 'filename' }
  if (test(/company[\s_]?profile|tear[\s_]?sheet|landscape|products|key[\s_]?developments|strategic[\s_]?alliances/)) return { type: 'other', confidence: 'low', basis: 'filename' }

  // content sniff for opaque names (UUID PDFs). A sell-side verdict block is already caught above
  // (isSellSideNoteContent), before the transcript-filename fallback, so no proxy check is needed here.
  if (sniff) {
    if (testC(/ANNUAL REPORT|Form 10-K|Independent Auditor|Integrated Annual/i)) return { type: 'annual_filing', confidence: 'medium', basis: 'content' }
    if (testC(/Form 10-Q|three months ended|unaudited condensed|interim (results|report|financial)|half[\s-]?year/i)) return { type: 'quarterly_filing', confidence: 'medium', basis: 'content' }
    if (testC(/prepared remarks|Question-and-Answer|Operator[,:]|Thank you for joining|earnings call/i)) return { type: 'transcript', confidence: 'medium', basis: 'content' }
    if (testC(/investor presentation|earnings presentation/i)) return { type: 'investor_deck', confidence: 'medium', basis: 'content' }
    if (testC(/Equity Analyst Coverage|Recommendation[\s\S]{0,60}Target Price|Target Price[\s\S]{0,60}Recommendation|broker recommendation/i)) return { type: 'consensus_estimates', confidence: 'medium', basis: 'content' }
  }
  if (ext === '.xls' || ext === '.xlsx') return { type: 'other', confidence: 'low', basis: 'extension' }
  return { type: 'other', confidence: 'low', basis: 'extension' }
}

// `rel` is the pool-relative path (native sep) from listPoolFiles — the basename for a top-level file,
// or "Filings 4/annual.pdf" for a nested one. Classification, period, and every name-regex run on the
// BASENAME (never the rel path), so a subfolder name — "Presentations/", "2024 Filings/" — can never
// contaminate a file's type or period; the rel path is carried only as the `path` field (for display and
// to keep duplicate basenames distinguishable), exactly as extract_pool.py's manifest does it.
async function classifyFile(dir: string, rel: string): Promise<ClassifiedFile> {
  const full = path.resolve(dir, rel)
  if (full !== dir && !full.startsWith(dir + path.sep)) throw new Error(`pool path escapes the folder: ${rel}`)
  const base = path.basename(rel)
  const relPosix = rel.split(path.sep).join('/')
  const st = fs.lstatSync(full)
  if (!st.isFile() || st.isSymbolicLink() || st.nlink !== 1) {
    throw new Error(`pool file is not one plain file: ${rel}`)
  }
  const sniff = await sniffText(full, st.size, st.mtimeMs)
  let { type, confidence, basis } = classify(base, sniff)
  const { hint, ageMonths } = extractPeriod(base, sniff)
  // fall back to file mtime age when no period could be parsed
  const mtimeAge = Math.max(0, Math.round((Date.now() - st.mtimeMs) / (1000 * 60 * 60 * 24 * 30.4)))
  const ext = path.extname(base).toLowerCase()

  // Crack open spreadsheets so a multi-tab workbook is never one opaque "other / low" row:
  // read its tabs via the canonical extractor and, when the filename gave no signal,
  // classify on what's actually inside.
  let sheets: WorkbookSheet[] | undefined
  if (ext === '.xls' || ext === '.xlsx' || ext === '.xlsm') {
    sheets = await readWorkbookSheets(full, st.size, st.mtimeMs)
    if (sheets && sheets.length) {
      if (basis === 'extension') {
        type = inferTypeFromSheets(sheets)
        confidence = 'medium'
        basis = 'content'
      } else if (confidence === 'low') {
        confidence = 'medium'
        basis = 'content'
      }
    }
  }

  // A current-price/quote doc (tearsheet, IBKR export) carries many historical years in its body, so the
  // generic max-year age mis-reads a stray one as stale. For a PRICE_RE file (by name OR a price tab), age
  // off the explicit quote date first; then any period parsed from the filename/content (e.g. a dated
  // "IBKR_quote_2025-01-02" name); and only last the file mtime — so a Drive re-sync that refreshes mtime
  // can't make a stale quote look current. Keeps the price chip AND valuation's hasCurrentPrice gate honest.
  const isPriceDoc = PRICE_RE.test(base) || (sheets ?? []).some((s) => PRICE_RE.test(s.name))
  // For an earnings CALL (verbatim transcript or sell-side proxy), a call date in the filename is a sharper
  // recency anchor than the quarter-END extractPeriod uses — a Q4 call held in Feb must age from Feb, or it
  // falls out of the 6-month recent-call window and mis-fires the "<2 recent calls" cap (Codex #195).
  const isCallDoc = type === 'transcript' || type === 'sell_side_earnings_note'
  const ageMonthsFinal = isPriceDoc
    ? (quoteAsOfMonths(sniff) ?? ageMonths ?? mtimeAge)
    : isCallDoc
      ? (callDateMonths(base) ?? ageMonths ?? mtimeAge)
      : (ageMonths ?? mtimeAge)

  // A routed wire-event note (research-bridge.ts) has a machine filename (screener_event_EVT-….md) that
  // tells a human nothing. Read the note's own header instead: the news HEADLINE becomes the display
  // name, and the source + wire/published timestamp become the hover line — so the Data pool reads as
  // "what news is in here", not as opaque ids. Parsed from the sniff (the header sits in the first lines);
  // a note that somehow lacks the header simply keeps the filename (fail-open to the old display).
  const wireEvent = /^screener_event_EVT-[0-9a-f]{6,}\.md$/.test(base) ? parseWireEventNote(readNoteText(full), base) : null

  return {
    filename: base,
    // carry the subfolder location only when nested, so a top-level file is byte-identical to before
    ...(relPosix !== base ? { path: relPosix } : {}),
    ext,
    sizeBytes: st.size,
    mtime: new Date(st.mtimeMs).toISOString(),
    type,
    periodHint: wireEvent?.periodHint ?? hint,
    ageMonths: wireEvent?.ageMonths ?? ageMonthsFinal,
    confidence,
    basis,
    ...(sheets && sheets.length ? { sheets } : {}),
    ...(wireEvent ? { displayName: wireEvent.displayName, note: wireEvent.note } : {}),
  }
}

/** Read a routed wire-event note's markdown directly. sniffText() intentionally skips `.md` (reading
 *  every user note by content would re-classify them by body text), so the header parse reads the small
 *  note itself. First 8 KB covers the header; '' on any error → parseWireEventNote returns null (fail-open
 *  to the filename display). */
function readNoteText(filePath: string): string {
  try { return fs.readFileSync(filePath, 'utf8').slice(0, 8000) } catch { return '' }
}

/** Extract the human identity of a routed wire-event note from its own header (research-bridge.ts
 *  renderEventNote writes `# Wire event: <headline>` + `- Source: …` + `- Wire timestamp …: <ts>`).
 *  Returns null when the header isn't there (a foreign file that merely matches the name pattern). */
export function parseWireEventNote(text: string, filename: string): { displayName: string; note: string; periodHint: string | null; ageMonths: number | null } | null {
  const headline = /^# Wire event: (.+)$/m.exec(text)?.[1]?.trim()
  if (!headline) return null
  const source = /^- Source: (.+)$/m.exec(text)?.[1]?.trim() || ''
  const tsLine = /^- Wire timestamp[^:]*: (.+)$/m.exec(text)?.[1]?.trim() || ''
  const eventId = /^screener_event_(EVT-[0-9a-f]+)\.md$/.exec(filename)?.[1] || ''
  // Date the evidence by the article's PUBLICATION date when the note carries one — renderEventNote
  // writes "<wire read time> · published <published>", so the first date on the line is the scanner-read
  // time, not publication. An older article routed today would otherwise read as fresh and overstate the
  // pool's recency. Prefer the `published` segment's date; fall back to the wire/scan timestamp.
  const publishedSeg = tsLine.split(/·\s*published\s+/i)[1] || ''
  const tsIso = (/\d{4}-\d{2}-\d{2}/.exec(publishedSeg)?.[0]) || (/\d{4}-\d{2}-\d{2}/.exec(tsLine)?.[0]) || null
  const ageMonths = tsIso ? Math.max(0, Math.round((Date.now() - Date.parse(`${tsIso}T00:00:00Z`)) / (1000 * 60 * 60 * 24 * 30.4))) : null
  const note = [
    'News event routed from the screener wire',
    source && `Source: ${source}`,
    tsLine && `When: ${tsLine}`,
    eventId && `Event: ${eventId}`,
  ].filter(Boolean).join('\n')
  return { displayName: headline, note, periodHint: tsIso, ageMonths }
}

// ---- external data (data/<TICKER>/external/**) — frameworks/EXTERNAL_DATA.md ----
// Externally ingested research (alt-data panels, expert calls, channel checks, broker notes).
// Listed alongside the top-level pool with three deliberate differences: the type is FORCED to
// the readiness-neutral 'external_data' (an expert-call "transcript" must never fill the earnings
// transcript slot), the filename is the pool-relative path, and provenance comes from the
// document's `.source.json` sidecar (fallback: provider = the containing folder's name).

const SIDECAR_SUFFIX = '.source.json'

// external/<provider>/<file> — two levels max (the watcher and this walk agree on that bound)
function insideOrEqual(candidateRaw: string, authorityRaw: string): boolean {
  const candidate = path.resolve(candidateRaw)
  const authority = path.resolve(authorityRaw)
  return candidate === authority || candidate.startsWith(authority + path.sep)
}

function listExternalFiles(tickerDirRaw: string, authorityRootRaw: string = DATA_DIR): string[] {
  // Inline containment at EVERY derived path, right before its fs use — the shape CodeQL's
  // js/path-injection barrier recognizes (a guard on the parent variable alone, or behind a
  // helper, still left findings on the joined children). No crafted input can escape data/.
  const tickerRoot = path.resolve(tickerDirRaw)
  const authorityRoot = path.resolve(authorityRootRaw)
  const root = path.resolve(tickerRoot, 'external')
  if (!insideOrEqual(tickerRoot, authorityRoot) || !root.startsWith(tickerRoot + path.sep)) return []
  const out: string[] = []
  try {
    for (const n of fs.readdirSync(root)) {
      if (n.startsWith('.') || n.endsWith(SIDECAR_SUFFIX)) continue
      const full = path.resolve(root, n)
      if (!full.startsWith(root + path.sep)) continue
      const st = fs.lstatSync(full)
      if (st.isSymbolicLink()) continue
      if (st.isFile() && st.nlink === 1) out.push(path.join('external', n))
      else if (st.isDirectory()) {
        for (const m of fs.readdirSync(full)) {
          if (m.startsWith('.') || m.endsWith(SIDECAR_SUFFIX)) continue
          const leaf = path.resolve(full, m)
          if (!leaf.startsWith(full + path.sep)) continue
          try {
            const leafStat = fs.lstatSync(leaf)
            if (leafStat.isFile() && !leafStat.isSymbolicLink() && leafStat.nlink === 1) {
              out.push(path.join('external', n, m))
            }
          } catch {}
        }
      }
    }
  } catch { /* no external/ folder — the common case */ }
  return out.sort()
}

// Recursively list the company folder's OWN documents as pool-relative paths (native sep), so the
// cockpit's file panel, readiness dots, coverage, and file count see the SAME files the research orbs
// read. extract_pool.py (iter_pool_files) walks the whole tree with os.walk, so a filing dropped in a
// "Filings 4/" or "Transcript Digest/" subfolder is real pool data — not something the user must move to
// the top level. This mirrors the extractor's exact skip rules so the two never disagree:
//   • hidden entries (name starts with '.')            — same as the extractor
//   • symlinks (files and dirs)                        — extractor walks with followlinks=False
//   • engine-written output (a folder holding a `.nostradamus_output` sentinel) — the extractor skips a
//     file whose IMMEDIATE parent holds the sentinel, still descending into any real subfolders below it
//   • `.source.json` provenance sidecars               — metadata, not documents
// The external/ subtree is owned by listExternalFiles (provenance-aware, forced to the readiness-neutral
// 'external_data' type), so it is excluded here to avoid double-listing. Containment is asserted inline at
// every derived path (the shape CodeQL's js/path-injection barrier recognizes), so nothing escapes DATA_DIR.
function listPoolFiles(tickerDirRaw: string, authorityRootRaw: string = DATA_DIR): string[] {
  const root = path.resolve(tickerDirRaw)
  const authorityRoot = path.resolve(authorityRootRaw)
  if (!insideOrEqual(root, authorityRoot)) return []
  const out: string[] = []
  const walk = (absDir: string, relDir: string): void => {
    // Confine absDir to DATA_DIR IN THIS SCOPE before any fs use — a pure startsWith against the constant
    // safe root is the js/path-injection barrier CodeQL recognizes. The recursive call below guards `abs`
    // in the caller's scope, but the dataflow did not carry that barrier across the recursive call into the
    // `absDir` parameter (it flagged readdirSync(absDir) and path.join(absDir, …) at code-scanning/186-187).
    // The ticker dir and every subfolder start with DATA_DIR + sep, so this rejects nothing valid; the
    // functional confinement to the ticker dir is still done by `abs.startsWith(root + path.sep)` on each
    // child below.
    if (!insideOrEqual(absDir, authorityRoot) || !insideOrEqual(absDir, root)) return
    let names: string[]
    try { names = fs.readdirSync(absDir) } catch { return }
    // A file whose immediate parent holds the sentinel is engine output, never pool input (launcher.ts
    // writes it into every written-back "Memos …"/dossier folder). Matches extract_pool.py exactly.
    const isOutputDir = fs.existsSync(path.join(absDir, '.nostradamus_output'))
    for (const name of names) {
      const abs = path.resolve(absDir, name)
      if (!abs.startsWith(root + path.sep)) continue
      let st: fs.Stats
      try { st = fs.lstatSync(abs) } catch { continue }
      if (st.isSymbolicLink()) continue // never follow a symlink (extractor: followlinks=False)
      if (st.isDirectory()) {
        // A directory named "external" — at ANY depth, not just the ticker root — is owned by the
        // provenance-aware listExternalFiles (top-level only) or simply excluded from the research pool
        // when nested deeper. Matches extract_pool.py's _is_external_rel: "external" as any path segment
        // before the filename marks the whole subtree external, not just data/<T>/external/ (Codex parity
        // finding, PR #457 review round 2) — a nested Archive/external/provider/doc.pdf must never satisfy
        // filing readiness the way a real top-level filing does.
        if (name === 'external') continue
        // Descend into EVERY real subfolder, including dot-prefixed ones (".archive/"): the extractor's
        // os.walk descends into all non-symlink dirs and skips a document only by its OWN basename. Pruning
        // a dot-DIRECTORY here made the cockpit miss filings the orbs read — the exact disagreement this PR
        // exists to remove, just in reverse (Codex parity finding).
        walk(abs, relDir ? path.join(relDir, name) : name)
      } else if (st.isFile()) {
        if (name.startsWith('.')) continue // dot-FILE (incl. the .nostradamus_output sentinel) — matches the extractor's basename skip
        if (isOutputDir) continue // engine-written output folder (.nostradamus_output sentinel) — excluded from the pool
        if (name.toLowerCase().endsWith(SIDECAR_SUFFIX)) continue // provenance sidecar, not a document — case-insensitive, matching extract_pool.py's _is_sidecar (name.lower().endswith(...))
        if (st.nlink !== 1) continue // multiply-linked file — the extractor rejects st_nlink != 1 (iter_pool_files)
        if (path.basename(absDir).endsWith('_pool_extracts')) continue // derived extractor cache, not a source doc (extract_pool.py)
        out.push(relDir ? path.join(relDir, name) : name)
      }
    }
  }
  walk(root, '')
  return out.sort()
}

async function classifyExternalFile(
  tickerDirRaw: string,
  rel: string,
  authorityRootRaw: string = DATA_DIR,
): Promise<ClassifiedFile> {
  // same inline containment as listExternalFiles (and analyzeTicker): confine the ticker dir to
  // DATA_DIR, then confine the joined document path to the ticker dir, before ANY fs use.
  const tickerDir = path.resolve(tickerDirRaw)
  const authorityRoot = path.resolve(authorityRootRaw)
  if (!insideOrEqual(tickerDir, authorityRoot)) {
    throw new Error('ticker dir escapes the pool')
  }
  const full = path.resolve(tickerDir, rel)
  if (!full.startsWith(tickerDir + path.sep)) throw new Error(`external path escapes the pool: ${rel}`)
  const st = fs.lstatSync(full)
  if (!st.isFile() || st.isSymbolicLink() || st.nlink !== 1) {
    throw new Error(`external file is not one plain file: ${rel}`)
  }
  const base = path.basename(rel)
  const sniff = await sniffText(full, st.size, st.mtimeMs)
  // period from the BASENAME + content — a digit-bearing provider slug ('yipit-2024/') must
  // never be read as the document's period
  const { hint, ageMonths } = extractPeriod(base, sniff)
  const mtimeAge = Math.max(0, Math.round((Date.now() - st.mtimeMs) / (1000 * 60 * 60 * 24 * 30.4)))
  const ext = path.extname(base).toLowerCase()
  let sheets: WorkbookSheet[] | undefined
  if (ext === '.xls' || ext === '.xlsx' || ext === '.xlsm') sheets = await readWorkbookSheets(full, st.size, st.mtimeMs)

  const parent = path.dirname(rel).split(path.sep).pop()
  let external: NonNullable<ClassifiedFile['external']> = { provider: parent === 'external' ? undefined : parent }
  let hasSidecar = false
  try {
    const sc = JSON.parse(fs.readFileSync(full + SIDECAR_SUFFIX, 'utf8')) as Record<string, unknown>
    hasSidecar = true
    external = {
      provider: typeof sc.provider === 'string' ? sc.provider : external.provider,
      sourceType: typeof sc.source_type === 'string' ? sc.source_type : undefined,
      tier: typeof sc.tier === 'number' ? sc.tier : undefined,
      asOf: typeof sc.as_of === 'string' ? sc.as_of : undefined,
      license: typeof sc.license === 'string' ? sc.license : undefined,
    }
  } catch { /* no/unreadable sidecar — path-derived provenance is the honest floor */ }

  // age: the sidecar's data-coverage end wins, then the parsed period, then the copy mtime
  // (a routed copy's mtime is the ROUTING date — recency of arrival, not of the data)
  let asOfAge: number | null = null
  const m = /^(\d{4})-(\d{2})/.exec(external.asOf ?? '')
  if (m) asOfAge = Math.max(0, monthsSince(Number(m[1]), Number(m[2])))

  return {
    filename: rel.split(path.sep).join('/'),
    ext: ext.replace(/^\./, ''),
    sizeBytes: st.size,
    mtime: new Date(st.mtimeMs).toISOString(),
    type: 'external_data',
    periodHint: external.asOf ?? hint,
    ageMonths: asOfAge ?? ageMonths ?? mtimeAge,
    confidence: hasSidecar ? 'high' : 'low',
    basis: hasSidecar ? 'content' : 'filename',
    ...(sheets && sheets.length ? { sheets } : {}),
    external,
  }
}

// ---- per-module sufficiency ----
const recent = (age: number | null, months: number) => (age == null ? true : age <= months)

// Interpret a module's self-declared readiness rule against the files present. This is how a NEW
// module gets a tailored verdict with ZERO edits here — it ships the rule in its own 00-triage
// frontmatter. Required missing => Insufficient; all `sufficient` present => Sufficient; else Partial.
export function evalDecl(decl: DataReadinessDecl, has: (t: FileType) => boolean): ModuleReadiness {
  const required = decl.required ?? []
  const sufficient = decl.sufficient ?? []
  // `has` is typed (FileType) => boolean so the many existing FileType-only callers still bind; a broadened
  // ReadinessToken (e.g. `external:peer_transcript`) is passed through the same closure (readinessHas handles
  // the `external:` prefix), so the cast is safe.
  const missingRequired = required.filter((t) => !has(t as FileType))
  if (missingRequired.length) return { status: 'Insufficient', reasons: [`missing required data: ${missingRequired.join(', ')}`], caps: [] }
  const caps: string[] = []
  for (const [t, note] of Object.entries(decl.caps ?? {})) if (!has(t as FileType) && note) caps.push(note)
  const missing = sufficient.filter((t) => !has(t as FileType))
  if (!missing.length) return { status: 'Sufficient', reasons: [sufficient.length ? `expected inputs present: ${sufficient.join(', ')}` : 'inputs present'], caps }
  return { status: 'Partial', reasons: [`present, missing: ${missing.join(', ')}`], caps }
}

// Type-equivalence for a self-declared readiness `has`: a sell-side proxy fills the `transcript` slot,
// exactly as the coverage row groups them (COVERAGE_GROUPS transcript group → types transcript +
// sell_side_earnings_note). Generic — NO module name hardcoded (§26) — so a proxy+guidance pool reads the
// same in the upload panel and in every self-declared module's readiness dot (was inconsistent: the panel
// showed the slot filled while `has('transcript')` stayed false and reported a missing-transcript cap).
export function readinessHas(files: ClassifiedFile[], t: ReadinessToken): boolean {
  // `external:<sourceType>` matches an external/ document carrying that granular source_type (its top-level
  // type is the readiness-neutral 'external_data'; the kind lives in external.sourceType). This is how a
  // module whose evidence is external (competitive-intel's peer_transcript competitor calls) sees it — and,
  // crucially, why a subject-side 'transcript' does NOT satisfy it.
  if (t.startsWith('external:')) {
    const st = t.slice('external:'.length)
    return files.some((f) => f.type === 'external_data' && f.external?.sourceType === st)
  }
  if (files.some((f) => f.type === t)) return true
  if (t === 'transcript') return files.some((f) => f.type === 'sell_side_earnings_note')
  return false
}

export function evaluateModules(files: ClassifiedFile[], moduleNames: string[]): Record<string, ModuleReadiness> {
  const has = (t: FileType) => files.some((f) => f.type === t)
  const minAge = (types: FileType[]) => {
    const ages = files.filter((f) => types.includes(f.type)).map((f) => f.ageMonths).filter((a): a is number => a != null)
    return ages.length ? Math.min(...ages) : null
  }
  const hasAnnual = has('annual_filing')
  const hasQuarterly = has('quarterly_filing')
  const hasTranscript = has('transcript')
  const hasDeck = has('investor_deck')
  const hasPeriodic = hasQuarterly || hasTranscript || hasDeck
  const hasFinancials = has('financials') || hasAnnual
  const hasConsensus = has('consensus_estimates')
  const hasMultiples = has('multiples_export')
  const hasPeerComps = has('peer_comps')
  const hasOwnership = has('ownership_insider')
  const hasProxyComp = has('proxy_comp') || hasAnnual
  // A pool-verified CURRENT price is valuation's #1 gate (reverse-DCF + margin-of-safety). It is NOT a
  // consensus/multiples export, an analyst TARGET-price, or a stale quote. PRICE_RE matches a real quote
  // signal and excludes target/analyst/estimate names; the age check rejects a quote dated older than
  // ~1 month (the same freshness the price coverage group flags). (Was faked as `hasConsensus ||
  // hasMultiples`, which overstated valuation readiness on every pool with a vendor export.)
  // external files are excluded: this gate is filename-regex-based (not type-keyed), and a routed
  // alt-data file named like a price tracker must not fake valuation's pool-verified-price gate.
  const hasCurrentPrice = files.some(
    (f) => !f.external && (PRICE_RE.test(f.filename) || (f.sheets ?? []).some((s) => PRICE_RE.test(s.name))) && (f.ageMonths == null || f.ageMonths <= 1),
  )
  const hasDebtNote = hasAnnual || hasQuarterly
  const hasGovernance = hasAnnual || hasProxyComp || hasOwnership

  const annualAge = minAge(['annual_filing'])
  const periodicAge = minAge(['quarterly_filing', 'transcript', 'investor_deck'])

  const out: Record<string, ModuleReadiness> = {}

  // business-model
  {
    const annualOk = hasAnnual && recent(annualAge, 18)
    const periodicOk = hasPeriodic && recent(periodicAge, 9)
    let status: Sufficiency = 'Insufficient'
    const reasons: string[] = []
    if (annualOk && periodicOk) {
      status = 'Sufficient'
      reasons.push('annual filing + recent quarterly/transcript/deck present')
    } else if (annualOk || periodicOk) {
      status = 'Partial'
      reasons.push(annualOk ? 'annual filing present, no recent quarterly/transcript' : 'recent quarterly/transcript present, no annual filing')
    } else {
      reasons.push('no recent annual filing or quarterly/transcript')
    }
    out['business-model'] = { status, reasons, caps: [] }
  }

  // earnings
  {
    const core = hasFinancials && (hasPeriodic || hasAnnual)
    const nTranscript = files.filter((f) => f.type === 'transcript').length
    const nProxy = files.filter((f) => f.type === 'sell_side_earnings_note').length
    // Count DISTINCT RECENT call PERIODS, not files: a Q4 transcript + a Q4 proxy (same call), or two stale
    // calls, is not "two recent earnings calls" — counting files let that suppress the <2 cap and mark
    // earnings Sufficient on one call's worth of colour (§11). Recent = ≤6mo (matches the transcript coverage
    // staleAfterMonths) or undated; distinctness keys on the parsed period, falling back to a per-file key so
    // two undated/unparsed calls still count as two (no false cap).
    const recentCalls = files.filter(
      (f) => (f.type === 'transcript' || f.type === 'sell_side_earnings_note') && (f.ageMonths == null || f.ageMonths <= 6),
    )
    const distinctRecentCalls = new Set(recentCalls.map((f) => f.periodHint ?? `__file:${f.path ?? f.filename}`)).size
    const recentTranscripts = recentCalls.filter((f) => f.type === 'transcript').length
    const recentProxies = recentCalls.filter((f) => f.type === 'sell_side_earnings_note').length
    const caps: string[] = []
    // Earnings-call source is a STRONG-CAP, never a blocker: the engine wants the latest ~2 quarters of
    // call colour, and a sell-side proxy fills the commentary role only (verdict-stripped, MODULE_RULES).
    if (nTranscript === 0 && nProxy > 0) caps.push('earnings-call colour from a sell-side proxy only — verdict-stripped commentary; earnings clarity capped, tone/candor not assessable')
    else if (nTranscript === 0 && nProxy === 0) caps.push('no earnings call (transcript or proxy) — management commentary from filings only')
    // Even WITH a verbatim transcript in the pool, if the only RECENT call colour is a proxy (the transcript
    // is stale), the recent drivers/guidance are proxy-sourced — cap so a stale transcript + recent proxies
    // can't read Sufficient on proxy-only recent colour (§11 false-confidence path — Codex #195 r3551600904).
    else if (recentTranscripts === 0 && recentProxies > 0) caps.push('the only RECENT earnings-call colour is a sell-side proxy (any verbatim transcript is stale) — recent drivers/guidance verdict-stripped; earnings clarity capped')
    if (nTranscript + nProxy > 0 && distinctRecentCalls < 2) caps.push('fewer than 2 recent earnings calls in the pool — driver/candor detail limited')
    let status: Sufficiency = 'Insufficient'
    const reasons: string[] = []
    if (!hasFinancials) {
      reasons.push('no income statement / cash-flow base to analyze earnings')
    } else if (core && hasConsensus) {
      status = caps.length ? 'Partial' : 'Sufficient'
      reasons.push('financials + recent period + consensus estimates present')
    } else {
      status = 'Partial'
      reasons.push(core ? 'financials present' : 'financials present, period recency limited')
      if (!hasConsensus) caps.push('consensus read capped (agents 04/05/99)')
      if (!hasPeriodic) caps.push('quarterly trend capped (agents 01/02/03/06)')
    }
    out['earnings'] = { status, reasons, caps }
  }

  // valuation
  {
    const methods = [hasFinancials, hasPeerComps || hasMultiples, hasFinancials, hasFinancials && hasCurrentPrice].filter(Boolean).length
    const caps: string[] = []
    let status: Sufficiency = 'Insufficient'
    const reasons: string[] = []
    if (methods < 2 || !hasFinancials) {
      reasons.push('fewer than two valuation methods runnable')
    } else if (hasFinancials && hasCurrentPrice && (hasConsensus || hasPeerComps || hasMultiples)) {
      status = 'Sufficient'
      reasons.push('financials + current price + comps/consensus present (≥4 methods)')
    } else {
      status = 'Partial'
      reasons.push('valuation base present')
      if (!hasCurrentPrice) caps.push('margin of safety not assessable (no current price)')
      if (!hasPeerComps) caps.push('relative-valuation peers limited')
    }
    out['valuation'] = { status, reasons, caps }
  }

  // balance-sheet-survival
  {
    const caps: string[] = []
    let status: Sufficiency = 'Insufficient'
    const reasons: string[] = []
    if (!hasFinancials) {
      reasons.push('no balance sheet to establish leverage')
    } else if (hasFinancials && hasDebtNote) {
      status = 'Sufficient'
      reasons.push('balance sheet + debt note + cash flow present')
      caps.push('covenant/maturity detail limited unless a credit agreement is in the pool')
    } else {
      status = 'Partial'
      reasons.push('balance sheet present, debt detail limited')
      caps.push('maturity wall + covenant headroom not assessable')
    }
    out['balance-sheet-survival'] = { status, reasons, caps }
  }

  // management-governance
  {
    const caps: string[] = []
    let status: Sufficiency = 'Insufficient'
    const reasons: string[] = []
    if (!hasGovernance) {
      reasons.push('no governance / ownership / proxy disclosure')
    } else if (hasGovernance && hasOwnership && hasProxyComp) {
      status = 'Sufficient'
      reasons.push('proxy/comp + ownership + board/RPT disclosure present')
    } else {
      status = 'Partial'
      reasons.push('partial governance disclosure')
      if (!hasOwnership) caps.push('ownership/insider behavior limited')
      if (!has('proxy_comp')) caps.push('compensation detail limited (no standalone proxy)')
    }
    out['management-governance'] = { status, reasons, caps }
  }

  // self-declared modules: any module shipping a `data_readiness` rule in its 00-triage frontmatter
  // gets a tailored verdict here — no hand-written rule in this file. (Founding modules above keep
  // their bespoke rules; a new module needs only its own declaration, else it falls to generic.)
  const decls = moduleReadinessDecls()
  for (const name of moduleNames) {
    if (out[name]) continue
    const d = decls[name]
    if (d) out[name] = evalDecl(d, (t) => readinessHas(files, t))
  }

  // generic fallback — keeps readiness self-discovering for any other module the engine adds,
  // without a hand-written rule AND without a declaration. Evidence-based on recent filings.
  for (const name of moduleNames) {
    if (out[name]) continue
    const annualOk = hasAnnual && recent(annualAge, 18)
    const periodicOk = hasPeriodic && recent(periodicAge, 9)
    let status: Sufficiency = 'Insufficient'
    const reasons: string[] = []
    if (annualOk && periodicOk) {
      status = 'Sufficient'
      reasons.push('recent annual + quarterly/transcript present')
    } else if (annualOk || periodicOk || hasFinancials) {
      status = 'Partial'
      reasons.push('some filings present; module-specific rule not yet encoded')
    } else {
      reasons.push('no recent filings')
    }
    out[name] = { status, reasons, caps: [] }
  }

  return out
}

// ---- source-document coverage (the upload-aligned view) ----
// A human uploads SOURCE DOCUMENTS, not internal FileTypes. These groups model the actual upload set,
// derived from what each module's triage DECLARES it needs (audited from the orbs/MODULE_RULES). Each
// group carries a TIER (how much a gap costs) and a precise quantity/recency in `helps` (e.g. "3-5yr +
// 8 quarters", "latest only ≤18mo"), so the guide says exactly what to drop in — not a vague "filings".
//
// Presence is detected file-type / filename / tab-aware: a group is satisfied by a file of a matching
// type, OR a filename pattern (so a "Credit Health Panel" / "Events Calendar" lands in the right group
// even though classify() left it generic), OR a workbook TAB whose name matches (so a "Multiples" tab
// inside a 'financials' workbook still counts). Each present group names the file/tab that satisfies it
// and flags staleness. deriveCoverage([]) yields all-absent groups — the empty-state upload guide.
type CoverageTier = 'critical' | 'core' | 'recommended' | 'optional'
interface CoverageSpec {
  types?: FileType[] // file-level types that satisfy it
  name?: RegExp // a filename pattern that satisfies it (for docs classify() leaves generic)
  tab?: RegExp // a workbook tab name that satisfies it (tab-aware)
  prefer?: RegExp // among same-type matches, name the file whose filename matches this (else the freshest)
}
interface CoverageGroupDef extends CoverageSpec {
  key: string
  label: string
  tier: CoverageTier
  helps: string // precise: how much / how recent + the consequence if absent
  staleAfterMonths?: number // present-but-old threshold; omitted => never flagged stale
  covers?: ({ key: string; label: string } & CoverageSpec)[]
}

// A current-price signal — IBKR / tear-sheet / the Capital IQ "Public Company Profile" tearsheet / a quote
// / "<qualifier> price" / a trading summary — but NOT an analyst TARGET-PRICE, coverage, or estimate export
// (those carry a "price" word without being a live quote). Two guards keep it honest: (1) the exclusions
// match analyst-doc PHRASES ("target price" / "target-price" — space, underscore, OR hyphen separated), not
// bare substrings, so an issuer NAMED "Target" is not rejected while an analyst "Target-Price Quote" export
// still is; (2) only the "PUBLIC company profile" (the public-issuer tearsheet, which always leads with the
// dated Last / Previous Close / Delayed Quote line) counts — a bare "Company Profile" overview does not.
// Shared by the price coverage group AND the valuation hasCurrentPrice gate so the two never disagree.
const PRICE_RE = /^(?!.*(?:target[\s_-]?price|price[\s_-]?target|estimate|consensus|analyst|forecast|coverage|recommendation)).*(?:ibkr|tear[\s_]?sheet|public[\s_]?company[\s_]?profile|\bquote\b|(?:current|last|live|spot|market|closing)[\s_]?price|price[\s_]?(?:quote|snapshot)|trading[\s_]?summary)/i

const COVERAGE_GROUPS: CoverageGroupDef[] = [
  { key: 'price', label: 'Current price', tier: 'critical',
    helps: 'a dated quote, ≤ a few days old — reverse-DCF + margin-of-safety; without it valuation confidence caps at 55',
    name: PRICE_RE, tab: PRICE_RE, staleAfterMonths: 1 },
  { key: 'annual', label: 'Annual report', tier: 'core',
    helps: 'the latest audited annual only (≤18mo) — the spine every module reads; more annuals optional (history)',
    types: ['annual_filing'], staleAfterMonths: 18 },
  { key: 'interim', label: 'Interim / quarterly', tier: 'core',
    helps: 'the latest interim/quarterly (≤~6mo) — recent trend & earnings',
    types: ['quarterly_filing'], tab: /quarter|interim/i, staleAfterMonths: 6 },
  { key: 'transcript', label: 'Earnings transcript', tier: 'core',
    helps: 'the latest ~2 earnings calls — guidance, drivers & candor; a sell-side "Earnings Call Insight" works as a verdict-stripped proxy when no verbatim transcript exists',
    types: ['transcript', 'sell_side_earnings_note'], staleAfterMonths: 6 },
  { key: 'estimates', label: 'Consensus estimates', tier: 'core',
    helps: 'current consensus + revisions (90/60/30d) — the bar to beat; without it earnings consensus caps at 30',
    types: ['consensus_estimates'], tab: /consensus|estimate|revision|trend|surprise|analyst[\s_]?coverage/i },
  { key: 'governance', label: 'Ownership & governance', tier: 'core',
    helps: 'latest proxy/AGM + shareholding + insider trades (12mo) — pay, board, holdings',
    types: ['proxy_comp', 'ownership_insider'], name: /professional|holding|ownership|insider|proxy/i,
    tab: /ownership|insider|holding|board|director|remuneration/i,
    covers: [
      { key: 'board', label: 'board/pros', types: ['proxy_comp'], name: /professional|board|director/i },
      { key: 'holdings', label: 'shareholding', types: ['ownership_insider'], name: /holding|ownership|shareholding/i },
      { key: 'insider', label: 'insider', name: /insider/i },
    ] },
  { key: 'financials', label: 'Financials extract', tier: 'recommended',
    helps: '3–5yr annual + last 8 quarters (income · balance sheet · cash flow) — earnings & valuation base',
    types: ['financials'], prefer: /financ/i, tab: /income|balance|cash[\s_]?flow|p&l|profit[\s_]?&[\s_]?loss/i },
  { key: 'peers', label: 'Peer comps & multiples', tier: 'recommended',
    helps: 'current peer multiples + 3–5yr own-history bands — relative & own-history valuation',
    types: ['peer_comps', 'multiples_export'], tab: /peer|comparable|comps|multiple/i },
  { key: 'balance-credit', label: 'Balance-sheet & credit', tier: 'recommended',
    helps: 'debt note + maturity schedule (5yr) + covenants + latest rating — leverage & solvency',
    name: /credit[\s_]?health|credit[\s_]?rating|rating[\s_]?rationale|covenant|debenture|indenture|credit[\s_]?agreement|crisil|icra|moody|fitch/i,
    tab: /solvency|liquidity[\s_]?metric|credit[\s_]?health|covenant|maturit/i,
    covers: [
      { key: 'credit-health', label: 'credit health', name: /credit[\s_]?health/i, tab: /solvency|liquidity/i },
      // credit-AGENCY rating only — bare /rating/ matched broker buy/hold/sell exports (classify routes
      // those to consensus estimates), which would falsely hide a missing debt/covenant/agency doc.
      { key: 'rating', label: 'rating', name: /credit[\s_]?rating|rating[\s_]?rationale|crisil|icra|moody|fitch|care[\s_]?rating|s&p[\s_]?global/i },
      { key: 'debt-terms', label: 'debt terms', name: /covenant|debenture|indenture|credit[\s_]?agreement/i, tab: /maturit|covenant/i },
    ] },
  { key: 'catalyst', label: 'Catalyst calendar', tier: 'optional',
    helps: 'dated events over the next 12 months — results, AGM, dividend, maturities',
    name: /events?[\s_]?calendar|calendar/i, tab: /events?[\s_]?calendar|calendar/i },
  { key: 'deck', label: 'Investor deck', tier: 'optional',
    helps: 'clearer segment splits & KPI slides than the filings',
    types: ['investor_deck'] },
  { key: 'relationships', label: 'Suppliers & customers', tier: 'optional',
    helps: 'the Capital IQ Suppliers + Customers exports — the only source that NAMES who the company trades with; feeds the value-chain read, the related-party check, and the Ideas board’s chain lane',
    types: ['business_relationships'], tab: /^suppliers?$|^customers?$|relationship/i },
]

// Match a group against the pool: prefer a whole-file match (file-type, then filename), else a tab match.
function matchCoverage(allFiles: ClassifiedFile[], spec: CoverageSpec): { via: 'file' | 'tab' | null; file: ClassifiedFile | null; sheet: string | null } {
  // external files never satisfy a coverage slot: the name/tab regexes aren't type-keyed, and a
  // routed broker note with a "Consensus" tab must not read as the estimates upload being present
  // (coverage is the upload guide — external data is enrichment, not a substitute; EXTERNAL_DATA.md).
  const files = allFiles.filter((f) => !f.external)
  const { types = [], name, tab, prefer } = spec
  // 1. file-type match (strongest) — a filename-hinted file wins (so "Financials extract" names the
  //    Financials.xls, not a same-typed Credit Health Panel), then the freshest.
  let fileHit: ClassifiedFile | null = null
  for (const f of files) {
    if (!types.includes(f.type)) continue
    if (!fileHit) { fileHit = f; continue }
    const fp = prefer ? prefer.test(f.filename) : false
    const hp = prefer ? prefer.test(fileHit.filename) : false
    if (fp !== hp) { if (fp) fileHit = f; continue }
    if ((f.ageMonths ?? 9999) < (fileHit.ageMonths ?? 9999)) fileHit = f
  }
  if (fileHit) return { via: 'file', file: fileHit, sheet: null }
  // 2. filename match (for docs classify() leaves generic — credit health, events calendar, a price quote)
  if (name) {
    for (const f of files) if (name.test(f.filename)) return { via: 'file', file: f, sheet: null }
  }
  // 3. tab match (data lives inside a workbook tab)
  if (tab) {
    for (const f of files) for (const s of f.sheets ?? []) if (tab.test(s.name)) return { via: 'tab', file: f, sheet: s.name }
  }
  return { via: null, file: null, sheet: null }
}

// Build the upload-aligned coverage view from the classified pool (empty pool => the upload guide).
export function deriveCoverage(files: ClassifiedFile[]): CoverageGroup[] {
  return COVERAGE_GROUPS.map((g) => {
    const m = matchCoverage(files, g)
    const ageMonths = m.file?.ageMonths ?? null
    const stale = m.via != null && g.staleAfterMonths != null && ageMonths != null && ageMonths > g.staleAfterMonths
    const covers = g.covers?.map((c) => ({ key: c.key, label: c.label, present: matchCoverage(files, c).via != null }))
    return {
      key: g.key, label: g.label, tier: g.tier, helps: g.helps,
      present: m.via != null, via: m.via,
      filename: m.file?.filename ?? null, sheet: m.sheet, ageMonths, stale, covers,
    }
  })
}

export interface AnalyzeTickerOptions {
  /** Exact immutable subject directory already verified by the readiness coordinator. The normal cockpit
   * path omits this and continues to classify DATA_DIR/<ticker> exactly as before. */
  exactDataDir?: string
}

export async function analyzeTicker(
  ticker: string,
  onProgress?: (update: DataScanUpdate) => void,
  options: AnalyzeTickerOptions = {},
): Promise<DataStatus> {
  const progress = (update: DataScanUpdate): void => { try { onProgress?.(update) } catch { /* UI reporting is never allowed to stop classification */ } }
  progress({ stage: 'finding', completed: 0, total: 0, currentFile: null })
  // Containment: the /api/data-status route validates TICKER_RE, but that allows dots — a lone '..'
  // slips through path.join and escapes DATA_DIR. Resolve and confine to DATA_DIR; an escaping ticker
  // returns the empty (no-data) status. EARLY return so the guard dominates every read below (incl.
  // classifyFile), never just the readdir — that's what makes `dir` safe at every sink. (Clears CodeQL
  // js/path-injection.)
  let subject: string
  try { subject = safeSubjectSegment(ticker) } catch {
    const modules = Object.fromEntries(listModuleNames().map((m) => [m, { status: 'Insufficient' as Sufficiency, reasons: ['no data uploaded'], caps: [] }]))
    progress({ stage: 'checking', completed: 0, total: 0, currentFile: null })
    return { ticker, hasAnyData: false, fileCount: 0, files: [], recentByType: {}, modules, coverage: deriveCoverage([]), overallReady: false, dataDir: DATA_DIR, ts: Date.now() }
  }
  const dir = options.exactDataDir ? path.resolve(options.exactDataDir) : path.resolve(DATA_DIR, subject)
  // Reserved system folders (e.g. the news-archive mirror) are never companies — refuse to classify them
  // even if hit directly, alongside the path-containment guard ('..' slips through TICKER_RE's dots).
  if (isReservedDataFolder(subject)
      || (!options.exactDataDir && dir !== DATA_DIR && !dir.startsWith(DATA_DIR + path.sep))) {
    const modules = Object.fromEntries(listModuleNames().map((m) => [m, { status: 'Insufficient' as Sufficiency, reasons: ['no data uploaded'], caps: [] }]))
    progress({ stage: 'checking', completed: 0, total: 0, currentFile: null })
    return { ticker, hasAnyData: false, fileCount: 0, files: [], recentByType: {}, modules, coverage: deriveCoverage([]), overallReady: false, dataDir: DATA_DIR, ts: Date.now() }
  }
  if (options.exactDataDir) {
    let exactRoot: fs.Stats
    try { exactRoot = fs.lstatSync(dir) } catch {
      throw new Error('The frozen data snapshot is unavailable.')
    }
    if (exactRoot.isSymbolicLink() || !exactRoot.isDirectory()) {
      throw new Error('The frozen data snapshot is not a plain directory.')
    }
  }
  // Recursive: a filing dropped in a "Filings 4/" or "Transcript Digest/" subfolder is real pool data
  // (extract_pool.py walks the whole tree), so the panel, readiness dots, and coverage now reflect it —
  // the user never has to move files to the top level for the cockpit to count what the orbs already read.
  // An exact frozen directory is its own read authority. It was already lstat-verified above and every
  // descendant walk remains confined below it; the ordinary cockpit path keeps DATA_DIR as its authority.
  const readAuthority = options.exactDataDir ? dir : DATA_DIR
  const rels = listPoolFiles(dir, readAuthority)
  const externalRels = listExternalFiles(dir, readAuthority)
  const total = rels.length + externalRels.length
  // sequential on purpose: one extractor spawn at a time, the same load the sync version put on the
  // Drive mount — the win is that the loop now YIELDS between files, so SSE pings, /api/runs, and a
  // cancel POST keep flowing through a cold 44-file classify instead of freezing 20-30s per file.
  const files: ClassifiedFile[] = []
  let completed = 0
  progress({ stage: 'reading', completed, total, currentFile: null })
  for (const rel of rels) {
    const display = rel.split(path.sep).join('/')
    progress({ stage: 'reading', completed, total, currentFile: display })
    try {
      files.push(await classifyFile(dir, rel))
    } catch (cause) {
      throw new Error(`Could not read ${display}.`, { cause })
    }
    completed += 1
    progress({ stage: 'reading', completed, total, currentFile: completed < total ? null : display })
  }
  // externally ingested research (data/<T>/external/**) — listed with provenance, readiness-neutral
  for (const rel of externalRels) {
    const display = rel.split(path.sep).join('/')
    progress({ stage: 'reading', completed, total, currentFile: display })
    try {
      files.push(await classifyExternalFile(dir, rel, readAuthority))
    } catch (cause) {
      throw new Error(`Could not read ${display}.`, { cause })
    }
    completed += 1
    progress({ stage: 'reading', completed, total, currentFile: completed < total ? null : display })
  }
  // sort by the full pool location so subfolder files group under their folder (a top-level file has no
  // `path`, so it sorts by its basename exactly as before)
  files.sort((a, b) => (a.path ?? a.filename).localeCompare(b.path ?? b.filename))

  progress({ stage: 'checking', completed, total, currentFile: null })

  const recentByType: DataStatus['recentByType'] = {}
  for (const f of files) {
    const cur = recentByType[f.type]
    if (!cur || (f.ageMonths ?? 999) < (cur.ageMonths ?? 999)) {
      recentByType[f.type] = { filename: f.filename, ageMonths: f.ageMonths }
    }
  }

  const modules = files.length ? evaluateModules(files, listModuleNames()) : Object.fromEntries(listModuleNames().map((m) => [m, { status: 'Insufficient' as Sufficiency, reasons: ['no data uploaded'], caps: [] }]))
  const overallReady = Object.values(modules).some((m) => m.status === 'Sufficient')

  return {
    ticker,
    hasAnyData: files.length > 0,
    fileCount: files.length,
    files,
    recentByType,
    modules,
    coverage: deriveCoverage(files),
    overallReady,
    dataDir: dir,
    ts: Date.now(),
  }
}

// ---- tickers list ----
export function listTickers(): { tickers: TickerSummary[]; emptyState: boolean; dataDir: string; coverage: CoverageGroup[] } {
  let names: string[] = []
  try {
    names = fs.readdirSync(DATA_DIR).filter((n) => {
      try {
        // Only valid UPPERCASE tickers are companies. Hide non-ticker folder names (lowercase, spaces,
        // too long) AND reserved system folders (the news-archive mirror) — so the picker lists only real
        // companies. A genuinely mis-named company folder is no longer surfaced here (per product choice);
        // it must be renamed in Drive to a valid symbol to appear.
        if (n.startsWith('.') || isReservedDataFolder(n) || !isValidTicker(n)) return false
        return fs.statSync(path.join(DATA_DIR, n)).isDirectory()
      } catch {
        return false
      }
    })
  } catch {
    names = []
  }
  const tickers: TickerSummary[] = names.sort().map((ticker) => {
    let fileCount = 0
    try {
      // Count the whole recursive pool the orbs read (extract_pool.py walks the tree): a company whose
      // filings live only in subfolders now shows its true count, not 0. listPoolFiles already excludes
      // engine-written "Memos …" output folders (the `.nostradamus_output` sentinel) and sidecars, so the
      // count stays honest — PLUS the routed external documents under external/** (EXTERNAL_DATA.md).
      fileCount = listPoolFiles(path.join(DATA_DIR, ticker)).length
      fileCount += listExternalFiles(path.join(DATA_DIR, ticker)).length
    } catch {}
    const invalidReason = tickerInvalidReason(ticker)
    const { syncing, lastChangeAt } = syncingState(ticker)
    const runs = summarizeRuns(ticker)
    return {
      ticker,
      fileCount,
      hasAnyData: fileCount > 0,
      valid: invalidReason === null,
      invalidReason: invalidReason ?? undefined,
      suggestedTicker: invalidReason ? suggestTicker(ticker) : undefined,
      syncing,
      lastChangeAt,
      latestRun: runs.latestRun,
      runCount: runs.runCount,
      hasNewerPartial: runs.hasNewerPartial,
      hasStandingDecision: runs.hasStandingDecision,
    }
  })
  // resolve the data/ symlink so the UI shows the real Google Drive location it reads from
  let dataDir = DATA_DIR
  try {
    dataDir = fs.realpathSync(DATA_DIR)
  } catch {}
  // coverage = the default upload guide (all unmet), so the cockpit can show "upload these first"
  // even with ZERO ticker folders — the most important onboarding moment, where there is no ticker
  // (and so no per-ticker dataStatus) to derive it from.
  return { tickers, emptyState: tickers.length === 0, dataDir, coverage: deriveCoverage([]) }
}

// Summarize a ticker's analyses/ runs for the picker in ONE directory scan:
//  - latestRun: the run to SURFACE. Prefer the newest run that HAS a decision_record.json (a finished
//    dossier); fall back to an incomplete folder only if no finished run exists. Without this, a newer
//    partial run — e.g. a single-module rerun that writes a fresh dated folder with no decision record —
//    would shadow and hide the previous complete dossier (folders sort newest-first).
//  - runCount: how many run folders exist (drives the "N runs" affordance + the run-history expander).
//  - hasNewerPartial: a decision-less run is NEWER than the standing one — the verdict shown is from an
//    older complete run, so the cockpit flags that a partial re-run has landed since.
// analysesDir is injectable for tests.
export function summarizeRuns(
  ticker: string,
  analysesDir: string = ANALYSES_DIR,
): { latestRun: TickerSummary['latestRun']; runCount: number; hasNewerPartial: boolean; hasStandingDecision: boolean } {
  let dirs: string[] = []
  try {
    dirs = fs.readdirSync(analysesDir).filter((n) => n.startsWith(ticker + '_')).sort().reverse()
  } catch {
    return { latestRun: null, runCount: 0, hasNewerPartial: false, hasStandingDecision: false }
  }
  if (!dirs.length) return { latestRun: null, runCount: 0, hasNewerPartial: false, hasStandingDecision: false }
  let standing: TickerSummary['latestRun'] = null
  let standingDir: string | null = null
  let fallback: TickerSummary['latestRun'] = null
  for (const d of dirs) {
    const drPath = path.join(analysesDir, d, 'decision_record.json')
    if (fs.existsSync(drPath)) {
      try {
        const dr = JSON.parse(fs.readFileSync(drPath, 'utf8'))
        // Only a decision record that parses INTO AN OBJECT is a usable "this run decided" signal. A non-object
        // (array / primitive, e.g. a hand-edited or half-written file) is treated as incomplete and we keep
        // scanning — matching standingRunDir's guard in outputs.ts so the pill and the open path agree.
        if (dr && typeof dr === 'object' && !Array.isArray(dr)) {
          standing = {
            runRoot: `analyses/${d}`,
            decision: dr.decision ?? null,
            decisionDate: dr.decision_date ?? null,
            confidence: typeof dr.confidence_score === 'number' ? dr.confidence_score : null,
          }
          standingDir = d
          break
        }
      } catch { /* malformed record — treat as incomplete and keep scanning older runs */ }
    }
    // The NEWEST partial / in-progress run (no usable decision record). Used only if none are complete.
    if (!fallback) fallback = { runRoot: `analyses/${d}`, decision: null, decisionDate: null, confidence: null }
  }
  // A newer decision-less run shadows the standing one when the newest folder isn't the standing folder.
  // A caller that needs to know whether this ticker can actually be WRITTEN to (send-to-research, intake)
  // needs the standing/fallback distinction, which `latestRun` alone erases: a partial run and a decided run
  // whose verdict is null both surface as `decision: null`. This is free — the scan above already knows.
  return { latestRun: standing ?? fallback, runCount: dirs.length, hasNewerPartial: !!standingDir && dirs[0] !== standingDir, hasStandingDecision: !!standingDir }
}

// The latest run to surface for a ticker (the standing-run pick above). Kept as a named export for callers
// and tests that only need the surfaced run.
export function latestDecision(ticker: string, analysesDir: string = ANALYSES_DIR): TickerSummary['latestRun'] {
  return summarizeRuns(ticker, analysesDir).latestRun
}
