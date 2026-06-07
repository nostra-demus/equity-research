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

export type LaunchKind = 'full' | 'module' | 'agent' | 'rerun'

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
  full: { maxTurns: capNum(process.env.ENGINE_FULL_MAX_TURNS, 2500), budgetUsd: capNum(process.env.ENGINE_FULL_BUDGET_USD, 150) },
  module: { maxTurns: capNum(process.env.ENGINE_MODULE_MAX_TURNS, 350), budgetUsd: capNum(process.env.ENGINE_MODULE_BUDGET_USD, 28) },
  agent: { maxTurns: capNum(process.env.ENGINE_AGENT_MAX_TURNS, 60), budgetUsd: capNum(process.env.ENGINE_AGENT_BUDGET_USD, 6) },
  // re-run one orb + its downstream synthesis chain to the master: between a module and a full run.
  rerun: { maxTurns: capNum(process.env.ENGINE_RERUN_MAX_TURNS, 1200), budgetUsd: capNum(process.env.ENGINE_RERUN_BUDGET_USD, 80) },
}

// Rough cost/time estimates surfaced to the UI before launch (heuristic only; the hard cap is budgetUsd).
export const ESTIMATES = {
  perAgentUsd: [0.4, 1.2] as [number, number],
  perAgentMin: [0.3, 0.8] as [number, number],
}
