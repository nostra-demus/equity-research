import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../../lib/store'
import { FEEDBACK_TYPES, feedbackInputFromItem, feedbackLabel } from '../../lib/feedbackTypes'
import type { FeedbackType, FeedItem } from '../../lib/types'
import type { ReportMenuAnchor } from '../ActivityReportMenu'
import '../swarm/CoreOrb.css' // reuse the .reportpop__item / __label / __hint / __scrim look

// "Flag as irrelevant / mis-scored / …" — the fast, one-click feedback control on a wire card. Built on
// the exact ActivityReportMenu pattern (portaled popover, click-outside scrim, Escape-to-close). The
// default path is one click: pick a type, it submits immediately with whatever reason (if any) is
// already typed. The reason box starts collapsed so it never slows down the common case.

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

  const pick = (type: FeedbackType) => {
    void submitFeedback(feedbackInputFromItem(item, type, reason))
    onClose()
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
              placeholder="Optional — why? (rides along with whichever button you click)"
              style={{ width: '100%', resize: 'vertical', font: 'inherit', fontSize: 11.5 }}
            />
          </div>
        ) : (
          <button className="reportpop__item" onClick={() => setReasonOpen(true)} role="menuitem">
            <span>+ Add reason</span>
          </button>
        )}
        <div className="reportpop__hint">pick a reason to save it — a reason you type rides along</div>
      </div>
    </>,
    document.body,
  )
}
