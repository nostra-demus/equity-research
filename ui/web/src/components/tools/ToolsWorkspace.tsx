import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  api,
  REEL_TRANSCRIPT_PROGRESS_STEPS,
  type ReelTranscriptProgressEvent,
  type ReelTranscriptProgressStep,
  type ReelTranscriptRead,
} from '../../lib/api'
import { useStore } from '../../lib/store'
import './ToolsWorkspace.css'

function durationLabel(seconds: number | null): string | null {
  if (seconds === null || !Number.isFinite(seconds)) return null
  const rounded = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(rounded / 60)
  const rest = rounded % 60
  return minutes ? `${minutes}:${String(rest).padStart(2, '0')}` : `${rest}s`
}

type TimelineEvent = Omit<ReelTranscriptProgressEvent, 'status'> & {
  status: ReelTranscriptProgressEvent['status'] | 'cancelled'
}

const STEP_COPY: Record<ReelTranscriptProgressStep, { title: string; running: string }> = {
  'validate-link': { title: 'Check the Reel link', running: 'Checking the domain and Reel ID' },
  'prepare-runtime': { title: 'Prepare the media reader', running: 'Verifying the pinned media reader and opening a temporary workspace' },
  'inspect-reel': { title: 'Read Reel details', running: 'Reading the title, creator, and duration from Instagram' },
  'download-media': { title: 'Download temporary media', running: 'Receiving the Reel into temporary storage' },
  'check-media': { title: 'Check duration and size', running: 'Checking the downloaded media against the tool limits' },
  'transcribe-speech': { title: 'Recognize the speech', running: 'The configured speech-recognition provider is listening to the audio' },
  'prepare-output': { title: 'Prepare the transcript', running: 'Validating and formatting the returned text' },
  'clean-up': { title: 'Delete temporary media', running: 'Removing the downloaded Reel from temporary storage' },
}

