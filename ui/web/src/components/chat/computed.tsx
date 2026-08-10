// The deterministic what-if card + the driver→target reprice block — SHARED between the desktop
// ChatPanel and the mobile chat shell. One component, one stylesheet (styles/computed-card.css), so the
// two surfaces cannot drift: a row added here appears on both. Props-only by design — no store imports.
import type { ChatComputed, RepricedValuation } from '../../lib/types'

// number helpers for the computed card — the figures are the ENGINE's; these only format, never recompute.
const nfmt = (n: number | null | undefined, d = 0) =>
  typeof n === 'number' ? n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—'
const nsigned = (n: number | null | undefined, d = 0, suffix = '') =>
  typeof n === 'number' ? `${n >= 0 ? '+' : ''}${nfmt(n, d)}${suffix}` : '—'
// humanize the base-metric key (e.g. adjusted_ebitda_nok_m -> "Adjusted EBITDA"): drop currency/scale
// tokens and uppercase the finance acronyms. Cosmetic only.
const METRIC_UNIT_TOKENS = new Set(['nok', 'usd', 'inr', 'eur', 'gbp', 'jpy', 'cny', 'm', 'mn', 'bn', 'cr', 'k'])
function metricLabel(k?: string | null): string {
  if (!k) return 'Base metric'
  const s = k.split('_').filter((p) => !METRIC_UNIT_TOKENS.has(p.toLowerCase())).join(' ')
  return s.replace(/\b(ebitda|ebit|eps|fcf|roic|roce|nav|ddm)\b/gi, (m) => m.toUpperCase()).replace(/^\w/, (c) => c.toUpperCase())
}
// the margin's honest name, from the base metric — an EBITDA base is an EBITDA margin, never "operating margin"
function marginName(metric?: string | null): string {
  const m = String(metric || '').toLowerCase()
  if (m.includes('ebitda')) return 'EBITDA margin'
  if (m.includes('ebit') || m.includes('operating')) return 'operating margin'
  if (m.includes('net') && m.includes('income')) return 'net margin'
  return 'margin'
}

