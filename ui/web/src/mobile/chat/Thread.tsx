// The message thread: bubbles, the live work strip, error + retry. Touch rules that differ from the
// desktop drawer, each deliberate: Copy is ALWAYS visible (hover doesn't exist), Stop is a real button
// (Esc doesn't exist), and the stick-to-bottom band is 96px (touch momentum overshoots a wheel).
import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ChatMessage, ChatWork } from '../../lib/types'
import { ComputedCard } from '../../components/chat/computed'
import { shouldStick } from './autoscroll'
import type { MobileChat } from './useMobileChat'

// react-markdown (+ remark-gfm) is ~40 KB gzip — lazy, with a plain-text fallback while it loads, so
// the boot path stays inside the DESIGN.md §8 budget. The desktop keeps its own static import.
const Markdown = lazy(() => import('./Markdown'))

const WORK_LABELS: Record<ChatWork['stage'], string> = {
  sending: 'Loading research…',
  sources: 'Loading your selected sources…',
  context: 'Research ready — starting your selected model…',
  modeling: 'Modeling the scenario…',
  starting: 'Starting the engine…',
  connected: 'Reading the context…',
  thinking: 'Thinking…',
  writing: 'Writing the answer…',
}

const elapsedSince = (startedAt: number) => Math.max(0, Math.round((Date.now() - startedAt) / 1000))

function WorkIndicator({ work, onStop }: { work: ChatWork; onStop: () => void }) {
  // A 1 Hz stopwatch: real elapsed time, never simulated progress. It has to own a timer rather than
  // read the clock during render — this component re-renders on stream events, and the stages where the
  // user most wants to see the clock moving ('starting', 'thinking') are exactly the ones that emit
  // nothing for seconds at a time, so a render-time read freezes precisely when it matters.
  const [secs, setSecs] = useState(() => elapsedSince(work.startedAt))
  useEffect(() => {
    setSecs(elapsedSince(work.startedAt))
    const id = setInterval(() => setSecs(elapsedSince(work.startedAt)), 1000)
    return () => clearInterval(id)
  }, [work.startedAt])
  return (
    <div className="mchat__work" role="status">
      <span className="mchat__workdot" aria-hidden />
      <span className="mchat__worklabel">{WORK_LABELS[work.stage] ?? 'Working…'}</span>
      {work.model && <span className="mchat__workmodel">{work.model}</span>}
      <span className="mchat__worktime mono">{secs}s</span>
      <button className="mchat__stop" onClick={onStop}>◼ Stop</button>
    </div>
  )
}

function Bubble({ m }: { m: ChatMessage }) {
  if (m.role === 'user') return <div className="mchat__msg mchat__msg--user">{m.content}</div>
  return (
    <div className="mchat__msg mchat__msg--ai">
      {m.thinking && (
        <details className="mchat__think">
          <summary>Thinking</summary>
          <div className="mchat__thinkbody">{m.thinking}</div>
        </details>
      )}
      {(m.computed || []).map((c, i) => <ComputedCard key={i} c={c} />)}
      {m.content && (
        <Suspense fallback={<div className="mchat__md mchat__md--plain">{m.content}</div>}>
          <Markdown text={m.content} />
        </Suspense>
      )}
      <div className="mchat__msgacts">
        <button className="mchat__copy" onClick={() => { void navigator.clipboard?.writeText(m.content) }}>⧉ Copy</button>
      </div>
    </div>
  )
}

export function Thread({ chat, starters, onStarter }: { chat: MobileChat; starters?: string[]; onStarter?: (q: string) => void }) {
  const { state } = chat
  const ref = useRef<HTMLDivElement>(null)
  const stickRef = useRef(true)

  // Follow the stream only while the user is inside the 96px bottom band. useLayoutEffect, not
  // useEffect: the scroll has to land in the same frame as the DOM change, or each token paints once
  // un-scrolled and the thread visibly judders while streaming.
  useLayoutEffect(() => {
    const el = ref.current
    if (el && stickRef.current) el.scrollTop = el.scrollHeight
  }, [state.messages, state.work?.stage])

  return (
    <div
      className="mchat__thread"
      ref={ref}
      onScroll={(e) => { const el = e.currentTarget; stickRef.current = shouldStick(el.scrollTop, el.scrollHeight, el.clientHeight) }}
    >
      {state.messages.length === 0 && !state.streaming && starters && starters.length > 0 && (
        <div className="mchat__starters">
          <div className="mchat__startershead">Or jump in</div>
          {starters.map((q) => (
            <button key={q} className="mchat__starter" onClick={() => onStarter?.(q)}>{q}</button>
          ))}
        </div>
      )}
      {state.messages.map((m, i) => <Bubble key={i} m={m} />)}
      {state.streaming && state.work && <WorkIndicator work={state.work} onStop={chat.stop} />}
      {state.error && (
        <div className="mchat__error" role="alert">
          <div>{state.error}</div>
          {state.retryText && state.error !== 'static-deploy' && (
            <button className="mchat__retry" onClick={chat.retry}>Retry</button>
          )}
        </div>
      )}
      {!state.streaming && !state.error && state.retryText && (
        /* the quiet aftermath of a deliberate Stop: the rollback removed the question from the thread,
           so without this chip it would be GONE — one tap re-asks under the same turn id */
        <div className="mchat__stopped">
          Stopped. <button className="mchat__retry" onClick={chat.retry}>Ask again</button>
        </div>
      )}
    </div>
  )
}
