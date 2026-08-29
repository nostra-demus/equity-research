import './load-env' // FIRST: load provider keys from the out-of-repo secret dir before any process.env read below
import fs from 'node:fs'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { DEFAULT_CHAT_MODEL_ID, DEFAULT_CHAT_MODEL_IDS } from './chat-models'
import type { ArticleReadProvider } from './news/triage/article-read'
import { NON_BINDING_DAILY_TOKEN_CAP } from './news/triage/budget'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ui/server/src -> repo root is three levels up. Override with ENGINE_REPO_ROOT if needed.
export const REPO_ROOT = process.env.ENGINE_REPO_ROOT
  ? path.resolve(process.env.ENGINE_REPO_ROOT)
  : path.resolve(__dirname, '../../..')

export const AGENTS_DIR = path.join(REPO_ROOT, '.claude', 'agents')
export const CONNECTORS_DIR = path.join(REPO_ROOT, '.claude', 'connectors')

// ---- company-news bridge (batch mode) ----------------------------------------------------------------
// The 12-hourly sweep that routes material wire events into a covered subject's data pool (bridge-batch.ts).
// MODE IS AUTHORITATIVE and ships OFF: 'batch' runs the sweep; 'stream' is research-bridge.ts's existing
// per-item path (SCREENER_RESEARCH_BRIDGE=1); they never run together. Even a misconfiguration is harmless —
// the notes are keyed by event id on disk, so a double route is a no-op — but one owner keeps the ledger and
// the follow-up analyses honest.
export const BRIDGE_MODE = (() => {
  const raw = String(process.env.BRIDGE_MODE || '').trim().toLowerCase()
  return raw === 'batch' || raw === 'stream' ? raw : 'off'
})()
// True only when the operator EXPLICITLY wrote BRIDGE_MODE=off — as opposed to leaving it unset. Both
// collapse into BRIDGE_MODE === 'off' above (the batch scheduler stays idle either way), but an explicit
// kill switch must also disable the legacy SCREENER_RESEARCH_BRIDGE=1 per-item path, while an UNSET
// BRIDGE_MODE preserves back-compat and defers to that flag alone (Codex #359 r3674305117).
export const BRIDGE_MODE_EXPLICIT_OFF = String(process.env.BRIDGE_MODE || '').trim().toLowerCase() === 'off'
// The sweep interval. 12h by default (two windows a day caps the follow-up analysis spend); overridable for
// tests/ops, clamped to a sane band so a typo can neither hammer the pool nor silently disable the loop.
export const BRIDGE_INTERVAL_MIN = (() => {
  const raw = Number(process.env.BRIDGE_INTERVAL_MIN)
  return Number.isFinite(raw) && raw >= 15 && raw <= 7 * 24 * 60 ? raw : 12 * 60
})()
// Where the bridge's own manifest + knobs live. NOT under .claude/connectors/: that namespace is for
// feeds scripts/run_connectors.py fetches, and a row there for an in-cockpit sweep would read as a
// permanently un-run feed (see the manifest's `notes`). Observability is GET /api/bridge/status.
export const BRIDGE_DIR = path.join(REPO_ROOT, '.claude', 'bridge')
export const COMMANDS_DIR = path.join(REPO_ROOT, '.claude', 'commands', 'research')
export const DATA_DIR = path.join(REPO_ROOT, 'data')
export const ANALYSES_DIR = path.join(REPO_ROOT, 'analyses')
export const WEB_DIST = path.join(REPO_ROOT, 'ui', 'dist')

// Persistent engine state that survives restarts and deploys (deploys only rebuild ui/dist).
// Gitignored (.state/). Holds the append-only activity/audit log. Override with ENGINE_STATE_DIR.
export const STATE_DIR = process.env.ENGINE_STATE_DIR
  ? path.resolve(process.env.ENGINE_STATE_DIR)
  : path.resolve(__dirname, '..', '.state')
export const ACTIVITY_LOG_PATH = path.join(STATE_DIR, 'activity-log.jsonl')
// Per-run AF_UNIX publication capabilities must be readable enough for the sandboxed helper to verify
// socket ownership/type/mode, while STATE_DIR itself remains completely unreadable. Keep this owner-only
// IPC tree outside the repository, supervisor state, and platform-writable temporary roots.
export const PUBLICATION_SOCKET_ROOT = path.join(os.homedir(), '.nostra-cockpit-ipc')

// Small operator utilities exposed through the cockpit's Tools workspace. Reel transcription reuses the
// existing Groq credential but has its own model/runtime knobs. The downloader path is optional: when it
// is absent, the server installs a pinned, hash-verified yt-dlp release under STATE_DIR on first use. Reel
// reads are deliberately logged-out: this endpoint never touches the host user's browser cookies.
export const TOOLS = {
  reelTranscript: {
    groqApiKey: process.env.GROQ_API_KEY || '',
    groqBaseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
    model: process.env.REEL_TRANSCRIPT_MODEL || 'whisper-large-v3-turbo',
    ytDlpPath: process.env.REEL_TRANSCRIPT_YTDLP_PATH || '',
    maxSeconds: (() => {
      const value = Number(process.env.REEL_TRANSCRIPT_MAX_SECONDS || 20 * 60)
      return Number.isFinite(value) ? Math.min(60 * 60, Math.max(10, value)) : 20 * 60
    })(),
    maxBytes: (() => {
      const value = Number(process.env.REEL_TRANSCRIPT_MAX_BYTES || 23 * 1024 * 1024)
      return Number.isFinite(value) ? Math.min(23 * 1024 * 1024, Math.max(1024 * 1024, value)) : 23 * 1024 * 1024
    })(),
  },
}
// Saved "chat with your data" conversations — one JSON file per conversation, so the full history of
// every Ask conversation (who asked, when, about which company) survives restarts and can be reopened
// and continued. Gitignored (lives under .state/). Override the parent with ENGINE_STATE_DIR.
export const CHATS_DIR = path.join(STATE_DIR, 'chats')

export const PORT = Number(process.env.PORT || 8787)
export const HOST = '127.0.0.1'

// Max concurrent headless runs across ALL tickers (cost / rate-limit backstop). The per-ticker
// admission rules (admission.ts) govern same-company safety; this caps total fan-out. Tunable.
export const MAX_CONCURRENT_RUNS = Math.max(1, Number(process.env.ENGINE_MAX_CONCURRENT_RUNS || 3))

// The Claude Code CLI used to launch the engine in headless mode. Resolved to an ABSOLUTE path so it
// never depends on the launchd process's PATH (which has bitten us: the binary + plist PATH are fine,
// yet the running engine couldn't resolve bare 'claude', 503-ing every screener/research launch). Order:
// explicit CLAUDE_BIN env → known install locations → bare 'claude' (last-resort PATH lookup).
function resolveClaudeBin(): string {
  if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN
  const candidates = [
    path.join(os.homedir(), '.local', 'bin', 'claude'), // native installer (the symlink — survives version bumps)
    '/opt/homebrew/bin/claude', // homebrew / npm-global on Apple Silicon
    '/usr/local/bin/claude', // npm-global on Intel
  ]
  for (const c of candidates) {
    try { if (fs.existsSync(c)) return c } catch { /* keep looking */ }
  }
  return 'claude' // last resort — rely on PATH
}
export const CLAUDE_BIN = resolveClaudeBin()
export const DEFAULT_MODEL = process.env.ENGINE_MODEL || 'sonnet'

// ---- feedback → coding-agent dispatch (feedback-dispatch.ts) ----
// The gated one-click "send this feedback to a coding agent, which opens a DRAFT PR" action. FAIL-CLOSED:
// only emails in ENGINE_DISPATCH_ADMINS may trigger it (empty list ⇒ nobody), AND it must be enabled.
// Everything is env-driven from the out-of-repo config dir (code-pr.env) so it survives a machine move.
export const DISPATCH_ADMINS = (process.env.ENGINE_DISPATCH_ADMINS || '')
  .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
export const FEEDBACK_DISPATCH_ENABLED = process.env.ENGINE_FEEDBACK_DISPATCH_ENABLED === '1'
// The fine-grained PAT (Contents + Pull-requests write, this repo only) the coding agent authenticates
// `gh`/`git` with — NEVER the engine's §28 data-only App identity. Lives in code-pr.env.
export const CODE_PR_TOKEN = process.env.GH_PR_TOKEN || ''
/** Fail-closed authorization for the paid dispatch action. */
export function isDispatchAdmin(email: string): boolean {
  const e = (email || '').trim().toLowerCase()
  return DISPATCH_ADMINS.length > 0 && DISPATCH_ADMINS.includes(e)
}
/** Dispatch can actually run only when enabled AND a PR token is configured. */
export function feedbackDispatchReady(): boolean {
  return FEEDBACK_DISPATCH_ENABLED && CODE_PR_TOKEN.length > 0
}

// ---- data-pipeline: relevance scan + connector-build dispatch (pipeline-scan.ts, connector-dispatch.ts) ----
// The "surface a data gap → add a source → scan its relevance → build a durable connector → open a PR" loop
// that the commodity/research "Data Pipeline" panel drives. Two separately-gated actions:
//   • SCAN — an internal, READ-ONLY web agent (WebFetch/WebSearch/Read only; no repo write, no git) that
//     judges whether a user-added source feeds the run's open data_needs. Cheap; authed like the Ask chat
//     (host keychain OAuth), so it needs no PR token — only the enable flag below.
//   • BUILD — a privileged coding agent that can author a connector PR. A fresh worktree, narrow PR token,
//     and prompt instructions are useful containment, but they are NOT a network boundary: a
//     bypassPermissions agent could resolve an admitted hostname again after the server's DNS preflight.
//     Therefore automatic build/repair dispatch remains unavailable until the runtime ships and verifies an
//     OS/container-enforced egress sandbox. The ordinary human branch → PR workflow remains available.
//
// The operator switch is explicit (only the exact value "1" requests dispatch), but it cannot override the
// missing isolation primitive. Do not replace `connectorAgentIsolationReady()` with an environment assertion
// or a one-time DNS check; neither enforces where the child process can connect.
export const PIPELINE_SCAN_ENABLED = process.env.ENGINE_PIPELINE_SCAN_ENABLED !== '0'
export const CONNECTOR_DISPATCH_ENABLED = process.env.ENGINE_CONNECTOR_DISPATCH_ENABLED === '1'
/** The read-only relevance scan can run when it is enabled (it needs no PR token — keychain-authed like chat). */
export function pipelineScanReady(): boolean {
  return PIPELINE_SCAN_ENABLED
}
/**
 * No network-enforced connector-agent launcher is shipped in this runtime yet.
 *
 * This deliberately cannot be enabled with an environment variable: an assertion such as
 * `ENGINE_CONNECTOR_EGRESS_ISOLATED=1` is not proof that the spawned process is actually isolated. When an
 * enforceable launcher is added, its own executable preflight belongs here and this function can return its
 * verified result.
 */
export function connectorAgentIsolationReady(): boolean {
  return false
}

/** Automatic connector build/repair dispatch needs explicit opt-in, a PR token, and enforced isolation. */
export function connectorDispatchReady(): boolean {
  return CONNECTOR_DISPATCH_ENABLED && CODE_PR_TOKEN.length > 0 && connectorAgentIsolationReady()
}

// Connector operations: the cadence runner that keeps built connectors fresh may default on; privileged
// auto-repair is explicit opt-in and still cannot run without an enforceable isolation backend.
//   • The RUNNER only fetches PUBLIC data on a cadence — no secret, no git — so it is safe to have on by
//     default; that is what keeps feeds fresh "forever" with zero setup.
//   • AUTO-REPAIR opens a PR through the same privileged agent and is therefore held behind the same
//     enforceable-isolation gate. The fetch runner remains independent and may stay on while repair is manual.
export const CONNECTOR_RUNNER_ENABLED = process.env.ENGINE_CONNECTOR_RUNNER_ENABLED !== '0'
export const CONNECTOR_AUTO_REPAIR_ENABLED = process.env.ENGINE_CONNECTOR_AUTO_REPAIR === '1'
/** The cadence runner runs when it is enabled. */
export function connectorRunnerReady(): boolean {
  return CONNECTOR_RUNNER_ENABLED
}
/** Auto-repair runs only with runner + explicit repair opt-in + the complete isolated dispatch gate. */
export function connectorAutoRepairReady(): boolean {
  return CONNECTOR_RUNNER_ENABLED && CONNECTOR_AUTO_REPAIR_ENABLED && connectorDispatchReady()
}
// (PIPELINE_SCAN + CONNECTOR_BUILD + CONNECTOR_RUNNER + CONNECTOR_REPAIR guard objects are defined below,
// after capNum is in scope.)

// ---- feedback → reporter email (feedback-email.ts) ----
// When a teammate marks a feedback item "done", the person who filed it is emailed that it's resolved,
// via the Munshot raw-email API. The token is a SECRET: it lives in the out-of-repo config dir
// (providers.env → load-env.ts), so it is never committed AND is scrubbed from every research/screener
// child run (launcher.childEnv drops providerEnvKeys). Follows the codebase idiom "on iff a secret is
// present, with an explicit off switch": no token ⇒ the feature is silently dark (no send attempted), so
// a deploy without the token behaves exactly as before. Endpoint + app URL + timeout are env-tunable.
export const FEEDBACK_EMAIL = {
  // The only secret. Absent → the resolution-email feature stays off (no send, no ledger record).
  token: process.env.MUNSHOT_EMAIL_TOKEN || '',
  // Raw-email endpoint. Accepts { email, subject, html } with a Bearer token (user OR team token).
  endpoint: process.env.MUNSHOT_EMAIL_ENDPOINT || 'https://devde.muns.io/email/send/raw',
  // Master switch: ON iff a token exists. MUNSHOT_EMAIL_ENABLED=0 forces off even with a token.
  enabled: process.env.MUNSHOT_EMAIL_ENABLED === '0' ? false : Boolean(process.env.MUNSHOT_EMAIL_TOKEN),
  // Public cockpit origin — the "Open the cockpit" button + the deep-link back to the filed-from page.
  appUrl: (process.env.ENGINE_PUBLIC_APP_URL || 'https://app.nostra-demus.com').replace(/\/+$/, ''),
  // Hard wall-clock cap on the outbound send so a hung email service can never delay the request path.
  // Parsed inline (not via capNum) because this block is defined ABOVE capNum's declaration — using the
  // const before its initializer runs would be a temporal-dead-zone crash at module load.
  timeoutMs: (() => { const n = Number(process.env.MUNSHOT_EMAIL_TIMEOUT_MS); return Number.isFinite(n) && n > 0 ? n : 12_000 })(),
}
/** The resolution-email feature can send only when enabled AND a token is configured. */
export function feedbackEmailReady(): boolean {
  return FEEDBACK_EMAIL.enabled && FEEDBACK_EMAIL.token.length > 0
}

