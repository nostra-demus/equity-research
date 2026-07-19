// The DATA PIPELINE builder — the interactive half of the data-needs loop, and the "place in the tab" that
// turns a surfaced data gap into a durable feed. It shows the run's recommended data (the needs capping
// conviction), lets you add a source (a website / API), runs a LIVE relevance scan you watch second by
// second — what is being fetched, what is being checked, and the verdict (exact / partial / none, which orb
// it feeds) — and then, one click, sends it to Claude to build a connector and open a PR. Distinct from the
// screener's PipelineBoard (that is the conviction pipeline). Same slide-in family as FeedbackPanel; the list
// + scan state are panel-local (no fresh-array store selectors). Gated GENERICALLY (data + admin), never a
// swarm id — so commodity and research both get it wherever a run surfaces needs.

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../lib/store'
import { api } from '../../lib/api'
import type { ConnectorsRead, DataNeed, FeedStatus, FeedStatusRow, PipelineSourceKind, PipelineStatus, PipelineView, ScanRelevance, ScanVerdict } from '../../lib/types'
import './DataPipelinePanel.css'

const KINDS: { id: PipelineSourceKind; label: string }[] = [
  { id: 'api', label: 'API' },
  { id: 'scrape', label: 'Scrape' },
  { id: 'web', label: 'Web page' },
]

const REL_LABEL: Record<ScanRelevance, string> = { exact: 'Exact match', partial: 'Partially helps', none: 'Not relevant' }
const REL_TONE: Record<ScanRelevance, string> = { exact: 'good', partial: 'accent', none: 'muted' }
const ACQ_LABEL: Record<string, string> = { official_api: 'official API', free_key_api: 'free API', paid_api: 'paid API', scrape: 'web scrape', manual: 'manual' }
const FEED_LABEL: Record<FeedStatus, string> = { live: 'live', stale: 'stale', broken: 'broken', repairing: 'repairing…', unknown: 'not run yet' }
const FEED_TONE: Record<FeedStatus, string> = { live: 'good', stale: 'accent', broken: 'bad', repairing: 'live', unknown: 'muted' }

function statusChip(v: PipelineView): { label: string; tone: string } {
  switch (v.status) {
    case 'scanning': return { label: 'Scanning…', tone: 'live' }
    case 'scanned': return v.verdict ? { label: REL_LABEL[v.verdict.relevance], tone: REL_TONE[v.verdict.relevance] } : { label: 'Scanned', tone: 'triaged' }
    case 'building': return { label: 'Building…', tone: 'live' }
    case 'pr_open': return { label: 'PR open', tone: 'good' }
    case 'assessed': return { label: 'Assessed', tone: 'triaged' }
    case 'done': return { label: 'Done', tone: 'good' }
    case 'wontfix': return { label: 'Not built', tone: 'muted' }
    default: return { label: 'New', tone: 'muted' }
  }
}

