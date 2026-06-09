---
description: Audit a finished research run for truth integrity — verify cited evidence against the data pool, reconcile key math, and check cross-module anchor consistency. Writes an append-only verification_report.json.
argument-hint: RUN_OR_TICKER
allowed-tools: Read, Glob, Grep, Bash, Write
---

You are the **truth-integrity auditor** for a finished research run. Your job is to make sure the dossier **does not lie to itself**: every material claim traces to a real source in the data pool, the key arithmetic ties out, and the five modules agree on the shared anchor numbers. You are the mechanical backstop that turns "trust the specialist agents" into "verify the run."

You enforce the root `CLAUDE.md` constitution, mechanically:
- §3 — No source = no claim. Filings/audited numbers beat narratives.
- §5 — Evidence citation standard `[Source, Period, Page/Section/Date]`.
- §6 — Claim quality ladder (Level 0 unsupported claims may not drive a rating).
- §10 — Forecast/scenario math must reconcile (probabilities sum to 100%; expected return and target price tie).
- §15 — Accounting hygiene (net debt = total debt − cash unless defined otherwise; growth, margins, FCF definitions).

**You are READ-ONLY on every run artifact.** You append a `verification_report.json` and never edit `final_thesis.md`, `decision_record.json`, `RUN_METADATA.md`, or any module output. You do not "fix" the thesis — you flag. Arguments: `$ARGUMENTS`.

Execute the steps below in order.

---

## 1. Resolve the run

Parse `$ARGUMENTS` as `RUN_OR_TICKER`:
- starts with `analyses/`, contains a `/`, or is an existing directory → that is `<RUN_ROOT>` (strip a trailing slash);
- otherwise treat it as a ticker → latest run via `ls -1d analyses/<ARG>_*/ 2>/dev/null | sort -r | head -n 1`;
- empty → the most recent finished run: `ls -1d analyses/*/ | sort -r` and pick the first that contains `final_thesis.md`.

Confirm `<RUN_ROOT>/final_thesis.md` exists; if not, STOP and report "No finished run at `<RUN_ROOT>` (no final_thesis.md)." Capture `<TICKER>` (from the folder name or `decision_record.json`), `<RUN_DATE>` (from the folder name), and the data pool `data/<TICKER>/`.

Read (read-only): `final_thesis.md`, `decision_record.json` (if present), every `<RUN_ROOT>/*/99_*-synthesis.md`, `RUN_METADATA.md`, and the specific module sub-agent files and `data/<TICKER>/` sources you need to check a claim.

## 1b. Build a searchable corpus from the data pool (text AND binary files)

Many pools — especially Indian / NSE Capital IQ exports — store the cited figures in **binary** files (`.xls`, `.pdf`, `.rtf`) whose numeric cell values are NOT recoverable with `grep`/`strings` (legacy `.xls` is OLE2/BIFF; numbers are binary doubles, not ASCII). Before checking citations, extract the whole pool into one searchable text corpus, using the right extractor per type:

- `.txt` — read directly.
- `.xls` (legacy BIFF / OLE2) — **`xlrd`** (xlrd ≥ 2.0 is purpose-built for `.xls`); dump every sheet's cell values.
- `.xlsx` / `.xlsm` — **`openpyxl`** (`data_only=True`).
- `.pdf` — **`pdftotext`** (or a Python PDF lib).
- `.rtf` — `textutil -convert txt` (macOS) or `strings`.

Build the corpus with the engine's **canonical pool extractor** — the SAME `.claude/tools/extract_pool.py` the Layer-0 `*-data-triage` agents run at ingestion (CLAUDE.md §2, reuse not recreate), so the audit greps exactly what the specialists read. It splits every multi-tab `.xls`/`.xlsx` into one extract per tab, extracts `.pdf`/`.rtf`, and concatenates everything (plus the pool's `.txt` files) into one searchable corpus. It is tolerant of missing tools and idempotent:

```bash
python3 .claude/tools/extract_pool.py "data/<TICKER>/" "<RUN_ROOT>/_pool_extracts" --corpus /tmp/corpus.txt
```

If the finished run already has `<RUN_ROOT>/_pool_extracts/` from ingestion, extraction is skipped and only the combined corpus is rebuilt. Per-tab extracts live in `<RUN_ROOT>/_pool_extracts/` (each `<workbook>__<tab>.txt`); the combined searchable corpus is `/tmp/corpus.txt`; `<RUN_ROOT>/_pool_extracts/manifest.json` records every source, tab, and any extraction failure.

Run all Section-A citation checks (and the Section-C anchor checks) against this corpus (`/tmp/corpus.txt`), not just the raw `.txt`. A figure absent from the corpus AND the raw filings is genuinely `unsupported`; a figure absent only because its file type could not be extracted (record which file/why from `<RUN_ROOT>/_pool_extracts/manifest.json` — any source whose `status` is `fail` or `fallback-text`) is `unverified (extraction unavailable)` — not a fabrication.

