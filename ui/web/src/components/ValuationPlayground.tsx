// VALUATION PLAYGROUND — the "move the numbers yourself" panel. The engine's SYSTEM JUDGMENT (the frozen
// decision_record) sits beside a PLAYGROUND where every valuation input is a lever (price, discount rate,
// per-method values + weights, per-scenario metric × multiple), recomputed LIVE on the client
// (lib/valuationLevers.ts, a mirror of scripts/valuation_math.py) with NO agent re-run. Save records the
// override + your reason to an append-only ledger (raw material for the archetype-rule learning loop).
//
// UI/UX contract (why it is laid out this way):
//   1. THE ANSWER IS PINNED. The result bar is sticky, so the number you are moving a lever to change is
//      never scrolled off screen. A what-if panel whose answer scrolls away is not a what-if panel.
//   2. PLAIN WORDS LEAD, the term follows. CLAUDE.md §21: keep "margin of safety" / "WACC" / "SOTP" — they
//      carry real distinctions — but lead with what they MEAN and put the term in a muted gloss.
//   3. TWO TIERS. Price + the three cases are always open (that is ~all of the use). Everything heavier —
//      the method mix, goal seek, the discount-rate check — is a collapsed accordion row. Nothing is
//      removed; every lever, trace, and honesty flag from v2 is still reachable in one click.
//   4. RATES ARE TYPED AS PERCENTS. 4.54, not 0.0454. The draft still stores decimals.
//
// Right-slide panel, same motion signature as ScoringPanel / OutputReader (DESIGN.md §3). Tokens only.

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { api, isStatic } from '../lib/api'
import {
  draftFromResponse, recompute, deriveMethods, mosRead, scenarioCellState, chainLevel, chainEv, traceBlend, traceScenarioCell, traceOutput, goalSeekBlend, multipleOutranksChain,
  type PlaygroundDraft, type ValuationLeversResponse, type DraftScenario, type DraftChain,
  type DraftInternals, type GridReadout, type PeersReadout, type Trace, type GoalSeekParam, type GoalSeekResult,
} from '../lib/valuationLevers'
import './ValuationPlayground.css'

const parseNum = (s: string): number | null => {
  const t = s.trim()
  if (t === '' || t === '-' || t === '.') return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}
const fmtN = (n: number | null | undefined, d = 2): string => (typeof n === 'number' ? String(Math.round(n * 10 ** d) / 10 ** d) : '—')
const fmtPct = (n: number | null | undefined): string => (typeof n === 'number' ? `${n > 0 ? '+' : ''}${n}%` : '—')
// The machinery panel's heading. A run that records no multiple (pre-v1.3, or a judgment case) has no
// multiple to name, so it says what it IS instead of printing "Where —× comes from".
const whereFrom = (mult: number | null | undefined): string =>
  (typeof mult === 'number' ? `Where ${fmtN(mult, 2)}× comes from` : 'Where the value comes from')

const tone = (n: number | null | undefined): string => (typeof n !== 'number' ? 'var(--text-faint)' : n >= 0 ? 'var(--accent-bright)' : 'var(--bad)')

// Grid axes / discount-rate fields are decimals in the sidecar (0.075); every rate field types PERCENT
// (7.5). Exact for the recorded points (7.5/100 === 0.075 in doubles), so a typed grid point reads the
// verbatim cell, never a blend.
const toPct = (x: number | null | undefined): number | null => (typeof x === 'number' ? +(x * 100).toFixed(4) : null)
const fromPct = (x: number | null): number | null => (typeof x === 'number' ? x / 100 : null)

// Numeric inputs keep a LOCAL string state synced to the prop. Binding the raw <input value> to the parsed
// number swallows intermediate states ("0." parses to 0 and re-renders "0", so a decimal point can never be
// typed). We hold the exact keystrokes locally and emit the parsed number upward; when the prop changes for
// another reason we re-sync. `numToStr` avoids clobbering an in-progress "0." with the equal-valued "0".
const numToStr = (n: number | null): string => (n === null ? '' : String(n))

// Plain-English names for the value-producing methods (the football-field keys), each keeping its term so
// the analyst can still map a row to the orb that produced it. Covers the operating-co set plus the
// business-type-specific intrinsic methods (RI for financials, DDM, NAV for REITs). An unknown key falls
// through to a de-underscored key, so a future method still shows a readable row (§26 zero-touch).
const METHOD_LABELS: Record<string, string> = {
  own_history: 'What it used to trade at',
  peers: 'What rivals trade at',
  dcf: 'Its future cash (DCF)',
  sotp: 'Piece by piece (SOTP)',
  ri_model: 'Profit above cost of capital (RI)',
  ddm: 'Its dividends (DDM)',
  nav: 'What it owns (NAV)',
}
const methodLabel = (key: string): string => METHOD_LABELS[key] ?? key.replace(/_/g, ' ')

// bull / base / bear are the run's OWN labels (never renamed — they are data). A one-line gloss makes them
// legible to someone who has never read a broker note.
const caseGloss = (label: string): string => {
  const l = (label || '').toLowerCase()
  if (l.includes('bull')) return 'things go well'
  if (l.includes('bear')) return 'things go badly'
  if (l.includes('base')) return 'most likely'
  return ''
}

// The guard warnings are written for the audit trail — precise, and heavy going. Lead each one with a plain
// sentence and keep the exact text beneath it, so nothing is softened or lost (§5/§21). An unrecognized
// warning renders with no lead rather than a wrong one, so a NEW guard added later is still shown verbatim.
const plainWarning = (w: string): string | null => {
  const s = w.toLowerCase()
  if (s.includes('probabilities sum')) return "The odds don't add up to 100%."
  if (s.includes('no bear scenario')) return "There's no bad case, so the downside can't be measured."
  if (s.includes('is not below price')) return "The bad case isn't below today's price — so this thesis has no real downside branch."
  if (s.includes('cannot exceed k_e') || s.includes("must be below k_e")) return 'The discount rate is above the cost of equity. That is impossible — something was assembled wrong.'
  if (s.includes('below the band')) return 'The discount rate is below what the company pays to borrow — too low to be real.'
  if (s.includes('mega-cap ceiling')) return 'The cost of equity looks too high for a company this large and this stable — the beta behind it needs a source.'
  if (s.includes('bull must expand')) return 'The good case uses a smaller multiple than the middle case — a better outcome should be worth more, not less.'
  if (s.includes('bear must compress')) return 'The bad case uses a bigger multiple than the middle case.'
  if (s.includes('bull multiple equals base')) return "The good case uses the same multiple as the middle case — that isn't really a better case."
  if (s.includes('outside the') && s.includes('grid')) return 'The rate you typed is outside the range the research actually tested.'
  if (s.includes('outside the') && s.includes('implied-value')) return 'The multiple you typed is outside the range the research actually tested.'
  return null
}

function Field({ label, value, onChange, step = 'any', title, hint, disabled }: { label: string; value: number | null; onChange: (n: number | null) => void; step?: string; title?: string; hint?: string; disabled?: boolean }) {
  const [local, setLocal] = useState<string>(numToStr(value))
  useEffect(() => { if (parseNum(local) !== value) setLocal(numToStr(value)) }, [value]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <label className="vpg__field" title={title}>
      <span className="vpg__fieldlabel">{label}{hint && <span className="vpg__fieldhint"> {hint}</span>}</span>
      <input
        className="vpg__input mono"
        inputMode="decimal"
        step={step}
        value={local}
        disabled={disabled}
        onChange={(e) => { setLocal(e.target.value); onChange(parseNum(e.target.value)) }}
      />
    </label>
  )
}

function TableInput({ value, onChange, ariaLabel, className, title }: { value: number | null; onChange: (n: number | null) => void; ariaLabel?: string; className?: string; title?: string }) {
  const [local, setLocal] = useState<string>(numToStr(value))
  useEffect(() => { if (parseNum(local) !== value) setLocal(numToStr(value)) }, [value]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <input
      className={`vpg__scennum mono${className ? ` ${className}` : ''}`}
      inputMode="decimal"
      value={local}
      onChange={(e) => { setLocal(e.target.value); onChange(parseNum(e.target.value)) }}
      aria-label={ariaLabel}
      title={title}
    />
  )
}

// A collapsed accordion row. Everything heavier than "price + the three cases" lives behind one of these:
// closed by default, one click away, nothing removed. Content mounts at full height and fades/slides in —
// height is never animated (DESIGN.md §3).
function More({ open, onToggle, title, hint, children }: { open: boolean; onToggle: () => void; title: string; hint: string; children: React.ReactNode }) {
  return (
    <div className={`vpg__more${open ? ' vpg__more--open' : ''}`}>
      <button className="vpg__morebtn" onClick={onToggle} aria-expanded={open}>
        <span className="vpg__morechev" aria-hidden>▸</span>
        <span className="vpg__moretitle">{title}</span>
        <span className="vpg__morehint">{hint}</span>
      </button>
      {open && <div className="vpg__morebody">{children}</div>}
    </div>
  )
}

