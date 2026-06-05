---
description: Adversarial pre-mortem / red-team on a finished research run — assume the thesis failed and explain why, steelman the bear case, attack the kill criteria and the claimed edge, check the base rate, and recommend a confidence haircut. Read-only; writes an append-only pre_mortem.json.
argument-hint: RUN_OR_TICKER
allowed-tools: Read, Glob, Grep, Bash, WebSearch, WebFetch, Write
---

You are the **red-team / devil's advocate** for a finished research run. Your single job is to find every reason the thesis is **WRONG** — before real money rides on it. You assume the decision has already failed and work backwards to the most plausible cause (the *pre-mortem* technique: Klein/Kahneman), you *invert* (Munger: "tell me where I'm going to die so I'll never go there"), and you reason downside-first (Klarman/Marks: risk is permanent loss of capital).

You operationalize the root `CLAUDE.md` **§8 Disconfirmation Standard** — which already requires every thesis to state its strongest bear case, strongest bull case, the single killer risk, the disconfirming evidence already visible, what data would change the conclusion, and what would force a downgrade. This command turns that doctrine into a mechanical adversarial gate. You also apply §7 (variant perception — is the edge real or already priced?), §9 (base rates / outside view), §12 (scoring), and §13 (red-flag severity).

**Two inviolable rules:**
1. **A pre-mortem can only HOLD or LOWER conviction — never raise it.** Disconfirmation cannot manufacture confidence. You may recommend a confidence haircut and a lower rating cap; you may never recommend an upgrade or a higher confidence.
2. **You are READ-ONLY on every run artifact.** You append a `pre_mortem.json` and never edit `final_thesis.md`, `decision_record.json`, `RUN_METADATA.md`, or any module output. You produce a *recommendation*; you do not mutate the thesis.

Arguments: `$ARGUMENTS`. Execute the steps below in order.

---

## 1. Resolve the run

Parse `$ARGUMENTS` as `RUN_OR_TICKER`:
- starts with `analyses/`, contains a `/`, or is an existing directory → that is `<RUN_ROOT>` (strip a trailing slash);
- otherwise treat it as a ticker → latest run via `ls -1d analyses/<ARG>_*/ 2>/dev/null | sort -r | head -n 1`;
- empty → the most recent finished run: `ls -1d analyses/*/ | sort -r` and pick the first that contains `final_thesis.md`.

Confirm `<RUN_ROOT>/final_thesis.md` exists; else STOP ("No finished run at `<RUN_ROOT>`"). Capture `<TICKER>`, `<RUN_DATE>`, and `data/<TICKER>/`.

Read (read-only): `final_thesis.md`, `decision_record.json` (if present), every `<RUN_ROOT>/*/99_*-synthesis.md`, `RUN_METADATA.md`, and any module sub-agent file or `data/<TICKER>/` source you need. Capture `original_decision`, `original_confidence` (the confidence score), the thesis's stated bull/bear cases, kill criteria, variant perception, scenario model, and red flags.

## 2. Pick the adversarial direction (red-team the ACTUAL call)

The pre-mortem always attacks the decision that was actually made:
- **Long thesis (Strong Buy / Buy / Starter Position Only):** build the strongest **bear / short** case — argue this is a **false positive** (a bad idea selected).
- **Avoid / Short Candidate:** steelman the strongest **bull** case — argue this is a **false negative** (a good idea wrongly rejected). (You cannot "downgrade" an Avoid, but you must surface the upside the engine may have dismissed.)
- **Watchlist:** red-team **both** sides — is the bear case strong enough that this should be **Avoid**, and is the bull case strong enough (false negative) that it should be **Starter**? Report which way the residual risk leans.
- **Insufficient Data — Refuse To Rate:** pre-mortem the **refusal** — is there actually enough evidence to take a view, or is the refusal correct?

## 3. Run the pre-mortem (operationalized §8)

Produce each of the following, grounded in the dossier + data pool (and, only where it adds an outside-view base rate or a disconfirming external fact, WebSearch/WebFetch — every web value labeled source + date + "indicative/unverified"; the pass is complete without web):

1. **Pre-mortem narrative** — "It is [the thesis's time horizon] from now and this decision has clearly failed. Write the single most plausible story of *why* it failed." Force the imagination move that surfaces risks the bull case glosses over.
2. **Strongest bear case** (`bear_case`) — the most credible version of why the long loses money (or, for Avoid/Short, leave brief and put the weight on the steelman bull).
3. **Steelmanned other side** (`bull_case_steelman`) — the fairest, strongest version of the opposing case (§8 requires both). Be honest, not strawman.
4. **Killer risk** (`killer_risk`) — the single risk most likely to break the thesis.
5. **Kill-criteria attack** (`kill_criteria_attack[]`) — for each kill criterion in the thesis: how close is it to triggering *today*, is any disconfirming evidence already visible, severity. Flag any criterion that is partway or effectively already met.
6. **Variant-perception attack** (`variant_perception_attack`) — is the claimed edge **real and provable**, or already priced / not actually differentiated (Mauboussin/Marks second-level test)? State what evidence would prove the engine is NOT actually different from consensus. If the thesis already says "no proven variant perception," confirm that and note it caps conviction.
7. **Value-trap check** (`value_trap_check`) — is it cheap/expensive for a *reason*? Does the bull case require an unearned re-rating?
8. **Base-rate check** (`base_rate_check`) — the outside view (§9): what is the base rate for this kind of bet/forecast (e.g., a cyclical sustaining peak margins 12m; a leveraged roll-up de-levering on plan; a guided beat-and-raise holding through the back half), and does the thesis's implied odds respect it? Flag any forecast that sits far outside its base rate without exceptional evidence.
9. **Overconfidence / behavioral-bias flags** (`overconfidence_flags[]`) — check for anchoring, narrative fallacy, recency bias, confirmation bias, and overconfidence vs the base rate. If `original_confidence` is already low and the call is already cautious, say so — do NOT manufacture drama.
10. **Disconfirming evidence already present** (`disconfirming_evidence_present[]`) — evidence already in the dossier/pool that cuts against the decision.
11. **What would change the call** (`what_would_change_the_call[]`) — the specific data/events that would force a downgrade, exit, or rejection (§8).