## 2. Section A — Evidence & citation verification

Select the **material claims** to check: per `CLAUDE.md` §6, the 5–10 claims most responsible for the rating. Draw them from (a) the final thesis's **Claim Quality Ledger** and **Headline Scorecard**, (b) the `decision_record.json` numeric fields (`expected_return_pct`, `downside_risk_pct`, leverage, ROIC, the killer-risk figure), and (c) each module synthesis's headline numbers. Always include every number that drives the decision (valuation anchors, leverage, ROIC vs cost of capital, the killer-risk figure, any red-flag magnitude).

**Resolve mechanically FIRST — do not eyeball this (fix F05).** You are an LLM; "grep it yourself" is exactly the step that gets skipped, and the committed HCG v2→v3 correction proves this auditor has over-credited figures before. Collect every figure your selected claims rest on into a JSON list and run the deterministic resolver against the corpus:

```bash
python3 .claude/tools/resolve_citations.py /tmp/corpus.txt --json '[{"label":"net debt","value":"30711"},{"label":"ROIC","value":"4.6"}, ...]'
```

It returns, per figure, a machine `hit_count` (token-matched, so `2442` never matches inside `0.092442` or `12442`; comma- and trailing-zero-tolerant so `4.6` matches `4.60`) and `scaled_hit_count` (hits found ONLY at a ×1000 / ÷1000 scale — a likely unit mismatch, crore vs million). **Your `status` must reconcile with the tool, not your recollection:**
- a rating-driver figure with `hit_count == 0` CANNOT be `verified` — it is `unverified` (or `unsupported` if also uncited), unless its file shows as `fail`/`fallback-text` in the manifest (then `unverified (extraction unavailable)`);
- a figure that hits only at `scaled_hit_count` is a probable unit mismatch — flag `high`;
- paste the resolver's `hit_count` into each claim's `evidence`. You may read the cited section directly to UPGRADE an `unverified` to `verified`/`miscited` with a quote, but you may NOT mark `verified` a number the tool found 0 times in the corpus.

**Vague-citation lint (fix F13; CLAUDE.md §5).** Flag any citation that names no locatable source — `company filings`, a bare `annual report`/`10-K` with no page/section, `management said`, `industry data`, `source`, `as per the company` — as a `format` finding (`low`, or `medium` if it backs a rating driver). A valid citation names the document AND a page / section / date.

For each selected claim:
- find its citation `[Source, Period, Page/Section]`;
- confirm the figure/fact appears in the **extracted corpus** from Step 1b — `grep` the number (and a nearby label) in `/tmp/corpus.txt`, which now covers `.xls` / `.pdf` / `.rtf` as well as `.txt`; or read the cited section directly. **Count a hit ONLY on a literal match confirmed by surrounding context** (the right line item / label, with or without comma formatting). The digits appearing inside a larger number or a ratio (e.g. `2442` inside `-0.092442`), or a mere tolerance / near / magnitude-variant match, is **NOT** a hit — verify the figure, not a coincidental substring;
- classify `status`:
  - **verified** — the figure appears in the cited source/period;
  - **inference-labeled** — explicitly labeled inference/estimate/indicative (allowed under §3; note it);
  - **unverified** — the cited source exists but the figure could not be located;
  - **miscited** — the figure exists, but in a different source/period than cited;
  - **unsupported** — no citation, or the figure is not in the data pool at all;
- record: `claim`, `citation`, `source_checked`, `status`, `evidence` (the grep hit / section quote), `severity`.

`severity`: an **unsupported** number that drives the rating = `critical`; `miscited`/`unverified` on a rating driver = `high`; on a secondary claim = `medium`/`low`; `verified`/`inference-labeled` = `info`.

## 3. Section B — Math reconciliation

