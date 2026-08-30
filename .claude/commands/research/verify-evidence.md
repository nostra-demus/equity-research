---
description: Audit a finished research run for truth integrity — verify cited evidence against the data pool, reconcile key math, and check cross-module anchor consistency. Writes an append-only verification_report.json.
argument-hint: RUN_OR_TICKER
allowed-tools: Read, Glob, Grep, Bash, Write
---

You are the **truth-integrity auditor** for a finished research run. Your job is to make sure the dossier **does not lie to itself**: every material claim traces to a real source in the data pool, the key arithmetic ties out, and the five modules agree on the shared anchor numbers. You are the mechanical backstop that turns "trust the specialist agents" into "verify the run."

You enforce the root `CLAUDE.md` constitution, mechanically:
- §3 — No source = no claim. Filings/audited numbers beat narratives. A directional verdict that disagrees with another metric in the run's own tables must name that metric, by name, or it does not stand.
- §5 — Evidence citation standard `[Source, Period, Page/Section/Date]`.
- §6 — Claim quality ladder (Level 0 unsupported claims may not drive a rating).
- §10 — Forecast/scenario math must reconcile (probabilities sum to 100%; expected return and target price tie).
- §15 — Accounting hygiene (net debt = total debt − cash equivalents, the strict basis, unless defined otherwise; any investment-inclusive net-debt / net-cash figure must carry its §15 basis label — strict / broad / gross-liquidity; growth, margins, FCF definitions).

**You are READ-ONLY on every run artifact.** You append a `verification_report.json` and never edit `final_thesis.md`, `decision_record.json`, `RUN_METADATA.md`, or any module output. You do not "fix" the thesis — you flag. Arguments: `$ARGUMENTS`.

Execute the steps below in order.

---

## 1. Resolve the run

Parse `$ARGUMENTS` as `RUN_OR_TICKER`:
- starts with `analyses/`, contains a `/`, or is an existing directory → that is `<RUN_ROOT>` (strip a trailing slash);
- otherwise treat it as a ticker → latest run via `ls -1d analyses/<ARG>_*/ 2>/dev/null | sort -r | head -n 1`;
- empty → the most recent finished run: `ls -1d analyses/*/ | sort -r` and pick the first that contains `final_thesis.md`.

Confirm `<RUN_ROOT>/final_thesis.md` exists; if not, STOP and report "No finished run at `<RUN_ROOT>` (no final_thesis.md)." Capture `<TICKER>` (from the folder name or `decision_record.json`), `<RUN_DATE>` (from the folder name), and `<LOGICAL_DATA_PATH>` as `data/<TICKER>/`. That logical path is a citation label; Step 1b resolves the only filesystem evidence root.

If `<RUN_ROOT>/idea_projection_manifest.json` or `<RUN_ROOT>/idea_admission.json` already exists, STOP
before writing a new audit. That run's canonical audit set is sealed; appending a newer audit version would
correctly invalidate its live admission. New analysis belongs in a new dated run, while a discovered error
belongs in the append-only correction ledger. Never weaken this guard by deleting the seal.

Read (read-only): `final_thesis.md`, `decision_record.json` (if present), every `<RUN_ROOT>/*/99_*-synthesis.md`, `RUN_METADATA.md`, and the specific module sub-agent files needed to check a claim. Do not read raw evidence until Step 1b binds `<DATA_PATH>`.

## 1b. Build a searchable corpus from the data pool (text AND binary files)

Many pools — especially Indian / NSE Capital IQ exports — store the cited figures in **binary** files (`.xls`, `.pdf`, `.rtf`) whose numeric cell values are NOT recoverable with `grep`/`strings` (legacy `.xls` is OLE2/BIFF; numbers are binary doubles, not ASCII). Before checking citations, extract the whole pool into one searchable text corpus, using the right extractor per type:

