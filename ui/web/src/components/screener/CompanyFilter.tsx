// The "filter by company" control: a ticker-first autofill. Instead of typing a company's full name
// (error-prone — a typo or the wrong long-form name silently drops matches), you type a ticker (or a few
// letters of the name), pick the suggestion, and the rail filters to THAT company.
//
// Suggestions come from TWO sources, merged:
//  • the whole-archive company facet (every company the scanner has tagged, with a mention count — the
//    count reassures you the data is there, plus its archive-observed name aliases + listing country), and
//  • the GLOBAL symbol directory (/api/news/symbols): any ticker from any country resolves to its company
//    with every sibling listing as a ticker alias — so typing the US OTC ADR "NHYDY" finds Norsk Hydro
//    even when the wire only ever tagged Oslo's "NHY". A directory match that corresponds to an archive
//    entry ENRICHES it with the ticker-alias set instead of duplicating it.
//
// Reliability ("all the data, without fail"): a picked suggestion carries the ticker + its cross-listing
// tickerAliases + the name + its archive-observed name aliases + the listing country, and the filter
// matches an item tagged with ANY ticker spelling (exact or exchange-suffix-equivalent, listing-country
// guarded) OR named whole-word in its headline/company blob. The match itself lives in
// FeedFilters.matchesFilters / the server's matchesFeedFilters (kept in lockstep via lib/symbology);
// this component only assembles the pick.

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { CompanyFacet, SymbolGroup } from '../../lib/api'
import { baseTicker, cleanTicker, coreCompanyName, normTicker } from '../../lib/symbology'

// The picked company. `ticker` is null for a name-only pick (a company the scanner never resolved a symbol
// for, or a free-typed name that isn't symbol-shaped); `name` is '' only for a legacy/empty pick. `aliases`
// carries the OTHER NAME spellings the archive has tagged for this company identity (from the picked
// facet); `tickerAliases` carries the company's other LISTING SYMBOLS from the global directory (NHY.OL for
// a pick made by NHYDY) — both undefined for a free-typed pick (nothing to look up). `listingCountry`: the
// picked facet's definite listing_country, when the archive agrees on one — carried so the match can tell
// apart two different issuers that reuse the same ticker letters on different exchanges (Codex review,
// PR #319).
export interface CompanyPick {
  ticker: string | null
  name: string
  aliases?: string[]
  tickerAliases?: string[]
  listingCountry?: string | null
}

// One dropdown row: an archive-facet entry (has `count`), a global-directory entry (has `exchange`), or an
// archive entry enriched with the directory's ticker aliases (has both).
export interface CompanySuggestion {
  ticker: string | null
  name: string
  count?: number
  aliases?: string[]
  tickerAliases?: string[]
  listingCountry?: string | null
  exchange?: string
}

const MAX_SHOWN = 8
// A symbol-shaped token: letters/digits/dot/hyphen, no spaces, ≤15 chars — mirrors lib/ticker's TICKER_RE.
// A free-typed value that looks like this ALSO gets an exact-ticker clause; it never REPLACES the name clause.
const LOOKS_TICKER = /^[A-Za-z0-9.\-]{1,15}$/

// rank a suggestion against the lowercased query: exact ticker/ticker-alias → ticker-prefix →
// name/alias-prefix → ticker-contains → name/alias-contains. Returns -1 for no match. Lower is better.
// NAME aliases fold into the name tiers ("Google" for a facet primarily named "Alphabet" — Codex review,
// PR #319); TICKER aliases fold into the symbol tiers (typing NHYDY must rank the NHY-tickered archive
// entry first once the directory enriches it). Exported for unit tests.
export function rankOption(o: CompanySuggestion, ql: string): number {
  const syms = [o.ticker, ...(o.tickerAliases || [])].filter((s): s is string => !!s).map((s) => s.toLowerCase())
  const names = [o.name, ...(o.aliases || [])].map((n) => n.toLowerCase())
  if (syms.some((s) => s === ql)) return 0
  if (syms.some((s) => s.startsWith(ql))) return 1
  if (names.some((nm) => nm.startsWith(ql))) return 2
  if (syms.some((s) => s.includes(ql))) return 3
  if (names.some((nm) => nm.includes(ql))) return 4
  return -1
}

