import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useStore } from '../lib/store'
import type { AnchorDelta, ListDelta, WhatChangedRead } from '../lib/types'
import './WhatChangedPanel.css'

// "What changed since the last version" — the detail layer behind the DecisionBanner chip.
//
// The paradigm is VERSION HISTORY (Google Docs / Notion), not a diff viewer. GitHub's compare-revisions
// centres a unified line diff, which for this file reads "22 insertions, 20 deletions" — true, and an
// answer to nothing. The question is "did the call change, did my confidence change": a verdict with a
// direction. So the shape is verdict first, then the three tiers.
//
// Three tiers, because two of them lie on their own. A byte-diff shouts "42 lines changed" (true,
// useless). An anchors-only diff says "nothing changed" while a new kill criterion sits in the tail
// (false — and kill criteria ARE the disconfirmation surface, §8). Tier 1 the call, Tier 2 the evidence,
// Tier 3 the wording.
//
// Every number here is computed server-side and arrives finished — never diffed in a selector (a
// constructing selector returns a fresh reference on every store write: the getSnapshot loop).

/** "2026-07-13" → "13 Jul". Falls back to the raw string for anything unexpected. */
function shortDate(iso?: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${d} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]}`
}

const cell = (v: string | number | null): string => (v === null ? '—' : String(v))

/** §12: an inverted score (higher = worse) must be marked in the header of EVERY table that shows it. */
const isInverted = (a: AnchorDelta) => a.polarity === 'lower_better' || a.polarity === 'ambiguous'

function AnchorRow({ a, i }: { a: AnchorDelta; i: number }) {
  // tone comes from the server, derived from POLARITY — never from the sign of (cur - prev). Colour only
  // a real move; an unchanged anchor stays muted, because an unchanged anchor is evidence, not noise.
  const toneVar =
    !a.moved ? undefined : a.tone === 'better' ? 'var(--accent-bright)' : a.tone === 'worse' ? 'var(--bad)' : 'var(--text)'
  return (
    <div className="wc__row" style={{ '--i': i } as React.CSSProperties} data-moved={a.moved || undefined}>
      <span className="wc__rowlabel">
        {a.label}
        {isInverted(a) && (
          <span className="wc__inv" title="Higher is worse for this one — it is an inverted score.">⌄</span>
        )}
      </span>
      <span className="wc__val">{cell(a.prev)}</span>
      <span className="wc__arrow" aria-hidden>→</span>
      <span className="wc__val" style={toneVar ? { color: toneVar } : undefined}>{cell(a.cur)}</span>
      {a.note && <p className="wc__note">{a.note}</p>}
    </div>
  )
}

function ListRows({ l }: { l: ListDelta }) {
  return (
    <div className="wc__list">
      <div className="wc__listhead">
        <span className="wc__rowlabel">{l.label}</span>
        <span className="wc__count">
          {l.prevCount} → {l.curCount}
          {l.prevCount === l.curCount && (l.added.length || l.removed.length) ? ' · the set changed' : ''}
        </span>
      </div>
      {l.note && <p className="wc__note">{l.note}</p>}
      {l.added.map((t, i) => (
        <p key={`a${i}`} className="wc__item wc__item--add" style={{ '--i': i } as React.CSSProperties}>
          <span className="wc__sign" aria-hidden>+</span>{t}
        </p>
      ))}
      {l.removed.map((t, i) => (
        <p key={`r${i}`} className="wc__item wc__item--rm" style={{ '--i': l.added.length + i } as React.CSSProperties}>
          <span className="wc__sign" aria-hidden>−</span>{t}
        </p>
      ))}
      {/* `reworded` fires ONLY on an exact declared-id match. We never pair by text similarity — claiming
          a pairing the data does not declare would be an unlabeled inference (§3). */}
      {l.reworded.map((r, i) => (
        <p key={`w${i}`} className="wc__item wc__item--rw" style={{ '--i': l.added.length + l.removed.length + i } as React.CSSProperties}>
          <span className="wc__sign" aria-hidden>±</span>
          {r.cur}
          {r.prev === r.cur && <em className="wc__sub"> — the detail behind it was edited</em>}
        </p>
      ))}
    </div>
  )
}

function Body({ read }: { read: WhatChangedRead }) {
  // Not a comparison: render the one honest sentence. Never an empty state — "nothing to compare
  // against" and "nothing changed" are different answers and must never look the same.
  if (read.state !== 'compared') {
    return (
      <div className="wc__body">
        <p className="wc__headline wc__headline--quiet">{read.detail}</p>
      </div>
    )
  }

  const { diff, prev, cur, versionsFound, memo, renamedFrom } = read
  return (
    <div className="wc__body">
      <p className="wc__axis">
        Comparing this run against its own previous recorded version. {versionsFound} versions found.
      </p>
      <div className="wc__vers">
        <span className="wc__ver"><b>{prev.shortRev}</b> · {shortDate(prev.date)}{prev.subject && <em> · “{prev.subject}”</em>}</span>
        <span className="wc__ver">
          <span className="wc__arrow" aria-hidden>→</span>{' '}
          <b>{cur.shortRev}</b>{cur.date ? ` · ${shortDate(cur.date)}` : ''}
          {cur.subject && <em> · “{cur.subject}”</em>}
          {cur.uncommitted && <em className="wc__sub"> · on disk, not yet committed</em>}
        </span>
      </div>
      {renamedFrom && <p className="wc__note">This run was renamed from {renamedFrom}.</p>}

      <div className="wc__verdict">
        <p className="wc__headline">{diff.headline}</p>
        {diff.subline && <p className="wc__subline">{diff.subline}</p>}
        {diff.evidenceCount > 0 && (
          <p className="wc__under">
            {diff.evidenceCount} thing{diff.evidenceCount === 1 ? '' : 's'} changed underneath.
          </p>
        )}
      </div>

      <section className="wc__sect">
        <header className="wc__secthead">
          <h4>The call</h4>
          {/* §12: the marker is required in the header of every table that renders an inverted score. */}
          {diff.hasInverted && <span className="wc__hint">higher is better unless marked ⌄</span>}
        </header>
        {diff.anchors.map((a, i) => <AnchorRow key={a.field} a={a} i={i} />)}
        {diff.modules.map((m, i) => (
          <div className="wc__row" key={m.module} style={{ '--i': diff.anchors.length + i } as React.CSSProperties} data-moved={m.scoreMoved || undefined}>
            <span className="wc__rowlabel wc__rowlabel--sub">{m.module}</span>
            {/* an unreadable score reads UNKNOWN, never "unchanged" — we did not read it */}
            <span className="wc__val">{m.scoreReadable ? cell(m.prevScore) : 'unknown'}</span>
            <span className="wc__arrow" aria-hidden>→</span>
            <span className="wc__val" style={m.scoreMoved ? { color: 'var(--text)' } : undefined}>
              {m.scoreReadable ? cell(m.curScore) : 'unknown'}
            </span>
          </div>
        ))}
      </section>

      {diff.lists.length > 0 && (
        <section className="wc__sect">
          <header className="wc__secthead">
            <h4>The evidence</h4>
            <span className="wc__hint">what the call rests on</span>
          </header>
          {diff.lists.map((l) => <ListRows key={l.field} l={l} />)}
        </section>
      )}

      {diff.prose.length > 0 && (
        <details className="wc__sect wc__sect--fold">
          <summary>
            <h4>The wording</h4>
            <span className="wc__hint">{diff.wordingCount} field{diff.wordingCount === 1 ? '' : 's'} rewritten · no number moved</span>
          </summary>
          <p className="wc__prose">{diff.prose.map((p) => p.label).join(', ')}.</p>
        </details>
      )}

      <p className="wc__memo">
        Memo: <b>{memo.state}</b>{memo.note ? ` — ${memo.note}` : ''}
      </p>
    </div>
  )
}

export function WhatChangedPanel() {
  const open = useStore((s) => s.whatChangedOpen)
  const read = useStore((s) => s.whatChanged)
  const close = useStore((s) => s.closeWhatChanged)
  const reduce = useReducedMotion()

  // Escape is registered ONLY while open — a listener that outlives the panel steals the key from
  // whatever opens next.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  if (!open || !read) return null
  const title = read.runRoot.replace(/^analyses\//, '')
  return (
    <div className="scrim" onClick={close}>
      <motion.div
        className="modal wc"
        role="dialog"
        aria-modal="true"
        aria-label={`What changed — ${title}`}
        onClick={(e) => e.stopPropagation()}
        // A JS entrance never sees the CSS reduced-motion query: keep the opacity fade, drop the move.
        // The modal is not anchored to a trigger, so it stays centered (only popovers are origin-aware).
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="modal__head wc__head">
          <div className="modal__title">What changed</div>
          <div className="wc__sub">{title}</div>
        </div>
        <Body read={read} />
        <div className="modal__actions wc__actions">
          <button type="button" className="btn" onClick={close}>Close</button>
        </div>
      </motion.div>
    </div>
  )
}
