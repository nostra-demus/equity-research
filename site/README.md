# Nostradamus Swarm — Dossier Viewer (`/site`)

A standalone, statically-deployable **investment dossier viewer** for a single research run produced by
the engine in this repo. It is a pure read-only frontend: it never modifies the research engine, agents,
commands, frameworks, or `analyses/` logic.

At build time, `scripts/build-data.mjs` copies the run at `analyses/<RUN>` (default `BG_2026-06-01`) into
`public/data/` and writes `public/data/manifest.json` (decision record + module scores + per-agent
verdicts). The Vite app reads that manifest and renders a polished dossier — decision, metrics, variant
perception, module scorecards, every agent report (click to read), red flags, and the forecast ledger.

## Cloudflare Pages

| Setting | Value |
|---|---|
| Root directory | `site` |
| Build command | `npm run build` |
| Build output directory | `dist` |

`npm run build` runs the data bundler then `vite build`, emitting a self-contained `dist/` (app + all
report content under `dist/data/`). The whole repo is checked out during the Pages build, so the bundler
reads `../analyses/<RUN>`; the generated `public/data/` is also committed as a safety net.

## Local

```bash
cd site
npm install
npm run build      # data bundler + vite build -> dist/
npm run dev        # local dev on http://127.0.0.1:4321
npm run preview    # serve the built dist/
```

To point the viewer at a different committed run: `REPORT_RUN=TICKER_YYYY-MM-DD npm run build`.

## Stack

Vite + React + TypeScript, `react-markdown` + `remark-gfm` for report rendering. No backend, no runtime
data fetching beyond the static `data/` assets — ideal for Pages.
