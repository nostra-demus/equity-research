import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useStore } from '../lib/store'
import { api } from '../lib/api'
import { captureAskOpener } from '../lib/askFocus'
import { buildReportHtml, parseMeta, safeName } from '../lib/export'
import { buildDocxBlob } from '../lib/docx'
import { fmtClock } from '../lib/eta'
import { CONSTITUTION_PATH, moduleOfNodeKey, moduleRulesPath, promptFileName, promptPathForNodeKey, splitFrontmatter } from '../lib/prompts'
import { reportIntegrityView } from '../lib/reportIntegrity'
import { Spin } from './Spin'

const IMPROVE_EMAIL = 'ceekay@muns.io'
const titleize = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

interface PromptRow { path: string; label: string; sub: string; blurb: string }
interface PromptSource { path: string; label: string; blurb: string }

// the SIG id a screener report's own path belongs to (run_root_template is `screener/runs/{SIG_ID}` — see
// .claude/agents/screener/SWARM.md). A report opened via openCallFile (pipeline board / activity menu)
// carries only a path/title, no nodeKey, so this is the only way to know which run it actually came from.
const SIG_FROM_PATH_RE = /^screener\/runs\/([^/]+)\//
function sigFromOutputPath(path?: string): string | undefined {
  return SIG_FROM_PATH_RE.exec(path || '')?.[1]
}

