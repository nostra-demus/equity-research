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

const PAD = { l: 46, r: 14, t: 12, b: 22 }

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

/** Growth of capital: the book against the benchmark, both rebased to 100. */
export function GrowthChart({ series, benchmarkSymbol, height = 210 }: {
  series: { date: string; book: number; benchmark: number | null }[]
  benchmarkSymbol: string
  height?: number
}) {
  if (series.length < 2) return <div className="fundbook__none">Not enough valued days to draw a curve yet.</div>
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

  const bookPath = buildPath(bookPts, x, y)
  const area = `${bookPath} L${x(series.length - 1).toFixed(1)} ${y(min).toFixed(1)} L${x(0).toFixed(1)} ${y(min).toFixed(1)} Z`
  const last = series[series.length - 1]!

  return (
    <div className="fundbook__chart">
      <svg className="fundbook__svg" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Growth of capital rebased to 100: the book ends at ${last.book.toFixed(1)}${last.benchmark !== null ? ` against ${benchmarkSymbol} at ${last.benchmark.toFixed(1)}` : ''}`}>
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
        {hasBm && <path d={buildPath(bmPts, x, y)} fill="none" stroke="var(--text-faint)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />}
        <path d={bookPath} fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        <DateAxis series={series} x={x} H={H} W={W} />
      </svg>
      <div className="fundbook__legend">
        <span><i style={{ background: 'var(--accent)' }} />Book <b>{last.book.toFixed(1)}</b></span>
        {hasBm
          ? <span><i style={{ background: 'var(--text-faint)' }} />{benchmarkSymbol} <b>{last.benchmark!.toFixed(1)}</b></span>
          : <span className="dim">{benchmarkSymbol} — no price history loaded</span>}
        <span className="dim">{series[0]!.date} → {last.date} · rebased to 100 at the first funded day</span>
      </div>
    </div>
  )
}

/** Distance below the previous high, day by day. */
export function UnderwaterChart({ series, height = 170 }: {
  series: { date: string; depth: number }[]
  height?: number
}) {
  if (series.length < 2) return <div className="fundbook__none">Not enough valued days to draw a drawdown yet.</div>
  const W = 960
  const H = height
  const deepest = Math.min(...series.map((s) => s.depth))
  // Always show at least a couple of points of depth, so a book that has barely fallen does not get a
  // dramatic-looking curve drawn from noise.
  const min = Math.min(deepest * 1.15, -2)
  const x = (i: number) => PAD.l + (i / (series.length - 1)) * (W - PAD.l - PAD.r)
  const y = (v: number) => PAD.t + (1 - (v - min) / (0 - min)) * (H - PAD.t - PAD.b)
  const pts: Point[] = series.map((s) => ({ date: s.date, value: s.depth }))
  const line = buildPath(pts, x, y)
  const area = `${line} L${x(series.length - 1).toFixed(1)} ${y(0).toFixed(1)} L${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`
  const troughIndex = series.findIndex((s) => s.depth === deepest)

  return (
    <div className="fundbook__chart">
      <svg className="fundbook__svg" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Drawdown from the previous high, deepest ${deepest.toFixed(2)} percent`}>
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
        <path d={line} fill="none" stroke="var(--bad)" strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        <DateAxis series={series} x={x} H={H} W={W} />
      </svg>
      <div className="fundbook__legend">
        <span><i style={{ background: 'var(--bad)' }} />Deepest <b>{deepest.toFixed(2)}%</b>{troughIndex >= 0 && <> on {series[troughIndex]!.date}</>}</span>
        <span className="dim">{series[0]!.date} → {series[series.length - 1]!.date} · measured on the flow-adjusted index, so a withdrawal is not a fall</span>
      </div>
    </div>
  )
}
