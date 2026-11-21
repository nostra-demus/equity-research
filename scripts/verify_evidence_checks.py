#!/usr/bin/env python3
"""The §3 named-metric contradiction-sweep schema-presence gate (check AZ) — CLAUDE.md §3.

Side-effect-free, importable, doctrine logic — extracted verbatim from `scripts/eval.py`
(check AZ) so the SAME detection function can run in TWO places instead of one:

1. **Retrospective** — `scripts/eval.py` imports this to grade already-committed runs
   (check AZ), as it always has.
2. **Live, pre-publish** — `/research:full` Step 10B.2 (the truth-integrity finish-gate
   that also runs on every per-module-chain `/research:rerun`, per Step 9B) imports this
   to check a thesis's `verification_report.json` BEFORE the thesis ships, stamping
   `final_thesis.md` PROVISIONAL on a violation instead of letting it commit clean.

The gap this closes: CLAUDE.md §3 requires that a directional verdict resting on one
metric, while a different metric in the engine's own tables points the other way, name
that second metric and say why it does not overturn the verdict — the doctrine's own
worked example (moat "confirmed" off a gross-margin decline while EBITDA margin, net
margin, cash conversion, and market share were all up over the same period).
`.claude/commands/research/verify-evidence.md` Section C3 implements this as the
"named-metric contradiction sweep", writing a `contradiction_checks[]` array into
`verification_report.json` — but, like checks AA/AB/AH/AN before this module existed for
them, AZ was defined only inline in `scripts/eval.py`, the one place the live finish-gate
could never reach. Step 10B.2 (fix F30) already stamps a thesis PROVISIONAL when
`verification_report.json` is missing or its overall `verdict` is not Clean/Minor — but
that check only reads the top-level verdict string; it never confirms the report
structurally carries `contradiction_checks[]` at all. A report produced under an older
template, or by a run whose verify-evidence pass silently dropped Section C3, could still
read `verdict: "Clean"` with zero evidence the §3 contradiction sweep was ever performed,
print `GATE-VERIFY: PASS`, and commit straight to `main` (§25/§28) — undetected until
someone remembered to run `/research:eval` afterward. Importing this module into the live
finish-gate closes that hole the same way it was already closed for §24/§13
(rating_caps.py), the Headline Scorecard / red-flag / audit-trail checks
(headline_checks.py), the valuation-summary sidecar (valuation_summary_checks.py), the
§18 calibration-feedback gate (calibration_gate_checks.py), and §10/HARD GATE 11/13
(scenario_integrity_checks.py).

`eval_az_contradiction_sweep` is pure: given the run's decision date and the parsed
`verification_report.json` dict (or `None` if no report exists, or `False` as the
caller's "exists but is not readable JSON" sentinel), it returns:
  - `"na"`   — not applicable (pre-gate date, or no report at all — report existence
               itself is gated elsewhere, e.g. eval.py check O, so it is not
               re-litigated here)
  - `"pass"` — the report is a dict and carries a `contradiction_checks` list (content is
               not graded here — that is inherently a judgment call the same way
               Sections A/B/C are; an empty list is a pass, not a skipped section)
  - `"fail"` — a report exists (or failed to parse) but does not carry the field, or is
               not a dict at all

No caller may treat a violation as fatal — CLAUDE.md §13 requires caps and gates to be
*applied*, not used to silently kill a run. Both call sites (eval.py, the finish-gate)
turn a `"fail"` result into a visible flag (a FAIL row, or a PROVISIONAL banner) — never
a silent abort.
"""


def isdate(s):
    try:
        import datetime
        datetime.date.fromisoformat(s)
        return True
    except Exception:
        return False


# ── Check AZ (verify-evidence Section C3 — named-metric contradiction sweep, CLAUDE.md §3) ──
# Landing date: 2026-08-21 (forward-looking; pre-gate runs are N/A so the golden suite stays green).
# Basket-independent by design, like AY: any run whose verification_report.json exists must carry
# contradiction_checks[], so a future verify-evidence run cannot silently omit the §3 sweep.
AZ_DATE = "2026-08-21"


def eval_az_contradiction_sweep(decision_date, verification_report):
    """Core of check AZ. `verification_report` is the parsed verification_report.json dict, or None if
    no report exists for this run. Returns 'pass' | 'fail' | 'na'. Side-effect-free + module-level so
    the selftest can drive the date gate without a run fixture."""
    if not (isdate(decision_date) and decision_date >= AZ_DATE):
        return "na"
    if verification_report is None:
        return "na"  # report existence itself is gated by check O for conviction runs; not re-litigated here
    if not isinstance(verification_report, dict):
        return "fail"  # a report that parses to a non-dict JSON type can't carry contradiction_checks[] — fail, don't crash
    return "pass" if isinstance(verification_report.get("contradiction_checks"), list) else "fail"


