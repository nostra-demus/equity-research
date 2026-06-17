// Load engine LLM-provider secrets (GROQ / CEREBRAS / GEMINI / OPENROUTER / NVIDIA / ANTHROPIC keys, plus
// any NEWS_* overrides) from the SAME out-of-repo config dir the GitHub App identity already uses
// ($NOSTRA_ENGINE_CONFIG_DIR, default ~/.config/nostra-engine) — so a key is dropped in ONE gitignored file
// OUTSIDE the repo and "just works" for both the cockpit server and the standalone ingester, with no secret
// ever committed (CLAUDE.md §28; mirrors scripts/ops/gh-app-token.sh's github-app.env convention).
//
// Side-effecting: importing this module loads the file into process.env. It NEVER overrides a variable
// already set in the real environment (a launchd plist / shell export still wins), and NEVER throws — a
// missing or malformed file is a silent no-op, so behaviour with no file is exactly as before it existed.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// The provider-secret keys this module injected from providers.env (NOT keys already present in the real
// environment — those are skipped below). Exported so a process that SPAWNS child runs can scrub these
// news-only secrets out of the child's env (a research/screener Claude run never needs them). See
// launcher.ts (childEnv).
export const providerEnvKeys: string[] = []

function loadProviderEnv(): void {
  try {
    const cfgDir = process.env.NOSTRA_ENGINE_CONFIG_DIR || path.join(os.homedir(), '.config', 'nostra-engine')
    const raw = fs.readFileSync(path.join(cfgDir, 'providers.env'), 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const s = line.trim()
      if (!s || s.startsWith('#')) continue
      const body = s.startsWith('export ') ? s.slice(7).trim() : s
      const eq = body.indexOf('=')
      if (eq <= 0) continue
      const key = body.slice(0, eq).trim()
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue
      if (process.env[key]) continue // real env wins — never override an explicitly-set var
      let val = body.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1)
      process.env[key] = val
      providerEnvKeys.push(key)
    }
  } catch {
    // no file / unreadable → silent no-op (keys then come from the real environment only, as before)
  }
}

loadProviderEnv()
