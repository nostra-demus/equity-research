# Keeping `app.nostra-demus.com` alive — forever

The public cockpit URL is a **Cloudflare Tunnel → local engine server** (Fastify on `127.0.0.1:8787`,
fronted by Cloudflare Access). macOS `launchd` user agents keep it up — **and keep it on `main`** — with
**no human in the loop**:

| Agent | Runs | Role | Auto-start at login | Auto-restart |
|---|---|---|---|---|
| `com.nostradamus.engine` | `npm start` (`tsx src/server.ts`) in **`nostra-prod/ui/server`** | base | ✅ `RunAtLoad` | ✅ `KeepAlive` |
| `com.nostradamus.deploy` | `deploy.sh` every 120s — **auto-deploys `main`** | base | ✅ `RunAtLoad` | — |
| `com.nostradamus.watchdog` | `watchdog.sh` every 30s | base | ✅ `RunAtLoad` | — (self-heals the others) |
| `com.nostradamus.caffeinate` | `caffeinate -i` (no idle sleep **on AC AND battery**) | base | ✅ `RunAtLoad` | ✅ `KeepAlive` |
| `com.nostradamus.tunnel` | `cloudflared tunnel run nostradamus-engine` | **doer** | ✅ `RunAtLoad` | ✅ `KeepAlive` |
| `com.nostradamus.news-archive` | `news-archive.sh` every 3h | **doer** | ✅ `RunAtLoad` | — |
| `com.nostradamus.external-ingest` | `ingest_external.py` every 10m — routes `data/EXTERNAL-INBOX/` drops into per-ticker pools (`frameworks/EXTERNAL_DATA.md`) | **doer** | ✅ `RunAtLoad` | — |
| `com.nostradamus.news-ingester` | `npm run ingest:once` every 15m (opt-in: set `GROQ_API_KEY`) | **doer** | ✅ `RunAtLoad` | — |
| `com.nostradamus.hk-review` | `housekeeping.sh /research:review-decisions due` daily 06:10 (DUE-gated) | **doer** | — | — |
| `com.nostradamus.hk-track` | `housekeeping.sh /research:track all` daily 06:30 | **doer** | — | — |
| `com.nostradamus.hk-sweep` | `housekeeping.sh /screener:sweep` daily 06:50 | **doer** | — | — |
| `com.nostradamus.hk-size` | `housekeeping.sh /research:size all` daily 07:10 | **doer** | — | — |
| `com.nostradamus.hk-calibrate` | `housekeeping.sh /research:calibrate all` monthly (1st, 07:40) | **doer** | — | — |

### Roles — one doer, N admins
Exactly **one** machine is the **doer**: it owns the public tunnel and runs the autonomous daily jobs
(news + the `hk-*` housekeeping timers). Install it with the default role:

```
bash scripts/ops/install-services.sh                 # role=doer (the always-on host)
```

Any **other** machine (a laptop you also use as a full admin) installs with `--role admin` — it gets the
local engine, auto-deploy, watchdog and caffeinate, but **NOT** the tunnel, news, or timers, so the two
machines never fight over the tunnel or double-run the paid jobs. Re-running with `--role admin` also
**removes** any doer-only agents a machine previously had (a clean doer→admin demotion):

```
bash scripts/ops/install-services.sh --role admin    # secondary machine: engine only, no tunnel/timers
```

### Housekeeping timers (`housekeeping.sh`)
The five `hk-*` agents run one headless Claude slash command each, from the prod worktree, under a per-run
USD cap. `track` / `size` / `calibrate` are pure-local aggregates (near-free, seconds); `sweep` and
`review-decisions` make at most one web pass. `review-decisions` is **DUE-gated** — the wrapper runs
`.claude/hooks/review_due.py` first and skips entirely when nothing is due, so it costs nothing on quiet days.
Tune the cap by adding `HOUSEKEEPING_BUDGET_USD` (default `8`) to any `hk-*` plist's `EnvironmentVariables`
(also `HOUSEKEEPING_MODEL`, `HOUSEKEEPING_MAX_TURNS`, `HOUSEKEEPING_TIMEOUT_SEC`). All housekeeping runs log
to `~/Library/Logs/nostradamus-housekeeping.log`. New full research runs are **never** scheduled — they stay
human-initiated.