function ago(iso: string): string {
  const t = Date.parse(iso)
  if (!t) return ''
  const s = Math.max(0, Math.round((Date.now() - t) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`
}

function shortHost(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url.slice(0, 40) }
}

interface LiveScan {
  id: string
  url: string
  startedAt: number
  status: string
  activities: { tool: string; target: string }[]
  verdict: ScanVerdict | null
  error: string | null
  done: boolean
}

export function DataPipelinePanel() {
  const close = useStore((s) => s.closeDataPipeline)
  const setToast = useStore((s) => s.setToast)
  const subject = useStore((s) => s.selectedTicker)
  const swarm = useStore((s) => s.activeSwarm)
  const dataNeeds = useStore((s) => s.dataNeeds)
  const focusNeed = useStore((s) => s.dataPipelineFocusNeed)

  const needs: DataNeed[] = dataNeeds?.needs ?? []
  const buildableNeeds = needs.filter((n) => !n.filing_required)

  // gating — mirrors FeedbackPanel: hide the paid scan/build affordances unless the server says they're runnable.
  const [canScan, setCanScan] = useState(false)
  const [canBuild, setCanBuild] = useState(false)
  const [canRun, setCanRun] = useState(false)
  useEffect(() => {
    let alive = true
    api.whoami().then((w) => { if (alive) { setCanScan(!!w.canScanPipeline); setCanBuild(!!w.canBuildConnector); setCanRun(!!w.canRunConnectors) } }).catch(() => {})
    return () => { alive = false }
  }, [])

  // live feeds — the always-on layer's health for the connectors feeding THIS subject (panel-local poll).
  const [conns, setConns] = useState<ConnectorsRead | null>(null)
  const feedGen = useRef(0)
  const loadFeeds = useCallback(async () => {
    const gen = ++feedGen.current
    try {
      const r = await api.connectors()
      if (gen === feedGen.current) setConns(r)
    } catch { /* fail-closed: leave prior */ }
  }, [])
  useEffect(() => {
    let mounted = true
    void loadFeeds()
    const t = setInterval(() => { if (mounted) void loadFeeds() }, 15_000)
    return () => { mounted = false; clearInterval(t) }
  }, [loadFeeds])
  const subjectFeeds = (conns?.feeds ?? []).filter((f) => f.subject === (subject || '').toUpperCase())

  async function fetchNow(id: string, subj: string) {
    setToast({ msg: `Fetching ${id}…`, tone: 'good' })
    try { await api.runConnector(id, subj); await loadFeeds() } catch (e: any) { setToast({ msg: `Fetch failed: ${e?.message || 'error'}`, tone: 'bad' }); void loadFeeds() }
  }
  async function repairFeed(id: string, subj: string) {
    try { const r = await api.repairConnector(id, subj); setToast({ msg: r.message || 'Repair dispatched.', tone: r.ok ? 'good' : 'bad' }); void loadFeeds() } catch (e: any) { setToast({ msg: `Repair failed: ${e?.message || 'error'}`, tone: 'bad' }) }
  }

  // add-source form (panel-local)
  const [url, setUrl] = useState('')
  const [kind, setKind] = useState<PipelineSourceKind>('api')
  const [targetNeed, setTargetNeed] = useState<string>(focusNeed ?? '')
  const [seriesHint, setSeriesHint] = useState('')
  const [sample, setSample] = useState('')
  const [adding, setAdding] = useState(false)

  // ledger list (panel-local poll — ActivityLog pattern: guarded reqGen + mounted)
  const [items, setItems] = useState<PipelineView[] | null>(null)
  const [listError, setListError] = useState(false)
  const reqGen = useRef(0)
  const loadList = useCallback(async () => {
    if (!subject) return
    const gen = ++reqGen.current
    try {
      const rows = await api.pipeline(subject, swarm)
      if (gen === reqGen.current) { setItems(rows); setListError(false) }
    } catch {
      if (gen === reqGen.current) setListError(true)
    }
  }, [subject, swarm])
  useEffect(() => {
    let mounted = true
    void loadList()
    const t = setInterval(() => { if (mounted) void loadList() }, 12_000)
    return () => { mounted = false; clearInterval(t) }
  }, [loadList])

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  // live scan (panel-local): the streamed activity feed + verdict, and a ticking stopwatch.
  const [live, setLive] = useState<LiveScan | null>(null)
  const scanAbort = useRef<AbortController | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const scanning = !!live && !live.done
  useEffect(() => {
    if (!scanning) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const t = setInterval(() => setNow(Date.now()), reduce ? 1000 : 100)
    return () => clearInterval(t)
  }, [scanning])
  useEffect(() => () => { scanAbort.current?.abort() }, [])

  const startScan = useCallback((id: string, sourceUrl: string) => {
    if (!subject || !canScan) return
    scanAbort.current?.abort()
    const ac = new AbortController()
    scanAbort.current = ac
    setLive({ id, url: sourceUrl, startedAt: Date.now(), status: 'starting', activities: [], verdict: null, error: null, done: false })
    void api.pipelineScanStream(subject, swarm, id, {
      signal: ac.signal,
      onStatus: (s) => setLive((l) => (l && l.id === id ? { ...l, status: s.stage || l.status } : l)),
      onActivity: (a) => setLive((l) => {
        if (!l || l.id !== id) return l
        const last = l.activities[l.activities.length - 1]
        if (last && last.tool === a.tool && last.target === a.target) return l // dedup consecutive
        return { ...l, activities: [...l.activities, a].slice(-40) }
      }),
      onVerdict: (v) => { setLive((l) => (l && l.id === id ? { ...l, verdict: v, done: true } : l)); void loadList() },
      onError: (msg) => { setLive((l) => (l && l.id === id ? { ...l, error: msg, done: true } : l)); void loadList() },
      onEnd: () => setLive((l) => (l && l.id === id ? { ...l, done: true } : l)),
    })
  }, [subject, swarm, canScan, loadList])

  async function addSource() {
    if (!subject || !url.trim() || adding) return
    setAdding(true)
    try {
      const res = await api.addPipelineSource(subject, swarm, {
        source_url: url.trim(), source_kind: kind,
        need_id: targetNeed || null,
        series_hint: seriesHint.trim() || undefined,
        sample: sample.trim() || undefined,
      })
      setUrl(''); setSeriesHint(''); setSample('')
      await loadList()
      // watch it scan live, immediately — the "check if it's the exact one we need" step.
      if (canScan && res.item?.pipeline_id) startScan(res.item.pipeline_id, res.item.source_url)
      else setToast({ msg: 'Source added. Scanning is admin-only — an admin can scan it for relevance.', tone: 'good' })
    } catch (e: any) {
      setToast({ msg: e?.message === 'static-deploy' ? 'The pipeline builder needs the live engine.' : `Could not add the source: ${e?.message || 'error'}`, tone: 'bad' })
    } finally {
      setAdding(false)
    }
  }

  async function build(id: string) {
    setItems((cur) => (cur ? cur.map((it) => (it.pipeline_id === id ? { ...it, status: 'building' as PipelineStatus } : it)) : cur))
    try {
      const res = await api.buildConnector(id)
      setToast({ msg: res.message || 'Sent to the build engine.', tone: res.ok ? 'good' : 'bad' })
      void loadList()
    } catch (e: any) {
      setToast({ msg: `Could not start the build: ${e?.message || 'error'}`, tone: 'bad' })
      void loadList()
    }
  }

  const elapsed = live ? Math.max(0, (now - live.startedAt) / 1000) : 0
  const canAdd = !!subject && url.trim().length > 3 && !adding

  return (
    <motion.div
      className="dpipe"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="dpipe__head">
        <div style={{ minWidth: 0 }}>
          <div className="dpipe__title">Data Pipeline{subject ? <span className="dpipe__subj"> · {subject}</span> : null}</div>
          <div className="dpipe__sub">Add a source, watch it get checked for relevance live, then have a durable feed built into the right orb.</div>
        </div>
        <button className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
      </div>

      {!subject ? (
        <div className="dpipe__body"><div className="dpipe__empty">Pick a company or commodity first — the pipeline is scoped to one run's data needs.</div></div>
      ) : (
        <div className="dpipe__body">
          {/* Recommended data — the needs a run said were capping conviction. */}
          <section className="dpipe__sec">
            <div className="dpipe__sechead">Recommended data <span className="dpipe__count">{needs.length}</span></div>
            {needs.length === 0 ? (
              <div className="dpipe__hint">No open data needs surfaced yet for {subject}. You can still add any source below — the scan will tell you where it helps.</div>
            ) : (
              <div className="dpipe__needs">
                {needs.map((n) => (
                  <button
                    key={n.need_id}
                    className={`dpipe__need${targetNeed === n.need_id ? ' is-on' : ''}${n.filing_required ? ' is-filing' : ''}`}
                    onClick={() => { if (!n.filing_required) { setTargetNeed(n.need_id); setSeriesHint(n.series) } }}
                    title={n.filing_required ? 'Only a filing can close this — no connector can satisfy it.' : 'Target this need with a source below'}
                    disabled={n.filing_required}
                  >
                    <span className="dpipe__needseries">{n.series}</span>
                    <span className="dpipe__needmeta">
                      <span className="dpipe__needorb">{n.entry_modules.join(', ') || 'orb t.b.d.'}</span>
                      {n.built_by ? <span className="dpipe__needbuilt" title={`connector ${n.built_by} already feeds this`}>feed built ✓</span>
                        : n.filing_required ? <span className="dpipe__needfiling">filing · advisory</span>
                          : <span className="dpipe__needtier">tier {n.tier}</span>}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Live feeds — the always-on layer: every built connector feeding this subject, and its health. */}
          <section className="dpipe__sec">
            <div className="dpipe__sechead">
              Live feeds <span className="dpipe__count">{subjectFeeds.length}</span>
              {conns?.status && (
                <span className="dpipe__runner" title={conns.status.lastSweepAt ? `last swept ${feedAgo(conns.status.lastSweepAt)}` : undefined}>
                  {conns.status.enabled ? `runner on · every ${conns.status.pollIntervalMin}m${conns.status.autoRepair ? ' · auto-repair' : ''}` : 'runner off'}
                </span>
              )}
            </div>
            {subjectFeeds.length === 0 ? (
              <div className="dpipe__hint">No live feeds for {subject} yet — build one below and it appears here, refreshing on its cadence.{conns && !conns.status.enabled ? ' (The cadence runner is off, so a built feed refreshes only when you fetch it or re-run analysis.)' : ''}</div>
            ) : (
              <div className="dpipe__list">
                {subjectFeeds.map((f) => <FeedRow key={f.connector_id + f.subject} f={f} canRun={canRun} canBuild={canBuild} onFetch={() => fetchNow(f.connector_id, f.subject)} onRepair={() => repairFeed(f.connector_id, f.subject)} />)}
              </div>
            )}
          </section>

          {/* Add a source. */}
          <section className="dpipe__sec">
            <div className="dpipe__sechead">Add a source</div>
            <div className="dpipe__seg" role="radiogroup" aria-label="Source kind">
              {KINDS.map((k) => (
                <button key={k.id} role="radio" aria-checked={kind === k.id} className={`dpipe__segbtn${kind === k.id ? ' is-on' : ''}`} onClick={() => setKind(k.id)}>{k.label}</button>
              ))}
            </div>
            <input className="dpipe__input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/… — a website or API endpoint" spellCheck={false} />
            <div className="dpipe__row">
              <select className="dpipe__select" value={targetNeed} onChange={(e) => setTargetNeed(e.target.value)} aria-label="Target need">
                <option value="">Any open need (let the scan decide)</option>
                {buildableNeeds.map((n) => <option key={n.need_id} value={n.need_id}>{n.series}</option>)}
              </select>
            </div>
            <input className="dpipe__input" value={seriesHint} onChange={(e) => setSeriesHint(e.target.value)} placeholder="What data does it provide? (optional)" />
            <textarea className="dpipe__text" value={sample} onChange={(e) => setSample(e.target.value)} rows={3} placeholder="Paste a sample row / JSON so the scan can judge the actual data shape (optional)" spellCheck={false} />
            <div className="dpipe__addactions">
              {!canScan && <span className="dpipe__gate">Scanning + building are admin-only on this server.</span>}
              <button className="btn btn--amber" disabled={!canAdd} onClick={addSource}>
                {adding ? 'Adding…' : canScan ? 'Add + scan for relevance ▸' : 'Add source'}
              </button>
            </div>
          </section>

          {/* Live scan — visible second by second. */}
          {live && (
            <section className="dpipe__sec dpipe__scan">
              <div className="dpipe__scanhead">
                <span className={`dpipe__dot${scanning ? ' is-live' : ''}`} aria-hidden />
                <span className="dpipe__scantitle">{scanning ? 'Scanning' : 'Scanned'} {shortHost(live.url)}</span>
                <span className="dpipe__clock">{elapsed.toFixed(scanning ? 1 : 0)}s</span>
              </div>
              {live.activities.length > 0 && (
                <ul className="dpipe__feed">
                  {live.activities.map((a, i) => (
                    <li key={i} className={`dpipe__feedrow${!scanning || i < live.activities.length - 1 ? ' is-done' : ' is-current'}`}>
                      <span className="dpipe__feedtool">{a.tool === 'WebFetch' ? 'fetching' : a.tool === 'WebSearch' ? 'searching' : a.tool === 'Read' ? 'reading' : a.tool}</span>
                      <span className="dpipe__feedtarget">{a.target}</span>
                    </li>
                  ))}
                </ul>
              )}
              {scanning && live.activities.length === 0 && <div className="dpipe__hint">Starting the scanner…</div>}
              {live.error && <div className="dpipe__err">{live.error}</div>}
              {live.verdict && <VerdictCard verdict={live.verdict} canBuild={canBuild} building={items?.find((it) => it.pipeline_id === live.id)?.status === 'building'} onBuild={() => build(live.id)} />}
            </section>
          )}

          {/* The ledger of sources added for this subject. */}
          <section className="dpipe__sec">
            <div className="dpipe__sechead">Sources <span className="dpipe__count">{items?.length ?? 0}</span></div>
            {items === null && !listError ? (
              <div className="dpipe__hint">Loading…</div>
            ) : listError && (!items || items.length === 0) ? (
              <div className="dpipe__empty">Couldn't load the pipeline. <button className="btn btn--ghost dpipe__mini" onClick={() => void loadList()}>Retry</button></div>
            ) : !items || items.length === 0 ? (
              <div className="dpipe__hint">No sources added yet. Add one above and watch it get checked.</div>
            ) : (
              <div className="dpipe__list">
                {items.map((it) => {
                  const chip = statusChip(it)
                  const scanned = it.status === 'scanned' || it.status === 'building' || it.status === 'pr_open' || it.status === 'assessed'
                  return (
                    <div className="dpipe__card" key={it.pipeline_id}>
                      <div className="dpipe__cardtop">
                        <a className="dpipe__cardurl" href={it.source_url} target="_blank" rel="noreferrer" title={it.source_url}>{shortHost(it.source_url)}</a>
                        <span className="dpipe__status" data-tone={chip.tone}>{chip.label}</span>
                        <span className="dpipe__cardmeta">{it.user_id === 'local' ? 'you' : it.user_id.split('@')[0]} · {ago(it.submitted_at)}</span>
                      </div>
                      {it.verdict && (
                        <div className="dpipe__cardverdict">
                          {it.verdict.series && <span className="dpipe__cardseries">{it.verdict.series}</span>}
                          {it.verdict.entry_modules.length > 0 && <span className="dpipe__cardorb">→ {it.verdict.entry_modules.join(', ')}</span>}
                          {it.verdict.confidence > 0 && <span className="dpipe__cardconf">{it.verdict.confidence}% sure</span>}
                        </div>
                      )}
                      {it.last_note && <div className="dpipe__cardnote">{it.last_note}</div>}
                      {it.pr_url && <a className="dpipe__pr" href={it.pr_url} target="_blank" rel="noreferrer">View pull request ↗</a>}
                      <div className="dpipe__cardactions">
                        {canScan && (it.status === 'new' || it.status === 'scanned' || it.status === 'assessed') && (live?.id !== it.pipeline_id || live?.done) && (
                          <button className="btn btn--ghost dpipe__mini" onClick={() => startScan(it.pipeline_id, it.source_url)}>{scanned ? 'Re-scan' : 'Scan ▸'}</button>
                        )}
                        {canBuild && scanned && it.verdict?.buildable && it.status !== 'building' && it.status !== 'pr_open' && (
                          <button className="btn btn--amber dpipe__mini" title="Send to Claude — it builds a connector and opens a pull request" onClick={() => build(it.pipeline_id)}>Build feed ▸</button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </motion.div>
  )
}

function feedAgo(iso: string | null): string {
  if (!iso) return 'never'
  return ago(iso)
}

function FeedRow({ f, canRun, canBuild, onFetch, onRepair }: { f: FeedStatusRow; canRun: boolean; canBuild: boolean; onFetch: () => void; onRepair: () => void }) {
  const needsRepair = f.status === 'broken' || f.status === 'stale'
  return (
    <div className="dpipe__card">
      <div className="dpipe__cardtop">
        <span className="dpipe__cardurl" title={f.connector_id}>{f.series || f.connector_id}</span>
        <span className="dpipe__status" data-tone={FEED_TONE[f.status]}>{FEED_LABEL[f.status]}</span>
        <span className="dpipe__cardmeta">{f.cadence}</span>
      </div>
      <div className="dpipe__cardverdict">
        <span className="dpipe__cardseries">updated {feedAgo(f.last_ok_at)}{f.last_as_of ? ` · data ${f.last_as_of}` : ''}</span>
        {f.consecutive_failures > 0 && <span className="dpipe__cardconf">{f.consecutive_failures} fail{f.consecutive_failures === 1 ? '' : 's'} in a row</span>}
      </div>
      {f.repair_pr_url && <a className="dpipe__pr" href={f.repair_pr_url} target="_blank" rel="noreferrer">View repair PR ↗</a>}
      <div className="dpipe__cardactions">
        {canRun && <button className="btn btn--ghost dpipe__mini" onClick={onFetch}>Fetch now</button>}
        {canBuild && needsRepair && f.status !== 'repairing' && <button className="btn btn--amber dpipe__mini" title="Send this broken feed to Claude to fix + open a PR" onClick={onRepair}>Repair ▸</button>}
      </div>
    </div>
  )
}

function VerdictCard({ verdict, canBuild, building, onBuild }: { verdict: ScanVerdict; canBuild: boolean; building?: boolean; onBuild: () => void }) {
  const tone = REL_TONE[verdict.relevance]
  return (
    <div className={`dpipe__vcard dpipe__vcard--${tone}`}>
      <div className="dpipe__vtop">
        <span className="dpipe__vrel" data-tone={tone}>{REL_LABEL[verdict.relevance]}</span>
        {verdict.confidence > 0 && <span className="dpipe__vconf">{verdict.confidence}% confident</span>}
        <span className="dpipe__vtier">tier {verdict.tier} · {ACQ_LABEL[verdict.acquisition] ?? (verdict.acquisition || '—')}</span>
      </div>
      {verdict.series && <div className="dpipe__vseries">{verdict.series}</div>}
      {verdict.entry_modules.length > 0 && <div className="dpipe__vorb">Feeds: {verdict.entry_modules.join(', ')}{verdict.cadence ? ` · ${verdict.cadence}` : ''}</div>}
      {verdict.verdict_note && <div className="dpipe__vnote">{verdict.verdict_note}</div>}
      {verdict.relevance !== 'none' && verdict.buildable && canBuild && (
        <button className="btn btn--amber dpipe__vbuild" disabled={building} onClick={onBuild}>{building ? 'Building…' : 'Send to Claude to build ▸'}</button>
      )}
      {verdict.relevance !== 'none' && !verdict.buildable && <div className="dpipe__vnobuild">No durable public connector can be built for this (login / paywall / no stable endpoint).</div>}
    </div>
  )
}