# ── Check BM (verify-evidence verdict floor — the verdict may not be softer than its own findings) ──
# Landing date: 2026-11-21 (forward-looking; pre-gate runs surface only as a retrospective advisory in
# eval.py, so the golden suite stays green).
#
# The gap: every consumer of a verification report — eval.py checks O/X/AY, the live /research:full
# Step 10B.2 PROVISIONAL stamp, ledger_records.resolve_integrity_status (and its ui/server mirror),
# idea admission — reads ONLY the report's top-level `verdict` string. That string is written by the
# same LLM pass that wrote the findings, and nothing checked that it agrees with them. A report listing
# a `high` fidelity break ("qualifier dropped") or a `critical` unsupported rating-driver, but closing
# with `verdict: "Minor issues"`, printed GATE-VERIFY: PASS, resolved as "verified", and fed the
# calibration ledger as a clean run. That is the auditor grading its own exam — CLAUDE.md §12 ("do not
# average away a red flag") and §13 (a flag is escalated, not absorbed).
#
# The floor is taken from verify-evidence.md §5 ("Score & verdict"), not invented here:
#   * "Material issues — a high flag ..." and "Failed — any fabricated/unsupported number that drives the
#     rating". So ANY finding whose `severity` is `high` or `critical` (in claim_checks, fidelity_checks,
#     or contradiction_checks — every array that carries a severity field) forbids Clean / Minor issues.
#   * "Clean — all material claims verified ..., math ties, anchors agree." So a `math_checks[]` row with
#     `ties: false`, an `anchor_checks[]` row with `consistent: false`, or any `medium` finding forbids
#     Clean (it may still be Minor issues — whether a math/anchor break "could move the decision" is the
#     verifier's judgment, and this check does not second-guess it upward).
# Deliberately one-directional: a verdict HARSHER than its findings is the conservative error (§4) and
# is never flagged. Nothing here re-grades content or recomputes integrity_score.
BM_DATE = "2026-11-21"

_BM_SEVERITY_ARRAYS = ("claim_checks", "fidelity_checks", "contradiction_checks")


def bm_verdict_floor_violations(report):
    """Pure. Given a parsed verification_report dict, return a list of human-readable reasons the stated
    `verdict` is softer than the report's own findings allow ([] = consistent). A verdict outside
    Clean / Minor issues is never softened by definition (every consumer already treats it as not clean),
    so only Clean / Minor issues can violate the floor. Never raises on malformed rows."""
    if not isinstance(report, dict):
        return []
    verdict = (report.get("verdict") or "").strip() if isinstance(report.get("verdict"), str) else ""
    if verdict not in ("Clean", "Minor issues"):
        return []
    hard, medium = [], []
    for arr in _BM_SEVERITY_ARRAYS:
        rows = report.get(arr)
        if not isinstance(rows, list):
            continue
        for i, row in enumerate(rows):
            if not isinstance(row, dict):
                continue
            sev = row.get("severity")
            sev = sev.strip().lower() if isinstance(sev, str) else ""
            if sev in ("high", "critical"):
                hard.append(f"{arr}[{i}] severity={sev}")
            elif sev == "medium":
                medium.append(f"{arr}[{i}] severity=medium")
    breaks = []
    for arr, key in (("math_checks", "ties"), ("anchor_checks", "consistent")):
        rows = report.get(arr)
        if isinstance(rows, list):
            breaks += [f"{arr}[{i}] {key}=false" for i, r in enumerate(rows)
                       if isinstance(r, dict) and r.get(key) is False]
    reasons = []
    if hard:
        reasons.append(f"verdict {verdict!r} but the report lists {len(hard)} high/critical finding(s) "
                       f"({', '.join(hard[:4])}{' …' if len(hard) > 4 else ''}) — verify-evidence §5 floor is "
                       "'Material issues' (or 'Failed' for an unsupported rating-driver)")
    elif verdict == "Clean" and (medium or breaks):
        found = medium + breaks
        reasons.append(f"verdict 'Clean' but the report lists {len(found)} medium finding(s) / math or anchor "
                       f"break(s) ({', '.join(found[:4])}{' …' if len(found) > 4 else ''}) — verify-evidence §5 "
                       "floor is 'Minor issues'")
    return reasons


def eval_bm_verdict_floor(decision_date, verification_report):
    """Core of check BM. Same input contract as eval_az_contradiction_sweep (`None` = no report, `False` =
    exists-but-unreadable sentinel). Returns (result, reasons): result is 'na' | 'pass' | 'fail'. An
    unreadable or non-dict report is 'na' HERE — AZ already fails it, and F30 already stamps it — so BM
    never double-reports the same defect."""
    if not (isdate(decision_date) and decision_date >= BM_DATE):
        return "na", []
    if not isinstance(verification_report, dict):
        return "na", []
    reasons = bm_verdict_floor_violations(verification_report)
    return ("fail" if reasons else "pass"), reasons