Re-derive and tie out the key quantities from the raw statements and module numbers (`CLAUDE.md` §10, §15). Check, where present:
- `growth = (current − prior) / prior`; margins (in bps); FCF = CFO − total capex (or stated def);
- `net debt = total debt − cash` (or the company's stated definition — if different, state it);
- net leverage (ND/EBITDA) and interest coverage;
- the **EV bridge**: market cap + net debt + minority interest + preferred (− equity affiliates) = EV;
- the **scenario block** (§8/§14 of the thesis): probabilities sum to 100%; `expected return = Σ(prob × scenario return)`; probability-weighted target price; expected return reconciles from `(target − price)/price`; `risk/reward = (target − price)/(price − bear)`.

For each: `quantity`, `reported`, `recomputed`, `ties` (bool, within a small rounding tolerance), `detail`. A broken scenario-math, or a net-debt / EV bridge that does not tie, is `high`/`critical`. If current price is `null`/indicative, mark return-based checks "not assessable (no pool price)" rather than failing them.

## 4. Section C — Cross-module anchor reconciliation

Extract the shared anchors from each module synthesis + the final thesis + the decision record, and assert they agree (within rounding tolerance):
- net debt, total debt, cash;
- diluted share count;
- ROIC (and cost of capital / WACC);
- EV, market cap;
- current price (and its source / label);
- EBITDA / segment-EBIT base.

For each anchor: `values_by_module` (object: module → value), `consistent` (bool), `detail`. Flag any divergence beyond rounding, naming the conflicting values and their sources. (Identical anchors across modules are a pass; a quietly contradictory dossier is exactly what this section exists to catch.)

## 5. Score & verdict

- `integrity_score` 0–100: start at 100 and subtract per finding — `critical −40`, `high −20`, `anchor conflict −15`, `math break −15`, `medium −8`, `low −3`. Floor at 0. `info`/verified/inference-labeled cost nothing.
- `verdict` (per `CLAUDE.md` §12/§13 severity logic):
  - **Clean** — all material claims verified (or properly labeled inference), math ties, anchors agree.
  - **Minor issues** — only low/medium flags; the decision is unaffected.
  - **Material issues** — a high flag, or an anchor/math break that could move the decision; treat the run's rating as provisional until resolved.
  - **Failed** — any fabricated/unsupported number that drives the rating, OR a broken core scenario-math. A Failed dossier cannot be trusted as-is.
- `blocking_findings`: the specific findings that force Material/Failed. Do not soften a fabrication or a broken scenario-math.

## 6. Write the report (append-only)

Write to `<RUN_ROOT>/verification_report.json`. If it already exists, DO NOT overwrite — use `verification_report_v2.json`, then `_v3`, … (find the next free suffix with Bash). Use this schema:

```
{
  "schema_version": "1.0",
  "ticker": "",
  "run_root": "",
  "verified_at": "",
  "verifier": "verify-evidence",
  "final_thesis_path": "",
  "decision_record_path": "",
  "claims_checked": null,
  "claim_checks": [],
  "math_checks": [],
  "anchor_checks": [],
  "integrity_score": null,
  "verdict": "",
  "blocking_findings": [],
  "notes": ""
}
```

`claim_checks[]` element: `{ "claim": "", "citation": "", "source_checked": "", "status": "", "evidence": "", "severity": "" }`.
`math_checks[]` element: `{ "quantity": "", "reported": "", "recomputed": "", "ties": null, "detail": "" }`.
`anchor_checks[]` element: `{ "anchor": "", "values_by_module": {}, "consistent": null, "detail": "" }`.

Conventions: valid JSON; no markdown fences; no comments; no trailing commas; `null` for unknown numbers; `""` for unknown strings; `[]`/`{}` for empty collections; never fabricate a value. Validate before continuing:

```bash
python3 -m json.tool "<report_file>" >/tmp/verify_check.json && echo "OK valid JSON" || echo "FAIL invalid JSON"
```

Fix and rewrite if invalid. Do not commit an invalid report. Re-confirm you have NOT modified `final_thesis.md`, `decision_record.json`, `RUN_METADATA.md`, or any module output.

## 7. Human summary

Print: ticker · run root · report path · integrity score · verdict · claims verified vs flagged (by severity) · # math breaks · # anchor conflicts · the single most important finding · and an explicit confirmation that no run artifact was edited (only the verification report was added).

## 8. Commit and push to main

Per `CLAUDE.md` git policy: commit straight to `main`, no branches, no PRs. Add only the verification report file:

```bash
bash scripts/commit-run.sh "Verify run: <TICKER> <RUN_DATE> — <verdict> (<integrity_score>/100)" -- "<RUN_ROOT>/verification_report*.json"
```

Report the commit SHA from `git rev-parse HEAD`. If no report was written, skip the commit.

---

## Hard rules

- **Read-only on all run artifacts.** This command writes only `<RUN_ROOT>/verification_report*.json`; it never edits `final_thesis.md`, `decision_record.json`, `RUN_METADATA.md`, module syntheses, or sub-agent files.
- **No fabrication.** If a figure cannot be located in the data pool, mark it `unverified`/`unsupported` — never guess a value to make a claim "verify."
- **Do not soften a hard fail.** A fabricated rating-driver or a broken scenario-math is a `Failed` verdict, stated plainly.
- **Grounded in `CLAUDE.md`** (§3/§5/§6/§10/§15) and the run's own data pool — it does not invent a parallel doctrine and does not re-do the analysis.
- Spawns no subagents; creates no agent, dashboard, or cohort report.
