import path from 'node:path'
import fs from 'node:fs'
import { AGENTS_DIR, ANALYSES_DIR, REPO_ROOT, isReservedDataFolder } from './config'

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

// Resolve a requested path and assert it lives inside the screener's store tree (screener/ at the
// repo root: runs, ledger, inbox, board). Dedicated reader sandbox so /api/output can stay locked
// to analyses/ — screener artifacts are served ONLY through the /api/screener/* readers.
const SCREENER_DIR = path.join(REPO_ROOT, 'screener')
export function resolveInsideScreener(reqPath: string): string {
  const abs = path.isAbsolute(reqPath) ? reqPath : path.join(REPO_ROOT, reqPath)
  const real = fs.realpathSync(abs) // throws ENOENT for missing -> caller maps to 404
  const baseReal = fs.realpathSync(SCREENER_DIR)
  if (real !== baseReal && !real.startsWith(baseReal + path.sep)) {
    throw new Error('Path escapes the screener sandbox')
  }
  return real
}

// Validation patterns — launch params must also match the discovered roster (closed allow-list).
export const TICKER_RE = /^[A-Z0-9.\-]{1,15}$/
export const MODULE_RE = /^[a-z0-9-]{1,40}$/
export const AGENT_RE = /^[a-z0-9-]{1,60}$/
// Screener subject/record ids (shape-validated before any path is built from them).
export const SIG_RE = /^SIG-[0-9]{8}-[a-f0-9]{8}$/
export const THESIS_RE = /^THS-SIG-[0-9]{8}-[a-f0-9]{8}-v[0-9]+$/

export function isValidTicker(name: string): boolean {
  return TICKER_RE.test(name)
}

// A usable ticker symbol derived from a folder name (uppercase, drop spaces/illegal chars, cap length).
// e.g. "TATA MOTORS" -> "TATAMOTORS", "reliance.ns" -> "RELIANCE.NS". Empty if nothing usable remains.
export function suggestTicker(name: string): string {
  return name.toUpperCase().replace(/[^A-Z0-9.\-]/g, '').slice(0, 15)
}

// Plain-English reason a folder name can't be used as a ticker (null if it's fine). Drives the cockpit's
// "rename this folder" guidance so an unusable name is never a silent dead end.
export function tickerInvalidReason(name: string): string | null {
  if (isValidTicker(name)) return null
  if (/\s/.test(name)) return 'ticker names can’t contain spaces'
  if (/[a-z]/.test(name)) return 'ticker names must be uppercase'
  if (name.length > 15) return 'ticker name is too long (max 15 characters)'
  return 'ticker names allow only A–Z, 0–9, dot and hyphen'
}

// ---- in-app upload validation ----
// Document types the cockpit uploader accepts into a company's Drive folder (lowercase, no leading dot).
export const UPLOAD_ALLOWED_EXTS = ['pdf', 'xlsx', 'xls', 'csv', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'md', 'json', 'png', 'jpg', 'jpeg']

// Make an uploaded filename safe to write into a Drive folder: strip any path components (defeats ../,
// absolute paths, and Windows backslashes — Node's POSIX path.basename does NOT split on '\', so split
// first), reject dotfiles/sentinels (e.g. .nostradamus_output, .DS_Store), cap length, reject control
// chars, and enforce the extension allow-list. Returns the cleaned basename or a plain-English reason.
export function sanitizeUploadFilename(name: string): { ok: true; name: string } | { ok: false; reason: string } {
  const base = path.basename(String(name ?? '').split(/[\\/]/).pop() || '')
  if (!base || base === '.' || base === '..') return { ok: false, reason: 'missing or invalid filename' }
  if (base.startsWith('.')) return { ok: false, reason: 'hidden / system files aren’t accepted' }
  if (base.length > 180) return { ok: false, reason: 'filename too long (max 180 characters)' }
  if (/[\x00-\x1f\x7f]/.test(base)) return { ok: false, reason: 'filename has control characters' }
  const ext = base.includes('.') ? (base.split('.').pop() || '').toLowerCase() : ''
  if (!ext || !UPLOAD_ALLOWED_EXTS.includes(ext)) {
    return { ok: false, reason: `unsupported file type — allowed: ${UPLOAD_ALLOWED_EXTS.join(', ')}` }
  }
  return { ok: true, name: base }
}

// Validate a NEW company ticker the user typed in the cockpit. Pure (no filesystem / no Drive): reuses the
// same rules + messages as the Drive-folder rename hint, plus the reserved-folder guard. The server route
// turns this into a 400 {error, suggested}; folder existence (409) is checked separately against Drive.
export function validateNewTicker(name: string): { ok: true; ticker: string } | { ok: false; reason: string; suggested?: string } {
  const ticker = String(name ?? '').trim()
  const reason = tickerInvalidReason(ticker)
  if (reason) return { ok: false, reason, suggested: suggestTicker(ticker) || undefined }
  if (isReservedDataFolder(ticker)) return { ok: false, reason: 'that name is reserved for a system folder' }
  return { ok: true, ticker }
}
