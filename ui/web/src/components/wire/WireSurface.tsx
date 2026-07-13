// The SHARED wire composition — the one rail+main arrangement every wire-bearing swarm renders. The
// screener's flow stage delegates here (behavior-identical to its old inline layout); any constellation
// swarm whose manifest declares `wire:` renders the same surface with its own `home` (the constellation)
// as the resting main view. This file IS the "no fork" guarantee: a change to the wire's composition
// lands on every swarm at once (ui/web/DESIGN.md, shared-surfaces registry).
//
// The divider does double duty: DRAG it to widen the rail (read the incoming wire in a full multi-column
// view — the list re-flows into cards via a container query once the rail is wide enough, no JS breakpoint),
// or CLICK it to tuck the rail away so the home view gets the full stage. Both the width and the tucked flag
// persist per swarm. Width is direct manipulation, so it is not a CSS animation; the tuck swaps width
// instantly and fades content (transform/opacity only, per the motion doctrine). Reading flows are
// unchanged: pick an event → the reader takes the main pane; Themes → the map/board.

import { useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { useStore } from '../../lib/store'
import type { WireConfig } from '../../lib/wire'
import { BestIdeasView } from '../screener/BestIdeasView'
import { CalendarView } from '../screener/CalendarView'
import { CompanyView } from '../screener/CompanyView'
import { EventDetail } from '../screener/EventDetail'
import { EventRail } from '../screener/EventRail'
import { ThemesView } from '../screener/ThemesView'
import { SubjectPulse } from './SubjectPulse'
import { WireProvider } from './WireContext'

const RAIL_MIN = 300 // the resting rail still reads well down to here
const RAIL_DEFAULT = 360
// The 78% clamp is against the actual available width, not the browser viewport: the wire lives inside
// `.stage`, which can be narrower than window.innerWidth when another panel (e.g. a run-stream side panel)
// is mounted as a flex sibling. Callers pass the live container width (measured off a ref); `containerW`
// falls back to window.innerWidth (then a fixed 900) only before the ref has ever measured anything.
const railMaxPx = (containerW: number) =>
  Math.max(RAIL_MIN, Math.round((containerW || (typeof window === 'undefined' ? 900 : window.innerWidth)) * 0.78))
const clampW = (w: number, containerW: number) => Math.min(railMaxPx(containerW), Math.max(RAIL_MIN, Math.round(w)))

export function WireSurface({ config, home }: { config: WireConfig; home: ReactNode }) {
  const event = useStore((s) => s.scSelectedEvent)
  const themesView = useStore((s) => s.themesView)
  const ideasOpen = useStore((s) => s.ideasOpen)
  const calendarOpen = useStore((s) => s.calendarOpen)
  const focusedCompany = useStore((s) => s.scFocusedCompany)
  const openKey = `wire.railOpen.${config.swarmId}`
  const widthKey = `wire.railW.${config.swarmId}`
  const [railOpen, setRailOpen] = useState<boolean>(() => {
    try { return localStorage.getItem(openKey) !== '0' } catch { return true }
  })
  const [railW, setRailW] = useState<number>(() => {
    // No layout has happened yet, so there's no measured container width — clampW falls back to
    // window.innerWidth (see railMaxPx above). The drag handlers below re-clamp against the real
    // `.stage` width once the ref is attached.
    const fallbackW = typeof window === 'undefined' ? 900 : window.innerWidth
    try { const v = Number(localStorage.getItem(widthKey)); return v >= RAIL_MIN ? clampW(v, fallbackW) : RAIL_DEFAULT } catch { return RAIL_DEFAULT }
  })
  const stageRef = useRef<HTMLDivElement>(null)
  const toggleRail = () => setRailOpen((v) => {
    const n = !v
    try { localStorage.setItem(openKey, n ? '1' : '0') } catch { /* private mode */ }
    return n
  })

  // Disambiguate drag from click by movement: a DRAG resizes (the "expand right" gesture); a CLICK (no
  // meaningful move) tucks / brings back. Pointer capture keeps the drag alive when the cursor outruns the
  // slim handle. `curW` is tracked on the ref so pointer-up persists the LIVE width, not a stale closure.
  const drag = useRef<{ startX: number; startW: number; moved: boolean; curW: number } | null>(null)
  const onDividerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!railOpen) { toggleRail(); return } // tucked → a press just brings it back; nothing to resize
    drag.current = { startX: e.clientX, startW: railW, moved: false, curW: railW }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onDividerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.startX
    if (!d.moved && Math.abs(dx) > 4) d.moved = true
    if (d.moved) {
      const containerW = stageRef.current?.getBoundingClientRect().width ?? (typeof window === 'undefined' ? 900 : window.innerWidth)
      const w = clampW(d.startW + dx, containerW)
      d.curW = w
      setRailW(w)
    }
  }
  const onDividerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    drag.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    if (!d) return
    if (d.moved) { try { localStorage.setItem(widthKey, String(d.curW)) } catch { /* private mode */ } }
    else toggleRail() // a genuine pointer click (mouse/touch), not a drag
  }
  // Keyboard/switch-device activation (Enter/Space on the focused button) dispatches a `click` with no
  // preceding pointer events, so onDividerDown/onDividerUp never run for it — this is the only path that
  // toggles tuck state for those users. `event.detail` is 0 for a keyboard-synthesized click and >=1 for a
  // real pointer click, so this guard never double-fires alongside the pointer-driven toggle in onDividerUp.
  const onDividerClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (e.detail !== 0) return // pointer click already handled (toggle or drag) via onDividerUp above
    toggleRail()
  }

  return (
    <WireProvider value={config}>
      <div ref={stageRef} className={`scstage${railOpen ? '' : ' scstage--railshut'}`} style={{ ['--evrail-w' as string]: `${railW}px` }}>
        {railOpen && <EventRail />}
        <button
          type="button"
          className={`wiresurface__railtab${railOpen ? ' wiresurface__railtab--resizable' : ''}`}
          onPointerDown={onDividerDown}
          onPointerMove={onDividerMove}
          onPointerUp={onDividerUp}
          onClick={onDividerClick}
          title={railOpen ? 'Drag to widen the wire · click to tuck it away' : 'Show the wire'}
          aria-label={railOpen ? 'Resize or collapse the events rail' : 'Expand the events rail'}
          aria-expanded={railOpen}
        >
          <span className="wiresurface__grip" aria-hidden>{railOpen ? '⋮' : '›'}</span>
        </button>
        <div className="scstage__main">
          {/* the pulse is a real top BAND (not an overlay): the content views below are each
              position:absolute inset:0, so keeping the pulse in-flow above its own positioned body is
              what lets its own overflow-x:auto scroll — an overlaid content layer would swallow the
              horizontal wheel/drag over the strip */}
          {config.pulse && !focusedCompany && !event && <SubjectPulse />}
          <div className="scstage__body">
            {focusedCompany ? <CompanyView /> : event ? <EventDetail it={event} /> : ideasOpen ? <BestIdeasView /> : calendarOpen ? <CalendarView /> : themesView ? <ThemesView /> : home}
          </div>
        </div>
      </div>
    </WireProvider>
  )
}
