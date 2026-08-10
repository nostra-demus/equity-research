# offline-gate — edge "system offline" page for app.nostra-demus.com

`app.nostra-demus.com` is served **by the operator's laptop** (a Fastify engine behind a Cloudflare
Tunnel, fronted by Cloudflare Access). When the laptop sleeps/shuts off, the origin dies and a fresh
visitor would get Cloudflare's raw error page. This Worker sits on the hostname route and, when the
origin is down, serves an honest **"System offline"** response instead.

## Behavior

Per request, the Worker proxies to the tunnel origin with a **per-request-class** timeout (so a
healthy-but-slow engine is never falsely called offline):
- **SSE** (`Accept: text/event-stream`) → **no abort timer** (the timer only bounds time-to-headers; a
  stream that the engine keeps alive every 15s must never be guillotined).
- **`/api/health`** → **8s** (kept `>=` the app's own probes — 4s heartbeat, 6s `ensureMode` — so the
  Worker is never the first layer to give up on a reachable engine).
- **everything else** (other `/api/*`, documents, assets) → **15s** (covers a cold engine start + the
  tunnel hop + heavy control-plane JSON like `/api/swarm` and `/api/tickers` under load).

Then:
- **origin up** → pass the response through **unchanged** (SPA, hashed assets, SSE streams, `POST /api/launch` — all identical to today).
- **transient fast throw** (connection reset/refused) on an idempotent `GET`/`HEAD` → **one quick retry**
  before declaring offline (a budget *timeout* does **not** retry — the origin is alive but slow, so
  retrying only doubles the wait; `POST` and SSE are never retried).
- **raw `502`/`504` on exact `GET /api/health`** → wait **750ms**, then make **one fresh retry** under
  the same 8s overall health deadline. This lets a watchdog probe route around one stale, draining
  Tunnel connector while its healthy replacement is already connected. Other idempotent requests keep
  their prior one immediate retry with a fresh per-attempt budget; `POST` and SSE are never replayed. If
  the retry also fails, the gate still returns the honest marked offline response below — it never
  manufactures or caches a success.
- **origin down** (Cloudflare `>= 520`, incl. `530`/`1033` tunnel-down — instant, no wait; or a budget timeout) → an **intent-aware** offline response:
  | Request | Response |
  |---|---|
  | document navigation (`GET`, `Accept: text/html`) | `200` branded **offline HTML** (`offline.html`) that auto-reloads when the engine returns |
  | `/api/health` | `503` `application/json` `{ ok:false, reason:"engine-offline" }` |
  | other `/api/*` | `503` `application/json` `{ error:"engine-offline" }` |
  | asset / non-document | `503` `text/plain` (never HTML-as-JS/CSS) |

  Every offline response carries **`x-engine-status: offline`** and `cache-control: no-store`.

**Why intent-aware:** the cockpit's in-app heartbeat (`ui/web/src/lib/store.ts`) polls `/api/health`. If the
Worker returned HTML for `/api/health`, the heartbeat would classify the outage as *sign-in expired* (non-JSON
= Access login) instead of *engine offline*. The JSON `{reason:"engine-offline"}` + `x-engine-status` header is
the **contract** that keeps the two layers honest — keep it if you change either side.

## Optional: read-only fallback

By default a sustained outage shows the "System offline" page and auto-reloads when the engine returns. You
can OPTIONALLY hand off to a **read-only snapshot of the cockpit** once the outage outlasts the 45s grace, so
visitors can still browse finished theses while the engine is asleep. This is pure reuse — the app already
ships a static read-only mode (`ui/web/src/lib/api.ts` `ensureMode()` → `data/snapshot.json`, every input
disabled) — **no app redesign and no engine change.**

**Wire it up (one-time):**
1. Build the cockpit — `cd ui/web && npm run build`. `build` already runs `build-snapshot.mjs`, so `dist/`
   contains the read-only app AND `data/snapshot.json` (its `generatedAt` drives the "synced Xh ago" chip).
2. Publish `ui/web/dist` to a **separate, always-on** host behind the **same Cloudflare Access app** — e.g.
   `npx wrangler pages deploy ui/web/dist --project-name nostra-readonly` on its own hostname
   (`readonly.nostra-demus.com`), **NOT** the engine's tunnel origin. (Access-scoping is mandatory — the
   snapshot is your research, not public.)