## 4. Verdict, haircut, and rating cap

- **`survives`** (bool) — does the decision survive the pre-mortem at its stated conviction?
- **`verdict`** — one of:
  - **Survives** — the bear case is real but the decision holds at its stated confidence; no haircut.
  - **Survives with haircut** — the decision holds but confidence was too high vs the bear case / base rate; recommend a points haircut.
  - **Does not survive — downgrade** — the bear case dominates or the edge is not real; recommend a lower rating cap (e.g., Buy → Watchlist).
  - **Thesis broken** — a kill criterion is effectively already triggered or the core claim fails; recommend Avoid / Refuse To Rate.
- **`confidence_haircut`** (number ≥ 0) and **`recommended_confidence`** = `max(0, original_confidence − haircut)`. The haircut is **never negative** (rule 1).
- **`recommended_rating_cap`** — the most restrictive cap the pre-mortem justifies (e.g., "cap at Watchlist"), or "" if none beyond what the run already applied. Never recommend a less restrictive cap than the run's.

Sizing the haircut (guidance, not a formula to fake precision): a partway-triggered kill criterion, an unproven/absent edge, or a forecast far outside its base rate each warrant a meaningful haircut; a well-disconfirmed, already-cautious, low-confidence call warrants little or none.

## 5. Write the report (append-only)

Write `<RUN_ROOT>/pre_mortem.json`. If it exists, do NOT overwrite — use `pre_mortem_v2.json`, `_v3`, … Schema:

```
{
  "schema_version": "1.0",
  "ticker": "",
  "run_root": "",
  "performed_at": "",
  "auditor": "pre-mortem",
  "final_thesis_path": "",
  "decision_record_path": "",
  "original_decision": "",
  "original_confidence": null,
  "adversarial_direction": "",
  "pre_mortem_narrative": "",
  "bear_case": "",
  "bull_case_steelman": "",
  "killer_risk": "",
  "kill_criteria_attack": [],
  "variant_perception_attack": {},
  "value_trap_check": "",
  "base_rate_check": "",
  "overconfidence_flags": [],
  "disconfirming_evidence_present": [],
  "what_would_change_the_call": [],
  "survives": null,
  "confidence_haircut": null,
  "recommended_confidence": null,
  "recommended_rating_cap": "",
  "verdict": "",
  "notes": ""
}
```

`kill_criteria_attack[]` element: `{ "criterion": "", "closeness_to_trigger": "", "disconfirming_evidence_now": "", "severity": "" }`.
`variant_perception_attack` object: `{ "claimed_edge": "", "already_priced": null, "is_provably_different": null, "what_would_prove_not_different": "" }`.

Conventions: valid JSON; no markdown fences; no comments; no trailing commas; `null` for unknown numbers; `""` for unknown strings; `[]`/`{}` for empty collections; never fabricate. Validate before continuing:

```bash
python3 -m json.tool "<report_file>" >/tmp/premortem_check.json && echo "OK valid JSON" || echo "FAIL invalid JSON"
```

Fix and rewrite if invalid. Re-confirm you have NOT modified any original run artifact.

## 6. Human summary

Print: ticker · run root · report path · original decision & confidence · adversarial direction · verdict · recommended confidence (and haircut) · recommended rating cap · the single most likely thesis-killer · whether any kill criterion is already partway-triggered · and confirmation that no run artifact was edited.

## 7. Commit and push to main

Per `CLAUDE.md` git policy: commit straight to `main`, no branches, no PRs. Add only the pre-mortem report:

```bash
bash scripts/commit-run.sh "Pre-mortem: <TICKER> <RUN_DATE> — <verdict> (conf <original_confidence> -> <recommended_confidence>)" -- "<RUN_ROOT>/pre_mortem*.json"
```

Report the commit SHA. If no report was written, skip the commit.

---

## Hard rules

- **Read-only on all run artifacts.** Writes only `<RUN_ROOT>/pre_mortem*.json`; never edits the thesis, decision record, metadata, or module outputs. It recommends; it does not mutate.
- **Disconfirmation only.** A pre-mortem can hold or lower conviction — never raise a rating or confidence. If the thesis genuinely survives, say so plainly; do not invent weaknesses.
- **Steelman, don't strawman.** The opposing case must be the strongest honest version. A red-team that only knocks down weak arguments is theater.
- **Outside view first (§9).** Anchor every "this will happen" against its base rate before crediting the inside-view story.
- **Grounded in `CLAUDE.md` §8/§9/§7** and the run's own dossier + data pool. Web is optional and always labeled indicative/unverified. Spawns no subagents; creates no agent or dashboard.
