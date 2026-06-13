// The dynamic-themes view: the living, ranked investment themes the news firehose is bucketed into.
// Two ways to look at the same themes[] — a spatial MAP (sources → ranking lens → theme basins, with
// hot basins risen + pulsing) and a ranked BOARD (cards with a flow sparkline + companies by order) —
// plus a deep-dive that reuses the existing event reader + "run the checks" funnel. Custom inline SVG
// (no graph lib), tokens-only colour, transform/opacity animation, reduced-motion aware.

import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../../lib/store'
import { heatOf, radiusFor, sparklinePoints, tierColorVar, tierLabel, orderLabel, type Theme, type ThemeCompany } from '../../lib/themes'
import type { FeedItem } from '../../lib/types'

const TIERS = ['all', 'hot', 'active', 'cooling', 'parked'] as const

// guard against empty / placeholder company guesses leaking into chips
const real = <T extends { name?: string }>(cos: T[]): T[] => cos.filter((c) => c.name && !/^(null|undefined|n\/a)$/i.test(c.name.trim()))

export function ThemesView() {
  const themes = useStore((s) => s.themes)
  const view = useStore((s) => s.themesView)
  const status = useStore((s) => s.themesStatus)
  const selectedTheme = useStore((s) => s.selectedTheme)
  const setThemesView = useStore((s) => s.setThemesView)
  const selectTheme = useStore((s) => s.selectTheme)
  const [tier, setTier] = useState<(typeof TIERS)[number]>('all')

  const shown = useMemo(() => (tier === 'all' ? themes : themes.filter((t) => t.tier === tier)), [themes, tier])

  if (selectedTheme) return <ThemeDeepDive />

  return (
    <div className="themes">
      <header className="themes__head">
        <div className="themes__title">
          <span className="themes__titlemain">Themes</span>
          <span className="themes__sub">{themes.length ? `${themes.length} live · the wire, clustered into what you can play` : 'forming…'}</span>
        </div>
        <div className="themes__controls">
          <div className="themes__tiers" role="tablist" aria-label="Filter by heat">
            {TIERS.map((t) => (
              <button key={t} type="button" className={`themes__tierbtn${tier === t ? ' is-on' : ''}`} onClick={() => setTier(t)}>
                {t === 'all' ? 'All' : tierLabel(t as any)}
              </button>
            ))}
          </div>
          <div className="themes__viewtoggle" role="radiogroup" aria-label="Map or board">
            <button type="button" role="radio" aria-checked={view === 'map'} className={`themes__vbtn${view === 'map' ? ' is-on' : ''}`} onClick={() => setThemesView('map')}>Map</button>
            <button type="button" role="radio" aria-checked={view === 'board'} className={`themes__vbtn${view === 'board' ? ' is-on' : ''}`} onClick={() => setThemesView('board')}>Board</button>
          </div>
        </div>
      </header>

      {status === 'loading' && !themes.length ? (
        <div className="themes__empty"><div className="themes__shimmer" /><p>Reading the wire and clustering it into themes…</p></div>
      ) : !themes.length ? (
        <div className="themes__empty">
          <div className="themes__emptyorb" />
          <p>No themes have formed yet. As related news clusters across companies, living themes appear here — the strongest float to the top.</p>
        </div>
      ) : view === 'map' ? (
        <ThemeMap themes={shown} onPick={selectTheme} />
      ) : (
        <ThemeBoard themes={shown} onPick={selectTheme} />
      )}
    </div>
  )
}

// ---------------- the MAP ----------------

function ThemeMap({ themes, onPick }: { themes: Theme[]; onPick: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 900, h: 560 })
  const [hover, setHover] = useState<string | null>(null)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver((e) => { const r = e[0].contentRect; setBox({ w: Math.max(420, r.width), h: Math.max(360, r.height) }) })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  const layout = useMemo(() => computeMapLayout(themes, box.w, box.h), [themes, box.w, box.h])
  const hoveredRelated = useMemo(() => {
    if (!hover) return new Set<string>()
    const t = themes.find((x) => x.theme_id === hover)
    return new Set((t?.related_themes || []).map((r) => r.theme_id))
  }, [hover, themes])

  return (
    <div className="thememap" ref={ref}>
      <svg className="thememap__edges" viewBox={`0 0 ${box.w} ${box.h}`} preserveAspectRatio="none" aria-hidden>
        {layout.lanes.map((l) => (
          <path key={l.id} d={hcurve(l.x + 18, l.y, layout.core.x - layout.core.r, layout.core.y)} className="thememap__lane-edge" />
        ))}
        {layout.nodes.map((n) => {
          const active = hover === n.id || hoveredRelated.has(n.id)
          return <path key={n.id} d={hcurve(layout.core.x + layout.core.r, layout.core.y, n.x - n.r, n.y)} className={`thememap__edge${active ? ' is-active' : ''}`} style={{ ['--flow' as any]: n.flow ? 1 : 0 }} />
        })}
      </svg>

      {/* source-tier lanes */}
      <div className="thememap__lanes">
        {layout.lanes.map((l) => (
          <div key={l.id} className="thememap__lane" style={{ left: l.x, top: l.y - 12 }}>
            <span className="thememap__lane-label">{l.label}</span>
          </div>
        ))}
      </div>

      {/* the ranking lens */}
      <div className="thememap__core" style={{ left: layout.core.x - layout.core.r, top: layout.core.y - layout.core.r, width: layout.core.r * 2, height: layout.core.r * 2 }}>
        <span>Ranking</span>
      </div>

      {/* theme basins */}
      {layout.nodes.map((n) => {
        const t = n.theme
        return (
          <button
            key={n.id}
            type="button"
            className={`themenode themenode--${t.tier}${t.tier === 'hot' && t.fresh_flow > 0 ? ' is-pulsing' : ''}${hover && hover !== n.id && !hoveredRelated.has(n.id) ? ' is-dim' : ''}`}
            style={{ left: n.x - n.r, top: n.y - n.r, width: n.r * 2, height: n.r * 2, ['--tier' as any]: tierColorVar(t.tier) }}
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onPick(t.theme_id)}
            title={t.description}
          >
            <span className="themenode__core" />
            <span className="themenode__count">{t.member_count}</span>
            <span className="themenode__label" style={{ width: n.labelW, WebkitLineClamp: 3, color: 'var(--text)' }}>{t.name}</span>
          </button>
        )
      })}
      {hover && <MapTooltip theme={themes.find((t) => t.theme_id === hover)!} />}
    </div>
  )
}

