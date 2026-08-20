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
| `com.nostradamus.connectors` | `run_connectors.py` every 15m — due-aware staged retrievals and connector health | **doer** | ✅ `RunAtLoad` | — |
| `com.nostradamus.news-ingester` | `npm run ingest:once` every 15m (opt-in: set `GROQ_API_KEY`) | **doer** | ✅ `RunAtLoad` | — |
| `com.nostradamus.hk-review` | `housekeeping.sh /research:review-decisions due` daily 06:10 (DUE-gated) | **doer** | — | — |
| `com.nostradamus.hk-track` | `housekeeping.sh /research:track all` daily 06:30 | **doer** | — | — |
| `com.nostradamus.hk-sweep` | `housekeeping.sh /screener:sweep` daily 06:50 | **doer** | — | — |
| `com.nostradamus.hk-size` | `housekeeping.sh /research:size all` daily 07:10 | **doer** | — | — |
| `com.nostradamus.hk-calibrate` | `housekeeping.sh /research:calibrate all` monthly (1st, 07:40) | **doer** | — | — |

### Roles — one serving doer, one permanent connector writer, N admins
Exactly **one** machine is the **serving doer**: it owns the public tunnel and runs the autonomous daily jobs
(news + the `hk-*` housekeeping timers). Install it with the default role:

```
bash scripts/ops/install-services.sh                 # role=doer (the always-on host)
```

Connectors are stricter: they remain pinned to the dedicated Mac Pro even if UI/tunnel failover moves serving
to another machine. On the Mac Pro only, mount the pool, make `data` resolve to it, then run the first install
with the exact local hostname. These values become private, immutable machine identities; later repairs read
them automatically. A custom provider directory must be an absolute owner-only directory.

```
MAC_PRO_HOST="$(hostname)"
NOSTRA_CONNECTOR_WRITER_HOST="$MAC_PRO_HOST" \
NOSTRA_POOL="/absolute/path/to/equity-research-data" \
NOSTRA_ENGINE_CONFIG_DIR="$HOME/.config/nostra-engine" \
  bash scripts/ops/install-services.sh --role doer
```

The identities live at `~/.nostra-ops/connector-writer-host`, `pool-root`, and `connector-config-root`
(mode `0600`; parent mode `0700`). Do not edit them to move the writer. Re-provision deliberately instead.
Full installs fail closed if the configured writer host is not this Mac. A failover host installs the cockpit
and tunnel with connectors explicitly excluded and removes any stale connector job before becoming doer.

Any **other** machine (a laptop you also use as a full admin) installs with `--role admin` — it gets the
local engine, auto-deploy, watchdog and caffeinate, but **NOT** the tunnel, news, or timers, so the two
machines never fight over the tunnel or double-run the paid jobs. Re-running with `--role admin` also
**removes** any doer-only agents a machine previously had (a clean doer→admin demotion):

```
bash scripts/ops/install-services.sh --role admin    # secondary machine: engine only, no tunnel/timers
```

A full install records the non-secret machine role in `~/.nostra-ops/role`: admin demotion intent is stamped
before doer-only removal, while doer promotion is stamped only after every install succeeds. An explicit
`admin` marker therefore wins even if an old tunnel plist remains after an interrupted demotion; only
pre-marker machines infer the legacy doer role from a safe installed tunnel plist. Deploy uses that truth to
repair a missing connector timer on a doer without adding it to an admin. The narrow recovery command is safe
and idempotent:

```
bash scripts/ops/install-services.sh --role doer --only connectors
```

It installs only `com.nostradamus.connectors`; it does not copy or replace the currently executing
`~/.nostra-ops/deploy.sh`, `watchdog.sh`, or `housekeeping.sh`. Full installs publish those runtime scripts by
atomic rename so an executing script can never be truncated in place. Unknown installer options fail closed.
Connector install/removal and watchdog recovery share retained kernel leases
`~/.nostra-ops/connector-autonomy.lock`; role transitions that also take the deploy lease always acquire
`.deploy.flock`, then the repository mutation lease, then this autonomy lease. Connector-only repair re-checks installed doer truth while
holding the lease, so it cannot undo a concurrent admin/failover stand-down.

