import { useEffect, useRef, useState } from 'react'
import { fmtClock, fmtSpan } from '../../lib/eta'
import type { RunActivity } from '../../lib/types'
import { fileName } from './IntakeDocCard'

// The live reading list: every step the document-intake run has taken, named, in order, as it takes it.
// Without this the panel showed one static "Reading the new documents…" line for the whole minute-plus
// the analysis takes — alive, working, and completely opaque. Each row is one orchestrator tool call
// (the run-activity SSE); the newest is the step happening right now.

// What each tool call IS, in plain words. The panel answers "what data is being read", so the row leads
// with the verb and carries the subject — the document name is the thing worth reading at a glance.
const VERB: Record<string, string> = {
  Read: 'Read',
  Glob: 'Looked for',
  Grep: 'Searched',
  Bash: 'Ran',
  Write: 'Wrote',
  Edit: 'Edited',
  Task: 'Dispatched',
  WebSearch: 'Searched the web for',
  WebFetch: 'Fetched',
}

// Which tools carry a PATH as their target. Read off the tool, never guessed from the string's shape —
// a real filing is called "Emaar Properties PJSC DFM disclosure 2026-07-14.pdf", spaces and all, so any
// "does it look like a path?" test misreads the very documents this panel exists to name.
const PATH_TOOLS = new Set(['Read', 'Write', 'Edit', 'NotebookEdit'])

// These names differ only at the END — Emaar_Properties_Annual_2025 vs Emaar_Properties_Earnings_Q1_2026.
// A plain end-ellipsis therefore truncates away the one part that says WHICH document this is, leaving
// four identical rows. Keep both ends and drop the middle instead.
// The budget must stay UNDER what the 320px dock can show at this font, or the CSS ellipsis truncates
// the trimmed name a second time and eats the tail this exists to protect. (The CSS stays as the safety
// net for the other, unbounded targets — a Bash description runs to 160 chars.)
const NAME_MAX = 26
function middleTrim(s: string) {
  if (s.length <= NAME_MAX) return s
  const head = Math.ceil((NAME_MAX - 1) / 2)
  const tail = Math.floor((NAME_MAX - 1) / 2)
  return `${s.slice(0, head)}…${s.slice(s.length - tail)}`
}

// A path shows as its file name — the folder is the least interesting part of the row, and the full
// repo-relative path stays on the row's title, one hover away. Every other target (a Bash step's own
// description, a search query, a host) is already a phrase and reads as written.
const subjectOf = (a: RunActivity) => (a.target ? (PATH_TOOLS.has(a.tool) ? middleTrim(fileName(a.target)) : a.target) : null)

// A pool document the run actually opened — the honest headline count. A Read of `frameworks/INTAKE.md`
// is the engine reading its own rules, not evidence about the company, so it is a step and not a document.
const isPoolDoc = (a: RunActivity) => a.tool === 'Read' && !!a.target?.startsWith('data/')

// Past this, the model is thinking rather than reading, and saying so beats a frozen row (the same
// anti-"is it stuck?" signal the run panel's heartbeat line uses).
const QUIET_MS = 45_000

export function IntakeReadingFeed({ steps, live, startedAt }: { steps: RunActivity[]; live: boolean; startedAt?: number }) {
  const scroller = useRef<HTMLDivElement>(null)
  const stick = useRef(true)
  const [now, setNow] = useState(() => Date.now())

  // This panel owns its clock. The constellation's shared 1s tick (store.now) runs only while ORBS are
  // live, and a document-intake run dispatches none — on the shared clock every timer here would sit
  // frozen at 0:00 for the entire analysis.
  useEffect(() => {
    if (!live) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [live])

  // Follow the newest step — but only while the user is already at the bottom. Scrolling up to re-read
  // which document was opened must not be yanked away the moment the next one lands.
  useEffect(() => {
    const el = scroller.current
    if (el && stick.current) el.scrollTop = el.scrollHeight
  }, [steps.length])

  const onScroll = () => {
    const el = scroller.current
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24
  }

  const docs = steps.filter(isPoolDoc).length
  const last = steps[steps.length - 1]
  const quiet = live && last ? now - last.ts > QUIET_MS : false
  const elapsed = startedAt ? fmtClock(Math.max(0, now - startedAt)) : null

  return (
    <div className="ifeed">
      <div className="ifeed__head">
        <span className="ifeed__title">{live ? 'Reading the new documents…' : 'Read the new documents'}</span>
        {elapsed && <span className="ifeed__clock">{elapsed}</span>}
      </div>

      {steps.length === 0 ? (
        // Honest floor: the run is up but has not reported a step yet. Never claim reading that isn't happening.
        <div className="ifeed__empty">{live ? 'Starting the reader…' : 'No steps reported.'}</div>
      ) : (
        <div className="ifeed__rows" ref={scroller} onScroll={onScroll} role="log" aria-live="polite" aria-label="Documents being read">
          {steps.map((a, i) => {
            const current = live && i === steps.length - 1
            const subject = subjectOf(a)
            return (
              <div key={`${a.ts}-${i}`} className="ifeed__row" data-current={current || undefined}>
                <span className={`ifeed__dot${current ? ' ifeed__dot--live' : ''}`} aria-hidden />
                <span className="ifeed__text" title={a.target || a.tool}>
                  <span className="ifeed__verb">{VERB[a.tool] || a.tool}</span>
                  {subject && <span className="ifeed__subject"> {subject}</span>}
                </span>
                {current && <span className="ifeed__age">{quiet ? 'thinking…' : fmtSpan(Math.max(0, now - a.ts))}</span>}
              </div>
            )
          })}
        </div>
      )}

      {steps.length > 0 && (
        <div className="ifeed__foot">
          {docs > 0 && `${docs} document${docs === 1 ? '' : 's'} read · `}
          {steps.length} step{steps.length === 1 ? '' : 's'}
        </div>
      )}
    </div>
  )
}