- `.txt` — read directly.
- `.xls` (legacy BIFF / OLE2) — **`xlrd`** (xlrd ≥ 2.0 is purpose-built for `.xls`); dump every sheet's cell values.
- `.xlsx` / `.xlsm` — **`openpyxl`** (`data_only=True`).
- `.pdf` — **`pdftotext`** (or a Python PDF lib).
- `.rtf` — `textutil -convert txt` (macOS) or `strings`.

Build the corpus with the engine's **canonical pool extractor** — the SAME `.claude/tools/extract_pool.py` the Layer-0 `*-data-triage` agents run at ingestion (CLAUDE.md §2, reuse not recreate), so the audit greps exactly what the specialists read.

Resolve one generation before reading any evidence:

- If `NOSTRA_FROZEN_EVIDENCE_ROOT` is set, require the complete quartet
  `NOSTRA_FROZEN_POOL_DATA_PATH`, `NOSTRA_FROZEN_POOL_OUT_DIR`,
  `NOSTRA_FROZEN_POOL_GENERATION`, and `NOSTRA_FROZEN_EVIDENCE_ROOT`. The supervisor has already verified
  this isolated read capability immediately before provider start. Do not run `extract_pool.py`, rebuild
  extraction output, or inspect live/original extraction paths in this mode. Set `<EXTRACT_OUT>` to
  `$NOSTRA_FROZEN_POOL_OUT_DIR`, `<GENERATION_ROOT>` to
  `<EXTRACT_OUT>/.extract-generations/$NOSTRA_FROZEN_POOL_GENERATION`, `<DATA_PATH>` to
  `$NOSTRA_FROZEN_EVIDENCE_ROOT`, and `<CORPUS_PATH>` to `<GENERATION_ROOT>/corpus.txt`. Require
  `<DATA_PATH>` to be the generation manifest's exact `raw_prefix` inside `<GENERATION_ROOT>`. A partial,
  mismatched, symlinked, unreadable, or tampered binding is a hard stop. Never read
  `<LOGICAL_DATA_PATH>` or the original `<RUN_ROOT>/_pool_extracts/` tree in this mode — they remain outside
  the capability, and the logical data path is only the label printed in citations.
- Otherwise (standalone audit), set `<DATA_PATH>` to `<LOGICAL_DATA_PATH>`, `<EXTRACT_OUT>` to
  `<RUN_ROOT>/_pool_extracts`, and create a unique audit corpus with
  `mktemp "${TMPDIR:-/tmp}/nostra-evidence-<TICKER>.XXXXXX"`. Pass that exact path to `--corpus`; never use
  a shared `/tmp/corpus.txt`:

  ```bash
  python3 .claude/tools/extract_pool.py "<DATA_PATH>" "<EXTRACT_OUT>" --corpus "<CORPUS_PATH>"
  ```

  Capture `generation.digest` from the published manifest, set `<GENERATION_ROOT>` to
  `<EXTRACT_OUT>/.extract-generations/<digest>`, and verify that exact generation with the canonical
  extractor. The unique corpus is the extractor's byte copy of `<GENERATION_ROOT>/corpus.txt`; delete only
  that unique temporary file when the audit finishes.

For either mode, set `<MANIFEST_PATH>` to `<GENERATION_ROOT>/manifest.json`, `<CIQ_FACTS_PATH>` to
`<GENERATION_ROOT>/ciq_facts.json`, and `<RELATIONSHIPS_PATH>` to
`<GENERATION_ROOT>/relationships.json`. Resolve every manifest `extract` reference through
`<EXTRACT_OUT>` and require it to begin exactly `.extract-generations/<digest>/`. Never consume mutable
fixed-name projections. Run all Section-A citation checks (and Section-C anchor checks) against
`<CORPUS_PATH>`. A figure absent from the corpus and the cited raw file under `<DATA_PATH>` is genuinely
`unsupported`; a figure absent because the cited source failed extraction (record the literal reason from
`<MANIFEST_PATH>`) is `unverified (extraction unavailable)` — not a fabrication.

## 1c. Deterministic CIQ cross-check (a machine ground-truth for the key numbers)

