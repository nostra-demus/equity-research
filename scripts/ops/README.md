# Keeping `app.nostra-demus.com` alive — forever

> **Dedicated Mac Pro / IBKR Paper:** before connecting to the remote Mac, changing TWS, or
> diagnosing paper execution, read [`MAC_PRO_RUNBOOK.md`](MAC_PRO_RUNBOOK.md). It records the proven
> Tailscale/Screen Sharing route, private-secret boundary, bridge checks, IB Gateway constraint, and
> mistakes that must not be repeated.

The public cockpit URL is a **Cloudflare Tunnel → local engine server** (Fastify on `127.0.0.1:8787`,
fronted by Cloudflare Access). macOS `launchd` user agents keep it up — **and keep it on `main`** — with
**no human in the loop**:

| Agent | Runs | Role | Auto-start at login | Auto-restart |
|---|---|---|---|---|
| `com.nostradamus.engine` | `npm start` (`tsx src/server.ts`) in **`nostra-prod/ui/server`** | base | ✅ `RunAtLoad` | ✅ `KeepAlive` |
| `com.nostradamus.omniroute` | pinned OmniRoute **3.8.49** on **`127.0.0.1:20128`** | managed base | ✅ `RunAtLoad` | ✅ `KeepAlive` |
| `com.nostradamus.deploy` | `deploy.sh` every 120s — **auto-deploys `main`** | base | ✅ `RunAtLoad` | — |
| `com.nostradamus.watchdog` | `watchdog.sh` every 30s | base | ✅ `RunAtLoad` | — (self-heals the others) |
| `com.nostradamus.caffeinate` | `caffeinate -i` (no idle sleep **on AC AND battery**) | base | ✅ `RunAtLoad` | ✅ `KeepAlive` |
| `com.nostradamus.tunnel` | `cloudflared tunnel run nostradamus-engine` | **doer** | ✅ `RunAtLoad` | ✅ `KeepAlive` |
| `com.nostradamus.news-archive` | `news-archive.sh` every 3h | **doer** | ✅ `RunAtLoad` | — |
| `com.nostradamus.external-ingest` | `ingest_external.py` every 10m — routes `data/EXTERNAL-INBOX/` drops into per-ticker pools (`frameworks/EXTERNAL_DATA.md`) | **doer** | ✅ `RunAtLoad` | — |
| `com.nostradamus.connectors` | `run_connectors.py` every 15m — due-aware staged retrievals and connector health | **doer** | ✅ `RunAtLoad` | — |
| `com.nostradamus.news-ingester` | `npm run ingest:once` every 15m (opt-in: set `GROQ_API_KEY`) | **doer** | ✅ `RunAtLoad` | — |
| `com.nostradamus.hk-review` | **retired** — tracked review-dispatch owns due reviews | — | — | — |
| `com.nostradamus.hk-track` | **retired** — run manually through the tracked cockpit | — | — | — |
| `com.nostradamus.hk-sweep` | **retired** — run manually through the tracked cockpit | — | — | — |
| `com.nostradamus.hk-size` | **retired** — no single inherited provider; run manually | — | — | — |
| `com.nostradamus.hk-calibrate-daily` | `calibrate-local.sh daily` daily 07:25 | **doer** | — | — |
| `com.nostradamus.hk-calibrate` | `calibrate-local.sh monthly` final fallback (1st, 07:40) | **doer** | — | — |

### Roles — one serving doer, one permanent connector writer, N admins
Exactly **one** machine is the **serving doer**: it owns the public tunnel and runs autonomous news,
tracked feedback loops, and deterministic calibration fallbacks. Install it with the default role:

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

OmniRoute is a local sidecar on **both** roles because each engine must retain its own fallback. Normal
production deploys reconcile it without rerunning the full installer: they provision exact
`omniroute@3.8.49` when the executable is absent or reports any other version, validate the executable
identity and private installed plist, then start only this service. The installer itself never guesses a
binary path; a manual/full invocation still skips an absent/wrong executable and unloads/removes a stale job,
preventing a launchd failure loop. These are recovery/inspection commands, not normal provisioning steps:

```
bash scripts/ops/install-services.sh --role admin --only omniroute   # use this host's real role
launchctl print gui/$(id -u)/com.nostradamus.omniroute
```

