# Nostradamus Swarm — Equity Research Cockpit

## Universe Model

Screener defaults to Universe (saved Portfolio/Watchlist choices are respected). Universe → Events
retains the event workspace; Universe → Model shows the free Finviz US-listed stock screen:
market cap above $2bn and average volume above 50,000 shares. Company and USD market price precede
twelve material-event columns and a descending weighted total: results, guidance, commercial contracts/JVs,
capex, products, operations, deals/restructuring, capital/returns, debt/distress, ownership, governance
and legal/regulatory actions. The existing news archive supplies the past 90 days of evidence for
3–6 month trade research, with no extra ingest or model calls. Routine meetings, record dates and small
employee grants are excluded by the materiality gate. Weights (including negative risk weights) are
editable and browser-local. The default total counts event categories, including adverse ones; it is
an event-activity ranking, never a bullish rating or proof a catalyst remains pending.

Signals reuse the archive's existing event types and high/critical materiality classifications. A match
requires an exact ticker plus normalized company name; known foreign listing tags cannot match a US
line. These tags are headline-based inference, not verified issuer research. Green ticks open up to
three recent source links; red crosses mean no matching report in the saved archive, never proof that
no event occurred. A stale (>48h) or unreadable/empty archive leaves signals and totals unavailable.
The event index refreshes off-thread every minute while read, caching compact results by each day's
file stamp so unchanged history is not reparsed. Strict shard failures leave coverage unavailable.
The grid shows the actual archived-day
count, latest report time, and scan time, without claiming exhaustive market coverage.

`GET /api/screener/universe-model` shares one paced public-page sweep across all viewers. The Model
checks every 15 seconds while visible; a new full sweep is eligible 30 minutes after the previous
attempt ends. The free Tickers view freezes membership in 1,000-name pages, then free price pages check
20 of those names at a time. This avoids moving pagination boundaries when a company crosses $2bn
during a longer price sweep. A 2,000-name screen needs about 102 pages at two seconds between requests,
plus network time. Quotes are Finviz's free delayed data, not an exchange real-time feed; individual quote timestamps
are unavailable, so each row shows its retrieval time. Closing the view stops scheduling new sweeps.
No Elite token, subscription, trial, paid search/enrichment API or per-company quote calls are used.

Only a complete, unique, validated sweep replaces `.state/universe-model.json` (or the configured
`ENGINE_STATE_DIR`). Cold-start partial coverage is labelled; failures preserve the last complete grid
and expose the source error with a 30-minute retry cooldown. A block, rate limit or changed page schema
never triggers a paid fallback, challenge bypass or a fabricated signal. The source may restrict free
access, so continuous availability and real-time pricing cannot be guaranteed.

A local, animated "swarm of agents" control surface for the research engine in this repo. It renders
every agent / module / dependency from disk, shows per-ticker data readiness (mirroring the engine's
data-triage rules), launches a single agent, a whole module, or the full pipeline on one click, and
streams runs live as the swarm lights up layer by layer.

Completed agents/modules turn amber; click one to read its output, and download it as a polished
document — **PDF** (print-ready), **Word** (.docx, via macOS `textutil`), **HTML**, or **Markdown** —
all from one report template (`server/src/export.ts`). The Claude plan-usage badge shows the real
5-hour / weekly windows the CLI reports.

- **`server/`** — Fastify control plane (Node). Parses the agent roster, computes data readiness,
  spawns the engine headlessly (`claude -p "/research:…"`), and fuses the CLI stream + a filesystem
  watcher on `analyses/` into one live SSE feed. Binds `127.0.0.1` only.
- **`web/`** — Vite + React + TypeScript frontend. Minimal-luxe: charcoal, one amber accent, crisp
  dependency edges, tasteful motion. No build step needed for the server (runs via `tsx`).
  The design contract (tokens, swarm accents, motion, shared wire surfaces) is [`web/DESIGN.md`](web/DESIGN.md) — every `ui/web` PR is held to it.

## Run it

```bash
cd ui
npm run install:all      # installs server + web deps
npm run dev              # starts Fastify (127.0.0.1:8787) + Vite (127.0.0.1:5173)
```

