import './load-env' // FIRST: load provider keys from the out-of-repo secret dir before any process.env read below
import fs from 'node:fs'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import type { ArticleReadProvider } from './news/triage/article-read'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ui/server/src -> repo root is three levels up. Override with ENGINE_REPO_ROOT if needed.
export const REPO_ROOT = process.env.ENGINE_REPO_ROOT
  ? path.resolve(process.env.ENGINE_REPO_ROOT)
  : path.resolve(__dirname, '../../..')

export const AGENTS_DIR = path.join(REPO_ROOT, '.claude', 'agents')
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

// OPT-IN (off by default): orchestrate a full run as a CHAIN of separate per-module runs (each its own
// budget), in dependency order, then the master synthesizer — instead of one monolithic /research:full
// process. No single budget cap can then truncate the whole pipeline. Enable with ENGINE_FULL_PER_MODULE=1.
// Each step is its own run + its own activity-log entry (most transparent). Until validated, the default
// stays the single-process /research:full path.
export const FULL_PER_MODULE = process.env.ENGINE_FULL_PER_MODULE === '1'

export type LaunchKind = 'full' | 'module' | 'agent' | 'rerun' | 'review' | 'track' | 'signal' | 'sweep' | 'screener-agent' | 'handoff'

// Runaway / cost guards per launch granularity. These are HARD ceilings: the headless CLI stops when it
// hits the budget/turn cap, even mid-run. The earlier full-run defaults (800 turns / $60) truncated a
// large, data-heavy company (TMCV) before the catalyst module + master synthesizer ran — leaving no
// final thesis/memo. Defaults are now generous enough to finish a full 6-module + master run for a
// data-heavy company, and every cap is env-tunable so they can be raised/lowered without a code change.
const capNum = (v: string | undefined, d: number) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : d
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
  baseUrl: string // OpenAI-compatible base (…/v1)
  model: string // primary model
  models?: string[] // optional fallback chain (OpenRouter only; OpenAI standard ignores it)
  dailyReqCap: number
  rpm: number
  // Token-gated free tiers (e.g. Cerebras: ~1M tokens/DAY, ~60k tokens/min) bind on TOKENS, not requests —
  // set these to pace on the BINDING limit: tpm feeds the per-minute limiter, dailyTokenCap the daily budget.
  // Request-gated providers (OpenRouter/NVIDIA) omit them → tpm 0 + a non-binding token cap (prior behaviour).
  tpm?: number
  dailyTokenCap?: number
  maxTokens: number
  extraBody?: Record<string, unknown> // provider-specific body fields (e.g. OpenRouter reasoning effort)
  headers?: Record<string, string> // provider-specific headers (e.g. OpenRouter ranking)
  budgetFile: string
  dayTz?: string // daily reset zone (undefined = UTC)
}

