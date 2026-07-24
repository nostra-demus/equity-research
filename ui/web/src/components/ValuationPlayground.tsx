// VALUATION PLAYGROUND — the "move the levers yourself" panel. Left: the engine's SYSTEM JUDGMENT (the
// frozen decision_record — its bull/base/bear, expected return, margin of safety). Right: a PLAYGROUND
// where every valuation input is a lever (current price, WACC components, per-scenario forward metric +
// multiple), recomputed LIVE on the client (lib/valuationLevers.ts, a mirror of scripts/valuation_math.py)
// with NO agent re-run. Moving a lever re-derives the levels + returns instantly; the two columns sit side
// by side so the gap between "what the engine said" and "what I believe" is visible. Save records the
// override + your reason to an append-only ledger (the raw material for the archetype-rule learning loop).
//
// Right-slide panel, same motion signature as ScoringPanel / OutputReader (DESIGN.md §3). Tokens only.

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { api, isStatic } from '../lib/api'
import {
  draftFromResponse, recompute, type PlaygroundDraft, type ValuationLeversResponse, type DraftScenario,
  type DraftInternals, type GridReadout, type PeersReadout,
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
const tone = (n: number | null | undefined): string => (typeof n !== 'number' ? 'var(--text-faint)' : n >= 0 ? 'var(--accent-bright)' : 'var(--bad)')

// Numeric inputs keep a LOCAL string state synced to the prop. Binding the raw <input value> to the parsed
// number swallows intermediate states ("0." parses to 0 and re-renders "0", so a decimal point can never be
// typed). We hold the exact keystrokes locally and emit the parsed number upward; when the prop changes for
// another reason we re-sync. `numToStr` avoids clobbering an in-progress "0." with the equal-valued "0".
const numToStr = (n: number | null): string => (n === null ? '' : String(n))

// Plain-English labels for the value-producing methods (the football-field keys). Covers the operating-co
// set plus the business-type-specific intrinsic methods (RI for financials, DDM, NAV for REITs). Unknown
// keys fall through to a de-underscored key so a future method still shows a readable row.
const METHOD_LABELS: Record<string, string> = { own_history: 'Own-history', peers: 'Peers', dcf: 'DCF', sotp: 'SOTP', ri_model: 'RI model', ddm: 'DDM', nav: 'NAV' }
const methodLabel = (key: string): string => METHOD_LABELS[key] ?? key.replace(/_/g, ' ')

function Field({ label, value, onChange, step = 'any', title }: { label: string; value: number | null; onChange: (n: number | null) => void; step?: string; title?: string }) {
  const [local, setLocal] = useState<string>(numToStr(value))
  useEffect(() => { if (parseNum(local) !== value) setLocal(numToStr(value)) }, [value]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <label className="vpg__field" title={title}>
      <span className="vpg__fieldlabel">{label}</span>
      <input
        className="vpg__input mono"
        inputMode="decimal"
        step={step}
        value={local}
        onChange={(e) => { setLocal(e.target.value); onChange(parseNum(e.target.value)) }}
      />
    </label>
  )
}

function TableInput({ value, onChange, ariaLabel }: { value: number | null; onChange: (n: number | null) => void; ariaLabel?: string }) {
  const [local, setLocal] = useState<string>(numToStr(value))
  useEffect(() => { if (parseNum(local) !== value) setLocal(numToStr(value)) }, [value]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <input
      className="vpg__scennum mono"
      inputMode="decimal"
      value={local}
      onChange={(e) => { setLocal(e.target.value); onChange(parseNum(e.target.value)) }}
      aria-label={ariaLabel}
    />
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
  const hasLevers = !!(res?.levers && res.levers.scenarios?.length)
  // A run whose scenarios carry NO forward-metric/multiple (a method-blend — every committed run) has no
  // single metric×multiple to edit, so show the editable fair-value LEVEL column instead of dead, empty
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

  const reset = () => { if (res) setDraft(draftFromResponse(res)) }

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

  const CmpRow = ({ label, sys, pg, isPct = true }: { label: string; sys: number | null; pg: number | null; isPct?: boolean }) => (
    <div className="vpg__cmprow">
      <span className="vpg__cmplabel">{label}</span>
      <span className="vpg__cmpsys mono" style={{ color: isPct ? tone(sys) : undefined }}>{isPct ? fmtPct(sys) : fmtN(sys)}</span>
      <span className="vpg__cmparrow" aria-hidden>→</span>
      <span className="vpg__cmppg mono" style={{ color: isPct ? tone(pg) : undefined }}>{isPct ? fmtPct(pg) : fmtN(pg)}</span>
    </div>
  )

  return (
    <motion.div className="vpg" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="vpg__head">
        <div style={{ minWidth: 0 }}>
          <div className="vpg__title">Valuation Playground {ticker && <span className="vpg__ticker">{ticker}</span>}</div>
          <div className="vpg__sub">Move the levers — WACC, multiples, forward EPS, the price — and watch bull/base/bear and the return recompute live. Nothing re-runs the swarm; the fair-value levels are price-independent, so this is instant.</div>
        </div>
        <div className="vpg__headbtns">
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={reset} disabled={!res}>Reset to system</button>
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
        </div>
      </div>

      {loading ? (
        <div className="vpg__loading">Loading the levers…</div>
      ) : error || !draft || !out ? (
        <div className="vpg__empty">{error ?? 'No valuation data for this run.'}</div>
      ) : (
        <div className="vpg__body">
          {/* ---- headline comparison: system judgment vs playground ---- */}
          <div className="vpg__compare">
            <div className="vpg__comparehead">
              <span />
              <span className="vpg__col vpg__col--sys">System</span>
              <span />
              <span className="vpg__col vpg__col--pg">Playground</span>
            </div>
            <CmpRow label="Expected return" sys={dec?.expected_return_pct ?? null} pg={out.math.expectedReturnPct} />
            <CmpRow label="Margin of safety" sys={dec?.margin_of_safety_pct ?? null} pg={out.math.marginOfSafetyPct} />
            <CmpRow label="Downside risk (to bear)" sys={dec?.downside_risk_pct ?? null} pg={out.math.downsideRiskPct} />
            <CmpRow label="Bull fair value" sys={sysLevel('bull')} pg={pgLevel('bull')} isPct={false} />
            <CmpRow label="Base fair value" sys={sysLevel('base')} pg={pgLevel('base')} isPct={false} />
            <CmpRow label="Bear fair value" sys={sysLevel('bear')} pg={pgLevel('bear')} isPct={false} />
            <CmpRow label="Prob-weighted target" sys={null} pg={out.math.probWeightedTarget} isPct={false} />
          </div>

          {/* ---- warnings from the guards (WACC band, multiple symmetry, stale/no bear) ---- */}
          {out.warnings.length > 0 && (
            <div className="vpg__warns">
              {out.warnings.map((w, i) => (<div key={i} className="vpg__warn">⚠ {w}</div>))}
            </div>
          )}

          {/* ---- levers ---- */}
          <div className="vpg__section">
            <div className="vpg__sectitle">Price &amp; anchor</div>
            <div className="vpg__grid">
              <Field label={`Current price${res?.levers?.price_as_of ? ` (as of ${res.levers.price_as_of})` : dec?.entry_price_timestamp ? ` (frozen ${dec.entry_price_timestamp})` : ''}`} value={draft.price} onChange={(n) => setTop({ price: n })} title="Re-anchor every return to a fresh price — the levels don't move, only the returns do." />
              {draft.basis === 'ev' && <Field label="Shares (diluted)" value={draft.shares} onChange={(n) => setTop({ shares: n })} />}
              {draft.basis === 'ev' && <Field label="Net debt (+debt / −cash)" value={draft.netDebt} onChange={(n) => setTop({ netDebt: n })} />}
            </div>
            <div className="vpg__note">Basis: <b>{draft.basis === 'ev' ? 'EV multiple (EBITDA × mult, bridged by net debt)' : 'equity multiple (EPS × P/E)'}</b>{res?.levers?.currency ? ` · ${res.levers.currency}` : ''}</div>
          </div>

          {(draft.wacc !== null || draft.rf !== null || draft.beta !== null) && (
            <div className="vpg__section">
              <div className="vpg__sectitle">Discount rate (WACC) — sanity check</div>
              {/* These fields VALIDATE (the k_d ≤ WACC < k_e band below); they never recompute a value. The
                  WACC that moves a number is the DCF's own lever: Method mix → DCF ▸. Said in-UI because two
                  WACC fields with different jobs is otherwise a guaranteed confusion (user feedback). */}
              <div className="vpg__note">Checks only — these power the validity band below and never move a valuation. To see WACC move the fair value, open <b>Method mix → DCF ▸</b>.</div>
              <div className="vpg__grid">
                <Field label="Risk-free" value={draft.rf} onChange={(n) => setTop({ rf: n })} title="e.g. 0.042 for 4.2%" />
                <Field label="ERP" value={draft.erp} onChange={(n) => setTop({ erp: n })} />
                <Field label="Beta" value={draft.beta} onChange={(n) => setTop({ beta: n })} />
                <Field label="WACC" value={draft.wacc} onChange={(n) => setTop({ wacc: n })} />
                <Field label="After-tax cost of debt" value={draft.afterTaxKd} onChange={(n) => setTop({ afterTaxKd: n })} />
              </div>
              {out.checks.wacc?.costOfEquity != null && (
                <div className="vpg__note">CAPM cost of equity ≈ <b className="mono">{fmtN(out.checks.wacc.costOfEquity, 4)}</b> — a valid WACC sits between the after-tax cost of debt and this. {out.checks.wacc.ok ? '✓ within band' : '⚠ out of band (see warnings)'}</div>
              )}
            </div>
          )}

          {/* ---- method mix: the base-case football field + weights (the real lever for blend-based runs) ---- */}
          {draft.methods.length > 0 && (() => {
            const pubBase = sysLevel('base')
            const bp = out.blend.basePoint
            const delta = typeof bp === 'number' && typeof pubBase === 'number' ? bp - pubBase : null
            return (
              <div className="vpg__section">
                <div className="vpg__sectitle vpg__sectitle--row">
                  <span>Method mix — base case</span>
                  <label className="vpg__toggle" title="Use the live blended base point as the base scenario's fair value, so a moved weight flows into the base return and the expected return.">
                    <input type="checkbox" checked={draft.driveBaseFromMix} onChange={(e) => setTop({ driveBaseFromMix: e.target.checked })} />
                    <span>Drive base from mix</span>
                  </label>
                </div>
                <div className="vpg__mixhead">
                  <span>Method</span><span>Value</span><span>Weight</span><span>Effective</span>
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
                        <span className="vpg__scenlabel vpg__mixlabel">
                          {hasInternals
                            ? <button className={`vpg__disc${open ? ' vpg__disc--open' : ''}`} onClick={() => setOpenMethod(open ? null : m.key)} title="Open this method's recorded assumptions" aria-expanded={open}>{open ? '▾' : '▸'}</button>
                            : <span className="vpg__disc vpg__disc--none" aria-hidden />}
                          {methodLabel(m.key)}
                        </span>
                        {active && derived !== null
                          ? <span className="vpg__scennum mono vpg__mixderived" title="Derived from the recorded assumptions below — edit them there; typing a value here detaches them.">{fmtN(derived, 2)}</span>
                          : <TableInput value={m.value} onChange={(n) => setMethod(i, { value: n })} ariaLabel={`${m.key} value`} />}
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
                <div className="vpg__note vpg__mixsum">
                  Blended base point <b className="mono">{fmtN(bp, 2)}</b>
                  {typeof pubBase === 'number' && (
                    <> vs published base <b className="mono">{fmtN(pubBase, 2)}</b>
                      {delta !== null && Math.abs(delta) >= 0.005 && (
                        <> (Δ <span className="mono">{delta > 0 ? '+' : ''}{fmtN(delta, 2)}</span>). Weights renormalize over the methods present, so the effective column can differ from what you type.</>
                      )}
                    </>
                  )}
                  {out.blendActive
                    ? <span className="vpg__note--warn"> Driving the base case — the returns above use this blend, not the frozen base.</span>
                    : draft.driveBaseFromMix
                      ? <span className="vpg__note--warn"> No weighted method to blend — the base case keeps the published level; the returns above do NOT use the mix.</span>
                      : delta !== null && Math.abs(delta) >= 0.005
                        ? <span> The returns above still use the frozen base — tick <b>Drive base from mix</b> to flow this blend into them.</span>
                        : null}
                </div>
              </div>
            )
          })()}

          <div className="vpg__section">
            <div className="vpg__sectitle">Scenarios — {hasEditableMultiples ? 'forward metric × multiple' : hasLevers ? 'levels — method-blend (edit a level directly, reweight the mix above, or open a method’s ▸ assumptions)' : 'levels (this run predates the levers emission)'}</div>
            {/* A blend run (like NHY) records NO per-scenario metric×multiple — its bull/base/bear came from
                the method blend, so there is no P/E or EV/EBITDA pair to edit per scenario (AMZN's run has
                one and shows those columns). The multiples that DO exist for a blend run live in the ▸
                panels above: the peers NTM EV/EBITDA and the SOTP segment multiples. */}
            <div className="vpg__scenhead">
              <span>Case</span><span>Prob %</span>{hasEditableMultiples ? (<><span>Fwd metric</span><span>Multiple</span></>) : <span>Fair value</span>}<span>Level</span><span>Return</span>
            </div>
            {draft.scenarios.map((s, i) => {
              const row = out.scenarios[i]
              const ret = out.math.perScenario.find((x) => x.label === s.label)?.return_pct ?? null
              return (
                <div key={i} className="vpg__scenrow">
                  <span className="vpg__scenlabel">{s.label}</span>
                  <TableInput value={s.probability} onChange={(n) => setScen(i, { probability: n })} ariaLabel={`${s.label} probability`} />
                  {hasEditableMultiples ? (
                    <>
                      <TableInput value={s.forwardMetric} onChange={(n) => setScen(i, { forwardMetric: n })} ariaLabel={`${s.label} forward metric`} />
                      <TableInput value={s.multiple} onChange={(n) => setScen(i, { multiple: n })} ariaLabel={`${s.label} multiple`} />
                    </>
                  ) : (
                    <TableInput value={s.levelOverride} onChange={(n) => setScen(i, { levelOverride: n })} ariaLabel={`${s.label} fair value`} />
                  )}
                  <span className="vpg__scenlevel mono">{fmtN(row?.level, 2)}</span>
                  <span className="vpg__scenret mono" style={{ color: tone(ret) }}>{fmtPct(ret)}</span>
                </div>
              )
            })}
            {out.math.warnings.some((w) => w.includes('probabilities sum')) && <div className="vpg__note vpg__note--warn">Probabilities don't sum to 100 — the expected return still computes, but fix them for a clean read (§10).</div>}
          </div>

          {/* ---- save override + reason ---- */}
          <div className="vpg__section vpg__savesec">
            <div className="vpg__sectitle">Record this as your judgment</div>
            <textarea className="vpg__reason" placeholder="Why is your view different? e.g. 'WACC 10.4% is too high for a mega-cap — 9% is right; bull should expand the multiple to 28×.'" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
            <div className="vpg__savefoot">
              <span className="vpg__savenote">Saved to an append-only ledger — the raw material for the archetype-rule learning loop. It does not change the frozen run.</span>
              <button className="btn btn--amber" onClick={save} disabled={saving || staticMode}>{saving ? 'Saving…' : 'Save override'}</button>
            </div>
            {(res?.overrides?.length ?? 0) > 0 && (
              <div className="vpg__history">{res!.overrides.length} saved override{res!.overrides.length === 1 ? '' : 's'} on this run.</div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ---- v1.1 per-method sub-panels (P-C) — typed fields over each orb's OWN recorded data ----
// Grid axes are decimals in the sidecar (0.075); the fields type percent (7.5). Exact for the recorded
// points (7.5/100 === 0.075 in doubles), so a typed grid point reads the verbatim cell, never a blend.
const toPct = (x: number | null | undefined): number | null => (typeof x === 'number' ? +(x * 100).toFixed(4) : null)
const fromPct = (x: number | null): number | null => (typeof x === 'number' ? x / 100 : null)

function DcfPanel({ d, readout, onWacc, onGrowth }: {
  d: NonNullable<DraftInternals['dcf']>
  readout?: GridReadout
  onWacc: (n: number | null) => void
  onGrowth: (n: number | null) => void
}) {
  const g = d.grid
  const lo = Math.min(...g.values.flat()), hi = Math.max(...g.values.flat())
  return (
    <div className="vpg__subpanel">
      <div className="vpg__subfields">
        <Field label="WACC %" value={toPct(d.wacc)} onChange={(n) => onWacc(fromPct(n))} title="The discount rate — reads the orb's recorded sensitivity grid" />
        <Field label="Terminal growth %" value={toPct(d.growth)} onChange={(n) => onGrowth(fromPct(n))} title="Gordon terminal growth — reads the orb's recorded sensitivity grid" />
        <div className="vpg__subderived">
          <span className="vpg__fieldlabel">DCF / share</span>
          <span className="vpg__subval mono">{d.active && readout && readout.value !== null ? fmtN(readout.value, 2) : 'edit to derive'}</span>
        </div>
      </div>
      <div className="vpg__gridmeta">
        recorded grid: WACC {g.wacc.map((x) => toPct(x)).join(' / ')}% × g {g.growth.map((x) => toPct(x)).join(' / ')}% → {fmtN(lo, 2)}–{fmtN(hi, 2)}
        {d.grid.base && <> · orb base {toPct(d.grid.base.wacc)}% × {toPct(d.grid.base.growth)}%</>}
        {g.source && <> · {g.source}</>}
      </div>
      {d.active && readout?.outOfGrid
        ? <div className="vpg__subnote vpg__note--warn">▲ beyond the recorded grid — extrapolated, not validated</div>
        : d.active && readout?.interpolated
          ? <div className="vpg__subnote">between recorded points — a linear blend of the orb's own grid cells (interpolated)</div>
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
      <div className="vpg__segrow vpg__segrow--head"><span>Segment</span><span>{s.segments[0]?.metric_name || 'Metric'}</span><span>×</span><span>Comp</span></div>
      {s.segments.map((seg, i) => (
        <div key={seg.segment} className="vpg__segrow">
          <span className="vpg__seglabel">{seg.segment}</span>
          <span className="mono vpg__segmetric">{fmtN(seg.metric, 0)}</span>
          <TableInput value={seg.multiple} onChange={(n) => onMultiple(i, n)} ariaLabel={`${seg.segment} multiple`} />
          <span className="vpg__segcomp">{seg.comp || '—'}</span>
        </div>
      ))}
      <div className="vpg__gridmeta">
        bridge: {typeof br?.net_debt === 'number' && <>− net debt {fmtN(br.net_debt, 0)} </>}
        {typeof br?.minority === 'number' && <>− minority {fmtN(br.minority, 0)} </>}
        {typeof br?.other === 'number' && br.other !== 0 && <>+ other {fmtN(br.other, 0)} </>}
        → SOTP / share <span className="vpg__subval mono">{s.active && derived !== null ? fmtN(derived, 2) : 'edit a multiple to derive'}</span>
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
        <Field label={pi.metric_name ? `${pi.metric_name} ×` : 'Applied multiple ×'} value={p.multiple} onChange={onMultiple} title="The multiple applied to the peer-implied line — the orb's own anchor rows define the mapping" />
        <div className="vpg__subderived">
          <span className="vpg__fieldlabel">Peers / share</span>
          <span className="vpg__subval mono">{p.active && readout && readout.value !== null ? fmtN(readout.value, 2) : 'edit to derive'}</span>
        </div>
        {p.active && readout?.discountPct !== null && readout?.discountPct !== undefined && typeof pi.median_multiple === 'number' && (
          <div className="vpg__subderived">
            <span className="vpg__fieldlabel">vs {pi.median_multiple}x median</span>
            <span className="vpg__subval mono">{readout.discountPct > 0 ? `−${fmtN(readout.discountPct, 1)}%` : `+${fmtN(-readout.discountPct, 1)}%`}</span>
          </div>
        )}
      </div>
      <div className="vpg__gridmeta">
        recorded rows: {pi.anchors.map((a) => `${a.multiple}x → ${fmtN(a.value, 1)}`).join(' · ')}
        {pi.source && <> · {pi.source}</>}
      </div>
      {p.active && readout?.outOfAnchors && <div className="vpg__subnote vpg__note--warn">▲ outside the orb's recorded implied-value rows — extrapolated, not validated</div>}
    </div>
  )
}
