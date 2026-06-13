import { fileURLToPath } from 'node:url'
import path from 'node:path'

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

// The Claude Code CLI used to launch the engine in headless mode.
export const CLAUDE_BIN = process.env.CLAUDE_BIN || 'claude'
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
export const ESTIMATES = {
  perAgentUsd: [0.4, 1.2] as [number, number],
  perAgentMin: [0.3, 0.8] as [number, number],
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
  // Master switch. Default: ON iff a key exists. Set NEWS_INGEST_ENABLED=0 to force off even with a key.
  enabled: process.env.NEWS_INGEST_ENABLED === '0' ? false : Boolean(process.env.GROQ_API_KEY),
  // How often the in-server scheduler runs a cycle (the standalone --once entrypoint ignores this).
  pollIntervalMin: capNum(process.env.NEWS_POLL_INTERVAL_MIN, 15),
  // Daily Groq budget guards. A cycle refuses to call Groq past either cap; unscored items defer to
  // the next cycle (never lost, never zero-scored). Raised for the expanded source set (351 RSS feeds
  // + NSE + GDELT generate far more items/day than the old caps could score). These are the binding
  // constraint on "score everything": on a free Groq key the real limiter is Groq's own rate limit
  // (cycles just defer, no spend); a higher Groq tier uses the extra headroom (8b-instant is ~$0.05/M
  // tokens, so 500k tokens/day ≈ $0.025). Tune down with the env vars on a constrained free tier.
  groqDailyReqCap: capNum(process.env.NEWS_GROQ_DAILY_REQ_CAP, 1500),
  groqDailyTokenCap: capNum(process.env.NEWS_GROQ_DAILY_TOKEN_CAP, 500_000),
  // Throttle (requests/min, under the 30 RPM free limit) and how many articles ride in one Groq call.
  groqRpm: capNum(process.env.NEWS_GROQ_RPM, 25),
  triageBatch: capNum(process.env.NEWS_TRIAGE_BATCH, 12),
  // GDELT look-back per cycle (minutes; > pollInterval gives overlap so nothing slips the gap).
  gdeltLookbackMin: capNum(process.env.NEWS_GDELT_LOOKBACK_MIN, 40),
  gdeltBaseUrl: process.env.NEWS_GDELT_BASE_URL || 'https://api.gdeltproject.org/api/v2/doc/doc',
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
}
