#!/usr/bin/env python3
"""§10 scenario-integrity detectors: the span check and the conjunction-disclosure check
(CLAUDE.md §10), plus the cross-module sign-check presence gate (synthesizer.md Step 3b /
HARD GATE 7), the §10 HARD GATE 13 probability-basis presence/form check, and the HARD GATE 11
kill-criteria trigger-test schema-presence check (check BA — moved here from `scripts/eval.py`,
where it was defined but never imported into the live gate; see that check's own comment block
below for why).

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
        cb = e.get("comparable_basis"); fl = e.get("fired_last_two_periods")
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
