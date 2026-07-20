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

  const setScen = (idx: number, patch: Partial<DraftScenario>) =>
    setDraft((d) => (d ? { ...d, scenarios: d.scenarios.map((s, i) => (i === idx ? { ...s, ...patch } : s)) } : d))
  const setTop = (patch: Partial<PlaygroundDraft>) => setDraft((d) => (d ? { ...d, ...patch } : d))

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
              <div className="vpg__sectitle">Discount rate (WACC)</div>
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

          <div className="vpg__section">
            <div className="vpg__sectitle">Scenarios — {hasLevers ? 'forward metric × multiple' : 'levels (this run predates the levers emission)'}</div>
            <div className="vpg__scenhead">
              <span>Case</span><span>Prob %</span>{hasLevers ? (<><span>Fwd metric</span><span>Multiple</span></>) : <span>Fair value</span>}<span>Level</span><span>Return</span>
            </div>
            {draft.scenarios.map((s, i) => {
              const row = out.scenarios[i]
              const ret = out.math.perScenario.find((x) => x.label === s.label)?.return_pct ?? null
              return (
                <div key={i} className="vpg__scenrow">
                  <span className="vpg__scenlabel">{s.label}</span>
                  <TableInput value={s.probability} onChange={(n) => setScen(i, { probability: n })} ariaLabel={`${s.label} probability`} />
                  {hasLevers ? (
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