function MapTooltip({ theme }: { theme: Theme }) {
  return (
    <div className="thememap__tip" role="status">
      <div className="thememap__tip-name">{theme.name}</div>
      <div className="thememap__tip-desc">{theme.description}</div>
      <div className="thememap__tip-meta">{tierLabel(theme.tier)} · score {theme.composite} · {theme.member_count} items{theme.fresh_flow ? ` · +${theme.fresh_flow} fresh` : ''}</div>
      {real(theme.top_companies).length > 0 && <div className="thememap__tip-cos">{real(theme.top_companies).slice(0, 5).map((c) => c.name).join(' · ')}</div>}
    </div>
  )
}

interface MapNode { id: string; x: number; y: number; r: number; flow: boolean; labelW: number; theme: Theme }
function computeMapLayout(themes: Theme[], W: number, H: number) {
  const coreX = W * 0.26, coreY = H * 0.5, coreR = Math.min(32, H * 0.06)
  const laneTiers = [
    { id: 'primary_filing', label: 'Filings' },
    { id: 'official_data', label: 'Official' },
    { id: 'company', label: 'Company' },
    { id: 'news', label: 'News' },
    { id: 'unconfirmed', label: 'Rumour' },
  ]
  const laneX = W * 0.05
  const lanes = laneTiers.map((t, i) => ({ ...t, x: laneX, y: H * 0.18 + (i * (H * 0.64)) / (laneTiers.length - 1) }))

  // Each theme gets a wide label box (up to 3 lines) so the FULL name shows, and a matching tall
  // vertical SLOT so the name never collides with the orb beneath it. The basin band is inset on the
  // right by half a label so the rightmost name can't clip; columns are limited to what fits the
  // width so labels never collide sideways either.
  const labelW = Math.round(Math.max(170, Math.min(250, W * 0.25)))
  const LABEL_H = 46, GAP = 16, TOP = H * 0.06, BOT = H * 0.05
  const usable = Math.max(150, H - TOP - BOT)
  const maxR = Math.min(34, H * 0.066)
  const ranked = [...themes].sort((a, b) => heatOf(b) - heatOf(a)).slice(0, 16)
  const items = ranked.map((t) => ({ t, r: radiusFor(t.member_count, 13, maxR), flow: t.fresh_flow > 0 }))
  const slotH = (it: { r: number }) => it.r * 2 + LABEL_H + GAP

  const basinL = Math.max(W * 0.44, coreX + coreR + 96)
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
      nodes.push({ id: it.t.theme_id, x, y, r: it.r, flow: it.flow, labelW, theme: it.t })
      y += it.r + LABEL_H + GAP
    }
  })
  return { lanes, core: { x: coreX, y: coreY, r: coreR }, nodes }
}