// The deterministic what-if card. Its numbers come straight from the engine (scripts/sensitivity_math.py via
// the server) — this component only formats them. A computed scenario renders in one of three modes
// (forward move / from a target level / reverse solve-for), or an "unsupported" refusal that says WHY and
// lists what IS modelable.
export function ComputedCard({ c }: { c: ChatComputed }) {
  if (c.kind === 'unsupported') {
    const multi = c.reason === 'multi' || c.reason === 'ambiguous'
    const norev = c.reason === 'no_revenue_base'
    return (
      <div className="chatpanel__computed chatpanel__computed--refuse">
        <div className="chatpanel__computed-head">
          <span className="chatpanel__computed-glyph" aria-hidden>∑</span>
          <span className="chatpanel__computed-kicker">{multi ? 'One at a time' : 'Cannot model'}</span>
          <span className="chatpanel__computed-conf chatpanel__computed-conf--na">Not modeled</span>
        </div>
        <div className="chatpanel__computed-refuse">
          {multi
            ? <>The engine models <b>one variable at a time</b> — a joint move mixes effects that don’t simply add. Ask about each and I’ll compute both:</>
            : norev
              ? <>This run recorded no revenue base, so the engine can’t solve for a <b>margin</b> target. It can still model these directly:</>
              : <>That isn’t a recorded sensitivity for this company, so the engine won’t put a number on it. It can model:</>}
          {c.recorded.length > 0 && (
            <div className="chatpanel__computed-chips">
              {c.recorded.map((r) => <span key={r.variable} className="chatpanel__computed-chip">{r.label || r.variable}{r.unit ? ` (${r.unit})` : ''}</span>)}
            </div>
          )}
        </div>
      </div>
    )
  }
  const s = c.scenario
  const oor = s.withinDisclosedRange === false
  const reverse = s.mode === 'reverse'
  const level = s.mode === 'level'
  const confClass = reverse ? 'solve' : oor ? 'low' : s.confidence === 'high' ? 'high' : 'low'
  const confLabel = reverse ? 'Solve · linear' : oor ? 'Extrapolated' : s.confidence ? `Confidence · ${s.confidence}` : 'Computed'
  const kicker = reverse ? 'Computed · solved for the input' : level ? 'Computed · from a target level' : 'Computed · sensitivity engine'
  return (
    <div className={`chatpanel__computed${oor ? ' chatpanel__computed--oor' : ''}`}>
      <div className="chatpanel__computed-head">
        <span className="chatpanel__computed-glyph" aria-hidden>∑</span>
        <span className="chatpanel__computed-kicker" title="Computed by scripts/sensitivity_math.py from the orb’s recorded coefficient — the model never does the arithmetic.">{kicker}</span>
        <span className={`chatpanel__computed-conf chatpanel__computed-conf--${confClass}`}>{confLabel}</span>
      </div>
      {s.note && <div className="chatpanel__computed-note">{s.note}</div>}
      {s.basis === 'inferred' && <div className="chatpanel__computed-note">Inferred coefficient — not disclosed in filings.</div>}
      {/* the parse's interpretation, printed back — a misread is visible and correctable, never silent */}
      <div className="chatpanel__computed-echo">
        <span className="k">Read as</span>
        {level && s.targetLevel != null ? (
          <span>{s.label || s.variable} <b>at a level of {nfmt(s.targetLevel)}</b>{s.variableBase != null && <> — a <b>{nsigned(s.resolvedDelta)}</b> move from the recorded base {nfmt(s.variableBase)}</>}. <span className="fixit">Meant a move of {nsigned(s.targetLevel)}? Say “rises by {nfmt(s.targetLevel)}”.</span></span>
        ) : reverse ? (
          <span>solve for the {s.label || s.variable} level that reaches {s.targetMarginPct != null ? <b>a {nfmt(s.targetMarginPct, 0)}% margin</b> : 'the target'}.</span>
        ) : (
          <span>{s.label || s.variable} <b>moves {nsigned(s.delta)}{s.unit ? ` ${s.unit}` : ''}</b>.{Number.isInteger(s.delta) && Math.abs(s.delta) >= 100 ? <span className="fixit"> Meant a level of {nfmt(Math.abs(s.delta))}? Say “at {nfmt(Math.abs(s.delta))}”.</span> : null}</span>
        )}
      </div>

      {reverse ? (
        <>
          <div className="chatpanel__computed-solve">
            <span className="k">Answer</span>
            <span>{s.label || s.variable} <b>{s.solvedVariableLevel != null ? `≈ ${nfmt(s.solvedVariableLevel)}${s.unit ? ` ${s.unit}` : ''}` : `${nsigned(s.resolvedDelta)}`}</b>{s.solvedVariableLevel != null && <span className="sub"> ({nsigned(s.resolvedDelta)})</span>}</span>
          </div>
          <div className="chatpanel__computed-rows">
            <div className="chatpanel__computed-row">
              <span className="rl">Target — {s.targetMarginPct != null ? marginName(s.impactMetric) : metricLabel(s.impactMetric)}</span>
              <span className="rv"><b>{s.targetMarginPct != null ? `${nfmt(s.targetMarginPct, 2)}%` : nfmt(s.targetValue)}</b></span>
              <span className="rd">{s.targetMarginPct != null && s.baseMarginPct != null ? `from ${nfmt(s.baseMarginPct, 2)}%` : ''}</span>
            </div>
            <div className="chatpanel__computed-row">
              <span className="rl">Implies {metricLabel(s.impactMetric)}</span>
              <span className="rv">{nfmt(s.baseValue)}<span className="ar" aria-hidden>→</span><b>{nfmt(s.newValue)}</b></span>
              <span className="rd">{nsigned(s.impact)}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="chatpanel__computed-ask">
            {level
              ? <><span className="lab">{s.label || s.variable}</span><span className="val">{nfmt(s.variableBase)}<span className="ar" aria-hidden>→</span><b>{nfmt(s.targetLevel)}</b></span><span className="delta">{nsigned(s.resolvedDelta)}{s.unit ? ` ${s.unit}` : ''}</span></>
              : <><span className="lab">{s.label || s.variable}</span><span className="delta">{nsigned(s.delta)}{s.unit ? ` ${s.unit}` : ''}</span></>}
          </div>
          <div className="chatpanel__computed-rows">
            <div className="chatpanel__computed-row">
              <span className="rl">{metricLabel(s.impactMetric)}</span>
              <span className="rv">{nfmt(s.baseValue)}<span className="ar" aria-hidden>→</span><b>{nfmt(s.newValue)}</b></span>
              <span className="rd">{nsigned(s.impact)}</span>
            </div>
            {s.marginChangeBps != null && (
              <div className="chatpanel__computed-row">
                <span className="rl" title={s.marginBasis === 'revenue_constant' ? 'Revenue held constant — no revenue coefficient is recorded, so this is an implied margin, not a fully-modeled one.' : undefined}>{marginName(s.impactMetric)}{s.marginBasis === 'revenue_constant' && <small> · rev. unchanged</small>}</span>
                <span className="rv">{s.baseMarginPct != null ? `${nfmt(s.baseMarginPct, 2)}%` : '—'}<span className="ar" aria-hidden>→</span><b>{s.newMarginPct != null ? `${nfmt(s.newMarginPct, 2)}%` : '—'}</b></span>
                <span className="rd">{nsigned(s.marginChangeBps, 1, ' bps')}</span>
              </div>
            )}
          </div>
        </>
      )}

      {oor && s.rangeNote && <div className="chatpanel__computed-warn"><span aria-hidden>▲ </span>{s.rangeNote}</div>}
      {s.periodNote && <div className="chatpanel__computed-note">Asked about a period this scenario doesn’t forecast — a single-period scenario{s.periodBase ? ` on the ${s.periodBase} base` : ' on an unstated base period'}, not a multi-year forecast.</div>}
      <Provenance
        lead={reverse ? `need ${nsigned(s.neededImpact)} ÷ coefficient ${s.coefficient} = ${nsigned(s.resolvedDelta)}${s.unit ? ` ${s.unit}` : ''}` : `coefficient ${s.coefficient} per unit`}
        source={s.source}
      />
      {c.reprice && <RepriceBlock rv={c.reprice} />}
    </div>
  )
}

