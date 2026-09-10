#!/usr/bin/env python3
"""The §18 Phase-6 calibration-feedback gate (check AG) — DECISION_LEDGER.md §18.

Side-effect-free, importable, doctrine logic — extracted verbatim from `scripts/eval.py`
(check AG) so the SAME detection function can run in TWO places instead of one:

1. **Retrospective** — `scripts/eval.py` imports this to grade already-committed runs
   (check AG), as it always has.
2. **Live, pre-publish** — `/research:full` Step 10B.1 (the deterministic finish-gate that
   also runs on every `/research:rerun`, per fix F-RRGATE) imports this to check a thesis
   BEFORE it ships, stamping `final_thesis.md` PROVISIONAL on a violation instead of letting
   it commit clean.

The gap this closes: DECISION_LEDGER.md §18 requires every run to read back the engine's own
prior calibration record (`/research:calibrate`'s output) and apply a bounded 8-point
confidence haircut when a module, forecast type, thesis type, or leading error-taxonomy
category the run leans on has a poor track record — the "learning loop" that stops the
engine from repeating its own known mistakes. synthesizer.md's Pre-Write Gate step 4C and
Confidence Scoring Rules step 1 already instruct the synthesizer to populate
`decision_record.json.calibration_feedback` (and thread the same haircut into
`confidence_inputs.calibration_haircut`) on every run, and `scripts/eval.py` check AG has
graded that object against the as-of `calibration_summary.json` since AG_DATE — but, like
checks AA/AB/AH/AN before this module existed for them, AG was defined only inline in
`scripts/eval.py`, the one place the live finish-gate could never reach. A run could omit
`calibration_feedback` entirely, record `status="applied"` without actually flagging
anything, or record the §18 haircut in `calibration_feedback.haircut_points` without ever
threading `confidence_inputs.calibration_haircut` into the scorer (the "measured but never
acted on" dead-end §18 explicitly warns against) — and still print `GATE: PASS` and commit
straight to `main` (§25/§28), undetected until someone remembered to run `/research:eval`
afterward. Importing this module into the live finish-gate closes that hole the same way it
was already closed for §24/§13 (rating_caps.py), the Headline Scorecard / red-flag / audit
trail checks (headline_checks.py), the valuation-summary sidecar (valuation_summary_checks.py),
and §10/HARD GATE 11/13 (scenario_integrity_checks.py).

`eval_ag_calibration_feedback_gate` is pure: given the run's decision date, the as-of
calibration summary, the run's own `calibration_feedback` object, and (optionally) its
`confidence_inputs` object, it returns:
  - `None`  — not applicable (pre-gate date)
  - `[]`    — applicable and satisfied (checked, no violation)
  - `[...]` — one or more violation strings (the gate was skipped, misapplied, or its
              recorded haircut never reached the scorer)

No caller may treat a violation as fatal — CLAUDE.md §13 requires caps to be *applied*, not
used to silently kill a run. Both call sites (eval.py, the finish-gate) turn a non-empty
result into a visible flag (a FAIL row, or a PROVISIONAL banner) — never a silent abort.
"""

import datetime
import glob
import json
import os
import re


def isdate(s):
    try:
        datetime.date.fromisoformat(s)
        return True
    except Exception:
        return False


def isnum(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)  # bool is an int subclass — exclude it


# calibration summaries for check AG (Phase 6 calibration-feedback gate, DECISION_LEDGER.md §18) — repo-wide,
# not per-run, so resolved once here rather than re-globbed per run.
CALIB_SUMMARIES = sorted(glob.glob("analyses/performance/*_calibration_summary.json"))


