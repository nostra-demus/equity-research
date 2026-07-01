import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import chokidar from 'chokidar'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import { execa } from 'execa'
import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify'
import { z } from 'zod'
import { readActivity } from './activity-log'
import { recordDataChange } from './data-activity'
import { buildReportHtml, parseMeta, safeName } from './export'
import { ARTICLE_READ_PROVIDERS, CHAT, DATA_DIR, GDRIVE, HOST, NEWS, PORT, REPO_ROOT, STATE_DIR, WEB_DIST, isReservedDataFolder } from './config'
import { getCreditStatus } from './credit'
import { analyzeTicker, listTickers } from './data-status'
import { ensureCompanyFolder, uploadToCompany, deleteDriveFile, companyFolderExists, driveErrorMessage, GDRIVE_ENABLED } from './drive'
import { cancel, cancelAll, creditCheck, decideReadiness, estimate, launch } from './launcher'
import { newsBus } from './news/bus'
import { readFeed, searchFeed } from './news/feed'
import { matchesFeedFilters, parseFeedFilterQuery, explainFeedFilterMatch, type FeedFilterQuery } from './news/feed-filter'
import { computeFacets } from './news/facets'
import { getIntensity, INTENSITY_WINDOWS, type IntensityWindow } from './news/intensity'
import { getRankWeights, defaultRankWeights, saveRankWeights, resetRankWeights, rankWeightsCustomised, type RankWeights } from './news/rank-weights'
import { buildSourcesReport } from './news/source-health'
import { readThemesIndex, loadTheme, loadThemes, buildThemeDetail, themesLedgerPath } from './news/themes/store'
import { buildGeoThemesIndex, hasThemeGeo, type ThemeGeo } from './news/themes/geo-index'
import type { ThemesIndex } from './news/themes/types'
import { buildThemeBrief } from './news/themes/brief'
import { enrichEvent, listCoveredTickers } from './news/enrich'
import { markInboxConsumed, setDismissed } from './news/inbox-actions'
import { refreshBoard } from './news/write-inbox'
import { auditInboxAction, moveThesis, MOVE_TARGETS } from './screener-actions'
import { FEEDBACK_TYPES, readAllFeedback, submitFeedback, summarizeFeedback, undoFeedback } from './screener-feedback'
import { runReadiness } from './readiness'
import { IN_FLIGHT_STATUSES, getRun, listRuns, subscribe, unsubscribe, type SseClient } from './registry'
import { agentNamesForModule, buildSwarmGraph, findRunRootForSubject, graphForSubject, graphForTicker, listModuleNames, swarmSubjects } from './roster'
import { listAllCalls, listRunsForTicker, readDecision, readMarkdown, readPrompt, resolveRunRoot, runManifest } from './outputs'
import { assembleContext, buildChatPrompts, scopeAvailability } from './chat-context'
import { chatTurnsInFlight, runChatTurn } from './chat-llm'
import { dataPoolPresent, readCandidates, readConviction, readConvictionCalibration, readHandoffs, readScreenerMarkdown, readThesis, screenerBoard, screenerRunManifest, screenerSubjectLabels } from './screener'
import { listSwarms } from './swarms'
import { getNewsStatus, startNewsIngester } from './news/scheduler'
import { startConvictionLoop } from './conviction-dispatch'
import { startResumeSupervisor } from './resume-supervisor'
import { AGENT_RE, EVENT_ID_RE, FEEDBACK_ID_RE, MODULE_RE, SIG_RE, THESIS_RE, TICKER_RE, isValidTicker, resolveInsideRuns, validateNewTicker, sanitizeUploadFilename } from './sandbox'
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

// Basic abuse protection — a generous global request cap so no single client can hammer the
// filesystem-backed read routes (/api/news/*, outputs, screener) into a CPU/IO DoS. The cockpit is
// single-operator behind Cloudflare Access, so 1000/min never throttles normal use (the UI polls a
// handful of times a minute); it just bounds runaway loops / abuse. Registered before the routes so
// the global onRequest hook covers every one of them. (Clears CodeQL js/missing-rate-limiting.)
await app.register(rateLimit, { max: 1000, timeWindow: '1 minute' })

// In-app document uploads stream through @fastify/multipart (it registers its OWN multipart/form-data
// parser — the custom application/json parser above is untouched). Per-file size + per-request file-count
// caps come from GDRIVE config; the upload route additionally validates + sanitizes every filename.
await app.register(multipart, { limits: { fileSize: GDRIVE.uploadMaxBytes, files: GDRIVE.uploadMaxFiles } })

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

// CSRF guard for non-preflighted writes. multipart/form-data is a CORS "simple request" (no preflight),
// so a hostile cross-origin page could POST one carrying the operator's Access cookie and write to Drive
// (CORS only blocks reading the response, not the write). Reject when an Origin header is present and not
// on the CORS allow-list. A MISSING Origin = same-origin browser request or a non-browser client (curl,
// which doesn't carry the victim's cookie) → allowed; the CSRF vector always sends Origin cross-origin.
function originAllowed(req: FastifyRequest): boolean {
  const raw = req.headers.origin
  const origin = Array.isArray(raw) ? raw[0] : raw
  if (!origin) return true
  return CORS_ALLOWED_ORIGINS.some((o) => (o instanceof RegExp ? o.test(origin) : o === origin))
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
    // a swarm subject is either a screener SIG id or a constellation-swarm subject (commodity id, etc.).
    // Validate-or-reject (matches /api/output/* and /api/chat/scopes): a present-but-malformed subject is a
    // 400, never a silent fall-through. The graph is data, not markup: send it with an explicit
    // application/json content type — that is the sanitizer barrier for js/stored-xss (a JSON response can
    // never execute a reflected/stored value as script), on top of the regex validation above.
    if (subject !== undefined) {
      if (!SIG_RE.test(subject) && !TICKER_RE.test(subject)) return reply.code(400).send({ error: 'bad subject' })
      return reply.type('application/json').send(graphForSubject(swarm, subject))
    }
    return buildSwarmGraph(swarm)
  }
  const ticker = q?.ticker as string | undefined
  if (ticker && TICKER_RE.test(ticker)) return reply.type('application/json').send(graphForTicker(ticker))
  return buildSwarmGraph()
})

