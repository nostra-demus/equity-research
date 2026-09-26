#!/usr/bin/env python3
"""§10 scenario-integrity detectors: the span check and the conjunction-disclosure check
(CLAUDE.md §10), plus the cross-module sign-check presence gate (synthesizer.md Step 3b /
HARD GATE 7), the §10 HARD GATE 13 probability-basis presence/form check, the HARD GATE 11
kill-criteria trigger-test schema-presence check, the §19 / DECISION_LEDGER §6 forecast-
resolvability check, and the §8 bear-case / bull-case sanity checks (checks BA, AM, AR, AO —
each moved here from `scripts/eval.py`, where it was defined but never imported into the live
gate; see each check's own comment block below for why).

Side-effect-free, importable, doctrine logic — extracted from `scripts/eval.py` (checks
AT/AU/AV) so the SAME detection functions can run in TWO places instead of one:

1. **Retrospective** — `scripts/eval.py` imports these to grade already-committed runs
   (checks AT/AU/AV), as it always has.
2. **Live, pre-publish** — `/research:full` Step 10B.1 (the deterministic finish-gate that
   also runs on every `/research:rerun`, per fix F-RRGATE) imports these to check a thesis
   BEFORE it ships, stamping `final_thesis.md` PROVISIONAL on a violation instead of relying
   on a human remembering to run `eval.py` afterward — the same closure already done for the
   §24 rejector-filter caps (`rating_caps.py`), the Headline Scorecard / red-flag severity
   reconciliation (`headline_checks.py`), and the valuation-summary sidecar
   (`valuation_summary_checks.py`).

CLAUDE.md §10 exists BECAUSE of a real miss: an AMZN 2026-07-10 scenario set (bull +3.6% /
base -11.9% / bear -38.7%) summed to 100% and reconciled perfectly, yet its best case sat
inside one ordinary week's move — no scenario in the set contained the good quarter that
actually happened, and the stock closed 15% up two days later, above the top of the entire
distribution. The same bull case required four independent conditions to hold
simultaneously (AWS ≥35% growth AND D&A absorbed on a lag AND advertising rebounding AND NA
units growing), with nothing on record justifying why they would move together. Checks AT
(span) and AV (conjunction) were written to catch exactly this shape of defect; check AU
catches the companion failure on that same run — the thesis headlined a margin story the
engine's OWN margin-drivers module contradicted, with no line anywhere recording that the
two disagreed.

Until this module existed, AT/AU/AV ran only inside `scripts/eval.py` — a post-hoc grading
pass a human has to remember to run. A run could print the live finish-gate's `GATE: PASS`
and commit straight to `main` (CLAUDE.md §25/§28: research DATA bypasses PR review) with an
unspanned scenario set, an undisclosed conjunction, or a silent sign contradiction, and only
fail the retrospective check later — if anyone ran it. Importing this module into the live
finish-gate closes that hole the same way it was already closed four times before.

Each `eval_*` function is pure: given the decision date and the relevant scenario/thesis
data, it returns:
  - `None`  — not applicable (pre-gate date, or the input isn't in the shape being checked)
  - `[]`    — applicable and satisfied (checked, no violation)
  - `[...]` — one or more violation strings (the check fired)

No caller may treat a violation as fatal — CLAUDE.md §13's "never averaged away, never
silently absorbed" principle means a violation is always surfaced (a FAIL row, or a
PROVISIONAL banner), never used to abort a run outright.
"""
import re
import math
import datetime


# ---- check AT: the scenario set must SPAN the outcomes, not merely sum to 100% ----------------------
# CLAUDE.md §10 (span check). Probabilities that add up are necessary and NOT sufficient: a set can be
# arithmetically perfect and contain no state of the world resembling what happens.
#
# The miss: AMZN 2026-07-10 shipped bull +3.6% / base -11.9% / bear -38.7%. Perfectly summed, perfectly
# reconciled. Its BEST case was inside one ordinary week's move of the price — so there was no case in
# the set in which the thing that actually happened (a good quarter) could occur. The stock closed 15%
# up two days after the run's own test date, above the top of the entire distribution.
#
# The rule this enforces is the cheap half of §10's span check: if the best case is within the noise a
# liquid stock makes in a normal week, the set is too narrow to carry an expected return. (The other
# half — the conjunction check — needs the per-case CONDITION text, which decision_record.json does not
# carry; it stays a §10 prose rule enforced by the synthesizer, not here. Saying so plainly beats a
# brittle keyword count on prose that lives in another file.)
#
# Returns are POSITION-SIGNED (synthesizer.md §6): a short's winning case is also a POSITIVE return, so
# max() is the best case for either direction and no basket handling is needed.
AT_DATE = "2026-08-01"
AT_MIN_BEST_PCT = 5.0  # an ordinary weekly move on a large liquid name — below this the set spans nothing

def eval_at_scenario_span(decision_date, scenarios):
    """Check AT. None = N/A (pre-gate / no usable scenarios); [] = spans; [violation] = too narrow or
    a present return_pct is not numeric/coercible."""
    if not (_isdate(decision_date) and decision_date >= AT_DATE):
        return None
    if not isinstance(scenarios, list) or len(scenarios) < 2:
        return None  # a single case is not a set — check A/T owns the structural complaint
    present = [s.get("return_pct") for s in scenarios if isinstance(s, dict) and s.get("return_pct") is not None]
    # [PR#427 review fix] the live scenario-math block (full.md) coerces return_pct via float(...), so a
    # JSON-string value like "3.6" reconciles cleanly there. This check used to require the value already
    # be int/float and silently DROP anything else — a numeric-string scenario set would fall under 2
    # usable returns and go N/A, skipping the span check entirely on data the reconciliation block itself
    # accepted. Coerce the same way; a value that is present but still not coercible is a data-integrity
    # failure in its own right, not a soft absence.
    bad = [v for v in present if _tonum(v) is None]
    if bad:
        return [f"scenario return_pct contains {len(bad)} non-numeric/non-coercible value(s) ({bad[:3]!r}) "
                f"— the §10 span check cannot be evaluated on a value the live scenario-math reconciliation "
                f"would itself fail to parse cleanly"]
    rets = [_tonum(v) for v in present]
    if len(rets) < 2:
        return None  # no usable returns → nothing to measure
    best = max(rets)
    if best < AT_MIN_BEST_PCT:
        return [f"scenario set does not SPAN: the BEST case returns only {best:+.1f}%, inside an ordinary "
                f"weekly move (<{AT_MIN_BEST_PCT}%). No case in the set contains a good outcome, so the "
                f"probability-weighted return is an average over a distribution that excludes one side of "
                f"reality (CLAUDE.md §10 span check). Widen the cases before computing the expected return."]
    return []