The service runs in the foreground under launchd, suppresses browser/tray launch, and explicitly sets
`OMNIROUTE_SERVER_HOST=127.0.0.1`; do not expose this model gateway on a LAN/public interface. The production
default is the scorer-proven keyless `auto/coding:free` route. It can skip a rate-limited member of
OmniRoute's compatible free coding pool and use the next one in the same request. Deploy atomically migrates
only the old managed `oc/hy3-free` default; a different operator-set `NEWS_OMNIROUTE_MODEL` remains untouched.
An operator may explicitly set that variable to a separately configured aggregate combo, but deploy enables
only after that exact override passes the same complete 12-row scorer smoke.
Activation is fail-closed. Deploy first writes `NEWS_OMNIROUTE_ENABLED=0` through an atomic owner-only
`providers.env` updater. It requires the launchd-owned listener and exact `GET /healthz` response, provisions
one database-backed client key with OmniRoute's `no_log` policy, and keeps that key only in the owner-only
`providers.env`. The installed plist has an exact environment allowlist, so reinstall cannot carry provider
keys into the sidecar. Deploy then checks the authenticated `127.0.0.1:20128/v1/models` catalog and requires
**two consecutive 12-headline** requests through the exact production descriptor, prompt builder, HTTP
adapter, response parser, and complete-index guard. It also proves the resulting call-log rows contain no
request, response, or pipeline body artifacts. Only that pass-pass result atomically flips the flag to `1`;
deploy restarts the engine and requires `/api/health` before stamping the fingerprint active. Later 120-second
ticks cheaply recheck exact binary/plist/config/key identity, listener ancestry, and `/healthz`. The scorer
proof expires after six hours (configurable between one hour and one day), at which point the route is disabled
and the same two-pass proof must renew it. Failures (including 429 or pass-fail intermittency) remain disabled
and back off for 15 minutes instead of retrying the smoke every 120s.
The same sanitized production-contract smoke can be run manually:

```
bash scripts/ops/omniroute-smoke.sh
```

The manual command performs one diagnostic call and success prints
`{"ok":true,...,"rows":12,"expectedRows":12}`. Managed activation still requires deploy's two consecutive
passes. Do not manually enable the flag after a failure: the deploy transaction owns key/privacy proof,
enable/restart/health ordering, and never prints provider secrets.
On the first rollout, the already-running deploy watcher atomically self-updates from the merge; its next
120-second tick performs OmniRoute reconciliation, so neither role needs a full installer rerun. If that
user cannot write npm's global prefix, or a manually started process already owns port 20128, the provider
stays off and retries after backoff. Fix the npm-prefix permission or stop the manual daemon; do not bypass
the flag transaction.

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

### Housekeeping timers (`housekeeping.sh`, `calibrate-local.sh`)
The former model-backed `hk-review`, `hk-track`, `hk-sweep`, and `hk-size` launchd agents are retired and
removed by a full service install. They chose Claude outside the tracked launcher, so they could not inherit
the source decision's provider/profile or receive admission, quota-pause, cancellation and supervisor-owned
publication guarantees. `housekeeping.sh` is now only a no-spend compatibility shim for stale installations.
Due reviews run through the tracked review-dispatch loop. Track, sweep, and size remain explicit cockpit
actions until each has an unambiguous source provider to inherit; no user-global automation default is used.

Calibration is different: `calibrate-local.sh` invokes the equity core and every calibrator declared by a
discovered `SWARM.md` directly, so rebuilding scoreboards consumes neither Claude nor Codex quota. A successful
tracked outcome run triggers its own calibrator immediately; `hk-calibrate-daily` is the daily fallback and the
monthly timer is the final fallback. All paths share one local lock and publish only exact declared outputs.

**Codex rollout switch.** Codex stays fail-closed unless the operator writes `ENGINE_CODEX_ENABLED=1` in
`~/.config/nostra-engine/providers.env` (mode 600) and restarts the engine. Keep it absent/off until the live
canary and provider-parity release gates pass. The production plist deliberately does not hard-enable it.
Use the owner-only atomic setter for both rollout switches; never source or hand-edit the mixed-secret file:

```
python3 scripts/ops/set-private-env.py set --file "$HOME/.config/nostra-engine/providers.env" --key ENGINE_PROVIDER_PARITY_ENABLED --value 1
# Only after the parity release gate passes:
python3 scripts/ops/set-private-env.py set --file "$HOME/.config/nostra-engine/providers.env" --key ENGINE_CODEX_ENABLED --value 1
```