// ---------- swarm subjects (for a non-research swarm's subject picker) ----------
// Research uses /api/tickers (data-pool folders). A constellation swarm (e.g. commodity) lists its
// subjects generically from its run folders + declared subjects_source (see roster.swarmSubjects).
app.get('/api/swarm/subjects', async (req, reply) => {
  const swarm = (req.query as any)?.swarm as string | undefined
  if (!swarm || swarm === 'research') return reply.code(400).send({ error: 'swarm required (research uses /api/tickers)' })
  if (!listSwarms().some((s) => s.id === swarm)) return reply.code(404).send({ error: `unknown swarm ${swarm}` })
  return { swarm, subjects: swarmSubjects(swarm) }
})

// ---------- tickers ----------
// driveEnabled tells the cockpit whether the in-app add-company / upload UI can work (a Drive
// destination folder + a credential are both configured); the UI hides those controls otherwise.
// explicit per-route rate-limit (same budget as the global cap) so CodeQL recognizes the limiter on this
// filesystem-reading handler (js/missing-rate-limiting); the global @fastify/rate-limit still applies too.
app.get('/api/tickers', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async () => ({ ...listTickers(), driveEnabled: GDRIVE_ENABLED }))

// Add a company = create a <TICKER> folder in the shared Drive (the cloud twin of local data/). The
// engine keeps reading the local mount, so the new company surfaces in the picker once Drive syncs the
// folder back down (a few seconds). Validation reuses the exact ticker rules + reserved-name guard.
app.post('/api/tickers', async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  if (!GDRIVE_ENABLED) return reply.code(400).send({ error: 'Drive uploads are not configured on this server' })
  const parsed = z.object({ ticker: z.string() }).safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const v = validateNewTicker(parsed.data.ticker)
  if (!v.ok) return reply.code(400).send({ error: v.reason, suggested: v.suggested })
  const { ticker } = v
  const { user, userVia } = identify(req)
  try {
    if (await companyFolderExists(ticker)) return reply.code(409).send({ error: `${ticker} already exists` })
    await ensureCompanyFolder(ticker)
    console.log(`[upload] ${user} (${userVia}) created company ${ticker} in Drive`)
    return { ok: true, ticker }
  } catch (e: any) {
    return reply.code(502).send({ error: driveErrorMessage(e) })
  }
})

// Upload one or more documents into a company's Drive folder (multipart). Each file is sanitized
// (path-stripped, dotfiles/oversized/unsupported rejected) and streamed straight to Drive; rejected
// files are skipped and reported, never written. Returns per-file results (HTTP 200 when well-formed).
app.post('/api/tickers/:ticker/files', async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  if (!GDRIVE_ENABLED) return reply.code(400).send({ error: 'Drive uploads are not configured on this server' })
  const ticker = (req.params as any).ticker as string
  if (!isValidTicker(ticker) || isReservedDataFolder(ticker)) return reply.code(400).send({ error: 'bad ticker' })
  const { user, userVia } = identify(req)
  const written: string[] = []
  const errors: { filename: string; reason: string }[] = []
  try {
    for await (const part of req.parts()) {
      if (part.type !== 'file') continue
      const raw = part.filename || ''
      const safe = sanitizeUploadFilename(raw)
      if (!safe.ok) { part.file.resume(); errors.push({ filename: raw || '(unnamed)', reason: safe.reason }); continue }
      try {
        const up = await uploadToCompany(ticker, safe.name, part.mimetype, part.file)
        if (part.file.truncated) {
          // exceeded the per-file size limit mid-stream — remove the partial Drive file we just wrote
          await deleteDriveFile(up.id)
          errors.push({ filename: safe.name, reason: `file exceeds the ${Math.round(GDRIVE.uploadMaxBytes / (1024 * 1024))} MB limit` })
        } else {
          written.push(up.name)
        }
      } catch (e: any) {
        part.file.resume()
        errors.push({ filename: safe.name, reason: driveErrorMessage(e) })
      }
    }
  } catch (e: any) {
    // a multipart-level failure (too many files, malformed body) — return what landed plus the reason
    return reply.code(400).send({ error: e?.message || 'upload failed', written, errors })
  }
  console.log(`[upload] ${user} (${userVia}) uploaded ${written.length} file(s) to ${ticker} (${errors.length} skipped)`)
  return { ok: true, written, errors }
})

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
  // Swarm runs are keyed by an opaque subject id (a SIG-… signal id); resolve each to the company /
  // headline it concerns so the Company column reads as a name, not an id. Falls back to the raw id.
  return readActivity({
    from: num(q.from),
    to: num(q.to),
    ticker: typeof q.ticker === 'string' && (TICKER_RE.test(q.ticker) || SIG_RE.test(q.ticker)) ? q.ticker : undefined,
    kind: kinds.includes(q.kind) ? q.kind : undefined,
    user: typeof q.user === 'string' && q.user ? q.user.slice(0, 200) : undefined,
    status: statuses.includes(q.status) ? q.status : undefined,
    q: typeof q.q === 'string' ? q.q.slice(0, 100) : undefined,
    limit: num(q.limit),
  }, screenerSubjectLabels())
})

