import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import chokidar from 'chokidar'
import cors from '@fastify/cors'
import { execa } from 'execa'
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import { z } from 'zod'
import { readActivity } from './activity-log'
import { recordDataChange } from './data-activity'
import { buildReportHtml, parseMeta, safeName } from './export'
import { DATA_DIR, HOST, NEWS, PORT, REPO_ROOT, STATE_DIR, WEB_DIST } from './config'
import { getCreditStatus } from './credit'
import { analyzeTicker, listTickers } from './data-status'
import { cancel, cancelAll, creditCheck, decideReadiness, estimate, launch } from './launcher'
import { newsBus } from './news/bus'
import { readFeed } from './news/feed'
import { enrichEvent } from './news/enrich'
import { markInboxConsumed, setDismissed } from './news/inbox-actions'
import { refreshBoard } from './news/write-inbox'
import { auditInboxAction, moveThesis, MOVE_TARGETS } from './screener-actions'
import { runReadiness } from './readiness'
import { IN_FLIGHT_STATUSES, getRun, listRuns, subscribe, unsubscribe, type SseClient } from './registry'
import { agentNamesForModule, buildSwarmGraph, graphForSubject, graphForTicker, listModuleNames } from './roster'
import { listAllCalls, listRunsForTicker, readDecision, readMarkdown, readPrompt, resolveRunRoot, runManifest } from './outputs'
import { dataPoolPresent, readCandidates, readHandoffs, readScreenerMarkdown, readThesis, screenerBoard, screenerRunManifest } from './screener'
import { listSwarms } from './swarms'
import { getNewsStatus, startNewsIngester } from './news/scheduler'
import { AGENT_RE, MODULE_RE, SIG_RE, THESIS_RE, TICKER_RE } from './sandbox'
import type { RunKind } from './types'