**Claude tracked-run sandbox proof.** Availability and launch preflight automatically run the pinned official
Anthropic sandbox runtime with no model call and no Claude quota spend. The proof must show current-run-only
writes, exact repository/data reads, protected STATE_DIR/Git/auth reads+writes, blocked nested Claude execution,
no public or loopback TCP, and access to only the per-run publication Unix socket. If the installed host cannot
enforce that boundary, Claude is shown unavailable and the tracked launch fails closed; there is no manual
"verified" flag which can assert a proof the engine did not observe.

The unattended service authenticates through Anthropic's supported `claude setup-token` subscription path:
`CLAUDE_CODE_OAUTH_TOKEN` lives only in the owner-readable `providers.env`. The tracked parent CLI receives it
with `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1`, so Bash tools, hooks, and MCP subprocesses cannot read the credential.
`ANTHROPIC_API_KEY` and `ANTHROPIC_AUTH_TOKEN` are always removed. An interactive first-party Claude Max login
remains accepted when the macOS Keychain is available, but unattended operation never depends on an unlocked
GUI session and can never fall through to API-key billing. The no-model sandbox proof mirrors that scrubbed
nested-tool environment while separately proving the parent subscription authentication.

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
(`com.nostradamus.engine.plist`) sets the closed-loop flags on the always-on server:
- `CONVICTION_LOOP_ENABLED=1` — the screener conviction reconciler (`conviction-dispatch.ts`)
  auto-fires `/screener:validate` on due checkpoints (+ a wire accelerant), so locked theses actually
  re-rate instead of sitting `scheduled`. Bounded by `CONVICTION_MAX_CONCURRENT` (2), `CONVICTION_DAILY_CAP`
  (12), `CONVICTION_TICK_SEC` (600).
- `REVIEW_DISPATCH_ENABLED=1` — the research review tick (`review-dispatch.ts`) fires due
  30/90/180/365d decision reviews from the server, so the outcome-measurement layer survives the doer
  Mac being asleep (the first three 30d reviews slipped 10-12 days on the launchd-only path). It reuses
  `listAllCalls()`'s DUE timeline (same `review_due` rule; honors the §4a supersession layer). Bounded by
  `REVIEW_MAX_CONCURRENT` (1), `REVIEW_DAILY_CAP` (8), `REVIEW_TICK_SEC` (3600). The old direct-model
  `hk-review` timer is removed, not a fallback. **Reinstall the service to pick the flags up**
  (`scripts/ops/install-services.sh`, then `launchctl kickstart -k gui/$UID/com.nostradamus.engine`).
