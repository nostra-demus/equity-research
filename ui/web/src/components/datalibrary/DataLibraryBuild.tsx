// The Data Library's ACTIVE half: find feeds for a subject, send one to be built, and watch the build happen.
// The read-only half (what is wired, is it healthy) lives in DataLibrary.tsx; this file owns everything that
// spends money or changes the repo, and every one of those affordances is hidden unless the server says the
// caller may run it (whoami canScanPipeline / canBuildConnector — a positive match, §5).
//
// Two entry points, one machine underneath:
//   • "Find data feeds" — pick the subject (a ticker or a commodity) and, optionally, say what you are after.
//     A read-only agent deep-searches the open web and streams what it is checking, second by second. Each
//     keeper comes back already recorded with its verdict, so its Build button is a single call.
//   • "Find & build" on a recommended row — the same search narrowed to that ONE open need, with the strongest
//     buildable candidate sent to the build engine automatically. One click, still fully narrated.
//
// The stage rail is deliberately honest about where a build actually gets to: the coding agent opens a PULL
// REQUEST, and the feed is only live once that merges and the fetcher writes its first file. So the rail
// stops at "pull request open" and turns green only when the connector shows up in the registry as a healthy
// feed — a state this component reads from the pipelines registry rather than claiming on its own.
// NO swarm id and NO connector id is hardcoded anywhere here (§26; datalibrary-purity.test.ts scans this tree).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../../lib/store'
import { api } from '../../lib/api'
import { ACQ_LABEL, CADENCE_LABEL } from '../../lib/labels'
import type { BuildStep, DiscoveredFeed, PipelineEntry, PipelineView, RecommendedNeed, ScanVerdict } from '../../lib/types'
import { connectorForCandidate, connectorIdForCandidate, pipelineIsUsable } from './feedHealth'
import { AUTOMATIC_CONNECTOR_CODING_UNAVAILABLE, recommendedDiscoveryRequest } from './buildAvailability'

const TOOL_VERB: Record<string, string> = {
  WebSearch: 'searching', WebFetch: 'reading', Read: 'reading', Write: 'writing', Edit: 'editing',
  MultiEdit: 'editing', Bash: 'running', Glob: 'looking for', Grep: 'searching', TodoWrite: 'planning', say: '',
}
const verbFor = (tool: string): string => TOOL_VERB[tool] ?? tool.toLowerCase()

function shortHost(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url.slice(0, 40) }
}

