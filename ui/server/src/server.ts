import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import chokidar from 'chokidar'
import cors from '@fastify/cors'
import { execa } from 'execa'
import Fastify, { type FastifyReply } from 'fastify'
import { z } from 'zod'
import { buildReportHtml, parseMeta, safeName } from './export'
import { DATA_DIR, HOST, PORT, REPO_ROOT, WEB_DIST } from './config'
import { getCreditStatus } from './credit'
import { analyzeTicker, listTickers } from './data-status'
import { cancel, creditCheck, estimate, launch } from './launcher'
import { getRun, listRuns, subscribe, unsubscribe, type SseClient } from './registry'
import { agentNamesForModule, buildSwarmGraph, graphForTicker, listModuleNames } from './roster'
import { listRunsForTicker, readDecision, readMarkdown, readPrompt, resolveRunRoot, runManifest } from './outputs'
import { AGENT_RE, MODULE_RE, TICKER_RE } from './sandbox'
import type { RunKind } from './types'

const app = Fastify({ logger: false })
await app.register(cors, { origin: true })

// ---------- SSE helper ----------
function startSSE(reply: FastifyReply) {
  reply.hijack()
  const res = reply.raw
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  res.write(': connected\n\n')
  const send = (event: any) => {
    try {
      res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`)
    } catch {}
  }
  const ping = setInterval(() => {
    try {
      res.write(': keep-alive\n\n')
    } catch {}
  }, 15000)
  return { res, send, ping }
}

// ---------- health ----------
// no-store so a browser/proxy never serves a stale 200 that would mask an outage from the heartbeat.
app.get('/api/health', async (_req, reply) => {
  reply.header('cache-control', 'no-store')
  return { ok: true, repoRoot: REPO_ROOT }
})

// ---------- swarm graph ----------
app.get('/api/swarm', async (req) => {
  const ticker = (req.query as any)?.ticker as string | undefined
  if (ticker && TICKER_RE.test(ticker)) return graphForTicker(ticker)
  return buildSwarmGraph()
})

// ---------- tickers ----------
app.get('/api/tickers', async () => listTickers())

// ---------- data status ----------
app.get('/api/data-status/:ticker', async (req, reply) => {
  const ticker = (req.params as any).ticker as string
  if (!TICKER_RE.test(ticker)) return reply.code(400).send({ error: 'bad ticker' })
  return analyzeTicker(ticker)
})

// ---------- credit ----------
app.get('/api/credit', async () => getCreditStatus())
app.post('/api/credit-check', async () => creditCheck())

// ---------- launch estimate ----------
app.get('/api/launch/estimate', async (req, reply) => {
  const q = req.query as any
  const kind = q.kind as RunKind
  if (!['full', 'module', 'agent', 'rerun'].includes(kind)) return reply.code(400).send({ error: 'bad kind' })
  if (!TICKER_RE.test(q.ticker || '')) return reply.code(400).send({ error: 'bad ticker' })
  return estimate(kind, q.ticker, q.module, q.agent)
})

// ---------- launch ----------
const LaunchBody = z.object({
  kind: z.enum(['full', 'module', 'agent', 'rerun']),
  ticker: z.string().regex(TICKER_RE),
  module: z.string().regex(MODULE_RE).optional(),
  agent: z.string().regex(AGENT_RE).optional(),
  model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i).optional(),
  confirmTicker: z.string().optional(),
})

app.post('/api/launch', async (req, reply) => {
  const parsed = LaunchBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const { kind, ticker, module, agent, model, confirmTicker } = parsed.data

  // closed allow-list checks against the live roster + data pool
  const tickers = listTickers().tickers.map((t) => t.ticker)
  if (!tickers.includes(ticker)) return reply.code(400).send({ error: `unknown ticker ${ticker}` })
  if (kind !== 'full' && kind !== 'rerun') {
    if (!module || !listModuleNames().includes(module)) return reply.code(400).send({ error: 'unknown module' })
  }
  if (kind === 'agent') {
    if (!agent || !agentNamesForModule(module!).includes(agent)) return reply.code(400).send({ error: 'unknown agent for module' })
  }
  if (kind === 'rerun') {
    // rerun needs an orb (module+agent). 'master' is the Memo (master synthesizer) — not a module dir, so skip the roster check for it.
    if (!module || !agent) return reply.code(400).send({ error: 'rerun requires module and agent' })
    if (module !== 'master') {
      if (!listModuleNames().includes(module)) return reply.code(400).send({ error: 'unknown module' })
      if (!agentNamesForModule(module).includes(agent)) return reply.code(400).send({ error: 'unknown agent for module' })
    }
  }
  if (kind === 'full' && confirmTicker !== ticker) {
    return reply.code(412).send({ error: 'full run requires typed confirmation', detail: 'send confirmTicker === ticker' })
  }

  try {
    const out = await launch({ kind, ticker, module, agent, model })
    return out
  } catch (e: any) {
    // Forward the discriminated admission-rejection body (code/reason/detail) so the client can
    // branch the toast precisely; falls back to a plain message for other failures.
    const body = e?.body && typeof e.body === 'object' ? e.body : null
    return reply.code(e?.statusCode || 500).send({ error: e?.message || 'launch failed', ...(body || {}) })
  }
})

// ---------- run stream (SSE) ----------
app.get('/api/runs/:runId/stream', (req, reply) => {
  const run = getRun((req.params as any).runId)
  if (!run) {
    reply.code(404).send({ error: 'no such run' })
    return
  }
  const { send, ping } = startSSE(reply)
  const client: SseClient = { id: randomUUID(), send }
  subscribe(run, client)
  req.raw.on('close', () => {
    clearInterval(ping)
    unsubscribe(run, client)
  })
})

// ---------- run snapshot ----------
app.get('/api/runs/:runId', async (req, reply) => {
  const run = getRun((req.params as any).runId)
  if (!run) return reply.code(404).send({ error: 'no such run' })
  return {
    runId: run.runId,
    kind: run.kind,
    ticker: run.ticker,
    module: run.module,
    agent: run.agent,
    status: run.status,
    runRoot: run.runRoot,
    costUsd: run.costUsd,
    numTurns: run.numTurns,
    durationMs: run.durationMs,
    agents: [...run.agents.values()],
    expected: [...run.expected.values()],
    willCommitToMain: run.willCommitToMain,
    coveredModules: run.coveredModules,
    writeTargetsAbs: run.writeTargetsAbs,
    prompt: run.prompt,
    startedAt: run.startedAt,
    endedAt: run.endedAt,
  }
})

// ---------- cancel ----------
app.post('/api/runs/:runId/cancel', async (req, reply) => {
  const ok = await cancel((req.params as any).runId)
  if (!ok) return reply.code(404).send({ error: 'no such run / already ended' })
  return { ok: true, status: 'cancelled' }
})

// ---------- active runs list ----------
app.get('/api/runs', async (req) => {
  const ticker = (req.query as any)?.ticker as string | undefined
  if (ticker && TICKER_RE.test(ticker)) return { history: listRunsForTicker(ticker) }
  return {
    active: listRuns()
      .filter((r) => r.status === 'starting' || r.status === 'running')
      .map((r) => ({ runId: r.runId, kind: r.kind, ticker: r.ticker, module: r.module, status: r.status })),
  }
})

// ---------- outputs (path-sandboxed) ----------
app.get('/api/output', async (req, reply) => {
  const p = (req.query as any)?.path as string
  if (!p || !p.startsWith('analyses/')) return reply.code(400).send({ error: 'path must be under analyses/' })
  try {
    return readMarkdown(p)
  } catch (e: any) {
    return reply.code(e?.code === 'ENOENT' ? 404 : 400).send({ error: 'cannot read', detail: String(e?.message || e) })
  }
})

// ---------- prompts (read-only doctrine surface: agent/module/constitution .md) ----------
// Serves the exact instructions each orb / module runs on so they can be reviewed, downloaded, and
// improved. Sandboxed by resolveInsidePrompts to .claude/agents/, frameworks/, and the root CLAUDE.md.
app.get('/api/prompt', async (req, reply) => {
  const p = (req.query as any)?.path as string
  if (!p) return reply.code(400).send({ error: 'path required' })
  try {
    return readPrompt(p)
  } catch (e: any) {
    return reply.code(e?.code === 'ENOENT' ? 404 : 400).send({ error: 'cannot read prompt', detail: String(e?.message || e) })
  }
})

app.get('/api/output/thesis', async (req, reply) => {
  const q = req.query as any
  const runRoot = resolveRunRoot({ runRoot: q.runRoot, ticker: q.ticker, date: q.date })
  if (!runRoot) return reply.code(404).send({ error: 'no run found' })
  try {
    return readMarkdown(`${runRoot}/final_thesis.md`)
  } catch {
    return reply.code(404).send({ error: 'no final_thesis.md' })
  }
})

app.get('/api/output/decision', async (req, reply) => {
  const q = req.query as any
  const runRoot = resolveRunRoot({ runRoot: q.runRoot, ticker: q.ticker, date: q.date })
  if (!runRoot) return reply.code(404).send({ error: 'no run found' })
  try {
    return readDecision(runRoot)
  } catch {
    return reply.code(404).send({ error: 'no decision_record.json' })
  }
})

app.get('/api/output/run', async (req, reply) => {
  const q = req.query as any
  const runRoot = resolveRunRoot({ runRoot: q.runRoot, ticker: q.ticker, date: q.date })
  if (!runRoot) return reply.code(404).send({ error: 'no run found' })
  try {
    return runManifest(runRoot)
  } catch (e: any) {
    return reply.code(400).send({ error: 'cannot read run', detail: String(e?.message || e) })
  }
})

// ---------- export a saved output as a polished document (HTML / print-PDF / Word) ----------
app.get('/api/export', async (req, reply) => {
  const q = req.query as any
  const p = q.path as string
  if (!p || !p.startsWith('analyses/') || !p.endsWith('.md')) return reply.code(400).send({ error: 'path must be an analyses/*.md file' })
  let markdown: string
  try {
    markdown = readMarkdown(p).markdown
  } catch (e: any) {
    return reply.code(e?.code === 'ENOENT' ? 404 : 400).send({ error: 'cannot read', detail: String(e?.message || e) })
  }
  const meta = parseMeta(p)
  if (q.title) meta.title = String(q.title).slice(0, 160)
  if (q.verdict) meta.verdict = String(q.verdict).slice(0, 400)
  const html = buildReportHtml(markdown, meta, { print: q.print === '1' })

  if ((q.format || 'html') !== 'docx') {
    if (q.dl === '1') reply.header('Content-Disposition', `attachment; filename="${safeName(meta)}.html"`)
    return reply.header('Content-Type', 'text/html; charset=utf-8').send(html)
  }

  // DOCX via macOS textutil (HTML -> docx). Falls back to 500 if textutil is unavailable.
  const stamp = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`
  const htmlPath = path.join(os.tmpdir(), `nsw_${stamp}.html`)
  const docxPath = path.join(os.tmpdir(), `nsw_${stamp}.docx`)
  try {
    fs.writeFileSync(htmlPath, html)
    await execa('textutil', ['-convert', 'docx', htmlPath, '-output', docxPath], { timeout: 20000 })
    const buf = fs.readFileSync(docxPath)
    reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    reply.header('Content-Disposition', `attachment; filename="${safeName(meta)}.docx"`)
    return reply.send(buf)
  } catch (e: any) {
    return reply.code(500).send({ error: 'docx conversion failed', detail: String(e?.message || e) })
  } finally {
    try { fs.unlinkSync(htmlPath) } catch {}
    try { fs.unlinkSync(docxPath) } catch {}
  }
})

// ---------- data folder watcher -> data-status SSE ----------
const dataClients = new Set<{ send: (e: any) => void }>()
app.get('/api/data-status/stream', (req, reply) => {
  const { send, ping } = startSSE(reply)
  const client = { send }
  dataClients.add(client)
  send({ type: 'data-watch-connected', ts: Date.now() })
  req.raw.on('close', () => {
    clearInterval(ping)
    dataClients.delete(client)
  })
})

function broadcastData(fp: string, change: 'added' | 'removed') {
  let rel: string
  try {
    rel = path.relative(DATA_DIR, fp)
  } catch {
    return
  }
  const ticker = rel.split(path.sep)[0]
  if (!ticker || ticker.startsWith('..')) return
  const evt = { type: 'data-changed', ticker, change, ts: Date.now() }
  for (const c of dataClients) {
    try {
      c.send(evt)
    } catch {}
  }
}

if (fs.existsSync(DATA_DIR)) {
  // data/ is a Google Drive CloudStorage mount -> polling is the robust choice across the FUSE boundary
  const dataWatcher = chokidar.watch(DATA_DIR, {
    ignoreInitial: true,
    usePolling: true,
    interval: 1500,
    depth: 2,
    awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 500 },
  })
  dataWatcher.on('add', (f) => broadcastData(f, 'added'))
  dataWatcher.on('addDir', (f) => broadcastData(f, 'added'))
  dataWatcher.on('unlink', (f) => broadcastData(f, 'removed'))
  dataWatcher.on('unlinkDir', (f) => broadcastData(f, 'removed'))
}