- `BRIDGE_MODE` — the company-news bridge (#359, `bridge-scheduler.ts`). Unlike the two flags above,
  this one IS role-scoped by the installer (not just hardcoded in the plist): a fresh `--role doer`
  install renders `batch` (routes material wire events into covered subjects' pools every 12h; paid
  re-runs stay behind a click); every `--role admin` install renders `off`, always — an admin machine
  never gets autonomous bridge routing, matching the doer-only "no duplicate autonomy" split the other
  agents already get. An operator's own `off`/`stream` choice on an existing doer machine is carried
  forward across reinstall (same shape as `NEWS_ARCHIVE_DIR` below), never silently reset to `batch`.
  See `install-services.sh`'s `BRIDGE_MODE_VALUE` computation.

**Auth for the doer (required).** The cockpit launches the selected provider headlessly, so its saved login
or provider credential must be reachable by the launchd GUI agent. Provider configuration lives in
`~/.config/nostra-engine/providers.env` (mode 600, outside the repo); the retired housekeeping shim does not
source it or start a model. `NEWS_ARCHIVE_DIR` is auto-carried from the existing install on a re-run and is
rendered into both the archive writer and the engine reader. You do not have to re-pass it every time, and
historical news reads continue to fall back to Drive after the 30-day local working set is pruned.

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
and serves `nostra-prod/ui/dist`. Runtime state (`ui/server/.state`, gitignored) and every credential-bearing
release helper (`~/.nostra-ops/{deploy,deploy-authorization,gh-app-token,watchdog}.*`) live outside the tree.
The watcher never executes a helper from the production checkout before CI proof or the dirty-tree gate.

### How a change goes live (auto-deploy — `deploy.sh`)
**After an authorized human merges a PR, its exact `main` push must pass all five required CI jobs; then it
receives priority on the next ≤~2 min deploy tick. No later manual step.** The watcher mints a short-lived
GitHub App token, reads the exact Actions run, checks `ui-server`, `eval-contracts`, `tools-tests`, `ui-web`,
and `edge` itself, and binds the successful workflow head plus the complete non-data program digest into a
one-shot local receipt. A PR badge, an earlier PR workflow, or four of five jobs cannot release. Pure data-only
pushes do not run release CI and cannot cancel it. Every 120s `deploy.sh` publishes writer intent only after
that proof. An already-running
research/scanner lifecycle finishes safely, but no new provider lifecycle is admitted ahead of the pending
deployment; this bounds convergence to the current lifecycle plus one deploy tick instead of letting the
one-minute backlog drain starve releases indefinitely. The deployer then:
1. `git fetch`; if `origin/main` is ahead, **fast-forward only** (never resets — an unpushed local data
   commit makes it *skip*, never discard). The launchd interval is the default merge debounce; there is no
   additional quiet-period delay unless an operator explicitly configures one;
2. acts on *what* changed: `ui/web/**` → rebuild `ui/dist` (served instantly, no restart);
   `ui/server/**` → `kickstart` the engine; a changed `package-lock` → `npm ci` first; data/docs only
   (`analyses/**`, `screener/**`, `*.md`) → nothing to rebuild;
3. records every authorized deploy or rollback in the owner-only, hash-chained
   `~/.nostra-ops/deploy-audit/events.jsonl`. A separate owner-only
   `events.jsonl.anchor.json` binds its exact byte length, event count, inode, and tip hash, so deleting a
   valid trailing event is detected rather than accepted as a shorter valid chain. Operations are logged to
   `~/Library/Logs/nostradamus-deploy.log`. Single-flight (kernel lock), always
   exits 0 so launchd never marks it failed. Force one now: `bash ~/.nostra-ops/deploy.sh`.

If the engine becomes healthy but the audit append fails, the watcher advances `.deployed.sha` to the code
that is actually live, keeps the one-shot receipt, and writes `~/.nostra-ops/.deploy.audit-pending`. Later
ticks retry only that exact audit/consume transaction—never `npm`, a rebuild, or a restart—and do not pause
research admissions. A later code release remains blocked until the ledger is repaired. Do not delete or
recreate the ledger/anchor pair. Restore both from the owner backup or inspect and repair them explicitly;
the deploy log now prints the precise safe helper error instead of collapsing every failure into “CI red”.

The first rollout is intentionally different: the installed watcher still understands only explicit manual
receipts, so it cannot authorize its own upgrade. Grant the GitHub App `Actions: read`, then perform one
separately-authorized manual bootstrap deployment **and re-run `install-services.sh` from that reviewed
checkout** so `deploy.sh`, `deploy-authorization.py`, and `gh-app-token.sh` are atomically installed under
`~/.nostra-ops`. Verify those installed paths and the audit ledger/anchor before relying on automatic
releases. This bootstrap authority never carries forward to another manual operation.

The five release job display names are part of the installed verifier's security policy. Renaming one fails
closed; it cannot silently weaken the gate or self-authorize its own policy change. Such a rename therefore
requires the same explicit bootstrap/re-install procedure, after which ordinary green merges are automatic.

The machine has exactly one deployment owner. When `com.nostradamus.deploy` is loaded, companion jobs such
as `com.nostra.ibkr-paper-bridge` never call `deploy.sh` themselves. The paper bridge asks the canonical
LaunchAgent to run, then refuses to trade until both the checkout and deployed marker match a fresh remote-main
observation. A known dirty-code blocker is checked before writer intent is published, so a refused deploy neither
pauses new runs nor claims the engine is updating.

#### The one thing auto-deploy CANNOT recover from: a rewritten `main`

`deploy.sh` is fast-forward-only by design — it must never discard an unpushed engine data commit. That
safety has one failure mode with no self-healing path: **if `main`'s history is ever rewritten (force-push,
filter-branch, squash-rebase of published history), every existing checkout is orphaned.** Its `HEAD` and
its cached `origin/main` both point at commits that no longer exist upstream, so a fast-forward can never
succeed again. The watcher parks itself and stays parked — correctly, but silently and forever.