# ---- check AU: the thesis must record its sign check against the owning module ----------------------
# synthesizer.md Step 3b / HARD GATE 7. The synthesizer may override the module that owns its driver —
# it adjudicates (§22) — but only IN WRITING. The check that was missing is not the override, it is the
# silence: on AMZN 2026-07-10 the thesis headlined "D&A compresses AWS margins" while the engine's own
# margin-drivers file said that same margin was RECOVERING (Tailwind, High confidence). Neither agreed
# nor disagreed was ever written down, so nothing could notice.
#
# This asserts PRESENCE, not correctness — whether the override was justified is a judgment no test can
# make. The absence of the line is what let the inversion pass silently, and absence is checkable.
AU_DATE = "2026-08-01"

def eval_au_sign_check_recorded(decision_date, thesis_text):
    """Check AU. None = N/A (pre-gate / no thesis); [] = recorded; [violation] = missing."""
    if not (_isdate(decision_date) and decision_date >= AU_DATE):
        return None
    if not thesis_text:
        return None
    # \b before 'sign' so an unrelated word ending in -sign ('design check', 'redesign checklist') can't
    # satisfy a HARD gate; [\s\-_]* so natural spacing variation ('sign check' / 'sign-check' / 'sign_check'
    # / 'sign  check' / 'sign - check') all register; no trailing boundary, so 'sign-checked' / 'sign checks'
    # still match. This asserts the line was RECORDED, not that it is correct.
    if re.search(r"\bsign[\s\-_]*check", thesis_text, re.I):
        return []
    return ["the thesis records no SIGN CHECK against the module that owns its driver (synthesizer.md "
            "Step 3b / HARD GATE 7). State it even when the signs AGREE — one line naming the module, its "
            "factor label and its confidence. The absence of that line is what let a thesis contradict its "
            "own module in silence."]


# ---- check AV: the §10 conjunction check must actually be WRITTEN, not just spanned -------------------
# CLAUDE.md §10 conjunction check: "If a case requires N independent conditions to be true SIMULTANEOUSLY,
# its probability must be justified against that conjunction ... Either decompose the conjunction into
# separate cases ... or state why all N genuinely move together." Check AT (above) mechanized the SPAN
# half of §10 but its own comment explicitly punted on this half: "the conjunction check ... needs the
# per-case CONDITION text, which decision_record.json does not carry; it stays a §10 prose rule enforced
# by the synthesizer, not here." That blocker is gone: DECISION_LEDGER.md §5's 2026-08-03 structured
# scenario authority added `conditions[]` and `joint_probability_basis` to every scenario row, and
# synthesizer.md's Field-type rules already instruct every run (not only Ideas-eligible ones) to "Explain
# the conjunction when multiple independent conditions must hold." Nothing has verified that instruction
# was followed since the data existed to check it.
#
# Same restraint as check AU: this is a PRESENCE/SCHEMA-CONSISTENCY check, not a truth check — it cannot
# judge whether a cited conjunction basis is actually correct, only that one was written when the schema
# requires it (2+ simultaneous conditions), and that the field is not misused where the schema reserves
# `null` (fewer than 2 conditions). The miss this guards against: a multi-condition bull case (the AMZN
# §10 example — AWS growth AND D&A absorbed on a lag AND advertising rebounding AND NA units growing, all
# at once) assigned a probability with nothing on record justifying why all N conditions move together.
AV_DATE = "2026-08-03"  # DECISION_LEDGER.md §5 structured-scenario-authority rollout
AV_MIN_BASIS_LEN = 20   # mirrors the ≥20-char "non-trivial" bar DECISION_LEDGER.md §18 already uses for error_defense_evidence

def eval_av_conjunction_disclosure(decision_date, scenarios):
    """Check AV. None = N/A (pre-gate, or no scenario in the set uses the structured shape yet); [] =
    every scenario's conditions[] / joint_probability_basis pair is schema-consistent; [violation,...] =
    at least one scenario either carries an empty conditions[] list, omits a required conjunction basis,
    carries a stray one, or the set is only PARTIALLY structured (some rows carry conditions[], others
    omit it or supply a non-list value) — a partial set (or an empty conditions[] row) can hide the exact
    multi-condition row this gate exists to expose, so each is a violation in its own right rather than
    silently dropped from the comprehension."""
    if not (_isdate(decision_date) and decision_date >= AV_DATE):
        return None
    if not isinstance(scenarios, list) or len(scenarios) < 2:
        return None
    structured = [s for s in scenarios if isinstance(s, dict) and isinstance(s.get("conditions"), list)]
    if not structured:
        return None  # not the structured scenario shape yet (pre-rollout record) — nothing to check
    if len(structured) < len(scenarios):
        return [f"{len(scenarios) - len(structured)} of {len(scenarios)} scenario(s) omit a structured "
                f"conditions[] list (or supply a non-list value) while at least one other scenario in the "
                f"same set uses it — a partially structured scenario set can hide the exact multi-condition "
                f"conjunction this gate exists to expose; every scenario must carry conditions[] once the "
                f"set adopts the structured shape (DECISION_LEDGER.md §5)"]
    out = []
    for s in structured:
        label = str(s.get("label") or s.get("scenario_id") or "?")
        conds = s.get("conditions")
        jpb = s.get("joint_probability_basis")
        jpb_txt = jpb.strip() if isinstance(jpb, str) else ""
        if not conds:
            # [PR#427 review fix] conditions=[] is a list, so it passed the `structured` filter above, but
            # DECISION_LEDGER.md §5 requires "each scenario has at least one condition" once the structured
            # shape is adopted — an empty list satisfied neither the >=2 branch nor the elif below, so it
            # silently returned no violation, hiding whether any conjunction exists at all.
            out.append(f"scenario '{label}' carries an empty conditions[] list — DECISION_LEDGER.md §5 "
                       f"requires at least one condition per scenario once the structured shape is adopted; "
                       f"an empty list hides whether a conjunction exists at all")
        elif len(conds) >= 2:
            if len(jpb_txt) < AV_MIN_BASIS_LEN:
                out.append(f"scenario '{label}' has {len(conds)} conditions that must hold simultaneously "
                           f"but joint_probability_basis is "
                           f"{'empty' if not jpb_txt else 'too short to be a real explanation'} — CLAUDE.md "
                           f"§10 requires stating why all conditions genuinely move together, or "
                           f"decomposing the conjunction into separate cases")
        elif jpb_txt:
            out.append(f"scenario '{label}' has only {len(conds)} condition(s) but still carries a "
                       f"joint_probability_basis ('{jpb_txt[:60]}') — DECISION_LEDGER.md §5 reserves this "
                       f"field for scenarios with 2+ simultaneous conditions; a value here either misuses "
                       f"the field or hides an undisclosed second condition")
    return out