// per-share, so 2dp: a 107.70 fair value must not print as "108" (fmt()'s 0dp default is right for a
// 28,889 EBITDA, wrong here).
const psfmt = (n: number | null | undefined) => nfmt(n, 2)

// The driver -> TARGET section: the deterministic reprice (scripts/valuation_math.py's reprice_from_metric)
// rendered as its own card region, so the target/return numbers are visible WITHOUT the model having to
// restate them in prose — and survive a narration that gets aborted, since the store intentionally
// preserves the computed card independent of the streamed text (Codex #371 P2).
export function RepriceBlock({ rv }: { rv: RepricedValuation }) {
  if (!rv.ok) {
    return (
      <div className="chatpanel__computed-reprice chatpanel__computed-reprice--refuse">
        <div className="chatpanel__computed-kicker">Target / upside — not derivable</div>
        <div className="chatpanel__computed-refuse">{rv.detail || 'the target could not be re-derived from this driver.'}</div>
      </div>
    )
  }
  const short = rv.direction === 'short'
  return (
    <div className="chatpanel__computed-reprice">
      <div className="chatpanel__computed-kicker" title="Computed by scripts/valuation_math.py's reprice_from_metric — each case re-priced through its OWN recorded multiple and bridge, never estimated.">
        Target / upside{short ? ' · short (position-signed)' : ''}
      </div>
      <div className="chatpanel__computed-rows">
        {(rv.cases ?? []).map((cs) => (
          <div className="chatpanel__computed-row" key={cs.label}>
            <span className="rl">{cs.label}{cs.multiple_basis ? <small> · {cs.multiple_basis}</small> : null}</span>
            {cs.responds ? (
              <>
                <span className="rv">{psfmt(cs.level_before)}<span className="ar" aria-hidden>→</span><b>{psfmt(cs.level_after)}</b></span>
                <span className="rd">{cs.return_before != null && cs.return_after != null ? `${nsigned(cs.return_before, 1, '%')} → ${nsigned(cs.return_after, 1, '%')}` : (cs.multiple != null ? `${cs.multiple}×` : '')}</span>
              </>
            ) : (
              <>
                <span className="rv">HELD at {psfmt(cs.level_before)}</span>
                <span className="rd" title={cs.why || undefined}>{cs.why}</span>
              </>
            )}
          </div>
        ))}
        {rv.prob_weighted_target_before != null && (
          <div className="chatpanel__computed-row">
            <span className="rl">Probability-weighted target</span>
            <span className="rv">{psfmt(rv.prob_weighted_target_before)}<span className="ar" aria-hidden>→</span><b>{psfmt(rv.prob_weighted_target_after)}</b></span>
            <span className="rd" />
          </div>
        )}
        {rv.expected_return_pct_before != null && (
          <div className="chatpanel__computed-row">
            <span className="rl">Expected return</span>
            <span className="rv">{nsigned(rv.expected_return_pct_before, 1, '%')}<span className="ar" aria-hidden>→</span><b>{nsigned(rv.expected_return_pct_after, 1, '%')}</b></span>
            <span className="rd" />
          </div>
        )}
      </div>
      {rv.price != null && (
        <div className="chatpanel__computed-note">
          at {rv.price_as_of ? `its recorded entry price of ${psfmt(rv.price)} (as of ${rv.price_as_of})` : `a price of ${psfmt(rv.price)} (no recorded date)`}
        </div>
      )}
      {(rv.warnings ?? []).map((w, i) => <div className="chatpanel__computed-note" key={i}>{w}</div>)}
    </div>
  )
}

// The compressed §5 citation: the first source inline, the rest (a compound "a; b" citation) behind a
// click-to-expand — the DATA is unchanged, only the display folds. Non-compound short sources render as a
// plain line with no affordance.
export function Provenance({ lead, source }: { lead: string; source?: string | null }) {
  const parts = (source || '').split(';').map((t) => t.trim()).filter(Boolean)
  const first = parts[0] || null
  const short = first && first.length > 56 ? first.slice(0, 56) + '…' : first
  const more = Math.max(0, parts.length - 1)
  const expandable = more > 0 || (first != null && first.length > 56)
  if (!expandable) {
    return <div className="chatpanel__computed-prov">{lead}{short ? <> · <span className="src">{short}</span></> : null}</div>
  }
  return (
    <details className="chatpanel__computed-prov">
      <summary>{lead}{short ? <> · <span className="src">{short}</span></> : null}<span className="more">{more > 0 ? `+${more} source${more > 1 ? 's' : ''}` : 'full'} ⌄</span></summary>
      <div className="full">{source}</div>
    </details>
  )
}
