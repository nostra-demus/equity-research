import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { api } from '../../lib/api'
import {
  filterMemoryItems,
  groupMemoryItems,
  memoryChange,
  memoryConfidence,
  memoryDate,
  memoryFreshnessCheckPending,
  memoryFreshnessPollDelay,
  memoryKinds,
  type MemoryDisplayGroup,
  type MemoryTab,
} from '../../lib/memoryView'
import { useStore } from '../../lib/store'
import type { MemoryCockpit, MemoryItem, MemoryRead, MemoryRuntimeRead } from '../../lib/types'
import './MemoryExplorer.css'

const COCKPIT_LABEL: Record<MemoryCockpit, string> = {
  research: 'Research', screener: 'Screener', commodity: 'Commodity',
}

function Skeletons() {
  return (
    <div className="memory__timeline" aria-hidden="true">
      {[0, 1, 2].map((row) => (
        <div className="memory__card memory__card--skeleton" key={row}>
          <span className="skel memory__skeldate" />
          <div className="memory__cardcopy">
            <span className="skel skel--line skel--w45" />
            <span className="skel skel--line skel--w70" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SummaryStrip({ read, runtime }: { read: MemoryRead; runtime: MemoryRuntimeRead | null }) {
  const count = read.counts
  return (
    <div className="memory__summary" aria-label="Memory counts">
      <div className="memory__health" data-state={read.status.state}>
        <span className="memory__healthdot" aria-hidden="true" />
        <div>
          <strong>{read.status.state === 'healthy' ? 'Memory is ready' : read.status.state === 'degraded' ? 'Memory needs attention' : 'Memory unavailable'}</strong>
          {read.status.state !== 'healthy' && <span>{read.status.message}</span>}
        </div>
        <span className="memory__mode">Read-only · {runtime ? `${runtime.effective_mode} · readiness ${runtime.readiness.status}` : 'runtime metadata unavailable'}</span>
      </div>
      {read.available && (
        <div className="memory__counts">
          <div><strong>{count.total.toLocaleString()}</strong><span>checked records</span></div>
          <div><strong>{count.research.toLocaleString()}</strong><span>research</span></div>
          <div><strong>{count.screener.toLocaleString()}</strong><span>screener</span></div>
          <div><strong>{count.commodity.toLocaleString()}</strong><span>commodity</span></div>
          <div><strong>{read.status.source_count.toLocaleString()}</strong><span>sources</span></div>
        </div>
      )}
    </div>
  )
}

function OperationsPanel({ runtime }: { runtime: MemoryRuntimeRead }) {
  const count = runtime.counts
  const configuredServices = runtime.services.filter((item) => item.configured).length
  return (
    <section className="memory__operations" aria-label="Three-layer memory operations">
      <div className="memory__operationshead">
        <div>
          <strong>Three-layer runtime</strong>
          <span>{runtime.mode} configured · {runtime.effective_mode} effective · {runtime.readiness.status} readiness</span>
        </div>
        <span className="chip">{runtime.state}</span>
      </div>
      <div className="memory__layercounts">
        <div><strong>{count.task_episodes}</strong><span>Episodic · task receipts</span></div>
        <div><strong>{count.lessons}</strong><span>Semantic · active lessons</span></div>
        <div><strong>{count.playbooks}</strong><span>Procedural · playbooks</span></div>
        <div><strong>{count.packets}</strong><span>Frozen packets</span></div>
        <div><strong>{count.used_items}</strong><span>Used items</span></div>
        <div><strong>{count.rejected_items}</strong><span>Checked and rejected</span></div>
        <div><strong>{count.executions}</strong><span>Playbook executions</span></div>
        <div><strong>{count.deviations}</strong><span>Deviations</span></div>
        <div><strong>{count.candidates}</strong><span>Candidates</span></div>
        <div><strong>{count.promotions}</strong><span>Promotions</span></div>
        <div><strong>{count.quarantines}</strong><span>Quarantines</span></div>
        <div><strong>{configuredServices}/{runtime.services.length}</strong><span>Service identities</span></div>
      </div>
      {(runtime.controls.global_disabled || runtime.controls.disabled_layers.length > 0 || runtime.controls.disabled_playbooks.length > 0) && (
        <div className="memory__switches" role="status">
          {runtime.controls.global_disabled && <span>Global kill switch active</span>}
          {runtime.controls.disabled_layers.map((layer) => <span key={layer}>{layer} disabled</span>)}
          {runtime.controls.disabled_playbooks.map((playbook) => (
            <span key={`${playbook.playbook_id}-${playbook.version ?? 'all'}`}>{playbook.playbook_id}{playbook.version ? ` v${playbook.version}` : ''} quarantined</span>
          ))}
        </div>
      )}
      {(runtime.alerts.length > 0 || runtime.slos.length > 0) && (
        <details className="memory__opsdetail">
          <summary>{runtime.alerts.length} alerts · {runtime.slos.filter((item) => item.status === 'met').length}/{runtime.slos.length} SLOs met</summary>
          <div className="memory__opsdetailgrid">
            <div>
              <strong>Alerts</strong>
              {runtime.alerts.length ? runtime.alerts.map((alert) => <p data-severity={alert.severity} key={alert.code}>{alert.message}</p>) : <p>No active alerts.</p>}
            </div>
            <div>
              <strong>SLO evidence</strong>
              {runtime.slos.length ? runtime.slos.map((slo) => <p key={slo.name}><span>{slo.name}</span> · {slo.status} · {slo.target}</p>) : <p>No SLO evidence has been recorded.</p>}
            </div>
          </div>
        </details>
      )}
    </section>
  )
}

function MemoryCard({ group, onOpen, buttonRef }: {
  group: MemoryDisplayGroup
  onOpen: () => void
  buttonRef: (button: HTMLButtonElement | null) => void
}) {
  const { item, records } = group
  const confidence = memoryConfidence(item.confidence)
  const version = item.current
    ? item.lineage.corrected_by.length ? 'Current · corrected' : 'Current'
    : 'Earlier version'
  return (
    <button ref={buttonRef} className={`memory__card${item.current ? '' : ' memory__card--past'}`} onClick={onOpen}>
      <span className="memory__date">
        {memoryDate(item.happened_at)}
        <span className="memory__line" aria-hidden="true" />
      </span>
      <span className="memory__cardcopy">
        <span className="memory__cardtop">
          <span className="memory__subject">{item.subject || 'General'}</span>
          <span className="chip">{COCKPIT_LABEL[item.cockpit]}</span>
          <span className="chip">{item.kind}</span>
          <span className={`memory__version${item.current ? ' memory__version--current' : ''}`}>{version}</span>
          {records.length > 1 && <span className="memory__recordcount">{records.length} records</span>}
        </span>
        <strong className="memory__cardtitle">{item.title}</strong>
        <span className="memory__cardsummary">{item.summary}</span>
        <span className="memory__cardmeta">
          {item.status && <span>{item.status}</span>}
          {confidence && <span>{confidence}</span>}
          <span className="memory__verified">✓ source checked</span>
        </span>
      </span>
      <span className="memory__chevron" aria-hidden="true">›</span>
    </button>
  )
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="memory__section">
      <h3>{title}</h3>
      <div className="memory__sectionbody">{children}</div>
    </section>
  )
}

function MemoryDetail({ group, onBack, backRef }: {
  group: MemoryDisplayGroup
  onBack: () => void
  backRef: React.RefObject<HTMLButtonElement>
}) {
  const { item, records } = group
  const confidence = memoryConfidence(item.confidence)
  const version = item.current
    ? item.lineage.corrected_by.length ? 'Current version · corrected' : 'Current version'
    : 'Earlier version'
  const sameDay = memoryDate(item.happened_at) === memoryDate(item.valid_from)
  const evidenceCount = records.reduce((total, record) => total + record.proof.evidence_ref_count, 0)
  return (
    <div className="memory__detail">
      <button ref={backRef} className="btn btn--ghost memory__back" onClick={onBack}>← All memory</button>
      <div className="memory__detailhead">
        <div className="memory__eyebrow">{COCKPIT_LABEL[item.cockpit]} · {item.kind} · {item.subject || 'General'}</div>
        <h2>{item.title}</h2>
        <div className="memory__detailchips">
          <span className={`memory__version${item.current ? ' memory__version--current' : ''}`}>{version}</span>
          {item.status && <span className="chip">{item.status}</span>}
          {confidence && <span className="chip">{confidence}</span>}
        </div>
      </div>

      <div className="memory__detailgrid">
        <DetailSection title="What it says">
          <p>{item.summary || 'This memory has no plain-English summary.'}</p>
        </DetailSection>
        <DetailSection title="When we knew it">
          <p>Recorded on <strong>{memoryDate(item.happened_at)}</strong>.</p>
          {!sameDay && <p>It applies from <strong>{memoryDate(item.valid_from)}</strong>.</p>}
        </DetailSection>
        <DetailSection title="What changed">
          <p>{memoryChange(item)}</p>
          {item.lineage.derived_from.length > 0 && (
            <p>It was built from {item.lineage.derived_from.length} earlier {item.lineage.derived_from.length === 1 ? 'record' : 'records'}.</p>
          )}
        </DetailSection>
        <DetailSection title="Where it came from">
          {records.length === 1 ? (
            <>
              <p className="memory__sourcepath">{item.source.path}</p>
              {item.source.locator && <p>{item.source.locator}</p>}
            </>
          ) : (
            <p>This card groups <strong>{records.length} checked source records</strong> that say the same thing.</p>
          )}
          <p className="memory__verified">
            ✓ {records.length === 1
              ? `Exact source checked · ${evidenceCount} evidence ${evidenceCount === 1 ? 'link' : 'links'}`
              : `Every source checked · ${evidenceCount} evidence references across these records`}
          </p>
        </DetailSection>
      </div>

      <details className="memory__proof">
        <summary>Technical proof · {records.length} {records.length === 1 ? 'record' : 'records'}</summary>
        <ol className="memory__proofrecords" role="list">
          {records.map((record, index) => (
            <li className="memory__proofrecord" key={record.event_id}>
              <strong>Record {index + 1}</strong>
              <dl>
                <div><dt>Memory ID</dt><dd>{record.event_id}</dd></div>
                <div><dt>Record type</dt><dd>{record.event_type}</dd></div>
                <div><dt>Source file</dt><dd>{record.source.path}</dd></div>
                <div><dt>Source location</dt><dd>{record.source.locator || 'File-level source'}</dd></div>
                <div><dt>Source checksum</dt><dd>{record.source.sha256}</dd></div>
                <div><dt>Git record</dt><dd>{record.source.git_commit || 'Not stored in Git'}</dd></div>
                <div><dt>Earlier records updated</dt><dd>{record.lineage.supersedes.length}</dd></div>
                <div><dt>Later replacements</dt><dd>{record.lineage.replaced_by.length}</dd></div>
                <div><dt>Later corrections</dt><dd>{record.lineage.corrected_by.length}</dd></div>
              </dl>
            </li>
          ))}
        </ol>
      </details>
    </div>
  )
}

export function MemoryExplorer() {
  const close = useStore((state) => state.closeMemory)
  const staticMode = useStore((state) => state.staticMode)
  const reducedMotion = useReducedMotion()
  const [read, setRead] = useState<MemoryRead | null>(null)
  const [runtime, setRuntime] = useState<MemoryRuntimeRead | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState('')
  const [cockpit, setCockpit] = useState<MemoryTab>('all')
  const [kind, setKind] = useState('')
  const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const bodyRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const selectedOpenerKeyRef = useRef<string | null>(null)
  const listScrollTopRef = useRef(0)
  const cardRefs = useRef(new Map<string, HTMLButtonElement>())
  const detailBackRef = useRef<HTMLButtonElement | null>(null)
  const requestGeneration = useRef(0)
  const freshnessPolls = useRef(0)

  const load = useCallback(async (refresh = false) => {
    const generation = ++requestGeneration.current
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const [next, runtimeNext] = await Promise.all([
        api.memory(), api.memoryRuntime().catch(() => null),
      ])
      if (generation === requestGeneration.current) { setRead(next); setRuntime(runtimeNext) }
    } catch (cause: any) {
      if (generation !== requestGeneration.current) return
      const message = cause?.status === 404 || cause?.code === 'memory-contract-invalid'
        ? 'The cockpit and memory service are briefly on different versions. Retry after the engine finishes updating.'
        : 'The live memory service could not be reached. Your saved research has not been changed.'
      setError(message)
    } finally {
      if (generation === requestGeneration.current) { setLoading(false); setRefreshing(false) }
    }
  }, [])

  useEffect(() => { void load() }, [load])
  const kinds = useMemo(() => memoryKinds(read?.items ?? []), [read])
  const items = useMemo(() => filterMemoryItems(read?.items ?? [], { query, cockpit, kind }), [read, query, cockpit, kind])
  const groups = useMemo(() => groupMemoryItems(items), [items])
  const selected = selectedGroupKey ? groups.find((group) => group.key === selectedGroupKey) ?? null : null
  useEffect(() => {
    if (selectedGroupKey && read && !selected) setSelectedGroupKey(null)
  }, [read, selected, selectedGroupKey])

  // The backend may return its last verified view immediately and finish a rebuild in the background.
  // Recheck only that exact state, keep the visible list mounted, stop on failure, and always clean up.
  useEffect(() => {
    if (!memoryFreshnessCheckPending(read)) freshnessPolls.current = 0
    const delay = memoryFreshnessPollDelay(read, freshnessPolls.current)
    if (delay === null || refreshing || error) return
    const timer = window.setTimeout(() => {
      freshnessPolls.current += 1
      void load(true)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [error, load, read, refreshing])

  // A real modal: focus enters it, Escape closes it, Tab stays inside, and focus returns to Memory.
  useEffect(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement && !panelRef.current?.contains(active)) openerRef.current = active
    requestAnimationFrame(() => closeRef.current?.focus())
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); return }
      if (event.key !== 'Tab') return
      const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), details > summary, [tabindex]:not([tabindex="-1"])',
      ) || []).filter((element) => element.offsetParent !== null)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!panelRef.current?.contains(document.activeElement)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
        return
      }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      requestAnimationFrame(() => openerRef.current?.focus())
    }
  }, [close])

  // List/detail and retry transitions unmount the focused control. Keep focus inside the modal and return
  // it to the exact memory card when the reader goes back, instead of dropping it behind aria-modal.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (selectedGroupKey) {
        if (bodyRef.current) bodyRef.current.scrollTop = 0
        detailBackRef.current?.focus({ preventScroll: true })
        return
      }
      const openerKey = selectedOpenerKeyRef.current
      selectedOpenerKeyRef.current = null
      if (bodyRef.current) bodyRef.current.scrollTop = listScrollTopRef.current
      const opener = openerKey ? cardRefs.current.get(openerKey) : null
      if (opener?.isConnected) opener.focus({ preventScroll: true })
      else if (!panelRef.current?.contains(document.activeElement)) closeRef.current?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [selectedGroupKey])

  // Retry/loading swaps can also remove a focused control. Repair only true focus loss; never pull focus
  // away from a search field, proof disclosure, or detail control that is still mounted.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!panelRef.current?.contains(document.activeElement)) closeRef.current?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [loading, read, error])

  const rememberCard = useCallback((key: string, button: HTMLButtonElement | null) => {
    if (button) cardRefs.current.set(key, button)
    else cardRefs.current.delete(key)
  }, [])
  const filtersActive = !!query.trim() || cockpit !== 'all' || !!kind
  const titleId = 'memory-explorer-title'

  return (
    <motion.div
      ref={panelRef}
      className="pipeline memory"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: '100%' }}
      transition={{ duration: reducedMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pipeline__head memory__head">
        <div className="pipeline__titlewrap">
          <div className="pipeline__title" id={titleId}>Memory</div>
          <div className="pipeline__sub">What the system remembers across Research, Screener and Commodity.</div>
        </div>
        <div className="pipeline__tools">
          <button className={`btn btn--ghost pipeline__refresh${refreshing ? ' is-spinning' : ''}`} disabled={refreshing} onClick={() => void load(true)} title="Refresh memory" aria-label="Refresh memory">↻</button>
          <button ref={closeRef} className="btn btn--ghost" onClick={close} title="Close memory" aria-label="Close memory">✕</button>
        </div>
      </div>

      {read && <SummaryStrip read={read} runtime={runtime} />}

      <div ref={bodyRef} className="memory__body">
        <div className="memory__column">
          {loading && !read && <Skeletons />}
          {!loading && !read && error && (
            <div className="bookempty memory__state">
              <div className="bookempty__title">Couldn’t open live memory</div>
              <div className="bookempty__body">{error}</div>
              <button className="btn" onClick={() => void load()}>Retry</button>
            </div>
          )}
          {read && !read.available && (
            <div className="bookempty memory__state">
              <div className="bookempty__title">Live memory is unavailable here</div>
              <div className="bookempty__body">
                {staticMode
                  ? 'This is a read-only website copy. Open the live cockpit on the engine machine to search its memory.'
                  : read.status.message}
              </div>
              {!staticMode && <button className="btn" onClick={() => void load()}>Retry</button>}
            </div>
          )}
          {read?.available && error && (
            <div className="memory__warning" role="status">
              {error} Showing the last good view.
              <button className="btn btn--ghost btn--mini" onClick={() => void load(true)}>Retry</button>
            </div>
          )}
          {read?.available && selected && <MemoryDetail group={selected} backRef={detailBackRef} onBack={() => setSelectedGroupKey(null)} />}
          {read?.available && !selected && (
            <>
              {runtime && <OperationsPanel runtime={runtime} />}
              <div className="memory__intro">
                <strong>One shared memory.</strong>
                <span>It keeps the conclusion, when it was known, what changed, and the source behind it.</span>
              </div>
              <div className="memory__controls">
                <label className="memory__search">
                  <span>Search memory</span>
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Company, commodity, decision…" />
                </label>
                {kinds.length > 1 && (
                  <label className="memory__kind">
                    <span>Kind</span>
                    <select value={kind} onChange={(event) => setKind(event.target.value)}>
                      <option value="">All kinds</option>
                      {kinds.map((value) => <option value={value} key={value}>{value}</option>)}
                    </select>
                  </label>
                )}
              </div>
              <div className="seg memory__tabs" role="radiogroup" aria-label="Memory cockpit">
                {(['all', 'research', 'screener', 'commodity'] as MemoryTab[]).map((tab) => {
                  const count = tab === 'all' ? read.counts.total : read.counts[tab]
                  return (
                    <button className={`seg__btn${cockpit === tab ? ' seg__btn--on' : ''}`} role="radio" aria-checked={cockpit === tab} onClick={() => setCockpit(tab)} key={tab}>
                      {tab === 'all' ? 'All' : COCKPIT_LABEL[tab]} {count.toLocaleString()}
                    </button>
                  )
                })}
              </div>

              {groups.length > 0 ? (
                <div className="memory__timeline" aria-label={`${groups.length} visible memory cards representing ${items.length} matching records`}>
                  {groups.map((group) => <MemoryCard group={group} buttonRef={(button) => rememberCard(group.key, button)} onOpen={() => {
                    selectedOpenerKeyRef.current = group.key
                    listScrollTopRef.current = bodyRef.current?.scrollTop ?? 0
                    setSelectedGroupKey(group.key)
                  }} key={group.key} />)}
                </div>
              ) : (
                <div className="bookempty memory__state">
                  <div className="bookempty__title">{filtersActive ? 'No memories match this search' : 'No memories have been recorded yet'}</div>
                  <div className="bookempty__body">
                    {filtersActive
                      ? 'Try fewer words, another cockpit, or all kinds.'
                      : 'Complete a research, screener or commodity run. Its reviewed result will appear here.'}
                  </div>
                  {filtersActive && <button className="btn" onClick={() => { setQuery(''); setCockpit('all'); setKind('') }}>Clear filters</button>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
