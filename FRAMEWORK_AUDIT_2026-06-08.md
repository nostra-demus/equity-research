# Framework Audit — Nostradamus Equity-Research Engine

**Date:** 2026-06-08
**Method:** 106-agent adversarial audit. 12 parallel lenses (9 design + 3 forensic, reading the real committed runs BG / HCG / TMCV end-to-end) produced 95 raw findings; these were consolidated to 69 canonical findings; every consequential one was then independently re-checked — each **fatal** by 3 skeptics instructed to *refute* it, each **suboptimal** by 1 — re-reading the cited file and hunting for mitigations elsewhere.
**Post-verification result:** 1 fatal · 34 suboptimal · 31 right (genuine strengths) · 3 invalidated on fabricated/misread evidence.
**Hard limit:** the source data pool `data/<TICKER>/` is a gitignored Google Drive symlink and is **absent from this checkout**. Every prompt and every committed *output* was read; no live *input* filing could be. 31 claims that can only be settled by a live run are listed in §5 — none of them change the verdict below, but they decide how often the weaknesses actually bite.

---

## Verdict

**The investing judgment is genuinely strong and genuinely enforced. The arithmetic and the assurance layer are not mechanized — and that is the whole story.**

The doctrine in `CLAUDE.md` is not aspirational wallpaper: 31 verified strengths show the source hierarchy, the no-source-no-claim rule, the score caps, the verdict-locks, the six Rejector filters, and the refusal to force a Buy are all wired into the prompts the model actually runs and are observable in all three committed runs (§3). This is a well-built machine that thinks like a disciplined buy-side PM.

The single systemic weakness is that **every number the engine produces, and every citation it claims to have checked, is produced and "verified" by an LLM doing the work in its head** — and the deterministic safety nets that exist (`verify-evidence`, the `eval` math checks, `pre-mortem`) either don't recompute the load-bearing numbers or aren't wired into the path that ships and commits the thesis. The capability to compute deterministically is present in every agent (they all carry `Bash`) and is simply never pointed at the math. This is not hypothetical: a committed thesis (TMCV) shipped with its headline expected return printed as **+4.3% when its own body proves the true number is −4.4%** — the sign of the single most decision-driving number is wrong in the published artifact (F12).

The good news: nearly every fix is a **prompt or eval-harness change with zero engine-code cost**, and the framework already contains the working patterns to copy (the one deterministic `eval` date-math check, F59; the real citation resolver inside `verify-evidence`, F55).

| | Count | What it means |
|---|---|---|
| 🔴 Fatal (verified) | **1** | A "deterministic gate" that doesn't check the one thing it claims to (F08). |
| 🔴 Fatal-class cluster | **5** | Individually survivable (so verified as suboptimal), but share one root cause — unmechanized math + no gate on the ship path — and have already produced a wrong published number. |
| 🟠 Suboptimal | **34** | Real weaknesses: data-gap leaks, silent extraction failures, cosmetic verifiability, provenance drift, prompt hygiene. |
| 🟢 Right | **31** | Verified strengths to preserve — the doctrine layer is the engine's moat. |
| ⚪ Dismissed | **3** | Findings the verifiers refuted because the auditor had fabricated or misread the evidence (§4). |

---

## §1 — The fatal-class problem: the trust gap

All six items below share one root cause: **a number or a citation is asserted by an LLM with no executed computation and no deterministic gate before the run is committed and pushed to `main`.** The adversarial layer correctly demoted five of them from "fatal" to "suboptimal" *individually* (each has a partial mitigation), but they are reported together here because collectively they are the framework's most serious risk, and one of them has already fired in a committed run.

