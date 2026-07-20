// Cockpit-wide product feedback: a right-side slide-in where anyone (behind Cloudflare Access) files a
// bug / UI note / idea with screenshots, and the whole team sees the folded list with status. Same panel
// slide + class family as ReviewPanel (transform-only, 300ms, ease-out-expo). The list is panel-local
// (ActivityLog pattern: guarded reqGen+mounted poll) so there are no fresh-array store selectors. The
// gated one-click "send to coding engine" dispatch is added in a follow-up.

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { api } from '../lib/api'
import type { CockpitFeedbackCategory, CockpitFeedbackStatus, CockpitFeedbackView } from '../lib/types'

const CATEGORIES: { id: CockpitFeedbackCategory; label: string }[] = [
  { id: 'bug', label: 'Bug' },
  { id: 'ui', label: 'UI' },
  { id: 'idea', label: 'Idea' },
  { id: 'research_quality', label: 'Research quality' },
  { id: 'other', label: 'Other' },
]
const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]))

// status → { label, tone } for the chip. tone maps to a CSS accent.
const STATUS: Record<CockpitFeedbackStatus, { label: string; tone: string }> = {
  new: { label: 'New', tone: 'new' },
  triaged: { label: 'Triaged', tone: 'triaged' },
  dispatched: { label: 'Building…', tone: 'live' },
  pr_open: { label: 'PR open', tone: 'good' },
  assessed: { label: 'Assessed', tone: 'triaged' },
  done: { label: 'Done', tone: 'good' },
  wontfix: { label: "Won't fix", tone: 'muted' },
}

const MAX_IMAGES = 6

