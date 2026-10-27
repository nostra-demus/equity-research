// Ordinary anonymous screener views only. News includes Basic/Snapshot's structured fields;
// TA includes Technical's fields. Their duplicate views need no additional requests.
export const FINVIZ_VIEWS = [
  { id: 'overview', code: '111', label: 'Overview', size: 20 },
  { id: 'tickers', code: '411', label: 'Universe / performance', size: 1000 },
  { id: 'valuation', code: '121', label: 'Valuation & growth', size: 20 },
  { id: 'financial', code: '161', label: 'Financial', size: 20 },
  { id: 'ownership', code: '131', label: 'Ownership & short interest', size: 20 },
  { id: 'performance', code: '141', label: 'Performance', size: 20 },
  { id: 'technical', code: '351', label: 'Technical', size: 10 },
  { id: 'news', code: '321', label: 'News & company data', size: 10 },
] as const
export type FinvizViewId = typeof FINVIZ_VIEWS[number]['id']
export const FINVIZ_DETAIL_VIEWS = FINVIZ_VIEWS.slice(2)
export const FINVIZ_PRICE_VIEWS = FINVIZ_VIEWS.filter((view) => view.size === 20)
export const FINVIZ_DATA_REFRESH_MS = 60 * 60_000
export interface FinvizSnapshot {
  source_url: string
  retrieved_at: string // Retrieval time, not the quote, reporting-period or publication timestamp.
  text: Record<string, string | null>
  numbers: Record<string, number | null> // Finviz's raw units; never silently rescale or fill missing with zero.
  range52w?: { low: number | null; high: number | null }
  news?: { title: string; url: string; date: string; channel: string }[]
}
export type FinvizData = Partial<Record<FinvizViewId, FinvizSnapshot>>
export interface FinvizDataRead {
  source_url: string
  refreshing: boolean
  error: string | null
  fields?: Record<string, { label: string; unit: string }> // Unit catalog for engine/export consumers.
  rows: { ticker: string; company: string; views: FinvizData }[]
}

