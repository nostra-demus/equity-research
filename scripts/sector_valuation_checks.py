#!/usr/bin/env python3
"""The §16 sector ↔ valuation-method consistency gate (check W) — CLAUDE.md §16, SECTOR_OVERLAYS.md.

Side-effect-free, importable, doctrine logic — extracted verbatim from `scripts/eval.py`
(check W) so the SAME detection function can run in TWO places instead of one:

1. **Retrospective** — `scripts/eval.py` imports this to grade already-committed runs
   (check W), as it always has.
2. **Live, pre-publish** — `/research:full` Step 10B.1 (the deterministic finish-gate that
   also runs on every `/research:rerun`, per fix F-RRGATE) imports this to check a thesis
   BEFORE it ships, stamping `final_thesis.md` PROVISIONAL on a violation instead of letting
   it commit clean.

The gap this closes: CLAUDE.md §16 requires "method validity matched to business type
(operating vs financial vs REIT vs commodity vs holding company)". `frameworks/SECTOR_OVERLAYS.md`
makes that concrete — a bank/lender/insurer is balance-sheet-funded and must be valued on an
equity-side method (DDM / residual income / P-B / embedded value), never an enterprise-value or
unlevered-cashflow method (FCFF DCF, EV/EBITDA, EV/EBIT, EV/Sales, net-debt/EBITDA); a REIT must
not be headlined on an EBITDA / FCFF DCF or an EV multiple (the valuation module's Business-Type
Method Map, the stricter rule per CLAUDE.md §23). Only the HEADLINE method is judged — a method
named solely as a cross-check or an explicit exclusion is not the one the call is priced on
(`headline_method`). The valuation module's own agents already populate
`decision_record.json.business_type` and `.primary_valuation_method` (synthesizer.md), and
`scripts/eval.py` check W has graded that pair against `SECTOR_FORBIDDEN` since SECTOR_DATE —
but, like checks AA/AB/AG/AN before this module existed for them, W was defined only inline in
`scripts/eval.py`, the one place the live finish-gate could never reach. A bank valued on FCFF
DCF, or a REIT valued on EBITDA-DCF, could still print `GATE: PASS` and commit straight to
`main` (§25/§28), undetected until someone remembered to run `/research:eval` afterward.
Importing this module into the live finish-gate closes that hole the same way it was already
closed for §24/§13 (rating_caps.py), the Headline Scorecard / red-flag / audit trail checks
(headline_checks.py), the valuation-summary sidecar (valuation_summary_checks.py), §10/HARD GATE
11/13 (scenario_integrity_checks.py), and the §18 calibration-feedback gate (calibration_gate_checks.py).

`eval_w_sector_valuation` is pure: given `business_type` and `primary_valuation_method`, it
returns:
  - `None`     — not applicable (either field blank/absent — additive/optional, same convention
                 as `scenarios[]`/`edge_score`)
  - `[]`       — applicable and clean (no forbidden method token present)
  - `[tok...]` — one or more forbidden-method tokens present (a violation)

Both callers treat a non-empty list as a violation and `None`/`[]` as no violation.
"""
import re

# Method substrings SECTOR_OVERLAYS.md forbids per sector type, matched against a SEPARATOR-STRIPPED,
# lowercased primary_valuation_method so "EBITDA-DCF" / "EBITDA DCF" / "ebitdadcf" all collapse to one
# token (a hyphen-literal list would silently miss the spaced spellings). Banks / lenders / insurers are
# balance-sheet-funded financials: SECTOR_OVERLAYS.md values them on equity-side methods (DDM / residual
# income / P-B / embedded value) and says "NOT FCFF/EV ... never net-debt/EBITDA" — so EVERY enterprise-
# value / unlevered-cashflow method is a category error, not just FCFF. REITs: SECTOR_OVERLAYS.md names only
# EBITDA-DCF, but the valuation module's Business-Type Method Map — a Hard Rule and "the single source of
# truth" for method validity (.claude/agents/valuation/MODULE_RULES.md) — says a REIT must "NOT use: EBITDA /
# FCFF DCF (depreciation is non-economic)", and 99_valuation-synthesis.md's checklist bars "an operating-FCFF
# DCF or EV multiple" as the headline for a financial or REIT. CLAUDE.md §23 takes the stricter module rule,
# so a REIT's forbidden set covers FCFF and every EV multiple as well. Tokens are separator-free — "evebit"
# matches both EV/EBIT and EV/EBITDA; bare "ev" is deliberately NOT a token (it would false-match
# "revenue"/"leverage"/"level"). "evsales" AND "evrevenue" are both listed because "EV/Revenue" is used
# interchangeably with "EV/Sales" in this repo; without the "evrevenue" spelling a bank quoted on
# "EV/Revenue" would slip the gate (an EV method is a category error regardless of which synonym is written).
SECTOR_DATE = "2026-06-18"
_FIN_INSTITUTION_FORBIDDEN = ["fcff", "evebit", "evsales", "evrevenue", "ebitdadcf", "netdebtebitda", "enterprisevalue"]
_REIT_FORBIDDEN = ["ebitdadcf", "fcff", "evebit", "evsales", "evrevenue", "enterprisevalue"]
SECTOR_FORBIDDEN = {
    # lowercase key = substring matched against business_type (case-insensitive)
    # value = forbidden tokens, matched against the separator-stripped HEADLINE of primary_valuation_method
    "bank": _FIN_INSTITUTION_FORBIDDEN, "lender": _FIN_INSTITUTION_FORBIDDEN, "insur": _FIN_INSTITUTION_FORBIDDEN,
    "reit": _REIT_FORBIDDEN, "real estate": _REIT_FORBIDDEN,
}

