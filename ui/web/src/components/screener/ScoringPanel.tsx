// SCORING WEIGHTS — the cockpit knobs behind every event's triage score. This is the GLOBAL twin of the
// per-event "Why this score" panel: that one explains how the weights landed on one item; this one tunes
// the weights themselves, for the whole wire at once (never per-news). Editing a knob re-ranks the visible
// wire instantly in the Live preview (client-side, scoreUnderWeights) — Save persists it to the engine, so
// future scoring and the next wire load both honour it. Mirrors the ActivityLog slide-in pattern.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../lib/store'
import { displayHeadline } from '../../lib/plain'
import { api, isStatic } from '../../lib/api'
import { DEFAULT_RANK_WEIGHTS, WEIGHT_SECTIONS, rankWeightsEqual, scoreUnderWeights, type RankWeights, type RankWeightsState } from '../../lib/rankWeights'
import type { AutotuneState, WeightChange } from '../../lib/types'

const clampPt = (n: number) => Math.max(-50, Math.min(50, Math.round(n)))
const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`)
const ptTone = (n: number) => (n > 0 ? 'var(--live)' : n < 0 ? 'var(--bad)' : 'var(--text-faint)')

// "3h ago" / "2d ago" — a compact relative stamp for the audit rows.
function ago(iso: string): string {
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return ''
  const s = Math.max(0, (Date.now() - t) / 1000)
  if (s < 90) return 'just now'
  if (s < 3600) return `${Math.round(s / 60)}m ago`
  if (s < 86400) return `${Math.round(s / 3600)}h ago`
  return `${Math.round(s / 86400)}d ago`
}

// one points knob: − / editable value / + , coloured by sign, with a quiet "was N" when off-default, and a
// pin that locks the weight against the auto-tune loop (a pinned knob the loop will never move).
function WeightStepper({ value, def, pinned, onChange, onTogglePin }: { value: number; def: number; pinned: boolean; onChange: (n: number) => void; onTogglePin: () => void }) {
  const changed = value !== def
  return (
    <div className="scoring__stepper">
      <button
        type="button"
        className={`scoring__pin${pinned ? ' scoring__pin--on' : ''}`}
        onClick={onTogglePin}
        aria-pressed={pinned}
        aria-label={pinned ? 'unpin — let auto-tune adjust this weight' : 'pin — lock this weight against auto-tune'}
        title={pinned ? 'Pinned — auto-tune won’t change this weight. Click to unpin.' : 'Pin to lock this weight against auto-tune'}
      >
        <span className="scoring__pindot" aria-hidden />
      </button>
      <button type="button" className="scoring__step" onClick={() => onChange(clampPt(value - 1))} aria-label="decrease" title="−1">−</button>
      <input
        className="scoring__num mono"
        style={{ color: ptTone(value) }}
        value={signed(value)}
        inputMode="numeric"
        onChange={(e) => { const n = Number(e.target.value.replace(/[^0-9-]/g, '')); if (Number.isFinite(n)) onChange(clampPt(n)) }}
        aria-label="points"
      />
      <button type="button" className="scoring__step" onClick={() => onChange(clampPt(value + 1))} aria-label="increase" title="+1">+</button>
      <span className="scoring__was" style={{ visibility: changed ? 'visible' : 'hidden' }} title="reset to default" onClick={() => onChange(def)} role="button">was {signed(def)}</span>
    </div>
  )
}

export function ScoringPanel() {
  const close = useStore((s) => s.closeScoring)
  const newsItems = useStore((s) => s.newsItems)
  const feedWindowDays = useStore((s) => s.feedWindowDays)
  const setFeedWindow = useStore((s) => s.setFeedWindow)
  const setToast = useStore((s) => s.setToast)
  const staticMode = isStatic()

  const [server, setServer] = useState<RankWeightsState | null>(null)
  const [draft, setDraft] = useState<RankWeights | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changes, setChanges] = useState<WeightChange[]>([])
  const [autotune, setAutotune] = useState<AutotuneState | null>(null)
  const [reverting, setReverting] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    api.rankWeights().then((s) => { if (live) { setServer(s); setDraft(structuredClone(s.active)); setLoading(false) } }).catch(() => { if (live) { setServer({ active: DEFAULT_RANK_WEIGHTS, defaults: DEFAULT_RANK_WEIGHTS, customised: false }); setDraft(structuredClone(DEFAULT_RANK_WEIGHTS)); setLoading(false) } })
    api.rankWeightChanges().then((r) => { if (live) { setChanges(r.changes); setAutotune(r.autotune) } }).catch(() => {})
    return () => { live = false }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const setPt = useCallback((group: keyof RankWeights, id: string, n: number) => {
    setDraft((d) => (d ? { ...d, [group]: { ...(d[group] as Record<string, number>), [id]: n } } : d))
  }, [])
  const setBoost = useCallback((n: number) => setDraft((d) => (d ? { ...d, boost_weight: n } : d)), [])

  const defaults = server?.defaults ?? DEFAULT_RANK_WEIGHTS
  const active = server?.active ?? DEFAULT_RANK_WEIGHTS
  const pins = useMemo(() => new Set(autotune?.pins ?? []), [autotune])

  // Pin/unpin one weight against the loop (optimistic — the switch feels instant, rolls back on failure).
  const togglePin = useCallback(async (group: keyof RankWeights, id: string) => {
    const key = `${group}:${id}`
    const next = new Set(autotune?.pins ?? [])
    next.has(key) ? next.delete(key) : next.add(key)
    const prev = autotune
    setAutotune((a) => (a ? { ...a, pins: [...next] } : a))
    try { setAutotune(await api.setAutotune({ pins: [...next] })) } catch { setAutotune(prev); setToast({ msg: 'Could not update the pin.', tone: 'bad' }) }
  }, [autotune, setToast])

  const togglePause = useCallback(async () => {
    if (!autotune) return
    const prev = autotune
    const paused = !autotune.paused
    setAutotune({ ...autotune, paused })
    try {
      setAutotune(await api.setAutotune({ paused }))
      setToast({ msg: paused ? 'Auto-tune paused — no automatic changes until you resume.' : 'Auto-tune resumed — feedback nudges apply daily again.', tone: 'good' })
    } catch { setAutotune(prev); setToast({ msg: 'Could not change auto-tune.', tone: 'bad' }) }
  }, [autotune, setToast])

  // Revert one automatic change: the server restores the before-values; we refresh weights + history and,
  // if the user hasn't started editing, follow the revert in the draft too.
  const revert = useCallback(async (id: string) => {
    setReverting(id)
    try {
      await api.revertRankWeightChange(id)
      const [fresh, hist] = await Promise.all([api.rankWeights(), api.rankWeightChanges()])
      setServer(fresh)
      setDraft((d) => (d && rankWeightsEqual(d, active) ? structuredClone(fresh.active) : d))
      setChanges(hist.changes)
      setAutotune(hist.autotune)
      setToast({ msg: 'Change reverted — the previous weights are back.', tone: 'good' })
    } catch { setToast({ msg: 'Could not revert the change.', tone: 'bad' }) } finally { setReverting(null) }
  }, [active, setToast])
  const dirty = !!draft && !rankWeightsEqual(draft, active)
  const isDefaults = !!draft && rankWeightsEqual(draft, defaults)

  // LIVE PREVIEW — re-rank the visible wire under the draft vs the saved weights, surface the movers.
  const preview = useMemo(() => {
    if (!draft) return null
    const scored = newsItems.filter((i) => i.rank_factors).map((i) => {
      const before = scoreUnderWeights(i, active)
      const after = scoreUnderWeights(i, draft)
      return { i, before, after, delta: after - before }
    })
    const changed = scored.filter((r) => r.delta !== 0)
    const top = [...changed].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || b.after - a.after).slice(0, 12)
    return { total: scored.length, up: changed.filter((r) => r.delta > 0).length, down: changed.filter((r) => r.delta < 0).length, top }
  }, [newsItems, draft, active])

  const save = async () => {
    if (!draft || saving) return
    setSaving(true)
    try {
      // sending the exact defaults removes the override file (clean "back to shipped"); else persist the set
      const res = await api.saveRankWeights(isDefaults ? { reset: true } : draft)
      setServer(res)
      setDraft(structuredClone(res.active))
      void setFeedWindow(feedWindowDays || 2) // refetch → the wire re-ranks under the new weights
      setToast({ msg: 'Scoring weights saved — the wire re-ranked.', tone: 'good' })
    } catch (e: any) {
      setToast({ msg: e?.static ? 'Read-only showcase — saving runs on the live engine.' : 'Could not save the weights.', tone: 'bad' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div className="scoring" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="scoring__head">
        <div style={{ minWidth: 0 }}>
          <div className="scoring__title">
            Scoring weights
            {server?.customised && <span className="scoring__badge">customised</span>}
          </div>
          <div className="scoring__sub">Tune how every event is scored. One global setting — it re-ranks the whole wire, never a single news item.</div>
        </div>
        <div className="scoring__headbtns">
          {autotune && !staticMode && (
            <button
              type="button"
              className={`scoring__autotoggle${autotune.paused ? ' scoring__autotoggle--paused' : ''}`}
              onClick={togglePause}
              aria-pressed={!autotune.paused}
              title={autotune.paused ? 'Auto-tune is paused — no automatic weight changes. Click to resume the daily, guardrailed, feedback-driven nudges.' : 'Auto-tune is on — feedback-driven weight nudges apply automatically each day (guardrailed by a backtest, audited below, one-click revertible). Click to pause.'}
            >
              <span className="scoring__autodot" aria-hidden />
              {autotune.paused ? 'Auto-tune paused' : 'Auto-tune on'}
            </button>
          )}
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={() => draft && setDraft(structuredClone(defaults))} disabled={isDefaults || loading} title="Set every knob back to the shipped values (preview it, then Save)">Reset to defaults</button>
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
        </div>
      </div>

      {loading || !draft ? (
        <div className="scoring__loading">Loading the weights…</div>
      ) : (
        <div className="scoring__body">
          <div className="scoring__controls">
            <p className="scoring__formula">
              Score = the AI’s headline read <span className="scoring__op">+</span> these adjustments <span className="scoring__op">×</span> overall boost, capped 0–100.
            </p>
            {WEIGHT_SECTIONS.map((sec) => (
              <section key={sec.group} className="scoring__section">
                <div className="scoring__sectitle">{sec.title}</div>
                <div className="scoring__sechint">{sec.hint}</div>
                <div className="scoring__rows">
                  {sec.rows.map((row) => (
                    <div key={row.id} className="scoring__row" title={row.meaning}>
                      <span className="scoring__rowlabel">{row.label}</span>
                      <WeightStepper value={(draft[sec.group] as Record<string, number>)[row.id] ?? 0} def={(defaults[sec.group] as Record<string, number>)[row.id] ?? 0} pinned={pins.has(`${sec.group}:${row.id}`)} onChange={(n) => setPt(sec.group, row.id, n)} onTogglePin={() => togglePin(sec.group, row.id)} />
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <section className="scoring__section">
              <div className="scoring__sectitle">Overall boost</div>
              <div className="scoring__sechint">How hard all the adjustments push. 0 = ignore them (use the AI read alone), 1 = normal, 2 = double.</div>
              <div className="scoring__boost">
                <input className="scoring__slider" type="range" min={0} max={2} step={0.05} value={draft.boost_weight} onChange={(e) => setBoost(Number(e.target.value))} aria-label="overall boost" />
                <span className="scoring__boostval mono">{draft.boost_weight.toFixed(2)}×</span>
              </div>
            </section>

            <section className="scoring__section scoring__auditsec">
              <div className="scoring__sectitle">Auto-tune history</div>
              <div className="scoring__sechint">Every weight change the loop made from your feedback — each one reversible. {autotune?.paused ? 'Paused right now.' : 'Runs daily; a change only lands if it clears the tuner’s floors and a backtest.'}</div>
              {changes.length === 0 ? (
                <div className="scoring__auditempty">No automatic changes yet. Once enough feedback agrees on a category, the loop nudges its weight — at most 3 points a day — and it shows up here, with the feedback that drove it.</div>
              ) : (
                <ul className="scoring__audit">
                  {changes.slice(0, 12).map((c) => (
                    <li key={c.change_id} className={`scoring__auditrow${c.reverted ? ' scoring__auditrow--reverted' : ''}`}>
                      <div className="scoring__auditmain">
                        <span className={`scoring__auditkind${c.kind === 'revert' ? ' scoring__auditkind--revert' : ''}`}>{c.kind === 'revert' ? 'reverted' : 'auto'}</span>
                        <span className="scoring__auditdeltas mono">
                          {c.deltas.map((d, i) => (
                            <span key={i} className="scoring__auditdelta">
                              {d.dimension}:{d.category}{' '}
                              <span style={{ color: ptTone(d.after - d.before) }}>{signed(d.before)}→{signed(d.after)}</span>
                            </span>
                          ))}
                        </span>
                      </div>
                      <div className="scoring__auditmeta">
                        <span title={new Date(c.ts).toLocaleString()}>{ago(c.ts)}</span>
                        {c.kind === 'apply' && c.backtest?.passes && <span className="scoring__auditbt" title="the change passed a train/holdout backtest before it applied">backtest ✓</span>}
                        {c.kind === 'apply' && (c.evidence_feedback_ids?.length ?? 0) > 0 && (
                          <span title="how many of your feedback flags drove this change">{c.evidence_feedback_ids!.length} flag{c.evidence_feedback_ids!.length === 1 ? '' : 's'}</span>
                        )}
                        {c.kind === 'apply' && !c.reverted && !staticMode && (
                          <button className="scoring__revert" onClick={() => revert(c.change_id)} disabled={reverting === c.change_id} title="undo this change and restore the previous weights">
                            {reverting === c.change_id ? 'reverting…' : 'Revert'}
                          </button>
                        )}
                        {c.reverted && <span className="scoring__auditreverted">reverted</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="scoring__preview">
            <div className="scoring__previewhead">Live preview</div>
            {staticMode ? (
              <div className="scoring__previewempty">The live wire (and saving) runs on your engine. This is the read-only showcase.</div>
            ) : !preview || preview.total === 0 ? (
              <div className="scoring__previewempty">Open the wire so there are events to preview against.</div>
            ) : !dirty ? (
              <div className="scoring__previewempty">Change a weight to see how the {preview.total} events on the wire would re-rank.</div>
            ) : (
              <>
                <div className="scoring__previewstat">
                  <span className="scoring__up">▲ {preview.up} up</span>
                  <span className="scoring__down">▼ {preview.down} down</span>
                  <span className="scoring__previewmuted">of {preview.total} shown</span>
                </div>
                <div className="scoring__movers">
                  {preview.top.map((m) => (
                    <div key={`${m.i.event_id}-${m.i.ts}`} className="scoring__mover">
                      <span className="scoring__moverscore mono">
                        <span className="scoring__moverfrom">{m.before}</span>
                        <span className="scoring__moverarrow" aria-hidden>→</span>
                        <span className="scoring__moverto" style={{ color: ptTone(m.delta) }}>{m.after}</span>
                      </span>
                      <span className="scoring__moverhl" title={m.i.headline}>{displayHeadline(m.i)}</span>
                      <span className="scoring__moverdelta mono" style={{ color: ptTone(m.delta) }}>{signed(m.delta)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="scoring__foot">
        <span className="scoring__footnote">{dirty ? 'Unsaved changes — they apply to the whole wire once you save.' : isDefaults ? 'At the shipped defaults.' : 'Saved.'}</span>
        <button className="btn btn--amber" onClick={save} disabled={!dirty || saving || staticMode}>{saving ? 'Saving…' : 'Save weights'}</button>
      </div>
    </motion.div>
  )
}
