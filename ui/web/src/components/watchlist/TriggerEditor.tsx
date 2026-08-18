import type { DistributiveOmit, WatchTrigger } from '../../lib/types'

// The four trigger builders.
//
// Nothing ambiguous is typed. Direction and reference source are fixed choices, dates are pickers, and
// every number carries the currency it is measured in — the row's currency, which the editor cannot
// change. That constraint is the point: a level typed in the wrong unit is silently 100x off (a London
// listing quotes in pence), and the only defence that actually works is never letting the two drift.

/** A trigger being edited. `trigger_id` is present when editing an existing one — the server keeps it
 *  only if the entry really has it, so identity survives a reorder or a deletion. */
export type DraftTrigger = DistributiveOmit<WatchTrigger, 'trigger_id'> & { trigger_id?: string }

export const TRIGGER_LABEL: Record<DraftTrigger['kind'], string> = {
  price_level: 'Price level',
  pct_drop: 'Drop from a reference',
  valuation_mos: 'Margin of safety',
  event_date: 'Event or date',
}

export function newTrigger(kind: DraftTrigger['kind'], ctx: { currency: string; reference: number | null; today: string }): DraftTrigger {
  if (kind === 'price_level') return { kind, direction: 'at_or_below', level: ctx.reference ?? 0, currency: ctx.currency }
  if (kind === 'pct_drop') {
    return { kind, drop_pct: 15, reference: { value: ctx.reference ?? 0, currency: ctx.currency, as_of: ctx.today, source: 'price now' } }
  }
  if (kind === 'valuation_mos') {
    // Seeded from the current price so the field starts at a real number you edit down, never at 0 —
    // which the server rejects. run_root is null until a run pins it: a fair value you assert yourself is
    // legitimate, it is just labelled as YOUR number rather than the engine's.
    return { kind, run_root: null, scenario_label: 'base', anchor_value: ctx.reference ?? 0, anchor_currency: ctx.currency, anchor_as_of: null, required_mos_pct: 20, direction: 'at_or_below' }
  }
  return { kind, due_date: ctx.today, label: '' }
}

/** What the drop trigger will actually fire at — shown while you type, so the number is never implied. */
export function dropThreshold(t: Extract<DraftTrigger, { kind: 'pct_drop' }>): number | null {
  if (!(t.reference.value > 0)) return null
  return Math.round(t.reference.value * (1 - t.drop_pct / 100) * 100) / 100
}

/**
 * Whether another trigger of this kind would say anything new.
 *
 * Not a blanket one-of-each: several DATED reminders on one name are ordinary (a print, then a court
 * date), and two price levels can be a buy level and a take-profit — which is why direction is stored
 * rather than inferred. But a second drop-from-reference or a second margin-of-safety on the same row is
 * the same question asked twice: whichever is looser fires first and the other can never say anything
 * the first has not already said.
 */
export function canAddTrigger(kind: DraftTrigger['kind'], existing: DraftTrigger[]): { ok: boolean; why?: string } {
  const of = existing.filter((t) => t.kind === kind)
  if (kind === 'event_date') return { ok: true }
  if (kind === 'price_level') {
    // one per direction: a floor and a ceiling are different questions, two floors are not
    const dirs = new Set(of.map((t) => (t as Extract<DraftTrigger, { kind: 'price_level' }>).direction))
    if (dirs.has('at_or_below') && dirs.has('at_or_above')) return { ok: false, why: 'Already has a level in both directions.' }
    if (of.length >= 2) return { ok: false, why: 'Already has two price levels.' }
    return { ok: true }
  }
  if (of.length) {
    return {
      ok: false,
      why: kind === 'pct_drop'
        ? 'Already has a drop trigger — the looser one fires first, so a second says nothing new.'
        : 'Already has a margin-of-safety trigger against this row.',
    }
  }
  return { ok: true }
}

/**
 * What is still wrong with this trigger, in words the person can act on. The composer gates saving on it
 * and shows it under the offending field — without this, a level left at 0 (which is what the ☆ Watch
 * path produces, since it has no price to seed from) is refused by the server and the WHOLE entry is
 * lost behind an opaque "invalid body".
 */
export function triggerDraftProblem(t: DraftTrigger, currency: string): string | null {
  if (t.kind !== 'event_date' && !currency) return 'This row has no currency, so a price trigger cannot be checked.'
  if (t.kind === 'price_level') return t.level > 0 ? null : 'Set the price level.'
  if (t.kind === 'pct_drop') {
    if (!(t.reference.value > 0)) return 'Set the reference price this drop is measured from.'
    return t.drop_pct > 0 && t.drop_pct < 100 ? null : 'The drop must be between 0 and 100%.'
  }
  if (t.kind === 'valuation_mos') {
    if (!(t.anchor_value > 0)) return 'Set the fair value this discount is measured against.'
    return t.required_mos_pct >= 0 && t.required_mos_pct <= 95 ? null : 'The discount must be between 0 and 95%.'
  }
  if (!t.label.trim()) return 'Say what happens on that date.'
  return /^\d{4}-\d{2}-\d{2}$/.test(t.due_date) ? null : 'Pick a date.'
}