// Merge the archive facet with the global directory's groups. A directory group that IS an archive company
// (same core name, or a shared listing base) enriches that entry with its ticker-alias set — one row, the
// archive count + name aliases + listing country kept; an unknown company appends as a global-only row
// (exchange label instead of a count). Core-name match is tried FIRST so two same-letters facet entries
// that are genuinely different issuers (CAT: Caterpillar vs Catapult, split by listing country) can't both
// absorb the group — the group's own company name picks the right one. Facet tickers are junk-scrubbed
// here too (deploy-skew: an OLD server can still serve "NULL"/CIK tickers). Exported for unit tests.
export function mergeCompanyOptions(facet: CompanyFacet[], groups: SymbolGroup[]): CompanySuggestion[] {
  const out: CompanySuggestion[] = facet.map((f) => ({ ...f, ticker: cleanTicker(f.ticker) }))
  for (const g of groups) {
    const gCore = coreCompanyName(g.name)
    const gAliases = Array.isArray(g.aliases) ? g.aliases : [] // network-sourced (deploy skew): tolerate a missing/legacy aliases field
    const gBases = gAliases.map((a) => baseTicker(a))
    const hit =
      out.find((o) => !!gCore && (coreCompanyName(o.name) === gCore || (o.aliases || []).some((a) => coreCompanyName(a) === gCore))) ||
      // Ticker-base fallback — ONLY when the archive entry has no distinguishing company name of its own.
      // A shared exchange-stripped base across two DIFFERENT issuers (ASX `CAT` = Catapult vs NYSE `CAT`
      // = Caterpillar) must NOT merge them; leave the directory group as its own option. When the archive
      // entry HAS a real core name it either matched on name above (same company) or is a genuinely
      // different issuer, so this fallback fires only for name-less / opaque archive entries sharing the
      // symbol (e.g. a ticker-only facet row gaining the directory's identity).
      out.find((o) => !!o.ticker && !coreCompanyName(o.name) && gBases.includes(baseTicker(o.ticker)))
    if (hit) {
      const merged = new Set([...(hit.tickerAliases || []), ...gAliases.map(normTicker)])
      if (hit.ticker) merged.delete(normTicker(hit.ticker)) // the entry's own ticker needn't repeat
      hit.tickerAliases = [...merged]
      if (!hit.exchange) hit.exchange = g.exchange
      if (!hit.ticker) hit.ticker = g.symbol // a name-only archive entry gains the directory's symbol
    } else {
      out.push({ ticker: g.symbol, name: g.name, exchange: g.exchange, tickerAliases: gAliases.map(normTicker).filter((a) => a !== normTicker(g.symbol)) })
    }
  }
  return out
}

// Turn a FREE-TYPED value (one with no picked suggestion) into a company pick. The typed string is ALWAYS
// kept as the name — the recall floor — so a single-word company name ("Amazon", "Tesla", "Reliance") still
// matches by name instead of being misread as a bare ticker that matches nothing. When the value is also
// symbol-shaped, the exact ticker is added as an extra OR clause. Result: strictly ≥ the recall of a
// name-only search, which is the whole point of "without fail". Returns null for an empty value.
// Exported for unit tests.
export function resolveTypedCompany(raw: string): CompanyPick | null {
  const typed = raw.trim()
  if (!typed) return null
  return { ticker: LOOKS_TICKER.test(typed) ? typed.toUpperCase() : null, name: typed }
}

const chipLabel = (v: CompanyPick): string => (v.ticker ? (v.name ? `${v.ticker} · ${v.name}` : v.ticker) : v.name)

