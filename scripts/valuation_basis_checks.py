#!/usr/bin/env python3
"""Basis-comparability invariants over a run's valuation artifacts.

WHY THIS EXISTS. CLAUDE.md is strong on citation (§5) and hygiene (§15), and the engine obeys both.
It is weak on the thing those rules cannot express: whether two numbers of the same KIND were measured
the same way. Seven of the thirteen findings in the 2026-09-30 BURL audit were that one failure —
a bull multiple drawn from an LTM band applied to an NTM denominator, a bear on a GAAP trough priced
into a weighted set against a forward normalized base, a min-max range position printed under the word
"percentile". Each is individually forbidden by prose that was in force when the run shipped, and the
run's own truth-integrity gate returned `Clean` / integrity 100 on all of them.

So prose does not bind here, and an LLM auditor did not either. Only arithmetic over the artifacts does.

DESIGN NOTES, each one paid for by a measurement over the committed corpus:

  * NORMALISE BEFORE COMPARING. `metric_basis` is free text. Comparing the raw strings flags 11 of the
    17 committed sidecars, and most are the same basis written twice ("NTM Revenue" vs
    "NTM Revenue (CIQ consensus)"). Normalising to a (period, measure) pair drops that to 3 real
    mismatches. A check with an 8-in-11 false-positive rate would be turned off within a week, which is
    worse than no check.

  * UNDECLARED IS NOT MISMATCHED. Seven sidecars declare a basis on some cases and not others. That is a
    weaker, different finding than two cases that declare CONFLICTING bases, and it is reported
    separately. Collapsing them would bury the real defect in a pile of paperwork findings.

  * A CROSS-METRIC SET CAN BE LEGITIMATE. EMAAR (a REIT) prices one case off EPS and another off book
    value per share; a pre-profit company may hold an EV/Sales bull against a cash-burn bear. That is
    not automatically an error — it is an error when nobody says why. The escape is a CITED
    `cross_metric_reconciliation`, not a business-type allowlist, because a type list would have to be
    maintained forever and would still be wrong for the next REIT-shaped thing that is not a REIT.

  * SOFT PRESENCE, STRICT VALIDITY. No sidecar, or no declared basis at all, is N/A and never a failure —
    8 of 21 committed runs emit no sidecar, and retro-failing them would say nothing about their
    analysis. A basis that IS declared and IS incoherent is a failure.

Pure, side-effect-free and module-level so `eval.py selftest` can drive every branch without a run
fixture, matching the pattern in valuation_summary_checks.py / scenario_integrity_checks.py.
"""
from __future__ import annotations

import json
import os
import re

# ── basis vocabulary ──────────────────────────────────────────────────────────────────────────────
# Ordered: the first match wins, so the more specific pattern is listed first. `mid_cycle` and `trough`
# precede LTM/NTM deliberately — "mid-cycle NTM EBITDA" is a mid-cycle claim, not a forward one, and the
# period is what makes two cases incomparable.
_PERIOD_PATTERNS = (
    ("mid_cycle", r"mid[-\s]?cycle|through[-\s]?cycle|normali[sz]ed cycle"),
    ("trough", r"\btrough\b|\bdownturn\b|\brecession\b"),
    ("LTM", r"\bLTM\b|\bTTM\b|trailing twelve|\btrailing\b"),
    ("NTM", r"\bNTM\b|next twelve|forward twelve"),
    # FY+1 / FY+2 are documented in the sidecar schema's own metric_basis examples, so they must parse.
    ("FY_REL", r"\bFY\s?\+\s?\d\b"),
    ("FY", r"\bFY\s?\d{2,4}E?\b|\bCY\s?\d{4}\b|\b20\d{2}E\b"),
)

