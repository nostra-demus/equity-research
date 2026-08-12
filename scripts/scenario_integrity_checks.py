#!/usr/bin/env python3
"""§10 scenario-integrity detectors: the span check and the conjunction-disclosure check
(CLAUDE.md §10), plus the cross-module sign-check presence gate (synthesizer.md Step 3b /
HARD GATE 7).

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
    """Check AT. None = N/A (pre-gate / no usable scenarios); [] = spans; [violation] = too narrow."""
    if not (_isdate(decision_date) and decision_date >= AT_DATE):
        return None
    if not isinstance(scenarios, list) or len(scenarios) < 2:
        return None  # a single case is not a set — check A/T owns the structural complaint
    rets = [s.get("return_pct") for s in scenarios
            if isinstance(s, dict) and isinstance(s.get("return_pct"), (int, float)) and not isinstance(s.get("return_pct"), bool)]
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
    """Check AV. None = N/A (pre-gate, or scenarios aren't in the structured shape yet); [] = every
    scenario's conditions[] / joint_probability_basis pair is schema-consistent; [violation,...] = at
    least one scenario either omits a required conjunction basis or carries a stray one."""
    if not (_isdate(decision_date) and decision_date >= AV_DATE):
        return None
    if not isinstance(scenarios, list) or len(scenarios) < 2:
        return None
    structured = [s for s in scenarios if isinstance(s, dict) and isinstance(s.get("conditions"), list)]
    if len(structured) < 2:
        return None  # not the structured scenario shape yet (pre-rollout record, or malformed) — nothing to check
    out = []
    for s in structured:
        label = str(s.get("label") or s.get("scenario_id") or "?")
        conds = s.get("conditions")
        jpb = s.get("joint_probability_basis")
        jpb_txt = jpb.strip() if isinstance(jpb, str) else ""
        if len(conds) >= 2:
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


def _isdate(s):
    import datetime
    try:
        datetime.date.fromisoformat(s)
        return True
    except Exception:
        return False