export function CompanyFilter({
  value,
  onChange,
  options = [],
  searchSymbols,
}: {
  value: CompanyPick | null
  onChange: (v: CompanyPick | null) => void
  options?: CompanyFacet[] // the archive company facet (already sorted by mention count, desc)
  searchSymbols?: (q: string) => Promise<SymbolGroup[]> // the global directory (api.symbolSearch), injected so this component stays runtime-import-free for tests
}) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const [groups, setGroups] = useState<SymbolGroup[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const seqRef = useRef(0)
  const uid = useId()
  const listId = `${uid}-list`
  const optId = (i: number) => `${uid}-opt-${i}`

  // close the dropdown on an outside click (same pattern as the rail's ScopeDropdown)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  // Global-directory lookup, debounced per keystroke; a monotonic token discards a stale slow response.
  // Runs only with ≥2 typed chars and an injected search fn (absent in tests / static mode → facet-only).
  useEffect(() => {
    const ql = q.trim()
    if (!searchSymbols || ql.length < 2) { seqRef.current++; setGroups([]); return }
    const seq = ++seqRef.current
    const id = setTimeout(async () => {
      const gs = await searchSymbols(ql)
      if (seq === seqRef.current) setGroups(gs)
    }, 250)
    return () => clearTimeout(id)
  }, [q, searchSymbols])

  const merged = useMemo(() => mergeCompanyOptions(options, groups), [options, groups])

  const suggestions = useMemo(() => {
    const ql = q.trim().toLowerCase()
    if (!ql) return merged.slice(0, MAX_SHOWN) // empty query → the most-mentioned companies (facet is count-sorted)
    const ranked: { o: CompanySuggestion; r: number }[] = []
    for (const o of merged) {
      const r = rankOption(o, ql)
      if (r >= 0) ranked.push({ o, r })
    }
    ranked.sort((a, b) => a.r - b.r || (b.o.count || 0) - (a.o.count || 0) || a.o.name.localeCompare(b.o.name))
    return ranked.slice(0, MAX_SHOWN).map((x) => x.o)
  }, [merged, q])

  useEffect(() => { setHi(0) }, [q])

  const pick = (o: CompanySuggestion) => {
    onChange({
      ticker: o.ticker,
      name: o.name,
      aliases: o.aliases?.length ? o.aliases : undefined,
      tickerAliases: o.tickerAliases?.length ? o.tickerAliases : undefined,
      listingCountry: o.listingCountry ?? undefined,
    })
    setQ('')
    setOpen(false)
    setGroups([])
  }

  // Enter with a query but no explicit pick applies the free-typed value (recall floor + optional ticker),
  // so an un-suggested symbol still works. The suggestion list covers the common case.
  const applyTyped = () => {
    const v = resolveTypedCompany(q)
    if (!v) return
    onChange(v)
    setQ('')
    setOpen(false)
    setGroups([])
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHi((h) => Math.min(h + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)) }
    // Enter picks the highlighted suggestion ONLY when the user has actually typed something — otherwise a
    // freshly-focused (empty) box, whose dropdown highlights the top company by default, would pick it by
    // accident. With no query, Enter is a no-op (applyTyped early-returns on empty).
    else if (e.key === 'Enter') { e.preventDefault(); const o = suggestions[hi]; if (o && open && q.trim()) pick(o); else applyTyped() }
    else if (e.key === 'Escape') { if (q) { setQ('') } else setOpen(false) }
  }

  // A company is picked → show a removable chip in place of the input (clearing it re-focuses the input).
  if (value) {
    return (
      <span className="cfilter cfilter--chip" ref={wrapRef}>
        <span className="cfilter__chip" title={`Showing only news about ${chipLabel(value)}${value.tickerAliases?.length ? ` (also matches ${value.tickerAliases.join(', ')})` : ''} — click ✕ to clear`}>
          <span className="cfilter__chiptxt">{chipLabel(value)}</span>
          <button
            type="button"
            className="cfilter__chipx"
            aria-label={`Clear company filter (${chipLabel(value)})`}
            onClick={() => { onChange(null); setTimeout(() => inputRef.current?.focus(), 0) }}
          >
            ✕
          </button>
        </span>
      </span>
    )
  }

  const dropdownOpen = open && suggestions.length > 0
  return (
    <span className="cfilter" ref={wrapRef}>
      <input
        ref={inputRef}
        className="ffilters__text cfilter__input"
        value={q}
        placeholder="company / ticker…"
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        autoComplete="off"
        role="combobox"
        aria-expanded={dropdownOpen}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-activedescendant={dropdownOpen ? optId(hi) : undefined}
        aria-label="Filter by company — type a ticker or name and pick a suggestion"
        title="Filter by company — type any ticker (any exchange) or the name and pick a match, so every item about that company comes back"
      />
      {dropdownOpen && (
        <div className="cfilter__menu" role="listbox" id={listId}>
          {suggestions.map((o, i) => (
            <button
              key={`${o.ticker || ''}|${o.name}`}
              type="button"
              role="option"
              id={optId(i)}
              aria-selected={i === hi}
              className={`cfilter__opt${i === hi ? ' cfilter__opt--on' : ''}`}
              onMouseEnter={() => setHi(i)}
              onMouseDown={(e) => { e.preventDefault(); pick(o) }}
              title={o.tickerAliases?.length ? `Also matches: ${o.tickerAliases.join(', ')}` : undefined}
            >
              {o.ticker && <span className="cfilter__optsym mono">{o.ticker}</span>}
              <span className="cfilter__optname">{o.name}</span>
              {typeof o.count === 'number'
                ? <span className="cfilter__optn mono">{o.count}</span>
                : o.exchange
                  ? <span className="cfilter__optex">{o.exchange}</span>
                  : null}
            </button>
          ))}
        </div>
      )}
    </span>
  )
}
