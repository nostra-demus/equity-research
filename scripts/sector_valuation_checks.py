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
never be valued on an EBITDA-DCF (depreciation is economically real for a REIT, so an
EBITDA-based DCF overstates cash flow). The valuation module's own agents already populate
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
# value / unlevered-cashflow method is a category error, not just FCFF. REITs explicitly forbid
# EBITDA-DCF (depreciation non-economic); FCFF is NOT listed forbidden for a REIT there, so the gate does
# not invent that ban. Tokens are separator-free — "evebit" matches both EV/EBIT and EV/EBITDA; bare "ev"
# is deliberately NOT a token (it would false-match "revenue"/"leverage"/"level").
SECTOR_DATE = "2026-06-18"
_FIN_INSTITUTION_FORBIDDEN = ["fcff", "evebit", "evsales", "ebitdadcf", "netdebtebitda", "enterprisevalue"]
SECTOR_FORBIDDEN = {
    # lowercase key = substring matched against business_type (case-insensitive)
    # value = forbidden tokens, matched against the separator-stripped primary_valuation_method
    "bank": _FIN_INSTITUTION_FORBIDDEN, "lender": _FIN_INSTITUTION_FORBIDDEN, "insur": _FIN_INSTITUTION_FORBIDDEN,
    "reit": ["ebitdadcf"], "real estate": ["ebitdadcf"],
}


def eval_w_sector_valuation(business_type, primary_valuation_method):
    """Core of check W. Returns None when N/A (either field blank), else the list of forbidden-method
    tokens present (empty list = clean). Separator-stripped substring match so hyphen/space spellings
    collapse. Side-effect-free + module-level so `eval.py selftest` can exercise it without a run fixture."""
    bt = (business_type or "").strip(); pvm = (primary_valuation_method or "").strip()
    if not bt or not pvm: return None
    bt_l = bt.lower(); pvm_norm = re.sub(r'[^a-z0-9]+', '', pvm.lower())
    hits = []
    for sec, fmethods in SECTOR_FORBIDDEN.items():
        if sec in bt_l:
            for fm in fmethods:
                if fm in pvm_norm and fm not in hits: hits.append(fm)
    return hits
