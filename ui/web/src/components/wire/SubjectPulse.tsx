// The SUBJECT PULSE strip — the wire's structured-data layer. A compact horizontal read across the
// wire's subjects: last price + day move, speculative positioning (CFTC managed-money net + week move),
// the next scheduled report, and the last run's verdict. Rendered above the resting main view when the
// wire declares a pulse; each field renders ONLY when the server actually has it (absent = not shown —
// never a fake number, mirroring the server's own honesty rule). Numbers are mono; colors are tokens.
//
// States: skeleton shimmer while the first snapshot loads → per-field omission → a quiet strip-level
// line when the snapshot is stale or missing entirely, with a retry. The strip never blocks the rail.

import { useEffect } from 'react'
import { useStore } from '../../lib/store'
import type { WirePulseSubject } from '../../lib/wire'
import { useWireConfig } from './WireContext'

const pct = (v: number | null): string => (v == null ? '' : `${v > 0 ? '+' : ''}${v.toFixed(2)}%`)
const compact = (v: number): string => Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(v)
const price = (v: number): string => Intl.NumberFormat('en', { maximumFractionDigits: v >= 100 ? 1 : 2 }).format(v)
// "WASDE · Fri 17 Jul" — or just the name when no date is derivable (cadence-only entries)
function nextReportLabel(s: WirePulseSubject): string | null {
  const withDate = (s.reports || []).filter((r) => r.next).sort((a, b) => (a.next! < b.next! ? -1 : 1))[0]
  if (!withDate) return null
  const d = new Date(`${withDate.next}T00:00:00`)
  return `${withDate.name} · ${d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}`
}

function PulseCard({ subject, data, running, onRun }: { subject: string; data: WirePulseSubject | undefined; running: boolean; onRun: () => void }) {
  const report = data ? nextReportLabel(data) : null
  const chg = data?.price?.change_pct ?? null
  return (
    <div className={`subjectpulse__card${running ? ' subjectpulse__card--running' : ''}`}>
      <div className="subjectpulse__toprow">
        <span className="subjectpulse__name">{subject}</span>
        {data?.verdict && <span className={`subjectpulse__action subjectpulse__action--${data.verdict.action.toLowerCase().replace(/\s+/g, '-')}`}>{data.verdict.action}</span>}
      </div>
      {data?.price ? (
        <div className="subjectpulse__price" title={`${data.price.symbol} · ${data.price.unit} · as of ${data.price.as_of} · ${data.price.source}`}>
          <span className="subjectpulse__last">{price(data.price.last)}</span>
          {chg != null && <span className={`subjectpulse__chg subjectpulse__chg--${chg >= 0 ? 'up' : 'down'}`}>{pct(chg)}</span>}
          <span className="subjectpulse__unit">{data.price.unit}</span>
        </div>
      ) : (
        <div className="subjectpulse__price subjectpulse__price--none">no quote</div>
      )}
      <div className="subjectpulse__meta">
        {data?.cot && (
          <span title={`CFTC managed-money net position (long − short contracts), report ${data.cot.report_date}. The week-on-week move shows whether speculators are adding or cutting.`}>
            spec {compact(data.cot.managed_money_net)}{data.cot.change != null ? ` (${data.cot.change >= 0 ? '+' : ''}${compact(data.cot.change)} w/w)` : ''}
          </span>
        )}
        {report && <span title="The next scheduled report that moves this commodity">{report}</span>}
      </div>
      <button type="button" className="subjectpulse__run" onClick={onRun} disabled={running} title={running ? 'A full run is already in flight' : `Run the full research pipeline on ${subject}`}>
        {running ? 'running…' : 'Run full ▸'}
      </button>
    </div>
  )
}

export function SubjectPulse() {
  const cfg = useWireConfig()
  const pulse = useStore((s) => s.wirePulse)
  const pulseAt = useStore((s) => s.wirePulseAt)
  const stale = useStore((s) => s.wirePulseStale)
  const refresh = useStore((s) => s.refreshWirePulse)
  const activeRuns = useStore((s) => s.activeRunsByTicker)
  const requestFullForSubject = useStore((s) => s.requestFullForSubject)
  useEffect(() => { void refresh() }, [refresh])
  if (!cfg.pulse) return null
  const loading = pulseAt === null
  const empty = !loading && Object.keys(pulse).length === 0
  return (
    <div className="subjectpulse" role="region" aria-label="Per-subject market pulse">
      {loading ? (
        // skeleton shimmer — sized like real cards so nothing jumps when data lands
        Array.from({ length: 6 }, (_, i) => <div key={i} className="subjectpulse__card subjectpulse__card--skeleton" aria-hidden />)
      ) : empty ? (
        <div className="subjectpulse__note">
          pulse unavailable · <button type="button" className="subjectpulse__retry" onClick={() => void refresh(true)}>retry ▸</button>
        </div>
      ) : (
        <>
          {cfg.subjects.map((s) => (
            <PulseCard key={s} subject={s} data={pulse[s]} running={activeRuns.has(s)} onRun={() => void requestFullForSubject(s)} />
          ))}
          {stale && <div className="subjectpulse__note" title="The engine could not refresh one of its sources just now — showing the last good read">showing last good read</div>}
        </>
      )}
    </div>
  )
}