**The symptom is an ABSENCE, which is why it hides.** A healthy log gets a line every cycle; a jammed one
gets `SKIP …` every cycle. An orphaned one logs the diverged-history skip **once** and then goes quiet, so
the log simply stops. Nothing alerts, the cockpit keeps serving, and the machine silently runs whatever
code it had on the day of the rewrite. Observed 2026-08-04 → 2026-08-20 (16 days) on the standby node:

```
2026-08-04 08:00:35 SKIP HEAD not an ancestor of origin/main (unpushed local commit?) local=de5d1317a remote=5d5c738fe
```

Note the message blames "unpushed local commit?" — a guess that is *wrong* in this case and sends you
looking for local work to rescue. The real tell is that **both** SHAs are unresolvable upstream
(`git cat-file -t <sha>` fails for each). One missing SHA is a local commit; two is a rewritten history.

**Check any node in one line** (the deploy log's last timestamp being days old is the giveaway):

```
tail -3 ~/Library/Logs/nostradamus-deploy.log        # a stale last line = parked, not idle
```

**Recovery — must be run by hand on EVERY checkout (doer, admin, and standby alike).** Nothing propagates
this; each machine is independently orphaned:

```
cd ~/nostra-prod
git branch backup-$(date +%Y%m%d)                    # keep the orphaned tip; it costs nothing
git fetch origin main && git reset --hard origin/main
```

Before resetting, verify nothing is lost by content rather than by SHA — after a rewrite the old SHAs are
gone, so `git log origin/main..HEAD` compares against a **stale** cached ref and under-reports (it printed
"nothing" on a checkout that in fact held three upstream-absent commits). Confirm the *files* exist on the
rewritten `main` (`git ls-tree -r --name-only origin/main | grep <file>`) — engine data commits are usually
already there under new SHAs, because `commit-run.sh` rebases onto `origin/main` and pushes independently
of this watcher. Then `kickstart` the engine: a code update that is never restarted into is not deployed.

**Prefer not to rewrite published history at all.** If it is unavoidable, treat re-pointing every node as
part of the operation, not as follow-up — and remember an in-flight PR whose base was rewritten cannot be
merged either; its commits have to be replayed onto the new base.

### Self-healing watchdog (`watchdog.sh`)
`KeepAlive` only restarts a **crashed** process. The watchdog covers what it can't: a non-launchd
process squatting `:8787`, the engine being up but serving **broken content** (the blank page = HTML
returned for the `.js` bundle), an unreachable tunnel, or a **publicly-broken-but-locally-up** state.
Every 30s it checks (1) `/api/health`, (2) that the served JavaScript entry comes back as real
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

Every three minutes it also reads the machine verdict embedded in `/api/news/diagnostics`. That verdict is
derived from the scanner's existing cycle receipts, saved queue, provider routing state, and fixed-hour flow;
the watchdog never makes a duplicate provider call. It records stale/missing cycles, unreadable queue or cycle
history, actual unscored loss, dangerous backlog pressure, measured capacity shortfall, standing provider
faults, and routes that have not succeeded in seven days. A scheduler-stale or unreachable-diagnostics fault
is checked twice and may restart the engine, with a separate 15-minute cooldown. Provider allowance, key,
model, storage, and capacity faults are logged with their real remedy and never cause a useless restart.
Override the cadence with `WATCHDOG_SCANNER_HEALTH_INTERVAL_SECONDS` and the restart cooldown with
`WATCHDOG_SCANNER_HEAL_COOLDOWN_SECONDS`.

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

### News queue storage and Drive recovery

The live queue is `ui/server/.state/news-queue.sqlite` on the doer Mac. SQLite performs all queue
transactions locally; Google Drive does not run or lock the database. The older
`news-deferred*.json` files remain compatibility projections during rollout, but they are no longer the
source of truth and their hot-window cap is not a data cap.

Every archive run uses SQLite's online backup API, verifies the snapshot, compresses it, and writes both
`YYYY-MM-DD_news-queue.sqlite.gz` and `news-queue-latest.sqlite.gz` to `NEWS_ARCHIVE_DIR`, each with a
SHA-256 sidecar. It never copies the live WAL file directly. Raw firehose shards remain the permanent,
uncapped Drive record of completed items; retired-unscored items keep their complete payload and reason in
the SQLite snapshots.

For a restore, stop the engine first, verify the `.sha256` sidecar, decompress the chosen snapshot to a
temporary local path, and run `PRAGMA quick_check`. Move the old database, its `-wal` and `-shm` sidecars,
and every compatibility journal into a separate rollback directory before installing the snapshot. Never
leave newer sidecars or journals beside an older restored database: SQLite could replay newer WAL state,
while startup could re-import journal rows whose completion tombstones exist only in the displaced database.

```bash
set -euo pipefail
launchctl bootout "gui/$(id -u)/com.nostradamus.engine" 2>/dev/null || true
QUEUE_STATE="$HOME/nostra-prod/ui/server/.state"
QUEUE_BACKUP="${NEWS_ARCHIVE_DIR:?set NEWS_ARCHIVE_DIR}/news-queue-latest.sqlite.gz"
RESTORE_WORK="$(mktemp -d)"
(cd "$(dirname "$QUEUE_BACKUP")" && shasum -a 256 -c "$(basename "$QUEUE_BACKUP").sha256")
gzip -dc "$QUEUE_BACKUP" > "$RESTORE_WORK/news-queue.sqlite"
test "$(sqlite3 "$RESTORE_WORK/news-queue.sqlite" 'PRAGMA quick_check;')" = "ok"
QUEUE_ROLLBACK="$QUEUE_STATE/restore-rollback-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$QUEUE_ROLLBACK"
for name in \
  news-queue.sqlite news-queue.sqlite-wal news-queue.sqlite-shm \
  news-deferred.json news-deferred-pending.json \
  news-scored-checkpoints.ndjson news-input-overflow.json; do
  old="$QUEUE_STATE/$name"
  test ! -e "$old" || mv "$old" "$QUEUE_ROLLBACK/"
done
mv "$RESTORE_WORK/news-queue.sqlite" "$QUEUE_STATE/news-queue.sqlite"
chmod 600 "$QUEUE_STATE/news-queue.sqlite"
launchctl bootstrap "gui/$(id -u)" "$HOME/Library/LaunchAgents/com.nostradamus.engine.plist"
```

Keep the rollback directory until the engine has restarted and the queue count has been checked.

## Operating rules (so it never blanks or dies)

1. **Never run the server manually** (`npm run dev` / `npm start` in a terminal). launchd already owns
   `:8787`; a second server collides on the port (`EADDRINUSE`) and one of them fails. If you must
   debug locally, `launchctl bootout gui/$(id -u)/com.nostradamus.engine` first, and re-install after.
2. **To deploy a change**: explicitly authorize and merge its reviewed PR. The exact resulting `main` push
   must pass all five release jobs; then `com.nostradamus.deploy` independently verifies and rebuilds prod
   within ≤~2 min (see "How a change goes live"). Building `ui/dist` in *this dev tree* no longer affects the
   live site. No engine restart is needed for web changes: the server reads `index.html` **fresh per
   request**, so new asset hashes are served immediately (the fix for the blank-page-after-rebuild bug —
   the server used to cache `index.html` at startup and desync from the on-disk hashes).
3. **A missing/stale asset 404s loudly** — the not-found handler never returns `index.html` for a
   `.js`/`.css`/`/api` path, so a bad deploy fails visibly instead of silently blanking the SPA.

## Quick checks

```
launchctl list | grep nostradamus                 # all agents (a doer also shows tunnel + calibration timers)
curl -s http://127.0.0.1:8787/api/health          # ok + repoRoot + deploymentPending writer-priority state
curl -fsS http://127.0.0.1:20128/healthz          # exact: ok (cheap every-tick OmniRoute liveness)
curl -s https://app.nostra-demus.com/api/health   # public path (doer only)
tail -f ~/Library/Logs/nostradamus-deploy.log     # auto-deploy log (DEPLOY/DONE lines)
tail -f ~/Library/Logs/nostradamus-watchdog.log   # self-heal log
tail -f ~/Library/Logs/nostradamus-housekeeping.log   # stale retired-timer attempts (always no-spend)
tail -f ~/Library/Logs/nostradamus-omniroute.log      # local model-router process log
bash ~/.nostra-ops/housekeeping.sh /research:track all  # confirms retirement; never starts a provider
```

## Reboot behavior
LaunchAgents start at **user login** (not pre-login boot). On a personal Mac that stays logged in /
auto-logs-in, that's effectively always-on. For true headless-boot-before-login you'd convert these to
root `LaunchDaemon`s in `/Library/LaunchDaemons/` (needs sudo) — not done here by design.