### F08 🔴 FATAL (verified 2/3) — the "deterministic gate" doesn't check the math
`eval.md` bills itself as "the deterministic test suite that proves a change did not break the contracts" and names "§10 scenario math" — but **check E (`.claude/commands/research/eval.md:87-89`) only type-checks that fields are numbers in range. It never recomputes anything.** A run emitting `expected_return_pct = +25%` from a scenario set whose true Σ(p×return) is −5% passes cleanly. Worse, the scenario block (probabilities, per-case returns, targets) lives only in `final_thesis.md` prose and is **not persisted to `decision_record.json`**, so the harness cannot see the numbers even if it wanted to.
**Fix:** persist the scenario array into `decision_record.json`, then add an `eval` check (copy the working date-math check at `eval.md:90-99`) that recomputes in Python: probabilities sum to 100; `expected_return == Σ(p×return)`; prob-weighted target `== Σ(p×target)`; `(target−price)/price == expected_return`; `risk_reward == (target−price)/(price−bear)`. FAIL on mismatch.

### F12 🟠 (was fatal) — the proof it already happened
`analyses/TMCV_2026-06-07/final_thesis.md:32` headline scorecard prints **"Expected return (probability-weighted) | +4.3%"** and §3 repeats it — while §8 of the *same file* (line 169, committed verbatim) reads `= +4.3% + rounding = +4.3% ✓ (exact: 8.6 + 4.9 − 5.7 − 12.15 = −4.35%... let me recalculate correctly)` and line 174 concludes **"−4.4% (negative; confirmed)"**. The memo and `decision_record.json` both have the correct −4.4%; only the headline a reader sees first is wrong, and it is wrong in sign. Two faults in one: (a) the headline was hand-typed instead of derived from the validated block, and (b) raw "let me recalculate" scratch-thinking leaked into a committed artifact.
**Fix:** compute the headline cells *from* the validated scenario block (single source of truth); add a pre-commit assertion that the headline matches `decision_record.expected_return_pct`; have `eval` grep published artifacts for leaked scratch phrases.

### F09 🟠 (was fatal) — the fix is already in the engine's hands
Every agent's frontmatter lists `Bash`, yet a grep across the valuation, earnings, and balance-sheet agent bodies finds **no instruction to ever execute it to compute a number** — they say "compute", "recompute", "solve", "reconcile", never "run code to do it" (`.claude/agents/synthesizer.md:211-237`; the numeric agents' WORKFLOW sections). So the DCF PV sum, the EV bridge, net leverage at a −40% haircut, fixed-charge coverage, and the probability-weighted return are all mental arithmetic by a model known to slip on exactly this.
**Fix (prompt-only):** in the numeric agents and synthesizer Step 4, require every derived number to be produced by an executed Bash/Python snippet, and have the agent paste the one-line command + result.

### F11 🟠 (was fatal) — the least reliable computation drives "what's priced in"
`valuation/05_reverse-dcf.md:38` asks the LLM to "find the FCF growth rate that makes the present value of cash flows equal to today's EV" — a nonlinear root-find (goal-seek / IRR) done by hand — and step 7 asks for two more solves at different discount rates. This implied-growth number *is* the variant-perception read the synthesizer uses to judge whether the market's bar is low or high (BG: "the indicative ~$123 price embeds only ~2.3% FCFF growth"). A wrong solve silently corrupts the Buy/Avoid call.
**Fix:** require an actual solver (`scipy.optimize.brentq` or a bisection loop) with the command + root pasted.

### F05 🟠 (was fatal) — verifiability is a behaviour, not a mechanism
There is **no deterministic citation resolver anywhere** (`grep` across `ui/server/src/*.ts` finds none; `data-status.ts` uses the extractor only to list tabs). `verify-evidence.md:59` tells the *model* to "grep the number in /tmp/corpus.txt and count a hit only on a literal match" — but the auditor is itself an LLM; nothing forces the grep to run or validates the asserted "found (N hits)". Commit `bee3c85` ("Correct HCG verification: v3 supersedes erroneous v2 — only 2 of 4 figures verify") is proof the LLM auditor has already over-credited figures.
**Fix:** a small Python resolver (beside `extract_pool.py`) that actually greps the corpus for each `claim_check` number and returns machine hit-counts the LLM must reconcile against; have `eval` assert the resolver's counts match the report's statuses on the golden fixtures.

