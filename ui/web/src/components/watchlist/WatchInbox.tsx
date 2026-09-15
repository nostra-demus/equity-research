// The watchlist's messages, one per name, behind the header's Messages button.
//
// A message is read once; the list is looked at all day. So the messages open over the list on demand — the
// button carries the unread count — instead of taking half the screen above it. Inside, a message says what
// happened, why it matters in the research's own words, and what became of its email — including why most
// messages are never emailed (only an urgent one is). Every message can be marked read, deleted, or answered
// "was this right?": those answers, counted by message type on the server, are how the thresholds get tuned.
import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../lib/store'
import { fmtAgo, fmtStampLocal } from '../../lib/format'
import { emailWords, messageSignal } from '../../lib/watchStatus'
import type { WatchMessage } from '../../lib/types'

export function WatchInbox({ onPick }: { onPick: (listingKey: string) => void }) {
  const read = useStore((s) => s.watchMessages)
  const error = useStore((s) => s.watchMessagesError)
  const load = useStore((s) => s.loadWatchMessages)
  const markAll = useStore((s) => s.markAllWatchMessagesRead)
  const staticMode = useStore((s) => s.staticMode)
  const [open, setOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const anchor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (staticMode) return
    let live = true
    void load().finally(() => { if (live) setLoaded(true) })
    const id = setInterval(() => void load(), 60_000)
    return () => { live = false; clearInterval(id) }
  }, [load, staticMode])

  // Closes on Escape or a press anywhere outside it — never on a press inside a message.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    const onDown = (e: PointerEvent) => { if (anchor.current && !anchor.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown) }
  }, [open])

  // The showcase has no watcher, and an older engine keeps no messages: no button at all, rather than one that
  // implies nothing happened.
  if (staticMode || (loaded && !read && !error)) return null
  const unread = read?.messages.filter((m) => !m.read_at) ?? []
  const shown = showAll ? read?.messages ?? [] : unread
  const pick = (key: string) => { setOpen(false); onPick(key) }

  return (
    <div className="wl__inbox" ref={anchor}>
      <button
        type="button"
        className={`btn btn--mini btn--ghost wl__msgbtn${open ? ' is-open' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={error ? 'Messages, refresh failed' : unread.length ? `Messages, ${unread.length} new` : 'Messages'}
        onClick={() => setOpen((o) => !o)}
      >
        Messages{error ? ' · refresh failed' : ''}
        {unread.length > 0 && <span className="wl__msgcount">{unread.length}</span>}
      </button>
      {open && (
        <section className="winbox" role="dialog" aria-label="Watchlist messages" aria-busy={!read && !error}>
          {!read ? (
            error ? (
              <div className="winbox__err">
                Could not load watchlist messages ({error}).
                <button className="btn btn--mini" onClick={() => void load()}>Try again</button>
              </div>
            ) : (
              <>
                <div className="winbox__skel" />
                <div className="winbox__skel" />
              </>
            )
          ) : (
            <>
              {error && (
                <div className="winbox__err" role="status">
                  Could not refresh messages ({error}). These messages and counts may be out of date.
                  <button className="btn btn--mini" onClick={() => void load()}>Try again</button>
                </div>
              )}
              <div className="winbox__head">
                <span className="winbox__title">Messages</span>
                <span className="winbox__count">{unread.length ? `${unread.length} new` : 'nothing new'}</span>
                <span className="wl__spacer" />
                {unread.length > 1 && <button className="btn btn--mini" onClick={() => void markAll()}>Mark all read</button>}
                {read.messages.length > unread.length && (
                  <button className="btn btn--mini btn--ghost" onClick={() => setShowAll(!showAll)}>
                    {showAll ? 'Only new' : `Show all (${read.messages.length})`}
                  </button>
                )}
              </div>
              <div className="winbox__email">
                {read.email.enabled
                  ? `Urgent ones are emailed to ${read.email.addresses} ${read.email.addresses === 1 ? 'address' : 'addresses'}.`
                  : read.email.reason ?? 'Email is off.'}
              </div>
              {shown.length ? (
                <ol className="winbox__list">
                  {shown.map((m) => <MessageCard key={m.id} m={m} onPick={pick} />)}
                </ol>
              ) : (
                <div className="winbox__empty">
                  {read.messages.length
                    ? 'Everything is read. A message arrives here when something on the list changes.'
                    : 'No messages yet. One arrives here when something on the list changes; urgent ones are emailed too.'}
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  )
}

function MessageCard({ m, onPick }: { m: WatchMessage; onPick: (listingKey: string) => void }) {
  const markRead = useStore((s) => s.markWatchMessage)
  const remove = useStore((s) => s.deleteWatchMessage)
  const answer = useStore((s) => s.answerWatchMessage)
  const [armed, setArmed] = useState(false)
  const [asking, setAsking] = useState(false)
  const [note, setNote] = useState('')
  const sig = messageSignal(m)
  const unread = !m.read_at
  const updated = Date.parse(m.updated_at)

  return (
    <li className={`wmsg${unread ? ' wmsg--unread' : ''}${sig.tone === 'red' ? ' wmsg--warn' : ''}`}>
      <div className="wmsg__head">
        <span className={`wst wst--${sig.tone}`} title={sig.meaning || undefined}>{sig.label}</span>
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
