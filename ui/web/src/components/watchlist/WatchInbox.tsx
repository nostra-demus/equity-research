// The watchlist's messages: one per name, newest first, unread on top.
//
// A message says what happened, why it matters in the research's own words, and what became of its email —
// including why most messages are never emailed (only a crossed line is). Every message can be marked read,
// deleted, or answered "was this right?": those answers, counted by message type on the server, are how the
// thresholds get tuned.
import { useEffect, useState } from 'react'
import { useStore } from '../../lib/store'
import { fmtAgo, fmtStampLocal } from '../../lib/format'
import { STATUS_KEY, STATUS_LABEL, emailWords, messageStatus } from '../../lib/watchStatus'
import type { WatchMessage } from '../../lib/types'

export function WatchInbox({ onPick }: { onPick: (listingKey: string) => void }) {
  const read = useStore((s) => s.watchMessages)
  const error = useStore((s) => s.watchMessagesError)
  const load = useStore((s) => s.loadWatchMessages)
  const markAll = useStore((s) => s.markAllWatchMessagesRead)
  const staticMode = useStore((s) => s.staticMode)
  const [showAll, setShowAll] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (staticMode) return
    let live = true
    void load().finally(() => { if (live) setLoaded(true) })
    const id = setInterval(() => void load(), 60_000)
    return () => { live = false; clearInterval(id) }
  }, [load, staticMode])

  // The showcase has no watcher, and an older engine keeps no messages: no inbox at all, rather than an
  // empty one that implies nothing happened.
  if (staticMode) return null
  if (!loaded && !read && !error) {
    return (
      <section className="winbox" aria-busy="true" aria-label="Watchlist messages">
        <div className="winbox__skel" />
        <div className="winbox__skel" />
      </section>
    )
  }
  if (error && !read) {
    return (
      <section className="winbox" aria-label="Watchlist messages">
        <div className="winbox__err">
          Could not load watchlist messages ({error}).
          <button className="btn btn--mini" onClick={() => void load()}>Try again</button>
        </div>
      </section>
    )
  }
  if (!read) return null

  const unread = read.messages.filter((m) => !m.read_at)
  const shown = showAll ? read.messages : unread
  const emailLine = read.email.enabled
    ? `Urgent ones are emailed to ${read.email.addresses} ${read.email.addresses === 1 ? 'address' : 'addresses'}.`
    : `Email is off: ${read.email.reason ?? 'not set up.'}`

  return (
    <section className="winbox" aria-label="Watchlist messages">
      <div className="winbox__head">
        <span className="winbox__title">Messages</span>
        <span className="winbox__count">{unread.length ? `${unread.length} new` : 'nothing new'}</span>
        <span className="winbox__email">{emailLine}</span>
        <span className="wl__spacer" />
        {unread.length > 1 && <button className="btn btn--mini" onClick={() => void markAll()}>Mark all read</button>}
        {read.messages.length > unread.length && (
          <button className="btn btn--mini btn--ghost" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Only new' : `Show all (${read.messages.length})`}
          </button>
        )}
      </div>
      {shown.length ? (
        <ol className="winbox__list">
          {shown.map((m) => <MessageCard key={m.id} m={m} onPick={onPick} />)}
        </ol>
      ) : (
        <div className="winbox__empty">
          {read.messages.length
            ? 'Everything is read. A message arrives here when something on the list changes.'
            : 'No messages yet. One arrives here when something on the list changes; urgent ones are emailed too.'}
        </div>
      )}
    </section>
  )
}

function MessageCard({ m, onPick }: { m: WatchMessage; onPick: (listingKey: string) => void }) {
  const markRead = useStore((s) => s.markWatchMessage)
  const remove = useStore((s) => s.deleteWatchMessage)
  const answer = useStore((s) => s.answerWatchMessage)
  const [armed, setArmed] = useState(false)
  const [asking, setAsking] = useState(false)
  const [note, setNote] = useState('')
  const status = messageStatus(m)
  const unread = !m.read_at
  const updated = Date.parse(m.updated_at)

  return (
    <li className={`wmsg${unread ? ' wmsg--unread' : ''}${status === 'warning' ? ' wmsg--warn' : ''}`}>
      <div className="wmsg__head">
        {status
          ? <span className={`wst wst--${STATUS_KEY[status]}`}>{STATUS_LABEL[status]}</span>
          : <span className="wst wst--info">{m.kind === 'summary' ? 'Summary' : 'Note'}</span>}
        {m.ticker && (
          <button
            className="wmsg__sym"
            disabled={!m.listing_key}
            onClick={() => { if (m.listing_key) onPick(m.listing_key) }}
            title="Show this name in the list"
          >
            {m.ticker}
          </button>
        )}
        <span className="wmsg__title">{m.title}</span>
        <span className="wmsg__when" title={fmtStampLocal(m.updated_at)}>{Number.isFinite(updated) ? fmtAgo(updated) : ''}</span>
      </div>

      <ul className="wmsg__items">
        {m.items.map((i) => (
          <li key={i.id} className="wmsg__item">
            {(m.items.length > 1 || i.ticker) && (
              <div className="wmsg__itemtitle">{i.ticker ? <b>{i.ticker} · </b> : null}{i.title}</div>
            )}
            <div className="wmsg__detail">{i.detail}</div>
            {i.quote && (
              <blockquote className="wmsg__quote">
                “{i.quote}”
                {i.source && <cite>{i.source}</cite>}
              </blockquote>
            )}
          </li>
        ))}
      </ul>

      <div className="wmsg__foot">
        <span className="wmsg__email">{emailWords(m)}</span>
        <span className="wl__spacer" />
        {m.feedback ? (
          <span className="wmsg__answered">
            You said {m.feedback.verdict === 'yes' ? 'this was right' : 'this was not right'}{m.feedback.note ? ` — “${m.feedback.note}”` : ''}
          </span>
        ) : asking ? (
          <span className="wmsg__ask">
            <input
              className="fld wmsg__note" value={note} maxLength={1000} autoFocus
              placeholder="What was wrong? (optional)" aria-label="What was wrong with this message"
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { void answer(m.id, 'no', note); setAsking(false) } }}
            />
            <button className="btn btn--mini" onClick={() => { void answer(m.id, 'no', note); setAsking(false) }}>Save</button>
            <button className="btn btn--mini btn--ghost" onClick={() => setAsking(false)}>Cancel</button>
          </span>
        ) : (
          <span className="wmsg__ask">
            Was this right?
            <button className="btn btn--mini" onClick={() => void answer(m.id, 'yes')}>Yes</button>
            <button className="btn btn--mini" onClick={() => setAsking(true)}>No</button>
          </span>
        )}
        <button className="btn btn--mini btn--ghost" onClick={() => void markRead(m.id, unread)}>{unread ? 'Mark read' : 'Mark unread'}</button>
        {/* Two-click confirm, and the second click restates the act. Delete hides it; the record is kept. */}
        <button
          className={`btn btn--mini btn--ghost${armed ? ' btn--armed' : ''}`}
          onClick={() => { if (armed) { setArmed(false); void remove(m.id) } else setArmed(true) }}
          onBlur={() => setArmed(false)}
          title="Hide this message. Its record is kept, so its answer still counts."
        >
          {armed ? 'Yes — delete' : 'Delete'}
        </button>
      </div>
    </li>
  )
}
