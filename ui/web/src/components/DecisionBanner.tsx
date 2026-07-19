import { motion, useReducedMotion } from 'framer-motion'
import { useStore } from '../lib/store'
import { decisionColor, resolveVerdict } from '../lib/format'
import type { WhatChangedRead } from '../lib/types'

// the three shareable tiers of a finished run, opened from below the Memo orb
const TIERS = [
  { key: 'memo' as const, label: 'Memo' },
  { key: 'thesis' as const, label: 'Thesis' },
  { key: 'dossier' as const, label: 'Full dossier' },
]

/** "2026-07-13" → "13 Jul". */
function shortDate(iso?: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d || m < 1 || m > 12) return iso
  return `${d} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]}`
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

export function DecisionBanner() {
  const decision = useStore((s) => s.decision)
  const openThesis = useStore((s) => s.openThesis)
  const openReport = useStore((s) => s.openReport)
  const reports = useStore((s) => s.reports)
  const setToast = useStore((s) => s.setToast)
  const dataStatus = useStore((s) => s.dataStatus)
  const hasActiveRun = useStore((s) => s.anyRunForTicker(s.selectedTicker))
  const isResearch = useStore((s) => s.constellationSwarm === 'research')
  const verdictField = useStore((s) => s.swarms.find((w) => w.id === s.constellationSwarm)?.verdictField)
  const reduce = useReducedMotion()
  // research records carry `decision`; a swarm's record carries its SWARM.md verdict field
  const verdict = resolveVerdict(decision, verdictField)
  if (!verdict) return null
  if (dataStatus && !dataStatus.hasAnyData) return null
  if (hasActiveRun) return null
  const er = decision.expected_return_pct as number | undefined
  // Two-number confidence (scripts/confidence.py): show understanding + conviction + sizing when
  // the synthesizer emitted them; fall back to the old single confidence_score otherwise.
  const d = decision as any
  const twoNumber = typeof d.conviction === 'number' && typeof d.analysis_confidence === 'number'
  const singleConf = decision.confidence_score ?? decision.confidence
  // the three memo/thesis/dossier tiers exist only for research runs — a swarm run has one final
  // dossier (the banner itself opens it), so an all-off tier row would just be noise
  const anyTier = TIERS.some(({ key }) => reports[key])
  return (
    // A static dock frames the animated card so its centring survives framer-motion (which rewrites the
    // card's own transform). The card is seated on the stage floor — a permanent bar, not a floating pill.
    <div className="decision-dock">
      <motion.div
        className="decision"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.42, ease: [0.16, 1, 0.3, 1] }}
        onClick={openThesis}
        onKeyDown={(e) => {
          if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            openThesis()
          }
        }}
        tabIndex={0}
        role="button"
        title={isResearch ? 'Open the Thesis — the deep-dive synthesized view' : 'Open the Dossier — the final synthesized view'}
      >
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
            <Metric label="Expected return" value={`${er > 0 ? '+' : ''}${er}%`} valueColor={er >= 0 ? 'var(--accent-bright)' : 'var(--bad)'} />
          )}
          {decision.entry_price && (
            <Metric label="Entry" value={`${decision.currency || ''} ${decision.entry_price}`.trim()} />
          )}
        </div>
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