### F17 🟠 (was fatal) — the caps are prompt-only; nothing enforces them
The CLAUDE.md guarantees — score caps (§11/§12), governance/solvency verdict-locks (§13/§18), scenario-math reconciliation (§10) — exist only as instructions. `ui/server/src/data-status.ts:266-419` computes caps as **display strings** (`caps.push('margin of safety not assessable (no current price)')`); `verdict.ts:34-56` only *parses* a verdict out of markdown. No function recomputes a score, blocks a rating, or checks that a flagged-missing input wasn't filled from the web. One non-compliant agent run produces a confident output with nothing to catch it before commit.
**Related root issue — F01:** `full.md` (steps 10-13) wires only synthesizer → memo → audit-dossier → `commit-run.sh` (which pushes to `main` immediately). `grep -cniE 'verify-evidence|pre-mortem|expectations-gap' full.md` = **0**. The integrity audit, the red-team, and the edge test are all opt-in and, even when run, execute *after* the thesis is committed, pushed, and copied to the company's Drive folder. (Mitigation that saved it from "fatal": the synthesizer *does* carry the §8 disconfirmation engine and §10 kill criteria *inside* the shipping thesis, and downstream `size.md`/`eval.md` gate on the verdicts — but those are leaky and protect the portfolio path, not the committed `final_thesis.md`.)
**Fix:** add one lightweight post-run validator into the `/research:full` and `/research:rerun` finish path in `launcher.ts`, run **before** "done"/commit: assert probabilities sum to 100; assert `decision_record` confidence/rating respect the declared caps and verdict-locks; assert any indicative price forces margin-of-safety "Not assessable". Treat a hard violation like the existing failure path. At minimum, make `eval` FAIL a Selected/Buy run that lacks a `pre_mortem.json`.

---

## §2 — Sub-optimal, by theme

### A. The data-unavailability contract leaks (your central worry)
This is the exact thing you flagged: where the pool lacks a number, does the engine flag it or quietly fill it from the web/memory? The answer is **mostly good, but the strength is uneven** — the price path is well-guarded, the consensus and insider paths are not.

- **F18 (price)** — `valuation/01_price-and-capital-structure.md:28` *does* the right thing: if no price in pool, "attempt a web quote, and label it exactly `Indicative price, web-sourced as of {DATE}, not from data pool — unverified`," and BG did exactly this. But current price is the single most consequential number (every up/downside %, margin of safety, paper-trade entry derives from it), and for a famous ticker an LLM can hallucinate a "web quote" from memory. **Fix:** require two independent web sources to agree before any web price anchors; force `decision_record.entry_price` to stay null so no paper trade strikes on an unverified number.
- **F19 (consensus)** — materially weaker than the price path. `earnings/04_guidance-consensus.md` carries `WebSearch + WebFetch`, has **no pool-first rule, no rule forbidding web/memory Street estimates, and no verbatim "unverified" label**. A live undated web consensus can silently set the beat/miss bar and the rating. **Fix:** mirror the price path — consensus only from a pool export; if absent, produce a guidance-only read and apply the consensus-setup max-30 cap.
- **F20 (insider/ownership)** — the highest memory-anchoring class for famous founders. `management-governance/04` may web-source insider stakes/transactions behind only a generic "unverified" label, with no corroboration and no propagated cap — and a web figure can still fire RF-OWN pledge/market-conduct flags. **Fix:** require a pool filing (shareholding-pattern / Form 4 / SAST-PIT) to fire any insider red flag; web figures are context only and cap the component to Low-confidence.
- **F03 (the gate that should catch this)** — in TMCV, triage returned **"Critical missing: None"** while consensus, peer comps, analyst coverage and the credit panel had all failed to extract — and it mislabeled the transient lock as a "Google Drive stub," after which a sibling agent asserted the consensus export "is present" with specific numbers it never yielded (`analyses/TMCV_2026-06-07/business-model/00_data-triage.md:42,69`; `earnings/99_earnings-synthesis.md:65`). The sufficiency rule keys only on annual+quarterly+transcript, so a pool that lost its entire structured estimates/peer/credit layer still passes "Sufficient." **Fix:** triage must read `manifest.json` and treat any `status:fail` source as MISSING for sufficiency and caps, report the literal error rather than re-narrating it as a "stub," and downgrade to Partial when a relied-on export is in fail state.