def _calib_summary_asof(decision_date):
    """Latest calibration_summary.json dated on/before decision_date (a synthesizer can only act on
    calibration history that existed when it ran), or None if none qualifies. Ties (same date, e.g. a
    `_v2` correction) broken by filename so the versioned correction wins, matching the convention
    /research:calibrate itself uses ("_v2 suffix if one already exists for today")."""
    if not isdate(decision_date):
        return None
    best = None
    best_date = None
    for p in CALIB_SUMMARIES:
        m = re.match(r"(\d{4}-\d{2}-\d{2})_calibration_summary", os.path.basename(p))
        if not m:
            continue
        fdate = m.group(1)
        if fdate > decision_date:
            continue
        if best_date is None or fdate > best_date or (fdate == best_date and os.path.basename(p) > os.path.basename(best)):
            best = p
            best_date = fdate
    if best is None:
        return None
    try:
        return json.load(open(best))
    except Exception:
        return None


AG_DATE = "2026-07-06"
AG_FTYPE_DATE = "2026-07-23"  # forecast-type extension: scripts/calibrate.py has computed
    # calibration_by_forecast_type since Phase 4, but the Phase-6 gate (DECISION_LEDGER.md §18,
    # synthesizer.md step 4C) only ever consumed calibration_by_module — a forecast-type-level
    # miscalibration (e.g. every module's "catalyst_or_estimate_revision" calls are overconfident)
    # could never trigger the haircut. Gated by its own date so runs before the fix are not held to
    # a schema field (flagged_forecast_types) that did not exist when they shipped.
AG_TTYPE_DATE = "2026-07-27"  # thesis-type extension: scripts/calibrate.py now computes
    # calibration_by_thesis_type (multi-label, per CLAUDE.md §14/§24 Filter 2), but until now nothing
    # read it back — a thesis-type-level miscalibration (e.g. every "Governance turnaround" call the
    # engine has made is overconfident) could never trigger the haircut, so §24 Filter 2's "turnaround
    # base-rate penalty" only ever drew on a generic external base rate, never the engine's own record.
    # Gated by its own date so runs before the fix are not held to a schema field
    # (flagged_thesis_types) that did not exist when they shipped.
AG_ERRTAX_DATE = "2026-07-29"  # error-taxonomy extension: scripts/calibrate.py has computed
    # error_taxonomy_distribution (CLAUDE.md §20 flat tally of why past calls went wrong) since Phase 4,
    # but it was read back only in the human-facing /research:calibrate narration (calibrate.md step 3:
    # "the leading tag(s) if any count >= 2") — never by a gate that changes behavior on a LIVE run. This
    # is a different shape of gap than the module/forecast-type/thesis-type slices above: those match a
    # SLICE VALUE that appears in the current run; error taxonomy has no such per-run dimension — it is a
    # standing "the engine's own #1 historical mistake is X" fact. The fix: for every leading category
    # (count >= 2, the same threshold calibrate.md's own narration already uses), the synthesizer must
    # name concrete evidence THIS run produced to guard against that exact failure mode recurring, or
    # admit it has none — either way, proof the check ran, never a silent skip. Reuses the identical
    # fixed 8-point non-additive haircut as a 4th trigger (no new magnitude invented — DECISION_LEDGER.md
    # §18 already warns against a second, uncontrolled rating-cap mechanism). Gated by its own date so
    # runs before the fix are not held to schema fields (leading_error_categories_flagged,
    # error_defense_evidence) that did not exist when they shipped.
AG_STATUSES = {"not_available", "pre_data", "checked_no_action", "applied"}


def _ag_leading_error_categories(calibration_summary):
    """Categories in the as-of summary's error_taxonomy_distribution with count >= 2 — the same
    threshold calibrate.md's own human-facing narration already uses ("leading tag(s) if any count >= 2").
    Sorted for a deterministic violation message. Non-dict/non-numeric entries are ignored, never crash."""
    dist = (calibration_summary or {}).get("error_taxonomy_distribution")
    if not isinstance(dist, dict):
        return []
    return sorted(cat for cat, n in dist.items() if isinstance(cat, str) and isnum(n) and n >= 2)