# ---- check AM: a Selected/conviction long must carry a genuine bear case (§8/§16) -------------------
# CLAUDE.md §8: "state ... the strongest bear case ... the disconfirming evidence already visible ...
# what would force a downgrade or outright rejection." A "bear" scenario that is itself a GAIN is not a
# bear case at all — it fails §8's disconfirmation test before any other evidence is even weighed.
#
# The named worked failure: EMAAR_2026-07-03 published a "Starter Position Only" conviction long whose
# bear-labelled scenario carried a price_target ABOVE entry_price (bear +63.9%, no capital loss) — a
# Selected thesis that had never been tested against a genuine loss scenario, undetected until a later
# manual `eval.py` run.
#
# check AM existed only inside `scripts/eval.py` since 2026-07-17 — a post-hoc grading pass a human has
# to remember to run — so it was never available to the LIVE finish-gate (`/research:full` Step 10B.1),
# unlike its siblings AT/AU/AV/BA/BC in this module. A run could ship a Selected long with an all-upside
# scenario set, print the live gate's `GATE: PASS`, and commit straight to `main` (CLAUDE.md §25/§28),
# undetected until a later manual `/research:eval` run — the exact same class of hole already closed here
# for AT/AU/AV/BA/BC, left open for the one remaining scenario-shape check that had it. Moving it here
# (eval.py now imports it from this module) closes that hole without changing its logic or its
# retrospective grading.
AM_DATE = "2026-07-17"

def eval_am_bear_case_sanity(decision_date, decision, scenarios, entry_price):
    """Check AM: a Selected/conviction long (Strong Buy / Buy / Starter Position Only) must carry a
    genuine bear case — the bear-labelled scenario's price_target BELOW entry_price (a real downside
    branch). A "bear" scenario that is itself a gain (the EMAAR_2026-07-03 defect: bear +63.9%, no
    capital loss) fails §8's strongest-bear-case test and §16. Returns None (pre-gate / not a Selected
    long / no usable bear price target) or a list of violations (empty = pass)."""
    if not (_isdate(decision_date) and decision_date >= AM_DATE):
        return None
    if decision not in {"Strong Buy", "Buy", "Starter Position Only"}:
        return None
    if not (isinstance(scenarios, list) and isinstance(entry_price, (int, float)) and not isinstance(entry_price, bool) and entry_price > 0):
        return None
    bear = next((s for s in scenarios if isinstance(s, dict) and "bear" in str(s.get("label", "")).lower()), None)
    if not bear or not isinstance(bear.get("price_target"), (int, float)) or isinstance(bear.get("price_target"), bool):
        return None  # no usable bear price target to test
    if bear["price_target"] >= entry_price:
        return [f"Selected/conviction long but the bear-case price target {bear['price_target']} is not below "
                f"entry_price {entry_price} — no genuine downside branch (§8 strongest-bear-case; §16)"]
    return []


# ---- check AR: a Short Candidate must carry a genuine bull case — the mirror of check AM ------------
# The short-side mirror of check AM. A "Short Candidate" decision must carry a genuine bull case — the
# bull-labelled scenario's price_target ABOVE entry_price (a real squeeze/upside branch that is a genuine
# LOSS to the short position). A "bull" scenario that is itself at or below entry (no loss to the short)
# fails §8's strongest-bull-case test applied to the short's own disconfirming direction — the exact
# mirror of the EMAAR_2026-07-03 bear-case defect check AM guards against on the long side. Without this,
# a Short Candidate could ship with an all-downside scenario set that never prices the risk of being
# wrong, silently violating §8's symmetric-disconfirmation requirement for the one decision type check AM
# does not cover.
#
# Same history as check AM above: defined only inside `scripts/eval.py` since 2026-07-25, never available
# to the live finish-gate. Moved here for the same reason.
AR_DATE = "2026-07-25"

def eval_ar_short_bull_case_sanity(decision_date, decision, scenarios, entry_price):
    """Check AR: the short-side mirror of check AM. Returns None (pre-gate / not a Short Candidate / no
    usable bull price target) or a list of violations (empty = pass)."""
    if not (_isdate(decision_date) and decision_date >= AR_DATE):
        return None
    if decision != "Short Candidate":
        return None
    if not (isinstance(scenarios, list) and isinstance(entry_price, (int, float)) and not isinstance(entry_price, bool) and entry_price > 0):
        return None
    bull = next((s for s in scenarios if isinstance(s, dict) and "bull" in str(s.get("label", "")).lower()), None)
    if not bull or not isinstance(bull.get("price_target"), (int, float)) or isinstance(bull.get("price_target"), bool):
        return None  # no usable bull price target to test
    if bull["price_target"] <= entry_price:
        return [f"Short Candidate but the bull-case price target {bull['price_target']} is not above "
                f"entry_price {entry_price} — no genuine upside/squeeze branch, i.e. no real loss to the "
                f"short (§8 strongest-bull-case; mirror of check AM)"]
    return []