// Build the overflow chain from whatever keys are present. ONLY OpenAI-compatible providers belong here
// (Gemini is separate — it uses generateContent, not chat/completions). Order = priority (best first).
function buildOverflowProviders(): OverflowProvider[] {
  const out: OverflowProvider[] = []
  // Cerebras Inference — placed FIRST: the biggest + fastest free pool here, token-gated. Per Cerebras'
  // CURRENT docs the Free-Trial tier is 5 req/min, 30k tokens/min, 1M tokens/day (whichever binds first),
  // so the defaults pace UNDER those (RPM < 5, TPM < 30k, daily token cap ~10% under 1M) and are overridable
  // UPWARD (NEWS_CEREBRAS_RPM/TPM/…) on a paid Pay-as-you-go key. OpenAI-compatible (/chat/completions).
  // Secret lives in env.
  // ⚠️ MODEL CAVEAT (needs a live key to resolve): `llama-3.3-70b` has been RETIRED on Cerebras. The only
  // current models (gpt-oss-120b, zai-glm-4.7) are REASONING models — exactly what burns the output budget
  // thinking → truncated JSON, the failure this provider was added to avoid. Switching the default safely
  // needs reasoning_effort:'low' + Cerebras' `max_completion_tokens` field (NOT max_tokens) + a higher token
  // budget, validated against a real key. Until then set NEWS_CEREBRAS_MODEL to a working model per-deploy.
  const cbKey = process.env.CEREBRAS_API_KEY || ''
  if (cbKey && process.env.NEWS_CEREBRAS_ENABLED !== '0') {
    out.push({
      id: 'cerebras', label: 'Cerebras', color: '--provider-cb',
      apiKey: cbKey, baseUrl: process.env.CEREBRAS_BASE_URL || 'https://api.cerebras.ai/v1',
      model: process.env.NEWS_CEREBRAS_MODEL || 'llama-3.3-70b',
      dailyReqCap: capNum(process.env.NEWS_CEREBRAS_DAILY_REQ_CAP, 14_400), // loose backstop — the token cap binds first
      rpm: capNum(process.env.NEWS_CEREBRAS_RPM, 4), // under the free-trial 5 req/min ceiling (override up on a paid key)
      tpm: capNum(process.env.NEWS_CEREBRAS_TPM, 28_000), // under the free-trial 30k tokens/min ceiling
      dailyTokenCap: capNum(process.env.NEWS_CEREBRAS_DAILY_TOKEN_CAP, 900_000), // ~10% under the 1M tokens/day free tier
      maxTokens: capNum(process.env.NEWS_CEREBRAS_MAX_TOKENS, 2500),
      budgetFile: 'cerebras-budget.json',
    })
  }
  // Mistral La Plateforme free ("Experiment") tier — RATE-gated, not token-gated: ~1 request/SECOND, with a
  // ~1B-tokens/MONTH budget that is non-binding for our overflow volume. So it's wired like the other
  // request-gated pools (NO daily token cap → the chip reads requests, its real lever): the binding control
  // is request SPACING. rpm sits well under 1 req/s (≈1.3s gap) with margin, and a 429 still backs off on
  // retry-after. mistral-small is fast, strong, and speaks clean JSON mode. OpenAI-compatible
  // (/chat/completions, Bearer auth). Secret lives in env. Off when no key or NEWS_MISTRAL_ENABLED=0.
  const mlKey = process.env.MISTRAL_API_KEY || ''
  if (mlKey && process.env.NEWS_MISTRAL_ENABLED !== '0') {
    out.push({
      id: 'mistral', label: 'Mistral', color: '--provider-ml',
      apiKey: mlKey, baseUrl: process.env.MISTRAL_BASE_URL || 'https://api.mistral.ai/v1',
      model: process.env.NEWS_MISTRAL_MODEL || 'mistral-small-latest',
      dailyReqCap: capNum(process.env.NEWS_MISTRAL_DAILY_REQ_CAP, 2000), // soft daily backstop — the 1 req/s rate is the real limit
      rpm: capNum(process.env.NEWS_MISTRAL_RPM, 45), // under the ~1 req/s free ceiling (≈1.3s spacing) with margin
      maxTokens: capNum(process.env.NEWS_MISTRAL_MAX_TOKENS, 2500),
      budgetFile: 'mistral-budget.json',
    })
  }
  const orKey = process.env.OPENROUTER_API_KEY || ''
  if (orKey && process.env.NEWS_OPENROUTER_ENABLED !== '0') {
    // OpenRouter: strongest free models (gpt-oss-120b…). Free = ~20 RPM, ~50/day pooled (no credits) →
    // ~1000/day once $10 is loaded (free models still cost $0). Fallback chain (max 3) routes around 429s.
    const models = (process.env.NEWS_OPENROUTER_MODELS || 'openai/gpt-oss-120b:free,openai/gpt-oss-20b:free,meta-llama/llama-3.3-70b-instruct:free').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3)
    out.push({
      id: 'openrouter', label: 'OpenRouter', color: '--provider-or',
      apiKey: orKey, baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      model: models[0] || 'openai/gpt-oss-120b:free', models,
      dailyReqCap: capNum(process.env.NEWS_OPENROUTER_DAILY_REQ_CAP, 45),
      rpm: capNum(process.env.NEWS_OPENROUTER_RPM, 18),
      maxTokens: capNum(process.env.NEWS_OPENROUTER_MAX_TOKENS, 3500),
      extraBody: { reasoning: { effort: 'low' } }, // gpt-oss is a reasoning model — keep thinking minimal
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
      apiKey: nvKey, baseUrl: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
      model: process.env.NEWS_NVIDIA_MODEL || 'meta/llama-3.3-70b-instruct',
      // NVIDIA free is a FINITE credit pool (~1,000, →5,000 with a business email) that EXPIRES in ~30 days,
      // not a daily-resetting tier — so it's a temporary high-quality boost. Ration ~150/day so a 5,000 pool
      // lasts the ~30 days; if it's the 1,000 pool it burns out sooner and the loop's 4xx-exhaust skips it.
      dailyReqCap: capNum(process.env.NEWS_NVIDIA_DAILY_REQ_CAP, 150),
      rpm: capNum(process.env.NEWS_NVIDIA_RPM, 36),
      maxTokens: capNum(process.env.NEWS_NVIDIA_MAX_TOKENS, 2000),
      budgetFile: 'nvidia-budget.json',
    })
  }
  return out
}
export const LAUNCH_GUARDS: Record<LaunchKind, { maxTurns: number; budgetUsd: number }> = {
  full: { maxTurns: capNum(process.env.ENGINE_FULL_MAX_TURNS, 2500), budgetUsd: capNum(process.env.ENGINE_FULL_BUDGET_USD, 300) },
  module: { maxTurns: capNum(process.env.ENGINE_MODULE_MAX_TURNS, 350), budgetUsd: capNum(process.env.ENGINE_MODULE_BUDGET_USD, 56) },
  agent: { maxTurns: capNum(process.env.ENGINE_AGENT_MAX_TURNS, 60), budgetUsd: capNum(process.env.ENGINE_AGENT_BUDGET_USD, 12) },
  // re-run one orb + its downstream synthesis chain to the master: between a module and a full run.
  rerun: { maxTurns: capNum(process.env.ENGINE_RERUN_MAX_TURNS, 1200), budgetUsd: capNum(process.env.ENGINE_RERUN_BUDGET_USD, 160) },
  // file one outcome review (read decision_record + thesis, optional web price fetch, write a review JSON).
  review: { maxTurns: capNum(process.env.ENGINE_REVIEW_MAX_TURNS, 120), budgetUsd: capNum(process.env.ENGINE_REVIEW_BUDGET_USD, 20) },
  // rebuild the calls-tracker dashboard (read-only aggregate of records + reviews; no web).
  track: { maxTurns: capNum(process.env.ENGINE_TRACK_MAX_TURNS, 120), budgetUsd: capNum(process.env.ENGINE_TRACK_BUDGET_USD, 20) },
  // screener swarm — one signal through the whole gauntlet (4 modules, ~13 agents, fail-fast gates
  // mean most signals stop early and cost far less than the ceiling).
  signal: { maxTurns: capNum(process.env.ENGINE_SIGNAL_MAX_TURNS, 900), budgetUsd: capNum(process.env.ENGINE_SIGNAL_BUDGET_USD, 100) },
  // market sweep: WebSearch across approved sources -> inbox JSON only (no gauntlet work).
  sweep: { maxTurns: capNum(process.env.ENGINE_SWEEP_MAX_TURNS, 120), budgetUsd: capNum(process.env.ENGINE_SWEEP_BUDGET_USD, 20) },
  // one screener orb into an existing signal run (mirror of research 'agent').
  'screener-agent': { maxTurns: capNum(process.env.ENGINE_SCREENER_AGENT_MAX_TURNS, 60), budgetUsd: capNum(process.env.ENGINE_SCREENER_AGENT_BUDGET_USD, 12) },
  // idempotent thesis->ticker handoff: read the locked record, write one data-pool memo + ledger line.
  handoff: { maxTurns: capNum(process.env.ENGINE_HANDOFF_MAX_TURNS, 60), budgetUsd: capNum(process.env.ENGINE_HANDOFF_BUDGET_USD, 10) },
}

