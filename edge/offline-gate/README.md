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

Roll back if anything is wrong: `npx wrangler rollback` (or delete the route in the dashboard).

## Files
- `src/worker.ts` — the gate logic.
- `offline.html` — the branded, self-contained offline page (inlined into the Worker via the `Text` rule).
- `wrangler.toml` — name, route, `compatibility_date`, the `Text` rule.