# ---- check BA: every kill_criteria row must carry the HARD GATE 11 trigger-test fields ------------
# synthesizer.md HARD GATE 11 requires three things per Thesis Kill Criteria row before it can publish:
# (1) a like-for-like comparable — same period a year earlier, same reporting basis — (2) the implied
# stub arithmetic where part of the period has already reported, and (3) whether the trigger would have
# fired on the last two reported periods (the "capable of failing" test). The markdown table even has a
# dedicated "Measured against" column. But `decision_record.json`'s `kill_criteria[]` (DECISION_LEDGER.md
# §5) was always a flat array of strings/loose dicts — none of HARD GATE 11's three checks ever survived
# into the machine-readable record, so nothing this harness (or the finish-gate) can see confirms the
# sweep happened. The named worked failure this rule exists for: a "gross margin holding at or above
# 26.3%" trigger that was silently benchmarked against the PRIOR FULL YEAR instead of the correct
# year-ago HALF, which the trigger could clear while margin was still falling year on year — the
# opposite of what it claimed to test.
#
# This is the presence/shape half only, matching the AT precedent: whether a stated comparable_basis is
# GENUINELY like-for-like stays the authoring LLM's judgment call (verify-evidence Section B/C already
# audits period-basis mismatches on request); this check only stops a future run from silently omitting
# the two structured fields HARD GATE 11 says every row must carry.
#
# check BA existed in `scripts/eval.py` since 2026-08-22 and graded every committed run retrospectively
# — but, unlike AT/AU/AV/BC, it was defined directly inside eval.py rather than in this importable
# module, so it was never available to the LIVE finish-gate (`/research:full` Step 10B.1). A run could
# ship a kill_criteria[] row missing comparable_basis or fired_last_two_periods, print the live gate's
# `GATE: PASS`, and commit straight to `main` (CLAUDE.md §25/§28) — the exact same class of hole AT/AU/AV
# closed for the §10 scenario checks and BC closed for HARD GATE 13, left open here by an accident of
# which file the function happened to be written in. Moving it here (eval.py now imports it from this
# module, same as AT/AU/AV/BC) closes that hole without changing its logic or its retrospective grading.
BA_DATE = "2026-08-22"

def eval_ba_kill_criteria_trigger_test(decision_date, kill_criteria):
    """Core of check BA. Returns None (N/A — pre-gate, or no kill_criteria to test) or a list of
    violation strings (empty list = every row passes). Side-effect-free + module-level so the
    selftest drives every branch fixture-free."""
    if not (_isdate(decision_date) and decision_date >= BA_DATE):
        return None
    if not isinstance(kill_criteria, list) or not kill_criteria:
        return None  # T flags a non-list kill_criteria; an empty list has nothing to trigger-test
    issues = []
    for i, e in enumerate(kill_criteria):
        if not isinstance(e, dict):
            issues.append(f"kill_criteria[{i}] is a plain string — HARD GATE 11 requires comparable_basis "
                           f"and fired_last_two_periods fields, which only an object row can carry")
            continue
        cb = e.get("comparable_basis")
        fl = e.get("fired_last_two_periods")
        if not (isinstance(cb, str) and cb.strip()):
            issues.append(f"kill_criteria[{i}] missing comparable_basis — the like-for-like period/basis "
                           f"this trigger is measured against (HARD GATE 11 check 1)")
        if not isinstance(fl, bool):
            issues.append(f"kill_criteria[{i}] missing fired_last_two_periods (bool) — whether this trigger "
                           f"would have fired on the last two reported periods (HARD GATE 11 check 3)")
    return issues


# ---- check BC: every stated probability must declare its BASIS (empirical / base rate / judgment) ----
# CLAUDE.md §10 HARD GATE 13: "every probability states its basis — one of: empirical (with the sample
# size and the window it was measured over), a named reference class / base rate, or judgment. A
# probability computed from fewer than roughly eight observations ... is judgment informed by that
# sample ... Never present it as a measured frequency." synthesizer.md §8/§9 (the Scenario Model and
# Risk Register tables) already instruct every probability to carry this as `empirical (n=X over
# {window})` / `base rate: {class, source}` / `judgment` — but until now nothing checked the field was
# populated, or that a small-sample read was not mislabeled "empirical" to borrow the credibility of a
# measured frequency it does not have. This is the same "prose rule, no mechanization" gap check BA
# closed for HARD GATE 11's kill-criteria triggers (comparable_basis / fired_last_two_periods): a HARD
# GATE stated as mandatory in both CLAUDE.md and synthesizer.md, with zero schema field to carry it and
# zero check to verify it, until this one.
#
# Scope: `scenarios[]` and `forecast_ledger[]` are the two `decision_record.json` arrays that carry a
# structured `probability` field. §9 Risk Register has no JSON array of its own (it lives only in
# `final_thesis.md` prose), so it stays a prose-enforced rule here — the same restraint check AT/AV
# already take on the conjunction check's other half (a rule that needs data the schema does not carry
# stays a prose rule, documented plainly, rather than a brittle text-mining check).
#
# This is presence + FORM checking — does the field exist, and does it match one of the three permitted
# shapes with an internally consistent number — never a truth check of whether the classification is
# honest (whether the sample is really representative, or the named base rate genuinely applies).
BC_DATE = "2026-08-29"
BC_MIN_EMPIRICAL_N = 8  # CLAUDE.md §10: "fewer than roughly eight observations ... is judgment"

_BC_EMPIRICAL_RE = re.compile(r"\bempirical\b.*?\bn\s*=\s*(\d+)", re.I | re.S)
# The advertised empirical form is `empirical (n=X over {window})`: the window the sample was measured
# over is part of the contract (CLAUDE.md §10, "the sample size and the window it was measured over"),
# so an `empirical` claim that states n=X but no window is rejected, not accepted.
_BC_WINDOW_RE = re.compile(r"\bover\b\s+\S", re.I)
_BC_BASE_RATE_RE = re.compile(r"\bbase[\s\-]*rate\b\s*:?\s*(.*)", re.I)
_BC_JUDGMENT_RE = re.compile(r"\bjudge?ments?\b", re.I)  # "judgment"/"judgement" (US/UK), singular or plural


