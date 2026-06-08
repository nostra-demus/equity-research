# Framework Fixes — owner review log (2026-06-08)

Companion to **`FRAMEWORK_AUDIT_2026-06-08.md`**. Each fix below is one commit on the `claude/cranky-noyce-cb09f8` branch — **nothing is pushed to `main`**; this is for you to read and decide before merging. Every block: *what was the issue · what the fix does · why it's better · files · audit finding · how it was verified.*

**Design principles held throughout**
- Prompt/eval/schema changes only in Batch 1 — **zero engine-code (`ui/`) risk**, consistent with the repo's "zero-touch" doctrine (§26).
- New eval gates are **forward-looking** (activate for runs dated ≥ 2026-06-08), so the committed golden fixtures (BG/HCG/TMCV) stay green and history isn't rewritten — the same pattern the engine already uses for checks K/L.
- Every change carries an inline `*(fix F##)*` tag so you can `grep` the diff back to this log.
- **Verification:** the eval regression harness (`/research:eval all`) was run before and after — it now reports **PASS (3/3 runs)**.

---

## Batch 1 — the trust gap + two safe prompt fixes  ✅ committed to branch, eval PASS

### Fix 1 — Scenario math is now recomputed deterministically, not trusted  ·  finding **F08 (the one fatal)** + **F12**
- **Issue.** `eval.md`'s "deterministic gate" only *type-checked* the numbers (check E); it never recomputed the §10 scenario identities. The probability-weighted expected return — the single number that drives Buy vs Avoid — was enforced only by the model's mental arithmetic, and the scenario block lived only in `final_thesis.md` prose, invisible to any automated check. A committed run (TMCV) shipped a headline of **+4.3%** when its own body proved the true value was **−4.4%** (a sign flip).
- **Solution.** (a) Added a `scenarios[]` array to the decision-record schema (`{label, probability, return_pct, price_target}`), populated from the synthesizer's §8. (b) Added **eval check M** that recomputes `Σ(p×return)`, the prob-weighted target, and risk/reward from that array and FAILs if the published `expected_return_pct` / `risk_reward` disagree (1.0pp tolerance — catches sign flips). (c) The synthesizer must now **copy** the headline scorecard + decision-record numbers verbatim from one executed computation, so the headline can never contradict the body.
- **Why better.** Turns "the model says the math is right" into "a Python recompute proves it." It's the exact pattern of the engine's one *working* deterministic check (review-date math, check F), so it's idiomatic and reproducible. Catches the precise defect that already shipped.
- **Files.** `.claude/agents/synthesizer.md` (Step 4, §8, §14, decision-record table + field-type rules) · `frameworks/DECISION_LEDGER.md` (schema) · `.claude/commands/research/eval.md` (check M).

### Fix 2 — All decision-driving arithmetic must be *executed*, not done in the model's head  ·  findings **F09, F11**
- **Issue.** Every agent carries the `Bash` tool, yet not one was ever told to use it for math. DCF present-values, EV bridges, stressed leverage, fixed-charge coverage, the reverse-DCF root-solve, and the probability-weighted return were all mental arithmetic — the computation LLMs are least reliable at. The reverse-DCF (F11) hand-solves a nonlinear root (IRR/goal-seek) that *is* the engine's entire "what's priced in" read.
- **Solution.** Added a hard rule to the synthesizer's Step 4 and to the two DCF specialists' self-checks: derived numbers must be produced by an executed Bash/Python snippet, with the **command + result pasted**. The reverse-DCF must run an actual solver (`scipy.optimize.brentq` / bisection) for the implied-growth root and the two robustness re-solves.
- **Why better.** The capability was already present in every agent — this just points it at the numbers. Pure prompt change, no new tools, no engine code. Removes the single largest class of silent error at its source.
- **Files.** `.claude/agents/synthesizer.md` · `.claude/agents/valuation/05_reverse-dcf.md` · `.claude/agents/valuation/04_intrinsic-dcf.md`. *(The remaining numeric agents — scenario-and-fair-value, coverage-and-covenants, downside-stress-test, historical-financials — get the same one-line rule in Batch 2.)*

