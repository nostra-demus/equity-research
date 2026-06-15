// The "Sources" panel — full visibility into every feed the scanner pulls from: when its data last
// arrived and whether it's healthy / quiet / failing / idle. Opened from the Events rail. Read-only;
// fetches /api/news/sources on open + refreshes every 60s. Filters by health + free-text search so you
// can jump straight to "what's red" and tell me what's broken.
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { useStore } from '../../lib/store'
import type { SourceRow, SourcesReport, SourceHealth } from '../../lib/types'

const HEALTH: { id: SourceHealth; label: string; color: string; help: string }[] = [
  { id: 'healthy', label: 'Healthy', color: 'var(--live)', help: 'Fetching fine and bringing news' },
  { id: 'quiet', label: 'Quiet', color: 'var(--accent)', help: 'Working, but no news in the last few days' },
  { id: 'failing', label: 'Failing', color: 'var(--bad)', help: 'The last fetch errored — likely broken' },
  { id: 'idle', label: 'Idle', color: 'var(--neutral)', help: 'Not fetched yet, or low-frequency (can’t tell)' },
]
const colorOf = (h: SourceHealth) => HEALTH.find((x) => x.id === h)!.color

// "3m", "2h", "4d" ago — or "—" when never
function ago(iso: string | null): string {
  if (!iso) return '—'
  const ms = Date.now() - Date.parse(iso)
  if (!Number.isFinite(ms) || ms < 0) return '—'
  const m = Math.floor(ms / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export function SourcesPanel() {
  const close = useStore((s) => s.closeSources)
  const [report, setReport] = useState<SourcesReport | null>(null)
  const [err, setErr] = useState(false)
  const [filter, setFilter] = useState<SourceHealth | 'all'>('all')
  const [q, setQ] = useState('')

  const load = useMemo(() => async () => {
    try { setReport(await api.newsSources()); setErr(false) } catch { setErr(true) }
  }, [])
  useEffect(() => { void load(); const id = setInterval(() => void load(), 60_000); return () => clearInterval(id) }, [load])
  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const rows = useMemo(() => {
    const all = report?.sources || []
    const needle = q.trim().toLowerCase()
    return all.filter((r) => (filter === 'all' || r.health === filter) && (!needle || r.name.toLowerCase().includes(needle)))
  }, [report, filter, q])

  const c = report?.counts

  return (
    <div className="srcov" role="dialog" aria-modal="true" aria-label="News sources health" onClick={close}>
      <div className="srcpanel" onClick={(e) => e.stopPropagation()}>
        <header className="srcpanel__head">
          <div className="srcpanel__titlewrap">
            <span className="srcpanel__title">Sources</span>
            <span className="srcpanel__sub">{c ? `${c.total} feeds · ${(() => { const a = ago(report!.updated_at); return a === 'now' ? 'updated just now' : `updated ${a} ago` })()}` : 'loading…'}</span>
          </div>
          <button type="button" className="srcpanel__close" onClick={close} aria-label="Close" title="Close (Esc)">✕</button>
        </header>

        {/* filter chips — tap a health to narrow; counts live */}
        <div className="srcpanel__filters" role="group" aria-label="Filter by health">
          <button type="button" className={`srcchip${filter === 'all' ? ' srcchip--on' : ''}`} onClick={() => setFilter('all')} aria-pressed={filter === 'all'}>
            All{c ? ` ${c.total}` : ''}
          </button>
          {HEALTH.map((h) => {
            const n = c ? (c as any)[h.id] as number : 0
            return (
              <button key={h.id} type="button" className={`srcchip${filter === h.id ? ' srcchip--on' : ''}`} onClick={() => setFilter(filter === h.id ? 'all' : h.id)} aria-pressed={filter === h.id} title={h.help} disabled={!n && filter !== h.id}>
                <span className="srcchip__dot" style={{ background: h.color }} aria-hidden />
                {h.label}{c ? ` ${n}` : ''}
              </button>
            )
          })}
          <input className="srcpanel__search" type="search" placeholder="Search a source…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search sources" />
        </div>

        <div className="srcpanel__body">
          {err && !report ? (
            <div className="srcpanel__empty">Couldn’t reach the engine. Retrying every 60s…</div>
          ) : !report ? (
            <div className="srcpanel__empty">Reading source health…</div>
          ) : rows.length === 0 ? (
            <div className="srcpanel__empty">{q ? `No source matches “${q}”.` : `Nothing ${filter === 'all' ? '' : filter}.`}</div>
          ) : (
            <ul className="srclist">
              {rows.map((r) => <SourceRowItem key={`${r.via}:${r.name}`} r={r} />)}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function SourceRowItem({ r }: { r: SourceRow }) {
  const color = colorOf(r.health)
  return (
    <li className="srcrow" title={r.last_error ? `Last error: ${r.last_error}` : HEALTH.find((h) => h.id === r.health)?.help}>
      <span className="srcrow__dot" style={{ background: color, boxShadow: r.health === 'healthy' ? `0 0 6px ${color}` : 'none' }} aria-hidden />
      <div className="srcrow__main">
        <div className="srcrow__name">{r.name}</div>
        <div className="srcrow__meta">
          {r.region !== '—' ? `${r.region} · ` : ''}{r.feed_type}{r.via !== 'rss' ? ` · ${r.via}` : ''}
          {r.last_error ? <span className="srcrow__err"> · {r.last_error.slice(0, 48)}</span> : null}
        </div>
      </div>
      <div className="srcrow__right">
        <span className="srcrow__ago" title="When data from this source last arrived">{ago(r.last_data_at)}</span>
        {r.items_24h > 0 && <span className="srcrow__count" title="Items in the last 24h">{r.items_24h}/24h</span>}
      </div>
    </li>
  )
}