def _bc_classify(text):
    """Classify one probability_basis string per HARD GATE 13. Returns (ok: bool, reason: str|None) —
    ok=False means the string is missing, matches none of the three permitted forms, labels itself
    'empirical' from a sample smaller than BC_MIN_EMPIRICAL_N (which HARD GATE 13 requires be called
    judgment, never a measured frequency), or claims 'empirical' without stating its measurement
    window."""
    t = text.strip() if isinstance(text, str) else ""
    if not t:
        return False, "missing or empty probability_basis"
    m = _BC_EMPIRICAL_RE.search(t)
    if m:
        n = int(m.group(1))
        if n < BC_MIN_EMPIRICAL_N:
            return False, (f"probability_basis={t!r} labels itself 'empirical' from n={n} "
                            f"(<{BC_MIN_EMPIRICAL_N}) — CLAUDE.md §10 requires a sample this small be "
                            f"called judgment informed by that sample, never presented as a measured "
                            f"frequency")
        if not _BC_WINDOW_RE.search(t):
            return False, (f"probability_basis={t!r} labels itself 'empirical' (n={n}) but states no "
                            f"measurement window — HARD GATE 13 requires the form 'empirical (n=X over "
                            f"{{window}})', naming the window the sample was measured over")
        return True, None
    # Judgment is checked before base rate: a valid judgment string may mention 'base rate' (e.g.
    # "judgment — no base rate available"), and the base-rate branch below would otherwise reject it
    # for having too little text after "base rate".
    if _BC_JUDGMENT_RE.search(t):
        return True, None
    m = _BC_BASE_RATE_RE.search(t)
    if m:
        if len(m.group(1).strip()) < 5:
            return False, (f"probability_basis={t!r} names 'base rate' but no actual reference "
                            f"class/source follows it")
        return True, None
    return False, (f"probability_basis={t!r} does not match any of the three HARD GATE 13 forms — "
                    f"'empirical (n=X over {{window}})' / 'base rate: {{class, source}}' / 'judgment'")


def eval_bc_probability_basis_stated(decision_date, scenarios, forecast_ledger):
    """Check BC. None = N/A (pre-gate, or neither array carries a row with a probability); [] = every
    probability-bearing row states a valid basis; [violation,...] = at least one row is missing,
    malformed, or mislabels a small sample as empirical."""
    if not (_isdate(decision_date) and decision_date >= BC_DATE):
        return None
    out = []
    found = False
    if isinstance(scenarios, list):
        for s in scenarios:
            if not isinstance(s, dict) or s.get("probability") is None:
                continue
            found = True
            label = str(s.get("label") or s.get("scenario_id") or "?")
            ok, reason = _bc_classify(s.get("probability_basis"))
            if not ok:
                out.append(f"scenario '{label}': {reason}")
    if isinstance(forecast_ledger, list):
        for i, f in enumerate(forecast_ledger):
            if not isinstance(f, dict) or f.get("probability") is None:
                continue
            found = True
            fid = str(f.get("forecast_id") or f.get("prediction") or f"#{i}")[:60]
            ok, reason = _bc_classify(f.get("probability_basis"))
            if not ok:
                out.append(f"forecast_ledger {fid!r}: {reason}")
    if not found:
        return None
    return out


# ── Check AO (§19 / DECISION_LEDGER §6 forecast RESOLVABILITY) — a forecast the calibration loop can
# score. Moved here from `scripts/eval.py` (same closure already done for AT/AU/AV/AM/AR/BA/BC above):
# until this move, AO ran ONLY inside the retrospective harness, so a `forecast_ledger` entry with an
# unpinned "beats consensus" trigger, two identical confirmation/falsification triggers, or a ledger
# with zero near-term (<=90-day) proof point could ship live, print `GATE: PASS`, and commit straight
# to `main` (CLAUDE.md §25/§28) — undetected until a later manual `/research:eval` run. That silently
# starves the very calibration loop the AG check (calibration_gate_checks.py) already enforces live:
# AG makes sure a computed haircut reaches the scorer, but nothing upstream of it made sure the
# forecasts feeding that calibration were ever mechanically checkable in the first place (§19: "a
# forecast that cannot be checked later is not a forecast").
#
# The mechanically-verifiable subset of resolvability (the full semantic requirement — outcome-space
# exhaustiveness + a <=90-day quota — is enforced at AUTHORING time by the synthesizer prompt). Check T
# already requires the trigger/window FIELDS to be non-empty; AO requires them to be RESOLVABLE: a pinned
# numeric bar or a named settleable document (not a bare "beats consensus"), triggers that actually
# partition the outcome space (not identical text), and — at the record level — at least one near-term
# (<=90-day) proof point so the whole call is not un-checkable until years out.
AO_DATE = "2026-07-18"
_AO_NAMED_DOC = re.compile(r"\b(10-?k|10-?q|8-?k|20-?f|6-?k|annual report|"
                           r"(?:quarterly|annual|interim|half-?year|full-?year|year-?end|first-quarter|"
                           r"second-quarter|third-quarter|fourth-quarter|q[1-4]|h[12]|fy\s?\d{2,4})\s+"
                           r"(?:results?|report|filing|earnings|numbers)|"
                           r"filing|filed|transcript|nse|bse|sec|sebi|def ?14a|proxy|press release|"
                           # A regulatory DISCLOSURE settles exactly like the 'filing|filed' already above it
                           # ("no such disclosure by 2026-09-30" is checked the same way as "not filed by …"),
                           # and a COURT/tribunal DOCKET is a public primary record that outranks an 8-K under
                           # §4 — the list was SEC/India-filing-centric and simply had no vocabulary for either,
                           # so a securities-litigation or deal-closing forecast settled on the docket read as
                           # unresolvable. §27: name the local forum, not a US-only one.
                           r"disclos(?:e|ed|es|ure|ures|ing)|docket|court|tribunal|nclt|nclat|"
                           # NOT bare 'guidance' / 'rating' — an event noun with no numeric bar and no
                           # settlement source ('guidance improves', 'rating worsens') is calibration-dead.
                           # A legitimate use carries its own context that already matches here: a period-
                           # qualified 'guidance raised in the Q1 results', an 'investor day', or a named
                           # rating agency (crisil/icra/care) — those settle it; the bare noun does not.
                           r"crisil|icra|care|circular|prospectus|"
                           r"investor\s+(?:presentation|day|deck|update|briefing))\b", re.I)
