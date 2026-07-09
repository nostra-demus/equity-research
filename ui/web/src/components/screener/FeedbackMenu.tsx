import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../../lib/store'
import { FEEDBACK_TYPES, feedbackInputFromItem, feedbackLabel } from '../../lib/feedbackTypes'
import type { FeedbackType, FeedItem } from '../../lib/types'
import type { ReportMenuAnchor } from '../ActivityReportMenu'
import '../swarm/CoreOrb.css' // reuse the .reportpop__item / __label / __hint / __scrim look

// "Flag as irrelevant / mis-scored / …" — the feedback control on a wire card. Built on the exact
// ActivityReportMenu pattern (portaled popover, click-outside scrim, Escape-to-close). SELECT-then-SUBMIT:
// clicking a reason SELECTS it (never submits on its own), an optional comment rides along with ANY reason
// (required for "Other", which is meaningless without one), and one Submit logs the record. Nothing reaches
// the ledger without an explicit Submit — a stray click can't file feedback, and every reason behaves the same.

interface Props {
  item: FeedItem
  anchor: ReportMenuAnchor
  onClose: () => void
}

export function FeedbackMenu({ item, anchor, onClose }: Props) {
  const submitFeedback = useStore((s) => s.submitFeedback)
  const [selected, setSelected] = useState<FeedbackType | null>(null)
  const [commentOpen, setCommentOpen] = useState(false)
  const [reason, setReason] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const needsComment = selected === 'other' // "Other" carries no signal without a comment
  const canSubmit = selected != null && (!needsComment || reason.trim().length > 0)

  const choose = (type: FeedbackType) => {
    setSelected(type)
    if (type === 'other') setCommentOpen(true) // reveal the box — "Other" requires a comment
  }
  const submit = () => {
    if (!selected || !canSubmit) return
    void submitFeedback(feedbackInputFromItem(item, selected, reason))
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
        {FEEDBACK_TYPES.map((type) => {
          const on = selected === type
          return (
            <button
              key={type}
              className="reportpop__item"
              onClick={() => choose(type)}
              role="menuitemradio"
              aria-checked={on}
              style={on ? { background: 'var(--accent-wash)' } : undefined}
            >
              <b style={on ? { color: 'var(--accent-deep)' } : undefined}>{feedbackLabel(type)}</b>
            </button>
          )
        })}
        {commentOpen ? (
          <div style={{ padding: '6px 10px 8px' }}>
            <textarea
              autoFocus
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSubmit) submit() }}
              placeholder={needsComment ? 'Add a comment (required for “Other”)' : 'Optional — add a comment'}
              style={{ width: '100%', resize: 'vertical', font: 'inherit', fontSize: 11.5 }}
            />
          </div>
        ) : (
          <button className="reportpop__item" onClick={() => setCommentOpen(true)} role="menuitem">
            <span>+ Add comment</span>
          </button>
        )}
        <button
          className="reportpop__item"
          onClick={submit}
          disabled={!canSubmit}
          role="menuitem"
          title={canSubmit ? 'Log this feedback' : needsComment ? 'Add a comment for “Other”' : 'Pick a reason first'}
          style={{ alignItems: 'center', marginTop: 2, background: canSubmit ? 'var(--accent-wash)' : 'transparent', cursor: canSubmit ? 'pointer' : 'not-allowed' }}
        >
          <b style={{ color: canSubmit ? 'var(--accent-deep)' : 'var(--text-faint)' }}>Submit →</b>
        </button>
        <div className="reportpop__hint">Pick a reason, add an optional comment, then Submit — nothing is logged until you Submit.</div>
      </div>
    </>,
    document.body,
  )
}
