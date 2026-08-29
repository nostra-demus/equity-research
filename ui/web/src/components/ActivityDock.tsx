// ACTIVITY — one surface for everything the system does.
//
// This used to be two: a live "run panel" docked beside the stage, and an "Activity log" overlay that slid
// over it. They answered the same question at different tenses — what is running vs what has run — with two
// buttons, two mental models, and the same run appearing in both. Reading one never told you about the
// other, and the log's overlay covered the very stage whose progress you had just been watching.
//
// Now: NOW on top (live cards, progress, cancel), HISTORY beneath it (the perpetual audit), in a dock that
// sits IN the layout rather than over it — the stage shrinks beside it, so nothing is ever covered. It opens
// itself the moment anything runs, and you can drag its edge to whatever width the moment calls for: narrow
// to keep an eye on progress while you work, wide to read the audit table in full. Every element adapts to
// that width by container query, so there is no width at which the dock looks broken.

import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { anyLive as anyLiveIn, pendingForScope, runsForScope } from '../lib/runScope'
import { RunNowSection } from './RunStreamPanel'
import { ActivityHistory } from './ActivityLog'
import { MIN_W, MAX_FRACTION, DEFAULT_W, clampWidthPx, resolveInitialWidth } from '../lib/dockWidth'

// Width math (bounds, clamp, initial-read) is pure and unit-tested in ../lib/dockWidth; here we only bind
// it to the live `window` / `localStorage`.
const STORE_KEY = 'nsw.activityWidth'

const clampWidth = (px: number): number => clampWidthPx(px, window.innerWidth)

function readStoredWidth(): number {
  // Clamp on read too: a width saved on a larger monitor must not paint past the ceiling on a smaller
  // screen before the first resize fires (clamping only on resize/drag left the initial paint too wide).
  try { return resolveInitialWidth(localStorage.getItem(STORE_KEY), window.innerWidth) }
  catch { return DEFAULT_W }
}