// Rough cost/time estimates surfaced to the UI before launch (heuristic only; the hard cap is budgetUsd).
// Calibrated to the one metered full run (TMCV, 2026-06-14): 60 orbs, $88.99, 153 min wall-clock => ~$1.48/orb.
// These per-orb numbers drive the module / agent / rerun estimates (agentCount x per-orb); the full run is
// calibrated separately in estimate(), since it pipelines all six modules and so overlaps far more than a
// single module does. perAgentMin is the per-orb WALL-CLOCK contribution, not the raw orb duration: within
// one module the layers serialize, so a module's per-orb wall-clock (~3-5 min) sits above the full run's
// blended ~2.5 min/orb. Honest "~" ranges, not false-precise points.
export const ESTIMATES = {
  perAgentUsd: [0.8, 2.2] as [number, number],
  perAgentMin: [3, 5] as [number, number],
}

// ---- autonomous news ingester (screener swarm) ----
// The "forever-living" front door of the screener: pull a free news firehose (GDELT, keyless),
// score each item with a FREE LLM (Groq) as a cheap brain, and fill a RANKED inbox — all at ~$0.
// It writes the same inbox contract the manual /screener:sweep already fills, so nothing downstream
// changes. It NEVER spends Claude money: promoting an inbox row into the paid gauntlet stays the
// human's one-click action (the cockpit "check it ▸" button). Auto-promote is intentionally absent.
//
// Every knob is env-tunable; the loop is OFF unless a Groq key is present, so a deploy without the
// key behaves exactly as before. Defaults sit well under Groq's free-tier ceilings (~1k req/day,
// ~100-200k tokens/day) with margin, so a smartly-batched cycle never trips a rate limit.
export const NEWS = {
  // The only secret. Absent → the ingester stays dark (no fetch, no scheduler).
  groqApiKey: process.env.GROQ_API_KEY || '',
  // A small, fast, cheap Groq model is ideal for batched title-triage. Model ids change — confirm
  // the current free model when you provision the key. Override with GROQ_MODEL.
  groqModel: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
  groqBaseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
  // CLOUD ARCHIVE — the raw-news firehose files are mirrored to a Google Drive for Desktop mount folder
  // (the news-archive launchd agent copies them there; Drive uploads to the cloud). Local files older than
  // the retention window are then pruned, so the laptop disk stays bounded while the full history lives in
  // the cloud. readFeed falls back to this folder for days no longer on local disk, so the time-travel
  // filter still spans the whole archive. Empty → no cloud archive (read local only).
  newsArchiveDir: process.env.NEWS_ARCHIVE_DIR || '',
  newsLocalRetentionDays: capNum(process.env.NEWS_LOCAL_RETENTION_DAYS, 30), // days of firehose kept on local disk
  // Master switch. Default: ON iff a key exists. Set NEWS_INGEST_ENABLED=0 to force off even with a key.
  enabled: process.env.NEWS_INGEST_ENABLED === '0' ? false : Boolean(process.env.GROQ_API_KEY),
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
  // the next cycle (never lost, never zero-scored). The REQUEST cap matches Groq's real free-tier RPD
  // for 8b-instant — 14,400/day (verified Jun 2026) — set to 13,000 to hold a safety margin. It was
  // previously 1,500, which was the BINDING throttle: failed/timed-out calls (each still counts as a
  // request) exhausted it by mid-day while only ~31% of the token ceiling was used, forcing everything
  // onto overflow and leaving Groq dark. With the cap raised, the TOKEN cap (500k = Groq's real free
  // TPD, the true ceiling) governs instead — converting the unused token headroom into ~free throughput.
  // On a higher Groq tier both rise automatically via the live rate-limit headers. Tune down on a
  // constrained tier (8b-instant is ~$0.05/M tokens, so 500k tokens/day ≈ $0.025 if ever metered).
  groqDailyReqCap: capNum(process.env.NEWS_GROQ_DAILY_REQ_CAP, 13_000),
  groqDailyTokenCap: capNum(process.env.NEWS_GROQ_DAILY_TOKEN_CAP, 500_000),
  // Daily-budget PACER. The caps above stop us BUSTING the day's limit; the pacer stops us SPENDING IT
  // ALL AT ONCE. It releases the day's token TARGET on a linear schedule across the UTC day, so a heavy
  // news morning can't drain the budget and leave the afternoon dark — and an explicit buffer is always
  // held back (target < cap). On a normal-volume day the schedule outruns demand and the pacer never
  // bites (items triage promptly); only on overload days does it meter spend into an even all-day drip.
  //   groqDailyTokenTarget — the day's spend goal (default ≈ 90% of the cap → ~10% buffer always held).
  //   groqPaceFloorFrac    — small always-available slice of the target for a start-of-day burst and to
  //                          keep tiny backlogs clearing when exactly on schedule.
  // Set the target ≥ the cap (or to the cap) to effectively disable pacing and pace against the hard cap.
  groqDailyTokenTarget: capNum(process.env.NEWS_GROQ_DAILY_TOKEN_TARGET, Math.round(capNum(process.env.NEWS_GROQ_DAILY_TOKEN_CAP, 500_000) * 0.9)),
  groqPaceFloorFrac: capNum(process.env.NEWS_GROQ_PACE_FLOOR_FRAC, 0.06),
  // Pacing. The binding free-tier limit is TOKENS-per-minute, not requests-per-minute — so we pace by
  // both, and (crucially) the pacer LEARNS the live ceiling from Groq's own x-ratelimit-* response
  // headers, auto-tuning to whatever this account actually allows. These are starting points / fallbacks:
  //   groqRpm — requests/min floor (under the 30 free RPM); groqTpm — tokens/min (8b-instant free ≈ 6000).
  // On a higher tier the headers raise the ceiling automatically; no redeploy needed.
  groqRpm: capNum(process.env.NEWS_GROQ_RPM, 28),
  groqTpm: capNum(process.env.NEWS_GROQ_TPM, 6000),
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
  geminiMaxTokens: capNum(process.env.NEWS_GEMINI_MAX_TOKENS, 2000),
  geminiDayTz: process.env.NEWS_GEMINI_DAY_TZ || 'America/Los_Angeles', // RPD resets midnight Pacific
  // OpenAI-compatible OVERFLOW providers (OpenRouter, NVIDIA NIM, …) — a registry, tried in order after
  // Groq is paced/capped, each with its own free daily budget + limiter. Their free models are far stronger
  // than Groq's 8B. Adding another OpenAI-compatible free key = one entry in buildOverflowProviders() — it
  // then auto-appears in routing, the drain gate, status, and as a cockpit chip (§26, zero other edits).
  overflowProviders: buildOverflowProviders(),
  triageBatch: capNum(process.env.NEWS_TRIAGE_BATCH, 12),
  // GDELT look-back per cycle (minutes; > pollInterval gives overlap so nothing slips the gap).
  gdeltLookbackMin: capNum(process.env.NEWS_GDELT_LOOKBACK_MIN, 40),
  gdeltBaseUrl: process.env.NEWS_GDELT_BASE_URL || 'https://api.gdeltproject.org/api/v2/doc/doc',
  // GDELT rate limits HARD: its 429 body literally says "limit requests to one every 5 seconds", and a
  // burst parks the whole IP. With ~22 GDELT-queried domains, chunkSize 11 = just 2 OR-queries/cycle
  // (each ~250 chars — safely under GDELT's query-length ceiling, where ~28 domains/632 chars is "too
  // long"), spaced 6s apart so each lands in its own 5s window. This was the GDELT outage: 4 queries at
  // 1.5s spacing 429'd every cycle, so GDELT (our broadest genuinely-new global source) returned ~zero.
  gdeltChunkSize: capNum(process.env.NEWS_GDELT_CHUNK_SIZE, 11),
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
  // Live-feed per-item records (firehose kind:"item") — the daily cap bounds file growth.
  feedItemsDailyCap: capNum(process.env.NEWS_FEED_ITEMS_DAILY_CAP, 5000),
  // Groq output budget per triage call (the per-item payload grew with companies/size_bucket).
  triageMaxTokens: capNum(process.env.NEWS_TRIAGE_MAX_TOKENS, 2000),
  // THEMES layer (news/themes/*): buckets the ranked firehose into living investment themes, scores +
  // ranks them (hot/active/cooling/parked, auto-decaying), and assigns 1st/2nd/3rd-order companies.
  // Assignment runs every cycle (deterministic, $0); discovery runs every Nth cycle. The discovery
  // NAMING/ripple pass optionally uses Claude-Haiku (the ONE place the ingester can spend Claude
  // money) — off unless THEMES_CLAUDE_API_KEY is set; otherwise discovery stays deterministic ($0).
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
  themesClaudeBaseUrl: process.env.THEMES_CLAUDE_BASE_URL || 'https://api.anthropic.com',
  themesClaudeDailyCap: capNum(process.env.NEWS_THEMES_CLAUDE_DAILY_CAP, 60), // max Claude discovery calls/day
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
  // Background self-heal (news/enrich-heal.ts): each ingest cycle, re-read this many DEGRADED stories (a
  // readable article whose on-demand LLM read momentarily missed) that are still on the live wire, so a
  // story fixes itself even if no human reopens it. Capped + budget-gated so it never starves the title
  // triage. 0 disables the pass (the short degraded TTL still self-heals on the next manual open).
  enrichHealMaxPerCycle: capNum(process.env.NEWS_ENRICH_HEAL_MAX_PER_CYCLE, 6),
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
    out.push({ id: 'groq', kind: 'openai', apiKey: cfg.groqApiKey, baseUrl: cfg.groqBaseUrl, model: cfg.groqModel, maxTokens: 900, rpm: cfg.groqRpm, tpm: cfg.groqTpm, dailyReqCap: cfg.groqDailyReqCap, dailyTokenCap: cfg.groqDailyTokenCap, budgetFile: 'groq-budget.json', limiter: 'groq' })
  }
  if (cfg.geminiEnabled && cfg.geminiApiKey && cfg.geminiModels.length) {
    out.push({ id: 'gemini', kind: 'gemini', apiKey: cfg.geminiApiKey, baseUrl: cfg.geminiBaseUrl, model: cfg.geminiModel, pool: cfg.geminiModels, maxTokens: cfg.geminiMaxTokens, rpm: cfg.geminiRpm, tpm: cfg.geminiTpm, dailyReqCap: cfg.geminiDailyReqCap, dailyTokenCap: cfg.geminiDailyTokenCap, budgetFile: 'gemini-budget-{model}.json', dayTz: cfg.geminiDayTz, limiter: 'gemini' })
  }
  for (const p of cfg.overflowProviders) {
    // OpenAI-compatible overflow: its own named limiter + daily budget file, exactly as runCycle uses it. A
    // TOKEN-gated provider (Cerebras) carries its own tpm + daily token cap, so the read paces on the SAME
    // binding limit as the ingester (they share the budget file + limiter); request-gated providers
    // (OpenRouter/NVIDIA) omit them → tpm 0 + a non-binding token cap, the prior behaviour byte-for-byte.
    out.push({ id: p.id, kind: 'openai', apiKey: p.apiKey, baseUrl: p.baseUrl, model: p.model, models: p.models, maxTokens: p.maxTokens, rpm: p.rpm, tpm: p.tpm ?? 0, dailyReqCap: p.dailyReqCap, dailyTokenCap: p.dailyTokenCap ?? 50_000_000, budgetFile: p.budgetFile, dayTz: p.dayTz, headers: p.headers, extraBody: p.extraBody, limiter: p.id })
  }
  return out
}

// Built once at startup from the present keys; consumed by the /api/news/enrich route.
export const ARTICLE_READ_PROVIDERS: ArticleReadProvider[] = buildArticleReadProviders()
