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
    at, period = min(hits) if hits else (0, None)
    if period == "FY_REL":
        match = re.search(r"\bFY\s?\+\s?(\d)\b", text[at:], re.I)
        period = f"FY+{match.group(1)}" if match else "FY+?"
    elif period == "FY":
        # Keep the YEAR: FY27 and FY29 are different periods, and a set mixing them is the same defect
        # as mixing NTM with a trough. Two digits, so FY2027 and FY27 compare equal.
        #
        # Read the year FROM THE TOKEN THAT WON ON POSITION (`text[at:]`), not from the whole string.
        # The year regex below is deliberately looser than the _PERIOD_PATTERNS one (it accepts a
        # two-digit CY and needs no trailing word boundary), so searching from position 0 could lift a
        # year out of a token the period scan had already rejected: "CY26 normalized EBITDA rolled to
        # FY2029E" is an FY29 metric whose period used to resolve to FY26, inventing a mismatch
        # against an FY29 set — or hiding a real one.
        match = re.search(r"(?:FY\s?\+?|CY\s?)(\d{2,4})", text[at:], re.I) or re.search(r"\b(20\d{2})E\b", text[at:])
        period = f"FY{match.group(1)[-2:]}" if match else "FY"

    measure = next((name for name, rx in _MEASURE_PATTERNS if re.search(rx, text, re.I)), None)
    return (period, measure)


def case_basis(case):
    """A case's (period, measure), preferring what the author DECLARED over what prose implies.

    `metric_period` / `metric_measure` are authoritative when present; `metric_basis` is parsed only to
    fill what they leave out. The declared path exists because the parsed one is lossy and fails
    silently: "FY2026E EBITDA at FY2021-trough margin applied to FY2026E consensus revenue" is a FY26
    case — a trough margin re-based onto a forward denominator, exactly what 07 mandates — and reading
    a period token out of that sentence called it a trough case and reported a mismatch against the
    run's own forward base. The check was flagging the remedy. A declared field ends that argument
    rather than deferring it to the next prose variant.

    Returns None only when neither route says anything, so callers can still tell "undeclared" from
    "declared and unparseable".
    """
    if not isinstance(case, dict):
        return None
    period = case.get("metric_period")
    measure = case.get("metric_measure")
    period = period.strip() if isinstance(period, str) and period.strip() else None
    measure = measure.strip() if isinstance(measure, str) and measure.strip() else None

    if period is not None:
        # Normalise the DECLARED token through the same vocabulary, so "FY2027" and "FY27" and a
        # free-text "FY2027E EBITDA" all compare equal. A declared token the vocabulary does not
        # recognise is kept verbatim rather than discarded — the author may be naming a measure or
        # period this engine has not met, which the open vocabulary exists to allow.
        parsed = normalise_metric_basis(period)
        if parsed and parsed[0] is not None:
            period = parsed[0]
    if measure is not None:
        parsed = normalise_metric_basis(measure)
        if parsed and parsed[1] is not None:
            measure = parsed[1]

    if period is not None and measure is not None:
        return (period, measure)

    inferred = normalise_metric_basis(case.get("metric_basis"))
    if inferred is None:
        return (period, measure) if (period is not None or measure is not None) else None
    return (period if period is not None else inferred[0],
            measure if measure is not None else inferred[1])


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

    # MEMBERSHIP IS DECLARED, NEVER GUESSED FROM THE LABEL. An earlier revision excluded a
    # `bear_structural` case whenever a cyclical bear sat beside it, on the reading that 07
    # §"Which case it becomes" carries the avoid-ruin floor to §24 rather than pricing it. The committed
    # corpus says otherwise: in EVERY run that emits one — HAIER, ORCL, SMPL, UBER, TSLA, DHER — the
    # master synthesizer gives the structural case a real probability inside the set that sums to 100%
    # (ORCL: 20% at $31.44 against a $133.77 base, on an impaired-FCFF DCF, i.e. a different MEASURE
    # from the NTM EBITDA the other three cases are priced on). Guessing it out of the set therefore
    # blessed the exact BURL-class defect this check exists to catch, on five of the six runs that had
    # one. So the ONLY thing that removes a case from the weighted set is the run saying so —
    # `set_membership: "sensitivity"`, the field 99_valuation-synthesis emits for a case 07
    # deliberately held outside the weighted aggregate.
    #
    # The six "partial declaration" findings this exclusion was added to silence were true findings:
    # those structural cases really do carry weight and really do not declare a basis.
    return [case for case in cases
            if str(case.get("set_membership") or "weighted").lower() != "sensitivity"]


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

    normalised = [(case, case_basis(case)) for case in cases]
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


