// The SHARED wire composition — the one rail+main arrangement every wire-bearing swarm renders. The
// screener's flow stage delegates here (behavior-identical to its old inline layout); any constellation
// swarm whose manifest declares `wire:` renders the same surface with its own `home` (the constellation)
// as the resting main view. This file IS the "no fork" guarantee: a change to the wire's composition
// lands on every swarm at once (ui/web/DESIGN.md, shared-surfaces registry).
//
// The rail can be tucked away (persisted per swarm) so the home view gets the full stage — the collapse
// swaps width instantly and fades content (transform/opacity only; no width animation, per the motion
// doctrine). Reading flows stay: pick an event → the reader takes the main pane; Themes → the map/board.

import { useState, type ReactNode } from 'react'
import { useStore } from '../../lib/store'
import type { WireConfig } from '../../lib/wire'
import { CompanyView } from '../screener/CompanyView'
import { EventDetail } from '../screener/EventDetail'
import { EventRail } from '../screener/EventRail'
import { ThemesView } from '../screener/ThemesView'
import { SubjectPulse } from './SubjectPulse'
import { WireProvider } from './WireContext'

export function WireSurface({ config, home }: { config: WireConfig; home: ReactNode }) {
  const event = useStore((s) => s.scSelectedEvent)
  const themesView = useStore((s) => s.themesView)
  const focusedCompany = useStore((s) => s.scFocusedCompany)
  const [railOpen, setRailOpen] = useState<boolean>(() => {
    try { return localStorage.getItem(`wire.railOpen.${config.swarmId}`) !== '0' } catch { return true }
  })
  const toggleRail = () => setRailOpen((v) => {
    const n = !v
    try { localStorage.setItem(`wire.railOpen.${config.swarmId}`, n ? '1' : '0') } catch { /* private mode */ }
    return n
  })
  return (
    <WireProvider value={config}>
      <div className={`scstage${railOpen ? '' : ' scstage--railshut'}`}>
        {railOpen && <EventRail />}
        <button
          type="button"
          className="wiresurface__railtab"
          onClick={toggleRail}
          title={railOpen ? 'Tuck the wire away' : 'Show the wire'}
          aria-label={railOpen ? 'Collapse the events rail' : 'Expand the events rail'}
          aria-expanded={railOpen}
        >
          {railOpen ? '‹' : '›'}
        </button>
        <div className="scstage__main">
          {/* the pulse is a real top BAND (not an overlay): the content views below are each
              position:absolute inset:0, so keeping the pulse in-flow above its own positioned body is
              what lets its own overflow-x:auto scroll — an overlaid content layer would swallow the
              horizontal wheel/drag over the strip */}
          {config.pulse && !focusedCompany && !event && <SubjectPulse />}
          <div className="scstage__body">
            {focusedCompany ? <CompanyView /> : event ? <EventDetail it={event} /> : themesView ? <ThemesView /> : home}
          </div>
        </div>
      </div>
    </WireProvider>
  )
}