function ago(iso: string): string {
  const t = Date.parse(iso)
  if (!t) return ''
  const s = Math.max(0, Math.round((Date.now() - t) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

export function FeedbackPanel() {
  const close = useStore((s) => s.closeCockpitFeedback)
  const setToast = useStore((s) => s.setToast)

  const [tab, setTab] = useState<'compose' | 'list'>('compose')
  const [category, setCategory] = useState<CockpitFeedbackCategory>('bug')
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [thumbs, setThumbs] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [items, setItems] = useState<CockpitFeedbackView[] | null>(null)
  const [listError, setListError] = useState(false)
  const [canDispatch, setCanDispatch] = useState(false)
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [notifying, setNotifying] = useState<Record<string, boolean>>({})
  const fileInput = useRef<HTMLInputElement>(null)
  const dragging = useRef(false)
  const [isDrag, setIsDrag] = useState(false)

  // object URLs for the live thumbnails; revoked on change/unmount to avoid leaks
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setThumbs(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  const addFiles = useCallback((incoming: File[]) => {
    const imgs = incoming.filter((f) => f.type.startsWith('image/'))
    if (!imgs.length) return
    setFiles((cur) => [...cur, ...imgs].slice(0, MAX_IMAGES))
  }, [])

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  // is this viewer allowed to trigger the paid "send to coding engine" dispatch? (server: admin allowlist
  // AND dispatch enabled + PR token). The button is hidden otherwise. emailEnabled gates the reporter-
  // notification UI on resolved cards (hidden entirely when the engine has no email token configured).
  useEffect(() => {
    let alive = true
    api.whoami().then((w) => { if (alive) { setCanDispatch(!!w.canDispatch); setEmailEnabled(!!w.emailEnabled) } }).catch(() => {})
    return () => { alive = false }
  }, [])

  // paste a screenshot anywhere in the panel (Cmd/Ctrl+V after a screen-grab is the fast path)
  const onPaste = useCallback((e: React.ClipboardEvent) => {
    const imgs: File[] = []
    for (const item of Array.from(e.clipboardData.items)) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const f = item.getAsFile()
        if (f) imgs.push(new File([f], f.name || `pasted-${Date.now()}.png`, { type: f.type }))
      }
    }
    if (imgs.length) { e.preventDefault(); addFiles(imgs) }
  }, [addFiles])

  // list: fetch on entering the list tab, then poll every 15s — guarded so a slow/stale response can't
  // overwrite newer data or setState after unmount (ActivityLog pattern).
  const reqGen = useRef(0)
  const loadList = useCallback(async () => {
    const gen = ++reqGen.current
    try {
      const rows = await api.listFeedback()
      if (gen === reqGen.current) { setItems(rows); setListError(false) }
    } catch {
      // keep any rows we already have (a failed poll shouldn't blank the list); surface an error only
      // when we have nothing to show, so a broken store never masquerades as "no feedback yet".
      if (gen === reqGen.current) setListError(true)
    }
  }, [])
  useEffect(() => {
    if (tab !== 'list') return
    let mounted = true
    void loadList()
    const t = setInterval(() => { if (mounted) void loadList() }, 15_000)
    return () => { mounted = false; clearInterval(t) }
  }, [tab, loadList])

  const canSubmit = (text.trim().length > 0 || files.length > 0) && !submitting

  async function submit() {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const res = await api.submitCockpitFeedback({ text: text.trim(), category, url: window.location.pathname + window.location.hash, images: files })
      setText(''); setFiles([]); setCategory('bug')
      const warn = res.imageErrors?.length ? ` (${res.imageErrors.length} image${res.imageErrors.length === 1 ? '' : 's'} skipped)` : ''
      setToast({ msg: `Thanks — feedback sent${warn}.`, tone: 'good' })
      setTab('list'); void loadList()
    } catch (e: any) {
      setToast({ msg: e?.message === 'static-deploy' ? 'Feedback needs the live engine.' : `Could not send feedback: ${e?.message || 'error'}`, tone: 'bad' })
    } finally {
      setSubmitting(false)
    }
  }

  async function setStatus(id: string, status: CockpitFeedbackStatus) {
    // optimistic: reflect the new status immediately, refetch to confirm
    setItems((cur) => (cur ? cur.map((it) => (it.feedback_id === id ? { ...it, status } : it)) : cur))
    try { await api.setFeedbackStatus(id, status); void loadList() } catch { void loadList() }
  }

  async function dispatch(id: string) {
    setItems((cur) => (cur ? cur.map((it) => (it.feedback_id === id ? { ...it, status: 'dispatched' } : it)) : cur))
    try {
      const res = await api.dispatchFeedback(id)
      setToast({ msg: res.message || 'Sent to the coding engine.', tone: res.ok ? 'good' : 'bad' })
      void loadList()
    } catch (e: any) {
      setToast({ msg: `Could not dispatch: ${e?.message || 'error'}`, tone: 'bad' })
      void loadList()
    }
  }

  // Send (or retry) the resolution email to a resolved item's reporter. The auto-send already fires when a
  // card is marked done; this is the manual recovery path shown when that send failed or hasn't happened.
  async function notify(id: string) {
    setNotifying((m) => ({ ...m, [id]: true }))
    try {
      const res = await api.notifyFeedback(id)
      setToast({ msg: res.ok ? "Reporter emailed — they know it's resolved." : `Couldn't email the reporter: ${res.detail || res.reason || 'error'}`, tone: res.ok ? 'good' : 'bad' })
      void loadList()
    } catch (e: any) {
      setToast({ msg: e?.message === 'static-deploy' ? 'Email needs the live engine.' : `Couldn't email the reporter: ${e?.message || 'error'}`, tone: 'bad' })
    } finally {
      setNotifying((m) => ({ ...m, [id]: false }))
    }
  }

  return (
    <motion.div
      className="feedback"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onPaste={onPaste}
    >
      <div className="feedback__head">
        <div style={{ minWidth: 0 }}>
          <div className="feedback__title">Feedback</div>
          <div className="feedback__sub">Report a bug, share an idea, or drop a screenshot. The team sees everything here.</div>
        </div>
        <div className="feedback__headbtns">
          <div className="feedback__tabs" role="tablist">
            <button role="tab" aria-selected={tab === 'compose'} className={`feedback__tab${tab === 'compose' ? ' feedback__tab--on' : ''}`} onClick={() => setTab('compose')}>Give feedback</button>
            <button role="tab" aria-selected={tab === 'list'} className={`feedback__tab${tab === 'list' ? ' feedback__tab--on' : ''}`} onClick={() => setTab('list')}>All feedback</button>
          </div>
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
        </div>
      </div>

      {tab === 'compose' ? (
        <div className="feedback__body">
          <div className="feedback__seg" role="radiogroup" aria-label="Category">
            {CATEGORIES.map((c) => (
              <button key={c.id} role="radio" aria-checked={category === c.id} className={`feedback__segbtn${category === c.id ? ' feedback__segbtn--on' : ''}`} onClick={() => setCategory(c.id)}>{c.label}</button>
            ))}
          </div>

          <textarea
            className="feedback__text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What happened, or what would make this better? Be as specific as you can — the more concrete, the more actionable."
            rows={6}
            autoFocus
          />

          <div
            className={`feedback__drop${isDrag ? ' is-drag' : ''}`}
            onDragOver={(e) => { e.preventDefault(); if (!dragging.current) { dragging.current = true; setIsDrag(true) } }}
            onDragLeave={() => { dragging.current = false; setIsDrag(false) }}
            onDrop={(e) => { e.preventDefault(); dragging.current = false; setIsDrag(false); addFiles(Array.from(e.dataTransfer.files)) }}
            onClick={() => fileInput.current?.click()}
          >
            <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden onChange={(e) => { addFiles(Array.from(e.target.files || [])); e.target.value = '' }} />
            {files.length === 0
              ? <span className="feedback__drophint">Drop, paste, or click to add screenshots · up to {MAX_IMAGES}</span>
              : <span className="feedback__drophint">{files.length} of {MAX_IMAGES} · click to add more</span>}
          </div>

          {thumbs.length > 0 && (
            <div className="feedback__thumbs">
              {thumbs.map((src, i) => (
                <div className="feedback__thumb" key={src}>
                  <img src={src} alt={`screenshot ${i + 1}`} />
                  <button className="feedback__thumbx" title="Remove" onClick={() => setFiles((cur) => cur.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="feedback__composeactions">
            <button className="btn btn--amber feedback__send" disabled={!canSubmit} onClick={submit}>
              {submitting ? 'Sending…' : 'Send feedback'}
            </button>
          </div>
        </div>
      ) : (
        <div className="feedback__body">
          {items === null && !listError ? (
            <div className="feedback__empty">Loading feedback…</div>
          ) : listError && (!items || items.length === 0) ? (
            <div className="feedback__empty">
              Couldn't load feedback right now.
              <div style={{ marginTop: 12 }}><button className="btn btn--ghost feedback__cardbtn" onClick={() => void loadList()}>Retry</button></div>
            </div>
          ) : !items || items.length === 0 ? (
            <div className="feedback__empty">No feedback yet — you'll be the first. Anything you send shows up here for the whole team.</div>
          ) : (
            <div className="feedback__list">
              {items.map((it) => {
                const st = STATUS[it.status] ?? STATUS.new
                return (
                  <div className="feedback__card" key={it.feedback_id}>
                    <div className="feedback__cardtop">
                      <span className="feedback__cat">{CATEGORY_LABEL[it.category] || it.category}</span>
                      <span className="feedback__status" data-tone={st.tone}>{st.label}</span>
                      <span className="feedback__meta">{it.user_id === 'local' ? 'you' : it.user_id.split('@')[0]} · {ago(it.submitted_at)}</span>
                    </div>
                    {it.text && <div className="feedback__cardtext">{it.text}</div>}
                    {it.images.length > 0 && (
                      <div className="feedback__cardthumbs">
                        {it.images.map((name) => (
                          <a className="feedback__cardthumb" href={api.feedbackImageUrl(it.feedback_id, name)} target="_blank" rel="noreferrer" key={name}>
                            <img src={api.feedbackImageUrl(it.feedback_id, name)} alt="screenshot" loading="lazy" />
                          </a>
                        ))}
                      </div>
                    )}
                    {it.pr_url && <a className="feedback__pr" href={it.pr_url} target="_blank" rel="noreferrer">View pull request ↗</a>}
                    {it.note && <div className="feedback__note">{it.note}</div>}
                    {/* resolved-card reporter notification: confirm the email went out, or offer a send/retry.
                        Only when email is configured on the engine (emailEnabled) so cards look unchanged otherwise. */}
                    {emailEnabled && it.status === 'done' && (() => {
                      const hasEmail = !!it.user_id && it.user_id !== 'local' && it.user_id.includes('@')
                      if (it.notified?.ok) {
                        const who = it.notified.recipient ? it.notified.recipient.split('@')[0] : ''
                        return <div className="feedback__notified" data-ok="1">✉ Reporter notified{who ? ` · ${who}` : ''}</div>
                      }
                      if (!hasEmail) return <div className="feedback__notified" data-ok="0">No reporter email on file — can't notify.</div>
                      const failed = !!it.notified && !it.notified.ok
                      return (
                        <div className="feedback__notifyrow">
                          {failed && <span className="feedback__notified" data-ok="0">✉ Couldn't email the reporter.</span>}
                          <button className="btn btn--ghost feedback__cardbtn" disabled={!!notifying[it.feedback_id]} onClick={() => notify(it.feedback_id)}>
                            {notifying[it.feedback_id] ? 'Sending…' : failed ? 'Retry email' : 'Notify reporter'}
                          </button>
                        </div>
                      )
                    })()}
                    {(it.status === 'new' || it.status === 'triaged' || it.status === 'assessed') && (
                      <div className="feedback__cardactions">
                        {canDispatch && (it.category === 'bug' || it.category === 'ui' || it.category === 'idea') && (
                          <button className="btn btn--amber feedback__cardbtn" title="Send to the coding engine — it works on a fresh branch and opens a draft PR" onClick={() => dispatch(it.feedback_id)}>Send to coding engine ▸</button>
                        )}
                        <button className="btn btn--ghost feedback__cardbtn" onClick={() => setStatus(it.feedback_id, 'done')}>Mark done</button>
                        <button className="btn btn--ghost feedback__cardbtn" onClick={() => setStatus(it.feedback_id, 'wontfix')}>Won't fix</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