function elapsedLabel(milliseconds: number): string {
  const seconds = Math.max(0, milliseconds) / 1_000
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${Math.round(seconds % 60)}s`
}

function bytesLabel(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function durationLimitLabel(seconds: number): string {
  return seconds % 60 === 0 ? `${seconds / 60} min` : durationLabel(seconds) || `${seconds}s`
}

function completedDetail(event: TimelineEvent): string | null {
  const detail = event.detail
  switch (event.step) {
    case 'validate-link': return 'Public Instagram Reel link accepted; tracking parameters removed'
    case 'prepare-runtime': return 'Verified media reader and private temporary workspace ready'
    case 'inspect-reel': {
      const values = [detail?.title, detail?.author ? `by ${detail.author}` : null, durationLabel(detail?.durationSeconds ?? null)].filter(Boolean)
      return values.length ? values.join(' · ') : 'Reel details received'
    }
    case 'download-media': return typeof detail?.bytes === 'number' ? `${bytesLabel(detail.bytes)} received into temporary storage` : 'Temporary media received'
    case 'check-media': {
      const values = [durationLabel(detail?.durationSeconds ?? null), typeof detail?.bytes === 'number' ? bytesLabel(detail.bytes) : null].filter(Boolean)
      const limits = [typeof detail?.maxSeconds === 'number' ? durationLimitLabel(detail.maxSeconds) : null, typeof detail?.maxBytes === 'number' ? bytesLabel(detail.maxBytes) : null].filter(Boolean)
      return `${values.length ? `${values.join(' · ')} · ` : ''}${limits.length ? `inside the ${limits.join(' / ')} limits` : 'safety checks passed'}`
    }
    case 'transcribe-speech': return 'Speech-recognition response received'
    case 'prepare-output': {
      const values = [typeof detail?.transcriptCharacters === 'number' ? `${detail.transcriptCharacters.toLocaleString()} characters` : null, detail?.language?.toUpperCase()].filter(Boolean)
      return values.length ? values.join(' · ') : 'Transcript text validated'
    }
    case 'clean-up': return detail?.mediaRemoved === false ? 'Cleanup could not finish; the engine will retry automatically' : 'Temporary media deleted'
  }
}

function ProgressTimeline({
  progress,
  elapsedMs,
  running,
}: {
  progress: Partial<Record<ReelTranscriptProgressStep, TimelineEvent>>
  elapsedMs: number
  running: boolean
}) {
  const completed = REEL_TRANSCRIPT_PROGRESS_STEPS.filter((step) => ['complete', 'warning'].includes(progress[step]?.status || '')).length
  const active = REEL_TRANSCRIPT_PROGRESS_STEPS.find((step) => progress[step]?.status === 'running')
  return (
    <section className="reeltool__timeline" aria-label="Live transcription steps">
      <div className="reeltool__timelinehead">
        <div>
          <span className={`reeltool__live${running ? ' reeltool__live--on' : ''}`} aria-hidden />
          <strong>{running ? 'Live execution' : completed === REEL_TRANSCRIPT_PROGRESS_STEPS.length ? 'Execution complete' : 'Execution log'}</strong>
          <span>{completed} of {REEL_TRANSCRIPT_PROGRESS_STEPS.length} steps complete</span>
        </div>
        <time>{elapsedLabel(elapsedMs)}</time>
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {active ? `${STEP_COPY[active].title}: ${STEP_COPY[active].running}` : ''}
      </div>
      <ol className="reeltool__steps">
        {REEL_TRANSCRIPT_PROGRESS_STEPS.map((step, index) => {
          const event = progress[step]
          const status = event?.status || 'pending'
          const detail = event?.status === 'running'
            ? STEP_COPY[step].running
            : event?.status === 'complete' || event?.status === 'warning'
              ? completedDetail(event)
              : event?.status === 'failed'
                ? 'This step did not finish'
                : event?.status === 'cancelled'
                  ? 'Stopped by you'
                  : null
          const stepMs = event?.status === 'running'
            ? Math.max(0, elapsedMs - event.elapsedMs)
            : event?.stepElapsedMs
          return (
            <li key={step} className={`reeltool__step reeltool__step--${status}`}>
              <span className="reeltool__stepmark" aria-hidden>
                {status === 'complete' ? '✓' : status === 'warning' || status === 'failed' ? '!' : status === 'cancelled' ? '■' : status === 'running' ? <span /> : index + 1}
              </span>
              <span className="reeltool__stepcopy">
                <strong>{STEP_COPY[step].title}</strong>
                {detail && <small>{detail}</small>}
              </span>
              {typeof stepMs === 'number' && <time>{elapsedLabel(stepMs)}</time>}
            </li>
          )
        })}
      </ol>
    </section>
  )
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
  const copyTimeoutRef = useRef<number | null>(null)
  const runStartedAtRef = useRef<number | null>(null)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ReelTranscriptRead | null>(null)
  const [copied, setCopied] = useState(false)
  const [progress, setProgress] = useState<Partial<Record<ReelTranscriptProgressStep, TimelineEvent>>>({})
  const [elapsedMs, setElapsedMs] = useState(0)

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
      if (copyTimeoutRef.current !== null) window.clearTimeout(copyTimeoutRef.current)
      window.removeEventListener('keydown', onKey, true)
      requestAnimationFrame(() => openerRef.current?.focus())
    }
  }, [closeWorkspace, staticMode])

  useEffect(() => {
    if (result) requestAnimationFrame(() => resultHeadingRef.current?.focus())
  }, [result])

  useEffect(() => {
    if (!loading || runStartedAtRef.current === null) return
    const tick = () => setElapsedMs(Math.max(0, Date.now() - runStartedAtRef.current!))
    tick()
    const timer = window.setInterval(tick, 200)
    return () => window.clearInterval(timer)
  }, [loading])

  const transcribe = async (event: FormEvent) => {
    event.preventDefault()
    if (!url.trim() || loading || staticMode) return
    setLoading(true)
    setError(null)
    setResult(null)
    setCopied(false)
    setProgress({})
    setElapsedMs(0)
    runStartedAtRef.current = Date.now()
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    requestAnimationFrame(() => panelRef.current?.focus())
    try {
      const transcript = await api.reelTranscriptLive(url.trim(), (next) => {
        if (controller.signal.aborted) return
        setProgress((current) => ({ ...current, [next.step]: next }))
        setElapsedMs((current) => Math.max(current, next.elapsedMs))
      }, controller.signal)
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
        if (runStartedAtRef.current !== null) setElapsedMs(Math.max(0, Date.now() - runStartedAtRef.current))
        requestRef.current = null
        setLoading(false)
      }
    }
  }

  const stopTranscription = () => {
    const controller = requestRef.current
    if (!controller || controller.signal.aborted) return
    controller.abort()
    setProgress((current) => {
      const runningStep = REEL_TRANSCRIPT_PROGRESS_STEPS.find((step) => current[step]?.status === 'running')
      if (!runningStep || !current[runningStep]) return current
      return { ...current, [runningStep]: { ...current[runningStep]!, status: 'cancelled' } }
    })
    setError('Stopped. The engine is cancelling this run and cleaning up any temporary media.')
  }

  const copyTranscript = async () => {
    if (!result?.transcript) return
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(result.transcript)
      setCopied(true)
      if (copyTimeoutRef.current !== null) window.clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = window.setTimeout(() => {
        copyTimeoutRef.current = null
        setCopied(false)
      }, 1800)
    } catch {
      setError('Could not copy automatically. Select the transcript and copy it manually.')
    }
  }

  const reset = () => {
    requestRef.current?.abort()
    requestRef.current = null
    if (copyTimeoutRef.current !== null) window.clearTimeout(copyTimeoutRef.current)
    copyTimeoutRef.current = null
    setUrl('')
    setResult(null)
    setError(null)
    setCopied(false)
    setProgress({})
    setElapsedMs(0)
    runStartedAtRef.current = null
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
                  {loading ? (
                    <button className="btn btn--danger reeltool__submit" type="button" onClick={stopTranscription}>■ Stop</button>
                  ) : (
                    <button className="btn btn--amber reeltool__submit" type="submit" disabled={!url.trim() || staticMode}>Transcribe reel ▸</button>
                  )}
                </div>
                <div id="reel-tool-note" className="reeltool__note">
                  {staticMode
                    ? 'Open the live cockpit on the engine machine to use this tool.'
                    : 'Public Reels only. Media is sent to the configured transcription provider, kept here only while processing, then removed.'}
                </div>
                {(loading || Object.keys(progress).length > 0) && <ProgressTimeline progress={progress} elapsedMs={elapsedMs} running={loading} />}
                {error && <div className="reeltool__error" role="alert">{error}</div>}
              </form>
            {result && (
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
              </div>
            )}
          </section>
        </main>
      </div>
    </motion.div>
  )
}
