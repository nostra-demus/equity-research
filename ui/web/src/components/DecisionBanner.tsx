import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useStore } from '../lib/store'
import { decisionColor, priceProvenance, priceQualifier, resolveVerdict, stampDayUTC } from '../lib/format'
import type { QuoteAbsentReason, WhatChangedRead } from '../lib/types'

/**
 * Publish the dock's measured height so the constellation can reserve real pixels beneath itself.
 *
 * The dock is `position: absolute; bottom: 0` on the SAME stage as the swarm field, so anything the field
 * places near the floor is drawn behind it — which is exactly how the master-thesis core went missing. The
 * height cannot be assumed: this bar grows a "newer data" notice, and its metric strip wraps at narrow
 * widths, so the states differ by ~45px. Measuring is the only version that is right in all of them.
 *
 * Deliberately NOT a ResizeObserver. Everything that changes this dock's height is either a re-render of
 * this component (the notice appearing, the verdict loading, a tier arriving) or a viewport resize — both
 * of which are observable directly and synchronously. A layout effect with no dependency array runs after
 * EVERY render, so it catches the first class by construction; the resize listener catches the second.
 * That is strictly more reliable than an observer here, and — unlike one — it is verifiable in a headless
 * browser, where ResizeObserver notifications are not delivered at all.
 *
 * Reports 0 on unmount: a dock that is not there reserves nothing, which is the honest default and also
 * exactly the pre-existing layout.
 */
function useDockMeasure() {
  const setStageDockH = useStore((s) => s.setStageDockH)
  const ref = useRef<HTMLDivElement | null>(null)
  const measure = useCallback(() => {
    const el = ref.current
    // border box: the seat has to clear the bar's border and its upward shadow, not just its content
    setStageDockH(el ? el.getBoundingClientRect().height : 0)
  }, [setStageDockH])
  useLayoutEffect(measure) // no dep array on purpose — every render, because every height change is one
  useEffect(() => {
    window.addEventListener('resize', measure)
    return () => { window.removeEventListener('resize', measure); setStageDockH(0) }
  }, [measure, setStageDockH])
  return ref
}

// the three shareable tiers of a finished run, opened from below the Memo orb
const TIERS = [
  { key: 'memo' as const, label: 'Memo' },
  { key: 'thesis' as const, label: 'Thesis' },
  { key: 'dossier' as const, label: 'Full dossier' },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-07-13" → "13 Jul". */
function shortDate(iso?: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d || m < 1 || m > 12) return iso
  return `${d} ${MONTHS[m - 1]}`
}