const app = Fastify({ logger: false })
// Tolerate an EMPTY application/json body. A bodyless POST (cancel, credit-check) sent WITH
// content-type: application/json is otherwise rejected 400 FST_ERR_CTP_EMPTY_JSON_BODY before the route
// even runs. Empty -> undefined body (the route runs); non-empty -> parsed (a route needing a body still
// 400s on its own validation); malformed -> 400 (matches Fastify's default parser, not a leaked 500).
app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
  const s = (body as string)?.trim()
  if (!s) return done(null, undefined)
  try { done(null, JSON.parse(s)) } catch (e) { done(Object.assign(e as Error, { statusCode: 400 }), undefined) }
})
// CORS allow-list (NOT `origin: true`). The cockpit SPA is served SAME-ORIGIN by this engine and the
// web client calls the API with a RELATIVE base (dev goes through a server-side vite proxy), so NO
// legitimate browser request to this API is ever cross-origin — same-origin requests are exempt from
// CORS enforcement entirely, so this list does not affect the live cockpit or local dev. The old
// `origin: true` REFLECTED any site's Origin, which let a hostile page (a) read API responses and
// (b) pass the CORS preflight for state-changing POSTs (e.g. /api/launch) carried on the operator's
// Cloudflare Access session. Restricting to an explicit allow-list makes a disallowed cross-origin
// request get NO `Access-Control-Allow-Origin` — the browser then blocks the read and fails the
// preflight, so the write never fires. Extend via ENGINE_CORS_ORIGINS (comma-separated) — zero-touch.
const CORS_ALLOWED_ORIGINS: (string | RegExp)[] = [
  'https://app.nostra-demus.com',
  /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/, // local dev (any port), if the web ever hits the API directly
  ...(process.env.ENGINE_CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
]
await app.register(cors, { origin: CORS_ALLOWED_ORIGINS })

// ---------- identity (who is acting) ----------
// The engine sits behind Cloudflare Access (the public tunnel route enforces login), which injects the
// authenticated email on every forwarded request. The origin binds to 127.0.0.1, reachable only via the
// tunnel, so the header is trustworthy. Direct/local dev access has no header -> "local".
function identify(req: FastifyRequest): { user: string; userVia: 'cf-access' | 'local' } {
  const raw = req.headers['cf-access-authenticated-user-email']
  const email = Array.isArray(raw) ? raw[0] : raw
  if (typeof email === 'string' && email.trim()) return { user: email.trim().toLowerCase(), userVia: 'cf-access' }
  return { user: 'local', userVia: 'local' }
}

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

// ---------- swarms (manifest list for the cockpit's swarm switcher) ----------
app.get('/api/swarms', async () =>
  listSwarms().map((s) => ({ id: s.id, label: s.label, color: s.color, unit: s.unit, order: s.order, layout: s.layout })),
)

// ---------- swarm graph ----------
// No params -> the research graph, byte-identical to the pre-swarm payload (back-compat).
// ?swarm=<id> -> that swarm's graph (with its `swarm` descriptor); optional ?subject= recomputes
// per-subject runnability exactly like ?ticker= does for research.
app.get('/api/swarm', async (req, reply) => {
  const q = req.query as any
  const swarm = q?.swarm as string | undefined
  if (swarm && swarm !== 'research') {
    if (!listSwarms().some((s) => s.id === swarm)) return reply.code(404).send({ error: `unknown swarm ${swarm}` })
    const subject = q?.subject as string | undefined
    if (subject && SIG_RE.test(subject)) return graphForSubject(swarm, subject)
    return buildSwarmGraph(swarm)
  }
  const ticker = q?.ticker as string | undefined
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

// Pre-flight data-readiness report (deterministic, no LLM). Read-only preview of what the pre-spawn
// gate would surface for this ticker; ?force=1 re-reads a just-fixed pool.
app.get('/api/data-readiness/:ticker', async (req, reply) => {
  const ticker = (req.params as any).ticker as string
  if (!TICKER_RE.test(ticker)) return reply.code(400).send({ error: 'bad ticker' })
  const q = req.query as { force?: string; kind?: string; module?: string }
  return await runReadiness(ticker, (q.kind as any) || 'full', q.module, { force: q.force === '1' })
})

// ---------- credit ----------
app.get('/api/credit', async () => getCreditStatus())
app.post('/api/credit-check', async () => creditCheck())

// ---------- identity + activity log ----------
// who am I (per Cloudflare Access) — drives the "signed in as" line in the cockpit
app.get('/api/whoami', async (req) => identify(req))

// perpetual audit log of cockpit-initiated runs, with filters (time / ticker / kind / user / status / text)
app.get('/api/activity', async (req) => {
  const q = req.query as any
  const num = (v: any) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  const kinds = ['full', 'module', 'agent', 'rerun', 'review', 'track', 'signal', 'sweep', 'screener-agent', 'handoff']
  const statuses = ['starting', 'running', 'done', 'error', 'cancelled', 'incomplete']
  return readActivity({
    from: num(q.from),
    to: num(q.to),
    ticker: typeof q.ticker === 'string' && (TICKER_RE.test(q.ticker) || SIG_RE.test(q.ticker)) ? q.ticker : undefined,
    kind: kinds.includes(q.kind) ? q.kind : undefined,
    user: typeof q.user === 'string' && q.user ? q.user.slice(0, 200) : undefined,
    status: statuses.includes(q.status) ? q.status : undefined,
    q: typeof q.q === 'string' ? q.q.slice(0, 100) : undefined,
    limit: num(q.limit),
  })
})

// ---------- launch estimate ----------
// Discriminated by kind: research kinds require a TICKER; screener kinds validate their own
// subject shape (signal: optional SIG id / none for a new signal; sweep: nothing; handoff: ticker).
app.get('/api/launch/estimate', async (req, reply) => {
  const q = req.query as any
  const kind = q.kind as RunKind
  const researchKinds = ['full', 'module', 'agent', 'rerun', 'review', 'track']
  const screenerKinds = ['signal', 'sweep', 'screener-agent', 'handoff']
  if (![...researchKinds, ...screenerKinds].includes(kind)) return reply.code(400).send({ error: 'bad kind' })
  if (researchKinds.includes(kind)) {
    if (!TICKER_RE.test(q.ticker || '')) return reply.code(400).send({ error: 'bad ticker' })
    return estimate(kind, q.ticker, q.module, q.agent)
  }
  if (kind === 'screener-agent' && !SIG_RE.test(q.ticker || '')) return reply.code(400).send({ error: 'bad signal id' })
  if (kind === 'handoff' && !TICKER_RE.test(q.ticker || '')) return reply.code(400).send({ error: 'bad ticker' })
  return estimate(kind, q.ticker || '', q.module, q.agent)
})

// ---------- launch ----------
// One discriminated body per kind family. Research kinds keep their EXACT pre-swarm contract
// (ticker + typed full-run confirmation); screener kinds carry their own subjects.
const ResearchLaunchBody = z.object({
  kind: z.enum(['full', 'module', 'agent', 'rerun', 'review', 'track']),
  ticker: z.string().regex(TICKER_RE),
  module: z.string().regex(MODULE_RE).optional(),
  agent: z.string().regex(AGENT_RE).optional(),
  // review window (for kind 'review'); ignored by other kinds. Defaults to ad-hoc below.
  window: z.enum(['30d', '90d', '180d', '365d', '24m', '36m', 'ad-hoc', 'post-mortem']).optional(),
  model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i).optional(),
  confirmTicker: z.string().optional(),
})

const INB_RE = /^INB-\d{8}-\d{3,}$/

const SignalLaunchBody = z.object({
  kind: z.literal('signal'),
  // relaunch an existing signal by id…
  sigId: z.string().regex(SIG_RE).optional(),
  // …or submit a NEW signal via the intake form
  intake: z
    .object({
      headline: z.string().min(8).max(500),
      source_url: z.string().max(1000).optional(),
      source_name: z.string().max(120).optional(),
      input_nature: z.string().regex(/^[a-z_]{3,40}$/).optional(),
      body_text: z.string().max(8000).optional(),
      human_prompt_note: z.string().max(4000).optional(),
      override_promote: z.boolean().optional(),
    })
    .optional(),
  // when the launch came from an Inbox card, the row to mark consumed once the run is admitted
  inboxId: z.string().regex(INB_RE).optional(),
  model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i).optional(),
})

const SweepLaunchBody = z.object({ kind: z.literal('sweep'), model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i).optional() })

