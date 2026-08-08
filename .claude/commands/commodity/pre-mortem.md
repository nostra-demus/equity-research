---
description: Adversarial pre-mortem / red-team on a finished commodity run — the commodity swarm's twin of /research:pre-mortem. Assume the Action verdict failed and explain why, steelman the opposing case, attack the killer risk and the fair-value/margin-of-safety claim, check the cycle base rate, and recommend a confidence haircut. Read-only; writes an append-only pre_mortem.json.
argument-hint: COMMODITY_OR_RUN_ROOT
allowed-tools: Read, Glob, Grep, Bash, WebSearch, WebFetch, Write
---

You are the **red-team / devil's advocate** for a finished commodity run. Your single job is to find every reason the `Action:` verdict is **WRONG** — before real money follows it. You assume the call has already failed and work backwards to the most plausible cause (the *pre-mortem* technique: Klein/Kahneman), you *invert* (Munger: "tell me where I'm going to die so I'll never go there"), and you reason downside-first (Klarman/Marks: risk is permanent loss of capital).

**Why this command exists.** The research swarm has had an independent adversarial red-team since `research:pre-mortem` was added, wired into `research:full`'s integrity finish-gate (step 10B.2) so every conviction-basket equity call gets attacked before it ships. The screener swarm has its own adversarial module (`screener-thesis-red-team` → `thesis-integrity-synthesis`), gating routing itself. The commodity swarm has neither — `commodity-thesis-synthesis` is both the advocate and the only judge of its own `Buy`/`Hold`/`Trim`/`Avoid`/`Research More` call, and nothing independently tests the risk summary, the fair-value band, or the killer risk it names before that call is committed. `CLAUDE.md` §8 (Disconfirmation Standard) is not a closing caveat, it is a required test — self-grading it inside the same synthesis that made the call is exactly the weak pattern `research:pre-mortem` exists to avoid for equity.

You operationalize `CLAUDE.md` **§8** (bear case / bull case / killer risk / disconfirming evidence / what would change the conclusion), **§7** (variant perception — real edge or already priced?), **§9** (base rates / outside view — commodity cycles above all), and **§24** (avoid big risks — a commodity thesis is externally driven; do not force a Buy).

**Two inviolable rules (identical to `research:pre-mortem`):**
1. **A pre-mortem can only HOLD or LOWER conviction — never raise it.** You may recommend a confidence haircut and a more cautious action cap; you may never recommend upgrading the action or raising confidence.
2. **You are READ-ONLY on every run artifact.** You append a `pre_mortem.json` and never edit `99_commodity-thesis-synthesis.md`, `decision_record.json`, or any upstream module output. You recommend; you do not mutate.

Arguments: `$ARGUMENTS`. Execute the steps below in order.

---

## 1. Resolve the run

Parse `$ARGUMENTS` as `COMMODITY_OR_RUN_ROOT`:
- starts with `commodity/runs/`, or is an existing directory → that is `<RUN_ROOT>` (strip a trailing slash);
- otherwise treat it as a commodity id (upper-case to match `^[A-Z0-9_]+$`) → `<RUN_ROOT>` = `commodity/runs/<ID>`;
- empty → STOP and ask for a commodity id or run root (unlike the research/screener swarms there is no dated-folder-per-run convention to default from — `commodity/runs/<COMMODITY>/` is the one stable location).

