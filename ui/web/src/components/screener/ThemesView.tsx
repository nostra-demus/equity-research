// The dynamic-themes view: the living, ranked investment themes the news firehose is bucketed into.
// Two ways to look at the same themes[] — a spatial MAP (sources → ranking lens → theme basins, with
// hot basins risen + pulsing) and a ranked BOARD of evidence-bound thesis dossiers — plus a deep-dive
// that reuses the existing event reader + "run the checks" funnel. Custom inline SVG
// (no graph lib), tokens-only colour, transform/opacity animation, reduced-motion aware.

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { fmtStampLocal } from '../../lib/format'
import { displayHeadline } from '../../lib/plain'
import { handleRovingRadioKeyDown, rovingRadioTabStopIndex } from '../../lib/rovingRadio'
import { useStore } from '../../lib/store'
import { formationCandidateEvidence, heatOf, momentumOf, qualifiedThemeExpressions, recentFlow, radiusFor, sparklinePoints, themeCompilerCapacityCopy, tierColorVar, tierLabel, THEME_WINDOWS, THEMES_STAGE_MAX_AGE_MS, flowInWindow, groupThemeEvidence, heatInWindow, windowCoverage, windowLabel, groupThemesForBriefing, shouldHideThemeIntake, shouldResetThemeWindow, sourceTierLabel, themeBriefingEvidence, themeCompanyLabel, themeFlowDelta, themeForMapHover, themeMapMode, themeSliceDisplay, themeStageIsStale, themesForPmSurface, themeSurfaceAssessment, themeWindowForView, validatedThemeNarrative, type Theme, type ThemeActivity, type ThemeCompilerHealth, type ThemeConviction, type ThemeExpressionRole, type ThemeFormationCandidate, type ThemeFormationQueue, type ThemeSliceDisplay, type ThemeWindow, type ValidatedThemeEvidence, type ValidatedThemeQualifiedExpression, type WindowCoverage } from '../../lib/themes'
import type { FeedItem, IntensityWindow } from '../../lib/types'
import { useWireConfig } from '../wire/WireContext'

const TIERS = ['all', 'hot', 'active', 'cooling', 'parked'] as const
const THEMES_PROJECTION_REFRESH_MS = 60_000

function disclosedCompilerDebt(queue: ThemeFormationQueue | null): number {
  return queue ? queue.awaiting_validation + queue.awaiting_revalidation + queue.blocked_incomplete_audit : 0
}

/** Formation total includes safely disclosed building-evidence rows; compiler health also includes unsafe
 * debt withheld from that lane. Count their union instead of taking max() across different populations. */
function totalFormationDebt(queue: ThemeFormationQueue | null, health: ThemeCompilerHealth | null): number {
  return (queue?.total || 0) + Math.max(0, (health?.queue.total || 0) - disclosedCompilerDebt(queue))
}

export function themeMapEmptyCopy(tier: (typeof TIERS)[number], win: ThemeWindow | null): string {
  const heat = tier === 'all' ? '' : tierLabel(tier)
  if (win && heat) return `No validated investment theme in the ${heat} heat tier took qualifying news in ${win.full}. Clear the heat filter or try another window.`
  if (win) return `No validated investment theme took qualifying news in ${win.full}. Try a longer window or return to Live.`
  if (heat) return `No validated actionable or forming investment theme matches the ${heat} heat tier. Clear the heat filter to see every validated theme.`
  return 'No validated actionable or forming investment theme is available. Raw Context clusters stay off this PM surface until they have a complete thesis contract.'
}

// The map's central readout + source-lane mix are labelled by the active intensity-rollup window, which
// the single "When" ribbon drives (see intensityWindowForHours) — there is no separate intensity picker.
// 'scan' = the live per-cycle readout; the rest are small server-side rollups over the window.
const WINDOW_LABEL: Record<IntensityWindow, string> = { scan: 'this scan', '1h': 'last hour', '4h': 'last 4h', day: 'last 24h', '7d': 'last 7 days' }

