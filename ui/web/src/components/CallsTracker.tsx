import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../lib/store'
import { api } from '../lib/api'
import { decisionColor } from '../lib/format'
import type { CallSummary, CallsResult, CallUpdate } from '../lib/types'
import {
  automationPromise,
  callDateLabel,
  groupCallsByTicker,
  integrityLabel,
  momentLabel,
  plainStatus,
  splitCallUpdates,
  updateArtifactLabel,
  updateArtifactTitle,
  updateToneLabel,
} from './CallsTracker.logic'
import './CallsTracker.css'

const focusableSelector = [
  'button:not([disabled])',
  'a[href]',
  'summary',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function amount(currency?: string | null, value?: number | null): string {
  if (typeof value !== 'number') return 'Not stated'
  const number = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)
  return `${currency?.trim() || ''} ${number}`.trim()
}

function percent(value?: number | null): string {
  if (typeof value !== 'number') return 'Not stated'
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

function integrityState(status: CallSummary['integrity_status']): 'verified' | 'needs-verification' | 'unchecked' {
  if (status === 'verified') return 'verified'
  if (status === 'provisional') return 'needs-verification'
  return 'unchecked'
}

function automationLabel(automation?: CallsResult['automation']): string {
  if (!automation) return 'Automatic checks are getting ready'
  if (!automation.enabled) return 'Automatic checks are off'
  if (automation.state === 'checking') return 'Checking now'
  if (automation.state === 'needs_attention') return 'Automatic checks need attention'
  return 'Watching for changes'
}

function AutomationStatus({ automation }: { automation?: CallsResult['automation'] }) {
  const last = !automation
    ? 'Not available yet'
    : automation.last_checked_at ? momentLabel(automation.last_checked_at) : 'Not yet checked'
  const next = !automation
    ? 'Not available yet'
    : automation.next_check_at ? momentLabel(automation.next_check_at) : 'Not scheduled'
  const state = !automation || !automation.enabled ? 'quiet' : automation.state

  return (
    <div className="callsauto" role="status" aria-live="polite" aria-atomic="true" data-state={state}>
      <div className="callsauto__summary">
        <span className="callsauto__dot" aria-hidden="true" />
        <strong>{automationLabel(automation)}</strong>
      </div>
      {automation?.message && <p className="callsauto__message">{automation.message}</p>}
      <dl className="callsauto__times">
        <div>
          <dt>Last automatic check</dt>
          <dd>{automation?.last_checked_at ? <time dateTime={automation.last_checked_at}>{last}</time> : last}</dd>
        </div>
        <div>
          <dt>Next automatic check</dt>
          <dd>{automation?.next_check_at ? <time dateTime={automation.next_check_at}>{next}</time> : next}</dd>
        </div>
      </dl>
    </div>
  )
}

function UpdatesFeed({ updates, onOpen }: {
  updates: readonly CallUpdate[]
  onOpen: (path: string, title: string) => void
}) {
  const { ordered, recent, earlier } = useMemo(() => splitCallUpdates(updates), [updates])

  const rows = (items: readonly CallUpdate[], start: number, live = false) => (
    <div
      className="callupdates__feed"
      role="feed"
      aria-live={live ? 'polite' : undefined}
      aria-relevant={live ? 'additions text' : undefined}
    >
      {items.map((update, index) => (
        <article
          className="callupdate"
          data-tone={update.tone}
          key={`${update.id}-${start + index}`}
          aria-label={`${update.company || update.ticker}: ${update.headline}`}
          aria-posinset={start + index + 1}
          aria-setsize={ordered.length}
        >
          <span className="callupdate__mark" aria-hidden="true" />
          <div className="callupdate__body">
            <div className="callupdate__meta">
              <strong>{update.company || update.ticker}</strong>
              {update.company && <span>{update.ticker}</span>}
              <span>{update.kind === 'review' ? 'Review' : update.kind === 'data_check' ? 'Data check' : 'Call'}</span>
              <span className="callupdate__tone">{updateToneLabel(update.tone)}</span>
              <span>{update.at ? <time dateTime={update.at}>{momentLabel(update.at)}</time> : 'Time not available'}</span>
            </div>
            <p className="callupdate__headline">{update.headline}</p>
            {update.detail && <p className="callupdate__detail">{update.detail}</p>}
            {update.source_path && (
              <button
                type="button"
                className="btn btn--ghost callupdate__open"
                onClick={() => onOpen(update.source_path!, updateArtifactTitle(update))}
              >
                {updateArtifactLabel(update.kind)}
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  )

  return (
    <section className="callupdates" aria-labelledby="call-updates-title">
      <div className="calls__sectionhead">
        <h3 id="call-updates-title">Recent updates</h3>
        <span>{earlier.length ? `${recent.length} recent · ${earlier.length} earlier` : ordered.length}</span>
      </div>
      {ordered.length === 0 ? (
        <p className="callupdates__empty">No recent changes. New call and review updates will appear here automatically.</p>
      ) : (
        <>
          {rows(recent, 0, true)}
          {earlier.length > 0 && (
            <details className="callupdates__earlier">
              <summary>
                <span>Earlier updates</span>
                <span>{earlier.length}</span>
              </summary>
              {rows(earlier, recent.length)}
            </details>
          )}
        </>
      )}
    </section>
  )
}

function CallFacts({ call, compact = false }: { call: CallSummary; compact?: boolean }) {
  return (
    <dl className={`callfacts${compact ? ' callfacts--compact' : ''}`}>
      <div><dt>Entry price</dt><dd>{amount(call.currency, call.entry_price)}</dd></div>
      <div><dt>Target</dt><dd>{amount(call.currency, call.implied_target)}</dd></div>
      <div><dt>Expected return</dt><dd data-tone={typeof call.expected_return_pct === 'number' && call.expected_return_pct < 0 ? 'negative' : undefined}>{percent(call.expected_return_pct)}</dd></div>
      {typeof call.confidence === 'number' && (
        <div>
          <dt>{call.confidence_is_post_review ? 'Confidence after review' : 'Confidence'}</dt>
          <dd>{call.confidence}/100</dd>
        </div>
      )}
      <div className="callfacts__wide"><dt>Time horizon</dt><dd>{call.time_horizon || 'Not stated'}</dd></div>
    </dl>
  )
}

function CallStatus({ call }: { call: CallSummary }) {
  const latest = call.latest_thesis_status
    ? plainStatus(call.latest_thesis_status)
    : call.next_checkpoint?.due_date
      ? `${call.next_checkpoint.status === 'overdue' || call.next_checkpoint.status === 'due' ? 'Check due' : 'First check'} ${callDateLabel(call.next_checkpoint.due_date)}`
      : 'Waiting for first check'
  return (
    <div className="callstatus">
      <span data-state={integrityState(call.integrity_status)}>
        Report check: <strong>{integrityLabel(call.integrity_status)}</strong>
      </span>
      <span>Latest result: <strong>{latest}</strong></span>
      {call.decision_is_post_mortem_capped && <span data-state="capped">Rating capped after final review</span>}
    </div>
  )
}

function LatestReview({ call, compact = false }: { call: CallSummary; compact?: boolean }) {
  const timelineReview = [...call.timeline].reverse().find((entry) => entry.status === 'done')
  const date = call.latest_review_date || timelineReview?.review_date || null
  const verdict = call.latest_review_verdict || timelineReview?.thesis_delta_verdict || timelineReview?.thesis_status || null
  const summary = call.latest_review_summary || timelineReview?.memo_delta_summary || null
  if (!date && !verdict && !summary) return null

  return (
    <div className={`callreview${compact ? ' callreview--compact' : ''}`}>
      <div className="callreview__head">
        <span>Latest review</span>
        {date && <time dateTime={date}>{callDateLabel(date)}</time>}
      </div>
      {verdict && <strong>{plainStatus(verdict)}</strong>}
      {summary && <p>{summary}</p>}
    </div>
  )
}

function PriorCall({ call, index, onOpen }: {
  call: CallSummary
  index: number
  onOpen: (path: string, title: string) => void
}) {
  return (
    <li className="callhistory__row">
      <div className="callhistory__head">
        <div>
          <span className="callhistory__ordinal">Prior call {index + 1}</span>
          <strong style={{ color: decisionColor(call.decision) }}>{call.decision || 'No rating'}</strong>
        </div>
        <time dateTime={call.decision_date || undefined}>{callDateLabel(call.decision_date)}</time>
      </div>
      <CallStatus call={call} />
      <CallFacts call={call} compact />
      <LatestReview call={call} compact />
      {call.final_thesis_path && (
        <div className="callhistory__action">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => onOpen(call.final_thesis_path, `Investment Thesis — ${call.ticker} — ${callDateLabel(call.decision_date)}`)}
          >
            Open prior thesis
          </button>
        </div>
      )}
    </li>
  )
}

function TickerCard({ group, onOpen }: {
  group: ReturnType<typeof groupCallsByTicker>[number]
  onOpen: (path: string, title: string) => void
}) {
  const call = group.latest
  const company = call.company?.trim() || call.ticker
  return (
    <article className="callcard" aria-label={`Calls for ${company}`}>
      <header className="callcard__head">
        <div className="callcard__company">
          <span className="callcard__eyebrow">Latest call · <time dateTime={call.decision_date || undefined}>{callDateLabel(call.decision_date)}</time></span>
          <h3>{company}</h3>
          {company !== call.ticker && <span className="callcard__ticker">{call.ticker}</span>}
        </div>
        <strong className="callcard__decision" style={{ color: decisionColor(call.decision) }}>{call.decision || 'No rating'}</strong>
      </header>

      <CallStatus call={call} />
      <CallFacts call={call} />
      <LatestReview call={call} />

      <div className="callcard__action">
        <button
          type="button"
          className="btn"
          disabled={!call.final_thesis_path}
          onClick={() => onOpen(call.final_thesis_path, `Investment Thesis — ${call.ticker}`)}
        >
          Open thesis
        </button>
      </div>

      {group.history.length > 0 && (
        <details className="callhistory">
          <summary>
            <span>Prior calls</span>
            <span>{group.history.length} saved</span>
          </summary>
          <ol>
            {group.history.map((prior, index) => (
              <PriorCall
                key={`${prior.run_root}-${prior.decision_date || 'undated'}-${index}`}
                call={prior}
                index={index}
                onOpen={onOpen}
              />
            ))}
          </ol>
        </details>
      )}
    </article>
  )
}

function LoadingCalls() {
  return (
    <div className="callsloading" role="status" aria-label="Loading calls">
      <div className="callsloading__line" />
      <div className="callsloading__card" />
      <div className="callsloading__card" />
    </div>
  )
}

export function CallsTracker() {
  const close = useStore((state) => state.closeCalls)
  const openCallFile = useStore((state) => state.openCallFile)
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<Element | null>(null)
  const requestGeneration = useRef(0)
  const mounted = useRef(true)
  const hasData = useRef(false)
  const [data, setData] = useState<CallsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const load = useCallback(async () => {
    const generation = ++requestGeneration.current
    try {
      const result = await api.calls()
      if (!mounted.current || generation !== requestGeneration.current) return
      hasData.current = true
      setData(result)
      setError(null)
    } catch {
      if (!mounted.current || generation !== requestGeneration.current) return
      setError(hasData.current
        ? 'The latest automatic check could not finish. We will try again.'
        : 'We could not load your calls. Automatic checks will keep trying.')
    } finally {
      if (mounted.current && generation === requestGeneration.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => { void load() }, 15_000)
    return () => window.clearInterval(timer)
  }, [load])

  useEffect(() => {
    returnFocus.current = document.activeElement
    closeRef.current?.focus()
    return () => { (returnFocus.current as HTMLElement | null)?.focus?.() }
  }, [])

  const retry = useCallback(() => {
    setError(null)
    if (!hasData.current) setLoading(true)
    void load()
  }, [load])

  const groups = useMemo(() => groupCallsByTicker(data?.calls ?? []), [data?.calls])
  const callsCount = data?.calls.length ?? 0
  const updatesAvailable = data?.updates !== undefined
  const openThesis = useCallback((path: string, title: string) => {
    close()
    openCallFile(path, title)
  }, [close, openCallFile])

  const onDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key !== 'Tab') return
    const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>(focusableSelector)]
      .filter((element) => element.getAttribute('aria-hidden') !== 'true')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) {
      event.preventDefault()
      return
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="callslayer" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
      <div
        className="calls"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calls-title"
        aria-describedby="calls-promise"
        aria-busy={loading}
        onKeyDown={onDialogKeyDown}
      >
        <header className="calls__head">
          <div>
            <h2 id="calls-title" className="calls__title">Calls</h2>
            <p className="calls__sub">Updates automatically</p>
          </div>
          <button ref={closeRef} type="button" className="calls__close" onClick={close} aria-label="Close calls">
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="calls__body">
          <section className="callsintro" aria-label="Automatic call updates">
            <p id="calls-promise" className="callsintro__promise">{automationPromise(data?.automation)}</p>
            <p className="callsintro__explain">The engine checks each saved call and adds new information here.</p>
            <AutomationStatus automation={data?.automation} />
          </section>

          {error && data && <p className="calls__notice" role="status">{error}</p>}

          {loading && !data ? <LoadingCalls /> : error && !data ? (
            <div className="calls__empty" role="alert">
              <strong>Calls are temporarily unavailable.</strong>
              <p>{error}</p>
              <button type="button" className="btn" onClick={retry}>Try again</button>
            </div>
          ) : data ? (
            <>
              {updatesAvailable && <UpdatesFeed updates={data.updates ?? []} onOpen={openThesis} />}

              <section className="callgroups" aria-labelledby="tracked-calls-title">
                <div className="calls__sectionhead">
                  <h3 id="tracked-calls-title">Tracked calls</h3>
                  <span>{groups.length} ticker{groups.length === 1 ? '' : 's'} · {callsCount} call{callsCount === 1 ? '' : 's'}</span>
                </div>
                {groups.length === 0 ? (
                  <div className="calls__empty">
                    <strong>No calls yet.</strong>
                    <p>Once the engine makes an investment call, it will appear here and be checked automatically.</p>
                  </div>
                ) : groups.map((group) => (
                  <TickerCard key={group.ticker} group={group} onOpen={openThesis} />
                ))}
              </section>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