**Server-side feedback loops (on for the doer).** The engine plist
(`com.nostradamus.engine.plist`) now sets two more flags so the closed loops run from the always-on
server, not only the macOS `hk-*` timers:
- `CONVICTION_LOOP_ENABLED=1` — the screener conviction reconciler (`conviction-dispatch.ts`)
  auto-fires `/screener:validate` on due checkpoints (+ a wire accelerant), so locked theses actually
  re-rate instead of sitting `scheduled`. Bounded by `CONVICTION_MAX_CONCURRENT` (2), `CONVICTION_DAILY_CAP`
  (12), `CONVICTION_TICK_SEC` (600).
- `REVIEW_DISPATCH_ENABLED=1` — the research review tick (`review-dispatch.ts`) fires due
  30/90/180/365d decision reviews from the server, so the outcome-measurement layer survives the doer
  Mac being asleep (the first three 30d reviews slipped 10-12 days on the launchd-only path). It reuses
  `listAllCalls()`'s DUE timeline (same `review_due` rule; honors the §4a supersession layer). Bounded by
  `REVIEW_MAX_CONCURRENT` (1), `REVIEW_DAILY_CAP` (8), `REVIEW_TICK_SEC` (3600). It is a *superset* of the
  `hk-review` launchd timer — running both is safe (per-ticker in-flight guard + the DUE gate), so the
  timer can stay as a belt-and-braces fallback. **Reinstall the service to pick the flags up**
  (`scripts/ops/install-services.sh`, then `launchctl kickstart -k gui/$UID/com.nostradamus.engine`).
- `BRIDGE_MODE` — the company-news bridge (#359, `bridge-scheduler.ts`). Unlike the two flags above,
  this one IS role-scoped by the installer (not just hardcoded in the plist): a fresh `--role doer`
  install renders `batch` (routes material wire events into covered subjects' pools every 12h; paid
  re-runs stay behind a click); every `--role admin` install renders `off`, always — an admin machine
  never gets autonomous bridge routing, matching the doer-only "no duplicate autonomy" split the other
  agents already get. An operator's own `off`/`stream` choice on an existing doer machine is carried
  forward across reinstall (same shape as `NEWS_ARCHIVE_DIR` below), never silently reset to `batch`.
  See `install-services.sh`'s `BRIDGE_MODE_VALUE` computation.

**Auth for the doer (required).** Both the cockpit and the `hk-*` timers spawn a headless `claude` under
launchd, which cannot prompt for an interactive login — so the doer needs Anthropic credentials available
non-interactively. Provide them the way the engine already reads them (`ui/server/src/load-env.ts`): put
`ANTHROPIC_API_KEY` **or** `CLAUDE_CODE_OAUTH_TOKEN` (from `claude setup-token`) in
`~/.config/nostra-engine/providers.env` (mode 600, outside the repo). `housekeeping.sh` sources that file
before each run, so the timers authenticate exactly like the cockpit's own spawned runs. (A `claude login`
stored credential also works if it is reachable by the launchd GUI agent, but the token file is the reliable
path.) `NEWS_ARCHIVE_DIR` is auto-carried from the existing install on a re-run, so you don't have to re-pass
it every time.

**Feedback → coding-agent dispatch (optional).** The cockpit's Feedback panel can send an item to a coding
agent that opens a **draft PR** (`ui/server/src/feedback-dispatch.ts`). It is OFF and FAIL-CLOSED by default;
to enable it, drop one more file next to `providers.env` — `~/.config/nostra-engine/code-pr.env` (mode 600,
outside the repo, loaded by the same `load-env.ts`):

```
# code-pr.env — fine-grained GitHub PAT (Contents + Pull-requests: write, THIS repo only; no admin).
# NEVER the engine's data-only App identity (§28) — this authors CODE PRs, which the App must not.
GH_PR_TOKEN=github_pat_xxx
ENGINE_FEEDBACK_DISPATCH_ENABLED=1
ENGINE_DISPATCH_ADMINS=you@example.com        # comma-separated; EMPTY ⇒ nobody can dispatch (fail-closed)
# optional knobs: ENGINE_FEEDBACK_BUDGET_USD (15) · ENGINE_FEEDBACK_MAX_TURNS (200) ·
#                 ENGINE_FEEDBACK_MAX_CONCURRENT (1) · ENGINE_FEEDBACK_DAILY_CAP (8) ·
#                 ENGINE_FEEDBACK_WORKTREE_DIR (defaults under $TMPDIR)
```

