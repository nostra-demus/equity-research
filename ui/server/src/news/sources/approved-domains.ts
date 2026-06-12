// The approved-source firewall, as domains. This is the machine mirror of the swarm doctrine's
// Gate-0 allow-list (.claude/agents/screener/SWARM.md → sources.signal_gate.allowed): only these
// publishers may enter the inbox. It does TWO jobs:
//   1. build the GDELT query (we ask GDELT only for these domains, so the firehose is pre-filtered);
//   2. map a returned article's domain back to its canonical source_name + region + input_nature.
//
// Gate 0 in the gauntlet still runs authoritatively when a row is promoted — this is a cheap
// pre-filter that keeps off-list noise out of the inbox, not a replacement for it.
//
// Coverage note: GDELT indexes newswires / financial press well (Reuters, Bloomberg, ET, …). Some
// approved sources are data terminals or agencies GDELT barely indexes (CapIQ, IBKR, LME, Baltic,
// Spark, LSEG) — those stay reachable via the manual /screener:sweep; we don't fake their presence.

import type { Region } from '../types'

interface SourceMeta {
  source_name: string // canonical name, exactly as it appears on the swarm allow-list
  region: Region
  input_nature: string // default classification for items from this domain
}

// domain → meta. Keys are bare registrable domains (no www, no path). Subdomains match by suffix.
const DOMAINS: Record<string, SourceMeta> = {
  // global wires
  'reuters.com': { source_name: 'Reuters', region: 'GLOBAL', input_nature: 'news_headline' },
  'apnews.com': { source_name: 'Associated Press', region: 'GLOBAL', input_nature: 'news_headline' },
  'ap.org': { source_name: 'Associated Press', region: 'GLOBAL', input_nature: 'news_headline' },
  'bloomberg.com': { source_name: 'Bloomberg', region: 'GLOBAL', input_nature: 'news_headline' },
  'afp.com': { source_name: 'AFP', region: 'GLOBAL', input_nature: 'news_headline' },
  'ft.com': { source_name: 'Financial Times', region: 'GLOBAL', input_nature: 'news_headline' },
  'spglobal.com': { source_name: 'S&P Global Market Intelligence', region: 'GLOBAL', input_nature: 'news_headline' },
  // US press
  'wsj.com': { source_name: 'The Wall Street Journal', region: 'US', input_nature: 'news_headline' },
  'cnbc.com': { source_name: 'CNBC', region: 'US', input_nature: 'news_headline' },
  'marketwatch.com': { source_name: 'MarketWatch', region: 'US', input_nature: 'news_headline' },
  // India press
  'economictimes.indiatimes.com': { source_name: 'The Economic Times', region: 'IN', input_nature: 'news_headline' },
  'business-standard.com': { source_name: 'Business Standard', region: 'IN', input_nature: 'news_headline' },
  'livemint.com': { source_name: 'LiveMint', region: 'IN', input_nature: 'news_headline' },
  'moneycontrol.com': { source_name: 'Moneycontrol', region: 'IN', input_nature: 'news_headline' },
  // regulators / exchanges → classified as filings / exchange intimations
  'sec.gov': { source_name: 'SEC EDGAR', region: 'US', input_nature: 'regulatory_filing' },
  'nseindia.com': { source_name: 'BSE / NSE Exchange Filing', region: 'IN', input_nature: 'exchange_announcement' },
  'bseindia.com': { source_name: 'BSE / NSE Exchange Filing', region: 'IN', input_nature: 'exchange_announcement' },
  // energy / commodity agencies → macro prints (indexed thinly by GDELT, included where useful)
  'iea.org': { source_name: 'IEA', region: 'GLOBAL', input_nature: 'macro_data_release' },
  'opec.org': { source_name: 'OPEC Secretariat', region: 'GLOBAL', input_nature: 'macro_data_release' },
  'eia.gov': { source_name: 'US EIA', region: 'US', input_nature: 'macro_data_release' },
  'argusmedia.com': { source_name: 'Argus Media', region: 'GLOBAL', input_nature: 'commodity_price_move' },
  // other agency on the list
  'tasnimnews.com': { source_name: 'Tasnim News Agency', region: 'OTHER', input_nature: 'news_headline' },
}

/** Lowercase, strip a leading www., and keep only the host (no scheme/path) — GDELT gives a bare host already. */
export function normalizeDomain(raw: string): string {
  let d = (raw || '').trim().toLowerCase()
  if (d.includes('/')) {
    try {
      d = new URL(d.includes('://') ? d : `https://${d}`).hostname
    } catch {
      d = d.split('/')[0]
    }
  }
  return d.replace(/^www\./, '')
}

/**
 * Resolve an article's domain to an approved source, or null if off-list.
 * Matches the exact registrable domain OR a subdomain on a dot boundary (markets.ft.com → ft.com),
 * never a look-alike (notactuallyft.com does NOT match ft.com) — closing GDELT's loose-match gap.
 */
export function lookupSource(rawDomain: string): SourceMeta | null {
  const host = normalizeDomain(rawDomain)
  if (!host) return null
  if (DOMAINS[host]) return DOMAINS[host]
  for (const dom of Object.keys(DOMAINS)) {
    if (host === dom || host.endsWith('.' + dom)) return DOMAINS[dom]
  }
  return null
}

/** The bare domains to ask GDELT for (so the firehose is pre-filtered to approved sources). */
export function approvedDomains(): string[] {
  return Object.keys(DOMAINS)
}
