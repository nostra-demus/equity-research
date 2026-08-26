// The two charts the fund book needs, drawn as inline SVG against the cockpit's own tokens.
//
// WHY BOTH CURVES ARE REBASED, NOT PLOTTED AS NAV. Raw NAV cannot be drawn against an index: a deposit
// lifts it without being performance, so the line would show the LP's funding as a gain. Both series
// arrive already rebased to 100 on the first day the book held capital, which is the same
// flow-adjusted index every return on the screen is built from — so the chart can never disagree with
// the numbers beside it.
//
// The drawdown chart is the same index expressed as distance below its own running high. It is the
// honest picture of what holding the book felt like, and it is why it is drawn rather than summarised:
// a single "worst fall" figure hides how long the book spent under water.

import { useCallback, useRef, useState } from 'react'

const PAD = { l: 46, r: 14, t: 12, b: 22 }

/** Shared hover plumbing for both charts.
 *
 *  The SVG scales UNIFORMLY (no preserveAspectRatio override), so one factor converts a client x into
 *  viewBox units — reading the raw offset instead would put the crosshair in the wrong place at every
 *  width but one. Pointer events rather than mouse events, so a touch drag reads the curve too. */
/** Hover state for a chart. MUST be called before any early return — it used to sit after the
 *  "not enough points" guard, which is a conditional hook: the first render that takes the guard and the
 *  next that does not leave React seeing a different number of hooks, and it throws. On the growth chart
 *  that is reachable from the UI, because picking a range with fewer than two points fires the guard.
 *
 *  `count` and `x` are read through a ref at event time rather than closed over, so the handler stays
 *  correct when the range changes the series under it. */
function useHover(geometry: () => { count: number; W: number; x: (i: number) => number }) {
  const ref = useRef<SVGSVGElement | null>(null)
  const geo = useRef(geometry)
  geo.current = geometry
  const [at, setAt] = useState<number | null>(null)
  const onMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const el = ref.current
    const { count, W, x } = geo.current()
    if (!el || count < 2) return
    const box = el.getBoundingClientRect()
    if (box.width <= 0) return
    const vx = ((e.clientX - box.left) / box.width) * W
    // Nearest point, not the one to the left: a crosshair that lags the cursor by half a step reads as
    // broken on a sparse series.
    const span = x(count - 1) - x(0)
    const i = span <= 0 ? 0 : Math.round(((vx - x(0)) / span) * (count - 1))
    setAt(Math.max(0, Math.min(count - 1, i)))
  }, [])
  return { ref, at, onMove, onLeave: useCallback(() => setAt(null), []) }
}

function niceTicks(min: number, max: number, count = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return [min]
  const span = max - min
  const raw = span / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag * 10
  const first = Math.ceil(min / step) * step
  const out: number[] = []
  for (let v = first; v <= max + step * 0.001; v += step) out.push(Number(v.toFixed(6)))
  return out
}

interface Point { date: string; value: number | null }

/** Three dates along the bottom — enough to place the curve in time without crowding it. */
function DateAxis({ series, x, H, W }: { series: { date: string }[]; x: (i: number) => number; H: number; W: number }) {
  const last = series.length - 1
  const marks = [0, Math.round(last / 2), last].filter((i, n, all) => all.indexOf(i) === n)
  return (
    <>
      {marks.map((i) => (
        <text key={i} x={Math.min(Math.max(x(i), PAD.l), W - PAD.r)} y={H - 6}
          textAnchor={i === 0 ? 'start' : i === last ? 'end' : 'middle'} className="fundbook__axis">
          {series[i]!.date}
        </text>
      ))}
    </>
  )
}