// ---------- static (built UI) ----------
if (fs.existsSync(WEB_DIST)) {
  const fastifyStatic = (await import('@fastify/static')).default
  // Vite content-hashes every asset, so they're immutable — cache for a year. A normal
  // reload then serves JS/CSS from the browser disk cache (zero tunnel round-trips);
  // only index.html + /api calls go over the wire.
  // wildcard:true (a dynamic /* file route) — NOT wildcard:false. wildcard:false globs the asset routes
  // at STARTUP, so rebuilding ui/dist while the engine runs makes the new hashed .js 404 until a restart
  // (a blank page on every deploy). wildcard:true serves whatever is on disk per request, so a rebuild
  // deploys with no restart. Missing files still delegate to the notFoundHandler below (which 404s any
  // /api/* or file-extension path), so SPA deep links keep falling back to index.html.
  await app.register(fastifyStatic, { root: WEB_DIST, wildcard: true, index: false, maxAge: '365d', immutable: true })
  // Serve index.html with a "this IS the live engine" marker injected, so the SPA
  // skips its (tunnel-slow) /api/health probe and goes straight to LIVE mode —
  // instant, and never the read-only static showcase. The Cloudflare Pages deploy
  // serves a plain index.html without this marker, so it still uses the snapshot.
  // Read index.html FRESH per request (it's ~0.5 KB) and inject the live marker. Reading it once at
  // startup desyncs the served HTML from the on-disk hashed assets the moment ui/dist is rebuilt
  // while the server is running — the browser then requests a stale hash that 404s and the app blanks.
  const sendIndex = (_req: any, reply: any) => {
    let html = ''
    try { html = fs.readFileSync(WEB_DIST + '/index.html', 'utf8') } catch {}
    html = html.replace('</head>', '<script>window.__ENGINE_LIVE__=true</script></head>')
    return reply.header('cache-control', 'no-cache').type('text/html').send(html)
  }
  app.get('/', sendIndex)
  app.setNotFoundHandler((req, reply) => {
    // Never fall back to index.html for an API path or a static asset (anything with a file
    // extension): returning HTML for a missing .js/.css makes the browser reject the module and
    // blanks the whole app. A missing hashed asset must fail loudly as a 404.
    if (req.url.startsWith('/api/') || /\.[a-z0-9]+(?:\?|$)/i.test(req.url)) return reply.code(404).send({ error: 'not found' })
    return sendIndex(req, reply)
  })
}

app
  .listen({ host: HOST, port: PORT })
  .then(() => {
    const g = buildSwarmGraph()
    // eslint-disable-next-line no-console
    console.log(`[swarm-cockpit] control plane on http://${HOST}:${PORT}  (${g.totals.modules} modules, ${g.totals.agents} agents)`)
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[swarm-cockpit] failed to start', err)
    process.exit(1)
  })
