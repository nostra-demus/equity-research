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
export const WEB_DIST = path.join(REPO_ROOT, 'ui', 'web', 'dist')

export const PORT = Number(process.env.PORT || 8787)
export const HOST = '127.0.0.1'

// The Claude Code CLI used to launch the engine in headless mode.
export const CLAUDE_BIN = process.env.CLAUDE_BIN || 'claude'
export const DEFAULT_MODEL = process.env.ENGINE_MODEL || 'sonnet'

export type LaunchKind = 'full' | 'module' | 'agent'

// Runaway / cost guards per launch granularity.
export const LAUNCH_GUARDS: Record<LaunchKind, { maxTurns: number; budgetUsd: number }> = {
  full: { maxTurns: 800, budgetUsd: 60 },
  module: { maxTurns: 250, budgetUsd: 20 },
  agent: { maxTurns: 60, budgetUsd: 5 },
}

// Rough cost/time estimates surfaced to the UI before launch (heuristic only; the hard cap is budgetUsd).
export const ESTIMATES = {
  perAgentUsd: [0.4, 1.2] as [number, number],
  perAgentMin: [0.3, 0.8] as [number, number],
}
