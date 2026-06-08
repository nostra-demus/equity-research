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

## Still to come (next batches — not started)
- **Batch 2 — the finish-gate (F01/F17):** wire `verify-evidence` + `pre-mortem` into `/research:full` *before* the commit; gate the "done"/Drive-copy on the verdict; add eval check O (a post-gate Selected/Short run must carry the integrity + red-team reports). Extend the executed-arithmetic rule to the remaining numeric agents.
- **Batch 3 — extraction hardening (F02/F24/F34/F35/F04):** retry+lock / copy-to-tmp for the `Resource deadlock` failures, `reset_dimensions`, stop caching transient failures, OCR/`.pptx` status rows, unit/scale sanity. *(These touch `ui/server` + `extract_pool.py`; best paired with a live-data run — see audit §5.)*
- **Batch 4 — data-gap contract (F19/F20/F03), citation resolver (F05/F13), abort-matcher robustness (F06), metadata regeneration (F07), steelman symmetry (F37/F38/F39/F28), source-hierarchy reconciliation (F14).**
- **Separate decision for you:** the `npm run dev` footgun (the web `dev` script rewrites committed snapshot files — the cause of the `−6,045` churn earlier). Recommend gitignoring `ui/web/public/data/` or moving the snapshot rebuild to `build` only.
- **Known data artifact:** TMCV_2026-06-07's committed thesis still has the F12 wrong headline (+4.3%) and the F07 metadata-says-aborted mismatch. The framework now prevents recurrence; correcting that specific historical artifact is your call (I can do it as a clearly-labelled correction commit if you want).