The agent runs in a throwaway git worktree on a `feedback/<id>` branch cut from `origin/main` (never the
prod checkout, never `main`), and branch protection stops the PAT from pushing to `main` — it can only open
a draft PR for review. **Portability (Air → Pro):** everything lives in `~/.config/nostra-engine/` and derives
from `ENGINE_REPO_ROOT` / `ENGINE_STATE_DIR`, so moving machines is the usual "copy the config dir + re-clone
+ run `install-services.sh`" — this one file comes along with the rest, no rework.

### Production runs from its own tree (`nostra-prod`) — dev never touches live
The engine does **not** serve this dev checkout. Live runs from a dedicated git worktree pinned to
`main` at **`$HOME/nostra-prod`** (e.g. `/Users/admin/nostra-prod`), so feature-branch work and uncommitted
edits can never leak to the public site. The engine runs `tsx` straight from source there (so the live API = `main`),
and serves `nostra-prod/ui/dist`. Runtime state (`ui/server/.state`, gitignored) and the ops shell
scripts (`~/.nostra-ops/{deploy,watchdog}.sh`) live outside the tree so a fast-forward never disturbs them.

### How a change goes live (auto-deploy — `deploy.sh`)
**Merge a PR to `main` → it's live in ≤~2 min. No manual step.** Every 120s `deploy.sh`:
1. `git fetch`; if `origin/main` is ahead, **fast-forward only** (never resets — an unpushed local data
   commit makes it *skip*, never discard) and skips entirely if a run is mid-write;
2. acts on *what* changed: `ui/web/**` → rebuild `ui/dist` (served instantly, no restart);
   `ui/server/**` → `kickstart` the engine; a changed `package-lock` → `npm ci` first; data/docs only
   (`analyses/**`, `screener/**`, `*.md`) → nothing to rebuild;
3. logs every deploy to `~/Library/Logs/nostradamus-deploy.log`. Single-flight (mkdir lock), always
   exits 0 so launchd never marks it failed. Force one now: `bash ~/.nostra-ops/deploy.sh`.

### Self-healing watchdog (`watchdog.sh`)
`KeepAlive` only restarts a **crashed** process. The watchdog covers what it can't: a non-launchd
process squatting `:8787`, the engine being up but serving **broken content** (the blank page = HTML
returned for the `.js` bundle), an unreachable tunnel, or a **publicly-broken-but-locally-up** state.
Every 30s it checks (1) `/api/health`, (2) that the served `index-*.js` comes back as real
`application/javascript`, and (3) the public URL — capturing the HTTP code, latency, **and** the
`x-engine-status` header so it can tell a dead tunnel (code `000`/`>=520`) apart from the edge serving
*offline* while the local engine is fine (`x-engine-status: offline` or `503` → `public-offline`) apart
from a merely slow-but-working origin (logged as `SLOW`, never healed). Engine/bundle repairs fire after
**2** consecutive failures (anti-flicker); **tunnel/public failures heal on the FIRST** (re-`kickstart`
the tunnel) so the public URL recovers fast. It also kills a **stray second engine** on a non-`:8787`
port (the load-doubling failure mode). Every incident + repair is logged to
`~/Library/Logs/nostradamus-watchdog.log`. **You do nothing; it fixes itself and keeps a track.**

### Keeping the Mac awake (`caffeinate`)
`com.nostradamus.caffeinate` runs `caffeinate -i`, which holds `PreventUserIdleSystemSleep` — this is
**not** AC-gated, so the engine + tunnel stay reachable on battery as well as on AC (lid open). Trade-off:
an unplugged machine no longer idle-sleeps to save power. `-i` does **not** override clamshell (closed-lid)
sleep, so for guaranteed 24/7 keep the doer on AC. Verify with `pmset -g assertions`
(`PreventUserIdleSystemSleep` present on AC **and** battery).

