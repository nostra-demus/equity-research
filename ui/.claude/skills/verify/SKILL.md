---
name: ui-verify
description: Runtime-verify a cockpit (ui/server + ui/web) change end-to-end in a headless container — launch the real server against a fake `claude` CLI, drive the real UI in Chromium, capture screenshots. Use when verifying any ui/ change whose surface is the running cockpit (chat/Ask, launches, SSE streams, panels).
---

# Verify a cockpit change at runtime (no Claude auth needed)

The cockpit's LLM seams all spawn the `claude` CLI (`CLAUDE_BIN`), which is not authenticated in a
CI/verification container. Substitute a fake CLI that speaks the real stream-json protocol and the
ENTIRE rest of the stack runs for real: Fastify route → child spawn → line parsing → SSE → React.

## Recipe that works

1. **Build the web bundle** (the server serves `ui/dist` statically):
   `cd ui/web && npm run build` (vite `outDir: '../dist'`).
2. **Fake CLI**: a node script that answers `--help` (print every flag `detectFlags` must see:
   `--print --output-format --verbose --model --max-turns --permission-mode --no-session-persistence
   --include-partial-messages --system-prompt --append-system-prompt --tools --disallowed-tools
   --max-budget-usd`), answers `--version`, otherwise consumes stdin fully THEN emits stream-json
   lines (`system/init`, `stream_event` content blocks with paced deltas, final `assistant`,
   `result`) and exits 0. Pace deltas with sleeps so UI states are observable.
3. **Start the server** from `ui/server`:
   `PORT=<free> CLAUDE_BIN=<fake> ENGINE_STATE_DIR=<tmp> NEWS_INGEST_ENABLED=0 npx tsx src/server.ts`
4. **Company roster comes from `data/` (gitignored), NOT `analyses/`** — an empty checkout shows
   "No companies yet". Seed `mkdir -p data/<TICKER>` with one file; the chat/run context still
   resolves from the committed `analyses/<TICKER>_*` runs. Remove the stub afterwards.
5. **Server surface first**: `curl -sN -X POST /api/chat` with
   `{"ticker":"…","scope":"run","messages":[{"role":"user","content":"…"}]}` — capture the SSE
   frames directly.
6. **Browser**: Playwright from a scratch dir (`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i playwright`),
   launch with `executablePath: '/opt/pw-browsers/chromium'` (the preinstalled build; a freshly
   installed playwright pins a browser rev that is NOT present — never `playwright install`).

## Gotchas

- `page.goto(..., {waitUntil: 'networkidle'})` NEVER settles — live SSE streams keep the network
  busy. Use `'load'` + timeouts/selectors.
- The cockpit boots into the LAST-DEFAULT swarm (screener wire) — click the `Research` chip in the
  command bar first, then `Select ticker ▾`, then the company row.
- The Ask panel opens via `button.cmdbar__ask` (use `.last()` — screener + research both mount one).
- Running `npm test` or the live server re-stamps the committed fixture
  `analyses/ZZKILLB_2099-01-01/.aborted` — `git checkout --` it before committing.
- Esc in the Ask panel closes it AND aborts the in-flight turn (by design); reopening starts a
  fresh thread (the old one stays in History).