export function ValuationPlayground() {
  const close = useStore((s) => s.closeValuationPlayground)
  const ticker = useStore((s) => s.selectedTicker)
  const runRoot = useStore((s) => s.runRoot)
  const setToast = useStore((s) => s.setToast)
  const staticMode = isStatic()

  const [res, setRes] = useState<ValuationLeversResponse | null>(null)
  const [draft, setDraft] = useState<PlaygroundDraft | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let live = true
    if (!ticker) { setLoading(false); setError('Open a company first.'); return }
    setLoading(true)
    api.valuationLevers({ ticker, runRoot: runRoot ?? undefined })
      .then((r) => { if (live) { setRes(r); setDraft(draftFromResponse(r)); setLoading(false) } })
      .catch((e: any) => { if (live) { setError(e?.static ? 'The Playground runs on the live engine (read-only showcase).' : 'No valuation levers for this run yet — run the valuation module first.'); setLoading(false) } })
    return () => { live = false }
  }, [ticker, runRoot])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const out = useMemo(() => (draft ? recompute(draft) : null), [draft])
  const dec = res?.decision ?? null
  // A run whose scenarios carry NO forward-metric/multiple (a method-blend — every committed run) has no
  // single metric×multiple to edit, so show the editable fair-value column instead of dead, empty
  // metric/multiple inputs (Codex #326 P1). A hypothetical single-multiple run keeps the metric×multiple UI.
  const hasEditableMultiples = !!draft && draft.scenarios.some((s) => Number.isFinite(s.forwardMetric) || Number.isFinite(s.multiple))

  const setScen = (idx: number, patch: Partial<DraftScenario>) =>
    setDraft((d) => (d ? { ...d, scenarios: d.scenarios.map((s, i) => (i === idx ? { ...s, ...patch } : s)) } : d))
  const setTop = (patch: Partial<PlaygroundDraft>) => setDraft((d) => (d ? { ...d, ...patch } : d))
  // Typing a method's Value cell DIRECTLY detaches its sub-levers (the typed value wins) — mirrors how a
  // typed level override sits below metric×multiple. Editing a sub-lever re-activates the derivation.
  const setMethod = (idx: number, patch: Partial<{ value: number | null; weight: number | null }>) =>
    setDraft((d) => {
      if (!d) return d
      const key = d.methods[idx]?.key
      const internals = 'value' in patch && d.internals && key && (d.internals as Record<string, { active?: boolean } | null | undefined>)[key]
        ? { ...d.internals, [key]: { ...(d.internals as any)[key], active: false } }
        : d.internals
      return { ...d, internals, methods: d.methods.map((m, i) => (i === idx ? { ...m, ...patch } : m)) }
    })
  // v1.1 sub-levers: any sub-field edit activates the derivation for that method.
  const setDcfInternal = (patch: Partial<{ wacc: number | null; growth: number | null }>) =>
    setDraft((d) => (d?.internals?.dcf ? { ...d, internals: { ...d.internals, dcf: { ...d.internals.dcf, ...patch, active: true } } } : d))
  const setSotpMultiple = (idx: number, multiple: number | null) =>
    setDraft((d) => (d?.internals?.sotp ? { ...d, internals: { ...d.internals, sotp: { ...d.internals.sotp, active: true, segments: d.internals.sotp.segments.map((s, i) => (i === idx ? { ...s, multiple } : s)) } } } : d))
  const setPeersMultiple = (multiple: number | null) =>
    setDraft((d) => (d?.internals?.peers ? { ...d, internals: { ...d.internals, peers: { ...d.internals.peers, multiple, active: true } } } : d))
  const [openMethod, setOpenMethod] = useState<string | null>(null)
  // v2 Phase-1: one open trace strip at a time (Excel's "trace precedents" — click a computed cell)
  const [openTrace, setOpenTrace] = useState<string | null>(null)
  const toggleTrace = (id: string) => setOpenTrace((t) => (t === id ? null : id))
  // v1.3: a CASE's machinery panel is a different thing from a trace strip — you compare cases by holding
  // two open side by side (the bear's runoff against the base's blend), so these do NOT close each other.
  const [openCases, setOpenCases] = useState<Set<string>>(new Set())
  const toggleCase = (id: string) => setOpenCases((prev) => {
    const next = new Set(prev)
    if (!next.delete(id)) next.add(id)
    return next
  })
  // the accordion rows + the "show every number" expansion in the pinned result bar
  const [openMore, setOpenMore] = useState<string | null>(null)
  const toggleMore = (id: string) => setOpenMore((m) => (m === id ? null : id))
  const [showAllNumbers, setShowAllNumbers] = useState(false)
  // v2 Phase-1: goal seek — solve a recorded lever for a target blend. The target SEEDS from the price
  // once, then belongs to the input alone — a live `?? draft.price` fallback would snap the field back to
  // the price mid-edit whenever it parses null ('-', '.', cleared) (Gemini #338 r3644470643/48).
  const [gsParam, setGsParam] = useState<GoalSeekParam>('dcf_wacc')
  const [gsTarget, setGsTarget] = useState<number | null>(null)
  const [gsSeeded, setGsSeeded] = useState(false)
  const [gsResult, setGsResult] = useState<GoalSeekResult | null>(null)
  useEffect(() => {
    if (!gsSeeded && draft && typeof draft.price === 'number') { setGsTarget(draft.price); setGsSeeded(true) }
  }, [draft, gsSeeded])

  const reset = () => { if (res) { setDraft(draftFromResponse(res)); setOpenTrace(null); setGsResult(null) } }

  const save = async () => {
    if (!draft || !res || saving) return
    setSaving(true)
    try {
      await api.saveValuationOverride({
        runRoot: res.runRoot,
        reason: reason.trim(),
        overrides: draft as unknown as Record<string, unknown>,
        levels: out ? out.math.levels : {},
      })
      setToast({ msg: 'Saved — your override and reason are recorded.', tone: 'good' })
      setReason('')
    } catch (e: any) {
      setToast({ msg: e?.static ? 'Read-only showcase — saving runs on the live engine.' : 'Could not save the override.', tone: 'bad' })
    } finally {
      setSaving(false)
    }
  }

  // frozen system-judgment scenario levels, by label
  const sysLevel = (name: string): number | null => {
    const s = (dec?.scenarios ?? []).find((x) => (x.label || '').toLowerCase().includes(name))
    return s && typeof s.price_target === 'number' ? s.price_target : null
  }
  const pgLevel = (name: string): number | null => {
    const s = out?.scenarios.find((x) => (x.label || '').toLowerCase().includes(name))
    return s && typeof s.level === 'number' ? s.level : null
  }

  // Which case hosts the method mix. The §16 dispersion read comes from recompute (out.methodSpan), off the
  // same DERIVED method values the blend uses — a span off the raw typed values would contradict the blend
  // the moment a ▸ sub-lever drives a method (Codex #364 P2).
  const baseIdx = draft ? draft.scenarios.findIndex((s) => (s.label || '').toLowerCase().includes('base')) : -1

  // The METHOD MIX body — the base case's machinery. Rendered inside that case's ▸ (its natural home:
  // the blend IS what produces the base level and therefore its implied multiple), and in a standalone
  // accordion only when a run has no base-labelled scenario to host it. One definition, two call sites.
  const mixPanel = () => {
    if (!draft || !out) return null
    const pubBase = sysLevel('base')
    const bp = out.blend.basePoint
    const delta = typeof bp === 'number' && typeof pubBase === 'number' ? bp - pubBase : null
    return (
      <>
            <div className="vpg__mixtable">
              <div className="vpg__mixhead">
                <span>Valued by</span><span>Worth</span><span>Weight</span><span>Share used</span>
              </div>
              {draft.methods.map((m, i) => {
                const eff = out.blend.effectiveWeights[m.key]
                // v1.1 sub-levers: only a method whose run RECORDED internals gets a ▸ (nothing invented)
                const int = draft.internals as Record<string, { active?: boolean } | null | undefined> | undefined
                const hasInternals = !!(int && int[m.key])
                const active = !!(int && int[m.key]?.active)
                const derived: number | null =
                  m.key === 'dcf' ? out.methodInternals.dcf?.value ?? null
                  : m.key === 'sotp' ? out.methodInternals.sotp?.value ?? null
                  : m.key === 'peers' ? out.methodInternals.peers?.value ?? null : null
                const open = openMethod === m.key
                return (
                  <div key={m.key}>
                    <div className="vpg__mixrow">
                      <span className="vpg__mixlabel">
                        {hasInternals
                          ? <button className={`vpg__disc${open ? ' vpg__disc--open' : ''}`} onClick={() => setOpenMethod(open ? null : m.key)} title="Open the assumptions behind this one" aria-expanded={open}>▸</button>
                          : <span className="vpg__disc vpg__disc--none" aria-hidden />}
                        {methodLabel(m.key)}
                      </span>
                      {/* Editable even while DERIVED — typing IS the detach path (Codex #336 r3644218907:
                          a read-only span made setMethod unreachable, locking the analyst into the ▸
                          derivation). While active with nothing derivable, the cell blanks — matching the
                          blend, which drops the method rather than reusing a stale value. */}
                      <TableInput
                        value={active ? derived : m.value}
                        onChange={(n) => setMethod(i, { value: n })}
                        ariaLabel={`${m.key} value`}
                        className={active ? 'vpg__scennum--derived' : undefined}
                        title={active ? 'Worked out from the assumptions below — type here to ignore them and use your own number.' : undefined}
                      />
                      <TableInput value={m.weight} onChange={(n) => setMethod(i, { weight: n })} ariaLabel={`${m.key} weight`} />
                      <span className="vpg__mixeff mono">{typeof eff === 'number' ? `${Math.round(eff * 100)}%` : '—'}</span>
                    </div>
                    {open && m.key === 'dcf' && draft.internals?.dcf && (
                      <DcfPanel d={draft.internals.dcf} readout={out.methodInternals.dcf} onWacc={(n) => setDcfInternal({ wacc: n })} onGrowth={(n) => setDcfInternal({ growth: n })} />
                    )}
                    {open && m.key === 'sotp' && draft.internals?.sotp && (
                      <SotpPanel s={draft.internals.sotp} derived={out.methodInternals.sotp?.value ?? null} onMultiple={setSotpMultiple} />
                    )}
                    {open && m.key === 'peers' && draft.internals?.peers && (
                      <PeersPanel p={draft.internals.peers} readout={out.methodInternals.peers} onMultiple={setPeersMultiple} />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="vpg__mixsum">
              <div className="vpg__note">
                Blending those gives <button className="vpg__fxbtn mono" onClick={() => toggleTrace('blend')} aria-expanded={openTrace === 'blend'} title="Show the sum — weight × value, one line per method"><b>{fmtN(bp, 2)}</b></button>
                {typeof pubBase === 'number' && (
                  <> against the engine's <b className="mono">{fmtN(pubBase, 2)}</b>
                    {delta !== null && Math.abs(delta) >= 0.005 && (
                      <> (a gap of <span className="mono">{delta > 0 ? '+' : ''}{fmtN(delta, 2)}</span>). Weights are rescaled to add to 100% across the methods actually present, so "share used" can differ from what you type.</>
                    )}
                  </>
                )}
              </div>
              <label className="vpg__toggle" title="Use this blend as the most-likely value, so moving a weight flows through to your return.">
                <input type="checkbox" checked={draft.driveBaseFromMix} onChange={(e) => setTop({ driveBaseFromMix: e.target.checked })} />
                <span>Use this blend as the most-likely value</span>
              </label>
              <div className="vpg__note">
                {out.blendActive
                  ? <span className="vpg__note--warn">On — the answer at the top is using this blend, not the engine's frozen value.</span>
                  : draft.driveBaseFromMix
                    ? <span className="vpg__note--warn">Nothing to blend — no method has a weight, so the most-likely value stays the engine's. The answer at the top does NOT use the mix.</span>
                    : delta !== null && Math.abs(delta) >= 0.005
                      ? <>The answer at the top still uses the engine's value — tick the box to use this blend instead.</>
                      : <>Tick the box to use this blend as the most-likely value.</>}
              </div>
            </div>
            {openTrace === 'blend' && <TraceStrip t={traceBlend(deriveMethods(draft).methods, out.blend, methodLabel)} />}
      </>
    )
  }


  // t = a trace id: the Playground value becomes a clickable ƒ cell whose derivation opens as a strip below
  // invertTone: for a metric where HIGHER is worse (e.g. downside risk), flip which sign reads as bad/good.
  const CmpRow = ({ label, gloss, sys, pg, isPct = true, t, invertTone = false }: { label: string; gloss?: string; sys: number | null; pg: number | null; isPct?: boolean; t?: string; invertTone?: boolean }) => {
    const toneOf = invertTone ? (n: number | null | undefined) => (typeof n !== 'number' ? 'var(--text-faint)' : n <= 0 ? 'var(--accent-bright)' : 'var(--bad)') : tone
    return (
      <div className="vpg__cmprow">
        <span className="vpg__cmplabel">{label}{gloss && <span className="vpg__cmpgloss"> {gloss}</span>}</span>
        <span className="vpg__cmpsys mono" style={{ color: isPct ? toneOf(sys) : undefined }}>{isPct ? fmtPct(sys) : fmtN(sys)}</span>
        <span className="vpg__cmparrow" aria-hidden>→</span>
        {t ? (
          <button className="vpg__cmppg vpg__cmpbtn mono" style={{ color: isPct ? toneOf(pg) : undefined }} onClick={() => toggleTrace(t)} aria-expanded={openTrace === t} title="Show how this number is worked out">
            {isPct ? fmtPct(pg) : fmtN(pg)}
          </button>
        ) : (
          <span className="vpg__cmppg mono" style={{ color: isPct ? toneOf(pg) : undefined }}>{isPct ? fmtPct(pg) : fmtN(pg)}</span>
        )}
      </div>
    )
  }

  return (
    <motion.div className="vpg" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="vpg__head">
        <div style={{ minWidth: 0 }}>
          <div className="vpg__title">Valuation Playground {ticker && <span className="vpg__ticker">{ticker}</span>}</div>
          <div className="vpg__sub">Change the numbers and watch the answer move. Nothing re-runs — the maths happens here, instantly.</div>
        </div>
        <div className="vpg__headbtns">
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={reset} disabled={!res}>Start over</button>
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
        </div>
      </div>

      {loading ? (
        <div className="vpg__loading">
          <div className="vpg__skel vpg__skel--hero" />
          <div className="vpg__skel vpg__skel--chips" />
          <div className="vpg__skel vpg__skel--row" />
          <div className="vpg__skel vpg__skel--row" />
          <span className="vpg__loadingtext">Loading the numbers…</span>
        </div>
      ) : error || !draft || !out ? (
        <div className="vpg__empty">
          <div className="vpg__emptytitle">Nothing to play with yet</div>
          <div className="vpg__emptybody">{error ?? 'This run has no valuation numbers.'}</div>
        </div>
      ) : (() => {
        const pgExp = out.math.expectedReturnPct
        const sysExp = dec?.expected_return_pct ?? null
        const expDelta = typeof pgExp === 'number' && typeof sysExp === 'number' ? +(pgExp - sysExp).toFixed(1) : null
        const moved = expDelta !== null && Math.abs(expDelta) >= 0.05
        // downsideRiskPct is INVERTED (higher = worse). Flip it back to a plain return so the chip reads
        // like every other return on the panel; the full table below keeps the inverted row, labelled.
        const worstReturn = typeof out.math.downsideRiskPct === 'number' ? +(-out.math.downsideRiskPct).toFixed(1) : null
        // v1.3: when EVERY ev-basis case that derives a level supplies its OWN bridge, the top-level
        // Net debt / Shares fields shadow nothing — recompute always reads `s.bridge`, never the top-level
        // override, for those cases. Leaving the fields editable with no effect is a silent no-op (Codex
        // #362 P2); disable them and say why instead. A run where only SOME ev cases carry a bridge (the
        // guard rejects that shape as double-counting, §15) still uses the top-level fields for the rest,
        // so this only fires once every case that matters is shadowed.
        const evCasesWithLever = draft.scenarios.filter((s) => (s.basis ?? draft.basis) === 'ev' && Number.isFinite(s.forwardMetric as number) && Number.isFinite(s.multiple as number))
        const allEvBridged = evCasesWithLever.length > 0 && evCasesWithLever.every((s) => !!s.bridge)
        // Margin of safety is direction-uniform by doctrine, so its LABEL has to follow the sign or the
        // sentence is false: TSLA's MoS is −887.7%, and "Price below that by −887.7%" states the opposite
        // of the truth. mosRead() gives the magnitude to print and the label to print it under.
        const mosR = mosRead(out.math.marginOfSafetyPct, draft.direction ?? 'long')
        const mosTone = mosR.good === null ? 'var(--text-faint)' : mosR.good ? 'var(--accent-bright)' : 'var(--bad)'
        return (
        <div className="vpg__body">
          {/* ---- THE ANSWER — pinned, so it never scrolls away from the lever you are moving ---- */}
          <div className="vpg__result">
            <div className="vpg__hero">
              <div className="vpg__heroq">
                <span className="vpg__heroqline">If the odds are right, you'd make</span>
                <span className="vpg__heroqsub">expected return, against a price of <b className="mono">{fmtN(draft.price, 2)}</b>{res?.levers?.currency ? ` ${res.levers.currency}` : ''}</span>
              </div>
              <div className="vpg__heronum">
                <span className="vpg__herovalue mono" style={{ color: tone(pgExp) }}>{fmtPct(pgExp)}</span>
                <span className={`vpg__herodelta${moved ? ' vpg__herodelta--moved' : ''}`}>
                  {moved ? `${expDelta > 0 ? '+' : ''}${expDelta} pts vs the engine` : 'same as the engine'}
                </span>
              </div>
            </div>
            <div className="vpg__chips">
              <div className="vpg__chip">
                <span className="vpg__chiplabel">Worth, most likely</span>
                <span className="vpg__chipval mono">{fmtN(pgLevel('base'))}</span>
              </div>
              <div className="vpg__chip">
                <span className="vpg__chiplabel">{mosR.label}</span>
                <span className="vpg__chipval mono" style={{ color: mosTone }}>{mosR.magnitude === null ? '—' : `${mosR.magnitude}%`}</span>
              </div>
              <div className="vpg__chip">
                <span className="vpg__chiplabel">Worst case</span>
                <span className="vpg__chipval mono" style={{ color: tone(worstReturn) }}>{fmtPct(worstReturn)}</span>
              </div>
            </div>
            <button className="vpg__allbtn" onClick={() => setShowAllNumbers((v) => !v)} aria-expanded={showAllNumbers}>
              <span className="vpg__morechev" aria-hidden>▸</span>
              {showAllNumbers ? 'Hide the full comparison' : 'Show every number, engine vs yours'}
            </button>
            {showAllNumbers && (
              <div className="vpg__compare">
                <div className="vpg__comparehead">
                  <span />
                  <span className="vpg__col vpg__col--sys">Engine</span>
                  <span />
                  <span className="vpg__col vpg__col--pg">Yours</span>
                </div>
                <CmpRow label="What you'd make" gloss="expected return" sys={sysExp} pg={pgExp} t="exp" />
                {/* This row shows BOTH the frozen Engine number and the editable Yours number side by side.
                    They can disagree in SIGN — the user can move price or fair value across the boundary —
                    so a single "above"/"below" label picked from one side's sign would misstate the other
                    side's. mosR (below) still drives the single-value hero chip, where that risk doesn't
                    exist; here the row label stays direction-neutral and each column's own signed number
                    (+ its own tone colour, already computed independently per column) carries which side of
                    fair value THAT column's price sits on (Codex #366 P2). */}
                <CmpRow label="Price vs. fair value" gloss="margin of safety — a positive number means the price sits below fair value (a cushion); negative means it is trading above fair value" sys={dec?.margin_of_safety_pct ?? null} pg={out.math.marginOfSafetyPct} t="mos" invertTone={draft.direction === 'short'} />
                {/* downsideRiskPct is the worst POSITION return, inverted. For a long that worst case is a
                    price fall; for a short (e.g. TSLA's squeeze scenario) it is a price RISE — "how far it
                    could fall" tells a short holder the opposite of their real risk (Codex #366 P2). */}
                <CmpRow label={draft.direction === 'short' ? 'How far it could move against you' : 'How far it could fall'} gloss="downside risk — higher is worse" sys={dec?.downside_risk_pct ?? null} pg={out.math.downsideRiskPct} t="down" invertTone />
                <CmpRow label="Reward per unit of risk" gloss="risk / reward" sys={null} pg={out.math.riskReward} isPct={false} t="rr" />
                <CmpRow label="Worth if things go well" gloss="bull" sys={sysLevel('bull')} pg={pgLevel('bull')} isPct={false} />
                <CmpRow label="Worth, most likely" gloss="base" sys={sysLevel('base')} pg={pgLevel('base')} isPct={false} />
                <CmpRow label="Worth if things go badly" gloss="bear" sys={sysLevel('bear')} pg={pgLevel('bear')} isPct={false} />
                <CmpRow label="Average of the cases, weighted by odds" gloss="prob-weighted target" sys={null} pg={out.math.probWeightedTarget} isPct={false} t="pwt" />
                {(['exp', 'mos', 'down', 'rr', 'pwt'] as const).map((id) => {
                  if (openTrace !== id) return null
                  const metric = id === 'exp' ? 'expected' : id === 'down' ? 'downside' : id
                  const tr = traceOutput(metric, out.math, draft.direction ?? 'long')
                  return tr ? <TraceStrip key={id} t={tr} /> : null
                })}
              </div>
            )}
          </div>

          {/* ---- warnings from the guards: plain lead + the exact audit text beneath it ---- */}
          {out.warnings.length > 0 && (
            <div className="vpg__warns">
              {out.warnings.map((w, i) => {
                const lead = plainWarning(w)
                return (
                  <div key={i} className="vpg__warn">
                    <span className="vpg__warnicon" aria-hidden>⚠</span>
                    <span className="vpg__warntext">
                      {/* An unrecognized guard has no plain lead, so its exact text becomes the lead —
                          a new warning is never demoted to a footnote nobody reads. */}
                      {lead ? (<><b className="vpg__warnlead">{lead}</b><span className="vpg__warnraw">{w}</span></>) : <b className="vpg__warnlead">{w}</b>}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* ---- lever 1: the price ---- */}
          <div className="vpg__section">
            <div className="vpg__sectitle">Today's price</div>
            <div className="vpg__grid">
              <Field
                label="Price"
                hint={res?.levers?.price_as_of ? `as of ${res.levers.price_as_of}` : dec?.entry_price_timestamp ? `frozen ${dec.entry_price_timestamp}` : undefined}
                value={draft.price}
                onChange={(n) => setTop({ price: n })}
                title="Re-anchor every return to a fresh price — what the company is worth doesn't move, only your return does."
              />
              {draft.basis === 'ev' && (
                <Field
                  label="Shares" hint={allEvBridged ? 'set per case below' : 'fully diluted'}
                  value={draft.shares} onChange={(n) => setTop({ shares: n })} disabled={allEvBridged}
                  title={allEvBridged ? "Every case here supplies its own share count — this field has no effect on any of them. Open a case's ƒ to change its own." : undefined}
                />
              )}
              {draft.basis === 'ev' && (
                <Field
                  label="Net debt" hint={allEvBridged ? 'set per case below' : '+ debt / − cash'}
                  value={draft.netDebt} onChange={(n) => setTop({ netDebt: n })} disabled={allEvBridged}
                  title={allEvBridged ? "Every case here supplies its own debt figure — this field has no effect on any of them. Open a case's ƒ to change its own." : undefined}
                />
              )}
            </div>
            <div className="vpg__note">
              Change the price and only the returns move — what the company is worth stays put.
              {draft.basis === 'ev'
                ? ' Values are built from the whole company (EBITDA × a multiple), then debt is subtracted to get to the shares.'
                : ' Values are built per share (earnings × a multiple).'}
              {res?.levers?.currency ? ` Figures in ${res.levers.currency}.` : ''}
              {allEvBridged ? ' Each case below supplies its own debt and share count, so the fields above are shown for reference only.' : ''}
            </div>
          </div>

          {/* ---- lever 2: the three cases ---- */}
          <div className="vpg__section">
            <div className="vpg__sectitle">What it could be worth</div>
            <div className={`vpg__scentable${hasEditableMultiples ? ' vpg__scentable--mult' : ''}`}>
              <div className="vpg__scenhead">
                <span>Case</span>
                <span>Chance</span>
                {/* generic column names — a row can be a per-share metric OR a total (EBITDA, say); its own
                    caption underneath the input, not this header, names which (Codex #362 P2) */}
                {hasEditableMultiples ? (<><span>Metric</span><span>× multiple</span><span>Worth</span></>) : <span>Worth</span>}
                <span>Return</span>
              </div>
              {draft.scenarios.map((s, i) => {
                const row = out.scenarios[i]
                const ret = out.math.perScenario.find((x) => x.label === s.label)?.return_pct ?? null
                const isBase = (s.label || '').toLowerCase().includes('base')
                // An asserted (typed) multiple, OR a run-recorded `applied` multiple, outranks the chain
                // (levelSourceFor's precedence, Codex #364 P2) — once either drives, the chain must not
                // drive this cell's CLASSIFICATION either, or the trace strip below opens ChainStrip and
                // shows the chain's arithmetic as if it were the answer, while recompute actually used the
                // multiple (Codex #366 P2 — the two disagreed for an applied+chain case that was never
                // asserted, e.g. a fresh load of TSLA's cases before any edit).
                const cv = multipleOutranksChain(s) ? null : chainLevel(s.chain, draft.shares)
                const cs = scenarioCellState(s, isBase, draft.published?.blend.basePoint ?? null, out.blend.basePoint, out.blendActive, cv)
                const traceId = `scen:${i}`
                // per-ROW lever choice: metric×multiple inputs only where the row records them — a chain or
                // judgment row in the same run keeps its locked cell (spanning both columns) instead of dead
                // empty inputs (Codex #339 r3644833914)
                const rowHasMult = Number.isFinite(s.forwardMetric as number) || Number.isFinite(s.multiple as number)
                const span2 = hasEditableMultiples && !rowHasMult ? { gridColumn: 'span 2' } : undefined
                const gloss = caseGloss(s.label)
                // v1.3: a case's MACHINERY — everything recorded that explains its level, opened INSIDE the
                // case. A LIST, not a choice: TSLA's base carries an ev_bridge derivation AND four blended
                // methods, and picking one would have made the mix, its sub-levers and the drive-base toggle
                // unreachable while goal seek still pointed at them (Codex #364 P1).
                //   'trace' — this row's own arithmetic, shown only when the multiple is what computes the
                //             level. Without it NHY's bull states 28,889 × 8.21 beside 107.75 and never
                //             exposes the net debt 17,919 / minority 7,495 that turns one into the other.
                const machinery: ('trace' | 'chain' | 'mix')[] = []
                if (rowHasMult && (row?.levelSource === 'multiple' || row?.levelSource === 'asserted_multiple')) machinery.push('trace')
                if (s.chain) machinery.push('chain')
                if (isBase && draft.methods.length > 0) machinery.push('mix')
                const caseOpen = openCases.has(traceId)
                const discTitle = machinery.length > 1
                  ? `Open everything behind this case (${machinery.length} panels)`
                  : machinery[0] === 'mix' ? 'Open the method mix behind this case'
                  : machinery[0] === 'chain' ? 'Open the chain this case was worked out from'
                  : 'Open the arithmetic behind this case — the metric, the multiple and the debt bridge'
                // Unlocking must actually unlock: the override editor needs a value to edit, and the row has
                // to RENDER it ahead of the metric/multiple branch, or the button silently does nothing
                // (Codex #364 P2). Seeds from what is on screen now, so the cell opens at today's number.
                const unlock = () => setScen(i, { overrideUnlocked: true, levelOverride: row?.level ?? s.frozenLevel ?? null })
                return (
                  <div key={i}>
                    <div className="vpg__scenrow">
                      <span className="vpg__scenlabel">
                        <span className="vpg__scenname">
                          {machinery.length > 0
                            ? <button className={`vpg__disc${caseOpen ? ' vpg__disc--open' : ''}`} onClick={() => toggleCase(traceId)} aria-expanded={caseOpen} title={discTitle}>▸</button>
                            : <span className="vpg__disc vpg__disc--none" aria-hidden />}
                          {s.label}
                        </span>
                        {gloss && <span className="vpg__scengloss">{gloss}</span>}
                      </span>
                      <TableInput value={s.probability} onChange={(n) => setScen(i, { probability: n })} ariaLabel={`${s.label} chance`} title="How likely you think this case is, in %" />
                      {/* An explicit unlock outranks every other render branch. Checked BEFORE rowHasMult:
                          a metric×multiple row used to keep its inputs after unlocking, so no override
                          editor ever appeared and the unlock did nothing (Codex #364 P2). */}
                      {cs.kind === 'overridden' ? (
                        <span className="vpg__cellov" style={hasEditableMultiples ? { gridColumn: 'span 2' } : undefined}>
                          <TableInput value={s.levelOverride} onChange={(n) => setScen(i, { levelOverride: n })} ariaLabel={`${s.label} value override`} />
                          <button className="vpg__relock" title={`Put back the engine's ${fmtN(s.frozenLevel ?? null, 2)}`} onClick={() => setScen(i, { overrideUnlocked: false, levelOverride: rowHasMult ? null : (s.frozenLevel ?? s.levelOverride) })}>↺</button>
                        </span>
                      ) : rowHasMult ? (
                        <>
                          <span className="vpg__scencell">
                            <TableInput value={s.forwardMetric} onChange={(n) => setScen(i, { forwardMetric: n })} ariaLabel={`${s.label} per-share figure`} />
                            {s.metricBasis && <span className="vpg__basisname" title={s.source ?? undefined}>{s.metricBasis}</span>}
                          </span>
                          <span className="vpg__scencell">
                            <span className="vpg__multwrap">
                              {/* Two-way binding. Until you type, the multiple is DERIVED from whatever produced
                                  the level (a blend, a runoff chain) and moves when you move that machinery —
                                  that is what `implied` means. Typing one is an explicit reverse assertion: it
                                  starts driving the level instead, and ↺ hands it back. */}
                              <TableInput
                                value={row?.multipleIsDerived ? row.shownMultiple : s.multiple}
                                onChange={(n) => setScen(i, { multiple: n, multipleAsserted: true })}
                                ariaLabel={`${s.label} multiple`}
                                className={row?.multipleIsDerived ? 'vpg__scennum--derived' : undefined}
                                title={row?.multipleIsDerived
                                  ? `Worked out from this case's own value — ${s.multipleKind === 'applied' ? 'the run applied a multiple here' : 'the run derived the value first, so this multiple is what it corresponds to'}. Type here to set the multiple yourself and let it drive the value instead.`
                                  : s.multipleAsserted
                                    ? 'Your multiple — it is driving this value. ↺ puts the run\'s own back.'
                                    : `The run's own multiple, and it is what computes this value (metric × multiple${(s.basis ?? draft.basis) === 'ev' ? ', less the debt bridge' : ''}). Change either number and the value moves.`}
                              />
                              {s.multipleAsserted && (
                                <button className="vpg__relock" title={`Put back the run's ${fmtN(s.recordedMultiple ?? null, 2)}× and let the machinery drive again`} onClick={() => setScen(i, { multiple: s.recordedMultiple ?? null, multipleAsserted: false })}>↺</button>
                              )}
                            </span>
                            <span className="vpg__basisname">
                              {s.multipleBasis ?? (draft.basis === 'ev' ? 'EV multiple' : 'equity multiple')}
                              {(s.secondaryMultiples?.length ?? 0) > 0 && (
                                <b
                                  className="vpg__secmult"
                                  title={`Also quoted for this same value — cross-checks the run states, never used in the arithmetic:\n${s.secondaryMultiples!.map((x) => `${x.value}× ${x.basis}${x.note ? ` — ${x.note}` : ''}`).join('\n')}`}
                                >+{s.secondaryMultiples!.length}</b>
                              )}
                            </span>
                          </span>
                        </>
                      ) : (
                        <button
                          className={`vpg__cell ${cs.kind === 'judgment' ? 'vpg__cell--judg' : cs.kind === 'frozen_wedge' ? 'vpg__cell--wedge' : 'vpg__cell--fx'}`}
                          style={span2}
                          onClick={() => toggleTrace(traceId)}
                          aria-expanded={openTrace === traceId}
                          title={cs.kind === 'judgment' ? "The analyst's call — no worked-out chain behind it. Click to see the reasoning, and to unlock it if you want to type your own." : cs.kind === 'frozen_wedge' ? 'The method mix, plus a judgment adjustment the run states. Click to see it.' : 'Worked out from the numbers below. Click to see how.'}
                        >
                          <span className="vpg__cellicon" aria-hidden>{cs.kind === 'judgment' ? '⚑' : cs.kind === 'frozen_wedge' ? 'ƒ⚑' : 'ƒ'}</span>
                          {fmtN(row?.level, 2)}
                        </button>
                      )}
                      {hasEditableMultiples && (
                        // A tuple row (rowHasMult) had NO way to open its trace before — the arithmetic
                        // (incl. any per-case bridge) was reachable only through the non-mult button branch
                        // above (Codex #362 P2). Make the Worth figure itself the trace toggle for these rows.
                        rowHasMult ? (
                          <button className="vpg__scenlevel vpg__scenlevel--btn mono" onClick={() => toggleTrace(traceId)} aria-expanded={openTrace === traceId} title="Show how this is worked out">
                            {fmtN(row?.level, 2)}
                          </button>
                        ) : (
                          <span className="vpg__scenlevel mono">{fmtN(row?.level, 2)}</span>
                        )
                      )}
                      <span className="vpg__scenret mono" style={{ color: tone(ret) }}>{fmtPct(ret)}</span>
                    </div>
                    {openTrace === traceId && cs.kind !== 'overridden' && (
                      cs.kind === 'derived_chain' && s.chain ? (
                        <ChainStrip
                          s={s} chain={s.chain} level={cv} fallbackShares={draft.shares}
                          onEdit={(patch) => setScen(i, { chain: { ...s.chain!, ...patch }, chainEdited: true })}
                          onOverride={() => { unlock(); setOpenTrace(null) }}
                        />
                      ) : (
                        <TraceStrip
                          t={traceScenarioCell(s, cs, draft.published ?? null, methodLabel, { basis: draft.basis, shares: draft.shares, netDebt: draft.netDebt, netDebtBasis: draft.netDebtBasis })}
                          onOverride={cs.kind !== 'live_blend' && cs.kind !== 'derived_multiple' ? () => { unlock(); setOpenTrace(null) } : undefined}
                        />
                      )
                    )}
                    {/* the case's own machinery, opened INSIDE the case — where that multiple came from.
                        EVERY recorded panel renders, in the order the level is actually built: this row's
                        arithmetic, then the chain, then the mix. */}
                    {caseOpen && machinery.includes('trace') && (
                      <div className="vpg__casepanel">
                        <div className="vpg__casetitle">{whereFrom(row?.shownMultiple)} — this case's own arithmetic</div>
                        <TraceStrip t={traceScenarioCell(s, { kind: 'derived_multiple' }, draft.published ?? null, methodLabel, { basis: draft.basis, shares: draft.shares, netDebt: draft.netDebt, netDebtBasis: draft.netDebtBasis })} onOverride={unlock} />
                      </div>
                    )}
                    {caseOpen && machinery.includes('chain') && s.chain && (
                      <div className="vpg__casepanel">
                        <div className="vpg__casetitle">{whereFrom(row?.shownMultiple)} — {s.chain.model === 'margin_runoff_dcf' ? 'the impaired-cash-flow runoff' : 'the recorded chain'}</div>
                        <ChainStrip
                          s={s} chain={s.chain} level={cv} fallbackShares={draft.shares}
                          onEdit={(patch) => setScen(i, { chain: { ...s.chain!, ...patch }, multipleAsserted: false, chainEdited: true })}
                          onOverride={() => { unlock(); toggleCase(traceId) }}
                        />
                        {row?.levelSource === 'asserted_multiple' && (
                          <div className="vpg__note vpg__note--warn">
                            Your typed <b className="mono">{fmtN(s.multiple, 2)}×</b> is driving this case, so these figures are no longer what sets the value. Press ↺ on the multiple to hand it back to them.
                          </div>
                        )}
                        {/* Editing these figures is an explicit action, so it must outrank "use this blend as
                            the most-likely value" for THIS row — same rule as an unlock-override or a typed
                            multiple already get (Codex #366 P2). The checkbox above stays checked (it still
                            drives every OTHER row/opt-in); only this case's own edit takes it out of the mix. */}
                        {isBase && draft.driveBaseFromMix && s.chainEdited && row?.levelSource !== 'live_blend' && (
                          <div className="vpg__note vpg__note--warn">
                            Your edits above are driving this case now, not the method blend — even though "Use this blend as the most-likely value" is still on. It still drives every other opt-in; this case just took itself out.
                          </div>
                        )}
                      </div>
                    )}
                    {caseOpen && machinery.includes('mix') && (
                      <div className="vpg__casepanel">
                        <div className="vpg__casetitle">
                          {machinery.length > 1
                            ? `The method mix — ${draft.methods.length} way${draft.methods.length === 1 ? '' : 's'} of valuing it, blended`
                            : `${whereFrom(row?.shownMultiple)} — the weighted blend of ${draft.methods.length} method${draft.methods.length === 1 ? '' : 's'}`}
                        </div>
                        {mixPanel()}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {/* §16: cross-method disagreement is a FINDING, not noise — averaged silently it disappears */}
            {out.methodSpan && (
              <div className="vpg__dispersion">
                methods span <b className="mono">{fmtN(out.methodSpan.lo, 2)} – {fmtN(out.methodSpan.hi, 2)}</b>
                {out.methodSpan.rel !== null && <> · a <b className="mono">{fmtN(out.methodSpan.rel, 0)}%</b> spread</>} · the disagreement is a finding, not noise (§16)
              </div>
            )}
            <div className="vpg__note">
              Type the chances — they should add to 100. A value marked <b className="vpg__inlineicon">ƒ</b> was worked out from other numbers, <b className="vpg__inlineicon vpg__inlineicon--judg">⚑</b> is the analyst's own call; click either to see why, or to unlock it and type your own.
              {hasEditableMultiples && <> A multiple shown in <b className="vpg__inlineicon">colour</b> is worked out from the case's own value — open <b>▸</b> to move what produced it, or type over it to drive the value yourself.</>}
            </div>
          </div>

          {/* The method mix normally lives inside the base case's ▸ (it is that case's machinery). A run with
              no base-labelled scenario would have nowhere to put it, so it keeps its own accordion there. */}
          {draft.methods.length > 0 && baseIdx < 0 && (
              <More
                open={openMore === 'mix'}
                onToggle={() => toggleMore('mix')}
                title="How the most-likely value was worked out"
                hint={`${draft.methods.length} ways of valuing it, blended`}
              >
                {mixPanel()}
              </More>
          )}

          {/* ---- more: goal seek — Excel's Goal Seek over the recorded levers ---- */}
          {draft.methods.length > 0 && (draft.internals?.dcf || draft.internals?.peers) && (() => {
            const gsOptions: { v: GoalSeekParam; label: string }[] = [
              ...(draft.internals?.dcf ? [{ v: 'dcf_wacc' as const, label: 'the discount rate (WACC)' }, { v: 'dcf_growth' as const, label: 'long-run growth' }] : []),
              ...(draft.internals?.peers ? [{ v: 'peers_multiple' as const, label: "rivals' multiple" }] : []),
            ]
            const param = gsOptions.some((o) => o.v === gsParam) ? gsParam : gsOptions[0].v
            const isPctParam = (p: GoalSeekParam) => p !== 'peers_multiple'
            const fmtSol = (r: GoalSeekResult) => (r.solution === null ? '—' : isPctParam(r.param) ? `${fmtN(toPct(r.solution), 3)}%` : `${fmtN(r.solution, 3)}×`)
            const apply = (r: GoalSeekResult) => {
              if (r.solution === null) return
              if (r.param === 'dcf_wacc') setDcfInternal({ wacc: r.solution })
              else if (r.param === 'dcf_growth') setDcfInternal({ growth: r.solution })
              else setPeersMultiple(r.solution)
            }
            return (
              <More open={openMore === 'gs'} onToggle={() => toggleMore('gs')} title="What would it take?" hint="work backwards from a value you want">
                <div className="vpg__gsrow">
                  <span className="vpg__gslabel">To make it worth</span>
                  <TableInput value={gsTarget} onChange={(n) => { setGsTarget(n); setGsResult(null) }} ariaLabel="target value" />
                  <span className="vpg__gslabel">I'd have to change</span>
                  <select className="vpg__input vpg__gssel" value={param} onChange={(e) => { setGsParam(e.target.value as GoalSeekParam); setGsResult(null) }} aria-label="which number to solve for">
                    {gsOptions.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
                  </select>
                  <button className="btn btn--ghost" style={{ height: 26 }} onClick={() => setGsResult(goalSeekBlend(draft, param, gsTarget))}>Work it out</button>
                </div>
                {gsResult && (gsResult.solution !== null ? (
                  <div className="vpg__note vpg__gsanswer">→ <b className="mono">{fmtSol(gsResult)}</b> gets you to <b className="mono">{fmtN(gsResult.achieved, 2)}</b>{' '}
                    <button className="btn btn--ghost" style={{ height: 22, fontSize: 10.5 }} onClick={() => apply(gsResult)}>Use that number</button>
                  </div>
                ) : (
                  <div className="vpg__note vpg__note--warn">{gsResult.note}{gsResult.span ? ` (this lever can only reach ${fmtN(gsResult.span[0], 2)}–${fmtN(gsResult.span[1], 2)})` : ''}</div>
                ))}
                <div className="vpg__note">
                  It starts at today's price — "what would have to be true for the price to make sense?". It only answers inside the range the research actually tested; past that there is nothing solid to stand on. After you use a number, tick <b>Use this blend as the most-likely value</b> above to flow it into your return.
                </div>
              </More>
            )
          })()}

          {/* ---- more: the discount-rate check. These fields VALIDATE (the k_d <= WACC < k_e band); they
               never recompute a value — the WACC that MOVES a number is the DCF's own lever, one accordion
               up. Two WACC fields with different jobs is a guaranteed confusion (user feedback), so this
               one is demoted out of the main flow and says plainly what it is for. ---- */}
          {(draft.wacc !== null || draft.rf !== null || draft.beta !== null) && (
            <More open={openMore === 'wacc'} onToggle={() => toggleMore('wacc')} title="Check the discount rate" hint="a sanity check — moves nothing">
              <div className="vpg__note">
                These don't change any value. They only check that the rate the research used is believable. To make the discount rate actually move a value, open <b>How the most-likely value was worked out → Its future cash (DCF) ▸</b>.
              </div>
              <div className="vpg__grid">
                <Field label="Safe-bond rate" hint="risk-free, %" value={toPct(draft.rf)} onChange={(n) => setTop({ rf: fromPct(n) })} title="What a government bond pays — the return you get for taking no risk. Type 4.5 for 4.5%." />
                <Field label="Extra for stock risk" hint="ERP, %" value={toPct(draft.erp)} onChange={(n) => setTop({ erp: fromPct(n) })} title="The extra yearly return investors demand for holding shares instead of bonds." />
                <Field label="How jumpy the stock is" hint="beta" value={draft.beta} onChange={(n) => setTop({ beta: n })} title="1.0 moves with the market; above 1.0 swings harder." />
                <Field label="Discount rate" hint="WACC, %" value={toPct(draft.wacc)} onChange={(n) => setTop({ wacc: fromPct(n) })} title="What the money funding this company costs, blending debt and equity." />
                <Field label="Cost of borrowing" hint="after tax, %" value={toPct(draft.afterTaxKd)} onChange={(n) => setTop({ afterTaxKd: fromPct(n) })} title="The interest the company pays on debt, after the tax saving." />
              </div>
              {out.checks.wacc?.costOfEquity != null && (
                <div className="vpg__note">
                  Shareholders should be demanding about <b className="mono">{fmtN(toPct(out.checks.wacc.costOfEquity), 2)}%</b> a year (cost of equity = safe rate + beta × extra for stock risk).
                  A believable discount rate sits between the cost of borrowing and that. {out.checks.wacc.ok ? '✓ it does' : '⚠ it does not — see the warning above'}
                </div>
              )}
            </More>
          )}

          {/* ---- save override + reason ---- */}
          <div className="vpg__section vpg__savesec">
            <div className="vpg__sectitle">Save this as your view</div>
            <textarea className="vpg__reason" placeholder="Why do you see it differently? e.g. '10.4% is too steep a discount rate for a company this size — 9% is right; and if things go well the multiple should stretch to 28×.'" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
            <div className="vpg__savefoot">
              <span className="vpg__savenote">Kept in an append-only log so the engine can learn from where you disagreed. It does not change the run.</span>
              <button className="btn btn--amber" onClick={save} disabled={saving || staticMode}>{saving ? 'Saving…' : 'Save my view'}</button>
            </div>
            {(res?.overrides?.length ?? 0) > 0 && (
              <div className="vpg__history">{res!.overrides.length} view{res!.overrides.length === 1 ? '' : 's'} already saved on this run.</div>
            )}
          </div>
        </div>
        )
      })()}
    </motion.div>
  )
}

// ---- v2 Phase-1: the trace strip — Excel's "trace precedents", rendered in the ▸-panel idiom ----
// One strip open at a time; a judgment/frozen cell's strip carries the explicit unlock (the only path to
// typing over an outcome — captured by the save ledger with a reason).
function TraceStrip({ t, onOverride }: { t: Trace; onOverride?: () => void }) {
  return (
    <div className="vpg__tracestrip">
      <div className="vpg__tracetitle">{t.title}</div>
      <div className="vpg__traceformula mono">{t.formula}</div>
      {t.terms.map((term, i) => (
        <div key={i} className="vpg__traceterm"><span>{term.label}</span><span className="mono">{term.calc}</span></div>
      ))}
      {t.note && <div className="vpg__subnote">{t.note}</div>}
      {t.source && <div className="vpg__gridmeta">{t.source}</div>}
      {onOverride && (
        <button className="btn btn--ghost vpg__overridebtn" onClick={onOverride}>Unlock this and type my own…</button>
      )}
    </div>
  )
}

// ---- v1.2: the scenario chain strip — the recorded figures behind a fair value, as EDITABLE inputs ----
// This is the answer to "let me enter the figures that were used to calculate the fair value": the chain's
// EV / net debt / minority / shares are typed cells; the level is computed and never typed. stated drivers
// (e.g. "terminal margin 9.0%") render as display-only provenance — their mapping to EV was not recorded,
// and inventing it would be fake math (§20), so the honest lever is the recorded figure itself.
function ChainStrip({ s, chain, level, fallbackShares, onEdit, onOverride }: {
  s: DraftScenario
  chain: DraftChain
  level: number | null
  fallbackShares: number | null
  onEdit: (patch: Partial<DraftChain>) => void
  onOverride: () => void
}) {
  const isRunoff = chain.model === 'margin_runoff_dcf'
  const detached = isRunoff && typeof chain.evOverride === 'number'
  const ev = chainEv(chain)
  // Local text state (same pattern as Field/TableInput, see the comment by numToStr): binding the input
  // straight to `ev` swallowed intermediate keystrokes ("-", ".", a decimal in progress) because those parse
  // to null, evOverride resets, and the input snaps to the computed value mid-edit.
  const [evLocal, setEvLocal] = useState<string>(numToStr(ev))
  useEffect(() => { if (parseNum(evLocal) !== ev) setEvLocal(numToStr(ev)) }, [ev]) // eslint-disable-line react-hooks/exhaustive-deps
  // editing a runoff lever RE-ATTACHES the model (clears a typed-EV detach) — same rule as the ▸ panels
  const lever = (patch: Partial<DraftChain>) => onEdit({ ...patch, evOverride: null })
  return (
    <div className="vpg__tracestrip">
      <div className="vpg__tracetitle">{s.label} — worked out from the run's own figures{chain.source ? ` · ${chain.source}` : ''}</div>
      {isRunoff && (
        <>
          <div className="vpg__subfields" style={{ marginTop: 7 }}>
            <Field label={`${chain.metricLabel ?? 'Terminal margin'} %`} value={toPct(chain.margin)} onChange={(n) => lever({ margin: fromPct(n) })} title="How profitable the shrunken business stays — replays the run's own written chain" />
            <Field label="Shrink rate g %" value={toPct(chain.growth)} onChange={(n) => lever({ growth: fromPct(n) })} title="Growth for ever after (negative = the business shrinks each year); the discount rate minus this must stay positive" />
            <Field label="Depreciation" value={chain.da ?? null} onChange={(n) => lever({ da: n })} />
            <Field label="Capex" value={chain.capex ?? null} onChange={(n) => lever({ capex: n })} />
            <Field label="Tax %" value={toPct(chain.tax)} onChange={(n) => lever({ tax: fromPct(n) })} />
            <Field label="Working capital" value={chain.dnwc ?? null} onChange={(n) => lever({ dnwc: n })} title="Cash tied up in the runoff year (subtracts from free cash flow)" />
          </div>
          <div className="vpg__gridmeta">
            fixed by the run: revenue base {fmtN(chain.revenueBase, 0)} · WACC {fmtN(toPct(chain.wacc), 2)}% · PV factor {fmtN(chain.pvFactor, 5)} · near-years PV {fmtN(chain.pvExplicit, 0)}.
            The WACC is locked here — it also sits inside the PV factor and the near-years value, and the run did not record how those move with it. The honest WACC lever is <b>Its future cash (DCF) ▸</b> in the method mix.
          </div>
        </>
      )}
      <div className="vpg__subfields" style={{ marginTop: 7 }}>
        {isRunoff ? (
          <span className="vpg__cellov">
            <label className="vpg__field" title={detached ? 'Your own figure — the model above is switched off; edit a field above (or ↺) to switch it back on' : 'Worked out from the fields above — typing here switches the model off'}>
              <span className="vpg__fieldlabel">Whole company {detached ? '(yours)' : '(worked out ƒ)'}</span>
              <input className="vpg__input mono" inputMode="decimal" value={evLocal} onChange={(e) => { setEvLocal(e.target.value); onEdit({ evOverride: parseNum(e.target.value) }) }} aria-label={`${s.label} enterprise value`} />
            </label>
            {detached && <button className="vpg__relock" title="Switch the model back on (drop your figure)" onClick={() => onEdit({ evOverride: null })}>↺</button>}
          </span>
        ) : (
          <Field label="Whole company" hint="EV" value={chain.ev} onChange={(n) => onEdit({ ev: n })} title="What the whole business is worth in this case, before debt (filing millions)" />
        )}
        <Field label="− Debt, net of cash" value={chain.netDebt} onChange={(n) => onEdit({ netDebt: n })} title={chain.netDebtBasis ? `Basis: ${chain.netDebtBasis} (§15) — this case's own figure` : "This case's own figure — it may differ from the top-level one; the source names the orb"} />
        <Field label="− Other owners' share" hint="minority" value={chain.minority} onChange={(n) => onEdit({ minority: n })} />
        <Field label="+ Other" value={chain.other} onChange={(n) => onEdit({ other: n })} />
        <Field label="÷ Shares" value={chain.shares ?? fallbackShares} onChange={(n) => onEdit({ shares: n })} />
        <div className="vpg__subderived">
          <span className="vpg__fieldlabel">{s.label} / share</span>
          <span className="vpg__subval mono">{fmtN(level, 2)}</span>
        </div>
      </div>
      {chain.netDebtBasis && (
        <div className="vpg__gridmeta">net-debt basis: {chain.netDebtBasis} (§15 — labelled because it departs from the top-level basis)</div>
      )}
      {chain.statedDrivers.length > 0 && (
        <div className="vpg__gridmeta">
          what the run said sat behind these (shown for the record, not editable): {chain.statedDrivers.map((sd) => `${sd.label}: ${sd.value ?? '—'}${sd.note ? ` (${sd.note})` : ''}`).join(' · ')}
        </div>
      )}
      <div className="vpg__subnote">These are the figures the run actually used — edit them and the value, its return, and the answer at the top all recompute. The value itself is always worked out, never typed.</div>
      <button className="btn btn--ghost vpg__overridebtn" onClick={onOverride}>Unlock and type the value directly instead…</button>
    </div>
  )
}

// ---- v1.1 per-method sub-panels (P-C) — typed fields over each orb's OWN recorded data ----

function DcfPanel({ d, readout, onWacc, onGrowth }: {
  d: NonNullable<DraftInternals['dcf']>
  readout?: GridReadout
  onWacc: (n: number | null) => void
  onGrowth: (n: number | null) => void
}) {
  const g = d.grid
  const near = (a: number | null, b: number) => a !== null && Math.abs(a - b) < 1e-9
  return (
    <div className="vpg__subpanel">
      <div className="vpg__subfields">
        <Field label="Discount rate" hint="WACC, %" value={toPct(d.wacc)} onChange={(n) => onWacc(fromPct(n))} title="What the money funding this company costs — reads the range the research actually tested" />
        <Field label="Long-run growth" hint="%" value={toPct(d.growth)} onChange={(n) => onGrowth(fromPct(n))} title="How fast it grows for ever after — reads the range the research actually tested" />
        <div className="vpg__subderived">
          <span className="vpg__fieldlabel">Worth per share</span>
          <span className="vpg__subval mono">{d.active && readout && readout.value !== null ? fmtN(readout.value, 2) : 'edit to work out'}</span>
        </div>
      </div>
      {/* v2 Phase-1: the recorded grid AS Excel's two-way data table — clicking a cell snaps the typed
          fields to that recorded point (the table and the fields are the same lever, two views). Growth
          rows render highest-first, the finance convention for a WACC × g matrix. */}
      <table className="vpg__gridtable">
        <thead>
          <tr><th>growth \ rate</th>{g.wacc.map((w, wi) => <th key={wi}>{toPct(w)}%</th>)}</tr>
        </thead>
        <tbody>
          {g.growth.map((gr, gi) => ({ gr, gi })).reverse().map(({ gr, gi }) => (
            <tr key={gi}>
              <th>{toPct(gr)}%</th>
              {g.wacc.map((w, wi) => {
                const on = d.active && near(d.wacc, w) && near(d.growth, gr)
                const isOrbBase = !!g.base && Math.abs(g.base.wacc - w) < 1e-9 && Math.abs(g.base.growth - gr) < 1e-9
                return (
                  <td key={wi}>
                    <button
                      className={`vpg__gridcell${on ? ' vpg__gridcell--on' : ''}${isOrbBase ? ' vpg__gridcell--base' : ''}`}
                      onClick={() => { onWacc(w); onGrowth(gr) }}
                      title={`Rate ${toPct(w)}% × growth ${toPct(gr)}%${isOrbBase ? " — the research's own starting point" : ''}`}
                    >{fmtN(g.values[gi][wi], 2)}</button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="vpg__gridmeta">
        every combination the research tested — click one to jump the fields to it
        {d.grid.base && <> · it started at {toPct(d.grid.base.wacc)}% × {toPct(d.grid.base.growth)}% (outlined)</>}
        {g.source && <> · {g.source}</>}
      </div>
      {d.active && readout?.outOfGrid
        ? <div className="vpg__subnote vpg__note--warn">▲ outside everything the research tested — this is a guess off the end of the table, not a checked number</div>
        : d.active && readout?.interpolated
          ? <div className="vpg__subnote">between two tested points — a straight-line blend of the research's own numbers</div>
          : null}
    </div>
  )
}

function SotpPanel({ s, derived, onMultiple }: {
  s: NonNullable<DraftInternals['sotp']>
  derived: number | null
  onMultiple: (idx: number, n: number | null) => void
}) {
  const br = s.bridge
  return (
    <div className="vpg__subpanel">
      <div className="vpg__segrow vpg__segrow--head"><span>Part of the business</span><span>{s.segments[0]?.metric_name || 'Metric'}</span><span>×</span><span>Priced like</span></div>
      {s.segments.map((seg, i) => (
        <div key={seg.segment} className="vpg__segrow">
          <span className="vpg__seglabel">{seg.segment}</span>
          <span className="mono vpg__segmetric">{fmtN(seg.metric, 0)}</span>
          <TableInput value={seg.multiple} onChange={(n) => onMultiple(i, n)} ariaLabel={`${seg.segment} multiple`} />
          <span className="vpg__segcomp">{seg.comp || '—'}</span>
        </div>
      ))}
      <div className="vpg__gridmeta">
        then: {typeof br?.net_debt === 'number' && <>− debt net of cash {fmtN(br.net_debt, 0)} </>}
        {typeof br?.minority === 'number' && <>− other owners' share {fmtN(br.minority, 0)} </>}
        {typeof br?.other === 'number' && br.other !== 0 && <>+ other {fmtN(br.other, 0)} </>}
        → worth per share <span className="vpg__subval mono">{s.active && derived !== null ? fmtN(derived, 2) : 'edit a multiple to work it out'}</span>
        {br?.source && <> · {br.source}</>}
      </div>
    </div>
  )
}

function PeersPanel({ p, readout, onMultiple }: {
  p: NonNullable<DraftInternals['peers']>
  readout?: PeersReadout
  onMultiple: (n: number | null) => void
}) {
  const pi = p.pi
  return (
    <div className="vpg__subpanel">
      <div className="vpg__subfields">
        <Field label={pi.metric_name ? `${pi.metric_name} ×` : 'Multiple used ×'} value={p.multiple} onChange={onMultiple} title="The multiple applied to this company — the research's own table of implied values defines what each one is worth" />
        <div className="vpg__subderived">
          <span className="vpg__fieldlabel">Worth per share</span>
          <span className="vpg__subval mono">{p.active && readout && readout.value !== null ? fmtN(readout.value, 2) : 'edit to work out'}</span>
        </div>
        {p.active && readout?.discountPct !== null && readout?.discountPct !== undefined && typeof pi.median_multiple === 'number' && (
          <div className="vpg__subderived">
            <span className="vpg__fieldlabel">vs the typical rival at {pi.median_multiple}x</span>
            <span className="vpg__subval mono">{readout.discountPct > 0 ? `−${fmtN(readout.discountPct, 1)}%` : `+${fmtN(-readout.discountPct, 1)}%`}</span>
          </div>
        )}
      </div>
      <div className="vpg__gridmeta">
        what the research tested: {pi.anchors.map((a) => `${a.multiple}x → ${fmtN(a.value, 1)}`).join(' · ')}
        {pi.source && <> · {pi.source}</>}
      </div>
      {p.active && readout?.outOfAnchors && <div className="vpg__subnote vpg__note--warn">▲ outside everything the research tested — a guess off the end of that list, not a checked number</div>}
    </div>
  )
}