export function ThemesView() {
  const themes = useStore((s) => s.themes)
  const formationQueue = useStore((s) => s.themeFormationQueue)
  const compilerHealth = useStore((s) => s.themeCompilerHealth)
  const view = useStore((s) => s.themesView)
  const status = useStore((s) => s.themesStatus)
  const selectedTheme = useStore((s) => s.selectedTheme)
  const themesWindow = useStore((s) => s.themesWindow)
  const themesGeo = useStore((s) => s.themesGeo)
  const themesSubject = useStore((s) => s.themesSubject)
  const historyDays = useStore((s) => s.themesHistoryDays)
  const generatedAt = useStore((s) => s.themesGeneratedAt)
  const projectedAt = useStore((s) => s.themesProjectedAt)
  const setThemesView = useStore((s) => s.setThemesView)
  const setThemesWindow = useStore((s) => s.setThemesWindow)
  const selectTheme = useStore((s) => s.selectTheme)
  const refreshThemes = useStore((s) => s.refreshThemes)
  const retryThemes = useStore((s) => s.retryThemes)
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

  const pmThemes = useMemo(() => themesForPmSurface(themes), [themes])
  const shown = useMemo(() => {
    // Heat is an exploration control, not the briefing's qualification bar. A heat chip selected on the
    // map must never admit raw Context clusters or hide a qualified row on the briefing.
    if (view !== 'map') return pmThemes
    const byTier = tier === 'all' ? pmThemes : pmThemes.filter((t) => t.tier === tier)
    if (windowHours == null) return byTier
    return byTier.filter((t) => flowInWindow(t, windowHours) > 0).sort((a, b) => heatInWindow(b, windowHours) - heatInWindow(a, windowHours))
  }, [pmThemes, tier, view, windowHours])
  const briefingCounts = useMemo(() => groupThemesForBriefing(themes).counts, [themes])
  const formationDebt = totalFormationDebt(formationQueue, compilerHealth)
  const formationDisclosureAvailable = formationQueue !== null || compilerHealth !== null

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

  // Projection reads can remain healthy while the thesis compiler is stalled. Only generated_at is the
  // evidence-stage clock; projected_at is useful audit metadata but cannot paint this screen live.
  const stageStale = themeStageIsStale(generatedAt)
  // Missing/aged stage truth is stale even when the result set is empty. An empty old stage is not proof
  // that nothing qualifies now, and a cold error must never inherit the green/current presentation.
  const stale = status !== 'ready' || stageStale
  // A current thesis projection and an unavailable compiler are separate axes. Do not let a fresh
  // generated_at paint a green live banner over formation debt that cannot currently be processed.
  const compilerLimited = !stale && formationDebt > 0 && (compilerHealth?.state === 'blocked' || compilerHealth?.state === 'degraded')
  const compilerStatusUnobserved = (compilerHealth?.queue.total || 0) > 0 && compilerHealth?.last_attempt === null
    && (compilerHealth.state === 'ready' || compilerHealth.state === 'idle') && compilerHealth.blocker === null
  const compilerStatusUnavailable = !stale && (compilerHealth === null || compilerStatusUnobserved)

  if (selectedTheme) return <ThemeDeepDive sourceSlice={slice} stale={stale} refreshFailed={status === 'error'} generatedAt={generatedAt} />

  const cov = win ? windowCoverage(win, historyDays) : null
  const windowedTotal = win ? shown.reduce((n, t) => n + flowInWindow(t, windowHours), 0) : 0
  const windowCoverages = THEME_WINDOWS.map((w) => windowCoverage(w, historyDays))
  const selectedWindowIndex = THEME_WINDOWS.findIndex((w) => effectiveWindow === w.hours)
  const windowTabStopIndex = rovingRadioTabStopIndex(selectedWindowIndex, windowCoverages.map((coverage) => coverage.selectable))
  const generatedStamp = fmtStampLocal(generatedAt || undefined)
  const projectedStamp = fmtStampLocal(projectedAt || undefined)
  const hasCachedDisclosure = themes.length > 0 || formationDebt > 0
  const freshnessCopy = status === 'error'
    ? hasCachedDisclosure ? `stale · last successful index ${generatedStamp || 'time unknown'}` : 'refresh failed · no cached index'
    : status === 'loading'
      ? hasCachedDisclosure ? `refreshing · last good index ${generatedStamp || 'time unknown'}` : 'building first index…'
      : stageStale
        ? `saved screen · last successful stage ${generatedStamp || 'time unknown'} · older than ${THEMES_STAGE_MAX_AGE_MS / 60_000}m`
        : generatedStamp ? `stage ${generatedStamp}` : 'stage time unavailable'
  const sliceSuffix = slice.active ? ` · ${slice.label}` : ''
  const noRowsCopy = status === 'error'
    ? `index unavailable${sliceSuffix}`
    : status === 'loading'
      ? `loading${sliceSuffix}`
      : stageStale
        ? `last successful screen is not current${sliceSuffix}`
      : formationDebt
        ? `no validated thesis yet · ${formationDebt} developing pattern${formationDebt === 1 ? '' : 's'} outside validated theses${sliceSuffix}`
        : !formationDisclosureAvailable
          ? `no validated thesis · formation status unavailable${sliceSuffix}`
          : `nothing formed${sliceSuffix}`

  return (
    <div className="themes" aria-busy={status === 'loading'}>
      <header className="themes__head">
        <div className="themes__title">
          <div className="themes__titleline">
            <span className="themes__titlemain">Themes {view === 'map' ? 'explorer' : 'briefing'}</span>
            <span className={`themes__freshness${status === 'error' || (status === 'ready' && stageStale) ? ' is-stale' : ''}`} role="status" aria-live="polite" title={projectedStamp ? `Read-time score projection: ${projectedStamp}. Thesis-stage freshness is based only on the successful-stage timestamp.` : undefined}>{freshnessCopy}</span>
          </div>
          <span className="themes__sub">
            {!themes.length && !formationDebt
              ? noRowsCopy
              : stale
                ? view === 'map'
                  ? `Last successful explorer snapshot${sliceSuffix} · ${pmThemes.length} validated themes · retained evidence, not current`
                  : `Last successful screen${sliceSuffix} · ${briefingCounts.worthChecking} previously actionable · ${briefingCounts.forming} previously forming · not current`
              : view === 'map'
                ? win
                  ? `Validated investment-thesis map${sliceSuffix} · ${win.full}`
                  : `${pmThemes.length} validated investment theme${pmThemes.length === 1 ? '' : 's'}${slice.active ? ` in ${slice.label}` : ''} · raw context clusters are excluded`
                : `Current screen${sliceSuffix} · ${briefingCounts.worthChecking} actionable · ${briefingCounts.forming} forming${formationDebt ? ` · ${formationDebt} developing pattern${formationDebt === 1 ? '' : 's'} outside validated theses` : ''} · evidence-led theses, not investment ratings`}
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
        <div className={`themes__current${stale ? ' themes__current--stale' : compilerLimited || compilerStatusUnavailable ? ' themes__current--compiler-limited' : ''}`} role={stale ? 'alert' : 'note'} aria-live="polite">
          {!stale && !compilerLimited && !compilerStatusUnavailable && <span className="themes__tldot themes__tldot--live" aria-hidden />}
          <span>{stale
            ? status === 'error'
              ? hasCachedDisclosure
                ? `Refresh failed. Showing the last successful briefing${generatedStamp ? ` from ${generatedStamp}` : ''}; its qualification and evidence are retained for audit, not current.`
                : 'Themes refresh failed before any briefing was cached.'
              : status === 'loading'
                ? hasCachedDisclosure
                  ? `Refreshing Themes. The last successful disclosure${generatedStamp ? ` is from ${generatedStamp}` : ' has no valid timestamp'} and remains a saved snapshot until this refresh completes.`
                  : 'Building the first Themes index. No prior briefing is cached.'
                : `The last successful thesis stage${generatedStamp ? ` was ${generatedStamp}` : ' has no valid timestamp'} and is older than ${THEMES_STAGE_MAX_AGE_MS / 60_000} minutes. A newer score projection${projectedStamp ? ` from ${projectedStamp}` : ''} does not make its evidence current.`
            : compilerLimited
              ? `Validated thesis screen current${sliceSuffix}; developing-pattern compiler ${compilerHealth!.state}. ${compilerHealth!.message || 'Queued patterns remain non-investable until validation can run.'}`
              : compilerStatusUnavailable
                ? compilerHealth === null
                  ? `Validated thesis screen current${sliceSuffix}; developing-pattern compiler status is not disclosed by this server.`
                  : `Validated thesis screen current${sliceSuffix}; no compiler capacity check has been recorded for the queued patterns yet.`
              : `Current-only briefing${sliceSuffix} · supporting evidence in the last 6 hours compared with the prior 6 hours`}</span>
          {stale && <button type="button" className="themes__retry" disabled={status === 'loading'} onClick={() => void retryThemes()}>{status === 'loading' ? 'Refreshing Themes…' : 'Retry Themes refresh'}</button>}
        </div>
      )}

      {status === 'loading' && !themes.length && !formationDebt ? (
        <div className="themes__empty" role="status" aria-live="polite"><div className="themes__shimmer" /><p>Reading the wire and compiling investment themes…</p></div>
      ) : status === 'error' && !themes.length && !formationDebt ? (
        <div className="themes__empty" role="alert" aria-live="assertive">
          <div className="themes__emptyorb" />
          <p>The themes index could not refresh, and there is no cached briefing to show. The wire itself may still be available.</p>
          <button type="button" className="themes__retry" onClick={() => void retryThemes()}>Retry Themes</button>
        </div>
      ) : view === 'board' ? (
        <ThemeBoard themes={themes} formationQueue={formationQueue} compilerHealth={compilerHealth} onPick={selectTheme} sliceLabel={slice.active ? slice.label : ''} stale={stale} loading={status === 'loading'} />
      ) : !themes.length ? (
        formationDebt ? (
          <div className="themes__mapzero">
            <div className="themes__empty themes__empty--compact">
              <div className="themes__emptyorb" />
              <p>No validated investment theme is available for the Explore map. The patterns below stay outside the map until they clear the current compiler contract.</p>
            </div>
            <FormationQueuePanel queue={formationQueue} compilerHealth={compilerHealth} stale={stale} loading={status === 'loading'} compact />
          </div>
        ) : (
        <div className="themes__empty">
          <div className="themes__emptyorb" />
          <p>{stale
            ? `The last successful Themes stage contained no validated investment theme${slice.active ? ` for ${slice.label}` : ''}, but that stage is no longer current. Refresh before treating the empty result as today's answer.`
            : slice.active
            ? `No themes are being driven by ${slice.label} news right now. Clear or change the active scope to widen the screen.`
            : !formationDisclosureAvailable
            ? 'No validated investment theme is available. This server did not disclose the formation queue or compiler status, so the presence of developing patterns is unknown.'
            : 'No theme evidence has cleared the briefing yet. As distinct current stories form a coherent narrative, this view will show what cleared the bar and what is still missing.'}</p>
        </div>)
      ) : view === 'map' && !shown.length ? (
        <div className="themes__empty">
          <div className="themes__emptyorb" />
          <p>{themeMapEmptyCopy(tier, win)}</p>
          {tier !== 'all' && <button type="button" className="themes__retry" onClick={() => setTier('all')}>Show all heat tiers</button>}
        </div>
      ) : (
        <ThemeMap themes={shown} onPick={selectTheme} win={win} cov={cov} slice={slice} stale={stale} />
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
  const countScopeLabel = historical && win
    ? (scopeLabel ? `${scopeLabel} during ${win.full}` : win.full)
    : scopeLabel
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
            const assessment = themeSurfaceAssessment(t)
            const narrative = validatedThemeNarrative(t)
            return (
              <div key={t.theme_id} className="thememap-compact__item" role="listitem">
                <button type="button" onClick={() => onPick(t.theme_id)} aria-label={`Open ${t.name}. ${narrative?.thesis || t.description} News heat ${t.composite} out of 100. ${assessment?.conviction ? CONVICTION_LABEL[assessment.conviction] : 'Evidence confidence unavailable'}. ${countLabel(count, countScopeLabel)}.`}>
                  <span className="thememap-compact__rank">{rank + 1}</span>
                  <span className="thememap-compact__copy"><b>{t.name}</b><small>{t.description}</small></span>
                  <span className="thememap-compact__meta">News heat · {t.composite}/100{stale ? '' : ` · ${momentumOf(t)}`}<small>{assessment?.conviction ? CONVICTION_LABEL[assessment.conviction] : 'Evidence confidence unavailable'} · {countLabel(count, countScopeLabel)}</small></span>
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
        const narrative = validatedThemeNarrative(t)
        const assessment = themeSurfaceAssessment(t)
        const nodeCount = frozen ? (historical ? flowInWindow(t, windowHours as number) : t.member_count) : (shown[t.theme_id] ?? t.member_count)
        return (
          <button
            key={n.id}
            type="button"
            className={`themenode themenode--${t.tier}${t.tier === 'hot' ? ' is-pulsing' : ''}${absorbing.has(n.id) ? ' is-absorbing' : ''}${born.has(n.id) ? ' is-born' : ''}${hover && hover !== n.id && !hoveredRelated.has(n.id) ? ' is-dim' : ''}`}
            style={{ left: n.x - n.r, top: n.y - n.r, width: n.r * 2, height: n.r * 2, ['--tier' as any]: tierColorVar(t.tier), ['--enter' as any]: n.enterRank }}
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(n.id)}
            onBlur={() => setHover((current) => current === n.id ? null : current)}
            onClick={() => onPick(t.theme_id)}
            title={t.description}
            aria-label={`Open ${t.name}. ${narrative?.thesis || t.description} News heat ${t.composite} out of 100. ${assessment?.conviction ? CONVICTION_LABEL[assessment.conviction] : 'Evidence confidence unavailable'}. ${countLabel(nodeCount, countScopeLabel)}.`}
          >
            <span className="themenode__core" />
            <span className="themenode__count">{nodeCount.toLocaleString()}</span>
            <span className="themenode__label" style={{ width: n.labelW, WebkitLineClamp: 3, color: 'var(--text)' }}>{t.name}</span>
          </button>
        )
      })}
      {layout.omittedThemes.length > 0 && (
        <details className="thememap__overflow">
          <summary>Showing {layout.nodes.length} of {layout.totalThemes} themes · {layout.omittedThemes.length} more</summary>
          <div className="thememap__overflow-list" role="list" aria-label="Themes omitted from the spatial layout">
            {layout.omittedThemes.map((theme) => {
              const narrative = validatedThemeNarrative(theme)
              return (
                <div key={theme.theme_id} role="listitem">
                  <button type="button" onClick={() => onPick(theme.theme_id)} aria-label={`Open omitted theme ${theme.name}`}>
                    <b>{theme.name}</b>
                    <span>{narrative?.thesis || theme.description}</span>
                  </button>
                </div>
              )
            })}
          </div>
        </details>
      )}
      {hoveredTheme && <MapTooltip theme={hoveredTheme} count={historical ? flowInWindow(hoveredTheme, windowHours as number) : hoveredTheme.member_count} countScopeLabel={countScopeLabel} stale={stale} />}
    </div>
  )
}