_AO_CONSENSUS = re.compile(r"\b(consensus|estimate|estimates|expectation|expectations|street|analysts?)\b", re.I)
_AO_MONTHS = {"jan":1,"feb":2,"mar":3,"apr":4,"may":5,"jun":6,"jul":7,"aug":8,"sep":9,"oct":10,"nov":11,"dec":12}
_AO_MONTH_RE = re.compile(r"\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{4})\b", re.I)
_AO_ISO_RE = re.compile(r"\b(\d{4})-(\d{2})-(\d{2})\b")
# Period / date TOKENS (a fiscal year, quarter, half, calendar date) — digits that only LABEL a period,
# not a pinned threshold. Stripped before asking "is there a real number here?", so 'FY27 EPS beats
# consensus' is correctly seen as pinning NO consensus value. Deliberately does NOT strip a bare
# four-digit number ('revenue above ₹2,026 cr', 'price > 2026'): a standalone 2026 is ambiguous, and
# wrongly reading a real threshold as a year would FALSELY fail a settleable ledger (a false-positive
# eval gate blocks valid PRs — worse than letting a weak year-only reference pass). Years are stripped
# only in an explicit date context (FY__, ISO date, Month YYYY).
_AO_PERIOD_TOKENS = re.compile(
    # `fy26`, and also the Indian fiscal-YEAR-RANGE spelling `FY26-27` / `FY2026-27` / `FY26/27` — the
    # optional second-year group strips the trailing `-27` that would otherwise survive and be misread as
    # a pinned number (CLAUDE.md §27 makes an Indian company the default case, where `FY26-27` is routine).
    # COMPACT quarter+fiscal-year with no boundary between them ('Q1FY27', 'Q1 FY27', 'H1FY2027') — the
    # standalone `\bq[1-4]\b` / `\bfy…` alternatives can't strip these ('Q1FY27' has no boundary either
    # side of the join), so a bare 'Q1FY27 EPS beats consensus' would keep '27' and read as a pinned
    # number. Matched FIRST so the whole compact label is consumed.
    r"\b(?:q[1-4]|[1-4]q|h[12])\s?fy\s?\d{2,4}(?:\s?[-/]\s?\d{2,4})?\b|"
    r"\bfy\s?\d{2,4}(?:\s?[-/]\s?\d{2,4})?\b|\bq[1-4]\b|\b[1-4]q\b|\bh[12]\b|\b\d{4}-\d{2}-\d{2}\b|"
    r"\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}\b", re.I)

def _ao_pins_a_number(text):
    """True if `text` carries a numeric threshold that is NOT merely a period/date LABEL. Strips fiscal
    years, quarters, halves, and calendar dates first, then looks for a remaining digit. 'FY27 EPS beats
    consensus' → False (only the fiscal year); 'FY27 EPS above ₹42' → True (42 survives); 'revenue above
    2026 cr' → True (a bare four-digit threshold is kept, not mistaken for a year)."""
    return bool(re.search(r"\d", _AO_PERIOD_TOKENS.sub(" ", text or "")))

# A falsification that is the DATED NEGATION of an already-resolvable confirmation is fully settleable, and
# used to fail anyway. The canonical shape of a BINARY EVENT forecast is "confirmation: <event> disclosed in
# an 8-K by 2026-09-30" / "falsification: no such disclosure by 2026-09-30" — the scorer reads BOTH fields of
# the SAME entry, so the anaphora ('no such') resolves against its own sibling, and the deadline is explicit.
# Demanding that this half separately restate a number or a document name does not make it more resolvable;
# it pushes authors toward vaguer prose that happens to carry a digit. AO's own comment block already names
# the priority: "a false-positive eval gate blocks valid PRs — worse than letting a weak year-only reference
# pass."
#
# Deliberately NARROW — all three must hold, or the trigger fails exactly as before:
#   (a) the trigger OPENS with / carries a negation,
#   (b) it carries a back-reference marker — 'no such' (anaphoric), an explicit 'within the window/period',
#       or an explicit calendar date (the deadline), and
#   (c) its SIBLING confirmation is itself resolvable (pins a number or names a settleable document).
# The one-sided-vagueness defect this check exists to catch is untouched: a bare "margin does not improve"
# beside a numbered "margin above 12%" confirmation has a negation but NO back-reference marker, so it still
# fails — as its selftest case (_fc_onesided) asserts.
# Separators are `[\s\-_]+`, not a bare `\s+`, so ordinary formatting variation ('time frame' /
# 'time-frame', 'no  such' across a wrapped line) cannot false-NEGATIVE its way into a spurious AO
# failure — the same convention check AU already uses for `\bsign[\s\-_]*check` (Gemini #405).
_AO_NEGATION = re.compile(r"^\W*(?:no|none|neither|not|never)\b|"
                          r"\b(?:does|do|did|is|are|was|were|has|have|had|will|would)[\s\-_]+not\b|"
                          r"\bfails?[\s\-_]+to\b|\bno[\s\-_]+such\b", re.I)
_AO_BACKREF = re.compile(r"\bno[\s\-_]+such\b|"
                         r"\bwithin[\s\-_]+the[\s\-_]+(?:window|period|time[\s\-_]*frame)\b", re.I)

def _ao_is_negated_mirror(trigger, sibling):
    """True when `trigger` is the dated negation of an already-resolvable `sibling` confirmation — see the
    block comment above for why that is settleable and why the test is this narrow."""
    if not trigger or not sibling:
        return False
    if not (_ao_pins_a_number(sibling) or _AO_NAMED_DOC.search(sibling)):
        return False  # (c) nothing resolvable to mirror — both halves vague is the real defect
    if not _AO_NEGATION.search(trigger):
        return False  # (a)
    # (b) an explicit anaphor/window phrase, or a real calendar date acting as the deadline
    return bool(_AO_BACKREF.search(trigger)
                or _AO_ISO_RE.search(trigger) or _AO_MONTH_RE.search(trigger))

