import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { api, isStatic } from '../lib/api'
import { fmtAbsolute, fmtAgo, moduleLabel } from '../lib/format'
import type { ChatConversationSummary, ChatListResult, ChatScope, Whoami } from '../lib/types'

// Saved-conversation browser for the Ask panel. Lists every persisted chat (who asked, when, about which
// company), with the same filter posture as the activity log, and lets the user reopen one and keep
// chatting. Read + continue + delete; the writes happen through the Ask panel itself.

const scopeLabel = (c: ChatConversationSummary): string => {
  if (c.scope === 'run') return 'Whole run'
  if (c.scope === 'module') return c.module ? moduleLabel(c.module) : 'Module'
  return 'Single orb'
}

export function ChatHistory() {
  const close = useStore((s) => s.closeChatHistory)
  const resume = useStore((s) => s.resumeConversation)
  const del = useStore((s) => s.deleteConversation)
  const [data, setData] = useState<ChatListResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [whoami, setWhoami] = useState<Whoami | null>(null)
  const [resuming, setResuming] = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const staticMode = isStatic()

  // filters
  const [mineOnly, setMineOnly] = useState(true) // default to the signed-in user's own chats
  const [subject, setSubject] = useState('')
  const [scope, setScope] = useState('')
  const [q, setQ] = useState('')

  const [qDebounced, setQDebounced] = useState('')
  useEffect(() => { const t = setTimeout(() => setQDebounced(q), 250); return () => clearTimeout(t) }, [q])

  const reqGen = useRef(0)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  const load = useCallback(async () => {
    // With "Mine" selected we need the signed-in identity to filter by — hold the first load until whoami
    // resolves (it always does; failure falls back to 'local'), so the list never flashes everyone's chats.
    if (mineOnly && !whoami) return
    const gen = ++reqGen.current
    try {
      const res = await api.listChats({
        user: mineOnly && whoami ? whoami.user : undefined,
        subject: subject || undefined,
        scope: (scope as ChatScope) || undefined,
        q: qDebounced || undefined,
        limit: 500,
      })
      if (mounted.current && gen === reqGen.current) setData(res)
    } catch {
      if (mounted.current && gen === reqGen.current) setData({ conversations: [], total: 0, allTime: 0, users: [], subjects: [], earliest: null })
    } finally {
      if (mounted.current && gen === reqGen.current) setLoading(false)
    }
  }, [mineOnly, whoami, subject, scope, qDebounced])

  // whoami first (drives the "mine" default), then the list
  useEffect(() => { api.whoami().then(setWhoami).catch(() => setWhoami({ user: 'local', userVia: 'local' })) }, [])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (confirmDel ? setConfirmDel(null) : close())
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, confirmDel])

  const onResume = async (id: string) => { setResuming(id); await resume(id); if (mounted.current) setResuming(null) }
  const onDelete = async (id: string) => { setConfirmDel(null); await del(id); load() }

  const rows = data?.conversations ?? []
  const anyFilter = !!(subject || scope || q || !mineOnly)
  const historySince = data?.earliest ? fmtAbsolute(data.earliest) : null

  const subjects = useMemo(() => data?.subjects ?? [], [data])

  return (
    <motion.div className="activity chathist" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} role="complementary" aria-label="Chat history">
      <div className="activity__head">
        <div style={{ minWidth: 0 }}>
          <div className="activity__title">Chat history</div>
          <div className="activity__sub">
            Every Ask conversation — reopen one to keep chatting
            {whoami && <> · signed in as <b style={{ color: 'var(--text-muted)' }}>{whoami.user}</b>{whoami.userVia === 'local' && ' (local)'}</>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <button className="btn" style={{ height: 30 }} onClick={() => { setLoading(true); load() }}>Refresh ↻</button>
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
        </div>
      </div>

      {staticMode ? (
        <div className="activity__empty">Chat history lives on the live engine. This is the read-only showcase.</div>
      ) : (
        <>
          <div className="activity__filters">
            <div className="seg" role="group" aria-label="Whose chats">
              <button className={`seg__btn${mineOnly ? ' seg__btn--on' : ''}`} onClick={() => setMineOnly(true)}>Mine</button>
              <button className={`seg__btn${!mineOnly ? ' seg__btn--on' : ''}`} onClick={() => setMineOnly(false)}>Everyone</button>
            </div>
            <select className="fld" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Company">
              <option value="">All companies</option>
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="fld" value={scope} onChange={(e) => setScope(e.target.value)} aria-label="Scope">
              <option value="">Any scope</option>
              <option value="run">Whole run</option>
              <option value="module">Module</option>
              <option value="orb">Single orb</option>
            </select>
            <input className="fld fld--search" placeholder="Search questions…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
            {anyFilter && <button className="btn btn--ghost" style={{ height: 28, fontSize: 12 }} onClick={() => { setSubject(''); setScope(''); setQ(''); setMineOnly(true) }}>Clear</button>}
          </div>

          <div className="activity__count">
            {loading && !data ? 'Loading…' : (
              <>
                Showing <b>{rows.length}</b>{data && data.total > rows.length ? ` of ${data.total}` : ''} {anyFilter ? 'matching ' : ''}conversation{rows.length === 1 ? '' : 's'}
                {data ? ` · ${data.allTime} saved in total` : ''}
                {historySince ? ` · since ${historySince}` : ''}
              </>
            )}
          </div>

          <div className="activity__body">
            {rows.length === 0 && !loading ? (
              <div className="activity__empty">
                {anyFilter
                  ? 'No saved conversations match these filters.'
                  : 'No saved conversations yet. Open Ask on a company and your questions and answers are saved here automatically.'}
              </div>
            ) : (
              <div className="chathist__list">
                {rows.map((c) => (
                  <div key={c.id} className="chathist__row">
                    <div className="chathist__main" role="button" tabIndex={0}
                      onClick={() => onResume(c.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onResume(c.id) } }}
                      title="Continue this conversation">
                      <div className="chathist__q">{c.preview || c.title || 'Conversation'}</div>
                      <div className="chathist__meta">
                        <span className="chathist__subject">{c.subject}</span>
                        <span className="chathist__chip">{scopeLabel(c)}</span>
                        <span>·</span>
                        <span title={fmtAbsolute(c.updatedAt)}>{fmtAgo(c.updatedAt)}</span>
                        <span>·</span>
                        <span>{c.messageCount} message{c.messageCount === 1 ? '' : 's'}</span>
                        <span>·</span>
                        <span className="chathist__who" title={c.userVia === 'cf-access' ? 'Cloudflare Access identity' : 'local / direct access'}>{c.user}</span>
                        {c.model && <><span>·</span><span>{c.model}</span></>}
                      </div>
                    </div>
                    <div className="chathist__actions">
                      <button className="btn btn--amber" style={{ height: 28 }} disabled={resuming === c.id} onClick={() => onResume(c.id)}>
                        {resuming === c.id ? 'Opening…' : 'Continue ▸'}
                      </button>
                      {confirmDel === c.id ? (
                        <span className="chathist__confirm">
                          <button className="btn btn--ghost" style={{ height: 28, fontSize: 12 }} onClick={() => onDelete(c.id)} title="Confirm delete">Delete</button>
                          <button className="btn btn--ghost" style={{ height: 28, fontSize: 12 }} onClick={() => setConfirmDel(null)}>Cancel</button>
                        </span>
                      ) : (
                        <button className="chathist__del" aria-label="Delete this conversation" title="Delete this conversation" onClick={() => setConfirmDel(c.id)}>✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  )
}