3. Set `READONLY_URL` in `offline.html` to that hostname, then `wrangler deploy` this Worker.

**Behaviour once set (`READONLY_URL` non-empty):**
- **< 45s outage (restart / redeploy):** unchanged — the reconnecting page snaps straight back to the LIVE
  app. It never redirects, so a brief blip is never mistaken for a real outage.
- **≥ 45s outage (laptop asleep / off):** hands off to the read-only snapshot — but only when the visitor's
  own network is up (else it keeps the honest "reconnect when online" page). To return to live, revisit the
  engine's URL; it re-probes and goes live the moment the engine is back.
- **Freshness:** the snapshot is only as current as the last `dist` deploy — rebuild + redeploy it on a
  schedule (or on `analyses/` commits) so it doesn't drift. The chip shows exactly how stale it is.

Leaving `READONLY_URL = ''` (the default) keeps today's behaviour **exactly** — no redirect, nothing changes.

## Uptime monitor + push alerts (external heartbeat)

The gate above only **reacts** to visitors — if nobody loads the site while it's down, nobody knows.
This Worker also runs a **cron heartbeat** (`scheduled`, every minute) that probes the origin from
**Cloudflare's edge — independent of both Macs and of your laptop's network** — and **pushes you an
alert** when the site goes down and again when it recovers. This is the "someone is watching from
outside" layer the laptop failover monitor can't be (it's blind whenever the laptop's own network is
down, and asleep when the lid is closed).

**It is opt-in and non-breaking.** With the KV + `crons` block in `wrangler.toml` left commented, the
`scheduled` handler finds no `MONITOR_STATE` binding and no-ops — so the **proxy** behaves exactly as
before. (Two small things ship active regardless: `GET /__status` is answered by the Worker — returning
`{monitor:"disabled"}` until enabled — and the `workers.dev` host returns `404` instead of proxying.)
The pure decision/formatting logic lives in `src/monitor.mjs` + `src/alert.mjs` and is unit-tested by
`node:test` (CI job `edge`); the Worker glue (`probeOrigin` / KV / `/__status`) is in `src/worker.ts`.

### How it decides (hysteresis, so a redeploy never pages you)

Each tick probes `MONITOR_PROBE_URL` (default `/api/health`) with `redirect: 'manual'` and classifies it:
`up` (2xx) · `down` (our `x-engine-status: offline`, or `502/504/520+`) · `auth` (Access answered
instead of the engine — `401`/`403`, or a `302` to `*.cloudflareaccess.com`; the probe couldn't
authenticate) · `error` (threw / ambiguous). Then:
- **down/error** increments a streak; only at **`MONITOR_FAIL_THRESHOLD`** consecutive failures (default
  3 ≈ 3 min) does it flip to DOWN and send **one** alert — the grace window swallows the ~15-30s engine
  redeploy blip the gate already handles.
- **up** after an alerted outage sends **one** RECOVERY.
- **auth** never invents an outage (we genuinely can't tell) — it warns **once** so you fix the token.
- `MONITOR_REMIND_MINUTES > 0` repeats a reminder every N minutes while still down (default 0 = once).

### Enable it (one-time, ~5 min)

```bash
cd edge/offline-gate
# 1. state store (the monitor remembers up/down across ticks)
wrangler kv namespace create MONITOR_STATE          # copy the printed id

# 2. a push channel you already carry a phone app for — pick ONE, set MONITOR_ALERT_FORMAT to match.
#    ntfy.sh is the zero-account option (install ntfy, subscribe to a random topic, use its URL):
#      MONITOR_ALERT_FORMAT = "ntfy"     → wrangler secret put MONITOR_ALERT_WEBHOOK_URL   (https://ntfy.sh/<your-topic>)
#    others: "slack"/"discord" (webhook URL) · "telegram" (MONITOR_TELEGRAM_TOKEN + _CHAT_ID)
#            "pushover" (MONITOR_PUSHOVER_TOKEN + _USER) · "json" (generic {title,message,level} POST)
wrangler secret put MONITOR_ALERT_WEBHOOK_URL

# 3. an Access service token so the probe can pass Access and read the REAL engine state.
#    Cloudflare dashboard → Access → Service Auth → create token; add it to the Access app's policy.
wrangler secret put MONITOR_ACCESS_CLIENT_ID
wrangler secret put MONITOR_ACCESS_CLIENT_SECRET

# 4. uncomment the [triggers] + [[kv_namespaces]] blocks in wrangler.toml (paste the id), then:
wrangler deploy
```

Without the service token (step 3) Access answers the probe with `401`/`403` (never the engine) → the
monitor classifies every tick as `auth`, sends the one "can't authenticate" warning, and (correctly)
refuses to report a false outage. Fix the token and it starts watching for real.

### See its view / verify

- `GET https://<worker>.workers.dev/__status` → the monitor's current JSON (up/down, `downSince`,
  `lastUp`, last probe detail). The `workers.dev` host is **not** behind Access, so a status page or
  `scripts/ops/nostra-status.sh` can poll it from anywhere. (`/__status` on the custom domain works too
  but sits behind Access.)