# ── enforcement gate ──────────────────────────────────────────────────────────────────────────────
# The rule is armed by DATE, not by merging this file. Two thirds of the committed corpus predates it —
# 34 of 51 run folders emit no sidecar at all — and failing work whose authors were never told the rule
# is enforcement by ambush. The established idiom in eval.py (AY_DATE, AZ_DATE, SECTOR_DATE) is a dated
# forward gate, and this follows it exactly.
#
# DO NOT LET THIS DATE ARRIVE UNTIL A FROZEN-INPUT CANARY HAS PROVEN THE EMITTER ACTUALLY WRITES
# `set_membership` AND `cross_metric_reconciliation` ON A REAL RUN. Those fields are introduced by a
# prompt change, and a prompt change cannot be validated by replaying frozen artifacts — the artifacts
# were produced by the old prompt. If the canary has not run, move the date; an armed gate against an
# emitter that does not comply fails every new run for a reason the author cannot fix.
BF_ENFORCE_DATE = "2026-11-01"

# SIDECAR PRESENCE ARMS SEPARATELY, AND IS CURRENTLY OFF. These are two different demands wearing one
# date. "Your declared bases disagree" is a defect in work that was done; "you emitted no sidecar" is a
# demand that a different artifact exist at all, and the engine does not reliably produce it today:
#
#     BURL 2026-09-29, V 2026-09-23, AKAM 2026-09-15, AKAM 2026-09-14, NU 2026-08-31
#
# — the five most recent full runs carrying scenarios, every one of which ran the whole valuation module
# and emitted no valuation_summary.json. 99_valuation-synthesis calls emitting it a "(Hard Rule)" while
# /research:full treats a missing sidecar as "N/A, never a violation", and the runs follow the latter.
#
# Arming presence against that record would red CI on the first new run and keep it red for every code
# PR until someone noticed, which is how a gate gets switched off permanently instead of fixed. So it
# stays None (never enforced) until emission is demonstrably reliable — the fix belongs in the emitter,
# not in a date. Set it to a date only once consecutive real runs are observed to emit the sidecar.
BF_SIDECAR_REQUIRED_DATE = None


def _isdate(value) -> bool:
    return isinstance(value, str) and len(value) == 10 and value[4] == "-" and value[7] == "-"


def _presence_would_fail(decision_date, required_date):
    """Exercise the presence branch without mutating the module constant — so the disabled path is
    still covered by a test instead of being dead code nobody has run."""
    return _isdate(required_date) and _isdate(decision_date) and decision_date >= required_date


def eval_bf_basis_enforcement(decision_date, sidecar, violations):
    """Core of the dated enforcement gate. Returns 'pass' | 'fail' | 'na'.

    `violations` is eval_scenario_basis_coherence's result for this run (None = nothing to judge).

    An UNDATED run is 'na'. That is deliberate and it is a known hole: a run carrying no decision_date
    cannot be placed on either side of a forward gate, and guessing from the folder name would make the
    gate depend on a filename convention rather than on the thesis's own stated date. It is reported by
    the scan so the hole is visible rather than silent.
    """
    if not _isdate(decision_date) or decision_date < BF_ENFORCE_DATE:
        return "na"
    if sidecar is None:
        # The sidecar is the only artifact carrying per-case basis, so a run without one cannot be
        # checked at all — which is exactly how the BURL run passed every gate it had. That remains
        # true, and it is still not a reason to fail a run today: see BF_SIDECAR_REQUIRED_DATE.
        if _isdate(BF_SIDECAR_REQUIRED_DATE) and decision_date >= BF_SIDECAR_REQUIRED_DATE:
            return "fail"
        return "na"
    if violations is None:
        return "pass"
    return "fail" if violations else "pass"