// Default-on: orchestrate a full run as a CHAIN of separate per-module runs (each its own budget), in
// dependency order, then the master synthesizer — instead of one monolithic /research:full process. The
// scheduler is provider-neutral: Claude and Codex receive the same frozen provider/profile on every step.
// No single parent turn/budget can truncate the whole pipeline. ENGINE_FULL_PER_MODULE=0 is the explicit
// emergency rollback to the legacy monolithic command; a missing variable must never silently restore the
// failure-prone path on a new host or launch configuration.
export const FULL_PER_MODULE = process.env.ENGINE_FULL_PER_MODULE !== '0'

export type LaunchKind = 'full' | 'module' | 'agent' | 'rerun' | 'review' | 'track' | 'doc-intake'
  | 'signal' | 'sweep' | 'screener-agent' | 'handoff' | 'conviction' | 'parity'

// Runaway / cost guards per launch granularity. These are HARD ceilings: the headless CLI stops when it
// hits the budget/turn cap, even mid-run. The earlier full-run defaults (800 turns / $60) truncated a
// large, data-heavy company (TMCV) before the catalyst module + master synthesizer ran — leaving no
// final thesis/memo. Defaults are now generous enough to finish a full 6-module + master run for a
// data-heavy company, and every cap is env-tunable so they can be raised/lowered without a code change.
const capNum = (v: string | undefined, d: number) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : d
}
// Like capNum, but 0 is a valid, meaningful value rather than "unset" — for switches documented as "0
// disables" (the enrich-heal repair/cold-discovery caps below). capNum's n>0 guard silently substituted
// the default for an explicit "0", making that documented disable switch unreachable via env var at all
// (Codex review, PR #350).
const capNumOrZero = (v: string | undefined, d: number) => {
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : d
}

// Parse the Gemini rotation pool from a comma-separated "model:rpd" list (rpd optional). Each model is a
// SEPARATE per-project-per-model free daily bucket, and the live console shows the RPD limit varies WILDLY
// by model (3.1-flash-lite = 500/day, the 2.5/3.x flash family = 20/day each). Carrying a per-model cap
// lets the lead high-RPD model run to its real ceiling instead of being throttled to the smallest.
function parseGeminiPool(v: string | undefined, fallbackCap: number): { model: string; dailyReqCap: number }[] {
  return String(v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const [model, rpd] = entry.split(':').map((x) => x.trim())
      const cap = Number(rpd)
      return { model, dailyReqCap: Number.isFinite(cap) && cap > 0 ? cap : fallbackCap }
    })
    .filter((e) => e.model)
}

// An OpenAI-compatible free overflow provider (OpenRouter, NVIDIA NIM, …). The triage loop tries these in
// order after Groq is paced/capped, each with its own daily budget file + rate limiter. Adding another such
// key is a single entry in buildOverflowProviders() below — no engine-code change anywhere else (§26).
export interface OverflowProvider {
  id: string // stable key — names the budget file + the cockpit chip
  label: string // human label for status/log
  color: string // CSS var for the cockpit chip (defined in tokens.css)
  apiKey: string
  // The NAME of the environment variable this provider's key comes from — never the key itself. Authentication
  // and entitlement faults use it to name the credential to repair; billing and model/endpoint faults name their
  // own root cause instead. Safe to persist/display because it is a variable name, not a secret.
  keyEnvVar?: string
  baseUrl: string // OpenAI-compatible base (…/v1)
  model: string // primary model
  models?: string[] // optional fallback chain (OpenRouter only; OpenAI standard ignores it)
  dailyReqCap: number
  rpm: number
  // Token-gated free tiers (a pool metered on ~1M tokens/DAY, ~60k tokens/min) bind on TOKENS, not requests —
  // set these to pace on the BINDING limit: tpm feeds the per-minute limiter, dailyTokenCap the daily budget.
  // Request-gated providers (OpenRouter/NVIDIA) omit them → tpm 0 + a non-binding token cap (prior behaviour).
  tpm?: number
  dailyTokenCap?: number
  maxTokens: number
  extraBody?: Record<string, unknown> // provider-specific body fields (e.g. OpenRouter reasoning effort)
  headers?: Record<string, string> // provider-specific headers (e.g. OpenRouter ranking)
  budgetFile: string
  dayTz?: string // daily reset zone (undefined = UTC)
  // Per-provider override for triageBatch's generic OpenAI-compatible call guards (groq.ts TriageOptions).
  // Omitted => triageBatch's own defaults (30_000ms, 2 attempts) — byte-for-byte the prior behaviour for
  // every existing cloud provider. Exists for a provider whose real answer time genuinely exceeds the
  // generic default (e.g. a slow local box under a large output budget) so a VALID slow response isn't
  // misread as a hang and doesn't arm the provider's cross-cycle cooldown for no reason.
  timeoutMs?: number
  maxAttempts?: number
  // Optional start-of-day allowance for the shared daily pacer. The default comes from
  // NEWS_FREE_PROVIDER_PACE_FLOOR_FRAC; a provider may override it when one useful call is unusually
  // large relative to its daily cap. The router always releases at least one admissible call, so a tiny
  // quota cannot be stranded by fractional arithmetic.
  paceFloorFrac?: number
  // True only when this provider documents its remaining-request header as a DAILY bucket. Generic
  // OpenAI-compatible headers are often per-minute and must never exhaust a persisted provider day.
  requestRemainingHeaderIsDaily?: boolean
  // Exclude this provider from the user-facing on-demand article read (buildArticleReadProviders below).
  // That path shares this provider's `id` (and so its cooldown marker) with the background triage/backlog
  // loop, but runs a short user-facing deadline (~7s, 1 attempt) — a provider that is legitimately slow
  // would time out there and arm the SAME cooldown the backlog drain relies on, sidelining it for both
  // paths over one interactive read. Set true for a provider whose value is throughput, not latency.
  skipArticleRead?: boolean
  // Routing semantics, not provider identity. Omitted means an ordinary finite direct provider that shares
  // the reset-clock quota pool with Gemini. An aggregate router waits until that whole direct pool has no
  // usable route. Its upstream pool must be dedicated/keyless and must not import credentials used by those
  // direct providers: route order and a separate local cap do not prevent double-spending a shared upstream
  // allowance. A demoted local model is deliberately later still: it is unlimited but slow. Keeping this on
  // the descriptor lets every runtime consumer preserve the chain without hard-coding a provider id.
  routeClass?: 'direct' | 'aggregate-fallback' | 'local-fallback'
}

/** OmniRoute's canonical descriptor, independent of whether the operator enabled the daemon.
 *
 * Diagnostics need to describe the optional tier even while it is off, whereas the live overflow registry
 * must stay off unless NEWS_OMNIROUTE_ENABLED=1. Keeping the descriptor in one exported helper prevents
 * those two views from drifting on model, endpoint, caps, or route semantics.
 */
export function buildOmniRouteProvider(): OverflowProvider {
  const configuredApiKey = process.env.NEWS_OMNIROUTE_API_KEY?.trim()
  return {
    id: 'omniroute', label: 'OmniRoute', color: '--provider-om',
    // Dummy non-empty key, same precedent as the local tier below: an EMPTY key is rejected before fetch
    // and would arm a cooldown for a call that never left the process. NEWS_OMNIROUTE_API_KEY, when set,
    // authenticates this daemon only; never import the engine's direct-provider credentials into OmniRoute.
    apiKey: configuredApiKey || 'omniroute',
    // Only advertise a repairable credential when the operator actually configured one. A keyless local
    // daemon must never tell diagnostics that a synthetic placeholder needs rotation.
    ...(configuredApiKey ? { keyEnvVar: 'NEWS_OMNIROUTE_API_KEY' } : {}),
    baseUrl: process.env.NEWS_OMNIROUTE_BASE_URL || 'http://127.0.0.1:20128/v1',
    // `auto/coding:free` is the zero-credential aggregate route proven against the complete production
    // 12-row scorer contract. Unlike one pinned free model, it skips a rate-limited member and tries the
    // next compatible free coding model inside the same request; live proof did exactly that when hy3 and
    // MiMo returned 429, then completed through Nemotron. `auto/best-free` is deliberately NOT used: its
    // broader pool selected request-incompatible search models during the same proof. An operator can still
    // point NEWS_OMNIROUTE_MODEL at a separately configured aggregate combo.
    model: process.env.NEWS_OMNIROUTE_MODEL || 'auto/coding:free',
    // OmniRoute may otherwise choose SSE, and this reasoning model can spend the whole output allowance
    // thinking before it emits scorer JSON. Disable reasoning so the budget is reserved for the one complete
    // non-streaming scorer document; the exact production 12-row contract passed 3/3 supervised probes.
    extraBody: { stream: false, reasoning_effort: 'none' },
    // FINITE ON PURPOSE: this bounds calls into the aggregate and keeps it out of direct providers' fair
    // selector. It cannot meter or prevent double-spend inside OmniRoute; use only dedicated/keyless upstream
    // pools there, never the same credentials whose budgets this engine tracks directly.
    dailyReqCap: capNum(process.env.NEWS_OMNIROUTE_DAILY_REQ_CAP, 6_000),
    rpm: capNum(process.env.NEWS_OMNIROUTE_RPM, 20),
    // The real 12-row route truncated at 3,500 tokens. With reasoning disabled, 7,000 completed every
    // required scorer index in four supervised probes without weakening the parser's completeness check.
    maxTokens: capNum(process.env.NEWS_OMNIROUTE_MAX_TOKENS, 7_000),
    // Those complete probes landed in 10.5–12.7s. Seventy-five seconds retains upstream-variance headroom
    // while remaining below the 120s paid-Haiku guard and the 480s cycle guard.
    timeoutMs: capNum(process.env.NEWS_OMNIROUTE_TIMEOUT_MS, 75_000),
    maxAttempts: capNum(process.env.NEWS_OMNIROUTE_MAX_ATTEMPTS, 1), // it already retried across upstreams
    skipArticleRead: true, // shares this id's cooldown with the short interactive read — see the field doc
    budgetFile: 'omniroute-budget.json',
    routeClass: 'aggregate-fallback',
    // Deliberately NO requestRemainingHeaderIsDaily: the rate parser reads only x-ratelimit-* names, so
    // OmniRoute's own X-OmniRoute-* headers are invisible to it and the flag would be a lie on a 429.
    // Deliberately NO dayTz: the aggregate resets on ~90 different clocks; no single zone is true.
  }
}

// Build the overflow chain from whatever keys are present. ONLY OpenAI-compatible providers belong here
// (Gemini is separate — it uses generateContent, not chat/completions). Order = priority (best first).
export function buildOverflowProviders(): OverflowProvider[] {
  const out: OverflowProvider[] = []
  const orKey = process.env.OPENROUTER_API_KEY || ''
  if (orKey && process.env.NEWS_OPENROUTER_ENABLED !== '0') {
    // OpenRouter's official `openrouter/free` router is the durable default: it selects from the free models
    // that are available NOW and filters for capabilities required by the request (including structured
    // output). Do not pin the default to dated `:free` slugs: those endpoints retire independently and turn a
    // healthy gateway into a permanent 404. Operators can still provide up to three deliberate, ordered
    // choices through NEWS_OPENROUTER_MODELS; OpenRouter applies that array as its server-side fallback chain.
    // Free = ~20 RPM, ~50/day pooled (no credits) → ~1000/day once $10 is loaded (free models remain $0).
    const models = (process.env.NEWS_OPENROUTER_MODELS || 'openrouter/free').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3)
    out.push({
      id: 'openrouter', label: 'OpenRouter', color: '--provider-or',
      apiKey: orKey, keyEnvVar: 'OPENROUTER_API_KEY', baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      model: models[0] || 'openrouter/free', models,
      dailyReqCap: capNum(process.env.NEWS_OPENROUTER_DAILY_REQ_CAP, 45),
      rpm: capNum(process.env.NEWS_OPENROUTER_RPM, 18),
      maxTokens: capNum(process.env.NEWS_OPENROUTER_MAX_TOKENS, 3500),
      // A free `:free` model on a shared gateway queues before it generates, and the request is NOT streamed —
      // so one deadline has to cover queue wait + prefill + the whole decode + parse. The generic 30s default
      // is tight for that: a 12-row reply is ~1,650 output tokens, which needs ~59 tok/s sustained inside 28s
      // of usable decode. Give it 75s so a SLOW-but-valid answer is not misread as a hang; the cycle guard is
      // 480s, so two providers at 75s still fit. `elapsedMs` on the failure note now records what actually
      // happens, so this number can be tuned from evidence instead of guessed at again.
      timeoutMs: capNum(process.env.NEWS_OPENROUTER_TIMEOUT_MS, 75_000),
      // Keep it OUT of the interactive article read, which runs a ~7s deadline. That path shares this id (and
      // therefore this cooldown marker) with the background scan, so a legitimately-slow provider timing out
      // there would arm the very hold the backlog drain depends on — sidelining it for both workloads.
      skipArticleRead: true,
      // Reasoning models in the live free pool get a small thinking budget; non-reasoning routes safely ignore
      // this optional gateway-normalized control. The JSON response contract still decides whether a call won.
      extraBody: { reasoning: { effort: 'low' } },
      headers: { 'HTTP-Referer': 'https://app.nostra-demus.com', 'X-Title': 'Nostradamus Screener' },
      budgetFile: 'openrouter-budget.json',
    })
  }
  const nvKey = process.env.NVIDIA_API_KEY || ''
  if (nvKey && process.env.NEWS_NVIDIA_ENABLED !== '0') {
    // NVIDIA NIM hosted API: free, generous, OpenAI-compatible. Use a fast NON-reasoning model
    // (llama-3.3-70b); the nemotron/gpt-oss reasoning models are slow + flaky there. No fallback array.
    out.push({
      id: 'nvidia', label: 'NVIDIA NIM', color: '--provider-nv',
      apiKey: nvKey, keyEnvVar: 'NVIDIA_API_KEY', baseUrl: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
      model: process.env.NEWS_NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct',
      // NVIDIA free is a FINITE credit pool (~1,000, →5,000 with a business email) that EXPIRES in ~30 days,
      // not a daily-resetting tier — so it's a temporary high-quality boost. Ration ~150/day so a 5,000 pool
      // lasts the ~30 days; if it's the 1,000 pool it burns out sooner and the loop's 4xx-exhaust skips it.
      dailyReqCap: capNum(process.env.NEWS_NVIDIA_DAILY_REQ_CAP, 150),
      rpm: capNum(process.env.NEWS_NVIDIA_RPM, 36),
      maxTokens: capNum(process.env.NEWS_NVIDIA_MAX_TOKENS, 2000),
      // Same reasoning as OpenRouter above: non-streamed, one deadline for queue + prefill + full decode, and
      // the generic 30s is tight for a batched structured reply. It matters MORE here than anywhere else on the
      // roster: NVIDIA's free pool is a FINITE credit grant that EXPIRES in ~30 days, so a request lost to a
      // deadline we set is not deferred spend, it is spend destroyed.
      timeoutMs: capNum(process.env.NEWS_NVIDIA_TIMEOUT_MS, 75_000),
      skipArticleRead: true, // see the OpenRouter note — the ~7s interactive read shares this cooldown marker
      budgetFile: 'nvidia-budget.json',
    })
  }
  // OmniRoute — a SELF-HOSTED OpenAI-compatible gateway (127.0.0.1:20128). The zero-config model is one
  // proven keyless route; NEWS_OMNIROUTE_MODEL may instead name an operator-configured aggregate combo. Any
  // such combo must stay dedicated/keyless: do not import credentials this engine already meters directly.
  //
  // LAST among the free cloud tiers ON PURPOSE: direct providers spend their released capacity first; this
  // gateway fallback is reached when they are paced, parked, or fail through. Its independent request cap
  // cannot prevent upstream double-spend if an operator-configured combo violates the isolation rule above.
  //
  // EXPLICIT OPT-IN (=== '1'), not the siblings' "key present unless disabled": a cloud tier cannot exist
  // without a key, so its key IS proof someone provisioned it. OmniRoute needs no key, so nothing but this
  // flag separates "the daemon is running" from "never installed". Default-on would add a sixth
  // ECONNREFUSED tier to every box that never installed it, and would make the has-a-scoring-provider test
  // true on a box with no LLM access at all — replacing an honest "ingester idle" note with a cycle that
  // fails six ways.
  if (process.env.NEWS_OMNIROUTE_ENABLED === '1') {
    out.push(buildOmniRouteProvider())
  }
  // Local model: by default (once NEWS_LOCAL_ENABLED=1) it is the PRIMARY brain — tried FIRST in runCycle and
  // exposed via NEWS.localProvider, NOT part of this overflow chain. It stays here as the LAST free fallback
  // ONLY when the operator opts out of primary with NEWS_LOCAL_PRIMARY=0 (the prior "local absorbs the tail"
  // placement). See buildLocalProvider() below for the full rationale.
  if (!localIsPrimary()) { const local = buildLocalProvider(); if (local) out.push(local) }
  return out
}