### B. Silent extraction failures (the worst kind — they look like success)
- **F02** — `extract_pool.py:87-115` opens `.xls` with on-demand mmap and **no retry, no lock, no backoff**. On the real TMCV pool, **7 of 19 workbooks failed** with `OSError: Resource deadlock avoided` — and they were the rating-driver exports (Company Comparable Analysis, Analyst Coverage, Credit Health Panel, Public Holdings, EstimatesReport). Root cause: the 6 per-module triage agents each invoke the extractor, racing on identical files over the Drive FUSE mount. A recoverable lock becomes a permanent "fail," and those numbers are absent from the corpus forever. **Fix:** bounded retry-with-backoff; copy-to-tmp or `file_contents=` to avoid mmap over FUSE; an openpyxl/libreoffice fallback for the `BadZipFile`/HTML-disguised cases; run the extractor **once** before any agent.
- **F24** — `extract_pool.py:118-134` uses `openpyxl read_only` + `iter_rows` with no `reset_dimensions`, so a workbook with a stale `<dimension>` tag silently truncates trailing rows/columns while the manifest still shows a plausible `rows×cols` and "ok." **Fix:** `ws.reset_dimensions = True` + a post-read sanity warning.
- **F34** — the cockpit caches a transient read failure as permanently-unreadable (`null`) keyed by `path:size:mtime` and persists it to disk (`data-status.ts:99-120`), so a one-off lock shows that workbook as tab-less "forever." **Fix:** cache only successful reads; short-TTL negative entries.
- **F35** — image-only/scanned PDFs and `.pptx`/`.docx` are silently skipped or yield empty text with no "needs OCR / unsupported" signal — investor decks and scanned Indian filings never reach the specialists. **Fix:** add `.pptx`/`.docx` handling and an explicit "image-only, OCR required" status row.
- **F04** — **no scale/unit sanity layer anywhere**. Nothing guards lakh/crore vs million/billion, currency mixing, or magnitude mismatch. The TMCV pool mixes a CapIQ "INR millions" export with crore-denominated Ind AS filings — a silent 10× error waiting to flow into an EV bridge or leverage ratio. The only lakh/crore mention (`valuation/MODULE_RULES.md:89`) is a *writing* instruction, not a check. **Fix:** capture each tab's declared unit/currency into the manifest; assert two sources for the same anchor agree within tolerance after normalization; flag >3× divergence as a hard error.
- **F23** — period age is inferred from filename/mtime, but mtime is the **Drive sync date**, so every TMCV file shows the run date as "Last Modified" and a 2-year-old re-synced export reads as 0 months old. **Fix:** parse the reporting period from inside the extracted text; never trust mtime as recency for Drive-synced files.

### C. Verifiability and citation hygiene
- **F13** — the §5 vague-citation ban and the `[Source, Period, Page]` format are stated centrally but restated in only ~6 of 52 specialist bodies and are mechanically unenforced. **Fix:** a one-line banned-citation reminder in each specialist self-check + a cheap `eval` lint.
- **F14** — two module source hierarchies **invert CLAUDE.md §4**: vendor data (Capital IQ/Bloomberg) ranked *below* transcripts and decks. **Fix:** reconcile to §4, or document the reordering as intentional.
- **F15** — `earnings/06` emits a numeric "Severity /100" inverted score with **no inversion flag** in its header, violating §12 while the rest of the engine flags inverted scores consistently. **Fix:** `Severity /100 *(higher = WORSE, inverted)*`.