### Housekeeping timers (`housekeeping.sh`)
The five `hk-*` agents run one headless Claude slash command each, from the prod worktree, under a per-run
USD cap. `track` / `size` / `calibrate` are pure-local aggregates (near-free, seconds); `sweep` and
`review-decisions` make at most one web pass. `review-decisions` is **DUE-gated** — the wrapper runs
`.claude/hooks/review_due.py` first and skips entirely when nothing is due, so it costs nothing on quiet days.
Tune the cap by adding `HOUSEKEEPING_BUDGET_USD` (default `8`) to any `hk-*` plist's `EnvironmentVariables`
(also `HOUSEKEEPING_MODEL`, `HOUSEKEEPING_MAX_TURNS`, `HOUSEKEEPING_TIMEOUT_SEC`). All housekeeping runs log
to `~/Library/Logs/nostradamus-housekeeping.log`. New full research runs are **never** scheduled — they stay
human-initiated.

**Connector repair boundary.** The fifteen-minute connector sweep only fetches a series when its manifest release
clock is due, through the staged publication
contract in `frameworks/EXTERNAL_DATA.md`; it does not run a coding agent. Automatic connector build and
repair agents are hard-disabled until the runtime has a separately reviewed OS/container/VM egress sandbox.
The health and repair ledgers still identify broken feeds. Repair them through the normal human-authored
`codex/...` branch → PR → CI/review workflow, then require a real post-merge refetch before the repair is
marked verified. An environment flag or DNS preflight is not accepted as isolation.

Every full automatic sweep (not `--dry-run`, `--only`, or manual ingest) also atomically updates the
non-secret `data/_connectors/runner_status.json`: start time, last row progress, completion/failure state,
host/PID, interval, and row/manifest counts. It never stores URLs, exception text, or credentials. This is an
operational heartbeat, not evidence; a status write failure is logged and never blocks or rolls back connector
publication.

The first deploy after the connector-v2 upgrade atomically reconciles the already-installed connector
LaunchAgent: it changes the scheduler to fifteen minutes, securely moves every historical `CONNECTOR_*` value
into `providers.env` when that name is absent (and refuses a conflict), removes the migrated LaunchAgent entry,
adds the `providers_env` credential-source lock, inserts Python isolated mode before the runner, validates only
the exact known old/new executable shapes, and re-bootstrap/rechecks the
service. The deploy log records activation without printing secret values. A routine installer rerun performs
the same secret removal. Verify with `PlistBuddy -c 'Print :StartInterval'` (must be `900`) and confirm that
`Print :ProgramArguments` contains `/usr/bin/env`, `python3`, `-I`, then the absolute `run_connectors.py`
path in that order. Also confirm that `Print :EnvironmentVariables` contains no key beginning `CONNECTOR_`;
connector credentials belong only in
`~/.config/nostra-engine/providers.env` (file mode `0600`, containing directory mode `0700`). The installer
creates/tightens those modes and refuses symlinked or foreign-owned paths. To prepare them manually:

```
mkdir -p "$HOME/.config/nostra-engine"
chmod 700 "$HOME/.config/nostra-engine"
touch "$HOME/.config/nostra-engine/providers.env"
chmod 600 "$HOME/.config/nostra-engine/providers.env"
```

### Google Drive uploads and watchlist thesis attachments (`drive.env`)

Pool uploads and watchlist thesis PDFs are **off until a Drive credential exists** — the cockpit says so
rather than offering a drop zone that would fail. The engine reads them from `drive.env` in the same
config dir, loaded by `ui/server/src/load-env.ts` and scrubbed from child research runs (only the cockpit
server serves the upload routes).

```
touch "$HOME/.config/nostra-engine/drive.env"
chmod 600 "$HOME/.config/nostra-engine/drive.env"
```