export function ActivityDock() {
  const open = useStore((s) => s.activityOpen)
  const openActivity = useStore((s) => s.openActivity)
  const closeActivity = useStore((s) => s.closeActivity)
  const activeRuns = useStore((s) => s.activeRuns)
  const launchPending = useStore((s) => s.launchPending)
  const pendingAdmissions = useStore((s) => s.pendingAdmissions)
  const refreshPendingAdmissions = useStore((s) => s.refreshPendingAdmissions)
  const ticker = useStore((s) => s.selectedTicker)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const scSelectedSignal = useStore((s) => s.scSelectedSignal)

  const runs = runsForScope(activeRuns, activeSwarm, ticker)
  const pending = pendingForScope(launchPending, activeSwarm, ticker)
  const queuedHere = activeSwarm === 'research'
    ? pendingAdmissions.filter((request) => !ticker || request.ticker === ticker)
    : []
  const waitingHere = queuedHere.filter((request) => request.status === 'waiting_for_update' || request.status === 'admitting')
  const live = anyLiveIn(runs, pending) || waitingHere.length > 0

  useEffect(() => {
    void refreshPendingAdmissions()
    const timer = window.setInterval(() => { void refreshPendingAdmissions() }, 3_000)
    return () => window.clearInterval(timer)
  }, [refreshPendingAdmissions])

  // Anything going live opens the dock — the "whenever things are run, this pops up" rule. It stays open
  // when the run finishes (the flag is set while live, not toggled on the finish transition), so you keep
  // looking at the result instead of watching the panel vanish at the moment it became interesting.
  useEffect(() => { if (live && !open) openActivity() }, [live, open, openActivity])
  // Esc closes — but never out from under a live run, which would hide the progress it just opened for.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !live) closeActivity() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, live, closeActivity])

  // ---- width: dragged, persisted, and clamped to the viewport ----
  const [width, setWidth] = useState(readStoredWidth)
  const [dragging, setDragging] = useState(false)
  const widthRef = useRef(width)
  widthRef.current = width
  const commitWidth = useCallback((px: number) => {
    const w = clampWidth(px)
    setWidth(w)
    try { localStorage.setItem(STORE_KEY, String(w)) } catch { /* private mode */ }
  }, [])
  // A viewport that shrinks below the stored width must not leave the dock wider than its ceiling.
  useEffect(() => {
    const onResize = () => { const c = clampWidth(widthRef.current); if (c !== widthRef.current) setWidth(c) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    // Capture the pointer so the drag survives leaving the 10px handle — without it, moving fast enough to
    // outrun the handle drops the drag mid-gesture.
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    commitWidth(window.innerWidth - e.clientX) // the dock is right-anchored: width = distance to the right edge
  }
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    setDragging(false)
  }
  // Keyboard resizing, so the handle is not a mouse-only control.
  const onHandleKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 80 : 24
    if (e.key === 'ArrowLeft') { e.preventDefault(); commitWidth(widthRef.current + step) }
    else if (e.key === 'ArrowRight') { e.preventDefault(); commitWidth(widthRef.current - step) }
    else if (e.key === 'Home') { e.preventDefault(); commitWidth(DEFAULT_W) }
  }

  const [hist, setHist] = useState<{ runCount: number; allTime: number; historySince: string | null; loading: boolean }>({ runCount: 0, allTime: 0, historySince: null, loading: true })
  const onHistLoaded = useCallback((s: typeof hist) => setHist(s), [])

  if (!open) return null

  const scope = activeSwarm === 'screener' ? (scSelectedSignal ? `Screener · ${scSelectedSignal}` : 'Screener') : ticker || 'No company selected'
  const liveCount = runs.filter((r) => r.status === 'running' || r.status === 'starting' || r.status === 'readiness-checking' || r.status === 'awaiting-readiness-decision').length + waitingHere.length

  return (
    <aside
      className={`adock${dragging ? ' adock--dragging' : ''}`}
      style={{ width }}
      aria-label="Activity — what is running now and everything that has run"
    >
      {/* Drag the edge to resize. `separator` with aria-valuenow is the ARIA pattern for a splitter, so a
          screen reader announces it as a resizable divider rather than a decorative strip. */}
      <div
        className="adock__grip"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize the activity panel"
        aria-valuenow={width}
        aria-valuemin={MIN_W}
        aria-valuemax={Math.round(window.innerWidth * MAX_FRACTION)}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onHandleKey}
        onDoubleClick={() => commitWidth(DEFAULT_W)}
        title="Drag to resize · double-click to reset · ← → to nudge"
      >
        <span className="adock__gripline" aria-hidden />
      </div>

      <header className="adock__head">
        <div className="adock__headmain">
          <div className="adock__title">
            Activity
            {live && <span className="adock__livedot" aria-hidden />}
          </div>
          <div className="adock__sub">
            {live
              ? `${liveCount || 1} waiting or running · ${scope}`
              : hist.loading
                ? scope
                : `${scope} · ${hist.allTime} run${hist.allTime === 1 ? '' : 's'} ever`}
          </div>
        </div>
        {/* Closing is allowed whenever nothing is live — a live run keeps the dock pinned so the progress
            it opened for cannot be dismissed by accident. Reopen any time from "Activity" in the top bar. */}
        {!live && (
          <button type="button" className="sidepanel__close" onClick={closeActivity} aria-label="Close activity" title="Close — reopen from “Activity” in the top bar">✕</button>
        )}
      </header>

      <div className="adock__scroll">
        <section className="adock__section" aria-label="Running now">
          <h3 className="adock__legend">
            Now
            {live && <span className="adock__legendnote">live</span>}
          </h3>
          <RunNowSection />
        </section>

        <section className="adock__section adock__section--history" aria-label="Run history">
          <h3 className="adock__legend">
            History
            {!hist.loading && <span className="adock__legendnote">{hist.runCount} shown</span>}
          </h3>
          <ActivityHistory onLoaded={onHistLoaded} />
        </section>
      </div>
    </aside>
  )
}