_MEASURE_PATTERNS = (
    ("EBITDA", r"\bEBITDA\b"),          # before EBIT, or "EBITDA" matches the EBIT pattern
    ("EBIT", r"\bEBIT\b"),
    ("EPS", r"\bEPS\b|earnings per share"),
    ("BVPS", r"\bT?BVPS\b|book value"),
    ("FFO", r"\bA?FFO\b"),
    ("NAV", r"\bNAV\b|net asset value"),
    ("FCF", r"\bFCFE?F?\b|free cash flow"),
    ("REVENUE", r"\brevenues?\b|\bsales\b|\bGMV\b"),
)


def normalise_metric_basis(raw):
    """Free text -> (period, measure), either element None when the text does not say.

    Returns None for an absent/blank basis so callers can tell "undeclared" from "declared and
    unparseable" — they are different findings and only one of them is the analyst's fault.
    """
    if not isinstance(raw, str) or not raw.strip():
        return None
    text = raw.strip()

    # THE PERIOD IS THE ONE THE METRIC IS STATED ON — the EARLIEST period token in the string — not any
    # period word appearing anywhere in it. This distinction is the whole check.
    #
    # "FY2026E EBITDA at FY2021-trough EBIT margin applied to FY2026E consensus revenue" is a FY26 metric
    # that happens to source its margin from a trough year: it is re-based, which is exactly what the
    # module now requires. Scanning for the word "trough" anywhere classified it as a trough-period case
    # and flagged two runs (HAIER, INDIAMART) that had done the right thing — a check that punishes
    # compliance is worse than no check, so position decides, not presence.
    hits = []
    for name, rx in _PERIOD_PATTERNS:
        match = re.search(rx, text, re.I)
        if match:
            hits.append((match.start(), name))
    period = min(hits)[1] if hits else None
    if period == "FY_REL":
        match = re.search(r"\bFY\s?\+\s?(\d)\b", text, re.I)
        period = f"FY+{match.group(1)}" if match else "FY+?"
    elif period == "FY":
        # Keep the YEAR: FY27 and FY29 are different periods, and a set mixing them is the same defect
        # as mixing NTM with a trough. Two digits, so FY2027 and FY27 compare equal.
        match = re.search(r"(?:FY\s?\+?|CY\s?)(\d{2,4})", text, re.I) or re.search(r"\b(20\d{2})E\b", text)
        period = f"FY{match.group(1)[-2:]}" if match else "FY"

    measure = next((name for name, rx in _MEASURE_PATTERNS if re.search(rx, text, re.I)), None)
    return (period, measure)


def _weighted_cases(sidecar):
    """The cases that enter the probability-weighted result.

    A case explicitly marked as a sensitivity is excluded: reclassifying a stress case OUT of the
    weighted set is the sanctioned remedy for a basis mismatch, so the check must honour it. It is not
    an escape hatch — scenario_integrity_checks' span test still governs what the remaining set must
    contain, and a set that loses its whole down-leg fails there instead.
    """
    cases = [c for c in (sidecar.get("scenarios") or []) if isinstance(c, dict)]
    if not cases:
        return []

    def label(case):
        return str(case.get("label") or "").strip().lower()

    # The AVOID-RUIN FLOOR IS NOT THE 12-MONTH BEAR. 07 §"Which case it becomes" makes the
    # structural-reset the headline Bear ONLY when the moat trajectory is confirmed eroding; in every
    # other firing it is carried to §24 / Kill Criteria as "the multi-year permanent-impairment
    # scenario, NOT the 12-month bear". So where a run states a cyclical bear AND a structural one, the
    # structural case is a floor outside the weighted set — counting it produced six "partial
    # declaration" findings against runs that had followed the prompt exactly. Where it is the ONLY
    # bear it IS the headline, and it counts.
    structural = [c for c in cases if "structural" in label(c) or "avoid_ruin" in label(c) or "avoid-ruin" in label(c)]
    other_bears = [c for c in cases if "bear" in label(c) and c not in structural]
    floors = structural if (structural and other_bears) else []

    out = []
    for case in cases:
        if str(case.get("set_membership") or "weighted").lower() == "sensitivity":
            continue
        if case in floors:
            continue
        out.append(case)
    return out