Step 1b's exact generation may contain `<CIQ_FACTS_PATH>` — a DETERMINISTIC, source-bound parse of the CIQ workbooks (net debt, total debt, LTM EBITDA / OCF, FCF, interest coverage, EV/EBITDA + own-history percentile, P/E, segments, geography, margin trend, consensus, surprise, revisions). Each fact is `present` (with `source_ref` = the exact sheet / row / period it came from), `unknown` (looked-for, absent), or `missing` (whole CIQ export absent) — a number is never fabricated. Read it if present; **best-effort — if the file is absent or empty, skip this step and note `ciq_facts unavailable`.**

The money facts (keys ending `_m`) are in **millions of the run's `currency` field** — the workbook's *reported* currency (e.g. `INR`/`GBP`), NOT necessarily USD. Compare only against a thesis figure in the same currency and scale; a currency/scale mismatch (e.g. INR-crore thesis vs INR-million fact) is a unit error to flag, not a value disagreement to average.

For each `present` fact, if the thesis (`final_thesis.md`, a module synthesis, or `decision_record.json`) states a number for the SAME concept, compare the two:
- **Materially disagree** — the reported figure differs from the deterministic fact by more than ~2%, or is on a different period / basis than the fact's `source_ref` states → a Section-A finding: `status: miscited`; `severity: high` if it drives the rating (leverage, EV/EBITDA, EBITDA, net debt), else `medium`. Quote BOTH: the thesis's number and `ciq_facts`'s value + `source_ref`. This is exactly what catches an LLM reading a stale FY column as "LTM", or mixing a segment-revenue share with a segment-EBITDA share.
- **Agree** — the number is corroborated by the deterministic parse; note it (`info`, raises confidence).

Do NOT treat a `ciq_facts` `unknown`/`missing` fact as a thesis error — an absent deterministic fact is not evidence the thesis is wrong (it may be sourced elsewhere). This step ACTS only on `present` facts, and it **supplements, never replaces**, the corpus grep in Section A (a fact `present` here still needs its citation to name the right source per §5).

If `ciq_facts.json` carries a non-empty `conflicts` array, two or more CIQ files resolved to the same concept (e.g. a stale re-pulled export left beside the current one). The facts layer serves the freshest, but flag it: a `data-hygiene` finding (`severity: low`) naming the concept and the duplicate files, so the human prunes the stale file before the next run.

## 2. Section A — Evidence & citation verification

Select the **material claims** to check: per `CLAUDE.md` §6, the 5–10 claims most responsible for the rating. Draw them from (a) the final thesis's **Claim Quality Ledger** and **Headline Scorecard**, (b) the `decision_record.json` numeric fields (`expected_return_pct`, `downside_risk_pct`, leverage, ROIC, the killer-risk figure), and (c) each module synthesis's headline numbers. Always include every number that drives the decision (valuation anchors, leverage, ROIC vs cost of capital, the killer-risk figure, any red-flag magnitude) **and the headline EBITDA**. EBITDA is the spine of every leverage, coverage, and EV/EBITDA ratio AND the single most-mis-sourced figure, so check it explicitly: **EBITDA is NOT a line item in any IFRS / Ind AS / US-GAAP filing** — an EBITDA cited to a filing note must literally appear in that filing's own extract (the company's *"Underlying / Adjusted EBITDA"*), otherwise it is `miscited`. A data vendor's standardized EBITDA (Capital IQ / Bloomberg) carried under a filing-note citation is the canonical §5 trap — e.g. the CapIQ figure ₹9,965 cr cited to *"FY26 Annual Report, Note 22"* when the AR's own Underlying EBITDA is ₹10,314 cr: cite the vendor for the vendor's number, the filing for the filing's, and never the one under the other's name.

**Resolve mechanically FIRST — do not eyeball this (fix F05).** You are an LLM; "grep it yourself" is exactly the step that gets skipped, and the committed HCG v2→v3 correction proves this auditor has over-credited figures before. Collect every figure your selected claims rest on into a JSON list and run the deterministic resolver against the corpus:

