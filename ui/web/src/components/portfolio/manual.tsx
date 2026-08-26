// Trades logged by hand, for the gap between the last export and now.
//
// The whole surface is built around one honesty rule: these are PROVISIONAL. Nothing typed here reaches
// the book or the reconciliation checks — the eight checks on every screen still say what the broker
// says. So the screen never blends a hand-entered fill into a reconciled number. It shows the entries
// apart, shows what they WOULD do to each position, and marks them answered the moment a statement
// covers their date.
//
// Two deliberate refusals:
//  · No NAV or return impact is shown. Those need a mark, an FX rate and a settled commission, none of
//    which exist for a fill the book has not seen — a provisional NAV would be a made-up number in the
//    one place the operator is most likely to trust it.
//  · Cash effect is never summed across currencies. Two entries in USD and GBP have no common total.

import { useState } from 'react'
import { api } from '../../lib/api'
import type { PortfolioManualEffect, PortfolioManualRead, PortfolioManualTrade, PortfolioRead } from '../../lib/types'

const todayISO = (): string => {
  // Local date, not UTC: a fill at 6pm New York is still today to the person typing it, and
  // toISOString() would date it tomorrow.
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** The typographic minus the rest of the cockpit uses — a hyphen next to tabular figures reads as a
 *  dash, not a sign. */
const fmtQty = (v: number): string =>
  `${v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 4 })}`
const fmtCash = (v: number, ccy: string): string =>
  `${v < 0 ? '−' : '+'}${ccy === 'USD' ? '$' : ''}${Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}${ccy === 'USD' ? '' : ` ${ccy}`}`

/** The form. Every field is validated by the ENGINE, not here — one set of rules for every caller — so
 *  this only shapes the request and shows back whatever the engine refuses. */
export function LogTradeForm({ baseCurrency, onDone, onCancel }: {
  baseCurrency: string | null
  onDone: (read: PortfolioRead) => void
  onCancel: () => void
}) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState(baseCurrency ?? 'USD')
  const [tradeDate, setTradeDate] = useState(todayISO())
  const [commission, setCommission] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true); setError(null)
    try {
      onDone(await api.logManualTrade({
        symbol, side,
        quantity: Number(quantity), price: Number(price),
        currency, tradeDate,
        commission: commission === '' ? 0 : Number(commission),
        note: note.trim() || null,
      }))
    } catch (err: any) {
      setError(err?.message || 'that entry could not be logged')
    } finally { setBusy(false) }
  }

  return (
    <form className="fundbook__form" onSubmit={submit}>
      <div className="fundbook__formrow">
        <label className="fundbook__field fundbook__field--side">
          <span>Side</span>
          <div className="fundbook__sides" role="group" aria-label="Side">
            {(['buy', 'sell'] as const).map((s) => (
              <button key={s} type="button" aria-pressed={side === s}
                className={`fundbook__side${side === s ? ` is-on is-${s}` : ''}`} onClick={() => setSide(s)}>
                {s === 'buy' ? 'Bought' : 'Sold'}
              </button>
            ))}
          </div>
        </label>
        <label className="fundbook__field">
          <span>Symbol</span>
          <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="AMZN" autoFocus
            autoCapitalize="characters" autoCorrect="off" spellCheck={false} required />
        </label>
        <label className="fundbook__field">
          <span>Quantity</span>
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} inputMode="decimal" placeholder="10" required />
        </label>
        <label className="fundbook__field">
          <span>Price</span>
          <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="190.50" required />
        </label>
        <label className="fundbook__field fundbook__field--ccy">
          <span>Currency</span>
          <input value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={3}
            autoCapitalize="characters" autoCorrect="off" spellCheck={false} required />
        </label>
      </div>
      <div className="fundbook__formrow">
        <label className="fundbook__field">
          <span>Trade date</span>
          <input type="date" value={tradeDate} max={todayISO()} onChange={(e) => setTradeDate(e.target.value)} required />
        </label>
        <label className="fundbook__field">
          <span>Commission</span>
          <input value={commission} onChange={(e) => setCommission(e.target.value)} inputMode="decimal" placeholder="0" />
        </label>
        <label className="fundbook__field fundbook__field--wide">
          <span>Note <i>optional</i></span>
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="why, or anything to check against the fill" />
        </label>
      </div>
      {error && <div className="fundbook__formerror">{error}</div>}
      <div className="fundbook__formfoot">
        <span>
          Provisional until a statement covers <b>{tradeDate || 'that date'}</b>. It never enters the
          reconciled book — it says what the book <em>will</em> hold.
        </span>
        <div className="fundbook__formbtns">
          <button type="button" className="fundbook__btn" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="submit" className="fundbook__btn is-primary" disabled={busy}>{busy ? 'Logging…' : 'Log it'}</button>
        </div>
      </div>
    </form>
  )
}