def _ao_earliest_date(time_window, not_before=None):
    """Best-effort EARLIEST confidently-parseable resolution date (YYYY-MM-DD) from a free-text
    time_window — an ISO date, or a 'Month YYYY'. Biased to the earliest match so a genuinely near-term
    window is never misread as long. Returns None when nothing is confidently parseable (ambiguity is
    never failed) — fiscal-quarter-only text ('Q1 FY27' with no month) is deliberately treated as
    unparseable, since Q1 spans different calendar months across jurisdictions.

    When `not_before` (the decision date) is given, prefer the earliest candidate ON OR AFTER it: a
    window that names both a reporting-PERIOD label and a later resolution date ('quarter ended June
    2026; results August 2026') must resolve on the future date, not be misread as already-stale by the
    period label. Only when NO candidate is on/after not_before does it fall back to the earliest overall
    — so a genuinely all-before-decision window still surfaces as stale."""
    cands = []
    for m in _AO_ISO_RE.finditer(time_window or ""):
        y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        try:
            datetime.date(y, mo, d)  # only a REAL calendar date is a candidate (skip 2026-02-31)
            cands.append(f"{y:04d}-{mo:02d}-{d:02d}")
        except ValueError:
            continue
    for m in _AO_MONTH_RE.finditer(time_window or ""):
        mo = _AO_MONTHS[m.group(1)[:3].lower()]
        cands.append(f"{int(m.group(2)):04d}-{mo:02d}-01")  # 1st of the month = earliest it could resolve
    if not cands:
        return None
    if not_before and isinstance(not_before, str):
        future = [c for c in cands if c >= not_before[:10]]  # ISO strings compare as dates (YYYY-MM-DD)
        if future:
            return min(future)
    return min(cands)