// In a scoped slice the count belongs to that slice's theme ring, not the global index — so every place
// that presents the number names the slice it can actually back.
function countLabel(n: number, sliceLabel: string): string {
  return sliceLabel ? `${n.toLocaleString()} items in ${sliceLabel}` : `${n.toLocaleString()} items`
}

export function MapTooltip({ theme, count, countScopeLabel, stale }: { theme: Theme; count: number; countScopeLabel: string; stale: boolean }) {
  const narrative = validatedThemeNarrative(theme)
  const expressions = qualifiedThemeExpressions(theme)
  const assessment = themeSurfaceAssessment(theme)
  return (
    <div className="thememap__tip" role="status">
      <div className="thememap__tip-name">{theme.name}</div>
      <div className="thememap__tip-desc">{narrative?.thesis || theme.description}</div>
      <div className="thememap__tip-meta">News heat {theme.composite}/100 · {tierLabel(theme.tier)}{stale ? ' · last indexed' : ` · ${momentumOf(theme)}`} · {countLabel(count, countScopeLabel)}</div>
      <div className="thememap__tip-confidence">{assessment?.conviction ? CONVICTION_LABEL[assessment.conviction] : 'Evidence confidence unavailable'}</div>
      {expressions.length > 0 && <div className="thememap__tip-cos">{expressions.slice(0, 5).map((c) => `${themeCompanyLabel(c)} · ${expressionRoleLabel(c.role)}`).join(' · ')}</div>}
    </div>
  )
}