/** What the live entries would do to each position — the reason to log them at all. */
export function ProvisionalEffects({ effects, compact }: { effects: PortfolioManualEffect[]; compact?: boolean }) {
  if (effects.length === 0) return null
  return (
    <>
      <div className="fundbook__row fundbook__row--effect fundbook__row--head">
        <span>Symbol</span><span className="num">In the book</span><span className="num">Logged</span>
        <span className="num">Would hold</span><span className="num">Cash</span>
      </div>
      {effects.map((e) => (
        <div key={`${e.symbol}-${e.currency}`} className="fundbook__row fundbook__row--effect">
          <strong className="mono">
            {e.symbol}
            {e.crossesZero && <small className="fundbook__warnflag">takes the position through zero</small>}
          </strong>
          <span className="num dim">{e.bookQuantity === null ? 'not held' : fmtQty(e.bookQuantity)}</span>
          <span className="num" style={{ color: e.delta < 0 ? 'var(--bad)' : 'var(--good)' }}>
            {e.delta >= 0 ? '+' : '−'}{fmtQty(Math.abs(e.delta))}
          </span>
          <strong className="num">{fmtQty(e.provisionalQuantity)}</strong>
          <span className="num dim">{fmtCash(e.cashEffect, e.currency)}</span>
        </div>
      ))}
      {!compact && (
        <div className="fundbook__foot">
          Quantities only — a NAV or return from a hand-entered fill would need a mark, an FX rate and a
          settled commission, none of which exist until the statement arrives.
        </div>
      )}
    </>
  )
}

/** The entries themselves — live first, then the ones a statement has already answered. */
export function ManualTradeList({ manual, baseCurrency, onChanged }: {
  manual: PortfolioManualRead
  baseCurrency: string | null
  onChanged: (read: PortfolioRead) => void
}) {
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const live = manual.trades.filter((t) => !t.supersededBy)
  const answered = manual.trades.filter((t) => t.supersededBy)

  const remove = async (id: string) => {
    setBusyId(id); setError(null)
    try { onChanged(await api.deleteManualTrade(id)) }
    catch (e: any) { setError(e?.message || 'could not remove that entry') }
    finally { setBusyId(null) }
  }

  return (
    <>
      {error && <div className="fundbook__formerror">{error}</div>}
      {live.length > 0 && (
        <>
          <div className="fundbook__row fundbook__row--manual fundbook__row--head">
            <span>Date</span><span>Symbol</span><span>Side</span><span className="num">Qty</span>
            <span className="num">Price</span><span className="num">Commission</span><span className="num">Cash</span><span />
          </div>
          {live.map((t) => (
            <ManualRow key={t.id} t={t} busy={busyId === t.id} onRemove={() => void remove(t.id)} />
          ))}
        </>
      )}

      {answered.length > 0 && (
        <>
          <div className="fundbook__subhead fundbook__subhead--split">
            <span>
              <b>{answered.length}</b> answered by a statement — the broker&rsquo;s own record now covers
              {answered.length === 1 ? ' that date' : ' those dates'}, so {answered.length === 1 ? 'it no longer counts' : 'they no longer count'}.
              Kept until you clear {answered.length === 1 ? 'it' : 'them'}, in case one was never executed.
            </span>
            <button className="fundbook__btn" disabled={clearing} onClick={async () => {
              setClearing(true); setError(null)
              try { onChanged(await api.clearSupersededManual()) }
              catch (e: any) { setError(e?.message || 'could not clear those entries') }
              finally { setClearing(false) }
            }}>
              {clearing ? 'Clearing…' : `Clear ${answered.length}`}
            </button>
          </div>
          {answered.map((t) => (
            <ManualRow key={t.id} t={t} answered busy={busyId === t.id} onRemove={() => void remove(t.id)} />
          ))}
        </>
      )}

      {manual.trades.length === 0 && (
        <div className="fundbook__none">
          Nothing logged by hand. Use this for fills taken since the last export — they show what the book
          will hold, and clear themselves out of the way when the statement covering them arrives.
          {baseCurrency && ` Amounts are entered in the trade's own currency, not ${baseCurrency}.`}
        </div>
      )}
    </>
  )
}

function ManualRow({ t, answered, busy, onRemove }: {
  t: PortfolioManualTrade; answered?: boolean; busy: boolean; onRemove: () => void
}) {
  return (
    <div className={`fundbook__row fundbook__row--manual${answered ? ' is-answered' : ''}`}>
      <span className="dim mono">{t.tradeDate}</span>
      <strong className="mono">{t.symbol}</strong>
      <span className={t.side === 'sell' ? 'fundbook__sold' : 'fundbook__bought'}>{t.side === 'buy' ? 'Bought' : 'Sold'}</span>
      <span className="num">{fmtQty(t.quantity)}</span>
      <span className="num dim">{t.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
      <span className="num dim">{t.commission ? t.commission.toFixed(2) : '—'}</span>
      <span className="num dim">{fmtCash(t.cashEffect, t.currency)}</span>
      <span className="fundbook__manualend">
        {answered && <small title={`Covered by ${t.supersededBy!.filename} (${t.supersededBy!.from} → ${t.supersededBy!.to})`}>in {t.supersededBy!.filename}</small>}
        <button className="fundbook__remove" disabled={busy} onClick={onRemove}>{busy ? '…' : 'Remove'}</button>
      </span>
      {t.note && <span className="fundbook__manualnote">{t.note}</span>}
    </div>
  )
}