### Fix 3 — No model scratch-reasoning may leak into a committed thesis  ·  finding **F12**
- **Issue.** TMCV's committed `final_thesis.md` §8 contained raw self-correction text — `"= +4.3% ... let me recalculate correctly"` — i.e. the model's running scratch work shipped to the reader.
- **Solution.** Synthesizer §14 now states only the clean reconciled figures; added **eval check N** that greps a post-gate `final_thesis.md` for scratch markers ("let me recalculate", "recomputing", …) and FAILs if present.
- **Why better.** A published artifact should contain conclusions, not the model thinking out loud. Mechanically enforced, so it can't recur silently.
- **Files.** `.claude/agents/synthesizer.md` · `.claude/commands/research/eval.md` (check N).

### Fix 4 — The regression harness was permanently RED on binary-pool runs  ·  finding **F-EVAL-1** (found while verifying)
- **Issue.** Check A globs every `<run>/*` directory and demands a `99_*-synthesis.md` in each — but `_pool_extracts/` is the extractor's scratch folder, not a module. So **eval FAILed on every run that has a `_pool_extracts/`** (i.e. every Indian binary-pool run, including TMCV). A regression gate that's always red trains everyone to ignore it.
- **Solution.** Check A now skips underscore-prefixed non-module dirs (consistent with the engine's `_`-prefix "deactivated/scratch" convention).
- **Why better.** Restores the eval to a meaningful PASS/FAIL signal — without it, none of the new gates above would be trustworthy (a red suite hides new reds). Verified: TMCV flips FAIL → PASS; suite now **PASS 3/3**.
- **Files.** `.claude/commands/research/eval.md` (check A).

### Fix 5 — Factor-count contradiction that could drop the disruption-risk factor  ·  finding **F40**
- **Issue.** `business-quality` said "For each of the **10** factors" while its scoring table has **11** rows — the likely casualty being the 11th, the §24 Filter-5 *industry rate-of-change / disruption-risk* factor (a conviction-capping signal).
- **Solution.** Corrected "10" → "11" with a note tying it to the table and the §24 filter.
- **Why better.** Removes an internal contradiction that could make the model silently omit a Rejector-doctrine input. One-word fix, zero risk.
- **Files.** `.claude/agents/business-model/07_business-quality.md`.

### Fix 6 — Unflagged inverted score (violates §12)  ·  finding **F15**
- **Issue.** `earnings/06`'s "Accounting Trap" table emits a numeric `Severity /100` where **higher = worse**, with no inversion flag — violating `CLAUDE.md` §12 (every inverted score must be flagged), and risking a downstream reader treating a high severity as good.
- **Solution.** Header now reads `Severity /100 *(higher = WORSE — inverted)*`, matching how the rest of the engine flags inverted scores.
- **Why better.** Makes polarity unambiguous at the point of use. Consistent with §12 and the other modules. Zero risk.
- **Files.** `.claude/agents/earnings/06_earnings-quality.md`.

---

## Batch 3a — extractor format + dependency hardening  ✅ committed to branch, live-validated on the real CRM pool

### F-EXTRACT — the extractor routed by file extension, but Capital IQ's extensions lie  ·  supersedes audit **F35**, part of **F02**
- **Issue (found live on CRM).** CIQ exports masquerade: the 10-K shipped as a `.doc` that is actually **MHTML** (HTML wrapped in MIME); the two earnings transcripts shipped as `.rtf` that are actually **binary OLE2 Word**; the 7 data exports are real `.xls`. The old extractor keyed on extension, so it skipped the 10-K entirely and failed both transcripts — **the primary filing and the management commentary were silently dropped.**
- **Solution.** Added `sniff_format()` — detect the true format from magic bytes (OLE2 / zip / PDF / RTF / MIME-MHTML / HTML / text) and route on that, not the extension. Added readers for the mislabeled cases: `_read_mhtml()` (MIME→HTML→text, Python stdlib), `_read_doc()` (binary Word via macOS `textutil`, fed through a temp `.doc`), `_read_html()`. An OLE2/zip that isn't a workbook now falls through to the document reader instead of failing.
- **Why better.** Recovers 100% of a real-world CIQ pool that previously lost 3 of 11 files. Content-sniffing is robust to whatever extension a vendor slaps on. Verified: **11/11 sources, 0 failures**, 49 workbook tabs + the 10-K (698K chars, contains RPO/cRPO/SBC) + both transcripts + Key Developments.
- **Files.** `.claude/tools/extract_pool.py` (routing, three new readers, `--list-json`/`--text` made content-aware too).

### F-EXTRACT-DEP — the `.xls` reader library wasn't installed, and the failure was silent  ·  new (only findable live)
- **Issue (found live).** This machine's Homebrew Python 3.14 had **neither `xlrd` nor `openpyxl`**, and it's PEP-668 "externally-managed" so `pip install` is blocked globally. The extractor caught the `ModuleNotFoundError` and degraded every `.xls` to **"fallback-text"** (raw bytes = unreadable garbage) while reporting a soft success — so all financials/consensus/ownership data was quietly lost. The static audit could not catch this (the code imports `xlrd` and looks correct); only running it on the real machine revealed the missing dependency. No requirements file existed.
- **Solution.** (a) Ship an isolated, gitignored venv at `.claude/tools/.venv` with a committed `requirements.txt` + one-line `setup-tools.sh`. (b) `extract_pool.py` now **auto-re-execs under that venv** when the libs are missing in the calling interpreter (env-sentinel guard, no loop), so `python3 extract_pool.py …` just works regardless of which Python invokes it. (c) A genuinely missing reader now fails **LOUDLY** as `missing-dependency` with the exact fix command — never silent fallback-text.
- **Why better.** The engine becomes self-contained on a fresh machine, and a missing dependency can never again masquerade as a successful-but-empty extraction. Verified: running under the bare system `python3` (no libs) auto-bootstraps and extracts everything.
- **Files.** `.claude/tools/extract_pool.py`, `.claude/tools/requirements.txt` (new), `.claude/tools/setup-tools.sh` (new), `.gitignore` (`.venv/`).
- **Note for the owner:** the audit's recommended `--break-system-packages` was the wrong call for a PEP-668 machine; the venv + auto-re-exec is cleaner and touches nothing system-wide. This also realises the "loud-fail not silent fallback" half of audit **F02/F03**.

---

## Batch 2 — the integrity finish-gate  ✅ committed to branch, validator tested, eval green

### F01 / F17 — the run committed and pushed a thesis with NO in-path integrity check; caps were display-only
- **Issue.** `/research:full` wired only synthesizer → memo → audit-dossier → commit/push. The deterministic citation/math re-check (`verify-evidence`) and the red-team (`pre-mortem`) were opt-in and ran (if ever) *after* the run was committed to main. So a confidently-wrong thesis shipped first and was audited never-or-later — the exact gap that let TMCV's +4.3%/−4.4% headline ship.
- **Solution.** New **step 10B** in `full.md`, run AFTER the synthesizer and BEFORE the commit, in two parts: **(10B.1)** a deterministic Python validator that re-derives the §10 scenario math from `decision_record.scenarios[]` (probabilities sum to 100; headline `expected_return_pct == Σ(p×ret)` within 1.0pp), checks the missing-price and score-range caps, and **prepends a PROVISIONAL banner to `final_thesis.md`** on any hard inconsistency — so a wrong headline can never ship clean. **(10B.2)** invokes `verify-evidence` + `pre-mortem` in-path (reports written into the run folder, committed by step 12), feeds the pre-mortem confidence haircut into `RUN_METADATA`, and surfaces a `Failed` verification verdict loudly. Plus **eval check O**: a post-gate Selected/Short run must carry both reports, or eval FAILs (the wiring can't silently regress).
- **Why better.** Moves the no-source-no-claim + §10 math guarantee from "optional, after commit" to "enforced, before commit," without aborting the run (the thesis AND the gate verdict are both committed — a failure is visible, never hidden). The deterministic half always fires even if the LLM audits are skipped.
- **Validated.** The validator was run on synthetic data reproducing the TMCV defect (scenarios → −4.35%, headline +4.3%) → it printed `GATE: PROVISIONAL` and stamped the banner; correct math → `PASS`. Eval suite stays **PASS 3/3** (check O is N/A on the pre-date fixtures).
- **Files.** `.claude/commands/research/full.md` (step 10B, RUN_METADATA "Integrity gate", step-13 report) · `.claude/commands/research/eval.md` (check O).

---

## Batch 4 — data-gap prompts, abort-matcher, steelman  ✅ partial (committed to branch)

### F19 — consensus data-gap  ·  `earnings/04_guidance-consensus`
- *Issue.* The agent carries WebSearch/WebFetch but had no rule forbidding a web/memory Street estimate; for a covered name an LLM can produce plausible-but-fabricated "consensus" that silently sets the beat/miss bar and the rating.
- *Solution.* Consensus must come from a pool export; if absent → guidance-only read + the consensus-setup cap; any web consensus must carry the verbatim `web-sourced … unverified` label and still trigger the cap. (Prompt + self-check box.)
- *Why better.* Closes the gap in the prompt the model actually runs rather than hoping it recalls §5, and mirrors the already-hardened price path. (The CRM run showed the agent behaves with complete data — this protects the **thin-pool** case where the temptation to web-fill is real.)

### F20 — insider data-gap (highest memory-anchor risk)  ·  `management-governance/04`
- *Issue.* Insider stakes/sells/pledges are exactly the facts an LLM "knows" from training for a famous founder; the old rule only labeled web data "unverified" but still let it fire RF-OWN red flags and feed the governance score.
- *Solution.* A pool filing (shareholding-pattern / Form 4 / SAST-PIT / proxy) is now REQUIRED to fire any RF-OWN flag; a web/memory figure is context-only and caps the insider-behavior component. (Prompt + self-check.)
- *Why better.* A hard gate on the *consequential action* (the red flag) rather than a blanket ban — the agent can still report web context, but a fabricated stake or hallucinated sale can't reach the rating.

### F06 — abort-matcher robustness  ·  `MODULE_PIPELINE` step 4C
- *Issue.* The orchestrator's fail-fast grep required the literal "insufficient data", but the triage templates render a bare "Verdict: Insufficient" — so a module could fail to abort and run on data it declared insufficient, while the cockpit watcher (which matches bare "insufficient") disagreed.
- *Solution.* Made the trailing "data" optional (`insufficient([[:space:]]+data)?`), anchored to the verdict label so it ignores Sufficient/Partial/the menu line; now identical to `verdict.ts`.
- *Why better.* One robust matcher shared by both consumers — the orchestrator and the UI can never again disagree on whether a module aborted. Tested against every verdict form.

### F38 — master bull-case steelman  ·  `synthesizer.md`
- *Issue.* The synthesizer forced a *destructive* steelman (§10 What Would Kill the Thesis) but had no parallel *constructive* one, so disconfirmation was one-directional and the thesis under-defended the other side.
- *Solution.* Added **§9A Bull Case — Steelman**, the symmetric counterpart with equal rigor (the single strongest reason the engine could be wrong, evidence-cited, module-tied).
- *Why better.* Symmetric disconfirmation catches *both* error directions (wrongly rejecting and wrongly buying); it's a structural section the model must fill, not an optional closing caveat.

### F37 — module-level disconfirmation  ·  `business-model/99-synthesis` (pattern)
- *Issue.* No module synthesis forced the §8 bear-AND-bull steelman; module disconfirmation collapsed into a one-directional up/down score, concentrating all red-teaming in the master alone.
- *Solution.* A mandatory two-sided "Module Disconfirmation" block (strongest bear + strongest bull + killer risk + visible disconfirming evidence), added to the business-model synthesis as the canonical pattern.
- *Why better.* Forces the two-sided test at the layer that *owns the evidence*, feeding the master's §9A/§10. ⏳ **Rollout to the other 5 syntheses pending.**

**Still open in Batch 4:** F37 rollout (5 files) · **F05 citation resolver** (a deterministic Python grep-resolver + eval hook — the bigger build) · F03 (triage reads manifest fail-state as missing) · F07 (regenerate RUN_METADATA from the on-disk artifact set on resume) · F14 (the governance source-tier note — low-confidence/debatable). Extend executed-arithmetic to the 4 remaining numeric agents.

## Batch 5 — HIGH-priority data integrity  ✅ partial (committed to branch, tested)

### F05 / F13 — deterministic citation resolver  ·  `.claude/tools/resolve_citations.py` (new) + `verify-evidence`
- *Issue.* `verify-evidence` is itself an LLM told to "grep the number yourself" — the step that gets skipped. The committed HCG v2→v3 correction proves this auditor has asserted "verified" on figures it never grepped. "Verifiability" was a behaviour, not a mechanism.
- *Solution.* A new resolver actually greps each cited figure against the corpus and returns a machine `hit_count` — **token-matched** (`2442` never matches inside `0.092442`/`12442`/`2442.5`), comma/trailing-zero tolerant (`4.6` matches `4.60`), and `scaled_hit_count`-aware (hits only at ×1000/÷1000/÷1e7 → a likely million-vs-billion-vs-crore unit mismatch). Wired into `verify-evidence` as the **authority**: a rating-driver with `hit_count == 0` may NOT be marked `verified`. Plus a vague-citation lint (F13).
- *Why better.* Turns "the model says it grepped" into "the tool grepped" — the no-fabrication guarantee no longer rests on LLM honesty. The token-matching also removes the false positives a naïve grep makes. *Tested on synthetic data AND the live CRM corpus (net debt $30,711 → verifies; a fabricated number → rejected; found a real unit-mismatch gap that was then fixed).*

### F02 — extraction `Resource deadlock`  ·  `extract_pool.py`
- *Issue.* `xlrd`/`openpyxl` mmap'd the file over the Google Drive FUSE mount; the 6 triage agents racing on the same `.xls` hit a *recoverable* `OSError: Resource deadlock avoided` that the old code turned into a *permanent* extraction failure — silent loss of rating-driver exports on Indian binary pools.
- *Solution.* Read each workbook into memory (retry-guarded `_read_bytes_retry`) and feed the bytes to `xlrd file_contents=` / `openpyxl BytesIO` — no mmap — with bounded retry on the transient lock.
- *Why better.* Removes the failure at its cause (mmap-over-FUSE) *and* adds belt-and-suspenders retry, so a recoverable lock recovers instead of dropping data. *Re-tested on CRM: 12/12 sources, 0 failures.*

### F24 — `.xlsx` silent truncation  ·  `extract_pool.py`
- *Issue.* `read_only` `iter_rows` trusts the stored `<dimension>` tag; a stale/missing tag makes it stop early and drop trailing rows while the tab still reads "ok" — a silent truncation that looks like success.
- *Solution.* `ws.reset_dimensions = True` forces a real cell scan.
- *Why better.* One line removes a whole class of silent data loss — and the worst extraction bug is one that looks like a success.

### F04 — unit/scale capture  ·  `extract_pool.py`
- *Issue.* Nothing recorded a tab's scale/currency, so a CapIQ "INR millions" tab mixed with a crore-denominated filing was a silent 10× error with no signal anywhere.
- *Solution.* Detect each tab's currency/units header into the manifest (40/49 CRM tabs carry "Currency: US Dollar …").
- *Why better.* Surfaces the unit context downstream reads need, and pairs with F05's scale-aware resolver so a cross-unit mismatch is *caught at verify time* instead of flowing into a valuation/leverage number.

### F09 (rollout) — executed arithmetic on the 4 remaining numeric agents
- *Issue.* Coverage ratios, stressed leverage/break-points, growth/margins/TTM, and the scenario level math were still mental arithmetic in `coverage-and-covenants`, `downside-stress-test`, `historical-financials`, and `scenario-and-fair-value` — the computation LLMs are least reliable at.
- *Solution.* Added the "compute via an executed Bash/Python snippet (command + result shown), not mental arithmetic" self-check to all four.
- *Why better.* The same pattern the DCF/reverse-DCF agents were *observed executing* on the CRM run; pure prompt change, no new tools, removes ungrounded math at the remaining sites.

### F03 — triage treats a manifest failure as MISSING  ·  all 5 abort-capable `00`-triage agents
- *Issue.* Triage keyed sufficiency on annual+quarterly+transcript and treated failed CIQ exports as "supplementary, no effect" — so a pool that lost its entire estimates/peer/credit layer still passed "Sufficient" (the TMCV "Critical missing: None" hole).
- *Solution.* Each triage now reads `_pool_extracts/manifest.json` and counts any `fail` / `fallback-text` / `missing-dependency` source as NOT in the pool for the verdict and caps; a relied-on export in failure → Partial/Insufficient.
- *Why better.* Sufficiency now reflects what actually *extracted*, not what was uploaded — a hollow pool can't pass as complete, and the failure is reported, not silently absorbed.

**HIGH-priority block (F05/F13/F02/F24/F04/F09/F03) is now complete.**

## Batch 6 — MEDIUM (calibration + robustness)  ✅ partial (committed to branch, eval green)

### F37 (rollout) — module disconfirmation on all 6 syntheses
- *Issue.* Only business-model had the two-sided Module Disconfirmation block; the other 5 syntheses still collapsed disconfirmation into a one-directional score.
- *Solution.* Added the same domain-adapted block (strongest bear + bull + killer risk + visible disconfirming evidence) to earnings, valuation, balance-sheet-survival, management-governance, and catalyst, before §2.
- *Why better.* Every module now red-teams its own verdict at the layer that owns the evidence, feeding the master's §9A/§10 — disconfirmation is no longer concentrated in one place.

### F18 (rest) — web-price corroboration  ·  `valuation/01_price-and-capital-structure`
- *Issue.* A single unverified web quote could anchor the whole valuation (and for a famous ticker an LLM can hallucinate one), and `entry_price` could be set from it.
- *Solution.* A web price may anchor only if two independent sources agree within ~1%; `decision_record.entry_price` stays `null` when there's no pool price, margin of safety "Not assessable".
- *Why better.* Removes the single-source web/memory anchor risk while keeping a labeled indicative read; no paper trade strikes on an unverified number.

### F41 — synthesizer hard-gates hoist  ·  `synthesizer.md`
- *Issue.* The non-negotiables (executed scenario math, verdict-locks, rating-cap precedence, no-source-no-claim, symmetric disconfirmation) sat deep in an ~1,100-line prompt, far from where the model writes the verdict — easy to lose under load.
- *Solution.* A short "HARD GATES — re-read before §1 and §8" block placed immediately before the output (Part I), restating the five non-negotiables.
- *Why better.* Puts the load-bearing rules where the model is actively writing, improving adherence without changing the rules.

### F39 — disconfirmation / edge quality  ·  `eval` check P
- *Issue.* The eval checked that disconfirmation FIELDS exist and are well-typed but never their *quality* — a perfunctory bear case or a restated-consensus "edge" passed.
- *Solution.* eval check P (forward-looking): the variant perception must be non-tautological (edge ≠ what-everyone-knows; an explicit "no edge yet" is allowed) and `kill_criteria` must carry a concrete trigger.
- *Why better.* Mechanically catches a tautological edge / empty kill criteria — complements F37/F38 (which *require* the sections) by scoring their substance.

**Still open in Batch 6:** F07 (metadata regen on resume) · F28 (mostly covered by the finish-gate; full decision_record stamping pending) · F34 (cockpit cache, `ui/server`) · F30/F32 (handoff guards) · F23 (stale-data) · **F-SECTOR-1** (sector overlay — the big build).

## Still to come (next batches — not started)
- ~~**Batch 2 — the finish-gate (F01/F17)**~~ ✅ done above. *(Still open from Batch 2's scope: extend the executed-arithmetic rule to the remaining numeric agents — scenario-and-fair-value, coverage-and-covenants, downside-stress-test, historical-financials. The CRM run showed intrinsic-DCF/reverse-DCF already execute it; the rest should carry the same one-line rule.)*
- **Batch 3b — remaining extraction hardening (F02/F24/F34/F04):** ~~format + dependency handling~~ ✅ done in 3a above. Still open: retry+lock / copy-to-tmp for the concurrent `Resource deadlock` failures (F02 — needs a multi-`.xls` race to reproduce; CRM's single-pass run did not trip it), `openpyxl reset_dimensions` truncation guard (F24), stop the cockpit caching transient failures (F34 — `ui/server`), and the unit/scale sanity layer (F04 — lakh/crore vs millions). *(F04 is especially relevant now: CRM's CIQ financials are in USD millions while a future Indian name would be in crore.)*
- ~~**Batch 4 — data-gap contract, abort-matcher, steelman**~~ ⏳ partially done above (F19/F20/F06/F38 + F37 pattern). Remaining: F37 rollout · F05 citation resolver · F03 · F07 · F39/F28 · F14.
- **F-SECTOR-1 — sector-overlay layer** *(framework-level upgrade; ⏳ **REVISIT AFTER the CRM file analysis** — use the CRM run as the first concrete proof before deciding scope).*
  - *Issue.* The engine classifies the business type and uses it to pick the valuation *method* (DCF / DDM / NAV — genuinely sector-aware) and to refuse banks in the survival module — but **nothing keys required KPIs, sector-specific red flags, or the peer set off that classification.** `earnings/03_margin-drivers` has zero sector-KPI mentions; there is no SaaS / bank / REIT / insurer / miner template. KPI-driven names therefore get a *generalist* read and can miss the metric that decides the thesis (cRPO/NRR for SaaS; NIM/credit-cost/PCR/CET1 for a bank; FFO/cap-rate/occupancy for a REIT; AISC/reserves for a miner).
  - *Solution.* A self-declared `business-type → {required KPIs, sector red flags, valuation norm, peer set}` overlay that triage + the revenue/margin/quality agents consult, keyed off the **existing** `business-identity` classification. Build the *mechanism* + the 2–3 highest-value overlays (SaaS, financials, REIT); every uncovered sector falls to the generic path with an explicit *"no sector overlay — generic read"* flag (the engine already degrades this way elsewhere). Fits §26 zero-touch (overlays as self-declared data, no engine-code edits).
  - *Why better.* Lifts the engine from honest-generalist to sector-fluent on the names where the KPI grammar *is* the thesis — without a 15-sector build and without weakening the breadth-first refusal discipline.
  - *Why deferred to post-CRM.* CRM (SaaS) is the deliberate first proof: the run will show concretely what the generic path misses without a SaaS overlay, so the scope of sector depth to build is decided from a real example, not in the abstract. *(Generalises the "SaaS KPI supplement" must-add from the CRM file-scoping discussion.)*
  - **⟶ Post-CRM live finding (2026-06-08, validated on the real pool).** With the 10-K + transcripts present, the *generic* `revenue-drivers` agent surfaced the full SaaS KPI grammar **on its own, with no overlay and no KPI hint** — cRPO ($35.1B, +13% cc), total RPO ($72.4B), retention/attrition (~8%), AI/data ARR (Agentforce >$1B), subscription-by-offering, and it stripped Informatica M&A (+$399M) and FX (+1pp) out of organic. **So the capability is there; the real gap is *enforcement*, not analytical ability** — nothing *requires* those KPIs or *flags their absence*. On CRM (full data) it did not bite; on a thinner SaaS pool (only standardized CIQ financials, no 10-K/transcript) the engine would produce a KPI-blind read and triage would still pass "Sufficient". **Revised scope:** build F-SECTOR-1 as a *required-KPI checklist keyed to business-type that flags absence and caps sufficiency*, NOT a rebuild of the agents. **Severity revised down: medium** (was higher in the abstract).
- **Separate decision for you:** the `npm run dev` footgun (the web `dev` script rewrites committed snapshot files — the cause of the `−6,045` churn earlier). Recommend gitignoring `ui/web/public/data/` or moving the snapshot rebuild to `build` only.
- **Known data artifact:** TMCV_2026-06-07's committed thesis still has the F12 wrong headline (+4.3%) and the F07 metadata-says-aborted mismatch. The framework now prevents recurrence; correcting that specific historical artifact is your call (I can do it as a clearly-labelled correction commit if you want).