// ---------- launch estimate ----------
// Discriminated by kind: research kinds require a TICKER; screener kinds validate their own
// subject shape (signal: optional SIG id / none for a new signal; sweep: nothing; handoff: ticker).
app.get('/api/launch/estimate', async (req, reply) => {
  const q = req.query as any
  const kind = q.kind as RunKind
  // generic constellation swarm (e.g. commodity): reused full/module/agent kinds scoped by ?swarm=
  const swarm = q.swarm as string | undefined
  if (swarm && swarm !== 'research') {
    if (!listSwarms().some((s) => s.id === swarm)) return reply.code(400).send({ error: 'unknown swarm' })
    if (!['full', 'module', 'agent', 'rerun'].includes(kind)) return reply.code(400).send({ error: 'bad kind for swarm' })
    if (!TICKER_RE.test(q.ticker || '')) return reply.code(400).send({ error: 'bad subject' })
    return estimate(kind, q.ticker, q.module, q.agent, swarm)
  }
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
  // "Run anyway": stop any in-flight run on this ticker that holds the lock, then launch (overwrite OK).
  force: z.boolean().optional(),
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
  // optional TARGET module: run the gauntlet THROUGH this module then stop (a deliberate partial run)
  until: z.string().regex(MODULE_RE).optional(),
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

// A generic constellation swarm (e.g. commodity) REUSES full/module/agent, scoped by an explicit
// `swarm`; `ticker` carries the subject id (a commodity like GOLD). Validated against the discovered
// roster below, so no swarm/module/agent name is hardcoded (CLAUDE.md §26).
const SWARM_ID_RE = /^[a-z0-9-]{1,40}$/
const SwarmLaunchBody = z.object({
  kind: z.enum(['full', 'module', 'agent', 'rerun']),
  swarm: z.string().regex(SWARM_ID_RE),
  ticker: z.string().regex(TICKER_RE),
  module: z.string().regex(MODULE_RE).optional(),
  agent: z.string().regex(AGENT_RE).optional(),
  model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i).optional(),
  confirmTicker: z.string().optional(),
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
    if (parsed.data.until && !listModuleNames('screener').includes(parsed.data.until)) return reply.code(400).send({ error: 'unknown screener module' })
    try {
      const out = await launch({ kind, ticker: parsed.data.sigId, intake: parsed.data.intake, inboxId: parsed.data.inboxId, module: parsed.data.until, model: parsed.data.model, user, userVia })
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

  // ---- generic constellation swarm kinds (e.g. commodity): full/module/agent with an explicit swarm ----
  // Matched by the presence of a non-research `swarm` on the body, BEFORE the research fallthrough (which
  // would otherwise treat the commodity subject as an unknown ticker). Validated against the swarm's roster.
  const bodySwarm = (req.body as any)?.swarm as string | undefined
  if (bodySwarm && bodySwarm !== 'research') {
    const parsed = SwarmLaunchBody.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
    const { swarm, ticker: subject, module, agent, model, confirmTicker } = parsed.data
    const skind = parsed.data.kind
    if (!listSwarms().some((s) => s.id === swarm)) return reply.code(400).send({ error: `unknown swarm ${swarm}` })
    if (skind === 'module' || skind === 'agent' || skind === 'rerun') {
      if (!module || !listModuleNames(swarm).includes(module)) return reply.code(400).send({ error: 'unknown module' })
    }
    if (skind === 'agent' && (!agent || !agentNamesForModule(module!, swarm).includes(agent))) {
      return reply.code(400).send({ error: 'unknown agent for module' })
    }
    // rerun: AGENT is optional (whole-module vs single-orb) — but if given it must be valid.
    if (skind === 'rerun' && agent && !agentNamesForModule(module!, swarm).includes(agent)) {
      return reply.code(400).send({ error: 'unknown agent for module' })
    }
    if (skind === 'full' && confirmTicker !== subject) {
      return reply.code(412).send({ error: 'full run requires typed confirmation', detail: 'send confirmTicker === subject' })
    }
    try {
      return await launch({ kind: skind, swarm, ticker: subject, module, agent, model, user, userVia })
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
    const out = await launch({ kind: rkind, ticker, module, agent, window, model, user, userVia, force: parsed.data.force })
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
      // swarmId + unit let a caller tell a research run apart from a screener/commodity one without a
      // name-guess (§26); startedAt drives the "running Nm" readout on the resume affordance.
      .map((r) => ({ runId: r.runId, kind: r.kind, ticker: r.ticker, module: r.module, status: r.status, swarmId: r.swarmId, unit: r.unit, startedAt: r.startedAt })),
  }
})

// ---------- outputs (path-sandboxed) ----------
app.get('/api/output', async (req, reply) => {
  const p = (req.query as any)?.path as string
  // analyses/ (research) or any discovered swarm's runsRoot (e.g. commodity/runs/); resolveInsideRuns
  // enforces containment. Screener artifacts keep their own /api/screener/output reader (client routes them).
  const allowed = ['analyses/', ...listSwarms().filter((s) => s.id !== 'research').map((s) => `${s.runsRoot}/`)]
  if (!p || !allowed.some((pre) => p.startsWith(pre))) return reply.code(400).send({ error: 'path must be under a runs folder' })
  try {
    return readMarkdown(p, resolveInsideRuns)
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

// Resolve a run root from either the research path (runRoot / ticker+date) or a constellation swarm's
// subject (swarm + subject). Returns the repo-relative run root, its swarm id, and the reader to confine
// with (research stays analyses-locked; a swarm reads inside any runs tree).
function resolveOutputRun(q: any): { runRoot: string | null; swarm: string; resolve?: (p: string) => string; badSubject?: boolean; unknownSwarm?: boolean } {
  const swarm = q?.swarm as string | undefined
  if (swarm && swarm !== 'research') {
    if (!listSwarms().some((s) => s.id === swarm)) return { runRoot: null, swarm, unknownSwarm: true }
    const subject = (q?.subject || q?.ticker) as string
    if (!subject || !TICKER_RE.test(subject)) return { runRoot: null, swarm, badSubject: true }
    const abs = findRunRootForSubject(swarm, subject)
    return { runRoot: abs ? path.relative(REPO_ROOT, abs) : null, swarm, resolve: resolveInsideRuns }
  }
  return { runRoot: resolveRunRoot({ runRoot: q?.runRoot, ticker: q?.ticker, date: q?.date }), swarm: 'research' }
}

app.get('/api/output/decision', async (req, reply) => {
  const r = resolveOutputRun(req.query as any)
  if (r.unknownSwarm) return reply.code(404).send({ error: 'unknown swarm' })
  if (r.badSubject) return reply.code(400).send({ error: 'subject required' })
  if (!r.runRoot) return reply.code(404).send({ error: 'no run found' })
  try {
    return readDecision(r.runRoot, r.resolve)
  } catch {
    return reply.code(404).send({ error: 'no decision_record.json' })
  }
})

app.get('/api/output/run', async (req, reply) => {
  const r = resolveOutputRun(req.query as any)
  if (r.unknownSwarm) return reply.code(404).send({ error: 'unknown swarm' })
  if (r.badSubject) return reply.code(400).send({ error: 'subject required' })
  if (!r.runRoot) return reply.code(404).send({ error: 'no run found' })
  try {
    return runManifest(r.runRoot, r.resolve)
  } catch (e: any) {
    return reply.code(400).send({ error: 'cannot read run', detail: String(e?.message || e) })
  }
})

// ---------- chat with your data (closed-book Q&A over a run's synthesized output) ----------
// Which scopes are present (chat-able) vs not-yet-run, so the panel can disable + annotate "run first".
app.get('/api/chat/scopes', async (req, reply) => {
  const q = req.query as any
  // constellation swarm (e.g. commodity): resolve the subject's single run folder from the manifest
  const swarm = q?.swarm as string | undefined
  if (swarm && swarm !== 'research') {
    if (!listSwarms().some((s) => s.id === swarm)) return reply.code(404).send({ error: `unknown swarm ${swarm}` })
    const subject = (q?.subject || q?.ticker) as string
    if (!subject || !TICKER_RE.test(subject)) return reply.code(400).send({ error: 'subject required' })
    const abs = findRunRootForSubject(swarm, subject)
    const rr = abs ? path.relative(REPO_ROOT, abs) : null
    try {
      return scopeAvailability(subject, rr, swarm)
    } catch (e: any) {
      return reply.code(400).send({ error: 'cannot read scopes', detail: String(e?.message || e) })
    }
  }
  const ticker = q?.ticker as string
  if (!ticker || !TICKER_RE.test(ticker)) return reply.code(400).send({ error: 'ticker required' })
  try {
    return scopeAvailability(ticker, resolveRunRoot({ ticker }))
  } catch (e: any) {
    return reply.code(400).send({ error: 'cannot read scopes', detail: String(e?.message || e) })
  }
})

// One chat turn. Stateless: the client resends the whole conversation each turn (ephemeral by design).
// Streams Server-Sent-Events in the POST response body: chat-meta (what we're answering from), then
// chat-token per delta, then a terminal chat-done {costUsd} or chat-error {message}.
const ChatBody = z.object({
  ticker: z.string().regex(TICKER_RE).optional(),
  runRoot: z.string().max(300).optional(),
  // constellation swarm (e.g. commodity): its subject resolves the run folder from the manifest
  swarm: z.string().regex(/^[a-z0-9-]{1,40}$/).optional(),
  subject: z.string().regex(TICKER_RE).optional(),
  scope: z.enum(['run', 'module', 'orb']),
  module: z.string().regex(MODULE_RE).optional(),
  orbPath: z.string().max(300).optional(),
  model: z.string().max(60).optional(),
  style: z.enum(['simple', 'analyst', 'detailed']).optional(),
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(20000) })).min(1).max(40),
})
app.post('/api/chat', async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  const parsed = ChatBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid chat request', detail: parsed.error.issues?.[0]?.message })
  const { scope, module, orbPath, messages } = parsed.data
  const model = CHAT.allowedModels.includes(parsed.data.model || '') ? parsed.data.model! : CHAT.defaultModel
  const swarmId = parsed.data.swarm && parsed.data.swarm !== 'research' ? parsed.data.swarm : 'research'

  const last = messages[messages.length - 1]
  if (last.role !== 'user' || !last.content.trim()) return reply.code(400).send({ error: 'the last message must be a non-empty user question' })
  if (chatTurnsInFlight() >= CHAT.maxConcurrent) return reply.code(429).send({ error: 'chat is busy — try again in a moment' })

  // Resolve the run root and confine reads to it (orbPath is re-validated against the manifest inside
  // assembleContext, so a request-supplied path can never read outside this run). Research resolves the
  // latest analyses/<TICKER>_* run; a constellation swarm resolves its subject's single run folder.
  let runRoot: string | null
  let subject: string
  if (swarmId !== 'research') {
    if (!listSwarms().some((s) => s.id === swarmId)) return reply.code(404).send({ error: `unknown swarm ${swarmId}` })
    const subj = parsed.data.subject || parsed.data.ticker
    if (!subj || !TICKER_RE.test(subj)) return reply.code(400).send({ error: 'subject required for this swarm' })
    const abs = findRunRootForSubject(swarmId, subj)
    runRoot = abs ? path.relative(REPO_ROOT, abs) : null
    subject = subj
  } else {
    runRoot = resolveRunRoot({ runRoot: parsed.data.runRoot, ticker: parsed.data.ticker })
    subject = parsed.data.ticker || (runRoot ? runRoot.replace(/^analyses\//, '').replace(/_\d{4}-\d{2}-\d{2}$/, '') : '')
  }
  if (!runRoot) return reply.code(404).send({ error: 'no run found for this subject yet — run the engine first' })

  let assembled
  try {
    assembled = assembleContext({ scope, runRoot, module, orbPath, swarmId })
  } catch (e: any) {
    return reply.code(400).send({ error: 'cannot assemble context', detail: String(e?.message || e) })
  }
  if (!assembled.present) return reply.code(409).send({ error: 'not_run', hint: assembled.missingHint })

  // Hijack into an SSE stream for the answer.
  const { res, send, ping } = startSSE(reply)
  const ac = new AbortController()
  let closed = false
  // Detect a real client disconnect on the RESPONSE socket, NOT req.raw: for a POST, req 'close' fires
  // as soon as the request BODY is consumed (the request side is done) — which would abort the turn
  // instantly, before any token. The response stream closes only on an actual disconnect (or our own
  // res.end()), which is the correct cancel signal for streamed POST output.
  res.on('close', () => { closed = true; clearInterval(ping); ac.abort() })
  send({ type: 'chat-meta', scopeResolved: assembled.label, sourcePath: assembled.sourcePath, degraded: assembled.degraded, degradeNote: assembled.degradeNote })
  const { system, user } = buildChatPrompts({ assembled, messages, subject, style: parsed.data.style })
  try {
    const out = await runChatTurn({ system, user, model, signal: ac.signal, onToken: (t) => send({ type: 'chat-token', content: t }) })
    if (out.error && out.error !== 'aborted') send({ type: 'chat-error', message: out.error })
    else if (!out.error) send({ type: 'chat-done', costUsd: out.costUsd, model })
  } catch (e: any) {
    if (!closed) send({ type: 'chat-error', message: String(e?.message || e) })
  } finally {
    clearInterval(ping)
    try { res.end() } catch { /* already closed */ }
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

// The conviction track record (from /screener:calibrate) — null until one is written. Honest empty
// state lives in the payload (sufficient:false + verdict), so the UI never fabricates a metric.
app.get('/api/screener/calibration', async () => readConvictionCalibration())

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
    return { thesis: readThesis(id), candidates: safeCandidates(id), handoffs: readHandoffs(id), conviction: safeConviction(id) }
  } catch (e: any) {
    return reply.code(e?.code === 'ENOENT' ? 404 : 400).send({ error: 'cannot read thesis', detail: String(e?.message || e) })
  }
})

function safeConviction(id: string) {
  try {
    return readConviction(id)
  } catch {
    return null
  }
}

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

// Time-windowed intake intensity for the screener ThemeMap. Returns small AGGREGATES only (per-tier
// counts + totals + a ≤48-point hourly histogram) over the chosen window (last scan … full day … 7d),
// so the map can show a real sense of intensity without the browser ever loading thousands of raw items.
app.get('/api/screener/intensity', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async (req, reply) => {
  const w = (req.query as any)?.window as string | undefined
  if (w && !(INTENSITY_WINDOWS as string[]).includes(w)) return reply.code(400).send({ error: `unknown window ${w}` })
  return getIntensity((w as IntensityWindow) || 'day')
})

// Per-source health for the Sources panel: every wired feed + adapter, when its data last arrived, and
// whether it's healthy / quiet / failing / idle (fetch outcome + firehose recency). Read-only, never throws.
app.get('/api/news/sources', async () => buildSourcesReport(REPO_ROOT, STATE_DIR))

// Backfill for the live wire + the time-travel view: every triaged item (kept AND dropped) over the
// requested window. days defaults to 2 (the live view); larger windows (14 / 30 / 90 / 180 / all) read
// the daily firehose files newest-first with a higher item cap, so you can surface the archived history.
app.get('/api/news/feed', async (req) => {
  const q = req.query as any
  const days = Math.min(370, Math.max(1, Math.floor(Number(q?.days) || 2))) // 'all' → the client sends 370
  const maxItems = days <= 2 ? 1000 : 6000 // deep windows return the newest 6k items in range (readFeed early-stops)
  return readFeed(REPO_ROOT, days, { maxItems, archiveDir: NEWS.newsArchiveDir }) // read pruned days from the Drive archive
})

// ARCHIVE SEARCH — filter the WHOLE since-inception archive, not just the loaded window. Unlike /feed
// (newest-N-in-window, no filtering), this applies every filter SERVER-SIDE and keeps scanning older days
// until it fills a page of MATCHES or hits the archive floor — so a sparse filter (Aerospace & Defense in
// the UAE) finds matches buried deep in history instead of falsely reading "nothing". Recency-ordered,
// (ts,event_id) cursor paging. Rate-limited (the fs-read DoS guard) like the other filesystem routes.
app.get('/api/news/search', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req) => {
  const q = req.query as any
  const filters = parseFeedFilterQuery(q || {})
  const limit = Math.min(200, Math.max(1, Math.floor(Number(q?.limit) || 60)))
  // Validate dates before they reach searchFeed's date arithmetic: a shape-only regex admits impossible
  // values like "2026-13-45", and a non-date cursorTs ("abc") both make new Date(NaN).toISOString() throw
  // (an unhandled 500 + raw-error leak — there is no global error handler). searchFeed now also guards this,
  // but dropping malformed optional inputs here keeps results sane (an ignored filter, not a silent "today").
  const realDate = (s: any): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`))
  const cursor = typeof q?.cursorTs === 'string' && q.cursorTs && !Number.isNaN(Date.parse(q.cursorTs)) ? { ts: String(q.cursorTs), id: String(q?.cursorId || '') } : null
  const from = realDate(q?.from) ? q.from : undefined
  const to = realDate(q?.to) ? q.to : undefined
  const snap = searchFeed(REPO_ROOT, {
    predicate: (it) => matchesFeedFilters(it, filters),
    archiveDir: NEWS.newsArchiveDir, limit, cursor, fromDate: from, toDate: to,
  })
  return { items: snap.items, nextCursor: snap.nextCursor, scannedThroughDate: snap.scannedThroughDate, exhausted: snap.exhausted }
})

// FACETS — the available geographies (country + continent) / sectors / sub-sectors / sources / themes,
// WITH COUNTS, over the whole archive, honouring the active filter context. This is what makes the
// cockpit dropdowns show the archive truth (e.g. "United Arab Emirates (3)"), not just the 2-day window.
// Backed by a TTL-cached index (news/facets.ts), so a dropdown open is cheap.
app.get('/api/news/facets', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req) => {
  const filters = parseFeedFilterQuery((req.query as any) || {})
  return computeFacets(REPO_ROOT, filters, { archiveDir: NEWS.newsArchiveDir })
})

// DEBUG — "why did/didn't this item match this filter". Accepts as much or as little of an item's fields
// as you have (headline/companies/country/…) and a filter to test it against, and returns
// explainFeedFilterMatch's per-clause pass/fail + detail (which GICS keyword or company alias fired, or
// why none did). A pure function proxy — no archive lookup — so it works for a hypothetical/synthetic
// item as easily as one already ingested. `filters` uses the SAME string-keyed shape as the /search query
// params (parsed by the same parseFeedFilterQuery), e.g. {"gicsSubSector":"Tobacco"}.
const DebugExplainBody = z.object({ item: z.record(z.string(), z.any()), filters: z.record(z.string(), z.any()) }).strip()
app.post('/api/news/debug/explain', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req, reply) => {
  const parsed = DebugExplainBody.safeParse(req.body ?? {})
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body — expected {item, filters}', detail: parsed.error.flatten() })
  const filters: FeedFilterQuery = parseFeedFilterQuery(parsed.data.filters as Record<string, unknown>)
  return explainFeedFilterMatch(parsed.data.item as any, filters)
})

// SCORING WEIGHTS — the knobs behind every event's triage score (rank.ts). The cockpit Scoring panel
// reads these to render the controls + live preview, and writes them back. The change is GLOBAL (one
// shared config drives all scoring), never per-event: a save re-scores the whole wire on the next load.
// explicit per-route rate-limit (same budget as the global cap) so CodeQL recognizes the limiter on these
// filesystem-touching handlers (js/missing-rate-limiting); the global @fastify/rate-limit still applies too.
app.get('/api/news/rank-weights', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async () => ({ active: getRankWeights(), defaults: defaultRankWeights(), customised: rankWeightsCustomised() }))

// Each group is an open numeric map (a new event type / source tier auto-falls-back to its default, §26);
// saveRankWeights() clamps every value and drops unknown keys, so a malformed body degrades to "no change"
// rather than corrupting scoring. `{ reset: true }` restores the shipped defaults and removes the override.
const numMap = z.record(z.string(), z.number())
const RankWeightsBody = z.object({
  reset: z.boolean().optional(),
  source_tier: numMap.optional(),
  scope: numMap.optional(),
  event: numMap.optional(),
  size: numMap.optional(),
  recency: numMap.optional(),
  boost_weight: z.number().optional(),
}).strip()
app.put('/api/news/rank-weights', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async (req, reply) => {
  const parsed = RankWeightsBody.safeParse(req.body ?? {})
  if (!parsed.success) return reply.code(400).send({ error: 'invalid weights', detail: parsed.error.flatten() })
  const { reset, ...over } = parsed.data
  const active = reset ? resetRankWeights() : saveRankWeights(over as Partial<RankWeights>)
  return { active, defaults: defaultRankWeights(), customised: rankWeightsCustomised() }
})

// THEMES — the living, ranked investment themes the firehose is bucketed into. With a `country` (ISO
// alpha-2) or `geoRegion` (continent) query param it returns the SAME themes sliced to that geography —
// re-ranked + re-sized by that geography's news flow — so the cockpit's "Where" picker narrows the Themes
// view, not just the Events list. No geo param → the fast pre-built global index. The geo path reads the
// full ledger (member rings) from disk, so it carries the same per-route limiter as the other fs routes.
const THEME_RE = /^THM-[a-z0-9]{8}$/
// Cache the geo-sliced index by (ledger mtime, geo key). The ledger only changes once per ~5-min cycle, so
// nearly every geo request is served O(1) instead of re-parsing the whole ledger + re-running the country
// gazetteer over every member (measured ~89ms today, ~540ms at the 32MB size prod once reached — all on the
// single event loop). A new mtime drops the whole map, so a cycle's fresh themes show up immediately.
let themesGeoCache: { mtime: number; byGeo: Map<string, ThemesIndex> } = { mtime: -1, byGeo: new Map() }
function geoThemesIndex(geo: ThemeGeo): ThemesIndex {
  let mtime = 0
  try { mtime = fs.statSync(themesLedgerPath(REPO_ROOT)).mtimeMs } catch { /* no ledger yet → mtime 0 */ }
  if (themesGeoCache.mtime !== mtime) themesGeoCache = { mtime, byGeo: new Map() }
  const key = `${geo.country || ''}|${geo.geoRegion || ''}`
  const hit = themesGeoCache.byGeo.get(key)
  if (hit) return hit
  const idx = buildGeoThemesIndex(loadThemes(REPO_ROOT), geo)
  themesGeoCache.byGeo.set(key, idx)
  return idx
}
app.get('/api/news/themes', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req) => {
  const q = (req.query as any) || {}
  const geo: ThemeGeo = {
    country: typeof q.country === 'string' && q.country.trim() ? q.country.trim().toUpperCase() : undefined,
    geoRegion: typeof q.geoRegion === 'string' && q.geoRegion.trim() ? q.geoRegion.trim() : undefined,
  }
  if (!hasThemeGeo(geo)) return readThemesIndex(REPO_ROOT)
  return geoThemesIndex(geo)
})
app.get('/api/news/themes/:id', async (req, reply) => {
  const id = String((req.params as any)?.id || '')
  if (!THEME_RE.test(id)) return reply.code(400).send({ error: 'bad theme id' })
  const theme = loadTheme(REPO_ROOT, id)
  if (!theme) return reply.code(404).send({ error: 'theme not found' })
  return buildThemeDetail(REPO_ROOT, theme)
})
// On-demand BRIEF for ONE opened theme — the few-sentence plain-English explainer of what the theme is
// about and what's happening. Built from the theme's own member headlines by one free Groq pass, cached
// by content signature, degrading to a deterministic synthesis. Loaded separately from the deep-dive so
// the members/companies render instantly while the brief streams in. Never throws (always 200).
app.get('/api/news/themes/:id/brief', async (req, reply) => {
  const id = String((req.params as any)?.id || '')
  if (!THEME_RE.test(id)) return reply.code(400).send({ error: 'bad theme id' })
  const theme = loadTheme(REPO_ROOT, id)
  if (!theme) return reply.code(404).send({ error: 'theme not found' })
  const force = String((req.query as any)?.force || '') === '1'
  try {
    return await buildThemeBrief(theme, NEWS, STATE_DIR, fetch, { force })
  } catch (e: any) {
    // buildThemeBrief never throws; keep the route honest if something upstream does — without leaking
    // raw internal error text into the user-facing note.
    req.log?.warn?.({ err: String(e?.message || e), theme: id }, 'theme brief failed')
    return { theme_id: id, brief: '', generation: 'deterministic', generated_at: new Date().toISOString(), note: 'Couldn’t build a brief just now.' }
  }
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
        // the article-body read runs the multi-provider fallback chain (Groq → OpenRouter/NVIDIA → Gemini),
        // each sharing the ingester's daily budget + per-minute limiter so an opened event never blows the
        // per-minute ceiling alongside the scanner — under HARD time budgets so it can never hang the reader.
        articleProviders: ARTICLE_READ_PROVIDERS,
        llmBudgetMs: NEWS.enrichLlmBudgetMs,
        limiterWaitMs: NEWS.enrichLimiterWaitMs,
        // when the publisher blocks the direct read, corroborate the event from the secondary wire (GDELT
        // keyword search → same read chain). Shares the firehose's GDELT endpoint + penalty backoff.
        corroborate: { enabled: NEWS.enrichCorroborate, baseUrl: NEWS.gdeltBaseUrl, timeoutMs: NEWS.enrichCorroborateTimeoutMs },
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
  const payload =
    e.type === 'news-item' ? { type: 'news-item', item: e.item } : e.type === 'theme-update' ? { type: 'theme-update', theme: e.theme } : { type: 'news-cycle', summary: e.summary }
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

// Restore an archived (killed/expired) thesis to the live book — the conviction loop's one-click
// un-discard (a discard is a SOFT discard, §24). Deterministic: a Python helper flips the snapshot and
// records a `recover` event; the board is rebuilt so the card returns to the live lanes.
app.post('/api/screener/conviction/:id/restore', async (req, reply) => {
  const thesisId = (req.params as any).id as string
  if (!THESIS_RE.test(thesisId)) return reply.code(400).send({ error: 'invalid thesis id' })
  const { user } = identify(req)
  try {
    const out = execFileSync('python3', [path.join(REPO_ROOT, 'scripts', 'screener_restore_conviction.py'), thesisId, user], { cwd: REPO_ROOT, encoding: 'utf8' })
    execFileSync('python3', [path.join(REPO_ROOT, 'scripts', 'update_board_index.py')], { cwd: REPO_ROOT, stdio: 'ignore' })
    return { ok: true, message: out.trim() }
  } catch (e: any) {
    return reply.code(500).send({ error: e?.message || 'restore failed' })
  }
})

// ---------- screener card feedback ("flag as irrelevant / mis-scored / …") ----------
// The wire's cockpit lets a human flag one item as irrelevant, mis-scored, mis-tagged, a stale
// duplicate, or under-rated, with an optional reason. Stored as a structured, append-only ledger
// (screener/ledger/screener_feedback.ndjson, same pattern as overrides.ndjson) so a later pass — human
// or LLM — can mine it for scoring changes. The server never validates event_id against a live wire
// item: the wire is ephemeral SSE/feed state the server doesn't index by id, so the client sends a
// snapshot of the card's own visible fields alongside the flag.
const FeedbackBody = z.object({
  event_id: z.string().regex(EVENT_ID_RE),
  feedback_type: z.enum(FEEDBACK_TYPES),
  feedback_reason: z.string().max(500).optional(),
  current_score: z.number().optional(),
  event_title: z.string().max(500).optional(),
  source: z.string().max(200).optional(),
  company_name: z.string().max(200).optional(),
  company_ticker: z.string().max(20).optional(),
  sector_theme: z.string().max(200).optional(),
  score_breakdown: z.record(z.any()).nullable().optional(),
}).strip()
app.post('/api/screener/feedback', async (req, reply) => {
  const parsed = FeedbackBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const { user } = identify(req)
  try {
    const record = submitFeedback(parsed.data, user)
    return reply.code(201).send({ ok: true, feedback: record })
  } catch (e: any) {
    return reply.code(500).send({ error: e?.message || 'feedback save failed' })
  }
})

app.post('/api/screener/feedback/:id/undo', async (req, reply) => {
  const feedbackId = (req.params as any).id as string
  if (!FEEDBACK_ID_RE.test(feedbackId)) return reply.code(400).send({ error: 'invalid feedback id' })
  const { user } = identify(req)
  try {
    const record = undoFeedback(feedbackId, user)
    if (!record) return reply.code(404).send({ error: 'no such feedback' })
    return { ok: true, undone: record }
  } catch (e: any) {
    return reply.code(500).send({ error: e?.message || 'undo failed' })
  }
})

app.get('/api/screener/feedback/summary', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async () => summarizeFeedback(readAllFeedback(REPO_ROOT)))

// Tickers already under research coverage — the batch-review "portfolio companies" filter's data
// source (a proxy: this codebase has no separate brokerage holdings list). Cheap; fetched once per panel-open.
app.get('/api/screener/covered-tickers', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async () => ({ tickers: listCoveredTickers(REPO_ROOT) }))

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

// ── Single-instance lock ──────────────────────────────────────────────────────
// The OS already blocks two binds to the SAME :8787 (the second gets EADDRINUSE, handled in .catch below).
// The real hazard is a SECOND engine started with a DIFFERENT PORT (the :8799 incident): it shares this
// checkout's data + state and doubles all ingester / filesystem / LLM load. A repo-keyed pidfile makes one
// engine per checkout regardless of PORT. process.kill(pid, 0) sends NO signal — it's a liveness probe; a
// stale pidfile (owner gone → throws ESRCH) is reclaimed automatically.
const ENGINE_PIDFILE = path.join(STATE_DIR, 'engine.pid')
function claimSingleInstanceLock() {
  try {
    const prev = Number(fs.readFileSync(ENGINE_PIDFILE, 'utf8').trim())
    if (prev && prev !== process.pid) {
      try {
        process.kill(prev, 0) // throws if that pid is gone; succeeds (no signal sent) if it's alive
        // eslint-disable-next-line no-console
        console.error(`[swarm-cockpit] another engine is already running for this checkout (pid ${prev}); exiting`)
        process.exit(1)
      } catch {
        /* stale pidfile (owner gone) — fall through and claim it */
      }
    }
  } catch {
    /* no pidfile yet — claim it */
  }
  try {
    fs.mkdirSync(path.dirname(ENGINE_PIDFILE), { recursive: true })
    fs.writeFileSync(ENGINE_PIDFILE, String(process.pid))
    // release on a clean exit (best-effort; a hard kill leaves a stale file the liveness probe handles)
    process.on('exit', () => {
      try {
        if (Number(fs.readFileSync(ENGINE_PIDFILE, 'utf8').trim()) === process.pid) fs.unlinkSync(ENGINE_PIDFILE)
      } catch {}
    })
  } catch {
    /* non-fatal: if the pidfile can't be written, don't block startup */
  }
}
claimSingleInstanceLock()

app
  .listen({ host: HOST, port: PORT })
  .then(() => {
    const g = buildSwarmGraph()
    // eslint-disable-next-line no-console
    console.log(`[swarm-cockpit] control plane on http://${HOST}:${PORT}  (${g.totals.modules} modules, ${g.totals.agents} agents)`)
    // autonomous news ingester (screener swarm): fills a ranked inbox 24/7 at ~$0 when GROQ_API_KEY
    // is set; stays dark otherwise. Never launches a paid run — promotion is the human's one click.
    startNewsIngester()
    // conviction loop (Phase 3): auto-fire /screener:validate on due checkpoints + on matching wire
    // items. OFF unless CONVICTION_LOOP_ENABLED=1 — auto-spawning paid checks is opt-in.
    startConvictionLoop()
    // forever-living resume supervisor: server-side, no browser needed — continues runs interrupted by a
    // plan-limit reset / dropped connection / reboot. OFF unless RESUME_SUPERVISOR_ENABLED=1 (the cloud
    // host sets it; a dev laptop stays dark). Never spends overage; waits for the plan limit to reset.
    startResumeSupervisor()
  })
  .catch((err: any) => {
    // eslint-disable-next-line no-console
    if (err?.code === 'EADDRINUSE') console.error(`[swarm-cockpit] port ${PORT} is already in use — another engine owns it; exiting`)
    // eslint-disable-next-line no-console
    else console.error('[swarm-cockpit] failed to start', err)
    process.exit(1)
  })
