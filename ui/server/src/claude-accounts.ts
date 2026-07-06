// Which Claude (Anthropic) SUBSCRIPTION the engine spends — a small out-of-repo account registry plus a
// persisted "active" selection, so the cockpit can switch between accounts (e.g. two Max seats) with ONE
// click, WITHOUT re-running `claude` on the host. The mechanism is deliberately thin and additive: with no
// registry and no selection, behaviour is EXACTLY as before this file existed (the host's own login is used).
//
//   * REGISTRY (out-of-repo, holds the secrets): $NOSTRA_ENGINE_CONFIG_DIR/claude-accounts.json — the SAME
//     gitignored config dir load-env already reads providers.env from, so no secret is ever committed. Shape:
//       { "accounts": [ { "id": "tech", "label": "tech@muns.io", "token": "sk-ant-oat01-…" } ] }
//     Each token is a long-lived headless OAuth token from `claude setup-token`, generated while logged into
//     THAT account. Tokens live ONLY here — they are NEVER sent to the browser (the API returns id+label only).
//
//   * SELECTION (state, survives restarts): $ENGINE_STATE_DIR/claude-account.json — { "activeId": "tech" }.
//     Absent / unknown id / explicit null == "host default": inject NOTHING, so the CLI authenticates exactly
//     as the host is already logged in (keychain login, or a CLAUDE_CODE_OAUTH_TOKEN already in the env).
//
// The switch takes effect because childEnv() (launcher.ts) runs every spawned `claude` child — research /
// screener runs, the Ask chat, and the usage probe — through applyActiveClaudeAccount(): one selection moves
// all engine spend to the chosen account. Paths are resolved at CALL time from env (not captured at import),
// mirroring load-env, so tests can point them at a temp dir.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { STATE_DIR } from './config'

export interface ClaudeAccount {
  id: string
  label: string
}
interface StoredAccount extends ClaudeAccount {
  token: string
}
export interface ClaudeAccountsState {
  accounts: ClaudeAccount[] // id + label only — tokens never leave the server
  activeId: string | null // null = host default (nothing injected)
  activeLabel: string | null // convenience for the UI pill
  hostDefaultAvailable: boolean // is the host itself carrying a token/key in its env? (informational)
  configPath: string // where to create/edit the registry — shown in the cockpit's setup hint
}

// account ids are short, hand-typed keys — keep them filesystem/JSON-safe and email-friendly
const ID_RE = /^[A-Za-z0-9_.@-]{1,64}$/

function configDir(): string {
  return process.env.NOSTRA_ENGINE_CONFIG_DIR || path.join(os.homedir(), '.config', 'nostra-engine')
}
function registryFile(): string {
  return path.join(configDir(), 'claude-accounts.json')
}
function stateFile(): string {
  // read the state dir at call time so tests can override ENGINE_STATE_DIR; fall back to the config default
  return path.join(process.env.ENGINE_STATE_DIR || STATE_DIR, 'claude-account.json')
}

// tiny cache keyed by file path + mtime so a spawn doesn't re-parse the registry every time, yet a hand-edit
// to the file is still picked up on the next call (no restart needed).
let cache: { key: string; accounts: StoredAccount[] } | null = null

/** Read + validate the account registry. Malformed / missing file → [] (silent, like load-env). */
function readRegistry(): StoredAccount[] {
  const file = registryFile()
  let st: fs.Stats
  try {
    st = fs.statSync(file)
  } catch {
    cache = null
    return []
  }
  const key = `${file}:${st.mtimeMs}`
  if (cache && cache.key === key) return cache.accounts
  let accounts: StoredAccount[] = []
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
    const list = Array.isArray(raw?.accounts) ? raw.accounts : []
    const seen = new Set<string>()
    for (const a of list) {
      const id = typeof a?.id === 'string' ? a.id.trim() : ''
      const token = typeof a?.token === 'string' ? a.token.trim() : ''
      if (!ID_RE.test(id) || !token || seen.has(id)) continue // skip malformed / tokenless / duplicate rows
      seen.add(id)
      const label = typeof a?.label === 'string' && a.label.trim() ? a.label.trim() : id
      accounts.push({ id, label, token })
    }
  } catch {
    accounts = [] // unparseable JSON → treat as no registry
  }
  cache = { key, accounts }
  return accounts
}

/** The persisted active id, or null (host default) when unset / unreadable / malformed. */
function readActiveId(): string | null {
  try {
    const raw = JSON.parse(fs.readFileSync(stateFile(), 'utf8'))
    const id = typeof raw?.activeId === 'string' ? raw.activeId.trim() : ''
    return ID_RE.test(id) ? id : null
  } catch {
    return null
  }
}

function writeActiveId(id: string | null): void {
  const dir = process.env.ENGINE_STATE_DIR || STATE_DIR
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, 'claude-account.json')
  const tmp = `${file}.tmp`
  fs.writeFileSync(tmp, JSON.stringify({ activeId: id }, null, 2))
  fs.renameSync(tmp, file) // atomic replace so a concurrent read never sees a half-written file
}

/** Accounts available to switch between (id + label only — never the token). */
export function listClaudeAccounts(): ClaudeAccount[] {
  return readRegistry().map(({ id, label }) => ({ id, label }))
}

/** The token for the currently-active account, or null for host default / an unknown persisted id. */
export function activeClaudeToken(): string | null {
  const id = readActiveId()
  if (!id) return null
  const acct = readRegistry().find((a) => a.id === id)
  return acct ? acct.token : null // stale/unknown id falls back to host default
}

/**
 * Inject the active account's token into a child env (mutates + returns it). Host default (no selection)
 * leaves the env untouched, so the child authenticates exactly as the host is logged in. When a named
 * account is active, its headless OAuth token is set and any ANTHROPIC_API_KEY is dropped, so the chosen
 * subscription token wins unambiguously (an API key would otherwise route to API billing instead).
 */
export function applyActiveClaudeAccount(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const tok = activeClaudeToken()
  if (tok) {
    env.CLAUDE_CODE_OAUTH_TOKEN = tok
    delete env.ANTHROPIC_API_KEY
  }
  return env
}

/** Switch the active account. `null` (or '') reverts to host default. Rejects an unknown id. */
export function setActiveAccount(id: string | null): { ok: boolean; activeId: string | null; error?: string } {
  if (id === null || id === '') {
    writeActiveId(null)
    return { ok: true, activeId: null }
  }
  if (!ID_RE.test(id)) return { ok: false, activeId: readActiveId(), error: 'bad account id' }
  if (!readRegistry().some((a) => a.id === id)) return { ok: false, activeId: readActiveId(), error: 'unknown account' }
  writeActiveId(id)
  return { ok: true, activeId: id }
}

/** The full state the cockpit renders — accounts, the (normalized) active selection, and the setup path. */
export function accountsState(): ClaudeAccountsState {
  const accounts = listClaudeAccounts()
  const activeId = readActiveId()
  const active = activeId ? accounts.find((a) => a.id === activeId) : undefined // normalize a stale id → host default
  return {
    accounts,
    activeId: active ? active.id : null,
    activeLabel: active ? active.label : null,
    hostDefaultAvailable: Boolean(process.env.CLAUDE_CODE_OAUTH_TOKEN || process.env.ANTHROPIC_API_KEY),
    configPath: registryFile(),
  }
}

/** Test-only: clear the registry mtime cache so a rewritten fixture is re-read. */
export function __resetRegistryCacheForTests(): void {
  cache = null
}
