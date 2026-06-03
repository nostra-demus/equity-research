import path from 'node:path'
import fs from 'node:fs'
import { ANALYSES_DIR, REPO_ROOT } from './config'

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

// Validation patterns — launch params must also match the discovered roster (closed allow-list).
export const TICKER_RE = /^[A-Z0-9.\-]{1,15}$/
export const MODULE_RE = /^[a-z0-9-]{1,40}$/
export const AGENT_RE = /^[a-z0-9-]{1,60}$/