def _cited(value) -> bool:
    """A reconciliation must point at something, not merely assert itself."""
    return isinstance(value, str) and len(value.strip()) >= 12


def eval_scenario_basis_coherence(sidecar):
    """Core of the scenario-basis check.

    Returns None when there is nothing to judge (no sidecar, no weighted cases, no declared basis at
    all), else a list of violation strings — empty list meaning pass.

    One probability-weighted set is one economic statement, so its cases must share a period and a
    measure. Mixing a forward normalized denominator with a historical GAAP trough produces a downside
    that is an artefact of the definition change rather than of the downturn it claims to model; on the
    BURL run that single switch carried the entire −74% bear leg.
    """
    if not isinstance(sidecar, dict):
        return None
    cases = _weighted_cases(sidecar)
    if len(cases) < 2:
        return None  # nothing to compare

    normalised = [(case, normalise_metric_basis(case.get("metric_basis"))) for case in cases]
    declared = [(case, norm) for case, norm in normalised if norm is not None]
    if not declared:
        return None  # wholly undeclared -> N/A here; presence is a separate, later gate

    violations = []

    undeclared = [case for case, norm in normalised if norm is None]
    if undeclared:
        labels = ", ".join(str(c.get("label") or "?") for c in undeclared)
        violations.append(
            f"metric_basis declared on {len(declared)} of {len(cases)} weighted cases but missing on: {labels}"
            " — a set is only comparable if every case says what it is measured on"
        )

    # A basis that parses to no period is UNKNOWN, not a period of its own. Letting None join the set
    # manufactured mismatches out of thin air — EMAAR read ['LTM', None] and ORCL ['NTM', None], which
    # together with the trough bug accounted for every period finding this check originally reported.
    periods = {norm[0] for _, norm in declared if norm[0] is not None}
    measures = {norm[1] for _, norm in declared if norm[1] is not None}

    unparsed = [c for c, norm in declared if norm[0] is None]
    if unparsed and periods:
        labels = ", ".join(str(c.get("label") or "?") for c in unparsed)
        violations.append(
            f"metric_basis on {labels} names no period that can be read against the rest of the set "
            f"{sorted(periods)} — state the period (NTM / LTM / FY+1 / FY20XX / mid-cycle / trough)"
        )

    if len(periods) > 1:
        detail = "; ".join(
            f"{c.get('label') or '?'}={c.get('metric_basis')!r}" for c, _ in declared
        )
        violations.append(
            f"weighted cases mix earnings PERIODS {sorted(str(p) for p in periods)} — {detail}"
        )

    if len(measures) > 1 and not _cited(sidecar.get("cross_metric_reconciliation")):
        detail = "; ".join(
            f"{c.get('label') or '?'}={c.get('metric_basis')!r}" for c, _ in declared
        )
        violations.append(
            f"weighted cases mix MEASURES {sorted(str(m) for m in measures)} with no cited "
            f"cross_metric_reconciliation — {detail}"
        )

    return violations


def scan_committed(root="."):
    """Replay every committed sidecar. Returns (checked, failures) where failures is [(run, [violations])].

    Deliberately UNGATED: this is the measurement entry point. Enforcement is date-gated in eval.py so
    older runs are never retro-failed, but a gated measurement would hide exactly the runs the check
    exists to find.
    """
    import glob

    checked, failures = 0, []
    pattern = os.path.join(root, "analyses/*/valuation/valuation_summary.json")
    for path in sorted(glob.glob(pattern)):
        run = os.path.basename(os.path.dirname(os.path.dirname(path)))
        try:
            sidecar = json.load(open(path, encoding="utf-8"))
        except Exception as exc:
            failures.append((run, [f"could not parse valuation_summary.json: {exc}"]))
            checked += 1
            continue
        violations = eval_scenario_basis_coherence(sidecar)
        if violations is None:
            continue  # N/A — not counted as checked
        checked += 1
        if violations:
            failures.append((run, violations))
    return checked, failures


