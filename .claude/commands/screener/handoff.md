---
description: Hand a screener thesis's shortlisted company to the research swarm — IDEMPOTENT on <thesis_id>::<ticker>. Seeds data/<TICKER>/screener_thesis_<id>.md (user-note-tier source), appends the handoff ledger, updates the board. Does NOT launch the research run (human confirms that separately).
argument-hint: THESIS_ID TICKER
allowed-tools: Read, Write, Glob, Grep, Bash
---

You are the screener→research handoff orchestrator. Arguments: `$ARGUMENTS` (THESIS_ID then TICKER).

---

## 1. Parse and validate

- `<THESIS_ID>` = first token (shape `THS-SIG-YYYYMMDD-XXXXXXXX-vN`); `<TICKER>` = second token, uppercase, matching `^[A-Z0-9.\-]{1,15}$`. Anything else → STOP with usage.
- Read `screener/ledger/theses/<THESIS_ID>.json` (fallback: the run folder's `thesis_record.json` via the signal id inside the thesis id). Missing → STOP: "No locked thesis <THESIS_ID>".
- Require `meta.locked: true` and `meta.status` ∈ {provisional, full_machine}. A watchlist thesis is not handed off — STOP and say why.
- Read `screener/ledger/candidates/<THESIS_ID>.json`; `<TICKER>` should appear in it. If it does not, WARN (the human may know better) and proceed — record `off_deck: true` in the handoff line.

## 2. Idempotency check

`date -u +%Y-%m-%dT%H:%M:%SZ` → `<NOW>`. Grep `screener/ledger/handoffs.ndjson` for `"<THESIS_ID>::<TICKER>"`. If found: print the existing `handoff_id` + `seeded_path`, refresh the board (`python3 scripts/update_board_index.py`), and STOP — a repeat handoff writes NOTHING new.

## 3. Seed the research data pool

`mkdir -p data/<TICKER>/`. Write `data/<TICKER>/screener_thesis_<THESIS_ID>.md` — a self-contained memo from the locked record:

- Header block: *"Engine-generated screener thesis — treat as an internal user-note-tier source (CLAUDE.md §4 tier 9), not a filing. Generated <NOW> from <THESIS_ID> (locked). Numbers cite their original sources inside."*
- The sterile event statement (M0.1) + its sources.
- The quantified world changes (M0.2 table: id, change, magnitude, baseline, date, source).
- The beneficiary tier THIS company's industry sits in (M0.3 party row + composite + mechanism) and which side (long/short/pair).
- The clock (M0.4 horizon + expiry condition) and the kill switch (M0.5 falsification sentence, metrics, threshold, date, secondary falsifiers) — research should inherit these as watch-items.
- The edge view (M0.6: consensus anchor, variant numerics + departure, mispricing category, convergence trigger + window, edge score + routing).
- The candidate card for this ticker from candidates.json (exposure score + rationale + caveats).

## 4. Append the handoff ledger + refresh state

- `<HANDOFF_ID>` = `HND-<YYYYMMDD>-<TICKER>-<first 8 hex of sha256 of "<THESIS_ID>::<TICKER>">` (Bash shasum).
- `bash scripts/append-ndjson.sh screener/ledger/handoffs.ndjson '{"handoff_id":"<HANDOFF_ID>","key":"<THESIS_ID>::<TICKER>","thesis_id":"<THESIS_ID>","ticker":"<TICKER>","handed_off_at":"<NOW>","seeded_path":"data/<TICKER>/screener_thesis_<THESIS_ID>.md","research_run_root":null}' key "<THESIS_ID>::<TICKER>"`
- `python3 scripts/update_board_index.py`

## 5. Commit and push to main

```
bash scripts/commit-run.sh "Screener handoff: <THESIS_ID> -> <TICKER>" -- "screener/ledger/" "screener/board/"
```

(The seeded memo lives in `data/` — the Drive-synced pool outside git — so the commit covers ledger + board only.)

## 6. Report

Print: the handoff id; the seeded path; whether the ticker's data pool has other files (count `ls data/<TICKER>/ | wc -l`) — if the memo is the ONLY file, say plainly that a research run needs filings in the pool first; the next step: launch `/research:full <TICKER>` from the cockpit (with its own cost confirmation) when the pool is ready; the commit SHA.

---

## Hard rules

- Idempotent: same THESIS_ID+TICKER twice → one ledger row, one memo, second call reports the first.
- Never launch the research run from here. Never modify the locked thesis. Never write outside `data/<TICKER>/`, `screener/ledger/`, `screener/board/`.
