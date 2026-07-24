// A live readout of what the news scanner is actually doing — is it looking right now, what did the last
// look read / keep / drop, when is the next one, and any warning the engine raised (e.g. "988 items not
// scored — LLM hiccup"). Every field here already streams over /api/news/stream (news-cycle-start +
// news-cycle) or /api/news/status; this only renders what the cockpit used to throw away.
//
// Two variants share one component so the rail and the watch-live panel stay in lockstep:
//   'rail'  — a compact strip under the read/kept/dropped counters.
//   'panel' — the same live line PLUS a recent-looks log and a per-source breakdown of the last look.

import { useEffect, useState } from 'react'
import { useStore } from '../../lib/store'

const agoMin = (iso?: string | null) => (iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000)) : null)
const inMin = (iso?: string | null) => (iso ? Math.round((new Date(iso).getTime() - Date.now()) / 60_000) : null)
const hhmm = (iso?: string | null) => (iso ? new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '')
// compact token count for the per-look log (12345 → "12k", 800 → "800")
const ktok = (n?: number) => (n && n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k` : n ? String(n) : '')

// friendly names for the fetch layers (keyed on each item's `via` provenance)
const SOURCE_LABEL: Record<string, string> = {
  gdelt: 'Global press',
  rss: 'RSS feeds',
  nse: 'India · NSE',
  hkex: 'Hong Kong · HKEX',
  asx: 'Australia · ASX',
  gov: 'Government data',
  reddit: 'Reddit',
  other: 'Other',
}

// A note worth surfacing as a warning — the engine only sets `note` when something capped or slipped
// ("no new on-list items" is the one benign case, and needs no alarm).
const isBenignNote = (n?: string | null) => !n || /^no new on-list items$/i.test(n)

export function ScanStatus({ variant }: { variant: 'rail' | 'panel' }) {
  const status = useStore((s) => s.newsStatus)
  const scanningSince = useStore((s) => s.scanningSince)
  const lastCycle = useStore((s) => s.lastCycle)
  const cycleLog = useStore((s) => s.cycleLog)

  // a slow self-owned clock keeps the relative times ("next look in 3m", "2m ago") honest without leaning
  // on the parent — one 30s interval, cleared on unmount. "Looking now" itself flips via SSE, not this.
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  if (!status) return <div className={`scanstat scanstat--${variant}`}><span className="scanstat__live">checking the scanner…</span></div>
  if (!status.enabled) {
    return (
      <div className={`scanstat scanstat--${variant}`}>
        <span className="scanstat__live scanstat__live--off">Auto-scan off — add a free Groq key to watch the wire</span>
      </div>
    )
  }

  // "Looking now" comes from the news-cycle-start SSE (with its phase). A cycle-start with no matching end
  // within the guard window is stale (a cycle that threw) — don't latch it forever; the server's cycle
  // timeout is a few minutes, so 4 min is a safe ceiling. We ALSO fall back to status.running so a page
  // loaded MID-cycle (the start event already fired) still reads live until the next status refresh.
  const fresh = scanningSince && Date.now() - scanningSince.since < 4 * 60_000
  const looking = fresh || status.running
  const drain = fresh && scanningSince!.phase === 'drain'
  const ago = agoMin(status.lastCycleAt)
  const next = inMin(status.nextCycleAt) // stale (past) values are ignored below

  const liveLine = looking
    ? drain
      ? 'Catching up on the backlog…'
      : 'Looking now — reading the sources…'
    : next != null && next >= 0
      ? `Next look in ~${next === 0 ? '<1' : next}m`
      : ago != null
        ? `Last look ${ago === 0 ? 'just now' : `${ago}m ago`} · looks every ${status.intervalMin}m`
        : 'First look coming up…'

  const lc = lastCycle
  const sourceRows = lc?.sources
    ? Object.entries(lc.sources).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])
    : []

  return (
    <div className={`scanstat scanstat--${variant}`}>
      <div className="scanstat__row">
        <span className={`scanstat__pulse${looking ? ' scanstat__pulse--on' : ''}`} aria-hidden />
        <span className="scanstat__live" aria-live="polite">{liveLine}</span>
      </div>

      {/* LOCAL primary brain — the live token readout, right where the counters are. It is the unlimited $0
          model carrying the whole scan; when the box is offline this flips to a warning (on capped fallback). */}
      {status.local && (() => {
        const l = status.local
        const down = l.health === 'cooling' || (l.cooldownRemainingMs ?? 0) > 0
        return (
          <div
            className={`scanstat__local${down ? ' scanstat__local--down' : ''}`}
            title={down
              ? `Local primary brain (${l.model}) is offline — the box is asleep or unreachable, so the scan is running on the capped cloud fallback. Bring it back and it resumes carrying the whole scan, unlimited and $0.`
              : `Local primary brain (${l.model}) — the unlimited, $0 model scoring the whole scan first, ahead of every cloud and paid tier. ${l.tokens.toLocaleString()} tokens over ${l.requests.toLocaleString()} requests today, no cap.`}
          >
            <span className="scanstat__localdot" data-tone={down ? 'bad' : 'live'} aria-hidden />
            {down ? (
              <span>Local brain <b>offline</b> — on capped fallback, check the box</span>
            ) : (
              <span>Local brain · <b>{l.tokens.toLocaleString()}</b> tokens today · {l.requests.toLocaleString()} reqs<span className="scanstat__localinf"> · unlimited</span></span>
            )}
          </div>
        )
      })()}

      {lc && (lc.fetched > 0 || lc.picked + lc.watched + lc.dropped > 0 ? (
        <div className="scanstat__last" title="The most recent look: raw items read, then how many were kept for you vs dropped as not worth it">
          {/* a drain cycle fetches nothing (it works the backlog), so "read" is only meaningful for a fetch */}
          {lc.phase === 'drain' ? 'Last look sorted the backlog' : <>Last look read <b>{lc.fetched.toLocaleString()}</b></>}
          {' · '}kept <b className="scanstat__kept">{lc.picked + lc.watched}</b>
          {' · '}dropped <b>{lc.dropped.toLocaleString()}</b>
        </div>
      ) : (
        <div className="scanstat__last">Last look: nothing new</div>
      ))}

      {!isBenignNote(status.lastNote) && (
        <div className="scanstat__note" role="status">
          <span aria-hidden>⚠</span> {status.lastNote}
        </div>
      )}

      {variant === 'panel' && sourceRows.length > 0 && (
        <div className="scanstat__sources" aria-label="Where the last look's items came from">
          {sourceRows.map(([via, n]) => (
            <span key={via} className="scanstat__src">
              {SOURCE_LABEL[via] || via}<span className="scanstat__srcn">{n}</span>
            </span>
          ))}
        </div>
      )}

      {variant === 'panel' && cycleLog.length > 1 && (
        <details className="scanstat__log">
          <summary>Recent looks ({cycleLog.length})</summary>
          <div className="scanstat__logrows">
            {cycleLog.slice(0, 12).map((c, i) => (
              <div key={`${c.ts}-${i}`} className="scanstat__logrow">
                <span className="scanstat__logtime">{hhmm(c.ts)}</span>
                <span className="scanstat__logbody">
                  read {c.fetched.toLocaleString()} · kept {c.picked + c.watched} · dropped {c.dropped.toLocaleString()}
                  {c.phase === 'drain' ? ' · backlog' : ''}
                  {c.local_tokens ? <span className="scanstat__loglocal"> · local {ktok(c.local_tokens)} tok</span> : c.local_down ? <span className="scanstat__loglocal scanstat__loglocal--down"> · local offline</span> : ''}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