// The LOCAL model tier (Ollama / llama.cpp / LM Studio) — the ONLY tier that is unlimited, never rate-limited,
// and $0. OpenAI-compatible (/v1/chat/completions), so it reuses the exact same call path — no new provider
// code. It runs on a separate always-available box (a Mac mini / M-series Air on the LAN), reached over
// NEWS_LOCAL_BASE_URL. When that box sleeps or is unreachable, the loop's 429/network handling arms a SHORT
// cooldown (NEWS.localCooldownMs) and falls straight through to the cloud fallback chain — so a part-time box
// degrades gracefully and never stalls the pipeline. OFF by default: enable with NEWS_LOCAL_ENABLED=1.
//
// PRIMARY BY DEFAULT (NEWS_LOCAL_PRIMARY, default on once enabled). Because it is unlimited and $0, once a local
// box is up it should carry the WHOLE scan and everything else is fallback — so runCycle tries it FIRST, ahead
// of Groq, for every batch. This is the deliberate owner choice to trade the marginal quality of a cloud
// 70B/120B pre-read for NEVER hitting a ceiling and NEVER losing an item to a daily cap. Set NEWS_LOCAL_PRIMARY=0
// to revert to the old "local is the LAST free fallback" placement (it then rejoins buildOverflowProviders).
//   - MODEL: default qwen2.5:7b-instruct. On a 16GB Apple-Silicon box it fits in ~4.7GB at 4-bit and is the
//     strongest small model at the two things triage leans on — reliable batched JSON and non-English
//     headline translation (llama-3.1-8b, the Groq fallback, is weaker at both). Override via NEWS_LOCAL_MODEL.
//   - KEY: a local server needs none, but the OpenAI-compatible call path skips any provider with an empty
//     apiKey, so we send a harmless dummy ('local'); Ollama/llama.cpp ignore the Bearer header.
//   - UNLIMITED: rpm 0 -> no per-minute spacing (RateLimiter treats 0 as "no gap"); no tpm/dailyTokenCap; a
//     huge dailyReqCap so canSpend() never blocks. There is deliberately NO ceiling here — it processes 24x7.
//   - TIMEOUT: a 7-8B model at ~15-25 tok/s answering up to maxTokens (3500) output tokens can legitimately run
//     past triageBatch's generic 30s default — a valid slow answer, not a hang. timeoutMs raises the ceiling;
//     maxAttempts 1 avoids doubling that wait on a genuine failure (a real outage is caught by the SHORT
//     cross-cycle cooldown probe on the next cycle, which recovers fast because local has no cap to protect).
//   - ARTICLE READ: skipArticleRead keeps this tier OUT of buildArticleReadProviders — the interactive read runs
//     a short ~7s deadline a legitimately-slow local answer would trip, arming the shared cooldown. Local's
//     value is background-scan throughput, not one interactive article; reads keep using the cloud chain.
export function buildLocalProvider(): OverflowProvider | null {
  if (process.env.NEWS_LOCAL_ENABLED !== '1') return null
  return {
    id: 'local', label: 'Local', color: '--provider-local',
    apiKey: process.env.NEWS_LOCAL_API_KEY || 'local', // dummy non-empty — see KEY note above
    baseUrl: process.env.NEWS_LOCAL_BASE_URL || 'http://localhost:11434/v1',
    model: process.env.NEWS_LOCAL_MODEL || 'qwen2.5:7b-instruct',
    dailyReqCap: capNum(process.env.NEWS_LOCAL_DAILY_REQ_CAP, 100_000_000), // effectively unlimited — no ceiling
    rpm: capNum(process.env.NEWS_LOCAL_RPM, 0), // 0 -> no per-minute spacing (a local model has no rate limit)
    timeoutMs: capNum(process.env.NEWS_LOCAL_TIMEOUT_MS, 120_000), // 4-8x the generic default — see TIMEOUT note
    maxAttempts: capNum(process.env.NEWS_LOCAL_MAX_ATTEMPTS, 1), // don't double the wait on a real failure
    skipArticleRead: true, // see ARTICLE READ note above
    maxTokens: capNum(process.env.NEWS_LOCAL_MAX_TOKENS, 3_500),
    budgetFile: 'local-budget.json',
    routeClass: 'local-fallback',
  }
}

/** Is the local tier the PRIMARY brain (tried first for every batch, everything else fallback)? On by default
 *  once local is enabled; NEWS_LOCAL_PRIMARY=0 reverts to the old "local is the last free fallback" placement. */
export function localIsPrimary(): boolean {
  return process.env.NEWS_LOCAL_ENABLED === '1' && process.env.NEWS_LOCAL_PRIMARY !== '0'
}

// Materialize the canonical OpenAI-compatible provider registry once. NEWS.enabled is a scheduler gate,
// not a Groq gate: any configured triage provider can keep the system alive when Groq is absent or spent.
// Gemini remains a native generateContent provider (outside this OpenAI-compatible registry) but is also
// sufficient to run news triage. Explicit NEWS_INGEST_ENABLED=0 remains authoritative below.
const CONFIGURED_LOCAL_PROVIDER = localIsPrimary() ? buildLocalProvider() : null
const CONFIGURED_OVERFLOW_PROVIDERS = buildOverflowProviders()
const CONFIGURED_ANTHROPIC_PROVIDER = process.env.NEWS_ANTHROPIC_FALLBACK_ENABLED !== '0'
  && ((process.env.NEWS_ANTHROPIC_FALLBACK_MODE || 'subscription') === 'subscription'
    || Boolean(process.env.NEWS_ANTHROPIC_FALLBACK_API_KEY))
const NEWS_IDEA_PROVIDER_CONFIGURED = Boolean(
  process.env.GROQ_API_KEY
  || CONFIGURED_LOCAL_PROVIDER
  || CONFIGURED_OVERFLOW_PROVIDERS.length > 0
  || (process.env.GEMINI_API_KEY && process.env.NEWS_GEMINI_ENABLED !== '0')
)
const NEWS_PROVIDER_CONFIGURED = Boolean(
  NEWS_IDEA_PROVIDER_CONFIGURED
  || (process.env.GEMINI_API_KEY && process.env.NEWS_GEMINI_ENABLED !== '0')
  || CONFIGURED_ANTHROPIC_PROVIDER
)
// A run that produces NO output at all for this long is hung, not working. There was previously no
// wall-clock ceiling of any kind on a research run (execa is spawned with no `timeout`), and the
// dead-run reaper only catches a pid that has already exited — never one that is alive and stuck. So a
// wedged child could hold its run slot indefinitely with nothing to show and nothing said. This is
// deliberately a STALL guard, not a duration cap: a legitimately long run (a full company pass is
// hours) keeps its slot for as long as it keeps emitting, and only genuine silence trips it. 0 disables.
export const RUN_STALL_MINUTES = capNumOrZero(process.env.ENGINE_RUN_STALL_MINUTES, 45)

export const LAUNCH_GUARDS: Record<LaunchKind, { maxTurns: number; budgetUsd: number }> = {
  full: { maxTurns: capNum(process.env.ENGINE_FULL_MAX_TURNS, 2500), budgetUsd: capNum(process.env.ENGINE_FULL_BUDGET_USD, 300) },
  // Raised 2026-08-20. The 350/$56 pair was set 2026-06-07 for modules of ~8 orbs. PR #433 (2026-08-14)
  // took management-governance 8 -> 14 orbs, and its orbs are the heaviest in the engine (a 35k-token
  // MODULE_RULES vs business-model's 3k, and a ~59.5k fixed preamble per orb). MEASURED on INDIAMART
  // 2026-08-19: a 12-of-14 run cost $51.97 and a complete run computes to $55.52 — 99.1% of the old cap,
  // i.e. zero headroom, so it died near the end every time. Worse, layer 2 dispatches TEN agents
  // (~$37) in ONE concurrent wave and the budget is only checked between orchestrator turns, so a wave
  // starting near the cap can overshoot it. (An earlier version of this note claimed "$56 produced a
  // $69 run" — that was WRONG: $69 was a cockpit GROUP row summing three separate runs, and no single
  // run above $51.97 exists in the corpus. The raise stands on the measured $55.9; the false evidence
  // does not.) The new ceiling carries the measured cost plus a full wave of overshoot.
  module: { maxTurns: capNum(process.env.ENGINE_MODULE_MAX_TURNS, 800), budgetUsd: capNum(process.env.ENGINE_MODULE_BUDGET_USD, 120) },
  // Raised 2026-08-20 alongside `module`. Single-orb re-runs are the documented fallback when a module
  // stalls, but the heaviest governance orbs no longer fit: MEASURED on INDIAMART 2026-08-19,
  // audit-and-assurance-quality took 64 calls (over the old 60 ceiling) and people-integrity-dossiers
  // cost $8.09 against a $12 cap — so the fallback failed on exactly the orbs a user would need it for.
  agent: { maxTurns: capNum(process.env.ENGINE_AGENT_MAX_TURNS, 150), budgetUsd: capNum(process.env.ENGINE_AGENT_BUDGET_USD, 25) },
  // re-run one orb + its downstream synthesis chain to the master: between a module and a full run.
  rerun: { maxTurns: capNum(process.env.ENGINE_RERUN_MAX_TURNS, 1200), budgetUsd: capNum(process.env.ENGINE_RERUN_BUDGET_USD, 160) },
  // file one outcome review (read decision_record + thesis, optional web price fetch, write a review JSON).
  review: { maxTurns: capNum(process.env.ENGINE_REVIEW_MAX_TURNS, 120), budgetUsd: capNum(process.env.ENGINE_REVIEW_BUDGET_USD, 20) },
  // rebuild the calls-tracker dashboard (read-only aggregate of records + reviews; no web).
  track: { maxTurns: capNum(process.env.ENGINE_TRACK_MAX_TURNS, 120), budgetUsd: capNum(process.env.ENGINE_TRACK_BUDGET_USD, 20) },
  // read the docs that landed since the last run + write a scoped rerun plan (frameworks/INTAKE.md);
  // cheap read-reason-write pass, launches no rerun — same shape as 'review'.
  'doc-intake': { maxTurns: capNum(process.env.ENGINE_INTAKE_MAX_TURNS, 120), budgetUsd: capNum(process.env.ENGINE_INTAKE_BUDGET_USD, 20) },
  // screener swarm — one signal through the whole gauntlet (4 modules, ~13 agents, fail-fast gates
  // mean most signals stop early and cost far less than the ceiling).
  signal: { maxTurns: capNum(process.env.ENGINE_SIGNAL_MAX_TURNS, 900), budgetUsd: capNum(process.env.ENGINE_SIGNAL_BUDGET_USD, 100) },
  // market sweep: WebSearch across approved sources -> inbox JSON only (no gauntlet work).
  sweep: { maxTurns: capNum(process.env.ENGINE_SWEEP_MAX_TURNS, 120), budgetUsd: capNum(process.env.ENGINE_SWEEP_BUDGET_USD, 20) },
  // one screener orb into an existing signal run (mirror of research 'agent').
  'screener-agent': { maxTurns: capNum(process.env.ENGINE_SCREENER_AGENT_MAX_TURNS, 60), budgetUsd: capNum(process.env.ENGINE_SCREENER_AGENT_BUDGET_USD, 12) },
  // idempotent thesis->ticker handoff: read the locked record, write one data-pool memo + ledger line.
  handoff: { maxTurns: capNum(process.env.ENGINE_HANDOFF_MAX_TURNS, 60), budgetUsd: capNum(process.env.ENGINE_HANDOFF_BUDGET_USD, 10) },
  conviction: { maxTurns: capNum(process.env.ENGINE_SCREENER_VALIDATE_MAX_TURNS, 60), budgetUsd: capNum(process.env.ENGINE_SCREENER_VALIDATE_BUDGET_USD, 10) },
  parity: { maxTurns: capNum(process.env.ENGINE_PARITY_MAX_TURNS, 240), budgetUsd: capNum(process.env.ENGINE_PARITY_BUDGET_USD, 40) },
}