def scan_committed(root="."):
    """Replay every committed sidecar. Returns (checked, failures) where failures is [(run, [violations])].

    Deliberately UNGATED: this is the measurement entry point. Enforcement is date-gated in eval.py so
    older runs are never retro-failed, but a gated measurement would hide exactly the runs the check
    exists to find.
    """
    import glob

    # Walk the UNION of runs that have a decision_record OR a sidecar. A sidecar-only run is a real,
    # normal state — a partial run the per-run loop skips — and check AP scans those deliberately for
    # the same reason. Walking decision records alone silently dropped one (TSLA_2026-07-24), which is
    # the quietest kind of coverage regression: the finding count falls and nothing says why.
    run_dirs = {os.path.dirname(p) for p in glob.glob(os.path.join(root, "analyses/*/decision_record.json"))}
    run_dirs |= {os.path.dirname(os.path.dirname(p))
                 for p in glob.glob(os.path.join(root, "analyses/*/valuation/valuation_summary.json"))}

    checked, failures, enforced = 0, [], []
    for run_dir in sorted(run_dirs):
        run = os.path.basename(run_dir)
        dr_path = os.path.join(run_dir, "decision_record.json")
        try:
            decision = json.load(open(dr_path, encoding="utf-8")) if os.path.exists(dr_path) else {}
        except Exception:
            decision = {}
        decision_date = decision.get("decision_date")

        sc_path = os.path.join(run_dir, "valuation", "valuation_summary.json")
        sidecar, parse_error = None, None
        if os.path.exists(sc_path):
            try:
                sidecar = json.load(open(sc_path, encoding="utf-8"))
            except Exception as exc:
                parse_error = f"could not parse valuation_summary.json: {exc}"

        violations = None if parse_error else eval_scenario_basis_coherence(sidecar)
        if parse_error:
            violations = [parse_error]

        if violations:
            checked += 1
            failures.append((run, violations))
        elif violations is not None:
            checked += 1

        verdict = eval_bf_basis_enforcement(decision_date, sidecar, violations)
        if verdict == "fail":
            why = violations or [f"no valuation_summary.json — required for runs dated on/after {BF_ENFORCE_DATE}"]
            enforced.append((run, why))
    return checked, failures, enforced


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

    # REGRESSION — membership is DECLARED, never guessed from the label. The ORCL shape: a
    # `bear_structural` case that the committed decision_record weights at 20% on an impaired-FCFF DCF
    # while the other three cases are priced on NTM EBITDA. Excluding it by label reported this set as
    # clean, which is the BURL defect wearing a different label.
    orcl = {"scenarios": [
        {"label": "bull", "metric_basis": "NTM (FY2027) EBITDA"},
        {"label": "base", "metric_basis": "NTM (FY2027) consensus EBITDA"},
        {"label": "bear_cyclical", "metric_basis": "NTM (FY2027) EBITDA, pullback"},
        {"label": "bear_structural", "metric_basis":
            "24-36 month structural reset — declining-perpetuity (impaired FCFF) DCF"}]}
    out_o = eval_scenario_basis_coherence(orcl)
    check("a weighted structural case on another MEASURE is caught", any("MEASURE" in v for v in out_o))
    floor = {"scenarios": [
        {"label": "bull", "metric_basis": "NTM EBITDA"},
        {"label": "base", "metric_basis": "NTM EBITDA"},
        {"label": "bear_cyclical", "metric_basis": "NTM EBITDA"},
        {"label": "bear_structural"}]}
    check("an UNdeclared structural floor is still part of the set it was emitted into",
          any("missing on" in v for v in eval_scenario_basis_coherence(floor)))
    declared_floor = dict(floor, scenarios=floor["scenarios"][:3] + [
        {"label": "bear_structural", "set_membership": "sensitivity"}])
    check("a structural floor DECLARED as a sensitivity is excluded",
          eval_scenario_basis_coherence(declared_floor) == [])
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
    # REGRESSION — the year comes from the token that won on position, not from anywhere in the string.
    check("the year is read from the winning period token",
          normalise_metric_basis("CY26 normalized EBITDA rolled to FY2029E")[0] == "FY29")
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

    # ---- declared basis beats parsed prose ----
    check("a declared period wins over the prose",
          case_basis({"metric_period": "FY2026", "metric_basis": "FY2021-trough margin"})[0] == "FY26")
    check("a declared measure wins over the prose",
          case_basis({"metric_measure": "EBITDA", "metric_basis": "NTM EPS"})[1] == "EBITDA")
    check("declared tokens normalise (FY2027 == FY27)",
          case_basis({"metric_period": "FY2027"}) [0] == case_basis({"metric_period": "FY27"})[0])
    check("a half-declared case fills the rest from prose",
          case_basis({"metric_period": "NTM", "metric_basis": "something EBITDA-ish"}) == ("NTM", "EBITDA"))
    check("no declaration falls back to the prose entirely",
          case_basis({"metric_basis": "NTM EPS"}) == ("NTM", "EPS"))
    check("nothing declared and no prose is still undeclared",
          case_basis({"label": "bear"}) is None)
    check("an unrecognised declared token is kept, not dropped",
          case_basis({"metric_measure": "embedded_value"})[1] == "embedded_value")

    # THE REGRESSION THIS FIELD EXISTS FOR: the re-based bear that the prose parser misread.
    haier_declared = {"scenarios": [
        {"label": "bull", "metric_period": "FY2026", "metric_measure": "EBITDA",
         "metric_basis": "FY2026E EBITDA (consensus base + bull uplifts)"},
        {"label": "base", "metric_period": "FY2026", "metric_measure": "EBITDA",
         "metric_basis": "FY2026E consensus EBITDA"},
        {"label": "bear_cyclical", "metric_period": "FY2026", "metric_measure": "EBITDA",
         "metric_basis": "FY2026E EBITDA at FY2021-trough margin applied to FY2026E consensus revenue"}]}
    check("a declared FY26 bear is clean even though its prose says trough",
          eval_scenario_basis_coherence(haier_declared) == [])
    burl_declared = {"scenarios": [
        {"label": "Bull", "metric_period": "NTM", "metric_measure": "EPS", "metric_basis": "NTM EPS $13.00"},
        {"label": "Base", "metric_period": "NTM", "metric_measure": "EPS", "metric_basis": "NTM EPS $12.06"},
        {"label": "Bear", "metric_period": "trough", "metric_measure": "EPS",
         "metric_basis": "FY2022 diluted GAAP trough EPS $3.49"}]}
    check("a declared trough bear against a declared NTM base still fires",
          any("PERIOD" in v for v in eval_scenario_basis_coherence(burl_declared)))

    # ---- the dated enforcement gate ----
    v_none, v_ok, v_bad = None, [], ["something"]
    sc = {"scenarios": []}
    check("a run before the gate is never enforced",
          eval_bf_basis_enforcement("2026-07-10", sc, v_bad) == "na")
    check("an UNDATED run is na, not a silent pass",
          eval_bf_basis_enforcement(None, sc, v_bad) == "na")
    check("a malformed date is na",
          eval_bf_basis_enforcement("Oct 2026", sc, v_bad) == "na")
    check("past the gate, findings fail",
          eval_bf_basis_enforcement("2026-12-01", sc, v_bad) == "fail")
    check("past the gate, a clean run passes",
          eval_bf_basis_enforcement("2026-12-01", sc, v_ok) == "pass")
    check("past the gate, nothing-to-judge passes",
          eval_bf_basis_enforcement("2026-12-01", sc, v_none) == "pass")
    # Presence is a SEPARATE demand on a separate gate, currently disabled — the five most recent full
    # runs emit no sidecar, so arming it would red CI on the first new run.
    check("a missing sidecar does NOT fail while presence is disabled",
          BF_SIDECAR_REQUIRED_DATE is None
          and eval_bf_basis_enforcement("2026-12-01", None, v_none) == "na")
    check("before the gate, a missing sidecar is na",
          eval_bf_basis_enforcement("2026-07-10", None, v_none) == "na")
    check("presence failing is reachable once its own date is set",
          _presence_would_fail("2026-12-01", "2026-11-15"))
    check("the gate date is in the future relative to the corpus",
          BF_ENFORCE_DATE > "2026-10-01")

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
    checked, failures, enforced = scan_committed(sys.argv[1] if len(sys.argv) > 1 else ".")
    print(f"checked {checked} run(s) with a judgeable basis; {len(failures)} with findings; "
          f"{len(enforced)} past the {BF_ENFORCE_DATE} gate\n")
    # Print the UNION. A run past the gate with NO sidecar is enforced without ever appearing in
    # `failures` (there was nothing to judge), so iterating failures alone exits 1 against a count line
    # and no explanation — the author is told the gate fired and not which run or why.
    enforced_by_run = dict(enforced)
    for run, violations in failures:
        print(f"  {run}{'   [ENFORCED]' if run in enforced_by_run else ''}")
        for v in violations:
            print(f"      - {v}")
    for run, why in enforced:
        if any(run == r for r, _ in failures):
            continue
        print(f"  {run}   [ENFORCED]")
        for v in why:
            print(f"      - {v}")
    sys.exit(1 if enforced else 0)
