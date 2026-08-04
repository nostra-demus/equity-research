// The dynamic-themes view: the living, ranked investment themes the news firehose is bucketed into.
// Two ways to look at the same themes[] — a spatial MAP (sources → ranking lens → theme basins, with
// hot basins risen + pulsing) and a ranked BOARD (cards with a flow sparkline + companies by order) —
// plus a deep-dive that reuses the existing event reader + "run the checks" funnel. Custom inline SVG
// (no graph lib), tokens-only colour, transform/opacity animation, reduced-motion aware.

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { fmtStampLocal } from '../../lib/format'
import { displayHeadline } from '../../lib/plain'
import { nextRovingRadioIndex, rovingRadioTabStopIndex } from '../../lib/rovingRadio'
import { useStore } from '../../lib/store'
import { heatOf, momentumOf, recentFlow, radiusFor, sparklinePoints, tierColorVar, tierLabel, orderLabel, THEME_WINDOWS, flowInWindow, heatInWindow, windowCoverage, windowLabel, groupThemesForBriefing, shouldHideThemeIntake, shouldResetThemeWindow, sourceTierLabel, splitQualifiedThemeExpressions, themeBriefingEvidence, themeCompanyLabel, themeFlowDelta, themeForMapHover, themeMapMode, themeSliceDisplay, themeSurfaceAssessment, themeWindowForView, validThemeCompanyName, validThemeTicker, type Theme, type ThemeCompany, type ThemeCompanyLite, type ThemeSliceDisplay, type ThemeWindow, type WindowCoverage } from '../../lib/themes'
import type { FeedItem, IntensityWindow } from '../../lib/types'
import { useWireConfig } from '../wire/WireContext'

const TIERS = ['all', 'hot', 'active', 'cooling', 'parked'] as const
const THEMES_PROJECTION_REFRESH_MS = 60_000

// The map's central readout + source-lane mix are labelled by the active intensity-rollup window, which
// the single "When" ribbon drives (see intensityWindowForHours) — there is no separate intensity picker.
// 'scan' = the live per-cycle readout; the rest are small server-side rollups over the window.
const WINDOW_LABEL: Record<IntensityWindow, string> = { scan: 'this scan', '1h': 'last hour', '4h': 'last 4h', day: 'last 24h', '7d': 'last 7 days' }

function handleRovingRadioKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
  const group = event.currentTarget.closest('[role="radiogroup"]')
  if (!group) return
  const radios = Array.from(group.querySelectorAll<HTMLButtonElement>('button[role="radio"]'))
  const nextIndex = nextRovingRadioIndex(event.key, radios.indexOf(event.currentTarget), radios.map((radio) => !radio.disabled))
  if (nextIndex == null) return
  event.preventDefault()
  const next = radios[nextIndex]
  next.focus()
  next.click()
}

// guard against empty / placeholder company guesses leaking into chips
const real = <T extends { name?: string | null }>(cos: T[]): T[] => cos.filter((c) => validThemeCompanyName(c.name))

