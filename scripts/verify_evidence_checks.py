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