### D. Provenance and consistency
- **F07** — after a resume, **the run-of-record asserts the opposite of what shipped**: `analyses/TMCV_2026-06-07/RUN_METADATA.md:49-60` says valuation "aborted," catalyst "not started," synthesizer "skipped (no final_thesis.md)" — yet the folder contains `final_thesis.md`, `memo.md`, `decision_record.json`, and both deferred-to module syntheses. For a system whose value proposition *is* provenance, the metadata misdescribes the artifacts. **Fix:** regenerate `RUN_METADATA.md` + `audit_dossier.md` as a final step that globs the actual folder; fail the commit if `final_thesis.md` exists but metadata says "skipped."
- **F06** — the fail-fast abort gate and the cockpit watcher **disagree on what "Insufficient" means**. The orchestrator (`MODULE_PIPELINE.md:153`) greps for the literal phrase `insufficient[ ]+data`, but every triage template documents a bare `**Verdict:** Sufficient / Partial / Insufficient` (the word "data" omitted), while the watcher (`verdict.ts:62-63`) matches bare "insufficient." So a module can render "**Verdict:** Insufficient," fail the orchestrator's grep, **not abort, and run all downstream layers on data it declared insufficient.** **Fix:** make both consumers share one matcher; fix the triage templates to render an unambiguous verdict line.
- **F30 / F32** — standalone module commands pull cross-module upstream from the latest folder of *any* date (no same-run guard), so today's earnings run can feed last month's business-model synthesis (F30); and `depends_on` enforces order but **never a hard data-dependency** — a lost upstream is reported only as prose, never as a structured flag the synthesizer/decision_record can act on (F32). **Fix:** constrain the resolver to today's run root; emit a machine-readable `upstream_present:{dep:bool}` line.

### E. Prompt hygiene and drift surfaces
- **F40** — the business-quality prompt contradicts itself on factor count ("10 factors" at line 37 vs an 11-row table); the likely casualty is the 11th row — the §24 Filter-5 disruption-risk factor. **Fix:** "11 factors" + an `eval` assertion of 11 scored rows.
- **F41** — the master synthesizer is ~1,100 lines and the load-bearing gates (scenario-math reconciliation, verdict-locks, rating-cap precedence) sit deep, far from the output section the model fills last. **Fix:** extract a short "HARD GATES — re-read before writing §1 and §8" block immediately before the final output format.
- **F42 / F43 / F26 / F45** — verbatim numeric caps duplicated between MODULE_RULES and syntheses are a drift surface (F42); the business-quality aggregate is "judgment-weighted, not a strict average" with no band anchor — the loosest rubric in the set (F43); HCG's §14 "Math Validation" section published an inconsistent sensitivity figure (₹587/−9.1% vs correct ₹597/−7.57%) — the one block whose *sole purpose* is certified arithmetic (F26); and minor stated-and-wrong arithmetic recurs across committed runs (HCG "49×62/100 = 30.55" vs 30.38; BG DCF midpoint ~$105 vs computed ~$101) (F45). All point back to §1.

### F. Steelmanning and calibration
- **F37** — **no module synthesis forces the §8 bear-AND-bull steelman + a single named killer risk**; module disconfirmation is reduced to a directional upgrade/downgrade table, concentrating all red-teaming in the master alone. **Fix:** a short mandatory "Module Disconfirmation" block in each `99_*-synthesis`.
- **F38** — the master thesis has a dedicated "What Would Kill the Thesis" section but **no parallel standalone Bull-Case steelman** — constructive steelman is structurally weaker than destructive. **Fix:** add a "Bull Case (steelman)" section with equal rigor.
- **F39** — the eval loop checks disconfirmation *fields exist and are well-typed* but never scores their **quality** — a perfunctory bear case passes every gate. **Fix:** require `kill_criteria` to reference a metric/event/threshold (not "macro worsens").
- **F28** — the pre-mortem's recommended haircut (HCG 70→64) and the expectations-gap's variant read are **never reconciled into the published thesis or decision_record** — the reader sees only the pre-haircut confidence. **Fix:** stamp the pre-mortem-adjusted confidence into the final artifacts.