interface MapNode { id: string; x: number; y: number; r: number; flow: boolean; labelW: number; enterRank: number; theme: Theme }
export function computeMapLayout(themes: Theme[], W: number, H: number, tierCounts: Record<string, number> = {}, windowHours: number | null = null, showIntake = true) {
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
  const rankedThemes = [...themes].sort((a, b) => heat(b) - heat(a))
  const ranked = rankedThemes.slice(0, 16)
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
  const shownIds = new Set(nodes.map((node) => node.id))
  const omittedThemes = rankedThemes.filter((theme) => !shownIds.has(theme.theme_id))
  return { lanes, core: { x: coreX, y: coreY, r: coreR }, nodes, omittedThemes, totalThemes: rankedThemes.length }
}

function hcurve(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${mx.toFixed(1)} ${y1.toFixed(1)} ${mx.toFixed(1)} ${y2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

// ---------------- the BOARD ----------------

const FORMATION_STATE_LABEL: Record<ThemeFormationCandidate['state'], string> = {
  awaiting_validation: 'Awaiting first validation',
  awaiting_revalidation: 'Awaiting revalidation',
  blocked_incomplete_audit: 'Audit trail incomplete',
  building_evidence: 'Building evidence',
}

export function FormationQueuePanel({ queue, compilerHealth, stale, loading = false, compact = false }: { queue: ThemeFormationQueue | null; compilerHealth: ThemeCompilerHealth | null; stale: boolean; loading?: boolean; compact?: boolean }) {
  const disclosedCandidates = queue?.candidates || []
  const queueTotal = totalFormationDebt(queue, compilerHealth)
  if (!disclosedCandidates.length && !queueTotal) return null
  const candidates = compact ? disclosedCandidates.slice(0, 3) : disclosedCandidates
  const safelyDisclosedHidden = (queue?.hidden || 0) + Math.max(0, disclosedCandidates.length - candidates.length)
  const clientWithheld = queue?.client_withheld || 0
  const undisclosedCompilerDebt = Math.max(0, (compilerHealth?.queue.total || 0) - disclosedCompilerDebt(queue))
  const capacityUnobserved = (compilerHealth?.queue.total || 0) > 0 && compilerHealth?.last_attempt === null
    && (compilerHealth.state === 'ready' || compilerHealth.state === 'idle') && compilerHealth.blocker === null
  const capacityTone = stale || capacityUnobserved ? 'unknown' : compilerHealth?.state || 'unknown'
  const statusCopy = stale
    ? loading
      ? `Last disclosed compiler state · refresh in progress · ${themeCompilerCapacityCopy(compilerHealth)}`
      : `Last disclosed compiler state · not current · ${themeCompilerCapacityCopy(compilerHealth)}`
    : themeCompilerCapacityCopy(compilerHealth)
  return (
    <section className={`themeformation${compact ? ' themeformation--compact' : ''}${stale ? ' is-stale' : ''}`} aria-labelledby={compact ? 'themes-developing-map' : 'themes-developing'}>
      <div className="themebriefing__sectionhead">
        <div>
          <h3 id={compact ? 'themes-developing-map' : 'themes-developing'}>Developing news patterns — not investment theses</h3>
          <p>These rows have not cleared the current compiler contract and cannot seed Ideas or trades. First-validation labels are provisional clusters; revalidation labels may be prior theses awaiting classification of new evidence. An unclassified observation carries no thesis stance.</p>
        </div>
        <span>{queueTotal}</span>
      </div>
      <div className={`themeformation__capacity themeformation__capacity--${capacityTone}`} role="status" aria-live="polite">
        <span className="themeformation__capacity-dot" aria-hidden />
        <span>{statusCopy}</span>
      </div>
      {!candidates.length ? (
        <div className="themeformation__undisclosed" role="note">
          <b>{queueTotal} cluster{queueTotal === 1 ? '' : 's'} {(queue?.total || 0) > 0 ? 'remain outside validated themes' : 'await validation'}</b>
          <span>{safelyDisclosedHidden > 0
            ? `${safelyDisclosedHidden} safely sourced developing pattern${safelyDisclosedHidden === 1 ? ' is' : 's are'} outside this bounded excerpt; no exact row is available to show here.`
            : clientWithheld > 0
              ? 'No returned formation row passed this client’s exact-source validation. The UI will not invent a label or evidence row.'
              : 'No pattern has enough exact source provenance for safe disclosure yet. The UI will not invent a label or evidence row.'}</span>
        </div>
      ) : (
        <div className="themeformation__list" role="list" aria-label="Non-investable developing news patterns">
          {candidates.map((candidate) => {
          const evidence = formationCandidateEvidence(candidate)
          return (
            <article key={candidate.theme_id} className="themeformation__row" role="listitem">
              <div className="themeformation__rowhead">
                <div>
                  <span className="themeformation__state">{FORMATION_STATE_LABEL[candidate.state]}</span>
                  <h4>{candidate.provisional_label}</h4>
                </div>
                <span className="themeformation__not-investable">Not investable</span>
              </div>
              <div className="themeformation__metrics">
                <span><b className="mono">{candidate.distinct_evidence_count}</b> distinct evidence</span>
                <span><b className="mono">{candidate.high_quality_evidence_count}</b> higher-quality evidence</span>
                {candidate.attempted_at && <span>last attempted {fmtStampLocal(candidate.attempted_at)}</span>}
              </div>
              {evidence.length ? (
                <ul className="themeformation__evidence">
                  {evidence.map((row) => (
                    <li key={row.event_id}>
                      <a href={row.url} target="_blank" rel="noreferrer">{row.headline}</a>
                      {row.stance === 'unclassified' && <span className="themeformation__evidence-state"><i aria-hidden /> Awaiting classification · no thesis stance</span>}
                      <span>{row.source_name} · {sourceTierLabel(row.source_tier)} · {fmtStampLocal(row.found_at)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="themeformation__missing">No exact source link cleared this disclosure row.</p>
              )}
              <div className="themeformation__blockers">
                <b>What is missing</b>
                {candidate.blockers.length
                  ? <ul>{candidate.blockers.map((blocker, index) => <li key={`${candidate.theme_id}-blocker-${index}`}>{blocker}</li>)}</ul>
                  : <span>The compiler has not recorded a specific blocker yet.</span>}
              </div>
            </article>
          )
          })}
        </div>
      )}
      {safelyDisclosedHidden > 0 && candidates.length > 0 && <p className="themeformation__hidden">{safelyDisclosedHidden} more safely sourced developing pattern{safelyDisclosedHidden === 1 ? ' remains' : 's remain'} outside this bounded first look.</p>}
      {clientWithheld > 0 && <p className="themeformation__hidden">{clientWithheld} additional formation row{clientWithheld === 1 ? '' : 's'} failed this client's exact-source validation. No label or evidence row is shown for {clientWithheld === 1 ? 'it' : 'them'}.</p>}
      {undisclosedCompilerDebt > 0 && candidates.length > 0 && <p className="themeformation__hidden">{undisclosedCompilerDebt} additional compiler-debt cluster{undisclosedCompilerDebt === 1 ? ' has' : 's have'} no safe exact-source disclosure. No label or evidence row is shown for that aggregate debt.</p>}
    </section>
  )
}

function ThemeBoard({ themes, formationQueue, compilerHealth, onPick, sliceLabel, stale, loading }: { themes: Theme[]; formationQueue: ThemeFormationQueue | null; compilerHealth: ThemeCompilerHealth | null; onPick: (id: string) => void; sliceLabel: string; stale: boolean; loading: boolean }) {
  const [showAllForming, setShowAllForming] = useState(false)
  const groups = groupThemesForBriefing(themes)
  const worth = groups.worthChecking
  const forming = showAllForming ? groups.forming : groups.forming.slice(0, 8)
  const formationDebt = totalFormationDebt(formationQueue, compilerHealth)
  return (
    <div className="themebriefing">
      <section className="themebriefing__section" aria-labelledby="themes-worth-checking">
        <div className="themebriefing__sectionhead">
          <div>
            <h3 id="themes-worth-checking">{stale ? 'Last actionable theses' : 'Actionable investment theses'}</h3>
            <p>{stale
              ? 'These dossiers cleared the complete narrative contract at the last successful index. They are retained for audit and must be refreshed before use.'
              : 'At most five complete, falsifiable theses. Each name is tied to a stated economic mechanism and cited source evidence; listing, liquidity, valuation, governance, and solvency still require the Ideas checks.'}</p>
          </div>
          <span>{groups.counts.worthChecking}</span>
        </div>
        {!worth.length ? (
          <div className="themebriefing__zero">
            <b>{stale
              ? `No actionable thesis survived in the last successful theme screen${sliceLabel ? ` for ${sliceLabel}` : ''}.`
              : `No validated investment thesis clears${sliceLabel ? ` for ${sliceLabel}` : ''} right now.`}</b>
            <span>{groups.counts.forming
              ? stale
                ? `${groups.counts.forming} thesis${groups.counts.forming === 1 ? ' was' : 'es were'} forming at that index; the then-missing proof is shown below.`
                : `${groups.counts.forming} thesis${groups.counts.forming === 1 ? ' is' : 'es are'} still forming; the missing proof is shown below.`
              : stale
                ? 'That stage is no longer current. No validated narrative had enough current proof and an evidence-bound expression at the last successful index.'
                : formationDebt > 0
                  ? 'Developing and quarantined patterns are shown separately below. They cannot seed Ideas or trades until they clear the current compiler contract.'
                : formationQueue === null && compilerHealth === null
                  ? 'No validated narrative cleared. This server did not disclose formation-queue or compiler status, so developing-pattern presence is unknown.'
                  : 'The wire is still monitored. Raw clusters remain internal until they carry a complete narrative and current evidence.'}</span>
          </div>
        ) : (
          <div className="themebriefing__worth" id="themes-worth-list">
            {worth.map((t, rank) => (
              <ThemeBriefingRow key={t.theme_id} t={t} rank={rank + 1} onPick={onPick} sliceLabel={sliceLabel} stale={stale} />
            ))}
          </div>
        )}
        {groups.hiddenWorthChecking > 0 && (
          <div className="themebriefing__more">
            <p>{groups.hiddenWorthChecking} more actionable {groups.hiddenWorthChecking === 1 ? 'thesis' : 'theses'} after the five-dossier first look</p>
            <div className="themebriefing__more-list" role="list" aria-label="Additional actionable investment theses">
              {groups.additionalWorthChecking.map((theme, index) => {
                const narrative = validatedThemeNarrative(theme)
                const assessment = themeSurfaceAssessment(theme)
                return (
                  <div key={theme.theme_id} role="listitem">
                    <button type="button" onClick={() => onPick(theme.theme_id)} aria-label={`Open thesis dossier for ${theme.name}`}>
                      <span className="themebriefing__more-rank mono">{index + 6}</span>
                      <span className="themebriefing__more-copy"><b>{theme.name}</b><small>{narrative?.thesis}</small></span>
                      <span className="themebriefing__more-meta">{assessment?.conviction ? CONVICTION_LABEL[assessment.conviction] : 'Evidence confidence unavailable'}<small>{assessment?.activity ? ACTIVITY_LABEL[assessment.activity] : 'Activity unavailable'}</small></span>
                      <span aria-hidden>→</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {groups.forming.length > 0 && (
        <section className="themebriefing__section themebriefing__section--forming" aria-labelledby="themes-forming">
          <div className="themebriefing__sectionhead">
            <div>
              <h3 id="themes-forming">{stale ? 'Previously forming' : 'Forming'}</h3>
              <p>{stale ? 'Validated theses that were still missing one or more required proof checks.' : 'Validated theses still missing one or more required proof checks.'}</p>
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

      <FormationQueuePanel queue={formationQueue} compilerHealth={compilerHealth} stale={stale} loading={loading} />
    </div>
  )
}

function flowDeltaCopy(t: Theme): string {
  const delta = themeFlowDelta(t)
  if (delta == null) return 'Six-hour supporting-evidence change unavailable'
  if (delta > 0) return `+${delta} supporting evidence item${delta === 1 ? '' : 's'} vs prior 6h`
  if (delta < 0) return `${Math.abs(delta)} fewer supporting evidence item${delta === -1 ? '' : 's'} vs prior 6h`
  return 'Supporting-evidence flow flat vs prior 6h'
}

const ACTIVITY_LABEL: Record<ThemeActivity, string> = { new: 'New thesis', reinforced: 'Reinforced', challenged: 'Challenged', quiet: 'Quiet' }
const CONVICTION_LABEL: Record<ThemeConviction, string> = { high: 'High evidence confidence', medium: 'Medium evidence confidence', watch: 'Evidence incomplete' }

function expressionRoleLabel(role: ThemeExpressionRole): string {
  return ({ direct: 'Direct', bottleneck: 'Bottleneck', enabler: 'Enabler', harmed: 'Exposed loser', hedge: 'Hedge' } as Record<ThemeExpressionRole, string>)[role]
}

function EvidenceRows({ rows }: { rows: ValidatedThemeEvidence[] }) {
  return (
    <ul className="themedossier__evidence-list">
      {rows.map((e) => (
        <li key={e.event_id}>
          <span className="themedossier__evmeta">
            <span className="themedossier__wire-score" title="Wire materiality score; not evidence confidence">
              <strong className="mono">{e.score}</strong>
              <span>wire materiality · not confidence</span>
            </span>
            <a href={e.url} target="_blank" rel="noreferrer" aria-label={`Open exact source for ${e.headline}`}>{e.source_name}</a>
            <span>{sourceTierLabel(e.source_tier)} · {fmtStampLocal(e.found_at)}</span>
          </span>
          <span className="themedossier__evhead">{e.headline}</span>
        </li>
      ))}
    </ul>
  )
}

export function ThemeExpressionRead({ expressions, evidence, stale = false }: { expressions: ValidatedThemeQualifiedExpression[]; evidence: ValidatedThemeEvidence[]; stale?: boolean }) {
  const byId = new Map(evidence.map((row) => [row.event_id, row]))
  if (!expressions.length) return <span className="themebrief__missing">No evidence-bound investable expression is proven yet.</span>
  return (
    <ul className="themedossier__expressions">
      {expressions.map((expression) => {
        const proof = expression.evidence_event_ids.map((eventId) => byId.get(eventId)).filter((row): row is ValidatedThemeEvidence => !!row)
        return (
          <li key={`${expression.name_key}-${expression.ticker}-${expression.role}`} className={`themedossier__expression themedossier__expression--${expression.side}`}>
            <div className="themedossier__expression-head">
              <span className={`themedossier__role themedossier__role--${expression.role}`}>{expressionRoleLabel(expression.role)}</span>
              <b className="mono">{themeCompanyLabel(expression)}</b>
              <span>{expression.name}</span>
              <em>{expression.side === 'beneficiary' ? 'may gain' : 'may be hurt'}</em>
            </div>
            <p>{expression.mechanism}</p>
            <div className="themedossier__expression-proof">
              <b>{stale ? 'Source evidence at last index' : 'Cited source evidence'}</b>
              {proof.length ? <EvidenceRows rows={proof} /> : <span className="themebrief__missing">The referenced proof rows are not present in this summary.</span>}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function ThemeNarrativeDossier({ t, rank, onPick, sliceLabel = '', stale = false, deep = false }: { t: Theme; rank?: number; onPick?: (id: string) => void; sliceLabel?: string; stale?: boolean; deep?: boolean }) {
  const narrative = validatedThemeNarrative(t)
  const assessment = themeSurfaceAssessment(t)
  if (!narrative || !assessment || assessment.status === 'context') return null
  const evidence = themeBriefingEvidence(t)
  const evidenceGroups = groupThemeEvidence(t)
  const expressions = qualifiedThemeExpressions(t)
  const whyNowProof = evidence.find((row) => row.event_id === narrative.why_now_event_id)
  const excluded = Number.isFinite(t.off_core_member_count)
    ? Math.max(0, t.off_core_member_count!)
    : Math.max(0, assessment.metrics.off_core_evidence_count || 0)
  const headingId = `${deep ? 'themedd-dossier' : 'themebrief'}-${t.theme_id}`
  return (
    <article className={`themebrief themedossier${deep ? ' themebrief--deep' : ''}`} aria-labelledby={headingId}>
      {rank != null && <div className="themebrief__rank" aria-label={`Rank ${rank}`}>{rank}</div>}
      <div className="themebrief__body">
        <div className="themebrief__top">
          <span className={`themedossier__activity themedossier__activity--${assessment.activity}`}>{stale ? 'Last index · ' : ''}{ACTIVITY_LABEL[assessment.activity!]}</span>
          <span className={`themedossier__conviction themedossier__conviction--${assessment.conviction}`}>{CONVICTION_LABEL[assessment.conviction!]}</span>
          <span className="themedossier__horizon">Horizon · {narrative.horizon}</span>
          <span className="themebrief__flow">{stale ? 'At last index · ' : ''}{flowDeltaCopy(t)}{sliceLabel ? ` · ${sliceLabel}` : ''}</span>
        </div>
        <h4 id={headingId}>{t.name}</h4>
        <p className="themedossier__thesis">{narrative.thesis}</p>
        <p className="themedossier__inference"><b>Engine synthesis / inference.</b> The thesis, why-now wording, causal chain, and company mechanisms are interpretations of the cited evidence. They are not statements copied from those sources.</p>

        <div className="themedossier__section">
          <h5>What changed</h5>
          <div>
            <p>{narrative.why_now}</p>
            <small>Engine-checked {fmtStampLocal(narrative.validated_at)}</small>
            {whyNowProof && (
              <div className="themedossier__why-proof">
                <b>Why-now source evidence</b>
                <EvidenceRows rows={[whyNowProof]} />
              </div>
            )}
          </div>
        </div>
        <div className="themedossier__section">
          <h5>Why it matters</h5>
          <ol className="themedossier__mechanism">{narrative.mechanism_steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol>
        </div>
        <div className="themedossier__section themedossier__section--stack">
          <h5>How to play / exposed names</h5>
          <ThemeExpressionRead expressions={expressions} evidence={evidence} stale={stale} />
        </div>
        <div className="themedossier__section themedossier__section--break">
          <h5>What would break it</h5>
          <div><p>{narrative.falsifier}</p><small>Analyst-defined falsification test, not a sourced fact.</small></div>
        </div>
        <div className="themedossier__section themedossier__section--stack">
          <h5>{stale ? 'Evidence at last index' : 'Evidence in this thesis'}</h5>
          <div className="themedossier__evidence-groups">
            <section aria-label={`${evidenceGroups.supports.length} supporting evidence rows`}>
              <h6>Supports <span>{evidenceGroups.supports.length}</span></h6>
              {evidenceGroups.supports.length ? <EvidenceRows rows={evidenceGroups.supports} /> : <span className="themebrief__missing">No supporting row was returned in this summary.</span>}
            </section>
            <section className="themedossier__challenges" aria-label={`${evidenceGroups.challenges.length} challenging evidence rows`}>
              <h6>Challenges <span>{evidenceGroups.challenges.length}</span></h6>
              {evidenceGroups.challenges.length ? <EvidenceRows rows={evidenceGroups.challenges} /> : <span className="themebrief__missing">No challenging row was returned in this summary.</span>}
            </section>
          </div>
        </div>
      </div>
      {!deep && (
        <aside className="themebrief__aside">
          <div className="themebrief__proof">
            <span><b>{assessment.metrics.recent_24h_support_count}</b> support · 24h</span>
            <span><b>{assessment.metrics.recent_24h_challenge_count}</b> challenge · 24h</span>
            <span><b>{assessment.metrics.narrative_coherence_pct}%</b> coherent</span>
            <span><b>{excluded}</b> off-thesis excluded</span>
          </div>
          {onPick && <button type="button" className="themebrief__open" onClick={() => onPick(t.theme_id)} aria-label={`${stale ? 'Inspect saved' : 'Open'} thesis dossier for ${t.name}`}>{stale ? 'Inspect saved thesis' : 'Open thesis dossier'} <span aria-hidden>→</span></button>}
        </aside>
      )}
    </article>
  )
}

function ThemeBriefingRow({ t, rank, onPick, sliceLabel, stale }: { t: Theme; rank: number; onPick: (id: string) => void; sliceLabel: string; stale: boolean }) {
  return <ThemeNarrativeDossier t={t} rank={rank} onPick={onPick} sliceLabel={sliceLabel} stale={stale} />
}

function ThemeFormingRow({ t, onPick, stale }: { t: Theme; onPick: (id: string) => void; stale: boolean }) {
  const assessment = themeSurfaceAssessment(t)
  const narrative = validatedThemeNarrative(t)
  const blockers = assessment?.blockers || []
  return (
    <article className="themeforming__row">
      <div className="themeforming__copy">
        <div className="themeforming__top"><h4>{t.name}</h4>{assessment?.activity && <span className={`themedossier__activity themedossier__activity--${assessment.activity}`}>{ACTIVITY_LABEL[assessment.activity]}</span>}{assessment?.conviction && <span className={`themedossier__conviction themedossier__conviction--${assessment.conviction}`}>{CONVICTION_LABEL[assessment.conviction]}</span>}</div>
        <p>{narrative?.thesis}</p>
        <div className="themeforming__blockers">
          <b>{stale ? 'Missing proof then' : 'Missing proof'}</b>
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

// The flow sparkline. `interactive` (used on the deep-dive) adds a hover crosshair + a tooltip that
// names the hour and its item count, so you can read HOW the theme built over time, not just the shape.
// flow_series is hourly, newest bucket last, zero-filled to now — so point i is (n-1-i) hours before now.
function Sparkline({ series, w = 88, h = 18, interactive = false, fluid = false }: { series: number[]; w?: number; h?: number; interactive?: boolean; fluid?: boolean }) {
  const pad = 1
  const ref = useRef<SVGSVGElement>(null)
  const [hi, setHi] = useState<number | null>(null)
  const [keyboardActive, setKeyboardActive] = useState(false)
  const descriptionId = useId()
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
  const onKeyDown = (event: ReactKeyboardEvent<SVGSVGElement>) => {
    let next = hi ?? n - 1
    if (event.key === 'ArrowLeft') next--
    else if (event.key === 'ArrowRight') next++
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = n - 1
    else return
    event.preventDefault()
    setHi(Math.max(0, Math.min(n - 1, next)))
  }
  // anchor the newest bucket at the current hour (local), each prior bucket one hour earlier
  const when = hi == null ? null : new Date(Math.floor(Date.now() / 3600_000) * 3600_000 - (n - 1 - hi) * 3600_000)
  const val = hi == null ? 0 : series[hi]
  const total = series.reduce((sum, value) => sum + value, 0)
  const latest = series[n - 1] || 0
  const peak = Math.max(0, ...series)
  return (
    <span className={`sparkline-wrap${fluid ? ' sparkline-wrap--fluid' : ''}`} style={fluid ? { width: '100%', maxWidth: w, height: h } : { width: w, height: h }}>
      <svg
        ref={ref}
        className="sparkline sparkline--live"
        width={fluid ? '100%' : w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        onPointerMove={onMove}
        onPointerLeave={() => { if (!keyboardActive) setHi(null) }}
        onFocus={() => { setKeyboardActive(true); setHi((current) => current ?? n - 1) }}
        onBlur={() => { setKeyboardActive(false); setHi(null) }}
        onKeyDown={onKeyDown}
        role="img"
        tabIndex={0}
        aria-label="Interactive hourly news-flow chart"
        aria-describedby={descriptionId}
      >
        <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {last && <circle cx={last[0]} cy={last[1]} r="2" fill="var(--accent-bright)" />}
        {sel && <line className="sparkline__guide" x1={sel[0]} y1={pad} x2={sel[0]} y2={h - pad} />}
        {sel && <circle className="sparkline__dot" cx={sel[0]} cy={sel[1]} r="2.6" />}
      </svg>
      <span id={descriptionId} className="sr-only">{n} hourly buckets. {total} items in total; {latest} in the latest hour; peak {peak}. Focus the chart and use Left or Right Arrow, Home, and End to inspect an exact hour.</span>
      <span className="sr-only" aria-live="polite">{keyboardActive && when ? `${when.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' })}: ${val} item${val === 1 ? '' : 's'}.` : ''}</span>
      {sel && when && (
        <span className="sparkline__tip" style={{ left: `${(sel[0] / w) * 100}%` }} aria-hidden="true">
          <span className="sparkline__tip-time">{when.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' })}</span>
          <span className="sparkline__tip-val">{val} item{val === 1 ? '' : 's'}</span>
        </span>
      )}
    </span>
  )
}

// ---------------- the DEEP-DIVE ----------------

function ThemeDeepDive({ sourceSlice, stale, refreshFailed, generatedAt }: { sourceSlice: ThemeSliceDisplay; stale: boolean; refreshFailed: boolean; generatedAt: string | null }) {
  const selectedId = useStore((s) => s.selectedTheme)
  const detail = useStore((s) => s.themeDetail)
  const detailError = useStore((s) => s.themeDetailError)
  const loading = useStore((s) => s.themesLoading)
  const indexedThemes = useStore((s) => s.themes)
  const selectTheme = useStore((s) => s.selectTheme)
  const scSelectEvent = useStore((s) => s.scSelectEvent)
  const runEventChecks = useStore((s) => s.runEventChecks)

  if (loading) {
    return (
      <div className="themedd" aria-busy="true">
        <button type="button" className="themedd__back" onClick={() => selectTheme(null)}>← Themes</button>
        {stale && <ThemeDeepDiveStaleNote generatedAt={generatedAt} refreshFailed={refreshFailed} />}
        {sourceSlice.active && <ThemeDeepDiveScopeNote sourceSlice={sourceSlice} />}
        <div className="themes__empty" role="status" aria-live="polite"><div className="themes__shimmer" /><p>Loading the exact thesis evidence…</p></div>
      </div>
    )
  }
  if (!detail) {
    return (
      <div className="themedd">
        <button type="button" className="themedd__back" onClick={() => selectTheme(null)}>← Themes</button>
        {stale && <ThemeDeepDiveStaleNote generatedAt={generatedAt} refreshFailed={refreshFailed} />}
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
  const assessment = themeSurfaceAssessment(t)
  const narrative = validatedThemeNarrative(t)
  if (!assessment || !narrative || assessment.status === 'context') {
    return (
      <div className="themedd">
        <button type="button" className="themedd__back" onClick={() => selectTheme(null)}>← Themes</button>
        {stale && <ThemeDeepDiveStaleNote generatedAt={generatedAt} refreshFailed={refreshFailed} />}
        <div className="themedd__loadfail" role="alert">
          <b>This saved detail does not have a complete investment-thesis contract.</b>
          <span>It has failed closed and is not shown as a PM theme. Return to Themes and wait for the server to revalidate its narrative, evidence stances, activity, evidence confidence, and expressions.</span>
          <div><button type="button" className="btn" onClick={() => selectTheme(null)}>Back to Themes</button></div>
        </div>
      </div>
    )
  }
  // The redesigned detail endpoint already projects only the canonical supporting/challenging core.
  // Keep its complete proof set here; the compact summary evidence above is deliberately capped.
  const thesisMembers = detail.members
  const top = thesisMembers[0]
  const validatedThemeIds = new Set(themesForPmSurface(indexedThemes).map((theme) => theme.theme_id))
  const related = detail.related_themes.filter((theme) => validatedThemeIds.has(theme.theme_id))
  const indexedTheme = indexedThemes.find((theme) => theme.theme_id === t.theme_id)
  // Detail.scores is a legacy ledger score and can lag the canonical public projection. Keep every visible
  // heat read tied to the current summary contract (or say that its components are unavailable).
  const projectedHeat = indexedTheme?.score_components || t.score_components
  const newsHeat = indexedTheme?.composite ?? t.composite
  const newsTier = indexedTheme?.tier ?? t.tier
  return (
    <div className="themedd">
      <div className="themedd__head">
        <button type="button" className="themedd__back" onClick={() => selectTheme(null)}>← Themes</button>
        <span className={`themecard__tier themecard__tier--${newsTier}`}>{stale ? 'Last indexed news heat' : `News heat · ${tierLabel(newsTier)}`}</span>
        <span className="themedd__score mono" title="News heat, separate from evidence confidence">{newsHeat}<span className="themedd__score-sub">/100 news heat</span></span>
        <span className={`themedossier__conviction themedossier__conviction--${assessment.conviction}`}>{CONVICTION_LABEL[assessment.conviction!]}</span>
        <span className="themedd__flow">{stale ? 'saved snapshot' : `${momentumOf(t)} evidence flow`}</span>
      </div>
      {stale && <ThemeDeepDiveStaleNote generatedAt={generatedAt} refreshFailed={refreshFailed} />}
      {sourceSlice.active && <ThemeDeepDiveScopeNote sourceSlice={sourceSlice} />}
      <h2 className="themedd__name">{t.name}</h2>
      <ThemeNarrativeDossier t={t} stale={stale} deep />
      <div className="themedd__sparkrow"><Sparkline series={t.flow_series} w={220} h={36} interactive fluid /><span className="themedd__scores">{projectedHeat
        ? <>{stale ? 'last-indexed news heat · ' : 'news heat · '}freshness {projectedHeat.freshness} · breadth {projectedHeat.breadth} · staying power {projectedHeat.persistence}</>
        : 'News-heat components unavailable in the canonical summary.'}</span></div>

      {related.length > 0 && (
        <div className="themedd__related">
          <span className="themedd__rellabel">Other validated themes · exploratory overlap, not a causal link:</span>
          {related.slice(0, 5).map((r) => (
            <button key={r.theme_id} type="button" className={`themedd__relchip${r.kind === 'opposite' ? ' is-opposite' : ''}`} onClick={() => selectTheme(r.theme_id)}>{r.kind === 'opposite' ? '⇄ ' : ''}{r.name}</button>
          ))}
        </div>
      )}

      <div className="themedd__newshead">{stale ? 'Evidence in the last loaded thesis detail' : 'Evidence in this thesis'}</div>
      <div className="themedd__news">
        {thesisMembers.slice(0, 24).map((m) => (
          <button key={`${m.event_id}-${m.ts}`} type="button" className="themedd__row" onClick={() => scSelectEvent(m as FeedItem)}>
            <span className="themedd__rowscore mono" style={{ color: m.triage_score >= 70 ? 'var(--live)' : m.triage_score >= 40 ? 'var(--accent-bright)' : 'var(--text-faint)' }}>{m.triage_score}</span>
            <span className="themedd__rowhead" title={m.headline_en && m.headline_en !== m.headline ? `original: ${m.headline}` : undefined}>{displayHeadline(m)}</span>
            <span className="themedd__rowsrc mono" title="When this was published (your local time)">{fmtStampLocal(m.ts)}</span>
            <span className="themedd__rowsrc">{m.source_name}</span>
          </button>
        ))}
        {!thesisMembers.length && <div className="themedd__newsempty">The detail response did not include the exact evidence rows referenced by this thesis summary.</div>}
      </div>

      {top && (
        <div className="themedd__actions">
          <button type="button" className="btn btn--amber" onClick={() => runEventChecks(top as FeedItem)}>Run the checks on {stale ? 'this saved top story' : 'the top story'}</button>
        </div>
      )}
    </div>
  )
}

function ThemeDeepDiveStaleNote({ generatedAt, refreshFailed }: { generatedAt: string | null; refreshFailed: boolean }) {
  const stamp = fmtStampLocal(generatedAt || undefined)
  return (
    <div className="themedd__scope themedd__scope--stale" role="alert">
      <b>Last successful Themes snapshot{stamp ? ` · ${stamp}` : ''}</b>
      <span>{refreshFailed
        ? 'Refresh failed. This dossier and its exact qualification evidence are retained for audit, not current. Refresh Themes before treating its activity, evidence confidence, mechanism, or expressions as live.'
        : 'The last successful Themes stage is older than 10 minutes. This dossier and its exact qualification evidence are retained for audit, not current; a newer read-time score projection does not refresh the thesis proof.'}</span>
    </div>
  )
}

function ThemeDeepDiveScopeNote({ sourceSlice }: { sourceSlice: ThemeSliceDisplay }) {
  return (
    <div className="themedd__scope" role="note">
      <b>Opened from {sourceSlice.label}</b>
      <span>The detail API remains global. This view therefore keeps the {sourceSlice.label} scope disclosure visible and renders only exact, stance-labelled thesis evidence and qualified expressions; it does not infer causality from co-mentions.</span>
    </div>
  )
}