export function ThemesView() {
  const themes = useStore((s) => s.themes)
  const view = useStore((s) => s.themesView)
  const status = useStore((s) => s.themesStatus)
  const selectedTheme = useStore((s) => s.selectedTheme)
  const themesWindow = useStore((s) => s.themesWindow)
  const themesGeo = useStore((s) => s.themesGeo)
  const themesSubject = useStore((s) => s.themesSubject)
  const historyDays = useStore((s) => s.themesHistoryDays)
  const generatedAt = useStore((s) => s.themesGeneratedAt)
  const setThemesView = useStore((s) => s.setThemesView)
  const setThemesWindow = useStore((s) => s.setThemesWindow)
  const selectTheme = useStore((s) => s.selectTheme)
  const refreshThemes = useStore((s) => s.refreshThemes)
  const staticMode = useStore((s) => s.staticMode)
  const wireConfig = useWireConfig()
  const [tier, setTier] = useState<(typeof TIERS)[number]>('all')

  // the active window (null = Live). When a window is set, themes are RE-RANKED + RE-SIZED by the news
  // flow within it — "what's hottest in the last hour" vs "...the last 3 months" — and a theme with no
  // flow in the window drops out. Live keeps the server's composite ranking + the real-time map.
  // Briefing is deliberately current-only. This defensive projection also protects an older persisted
  // client state while the store resets its historical window during an Explore -> Briefing switch.
  const effectiveWindow = themeWindowForView(view, themesWindow)
  const win = useMemo<ThemeWindow | null>(() => (effectiveWindow == null ? null : THEME_WINDOWS.find((w) => w.hours === effectiveWindow) ?? null), [effectiveWindow])
  const windowHours = win?.hours ?? null

  // the "Where" geography slice (mirrored from the Event rail's picker) — when set, the themes[] the store
  // holds are ALREADY sliced to this geography by the server, so this drives labels/empty-copy only.
  const geoLabel = themesGeo.label || themesGeo.country || themesGeo.geoRegion
  const slice = useMemo(
    () => themeSliceDisplay(geoLabel, themesSubject, wireConfig.flow ? null : wireConfig.eventScope),
    [geoLabel, themesSubject, wireConfig.flow, wireConfig.eventScope],
  )

  const shown = useMemo(() => {
    // Heat is an exploration control, not the briefing's qualification bar. A heat chip selected on the
    // map must never silently hide a Worth-checking row when the user returns to the briefing.
    if (view !== 'map') return themes
    const byTier = tier === 'all' ? themes : themes.filter((t) => t.tier === tier)
    if (windowHours == null) return byTier
    return byTier.filter((t) => flowInWindow(t, windowHours) > 0).sort((a, b) => heatInWindow(b, windowHours) - heatInWindow(a, windowHours))
  }, [themes, tier, view, windowHours])
  const briefingCounts = useMemo(() => groupThemesForBriefing(themes).counts, [themes])

  // don't strand the user on a window that stops being honestly backed (history shrank — e.g. an engine
  // restart lost the in-memory rings): a still-selected but now-locked pill would show an empty view. Fall
  // back to Live instead.
  useEffect(() => {
    // A slice change clears history while its replacement is loading. Preserve the selected historical
    // window through that transition; only a completed index may prove the new slice lacks coverage.
    if (shouldResetThemeWindow(status, view, win, historyDays)) setThemesWindow(null)
  }, [status, view, win, historyDays, setThemesWindow])

  // SSE is deliberately not replayed. Heal a missed removal or time-decay projection from the
  // authoritative index at its 60s projection TTL, only while this surface is active.
  useEffect(() => {
    if (staticMode || view === null) return
    const id = window.setInterval(() => void refreshThemes(), THEMES_PROJECTION_REFRESH_MS)
    return () => window.clearInterval(id)
  }, [staticMode, view, refreshThemes])

  const stale = status === 'error' && themes.length > 0

  if (selectedTheme) return <ThemeDeepDive sourceSlice={slice} stale={status === 'error'} generatedAt={generatedAt} />

  const cov = win ? windowCoverage(win, historyDays) : null
  const windowedTotal = win ? shown.reduce((n, t) => n + flowInWindow(t, windowHours), 0) : 0
  const windowCoverages = THEME_WINDOWS.map((w) => windowCoverage(w, historyDays))
  const selectedWindowIndex = THEME_WINDOWS.findIndex((w) => effectiveWindow === w.hours)
  const windowTabStopIndex = rovingRadioTabStopIndex(selectedWindowIndex, windowCoverages.map((coverage) => coverage.selectable))
  const generatedStamp = fmtStampLocal(generatedAt || undefined)
  const freshnessCopy = status === 'error'
    ? themes.length ? `stale · last successful index ${generatedStamp || 'time unknown'}` : 'refresh failed · no cached index'
    : status === 'loading'
      ? themes.length ? `refreshing · last good index ${generatedStamp || 'time unknown'}` : 'building first index…'
      : generatedStamp ? `index ${generatedStamp}` : 'index time unavailable'
  const sliceSuffix = slice.active ? ` · ${slice.label}` : ''
  const noRowsCopy = status === 'error'
    ? `index unavailable${sliceSuffix}`
    : status === 'loading'
      ? `loading${sliceSuffix}`
      : `nothing formed${sliceSuffix}`

  return (
    <div className="themes">
      <header className="themes__head">
        <div className="themes__title">
          <div className="themes__titleline">
            <span className="themes__titlemain">Themes {view === 'map' ? 'explorer' : 'briefing'}</span>
            <span className={`themes__freshness${status === 'error' ? ' is-stale' : ''}`}>{freshnessCopy}</span>
          </div>
          <span className="themes__sub">
            {!themes.length
              ? noRowsCopy
              : stale
                ? view === 'map'
                  ? `Last successful explorer snapshot${sliceSuffix} · ${themes.length} clusters · retained evidence, not current`
                  : `Last successful screen${sliceSuffix} · ${briefingCounts.worthChecking} previously qualified · ${briefingCounts.forming} previously forming · ${briefingCounts.context} previous context · not current`
              : view === 'map'
                ? win
                  ? `News-flow map${sliceSuffix} · ${win.full}`
                  : `${themes.length} live clusters${slice.active ? ` in ${slice.label}` : ''} · explore heat and relationships`
                : `Current screen${sliceSuffix} · ${briefingCounts.worthChecking} worth checking · ${briefingCounts.forming} forming · ${briefingCounts.context} context · news patterns, not investment ratings`}
          </span>
        </div>
        <div className="themes__controls">
          {view === 'map' && (
            <div className="themes__tiers" role="radiogroup" aria-label="Filter the explorer by heat">
              {TIERS.map((t) => (
                <button key={t} type="button" role="radio" aria-checked={tier === t} tabIndex={tier === t ? 0 : -1} className={`themes__tierbtn${tier === t ? ' is-on' : ''}`} onClick={() => setTier(t)} onKeyDown={handleRovingRadioKeyDown}>
                  {t === 'all' ? 'All' : tierLabel(t as any)}
                </button>
              ))}
            </div>
          )}
          <div className="themes__viewtoggle" role="radiogroup" aria-label="Theme briefing or exploratory map">
            <button type="button" role="radio" aria-checked={view === 'board'} tabIndex={view === 'map' ? -1 : 0} className={`themes__vbtn${view === 'board' ? ' is-on' : ''}`} onClick={() => setThemesView('board')} onKeyDown={handleRovingRadioKeyDown}>Briefing</button>
            <button type="button" role="radio" aria-checked={view === 'map'} tabIndex={view === 'map' ? 0 : -1} className={`themes__vbtn${view === 'map' ? ' is-on' : ''}`} onClick={() => setThemesView('map')} onKeyDown={handleRovingRadioKeyDown}>Explore map</button>
          </div>
        </div>
      </header>

      {view === 'map' ? (
        /* Historical windows are exploratory: they re-rank and resize the map by flow. Briefing stays on
           the current evidence gate, so the two meanings can never appear under one selected pill. */
        <div className="themes__timeline">
          <span className="themes__tllabel">When</span>
          <div className="themes__windows" role="radiogroup" aria-label="Explore time window">
            {THEME_WINDOWS.map((w, index) => {
              const c = windowCoverages[index]
              const on = effectiveWindow === w.hours
              const tip = !c.selectable
                ? `Needs ${c.neededDays} days of history — ${Math.floor(historyDays)} so far`
                : c.partial
                  ? `Showing ${c.coveredDays} of ${c.neededDays} days — fills in as the engine runs`
                  : w.hours == null
                    ? 'Live — the real-time wire'
                    : `Rank and size map themes by news flow over ${w.full}`
              return (
                <button
                  key={w.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={tip}
                  tabIndex={index === windowTabStopIndex ? 0 : -1}
                  disabled={!c.selectable}
                  title={tip}
                  className={`themes__winbtn${on ? ' is-on' : ''}${c.partial && c.selectable ? ' is-partial' : ''}${!c.selectable ? ' is-locked' : ''}`}
                  onClick={() => c.selectable && setThemesWindow(w.hours)}
                  onKeyDown={handleRovingRadioKeyDown}
                >
                  {w.label}
                </button>
              )
            })}
          </div>
          <span className="themes__tlnote">
            {stale ? (
              <>last successful snapshot · not current</>
            ) : win ? (
              cov?.partial ? (
                <><span className="themes__tldot themes__tldot--build" aria-hidden /> {cov.coveredDays} of {cov.neededDays} days of history</>
              ) : (
                <>{windowedTotal.toLocaleString()} items · {win.full}</>
              )
            ) : (
              <><span className="themes__tldot themes__tldot--live" aria-hidden /> live</>
            )}
          </span>
        </div>
      ) : (
        <div className={`themes__current${stale ? ' themes__current--stale' : ''}`} role={stale ? 'alert' : 'note'}>
          {!stale && <span className="themes__tldot themes__tldot--live" aria-hidden />}
          {stale
            ? `Refresh failed. Showing the last successful briefing${generatedStamp ? ` from ${generatedStamp}` : ''}; its qualification and evidence are retained for audit, not current.`
            : `Current-only briefing${sliceSuffix} · evidence in the last 6 hours compared with the prior 6 hours`}
        </div>
      )}

      {status === 'loading' && !themes.length ? (
        <div className="themes__empty"><div className="themes__shimmer" /><p>Reading the wire and clustering it into themes…</p></div>
      ) : status === 'error' && !themes.length ? (
        <div className="themes__empty">
          <div className="themes__emptyorb" />
          <p>The themes index could not refresh, and there is no cached briefing to show. The wire itself may still be available.</p>
        </div>
      ) : !themes.length ? (
        <div className="themes__empty">
          <div className="themes__emptyorb" />
          <p>{slice.active
            ? `No themes are being driven by ${slice.label} news right now. Clear or change the active scope to widen the screen.`
            : 'No theme evidence has cleared the briefing yet. As distinct current stories form a coherent narrative, this view will show what cleared the bar and what is still missing.'}</p>
        </div>
      ) : view === 'map' && win && !shown.length ? (
        <div className="themes__empty">
          <div className="themes__emptyorb" />
          <p>No theme took news in {win.full}. Try a longer window — or switch to Live to see the current briefing.</p>
        </div>
      ) : view === 'map' ? (
        <ThemeMap themes={shown} onPick={selectTheme} win={win} cov={cov} slice={slice} stale={stale} />
      ) : (
        <ThemeBoard themes={themes} onPick={selectTheme} sliceLabel={slice.active ? slice.label : ''} stale={stale} />
      )}
    </div>
  )
}

// ---------------- the MAP ----------------

// The §4 source tiers, top-of-hierarchy first. Which lanes actually render is DATA-DRIVEN: only tiers we
// genuinely collect appear (news is always shown), sized + labelled by their real share — so dead tiers
// (e.g. rumour, which is ~0% of the real feed) never show as empty lanes.
const TIER_LANES = [
  { id: 'primary_filing', label: 'Filings' },
  { id: 'official_data', label: 'Official' },
  { id: 'company', label: 'Company' },
  { id: 'news', label: 'News' },
  { id: 'unconfirmed', label: 'Rumour' },
  { id: 'social', label: 'Social' },
]

// One-time entrance: the size-ranked reveal cascade plays once per page session (a single "assembly"
// moment), never replaying on a Map<->Board toggle, a tier filter, or a hover. This module-level flag
// survives ThemeMap unmount/remount within the session; a full page reload resets it (fresh reveal).
let themeMapRevealed = false

function ThemeMap({ themes, onPick, win, cov, slice, stale }: { themes: Theme[]; onPick: (id: string) => void; win: ThemeWindow | null; cov: WindowCoverage | null; slice: ThemeSliceDisplay; stale: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [hover, setHover] = useState<string | null>(null)
  // a historical window is a FROZEN snapshot — the live scanning flow (inbound/outbound dots, lane
  // firing, rate readout) is suppressed and the basins are sized by flow WITHIN the window instead.
  const windowHours = win?.hours ?? null
  const historical = windowHours != null
  // Any server-side slice freezes the map the same way: the intake rollup and scanner rate are GLOBAL,
  // so showing them filing into geography/subject/scope-filtered basins would be a false attribution.
  // A narrow pane uses a compact ranked explorer instead of clipping the spatial map.
  const compact = themeMapMode(box.w) === 'compact'
  const frozen = historical || slice.active || compact || stale
  useLayoutEffect(() => {
    if (!ref.current) return
    const measure = () => {
      const r = ref.current?.getBoundingClientRect()
      if (r) setBox({ w: Math.max(1, r.width), h: Math.max(1, r.height) })
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((e) => { const r = e[0].contentRect; setBox({ w: Math.max(1, r.width), h: Math.max(1, r.height) }) })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  // the LIVE source-tier mix of what we ACTUALLY collect (from the wire backfill) — drives the lane
  // sizing/labels AND the inbound dot distribution, so the lanes reflect REALITY (e.g. ~73% news, ~17%
  // filings), never a hardcoded guess. Empty tiers (e.g. rumour) drop out; real ones flow proportionally.
  const newsItems = useStore((s) => s.newsItems)
  const scIntensity = useStore((s) => s.scIntensity)
  const intensityWindow = useStore((s) => s.scIntensityWindow)
  const tierMix = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const it of newsItems) { const t = (it.source_tier as string) || 'news'; counts[t] = (counts[t] || 0) + 1 }
    return counts
  }, [newsItems])
  // When a time window is chosen, the lane mix + central readout come from the server's windowed rollup
  // (tiny aggregates) instead of the loaded newsItems — so a full day never needs thousands of rows here.
  // only treat the rollup as "windowed" once the LOADED aggregate matches the selected window — otherwise a
  // slow/failed fetch would render the previous window's totals + lane mix under the new label (mislabeled).
  const windowed = !slice.active && intensityWindow !== 'scan' && !!scIntensity && scIntensity.window === intensityWindow
  const hideIntake = stale || shouldHideThemeIntake(slice.active, historical, windowed)
  // A correctly scoped intake aggregate is not exposed by the API. Hide the global lanes instead of
  // relabelling it as the slice. Historical windows without an exact rollup likewise hide the CURRENT
  // loaded-wire mix; the explicit note below says exactly what has been withheld.
  const effectiveTierMix = hideIntake ? {} : windowed ? (scIntensity!.byTier || {}) : tierMix
  const tierMixRef = useRef(effectiveTierMix); tierMixRef.current = effectiveTierMix

  const layout = useMemo(
    () => computeMapLayout(themes, Math.max(1, box.w), Math.max(1, box.h), effectiveTierMix, windowHours, !hideIntake),
    [themes, box.w, box.h, effectiveTierMix, windowHours, hideIntake],
  )
  const hoveredTheme = useMemo(() => themeForMapHover(themes, hover), [themes, hover])
  const hoveredRelated = useMemo(() => {
    return new Set((hoveredTheme?.related_themes || []).map((r) => r.theme_id))
  }, [hoveredTheme])

  // ---- LIVE FLOW (paced + truthful) — the scanner reads ~N real items each cycle (one every ~second:
  //      300 items / 300s). The data ARRIVES in a 5-minute burst, but every item in it is real, so we
  //      RE-PACE that burst into a steady stream over the inter-cycle window — the map is alive
  //      continuously instead of clumping for 2s then dying. INBOUND dot = one item read off the wire
  //      (from its real source tier) → Ranking. OUTBOUND dot = one item assigned to a theme → its
  //      basin, ticking that theme's count up by one as it lands. No invented events; only real ones,
  //      shown at their true average cadence. ----
  type Emit = { id: number; d: string; cls: string; tier?: Theme['tier']; dur: number; target?: string; tag?: { text: string; kind: 'in' | 'out' } }
  type Pending = { kind: 'in'; sourceTier?: string } | { kind: 'out'; themeId: string; tier: Theme['tier'] }
  const MAX_QUEUE = 4000 // generous — a real scan's full volume drives the rate; this is only a runaway guard
  // At most this many in-flight packets carry a visible payload tag at once — a calm, legible sample of
  // the stream (every tag names the theme bubble its packet is being filed into), never a wall of labels.
  const MAX_TAGS = 3
  const lastScan = useStore((s) => s.lastScan)
  const intervalMin = useStore((s) => s.newsStatus?.intervalMin) || 5
  const prevCounts = useRef<Map<string, number>>(new Map())
  const prevScanSeq = useRef<number | null>(null)
  const seenThemes = useRef<Set<string>>(new Set())
  const seq = useRef(0)
  const queue = useRef<Pending[]>([])
  const acc = useRef(0)
  const rateRef = useRef(0) // live emission rate (items/sec) — FIXED at each scan = pending ÷ cadence, NO clamp
  const [emits, setEmits] = useState<Emit[]>([])
  const [shown, setShown] = useState<Record<string, number>>({})
  const [absorbing, setAbsorbing] = useState<Set<string>>(new Set()) // theme_ids briefly lit as a dot lands
  const [born, setBorn] = useState<Set<string>>(new Set()) // theme_ids that just appeared on the map
  const [rate, setRate] = useState(0) // live items/sec being released — the real backlog drain rate
  const [laneFired, setLaneFired] = useState<Record<string, number>>({}) // per-lane dots fired THIS scan — drives the lane fire-pulse + the live "filled" count
  const nodeById = useMemo(() => new Map(layout.nodes.map((n) => [n.id, n])), [layout])
  const reduceMotion = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  // Run the entrance cascade only on the FIRST map mount this session (and never under reduced motion).
  // `is-entering` on the container gates every entrance animation; we drop it once the cascade is done,
  // so hover / tier-filter / Map<->Board re-mounts after that never re-fire it.
  const [entering, setEntering] = useState(() => !themeMapRevealed && !reduceMotion)
  useEffect(() => {
    themeMapRevealed = true
    if (!entering) return
    // Hold `is-entering` until the slowest (last-ranked) bubble has finished landing, so a map with many
    // themes never has its tail snapped in / cut off at a fixed deadline. Mirrors the cascade timing in
    // global.css: delay = enterRank·(--theme-stagger 64ms) + 90ms, duration = --theme-reveal 560ms; + buffer.
    const cascadeMs = Math.max(0, layout.nodes.length - 1) * 64 + 90 + 560 + 160
    const id = window.setTimeout(() => setEntering(false), cascadeMs)
    return () => window.clearTimeout(id)
  }, []) // once, on mount

  // stable refs so the single pacer loop always reads the current layout / window without resetting
  const layoutRef = useRef(layout); layoutRef.current = layout
  const nodeByIdRef = useRef(nodeById); nodeByIdRef.current = nodeById
  const windowRef = useRef(intervalMin * 60_000); windowRef.current = intervalMin * 60_000

  // ENQUEUE outbound — diff each theme's real member_count; one pending dot per new member. HOLD the
  // shown count at the old value (landings tick it up). A theme appearing for the first time is "born".
  useEffect(() => {
    if (frozen) return // frozen snapshot (a window or a geo slice) — no live landings to animate
    const pc = prevCounts.current
    const seeding = pc.size === 0
    const sync: Record<string, number> = {}
    const newborn: string[] = []
    for (const t of themes) {
      if (!seenThemes.current.has(t.theme_id)) { seenThemes.current.add(t.theme_id); if (!seeding) newborn.push(t.theme_id) }
      const prev = pc.get(t.theme_id)
      pc.set(t.theme_id, t.member_count)
      if (prev === undefined) { sync[t.theme_id] = t.member_count; continue } // first sight — show truth
      const delta = t.member_count - prev
      if (delta > 0 && !reduceMotion) {
        for (let k = 0; k < Math.min(delta, 40); k++) queue.current.push({ kind: 'out', themeId: t.theme_id, tier: t.tier })
        sync[t.theme_id] = prev // hold the old number; each landing dot ticks it up by one
      } else if (delta !== 0) sync[t.theme_id] = t.member_count // merge/retire — jump straight to truth
    }
    if (queue.current.length > MAX_QUEUE) queue.current = queue.current.slice(-MAX_QUEUE)
    if (!reduceMotion) { rateRef.current = queue.current.length / Math.max(60, windowRef.current / 1000); setRate(rateRef.current) }
    if (Object.keys(sync).length) setShown((s) => ({ ...s, ...sync }))
    if (newborn.length && !reduceMotion) {
      setBorn((b) => { const n = new Set(b); newborn.forEach((id) => n.add(id)); return n })
      window.setTimeout(() => setBorn((b) => { const n = new Set(b); newborn.forEach((id) => n.delete(id)); return n }), 1500)
    }
  }, [themes, reduceMotion, frozen])

  // ENQUEUE inbound — the cycle's RAW FETCH volume (`fetched` ≈ 200 articles/scan) is the true "data
  // coming in" intensity the user wants to gauge — not the ~5 new-after-dedup items, which look like
  // nothing. On mount it SEEDS from the most recent scan (alive on open, not dead until the next 5-min
  // cycle); each new scan tops it up. The filtered bulk doesn't carry a per-article source tier, so dots
  // are spread across the lanes by a news-heavy mix — the COUNT (fetched) is exact; only the lane split
  // is modelled. These are the "scanning" pulse (source → Ranking); they don't tick theme counts.
  useEffect(() => {
    if (reduceMotion || frozen || !lastScan || lastScan.seq === prevScanSeq.current) return
    prevScanSeq.current = lastScan.seq
    const n = Math.max(0, Math.min(lastScan.fetched, MAX_QUEUE))
    // spread the n scanning dots across the source lanes by the REAL collected mix (stratified, so they
    // interleave evenly instead of clumping) — filings, company, etc. flow in proportion to reality.
    const entries = Object.entries(tierMixRef.current)
    const totalC = entries.reduce((a, [, c]) => a + c, 0)
    if (totalC && entries.length) {
      const assigned: Record<string, number> = {}
      for (let i = 0; i < n; i++) {
        let best = entries[0][0], bestDef = -Infinity
        for (const [t, c] of entries) { const def = ((i + 1) * c) / totalC - (assigned[t] || 0); if (def > bestDef) { bestDef = def; best = t } }
        assigned[best] = (assigned[best] || 0) + 1
        queue.current.push({ kind: 'in', sourceTier: best })
      }
    } else {
      for (let i = 0; i < n; i++) queue.current.push({ kind: 'in', sourceTier: 'news' })
    }
    if (queue.current.length > MAX_QUEUE) queue.current = queue.current.slice(-MAX_QUEUE)
    setLaneFired({}) // fresh scan — restart each lane's "filled this scan" counter from zero
    // the rate IS the intensity: fetched ÷ scan cadence, dynamic + uncapped (200/scan ≈ 0.7/s, 1000 ≈ 3.3/s)
    rateRef.current = queue.current.length / Math.max(60, windowRef.current / 1000)
    setRate(rateRef.current)
  }, [lastScan, reduceMotion, frozen])

  // PACER — one stable loop. It releases dots at the FIXED per-scan rate (rateRef, = scraped ÷ cadence),
  // held steady across the window so the whole scan's volume spreads evenly: 1000 items over 300s reads
  // as a dense ~3.3/s, 100 items as a sparse ~0.3/s. NO clamp — the dot density IS the intensity gauge.
  // A fractional accumulator handles any rate (sub-1/s to tens/s). On drain it goes idle until next scan.
  useEffect(() => {
    if (reduceMotion || frozen) return
    const TICK = 200
    const emitOne = (p: Pending) => {
      const L = layoutRef.current
      if (p.kind === 'in') {
        const lane = L.lanes.find((l) => l.id === p.sourceTier) || L.lanes.find((l) => l.id === 'news') || L.lanes[0]
        if (!lane) return
        const d = hcurve(lane.x + 18, lane.y, L.core.x - L.core.r, L.core.y)
        setEmits((e) => [...e, { id: ++seq.current, d, cls: 'thememap__pulse--in', dur: 2.4 }].slice(-120))
        setLaneFired((f) => ({ ...f, [lane.id]: (f[lane.id] || 0) + 1 })) // the lane FIRES — pulses + its count ticks up
      } else {
        const node = nodeByIdRef.current.get(p.themeId)
        if (!node) { setShown((s) => ({ ...s, [p.themeId]: Math.min((s[p.themeId] ?? 0) + 1, prevCounts.current.get(p.themeId) ?? Infinity) })); return }
        const d = hcurve(L.core.x + L.core.r, L.core.y, node.x - node.r, node.y)
        const name = node.theme.name
        // tag a capped sample of outbound packets with their destination theme — "what this packet carries":
        // a real news item being filed into that bubble. Cap keeps the stream legible (see MAX_TAGS).
        setEmits((e) => {
          const labeled = e.reduce((n, x) => n + (x.tag ? 1 : 0), 0)
          const tag = labeled < MAX_TAGS && name ? { text: name, kind: 'out' as const } : undefined
          return [...e, { id: ++seq.current, d, cls: 'thememap__pulse--out', tier: p.tier, dur: 1.7, target: p.themeId, tag }].slice(-120)
        })
      }
    }
    let last = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      const elapsed = Math.min(2, (now - last) / 1000) // REAL elapsed (throttle-proof: background tabs clamp
      last = now                                       // setInterval to ~1/s, so the fixed TICK lies); capped
      const q = queue.current                          // at 2s so a backgrounded tab can't dump a huge catch-up burst
      if (q.length && rateRef.current > 0) {
        acc.current += rateRef.current * elapsed
        let released = 0
        while (acc.current >= 1 && q.length && released < 40) { acc.current -= 1; emitOne(q.shift()!); released++ }
      }
      if (!q.length) {
        acc.current = 0
        if (rateRef.current !== 0) { rateRef.current = 0; setRate(0) } // drained — idle until the next scan re-measures
        const pc = prevCounts.current // converge any held counts to the truth
        setShown((s) => { let ch = false; const n = { ...s }; for (const [tid, c] of pc) if (n[tid] !== c) { n[tid] = c; ch = true } return ch ? n : s })
      }
    }, TICK)
    return () => window.clearInterval(id)
  }, [reduceMotion, frozen])

  // entering a frozen snapshot (a time window OR a geography slice) — drain the live stream so no in-flight
  // dot or rate readout lingers over it; the pacer is idle while `frozen`, so nothing refills the queue.
  // Also reset the live diff refs so returning to Live re-seeds counts from truth (no spurious landings).
  useEffect(() => {
    if (!frozen) return
    queue.current = []
    acc.current = 0
    rateRef.current = 0
    prevCounts.current = new Map()
    setEmits([])
    setRate(0)
    setLaneFired({})
    setShown({})
  }, [frozen])

  const scopeLabel = slice.active ? slice.label : ''
  const asOfParts = [
    stale ? 'Last successful index · not current' : '',
    slice.active ? `Scoped to ${slice.label}` : '',
    win ? windowLabel(win, cov) : '',
    slice.active ? 'global intake hidden' : '',
    !slice.active && historical && !windowed ? 'historical intake unavailable · current intake hidden' : '',
  ].filter(Boolean)

  // Keep the measuring root mounted, then use every available pixel. The spatial view is not compressed
  // below its legible width: every theme remains reachable in a scrollable ranked list instead.
  if (!box.w || !box.h) return <div className="thememap" ref={ref} aria-busy="true" />
  if (compact) {
    return (
      <div className={`thememap thememap--compact${historical || slice.active || stale ? ' is-historical' : ''}${stale ? ' is-stale' : ''}`} ref={ref}>
        <div className="thememap-compact__note" role="note">
          <b>{asOfParts.length ? asOfParts.join(' · ') : 'Compact explorer'}</b>
          <span>{slice.active
            ? 'This pane shows the scoped theme ranking. Global intake lanes and throughput are hidden because the API cannot attribute them to this slice.'
            : 'The relationship graph needs a wider pane. This ranked view keeps every visible theme reachable.'}</span>
        </div>
        <div className="thememap-compact__list" role="list" aria-label="Themes in the explorer">
          {themes.map((t, rank) => {
            const count = historical ? flowInWindow(t, windowHours as number) : t.member_count
            return (
              <div key={t.theme_id} className="thememap-compact__item" role="listitem">
                <button type="button" onClick={() => onPick(t.theme_id)} aria-label={`Open ${t.name}`}>
                  <span className="thememap-compact__rank">{rank + 1}</span>
                  <span className="thememap-compact__copy"><b>{t.name}</b><small>{t.description}</small></span>
                  <span className="thememap-compact__meta">{tierLabel(t.tier)}{stale ? '' : ` · ${momentumOf(t)}`}<small>{countLabel(count, scopeLabel)}</small></span>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`thememap${entering && !stale ? ' is-entering' : ''}${frozen ? ' is-historical' : ''}${stale ? ' is-stale' : ''}`} ref={ref}>
      {asOfParts.length > 0 && (
        <div className="thememap__asof" role="note">
          <span className="thememap__asof-dot" aria-hidden /> {asOfParts.join(' · ')}
        </div>
      )}
      <svg className="thememap__edges" viewBox={`0 0 ${box.w} ${box.h}`} preserveAspectRatio="none" aria-hidden>
        {layout.lanes.map((l) => (
          <path key={l.id} d={hcurve(l.x + 18, l.y, layout.core.x - layout.core.r, layout.core.y)} className="thememap__lane-edge" />
        ))}
        {layout.nodes.map((n) => {
          const active = hover === n.id || hoveredRelated.has(n.id)
          return <path key={n.id} d={hcurve(layout.core.x + layout.core.r, layout.core.y, n.x - n.r, n.y)} className={`thememap__edge${active ? ' is-active' : ''}`} style={{ ['--flow' as any]: n.flow ? 1 : 0, ['--enter' as any]: n.enterRank }} />
        })}
      </svg>

      {/* truthful flow — each dot is a real event; an outbound dot ticks its theme's count on landing */}
      <div className="thememap__particles" aria-hidden>
        {emits.map((p) => (
          <i
            key={p.id}
            className={`thememap__pulse ${p.cls}`}
            style={{ offsetPath: `path("${p.d}")`, animationDuration: `${p.dur}s`, ...(p.tier ? { ['--tier' as any]: tierColorVar(p.tier) } : {}) }}
            onAnimationEnd={() => {
              setEmits((e) => e.filter((x) => x.id !== p.id))
              if (p.cls === 'thememap__pulse--out' && p.target) {
                const tid = p.target
                setShown((s) => {
                  const real = prevCounts.current.get(tid) ?? s[tid] ?? 0
                  return { ...s, [tid]: Math.min((s[tid] ?? real) + 1, real) }
                })
                // the basin "absorbs" the landing — a brief glow/scale (re-armed if more land)
                setAbsorbing((a) => { if (a.has(tid)) return a; const n = new Set(a); n.add(tid); return n })
                window.setTimeout(() => setAbsorbing((a) => { if (!a.has(tid)) return a; const n = new Set(a); n.delete(tid); return n }), 480)
              }
            }}
          >
            {/* the payload this packet is carrying — rides along with the dot (inherits its GPU motion +
                stream fade), trailing to the left so it never overlaps the bubble it's heading into */}
            {p.tag && (
              <span className={`thememap__tag thememap__tag--${p.tag.kind}`}>
                <span className="thememap__tag-dot" aria-hidden />
                <span className="thememap__tag-text">{p.tag.text}</span>
              </span>
            )}
          </i>
        ))}
      </div>

      {/* source-tier lanes — only the ones we actually collect, each labelled with its REAL share */}
      <div className="thememap__lanes">
        {layout.lanes.map((l) => (
          <div key={l.id} className={`thememap__lane${laneFired[l.id] ? ' is-firing' : ''}`} style={{ left: l.x, top: l.y - 12 }} title={`${(l as any).count?.toLocaleString?.() || 0} of the last ${newsItems.length} reads${laneFired[l.id] ? ` · ${laneFired[l.id]} this scan` : ''}`}>
            {laneFired[l.id] ? <span key={laneFired[l.id]} className="thememap__lane-fire" aria-hidden /> : null}
            <span className="thememap__lane-label">{l.label}</span>
            {(l as any).share > 0 && <span className="thememap__lane-share">{Math.max(1, Math.round((l as any).share * 100))}%{windowed ? ((l as any).count ? ` · ${((l as any).count as number).toLocaleString()}` : '') : (laneFired[l.id] ? ` · ${laneFired[l.id]}` : '')}</span>}
          </div>
        ))}
      </div>

      {/* the ranking lens — emits harder the heavier the flow (--rate drives the glow), so intensity reads
          at a glance; a live readout beneath it shows the real per-scan volume + rate (the intensity gauge) */}
      <div className={`thememap__core${rate > 0 ? ' is-emitting' : ''}`} style={{ left: layout.core.x - layout.core.r, top: layout.core.y - layout.core.r, width: layout.core.r * 2, height: layout.core.r * 2, ['--rate' as any]: Math.min(1, rate / 4) }}>
        <span>Ranking</span>
      </div>
      {windowed ? (
        // windowed readout: the chosen window's total intake + scans + average rate, plus an hourly
        // intensity histogram — a real sense of intensity over the window, from a tiny server aggregate.
        // The flowing particles stay LIVE (driven by the latest cycle); the numbers describe the window.
        <div className="thememap__rate thememap__rate--window" style={{ left: layout.core.x, top: layout.core.y + layout.core.r + 13, ['--rate' as any]: Math.min(1, rate / 4) }}>
          <div className="thememap__rate-line">
            <span className="thememap__rate-dot" aria-hidden /> {scIntensity!.totalFetched.toLocaleString()} {WINDOW_LABEL[intensityWindow]} · {scIntensity!.scans.toLocaleString()} scan{scIntensity!.scans === 1 ? '' : 's'} · {scIntensity!.ratePerSec >= 0.1 ? `~${scIntensity!.ratePerSec.toFixed(1)}/s avg` : '<0.1/s'}
          </div>
          {scIntensity!.hourly.length > 1 && <div className="thememap__hist"><Sparkline series={scIntensity!.hourly.map((h) => h.fetched)} w={156} h={22} /></div>}
        </div>
      ) : rate > 0 ? (
        <div className="thememap__rate" style={{ left: layout.core.x, top: layout.core.y + layout.core.r + 13, ['--rate' as any]: Math.min(1, rate / 4) }}>
          <span className="thememap__rate-dot" aria-hidden /> {Math.round(rate * Math.max(60, intervalMin * 60)).toLocaleString()} this scan · {rate >= 0.1 ? `~${rate.toFixed(1)}/s` : '<0.1/s'}
        </div>
      ) : null}

      {/* theme basins */}
      {layout.nodes.map((n) => {
        const t = n.theme
        return (
          <button
            key={n.id}
            type="button"
            className={`themenode themenode--${t.tier}${t.tier === 'hot' ? ' is-pulsing' : ''}${absorbing.has(n.id) ? ' is-absorbing' : ''}${born.has(n.id) ? ' is-born' : ''}${hover && hover !== n.id && !hoveredRelated.has(n.id) ? ' is-dim' : ''}`}
            style={{ left: n.x - n.r, top: n.y - n.r, width: n.r * 2, height: n.r * 2, ['--tier' as any]: tierColorVar(t.tier), ['--enter' as any]: n.enterRank }}
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onPick(t.theme_id)}
            title={t.description}
          >
            <span className="themenode__core" />
            <span className="themenode__count">{(frozen ? (historical ? flowInWindow(t, windowHours as number) : t.member_count) : (shown[t.theme_id] ?? t.member_count)).toLocaleString()}</span>
            <span className="themenode__label" style={{ width: n.labelW, WebkitLineClamp: 3, color: 'var(--text)' }}>{t.name}</span>
          </button>
        )
      })}
      {hoveredTheme && <MapTooltip theme={hoveredTheme} sliceLabel={scopeLabel} stale={stale} />}
    </div>
  )
}

// In a scoped slice the count belongs to that slice's theme ring, not the global index — so every place
// that presents the number names the slice it can actually back.
function countLabel(n: number, sliceLabel: string): string {
  return sliceLabel ? `${n.toLocaleString()} items in ${sliceLabel}` : `${n.toLocaleString()} items`
}

function MapTooltip({ theme, sliceLabel, stale }: { theme: Theme; sliceLabel: string; stale: boolean }) {
  return (
    <div className="thememap__tip" role="status">
      <div className="thememap__tip-name">{theme.name}</div>
      <div className="thememap__tip-desc">{theme.description}</div>
      <div className="thememap__tip-meta">{tierLabel(theme.tier)}{stale ? ' · last indexed' : ` · ${momentumOf(theme)}`} · score {theme.composite} · {countLabel(theme.member_count, sliceLabel)}</div>
      {real(theme.top_companies).length > 0 && <div className="thememap__tip-cos">{real(theme.top_companies).slice(0, 5).map((c) => c.name).join(' · ')}</div>}
    </div>
  )
}

interface MapNode { id: string; x: number; y: number; r: number; flow: boolean; labelW: number; enterRank: number; theme: Theme }
function computeMapLayout(themes: Theme[], W: number, H: number, tierCounts: Record<string, number> = {}, windowHours: number | null = null, showIntake = true) {
  const coreX = W * (showIntake ? 0.26 : 0.12), coreY = H * 0.5, coreR = Math.min(32, H * 0.06)
  // lanes are DATA-DRIVEN: only tiers we actually collect (news always shown), each carrying its real
  // count + share so the lane labels read the true source mix.
  const totalT = Object.values(tierCounts).reduce((a, b) => a + b, 0)
  const activeTiers = showIntake
    ? TIER_LANES.map((t) => ({ ...t, count: tierCounts[t.id] || 0, share: totalT ? (tierCounts[t.id] || 0) / totalT : 0 })).filter((t) => t.share >= 0.005 || t.id === 'news')
    : []
  const laneX = W * 0.05
  const lanes = activeTiers.map((t, i) => ({ ...t, x: laneX, y: H * 0.18 + (i * (H * 0.64)) / Math.max(1, activeTiers.length - 1) }))

  // Each theme gets a wide label box (up to 3 lines) so the FULL name shows, and a matching tall
  // vertical SLOT so the name never collides with the orb beneath it. The basin band is inset on the
  // right by half a label so the rightmost name can't clip; columns are limited to what fits the
  // width so labels never collide sideways either.
  const labelW = Math.round(Math.max(170, Math.min(250, W * 0.25)))
  const LABEL_H = 46, GAP = 16, TOP = H * 0.06, BOT = H * 0.05
  const usable = Math.max(150, H - TOP - BOT)
  const maxR = Math.min(34, H * 0.066)
  // Live ranks/sizes by all-time heat + member volume; a window ranks/sizes by the news flow WITHIN it
  // (the biggest mover of the last 7d need not be the biggest all-time theme).
  const heat = (t: Theme) => (windowHours == null ? heatOf(t) : heatInWindow(t, windowHours))
  const sizeCount = (t: Theme) => (windowHours == null ? t.member_count : flowInWindow(t, windowHours))
  const ranked = [...themes].sort((a, b) => heat(b) - heat(a)).slice(0, 16)
  const items = ranked.map((t) => ({ t, r: radiusFor(sizeCount(t), 13, maxR), flow: recentFlow(t.flow_series, 2) > 0 }))
  const slotH = (it: { r: number }) => it.r * 2 + LABEL_H + GAP

  const basinL = Math.max(W * (showIntake ? 0.44 : 0.28), coreX + coreR + 96)
  const basinR = W - (labelW / 2 + 16)
  const horizMax = Math.max(1, Math.min(4, Math.floor((basinR - basinL) / (labelW + 18)) + 1))

  // greedy top-down fill that NEVER overflows a column — overflow past the last column is dropped
  // (the coldest themes; they still live in the Board view). Pick the smallest K that fits all.
  const greedyFit = (K: number) => {
    const cols: { r: number; t: Theme; flow: boolean }[][] = Array.from({ length: K }, () => [])
    const dropped: typeof items = []
    let c = 0, h = 0
    for (const it of items) {
      const sh = slotH(it)
      if (h + sh > usable) { if (c < K - 1) { c++; h = 0 } else { dropped.push(it); continue } }
      cols[c].push(it); h += sh
    }
    return { cols, dropped }
  }
  let K = Math.min(2, horizMax), packed = greedyFit(K)
  while (packed.dropped.length && K < horizMax) { K++; packed = greedyFit(K) }

  const spacing = K > 1 ? (basinR - basinL) / (K - 1) : 0
  const colX = (c: number) => (K === 1 ? (basinL + basinR) / 2 : basinL + spacing * c)

  const nodes: MapNode[] = []
  packed.cols.forEach((list, c) => {
    const colTotal = list.reduce((s, it) => s + slotH(it), 0)
    let y = TOP + Math.max(0, (usable - colTotal) / 2) // vertically center each column
    const x = colX(c)
    for (const it of list) {
      y += it.r
      nodes.push({ id: it.t.theme_id, x, y, r: it.r, flow: it.flow, labelW, enterRank: 0, theme: it.t })
      y += it.r + LABEL_H + GAP
    }
  })
  // Entrance order — biggest bubble first, then strictly descending by size (member_count, which also
  // sets the radius). Independent of the spatial packing above; this rank alone drives the staggered
  // reveal cascade (see --enter / --theme-stagger in global.css), so the map assembles largest → smallest.
  ;[...nodes].sort((a, b) => sizeCount(b.theme) - sizeCount(a.theme) || b.r - a.r).forEach((n, i) => { n.enterRank = i })
  return { lanes, core: { x: coreX, y: coreY, r: coreR }, nodes }
}

function hcurve(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${mx.toFixed(1)} ${y1.toFixed(1)} ${mx.toFixed(1)} ${y2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

// ---------------- the BOARD ----------------

function ThemeBoard({ themes, onPick, sliceLabel, stale }: { themes: Theme[]; onPick: (id: string) => void; sliceLabel: string; stale: boolean }) {
  const [showAllWorth, setShowAllWorth] = useState(false)
  const [showAllForming, setShowAllForming] = useState(false)
  const [showAllContext, setShowAllContext] = useState(false)
  // Ask the pure grouper for the full ranked lanes, then make first-look density a reversible display
  // choice. No row is delegated to the capped map or silently made unreachable.
  const groups = groupThemesForBriefing(themes, themes.length)
  const worth = showAllWorth ? groups.worthChecking : groups.worthChecking.slice(0, 5)
  const forming = showAllForming ? groups.forming : groups.forming.slice(0, 8)
  const context = showAllContext ? groups.context : groups.context.slice(0, 20)
  return (
    <div className="themebriefing">
      <section className="themebriefing__section" aria-labelledby="themes-worth-checking">
        <div className="themebriefing__sectionhead">
          <div>
            <h3 id="themes-worth-checking">{stale ? 'Last qualified' : 'Worth checking'}</h3>
            <p>{stale
              ? 'These patterns cleared the evidence gate at the last successful index. They are retained for audit and must be refreshed before entering the Ideas skim.'
              : 'Coherent evidence, a current reason, and a first-order ticker-linked direction. Their strongest evidence can enter the Ideas skim, where listing and liquidity are checked.'}</p>
          </div>
          <span>{groups.counts.worthChecking}</span>
        </div>
        {!worth.length ? (
          <div className="themebriefing__zero">
            <b>{stale
              ? `Nothing qualified in the last successful theme screen${sliceLabel ? ` for ${sliceLabel}` : ''}.`
              : `Nothing clears the theme screen${sliceLabel ? ` for ${sliceLabel}` : ''} right now.`}</b>
            <span>{groups.counts.forming
              ? stale
                ? `${groups.counts.forming} pattern${groups.counts.forming === 1 ? ' was' : 's were'} forming at that index; the then-missing proof is shown below.`
                : `${groups.counts.forming} pattern${groups.counts.forming === 1 ? ' is' : 's are'} still forming; the missing proof is shown below.`
              : stale
                ? 'No cluster had enough distinct evidence and an evidence-bound direction at the last successful index.'
                : 'The wire is being monitored, but no cluster has enough distinct evidence and a first-order ticker-linked direction to take your time.'}</span>
          </div>
        ) : (
          <div className="themebriefing__worth" id="themes-worth-list">
            {worth.map((t, rank) => (
              <ThemeBriefingRow key={t.theme_id} t={t} rank={rank + 1} onPick={onPick} sliceLabel={sliceLabel} stale={stale} />
            ))}
          </div>
        )}
        {groups.counts.worthChecking > 5 && (
          <button
            type="button"
            className="themebriefing__toggle"
            aria-expanded={showAllWorth}
            aria-controls="themes-worth-list"
            onClick={() => setShowAllWorth((v) => !v)}
          >
            {showAllWorth ? 'Show the top 5 only' : stale ? `Show all ${groups.counts.worthChecking} last-qualified themes` : `Show all ${groups.counts.worthChecking} worth-checking themes`}
          </button>
        )}
      </section>

      {groups.forming.length > 0 && (
        <section className="themebriefing__section themebriefing__section--forming" aria-labelledby="themes-forming">
          <div className="themebriefing__sectionhead">
            <div>
              <h3 id="themes-forming">{stale ? 'Previously forming' : 'Forming'}</h3>
              <p>{stale ? 'Patterns that were missing one or more required checks at the last successful index.' : 'Patterns still missing one or more required checks.'}</p>
            </div>
            <span>{groups.counts.forming}</span>
          </div>
          <div className="themeforming" id="themes-forming-list">
            {forming.map((t) => <ThemeFormingRow key={t.theme_id} t={t} onPick={onPick} stale={stale} />)}
          </div>
          {groups.forming.length > 8 && (
            <button
              type="button"
              className="themebriefing__toggle"
              aria-expanded={showAllForming}
              aria-controls="themes-forming-list"
              onClick={() => setShowAllForming((v) => !v)}
            >
              {showAllForming ? 'Show the first 8 forming themes' : `Show all ${groups.forming.length} forming themes`}
            </button>
          )}
        </section>
      )}

      {groups.context.length > 0 && (
        <details className="themecontext">
          <summary>
            <span><b>{stale ? 'Previous context' : 'Context'}</b> — tracked clusters that {stale ? 'did not clear' : 'do not clear'} the first-look bar</span>
            <em>{groups.counts.context}</em>
          </summary>
          <div className="themecontext__list" id="themes-context-list">
            {context.map((t) => <ThemeContextRow key={t.theme_id} t={t} onPick={onPick} />)}
          </div>
          {groups.context.length > 20 && (
            <button
              type="button"
              className="themebriefing__toggle"
              aria-expanded={showAllContext}
              aria-controls="themes-context-list"
              onClick={() => setShowAllContext((v) => !v)}
            >
              {showAllContext ? 'Show the first 20 context themes' : `Show all ${groups.context.length} context themes`}
            </button>
          )}
        </details>
      )}
    </div>
  )
}

function flowDeltaCopy(t: Theme): string {
  const delta = themeFlowDelta(t)
  if (delta == null) return 'Six-hour change unavailable'
  if (delta > 0) return `+${delta} evidence item${delta === 1 ? '' : 's'} vs prior 6h`
  if (delta < 0) return `${Math.abs(delta)} fewer evidence item${delta === -1 ? '' : 's'} vs prior 6h`
  return 'Evidence flow flat vs prior 6h'
}

function ThemeBriefingRow({ t, rank, onPick, sliceLabel, stale }: { t: Theme; rank: number; onPick: (id: string) => void; sliceLabel: string; stale: boolean }) {
  const assessment = themeSurfaceAssessment(t)!
  const directions = splitQualifiedThemeExpressions(t)
  const evidence = themeBriefingEvidence(t)
  return (
    <article className="themebrief" aria-labelledby={`themebrief-${t.theme_id}`}>
      <div className="themebrief__rank" aria-label={`Rank ${rank}`}>{rank}</div>
      <div className="themebrief__body">
        <div className="themebrief__top">
          <span className="themebrief__status">{stale ? 'Last qualified · stale' : 'Worth checking'}</span>
          <span className="themebrief__flow">{stale ? 'At last index · ' : ''}{flowDeltaCopy(t)} · {countLabel(t.member_count, sliceLabel)}</span>
        </div>
        <h4 id={`themebrief-${t.theme_id}`}>{t.name}</h4>
        <p className="themebrief__description"><b>Theme</b><span>{t.description}</span></p>
        <div className="themebrief__why">
          <b>{stale ? 'Why it qualified then' : 'Why it surfaced'}</b>
          <div>{assessment.reasons.length ? assessment.reasons.slice(0, 2).map((r, i) => <span key={i}>{r}</span>) : <span>The server qualified the pattern but returned no plain-English reason.</span>}</div>
        </div>
        <div className="themebrief__evidence">
          <b>{stale ? 'Evidence at last index' : 'Recent qualifying evidence'}</b>
          {evidence.length ? (
            <ul>
              {evidence.map((e) => (
                <li key={e.event_id}>
                  <span className="themebrief__evmeta"><strong className="mono">{e.score}</strong> {sourceTierLabel(e.source_tier)} · {fmtStampLocal(e.found_at)}</span>
                  <span className="themebrief__evhead">{e.headline}</span>
                </li>
              ))}
            </ul>
          ) : <span className="themebrief__missing">No qualifying evidence headline was returned.</span>}
        </div>
        <ThemeDirectionRead directions={directions} stale={stale} />
      </div>
      <aside className="themebrief__aside">
        <div className="themebrief__proof">
          <span><b>{assessment.metrics.unique_evidence_count}</b> distinct</span>
          <span><b>{assessment.metrics.high_quality_evidence_count}</b> supported-source</span>
          <span><b>{assessment.metrics.narrative_coherence_pct}%</b> coherent</span>
        </div>
        <button type="button" className="themebrief__open" onClick={() => onPick(t.theme_id)} aria-label={`${stale ? 'Inspect saved' : 'Open'} evidence and company map for ${t.name}`}>
          {stale ? 'Inspect saved evidence & company map' : 'Open evidence & company map'} <span aria-hidden>→</span>
        </button>
      </aside>
    </article>
  )
}

export function ThemeDirectionRead({ directions, stale = false }: { directions: ReturnType<typeof splitQualifiedThemeExpressions>; stale?: boolean }) {
  const groups = [
    { label: stale ? 'Tagged may gain' : 'May gain', tone: 'gain', items: directions.beneficiaries, tip: `${stale ? 'Last-indexed first-order candidate' : 'First-order candidate'} tied to the exact qualifying evidence rows that indicate it may gain if the theme holds` },
    { label: stale ? 'Tagged may be hurt' : 'May be hurt', tone: 'hurt', items: directions.harmed, tip: `${stale ? 'Last-indexed first-order candidate' : 'First-order candidate'} tied to the exact qualifying evidence rows that indicate it may be hurt if the theme holds` },
  ]
  const any = groups.some((g) => g.items.length)
  return (
    <div className="themebrief__directions">
      <b>{stale ? 'Candidates at last index' : 'First-order ticker-linked candidates'}</b>
      {!any ? <span className="themebrief__missing">No evidence-bound first-order direction is proven.</span> : groups.map((g) => g.items.length > 0 && (
        <div key={g.label} className={`themebrief__dir themebrief__dir--${g.tone}`}>
          <span>{g.label}</span>
          <div>{g.items.slice(0, 4).map((c) => {
            const proofCount = c.evidence_event_ids.length
            return (
              <em key={`${g.tone}-${c.name_key}-${c.ticker}`} title={`${g.tip} · ${proofCount} matching proof row${proofCount === 1 ? '' : 's'}`}>
                {themeCompanyLabel(c)} <small>{proofCount} proof</small>
              </em>
            )
          })}</div>
        </div>
      ))}
    </div>
  )
}

function ThemeFormingRow({ t, onPick, stale }: { t: Theme; onPick: (id: string) => void; stale: boolean }) {
  const assessment = themeSurfaceAssessment(t)
  const blockers = assessment?.blockers || []
  return (
    <article className="themeforming__row">
      <div className="themeforming__copy">
        <h4>{t.name}</h4>
        <p>{t.description}</p>
        <div className="themeforming__blockers">
          <b>{stale ? 'Needed then' : 'Still needed'}</b>
          {blockers.length ? <ul>{blockers.map((b, i) => <li key={i}>{b}</li>)}</ul> : <span>No blocker detail was returned.</span>}
        </div>
      </div>
      <div className="themeforming__aside">
        <span>{stale ? 'At last index · ' : ''}{flowDeltaCopy(t)}</span>
        <button type="button" onClick={() => onPick(t.theme_id)} aria-label={`${stale ? 'Inspect saved' : 'Open forming'} theme ${t.name}`}>{stale ? 'Inspect saved evidence' : 'Inspect evidence'} <span aria-hidden>→</span></button>
      </div>
    </article>
  )
}

function ThemeContextRow({ t, onPick }: { t: Theme; onPick: (id: string) => void }) {
  const assessment = themeSurfaceAssessment(t)
  const explanation = assessment?.blockers?.[0] || assessment?.reasons?.[0] || 'No qualification assessment was returned by the server.'
  return (
    <article className="themecontext__row">
      <div><h4>{t.name}</h4><p>{explanation}</p></div>
      <button type="button" onClick={() => onPick(t.theme_id)} aria-label={`Open context theme ${t.name}`}>Open <span aria-hidden>→</span></button>
    </article>
  )
}

// The flow sparkline. `interactive` (used on the deep-dive) adds a hover crosshair + a tooltip that
// names the hour and its item count, so you can read HOW the theme built over time, not just the shape.
// flow_series is hourly, newest bucket last, zero-filled to now — so point i is (n-1-i) hours before now.
function Sparkline({ series, w = 88, h = 18, interactive = false, fluid = false }: { series: number[]; w?: number; h?: number; interactive?: boolean; fluid?: boolean }) {
  const pad = 1
  const ref = useRef<SVGSVGElement>(null)
  const [hi, setHi] = useState<number | null>(null)
  const pts = sparklinePoints(series, w, h, pad)
  if (!pts) return <span className="sparkline sparkline--empty" />
  const coords = pts.split(' ').map((p) => p.split(',').map(Number))
  const last = coords[coords.length - 1]
  if (!interactive) {
    return (
      <svg className="sparkline" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
        <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {last && <circle cx={last[0]} cy={last[1]} r="2" fill="var(--accent-bright)" />}
      </svg>
    )
  }
  const n = series.length
  const stepX = n > 1 ? (w - pad * 2) / (n - 1) : 0
  const sel = hi == null ? null : coords[hi]
  const onMove = (e: { clientX: number }) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r || !r.width) return
    const x = (e.clientX - r.left) * (w / r.width)
    setHi(Math.max(0, Math.min(n - 1, Math.round((x - pad) / (stepX || 1)))))
  }
  // anchor the newest bucket at the current hour (local), each prior bucket one hour earlier
  const when = hi == null ? null : new Date(Math.floor(Date.now() / 3600_000) * 3600_000 - (n - 1 - hi) * 3600_000)
  const val = hi == null ? 0 : series[hi]
  return (
    <span className={`sparkline-wrap${fluid ? ' sparkline-wrap--fluid' : ''}`} style={fluid ? { width: '100%', maxWidth: w, height: h } : { width: w, height: h }}>
      <svg ref={ref} className="sparkline sparkline--live" width={fluid ? '100%' : w} height={h} viewBox={`0 0 ${w} ${h}`} onPointerMove={onMove} onPointerLeave={() => setHi(null)} role="img" aria-label="news flow by hour — hover for each hour’s item count">
        <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {last && <circle cx={last[0]} cy={last[1]} r="2" fill="var(--accent-bright)" />}
        {sel && <line className="sparkline__guide" x1={sel[0]} y1={pad} x2={sel[0]} y2={h - pad} />}
        {sel && <circle className="sparkline__dot" cx={sel[0]} cy={sel[1]} r="2.6" />}
      </svg>
      {sel && when && (
        <span className="sparkline__tip" style={{ left: `${(sel[0] / w) * 100}%` }}>
          <span className="sparkline__tip-time">{when.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' })}</span>
          <span className="sparkline__tip-val">{val} item{val === 1 ? '' : 's'}</span>
        </span>
      )}
    </span>
  )
}

// ---------------- the DEEP-DIVE ----------------

// The plain-English explainer under the title: read these few sentences and you understand the theme.
// Loading shows a calm 3-line skeleton (never a spinner); once written it reads as a comfortable
// paragraph. `canRefresh` (a real brief object exists) gates the rewrite affordance, so the bare
// one-line-description fallback — e.g. the static showcase, where a rewrite would be a no-op — shows no
// button. An in-place refresh keeps the old text and spins the icon; aria-busy + aria-live announce it.
function ThemeBriefBlock({ brief, note, loading, refreshing, canRefresh, onRefresh }: { brief: string; note?: string; loading: boolean; refreshing: boolean; canRefresh: boolean; onRefresh: () => void }) {
  if (loading) {
    return (
      <div className="themedd__brief" aria-busy="true" aria-label="Writing a brief on this theme…">
        <span className="themedd__briefline" />
        <span className="themedd__briefline" />
        <span className="themedd__briefline themedd__briefline--short" />
      </div>
    )
  }
  if (!brief) return null
  return (
    <div className="themedd__brief" aria-busy={refreshing}>
      <p className="themedd__brieftext" aria-live="polite">{brief}</p>
      {(note || canRefresh) && (
        <div className="themedd__briefmeta">
          {note && <span className="themedd__briefnote" title={note}>from headlines</span>}
          {canRefresh && (
            <button type="button" className={`themedd__briefrefresh${refreshing ? ' is-on' : ''}`} onClick={onRefresh} disabled={refreshing} aria-busy={refreshing} title="Rewrite this brief from the latest news" aria-label="Rewrite this brief">
              <span className="themedd__briefrefresh-i" aria-hidden>↻</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ---- order tiers + the per-company "why is it here" popover ----

// Which order tier a chip sits in, spoken, for the popover badge + the aria label.
const ORDER_NOUN: Record<number, string> = { 1: 'Direct (1st-order)', 2: 'Ripple (2nd-order)', 3: 'Read-across (3rd-order)' }
// One card is open at a time, so a single stable id is enough to point the active chip's aria-describedby
// at it — a screen reader then announces the card's reason + stories + impact on focus (not just the label).
const WHY_CARD_ID = 'themewhy-card'
// The four impact sub-scores (0–25 each) in plain English — short label for the bar, long for the title.
const IMPACT_BARS: { key: keyof ThemeCompany['impact']; short: string; long: string }[] = [
  { key: 'directness', short: 'direct', long: 'How directly the theme’s news points at it' },
  { key: 'magnitude', short: 'size', long: 'How material the news naming it is' },
  { key: 'speed', short: 'speed', long: 'How fast the driving event plays out' },
  { key: 'reversibility', short: 'lasting', long: 'How lasting the effect is (structural vs easily hedged)' },
]
const scoreTone = (n: number) => (n >= 70 ? 'var(--live)' : n >= 40 ? 'var(--accent-bright)' : 'var(--text-faint)')

// The reason shown when the server hasn't sent a `why` (an OLD engine during a deploy, DESIGN.md §5) — a
// plain, honest fallback built from the fields the chip already has, so the card is never empty pre-deploy.
function fallbackReason(c: ThemeCompany): string {
  const times = c.mention_count <= 0 ? 'named' : c.mention_count === 1 ? 'named once' : `named ${c.mention_count} times`
  const noun = c.order === 1 ? 'a direct (first-order)' : c.order === 2 ? 'a ripple (second-order)' : 'a read-across (third-order)'
  return `${times} in this theme’s news — ${noun} name.`
}

type WhyPos = { left: number; top: number; width: number; originX: number; originY: 'top' | 'bottom' }
type WhyActive = { key: string; c: ThemeCompany; sticky: boolean; rect: DOMRect; instant: boolean }

// A stable, always-mounted description target so aria-describedby resolves from the FIRST focus event
// (a screen reader reads the accessibility tree at focus time — an id added only after focus, once React
// commits the "card is open" state, is too late for many readers). aria-live announces content changes
// even when focus stays on the same chip (e.g. Tab moving the card between adjacent chips).
const WHY_DESC_ID = 'themewhy-desc'

/** Place the card against the chip using its MEASURED height: below by default, flipped above when below
 *  can't hold it and above has more room, then clamped so it never runs off the top or bottom. The
 *  transform-origin sits under the chip (origin-aware, DESIGN.md §3 / emil). Absolute top (not bottom) so
 *  the clamp is exact regardless of which side it opened toward. */
function placeWhy(rect: DOMRect, height: number): WhyPos {
  const GAP = 8
  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(320, vw - 16)
  const belowSpace = vh - rect.bottom
  const above = belowSpace < height + GAP && rect.top - GAP > belowSpace
  const left = Math.max(8, Math.min(rect.left, vw - 8 - width))
  const originX = Math.max(14, Math.min(width - 14, rect.left + rect.width / 2 - left))
  const rawTop = above ? rect.top - GAP - height : rect.bottom + GAP
  const top = Math.max(8, Math.min(rawTop, vh - 8 - height)) // never clip top or bottom
  return { left, top, width, originX, originY: above ? 'bottom' : 'top' }
}

// The orders section: three tiers of company chips. Hovering (or tapping) a chip opens a single shared
// card explaining WHY it sits in that tier — the plain reason + the real stories that named it + the
// impact breakdown. One card at a time (a tooltip singleton), portaled so it never clips the scroll panel.
function ThemeOrders({ orders }: { orders: [string, ThemeCompany[]][] }) {
  const [active, setActive] = useState<WhyActive | null>(null)
  const openRef = useRef(false) // is a card currently open? — drives the instant-subsequent-hover skip (emil)
  const openTimer = useRef<number | undefined>(undefined)
  const closeTimer = useRef<number | undefined>(undefined)
  const openedAt = useRef(0) // when the current card opened — lets onScroll ignore the auto-scroll that FOCUS itself causes
  const activeRef = useRef<WhyActive | null>(null)
  activeRef.current = active
  const fine = () => typeof window !== 'undefined' && !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches

  const clearTimers = () => { window.clearTimeout(openTimer.current); window.clearTimeout(closeTimer.current) }
  const close = () => { clearTimers(); openRef.current = false; setActive(null) }

  const openFor = (key: string, c: ThemeCompany, el: HTMLElement, sticky: boolean, instant: boolean) => {
    clearTimers()
    openRef.current = true
    openedAt.current = performance.now()
    setActive({ key, c, sticky, rect: el.getBoundingClientRect(), instant })
  }

  // hover intent: open after a short delay, or INSTANTLY if a card is already open (adjacent chips read fast)
  const onEnter = (key: string, c: ThemeCompany, el: HTMLElement) => {
    if (!fine() || activeRef.current?.sticky) return
    clearTimers()
    if (openRef.current) { openFor(key, c, el, false, true); return }
    openTimer.current = window.setTimeout(() => openFor(key, c, el, false, false), 120)
  }
  const onLeave = (key: string) => {
    window.clearTimeout(openTimer.current)
    const a = activeRef.current
    if (!a || a.sticky || a.key !== key) return
    closeTimer.current = window.setTimeout(() => { if (!activeRef.current?.sticky) close() }, 110)
  }
  // click toggles a sticky card (also the touch path — no hover there); focus previews; blur closes a hover card
  const onClick = (key: string, c: ThemeCompany, el: HTMLElement) => {
    const a = activeRef.current
    if (a?.key === key && a.sticky) { close(); return }
    openFor(key, c, el, true, true)
  }
  // focus always moves the card to the newly-focused chip (keyboard Tab), replacing any prior card — so a
  // pinned card never strands focus on a different chip. Opened non-sticky (a preview); Enter/Space pins it.
  const onFocus = (key: string, c: ThemeCompany, el: HTMLElement) => openFor(key, c, el, false, true)
  const onBlur = (key: string) => { const a = activeRef.current; if (a && !a.sticky && a.key === key) close() }

  // while a card is open: Esc + an outside pointerdown close a sticky card; a genuine user scroll/resize
  // closes both (a fixed card would detach from a chip that scrolled away). The scroll a keyboard FOCUS
  // triggers to bring an off-screen chip into view fires right after open — ignore it, or the card the
  // focus just opened would vanish in the same frame.
  // Registered once (not re-bound per open/close) — every handler reads activeRef.current so it always
  // sees the live state without the effect re-running on every hover/focus transition.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && activeRef.current) close() }
    const onDown = (e: PointerEvent) => { if (activeRef.current?.sticky && !(e.target as HTMLElement)?.closest?.('.themedd__co, .themewhy')) close() }
    const onScroll = () => { if (activeRef.current && performance.now() - openedAt.current > 300) close() } // skip the focus-induced auto-scroll
    const onResize = () => { if (activeRef.current) close() }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [])
  useEffect(() => () => clearTimers(), [])

  return (
    <div className="themedd__orders">
      {orders.map(([label, cos]) => cos.length > 0 && (
        <div key={label} className="themedd__ordergrp">
          <div className="themedd__orderlabel">{label}</div>
          <div className="themedd__cos">
            {real(cos).slice(0, 12).map((c, i) => {
              const key = `${label}-${c.name_key || c.name}-${i}`
              const on = active?.key === key
              const ticker = validThemeTicker(c.ticker) ? c.ticker!.trim() : null
              return (
                <button
                  key={key}
                  type="button"
                  className={`themedd__co themedd__co--${c.side}${on ? ' is-open' : ''}`}
                  aria-expanded={on && !!active?.sticky}
                  aria-describedby={WHY_DESC_ID}
                  aria-label={`${ticker ? `${ticker} ` : ''}${c.name} — ${ORDER_NOUN[c.order]} in this theme`}
                  onPointerEnter={(e) => onEnter(key, c, e.currentTarget)}
                  onPointerLeave={() => onLeave(key)}
                  onFocus={(e) => onFocus(key, c, e.currentTarget)}
                  onBlur={() => onBlur(key)}
                  onClick={(e) => onClick(key, c, e.currentTarget)}
                >
                  {ticker ? <b>{ticker}</b> : null}{c.name}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {/* sr-only, always mounted (not portaled) — see WHY_DESC_ID above */}
      <span id={WHY_DESC_ID} className="sr-only" aria-live="polite">{active ? (active.c.why?.reason || fallbackReason(active.c)) : ''}</span>
      {active && <CompanyWhyCard key={active.key} c={active.c} rect={active.rect} instant={active.instant} sticky={active.sticky} />}
    </div>
  )
}

// The card itself — portaled into the active swarm's token scope (falling back to <body>) so `position:
// fixed` still escapes the scroll panel/any transformed ancestor, but the swarm-scoped color tokens
// ([data-swarm], DESIGN.md) still resolve — a plain document.body portal would fall back to the root
// research amber tokens in a screener/commodity context. Pure information visually (pointer-events: none;
// pointer-events: auto only while sticky, so a tap on the open card can't fall through to whatever sits
// beneath it) — the reason, the sourced stories, and the impact bars. It renders hidden for one layout
// pass, MEASURES its real height, then places itself against the chip so it can never clip the top or
// bottom (heights vary with the number of stories). useLayoutEffect runs before paint, so there is no
// visible jump.
function CompanyWhyCard({ c, rect, instant, sticky }: { c: ThemeCompany; rect: DOMRect; instant: boolean; sticky: boolean }) {
  const why = c.why
  const reason = why?.reason || fallbackReason(c)
  const evidence = why?.evidence || []
  const ticker = validThemeTicker(c.ticker) ? c.ticker!.trim() : null
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<WhyPos | null>(null)
  useLayoutEffect(() => {
    const h = ref.current?.offsetHeight ?? 300
    setPos(placeWhy(rect, h))
  }, [rect])
  const style: CSSProperties = pos
    ? { left: pos.left, top: pos.top, width: pos.width, transformOrigin: `${pos.originX}px ${pos.originY}` }
    : { left: rect.left, top: 0, width: Math.min(320, window.innerWidth - 16), visibility: 'hidden' } // measured next frame
  // aria-hidden: the description that matters to a screen reader is WHY_DESC_ID (a stable, always-mounted
  // sr-only region, wired via aria-describedby) — this visual card is not referenced by any aria-* attribute,
  // so hide it from the accessibility tree rather than let a browse-mode virtual cursor surface it twice.
  return createPortal(
    <div ref={ref} id={WHY_CARD_ID} className={`themewhy${pos && instant ? ' themewhy--instant' : ''}${sticky ? ' themewhy--sticky' : ''}`} aria-hidden="true" style={style}>
      <div className="themewhy__head">
        {ticker ? <b className="themewhy__tk mono">{ticker}</b> : null}
        <span className="themewhy__name">{c.name}</span>
        <span className={`themewhy__tier themewhy__tier--o${c.order}`}>{orderLabel(c.order)}</span>
        <span className={`themewhy__side themewhy__side--${c.side}`}>{c.side === 'beneficiary' ? 'may gain' : c.side === 'harmed' ? 'may be hurt' : 'direction mixed'}</span>
      </div>
      <p className="themewhy__reason">{reason}</p>
      {evidence.length > 0 ? (
        <div className="themewhy__ev">
          <div className="themewhy__evlabel">Why it’s here — the stories that named it</div>
          <ul className="themewhy__evlist">
            {evidence.map((e) => (
              <li key={e.event_id} className="themewhy__evrow">
                <span className="themewhy__evscore mono" style={{ color: scoreTone(e.score) }}>{e.score}</span>
                <span className="themewhy__evhl">{e.headline}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="themewhy__evempty">Named in this theme’s recent news.</div>
      )}
      <div className="themewhy__impact">
        <span className="themewhy__impacttitle">Impact <b className="mono">{c.impact?.composite ?? 0}</b><span className="themewhy__impactmax">/100</span></span>
        <div className="themewhy__bars">
          {IMPACT_BARS.map((b) => {
            const v = Math.max(0, Math.min(25, c.impact?.[b.key] ?? 0))
            return (
              <div key={b.key} className="themewhy__bar" title={`${b.long}: ${v}/25`} aria-label={`${b.short} ${v} of 25`}>
                <span className="themewhy__barlabel" aria-hidden>{b.short}</span>
                <span className="themewhy__bartrack" aria-hidden><span className="themewhy__barfill" style={{ transform: `scaleX(${v / 25})` }} /></span>
              </div>
            )
          })}
        </div>
      </div>
    </div>,
    document.querySelector('.app[data-swarm]') ?? document.body,
  )
}

function ThemeDeepDive({ sourceSlice, stale, generatedAt }: { sourceSlice: ThemeSliceDisplay; stale: boolean; generatedAt: string | null }) {
  const selectedId = useStore((s) => s.selectedTheme)
  const detail = useStore((s) => s.themeDetail)
  const detailError = useStore((s) => s.themeDetailError)
  const loading = useStore((s) => s.themesLoading)
  const brief = useStore((s) => s.themeBrief)
  const briefLoading = useStore((s) => s.themeBriefLoading)
  const selectTheme = useStore((s) => s.selectTheme)
  const regenerateThemeBrief = useStore((s) => s.regenerateThemeBrief)
  const scSelectEvent = useStore((s) => s.scSelectEvent)
  const runEventChecks = useStore((s) => s.runEventChecks)

  if (loading) {
    return (
      <div className="themedd">
        <button type="button" className="themedd__back" onClick={() => selectTheme(null)}>← Themes</button>
        {stale && <ThemeDeepDiveStaleNote generatedAt={generatedAt} />}
        {sourceSlice.active && <ThemeDeepDiveScopeNote sourceSlice={sourceSlice} />}
        <div className="themes__empty"><div className="themes__shimmer" /></div>
      </div>
    )
  }
  if (!detail) {
    return (
      <div className="themedd">
        <button type="button" className="themedd__back" onClick={() => selectTheme(null)}>← Themes</button>
        {stale && <ThemeDeepDiveStaleNote generatedAt={generatedAt} />}
        {sourceSlice.active && <ThemeDeepDiveScopeNote sourceSlice={sourceSlice} />}
        <div className="themedd__loadfail" role="alert">
          <b>Theme detail could not be loaded.</b>
          <span>The Themes list is still available. Retry this detail, or go back and inspect another theme.</span>
          {detailError && <small>{detailError}</small>}
          <div>
            <button type="button" className="btn" onClick={() => selectTheme(null)}>Back to Themes</button>
            {selectedId && <button type="button" className="btn btn--amber" onClick={() => void selectTheme(selectedId)}>Retry detail</button>}
          </div>
        </div>
      </div>
    )
  }
  const t = detail.theme
  const orders: [string, ThemeCompany[]][] = [['Direct (1st-order)', detail.companies_by_order.first], ['Ripple (2nd-order)', detail.companies_by_order.second], ['Read-across (3rd-order)', detail.companies_by_order.third]]
  const top = detail.members[0]
  return (
    <div className="themedd">
      <div className="themedd__head">
        <button type="button" className="themedd__back" onClick={() => selectTheme(null)}>← Themes</button>
        <span className={`themecard__tier themecard__tier--${t.tier}`}>{stale ? 'Last indexed' : tierLabel(t.tier)}</span>
        <span className="themedd__score mono">{t.composite}<span className="themedd__score-sub">/100</span></span>
        <span className="themedd__flow">{stale ? `saved snapshot · ${t.member_count} items` : `${momentumOf(t)}${t.fresh_flow ? ` · +${t.fresh_flow} fresh` : ''} · ${t.member_count} items`}</span>
      </div>
      {stale && <ThemeDeepDiveStaleNote generatedAt={generatedAt} />}
      {sourceSlice.active && <ThemeDeepDiveScopeNote sourceSlice={sourceSlice} />}
      <h2 className="themedd__name">{t.name}</h2>
      {/* the plain-English brief — read these few sentences and you understand the theme; loads in its
          own slot (a first-time read takes a beat) so the rest of the deep-dive never waits on it. */}
      <ThemeBriefBlock brief={brief?.brief?.trim() || (briefLoading ? '' : t.description)} note={brief?.generation === 'deterministic' ? brief?.note : undefined} loading={briefLoading && !brief} refreshing={briefLoading} canRefresh={!stale && !!brief} onRefresh={regenerateThemeBrief} />
      <div className="themedd__sparkrow"><Sparkline series={t.flow_series} w={220} h={36} interactive fluid /><span className="themedd__scores">{stale ? 'last-indexed scores · ' : ''}freshness {detail.scores.freshness} · breadth {detail.scores.breadth} · staying power {detail.scores.persistence}</span></div>

      <ThemeOrders orders={orders} />

      {detail.related_themes.length > 0 && (
        <div className="themedd__related">
          <span className="themedd__rellabel">Linked themes:</span>
          {detail.related_themes.slice(0, 5).map((r) => (
            <button key={r.theme_id} type="button" className={`themedd__relchip${r.kind === 'opposite' ? ' is-opposite' : ''}`} onClick={() => selectTheme(r.theme_id)}>{r.kind === 'opposite' ? '⇄ ' : ''}{r.name}</button>
          ))}
        </div>
      )}

      <div className="themedd__newshead">{stale ? 'News in the last loaded theme detail' : 'The news in this theme'}</div>
      <div className="themedd__news">
        {detail.members.slice(0, 24).map((m) => (
          <button key={`${m.event_id}-${m.ts}`} type="button" className="themedd__row" onClick={() => scSelectEvent(m as FeedItem)}>
            <span className="themedd__rowscore mono" style={{ color: m.triage_score >= 70 ? 'var(--live)' : m.triage_score >= 40 ? 'var(--accent-bright)' : 'var(--text-faint)' }}>{m.triage_score}</span>
            <span className="themedd__rowhead" title={m.headline_en && m.headline_en !== m.headline ? `original: ${m.headline}` : undefined}>{displayHeadline(m)}</span>
            <span className="themedd__rowsrc mono" title="When this was published (your local time)">{fmtStampLocal(m.ts)}</span>
            <span className="themedd__rowsrc">{m.source_name}</span>
          </button>
        ))}
      </div>

      {top && (
        <div className="themedd__actions">
          <button type="button" className="btn btn--amber" onClick={() => runEventChecks(top as FeedItem)}>Run the checks on {stale ? 'this saved top story' : 'the top story'}</button>
        </div>
      )}
    </div>
  )
}

function ThemeDeepDiveStaleNote({ generatedAt }: { generatedAt: string | null }) {
  const stamp = fmtStampLocal(generatedAt || undefined)
  return (
    <div className="themedd__scope themedd__scope--stale" role="alert">
      <b>Last successful Themes snapshot{stamp ? ` · ${stamp}` : ''}</b>
      <span>Refresh failed. This detail and its qualification evidence are retained for audit, not current. Refresh Themes before treating the direction, scores, or company map as live.</span>
    </div>
  )
}

function ThemeDeepDiveScopeNote({ sourceSlice }: { sourceSlice: ThemeSliceDisplay }) {
  return (
    <div className="themedd__scope" role="note">
      <b>Opened from {sourceSlice.label}</b>
      <span>This detail uses the theme’s global evidence, companies, and generated brief because the detail API cannot slice them yet. The first-look qualification you opened was scoped to {sourceSlice.label}.</span>
    </div>
  )
}
