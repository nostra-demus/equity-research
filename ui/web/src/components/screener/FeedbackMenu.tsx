import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../../lib/store'
import { FEEDBACK_TYPES, feedbackInputFromItem, feedbackLabel } from '../../lib/feedbackTypes'
import type { FeedbackType, FeedItem } from '../../lib/types'
import type { ReportMenuAnchor } from '../ActivityReportMenu'
import '../swarm/CoreOrb.css' // reuse the .reportpop__item / __label / __hint / __scrim look

// "Flag as irrelevant / mis-scored / …" — the fast feedback control on a wire card. Built on the exact
// ActivityReportMenu pattern (portaled popover, click-outside scrim, Escape-to-close). The 7 SPECIFIC
// reasons submit in one click (a typed reason rides along). "Other" carries no signal without a comment,
// so it does NOT fire on click — it opens the comment box + an explicit Submit button (also reachable via
// "+ Add reason"); the reader types, then Submits as "Other" (⌘/Ctrl+Enter submits too). The reason box
// starts collapsed so it never slows down the common one-click case.

interface Props {
  item: FeedItem
  anchor: ReportMenuAnchor
  onClose: () => void
}

export function FeedbackMenu({ item, anchor, onClose }: Props) {
  const submitFeedback = useStore((s) => s.submitFeedback)
  const [reasonOpen, setReasonOpen] = useState(false)
  const [reason, setReason] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = (type: FeedbackType) => {
    void submitFeedback(feedbackInputFromItem(item, type, reason))
    onClose()
  }

  // A specific reason submits on click (a typed reason rides along). "Other" is the free-text path: it has
  // no meaning without a comment, so it opens the comment box + Submit button instead of firing an empty record.
  const pick = (type: FeedbackType) => {
    if (type === 'other') { setReasonOpen(true); return }
    submit(type)
  }

  return createPortal(
    <>
      <div className="reportpop__scrim" onClick={onClose} />
      <div
        className="reportpop"
        style={{ left: 'auto', right: anchor.right, top: anchor.top, bottom: anchor.bottom, transform: 'none', animation: 'none' }}
        onClick={(e) => e.stopPropagation()}
        role="menu"
      >
        <div className="reportpop__label">Feedback on this item</div>
        {FEEDBACK_TYPES.map((type) => (
          <button key={type} className="reportpop__item" onClick={() => pick(type)} role="menuitem">
            <b>{feedbackLabel(type)}</b>
          </button>
        ))}
        {reasonOpen ? (
          <div style={{ padding: '6px 10px 8px' }}>
            <textarea
              autoFocus
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && reason.trim()) submit('other') }}
              placeholder="Add a comment, then Submit — or click a reason above (your text rides along)"
              style={{ width: '100%', resize: 'vertical', font: 'inherit', fontSize: 11.5 }}
            />
            <button
              className="reportpop__item"
              onClick={() => submit('other')}
              disabled={!reason.trim()}
              role="menuitem"
              title={reason.trim() ? 'Submit as “Other” with your comment' : 'Type a comment first'}
              style={{ width: '100%', textAlign: 'center', marginTop: 4, opacity: reason.trim() ? 1 : 0.4, cursor: reason.trim() ? 'pointer' : 'not-allowed' }}
            >
              <b>Submit →</b>
            </button>
          </div>
        ) : (
          <button className="reportpop__item" onClick={() => setReasonOpen(true)} role="menuitem">
            <span>+ Add reason</span>
          </button>
        )}
        <div className="reportpop__hint">Type a comment and Submit, or pick a reason above — your text rides along.</div>
      </div>
    </>,
    document.body,
  )
}
