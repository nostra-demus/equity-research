---
description: Manual market sweep — scan the screener's approved sources for the last ~24h of candidate material events, dedup against the event ledger, and merge them into today's signal Inbox (screener/inbox/). Does NOT run the gauntlet — a human picks which inbox rows become signals.
argument-hint: (none) — optionally a focus hint like "energy" or "India banks"
allowed-tools: Read, Write, Glob, Grep, Bash, WebSearch, WebFetch
---

You are the screener swarm's sweep orchestrator. Optional focus hint: `$ARGUMENTS`.

The sweep fills the Inbox; it never spends on Phase 0.1/Phase 1 work. Human-in-the-loop by design: launching a signal from the inbox is a separate, explicit act (cockpit or `/screener:signal`).

---

## 1. Resolve date/time

`date +%Y-%m-%d` → `<DATE>`; `date -u +%Y-%m-%dT%H:%M:%SZ` → `<NOW>`.

## 2. Read the doctrine

Read `.claude/agents/screener/SWARM.md` — the `sources.signal_gate.allowed` list (the ONLY sources this sweep may cite) and the strict materiality criteria in `.claude/agents/screener/signal-gate/MODULE_RULES.md` (the bar an inbox row must plausibly clear).

## 3. Scan

WebSearch the approved sources for the last ~24 hours of events that plausibly clear the strict materiality criteria (revenue/margins/cash flow/capital structure; regulatory/legal/operational risk; management credibility; supply/demand; analyst expectations). If `$ARGUMENTS` gives a focus, weight it but do not tunnel on it. Aim for breadth across: earnings/guidance, M&A, debt/credit, regulatory/enforcement, commodity/macro prints, operational disruptions.

For each candidate event keep: headline (verbatim), URL, source_name (canonical on-list name), input_nature, a one-line prelim note saying WHICH materiality criterion it plausibly satisfies (with the number when visible). Discard anything whose source is off-list — the sweep never launders sources.

## 4. Dedup

- Against the ledger: grep `screener/ledger/events.ndjson` for each URL and for normalized-headline tokens of the same issuer — a hit marks the row `dedup_status: possible_duplicate` (keep the row; the gauntlet decides).
- Within today's inbox: if `screener/inbox/<DATE>_sweep.json` already exists, read it; merge by URL. **Existing rows keep ALL their human + triage state untouched: `consumed`, `launched_signal_id`, `dismissed` / `dismissed_at` / `dismissed_by`, and any `triage_*` / `event_types` / `companies` / `size_bucket` fields the auto-ingester wrote.** Re-read the file IMMEDIATELY before writing (the cockpit and the auto-ingester may have updated it while this sweep ran — a stale read loses a human's dismissals). Never produce a second file for the same day.

## 5. Write the inbox (one file per day, idempotent)

Write `screener/inbox/<DATE>_sweep.json`:

```json
{
  "date": "<DATE>",
  "updated_at": "<NOW>",
  "focus_hint": "<$ARGUMENTS or null>",
  "rows": [
    { "inbox_id": "INB-<DATE-compact>-<NNN>", "headline": "...", "url": "...", "source_name": "...",
      "input_nature": "news_headline", "found_at": "<NOW>", "prelim_note": "...",
      "dedup_status": "new|possible_duplicate", "consumed": false, "launched_signal_id": null }
  ]
}
```

Keep ≤ 25 rows/day among rows with NO human state (rank by plausible materiality; drop only from that tail). **Rows that are `consumed` or `dismissed` are human history — ALWAYS kept, never dropped by the cap** (dropping a dismissed row would let a later scan resurrect the same URL as a fresh undismissed item). Then refresh the board: `python3 scripts/update_board_index.py`.

## 6. Commit and push to main

```
bash scripts/commit-run.sh "Screener sweep: <DATE> (<N> rows)" -- "screener/inbox/" "screener/board/"
```

## 7. Report

Print: rows found / new / possible-duplicate / total in today's file; the top 5 headlines with their prelim notes; the inbox path; the commit SHA. Remind: launch a row via the cockpit Inbox or `/screener:signal "<headline or URL>"`.

---

## Hard rules

- Off-list sources never enter the inbox.
- The sweep writes ONLY `screener/inbox/<DATE>_sweep.json` + the board index. No runs, no ledger events, no signals.
- Re-running the same day MERGES (idempotent) — existing rows' human state (`consumed`, `dismissed`, `launched_signal_id`) and ingester triage fields are preserved, and rows carrying human state are never dropped by the daily cap.