def _selftest() -> int:
    """Drive every branch fixture-free. Returns the number of failed assertions."""
    failed = 0

    def check(name, condition):
        nonlocal failed
        if not condition:
            failed += 1
            print(f"  FAIL {name}")
        else:
            print(f"  ok   {name}")

    # ---- normaliser ----
    check("NTM EPS parses", normalise_metric_basis("NTM EPS") == ("NTM", "EPS"))
    check("free-text suffix is ignored",
          normalise_metric_basis("NTM Revenue (CIQ consensus)") == normalise_metric_basis("NTM revenue"))
    check("EBITDA is not read as EBIT", normalise_metric_basis("NTM EBITDA")[1] == "EBITDA")
    # The PERIOD is the one the metric is stated on. "FY2022 ... trough EPS" is an FY22 metric that
    # happens to be a trough; a sentence that OPENS on the downturn is a trough case. Either way the
    # outcome that matters is identical — both mismatch a forward base — and that is what is asserted,
    # not an internal label.
    check("a metric stated on a fiscal year reads as that year",
          normalise_metric_basis("FY2022 GAAP trough EPS")[0] == "FY22")
    check("a sentence opening on the downturn reads as a trough",
          normalise_metric_basis("A consumer downturn recreates the FY2022 GAAP EPS trough")[0] == "trough")
    check("FY+1 parses (the schema documents it)", normalise_metric_basis("FY+1 EPS")[0] == "FY+1")
    check("bare 'trailing' parses", normalise_metric_basis("trailing EPS")[0] == "LTM")

    # REGRESSION — the real strings this check originally flagged in error. Both bears are re-based onto
    # the forward denominator, which is precisely the remedy the module now mandates, so a check that
    # fires on them punishes compliance.
    haier = {"scenarios": [
        {"label": "bull", "metric_basis": "FY2026E EBITDA (consensus base + bull-case uplifts)"},
        {"label": "base", "metric_basis": "FY2026E consensus EBITDA (Capital IQ)"},
        {"label": "bear_cyclical", "metric_basis":
            "FY2026E EBITDA at FY2021-trough (5.91%) EBIT margin applied to FY2026E consensus revenue"}]}
    check("a trough MARGIN re-based onto a forward period is not a period mismatch",
          not any("PERIOD" in v for v in eval_scenario_basis_coherence(haier)))
    indiamart = {"scenarios": [
        {"label": "bull", "metric_basis": "FY27E EBITDA (Street consensus + favorable levers)"},
        {"label": "base", "metric_basis": "FY27E EBITDA (Street consensus, 15 analysts)"},
        {"label": "bear", "metric_basis":
            "FY27E EBITDA (FY27E revenue x 24% EBIT margin - below the FY23/FY24 prior-trough margin)"}]}
    check("a prior-trough margin cited as a COMPARISON is not a period mismatch",
          not any("PERIOD" in v for v in eval_scenario_basis_coherence(indiamart)))

    # REGRESSION — the avoid-ruin floor is not the 12-month bear (07 "Which case it becomes").
    floor = {"scenarios": [
        {"label": "bull", "metric_basis": "NTM EBITDA"},
        {"label": "base", "metric_basis": "NTM EBITDA"},
        {"label": "bear_cyclical", "metric_basis": "NTM EBITDA"},
        {"label": "bear_structural"}]}
    check("a structural floor beside a cyclical bear is excluded from the weighted set",
          eval_scenario_basis_coherence(floor) == [])
    lone = {"scenarios": [
        {"label": "bull", "metric_basis": "NTM EBITDA"},
        {"label": "base", "metric_basis": "NTM EBITDA"},
        {"label": "bear_structural"}]}
    check("a structural bear that is the ONLY bear still counts",
          any("missing on" in v for v in eval_scenario_basis_coherence(lone)))

    # An unknown period must not masquerade as a different one.
    unknown = {"scenarios": [{"label": "a", "metric_basis": "NTM EPS"},
                             {"label": "b", "metric_basis": "BVPS (AED per share)"}]}
    out_u = eval_scenario_basis_coherence(unknown)
    check("an unparseable period is reported as unknown, not as a mismatch",
          any("names no period" in v for v in out_u) and not any("PERIOD" in v for v in out_u))
    check("mid-cycle is first-class", normalise_metric_basis("mid-cycle EBITDA")[0] == "mid_cycle")
    check("FY keeps its year", normalise_metric_basis("FY27E EBITDA")[0] == "FY27")
    check("FY27 == FY2027", normalise_metric_basis("FY27E EPS") == normalise_metric_basis("FY2027E EPS"))
    check("blank is undeclared", normalise_metric_basis("   ") is None)
    check("non-string is undeclared", normalise_metric_basis(None) is None)

    # ---- coherence ----
    ntm = lambda label: {"label": label, "metric_basis": "NTM EPS"}
    check("no sidecar -> N/A", eval_scenario_basis_coherence(None) is None)
    check("one case -> N/A", eval_scenario_basis_coherence({"scenarios": [ntm("Base")]}) is None)
    check("wholly undeclared -> N/A",
          eval_scenario_basis_coherence({"scenarios": [{"label": "a"}, {"label": "b"}]}) is None)
    check("coherent set passes",
          eval_scenario_basis_coherence({"scenarios": [ntm("Bull"), ntm("Base")]}) == [])

    # The BURL defect, in miniature.
    burl = {"scenarios": [ntm("Bull"), ntm("Base"),
                          {"label": "Bear", "metric_basis": "FY2022 diluted GAAP trough EPS"}]}
    out = eval_scenario_basis_coherence(burl)
    check("BURL-shaped period mix is caught", any("PERIOD" in v for v in out))

    # A measure mix needs a cited reconciliation, not a business type.
    reit = {"scenarios": [{"label": "Bull", "metric_basis": "LTM EPS"},
                          {"label": "Base", "metric_basis": "BVPS (AED per share)"}]}
    check("measure mix is caught", any("MEASURE" in v for v in eval_scenario_basis_coherence(reit)))
    reit_ok = dict(reit, cross_metric_reconciliation="Bridged in 07 §4: BVPS and EPS tie via the FY26 ROE.")
    check("a cited reconciliation clears the measure mix",
          not any("MEASURE" in v for v in eval_scenario_basis_coherence(reit_ok)))
    check("an uncited reconciliation does not clear it",
          any("MEASURE" in v for v in eval_scenario_basis_coherence(dict(reit, cross_metric_reconciliation="yes"))))

    # Partial declaration is reported, and separately from a mismatch.
    partial = {"scenarios": [ntm("Bull"), {"label": "Base"}]}
    out = eval_scenario_basis_coherence(partial)
    check("partial declaration is reported", any("missing on" in v for v in out))
    check("partial declaration is NOT a period mismatch", not any("PERIOD" in v for v in out))

    # A sensitivity case is excluded from the weighted set.
    sens = {"scenarios": [ntm("Bull"), ntm("Base"),
                          {"label": "Stress", "metric_basis": "FY2022 GAAP trough EPS",
                           "set_membership": "sensitivity"}]}
    check("a sensitivity case is excluded", eval_scenario_basis_coherence(sens) == [])

    return failed


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "selftest":
        sys.exit(1 if _selftest() else 0)
    checked, failures = scan_committed(sys.argv[1] if len(sys.argv) > 1 else ".")
    print(f"checked {checked} sidecars with a declared basis; {len(failures)} with findings\n")
    for run, violations in failures:
        print(f"  {run}")
        for v in violations:
            print(f"      - {v}")
    sys.exit(0)
