// The switcher: swarm tabs + searchable subject rows. Data-driven end to end (§26): tabs come from
// /api/swarms sorted by their own `order`, labels from the manifest — a 4th swarm appears with zero
// edits here (the SubjectPicker idiom, NOT CommandBar's hardcoded strings). Rows come from the
// per-swarm source the data actually lives in — verified, deliberately different:
//   research  — /api/tickers (verdict/confidence already on latestRun)
//   screener  — the BOARD INDEX only (signals have no decision records; the generic subjects endpoint
//               returns null verdicts for all of them) + a pinned News-wire row (the desktop Ask menu's
//               second option)
//   any other — /api/swarm/subjects summaries (server applies red-team caps before we see them)
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { decisionColor } from '../../lib/format'
import type { SwarmMeta } from '../../lib/types'
import { Sheet } from './Sheet'

export interface SubjectChoice {
  swarm: string
  subject: string
  /** screener only: the board headline, used as the chat title + card */
  headline?: string
  /** the pinned News-wire row */
  newsWire?: boolean
}

interface Row {
  subject: string
  label: string
  pill?: string
  pillColor?: string
  sub?: string
  headline?: string
}

export function SubjectSheet({ open, swarms, current, onPick, onClose, onDesktop }: {
  open: boolean
  swarms: SwarmMeta[]
  current: { swarm: string; subject: string } | null
  onPick: (c: SubjectChoice) => void
  onClose: () => void
  onDesktop: () => void
}) {
  const ordered = useMemo(() => [...swarms].sort((a, b) => (a.order ?? 99) - (b.order ?? 99)), [swarms])
  const [tab, setTab] = useState<string | null>(null)
  const activeTab = tab ?? current?.swarm ?? ordered[0]?.id ?? 'research'
  const [q, setQ] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    let dead = false
    setLoading(true)
    setRows([])
    void (async () => {
      try {
        const meta = ordered.find((s) => s.id === activeTab)
        if (activeTab === 'research') {
          const t = await api.tickers()
          if (dead) return
          setRows(
            (t.tickers || []).map((x) => ({
              subject: x.ticker,
              label: x.ticker,
              pill: x.latestRun?.decision ? `${x.latestRun.decision}${x.latestRun.confidence != null ? ` · ${x.latestRun.confidence}` : ''}` : undefined,
              pillColor: x.latestRun?.decision ? decisionColor(x.latestRun.decision) : undefined,
              sub: x.latestRun ? undefined : `${x.fileCount ?? 0} files · no run`,
            })),
          )
        } else if (meta?.layout === 'flow') {
          // a flow swarm's unit is event-shaped: rows come from its board, joined signals×theses
          const b = await api.screenerBoard()
          if (dead) return
          const bySig = new Map((b.theses || []).map((t) => [t.signal_id, t]))
          setRows(
            (b.signals || [])
              .filter((s) => s.processed_at)
              .map((s) => {
                const t = bySig.get(s.signal_id)
                const headline = t?.headline_en || t?.headline || s.headline_en || s.headline || s.signal_id
                const edge = t?.conviction?.edge_score_live ?? t?.edge_score
                const routing = (t as any)?.effective_status || t?.status || s.status
                return {
                  subject: s.signal_id,
                  label: headline,
                  headline,
                  pill: routing ? `${routing}${edge != null ? ` · ${edge}` : ''}` : undefined,
                  sub: s.source_name,
                }
              }),
          )
        } else {
          const r = await api.swarmSubjects(activeTab)
          if (dead) return
          setRows(
            (r.summaries || []).map((x) => ({
              subject: x.subject,
              label: x.subject,
              pill: x.verdict ? `${x.verdict}${x.confidence != null ? ` · ${x.confidence}` : ''}` : undefined,
              pillColor: x.verdict ? decisionColor(x.verdict) : undefined,
              sub: x.hasRun ? undefined : 'no run yet — profile only',
            })),
          )
        }
      } catch {
        if (!dead) setRows([])
      } finally {
        if (!dead) setLoading(false)
      }
    })()
    return () => { dead = true }
  }, [open, activeTab, ordered])

  const meta = ordered.find((s) => s.id === activeTab)
  const isFlow = meta?.layout === 'flow'
  const filtered = q.trim()
    ? rows.filter((r) => (r.label + ' ' + r.subject).toLowerCase().includes(q.trim().toLowerCase()))
    : rows

  return (
    <Sheet open={open} onClose={onClose} label="Choose what to ask about">
      <div className="msheet__tabs">
        {ordered.map((s) => (
          <button key={s.id} className={`msheet__tab${s.id === activeTab ? ' msheet__tab--on' : ''}`} onClick={() => { setTab(s.id); setQ('') }}>
            {s.label}
          </button>
        ))}
      </div>
      <input className="msheet__search" placeholder={`Search ${meta?.unit ?? 'subject'}s…`} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="msheet__list">
        {isFlow && (
          /* the desktop ScreenerAskMenu's SECOND option, pinned: the news wire is its own closed book */
          <button className="msheet__row msheet__row--wire" onClick={() => onPick({ swarm: activeTab, subject: 'news', newsWire: true })}>
            <span className="msheet__rowlabel">News wire</span>
            <span className="msheet__rowsub">the last 24 hours, 7 days, or all saved news</span>
          </button>
        )}
        {loading && <div className="msheet__empty">Loading…</div>}
        {!loading && filtered.length === 0 && <div className="msheet__empty">{q ? `Nothing matches “${q}”` : 'Nothing here yet'}</div>}
        {filtered.map((r) => (
          <button
            key={r.subject}
            className={`msheet__row${current?.subject === r.subject && current?.swarm === activeTab ? ' msheet__row--on' : ''}`}
            onClick={() => onPick({ swarm: activeTab, subject: r.subject, headline: r.headline })}
          >
            <span className={`msheet__rowlabel${isFlow ? ' msheet__rowlabel--wrap' : ' mono'}`}>{r.label}</span>
            {r.pill ? <span className="msheet__pill" style={r.pillColor ? { color: r.pillColor } : undefined}>{r.pill}</span> : r.sub ? <span className="msheet__rowsub">{r.sub}</span> : null}
          </button>
        ))}
      </div>
      <button className="msheet__foot" onClick={onDesktop}>Use desktop site</button>
    </Sheet>
  )
}