export function OutputReader({ output }: { output: { path?: string; title: string; verdict?: string | null; nodeKey?: string; pending?: boolean; body?: string; embedUrl?: string; publishedCalls?: boolean } }) {
  const close = useStore((s) => s.closeOutput)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const researchNodes = useStore((s) => s.nodesByKey)
  const scNodes = useStore((s) => s.scNodesByKey)
  const nodesByKey = activeSwarm === 'screener' ? scNodes : researchNodes
  const researchNodeStatus = useStore((s) => s.nodeStatus)
  const scNodeStatus = useStore((s) => s.scNodeStatus)
  const nodeStatus = activeSwarm === 'screener' ? scNodeStatus : researchNodeStatus
  const launchRerun = useStore((s) => s.launchRerun)
  const launchAgent = useStore((s) => s.launchAgent)
  const launchModule = useStore((s) => s.launchModule)
  const openChat = useStore((s) => s.openChat)
  const scSelectedSignal = useStore((s) => s.scSelectedSignal)
  const scSelectSignal = useStore((s) => s.scSelectSignal)
  const setToast = useStore((s) => s.setToast)
  const launchPending = useStore((s) => s.launchPending)
  const nodeRuntime = useStore((s) => s.nodeRuntime)
  const now = useStore((s) => s.now) // shared 1s clock — ticks while any orb runs
  const [md, setMd] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [menu, setMenu] = useState(false)
  const [promptMenu, setPromptMenu] = useState(false)
  // prompt view: people can read + download the exact instructions an orb/module runs on, then send back
  // a sharper version. The body toggles between the orb's OUTPUT and its PROMPT.
  const [promptView, setPromptView] = useState(false)
  const [promptMd, setPromptMd] = useState<string | null>(null)
  const [promptLoading, setPromptLoading] = useState(false)
  const [promptSource, setPromptSource] = useState<PromptSource | null>(null)
  const reportView = useMemo(() => reportIntegrityView(md), [md])

  useEffect(() => {
    // Content the caller already holds (a watchlist thesis attachment: it lives under a reserved data
    // folder, which api.output deliberately cannot read) renders directly — same pipeline, no fetch.
    if (output.embedUrl) { setMd(''); setLoading(false); return } // rendered by the viewer, not fetched
    if (output.body != null) { setMd(output.body); setLoading(false); return }
    const path = output.path
    if (!path) { setMd(''); setLoading(false); return } // pending (not-yet-run) node — nothing to fetch
    setLoading(true)
    setMd('')
    // A fetch already in flight when the panel switches documents must not land on the NEW one. Without
    // this the previous report's markdown arrives late and overwrites the body — visibly so once an
    // embedded PDF is on screen, where a stale report-integrity banner would appear above someone else's
    // document. The guard is per-effect-run, so only the newest fetch may write.
    let live = true
    const readPromise = output.publishedCalls ? api.callArtifact(path) : api.output(path)
    readPromise
      .then((r) => { if (live) setMd(typeof r?.markdown === 'string' ? r.markdown : '*Could not load this output.*') })
      .catch(() => { if (live) setMd('*Could not load this output.*') })
      .finally(() => { if (live) setLoading(false) })
    return () => { live = false }
  }, [output.path, output.body, output.embedUrl, output.publishedCalls])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (promptView ? setPromptView(false) : close())
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, promptView])

  // which orb this panel is about: an agent node, the master synthesizer (the Memo), or none
  const isMaster = output.nodeKey === 'master/synthesizer'
  const agentNode = !isMaster && output.nodeKey ? nodesByKey.get(output.nodeKey) : undefined
  const rerunTarget: { module: string; name: string; key: string } | undefined = isMaster
    ? { module: 'master', name: 'synthesizer', key: 'master/synthesizer' }
    : agentNode
  // disable Run/Re-run only while THIS orb is in flight (a different concurrent run no longer blocks it)
  const targetKey = output.pending ? agentNode?.key : rerunTarget?.key
  const tstatus = targetKey ? nodeStatus(targetKey) : 'dormant'
  const busy = tstatus === 'queued' || tstatus === 'running'
  // a launch fired FROM this panel that the server hasn't acked yet — the instant-feedback window
  const pendingHere = !!launchPending && (
    launchPending.key === `agent:${agentNode?.key ?? ''}` ||
    launchPending.key === `module:${agentNode?.module ?? ''}` ||
    launchPending.key === 'confirm'
  )
  // live elapsed for the header chip while THIS orb runs (server-stamped start, shared 1s clock)
  const runStartedAt = targetKey ? nodeRuntime[targetKey]?.startedAt : undefined
  const runElapsed = tstatus === 'running' && runStartedAt ? fmtClock(Math.max(0, now - runStartedAt)) : null

  // the prompt(s) reachable from this panel: the orb's own prompt, its module's shared rules (if any),
  // and the engine constitution. Derived purely from the node key (+ the active swarm's agents root,
  // since swarm modules nest one folder deeper), so a new module or swarm needs no wiring.
  const promptPath = promptPathForNodeKey(output.nodeKey, activeSwarm)
  const ownModule = moduleOfNodeKey(output.nodeKey)
  const promptRows = useMemo<PromptRow[]>(() => {
    if (!promptPath) return []
    const rows: PromptRow[] = [
      { path: promptPath, label: "This orb's prompt", sub: 'the exact instructions it runs on', blurb: `This is the exact prompt the “${output.title}” orb runs on, word for word.` },
    ]
    if (ownModule) rows.push({ path: moduleRulesPath(ownModule, activeSwarm), label: `${titleize(ownModule)} rules`, sub: 'shared rules for this module', blurb: `These are the shared rules every orb in the ${titleize(ownModule)} module follows.` })
    rows.push({ path: CONSTITUTION_PATH, label: 'Engine constitution', sub: 'the cross-cutting doctrine', blurb: 'This is the engine-wide doctrine every module and orb is held to.' })
    return rows
  }, [promptPath, ownModule, output.title, activeSwarm])

  const mailtoFor = (src: { path: string; label: string }) =>
    `mailto:${IMPROVE_EMAIL}?subject=${encodeURIComponent(`Prompt improvement — ${src.path}`)}&body=${encodeURIComponent(
      `Prompt: ${src.path}\nFrom: ${output.title}\n\nWhat I'd change:\n\n\nWhy it's sharper:\n\n`,
    )}`

  // All exports are generated client-side from the loaded markdown, so they work
  // identically with the local control plane and on the static Cloudflare showcase
  // (which has no /api backend). The styling matches ui/server/src/export.ts.
  const meta = parseMeta(output.path || '', output.title, output.verdict)
  const saveBlob = (blob: Blob, filename: string) => {
    const u = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = u
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(u), 2000)
  }
  const onPDF = () => {
    if (!md) return
    const html = buildReportHtml(md, meta, { print: true })
    const w = window.open('', '_blank')
    if (w) {
      w.document.open()
      w.document.write(html)
      w.document.close()
    } else {
      // popup blocked — hand the user a self-contained HTML file they can open & print
      saveBlob(new Blob([buildReportHtml(md, meta)], { type: 'text/html;charset=utf-8' }), `${safeName(meta)}.html`)
    }
    setMenu(false)
  }
  const onWord = async () => {
    if (!md) return
    setMenu(false)
    try {
      const blob = await buildDocxBlob(md, meta) // real Office Open XML (.docx)
      saveBlob(blob, `${safeName(meta)}.docx`)
    } catch {
      // last-resort fallback: hand over the styled HTML report instead of failing silently
      saveBlob(new Blob([buildReportHtml(md, meta)], { type: 'text/html;charset=utf-8' }), `${safeName(meta)}.html`)
    }
  }
  const onHTML = () => {
    if (!md) return
    saveBlob(new Blob([buildReportHtml(md, meta)], { type: 'text/html;charset=utf-8' }), `${safeName(meta)}.html`)
    setMenu(false)
  }
  const onMD = () => {
    if (!md) return
    saveBlob(new Blob([md], { type: 'text/markdown;charset=utf-8' }), `${safeName(meta)}.md`)
    setMenu(false)
  }

  // open a prompt in the reader body (swaps OUTPUT -> PROMPT)
  const viewPrompt = (row: PromptRow) => {
    setPromptMenu(false)
    setMenu(false)
    setPromptView(true)
    setPromptSource({ path: row.path, label: row.label, blurb: row.blurb })
    setPromptLoading(true)
    setPromptMd(null)
    api
      .prompt(row.path)
      .then((r) => setPromptMd(r.markdown))
      .catch(() => setPromptMd('*Could not load this prompt.*'))
      .finally(() => setPromptLoading(false))
  }
  // download a prompt as raw .md (fetched fresh; reuses the loaded copy when it's the one on screen)
  const downloadPrompt = async (row: PromptRow) => {
    setPromptMenu(false)
    try {
      const text = promptSource?.path === row.path && promptMd ? promptMd : (await api.prompt(row.path)).markdown
      saveBlob(new Blob([text], { type: 'text/markdown;charset=utf-8' }), promptFileName(row.path))
    } catch {
      setToast({ msg: 'Could not download that prompt', tone: 'bad' })
    }
  }

  // status-aware run control, left of Download. Done -> Re-run (cascade). Not-yet-run -> Run / Run module.
  // Screener orbs have no in-panel run control (their pipeline is gate-driven; orb-level re-runs go
  // through /screener:agent) — never fall through to the RESEARCH launch actions from screener mode.
  function runButton() {
    if (activeSwarm !== 'research') return null
    // the click was heard: the button spins IN THE SAME FRAME (launchPending is set before the POST)
    if (pendingHere) return <button className="btn" style={{ height: 30 }} disabled><Spin /> Starting…</button>
    if (output.pending) {
      if (!agentNode) return null
      const status = nodeStatus(agentNode.key)
      if (status === 'ready' || status === 'failed') return <button className="btn btn--amber" style={{ height: 30 }} disabled={busy} onClick={() => launchAgent(agentNode)}>Run ▸</button>
      if (status === 'notready') return <button className="btn btn--amber" style={{ height: 30 }} disabled={busy} onClick={() => launchModule(agentNode.module)}>Run module ▸</button>
      if (status === 'queued' || status === 'running') return <button className="btn" style={{ height: 30 }} disabled><Spin /> Running{runElapsed ? ` · ${runElapsed}` : '…'}</button>
      return null // locked / dormant: no run affordance
    }
    if (!rerunTarget) return null
    if (busy) return <button className="btn" style={{ height: 30 }} disabled><Spin /> Running{runElapsed ? ` · ${runElapsed}` : '…'}</button>
    return <button className="btn btn--amber" style={{ height: 30 }} disabled={busy} onClick={() => launchRerun(rerunTarget)} title="Re-run this orb and everything downstream of it, to the Memo">Re-run ↻</button>
  }

  // Chat about THIS output — opens the side panel pre-scoped to the open orb / module / run, answered
  // only from what the engine already wrote. Swarm-generic: the scope (run/module/orb) is derived from the
  // open output's identity below, and openChat resolves the subject for the active swarm (a company/commodity
  // run, or a screener signal run). Never shown for a pending (not-yet-run) output — nothing to chat with.
  function chatButton() {
    if (output.pending) return null
    const onClick = async () => {
      if (isMaster) return openChat('run')
      if (agentNode?.isSynthesis) return openChat('module', { module: agentNode.module })
      if (output.nodeKey && /\/99_.*-synthesis$/.test(output.nodeKey)) return openChat('module', { module: moduleOfNodeKey(output.nodeKey) || undefined })
      if (agentNode) return openChat('orb', { module: agentNode.module, orbPath: output.path, orbKey: agentNode.key, title: `Ask · ${output.title}` })
      // Unkeyed report (opened via openCallFile from the pipeline board / activity menu — path/title only,
      // no nodeKey): for a screener report, don't trust whatever scSelectedSignal happens to be on the board
      // right now — derive the SIG this report actually belongs to from its own path, and select it first so
      // "Ask" always targets the run that's actually open, not a differently-selected one.
      if (activeSwarm === 'screener') {
        const sig = sigFromOutputPath(output.path)
        if (sig && sig !== scSelectedSignal) await scSelectSignal(sig)
      }
      return openChat('run')
    }
    return <button className="btn" style={{ height: 30 }} onClick={(event) => { captureAskOpener(event.currentTarget); void onClick() }} title="Ask questions about this output — answered only from what the engine wrote">Chat ▸</button>
  }

  // the Prompt control — view/download the exact instructions this orb + its module run on, so anyone
  // can read them and send back a sharper version. Sits right of the run control, left of Download.
  function promptButton() {
    if (!promptRows.length) return null
    return (
      <div style={{ position: 'relative' }}>
        <button
          className={`btn${promptView ? ' btn--amber' : ''}`}
          style={{ height: 30 }}
          aria-expanded={promptMenu}
          onClick={() => { setPromptMenu((o) => !o); setMenu(false) }}
          title="View or download the prompt behind this orb"
        >
          Prompt ▾
        </button>
        {promptMenu && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 51 }} onClick={() => setPromptMenu(false)} />
            <div className="dlmenu pmenu">
              <div className="pmenu__label">View · or ↓ to download (.md)</div>
              {promptRows.map((row) => (
                <div className="pmenu__row" key={row.path}>
                  <button className="pmenu__view" onClick={() => viewPrompt(row)}>
                    <b>{row.label}</b>
                    <span>{row.sub}</span>
                  </button>
                  <button className="pmenu__dl" title={`Download ${row.label} (.md)`} aria-label={`Download ${row.label}`} onClick={() => downloadPrompt(row)}>↓</button>
                </div>
              ))}
              <a className="pmenu__hint" href={mailtoFor(promptRows[0])}>
                Made it sharper? Email it back ↗
              </a>
            </div>
          </>
        )}
      </div>
    )
  }

  // body for a not-yet-run orb (no markdown to show) — explains what Run will do
  function pendingBody() {
    const status = agentNode ? nodeStatus(agentNode.key) : 'dormant'
    const live = status === 'queued' || status === 'running'
    // never say "hasn't been run yet" about an orb that is running RIGHT NOW (the old contradictory copy)
    const lead = live
      ? status === 'running'
        ? `This orb is running now${runElapsed ? ` — ${runElapsed} in` : ''}. Its output opens here the moment it finishes; the run panel on the left tracks it live.`
        : 'This orb is queued — the engine will start it as soon as its turn comes. Its output opens here when it finishes.'
      : `This orb hasn't been run yet. ${
          status === 'ready' || status === 'failed' ? 'Run it to produce its output.'
          : status === 'notready' ? 'It needs upstream outputs — running its module produces them first.'
          : status === 'locked' ? `No data for ${agentNode?.module ?? 'this module'} — add files to the Drive folder, then run.`
          : 'Select a ticker with data to run this orb.'
        }`
    return (
      <div className="md">
        <p style={{ color: 'var(--text-muted)' }}>{lead}</p>
        {agentNode?.description && <p style={{ color: 'var(--text-faint)' }}>{agentNode.description}</p>}
        {promptPath && <p style={{ color: 'var(--text-faint)' }}>You can {live ? 'read its prompt while it runs' : 'still read its prompt'} — use <b>Prompt ▾</b> above to see exactly what it {live ? 'is doing' : 'will do'}.</p>}
      </div>
    )
  }

  // body when viewing a prompt — an explainer banner + the prompt itself (frontmatter shown as a card)
  function promptBody() {
    const doc = splitFrontmatter(promptMd ?? '')
    return (
      <>
        <div className="promptbanner">
          <div className="promptbanner__top">
            <span className="promptbanner__tag">Prompt</span>
            <button className="promptbanner__back" onClick={() => setPromptView(false)}>‹ {output.pending ? 'Overview' : 'Output'}</button>
          </div>
          <div className="promptbanner__blurb">{promptSource?.blurb} Spot a sharper version? Download it, edit, and send it back.</div>
          <div className="promptbanner__foot">
            <code>{promptSource?.path}</code>
            {promptSource && <a className="promptbanner__mail" href={mailtoFor(promptSource)}>Email an improvement ↗</a>}
          </div>
        </div>
        {promptLoading ? (
          <div style={{ color: 'var(--text-faint)' }}>Loading prompt…</div>
        ) : (
          <div className="md">
            {doc.meta.length > 0 && (
              <dl className="fm">
                {doc.meta.map(([k, v]) => (
                  <div className="fm__row" key={k}>
                    <dt className="fm__k">{k}</dt>
                    <dd className="fm__v">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.body}</ReactMarkdown>
          </div>
        )}
      </>
    )
  }

  return (
    <motion.div className="reader" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="reader__head">
        <div style={{ minWidth: 0 }}>
          <div className="reader__title">
            {/* the chip tells the truth about NOW: a running orb never wears a stale "Not run" */}
            {busy || pendingHere ? (
              <span className="reader__running">● {tstatus === 'queued' && !pendingHere ? 'Queued' : 'Running'}{runElapsed ? ` · ${runElapsed}` : ''}</span>
            ) : output.pending ? (
              <span className="reader__pending">○ Not run</span>
            ) : (
              <span className="reader__done">✓ Completed</span>
            )}{' '}
            {output.title}
          </div>
          {output.verdict ? <div className="reader__verdict">{output.verdict}</div> : output.path ? <div className="reader__path">{output.path}</div> : null}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {runButton()}
          {chatButton()}
          {promptButton()}
          {/* An embedded document has no markdown behind it, so the four export items (all of which are
              built FROM the markdown and bail on an empty body) would be a menu where every click does
              nothing. Hand over the file itself instead — same origin, so `download` applies. */}
          {output.embedUrl ? (
            <a className="btn" style={{ height: 30, display: 'inline-flex', alignItems: 'center' }} href={output.embedUrl} download>Download</a>
          ) : !output.pending && (
            <div style={{ position: 'relative' }}>
              <button className="btn" style={{ height: 30 }} aria-expanded={menu} onClick={() => { setMenu((o) => !o); setPromptMenu(false) }}>Download ▾</button>
              {menu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 51 }} onClick={() => setMenu(false)} />
                  <div className="dlmenu">
                    <button className="dlmenu__item" onClick={onPDF}><b>PDF</b><span>print-ready · opens & prints</span></button>
                    <button className="dlmenu__item" onClick={onWord}><b>Word</b><span>.docx document</span></button>
                    <button className="dlmenu__item" onClick={onHTML}><b>HTML</b><span>self-contained report</span></button>
                    <button className="dlmenu__item" onClick={onMD}><b>Markdown</b><span>raw .md source</span></button>
                  </div>
                </>
              )}
            </div>
          )}
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={close}>Close ✕</button>
        </div>
      </div>
      <div className="reader__body">
        {promptView ? promptBody() : output.pending ? pendingBody() : loading ? (
          <div style={{ color: 'var(--text-faint)' }}>Loading…</div>
        ) : (
          <>
            {reportView.warning && (
              <section className="reportcheck" role="region" aria-label="Report integrity warning">
                <strong>This report is not ready to use</strong>
                <p>Some checks failed. Fix them, then run the report again.</p>
                <details>
                  <summary>Show what failed</summary>
                  <div className="reportcheck__details md">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportView.warning.details}</ReactMarkdown>
                  </div>
                </details>
              </section>
            )}
            {output.embedUrl ? (
              /* The browser's own PDF viewer, EMBEDDED. A top-level navigation to a PDF is what Chrome's
                 "download PDFs instead of opening them" setting intercepts — no response header can
                 override that — but an embedded frame still renders, so this works whatever the reader
                 has configured. `sandbox` is deliberately omitted: it creates an opaque origin, which is
                 the very thing that stops Chrome's viewer from rendering (chromium 40328564). */
              <iframe className="out__embed" src={output.embedUrl} title={output.title} />
            ) : (
              <div className="md">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportView.body}</ReactMarkdown>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