Then open http://127.0.0.1:5173. Vite proxies `/api/*` to the control plane.

Run the two processes separately if you prefer:

```bash
npm --prefix ui/server run dev     # control plane on :8787
npm --prefix ui/web    run dev     # UI on :5173
```

## IBKR Paper portfolio

The live **Calls** drawer reads one dedicated local IBKR Paper account, compares it with the current
published Calls policy, and can execute only in that simulated account.

1. Sign in to **Paper Trading** in Trader Workstation (TWS).
2. Open **Global Configuration → API → Settings**.
3. Enable **ActiveX and Socket Clients**, leave **Read-Only API** unchecked, and use paper port
   **7497**.
4. Keep TWS open, then open **Calls** in the cockpit. The paper portfolio refreshes every 15 seconds.

Paper execution is opt-in through the out-of-repo `paper.env` loaded from the Nostra engine config
directory:

1. Set `ENGINE_IBKR_PAPER_EXECUTION=1` to enable execution controls.
2. Allow-list the exact DU account with `ENGINE_IBKR_PAPER_ACCOUNT_ID`.
3. Set `ENGINE_IBKR_PAPER_AUTO_SYNC=1` to reconcile immediately after a verified `full`, `rerun`, or
   decision `review` publication.

Automatic execution follows these rules:

- **Sizing:** Selected/Buy calls are long and Short calls are short. Low conviction is 5%; confidence 75+
  is 10%.
- **No-trade calls:** Watchlist/Avoid opens no position. A later published exit closes the simulated holding.
- **Account ownership:** Automatic mode owns the whole dedicated paper account. Do not mix unrelated manual
  paper positions into it.
- **Safe rotation:** Nostra reads the exact publication commit, cancels superseded Nostra orders, and re-reads
  TWS before sizing. It closes the old holding first and waits for a later snapshot to confirm the fill before
  opening the replacement.
- **Manual retry:** **Sync now** runs the same full reconciliation against the current published policy,
  which becomes a 100%-cash target when no calls are active.

The connector is fixed to localhost and paper port 7497, exposes no account identifier to the browser,
refuses live/non-allow-listed or ambiguous accounts, and uses guarded limit entries plus duplicate-order
checks. TWS must be open when publication completes; a failed automatic attempt is shown in Calls and can
be retried with **Sync now**. A TWS outage cannot take down Calls history. Set
`ENGINE_IBKR_PAPER_DISABLED=1` to disable the local read entirely.

## How launch works (and what it costs)

Clicking launches the **real** engine via the Claude Code CLI in headless mode, with the repo as the
working directory:

| Click | Runs | Commits to `main` | Guard |
|---|---|---|---|
| an agent node | `/research:agent <module> <agent> <ticker>` | no | fires instantly |
| a module label | `/research:<module> <ticker>` | 1 commit | fires instantly |
| the core orb | `/research:full <ticker>` | 2 commits | **type the ticker to confirm** |

A full run is ~50 agents, roughly **$25–60 and 20–40 minutes**, and **pushes commits to `main`** — the
confirm dialog states this. The credit badge (top bar) surfaces rate-limit / out-of-credits status; a
launch made while out of credits fails fast and is reported cleanly. An agent node only launches solo
when its required upstream outputs already exist in the latest run folder (deep agents like `moat` need
`competitive-map` first).

## Data readiness

`data/<TICKER>/` is the Google Drive synced folder. The cockpit lists + classifies its files and shows
each module as Sufficient / Partial / Insufficient. A ticker with no data shows an upload prompt with the
Drive path and a live "watching for files" indicator that flips to ready the moment Drive syncs.

## Notes

- The server reads the repo (`.claude/agents`, `data/`, `analyses/`) and writes nothing itself — the
  engine (spawned as a child) writes `analyses/**` and owns all commits.
- Output endpoints are sandboxed to `analyses/`; launch params are validated against the live roster.
- `node_modules/`, `dist/`, and local run-state are gitignored; the UI source is tracked.
