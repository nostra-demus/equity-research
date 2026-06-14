// The dynamic-themes view: the living, ranked investment themes the news firehose is bucketed into.
// Two ways to look at the same themes[] — a spatial MAP (sources → ranking lens → theme basins, with
// hot basins risen + pulsing) and a ranked BOARD (cards with a flow sparkline + companies by order) —
// plus a deep-dive that reuses the existing event reader + "run the checks" funnel. Custom inline SVG
// (no graph lib), tokens-only colour, transform/opacity animation, reduced-motion aware.

import { useEffect, useMemo, useRef, useState } from 'react'
import { fmtStampLocal } from '../../lib/format'
import { useStore } from '../../lib/store'
import { heatOf, momentumOf, recentFlow, radiusFor, sparklinePoints, tierColorVar, tierLabel, orderLabel, type Theme, type ThemeCompany } from '../../lib/themes'
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

  // ---- LIVE FLOW (paced + truthful) — the scanner reads ~N real items each cycle (one every ~second:
  //      300 items / 300s). The data ARRIVES in a 5-minute burst, but every item in it is real, so we
  //      RE-PACE that burst into a steady stream over the inter-cycle window — the map is alive
  //      continuously instead of clumping for 2s then dying. INBOUND dot = one item read off the wire
  //      (from its real source tier) → Ranking. OUTBOUND dot = one item assigned to a theme → its
  //      basin, ticking that theme's count up by one as it lands. No invented events; only real ones,
  //      shown at their true average cadence. ----
  type Emit = { id: number; d: string; cls: string; tier?: Theme['tier']; dur: number; target?: string }
  type Pending = { kind: 'in'; sourceTier?: string } | { kind: 'out'; themeId: string; tier: Theme['tier'] }
  const MAX_QUEUE = 4000 // generous — a real scan's full volume drives the rate; this is only a runaway guard
  const newsItems = useStore((s) => s.newsItems)
  const arrived = useStore((s) => s.newsArrivedTotal)
  const intervalMin = useStore((s) => s.newsStatus?.intervalMin) || 5
  const prevCounts = useRef<Map<string, number>>(new Map())
  const prevArrived = useRef<number | null>(null)
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
  const nodeById = useMemo(() => new Map(layout.nodes.map((n) => [n.id, n])), [layout])
  const reduceMotion = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  // stable refs so the single pacer loop always reads the current layout / window without resetting
  const layoutRef = useRef(layout); layoutRef.current = layout
  const nodeByIdRef = useRef(nodeById); nodeByIdRef.current = nodeById
  const windowRef = useRef(intervalMin * 60_000); windowRef.current = intervalMin * 60_000

  // ENQUEUE outbound — diff each theme's real member_count; one pending dot per new member. HOLD the
  // shown count at the old value (landings tick it up). A theme appearing for the first time is "born".
  useEffect(() => {
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
  }, [themes, reduceMotion])

  // ENQUEUE inbound — diff the MONOTONIC arrival counter (survives the wire's 1000-item cap, unlike a
  // length diff). The `added` newest items sit at the front of the wire; queue one dot per real item.
  useEffect(() => {
    if (prevArrived.current === null || reduceMotion) { prevArrived.current = arrived; return }
    const added = arrived - prevArrived.current
    prevArrived.current = arrived
    if (added <= 0) return
    const fresh = newsItems.slice(0, Math.max(0, added))
    for (let i = 0; i < added; i++) queue.current.push({ kind: 'in', sourceTier: fresh[i]?.source_tier })
    if (queue.current.length > MAX_QUEUE) queue.current = queue.current.slice(-MAX_QUEUE)
    // the rate IS the intensity: pending items ÷ the scan cadence, dynamic + uncapped (1000/scan ≈ 3.3/s)
    rateRef.current = queue.current.length / Math.max(60, windowRef.current / 1000)
    setRate(rateRef.current)
  }, [arrived, reduceMotion])

  // PACER — one stable loop. It releases dots at the FIXED per-scan rate (rateRef, = scraped ÷ cadence),
  // held steady across the window so the whole scan's volume spreads evenly: 1000 items over 300s reads
  // as a dense ~3.3/s, 100 items as a sparse ~0.3/s. NO clamp — the dot density IS the intensity gauge.
  // A fractional accumulator handles any rate (sub-1/s to tens/s). On drain it goes idle until next scan.
  useEffect(() => {
    if (reduceMotion) return
    const TICK = 200
    const emitOne = (p: Pending) => {
      const L = layoutRef.current
      if (p.kind === 'in') {
        const lane = L.lanes.find((l) => l.id === p.sourceTier) || L.lanes.find((l) => l.id === 'news') || L.lanes[0]
        if (!lane) return
        const d = hcurve(lane.x + 18, lane.y, L.core.x - L.core.r, L.core.y)
        setEmits((e) => [...e, { id: ++seq.current, d, cls: 'thememap__pulse--in', dur: 2.4 }].slice(-120))
      } else {
        const node = nodeByIdRef.current.get(p.themeId)
        if (!node) { setShown((s) => ({ ...s, [p.themeId]: Math.min((s[p.themeId] ?? 0) + 1, prevCounts.current.get(p.themeId) ?? Infinity) })); return }
        const d = hcurve(L.core.x + L.core.r, L.core.y, node.x - node.r, node.y)
        setEmits((e) => [...e, { id: ++seq.current, d, cls: 'thememap__pulse--out', tier: p.tier, dur: 1.7, target: p.themeId }].slice(-120))
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
  }, [reduceMotion])

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
          />
        ))}
      </div>

      {/* source-tier lanes */}
      <div className="thememap__lanes">
        {layout.lanes.map((l) => (
          <div key={l.id} className="thememap__lane" style={{ left: l.x, top: l.y - 12 }}>
            <span className="thememap__lane-label">{l.label}</span>
          </div>
        ))}
      </div>

      {/* the ranking lens — emits harder the heavier the flow (--rate drives the glow), so intensity reads
          at a glance; a live readout beneath it shows the real per-scan volume + rate (the intensity gauge) */}
      <div className={`thememap__core${rate > 0 ? ' is-emitting' : ''}`} style={{ left: layout.core.x - layout.core.r, top: layout.core.y - layout.core.r, width: layout.core.r * 2, height: layout.core.r * 2, ['--rate' as any]: Math.min(1, rate / 4) }}>
        <span>Ranking</span>
      </div>
      {rate > 0 && (
        <div className="thememap__rate" style={{ left: layout.core.x, top: layout.core.y + layout.core.r + 13, ['--rate' as any]: Math.min(1, rate / 4) }}>
          <span className="thememap__rate-dot" aria-hidden /> {Math.round(rate * Math.max(60, intervalMin * 60)).toLocaleString()} this scan · {rate >= 0.1 ? `~${rate.toFixed(1)}/s` : '<0.1/s'}
        </div>
      )}

      {/* theme basins */}
      {layout.nodes.map((n) => {
        const t = n.theme
        return (
          <button
            key={n.id}
            type="button"
            className={`themenode themenode--${t.tier}${t.tier === 'hot' ? ' is-pulsing' : ''}${absorbing.has(n.id) ? ' is-absorbing' : ''}${born.has(n.id) ? ' is-born' : ''}${hover && hover !== n.id && !hoveredRelated.has(n.id) ? ' is-dim' : ''}`}
            style={{ left: n.x - n.r, top: n.y - n.r, width: n.r * 2, height: n.r * 2, ['--tier' as any]: tierColorVar(t.tier) }}
            onMouseEnter={() => setHover(n.id)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onPick(t.theme_id)}
            title={t.description}
          >
            <span className="themenode__core" />
            <span className="themenode__count">{shown[t.theme_id] ?? t.member_count}</span>
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
      <div className="thememap__tip-meta">{tierLabel(theme.tier)} · {momentumOf(theme)} · score {theme.composite} · {theme.member_count} items</div>
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
  const items = ranked.map((t) => ({ t, r: radiusFor(t.member_count, 13, maxR), flow: recentFlow(t.flow_series, 2) > 0 }))
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
        <span className="themecard__flowmeta">{momentumOf(t)}{t.fresh_flow ? ` · +${t.fresh_flow} fresh` : ''} · {t.member_count} items</span>
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

// The flow sparkline. `interactive` (used on the deep-dive) adds a hover crosshair + a tooltip that
// names the hour and its item count, so you can read HOW the theme built over time, not just the shape.
// flow_series is hourly, newest bucket last, zero-filled to now — so point i is (n-1-i) hours before now.
function Sparkline({ series, w = 88, h = 18, interactive = false }: { series: number[]; w?: number; h?: number; interactive?: boolean }) {
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
    <span className="sparkline-wrap" style={{ width: w, height: h }}>
      <svg ref={ref} className="sparkline sparkline--live" width={w} height={h} viewBox={`0 0 ${w} ${h}`} onPointerMove={onMove} onPointerLeave={() => setHi(null)} role="img" aria-label="news flow by hour — hover for each hour’s item count">
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
        <span className="themedd__flow">{momentumOf(t)}{t.fresh_flow ? ` · +${t.fresh_flow} fresh` : ''} · {t.member_count} items</span>
      </div>
      <h2 className="themedd__name">{t.name}</h2>
      <p className="themedd__desc">{t.description}</p>
      <div className="themedd__sparkrow"><Sparkline series={t.flow_series} w={220} h={36} interactive /><span className="themedd__scores">freshness {detail.scores.freshness} · breadth {detail.scores.breadth} · staying power {detail.scores.persistence}</span></div>

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
            <span className="themedd__rowsrc mono" title="When this was published (your local time)">{fmtStampLocal(m.ts)}</span>
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