### Tunnel hardening (`cloudflared-config.yml.example`)
The live tunnel config (`~/.cloudflared/config.yml`) is **operator-owned** (holds the tunnel UUID +
credentials) and the installer never touches it. `scripts/ops/cloudflared-config.yml.example` carries the
recommended `originRequest` block (connect/tls timeouts, TCP keep-alive, a `keepAliveTimeout` longer than
the engine's 15s SSE ping so idle streams aren't reaped, `disableChunkedEncoding: false` for SSE). Copy
that block into your config and `launchctl kickstart -k gui/$(id -u)/com.nostradamus.tunnel` to apply.

The source-of-truth plists + scripts live here (`scripts/ops/*`). Installed copies: plists in
`~/Library/LaunchAgents/`, the `deploy.sh`/`watchdog.sh` runtime copies in `~/.nostra-ops/`. **First-time
setup** creates the prod worktree, then installs the agents:

```
# one-time: production checkout pinned to main (decoupled from your dev tree)
git worktree add -B main "$HOME/nostra-prod" origin/main
(cd "$HOME/nostra-prod/ui/server" && npm ci)
(cd "$HOME/nostra-prod/ui/web" && npm ci && npm run build)
# migrate the GITIGNORED runtime dirs the fresh worktree doesn't get from git (analyses/ + screener/ are
# tracked, so they come with the checkout; .state/ and data/ are gitignored and must be copied from your
# other machine or a Google Drive mirror):
rsync -a <source>/ui/server/.state/ "$HOME/nostra-prod/ui/server/.state/"  # enrichment/news cache
rsync -a <source>/data/             "$HOME/nostra-prod/data/"              # research data pool (uploads, extracts)

# install / refresh the launchd agents (idempotent, no sudo; safe to re-run). --role doer on the always-on
# host, --role admin on a secondary machine. Set NEWS_ARCHIVE_DIR to your Google Drive mount to enable the
# cloud news archive (leave unset to skip it).
NEWS_ARCHIVE_DIR="$HOME/Library/CloudStorage/GoogleDrive-<you>/My Drive/equity-research-data/news-archive" \
  bash scripts/ops/install-services.sh --role doer
```

## Operating rules (so it never blanks or dies)

1. **Never run the server manually** (`npm run dev` / `npm start` in a terminal). launchd already owns
   `:8787`; a second server collides on the port (`EADDRINUSE`) and one of them fails. If you must
   debug locally, `launchctl bootout gui/$(id -u)/com.nostradamus.engine` first, and re-install after.
2. **To deploy a change**: just **merge it to `main`** — `com.nostradamus.deploy` rebuilds prod within
   ≤~2 min (see "How a change goes live"). Building `ui/dist` in *this dev tree* no longer affects the
   live site. No engine restart is needed for web changes: the server reads `index.html` **fresh per
   request**, so new asset hashes are served immediately (the fix for the blank-page-after-rebuild bug —
   the server used to cache `index.html` at startup and desync from the on-disk hashes).
3. **A missing/stale asset 404s loudly** — the not-found handler never returns `index.html` for a
   `.js`/`.css`/`/api` path, so a bad deploy fails visibly instead of silently blanking the SPA.

## Quick checks

```
launchctl list | grep nostradamus                 # all agents (a doer also shows tunnel + hk-*)
curl -s http://127.0.0.1:8787/api/health          # {"ok":true,"repoRoot":".../nostra-prod"}
curl -s https://app.nostra-demus.com/api/health   # public path (doer only)
tail -f ~/Library/Logs/nostradamus-deploy.log     # auto-deploy log (DEPLOY/DONE lines)
tail -f ~/Library/Logs/nostradamus-watchdog.log   # self-heal log
tail -f ~/Library/Logs/nostradamus-housekeeping.log   # daily housekeeping (RUN/DONE/SKIP lines)
bash ~/.nostra-ops/housekeeping.sh /research:track all  # force one housekeeping run by hand
```

## Reboot behavior
LaunchAgents start at **user login** (not pre-login boot). On a personal Mac that stays logged in /
auto-logs-in, that's effectively always-on. For true headless-boot-before-login you'd convert these to
root `LaunchDaemon`s in `/Library/LaunchDaemons/` (needs sudo) — not done here by design.
