// What a research name is waiting for — its watch plan — in the detail panel.
//
// Every item shows where it came from: the research's own words (and the file they are in), or the field of
// the decision record it was read from. Anything the reader found but did not keep is listed with the reason,
// never hidden — a plan that silently dropped an item would look more certain than it is (§3).
import { ROLE_LABEL, planStateWords, priceItemText, shortDate } from '../../lib/watchStatus'
import type { WatchPlanItem, WatchPlanSource, WatchRow } from '../../lib/types'

function Source({ src }: { src: WatchPlanSource }) {
  return (
    <>
      {src.quote && <q className="wplan__quote">{src.quote}</q>}
      <span className="wplan__src">{src.field ? `${src.file} · ${src.field}` : src.file}</span>
    </>
  )
}

export function WatchPlanSection({ row }: { row: WatchRow }) {
  const p = row.watch?.plan
  if (!p) return null
  const of = <K extends WatchPlanItem['kind']>(k: K) => p.items.filter((i): i is Extract<WatchPlanItem, { kind: K }> => i.kind === k)
  const prices = of('price')
  const dates = of('date')
  const waits = of('waiting_for')
  const deals = of('deal_breaker')
  const news = of('news')

  return (
    <section className="wdet__sec" aria-label="What it is waiting for">
      <h4 className="wdet__seclabel">What it's waiting for</h4>
      <div className={`wplan__state${p.state === 'failed' || p.state === 'budget' ? ' wplan__state--bad' : ''}`}>{planStateWords(p)}</div>

      {prices.length > 0 && (
        <ul className="wplan__list">
          {prices.map((i) => (
            <li key={i.id} className="wplan__item">
              <span className="wplan__line">
                <span className={`wplan__role wplan__role--${i.role}`}>{ROLE_LABEL[i.role]}</span>
                <span className="wplan__val">{priceItemText(i)}</span>
              </span>
              <Source src={i.source} />
              {i.note && <span className="wplan__note">{i.note}</span>}
            </li>
          ))}
        </ul>
      )}

      {dates.length > 0 && (
        <div className="wplan__group">
          <div className="wplan__grouphead">Dates</div>
          <ul className="wplan__list">
            {dates.map((i) => (
              <li key={i.id} className="wplan__item">
                <span className="wplan__line">
                  <span className="wplan__text"><b>{i.label}</b></span>
                  <span className="wplan__val">{i.date ? shortDate(i.date) : i.window ?? 'no exact day'}</span>
                </span>
                {i.what_to_check && <span className="wplan__text">Look for: {i.what_to_check}</span>}
                <Source src={i.source} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {waits.length > 0 && (
        <div className="wplan__group">
          <div className="wplan__grouphead">Waiting to see</div>
          <ul className="wplan__list">
            {waits.map((i) => (
              <li key={i.id} className="wplan__item">
                <span className="wplan__text">{i.text}</span>
                <Source src={i.source} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {deals.length > 0 && (
        <div className="wplan__group">
          <div className="wplan__grouphead">Deal-breakers</div>
          <ul className="wplan__list">
            {deals.map((i) => (
              <li key={i.id} className="wplan__item">
                <span className="wplan__text">{i.text}</span>
                {i.check_where && <span className="wplan__src">Check in: {i.check_where}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {news.length > 0 && (
        <div className="wplan__group">
          <div className="wplan__grouphead">News that would matter</div>
          <ul className="wplan__list">
            {news.map((i) => (
              <li key={i.id} className="wplan__item">
                <span className="wplan__text">{i.topic}</span>
                <Source src={i.source} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {p.left_out.length > 0 && (
        <details className="wplan__left">
          <summary>{p.left_out.length} {p.left_out.length === 1 ? 'thing' : 'things'} left out, and why</summary>
          <ul>
            {p.left_out.map((l, n) => <li key={n}><b>{l.what}</b> — {l.why}</li>)}
          </ul>
        </details>
      )}
    </section>
  )
}
