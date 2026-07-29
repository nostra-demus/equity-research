# company-news-bridge

Routes **material wire events** into a covered subject's research pool, so a company you track keeps
receiving evidence without anyone pasting files in.

- **Enabled set** — the `subjects` array in `company-news-bridge.json`. Adding a name is a one-line edit; the sweep
  re-reads it every tick.
- **Per-subject knobs** — `bridge_config.json`: `min_score` (default 60), `min_score_by_subject` (a
  high-flow name can demand a higher bar), `backfill_hours` (how far a NEWLY enabled name may reach on its
  first sweep — it can never dump its whole history into the pool).
- **Cadence** — every 12h, inside the cockpit (`BRIDGE_MODE=batch`, `BRIDGE_INTERVAL_MIN` to override).
  Deliberately NOT a `.claude/connectors/` feed — see the manifest's `notes`. Status: `GET /api/bridge/status`.
- **What lands** — one note per story per subject: `data/<TICKER>/screener_event_<EVENT_ID>.md`, tier 10,
  written by `research-bridge.ts` (the same writer the manual "Send to research" click uses).
- **Duplicates are a non-event, both directions** — the note's filename IS the event id and syndicated
  copies dedupe by story cluster, so batch-then-manual, manual-then-batch, another outlet's copy, and two
  engines sweeping the same pool all converge on "already there": no second file, and no second analysis
  (the follow-up analysis only fires for a subject that gained a FRESH note).
- **After a note lands** — the cheap, read-only intake analysis runs and scopes which orbs are affected.
  The **paid** re-run stays behind your click in the research tab (INTAKE.md §1, CLAUDE.md §24).