# Only the method a call is PRICED on can break the sector rule — 99_valuation-synthesis.md judges "the
# headline". The free-form field routinely also names methods it merely cross-checks or rules out, and
# reading those mentions as use flags doctrine-valid calls: "Sum-of-the-parts / NAV (corroborated by
# normalized FCFF DCF)" (EMAAR_2026-07-10, a REIT priced on NAV) or "Residual income; FCFF DCF not
# applicable". Every committed record uses one of two grammatical shapes, so the cut follows the grammar:
#   - a PARTICIPLE puts the secondary method AFTER it — "corroborated by X", "cross-checked against X",
#     "cross-validated by X" — so the rest of that ;-clause is dropped;
#   - a NOUN puts it BEFORE — "with X cross-check", "X as a capped cross-check", "X not applicable",
#     "X excluded" — so that with-phrase, or that comma / "+" leg, is dropped.
# A parenthetical aside that only corroborates or excludes is dropped on its own, without taking the
# headline in front of it. Anything not marked as a cross-check or an exclusion still counts: a blend
# ("60% NAV + 40% FCFF DCF") prices the call on every leg it names, so each leg is judged.
_AFTER = re.compile(r"\b(?:corroborated|cross[\s-]?checked|cross[\s-]?validated|sanity[\s-]?checked)\b", re.I)
_XCHECK_NOUN = re.compile(r"\b(?:cross[\s-]?checks?|corroboration|sanity[\s-]?checks?)\b", re.I)
_WITH_XCHECK = re.compile(r"\bwith\b(?=[^;]*" + _XCHECK_NOUN.pattern + r")", re.I)
_EXCLUDED = re.compile(r"\bnot\s+(?:applicable|used|relied|meaningful)\b|\bn/a\b|\binapplicable\b|"
                       r"\bexclud\w*|\breject\w*|\bignored\b|\bdisregard\w*", re.I)
_ASIDE = re.compile(r"\(([^()]*)\)")


def _top_level_split(text, seps):
    """Split on any character in `seps`, but only outside parentheses — "(Multiples-First; 80% combined
    weight)" is one aside, not two clauses (ORCL_2026-08-14)."""
    parts, depth, cur = [], 0, []
    for ch in text:
        depth += (ch == "(") - (ch == ")" and depth > 0)
        if ch in seps and depth == 0:
            parts.append("".join(cur)); cur = []
        else:
            cur.append(ch)
    parts.append("".join(cur))
    return parts


def headline_method(primary_valuation_method):
    """The part of a free-form primary_valuation_method the call is priced on: cross-checks and explicit
    exclusions removed per the grammar note above. Returns "" when nothing but asides remains."""
    text = primary_valuation_method
    while True:  # innermost-first, so a nested aside cannot shield an outer one
        stripped = _ASIDE.sub(lambda m: " " if (_AFTER.search(m.group(1)) or _XCHECK_NOUN.search(m.group(1))
                                                or _EXCLUDED.search(m.group(1))) else m.group(0), text)
        if stripped == text: break
        text = stripped
    kept = []
    for clause in _top_level_split(text, ";"):
        for rx in (_AFTER, _WITH_XCHECK):
            m = rx.search(clause)
            if m: clause = clause[:m.start()]
        kept += [seg for seg in _top_level_split(clause, ",+")
                 if seg.strip() and not (_EXCLUDED.search(seg) or _XCHECK_NOUN.search(seg))]
    return " ".join(seg.strip() for seg in kept)


def eval_w_sector_valuation(business_type, primary_valuation_method):
    """Core of check W. Returns None when N/A (either field blank), else the list of forbidden-method
    tokens present (empty list = clean). Separator-stripped substring match so hyphen/space spellings
    collapse. Side-effect-free + module-level so `eval.py selftest` can exercise it without a run fixture."""
    # Type-safe: a non-string field (a list/number from a malformed decision_record.json) degrades to
    # N/A instead of raising AttributeError on .strip() — both callers (eval.py grader and the live
    # Step 10B.1 finish-gate) pass raw JSON values straight in, and a crash there would kill the whole
    # gate before it emits a GATE:/PROVISIONAL result. Presence + type of these additive fields is
    # separately enforced by eval.py's B_schema check; W only judges validity when both are usable strings.
    bt = business_type.strip() if isinstance(business_type, str) else ""
    pvm = primary_valuation_method.strip() if isinstance(primary_valuation_method, str) else ""
    if not bt or not pvm: return None
    # Match the sector against the CANONICAL classification only — the text before any parenthetical
    # qualifier — so a free-form aside ("SaaS / subscription software (insurance vertical)", "Generic
    # operating company (banking software vendor)") is not mis-read as a financial/REIT and made to wrongly
    # forbid an otherwise-valid method. business_type routinely carries such parentheticals (synthesizer.md).
    # Judge only the HEADLINE method (see headline_method): a method named solely as a cross-check or an
    # explicit exclusion is not the method the call is priced on.
    bt_l = bt.lower().split("(", 1)[0]; pvm_norm = re.sub(r'[^a-z0-9]+', '', headline_method(pvm).lower())
    hits = []
    for sec, fmethods in SECTOR_FORBIDDEN.items():
        if sec in bt_l:
            for fm in fmethods:
                if fm in pvm_norm and fm not in hits: hits.append(fm)
    return hits