def _ao_month_last(y, mo):
    """Last calendar day of month mo/year y as YYYY-MM-DD (no `calendar` import: first of next month − 1 day)."""
    first_next = datetime.date(y + (mo // 12), (mo % 12) + 1, 1)
    last = first_next - datetime.timedelta(days=1)
    return f"{last.year:04d}-{last.month:02d}-{last.day:02d}"

def _ao_latest_date(time_window):
    """Best-effort LATEST plausible resolution date (YYYY-MM-DD) from a free-text time_window — an ISO date
    is a POINT; a 'Month YYYY' resolves BY its last day. Used only for the stale test: a window is 'already
    stale' only if its LATEST plausible resolution is before the decision (the whole window has elapsed), so
    'results July 2026' is not stale-failed on a 2026-07-18 decision just because the month began on the 1st.
    Returns None when nothing is confidently parseable."""
    cands = []
    for m in _AO_ISO_RE.finditer(time_window or ""):
        y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
        try:
            datetime.date(y, mo, d)
            cands.append(f"{y:04d}-{mo:02d}-{d:02d}")
        except ValueError:
            continue
    for m in _AO_MONTH_RE.finditer(time_window or ""):
        cands.append(_ao_month_last(int(m.group(2)), _AO_MONTHS[m.group(1)[:3].lower()]))
    return max(cands) if cands else None

def _ao_has_impossible_iso(time_window):
    """True if the window contains an ISO-shaped YYYY-MM-DD token that is NOT a real calendar date
    (e.g. 2026-02-31). Such a window can never settle on a real date and must be flagged, not silently
    dropped to 'undateable' (which would suppress the near-term-quota failure)."""
    for m in _AO_ISO_RE.finditer(time_window or ""):
        try:
            datetime.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        except ValueError:
            return True
    return False

def _ao_days_after(decision_date, target):
    try:
        d0 = datetime.datetime.strptime(decision_date[:10], "%Y-%m-%d").date()
        d1 = datetime.datetime.strptime(target[:10], "%Y-%m-%d").date()
        return (d1 - d0).days
    except (ValueError, TypeError):
        return None

def eval_ao_forecast_resolvability(decision_date, forecast_ledger):
    """Check AO: every forecast must be mechanically RESOLVABLE (so it can enter the Brier score), and
    the record must carry a near-term proof point. Per entry: triggers must (a) carry a pinned numeric
    bar OR name a settleable document, (b) not reference consensus/estimates without a number, and (c)
    not be identical confirmation==falsification text. Per record: at least one forecast must resolve
    within 90 days of the decision (≥2 or ≥40% is the authoring-time target; the gate fails only the
    clear case — every dateable forecast settles beyond a quarter). Returns None (pre-gate / empty
    ledger) or a list of violations (empty = pass)."""
    if not (_isdate(decision_date) and decision_date >= AO_DATE):
        return None
    if forecast_ledger is not None and not isinstance(forecast_ledger, list):
        return None  # a malformed (non-list) forecast_ledger is a STRUCTURAL defect for check A/T to flag,
                     # not AO's — return N/A rather than TypeError-crash the whole eval harness on one record
    fl = forecast_ledger or []
    if not fl:
        return None  # empty forecast_ledger is allowed (§19)
    issues = []
    near_term = parseable_long = undateable = 0
    for i, e in enumerate(fl):
        if not isinstance(e, dict):
            continue  # T flags non-object entries
        ct = str(e.get("confirmation_trigger") or "").strip()
        ft = str(e.get("falsification_trigger") or "").strip()
        both = ct + " ⋮ " + ft
        if ct and ft and ct.lower() == ft.lower():
            issues.append(f"forecast_ledger[{i}] confirmation and falsification triggers are identical — the outcome space is not partitioned")
        # A consensus reference must pin its number in a trigger that ACTUALLY references consensus — an
        # unrelated number in the other trigger ('revenue below 2026 cr' alongside 'EPS beats consensus')
        # does not settle the EPS-vs-consensus call. Check the consensus-referencing triggers specifically.
        cons_triggers = [t for t in (ct, ft) if _AO_CONSENSUS.search(t)]
        if any(not _ao_pins_a_number(t) for t in cons_triggers):
            # EACH consensus-referencing trigger needs its OWN pinned number, not just a period digit and not
            # a number borrowed from the other side: 'FY27 EPS beats consensus' / 'FY27 EPS below consensus in
            # Q1 results' names a document but never pins the consensus value on the falsification side, so the
            # miss cannot be settled. One pinned side does not excuse an unpinned consensus side.
            issues.append(f"forecast_ledger[{i}] references consensus/estimates but pins no number in the "
                          f"consensus trigger (a fiscal-year/quarter digit, a named document, or an unrelated "
                          f"number in the other trigger is not the consensus value) — each consensus-referencing "
                          f"trigger must pin its own value; a bare 'beats/misses consensus' cannot be settled (§5)")
        else:
            # Validate EACH trigger INDEPENDENTLY — a number/document on only ONE side masks an unresolvable
            # other half ('margin above 12%' confirmation with a vague 'margin does not improve' falsification).
            # Each non-empty trigger must pin a real threshold (not just a fiscal-period label) or name a
            # settleable document. (An empty trigger is check T's job, not AO's — skip it here.)
            for side, trig in (("confirmation", ct), ("falsification", ft)):
                if trig and not _ao_pins_a_number(trig) and not _AO_NAMED_DOC.search(trig):
                    # A falsification that is the dated negation of a resolvable confirmation settles fine
                    # (see _ao_is_negated_mirror). Only the falsification side may mirror — a confirmation
                    # that merely negates something is not a positive, checkable claim.
                    if side == "falsification" and _ao_is_negated_mirror(trig, ct):
                        continue
                    issues.append(f"forecast_ledger[{i}] the {side} trigger carries no pinned numeric bar (a "
                                  f"fiscal-year/quarter label is not a threshold) and names no settleable document — "
                                  f"not mechanically resolvable (§5/§19)")
        window = str(e.get("time_window") or "")
        if _ao_has_impossible_iso(window):
            issues.append(f"forecast_ledger[{i}] time_window contains an impossible calendar date (e.g. a 31st of a "
                          f"short month) — it can never settle on a real date")
            continue  # do not let an impossible date fall through to 'undateable' and suppress the quota
        tgt = _ao_earliest_date(window, decision_date)
        latest = _ao_latest_date(window)   # LATEST plausible resolution (month → its last day); for the stale test
        if tgt:
            e_days = _ao_days_after(decision_date, tgt)
            l_days = _ao_days_after(decision_date, latest) if latest else e_days
            if e_days is None:
                undateable += 1  # a date we couldn't place relative to the decision → treat as undateable
            elif l_days is not None and l_days < 0:
                # The WHOLE window — even its last plausible day — is before the decision → genuinely stale
                # (it can never be a future proof point). A 'Month YYYY' is a RANGE: 'results July 2026' on a
                # 2026-07-18 decision is NOT stale (the month runs to the 31st), only 'January 2026' is. Flag
                # it (a defect), and do NOT count it as undateable (which would suppress the quota failure).
                issues.append(f"forecast_ledger[{i}] time_window resolves by {latest}, BEFORE the decision date "
                              f"{decision_date} — already stale at decision, cannot provide a future proof point")
            else:
                # Resolves on/after the decision (at least partly). Near-term if the EARLIEST plausible
                # resolution — never before the decision itself — is within 90 days (a same-month window is 0
                # days out → near-term, never misread as long).
                eff = max(e_days, 0)
                if eff <= 90:
                    near_term += 1
                else:
                    parseable_long += 1
        else:
            undateable += 1      # no confidently-parseable date in the window
    # Near-term quota (§19: ≥2 OR ≥40% of the dateable forecasts resolve within 90 days), measured over the
    # dateable set. An undateable (unknown-timing) forecast is given the benefit of the doubt — it MIGHT be
    # near-term but the parser can't place it, so it must not FALSE-FAIL a record whose vague windows may all
    # be soon. BUT that benefit is withdrawn once the record ALSO carries a demonstrably long-dated (>90d)
    # forecast: a ledger with clearly-long forecasts and zero near-term ones cannot be rescued by leaving one
    # forecast undated (the loophole). So apply the quota when there are no undateable forecasts OR at least
    # one is provably long. A 5-forecast ledger with 1 near-term / 4 long (20%) fails; 1-of-2 (50%) or a lone
    # near-term passes; an all-undateable ledger is failed ONLY when it is also genuinely UNBOUNDED (below).
    dateable = near_term + parseable_long
    if (undateable == 0 or parseable_long > 0) and dateable >= 1 and near_term < 2 and near_term < 0.4 * dateable:
        pct = round(100.0 * near_term / dateable)
        issues.append(f"insufficient near-term proof points — only {near_term} of {dateable} dateable forecasts "
                      f"({pct}%) resolve within 90 days of the decision; §19 wants ≥2 or ≥40%, else the call cannot "
                      f"be checked for months")
    elif dateable == 0 and undateable > 0 and not any(
            _AO_PERIOD_TOKENS.search(str(e.get("time_window") or "")) for e in fl if isinstance(e, dict)):
        # Every window is undateable AND none even names a bounded fiscal period (Q/H/FY), month, or date —
        # the ledger is genuinely unbounded ('over the next few years') with no fiscal period (Q/H/FY), month,
        # or date to settle on. A fiscal-period label like 'Q1 FY27' is unpinnable to a calendar date but IS
        # a bounded near-term-ish period, so it keeps the benefit of the doubt and does not trip this.
        issues.append("no dateable near-term proof point — every forecast window is vague and unbounded "
                      "(e.g. 'over the next few years') with no fiscal period (Q/H/FY), month, or date to settle "
                      "on; §19 requires at least one checkable near-term proof point")
    return issues


def _isdate(s):
    import datetime
    try:
        datetime.date.fromisoformat(s)
        return True
    except Exception:
        return False


def _tonum(v):
    """Coerce an int/float (non-bool) or a numeric string to a FINITE float; None if not coercible or
    non-finite. Mirrors the float(...) coercion the live scenario-math block already applies to
    return_pct/probability — but float("nan")/float("inf") parse successfully in Python, and a NaN best
    case makes every comparison False (silently "spanning") while an Infinity best case trivially spans
    without ever naming a real value, so a finite check after conversion is required, not optional."""
    if isinstance(v, bool):
        return None
    if isinstance(v, (int, float)):
        f = float(v)
    elif isinstance(v, str):
        try:
            f = float(v.strip())
        except (ValueError, TypeError):
            return None
    else:
        return None
    return f if math.isfinite(f) else None