```bash
python3 .claude/tools/resolve_citations.py "<CORPUS_PATH>" --json '[{"label":"net debt","value":"30711"},{"label":"ROIC","value":"4.6"}, ...]'
```

It returns, per figure, a machine `hit_count` (token-matched, so `2442` never matches inside `0.092442` or `12442`; comma- and trailing-zero-tolerant so `4.6` matches `4.60`) and `scaled_hit_count` (hits found ONLY at a ×1000 / ÷1000 scale — a likely unit mismatch, crore vs million). **Your `status` must reconcile with the tool, not your recollection:**
- a rating-driver figure with `hit_count == 0` CANNOT be `verified` — it is `unverified` (or `unsupported` if also uncited), unless its file shows as `fail`/`fallback-text` in the manifest (then `unverified (extraction unavailable)`);
- a figure that hits only at `scaled_hit_count` is a probable unit mismatch — flag `high`;
- paste the resolver's `hit_count` into each claim's `evidence`. You may read the cited section directly to UPGRADE an `unverified` to `verified`/`miscited` with a quote, but you may NOT mark `verified` a number the tool found 0 times in the corpus.

**Vague-citation lint (fix F13; CLAUDE.md §5).** Flag any citation that names no locatable source — `company filings`, a bare `annual report`/`10-K` with no page/section, `management said`, `industry data`, `source`, `as per the company` — as a `format` finding (`low`, or `medium` if it backs a rating driver). A valid citation names the document AND a page / section / date.