// Guards for the read-only relevance-scan agent (pipeline-scan.ts) — a short, cheap, tool-limited web read,
// kept well under the chat caps. Defined here (not in the dispatch block above) because capNum is in scope.
export const PIPELINE_SCAN = {
  model: process.env.ENGINE_PIPELINE_SCAN_MODEL || DEFAULT_MODEL,
  maxTurns: capNum(process.env.ENGINE_PIPELINE_SCAN_MAX_TURNS, 20),
  budgetUsd: capNum(process.env.ENGINE_PIPELINE_SCAN_BUDGET_USD, 3),
  timeoutMs: capNum(process.env.ENGINE_PIPELINE_SCAN_TIMEOUT_MS, 180_000),
  maxConcurrent: capNum(process.env.ENGINE_PIPELINE_SCAN_MAX_CONCURRENT, 2),
}
// Guards for the read-only feed-DISCOVERY agent (pipeline-discover.ts). Same locked toolset and same
// concurrency pool as the scan, but a wider job (search the open web, fetch several candidates, compare them),
// so it gets its own, larger turn/budget/time ceilings rather than silently borrowing the scan's.
export const PIPELINE_DISCOVER = {
  maxTurns: capNum(process.env.ENGINE_PIPELINE_DISCOVER_MAX_TURNS, 40),
  budgetUsd: capNum(process.env.ENGINE_PIPELINE_DISCOVER_BUDGET_USD, 6),
  timeoutMs: capNum(process.env.ENGINE_PIPELINE_DISCOVER_TIMEOUT_MS, 420_000),
}
// Hard ceilings for the connector-build coding agent (connector-dispatch.ts) — its OWN caps, never shared
// with feedback dispatch (a concurrent feedback + connector burst must not corrupt each other's counters).
export const CONNECTOR_BUILD = {
  maxConcurrent: capNum(process.env.ENGINE_CONNECTOR_MAX_CONCURRENT, 1),
  dailyCap: capNum(process.env.ENGINE_CONNECTOR_DAILY_CAP, 8),
  maxTurns: capNum(process.env.ENGINE_CONNECTOR_MAX_TURNS, 200),
  budgetUsd: capNum(process.env.ENGINE_CONNECTOR_BUDGET_USD, 15),
}
// The cadence runner (connector-runner.ts) — how often it wakes, and the ceilings on one fetch sweep.
export const CONNECTOR_RUNNER = {
  pollIntervalMin: capNum(process.env.ENGINE_CONNECTOR_POLL_MIN, 30),
  fetchTimeoutMs: capNum(process.env.ENGINE_CONNECTOR_FETCH_TIMEOUT_MS, 60_000),
  maxConcurrentFetch: capNum(process.env.ENGINE_CONNECTOR_MAX_CONCURRENT_FETCH, 2),
  dailyFetchCap: capNum(process.env.ENGINE_CONNECTOR_DAILY_FETCH_CAP, 500),
}
// The auto-repair coding agent (connector-repair.ts) — its OWN caps + cooldown, never shared with build.
export const CONNECTOR_REPAIR = {
  maxConcurrent: capNum(process.env.ENGINE_CONNECTOR_REPAIR_MAX_CONCURRENT, 1),
  dailyCap: capNum(process.env.ENGINE_CONNECTOR_REPAIR_DAILY_CAP, 4),
  cooldownHours: capNum(process.env.ENGINE_CONNECTOR_REPAIR_COOLDOWN_HOURS, 12),
  maxTurns: capNum(process.env.ENGINE_CONNECTOR_REPAIR_MAX_TURNS, 200),
  budgetUsd: capNum(process.env.ENGINE_CONNECTOR_REPAIR_BUDGET_USD, 15),
}

// ---- in-cockpit "chat with your data" (closed-book Q&A over a run's synthesized output) ----
// A side-panel chat answers questions using ONLY the engine's own output for a chosen scope (the whole
// run / one module / one orb), through the selected local subscription CLI (Claude or Codex; no API key).
// It is NOT a research run: it bypasses the run registry + admission and carries its own light guards.
// Every knob is env-tunable.
export const CHAT = {
  // default model + the allow-list the panel's model switcher may pick from. Validated server-side so a
  // tampered request can't pass an arbitrary `--model`. Provider-qualified Codex ids keep routing explicit.
  defaultModel: (process.env.ENGINE_CHAT_MODEL || DEFAULT_CHAT_MODEL_ID).trim().toLowerCase(),
  allowedModels: (process.env.ENGINE_CHAT_MODELS_ALLOWED || DEFAULT_CHAT_MODEL_IDS).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
  // HARD per-turn ceiling for Claude (the subscription CLI stops at it). Codex plan turns do not expose a
  // per-turn dollar meter; they remain bounded by the same timeout, concurrency, one-turn and no-tool guards.
  budgetUsd: capNum(process.env.ENGINE_CHAT_BUDGET_USD, 3),
  // wall-clock cap on one turn — past it the child is killed and the turn errors (so it can never hang).
  timeoutMs: capNum(process.env.ENGINE_CHAT_TIMEOUT_MS, 120_000),
  // most chat turns in flight at once (a light backstop; chat is cheap but each spawns a CLI).
  maxConcurrent: capNum(process.env.ENGINE_CHAT_MAX_CONCURRENT, 3),
  // assembled-context cap (approx tokens). Above it, module/run scopes degrade to syntheses and SAY SO,
  // keeping the prompt within the model's window with room left for the answer.
  contextMaxTokens: capNum(process.env.ENGINE_CHAT_CONTEXT_MAX_TOKENS, 150_000),
  // extended-thinking budget for a chat turn (MAX_THINKING_TOKENS on the child). The panel streams the
  // model's reasoning live while the user waits — real thought process, not a fabricated status. 0 turns
  // thinking off (capNum treats 0 as unset, so parse it directly); a host-set MAX_THINKING_TOKENS wins.
  thinkingTokens: (() => { const n = Number(process.env.ENGINE_CHAT_THINKING_TOKENS); return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 6_000 })(),
  // Caps on one what-if PARSE call (chat-whatif.ts): the parse runs on the SAME model the panel's
  // selector picked for the turn (one selector, one model — no separate parser knob), but as a
  // deliberately small call — a tight wall-clock, thinking disabled, and its OWN small $ ceiling (so a
  // what-if turn can never consume two full CHAT.budgetUsd budgets). Past either cap → no card, the turn
  // proceeds as a normal closed-book answer. The parse's cost is added into the turn's reported cost.
  parserTimeoutMs: capNum(process.env.ENGINE_CHAT_PARSER_TIMEOUT_MS, 25_000),
  parserBudgetUsd: capNum(process.env.ENGINE_CHAT_PARSER_BUDGET_USD, 0.25),
}