function hcurve(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${mx.toFixed(1)} ${y1.toFixed(1)} ${mx.toFixed(1)} ${y2.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

// ---------------- the BOARD ----------------

function ThemeBoard({ themes, onPick }: { themes: Theme[]; onPick: (id: string) => void }) {
  return (
    <div className="themeboard">
      {themes.map((t) => <ThemeCard key={t.theme_id} t={t} onPick={onPick} />)}
    </div>
  )
}

function ThemeCard({ t, onPick }: { t: Theme; onPick: (id: string) => void }) {
  const scoreTone = t.composite >= 70 ? 'var(--live)' : t.composite >= 45 ? 'var(--accent-bright)' : 'var(--text-faint)'
  return (
    <button type="button" className="themecard" onClick={() => onPick(t.theme_id)}>
      <div className="themecard__top">
        <span className="themecard__dot" style={{ background: tierColorVar(t.tier) }} />
        <span className="themecard__name">{t.name}</span>
        <span className={`themecard__tier themecard__tier--${t.tier}`}>{tierLabel(t.tier)}</span>
        <span className="themecard__score mono" style={{ color: scoreTone }}>{t.composite}</span>
      </div>
      <p className="themecard__desc">{t.description}</p>
      <div className="themecard__flow">
        <Sparkline series={t.flow_series} />
        <span className="themecard__flowmeta">{t.fresh_flow ? `+${t.fresh_flow} fresh` : 'quiet'} · {t.member_count} items</span>
      </div>
      {real(t.top_companies).length > 0 && (
        <div className="themecard__cos">
          {real(t.top_companies).slice(0, 6).map((c, i) => (
            <span key={i} className={`themecard__co themecard__co--o${c.order}`} title={`${orderLabel(c.order)} beneficiary`}>{c.ticker || c.name}</span>
          ))}
        </div>
      )}
      {t.related_themes.length > 0 && (
        <div className="themecard__rel">↳ {t.related_themes.slice(0, 3).map((r) => r.name).join(' · ')}</div>
      )}
    </button>
  )
}

function Sparkline({ series, w = 88, h = 18 }: { series: number[]; w?: number; h?: number }) {
  const pts = sparklinePoints(series, w, h)
  if (!pts) return <span className="sparkline sparkline--empty" />
  const last = pts.split(' ').slice(-1)[0]?.split(',')
  return (
    <svg className="sparkline" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      {last && <circle cx={last[0]} cy={last[1]} r="2" fill="var(--accent-bright)" />}
    </svg>
  )
}

// ---------------- the DEEP-DIVE ----------------

function ThemeDeepDive() {
  const detail = useStore((s) => s.themeDetail)
  const loading = useStore((s) => s.themesLoading)
  const selectTheme = useStore((s) => s.selectTheme)
  const scSelectEvent = useStore((s) => s.scSelectEvent)
  const runEventChecks = useStore((s) => s.runEventChecks)

  if (loading || !detail) {
    return (
      <div className="themedd">
        <button type="button" className="themedd__back" onClick={() => selectTheme(null)}>← Themes</button>
        <div className="themes__empty"><div className="themes__shimmer" /></div>
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
        <span className={`themecard__tier themecard__tier--${t.tier}`}>{tierLabel(t.tier)}</span>
        <span className="themedd__score mono">{t.composite}<span className="themedd__score-sub">/100</span></span>
        <span className="themedd__flow">{t.fresh_flow ? `+${t.fresh_flow} fresh` : 'quiet'} · {t.member_count} items</span>
      </div>
      <h2 className="themedd__name">{t.name}</h2>
      <p className="themedd__desc">{t.description}</p>
      <div className="themedd__sparkrow"><Sparkline series={t.flow_series} w={220} h={36} /><span className="themedd__scores">freshness {detail.scores.freshness} · breadth {detail.scores.breadth} · staying power {detail.scores.persistence}</span></div>

      <div className="themedd__orders">
        {orders.map(([label, cos]) => cos.length > 0 && (
          <div key={label} className="themedd__ordergrp">
            <div className="themedd__orderlabel">{label}</div>
            <div className="themedd__cos">
              {real(cos).slice(0, 12).map((c, i) => (
                <span key={i} className={`themedd__co themedd__co--${c.side}`} title={`impact ${c.impact.composite}/100${c.mention_count ? ` · named ${c.mention_count}×` : ''}`}>{c.ticker ? <b>{c.ticker}</b> : null}{c.name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {detail.related_themes.length > 0 && (
        <div className="themedd__related">
          <span className="themedd__rellabel">Linked themes:</span>
          {detail.related_themes.slice(0, 5).map((r) => (
            <button key={r.theme_id} type="button" className={`themedd__relchip${r.kind === 'opposite' ? ' is-opposite' : ''}`} onClick={() => selectTheme(r.theme_id)}>{r.kind === 'opposite' ? '⇄ ' : ''}{r.name}</button>
          ))}
        </div>
      )}

      <div className="themedd__newshead">The news in this theme</div>
      <div className="themedd__news">
        {detail.members.slice(0, 24).map((m) => (
          <button key={`${m.event_id}-${m.ts}`} type="button" className="themedd__row" onClick={() => scSelectEvent(m as FeedItem)}>
            <span className="themedd__rowscore mono" style={{ color: m.triage_score >= 70 ? 'var(--live)' : m.triage_score >= 40 ? 'var(--accent-bright)' : 'var(--text-faint)' }}>{m.triage_score}</span>
            <span className="themedd__rowhead">{m.headline}</span>
            <span className="themedd__rowsrc">{m.source_name}</span>
          </button>
        ))}
      </div>

      {top && (
        <div className="themedd__actions">
          <button type="button" className="btn btn--amber" onClick={() => runEventChecks(top as FeedItem)}>Run the checks on the top story</button>
        </div>
      )}
    </div>
  )
}
