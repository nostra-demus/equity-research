import path from 'node:path'
import fs from 'node:fs'
import { AGENTS_DIR, ANALYSES_DIR, REPO_ROOT } from './config'

// Resolve a requested path and assert it lives inside analyses/ (defeats ../ and symlink escapes).
export function resolveInsideAnalyses(reqPath: string): string {
  const abs = path.isAbsolute(reqPath) ? reqPath : path.join(REPO_ROOT, reqPath)
  const real = fs.realpathSync(abs) // throws ENOENT for missing -> caller maps to 404
  const baseReal = fs.realpathSync(ANALYSES_DIR)
  if (real !== baseReal && !real.startsWith(baseReal + path.sep)) {
    throw new Error('Path escapes the analyses sandbox')
  }
  return real
}

const FRAMEWORKS_DIR = path.join(REPO_ROOT, 'frameworks')
const within = (real: string, dir: string): boolean => {
  let baseReal: string
  try {
    baseReal = fs.realpathSync(dir)
  } catch {
    return false
  }
  return real === baseReal || real.startsWith(baseReal + path.sep)
}

// Resolve a requested PROMPT path and assert it lives inside the engine's readable doctrine surface:
// any agent/module-rules markdown under .claude/agents/, the shared frameworks/ docs, or the root
// CLAUDE.md constitution. Read-only — exposes the exact instructions each orb/module runs on so they
// can be reviewed and improved. Module-name agnostic (CLAUDE.md §26): it allow-lists DIRECTORIES, never
// individual module names, so a new module's prompts are servable the moment its folder exists.
export function resolveInsidePrompts(reqPath: string): string {
  const abs = path.isAbsolute(reqPath) ? reqPath : path.join(REPO_ROOT, reqPath)
  const real = fs.realpathSync(abs) // throws ENOENT for missing -> caller maps to 404
  if (!real.endsWith('.md')) throw new Error('Only .md prompt files are served')
  let constitutionReal: string | null = null
  try {
    constitutionReal = fs.realpathSync(path.join(REPO_ROOT, 'CLAUDE.md'))
  } catch {}
  const ok = within(real, AGENTS_DIR) || within(real, FRAMEWORKS_DIR) || (constitutionReal !== null && real === constitutionReal)
  if (!ok) throw new Error('Path escapes the prompts sandbox')
  return real
}

// Validation patterns — launch params must also match the discovered roster (closed allow-list).
export const TICKER_RE = /^[A-Z0-9.\-]{1,15}$/
export const MODULE_RE = /^[a-z0-9-]{1,40}$/
export const AGENT_RE = /^[a-z0-9-]{1,60}$/
