import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../../lib/store'
import { feedbackChipLabel, feedbackInputFromItem, reasonsFor, type FeedbackPolarity } from '../../lib/feedbackTypes'
import type { FeedbackType, FeedItem } from '../../lib/types'
import type { ReportMenuAnchor } from '../ActivityReportMenu'

// The rating popover behind the 👍 / 👎 thumbs (in the reader) and the rail-row ⚑ flag.
//
//   • With a `polarity`, it shows ONE thumb's reasons — the thumb the reader pressed.
//   • Without one (the rail ⚑), it shows BOTH groups so a quick flag can still go either way.
//
// FAST BY DEFAULT: tapping a reason chip files it immediately (one deliberate thumb-click already opened
// this, so a chip tap is never a stray), and the toast offers Undo. Two exceptions take a moment more:
// "Something else" always needs a note, and the "＋ note" toggle switches to a pick-then-send mode so a
// note can ride along with ANY reason. Nothing is sent until a chip is chosen (or, in note mode, Send).

interface Props {
  item: FeedItem
  anchor: ReportMenuAnchor
  onClose: () => void
  polarity?: FeedbackPolarity // omitted → the rail ⚑ (both groups)
}

export function FeedbackMenu({ item, anchor, onClose, polarity }: Props) {
  const submitFeedback = useStore((s) => s.submitFeedback)
  const [noteMode, setNoteMode] = useState(false)
  // A chosen reason carries the THUMB it was clicked under — the group already knows its polarity, so
  // `other` (which sits under BOTH thumbs in the rail's two-group view) records the right one, and only the
  // clicked group's chip highlights.
  const [sel, setSel] = useState<{ type: FeedbackType; pol: FeedbackPolarity } | null>(null)
  const [note, setNote] = useState('')
  const noteRef = useRef<HTMLTextAreaElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  // Capture the element that opened us during the FIRST render — synchronously, before any effect moves
  // focus into the popover. (An effect-time capture races the focus-in effect below and, under StrictMode's
  // double-invoke, can grab the popover itself; a lazy useState initializer runs once during render, when
  // the trigger — the thumb or the rail ⚑ — is still `document.activeElement`.)
  const [trigger] = useState<HTMLElement | null>(() => document.activeElement as HTMLElement | null)

  // Close AND return focus to the trigger — done SYNCHRONOUSLY, before the unmount removes the popover DOM.
  // (Restoring in an effect-cleanup runs too late: React removes the focused popover node first, the browser
  // drops focus to <body>, and the cleanup then fights it. Focusing the trigger while it's still the only
  // thing to focus, then unmounting, leaves focus exactly where a keyboard user expects it.) `useCallback`
  // so the Escape listener below always closes via the same path.
  // Close, returning focus to whatever opened us so a keyboard user lands back on the thumb (or rail ⚑),
  // not at <body>. Focus the trigger FIRST, then unmount only the popover — the trigger is still mounted
  // (the reader stays open, see the Escape capture below), so focus stays put once the popover is gone.
  const close = useCallback(() => { trigger?.focus?.(); onClose() }, [trigger, onClose])

  useEffect(() => {
    // CAPTURE phase + stopImmediatePropagation: the reader (EventDetail) has its own bubble-phase window
    // Escape listener that backs all the way out to the wire. Without capturing first, one Escape would close
    // the popover AND the whole reader out from under it (and drop focus to <body>). Capturing lets us close
    // only the popover and swallow the key before the reader sees it.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      e.preventDefault()
      close()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [close])
  // Move focus into the popover on open so it's keyboard- and screen-reader-operable (Tab reaches the
  // chips, Escape closes); once a note box appears, focus follows it.
  useEffect(() => { if (noteMode) noteRef.current?.focus(); else popRef.current?.focus() }, [noteMode, sel])

  const file = (type: FeedbackType, pol: FeedbackPolarity, reason: string) => {
    void submitFeedback(feedbackInputFromItem(item, type, reason), pol)
    close()
  }
  const onChip = (type: FeedbackType, pol: FeedbackPolarity) => {
    // "Something else" always needs a note; note mode wants an explicit Send so the note attaches.
    if (type === 'other' || noteMode) { setSel({ type, pol }); setNoteMode(true); return }
    file(type, pol, '')
  }
  const canSend = sel != null && (sel.type !== 'other' || note.trim().length > 0)
  const send = () => { if (sel && canSend) file(sel.type, sel.pol, note.trim()) }

  // Scale IN from the trigger it's anchored to: the popover sits at the button's near corner, so the origin
  // is that corner (bottom-right when it opens upward, top-right when it opens downward). Modals stay centered;
  // an anchored popover does not.
  const origin = anchor.bottom != null ? 'bottom right' : 'top right'

  const group = (pol: FeedbackPolarity) => (
    <div className="fbpop__group" key={pol}>
      {!polarity && <div className="fbpop__grouplabel">{pol === 'up' ? '👍 Good call' : '👎 It’s off'}</div>}
      <div className="fbpop__chips">
        {reasonsFor(pol).map((type) => {
          const on = sel?.type === type && sel?.pol === pol
          return (
            <button
              key={`${pol}:${type}`}
              type="button"
              className={`fbpop__chip fbpop__chip--${pol}${on ? ' fbpop__chip--sel' : ''}`}
              onClick={() => onChip(type, pol)}
              aria-pressed={on}
            >
              {feedbackChipLabel(type)}
            </button>
          )
        })}
      </div>
    </div>
  )

  return createPortal(
    <>
      <div className="fbpop__scrim" onClick={close} />
      <div
        ref={popRef}
        tabIndex={-1}
        className="fbpop"
        style={{ right: anchor.right, top: anchor.top, bottom: anchor.bottom, transformOrigin: origin }}
        onClick={(e) => e.stopPropagation()}
        role="group"
        aria-label="Rate this event"
      >
        <div className="fbpop__head">
          {polarity ? (polarity === 'up' ? 'What’s good about this?' : 'What’s off about this?') : 'Rate this event'}
        </div>
        {polarity ? group(polarity) : (<>{group('up')}{group('down')}</>)}

        {noteMode ? (
          <div className="fbpop__note">
            <textarea
              ref={noteRef}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSend) send() }}
              placeholder={sel?.type === 'other' ? 'Tell us what’s off (required)' : 'Add a note (optional)'}
              className="fbpop__noteinput"
            />
            <div className="fbpop__noterow">
              <span className="fbpop__notehint">{sel ? feedbackChipLabel(sel.type) : 'Pick a reason above'}</span>
              <button type="button" className="fbpop__send" onClick={send} disabled={!canSend}>Send →</button>
            </div>
          </div>
        ) : (
          <button type="button" className="fbpop__addnote" onClick={() => setNoteMode(true)}>＋ add a note</button>
        )}
      </div>
    </>,
    document.body,
  )
}
