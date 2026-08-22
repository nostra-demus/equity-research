import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { api, type ReelTranscriptRead } from '../../lib/api'
import { useStore } from '../../lib/store'
import './ToolsWorkspace.css'

function durationLabel(seconds: number | null): string | null {
  if (seconds === null || !Number.isFinite(seconds)) return null
  const rounded = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(rounded / 60)
  const rest = rounded % 60
  return minutes ? `${minutes}:${String(rest).padStart(2, '0')}` : `${rest}s`
}

export function ToolsWorkspace() {
  const close = useStore((state) => state.closeTools)
  const staticMode = useStore((state) => state.staticMode)
  const reducedMotion = useReducedMotion()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const requestRef = useRef<AbortController | null>(null)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ReelTranscriptRead | null>(null)
  const [copied, setCopied] = useState(false)

  const closeWorkspace = useCallback(() => {
    requestRef.current?.abort()
    requestRef.current = null
    close()
  }, [close])

  useEffect(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement && !panelRef.current?.contains(active)) openerRef.current = active
    requestAnimationFrame(() => (staticMode ? closeRef.current : inputRef.current)?.focus())
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopImmediatePropagation()
        closeWorkspace()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      ) || []).filter((element) => element.offsetParent !== null)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeElement = document.activeElement
      if (!(activeElement instanceof HTMLElement) || !panelRef.current?.contains(activeElement) || !focusable.includes(activeElement)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
        return
      }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      requestRef.current?.abort()
      requestRef.current = null
      window.removeEventListener('keydown', onKey, true)
      requestAnimationFrame(() => openerRef.current?.focus())
    }
  }, [closeWorkspace, staticMode])

  useEffect(() => {
    if (result) requestAnimationFrame(() => resultHeadingRef.current?.focus())
  }, [result])

  const transcribe = async (event: FormEvent) => {
    event.preventDefault()
    if (!url.trim() || loading || staticMode) return
    setLoading(true)
    setError(null)
    setResult(null)
    setCopied(false)
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    requestAnimationFrame(() => panelRef.current?.focus())
    try {
      const transcript = await api.reelTranscript(url.trim(), controller.signal)
      if (!controller.signal.aborted) setResult(transcript)
    } catch (cause: any) {
      if (controller.signal.aborted || cause?.name === 'AbortError') return
      const message = cause?.static
        ? 'This tool runs in the live cockpit on the engine machine.'
        : cause?.name === 'TimeoutError'
          ? 'The Reel took too long to transcribe. Try again.'
          : cause instanceof TypeError
            ? 'Could not reach the engine. Check the connection and try again.'
            : cause?.message || 'The Reel could not be transcribed. Try again.'
      setError(message)
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null
        setLoading(false)
      }
    }
  }

  const copyTranscript = async () => {
    if (!result?.transcript) return
    try {
      await navigator.clipboard.writeText(result.transcript)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Could not copy automatically. Select the transcript and copy it manually.')
    }
  }

  const reset = () => {
    requestRef.current?.abort()
    requestRef.current = null
    setUrl('')
    setResult(null)
    setError(null)
    setCopied(false)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const meta = result
    ? [result.author, durationLabel(result.durationSeconds), result.language?.toUpperCase()].filter(Boolean)
    : []
  const titleId = 'tools-workspace-title'

  return (
    <motion.div
      ref={panelRef}
      className="pipeline toolswork"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: '100%' }}
      transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pipeline__head toolswork__head">
        <div className="pipeline__titlewrap">
          <div className="pipeline__title" id={titleId}>Tools</div>
          <div className="pipeline__sub">Small, focused apps for everyday work.</div>
        </div>
        <div className="pipeline__tools">
          <button ref={closeRef} className="btn btn--ghost" onClick={closeWorkspace} title="Close tools" aria-label="Close tools">✕</button>
        </div>
      </div>

      <div className="toolswork__layout">
        <aside className="toolswork__rail" aria-label="Available tools">
          <div className="toolswork__railhead">
            <span>Your tools</span>
            <span>1</span>
          </div>
          <button className="toolswork__tool toolswork__tool--on" aria-current="page">
            <span className="toolswork__toolmark" aria-hidden="true">T</span>
            <span>
              <strong>Reel to Transcript</strong>
              <small>Instagram Reel → text</small>
            </span>
          </button>
        </aside>

        <main className="toolswork__body">
          <section className="reeltool">
            <div className="reeltool__intro">
              <span className="reeltool__eyebrow">Media utility</span>
              <h1>Reel to Transcript</h1>
              <p>Paste an Instagram Reel link. Get every spoken word as clean text.</p>
            </div>

            {!result ? (
              <form className="reeltool__form" onSubmit={transcribe}>
                <label htmlFor="reel-url">Instagram Reel link</label>
                <div className="reeltool__inputrow">
                  <input
                    ref={inputRef}
                    id="reel-url"
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    required
                    disabled={loading || staticMode}
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://www.instagram.com/reel/…"
                    aria-describedby="reel-tool-note"
                  />
                  <button className="btn btn--amber reeltool__submit" type="submit" disabled={!url.trim() || loading || staticMode}>
                    {loading ? <><span className="reeltool__spinner" aria-hidden /> Transcribing…</> : 'Transcribe reel ▸'}
                  </button>
                </div>
                <div id="reel-tool-note" className="reeltool__note">
                  {staticMode
                    ? 'Open the live cockpit on the engine machine to use this tool.'
                    : 'Public Reels only. Media is sent to the configured transcription provider, kept here only while processing, then removed.'}
                </div>
                {loading && <div className="reeltool__progress" role="status"><span />Fetching the Reel and listening for speech…</div>}
                {error && <div className="reeltool__error" role="alert">{error}</div>}
              </form>
            ) : (
              <div className="reeltool__result">
                <div className="sr-only" role="status" aria-live="polite">Transcript ready.</div>
                <div className="reeltool__resulthead">
                  <div>
                    <span className="reeltool__eyebrow">Transcript</span>
                    <h2 ref={resultHeadingRef} tabIndex={-1}>{result.title || 'Instagram Reel'}</h2>
                    {meta.length > 0 && <div className="reeltool__meta">{meta.join(' · ')}</div>}
                  </div>
                  <div className="reeltool__actions">
                    <button className="btn btn--ghost" onClick={reset}>New Reel</button>
                    <button className="btn" onClick={() => void copyTranscript()}>{copied ? 'Copied ✓' : 'Copy transcript'}</button>
                  </div>
                </div>
                <textarea className="reeltool__transcript" readOnly value={result.transcript} aria-label="Full Reel transcript" />
                {error && <div className="reeltool__error" role="alert">{error}</div>}
              </div>
            )}
          </section>
        </main>
      </div>
    </motion.div>
  )
}
