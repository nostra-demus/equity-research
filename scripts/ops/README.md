# Keeping `app.nostra-demus.com` alive — forever

The public cockpit URL is a **Cloudflare Tunnel → local engine server** (Fastify on `127.0.0.1:8787`,
fronted by Cloudflare Access). Two macOS `launchd` user agents keep it up with **no human in the loop**:

| Agent | Runs | Auto-start at login | Auto-restart on crash |
|---|---|---|---|
| `com.nostradamus.engine` | `npm start` (`tsx src/server.ts`) in `ui/server/` | ✅ `RunAtLoad` | ✅ `KeepAlive` |
| `com.nostradamus.tunnel` | `cloudflared tunnel run nostradamus-engine` | ✅ `RunAtLoad` | ✅ `KeepAlive` |
| `com.nostradamus.watchdog` | `watchdog.sh` every 60s (`StartInterval`) | ✅ `RunAtLoad` | — (self-heals the others) |

### Self-healing watchdog (`watchdog.sh`)
`KeepAlive` only restarts a **crashed** process. The watchdog covers what it can't: a non-launchd
process squatting `:8787`, the engine being up but serving **broken content** (the blank page = HTML
returned for the `.js` bundle), or an unreachable tunnel. Every 60s it checks (1) `/api/health`,
(2) that the served `index-*.js` comes back as real `application/javascript`, and (3) the public URL.
After **2 consecutive** failures (so a transient blip doesn't flap) it auto-repairs — kill the port
squatter + `kickstart` the engine, rebuild `ui/dist` if the bundle is corrupt, or `kickstart` the
tunnel — and logs every incident + repair to `~/Library/Logs/nostradamus-watchdog.log`. **You do
nothing; it fixes itself and keeps a track.**

The source-of-truth plists live here (`scripts/ops/*.plist`). The installed copies are in
`~/Library/LaunchAgents/`. To (re)install after a machine reset / migration:

```
bash scripts/ops/install-services.sh
```

## Operating rules (so it never blanks or dies)

1. **Never run the server manually** (`npm run dev` / `npm start` in a terminal). launchd already owns
   `:8787`; a second server collides on the port (`EADDRINUSE`) and one of them fails. If you must
   debug locally, `launchctl bootout gui/$(id -u)/com.nostradamus.engine` first, and re-install after.
2. **To deploy web changes**: rebuild the bundle — `npm --prefix ui/web run build` (writes `ui/dist`).
   No server restart needed: the server reads `index.html` **fresh per request**, so new asset hashes
   are served immediately. (This is the fix for the blank-page-after-rebuild bug — the server used to
   cache `index.html` at startup and desync from the on-disk hashes.)
3. **A missing/stale asset 404s loudly** — the not-found handler never returns `index.html` for a
   `.js`/`.css`/`/api` path, so a bad deploy fails visibly instead of silently blanking the SPA.

## Quick checks

```
launchctl list | grep nostradamus                 # both should show a PID
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8787/api/health   # 200
tail -f ~/Library/Logs/nostradamus-engine.log     # engine log
tail -f ~/Library/Logs/nostradamus-tunnel.log     # tunnel log
```

## Reboot behavior
LaunchAgents start at **user login** (not pre-login boot). On a personal Mac that stays logged in /
auto-logs-in, that's effectively always-on. For true headless-boot-before-login you'd convert these to
root `LaunchDaemon`s in `/Library/LaunchDaemons/` (needs sudo) — not done here by design.
