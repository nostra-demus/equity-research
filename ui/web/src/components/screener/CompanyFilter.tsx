// The "filter by company" control: a ticker-first autofill. Instead of typing a company's full name
// (error-prone — a typo or the wrong long-form name silently drops matches), you type a ticker (or a few
// letters of the name), pick the suggestion, and the rail filters to THAT company. The suggestions come
// from the whole-archive company facet (every company the scanner has ever tagged, with a mention count),
// so a symbol is a keystroke away and the count reassures you the data is there.
//
// Reliability ("all the data, without fail"): a picked suggestion carries BOTH the ticker and the name, and
// the filter matches an item tagged with that exact ticker OR named in its headline/company blob — so it
// catches items the name alone would miss (a differently-worded name, or a ticker-only tag) and vice-versa.
// The match itself lives in FeedFilters.matchesFilters / the server's matchesFeedFilters (kept in lockstep);
// this component only chooses the {ticker, name} pair.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CompanyFacet } from '../../lib/api'

// The picked company. `ticker` is null for a name-only pick (a company the scanner never resolved a symbol
// for, or a free-typed name); `name` is '' for a free-typed bare ticker we have no name for.
export interface CompanyPick {
  ticker: string | null
  name: string
}

const MAX_SHOWN = 8
// A clean symbol: letters/digits/dot/hyphen, no spaces — mirrors lib/ticker's TICKER_RE shape. Used only to
// decide whether a free-typed value (one with no matching suggestion) should be applied as an exact-ticker
// filter or as a name substring; it is NOT a hard gate (a name pick is always allowed).
const LOOKS_TICKER = /^[A-Za-z0-9.\-]{1,15}$/

// rank a facet option against the lowercased query: exact ticker → ticker-prefix → name-prefix → contains.
// Returns -1 for no match. Lower is better.
function rankOption(o: CompanyFacet, ql: string): number {
  const sym = (o.ticker || '').toLowerCase()
  const nm = o.name.toLowerCase()
  if (sym && sym === ql) return 0
  if (sym && sym.startsWith(ql)) return 1
  if (nm.startsWith(ql)) return 2
  if (sym && sym.includes(ql)) return 3
  if (nm.includes(ql)) return 4
  return -1
}

const chipLabel = (v: CompanyPick): string => (v.ticker ? (v.name ? `${v.ticker} · ${v.name}` : v.ticker) : v.name)

export function CompanyFilter({
  value,
  onChange,
  options,
}: {
  value: CompanyPick | null
  onChange: (v: CompanyPick | null) => void
  options: CompanyFacet[] // the archive company facet (already sorted by mention count, desc)
}) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // close the dropdown on an outside click / Escape (same pattern as the rail's ScopeDropdown)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const suggestions = useMemo(() => {
    const ql = q.trim().toLowerCase()
    if (!ql) return options.slice(0, MAX_SHOWN) // empty query → the most-mentioned companies (options are count-sorted)
    const ranked: { o: CompanyFacet; r: number }[] = []
    for (const o of options) {
      const r = rankOption(o, ql)
      if (r >= 0) ranked.push({ o, r })
    }
    ranked.sort((a, b) => a.r - b.r || b.o.count - a.o.count || a.o.name.localeCompare(b.o.name))
    return ranked.slice(0, MAX_SHOWN).map((x) => x.o)
  }, [options, q])

  useEffect(() => { setHi(0) }, [q])

  const pick = (o: CompanyFacet) => {
    onChange({ ticker: o.ticker, name: o.name })
    setQ('')
    setOpen(false)
  }

  // Enter with nothing highlighted: apply the free-typed value so an un-suggested ticker still works. A
  // clean symbol becomes an exact-ticker filter; anything else becomes a name substring (best recall for a
  // string we can't resolve). This is the escape hatch — the suggestion list covers the common case.
  const applyTyped = () => {
    const typed = q.trim()
    if (!typed) return
    if (LOOKS_TICKER.test(typed)) onChange({ ticker: typed.toUpperCase(), name: '' })
    else onChange({ ticker: null, name: typed })
    setQ('')
    setOpen(false)
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
        <span className="cfilter__chip" title={`Showing only news about ${chipLabel(value)} — click ✕ to clear`}>
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
        aria-expanded={open}
        aria-autocomplete="list"
        aria-label="Filter by company — type a ticker or name and pick a suggestion"
        title="Filter by company — type a ticker (or the name) and pick a match, so every item about that company comes back"
      />
      {open && suggestions.length > 0 && (
        <div className="cfilter__menu" role="listbox">
          {suggestions.map((o, i) => (
            <button
              key={`${o.ticker || ''}|${o.name}`}
              type="button"
              role="option"
              aria-selected={i === hi}
              className={`cfilter__opt${i === hi ? ' cfilter__opt--on' : ''}`}
              onMouseEnter={() => setHi(i)}
              onMouseDown={(e) => { e.preventDefault(); pick(o) }}
            >
              {o.ticker && <span className="cfilter__optsym mono">{o.ticker}</span>}
              <span className="cfilter__optname">{o.name}</span>
              <span className="cfilter__optn mono">{o.count}</span>
            </button>
          ))}
        </div>
      )}
    </span>
  )
}