/** An ISO instant → "22 Jul 2026, 14:12" in the reader's own timezone. Empty when unparseable. */
function stamp(iso?: string | null): string {
  if (!iso) return ''
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return ''
  const d = new Date(t)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`
}

/** A price with its currency, always 2dp so Entry and Price now line up digit-for-digit. */
function money(currency: string | null | undefined, v: number): string {
  return `${(currency || '').trim()} ${v.toFixed(2)}`.trim()
}

/** A signed percent, matching the bar's existing "+3.2%" / "-16.1%" shape. */
function pct(v: number): string {
  return `${v > 0 ? '+' : ''}${v}%`
}

/** A signed number with NO unit — for a gap between two percentages, which is measured in percentage
 *  points, not percent. Writing "-2.2% points" would name two different units for one quantity. */
function signed(v: number): string {
  return `${v > 0 ? '+' : ''}${v}`
}

// Why there is no live price, in plain English (CLAUDE.md §21). Absence is explained rather than left
// as a silent gap, so a reader never has to wonder whether the feature is broken or the data is simply
// not available for this listing (DESIGN.md §4: an empty state names what was looked for).
const ABSENT_COPY: Record<QuoteAbsentReason, string> = {
  no_currency: 'This run does not record which currency it was priced in, so a market price cannot be matched to it safely.',
  unknown_symbol: 'The market-data source does not carry this listing, so there is no price to show. The entry price above is unaffected.',
  currency_mismatch: 'The only match found trades in a different currency, so it is a different security. Showing it would be showing the wrong company.',
  name_mismatch: 'A price came back in the right currency but under a different company name, so it was refused rather than shown.',
  stale_feed: 'The newest price on offer is too old to call current, so it was refused rather than shown as if it were live.',
  implausible_price: 'The price that came back is wildly out of scale with the entry price — usually a different listing or different units — so it was refused.',
  feed_unavailable: 'The market-data source could not be reached just now. This is temporary; the price returns on the next refresh.',
}

/** The chip copy. Verdict-first — never a bare change count, which answers a question nobody asked. */
function chipCopy(wc: WhatChangedRead): { text: string; tone: string; title: string } | null {
  if (wc.state === 'first_version') {
    return { text: 'First version', tone: 'inert', title: wc.detail }
  }
  if (wc.state !== 'compared') return null // no_history -> render nothing at all
  const since = shortDate(wc.prev.date)
  const { diff } = wc
  switch (diff.verdict) {
    case 'identical':
      return { text: `Unchanged since ${since}`, tone: 'flat', title: diff.headline }
    case 'call_held':
      // the count comes from the server's one tailSummary — never re-derived here, or the chip and the
      // panel can quote different numbers for the same run
      return {
        text: `Call held since ${since} · ${diff.evidenceCount + diff.wordingCount} changes`,
        tone: 'moved',
        title: `${diff.headline} ${diff.subline} ${diff.tailSummary}`.trim(),
      }
    case 'anchors_moved': {
      const m = diff.anchors.find((a) => a.moved)
      return {
        text: m ? `${m.label} ${m.prev} → ${m.cur} since ${since}` : `Changed since ${since}`,
        tone: m?.tone === 'better' ? 'better' : m?.tone === 'worse' ? 'worse' : 'moved',
        title: diff.headline,
      }
    }
    case 'call_changed': {
      const call = diff.anchors.find((a) => a.moved && (a.prev !== null || a.cur !== null))
      return { text: `Was ${call?.prev ?? '—'}`, tone: 'call', title: diff.headline }
    }
  }
}

/** One labelled metric cell: a small uppercase caption over a prominent value, with an optional faint
 *  unit (e.g. "/100"). Full words only — the bar is a read-out, not a place for cryptic abbreviations. */
function Metric({ label, value, unit, valueColor, title }: {
  label: string
  value: string | number
  unit?: string
  valueColor?: string
  title?: string
}) {
  return (
    <div className="decision__metric" title={title}>
      <span className="decision__mlabel">{label}</span>
      <span className="decision__mval" style={valueColor ? { color: valueColor } : undefined}>
        {value}{unit && <span className="decision__munit">{unit}</span>}
      </span>
    </div>
  )
}

/** The glance layer: the whole answer in one line, or nothing. Opens the detail panel. */
function WhatChangedChip() {
  const wc = useStore((s) => s.whatChanged)
  const open = useStore((s) => s.openWhatChanged)
  // Deploy skew: the new bundle can be served by an engine 15-30s older, which 404s this route -> the
  // field is absent -> the chip stays hidden. Positive match only, never default-to-permissive.
  if (!wc) return null
  const copy = chipCopy(wc)
  if (!copy) return null
  // `first_version` has nothing to open — a control that looks pressable and isn't teaches the user the
  // panel is broken. Render it as a plain span instead.
  if (copy.tone === 'inert') {
    return <span className="wc__chip wc__chip--inert" title={copy.title}>{copy.text}</span>
  }
  return (
    <button
      type="button"
      className="wc__chip"
      data-tone={copy.tone}
      title={`${copy.title} — click for the full comparison`}
      onClick={(e) => { e.stopPropagation(); open() }}
    >
      {copy.text}<span aria-hidden>▸</span>
    </button>
  )
}

// The "a newer re-run exists" clarity strip. Plain English, one job: make it impossible to mistake the
// standing decision for one that already folded in the newer re-run's data. The engine deliberately keeps
// showing the last COMPLETE run so a half-finished re-run can't shadow the dossier (server: resolveRunRoot
// preferComplete) — a good safety, but silent, so the user can't tell whether the call on screen is current.
// This says it out loud, right on the decision, with one honest way forward. Sits as a full-width row inside
// the decision card (flex-basis:100% + order:-1), so it reads as a header above the call it qualifies.
function NewerRunStrip({ children, action }: {
  children: ReactNode
  action: { label: string; title: string; disabled?: boolean; onClick: () => void }
}) {
  return (
    // stop the click bubbling to the card's openThesis — the strip is its own affordance, not the thesis
    <div className="decision__notice" onClick={(e) => e.stopPropagation()}>
      <span className="decision__notice-glyph" aria-hidden>⟳</span>
      <p className="decision__notice-text">{children}</p>
      <button
        type="button"
        className="decision__notice-act"
        disabled={action.disabled}
        title={action.title}
        onClick={(e) => { e.stopPropagation(); action.onClick() }}
      >
        {action.label}<span aria-hidden> →</span>
      </button>
    </div>
  )
}

export function DecisionBanner() {
  const decision = useStore((s) => s.decision)
  const openThesis = useStore((s) => s.openThesis)
  const openReport = useStore((s) => s.openReport)
  const openValuationPlayground = useStore((s) => s.openValuationPlayground)
  const reports = useStore((s) => s.reports)
  const setToast = useStore((s) => s.setToast)
  const dataStatus = useStore((s) => s.dataStatus)
  const intake = useStore((s) => s.intake)
  const hasActiveRun = useStore((s) => s.anyRunForTicker(s.selectedTicker))
  const isResearch = useStore((s) => s.constellationSwarm === 'research')
  const verdictField = useStore((s) => s.swarms.find((w) => w.id === s.constellationSwarm)?.verdictField)
  // Newer-partial awareness (research only — only research keeps dated run folders). These are read
  // unconditionally, before any early return, so the rules of hooks hold.
  const dockRef = useDockMeasure()
  const selectedTicker = useStore((s) => s.selectedTicker)
  const tickers = useStore((s) => s.tickers)
  const runRoot = useStore((s) => s.runRoot)
  const requestFull = useStore((s) => s.requestFull)
  const selectTicker = useStore((s) => s.selectTicker)
  const health = useStore((s) => s.health)
  const staticMode = useStore((s) => s.staticMode)
  const fullPending = useStore((s) => s.launchPending?.key === 'full:request')
  const liveQuote = useStore((s) => s.liveQuote)
  const refreshLiveQuote = useStore((s) => s.refreshLiveQuote)
  const reduce = useReducedMotion()

  // Keep the price honest without a timer. The store's own 60s TTL makes both of these free inside the
  // window, so this is "refresh when the reader actually comes back to look", not a poll: a background
  // tab must never show a price that quietly aged all afternoon, and a ticking interval on an
  // always-visible bar is exactly the kind of constant motion the design rules rule out.
  useEffect(() => {
    void refreshLiveQuote()
    const onVisible = () => { if (document.visibilityState === 'visible') void refreshLiveQuote() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [refreshLiveQuote])
  // research records carry `decision`; a swarm's record carries its SWARM.md verdict field
  const verdict = resolveVerdict(decision, verdictField)

  // Is a newer, decision-less re-run sitting on TOP of the run we're showing? `summary` is a stable
  // reference from the tickers array (a plain find, not a fresh object), so this never churns renders.
  const summary = isResearch && selectedTicker ? tickers.find((t) => t.ticker === selectedTicker) : undefined
  const hasNewerPartial = !!summary?.hasNewerPartial
  const standingRunRoot = summary?.latestRun?.runRoot ?? null
  // On a default open the manifest resolves to the standing run, so runRoot === standingRunRoot; opening
  // the partial from run history makes them differ.
  const viewingStanding = !runRoot || runRoot === standingRunRoot
  const engineDown = health === 'engine-offline' || health === 'your-network' || health === 'session-expired'

  if (dataStatus && !dataStatus.hasAnyData) return null
  if (hasActiveRun) return null

  // State B — the user opened the newer re-run itself (from run history). It has no call, so the banner
  // would otherwise be blank: the emptiest, most confusing state. Name what this run is + how to get back.
  if (!verdict) {
    if (!(hasNewerPartial && runRoot && runRoot !== standingRunRoot)) return null
    const standing = summary?.latestRun
    return (
      <div className="decision-dock" ref={dockRef}>
        <motion.div
          className="decision decision--notice-only"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <NewerRunStrip action={{ label: 'Back to the complete analysis', title: 'Show the last complete analysis and its decision', onClick: () => { if (selectedTicker) selectTicker(selectedTicker) } }}>
            <b>This re-run has no call yet.</b> It looked at newer data but stopped before a decision.
            {standing?.decision ? <> Your last complete call was <b style={{ color: decisionColor(standing.decision) }}>{standing.decision}</b>{standing.decisionDate ? ` (${shortDate(standing.decisionDate)})` : ''}.</> : null}
          </NewerRunStrip>
        </motion.div>
      </div>
    )
  }
  const er = decision.expected_return_pct as number | undefined
  // Two-number confidence (scripts/confidence.py): show understanding + conviction + sizing when
  // the synthesizer emitted them; fall back to the old single confidence_score otherwise.
  const d = decision as any
  const twoNumber = typeof d.conviction === 'number' && typeof d.analysis_confidence === 'number'
  const singleConf = decision.confidence_score ?? decision.confidence
  // the three memo/thesis/dossier tiers exist only for research runs — a swarm run has one final
  // dossier (the banner itself opens it), so an all-off tier row would just be noise
  const anyTier = TIERS.some(({ key }) => reports[key])
  // State A — the common case (the screenshot): we're showing the standing run, but a newer decision-less
  // re-run has landed since. The call below is real, just not yet re-scored against the newer data.
  const showNewerNotice = hasNewerPartial && viewingStanding
  const runFullDisabled = engineDown || staticMode || fullPending
  // the new-data read's conclusion (the scoped plan), read-only — drives the notice's "what next" line
  const intakeVerdict = intake?.verdict
  const intakeCmds = intakeVerdict === 'scoped_rerun' ? intake?.rerun_plan?.commands?.length ?? 0 : 0
  const decisionDate = (decision as any)?.decision_date as string | undefined
  // Positive match on BOTH the payload and the subject: a quote is only ever shown against the company
  // it was fetched for. Without the ticker check a slow response landing after a company switch could
  // paint one company's price onto another's call — the exact defect the server's currency gate exists
  // to prevent, reintroduced client-side.
  const quote = liveQuote && liveQuote.quote && liveQuote.ticker === selectedTicker ? liveQuote.quote : null
  const call = quote && liveQuote?.call ? liveQuote.call : null
  // Only explain an absence the server actually diagnosed for THIS company. A null reason means the
  // read hasn't landed yet (or an older engine has no such route) — nothing to say, so say nothing.
  const absentReason = liveQuote && liveQuote.ticker === selectedTicker && liveQuote.reason
    ? (liveQuote.reason as QuoteAbsentReason)
    : null
  return (
    // A static dock frames the animated card so its centring survives framer-motion (which rewrites the
    // card's own transform). The card is seated on the stage floor — a permanent bar, not a floating pill.
    <div className="decision-dock" ref={dockRef}>
      {/* The wrapper is deliberately NON-interactive (no role/tabIndex): it contains real child buttons
          (the tier buttons + the what-changed chip), and nesting interactive controls inside a role="button"
          produces an invalid, ambiguous a11y tree (DESIGN.md a11y). The whole-bar onClick stays as a mouse
          convenience; the KEYBOARD/AT open path is the labeled tier buttons below ("Open the Thesis" /
          "Open the Dossier"). Entrance stays ≤300ms and animates only opacity+transform (DESIGN.md §3). */}
      <motion.div
        className="decision"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={openThesis}
        title={isResearch ? 'Open the Thesis — the deep-dive synthesized view' : 'Open the Dossier — the final synthesized view'}
      >
        {showNewerNotice && (
          <NewerRunStrip action={{ label: 'Run a full analysis', title: 'Produce a fresh decision that folds in the newer data', disabled: runFullDisabled, onClick: requestFull }}>
            <b>Newer data isn’t in this call yet.</b> The <b style={{ color: decisionColor(verdict) }}>{verdict}</b> below is from your last complete analysis{decisionDate ? ` (${shortDate(decisionDate)})` : ''}. A re-run has looked at newer data since, but hasn’t produced an updated call.
            {/* Close the loop with the new-data read (the scoped plan): tell the reader what it concluded
                and the cheaper path when one exists, instead of leaving "so what do I do?" open. */}
            {intakeCmds > 0 && (
              <> The new-data read scoped it: <b>{intakeCmds} check{intakeCmds === 1 ? '' : 's'} affected</b> — the New data panel (left) has the cheaper scoped re-run.</>
            )}
            {intakeVerdict === 'note_only' && (
              <> The new-data read filed the newer evidence as note-only — below the materiality/tier bar to scope a re-run, not proof the inputs are unchanged — so a full run is optional but may still be worth it.</>
            )}
          </NewerRunStrip>
        )}
        <div className="decision__verdict">
          <span className="decision__eyebrow">Decision</span>
          <span className="decision__call" style={{ color: decisionColor(verdict) }}>{verdict}</span>
        </div>
        <div className="decision__divider" />
        <div className="decision__metrics">
          {twoNumber ? (
            <>
              <Metric label="Understanding" value={d.analysis_confidence} unit="/100" title="How well the company is understood — evidence quality only (data completeness, module agreement, source quality). NOT a buy signal." />
              <Metric label="Conviction" value={d.conviction} unit="/100" title="How much to bet on the call — direction-aware conviction. This is the actionable number that drives sizing (it is what the old single 'confidence' became)." />
              {d.sizing_hint?.action && <span className="decision__hint" title="Suggested sizing action">→ {d.sizing_hint.action}</span>}
            </>
          ) : (
            <Metric
              label="Confidence"
              value={typeof singleConf === 'number' ? singleConf : '—'}
              unit={typeof singleConf === 'number' ? '/100' : undefined}
              title="Overall confidence in the call — evidence quality and conviction combined."
            />
          )}
          {typeof er === 'number' && (
            <Metric
              label="Expected return"
              value={`${er > 0 ? '+' : ''}${er}%`}
              valueColor={er >= 0 ? 'var(--accent-bright)' : 'var(--bad)'}
              title={call
                ? `Measured from the ${money(call.currency, call.entry_price)} this call was priced at${call.entry_price_timestamp ? ` on ${shortDate(call.entry_price_timestamp)}` : ''}. The cell to the right measures the same target from today's price.`
                : 'The return the engine expects, measured from the entry price beside it.'}
            />
          )}
          {/* The re-based return sits immediately after the frozen one, because the ONLY difference
              between them is which price you start from. It never replaces the engine's call — that
              number is a finished judgment and stays exactly as the run wrote it. */}
          {call && (
            <Metric
              label="From today"
              value={pct(call.live_expected_return_pct)}
              /* A stale quote makes this re-based return a value computed from a price that is no longer
                 current — say so on screen, not only in the hover title (do not present it as current). */
              unit={quote?.stale ? ' · not current' : undefined}
              valueColor={call.live_expected_return_pct >= 0 ? 'var(--accent-bright)' : 'var(--bad)'}
              title={`The engine's target has not moved — only the starting price has. This call's target is ${money(call.currency, call.implied_target)}. From today's ${money(call.currency, call.live_price)} that is ${pct(call.live_expected_return_pct)}; from the ${money(call.currency, call.entry_price)} it was priced at, it was ${pct(call.expected_return_pct)} — a difference of ${signed(call.expected_return_delta_pp)} percentage points. This is arithmetic on the existing target, not a fresh valuation: the engine has not re-examined the company since ${shortDate(decisionDate) || 'the call'}.`}
            />
          )}
          {decision.entry_price && (
            <Metric
              label="Entry"
              value={`${decision.currency || ''} ${decision.entry_price}`.trim()}
              title={`The price the call was priced at${decision.entry_price_timestamp ? ` on ${shortDate(decision.entry_price_timestamp as string)}` : ''}${decision.entry_price_source ? ` (${decision.entry_price_source})` : ''}. Fixed — it is what the thesis was written against.`}
            />
          )}
          {/* Live price. Gated on a POSITIVE match (DESIGN.md §5): an engine older than this bundle
              404s /api/quote, so `quote` is absent and these cells simply do not render — the bar falls
              back to exactly what it showed before. Deliberately NOT animated: a value that refreshes on
              a market tick is the "seen constantly" class, where motion reads as noise (DESIGN.md §3). */}
          {quote && (
            <Metric
              label={quote.as_of_is_close ? 'Last close' : 'Price now'}
              value={money(quote.currency, quote.price)}
              /* The distance from entry rides in the faint qualifier slot (the one "/100" uses) rather
                 than taking a whole column of its own. They are one thought — where the price is, and
                 how far that is from what the call was priced at — and this is the right hierarchy
                 between them: the price is the fact, the gap is the context. */
              unit={priceQualifier(quote, call)}
              title={[
                `${quote.name || quote.ticker}${quote.exchange ? ` · ${quote.exchange}` : ''} (${quote.symbol}).`,
                quote.as_of
                  ? quote.as_of_is_close
                    ? `Last close, ${stampDayUTC(quote.as_of)}.`
                    : `As of ${stamp(quote.as_of)} your time.`
                  : '',
                call
                  ? `That is ${pct(call.move_since_call_pct)} against the ${money(call.currency, call.entry_price)} this call was priced at${call.entry_price_timestamp ? ` on ${shortDate(call.entry_price_timestamp)}` : ''} — how far the market has moved since, not a gain or loss unless you actually bought.`
                  : '',
                quote.delayed ? 'The exchange feed is delayed, so this is not a real-time tick.' : '',
                quote.stale ? 'The last refresh failed — this price is the last one that came through, not the current one.' : '',
                priceProvenance(quote.source),
              ].filter(Boolean).join(' ')}
            />
          )}
          {/* Honest absence: the run has an entry price but no quote cleared the identity checks. One
              quiet cell that explains itself beats a silent gap the reader has to interpret. */}
          {!quote && absentReason && decision.entry_price && (
            <Metric label="Price now" value="—" title={ABSENT_COPY[absentReason]} />
          )}
        </div>
        {isResearch && (
          <button
            type="button"
            className="tierbtn"
            title="Open the Valuation Playground — move the levers (WACC, multiples, forward EPS, current price) and watch bull/base/bear and the return recompute live, without re-running the swarm"
            onClick={(e) => { e.stopPropagation(); openValuationPlayground() }}
          >
            ⚖ Playground
          </button>
        )}
        {/* Sits with the call it describes. The banner's own gate — a decided run, not mid-run — is exactly
            when a version comparison can exist, which is why this lives here and not in the "New data" dock
            (whose gate empties the moment a re-run consumes the documents: the answer would vanish at the
            moment the user asks the question). */}
        {isResearch && <WhatChangedChip />}
        {anyTier && (
          <>
            <div className="decision__divider" />
            <div className="decision__tiers">
              {TIERS.map(({ key, label }) => {
                const on = reports[key]
                return (
                  <button
                    key={key}
                    type="button"
                    className={`tierbtn${on ? '' : ' tierbtn--off'}`}
                    title={on ? `Open the ${label}` : `${label} not generated for this run`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (on) openReport(key)
                      else setToast({ msg: `${label} not generated for this run`, tone: 'info' })
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