export function TriggerEditor({
  trigger, currency, onChange, onRemove,
}: {
  trigger: DraftTrigger
  currency: string
  onChange: (t: DraftTrigger) => void
  onRemove: () => void
}) {
  const t = trigger
  const problem = triggerDraftProblem(t, currency)
  return (
    <div className="wlc__trg">
      <div className="wlc__trghead">
        <span className="wlc__trgname">{TRIGGER_LABEL[t.kind]}</span>
        <span className="wlc__trgmode">{t.kind === 'event_date' ? 'reminder' : 'checked live'}</span>
        <button className="btn btn--mini btn--danger" onClick={onRemove} title="Remove this trigger">✕</button>
      </div>

      {problem && <div className="wlc__err">{problem}</div>}

      {t.kind === 'price_level' && (
        <div className="wlc__trgbody">
          <div className="seg" role="group" aria-label="Direction">
            {(['at_or_below', 'at_or_above'] as const).map((d) => (
              <button key={d} className={`seg__btn${t.direction === d ? ' seg__btn--on' : ''}`} onClick={() => onChange({ ...t, direction: d })}>
                {d === 'at_or_below' ? 'at or below' : 'at or above'}
              </button>
            ))}
          </div>
          <label className="wlc__num">
            <input
              className="fld" type="number" step="0.01" min="0" value={t.level || ''}
              onChange={(e) => onChange({ ...t, level: Number(e.target.value) })} aria-label="Price level"
            />
            <span className="wlc__unit">{currency}</span>
          </label>
          <div className="wlc__hint">Met when the price touches the level — inclusive.</div>
        </div>
      )}

      {t.kind === 'pct_drop' && (
        <div className="wlc__trgbody">
          <label className="wlc__num">
            <input
              className="fld" type="number" step="0.5" min="0.5" max="99" value={t.drop_pct || ''}
              onChange={(e) => onChange({ ...t, drop_pct: Number(e.target.value) })} aria-label="Percent drop"
            />
            <span className="wlc__unit">% below</span>
          </label>
          <label className="wlc__num">
            <input
              className="fld" type="number" step="0.01" min="0" value={t.reference.value || ''}
              onChange={(e) => onChange({ ...t, reference: { ...t.reference, value: Number(e.target.value), source: 'my number' } })}
              aria-label="Reference price"
            />
            <span className="wlc__unit">{currency}</span>
          </label>
          <div className="wlc__hint">
            {/* Frozen with its date and source: a reference that drifts can never be reached in a rising
                market, and quietly redefines what the trigger meant. */}
            Reference frozen at {t.reference.as_of ?? 'today'} ({t.reference.source})
            {dropThreshold(t) != null && <> · fires at <b>{currency} {dropThreshold(t)!.toFixed(2)}</b></>}
          </div>
        </div>
      )}

      {t.kind === 'valuation_mos' && (
        <div className="wlc__trgbody">
          <label className="wlc__num">
            <input
              className="fld" type="number" step="0.01" min="0" value={t.anchor_value || ''}
              onChange={(e) => onChange({ ...t, anchor_value: Number(e.target.value) })} aria-label="Fair value"
            />
            <span className="wlc__unit">{currency} fair value</span>
          </label>
          <label className="wlc__num">
            <input
              className="fld" type="number" step="1" min="0" max="95" value={t.required_mos_pct || ''}
              onChange={(e) => onChange({ ...t, required_mos_pct: Number(e.target.value) })} aria-label="Required discount"
            />
            <span className="wlc__unit">% discount required</span>
          </label>
          <div className="wlc__hint">
            {t.run_root
              ? <>Pinned to {t.run_root} — a newer call will be flagged, not silently followed.</>
              : <>No engine valuation pinned. Your own number is your judgment, not the engine's.</>}
          </div>
        </div>
      )}

      {t.kind === 'event_date' && (
        <div className="wlc__trgbody">
          <input
            className="fld fld--date" type="date" value={t.due_date}
            onChange={(e) => onChange({ ...t, due_date: e.target.value })} aria-label="Due date"
          />
          <input
            className="fld" placeholder="Q3 print" value={t.label}
            onChange={(e) => onChange({ ...t, label: e.target.value })} aria-label="What happens then"
          />
          <div className="wlc__hint">Never says “met” — it comes due, sorts to the top, and only you clear it.</div>
        </div>
      )}
    </div>
  )
}
