# Keeping `app.nostra-demus.com` alive — forever

The public cockpit URL is a **Cloudflare Tunnel → local engine server** (Fastify on `127.0.0.1:8787`,
fronted by Cloudflare Access). macOS `launchd` user agents keep it up — **and keep it on `main`** — with
**no human in the loop**:

| Agent | Runs | Auto-start at login | Auto-restart |
|---|---|---|---|
| `com.nostradamus.engine` | `npm start` (`tsx src/server.ts`) in **`nostra-prod/ui/server`** | ✅ `RunAtLoad` | ✅ `KeepAlive` |
| `com.nostradamus.tunnel` | `cloudflared tunnel run nostradamus-engine` | ✅ `RunAtLoad` | ✅ `KeepAlive` |
| `com.nostradamus.deploy` | `deploy.sh` every 120s — **auto-deploys `main`** | ✅ `RunAtLoad` | — |
| `com.nostradamus.watchdog` | `watchdog.sh` every 60s | ✅ `RunAtLoad` | — (self-heals the others) |
| `com.nostradamus.news-archive` | `news-archive.sh` every 3h | ✅ `RunAtLoad` | — |

### Production runs from its own tree (`nostra-prod`) — dev never touches live
The engine does **not** serve this dev checkout. Live runs from a dedicated git worktree pinned to
`main` at **`/Users/chiraagkapil/nostra-prod`**, so feature-branch work and uncommitted edits can never
leak to the public site. The engine runs `tsx` straight from source there (so the live API = `main`),
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
returned for the `.js` bundle), or an unreachable tunnel. Every 60s it checks (1) `/api/health`,
(2) that the served `index-*.js` comes back as real `application/javascript`, and (3) the public URL.
After **2 consecutive** failures (so a transient blip doesn't flap) it auto-repairs — kill the port
squatter + `kickstart` the engine, rebuild `ui/dist` if the bundle is corrupt, or `kickstart` the
tunnel — and logs every incident + repair to `~/Library/Logs/nostradamus-watchdog.log`. **You do
nothing; it fixes itself and keeps a track.**

The source-of-truth plists + scripts live here (`scripts/ops/*`). Installed copies: plists in
`~/Library/LaunchAgents/`, the `deploy.sh`/`watchdog.sh` runtime copies in `~/.nostra-ops/`. **First-time
setup** creates the prod worktree, then installs the agents:

```
# one-time: production checkout pinned to main (decoupled from your dev tree)
git worktree add -B main /Users/chiraagkapil/nostra-prod origin/main
(cd /Users/chiraagkapil/nostra-prod/ui/server && npm ci)
(cd /Users/chiraagkapil/nostra-prod/ui/web && npm ci && npm run build)
# migrate the GITIGNORED runtime dirs the fresh worktree doesn't get from git (analyses/ + screener/ are
# tracked, so they come with the checkout; .state/ and data/ are gitignored and must be copied over):
rsync -a /Users/chiraagkapil/equity-research/ui/server/.state/ /Users/chiraagkapil/nostra-prod/ui/server/.state/  # enrichment/news cache
rsync -a /Users/chiraagkapil/equity-research/data/             /Users/chiraagkapil/nostra-prod/data/              # research data pool (uploads, extracts)

# install / refresh all five launchd agents (idempotent, no sudo; safe to re-run)
bash scripts/ops/install-services.sh
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
launchctl list | grep nostradamus                 # all five agents
curl -s http://127.0.0.1:8787/api/health          # {"ok":true,"repoRoot":".../nostra-prod"}
tail -f ~/Library/Logs/nostradamus-deploy.log     # auto-deploy log (DEPLOY/DONE lines)
tail -f ~/Library/Logs/nostradamus-watchdog.log   # self-heal log
```

## Reboot behavior
LaunchAgents start at **user login** (not pre-login boot). On a personal Mac that stays logged in /
auto-logs-in, that's effectively always-on. For true headless-boot-before-login you'd convert these to
root `LaunchDaemon`s in `/Library/LaunchDaemons/` (needs sudo) — not done here by design.
