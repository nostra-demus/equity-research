import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'

// In-stage subject picker for a NON-research constellation swarm (e.g. commodity: GOLD/SUGAR). The
// research empty state uses CompanyPicker (rich per-ticker data); a swarm's subjects are a plain list
// of ids, so this is its lean sibling — same search-first, keyboard-driven .coco shell and idioms, but
// no file counts / decision pills / sync states (inventing those would be fake data). Every label is
// derived from the active swarm's manifest (unit/label), so a future swarm works with zero edits
// (CLAUDE.md §26). Picking a subject calls the same selectTicker the top-right picker uses.
export function SubjectPicker() {
  const subjects = useStore((s) => s.swarmSubjectList)
  const loading = useStore((s) => s.swarmSubjectsLoading)
  const selectTicker = useStore((s) => s.selectTicker)
  const activeRuns = useStore((s) => s.activeRunsByTicker)
  const connected = useStore((s) => s.connected)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const swarms = useStore((s) => s.swarms)

  const sw = swarms.find((x) => x.id === activeSwarm)
  const unit = sw?.unit || 'subject' // singular, e.g. "commodity"
  const plural = (sw?.label || `${unit}s`).toLowerCase() // e.g. "commodities"
  const article = /^[aeiou]/i.test(unit) ? 'an' : 'a'

  const [q, setQ] = useState('')
  const [hi, setHi] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // default sort: running subjects first, then the server's alphabetical order (subjects arrive sorted)
  const sorted = useMemo(() => {
    return [...subjects].sort((a, b) => {
      const r = (activeRuns.has(a) ? 0 : 1) - (activeRuns.has(b) ? 0 : 1)
      return r || a.localeCompare(b)
    })
  }, [subjects, activeRuns])

  // filter: prefix matches rank above substring matches; otherwise keep the default order
  const filtered = useMemo(() => {
    const query = q.trim().toUpperCase()
    if (!query) return sorted
    const pref: string[] = [], sub: string[] = []
    for (const s of sorted) {
      const u = s.toUpperCase()
      if (u.startsWith(query)) pref.push(s)
      else if (u.includes(query)) sub.push(s)
    }
    return [...pref, ...sub]
  }, [sorted, q])

  useEffect(() => { setHi(0) }, [q])
  useEffect(() => { setHi((h) => Math.min(h, Math.max(0, filtered.length - 1))) }, [filtered.length])

  // focus the search on mount — but never steal focus from an open modal/another field
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    const a = document.activeElement as HTMLElement | null
    if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable || a.closest('[role="dialog"]'))) return
    el.focus()
  }, [])

  // keep the keyboard-highlighted row in view (on keyboard moves only — hover never scrolls)
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${hi}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [hi])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); const s = filtered[hi]; if (s) selectTicker(s) }
    else if (e.key === 'Escape') { if (q) setQ(''); else inputRef.current?.blur() }
  }

  const filtering = q.trim().length > 0
  const showLoading = loading && !subjects.length // spinner only before the first list lands
  const examples = subjects.slice(0, 3).join(', ')
  const placeholder = !connected ? 'Reconnecting…' : examples ? `Search ${unit} (${examples})…` : `Search ${unit}…`

  return (
    <motion.div className="coco coco--subj" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }} onKeyDown={onKeyDown}>
      <div className="coco__head">
        <span className="coco__eyebrow">Select {article} {unit}</span>
        <span className="coco__count">{subjects.length} {subjects.length === 1 ? unit : plural}</span>
      </div>

      <div className="coco__search">
        <svg className="coco__searchicon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          disabled={!connected}
          spellCheck={false}
          autoComplete="off"
          aria-label={`Search ${plural}`}
        />
        {!q && !!subjects.length && <span className="kbd coco__hint">↑↓ Enter</span>}
      </div>

      <div className="coco__list" role="listbox" aria-label={plural} ref={listRef}>
        {showLoading ? (
          <div className="coco__loading">
            <svg className="empty__spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v5h-5" /></svg>
            <span>Loading {plural}…</span>
          </div>
        ) : (
          filtered.map((s, i) => {
            const running = activeRuns.has(s)
            return (
              <button
                key={s}
                data-idx={i}
                role="option"
                aria-selected={i === hi}
                className={`coco__row${i === hi ? ' is-active' : ''}`}
                onClick={() => selectTicker(s)}
              >
                <span className="coco__sym">
                  {running && <span className="pulsedot" title="Run in progress" />}
                  {s}
                </span>
                <span className="coco__verdict">
                  {running && <span className="coco__ago" style={{ color: 'var(--accent)' }}>running</span>}
                </span>
              </button>
            )
          })
        )}

        {!showLoading && !filtered.length && (
          filtering
            ? <div className="coco__nomatch">No {unit} matches “{q.trim()}”</div>
            : <div className="coco__nomatch">No {plural} available yet.</div>
        )}
      </div>

      {filtering && filtered.length !== subjects.length && (
        <div className="coco__foot"><span className="coco__legend">{filtered.length} of {subjects.length}</span></div>
      )}
    </motion.div>
  )
}
