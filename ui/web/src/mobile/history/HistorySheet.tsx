// Saved conversations: list, filter (Mine default, matching desktop's whoami-gated default), open,
// delete (two-tap confirm, the desktop pattern). Opening hands the FULL conversation to MobileApp,
// which applies the desktop resume semantics: switch swarm+subject, restore transcript with computed
// cards + conversationId (the next turn continues the same saved thread), and for research carry the
// saved runRoot so a conversation about an older run answers from THAT run.
import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../lib/api'
import type { ChatConversationDetail, ChatConversationSummary } from '../../lib/types'
import { Sheet } from '../sheets/Sheet'

export function HistorySheet({ open, onResume, onClose }: {
  open: boolean
  onResume: (c: ChatConversationDetail) => void
  onClose: () => void
}) {
  const [rows, setRows] = useState<ChatConversationSummary[]>([])
  const [me, setMe] = useState<string | null>(null)
  const [mine, setMine] = useState(true)
  const [q, setQ] = useState('')
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // Two taps on a slow link leave two loads in flight, and without a sequence the SLOWER one wins and
  // opens a chat the user already moved off. Only the newest request may resume.
  const openSeq = useRef(0)

  useEffect(() => {
    // leaving the sheet invalidates an in-flight resume too, so a late response cannot yank the user
    // back into a chat they closed the sheet on
    if (!open) { openSeq.current++; return }
    let dead = false
    setLoading(true)
    void (async () => {
      const who = await api.whoami().catch(() => null)
      if (dead) return
      setMe(who?.user ?? null)
      const r = await api.listChats({ limit: 200 }).catch(() => null)
      if (dead) return
      setRows(r?.conversations ?? [])
      setLoading(false)
    })()
    return () => { dead = true }
  }, [open])

  const filtered = useMemo(() => {
    let r = rows
    if (mine && me) r = r.filter((c) => c.user === me)
    const t = q.trim().toLowerCase()
    if (t) r = r.filter((c) => (c.title + ' ' + c.subject + ' ' + c.preview).toLowerCase().includes(t))
    return r
  }, [rows, mine, me, q])

  const openOne = async (id: string) => {
    const seq = ++openSeq.current
    const c = await api.getChat(id).catch(() => null)
    if (c && seq === openSeq.current) onResume(c)
  }
  const del = async (id: string) => {
    await api.deleteChat(id).catch(() => null)
    setRows((r) => r.filter((c) => c.id !== id))
    setConfirmDel(null)
  }

  return (
    <Sheet open={open} onClose={onClose} label="Saved chats">
      <div className="msheet__headrow">
        <span className="msheet__head" style={{ padding: 0 }}>Chats</span>
        <span className="msheet__tabs" style={{ padding: 0 }}>
          <button className={`msheet__tab${mine ? ' msheet__tab--on' : ''}`} onClick={() => setMine(true)}>Mine</button>
          <button className={`msheet__tab${!mine ? ' msheet__tab--on' : ''}`} onClick={() => setMine(false)}>Everyone</button>
        </span>
      </div>
      <input className="msheet__search" placeholder="Search chats…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="msheet__list">
        {loading && <div className="msheet__empty">Loading…</div>}
        {!loading && filtered.length === 0 && <div className="msheet__empty">{q ? `Nothing matches “${q}”` : 'No saved chats yet — every completed answer lands here.'}</div>}
        {filtered.map((c) => (
          <div key={c.id} className="mhist__row">
            <button className="mhist__main" onClick={() => void openOne(c.id)}>
              <span className="mhist__title">{c.title.replace(/^Ask · /, '')}</span>
              <span className="mhist__meta">
                <span className="mhist__subj mono">{c.subject}</span>
                <span>{c.scope} scope</span>
                {!mine && c.user !== me && <span>{c.user}</span>}
              </span>
            </button>
            {confirmDel === c.id ? (
              <button className="mhist__del mhist__del--confirm" onClick={() => void del(c.id)}>Sure?</button>
            ) : (
              <button className="mhist__del" aria-label="Delete" onClick={() => setConfirmDel(c.id)}>✕</button>
            )}
          </div>
        ))}
      </div>
    </Sheet>
  )
}