// ---- autonomous news ingester (screener swarm) ----
// The "forever-living" front door of the screener: pull a free news firehose (GDELT, keyless),
// score each item with a FREE LLM (Groq) as a cheap brain, and fill a RANKED inbox — all at ~$0.
// It writes the same inbox contract the manual /screener:sweep already fills, so nothing downstream
// changes. It never charges a card by default: the only Claude seam that is ON is priority-1 triage,
// which runs on the host's flat-fee SUBSCRIPTION via the local `claude` CLI (no API key) and is
// bounded by a daily $ ceiling — that ceiling doubles as the governor stopping news triage from starving
// the research runs it shares the plan with. The theme namer is metered and stays off unless a key is set.
// The expensive gauntlet stays free of both: promoting an inbox row into the paid gauntlet stays the
// human's one-click action (the cockpit "check it ▸" button). Auto-promote is intentionally absent.
//
// Every knob is env-tunable; the loop is OFF unless at least one triage provider is configured, so a
// providerless deploy behaves exactly as before. Defaults sit well under Groq's free-tier ceilings (~1k req/day,
// ~100-200k tokens/day) with margin, so a smartly-batched cycle never trips a rate limit.
export const NEWS = {
  // The grandfathered primary secret. Its absence no longer disables a configured fallback chain.
  groqApiKey: process.env.GROQ_API_KEY || '',
  // A small, fast, cheap Groq model is ideal for batched title-triage. Model ids change — confirm
  // the current free model when you provision the key. Override with GROQ_MODEL.
  // `llama-3.1-8b-instant` was DEPRECATED by Groq on 2026-06-17 and SHUT DOWN on 2026-08-16, so from that
  // date the primary triage tier 404'd on every call — the cockpit's "waiting after a retired model or
  // endpoint", 71 consecutive failures and 0 batches scored, while the backlog climbed toward the 100k
  // loss boundary. Groq's own named replacement for it is `openai/gpt-oss-20b`. A retired model id is a
  // silent, dated cliff: nothing in the engine expires with the provider. The shared classifier now quarantines
  // an evidenced model/endpoint 404 without a retry timer; a changed model fingerprint or successful canary
  // reopens it. An ambiguous 404 is kept separate as request/configuration failure and never blamed on the key.
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  groqBaseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
  // Public-news chat stays on the stronger subscription model first. If that provider is temporarily
  // unavailable, the already-configured Groq connection may finish the same closed-book, cited answer.
  // This never applies to research-report chat and never grants the backup model tools.
  chatGroqFallbackEnabled: process.env.NEWS_CHAT_GROQ_FALLBACK_ENABLED !== '0',
  chatGroqFallbackTimeoutMs: capNum(process.env.NEWS_CHAT_GROQ_FALLBACK_TIMEOUT_MS, 45_000),
  chatGroqFallbackMaxTokens: capNum(process.env.NEWS_CHAT_GROQ_FALLBACK_MAX_TOKENS, 700),
  // One reservation spans neural retrieval, archive streaming, primary completion, and fallback. This is
  // deliberately separate from runChatTurn's subprocess counter: archive work must be admitted before it
  // starts, and a fallback must keep the same slot instead of racing a second request.
  chatMaxConcurrent: capNum(process.env.NEWS_CHAT_MAX_CONCURRENT, 2),
  chatRateLimitPerMinute: capNum(process.env.NEWS_CHAT_RATE_LIMIT_PER_MINUTE, 20),
  // A user-facing fallback will wait only briefly for the shared ingestion minute window. It does not get
  // a private untracked lane around Groq's limiter/budget/cooldown.
  chatGroqFallbackLimiterWaitMs: capNum(process.env.NEWS_CHAT_GROQ_FALLBACK_LIMITER_WAIT_MS, 2_500),
  // CLOUD ARCHIVE — the raw-news firehose files are mirrored to a Google Drive for Desktop mount folder
  // (the news-archive launchd agent copies them there; Drive uploads to the cloud). Local files older than
  // the retention window are then pruned, so the laptop disk stays bounded while the full history lives in
  // the cloud. readFeed falls back to this folder for days no longer on local disk, so the time-travel
  // filter still spans the whole archive. Empty → no cloud archive (read local only).
  newsArchiveDir: process.env.NEWS_ARCHIVE_DIR || '',
  newsLocalRetentionDays: capNum(process.env.NEWS_LOCAL_RETENTION_DAYS, 30), // days of firehose + pipeline audit telemetry kept locally
  // Scanner-triage provider routing only. `auto` records the current route and its adaptive shadow for a
  // complete day before it is allowed to change provider order. While learning, one in ten real batches may
  // verify an overdue eligible backup; that bounded in-band canary is what lets the two-provider evidence
  // gate complete without extra traffic or separate budget accounting. Explicit `shadow` never changes
  // order; `static` is the emergency kill switch. An unreadable audit ledger always overrides auto and keeps
  // the static route.
  providerRouterMode: (() => {
    const raw = String(process.env.NEWS_PROVIDER_ROUTER_MODE || 'auto').trim().toLowerCase()
    return raw === 'static' || raw === 'shadow' ? raw : 'auto'
  })() as 'auto' | 'shadow' | 'static',
  providerRouterShadowHours: capNum(process.env.NEWS_PROVIDER_ROUTER_SHADOW_HOURS, 24),
  providerRouterMinOutcomes: capNum(process.env.NEWS_PROVIDER_ROUTER_MIN_OUTCOMES, 20),
  // OPTIONAL neural retrieval. The deterministic hybrid search is always present; these two provider
  // seams add a compact embedding index and a second-stage rerank when an operator supplies an
  // OpenAI-compatible endpoint. They never borrow a triage key silently and fail open to hybrid search.
  retrievalEmbeddingEnabled: process.env.NEWS_RETRIEVAL_EMBEDDING_ENABLED === '1',
  retrievalEmbeddingApiKey: process.env.NEWS_RETRIEVAL_EMBEDDING_API_KEY || '',
  retrievalEmbeddingBaseUrl: process.env.NEWS_RETRIEVAL_EMBEDDING_BASE_URL || 'https://api.openai.com/v1',
  retrievalEmbeddingModel: process.env.NEWS_RETRIEVAL_EMBEDDING_MODEL || 'text-embedding-3-small',
  retrievalEmbeddingTimeoutMs: capNum(process.env.NEWS_RETRIEVAL_EMBEDDING_TIMEOUT_MS, 20_000),
  retrievalEmbeddingBatchSize: capNum(process.env.NEWS_RETRIEVAL_EMBEDDING_BATCH_SIZE, 64),
  retrievalEmbeddingMaxItemsPerCycle: capNum(process.env.NEWS_RETRIEVAL_EMBEDDING_MAX_ITEMS_PER_CYCLE, 256),
  retrievalRerankEnabled: process.env.NEWS_RETRIEVAL_RERANK_ENABLED === '1',
  retrievalRerankApiKey: process.env.NEWS_RETRIEVAL_RERANK_API_KEY || '',
  retrievalRerankBaseUrl: process.env.NEWS_RETRIEVAL_RERANK_BASE_URL || 'https://api.openai.com/v1',
  retrievalRerankModel: process.env.NEWS_RETRIEVAL_RERANK_MODEL || 'gpt-5-mini',
  retrievalRerankTimeoutMs: capNum(process.env.NEWS_RETRIEVAL_RERANK_TIMEOUT_MS, 25_000),
  retrievalRerankMaxCandidates: capNum(process.env.NEWS_RETRIEVAL_RERANK_MAX_CANDIDATES, 30),
  // Master switch. Default: ON iff any canonical provider exists. Set NEWS_INGEST_ENABLED=0 to force off.
  enabled: process.env.NEWS_INGEST_ENABLED === '0' ? false : NEWS_PROVIDER_CONFIGURED,
  providerConfigured: NEWS_PROVIDER_CONFIGURED,
  ideaProviderConfigured: NEWS_IDEA_PROVIDER_CONFIGURED,
  // How often the in-server scheduler runs a cycle (the standalone --once entrypoint ignores this).
  // 5 min (down from 15): fresher headline intake + more frequent dot bursts on the themes map. Safe —
  // Groq scoring is paced separately (RPM/TPM, learned from live headers) and the daily caps defer
  // excess, so a tighter fetch can't bust limits; the binding floor is RSS source politeness (a full
  // 351-feed sweep is ~30-50s, so 5 min keeps it well-spaced). Tune with NEWS_POLL_INTERVAL_MIN.
  pollIntervalMin: capNum(process.env.NEWS_POLL_INTERVAL_MIN, 5),
  // Hard ceiling on a single ingest cycle (fetch+triage+themes). A safety net well ABOVE any legitimate
  // cycle (a normal fetch is ~1-3 min): if one ever hangs, the scheduler aborts it and runs the next, so
  // the ingester can never wedge permanently. Tune with NEWS_CYCLE_TIMEOUT_MS.
  cycleTimeoutMs: capNum(process.env.NEWS_CYCLE_TIMEOUT_MS, 480_000),
  // Daily Groq budget guards. A cycle refuses to call Groq past either cap; unscored items defer to
  // the next cycle (never lost, never zero-scored).
  //
  // The REQUEST cap travels with the model exactly as the token cap does, and 13,000 no longer describes
  // anything real: it was a margin under 8b-instant's 14,400 free RPD, and openai/gpt-oss-20b's free RPD
  // is 1,000 — 14x lower. In NORMAL operation this is not the binding limit and never was after the
  // model change: at ~2,000 tokens per triage batch the 200K token cap is spent after roughly 100 calls,
  // two orders below 1,000. It bites in the FAILURE case, which is the one that motivated raising this
  // number from 1,500 in the first place — a failed or timed-out call still costs a request while
  // costing almost no tokens, so a bad day burns requests without touching the token ceiling. Left at
  // 13,000 the engine would sail past Groq's real 1,000 and take hard 429s for the rest of the day
  // believing it had headroom; at 950 it stops cleanly and defers, which is the same outcome minus the
  // rejections. On a higher tier both rise automatically via the live rate-limit headers.
  groqDailyReqCap: capNum(process.env.NEWS_GROQ_DAILY_REQ_CAP, 950),
  // 200k, not the old 500k: the free-tier token-per-day allowance travels WITH the model, and
  // openai/gpt-oss-20b's is 200K TPD (30 RPM) where llama-3.1-8b-instant's was 500K. Left at 500k the
  // engine would pace itself to spend 2.5x the real allowance, then take hard rate-limit rejections for
  // the rest of every day — swapping a dead model for a throttled one and leaving the backlog climbing.
  groqDailyTokenCap: capNum(process.env.NEWS_GROQ_DAILY_TOKEN_CAP, 200_000),
  // Cross-cycle PER-PROVIDER LLM cooldown — protects every provider's daily REQUEST cap (Groq's 950 AND
  // each overflow provider's much smaller one) from being drained by a sustained OUTAGE. The in-cycle guards
  // (runCycle groqDownThisCycle / ov.failed) stop re-poking a down provider WITHIN one cycle, but the
  // scheduler runs many cycles/day, so with no cross-cycle memory each cycle still burns one failed probe —
  // and a 429 / timeout still counts as a request. That is exactly what emptied the Groq budget on
  // 2026-07-11: 13,000/13,000 requests on only ~14,100 tokens (≈1 token/request → almost all failures).
  // Fix: on a provider failure, persist an "unhealthy until now+window" marker per provider in STATE_DIR
  // (news/triage/budget.ts) and skip probing it (route to the next provider / defer) until the window
  // lapses; the first probe after it lapses clears the marker on success. Consulted by EVERY LLM seam
  // (triage, the article-read + auto-heal path, the themes namer), not just triage. Exponential backoff
  // (base, 2×, 4×, … capped at llmCooldownMaxMs) makes the daily failed-probe count grow only
  // logarithmically — a sustained outage falls from thousands of probes to a few dozen, which fully protects
  // Groq's 950 cap and drastically cuts waste on the small-cap fallbacks (a tiny ~20-45/day fallback cap
  // can still be approached, never exceeded, late in a day-long outage — it self-heals at the daily reset).
  // A HEALTHY provider never arms it. Base default 300s, cap 60 min. Tune with NEWS_LLM_COOLDOWN_SEC /
  // NEWS_LLM_COOLDOWN_MAX_SEC.
  llmCooldownMs: capNum(process.env.NEWS_LLM_COOLDOWN_SEC, 300) * 1000,
  llmCooldownMaxMs: capNum(process.env.NEWS_LLM_COOLDOWN_MAX_SEC, 3600) * 1000,
  // The exponential 5→60 min backoff above is calibrated to protect a small daily REQUEST cap during an
  // outage. Haiku has NO request cap — it is $-metered (a failed spawn records ~$0) and is the FIRST line
  // of defence against the deferred backlog overrunning its loss cap. Backing it off for up to
  // an hour after a TRANSIENT blip (a per-minute rate-limit, a spawn timeout, a one-off non-JSON reply) is
  // exactly wrong there: it leaves the backlog dropping data while $49 of budget sits unused. So a transient
  // transient Haiku failure arms a SHORT, FLAT cooldown instead (passed as base==max, which flattens the
  // exponential window to a constant) — it re-probes about once a drain (~60-90s) until the blip clears. A
  // real plan-quota exhaustion still gets the long llmCooldown* backoff (wait for the plan to reset), and an
  // api-mode terminal 4xx still exhausts the day's ledger. Only the transient path uses this.
  anthropicTransientCooldownMs: capNum(process.env.NEWS_ANTHROPIC_TRANSIENT_COOLDOWN_SEC, 60) * 1000,
  // Daily-budget PACER. The caps above stop us BUSTING the day's limit; the pacer stops us SPENDING IT
  // ALL AT ONCE. It releases the day's token TARGET on a linear schedule across the UTC day, so a heavy
  // news morning can't drain the budget and leave the afternoon dark. On a normal-volume day the schedule outruns demand and the pacer never
  // bites (items triage promptly); only on overload days does it meter spend into an even all-day drip.
  //   groqDailyTokenTarget — the day's spend goal (default = the configured engine allowance; that
  //                          allowance itself should already sit safely below the provider's hard limit).
  //   groqPaceFloorFrac    — small always-available slice of the target for a start-of-day burst and to
  //                          keep tiny backlogs clearing when exactly on schedule.
  // Set a smaller explicit target to retain more allowance; the default deliberately uses the whole
  // configured safe allowance by reset rather than leaving an arbitrary second buffer unused.
  groqDailyTokenTarget: capNum(process.env.NEWS_GROQ_DAILY_TOKEN_TARGET, capNum(process.env.NEWS_GROQ_DAILY_TOKEN_CAP, 200_000)),
  groqPaceFloorFrac: capNum(process.env.NEWS_GROQ_PACE_FLOOR_FRAC, 0.06),
  // Shared pacer for every finite free overflow tier (OpenRouter/NVIDIA/Gemini and any later entry). Each
  // provider's own reset clock linearly releases its configured safe allowance; the router selects the
  // usable tier furthest behind that clock target. Quiet hours carry forward, busy hours cannot burn the
  // whole day at once, and the complete configured allowance is available by reset. This is a floor, not
  // an early-day quota: at least one safe call is always released when the daily cap can hold one.
  freeProviderPaceFloorFrac: capNum(process.env.NEWS_FREE_PROVIDER_PACE_FLOOR_FRAC, 0.06),
  // Pacing. The binding free-tier limit is TOKENS-per-minute, not requests-per-minute — so we pace by
  // both, and (crucially) the pacer LEARNS the live ceiling from Groq's own x-ratelimit-* response
  // headers, auto-tuning to whatever this account actually allows. These are starting points / fallbacks:
  //   groqRpm — requests/min floor (under the 30 free RPM, unchanged for gpt-oss-20b); groqTpm —
  //   tokens/min (free TPM for gpt-oss-20b is 8K; 6000 is a deliberate floor under it, and with a
  //   200K/day ceiling the DAILY cap binds long before either, so this stays a floor rather than a limit).
  // On a higher tier the headers raise the ceiling automatically; no redeploy needed.
  groqRpm: capNum(process.env.NEWS_GROQ_RPM, 28),
  groqTpm: capNum(process.env.NEWS_GROQ_TPM, 6000),
  // PM SKIM — the "Best ideas" pass (news/ideas). Tier 1.5: after triage, one cheap batched free-LLM call
  // over the wire's already-ranked top-N surfaces the best 1-2 TRADABLE stock ideas (ticker · side · reason
  // · pre-edge read), feeding the paid gauntlet on a click. On by default, with IDEAS_ENABLED=0 as the
  // explicit kill switch. It rides the SAME canonical local/Groq/overflow registry and each tier's shared
  // budget / limiter / cooldown as triage (never a parallel lane), and is throttled hard so it can't starve triage:
  // it spends only when the top-N event set changes (or once per ideasRefreshSec heartbeat), and never more
  // often than ideasMinIntervalSec. A per-cycle call would blow the 500k token budget alone.
  ideasEnabled: process.env.IDEAS_ENABLED !== '0',
  ideasTopN: capNum(process.env.IDEAS_TOP_N, 12), // provider-call chunk size; each pass covers every current eligible row
  ideasShelfLifeHrs: capNum(process.env.IDEAS_SHELF_LIFE_HRS, 36), // a surfaced idea ages off the fresh lane after this many hours
  ideasInputMaxAgeHrs: capNum(process.env.IDEAS_INPUT_MAX_AGE_HRS, 36), // fail closed: never turn an old sweep/source timestamp into a newly fresh lead
  ideasMinIntervalSec: capNum(process.env.IDEAS_MIN_INTERVAL_SEC, 900), // hard floor between passes (15 min) — even a churny wire can't hammer it
  ideasRefreshSec: capNum(process.env.IDEAS_REFRESH_SEC, 3600), // heartbeat: re-skim at least this often even when the top-N is unchanged
  ideasMaxTokens: capNum(process.env.IDEAS_MAX_TOKENS, 2500), // output ceiling — a few ideas of JSON, never a truncation
  ideasDownvoteGraceHrs: capNum(process.env.IDEAS_DOWNVOTE_GRACE_HRS, 2), // a 👎 on a surfaced idea cools it this fast (idea-scoped, no global lever)
  // SECOND LOOK — shadow-only in this rollout. It ranks saved score-10–39 rows after the normal Ideas
  // pass and performs only a paced stock-listing identity check. No article read or idea creation is
  // possible in this stage. An accidental `live` value therefore fails safely back to shadow.
  rescueMode: String(process.env.IDEAS_RESCUE_MODE || 'shadow').trim().toLowerCase() === 'off' ? 'off' as const : 'shadow' as const,
  rescueMaxAgeHrs: Math.min(36, capNum(process.env.IDEAS_RESCUE_MAX_AGE_HRS, 36)),
  rescueDailyChecks: Math.min(200, capNum(process.env.IDEAS_RESCUE_DAILY_CHECKS, 200)),
  rescuePerCycle: Math.min(8, capNum(process.env.IDEAS_RESCUE_PER_CYCLE, 8)),
  rescueNameDailyCap: Math.min(40, capNum(process.env.IDEAS_RESCUE_NAME_DAILY_CAP, 40)),
  rescuePaceFloorFrac: (() => {
    const value = Number(process.env.IDEAS_RESCUE_PACE_FLOOR_FRAC)
    return Number.isFinite(value) ? Math.max(0, Math.min(0.04, value)) : 0.04
  })(),
  rescueAuditMaxBytes: Math.min(15 * 1024 * 1024, capNum(process.env.IDEAS_RESCUE_AUDIT_MAX_BYTES, 15 * 1024 * 1024)),
  // OPTIONAL stronger model for FILING reads only (exchange PDFs / regulatory docs) — see
  // buildFilingReadProviders. OpenAI-compatible endpoint: point it at any capable model you hold a key for
  // (a larger OpenRouter model, an Anthropic/OpenAI-compatible gateway, …). Unset (no model) => filings use
  // the default small-model chain, byte-for-byte unchanged. Base URL defaults to OpenRouter for convenience.
  filingReadApiKey: process.env.NEWS_FILING_READ_API_KEY || '',
  filingReadBaseUrl: process.env.NEWS_FILING_READ_BASE_URL || 'https://openrouter.ai/api/v1',
  filingReadModel: process.env.NEWS_FILING_READ_MODEL || '',
  filingReadMaxTokens: capNum(process.env.NEWS_FILING_READ_MAX_TOKENS, 3500),
  filingReadRpm: capNum(process.env.NEWS_FILING_READ_RPM, 12),
  filingReadDailyReqCap: capNum(process.env.NEWS_FILING_READ_DAILY_REQ_CAP, 500),
  // SECOND free-tier brain — Google Gemini (AI Studio) as a triage OVERFLOW provider. When Groq is
  // paced/capped, a batch routes to Gemini instead of deferring. REALITY CHECK (empirically probed from
  // the live 429 quota, Jun 2026): Google gutted the free tier — gemini-2.5-flash-lite is only ~20
  // requests/DAY, PER PROJECT, PER MODEL, resetting at midnight Pacific. The published 1000-1500/day
  // figures are pre-Dec-2025 and stale. We therefore ROTATE across the free model pool (each model has
  // its OWN per-day bucket) to stack the trickles, and let a per-DAY 429 mark a model done for the day.
  // FREE TIER ONLY — never attach billing. Off when GEMINI_API_KEY is unset. Secret lives in env, not src.
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiEnabled: process.env.NEWS_GEMINI_ENABLED === '0' ? false : true,
  // the rotation pool, "model:RPD" — each a SEPARATE per-project-per-model free daily bucket, all verified
  // live to return clean JSON triage (3.x flash models need thinking disabled, done in the adapter). RPDs
  // are the LIVE console limits and differ hugely: 3.1-flash-lite = 500/day (the workhorse, listed FIRST),
  // the rest 20/day each → ~580 free triages/day total. Excluded: 2.0-* (shut down), 2.5-pro (free ~0),
  // the *-latest aliases (may share a pool model's bucket), Gemma (1500 RPD but ignores JSON → unusable).
  geminiModels: parseGeminiPool(process.env.NEWS_GEMINI_MODELS || 'gemini-3.1-flash-lite:500,gemini-2.5-flash-lite:20,gemini-2.5-flash:20,gemini-3.5-flash:20,gemini-3-flash-preview:20', 20),
  geminiModel: parseGeminiPool(process.env.NEWS_GEMINI_MODELS || 'gemini-3.1-flash-lite:500', 20)[0]?.model || 'gemini-3.1-flash-lite', // lead model — for log/status display
  geminiBaseUrl: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
  // PER-MODEL daily request cap. Set to the empirically-observed free limit (~20/day/model) so we stop
  // exactly at the ceiling with no wasted 429s; the live per-DAY 429 + exhaust() is the safety net for any
  // model whose real limit is lower (or shared). Raise per-model via env if a model proves more generous.
  // TPM (240k) sits under the 250k free; daily token cap is non-binding (free tier gates RPM/RPD, not TPD).
  geminiDailyReqCap: capNum(process.env.NEWS_GEMINI_DAILY_REQ_CAP, 20),
  geminiDailyTokenCap: capNum(process.env.NEWS_GEMINI_DAILY_TOKEN_CAP, 5_000_000),
  // shared per-minute limiter across the pool. The lead model (3.1-flash-lite, 500 RPD) is 15 RPM and
  // does the bulk of the work; 14 sits just under it. When rotation later hits a 5-RPM model (only 20 RPD
  // each, exhausted in minutes) a per-minute 429 just backs off — not worth a per-model limiter.
  geminiRpm: capNum(process.env.NEWS_GEMINI_RPM, 14),
  geminiTpm: capNum(process.env.NEWS_GEMINI_TPM, 240_000),
  geminiMaxTokens: capNum(process.env.NEWS_GEMINI_MAX_TOKENS, 2400), // headroom for headline_en on non-English batches (mirrors triageMaxTokens)
  geminiDayTz: process.env.NEWS_GEMINI_DAY_TZ || 'America/Los_Angeles', // RPD resets midnight Pacific
  // OpenAI-compatible OVERFLOW providers (OpenRouter, NVIDIA NIM, …) — a registry, tried in order after
  // Groq is paced/capped, each with its own free daily budget + limiter. Their free models are far stronger
  // than Groq's 8B. Adding another OpenAI-compatible free key = one entry in buildOverflowProviders() — it
  // then auto-appears in routing, the drain gate, status, and as a cockpit chip (§26, zero other edits).
  overflowProviders: CONFIGURED_OVERFLOW_PROVIDERS,
  // LOCAL primary brain — the unlimited $0 tier tried FIRST for every batch when enabled (NEWS_LOCAL_PRIMARY,
  // default on). null when local is off OR demoted to a fallback (NEWS_LOCAL_PRIMARY=0 → it lives in
  // overflowProviders instead). runCycle routes to it ahead of Groq; getNewsStatus/diagnostics surface it first.
  localProvider: CONFIGURED_LOCAL_PROVIDER,
  localPrimary: Boolean(CONFIGURED_LOCAL_PROVIDER),
  // Local's cross-cycle cooldown after a failed probe: SHORT + flat (re-probe a sleeping box fast), unlike the
  // cloud tiers' exponential backoff — local has no daily cap to protect from failed-probe burn, so recovering
  // fast when the box wakes matters more than sparing a failed call.
  localCooldownMs: capNum(process.env.NEWS_LOCAL_COOLDOWN_SEC, 45) * 1000,
  // One provider round-trip has a large fixed cost. The former 12-row outer batch could not keep up with
  // live arrivals, while the free/API providers safely accept 24. A simple 24-row Haiku canary finished in
  // 64s, but a complex live batch later hit the 120s ceiling; the subscription transport therefore fans
  // this 24-row outer batch into two parallel 12-row calls. The env override remains the rollback control.
  triageBatch: capNum(process.env.NEWS_TRIAGE_BATCH, 24),
  // How many times ONE batch may be re-sent to a DIFFERENT free provider after a `contract` failure — a call
  // that returned but whose body was unusable (malformed JSON, wrong envelope, missing rows, truncation).
  //
  // A contract failure is evidence about the BATCH at least as much as about the provider, so re-sending the
  // identical text around a five-model pool converts one bad batch into five spent requests and zero scored
  // rows. Observed live: 24 of 25 Gemini pool calls in a day failed this way for 1 scored batch. But the
  // cross-model retry is not worthless either — a different model genuinely does sometimes parse a batch the
  // first one mangled, and that is where the 1 scored batch came from. So this is a CAP, not a ban: keep the
  // retry that works, drop the four that don't. 0 = never re-send a contract failure to another SCARCE
  // free/cloud pool provider. It does not reach the demoted local tier, which is a separate, deliberately
  // unlimited last resort (runCycle.ts "LOCAL LAST") — there is no scarce request to conserve there, so a
  // contract-failed batch still gets that one final cross-model rescue attempt after the pool is exhausted.
  // Availability, rate-limit and request failures are unaffected — those ARE about the provider, and the
  // batch should keep flowing down the chain as before.
  contractRetriesPerBatch: capNumOrZero(process.env.NEWS_CONTRACT_RETRIES_PER_BATCH, 1),
  // GDELT look-back per cycle (minutes; > pollInterval gives overlap so nothing slips the gap).
  gdeltLookbackMin: capNum(process.env.NEWS_GDELT_LOOKBACK_MIN, 40),
  gdeltBaseUrl: process.env.NEWS_GDELT_BASE_URL || 'https://api.gdeltproject.org/api/v2/doc/doc',
  // GDELT rate limits HARD: its 429 body literally says "limit requests to one every 5 seconds", and a
  // burst parks the whole IP — so we send few queries, spaced 6s apart (each lands in its own 5s window).
  // But the OPPOSITE failure is worse and silent: an over-long query is rejected with HTTP **200** and the
  // body "Your query was too short or too long.", which parses to zero articles and never trips the 429
  // backoff. That is exactly what happened — chunkSize 11 was chosen when the list was ~22 SHORT domains
  // ("~250 chars, safely under the ceiling"); the list then grew to 37 with long members
  // (economictimes.indiatimes.com), pushing a chunk to 257 chars → REJECTED → GDELT returned 0 articles for
  // ~a month with no error surfaced. Do not tune this by count alone: buildQueries also caps each query at
  // GDELT_MAX_QUERY_CHARS, and a test asserts the real approved list stays under it.
  gdeltChunkSize: capNum(process.env.NEWS_GDELT_CHUNK_SIZE, 6),
  gdeltChunkGapMs: capNum(process.env.NEWS_GDELT_CHUNK_GAP_MS, 6000),
  // After a 429, skip GDELT entirely for this many whole cycles so its IP penalty-box can decay (a
  // compliant once-per-cycle poke can still keep the penalty alive). 0 disables the multi-cycle backoff.
  gdeltBackoffCyclesOn429: capNum(process.env.NEWS_GDELT_BACKOFF_CYCLES, 4),
  // Inbox is ranked by triage score and capped; the tail is counted (firehose) but not inboxed.
  inboxMaxRows: capNum(process.env.NEWS_INBOX_MAX_ROWS, 40),
  // Score → band thresholds. NB: as of the composite re-rank these apply to the PRIORITY score
  // (rank.ts), not the raw Groq read — so a terse but high-tier primary filing can still clear them.
  pickThreshold: capNum(process.env.NEWS_PICK_THRESHOLD, 70),
  watchThreshold: capNum(process.env.NEWS_WATCH_THRESHOLD, 40),
  // How hard the deterministic re-rank pushes (rank.ts): 1 = full, 0 = pure Groq score (no boost),
  // up to 2. Tune down if primary filings flood the inbox; tune up to lean harder on source quality.
  rankBoostWeight: (() => { const n = Number(process.env.NEWS_RANK_BOOST_WEIGHT); return Number.isFinite(n) && n >= 0 ? Math.min(2, n) : 1 })(),
  // RSS layer (Layer 2 of the ingestion stack): direct publisher feeds — lower latency than GDELT
  // and immune to its rate limits. The approved-domains firewall still gates every item.
  rssEnabled: process.env.NEWS_RSS_ENABLED === '0' ? false : true,
  rssFeedsPath: process.env.NEWS_RSS_FEEDS_PATH || 'frameworks/screener/rss_feeds.json',
  rssTimeoutMs: capNum(process.env.NEWS_RSS_TIMEOUT_MS, 10_000),
  // Default RSS User-Agent: '' lets rss.ts use its browser-UA default (UA-sniffing publishers like
  // LiveMint/Moneycontrol soft-block non-browser agents). SEC feeds override per-feed in the list.
  rssUserAgent: process.env.NEWS_RSS_USER_AGENT || '',
  // Politeness as the feed list grows: max distinct hosts fetched at once, and the gap between two
  // feeds that share a host (rate-sensitive publishers answer 200-but-empty when bursted).
  rssConcurrency: capNum(process.env.NEWS_RSS_CONCURRENCY, 8),
  rssPerHostGapMs: capNum(process.env.NEWS_RSS_PER_HOST_GAP_MS, 700),
  // NSE layer (Layer 3): the NSE India primary-disclosure JSON API (corporate announcements +
  // board-meeting intimations) — the exchange itself, the highest-signal India source. Items pass the
  // same approved-domains firewall on their nseindia.com link domain. Default ON; NEWS_NSE_ENABLED=0 off.
  nseEnabled: process.env.NEWS_NSE_ENABLED === '0' ? false : true,
  nseBaseUrl: process.env.NEWS_NSE_BASE_URL || 'https://www.nseindia.com',
  nseLookbackHours: capNum(process.env.NEWS_NSE_LOOKBACK_HOURS, 24),
  // Intl-exchange layer (Layer 3, non-India): HKEXnews (Hong Kong) + ASX (Australia) primary-disclosure
  // JSON APIs — the exchanges themselves, the highest-signal source for those regions. Items pass the
  // firewall on their hkexnews.hk / asx.com.au link domain. Default ON; NEWS_EXCHANGE_INTL_ENABLED=0 off.
  exchangeIntlEnabled: process.env.NEWS_EXCHANGE_INTL_ENABLED === '0' ? false : true,
  exchangeIntlLookbackHours: capNum(process.env.NEWS_EXCHANGE_INTL_LOOKBACK_HOURS, 24),
  // Gov-data layer (Layer 3, US regulatory JSON): keyless openFDA — drug/device recalls + 510(k) device
  // clearances (biotech/pharma/medtech catalysts; no usable RSS). Items pass the firewall on their
  // fda.gov link domain. Default ON; NEWS_GOV_DATA_ENABLED=0 off. lookbackDays bounds the first-run backlog.
  govDataEnabled: process.env.NEWS_GOV_DATA_ENABLED === '0' ? false : true,
  govDataLookbackDays: capNum(process.env.NEWS_GOV_DATA_LOOKBACK_DAYS, 21),
  // REDDIT — a DISCOVERY/SENTIMENT layer (sources/reddit.ts): named subreddits read via their no-auth
  // Atom feeds (frameworks/screener/reddit_feeds.json). Items pass the firewall on the reddit.com link
  // domain, land in the `social` source tier, and are hard-capped to `watch` (never a pick — §4/§24).
  // Default ON; NEWS_REDDIT_ENABLED=0 off. Reddit blocks aggressively, so the adapter runs a fallback
  // chain (www → old.reddit → public mirror) with a 429 penalty-box and slow per-host pacing.
  redditEnabled: process.env.NEWS_REDDIT_ENABLED === '0' ? false : true,
  redditFeedsPath: process.env.NEWS_REDDIT_FEEDS_PATH || 'frameworks/screener/reddit_feeds.json',
  redditLookbackHours: capNum(process.env.NEWS_REDDIT_LOOKBACK_HOURS, 6),
  redditPerHostGapMs: capNum(process.env.NEWS_REDDIT_PER_HOST_GAP_MS, 2000), // all subs share one host (reddit.com)
  redditBackoffCyclesOn429: capNum(process.env.NEWS_REDDIT_BACKOFF_CYCLES, 4), // cycles to skip Reddit after a 429
  redditMirrorTemplate: process.env.NEWS_REDDIT_MIRROR_TEMPLATE || 'https://rsshub.app/reddit/subreddit/{sub}/new', // {sub} placeholder; public-mirror fallback (overridable / self-hostable)
  redditOverallBudgetMs: capNum(process.env.NEWS_REDDIT_OVERALL_BUDGET_MS, 45_000), // wall-clock cap on the whole social layer so a Reddit outage can't stall the cycle (low-trust layer; next cycle resumes)
  // Live-feed per-item records (firehose kind:"item") roll to another physical shard when either boundary
  // is reached. These are PER-FILE Git-hosting guards, not daily retention caps; the logical day is uncapped.
  // The old DAILY env names remain aliases so an existing launchd setup keeps exactly the same shard size.
  feedItemsDailyCap: capNum(process.env.NEWS_FEED_SHARD_MAX_ITEMS || process.env.NEWS_FEED_ITEMS_DAILY_CAP, 40_000),
  // Hard-clamped even when the env is unsafe: 90 MB reserves at least 10 MB below GitHub's 100 MB single-file
  // rejection boundary. Cycle summaries may use that reserve up to their own 99 MB hard stop, then roll too.
  feedItemsDailyMaxBytes: Math.min(capNum(process.env.NEWS_FEED_SHARD_MAX_BYTES || process.env.NEWS_FEED_ITEMS_DAILY_MAX_BYTES, 80_000_000), 90_000_000),
  // PULSE (news/commodity-pulse.ts) — the per-subject structured snapshot (price / CFTC COT /
  // next scheduled reports) behind /api/swarm/pulse, for swarms whose manifest declares `wire.pulse`.
  // Plain keyless HTTP + date math — zero LLM load. Lazy on request; cached under STATE_DIR.
  pulseEnabled: process.env.NEWS_PULSE_ENABLED !== '0',
  pulsePriceTtlMin: capNum(process.env.NEWS_PULSE_PRICE_TTL_MIN, 15),
  pulseCotTtlHours: capNum(process.env.NEWS_PULSE_COT_TTL_HOURS, 6),
  pulseTimeoutMs: capNum(process.env.NEWS_PULSE_TIMEOUT_MS, 10_000),
  // EQUITY QUOTE (news/equity-quote.ts) — the live price behind /api/quote and the re-basing of a
  // frozen call onto it. Shares the pulse's CNBC transport but has its OWN switch: turning the
  // commodity wire off must not silently take the decision banner's price with it.
  quoteEnabled: process.env.NEWS_QUOTE_ENABLED !== '0',
  quoteTtlMin: capNum(process.env.NEWS_QUOTE_TTL_MIN, 15),
  quoteTimeoutMs: capNum(process.env.NEWS_QUOTE_TIMEOUT_MS, 10_000),
  // How old a quote may be before it is refused outright. Verified hazard: a DELISTED ticker keeps
  // answering with a healthy-looking row — REG_MKT, realTime:"true", a fresh-looking percent change —
  // carrying a price from years earlier. Nothing on the row admits it; only the timestamp does.
  quoteMaxAgeDays: capNum(process.env.NEWS_QUOTE_MAX_AGE_DAYS, 7),
  // EVENTS CALENDAR (news/events-calendar.ts) — the date-sorted forward calendar behind /api/calendar:
  // earnings (Nasdaq US + NSE India, official JSON APIs) + macro (investing.com econ-calendar). Keyless,
  // lazy on request, cached under STATE_DIR; each source fails independently (keeps last-good + flags
  // health) so one broken scraper never takes the calendar down. Off with NEWS_CALENDAR_ENABLED=0.
  calendarEnabled: process.env.NEWS_CALENDAR_ENABLED !== '0',
  calendarWindowDays: capNum(process.env.NEWS_CALENDAR_WINDOW_DAYS, 14),
  calendarEarningsTtlHours: capNum(process.env.NEWS_CALENDAR_EARNINGS_TTL_HOURS, 6),
  calendarMacroTtlHours: capNum(process.env.NEWS_CALENDAR_MACRO_TTL_HOURS, 12),
  calendarTimeoutMs: capNum(process.env.NEWS_CALENDAR_TIMEOUT_MS, 12_000),
  // Groq output budget per triage call (the per-item payload grew with companies/size_bucket, then
  // headline_en for non-English items) — 2400 keeps headroom so a batch of long foreign-script
  // headlines can't truncate (a truncated batch is safely deferred, but would otherwise re-defer).
  triageMaxTokens: capNum(process.env.NEWS_TRIAGE_MAX_TOKENS, 2400),
  // THEMES layer (news/themes/*): buckets the ranked firehose into living investment themes, scores +
  // ranks them (hot/active/cooling/parked, auto-decaying), and assigns 1st/2nd/3rd-order companies.
  // Assignment runs every cycle (deterministic, $0); discovery runs every Nth cycle. The discovery
  // Narrative compilation prefers the dedicated Claude key when configured, then uses the same canonical
  // local/Groq/OpenAI-compatible provider registry, budgets, limiters and cooldowns as triage. It is
  // always bounded and reports capacity/provider failures into themes_index compiler health; no key means
  // an explicit non-investable waiting queue rather than a silently blank Themes surface.
  themesEnabled: process.env.NEWS_THEMES_ENABLED === '0' ? false : true,
  // Only items at/above this composite priority are bucketed into themes — routine low-materiality
  // filings (which flood the firehose) cluster on boilerplate and aren't investment themes; real
  // narratives score higher. Keeps the theme layer about MEANINGFUL flow.
  themesMinScore: capNum(process.env.NEWS_THEMES_MIN_SCORE, 50),
  themesDiscoverEveryCycles: capNum(process.env.NEWS_THEMES_DISCOVER_EVERY_CYCLES, 4),
  themesRetireHours: capNum(process.env.NEWS_THEMES_RETIRE_HOURS, 72),
  themesMaxMembers: capNum(process.env.NEWS_THEMES_MAX_MEMBERS, 400),
  themesDiscoverModel: process.env.NEWS_THEMES_DISCOVER_MODEL || 'claude-haiku', // 'claude-haiku' | 'groq' | 'off'
  themesClaudeModel: process.env.NEWS_THEMES_CLAUDE_MODEL || 'claude-haiku-4-5',
  themesClaudeApiKey: process.env.THEMES_CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || '',
  themesClaudeKeyEnvVar: process.env.THEMES_CLAUDE_API_KEY
    ? 'THEMES_CLAUDE_API_KEY'
    : process.env.ANTHROPIC_API_KEY ? 'ANTHROPIC_API_KEY' : undefined,
  themesClaudeBaseUrl: process.env.THEMES_CLAUDE_BASE_URL || 'https://api.anthropic.com',
  themesClaudeDailyCap: capNum(process.env.NEWS_THEMES_CLAUDE_DAILY_CAP, 60), // max Claude discovery calls/day
  // Keep the complete fallback chain inside the outer 90s Themes-stage budget. Each provider receives one
  // candidate at a time; short limiter waits let the next tier run instead of blocking behind triage.
  themesLimiterWaitMs: capNum(process.env.NEWS_THEMES_LIMITER_WAIT_MS, 2500),
  themesProviderAttemptTimeoutMs: capNum(process.env.NEWS_THEMES_PROVIDER_ATTEMPT_TIMEOUT_MS, 25_000),
  themesProviderChainTimeoutMs: capNum(process.env.NEWS_THEMES_PROVIDER_CHAIN_TIMEOUT_MS, 80_000),
  // PRIORITY-1 TRIAGE TIER. Claude Haiku gets every eligible batch first. If it is paced, capped, cooling,
  // or fails, the existing local/Groq/overflow/Gemini chain continues automatically for that same batch.
  //
  // TWO BACKENDS, default `subscription`:
  //   subscription — the local `claude` CLI under the host keychain OAuth (news/triage/claude-cli.ts): the
  //     SAME plan the research runs and chat already use. NO API key. The plan is flat-fee, so no card is
  //     charged; but it is SHARED quota, so the daily $ ceiling below doubles as the governor that stops
  //     news triage starving research. When the plan itself is spent the CLI reports a usage limit → the
  //     batch defers and a cross-cycle cooldown waits for the plan to reset (never hammers it).
  //   api — a DEDICATED metered key (news/triage/anthropic.ts). Separate billing, no plan contention.
  //     Opt-in only; deliberately never defaults to ANTHROPIC_API_KEY or the themes key.
  //
  // Bounded by a daily $ ledger (UsdBudget, STATE_DIR — restart-safe): spend up to anthropicDailyUsd, then
  // stop admitting Haiku calls and fall through to the other providers. Cost is reported on every cycle
  // summary (anthropic_cost_usd) so it is never hidden.
  // ON by default: it needs no key on the subscription path, and the whole point is to stop dropping items.
  // Set NEWS_ANTHROPIC_FALLBACK_ENABLED=0 to turn it off.
  anthropicFallbackEnabled: process.env.NEWS_ANTHROPIC_FALLBACK_ENABLED !== '0',
  anthropicFallbackMode: (process.env.NEWS_ANTHROPIC_FALLBACK_MODE || 'subscription') as 'subscription' | 'api',
  // The daily $ ceiling — the ONE bound the operator reasons in. Reached ⇒ items defer as before.
  // Raised 5 → 50 (2026-07-21): $5 stopped the last-resort after ~a dozen Haiku batches on Groq-outage
  // days (peaks of 2k-3k deferred), which is exactly when it is needed most. $50 lets it chew through the
  // whole overload backlog before the daily governor stops it. On the SUBSCRIPTION path this $ figure is a
  // PROXY for how much of the shared 5-hour/weekly plan pool this tier has drawn, so a higher ceiling means
  // more potential contention with research runs. Its guardrails are the unchanged $200/day ceiling, the
  // plan's own usage limit, reset-clock pacing, per-minute pacing, cooldowns, and the priority floor. Tune via
  // NEWS_ANTHROPIC_FALLBACK_DAILY_USD; drop it back down if news triage ever starves a research run.
  //
  // Raised 50 → 200 (2026-08-21, operator request) for the SUSTAINED multi-provider outage $50 does not
  // cover. The 2026-07-21 sizing assumed one provider down and the rest healthy; on 2026-08-20 all five
  // free tiers were down at once (Groq on a retired model id, Cerebras + Mistral out of credit, NVIDIA
  // timing out, Gemini erroring), so the last resort was not a last resort — it was the ONLY tier scoring.
  // It spent its $50 and stopped while the backlog climbed to 89.4% of the 100k cap, past which items are
  // DROPPED, not deferred. $200 buys roughly four times the drain before the governor stops it.
  //
  // Understand what this ceiling actually costs on the subscription path: it is NOT $200 of cash, it is up
  // to 4x more of the shared plan pool drawn by news triage, and the contention is with your own research
  // runs. The three guardrails above still bound it, and the ONLY one that self-limits during a total free
  // -tier outage is the plan's own usage limit — so on a bad day this will draw until the plan pushes back.
  // That is the intended trade (dropping news permanently is worse than a slow research run), but it is a
  // real trade: if a research run starves, drop this back to 50 via the env var and no redeploy is needed.
  anthropicDailyUsd: capNum(process.env.NEWS_ANTHROPIC_FALLBACK_DAILY_USD, 200),
  // MODEL. On the `subscription` path this goes to the CLI's `--model`, which takes an ALIAS ('haiku' /
  // 'sonnet' / 'opus') or a FULL name ('claude-haiku-4-5-20251001') — NOT the Messages-API alias
  // 'claude-haiku-4-5'. An unresolvable name silently falls back to the CLI's DEFAULT (Sonnet-class): live
  // cycles on 2026-07-16 billed ~$0.068/call vs Haiku's ~$0.006-0.015, so the $ ceiling bought ~14 batches
  // instead of hundreds AND drained ~5x more of the plan window the research runs share. Keep this an alias
  // the CLI resolves; the metered `api` backend addresses the model by its API id (below) instead.
  anthropicModel: process.env.NEWS_ANTHROPIC_FALLBACK_MODEL || 'haiku',
  anthropicApiModel: process.env.NEWS_ANTHROPIC_FALLBACK_API_MODEL || 'claude-haiku-4-5',
  // Per-call guards for the subscription CLI: a --max-budget-usd belt-and-braces and a wall-clock timeout
  // (a triage completion is small; a hung child must never hold the cycle).
  anthropicPerCallUsd: capNum(process.env.NEWS_ANTHROPIC_FALLBACK_PER_CALL_USD, 0.1),
  anthropicTimeoutMs: capNum(process.env.NEWS_ANTHROPIC_FALLBACK_TIMEOUT_MS, 120_000),
  anthropicRpm: capNum(process.env.NEWS_ANTHROPIC_FALLBACK_RPM, 25),
  // Priority floor: only batches whose lead (highest-priority) item scores ≥ this on the deterministic
  // pre-triage priority (rank.ts) route to this tier. 0 = score all spillover up to the daily $ ceiling.
  anthropicMinPriority: capNum(process.env.NEWS_ANTHROPIC_FALLBACK_MIN_PRIORITY, 0),
  // --- `api` mode only (opt-in; unused on the default subscription path) ---
  anthropicApiKey: process.env.NEWS_ANTHROPIC_FALLBACK_API_KEY || '',
  anthropicBaseUrl: process.env.NEWS_ANTHROPIC_FALLBACK_BASE_URL || 'https://api.anthropic.com',
  anthropicMaxTokens: capNum(process.env.NEWS_ANTHROPIC_FALLBACK_MAX_TOKENS, 2400),
  // Haiku 4.5 list prices ($/million tokens) — used to price `api`-mode calls for the same $ ledger.
  anthropicInPricePerMTok: capNum(process.env.NEWS_ANTHROPIC_FALLBACK_IN_PRICE, 1.0),
  anthropicOutPricePerMTok: capNum(process.env.NEWS_ANTHROPIC_FALLBACK_OUT_PRICE, 5.0),
  // Rolling token document-frequency (news/themes/token-df.ts): the self-learning boilerplate detector.
  // A token over `dailyRatio` of a day's items on ≥ `persistDays` of the last `windowDays` days is
  // corpus-generic and stops counting toward theme matches — new exchange phrasings and results-season
  // vocabulary get suppressed without a code change. `protected` (comma-separated) is the escape hatch
  // for a sustained genuine story word that must stay an anchor; empty by default.
  themesDfWindowDays: capNum(process.env.NEWS_THEMES_DF_WINDOW_DAYS, 7),
  themesDfDailyRatio: capNum(process.env.NEWS_THEMES_DF_DAILY_RATIO, 0.015),
  themesDfPersistDays: capNum(process.env.NEWS_THEMES_DF_PERSIST_DAYS, 3),
  themesDfMinDailyDocs: capNum(process.env.NEWS_THEMES_DF_MIN_DAILY_DOCS, 150),
  themesDfProtected: String(process.env.NEWS_THEMES_DF_PROTECTED || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
  // On-demand deep-dive BRIEF (news/themes/brief.ts): the few-sentence plain-English explainer built when
  // a human opens a theme. Free Groq only, on the SAME shared daily budget + per-minute limiter as the
  // firehose (a per-click brief is deliberately NOT a Claude-metered seam — same posture as the on-demand
  // article read). 'off' forces the deterministic headline synthesis; it also degrades to deterministic
  // whenever Groq is unreachable or the day's free budget is spent.
  themeBriefModel: process.env.NEWS_THEME_BRIEF_MODEL || 'groq', // 'groq' | 'off'
  // DEDUP layer (news/dedup.ts): collapse near-duplicate STORIES on the wire into one row (the same
  // event reworded, or the same story across sources) — the reader sees one row per story with a
  // "+N sources" badge, and multi-source corroboration lifts the rank. TIGHT by design (same event
  // only — different events about the same company stay separate). Deterministic, $0, fail-soft.
  dedupEnabled: process.env.NEWS_DEDUP_ENABLED === '0' ? false : true,
  // two items can only be the same story if their timestamps are within this many hours of each other
  dedupWindowHours: capNum(process.env.NEWS_DEDUP_WINDOW_HOURS, 48),
  // token-set similarity (jaccard) floor for a same-story match, guarded by a shared company OR source
  dedupJaccard: (() => { const n = Number(process.env.NEWS_DEDUP_JACCARD); return Number.isFinite(n) && n > 0 && n <= 1 ? n : 0.55 })(),
  // a similarity this high merges on its own (a verbatim-ish repost) — no company/source guard needed
  dedupVerbatimJaccard: (() => { const n = Number(process.env.NEWS_DEDUP_VERBATIM_JACCARD); return Number.isFinite(n) && n > 0 && n <= 1 ? n : 0.82 })(),
  // cap the O(n²) clustering to the most recent N items (covers the 2-day read window with margin)
  dedupMaxScan: capNum(process.env.NEWS_DEDUP_MAX_SCAN, 1500),
  // On-demand article read (THE STORY when a human opens an event). HARD ceilings so the reader can never
  // hang: at most this much wall-clock across ALL fallback providers, and at most this long waiting on any
  // one provider's rate limiter before skipping it. Past the budget the read degrades to the story floor.
  enrichLlmBudgetMs: capNum(process.env.NEWS_ENRICH_LLM_BUDGET_MS, 14_000),
  enrichLimiterWaitMs: capNum(process.env.NEWS_ENRICH_LIMITER_WAIT_MS, 2500),
  // On-demand corroboration: when an opened article's publisher blocks the direct read, ask GDELT who ELSE
  // reported the event and synthesise the story from the secondary wire (the server-side version of a human
  // checking other outlets). Default ON; shares the firehose's GDELT endpoint + penalty backoff so it can
  // never reignite the ingester's IP penalty. Set NEWS_ENRICH_CORROBORATE=0 to disable.
  enrichCorroborate: process.env.NEWS_ENRICH_CORROBORATE === '0' ? false : true,
  enrichCorroborateTimeoutMs: capNum(process.env.NEWS_ENRICH_CORROBORATE_TIMEOUT_MS, 6000),
  // Background self-heal (news/enrich-heal.ts): each ingest cycle, re-read this many DEGRADED stories (a
  // readable article whose on-demand LLM read momentarily missed) that are still on the live wire, so a
  // story fixes itself even if no human reopens it. Capped + budget-gated so it never starves the title
  // triage. 0 disables the pass (the short degraded TTL still self-heals on the next manual open).
  enrichHealMaxPerCycle: capNumOrZero(process.env.NEWS_ENRICH_HEAL_MAX_PER_CYCLE, 6),
  // NEVER-read items given a first body read per cycle — the under-rated tail (news/enrich-heal.ts
  // coldReadCandidates). Small on purpose: the triage queue, not the reader, is the scarce resource, and
  // this shares the reader's budget gate. 0 switches discovery off and leaves repair untouched.
  enrichColdMaxPerCycle: capNumOrZero(process.env.NEWS_ENRICH_COLD_MAX_PER_CYCLE, 4),
  // the junk floor for a cold read — below this the wire's bottom decile is noise a body read won't rescue
  enrichColdMinScore: capNum(process.env.NEWS_ENRICH_COLD_MIN_SCORE, 10),
  // Stop the BACKGROUND heal from re-fetching an entry that has stayed degraded this long (default 6h). By
  // then it's had many heal cycles; a still-degraded item is a structural read failure, not a transient one,
  // so keep re-trying it on demand (a human reopen) but free the capped heal slots for fresher stories.
  enrichHealMaxAgeMs: capNum(process.env.NEWS_ENRICH_HEAL_MAX_AGE_MS, 6 * 60 * 60 * 1000),
}

/**
 * The on-demand article read's LLM fallback chain. It REUSES the ingester's exact budget files +
 * process-wide limiters (so the two paths share one free-tier accounting), and is built purely from
 * whatever keys are present — adding a provider is the same single config entry that wires it into the
 * ingester (§26). When no key is set the chain is empty and the read degrades to the deterministic floor.
 *
 * ORDER differs from the ingester ON PURPOSE. The ingester (runCycle) saves Gemini's tiny daily pool for
 * LAST so the strong overflow models absorb the batch volume. A HUMAN waiting on one article wants LATENCY
 * + RELIABILITY, not quota-spreading: so the order here is Groq (fastest when its minute-window has room) →
 * GEMINI (flash-lite is fast, has a huge per-minute ceiling, and rarely blocks) → OpenAI-compatible overflow
 * (OpenRouter/NVIDIA free models are strong but can be slow/queued — they'd otherwise eat the time budget and
 * starve the more reliable providers of their turn).
 */
export function buildArticleReadProviders(cfg: typeof NEWS = NEWS): ArticleReadProvider[] {
  const out: ArticleReadProvider[] = []
  if (cfg.groqApiKey) {
    out.push({ id: 'groq', kind: 'openai', apiKey: cfg.groqApiKey, keyEnvVar: 'GROQ_API_KEY', baseUrl: cfg.groqBaseUrl, model: cfg.groqModel, maxTokens: 3000, rpm: cfg.groqRpm, tpm: cfg.groqTpm, dailyReqCap: cfg.groqDailyReqCap, dailyTokenCap: cfg.groqDailyTokenCap, budgetFile: 'groq-budget.json', limiter: 'groq', paceMeter: 'tokens', paceCap: cfg.groqDailyTokenTarget, paceFloorFrac: cfg.groqPaceFloorFrac })
  }
  if (cfg.geminiEnabled && cfg.geminiApiKey && cfg.geminiModels.length) {
    out.push({ id: 'gemini', kind: 'gemini', apiKey: cfg.geminiApiKey, baseUrl: cfg.geminiBaseUrl, model: cfg.geminiModel, pool: cfg.geminiModels, maxTokens: cfg.geminiMaxTokens, rpm: cfg.geminiRpm, tpm: cfg.geminiTpm, dailyReqCap: cfg.geminiDailyReqCap, dailyTokenCap: cfg.geminiDailyTokenCap, budgetFile: 'gemini-budget-{model}.json', dayTz: cfg.geminiDayTz, limiter: 'gemini', paceMeter: 'requests', paceFloorFrac: cfg.freeProviderPaceFloorFrac })
  }
  for (const p of cfg.overflowProviders) {
    // A provider whose real answer time doesn't fit this path's short user-facing deadline opts out via
    // skipArticleRead (see the OverflowProvider field doc + the local-tier entry in buildOverflowProviders)
    // rather than sharing its id's cooldown between a ~7s interactive read and the background backlog drain.
    if (p.skipArticleRead) continue
    // OpenAI-compatible overflow: its own named limiter + daily budget file, exactly as runCycle uses it. A
    // TOKEN-gated provider carries its own tpm + daily token cap, so the read paces on the SAME
    // binding limit as the ingester (they share the budget file + limiter); request-gated providers
    // (OpenRouter/NVIDIA) omit them → tpm 0 + a non-binding token cap, the prior behaviour byte-for-byte.
    out.push({ id: p.id, kind: 'openai', apiKey: p.apiKey, keyEnvVar: p.keyEnvVar, baseUrl: p.baseUrl, model: p.model, models: p.models, maxTokens: p.maxTokens, rpm: p.rpm, tpm: p.tpm ?? 0, dailyReqCap: p.dailyReqCap, dailyTokenCap: p.dailyTokenCap ?? NON_BINDING_DAILY_TOKEN_CAP, budgetFile: p.budgetFile, dayTz: p.dayTz, headers: p.headers, extraBody: p.extraBody, limiter: p.id, paceMeter: p.dailyTokenCap != null ? 'tokens' : 'requests', paceCap: p.dailyTokenCap ?? p.dailyReqCap, paceFloorFrac: p.paceFloorFrac ?? cfg.freeProviderPaceFloorFrac, requestRemainingHeaderIsDaily: p.requestRemainingHeaderIsDaily })
  }
  return out
}

// Built once at startup from the present keys; consumed by the /api/news/enrich route.
export const ARTICLE_READ_PROVIDERS: ArticleReadProvider[] = buildArticleReadProviders()

// An OPTIONAL stronger model for reading FILINGS (exchange PDFs / regulatory documents). The default read
// chain above is small free models (Groq openai/gpt-oss-20b, …) tuned for the high-volume article
// firehose. Filings read WORSE on those: their document opens with cover-page letterhead / a boilerplate
// disclaimer and the free-tier model tends to return an empty brief, so THE STORY falls to the headline
// floor. A Haiku-class model reads the SAME letterhead-heavy filing fine (verified experiment). This
// provider is gated behind its own env AND given its OWN budget file + limiter — so it never competes with
// the saturated article-firehose Groq quota (which also covers the read-skip failure mode) — and enrichEvent
// PREPENDS it to the read chain for filing events only, falling through to the normal chain if it is
// unconfigured or fails. Unset (no key/model) => [] => filing reads are byte-for-byte unchanged.
export function buildFilingReadProviders(cfg: typeof NEWS = NEWS): ArticleReadProvider[] {
  if (!cfg.filingReadApiKey || !cfg.filingReadModel) return []
  return [{
    id: 'filing-read',
    kind: 'openai',
    apiKey: cfg.filingReadApiKey,
    baseUrl: cfg.filingReadBaseUrl,
    model: cfg.filingReadModel,
    maxTokens: cfg.filingReadMaxTokens,
    rpm: cfg.filingReadRpm,
    tpm: 0, // request-gated, like the OpenRouter/NVIDIA overflow providers
    dailyReqCap: cfg.filingReadDailyReqCap,
    dailyTokenCap: NON_BINDING_DAILY_TOKEN_CAP, // non-binding (request-gated)
    budgetFile: 'filing-read-budget.json', // its OWN budget — never shares the article firehose's Groq quota
    limiter: 'filing-read', // its OWN process-wide limiter, independent of the ingester's
    paceMeter: 'requests',
    paceCap: cfg.filingReadDailyReqCap,
    paceFloorFrac: cfg.freeProviderPaceFloorFrac,
  }]
}
export const FILING_READ_PROVIDERS: ArticleReadProvider[] = buildFilingReadProviders()

// ---- reserved (non-company) folders under data/ ----
// Folders under data/ that are NOT companies — never list or treat them as tickers (case-insensitive).
// 'news-archive' is the news-ingester's Drive mirror; BOTH its raw and uppercased ("renamed") forms are
// reserved, so the cockpit's rename hint can never turn the mirror into a fake valid ticker. And if
// NEWS_ARCHIVE_DIR resolves to a folder that lives INSIDE data/, that folder's basename is reserved too
// — derived from config, never a second hardcoded name (§26). Pure + injectable so it unit-tests without
// touching the real mount.
// 'EXTERNAL-INBOX' is the external-data drop folder (frameworks/EXTERNAL_DATA.md): the user (or a
// paid-API fetcher) drops files there, and ingest_external.py routes them into per-ticker pools —
// it matches TICKER_RE, so without this reservation it would list as a phantom company.
// 'WATCHLIST' is drive.ts's uploadToWatchlist() folder — reached from the SAME GDRIVE.dataFolderId every
// company folder is created under (drive.ts::ensureCompanyFolder), which on an install where that folder
// is mirrored locally as data/ (the same contract §110 above relies on) makes WATCHLIST a sibling of every
// real <TICKER>/ folder. It passes TICKER_RE, so without this reservation a run launched against
// "WATCHLIST" would have the pool extractor recursively ingest every attached PDF as evidence — the exact
// thing watchlist.ts's own doctrine comment says "cannot land in the pool" is guaranteed by the code.
export const RESERVED_DATA_FOLDERS = new Set(['news-archive', 'NEWS-ARCHIVE', 'EXTERNAL-INBOX', 'WATCHLIST'])

export function isReservedDataFolder(name: string, dataDir: string = DATA_DIR, archiveDir: string = NEWS.newsArchiveDir): boolean {
  const lower = name.toLowerCase()
  for (const r of RESERVED_DATA_FOLDERS) if (r.toLowerCase() === lower) return true
  // The CONFIGURED watchlist folder, not only the literal 'WATCHLIST' in the set above. Making the name
  // configurable without this would have opened a real footgun: a folder called e.g. `THESES` is
  // ticker-shaped (TICKER_RE is uppercase, ≤15 chars, no spaces) and would have been walked as a company
  // and ingested as evidence. A lowercase, hyphenated name escapes by accident rather than by design, and
  // an operator should not have to know the ticker regex to choose a folder name safely.
  if (GDRIVE.watchlistFolder && GDRIVE.watchlistFolder.toLowerCase() === lower) return true
  if (archiveDir) {
    try {
      // reuse analyzeTicker's containment idiom: only reserve the archive's basename when it really
      // resolves INSIDE data/ (NEWS_ARCHIVE_DIR is usually a SEPARATE Drive mount, so this is normally a no-op)
      const real = fs.realpathSync(path.resolve(archiveDir))
      const baseReal = fs.realpathSync(dataDir)
      if ((real === baseReal || real.startsWith(baseReal + path.sep)) && path.basename(real).toLowerCase() === lower) return true
    } catch { /* archive dir missing / unreadable / not under data — ignore */ }
  }
  return false
}

// ---- in-app uploads to the shared Google Drive folder ----
// Users drag-drop documents in the cockpit; the server uploads each into the <TICKER> sub-folder of the
// shared Drive folder using ONE app credential (a service account, or one connected account's OAuth refresh
// token) — no per-user sign-in. The engine keeps READING the local Drive-for-Desktop mount; uploaded files
// appear in the cockpit once Drive syncs them back down. Uploads are OFF (UI hidden) unless a destination
// folder id AND a credential are both present.
export const GDRIVE = {
  // the Drive folder whose children are the per-company <TICKER> folders — the cloud twin of local data/.
  dataFolderId: process.env.GDRIVE_DATA_FOLDER_ID || '',
  // service-account credentials: a path to the JSON key file, or the JSON inline.
  saKeyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
  saJson: process.env.GDRIVE_SA_JSON || '',
  // OR a connected Google account's OAuth (files owned by that account; counts against ITS Drive quota).
  oauthClientId: process.env.GDRIVE_OAUTH_CLIENT_ID || '',
  oauthClientSecret: process.env.GDRIVE_OAUTH_CLIENT_SECRET || '',
  oauthRefreshToken: process.env.GDRIVE_OAUTH_REFRESH_TOKEN || '',
  // the Shared Drive id the folder lives in. STRONGLY recommended with a service account: an SA has NO
  // personal storage quota, so writing into a plain My Drive folder fails — but it CAN write to a Shared
  // Drive it's a member of (files are owned by the Shared Drive). Leave empty ONLY when using an OAuth
  // refresh token for a real account.
  sharedDriveId: process.env.GDRIVE_SHARED_DRIVE_ID || '',
  // The child folder watchlist thesis PDFs are written to, under dataFolderId. Configurable because the
  // lookup is an EXACT, case-sensitive Drive name query: an operator who has already made a folder by
  // another name would otherwise get a second, empty `WATCHLIST` created beside it and never notice.
  watchlistFolder: process.env.GDRIVE_WATCHLIST_FOLDER || 'WATCHLIST',
  uploadMaxBytes: capNum(process.env.ENGINE_UPLOAD_MAX_BYTES, 40 * 1024 * 1024), // 40 MB per file
  uploadMaxFiles: capNum(process.env.ENGINE_UPLOAD_MAX_FILES, 20), // files per upload request
}
// Uploads are available iff we know WHERE to write AND have SOME credential to write with.
export const GDRIVE_ENABLED = Boolean(
  GDRIVE.dataFolderId &&
    (GDRIVE.saKeyFile || GDRIVE.saJson || (GDRIVE.oauthClientId && GDRIVE.oauthClientSecret && GDRIVE.oauthRefreshToken)),
)