For each selected claim:
- find its citation `[Source, Period, Page/Section]`;
- confirm the figure/fact appears in the **extracted corpus** from Step 1b — `grep` the number (and a nearby label) in `<CORPUS_PATH>`, which covers `.xls` / `.pdf` / `.rtf` as well as `.txt`; or read the cited section directly under the bound `<DATA_PATH>`. **Count a hit ONLY on a literal match confirmed by surrounding context** (the right line item / label, with or without comma formatting). The digits appearing inside a larger number or a ratio (e.g. `2442` inside `-0.092442`), or a mere tolerance / near / magnitude-variant match, is **NOT** a hit — verify the figure, not a coincidental substring. **The hit must be in the CITED source's own exact-generation extract, not merely somewhere in the pool** — a figure that appears in the corpus but NOT in the cited document/period is `miscited`, never `verified` (the common case: a data-vendor figure — e.g. an EBITDA found only in a Capital IQ export — attached to a filing citation; CLAUDE.md §5). Where the citation maps to a known extract (the annual-report `.txt`, a specific workbook tab), resolve and grep that manifest-bound extract; if you cannot isolate the cited source's extract, read the cited section directly under `<DATA_PATH>` to confirm the number is actually there;
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
- `net debt = total debt − cash equivalents` (the strict §15 basis; or the company's stated definition — if different, state it). Where a figure nets in liquid investments (broad) or quotes gross liquidity, it must carry that §15 basis label — flag any non-strict figure presented as bare "net debt" / "net cash";
- net leverage (ND/EBITDA) and interest coverage;
- the **EV bridge**: market cap + net debt + minority interest + preferred (− equity affiliates) = EV;
- the **scenario block** (§8/§14 of the thesis): probabilities sum to 100%; `expected return = Σ(prob × scenario return)`; probability-weighted target price; expected return reconciles from `(target − price)/price`; `risk/reward = (target − price)/(price − bear)`;
- **currency / FX sanity (§15/§27).** For any figure converted from a foreign currency, the implied rate must match THAT currency's period rate — flag a EUR amount carried at the USD rate, or any conversion whose implied rate is off the stated currency's spot by a wide margin (rough anchors: EUR≈₹110, USD≈₹86, GBP≈₹130). When the filing itself states the home-currency (reporting-currency) equivalent of a foreign amount, that filed figure is canonical: a module-derived number that diverges from it is `miscited` / `high`. (The IVECO case — the filing states *"₹41,691 crore (€3.8 billion)"*, yet a module re-converted €3.8bn at the USD rate to ₹34,000 cr, understating the deal by ~₹7,700 cr.)

- **matched-basis ratios (§15).** For every ratio quoted anywhere in the thesis or a module synthesis, check the top and the bottom are measured the same way — the same period basis (point-in-time / period-average / period-peak / cumulative) and the same definitional scope. The recurring break: a **maximum daily balance** or an **approved annual cap** divided by a **year-end** balance, published as a clean "X% of cash". Where both bases are labelled inline and a matched version is given, that is a pass; a clean percentage over a hidden basis mismatch is `high`, and `critical` where the ratio was then used as a monitoring or kill threshold (a threshold you cannot measure the same way twice cannot fire).
- **itemised aggregates (§15).** For every headline total built from parts — off-balance-sheet financing, related-party exposure, contingent liabilities, a cost bridge — check the components and their sum appear alongside the total *at every layer that quotes it*, not only in the sub-agent that computed it, and that the parts are the same kind of thing. A drawn balance summed with an undrawn facility limit, or an asset-side derecognition summed with a liability-side programme size, is a mixed-basis aggregate: `medium` if labelled, `high` if presented as one clean exposure. A total the reader cannot rebuild from what the report shows is `high`.
- **period-basis of any beat/miss bar (§27).** Where the thesis states a consensus bar for an upcoming print, check it is on the basis the company will actually file. Divide the stated bar by the already-reported stub inside the same period: for a half-year filing with one quarter reported, the ratio should be roughly 2, not roughly 1. (For EPS, particularly a negative or near-zero bar, the ratio is unstable — verify the restatement arithmetic directly, `stub + standalone ≈ restated bar`, instead of relying on it, exactly as `earnings/04` §1A directs.) A standalone-quarter estimate carried as the bar for a cumulative (half-year / nine-month) filing is `critical` — it is wrong by the size of the stub and it propagates into the risk register, the kill criteria, and the forecast ledger.
- **cost-of-capital reality (§16).** Where a DCF or reverse-DCF drives a published value, check the discount rate against the company's own disclosed rate (impairment / lease / pension notes — search the corpus for it) and the market-implied rate. A model WACC more than ~3pp below the company's own disclosed rate, or below ~two-thirds of the market-implied rate, with no stated escalation branch taken, is `high`.
- **quality-haircut double count (§16).** Where a peer multiple was adjusted, check the adjustment is not charging a gap the multiple's denominator already carries. A margin haircut applied to EV/EBITDA, EV/EBIT, P/E, or P/FCF — and above all one sized as `own margin ÷ peer margin` — is a double count: `high`, and `critical` where that method carries the majority weight in the base-case fair value.

For each: `quantity`, `reported`, `recomputed`, `ties` (bool, within a small rounding tolerance), `detail`. A broken scenario-math, or a net-debt / EV bridge that does not tie, is `high`/`critical`. If current price is `null`/indicative, mark return-based checks "not assessable (no pool price)" rather than failing them.

## 4. Section C — Cross-module anchor reconciliation

Extract the shared anchors from each module synthesis + the final thesis + the decision record, and assert they agree (within rounding tolerance):
- net debt, total debt, cash;
- diluted share count;
- ROIC (and cost of capital / WACC);
- EV, market cap;
- current price (and its source / label);
- EBITDA / segment-EBIT base.

For each anchor: `values_by_module` (object: module → value), `consistent` (bool), `detail`. Flag any divergence beyond rounding, naming the conflicting values and their sources. Compare net debt like-for-like on the same §15 basis: a labelled strict-vs-broad pair is not a divergence; two unlabelled mismatched figures, or a basis switch with no label, is. (Identical anchors across modules are a pass; a quietly contradictory dossier is exactly what this section exists to catch.)

Two anchors fail most often and get a HARD assertion: **(a) strict net debt** = `total debt − cash & equivalents` ONLY (§15; the strict net-*cash* figure is just its negation, `cash − total debt`, positive when cash exceeds debt — keep the §15 sign, do not flip it) — flag as a mislabel any figure tagged *"strict"* that nets in deposits or short-term investments (that is the broad basis), and flag as an anchor conflict the same *"strict"* label carrying two or more different values across modules (the TMCV run had four: ₹2,082 / ₹2,959 / ₹7,433 / ₹13,713, all tagged "strict"). **(b) EBITDA provenance** — flag a conflict when modules carry different values for the SAME EBITDA basis, OR attribute the same metric to mismatched source *types* (a data-vendor standardized EBITDA in one module under a filing-note citation in another). A deliberately different, clearly-labelled basis is NOT a conflict (covenant/segment EBITDA for survival vs the filing's underlying EBITDA for valuation can legitimately differ) — so name the value, its source, AND its basis, so a real vendor-vs-filing mis-citation is distinguishable from a legitimate basis difference; the 3–4% vendor-vs-filing gap is what silently re-rates every leverage and EV/EBITDA ratio downstream.

### Section C2 — Claim fidelity on the way up (`CLAUDE.md` §3)

Anchors can all agree while the *words* wrapped around them drift. Findings get shorter as they climb — sub-agent → module synthesis → memo → final thesis → Headline Scorecard — and that compression is where a true finding becomes a false headline, without a single number changing. Take every load-bearing claim in Part I of the thesis (the scorecard lines, the killer risk, the scenario drivers, the kill criteria) and diff it against the sub-agent sentence it came from:

| Break | What to look for | Severity |
|---|---|---|
| Qualifier dropped | the sub-agent hedged and the thesis did not — `no *contractual* pass-through, ~38% recovered in practice` arriving as `no pass-through` | `high` |
| Basis dropped | a §15 basis label present upstream and absent downstream (peak vs point-in-time, strict vs broad, gross vs net) | `high` |
| Build dropped | a headline aggregate quoted without the components that were shown upstream | `medium` |
| Verdict hardened | `confirmed` / `proven` / `no` / `none` / `cliff` / `structural` in the thesis where the upstream evidence was mixed or split — including a directional verdict whose contradicting series is named upstream and silently absent downstream | `high` |
| Policy status stale | a named subsidy / tariff / incentive described by its old terms, or called expired / a "cliff", where the register shows it in force or replaced at different terms | `high` |

For each: `claim` (as published), `upstream_source` (file + section), `upstream_wording`, `break_type`, `severity`, `detail`. A Part I claim that cannot be traced to any upstream sentence at all is not a fidelity break — it is a `no-source-no-claim` finding for Section A.

### Section C3 — Named-metric contradiction sweep (`CLAUDE.md` §3)

`CLAUDE.md` §3 requires: *"If a directional verdict — improving, eroding, stabilising — rests on one metric while a different metric in the engine's own tables points the other way, name that second metric, give its figures, and say why it does not overturn the verdict."* Section C2 catches this ONLY when the contradicting series was named upstream (in a sub-agent or module synthesis) and silently dropped on the way to the thesis. It does NOT catch the case where the contradicting metric lives in a **different module's own tables** and was never surfaced anywhere in the run at all — the exact §3 worked example (moat "confirmed" off a five-year gross-margin decline while the same report's own tables showed EBITDA margin, net margin, cash conversion, and market share all higher over that period). This section closes that gap.

Build a small metric-family map from every `99_*-synthesis.md` this run actually produced — group each module's own headline directional metrics by family (margin/profitability, growth, leverage/solvency, cash conversion, competitive position/market share, governance risk) with its stated direction and period. Then, for every claim in `final_thesis.md` (Headline Scorecard, Decision Audit Trail, variant-perception paragraphs) or a module synthesis's own headline that uses one of the §3 closed-list strong verdict words — `confirmed`, `proven`, `none`, `no`, `never`, `always`, `cliff`, `structural` — against a specific metric family and period:

- Search every OTHER metric in that same family, across every module's own tables, for the same or an overlapping period.
- If a same-family, same-period metric moves the opposite direction, check whether the thesis names that metric by name and states why it does not overturn the verdict (§3's own test).
- Named and adjudicated → pass; record as `info`.
- Exists in the run's own tables and is NOT named anywhere in `final_thesis.md` → `contradiction_unaddressed`.

For each finding: `verdict_word`, `claim` (as published, with location), `metric_family`, `contradicting_metric`, `contradicting_value`, `contradicting_source` (module + table + citation), `addressed` (bool), `severity`. Severity: `high` when the unaddressed metric is a rating driver; `critical` when the same contradicting metric is ALSO flagged elsewhere in this audit (a Section B math break or a Section C anchor conflict) — the run's own machinery already knows the number disagrees, and the thesis still asserts the strong-verdict word over it. A run with no strong-verdict-word claims (only hedged language) is fully in scope but produces `[]`, not a skipped section — an empty array is a pass, exactly like Section C2.

## 5. Score & verdict

- `integrity_score` 0–100: start at 100 and subtract per finding — `critical −40`, `high −20`, `anchor conflict −15`, `math break −15`, `medium −8`, `low −3`. A Section C3 `contradiction_unaddressed` finding is scored at its recorded severity (`high` or `critical`) on this same scale — no separate deduction category. Floor at 0. `info`/verified/inference-labeled cost nothing.
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
  "final_thesis_sha256": "",
  "decision_record_sha256": "",
  "claims_checked": null,
  "claim_checks": [],
  "math_checks": [],
  "anchor_checks": [],
  "fidelity_checks": [],
  "contradiction_checks": [],
  "integrity_score": null,
  "verdict": "",
  "blocking_findings": [],
  "notes": ""
}
```

`claim_checks[]` element: `{ "claim": "", "citation": "", "source_checked": "", "status": "", "evidence": "", "severity": "" }`.
`math_checks[]` element: `{ "quantity": "", "reported": "", "recomputed": "", "ties": null, "detail": "" }`.
`anchor_checks[]` element: `{ "anchor": "", "values_by_module": {}, "consistent": null, "detail": "" }`.
`fidelity_checks[]` element (Section C2): `{ "claim": "", "upstream_source": "", "upstream_wording": "", "break_type": "", "severity": "", "detail": "" }` — `break_type` is one of `qualifier_dropped` / `basis_dropped` / `build_dropped` / `verdict_hardened` / `policy_status_stale`. Emit `[]` when Part I's claims all match their upstream wording; an empty array is a pass, not a skipped section.
`contradiction_checks[]` element (Section C3): `{ "verdict_word": "", "claim": "", "metric_family": "", "contradicting_metric": "", "contradicting_value": "", "contradicting_source": "", "addressed": null, "severity": "" }` — `verdict_word` is one of the §3 closed list (`confirmed` / `proven` / `none` / `no` / `never` / `always` / `cliff` / `structural`); `addressed` is `true` only when the thesis names `contradicting_metric` by name and states why it does not overturn the verdict. Emit `[]` when no strong-verdict-word claim in the run has an unaddressed same-family contradicting metric; an empty array is a pass, not a skipped section.

Immediately before writing the report, compute SHA-256 over the exact `final_thesis_path` and
`decision_record_path` bytes you audited (`sha256sum` on Linux or `shasum -a 256` on macOS) and record both
lowercase 64-hex digests. If either path or digest cannot be recorded, stop rather than emit a Clean report
that could later bless changed inputs.

Conventions: valid JSON; no markdown fences; no comments; no trailing commas; `null` for unknown numbers; `""` for unknown strings; `[]`/`{}` for empty collections; never fabricate a value. Validate before continuing:

```bash
python3 -m json.tool "<report_file>" >/tmp/verify_check.json && echo "OK valid JSON" || echo "FAIL invalid JSON"
```

Fix and rewrite if invalid. Do not commit an invalid report. Re-confirm you have NOT modified `final_thesis.md`, `decision_record.json`, `RUN_METADATA.md`, or any module output.

## 7. Human summary

Print: ticker · run root · report path · integrity score · verdict · claims verified vs flagged (by severity) · # math breaks · # anchor conflicts · # unaddressed contradictions (Section C3) · the single most important finding · and an explicit confirmation that no run artifact was edited (only the verification report was added).

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