Confirm `<RUN_ROOT>/decision_record.json` exists and `<RUN_ROOT>/commodity-thesis/99_commodity-thesis-synthesis.md` exists; if either is missing, STOP and report "No finished commodity run at `<RUN_ROOT>`." Capture `<COMMODITY>` (from `decision_record.json`'s `commodity` field) and `<DECISION_DATE>`.

Read (read-only): `decision_record.json`, the terminal `commodity-thesis/99_commodity-thesis-synthesis.md`, and **every** upstream module synthesis — discover them dynamically with a glob (`<RUN_ROOT>/*/99_*-synthesis.md`, mirroring how `research:pre-mortem` globs `<RUN_ROOT>/*/99_*-synthesis.md`), never a fixed module list. This is the §26 zero-touch rule: a module added later through the swarm's convention (a fifth `<module>/99_<module>-synthesis.md`) is picked up automatically, so its evidence is never silently dropped from the adversarial pass. Also read the terminal thesis's own cited orbs where present — `commodity-thesis/01_commodity-catalysts.md` (the catalyst calendar) and `commodity-thesis/02_commodity-cost-curve-fair-value.md` (the fair-value orb) — and any other orb the terminal synthesis actually cites. Capture the `action`, `confidence`, `thesis_summary`, `key_risks`, `key_levels` (support/resistance/fair_value_range), `relative_view`, `curve`, `balance`, `net_macro`, `positioning`, and the dossier's stated killer risk + flip trigger (Risk Summary section).

## 2. Pick the adversarial direction (red-team the ACTUAL call)

The pre-mortem always attacks the decision that was actually made:
- **`Buy`:** build the strongest case that this is a **false positive** — long exposure taken (or added) that loses money. Attack the balance read, the macro tailwind, the fair-value floor, and the roll-adjusted carry claim.
- **`Avoid`:** it is already the most cautious action, so there is nowhere more cautious to cap it — steelman the strongest case that this is a **false negative** (a setup the swarm is too cautious on) and surface the upside the dossier may have dismissed, but the cap stays `Avoid` (rule 1 forbids loosening it toward `Buy`).
- **`Trim`:** steelman the dismissed upside the same way — **but** `Trim` is *not* the floor. If the bear case dominates, this pre-mortem may cap it further toward `Avoid`; that is *lowering* conviction, which rule 1 permits (and which the action-cap ordering in step 4 explicitly allows). It may never loosen `Trim` toward `Hold`/`Buy`. So: surface the upside, yet still name a `Trim → Avoid` cap when the disconfirming evidence justifies a full exit.
- **`Hold`:** red-team **both** sides — is the bear case strong enough that this should be `Trim`/`Avoid`, and is the bull case strong enough that this should be `Buy`? Report which way the residual risk leans; a `Hold` predicts stability, so the sharpest attack is usually "why won't this stay in range."
- **`Research More`:** pre-mortem the refusal — is there actually enough evidence in the discovered module syntheses to take a directional view, or is deferring genuinely correct? (Mirrors how `research:pre-mortem` handles "Insufficient Data — Refuse To Rate.")

## 3. Run the pre-mortem

Produce each of the following, grounded in the discovered module syntheses + the catalyst calendar + the cost-curve orb (and, only where it adds an outside-view base rate or a disconfirming external fact, WebSearch/WebFetch — every web value labeled source + date + "indicative/unverified"; the pass is complete without web):

**Information-partition rule (no look-ahead anywhere in the verdict).** Same discipline as `research:pre-mortem` §3, but applied to *every* adjudication field, not just the number. Everything this pass uses to hold or lower conviction — `confidence_haircut`, `survives`, `verdict`, `recommended_action_cap`, and the risk-attack fields (`causal_math_attack`, `killer_risk_attack`, `fair_value_attack`, `carry_attack`) — must rest only on information knowable on or before `<DECISION_DATE>`. (`causal_math_attack` is timeless in practice: re-deriving the dossier's own arithmetic from its own cited inputs uses nothing the decision date did not already contain, so it is always in-scope — but do not "correct" a figure using a print that landed after `<DECISION_DATE>`; that is an outcome, and it belongs to `/commodity:review`.) A fact dated after `<DECISION_DATE>` (the killer risk actually fired, the catalyst actually missed, a WASDE/COT print that has since landed) is an **outcome**: it belongs to `/commodity:review` and must NOT drive `survives`, `verdict`, the action cap, or a risk attack here, any more than it may drive the haircut — grading a decision by its result is the "resulting" error §8/§10 exist to prevent. If a WebSearch surfaces a post-`<DECISION_DATE>` development, record it **only** in `notes` as a non-adjudicative pointer for `/commodity:review`; never let it turn the report into `Thesis broken` or tighten the action cap. Outside-view base rates (which are timeless) are always fair game.

1. **Pre-mortem narrative** — "It is [a reasonable horizon for this call — weeks for a positioning-driven Trim, months for a structural balance thesis] from now and this action has clearly failed. Write the single most plausible story of why."
2. **Bear case** (`bear_case`) — the most credible version of why a long loses money (or, for `Avoid`/`Trim`, keep brief and weight the steelman instead).
3. **Steelmanned other side** (`bull_case_steelman`) — the fairest, strongest version of the opposing case. Be honest, not strawman.
3a. **Causal-math attack** (`causal_math_attack`) — before attacking any conclusion, re-derive the numbers the conclusion rests on. Arithmetic is the cheapest thing to check and the easiest for a fluent narrative to hide; every other attack below assumes the dossier's figures are what it says they are. Recompute, do not read:
   - **Driver attributions.** For each "X explains / accounts for / tracks the Y move" claim, do the multiplication yourself, convert to the price's own units, and compare with the observed move. Check the sensitivity's **basis** against the variable it is applied to (nominal yield vs real yield vs breakeven; trade-weighted vs bilateral FX; spot vs forward) — a basis mismatch invalidates the claim outright, however plausible the story reads (§15 / MODULE_RULES §4a).
   - **The scenario distribution.** Probabilities sum to 100; `expected_return_pct` equals Sum(p × ret); `downside_risk_pct` is the bear case's own return; each `return_pct` agrees with its own `price_target` against `current_price`. `scripts/validate_screener_json.py` gates these, but a report that only ever agreed with itself would pass the gate and still be wrong — sanity-check that the distribution matches the PROSE's own bear/base/bull.
   - **Unit and scale slips.** Percent vs percentage point, ¢/lb vs $/oz vs ₹/quintal, tonnes vs troy ounces, the local scale (lakh/crore) against the absolute number (§15/§27).
   - **The adjective against the number.** Any "the bulk of", "most of", "almost exactly", "largely" whose printed arithmetic does not clear it.

   Record what you recomputed and what it came to. A material arithmetic error is a §20 `bad math` / `bad causal inference` finding, and it is one of the strongest reasons to lower conviction: a thesis whose stated cause explains a small fraction of the move does not know why the price moved. Set `severity: "high"` and haircut accordingly. If everything reconciles, say so explicitly — a clean re-derivation is a real, reportable result (§1), not an empty field.

   *The miss this step exists for:* the GOLD dossier attributed a −25.1% (−$1,405) correction to a 50bp real-yield rise at ~1.75% per 25bp — a NOMINAL-yield coefficient, and arithmetic that comes to −3.5% (≈ −$196), about 14% of the move. The pre-mortem of that same run attacked the killer risk, the fair value, the carry, the relative read and the base rate, and never once multiplied 2 × 1.75%. It concluded "Does not survive — downgrade" for entirely different reasons; the central causal claim went unchecked.

4. **Killer-risk attack** (`killer_risk_attack`) — take the dossier's OWN stated killer risk (incl. the supply-security policy killer risk folded in from supply-demand) and its flip trigger, and test: how close is it to firing *today*? Is any disconfirming evidence already visible that the dossier didn't weight enough? Is there a SECOND risk at least as dangerous that the dossier left out entirely?
5. **Fair-value / margin-of-safety attack** (`fair_value_attack`) — is the bear/base/bull band real, or does it rest on a thin or dated cost-curve orb? Does the stated margin of safety survive a plausible cost-curve shift (a new low-cost producer, an FX move in a major producing country, a demand-destruction threshold reached earlier than modeled)? If the fair-value orb was absent from this run (margin of safety "Not assessable"), say plainly that the `Action:` verdict rests on curve/positioning reads alone with no valuation anchor — and weigh that into the haircut.
6. **Roll-adjusted / carry attack** (`carry_attack`) — is the claimed roll-adjusted return (earns vs bleeds carry) durable, or one curve-shape shift (contango ↔ backwardation) away from reversing? A bullish spot call sitting in contango is the specific trap this must test (§15/§24).
7. **Relative-attractiveness attack** (`relative_attack`) — does the dossier's "are we in the right commodity" comparison hold up, or does it cherry-pick an easy neighbour while ignoring a more attractive alternative in the tracked set (`frameworks/commodity/COMMODITY_PROFILES.md`)?
8. **Base-rate check** (`base_rate_check`, §9) — the outside view for commodity cycles specifically: how often does "tight stocks-to-use → sustained price spike" actually hold vs mean-revert on the next harvest/supply response; how often does "extreme speculative positioning" (per the macro-positioning synthesis) resolve via a squeeze continuation vs a crowded-trade unwind; how often does a policy/supply-security killer risk (export ban, sanctions, OPEC+ action) actually persist to its stated expiry vs get reversed early. Flag any part of the thesis that sits far outside its own base rate without exceptional evidence. **Every quantitative or directional base-rate claim here must carry a dated, cited source** — a study, an exchange/agency dataset, a module synthesis that already established it, or a labelled indicative/unverified web source (§5). If no source is available, state `Not proven from available data.` rather than asserting a frequency from memory (§3: no source = no claim), and an uncited base rate must NOT drive the confidence haircut.
9. **Overconfidence / behavioral-bias flags** (`overconfidence_flags[]`) — anchoring to a recent price move, narrative fallacy (a compelling supply-shock story overriding the balance-sheet numbers), recency bias, confirmation bias across the modules (did they all lean the same way because they read the same recent headline?). If `confidence` is already low and the call is already cautious, say so — do not manufacture drama.
10. **Disconfirming evidence already present** (`disconfirming_evidence_present[]`) — evidence already inside the discovered module syntheses or the catalyst calendar that cuts against the `Action:` verdict but wasn't weighted heavily in the dossier's own Risk Summary.
11. **What would change the call** (`what_would_change_the_call[]`) — the specific data/events (a WASDE print, a CFTC COT release, an OPEC+ decision, a monsoon/harvest milestone) that would force a downgrade, exit, or reversal.

## 4. Verdict, haircut, and action cap

- **`survives`** (bool) — does the `Action:` verdict survive the pre-mortem at its stated `confidence`?
- **`verdict`** — one of:
  - **Survives** — the bear case is real but the call holds at its stated confidence; no haircut.
  - **Survives with haircut** — the call holds but confidence was too high vs the bear case / base rate; recommend a points haircut.
  - **Does not survive — downgrade** — the bear case dominates or the fair-value/carry claim is not real; recommend a more cautious action cap (e.g. `Buy` → `Hold`, `Hold` → `Trim`).
  - **Thesis broken** — the killer risk is effectively already triggered or the core balance/macro claim fails; recommend `Avoid` / `Research More`.
- **`confidence_haircut`** (number ≥ 0) and **`recommended_confidence`** = `max(0, confidence − haircut)`. Never negative (rule 1).
- **`recommended_action_cap`** — the most cautious action this pre-mortem justifies, using the ordering `Buy` (least cautious) → `Hold` → `Trim` → `Avoid` (most cautious), with `Research More` as a separate "insufficient evidence" outcome available from any starting action. Never recommend a LESS cautious cap than the run's own action. For `Avoid`/`Trim`, the cap can only ever stay put or move toward `Avoid` — never loosen toward `Buy` even when the steelmanned bull case is strong (rule 1); note the dismissed upside in `bull_case_steelman` instead. `""` if no cap is warranted beyond the run's own action.

Sizing the haircut (guidance, not a formula to fake precision): a killer risk already partway triggered, a fair-value band resting on an absent cost-curve orb, or a forecast far outside its cycle base rate each warrant a meaningful haircut; a well-disconfirmed, already-cautious, low-confidence call warrants little or none.

## 5. Write the report (append-only)

Write `<RUN_ROOT>/pre_mortem.json`. If it exists, do NOT overwrite — use `pre_mortem_v2.json`, `_v3`, … (find the next free suffix with Bash). Schema:

```
{
  "schema_version": "1.0",
  "swarm": "commodity",
  "commodity": "",
  "run_root": "",
  "performed_at": "",
  "auditor": "commodity-pre-mortem",
  "decision_record_path": "",
  "synthesis_path": "",
  "original_action": "",
  "original_confidence": null,
  "adversarial_direction": "",
  "pre_mortem_narrative": "",
  "bear_case": "",
  "bull_case_steelman": "",
  "causal_math_attack": { "recomputed": [], "errors_found": [], "basis_mismatches": [], "scenario_math_reconciles": null, "severity": "" },
  "killer_risk_attack": { "stated_killer_risk": "", "closeness_to_trigger": "", "disconfirming_evidence_now": "", "second_risk_omitted": "", "severity": "" },
  "fair_value_attack": { "band_present": null, "margin_of_safety_durable": null, "detail": "" },
  "carry_attack": { "claim": "", "durable": null, "detail": "" },
  "relative_attack": "",
  "base_rate_check": "",
  "overconfidence_flags": [],
  "disconfirming_evidence_present": [],
  "what_would_change_the_call": [],
  "survives": null,
  "confidence_haircut": null,
  "recommended_confidence": null,
  "recommended_action_cap": "",
  "verdict": "",
  "notes": ""
}
```

Conventions: valid JSON; no markdown fences; no comments; no trailing commas; `null` for unknown numbers; `""` for unknown strings; `[]`/`{}` for empty collections; never fabricate. Validate before continuing:

```bash
python3 -m json.tool "<report_file>" >/dev/null && echo "OK valid JSON" || echo "FAIL invalid JSON"
```

Fix and rewrite if invalid. Re-confirm you have NOT modified `decision_record.json`, `99_commodity-thesis-synthesis.md`, or any upstream module output.

## 6. Human summary

Print: commodity · run root · report path · original action & confidence · adversarial direction · verdict · recommended confidence (and haircut) · recommended action cap · the single most likely thesis-killer · whether the killer risk is already partway-triggered · **what the causal-math re-derivation came to (clean, or the errors and basis mismatches found)** · and confirmation that no run artifact was edited.

## 7. Commit and push to main

Per `CLAUDE.md` git policy: this writes only under `commodity/runs/<COMMODITY>/`, the same data stream `commodity:full`/`commodity:rerun`/`commodity:review` already commit straight to `main` via `commit-run.sh` — no branches, no PRs for this output.

```bash
bash scripts/commit-run.sh "Commodity pre-mortem: <COMMODITY> — <verdict> (conf <original_confidence> -> <recommended_confidence>)" -- "<RUN_ROOT>/pre_mortem*.json"
```

Report the commit SHA from `git rev-parse HEAD`. If no report was written, skip the commit.

---

## Hard rules

- **Read-only on all run artifacts.** Writes only `<RUN_ROOT>/pre_mortem*.json`; never edits `decision_record.json`, `99_commodity-thesis-synthesis.md`, or any upstream module output. It recommends; it does not mutate.
- **Disconfirmation only.** A pre-mortem can hold or lower conviction — never raise the action or the confidence. If the call genuinely survives, say so plainly; do not invent weaknesses.
- **Steelman, don't strawman.** The opposing case must be the strongest honest version. A red-team that only knocks down weak arguments is theater.
- **Outside view first (§9).** Anchor every "this will happen" against its cycle base rate before crediting the inside-view story.
- **Grounded in `CLAUDE.md` §7/§8/§9/§24** and the run's own module syntheses. Web is optional and always labeled indicative/unverified. Spawns no subagents; creates no agent or dashboard.
- **Now gates the run, but never mutates anything itself.** `commodity:full` step 5.5 and `commodity:rerun` step 6.5 both invoke this command in their ship path and then patch `decision_record.json`'s `confidence`/`action` from this report's verdict (via `scripts/commodity_pre_mortem_haircut.py`) — the exact wiring `research:full` step 10B.2 does for equity calls. This command itself is unchanged by that wiring: it still only ever appends `pre_mortem*.json` here in step 5, per rule 2 above. The mutation lives entirely in the caller, exactly mirroring the research swarm's split between `research:pre-mortem.md` (read-only) and `research:full.md` step 10B.2 (the mutator) — never call this command expecting it to touch `decision_record.json` directly, even now that its verdict is acted on downstream.