// Units verified against the ordinary free view and Finviz's screener help. Unknown provider fields
// are retained as raw data, with their units explicitly unverified instead of guessed.
const FIELDS: Record<string, [string, string]> = {
  ticker: ['Ticker', ''], company: ['Company', ''],
  'range52w.low': ['52-week low', 'USD'], 'range52w.high': ['52-week high', 'USD'],
  marketCap: ['Market cap', 'USD millions'],
  PE: ['P/E · trailing', '×'], forwardPE: ['Forward P/E · estimate', '×'], PEG: ['PEG · estimate', '×'],
  PS: ['Price / sales', '×'], PB: ['Price / book', '×'], PC: ['Price / cash', '×'], PFCF: ['Price / FCF', '×'],
  eps: ['EPS · trailing', 'USD / share'], epsYoY: ['EPS growth this year · estimate', '%'], epsYoY1: ['EPS growth next year · estimate', '%'],
  eps5Years: ['EPS growth · past 5 years', '%'], estLTGrowth: ['EPS growth · next 5 years · estimate', '%'],
  epsQoQ: ['EPS growth · quarter YoY', '%'], salesQoQ: ['Sales growth · quarter YoY', '%'], sales5Years: ['Sales growth · past 5 years', '%'],
  grossMargin: ['Gross margin', '%'], operMargin: ['Operating margin', '%'], netMargin: ['Net margin', '%'],
  roa: ['Return on assets', '%'], roe: ['Return on equity', '%'], roi: ['Return on invested capital', '%'],
  curRatio: ['Current ratio', '×'], quickRatio: ['Quick ratio', '×'], ltdebtEq: ['Long-term debt / equity', '×'], debtEq: ['Debt / equity', '×'],
  dividendYield: ['Dividend yield · Finviz estimate / trailing fallback', '%'],
  sharesOutstanding2: ['Shares outstanding', 'million shares'], sharesFloat: ['Float', 'million shares'], floatoutstandingpct: ['Float / outstanding', '%'],
  insiderOwn: ['Insider ownership', '%'], insiderTrans: ['Insider transactions', '% change in ownership'], instOwn: ['Institutional ownership', '%'], instTrans: ['Institutional transactions', '% change in ownership'],
  shortInterestShare: ['Short float', '%'], shortInterestRatio: ['Short ratio', 'days'],
  perf1w: ['Performance · week', '%'], perf4w: ['Performance · month', '%'], perf13w: ['Performance · quarter', '%'],
  perf26w: ['Performance · half year', '%'], perf52w: ['Performance · year', '%'], perfYtd: ['Performance · YTD', '%'],
  perf3y: ['Performance · 3 years', '%'], perf5y: ['Performance · 5 years', '%'], perf10y: ['Performance · 10 years', '%'],
  volatility1w: ['Volatility · week', '%'], volatility4w: ['Volatility · month', '%'],
  sma20: ['Distance from SMA 20', '%'], sma50: ['Distance from SMA 50', '%'], sma200: ['Distance from SMA 200', '%'],
  high52w: ['Distance from 52-week high', '%'], low52w: ['Distance from 52-week low', '%'],
  beta: ['Beta', '×'], averageTrueRange: ['Average true range', 'USD'], rsi: ['RSI (14)', '0–100'], candlestick: ['Candlestick', 'Finviz code'],
  price: ['Price · delayed', 'USD'], prevClose: ['Previous close', 'USD'], open: ['Open', 'USD'], change: ['Change', '%'],
  changeopen: ['Change from open', '%'], gap: ['Gap', '%'], volume: ['Volume', 'shares'], averageVolume: ['Average volume', 'shares'], relativeVolume: ['Relative volume', '×'],
  recom: ['Analyst recommendation', '1 strong buy – 5 sell'], targetPrice: ['Analyst target · estimate', 'USD'],
  sector: ['Sector', ''], industry: ['Industry', ''], securityType: ['Security type', ''], country: ['Company country', ''],
  exchange: ['Exchange', ''], index: ['Index membership', ''], www: ['Website', ''], earningsDate: ['Earnings date', 'Finviz local time · timezone unspecified'], type: ['Instrument type', ''],
}
export function finvizField(key: string): { label: string; unit: string } {
  const known = Object.hasOwn(FIELDS, key) ? FIELDS[key] : null
  return known ? { label: known[0], unit: known[1] } : { label: key, unit: 'Raw · units unverified' }
}
export function isFinvizData(value: unknown, ticker: string, company: string): value is FinvizData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = (v: unknown, accepts: (x: unknown) => boolean) => !!v && typeof v === 'object' && !Array.isArray(v)
    && Object.entries(v).length <= 150 && Object.entries(v).every(([key, item]) => /^[a-zA-Z][a-zA-Z0-9]{0,60}$/.test(key) && accepts(item))
  const text = (v: unknown) => v === null || typeof v === 'string' && v.length <= 2000
  const number = (v: unknown) => v === null || typeof v === 'number' && Number.isFinite(v)
  return Object.entries(value).every(([id, raw]) => {
    const view = FINVIZ_VIEWS.find((view) => view.id === id)
    const s = raw as FinvizSnapshot
    if (!view || !s || typeof s.source_url !== 'string' || typeof s.retrieved_at !== 'string' || !Number.isFinite(Date.parse(s.retrieved_at))) return false
    let url: URL
    try { url = new URL(s.source_url) } catch { return false }
    return url.origin === 'https://finviz.com' && !url.username && !url.password && url.pathname === '/screener/stocks'
      && !url.searchParams.has('c') && url.searchParams.get('v') === view.code
      && record(s.text, text) && s.text.ticker === ticker && s.text.company?.trim() === company && record(s.numbers, number)
      && (s.range52w === undefined || !!s.range52w && typeof s.range52w === 'object' && !Array.isArray(s.range52w) && number(s.range52w.low) && number(s.range52w.high))
      && (s.news === undefined || Array.isArray(s.news) && s.news.length <= 20 && s.news.every((n) => n && typeof n.title === 'string'
        && n.title.length <= 2000 && typeof n.channel === 'string' && n.channel.length <= 2000
        && typeof n.date === 'string' && n.date.length <= 100 && typeof n.url === 'string' && /^https?:\/\//i.test(n.url) && n.url.length <= 4000))
  })
}
export function isFinvizDataRead(value: unknown): value is FinvizDataRead {
  const r = value as FinvizDataRead
  return !!r && typeof r.source_url === 'string' && typeof r.refreshing === 'boolean' && (r.error === null || typeof r.error === 'string')
    && (r.fields === undefined || !!r.fields && typeof r.fields === 'object' && !Array.isArray(r.fields)
      && Object.entries(r.fields).every(([key, field]) => field && field.label === finvizField(key).label && field.unit === finvizField(key).unit))
    && Array.isArray(r.rows) && r.rows.every((row) => row && typeof row.ticker === 'string' && typeof row.company === 'string' && isFinvizData(row.views, row.ticker, row.company))
}