---

## §3 — What's right (31 verified strengths — the engine's moat)

These survived adversarial scrutiny and should be protected through any refactor.

**Doctrine is genuinely enforced, not decorative:**
- **F47** — all six §24 Rejector filters are turned into concrete score caps, Red-Flag IDs, and verbatim restatements in the owning module prompts.
- **F49 / F52** — the no-source-no-claim rule is implemented *and twice-observed on the most temptable numbers*; the financial-baseline agents **physically cannot** web- or memory-source (no `WebSearch`/`WebFetch` in frontmatter) — missing numbers must be flagged, not filled.
- **F51** — critical-red-flag, disqualifier, and distress verdict-locks are single-sourced and restated as non-averageable caps across all three layers.
- **F53** — unverified adverse integrity signal ("buzz") is neither acted on as fact nor discarded — it's explicitly routed to investigation (the §24 Filter-1 discipline).
- **F50** — the §21 plain-English rule and per-module banned-phrase lists are enforced at the point of output via per-specialist self-checks.
- **F68** — management-adjusted numbers are labeled "management-defined" at every use, with the GAAP-vs-adjusted gap foregrounded.

**Decision discipline actually bites:**
- **F60** — all three committed full runs issue Avoid/Watchlist, refuse to force a Buy, and honor the caps.
- **F61** — the pre-mortem is structurally barred from *raising* conviction (`max(0, …)` haircut).
- **F62** — the master Decision Audit Trail forces per-driver Bull-vs-Bear adjudication with a named winner and bans averaging.
- **F63** — variant perception is forced to be evidence-backed (confidence-60 cap with no proven edge).
- **F64 / F66 / F67** — the "levels not bets" module/master boundary is enforced; EV bridges tie to the cent/paisa with no plug; forecast-ledger entries carry probability bands, time windows, and paired confirm+falsify triggers.