- Force a real check: stop the tunnel (`launchctl bootout gui/$(id -u)/com.nostradamus.tunnel`), wait
  `threshold` minutes → you get the DOWN push; restart it → the RECOVERY push. Watch ticks live with
  `wrangler tail` (`[monitor] probe=… status=… alerts=…`).

**Runbook — "I can't reach the site":** run `bash scripts/ops/nostra-status.sh` first. Its EXTERNAL
REACHABILITY check probes the edge with DNS bypassed — if it says the edge is serving but your machine
can't resolve the name, it's **your** DNS/network, not the server (the exact false alarm this whole
layer exists to tell apart).

## Deploy (needs Cloudflare auth: `wrangler login` or `CLOUDFLARE_API_TOKEN`)

```bash
cd edge/offline-gate
npx wrangler deploy --dry-run --outdir=/tmp/og   # validate config + bundle (no auth needed)
npx wrangler dev                                 # smoke-test against the LIVE origin (see below)
npx wrangler deploy                              # bind the route + go live
```

Token scopes if not using `wrangler login`: **Workers Scripts: Edit · Workers Routes: Edit · Zone: Read** on
`nostra-demus.com`.

### Verify before trusting it

1. `wrangler dev` proxies to the real origin. With the engine **up**, the cockpit loads normally through it.
   Stop the tunnel (`launchctl bootout gui/$(id -u)/com.nostradamus.tunnel`) and reload → the **offline page**
   appears; restart the tunnel → it auto-reloads back to the app within ~10s.
2. After `wrangler deploy`, with the origin **down**, from an Access-authenticated session:
   - `curl -H 'Accept: text/html' https://app.nostra-demus.com/` → `200 text/html` offline page.
   - `curl https://app.nostra-demus.com/api/health` → `503`, `{ok:false,reason:"engine-offline"}`, `x-engine-status: offline`.
   - a `*.js` asset → **not** the offline HTML.
3. **Access ordering:** an **unauthenticated** private window must still get the Cloudflare **Access login**,
   not the offline page. If it doesn't, fix the Access app / route ordering before relying on this.
4. **Read-only fallback (only if `READONLY_URL` is set):** with the origin down, a **brief** restart (bring
   the tunnel back within ~30s) must snap the reconnecting page back to the LIVE app — **no** redirect. A
   **sustained** outage (>45s) must hand off to the read-only host. Then the blip-safety regression test:
   after that hand-off, bring the engine back, reload the LIVE app once, kill the tunnel again for ~20s —
   it must show the calm "Reconnecting…" page for the full grace and snap back to live, **not** immediately
   escalate/redirect (proves the grace clock reset on hand-off; the `nos_offline_since` key must be gone
   after the redirect). The read-only host must sit behind the **same Access** — an unauthenticated window
   hitting it gets the login, never the snapshot.

Roll back if anything is wrong: `npx wrangler rollback` (or delete the route in the dashboard).

## Files
- `src/worker.ts` — the gate logic.
- `offline.html` — the branded, self-contained offline page (inlined into the Worker via the `Text` rule).
- `wrangler.toml` — name, route, `compatibility_date`, the `Text` rule.