function buildPath(points: Point[], x: (i: number) => number, y: (v: number) => number): string {
  let d = ''
  let pen = false
  points.forEach((p, i) => {
    if (p.value === null || !Number.isFinite(p.value)) { pen = false; return }
    d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.value).toFixed(1)} `
    pen = true
  })
  return d.trim()
}

export interface GrowthPoint {
  date: string
  book: number
  benchmark: number | null
  /** Priced at the market rather than taken from a statement. Everything left of the first such point
   *  is reconciled to the broker; this one is an estimate, and the chart draws it as one. */
  provisional?: boolean
}

/** The ranges a broker's chart offers. `5D` is five VALUED points; the rest are calendar windows back
 *  from the last valued day, which is what "six months" means to the person asking. */
const RANGES = [
  { id: '5D', points: 5 },
  { id: '1M', months: 1 },
  { id: '6M', months: 6 },
  { id: '1Y', months: 12 },
  { id: '5Y', months: 60 },
  { id: 'MAX' },
] as const
type RangeId = (typeof RANGES)[number]['id']

function windowStart(last: string, months: number): string {
  // setUTCMonth OVERFLOWS. From 2026-03-31, minus one month asks for 31 February and JavaScript hands
  // back 3 March — so "1M" would start four weeks LATER than it should, and the coverage check would
  // answer for a window that was never drawn. Clamp the day to the target month's own last day.
  const d = new Date(`${last}T00:00:00Z`)
  const day = d.getUTCDate()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() - months)
  const lastOfMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
  d.setUTCDate(Math.min(day, lastOfMonth))
  return d.toISOString().slice(0, 10)
}

/** REBASED TO THE WINDOW, not to inception. A one-month view of a series rebased at inception would
 *  draw the level the book reached months ago and label it a month's growth. Each side takes its own
 *  first value in the window as 100, which is also what keeps the two curves comparable: they start
 *  together on the left edge whatever range is chosen. */
function rebase(points: GrowthPoint[]): GrowthPoint[] {
  if (points.length === 0) return points
  const bookBase = points[0]!.book
  const bmBase = points.find((p) => p.benchmark !== null)?.benchmark ?? null
  if (!Number.isFinite(bookBase) || bookBase === 0) return points
  // SPREAD, do not rebuild. Listing the fields by hand silently dropped `provisional`, so the estimated
  // point survived into the series but lost the one flag that makes the chart draw it as an estimate —
  // it was rendered as reconciled data.
  return points.map((p) => ({
    ...p,
    book: (p.book / bookBase) * 100,
    benchmark: p.benchmark === null || bmBase === null || bmBase === 0 ? null : (p.benchmark / bmBase) * 100,
  }))
}

/** The range buttons, shared by both charts so they cannot drift apart. `covered` decides which are
 *  offered: a range the history cannot fill is shown DISABLED with the reason, because silently drawing
 *  four months under a "1Y" button is the kind of small lie that makes the rest untrustworthy. */
function RangeBar({ range, setRange, full, cut }: {
  range: RangeId
  setRange: (r: RangeId) => void
  full: { date: string }[]
  cut: (r: (typeof RANGES)[number]) => { date: string }[]
}) {
  const last = full.length ? full[full.length - 1]!.date : null
  const covered = (r: (typeof RANGES)[number]): boolean => {
    if (r.id === 'MAX') return full.length >= 2
    const slice = cut(r)
    if (slice.length < 2) return false
    if ('points' in r) return full.length >= r.points!
    return full[0]!.date <= windowStart(last!, r.months!)
  }
  return (
    <div className="fundbook__ranges" role="group" aria-label="Chart range">
      {RANGES.map((r) => {
        const ok = covered(r)
        return (
          <button
            key={r.id}
            className={`fundbook__range${range === r.id ? ' is-on' : ''}`}
            disabled={!ok}
            title={ok ? undefined : `Only ${full.length} valued day${full.length === 1 ? '' : 's'} of history`}
            onClick={() => setRange(r.id)}
          >
            {r.id}
          </button>
        )
      })}
    </div>
  )
}

/** Slice a dated series to a range. Shared so both charts window identically. */
function cutTo<T extends { date: string }>(full: T[], r: (typeof RANGES)[number]): T[] {
  const last = full.length ? full[full.length - 1]!.date : null
  if (r.id === 'MAX' || last === null) return full
  if ('points' in r) return full.slice(-r.points!)
  const from = windowStart(last, r.months!)
  return full.filter((p) => p.date >= from)
}

/** Growth of capital: the book against the benchmark, both rebased to 100 at the start of the range. */
export function GrowthChart({ series: full, benchmarkSymbol, height = 210 }: {
  series: GrowthPoint[]
  benchmarkSymbol: string
  height?: number
}) {
  const [range, setRange] = useState<RangeId>('MAX')
  // Declared here, above every guard below, so the hook count never changes with the chosen range.
  const geo = useRef<{ count: number; W: number; x: (i: number) => number }>({ count: 0, W: 960, x: () => 0 })
  const hover = useHover(() => geo.current)
  const last = full.length ? full[full.length - 1]!.date : null
  const cut = (r: (typeof RANGES)[number]) => cutTo(full, r)
  const active = RANGES.find((r) => r.id === range) ?? RANGES[RANGES.length - 1]
  const series = rebase(cut(active))
  const selector = <RangeBar range={range} setRange={setRange} full={full} cut={cut} />

  if (series.length < 2) {
    return (
      <>
        {selector}
        <div className="fundbook__none">Not enough valued days to draw a curve yet.</div>
      </>
    )
  }
  const W = 960
  const H = height
  const bookPts: Point[] = series.map((s) => ({ date: s.date, value: s.book }))
  const bmPts: Point[] = series.map((s) => ({ date: s.date, value: s.benchmark }))
  const hasBm = bmPts.some((p) => p.value !== null)

  const values = [...bookPts, ...(hasBm ? bmPts : [])].map((p) => p.value).filter((v): v is number => v !== null)
  const lo = Math.min(100, ...values)
  const hi = Math.max(100, ...values)
  const padY = Math.max((hi - lo) * 0.12, 0.4)
  const min = lo - padY
  const max = hi + padY
  const x = (i: number) => PAD.l + (i / (series.length - 1)) * (W - PAD.l - PAD.r)
  const y = (v: number) => PAD.t + (1 - (v - min) / (max - min)) * (H - PAD.t - PAD.b)
  geo.current = { count: series.length, W, x }

  // WHERE THE STATEMENTS STOP. Everything up to this index is reconciled; anything past it is priced at
  // the market and drawn dashed, because there is no daily history across the gap — a solid line would
  // be an interpolation wearing the clothes of data.
  const firstProvisional = series.findIndex((p) => p.provisional)
  const lastReconciled = firstProvisional === -1 ? series.length - 1 : firstProvisional - 1
  const reconciledPts = firstProvisional === -1 ? bookPts : bookPts.slice(0, firstProvisional)
  const bookPath = buildPath(reconciledPts, x, y)
  // Built against the ORIGINAL indices, so the dashed hop starts exactly on the last reconciled point
  // rather than at x(0) of a re-indexed slice.
  const shiftedEstimated = firstProvisional > 0
    ? bookPts.slice(lastReconciled).map((p, i) => ({ ...p, _i: lastReconciled + i }))
    : []
  const estimated = shiftedEstimated.length > 1
    ? shiftedEstimated.map((p, i) => `${i ? 'L' : 'M'}${x(p._i).toFixed(1)} ${y(p.value as number).toFixed(1)}`).join(' ')
    : ''
  // The index gets the same treatment as the book: solid to the boundary, dashed past it. Its level
  // there is a settled close rather than an estimate, but the dash marks "after the last statement",
  // which is what the reader needs to know about BOTH lines. Drawn only when the forward day actually
  // carries a level — otherwise the index simply stops, as it did before.
  const bmReconciled = firstProvisional === -1 ? bmPts : bmPts.slice(0, firstProvisional)
  const bmForward = firstProvisional > 0
    ? bmPts.slice(lastReconciled).map((p, i) => ({ ...p, _i: lastReconciled + i }))
    : []
  const bmEstimated = bmForward.length > 1 && bmForward.every((p) => p.value !== null)
    ? bmForward.map((p, i) => `${i ? 'L' : 'M'}${x(p._i).toFixed(1)} ${y(p.value as number).toFixed(1)}`).join(' ')
    : ''
  const area = `${buildPath(reconciledPts, x, y)} L${x(Math.max(0, lastReconciled)).toFixed(1)} ${y(min).toFixed(1)} L${x(0).toFixed(1)} ${y(min).toFixed(1)} Z`
  const end = series[series.length - 1]!
  // The legend doubles as the readout: hovering replaces "where it ended" with "where it was that day",
  // which is the same three numbers in the same place rather than a floating box that covers the curve.
  const shown = hover.at === null ? end : series[hover.at]!
  // The estimated point carries no index level, so reading the benchmark off the LAST point made the
  // comparison vanish from the legend the moment a live mark existed. It falls back to the last point
  // that actually has one — the day the index is genuinely known to.
  const shownBm = shown.benchmark !== null
    ? shown
    : [...series.slice(0, (hover.at ?? series.length - 1) + 1)].reverse().find((p) => p.benchmark !== null) ?? null

  return (
    <div className="fundbook__chart">
      {selector}
      <svg className="fundbook__svg" viewBox={`0 0 ${W} ${H}`} role="img"
        ref={hover.ref} onPointerMove={hover.onMove} onPointerLeave={hover.onLeave}
        aria-label={`Growth of capital over ${range}, rebased to 100: the book ends at ${end.book.toFixed(1)}${end.benchmark !== null ? ` against ${benchmarkSymbol} at ${end.benchmark.toFixed(1)}` : ''}`}>
        <defs>
          <linearGradient id="fbGrowthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.20" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {niceTicks(min, max).map((t) => (
          <g key={t}>
            <line x1={PAD.l} y1={y(t)} x2={W - PAD.r} y2={y(t)} stroke="var(--hairline)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <text x={PAD.l - 6} y={y(t) + 3} textAnchor="end" className="fundbook__axis">{t.toFixed(0)}</text>
          </g>
        ))}
        {/* 100 is the line that matters: above it the book has made money, below it has not. */}
        <line x1={PAD.l} y1={y(100)} x2={W - PAD.r} y2={y(100)} stroke="var(--hairline-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d={area} fill="url(#fbGrowthFill)" />
        {hasBm && <path d={buildPath(bmReconciled, x, y)} fill="none" stroke="var(--text-faint)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />}
        {hasBm && bmEstimated && (
          <path d={bmEstimated} fill="none" stroke="var(--text-faint)" strokeWidth="1.6" strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        )}
        <path d={bookPath} fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {estimated && (
          <>
            <line x1={x(lastReconciled)} y1={PAD.t} x2={x(lastReconciled)} y2={H - PAD.b}
              stroke="var(--hairline-strong)" strokeWidth="1" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
            <path d={estimated} fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 3"
              vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={x(series.length - 1)} cy={y(series[series.length - 1]!.book)} r="3.5"
              fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            {series[series.length - 1]!.benchmark !== null && (
              <circle cx={x(series.length - 1)} cy={y(series[series.length - 1]!.benchmark as number)} r="3"
                fill="none" stroke="var(--text-faint)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
            )}
          </>
        )}
        <DateAxis series={series} x={x} H={H} W={W} />
        {hover.at !== null && (
          <g pointerEvents="none">
            <line x1={x(hover.at)} y1={PAD.t} x2={x(hover.at)} y2={H - PAD.b}
              stroke="var(--hairline-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx={x(hover.at)} cy={y(shown.book)} r="3.5" fill="var(--accent)" />
            {shown.benchmark !== null && <circle cx={x(hover.at)} cy={y(shown.benchmark)} r="3" fill="var(--text-faint)" />}
          </g>
        )}
      </svg>
      <div className={`fundbook__legend${hover.at !== null ? ' is-reading' : ''}`}>
        <span><i style={{ background: 'var(--accent)' }} />Book <b>{shown.book.toFixed(1)}</b></span>
        {hasBm
          ? (
            <span>
              <i style={{ background: 'var(--text-faint)' }} />{benchmarkSymbol}{' '}
              <b>{shownBm === null ? '—' : shownBm.benchmark!.toFixed(1)}</b>
              {shownBm !== null && shownBm.date !== shown.date && <small className="dim"> @ {shownBm.date}</small>}
            </span>
          )
          : <span className="dim">{benchmarkSymbol} — no price history loaded</span>}
        <span className="dim">
          {hover.at === null
            ? <>{series[0]!.date} → {end.date}{firstProvisional > 0 ? ` · dashed past ${series[lastReconciled]!.date}: the book priced at the market, the index at its close` : ' · rebased to 100 at the start of this range'}</>
            : <>{shown.date} · hover to read any day</>}
        </span>
      </div>
    </div>
  )
}

/** Distance below the previous high, day by day — for the book and for the index beside it.
 *
 *  DERIVED FROM THE SAME GROWTH SERIES the curve above is drawn from, rather than from a second
 *  precomputed field, so the two charts cannot disagree about the same days.
 *
 *  THE PEAK IS THE WINDOW'S OWN. Drawdown is path-dependent: measured against an all-time high from
 *  months ago, a "5D" view would sit at a near-constant depth and say nothing about the week. Each
 *  range re-peaks, so it answers the question its label asks — the worst fall WITHIN that window —
 *  exactly as the growth chart re-bases to its own start.
 *
 *  THE INDEX IS THERE BECAUSE A FALL IS NOT A FACT ON ITS OWN. A book down 0.9% while the market was
 *  down 5% held up; the same 0.9% while the market rose is something else entirely, and the depth alone
 *  cannot tell the two apart. */
export function UnderwaterChart({ series: full, benchmarkSymbol, height = 170 }: {
  series: GrowthPoint[]
  benchmarkSymbol: string
  height?: number
}) {
  const [range, setRange] = useState<RangeId>('MAX')
  const geo = useRef<{ count: number; W: number; x: (i: number) => number }>({ count: 0, W: 960, x: () => 0 })
  const hover = useHover(() => geo.current)

  const cut = (r: (typeof RANGES)[number]) => cutTo(full, r)
  const active = RANGES.find((r) => r.id === range) ?? RANGES[RANGES.length - 1]
  const windowed = cut(active)
  const selector = <RangeBar range={range} setRange={setRange} full={full} cut={cut} />

  /** Running-peak depth, in percent, over whatever slice it is given. */
  const underwater = (pick: (p: GrowthPoint) => number | null): (number | null)[] => {
    let peak: number | null = null
    return windowed.map((p) => {
      const v = pick(p)
      if (v === null || !Number.isFinite(v) || v <= 0) return null
      peak = peak === null ? v : Math.max(peak, v)
      return (v / peak - 1) * 100
    })
  }
  const bookDd = underwater((p) => p.book)
  const bmDd = underwater((p) => p.benchmark)
  const hasBm = bmDd.some((d) => d !== null)

  if (windowed.length < 2) {
    return (
      <>
        {selector}
        <div className="fundbook__none">Not enough valued days to draw a drawdown yet.</div>
      </>
    )
  }
  const W = 960
  const H = height
  const depths = [...bookDd, ...bmDd].filter((d): d is number => d !== null)
  const deepest = Math.min(...bookDd.filter((d): d is number => d !== null), 0)
  // Always show at least a couple of points of depth, so a book that has barely fallen does not get a
  // dramatic-looking curve drawn from noise.
  const min = Math.min(Math.min(...depths, 0) * 1.15, -2)
  const x = (i: number) => PAD.l + (i / (windowed.length - 1)) * (W - PAD.l - PAD.r)
  const y = (v: number) => PAD.t + (1 - (v - min) / (0 - min)) * (H - PAD.t - PAD.b)
  geo.current = { count: windowed.length, W, x }

  const pts: Point[] = windowed.map((p, i) => ({ date: p.date, value: bookDd[i]! }))
  const bmPts: Point[] = windowed.map((p, i) => ({ date: p.date, value: bmDd[i] }))
  const line = buildPath(pts, x, y)
  const area = `${line} L${x(windowed.length - 1).toFixed(1)} ${y(0).toFixed(1)} L${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`
  const troughIndex = bookDd.indexOf(deepest)
  const at = hover.at

  return (
    <div className="fundbook__chart">
      {selector}
      <svg className="fundbook__svg" viewBox={`0 0 ${W} ${H}`} role="img"
        ref={hover.ref} onPointerMove={hover.onMove} onPointerLeave={hover.onLeave}
        aria-label={`Drawdown from the previous high over ${range}, deepest ${deepest.toFixed(2)} percent`}>
        <defs>
          <linearGradient id="fbDdFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--bad)" stopOpacity="0.05" />
            <stop offset="100%" stopColor="var(--bad)" stopOpacity="0.26" />
          </linearGradient>
        </defs>
        {niceTicks(min, 0).map((t) => (
          <g key={t}>
            <line x1={PAD.l} y1={y(t)} x2={W - PAD.r} y2={y(t)} stroke="var(--hairline)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <text x={PAD.l - 6} y={y(t) + 3} textAnchor="end" className="fundbook__axis">{t.toFixed(t === 0 ? 0 : 1)}%</text>
          </g>
        ))}
        <line x1={PAD.l} y1={y(0)} x2={W - PAD.r} y2={y(0)} stroke="var(--hairline-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d={area} fill="url(#fbDdFill)" />
        {hasBm && <path d={buildPath(bmPts, x, y)} fill="none" stroke="var(--text-faint)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />}
        <path d={line} fill="none" stroke="var(--bad)" strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        <DateAxis series={windowed} x={x} H={H} W={W} />
        {at !== null && (
          <g pointerEvents="none">
            <line x1={x(at)} y1={PAD.t} x2={x(at)} y2={H - PAD.b}
              stroke="var(--hairline-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            {bookDd[at] !== null && <circle cx={x(at)} cy={y(bookDd[at]!)} r="3.5" fill="var(--bad)" />}
            {bmDd[at] !== null && <circle cx={x(at)} cy={y(bmDd[at]!)} r="3" fill="var(--text-faint)" />}
          </g>
        )}
      </svg>
      <div className={`fundbook__legend${at !== null ? ' is-reading' : ''}`}>
        {at === null ? (
          <span><i style={{ background: 'var(--bad)' }} />Deepest <b>{deepest.toFixed(2)}%</b>{troughIndex >= 0 && <> on {windowed[troughIndex]!.date}</>}</span>
        ) : (
          <span><i style={{ background: 'var(--bad)' }} />Book <b>{bookDd[at] === null ? '—' : `${bookDd[at]!.toFixed(2)}%`}</b></span>
        )}
        {hasBm && (
          <span>
            <i style={{ background: 'var(--text-faint)' }} />{benchmarkSymbol}{' '}
            <b>{(at === null ? Math.min(...bmDd.filter((d): d is number => d !== null), 0) : bmDd[at])?.toFixed(2) ?? '—'}%</b>
          </span>
        )}
        <span className="dim">
          {at === null
            ? <>{windowed[0]!.date} → {windowed[windowed.length - 1]!.date} · measured on the flow-adjusted index, so a withdrawal is not a fall</>
            : <><b>{windowed[at]!.date}</b> · hover to read any day</>}
        </span>
      </div>
    </div>
  )
}