**The architecture is sound where it counts:**
- **F48** — the master synthesizer *does* hard-code the §10 scenario/EV reconciliation and §11-12 cap arithmetic as a pre-write gate (the intent is right; F08/F09 are that it isn't *executed*).
- **F54** — a single canonical extractor is shared by triage, cockpit, and verify-evidence, with per-tab splitting and a full machine manifest.
- **F55** — `verify-evidence`, *when it runs*, is a genuine resolver: it distinguishes fabrication from extraction-failure and rejects coincidental matches.
- **F57** — admission is a carefully layered, atomic race-killer (write-overlap, DAG ancestry, upstream-in-flight).
- **F58 / F59** — formula *definitions* are rigorous and economically sound (FCFF identity, growth, bps gates); `eval` check F (review-schedule date math) is a correct, fully deterministic invariant — **the exact pattern to copy for F08.**
- **F65** — the §26 self-declared data-readiness contract is real (catalyst declares it in triage frontmatter; the server consumes it generically — zero-touch works).

---

## §4 — Dismissed on verification (intellectual honesty)

Three findings were thrown out because the *auditor* had fabricated or misread its evidence — itself a live demonstration of the F09/F12 thesis that LLMs confidently produce wrong specifics, and the reason to trust the adversarially-verified set over the raw 95:
- **F10** (claimed `verify-evidence` rubber-stamped a "= −11" vs true −11.55 in BG) — **refuted: the cited exhibit does not exist in the BG report.** The auditor invented it.
- **F29** (claimed two HCG anchors don't trace to the pool) — **refuted: misrepresented a literal-string-extraction limitation as a hallucination.**
- **F46** (claimed BG buried a weak SOTP number) — **refuted: the module genuinely caveats it; quotes were read out of context.**

---

## §5 — What needs live data to validate (and the focused ask)

The static audit settles every *design* question. What it cannot settle is **how often the weaknesses actually bite on real data** — because the input pool is absent here. 31 such items were logged; they cluster into a single high-value test.

**The one data set worth uploading: a recent Indian, binary-export-heavy pool — ideally re-mount `data/TMCV/` or `data/NIVABUPA/`, or a fresh name with the same shape.** That single pool exercises the riskiest, least-verifiable steps at once:

1. **Extraction under contention (F02/F24/F34)** — run `extract_pool.py` single-threaded, then via `/research:full` with the 6 triage agents racing, and compare manifest failure counts. This is the bug that silently dropped 7 of 19 TMCV workbooks; it's non-deterministic (NIVABUPA had 0 failures) so it can only be reproduced live.
2. **The data-gap contract (F18/F19/F20/F03)** — best tested on a pool that genuinely lacks a price *and* a consensus export, and on a **globally famous ticker** (well-represented in training data) whose shareholding/Form-4 files are absent — to see whether the model invents a plausible "web" price/consensus/insider stake behind an "unverified" label, or correctly flags the gap and caps the score.
3. **The resolver's real false-negative rate (F05/F13)** — seed one specialist output with a plausible-but-fake citation ("FY24 Annual Report, Note 18" that isn't there) and run `verify-evidence`: does it catch it or rubber-stamp it?
4. **Whether any math is ever executed (F09/F11/F12)** — watch a live valuation/synthesizer run and independently recompute the DCF PV, EV bridge, stressed leverage, and probability-weighted return in Python; diff against what the agent published, to quantify the real arithmetic error rate beyond the one TMCV sign-flip already found.
5. **The abort path that has never fired (F06)** — point a module at a pool its triage must reject (e.g. a bank for balance-sheet-survival) and confirm it actually aborts.

**You do not need to upload anything for me to start fixing the framework** — items §1 and most of §2 are prompt/eval changes provable against the committed fixtures. Upload the one pool only when you want to *empirically confirm* the extraction and data-gap behaviors (items 1-2 above), which are the two that most depend on real file internals and a model's memory of a real company.

---

## §6 — Prioritized fix list (highest leverage first; most are zero engine-code)

1. **Wire a deterministic finish gate into `/research:full` before commit** (F01/F08/F17) — recompute scenario math + assert caps/verdict-locks; block "done" on violation. Persist the scenario block to `decision_record.json` so `eval` can see it. *(Highest leverage — closes the ship-path hole and makes F08's check possible.)*
2. **Require executed arithmetic in every numeric agent** (F09/F11) — "every derived number is produced by a Bash/Python snippet; paste the command + result." Prompt-only.
3. **Derive the headline scorecard from the validated block + strip scratch-thinking** (F12) — and have `eval` grep for leaked "let me recalculate" phrases.
4. **Harden extraction** (F02/F24/F34/F35) — retry+lock / copy-to-tmp, `reset_dimensions`, no caching of transient failures, OCR/`.pptx` status rows. Run the extractor once before agents.
5. **Tighten the data-gap contract to the price-path standard** (F19/F20/F03) — pool-first, verbatim unverified label, propagated caps; triage reads the manifest and treats `fail` as missing.
6. **Add a unit/scale sanity check** (F04) — declared-unit capture + magnitude reconciliation across sources.
7. **Add a deterministic citation resolver** (F05/F13) + make the abort-phrase matcher shared and robust (F06).
8. **Regenerate run metadata from the on-disk artifact set** (F07) — fail commit on metadata-vs-reality mismatch.
9. **Force symmetric steelman at module + master level and score its quality** (F37/F38/F39); reconcile the pre-mortem haircut into the published thesis (F28).
10. **Prompt hygiene** (F40/F41/F14/F15/F42) — fix the 10-vs-11 contradiction, hoist the hard gates, reconcile the inverted hierarchies, flag the inverted score.

*Items 1, 5, 7 (validator + finish gate) touch `launcher.ts`/a new Python resolver; everything else is prompt or eval-harness text — consistent with the engine's own "zero-touch" doctrine (§26).*
