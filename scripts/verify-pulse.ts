// Live verifier for the commodity pulse sources (frameworks/commodity/pulse_sources.json). Does
// EXACTLY what production does — one batched stooq CSV call parsed by the production parseStooqCsv(),
// and one CFTC Socrata pull parsed against each subject's cot_market_contains substring — so a PASS
// here means the live /api/swarm/pulse will resolve the same data. Per stooq symbol it reports
// live / N-D / missing (plus the observed CSV header, since we parse by header name); per COT
// substring it lists the DISTINCT matching market names in the last 21 days and flags 0 matches
// (broken substring) or >1 (ambiguous — production picks deterministically, but the substring should
// ideally be tightened). Informational by default (exit 0); --strict exits 1 on any flag.
//
// Run: npx tsx scripts/verify-pulse.ts [pulse_sources.json] [--out results.json] [--strict]

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  loadPulseConfig,
  parseStooqCsv,
  parseCotRows,
  buildStooqUrl,
  buildCotUrl,
} from '../ui/server/src/news/commodity-pulse'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_CONFIG = path.join(REPO_ROOT, 'frameworks', 'commodity', 'pulse_sources.json')
const UA = 'nostra-demus-screener/1.0 (ceekay@muns.io)'

interface SymbolResult {
  subject: string
  symbol: string
  unit: string
  verdict: 'live' | 'n/d' | 'missing'
  last: number | null
  prev_close: number | null
  as_of: string | null
}

interface CotResult {
  subject: string
  contains: string
  distinct_markets: string[]
  picked: string | null
  net: number | null
  report_date: string | null
  flag: 'ok' | 'no_match' | 'ambiguous'
}

async function fetchWithRetry(url: string, timeoutMs = 20_000): Promise<{ status: number | string; body: string }> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: { 'user-agent': UA, accept: '*/*' } })
      const body = await res.text()
      clearTimeout(timer)
      if ((res.status === 429 || res.status >= 500) && attempt === 1) {
        await new Promise((r) => setTimeout(r, 2500))
        continue
      }
      return { status: res.status, body }
    } catch (e: any) {
      clearTimeout(timer)
      if (attempt === 1) { await new Promise((r) => setTimeout(r, 1500)); continue }
      return { status: e?.name === 'AbortError' ? 'timeout' : e?.message || 'fetch-error', body: '' }
    }
  }
  return { status: 'unknown', body: '' }
}

