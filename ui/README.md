# Swarm — Equity Research Cockpit

A local, animated "swarm of agents" control surface for the research engine in this repo. It renders
every agent / module / dependency from disk, shows per-ticker data readiness (mirroring the engine's
data-triage rules), launches a single agent, a whole module, or the full pipeline on one click, and
streams runs live as the swarm lights up layer by layer.

- **`server/`** — Fastify control plane (Node). Parses the agent roster, computes data readiness,
  spawns the engine headlessly (`claude -p "/research:…"`), and fuses the CLI stream + a filesystem
  watcher on `analyses/` into one live SSE feed. Binds `127.0.0.1` only.
- **`web/`** — Vite + React + TypeScript frontend. Minimal-luxe: charcoal, one amber accent, crisp
  dependency edges, tasteful motion. No build step needed for the server (runs via `tsx`).

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
