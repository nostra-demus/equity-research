import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Transform } from 'node:stream'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import chokidar from 'chokidar'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import { execa } from 'execa'
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify'
import { z } from 'zod'
import { providerDeployIntentPath, providerDeployPending } from './deploy-barrier'
import { readActivity, ACTIVITY_FILTER_KINDS, ACTIVITY_FILTER_STATUSES } from './activity-log'
import { recordDataChange, syncingState, SYNC_WINDOW_MS } from './data-activity'
import { buildReportHtml, parseMeta, safeName } from './export'
import { ARTICLE_READ_PROVIDERS, CHAT, DATA_DIR, FILING_READ_PROVIDERS, GDRIVE, HOST, NEWS, PORT, PUBLICATION_SOCKET_ROOT, REPO_ROOT, STATE_DIR, TOOLS, WEB_DIST, connectorDispatchReady, feedbackDispatchReady, feedbackEmailReady, isDispatchAdmin, isReservedDataFolder, pipelineScanReady } from './config'
import { getCreditStatus } from './credit'
import { listTickers } from './data-status'
import { dataScans } from './data-scan'
import { ensureCompanyFolder, ensureCompanyIdentity, uploadToCompany, deleteDriveFile, deleteDriveFileStrict, driveErrorMessage, GDRIVE_ENABLED, readWatchlistFile, uploadToWatchlist } from './drive'
import { attachmentExists, attachmentPath, deleteAttachment, readAttachment, saveAttachment, watchlistFilesAvailable } from './watchlist-files'
import {
  assertClaudeCli, assertProviderAvailable, cancel, cancelAll, cancelSubject, checkProviderUsage,
  creditCheck, decideReadiness, drainProviderRunsForShutdown, estimate, isSealedResearchRun, launch,
  getParityCanaryChainStatus, queuePublicationIntent, reapDeadSubjectRuns, reconcileOrphanedProviderGroups, recoverReadyPublications, sigIdFor,
  isRecoverableParityInterruptionReason, subjectChainActive, todayDate, warmLaunchProbes,
  type RunProviderSelection,
} from './launcher'
import { newsBus } from './news/bus'
import { readFeed, searchFeed, applyActiveWeightsTo, type SearchCursor } from './news/feed'
import { getPulse } from './news/commodity-pulse'
import { callVsLive, getQuotes, resolveUnits, symbolCandidates } from './news/equity-quote'
import { getCalendar } from './news/events-calendar'
import type { FeedItem } from './news/types'
import { matchesFeedFilters, parseFeedFilterQuery, explainFeedFilterMatch, hasAnyFilter, type FeedFilterQuery } from './news/feed-filter'
import { computeFacetsAsync, warmFacets } from './news/facets-service'
import { searchSymbolsEnriched } from './news/symbology'
import { fetchCnbcRows } from './news/cnbc-quote'
import { baseTicker, cleanTicker } from './news/symbology'
import { getIntensity, INTENSITY_WINDOWS, type IntensityWindow } from './news/intensity'
import { getRankWeights, defaultRankWeights, saveRankWeights, resetRankWeights, rankWeightsCustomised, type RankWeights } from './news/rank-weights'
import { buildSourcesReport } from './news/source-health'
import { loadTheme, buildThemeDetail } from './news/themes/store'
import { memberMatchesGeo, type ThemeGeo } from './news/themes/geo-index'
import { memberMatchesCommodity } from './news/themes/commodity-index'
import { createThemesIndexReader } from './news/themes/api-index'
import {
  assignHoldingIdea, assignTradeIdea, clearSupersededManual, declareCashEquivalent, declareIdea,
  deleteStatement, logManualTrade, readPortfolio, removeDeclaredIdea, removeManualTrade,
  renameDeclaredIdea, saveStatement, STATEMENT_MAX_BYTES,
} from './portfolio-store'
import { liveMark } from './portfolio-live'
import { buildThemeBrief } from './news/themes/brief'
import { enrichEvent, listCoveredTickers, peekCachedEnrichment } from './news/enrich'
import { verdictOf } from './news/impact-floor'
import { autoBridgeItem, bridgeEventToSubject, findWireItem, listBridgedSubjects } from './research-bridge'
import { applyNewsRerank, assembleNewsChatContext, buildNewsChatPrompts, newsSemanticNamedAnchors } from './news/chat'
import { NewsChatRequestGate, bindNewsChatRequestAbort, runNewsChatFallback, shouldUseNewsChatFallback } from './news/chat-provider'
import { searchSemanticIndex } from './retrieval/semantic'
import { rerankCandidates } from './retrieval/rerank'
import { markInboxConsumed, setDismissed } from './news/inbox-actions'
import { refreshBoard } from './news/write-inbox'
import {
  appendIdeaFeedback, finalizeIdeaPromotion, ideaPromotionEligibility, readIdeaById, reconcileIdeaPromotionReservations,
  releaseIdeaPromotion, reserveIdeaPromotion, updateIdeaSnapshot,
} from './news/ideas/ideas-store'
import { auditInboxAction, hideSignal, moveThesis, MOVE_TARGETS, SIGNAL_ACTIONS } from './screener-actions'
import { markIdeasPublicationPending } from './news/ideas/ideas-publisher'
import { appendFeedbackRoute, FEEDBACK_TYPES, readAllFeedback, submitFeedback, summarizeFeedback, undoFeedback } from './screener-feedback'
import { FEEDBACK_MAX_IMAGES, type FeedbackCategory, type FeedbackItemRecord, appendFeedbackEvent, foldFeedback, isFeedbackId, itemDir, newFeedbackId, readAllFeedback as readAllCockpitFeedback, saveFeedbackImage, writeFeedbackItem } from './feedback-store'
import { dryRunFeedbackDispatch, startFeedbackDispatch } from './feedback-dispatch'
import { notifyFeedbackResolved } from './feedback-email'
import { runReadiness } from './readiness'
import { IN_FLIGHT_STATUSES, getRun, listRuns, subscribe, unsubscribe, type SseClient } from './registry'
import { agentNamesForModule, buildSwarmGraph, findRunRootForSubject, graphForSubject, graphForTicker, listModuleNames, swarmSubjects, swarmSubjectSummaries, terminalModuleName, warmSwarmGraphs } from './roster'
import { clearRunMarker, isValidCalendarISODate, listAllCalls, listRunsForTicker, readDecision, readMarkdown, readPrompt, readPublishedCallsMarkdown, readRunsMarkdown, resolveRunRoot, runManifest, todayISO, writeRunMarker } from './outputs'
import { readIbkrPaperPortfolio } from './ibkr-paper'
import { ibkrPaperExecution } from './ibkr-paper-execution'
import { drainIbkrPaperAutoSync } from './ibkr-paper-auto-sync'
import {
  WATCHLIST_ENTRIES_DIR, WATCHLIST_MAX_ATTACHMENTS, WATCHLIST_MAX_ROWS, WATCHLIST_MAX_TAGS, WATCHLIST_MAX_TRIGGERS,
  deleteEntry, fingerprintEngineRow, isWatchId, listingKey, makeListing, mergeWatchlist, newEntryId,
  pickEntryForListing, readEngineWatch, readEntries, readSizingDecoration, triggerSetProblem, writeEntry,
  type StandingCall, type WatchEntry, type WatchTrigger,
  readRunScenarios,
} from './watchlist'
import {
  TASKS_DIR, TASK_MAX_ATTACHMENTS, TASK_PEOPLE, isTaskId, newTaskId, readTasks,
  syncTaskWatchlist, syncWatchAssigneeToTask, taskPath, taskTickerIdentity, taskTickerInput, writeTask,
  type TaskCard, type TaskDecision, type TaskStage,
} from './tasks'
import { readValuationSummary, readOverrides, appendOverride } from './valuation-levers'
import { assembleContext, buildChatPrompts, scopeAvailability } from './chat-context'
import { chatTurnsInFlight, runChatTurn } from './chat-llm'
import { publicChatModelCatalogue, resolveChatRequestModel } from './chat-models'
import { computePlan, computedContextBlock, detectWhatIf, isNumberlessTargetFollowUp, loadSidecar, parseWhatIf, recordedList, repriceFromMetric, resolveAuthenticatedPriorScenario, validateIntents } from './chat-whatif'
import { ChatTurnReservationError, deleteConversation, findCompletedTurnForUser, getConversation, isValidConversationId, isValidTurnId, listConversations, recordAssistantMessageForPending, recordPendingUserMessage, rollbackUserMessage, searchConversationMemory, type UserMessageRollback } from './chat-store'
import { askMemoryMeta, compactNewsEvidence, routeAskMemory, type AskMemoryPromptContext } from './ask-memory'
import { selectCallMemories } from './call-learning'
import { dataPoolPresent, deriveSignalState, readCandidates, readConviction, readConvictionCalibration, readHandoffs, readScreenerMarkdown, readThesis, screenerBoard, screenerRunManifest, screenerSubjectLabels } from './screener'
import { listSwarms, RESEARCH_SWARM_ID, swarmById } from './swarms'
import { getNewsDiagnostics, getNewsStatus, newsProviderSpendingAllowed, startNewsIngester } from './news/scheduler'
import { parseTrendRange, readPipelineTrend, readPipelineTrendEvents } from './news/provider-routing'
import { startConvictionLoop } from './conviction-dispatch'
import { startReviewLoop } from './review-dispatch'
import { runAutotuneOnce, startAutotuneLoop } from './news/rank-weights-autotune'
import { getAutotuneState, readChanges, revertChange, setAutotunePaused, setAutotunePins } from './news/rank-weights-audit'
import { routeReason } from './news/triage/reason-router'
import { protectedResearchRecoveryOwnsSubject, startResumeSupervisor } from './resume-supervisor'
import { listResumableRuns } from './resumable'
import {
  capturePreparedModuleResumeScope, carryForwardModules, carryForwardScoped,
  continuationPlanReceiptMatches, dataPoolNewest, legacySingleRunMigrationPlan,
  prepareExactModuleContinuationPrivately, prepareModuleResume,
  thesisPlanForRequest, thesisPlanForScopeGuard,
} from './completion'
import {
  admitExactSavedRunContinuation, continueExactSavedRun, exactContinuationCandidate,
} from './continuation'
import {
  claimRunPlanRequest, markRunPlanAdmitted, markRunPlanFailedBeforeStart,
  markRunPlanStarted, readRunPlanRequest,
} from './run-plan-admission'
import {
  prepareRunPlanTransaction, recoverRunPlanTransactions, type PreSpendRetryAuthority,
} from './run-plan-transaction'
import {
  cancelPendingAdmission, deploymentFailedAfter, deploymentSucceededAfter, enqueuePendingAdmission, listPendingAdmissions,
  markPendingAdmissionAdmitting, markPendingAdmissionNeedsAttention, markPendingAdmissionStarted,
  markPendingAdmissionWaiting, pendingDeployCommit, pendingPlanDifference,
  pendingPlanMayAutoStart, pendingReceiptMatchesIntent,
  readPendingAdmission, type PendingAdmissionRecord,
} from './pending-admission'
import { beginExactModuleSupervisorPause, settleExactModuleSupervisorPause } from './exact-module-supervisor-pause'
import { sweepStaleFrozenEvidenceCapabilities } from './frozen-evidence-capability'
import {
  acquireModulePublicationLease,
  captureCompletedModuleFingerprint,
  clearPendingModulePublication,
  readPendingModulePublication,
  validPendingModulePublication,
  writePendingModulePublication,
} from './module-publication'
import { retryBoundModulePublication, type CommitRunAttempt } from './module-publication-git'
import {
  readLastProviderSelection, readProviderInterruptionAuthority, readProviderPreSpawnFailureAuthority,
  sealProviderPreSpawnFailureAuthority,
} from './execution-provenance'
import { intakePoolNewest, latestPlanFileFor, readIntakePlan, resolveIntakeRunRoot, type IntakeReceiptIntent } from './intake'
import { explainIntakeOwnerRefusal, finishedOwnerConflict, listFinishedIntakeOwners, resolveUniqueFinishedIntakeOwner, type FinishedIntakeOwner } from './intake-owner'
import { getBridgeStatus, getBridgeSubjectNames, startBridgeScheduler } from './bridge-scheduler'
import { readWhatChanged, whatChangedMarkdown, RUN_ROOT_RE } from './what-changed'
import { readDataNeeds, resolveDataNeedsRunRoot } from './data-needs'
import { PARITY_CANARY_RUN_ROOT_RE } from './provider-parity-path'
import {
  DATA_NEED_UPLOAD_MAX_BYTES, commitDataNeedUpload, discardReceivedDataNeedUpload,
  manualDataNeedUploadWriterReady,
  normalizeDataNeedSourceUrl, readDataNeedUploadStatus, receiveDataNeedUploadFile,
  selectCurrentDataNeedForUpload, triggerDataNeedUploadRouter, type ReceivedDataNeedUpload,
} from './data-need-upload'
import { appendPipelineEvent, getPipelineSource, getPipelineView, isPipelineId, listPipelineForSubject, listRecentPipeline, writeNeedLookup, writePipelineSource, type PipelineSourceKind } from './pipeline-store'
import { runRelevanceScan, type ScanSignal } from './pipeline-scan'
import { admitDiscoveredForOpenNeeds, discoverWant, openDiscoverNeeds, planTargetedNeedLookup, runFeedDiscovery, shouldSkipFeedDiscovery, type AdmittedLookupMatch } from './pipeline-discover'
import { existingConnectorFor, getBuildProgress, startConnectorDispatch, subscribeBuild } from './connector-dispatch'
import { resolveBoundConnectorUrls, resolvedConnectorSourceUrl } from './connector-url-policy'
import { getConnector } from './connector-registry'
import { startConnectorRunner, lastLedgerError } from './connector-runner'
import { startConnectorRepair } from './connector-repair'
import { readPipelines } from './pipelines'
import { SubjectBusyError, subjectMutationLockKey, withSubjectLock } from './subject-lock'
import { acquireSingletonLock, releaseSingletonLock } from './singleton-lock'
import { shellForUrl } from './static-shell'
import { AGENT_RE, EVENT_ID_RE, FEEDBACK_ID_RE, MODULE_RE, SIG_RE, THESIS_RE, TICKER_RE, isValidTicker, resolveInsideAnalyses, resolveInsideRuns, validateNewTicker, sanitizeUploadFilename } from './sandbox'
import type { RunKind, RunStatus } from './types'
import { MANIFEST_SUBJECT_RE, normalizeDataSubject } from './data-subject'
import { createMemoryReader } from './memory'
import { createMemoryRuntimeReader } from './memory-runtime'
import { researchMemoryMode } from './research-memory'
import { purgeReelTempDirs, ReelTranscriptError, transcribeInstagramReel, type ReelTranscriptProgressEvent } from './reel-transcript'
import { getProviderAdapter, isProviderEnabled, isRunProvider, listProviderAdapters, providerDisabledReason } from './providers/registry'
import type { RunProvider } from './providers/types'

// async execFile (never execFileSync in a request handler — a python board rebuild takes seconds and
// execFileSync would freeze the single event loop, stalling every other request incl. SSE pings; see
// readiness.ts / write-inbox.ts for the same rule).
const execFileAsync = promisify(execFile)

export interface BootAdmissionSchedulerDeps {
  reconcilePaidRecovery: () => Promise<void>
  startPendingDrain: () => void
}

/** Boot admission ordering is part of the spend contract: already-paid exact recovery gets one awaited
 * reconciliation pass before any queued post-update/new-work drain is allowed to start. */
export async function startBootAdmissionSchedulers(deps: BootAdmissionSchedulerDeps): Promise<void> {
  await deps.reconcilePaidRecovery()
  deps.startPendingDrain()
}

// keepAliveTimeout MUST exceed cloudflared's (scripts/ops/cloudflared-config.yml.example: 90s) so the
// PROXY always closes an idle pooled connection first, never the origin. Node's Fastify default (72s) is
// SHORTER than 90s: cloudflared would reuse a socket the origin had already closed → intermittent
// 502 Bad Gateway under low traffic. 92s clears 90s with margin (Node auto-raises headersTimeout above it).
export interface BuiltServerApp {
  app: FastifyInstance
  start: () => Promise<void>
  shutdown: (signal: string, code?: number) => Promise<void>
}

/** Build the complete control plane without claiming the process singleton, opening a listener, installing
 * process handlers, recovering provider processes, or starting background schedulers. Tests use `app.inject`
 * against this boundary; production calls `start()` exactly once from the executable entry point below. */
export async function buildApp(): Promise<BuiltServerApp> {
const app = Fastify({ logger: false, keepAliveTimeout: 92_000 })
// Tolerate an EMPTY application/json body. A bodyless POST (cancel, credit-check) sent WITH
// content-type: application/json is otherwise rejected 400 FST_ERR_CTP_EMPTY_JSON_BODY before the route
// even runs. Empty -> undefined body (the route runs); non-empty -> parsed (a route needing a body still
// 400s on its own validation); malformed -> 400 (matches Fastify's default parser, not a leaked 500).
app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
  const s = (body as string)?.trim()
  if (!s) return done(null, undefined)
  try { done(null, JSON.parse(s)) } catch (e) { done(Object.assign(e as Error, { statusCode: 400 }), undefined) }
})
// Belt-and-braces catch-all so a state-changing POST can NEVER be rejected 415 "Unsupported Media Type"
// before its route runs. That 415 comes from Fastify's content-type layer when a request arrives with a
// content-type it has no parser for — e.g. a stale client build, a proxy that stamps text/plain or
// application/x-www-form-urlencoded onto a bodyless cancel, or any future caller — and it surfaced to the
// user as "Couldn't cancel the run: Unsupported Media Type" with no way to stop a run. Our bodyless POSTs
// (cancel, cancel-all, subject-cancel, credit-check) carry nothing to parse; the ones that DO need a body
// (launch, readiness-decision) send application/json (handled above) and still validate via zod. So a
// permissive fallback — parse JSON when the body looks like JSON, otherwise hand the route an empty body —
// is safe. Fastify matches the specific application/json + multipart parsers ahead of this '*', so JSON
// routes still parse and uploads are untouched (verified: only unmatched content-types fall here).
app.addContentTypeParser('*', { parseAs: 'string' }, (_req, body, done) => {
  const s = (body as string)?.trim()
  if (!s) return done(null, undefined)
  try { done(null, JSON.parse(s)) } catch { done(null, undefined) } // non-JSON body on a route that doesn't need one — ignore, never 415
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
// Every live SSE response is tracked here so graceful shutdown can end them cleanly (see below). All four
// SSE endpoints funnel through startSSE, so registering once here covers them all with no per-endpoint edit.
const liveResponses = new Set<import('node:http').ServerResponse>()
function startSSE(reply: FastifyReply) {
  reply.hijack()
  const res = reply.raw
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  liveResponses.add(res)
  res.on('close', () => liveResponses.delete(res))
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
  return { ok: true, repoRoot: REPO_ROOT, deploymentPending: providerDeployPending(STATE_DIR) }
})

// Durable launch intent is intentionally separate from the run registry: waiting for an update has not
// admitted provider work and must never manufacture a runId or a fake active run. Activity reads this small
// queue beside the live registry, and a restart reads the same owner-only receipts from STATE_DIR.
app.get('/api/pending-admissions', async (req, reply) => {
  reply.header('cache-control', 'no-store')
  const { user } = identify(req)
  const admin = isDispatchAdmin(user)
  return {
    requests: listPendingAdmissions(STATE_DIR, true)
      .filter((record) => record.status !== 'started' && record.status !== 'cancelled' && (admin || record.user === user))
      .map((record) => ({
        requestId: record.requestId,
        user: record.user,
        userVia: record.userVia,
        ticker: record.ticker,
        action: record.action,
        sourceRunRoot: record.sourceRunRoot,
        provider: record.provider,
        model: record.model,
        reasoningLevel: record.reasoningLevel,
        expectedProfileKey: record.expectedProfileKey,
        status: record.status,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        attention: record.attention,
        planDifference: record.planDifference,
      })),
  }
})

app.post('/api/pending-admissions/:requestId/cancel', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  const requestId = String((req.params as any)?.requestId || '')
  if (!/^[0-9a-f-]{36}$/i.test(requestId)) return reply.code(400).send({ error: 'invalid request id' })
  const { user } = identify(req)
  try {
    const request = cancelPendingAdmission(requestId, { user, isAdmin: isDispatchAdmin(user) })
    return { ok: true, request }
  } catch (error: any) {
    return reply.code(error?.statusCode || 409).send({ error: error?.message || 'could not cancel the waiting request' })
  }
})

// One shared, read-only Memory view for research, screener and commodity. The reader owns the fixed
// internal classification, projection path and trusted digest; callers cannot widen policy or select files.
const memoryReader = createMemoryReader({ repoRoot: REPO_ROOT, stateDir: STATE_DIR })
const memoryRuntimeReader = createMemoryRuntimeReader({
  repoRoot: REPO_ROOT,
  stateRoot: path.resolve(process.env.NOSTRA_MEMORY_STATE_ROOT || path.join(STATE_DIR, 'memory-runtime')),
  mode: researchMemoryMode(),
  serviceIdentities: {
    'projection-query': process.env.NOSTRA_MEMORY_PROJECTION_SERVICE_IDENTITY,
    'candidate-intake': process.env.NOSTRA_MEMORY_CANDIDATE_INTAKE_IDENTITY,
    'independent-verification': process.env.NOSTRA_MEMORY_VERIFIER_IDENTITY,
    'canonical-writing': process.env.NOSTRA_MEMORY_WRITER_OWNER,
    'promotion-pr': process.env.NOSTRA_MEMORY_PROMOTION_SERVICE_IDENTITY,
    'emergency-quarantine': process.env.NOSTRA_MEMORY_QUARANTINE_SERVICE_IDENTITY,
    'restore-retirement': process.env.NOSTRA_MEMORY_RESTORE_SERVICE_IDENTITY,
  },
})
app.get('/api/memory', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (_req, reply) => {
  reply.header('cache-control', 'no-store')
  // Unavailability is part of memory-ui/1, not a transport failure. Keep it a parseable 200 so the
  // cockpit can explain that state; an actual missing route/network failure remains distinguishable.
  return memoryReader.read()
})

app.get('/api/memory/runtime', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (_req, reply) => {
  reply.header('cache-control', 'no-store')
  return await memoryRuntimeReader.runtime()
})

app.get('/api/memory/runs/:runId', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
  reply.header('cache-control', 'no-store')
  const parsed = z.object({ runId: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,191}$/) }).safeParse(req.params)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid memory run id' })
  const run = await memoryRuntimeReader.runs(parsed.data.runId)
  return run || reply.code(404).send({ error: 'memory run not found' })
})

app.get('/api/memory/lessons', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (_req, reply) => {
  reply.header('cache-control', 'no-store')
  return { contract_version: 'memory-lessons-ui/1', read_only: true, items: await memoryRuntimeReader.lessons() }
})

app.get('/api/memory/playbooks', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (_req, reply) => {
  reply.header('cache-control', 'no-store')
  return { contract_version: 'memory-playbooks-ui/1', read_only: true, items: await memoryRuntimeReader.playbooks() }
})

app.get('/api/memory/candidates', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (_req, reply) => {
  reply.header('cache-control', 'no-store')
  return { contract_version: 'memory-candidates-ui/1', read_only: true, items: await memoryRuntimeReader.candidates() }
})

function validMemoryQuarantineToken(req: FastifyRequest): boolean {
  const configured = String(process.env.NOSTRA_MEMORY_QUARANTINE_TOKEN || '')
  const raw = req.headers['x-nostra-memory-quarantine-token']
  const supplied = Array.isArray(raw) ? raw[0] : raw
  if (!configured || typeof supplied !== 'string') return false
  const left = createHash('sha256').update(configured).digest()
  const right = createHash('sha256').update(supplied).digest()
  return timingSafeEqual(left, right)
}

app.post('/api/memory/playbooks/quarantine', { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } }, async (req, reply) => {
  reply.header('cache-control', 'no-store')
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  if (!process.env.NOSTRA_MEMORY_QUARANTINE_TOKEN) return reply.code(503).send({ error: 'memory quarantine identity is not configured' })
  if (!validMemoryQuarantineToken(req)) return reply.code(401).send({ error: 'memory quarantine authentication failed' })
  const parsed = z.object({
    playbook_id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._\/-]{0,127}$/),
    version: z.number().int().positive().optional(),
    reason: z.enum(['policy-leak', 'stale-fact', 'prompt-injection', 'serious-evidence-error', 'operator-emergency', 'provider-incident', 'purge-pending']),
  }).strict().safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid playbook quarantine request' })
  try {
    return await memoryRuntimeReader.control({ operation: 'playbook-quarantine', ...parsed.data })
  } catch {
    return reply.code(503).send({ error: 'memory playbook quarantine failed closed' })
  }
})

// ---------- Tools: Reel to Transcript ----------
// One narrow media utility: validate an Instagram Reel URL, fetch that one media item into a temporary
// directory, transcribe its speech, then delete the media before replying. The route never accepts a
// caller-controlled host or output path. A low route budget also keeps repeated media/model work bounded.
let reelTranscriptsInFlight = 0
app.post('/api/tools/reel-transcript', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const parsed = z.object({ url: z.string().trim().min(1).max(2_000) }).safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'Paste an Instagram Reel link.', code: 'invalid-reel-url' })
  if (reelTranscriptsInFlight >= 2) return reply.code(429).send({ error: 'Two Reels are already being transcribed. Try again shortly.', code: 'transcription-busy' })
  reelTranscriptsInFlight += 1
  const accepts = Array.isArray(req.headers.accept) ? req.headers.accept.join(',') : req.headers.accept
  const wantsProgressStream = typeof accepts === 'string' && accepts.toLowerCase().includes('text/event-stream')
  const requestStartedAt = Date.now()
  reply.header('cache-control', 'no-store')
  const disconnected = new AbortController()
  let handlerFinished = false
  const cancelDisconnected = () => {
    if (!handlerFinished && !disconnected.signal.aborted) {
      disconnected.abort(new ReelTranscriptError('Reel transcription was cancelled.', 'transcription-cancelled', 499))
    }
  }
  req.raw.once('aborted', cancelDisconnected)
  reply.raw.once('close', cancelDisconnected)
  const signal = AbortSignal.any([disconnected.signal, AbortSignal.timeout(135_000)])
  let stream: ReturnType<typeof startSSE> | null = null
  try {
    if (wantsProgressStream) stream = startSSE(reply)
    const progressStream = stream
    const result = await transcribeInstagramReel(parsed.data.url, {
      stateDir: STATE_DIR,
      ...TOOLS.reelTranscript,
    }, {
      signal,
      ...(progressStream ? { onProgress: (progress: ReelTranscriptProgressEvent) => {
        progressStream.send({ type: 'reel-progress', ...progress })
      } } : {}),
    })
    if (stream) {
      stream.send({ type: 'reel-result', result, elapsedMs: Date.now() - requestStartedAt })
      return reply
    }
    return result
  } catch (cause) {
    if (disconnected.signal.aborted && reply.raw.destroyed) return reply
    if (cause instanceof ReelTranscriptError) {
      if (stream) {
        stream.send({ type: 'reel-error', error: cause.message, code: cause.code, status: cause.statusCode, elapsedMs: Date.now() - requestStartedAt })
        return reply
      }
      return reply.code(cause.statusCode).send({ error: cause.message, code: cause.code })
    }
    console.error('[reel-transcript] unexpected failure', cause)
    if (stream) {
      stream.send({ type: 'reel-error', error: 'The Reel could not be transcribed. Try again.', code: 'transcription-failed', status: 500, elapsedMs: Date.now() - requestStartedAt })
      return reply
    }
    return reply.code(500).send({ error: 'The Reel could not be transcribed. Try again.', code: 'transcription-failed' })
  } finally {
    handlerFinished = true
    req.raw.off('aborted', cancelDisconnected)
    reply.raw.off('close', cancelDisconnected)
    reelTranscriptsInFlight -= 1
    if (stream) {
      clearInterval(stream.ping)
      try { stream.res.end() } catch { /* already closed */ }
    }
  }
})

// ---------- swarms (manifest list for the cockpit's swarm switcher) ----------
app.get('/api/swarms', async () =>
  // verdictField: the swarm's self-declared routing verdict key (SWARM.md), lets the client read the
  // decision record's verdict generically (research has none — its records use `decision`).
  // wire: the swarm's self-declared news-wire capability (SwarmWireDecl) — ABSENT unless declared, so a
  // new client on an old server (deploy skew) sees no `wire` key and keeps the wire surface off.
  listSwarms().map((s) => ({ id: s.id, label: s.label, color: s.color, unit: s.unit, order: s.order, layout: s.layout, verdictField: s.routing?.verdictField, ...(s.wire ? { wire: s.wire } : {}) })),
)

// The per-subject PULSE — price / positioning / next scheduled reports / last run verdict — for a swarm
// whose manifest declares `wire.pulse` (news/commodity-pulse.ts). Generic: no swarm id appears here; an
// undeclared swarm (or NEWS_PULSE_ENABLED=0) 404s, which the client treats as absence (fail-closed).
app.get('/api/swarm/pulse', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req, reply) => {
  const swarm = (req.query as any)?.swarm as string | undefined
  const m = swarm ? swarmById(swarm) : undefined
  if (!m) return reply.code(404).send({ error: `unknown swarm ${swarm || ''}` })
  if (!m.wire?.pulse || !NEWS.pulseEnabled) return reply.code(404).send({ error: 'no pulse declared for this swarm' })
  const snap = await getPulse(m.id)
  if (!snap) return reply.code(404).send({ error: 'no pulse available' })
  return snap
})

// The forward EVENTS CALENDAR (news/events-calendar.ts): date-sorted upcoming earnings (Nasdaq US + NSE
// India) + macro releases (investing.com). Lazy + TTL-cached; 404 when disabled. Never throws — a total
// source outage returns an empty, all-unhealthy, stale snapshot so the UI can say "the calendar is down".
app.get('/api/calendar', { config: { rateLimit: { max: 300, timeWindow: '1 minute' } } }, async (_req, reply) => {
  if (!NEWS.calendarEnabled) return reply.code(404).send({ error: 'events calendar disabled' })
  const snap = await getCalendar()
  if (!snap) return reply.code(404).send({ error: 'events calendar disabled' })
  return snap
})

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
      const normalized = normalizeDataSubject(swarm, subject)
      if (!normalized) return reply.code(400).send({ error: 'bad subject' })
      return reply.type('application/json').send(graphForSubject(swarm, normalized))
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
  // `subjects` (names) stays for back-compat + the wire's subject grouping; `summaries` adds each subject's
  // run verdict/confidence/date so the picker can show runs the way research shows per-ticker decisions.
  return { swarm, subjects: swarmSubjects(swarm), summaries: swarmSubjectSummaries(swarm) }
})

// ---------- tickers ----------
// driveEnabled tells the cockpit whether the in-app add-company / upload UI can work (a Drive
// destination folder + a credential are both configured); the UI hides those controls otherwise.
// explicit per-route rate-limit (same budget as the global cap) so CodeQL recognizes the limiter on this
// filesystem-reading handler (js/missing-rate-limiting); the global @fastify/rate-limit still applies too.
// `driveEnabled` gates the pool-upload UI and still means the Drive API. `watchlistFilesEnabled` is the
// separate, weaker capability watchlist attachments actually need: a writable Drive MOUNT, which needs no
// credential — so the composer can offer attaching on a machine where the API was never configured.
app.get('/api/tickers', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async () => ({
  ...listTickers(), driveEnabled: GDRIVE_ENABLED, watchlistFilesEnabled: watchlistFilesAvailable() || GDRIVE_ENABLED,
}))

type ManualPoolOwnerError = NonNullable<ReturnType<typeof finishedOwnerConflict>> | { code: 'shared_data_owner_unavailable'; owners: string[] }
type SelectedManualOwnerConflict = ManualPoolOwnerError
  | { code: 'shared_data_owner_required'; owners: string[] }
  | { code: 'shared_data_owner_run_mismatch'; owners: string[] }

function manualPoolOwnerError(expectedSwarm: string, subject: string): ManualPoolOwnerError | null {
  try {
    return finishedOwnerConflict(expectedSwarm, listFinishedIntakeOwners(subject))
  } catch {
    return { code: 'shared_data_owner_unavailable', owners: [] }
  }
}

function manualPoolOwnerReply(reply: FastifyReply, subject: string, conflict: ManualPoolOwnerError) {
  const message = conflict.code === 'shared_data_owner_ambiguous'
    ? `${subject} has finished ideas in more than one cockpit (${conflict.owners.join(', ')}). Separate or rename the shared data folder before adding data.`
    : conflict.code === 'shared_data_owner_mismatch'
      ? `data/${subject} belongs to the ${conflict.owners[0]} cockpit, not this cockpit.`
      : `The owner of data/${subject} could not be verified. Nothing was written.`
  return reply.code(409).send({ error: message, code: conflict.code, subject, owners: conflict.owners })
}

/** A selected-call manual upload is stricter than an ordinary producer: exactly one finished owner must
 *  match BOTH the selected swarm and run root. Zero-owner uploads cannot be decision-scoped, and a newer
 *  standing call may not reuse an old card's authority. */
function selectedManualUploadOwner(
  swarmId: string,
  subject: string,
  runRoot?: string,
): { owner?: FinishedIntakeOwner; conflict?: SelectedManualOwnerConflict } {
  let owners: FinishedIntakeOwner[]
  try { owners = listFinishedIntakeOwners(subject) } catch {
    return { conflict: { code: 'shared_data_owner_unavailable', owners: [] } }
  }
  const base = finishedOwnerConflict(swarmId, owners)
  if (base) return { conflict: base }
  if (owners.length !== 1) return { conflict: { code: 'shared_data_owner_required', owners: [] } }
  const owner = owners[0]!
  if (runRoot !== undefined && owner.runRoot !== runRoot) {
    return { conflict: { code: 'shared_data_owner_run_mismatch', owners: [owner.swarm] } }
  }
  return { owner }
}

function selectedManualUploadOwnerReply(
  reply: FastifyReply,
  subject: string,
  result: Exclude<ReturnType<typeof selectedManualUploadOwner>['conflict'], undefined>,
) {
  if (result.code === 'shared_data_owner_required') {
    return reply.code(409).send({ error: `No finished ${subject} call owns this upload. Finish the idea first.`, code: result.code, subject, owners: result.owners })
  }
  if (result.code === 'shared_data_owner_run_mismatch') {
    return reply.code(409).send({ error: `The selected ${subject} call is no longer the data-pool owner. Refresh the idea.`, code: result.code, subject, owners: result.owners })
  }
  return manualPoolOwnerReply(reply, subject, result)
}

// Add a company = create a <TICKER> folder in the shared Drive (the cloud twin of local data/). The
// engine keeps reading the local mount, so the new company surfaces in the picker once Drive syncs the
// folder back down (a few seconds). Validation reuses the exact ticker rules + reserved-name guard.
app.post('/api/tickers', async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  if (!GDRIVE_ENABLED) return reply.code(400).send({ error: 'Drive uploads are not configured on this server' })
  const parsed = z.object({
    ticker: z.string(),
    legalName: z.string().trim().min(1).max(256),
    venue: z.enum(['NYSE', 'NasdaqGS', 'NasdaqCM', 'NasdaqGM', 'NSE', 'DFM', 'XTRA', 'Oslo Børs', 'SHSE', 'HKEX', 'LSE']),
    currency: z.string().regex(/^[A-Z]{3}$/),
    identifiers: z.array(z.string().regex(/^(?:issuer:lei:[A-Z0-9]{20}|security:figi:[A-Z0-9]{12}|security:isin:[A-Z]{2}[A-Z0-9]{9}[0-9])$/)).max(3).default([]),
  }).strict().safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const v = validateNewTicker(parsed.data.ticker)
  if (!v.ok) return reply.code(400).send({ error: v.reason, suggested: v.suggested })
  const { ticker } = v
  const identity = {
    legalName: parsed.data.legalName,
    venue: parsed.data.venue,
    currency: parsed.data.currency,
    ticker,
    identifiers: [...new Set(parsed.data.identifiers)].sort(),
  }
  const { user, userVia } = identify(req)
  try {
    await ensureCompanyFolder(ticker)
    const sidecar = await ensureCompanyIdentity(ticker, identity)
    if (!sidecar.created) {
      return reply.code(409).send({ error: `${ticker} already exists` })
    }
    console.log(`[upload] ${user} (${userVia}) created company ${ticker} in Drive`)
    return { ok: true, ticker, identity }
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
  // This is the standard COMPANY document lane. A legacy/modern commodity dossier with the same label
  // owns that shared pool too; refuse before consuming multipart bytes instead of silently filing its
  // evidence as equity research. Zero owners remains valid for a genuinely new company.
  const ownerConflict = manualPoolOwnerError(RESEARCH_SWARM_ID, ticker)
  if (ownerConflict) return manualPoolOwnerReply(reply, ticker, ownerConflict)
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
  if (!isValidTicker(ticker)) return reply.code(400).send({ error: 'bad ticker' })
  reply.header('cache-control', 'no-store')
  return dataScans.run(ticker)
})

// New browsers start the server-owned scan and then use short status reads. The expensive work is never
// tied to one 15-second browser request, so a large first-time pool cannot vanish when that request times out.
app.post('/api/data-status/:ticker/scan', async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  const ticker = (req.params as any).ticker as string
  if (!isValidTicker(ticker)) return reply.code(400).send({ error: 'bad ticker' })
  reply.header('cache-control', 'no-store')
  void dataScans.run(ticker).catch(() => {})
  return reply.code(202).send({ progress: dataScans.current(ticker) })
})

app.get('/api/data-status/:ticker/result', async (req, reply) => {
  const ticker = (req.params as any).ticker as string
  if (!isValidTicker(ticker)) return reply.code(400).send({ error: 'bad ticker' })
  reply.header('cache-control', 'no-store')
  const progress = dataScans.current(ticker)
  const data = dataScans.result(ticker)
  if (data && progress?.stage === 'ready') return { status: 'ready', progress, data }
  if (progress?.stage === 'failed') return { status: 'failed', progress, data: null }
  return reply.code(202).send({ status: progress ? 'running' : 'not_started', progress, data: null })
})

// A refresh does not make a live scan disappear. This small read endpoint and the SSE replay below expose
// the same server-owned snapshot; neither starts new work.
app.get('/api/data-status/:ticker/progress', async (req, reply) => {
  const ticker = (req.params as any).ticker as string
  if (!isValidTicker(ticker)) return reply.code(400).send({ error: 'bad ticker' })
  reply.header('cache-control', 'no-store')
  return { progress: dataScans.current(ticker) }
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
app.get('/api/credit', async () => getCreditStatus('claude'))
app.post('/api/credit-check', async () => creditCheck())

async function providerStatus(provider: RunProvider, checkUsage = false) {
  const adapter = getProviderAdapter(provider)
  const enabled = isProviderEnabled(provider)
  const availability = enabled
    ? await adapter.getAvailability({ refresh: checkUsage })
    : { available: false, availability: 'unavailable' as const, reason: providerDisabledReason(provider) }
  let usage = enabled && getCreditStatus(provider).checked ? getCreditStatus(provider) : null
  if (checkUsage && enabled && availability.available) {
    try { usage = await checkProviderUsage(provider) } catch { /* availability remains authoritative */ }
  }
  const resolved = adapter.resolveProfile({})
  return {
    provider,
    label: adapter.profile.label,
    enabled,
    available: enabled && availability.available,
    availability: availability.availability,
    checked: true,
    reason: availability.reason,
    profile: resolved.executionProfile,
    defaultProfileKey: adapter.profile.defaultProfileKey,
    profiles: adapter.profile.profiles,
    usage,
    cliVersion: availability.cliVersion,
  }
}

app.get('/api/providers', async () => {
  const providers = await Promise.all(listProviderAdapters().map((adapter) => providerStatus(adapter.profile.provider)))
  return { providers, checkedAt: new Date().toISOString() }
})

app.post('/api/providers/:provider/check', async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  const provider = (req.params as any).provider
  if (!isRunProvider(provider)) return reply.code(404).send({ error: 'unknown provider' })
  return providerStatus(provider, true)
})

// ---------- identity + activity log ----------
// who am I (per Cloudflare Access) — drives the "signed in as" line in the cockpit
app.get('/api/whoami', async (req) => {
  const who = identify(req)
  // canDispatch drives the admin-only "Send to coding engine" button — reflects BOTH the allowlist and
  // whether dispatch is actually runnable (enabled + PR token), so the button never appears when it'd fail.
  // canScanPipeline / canBuildConnector gate the Data Pipeline panel's scan + build buttons the same way.
  // emailEnabled drives the reporter-notification UI on resolved cards — hidden entirely when the engine
  // has no email token, so the panel behaves exactly as before on a deploy without email configured.
  const admin = isDispatchAdmin(who.user)
  return {
    ...who,
    canDispatch: admin && feedbackDispatchReady(),
    canScanPipeline: admin && pipelineScanReady(),
    canBuildConnector: admin && connectorDispatchReady(),
    // The release canary is intentionally exposed only through an authenticated cockpit session.
    // Inspection remains available after the launch gate is turned off: an already-spent canary must
    // never disappear merely because the operator safely disabled new parity launches.
    canInspectProviderParity: admin && who.userVia === 'cf-access',
    // This is a capability hint for rendering; the POST route repeats the admin + feature gates.
    canLaunchProviderParity: admin && process.env.ENGINE_PROVIDER_PARITY_ENABLED === '1',
    emailEnabled: feedbackEmailReady(),
  }
})

// perpetual audit log of cockpit-initiated runs, with filters (time / ticker / kind / user / status / text)
app.get('/api/activity', async (req) => {
  const q = req.query as any
  const num = (v: any) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  const kinds = ACTIVITY_FILTER_KINDS as readonly string[]
  const statuses = ACTIVITY_FILTER_STATUSES as readonly string[]
  // Swarm runs are keyed by an opaque subject id (a SIG-… signal id); resolve each to the company /
  // headline it concerns so the Company column reads as a name, not an id. Falls back to the raw id.
  return readActivity({
    from: num(q.from),
    to: num(q.to),
    ticker: typeof q.ticker === 'string' && (TICKER_RE.test(q.ticker) || SIG_RE.test(q.ticker)) ? q.ticker : undefined,
    kind: kinds.includes(q.kind) ? q.kind : undefined,
    user: typeof q.user === 'string' && q.user ? q.user.slice(0, 200) : undefined,
    status: statuses.includes(q.status) ? q.status : undefined,
    provider: isRunProvider(q.provider) ? q.provider : undefined,
    q: typeof q.q === 'string' ? q.q.slice(0, 100) : undefined,
    limit: num(q.limit),
  }, screenerSubjectLabels())
})

// ---------- launch estimate ----------
// Discriminated by kind: research kinds require a TICKER; screener kinds validate their own
// subject shape (signal: optional SIG id / none for a new signal; sweep: nothing; handoff: ticker).
const EXACT_DECISION_LAUNCH_CONTRACT = 'exact-decision-launch/1' as const
const EXACT_INTAKE_ORB_CONTRACT = 'exact-intake-orb/1' as const
const ProviderLaunchFields = {
  // This is the ONE compatibility boundary: an old client with no provider field means Claude.
  provider: z.enum(['claude', 'codex']).default('claude'),
  model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i).optional(),
  reasoningLevel: z.string().regex(/^[a-z0-9_-]{1,24}$/i).optional(),
  expectedProfileKey: z.string().min(1).max(240).optional(),
}
// Query and POST launch boundaries must parse the exact same provider/profile identity. Keeping one
// field set prevents a newly added immutable field from being accepted by paid POSTs but silently
// stripped from estimates (which would make a non-default model impossible to price or confirm).
const ProviderQuery = z.object(ProviderLaunchFields)
const ProviderBody = z.object(ProviderLaunchFields)
const ExactPlanBindingFields = {
  planPath: z.string().min(1).max(700).optional(),
  planSha256: z.string().regex(/^sha256:[a-f0-9]{64}$/).optional(),
  sourceDecisionFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/).optional(),
}
const exactPlanFieldsAreComplete = (value: Record<string, unknown>): boolean => {
  const count = ['planPath', 'planSha256', 'sourceDecisionFingerprint'].filter((key) => value[key] !== undefined).length
  return count === 0 || count === 3
}
const ExactDecisionEstimateQuery = z.object({
  runRoot: z.string().min(1).max(300).optional(),
  decisionFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/).optional(),
  ...ExactPlanBindingFields,
}).refine(exactPlanFieldsAreComplete, { message: 'intake plan binding must be complete' })

function exactDecisionLaunchReceipt(
  binding: { runRoot: string; decisionFingerprint: string },
  intakePlan?: IntakeReceiptIntent,
) {
  return {
    contractVersion: EXACT_DECISION_LAUNCH_CONTRACT,
    runRoot: binding.runRoot,
    decisionFingerprint: binding.decisionFingerprint,
    ...(intakePlan ? { intakePlan: { contractVersion: EXACT_INTAKE_ORB_CONTRACT, ...intakePlan } } : {}),
  }
}

function exactActionableIntakeOrb(
  swarmId: string,
  subject: string,
  runRoot: string,
  module: string | undefined,
  agent: string | undefined,
  requested?: IntakeReceiptIntent,
): IntakeReceiptIntent | null {
  if (!module || !agent) return null
  const intake = readIntakePlan(subject, { swarmId, runRoot })
  const actionable = intake?.actionable === true && intake.widened.length === 0
    && intake.rerun_plan.commands.some((command) => command.module === module && command.agent === agent)
  if (!actionable || !intake?.decision_fingerprint) return null
  const actual = {
    planPath: intake.plan_path,
    planSha256: intake.plan_sha256,
    sourceDecisionFingerprint: intake.decision_fingerprint,
  }
  if (requested && (requested.planPath !== actual.planPath || requested.planSha256 !== actual.planSha256
      || requested.sourceDecisionFingerprint !== actual.sourceDecisionFingerprint)) return null
  return actual
}

function exactDecisionLaunchBinding(
  swarmId: string, subject: string, runRoot: string | undefined, decisionFingerprint: string | undefined,
): { runRoot: string; decisionFingerprint: string } | null {
  // Every user-paid rerun is call-bound. Missing identity is not a legacy convenience: during a rolling
  // web/server deploy it would silently turn an old UI request into "rerun whatever is current now".
  if (!runRoot || !decisionFingerprint) return null
  const exact = readDataNeeds(swarmId, subject, runRoot)
  const current = readDataNeeds(swarmId, subject)
  if (!exact || !current || exact.run_root !== current.run_root
      || exact.decision_fingerprint !== decisionFingerprint
      || current.decision_fingerprint !== decisionFingerprint) return null
  return { runRoot: exact.run_root, decisionFingerprint }
}

function boundLaunchEstimate(
  reply: FastifyReply,
  selection: RunProviderSelection,
  kind: RunKind,
  subject: string,
  module: string | undefined,
  agent: string | undefined,
  swarm: string | undefined,
  rawRunRoot: unknown,
  rawDecisionFingerprint: unknown,
  rawPlanPath?: unknown,
  rawPlanSha256?: unknown,
  rawSourceDecisionFingerprint?: unknown,
) {
  const parsed = ExactDecisionEstimateQuery.safeParse({
    runRoot: rawRunRoot,
    decisionFingerprint: rawDecisionFingerprint,
    planPath: rawPlanPath,
    planSha256: rawPlanSha256,
    sourceDecisionFingerprint: rawSourceDecisionFingerprint,
  })
  if (!parsed.success) return reply.code(400).send({ error: 'invalid exact decision binding' })
  const { runRoot, decisionFingerprint, planPath, planSha256, sourceDecisionFingerprint } = parsed.data
  if (kind !== 'rerun') {
    if (runRoot || decisionFingerprint || planPath || planSha256 || sourceDecisionFingerprint) {
      return reply.code(400).send({ error: 'exact call binding is rerun-only' })
    }
    return estimate(kind, subject, selection.provider, module, agent, swarm, selection.model, selection.reasoningLevel, selection.expectedProfileKey)
  }
  const binding = exactDecisionLaunchBinding(swarm || RESEARCH_SWARM_ID, subject, runRoot, decisionFingerprint)
  if (!binding) return reply.code(409).send({ error: 'selected_decision_required' })
  const requestedPlan = planPath && planSha256 && sourceDecisionFingerprint
    ? { planPath, planSha256, sourceDecisionFingerprint }
    : undefined
  const intakePlan = requestedPlan
    ? exactActionableIntakeOrb(swarm || RESEARCH_SWARM_ID, subject, binding.runRoot, module, agent, requestedPlan)
    : undefined
  if (requestedPlan && !intakePlan) return reply.code(409).send({ error: 'intake_plan_changed' })
  return {
    ...estimate(kind, subject, selection.provider, module, agent, swarm, selection.model, selection.reasoningLevel, selection.expectedProfileKey),
    exactDecisionBinding: exactDecisionLaunchReceipt(binding, intakePlan ?? undefined),
  }
}

app.get('/api/launch/estimate', async (req, reply) => {
  const q = req.query as any
  const providerParsed = ProviderQuery.safeParse(q)
  if (!providerParsed.success) return reply.code(400).send({ error: 'invalid provider profile' })
  const selection = providerParsed.data
  const kind = q.kind as RunKind
  // generic constellation swarm (e.g. commodity): reused full/module/agent kinds scoped by ?swarm=
  const swarm = q.swarm as string | undefined
  if (swarm && swarm !== 'research') {
    if (!listSwarms().some((s) => s.id === swarm)) return reply.code(400).send({ error: 'unknown swarm' })
    if (!['full', 'module', 'agent', 'rerun', 'review'].includes(kind)) return reply.code(400).send({ error: 'bad kind for swarm' })
    const manifest = listSwarms().find((item) => item.id === swarm)
    if (kind === 'review' && (!manifest?.reviewCommand || !manifest.calibrator || !manifest.calibrationRoot)) {
      return reply.code(400).send({ error: `swarm ${swarm} does not declare tracked review + calibration support` })
    }
    const subject = normalizeDataSubject(swarm, q.ticker)
    if (!subject) return reply.code(400).send({ error: 'bad subject' })
    if (kind === 'module' || kind === 'agent' || kind === 'rerun') {
      if (!q.module || !listModuleNames(swarm).includes(q.module)) return reply.code(400).send({ error: 'unknown module' })
    }
    if ((kind === 'agent' || (kind === 'rerun' && q.agent))
        && !agentNamesForModule(q.module, swarm).includes(q.agent)) return reply.code(400).send({ error: 'unknown agent for module' })
    return boundLaunchEstimate(reply, selection, kind, subject, q.module, q.agent, swarm, q.runRoot, q.decisionFingerprint,
      q.planPath, q.planSha256, q.sourceDecisionFingerprint)
  }
  const researchKinds = ['full', 'module', 'agent', 'rerun', 'review', 'track']
  const screenerKinds = ['signal', 'sweep', 'screener-agent', 'handoff']
  if (![...researchKinds, ...screenerKinds].includes(kind)) return reply.code(400).send({ error: 'bad kind' })
  if (researchKinds.includes(kind)) {
    if (!TICKER_RE.test(q.ticker || '')) return reply.code(400).send({ error: 'bad ticker' })
    return boundLaunchEstimate(reply, selection, kind, q.ticker, q.module, q.agent, undefined, q.runRoot, q.decisionFingerprint,
      q.planPath, q.planSha256, q.sourceDecisionFingerprint)
  }
  if (kind === 'screener-agent' && !SIG_RE.test(q.ticker || '')) return reply.code(400).send({ error: 'bad signal id' })
  if (kind === 'handoff' && !TICKER_RE.test(q.ticker || '')) return reply.code(400).send({ error: 'bad ticker' })
  return boundLaunchEstimate(reply, selection, kind, q.ticker || '', q.module, q.agent, undefined, q.runRoot, q.decisionFingerprint,
    q.planPath, q.planSha256, q.sourceDecisionFingerprint)
})

// ---------- launch ----------
// One discriminated body per kind family. Research kinds keep their EXACT pre-swarm contract
// (ticker + typed full-run confirmation); screener kinds carry their own subjects.
const ResearchLaunchBody = z.object({
  ...ProviderLaunchFields,
  kind: z.enum(['full', 'module', 'agent', 'rerun', 'review', 'track']),
  ticker: z.string().regex(TICKER_RE),
  module: z.string().regex(MODULE_RE).optional(),
  agent: z.string().regex(AGENT_RE).optional(),
  // review window (for kind 'review'); ignored by other kinds. Defaults to ad-hoc below.
  window: z.enum(['30d', '90d', '180d', '365d', '24m', '36m', 'ad-hoc', 'post-mortem']).optional(),
  model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i).optional(),
  confirmTicker: z.string().optional(),
  // A confirmed full-run click carries one durable identity so an update can queue it without creating a
  // fake run. Older clients may omit it while no deployment is pending; queuing fails closed without it.
  requestId: z.string().uuid().optional(),
  // "Run anyway": stop any in-flight run on this ticker that holds the lock, then launch (overwrite OK).
  force: z.boolean().optional(),
  runRoot: z.string().min(1).max(300).optional(),
  decisionFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/).optional(),
  memoryIdentity: z.object({
    legalName: z.string().trim().min(1).max(256),
    venue: z.string().trim().min(1).max(80),
    currency: z.string().regex(/^[A-Z]{3}$/),
    ticker: z.string().regex(TICKER_RE),
    identifiers: z.array(z.string().trim().min(1).max(128)).max(16).default([]),
  }).strict().optional(),
})

const INB_RE = /^INB-\d{8}-\d{3,}$/

// "Complete the thesis": the caller sends the modules it wants REUSED (carried, not re-run). Everything
// else in the graph runs. `reuse` is checked against the server's own plan before anything is copied.
const ContinuationPlanReceiptBody = z.object({
  version: z.literal(2),
  action: z.enum(['continue', 'complete']),
  swarm: z.string().regex(MODULE_RE),
  subject: z.string().regex(TICKER_RE),
  sourceRunRoots: z.array(z.string().regex(/^analyses\/[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}$/)).max(64),
  targetRunRoot: z.string().regex(/^analyses\/[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}$/),
  provider: z.object({
    id: z.enum(['claude', 'codex']),
    model: z.string().max(80).nullable(),
    reasoningLevel: z.string().max(40).nullable(),
    profileKey: z.string().max(200).nullable(),
  }).strict(),
  reusableOrbKeys: z.array(z.string().regex(/^(?:[a-z0-9-]{1,40}\/[0-9]{2}_[a-z0-9-]{1,100}|master\/synthesizer)$/)).max(2000),
  payableOrbKeys: z.array(z.string().regex(/^(?:[a-z0-9-]{1,40}\/[0-9]{2}_[a-z0-9-]{1,100}|master\/synthesizer)$/)).max(2000),
  dataPool: z.object({
    files: z.number().int().min(0), newestMs: z.number().finite().min(0),
    sha256: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  }).strict(),
  evidenceGenerationDigest: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
  reusableArtifacts: z.array(z.object({
    output_rel: z.string().regex(/^(?:[a-z0-9-]{1,40}\/)?(?:[0-9]{2}|99)_[a-z0-9-]{1,100}\.md$|^final_thesis\.md$/),
    sha256: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    generation_digest: z.string().regex(/^[a-f0-9]{64}$/),
    attempt_id: z.string().min(1).max(200),
  }).strict()).max(2000),
  reusableArtifactsSha256: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  verifiedLineageSha256: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  sourceArtifactsSha256: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  fingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/),
}).strict()

const ThesisPlanRunBody = z.object({
  ...ProviderLaunchFields,
  ticker: z.string().regex(TICKER_RE),
  reuse: z.array(z.string().regex(MODULE_RE)).max(64).default([]),
  // REQUIRED, so an omitted field can never default to "research" and launch a research pipeline against
  // another swarm's subject. Completion is research-only for now; the route rejects anything else by name.
  swarm: z.string().regex(MODULE_RE),
  // Typed-ticker confirmation, required only when the reuse set is empty (i.e. this is really a full run).
  confirmTicker: z.string().optional(),
  // Present only for Continue. The server positively matches this exact saved root against disk truth and
  // never substitutes today's root. Ordinary Complete-the-thesis requests omit it.
  sourceRunRoot: z.string().regex(/^analyses\/[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}$/).optional(),
  // One browser click owns one durable attempt identity. The exact server-issued receipt is a CAS token,
  // not advisory display data: a different plan must be reviewed before any provider can start.
  requestId: z.string().uuid(),
  continuationReceipt: ContinuationPlanReceiptBody,
})

// Launch ONE module of a completion plan, resuming from the orbs already on disk (the RUN pill on a Run row).
const ThesisPlanModuleBody = z.object({
  ...ProviderLaunchFields,
  ticker: z.string().regex(TICKER_RE),
  module: z.string().regex(MODULE_RE),
  // The caller's reuse set — governs which ancestors get carried into the target root before the module runs.
  reuse: z.array(z.string().regex(MODULE_RE)).max(64).default([]),
  // REQUIRED for the same reason as ThesisPlanRunBody: an omitted field must never read as "research".
  swarm: z.string().regex(MODULE_RE),
  // Exact smart-resume contract + scope CAS. A rolling-deploy client/server mismatch or a pool/orb change
  // between GET plan and POST launch must reject, never silently widen "finish empty orbs" into a clean run.
  planVersion: z.literal(2),
  expectedWillRun: z.number().int().min(0).max(1000),
  expectedDoneOrbKeys: z.array(z.string().regex(/^[a-z0-9-]{1,40}\/[0-9]{2}_[a-z0-9-]{1,100}$/)).max(1000),
  expectedTargetRunRoot: z.string().regex(/^analyses\/[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}$/),
  poolFiles: z.number().int().min(0),
  poolNewestMs: z.number().finite().min(0),
  sourceRunRoot: z.string().regex(/^analyses\/[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}$/).optional(),
  requestId: z.string().uuid().optional(),
  continuationReceipt: ContinuationPlanReceiptBody.optional(),
}).superRefine((value, ctx) => {
  if (!value.sourceRunRoot) return
  if (!value.requestId) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['requestId'], message: 'exact module Continue requires a request id' })
  if (!value.continuationReceipt) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['continuationReceipt'], message: 'exact module Continue requires its reviewed receipt' })
})

// Publish-only recovery after an exact module finished locally but its terminal Git checkpoint failed.
// The marker/root/fingerprint are all required so this endpoint cannot be repurposed as a generic commit API.
const ThesisPlanModulePublishBody = z.object({
  ticker: z.string().regex(TICKER_RE),
  swarm: z.literal(RESEARCH_SWARM_ID),
  module: z.string().regex(MODULE_RE),
  targetRunRoot: z.string().regex(/^analyses\/[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}$/),
  expectedFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/),
}).strict()

const SignalLaunchBody = z.object({
  ...ProviderLaunchFields,
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
  // human "Override & run forward" of an EXISTING sig: stamp override_promote onto its intake.json so the
  // gauntlet pushes a signal-gate PARK/LOG cull past the promotion gate (sigId-only; ignored for a new intake,
  // which carries override_promote in the intake object itself).
  override: z.boolean().optional(),
  model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i).optional(),
})

const SweepLaunchBody = z.object({ ...ProviderLaunchFields, kind: z.literal('sweep'), model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i).optional() })

const ScreenerAgentLaunchBody = z.object({
  ...ProviderLaunchFields,
  kind: z.literal('screener-agent'),
  sigId: z.string().regex(SIG_RE),
  module: z.string().regex(MODULE_RE),
  agent: z.string().regex(AGENT_RE),
  model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i).optional(),
})

const HandoffLaunchBody = z.object({
  ...ProviderLaunchFields,
  kind: z.literal('handoff'),
  thesisId: z.string().regex(THESIS_RE),
  ticker: z.string().regex(TICKER_RE),
  model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i).optional(),
})

const ParityLaunchBody = z.object({
  provider: z.enum(['claude', 'codex']),
  model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i).optional(),
  reasoningLevel: z.string().regex(/^[a-z0-9_-]{1,24}$/i).optional(),
  expectedProfileKey: z.string().min(1).max(240).optional(),
  claudeRunRoot: z.string().regex(/^[A-Za-z0-9._/-]{1,500}$/),
  codexRunRoot: z.string().regex(/^[A-Za-z0-9._/-]{1,500}$/),
  freezeReceipt: z.string().regex(/^[A-Za-z0-9._/-]{1,500}$/),
  outputDir: z.string().regex(/^[A-Za-z0-9._/-]{1,500}$/),
}).strict()

const ParityCanaryLaunchBody = z.object({
  provider: z.enum(['claude', 'codex']),
  model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i),
  reasoningLevel: z.string().regex(/^[a-z0-9_-]{1,24}$/i),
  expectedProfileKey: z.string().min(1).max(240),
  runRoot: z.string().regex(PARITY_CANARY_RUN_ROOT_RE),
  freezeReceipt: z.string().regex(/^[A-Za-z0-9._/-]{1,500}$/),
}).strict()

const ParityCanaryContinueBody = z.object({
  provider: z.literal('codex'),
  model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i),
  reasoningLevel: z.string().regex(/^[a-z0-9_-]{1,24}$/i),
  expectedProfileKey: z.string().min(1).max(240),
  runRoot: z.string().regex(PARITY_CANARY_RUN_ROOT_RE),
  freezeReceipt: z.string().regex(/^[A-Za-z0-9._/-]{1,500}$/),
  interruptedRunId: z.string().uuid(),
}).strict()

const ParityCanaryStatusQuery = z.object({
  runRoot: z.string().regex(PARITY_CANARY_RUN_ROOT_RE),
}).strict()

function readCanaryRunFile(rootAbs: string, name: string): string | null {
  const target = path.join(rootAbs, name)
  let fd: number | null = null
  try {
    fd = fs.openSync(target, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK)
    const stat = fs.fstatSync(fd)
    if (!stat.isFile() || stat.size > 64 * 1024) return null
    return fs.readFileSync(fd, 'utf8')
  } catch {
    return null
  } finally {
    if (fd !== null) try { fs.closeSync(fd) } catch { /* already closed */ }
  }
}

function canaryRunFileExists(rootAbs: string, name: string): boolean {
  let fd: number | null = null
  try {
    fd = fs.openSync(path.join(rootAbs, name), fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK)
    return fs.fstatSync(fd).isFile()
  } catch {
    return false
  } finally {
    if (fd !== null) try { fs.closeSync(fd) } catch { /* already closed */ }
  }
}

// A generic constellation swarm (e.g. commodity) REUSES full/module/agent, scoped by an explicit
// `swarm`; `ticker` carries the subject id (a commodity like GOLD). Validated against the discovered
// roster below, so no swarm/module/agent name is hardcoded (CLAUDE.md §26).
const SWARM_ID_RE = /^[a-z0-9-]{1,40}$/
const SwarmLaunchBody = z.object({
  ...ProviderLaunchFields,
  kind: z.enum(['full', 'module', 'agent', 'rerun', 'review']),
  swarm: z.string().regex(SWARM_ID_RE),
  // A manifest owns its unit id. Research keeps the stricter ticker grammar below; a discovered swarm
  // may legitimately surface a longer (but still single-segment) subject. The shared normalizer after
  // parsing is the authority, so Data Library / Data Needs / launch all admit the same exact ids.
  ticker: z.string().min(1).max(64),
  module: z.string().regex(MODULE_RE).optional(),
  agent: z.string().regex(AGENT_RE).optional(),
  window: z.enum(['30d', '90d', '180d', '365d', '24m', '36m', 'tactical', 'strategic', 'ad-hoc', 'post-mortem']).optional(),
  model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i).optional(),
  confirmTicker: z.string().optional(),
  runRoot: z.string().min(1).max(300).optional(),
  decisionFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/).optional(),
})

// The versioned paid-rerun route is deliberately a DIFFERENT path from the legacy launch route. A new
// browser can therefore never price against a current server, then POST to an older server that silently
// strips exact-decision fields during a rolling restart: the older server has no path and returns 404.
const ExactRerunLaunchBody = z.object({
  ...ProviderLaunchFields,
  kind: z.literal('rerun'),
  ticker: z.string().min(1).max(64),
  swarm: z.string().regex(SWARM_ID_RE).optional(),
  module: z.string().regex(MODULE_RE),
  agent: z.string().regex(AGENT_RE),
  model: z.string().regex(/^[a-z0-9.\-]{1,40}$/i).optional(),
  force: z.boolean().optional(),
  runRoot: z.string().min(1).max(300),
  decisionFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  ...ExactPlanBindingFields,
}).strict().refine(exactPlanFieldsAreComplete, { message: 'intake plan binding must be complete' })

app.post('/api/launch/exact', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  const parsed = ExactRerunLaunchBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid exact rerun body', detail: parsed.error.flatten() })
  const { ticker: rawSubject, module, agent, provider, reasoningLevel, model, expectedProfileKey, force, runRoot, decisionFingerprint,
    planPath, planSha256, sourceDecisionFingerprint } = parsed.data
  const swarmId = parsed.data.swarm ?? RESEARCH_SWARM_ID
  if (!listSwarms().some((s) => s.id === swarmId)) return reply.code(400).send({ error: `unknown swarm ${swarmId}` })
  const subject = normalizeDataSubject(swarmId, rawSubject)
  if (!subject || isReservedDataFolder(subject)) return reply.code(400).send({ error: 'bad subject' })
  if (swarmId === RESEARCH_SWARM_ID) {
    if (!isValidTicker(subject) || !fs.existsSync(path.join(DATA_DIR, subject))) {
      return reply.code(400).send({ error: `unknown ticker ${subject}` })
    }
    if (module !== 'master') {
      if (!listModuleNames(RESEARCH_SWARM_ID).includes(module)) return reply.code(400).send({ error: 'unknown module' })
      if (!agentNamesForModule(module, RESEARCH_SWARM_ID).includes(agent)) return reply.code(400).send({ error: 'unknown agent for module' })
    }
  } else {
    if (!listModuleNames(swarmId).includes(module)) return reply.code(400).send({ error: 'unknown module' })
    if (!agentNamesForModule(module, swarmId).includes(agent)) return reply.code(400).send({ error: 'unknown agent for module' })
  }
  const binding = exactDecisionLaunchBinding(swarmId, subject, runRoot, decisionFingerprint)
  if (!binding) return reply.code(409).send({ error: 'selected_decision_required' })
  const requestedPlan = planPath && planSha256 && sourceDecisionFingerprint
    ? { planPath, planSha256, sourceDecisionFingerprint }
    : undefined
  // A plan-origin request is an exact one-time command: consumed/replaced/tampered means REJECT, never
  // silently downgrade it to an ordinary graph rerun. An ordinary graph click may omit these fields.
  const intakeReceipt = requestedPlan
    ? exactActionableIntakeOrb(swarmId, subject, binding.runRoot, module, agent, requestedPlan) ?? undefined
    : undefined
  if (requestedPlan && !intakeReceipt) {
    return reply.code(409).send({ error: 'That intake-plan orb was already consumed or the plan changed.', code: 'intake_plan_changed' })
  }
  const { user, userVia } = identify(req)
  try {
    return await withSubjectLock(subjectMutationLockKey(swarmId, subject), async () => {
      const out = await launch({
        kind: 'rerun', ticker: subject, module, agent, provider, reasoningLevel, model, expectedProfileKey, force,
        ...(swarmId !== RESEARCH_SWARM_ID ? { swarm: swarmId } : {}),
        ...binding, decisionRunRoot: binding.runRoot, intakeReceipt, user, userVia,
      })
      return { ...out, preflight: { ...out.preflight, exactDecisionBinding: exactDecisionLaunchReceipt(binding, requestedPlan ? intakeReceipt : undefined) } }
    })
  } catch (e: any) {
    if (e instanceof SubjectBusyError) {
      return reply.code(409).send({ error: `Another request for ${subject} is preparing a run. Wait for it to finish before retrying.`, code: 'subject_busy' })
    }
    const body = e?.body && typeof e.body === 'object' ? e.body : null
    return reply.code(e?.statusCode || 500).send({ error: e?.message || 'launch failed', ...(body || {}) })
  }
})

// Operator-only surface for the release parity command. It is intentionally absent from the normal UI,
// but unlike a direct CLI invocation it receives the live supervisor capability required for adjudication.
app.post('/api/internal/provider-parity/canary', { config: { rateLimit: { max: 4, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  if (process.env.ENGINE_PROVIDER_PARITY_ENABLED !== '1') {
    return reply.code(404).send({ error: 'provider parity launch is disabled' })
  }
  const { user, userVia } = identify(req)
  if (!isDispatchAdmin(user)) return reply.code(403).send({ error: 'not authorized to launch provider parity (admin only)' })
  const parsed = ParityCanaryLaunchBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid parity canary body', detail: parsed.error.flatten() })
  try {
    return await launch({
      kind: 'full', provider: parsed.data.provider, model: parsed.data.model,
      reasoningLevel: parsed.data.reasoningLevel, expectedProfileKey: parsed.data.expectedProfileKey,
      parityCanary: { runRoot: parsed.data.runRoot, freezeReceipt: parsed.data.freezeReceipt },
      user, userVia,
    })
  } catch (error: any) {
    const body = error?.body && typeof error.body === 'object' ? error.body : null
    return reply.code(error?.statusCode || 500).send({ error: error?.message || 'parity canary launch failed', ...(body || {}) })
  }
})

// One-use recovery for a frozen Codex canary whose provider process exited cleanly before it finished its
// discovered Task graph. This is deliberately a different route from the paid canary POST: it can only
// continue the exact supervisor-sealed root/profile/process already on disk, and can never create a new
// attempt root. The subject lock plus interruption-marker consumption makes duplicate clicks fail closed.
app.post('/api/internal/provider-parity/canary-continue', { config: { rateLimit: { max: 4, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  if (process.env.ENGINE_PROVIDER_PARITY_ENABLED !== '1') {
    return reply.code(404).send({ error: 'provider parity launch is disabled' })
  }
  const { user, userVia } = identify(req)
  if (userVia !== 'cf-access' || !isDispatchAdmin(user)) {
    return reply.code(403).send({ error: 'not authorized to continue provider parity (admin only)' })
  }
  const parsed = ParityCanaryContinueBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid parity canary continuation body', detail: parsed.error.flatten() })

  const validateCandidate = (): { subject: string; preSpawnRecovery: boolean } => {
    const lexicalRoot = path.join(REPO_ROOT, parsed.data.runRoot)
    let lexicalStat: fs.Stats
    try { lexicalStat = fs.lstatSync(lexicalRoot) } catch {
      throw Object.assign(new Error('canary run root not found'), { statusCode: 404 })
    }
    if (!lexicalStat.isDirectory() || lexicalStat.isSymbolicLink()) {
      throw Object.assign(new Error('invalid canary run root'), { statusCode: 400 })
    }
    let rootAbs: string
    try { rootAbs = resolveInsideAnalyses(lexicalRoot) } catch {
      throw Object.assign(new Error('invalid canary run root'), { statusCode: 400 })
    }
    const interruptedRaw = readCanaryRunFile(rootAbs, '.interrupted')
    let marker: Record<string, unknown> | null = null
    if (interruptedRaw) {
      try {
        const value = JSON.parse(interruptedRaw)
        if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid')
        marker = value
      } catch {
        throw Object.assign(new Error('canary has no valid supervisor interruption marker'), { statusCode: 409 })
      }
    }
    const interruptedAuthority = marker ? readProviderInterruptionAuthority(parsed.data.runRoot) : null
    const preSpawnAuthority = marker ? null : readProviderPreSpawnFailureAuthority(parsed.data.runRoot)
    const authority = interruptedAuthority ?? preSpawnAuthority
    const preSpawnRecovery = Boolean(preSpawnAuthority)
    const markerAuthority = marker ? {
      attemptId: typeof marker['attemptId'] === 'string' ? marker['attemptId']
        : typeof marker['runId'] === 'string' ? marker['runId'] : null,
      provider: typeof marker['provider'] === 'string' ? marker['provider'] : null,
      model: typeof marker['model'] === 'string' ? marker['model'] : null,
      reasoningLevel: typeof marker['reasoningLevel'] === 'string' ? marker['reasoningLevel'] : null,
      profileKey: typeof marker['profileKey'] === 'string' ? marker['profileKey'] : null,
      reason: marker['reason'],
    } : null
    if (!authority
        || authority.runId !== parsed.data.interruptedRunId
        || authority.provider !== parsed.data.provider
        || authority.model !== parsed.data.model
        || authority.reasoningLevel !== parsed.data.reasoningLevel
        || authority.profileKey !== parsed.data.expectedProfileKey
        || (markerAuthority && (markerAuthority.attemptId !== parsed.data.interruptedRunId
          || markerAuthority.provider !== parsed.data.provider
          || markerAuthority.model !== parsed.data.model
          || markerAuthority.reasoningLevel !== parsed.data.reasoningLevel
          || markerAuthority.profileKey !== parsed.data.expectedProfileKey
          || !isRecoverableParityInterruptionReason(markerAuthority.reason)))) {
      throw Object.assign(new Error('canary interruption authority does not match the requested Codex process/profile'), { statusCode: 409 })
    }
    if (canaryRunFileExists(rootAbs, '.aborted')
        || canaryRunFileExists(rootAbs, 'execution_provenance.receipt.json')) {
      throw Object.assign(new Error('canary is aborted or already supervisor-published'), { statusCode: 409 })
    }
    const bindingRaw = readCanaryRunFile(rootAbs, '.provider-parity-input.json')
    let subject = ''
    try { subject = String(JSON.parse(bindingRaw || '{}').subject || '').toUpperCase() } catch { /* fail below */ }
    if (!isValidTicker(subject)) {
      throw Object.assign(new Error('canary provider binding has an invalid subject'), { statusCode: 409 })
    }
    if (subjectChainActive(subject, RESEARCH_SWARM_ID)
        || listRuns().some((run) => run.runRoot === parsed.data.runRoot && IN_FLIGHT_STATUSES.has(run.status))) {
      throw Object.assign(new Error('canary already has an active writer'), { statusCode: 409 })
    }
    return { subject, preSpawnRecovery }
  }

  try {
    const initial = validateCandidate()
    return await withSubjectLock(subjectMutationLockKey(RESEARCH_SWARM_ID, initial.subject), async () => {
      const current = validateCandidate()
      if (current.subject !== initial.subject) {
        throw Object.assign(new Error('canary subject changed before continuation'), { statusCode: 409 })
      }
      if (current.preSpawnRecovery) {
        writeRunMarker(parsed.data.runRoot, '.interrupted', {
          reason: 'continuation_spawn_failed',
          message: 'The prior parity continuation failed before a provider process started.',
          provider: parsed.data.provider,
          profileKey: parsed.data.expectedProfileKey,
          model: parsed.data.model,
          reasoningLevel: parsed.data.reasoningLevel,
          runId: parsed.data.interruptedRunId,
          attemptId: parsed.data.interruptedRunId,
          startedAt: Date.now(),
        })
        try {
          sealProviderPreSpawnFailureAuthority(parsed.data.runRoot, parsed.data.interruptedRunId)
        } catch (error) {
          clearRunMarker(parsed.data.runRoot, '.interrupted')
          throw error
        }
      }
      return launch({
        kind: 'full', provider: parsed.data.provider, model: parsed.data.model,
        reasoningLevel: parsed.data.reasoningLevel, expectedProfileKey: parsed.data.expectedProfileKey,
        parityCanary: {
          runRoot: parsed.data.runRoot, freezeReceipt: parsed.data.freezeReceipt, stage: 'continuation',
        },
        user, userVia,
      })
    })
  } catch (error: any) {
    const body = error?.body && typeof error.body === 'object' ? error.body : null
    return reply.code(error?.statusCode || 500).send({ error: error?.message || 'parity canary continuation failed', ...(body || {}) })
  }
})

// The ordinary Activity ledger intentionally excludes release canaries. Give the authenticated operator
// a narrow, read-only status surface so a terminal failure cannot disappear with the live-run chip.
app.get('/api/internal/provider-parity/canary-status', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  const { user, userVia } = identify(req)
  if (userVia !== 'cf-access' || !isDispatchAdmin(user)) return reply.code(403).send({ error: 'not authorized to inspect provider parity (admin only)' })
  const parsed = ParityCanaryStatusQuery.safeParse(req.query)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid parity canary status query' })

  const lexicalRoot = path.join(REPO_ROOT, parsed.data.runRoot)
  let lexicalStat: fs.Stats
  try { lexicalStat = fs.lstatSync(lexicalRoot) } catch { return reply.code(404).send({ error: 'canary run root not found' }) }
  if (!lexicalStat.isDirectory() || lexicalStat.isSymbolicLink()) return reply.code(400).send({ error: 'invalid canary run root' })
  let rootAbs: string
  try {
    rootAbs = resolveInsideAnalyses(lexicalRoot)
  } catch (error: any) {
    return reply.code(error?.code === 'ENOENT' ? 404 : 400).send({ error: error?.code === 'ENOENT' ? 'canary run root not found' : 'invalid canary run root' })
  }

  const logicalChain = getParityCanaryChainStatus(parsed.data.runRoot)
  const chainRuns = listRuns()
    .filter((candidate) => candidate.runRoot === parsed.data.runRoot && candidate.parityCanary === true
      && (!logicalChain || candidate.chainId === logicalChain.chainId))
  const run = chainRuns
    .sort((a, b) => b.startedAt - a.startedAt)[0]
  // The aggregate deliberately stays `running` across child transitions, but a child parked at the
  // readiness gate is actionable operator state, not an ordinary transition. Surface that exact child
  // and run id so the canary UI can open the shared readiness-decision workflow instead of polling a
  // logical chain that can never advance by itself.
  const pausedRun = chainRuns
    .filter((candidate) => candidate.status === 'awaiting-readiness-decision')
    .sort((a, b) => b.startedAt - a.startedAt)[0]
  const terminalEvent = run && [...run.eventLog].reverse().find((event) => event.type === 'run-error' || event.type === 'run-done')
  const failureNote = readCanaryRunFile(rootAbs, 'RUN_FAILURE.md')
  const interruptedRaw = readCanaryRunFile(rootAbs, '.interrupted')
  const abortedRaw = readCanaryRunFile(rootAbs, '.aborted')
  let interruption: Record<string, unknown> | null = null
  try {
    const value = interruptedRaw ? JSON.parse(interruptedRaw) : null
    if (value && typeof value === 'object' && !Array.isArray(value)) interruption = value
  } catch { /* malformed marker is reported by its presence below */ }
  const artifacts = Object.fromEntries([
    'final_thesis.md', 'decision_record.json', 'audit_dossier.md', 'execution_provenance.receipt.json',
  ].map((name) => [name, canaryRunFileExists(rootAbs, name)]))
  const diskComplete = artifacts['final_thesis.md'] && artifacts['decision_record.json'] && artifacts['execution_provenance.receipt.json']
  const diskFailure = failureNote !== null || interruptedRaw !== null
  // A supervisor-written failure marker wins over any child-created terminal-looking files. Successful
  // post-restart recovery still requires all three terminal artifacts, including the supervisor receipt.
  const logicalInFlight = logicalChain?.status === 'starting' || logicalChain?.status === 'running'
  const status = logicalInFlight && pausedRun ? pausedRun.status
    : logicalInFlight ? logicalChain.status
    : abortedRaw !== null ? 'cancelled'
      : diskFailure ? 'error'
        : logicalChain?.status ?? run?.status ?? (diskComplete ? 'done' : 'unknown')
  const eventMessage = logicalInFlight && pausedRun
    ? 'Canary paused for a data-readiness decision.'
    : logicalInFlight ? logicalChain.message
    : abortedRaw !== null ? 'Canary cancelled by the operator.'
      : logicalChain?.message
        ?? (terminalEvent?.type === 'run-error'
          ? terminalEvent.message || terminalEvent.reason
          : terminalEvent?.type === 'run-done' ? 'Canary completed.' : null)
  return {
    runRoot: parsed.data.runRoot,
    runId: pausedRun?.runId ?? logicalChain?.runId ?? run?.runId ?? null,
    status,
    startedAt: logicalChain?.startedAt ?? pausedRun?.startedAt ?? run?.startedAt ?? null,
    endedAt: logicalChain?.endedAt ?? run?.endedAt ?? null,
    provider: logicalChain?.provider ?? pausedRun?.provider ?? run?.provider ?? null,
    profileKey: logicalChain?.profileKey ?? pausedRun?.profileKey ?? run?.profileKey ?? null,
    message: eventMessage,
    failureNote,
    interruption,
    artifacts,
  }
})

app.post('/api/internal/provider-parity/launch', { config: { rateLimit: { max: 6, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  // Paid release-canary execution is deliberately absent until the operator enables the gate, and even
  // then is restricted to the same explicit admin allow-list as privileged coding/pipeline dispatch.
  // A local Origin check and rate limit are CSRF/abuse controls, not authorization.
  if (process.env.ENGINE_PROVIDER_PARITY_ENABLED !== '1') {
    return reply.code(404).send({ error: 'provider parity launch is disabled' })
  }
  const { user, userVia } = identify(req)
  if (!isDispatchAdmin(user)) return reply.code(403).send({ error: 'not authorized to launch provider parity (admin only)' })
  const parsed = ParityLaunchBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid parity launch body', detail: parsed.error.flatten() })
  try {
    return await launch({
      kind: 'parity', provider: parsed.data.provider, model: parsed.data.model,
      reasoningLevel: parsed.data.reasoningLevel, expectedProfileKey: parsed.data.expectedProfileKey, user, userVia,
      parity: {
        claudeRunRoot: parsed.data.claudeRunRoot,
        codexRunRoot: parsed.data.codexRunRoot,
        freezeReceipt: parsed.data.freezeReceipt,
        outputDir: parsed.data.outputDir,
      },
    })
  } catch (error: any) {
    return reply.code(error?.statusCode || 500).send({ error: error?.message || 'parity launch failed' })
  }
})

// explicit per-route rate limit: launches are human clicks (a handful a minute at most) and the
// handler touches the filesystem, so cap it well above real usage but below abuse levels
app.post('/api/launch', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
  const kind = (req.body as any)?.kind as RunKind | undefined
  // Exact reruns moved to /api/launch/exact. Keeping this explicit refusal makes current-server/old-UI
  // skew fail closed too; no legacy body can regain paid rerun authority by adding fields here.
  if (kind === 'rerun') return reply.code(426).send({ error: 'exact_launch_endpoint_required' })
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
      const out = await launch({
        kind, ticker: parsed.data.sigId, intake: parsed.data.intake, inboxId: parsed.data.inboxId,
        module: parsed.data.until, overridePromote: parsed.data.override, provider: parsed.data.provider,
        reasoningLevel: parsed.data.reasoningLevel, model: parsed.data.model,
        expectedProfileKey: parsed.data.expectedProfileKey, user, userVia,
      })
      // an Inbox-card launch marks its row consumed so it leaves the lane (best-effort: a failed
      // mark only leaves the row visible — a duplicate click is rejected by SIG-id exclusivity).
      // Deferred past the reply: refreshBoard shells a synchronous python board rebuild (~0.3-2s)
      // that used to sit inside this launch's click-to-ack window.
      if (parsed.data.inboxId) {
        const inboxId = parsed.data.inboxId
        setImmediate(() => {
          try {
            markInboxConsumed(REPO_ROOT, inboxId, out.preflight.ticker)
            refreshBoard(REPO_ROOT)
          } catch {
            /* best-effort */
          }
        })
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
      return await launch({ kind, provider: parsed.data.provider, reasoningLevel: parsed.data.reasoningLevel,
        model: parsed.data.model, expectedProfileKey: parsed.data.expectedProfileKey, user, userVia })
    } catch (e: any) {
      return fail(e)
    }
  }
  if (kind === 'screener-agent') {
    const parsed = ScreenerAgentLaunchBody.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
    const { sigId, module, agent, provider, reasoningLevel, model, expectedProfileKey } = parsed.data
    if (!listModuleNames('screener').includes(module)) return reply.code(400).send({ error: 'unknown screener module' })
    if (!agentNamesForModule(module, 'screener').includes(agent)) return reply.code(400).send({ error: 'unknown agent for module' })
    try {
      return await launch({ kind, ticker: sigId, module, agent, provider, reasoningLevel, model, expectedProfileKey, user, userVia })
    } catch (e: any) {
      return fail(e)
    }
  }
  if (kind === 'handoff') {
    const parsed = HandoffLaunchBody.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
    const ownerConflict = manualPoolOwnerError(RESEARCH_SWARM_ID, parsed.data.ticker)
    if (ownerConflict) return manualPoolOwnerReply(reply, parsed.data.ticker, ownerConflict)
    try {
      return await launch({ kind, ticker: parsed.data.ticker, thesisId: parsed.data.thesisId,
        provider: parsed.data.provider, reasoningLevel: parsed.data.reasoningLevel, model: parsed.data.model,
        expectedProfileKey: parsed.data.expectedProfileKey,
        sharedPoolTarget: { swarm: RESEARCH_SWARM_ID, subject: parsed.data.ticker }, user, userVia })
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
    const { swarm, ticker: rawSubject, module, agent, window, provider, reasoningLevel, model, expectedProfileKey, confirmTicker, runRoot, decisionFingerprint } = parsed.data
    const skind = parsed.data.kind
    const swarmManifest = listSwarms().find((s) => s.id === swarm)
    if (!swarmManifest) return reply.code(400).send({ error: `unknown swarm ${swarm}` })
    if (skind === 'review' && (!swarmManifest.reviewCommand || !swarmManifest.calibrator || !swarmManifest.calibrationRoot)) {
      return reply.code(400).send({ error: `swarm ${swarm} does not declare tracked review + calibration support` })
    }
    const subject = normalizeDataSubject(swarm, rawSubject)
    if (!subject || isReservedDataFolder(subject)) return reply.code(400).send({ error: 'bad subject' })
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
    if (skind !== 'rerun' && (runRoot || decisionFingerprint)) return reply.code(400).send({ error: 'exact call binding is rerun-only' })
    // The selected-call form is intentionally single-orb. A rooted whole-module command would have three
    // whitespace tokens and is ambiguous with the legacy MODULE AGENT SUBJECT grammar.
    if (skind === 'rerun' && !agent) return reply.code(400).send({ error: 'exact rerun requires an agent' })
    const exactBinding = skind === 'rerun'
      ? exactDecisionLaunchBinding(swarm, subject, runRoot, decisionFingerprint)
      : null
    if (skind === 'rerun' && !exactBinding) return reply.code(409).send({ error: 'selected_decision_required' })
    try {
      const out = await launch({ kind: skind, swarm, ticker: subject, module, agent, window, provider, reasoningLevel, model, expectedProfileKey, user, userVia,
        ...(exactBinding ? { ...exactBinding, decisionRunRoot: exactBinding.runRoot } : {}) })
      return exactBinding
        ? { ...out, preflight: { ...out.preflight, exactDecisionBinding: exactDecisionLaunchReceipt(exactBinding) } }
        : out
    } catch (e: any) {
      return fail(e)
    }
  }

  // ---- research kinds (pre-swarm contract, unchanged) ----
  const parsed = ResearchLaunchBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const { ticker, module, agent, provider, reasoningLevel, model, expectedProfileKey, confirmTicker, requestId, runRoot, decisionFingerprint } = parsed.data
  const rkind = parsed.data.kind
  if (parsed.data.memoryIdentity && parsed.data.memoryIdentity.ticker !== ticker) {
    return reply.code(400).send({ error: 'memory identity ticker does not match the research subject' })
  }
  // review (file an outcome review) and track (rebuild the calls dashboard) need no upstream deps and
  // ignore module/agent — they follow the dep-free `full` admission path. review defaults to ad-hoc.
  const window = rkind === 'review' ? (parsed.data.window ?? 'ad-hoc') : undefined

  // closed allow-list check against the data pool. Membership is ALL this route needs — the old
  // listTickers() call scanned every ticker's files + newest decision_record.json (sync fs over a
  // Google Drive FUSE mount) just to test one folder's existence, and that scan sat inside the
  // click-to-ack window of every launch.
  if (!TICKER_RE.test(ticker) || isReservedDataFolder(ticker) || !fs.existsSync(path.join(DATA_DIR, ticker))) {
    return reply.code(400).send({ error: `unknown ticker ${ticker}` })
  }
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
  if (rkind !== 'rerun' && (runRoot || decisionFingerprint)) return reply.code(400).send({ error: 'exact call binding is rerun-only' })
  const exactBinding = rkind === 'rerun'
    ? exactDecisionLaunchBinding(RESEARCH_SWARM_ID, ticker, runRoot, decisionFingerprint)
    : null
  if (rkind === 'rerun' && !exactBinding) return reply.code(409).send({ error: 'selected_decision_required' })

  // A request id first seen during an update remains authoritative after the update. Replaying the old
  // browser POST can only replay its durable result; it can never fall through to a second ordinary launch.
  if (rkind === 'full' && requestId) {
    const pending = readPendingAdmission(requestId)
    if (pending) {
      const sameIntent = pending.user === user && pending.ticker === ticker && pending.action === 'full'
        && pending.provider === provider && pending.model === model && pending.reasoningLevel === reasoningLevel
        && pending.expectedProfileKey === expectedProfileKey
      if (!sameIntent) return reply.code(409).send({ error: 'This request id belongs to a different waiting launch.', code: 'request_reused' })
      if (pending.status === 'started' && pending.response) return pending.response
      if (pending.status === 'waiting_for_update') return reply.code(202).send({ queued: true, requestId, status: pending.status, ticker, action: 'full', provider, expectedProfileKey })
      if (pending.status === 'cancelled') return reply.code(409).send({ error: 'This waiting request was cancelled. Start a new request if you still want to run it.', code: 'request_cancelled' })
      return reply.code(409).send({
        error: pending.attention || 'This request is already being admitted. Check Activity; it will not be started twice.',
        code: pending.status === 'needs_attention' ? 'request_needs_attention' : 'request_in_progress',
      })
    }
  }

  try {
    return await withSubjectLock(subjectMutationLockKey(RESEARCH_SWARM_ID, ticker), async () => {
      if (rkind === 'full' && providerDeployPending(STATE_DIR)) {
        if (!requestId) {
          return reply.code(503).send({
            error: 'The engine is updating. Refresh once so this confirmed run can receive a durable request id.',
            code: 'durable_request_id_required',
          })
        }
        // Convert the confirmed full-run click into the same exact transactional plan contract used by
        // Continue. `reuse: []` is deliberate and typed-confirmed; after deployment it can never be mistaken
        // for, or widened from, a saved-root continuation.
        const selection = { provider, model, reasoningLevel, expectedProfileKey }
        const plan = await thesisPlanForRequest(ticker, RESEARCH_SWARM_ID, [], undefined, selection)
        if (plan.complete) {
          return reply.code(409).send({ error: 'Today’s run already has a final thesis.', code: 'already_complete', path: plan.finalReportPath })
        }
        const requestedDeployCommit = pendingDeployCommit(providerDeployIntentPath(STATE_DIR))
        if (!requestedDeployCommit) {
          return reply.code(503).send({ error: 'The update identity could not be verified. Nothing was queued or started.', code: 'deployment_identity_unavailable' })
        }
        const queued = enqueuePendingAdmission({
          requestId, user, userVia, ticker, action: 'full',
          provider, model, reasoningLevel, expectedProfileKey,
          reuse: [],
          originalPlan: plan.continuationReceipt,
          requestedDeployCommit,
        })
        if (queued.kind === 'conflict') {
          return reply.code(409).send({ error: 'This request id belongs to a different waiting launch.', code: 'request_reused' })
        }
        if (queued.record.status === 'cancelled') {
          return reply.code(409).send({ error: 'This waiting request was cancelled. Start a new request if you still want to run it.', code: 'request_cancelled' })
        }
        return reply.code(202).send({
          queued: true, requestId, status: queued.record.status,
          ticker, action: 'full', provider, expectedProfileKey,
        })
      }
      const out = await launch({ kind: rkind, ticker, module, agent, window, provider, reasoningLevel, model, expectedProfileKey, user, userVia, force: parsed.data.force,
        memoryIdentity: parsed.data.memoryIdentity,
        ...(exactBinding ? { ...exactBinding, decisionRunRoot: exactBinding.runRoot } : {}) })
      return exactBinding
        ? { ...out, preflight: { ...out.preflight, exactDecisionBinding: exactDecisionLaunchReceipt(exactBinding) } }
        : out
    })
  } catch (e: any) {
    // Close the last check/acquire race: deploy intent can land after the under-lock precheck but before
    // launch acquires its retained shared lease. That refusal proves no provider child started, so the
    // separately typed full-run request may still become the same durable pending admission.
    const deployRace = e?.code === 'deployment_in_progress' || e?.body?.code === 'deployment_in_progress'
    if (rkind === 'full' && requestId && deployRace && providerDeployPending(STATE_DIR)) {
      try {
        return await withSubjectLock(subjectMutationLockKey(RESEARCH_SWARM_ID, ticker), async () => {
          const requestedDeployCommit = pendingDeployCommit(providerDeployIntentPath(STATE_DIR))
          if (!requestedDeployCommit) {
            return reply.code(503).send({ error: 'The update identity could not be verified. Nothing was queued or started.', code: 'deployment_identity_unavailable' })
          }
          const selection = { provider, model, reasoningLevel, expectedProfileKey }
          const plan = await thesisPlanForRequest(ticker, RESEARCH_SWARM_ID, [], undefined, selection)
          if (plan.complete) return reply.code(409).send({ error: 'Today’s run already has a final thesis.', code: 'already_complete', path: plan.finalReportPath })
          const queued = enqueuePendingAdmission({
            requestId, user, userVia, ticker, action: 'full', provider, model, reasoningLevel,
            expectedProfileKey, reuse: [], originalPlan: plan.continuationReceipt, requestedDeployCommit,
          })
          if (queued.kind === 'conflict') return reply.code(409).send({ error: 'This request id belongs to a different waiting launch.', code: 'request_reused' })
          if (queued.record.status === 'cancelled') return reply.code(409).send({ error: 'This waiting request was cancelled. Start a new request if you still want to run it.', code: 'request_cancelled' })
          return reply.code(202).send({ queued: true, requestId, status: queued.record.status, ticker, action: 'full', provider, expectedProfileKey })
        })
      } catch (queueError: any) {
        if (queueError instanceof SubjectBusyError) return reply.code(409).send({ error: `Another request for ${ticker} is preparing a run. Wait for it to finish before retrying.`, code: 'subject_busy' })
        return fail(queueError)
      }
    }
    if (e instanceof SubjectBusyError) {
      return reply.code(409).send({ error: `Another request for ${ticker} is preparing a run. Wait for it to finish before retrying.`, code: 'subject_busy' })
    }
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
    continuation: run.continuation,
    ticker: run.ticker,
    module: run.module,
    agent: run.agent,
    provider: run.provider,
    executionProfile: run.executionProfile,
    profileKey: run.profileKey,
    model: run.model,
    reasoningLevel: run.reasoningLevel,
    cliVersion: run.cliVersion,
    status: run.status,
    publicationPhase: run.publicationPhase,
    // Refresh/reconnect must reconstruct the one actionable chain gate. Siblings stay in
    // readiness-checking and therefore expose no duplicate decision report.
    readiness: run.status === 'awaiting-readiness-decision' ? run.readiness : undefined,
    swarmId: run.swarmId,
    runRoot: run.runRoot,
    chainId: run.chainId,
    executionEpoch: run.provenanceEpoch,
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
const SupervisorPublicationBody = z.object({
  phase: z.enum(['stamp', 'archive', 'commit', 'attest', 'verify-attestation']).optional(),
  message: z.string().max(500).optional(),
  pathspecs: z.array(z.string().max(500)).max(32).optional(),
  comparisonArtifact: z.string().max(1000).optional(),
  freezeReceipt: z.string().max(1000).optional(),
  receiptOutput: z.string().max(1000).optional(),
}).strict()
app.post('/api/internal/runs/:runId/publication', {
  config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
}, async (req, reply) => {
  const parsed = SupervisorPublicationBody.safeParse(req.body ?? {})
  if (!parsed.success) return reply.code(400).send({ error: 'invalid publication request' })
  const raw = req.headers['x-nostra-publication-token']
  const token = Array.isArray(raw) ? raw[0] : raw
  if (typeof token !== 'string' || !token) return reply.code(403).send({ error: 'missing publication capability' })
  try {
    return await queuePublicationIntent(String((req.params as any).runId || ''), token, parsed.data)
  } catch (error: any) {
    const run = getRun(String((req.params as any).runId || ''))
    if (run) run.publicationError = String(error?.message || error).slice(0, 1000)
    return reply.code(error?.statusCode || 409).send({ error: String(error?.message || error) })
  }
})

app.post('/api/runs/:runId/cancel', async (req, reply) => {
  let ok: boolean
  try { ok = await cancel((req.params as any).runId) } catch (error: any) {
    return reply.code(error?.statusCode || 409).send({ error: String(error?.message || error), code: error?.code })
  }
  if (!ok) return reply.code(404).send({ error: 'no such run / already ended' })
  return { ok: true, status: 'cancelled' }
})

// The kill switch: stop every in-flight run (both swarms) and halt chained full runs so a step
// finishing mid-stop never launches its successor. Idempotent — stopping nothing returns ok.
app.post('/api/runs/cancel-all', async () => {
  const cancelled = await cancelAll()
  return { ok: true, cancelled, chainsHalted: true }
})

// Stop ONE subject's in-flight work (a chained full run + its live module step). The panel's Cancel
// uses this instead of /runs/:id/cancel so a chained full stops reliably: as the chain advances the
// followed runId may already have ended, and cancelling only that id leaves the next module running.
// Idempotent — cancelling a subject with nothing live returns ok with an empty list. Subject+swarm are
// bounded here; cancelSubject only ever touches runs whose subjectId already matches an in-flight run.
const SUBJECT_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$/
app.post('/api/runs/subject/:swarm/:subject/cancel', async (req, reply) => {
  const swarm = String((req.params as any).swarm || '')
  const subject = String((req.params as any).subject || '')
  if (!listSwarms().some((s) => s.id === swarm)) return reply.code(400).send({ error: `unknown swarm ${swarm}` })
  if (!SUBJECT_RE.test(subject)) return reply.code(400).send({ error: 'invalid subject' })
  try {
    const cancelled = await cancelSubject(subject, swarm)
    return { ok: true, cancelled, chainsHalted: true }
  } catch (e: any) {
    return reply.code(e?.statusCode || 409).send({ error: e?.message || 'could not stop subject runs', code: e?.code })
  }
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

// ---------- resumable runs (disk-truth) ----------
// Every run the cockpit can resume right now — an interrupted run (crash / restart / cancel) whose final
// deliverable is missing, whose subject isn't live, and which wasn't deliberately aborted. Recomputed
// from disk each call (the in-memory registry is wiped on restart). The Activity log and the orb view
// join their rows/subjects against this set to decide where to show a "Resume" affordance.
app.get('/api/resumable', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async () => ({ runs: listResumableRuns() }))

// ---------- document intake (scoped rerun plan) ----------
// The latest scoped rerun plan for a ticker: which SPECIFIC orbs the docs that landed since the last
// run actually invalidate (frameworks/INTAKE.md). Read-only, roster-validated + downstream re-expanded
// by readIntakePlan (a hallucinated module/agent name can never reach the client as a launchable
// command). Returns { plan: null } when there's no run or no plan yet — the client then shows the
// honest staleness floor, never a fabricated plan. This NEVER moves a module stale->done (INTAKE.md §1).
// Route-param barrier: the SAME zod regex the launch routes use (ThesisPlanRunBody etc.). It shapes the
// param AND acts as the taint sanitizer CodeQL recognizes, so `ticker` never reaches path.join / launch()
// as an untrusted value. isValidTicker below is the stricter real guard (TICKER_RE admits '..').
const IntakeParams = z.object({ subject: z.string().min(1).max(64) })
const IntakeQuery = z.object({
  swarm: z.string().min(1).max(120).optional(),
  runRoot: z.string().min(1).max(300).optional(),
  decisionFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/).optional(),
}).strict()

app.get('/api/intake/:subject', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req, reply) => {
  const parsed = IntakeParams.safeParse(req.params)
  const query = IntakeQuery.safeParse(req.query ?? {})
  if (!parsed.success || !query.success) return reply.code(400).send({ error: 'bad intake request' })
  const swarmId = query.data.swarm ?? RESEARCH_SWARM_ID
  const subject = normalizeDataSubject(swarmId, parsed.data.subject)
  if (!subject || isReservedDataFolder(subject)) return reply.code(400).send({ error: 'bad subject' })
  try {
    const plan = readIntakePlan(subject, { swarmId, runRoot: query.data.runRoot })
    if (!plan) return { plan: null }
    const needs = readDataNeeds(swarmId, subject, plan.run_root)
    if (query.data.decisionFingerprint && needs?.decision_fingerprint !== query.data.decisionFingerprint) {
      return reply.code(409).send({ error: 'selected_decision_changed' })
    }
    // Never "helpfully" attach the current call to old prompt output. The plan's own authored fingerprint
    // is part of its immutable identity; readIntakePlan independently verifies it and leaves legacy/stale
    // plans audit-readable with actionable=false and zero commands.
    return { plan }
  } catch (e: any) {
    return reply.code(500).send({ error: e?.message || 'could not read the intake plan' })
  }
})

// ---------- what changed since the last version ----------
// The git-history delta of THIS run's decision_record.json. The engine commits every run and a re-run
// writes IN PLACE, so git is the only witness the previous version existed — without this the cockpit can
// only ever show one snapshot and honestly refuse to say what moved.
//
// Computed server-side and handed to the client finished — never diffed client-side: a constructing
// zustand selector returns a fresh reference on every store write (the getSnapshot loop), and two
// surfaces computing the same diff twice could disagree about the call. Read-only: it shells
// git log/show/rev-parse/ls-files/hash-object, none of which take the index lock, so it never races
// commit-run.sh publishing a run.
//
// Route-param barrier: the SAME zod regex the launch routes use. It shapes the param AND is the taint
// sanitizer CodeQL recognizes, so `ticker` never reaches path.join / git argv as an untrusted value.
// isValidTicker below is the stricter real guard (TICKER_RE admits '..'). The optional runRoot targets
// the EXACT run the cockpit is showing — selectTicker(t, runRoot) honours a run-history pick, so
// resolving from the bare ticker here would describe a DIFFERENT run than the banner above it.
const WhatChangedParams = z.object({ ticker: z.string().regex(TICKER_RE) })
const WhatChangedQuery = z.object({ runRoot: z.string().regex(RUN_ROOT_RE).max(300).optional() })

app.get('/api/what-changed/:ticker', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
  const parsed = WhatChangedParams.safeParse(req.params)
  if (!parsed.success) return reply.code(400).send({ error: 'bad ticker' })
  const { ticker } = parsed.data
  if (!isValidTicker(ticker)) return reply.code(400).send({ error: 'bad ticker' })
  const q = WhatChangedQuery.safeParse(req.query ?? {})
  if (!q.success) return reply.code(400).send({ error: 'bad runRoot' })
  try {
    const runRoot = resolveRunRoot({ runRoot: q.data.runRoot, ticker, preferComplete: true })
    if (!runRoot) return { read: null }
    // the pair must agree — a runRoot naming another company would silently answer about the wrong subject
    if (!runRoot.startsWith(`analyses/${ticker}_`)) return reply.code(400).send({ error: 'runRoot does not match ticker' })
    return { read: await readWhatChanged({ runRoot }) }
  } catch (e: any) {
    if (e?.statusCode === 400) return reply.code(400).send({ error: 'bad ticker' })
    return reply.code(500).send({ error: e?.message || 'could not read the version history' })
  }
})

// Data-needs dock (the "surface a data gap → build a durable connector → re-score" loop): the structured
// data_needs[] the run's terminal synthesizer wrote onto decision_record.json, normalized + roster-validated
// by readDataNeeds. Read-only. The shared manifest-aware subject boundary keeps research on its strict
// exchange-symbol grammar while allowing another swarm's safe 64-character unit id. The swarm is resolved
// through the registry first, so an unknown / injected swarm id never forms a path.
const DataNeedsParams = z.object({ subject: z.string().min(1).max(64) })
const DataNeedsQuery = z.object({
  swarm: z.string().min(1).max(120).optional(),
  runRoot: z.string().min(1).max(300).optional(),
}).strip()
app.get('/api/data-needs/:subject', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req, reply) => {
  const parsed = DataNeedsParams.safeParse(req.params)
  if (!parsed.success) return reply.code(400).send({ error: 'bad subject' })
  const query = DataNeedsQuery.safeParse(req.query ?? {})
  if (!query.success) return reply.code(400).send({ error: 'bad data-needs query' })
  const swarmId = query.data.swarm ?? RESEARCH_SWARM_ID
  if (!swarmById(swarmId)) return reply.code(400).send({ error: 'unknown swarm' })
  const subject = normalizeDataSubject(swarmId, parsed.data.subject)
  if (!subject) return reply.code(400).send({ error: 'bad subject' })

  if (query.data.runRoot !== undefined && !resolveDataNeedsRunRoot(swarmId, subject, query.data.runRoot)) {
    return reply.code(400).send({ error: 'runRoot does not match this subject and swarm' })
  }
  try {
    return { read: readDataNeeds(swarmId, subject, query.data.runRoot) }
  } catch (e: any) {
    return reply.code(500).send({ error: e?.message || 'could not read data needs' })
  }
})

// One manual source document for ONE exact open data need. The server only stages a signed request
// envelope; ingest_external.py remains the sole publisher into data/<SUBJECT>/external/**. Both the
// selected historical read and the bare standing/current read must agree before bytes are accepted, and
// the same compare-and-set runs again immediately before the signed intent becomes visible to the router.
// A filing-required need stays on the ordinary filing-upload lane: that Drive publisher has no safe way to
// carry this decision-scoped request/provenance contract, so this endpoint reports the limitation instead
// of disguising a filing as external evidence.
const DataNeedUploadQuery = z.object({ swarm: z.string().min(1).max(120).optional() }).strict()
const DataNeedUploadFields = z.object({
  run_root: z.string().min(1).max(300),
  decision_fingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  need_id: z.string().regex(/^[a-z0-9][a-z0-9_-]{0,127}$/),
  series: z.string().min(1).max(1000),
  provider: z.string().trim().min(1).max(200).refine((value) => !/[\x00-\x1f\x7f]/.test(value)),
  source_url: z.string().max(2048).optional(),
}).strict()

function exactUploadSelection(
  swarmId: string, subject: string,
  binding: { run_root: string; decision_fingerprint: string; need_id: string; series: string },
): ReturnType<typeof selectCurrentDataNeedForUpload> {
  const selected = readDataNeeds(swarmId, subject, binding.run_root)
  // A historical card can still be read, but it may not feed today's shared pool as though its old call
  // were current. Bare readDataNeeds is the server's standing/current projection for every swarm.
  const current = readDataNeeds(swarmId, subject)
  return selectCurrentDataNeedForUpload(selected, current, binding)
}

app.post('/api/data-needs/:subject/upload', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const parsed = DataNeedsParams.safeParse(req.params)
  if (!parsed.success) return reply.code(400).send({ error: 'bad subject' })
  const query = DataNeedUploadQuery.safeParse(req.query ?? {})
  if (!query.success) return reply.code(400).send({ error: 'bad upload query' })
  const swarmId = query.data.swarm ?? RESEARCH_SWARM_ID
  if (!swarmById(swarmId)) return reply.code(400).send({ error: 'unknown swarm' })
  const subject = normalizeDataSubject(swarmId, parsed.data.subject)
  if (!subject) return reply.code(400).send({ error: 'bad subject' })

  // Refuse BEFORE reading the multipart stream unless exactly one finished call owns this label and it
  // belongs to the selected cockpit. The exact run-root comparison follows after fields are available.
  const initialOwner = selectedManualUploadOwner(swarmId, subject)
  if (initialOwner.conflict) return selectedManualUploadOwnerReply(reply, subject, initialOwner.conflict)

  // The Drive pool has one permanent writer: the dedicated Mac Pro. Check this before consuming even
  // one multipart byte, so an admin/standby cockpit cannot mint an HMAC envelope that the writer cannot
  // verify. The same authority is re-attested at the terminal compare-and-set below and by the router
  // trigger itself; a role/pool change during a large upload therefore fails closed.
  if (!manualDataNeedUploadWriterReady()) {
    return reply.code(503).send({
      error: 'manual_upload_writer_unavailable',
      message: 'Additional-data uploads are accepted only by the configured Mac Pro data writer.',
    })
  }

  let received: ReceivedDataNeedUpload | null = null
  const fields: Record<string, string> = {}
  let fileCount = 0
  let malformed = ''
  try {
    for await (const part of req.parts({ limits: {
      fileSize: DATA_NEED_UPLOAD_MAX_BYTES, files: 2, fields: 7, fieldSize: 4096, parts: 9,
    } })) {
      if (part.type === 'file') {
        fileCount++
        if (part.fieldname !== 'file' || fileCount !== 1) {
          malformed = 'exactly one file field is required'; part.file.resume(); continue
        }
        received = await receiveDataNeedUploadFile(part.file, part.filename || '', part.mimetype || 'application/octet-stream')
      } else {
        if (!['run_root', 'decision_fingerprint', 'need_id', 'series', 'provider', 'source_url'].includes(part.fieldname)
            || Object.prototype.hasOwnProperty.call(fields, part.fieldname) || typeof part.value !== 'string') {
          malformed = 'unexpected or duplicate multipart field'; continue
        }
        fields[part.fieldname] = part.value
      }
    }
  } catch (error: any) {
    discardReceivedDataNeedUpload(received)
    return reply.code(400).send({ error: /limit|too many|parts/i.test(String(error?.message || error))
      ? 'upload limits exceeded' : 'malformed multipart upload' })
  }
  if (malformed || fileCount !== 1 || !received) {
    discardReceivedDataNeedUpload(received)
    return reply.code(400).send({ error: malformed || 'exactly one file is required' })
  }
  const body = DataNeedUploadFields.safeParse(fields)
  if (!body.success) {
    discardReceivedDataNeedUpload(received)
    return reply.code(400).send({ error: 'invalid upload binding' })
  }
  const suppliedSourceUrl = normalizeDataNeedSourceUrl(body.data.source_url)
  if (suppliedSourceUrl === undefined) {
    discardReceivedDataNeedUpload(received)
    return reply.code(400).send({ error: 'source_url must be an absolute HTTP(S) URL without credentials' })
  }
  const binding = {
    run_root: body.data.run_root, decision_fingerprint: body.data.decision_fingerprint,
    need_id: body.data.need_id, series: body.data.series,
  }
  const boundOwner = selectedManualUploadOwner(swarmId, subject, binding.run_root)
  if (boundOwner.conflict) {
    discardReceivedDataNeedUpload(received)
    return selectedManualUploadOwnerReply(reply, subject, boundOwner.conflict)
  }
  if (!initialOwner.owner || !boundOwner.owner || initialOwner.owner.swarm !== boundOwner.owner.swarm
      || initialOwner.owner.runRoot !== boundOwner.owner.runRoot) {
    discardReceivedDataNeedUpload(received)
    return reply.code(409).send({ error: 'The data-pool owner changed during upload. Refresh the idea.', code: 'shared_data_owner_changed' })
  }
  const first = exactUploadSelection(swarmId, subject, binding)
  if (typeof first === 'string') {
    discardReceivedDataNeedUpload(received)
    return reply.code(409).send({ error: first })
  }
  if (first.need.filing_required) {
    discardReceivedDataNeedUpload(received)
    return reply.code(409).send({
      error: 'filing_required_use_standard_upload',
      message: 'This need requires a statutory filing. Upload it through the company filing/document lane; it cannot be staged as external evidence.',
    })
  }

  // Prefer the latest exact decision-scoped lookup URL: that record was server-admitted against public
  // DNS and the persisted pipeline source. A URL typed alongside the file is syntax-admitted only, is
  // stamped user_supplied_unverified, and never feeds evidence-tier/date/licensing inference.
  const lookupUrl = first.need.source_lookup?.lookup_status === 'public_link_found'
    && !first.need.source_lookup.stale ? first.need.source_lookup.public_url : null
  const sourceUrl = lookupUrl ?? suppliedSourceUrl
  const sourceUrlBasis = lookupUrl ? 'server_lookup_public_dns' as const
    : sourceUrl ? 'user_supplied_unverified' as const : 'absent' as const

  const { user, userVia } = identify(req)
  let committed: Awaited<ReturnType<typeof commitDataNeedUpload>>
  try {
    committed = await commitDataNeedUpload(received, {
      // Provider is an operator label, not an evidence-quality claim. It is bounded + signed for
      // provenance and selects only the destination folder/label; the router deliberately excludes it
      // from source_type, tier, licence, and as-of inference.
      subject, swarm: swarmId, ...binding, provider: body.data.provider,
      source_url: sourceUrl, source_url_basis: sourceUrlBasis, requested_by: user,
    }, () => {
      if (!manualDataNeedUploadWriterReady()) throw new Error('manual_upload_writer_unavailable')
      const terminalOwner = selectedManualUploadOwner(swarmId, subject, binding.run_root)
      if (terminalOwner.conflict || !terminalOwner.owner
          || terminalOwner.owner.swarm !== initialOwner.owner?.swarm
          || terminalOwner.owner.runRoot !== initialOwner.owner?.runRoot) {
        throw new Error(terminalOwner.conflict?.code || 'shared_data_owner_changed')
      }
      const terminal = exactUploadSelection(swarmId, subject, binding)
      if (typeof terminal === 'string') throw new Error(terminal)
      if (terminal.need.filing_required) {
        throw new Error('selected_need_changed')
      }
      // URL provenance is mutable operational state beside the frozen decision. Bind the label to the
      // terminal read too: a lookup that was superseded or expired while a large file uploaded must not
      // retain the stronger server_lookup_public_dns basis in the signed intent.
      const terminalLookupUrl = terminal.need.source_lookup?.lookup_status === 'public_link_found'
        && !terminal.need.source_lookup.stale ? terminal.need.source_lookup.public_url : null
      if (terminalLookupUrl !== lookupUrl) throw new Error('selected_source_lookup_changed')
    })
  } catch (error: any) {
    discardReceivedDataNeedUpload(received)
    const message = String(error?.message || error)
    if (message === 'manual_upload_writer_unavailable') {
      return reply.code(503).send({ error: message })
    }
    if (['selected_decision_changed', 'selected_call_not_current', 'selected_need_changed', 'selected_source_lookup_changed',
      'shared_data_owner_ambiguous', 'shared_data_owner_mismatch', 'shared_data_owner_required',
      'shared_data_owner_run_mismatch', 'shared_data_owner_unavailable', 'shared_data_owner_changed'].includes(message)) {
      return reply.code(409).send({ error: message })
    }
    return reply.code(503).send({ error: 'could not stage upload safely' })
  }
  // The move into the request envelope consumed the temp file. This call is harmless and closes every
  // error path uniformly if a future filesystem returns after only a partial move.
  discardReceivedDataNeedUpload(received)
  await triggerDataNeedUploadRouter(committed.request_id, { keyFile: committed.key_file })
  const upload = readDataNeedUploadStatus({ subject, swarm: swarmId, ...binding })
  console.log(`[data-need-upload] ${user} (${userVia}) staged ${committed.request_id} for ${swarmId}/${subject}/${binding.need_id}; status=${upload.status}`)
  return reply.code(202).send({ ok: true, upload })
})

const DataNeedUploadStatusQuery = z.object({
  swarm: z.string().min(1).max(120).optional(),
  runRoot: z.string().min(1).max(300),
  decisionFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  need_id: z.string().regex(/^[a-z0-9][a-z0-9_-]{0,127}$/),
  series: z.string().min(1).max(1000),
}).strict()
app.get('/api/data-needs/:subject/upload-status', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
  const parsed = DataNeedsParams.safeParse(req.params)
  if (!parsed.success) return reply.code(400).send({ error: 'bad subject' })
  const query = DataNeedUploadStatusQuery.safeParse(req.query ?? {})
  if (!query.success) return reply.code(400).send({ error: 'bad upload-status query' })
  const swarmId = query.data.swarm ?? RESEARCH_SWARM_ID
  if (!swarmById(swarmId)) return reply.code(400).send({ error: 'unknown swarm' })
  const subject = normalizeDataSubject(swarmId, parsed.data.subject)
  if (!subject) return reply.code(400).send({ error: 'bad subject' })
  return readDataNeedUploadStatus({
    subject, swarm: swarmId, run_root: query.data.runRoot,
    decision_fingerprint: query.data.decisionFingerprint,
    need_id: query.data.need_id, series: query.data.series,
  })
})

// ---------- data pipeline: add a source → live relevance scan → build a connector → open a PR ----------
// The interactive half of the data-needs loop, driven by the cockpit's "Data Pipeline" panel. Adding a source
// is open to any authenticated teammate; the paid SCAN + BUILD actions are separately admin-gated
// (canScanPipeline / canBuildConnector on /api/whoami), exactly like the feedback dispatch. Subject validated
// through the same manifest-aware subject boundary as /api/data-needs; the swarm resolves through the
// registry (swarmById), so an injected swarm id 400s rather than forming a path.
const PipelineParams = z.object({ subject: z.string().min(1).max(64) })

// The folded pipeline ledger for a subject: the sources added, their scan verdicts, and build status.
app.get('/api/pipeline/:subject', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req, reply) => {
  const parsed = PipelineParams.safeParse(req.params)
  if (!parsed.success) return reply.code(400).send({ error: 'bad subject' })
  const swarmId = String((req.query as any)?.swarm ?? RESEARCH_SWARM_ID)
  if (!swarmById(swarmId)) return reply.code(400).send({ error: 'unknown swarm' })
  const subject = normalizeDataSubject(swarmId, parsed.data.subject)
  if (!subject) return reply.code(400).send({ error: 'bad subject' })
  return { items: listPipelineForSubject(swarmId, subject) }
})

// Add a source (a website / API endpoint) to scan. Open to any authenticated teammate (like filing feedback).
const AddSourceBody = z.object({
  need_id: z.string().max(128).nullish(), // the panel sends null when no specific need is targeted (free-form)
  runRoot: z.string().min(1).max(300).optional(),
  decisionFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/).optional(),
  source_url: z.string().min(1).max(2000),
  source_kind: z.enum(['api', 'scrape', 'web', 'file']).optional(),
  series_hint: z.string().max(400).optional(),
  sample: z.string().max(4000).optional(),
  note: z.string().max(2000).optional(),
}).strip()
app.post('/api/pipeline/:subject/source', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const parsed = PipelineParams.safeParse(req.params)
  if (!parsed.success) return reply.code(400).send({ error: 'bad subject' })
  const swarmId = String((req.query as any)?.swarm ?? RESEARCH_SWARM_ID)
  if (!swarmById(swarmId)) return reply.code(400).send({ error: 'unknown swarm' })
  const subject = normalizeDataSubject(swarmId, parsed.data.subject)
  if (!subject) return reply.code(400).send({ error: 'bad subject' })
  const body = AddSourceBody.safeParse(req.body)
  if (!body.success) return reply.code(400).send({ error: 'invalid body', detail: body.error.flatten() })
  let scopedRead: ReturnType<typeof readDataNeeds> = null
  if (body.data.need_id) {
    if (!body.data.runRoot || !body.data.decisionFingerprint) {
      return reply.code(409).send({ error: 'select the exact decision again before attaching this source' })
    }
    scopedRead = readDataNeeds(swarmId, subject, body.data.runRoot)
    const target = scopedRead?.needs.find((need) => need.need_id === body.data.need_id)
    if (!scopedRead || scopedRead.decision_fingerprint !== body.data.decisionFingerprint
        || !target || target.filing_required || target.built_by) {
      return reply.code(409).send({ error: 'the selected data need changed or is no longer open' })
    }
  }
  // Persist only an exact public-DNS HTTPS origin with globally routable A/AAAA answers.
  // The generic failure never reflects a query string which may have contained a credential.
  const safeSource = await resolvedConnectorSourceUrl(body.data.source_url)
  if (!safeSource) return reply.code(400).send({ error: 'source_url must be a public HTTPS URL without embedded credentials' })
  const { user } = identify(req)
  const item = await writePipelineSource({
    subject, swarm: swarmId,
    ...(scopedRead ? { run_root: scopedRead.run_root, decision_fingerprint: scopedRead.decision_fingerprint } : {}),
    need_id: body.data.need_id ?? null,
    series_hint: body.data.series_hint,
    source_url: safeSource.url,
    source_kind: (body.data.source_kind ?? 'web') as PipelineSourceKind,
    sample: body.data.sample,
    note: body.data.note,
  }, user)
  return reply.code(201).send({ ok: true, item })
})

// Run the LIVE relevance scan over an added source, streaming what is being scanned/checked second by second.
// Admin-gated (a paid spawn). SSE (POST → startSSE), aborts on client disconnect, and appends a `scanned`
// event carrying the verdict on completion. The scan sees only the run's NON-filing (connector-eligible) needs.
app.post('/api/pipeline/:subject/scan', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const parsed = PipelineParams.safeParse(req.params)
  if (!parsed.success) return reply.code(400).send({ error: 'bad subject' })
  const swarmId = String((req.query as any)?.swarm ?? RESEARCH_SWARM_ID)
  if (!swarmById(swarmId)) return reply.code(400).send({ error: 'unknown swarm' })
  const subject = normalizeDataSubject(swarmId, parsed.data.subject)
  if (!subject) return reply.code(400).send({ error: 'bad subject' })
  const { user } = identify(req)
  if (!isDispatchAdmin(user) || !pipelineScanReady()) return reply.code(403).send({ error: 'not authorized to scan (admin only, and scanning must be enabled)' })
  const id = String((req.body as any)?.pipeline_id ?? '')
  const source = getPipelineSource(id)
  if (!source || source.subject !== subject.toUpperCase() || source.swarm !== swarmId) return reply.code(404).send({ error: 'no such source for this subject' })
  // Old ledger rows pre-date the admission policy; revalidate before a web-capable agent sees one.
  const safeSource = await resolvedConnectorSourceUrl(source.source_url)
  if (!safeSource) return reply.code(400).send({ error: 'source is not an allowed public HTTPS destination' })
  const read = source.run_root && source.decision_fingerprint
    ? readDataNeeds(swarmId, subject, source.run_root)
    : readDataNeeds(swarmId, subject)
  if (source.run_root && (!read || read.decision_fingerprint !== source.decision_fingerprint)) {
    return reply.code(409).send({ error: 'the decision attached to this source has changed' })
  }
  const needs = (read?.needs ?? []).filter((n) => !n.filing_required)

  const { res, send, ping } = startSSE(reply)
  const ac = new AbortController()
  let closed = false
  res.on('close', () => { closed = true; clearInterval(ping); ac.abort() })
  send({ type: 'scan-status', stage: 'starting', openNeeds: needs.length })
  await appendPipelineEvent(id, 'scanning', { note: 'Scanning the source for relevance.', user }).catch(() => null)
  try {
    const out = await runRelevanceScan({
      input: {
        subject, swarm: swarmId, needs,
        source: { source_url: safeSource.url, source_kind: source.source_kind, sample: source.sample, note: source.note, need_id: source.need_id, series_hint: source.series_hint },
      },
      signal: ac.signal,
      onSignal: (s: ScanSignal) => {
        if (s.kind === 'ready') send({ type: 'scan-status', stage: 'scanning', model: s.model })
        else if (s.kind === 'activity') send({ type: 'scan-activity', tool: s.tool, target: s.target })
        else if (s.kind === 'thinking') send({ type: 'scan-thinking', content: s.text })
      },
    })
    if (out.error && out.error !== 'aborted') {
      send({ type: 'scan-error', message: out.error })
      await appendPipelineEvent(id, 'scanned', { note: `Scan failed: ${out.error}`, user }).catch(() => null)
    } else if (!out.error && out.verdict) {
      const bound = await resolveBoundConnectorUrls(safeSource.url, out.verdict.endpoint_hint)
      if (!bound) {
        send({ type: 'scan-error', message: 'The proposed endpoint is not on the admitted public HTTPS host.' })
        await appendPipelineEvent(id, 'scanned', { note: 'Scan endpoint failed the connector URL boundary.', user }).catch(() => null)
      } else {
        const verdict = { ...out.verdict, host: bound.source.host, endpoint_hint: bound.endpoint.url }
        send({ type: 'scan-verdict', verdict, costUsd: out.costUsd })
        await appendPipelineEvent(id, 'scanned', { verdict, note: verdict.verdict_note, user }).catch(() => null)
      }
    }
  } catch (e: any) {
    if (!closed) send({ type: 'scan-error', message: String(e?.message || e) })
  } finally {
    clearInterval(ping)
    try { res.end() } catch { /* already closed */ }
  }
})

// Send a scanned source to the coding engine, which builds a connector and opens a PR (ready for review).
// Admin-gated + fail-closed; requires a prior scan verdict on the source. 202 accepted / 409 busy-or-blocked.
app.post('/api/pipeline/source/:id/build', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const id = (req.params as any).id as string
  if (!isPipelineId(id)) return reply.code(400).send({ error: 'invalid source id' })
  const { user } = identify(req)
  if (!isDispatchAdmin(user)) return reply.code(403).send({ error: 'not authorized to build (admin only)' })
  const source = getPipelineSource(id)
  const view = getPipelineView(id)
  if (!source || !view) return reply.code(404).send({ error: 'no such source' })
  if (!view.verdict) return reply.code(409).send({ error: 'scan this source before building a connector for it' })
  if (!view.verdict.buildable) return reply.code(409).send({ error: 'this exact link is useful for manual research but is not approved for an automatic connector' })
  if (source.run_root && source.decision_fingerprint) {
    const read = readDataNeeds(source.swarm, source.subject, source.run_root)
    const target = source.need_id ? read?.needs.find((need) => need.need_id === source.need_id) : null
    if (!read || read.decision_fingerprint !== source.decision_fingerprint || !target
        || target.filing_required || target.built_by || target.entry_modules.length === 0) {
      return reply.code(409).send({ error: 'the attached decision route changed or is no longer buildable' })
    }
  }
  const outcome = await startConnectorDispatch(source, view.verdict, user)
  return reply.code(outcome.accepted ? 202 : 409).send({ ok: outcome.accepted, ...outcome })
})

// ---------- data library: find feeds → build them → watch it happen ----------
// The Data Library's own half of the loop. /api/pipeline/* above starts from a source the user already has;
// these start from a SUBJECT and go looking. Same gates as the scan/build they reuse (admin + the paid-spawn
// flags, both fail-closed), same swarm/subject barriers, and the SAME ledger — a discovered feed is written
// as an ordinary pipeline source with its scan verdict attached, so the existing build route drives it and
// nothing here is a parallel pipeline.

// Deep-search the open web for feeds worth wiring for one subject, streaming what it is doing second by
// second. Each keeper is persisted (source + `scanned` verdict) and streamed back with its pipeline_id, so
// the client can hand it straight to the build route. `autoBuild` builds the single strongest candidate — the
// one-click path from the Recommended row — and is ignored unless the caller may build.
const DiscoverBody = z.object({
  subject: z.string().min(1).max(64),
  need_id: z.string().regex(/^[a-z0-9][a-z0-9_-]*$/).max(128).nullish(),
  // A targeted lookup echoes the server-stamped run_root from /api/data-needs. The resolver below owns
  // containment and subject identity; a client cannot select another company's call.
  runRoot: z.string().min(1).max(300).optional(),
  decisionFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/).optional(),
  want: z.string().max(500).optional(),
  autoBuild: z.boolean().optional(),
}).strip()
app.post('/api/pipelines/discover', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const body = DiscoverBody.safeParse(req.body)
  if (!body.success) return reply.code(400).send({ error: 'invalid body', detail: body.error.flatten() })
  const swarmId = String((req.query as any)?.swarm ?? RESEARCH_SWARM_ID)
  if (!swarmById(swarmId)) return reply.code(400).send({ error: 'unknown swarm' })
  const subject = normalizeDataSubject(swarmId, body.data.subject)
  if (!subject) return reply.code(400).send({ error: 'bad subject' })
  if (body.data.runRoot !== undefined && !resolveDataNeedsRunRoot(swarmId, subject, body.data.runRoot)) {
    return reply.code(400).send({ error: 'runRoot does not match this subject and swarm' })
  }
  const { user } = identify(req)
  if (!isDispatchAdmin(user) || !pipelineScanReady()) return reply.code(403).send({ error: 'not authorized to search for feeds (admin only, and scanning must be enabled)' })
  const mayBuild = isDispatchAdmin(user) && connectorDispatchReady()

  // relevance inputs: what the runs said is missing, and what is already wired (so nothing is proposed twice)
  const needsRead = readDataNeeds(swarmId, subject, body.data.runRoot)
  if (body.data.need_id) {
    // Positive-match version negotiation: an old client has neither immutable identity field and must not
    // launch a targeted search against whichever call happens to be current on this deploy.
    if (!body.data.runRoot || !body.data.decisionFingerprint) {
      return reply.code(409).send({ error: 'select the exact decision again before searching this need' })
    }
    if (!needsRead || needsRead.contract_version !== 'data-needs-read/2'
        || needsRead.run_root !== body.data.runRoot
        || needsRead.decision_fingerprint !== body.data.decisionFingerprint) {
      return reply.code(409).send({ error: 'the selected decision changed; refresh before searching' })
    }
  }
  // Discovery is for OPEN needs. `built_by` is the registry's exact current+usable proof; sending one back
  // to the scouting agent wastes a paid search and can propose a duplicate primary for a closed gap.
  const needs = openDiscoverNeeds(needsRead?.needs ?? [], body.data.need_id)
  const wired = readPipelines().pipelines.map((p) => ({ series: p.series, provider: p.provider, subjects: p.subjects }))
  const lookupStartedAt = new Date().toISOString()

  const { res, send, ping } = startSSE(reply)
  const ac = new AbortController()
  let closed = false
  res.on('close', () => { closed = true; clearInterval(ping); ac.abort() })
  send({ type: 'discover-status', stage: 'starting', openNeeds: needs.length, wired: wired.length })
  try {
    // A targeted closed/filing/unknown need has no admissible persistence target. General subject/free-text
    // discovery remains useful without structured needs and persists only unscoped candidates.
    if (shouldSkipFeedDiscovery(needs, body.data.need_id)) {
      if (!closed) send({ type: 'discover-done', found: 0, costUsd: 0, autoBuilt: 0 })
      return
    }
    const out = await runFeedDiscovery({
      input: { subject, swarm: swarmId, want: discoverWant(body.data.want || '', needs, body.data.need_id), needs, wired },
      signal: ac.signal,
      onSignal: (s: ScanSignal) => {
        if (s.kind === 'ready') send({ type: 'discover-status', stage: 'searching', model: s.model })
        else if (s.kind === 'activity') send({ type: 'discover-activity', tool: s.tool, target: s.target })
        else if (s.kind === 'thinking') send({ type: 'discover-thinking', content: s.text })
      },
    })
    if (closed) return
    if (out.error) {
      if (out.error !== 'aborted') send({ type: 'discover-error', message: out.error })
      return
    }

    let built = 0
    let found = 0
    let targetedMatch: AdmittedLookupMatch | null = null
    let validationIncomplete = !out.complete
    for (const rawFeed of out.feeds) {
      // Model ids and modules are claims, never authority. Targeted lookup is exact + current-need only.
      // General discovery may keep relevant candidates, but routing is intersected with server-owned needs
      // and is empty when there is no match.
      const feed = admitDiscoveredForOpenNeeds(rawFeed, needs, body.data.need_id)
      if (!feed) continue
      // Discovery parsing is structural-only. DNS and exact-host admission happen
      // here, immediately before either model output is persisted or dispatched.
      const bound = await resolveBoundConnectorUrls(feed.source_url, feed.verdict.endpoint_hint)
      if (closed) return
      if (!bound) { validationIncomplete = true; continue }
      const verdict = { ...feed.verdict, host: bound.source.host, endpoint_hint: bound.endpoint.url }
      // persist as an ordinary source + its verdict, so it is indistinguishable downstream from a hand-added
      // source that was scanned — one ledger, one build path (§2)
      const item = await writePipelineSource({
        subject, swarm: swarmId,
        ...(body.data.need_id && needsRead ? {
          run_root: needsRead.run_root,
          decision_fingerprint: needsRead.decision_fingerprint,
        } : {}),
        need_id: verdict.matched_need_ids[0] ?? null,
        series_hint: feed.verdict.series,
        source_url: bound.source.url,
        source_kind: verdict.acquisition === 'scrape' ? 'scrape' : verdict.acquisition === 'manual' ? 'web' : 'api',
        note: feed.why,
      }, user)
      found++
      await appendPipelineEvent(item.pipeline_id, 'scanned', { verdict, note: feed.why || verdict.verdict_note, user })
      if (body.data.need_id && !targetedMatch) {
        targetedMatch = {
          pipelineId: item.pipeline_id,
          publicUrl: bound.source.url,
          note: 'A completed targeted search returned an exact HTTPS address whose host had public DNS.',
        }
      }
      let building = false
      const connectorExists = existingConnectorFor(item, verdict)
      // one-click: build the strongest buildable candidate straight away, and say so in the stream
      if (!body.data.need_id && !connectorExists && body.data.autoBuild && mayBuild && built === 0
          && verdict.buildable && verdict.relevance !== 'none') {
        building = (await startConnectorDispatch(item, verdict, user)).accepted
        if (building) built++
      }
      send({ type: 'discover-found', pipeline_id: item.pipeline_id, source_url: bound.source.url, why: feed.why,
        verdict, building, connector_exists: connectorExists })
    }
    if (closed) return
    // Only a targeted, completed search has one well-defined operational outcome. General searches may
    // cover several needs and therefore write no lookup overlay. Exact found links join back to the exact
    // persisted source; a clean zero-exact result records the explicit no-result state.
    const targetedNeed = body.data.need_id ? needs.find((need) => need.need_id === body.data.need_id) : undefined
    if (targetedNeed) {
      // Terminal compare-and-set: the same immutable decision and the same still-open need must survive the
      // full web search. A commodity projection can change in place while the model is running.
      const terminalRead = readDataNeeds(swarmId, subject, body.data.runRoot)
      const terminalNeed = terminalRead?.needs.find((need) => need.need_id === targetedNeed.need_id)
      if (!terminalRead || terminalRead.decision_fingerprint !== body.data.decisionFingerprint
          || terminalRead.run_root !== body.data.runRoot || !terminalNeed
          || terminalNeed.series !== targetedNeed.series || terminalNeed.filing_required || terminalNeed.built_by) {
        send({ type: 'discover-error', message: 'The selected decision changed while searching. No lookup result was recorded.' })
        return
      }
      if (!targetedMatch && validationIncomplete) {
        send({ type: 'discover-error', message: 'A candidate could not be validated as an exact public-DNS HTTPS address. No lookup result was recorded.' })
        return
      }
    }
    const lookup = planTargetedNeedLookup(targetedNeed, 'completed', targetedMatch)
    if (targetedNeed && lookup) {
      try {
        await writeNeedLookup({
          subject, swarm: swarmId, run_root: needsRead!.run_root,
          decision_fingerprint: needsRead!.decision_fingerprint,
          need_id: targetedNeed.need_id, series: targetedNeed.series,
          lookup_started_at: lookupStartedAt, ...lookup,
        }, user)
      } catch (error: any) {
        if (/stale lookup attempt/.test(String(error?.message || error))) {
          send({ type: 'discover-done', found, costUsd: out.costUsd, autoBuilt: built,
            decisionFingerprint: needsRead!.decision_fingerprint, superseded: true })
          return
        }
        throw error
      }
    }
    send({ type: 'discover-done', found, costUsd: out.costUsd, autoBuilt: built,
      ...(needsRead ? { decisionFingerprint: needsRead.decision_fingerprint } : {}) })
  } catch (e: any) {
    if (!closed) send({ type: 'discover-error', message: String(e?.message || e) })
  } finally {
    clearInterval(ping)
    try { res.end() } catch { /* already closed */ }
  }
})

// Every build the ledger knows about, newest activity first — what the Data Library shows under "being built"
// after a reload (the in-memory step transcript below does not survive a restart; this does).
app.get('/api/pipelines/builds', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async () => {
  return { items: listRecentPipeline(40).filter((v) => v.status !== 'new') }
})

// Watch ONE build happen: replays the steps so far, then streams each new one, and ends on the outcome. GET +
// EventSource (the client reconnects for free). Read-only — starting a build stays the POST route above.
app.get('/api/pipelines/build/:id/stream', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
  const id = (req.params as any).id as string
  if (!isPipelineId(id)) return reply.code(400).send({ error: 'invalid build id' })
  const { res, send, ping } = startSSE(reply)
  let sent = 0
  const push = (p: { running: boolean; steps: { tool: string; target: string }[]; outcome: string | null; prUrl: string | null; connectorId: string | null; note: string; finishedAt: string | null }) => {
    for (const step of p.steps.slice(sent)) send({ type: 'build-step', tool: step.tool, target: step.target })
    sent = p.steps.length
    if (!p.running) send({ type: 'build-done', outcome: p.outcome, prUrl: p.prUrl, connectorId: p.connectorId, note: p.note, finishedAt: p.finishedAt })
  }
  const current = getBuildProgress(id)
  if (!current) {
    // no live transcript on THIS server (a restart, or another host ran it) — say so instead of hanging
    const view = getPipelineView(id)
    send({ type: 'build-absent', status: view?.status ?? null, prUrl: view?.pr_url ?? null, connectorId: view?.connector_id ?? null, note: view?.last_note ?? '' })
    clearInterval(ping)
    try { res.end() } catch { /* already closed */ }
    return
  }
  send({ type: 'build-status', running: current.running, startedAt: current.startedAt })
  const unsubscribe = subscribeBuild(id, (p) => {
    push(p)
    if (!p.running) { clearInterval(ping); unsubscribe(); try { res.end() } catch { /* already closed */ } }
  })
  res.on('close', () => { clearInterval(ping); unsubscribe() })
  push(current)
  if (!current.running) { clearInterval(ping); unsubscribe(); try { res.end() } catch { /* already closed */ } }
})

// ---------- connectors: health watchdog and manual repair request ----------
// #287's run_connectors.py (launchd) is the sole fetcher and owns every feed's freshness/health; the cockpit
// read surface for that is GET /api/pipelines (pipelines.ts). This endpoint preserves the repair request
// contract but fails closed until an OS/VM-isolated coding-agent adapter exists. A connector id is matched
// against the discovered manifests (never joined into a path), so an injected id simply 404s.
const CONNECTOR_ID_RE = /^[a-z0-9][a-z0-9_-]{0,120}$/

// Admin repair request. It currently returns not_ready without starting an agent; future activation still
// requires the hard isolation gate. Body: { subject? } names the failing subject (else the first one).
app.post('/api/connectors/:id/repair', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const id = (req.params as any).id as string
  if (!CONNECTOR_ID_RE.test(id)) return reply.code(400).send({ error: 'invalid connector id' })
  const { user } = identify(req)
  if (!isDispatchAdmin(user)) return reply.code(403).send({ error: 'not authorized (admin only)' })
  const m = getConnector(id)
  if (!m) return reply.code(404).send({ error: 'no such connector' })
  const subject = typeof (req.body as any)?.subject === 'string' && m.subjects.includes((req.body as any).subject)
    ? (req.body as any).subject : m.subjects[0]
  // Hand the repair agent the last error #287's fetch ledger recorded for this feed — the same diagnostic
  // the watchdog passes — instead of an empty string that renders as '(no error text captured)'.
  const outcome = startConnectorRepair(m, subject, lastLedgerError(m.id, subject))
  return reply.code(outcome.accepted ? 202 : 409).send({ ok: outcome.accepted, ...outcome })
})

// Data-library read: discovered connector manifests (.claude/connectors/*/connector.json) x live pool
// freshness x uncovered-need recommendations (data_needs join). Read-only; fail-closed manifest drops
// are audited in `widened`; a pool-less host serves poolAvailable:false + 'unknown' statuses honestly.
app.get('/api/pipelines', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (_req, reply) => {
  try {
    return { read: readPipelines() }
  } catch (e: any) {
    return reply.code(500).send({ error: e?.message || 'could not read pipelines' })
  }
})

// Analyze the documents that landed since the last run and (re)write the scoped rerun plan. This is
// the cheap, advisory 'doc-intake' launch (clone of 'review'): it reads + reasons + writes a plan and
// launches NO rerun (reruns stay a human one-click, CLAUDE.md §24). Same CSRF + data-pool allow-list
// guards as /api/thesis-plan/run. Auto-analyze-on-landing calls launch({kind:'doc-intake'})
// directly through the same path.
// Legacy path is a hard refusal. The versioned path below is the protocol guarantee: an older server
// cannot accept a new browser's paid doc-intake request after a rolling deploy changes the origin.
app.post('/api/intake/:subject/analyze', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (_req, reply) => (
  reply.code(426).send({ error: 'exact_intake_endpoint_required' })
))
app.post('/api/intake/:subject/analyze-exact', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  const parsed = IntakeParams.safeParse(req.params)
  const query = IntakeQuery.safeParse(req.query ?? {})
  const providerBody = ProviderBody.safeParse(req.body ?? {})
  if (!parsed.success || !query.success || !providerBody.success) return reply.code(400).send({ error: 'bad intake request' })
  const swarmId = query.data.swarm ?? RESEARCH_SWARM_ID
  const subject = normalizeDataSubject(swarmId, parsed.data.subject)
  const { user, userVia } = identify(req)
  if (!subject || isReservedDataFolder(subject)) return reply.code(400).send({ error: 'bad subject' })

  // Analyze only the standing/current call. A historical card remains readable, but the swarm command
  // resolves its own current run; accepting an old selector here would read current bytes and then show
  // the result on a different historical call. Require both selectors to resolve to the same canonical
  // run and an object decision record before spending anything.
  const selected = resolveIntakeRunRoot(subject, { swarmId, runRoot: query.data.runRoot }, true)
  const current = resolveIntakeRunRoot(subject, { swarmId }, true)
  const selectedNeeds = selected ? readDataNeeds(swarmId, subject, selected.runRoot) : null
  if (!query.data.runRoot || !query.data.decisionFingerprint || !selected || !current
      || selected.root !== current.root
      || selectedNeeds?.decision_fingerprint !== query.data.decisionFingerprint) {
    return reply.code(409).send({ error: 'Open the current completed call before reading new data.', code: 'selected_call_not_current' })
  }

  // Existing pool membership, contained under the configured data root. DATA_DIR itself may be the
  // production Drive symlink; the subject child may not be another symlink or escape that resolved root.
  let poolOk = false
  try {
    const dataRoot = fs.realpathSync(DATA_DIR)
    const poolPath = path.join(DATA_DIR, subject)
    if (!fs.lstatSync(poolPath).isSymbolicLink() && fs.statSync(poolPath).isDirectory()) {
      const realPool = fs.realpathSync(poolPath)
      poolOk = realPool.startsWith(dataRoot + path.sep) && path.basename(realPool) === subject
    }
  } catch { /* missing / unsafe pool */ }
  if (!poolOk) {
    return reply.code(400).send({ error: `unknown subject ${subject}` })
  }
  // Serialize intake per subject. `doc-intake` declares no write targets, so admission's own
  // per-subject exclusivity has nothing to key on — two concurrent POSTs (a double-click, or the
  // PR3 auto-analyze-on-landing firing alongside a manual click) would each pass the busy-check
  // below and both carry into the same `intake/` dir, racing the plan write + commit. The same
  // in-process `withSubjectLock` + busy-check the sibling /api/thesis-plan routes use closes it:
  // the first caller registers an in-flight run via `launch()`; the second then sees it (or is
  // rejected outright by the held lock) and 409s instead of racing.
  try {
    return await withSubjectLock(subjectMutationLockKey(swarmId, subject), async () => {
      const busy = listRuns().some((r) => r.subjectId === subject && (r.swarmId || RESEARCH_SWARM_ID) === swarmId
        && (IN_FLIGHT_STATUSES.has(r.status) || r.endedAt === undefined))
      if (busy) return reply.code(409).send({ error: `A run is already in flight on ${subject}. Let it finish (or stop it) before analyzing new documents.`, code: 'subject_busy' })
      try {
        const out = await launch({
          kind: 'doc-intake', ticker: subject,
          provider: providerBody.data.provider,
          model: providerBody.data.model,
          reasoningLevel: providerBody.data.reasoningLevel,
          expectedProfileKey: providerBody.data.expectedProfileKey,
          ...(swarmId !== RESEARCH_SWARM_ID ? { swarm: swarmId } : {}),
          runRoot: selected.runRoot,
          decisionRunRoot: selected.runRoot,
          decisionFingerprint: selectedNeeds.decision_fingerprint,
          user, userVia,
        })
        return out
      } catch (e: any) {
        const body = e?.body && typeof e.body === 'object' ? e.body : null
        return reply.code(e?.statusCode || 500).send({ error: e?.message || 'intake analysis failed', ...(body || {}) })
      }
    })
  } catch (e: any) {
    if (e instanceof SubjectBusyError) {
      return reply.code(409).send({ error: `Another intake analysis for ${subject} is already in progress. Wait for it to finish before retrying.`, code: 'subject_busy' })
    }
    throw e
  }
})

// ---------- complete the thesis ----------
// What is actually missing before this subject can have a final thesis, and what already exists on disk
// (possibly in an OLDER dated run folder) that must therefore NOT be paid for again. Read-only; recomputed
// from disk on every call, so the panel can never show a stale "what's done" picture.
// `?reuse=a,b` re-prices the plan for a caller's chosen reuse set (the panel's checkboxes) — the SERVER
// stays the only thing that prices a run, so the number on the button can never drift from the number the
// launcher will charge. Omit it for the safe default (reuse everything finished-and-current).
app.get('/api/thesis-plan', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req, reply) => {
  const q = req.query as { ticker?: string; swarm?: string; reuse?: string; module?: string; runRoot?: string; provider?: string; model?: string; reasoningLevel?: string }
  // isValidTicker, not the bare TICKER_RE: the regex admits ".." (its charclass includes `.`), and
  // `dataPoolNewest('..')` would synchronously walk the whole repo — a blocking scan on the event loop.
  if (!q.ticker || !isValidTicker(q.ticker)) return reply.code(400).send({ error: 'bad ticker' })
  if (q.swarm && !swarmById(q.swarm)) return reply.code(400).send({ error: 'unknown swarm' })
  if (q.module && !MODULE_RE.test(q.module)) return reply.code(400).send({ error: 'bad module' })
  if (q.runRoot && !/^analyses\/[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}$/.test(q.runRoot)) {
    return reply.code(400).send({ error: 'bad saved run root' })
  }
  const reuse = q.reuse === undefined ? undefined : q.reuse.split(',').filter(Boolean)
  if (reuse && (reuse.length > 64 || reuse.some((m) => !MODULE_RE.test(m)))) return reply.code(400).send({ error: 'bad reuse set' })
  try {
    const provider = ProviderQuery.safeParse(q)
    if (!provider.success) return reply.code(400).send({ error: 'invalid provider profile' })
    const swarm = q.swarm || RESEARCH_SWARM_ID
    const continuationCandidate = q.runRoot ? exactContinuationCandidate({
      swarm: 'research', subject: q.ticker, runRoot: q.runRoot,
      kind: q.module ? 'module' : 'full', module: q.module,
    }, listResumableRuns()) : null
    if (q.runRoot && !continuationCandidate) {
      return reply.code(409).send({ error: 'The saved run changed. Refresh before continuing.', code: 'saved_run_changed' })
    }
    let plan
    try {
      plan = await thesisPlanForRequest(q.ticker, swarm, reuse, q.module, provider.data,
        continuationCandidate ? { continuationRunRoot: continuationCandidate.runRoot } : undefined)
    } catch (error: any) {
      // A pre-snapshot FULL run cannot be continued in place because it has no immutable generation proof.
      // If all reusable work comes from this one selected root, offer a protected migration instead: copy
      // only finished modules into a new run, freeze today's pool, and rebuild every unbound partial orb.
      if (!continuationCandidate || q.module || error?.code !== 'legacy_generation_unbound') throw error
      const ordinary = await thesisPlanForRequest(q.ticker, swarm, reuse, undefined, provider.data)
      const migrated = await legacySingleRunMigrationPlan(ordinary, continuationCandidate.runRoot)
      if (!migrated) throw error
      plan = migrated
    }
    // A finished local module normally reads `done`/non-runnable. A durable failed-publication marker is
    // therefore attached explicitly so the heading offers a publish-only recovery instead of re-running paid
    // orbs. Re-hash on every plan read; edited/stale bytes never receive the affordance.
    if (plan.swarm === RESEARCH_SWARM_ID) {
      for (const entry of plan.modules) {
        const pending = validPendingModulePublication(q.ticker, entry.module)
        if (pending) {
          entry.publicationPending = {
            targetRunRoot: pending.targetRunRoot,
            fingerprint: pending.fingerprint,
          }
        }
      }
    }
    return plan
  } catch (e: any) {
    return reply.code(e?.statusCode || 500).send({ error: e?.message || 'could not build the completion plan', code: e?.code })
  }
})

// Complete/Continue is a receipt-checked transaction. Planning reads canonical disk truth; preparation builds
// a private tree outside Git; launch atomically activates it only after logical admission. If no provider child
// starts, the old tree is restored (or the new tree disappears), so Activity and the filesystem cannot imply a
// run that never spent. One request id may be retried before spend, but can never start a second paid attempt.
app.post('/api/thesis-plan/run', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (req, reply) => {
  // CSRF guard — this route launches a paid run and writes to disk from a plain POST, same class of
  // non-preflighted write as /api/tickers and /api/chat (see originAllowed's own comment: the catch-all
  // content-type parser means a cross-origin "simple request" reaches this handler without a preflight).
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  const parsed = ThesisPlanRunBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const {
    ticker, reuse, swarm, provider, model, reasoningLevel, expectedProfileKey, confirmTicker,
    sourceRunRoot, requestId, continuationReceipt,
  } = parsed.data
  const { user, userVia } = identify(req)
  if (!isValidTicker(ticker)) return reply.code(400).send({ error: 'bad ticker' })
  // Same closed allow-list /api/launch enforces before a research launch: membership in the data pool.
  // Without it, a caller could drive a full paid run for a ticker with no data on disk at all — `launch()`
  // itself does not re-check this for kind:'full', it is enforced at the route layer only.
  // Exact Continue reads its retained frozen generation only. Do not even stat today's Drive folder: it may
  // have newer uploads, be temporarily offline, or disappear after the original run without changing the
  // immutable evidence that saved work must finish against.
  if (!sourceRunRoot && (isReservedDataFolder(ticker) || !fs.existsSync(path.join(DATA_DIR, ticker)))) {
    return reply.code(400).send({ error: `unknown ticker ${ticker}` })
  }

  // Research-only, by POSITIVE match. `swarm` is REQUIRED (the client always sends it) so an omitted field can
  // never read as "research" — carry-forward assumes dated run folders, and `launch({kind:'full'})` below would
  // otherwise dispatch a RESEARCH pipeline against another swarm's subject and push its output to main. A
  // constellation swarm keeps one stable folder per subject, so it has no cross-folder reuse problem to solve.
  if (swarm !== RESEARCH_SWARM_ID) {
    return reply.code(400).send({ error: `Completing a ${swarm ?? 'non-research'} dossier from here isn’t supported yet — run its pipeline from the swarm’s own controls.`, code: 'swarm_unsupported' })
  }

  // Carrying from an implicit mixture of dated folders has no single frozen evidence generation. Keep the
  // ordinary typed Full action available, but never let a generic completion silently combine those roots.
  if (!sourceRunRoot && continuationReceipt.sourceRunRoots.length > 0) {
    return reply.code(409).send({
      error: 'Choose one exact saved run to continue, or start a new Full run. Nothing was started.',
      code: 'exact_source_required',
    })
  }

  const requestIntent = {
    requestId,
    planFingerprint: continuationReceipt.fingerprint,
    user,
    subject: ticker,
  }
  // Idempotent replay is resolved before another provider probe. A successful click remains successful even
  // if the provider later goes offline; an in-flight first request never becomes a second launch.
  const existingRequest = await readRunPlanRequest(requestId)
  if (existingRequest) {
    const sameIntent = existingRequest.planFingerprint === requestIntent.planFingerprint
      && existingRequest.user === user && existingRequest.subject === ticker
    if (!sameIntent) {
      return reply.code(409).send({ error: 'This request id belongs to a different reviewed plan.', code: 'request_reused' })
    }
    if ((existingRequest.status === 'admitted' || existingRequest.status === 'started') && existingRequest.response) {
      return existingRequest.response
    }
    if (existingRequest.status === 'admitted' || existingRequest.status === 'started') {
      return reply.code(409).send({ error: 'This reviewed request is already being admitted or is running.', code: 'request_in_progress' })
    }
  }

  // A reviewed deployment intentionally closes provider admission while this healthy process still serves
  // planning reads. Do not probe/reject the provider in that window: the exact request is persisted below
  // and availability is re-checked on the deployed program before any provider child can start.
  let providerPrecheckError: any = null
  if (!providerDeployPending(STATE_DIR)) {
    try { await assertProviderAvailable(provider) } catch (e: any) { providerPrecheckError = e }
  }

  // Reserve this ticker across the final plan CAS, durable claim, private preparation, and launch admission.
  // No canonical run-root byte is written until launch owns all of its ordinary barriers.
  try {
    return await withSubjectLock(subjectMutationLockKey(RESEARCH_SWARM_ID, ticker), async () => {
      if (subjectChainActive(ticker, RESEARCH_SWARM_ID)) {
        return reply.code(409).send({ error: `A full analysis is already running on ${ticker}. Let it finish (or stop it) before completing the thesis.`, code: 'subject_busy' })
      }
      // Never prepare a replacement for a root another run currently owns.
      const busy = listRuns().some((r) => (r.swarmId || RESEARCH_SWARM_ID) === RESEARCH_SWARM_ID
        && r.subjectId === ticker && (IN_FLIGHT_STATUSES.has(r.status) || r.endedAt === undefined))
      if (busy) return reply.code(409).send({ error: `A run is already in flight on ${ticker}. Let it finish (or stop it) before completing the thesis.`, code: 'subject_busy' })

      // ONE disk snapshot decides everything below. This is deliberately rebuilt after the CLI await and under
      // the subject lock, immediately before the durable request claim.
      const selection = { provider, model, reasoningLevel, expectedProfileKey }
      const continuationCandidate = sourceRunRoot ? exactContinuationCandidate({
        swarm: 'research', subject: ticker, runRoot: sourceRunRoot, kind: 'full',
      }, listResumableRuns()) : null
      if (sourceRunRoot && !continuationCandidate) {
        return reply.code(409).send({ error: 'The saved run changed. Refresh before continuing; no run was started.', code: 'plan_changed' })
      }
      const trustedSourceRunRoot = continuationCandidate?.runRoot
      const legacyMigration = Boolean(trustedSourceRunRoot && continuationReceipt.action === 'complete')
      let plan
      if (legacyMigration) {
        const ordinary = await thesisPlanForRequest(ticker, undefined, reuse, undefined, selection)
        plan = await legacySingleRunMigrationPlan(ordinary, trustedSourceRunRoot!)
        if (!plan) {
          return reply.code(409).send({
            error: 'This old run cannot be migrated safely. Start a new Full run; nothing was started.',
            code: 'legacy_migration_unavailable',
          })
        }
      } else {
        plan = await thesisPlanForRequest(ticker, undefined, reuse, undefined, selection,
          trustedSourceRunRoot ? { continuationRunRoot: trustedSourceRunRoot } : undefined)
      }
      if (!continuationPlanReceiptMatches(continuationReceipt, plan.continuationReceipt)) {
        return reply.code(409).send({
          error: 'The reviewed continuation plan changed. Refresh and review it again; no run was started.',
          code: 'plan_changed',
        })
      }
      if (plan.complete) return reply.code(409).send({ error: 'this run already has a final thesis', code: 'already_complete', path: plan.finalReportPath })

      const freshFull = !trustedSourceRunRoot && plan.reuse.length === 0
      // An already-reviewed fresh Full owns a durable exact transaction before provider availability is
      // allowed to become transient. Continue/mixed carry requests retain the immediate error path; they
      // must never be silently converted into a current-plan Full retry.
      if (providerPrecheckError && !freshFull) {
        return reply.code(providerPrecheckError?.statusCode || 503).send({
          error: providerPrecheckError?.message || 'engine CLI unavailable', code: providerPrecheckError?.code,
        })
      }

      const allowed = new Set(plan.reusable)
      const bad = reuse.filter((m) => !allowed.has(m))
      if (bad.length) return reply.code(400).send({ error: `cannot reuse a module that never finished: ${bad.join(', ')}`, code: 'unreusable' })

      // When NOTHING is reused this is a bit-for-bit full run — same payable orbs and same publication scope.
      // The "it's already an explicit reviewed click" argument only justifies dropping the typed-ticker guard
      // when the run is genuinely smaller than a full one. So the guard comes back exactly when the run is a full
      // one, and the panel routes that case to the normal full-run confirm dialog.
      if (!sourceRunRoot && plan.reuse.length === 0 && confirmTicker !== ticker) {
        return reply.code(412).send({ error: 'nothing is being reused — this is a full run and needs typed confirmation', code: 'needs_typed_confirm' })
      }

      if (providerDeployPending(STATE_DIR)) {
        // The durable update queue supports the two user-level actions whose scope is unambiguous here:
        // Continue one exact saved root, or a separately typed full run. A general multi-root completion
        // request remains review-bound and retries after the update rather than being renamed as either.
        const action = sourceRunRoot && !legacyMigration ? 'continue' : plan.reuse.length === 0 ? 'full' : null
        if (!action) {
          return reply.code(503).send({
            error: 'The engine is updating. This completion plan was not queued because it is neither one exact saved run nor a full run.',
            code: 'deployment_in_progress',
          })
        }
        const requestedDeployCommit = pendingDeployCommit(providerDeployIntentPath(STATE_DIR))
        if (!requestedDeployCommit) {
          return reply.code(503).send({ error: 'The update identity could not be verified. Nothing was queued or started.', code: 'deployment_identity_unavailable' })
        }
        const queued = enqueuePendingAdmission({
          requestId, user, userVia, ticker, action,
          ...(sourceRunRoot ? { sourceRunRoot } : {}),
          provider, model, reasoningLevel, expectedProfileKey,
          reuse: plan.reuse,
          originalPlan: plan.continuationReceipt,
          requestedDeployCommit,
        })
        if (queued.kind === 'conflict') {
          return reply.code(409).send({ error: 'This request id belongs to a different waiting launch.', code: 'request_reused' })
        }
        if (queued.record.status === 'cancelled') {
          return reply.code(409).send({ error: 'This waiting request was cancelled. Start a new request if you still want to run it.', code: 'request_cancelled' })
        }
        return reply.code(202).send({
          queued: true,
          requestId,
          status: queued.record.status,
          ticker,
          action,
          sourceRunRoot: queued.record.sourceRunRoot,
          provider,
          expectedProfileKey,
        })
      }

      const claim = await claimRunPlanRequest(requestIntent)
      if (claim.kind === 'conflict') {
        return reply.code(409).send({ error: 'This request id belongs to a different reviewed plan.', code: 'request_reused' })
      }
      if (claim.kind === 'replay') {
        return claim.record.response
          ? claim.record.response
          : reply.code(409).send({ error: 'This reviewed request has already started.', code: 'request_in_progress' })
      }
      if (claim.kind === 'in_progress') {
        return reply.code(409).send({ error: 'This reviewed request is already being admitted.', code: 'request_in_progress' })
      }

      let transaction
      try {
        transaction = await prepareRunPlanTransaction(requestId, ticker, plan, {
          onStarted: async () => { await markRunPlanStarted(requestId) },
          onRolledBack: async (reason) => { await markRunPlanFailedBeforeStart(requestId, reason) },
        })
      } catch (e: any) {
        try { await markRunPlanFailedBeforeStart(requestId, String(e?.message || e)) } catch {}
        return reply.code(500).send({ error: `could not prepare existing work safely: ${e?.message || e}` })
      }

      const retryAuthority: PreSpendRetryAuthority | undefined = freshFull
        ? (() => {
            const resolved = getProviderAdapter(provider).resolveProfile({
              model, reasoningLevel, profileKey: expectedProfileKey,
            })
            return {
              reason: 'engine_restarted_before_spend',
              recoveryRequestId: randomUUID(),
              provider: resolved.provider,
              model: resolved.model,
              reasoningLevel: resolved.reasoningLevel ?? null,
              profileKey: resolved.profileKey,
              executionProfile: resolved.executionProfile,
              localAttempts: 0,
              notBeforeMs: Date.now(),
            }
          })()
        : undefined

      try {
        const out = trustedSourceRunRoot && !legacyMigration
          ? await continueExactSavedRun({
              swarm: 'research', subject: ticker, runRoot: trustedSourceRunRoot, kind: 'full',
              provider, model, reasoningLevel, expectedProfileKey, user, userVia,
              preparedRunPlanTransaction: transaction,
            })
          : await launch({
              kind: 'full', ticker, provider, model, reasoningLevel, expectedProfileKey, user, userVia,
              preparedRunPlanTransaction: transaction,
              ...(retryAuthority ? { preSpendRetryAuthority: retryAuthority } : {}),
            })
        const response = {
          ...out,
          requestId,
          planFingerprint: plan.continuationReceipt.fingerprint,
          carried: transaction.preparation.carried,
          reused: plan.reuse,
          willRun: plan.run,
          preparedDoneOrbKeys: transaction.preparation.doneOrbKeys,
          ranClean: transaction.preparation.ranClean,
          ...(legacyMigration ? { migratedFromRunRoot: trustedSourceRunRoot } : {}),
        }
        await markRunPlanAdmitted(requestId, out.runId, response)
        return response
      } catch (e: any) {
        if (e?.preSpendRetryDeferred === true && e?.preSpendRetryRequestId === requestId) {
          return reply.code(202).send({
            queued: true,
            requestId,
            status: 'waiting_pre_spend_retry',
            ticker,
            action: 'full',
            provider,
            expectedProfileKey,
          })
        }
        try { await transaction.rollbackIfUnstarted(String(e?.message || e)) } catch {}
        const body = e?.body && typeof e.body === 'object' ? e.body : null
        return reply.code(e?.statusCode || 500).send({ error: e?.message || 'launch failed', ...(body || {}) })
      }
    })
  } catch (e: any) {
    if (e instanceof SubjectBusyError) {
      return reply.code(409).send({ error: `Another completion request for ${ticker} is already in progress. Wait for it to finish before retrying.`, code: 'subject_busy' })
    }
    throw e
  }
})

let pendingAdmissionDrainRunning = false
let pendingAdmissionTimer: ReturnType<typeof setInterval> | null = null

function pendingAdmissionHeaders(record: PendingAdmissionRecord): Record<string, string> {
  return {
    'content-type': 'application/json',
    ...(record.userVia === 'cf-access' ? { 'cf-access-authenticated-user-email': record.user } : {}),
  }
}

async function drainOnePendingAdmission(record: PendingAdmissionRecord): Promise<void> {
  if (record.status === 'cancelled' || record.status === 'started' || record.status === 'needs_attention') return
  if (providerDeployPending(STATE_DIR)) {
    if (record.status !== 'waiting_for_update') markPendingAdmissionWaiting(record.requestId)
    return
  }
  const failedDeploy = deploymentFailedAfter(record.createdAt)
  if (failedDeploy) {
    markPendingAdmissionNeedsAttention(record.requestId,
      'The reviewed update failed health checks and production stayed on its last healthy version. This request was not started.')
    return
  }
  if (!await deploymentSucceededAfter(record.createdAt, record.requestedDeployCommit)) {
    if (record.status !== 'waiting_for_update') {
      markPendingAdmissionWaiting(record.requestId, 'Waiting for the deployer’s healthy release receipt.')
    }
    return
  }

  // Already-paid exact recovery owns this subject ahead of queued new work. Keep the user's pending intent
  // cancellable/waiting until that protected chain is terminal; never let a post-update drain consume the
  // same root or capacity first after a restart.
  if (await protectedResearchRecoveryOwnsSubject(record.ticker)) {
    markPendingAdmissionWaiting(record.requestId,
      'Finishing the exact run that already started. This waiting request will be checked again afterwards.')
    return
  }

  // Reconcile an ACK that may have landed just before a process restart. A started request is never retried,
  // even when the final HTTP response was lost; an admitted response can be projected back into Activity.
  const request = await readRunPlanRequest(record.requestId)
  if ((request?.status === 'admitted' || request?.status === 'started') && request.response) {
    markPendingAdmissionStarted(record.requestId, request.runId, request.response)
    return
  }
  if (request?.status === 'started') {
    markPendingAdmissionNeedsAttention(record.requestId, 'The provider child started, but its launch response was interrupted. Check Activity; this request will not retry.')
    return
  }
  if (request?.status === 'claimed') {
    markPendingAdmissionNeedsAttention(record.requestId, 'Admission was interrupted before its durable outcome could be proven. It will not retry automatically.')
    return
  }

  // This synchronous transition is the cancellation cut-off. Once Activity says "Starting after update",
  // Cancel must fail; before it, Cancel wins and this stale drain snapshot exits without resurrecting it.
  const admitting = markPendingAdmissionAdmitting(record.requestId)
  if (admitting.status !== 'admitting') return

  const fields = new URLSearchParams({
    ticker: record.ticker,
    swarm: RESEARCH_SWARM_ID,
    provider: record.provider,
  })
  if (record.model) fields.set('model', record.model)
  if (record.reasoningLevel) fields.set('reasoningLevel', record.reasoningLevel)
  if (record.expectedProfileKey) fields.set('expectedProfileKey', record.expectedProfileKey)
  if (record.action === 'continue') fields.set('runRoot', record.sourceRunRoot!)
  else fields.set('reuse', '') // a separately typed full run may never inherit newly reusable work

  const plannedResponse = await app.inject({ method: 'GET', url: `/api/thesis-plan?${fields.toString()}`, headers: pendingAdmissionHeaders(record) })
  const planned = (() => { try { return plannedResponse.json() as any } catch { return {} } })()
  if (plannedResponse.statusCode !== 200) {
    const code = String(planned?.code || '')
    if (code === 'deployment_in_progress') markPendingAdmissionWaiting(record.requestId, planned?.error)
    else markPendingAdmissionNeedsAttention(record.requestId, planned?.error || 'The saved plan could not be rebuilt after the update.')
    return
  }
  const receipt = planned?.continuationReceipt
  if (!pendingReceiptMatchesIntent(record, receipt, planned.complete === true)) {
    markPendingAdmissionNeedsAttention(record.requestId,
      record.action === 'continue'
        ? 'The exact saved run is completed, sealed, or no longer matches the reviewed continuation. Nothing was started.'
        : 'The full-run plan changed shape after the update. Nothing was started.')
    return
  }

  const difference = pendingPlanDifference(record.originalPlan, receipt)
  markPendingAdmissionAdmitting(record.requestId, difference)
  if (!pendingPlanMayAutoStart(record.action, difference)) {
    markPendingAdmissionNeedsAttention(record.requestId,
      `The update added ${difference.addedPayableOrbKeys.length} paid item${difference.addedPayableOrbKeys.length === 1 ? '' : 's'} to this saved run. Nothing was started; review the updated Continue plan first.`)
    return
  }
  // A second reviewed deployment can publish writer intent after the planning GET. Do not send the old
  // receipt into the route and let its durable enqueue boundary collide with this request id; leave this
  // exact user intent waiting for the newest healthy release, then rebuild it once more.
  if (providerDeployPending(STATE_DIR)) {
    markPendingAdmissionWaiting(record.requestId, 'A newer reviewed update is now waiting. This request remains queued.')
    return
  }
  const postBody = {
    ticker: record.ticker,
    reuse: Array.isArray(planned.reuse) ? planned.reuse : [],
    swarm: RESEARCH_SWARM_ID,
    requestId: record.requestId,
    continuationReceipt: receipt,
    ...(record.action === 'continue' ? { sourceRunRoot: record.sourceRunRoot } : { confirmTicker: record.ticker }),
    provider: record.provider,
    ...(record.model ? { model: record.model } : {}),
    ...(record.reasoningLevel ? { reasoningLevel: record.reasoningLevel } : {}),
    ...(record.expectedProfileKey ? { expectedProfileKey: record.expectedProfileKey } : {}),
  }
  const admittedResponse = await app.inject({
    method: 'POST', url: '/api/thesis-plan/run', headers: pendingAdmissionHeaders(record), payload: postBody,
  })
  const admitted = (() => { try { return admittedResponse.json() as any } catch { return {} } })()
  if (admittedResponse.statusCode === 202 || admitted?.code === 'deployment_in_progress'
      || (admitted?.code === 'request_reused' && providerDeployPending(STATE_DIR))) {
    markPendingAdmissionWaiting(record.requestId, 'A newer reviewed update is now waiting. This request remains queued.')
    return
  }
  if (admittedResponse.statusCode >= 200 && admittedResponse.statusCode < 300) {
    markPendingAdmissionStarted(record.requestId, typeof admitted.runId === 'string' && admitted.runId ? admitted.runId : undefined, admitted)
    return
  }
  const code = String(admitted?.code || '')
  if (code === 'request_in_progress') {
    markPendingAdmissionNeedsAttention(record.requestId, 'Admission may already have started. Check Activity; this request will not retry.')
    return
  }
  markPendingAdmissionNeedsAttention(record.requestId,
    admitted?.error || 'The post-update admission failed before a provider child could be proven started.')
}

async function drainPendingAdmissionsOnce(): Promise<void> {
  if (pendingAdmissionDrainRunning || providerDeployPending(STATE_DIR)) return
  pendingAdmissionDrainRunning = true
  try {
    // Oldest first makes two user clicks deterministic. Subject locking and the ordinary launcher capacity
    // checks remain authoritative; a refusal becomes Needs attention rather than silently reordering spend.
    for (const record of listPendingAdmissions()) {
      try { await drainOnePendingAdmission(record) }
      catch (error: any) {
        try { markPendingAdmissionNeedsAttention(record.requestId, error?.message || 'could not admit the waiting request') } catch {}
      }
      if (providerDeployPending(STATE_DIR)) break
    }
  } finally { pendingAdmissionDrainRunning = false }
}

function startPendingAdmissionDrain(): void {
  if (pendingAdmissionTimer) return
  void drainPendingAdmissionsOnce()
  pendingAdmissionTimer = setInterval(() => { void drainPendingAdmissionsOnce() }, 2_000)
  pendingAdmissionTimer.unref?.()
}

const MODULE_RESUME_PUBLISH_TIMEOUT_MS = 20 * 60_000

/** Exact path proof, not a HEAD-ancestry shortcut. A shared production checkout can have an unrelated local
 * data commit while these module paths already match `origin/main`; conversely, a prior failed checkpoint can
 * leave these paths clean at local HEAD but absent remotely. Compare the actual tracked tree and reject every
 * untracked/ignored byte below the published module directories. */
async function moduleResumeCheckpointMatchesOrigin(pathspecs: string[]): Promise<boolean> {
  try {
    const fetch = await execa('git', ['fetch', '-q', 'origin', 'main'], {
      cwd: REPO_ROOT, timeout: MODULE_RESUME_PUBLISH_TIMEOUT_MS, reject: false,
    })
    if (fetch.exitCode !== 0) return false
    const diff = await execa('git', ['diff', '--quiet', 'origin/main', '--', ...pathspecs], {
      cwd: REPO_ROOT, timeout: 30_000, reject: false,
    })
    if (diff.exitCode !== 0) return false
    const untracked = await execa('git', ['ls-files', '--others', '--exclude-standard', '--', ...pathspecs], {
      cwd: REPO_ROOT, timeout: 30_000, reject: false,
    })
    if (untracked.exitCode !== 0 || untracked.stdout.trim()) return false
    const ignored = await execa('git', ['ls-files', '--others', '--ignored', '--exclude-standard', '--', ...pathspecs], {
      cwd: REPO_ROOT, timeout: 30_000, reject: false,
    })
    return ignored.exitCode === 0 && !ignored.stdout.trim()
  } catch {
    return false
  }
}

/** A prior click may have committed the checkpoint locally and then lost its push race (exit 4). Retry only
 * the helper-produced commit (or a successful NOOP's clean HEAD) after proving the requested pathspec bytes
 * exactly match that revision. A lock/pre-commit failure has no receipt and can never push unrelated HEAD. */
async function ensureModuleResumeCheckpointPublished(
  script: string,
  pathspecs: string[],
  helperAttempt: CommitRunAttempt | null | undefined,
): Promise<boolean> {
  if (await moduleResumeCheckpointMatchesOrigin(pathspecs)) return true
  // A validation server may commit outputs locally by design, but it has no authority to publish them.
  // Never let the retry helper turn ENGINE_NO_PUSH into a remote write; fail before paid analysis instead.
  if (process.env.ENGINE_NO_PUSH === '1') return false
  const retried = await retryBoundModulePublication({
    repoRoot: REPO_ROOT,
    script,
    pathspecs,
    helperAttempt,
    timeoutMs: MODULE_RESUME_PUBLISH_TIMEOUT_MS,
  })
  return retried && moduleResumeCheckpointMatchesOrigin(pathspecs)
}

/** Publish the exact resume checkpoint BEFORE the paid child starts: the target module's truthful partial
 *  (when one exists, including deletions from a clean stale rerun) plus every reused ancestor it will read.
 *  `commit-run.sh` serializes/rebases/pushes only these pathspecs. An earlier failed attempt's ancestor is
 *  included again and becomes a harmless NOOP if already published, so retries cannot strand dirty inputs. */
async function publishModuleResumeCheckpoint(
  ticker: string,
  targetRunRoot: string,
  module: string,
  reusedAncestorModules: string[],
): Promise<{ ok: true; paths: string[] } | { ok: false; error: string }> {
  const normalizedRoot = path.posix.normalize(targetRunRoot)
  if (normalizedRoot !== targetRunRoot || !normalizedRoot.startsWith(`analyses/${ticker}_`)
      || normalizedRoot.split('/').length !== 2) {
    return { ok: false, error: 'unsafe target run root' }
  }
  const modules = [...new Set([...reusedAncestorModules, module])].sort()
  if (modules.some((name) => !MODULE_RE.test(name) || path.posix.basename(name) !== name)) {
    return { ok: false, error: 'unsafe module path' }
  }

  const rootAbs = path.join(REPO_ROOT, normalizedRoot)
  let rootReal: string | null = null
  if (fs.existsSync(rootAbs)) {
    try {
      const stat = fs.lstatSync(rootAbs)
      if (!stat.isDirectory() || stat.isSymbolicLink()) return { ok: false, error: 'unsafe target run root' }
      rootReal = resolveInsideAnalyses(rootAbs)
    } catch {
      return { ok: false, error: 'unsafe target run root' }
    }
  }
  const pathspecs: string[] = []
  for (const name of modules) {
    const rel = `${normalizedRoot}/${name}`
    const abs = path.join(REPO_ROOT, rel)
    if (fs.existsSync(abs)) {
      try {
        const stat = fs.lstatSync(abs)
        const real = resolveInsideAnalyses(abs)
        if (!rootReal || !stat.isDirectory() || stat.isSymbolicLink() || path.dirname(real) !== rootReal) {
          return { ok: false, error: `unsafe staged module ${name}` }
        }
      } catch {
        return { ok: false, error: `unsafe staged module ${name}` }
      }
      pathspecs.push(rel)
      continue
    }
    // A stale rerun can deliberately delete a previously-checkpointed partial. Include that absent path only
    // when Git proves it was tracked; a genuinely missing, never-run module must not make `git add` fail.
    try {
      const tracked = await execa('git', ['ls-files', '--', rel], { cwd: REPO_ROOT, timeout: 10_000, reject: false })
      if (tracked.exitCode !== 0) return { ok: false, error: 'could not inspect staged module paths' }
      if (tracked.stdout.trim()) {
        if (!rootReal) return { ok: false, error: 'tracked module path lost its run root' }
        pathspecs.push(rel)
      }
    } catch {
      return { ok: false, error: 'could not inspect staged module paths' }
    }
  }
  if (!pathspecs.length) return { ok: true, paths: [] }

  const script = path.join(REPO_ROOT, 'scripts', 'commit-run.sh')
  if (!fs.existsSync(script)) return { ok: false, error: 'commit-run.sh not found' }
  let helperAttempt: CommitRunAttempt | null = null
  try {
    helperAttempt = await execa('bash', [
      script,
      `Module resume checkpoint: ${ticker} ${module} ${path.posix.basename(normalizedRoot)}`,
      '--',
      ...pathspecs,
    ], { cwd: REPO_ROOT, timeout: MODULE_RESUME_PUBLISH_TIMEOUT_MS, reject: false })
    if (helperAttempt.exitCode !== 0) {
      throw Object.assign(new Error('commit-run checkpoint failed'), { helperAttempt })
    }
    if (!await ensureModuleResumeCheckpointPublished(script, pathspecs, helperAttempt)) {
      return { ok: false, error: 'checkpoint paths are not published on origin/main' }
    }
    return { ok: true, paths: pathspecs }
  } catch (e: any) {
    // commit-run can create the exact local commit and then lose its push/rebase race (exit 4). Its emitted
    // SHA plus the current path proof authorize one retry. Failures before commit emit no receipt, so the
    // unrelated current HEAD is never used. ENGINE_NO_PUSH remains fail-closed inside ensure().
    helperAttempt ??= (e?.helperAttempt || e) as CommitRunAttempt
    if (await ensureModuleResumeCheckpointPublished(script, pathspecs, helperAttempt)) {
      return { ok: true, paths: pathspecs }
    }
    return { ok: false, error: String(e?.stderr || e?.message || e).slice(0, 400) }
  }
}

// Retry ONLY the terminal Git publication of a completed exact module. This endpoint has no CLI probe,
// no launch() call and no model arguments: the durable marker is both the authority and the exact byte receipt.
app.post('/api/thesis-plan/module/publish', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  const parsed = ThesisPlanModulePublishBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const { ticker, swarm, module, targetRunRoot, expectedFingerprint } = parsed.data
  if (!isValidTicker(ticker)) return reply.code(400).send({ error: 'bad ticker' })
  if (swarm !== RESEARCH_SWARM_ID) return reply.code(400).send({ error: 'publication retry is research-only', code: 'swarm_unsupported' })
  // Unlike a paid launch, recovery authority comes from the durable byte receipt, not current data-pool
  // membership. A Drive/data-folder outage or rename after the completed run must not strand its publication.
  if (isReservedDataFolder(ticker)) return reply.code(400).send({ error: `unknown ticker ${ticker}` })
  if (graphForTicker(ticker).modules.find((candidate) => candidate.name === module)?.exactResume !== true) {
    return reply.code(400).send({ error: `unknown exact module ${module}`, code: 'unknown_module' })
  }

  try {
    return await withSubjectLock(subjectMutationLockKey(RESEARCH_SWARM_ID, ticker), async () => {
      if (subjectChainActive(ticker, RESEARCH_SWARM_ID)) {
        return reply.code(409).send({ error: `A full analysis is already running on ${ticker}. Let it finish (or stop it) before retrying publication.`, code: 'subject_busy' })
      }
      // The route mutex covers cockpit requests; this lease also blocks internal supervisor launches.
      // Acquire before the busy check so check-and-claim is one synchronous boundary.
      const releasePublication = acquireModulePublicationLease(ticker)
      if (!releasePublication) {
        return reply.code(409).send({ error: 'This module is already being published.', code: 'subject_busy' })
      }
      try {
        reapDeadSubjectRuns(ticker, RESEARCH_SWARM_ID)
        const busy = listRuns().some((run) => (run.swarmId || RESEARCH_SWARM_ID) === RESEARCH_SWARM_ID
          && run.subjectId === ticker && (IN_FLIGHT_STATUSES.has(run.status) || run.endedAt === undefined))
        if (busy) {
          return reply.code(409).send({
            error: `A run is already in flight on ${ticker}. Let it finish before retrying publication.`,
            code: 'subject_busy',
          })
        }

        const marker = readPendingModulePublication(ticker, module)
        if (!marker) {
          return reply.code(409).send({
            error: 'There is no saved publication retry for this module. Refresh its current status.',
            code: 'no_publication_pending',
          })
        }
        if (marker.targetRunRoot !== targetRunRoot || marker.fingerprint !== expectedFingerprint) {
          return reply.code(409).send({
            error: 'The saved publication receipt changed. Refresh before retrying.',
            code: 'module_publication_changed',
          })
        }
        const before = captureCompletedModuleFingerprint(ticker, module, targetRunRoot)
        if (before !== expectedFingerprint) {
          return reply.code(409).send({
            error: 'The completed module files changed after the failed publication. They were not published.',
            code: 'module_publication_changed',
          })
        }

        const publication = await publishModuleResumeCheckpoint(ticker, targetRunRoot, module, [])
        if (!publication.ok) {
          console.error(`[module-publish-retry] could not publish ${ticker}/${module}: ${publication.error}`)
          return reply.code(500).send({
            error: 'The completed module is still saved locally, but it could not be published. Retry later.',
            code: 'module_publish_failed',
          })
        }
        const after = captureCompletedModuleFingerprint(ticker, module, targetRunRoot)
        if (after !== expectedFingerprint) {
          return reply.code(409).send({
            error: 'The completed module files changed during publication. The retry receipt was kept.',
            code: 'module_publication_changed',
          })
        }
        if (!clearPendingModulePublication(ticker, module, targetRunRoot, expectedFingerprint)) {
          return reply.code(500).send({
            error: 'Publication succeeded, but its retry receipt could not be cleared safely. Retry once more.',
            code: 'module_publish_marker_failed',
          })
        }
        return { published: true as const }
      } finally {
        releasePublication()
      }
    })
  } catch (e: any) {
    if (e instanceof SubjectBusyError) {
      return reply.code(409).send({
        error: `Another completion request for ${ticker} is already in progress. Wait for it to finish before retrying publication.`,
        code: 'subject_busy',
      })
    }
    throw e
  }
})

// Run ONE module of a completion plan (the RUN pill on a Run row), resuming from the orbs already on disk.
// Same guard sequence and same subject lock as /run above — a pill click and a "Complete the thesis" click
// must serialize, or two could carry into the same target root at once. `prepareModuleResume` carries the
// module's reused ancestors + its own finished orbs into today's root, then the ordinary `module` launch
// runs only the remainder (Step 4A skips the orbs on disk). A stale partial is run clean (§11).
app.post('/api/thesis-plan/module', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  const parsed = ThesisPlanModuleBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const {
    ticker, module, reuse, swarm, provider, model, reasoningLevel, expectedProfileKey,
    expectedWillRun, expectedDoneOrbKeys, expectedTargetRunRoot, poolFiles, poolNewestMs, sourceRunRoot,
    requestId, continuationReceipt,
  } = parsed.data
  const providerSelection: RunProviderSelection = { provider, model, reasoningLevel, expectedProfileKey }
  const { user, userVia } = identify(req)
  if (!isValidTicker(ticker)) return reply.code(400).send({ error: 'bad ticker' })
  // Data-pool allow-list — `launch()` does not re-check it for a research `module` kind (route-enforced only).
  if (isReservedDataFolder(ticker) || (!sourceRunRoot && !fs.existsSync(path.join(DATA_DIR, ticker)))) {
    return reply.code(400).send({ error: `unknown ticker ${ticker}` })
  }
  if (swarm !== RESEARCH_SWARM_ID) {
    return reply.code(400).send({ error: `Running a single module of a ${swarm ?? 'non-research'} dossier from here isn’t supported yet — run its pipeline from the swarm’s own controls.`, code: 'swarm_unsupported' })
  }

  try {
    return await withSubjectLock(subjectMutationLockKey(RESEARCH_SWARM_ID, ticker), async () => {
      if (subjectChainActive(ticker, RESEARCH_SWARM_ID)) {
        return reply.code(409).send({ error: `A full analysis is already running on ${ticker}. Let it finish (or stop it) before running a module.`, code: 'subject_busy' })
      }
      // Match launch()'s self-healing admission boundary. A child whose process died but whose close event was
      // lost must not pin this scoped route forever; gate-paused/live runs remain untouched and still block.
      reapDeadSubjectRuns(ticker, RESEARCH_SWARM_ID)
      const busy = listRuns().some((r) => (r.swarmId || RESEARCH_SWARM_ID) === RESEARCH_SWARM_ID
        && r.subjectId === ticker && (IN_FLIGHT_STATUSES.has(r.status) || r.endedAt === undefined))
      if (busy) return reply.code(409).send({ error: `A run is already in flight on ${ticker}. Let it finish (or stop it) before running a module.`, code: 'subject_busy' })

      // Exact-resume commands can knowingly read a mechanically valid older synthesis even when a newer
      // partial attempt means that upstream is not reusable as a WHOLE full-thesis module. The module-scoped
      // planner alone selects those declared inputs; the browser cannot nominate arbitrary folders.
      const graphModule = graphForTicker(ticker).modules.find((m) => m.name === module)
      const exactResume = graphModule?.exactResume === true

      const continuationCandidate = sourceRunRoot ? exactContinuationCandidate({
        swarm: 'research', subject: ticker, runRoot: sourceRunRoot, kind: 'module', module,
      }, listResumableRuns()) : null
      if (sourceRunRoot && !continuationCandidate) {
        return reply.code(409).send({ error: 'The saved module changed. Refresh before continuing; no run was started.', code: 'saved_run_changed' })
      }
      const trustedSourceRunRoot = continuationCandidate?.runRoot

      // ONE snapshot decides everything: complete-check, runnability, blockedBy, and what gets carried.
      let plan = await thesisPlanForRequest(ticker, undefined, exactResume ? undefined : reuse, exactResume ? module : undefined,
        providerSelection, trustedSourceRunRoot ? { continuationRunRoot: trustedSourceRunRoot } : undefined)
      if (trustedSourceRunRoot) {
        if (!exactResume) {
          return reply.code(409).send({
            error: 'This saved module does not support exact frozen continuation. Complete the old full run instead.',
            code: 'exact_module_unsupported',
          })
        }
        if (!requestId || !continuationReceipt
            || !continuationPlanReceiptMatches(continuationReceipt, plan.continuationReceipt)
            || plan.continuationReceipt.action !== 'continue'
            || plan.continuationReceipt.targetRunRoot !== trustedSourceRunRoot) {
          return reply.code(409).send({
            error: 'The reviewed saved-module plan changed. Refresh and review it again; nothing was started.',
            code: 'plan_changed',
          })
        }
      }
      if (plan.targetRunRoot !== expectedTargetRunRoot) {
        return reply.code(409).send({ error: 'The target analysis date changed while this module was being prepared. Check the updated scope and click again.', code: 'module_scope_changed' })
      }
      if (plan.dataPool.files !== poolFiles || plan.dataPool.newestMs !== poolNewestMs) {
        return reply.code(409).send({ error: 'The data pool changed while this module was being prepared. Check the updated scope and click again.', code: 'module_scope_changed' })
      }
      // A final thesis seals today's research folder. Repairing a module inside it would make the module and
      // headline call disagree, and launch() rejects sealed roots too. Fail before staging mutates anything.
      if (plan.complete || isSealedResearchRun(plan.targetRunRoot)) {
        return reply.code(409).send({ error: 'This call is already sealed. Start a new analysis version to refresh this module.', code: 'sealed_run', path: plan.finalReportPath })
      }

      if (exactResume) {
        const expectedInputs = [...(plan.exactModuleScope?.savedInputs ?? [])].sort()
        const requestedInputs = [...new Set(reuse)].sort()
        if (plan.exactModuleScope?.module !== module
            || requestedInputs.length !== reuse.length
            || requestedInputs.length !== expectedInputs.length
            || requestedInputs.some((name, index) => name !== expectedInputs[index])) {
          return reply.code(409).send({ error: 'The saved module-input scope changed. Refresh and confirm again; no run was started.', code: 'module_scope_changed' })
        }
      } else {
        const allowed = new Set(plan.reusable)
        const bad = reuse.filter((m) => !allowed.has(m))
        if (bad.length) return reply.code(400).send({ error: `cannot reuse a module that never finished: ${bad.join(', ')}`, code: 'unreusable' })
      }
      const reviewedExactInputs = exactResume
        ? [...(plan.exactModuleScope?.savedInputs ?? [])].sort()
        : []

      const entry = plan.modules.find((m) => m.module === module)
      if (!entry) return reply.code(400).send({ error: `unknown module ${module}`, code: 'unknown_module' })
      // Exact paid-scope behavior is a self-declared module capability. Commands without `exact_resume: true`
      // retain the established generic completion-panel resume path; they do not receive an immutable-root
      // promise their prompt has not implemented.
      const exactArtifactScopeFor = (doneOrbKeys: string[]) => {
        if (!exactResume) return null
        const currentModule = graphForTicker(ticker).modules.find((m) => m.name === module)
        if (!currentModule || currentModule.exactResume !== true) return null
        const done = new Set(doneOrbKeys)
        const agents = Object.values(currentModule.layers).flat()
        return {
          writableOrbs: agents
            .filter((agent) => !agent.isSynthesis && !done.has(agent.key))
            .map((agent) => agent.key.split('/').at(-1)!)
            .sort(),
          synthesisOrbs: agents
            .filter((agent) => agent.isSynthesis)
            .map((agent) => agent.key.split('/').at(-1)!)
            .sort(),
        }
      }
      const expectedDone = [...expectedDoneOrbKeys].sort()
      const actualDone = [...entry.doneOrbKeys].sort()
      const reviewedExactArtifacts = exactArtifactScopeFor(actualDone)
      const exactScopeChanged = expectedDone.length !== actualDone.length
        || expectedDone.some((key, i) => key !== actualDone[i])
      const invalidExactArtifactScope = exactResume && (!reviewedExactArtifacts
        || reviewedExactArtifacts.synthesisOrbs.length < 1
        || reviewedExactArtifacts.writableOrbs.length + reviewedExactArtifacts.synthesisOrbs.length !== entry.willRunAgents)
      if (entry.willRunAgents !== expectedWillRun || exactScopeChanged || invalidExactArtifactScope) {
        return reply.code(409).send({ error: 'The unfinished-orb scope changed while this module was being prepared. Check the updated scope and click again.', code: 'module_scope_changed', willRun: entry.willRunAgents })
      }
      // Only a module that will actually run can be launched here — a reused one has nothing to do, and its
      // launch would either no-op or, worse, re-run work the panel promised to keep.
      if (!plan.run.includes(module)) return reply.code(409).send({ error: `${module} is already finished or reused in this run — nothing to run.`, code: 'not_runnable' })
      // Its upstream must be reused-and-present, not itself waiting to run: the command reads deps from the
      // target root with no cross-folder fallback for some (valuation ← governance), so a not-yet-run
      // ancestor means a degraded run. The panel keeps such a pill inert; reject here as the server backstop.
      if (entry.blockedBy.length) {
        return reply.code(409).send({ error: `Run ${entry.blockedBy.map((m) => m.replace(/-/g, ' ')).join(', ')} first — ${module.replace(/-/g, ' ')} reads ${entry.blockedBy.length === 1 ? 'it' : 'them'}.`, code: 'upstream_incomplete', missing: entry.blockedBy })
      }

      let expectedStagedFingerprint: string | null = null
      let expectedAncestorModules: string[] = []
      const readCurrentScope = () => {
        try {
          const current = thesisPlanForScopeGuard(ticker, undefined, exactResume ? undefined : reuse, exactResume ? module : undefined,
            providerSelection, trustedSourceRunRoot ? { continuationRunRoot: trustedSourceRunRoot } : undefined)
          const currentEntry = current.modules.find((m) => m.module === module)
          const currentDone = [...(currentEntry?.doneOrbKeys ?? [])].sort()
          const currentExactArtifacts = exactArtifactScopeFor(currentDone)
          const currentExactInputs = [...(current.exactModuleScope?.savedInputs ?? [])].sort()
          const exactInputsStillMatch = !exactResume || (current.exactModuleScope?.module === module
            && currentExactInputs.length === reviewedExactInputs.length
            && currentExactInputs.every((name, index) => name === reviewedExactInputs[index]))
          const exactArtifactsStillMatch = !exactResume || (!!currentExactArtifacts && !!reviewedExactArtifacts
            && currentExactArtifacts.writableOrbs.join(',') === reviewedExactArtifacts.writableOrbs.join(',')
            && currentExactArtifacts.synthesisOrbs.join(',') === reviewedExactArtifacts.synthesisOrbs.join(','))
          const ok = !current.complete
            && !isSealedResearchRun(current.targetRunRoot)
            && current.targetRunRoot === expectedTargetRunRoot
            && current.dataPool.files === poolFiles
            && current.dataPool.newestMs === poolNewestMs
            && !!currentEntry
            && currentEntry.runnable
            && currentEntry.blockedBy.length === 0
            && current.run.includes(module)
            && currentEntry.willRunAgents === expectedWillRun
            && exactInputsStillMatch
            && currentDone.length === expectedDone.length
            && currentDone.every((key, i) => key === expectedDone[i])
            && exactArtifactsStillMatch
          return ok ? { ok: true as const, plan: current } : { ok: false as const }
        } catch {
          return { ok: false as const }
        }
      }
      const moduleScopeGuard = () => {
        const current = readCurrentScope()
        const staged = expectedStagedFingerprint && current.ok
          ? capturePreparedModuleResumeScope(
              ticker, module, expectedTargetRunRoot, expectedDone, expectedAncestorModules,
            )
          : null
        return current.ok && staged?.fingerprint === expectedStagedFingerprint
          ? { ok: true as const }
          : {
            ok: false as const,
            reason: 'module_scope_changed',
            message: 'The unfinished-orb or data-pool scope changed before the engine started. Refresh and try again; no run was started.',
          }
      }

      // Fail before staging or publishing anything. The launcher checks too, but that is intentionally after
      // admission; this route mutates disk first and therefore needs the same executable proof up front.
      try { await assertProviderAvailable(provider) } catch (e: any) {
        return reply.code(e?.statusCode || 503).send({ error: e?.message || 'engine CLI unavailable', code: e?.code })
      }
      // The CLI probe can take seconds on a cold process. Rebuild the exact plan after that await and use THIS
      // snapshot for staging, so data/orbs that changed during the probe can never ride a stale plan.
      const scopeAfterCli = readCurrentScope()
      if (!scopeAfterCli.ok) {
        return reply.code(409).send({ error: 'The unfinished-orb scope changed while the engine was being checked. Refresh and try again; nothing was staged.', code: 'module_scope_changed' })
      }
      plan = scopeAfterCli.plan

      if (trustedSourceRunRoot) {
        // A saved-root module Continue is the same paid admission as a full Continue, only with a narrower
        // mutation/command scope. The shared service recomputes the v2 receipt again under this subject lock,
        // claims the durable request id, prepares a private lineage-only tree, and atomically activates it.
        // It must never enter the legacy live staging/publication path below.
        const exactRequestId = requestId!
        const reviewedReceipt = continuationReceipt!
        let admittedRunId: string | null = null
        const exactPreSpawnGuard = () => readCurrentScope().ok
          ? { ok: true as const }
          : {
              ok: false as const,
              reason: 'module_scope_changed',
              message: 'The exact saved module changed before the engine started. Refresh and review it again; no run was started.',
            }
        const terminalGuard = async () => {
          // launch() early-ACKs, and a tiny/failing child can reach this terminal guard before the shared
          // admission service persists its response and returns the run id to this route. The immutable
          // request id is also the exact one-child chain id, so it is the race-free identity at this boundary.
          const active = (admittedRunId ? getRun(admittedRunId) : undefined)
            ?? listRuns().find((run) => run.chainId === exactRequestId
              && run.runRoot === trustedSourceRunRoot && run.module === module)
          if (active?.publicationCompleted === true
              && active.runRoot === trustedSourceRunRoot
              && active.module === module) return { ok: true as const }
          return {
            ok: false as const,
            reason: 'module_publish_failed',
            message: 'The checks finished, but the trusted supervisor did not verify their module publication. The saved work remains on disk; refresh before trying again.',
          }
        }
        try {
          const admitted = await admitExactSavedRunContinuation({
            swarm: 'research', subject: ticker, runRoot: trustedSourceRunRoot, kind: 'module', module,
            provider, model, reasoningLevel, expectedProfileKey, user, userVia,
            reviewed: {
              requestId: exactRequestId,
              continuationReceipt: reviewedReceipt,
              reuse: [...reuse],
              exactModule: {
                module,
                savedInputs: [...reviewedExactInputs].sort(),
                doneOrbKeys: [...actualDone].sort(),
                writableOrbs: [...reviewedExactArtifacts!.writableOrbs],
                synthesisOrbs: [...reviewedExactArtifacts!.synthesisOrbs],
              },
            },
            launchOptions: {
              deferModuleMemo: true,
              exactModuleResume: true,
              exactModuleInputs: [...reviewedExactInputs],
              exactModuleRunRoot: trustedSourceRunRoot,
              exactModuleWritableOrbs: [...reviewedExactArtifacts!.writableOrbs],
              exactModuleSynthesisOrbs: [...reviewedExactArtifacts!.synthesisOrbs],
              preSpawnGuard: exactPreSpawnGuard,
              terminalGuard,
            },
            prepareTransaction: (id, subject, reviewedPlan, hooks) => prepareRunPlanTransaction(
              id,
              subject,
              reviewedPlan,
              {
                ...hooks,
                prepare: (preparedSubject, preparedPlan, transactionDir) => {
                  const prepared = prepareExactModuleContinuationPrivately(
                    preparedSubject, module, preparedPlan, transactionDir,
                  )
                  // The private sanitizer deliberately removed every ambient root marker. Replace the old
                  // autonomous-full interruption with the durable manual-module policy inside the private
                  // tree. If no paid child starts, transaction rollback restores the original root/marker.
                  fs.writeFileSync(
                    path.join(prepared.stagingRootAbs, '.aborted'),
                    `${JSON.stringify({ reason: 'exact_module_only', module, at: new Date().toISOString() })}\n`,
                    { encoding: 'utf8', mode: 0o600, flag: 'wx' },
                  )
                  return prepared
                },
              },
            ),
          })
          const runId = typeof admitted.response.runId === 'string' ? admitted.response.runId : null
          if (!runId) throw new Error('exact module admission returned no tracked run id')
          admittedRunId = runId
          const doneOrbKeys = Array.isArray(admitted.response.preparedDoneOrbKeys)
            ? admitted.response.preparedDoneOrbKeys.filter((key): key is string =>
                typeof key === 'string' && key.startsWith(`${module}/`)).sort()
            : []
          const active = getRun(runId)
          if (active) {
            for (const key of doneOrbKeys) {
              const agent = active.agents.get(key)
              if (agent) {
                agent.status = 'done'
                agent.outputPath = `${trustedSourceRunRoot}/${key}.md`
              }
            }
          }
          const ranClean = Array.isArray(admitted.response.ranClean)
            && admitted.response.ranClean.includes(module)
          return {
            ...admitted.response,
            module,
            willRun: expectedWillRun,
            doneOrbKeys,
            carried: Array.isArray(admitted.response.carried) ? admitted.response.carried : [],
            resumed: doneOrbKeys.length > 0,
            ranClean,
          }
        } catch (e: any) {
          const body = e?.body && typeof e.body === 'object' ? e.body : null
          return reply.code(e?.statusCode || 500).send({ error: e?.message || 'launch failed', ...(body || {}) })
        }
      }

      let prep
      try {
        prep = prepareModuleResume(ticker, module, undefined, plan)
      } catch (e: any) {
        return reply.code(500).send({ error: `could not stage the module resume: ${e?.message || e}` })
      }

      // Defense in depth at the paid boundary: staging may normalize/copy files, but it must never broaden the
      // server plan the caller reviewed. A staging defect or filesystem race may leave a retryable folder, but
      // it cannot start a differently-scoped engine run.
      const preparedDone = [...prep.doneOrbKeys].sort()
      const preparedScopeChanged = prep.willRunAgents !== expectedWillRun
        || preparedDone.length !== expectedDone.length
        || preparedDone.some((key, i) => key !== expectedDone[i])
      const preparedExactArtifacts = exactArtifactScopeFor(preparedDone)
      let exactLaunchArtifacts: { writableOrbs: string[]; synthesisOrbs: string[] } | undefined
      if (exactResume) {
        if (!preparedExactArtifacts || !reviewedExactArtifacts
            || preparedExactArtifacts.writableOrbs.join(',') !== reviewedExactArtifacts.writableOrbs.join(',')
            || preparedExactArtifacts.synthesisOrbs.join(',') !== reviewedExactArtifacts.synthesisOrbs.join(',')) {
          return reply.code(409).send({ error: 'The staged unfinished-orb scope no longer matches the reviewed plan. Refresh and try again; no run was started.', code: 'module_scope_changed', willRun: prep.willRunAgents })
        }
        exactLaunchArtifacts = preparedExactArtifacts
      }
      if (preparedScopeChanged) {
        return reply.code(409).send({ error: 'The staged unfinished-orb scope no longer matches the reviewed plan. Refresh and try again; no run was started.', code: 'module_scope_changed', willRun: prep.willRunAgents })
      }
      expectedAncestorModules = [...prep.reusedAncestorModules]
      const preparedDiskScope = capturePreparedModuleResumeScope(
        ticker, module, expectedTargetRunRoot, expectedDone, expectedAncestorModules,
      )
      if (!preparedDiskScope) {
        return reply.code(409).send({ error: 'The staged files no longer match the reviewed unfinished-orb scope. Refresh and try again; no run was started.', code: 'module_scope_changed' })
      }
      expectedStagedFingerprint = preparedDiskScope.fingerprint

      // Checkpoint every byte this route staged, plus every reused ancestor the paid module will read. The
      // module command later commits only its own folder; without this awaited publication, carried ancestors
      // stay dirty/local forever. Failure is terminal for this click: do not spend against unpublished inputs.
      const publication = await publishModuleResumeCheckpoint(
        ticker, plan.targetRunRoot, module, prep.reusedAncestorModules,
      )
      if (!publication.ok) {
        console.error(`[module-resume] could not publish ${ticker}/${module} checkpoint: ${publication.error}`)
        return reply.code(500).send({ error: 'The reused inputs could not be saved safely, so no analysis was started. Retry after checking git publication.', code: 'ancestor_publish_failed', carried: prep.carriedAncestors })
      }

      // commit-run.sh can wait/rebase for minutes. Re-read the exact pool + orb identities after that await,
      // then bind the SAME check into launcher's final pre-execa boundary for readiness/buildArgs delays.
      const scopeAfterPublish = moduleScopeGuard()
      if (!scopeAfterPublish.ok) {
        return reply.code(409).send({ error: scopeAfterPublish.message, code: scopeAfterPublish.reason })
      }

      // An exact standalone module is a deliberate scoped action, not permission to revive an older full
      // run. Consume any stale `.interrupted` signal under the subject lock and replace it with the existing
      // restart-safe `.aborted` supervisor policy BEFORE launch admission. A later explicit full launch clears
      // that policy itself. If admission/pre-spawn fails before any paid child, the terminal callback restores
      // the precise prior marker state; success, a paid-child failure, and Stop all keep the scoped pause.
      let supervisorPause: ReturnType<typeof beginExactModuleSupervisorPause> | null = null
      if (exactResume) {
        try {
          supervisorPause = beginExactModuleSupervisorPause(expectedTargetRunRoot, module)
        } catch (e: any) {
          return reply.code(500).send({
            error: `The module was staged, but its automatic full-run resume could not be paused safely: ${e?.message || e}`,
            code: 'module_resume_pause_failed',
          })
        }
      }

      let launchAcknowledged = false
      let admittedRunId: string | null = null
      let earlyTerminalStatus: RunStatus | null = null
      const settleSupervisorPause = (status: RunStatus) => {
        if (!supervisorPause) return
        const paidChildStarted = !!(admittedRunId && getRun(admittedRunId)?.child)
        settleExactModuleSupervisorPause(supervisorPause, status, paidChildStarted)
      }
      const exactOnTerminal = exactResume
        ? (status: RunStatus) => {
            if (!launchAcknowledged) {
              earlyTerminalStatus = status
              return
            }
            settleSupervisorPause(status)
          }
        : undefined

      try {
        // An exact-capable command binds the reviewed graph scope through the paid boundary. It also suppresses
        // the ordinary optional module-memo writer after 99; generic module-plan resumes keep their legacy mode.
        const terminalGuard = exactResume
          ? async () => {
              // The tracked child already queued its exact module path through commit-run.sh. The shared
              // close owner proves the entire process group extinct, stamps provenance, freezes those bytes,
              // and publishes them before invoking this guard. Do not call the pre-launch checkpoint helper
              // here: doing so would create a second un-stamped Git publication after the trusted one.
              const active = admittedRunId ? getRun(admittedRunId) : undefined
              if (active?.publicationCompleted === true
                  && active.runRoot === expectedTargetRunRoot
                  && active.module === module) return { ok: true as const }
              return {
                ok: false as const,
                reason: 'module_publish_failed',
                message: 'The checks finished, but the trusted supervisor did not verify their module publication. The saved work remains on disk; refresh before trying again.',
              }
            }
          : undefined
        const out = await launch({
          kind: 'module', ticker, module, provider, model, reasoningLevel, expectedProfileKey, user, userVia,
          ...(trustedSourceRunRoot ? { runRoot: trustedSourceRunRoot, continuation: true } : {}),
          deferModuleMemo: exactResume,
          exactModuleResume: exactResume,
          exactModuleInputs: exactResume ? prep.reusedAncestorModules : undefined,
          exactModuleRunRoot: exactResume ? expectedTargetRunRoot : undefined,
          exactModuleWritableOrbs: exactLaunchArtifacts?.writableOrbs,
          exactModuleSynthesisOrbs: exactLaunchArtifacts?.synthesisOrbs,
          preSpawnGuard: exactResume ? moduleScopeGuard : undefined,
          terminalGuard,
          onTerminal: exactOnTerminal,
        })
        admittedRunId = out.runId
        launchAcknowledged = true
        if (earlyTerminalStatus) settleSupervisorPause(earlyTerminalStatus)
        // launch() seeds the whole discovered module as queued before it early-acks. Reused specialists are
        // already complete on disk, so correct the registry snapshot before this response lets the client
        // subscribe; reconnects and Activity then keep the same done/queued split as the initial click.
        const active = getRun(out.runId)
        if (active) {
          for (const key of prep.doneOrbKeys) {
            const agent = active.agents.get(key)
            if (agent) {
              agent.status = 'done'
              agent.outputPath = `${plan.targetRunRoot}/${key}.md`
            }
          }
        }
        return { ...out, module, willRun: prep.willRunAgents, doneOrbKeys: prep.doneOrbKeys, carried: prep.carriedAncestors, resumed: Boolean(prep.resumedFrom), ranClean: prep.discardedStaleOrbs }
      } catch (e: any) {
        // No registered run means no terminal callback can restore the prior supervisor policy. Once launch
        // has ACKed, retain the pause conservatively; its own terminal callback owns any pre-paid rollback.
        if (supervisorPause) {
          if (launchAcknowledged) supervisorPause.keep()
          else supervisorPause.rollback()
        }
        // Same honesty note as /run: the carry already landed, sources are untouched, a retry resumes, and the
        // run root now exists so the subject reads as resumable.
        const body = e?.body && typeof e.body === 'object' ? e.body : null
        return reply.code(e?.statusCode || 500).send({ error: e?.message || 'launch failed', carried: prep.carriedAncestors, ...(body || {}) })
      }
    })
  } catch (e: any) {
    if (e instanceof SubjectBusyError) {
      return reply.code(409).send({ error: `Another completion request for ${ticker} is already in progress. Wait for it to finish before retrying.`, code: 'subject_busy' })
    }
    throw e
  }
})

// Execute the intake plan's SCOPED rerun in ONE pass — the batch answer to running its `/research:rerun`
// commands one by one (which repeats every downstream synthesis + master + commit per orb, and publishes
// an intermediate thesis between them). Stages the target root via carryForwardScoped — untouched modules
// carried whole, entry modules carried minus the invalidated orbs + synthesis, downstream modules carried
// minus synthesis only — then launches the ORDINARY full run: its existing module/orb skip machinery
// re-runs exactly the gaps, DAG-parallel, ending in one master + finish-gate + commit. The plan itself is
// read server-side (readIntakePlan: roster-validated, cascades recomputed) — the client never supplies
// orb names, so a stale/spoofed body cannot widen the rerun (INTAKE.md §4 fail-closed).
const IntakePlanRunBody = z.object({
  ...ProviderLaunchFields,
  ticker: z.string().regex(TICKER_RE),
  // REQUIRED for the same reason as ThesisPlanRunBody — an omitted swarm must never default to research.
  swarm: z.string().regex(MODULE_RE),
  runRoot: z.string().min(1).max(300),
  decisionFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  planPath: z.string().min(1).max(700),
  planSha256: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  sourceDecisionFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/),
}).strict()
// Refuse old callers on a current server, and require new callers to use a path an old server cannot
// possibly accept. This closes the server-change-between-estimate-and-POST window for the paid batch.
app.post('/api/intake-plan/run', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (_req, reply) => (
  reply.code(426).send({ error: 'exact_intake_plan_endpoint_required' })
))
app.post('/api/intake-plan/run-exact', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (req, reply) => {
  // Same CSRF class as /api/thesis-plan/run: a paid, disk-writing plain POST.
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  const parsed = IntakePlanRunBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const { ticker, swarm, provider, model, reasoningLevel, expectedProfileKey, runRoot, decisionFingerprint, planPath, planSha256, sourceDecisionFingerprint } = parsed.data
  const { user, userVia } = identify(req)
  if (!isValidTicker(ticker)) return reply.code(400).send({ error: 'bad ticker' })
  if (isReservedDataFolder(ticker) || !fs.existsSync(path.join(DATA_DIR, ticker))) {
    return reply.code(400).send({ error: `unknown ticker ${ticker}` })
  }
  if (swarm !== RESEARCH_SWARM_ID) {
    return reply.code(400).send({ error: 'Scoped reruns are research-only for now.', code: 'swarm_unsupported' })
  }
  const selectedNeeds = readDataNeeds(swarm, ticker, runRoot)
  const currentNeeds = readDataNeeds(swarm, ticker)
  if (!selectedNeeds || !currentNeeds || selectedNeeds.run_root !== currentNeeds.run_root
      || selectedNeeds.decision_fingerprint !== decisionFingerprint
      || currentNeeds.decision_fingerprint !== decisionFingerprint) {
    return reply.code(409).send({ error: 'The selected call changed. Refresh before rerunning.', code: 'selected_decision_changed' })
  }
  // The plan is the SERVER's exact selected-call read — roster-validated commands only.
  const intake = readIntakePlan(ticker, { swarmId: swarm, runRoot })
  if (!intake || intake.actionable !== true || intake.plan_path !== planPath || intake.plan_sha256 !== planSha256
      || intake.decision_fingerprint !== sourceDecisionFingerprint || intake.rerun_plan.commands.length === 0) {
    return reply.code(409).send({ error: 'No scoped rerun plan exists for this ticker — run the new-data analysis first.', code: 'no_plan' })
  }
  // Freshness for EXECUTION is the WITNESS half only: has anything landed since the analysis read the pool?
  // NOT `pool_current`, which also ANDs the durable run-date floor (pool newer than the run folder). That
  // floor is exactly TRUE in the normal case this feature exists for — a document arriving after an older
  // finished run — so gating on pool_current would refuse every legitimate scoped rerun (Codex #358
  // r3672541957). The floor's job is guarding the "nothing new" affirmative, not blocking execution.
  // Fail-closed when the witness is unprovable (an old plan with no scanned_at): fall back to pool_current.
  const freshnessProblem = (plan: NonNullable<typeof intake>): string | null => {
    const stamp = plan.scanned_at ? Date.parse(plan.scanned_at) : NaN
    if (!Number.isFinite(stamp)) {
      return plan.pool_current === true ? null : 'this plan predates the precise freshness stamp and the pool has changed since'
    }
    const newest = dataPoolNewest(ticker).newestMs
    return !newest || newest <= stamp ? null : 'a document landed after this plan was scoped'
  }
  const staleWhy = freshnessProblem(intake)
  if (staleWhy) {
    return reply.code(409).send({ error: `${staleWhy} — re-run the new-data analysis first.`, code: 'plan_stale' })
  }
  // Fail-toward-blunt on DROPPED mappings: a widened note means some document's orb mapping did not survive
  // roster validation, so its impact is UNSCOPED. Executing only the surviving commands would carry the
  // very module that document may invalidate (INTAKE.md §1; Codex #358 r3672206145 P1).
  if ((intake.widened?.length ?? 0) > 0) {
    return reply.code(409).send({ error: 'Part of the plan no longer maps to the current roster — its documents are unscoped. Re-run the new-data analysis (fail-toward-blunt).', code: 'plan_widened', widened: intake.widened })
  }
  try {
    // Same lock KEY as the sibling thesis-plan routes, so a scoped rerun and a completion can never carry
    // into the same target root concurrently.
    return await withSubjectLock(subjectMutationLockKey(RESEARCH_SWARM_ID, ticker), async () => {
      const busy = listRuns().some((r) => (r.swarmId || RESEARCH_SWARM_ID) === RESEARCH_SWARM_ID
        && r.subjectId === ticker && (IN_FLIGHT_STATUSES.has(r.status) || r.endedAt === undefined))
      if (busy) return reply.code(409).send({ error: `A run is already in flight on ${ticker}. Let it finish (or stop it) before re-running.`, code: 'subject_busy' })

      const terminalNeeds = readDataNeeds(swarm, ticker, runRoot)
      const terminalCurrent = readDataNeeds(swarm, ticker)
      if (!terminalNeeds || !terminalCurrent || terminalNeeds.run_root !== terminalCurrent.run_root
          || terminalNeeds.decision_fingerprint !== decisionFingerprint
          || terminalCurrent.decision_fingerprint !== decisionFingerprint) {
        return reply.code(409).send({ error: 'The selected call changed while preparing the rerun.', code: 'selected_decision_changed' })
      }

      // Re-read the exact plan INSIDE the same swarm-qualified mutation lock used by every doc-intake
      // writer. The pre-lock read was only a cheap user-facing rejection; these bytes/commands are the
      // sole execution authority, so a concurrent Analyze click can never mix one plan's commands with
      // another plan file in the staged audit trail.
      const lockedIntake = readIntakePlan(ticker, { swarmId: swarm, runRoot })
      const lockedCommands = lockedIntake?.rerun_plan?.commands ?? []
      if (!lockedIntake || lockedIntake.actionable !== true || lockedIntake.plan_path !== planPath
          || lockedIntake.plan_sha256 !== planSha256
          || lockedIntake.decision_fingerprint !== sourceDecisionFingerprint || lockedCommands.length === 0) {
        return reply.code(409).send({ error: 'No scoped rerun plan exists for this ticker — run the new-data analysis first.', code: 'no_plan' })
      }
      if ((lockedIntake.widened?.length ?? 0) > 0) {
        return reply.code(409).send({ error: 'Part of the plan no longer maps to the current roster — re-run the new-data analysis (fail-toward-blunt).', code: 'plan_widened', widened: lockedIntake.widened })
      }

      // ONE plan snapshot for the completeness check AND the carry (no time-of-check/time-of-use gap).
      // Reuse override = every reusable module: stale ones included — the scoped carry stages their
      // finished copy and punches holes in it.
      const selection = { provider, model, reasoningLevel }
      const first = await thesisPlanForRequest(ticker, undefined, undefined, undefined, selection)
      if (first.complete) {
        return reply.code(409).send({ error: 'Today\'s run root already has a final thesis — a scoped rerun would overwrite the decision of record. Use the single-orb Re-run for a same-day refresh.', code: 'already_complete', path: first.finalReportPath })
      }
      // The confirm strip prices "the named orbs + syntheses"; a module that is NEITHER reusable (never
      // finished anywhere) NOR in the plan's stale set would be run WHOLE by the launched full run — unpriced
      // work with none of the full-run path's typed-ticker confirmation (Codex #358 r3672400188 P1). Set
      // arithmetic on the plan's own server-recomputed cascades, so it runs BEFORE any disk write.
      // EVERY module must have a finished synthesis somewhere on disk. A module inside the plan's cascade
      // that never finished cannot be staged with holes (there is nothing to carry), so the launched full
      // run would build it WHOLE — unpriced work the confirm strip never showed, without the full-run
      // path's typed-ticker gate. Being in the cascade does not make it priced (Codex #358 r3672541961).
      const reusableSet = new Set(first.reusable)
      const unpriced = listModuleNames(RESEARCH_SWARM_ID).filter((m) => !reusableSet.has(m))
      if (unpriced.length) {
        return reply.code(409).send({ error: `This run is incomplete beyond the plan's scope (${unpriced.join(', ')} never finished) — a scoped rerun would silently run ${unpriced.length === 1 ? 'it' : 'them'} whole. Complete the thesis first.`, code: 'run_incomplete', unpriced })
      }
      // CLI presence BEFORE staging: the staging below punches holes in today's root; failing on a missing
      // engine binary after that would leave a finished-today module partial for nothing (Codex #358
      // r3672400207 — the remaining pre-spawn failures are admission races, which the resume machinery
      // absorbs: the holes ARE the work a retry re-runs).
      try { await assertProviderAvailable(provider) } catch (e: any) {
        return reply.code(e?.statusCode || 503).send({ error: e?.message || 'engine CLI unavailable', code: e?.code })
      }
      // Re-check freshness HERE, after the subject lock and the CLI probe: both can take time, and a
      // document that lands in that window would otherwise be scoped-out of a run we already approved
      // (Codex #358 r3672541968). Cheap — one stat of the pool's newest file.
      const lateWhy = freshnessProblem(lockedIntake)
      if (lateWhy) {
        return reply.code(409).send({ error: `${lateWhy} while this run was being prepared — re-run the new-data analysis first.`, code: 'plan_stale' })
      }
      const snap = await thesisPlanForRequest(ticker, undefined, first.reusable, undefined, selection)
      // The plan file copied into today's staging root is provenance for THIS exact selected call. Never
      // fall back to newest-run-wins here: a newer incomplete shell can carry a different plan even while
      // the selected finished decision remains the current call.
      const sourcePlanFile = latestPlanFileFor(ticker, { swarmId: swarm, runRoot })
      if (!sourcePlanFile) {
        return reply.code(409).send({ error: 'The selected call no longer has its intake plan. Re-run the new-data analysis.', code: 'no_plan' })
      }

      let staged: ReturnType<typeof carryForwardScoped>
      try {
        staged = carryForwardScoped(ticker, lockedCommands.map((c) => ({ module: c.module, agent: c.agent })), RESEARCH_SWARM_ID, snap, sourcePlanFile)
      } catch (e: any) {
        return reply.code(500).send({ error: `could not stage the scoped rerun: ${e?.message || e}` })
      }
      // Fail-closed end to end: if EVERY plan command was dropped by roster validation, nothing scoped was
      // staged — launching now would silently run a plain full run the user never asked for.
      if (staged.scoped.length === 0 && staged.staleModules.length === 0) {
        return reply.code(409).send({ error: 'The plan\'s entry orbs no longer match the roster — re-run the new-data analysis.', code: 'plan_stale', dropped: staged.droppedEntries })
      }
      // Nothing on disk to scope AGAINST (no finished module was carried whole or with holes): the launch
      // below would be a bare full run wearing a "scoped" label, with none of the full-run path's explicit
      // consent or typed-ticker confirmation. Refuse and point at the honest button for that.
      if (staged.scoped.length === 0 && staged.carried.length === 0) {
        return reply.code(409).send({ error: 'No finished run to scope against — this would be a plain full run. Use "Complete the thesis" for that.', code: 'nothing_to_scope' })
      }

      try {
        const out = await launch({ kind: 'full', ticker, provider, model, reasoningLevel, expectedProfileKey, user, userVia,
          decisionRunRoot: runRoot, decisionFingerprint })
        return { ...out, carried: staged.carried, scoped: staged.scoped, staleModules: staged.staleModules, dropped: staged.droppedEntries }
      } catch (e: any) {
        // The carry already landed on disk; sources are untouched and a retry reuses the staging — the run
        // root now exists, so the cockpit will offer this subject as resumable. Honest, nothing lost.
        const body = e?.body && typeof e.body === 'object' ? e.body : null
        return reply.code(e?.statusCode || 500).send({ error: e?.message || 'launch failed', carried: staged.carried, scoped: staged.scoped, ...(body || {}) })
      }
    })
  } catch (e: any) {
    if (e instanceof SubjectBusyError) {
      return reply.code(409).send({ error: `Another completion request for ${ticker} is already in progress. Wait for it to finish before retrying.`, code: 'subject_busy' })
    }
    throw e
  }
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
      .map((r) => ({
        runId: r.runId, kind: r.kind, ticker: r.ticker, module: r.module, status: r.status,
        continuation: r.continuation,
        swarmId: r.swarmId, unit: r.unit, startedAt: r.startedAt,
        provider: r.provider, executionProfile: r.executionProfile,
        publicationPhase: r.publicationPhase,
      })),
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
    return readRunsMarkdown(p)
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
  const r = resolveOutputRun(q)
  if (r.unknownSwarm) return reply.code(404).send({ error: 'unknown swarm' })
  if (r.badSubject) return reply.code(400).send({ error: 'subject required' })
  if (!r.runRoot) return reply.code(404).send({ error: 'no run found' })
  // A constellation swarm's final deliverable is its terminal module's synthesis (the dossier) —
  // there is no run-root final_thesis.md outside research (CLAUDE.md §26: derived, not hardcoded).
  if (r.swarm !== 'research') {
    const p = runManifest(r.runRoot, r.resolve, terminalModuleName(r.swarm)).finalReport?.path
    if (!p) return reply.code(404).send({ error: 'no final dossier yet' })
    try {
      return readRunsMarkdown(p)
    } catch {
      return reply.code(404).send({ error: 'no final dossier yet' })
    }
  }
  try {
    return readMarkdown(`${r.runRoot}/final_thesis.md`)
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
    const subject = normalizeDataSubject(swarm, q?.subject || q?.ticker)
    if (!subject) return { runRoot: null, swarm, badSubject: true }
    const abs = findRunRootForSubject(swarm, subject)
    return { runRoot: abs ? path.relative(REPO_ROOT, abs) : null, swarm, resolve: resolveInsideRuns }
  }
  // display path: a bare ticker resolves to its STANDING run (newest that decided), so a partial re-run
  // can't shadow the dossier. An explicit runRoot/date is still honored (opening a specific historical run).
  return { runRoot: resolveRunRoot({ runRoot: q?.runRoot, ticker: q?.ticker, date: q?.date, preferComplete: true }), swarm: 'research' }
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

// ---------- live market price for a decided run ----------
// The decision banner shows a call priced on its decision date. This serves the other half: where the
// price is NOW, and what the engine's own target implies from there. `quote`/`call` are null whenever
// the price cannot be established honestly (unquotable listing, currency mismatch, no entry price on
// the record, feed down) — the client renders the live cells ONLY on a positive match, so an older
// engine that 404s this route degrades to exactly the banner that shipped before it.
//
// Reuses resolveOutputRun, so a bare ticker resolves to its STANDING run — the live price is compared
// against the call the banner is actually showing, never against a partial re-run's stale anchor.
app.get('/api/quote', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req, reply) => {
  const r = resolveOutputRun(req.query as any)
  if (r.unknownSwarm) return reply.code(404).send({ error: 'unknown swarm' })
  if (r.badSubject) return reply.code(400).send({ error: 'subject required' })
  if (!r.runRoot) return reply.code(404).send({ error: 'no run found' })
  let d: any = null
  try { d = readDecision(r.runRoot, r.resolve) } catch { /* no decision_record yet */ }
  if (!d) return { ticker: null, quote: null, call: null, reason: null }
  const ticker = typeof d.ticker === 'string' && TICKER_RE.test(d.ticker) ? d.ticker : null
  const currency = typeof d.currency === 'string' ? d.currency : null
  if (!ticker) return { ticker: null, quote: null, call: null, reason: null }
  if (!currency) return { ticker, quote: null, call: null, reason: 'no_currency' }
  const entryPrice = typeof d.entry_price === 'number' ? d.entry_price : null
  const outcomes = await getQuotes([{
    ticker,
    currency,
    exchange: typeof d.exchange === 'string' ? d.exchange : null,
    companyName: typeof d.company_name === 'string' ? d.company_name : null,
    entryPrice,
  }])
  const o = outcomes.get(ticker) ?? { quote: null, reason: null }
  const call = o.quote
    ? callVsLive({
        entryPrice,
        expectedReturnPct: typeof d.expected_return_pct === 'number' ? d.expected_return_pct : null,
        livePrice: o.quote.price,
        currency: o.quote.currency,
        entryPriceTimestamp: typeof d.entry_price_timestamp === 'string' ? d.entry_price_timestamp : null,
        // the band check needs the run's own scenario prices and its position (a higher price is good
        // for a long and bad for a short — see priceBand)
        scenarios: d.scenarios,
        basket: typeof d.basket === 'string' ? d.basket : null,
      })
    : null
  return { ticker, quote: o.quote, call, reason: o.reason }
})

// ---------- fund book (portfolio-store.ts) ----------
// The REAL book, fed by IBKR Flex exports. Distinct from the engine's model paper-portfolio
// (/research:size), which answers what the research SAID to own; this answers what is actually held.
//
// Statements are the source of truth and the book is rebuilt from them on read, so these routes never
// write a derived number anywhere. Everything lands under STATE_DIR, which is git-ignored: the book is
// private financial data, not research output.

app.get('/api/portfolio', async (req, reply) => {
  // The response carries the account identifier, exact NAV, every position and the trade history. Without
  // an explicit header it is heuristically cacheable, so a browser or an intermediary can re-serve the
  // whole book after the session ends — the attachment route already sets the same header for the same
  // reason.
  reply.header('cache-control', 'private, no-store')
  try {
    return readPortfolio()
  } catch (e: any) {
    // Generic and path-free: the thrown message can carry absolute STATE_DIR paths, and this is the
    // one fund-book route that answers before any authentication of intent.
    req.log.error({ err: e }, 'portfolio read failed')
    return reply.code(500).send({ error: 'cannot read the fund book' })
  }
})

app.post('/api/portfolio/statements', { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  if (!req.isMultipart()) return reply.code(400).send({ error: 'expected multipart' })

  const saved: unknown[] = []
  const duplicates: string[] = []
  const fileErrors: { filename: string; reason: string }[] = []
  // The whole iteration is wrapped: req.parts() can throw mid-stream, and losing that would discard
  // statements already accepted in an earlier turn of the loop.
  try {
    // Raise the per-part cap for THIS route only. The plugin is registered globally with the Drive
    // upload limit (40 MB), which is smaller than a statement's own cap — without this override the
    // parser truncates a 50 MB export and the code below reports it as "larger than 64MB", which is
    // both a rejection of a valid file and a false reason for it.
    for await (const part of req.parts({ limits: { fileSize: STATEMENT_MAX_BYTES } })) {
      if (part.type !== 'file') continue
      const filename = part.filename || 'statement.xml'
      const chunks: Buffer[] = []
      let bytes = 0
      let tooBig = false
      for await (const c of part.file as any) {
        const chunk = c as Buffer
        bytes += chunk.length
        // Over the cap: stop accumulating but KEEP DRAINING. Breaking out of a `for await` destroys the
        // part stream, and req.parts() cannot advance past a destroyed file — the request would hang
        // with no response at all instead of a clean rejection.
        if (bytes > STATEMENT_MAX_BYTES) { tooBig = true; chunks.length = 0; continue }
        chunks.push(chunk)
      }
      if (tooBig || (part.file as any).truncated) {
        fileErrors.push({ filename, reason: `larger than ${Math.round(STATEMENT_MAX_BYTES / 1024 / 1024)}MB` })
        continue
      }
      try {
        // saveStatement parses before it writes, so an unreadable file never reaches the store.
        const result = saveStatement(Buffer.concat(chunks).toString('utf8'), filename)
        if (result.status === 'duplicate') duplicates.push(filename)
        else saved.push(result.statement)
      } catch (e: any) {
        fileErrors.push({ filename, reason: String(e?.message || e) })
      }
    }
  } catch (e: any) {
    fileErrors.push({ filename: '(request)', reason: String(e?.message || e) })
  }

  if (!saved.length && !duplicates.length) {
    return reply.code(400).send({ error: 'no statement was accepted', fileErrors })
  }
  return { saved, duplicates, fileErrors, ...readPortfolio() }
})

app.delete('/api/portfolio/statements/:id', async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const id = String((req.params as any).id ?? '')
  if (!deleteStatement(id)) return reply.code(404).send({ error: 'not found' })
  return readPortfolio()
})

// A fill taken since the last export, typed in by hand. PROVISIONAL by construction: it is stored and
// shown, it never enters the book or the reconciliation checks, and it is marked as answered the moment
// a statement covers its date. Validation lives in portfolio-manual.ts so the same rules apply to any
// caller, and its thrown messages are written for the operator — safe to return verbatim, unlike the
// store's, which can carry absolute paths.
app.post('/api/portfolio/manual', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  try {
    return logManualTrade((req.body ?? {}) as any)
  } catch (e: any) {
    return reply.code(400).send({ error: String(e?.message || 'that entry could not be logged') })
  }
})

app.delete('/api/portfolio/manual/:id', async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  if (!removeManualTrade(String((req.params as any).id ?? ''))) return reply.code(404).send({ error: 'not found' })
  return readPortfolio()
})

// Clear the entries a statement has already answered. Deliberately an explicit action rather than
// something an upload does on its own: an entry the broker never confirmed is exactly what the operator
// needs to see, and it would vanish unnoticed if importing tidied up behind itself.
app.post('/api/portfolio/manual/clear-superseded', async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const cleared = clearSupersededManual()
  return { cleared, ...readPortfolio() }
})

// The gap between the last statement and today, priced at the market. A SEPARATE read on purpose: the
// book is synchronous and broker-tied, this needs the network and ties to nothing, and the screen
// should show the reconciled figures immediately and let the estimate arrive after.
app.get('/api/portfolio/live', async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  reply.header('cache-control', 'private, no-store') // same private book, marked to market
  try {
    return await liveMark(readPortfolio().book)
  } catch (e: any) {
    req.log.error({ err: e }, 'live mark failed')
    return reply.code(500).send({ error: 'the live mark could not be computed' })
  }
})

// Declare a holding a cash equivalent. The broker cannot answer this — SGOV, CANE and GLDM all arrive
// as subCategory="ETF" — and matching on the description would be guessing, so the operator says it once.
app.post('/api/portfolio/cash-equivalent', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const body = (req.body ?? {}) as { symbol?: unknown; isCash?: unknown }
  try {
    return declareCashEquivalent(String(body.symbol ?? ''), body.isCash === true)
  } catch (e: any) {
    return reply.code(400).send({ error: String(e?.message || 'that declaration could not be saved') })
  }
})

// ---------- ideas (portfolio-ideas.ts) ----------
// WHICH IDEA a trade was expressing. Nothing here infers: CANE and SUGAl are one sugar bet and NHYDY is
// an aluminium bet, and no field in the statement says so. Assignments are keyed to the open position
// or to the broker's own closeTradeIDs, never to the bare symbol, so labelling this year's AMZN cannot
// relabel next year's. Same 60/min lane as the cash-equivalent declaration above.
app.post('/api/portfolio/idea', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const body = (req.body ?? {}) as { label?: unknown }
  try {
    return declareIdea(String(body.label ?? ''))
  } catch (e: any) {
    return reply.code(400).send({ error: String(e?.message || 'that idea could not be saved') })
  }
})

app.post('/api/portfolio/idea/rename', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const body = (req.body ?? {}) as { id?: unknown; label?: unknown }
  try {
    return renameDeclaredIdea(String(body.id ?? ''), String(body.label ?? ''))
  } catch (e: any) {
    return reply.code(400).send({ error: String(e?.message || 'that idea could not be renamed') })
  }
})

app.post('/api/portfolio/idea/delete', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const body = (req.body ?? {}) as { id?: unknown }
  try {
    return removeDeclaredIdea(String(body.id ?? ''))
  } catch (e: any) {
    return reply.code(400).send({ error: String(e?.message || 'that idea could not be removed') })
  }
})

// Label a HOLDING. `ideaId: null` clears it.
app.post('/api/portfolio/idea/holding', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const body = (req.body ?? {}) as { symbol?: unknown; ideaId?: unknown }
  try {
    // ABSENT is not NULL. Clearing is a deliberate act, so it takes a deliberate `null`; a malformed or
    // version-skewed request that simply omits the field would otherwise silently unassign the holding.
    if (!('ideaId' in body)) throw new Error('ideaId is required — send null to clear the assignment')
    const id = body.ideaId === null ? null : String(body.ideaId)
    return assignHoldingIdea(String(body.symbol ?? ''), id)
  } catch (e: any) {
    return reply.code(400).send({ error: String(e?.message || 'that holding could not be assigned') })
  }
})

// Label a CLOSED ROUND TRIP by the broker trade ids behind it. A split sale carries several, and every
// one is written, so the row still reads as assigned however a later import re-folds it.
app.post('/api/portfolio/idea/trade', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const body = (req.body ?? {}) as { closeTradeIDs?: unknown; ideaId?: unknown }
  const ids = Array.isArray(body.closeTradeIDs) ? body.closeTradeIDs.map((v) => String(v ?? '')) : []
  try {
    if (!('ideaId' in body)) throw new Error('ideaId is required — send null to clear the assignment')
    const id = body.ideaId === null ? null : String(body.ideaId)
    return assignTradeIdea(ids, id)
  } catch (e: any) {
    return reply.code(400).send({ error: String(e?.message || 'that trade could not be assigned') })
  }
})

// ---------- watchlist (watchlist.ts) ----------
// Sits beside /api/quote because it shares the quote lane: one batched getQuotes call prices the whole
// list. Membership + the archive rule live in watchlist.ts; these routes only validate, call, and shape.

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
// Shape (regex) is necessary but not sufficient — '2026-02-30' matches the regex and is not a real day.
// evaluateTrigger compares these lexicographically as due dates, and a non-existent date compares fine
// but can never be reproduced or corrected through the browser's <input type="date"> control once saved.
const ISO_CALENDAR_DATE = z.string().regex(ISO_DATE_RE).refine(isValidCalendarISODate, { message: 'not a real calendar date' })

// Every trigger is a closed shape. Direction, reference source and scenario are CHOICES, never free
// text, and a number always arrives beside the currency it is measured in — the ambiguity this removes
// is the reason a target price can never be 100x wrong from a mistyped unit.
const TriggerBody = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('price_level'),
    trigger_id: z.string().trim().max(40).optional(),
    direction: z.enum(['at_or_below', 'at_or_above']).default('at_or_below'),
    level: z.number().finite().positive(),
    currency: z.string().trim().min(1).max(8),
    note: z.string().max(500).optional(),
  }).strip(),
  z.object({
    kind: z.literal('pct_drop'),
    trigger_id: z.string().trim().max(40).optional(),
    drop_pct: z.number().finite().gt(0).lte(99),
    reference: z.object({
      value: z.number().finite().positive(),
      currency: z.string().trim().min(1).max(8),
      as_of: ISO_CALENDAR_DATE.nullable().default(null),
      source: z.string().trim().max(120).default('my number'),
    }).strip(),
    note: z.string().max(500).optional(),
  }).strip(),
  z.object({
    kind: z.literal('valuation_mos'),
    trigger_id: z.string().trim().max(40).optional(),
    // nullable: a fair value you assert yourself is legitimate — it is labelled as YOUR number, not the
    // engine's. Requiring a run here made the whole trigger type unsavable.
    run_root: z.string().trim().max(300).nullable().default(null),
    scenario_label: z.string().trim().min(1).max(60),
    anchor_value: z.number().finite().positive(),
    anchor_currency: z.string().trim().min(1).max(8),
    anchor_as_of: ISO_CALENDAR_DATE.nullable().default(null),
    required_mos_pct: z.number().finite().gte(0).lte(95),
    direction: z.enum(['at_or_below', 'at_or_above']).default('at_or_below'),
    note: z.string().max(500).optional(),
  }).strip(),
  z.object({
    kind: z.literal('event_date'),
    trigger_id: z.string().trim().max(40).optional(),
    due_date: ISO_CALENDAR_DATE,
    label: z.string().trim().min(1).max(160),
    acknowledged_at: z.string().max(40).nullable().optional(),
    note: z.string().max(500).optional(),
  }).strip(),
])

const WatchRowBody = z.object({
  ticker: z.string().trim().min(1).max(15),
  company_name: z.string().trim().max(160).nullable().optional(),
  currency: z.string().trim().max(8).nullable().optional(),
  exchange: z.string().trim().max(80).nullable().optional(),
  why: z.string().trim().max(4000).default(''),
  conviction: z.enum(['high', 'medium', 'low']).nullable().optional(),
  review_date: ISO_CALENDAR_DATE.nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(24)).max(WATCHLIST_MAX_TAGS).default([]),
  triggers: z.array(TriggerBody).max(WATCHLIST_MAX_TRIGGERS).default([]),
  assignee: z.enum(['AB', 'NV', 'CK']).nullable().optional(),
}).strip()

const TaskBody = z.object({
  scope: z.enum(['ticker', 'company_event', 'world_event']),
  ticker: z.string().trim().max(240).nullable().optional(),
  subject: z.string().trim().max(240),
  title: z.string().trim().max(4000),
  stage: z.enum(['idea_generation', 'ticker_identified', 'deep_dive', 'final_decision']),
  decision: z.enum(['deploy', 'reject', 'watch']).nullable().optional(),
  assignee: z.enum(['AB', 'NV', 'CK']),
}).strip()

function taskOutcomeProblem(stage: TaskStage, decision: TaskDecision | null): string | null {
  if (stage !== 'final_decision' && decision) return 'A final decision belongs only in Final Decision.'
  return null
}

const WatchTargetBody = z.object({
  ticker: z.string().trim().min(1).max(15),
  currency: z.string().trim().max(8).nullable().optional(),
  reason: z.string().trim().max(500).default(''),
  mute_scope: z.enum(['assertion', 'listing']).default('assertion'),
}).strip()

/**
 * Mint trigger ids server-side so a client cannot forge one — but KEEP an existing id when the edit is
 * positional, so a trigger keeps its identity across saves (its evaluation history is keyed on it). Ids
 * are random rather than time-based: two entries edited in the same millisecond would otherwise collide.
 */
function withTriggerIds(triggers: z.infer<typeof TriggerBody>[], prev: WatchTrigger[] = []): WatchTrigger[] {
  const known = new Set(prev.map((t) => t.trigger_id))
  const used = new Set<string>()
  return triggers.map((t) => {
    // Keep the id the client is editing, but only if this entry actually has it — that stops a forged or
    // duplicated id, and stops a deleted trigger's id being inherited by whatever took its place.
    const sent = (t as { trigger_id?: string }).trigger_id
    const keep = sent && known.has(sent) && !used.has(sent) ? sent : null
    const id = keep ?? `TRG-${randomUUID().replace(/-/g, '').slice(0, 12)}`
    used.add(id)
    return { ...t, trigger_id: id } as WatchTrigger
  })
}

/** The standing calls that feed the engine half, cached briefly: listAllCalls walks every run folder,
 *  and the watchlist read is polled. */
let callsCache: { at: number; calls: StandingCall[] } | null = null
async function standingCalls(): Promise<StandingCall[]> {
  if (callsCache && Date.now() - callsCache.at < 30_000) return callsCache.calls
  const calls = ((await listAllCalls()).calls ?? []) as unknown as StandingCall[]
  callsCache = { at: Date.now(), calls }
  return calls
}

// ---------- watchlist git publication ----------
// CLAUDE.md §25/§28 name `watchlist/**` as engine DATA, published straight to `main` through the same
// serialized commit/push helper every other autonomous data write uses — never as code. writeEntry() and
// deleteEntry() (watchlist.ts) are pure filesystem calls on purpose: they are called from unit tests with
// a plain tmp dir and must stay side-effect-free there. Publication is a SEPARATE step every route below
// takes right after a write, mirroring launcher.ts's commitRunFile for the failure note and
// news/ideas/ideas-publisher.ts for the Ideas ledger — both existing, established callers of the same
// script. Kept synchronous (awaited) rather than fire-and-forget: a change nobody's request ever learned
// failed to reach git is a change that silently never reached git, which is the exact defect this exists
// to close. A failure is reported back to the caller as `publish_error` rather than swallowed — the row
// still saved locally (so nothing already typed is lost), but the client can now say so.
const WATCHLIST_PUBLISH_TIMEOUT_MS = 20 * 60_000
// The Tasks client waits 90 seconds. Bound the only potentially long pre-write read to 20 seconds and
// publication to 60, leaving 10 seconds for the small synchronous validation/write steps in between.
const TASK_UPDATE_PUBLISH_TIMEOUT_MS = 60_000
const TASK_ENGINE_WATCH_TIMEOUT_MS = 20_000
async function publishWatchlist(relPaths: string[], msg: string, timeoutMs = WATCHLIST_PUBLISH_TIMEOUT_MS): Promise<{ ok: boolean; error?: string }> {
  const script = path.join(REPO_ROOT, 'scripts', 'commit-run.sh')
  if (!fs.existsSync(script)) return { ok: false, error: 'commit-run.sh not found (not a full checkout)' }
  try {
    await execa('bash', [script, msg, '--', ...relPaths], { cwd: REPO_ROOT, timeout: timeoutMs })
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: String(e?.stderr || e?.message || e).slice(0, 400) }
  }
}
const watchlistEntryPath = (entryId: string) => `watchlist/entries/${entryId}.json`
const PLANNING_MUTATION_LOCK = 'planning-mutation:tasks-watchlist'

class TaskEngineWatchTimeoutError extends Error {
  constructor() { super('task engine Watchlist lookup timed out'); this.name = 'TaskEngineWatchTimeoutError' }
}

async function withPlanningMutation(reply: FastifyReply, fn: () => Promise<unknown>): Promise<unknown> {
  try {
    return await withSubjectLock(PLANNING_MUTATION_LOCK, fn)
  } catch (error) {
    if (error instanceof TaskEngineWatchTimeoutError) {
      return reply.code(503).send({ error: 'The Watchlist lookup took too long. Nothing was saved; try again.' })
    }
    if (error instanceof SubjectBusyError) {
      return reply.code(409).send({ error: 'Tasks and Watchlist are being updated. Try again in a moment.' })
    }
    throw error
  }
}

async function buildWatchlist() {
  const { entries, unreadable } = readEntries()
  const decoration = readSizingDecoration()
  const engine = readEngineWatch(await standingCalls(), decoration)

  // One batched quote call for the whole list — but getQuotes keys its result Map on the TICKER alone
  // (equity-quote.ts), so two listings of the SAME ticker in one batch collide and the survivor could be
  // the other currency's answer: the GBP row would show the USD listing's price. Group by ticker and run
  // one round per collision depth. With distinct tickers — the normal case, and what today's data is —
  // that is exactly one call, so the batching is preserved.
  type Subj = { ticker: string; currency: string | null; exchange: string | null; companyName: string | null; entryPrice: number | null }
  const byTicker = new Map<string, { key: string; subj: Subj }[]>()
  const seenKeys = new Set<string>()
  const consider = (key: string, ticker: string, currency: string | null, exchange: string | null, companyName: string | null, entryPrice: number | null) => {
    if (!currency || seenKeys.has(key)) return
    seenKeys.add(key)
    const list = byTicker.get(ticker) ?? []
    list.push({ key, subj: { ticker, currency, exchange, companyName, entryPrice } })
    byTicker.set(ticker, list)
  }
  for (const e of engine) consider(e.listing.listing_key, e.listing.ticker, e.listing.currency, e.listing.exchange, e.listing.company_name, e.entry_price)
  for (const e of entries) consider(e.listing.listing_key, e.listing.ticker, e.listing.currency, e.listing.exchange, e.listing.company_name, null)

  const quotes = new Map<string, { quote: any; reason: any }>()
  const depth = Math.max(0, ...[...byTicker.values()].map((g) => g.length))
  for (let round = 0; round < depth; round++) {
    const batch = [...byTicker.values()].map((g) => g[round]).filter(Boolean)
    if (!batch.length) continue
    const outcomes = await getQuotes(batch.map((b) => b.subj))
    for (const b of batch) quotes.set(b.key, outcomes.get(b.subj.ticker) ?? { quote: null, reason: null })
  }

  const merged = mergeWatchlist({ entries, engine, quotes, today: todayISO() })
  return {
    ...merged,
    engine_source: { file: decoration.file, generated_at: decoration.generated_at },
    unreadable,
    quotes_enabled: NEWS.quoteEnabled,
    as_of: new Date().toISOString(),
  }
}

app.get('/api/watchlist', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async () => buildWatchlist())

/**
 * Resolve a typed ticker to real, PRICED listings so the composer never asks a person to type a currency.
 * The currency is returned exactly as the feed gave it — the case is load-bearing (GBp is pence, GBP is
 * pounds, a factor of 100), so it is passed through rather than normalised here.
 */
app.get('/api/watchlist/resolve', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
  const q = String((req.query as any)?.q ?? '').trim()
  if (q.length < 1 || q.length > 40) return reply.code(400).send({ error: 'q required' })
  // Honour the same kill switch getQuotes does — with quotes off this route must not reach the provider.
  if (!NEWS.quoteEnabled) return { query: q, candidates: [], reason: 'quotes_disabled' }
  let groups: { symbol: string; name: string; exchange: string }[] = []
  try {
    groups = (await searchSymbolsEnriched(q)).slice(0, 8)
  } catch {
    return { query: q, candidates: [], reason: 'directory_unavailable' }
  }
  if (!groups.length) return { query: q, candidates: [], reason: 'no_match' }
  // The directory speaks Yahoo ("NHY.OL", exchange "Oslo"); the quote feed speaks CNBC ("NHY-NO"). Asking
  // the feed for a Yahoo symbol returns nothing, which showed up as a price-less row for every non-US
  // listing — and this engine's book is majority non-US. Translate the same way the quote lane does:
  // strip the venue suffix, then re-attach the country the exchange implies.
  const cnbcFor = (g: { symbol: string; exchange: string }): string[] =>
    symbolCandidates({ ticker: baseTicker(g.symbol), exchange: g.exchange, currency: 'X' })
  let rows: Map<string, any> | null = null
  try {
    const wanted = [...new Set(groups.flatMap(cnbcFor))]
    rows = await fetchCnbcRows(fetch, wanted, NEWS.quoteTimeoutMs)
  } catch {
    rows = null
  }
  const candidates = groups.map((g) => {
    // first candidate the feed actually priced — most specific first, exactly as the quote lane orders them
    const r = cnbcFor(g).map((sym) => rows?.get(sym)).find((row) => row && Number.isFinite(row.last))
    // Normalise the minor unit HERE. The feed returns "GBp" (pence) verbatim, and makeListing/normCurrency
    // upper-case it to "GBP" — so handing the raw pence price to the composer would prefill a trigger
    // level 100x off, the exact unit error this whole lane exists to prevent.
    const units = r?.currency ? resolveUnits(String(r.currency)) : null
    const raw = typeof r?.last === 'number' && Number.isFinite(r.last) ? r.last : null
    return {
      symbol: g.symbol,
      name: r?.name || g.name,
      exchange: r?.exchange || g.exchange || null,
      currency: units ? units.currency : null,
      price: raw != null && units ? Math.round((raw / units.divisor) * 100) / 100 : null,
      as_of: r?.asOf ?? null,
      as_of_is_close: !!r?.dateOnly,
    }
  })
  return { query: q, candidates, reason: rows ? null : 'feed_unavailable' }
})

app.post('/api/watchlist', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const parsed = WatchRowBody.safeParse(req.body ?? {})
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  return withPlanningMutation(reply, async () => {
  const listing = makeListing({
    ticker: parsed.data.ticker,
    currency: parsed.data.currency ?? null,
    exchange: parsed.data.exchange ?? null,
    companyName: parsed.data.company_name ?? null,
  })
  if (!cleanTicker(listing.ticker)) return reply.code(400).send({ error: 'ticker not usable' })
  const dupe = triggerSetProblem(parsed.data.triggers ?? [])
  if (dupe) return reply.code(400).send({ error: dupe })

  const { entries } = readEntries()
  const existing = pickEntryForListing(entries, listing.listing_key)
  if (existing && !existing.archive) return reply.code(409).send({ error: 'already on the watchlist' })
  // The cap only makes sense against a genuinely NEW row. Re-adding an archived listing restores an
  // EXISTING file in place — the same transition the dedicated /restore endpoint performs — so at a full
  // book this branch was refusing a request that adds no row at all, from the ordinary re-add path off
  // the decision banner.
  if (!existing && entries.length >= WATCHLIST_MAX_ROWS) return reply.code(413).send({ error: 'watchlist is full' })
  const { user } = identify(req)
  const now = new Date()
  // Re-adding a name you archived is an un-archive, not a second row. Creating another file would put the
  // same listing in BOTH the active and the archived views at once.
  if (existing?.archive) {
    if (existing.task_id && parsed.data.assignee === null) {
      return reply.code(409).send({ error: 'A Watchlist row linked to a task must keep its assigned person.' })
    }
    existing.archive = null
    existing.why = parsed.data.why || existing.why
    if (parsed.data.conviction !== undefined) existing.conviction = parsed.data.conviction ?? null
    if (parsed.data.review_date !== undefined) existing.review_date = parsed.data.review_date ?? null
    // Unconditional, not `if (...length)`: the composer opens an archived row with NO prefilled triggers
    // (archived rows are absent from watchlist.rows), so an explicitly empty array is what "I reviewed
    // this and kept no triggers" looks like on the wire. Gating on `.length` silently kept the OLD,
    // invisible archived triggers — which could fire immediately, contradicting what the composer showed
    // the person before they saved.
    existing.tags = [...new Set(parsed.data.tags.map((t) => t.toLowerCase()))]
    existing.triggers = withTriggerIds(parsed.data.triggers, existing.triggers)
    if (parsed.data.assignee !== undefined) existing.assignee = parsed.data.assignee ?? null
    existing.updated_at = now.toISOString()
    existing.history = [...existing.history, { at: now.toISOString(), by: user, action: 'restored', detail: 're-added' }].slice(-50)
    writeEntry(existing)
    const linkedTask = syncWatchAssigneeToTask(existing, user)
    const pub = await publishWatchlist([
      watchlistEntryPath(existing.entry_id),
      ...(linkedTask ? [taskPath(linkedTask.task_id)] : []),
    ], `Watchlist: re-add ${listing.ticker}`)
    return reply.code(200).send({ ok: true, entry: existing, publish_error: pub.ok ? undefined : pub.error })
  }
  const engine = readEngineWatch(await standingCalls(), readSizingDecoration()).find((e) => e.listing.listing_key === listing.listing_key) ?? null
  const entry: WatchEntry = {
    schema_version: 'watchlist-entry/v1',
    entry_id: newEntryId(now),
    origin: engine ? 'engine' : 'manual',
    listing,
    engine_ref: engine ? { run_root: engine.run_root, decision: engine.decision, decision_date: engine.decision_date, fingerprint: engine.fingerprint } : null,
    why: parsed.data.why,
    conviction: parsed.data.conviction ?? null,
    review_date: parsed.data.review_date ?? null,
    tags: [...new Set(parsed.data.tags.map((t) => t.toLowerCase()))],
    triggers: withTriggerIds(parsed.data.triggers),
    attachments: [],
    assignee: parsed.data.assignee ?? null,
    task_id: null,
    archive: null,
    history: [{ at: now.toISOString(), by: user, action: 'created', detail: '' }],
    created_at: now.toISOString(),
    created_by: user,
    updated_at: now.toISOString(),
  }
  writeEntry(entry)
  const pub = await publishWatchlist([watchlistEntryPath(entry.entry_id)], `Watchlist: add ${listing.ticker}`)
  return reply.code(201).send({ ok: true, entry, publish_error: pub.ok ? undefined : pub.error })
  })
})

app.patch('/api/watchlist/:id', { config: { rateLimit: { max: 240, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const id = String((req.params as any).id ?? '')
  if (!isWatchId(id)) return reply.code(400).send({ error: 'bad id' })
  const parsed = WatchRowBody.partial().safeParse(req.body ?? {})
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  return withPlanningMutation(reply, async () => {
  const { entries } = readEntries()
  const entry = entries.find((e) => e.entry_id === id)
  if (!entry) return reply.code(404).send({ error: 'not found' })
  if (parsed.data.triggers) {
    const problem = triggerSetProblem(parsed.data.triggers)
    if (problem) return reply.code(400).send({ error: problem })
  }
  const { user } = identify(req)
  const d = parsed.data
  if (d.assignee === null && entry.task_id) {
    return reply.code(409).send({ error: 'A Watchlist row linked to a task must keep its assigned person.' })
  }
  if (d.why !== undefined) entry.why = d.why
  if (d.conviction !== undefined) entry.conviction = d.conviction ?? null
  if (d.review_date !== undefined) entry.review_date = d.review_date ?? null
  if (d.tags !== undefined) entry.tags = [...new Set(d.tags.map((t) => t.toLowerCase()))]
  if (d.triggers !== undefined) entry.triggers = withTriggerIds(d.triggers, entry.triggers)
  if (d.assignee !== undefined) entry.assignee = d.assignee ?? null
  if (d.company_name !== undefined) entry.listing.company_name = d.company_name ?? null
  if (d.exchange !== undefined) entry.listing.exchange = d.exchange ?? null
  // Currency is the field that decides whether a row can be priced at all, so it MUST be fixable after
  // the fact. It is part of the listing identity, so changing it re-keys the row — refuse if that would
  // collide with an entry that already exists.
  if (d.currency !== undefined) {
    const next = makeListing({
      ticker: entry.listing.ticker,
      currency: d.currency ?? null,
      exchange: entry.listing.exchange,
      companyName: entry.listing.company_name,
    })
    if (next.listing_key !== entry.listing.listing_key) {
      const clash = entries.find((e) => e.entry_id !== entry.entry_id && e.listing.listing_key === next.listing_key)
      if (clash) return reply.code(409).send({ error: 'another entry already tracks that listing' })
      entry.listing = next
    }
  }
  entry.updated_at = new Date().toISOString()
  entry.history = [...entry.history, { at: entry.updated_at, by: user, action: 'edited', detail: '' }].slice(-50)
  writeEntry(entry)
  const linkedTask = syncWatchAssigneeToTask(entry, user)
  const pub = await publishWatchlist([
    watchlistEntryPath(entry.entry_id),
    ...(linkedTask ? [taskPath(linkedTask.task_id)] : []),
  ], `Watchlist: edit ${entry.listing.ticker}`)
  return { ok: true, entry, publish_error: pub.ok ? undefined : pub.error }
  })
})

// Assignment is intentionally a one-field route. It lets a pure engine row (which has no entry file yet)
// become assigned without forcing the operator through the full watchlist composer, and it mirrors the
// assignment into a linked task in the same published mutation.
app.post('/api/watchlist/assign', { config: { rateLimit: { max: 240, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const parsed = z.object({
    ticker: z.string().trim().min(1).max(24),
    currency: z.string().trim().max(8).nullable().optional(),
    assignee: z.enum(['AB', 'NV', 'CK']).nullable(),
  }).strip().safeParse(req.body ?? {})
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  return withPlanningMutation(reply, async () => {
  const key = listingKey(parsed.data.ticker, parsed.data.currency ?? null)
  const { entries } = readEntries()
  let entry = pickEntryForListing(entries, key)
  const { user } = identify(req)
  const at = new Date().toISOString()
  if (!entry) {
    if (entries.length >= WATCHLIST_MAX_ROWS) return reply.code(413).send({ error: 'watchlist is full' })
    const engine = readEngineWatch(await standingCalls(), readSizingDecoration()).find((row) => row.listing.listing_key === key)
    if (!engine) return reply.code(404).send({ error: 'watchlist row not found' })
    entry = {
      schema_version: 'watchlist-entry/v1', entry_id: newEntryId(new Date()), origin: 'engine', listing: engine.listing,
      engine_ref: { run_root: engine.run_root, decision: engine.decision, decision_date: engine.decision_date, fingerprint: engine.fingerprint },
      why: '', conviction: null, review_date: engine.next_review, tags: [], triggers: [], attachments: [],
      assignee: parsed.data.assignee, task_id: null, archive: null,
      history: [{ at, by: user, action: 'assigned', detail: parsed.data.assignee ?? 'unassigned' }],
      created_at: at, created_by: user, updated_at: at,
    }
  } else {
    if (parsed.data.assignee === null && entry.task_id) {
      return reply.code(409).send({ error: 'A Watchlist row linked to a task must keep its assigned person.' })
    }
    entry.assignee = parsed.data.assignee
    entry.updated_at = at
    entry.history = [...entry.history, { at, by: user, action: 'assigned', detail: parsed.data.assignee ?? 'unassigned' }].slice(-50)
  }
  writeEntry(entry)
  const linkedTask = syncWatchAssigneeToTask(entry, user)
  const pub = await publishWatchlist([
    watchlistEntryPath(entry.entry_id),
    ...(linkedTask ? [taskPath(linkedTask.task_id)] : []),
  ], `Watchlist: assign ${entry.listing.ticker}`)
  return { ok: true, entry, publish_error: pub.ok ? undefined : pub.error }
  })
})

/**
 * Archive and restore key on the LISTING, not on an entry id — that is the only identity a pure engine
 * row has, and keying on it is what lets the mute survive the engine file being regenerated. Archiving
 * an engine row that has no file yet CREATES one; that is the moment the row becomes user-touched.
 */
app.post('/api/watchlist/archive', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const parsed = WatchTargetBody.safeParse(req.body ?? {})
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  return withPlanningMutation(reply, async () => {
  const key = listingKey(parsed.data.ticker, parsed.data.currency ?? null)
  const { user } = identify(req)
  const now = new Date()
  const engine = readEngineWatch(await standingCalls(), readSizingDecoration()).find((e) => e.listing.listing_key === key) ?? null
  const { entries } = readEntries()
  let entry = pickEntryForListing(entries, key)
  if (!entry) {
    if (!engine) return reply.code(404).send({ error: 'not found' })
    entry = {
      schema_version: 'watchlist-entry/v1',
      entry_id: newEntryId(now),
      origin: 'engine',
      listing: engine.listing,
      engine_ref: { run_root: engine.run_root, decision: engine.decision, decision_date: engine.decision_date, fingerprint: engine.fingerprint },
      why: '', conviction: null, review_date: null, tags: [], triggers: [], attachments: [],
      archive: null, history: [], created_at: now.toISOString(), created_by: user, updated_at: now.toISOString(),
    }
  }
  if (entry.task_id) {
    return reply.code(409).send({ error: 'Change this card’s Final Decision in Tasks before archiving its Watchlist row.' })
  }
  entry.archive = {
    at: now.toISOString(),
    by: user,
    reason: parsed.data.reason,
    muted_fingerprint: engine?.fingerprint ?? null,
    mute_scope: parsed.data.mute_scope,
  }
  entry.updated_at = now.toISOString()
  entry.history = [...entry.history, { at: now.toISOString(), by: user, action: 'archived', detail: parsed.data.reason }].slice(-50)
  writeEntry(entry)
  const pub = await publishWatchlist([watchlistEntryPath(entry.entry_id)], `Watchlist: archive ${entry.listing.ticker}`)
  return { ok: true, entry, publish_error: pub.ok ? undefined : pub.error }
  })
})

app.post('/api/watchlist/restore', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const parsed = WatchTargetBody.safeParse(req.body ?? {})
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  return withPlanningMutation(reply, async () => {
  const key = listingKey(parsed.data.ticker, parsed.data.currency ?? null)
  const { entries } = readEntries()
  const entry = pickEntryForListing(entries, key)
  if (!entry) return reply.code(404).send({ error: 'not found' })
  if (entry.task_id) {
    return reply.code(409).send({ error: 'Change this card’s Final Decision in Tasks before restoring its Watchlist row.' })
  }
  const { user } = identify(req)
  const now = new Date().toISOString()
  entry.archive = null
  entry.updated_at = now
  entry.history = [...entry.history, { at: now, by: user, action: 'restored', detail: '' }].slice(-50)
  // An engine row that carries nothing of its own is not worth a file once it is un-archived.
  const bare = entry.origin === 'engine' && !entry.why && !entry.triggers.length && !entry.attachments.length
    && !entry.tags.length && !entry.assignee && !entry.task_id
  if (bare) {
    deleteEntry(entry.entry_id)
    const pub = await publishWatchlist([watchlistEntryPath(entry.entry_id)], `Watchlist: restore ${entry.listing.ticker} (bare — file removed)`)
    return { ok: true, entry: null, publish_error: pub.ok ? undefined : pub.error }
  }
  writeEntry(entry)
  const pub = await publishWatchlist([watchlistEntryPath(entry.entry_id)], `Watchlist: restore ${entry.listing.ticker}`)
  return { ok: true, entry, publish_error: pub.ok ? undefined : pub.error }
  })
})

// The scenario targets a finished run recorded, offered as a pre-filled trigger the human still adopts.
// Read on demand rather than folded into every watchlist row: only a minority of runs have a decision
// record at all, and the list should not pay for a file read per name to discover that.
app.get('/api/watchlist/scenarios', { config: { rateLimit: { max: 300, timeWindow: '1 minute' } } }, async (req, reply) => {
  const runRoot = String((req.query as any)?.run_root ?? '')
  if (!runRoot) return reply.code(400).send({ error: 'run_root is required' })
  const found = readRunScenarios(runRoot)
  // A missing record and a record with no scenarios are DIFFERENT states, and the panel says which:
  // "this run recorded none" is a fact about the run, "no record" is a fact about our coverage.
  if (!found) return reply.send({ record: false, scenarios: [] })
  return reply.send({ record: true, ...found })
})

// ---- watchlist attachments ----
// PDFs only, and they go to their own Drive folder keyed by ENTRY ID — never data/<TICKER>/. That is the
// difference between a note you wrote and evidence a run may cite (§4), and it is enforced by calling a
// function that takes no ticker at all rather than by remembering not to.

const WATCH_ATTACH_MAX_BYTES = 25 * 1024 * 1024

app.post('/api/watchlist/:id/attachments', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const id = String((req.params as any).id ?? '')
  if (!isWatchId(id)) return reply.code(400).send({ error: 'bad id' })
  if (!req.isMultipart()) return reply.code(400).send({ error: 'expected multipart' })
  const { entries } = readEntries()
  const entry = entries.find((e) => e.entry_id === id)
  if (!entry) return reply.code(404).send({ error: 'not found' })
  // Asked AFTER the request is validated: whether storage is up has no bearing on whether the request was
  // well-formed, and a 503 masking a 400 makes a client bug look like an outage.
  //
  // The LOCAL mount is tried first. `data/` is a symlink into Google Drive for Desktop — the same folder
  // the Drive API would write to — so writing a file there reaches Drive with no credential at all. On a
  // My Drive mount the API path could not work even fully configured: a service account has no storage
  // quota, so it cannot write into personal Drive. Filesystem first, API only where the mount is absent
  // (a server that reads the pool some other way).
  const useLocal = watchlistFilesAvailable()
  if (!useLocal && !GDRIVE_ENABLED) return reply.code(503).send({ error: 'attachments need either the Drive mount or the Drive API' })
  const { user } = identify(req)

  const added: typeof entry.attachments = []
  const fileErrors: { filename: string; reason: string }[] = []
  // The WHOLE iteration is wrapped, not just each upload: `req.parts()` itself can throw mid-stream (a
  // malformed trailing part, or the global @fastify/multipart file-count cap) — that propagates out of the
  // `for await` and used to skip the `if (added.length)` persist block below entirely, orphaning every PDF
  // already accepted by Drive in an EARLIER iteration with no record of it in the entry at all.
  try {
    for await (const part of req.parts()) {
      if (part.type !== 'file') continue
      const raw = part.filename || 'thesis.pdf'
      if (entry.attachments.length + added.length >= WATCHLIST_MAX_ATTACHMENTS) {
        part.file.resume()
        fileErrors.push({ filename: raw, reason: `at most ${WATCHLIST_MAX_ATTACHMENTS} files per name` })
        continue
      }
      const safe = sanitizeUploadFilename(raw)
      if (!safe.ok) { part.file.resume(); fileErrors.push({ filename: raw, reason: safe.reason }); continue }
      // Documents you READ (pdf, md), not data a run could cite (csv, json, xlsx). The original rule was
      // PDF-only because md/csv/json are the types the pool extractor ingests as evidence — but that
      // reasoning no longer applies to this folder: attachments live under a RESERVED data folder keyed by
      // entry id, `extract_pool.py` is only ever invoked as `data/{TICKER}/`, and both wholesale DATA_DIR
      // walkers skip reserved names. So markdown is unreachable as evidence here, and the cockpit already
      // renders it. The data formats stay refused — they have no viewer, no meaning as a "write-up", and
      // are the shapes most likely to be mistaken for a pool file if one were ever moved by hand.
      if (!/\.(pdf|md)$/i.test(safe.name)) { part.file.resume(); fileErrors.push({ filename: raw, reason: 'PDF or Markdown only' }); continue }

      let bytes = 0
      let tooBig = false
      // ONE consumer per stream. The size guard used to be a `data` listener for both paths, but attaching
      // one puts the stream in FLOWING mode — so on the local path, where a `for await` then consumed the
      // same stream, chunks could be emitted to the listener and lost before the iterator saw them, and
      // the file written to Drive would be silently short. A single-chunk upload never shows it, which is
      // exactly why driving it by hand with a small PDF proved nothing. The local path now counts inside
      // its own loop; only the API path, where uploadToWatchlist owns the stream, keeps a listener.
      if (!useLocal) {
        part.file.on('data', (c: Buffer) => {
          bytes += c.length
          if (bytes > WATCH_ATTACH_MAX_BYTES && !tooBig) { tooBig = true; part.file.destroy(new Error('too large')) }
        })
      }
      try {
        if (useLocal) {
          // Buffer first, THEN write: the size and truncation checks below must both be settled before
          // anything reaches the folder, or a rejected upload still leaves a short PDF that Drive
          // faithfully syncs up as a document the reader would take at face value.
          const chunks: Buffer[] = []
          for await (const c of part.file as any) {
            const chunk = c as Buffer
            bytes += chunk.length
            // Over the cap: stop ACCUMULATING but keep draining. Breaking out of a `for await` calls
            // return() on the iterator, which destroys the part stream — and req.parts() cannot advance
            // past a destroyed file, so the whole request stalls and the client gets no response at all
            // instead of a clean rejection. Draining costs the read we were doing anyway and ends the
            // part normally; `chunks` is released either way, so memory still stops growing at the cap.
            if (bytes > WATCH_ATTACH_MAX_BYTES) { tooBig = true; chunks.length = 0; continue }
            chunks.push(chunk)
          }
          if (tooBig || (part.file as any).truncated) {
            fileErrors.push({ filename: raw, reason: `larger than ${Math.round(WATCH_ATTACH_MAX_BYTES / 1024 / 1024)}MB` })
            continue
          }
          // The stored name is prefixed so two attachments with the same filename cannot collide inside
          // one entry, and so the id the client gets back is the filename on disk — no second index.
          const attachmentId = `${Date.now().toString(36)}-${safe.name}`
          const saved = saveAttachment(id, attachmentId, Buffer.concat(chunks))
          if (!saved.ok) { fileErrors.push({ filename: raw, reason: saved.error }); continue }
          added.push({ attachment_id: attachmentId, filename: safe.name, bytes: saved.bytes, added_at: new Date().toISOString(), added_by: user })
          continue
        }
        const up = await uploadToWatchlist(id, safe.name, part.file as any)
        // @fastify/multipart can TRUNCATE without throwing, so a "successful" upload of a truncated stream
        // must still be rejected — and the partial removed from Drive rather than left as a short PDF.
        if (tooBig || (part.file as any).truncated) {
          await deleteDriveFile(up.id)
          fileErrors.push({ filename: raw, reason: `larger than ${Math.round(WATCH_ATTACH_MAX_BYTES / 1024 / 1024)}MB` })
          continue
        }
        added.push({ attachment_id: up.id, filename: up.name, bytes, added_at: new Date().toISOString(), added_by: user })
      } catch (e: any) {
        // Drain the stream before the iterator can advance — a failure here (e.g. the Drive folder lookup
        // rejecting BEFORE files.create ever reads the body) can leave `part.file` unconsumed, and
        // req.parts() cannot move past an unread file stream. .resume() on an already-ended/destroyed
        // stream is a no-op, so this is safe to call unconditionally.
        part.file.resume()
        fileErrors.push({ filename: raw, reason: tooBig ? 'too large' : driveErrorMessage(e) })
      }
    }
  } catch (e: any) {
    fileErrors.push({ filename: '(upload)', reason: `the upload stopped early: ${String(e?.message || e)}` })
  }

  let pubError: string | undefined
  if (added.length) {
    // Re-read the LATEST persisted copy rather than mutating the one read at the top of this handler: the
    // uploads above can take a while, and if another request edited/archived/restored/detached from this
    // same row while they were in flight, writing back the stale in-memory `entry` would silently discard
    // that intervening mutation the moment the attachment metadata is saved. Not fully serialized against
    // a concurrent writer (there is no per-entry lock here), but this closes the common, slow-upload case.
    const fresh = readEntries().entries.find((e) => e.entry_id === id) ?? entry
    fresh.attachments = [...fresh.attachments, ...added]
    fresh.updated_at = new Date().toISOString()
    fresh.history = [...fresh.history, { at: fresh.updated_at, by: user, action: 'attached', detail: added.map((a) => a.filename).join(', ') }].slice(-50)
    writeEntry(fresh)
    entry.attachments = fresh.attachments
    entry.updated_at = fresh.updated_at
    entry.history = fresh.history
    // The PDFs themselves live in Drive, not git — only the entry's attachment METADATA (filename, Drive
    // id, size) is a watchlist/** data path.
    const pub = await publishWatchlist([watchlistEntryPath(entry.entry_id)], `Watchlist: attach files to ${entry.listing.ticker}`)
    pubError = pub.ok ? undefined : pub.error
  }
  return reply.code(added.length ? 201 : 400).send({ ok: added.length > 0, entry, fileErrors, publish_error: pubError })
})

app.get('/api/watchlist/:id/attachment/:attachmentId', { config: { rateLimit: { max: 300, timeWindow: '1 minute' } } }, async (req, reply) => {
  const id = String((req.params as any).id ?? '')
  const attachmentId = String((req.params as any).attachmentId ?? '')
  if (!isWatchId(id)) return reply.code(404).send({ error: 'not found' })
  const { entries } = readEntries()
  const entry = entries.find((e) => e.entry_id === id)
  // The id must be one this entry actually lists — that, not the string's shape, is the containment
  // barrier here: a Drive file id is only reachable if a record we wrote points at it.
  const att = entry?.attachments.find((a) => a.attachment_id === attachmentId)
  if (!att) return reply.code(404).send({ error: 'not found' })
  // Local mount first, matching the upload path. An attachment written to the mount has the stored
  // FILENAME as its id, so it is read straight back; one written through the API has a Drive file id and
  // is streamed. Trying the file first also means a row written before the API was configured keeps
  // working after it is, and vice versa — the id itself says which store holds it.
  const localPath = attachmentPath(id, attachmentId)
  const localBody = localPath ? readAttachment(id, attachmentId) : null
  let stream: import('node:stream').Readable | Buffer
  if (localBody) {
    stream = localBody
  } else {
    if (!GDRIVE_ENABLED) return reply.code(503).send({ error: 'attachments need either the Drive mount or the Drive API' })
    try { stream = await readWatchlistFile(attachmentId) } catch { return reply.code(502).send({ error: 'could not read the file' }) }
  }
  // The filename is rebuilt from validated data, never echoed.
  const safeName = `${entry!.listing.ticker.replace(/[^A-Za-z0-9._-]/g, '')}-${att.filename.replace(/[^A-Za-z0-9._-]/g, '')}`
  const isMd = /\.md$/i.test(att.filename)
  // A PDF is served INLINE so the browser's viewer opens it — a thesis you attached in order to READ is
  // not a file you want to re-download every time you glance at it. `attachment` was the original choice
  // because a user-supplied PDF can carry script and this origin holds the cockpit session.
  //
  // `Content-Security-Policy: sandbox` looks like the clean answer to that and is NOT usable here: Chrome
  // renders a PDF by generating an HTML wrapper that embeds it, and a sandboxed opaque origin blocks that
  // wrapper — so the browser silently falls back to downloading. Setting it would have kept the exact
  // behaviour it was meant to fix while reading as a fix. (chromium issue 40328564.)
  //
  // What actually carries the safety here: `nosniff` pins the declared type, the body is only ever a
  // stored `.pdf`, and both Chrome and Firefox run the PDF viewer in its own sandboxed process where a
  // document cannot reach this origin's DOM, cookies or session. The residual is a viewer-engine
  // vulnerability, which is the same exposure as opening the file from disk — not a new one this route
  // creates. Stated rather than papered over.
  //
  // Markdown keeps `attachment`: the panel fetches this body and renders it through react-markdown (no
  // rehype-raw, so embedded HTML is escaped). This header only governs a DIRECT navigation to the URL,
  // where downloading a .md is the safe and expected outcome.
  return reply
    .header('content-type', isMd ? 'text/plain; charset=utf-8' : 'application/pdf')
    .header('x-content-type-options', 'nosniff')
    .header('content-disposition', `${isMd ? 'attachment' : 'inline'}; filename="${safeName}"`)
    .header('cache-control', 'private, no-store')
    .send(stream)
})

app.delete('/api/watchlist/:id/attachment/:attachmentId', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const id = String((req.params as any).id ?? '')
  const attachmentId = String((req.params as any).attachmentId ?? '')
  if (!isWatchId(id)) return reply.code(400).send({ error: 'bad id' })
  const { entries } = readEntries()
  const entry = entries.find((e) => e.entry_id === id)
  if (!entry?.attachments.some((a) => a.attachment_id === attachmentId)) return reply.code(404).send({ error: 'not found' })
  const { user } = identify(req)
  // Strict, not best-effort: deleteDriveFile swallows every failure and resolves anyway, which used to
  // remove the entry's only record of the file — its Drive id — the instant Drive was unreachable or a
  // permission changed, leaving the PDF orphaned with no route left to find or remove it. Only drop the
  // metadata once the file is actually gone (or already gone — a 404 counts as removed).
  // A file on the mount is removed from the mount; only an API-stored one goes to the Drive API. Doing
  // both would ask Drive to delete an id that is really a filename.
  if (attachmentExists(id, attachmentId)) {
    if (!deleteAttachment(id, attachmentId)) {
      return reply.code(502).send({ error: 'could not remove the file from the Drive folder' })
    }
  } else {
    // Strict, not best-effort: deleteDriveFile swallows every failure and resolves anyway, which used to
    // remove the entry's only record of the file — its Drive id — the instant Drive was unreachable or a
    // permission changed, leaving the PDF orphaned with no route left to find or remove it. Only drop the
    // metadata once the file is actually gone (or already gone — a 404 counts as removed).
    try {
      await deleteDriveFileStrict(attachmentId)
    } catch (e: any) {
      return reply.code(502).send({ error: driveErrorMessage(e) })
    }
  }
  // The Drive operation above may take seconds. Re-enter the shared planning lock and re-read the row
  // before changing metadata so a task assignment completed while Drive was deleting cannot be replaced
  // by the stale copy captured at the start of this request.
  return withPlanningMutation(reply, async () => {
    const fresh = readEntries().entries.find((candidate) => candidate.entry_id === id)
    if (!fresh) return reply.code(404).send({ error: 'not found' })
    if (!fresh.attachments.some((attachment) => attachment.attachment_id === attachmentId)) {
      return { ok: true, entry: fresh }
    }
    fresh.attachments = fresh.attachments.filter((attachment) => attachment.attachment_id !== attachmentId)
    fresh.updated_at = new Date().toISOString()
    fresh.history = [...fresh.history, { at: fresh.updated_at, by: user, action: 'detached', detail: attachmentId }].slice(-50)
    writeEntry(fresh)
    const pub = await publishWatchlist([watchlistEntryPath(fresh.entry_id)], `Watchlist: detach file from ${fresh.listing.ticker}`)
    return { ok: true, entry: fresh, publish_error: pub.ok ? undefined : pub.error }
  })
})

// ---------- Tasks board ----------
// Human planning state, stored one card per file under watchlist/tasks. The Watch outcome is synchronized
// through syncTaskWatchlist(), so the Tasks board and Watchlist are two views over one final decision.
app.get('/api/tasks', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async () => {
  const read = readTasks()
  return {
    ...read,
    people: TASK_PEOPLE,
    attachments_enabled: watchlistFilesAvailable() || GDRIVE_ENABLED,
    as_of: new Date().toISOString(),
  }
})

async function taskEngineWatch(task: TaskCard) {
  if (task.stage !== 'final_decision' || task.decision !== 'watch' || !task.ticker) return []
  let timer: ReturnType<typeof setTimeout> | null = null
  let timedOut = false
  try {
    const work = standingCalls().then((calls) => timedOut ? [] : readEngineWatch(calls, readSizingDecoration())
      .filter((row) => row.listing.ticker === task.ticker))
    // Promise.race installs its own rejection handler, but keep an explicit boundary too: when the
    // timeout wins, a much later failed directory walk must never become process-level noise.
    void work.catch(() => undefined)
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => { timedOut = true; reject(new TaskEngineWatchTimeoutError()) }, TASK_ENGINE_WATCH_TIMEOUT_MS)
        timer.unref?.()
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function conflictingWatchTask(ticker: string | null, exceptTaskId: string | null = null): TaskCard | null {
  if (!ticker) return null
  return readTasks().tasks.find((candidate) => candidate.task_id !== exceptTaskId && candidate.ticker === ticker
    && candidate.stage === 'final_decision' && candidate.decision === 'watch') ?? null
}

app.post('/api/tasks', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const parsed = TaskBody.safeParse(req.body ?? {})
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const problem = taskOutcomeProblem(parsed.data.stage, parsed.data.decision ?? null)
  if (problem) return reply.code(400).send({ error: problem })
  const rawTicker = parsed.data.ticker?.trim() || ''
  const identity = taskTickerIdentity(rawTicker)
  const save = async () => {
    const { user } = identify(req)
    const at = new Date().toISOString()
    const task: TaskCard = {
      schema_version: 'task-card/v1', task_id: newTaskId(new Date()), scope: parsed.data.scope,
      ...identity, subject: parsed.data.subject, title: parsed.data.title,
      stage: parsed.data.stage, decision: parsed.data.stage === 'final_decision' ? parsed.data.decision ?? null : null,
      assignee: parsed.data.assignee, attachments: [], watchlist_entry_id: null, watchlist_created: false,
      history: [{ at, by: user, action: 'created', detail: parsed.data.stage }],
      created_at: at, created_by: user, updated_at: at,
    }
    if (task.decision === 'watch' && conflictingWatchTask(task.ticker)) {
      return reply.code(409).send({ error: `${task.ticker} already has a Final Decision · Watch task.` })
    }
    const engineMatches = await taskEngineWatch(task)
    if (engineMatches.length > 1) return reply.code(409).send({ error: `${task.ticker} maps to more than one listing. Add the exact security to Watchlist first.` })
    const watchSync = syncTaskWatchlist(task, user, undefined, engineMatches[0] ?? null)
    if (watchSync.problem) return reply.code(409).send({ error: watchSync.problem })
    writeTask(task)
    const paths = [taskPath(task.task_id), ...watchSync.changedEntries.map((entry) => watchlistEntryPath(entry.entry_id))]
    const pub = await publishWatchlist(paths, `Tasks: add ${taskTickerInput(task) || task.subject || task.task_id}`, TASK_UPDATE_PUBLISH_TIMEOUT_MS)
    return reply.code(201).send({ ok: true, task, publish_error: pub.ok ? undefined : pub.error })
  }
  // A normal task writes its own unique file and has no shared Watchlist state to reconcile. Do not let
  // an unrelated Watchlist publication reject the user's planning card (or the files queued behind it).
  const needsWatchlistMutation = parsed.data.stage === 'final_decision'
    && parsed.data.decision === 'watch' && !!identity.ticker
  return needsWatchlistMutation ? withPlanningMutation(reply, save) : save()
})

app.patch('/api/tasks/:id', { config: { rateLimit: { max: 240, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const id = String((req.params as any).id ?? '')
  if (!isTaskId(id)) return reply.code(400).send({ error: 'bad id' })
  const parsed = TaskBody.partial().safeParse(req.body ?? {})
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  return withPlanningMutation(reply, async () => {
    const task = readTasks().tasks.find((candidate) => candidate.task_id === id)
    if (!task) return reply.code(404).send({ error: 'not found' })
    const d = parsed.data
    const stage = d.stage ?? task.stage
    const decision = stage === 'final_decision'
      ? (d.decision !== undefined ? d.decision : task.decision)
      : null
    const problem = taskOutcomeProblem(stage, decision ?? null)
    if (problem) return reply.code(400).send({ error: problem })
    const rawTicker = d.ticker === undefined ? taskTickerInput(task) : d.ticker?.trim() || ''
    const identity = taskTickerIdentity(rawTicker)
    const ticker = identity.ticker
    const scope = d.scope ?? task.scope
    if (decision === 'watch' && conflictingWatchTask(ticker, task.task_id)) {
      return reply.code(409).send({ error: `${ticker} already has a Final Decision · Watch task.` })
    }
    const { user } = identify(req)
    const at = new Date().toISOString()
    const prior = { stage: task.stage, assignee: task.assignee, ticker: taskTickerInput(task) }
    task.scope = scope
    task.ticker = identity.ticker
    task.ticker_label = identity.ticker_label
    task.subject = d.subject ?? task.subject
    task.title = d.title ?? task.title
    task.stage = stage
    task.decision = decision ?? null
    task.assignee = d.assignee ?? task.assignee
    task.updated_at = at
    const event = prior.stage !== stage
      ? { action: 'moved', detail: `${prior.stage} → ${stage}${task.decision ? ` · ${task.decision}` : ''}` }
      : prior.assignee !== task.assignee
        ? { action: 'assigned', detail: `${prior.assignee} → ${task.assignee}` }
        : prior.ticker !== taskTickerInput(task)
          ? { action: 'retargeted', detail: `${prior.ticker || 'no ticker'} → ${taskTickerInput(task) || 'no ticker'}` }
          : { action: 'edited', detail: '' }
    task.history = [...task.history, { at, by: user, ...event }].slice(-50)
    const engineMatches = await taskEngineWatch(task)
    if (engineMatches.length > 1) return reply.code(409).send({ error: `${task.ticker} maps to more than one listing. Add the exact security to Watchlist first.` })
    const watchSync = syncTaskWatchlist(task, user, undefined, engineMatches[0] ?? null)
    if (watchSync.problem) return reply.code(409).send({ error: watchSync.problem })
    writeTask(task)
    const paths = [taskPath(task.task_id), ...watchSync.changedEntries.map((entry) => watchlistEntryPath(entry.entry_id))]
    // Card movement must not hold every later planning mutation behind a long git retry. The task is
    // already saved locally above; a publication timeout is returned explicitly as publish_error.
    const pub = await publishWatchlist(paths, `Tasks: update ${taskTickerInput(task) || task.subject || task.task_id}`, TASK_UPDATE_PUBLISH_TIMEOUT_MS)
    return { ok: true, task, publish_error: pub.ok ? undefined : pub.error }
  })
})

const TASK_ATTACH_RE = /\.(pdf|doc|docx|md)$/i
const TASK_ATTACH_MAX_BYTES = 25 * 1024 * 1024

app.post('/api/tasks/:id/attachments', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const id = String((req.params as any).id ?? '')
  if (!isTaskId(id)) return reply.code(400).send({ error: 'bad id' })
  return withPlanningMutation(reply, async () => {
  const task = readTasks().tasks.find((candidate) => candidate.task_id === id)
  if (!task) return reply.code(404).send({ error: 'not found' })
  const useLocal = watchlistFilesAvailable()
  if (!useLocal && !GDRIVE_ENABLED) return reply.code(503).send({ error: 'attachments need either the Drive mount or the Drive API' })
  const { user } = identify(req)
  const added: typeof task.attachments = []
  const fileErrors: { filename: string; reason: string }[] = []
  try {
    for await (const part of req.parts()) {
      if (part.type !== 'file') continue
      const raw = part.filename || 'file'
      if (task.attachments.length + added.length >= TASK_MAX_ATTACHMENTS) {
        part.file.resume(); fileErrors.push({ filename: raw, reason: `maximum ${TASK_MAX_ATTACHMENTS} files` }); continue
      }
      const safe = sanitizeUploadFilename(raw)
      if (!safe.ok) { part.file.resume(); fileErrors.push({ filename: raw, reason: safe.reason }); continue }
      if (!TASK_ATTACH_RE.test(safe.name)) {
        part.file.resume(); fileErrors.push({ filename: raw, reason: 'PDF, Word or Markdown only' }); continue
      }
      try {
        if (useLocal) {
          const chunks: Buffer[] = []
          let bytes = 0
          let tooBig = false
          for await (const chunk of part.file) {
            const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
            bytes += buf.length
            if (bytes > TASK_ATTACH_MAX_BYTES) { tooBig = true; chunks.length = 0; continue }
            chunks.push(buf)
          }
          if (tooBig || (part.file as any).truncated) {
            fileErrors.push({ filename: raw, reason: `larger than ${Math.round(TASK_ATTACH_MAX_BYTES / 1024 / 1024)}MB` }); continue
          }
          const attachmentId = `${Date.now().toString(36)}-${randomUUID().replace(/-/g, '').slice(0, 8)}-${safe.name}`
          const saved = saveAttachment(id, attachmentId, Buffer.concat(chunks))
          if (!saved.ok) { fileErrors.push({ filename: raw, reason: saved.error }); continue }
          added.push({ attachment_id: attachmentId, filename: safe.name, bytes: saved.bytes, added_at: new Date().toISOString(), added_by: user })
        } else {
          let bytes = 0
          let tooBig = false
          const tracker = new Transform({
            transform(chunk, _encoding, callback) {
              bytes += chunk.length
              if (bytes > TASK_ATTACH_MAX_BYTES) { tooBig = true; callback(new Error('too large')); return }
              callback(null, chunk)
            },
          })
          part.file.on('error', (error) => tracker.destroy(error))
          const ext = path.extname(safe.name).toLowerCase()
          const mime = ext === '.pdf' ? 'application/pdf' : ext === '.md' ? 'text/markdown'
            : ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/msword'
          const up = await uploadToWatchlist(id, safe.name, part.file.pipe(tracker) as any, mime)
          if (tooBig || (part.file as any).truncated) {
            await deleteDriveFileStrict(up.id)
            fileErrors.push({ filename: raw, reason: `larger than ${Math.round(TASK_ATTACH_MAX_BYTES / 1024 / 1024)}MB` }); continue
          }
          added.push({ attachment_id: up.id, filename: up.name, bytes, added_at: new Date().toISOString(), added_by: user })
        }
      } catch (error: any) {
        part.file.resume()
        fileErrors.push({ filename: raw, reason: String(error?.message) === 'too large'
          ? `larger than ${Math.round(TASK_ATTACH_MAX_BYTES / 1024 / 1024)}MB`
          : driveErrorMessage(error) })
      }
    }
  } catch (error: any) {
    fileErrors.push({ filename: '(upload)', reason: String(error?.message || error) })
  }
  let publishError: string | undefined
  if (added.length) {
    const fresh = readTasks().tasks.find((candidate) => candidate.task_id === id) ?? task
    fresh.attachments = [...fresh.attachments, ...added]
    fresh.updated_at = new Date().toISOString()
    fresh.history = [...fresh.history, { at: fresh.updated_at, by: user, action: 'attached', detail: added.map((a) => a.filename).join(', ') }].slice(-50)
    writeTask(fresh)
    const pub = await publishWatchlist(
      [taskPath(fresh.task_id)],
      `Tasks: attach files to ${taskTickerInput(fresh) || fresh.subject || fresh.task_id}`,
      TASK_UPDATE_PUBLISH_TIMEOUT_MS,
    )
    publishError = pub.ok ? undefined : pub.error
  }
  return reply.code(added.length ? 201 : 400).send({ ok: added.length > 0, task: { ...task, attachments: [...task.attachments, ...added] }, fileErrors, publish_error: publishError })
  })
})

app.get('/api/tasks/:id/attachment/:attachmentId', { config: { rateLimit: { max: 300, timeWindow: '1 minute' } } }, async (req, reply) => {
  const id = String((req.params as any).id ?? '')
  const attachmentId = String((req.params as any).attachmentId ?? '')
  if (!isTaskId(id)) return reply.code(404).send({ error: 'not found' })
  const task = readTasks().tasks.find((candidate) => candidate.task_id === id)
  const attachment = task?.attachments.find((candidate) => candidate.attachment_id === attachmentId)
  if (!attachment) return reply.code(404).send({ error: 'not found' })
  const local = attachmentPath(id, attachmentId) ? readAttachment(id, attachmentId) : null
  let stream: import('node:stream').Readable | Buffer
  if (local) stream = local
  else {
    if (!GDRIVE_ENABLED) return reply.code(503).send({ error: 'attachments need either the Drive mount or the Drive API' })
    try { stream = await readWatchlistFile(attachmentId) } catch { return reply.code(502).send({ error: 'could not read the file' }) }
  }
  const ext = path.extname(attachment.filename).toLowerCase()
  const contentType = ext === '.pdf' ? 'application/pdf'
    : ext === '.md' ? 'text/plain; charset=utf-8'
      : ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/msword'
  const disposition = ext === '.pdf' ? 'inline' : 'attachment'
  const filename = attachment.filename.replace(/[^A-Za-z0-9._-]/g, '') || `attachment${ext}`
  return reply.header('content-type', contentType).header('x-content-type-options', 'nosniff')
    .header('content-disposition', `${disposition}; filename="${filename}"`).header('cache-control', 'private, no-store').send(stream)
})

app.delete('/api/tasks/:id/attachment/:attachmentId', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const id = String((req.params as any).id ?? '')
  const attachmentId = String((req.params as any).attachmentId ?? '')
  if (!isTaskId(id)) return reply.code(400).send({ error: 'bad id' })
  return withPlanningMutation(reply, async () => {
  const task = readTasks().tasks.find((candidate) => candidate.task_id === id)
  if (!task?.attachments.some((attachment) => attachment.attachment_id === attachmentId)) return reply.code(404).send({ error: 'not found' })
  if (attachmentExists(id, attachmentId)) {
    if (!deleteAttachment(id, attachmentId)) return reply.code(502).send({ error: 'could not remove the file' })
  } else {
    try { await deleteDriveFileStrict(attachmentId) } catch (error: any) { return reply.code(502).send({ error: driveErrorMessage(error) }) }
  }
  const { user } = identify(req)
  task.attachments = task.attachments.filter((attachment) => attachment.attachment_id !== attachmentId)
  task.updated_at = new Date().toISOString()
  task.history = [...task.history, { at: task.updated_at, by: user, action: 'detached', detail: attachmentId }].slice(-50)
  writeTask(task)
  const pub = await publishWatchlist([taskPath(task.task_id)], `Tasks: detach file from ${task.ticker || task.subject}`)
  return { ok: true, task, publish_error: pub.ok ? undefined : pub.error }
  })
})

app.get('/api/output/run', async (req, reply) => {
  const r = resolveOutputRun(req.query as any)
  if (r.unknownSwarm) return reply.code(404).send({ error: 'unknown swarm' })
  if (r.badSubject) return reply.code(400).send({ error: 'subject required' })
  if (!r.runRoot) return reply.code(404).send({ error: 'no run found' })
  try {
    return runManifest(r.runRoot, r.resolve, r.swarm !== 'research' ? terminalModuleName(r.swarm) : null)
  } catch (e: any) {
    return reply.code(400).send({ error: 'cannot read run', detail: String(e?.message || e) })
  }
})

// ---------- valuation Playground (levers) ----------
// GET the machine-readable valuation levers a run emitted (valuation_summary.json) + the frozen scenario
// OUTPUTS from decision_record.json (probabilities + returns) + any saved what-if overrides. The recompute
// is client-side (ui/web/src/lib/valuationLevers.ts, a mirror of scripts/valuation_math.py); this endpoint
// only serves the baseline. Reuses resolveOutputRun so a bare ticker resolves to its standing run.
app.get('/api/valuation-levers', async (req, reply) => {
  const r = resolveOutputRun(req.query as any)
  if (r.unknownSwarm) return reply.code(404).send({ error: 'unknown swarm' })
  if (r.badSubject) return reply.code(400).send({ error: 'subject required' })
  if (!r.runRoot) return reply.code(404).send({ error: 'no run found' })
  const levers = readValuationSummary(r.runRoot, r.resolve)
  let decision: any = null
  try { decision = readDecision(r.runRoot, r.resolve) } catch { /* no decision_record yet */ }
  const num = (v: any): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
  const dec = decision
    ? {
        scenarios: Array.isArray(decision.scenarios) ? decision.scenarios : [],
        // THE POSITION. Scenario returns are position-signed (synthesizer.md §6), so the Playground cannot
        // compute a short's returns without it — the long formula flips every sign. `basket` is the
        // documented decision->position key (frameworks/DECISION_LEDGER.md §3: Short Candidate -> "Short").
        basket: typeof decision.basket === 'string' ? decision.basket : null,
        entry_price: num(decision.entry_price),
        entry_price_timestamp: decision.entry_price_timestamp ?? null,
        currency: decision.currency ?? null,
        expected_return_pct: num(decision.expected_return_pct),
        margin_of_safety_pct: num(decision.margin_of_safety_pct),
        downside_risk_pct: num(decision.downside_risk_pct),
      }
    : null
  if (!levers && !dec) return reply.code(404).send({ error: 'no valuation levers or decision_record for this run' })
  return { runRoot: r.runRoot, levers, decision: dec, overrides: readOverrides(r.runRoot) }
})

// Persist a what-if override + the reason (an append-only, gitignored judgment ledger — not a change to the
// frozen run). runRoot is confined to analyses/ so a request can never steer a write elsewhere.
const ValuationOverrideBody = z.object({
  runRoot: z.string().min(1).max(300),
  reason: z.string().max(4000).optional(),
  overrides: z.record(z.any()).optional(),
  levels: z.record(z.number()).optional(),
}).strip()
app.post('/api/valuation-levers/override', { config: { rateLimit: { max: 200, timeWindow: '1 minute' } } }, async (req, reply) => {
  const parsed = ValuationOverrideBody.safeParse(req.body ?? {})
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const runRoot = parsed.data.runRoot.replace(/^\/+/, '')
  if (!/^analyses\/[A-Za-z0-9._-]+$/.test(runRoot)) return reply.code(400).send({ error: 'runRoot must be a single analyses/<run> folder' })
  const rec = appendOverride({ run_root: runRoot, reason: parsed.data.reason ?? '', overrides: parsed.data.overrides ?? {}, levels: parsed.data.levels ?? null })
  return { ok: true, override: rec, overrides: readOverrides(runRoot) }
})

// ---------- chat with your data (closed-book Q&A over a run's synthesized output) ----------
async function retrieveNewsForAsk(window: '24h' | '7d' | 'history', question: string, signal: AbortSignal) {
  const semanticResult = await searchSemanticIndex({
    stateDir: STATE_DIR,
    query: question,
    namedAnchors: newsSemanticNamedAnchors(question),
    config: {
      enabled: NEWS.retrievalEmbeddingEnabled,
      apiKey: NEWS.retrievalEmbeddingApiKey,
      baseUrl: NEWS.retrievalEmbeddingBaseUrl,
      model: NEWS.retrievalEmbeddingModel,
      timeoutMs: NEWS.retrievalEmbeddingTimeoutMs,
      batchSize: NEWS.retrievalEmbeddingBatchSize,
      maxItemsPerCycle: NEWS.retrievalEmbeddingMaxItemsPerCycle,
    },
    signal,
  })
  let assembled = await assembleNewsChatContext({
    repoRoot: REPO_ROOT,
    archiveDir: NEWS.newsArchiveDir,
    enrichCacheFile: path.join(STATE_DIR, 'news-enrich-cache.json'),
    window,
    question,
    sourceReport: buildSourcesReport(REPO_ROOT, STATE_DIR),
    semanticResult,
    signal,
  })
  const reranked = await rerankCandidates({
    query: question,
    candidates: assembled.evidence.map((e: any) => ({
      id: e.ref,
      text: [e.item.headline_en || e.item.headline, e.item.snippet, ...(e.item.companies || []).flatMap((c: any) => [c.name, c.ticker || '']), ...(e.whyMatched || [])].filter(Boolean).join(' '),
    })),
    config: {
      enabled: NEWS.retrievalRerankEnabled,
      apiKey: NEWS.retrievalRerankApiKey,
      baseUrl: NEWS.retrievalRerankBaseUrl,
      model: NEWS.retrievalRerankModel,
      timeoutMs: NEWS.retrievalRerankTimeoutMs,
      maxCandidates: NEWS.retrievalRerankMaxCandidates,
    },
    signal,
  })
  assembled = applyNewsRerank(assembled, reranked)
  return assembled
}

// Which scopes are present (chat-able) vs not-yet-run, so the panel can disable + annotate "run first".
app.get('/api/chat/scopes', async (req, reply) => {
  const q = req.query as any
  // constellation swarm (e.g. commodity): resolve the subject's single run folder from the manifest
  const swarm = q?.swarm as string | undefined
  if (swarm && swarm !== 'research') {
    if (!listSwarms().some((s) => s.id === swarm)) return reply.code(404).send({ error: `unknown swarm ${swarm}` })
    const subject = (q?.subject || q?.ticker) as string
    // a subject is either a ticker (research/commodity) or a screener SIG id — accept both (same as /api/swarm)
    if (!subject || !(TICKER_RE.test(subject) || SIG_RE.test(subject))) return reply.code(400).send({ error: 'subject required' })
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
    return scopeAvailability(ticker, resolveRunRoot({ ticker, preferComplete: true }))
  } catch (e: any) {
    return reply.code(400).send({ error: 'cannot read scopes', detail: String(e?.message || e) })
  }
})

// One durable chat turn. The client resends a bounded recent transcript for model context; the server keeps
// the complete saved conversation and searches the user's other durable conversations as working memory.
// Streams Server-Sent-Events in the POST response body: chat-meta (what we're answering from), then live
// progress — chat-status {stage: starting|connected|thinking|writing} at each REAL lifecycle event and
// chat-thinking per reasoning delta (the model's own thought process) — then chat-token per answer delta,
// then a terminal chat-done {costUsd} or chat-error {message}.
const ChatBody = z.object({
  ticker: z.string().regex(TICKER_RE).optional(),
  runRoot: z.string().max(300).optional(),
  // a non-research swarm resolves its run folder from (swarm, subject); the subject is a ticker
  // (commodity) or a screener SIG id — accept either shape.
  swarm: z.string().regex(/^[a-z0-9-]{1,40}$/).optional(),
  subject: z.string().refine((s) => TICKER_RE.test(s) || SIG_RE.test(s), 'subject must be a ticker or SIG id').optional(),
  scope: z.enum(['run', 'module', 'orb']),
  module: z.string().regex(MODULE_RE).optional(),
  orbPath: z.string().max(300).optional(),
  model: z.string().max(60).optional(),
  style: z.enum(['simple', 'analyst', 'detailed']).optional(),
  // Auto is the normal path. The two explicit values are optional user overrides inside the drawer; the
  // top-level Ask button never makes the user choose an evidence book before asking the question.
  memoryMode: z.enum(['auto', 'run', 'news']).optional(),
  // chat-history persistence: an echoed conversation id attaches this turn to an existing saved thread
  // (server mints a fresh one when absent/unknown); orbKey + title let a saved orb conversation be reopened.
  conversationId: z.string().max(80).optional(),
  turnId: z.string().max(110).refine(isValidTurnId, 'invalid chat turn id').optional(),
  orbKey: z.string().max(200).optional(),
  title: z.string().max(300).optional(),
  // `computed` remains accepted for deploy-skew/display compatibility, but is NEVER an authority: a client
  // can forge its request body. Numberless scenario follow-ups load figures from the user-scoped immutable
  // turn receipt after matching this echo to the conversation's adjacent durable assistant turn.
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']), content: z.string().max(20000),
    turnId: z.string().max(110).refine(isValidTurnId, 'invalid message turn id').optional(),
    computed: z.array(z.record(z.string(), z.unknown())).max(6).optional(),
  })).min(1).max(40),
})
app.get('/api/chat/models', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async () => (
  publicChatModelCatalogue(CHAT.allowedModels, CHAT.defaultModel)
))
app.post('/api/chat', async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  const parsed = ChatBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid chat request', detail: parsed.error.issues?.[0]?.message })
  const { scope, module, orbPath, messages } = parsed.data
  const modelChoice = resolveChatRequestModel(parsed.data.model, CHAT.allowedModels, CHAT.defaultModel)
  if (!modelChoice) return reply.code(400).send({ error: 'that Ask model is not supported or allowed — choose another model' })
  const model = modelChoice.id
  const swarmId = parsed.data.swarm && parsed.data.swarm !== 'research' ? parsed.data.swarm : 'research'

  const last = messages[messages.length - 1]
  if (last.role !== 'user' || !last.content.trim()) return reply.code(400).send({ error: 'the last message must be a non-empty user question' })
  const { user: chatUser, userVia } = identify(req)

  const replayCompletedTurn = (completed: NonNullable<ReturnType<typeof findCompletedTurnForUser>>) => {
    if (completed.userMessage.content !== last.content) {
      return reply.code(409).send({ error: 'chat turn id was already used for a different question' })
    }
    const { res, send, ping } = startSSE(reply)
    try {
      send({
        type: 'chat-meta',
        conversationId: completed.conversation.id,
        scopeResolved: completed.conversation.title,
        sourcePath: completed.assistantMessage.sourcePath,
        memory: completed.assistantMessage.memory,
        recovered: true,
      })
      if (completed.assistantMessage.thinking) send({ type: 'chat-thinking', content: completed.assistantMessage.thinking })
      for (const payload of completed.assistantMessage.computed || []) send({ type: 'chat-computed', payload })
      send({ type: 'chat-token', content: completed.assistantMessage.content })
      send({ type: 'chat-done', costUsd: 0, model: completed.conversation.model, recovered: true })
    } finally {
      clearInterval(ping)
      try { res.end() } catch { /* already closed */ }
    }
  }

  // Resolve the run root and confine reads to it (orbPath is re-validated against the manifest inside
  // assembleContext, so a request-supplied path can never read outside this run). Research resolves the
  // latest analyses/<TICKER>_* run; a constellation swarm resolves its subject's single run folder.
  let runRoot: string | null
  let subject: string
  if (swarmId !== 'research') {
    if (!listSwarms().some((s) => s.id === swarmId)) return reply.code(404).send({ error: `unknown swarm ${swarmId}` })
    const subj = parsed.data.subject || parsed.data.ticker
    if (!subj || !(TICKER_RE.test(subj) || SIG_RE.test(subj))) return reply.code(400).send({ error: 'subject required for this swarm' })
    const abs = findRunRootForSubject(swarmId, subj)
    runRoot = abs ? path.relative(REPO_ROOT, abs) : null
    subject = subj
  } else {
    runRoot = resolveRunRoot({ runRoot: parsed.data.runRoot, ticker: parsed.data.ticker, preferComplete: true })
    subject = parsed.data.ticker || (runRoot ? runRoot.replace(/^analyses\//, '').replace(/_\d{4}-\d{2}-\d{2}$/, '') : '')
  }
  if (!runRoot) return reply.code(404).send({ error: 'no run found for this subject yet — run the engine first' })
  const matchesCurrentChatContext = (conversation: {
    swarm: string; subject: string; scope: string; module?: string; orbKey?: string; orbPath?: string
  }) => {
    if (conversation.swarm !== swarmId || conversation.subject !== subject || conversation.scope !== scope) return false
    if (scope === 'module' && (conversation.module ?? '') !== (module ?? '')) return false
    if (scope === 'orb') {
      if (conversation.orbKey || parsed.data.orbKey) {
        return Boolean(conversation.orbKey && parsed.data.orbKey && conversation.orbKey === parsed.data.orbKey)
      }
      return (conversation.orbPath ?? '') === (orbPath ?? '')
    }
    return true
  }

  // Idempotent retry/reconciliation: the answer may already be durable even when the browser missed the
  // terminal SSE frame. A turn id is user-scoped but not globally tied to the currently selected company,
  // so resolve and match that context before replay. A stale Retry from another ticker/module/orb must fail
  // closed instead of leaking its old answer into the newly selected panel.
  if (parsed.data.turnId) {
    const completed = findCompletedTurnForUser(parsed.data.turnId, chatUser)
    if (completed) {
      if (!matchesCurrentChatContext(completed.conversation)) {
        return reply.code(409).send({ error: 'chat turn belongs to a different subject or scope' })
      }
      return replayCompletedTurn(completed)
    }
  }
  if (chatTurnsInFlight() >= CHAT.maxConcurrent) return reply.code(429).send({ error: 'chat is busy — try again in a moment' })

  // Bind both request and response lifecycle before the first await, including a snapshot of sockets that
  // vanished just before registration. This is the same proven two-sided guard used by news chat.
  const requestAbort = bindNewsChatRequestAbort(req.raw, reply.raw)
  const ac = requestAbort.controller
  let closed = ac.signal.aborted
  let ping: ReturnType<typeof setInterval> | null = null
  let pendingSavedQuestion: UserMessageRollback | null = null
  let rollbackPromise: Promise<boolean> | null = null
  const rollbackCanceledQuestion = async () => {
    const pending = pendingSavedQuestion
    if (!pending) { if (rollbackPromise) await rollbackPromise; return }
    pendingSavedQuestion = null
    rollbackPromise = rollbackUserMessage(pending).catch(() => false)
    await rollbackPromise
  }
  const onAbort = () => {
    closed = true
    if (ping) clearInterval(ping)
    // Discard the in-memory reservation immediately; do not wait for a slow model process to acknowledge abort.
    void rollbackCanceledQuestion()
  }
  ac.signal.addEventListener('abort', onAbort, { once: true })
  if (ac.signal.aborted) onAbort()

  // The git-history delta for the SAME runRoot the context is built from — never re-resolved from the
  // subject, or this block would describe a different run than every other piece. Run scope only: an
  // orb/module question is not a run-level question. Awaited HERE, in the already-async handler, so
  // assembleContext stays sync and execFileSync never touches the loop serving the SSE streams.
  // `.catch(() => null)` — a git failure degrades to today's honest refusal, never a 500.
  const wc =
    swarmId === RESEARCH_SWARM_ID && scope === 'run'
      ? await readWhatChanged({ runRoot }).catch(() => null)
      : null
  if (closed) { requestAbort.dispose(); return }

  let assembled
  try {
    assembled = assembleContext({
      scope, runRoot, module, orbPath, swarmId,
      question: last.content,
      whatChanged: wc ? { markdown: whatChangedMarkdown(wc) } : null,
    })
  } catch (e: any) {
    requestAbort.dispose()
    return reply.code(400).send({ error: 'cannot assemble context', detail: String(e?.message || e) })
  }
  if (!assembled.present) { requestAbort.dispose(); return reply.code(409).send({ error: 'not_run', hint: assembled.missingHint }) }

  // One Ask brain, several shelves. Existing durable transcripts are searched directly, so the user's full
  // History becomes useful immediately without a backfill job. News retrieval is automatic for Screener
  // signals and freshness questions; a research-only question avoids the extra retrieval work.
  const memoryRoute = routeAskMemory(last.content, swarmId, parsed.data.memoryMode)
  // A Screener user naturally asks "does this change the call?" without repeating the company/headline.
  // Anchor retrieval with the selected signal's authoritative ledger label; otherwise a generic question
  // could search the whole wire and surface an unrelated top story.
  const signalMemoryAnchor = swarmId === 'screener' ? screenerSubjectLabels().get(subject) : undefined
  const memoryQuestion = signalMemoryAnchor ? `${signalMemoryAnchor}\n${last.content}` : last.content
  const memory: AskMemoryPromptContext = {
    route: memoryRoute,
    priorChats: memoryRoute.useHistory ? searchConversationMemory({
      user: chatUser,
      question: memoryQuestion,
      subject,
      swarm: swarmId,
      excludeId: parsed.data.conversationId,
      limit: 4,
      allowSubjectOnly: memoryRoute.historyIntent,
    }) : [],
  }
  if (memoryRoute.useNews && !ac.signal.aborted) {
    try {
      const news = await retrieveNewsForAsk('7d', memoryQuestion, ac.signal)
      if (news.present) memory.news = news
    } catch {
      // Memory shelves are additive. A wire/index failure must not take the frozen research answer down;
      // the receipt simply omits that shelf instead of pretending it was used.
    }
  }
  // The Calls ledger is equity-only. Commodity and future swarms own separate decision ledgers, so a
  // shared symbol such as GOLD must never inject a Barrick equity call into a commodity answer.
  if (!ac.signal.aborted && swarmById(swarmId)?.decisionMemory === 'equity_calls') {
    try {
      const projection = await listAllCalls()
      const identifiers = [subject, signalMemoryAnchor || '']
      const matched = selectCallMemories(projection.calls, identifiers)
      if (matched.length) memory.calls = matched
    } catch {
      // The call ledger is an additive shelf. If its published Git authority is briefly unavailable,
      // the existing research/news answer still works and the receipt honestly omits decision memory.
    }
  }
  if (closed || ac.signal.aborted) { requestAbort.dispose(); return }

  // Reserve this turn under the authoritative identity (from Cloudflare Access, NOT the body). The resolved
  // id is echoed in chat-meta so later turns attach here; the question + answer reach History together only
  // on clean completion. History remains best-effort and can never break the answer.
  let conversationId = isValidConversationId(parsed.data.conversationId) ? parsed.data.conversationId : undefined
  try {
    const recorded = await recordPendingUserMessage(
      { user: chatUser, userVia, swarm: swarmId, subject, scope, module, orbPath: parsed.data.orbPath, orbKey: parsed.data.orbKey, runRoot, title: parsed.data.title || assembled.label, model, style: parsed.data.style },
      last.content,
      conversationId,
      parsed.data.turnId,
    )
    // The fast-path lookup above can race a just-finishing request. Admission is authoritative: its
    // completed-or-pending decision is atomic with the in-memory reservation, so a committed id can never
    // escape this branch and launch another paid model turn.
    if (recorded.status === 'completed') {
      ac.signal.removeEventListener('abort', onAbort)
      requestAbort.dispose()
      if (closed) return
      if (!matchesCurrentChatContext(recorded.completed.conversation)) {
        return reply.code(409).send({ error: 'chat turn belongs to a different subject or scope' })
      }
      return replayCompletedTurn(recorded.completed)
    }
    const convo = recorded.conversation
    conversationId = convo.id
    pendingSavedQuestion = recorded.rollback
  } catch (error) {
    // A duplicate in-flight id is not a best-effort History failure: launching another model call would
    // defeat the idempotency contract. The original request will either commit or release its reservation.
    if (error instanceof ChatTurnReservationError) {
      requestAbort.dispose()
      const status = error.code === 'CONVERSATION_BUSY' ? 503
        : error.code === 'TURN_ALREADY_PENDING' || error.code === 'TURN_CONTEXT_MISMATCH' ? 409
          : 400
      return reply.code(status).send({ error: error.message, code: error.code })
    }
    // A modern client supplied an idempotency key, so ANY failure to establish its durable admission guard
    // must stop here. Falling through would launch paid, untracked work that an exact Retry could duplicate.
    // Only legacy clients with no turn id retain the old best-effort History behavior.
    if (parsed.data.turnId) {
      requestAbort.dispose()
      return reply.code(503).send({ error: 'could not reserve this chat turn safely — retry in a moment', code: 'TURN_RESERVATION_FAILED' })
    }
    // Ordinary History I/O remains best-effort: it must never prevent the user from getting an answer.
  }
  if (closed) { await rollbackCanceledQuestion(); requestAbort.dispose(); return }

  // Hijack into an SSE stream for the answer.
  const sse = startSSE(reply)
  const { res, send } = sse
  ping = sse.ping
  const memoryReceipt = askMemoryMeta(swarmId === 'screener' ? 'current signal' : 'current research', memory)
  send({
    type: 'chat-meta', conversationId, scopeResolved: assembled.label, sourcePath: assembled.sourcePath,
    degraded: assembled.degraded, degradeNote: assembled.degradeNote,
    memory: memoryReceipt,
  })
  // Deterministic what-if modeling: when the question is a quantified what-if AND this run recorded the
  // sensitivity coefficients, compute the scenario with the engine (scripts/sensitivity_math.py) and both
  // (a) stream it as a chat-computed card and (b) inject it as an authoritative COMPUTED SCENARIO block so
  // the model narrates a number it did not calculate (CLAUDE.md §15/§20). Best-effort: any failure — no
  // sidecar, an unparseable move, no python3 — degrades to a normal closed-book answer, never a 500.
  let computedBlock: string | undefined
  const computedPayloads: unknown[] = []
  let parserCostUsd = 0 // the what-if parse's cost — folded into the turn's reported/persisted cost
  try {
    if (detectWhatIf(last.content)) {
      const loaded = loadSidecar(runRoot)
      if (loaded) {
        // 'modeling' covers the whole parse→compute span; runs without a sidecar never reach here (no flicker).
        send({ type: 'chat-status', stage: 'modeling' })
        // The PARSE: a small constrained call on the SAME model the panel picked for this turn — thinking
        // off, a tight timeout, and its OWN small $ ceiling (never a second full turn budget). The model
        // only interprets; validateIntents rejects anything it invents; the engine computes. Its cost is
        // captured and folded into the turn's reported/persisted cost below.
        const parserCall = async (system: string, user: string) => {
          let out = ''
          const r = await runChatTurn({
            system, user, model, signal: ac.signal,
            timeoutMs: CHAT.parserTimeoutMs, thinkingTokens: 0, budgetUsd: CHAT.parserBudgetUsd,
            onToken: (t) => { out += t },
          })
          parserCostUsd += r.costUsd || 0
          return r.error ? null : out
        }
        const pr = await parseWhatIf(last.content, loaded.sidecar, parserCall)
        const v = pr ? validateIntents(pr, last.content, loaded.sidecar) : null
        if (v?.plans.length) {
          // a joint ask computes each leg SEPARATELY (they don't simply add) — one card per variable
          const blocks: string[] = []
          for (const pl of v.plans) {
            if (closed || ac.signal.aborted) break
            const scenario = await computePlan(loaded.sidecar, pl, ac.signal)
            if (closed || ac.signal.aborted) break
            if (!scenario) continue
            if (blocks.length === 0) {
              // honest coverage notes ride the FIRST card: joint asks are computed per-leg, and any valid
              // ask beyond the per-turn cap is SAID, never silently dropped (Codex #335 r3643707266)
              const noteParts: string[] = []
              if (v.plans.length > 1) noteParts.push(`${v.plans.length} variables — shown separately; they don't simply add (FX also carries a separate one-off).`)
              if (v.omitted > 0) noteParts.push(`${v.omitted} more asked variable${v.omitted === 1 ? '' : 's'} beyond the ${v.plans.length} computed here — ask ${v.omitted === 1 ? 'it' : 'them'} separately.`)
              if (noteParts.length) scenario.note = noteParts.join(' ')
            }
            if (pr!.periodNote) { scenario.periodNote = true; scenario.periodBase = loaded.sidecar.base_period ?? null }
            // THE SECOND HOP: push the new base-metric value through each case's own valuation levers, so
            // "…and what would the target change be?" is answered in the same block instead of coming back
            // not-in-context. Always attempted when the metric moved. Best-effort: no valuation sidecar, no
            // python3, a metric mismatch → the section is omitted or states plainly that it is not derivable.
            // Never estimated. metricLabel strengthens the engine's own metric-identity gate beyond numeric
            // proximity alone (Codex #371 P1) — the sensitivity row's own impact metric name.
            let reprice = null as Awaited<ReturnType<typeof repriceFromMetric>>
            try {
              const vsc = readValuationSummary(runRoot)
              if (vsc && typeof scenario.newValue === 'number') {
                let dec: any = null
                try { dec = readDecision(runRoot) } catch { /* a partial run has no frozen thesis */ }
                reprice = await repriceFromMetric({
                  valuationSidecar: vsc, decision: dec, newMetric: scenario.newValue,
                  baseMetric: scenario.baseValue ?? null,
                  direction: dec?.basket === 'Short' ? 'short' : 'long',
                  metricLabel: scenario.impactMetric ?? null,
                  signal: ac.signal,
                })
              }
            } catch { /* the driver half still stands on its own */ }
            if (closed || ac.signal.aborted) break
            const payload = { kind: 'scenario' as const, asked: last.content, scenario, reprice }
            computedPayloads.push(payload)
            send({ type: 'chat-computed', payload })
            blocks.push(computedContextBlock(payload))
          }
          if (blocks.length) computedBlock = blocks.join('\n\n───\n\n')
        } else if (v?.refusal) {
          // an honest refusal card (unrecorded variable, or a target the sidecar can't support) — never a number
          const payload = { kind: 'unsupported' as const, asked: last.content, recorded: recordedList(loaded.sidecar), reason: v.refusal }
          computedPayloads.push(payload)
          send({ type: 'chat-computed', payload }); computedBlock = computedContextBlock(payload)
        }
        // pr null (parse failed/CLI absent) or no plans+no refusal → normal closed-book answer, no card
      }
    } else if (isNumberlessTargetFollowUp(last.content)) {
      // "…and what would the price upside or target change be?" — the PR's own headline example, and it has
      // NO number of its own: detectWhatIf's gate above requires one (it is the gate for parsing a NEW
      // driver move). The prompt serializes only message prose, so unless the model happened to restate every
      // figure in its own prior answer, this closed-book follow-up had NOTHING deterministic to use. Resolve
      // it against the immediately prior authenticated turn's already-computed scenario. The client's echoed
      // card is deliberately ignored: History proves adjacency and the immutable user-scoped receipt supplies every
      // number/citation, so a forged request body can never be relabelled as engine output.
      const durableConversation = conversationId ? getConversation(conversationId) : null
      const durableLast = durableConversation && matchesCurrentChatContext(durableConversation)
        ? durableConversation.messages.at(-1)
        : undefined
      const prior = resolveAuthenticatedPriorScenario(
        messages.slice(0, -1),
        conversationId,
        durableLast,
        (turnId) => {
          const completed = findCompletedTurnForUser(turnId, chatUser)
          return completed && matchesCurrentChatContext(completed.conversation) ? {
            conversationId: completed.conversation.id,
            turnId,
            assistantMessage: {
              content: completed.assistantMessage.content,
              computed: completed.assistantMessage.computed,
            },
          } : null
        },
      )
      if (prior) {
        send({ type: 'chat-status', stage: 'modeling' })
        const payload = { ...prior, asked: last.content }
        computedPayloads.push(payload)
        send({ type: 'chat-computed', payload })
        computedBlock = computedContextBlock(payload, { carriedForward: true })
      }
      // no prior computed turn found → normal closed-book answer (the model may still recall from prose)
    }
  } catch { /* any what-if failure degrades to a normal closed-book answer, never a 500 */ }
  if (closed || ac.signal.aborted) {
    await rollbackCanceledQuestion()
    if (ping) clearInterval(ping)
    try { res.end() } catch { /* already closed */ }
    ac.signal.removeEventListener('abort', onAbort)
    requestAbort.dispose()
    return
  }
  const { system, user } = buildChatPrompts({ assembled, messages, subject, style: parsed.data.style, computedBlock, memory })
  // Live progress for the panel's working state. Every chat-status stage maps to a REAL event (spawn /
  // CLI init / thinking block / first text block — see ChatTurnSignal in chat-llm.ts), and chat-thinking
  // streams the model's own reasoning verbatim so the user can read the thought process while waiting.
  send({ type: 'chat-status', stage: 'starting' })
  let answer = '' // accumulate the streamed answer so the completed turn can be saved to history
  let thinking = '' // accumulate the reasoning so the saved turn keeps its thought process too
  try {
    const out = await runChatTurn({
      system, user, model, signal: ac.signal,
      onToken: (t) => { answer += t; send({ type: 'chat-token', content: t }) },
      onSignal: (s) => {
        if (s.kind === 'ready') send({ type: 'chat-status', stage: 'connected', model: s.model })
        else if (s.kind === 'thinking-start') send({ type: 'chat-status', stage: 'thinking' })
        else if (s.kind === 'thinking') { thinking += s.text; send({ type: 'chat-thinking', content: s.text }) }
        else if (s.kind === 'answer-start') send({ type: 'chat-status', stage: 'writing' })
      },
    })
    if (closed || ac.signal.aborted || out.error) {
      await rollbackCanceledQuestion()
      if (!closed && out.error) send({ type: 'chat-error', message: out.error })
    }
    else {
      // Commit the user question + answer atomically before announcing success. Every failed/incomplete turn
      // rolls back on both client and server, so the drawer and durable History cannot disagree.
      const pending = pendingSavedQuestion
      let completionSafe = true
      if (pending) {
        const committed = await recordAssistantMessageForPending(
          pending,
          answer,
          { sourcePath: assembled.sourcePath, costUsd: out.costUsd + parserCostUsd, thinking: thinking || undefined, computed: computedPayloads.length ? computedPayloads : undefined, memory: memoryReceipt },
          () => !closed && !ac.signal.aborted,
        ).catch(() => false)
        if (committed) pendingSavedQuestion = null
        else {
          // A receipt can have committed even when its separate History-view write failed, or another
          // deploy-overlap process may have won the immutable turn id. The first case is safe to finish
          // after WAL healing; the second must roll this process's streamed loser back and let Retry replay
          // the canonical winner. Never announce chat-done for an ambiguous persistence outcome.
          const completed = findCompletedTurnForUser(pending.turnId, chatUser)
          const sameCanonicalAnswer = completed?.userMessage.content === last.content
            && completed.assistantMessage.content === answer
          await rollbackCanceledQuestion()
          if (!sameCanonicalAnswer) {
            completionSafe = false
            if (!closed) send({
              type: 'chat-error',
              message: completed
                ? 'This turn completed on another server. Retry to load the saved answer.'
                : 'The answer could not be saved safely. Retry the same turn.',
            })
          }
        }
      }
      if (!closed && completionSafe) send({ type: 'chat-done', costUsd: out.costUsd + parserCostUsd, model })
    }
  } catch (e: any) {
    await rollbackCanceledQuestion()
    if (!closed && !ac.signal.aborted) send({ type: 'chat-error', message: String(e?.message || e) })
  } finally {
    if (ping) clearInterval(ping)
    try { res.end() } catch { /* already closed */ }
    ac.signal.removeEventListener('abort', onAbort)
    requestAbort.dispose()
  }
})

// ---------- chat history: saved Ask conversations (who asked, when, about which company) ----------
// List saved conversations as summaries (no transcript), newest-updated first, with the same filter
// surface as the activity log. Live only — the static showcase has no persisted history.
app.get('/api/chats', async (req) => {
  const q = req.query as any
  const num = (v: any) => { const n = Number(v); return Number.isFinite(n) ? n : undefined }
  const scopes = ['run', 'module', 'orb', 'wire']
  return listConversations({
    user: typeof q.user === 'string' && q.user ? q.user.slice(0, 200) : undefined,
    subject: typeof q.subject === 'string' && (TICKER_RE.test(q.subject) || SIG_RE.test(q.subject)) ? q.subject : undefined,
    swarm: typeof q.swarm === 'string' && /^[a-z0-9-]{1,40}$/.test(q.swarm) ? q.swarm : undefined,
    scope: scopes.includes(q.scope) ? q.scope : undefined,
    q: typeof q.q === 'string' ? q.q.slice(0, 100) : undefined,
    from: num(q.from),
    to: num(q.to),
    limit: num(q.limit),
  })
})

// One saved conversation with its full transcript — drives "continue chatting" (reopen + keep going).
app.get('/api/chats/:id', async (req, reply) => {
  const id = (req.params as any).id as string
  if (!isValidConversationId(id)) return reply.code(400).send({ error: 'invalid conversation id' })
  const convo = getConversation(id)
  if (!convo) return reply.code(404).send({ error: 'conversation not found' })
  return convo
})

// Reconcile an ambiguously interrupted stream by its client-minted turn id. Only a complete question +
// answer pair owned by the authoritative caller is visible; pending or rolled-back work returns 404.
app.get('/api/chat/turn/:turnId', async (req, reply) => {
  const turnId = (req.params as any).turnId as string
  if (!isValidTurnId(turnId)) return reply.code(400).send({ error: 'invalid chat turn id' })
  const { user } = identify(req)
  const completed = findCompletedTurnForUser(turnId, user)
  if (!completed) return reply.code(404).send({ error: 'completed chat turn not found' })
  return {
    conversationId: completed.conversation.id,
    turnId,
    question: completed.userMessage.content,
    answer: completed.assistantMessage.content,
    thinking: completed.assistantMessage.thinking,
    computed: completed.assistantMessage.computed,
    memory: completed.assistantMessage.memory,
    sourcePath: completed.assistantMessage.sourcePath,
    costUsd: completed.assistantMessage.costUsd,
  }
})

// Delete one saved conversation (history hygiene). CSRF-guarded like the other cockpit writes.
app.delete('/api/chats/:id', async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  const id = (req.params as any).id as string
  if (!isValidConversationId(id)) return reply.code(400).send({ error: 'invalid conversation id' })
  const { user } = identify(req)
  return { deleted: deleteConversation(id, user) }
})

// ---------- chat with the saved news wire ----------
// With no selected signal, unified Ask has no run to attach, so this route answers from the saved wire. It
// still uses the shared durable chat store and History drawer; selecting a signal uses /api/chat, whose Auto
// router can combine that run with the same saved wire question by question.
const NewsChatBody = z.object({
  window: z.enum(['24h', '7d', 'history']),
  model: z.string().max(60).optional(),
  conversationId: z.string().max(80).optional(),
  turnId: z.string().max(110).refine(isValidTurnId, 'invalid chat turn id').optional(),
  title: z.string().max(300).optional(),
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(12_000) })).min(1).max(30),
})
const newsChatGate = new NewsChatRequestGate(NEWS.chatMaxConcurrent)
app.post('/api/news/chat', { config: { rateLimit: { max: NEWS.chatRateLimitPerMinute, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  const parsed = NewsChatBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid news chat request', detail: parsed.error.issues?.[0]?.message })
  const { window, messages } = parsed.data
  const last = messages[messages.length - 1]
  if (last.role !== 'user' || !last.content.trim()) return reply.code(400).send({ error: 'the last message must be a question' })
  const modelChoice = resolveChatRequestModel(parsed.data.model, CHAT.allowedModels, CHAT.defaultModel)
  if (!modelChoice) return reply.code(400).send({ error: 'that Ask model is not supported or allowed — choose another model' })
  const model = modelChoice.id
  const releaseNewsChat = newsChatGate.tryAcquire()
  if (!releaseNewsChat) return reply.code(429).send({ error: 'news chat is busy — try again in a moment' })
  const { user: chatUser, userVia } = identify(req)
  const requestAbort = bindNewsChatRequestAbort(req.raw, reply.raw)
  const ac = requestAbort.controller
  let closed = ac.signal.aborted
  let pendingSavedQuestion: UserMessageRollback | null = null
  const rollbackCanceledQuestion = async () => {
    const pending = pendingSavedQuestion
    if (!pending) return
    pendingSavedQuestion = null
    await rollbackUserMessage(pending).catch(() => false)
  }
  const onAbort = () => { closed = true; void rollbackCanceledQuestion() }
  ac.signal.addEventListener('abort', onAbort, { once: true })

  const wireContextMatches = (conversation: { swarm: string; subject: string; scope: string }) => (
    conversation.swarm === 'screener' && conversation.subject === 'NEWS' && conversation.scope === 'wire'
  )
  const savedNewsMemory = (message: { memory?: unknown }) => {
    const memory = message.memory as any
    return memory?.kind === 'news-wire' && memory.receipt && Array.isArray(memory.evidence) ? memory : null
  }
  const replayNewsTurn = (completed: NonNullable<ReturnType<typeof findCompletedTurnForUser>>) => {
    if (completed.userMessage.content !== last.content) return reply.code(409).send({ error: 'chat turn id was already used for a different question' })
    if (!wireContextMatches(completed.conversation)) return reply.code(409).send({ error: 'chat turn belongs to a different Ask context' })
    const memory = savedNewsMemory(completed.assistantMessage)
    if (!memory) return reply.code(409).send({ error: 'saved news receipt is missing — start a new question' })
    const { res, send, ping } = startSSE(reply)
    try {
      send({ type: 'news-chat-meta', conversationId: completed.conversation.id, receipt: memory.receipt, evidence: memory.evidence, recovered: true })
      send({ type: 'news-chat-token', content: completed.assistantMessage.content })
      send({ type: 'news-chat-done', costUsd: 0, model: completed.conversation.model, recovered: true })
    } finally {
      clearInterval(ping)
      try { res.end() } catch { /* already closed */ }
    }
  }

  try {
    if (parsed.data.turnId) {
      const completed = findCompletedTurnForUser(parsed.data.turnId, chatUser)
      if (completed) return replayNewsTurn(completed)
    }

    let conversationId = isValidConversationId(parsed.data.conversationId) ? parsed.data.conversationId : undefined
    try {
      const recorded = await recordPendingUserMessage({
        user: chatUser, userVia, swarm: 'screener', subject: 'NEWS', scope: 'wire',
        title: parsed.data.title || 'Ask · news wire', model, style: `news:${window}`,
      }, last.content, conversationId, parsed.data.turnId)
      if (recorded.status === 'completed') return replayNewsTurn(recorded.completed)
      conversationId = recorded.conversation.id
      pendingSavedQuestion = recorded.rollback
    } catch (error) {
      if (error instanceof ChatTurnReservationError) {
        const status = error.code === 'CONVERSATION_BUSY' ? 503
          : error.code === 'TURN_ALREADY_PENDING' || error.code === 'TURN_CONTEXT_MISMATCH' ? 409
            : 400
        return reply.code(status).send({ error: error.message, code: error.code })
      }
      if (parsed.data.turnId) return reply.code(503).send({ error: 'could not reserve this chat turn safely — retry in a moment', code: 'TURN_RESERVATION_FAILED' })
      // Legacy clients without a turn id keep best-effort persistence.
    }
    if (closed || ac.signal.aborted) { await rollbackCanceledQuestion(); return }

    let assembled
    try {
      assembled = await retrieveNewsForAsk(window, last.content, ac.signal)
    } catch {
      if (ac.signal.aborted) { await rollbackCanceledQuestion(); return }
      await rollbackCanceledQuestion()
      return reply.code(500).send({ error: 'could not read the saved news' })
    }
    if (!assembled.present) { await rollbackCanceledQuestion(); return reply.code(409).send({ error: 'no_news', hint: assembled.missingHint }) }

    const { res, send, ping } = startSSE(reply)
    res.on('close', () => { closed = true; clearInterval(ping) })
    let callMemories = [] as ReturnType<typeof selectCallMemories>
    try {
      const evidenceIdentifiers = assembled.evidence.flatMap((row) => Array.isArray(row?.item?.companies)
        ? row.item.companies.flatMap((company) => [company?.ticker || '', company?.name || ''])
        : []).filter(Boolean)
      // Prefer an issuer named exactly in the question, then the structured issuer identities from the
      // ranked evidence. Matching remains exact, so an incidental word cannot pull in another company.
      callMemories = selectCallMemories((await listAllCalls()).calls, evidenceIdentifiers, 3, last.content, { requireIdentifierMatch: true })
    } catch {
      callMemories = []
    }
    send({ type: 'news-chat-meta', conversationId, receipt: assembled.receipt, evidence: assembled.evidence, decisionMemoryCount: callMemories.length })
    const { system, user } = buildNewsChatPrompts({ assembled, messages, calls: callMemories })
    try {
      // Hold primary text until the turn succeeds. If the primary emits a partial answer and then reports
      // a quota/timeout error, the fallback starts from a clean response rather than being concatenated to
      // a sentence from another model.
      const primaryChunks: string[] = []
      const out = await runChatTurn({ system, user, model, signal: ac.signal, onToken: (t) => primaryChunks.push(t) })
      let answer = ''
      let answerCostUsd = out.costUsd || 0
      let answerModel = model
      let fallbackFrom: string | undefined
      if (out.error && out.error !== 'aborted' && shouldUseNewsChatFallback(out.error)) {
        send({ type: 'news-chat-status', stage: 'backup-provider' })
        const backupChunks: string[] = []
        const backup = await runNewsChatFallback({
          system, user, signal: ac.signal, onToken: (t) => { backupChunks.push(t); send({ type: 'news-chat-token', content: t }) },
          config: {
            enabled: NEWS.chatGroqFallbackEnabled,
            providerSpendingAllowed: newsProviderSpendingAllowed(),
            apiKey: NEWS.groqApiKey,
            baseUrl: NEWS.groqBaseUrl,
            model: NEWS.groqModel,
            timeoutMs: NEWS.chatGroqFallbackTimeoutMs,
            maxTokens: NEWS.chatGroqFallbackMaxTokens,
            stateDir: STATE_DIR,
            rpm: NEWS.groqRpm,
            tpm: NEWS.groqTpm,
            dailyReqCap: NEWS.groqDailyReqCap,
            dailyTokenCap: NEWS.groqDailyTokenCap,
            dailyTokenTarget: NEWS.groqDailyTokenTarget,
            paceFloorFrac: NEWS.groqPaceFloorFrac,
            limiterWaitMs: NEWS.chatGroqFallbackLimiterWaitMs,
            cooldownMs: NEWS.llmCooldownMs,
            cooldownMaxMs: NEWS.llmCooldownMaxMs,
          },
        })
        if (!backup.error) {
          answer = backupChunks.join('')
          answerCostUsd = backup.costUsd
          answerModel = backup.model || NEWS.groqModel
          fallbackFrom = model
        } else if (backup.error !== 'aborted') {
          await rollbackCanceledQuestion()
          send({ type: 'news-chat-error', message: 'The answer providers are unavailable. Try again in a moment.' })
        }
      } else if (out.error && out.error !== 'aborted') {
        await rollbackCanceledQuestion()
        send({ type: 'news-chat-error', message: 'The answer could not be generated. Try again in a moment.' })
      }
      else if (!out.error) {
        answer = primaryChunks.join('')
        for (const content of primaryChunks) send({ type: 'news-chat-token', content })
      }

      if (answer && !closed && !ac.signal.aborted) {
        const pending = pendingSavedQuestion
        let completionSafe = true
        if (pending) {
          // Replay needs the compact wire receipt/evidence, not the optional call prompt shelf. Keeping
          // calls here could push the whole memory object over clampMemory's bound and lose paid replay.
          const memory = { kind: 'news-wire', window, receipt: assembled.receipt, evidence: compactNewsEvidence(assembled.evidence) }
          const committed = await recordAssistantMessageForPending(
            pending,
            answer,
            { sourcePath: 'saved news wire', costUsd: answerCostUsd, memory },
            () => !closed && !ac.signal.aborted,
          ).catch(() => false)
          if (committed) pendingSavedQuestion = null
          else {
            const completed = findCompletedTurnForUser(pending.turnId, chatUser)
            const sameCanonicalAnswer = completed?.userMessage.content === last.content && completed.assistantMessage.content === answer
            await rollbackCanceledQuestion()
            if (!sameCanonicalAnswer) {
              completionSafe = false
              send({ type: 'news-chat-error', message: completed ? 'This turn completed on another server. Retry to load the saved answer.' : 'The answer could not be saved safely. Retry the same turn.' })
            }
          }
        }
        if (completionSafe && !closed) send({ type: 'news-chat-done', costUsd: answerCostUsd, model: answerModel, ...(fallbackFrom ? { fallbackFrom } : {}) })
      } else if (!answer) {
        await rollbackCanceledQuestion()
        if (!closed && !ac.signal.aborted && !out.error) {
          send({ type: 'news-chat-error', message: 'The model returned no answer. Retry the same question.' })
        }
      }
    } catch {
      await rollbackCanceledQuestion()
      if (!closed) send({ type: 'news-chat-error', message: 'An internal error occurred while processing the chat.' })
    } finally {
      if (closed || ac.signal.aborted) await rollbackCanceledQuestion()
      clearInterval(ping)
      try { res.end() } catch { /* already closed */ }
    }
  } finally {
    ac.signal.removeEventListener('abort', onAbort)
    requestAbort.dispose()
    releaseNewsChat()
  }
})

// ---------- calls tracker: cross-ticker ledger of every call + its since-the-call timeline ----------
app.get('/api/calls', async (_req, reply) => {
  try {
    return await listAllCalls()
  } catch (e: any) {
    if (e?.code === 'CALLS_AUTHORITY_UNAVAILABLE') {
      return reply.code(503).send({
        error: 'Shared Calls history is temporarily unavailable. Retry after the published repository refreshes.',
        code: e.code,
      })
    }
    throw e
  }
})

// Live broker state is deliberately separate from /api/calls. Published call history remains available
// even while TWS is closed, restarting, or waiting for its daily login.
app.get('/api/calls/paper-portfolio', async (req) => {
  const portfolio = await readIbkrPaperPortfolio()
  return {
    ...portfolio,
    execution: {
      ...portfolio.execution,
      can_execute: portfolio.execution.status === 'ready' && paperOperatorAllowed(req),
    },
  }
})

const PaperCommandBody = z.object({
  confirmation: z.enum(['SYNC PAPER', 'CANCEL PAPER', 'CLOSE PAPER']),
  idempotency_key: z.string().uuid(),
}).strict()
const PaperOrderParams = z.object({ orderId: z.coerce.number().int().positive() }).strict()
const PaperPositionParams = z.object({ contractId: z.coerce.number().int().positive() }).strict()
function paperOperatorAllowed(req: FastifyRequest): boolean {
  const actor = identify(req)
  const operators = (process.env.ENGINE_IBKR_PAPER_OPERATORS || '')
    .split(',').map((value) => value.trim().toLowerCase()).filter(Boolean)
  if (actor.userVia === 'cf-access') return operators.includes(actor.user.toLowerCase())
  return process.env.ENGINE_IBKR_PAPER_LOCAL_OPERATOR === '1'
}
function paperCommandError(error: any, reply: FastifyReply) {
  const allowedStatuses = new Set([400, 403, 404, 409, 422, 423, 503])
  const rawStatus = Number(error?.statusCode)
  const status = allowedStatuses.has(rawStatus) ? rawStatus : 409
  const rawCode = String(error?.code || '')
  const code = /^PAPER_[A-Z0-9_]{1,56}$/.test(rawCode) ? rawCode : 'PAPER_COMMAND_FAILED'
  const known = new Map<string, string>([
    ['PAPER_EXECUTION_DISABLED', 'Paper execution is disabled.'],
    ['PAPER_ACCOUNT_NOT_ALLOWED', 'The connected account is not allowed for paper execution.'],
    ['PAPER_TARGET_BLOCKED', 'The current published Calls target is blocked. No order was sent.'],
  ])
  return reply.code(status).send({ error: known.get(code) || 'IBKR Paper could not safely complete that command.', code })
}

// Manual fallback for the same paper-only boundary used by the post-publication auto-sync. Cancel affects
// only an unfilled NOSTRA_PAPER order owned by this API client, and close submits the opposite side for
// the exact position currently returned by the allow-listed DU account.
app.post('/api/calls/paper-portfolio/sync', async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  if (!paperOperatorAllowed(req)) return reply.code(403).send({ error: 'not authorized for paper execution' })
  const body = PaperCommandBody.safeParse(req.body)
  if (!body.success || body.data.confirmation !== 'SYNC PAPER') return reply.code(400).send({ error: 'Type SYNC PAPER to confirm.' })
  try { return await ibkrPaperExecution.sync(body.data.idempotency_key, { reconcilePositions: true }) } catch (error) { return paperCommandError(error, reply) }
})

app.post('/api/calls/paper-orders/:orderId/cancel', async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  if (!paperOperatorAllowed(req)) return reply.code(403).send({ error: 'not authorized for paper execution' })
  const params = PaperOrderParams.safeParse(req.params)
  const body = PaperCommandBody.safeParse(req.body)
  if (!params.success || !body.success || body.data.confirmation !== 'CANCEL PAPER') return reply.code(400).send({ error: 'Invalid paper-order cancellation.' })
  try { return await ibkrPaperExecution.cancel(params.data.orderId, body.data.idempotency_key) } catch (error) { return paperCommandError(error, reply) }
})

app.post('/api/calls/paper-positions/:contractId/close', async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  if (!paperOperatorAllowed(req)) return reply.code(403).send({ error: 'not authorized for paper execution' })
  const params = PaperPositionParams.safeParse(req.params)
  const body = PaperCommandBody.safeParse(req.body)
  if (!params.success || !body.success || body.data.confirmation !== 'CLOSE PAPER') return reply.code(400).send({ error: 'Invalid paper-position close.' })
  try { return await ibkrPaperExecution.close(params.data.contractId, body.data.idempotency_key) } catch (error) { return paperCommandError(error, reply) }
})

// Narrow click-through for artifacts advertised by /api/calls. Reading through the same published Git
// authority prevents a dirty doer checkout from showing different bytes from the row the user clicked.
app.get('/api/calls/artifact', async (req, reply) => {
  const p = (req.query as any)?.path as string
  try {
    return await readPublishedCallsMarkdown(p)
  } catch (e: any) {
    if (e?.code === 'CALLS_AUTHORITY_UNAVAILABLE') {
      return reply.code(503).send({
        error: 'The published Calls artifact is temporarily unavailable. Retry after the repository refreshes.',
        code: e.code,
      })
    }
    return reply.code(e?.statusCode || (e?.code === 'ENOENT' ? 404 : 400)).send({
      error: String(e?.message || 'Cannot read published Calls artifact'),
      code: e?.code,
    })
  }
})

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

// Run-state of a WIRE event's signal, for the reader's "Run the checks" control. Computes the SIG-id the
// SAME way a launch would (sigIdFor with today's local date — the recipe that hashes headline|url|date), then
// derives never/running/parked/logged/watchlist/partial/complete as a pure read. No launch, no write.
app.get('/api/screener/signal-state', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req) => {
  const q = req.query as { headline?: string; source_url?: string; url?: string }
  const headline = String(q.headline || '').trim()
  if (headline.length < 8) return { sigId: '', state: 'never' as const, running: false } // can't identify a signal
  const sourceUrl = String(q.source_url || q.url || '')
  // reuse the launcher's own date+id recipe (not a re-derivation) so the probe's SIG-id EQUALS what a launch
  // produces — see todayDate()/sigIdFor. NOTE: identity is stamped with today's local date, so a run created
  // on a prior day (or an event opened across midnight) reads 'never' — same-day is the supported case.
  const sigId = sigIdFor({ headline, source_url: sourceUrl } as Parameters<typeof sigIdFor>[0], todayDate())
  return deriveSignalState(sigId)
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
  const ownerConflict = manualPoolOwnerError(RESEARCH_SWARM_ID, parsed.data.ticker)
  if (ownerConflict) return manualPoolOwnerReply(reply, parsed.data.ticker, ownerConflict)
  try {
    const existing = readHandoffs(parsed.data.thesisId).find((h: any) => h.ticker === parsed.data.ticker)
    if (existing) return { alreadyHandedOff: true, handoff: existing }
    const out = await launch({
      kind: 'handoff', ticker: parsed.data.ticker, thesisId: parsed.data.thesisId,
      provider: parsed.data.provider, reasoningLevel: parsed.data.reasoningLevel, model: parsed.data.model,
      expectedProfileKey: parsed.data.expectedProfileKey,
      sharedPoolTarget: { swarm: RESEARCH_SWARM_ID, subject: parsed.data.ticker }, user, userVia })
    return { alreadyHandedOff: false, ...out }
  } catch (e: any) {
    const body = e?.body && typeof e.body === 'object' ? e.body : null
    return reply.code(e?.statusCode || 500).send({ error: e?.message || 'handoff failed', ...(body || {}) })
  }
})

// ---------- the news wire (auto-scanner visibility + human inbox/thesis actions) ----------

// Scanner status for the cockpit's auto-scan chip: on/off, last/next cycle, today's counts.
app.get('/api/news/status', async () => getNewsStatus())
// Company-news bridge status: which subjects are covered, when the last/next 12h sweep runs, and what the
// last one did. Read-only — the cockpit can surface it (or `curl` can) without a UI change landing first.
app.get('/api/bridge/status', async () => getBridgeStatus())

// FULL pipeline diagnostics: every triage tier's budget + health + cooldown, the deferred backlog vs its
// loss boundary, the last cycle's flow, and the honest defer reason (including Haiku priority 1's state).
// Read-only, fail-soft (never throws), rate-limited like the other fs-reading news reads. Backs the cockpit's
// "Pipeline diagnostics" panel so a defer/cooldown/backlog state is never a surprise.
app.get('/api/news/diagnostics', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async () => getNewsDiagnostics())

app.get('/api/news/diagnostics/trend', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
  const query = (req.query || {}) as Record<string, unknown>
  try {
    const { from, to } = parseTrendRange(query.from, query.to)
    return readPipelineTrend(REPO_ROOT, NEWS.newsArchiveDir, from, to, String(query.bucket || 'auto'))
  } catch (error: any) {
    return reply.code(400).send({ error: error?.message || 'invalid trend range' })
  }
})

app.get('/api/news/diagnostics/trend/events', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
  const query = (req.query || {}) as Record<string, unknown>
  try {
    const { from, to } = parseTrendRange(query.from, query.to)
    return readPipelineTrendEvents(
      REPO_ROOT, NEWS.newsArchiveDir, from, to,
      String(query.providerId || ''), String(query.cursor || ''), Number(query.limit || 100),
    )
  } catch (error: any) {
    return reply.code(400).send({ error: error?.message || 'invalid trend event request' })
  }
})

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
// Optional filters (the same query keys /search parses, e.g. scope= / commodities=) apply at the read
// site, so the early-stop counts MATCHES — a wire swarm's scoped backfill (commodity) still fills its
// window. No params → byte-identical to the unfiltered read.
app.get('/api/news/feed', async (req) => {
  const q = req.query as any
  const days = Math.min(370, Math.max(1, Math.floor(Number(q?.days) || 2))) // 'all' → the client sends 370
  const maxItems = days <= 2 ? 1000 : 6000 // deep windows return the newest 6k items in range (readFeed early-stops)
  const filters = parseFeedFilterQuery(q || {})
  const predicate = hasAnyFilter(filters) ? (it: FeedItem) => matchesFeedFilters(it, filters) : undefined
  return readFeed(REPO_ROOT, days, { maxItems, archiveDir: NEWS.newsArchiveDir, predicate }) // read pruned days from the Drive archive
})

// ARCHIVE SEARCH — filter the WHOLE since-inception archive, not just the loaded window. Unlike /feed
// (newest-N-in-window, no filtering), this applies every filter SERVER-SIDE and keeps scanning older days
// until it fills a page of MATCHES or hits the archive floor — so a sparse filter (Aerospace & Defense in
// the UAE) finds matches buried deep in history instead of falsely reading "nothing". Recency-ordered,
// loss-free cursor paging with an exact storage resume point. Rate-limited (the fs-read DoS guard) like
// the other filesystem routes.
app.get('/api/news/search', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req) => {
  const q = req.query as any
  const filters = parseFeedFilterQuery(q || {})
  const limit = Math.min(200, Math.max(1, Math.floor(Number(q?.limit) || 60)))
  // Validate dates before they reach searchFeed's date arithmetic: a shape-only regex admits impossible
  // values like "2026-13-45", and a non-date cursorTs ("abc") both make new Date(NaN).toISOString() throw
  // (an unhandled 500 + raw-error leak — there is no global error handler). searchFeed now also guards this,
  // but dropping malformed optional inputs here keeps results sane (an ignored filter, not a silent "today").
  const realDate = (s: any): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`))
  const from = realDate(q?.from) ? q.from : undefined
  const to = realDate(q?.to) ? q.to : undefined
  const cursor = typeof q?.cursorTs === 'string' && q.cursorTs && !Number.isNaN(Date.parse(q.cursorTs))
    ? { ts: String(q.cursorTs), id: String(q?.cursorId || '') } as SearchCursor
    : null
  // Budgeted search also returns an exact physical resume point. Older clients only send the stable
  // (ts,id) pair; accept the storage cursor only when all three fields are present and bounded.
  const cursorShard = typeof q?.cursorScanShard === 'string' && /^\d+$/.test(q.cursorScanShard) ? Number(q.cursorScanShard) : NaN
  const cursorLine = typeof q?.cursorScanLine === 'string' && /^-?\d+$/.test(q.cursorScanLine) ? Number(q.cursorScanLine) : NaN
  if (cursor && realDate(q?.cursorScanDate)
    && Number.isSafeInteger(cursorShard) && cursorShard >= 0 && cursorShard <= 999_999
    && Number.isSafeInteger(cursorLine) && cursorLine >= -1) {
    cursor.scanDate = q.cursorScanDate
    cursor.scanShard = cursorShard
    cursor.scanLine = cursorLine
  }
  const snap = searchFeed(REPO_ROOT, {
    predicate: (it) => matchesFeedFilters(it, filters),
    archiveDir: NEWS.newsArchiveDir, limit, cursor, fromDate: from, toDate: to,
  })
  return { items: snap.items, nextCursor: snap.nextCursor, scannedThroughDate: snap.scannedThroughDate, exhausted: snap.exhausted }
})

// FACETS — the available geographies (country + continent) / sectors / sub-sectors / sources / themes,
// WITH COUNTS, over the whole archive, honouring the active filter context. This is what makes the
// cockpit dropdowns show the archive truth (e.g. "United Arab Emirates (3)"), not just the 2-day window.
// Backed by a pre-warmed worker + bounded response cache, so archive growth cannot freeze unrelated routes
// and the browser receives the complete filter universe before its first native dropdown opens.
app.get('/api/news/facets', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req) => {
  const filters = parseFeedFilterQuery((req.query as any) || {})
  return computeFacetsAsync(REPO_ROOT, filters, { archiveDir: NEWS.newsArchiveDir })
})

// GLOBAL SYMBOL SEARCH — the "any ticker, any country" directory behind the company autofill. Resolves a
// typed symbol or name through a free, keyless global symbol search, grouped per company with every
// sibling listing as an alias (e.g. the US OTC ADR NHYDY → Norsk Hydro ASA with Oslo's NHY.OL) — so a
// company is findable by ANY of its tickers even when the archive has never tagged that spelling.
// TTL-cached server-side; fail-closed to an empty list, so offline the filter degrades to the archive
// facet + free-typed matching instead of erroring.
app.get('/api/news/symbols', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req) => {
  const q = String((req.query as any)?.q ?? '').trim()
  if (q.length < 2 || q.length > 48) return { groups: [] }
  return { groups: await searchSymbolsEnriched(q) }
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

// AUTO-TUNE audit + control — the append-only history of automatic weight changes (each with the feedback
// that drove it + the backtest), a one-click revert, and the pause/pins the loop obeys. Same per-route
// limiter as the other fs-touching handlers.
const CHANGE_ID_RE = /^CHG-[0-9]{14}-[0-9a-f]{6}$/
app.get('/api/news/rank-weights/changes', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async () => ({ changes: readChanges(), autotune: getAutotuneState() }))

app.post('/api/news/rank-weights/changes/:id/revert', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async (req, reply) => {
  const id = (req.params as any).id as string
  if (!CHANGE_ID_RE.test(id)) return reply.code(400).send({ error: 'invalid change id' })
  const { user } = identify(req)
  try {
    const reverted = revertChange(id, user || 'local')
    if (!reverted) return reply.code(404).send({ error: 'no such change, or already reverted' })
    return { ok: true, reverted, active: getRankWeights() }
  } catch (e: any) {
    return reply.code(500).send({ error: e?.message || 'revert failed' })
  }
})

app.get('/api/news/rank-weights/autotune', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async () => getAutotuneState())

const AutotuneBody = z.object({ paused: z.boolean().optional(), pins: z.array(z.string().max(64)).optional() }).strip()
app.put('/api/news/rank-weights/autotune', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async (req, reply) => {
  const parsed = AutotuneBody.safeParse(req.body ?? {})
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  if (typeof parsed.data.paused === 'boolean') setAutotunePaused(parsed.data.paused)
  const state = parsed.data.pins ? setAutotunePins(parsed.data.pins) : getAutotuneState()
  return state
})

// Manual kick — run one pass now (respects pause/cap/guardrails exactly like the daily tick). For the
// panel's "run now" and for tests; it never bypasses a single guardrail.
app.post('/api/news/rank-weights/autotune/run', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req) => {
  const { user } = identify(req)
  return runAutotuneOnce(user || 'manual')
})

// THEMES — the living, ranked investment themes the firehose is bucketed into. With a `country` (ISO
// alpha-2) or `geoRegion` (continent) query param it returns the SAME themes sliced to that geography —
// re-ranked + re-sized by that geography's news flow — so the cockpit's "Where" picker narrows the Themes
// view, not just the Events list. All shapes are projected from one short-lived ledger snapshot: unlike
// the cycle-written board index, this lets time-only evidence gates age even if the scanner stops.
const THEME_RE = /^THM-[a-z0-9]{8}$/
const readThemesForApi = createThemesIndexReader(REPO_ROOT)
app.get('/api/news/themes', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req) => {
  const q = (req.query as any) || {}
  const geo: ThemeGeo = {
    country: typeof q.country === 'string' && q.country.trim() ? q.country.trim().toUpperCase() : undefined,
    geoRegion: typeof q.geoRegion === 'string' && q.geoRegion.trim() ? q.geoRegion.trim() : undefined,
  }
  // `scope=commodity` slices to commodity-tagged members (any subject); `commodity=GOLD` narrows to one
  // canonical subject (and implies the slice). Any other `scope` value is ignored here — the themes
  // ledger has no per-scope member attribution beyond commodities today (honest scope, not a 400).
  const subject = typeof q.commodity === 'string' && q.commodity.trim() ? q.commodity.trim().toUpperCase() : undefined
  const commodityScoped = subject !== undefined || (typeof q.scope === 'string' && q.scope.trim() === 'commodity')
  return readThemesForApi(geo, { scoped: commodityScoped, subject })
})
app.get('/api/news/themes/:id', async (req, reply) => {
  const id = String((req.params as any)?.id || '')
  if (!THEME_RE.test(id)) return reply.code(400).send({ error: 'bad theme id' })
  const theme = loadTheme(REPO_ROOT, id)
  if (!theme) return reply.code(404).send({ error: 'theme not found' })
  const q = (req.query as any) || {}
  const geo: ThemeGeo = {
    country: typeof q.country === 'string' && q.country.trim() ? q.country.trim().toUpperCase() : undefined,
    geoRegion: typeof q.geoRegion === 'string' && q.geoRegion.trim() ? q.geoRegion.trim() : undefined,
  }
  const subject = typeof q.commodity === 'string' && q.commodity.trim() ? q.commodity.trim().toUpperCase() : undefined
  const commodityScoped = subject !== undefined || (typeof q.scope === 'string' && q.scope.trim() === 'commodity')
  const scoped = Boolean(geo.country || geo.geoRegion || commodityScoped)
  const members = scoped ? theme.members.filter((member) => {
    if ((geo.country || geo.geoRegion) && !memberMatchesGeo(member, geo)) return false
    return !commodityScoped || memberMatchesCommodity(member, { commodity: subject, geo: null })
  }) : undefined
  return buildThemeDetail(REPO_ROOT, theme, members ? { members } : {})
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
    // A second/control-plane process can serve this route while the retained ingester lease belongs to
    // another process. Preserve cache + deterministic synthesis there, but keep all shared provider
    // spending on the single lease owner so two process-local minute limiters cannot burst one account.
    const cfg = newsProviderSpendingAllowed() ? NEWS : { ...NEWS, groqApiKey: '' }
    return await buildThemeBrief(theme, cfg, STATE_DIR, fetch, { force })
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
  // the wire row's timestamp — a lookup hint that tells enrichment which archive day to open for this
  // event's stored record. Length-capped only; enrich.ts date-parses it and ignores anything unusable,
  // and the event_id (never this) is what decides which record matches.
  ts: z.string().max(40).optional(),
  force: z.string().optional(),
})
app.get('/api/news/enrich', async (req, reply) => {
  const parsed = EnrichQuery.safeParse(req.query)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid query', detail: parsed.error.flatten() })
  const q = parsed.data
  const safeJson = (s?: string): any => { try { return s ? JSON.parse(s) : undefined } catch { return undefined } }
  const companies = Array.isArray(safeJson(q.companies)) ? safeJson(q.companies) : []
  const event_types = Array.isArray(safeJson(q.event_types)) ? safeJson(q.event_types) : []
  const providerSpendingAllowed = newsProviderSpendingAllowed()
  try {
    const enrichment = await enrichEvent(
      { event_id: q.event_id, url: q.url, headline: q.headline, companies, event_types, scope: q.scope, ts: q.ts },
      {
        repoRoot: REPO_ROOT, stateDir: STATE_DIR, force: q.force === '1',
        // the wire's own archive mount — so the reader finds an event's stored record (its RSS lede, its
        // story cluster) on a day already pruned from the local inbox, exactly like the wire does
        archiveDir: NEWS.newsArchiveDir,
        // the article-body read runs the multi-provider fallback chain (Groq → OpenRouter/NVIDIA → Gemini),
        // each sharing the ingester's daily budget + per-minute limiter so an opened event never blows the
        // per-minute ceiling alongside the scanner — under HARD time budgets so it can never hang the reader.
        articleProviders: providerSpendingAllowed ? ARTICLE_READ_PROVIDERS : [],
        filingReadProviders: providerSpendingAllowed ? FILING_READ_PROVIDERS : [], // optional stronger model for filing reads (unset => unchanged)
        llmBudgetMs: NEWS.enrichLlmBudgetMs,
        limiterWaitMs: NEWS.enrichLimiterWaitMs,
        // thread the OPERATOR-configured cooldown (NEWS_LLM_COOLDOWN_SEC / _MAX_SEC) through to the article
        // read so a lengthened cooldown during a real outage is actually honored here, not just by the
        // ingester's own triage/overflow/Gemini seams in runCycle.ts.
        cooldownMs: NEWS.llmCooldownMs,
        cooldownMaxMs: NEWS.llmCooldownMaxMs,
        // when the publisher blocks the direct read, corroborate the event from the secondary wire (GDELT
        // keyword search → same read chain). Shares the firehose's GDELT endpoint + penalty backoff.
        corroborate: { enabled: NEWS.enrichCorroborate, baseUrl: NEWS.gdeltBaseUrl, timeoutMs: NEWS.enrichCorroborateTimeoutMs },
      },
    )
    // A body read that just landed a firm materiality verdict floors this item's rank (news/impact-floor.ts)
    // — but that floor otherwise only reaches the wire on its NEXT full load. Re-score the item right here,
    // the same way the wire would, and hand the client the fresh score/band so it can patch the row it's
    // already looking at immediately, instead of showing a stale headline-only score until a later refetch
    // (Codex review, PR #350). Additive-only: an older client that ignores `rescored` sees no change.
    const verdict = verdictOf(enrichment)
    if (verdict) {
      const item = findWireItem(REPO_ROOT, q.event_id, { archiveDir: NEWS.newsArchiveDir })
      if (item?.rank_factors) {
        applyActiveWeightsTo(item, getRankWeights(), new Map([[item.event_id, verdict]]))
        return { ...enrichment, rescored: { rank_score: item.triage_score, band: item.band, rank_factors: item.rank_factors } }
      }
    }
    return enrichment
  } catch (e: any) {
    // enrichEvent never throws, but keep the route honest if something upstream does
    return { event_id: q.event_id, ok: false, fetched_at: new Date().toISOString(), prior_coverage: [], related: [], note: String(e?.message || e) }
  }
})

// ---------- screener wire → research data bridge ----------
// A wire event becomes a tier-10 note in a tracked subject's data pool (research-bridge.ts). The
// pool watcher + doc-intake then take over — the SAME machinery a hand-dropped document uses — so
// the research tab flags the affected orbs and offers the scoped re-run. Writing the note is free;
// the paid intake analysis stays governed by its own INTAKE_AUTO_ANALYZE + finished-run gates, and
// a rerun is always an explicit human click (CLAUDE.md §24).
const EventBridgeParams = z.object({ eventId: z.string().regex(EVENT_ID_RE) })
const EventBridgeBody = z.object({ ...ProviderLaunchFields, ticker: z.string().regex(TICKER_RE) })

// Which tracked subjects this event was already routed to (drives the "✓ sent" rows in the picker).
app.get('/api/screener/event/:eventId/research-links', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req, reply) => {
  const parsed = EventBridgeParams.safeParse(req.params)
  if (!parsed.success) return reply.code(400).send({ error: 'bad event id' })
  return { links: listBridgedSubjects(parsed.data.eventId, DATA_DIR) }
})

// Route one wire event into one tracked subject's pool. Server-authoritative: the note is built from
// the event's own stored firehose record (never from client fields — same anti-poisoning rule as
// /api/news/enrich), plus the CACHED article read if a reader already paid for it. Idempotent on
// <event_id>::<ticker> (the note's deterministic filename).
app.post('/api/screener/event/:eventId/send-to-research', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request blocked' })
  const parsed = EventBridgeParams.safeParse(req.params)
  if (!parsed.success) return reply.code(400).send({ error: 'bad event id' })
  const body = EventBridgeBody.safeParse(req.body)
  if (!body.success) return reply.code(400).send({ error: 'bad ticker' })
  const { ticker, provider, model, reasoningLevel, expectedProfileKey } = body.data
  if (!isValidTicker(ticker)) return reply.code(400).send({ error: 'bad ticker' })
  // Same data-pool allow-list as /api/intake/:ticker/analyze — only an EXISTING tracked subject.
  if (isReservedDataFolder(ticker) || !fs.existsSync(path.join(DATA_DIR, ticker))) {
    return reply.code(400).send({ error: `unknown ticker ${ticker}` })
  }
  const { user, userVia } = identify(req)
  const item = findWireItem(REPO_ROOT, parsed.data.eventId, { archiveDir: NEWS.newsArchiveDir })
  if (!item) return reply.code(404).send({ error: 'event not found on the wire or in the archive' })
  try {
    // This route is explicitly "send to research". Resolve once only to choose the swarm-qualified lock,
    // then re-resolve INSIDE it. The owner proof, pool write, and launch now form one critical section;
    // scoped staging/manual intake cannot slip between "research owns GOLD" and the actual note write.
    const initialOwner = resolveSwarmForSubject(ticker)
    if (!initialOwner || initialOwner.swarm !== RESEARCH_SWARM_ID) {
      // Four different states used to share one "not owned unambiguously" line, so a company that simply
      // had no finished run read as an ownership conflict and sent the reader hunting for a clash that did
      // not exist. Name the state that actually applies (CLAUDE.md §21 — plain words, and never a raw code).
      const refusal = explainIntakeOwnerRefusal(ticker, RESEARCH_SWARM_ID)
      const owners = refusal && 'owners' in refusal ? refusal.owners.join(' and ') : ''
      const message = refusal?.code === 'shared_data_owner_none'
        ? `${ticker} has no finished research run yet, so there is no dossier for this event to become evidence for. Finish a run on ${ticker} first — this story stays on the wire.`
        : refusal?.code === 'shared_data_owner_mismatch'
          ? `${ticker}'s finished run belongs to the ${owners} cockpit, not research, so a research note would attach to the wrong thesis.`
          : refusal?.code === 'shared_data_owner_undecided'
            ? `${ticker}'s research run has not recorded a decision yet, so there is nothing for this event to be evidence against.`
            : `${ticker} is claimed by more than one cockpit${owners ? ` (${owners})` : ''}, so no single thesis owns this evidence.`
      return reply.code(409).send({ error: message, code: refusal?.code || 'shared_data_owner_ambiguous' })
    }
    return await withSubjectLock(subjectMutationLockKey(initialOwner.swarm, ticker), async () => {
      const owner = resolveSwarmForSubject(ticker)
      if (!owner || owner.swarm !== initialOwner.swarm || owner.runRoot !== initialOwner.runRoot
          || owner.decisionFingerprint !== initialOwner.decisionFingerprint) {
        return reply.code(409).send({ error: 'The data-pool owner changed before the note could be added.', code: 'shared_data_owner_changed' })
      }
      const res = bridgeEventToSubject({
        item, ticker, mode: 'manual', user, userVia,
        enrichment: peekCachedEnrichment(STATE_DIR, parsed.data.eventId),
        opts: { dataDir: DATA_DIR, stateDir: STATE_DIR },
      })
      // The send click IS the human consent (§24): after a FRESH note lands, launch the cheap advisory
      // intake analysis right away. This is already inside the one shared subject lock — never acquire it
      // recursively. A busy/admission failure leaves the note in place for the manual Analyze button.
      let analyzing = false
      let analysisLaunch: Awaited<ReturnType<typeof launch>> | null = null
      if (res.already !== true) {
        try {
          const busy = listRuns().some((r) => r.subjectId === ticker && (r.swarmId || RESEARCH_SWARM_ID) === owner.swarm
            && (IN_FLIGHT_STATUSES.has(r.status) || r.endedAt === undefined))
          if (!busy) {
            analysisLaunch = await launch({ kind: 'doc-intake', ticker, provider, model, reasoningLevel, expectedProfileKey,
              runRoot: owner.runRoot, decisionRunRoot: owner.runRoot,
              decisionFingerprint: owner.decisionFingerprint, intakeOwner: owner, user, userVia })
            analyzing = true
          }
        } catch {
          analyzing = false
        }
      }
      return {
        ok: true,
        ...res,
        analyzing,
        swarm: owner.swarm,
        ...(analysisLaunch ? { launch: { runId: analysisLaunch.runId, preflight: analysisLaunch.preflight } } : {}),
      }
    })
  } catch (e: any) {
    if (e instanceof SubjectBusyError) {
      return reply.code(409).send({ error: 'This idea is already being updated. Try again when it finishes.', code: 'subject_busy' })
    }
    return reply.code(e?.statusCode || 500).send({ error: e?.message || 'could not route the event' })
  }
})

// Live wire: one SSE client set, bridged once from the ingest cycle's bus.
const newsClients = new Set<{ send: (e: any) => void }>()
// Auto-bridge on ingest — OPT-IN (SCREENER_RESEARCH_BRIDGE=1): a material wire item whose extracted
// ticker exactly matches a tracked subject is routed into that subject's pool. Ships OFF: manual
// sends (and their bridge ledger) are the training data that earns this path its trust first. The
// enrichment peek is a THUNK so the whole-cache parse only runs for the rare item that passes every
// gate — never per wire item on the ingest hot path. Never breaks the fan-out.
const bridgeNewsEvent = (e: Parameters<typeof newsBus.emit>[0]) => {
  if (e.type !== 'news-item') return
  try {
    autoBridgeItem(
      e.item,
      { dataDir: DATA_DIR, stateDir: STATE_DIR },
      () => peekCachedEnrichment(STATE_DIR, e.item.event_id),
      getBridgeSubjectNames(), // short-TTL cache — the name fallback, same as the batch sweep already has
    )
  } catch {
    /* best-effort — a missed bridge loses one note, never the wire */
  }
}
const broadcastNewsEvent = (e: Parameters<typeof newsBus.emit>[0]) => {
  // Exhaustive per-variant mapping: adding a bus event is a compile error here, never a silently
  // mis-shaped payload on the wire.
  const payload = (() => {
    switch (e.type) {
      case 'news-item': return { type: 'news-item', item: e.item }
      case 'theme-update': return { type: 'theme-update', theme: e.theme }
      case 'theme-remove': return { type: 'theme-remove', removal: e.removal }
      case 'news-cycle-start': return { type: 'news-cycle-start', ts: e.ts, phase: e.phase }
      case 'news-cycle': return { type: 'news-cycle', summary: e.summary }
      default: {
        const exhaustive: never = e
        return exhaustive
      }
    }
  })()
  for (const c of newsClients) c.send(payload)
}
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
app.post('/api/screener/inbox/action', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async (req, reply) => {
  const parsed = InboxActionBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const { user } = identify(req)
  const row = setDismissed(REPO_ROOT, parsed.data.inboxId, parsed.data.action === 'dismiss', user)
  if (!row) return reply.code(404).send({ error: 'no such inbox row' })
  await auditInboxAction(parsed.data.inboxId, parsed.data.action === 'dismiss' ? 'inbox_dismiss' : 'inbox_restore', user)
  await refreshBoard(REPO_ROOT)
  return { ok: true, row }
})

// Hand-move a thesis between board lanes. Append-only override; the engine's own verdict is never
// overwritten — the board shows both, plus a staleness flag if the engine later re-runs.
const ThesisMoveBody = z.object({
  to: z.enum(MOVE_TARGETS),
  reason: z.string().max(500).optional(),
})
app.post('/api/screener/thesis/:id/move', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async (req, reply) => {
  const thesisId = (req.params as any).id as string
  if (!THESIS_RE.test(thesisId)) return reply.code(400).send({ error: 'invalid thesis id' })
  const parsed = ThesisMoveBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const { user } = identify(req)
  try {
    const record = await moveThesis(thesisId, parsed.data.to, parsed.data.reason || '', user)
    if (!record) return reply.code(404).send({ error: 'no such thesis' })
    await refreshBoard(REPO_ROOT)
    // after an 'engine' clear the effective status is the engine's own (captured as from_status)
    return { ok: true, effective_status: record.to_status ?? record.from_status, override: record }
  } catch (e: any) {
    return reply.code(500).send({ error: e?.message || 'move failed' })
  }
})

// Restore an archived (killed/expired) thesis to the live book — the conviction loop's one-click
// un-discard (a discard is a SOFT discard, §24). Deterministic: a Python helper flips the snapshot and
// records a `recover` event; the board is rebuilt so the card returns to the live lanes.
app.post('/api/screener/conviction/:id/restore', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async (req, reply) => {
  const thesisId = (req.params as any).id as string
  if (!THESIS_RE.test(thesisId)) return reply.code(400).send({ error: 'invalid thesis id' })
  const { user } = identify(req)
  try {
    // sequential: the restore script flips the snapshot, THEN the board is rebuilt to reflect it.
    const { stdout } = await execFileAsync('python3', [path.join(REPO_ROOT, 'scripts', 'screener_restore_conviction.py'), thesisId, user], { cwd: REPO_ROOT, encoding: 'utf8' })
    await refreshBoard(REPO_ROOT) // async board rebuild (== update_board_index.py), never the sync freeze
    return { ok: true, message: stdout.trim() }
  } catch (e: any) {
    return reply.code(500).send({ error: e?.message || 'restore failed' })
  }
})

// Hide (or restore) one idea from the live book — a SOFT delete. Appends a `signal_hide`/`signal_restore`
// override (the engine's ledger + run folder are untouched), then rebuilds the board so the card leaves /
// returns immediately. Reversible from the "Hidden" tray.
const SignalHideBody = z.object({ action: z.enum(SIGNAL_ACTIONS) })
app.post('/api/screener/signal/:id/hide', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async (req, reply) => {
  const signalId = (req.params as any).id as string
  if (!SIG_RE.test(signalId)) return reply.code(400).send({ error: 'invalid signal id' })
  const parsed = SignalHideBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const { user } = identify(req)
  try {
    const record = await hideSignal(signalId, parsed.data.action, user)
    await refreshBoard(REPO_ROOT) // rebuild the index so the card leaves/returns without waiting for a run
    return { ok: true, ...record }
  } catch (e: any) {
    return reply.code(500).send({ error: e?.message || 'hide failed' })
  }
})

// Force a board rebuild from the live ledger, then return the fresh board. The board index is a snapshot
// the agents rewrite at each run's end; this lets the cockpit's ↻ pick up runs that finished since (or a
// stale committed index) instead of only re-reading the same snapshot — so "runs I just ran" always show.
app.post('/api/screener/board/rebuild', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (_req, reply) => {
  try {
    // throwOnFailure: this is the manual "rebuild" button, not a best-effort auto-poll — a script
    // timeout or bad ledger row must surface as a failed request, never a silent 200 of the stale index.
    await refreshBoard(REPO_ROOT, () => {}, { throwOnFailure: true })
    return screenerBoard()
  } catch (e: any) {
    return reply.code(500).send({ error: e?.message || 'rebuild failed' })
  }
})

// Promote a PM-skim idea into the paid gauntlet — the "Run the full machine" click. Builds a signal intake
// from the idea's primary source and launches it through the SAME path a wire-event launch uses (launch +
// sigIdFor), so a run for an event the gauntlet already saw is de-duplicated by SIG-id, never double-folded.
// Then it stamps the idea snapshot promoted so the board reflects it. Reuses the whole launch machinery
// (credit/preflight/admission) — this endpoint only maps idea -> intake and records the promotion.
const IDEA_ID_RE = /^IDEA-[a-f0-9]{12}$/

/** A crash-recovery proof, not a broad folder-exists check: the exact manifest-derived signal folder must
 * contain a regular, non-symlink intake whose embedded identity matches the frozen reservation. */
function durableSignalIntakeExists(signalId: string): boolean {
  if (!/^SIG-[0-9]{8}-[a-f0-9]{8}$/.test(signalId)) return false
  const screener = swarmById('screener')
  if (!screener?.runRootTemplate || !screener.placeholder) throw new Error('screener run-root manifest is unavailable')
  const root = path.resolve(REPO_ROOT, screener.runRootTemplate.replace(`{${screener.placeholder}}`, signalId))
  const boundary = path.resolve(REPO_ROOT, 'screener')
  if (!root.startsWith(boundary + path.sep)) throw new Error('screener run-root manifest escaped its repository boundary')
  const intake = path.resolve(root, 'intake.json')
  if (!intake.startsWith(root + path.sep)) throw new Error('signal intake path escaped its run root')
  try {
    const rootInfo = fs.lstatSync(root)
    const intakeInfo = fs.lstatSync(intake)
    if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()
        || !intakeInfo.isFile() || intakeInfo.isSymbolicLink()) {
      throw new Error('signal admission proof is not a regular contained intake')
    }
    const realBoundary = fs.realpathSync(boundary)
    const realRoot = fs.realpathSync(root)
    const realIntake = fs.realpathSync(intake)
    if (!realRoot.startsWith(realBoundary + path.sep) || !realIntake.startsWith(realRoot + path.sep)) {
      throw new Error('signal admission proof escaped its real screener boundary')
    }
    const parsed = JSON.parse(fs.readFileSync(realIntake, 'utf8'))
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || parsed.signal_id !== signalId) {
      throw new Error('signal admission proof identity does not match its reservation')
    }
    return true
  } catch (error: any) {
    if (error?.code === 'ENOENT') return false
    throw error
  }
}

app.post('/api/screener/ideas/:id/promote', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
  const providerBody = ProviderBody.safeParse(req.body ?? {})
  if (!providerBody.success) return reply.code(400).send({ error: 'invalid provider profile' })
  const ideaId = (req.params as any).id as string
  if (!IDEA_ID_RE.test(ideaId)) return reply.code(400).send({ error: 'invalid idea id' })
  const idea = readIdeaById(REPO_ROOT, ideaId)
  if (!idea) return reply.code(404).send({ error: 'idea not found' })
  // Idempotent completed promotions win even after their source expiry. Every unpromoted expiry fails at
  // the API boundary; hiding its button in the UI is not an authorization control for a paid launch.
  const eligibility = ideaPromotionEligibility(idea)
  if (eligibility.status === 'already_promoted') {
    return { sigId: eligibility.signal_id, runId: null, alreadyPromoted: true }
  }
  if (eligibility.status === 'expired') {
    return reply.code(410).send({ error: 'idea expired; refresh the news lead before promotion' })
  }
  const { user, userVia } = identify(req)
  const headline = (idea.source_headline || idea.source_headlines?.[0] || idea.reason || '').trim().slice(0, 500)
  if (headline.length < 8) return reply.code(422).send({ error: 'idea has no usable source headline to launch' })
  const hasSource = Boolean(idea.source_url && idea.source_name)
  const intake = hasSource
    ? { headline, source_url: idea.source_url as string, source_name: idea.source_name as string, input_nature: 'news_headline' }
    : { headline, human_prompt_note: `Desk skim — ${idea.direction.toUpperCase()} ${idea.ticker}: ${idea.reason}`.slice(0, 4000), input_nature: 'human_prompt' }
  // Freeze the exact date used in the deterministic SIG id before reserving. launch() can spend minutes in
  // provider readiness; recomputing after midnight would otherwise make the recovery receipt name a folder
  // the admitted launch never wrote.
  const signalDate = todayDate()
  const reservedSignalId = sigIdFor(intake, signalDate)
  const reservation = reserveIdeaPromotion(REPO_ROOT, ideaId, Date.now(), reservedSignalId)
  if (!reservation) {
    const current = readIdeaById(REPO_ROOT, ideaId)
    if (current) {
      const currentEligibility = ideaPromotionEligibility(current)
      if (currentEligibility.status === 'already_promoted') {
        return { sigId: currentEligibility.signal_id, runId: null, alreadyPromoted: true }
      }
      if (currentEligibility.status === 'expired') {
        return reply.code(410).send({ error: 'idea expired; refresh the news lead before promotion' })
      }
    }
    return reply.code(409).send({ error: 'idea changed or is already being sent; refresh before promotion' })
  }
  let launchCompleted = false
  try {
    const out = await launch({
      kind: 'signal', intake, provider: providerBody.data.provider,
      model: providerBody.data.model, reasoningLevel: providerBody.data.reasoningLevel,
      expectedProfileKey: providerBody.data.expectedProfileKey, signalDate, user, userVia,
    })
    launchCompleted = true
    const sigId = out.preflight.ticker
    if (sigId !== reservation.signal_id) throw new Error('admitted signal identity did not match its durable promotion reservation')
    // Merge only lifecycle fields into the newest provider snapshot under the reservation. A refresh or
    // feedback update that landed during the paid launch remains intact.
    markIdeasPublicationPending(STATE_DIR)
    finalizeIdeaPromotion(
      REPO_ROOT, ideaId, reservation.token, sigId,
      new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'), idea,
    )
    setImmediate(() => { try { refreshBoard(REPO_ROOT) } catch { /* best-effort */ } })
    return { sigId, runId: out.runId, preflight: out.preflight }
  } catch (e: any) {
    if (!launchCompleted) releaseIdeaPromotion(REPO_ROOT, ideaId, reservation.token)
    const body = e?.body && typeof e.body === 'object' ? e.body : null
    return reply.code(e?.statusCode || 500).send({ error: e?.message || 'promote failed', ...(body || {}) })
  }
})

// Rate a surfaced idea 👍/👎 (with an optional reason) — the skim's self-grading loop. Appends to the
// ideas' OWN feedback ledger (never the wire's, so idea-quality is not conflated with wire-materiality),
// and a 👎 cools the idea faster (idea-scoped decay, no global lever). The board scorecard reads this.
const IdeaFeedbackBody = z.object({ polarity: z.enum(['up', 'down', 'clear']), reason: z.string().max(120).optional() })
app.post('/api/screener/ideas/:id/feedback', { config: { rateLimit: { max: 600, timeWindow: '1 minute' } } }, async (req, reply) => {
  const ideaId = (req.params as any).id as string
  if (!IDEA_ID_RE.test(ideaId)) return reply.code(400).send({ error: 'invalid idea id' })
  const parsed = IdeaFeedbackBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const idea = readIdeaById(REPO_ROOT, ideaId)
  if (!idea) return reply.code(404).send({ error: 'idea not found' })
  const { user } = identify(req)
  const ts = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  try {
    markIdeasPublicationPending(STATE_DIR)
    await appendIdeaFeedback(REPO_ROOT, { idea_feedback_id: `IFB-${randomUUID().slice(0, 12)}`, ts, idea_id: ideaId, ticker: idea.ticker, polarity: parsed.data.polarity, reason: parsed.data.reason || null, user })
    // a 👎 cools the idea toward the "Cooling off" lane within the grace window (never past its own decay).
    // RE-READ after the append (a promote or a skim-pass write may have landed during that await): merge the
    // decay onto the FRESH snapshot, never the stale pre-await one, so a concurrent promoted stamp / refreshed
    // source set is preserved (the writeIdea below is synchronous after this read — no yield, no lost update).
    if (parsed.data.polarity === 'down') {
      const graceMs = Math.max(0, NEWS.ideasDownvoteGraceHrs) * 3_600_000
      updateIdeaSnapshot(REPO_ROOT, ideaId, (fresh) => {
        const cur = Date.parse(fresh.decay_at)
        const next = Math.min(Number.isFinite(cur) ? cur : Number.POSITIVE_INFINITY, Date.now() + graceMs)
        return { ...fresh, decay_at: new Date(next).toISOString().replace(/\.\d{3}Z$/, 'Z'), updated_at: ts }
      })
    }
    setImmediate(() => { try { refreshBoard(REPO_ROOT) } catch { /* best-effort */ } })
    return { ok: true }
  } catch (e: any) {
    return reply.code(500).send({ error: e?.message || 'feedback failed' })
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
app.post('/api/screener/feedback', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async (req, reply) => {
  const parsed = FeedbackBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const { user } = identify(req)
  try {
    const record = await submitFeedback(parsed.data, user)
    // Route the free-text reason into a scope OFF the critical path — the feedback is already saved and
    // the response goes out now; the router (LLM→keyword) then appends an additive feedback_route line so
    // the note also feeds the tuning loop. A failure here never affects the captured feedback.
    if (record.feedback_reason) {
      void routeReason(record.feedback_reason, fetch, {
        providerSpendingAllowed: newsProviderSpendingAllowed(),
      })
        .then((r) => (r.scope ? appendFeedbackRoute(record.feedback_id, r.scope, r.confidence, r.via) : undefined))
        .catch(() => {})
    }
    return reply.code(201).send({ ok: true, feedback: record })
  } catch (e: any) {
    return reply.code(500).send({ error: e?.message || 'feedback save failed' })
  }
})

app.post('/api/screener/feedback/:id/undo', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async (req, reply) => {
  const feedbackId = (req.params as any).id as string
  if (!FEEDBACK_ID_RE.test(feedbackId)) return reply.code(400).send({ error: 'invalid feedback id' })
  const { user } = identify(req)
  try {
    const record = await undoFeedback(feedbackId, user)
    if (!record) return reply.code(404).send({ error: 'no such feedback' })
    return { ok: true, undone: record }
  } catch (e: any) {
    return reply.code(500).send({ error: e?.message || 'undo failed' })
  }
})

app.get('/api/screener/feedback/summary', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async () => summarizeFeedback(readAllFeedback(REPO_ROOT)))

// ---------- cockpit-wide product feedback (feedback-store.ts) ----------
// A prominent "Feedback" surface: anyone behind Cloudflare Access files a bug / UI note / idea with
// screenshots; the whole team sees the folded list. The gated one-click "send to coding engine"
// dispatch is added in a follow-up (feedback-dispatch.ts). Storage is operational (STATE_DIR/feedback/,
// gitignored), NOT the tracked screener ledger — the one doer box serving the cockpit makes it team-visible.
app.post('/api/feedback', { config: { rateLimit: { max: 300, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const { user } = identify(req)
  // Mint the id first so screenshots land in the item's own folder as they stream. Accept a mixed
  // multipart (text fields + images) OR a JSON text-only body.
  const feedbackId = newFeedbackId()
  const fields: Record<string, string> = {}
  const images: string[] = []
  const imageErrors: { filename: string; reason: string }[] = []
  let seq = 1
  try {
    if (req.isMultipart()) {
      for await (const part of req.parts()) {
        if (part.type === 'file') {
          if (images.length >= FEEDBACK_MAX_IMAGES) { part.file.resume(); imageErrors.push({ filename: part.filename || '(unnamed)', reason: 'too many images (max ' + FEEDBACK_MAX_IMAGES + ')' }); continue }
          const res = await saveFeedbackImage(feedbackId, seq, part.filename || `img${seq}.png`, part.file)
          if (res.ok) { images.push(res.name); seq++ } else imageErrors.push({ filename: part.filename || '(unnamed)', reason: res.reason })
        } else {
          fields[part.fieldname] = String((part as any).value ?? '')
        }
      }
    } else {
      const body = (req.body ?? {}) as Record<string, unknown>
      fields.text = typeof body.text === 'string' ? body.text : ''
      fields.category = typeof body.category === 'string' ? body.category : 'other'
      fields.url = typeof body.url === 'string' ? body.url : ''
    }
    const text = (fields.text || '').trim()
    if (!text && images.length === 0) {
      try { fs.rmSync(itemDir(feedbackId), { recursive: true, force: true }) } catch { /* nothing written yet */ }
      return reply.code(400).send({ error: 'feedback needs text or at least one screenshot' })
    }
    const record = await writeFeedbackItem({ feedback_id: feedbackId, text, category: (fields.category || 'other') as FeedbackCategory, images, url: fields.url || '' }, user)
    return reply.code(201).send({ ok: true, feedback: record, imageErrors })
  } catch (e: any) {
    // a mid-stream failure can leave partial screenshots in the item's folder — clean it up so a failed
    // upload never accumulates orphaned files (the ledger line was not written, so the folder is unreferenced)
    try { fs.rmSync(itemDir(feedbackId), { recursive: true, force: true }) } catch { /* best-effort */ }
    return reply.code(500).send({ error: e?.message || 'feedback save failed' })
  }
})

// Folded team-visible list (item + its latest status event), newest first.
app.get('/api/feedback', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async () => ({ items: foldFeedback(readAllCockpitFeedback()) }))

// Serve a stored screenshot back to the panel. The resolve + startsWith containment barrier is applied
// INLINE here, right before the fs sinks — CodeQL recognizes js/path-injection sanitization only at the
// sink, not behind a helper (same finding pattern as the external-data image work). A crafted :id / :name
// therefore cannot escape STATE_DIR/feedback/<id>.
app.get('/api/feedback/:id/image/:name', { config: { rateLimit: { max: 2000, timeWindow: '1 minute' } } }, async (req, reply) => {
  const { id, name } = req.params as { id: string; name: string }
  if (!isFeedbackId(id)) return reply.code(404).send({ error: 'not found' })
  const ext = (String(name).split('.').pop() || '').toLowerCase()
  if (!['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return reply.code(404).send({ error: 'not found' })
  // Containment against the CONSTANT feedback root (derived from STATE_DIR, not from the request): the
  // fully-resolved path must sit under it, or the crafted :id / :name escaped. Checking startsWith on a
  // fixed root — never a base that itself embeds user input — is the shape CodeQL accepts as the barrier.
  const root = path.resolve(STATE_DIR, 'feedback')
  const full = path.resolve(root, id, name)
  if (!full.startsWith(root + path.sep)) return reply.code(404).send({ error: 'not found' })
  if (!fs.existsSync(full)) return reply.code(404).send({ error: 'not found' })
  const mime = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
  reply.header('content-type', mime)
  reply.header('cache-control', 'private, max-age=3600')
  return reply.send(fs.createReadStream(full))
})

// Manual triage — mark an item triaged / done / wontfix (append-only status event). Any authenticated
// teammate may triage; the paid "dispatch to coding engine" action is separately admin-gated (PR B).
const FeedbackStatusBody = z.object({ status: z.enum(['triaged', 'done', 'wontfix']), note: z.string().max(2000).optional() }).strip()
app.post('/api/feedback/:id/status', { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const id = (req.params as any).id as string
  if (!isFeedbackId(id)) return reply.code(400).send({ error: 'invalid feedback id' })
  const parsed = FeedbackStatusBody.safeParse(req.body)
  if (!parsed.success) return reply.code(400).send({ error: 'invalid body', detail: parsed.error.flatten() })
  const { user } = identify(req)
  // Snapshot BEFORE the append: the item carries the reporter (its user_id = their email), and the prior
  // fold tells us whether they've already been successfully emailed — so a repeated "done" doesn't re-notify.
  const records = readAllCockpitFeedback()
  const item = records.find((r): r is FeedbackItemRecord => r.kind === 'feedback' && r.feedback_id === id)
  const prev = foldFeedback(records).find((v) => v.feedback_id === id)
  const ev = await appendFeedbackEvent(id, parsed.data.status, { note: parsed.data.note, user })
  if (!ev) return reply.code(404).send({ error: 'no such feedback' })
  // On resolve → email the reporter, once. FIRE-AND-FORGET: the status is already saved and the response
  // returns now; the send + its ledger line run in the background and can never fail or block this request.
  if (parsed.data.status === 'done' && item && !prev?.notified?.ok) {
    void notifyFeedbackResolved(item, { note: parsed.data.note || '', prUrl: prev?.pr_url ?? null, user })
      .then((r) => { if (r.attempted) console.log(`[feedback-email] ${id} -> ${r.recipient}: ${r.ok ? 'sent' : 'FAILED ' + r.detail}`) }) // eslint-disable-line no-console
      .catch(() => {})
  }
  return { ok: true, event: ev }
})

// Re-send the resolution email to a resolved item's reporter — the "Notify reporter" / "Retry email"
// action the panel shows on a done card that hasn't been successfully emailed yet (auto-send failed, or a
// reporter email only became notifiable later). Only valid for a resolved item; records its own attempt.
app.post('/api/feedback/:id/notify', { config: { rateLimit: { max: 120, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const id = (req.params as any).id as string
  if (!isFeedbackId(id)) return reply.code(400).send({ error: 'invalid feedback id' })
  if (!feedbackEmailReady()) return reply.code(503).send({ ok: false, error: 'email is not configured on this server' })
  const { user } = identify(req)
  const records = readAllCockpitFeedback()
  const item = records.find((r): r is FeedbackItemRecord => r.kind === 'feedback' && r.feedback_id === id)
  if (!item) return reply.code(404).send({ error: 'no such feedback' })
  const view = foldFeedback(records).find((v) => v.feedback_id === id)
  if (view?.status !== 'done') return reply.code(409).send({ ok: false, error: 'feedback is not resolved' })
  // Idempotent: if the reporter was already successfully emailed, don't send again (the panel hides the
  // button after success, but this also blocks a direct-API re-send loop). Returns a clean already-sent ok.
  if (view.notified?.ok) return { ok: true, reason: 'already_sent', recipient: view.notified.recipient, detail: '' }
  const r = await notifyFeedbackResolved(item, { note: view?.note || '', prUrl: view?.pr_url ?? null, user })
  return reply.code(r.ok ? 200 : 502).send({ ok: r.ok, reason: r.reason, recipient: r.recipient, detail: r.detail })
})

// One-click "send to coding engine" — the gated, paid action. FAIL-CLOSED: only an admitted admin
// (ENGINE_DISPATCH_ADMINS) may trigger it, and only when dispatch is enabled + a PR token is configured.
// The agent runs in an isolated worktree and opens a DRAFT PR (feedback-dispatch.ts). `?dryRun=1` proves
// the wiring (worktree + prompt) with no spawn and no spend.
app.post('/api/feedback/:id/dispatch', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
  if (!originAllowed(req)) return reply.code(403).send({ error: 'cross-origin request rejected' })
  const id = (req.params as any).id as string
  if (!isFeedbackId(id)) return reply.code(400).send({ error: 'invalid feedback id' })
  const { user } = identify(req)
  if (!isDispatchAdmin(user)) return reply.code(403).send({ error: 'not authorized to dispatch (admin only)' })
  const item = readAllCockpitFeedback().find((r): r is FeedbackItemRecord => r.kind === 'feedback' && r.feedback_id === id)
  if (!item) return reply.code(404).send({ error: 'no such feedback' })
  const dryRun = (req.query as any)?.dryRun === '1' || (req.body as any)?.dryRun === true
  if (dryRun) {
    if (!feedbackDispatchReady()) return { ok: true, dryRun: true, ready: false, note: 'dispatch is not enabled or no PR token configured — wiring probe only', plan: await dryRunFeedbackDispatch(item) }
    return { ok: true, dryRun: true, ready: true, plan: await dryRunFeedbackDispatch(item) }
  }
  const res = startFeedbackDispatch(item, user)
  return reply.code(res.accepted ? 202 : 409).send({ ok: res.accepted, ...res })
})

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
  // Reconnect first, then replay: the user sees the same scan id/count/current file after a browser refresh.
  for (const progress of dataScans.snapshots()) send({ type: 'data-scan-progress', progress })
  const unsubscribeScan = dataScans.subscribe((progress) => send({ type: 'data-scan-progress', progress }))
  req.raw.on('close', () => {
    clearInterval(ping)
    unsubscribeScan()
    dataClients.delete(client)
  })
})

// ---- auto-analyze document intake on landing (frameworks/INTAKE.md) ----
// When new docs sync for a ticker that already has a FINISHED thesis, generate the scoped rerun plan
// automatically so the cockpit is intelligent the moment it's opened — no manual "analyze" step. Only the
// CHEAP analysis auto-fires; reruns stay a human one-click (CLAUDE.md §24). Debounced per ticker (wait out
// the Drive-sync burst), deduped on the pool's newest-file date, and gated behind INTAKE_AUTO_ANALYZE
// (default on; set to '0' to disable). Best-effort: any admission/capacity/offline error just skips a round.
const AUTO_INTAKE_ON = process.env.INTAKE_AUTO_ANALYZE !== '0'
const AUTO_INTAKE_DEBOUNCE_MS = 30_000
const autoIntakeTimers = new Map<string, ReturnType<typeof setTimeout>>()
const autoIntakeLastNewest = new Map<string, string>()

function scheduleAutoIntake(ticker: string) {
  // The watcher sees only a shared data/<SUBJECT> path, not its swarm. Admit the broad manifest-safe
  // segment here; fireAutoIntake resolves the actual owner and applies that swarm's exact normalizer.
  if (!AUTO_INTAKE_ON || !MANIFEST_SUBJECT_RE.test(ticker) || isReservedDataFolder(ticker)) return
  const prev = autoIntakeTimers.get(ticker)
  if (prev) clearTimeout(prev)
  autoIntakeTimers.set(ticker, setTimeout(() => { autoIntakeTimers.delete(ticker); void fireAutoIntake(ticker) }, AUTO_INTAKE_DEBOUNCE_MS))
}

// Does this swarm have a FINISHED run for the subject at `runRoot`? The terminal artifact differs by swarm:
// research writes BOTH final_thesis.md + decision_record.json (finalDeliverablesPresent); a constellation
// swarm (commodity) ends on decision_record.json alone (there is no final_thesis.md outside research,
// launcher.ts). Never use finalDeliverablesPresent for a non-research swarm — its `&&` would reject a
// legitimately-finished commodity run.
// `data/<SUBJECT>/` is a shared namespace across research (tickers) + constellation swarms (e.g. commodity
// subjects), so a pool change alone doesn't say which swarm owns it. Resolve it only when exactly one
// FINISHED owner exists. A shared label such as GOLD can legitimately be both an equity ticker and a
// commodity; guessing by manifest order would read/write the wrong thesis, so ambiguity abstains.
const resolveSwarmForSubject = resolveUniqueFinishedIntakeOwner

async function fireAutoIntake(ticker: string, attempt = 0): Promise<void> {
  try {
    if (!AUTO_INTAKE_ON) return
    // still mid-sync? wait out the burst and retry a few times, so we analyze the settled pool, not a half-copy.
    if (syncingState(ticker).syncing && attempt < 4) { setTimeout(() => void fireAutoIntake(ticker, attempt + 1), SYNC_WINDOW_MS); return }
    // intake only makes sense against a finished run — resolve the OWNING swarm from the shared data/<SUBJECT>/
    // namespace and use ITS terminal artifact (research: final_thesis.md; commodity: decision_record.json).
    const initialOwner = resolveSwarmForSubject(ticker)
    if (!initialOwner) return
    const outcome = await withSubjectLock(subjectMutationLockKey(initialOwner.swarm, ticker), async (): Promise<'done' | 'retry'> => {
      // Ownership can change while a Drive event is settling. Re-resolve under the SAME mutation lock used
      // by manual intake and scoped reruns; never let an automatic launch race their staging/carry work.
      const owner = resolveSwarmForSubject(ticker)
      if (!owner || owner.swarm !== initialOwner.swarm || owner.runRoot !== initialOwner.runRoot
          || owner.decisionFingerprint !== initialOwner.decisionFingerprint) return 'retry'
      const ownerExecution = readLastProviderSelection(owner.runRoot, 'published')
      if (!ownerExecution) return 'retry' // unknown modern provenance: automatic intake must abstain
      // dedupe: skip if the pool has not gained a newer file since the last SUCCESSFULLY ADMITTED
      // auto-analysis. Keyed on the raw newest MTIME, not the calendar day — a day-granular key would
      // swallow a second document that lands the same day as a prior analysis.
      const newest = String(intakePoolNewest(ticker, owner.swarm).newestMs || 0)
      const ownerKey = `${owner.swarm}\0${ticker}`
      if (newest !== '0' && autoIntakeLastNewest.get(ownerKey) === newest) return 'done'
      // Never analyze while a real run or prior intake is already in flight on this swarm-qualified subject.
      if (listRuns().some((r) => r.subjectId === ticker && (r.swarmId || RESEARCH_SWARM_ID) === owner.swarm
          && (IN_FLIGHT_STATUSES.has(r.status) || r.endedAt === undefined))) return 'retry'
      const priorPlanAnalyzedAt = readIntakePlan(ticker, {
        swarmId: owner.swarm, runRoot: owner.runRoot,
      })?.analyzed_at ?? null
      // doc-intake dispatches the OWNING swarm's `:intake` command. The launcher's intakeOwner proof
      // revalidates sole ownership before admission and immediately before the paid process starts.
      const terminalRetry = (status: RunStatus) => {
        // `done` is necessary but not sufficient. Prove the SAME owner/call is still current and that the
        // command wrote a NEW exact plan after reading this settled pool watermark. Do not use
        // `pool_current`: it deliberately includes the older run-date floor, so it is false in the normal
        // case here (a new document landed after the finished call). `scanned_at` is the execution witness.
        let proved = false
        try {
          const terminalOwner = resolveSwarmForSubject(ticker)
          const terminalPlan = readIntakePlan(ticker, { swarmId: owner.swarm, runRoot: owner.runRoot })
          const terminalNewest = String(intakePoolNewest(ticker, owner.swarm).newestMs || 0)
          const scannedAtMs = terminalPlan?.scanned_at ? Date.parse(terminalPlan.scanned_at) : NaN
          proved = status === 'done' && terminalOwner?.swarm === owner.swarm
            && terminalOwner.runRoot === owner.runRoot
            && terminalOwner.decisionFingerprint === owner.decisionFingerprint
            && terminalPlan?.run_root === owner.runRoot
            && terminalPlan.decision_fingerprint === owner.decisionFingerprint
            && terminalPlan.analyzed_at !== priorPlanAnalyzedAt
            && Number.isFinite(scannedAtMs)
            && Number(newest) <= scannedAtMs
            && terminalNewest === newest
        } catch { /* a transient read/projection error must retry, never swallow the landing */ }
        if (proved) autoIntakeLastNewest.set(ownerKey, newest)
        else if (attempt < 4) setTimeout(() => void fireAutoIntake(ticker, attempt + 1), SYNC_WINDOW_MS)
      }
      await launch({ kind: 'doc-intake', ticker, provider: ownerExecution.provider,
        model: ownerExecution.model, reasoningLevel: ownerExecution.reasoningLevel, runRoot: owner.runRoot,
        decisionRunRoot: owner.runRoot, decisionFingerprint: owner.decisionFingerprint,
        intakeOwner: owner, onTerminal: terminalRetry,
        ...(owner.swarm !== RESEARCH_SWARM_ID ? { swarm: owner.swarm } : {}), user: 'auto', userVia: 'local' })
      // No dedupe write here: launch() is only an early admission ACK. terminalRetry owns the true result.
      return 'done'
    })
    if (outcome === 'retry' && attempt < 4) {
      setTimeout(() => void fireAutoIntake(ticker, attempt + 1), SYNC_WINDOW_MS)
    }
  } catch {
    // Best-effort but self-healing: a subject-lock/admission/capacity/CLI race does not advance the dedupe
    // watermark. Retry a bounded number of times; the manual Analyze button remains the final fallback.
    if (attempt < 4) setTimeout(() => void fireAutoIntake(ticker, attempt + 1), SYNC_WINDOW_MS)
  }
}

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
  scheduleAutoIntake(ticker) // debounced, deduped, finished-run-gated auto-analysis of the scoped rerun plan
  const evt = { type: 'data-changed', ticker, change, ts: Date.now() }
  for (const c of dataClients) {
    try {
      c.send(evt)
    } catch {}
  }
}

let dataWatcher: ReturnType<typeof chokidar.watch> | undefined
let newsBusUnsubscribers: Array<() => void> = []

function startRuntimeBindings() {
  if (newsBusUnsubscribers.length === 0) {
    newsBusUnsubscribers = [newsBus.subscribe(bridgeNewsEvent), newsBus.subscribe(broadcastNewsEvent)]
  }
  if (!dataWatcher && fs.existsSync(DATA_DIR)) {
    // data/ is a Google Drive CloudStorage mount -> polling is the robust choice across the FUSE boundary.
    // No `depth` cap: data-status.ts's listPoolFiles walks the WHOLE tree with no depth limit (a filing can
    // sit at data/<T>/Filings/2026/Q1/report.pdf or deeper), so a fixed depth here would silently stop
    // watching below that bound — a nested drop would satisfy readiness/coverage on the next listing but
    // never fire the live "data-changed" event or auto-intake until an unrelated shallower change, or a
    // manual refresh, happened to trigger one (PR #457 review). Unbounded matches the recursive contract
    // exactly; the cost is the same per-poll-cycle FUSE walk the recursive pool scan already performs.
    dataWatcher = chokidar.watch(DATA_DIR, {
      ignoreInitial: true,
      usePolling: true,
      interval: 1500,
      awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 500 },
    })
    dataWatcher.on('add', (f) => broadcastData(f, 'added'))
    dataWatcher.on('addDir', (f) => broadcastData(f, 'added'))
    dataWatcher.on('unlink', (f) => broadcastData(f, 'removed'))
    dataWatcher.on('unlinkDir', (f) => broadcastData(f, 'removed'))
  }
}

async function stopRuntimeBindings() {
  for (const unsubscribe of newsBusUnsubscribers.splice(0)) unsubscribe()
  const watcher = dataWatcher
  dataWatcher = undefined
  if (watcher) await watcher.close()
}

app.addHook('onClose', stopRuntimeBindings)

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
  const sendShell = (rel: string) => (_req: any, reply: any) => {
    let html = ''
    try { html = fs.readFileSync(`${WEB_DIST}/${rel}`, 'utf8') } catch {}
    // Deploy skew: a NEW engine in front of an OLD dist has no m/index.html yet. Serve the desktop
    // shell instead of an empty 200 — the phone gets the full app for one deploy cycle, which is
    // ugly but working; a blank page is neither.
    if (!html && rel !== 'index.html') {
      try { html = fs.readFileSync(`${WEB_DIST}/index.html`, 'utf8') } catch {}
    }
    html = html.replace('</head>', '<script>window.__ENGINE_LIVE__=true</script></head>')
    return reply.header('cache-control', 'no-cache').type('text/html').send(html)
  }
  const sendIndex = sendShell('index.html')
  const sendMobile = sendShell('m/index.html')
  // Every shell route reads its HTML from disk per request, so each carries the same explicit per-route
  // limit the other filesystem-backed handlers use (same budget as the global cap, which still applies on
  // top). Declared once and shared so a future shell cannot be added without it. Clears CodeQL
  // js/missing-rate-limiting, which sees the global onRequest hook but not per-route.
  const shellRoute = { config: { rateLimit: { max: 1000, timeWindow: '1 minute' } } }
  app.get('/', shellRoute, sendIndex)
  // The phone chat shell. All three spellings need the marker-injecting route: the static plugin's
  // wildcard would otherwise serve m/index.html as a plain file (no __ENGINE_LIVE__ marker), sending
  // every mobile boot through the 6-second /api/health probe in ensureMode().
  app.get('/m', shellRoute, sendMobile)
  app.get('/m/', shellRoute, sendMobile)
  app.get('/m/index.html', shellRoute, sendMobile)
  app.setNotFoundHandler((req, reply) => {
    // Never fall back to index.html for an API path or a static asset (anything with a file
    // extension): returning HTML for a missing .js/.css makes the browser reject the module and
    // blanks the whole app. A missing hashed asset must fail loudly as a 404.
    if (req.url.startsWith('/api/') || /\.[a-z0-9]+(?:\?|$)/i.test(req.url)) return reply.code(404).send({ error: 'not found' })
    // Two shells, one fallback rule: /m/* deep links land on the phone shell, everything else on the
    // desktop one (static-shell.ts owns the prefix test — /m/history is mobile, /moo is not).
    return (shellForUrl(req.url) === 'mobile' ? sendMobile : sendIndex)(req, reply)
  })
}

// ── Single-instance lock ──────────────────────────────────────────────────────
// The OS already blocks two binds to the SAME :8787 (the second gets EADDRINUSE, handled in .catch below).
// The real hazard is a SECOND engine started with a DIFFERENT PORT (the :8799 incident): it shares this
// checkout's data + state and doubles all ingester / filesystem / LLM load. The retained kernel lease is
// independent of PORT and releases automatically on crash. Its stable inode is never unlinked, so stale
// PID text, PID reuse, and unlink/recreate races cannot admit two engines or block the next healthy boot.
const ENGINE_LOCK_FILE = 'engine.lock'
function claimSingleInstanceLock() {
  if (!acquireSingletonLock(STATE_DIR, ENGINE_LOCK_FILE)) {
    // eslint-disable-next-line no-console
    console.error('[swarm-cockpit] another engine owns this checkout, or singleton safety could not be established; exiting')
    process.exit(1)
  }
  process.once('exit', () => releaseSingletonLock(STATE_DIR, ENGINE_LOCK_FILE))
}

// ── Global safety net + graceful shutdown ─────────────────────────────────────
// Two failure modes this closes: (1) `launchctl kickstart -k` sends SIGTERM, which by default terminates
// the process mid-write — dropping in-flight SSE/HTTP and giving cloudflared a reset (→ a 502) instead of a
// clean FIN. (2) An unhandled throw ANYWHERE outside a route handler (a watcher dispatch, a child stream
// handler, a scheduler tick) crashes the whole single-process origin with Node's default behaviour. We drain
// on a signal and, on an uncaught exception, exit non-zero so launchd cold-restarts AND the deploy health
// gate (scripts/ops/deploy.sh) can catch a boot failure and roll back.
let shuttingDown = false
async function shutdown(signal: string, code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  if (pendingAdmissionTimer) { clearInterval(pendingAdmissionTimer); pendingAdmissionTimer = null }
  // eslint-disable-next-line no-console
  console.log(`[swarm-cockpit] ${signal} — draining ${liveResponses.size} live stream(s), exit ${code}`)
  // Keep the singleton while provider groups drain. Exiting on a wall-clock timer would orphan the
  // detached writer and let the replacement engine admit a second writer into the same run root.
  const slowDrainWarning = setTimeout(() => {
    // eslint-disable-next-line no-console
    console.error('[swarm-cockpit] shutdown is still draining a provider process group; retaining the singleton until it is extinct')
  }, 30_000)
  slowDrainWarning.unref()
  for (const res of liveResponses) {
    try { res.end() } catch {} // fires each stream's own 'close' cleanup (clearInterval + unsubscribe)
  }
  try { await app.close() } catch {} // stop accepting, drain in-flight HTTP, close keep-alive sockets (clean FIN)
  try {
    await drainProviderRunsForShutdown()
    await drainIbkrPaperAutoSync()
  } catch (error) {
    // Fail closed: never release the process-wide lock while a detached writer may still be alive.
    // eslint-disable-next-line no-console
    console.error('[swarm-cockpit] provider or paper-sync drain failed; refusing to exit unsafely', error)
    return
  } finally {
    clearTimeout(slowDrainWarning)
  }
  process.exit(code)
}
function installProcessHandlers() {
  process.on('SIGTERM', () => { void shutdown('SIGTERM', 0) })
  process.on('SIGINT', () => { void shutdown('SIGINT', 0) })
  process.on('uncaughtException', (err) => {
    // eslint-disable-next-line no-console
    console.error('[swarm-cockpit] uncaughtException — draining and restarting', err)
    void shutdown('uncaughtException', 1)
  })
  // A single rejected promise in one request must NOT take the whole single-operator cockpit down — log and
  // keep serving. (Deliberate trade-off; promote to shutdown(1) if a future audit prefers fail-fast.)
  process.on('unhandledRejection', (reason) => {
    // eslint-disable-next-line no-console
    console.error('[swarm-cockpit] unhandledRejection (continuing)', reason)
  })
}

async function start() {
  claimSingleInstanceLock()
  installProcessHandlers()
  // A crash between atomic root activation and provider start must not leave a fake resumable run. Restore
  // every transaction that lacks a durable `started` receipt before any route or supervisor can inspect it.
  const transactionRecovery = await recoverRunPlanTransactions()
  for (const requestId of transactionRecovery.started) {
    try { await markRunPlanStarted(requestId) } catch { /* no adjacent request receipt: transaction remains the spend seal */ }
  }
  for (const requestId of transactionRecovery.rolledBack) {
    try { await markRunPlanFailedBeforeStart(requestId, 'process restarted before a provider child started') } catch {}
  }
  startRuntimeBindings()
  // A process crash can leave private media behind. Before accepting any request on a restart, remove every
  // abandoned Reel temp directory; there cannot be a live transcription owned by this new process yet.
  await purgeReelTempDirs(0)
  .then(() => reconcileOrphanedProviderGroups())
  .then(async (count) => {
    if (count) console.log(`[swarm-cockpit] reconciled ${count} orphaned provider process group(s) before admission`) // eslint-disable-line no-console
    // Frozen evidence capabilities outlive a hard crash but must never outlive their provider chain. Only
    // sweep after every orphan process group is extinct, and fail closed before listen if anything under
    // the exact private parent cannot be proven to be one owner-only, canonical chain directory.
    const capabilitySweep = sweepStaleFrozenEvidenceCapabilities({
      capabilityRoot: path.join(PUBLICATION_SOCKET_ROOT, 'frozen-evidence'),
      forbiddenRoots: [REPO_ROOT, DATA_DIR, STATE_DIR],
    })
    if (capabilitySweep.removed.length > 0) {
      console.log(`[swarm-cockpit] removed ${capabilitySweep.removed.length} stale frozen evidence capability chain(s) before admission`) // eslint-disable-line no-console
    }
    if (capabilitySweep.unsafe.length > 0) {
      const details = capabilitySweep.unsafe.map((issue) => `${issue.entry}: ${issue.reason}`).join('; ')
      console.error(`[swarm-cockpit] unsafe frozen evidence capability entries retained: ${details}`) // eslint-disable-line no-console
      throw new Error('unsafe frozen evidence capability entries require operator inspection before admission')
    }
    const promotions = reconcileIdeaPromotionReservations(REPO_ROOT, durableSignalIntakeExists)
    if (promotions.recovered > 0) {
      markIdeasPublicationPending(STATE_DIR)
      console.log(`[swarm-cockpit] recovered ${promotions.recovered} admitted Idea promotion(s) before admission`) // eslint-disable-line no-console
    }
    if (promotions.released > 0) console.log(`[swarm-cockpit] released ${promotions.released} stale Idea promotion reservation(s)`) // eslint-disable-line no-console
    if (promotions.errors.length > 0) console.error(`[swarm-cockpit] Idea promotion recovery needs attention: ${promotions.errors.join('; ')}`) // eslint-disable-line no-console
    const recovered = await recoverReadyPublications()
    if (recovered) console.log(`[swarm-cockpit] recovered ${recovered} post-extinction publication(s) before admission`) // eslint-disable-line no-console
    // Readiness means the first workspace request is warm. Graph discovery/parsing is synchronous, so if
    // it ran after listen() it could block the event loop while the browser waited on its startup graph.
    const graphs = warmSwarmGraphs()
    await app.listen({ host: HOST, port: PORT })
    return graphs
  })
  .then(async (graphs) => {
    const g = graphs[0]
    // eslint-disable-next-line no-console
    console.log(`[swarm-cockpit] control plane on http://${HOST}:${PORT}  (${g.totals.modules} modules, ${g.totals.agents} agents; ${graphs.length} swarm graphs warm)`)
    // Revalidate Memory as soon as the control plane is listening. A browser arriving during the
    // refresh receives the bounded, verified last-known-good view; concurrent callers join one rebuild.
    void memoryReader.warm()
    // Build the complete-history filter universe off-thread before the reader reaches for Geography or
    // Company. The server remains responsive while the worker scans Drive, and later callers join/cache it.
    void warmFacets(REPO_ROOT, { archiveDir: NEWS.newsArchiveDir })
    // warm the once-per-process claude CLI probes so the FIRST launch click doesn't pay them (~1-4s)
    void warmLaunchProbes()
    // A queued Run/Continue intent survives restart, but already-paid protected recovery owns boot admission
    // priority. Await one exact disk-truth pass before the pending drain can spend or touch the same subject;
    // the deployer barrier still keeps that drain inert until health verification completes.
    await startBootAdmissionSchedulers({
      reconcilePaidRecovery: startResumeSupervisor,
      startPendingDrain: startPendingAdmissionDrain,
    })
    // autonomous news ingester (screener swarm): fills a ranked inbox 24/7 at ~$0 when GROQ_API_KEY
    // is set; stays dark otherwise. Never launches a paid run — promotion is the human's one click.
    startNewsIngester()
    // conviction loop (Phase 3): auto-fire /screener:validate on due checkpoints + on matching wire
    // items. OFF unless CONVICTION_LOOP_ENABLED=1 — auto-spawning paid checks is opt-in.
    startConvictionLoop(async ({ thesisId, checkpointId, selection, onTerminal }) => {
      await launch({
        kind: 'conviction', thesisId, checkpointId, provider: selection.provider,
        model: selection.model, reasoningLevel: selection.reasoningLevel,
        expectedProfileKey: selection.profileKey,
        user: 'auto', userVia: 'local', onTerminal,
      })
    })
    // research review dispatcher: fire due 30/90/180/365d decision reviews from the always-on server,
    // through the provider-aware launcher (the old direct-Claude timer is retired). OFF unless
    // REVIEW_DISPATCH_ENABLED=1 — auto-spawning paid review runs is opt-in.
    startReviewLoop(async ({ ticker, runRoot, window, selection, onTerminal }) => {
      await launch({
        kind: 'review', ticker, runRoot, window, provider: selection.provider,
        model: selection.model, reasoningLevel: selection.reasoningLevel,
        expectedProfileKey: selection.profileKey,
        user: 'auto', userVia: 'local', onTerminal,
      })
    })
    // company-news bridge (batch): route material wire events into covered subjects' pools every 12h and
    // run the CHEAP advisory analysis for any subject that gained a fresh note. OFF unless
    // BRIDGE_MODE=batch. Paid re-runs stay behind the research tab's own click. The launcher is injected
    // so the loop reuses this file's admission stack (subject lock + busy check) — the same gates the
    // manual "Send to research" route applies, in one place.
    startBridgeScheduler(async (ticker: string) => {
      const owner = resolveSwarmForSubject(ticker)
      if (!owner) return false
      const ownerExecution = readLastProviderSelection(owner.runRoot, 'published')
      if (!ownerExecution) return false
      return withSubjectLock(subjectMutationLockKey(owner.swarm, ticker), async () => {
        const before = readIntakePlan(ticker, { swarmId: owner.swarm, runRoot: owner.runRoot })?.analyzed_at ?? null
        const newest = intakePoolNewest(ticker, owner.swarm).newestMs
        const busy = listRuns().some((r) => r.subjectId === ticker && (r.swarmId || RESEARCH_SWARM_ID) === owner.swarm
          && (IN_FLIGHT_STATUSES.has(r.status) || r.endedAt === undefined))
        if (busy) return false
        // Bridge accounting waits for the REAL terminal outcome. launch() returns after admission only;
        // its later identity CAS/spawn/command can still fail. Resolve true only when the same call owns
        // the pool and a newly-written exact plan proves it scanned the settled bridge watermark.
        const terminal = new Promise<boolean>((resolve) => {
          const onTerminal = (status: RunStatus) => {
            try {
              const current = resolveSwarmForSubject(ticker)
              const plan = readIntakePlan(ticker, { swarmId: owner.swarm, runRoot: owner.runRoot })
              const currentNewest = intakePoolNewest(ticker, owner.swarm).newestMs
              const scannedAtMs = plan?.scanned_at ? Date.parse(plan.scanned_at) : NaN
              resolve(status === 'done' && current?.swarm === owner.swarm
                && current.runRoot === owner.runRoot
                && current.decisionFingerprint === owner.decisionFingerprint
                && plan?.run_root === owner.runRoot
                && plan.decision_fingerprint === owner.decisionFingerprint
                && plan.analyzed_at !== before
                && Number.isFinite(scannedAtMs) && newest <= scannedAtMs
                && currentNewest === newest)
            } catch { resolve(false) }
          }
          void launch({ kind: 'doc-intake', ticker, provider: ownerExecution.provider,
            model: ownerExecution.model, reasoningLevel: ownerExecution.reasoningLevel, runRoot: owner.runRoot,
            decisionRunRoot: owner.runRoot, decisionFingerprint: owner.decisionFingerprint,
            intakeOwner: owner, onTerminal,
            ...(owner.swarm !== RESEARCH_SWARM_ID ? { swarm: owner.swarm } : {}), user: 'auto', userVia: 'local' })
            .catch(() => resolve(false))
        })
        return terminal
      })
    })
    // feedback auto-tune (screener): once a day, apply the tuner's guardrailed, backtest-passing rank-weight
    // nudges from human feedback — audited + revertible. OFF unless SCREENER_AUTOTUNE_ENABLED=1 (opt-in, the
    // prod engine env sets it); nothing is spent and no paid run is launched.
    startAutotuneLoop()
    // Forever-living connector health loop: reads run_connectors.py's ledger, keeps cadence fetch state
    // visible, and can dispatch repair only after explicit opt-in plus a verified isolated-agent backend.
    // The current runtime deliberately has no such backend; fetching remains independent and defaults on.
    startConnectorRunner()
  })
}

return { app, start, shutdown }
}

// Executable-only startup. Importing `buildApp` for route tests is side-effect free: no singleton claim,
// listener, process handlers, recovery, provider probes, or autonomous schedulers run until this branch.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildApp().then((runtime) => runtime.start()).catch((err: any) => {
    // eslint-disable-next-line no-console
    if (err?.code === 'EADDRINUSE') console.error(`[swarm-cockpit] port ${PORT} is already in use — another engine owns it; exiting`)
    // eslint-disable-next-line no-console
    else console.error('[swarm-cockpit] failed to start', err)
    process.exit(1)
  })
}