/** A live agent transcript — used identically by the search and by the build. */
function ActivityFeed({ steps, running, startedAt, title }: { steps: BuildStep[]; running: boolean; startedAt: number; title: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!running) return
    // the clock is a live tick, so it never animates (DESIGN.md §3) and slows right down for reduced motion
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const t = setInterval(() => setNow(Date.now()), reduce ? 1000 : 200)
    return () => clearInterval(t)
  }, [running])
  const tail = useRef<HTMLUListElement>(null)
  useEffect(() => { tail.current?.scrollTo({ top: tail.current.scrollHeight }) }, [steps.length])
  const elapsed = Math.max(0, (now - startedAt) / 1000)
  return (
    <div className="datalib__live">
      <div className="datalib__livehead">
        <span className={`datalib__livedot${running ? ' is-on' : ''}`} aria-hidden />
        <span>{title}</span>
        <span className="datalib__clock">{elapsed.toFixed(running ? 1 : 0)}s</span>
      </div>
      {steps.length > 0 ? (
        <ul className="datalib__feed" ref={tail}>
          {steps.map((s, i) => (
            <li key={i} className={`datalib__feedrow${s.tool === 'say' ? ' datalib__feedrow--say' : ''}${running && i === steps.length - 1 ? ' is-current' : ''}`}>
              {s.tool !== 'say' && <span className="datalib__feedtool">{verbFor(s.tool)}</span>}
              <span className="datalib__feedtarget">{s.target || s.tool}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="datalib__fine">{running ? 'starting up…' : 'nothing recorded'}</div>
      )}
    </div>
  )
}

/** One found feed, with the single button that turns it into a durable connector. */
function CandidateCard({ feed, existingConnector, canBuild, state, onBuild, onOpenExisting }: {
  feed: DiscoveredFeed
  existingConnector?: PipelineEntry
  canBuild: boolean
  state: 'idle' | 'building' | 'sent'
  onBuild: () => void
  onOpenExisting: () => void
}) {
  const v: ScanVerdict = feed.verdict
  const existingId = existingConnector?.id || feed.connector_exists
  return (
    <div className="datalib__cand">
      <div className="datalib__candtop">
        <span className="datalib__series">{v.series || shortHost(feed.source_url)}</span>
        <span className="datalib__verdict" data-v={v.relevance === 'exact' ? 'live' : 'attention'}>
          {v.relevance === 'exact' ? 'exact match' : 'partly helps'}{v.confidence > 0 ? ` · ${v.confidence}%` : ''}
        </span>
      </div>
      <div className="datalib__chips">
        <a className="chip datalib__candhost" href={feed.source_url} target="_blank" rel="noreferrer" title={feed.source_url}>{shortHost(feed.source_url)} ↗</a>
        <span className="chip" title="the §4 source tier a connector for this would fold in at">tier {v.tier}</span>
        <span className="chip">{CADENCE_LABEL[v.cadence] ?? v.cadence}</span>
        <span className="chip">{ACQ_LABEL[v.acquisition] ?? v.acquisition}</span>
        {v.entry_modules.length > 0 && <span className="chip datalib__chip--subj">feeds {v.entry_modules.join(', ')}</span>}
      </div>
      {feed.why && <div className="datalib__why">{feed.why}</div>}
      <div className="datalib__candactions">
        {!v.buildable ? (
          <span className="datalib__fine">No durable feed can be built for this one — it needs a login, is paywalled with no API, or has no stable address.</span>
        ) : state !== 'idle' ? (
          <span className="datalib__fine">{state === 'sent' ? 'sent to the build engine ✓' : 'building…'}</span>
        ) : existingId ? (
          <>
            <span className="datalib__fine">
              Connector <code>{existingId}</code> already covers this need. Repair or replace that
              feed instead of creating a second primary.
            </span>
            {existingConnector && <button className="btn btn--ghost datalib__mini" onClick={onOpenExisting}>View existing feed ›</button>}
          </>
        ) : canBuild ? (
          <button className="btn btn--amber datalib__mini" onClick={onBuild} title="Send this to Claude — it writes the connector, tests it, and opens a pull request">Build this feed ▸</button>
        ) : (
          <span className="datalib__fine">{AUTOMATIC_CONNECTOR_CODING_UNAVAILABLE}</span>
        )}
      </div>
    </div>
  )
}

// One build being watched. `connectorId` is what lets the tracker resolve past its PR: once that connector
// shows up in the registry as a healthy feed, the rail goes green on EVIDENCE rather than on a claim.
export interface TrackedBuild {
  pipelineId: string
  subject: string
  series: string
  startedAt: number
  steps: BuildStep[]
  running: boolean
  outcome: 'pr_open' | 'assessed' | null
  prUrl: string | null
  connectorId: string | null
  note: string
}

const STAGES = ['found the source', 'writing the connector', 'pull request open', 'live in the pool'] as const

/** How far a build has actually got. Stage 4 is only reachable through the registry — never from the agent. */
export function stageIndexOf(b: TrackedBuild, wiredHealthy: boolean): number {
  if (wiredHealthy) return 3
  if (b.outcome === 'pr_open') return 2
  if (b.running) return 1
  return b.outcome === 'assessed' ? 1 : 0
}

function BuildTracker({ build, pipelines, onDismiss }: { build: TrackedBuild; pipelines: PipelineEntry[]; onDismiss: () => void }) {
  // The green light is EARNED: the connector has to exist, carry a fresh file for this subject, and have a
  // current/usable v2 fetch outcome. A legacy `ok` payload is adapted by pipelineIsUsable during deploy skew.
  const wired = build.connectorId ? pipelines.find((p) => p.id === build.connectorId) : undefined
  const wiredHealthy = wired ? pipelineIsUsable(wired, build.subject) : false
  const stage = stageIndexOf(build, wiredHealthy)
  const failed = !build.running && build.outcome !== 'pr_open' && !wiredHealthy
  return (
    <div className={`datalib__build${wiredHealthy ? ' datalib__build--done' : failed ? ' datalib__build--failed' : ''}`}>
      <div className="datalib__buildhead">
        <span className={`datalib__livedot${build.running ? ' is-on' : ''}`} aria-hidden />
        <span className="datalib__buildsubj">{build.series || build.subject}</span>
        <span className="datalib__verdict" data-v={wiredHealthy ? 'live' : failed ? 'broken' : 'attention'}>
          {wiredHealthy ? 'live · feeding the pool' : build.running ? 'building' : build.outcome === 'pr_open' ? 'waiting on its pull request' : 'not built'}
        </span>
        <button className="btn btn--ghost datalib__mini" style={{ marginLeft: 'auto' }} onClick={onDismiss}>hide</button>
      </div>

      <div className="datalib__stages">
        {STAGES.map((s, i) => (
          <span key={s}>
            <span className={`datalib__stage${i < stage ? ' is-done' : i === stage ? ' is-on' : ''}`}>{i < stage ? '✓ ' : ''}{s}</span>
            {i < STAGES.length - 1 && <span className="datalib__stagesep"> › </span>}
          </span>
        ))}
      </div>

      {build.running && <ActivityFeed steps={build.steps} running startedAt={build.startedAt} title="Claude is building the connector" />}
      {!build.running && build.steps.length > 0 && <ActivityFeed steps={build.steps} running={false} startedAt={build.startedAt} title="what it did" />}

      {build.note && <div className="datalib__why">{build.note}</div>}
      {build.prUrl && <a className="datalib__prlink" href={build.prUrl} target="_blank" rel="noreferrer">Review the pull request ↗</a>}
      {build.outcome === 'pr_open' && !wiredHealthy && (
        <div className="datalib__fine">
          The code is written and tested, and the pull request is open. The feed starts filling the pool once that
          merges and the fetcher runs — this card turns green by itself when it does.
        </div>
      )}
    </div>
  )
}

/** The find-feeds + build surface. Rendered inside the Data Library's own scroll column. */
export function DataLibraryBuild({ pipelines, recommended, canScan, canBuild, focusNeed, onFocusHandled, onRefresh }: {
  pipelines: PipelineEntry[]
  recommended: RecommendedNeed[]
  canScan: boolean
  canBuild: boolean
  focusNeed: RecommendedNeed | null // set when a Recommended row asked for the one-click path
  onFocusHandled: () => void
  onRefresh: () => void
}) {
  const setToast = useStore((s) => s.setToast)
  const setSelected = useStore((s) => s.setDlSelected)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const selectedTicker = useStore((s) => s.selectedTicker)
  const swarmSubjectList = useStore((s) => s.swarmSubjectList)
  const tickers = useStore((s) => s.tickers)

  const [subject, setSubject] = useState(selectedTicker ?? '')
  const [searchSwarm, setSearchSwarm] = useState(activeSwarm)
  const [want, setWant] = useState('')
  const [searching, setSearching] = useState(false)
  const [steps, setSteps] = useState<BuildStep[]>([])
  const [startedAt, setStartedAt] = useState(0)
  const [found, setFound] = useState<DiscoveredFeed[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchedFor, setSearchedFor] = useState<string | null>(null)
  const [builds, setBuilds] = useState<TrackedBuild[]>([])
  const [sent, setSent] = useState<Record<string, 'building' | 'sent'>>({})
  const searchAbort = useRef<AbortController | null>(null)
  const buildAborts = useRef(new Map<string, AbortController>())

  // every subject this cockpit knows about, for the picker — union of both rosters, so it works on any swarm
  const knownSubjects = useMemo(
    () => [...new Set([...swarmSubjectList, ...tickers.map((t) => t.ticker)])].sort(),
    [swarmSubjectList, tickers])

  useEffect(() => () => {
    searchAbort.current?.abort()
    for (const ac of buildAborts.current.values()) ac.abort()
  }, [])

  // Watch one build's live transcript. Safe to call twice for the same id — the previous watcher is dropped.
  const watchBuild = useCallback((pipelineId: string) => {
    buildAborts.current.get(pipelineId)?.abort()
    const ac = new AbortController()
    buildAborts.current.set(pipelineId, ac)
    void api.pipelineBuildStream(pipelineId, {
      signal: ac.signal,
      onStep: (s) => setBuilds((cur) => cur.map((b) => (b.pipelineId === pipelineId ? { ...b, steps: [...b.steps, s].slice(-200) } : b))),
      onDone: (d) => {
        setBuilds((cur) => cur.map((b) => (b.pipelineId === pipelineId
          ? { ...b, running: false, outcome: (d.outcome as 'pr_open' | 'assessed' | null), prUrl: d.prUrl, connectorId: d.connectorId, note: d.note }
          : b)))
        setSent((cur) => ({ ...cur, [pipelineId]: 'sent' }))
        onRefresh() // the registry may now carry a new connector — re-read so the rail can go green on evidence
      },
      onAbsent: (d) => setBuilds((cur) => cur.map((b) => (b.pipelineId === pipelineId
        ? { ...b, running: false, outcome: d.status === 'pr_open' ? 'pr_open' : b.outcome, prUrl: d.prUrl, connectorId: d.connectorId, note: d.note || b.note }
        : b))),
      onError: () => setBuilds((cur) => cur.map((b) => (b.pipelineId === pipelineId ? { ...b, running: false } : b))),
    })
  }, [onRefresh])

  // On open, pick up any build the ledger says is still running (a reopen or a page reload must not lose the
  // live view). Only builds this component isn't already tracking are adopted, so a re-render never double-adds.
  const adopted = useRef(false)
  useEffect(() => {
    if (adopted.current || !canBuild) return
    adopted.current = true
    void api.pipelineBuilds().then((items) => {
      const resume = resumableBuilds(items)
      if (!resume.length) return
      setBuilds((cur) => {
        const have = new Set(cur.map((b) => b.pipelineId))
        return [...resume.filter((b) => !have.has(b.pipelineId)), ...cur]
      })
      for (const b of resume) watchBuild(b.pipelineId)
    }).catch(() => {})
  }, [canBuild, watchBuild])

  const track = useCallback((pipelineId: string, subj: string, series: string) => {
    setBuilds((cur) => (cur.some((b) => b.pipelineId === pipelineId) ? cur : [
      { pipelineId, subject: subj, series, startedAt: Date.now(), steps: [], running: true, outcome: null, prUrl: null, connectorId: null, note: '' },
      ...cur,
    ]))
    setSent((cur) => ({ ...cur, [pipelineId]: 'building' }))
    watchBuild(pipelineId)
  }, [watchBuild])

  const build = useCallback(async (feed: DiscoveredFeed, subj: string) => {
    const existing = connectorForCandidate(feed, subj, pipelines)
    const existingId = connectorIdForCandidate(feed, subj, pipelines)
    if (existingId) {
      if (existing) setSelected(existing.id)
      setToast({ msg: `${existingId} already covers this need. Repair or replace it instead of building a duplicate.`, tone: 'info' })
      return
    }
    setSent((cur) => ({ ...cur, [feed.pipeline_id]: 'building' }))
    try {
      const res = await api.buildConnector(feed.pipeline_id)
      if (!res.ok) {
        setSent((cur) => { const n = { ...cur }; delete n[feed.pipeline_id]; return n })
        setToast({ msg: res.message || 'Could not start the build.', tone: 'bad' })
        return
      }
      track(feed.pipeline_id, subj, feed.verdict.series)
    } catch (e: any) {
      setSent((cur) => { const n = { ...cur }; delete n[feed.pipeline_id]; return n })
      setToast({ msg: `Could not start the build: ${e?.message || 'error'}`, tone: 'bad' })
    }
  }, [pipelines, setSelected, setToast, track])

  const search = useCallback((subj: string, opts: { need_id?: string | null; runRoot?: string; decisionFingerprint?: string; want?: string; autoBuild?: boolean }, swarm = activeSwarm) => {
    const target = subj.trim().toUpperCase()
    if (!target || searching) return
    searchAbort.current?.abort()
    const ac = new AbortController()
    searchAbort.current = ac
    setSearching(true); setSteps([]); setFound([]); setSearchError(null)
    setStartedAt(Date.now()); setSearchedFor(target)
    void api.pipelineDiscoverStream(target, swarm, opts, {
      signal: ac.signal,
      onActivity: (a) => setSteps((cur) => {
        const last = cur[cur.length - 1]
        if (last && last.tool === a.tool && last.target === a.target) return cur // dedup consecutive
        return [...cur, a].slice(-60)
      }),
      onFound: (f) => {
        setFound((cur) => [...cur, f])
        if (f.building) track(f.pipeline_id, target, f.verdict.series)
      },
      onDone: () => setSearching(false),
      onError: (msg) => {
        setSearching(false)
        setSearchError(msg === 'static-deploy' ? 'Finding feeds needs the live engine.' : msg)
      },
    })
  }, [activeSwarm, searching, track])

  // the one-click path from a Recommended row: narrow the search to that need and build the best candidate
  useEffect(() => {
    if (!focusNeed) return
    onFocusHandled()
    setWant(focusNeed.series)
    setSubject(focusNeed.subject)
    setSearchSwarm(focusNeed.swarm)
    const request = recommendedDiscoveryRequest(focusNeed, canBuild)
    if (!request) {
      setSearchError('This recommendation came from an older server and cannot be tied to one decision. Use Find feeds for a general search.')
      return
    }
    search(focusNeed.subject, request.opts, request.swarm)
  }, [focusNeed, onFocusHandled, search, canBuild])

  const openNeedsFor = useMemo(
    () => (subject ? recommended.filter((r) => r.subject === subject.trim().toUpperCase()).length : 0),
    [recommended, subject])

  if (!canScan) {
    return (
      <div className="datalib__discover">
        <div className="datalib__dishead"><span className="datalib__distitle">Find more data feeds</span></div>
        <div className="datalib__fine">
          Searching for feeds is admin-only on this server. Automatic connector coding is not available from this session. Everything above is still a live read.
        </div>
      </div>
    )
  }

  return (
    <>
      {builds.length > 0 && (
        <div className="datalib__list">
          {builds.map((b) => (
            <BuildTracker key={b.pipelineId} build={b} pipelines={pipelines}
              onDismiss={() => {
                buildAborts.current.get(b.pipelineId)?.abort()
                buildAborts.current.delete(b.pipelineId)
                setBuilds((cur) => cur.filter((x) => x.pipelineId !== b.pipelineId))
              }} />
          ))}
        </div>
      )}

      <div className="datalib__discover">
        <div className="datalib__dishead">
          <span className="datalib__distitle">Find more data feeds</span>
          <span className="datalib__fine">
            pick a company or commodity — a read-only agent searches the open web for the primary sources worth wiring,
            ranked against what the runs said is missing and what is already here
          </span>
        </div>
        {!canBuild && <div className="datalib__fine">{AUTOMATIC_CONNECTOR_CODING_UNAVAILABLE}</div>}

        <div className="datalib__disform">
          <input
            className="datalib__input datalib__input--subject" list="datalib-subjects" value={subject}
            onChange={(e) => { setSubject(e.target.value.toUpperCase()); setSearchSwarm(activeSwarm) }}
            onKeyDown={(e) => { if (e.key === 'Enter') search(subject, { want }, searchSwarm) }}
            placeholder="TICKER" aria-label="Company or commodity to find feeds for" spellCheck={false} />
          <datalist id="datalib-subjects">{knownSubjects.map((s) => <option key={s} value={s} />)}</datalist>
          <input
            className="datalib__input datalib__input--want" value={want}
            onChange={(e) => setWant(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') search(subject, { want }, searchSwarm) }}
            placeholder="anything specific you're after? (optional)" aria-label="What data are you after" />
          <button className="btn btn--amber" disabled={!subject.trim() || searching} onClick={() => search(subject, { want }, searchSwarm)}>
            {searching ? 'Searching…' : 'Find feeds ▸'}
          </button>
        </div>
        {subject.trim() && !searching && (
          <div className="datalib__fine">
            {openNeedsFor > 0
              ? `${openNeedsFor} open data need${openNeedsFor === 1 ? '' : 's'} recorded for ${subject.trim().toUpperCase()} — the search is ranked against ${openNeedsFor === 1 ? 'it' : 'them'} first.`
              : `No open data needs recorded for ${subject.trim().toUpperCase()} yet — the search will judge relevance from the subject itself.`}
          </div>
        )}

        {(searching || steps.length > 0) && (
          <ActivityFeed steps={steps} running={searching} startedAt={startedAt}
            title={searching ? `Searching for ${searchedFor} feeds` : `Searched for ${searchedFor} feeds`} />
        )}
        {searchError && <div className="datalib__err">{searchError}</div>}

        {found.length > 0 && (
          <div className="datalib__list">
            {found.map((f) => (
              <CandidateCard key={f.pipeline_id} feed={f}
                existingConnector={connectorForCandidate(f, searchedFor || subject, pipelines)} canBuild={canBuild}
                state={sent[f.pipeline_id] ?? 'idle'} onBuild={() => void build(f, searchedFor || subject)}
                onOpenExisting={() => {
                  const existing = connectorForCandidate(f, searchedFor || subject, pipelines)
                  if (existing) setSelected(existing.id)
                }} />
            ))}
          </div>
        )}
        {!searching && !searchError && searchedFor && found.length === 0 && (
          <div className="datalib__fine">
            Nothing worth wiring came back for {searchedFor}. That is a real answer, not a failure — the sources it
            checked were behind logins, had no stable address, or duplicated a feed already here.
          </div>
        )}
      </div>
    </>
  )
}

/** Resume watching builds the ledger says are still running (a reload should not lose the live view). */
export function resumableBuilds(items: PipelineView[]): TrackedBuild[] {
  return items
    .filter((v) => v.status === 'building')
    .map((v) => ({
      pipelineId: v.pipeline_id, subject: v.subject, series: v.verdict?.series || v.series_hint,
      startedAt: Date.parse(v.last_update_at) || Date.now(), steps: [], running: true,
      outcome: null, prUrl: v.pr_url, connectorId: v.connector_id, note: v.last_note,
    }))
}