def eval_ag_calibration_feedback_gate(decision_date, calibration_summary, calibration_feedback, confidence_inputs=None):
    """Check AG: Phase 6 calibration-feedback gate (DECISION_LEDGER.md §18). Verifies the synthesizer
    did not silently skip reading back its own prior calibration data — the loop Phase 4 (/research:
    calibrate) opened but nothing consumed until now. Returns None (N/A — pre-gate) or a list of
    violation strings (empty list = pass). Side-effect-free + module-level so eval.py selftest can
    drive it without real analyses/performance/ fixtures.
    decision_date: the run's decision_date.
    calibration_summary: the parsed as-of calibration_summary.json dict (see _calib_summary_asof), or
    None if no qualifying file exists.
    calibration_feedback: decision_record.json's "calibration_feedback" value, or None/missing.
    This is a presence/consistency check, not a re-derivation of Brier scores or hit rates — eval.py
    cannot re-run the synthesizer's judgment call on which module (or forecast type, on/after
    AG_FTYPE_DATE; thesis type, on/after AG_TTYPE_DATE; or leading error-taxonomy category, on/after
    AG_ERRTAX_DATE) is "flagged"; it can only verify the gate ran, recorded a valid status, and that
    status matches what the as-of summary's own verdict implies was possible (not_available / pre_data /
    checked-or-applied), and — once AG_FTYPE_DATE / AG_TTYPE_DATE / AG_ERRTAX_DATE apply — that an
    "applied" haircut is traceable to at least one flagged module, forecast type, thesis type, or leading
    error-taxonomy category, not left unexplained. For the error-taxonomy trigger it additionally checks
    that every leading category (count >= 2) has a recorded, non-trivial defense statement in
    error_defense_evidence — it cannot judge whether that statement is TRUE, only that one was written."""
    if not (isdate(decision_date) and decision_date >= AG_DATE):
        return None  # forward-looking; pre-gate runs N/A
    verdict = (calibration_summary or {}).get("verdict") or ""
    ftype_gate = isdate(decision_date) and decision_date >= AG_FTYPE_DATE
    ttype_gate = isdate(decision_date) and decision_date >= AG_TTYPE_DATE
    errtax_gate = isdate(decision_date) and decision_date >= AG_ERRTAX_DATE
    # error_taxonomy_distribution is a flat, always-honest tally computed at ANY N (calibrate.md §3's own
    # narration: "never gated by the floor") — unlike the module/forecast-type/thesis-type slices, a
    # Pre-data verdict (the SLICE sample below its own floor) does not excuse skipping the error-taxonomy
    # check. lec is computed here, before `expected`, so a Pre-data run that already has an actionable
    # leading category is still required to run (and can still apply) the error-taxonomy check instead of
    # being waved through as status='pre_data' (Codex r3671892072 — P1: the gate must not stay inactive
    # during the exact early-data period calibrate.md designed this trigger to cover).
    lec = _ag_leading_error_categories(calibration_summary) if errtax_gate else []
    if calibration_summary is None:
        expected = "not_available"
    elif verdict.startswith("Pre-data") and not lec:
        expected = "pre_data"
    else:
        expected = "checked"  # covers checked_no_action / applied — eval.py can't judge which is correct
    if not isinstance(calibration_feedback, dict):
        return [f"as-of calibration_summary={'present (verdict='+repr(verdict)+')' if calibration_summary is not None else 'absent'} "
                f"but decision_record.json has no calibration_feedback object — the Phase 6 calibration-"
                f"feedback gate (DECISION_LEDGER.md §18) was silently skipped"]
    violations = []
    status = calibration_feedback.get("status")
    if status not in AG_STATUSES:
        violations.append(f"calibration_feedback.status={status!r} is not one of {sorted(AG_STATUSES)}")
    elif expected == "not_available" and status != "not_available":
        violations.append(f"no as-of calibration_summary.json exists (decision_date={decision_date}) but status={status!r} (expected 'not_available')")
    elif expected == "pre_data" and status != "pre_data":
        violations.append(f"as-of calibration_summary verdict={verdict!r} is Pre-data but status={status!r} (expected 'pre_data')")
    elif expected == "checked" and status not in ("checked_no_action", "applied"):
        violations.append(f"as-of calibration_summary has real signal (verdict={verdict!r}) but status={status!r} (expected 'checked_no_action' or 'applied')")
    if status == "applied":
        hp = calibration_feedback.get("haircut_points")
        mf = calibration_feedback.get("modules_flagged")
        fft = calibration_feedback.get("flagged_forecast_types")
        ftt = calibration_feedback.get("flagged_thesis_types")
        lecf = calibration_feedback.get("leading_error_categories_flagged")
        if not (isnum(hp) and hp == 8):
            violations.append(f"status='applied' but haircut_points={hp!r} is not the fixed 8-point constant "
                              f"(DECISION_LEDGER.md §18: 'the fixed constant (8)' — a single, bounded, non-additive haircut)")
        if ftype_gate or ttype_gate or errtax_gate:
            mf_ok = isinstance(mf, list) and len(mf) > 0
            fft_ok = isinstance(fft, list) and len(fft) > 0
            ftt_ok = ttype_gate and isinstance(ftt, list) and len(ftt) > 0
            # A flagged category is only a traceable trigger if it names one the as-of summary's OWN
            # error_taxonomy_distribution is actually leading (count >= 2) right now — flagging an
            # unrelated or stale category must not grant a free pass (Codex r3671892091 — P2). Filtering
            # to str entries first also means a malformed (non-string/unhashable) entry can never satisfy
            # traceability, rather than crashing the gate (see the set()-crash fix below).
            lecf_str = [x for x in lecf if isinstance(x, str)] if isinstance(lecf, list) else []
            lecf_ok = errtax_gate and any(x in lec for x in lecf_str)
            if not (mf_ok or fft_ok or ftt_ok or lecf_ok):
                violations.append(f"status='applied' but none of modules_flagged={mf!r}, "
                                   f"flagged_forecast_types={fft!r}"
                                   + (f", flagged_thesis_types={ftt!r}" if ttype_gate else "")
                                   + (f", leading_error_categories_flagged={lecf!r}" if errtax_gate else "")
                                   + " is a non-empty list — the haircut must be traceable to at least "
                                   "one flagged module, forecast type, thesis type, or leading error-taxonomy category")
        elif not (isinstance(mf, list) and len(mf) > 0):
            violations.append(f"status='applied' but modules_flagged={mf!r} is empty/not a list")
    if status == "checked_no_action":
        mf = calibration_feedback.get("modules_flagged")
        fft = calibration_feedback.get("flagged_forecast_types")
        ftt = calibration_feedback.get("flagged_thesis_types")
        lecf = calibration_feedback.get("leading_error_categories_flagged")
        if isinstance(mf, list) and len(mf) > 0:
            violations.append(f"status='checked_no_action' but modules_flagged={mf!r} is non-empty")
        if ftype_gate and isinstance(fft, list) and len(fft) > 0:
            violations.append(f"status='checked_no_action' but flagged_forecast_types={fft!r} is non-empty")
        if ttype_gate:
            # PRESENCE, not just emptiness (Codex r3644... on this PR): DECISION_LEDGER.md §18's own
            # regression paragraph promises that on/after AG_TTYPE_DATE a "checked_no_action" record
            # "must carry an empty flagged_thesis_types" — an ABSENT field would otherwise pass
            # identically to a present-and-empty one, so a synthesizer that never ran the thesis-type
            # slice would be indistinguishable from one that ran it and found nothing. That is exactly
            # the silent-skip this gate exists to prevent (the same reason status itself distinguishes
            # 'checked_no_action' from a missing object). The synthesizer already emits the key
            # unconditionally (`"flagged_thesis_types": []` in both schema blocks), so requiring it is
            # the spec, not a new burden — and the date gate keeps every historical record untouched.
            if not isinstance(ftt, list):
                violations.append(f"status='checked_no_action' but flagged_thesis_types={ftt!r} is missing/not a list "
                                  f"— on/after {AG_TTYPE_DATE} the thesis-type slice must prove it ran by recording an "
                                  f"empty list (§18: a clean check must be distinguishable from a silently skipped one)")
            elif len(ftt) > 0:
                violations.append(f"status='checked_no_action' but flagged_thesis_types={ftt!r} is non-empty")
        if errtax_gate:
            # Same PRESENCE reasoning as the thesis-type block above, applied to the 4th trigger.
            if not isinstance(lecf, list):
                violations.append(f"status='checked_no_action' but leading_error_categories_flagged={lecf!r} is missing/not a list "
                                  f"— on/after {AG_ERRTAX_DATE} the error-taxonomy slice must prove it ran by recording an "
                                  f"empty list (§18: a clean check must be distinguishable from a silently skipped one)")
            elif len(lecf) > 0:
                violations.append(f"status='checked_no_action' but leading_error_categories_flagged={lecf!r} is non-empty")
    if errtax_gate:
        # Standalone structural validation of leading_error_categories_flagged, independent of status —
        # runs whenever the field is present as a list at all, so it also catches malformed values inside
        # 'applied' (checked_no_action already forces it empty above, so these are effectively no-ops there).
        lecf_all = calibration_feedback.get("leading_error_categories_flagged")
        if isinstance(lecf_all, list):
            non_str = [x for x in lecf_all if not isinstance(x, str)]
            if non_str:
                # A malformed (non-string/unhashable) entry — e.g. a nested dict — must be reported, never
                # crash the gate (Codex r3671892083 — P2: set(lecf) on an unhashable entry raised
                # TypeError and aborted the ENTIRE eval run across every committed record).
                violations.append(f"leading_error_categories_flagged contains non-string entr{'y' if len(non_str)==1 else 'ies'} "
                                  f"{non_str!r} — every flagged category must be a string naming an "
                                  f"error_taxonomy_distribution key")
            bogus = [x for x in lecf_all if isinstance(x, str) and x not in lec]
            if bogus:
                # A flagged category that is not (or no longer) among the as-of summary's OWN leading
                # categories must not be accepted as a real trigger (Codex r3671892091 — P2).
                violations.append(f"leading_error_categories_flagged includes {bogus!r} which "
                                  f"{'is' if len(bogus)==1 else 'are'} not among the as-of summary's actual "
                                  f"leading categories {lec!r} (count >= 2) — a flagged category must be one "
                                  f"currently leading, not an unrelated or stale one")
    if errtax_gate and status in ("checked_no_action", "applied"):
        # The defense-evidence object is REQUIRED whenever the error-taxonomy gate applies — even when no
        # category is currently leading (lec empty) — not only when `lec` is truthy (Gemini r3671874640 /
        # Codex r3671892095 — P2: the old `and lec` guard let a missing/malformed object slip through
        # undetected on a clean run, indistinguishable from a synthesizer that never wired the check at
        # all — the same PRESENCE reasoning as the thesis-type/error-taxonomy list checks above). For
        # every category the as-of summary's OWN error_taxonomy_distribution flags as leading (count >= 2),
        # the synthesizer must have recorded a concrete, non-trivial defense — or the literal admission it
        # has none, which is exactly what should have put that category in leading_error_categories_flagged.
        # This cannot verify the defense is TRUE (that is a semantic judgment eval.py does not make, same
        # limit as every other slice above); it can only verify one was written at all, and that a
        # "flagged" category isn't simultaneously claiming a real defense (or vice versa).
        ede = calibration_feedback.get("error_defense_evidence")
        lecf = calibration_feedback.get("leading_error_categories_flagged")
        flagged_set = set(x for x in lecf if isinstance(x, str)) if isinstance(lecf, list) else set()
        if not isinstance(ede, dict):
            violations.append(f"on/after {AG_ERRTAX_DATE} calibration_feedback.error_defense_evidence={ede!r} is "
                              f"missing/not an object — every run must record a defense-evidence object (empty "
                              f"'{{}}' when no category is currently leading) to prove the error-taxonomy slice "
                              f"ran (§18)")
        elif lec:
            for cat in lec:
                val = ede.get(cat)
                val_s = val.strip().lower() if isinstance(val, str) else None
                admits_none = (val_s == "no defense evidence found")
                if cat in flagged_set:
                    if not admits_none:
                        violations.append(f"leading_error_categories_flagged includes {cat!r} but "
                                          f"error_defense_evidence[{cat!r}]={val!r} is not the literal "
                                          f"'no defense evidence found' — a flagged category must admit it has "
                                          f"no defense, not carry a contradicting claim of one")
                else:
                    if val is None:
                        violations.append(f"leading error-taxonomy category {cat!r} (count >= 2) has no entry in "
                                          f"error_defense_evidence and is not in leading_error_categories_flagged — "
                                          f"the check must be provably run on every leading category")
                    elif admits_none:
                        violations.append(f"error_defense_evidence[{cat!r}]='no defense evidence found' but {cat!r} "
                                          f"is not in leading_error_categories_flagged — an admitted-no-defense "
                                          f"category must be flagged, not silently passed")
                    elif not (isinstance(val, str) and len(val.strip()) >= 20):
                        violations.append(f"error_defense_evidence[{cat!r}]={val!r} is not a concrete, non-trivial "
                                          f"defense statement (>= 20 chars) — a vague or empty entry is "
                                          f"indistinguishable from no defense and must be flagged instead")
    # Cross-record consistency (Codex r3635961178): the §18 haircut recorded in calibration_feedback must
    # equal the value the confidence scorer actually consumed (confidence_inputs.calibration_haircut) —
    # else an "applied" haircut is cosmetic (recorded but never subtracted from conviction by
    # scripts/confidence.py), the exact "measured but never acted on" dead-end §18 exists to close. This is
    # mechanical numeric equality against a doctrinal constant (applied ⇒ 8, else ⇒ 0; DECISION_LEDGER.md
    # §18 line 699 + confidence.py ConfidenceInputs.calibration_haircut "8.0 if status=='applied', else 0"),
    # NOT a re-derivation of which slice is flagged, so it stays inside this gate's stated remit. Only fires
    # when confidence_inputs carries a numeric calibration_haircut (present for runs >= 2026-07-11 per §18);
    # runs that omit confidence_inputs are left untouched (backward-compatible, forward-looking).
    ci = confidence_inputs if isinstance(confidence_inputs, dict) else {}
    ch = ci.get("calibration_haircut")
    if status == "applied" and ci:
        # An applied §18 haircut MUST be the numeric 8 the scorer consumes. Omitting the key or setting it
        # null does NOT get a pass here: confidence.py then defaults it to 0, so conviction is scored UNCUT
        # and the recorded haircut is never actually subtracted — the exact "measured but never acted on"
        # dead-end §18 exists to close. Only enforced when a confidence_inputs object is present (runs that
        # omit it entirely stay backward-compatible).
        if not (isnum(ch) and ch == 8):
            violations.append(f"status='applied' (haircut_points={calibration_feedback.get('haircut_points')!r}) but "
                              f"confidence_inputs.calibration_haircut={ch!r} is not the numeric 8 the scorer must consume "
                              f"— an omitted/null value leaves conviction uncut, so the recorded §18 haircut was never applied")
    elif status in ("checked_no_action", "pre_data", "not_available") and isnum(ch) and ch != 0:
        violations.append(f"status={status!r} applies no §18 haircut but confidence_inputs.calibration_haircut="
                          f"{ch!r} != 0 — the scorer cut conviction for a haircut the gate did not record")
    return violations  # empty list = pass