const ScreenerAgentLaunchBody = z.object({
  kind: z.literal('screener-agent'),
  sigId: z.string().regex(SIG_RE),
  module: z.string().regex(MODULE_RE),
  agent: z.string().regex(AGENT_RE),
  model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i).optional(),
})

const HandoffLaunchBody = z.object({
  kind: z.literal('handoff'),
  thesisId: z.string().regex(THESIS_RE),
  ticker: z.string().regex(TICKER_RE),
  model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i).optional(),
})

app.post('/api/launch', async (req, reply) => {
  const kind = (req.body as any)?.kind as RunKind | undefined
  const { user, userVia } = identify(req)
  const fail = (e: any) => {
    // Forward the discriminated admission-rejection body (code/reason/detail) so the client can
    // branch the toast precisely; falls back to a plain message for other failures.
    const body = e?.body && typeof e.body === 'object' ? e.body : null
    return reply.code(e?.statusCode || 500).send({ error: e?.message || 'launch failed', ...(body || {}) })
  }

  // ---- screener kinds ----
  if (kind === 'signal') {
    const parsed = SignalLaunchBody.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
    if (!parsed.data.sigId && !parsed.data.intake) return reply.code(400).send({ error: 'signal launch needs sigId or intake' })
    try {
      const out = await launch({ kind, ticker: parsed.data.sigId, intake: parsed.data.intake, inboxId: parsed.data.inboxId, model: parsed.data.model, user, userVia })
      // an Inbox-card launch marks its row consumed so it leaves the lane (best-effort: a failed
      // mark only leaves the row visible — a duplicate click is rejected by SIG-id exclusivity)
      if (parsed.data.inboxId) {
        try {
          markInboxConsumed(REPO_ROOT, parsed.data.inboxId, out.preflight.ticker)
          refreshBoard(REPO_ROOT)
        } catch {
          /* best-effort */
        }
      }
      return out
    } catch (e: any) {
      return fail(e)
    }
  }
  if (kind === 'sweep') {
    const parsed = SweepLaunchBody.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
    try {
      return await launch({ kind, model: parsed.data.model, user, userVia })
    } catch (e: any) {
      return fail(e)
    }
  }
  if (kind === 'screener-agent') {
    const parsed = ScreenerAgentLaunchBody.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
    const { sigId, module, agent, model } = parsed.data
    if (!listModuleNames('screener').includes(module)) return reply.code(400).send({ error: 'unknown screener module' })
    if (!agentNamesForModule(module, 'screener').includes(agent)) return reply.code(400).send({ error: 'unknown agent for module' })
    try {
      return await launch({ kind, ticker: sigId, module, agent, model, user, userVia })
    } catch (e: any) {
      return fail(e)
    }
  }
  if (kind === 'handoff') {
    const parsed = HandoffLaunchBody.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
    try {
      return await launch({ kind, ticker: parsed.data.ticker, thesisId: parsed.data.thesisId, model: parsed.data.model, user, userVia })
    } catch (e: any) {
      return fail(e)
    }
  }

  // ---- research kinds (pre-swarm contract, unchanged) ----
  const parsed = ResearchLaunchBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const { ticker, module, agent, model, confirmTicker } = parsed.data
  const rkind = parsed.data.kind
  // review (file an outcome review) and track (rebuild the calls dashboard) need no upstream deps and
  // ignore module/agent — they follow the dep-free `full` admission path. review defaults to ad-hoc.
  const window = rkind === 'review' ? (parsed.data.window ?? 'ad-hoc') : undefined

  // closed allow-list checks against the live roster + data pool
  const tickers = listTickers().tickers.map((t) => t.ticker)
  if (!tickers.includes(ticker)) return reply.code(400).send({ error: `unknown ticker ${ticker}` })
  if (rkind === 'module' || rkind === 'agent') {
    if (!module || !listModuleNames().includes(module)) return reply.code(400).send({ error: 'unknown module' })
  }
  if (rkind === 'agent') {
    if (!agent || !agentNamesForModule(module!).includes(agent)) return reply.code(400).send({ error: 'unknown agent for module' })
  }
  if (rkind === 'rerun') {
    // rerun needs an orb (module+agent). 'master' is the Memo (master synthesizer) — not a module dir, so skip the roster check for it.
    if (!module || !agent) return reply.code(400).send({ error: 'rerun requires module and agent' })
    if (module !== 'master') {
      if (!listModuleNames().includes(module)) return reply.code(400).send({ error: 'unknown module' })
      if (!agentNamesForModule(module).includes(agent)) return reply.code(400).send({ error: 'unknown agent for module' })
    }
  }
  if (rkind === 'full' && confirmTicker !== ticker) {
    return reply.code(412).send({ error: 'full run requires typed confirmation', detail: 'send confirmTicker === ticker' })
  }

  try {
    const out = await launch({ kind: rkind, ticker, module, agent, window, model, user, userVia })
    return out
  } catch (e: any) {
    return fail(e)
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

// The kill switch: stop every in-flight run (both swarms) and halt chained full runs so a step
// finishing mid-stop never launches its successor. Idempotent — stopping nothing returns ok.
app.post('/api/runs/cancel-all', async () => {
  const cancelled = await cancelAll()
  return { ok: true, cancelled, chainsHalted: true }
})

// Resolve a run paused at the pre-spawn data-readiness gate (thin route; lifecycle logic in launcher).
const ReadinessDecisionBody = z.object({
  action: z.enum(['proceed', 'override', 'recheck', 'cancel']),
  acknowledgedText: z.string().max(2000).optional(),
})
app.post('/api/runs/:runId/readiness-decision', async (req, reply) => {
  const parsed = ReadinessDecisionBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body: action must be proceed|override|recheck|cancel' })
  const res = await decideReadiness((req.params as any).runId, parsed.data.action, identify(req).user, parsed.data.acknowledgedText)
  if (!res.ok) return reply.code(res.httpStatus || 400).send({ error: res.error })
  return res
})

// ---------- active runs list ----------
app.get('/api/runs', async (req) => {
  const ticker = (req.query as any)?.ticker as string | undefined
  if (ticker && TICKER_RE.test(ticker)) return { history: listRunsForTicker(ticker) }
  return {
    active: listRuns()
      .filter((r) => IN_FLIGHT_STATUSES.has(r.status)) // incl. the pre-spawn gate states (shared def)
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

// ---------- calls tracker: cross-ticker ledger of every call + its since-the-call timeline ----------
app.get('/api/calls', async () => listAllCalls())

// ---------- screener swarm (dedicated, sandboxed readers — /api/output stays locked to analyses/) ----------
app.get('/api/screener/board', async (_req, reply) => {
  try {
    return screenerBoard()
  } catch (e: any) {
    return reply.code(e?.statusCode || 500).send({ error: String(e?.message || e) })
  }
})

app.get('/api/screener/run', async (req, reply) => {
  const sigId = (req.query as any)?.sig_id as string
  if (!SIG_RE.test(sigId || '')) return reply.code(400).send({ error: 'bad signal id' })
  try {
    return screenerRunManifest(sigId)
  } catch (e: any) {
    return reply.code(e?.code === 'ENOENT' ? 404 : 400).send({ error: 'cannot read run', detail: String(e?.message || e) })
  }
})

app.get('/api/screener/thesis/:id', async (req, reply) => {
  const id = (req.params as any).id as string
  if (!THESIS_RE.test(id || '')) return reply.code(400).send({ error: 'bad thesis id' })
  try {
    return { thesis: readThesis(id), candidates: safeCandidates(id), handoffs: readHandoffs(id) }
  } catch (e: any) {
    return reply.code(e?.code === 'ENOENT' ? 404 : 400).send({ error: 'cannot read thesis', detail: String(e?.message || e) })
  }
})

function safeCandidates(id: string) {
  try {
    return readCandidates(id)
  } catch {
    return null
  }
}

app.get('/api/screener/candidates/:id', async (req, reply) => {
  const id = (req.params as any).id as string
  if (!THESIS_RE.test(id || '')) return reply.code(400).send({ error: 'bad thesis id' })
  try {
    const doc = readCandidates(id)
    // enrich each candidate with the live data-pool presence dot (cheap fs checks)
    for (const c of doc?.candidates ?? []) {
      if (c?.ticker && TICKER_RE.test(c.ticker)) {
        c.prior_coverage = { ...(c.prior_coverage || {}), data_pool_present: dataPoolPresent(c.ticker) }
      }
    }
    return doc
  } catch (e: any) {
    return reply.code(e?.code === 'ENOENT' ? 404 : 400).send({ error: 'cannot read candidates', detail: String(e?.message || e) })
  }
})

// screener markdown outputs for the reader panel — sandboxed to screener/ (path must be inside it)
app.get('/api/screener/output', async (req, reply) => {
  const p = (req.query as any)?.path as string
  if (!p || !p.startsWith('screener/')) return reply.code(400).send({ error: 'path must be under screener/' })
  try {
    return readScreenerMarkdown(p)
  } catch (e: any) {
    return reply.code(e?.code === 'ENOENT' ? 404 : 400).send({ error: 'cannot read', detail: String(e?.message || e) })
  }
})

// handoff (idempotent): spawns /screener:handoff which seeds data/<TICKER>/ + appends the ledger.
// The research run launch stays a SEPARATE human-confirmed act (cost control by design).
app.post('/api/screener/handoff', async (req, reply) => {
  const parsed = HandoffLaunchBody.omit({ kind: true }).safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const { user, userVia } = identify(req)
  try {
    const existing = readHandoffs(parsed.data.thesisId).find((h: any) => h.ticker === parsed.data.ticker)
    if (existing) return { alreadyHandedOff: true, handoff: existing }
    const out = await launch({ kind: 'handoff', ticker: parsed.data.ticker, thesisId: parsed.data.thesisId, user, userVia })
    return { alreadyHandedOff: false, ...out }
  } catch (e: any) {
    const body = e?.body && typeof e.body === 'object' ? e.body : null
    return reply.code(e?.statusCode || 500).send({ error: e?.message || 'handoff failed', ...(body || {}) })
  }
})

// ---------- the news wire (auto-scanner visibility + human inbox/thesis actions) ----------

// Scanner status for the cockpit's auto-scan chip: on/off, last/next cycle, today's counts.
app.get('/api/news/status', async () => getNewsStatus())

// Backfill for the live wire: every triaged item (kept AND dropped) from the last 1–2 days.
app.get('/api/news/feed', async (req) => {
  const q = req.query as any
  const days = q?.days === '1' ? 1 : 2
  return readFeed(REPO_ROOT, days)
})

// On-demand enrichment for ONE event the human opened: the real story (approved-domain fetch),
// parsed SEC filing items, prior coverage of the named companies, and related recent wire items.
// No Claude/Groq spend; cached by event_id; degrades gracefully (always 200 with a `note`).
const EnrichQuery = z.object({
  event_id: z.string().min(3).max(64),
  // http(s) only, default ports, no embedded credentials — the host allow-list + full SSRF gate live
  // in enrich.ts (isSafeFetchUrl); this rejects obviously-bad schemes/ports at the boundary too
  url: z.string().url().max(2000).refine((u) => {
    try { const x = new URL(u); return (x.protocol === 'http:' || x.protocol === 'https:') && !x.username && !x.password && (!x.port || x.port === '80' || x.port === '443') } catch { return false }
  }, 'url must be a plain http(s) URL').optional(),
  headline: z.string().max(500).optional(),
  // companies/event_types arrive JSON-encoded so the GET stays a single querystring
  companies: z.string().max(2000).optional(),
  event_types: z.string().max(500).optional(),
  scope: z.string().max(32).optional(),
  force: z.string().optional(),
})
app.get('/api/news/enrich', async (req, reply) => {
  const parsed = EnrichQuery.safeParse(req.query)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid query', detail: parsed.error.flatten() })
  const q = parsed.data
  const safeJson = (s?: string): any => { try { return s ? JSON.parse(s) : undefined } catch { return undefined } }
  const companies = Array.isArray(safeJson(q.companies)) ? safeJson(q.companies) : []
  const event_types = Array.isArray(safeJson(q.event_types)) ? safeJson(q.event_types) : []
  try {
    const enrichment = await enrichEvent(
      { event_id: q.event_id, url: q.url, headline: q.headline, companies, event_types, scope: q.scope },
      {
        repoRoot: REPO_ROOT, stateDir: STATE_DIR, force: q.force === '1',
        // the article-body read uses the same free Groq key as the ingester (one call per opened event)
        groq: NEWS.groqApiKey ? { apiKey: NEWS.groqApiKey, model: NEWS.groqModel, baseUrl: NEWS.groqBaseUrl, maxTokens: 900 } : undefined,
      },
    )
    return enrichment
  } catch (e: any) {
    // enrichEvent never throws, but keep the route honest if something upstream does
    return { event_id: q.event_id, ok: false, fetched_at: new Date().toISOString(), prior_coverage: [], related: [], note: String(e?.message || e) }
  }
})

// Live wire: one SSE client set, bridged once from the ingest cycle's bus.
const newsClients = new Set<{ send: (e: any) => void }>()
newsBus.subscribe((e) => {
  const payload = e.type === 'news-item' ? { type: 'news-item', item: e.item } : { type: 'news-cycle', summary: e.summary }
  for (const c of newsClients) c.send(payload)
})
app.get('/api/news/stream', (req, reply) => {
  const { send, ping } = startSSE(reply)
  const client = { send }
  newsClients.add(client)
  send({ type: 'news-connected' })
  req.raw.on('close', () => {
    clearInterval(ping)
    newsClients.delete(client)
  })
})

// Dismiss / restore an Inbox row (human state — preserved by every future merge; audited).
const InboxActionBody = z.object({
  inboxId: z.string().regex(INB_RE),
  action: z.enum(['dismiss', 'restore']),
})
app.post('/api/screener/inbox/action', async (req, reply) => {
  const parsed = InboxActionBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const { user } = identify(req)
  const row = setDismissed(REPO_ROOT, parsed.data.inboxId, parsed.data.action === 'dismiss', user)
  if (!row) return reply.code(404).send({ error: 'no such inbox row' })
  auditInboxAction(parsed.data.inboxId, parsed.data.action === 'dismiss' ? 'inbox_dismiss' : 'inbox_restore', user)
  refreshBoard(REPO_ROOT)
  return { ok: true, row }
})

// Hand-move a thesis between board lanes. Append-only override; the engine's own verdict is never
// overwritten — the board shows both, plus a staleness flag if the engine later re-runs.
const ThesisMoveBody = z.object({
  to: z.enum(MOVE_TARGETS),
  reason: z.string().max(500).optional(),
})
app.post('/api/screener/thesis/:id/move', async (req, reply) => {
  const thesisId = (req.params as any).id as string
  if (!THESIS_RE.test(thesisId)) return reply.code(400).send({ error: 'invalid thesis id' })
  const parsed = ThesisMoveBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const { user } = identify(req)
  try {
    const record = moveThesis(thesisId, parsed.data.to, parsed.data.reason || '', user)
    if (!record) return reply.code(404).send({ error: 'no such thesis' })
    refreshBoard(REPO_ROOT)
    // after an 'engine' clear the effective status is the engine's own (captured as from_status)
    return { ok: true, effective_status: record.to_status ?? record.from_status, override: record }
  } catch (e: any) {
    return reply.code(500).send({ error: e?.message || 'move failed' })
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
  recordDataChange(ticker, change) // stamp Drive-sync activity so the UI can show a live "syncing…" state
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
    // autonomous news ingester (screener swarm): fills a ranked inbox 24/7 at ~$0 when GROQ_API_KEY
    // is set; stays dark otherwise. Never launches a paid run — promotion is the human's one click.
    startNewsIngester()
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[swarm-cockpit] failed to start', err)
    process.exit(1)
  })