async function main() {
  const args = process.argv.slice(2)
  const positional = args.filter((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--out')
  const configPath = positional[0] ? path.resolve(positional[0]) : DEFAULT_CONFIG
  const outIdx = args.indexOf('--out')
  const outPath = outIdx > -1 ? args[outIdx + 1] : ''
  const strict = args.includes('--strict')

  const cfg = loadPulseConfig(configPath)
  if (!cfg) {
    console.error(`could not load/parse ${configPath}`)
    process.exit(1)
  }
  const subjects = Object.entries(cfg.subjects)
  console.error(`verifying ${subjects.length} subjects from ${configPath}\n`)

  // ---- prices: ONE batched stooq call, exactly as production issues it ----
  const symbols = [...new Set(subjects.map(([, s]) => s.stooq).filter((s): s is string => Boolean(s)))].sort()
  const stooqUrl = buildStooqUrl(symbols)
  console.error(`stooq: ${stooqUrl}`)
  const stooq = await fetchWithRetry(stooqUrl)
  const symbolResults: SymbolResult[] = []
  let observedHeader = ''
  if (typeof stooq.status === 'number' && stooq.status === 200) {
    const lines = stooq.body.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    observedHeader = lines[0] || ''
    console.error(`stooq header observed: ${observedHeader || '(empty body)'}`)
    const quotes = new Map(parseStooqCsv(stooq.body).map((q) => [q.symbol, q]))
    // rows present in the raw CSV but dropped by the parser are N/D; absent rows are missing entirely
    const rawSymbols = new Set(lines.slice(1).map((l) => (l.split(',')[0] || '').trim().toLowerCase()).filter(Boolean))
    for (const [subject, src] of subjects) {
      const sym = src.stooq || ''
      const q = sym ? quotes.get(sym) : undefined
      symbolResults.push({
        subject,
        symbol: sym || '(none)',
        unit: src.unit || '',
        verdict: q ? 'live' : sym && rawSymbols.has(sym) ? 'n/d' : 'missing',
        last: q ? q.last : null,
        prev_close: q ? q.prevClose : null,
        as_of: q?.date ? (q.time ? `${q.date}T${q.time}` : q.date) : null,
      })
    }
  } else {
    console.error(`stooq fetch FAILED: ${stooq.status}`)
    for (const [subject, src] of subjects) {
      symbolResults.push({ subject, symbol: src.stooq || '(none)', unit: src.unit || '', verdict: 'missing', last: null, prev_close: null, as_of: null })
    }
  }

  console.error('\n--- stooq symbols ---')
  for (const r of symbolResults) {
    const tag = r.verdict === 'live' ? 'LIVE' : r.verdict === 'n/d' ? ' N/D' : 'MISS'
    const px = r.last !== null ? `${r.last}${r.prev_close !== null ? ` (prev ${r.prev_close})` : ''} ${r.unit}` : ''
    console.error(`  ${tag}  ${r.subject.padEnd(12)} ${r.symbol.padEnd(7)} ${px}${r.as_of ? `  as of ${r.as_of}` : ''}`)
  }

  // ---- COT: one Socrata pull over the last 21 days, then per-subject substring resolution ----
  const since = new Date(Date.now() - 21 * 86_400_000).toISOString().slice(0, 10)
  const cotUrl = buildCotUrl(since, cfg.cotResource)
  console.error(`\ncftc: ${cotUrl}`)
  const cot = await fetchWithRetry(cotUrl)
  const cotResults: CotResult[] = []
  let rows: unknown = null
  if (typeof cot.status === 'number' && cot.status === 200) {
    try { rows = JSON.parse(cot.body) } catch { rows = null }
  }
  if (Array.isArray(rows)) {
    console.error(`cftc rows in window: ${rows.length}`)
    for (const [subject, src] of subjects) {
      const contains = src.cotMarketContains || ''
      const needle = contains.toLowerCase()
      const distinct = [...new Set(
        (rows as any[])
          .map((r) => String(r?.market_and_exchange_names ?? '').trim())
          .filter((m) => m && needle && m.toLowerCase().includes(needle)),
      )].sort()
      const parsed = contains ? parseCotRows(rows, contains) : null
      cotResults.push({
        subject,
        contains: contains || '(none)',
        distinct_markets: distinct,
        picked: parsed ? parsed.market : null,
        net: parsed ? parsed.managed_money_net : null,
        report_date: parsed ? parsed.report_date : null,
        flag: distinct.length === 1 ? 'ok' : distinct.length === 0 ? 'no_match' : 'ambiguous',
      })
    }
  } else {
    console.error(`cftc fetch FAILED: ${cot.status}`)
    for (const [subject, src] of subjects) {
      cotResults.push({ subject, contains: src.cotMarketContains || '(none)', distinct_markets: [], picked: null, net: null, report_date: null, flag: 'no_match' })
    }
  }

  console.error('\n--- CFTC COT market matches (last 21d) ---')
  for (const r of cotResults) {
    const tag = r.flag === 'ok' ? ' OK ' : r.flag === 'no_match' ? 'NONE' : 'AMBG'
    console.error(`  ${tag}  ${r.subject.padEnd(12)} "${r.contains}" → ${r.distinct_markets.length} market(s)${r.picked ? `; picked "${r.picked}" net ${r.net} @ ${r.report_date}` : ''}`)
    if (r.flag === 'ambiguous') for (const m of r.distinct_markets) console.error(`          - ${m}`)
  }

  const priceLive = symbolResults.filter((r) => r.verdict === 'live').length
  const priceBad = symbolResults.filter((r) => r.verdict !== 'live')
  const cotOk = cotResults.filter((r) => r.flag === 'ok').length
  const cotFlagged = cotResults.filter((r) => r.flag !== 'ok')
  console.error(`\n=== SUMMARY: prices ${priceLive}/${symbolResults.length} live` +
    `${priceBad.length ? ` (${priceBad.map((r) => `${r.subject}:${r.verdict}`).join(', ')})` : ''}; ` +
    `COT ${cotOk}/${cotResults.length} unambiguous` +
    `${cotFlagged.length ? ` (${cotFlagged.map((r) => `${r.subject}:${r.flag}`).join(', ')})` : ''} ===`)

  if (outPath) {
    fs.writeFileSync(outPath, JSON.stringify({ config: configPath, observed_stooq_header: observedHeader, prices: symbolResults, cot: cotResults }, null, 2) + '\n')
    console.error(`results written to ${outPath}`)
  }

  // informational by default — the pulse degrades honestly at runtime; --strict makes CI-able
  if (strict && (priceBad.length || cotFlagged.length)) process.exit(1)
}

main()