```sh
# WHERE files are written — the Drive folder id (the last path segment of the folder's URL)
GDRIVE_DATA_FOLDER_ID=1AbCdEf...

# ONE credential. Either a service account — note the variable is the STANDARD Google one,
# GOOGLE_APPLICATION_CREDENTIALS, not a GDRIVE_-prefixed name (ui/server/src/config.ts GDRIVE.saKeyFile):
GOOGLE_APPLICATION_CREDENTIALS=/Users/you/.config/nostra-engine/drive-sa.json
# GDRIVE_SA_JSON holds the same key INLINE instead, but this loader reads the file line by line, so a
# pasted multi-line JSON blob would be truncated at its first newline and then fail to parse at runtime.
# Prefer the file path above; if you must inline it, collapse the JSON to a single line first.
# A service account has NO storage quota of its own, so it cannot write into a personal My Drive
# folder. It MUST write into a Shared Drive it is a member of — add the SA's client_email as a
# Content manager on that drive, and set:
GDRIVE_SHARED_DRIVE_ID=0AbCdEf...

# …or a real account's OAuth (files count against THAT account's quota; no Shared Drive needed):
# GDRIVE_OAUTH_CLIENT_ID=...
# GDRIVE_OAUTH_CLIENT_SECRET=...
# GDRIVE_OAUTH_REFRESH_TOKEN=...

# Optional — the child folder watchlist theses go in, under the data folder. The lookup is an EXACT,
# case-sensitive Drive name query, so set this if your folder is not literally named WATCHLIST;
# otherwise the engine creates its own beside yours and you will never notice.
# GDRIVE_WATCHLIST_FOLDER=watchlist-thesis-manual
```

`GDRIVE_ENABLED` is true only when the folder id AND one complete credential are present
(`ui/server/src/config.ts`), so a partial block leaves the feature off rather than half-working. Restart
the engine after editing; confirm with `curl -s localhost:8787/api/tickers | grep -o '"driveEnabled":[a-z]*'`.

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
**2** consecutive failures (anti-flicker); the first **tunnel/public failure heals immediately** by
re-`kickstart`ing the tunnel. The watchdog then persists a **300-second convergence cooldown**, including
across an intervening healthy check, and logs `SUPPRESS HEAL` instead of repeatedly restarting a tunnel
whose old connector is still draining. A failed restart command does not start the cooldown. Override the
window with `WATCHDOG_TUNNEL_HEAL_COOLDOWN_SECONDS` (`0` disables suppression). It also kills a **stray
second engine** on a non-`:8787` port (the load-doubling failure mode). Every incident + repair is logged to
`~/Library/Logs/nostradamus-watchdog.log`. **You do nothing; it fixes itself and keeps a track.**

On the configured Mac Pro, the watchdog runs an independent connector supervisor. It proves, in order: exact
writer host and role, the stable pool/config identities, the complete 15-minute plist contract, the loaded
launchd job, then a fresh non-empty v2 sweep from the current deployed commit. Missing/unloaded first installs
repair immediately. A single failed/invalid/stale heartbeat only shows `Starting`; disruptive repair requires
the same failure on a second tick or persistence for one cadence. Admin, wrong-host, foreign-heartbeat, Drive,
and unsafe states first fence and prove the local scheduler stopped. The Data Library then shows `Online`,
`Checking`, `Starting`, `Paused — drive`, `Disabled — admin`, `Another Mac is writer`, or `Blocked — unsafe`;
it never reports a stopped or unproven job as Online.

After the first reviewed merge, acceptance is: the Data Library reaches `Checking`, then `Online` only after a
completed sweep with at least one processed row; `connector-supervisor.json` stays fresh; the displayed host is
the configured Mac Pro; and the desired/deployed/current commits match. Run four scheduled shadow sweeps and
require zero provenance, schema, arithmetic, or reproducibility failures before treating the service as live.

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
# Restore the gitignored runtime state the fresh worktree does not get from git (analyses/ + screener/ are
# tracked). The data pool is shared through Drive: wait until Drive is signed in and the pool directory is
# present, then create the canonical symlink. Never rsync/copy the pool into a real prod data/ directory.
rsync -a <source>/ui/server/.state/ "$HOME/nostra-prod/ui/server/.state/"  # enrichment/news cache
NOSTRA_POOL="$HOME/Library/CloudStorage/GoogleDrive-<you>/My Drive/equity-research-data"
test -d "$NOSTRA_POOL"                                                    # must succeed before continuing
ln -s "$NOSTRA_POOL" "$HOME/nostra-prod/data"                            # uploads/extracts shared via Drive

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
