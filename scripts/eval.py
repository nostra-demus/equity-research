#!/usr/bin/env python3
"""Deterministic eval harness for the equity-research engine.

Checks invariants A-Z, AA-AO, and J (framework-source contracts) against every committed
decision record in analyses/. Called by /research:eval and by CI.

Usage:
    python3 scripts/eval.py [TICKER_OR_RUN | all]

Exit 0 = all checks PASS; 1 = at least one FAIL.
"""
import json, glob, os, re, sys, subprocess, datetime
scope = (sys.argv[1] if len(sys.argv)>1 else "").strip() or "all"
today = subprocess.check_output(["date","+%F"]).decode().strip()

REQ=["schema_version","ticker","company_name","exchange","currency","decision_date","run_root","final_thesis_path","decision","suggested_action","paper_treatment","basket","entry_price","entry_price_source","entry_price_timestamp","benchmark","sector_benchmark","time_horizon","expected_return_pct","downside_risk_pct","risk_reward","confidence_score","data_sufficiency_score","rating_cap","thesis_type","variant_perception_summary","what_everyone_knows","what_is_priced_in","what_market_may_be_missing","killer_risk","kill_criteria","forecast_ledger","module_scores","red_flags","missing_data","review_schedule","created_by","notes"]
ARRAYS=["thesis_type","kill_criteria","forecast_ledger","red_flags","missing_data"]; OBJECTS=["module_scores","review_schedule"]
DECISIONS={"Strong Buy":"Selected","Buy":"Selected","Starter Position Only":"Selected","Watchlist":"Watchlist","Avoid":"Rejected","Short Candidate":"Short","Pair Trade / Hedge Required":"Pair Trade","Insufficient Data — Refuse To Rate":"Insufficient Data"}
PAPER_KW={"Selected":["paper long","small paper long","long"],"Watchlist":["no trade","opportunity cost"],"Rejected":["no trade","avoided","foregone"],"Short":["paper short","short"],"Pair Trade":["pair"],"Insufficient Data":["no trade","process quality"]}
SCHEMA_FILES={"decision_record.json","final_thesis.md","RUN_METADATA.md","verification_report.json","pre_mortem.json","expectations_gap.json","memo.md","audit_dossier.md"}
# module roster for check R (rerun targets must be real modules) — self-discovered, never hardcoded (CLAUDE.md §26)
ROSTER=set(os.path.basename(os.path.dirname(p)) for p in glob.glob(".claude/agents/*/99_*-synthesis.md"))
# calibration summaries for check AG (Phase 6 calibration-feedback gate, DECISION_LEDGER.md §18) — repo-wide,
# not per-run, so resolved once here rather than re-globbed per run.
CALIB_SUMMARIES=sorted(glob.glob("analyses/performance/*_calibration_summary.json"))
def _calib_summary_asof(decision_date):
    """Latest calibration_summary.json dated on/before decision_date (a synthesizer can only act on
    calibration history that existed when it ran), or None if none qualifies. Ties (same date, e.g. a
    `_v2` correction) broken by filename so the versioned correction wins, matching the convention
    /research:calibrate itself uses ("_v2 suffix if one already exists for today")."""
    if not isdate(decision_date): return None
    best=None; best_date=None
    for p in CALIB_SUMMARIES:
        m=re.match(r"(\d{4}-\d{2}-\d{2})_calibration_summary", os.path.basename(p))
        if not m: continue
        fdate=m.group(1)
        if fdate>decision_date: continue
        if best_date is None or fdate>best_date or (fdate==best_date and os.path.basename(p)>os.path.basename(best)):
            best=p; best_date=fdate
    if best is None: return None
    try: return json.load(open(best))
    except Exception: return None

def isdate(s): 
    try: datetime.date.fromisoformat(s); return True
    except: return False
def isnum(v): return isinstance(v,(int,float)) and not isinstance(v,bool)  # bool is an int subclass — exclude it [review fix]

# ── Check W (sector ↔ valuation-method consistency) — module-level so the `selftest` scope can drive it ──
# Method substrings SECTOR_OVERLAYS.md forbids per sector type, matched against a SEPARATOR-STRIPPED,
# lowercased primary_valuation_method so "EBITDA-DCF" / "EBITDA DCF" / "ebitdadcf" all collapse to one
# token (the old hyphen-literal list silently missed the spaced spellings). Banks / lenders / insurers are
# balance-sheet-funded financials: SECTOR_OVERLAYS.md values them on equity-side methods (DDM / residual
# income / P-B / embedded value) and says "NOT FCFF/EV ... never net-debt/EBITDA" — so EVERY enterprise-
# value / unlevered-cashflow method is a category error, not just FCFF (the old list caught only "fcff").
# REITs explicitly forbid EBITDA-DCF (depreciation non-economic); FCFF is NOT listed forbidden for a REIT
# there, so the gate does not invent that ban. Tokens are separator-free — "evebit" matches both EV/EBIT
# and EV/EBITDA; bare "ev" is deliberately NOT a token (it would false-match "revenue"/"leverage"/"level").
SECTOR_DATE="2026-06-18"
_FIN_INSTITUTION_FORBIDDEN=["fcff","evebit","evsales","ebitdadcf","netdebtebitda","enterprisevalue"]
SECTOR_FORBIDDEN={
    # lowercase key = substring matched against business_type (case-insensitive)
    # value = forbidden tokens, matched against the separator-stripped primary_valuation_method
    "bank":_FIN_INSTITUTION_FORBIDDEN,"lender":_FIN_INSTITUTION_FORBIDDEN,"insur":_FIN_INSTITUTION_FORBIDDEN,
    "reit":["ebitdadcf"],"real estate":["ebitdadcf"],
}
def eval_w_sector_valuation(business_type, primary_valuation_method):
    """Core of check W. Returns None when N/A (either field blank), else the list of forbidden-method
    tokens present (empty list = clean). Separator-stripped substring match so hyphen/space spellings
    collapse. Side-effect-free + module-level so `eval.py selftest` can exercise it without a run fixture."""
    bt=(business_type or "").strip(); pvm=(primary_valuation_method or "").strip()
    if not bt or not pvm: return None
    bt_l=bt.lower(); pvm_norm=re.sub(r'[^a-z0-9]+','',pvm.lower())
    hits=[]
    for sec,fmethods in SECTOR_FORBIDDEN.items():
        if sec in bt_l:
            for fm in fmethods:
                if fm in pvm_norm and fm not in hits: hits.append(fm)
    return hits

# ── Check X (conviction-run evidence-integrity floor) — module-level so `eval.py selftest` can drive it ──
# A run in a conviction basket (Selected/Short) dated >= VERIFY_FLOOR_DATE must carry a verify-evidence
# verdict in ACCEPTABLE_VERDICTS. "Material issues" / "Failed" mean the audit is unresolved, so committing
# a conviction position is false confidence (closes the G/O/X trilogy). verify-evidence's 4-value enum is
# Clean / Minor issues / Material issues / Failed (see .claude/commands/research/verify-evidence.md).
VERIFY_FLOOR_DATE="2026-06-19"
ACCEPTABLE_VERDICTS={"Clean","Minor issues"}
def eval_x_verify_floor(decision, decision_date, verdict):
    """Core of check X. Returns 'pass' | 'fail' | 'na'. `verdict` is the verification_report verdict
    string, or None when there is no report. Side-effect-free + module-level so the selftest can drive
    the full date / basket / verdict logic without a run fixture."""
    if not (isdate(decision_date) and decision_date>=VERIFY_FLOOR_DATE and DECISIONS.get(decision) in ("Selected","Short")):
        return "na"
    if verdict is None: return "na"
    return "pass" if str(verdict).strip() in ACCEPTABLE_VERDICTS else "fail"

# ── Check Y (§11 data-sufficiency cap) — module-level so `eval.py selftest` can drive it ──
# CLAUDE.md §11 / synthesizer.md Rating Cap Rules: data_sufficiency_score < 30 → the decision MUST be the
# §18 "Insufficient Data — Refuse To Rate"; 30–49 → maximum rating "Watchlist", so NO conviction position
# may be emitted. A "conviction position" is the Selected long basket AND a Short — matching how checks
# O/U/X define it (DECISIONS basket in {"Selected","Short"}); check U caps a broken thesis to "Watchlist
# or lower" by forbidding BOTH, so check Y must too (a thin-data short is a capital-at-risk position with
# unbounded downside — §24). Pair Trade is intentionally left out: a market-neutral hedge carries no
# directional capital at risk, and the §-distress rule (synthesizer.md) already governs it. A null/non-
# numeric score on a conviction rating FAILs — data_sufficiency_score is a required /100 field
# (DECISION_LEDGER.md §5); a null must not buy a free pass a low score would not.
INSUF_THRESHOLD=30
DATASUF_CONVICTION_FLOOR=50
INSUF_DECISION="Insufficient Data — Refuse To Rate"
HIGH_CONVICTION_DECISIONS={"Strong Buy","Buy","Starter Position Only","Short Candidate"}  # conviction positions (Selected longs + Short), per checks O/U/X
def eval_y_data_sufficiency(decision, ds):
    """Core of check Y. Returns 'fail' | 'na' | 'pass'. `ds` is data_sufficiency_score (number) or
    None/non-numeric. Side-effect-free + module-level so the selftest drives every branch fixture-free."""
    if isnum(ds):
        if ds<INSUF_THRESHOLD and decision!=INSUF_DECISION: return "fail"  # <30 → must be Refuse-To-Rate
        if INSUF_THRESHOLD<=ds<DATASUF_CONVICTION_FLOOR and decision in HIGH_CONVICTION_DECISIONS: return "fail"  # 30-49 caps conviction
        return "pass"
    return "fail" if decision in HIGH_CONVICTION_DECISIONS else "na"  # null score: fail a conviction rating, else N/A

# ── Check Z (§14 thesis_type enum + external-variable conviction cap) ─────────────────────────────
# CLAUDE.md §14 defines a closed set of thesis-type strings. The decision-record schema requires
# thesis_type[] be populated from this set; DECISION_LEDGER.md §5 lists the exact canonical casing.
# Without this gate, the synthesizer has produced inconsistent values (e.g. "sector-cycle" instead
# of "Sector-cycle"), silently breaking Phase 4 Brier-score calibration by thesis type.
#
# The synthesizer's Rating Cap Rules add a second constraint: a thesis with ANY external-variable-
# dominant type (Macro-conditional, Policy-conditional, Commodity-conditional, FX/rates, Liquidity/
# positioning) and NO proven edge (edge_score < 50 or absent) must NOT exceed "Starter Position Only".
# "Strong Buy" and "Buy" sit above that ceiling; committing one on an unproven external-variable bet
# is a false-confidence defect identical in kind to the data-sufficiency gap check Y closes.
#
# Landing date: 2026-06-21 (forward-looking; existing pre-gate runs are N/A so the golden suite stays green).
THESIS_TYPE_ENUM = {
    "Company-specific", "Sector-cycle", "Macro-conditional",
    "Policy-conditional", "Commodity-conditional", "FX / rates",
    "Liquidity / positioning", "Governance turnaround",
    "Balance-sheet survival", "Pair trade / hedge", "Insufficient data",
}
# External-variable-dominant types per the synthesizer.md Rating Cap Rules
EXTERNAL_TYPES = {
    "Macro-conditional", "Policy-conditional", "Commodity-conditional",
    "FX / rates", "Liquidity / positioning",
}
THESIS_Z_DATE = "2026-06-21"
# Decisions that EXCEED the "maximum Starter Position Only" cap ceiling for an unproven external-variable
# thesis. Both the conviction longs (Strong Buy, Buy) AND the conviction short (Short Candidate) are
# capital-at-risk directional ratings: eval.py already treats Short Candidate as a conviction position in
# HIGH_CONVICTION_DECISIONS (checks O/U/X) and caps it on weak data exactly like a Buy (check Y), so a
# no-edge macro/commodity/policy SHORT is the same false-confidence defect as a no-edge Buy and must be
# capped identically (synthesizer.md Rating Cap Rules + CLAUDE.md §14 "downgrade conviction").
ABOVE_STARTER_POSITION = {"Strong Buy", "Buy", "Short Candidate"}

def eval_z_thesis_type_cap(thesis_type, decision, edge_score):
    """Core of check Z. Returns 'pass' | 'fail' | 'na'. Side-effect-free so the selftest can drive
    every branch fixture-free.
    (1) thesis_type must be a NON-EMPTY list; CLAUDE.md §14 requires every thesis to classify itself
        as one of the closed-set types (an empty array = no classification = FAIL, not a free pass).
    (2) Every element must be a string in THESIS_TYPE_ENUM (CLAUDE.md §14, case-exact). A non-string
        element (dict/number) is an enum violation, NOT a crash — membership is tested string-first so
        an unhashable element can never raise TypeError and abort the harness.
    (3) If ANY value is external-variable-dominant (EXTERNAL_TYPES) and edge is not proven
        (edge_score < 50 or absent), the decision must be ≤ 'Starter Position Only'
        (synthesizer.md Rating Cap Rules: 'Macro / commodity / policy-driven thesis with weak
        company-specific edge: maximum Starter Position Only').
    """
    if not isinstance(thesis_type, list):
        return "na"   # type check belongs to B (ARRAYS); skip Z when thesis_type isn't a list
    if not thesis_type:
        return "fail"  # empty array — §14 requires a classification; missing one is a defect
    # string-first guard: a non-string element is unhashable-safe and counts as an enum violation
    unknown = [t for t in thesis_type if not isinstance(t, str) or t not in THESIS_TYPE_ENUM]
    if unknown:
        return "fail"  # enum violation (wrong casing / unknown value / non-string element)
    has_external = any(t in EXTERNAL_TYPES for t in thesis_type)
    if not has_external:
        return "pass"   # no external-variable-dominant type → no conviction cap applies
    proven_edge = isnum(edge_score) and edge_score >= 50
    if not proven_edge and decision in ABOVE_STARTER_POSITION:
        return "fail"   # conviction rating on an external-variable bet with no proven edge
    return "pass"

# ── Check T probability-scale (extended T gate) — module-level so `eval.py selftest` can drive it ──
# DECISION_LEDGER §6 / CLAUDE.md §10 require forecast_ledger[].probability to use the §10 percentage-
# point scale (Remote: 0–10, Very unlikely: 10–25, Unlikely: 25–45, Toss-up: 45–60, Likely: 60–75,
# Very likely: 75–90, Almost certain: 90–100). A value in the open interval (0, 1) is a decimal
# fraction — e.g. 0.6 instead of 60 — and silently breaks Phase 4 Brier-score computation because
# the calibration code will treat a 60% forecast as a 0.6% forecast. null is allowed per §19 (when
# no reliable probability estimate can be made), but the entry cannot contribute to Brier scoring.
PROB_DATE="2026-06-22"
def eval_t_probability(entry):
    """Validate a single forecast_ledger entry's probability field per §10 / DECISION_LEDGER §6.
    Returns None if the field is absent/null (allowed, entry is not Brier-scorable) or has a valid
    0–100 numeric value. Returns an error string when the value is non-numeric, out of [0, 100],
    or lies in the open interval (0, 1) — a decimal fraction that would corrupt Brier scoring.
    Side-effect-free + module-level so the selftest drives all branches fixture-free (every
    committed fixture predates PROB_DATE → N/A in the main run loop)."""
    prob=entry.get("probability")
    if prob is None: return None               # null or missing key: allowed
    if not isnum(prob):
        return f"probability={prob!r} is not numeric — use a 0–100 number per §10 bands or null"
    if prob<0 or prob>100:
        return f"probability={prob} is out of [0, 100] — §10 bands are 0–100 percentage points"
    if 0<prob<1:
        return f"probability={prob} looks like a decimal fraction — use the 0–100 scale per §10 (write {round(prob*100)} not {prob})"
    return None                                # valid: 0 (Remote floor), or any value in [1, 100]

# forecast_type (additive, DECISION_LEDGER.md §6, introduced 2026-07-01) — the content-category tag
# ("revenue" vs "margin_or_cost" vs "catalyst_or_estimate_revision" etc.) that /research:calibrate
# slices Brier score / hit rate by, orthogonal to owner_module (one module produces several types).
FORECAST_TYPE_ENUM={"revenue","margin_or_cost","earnings_eps","cash_flow","valuation_or_price_return",
                     "balance_sheet_or_solvency","governance_or_accounting","catalyst_or_estimate_revision","other"}
FTYPE_DATE="2026-07-01"

def eval_forecast_type(entry):
    """Validate a single forecast_ledger entry's optional forecast_type field. Returns None if
    absent/empty (allowed — additive/optional, same convention as scenarios[]/edge_score/business_type)
    or a valid closed-enum value; an error string if present but not an exact case-sensitive member
    of FORECAST_TYPE_ENUM. Side-effect-free + module-level so selftest drives all branches fixture-free
    (every committed fixture predates FTYPE_DATE -> N/A in the main run loop, mirrors eval_t_probability)."""
    ft=entry.get("forecast_type")
    if ft is None or ft=="": return None       # absent/empty: allowed, untagged
    if not isinstance(ft,str):
        return f"forecast_type={ft!r} is not a string"
    if ft not in FORECAST_TYPE_ENUM:
        return f"forecast_type={ft!r} not in closed enum {sorted(FORECAST_TYPE_ENUM)}"
    return None

# ── Check AA (§18 module verdict-lock caps) — module-level so `eval.py selftest` can drive it ──
# CLAUDE.md §18 mandates two hard verdict-lock caps that the master synthesizer's PROMPT states but
# nothing mechanically verifies. Gap: when the balance-sheet-survival (BSS) module synthesis contains
# "Distress risk", or the management-governance (MG) synthesis contains "Serious governance concerns",
# the final decision must NOT be in HIGH_CONVICTION_DECISIONS — unless the BSS cap's §18 exception
# applies (thesis_type includes "Balance-sheet survival"). The MG cap has no exception.
# This check reads the committed synthesis files, extracts the first **Verdict:** line via regex,
# and returns a list of violations (empty list = pass) or None (N/A).
# Landing date: 2026-06-23 (forward-looking; pre-gate runs are N/A so the golden suite stays green).
AA_DATE = "2026-06-23"
BSS_CAP_VERDICT = "Distress risk"
MG_CAP_VERDICT  = "Serious governance concerns"

def eval_aa_module_verdict_lock(decision, decision_date, bss_verdict, mg_verdict, thesis_type):
    """Core of check AA. Returns list of violations (empty=pass) or None (N/A).
    bss_verdict: extracted Solvency Verdict string from BSS 99_*-synthesis.md, or None (absent).
    mg_verdict:  extracted Stewardship Verdict string from MG 99_*-synthesis.md, or None (absent).
    thesis_type: decision_record.thesis_type list (the §14 classification).
    Side-effect-free + module-level so `eval.py selftest` can exercise it without run fixtures."""
    if not (isdate(decision_date) and decision_date >= AA_DATE):
        return None  # forward-looking; pre-gate runs are N/A
    if bss_verdict is None and mg_verdict is None:
        return None  # neither module synthesis present; N/A
    violations = []
    if bss_verdict and BSS_CAP_VERDICT in bss_verdict:
        # §18: "A balance-sheet 'Distress risk' verdict caps the headline at Watchlist or lower,
        # unless the thesis is an explicit distressed or special-situation play."
        is_distress_play = isinstance(thesis_type, list) and "Balance-sheet survival" in thesis_type
        if decision in HIGH_CONVICTION_DECISIONS and not is_distress_play:
            violations.append(
                f"BSS synthesis verdict contains '{BSS_CAP_VERDICT}' but decision={decision!r} "
                f"is a conviction rating — §18 caps the headline at Watchlist or lower "
                f"(exception applies only when thesis_type includes 'Balance-sheet survival'; "
                f"got {thesis_type!r})"
            )
    if mg_verdict and MG_CAP_VERDICT in mg_verdict:
        # §18: "A governance hard disqualifier or critical flag caps the headline at Watchlist or lower."
        # No exception: the governance cap applies regardless of thesis type.
        if decision in HIGH_CONVICTION_DECISIONS:
            violations.append(
                f"MG synthesis verdict contains '{MG_CAP_VERDICT}' but decision={decision!r} "
                f"is a conviction rating — §18 caps the headline at Watchlist or lower "
                f"(no exception: the governance cap applies regardless of thesis type)"
            )
    return violations

def extract_synthesis_verdict(text):
    """Pull the verdict category from a module 99_*-synthesis.md body. The synthesis renders it as
    `- **Verdict:** <category>` — the colon is INSIDE the bold, and the value may itself be double-
    bolded (e.g. `- **Verdict:** **Adequate**`). Returns the verdict text (surrounding markdown left
    in place — callers substring-match the §18 category) or None. Module-level + pure so the selftest
    drives the ACTUAL regex over real rendered lines (a helper-only test can't catch a regex bug)."""
    if not isinstance(text, str):
        return None
    m = re.search(r'\*\*Verdict:?\*\*\s*:?\s*([^\n]+)', text)
    return m.group(1).strip() if m else None

# ── Check AB (§13 BM disqualifier verdict-lock) — module-level so `eval.py selftest` drives it ──
# CLAUDE.md §13 hard rule: "a critical governance, solvency, accounting, fraud, or going-concern
# red flag must cap the final rating." The disqualifier-scan (01_disqualifier-scan.md) checks 8
# hard facts that — when triggered — lock the BM synthesis verdict to
# "Low-quality business — avoid deeper work". Check AA covers BSS ("Distress risk") and MG
# ("Serious governance concerns"); AB closes the gap by covering the BM disqualifier verdict-lock,
# completing the module verdict-lock trilogy.
#
# No exception: unlike the BSS cap (which the distressed-play thesis_type can bypass), the BM
# disqualifier cap has no exception — a disqualified company cannot receive conviction in any
# direction. The disqualifier identifies companies where data quality or fraud/going-concern risk is
# severe enough that the analysis base is unreliable; conviction in either direction must not ship.
# This matches the MG cap treatment (no exception, consistent with HIGH_CONVICTION_DECISIONS logic).
#
# Landing date: 2026-06-24 (forward-looking; pre-gate golden fixtures predate → N/A → suite green).
AB_DATE = "2026-06-24"
BM_CAP_VERDICT = "Low-quality business"

def eval_ab_bm_verdict_lock(decision, decision_date, bm_verdict):
    """Core of check AB. Returns list of violations (empty=pass) or None (N/A).
    bm_verdict: extracted Business-model Verdict string from BM 99_*-synthesis.md, or None (absent).
    Side-effect-free + module-level so `eval.py selftest` exercises it without run fixtures."""
    if not (isdate(decision_date) and decision_date >= AB_DATE):
        return None  # forward-looking; pre-gate runs are N/A
    if bm_verdict is None:
        return None  # BM module did not run; cap cannot fire — N/A
    violations = []
    if BM_CAP_VERDICT in bm_verdict:
        # Disqualifier-scan verdict-lock fired: BM synthesis says "Low-quality business".
        # CLAUDE.md §13 caps conviction — no thesis-type exception (contrast BSS cap §18).
        if decision in HIGH_CONVICTION_DECISIONS:
            violations.append(
                f"BM synthesis verdict contains '{BM_CAP_VERDICT}' (disqualifier-scan verdict-lock) "
                f"but decision={decision!r} is a conviction rating — a disqualified business must "
                f"not receive a conviction rating; CLAUDE.md §13 caps at Watchlist or lower "
                f"regardless of thesis type (disqualifier-scan: 'Low-quality business — avoid "
                f"deeper work')"
            )
    return violations

# ── Checks AC/AD/AE/AF (§24 rejector-filter conviction caps: Filters 2, 4+6, 5, 1) ─────────────
# Detection logic extracted to scripts/rating_caps.py (importable, side-effect-free) so the SAME
# functions also run LIVE in the /research:full Step 10B.1 finish-gate — before a violation ships,
# not only when someone remembers to run this eval harness afterward. See rating_caps.py's module
# docstring for the full doctrine rationale and the EMAAR_2026-07-03 case that motivated this.
# Import (not copy): eval.py is the single caller of these functions for retrospective grading;
# rating_caps.py is the single source of the detection logic, imported by both callers.
from rating_caps import (
    AC_DATE, TURNAROUND_TYPE, ABOVE_STARTER_AC, eval_ac_turnaround_cap,
    AD_DATE, CAP4_TAG, CAP6_TAG, eval_ad_filter_4_6_cap,
    _tag_fired_standalone,
    AE_DATE, CAP5_TAG, ABOVE_STARTER_AE, eval_ae_filter5_cap,
    AF_DATE, CAP1_TAG, ABOVE_WATCHLIST_AF, eval_af_filter1_integrity_cap,
)

AG_DATE = "2026-07-06"
AG_STATUSES = {"not_available","pre_data","checked_no_action","applied"}
def eval_ag_calibration_feedback_gate(decision_date, calibration_summary, calibration_feedback):
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
    cannot re-run the synthesizer's judgment call on which module is "flagged"; it can only verify the
    gate ran, recorded a valid status, and that status matches what the as-of summary's own verdict
    implies was possible (not_available / pre_data / checked-or-applied)."""
    if not (isdate(decision_date) and decision_date >= AG_DATE):
        return None  # forward-looking; pre-gate runs N/A
    verdict = (calibration_summary or {}).get("verdict") or ""
    if calibration_summary is None:
        expected = "not_available"
    elif verdict.startswith("Pre-data"):
        expected = "pre_data"
    else:
        expected = "checked"  # covers checked_no_action / applied — eval.py can't judge which is correct
    if not isinstance(calibration_feedback, dict):
        return [f"as-of calibration_summary={'present (verdict='+repr(verdict)+')' if calibration_summary is not None else 'absent'} "
                f"but decision_record.json has no calibration_feedback object — the Phase 6 calibration-"
                f"feedback gate (DECISION_LEDGER.md §18) was silently skipped"]
    violations=[]
    status = calibration_feedback.get("status")
    if status not in AG_STATUSES:
        violations.append(f"calibration_feedback.status={status!r} is not one of {sorted(AG_STATUSES)}")
    elif expected=="not_available" and status!="not_available":
        violations.append(f"no as-of calibration_summary.json exists (decision_date={decision_date}) but status={status!r} (expected 'not_available')")
    elif expected=="pre_data" and status!="pre_data":
        violations.append(f"as-of calibration_summary verdict={verdict!r} is Pre-data but status={status!r} (expected 'pre_data')")
    elif expected=="checked" and status not in ("checked_no_action","applied"):
        violations.append(f"as-of calibration_summary has real signal (verdict={verdict!r}) but status={status!r} (expected 'checked_no_action' or 'applied')")
    if status=="applied":
        hp=calibration_feedback.get("haircut_points"); mf=calibration_feedback.get("modules_flagged")
        if not (isnum(hp) and hp>0):
            violations.append(f"status='applied' but haircut_points={hp!r} is not a positive number")
        if not (isinstance(mf,list) and len(mf)>0):
            violations.append(f"status='applied' but modules_flagged={mf!r} is empty/not a list")
    if status=="checked_no_action":
        mf=calibration_feedback.get("modules_flagged")
        if isinstance(mf,list) and len(mf)>0:
            violations.append(f"status='checked_no_action' but modules_flagged={mf!r} is non-empty")
    return violations  # empty list = pass

# ── Check AH (expectations-gap ship-time audit: existence + independent §7 edge consistency) ──
# CLAUDE.md §7 bans "fake variant perception": a conviction rating (confidence_score > 60) must rest on
# a PROVEN edge, not just the synthesizer's own self-report. Check V already verifies the synthesizer's
# OWN edge_score/edge_proof are internally consistent; it cannot catch a self-graded "proven edge" that a
# SEPARATE, independent re-read of the same reverse-DCF/consensus/scenario evidence (research:expectations-
# gap) would show has no real variant perception. /research:full's 10B.3 now runs that independent audit
# in the ship path (mirroring how verify-evidence/pre-mortem are gated at O/S/U/X) — this check verifies
# it actually ran for a conviction-confidence run and did not surface a contradiction.
# Landing date: 2026-07-08 (forward-looking; all golden fixtures predate → N/A → suite green).
AH_DATE = "2026-07-08"
def eval_ah_expectations_gap_gate(decision_date, confidence_score, eg):
    """Core of check AH. Returns None (N/A — pre-gate, or confidence not above the §7 conviction floor)
    or a list of violation strings (empty list = pass). `eg` is the parsed latest expectations_gap.json
    dict, or None if absent. Side-effect-free + module-level so eval.py selftest can drive it fixture-free."""
    if not (isdate(decision_date) and decision_date >= AH_DATE):
        return None  # forward-looking; pre-gate runs N/A
    if not (isnum(confidence_score) and confidence_score > 60):
        return None  # only a conviction-level confidence needs an independently-proven edge (mirrors check V's threshold)
    if eg is None:
        return [f"expectations-gap audit did not run (no expectations_gap.json) but confidence_score={confidence_score} "
                "> 60 — §7 requires the variant-perception edge be independently confirmed before shipping high conviction"]
    vpq = str(eg.get("variant_perception_quality") or "").strip().lower()
    no_edge = vpq in ("", "none", "weak") or eg.get("is_exploitable") is False
    if no_edge:
        return [f"expectations-gap audit found variant_perception_quality={eg.get('variant_perception_quality')!r} "
                f"/ is_exploitable={eg.get('is_exploitable')!r} (no independently-proven edge) but "
                f"confidence_score={confidence_score} > 60 — §7 bans a confident rating on unproven variant perception"]
    return []

# ── Check AI (Headline Scorecard ↔ decision_record.json reconciliation) ──
# Detection logic extracted to scripts/headline_checks.py (importable, side-effect-free) so the
# SAME functions also run LIVE in the /research:full Step 10B.1 finish-gate — before a violation
# ships, not only when someone remembers to run this eval harness afterward. See
# headline_checks.py's module docstring for the full doctrine rationale and the TMCV_2026-06-07 /
# AMZN_2026-07-10 cases that motivated this (mirrors exactly why rating_caps.py exists for the
# §24 rejector-filter caps).
# Import (not copy): eval.py is the single caller of these functions for retrospective grading;
# headline_checks.py is the single source of the detection logic, imported by both callers.
from headline_checks import (
    AI_DATE, CONF_SPLIT_DATE, _scorecard_section, _hs_cell, _metric_numbers, _reconciles,
    eval_ai_headline_reconciliation,
)

# ── Check AJ (Decision Audit Trail structural check, CLAUDE.md §8/§22) ──
# The Part II "Decision Audit Trail" table is the auditable adjudication core of the verdict — for each
# decision driver, which side won and why — but until now it was enforced only by synthesizer.md prompt
# instruction (Step 5, "Contradiction audit") with NO mechanical check that a run actually ships it
# populated. A synthesizer could regress to an empty or token table (the exact "summarize, don't
# adjudicate" failure §22 warns against) and nothing before this would catch it — the same class of
# silent-doctrine-violation defect check AI closed for the Headline Scorecard, and the improvement that
# check AI's own landing PR named as the next-highest-leverage gap.
AJ_DATE = "2026-07-10"
AJ_MIN_ROWS = 3
AJ_REQUIRED_COLS = ["Decision Driver", "Bull Evidence", "Bear Evidence", "Which Side Wins?", "Why?"]
def _decision_audit_section(thesis):
    """The text of the '## Decision Audit Trail' section ONLY — from its heading up to the next '## '
    heading (or EOF), mirroring `_scorecard_section`'s scoping so a table living in a LATER section
    cannot satisfy this check. None if absent.

    When the dossier uses the PART structure (synthesizer.md emits the audit trail under
    '# PART II — CROSS-CUTTING ANALYSIS'), the search is FIRST restricted to the Part II slice, so a
    later appendix/process section carrying its own '## Decision Audit Trail' heading cannot satisfy
    the check while Part II omits the table (r3556238203). Falls back to the whole document only when
    no Part II heading exists (degenerate/non-PART dossiers)."""
    p2 = re.search(r"(?ims)^#\s+PART\s+II\b.*?(?=^#\s+PART\b|\Z)", thesis)
    scope_text = p2.group(0) if p2 else thesis
    m = re.search(r"(?ims)^##\s*Decision Audit Trail\b.*?(?=^##\s|\Z)", scope_text)
    return m.group(0) if m else None
def _decision_audit_header(section):
    """The HEADER cells of the Decision Audit Trail pipe-table (the first non-separator pipe row), or []
    if the section holds no table. Split out so check AJ can verify the table actually carries the
    required bull/bear adjudication COLUMNS, not merely five columns of any shape (r3556238195)."""
    if not section: return []
    for line in section.splitlines():
        s=line.strip()
        if not s.startswith("|"): continue
        if re.match(r"^\|[\s:|-]+\|$", s): continue  # separator row
        return [c.strip() for c in s.strip("|").split("|")]
    return []
def _decision_audit_rows(section):
    """The DATA rows of the Decision Audit Trail pipe-table (header and separator rows excluded), or []
    if the section holds no table. Side-effect-free + module-level so `selftest` can drive it directly."""
    if not section: return []
    rows=[]; header_seen=False
    for line in section.splitlines():
        s=line.strip()
        if not s.startswith("|"):
            if header_seen: break  # table ended
            continue
        if re.match(r"^\|[\s:|-]+\|$", s):
            continue  # the header/body separator row
        cells=[c.strip() for c in s.strip("|").split("|")]
        if not header_seen:
            header_seen=True  # this pipe row IS the header — skip it, start collecting after
            continue
        rows.append(cells)
    return rows
def _audit_cell_blank(cell):
    """A cell counts as blank if it's empty after stripping markdown bold, or is a bare placeholder
    token rather than real adjudication content. Placeholders include any WHOLE-cell run of dash
    characters — ASCII '-'/'--'/'---' and the Unicode figure/en/em dashes and horizontal bar
    (—, –, ―) the synthesizer commonly types (r3556238198) — plus 'n/a', 'tbd', 'none', '?'. Matching
    a whole-cell dash run (not a substring) keeps real content like '~11–12%' or '₹1,184M–586M' from
    being misread as blank."""
    c = re.sub(r"\*+", "", cell or "").strip()
    if re.fullmatch(r"[-‒–—―]+", c):
        return True  # a cell that is ONLY dash characters is a placeholder
    return (not c) or c.lower() in {"n/a", "na", "tbd", "none", "?"}
def eval_aj_decision_audit_trail(decision_date, thesis):
    """Core of check AJ. Returns None (N/A — pre-gate) or a list of violation strings (empty = pass).
    `thesis` is the full final_thesis.md text. Side-effect-free + module-level so `eval.py selftest` can
    drive it with synthetic table snippets, fixture-free."""
    if not (isdate(decision_date) and decision_date >= AJ_DATE):
        return None  # forward-looking; pre-gate runs N/A
    section = _decision_audit_section(thesis)
    if section is None:
        return ["'## Decision Audit Trail' section not found in final_thesis.md"]
    rows = _decision_audit_rows(section)
    if not rows:
        return ["'## Decision Audit Trail' table has no data rows"]
    det=[]
    # Validate the table HEADER carries the required bull/bear adjudication columns, in order, before
    # trusting the positional per-cell checks below (r3556238195). A five-column table whose header
    # omits or reorders 'Bear Evidence' would otherwise pass the positional checks with the wrong fields.
    hdr=[re.sub(r"\*+","",h).strip().lower() for h in _decision_audit_header(section)]
    for j, label in enumerate(AJ_REQUIRED_COLS):
        if j >= len(hdr) or label.lower() not in hdr[j]:
            got = hdr[j] if j < len(hdr) else "<missing>"
            det.append(f"Decision Audit Trail header column {j+1} is {got!r} — expected {label!r} "
                       f"(required columns, in order: {', '.join(AJ_REQUIRED_COLS)})")
    if len(rows) < AJ_MIN_ROWS:
        det.append(f"only {len(rows)} Decision Audit Trail row(s) — fewer than the {AJ_MIN_ROWS} required for a real cross-module adjudication")
    for i, cells in enumerate(rows, 1):
        if len(cells) < len(AJ_REQUIRED_COLS):
            det.append(f"row {i} has only {len(cells)} column(s), fewer than the {len(AJ_REQUIRED_COLS)} required ({', '.join(AJ_REQUIRED_COLS)})")
            continue
        for j, label in enumerate(AJ_REQUIRED_COLS):
            if _audit_cell_blank(cells[j]):
                det.append(f"row {i} ({cells[0]!r}) has a blank {label!r} cell")
    return det

# ── Check AK (red-flag severity reconciliation, CLAUDE.md §13/§18) ──
# Detection logic extracted to scripts/headline_checks.py — see that module's docstring and the
# AI import comment above (same rationale: live pre-publish gate + retrospective eval, one source
# of detection logic, imported by both callers).
from headline_checks import (
    AK_DATE, _AK_CRITICAL_PATTERNS, _AK_DENIAL, _AK_AFFIRM, _module_critical_count,
    eval_ak_red_flag_severity_reconciliation,
)

# ── Check AN (§4a supersession-integrity) — module-level so `eval.py selftest` drives it fixture-free ──
def _an_valid_sidecar(run_dir):
    """A run's corrections sidecar, but ONLY if it passes the schema gate the resolver applies
    (schema == 'corrections/v1'); else {} — so AN honors exactly the sidecars ledger_records honors."""
    try:
        with open(os.path.join(run_dir, "corrections.json")) as f:
            c = json.load(f)
        return c if (isinstance(c, dict) and c.get("schema") == "corrections/v1") else {}
    except Exception:
        return {}

def eval_an_supersession_integrity(corrections):
    """Check AN: an append-only corrections.json that declares `superseded_by` (DECISION_LEDGER §4a)
    must point at a real, existing run folder carrying a decision record, AND the supersession CHAIN
    from it must terminate on a LIVE (non-superseded) record — a dangling, circular (A→B→A), or
    chain-ends-on-another-superseded-run supersession would silently drop every call in the chain
    from the standing set with no live replacement. Returns None (no sidecar / no supersession → N/A)
    or a list of violations (empty = valid)."""
    if not isinstance(corrections, dict):
        return None
    sup = corrections.get("superseded_by")
    if not isinstance(sup, dict):
        return None
    tgt = sup.get("run_root")
    if not (isinstance(tgt, str) and tgt.strip()):
        return ["superseded_by present but carries no run_root"]
    tgt = tgt.strip()
    if not os.path.isdir(tgt):
        return [f"superseded_by.run_root {tgt!r} does not exist"]
    if not os.path.exists(os.path.join(tgt, "decision_record.json")):
        return [f"superseded_by target {tgt!r} has no decision_record.json"]
    # walk the chain to its terminal live record, detecting cycles
    seen, cur = set(), tgt
    while True:
        if cur in seen:
            return [f"supersession chain is circular at {cur!r} — no live replacement record"]
        seen.add(cur)
        nxt_sup = _an_valid_sidecar(cur).get("superseded_by")
        nxt = nxt_sup.get("run_root") if isinstance(nxt_sup, dict) else None
        if not (isinstance(nxt, str) and nxt.strip()):
            return []  # cur is a live, non-superseded record — the chain terminates validly
        nxt = nxt.strip()
        if not (os.path.isdir(nxt) and os.path.exists(os.path.join(nxt, "decision_record.json"))):
            return [f"supersession chain: {cur!r} is superseded by {nxt!r} which does not exist"]
        cur = nxt

# ── Check AM (§8/§16 bear-case sanity) — a Selected/conviction long must have a real loss branch ──
AM_DATE = "2026-07-17"
def eval_am_bear_case_sanity(decision_date, decision, scenarios, entry_price):
    """Check AM: a Selected/conviction long (Strong Buy / Buy / Starter Position Only) must carry a
    genuine bear case — the bear-labelled scenario's price_target BELOW entry_price (a real downside
    branch). A "bear" scenario that is itself a gain (the EMAAR_2026-07-03 defect: bear +63.9%, no
    capital loss) fails §8's strongest-bear-case test and §16. Returns None (pre-gate / not a Selected
    long / no usable bear price target) or a list of violations (empty = pass)."""
    if not (isdate(decision_date) and decision_date >= AM_DATE):
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

# ── Check AO (§19 / DECISION_LEDGER §6 forecast RESOLVABILITY) — a forecast the calibration loop can score ──
AO_DATE = "2026-07-18"
# The mechanically-verifiable subset of resolvability (the full semantic requirement — outcome-space
# exhaustiveness + a ≤90-day quota — is enforced at AUTHORING time by the synthesizer prompt). Check T
# already requires the trigger/window FIELDS to be non-empty; AO requires them to be RESOLVABLE: a pinned
# numeric bar or a named settleable document (not a bare "beats consensus"), triggers that actually
# partition the outcome space (not identical text), and — at the record level — at least one near-term
# (≤90-day) proof point so the whole call is not un-checkable until years out.
_AO_NAMED_DOC = re.compile(r"\b(10-?k|10-?q|8-?k|20-?f|6-?k|annual report|"
                           r"(?:quarterly|annual|interim|half-?year|full-?year|year-?end|first-quarter|"
                           r"second-quarter|third-quarter|fourth-quarter|q[1-4]|h[12]|fy\s?\d{2,4})\s+"
                           r"(?:results?|report|filing|earnings|numbers)|"
                           r"filing|filed|transcript|nse|bse|sec|sebi|def ?14a|proxy|press release|"
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
    if not (isdate(decision_date) and decision_date >= AO_DATE):
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
        # the ledger is genuinely unbounded ('over the next few years'), so it carries NO checkable near-term
        # proof point at all (§19). A fiscal-period label like 'Q1 FY27' is unpinnable to a calendar date but
        # IS a bounded near-term-ish period, so it keeps the benefit of the doubt and does not trip this.
        issues.append("no dateable near-term proof point — every forecast window is vague and unbounded "
                      "(e.g. 'over the next few years') with no fiscal period (Q/H/FY), month, or date to settle "
                      "on; §19 requires at least one checkable near-term proof point")
    return issues

if scope=="selftest":
    # Fixture-free coverage for check W — the golden suite can't exercise it (every committed run is
    # pre-gate / blank-fielded, so W is always N/A there). Asserts forbidden combos FAIL, correct combos
    # PASS (incl. REIT-on-FCFF, which SECTOR_OVERLAYS.md does NOT forbid), and N/A when a field is unset.
    W=eval_w_sector_valuation
    cases=[  # (business_type, primary_valuation_method, expect: "fail"|"clean"|"na")
        ("Bank / lender","FCFF DCF","fail"),
        ("Bank / lender","EV/EBITDA vs peers","fail"),
        ("Bank / lender","EV/EBIT","fail"),
        ("Bank / lender","EV/Sales","fail"),
        ("Bank / lender","EBITDA-DCF","fail"),
        ("Bank / lender","EBITDA DCF","fail"),                 # hyphen-robustness (space spelling)
        ("Bank / lender","net-debt/EBITDA screen","fail"),
        ("Bank / lender","Enterprise value / EBITDA","fail"),
        ("Insurer","mid-cycle FCFF DCF","fail"),
        ("Insurer","EV/EBITDA","fail"),                        # EV is a category error for a financial
        ("REIT / real estate","EBITDA-DCF","fail"),
        ("REIT / real estate","EBITDA DCF","fail"),            # hyphen-robustness
        ("Bank / lender","DDM / residual income","clean"),
        ("Bank / lender","P/B vs ROE","clean"),
        ("Insurer","embedded value / VNB","clean"),            # must NOT false-match 'enterprisevalue'
        ("REIT / real estate","NAV + DDM on FFO/AFFO","clean"),
        ("REIT / real estate","FCFF DCF","clean"),             # doctrine does NOT forbid FCFF for a REIT
        ("Generic operating company","FCFF DCF","clean"),      # untracked sector — no constraint
        ("Commodity producer / miner","mid-cycle FCFF DCF","clean"),
        ("","FCFF DCF","na"),
        ("Bank / lender","","na"),
    ]
    bad=0
    for bt,pvm,exp in cases:
        h=W(bt,pvm); got=("na" if h is None else ("fail" if h else "clean")); ok=(got==exp)
        if not ok: bad+=1
        print(f"  [{'ok' if ok else 'XX'}] W({bt!r},{pvm!r}) -> {got}"+(f" {h}" if h else "")+("" if ok else f"  EXPECTED {exp}"))
    # check X — the golden suite can't reach it (every committed fixture predates the floor → always N/A),
    # so drive the full date / basket / verdict gate here: conviction + acceptable verdict PASSes; conviction
    # + "Material issues"/"Failed"/blank/wrong-case FAILs; non-conviction, no-report, and pre-floor are N/A.
    X=eval_x_verify_floor
    xcases=[  # (decision, decision_date, verdict-or-None, expect: "pass"|"fail"|"na")
        ("Strong Buy","2026-06-19","Clean","pass"),
        ("Buy","2026-06-19","Minor issues","pass"),
        ("Starter Position Only","2026-06-19","Clean","pass"),    # also a Selected basket
        ("Short Candidate","2026-06-19","Clean","pass"),          # Short is a conviction basket too
        ("Strong Buy","2026-06-19","Material issues","fail"),
        ("Short Candidate","2026-06-19","Failed","fail"),
        ("Strong Buy","2026-06-19","","fail"),                    # empty verdict is not acceptable
        ("Strong Buy","2026-06-19","Minor Issues","fail"),        # wrong casing → case-sensitive, not acceptable
        ("Strong Buy","2026-06-19",None,"na"),                    # no verification_report.json
        ("Watchlist","2026-06-19","Material issues","na"),        # non-conviction basket
        ("Avoid","2026-06-19","Material issues","na"),            # non-conviction basket
        ("Strong Buy","2026-06-18","Material issues","na"),       # predates the floor
        ("Strong Buy","not-a-date","Material issues","na"),       # unparseable decision_date
    ]
    for dec_,dt_,vd_,exp in xcases:
        got=X(dec_,dt_,vd_); ok=(got==exp)
        if not ok: bad+=1
        print(f"  [{'ok' if ok else 'XX'}] X({dec_!r},{dt_!r},{vd_!r}) -> {got}"+("" if ok else f"  EXPECTED {exp}"))
    # check Y — the golden suite can't reach the cap branches (every fixture is score 68-69 / Watchlist-Avoid
    # → trivial pass), so drive the full §11 gate here. Note the F1 cases: weak data caps a Short (matching
    # checks O/U/X), but a Pair hedge is intentionally exempt.
    Y=eval_y_data_sufficiency
    ycases=[  # (decision, data_sufficiency_score-or-None, expect: "pass"|"fail"|"na")
        ("Strong Buy",68,"pass"), ("Short Candidate",68,"pass"),          # good data → conviction OK either side
        ("Strong Buy",50,"pass"), ("Strong Buy",49,"fail"),                # band edge: 50 ok, 49 weak
        ("Strong Buy",35,"fail"), ("Starter Position Only",35,"fail"),     # weak data caps the long basket
        ("Short Candidate",35,"fail"),                                     # F1: weak data caps a Short too
        ("Pair Trade / Hedge Required",35,"pass"),                        # F1: Pair hedge intentionally exempt
        ("Avoid",35,"pass"), ("Watchlist",35,"pass"),                      # at/below the Watchlist ceiling → allowed
        ("Strong Buy",20,"fail"), ("Short Candidate",20,"fail"),          # <30 must be Refuse-To-Rate
        ("Avoid",20,"fail"),                                               # <30 caps ANY non-Refuse decision
        ("Insufficient Data — Refuse To Rate",20,"pass"),                 # <30 with the correct refuse token
        ("Strong Buy",None,"fail"),                                       # null score on a conviction long → FAIL
        ("Short Candidate",None,"fail"),                                   # null score on a Short → FAIL (F1)
        ("Watchlist",None,"na"), ("Pair Trade / Hedge Required",None,"na"),# null on a non-conviction rating → N/A
        ("Strong Buy","not-a-number","fail"),                             # non-numeric score on conviction → FAIL
    ]
    for dec_,ds_,exp in ycases:
        got=Y(dec_,ds_); ok=(got==exp)
        if not ok: bad+=1
        print(f"  [{'ok' if ok else 'XX'}] Y({dec_!r},{ds_!r}) -> {got}"+("" if ok else f"  EXPECTED {exp}"))
    # check Z — the golden suite can't reach the enum-violation or cap-violation branches (all committed
    # fixtures predate the gate, so Z is always N/A there). Drive every branch here:
    # (a) valid enum + no external type → pass regardless of conviction level;
    # (b) invalid/lowercase value → enum-violation fail;
    # (c) external type + no proven edge + conviction decision (incl. Short Candidate) → cap-violation fail;
    # (d) external type + no proven edge + at/below Starter Position → pass;
    # (e) external type + proven edge → cap exception, any conviction allowed;
    # (f) empty list → fail (§14 requires a classification); non-list → N/A; non-string element → fail (no crash).
    Z=eval_z_thesis_type_cap
    zcases=[  # (thesis_type, decision, edge_score, expect: "pass"|"fail"|"na")
        # (a) valid enum, no external-variable type → pass at any conviction level
        (["Company-specific"],"Strong Buy",None,"pass"),
        (["Company-specific","Sector-cycle"],"Buy",None,"pass"),
        (["Balance-sheet survival"],"Short Candidate",None,"pass"),
        (["Governance turnaround"],"Starter Position Only",None,"pass"),
        # (b) invalid / wrong-case values → enum violation
        (["sector-cycle"],"Watchlist",None,"fail"),        # lowercase — TMCV-pattern defect
        (["company-specific"],"Avoid",None,"fail"),        # lowercase
        (["Commodity conditional"],"Watchlist",None,"fail"),  # missing hyphen
        (["Company-specific","macro"],"Watchlist",None,"fail"),  # one bad in a mixed list
        # (c) external-variable type + no proven edge + conviction above ceiling → cap fail
        (["Commodity-conditional"],"Buy",None,"fail"),
        (["Commodity-conditional"],"Strong Buy",None,"fail"),
        (["Policy-conditional"],"Buy",None,"fail"),
        (["Macro-conditional"],"Buy",30,"fail"),           # edge_score 30 < 50 → not proven
        (["FX / rates"],"Strong Buy",0,"fail"),
        (["Liquidity / positioning"],"Buy",49,"fail"),     # 49 < 50 → not proven
        (["Company-specific","Policy-conditional"],"Buy",None,"fail"),  # mixed: external type present
        (["Macro-conditional"],"Short Candidate",None,"fail"),    # SHORT on a no-edge macro bet → capped too
        (["Commodity-conditional"],"Short Candidate",30,"fail"),  # weak-edge commodity short → capped
        # (d) external-variable type + no proven edge + at/below ceiling → pass
        (["Commodity-conditional"],"Starter Position Only",None,"pass"),  # at the ceiling
        (["Commodity-conditional"],"Watchlist",None,"pass"),
        (["Policy-conditional"],"Avoid",None,"pass"),
        (["FX / rates"],"Watchlist",None,"pass"),
        (["Liquidity / positioning"],"Avoid",0,"pass"),
        (["Macro-conditional"],"Insufficient Data — Refuse To Rate",None,"pass"),
        # (e) external-variable type + proven edge → exception, any conviction allowed
        (["Commodity-conditional"],"Buy",50,"pass"),       # exactly at threshold
        (["Policy-conditional"],"Strong Buy",75,"pass"),
        (["Macro-conditional","Company-specific"],"Buy",51,"pass"),
        (["Commodity-conditional"],"Short Candidate",50,"pass"),  # proven-edge short → cap exception
        # (f) empty list → fail; non-list → N/A; non-string element → fail (no crash)
        ([],"Buy",None,"fail"),                            # empty array — no §14 classification
        (None,"Buy",None,"na"),                            # not a list → N/A (B check handles type)
        ("Company-specific","Buy",None,"na"),              # string instead of list → N/A (B handles type)
        ([{"t":"Macro"}],"Buy",None,"fail"),               # non-string (dict) element → enum violation, must NOT raise TypeError
        ([123],"Watchlist",None,"fail"),                   # non-string (int) element → enum violation
    ]
    for tt_,dec_,es_,exp in zcases:
        got=Z(tt_,dec_,es_); ok=(got==exp)
        if not ok: bad+=1
        print(f"  [{'ok' if ok else 'XX'}] Z({tt_!r},{dec_!r},{es_!r}) -> {got}"+("" if ok else f"  EXPECTED {exp}"))
    # check T2 (forecast_ledger probability-scale) — every committed fixture predates PROB_DATE
    # → N/A in the main loop; the selftest drives the validator directly for full branch coverage.
    T2=eval_t_probability
    t2cases=[  # (entry_dict, expected: None=ok/null, str-fragment=error must contain that fragment)
        ({"probability":60},    None),            # valid: 60% = Likely band
        ({"probability":75.5},  None),            # valid: 75.5% = between Likely and Very likely
        ({"probability":0},     None),            # valid: 0% = Remote floor
        ({"probability":0.0},   None),            # valid: 0.0==0, not in open (0,1)
        ({"probability":1.0},   None),            # valid: 1.0==1%, not in open (0,1)
        ({"probability":100},   None),            # valid: 100% = Almost certain ceiling
        ({"probability":None},  None),            # null: allowed, not Brier-scorable
        ({},                    None),            # missing key: same as null, allowed
        ({"probability":0.6},   "0.6"),           # fraction form: should be 60
        ({"probability":0.55},  "0.55"),          # fraction form: should be 55
        ({"probability":0.45},  "0.45"),          # fraction form: should be 45
        ({"probability":0.1},   "0.1"),           # fraction form: should be 10
        ({"probability":0.999}, "0.999"),         # fraction form near ceiling: should be 100
        ({"probability":"likely"},"not numeric"), # string, not numeric
        ({"probability":"60%"}, "not numeric"),   # string with % sign, not numeric
        ({"probability":True},  "not numeric"),   # bool (int subclass, excluded by isnum)
        ({"probability":-5},    "out of [0, 100]"),  # negative, out of range
        ({"probability":-0.5},  "out of [0, 100]"),  # negative fraction
        ({"probability":101},   "out of [0, 100]"),  # > 100
        ({"probability":150},   "out of [0, 100]"),  # clearly > 100
    ]
    t2bad=0
    for entry_,exp in t2cases:
        got=T2(entry_)
        ok=(got is None if exp is None else (got is not None and exp in got))
        if not ok: t2bad+=1
        print(f"  [{'ok' if ok else 'XX'}] T2({entry_!r}) -> {got!r}"+("" if ok else f"  EXPECTED fragment {exp!r}"))
    bad+=t2bad
    # check T3 (forecast_ledger forecast_type closed-enum) — every committed fixture predates
    # FTYPE_DATE -> N/A in the main run loop; the selftest drives the validator directly.
    T3=eval_forecast_type
    t3cases=[  # (entry_dict, expected: None=ok/null, str-fragment=error must contain that fragment)
        ({"forecast_type":"revenue"}, None),
        ({"forecast_type":"margin_or_cost"}, None),
        ({"forecast_type":"earnings_eps"}, None),
        ({"forecast_type":"cash_flow"}, None),
        ({"forecast_type":"valuation_or_price_return"}, None),
        ({"forecast_type":"balance_sheet_or_solvency"}, None),
        ({"forecast_type":"governance_or_accounting"}, None),
        ({"forecast_type":"catalyst_or_estimate_revision"}, None),
        ({"forecast_type":"other"}, None),
        ({"forecast_type":None}, None),           # null: allowed, untagged
        ({}, None),                               # missing key: same as null, allowed
        ({"forecast_type":""}, None),              # empty string: allowed, untagged
        ({"forecast_type":"Revenue"}, "not in closed enum"),   # case mismatch — closed set is case-exact
        ({"forecast_type":"margin"}, "not in closed enum"),    # not a member (close but wrong spelling)
        ({"forecast_type":"macro"}, "not in closed enum"),     # plausible-sounding but not in the set
        ({"forecast_type":123}, "is not a string"),            # wrong type
        ({"forecast_type":["revenue"]}, "is not a string"),    # wrong type (list)
    ]
    t3bad=0
    for entry_,exp in t3cases:
        got=T3(entry_)
        ok=(got is None if exp is None else (got is not None and exp in got))
        if not ok: t3bad+=1
        print(f"  [{'ok' if ok else 'XX'}] T3({entry_!r}) -> {got!r}"+("" if ok else f"  EXPECTED fragment {exp!r}"))
    bad+=t3bad
    # check AA — §18 module verdict-lock caps. The golden suite can't reach the cap branches
    # (all committed fixtures predate AA_DATE → N/A); drive every branch here.
    # Expected values: "na" (N/A), "pass" (no violations), "fail" (one or more violations).
    AA=eval_aa_module_verdict_lock
    aacases=[  # (decision, decision_date, bss_verdict, mg_verdict, thesis_type, expect: "na"|"pass"|"fail")
        # pre-gate: always N/A regardless of verdict
        ("Strong Buy","2026-06-22","Distress risk","Serious governance concerns",["Company-specific"],"na"),
        ("Strong Buy","not-a-date","Distress risk",None,["Company-specific"],"na"),
        # both modules absent: N/A (neither ran, so neither cap can fire)
        ("Strong Buy","2026-06-23",None,None,["Company-specific"],"na"),
        # BSS "Distress risk" + conviction decision → fail
        ("Strong Buy","2026-06-23","Distress risk",None,["Company-specific"],"fail"),
        ("Buy","2026-06-23","Distress risk",None,["Company-specific"],"fail"),
        ("Starter Position Only","2026-06-23","Distress risk",None,["Company-specific"],"fail"),
        ("Short Candidate","2026-06-23","Distress risk",None,["Company-specific"],"fail"),
        # BSS "Distress risk" substring in a longer verdict string → fail (substring match)
        ("Buy","2026-06-23","Stretched / Distress risk",None,["Company-specific"],"fail"),
        # BSS "Distress risk" + distress-play exception → pass
        ("Strong Buy","2026-06-23","Distress risk",None,["Balance-sheet survival"],"pass"),
        ("Buy","2026-06-23","Distress risk",None,["Balance-sheet survival","Company-specific"],"pass"),
        # BSS "Distress risk" + non-conviction decision → pass (below the Watchlist ceiling)
        ("Watchlist","2026-06-23","Distress risk",None,["Company-specific"],"pass"),
        ("Avoid","2026-06-23","Distress risk",None,["Company-specific"],"pass"),
        # MG "Serious governance concerns" + conviction decision → fail
        ("Strong Buy","2026-06-23",None,"Serious governance concerns",["Company-specific"],"fail"),
        ("Buy","2026-06-23",None,"Serious governance concerns",["Company-specific"],"fail"),
        ("Short Candidate","2026-06-23",None,"Serious governance concerns",["Company-specific"],"fail"),
        # MG "Serious governance concerns" + non-conviction decision → pass
        ("Watchlist","2026-06-23",None,"Serious governance concerns",["Company-specific"],"pass"),
        ("Avoid","2026-06-23",None,"Serious governance concerns",["Company-specific"],"pass"),
        # both capping verdicts + conviction → fail (two violations)
        ("Strong Buy","2026-06-23","Distress risk","Serious governance concerns",["Company-specific"],"fail"),
        # BSS exception BUT MG still caps (MG has no exception)
        ("Strong Buy","2026-06-23","Distress risk","Serious governance concerns",["Balance-sheet survival"],"fail"),
        # clean verdicts on both modules → pass
        ("Strong Buy","2026-06-23","Fortress balance sheet","Standard / mixed",["Company-specific"],"pass"),
        ("Buy","2026-06-23","Solid",None,["Company-specific"],"pass"),
        ("Strong Buy","2026-06-23",None,"Strong governance",["Company-specific"],"pass"),
    ]
    aabad=0
    for dec_,dt_,bss_,mg_,tt_,exp in aacases:
        raw=AA(dec_,dt_,bss_,mg_,tt_)
        got="na" if raw is None else ("pass" if not raw else "fail")
        ok=(got==exp)
        if not ok: aabad+=1
        print(f"  [{'ok' if ok else 'XX'}] AA({dec_!r},{dt_!r},{bss_!r},{mg_!r},{tt_!r}) -> {got}"+("" if ok else f"  EXPECTED {exp}"))
    bad+=aabad
    # check AA EXTRACTOR — drive the ACTUAL verdict regex over real rendered lines. The aacases above
    # pass pre-parsed strings and so CANNOT catch a regex bug; these lock the `- **Verdict:** <cat>`
    # rendering contract (colon INSIDE the bold; value optionally double-bolded) the synthesis emits.
    EV=extract_synthesis_verdict
    evcases=[  # (markdown, expected substring in result, or None for "no verdict extracted")
        ("- **Verdict:** Distress risk", "Distress risk"),
        ("- **Verdict:** **Adequate** — leverage elevated", "Adequate"),
        ("- **Verdict:** Fortress balance sheet *(pre-Iveco)*", "Fortress balance sheet"),
        ("- **Verdict:** Serious governance concerns", "Serious governance concerns"),
        ("- **Verdict:** **Aligned & competent** (watch flag)", "Aligned & competent"),
        ("## 1. Solvency Verdict\n\n- **Verdict:** Distress risk\n- Net leverage 5x", "Distress risk"),
        ("- **Verdict**: Standard / mixed", "Standard / mixed"),  # tolerate colon OUTSIDE the bold too
        ("## 6. What Would Change The Solvency Verdict?", None),  # a header is NOT the bolded verdict line
        ("no verdict here at all", None),
        (None, None),  # non-string input → None, no crash
    ]
    evbad=0
    for txt_,exp in evcases:
        got=EV(txt_)
        ok=(got is None if exp is None else (got is not None and exp in got))
        if not ok: evbad+=1
        print(f"  [{'ok' if ok else 'XX'}] EV({(txt_ or '')[:42]!r}) -> {got!r}"+("" if ok else f"  EXPECTED contains {exp!r}"))
    bad+=evbad
    # check AB — BM disqualifier verdict-lock. Every committed fixture predates AB_DATE → N/A in
    # the main loop; drive all branches here: disqualifier BM verdict + conviction → fail;
    # non-conviction → pass; absent BM module (None) → N/A; pre-gate → N/A; clean verdict → pass.
    AB=eval_ab_bm_verdict_lock
    abcases=[  # (decision, decision_date, bm_verdict, expect: "na"|"pass"|"fail")
        # pre-gate: always N/A regardless of verdict
        ("Strong Buy","2026-06-23","Low-quality business — avoid deeper work","na"),
        ("Strong Buy","not-a-date","Low-quality business","na"),
        # BM module absent (did not run in this analysis): N/A — cap cannot fire
        ("Strong Buy","2026-06-24",None,"na"),
        ("Watchlist","2026-06-24",None,"na"),
        # "Low-quality business" + conviction decision → fail (no exception for any thesis type)
        ("Strong Buy","2026-06-24","Low-quality business — avoid deeper work","fail"),
        ("Buy","2026-06-24","Low-quality business — avoid deeper work","fail"),
        ("Starter Position Only","2026-06-24","Low-quality business — avoid deeper work","fail"),
        ("Short Candidate","2026-06-24","Low-quality business — avoid deeper work","fail"),  # no exception
        # substring match inside a longer or markdown-decorated verdict string
        ("Buy","2026-06-24","**Low-quality business** — avoid deeper work","fail"),
        ("Strong Buy","2026-06-24","Verdict: Low-quality business. Disqualifier: promoter pledge.","fail"),
        # "Low-quality business" + non-conviction decision → pass
        ("Watchlist","2026-06-24","Low-quality business — avoid deeper work","pass"),
        ("Avoid","2026-06-24","Low-quality business — avoid deeper work","pass"),
        ("Insufficient Data — Refuse To Rate","2026-06-24","Low-quality business — avoid deeper work","pass"),
        ("Pair Trade / Hedge Required","2026-06-24","Low-quality business — avoid deeper work","pass"),
        # clean BM verdict + conviction → pass (no "Low-quality business" substring)
        ("Strong Buy","2026-06-24","High-quality franchise — proceed","pass"),
        ("Buy","2026-06-24","Cyclical business — worth deeper work only with timing edge","pass"),
        ("Strong Buy","2026-06-24","","pass"),  # empty verdict → no substring match → pass
    ]
    abbad=0
    for dec_,dt_,bm_,exp in abcases:
        raw=AB(dec_,dt_,bm_)
        got="na" if raw is None else ("pass" if not raw else "fail"); ok=(got==exp)
        if not ok: abbad+=1
        bm_r=(bm_[:40]+"…" if isinstance(bm_,str) and len(bm_)>40 else bm_)
        print(f"  [{'ok' if ok else 'XX'}] AB({dec_!r},{dt_!r},{bm_r!r}) -> {got}"+("" if ok else f"  EXPECTED {exp}"))
    bad+=abbad
    # check AC — §24 Filter 2 turnaround conviction cap. All golden fixtures predate AC_DATE
    # → always N/A in the main loop; drive every branch here.
    AC=eval_ac_turnaround_cap
    accases=[  # (decision, decision_date, thesis_type, expect: "na"|"pass"|"fail")
        # pre-gate: always N/A
        ("Strong Buy","2026-06-26",["Governance turnaround"],"na"),
        ("Strong Buy","not-a-date",["Governance turnaround"],"na"),
        # non-list thesis_type: N/A (check B handles type errors)
        ("Strong Buy","2026-06-27",None,"na"),
        ("Strong Buy","2026-06-27","Governance turnaround","na"),  # string not list
        # Governance turnaround + Buy/Strong Buy → fail (cap violation)
        ("Strong Buy","2026-06-27",["Governance turnaround"],"fail"),
        ("Buy","2026-06-27",["Governance turnaround"],"fail"),
        # mixed list: Governance turnaround + another type → still caps
        ("Buy","2026-06-27",["Governance turnaround","Company-specific"],"fail"),
        # Governance turnaround + at/below ceiling → pass
        ("Starter Position Only","2026-06-27",["Governance turnaround"],"pass"),
        ("Watchlist","2026-06-27",["Governance turnaround"],"pass"),
        ("Avoid","2026-06-27",["Governance turnaround"],"pass"),
        ("Insufficient Data — Refuse To Rate","2026-06-27",["Governance turnaround"],"pass"),
        # Short Candidate intentionally not capped (shorting a failing turnaround is valid)
        ("Short Candidate","2026-06-27",["Governance turnaround"],"pass"),
        # non-turnaround type → cap not triggered, any conviction allowed
        ("Strong Buy","2026-06-27",["Company-specific"],"pass"),
        ("Buy","2026-06-27",["Sector-cycle","Company-specific"],"pass"),
        # empty list: cap not triggered (Z handles empty-list enum; AC only cares about TURNAROUND_TYPE presence)
        ("Strong Buy","2026-06-27",[],"pass"),
    ]
    acbad=0
    for dec_,dt_,tt_,exp in accases:
        got=AC(dec_,dt_,tt_); ok=(got==exp)
        if not ok: acbad+=1
        print(f"  [{'ok' if ok else 'XX'}] AC({dec_!r},{dt_!r},{tt_!r}) -> {got}"+("" if ok else f"  EXPECTED {exp}"))
    bad+=acbad
    # check AD — §24 Filters 4 + 6 conviction cap. All golden fixtures predate AD_DATE
    # → always N/A in the main loop; drive every branch here.
    AD=eval_ad_filter_4_6_cap
    # bm_txt / mg_txt with RF-CAP-004 / RF-OWN-004 to simulate fired tags
    # A FIRED tag is emitted as a STANDALONE line (tag is the leading token) — _tag_fired_standalone
    # requires that, matching the agent convention (07_business-quality / 99 synthesis emit it so).
    BM_WITH_CAP4 = "Capital allocation review.\nRF-CAP-004 [Critical]: serial-acquirer pattern — three debt-funded deals."
    BM_CLEAN     = "Capital allocation: disciplined; no serial-acquirer pattern."
    MG_WITH_CAP6 = "Ownership read.\nRF-OWN-004 [High]: government-controlled entity; minority interests structurally deprioritised."
    # RF-CAP-004 is actually surfaced in the MANAGEMENT-GOVERNANCE synthesis (02_capital-allocation-
    # scorecard), as in the real TMCV_2026-06-07 fixture — NOT the business-model synthesis.
    MG_WITH_CAP4 = "Capital-allocation scorecard.\nRF-CAP-004 [High]: serial-acquirer / very-large-deal pattern — deal at 3.3x book equity."
    MG_WITH_BOTH = "MG synthesis.\nRF-CAP-004 [High]: very-large-deal pattern.\nRF-OWN-004 [High]: structurally unaligned controlling owner."
    MG_CLEAN     = "Ownership: founder-led; strong alignment with minorities."
    # Cap-APPLICATION table rows — present in EVERY synthesis whether or not the cap fired ("N" = NOT
    # fired). A bare `tag in text` substring false-FAILed these (the bug this fix closes); the tag is not
    # the row's leading token, so _tag_fired_standalone must NOT fire on them.
    BM_TABLEROW_CAP4 = "| Serial-acquirer pattern (§24 Filter 4, RF-CAP-004) | N — no qualifying deals | capital-allocation-scorecard |"
    MG_TABLEROW_BOTH = ("| Serial-acquirer pattern (§24 Filter 4, RF-CAP-004) | N — one bolt-on, immaterial | scorecard |\n"
                        "| Structurally unaligned controlling owner (§24 Filter 6, RF-OWN-004) | N — founder aligned | board-rights |")
    adcases=[  # (decision, decision_date, bm_txt, mg_txt, expect: None|[]|[viol])
        # pre-gate: always None (N/A)
        ("Strong Buy","2026-06-27",BM_WITH_CAP4,MG_WITH_CAP6,None),
        ("Strong Buy","not-a-date",BM_WITH_CAP4,None,None),
        # both modules absent: N/A
        ("Strong Buy","2026-06-28",None,None,None),
        # BM absent (None), MG clean: N/A for F4; MG no tag → pass for F6 → empty list
        ("Strong Buy","2026-06-28",None,MG_CLEAN,[]),
        # BM clean, MG absent: empty list (no tag in BM; MG absent → F6 N/A for that sub-check)
        ("Buy","2026-06-28",BM_CLEAN,None,[]),
        # BM has RF-CAP-004 + conviction → F4 violation
        ("Strong Buy","2026-06-28",BM_WITH_CAP4,None,["RF-CAP-004"]),
        ("Buy","2026-06-28",BM_WITH_CAP4,MG_CLEAN,["RF-CAP-004"]),
        # MG has RF-OWN-004 + conviction → F6 violation
        ("Strong Buy","2026-06-28",BM_CLEAN,MG_WITH_CAP6,["RF-OWN-004"]),
        ("Starter Position Only","2026-06-28",None,MG_WITH_CAP6,["RF-OWN-004"]),
        # Both tags + conviction → two violations
        ("Strong Buy","2026-06-28",BM_WITH_CAP4,MG_WITH_CAP6,["RF-CAP-004","RF-OWN-004"]),
        ("Buy","2026-06-28",BM_WITH_CAP4,MG_WITH_CAP6,["RF-CAP-004","RF-OWN-004"]),
        # REGRESSION — the fixed bug. RF-CAP-004 is surfaced in the MG synthesis (not BM), as in the
        # real TMCV_2026-06-07 fixture. Pre-fix code read RF-CAP-004 from bm_txt ONLY, so Filter 4
        # silently never fired on a real run. Expected: a fired RF-CAP-004 + conviction = a Filter 4
        # violation regardless of which synthesis carries the tag (synthesizer.md Rating Cap Rules:
        # max Watchlist for a serial-acquirer pattern; CLAUDE.md §24 Filter 4).
        ("Buy","2026-06-28",BM_CLEAN,MG_WITH_CAP4,["RF-CAP-004"]),
        ("Strong Buy","2026-06-28",None,MG_WITH_CAP4,["RF-CAP-004"]),
        # TMCV-shape: BOTH §24 caps fire in the MG synthesis, BM clean → both violations (pre-fix
        # code returned ONLY RF-OWN-004, silently dropping the serial-acquirer Filter-4 cap).
        ("Buy","2026-06-28",BM_CLEAN,MG_WITH_BOTH,["RF-CAP-004","RF-OWN-004"]),
        # Non-conviction decisions → always pass (empty list), even with fired tags
        ("Watchlist","2026-06-28",BM_WITH_CAP4,MG_WITH_CAP6,[]),
        ("Avoid","2026-06-28",BM_WITH_CAP4,MG_WITH_CAP6,[]),
        ("Insufficient Data — Refuse To Rate","2026-06-28",BM_WITH_CAP4,MG_WITH_CAP6,[]),
        # Clean synthesis + conviction → pass
        ("Strong Buy","2026-06-28",BM_CLEAN,MG_CLEAN,[]),
        ("Buy","2026-06-28",BM_CLEAN,MG_CLEAN,[]),
        # REGRESSION (fix: bare substring → _tag_fired_standalone) — the standing §24 cap-APPLICATION
        # table rows carry the tag string in EVERY synthesis even when the cap did NOT fire ("| … N |").
        # A bare `in` match false-FAILed a clean conviction run; a cap-table mention must NOT fire the cap
        # (verified on the real TMCV_2026-06-14 / BG_2026-06-07 fixtures, tags present only as N rows).
        ("Strong Buy","2026-06-28",BM_TABLEROW_CAP4,MG_TABLEROW_BOTH,[]),
        ("Buy","2026-06-28",BM_TABLEROW_CAP4,None,[]),
        ("Strong Buy","2026-06-28",BM_CLEAN,MG_TABLEROW_BOTH,[]),
    ]
    adbad=0
    for dec_,dt_,bm_,mg_,exp in adcases:
        got=AD(dec_,dt_,bm_,mg_)
        # Normalise: None stays None; list match on tag substrings so test strings don't need to be exact
        if exp is None:
            ok=(got is None)
        elif isinstance(exp,list) and not exp:
            ok=(isinstance(got,list) and len(got)==0)
        else:
            # exp is a non-empty list of expected tag substrings; each must appear in some violation
            ok=(isinstance(got,list) and len(got)>=len(exp) and all(any(tag in v for v in got) for tag in exp))
        if not ok: adbad+=1
        bm_r=(bm_[:30]+"…" if isinstance(bm_,str) and len(bm_)>30 else bm_)
        mg_r=(mg_[:30]+"…" if isinstance(mg_,str) and len(mg_)>30 else mg_)
        print(f"  [{'ok' if ok else 'XX'}] AD({dec_!r},{dt_!r},bm={bm_r!r},mg={mg_r!r}) -> {got}"
              +("" if ok else f"  EXPECTED exp={exp}"))
    bad+=adbad
    # check AE — §24 Filter 5 fast-changing-industry conviction cap. All golden fixtures predate
    # AE_DATE → always N/A in the main loop; drive every branch here.
    AE=eval_ae_filter5_cap
    # FIRED form: the tag emitted "as a standalone line" exactly as 07_business-quality.md / the BM
    # synthesis are instructed to write it when the rate-of-change row scores ≤40.
    BM_WITH_CAP5 = ("**REJECTOR-FILTER CAPS (§24).** Filter 5 applied.\n"
                    "RF-BQ-005 (fast-changing industry: rate-of-change ≤40)\n"
                    "Semiconductor foundry market disrupted by new entrants.")
    # HEADING form: the same fired standalone tag emitted as a Markdown heading. The `#` markers must be
    # shed so a heading-styled fire is still detected — a false negative would silently bypass the cap
    # (Codex review, P2, eval.py:426). Expected = fired, pinned to synthesizer.md §24 Filter 5 + the
    # "standalone line" emission convention (a heading IS a standalone line).
    BM_HEADING_CAP5 = ("## Score Cap Application\n"
                       "### RF-BQ-005 (fast-changing industry: rate-of-change ≤40)\n"
                       "Capped to Starter Position Only.")
    BM_HEADING_NEG_CAP5 = "### RF-BQ-005 not triggered — rate-of-change scored 72 (Strong)"
    BM_CLEAN_AE  = "Industry rate-of-change / disruption risk: Low. No fast-changing-industry tag emitted."
    # NEGATION/STATUS mention: the tag named on a leading line but reported NOT triggered (row >40).
    # Bare-substring matching would false-positive here (Codex P2, eval.py:420) — the standalone-line
    # detector must NOT fire.
    BM_NEG_CAP5  = ("## Score Cap Application\n"
                    "RF-BQ-005 not triggered — industry rate-of-change scored 72 (Strong).")
    # FIRST-CELL STATUS TABLE ROW (Codex P2): the tag is the leading cell of a cap-application status
    # grid (`| RF-BQ-005 | N | … |`) reporting the cap as NOT applied. After the leading `|` is shed the
    # line starts with the tag, so a bare startswith() false-positives — the remainder begins with a
    # column separator `|`, marking a table row, not a fired standalone tag. Expected = NOT fired,
    # pinned to synthesizer.md §24 Filter 5 (cap fires only when the flag is triggered) + CLAUDE.md §11.
    BM_TABLEROW_FIRSTCELL = "| RF-BQ-005 | N | Business quality | 72 (>40) — fast-changing-industry cap not applied |"
    # FIRED tag whose RATIONALE merely contains a broad word ("absent"/"none"). A negation matched
    # anywhere in the remainder (Codex P2) would treat these real fires as cleared → silent cap bypass
    # (CLAUDE.md §11). The negation is now anchored to the START of the status, so these still fire.
    # Expected = fired, pinned to synthesizer.md §24 Filter 5 ("standalone line" emission convention).
    BM_FIRED_ABSENT = "RF-BQ-005 (fast-changing industry: rate-of-change ≤40) — durable-winner proof absent"
    BM_FIRED_NONE   = "RF-BQ-005 (rate-of-change 28, disruption High) — mitigants none identified"
    # PARENTHETICAL NEGATION: a cleared status wrapped in parens immediately after the tag must STILL
    # read as not-fired (the `(` is shed before the anchored negation check). Expected = NOT fired.
    BM_PAREN_NEG    = "RF-BQ-005 (n/a — rate-of-change scored 81, durable winner)"
    # CAP-TABLE-ROW mention: the tag carried inside a table row (not the leading token), the way the MG
    # synthesis carries RF-CAP-004/RF-OWN-004 in EVERY run regardless of fire. Must NOT false-positive.
    BM_TABLEROW_CAP5 = "| Fast-changing industry (§24 Filter 5, RF-BQ-005) | N | Business quality | max 65 | 78 | 78 | row scored 78 (>40) |"
    # SOURCE-ONLY: 07 specialist fired the tag but the 99 synthesis forgot to propagate it. Reading the
    # synthesis alone (bm_txt) lets the cap silently bypass (Codex P2, eval.py:1453) — scanning the
    # source (bq_txt) must still fire.
    BQ_WITH_CAP5 = ("## 4. Read\nThis is a sector / technology-cycle bet rather than a durable compounder.\n"
                    "RF-BQ-005 (fast-changing industry: rate-of-change ≤40)")
    aecases=[  # (decision, decision_date, bm_txt, bq_txt, edge_score, expect: None|[]|[viol])
        # pre-gate: always None (N/A)
        ("Strong Buy","2026-06-28",BM_WITH_CAP5,None,None,None),
        ("Strong Buy","not-a-date",BM_WITH_CAP5,None,None,None),
        # BM absent (no synthesis AND no specialist): None (N/A) even if post-gate
        ("Strong Buy","2026-06-29",None,None,None,None),
        ("Buy","2026-06-29",None,None,40,None),
        # RF-BQ-005 fired (standalone line) + "Strong Buy" or "Buy" + no proven edge → violation
        ("Strong Buy","2026-06-29",BM_WITH_CAP5,None,None,["RF-BQ-005"]),
        ("Buy","2026-06-29",BM_WITH_CAP5,None,None,["RF-BQ-005"]),
        ("Strong Buy","2026-06-29",BM_WITH_CAP5,None,0,["RF-BQ-005"]),   # edge_score 0 < 50 → not proven
        ("Buy","2026-06-29",BM_WITH_CAP5,None,49,["RF-BQ-005"]),          # edge_score 49 < 50 → not proven
        # Codex P2 #1 — NEGATION / cap-table-row mentions must NOT false-positive (cap NOT fired)
        ("Strong Buy","2026-06-29",BM_NEG_CAP5,None,None,[]),
        ("Buy","2026-06-29",BM_NEG_CAP5,None,None,[]),
        ("Strong Buy","2026-06-29",BM_TABLEROW_CAP5,None,None,[]),
        ("Buy","2026-06-29",BM_TABLEROW_CAP5,None,None,[]),
        # Codex P2 (re-review) — FIRST-CELL status table row (`| RF-BQ-005 | N | … |`) must NOT fire
        ("Strong Buy","2026-06-29",BM_TABLEROW_FIRSTCELL,None,None,[]),
        ("Buy","2026-06-29",BM_TABLEROW_FIRSTCELL,None,None,[]),
        ("Buy","2026-06-29",None,BM_TABLEROW_FIRSTCELL,None,[]),   # same, in the 07 source slot
        # Codex P2 (re-review) — a FIRED tag whose rationale merely contains "absent"/"none" must STILL
        # fire (anchored negation): a broad word buried in rationale no longer suppresses a real fire
        ("Strong Buy","2026-06-29",BM_FIRED_ABSENT,None,None,["RF-BQ-005"]),
        ("Buy","2026-06-29",BM_FIRED_ABSENT,None,None,["RF-BQ-005"]),
        ("Buy","2026-06-29",None,BM_FIRED_NONE,None,["RF-BQ-005"]),   # source-slot fire w/ "none" in rationale
        # guard: a PARENTHETICAL cleared status `(n/a …)` immediately after the tag still reads not-fired
        ("Strong Buy","2026-06-29",BM_PAREN_NEG,None,None,[]),
        ("Buy","2026-06-29",BM_PAREN_NEG,None,None,[]),
        # Codex P2 #4 — fired tag emitted as a Markdown heading must STILL fire (no `#` false negative)
        ("Strong Buy","2026-06-29",BM_HEADING_CAP5,None,None,["RF-BQ-005"]),
        ("Buy","2026-06-29",BM_HEADING_CAP5,None,None,["RF-BQ-005"]),
        ("Buy","2026-06-29",None,BM_HEADING_CAP5,None,["RF-BQ-005"]),     # heading fired in 07 source
        # heading-styled NEGATION must NOT false-positive even after `#` stripping
        ("Strong Buy","2026-06-29",BM_HEADING_NEG_CAP5,None,None,[]),
        ("Buy","2026-06-29",BM_HEADING_NEG_CAP5,None,None,[]),
        # Codex P2 #2 — source emitter (07) fired but synthesis (99) did NOT propagate → still fires
        ("Strong Buy","2026-06-29",BM_CLEAN_AE,BQ_WITH_CAP5,None,["RF-BQ-005"]),
        ("Buy","2026-06-29",None,BQ_WITH_CAP5,None,["RF-BQ-005"]),       # synthesis absent, source fired
        ("Starter Position Only","2026-06-29",BM_CLEAN_AE,BQ_WITH_CAP5,None,[]),  # source fired but at ceiling → pass
        # RF-BQ-005 + "Starter Position Only" → pass (at the ceiling, not above it)
        ("Starter Position Only","2026-06-29",BM_WITH_CAP5,None,None,[]),
        # Short Candidate intentionally not capped (AE only caps ABOVE_STARTER_AE)
        ("Short Candidate","2026-06-29",BM_WITH_CAP5,None,None,[]),
        # Non-conviction decisions → always pass
        ("Watchlist","2026-06-29",BM_WITH_CAP5,None,None,[]),
        ("Avoid","2026-06-29",BM_WITH_CAP5,None,None,[]),
        ("Insufficient Data — Refuse To Rate","2026-06-29",BM_WITH_CAP5,None,None,[]),
        # Edge bypass: proven durable winner (edge_score ≥ 50) lifts the cap entirely
        ("Strong Buy","2026-06-29",BM_WITH_CAP5,None,50,[]),   # threshold: 50 is proven
        ("Buy","2026-06-29",BM_WITH_CAP5,None,75,[]),
        ("Strong Buy","2026-06-29",BM_WITH_CAP5,BQ_WITH_CAP5,100,[]),   # edge lifts even with source fired
        # Clean BM (no RF-BQ-005) + conviction → pass regardless of edge
        ("Strong Buy","2026-06-29",BM_CLEAN_AE,None,None,[]),
        ("Buy","2026-06-29",BM_CLEAN_AE,None,None,[]),
        # edge bypass: false-type edge_score (bool, string) not considered proven
        ("Strong Buy","2026-06-29",BM_WITH_CAP5,None,True,["RF-BQ-005"]),   # bool excluded by isnum
        ("Buy","2026-06-29",BM_WITH_CAP5,None,"high",["RF-BQ-005"]),          # string not a number
    ]
    aebad=0
    for dec_,dt_,bm_,bq_,es_,exp in aecases:
        got=AE(dec_,dt_,bm_,es_,bq_)
        if exp is None:
            ok=(got is None)
        elif isinstance(exp,list) and not exp:
            ok=(isinstance(got,list) and len(got)==0)
        else:
            ok=(isinstance(got,list) and len(got)>=len(exp) and all(any(tag in v for v in got) for tag in exp))
        if not ok: aebad+=1
        bm_r=(bm_[:30]+"…" if isinstance(bm_,str) and len(bm_)>30 else bm_)
        bq_r=(bq_[:24]+"…" if isinstance(bq_,str) and len(bq_)>24 else bq_)
        print(f"  [{'ok' if ok else 'XX'}] AE({dec_!r},{dt_!r},bm={bm_r!r},bq={bq_r!r},es={es_!r}) -> {got}"
              +("" if ok else f"  EXPECTED exp={exp}"))
    bad+=aebad
    # check AF — §24 Filter 1 crooks/integrity conviction cap. All golden fixtures predate AF_DATE
    # → always N/A in the main loop; drive every branch here.
    AF=eval_af_filter1_integrity_cap
    # FIRED form: the tag emitted "as a standalone line" exactly as 01_management-and-track-record.md
    # is instructed to write it when a routed integrity signal remains unresolved after investigation.
    MG_WITH_CAP1 = ("Stewardship summary.\n"
                    "RF-MGT-005 (unresolved adverse integrity signal, unproven)\n"
                    "Allegations of channel-stuffing raised by a short-seller report; not cleared by primary evidence.")
    MG_CLEAN_AF  = "Stewardship summary: management read is clean; no routed integrity signal."
    # NEGATION/STATUS mention: the tag named but reported cleared. Bare-substring matching would
    # false-positive here — the standalone-line detector must NOT fire.
    MG_NEG_CAP1  = "RF-MGT-005 not triggered — the routed signal was investigated and cleared by primary evidence."
    # CAP-TABLE-ROW mention: the tag carried inside the standing Score Cap Application row, present in
    # EVERY synthesis regardless of whether the cap fired. Must NOT false-positive.
    MG_TABLEROW_CAP1 = "| Unresolved adverse integrity signal routed from business-model/01 (§24 Filter 1, RF-MGT-005) | N | Management quality; Disclosure candor | each max 60 | | | |"
    # SOURCE-ONLY: the 01 specialist fired the tag but the 99 synthesis forgot to propagate it. Reading
    # the synthesis alone lets the cap silently bypass — scanning the source must still fire.
    TRACK_WITH_CAP1 = ("## 4A. Turnaround & Integrity Tests\nRouted integrity buzz chased and not cleared.\n"
                       "RF-MGT-005 (unresolved adverse integrity signal, unproven)")
    afcases=[  # (decision, decision_date, mg_txt, track_txt, expect: None|[]|[viol])
        # pre-gate: always None (N/A)
        ("Strong Buy","2026-07-01",MG_WITH_CAP1,None,None),
        ("Strong Buy","not-a-date",MG_WITH_CAP1,None,None),
        # both absent: N/A
        ("Strong Buy","2026-07-02",None,None,None),
        # RF-MGT-005 fired (standalone line) + conviction above Watchlist → violation
        ("Strong Buy","2026-07-02",MG_WITH_CAP1,None,["RF-MGT-005"]),
        ("Buy","2026-07-02",MG_WITH_CAP1,None,["RF-MGT-005"]),
        ("Starter Position Only","2026-07-02",MG_WITH_CAP1,None,["RF-MGT-005"]),
        # negation / cap-table-row mentions must NOT false-positive (cap NOT fired)
        ("Strong Buy","2026-07-02",MG_NEG_CAP1,None,[]),
        ("Strong Buy","2026-07-02",MG_TABLEROW_CAP1,None,[]),
        ("Buy","2026-07-02",MG_TABLEROW_CAP1,None,[]),
        # source-only fire (99 forgot to propagate) → still fires
        ("Strong Buy","2026-07-02",MG_CLEAN_AF,TRACK_WITH_CAP1,["RF-MGT-005"]),
        ("Buy","2026-07-02",None,TRACK_WITH_CAP1,["RF-MGT-005"]),
        # at/below the Watchlist ceiling → pass even with a fired tag
        ("Watchlist","2026-07-02",MG_WITH_CAP1,None,[]),
        ("Avoid","2026-07-02",MG_WITH_CAP1,None,[]),
        ("Pair Trade / Hedge Required","2026-07-02",MG_WITH_CAP1,None,[]),
        ("Insufficient Data — Refuse To Rate","2026-07-02",MG_WITH_CAP1,None,[]),
        # Short Candidate intentionally not capped (a forensic short on integrity concerns is valid)
        ("Short Candidate","2026-07-02",MG_WITH_CAP1,None,[]),
        # clean synthesis + conviction → pass
        ("Strong Buy","2026-07-02",MG_CLEAN_AF,None,[]),
        ("Buy","2026-07-02",MG_CLEAN_AF,None,[]),
        # no edge-score bypass exists for this check (function takes no edge_score arg at all) —
        # covered structurally by the signature, not a separate case.
    ]
    afbad=0
    for dec_,dt_,mg_,track_,exp in afcases:
        got=AF(dec_,dt_,mg_,track_)
        if exp is None:
            ok=(got is None)
        elif isinstance(exp,list) and not exp:
            ok=(isinstance(got,list) and len(got)==0)
        else:
            ok=(isinstance(got,list) and len(got)>=len(exp) and all(any(tag in v for v in got) for tag in exp))
        if not ok: afbad+=1
        mg_r=(mg_[:30]+"…" if isinstance(mg_,str) and len(mg_)>30 else mg_)
        track_r=(track_[:24]+"…" if isinstance(track_,str) and len(track_)>24 else track_)
        print(f"  [{'ok' if ok else 'XX'}] AF({dec_!r},{dt_!r},mg={mg_r!r},track={track_r!r}) -> {got}"
              +("" if ok else f"  EXPECTED exp={exp}"))
    bad+=afbad
    # check AG — Phase 6 calibration-feedback gate (DECISION_LEDGER.md §18). No committed run reaches
    # AG_DATE, so drive every branch here: no-summary / pre-data / checked / applied, each matched or
    # mismatched against calibration_feedback, plus the malformed-status and applied/checked_no_action
    # internal-consistency branches.
    AG=eval_ag_calibration_feedback_gate
    CS_PREDATA={"verdict":"Pre-data — awaits resolved reviews."}
    CS_REAL={"verdict":"Emerging — 12 resolved forecasts."}
    CF_NA={"status":"not_available","haircut_points":0,"modules_flagged":[],"rationale":"no calibration summary exists yet"}
    CF_PD={"status":"pre_data","haircut_points":0,"modules_flagged":[],"rationale":"calibration summary is pre-data"}
    CF_CHECKED={"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"rationale":"checked; no module flagged"}
    CF_APPLIED={"status":"applied","haircut_points":8,"modules_flagged":["valuation"],"rationale":"valuation brier=0.31"}
    agcases=[  # (decision_date, calibration_summary, calibration_feedback, expect: None|[]|["substr"])
        # pre-gate: always None (N/A), regardless of how malformed the other args are
        ("2026-07-05",CS_REAL,None,None),
        ("not-a-date",CS_REAL,None,None),
        # no as-of summary exists → status must be not_available
        ("2026-07-06",None,CF_NA,[]),
        ("2026-07-06",None,CF_PD,["expected 'not_available'"]),
        ("2026-07-06",None,None,["silently skipped"]),
        # summary exists but is Pre-data → status must be pre_data
        ("2026-07-06",CS_PREDATA,CF_PD,[]),
        ("2026-07-06",CS_PREDATA,CF_NA,["expected 'pre_data'"]),
        ("2026-07-06",CS_PREDATA,CF_APPLIED,["expected 'pre_data'"]),  # valid status, but wrong one for a Pre-data summary
        # real signal, nothing flagged → checked_no_action
        ("2026-07-06",CS_REAL,CF_CHECKED,[]),
        ("2026-07-06",CS_REAL,CF_NA,["expected 'checked_no_action' or 'applied'"]),
        # real signal, module flagged → applied, with a positive haircut and non-empty modules_flagged
        ("2026-07-06",CS_REAL,CF_APPLIED,[]),
        ("2026-07-06",CS_REAL,{"status":"applied","haircut_points":0,"modules_flagged":["valuation"],"rationale":"x"},["not a positive number"]),
        ("2026-07-06",CS_REAL,{"status":"applied","haircut_points":8,"modules_flagged":[],"rationale":"x"},["empty/not a list"]),
        ("2026-07-06",CS_REAL,{"status":"checked_no_action","haircut_points":0,"modules_flagged":["valuation"],"rationale":"x"},["non-empty"]),
        # malformed status
        ("2026-07-06",CS_REAL,{"status":"maybe","haircut_points":0,"modules_flagged":[],"rationale":"x"},["not one of"]),
        ("2026-07-06",CS_REAL,{},["not one of"]),
    ]
    agbad=0
    for dt_,cs_,cf_,exp in agcases:
        got=AG(dt_,cs_,cf_)
        if exp is None:
            ok=(got is None)
        elif not exp:
            ok=(isinstance(got,list) and len(got)==0)
        else:
            ok=(isinstance(got,list) and len(got)>0 and all(any(s in v for v in got) for s in exp))
        if not ok: agbad+=1
        print(f"  [{'ok' if ok else 'XX'}] AG({dt_!r},cs_verdict={(cs_ or {}).get('verdict')!r},cf_status={(cf_ or {}).get('status')!r}) -> {got}"
              +("" if ok else f"  EXPECTED exp={exp}"))
    bad+=agbad
    # AH — expectations-gap ship-time audit. The golden suite can't reach it (every committed fixture
    # predates AH_DATE), so drive every branch here: pre-gate, below-conviction confidence, missing
    # report, no-edge contradiction (each of variant_perception_quality/is_exploitable), and a clean pass.
    AH=eval_ah_expectations_gap_gate
    ahcases=[  # (decision_date, confidence_score, eg-dict-or-None, expect: None|[]|[substr,...])
        ("2026-07-07",75,None,None),                                          # predates AH_DATE
        ("2026-07-08",60,None,None),                                         # confidence not > 60
        ("2026-07-08",75,None,["did not run"]),                              # conviction, no report at all
        ("2026-07-08",75,{"variant_perception_quality":"Strong","is_exploitable":True},[]),   # clean pass
        ("2026-07-08",75,{"variant_perception_quality":"Weak","is_exploitable":True},["no independently-proven edge"]),
        ("2026-07-08",75,{"variant_perception_quality":"None","is_exploitable":None},["no independently-proven edge"]),
        ("2026-07-08",75,{},["no independently-proven edge"]),                # absent fields → treated as no edge
        ("2026-07-08",75,{"variant_perception_quality":"Strong","is_exploitable":False},["no independently-proven edge"]),  # explicit False wins over text
        ("2026-07-08",61,{"variant_perception_quality":"Moderate","is_exploitable":True},[]),  # just above the floor, clean
    ]
    ahbad=0
    for dt_,cf_,eg_,exp in ahcases:
        got=AH(dt_,cf_,eg_)
        if exp is None:
            ok=(got is None)
        elif not exp:
            ok=(isinstance(got,list) and len(got)==0)
        else:
            ok=(isinstance(got,list) and len(got)>0 and all(any(s in v for v in got) for s in exp))
        if not ok: ahbad+=1
        print(f"  [{'ok' if ok else 'XX'}] AH({dt_!r},cf={cf_!r},eg={eg_!r}) -> {got}"+("" if ok else f"  EXPECTED exp={exp}"))
    bad+=ahbad
    # AI — Headline Scorecard ↔ decision_record.json reconciliation. No committed run reaches AI_DATE,
    # so drive every branch here, including the two REAL committed-run shapes: TMCV_2026-06-07 (a live,
    # still-uncaught sign-flip bug — prose "+4.3%" vs expected_return_pct=-4.4) and EMAR_2026-07-03 (a
    # legitimate downside-risk sign inversion that must NOT be flagged).
    AI=eval_ai_headline_reconciliation
    def _hs_thesis(exp="",dr="",rr="",conf="",ds=""):
        return ("# Thesis\n\n## 2. Headline Scorecard\n\n| Item | Answer |\n|---|---|\n"
                "| Rating | Buy |\n| Suggested action | Start small |\n| Time horizon | 12-18 months |\n"
                f"| Expected return | {exp} |\n| Downside risk | {dr} |\n| Risk/reward | {rr} |\n"
                f"| Confidence /100 | {conf} |\n| Data sufficiency /100 | {ds} |\n")
    def _hs_thesis_split(exp="",dr="",rr="",conv="",und=""):
        # post-CONF_SPLIT_DATE scorecard: Conviction /100 + Understanding /100 replace Confidence/Data-suff.
        return ("# Thesis\n\n## 2. Headline Scorecard\n\n| Item | Answer |\n|---|---|\n"
                "| Rating | Watchlist |\n| Suggested action | Monitor |\n| Time horizon | 12-18 months |\n"
                f"| Expected return | {exp} |\n| Downside risk | {dr} |\n| Risk/reward | {rr} |\n"
                f"| Understanding /100 | {und} |\n| Conviction /100 | {conv} |\n| Suggested sizing | monitor only |\n")
    D_TMCV={"expected_return_pct":-4.4,"downside_risk_pct":-81.0,"risk_reward":-0.23,"confidence_score":47,"data_sufficiency_score":68}
    TH_TMCV=_hs_thesis(exp="+4.3% (see §8 Scenario Model)", dr="−19% to −81% depending on Iveco scenario",
                        rr="0.72× upside/downside in base case; binary risk makes this ratio misleading",
                        conf="47", ds="68")
    D_EMAR={"expected_return_pct":118.8,"downside_risk_pct":-63.9,"risk_reward":1.9,"confidence_score":52,"data_sufficiency_score":72}
    TH_EMAR=_hs_thesis(exp="+118.8% (probability-weighted; computed — see §14)",
                        dr="+63.9% (bear case AED 20.0 is 64% ABOVE current price AED 12.20 — no loss in bear)",
                        rr="1.9x (reward/bear gap; bear case is above entry, so effective downside is nil)",
                        conf="52", ds="72")
    D_CLEAN={"expected_return_pct":-11.5,"downside_risk_pct":-31.0,"risk_reward":-0.37,"confidence_score":46,"data_sufficiency_score":68}
    TH_CLEAN=_hs_thesis(exp="≈ −11.5% (probability-weighted, vs indicative ~$123.35; see §8/§14)",
                         dr="≈ −31% to the bear value", rr="≈ −0.37 (negative)", conf="**46**", ds="**68**")
    NO_SCORECARD="# Thesis\n\nno scorecard section here\n"
    ROW_MISSING="# Thesis\n\n## 2. Headline Scorecard\n\n| Item | Answer |\n|---|---|\n| Rating | Buy |\n"
    # r3548777238 — later-table leak: the Expected return row is ABSENT from the §2 scorecard but a §8
    # table below repeats it. Extraction scoped to the scorecard section must report the row MISSING,
    # not silently satisfy the tie from the §8 row (synthesizer.md §2: the scorecard is what readers see).
    TH_LATER_LEAK=("# Thesis\n\n## 2. Headline Scorecard\n\n| Item | Answer |\n|---|---|\n"
                   "| Rating | Watchlist |\n| Downside risk | −81% |\n| Risk/reward | −0.23x |\n"
                   "| Confidence /100 | 47 |\n| Data sufficiency /100 | 68 |\n\n"
                   "## 8. Scenario Model\n\n| Metric | Value |\n|---|---|\n| Expected return | −4.4% |\n")
    # r3551580662 — the Confidence row is wholly ABSENT from the scorecard (Data sufficiency present).
    TH_NO_CONF_ROW=("# Thesis\n\n## 2. Headline Scorecard\n\n| Item | Answer |\n|---|---|\n"
                    "| Rating | Watchlist |\n| Data sufficiency /100 | 70 |\n")
    aicases=[  # (decision_date, decision_record_dict, thesis_text, expect: None|[]|[substr,...])
        ("2026-07-08", D_TMCV, TH_TMCV, None),                                    # predates AI_DATE
        ("2026-07-09", D_CLEAN, NO_SCORECARD, ["section not found"]),
        ("2026-07-09", {"confidence_score":46}, ROW_MISSING, ["Confidence /100"]),  # row absent, field set
        ("2026-07-09", D_CLEAN, TH_CLEAN, []),                                    # clean, fully reconciled
        ("2026-07-09", D_EMAR, TH_EMAR, []),                                      # legit downside sign inversion — must NOT flag
        ("2026-07-09", D_TMCV, TH_TMCV, ["Expected return","Risk/reward"]),        # the real, live TMCV bug
        ("2026-07-09", {"confidence_score":80}, _hs_thesis(conf="60"), ["Confidence /100"]),
        ("2026-07-09", {"data_sufficiency_score":70}, _hs_thesis(ds="40"), ["Data sufficiency /100"]),
        ("2026-07-09", {"risk_reward":None,"confidence_score":50}, _hs_thesis(conf="50"), []),  # unset field skipped
        ("2026-07-09", {"confidence_score":46.4}, _hs_thesis(conf="46"), []),                    # rounding within tolerance
        # r3548777238 — later-table leak: scorecard omits Expected return; §8 repeats it → row MISSING.
        ("2026-07-09", D_TMCV, TH_LATER_LEAK, ["Expected return"]),
        # r3548777240 — sign flip within the tolerance window on the sign-sensitive fields → FAIL.
        ("2026-07-09", {"expected_return_pct":-0.4,"risk_reward":-0.07,"confidence_score":50},
         _hs_thesis(exp="+0.4% (probability-weighted)", rr="+0.07x", conf="50"),
         ["Expected return","Risk/reward"]),
        # r3548777241 — wrong number in the cell: a bear-case PRICE equal to downside_risk_pct, real % omitted.
        ("2026-07-09", {"downside_risk_pct":20.0,"confidence_score":50},
         _hs_thesis(dr="bear case AED 20.0 vs current AED 12.20", conf="50"), ["Downside risk"]),
        # r3548777241 — wrong number in the cell: a price target near expected_return_pct, real % omitted.
        ("2026-07-09", {"expected_return_pct":123.0,"confidence_score":50},
         _hs_thesis(exp="target price $123.35 (see §14)", conf="50"), ["Expected return"]),
        # r3548777243 — numeric headline cell but the JSON field is explicitly null → FAIL (not skipped).
        ("2026-07-09", {"expected_return_pct":None,"confidence_score":50},
         _hs_thesis(exp="+20% (probability-weighted)", conf="50"), ["Expected return"]),
        # r3548777243 — numeric headline cell but the JSON field is entirely MISSING → FAIL.
        ("2026-07-09", {"confidence_score":50}, _hs_thesis(exp="+20%", conf="50"), ["Expected return"]),
        # r3551580659 — ratio fallback must IGNORE a stray price sharing the cell: the real ratio is -0.37,
        # and a bad JSON risk_reward=38 equal to the "$38/share" price must NOT reconcile (price is stripped).
        ("2026-07-09", {"risk_reward":38.0,"confidence_score":50},
         _hs_thesis(rr="≈ -0.37 in base case, risking ~$38/share", conf="50"), ["Risk/reward"]),
        # r3551580662 — a required reader-facing SCORE row is ABSENT and its JSON field is null → FAIL
        # (previously skipped, letting a thesis ship with no reader-facing Confidence / Data-sufficiency row).
        ("2026-07-09", {"confidence_score":None,"data_sufficiency_score":70}, TH_NO_CONF_ROW, ["Confidence /100"]),
        # ── Codex #217: post-split (>= 2026-07-11) two-number confidence consistency ──
        # Post-split scorecard uses Conviction /100 + Understanding /100. _hs_thesis_split builds it.
        # (P1) confidence_score must EQUAL conviction (V_edge_gate/AH read confidence_score). A run showing
        # Conviction 80 but confidence_score 50 must FAIL — else an unproven high-conviction thesis ships.
        ("2026-07-11", {"conviction":80,"analysis_confidence":79,"confidence_score":50},
         _hs_thesis_split(conv="80", und="79"), ["confidence_score=50 must equal conviction=80"]),
        # (P1) confidence_score null while conviction set → FAIL.
        ("2026-07-11", {"conviction":72,"analysis_confidence":70,"confidence_score":None},
         _hs_thesis_split(conv="72", und="70"), ["confidence_score", "backward-compat"]),
        # (P1b) conviction JSON field null but the row shows "N/A" → FAIL (scorer did not run).
        ("2026-07-11", {"conviction":None,"analysis_confidence":None,"confidence_score":None},
         _hs_thesis_split(conv="N/A", und="N/A"), ["conviction=None must be a number", "analysis_confidence=None must be a number"]),
        # fully consistent post-split run → clean pass. Carries confidence_inputs/confidence_breakdown/
        # sizing_hint too — the clean-pass fixture must actually satisfy the scorer-artifact check below.
        ("2026-07-11", {"conviction":62,"analysis_confidence":74,"confidence_score":62,
                        "expected_return_pct":-11.5,"downside_risk_pct":-31.0,"risk_reward":-0.37,
                        "confidence_inputs":{"data_sufficiency":70,"decision":"Watchlist"},
                        "confidence_breakdown":{"base":70,"final":62},
                        "sizing_hint":{"band":"watch","action":"monitor only — no position (track opportunity cost)"}},
         _hs_thesis_split(conv="62", und="74", exp="≈ −11.5%", dr="≈ −31%", rr="≈ −0.37"), []),
        # (P2) confidence_inputs missing (null) → the scorer's recorded judgments were never written, even
        # though conviction/analysis_confidence happen to be present numbers → FAIL.
        ("2026-07-11", {"conviction":62,"analysis_confidence":74,"confidence_score":62,"confidence_inputs":None,
                        "confidence_breakdown":{"base":70,"final":62},
                        "sizing_hint":{"band":"watch","action":"monitor only"}},
         _hs_thesis_split(conv="62", und="74"), ["confidence_inputs=None must be an object"]),
        # (P2) confidence_breakdown missing → conviction cannot be re-derived/audited → FAIL.
        ("2026-07-11", {"conviction":62,"analysis_confidence":74,"confidence_score":62,
                        "confidence_inputs":{"data_sufficiency":70,"decision":"Watchlist"},
                        "confidence_breakdown":None,
                        "sizing_hint":{"band":"watch","action":"monitor only"}},
         _hs_thesis_split(conv="62", und="74"), ["confidence_breakdown=None must be an object"]),
        # (P2) sizing_hint present but missing the required 'action' string → FAIL.
        ("2026-07-11", {"conviction":62,"analysis_confidence":74,"confidence_score":62,
                        "confidence_inputs":{"data_sufficiency":70,"decision":"Watchlist"},
                        "confidence_breakdown":{"base":70,"final":62},
                        "sizing_hint":{"band":"watch"}},
         _hs_thesis_split(conv="62", und="74"), ["sizing_hint", "must be an object with"]),
        # (Codex #217, P2) split scores must be BOUNDED 0-100, not merely numeric. analysis_confidence=140
        # reconciles against a matching cell but is out of range → FAIL (pinned to CLAUDE.md §12, not code).
        ("2026-07-11", {"conviction":80,"analysis_confidence":140,"confidence_score":80},
         _hs_thesis_split(conv="80", und="140"), ["analysis_confidence=140 is outside the 0-100 range"]),
        # (Codex #217, P2) a negative conviction is likewise out of range (confidence_score matches it, so the
        # equality check passes — the range check is what must catch it).
        ("2026-07-11", {"conviction":-10,"analysis_confidence":70,"confidence_score":-10},
         _hs_thesis_split(conv="-10", und="70"), ["conviction=-10 is outside the 0-100 range"]),
        # (Codex #217, P2) legacy rows must not survive the split: a carried-forward template that still shows
        # Confidence /100 + Data sufficiency /100 next to the new rows → FAIL (two disagreeing systems).
        ("2026-07-11", {"conviction":62,"analysis_confidence":74,"confidence_score":62},
         ("# Thesis\n\n## 2. Headline Scorecard\n\n| Item | Answer |\n|---|---|\n"
          "| Rating | Watchlist |\n| Understanding /100 | 74 |\n| Conviction /100 | 62 |\n"
          "| Confidence /100 | 62 |\n| Data sufficiency /100 | 70 |\n"),
         ["legacy scorecard row 'Confidence /100' must not appear"]),
    ]
    aibad=0
    for dt_,d_,th_,exp in aicases:
        got=AI(dt_,d_,th_)
        if exp is None:
            ok=(got is None)
        elif not exp:
            ok=(isinstance(got,list) and len(got)==0)
        else:
            ok=(isinstance(got,list) and len(got)>0 and all(any(s in v for v in got) for s in exp))
        if not ok: aibad+=1
        print(f"  [{'ok' if ok else 'XX'}] AI({dt_!r},d={ {k:v for k,v in d_.items()} !r}) -> {got}"+("" if ok else f"  EXPECTED exp={exp}"))
    bad+=aibad
    # AJ — Decision Audit Trail structural check. No committed run reaches AJ_DATE, so drive every
    # branch here, including real committed-run row shapes (BG/HCG) copied verbatim as the clean-pass
    # fixture, so the check is proven against real synthesizer output, not just synthetic tables.
    AJ=eval_aj_decision_audit_trail
    def _dat_thesis(rows_md):
        return "# Thesis\n\n## Decision Audit Trail\n\n"+rows_md
    ROW_HEAD=("| Decision Driver | Bull Evidence | Bear Evidence | Which Side Wins? | Why? | Confidence /100 |\n"
              "|---|---|---|---|---|---:|\n")
    TH_DAT_MISSING="# Thesis\n\n## 6. Valuation\n\nno Decision Audit Trail section here\n"
    TH_DAT_EMPTY=_dat_thesis(ROW_HEAD)  # header + separator only, zero data rows
    TH_DAT_ONE_ROW=_dat_thesis(ROW_HEAD+"| Valuation | Cheap vs peers | Priced for perfection | **Bear** | DCF below price | 60 |\n")
    TH_DAT_BLANK_CELL=_dat_thesis(ROW_HEAD+
        "| Valuation | Cheap vs peers | Priced for perfection | **Bear** | DCF below price | 60 |\n"
        "| Solvency | Net cash | - | **Bull** | No near-term break | 70 |\n"          # blank Bear Evidence ("-")
        "| Governance | Clean audit | No disqualifiers | **Bull** | N/A | 55 |\n")     # blank Why? ("N/A")
    # Real committed-run shape (HCG_2026-06-01, condensed) — must PASS cleanly.
    TH_DAT_CLEAN=_dat_thesis(ROW_HEAD+
        "| **Valuation level** | EV/EBITDA ~32% below peers; KKR optionality | Reverse-DCF implies ~33% FCF CAGR never achieved | **Bear** | Three of four methods land at-to-below price | 75 |\n"
        "| **Demand quality** | Cancer care non-deferrable; +20% CAGR | Demand quality doesn't pay if not converted to returns | **Bull (immaterial)** | Already priced, doesn't offset sub-cost returns | 80 |\n"
        "| **Returns on capital** | Mature centres earn ~27% ROCE | Statutory ROC ~4.6% vs ~11-12% cost of capital | **Bear** | Statutory basis governs the cost-of-capital test | 78 |\n"
        "| **Solvency** | Net debt 2.57x incl. leases, down from 4.13x | Deleveraging was equity-funded, not FCF | **Bull (adequate)** | Removes distress risk, doesn't make equity cheap | 70 |\n")
    # Review-fix fixtures (Codex r3556238195 / r3556238198 / r3556238203). Expected verdicts pinned to
    # synthesizer.md Step 5 ("at least 3 real decision-driver rows, each with a genuine, non-placeholder
    # Bull Evidence, Bear Evidence, Which Side Wins, and Why cell") and CLAUDE.md §22 ("adjudicate, not
    # summarize"), NOT to current code behaviour.
    # (1) Header omits 'Bear Evidence' but still has 5 columns — the bull/bear adjudication shape is absent.
    BAD_HEAD=("| Decision Driver | Bull Evidence | Which Side Wins? | Why? | Confidence |\n"
              "|---|---|---|---|---:|\n")
    TH_DAT_BAD_HEADER=_dat_thesis(BAD_HEAD+
        "| Valuation | Cheap vs peers | **Bear** | DCF below price | 60 |\n"
        "| Solvency | Net cash | **Bull** | No near-term break | 70 |\n"
        "| Governance | Clean audit | **Bull** | No disqualifiers | 55 |\n")
    # (2) Unicode em-dash / en-dash placeholder cells — token, not adjudication.
    TH_DAT_UNICODE_DASH=_dat_thesis(ROW_HEAD+
        "| Valuation | Cheap vs peers | Priced for perfection | **Bear** | DCF below price | 60 |\n"
        "| Solvency | Net cash | — | **Bull** | No near-term break | 70 |\n"        # em-dash Bear Evidence
        "| Governance | Clean audit | No disqualifiers | **Bull** | – | 55 |\n")     # en-dash Why?
    # (3) Part II omits the table; a later appendix carries its own '## Decision Audit Trail' — must NOT satisfy.
    TH_DAT_APPENDIX_ONLY=("# PART II — CROSS-CUTTING ANALYSIS\n\nNarrative only, no audit table here.\n\n"
        "# PART V — EVIDENCE AND PROCESS\n\n## Decision Audit Trail\n\n"+ROW_HEAD+
        "| Valuation | Cheap vs peers | Priced for perfection | **Bear** | DCF below price | 60 |\n"
        "| Solvency | Net cash | Equity-funded | **Bull** | No near break | 70 |\n"
        "| Governance | Clean audit | No disqualifiers | **Bull** | Ok | 55 |\n")
    # Positive control: the SAME clean table correctly placed under Part II must still pass with scoping on.
    TH_DAT_CLEAN_PART2=("# PART II — CROSS-CUTTING ANALYSIS\n\n"+
        "## Decision Audit Trail"+TH_DAT_CLEAN.split("## Decision Audit Trail",1)[1]+
        "\n# PART III — MODULE CHAPTERS\n\n(chapters)\n")
    ajcases=[  # (decision_date, thesis_text, expect: None|[]|[substr,...])
        ("2026-07-09", TH_DAT_CLEAN, None),                                        # predates AJ_DATE
        ("2026-07-10", TH_DAT_MISSING, ["section not found"]),
        ("2026-07-10", TH_DAT_EMPTY, ["no data rows"]),
        ("2026-07-10", TH_DAT_ONE_ROW, ["only 1 Decision Audit Trail row"]),
        ("2026-07-10", TH_DAT_BLANK_CELL, ["blank 'Bear Evidence'", "blank 'Why?'"]),
        ("2026-07-10", TH_DAT_BAD_HEADER, ["header column 3", "Bear Evidence"]),   # (1) header lacks Bear Evidence col
        ("2026-07-10", TH_DAT_UNICODE_DASH, ["blank 'Bear Evidence'", "blank 'Why?'"]),  # (2) em/en-dash placeholders
        ("2026-07-10", TH_DAT_APPENDIX_ONLY, ["section not found"]),               # (3) table only in appendix, not Part II
        ("2026-07-10", TH_DAT_CLEAN_PART2, []),                                     # (3) positive control: clean table IN Part II passes
        ("2026-07-10", TH_DAT_CLEAN, []),                                          # clean, real-shape pass
        ("2026-07-11", TH_DAT_CLEAN, []),                                          # after the gate date too
    ]
    ajbad=0
    for dt_,th_,exp in ajcases:
        got=AJ(dt_,th_)
        if exp is None:
            ok=(got is None)
        elif not exp:
            ok=(isinstance(got,list) and len(got)==0)
        else:
            ok=(isinstance(got,list) and len(got)>0 and all(any(s in v for v in got) for s in exp))
        if not ok: ajbad+=1
        print(f"  [{'ok' if ok else 'XX'}] AJ({dt_!r}) -> {got}"+("" if ok else f"  EXPECTED exp={exp}"))
    bad+=ajbad
    # AK — red-flag severity reconciliation. No committed run reaches AK_DATE, so drive every branch
    # here, including the REAL committed-run shape (AMZN_2026-07-10, condensed): the earnings module
    # declares 2 Critical red flags ("Anthropic Level 3 mark-to-model asset", "D&A from AI capex wave")
    # via both the "(2 critical, ..." prose and "| Critical flags | 2 |" table row, but the committed
    # decision_record.json carries those same two flags (RF-ACC-001, RF-OPS-001) as severity="High", and
    # the Headline Scorecard's Rating-cap cell reads "...no verdict-lock or Critical red flag" — the
    # live, still-uncaught bug this check exists to catch.
    AK=eval_ak_red_flag_severity_reconciliation
    MT_EARNINGS_2CRIT = ("## 1. Earnings Verdict\n\n- **Red-flag agent overall severity verdict: Critical "
        "concerns** (2 critical, 14 high, 10 medium flags — 26 triggered total)\n\n"
        "| # | Category | Red Flag | Status | Severity |\n|---|---|---|---|---|\n"
        "| 1 | Earnings Quality | Anthropic Level 3 mark-to-model asset | Triggered | Critical |\n"
        "| 2 | Sensitivity | D&A from AI capex wave | Triggered | Critical |\n\n"
        "| Critical flags | 2 |\n")
    MT_GOVERNANCE_0CRIT = ('```json\n{"red_flag_count": 2, "critical_red_flag_count": 0}\n```\n'
        "**Red-Flag Count: 2. Critical: 0.**\n")
    MT_BM_NUMERIC_SEVERITY = ("Six new flags with severity >=40: Anthropic investment (62), litigation "
        "overhang (58) — a 0-100 numeric severity scale, not a Critical/High/Medium/Low label.\n")
    RF_HIGH_ONLY = [{"id":"RF-ACC-001","severity":"High","description":"Anthropic mark-to-model"},
                     {"id":"RF-OPS-001","severity":"High","description":"D&A opacity"}]
    RF_TWO_CRITICAL = [{"id":"RF-ACC-001","severity":"Critical","description":"Anthropic mark-to-model"},
                        {"id":"RF-OPS-001","severity":"Critical","description":"D&A opacity"}]
    TH_AK_DENIAL = _hs_thesis(exp="-16.1%", dr="-38.7%", rr="-0.42x", conf="57", ds="65").replace(
        "| Data sufficiency /100 | 65 |\n",
        "| Data sufficiency /100 | 65 |\n| Rating cap, if any | Edge gate binding; no verdict-lock or Critical red flag |\n")
    TH_AK_CLEAN = _hs_thesis(exp="-16.1%", dr="-38.7%", rr="-0.42x", conf="57", ds="65").replace(
        "| Data sufficiency /100 | 65 |\n",
        "| Data sufficiency /100 | 65 |\n| Rating cap, if any | 2 Critical red flags cap the rating at Watchlist per §13/§18 |\n")
    # Codex #212 fix: the parenthesized "**Critical flags (3):**" phrasing is a production format
    # (analyses/NIVABUPA_2026-06-22/earnings/99_earnings-synthesis.md:132) the original patterns missed.
    MT_EARNINGS_PAREN3 = ("## 1. Earnings Verdict\n\n**Critical flags (3):** three accounting-integrity "
        "items triggered — mark-to-model asset, D&A opacity, channel stuffing.\n")
    # Codex #212 fix: a TRUTHFUL scoped cap cell — affirms the 2 earnings Criticals AND correctly notes a
    # DIFFERENT module (governance) has none. Compliant per §13/§18; the old bare-denial regex false-failed it.
    TH_AK_SCOPED = _hs_thesis(exp="-16.1%", dr="-38.7%", rr="-0.42x", conf="57", ds="65").replace(
        "| Data sufficiency /100 | 65 |\n",
        "| Data sufficiency /100 | 65 |\n| Rating cap, if any | 2 Critical earnings flags cap the rating at Watchlist per §13/§18; no Critical governance red flag |\n")
    akcases=[  # (decision_date, decision_record_dict, thesis_text, module_texts, expect: None|[]|[substr,...])
        ("2026-07-10", {"red_flags":RF_HIGH_ONLY}, TH_AK_DENIAL, {"earnings":MT_EARNINGS_2CRIT}, None),  # predates AK_DATE
        ("2026-07-11", {"red_flags":[]}, "# Thesis\n", {}, []),                                          # no modules -> nothing to reconcile
        ("2026-07-11", {"red_flags":[]}, "# Thesis\n", {"management-governance":MT_GOVERNANCE_0CRIT}, []), # explicit declared 0 -> nothing to reconcile
        ("2026-07-11", {"red_flags":[]}, "# Thesis\n", {"business-model":MT_BM_NUMERIC_SEVERITY}, []),    # numeric 0-100 severity scale never matches
        # the live AMZN_2026-07-10 bug shape: severity downgraded AND the headline denies a Critical flag
        ("2026-07-11", {"red_flags":RF_HIGH_ONLY}, TH_AK_DENIAL, {"earnings":MT_EARNINGS_2CRIT},
         ["declares 2 Critical red flag(s) but decision_record.json's red_flags array carries only 0",
          "denies a Critical red flag"]),
        # severity correctly carried through but the headline text still denies -> still a real defect
        ("2026-07-11", {"red_flags":RF_TWO_CRITICAL}, TH_AK_DENIAL, {"earnings":MT_EARNINGS_2CRIT},
         ["denies a Critical red flag"]),
        # fully reconciled: severity carried through AND the headline states the cap -> clean pass
        ("2026-07-11", {"red_flags":RF_TWO_CRITICAL}, TH_AK_CLEAN, {"earnings":MT_EARNINGS_2CRIT}, []),
        # management-governance's clean structured 0-critical shape alongside a real earnings 2-critical
        # declaration -> still governed by the earnings module's nonzero count
        ("2026-07-11", {"red_flags":RF_TWO_CRITICAL}, TH_AK_CLEAN,
         {"earnings":MT_EARNINGS_2CRIT, "management-governance":MT_GOVERNANCE_0CRIT}, []),
        # Codex #212 (parenthesized-count): "**Critical flags (3):**" declares 3 but red_flags carries 0
        # -> must be caught. RED on the pre-fix patterns (the paren format was unmatched -> declared={} -> pass).
        ("2026-07-11", {"red_flags":[]}, TH_AK_CLEAN, {"earnings":MT_EARNINGS_PAREN3},
         ["declares 3 Critical red flag(s) but decision_record.json's red_flags array carries only 0"]),
        # Codex #212 (scoped-denial false positive): a truthful cell that affirms the 2 Criticals AND scopes
        # the "no Critical" to a DIFFERENT module must PASS. RED on the pre-fix bare-denial regex (it fired).
        ("2026-07-11", {"red_flags":RF_TWO_CRITICAL}, TH_AK_SCOPED, {"earnings":MT_EARNINGS_2CRIT}, []),
    ]
    akbad=0
    for dt_,d_,th_,mt_,exp in akcases:
        got=AK(dt_,d_,th_,mt_)
        if exp is None:
            ok=(got is None)
        elif not exp:
            ok=(isinstance(got,list) and len(got)==0)
        else:
            ok=(isinstance(got,list) and len(got)>0 and all(any(s in v for v in got) for s in exp))
        if not ok: akbad+=1
        print(f"  [{'ok' if ok else 'XX'}] AK({dt_!r},red_flags={d_.get('red_flags')!r}) -> {got}"+("" if ok else f"  EXPECTED exp={exp}"))
    bad+=akbad

    # check AN — supersession-integrity (§4a). Fixture-free: build tmp target dirs to exercise the
    # existence branches. A valid sidecar → []; a dangling/empty target → violation; no supersession → None.
    import tempfile as _tf
    anbad=0
    with _tf.TemporaryDirectory() as _td:
        _good=os.path.join(_td,"EMAAR_2026-07-10"); os.makedirs(_good)
        open(os.path.join(_good,"decision_record.json"),"w").write("{}")
        _empty=os.path.join(_td,"EMPTY_2026-01-01"); os.makedirs(_empty)  # exists but no decision_record.json
        # circular pair: CYCA superseded_by CYCB, CYCB superseded_by CYCA — both dropped, no live record
        _cyca=os.path.join(_td,"CYCA_2026-01-01"); os.makedirs(_cyca); open(os.path.join(_cyca,"decision_record.json"),"w").write("{}")
        _cycb=os.path.join(_td,"CYCB_2026-01-01"); os.makedirs(_cycb); open(os.path.join(_cycb,"decision_record.json"),"w").write("{}")
        open(os.path.join(_cyca,"corrections.json"),"w").write(json.dumps({"schema":"corrections/v1","superseded_by":{"run_root":_cycb}}))
        open(os.path.join(_cycb,"corrections.json"),"w").write(json.dumps({"schema":"corrections/v1","superseded_by":{"run_root":_cyca}}))
        ancases=[
            ({}, None),                                                                     # no sidecar → N/A
            ({"errata":[{"field":"x","kind":"scale_fix"}]}, None),                          # errata-only → N/A
            ({"superseded_by":{"run_root":_good}}, []),                                     # valid live target → pass
            ({"superseded_by":{"run_root":os.path.join(_td,"NOPE_2026-01-01")}}, ["does not exist"]),
            ({"superseded_by":{"run_root":_empty}}, ["no decision_record.json"]),
            ({"superseded_by":{"reason":"x"}}, ["no run_root"]),                            # missing run_root
            ({"superseded_by":{"run_root":_cyca}}, ["circular"]),                           # A→B→A chain → caught
        ]
        for corr_,exp in ancases:
            got=eval_an_supersession_integrity(corr_)
            if exp is None: ok=(got is None)
            elif not exp: ok=(isinstance(got,list) and len(got)==0)
            else: ok=(isinstance(got,list) and len(got)>0 and all(any(s in v for v in got) for s in exp))
            if not ok: anbad+=1
            print(f"  [{'ok' if ok else 'XX'}] AN({corr_}) -> {got}"+("" if ok else f"  EXPECTED {exp}"))
    bad+=anbad

    # check AM — bear-case sanity (§8/§16). A Selected long whose bear price target is at/above entry has no loss branch.
    ambad=0
    _SCEN_LOSS=[{"label":"Bear","price_target":8.0},{"label":"Base","price_target":15.0}]
    _SCEN_GAIN=[{"label":"Bear case","price_target":20.0},{"label":"Base","price_target":27.0}]  # EMAAR 07-03 shape
    amcases=[  # (decision_date, decision, scenarios, entry_price, expect)
        ("2026-07-16","Starter Position Only",_SCEN_GAIN,12.2,None),                        # predates AM_DATE → N/A
        ("2026-07-17","Watchlist",_SCEN_GAIN,12.2,None),                                    # not a Selected long → N/A
        ("2026-07-17","Starter Position Only",_SCEN_LOSS,12.2,[]),                          # real loss branch → pass
        ("2026-07-17","Starter Position Only",_SCEN_GAIN,12.2,["no genuine downside branch"]), # bear is a gain → FAIL
        ("2026-07-17","Buy",[{"label":"Base","price_target":15.0}],12.2,None),              # no bear scenario → N/A
        ("2026-07-17","Strong Buy",_SCEN_LOSS,None,None),                                   # no entry price → N/A
    ]
    for dt_,dec_,sc_,ep_,exp in amcases:
        got=eval_am_bear_case_sanity(dt_,dec_,sc_,ep_)
        if exp is None: ok=(got is None)
        elif not exp: ok=(isinstance(got,list) and len(got)==0)
        else: ok=(isinstance(got,list) and len(got)>0 and all(any(s in v for v in got) for s in exp))
        if not ok: ambad+=1
        print(f"  [{'ok' if ok else 'XX'}] AM({dt_!r},{dec_!r}) -> {got}"+("" if ok else f"  EXPECTED {exp}"))
    bad+=ambad

    # check AO — forecast resolvability (§19). Pinned/settleable + partitioned triggers, and a ≤90-day proof point.
    aobad=0
    _fc_good={"confirmation_trigger":"Q1 EBITDA margin at or below 12.0%","falsification_trigger":"Q1 margin at or above 12.3%","time_window":"August 2026"}
    _fc_bare={"confirmation_trigger":"beats consensus","falsification_trigger":"misses consensus","time_window":"August 2026"}
    _fc_nonum={"confirmation_trigger":"the plan works","falsification_trigger":"the plan fails","time_window":"August 2026"}
    _fc_ident={"confirmation_trigger":"margin above 12%","falsification_trigger":"margin above 12%","time_window":"August 2026"}
    _fc_far={"confirmation_trigger":"net cash eliminated below 0","falsification_trigger":"net cash still above 0","time_window":"December 2028"}
    _fc_fycons={"confirmation_trigger":"FY27 EPS beats consensus","falsification_trigger":"FY27 EPS below consensus","time_window":"August 2026"}
    _fc_fyrangecons={"confirmation_trigger":"FY26-27 EPS beats consensus","falsification_trigger":"FY26-27 EPS below consensus","time_window":"August 2026"}
    _fc_realcons={"confirmation_trigger":"FY27 EPS above 42 vs consensus 40","falsification_trigger":"FY27 EPS below 40","time_window":"August 2026"}
    _fc_far_undate={"confirmation_trigger":"net cash below 0","falsification_trigger":"net cash above 0","time_window":"the medium term"}
    _fc_yearthresh={"confirmation_trigger":"revenue above 2026 cr, beating consensus","falsification_trigger":"revenue below 2026 cr","time_window":"August 2026"}
    _fc_invbare={"confirmation_trigger":"investor confidence improves","falsification_trigger":"investor confidence weakens","time_window":"August 2026"}
    _fc_invdoc={"confirmation_trigger":"guidance raised at the investor presentation","falsification_trigger":"guidance cut at the investor presentation","time_window":"August 2026"}
    _fc_stale={"confirmation_trigger":"margin above 12%","falsification_trigger":"margin below 12%","time_window":"January 2026"}
    _fc_fyonly={"confirmation_trigger":"FY27 margin improves","falsification_trigger":"FY27 margin weakens","time_window":"August 2026"}
    _fc_nextq={"confirmation_trigger":"margin improves next quarter","falsification_trigger":"margin does not improve next quarter","time_window":"August 2026"}
    _fc_baddate={"confirmation_trigger":"margin above 12%","falsification_trigger":"margin below 12%","time_window":"resolves 2026-02-31"}
    _fc_nt={"confirmation_trigger":"margin above 12%","falsification_trigger":"margin below 12%","time_window":"August 2026"}
    _fc_conssplit={"confirmation_trigger":"FY27 EPS beats consensus","falsification_trigger":"revenue below 2026 cr","time_window":"August 2026"}
    _fc_onesided={"confirmation_trigger":"margin above 12%","falsification_trigger":"margin does not improve","time_window":"August 2026"}
    _fc_bareresults={"confirmation_trigger":"operating results improve","falsification_trigger":"operating results worsen","time_window":"August 2026"}
    _fc_q1results={"confirmation_trigger":"guidance raised in the Q1 results","falsification_trigger":"guidance cut in the Q1 results","time_window":"August 2026"}
    _fc_periodlbl={"confirmation_trigger":"Q1 EBITDA margin at or below 12.0%","falsification_trigger":"Q1 margin at or above 12.3%","time_window":"quarter ended June 2026; results August 2026"}
    _fc_vague={"confirmation_trigger":"net cash eliminated below 0","falsification_trigger":"net cash still above 0","time_window":"over the next few years"}
    _fc_samemonth={"confirmation_trigger":"Q1 EBITDA margin at or below 12.0%","falsification_trigger":"Q1 margin at or above 12.3%","time_window":"results July 2026"}
    _fc_conshalf={"confirmation_trigger":"FY27 EPS above 42 vs consensus 40","falsification_trigger":"FY27 EPS below consensus in Q1 results","time_window":"August 2026"}
    _fc_compactcons={"confirmation_trigger":"Q1FY27 EPS beats consensus","falsification_trigger":"Q1FY27 EPS below consensus","time_window":"August 2026"}
    _fc_bareguid={"confirmation_trigger":"guidance improves","falsification_trigger":"guidance worsens","time_window":"August 2026"}
    _fc_qonly={"confirmation_trigger":"net cash eliminated below 0","falsification_trigger":"net cash still above 0","time_window":"Q1 FY27"}
    aocases=[  # (decision_date, forecast_ledger, expect: None=N/A, []=pass, [substrings]=fail-with)
        ("2026-07-17",[_fc_good],None),                                        # predates AO_DATE → N/A
        ("2026-07-18",[],None),                                                # empty ledger → N/A (§19)
        ("2026-07-18",[_fc_good],[]),                                          # pinned + near-term → pass
        ("2026-07-18",[_fc_bare],["pins no number"]),                          # bare 'beats consensus' → FAIL
        ("2026-07-18",[_fc_nonum],["not mechanically resolvable"]),            # no number, no doc → FAIL
        ("2026-07-18",[_fc_ident],["outcome space is not partitioned"]),       # identical triggers → FAIL
        ("2026-07-18",[_fc_far,_fc_far],["insufficient near-term"]),           # every dateable fc >90d → record FAIL
        ("2026-07-18",[_fc_good,_fc_far],[]),                                  # 1-of-2 near-term (50% ≥ 40%) → pass
        ("2026-07-18",[_fc_fycons],["pins no number"]),                        # consensus + only a FISCAL-YEAR digit → FAIL
        ("2026-07-18",[_fc_fyrangecons],["pins no number"]),                   # consensus + only a FISCAL-YEAR-RANGE (FY26-27) → FAIL (the '-27' must not read as a pinned number)
        ("2026-07-18",[_fc_realcons],[]),                                      # consensus WITH a real pinned number → pass
        ("2026-07-18",[_fc_far],["insufficient near-term"]),                   # a SINGLE long-dated forecast → FAIL
        ("2026-07-18",[_fc_far_undate],["no dateable near-term proof point"]), # genuinely unbounded window ('the medium term'), no period ref → no near-term proof point → FAIL (r12)
        ("2026-07-18",[_fc_qonly],[]),                                         # UNDATEABLE but a bounded fiscal period ('Q1 FY27') → benefit of the doubt, still passes (r12)
        ("2026-07-18",[_fc_compactcons],["pins no number"]),                   # compact 'Q1FY27' stripped → bare 'beats consensus' with no pinned value → FAIL (r12)
        ("2026-07-18",[_fc_bareguid],["not mechanically resolvable"]),         # bare 'guidance improves' is not a settleable document and pins no number → FAIL (r12)
        ("2026-07-18",[_fc_yearthresh],[]),                                    # a 2026 THRESHOLD (not a year) survives → pins a number → pass
        ("2026-07-18",[_fc_invbare],["not mechanically resolvable"]),          # bare 'investor confidence' is not a document → FAIL
        ("2026-07-18",[_fc_invdoc],[]),                                        # 'investor presentation' IS a settleable document → pass
        ("2026-07-18",[_fc_stale],["BEFORE the decision date"]),              # window resolves before decision → stale → FAIL
        ("2026-07-18",[_fc_fyonly],["not mechanically resolvable"]),           # 'FY27 margin improves' — a fiscal digit is not a threshold → FAIL (r3 #1)
        ("2026-07-18",[_fc_nextq],["not mechanically resolvable"]),            # bare 'next quarter' is not a document → FAIL (r3 #4)
        ("2026-07-18",[_fc_baddate],["impossible calendar date"]),            # 2026-02-31 → flagged, not silently undateable (r3 #2)
        ("2026-07-18",[_fc_nt,_fc_far,_fc_far,_fc_far,_fc_far],["insufficient near-term"]), # 1 near / 4 long = 20% < 40% → FAIL (r3 #3)
        ("2026-07-18",[_fc_conssplit],["pins no number in the consensus trigger"]), # consensus in one trigger, unrelated number in the other → FAIL (r4 #1)
        ("2026-07-18",[_fc_onesided],["the falsification trigger"]),          # numbered confirmation, vague falsification → FAIL (r5 #6)
        ("2026-07-18",[_fc_bareresults],["not mechanically resolvable"]),     # bare 'operating results' is not a specific document → FAIL (r6 #5)
        ("2026-07-18",[_fc_q1results],[]),                                     # 'Q1 results' IS a period-qualified settleable document → pass (r6 #5)
        ("2026-07-18",[_fc_periodlbl],[]),                                     # window names a pre-decision PERIOD label (June) AND a resolution date (Aug) → pick the on/after date → near-term pass, not misread as stale (r8)
        ("2026-07-18",[_fc_vague,_fc_far,_fc_far,_fc_far,_fc_far],["insufficient near-term"]), # 1 undateable + 4 long, 0 near-term → the undateable one can't dodge the quota when a long forecast exists (r10)
        ("2026-07-18",[_fc_samemonth],[]),                                     # 'results July 2026' on a July-18 decision → month runs to the 31st, NOT stale, near-term → pass (r11)
        ("2026-07-18",[_fc_conshalf],["pins no number in the consensus trigger"]), # one consensus side pins 42/40, the other 'below consensus in Q1 results' names a doc but pins no consensus value → FAIL (r11)
        ("2026-07-18",5,None),                                                 # malformed (non-list) → N/A, never crash
        ("2026-07-18",None,None),                                              # None ledger → N/A
    ]
    for dt_,fl_,exp in aocases:
        got=eval_ao_forecast_resolvability(dt_,fl_)
        if exp is None: ok=(got is None)
        elif not exp: ok=(isinstance(got,list) and len(got)==0)
        else: ok=(isinstance(got,list) and len(got)>0 and all(any(s in v for v in got) for s in exp))
        if not ok: aobad+=1
        _n=len(fl_) if isinstance(fl_,list) else repr(fl_)  # non-list fixtures (malformed-ledger cases) have no len()
        print(f"  [{'ok' if ok else 'XX'}] AO({dt_!r},fl={_n}) -> {got}"+("" if ok else f"  EXPECTED {exp}"))
    bad+=aobad

    print(("SELFTEST PASS" if not bad else f"SELFTEST FAIL ({bad} case(s))")+f" — {len(cases)} check-W + {len(xcases)} check-X + {len(ycases)} check-Y + {len(zcases)} check-Z + {len(t2cases)} check-T2 + {len(t3cases)} check-T3 + {len(aacases)} check-AA + {len(evcases)} AA-extractor + {len(abcases)} check-AB + {len(accases)} check-AC + {len(adcases)} check-AD + {len(aecases)} check-AE + {len(afcases)} check-AF + {len(agcases)} check-AG + {len(ahcases)} check-AH + {len(aicases)} check-AI + {len(ajcases)} check-AJ + {len(akcases)} check-AK + {len(ancases)} check-AN + {len(amcases)} check-AM + {len(aocases)} check-AO cases")
    sys.exit(0 if not bad else 1)

runs=sorted(glob.glob("analyses/*/decision_record.json"))
if scope not in ("all",""):
    # [review fix] precise scope match — NOT a raw `scope in r` substring, which over-matched
    # (scope "G" hit BG+HCG; "01"/"06" matched the folder DATE digits, grading unrelated runs).
    def _inscope(r):
        nm=os.path.basename(os.path.dirname(r))                       # e.g. BG_2026-06-01
        return (nm==scope or nm.startswith(scope+"_") or nm.split("_")[0]==scope
                or os.path.dirname(r)==scope.rstrip("/") or r==scope)
    runs=[r for r in runs if _inscope(r)]
results={}; suite_pass=True
for drp in runs:
    run=os.path.dirname(drp); name=os.path.basename(run); checks=[]
    def add(c,ok,detail,na=False):
        checks.append({"check":c,"status":("N/A" if na else ("PASS" if ok else "FAIL")),"detail":detail})
        return ok or na
    # A structural
    ft=os.path.join(run,"final_thesis.md"); rm=os.path.join(run,"RUN_METADATA.md")
    okA = os.path.exists(ft) and os.path.getsize(ft)>1024 and os.path.exists(rm)
    # [fix F-EVAL-1] a "module" is a run subdir that holds numbered agent outputs (NN_*.md); non-module dirs like
    # `_pool_extracts` (the data-pool extraction cache, MODULE_PIPELINE Step 1.5) carry no NN_*.md and are not flagged.
    # Without this the harness was permanently RED on every binary-pool run (it mistook _pool_extracts for a module
    # missing its 99-synthesis). [review fix] We now require BOTH: the dir is NOT underscore-prefixed (the cache/meta
    # convention, e.g. _pool_extracts) AND it has NN_*.md but no 99-synthesis — so a numbered *.md ever landing in a
    # cache dir cannot false-fire the suite RED, while empty/stray dirs are still ignored.
    miss99=[os.path.basename(d) for d in glob.glob(os.path.join(run,"*")) if os.path.isdir(d) and not os.path.basename(d).startswith("_") and glob.glob(os.path.join(d,"[0-9][0-9]_*.md")) and not glob.glob(os.path.join(d,"99_*-synthesis.md"))]
    okA = okA and not miss99
    add("A_structural", okA, f"final_thesis>1KB={os.path.exists(ft) and os.path.getsize(ft)>1024}; RUN_METADATA={os.path.exists(rm)}; modules_missing_99={miss99}")
    # B schema
    try: d=json.load(open(drp)); parsed=True
    except Exception as e: d={}; parsed=False; add("B_schema",False,f"JSON parse failed: {e}")
    if parsed:
        missing=[k for k in REQ if k not in d]
        badtype=[k for k in ARRAYS if not isinstance(d.get(k),list)]+[k for k in OBJECTS if not isinstance(d.get(k),dict)]
        # [review fix] additive fields: validate TYPE when present (never require presence — older records omit them).
        # `scenarios` (the array check M consumes) and the post-review numerics were previously type-unchecked.
        for _k,_t in [("scenarios",list),("post_review_confidence_score",(int,float)),("confidence_haircut",(int,float)),("edge_score",(int,float))]:
            v=d.get(_k)
            if _k in d and v is not None and not (isinstance(v,_t) and not isinstance(v,bool)): badtype.append(_k)
        if "pre_mortem_verdict" in d and not isinstance(d.get("pre_mortem_verdict"),str): badtype.append("pre_mortem_verdict")
        if "edge_proof" in d and not isinstance(d.get("edge_proof"),str): badtype.append("edge_proof")
        for _sk in ("business_type","primary_valuation_method"):
            if _sk in d and not isinstance(d.get(_sk),str): badtype.append(_sk)
        # [fix F28b] post_mortem_decision + post_mortem_basket are additive string fields written by the
        # finish-gate's rating-cap propagation step; type-check when present (never require presence —
        # pre-gate runs omit them; the forward-looking check T validates the content).
        for _ak in ("post_mortem_decision","post_mortem_basket"):
            if _ak in d and not isinstance(d.get(_ak),str): badtype.append(_ak)
        okB = parsed and not missing and not badtype and d.get("schema_version")=="1.0"
        add("B_schema", okB, f"missing={missing}; badtype={badtype}; schema_version={d.get('schema_version')}")
    # B2 [review fix] decision_date VALUE must be a real ISO date — not merely present (B only checks presence). A
    # garbage/null date otherwise sends every forward-looking gate (K..S) to a FALSE "predates feature" N/A.
    add("B2_decision_date", isdate(d.get("decision_date")), f"decision_date={d.get('decision_date')!r} valid_iso={isdate(d.get('decision_date'))}")
    # C decision + basket
    dec=d.get("decision"); bask=d.get("basket"); pt=(d.get("paper_treatment") or "").lower()
    okC = dec in DECISIONS and bask==DECISIONS.get(dec) and any(k in pt for k in PAPER_KW.get(DECISIONS.get(dec,""),["x"]))
    add("C_decision_basket", okC, f"decision={dec!r} basket={bask!r} (expected {DECISIONS.get(dec)!r}); paper_treatment ok={any(k in pt for k in PAPER_KW.get(DECISIONS.get(dec,''),['x']))}")
    # D missing price
    if d.get("entry_price") is None:
        # [review fix] notes must ADDRESS the missing/indicative price — not merely contain the substring "price"
        # (which matched "underpriced"/"price target"). Require a phrase about the absent/unverified entry price.
        _notes=(d.get("notes") or "").lower()
        _ref=bool(re.search(r"(no paper trade|entry[_ ]price is (?:null|set to null)|indicative|unverified|not pool[- ]verified|no current price|no verified price|missing price|no entry price|price is null)", _notes))
        okD = (any(k in pt for k in ["no trade"]) or bask in ("Watchlist","Rejected","Insufficient Data","Short","Pair Trade")) and _ref
        add("D_missing_price", okD, f"entry_price null; notes addresses missing/indicative price={_ref}")
    else:
        add("D_missing_price", True, "entry_price present", na=True)
    # E numeric hygiene
    # [review fix] include the additive post-review numbers; isnum() excludes bool (a JSON true/false otherwise passed).
    _numkeys=["expected_return_pct","downside_risk_pct","margin_of_safety_pct","risk_reward","confidence_score","data_sufficiency_score","post_review_confidence_score","confidence_haircut"]
    nums={k:d.get(k) for k in _numkeys if k in d}
    okE=all(v is None or isnum(v) for v in nums.values()) and all(0<=d.get(k)<=100 for k in ["confidence_score","data_sufficiency_score","post_review_confidence_score"] if isnum(d.get(k)))
    add("E_numeric", okE, f"{nums}")
    # F review schedule date math
    sch=d.get("review_schedule") or {}; dd=d.get("decision_date")
    okF=isdate(dd) and all(w in sch for w in ["30d","90d","180d","365d"])
    detailF=[]
    if not isdate(dd): detailF.append(f"decision_date invalid/missing: {dd!r}")   # [review fix] no PASS-style detail on FAIL
    if isdate(dd) and not all(w in sch for w in ["30d","90d","180d","365d"]): detailF.append(f"missing review window(s); have {sorted(sch)}")
    if okF:
        base=datetime.date.fromisoformat(dd)
        for w,days in [("30d",30),("90d",90),("180d",180),("365d",365)]:
            exp=(base+datetime.timedelta(days=days)).isoformat()
            if sch.get(w)!=exp: okF=False; detailF.append(f"{w}={sch.get(w)} exp {exp}")
    add("F_review_dates", okF, "; ".join(detailF) or f"all 30/90/180/365 = decision_date+N from {dd}")
    # G audit reports (optional)
    # resolve the LATEST version of an audit report (convention: base=first, _v2/_v3=newer => authoritative is the highest version)
    def _latest(stem):
        # [review fix] EXACT stem match (`X.json` or `X_v<n>.json`) — the old `X*.json` glob over-matched siblings
        # like `verification_report_summary.json`. Deterministic tie-break on path so G/O/S never read different files.
        base=stem[:-5]
        c=[p for p in glob.glob(os.path.join(run, base+"*.json"))
           if re.fullmatch(re.escape(base)+r"(_v\d+)?", os.path.basename(p)[:-5])]
        def _ver(x):
            m=re.search(r"_v(\d+)\.json$",x); return int(m.group(1)) if m else 1
        return max(c, key=lambda x:(_ver(x), x)) if c else None
    for af,reqk in [("verification_report.json",["verdict","integrity_score"]),("pre_mortem.json",["verdict","survives"]),("expectations_gap.json",["gap_direction","edge_score"])]:
        p=_latest(af)
        if not p: add(f"G_{af}", True, "absent", na=True); continue
        try:
            a=json.load(open(p)); okG=all(k in a for k in reqk) and a.get("verdict")!="Failed"
            add(f"G_{af}", okG, f"using {os.path.basename(p)}; verdict={a.get('verdict')}")
        except Exception as e: add(f"G_{af}", False, f"parse failed: {e}")
    # H stray confirmation blocks
    stray=[]
    for mf in glob.glob(os.path.join(run,"*","*.md")):
        try: tail="".join(open(mf).read().splitlines(keepends=True)[-20:])
        except: continue
        if re.search(r"(?m)^Agent:\s+\S.*$", tail): stray.append(os.path.relpath(mf,run))   # [review fix] multi-word agent names (e.g. "Agent: business model synthesis") were missed by \S+\s*$
    add("H_no_stray_confirmation", not stray, f"stray={stray}")
    # I decision <-> thesis consistency [review fix] — anchor on the thesis's "Decision:" line or "| Rating |"
    # scorecard cell, NOT a bare substring (which let decision="Buy" match "Buyback", or "Avoid" match the §24
    # "Avoid Big Risks" header, while the actual headline disagreed).
    try: thesis=open(ft).read()
    except: thesis=""
    if dec:
        _de=re.escape(dec)
        _decline=re.search(r"(?im)^[`*>\s|.\-]*Decision\s*[:\-]\s*[`*]*\s*"+_de+r"\b", thesis)
        _ratingcell=re.search(r"(?im)\|\s*Rating\s*\|\s*[`*]*\s*"+_de+r"\b", thesis)
        okI=bool(_decline or _ratingcell)
    else:
        okI=False
    add("I_decision_in_thesis", okI, f"decision {dec!r} stated in a Decision: line / Rating cell of final_thesis.md={okI}")
    # K §24 rejector-filter roll-up reflected in post-§24 runs (forward-looking; older fixtures N/A)
    S24_DATE="2026-06-03"; ddte=d.get("decision_date")
    if isdate(ddte) and ddte>=S24_DATE:
        okK=("Avoid-Big-Risks" in thesis) or ("Avoid Big Risks" in thesis) or ("§24" in thesis)
        add("K_s24_in_thesis", okK, f"run dated >= {S24_DATE}; §24 roll-up present in final_thesis={okK}")
    else:
        add("K_s24_in_thesis", True, f"run predates §24 ({ddte}) — N/A", na=True)
    # L three output tiers present in post-landing runs (forward-looking; older fixtures N/A)
    TIER3_DATE="2026-06-03"
    if isdate(ddte) and ddte>=TIER3_DATE:
        has_memo=os.path.exists(os.path.join(run,"memo.md")); has_audit=os.path.exists(os.path.join(run,"audit_dossier.md"))
        add("L_three_tiers", has_memo and has_audit, f"run dated >= {TIER3_DATE}; memo.md={has_memo} audit_dossier.md={has_audit}")
    else:
        add("L_three_tiers", True, f"run predates three-tier feature ({ddte}) — N/A", na=True)
    # M scenario-math reconciliation [fix F08/F12] — recompute the §10 identities from decision_record.scenarios[]
    #   instead of trusting the LLM's hand arithmetic. Forward-looking: older fixtures have no scenarios[] -> N/A,
    #   so the golden suite stays green; the gate activates automatically for every run dated >= SCEN_DATE.
    SCEN_DATE="2026-06-08"; scen=d.get("scenarios")
    if isdate(ddte) and ddte>=SCEN_DATE:
        if not isinstance(scen,list) or not scen:
            # a post-gate run that quantified a return MUST ship the machine-readable scenario block.
            # [review fix — Codex] margin_of_safety_pct is unverifiable with no scenarios[] to derive it from
            # (no base-labelled target exists), so a numeric MoS here is exactly as unre-derivable as a
            # numeric expected_return_pct would be — gate it the same way instead of only checking ER.
            MOS_DATE="2026-07-10"
            _mos_ok = d.get("margin_of_safety_pct") is None or not (isdate(ddte) and ddte>=MOS_DATE)
            add("M_scenario_math", d.get("expected_return_pct") is None and _mos_ok,
                "scenarios[] missing/empty but expected_return_pct and/or margin_of_safety_pct is set — cannot re-derive the math (required post-2026-06-08 / MoS post-2026-07-10)")
        else:
            det=[]; okM=True
            try:
                probs=[float(s["probability"]) for s in scen]; rets=[float(s["return_pct"]) for s in scen]
                psum=sum(probs)
                if abs(psum-100)>0.5: okM=False; det.append(f"prob sum={round(psum,2)}!=100")
                calc_er=sum(p/100.0*r for p,r in zip(probs,rets)); er=d.get("expected_return_pct")
                # [review fix] sign-aware AND with a relative floor — the old absolute 1.0pp tol let SMALL-magnitude
                # sign flips through (e.g. +0.4 vs -0.4, gap 0.8 < 1.0). return_pct is the POSITION return (a short's
                # winning case is +ve), so calc_er and the headline expected_return_pct share one sign convention.
                if isnum(er):
                    _signflip=(abs(er)>0.25 and abs(calc_er)>0.25 and (er>0)!=(calc_er>0))
                    if abs(er-calc_er)>max(1.0, abs(calc_er)*0.05) or _signflip:
                        okM=False; det.append(f"expected_return_pct={er} != Sum(p*ret)={round(calc_er,2)}")
                tgts=[s.get("price_target") for s in scen]; ep=d.get("entry_price")
                have_t=[isnum(t) for t in tgts]
                # [review fix] price_target was read with .get() so omitting ONE silently SKIPPED both the
                # ER-from-target and risk/reward cross-checks (the two strongest, independent anchors). Now: if a
                # price anchor exists, require ALL price targets PRESENT and NUMERIC; a partial set OR a
                # present-but-non-numeric target (e.g. the string "150") FAILs instead of being dropped as "absent".
                if isnum(ep) and ep and any(t is not None for t in tgts) and not all(have_t):
                    okM=False; det.append("price_target present on some scenarios but not all numeric — cannot reconcile target/risk-reward")
                if isnum(ep) and ep and all(have_t):
                    pwt=sum(p/100.0*t for p,t in zip(probs,tgts))
                    # [PR#9 review fix] direction-aware: a SHORT profits when price FALLS, so its return,
                    # its worst case, and its risk/reward all invert. Hard-coding the long side (er=(pwt-ep)/ep,
                    # worst=min(tgts), rr=(pwt-ep)/(ep-worst)) falsely failed valid Short Candidate runs.
                    short=DECISIONS.get(dec)=="Short"
                    er_t=((ep-pwt) if short else (pwt-ep))/ep*100.0
                    _tflip=(abs(er_t)>0.25 and abs(calc_er)>0.25 and (er_t>0)!=(calc_er>0))   # [review fix] sign-aware
                    if abs(er_t-calc_er)>max(1.5, abs(calc_er)*0.05) or _tflip:
                        okM=False; det.append(f"ER_from_target={round(er_t,2)} != Sum(p*ret)={round(calc_er,2)}")
                    rr=d.get("risk_reward"); worst=max(tgts) if short else min(tgts)
                    if (worst>ep if short else ep>worst):   # a real adverse case exists → risk/reward is derivable
                        crr=((ep-pwt)/(worst-ep)) if short else ((pwt-ep)/(ep-worst))
                        if not isnum(rr):
                            okM=False; det.append(f"risk_reward null but derivable from scenarios = {round(crr,2)} — must be published when price targets are used")
                        elif abs(rr-crr)>max(0.15,abs(crr)*0.12): okM=False; det.append(f"risk_reward={rr} != calc={round(crr,2)}")
                # downside_risk_pct completes the §10 triple (expected_return ✓, risk_reward ✓): it is the
                # worst-case (bear) position return, negated to a downside magnitude — downside = −min(scenario
                # return_pct) = (entry − bear_price)/entry. return_pct is already position-signed (a short's
                # winning case is +ve), so min() is the worst case for BOTH long and short — no separate short
                # branch. Verified vs the EMAR committed run (published −63.9 == −min(180.3,127.0,63.9)).
                # Needs no price targets (works in returns-only mode); sign-flip guarded like the ER check.
                dr=d.get("downside_risk_pct")
                if rets:
                    cdr=-min(rets)
                    if not isnum(dr):
                        # [review fix — Codex #186 thread 1] scenarios[] make downside derivable (= −min(return_pct),
                        # price-free), and the synthesizer now REQUIRES downside_risk_pct be copied from the computed
                        # math. A null value used to skip this subcheck (the old `isnum(dr)` guard) and still pass M
                        # with the headline downside blank — now it FAILs, exactly like an omitted expected_return.
                        okM=False; det.append(f"downside_risk_pct missing/null but derivable from scenarios = {round(cdr,2)}")
                    else:
                        _drflip=(abs(dr)>0.25 and abs(cdr)>0.25 and (dr>0)!=(cdr>0))
                        if abs(dr-cdr)>max(1.0,abs(cdr)*0.05) or _drflip:
                            okM=False; det.append(f"downside_risk_pct={dr} != −min(scenario return)={round(cdr,2)}")
                # margin_of_safety_pct — discount of price to the BASE-case fair value: (base FV − price)/base FV,
                # base FV = the base-labelled scenario's price_target (valuation's base level feeds §8 as the base
                # target, so the two must tie). Direction-UNIFORM: built from price LEVELS not position-signed returns,
                # so a short candidate (base FV < price) yields a negative MoS on the SAME formula — no branch (unlike
                # downside). When price + base FV make it derivable, a run dated >= MOS_DATE MUST publish it (only the
                # no-pool-verified-price case may stay null); a present value that cannot be re-derived is unverifiable
                # and FAILs. (A non-numeric margin_of_safety_pct is caught by check E via _numkeys.)
                mos=d.get("margin_of_safety_pct"); MOS_DATE="2026-07-10"
                _base=next((s for s in scen if str(s.get("label","")).strip().lower()=="base"), None)
                bfv=_base.get("price_target") if isinstance(_base,dict) else None
                _mder=isnum(ep) and ep and isnum(bfv) and bfv
                if isnum(mos):
                    if _mder:
                        cmos=(bfv-ep)/bfv*100.0
                        _mflip=(abs(mos)>0.25 and abs(cmos)>0.25 and (mos>0)!=(cmos>0))
                        if abs(mos-cmos)>max(1.0,abs(cmos)*0.05) or _mflip:
                            okM=False; det.append(f"margin_of_safety_pct={mos} != (base FV − price)/base FV={round(cmos,2)}")
                    elif isdate(ddte) and ddte>=MOS_DATE:
                        okM=False; det.append("margin_of_safety_pct present but not re-derivable — no base-labelled scenario price_target")
                elif mos is None and _mder and isdate(ddte) and ddte>=MOS_DATE:
                    okM=False; det.append(f"margin_of_safety_pct null but derivable from the base scenario = {round((bfv-ep)/bfv*100.0,2)} — required for runs dated >= {MOS_DATE}")
            except Exception as e:
                okM=False; det.append(f"scenario parse error: {e}")
            add("M_scenario_math", okM, "; ".join(det) or "prob sum=100; expected_return=Sum(p*ret); target & risk/reward reconcile")
    else:
        add("M_scenario_math", True, f"run predates scenario-math gate ({ddte}) — N/A", na=True)
    # N no scratch-reasoning leaked into the committed thesis [fix F12] — a published artifact must not contain
    #   model self-correction text (a real run shipped "...= -4.35%... let me recalculate correctly"). Forward-looking.
    if isdate(ddte) and ddte>=SCEN_DATE:
        # [review fix] broadened to the phrasings the old alternation missed (re-derive, re-run, scratch that, reconsider, correcting:)
        leak=sorted(set(m.lower() for m in re.findall(r"(?im)\b(let me (?:re-?calculate|re-?compute|re-?check|re-?derive|re-?run|redo|reconsider|correct(?:\s+th(?:at|is))?|try again|fix)|i need to re-?(?:compute|calculate|derive)|scratch (?:that|work)|hold on,? let me|recomputing|correcting[:,])", thesis)))
        add("N_no_scratch_leak", not leak, f"scratch-reasoning phrases in final_thesis.md={leak}")
    else:
        add("N_no_scratch_leak", True, f"run predates scratch-leak gate ({ddte}) — N/A", na=True)
    # O integrity finish-gate present for committed conviction runs [fix F01] — a post-gate Selected/Short
    #   run must carry the in-path verify-evidence + pre-mortem reports the /research:full finish-gate (10B)
    #   produces; their absence means the integrity gate did not run. Forward-looking; older fixtures N/A.
    if isdate(ddte) and ddte>=SCEN_DATE and DECISIONS.get(dec) in ("Selected","Short"):
        has_ve = bool(_latest("verification_report.json")); has_pm = bool(_latest("pre_mortem.json"))
        add("O_integrity_gate", has_ve and has_pm,
            f"Selected/Short run dated >= {SCEN_DATE} must carry verification_report.json({has_ve}) + pre_mortem.json({has_pm}) from the finish-gate")
    else:
        add("O_integrity_gate", True, "N/A (not a post-gate Selected/Short run)", na=True)
    # P disconfirmation / edge quality [fix F39] — the eval used to check disconfirmation FIELDS exist
    #   but never their quality. A post-gate thesis must carry a NON-tautological edge (what the market
    #   may be missing must differ from what everyone knows; an explicitly-empty "no edge yet" is allowed)
    #   and at least one concrete kill criterion. Forward-looking; older fixtures N/A.
    if isdate(ddte) and ddte>=SCEN_DATE:
        wek=(d.get("what_everyone_knows") or "").strip().lower()
        wmm=(d.get("what_market_may_be_missing") or "").strip().lower()
        # [review fix] kill_criteria elements may be plain strings (BG/HCG) OR objects (the live synthesizer / TMCV
        # emits {condition, what_it_means, ...}). The old `isinstance(k,str)` filter emptied the object form and would
        # FALSE-FAIL the whole suite ("kill_criteria empty") on every current-format run dated >= the gate.
        def _kc_text(k):
            if isinstance(k,str): return k.strip()
            if isinstance(k,dict):
                for f in ("condition","criterion","trigger","what_invalidates","kill_criterion","description","text"):
                    v=k.get(f)
                    if isinstance(v,str) and v.strip(): return v.strip()
                return " ".join(str(v) for v in k.values() if isinstance(v,str)).strip()
            return ""
        kc=[t for t in (_kc_text(k) for k in (d.get("kill_criteria") or [])) if t]
        det=[]
        if wmm and wek and wmm==wek: det.append("what_market_may_be_missing == what_everyone_knows (tautological edge)")
        if not kc: det.append("kill_criteria empty (a thesis needs at least one falsification trigger)")
        add("P_disconfirmation", not det, "; ".join(det) or "edge non-tautological; kill_criteria present")
    else:
        add("P_disconfirmation", True, f"run predates disconfirmation-quality gate ({ddte}) — N/A", na=True)
    # Q per-module three tiers present in post-landing runs (forward-looking; older fixtures N/A)
    MODTIER_DATE="2026-06-08"
    if isdate(ddte) and ddte>=MODTIER_DATE:
        modmiss=[]
        for dsub in glob.glob(os.path.join(run,"*")):
            if not os.path.isdir(dsub) or not glob.glob(os.path.join(dsub,"99_*-synthesis.md")): continue
            mb=os.path.basename(dsub)
            if not glob.glob(os.path.join(dsub,"*_memo.md")): modmiss.append(mb+"/memo")
            if not glob.glob(os.path.join(dsub,"*_dossier.md")): modmiss.append(mb+"/dossier")
        add("Q_module_tiers", not modmiss, f"run dated >= {MODTIER_DATE}; modules missing a tier={modmiss}")
    else:
        add("Q_module_tiers", True, f"run predates module-tiers feature ({ddte}) — N/A", na=True)
    # Q per-module-tiers add() calls renamed from M_ to avoid collision with M_scenario_math (both shipped 2026-06-08)
    # R memo-delta contract (forward-looking; landing 2026-06-10) — a review filed on/after the landing date must
    #   carry the §8 memo_delta block; any block present must have its paired *_memo_delta*.md on disk, an in-enum
    #   thesis_delta_verdict, an evidence_source per changed section, and rerun targets that are REAL modules.
    MEMO_DELTA_DATE="2026-06-10"; DELTA_VERDICTS={"unchanged","strengthened","weakened","broken","too_early"}
    rdet=[]; rseen=False
    for rvf in sorted(glob.glob(os.path.join(run,"reviews","*_decision_review*.json"))):
        try: rv=json.load(open(rvf))
        except Exception as e: rseen=True; rdet.append(f"{os.path.basename(rvf)}: unparseable ({str(e)[:60]})"); continue
        rdate=rv.get("review_date") or ""
        mdl=rv.get("memo_delta")
        if not isinstance(mdl,dict) or not mdl:
            if isdate(rdate) and rdate>=MEMO_DELTA_DATE:
                rseen=True; rdet.append(f"{os.path.basename(rvf)}: memo_delta missing (required for reviews filed on/after {MEMO_DELTA_DATE})")
            continue
        rseen=True
        mdf=mdl.get("memo_delta_file") or ""
        if not (isinstance(mdf,str) and "_memo_delta" in os.path.basename(mdf) and os.path.exists(mdf)):
            rdet.append(f"{os.path.basename(rvf)}: memo_delta_file missing or absent on disk ({mdf!r})")
        elif len(open(mdf,encoding="utf-8").read().split())>2500:
            rdet.append(f"{os.path.basename(mdf)}: > 2500 words — a memo delta is a 2-3 page update, not a re-written memo")
        if mdl.get("thesis_delta_verdict") not in DELTA_VERDICTS:
            rdet.append(f"{os.path.basename(rvf)}: thesis_delta_verdict={mdl.get('thesis_delta_verdict')!r} not in {sorted(DELTA_VERDICTS)}")
        for i,cs in enumerate(mdl.get("changed_sections") or []):
            if not isinstance(cs,dict): rdet.append(f"{os.path.basename(rvf)}: changed_sections[{i}] is not an object"); continue
            if not str(cs.get("evidence_source") or "").strip():
                rdet.append(f"{os.path.basename(rvf)}: changed_sections[{i}] lacks evidence_source (a changed claim needs a dated citation)")
            if cs.get("rerun_recommended"):
                mods=[m for m in (cs.get("impacted_modules") or []) if isinstance(m,str)]
                bad=sorted(set(mods)-ROSTER)
                if not mods: rdet.append(f"{os.path.basename(rvf)}: changed_sections[{i}] rerun_recommended without impacted_modules")
                if bad: rdet.append(f"{os.path.basename(rvf)}: changed_sections[{i}] unknown module(s) {bad} (roster={sorted(ROSTER)})")
    if rseen:
        add("R_memo_delta", not rdet, "; ".join(rdet) or "memo_delta blocks valid; paired markdown present; rerun targets are real modules")
    else:
        add("R_memo_delta", True, f"no reviews filed on/after {MEMO_DELTA_DATE} — N/A", na=True)
    # AL pre-mortem calibration check (forward-looking; landing 2026-07-17) — audit-of-the-auditor. A review
    #   filed on/after the landing date must carry pre_mortem_check with a valid outcome_vs_verdict enum, and
    #   outcome_vs_verdict must be "not_applicable" IFF no pre_mortem*.json exists in the run root — never a
    #   silent skip (missing block) and never a false "checked" claim when nothing was actually compared
    #   (DECISION_LEDGER.md §8). Mirrors check R's per-review iteration pattern exactly.
    PRE_MORTEM_CHECK_DATE="2026-07-17"
    PM_OUTCOMES={"not_applicable","too_early","vindicated","contradicted","partial"}
    # [review fix] resolve via _latest — the SAME resolver G/O/S use (exact `pre_mortem.json` / `pre_mortem_v<n>.json`
    # stem). A raw `pre_mortem*.json` glob over-matches siblings (e.g. pre_mortem_summary.json), which would make
    # this check disagree with G/O/S about whether a pre-mortem exists — the exact defect a prior review fixed at S.
    has_pm_file=bool(_latest("pre_mortem.json"))
    aldet=[]; alseen=False
    for rvf in sorted(glob.glob(os.path.join(run,"reviews","*_decision_review*.json"))):
        try: rv=json.load(open(rvf))
        except Exception: continue  # already reported by check R/F
        rdate=rv.get("review_date") or ""
        if not (isdate(rdate) and rdate>=PRE_MORTEM_CHECK_DATE): continue
        alseen=True
        pmc=rv.get("pre_mortem_check")
        if not isinstance(pmc,dict) or not pmc:
            aldet.append(f"{os.path.basename(rvf)}: pre_mortem_check missing (required for reviews filed on/after {PRE_MORTEM_CHECK_DATE})")
            continue
        ov=pmc.get("outcome_vs_verdict")
        if ov not in PM_OUTCOMES:
            aldet.append(f"{os.path.basename(rvf)}: outcome_vs_verdict={ov!r} not in {sorted(PM_OUTCOMES)}")
        elif has_pm_file and ov=="not_applicable":
            aldet.append(f"{os.path.basename(rvf)}: pre_mortem.json exists in run root but outcome_vs_verdict=not_applicable")
        elif not has_pm_file and ov!="not_applicable":
            aldet.append(f"{os.path.basename(rvf)}: no pre_mortem.json in run root but outcome_vs_verdict={ov!r} (should be not_applicable)")
        # §8 requires `partial` to explain the split, exactly as vindicated/contradicted must name the driver.
        if ov in ("vindicated","contradicted","partial") and not str(pmc.get("notes") or "").strip():
            aldet.append(f"{os.path.basename(rvf)}: outcome_vs_verdict={ov!r} needs a notes explanation")
        # [review fix] The copied pre-mortem fields are what /research:calibrate reads to split `contradicted`
        # into false_comfort vs excess_caution — a block carrying only outcome_vs_verdict passes the enum test
        # yet silently breaks that aggregation. Require them whenever a pre-mortem actually exists (§8).
        if has_pm_file and ov in PM_OUTCOMES and ov!="not_applicable":
            for _f in ("pre_mortem_file","pre_mortem_verdict"):
                if not str(pmc.get(_f) or "").strip():
                    aldet.append(f"{os.path.basename(rvf)}: {_f} is empty but a pre-mortem exists "
                                 f"(calibrate needs the copied verdict to split contradicted)")
    if alseen:
        add("AL_pre_mortem_check", not aldet, "; ".join(aldet) or "pre_mortem_check present, enum valid, consistent with pre_mortem*.json presence")
    else:
        add("AL_pre_mortem_check", True, f"no reviews filed on/after {PRE_MORTEM_CHECK_DATE} — N/A", na=True)
    # S pre-mortem haircut propagated to decision_record (forward-looking; landing 2026-06-12 / fix F28)
    #   When the finish-gate's pre-mortem applied a haircut > 0, the decision_record must carry
    #   post_review_confidence_score == pre_mortem.recommended_confidence so the calibration and
    #   tracking systems use the post-red-team confidence, not the raw synthesizer number.
    HAIRCUT_DATE="2026-06-12"
    if isdate(ddte) and ddte>=HAIRCUT_DATE:
        pmp=_latest("pre_mortem.json")   # [review fix] same resolver as G/O — was a separate glob+sort that could disagree on which version is authoritative
        if pmp:
            try:
                pm=json.load(open(pmp))
                rec=pm.get("recommended_confidence")
                orig=pm.get("original_confidence")
                if not isnum(orig): orig=d.get("confidence_score")
                # [review fix] DERIVE the haircut from the confidence delta this check exists to enforce — do not
                # trust a possibly-null/zeroed self-reported confidence_haircut field to decide whether a haircut happened.
                haircut=pm.get("confidence_haircut")
                if not isnum(haircut):
                    haircut=(orig-rec) if (isnum(orig) and isnum(rec)) else 0
                dr_post=d.get("post_review_confidence_score")
                dr_hc=d.get("confidence_haircut")
                dr_pv=d.get("pre_mortem_verdict")
                det_s=[]
                if isnum(haircut) and haircut>0:
                    # a non-zero haircut MUST be verifiable and reflected in decision_record
                    if not isnum(rec): det_s.append(f"haircut={haircut} but pre_mortem.recommended_confidence missing/invalid — propagation unverifiable")
                    if dr_post is None: det_s.append(f"confidence_haircut={haircut} but post_review_confidence_score absent in decision_record")
                    elif isnum(rec) and abs(dr_post-rec)>0.5: det_s.append(f"post_review_confidence_score={dr_post} != pre_mortem.recommended_confidence={rec}")
                    if dr_hc is None: det_s.append("confidence_haircut field missing in decision_record")
                if dr_pv is None: det_s.append("pre_mortem_verdict field missing in decision_record (should be set even when haircut=0)")
                add("S_haircut_propagated",not det_s,"; ".join(det_s) or f"haircut={haircut}; post_review_confidence_score={dr_post}; pre_mortem_verdict={dr_pv!r}")
            except Exception as e:
                add("S_haircut_propagated",False,f"pre_mortem parse error: {e}")
        else:
            add("S_haircut_propagated",True,"no pre_mortem.json — N/A",na=True)
    else:
        add("S_haircut_propagated",True,f"run predates haircut-propagation gate ({ddte}) — N/A",na=True)
    # T forecast_ledger entry quality (forward-looking; landing 2026-06-13 / fix F-FL-1)
    #   The calibration loop (Phase 3 review + Phase 4 Brier score) depends on each forecast
    #   being resolvable. A forecast missing confirmation_trigger / falsification_trigger /
    #   time_window can never be confirmed or falsified — it stays "open" forever and
    #   contributes nothing to the Brier score. Implements DECISION_LEDGER §6 / CLAUDE.md §19.
    #   An empty forecast_ledger ([]) is allowed — §19 permits omitting forecasts when evidence is thin.
    FL_DATE="2026-06-13"
    if isdate(ddte) and ddte>=FL_DATE:
        fl=d.get("forecast_ledger") or []
        fdet=[]
        for i,entry in enumerate(fl):
            if not isinstance(entry,dict):
                fdet.append(f"forecast_ledger[{i}] is not an object"); continue
            for req in ["prediction","confirmation_trigger","falsification_trigger","time_window"]:
                if not str(entry.get(req) or "").strip():
                    fdet.append(f"forecast_ledger[{i}] missing or empty: {req}")
            st=str(entry.get("status") or "open").lower()
            if st not in {"open","confirmed","falsified","expired"}:
                fdet.append(f"forecast_ledger[{i}].status={entry.get('status')!r} not in allowed enum")
            if isdate(ddte) and ddte>=PROB_DATE:
                perr=eval_t_probability(entry)
                if perr: fdet.append(f"forecast_ledger[{i}] {perr}")
            if isdate(ddte) and ddte>=FTYPE_DATE:
                fterr=eval_forecast_type(entry)
                if fterr: fdet.append(f"forecast_ledger[{i}] {fterr}")
        add("T_forecast_ledger_quality",not fdet,
            "; ".join(fdet) or
            (f"all {len(fl)} forecast_ledger entries have required fields + valid status + valid probability" if fl
             else "forecast_ledger is [] — no forecasts (allowed per §19)"))
    else:
        add("T_forecast_ledger_quality",True,f"run predates forecast-ledger quality gate ({ddte}) — N/A",na=True)
    # U post-mortem rating-cap consistency (forward-looking; landing 2026-06-12 / fix F28b)
    #   If the finish-gate's pre-mortem returned a terminal verdict ("Thesis broken" or "Does not
    #   survive — downgrade") on a Selected/Short run, the propagation step must have written
    #   post_mortem_decision + post_mortem_basket, and post_mortem_basket must NOT be "Selected"
    #   or "Short" — those verdicts mean the thesis does not hold as a conviction position. Eval
    #   check S ensures the haircut is propagated; this check ensures the RATING CAP is also
    #   propagated, closing the logical-contradiction gap where "Strong Buy" coexists with "Thesis
    #   broken". Shares the same landing date as S (both from the finish-gate haircut pass).
    if isdate(ddte) and ddte>=HAIRCUT_DATE:
        pv=d.get("pre_mortem_verdict") or ""
        pmd=d.get("post_mortem_decision")
        pmb=d.get("post_mortem_basket")
        TERMINAL_V={"Thesis broken","Does not survive — downgrade"}
        det_t=[]
        if pv in TERMINAL_V:
            if pmd is None:
                det_t.append(f"pre_mortem_verdict={pv!r} but post_mortem_decision absent — finish-gate must propagate the rating cap (fix F28b)")
            elif pmb in ("Selected","Short"):
                det_t.append(f"pre_mortem_verdict={pv!r} but post_mortem_basket={pmb!r} — a terminal verdict should cap to Watchlist or lower, not a conviction position")
        # type-check when present (catches a finish-gate bug that writes the wrong type)
        if pmd is not None and not isinstance(pmd,str): det_t.append(f"post_mortem_decision wrong type ({type(pmd).__name__})")
        if pmb is not None and not isinstance(pmb,str): det_t.append(f"post_mortem_basket wrong type ({type(pmb).__name__})")
        add("U_postMortem_cap",not det_t,
            "; ".join(det_t) or f"pre_mortem_verdict={pv!r}; post_mortem_decision={pmd!r}; post_mortem_basket={pmb!r}")
    else:
        add("U_postMortem_cap",True,f"run predates post-mortem cap gate ({ddte}) — N/A",na=True)
    # V edge gate [CLAUDE.md §7 mechanical] — the edge_score cap on confidence. Forward-looking (landing
    #   2026-06-15); older fixtures (BG/HCG/TMCV, pre-feature) N/A. edge_score/edge_proof are additive
    #   (type-checked in B). (1) edge_score, when present, is 0-100; (2) a claimed real edge (edge_score >= 50)
    #   needs a non-empty edge_proof (the falsifiable §7 item-4 test); (3) confidence_score > 60 requires a
    #   proven edge (edge_score >= 50 on a non-empty edge_proof) — restated consensus is not an edge.
    EDGE_DATE="2026-06-15"
    if isdate(ddte) and ddte>=EDGE_DATE:
        es=d.get("edge_score"); ep=(d.get("edge_proof") or "").strip(); cf=d.get("confidence_score"); det_v=[]
        if es is not None and not (isnum(es) and 0<=es<=100): det_v.append(f"edge_score={es!r} not a 0-100 number")
        if isnum(es) and es>=50 and not ep: det_v.append(f"edge_score={es} >=50 but edge_proof empty — a proven edge needs a falsifiable test")
        if isnum(cf) and cf>60 and not (isnum(es) and es>=50 and ep): det_v.append(f"confidence_score={cf} >60 but edge not proven (edge_score={es!r}, edge_proof {'set' if ep else 'empty'}) — §7 edge gate")
        add("V_edge_gate", not det_v, "; ".join(det_v) or f"edge_score={es!r}; edge_proof={'set' if ep else 'empty'}; confidence={cf}")
    else:
        add("V_edge_gate", True, f"run predates the §7 edge gate ({ddte}) — N/A", na=True)
    # X conviction-run evidence integrity (forward-looking; landing 2026-06-19)
    #   Check G fails on verdict=="Failed" (fabricated numbers driving the rating).
    #   Check O ensures conviction runs (Selected/Short, dated>=2026-06-08) CARRY a report.
    #   Gap: the verify-evidence report may say "Material issues" — explicitly warning the rating
    #   is provisional until blocking_findings are resolved — yet no gate enforced that warning.
    #   A Strong Buy committed while the evidence audit is unresolved is a false-confidence defect.
    #   This check closes the trilogy: G (not-fabricated) + O (exists) + X (acceptable verdict).
    if isdate(ddte) and ddte>=VERIFY_FLOOR_DATE and DECISIONS.get(dec) in ("Selected","Short"):
        vp=_latest("verification_report.json")
        if vp:
            try:
                vr=json.load(open(vp)); vverdict=(vr.get("verdict") or "").strip()
                if eval_x_verify_floor(dec, ddte, vverdict)=="fail":
                    add("X_verify_floor", False, f"verdict={vverdict!r} — conviction run requires 'Clean' or 'Minor issues'; resolve blocking_findings in {os.path.basename(vp)} before committing the thesis")
                else:
                    add("X_verify_floor", True, f"verdict={vverdict!r} — evidence integrity gate cleared for conviction run")
            except Exception as e:
                add("X_verify_floor", False, f"parse error: {e}")
        else:
            add("X_verify_floor", True, "no verification_report.json — N/A (existence gated by check O for runs dated>=2026-06-08)", na=True)
    else:
        add("X_verify_floor", True, f"N/A (not a post-{VERIFY_FLOOR_DATE} conviction run)", na=True)
    # W sector ↔ valuation-method consistency (forward-looking; landing SECTOR_DATE / SECTOR_OVERLAYS.md).
    #   When business_type AND primary_valuation_method are both set, verify the method is not one
    #   SECTOR_OVERLAYS.md forbids for that sector type (logic + forbidden list live in SECTOR_FORBIDDEN /
    #   eval_w_sector_valuation, hoisted module-level so `eval.py selftest` covers it). N/A when either
    #   field is absent (pre-gate runs or business identity missing).
    if isdate(ddte) and ddte>=SECTOR_DATE:
        bt=(d.get("business_type") or "").strip(); pvm=(d.get("primary_valuation_method") or "").strip()
        hits=eval_w_sector_valuation(bt,pvm)
        if hits is None:
            add("W_sector_valuation",True,"business_type or primary_valuation_method not set — N/A",na=True)
        else:
            det_w=[f"business_type={bt!r}: forbidden method token {fm!r} present in primary_valuation_method={pvm!r} (SECTOR_OVERLAYS.md)" for fm in hits]
            add("W_sector_valuation",not hits,
                "; ".join(det_w) or f"business_type={bt!r}; primary_valuation_method={pvm!r} — no forbidden method detected")
    else:
        add("W_sector_valuation",True,f"run predates the sector-valuation gate ({ddte}) — N/A",na=True)
    # Y §11 data-sufficiency ↔ decision cap — always-apply (CLAUDE.md §11, no landing date). Logic +
    # thresholds live in eval_y_data_sufficiency / the constants above (hoisted module-level so
    # `eval.py selftest` covers them). The committed fixtures (score 68-69, Watchlist/Avoid) pass trivially.
    ds=d.get("data_sufficiency_score")
    ystatus=eval_y_data_sufficiency(dec, ds)
    if ystatus=="na":
        add("Y_data_sufficiency_cap",True,f"data_sufficiency_score absent or non-numeric ({ds!r}); decision={dec!r} not a conviction rating — N/A",na=True)
    elif ystatus=="pass":
        add("Y_data_sufficiency_cap",True,f"data_sufficiency_score={ds}; decision={dec!r} — §11 thresholds satisfied")
    elif not isnum(ds):
        add("Y_data_sufficiency_cap",False,f"data_sufficiency_score absent/non-numeric ({ds!r}) but decision={dec!r} is a conviction rating — §11 requires a /100 sufficiency score (DECISION_LEDGER.md required field) to support conviction")
    elif ds<INSUF_THRESHOLD:
        add("Y_data_sufficiency_cap",False,f"data_sufficiency_score={ds} < {INSUF_THRESHOLD} (§11 insufficient) but decision={dec!r} — must be {INSUF_DECISION!r} (§18)")
    else:
        add("Y_data_sufficiency_cap",False,f"data_sufficiency_score={ds} in [{INSUF_THRESHOLD},{DATASUF_CONVICTION_FLOOR}) (§11 weak) but decision={dec!r} — max rating Watchlist; a conviction rating requires data_sufficiency_score >= {DATASUF_CONVICTION_FLOOR} (§11)")
    # Z §14 thesis_type enum + external-variable conviction cap (forward-looking; landing THESIS_Z_DATE).
    #   Two gates: (1) every thesis_type value must come from the CLAUDE.md §14 closed set (case-exact);
    #   (2) when ANY value is external-variable-dominant (EXTERNAL_TYPES) and no edge is proven
    #   (edge_score < 50 or absent), the decision must be ≤ 'Starter Position Only' per the synthesizer's
    #   Rating Cap Rules. Without gate (1) the thesis_type array is unconstrained, silently breaking
    #   Phase 4 Brier-score calibration by thesis type (TMCV shows the defect: 'sector-cycle' vs
    #   'Sector-cycle'). Without gate (2) a conviction Buy on an unproven macro/commodity/policy bet
    #   ships unchecked. Logic + constants live in eval_z_thesis_type_cap / the block above.
    if isdate(ddte) and ddte>=THESIS_Z_DATE:
        tt=d.get("thesis_type"); es=d.get("edge_score")
        zresult=eval_z_thesis_type_cap(tt, dec, es)
        if zresult=="na":
            add("Z_thesis_type_cap",True,f"thesis_type={tt!r} — not a list → N/A (schema check B validates the type)",na=True)
        elif zresult=="fail":
            unknown=[t for t in (tt or []) if not isinstance(t,str) or t not in THESIS_TYPE_ENUM] if isinstance(tt,list) else []
            has_ext=any(isinstance(t,str) and t in EXTERNAL_TYPES for t in (tt or [])) if isinstance(tt,list) else False
            proven_e=isnum(es) and es>=50
            if isinstance(tt,list) and not tt:
                add("Z_thesis_type_cap",False,
                    "thesis_type is empty — CLAUDE.md §14 requires every thesis to classify itself as one "
                    "of the closed-set types (e.g. 'Insufficient data' when it cannot rate); see DECISION_LEDGER.md §5")
            elif unknown:
                add("Z_thesis_type_cap",False,
                    f"thesis_type contains value(s) not in the CLAUDE.md §14 closed enum: {unknown} — "
                    f"use exact canonical strings (case-sensitive); see DECISION_LEDGER.md §5")
            else:
                add("Z_thesis_type_cap",False,
                    f"thesis_type={tt} includes external-variable-dominant type(s) but no proven edge "
                    f"(edge_score={es!r} < 50) and decision={dec!r} exceeds 'Starter Position Only' cap "
                    f"(synthesizer.md Rating Cap Rules: max Starter Position Only for macro/commodity/"
                    f"policy thesis without proven edge)")
        else:
            has_ext=any(t in EXTERNAL_TYPES for t in (tt or [])) if isinstance(tt,list) else False
            proven_e=isnum(es) and es>=50
            add("Z_thesis_type_cap",True,
                f"thesis_type={tt}; all values in CLAUDE.md §14 enum; "
                f"has_external={has_ext}; proven_edge={'yes ('+str(es)+')' if proven_e else 'no ('+str(es)+')'}; "
                f"decision={dec!r} — within §14 constraints")
    else:
        add("Z_thesis_type_cap",True,f"run predates thesis-type gate ({ddte}) — N/A",na=True)
    # AA §18 module verdict-lock caps (forward-looking; landing AA_DATE)
    #   CLAUDE.md §18 states two hard caps: "Distress risk" BSS verdict caps headline at Watchlist or lower;
    #   "Serious governance concerns" MG verdict caps headline at Watchlist or lower (§18 exception: BSS cap
    #   does not apply when thesis_type includes "Balance-sheet survival"). These caps live only in the
    #   synthesizer's PROMPT — this check closes the gap by reading the committed module synthesis files
    #   and FAILing when a capping verdict coexists with a conviction decision that §18 forbids.
    if isdate(ddte) and ddte>=AA_DATE:
        def _read_synthesis_verdict(mod_dir):
            ss=glob.glob(os.path.join(run,mod_dir,"99_*-synthesis.md"))
            if not ss: return None
            try: txt=open(ss[0],encoding="utf-8").read()
            except: return None
            return extract_synthesis_verdict(txt)
        bss_v=_read_synthesis_verdict("balance-sheet-survival")
        mg_v =_read_synthesis_verdict("management-governance")
        aaresult=eval_aa_module_verdict_lock(dec,ddte,bss_v,mg_v,d.get("thesis_type"))
        if aaresult is None:
            add("AA_module_verdict_lock",True,
                f"BSS verdict={bss_v!r}; MG verdict={mg_v!r}; neither module ran — N/A",na=True)
        elif not aaresult:
            add("AA_module_verdict_lock",True,
                f"BSS verdict={bss_v!r}; MG verdict={mg_v!r}; decision={dec!r} — §18 caps satisfied")
        else:
            add("AA_module_verdict_lock",False,"; ".join(aaresult))
    else:
        add("AA_module_verdict_lock",True,f"run predates §18 module-verdict-lock gate ({ddte}) — N/A",na=True)
    # AB §13 BM disqualifier verdict-lock (forward-looking; landing AB_DATE)
    #   Completes the module verdict-lock trilogy: AA covers BSS ("Distress risk") and MG
    #   ("Serious governance concerns"); AB covers BM ("Low-quality business" from the
    #   disqualifier-scan). When the business-model synthesis verdict contains "Low-quality
    #   business" the disqualifier-scan has fired, and CLAUDE.md §13 requires this cap the
    #   headline conviction rating. Unlike the BSS cap (which the distressed-play thesis_type
    #   can bypass), this cap has no exception — a disqualified company cannot receive conviction
    #   in any direction; the analysis base is unreliable and deeper work must come first.
    #   Since AB_DATE > AA_DATE, any run where ddte >= AB_DATE has already entered the AA block
    #   above, so _read_synthesis_verdict() is defined and accessible here.
    if isdate(ddte) and ddte>=AB_DATE:
        bm_v=_read_synthesis_verdict("business-model")
        abresult=eval_ab_bm_verdict_lock(dec,ddte,bm_v)
        if abresult is None:
            add("AB_bm_disqualifier_lock",True,
                f"BM verdict={bm_v!r}; BM module absent — N/A",na=True)
        elif not abresult:
            add("AB_bm_disqualifier_lock",True,
                f"BM verdict={bm_v!r}; decision={dec!r} — BM disqualifier cap satisfied")
        else:
            add("AB_bm_disqualifier_lock",False,"; ".join(abresult))
    else:
        add("AB_bm_disqualifier_lock",True,f"run predates BM disqualifier gate ({ddte}) — N/A",na=True)
    # AC §24 Filter 2 turnaround conviction cap (forward-looking; landing AC_DATE)
    #   CLAUDE.md §24 Filter 2 states the base rate of turnaround success is low and that a
    #   turnaround thesis without ≥2–3 yrs delivered improvement carries a conviction cap and
    #   must be classified honestly as a "Governance turnaround" thesis. The synthesizer's
    #   Rating Cap Rules document this: "turnaround without ≥2–3 yrs delivered inflection →
    #   no better than 'Starter Position Only'". This check closes the mechanical enforcement
    #   gap: when decision_record.json declares thesis_type includes "Governance turnaround"
    #   and the decision is "Buy" or "Strong Buy", that is a doctrine violation. Short Candidate
    #   is intentionally excluded (shorting a failing turnaround is a valid high-conviction
    #   thesis). No edge-score bypass: if delivered improvement was proven, the thesis would
    #   reclassify away from "Governance turnaround", so the type is self-declaring the cap.
    if isdate(ddte) and ddte>=AC_DATE:
        tt=d.get("thesis_type")
        acresult=eval_ac_turnaround_cap(dec,ddte,tt)
        if acresult=="na":
            add("AC_turnaround_cap",True,f"thesis_type={tt!r} — not a list or no '{TURNAROUND_TYPE}' → N/A",na=True)
        elif acresult=="pass":
            add("AC_turnaround_cap",True,
                f"thesis_type={tt!r}; decision={dec!r} — §24 Filter 2 turnaround cap satisfied")
        else:
            add("AC_turnaround_cap",False,
                f"thesis_type={tt!r} includes '{TURNAROUND_TYPE}' but decision={dec!r} exceeds the cap "
                f"(synthesizer.md Rating Cap Rules: max 'Starter Position Only' for turnaround thesis "
                f"without ≥2–3 yrs delivered inflection; CLAUDE.md §24 Filter 2)")
    else:
        add("AC_turnaround_cap",True,f"run predates turnaround-cap gate ({ddte}) — N/A",na=True)
    # AD §24 Filters 4 (RF-CAP-004 serial acquirer) + 6 (RF-OWN-004 unaligned owner) conviction cap
    #   (forward-looking; landing AD_DATE)
    #   Closes the final gap in the §24 mechanical enforcement family (AA BSS+MG / AB BM / AC §24-F2).
    #   CLAUDE.md §24 Filter 4: serial-acquirer pattern is "close to a disqualifier," caps capital-
    #   allocation score and conviction. Filter 6: a structurally unaligned controller makes
    #   persistent cheapness a value trap, not a margin of safety — caps valuation attractiveness.
    #   synthesizer.md Rating Cap Rules: both tags → "maximum 'Watchlist'." Detection: the
    #   standardised RF-CAP-004 / RF-OWN-004 tags in module syntheses indicate cap-level flags
    #   (agents embed them per MODULE_RULES.md; a conviction decision alongside a fired tag is
    #   a doctrine violation). No bypass clause: these caps fire regardless of thesis type.
    if isdate(ddte) and ddte>=AD_DATE:
        def _read_synth_text(mod_dir):
            ss=glob.glob(os.path.join(run,mod_dir,"99_*-synthesis.md"))
            if not ss: return None
            try: return open(ss[0],encoding="utf-8").read()
            except: return None
        bm_txt_ad=_read_synth_text("business-model")
        mg_txt_ad=_read_synth_text("management-governance")
        adresult=eval_ad_filter_4_6_cap(dec,ddte,bm_txt_ad,mg_txt_ad)
        if adresult is None:
            f4_absent=(bm_txt_ad is None); f6_absent=(mg_txt_ad is None)
            if f4_absent and f6_absent:
                add("AD_filter_4_6_cap",True,"both BM and MG modules absent — N/A",na=True)
            else:
                add("AD_filter_4_6_cap",True,
                    f"run predates §24 Filter 4+6 gate ({ddte}) — N/A",na=True)
        elif adresult:
            add("AD_filter_4_6_cap",False,"; ".join(adresult))
        else:
            f4=_tag_fired_standalone(bm_txt_ad,CAP4_TAG) or _tag_fired_standalone(mg_txt_ad,CAP4_TAG)
            f6=_tag_fired_standalone(mg_txt_ad,CAP6_TAG)
            add("AD_filter_4_6_cap",True,
                f"RF-CAP-004 (BM/MG)={'fired' if f4 else 'not fired'}; "
                f"MG RF-OWN-004={'fired' if f6 else 'not fired'}; "
                f"decision={dec!r} — §24 Filter 4+6 caps satisfied")
    else:
        add("AD_filter_4_6_cap",True,f"run predates §24 Filter 4+6 gate ({ddte}) — N/A",na=True)
    # AE §24 Filter 5 fast-changing-industry conviction cap (forward-looking; landing AE_DATE)
    #   Closes the last gap in the §24 mechanical enforcement family (AA covers BSS+MG; AB covers
    #   BM disqualifier; AC covers Filter 2 turnaround; AD covers Filters 4+6 serial-acquirer +
    #   unaligned-owner). CLAUDE.md §24 Filter 5: "High rate-of-change / disruption risk lowers
    #   the business-quality score and caps conviction, and such a thesis is flagged as a sector /
    #   technology-cycle bet rather than a durable compounder." The synthesizer's Rating Cap Rules
    #   document this but, unlike AC/AD, no eval check previously enforced it mechanically.
    #   Detection: the business-quality agent emits RF-BQ-005 as a standalone line when the industry
    #   rate-of-change / disruption row scores ≤40; the BM synthesis propagates it. The cap fires when
    #   RF-BQ-005 appears as a FIRED standalone tag line (not a cleared/cap-table mention) in EITHER the
    #   BM synthesis OR the business-quality specialist (the source emitter — scanning the roll-up alone
    #   lets a missed propagation silently bypass the cap; CLAUDE.md §11) AND the decision is "Strong
    #   Buy" or "Buy", unless a proven durable-winner edge (edge_score ≥ 50) exists. "Starter Position
    #   Only" and below are allowed — the cap ceiling, not above it. "Short Candidate" is not capped here
    #   (shorting a fast-changing-industry loser is a valid distinct thesis). No bypass clause other than
    #   the edge_score ≥ 50 exception. (Both detection refinements per Codex review on PR #120.)
    if isdate(ddte) and ddte>=AE_DATE:
        # _read_synth_text is defined in the AD block above; AE_DATE > AD_DATE so it is always
        # available here (any run reaching AE also entered the AD gate first).
        def _read_specialist_text(mod_dir, prefix):
            ss=glob.glob(os.path.join(run,mod_dir,prefix+"*.md"))
            if not ss: return None
            try: return open(ss[0],encoding="utf-8").read()
            except: return None
        bm_txt_ae=_read_synth_text("business-model")
        bq_txt_ae=_read_specialist_text("business-model","07_")  # RF-BQ-005 source emitter
        edge_score_ae=d.get("edge_score")
        aeresult=eval_ae_filter5_cap(dec,ddte,bm_txt_ae,edge_score_ae,bq_txt_ae)
        if aeresult is None:
            add("AE_filter5_cap",True,"BM synthesis and business-quality specialist absent — N/A",na=True)
        elif aeresult:
            add("AE_filter5_cap",False,"; ".join(aeresult))
        else:
            cap5_fired=_tag_fired_standalone(bm_txt_ae,CAP5_TAG) or _tag_fired_standalone(bq_txt_ae,CAP5_TAG)
            proven=isnum(edge_score_ae) and edge_score_ae>=50
            add("AE_filter5_cap",True,
                f"RF-BQ-005 (BM synth/07 source)={'fired' if cap5_fired else 'not fired'}; "
                f"edge_score={edge_score_ae!r} ({'proven' if proven else 'not proven or absent'}); "
                f"decision={dec!r} — §24 Filter 5 cap satisfied")
    else:
        add("AE_filter5_cap",True,f"run predates §24 Filter 5 gate ({ddte}) — N/A",na=True)
    # AF §24 Filter 1 crooks/integrity conviction cap (forward-looking; landing AF_DATE)
    #   Closes the last remaining gap in the §24 mechanical enforcement family (AA/AB cover Filter 1's
    #   hard-fraud endpoint via the BSS/MG/BM verdict locks; AC/AD/AE cover Filters 2/4/5/6). This adds
    #   the unresolved-"buzz" endpoint CLAUDE.md §24 explicitly says must not be discarded.
    #   Detection: 01_management-and-track-record emits RF-MGT-005 as a standalone line when a routed,
    #   unresolved integrity signal is present and not cleared; the MG synthesis propagates it. The cap
    #   fires when RF-MGT-005 appears as a FIRED standalone tag line in EITHER the MG synthesis OR the
    #   01_management-and-track-record specialist (the source emitter) AND the decision is "Strong Buy",
    #   "Buy", or "Starter Position Only" — the ceiling is "Watchlist". No edge-score bypass (a proven
    #   business edge does not cure an unresolved integrity concern). "Short Candidate" is not capped
    #   here (a forensic short on unproven integrity concerns is a valid distinct thesis).
    if isdate(ddte) and ddte>=AF_DATE:
        # _read_synth_text is defined in the AD block above and _read_specialist_text in the AE block
        # above; AF_DATE > AE_DATE > AD_DATE so both are always available here (any run reaching AF
        # also entered the AD and AE gates first).
        mg_txt_af=_read_synth_text("management-governance")
        track_txt_af=_read_specialist_text("management-governance","01_")  # RF-MGT-005 source emitter
        afresult=eval_af_filter1_integrity_cap(dec,ddte,mg_txt_af,track_txt_af)
        if afresult is None:
            add("AF_filter1_integrity_cap",True,
                "MG synthesis and management-and-track-record specialist absent — N/A",na=True)
        elif afresult:
            add("AF_filter1_integrity_cap",False,"; ".join(afresult))
        else:
            cap1_fired=_tag_fired_standalone(mg_txt_af,CAP1_TAG) or _tag_fired_standalone(track_txt_af,CAP1_TAG)
            add("AF_filter1_integrity_cap",True,
                f"RF-MGT-005 (MG synth/01 source)={'fired' if cap1_fired else 'not fired'}; "
                f"decision={dec!r} — §24 Filter 1 cap satisfied")
    else:
        add("AF_filter1_integrity_cap",True,f"run predates §24 Filter 1 gate ({ddte}) — N/A",na=True)
    # AG Phase 6 calibration-feedback gate (forward-looking; landing AG_DATE) — DECISION_LEDGER.md §18.
    #   Closes the loop Phase 4 (/research:calibrate) opened but nothing consumed: verifies the
    #   synthesizer's decision_record.json carries a calibration_feedback object whose status is
    #   consistent with whatever calibration_summary.json existed as of this run's decision_date, so
    #   the gate cannot be silently dropped once real calibration data exists.
    if isdate(ddte) and ddte>=AG_DATE:
        calib_asof_ag=_calib_summary_asof(ddte)
        agresult=eval_ag_calibration_feedback_gate(ddte,calib_asof_ag,d.get("calibration_feedback"))
        if agresult:
            add("AG_calibration_feedback_gate",False,"; ".join(agresult))
        else:
            add("AG_calibration_feedback_gate",True,
                f"calibration_feedback.status={(d.get('calibration_feedback') or {}).get('status')!r} "
                f"consistent with as-of calibration_summary (verdict={(calib_asof_ag or {}).get('verdict')!r})")
    else:
        add("AG_calibration_feedback_gate",True,f"run predates Phase 6 calibration-feedback gate ({ddte}) — N/A",na=True)
    # AH expectations-gap ship-time audit (forward-looking; landing AH_DATE) — CLAUDE.md §7. Independently
    #   verifies /research:full's 10B.3 actually ran the third audit-trio member (verify-evidence,
    #   pre-mortem, expectations-gap) for a conviction-confidence run and that it did not surface a
    #   confidence/edge contradiction — mirrors the G/O/X trilogy already built for verify-evidence.
    egp_ah=_latest("expectations_gap.json"); eg_ah=None
    if egp_ah:
        try: eg_ah=json.load(open(egp_ah))
        except Exception: eg_ah=None
    ahresult=eval_ah_expectations_gap_gate(ddte,d.get("confidence_score"),eg_ah)
    if ahresult is None:
        add("AH_expectations_gap_gate",True,
            f"run predates the gate or confidence_score={d.get('confidence_score')!r} not above the §7 conviction floor ({ddte}) — N/A",na=True)
    elif ahresult:
        add("AH_expectations_gap_gate",False,"; ".join(ahresult))
    else:
        add("AH_expectations_gap_gate",True,
            f"expectations_gap.json present (variant_perception_quality={(eg_ah or {}).get('variant_perception_quality')!r}, "
            f"is_exploitable={(eg_ah or {}).get('is_exploitable')!r}) consistent with confidence_score={d.get('confidence_score')!r}")
    # AI Headline Scorecard <-> decision_record.json reconciliation (forward-looking; landing AI_DATE) —
    #   synthesizer.md §2/Step 4. The Part I Headline Scorecard is what most readers actually see; nothing
    #   before this mechanically verified its Expected return / Downside risk / Risk/reward / Confidence
    #   / Data sufficiency cells still equal the same computed decision_record.json fields.
    airesult=eval_ai_headline_reconciliation(ddte,d,thesis)
    if airesult is None:
        add("AI_headline_scorecard_reconciliation",True,f"run predates the gate ({ddte}) — N/A",na=True)
    elif airesult:
        add("AI_headline_scorecard_reconciliation",False,"; ".join(airesult))
    else:
        add("AI_headline_scorecard_reconciliation",True,
            "Headline Scorecard cells reconcile with expected_return_pct/downside_risk_pct/risk_reward/"
            "confidence_score/data_sufficiency_score")
    # AJ Decision Audit Trail structural check (forward-looking; landing AJ_DATE) — CLAUDE.md §8/§22. The
    #   Part II Decision Audit Trail is the auditable adjudication core of the verdict; until now nothing
    #   mechanically verified a run actually ships it populated with real cross-module bull/bear rows
    #   instead of an empty or token table (the gap check AI's own landing PR named as next).
    ajresult=eval_aj_decision_audit_trail(ddte,thesis)
    if ajresult is None:
        add("AJ_decision_audit_trail",True,f"run predates the gate ({ddte}) — N/A",na=True)
    elif ajresult:
        add("AJ_decision_audit_trail",False,"; ".join(ajresult))
    else:
        add("AJ_decision_audit_trail",True,
            f"Decision Audit Trail table present with {len(_decision_audit_rows(_decision_audit_section(thesis)))} populated rows")
    # AK red-flag severity reconciliation (forward-looking; landing AK_DATE) — CLAUDE.md §13/§18. A
    #   module can declare a Critical red flag (management-governance's `critical_red_flag_count` field;
    #   earnings-red-flags' "N critical" prose/table) with nothing before this verifying that severity
    #   actually reaches decision_record.json's red_flags array, or that the Headline Scorecard's
    #   Rating-cap cell doesn't deny it — the gap check AI's landing PR (#199) named as next.
    module_texts_ak={}
    for sp in glob.glob(os.path.join(run,"*","99_*-synthesis.md")):
        mod=os.path.basename(os.path.dirname(sp))
        try: module_texts_ak[mod]=open(sp).read()
        except Exception: pass
    akresult=eval_ak_red_flag_severity_reconciliation(ddte,d,thesis,module_texts_ak)
    if akresult is None:
        add("AK_red_flag_severity_reconciliation",True,f"run predates the gate ({ddte}) — N/A",na=True)
    elif akresult:
        add("AK_red_flag_severity_reconciliation",False,"; ".join(akresult))
    else:
        add("AK_red_flag_severity_reconciliation",True,
            "module-declared Critical red-flag counts reconcile with decision_record.json red_flags "
            "and the Headline Scorecard Rating-cap cell does not deny one")
    # AN supersession-integrity (§4a): validate any append-only corrections.json's superseded_by chain.
    # Schema-gated (only a corrections/v1 sidecar counts) so AN honors exactly what the resolver honors.
    _corr=_an_valid_sidecar(run)
    _anresult=eval_an_supersession_integrity(_corr)
    if _anresult is None:
        add("AN_supersession_integrity",True,"no supersession sidecar — N/A",na=True)
    elif _anresult:
        add("AN_supersession_integrity",False,"; ".join(_anresult))
    else:
        add("AN_supersession_integrity",True,f"superseded_by → {(_corr.get('superseded_by') or {}).get('run_root')} (exists, has a decision record)")
    # AM bear-case sanity (§8/§16): a Selected/conviction long must have a bear price target below entry.
    _amresult=eval_am_bear_case_sanity(ddte,d.get("decision"),d.get("scenarios"),d.get("entry_price"))
    if _amresult is None:
        add("AM_bear_case_sanity",True,"not a post-gate Selected long with a usable bear price target — N/A",na=True)
    elif _amresult:
        add("AM_bear_case_sanity",False,"; ".join(_amresult))
    else:
        add("AM_bear_case_sanity",True,"bear-case price target is below entry_price — a genuine downside branch")
    # AO forecast-resolvability (§19 / DECISION_LEDGER §6): every forecast must be mechanically scorable
    # (pinned numeric bar or named settleable document, partitioned triggers) and the record must carry a
    # near-term (≤90-day) proof point — so the calibration loop can actually resolve it.
    _aoresult=eval_ao_forecast_resolvability(ddte,d.get("forecast_ledger"))
    if _aoresult is None:
        add("AO_forecast_resolvability",True,"run predates resolvability gate, or forecast_ledger is [] — N/A",na=True)
    elif _aoresult:
        add("AO_forecast_resolvability",False,"; ".join(_aoresult))
    else:
        add("AO_forecast_resolvability",True,"every forecast carries a pinned/settleable, partitioned trigger and the record has a ≤90-day proof point")
    # Retrospective advisories (informational only — NEVER read by run_pass/gate_eligible/suite_pass below).
    # AI and AK reconcile fields that existed long before either check's own landing date (Headline
    # Scorecard prose vs decision_record.json numbers; module-declared red-flag severity vs the red_flags
    # array) — they are not gated on a NEW schema field that pre-gate runs structurally lack, unlike most
    # of the other forward-looking checks in this file. Date-gating them was still the right call for
    # `checks`/suite_pass ("golden fixtures predate -> N/A -> suite green" — see every other *_DATE
    # comment above), but it has the side effect of making a check permanently blind to the exact pre-gate
    # run that motivated writing it: AK's own landing comment says "The committed AMZN_2026-07-10 run
    # already exhibits this exact defect", yet AMZN_2026-07-10 predates AK_DATE by one day, so check AK can
    # never actually see it. This block re-runs the SAME two pure functions with the landing date
    # substituted for the run's real decision_date — bypassing only the date gate, not the reconciliation
    # logic itself — strictly when the primary check above was N/A for being pre-gate, and records any
    # finding as a clearly-labeled advisory. Scope is deliberately narrow (AI, AK only): the two checks
    # with a CONFIRMED, still-live defect on `main` (AMZN's Critical->High red-flag downgrade; TMCV's
    # expected-return sign flip) — not a blanket un-gating of every forward-looking check.
    retro=[]
    if airesult is None:
        r=eval_ai_headline_reconciliation(AI_DATE,d,thesis)
        if r:
            retro.append({"check":"AI_headline_scorecard_reconciliation","status":"FAIL","detail":"; ".join(r),
                          "note":f"retrospective — decision_date {ddte!r} predates AI_DATE ({AI_DATE}); informational only, does not affect pass/gate_eligible/suite_pass"})
    if akresult is None:
        r=eval_ak_red_flag_severity_reconciliation(AK_DATE,d,thesis,module_texts_ak)
        if r:
            retro.append({"check":"AK_red_flag_severity_reconciliation","status":"FAIL","detail":"; ".join(r),
                          "note":f"retrospective — decision_date {ddte!r} predates AK_DATE ({AK_DATE}); informational only, does not affect pass/gate_eligible/suite_pass"})
    # WARN non-schema files
    # [review fix] suppress only genuine versioned/audit/review artifacts via PRECISE patterns — the old naive
    # `"_v" not in name` / `"review" not in name` substring tests hid real strays (preview.md, *_v*-named scratch).
    def _is_known(n):
        return (n in SCHEMA_FILES
                or re.search(r"_v\d+\.json$",n)                                   # versioned audit reports
                or re.search(r"_(decision_review|memo_delta)(_v\d+)?\.(json|md)$",n)
                or re.search(r"_calibration_summary\.json$",n))
    extras=[os.path.basename(x) for x in glob.glob(os.path.join(run,"*")) if os.path.isfile(x) and not _is_known(os.path.basename(x))]
    run_pass=all(c["status"]!="FAIL" for c in checks)
    # Gate eligibility (fix EVAL-INCOMPLETE): only a bona-fide COMPLETE /research:full run — one carrying
    # RUN_METADATA.md alongside its terminal deliverables — is a valid subject for the full-run structural /
    # integrity / §24-cap contracts, and only such a run may HARD-FAIL the suite (turn CI red). A committed
    # run WITHOUT RUN_METADATA.md is an incomplete artifact set: assembled ad-hoc from standalone module
    # runs, or a partial / interrupted / resumed run that never went through the full finish sequence (which
    # is what writes RUN_METADATA + the verify-evidence / pre-mortem integrity finish-gate). Its check
    # failures are a DATA-completeness gap, not an engine regression, so they are reported as a WARNING and
    # do NOT block code PRs. The golden fixtures all carry RUN_METADATA.md, so a genuine framework / agent /
    # command regression still turns CI red. (Once the chained full-run path also writes RUN_METADATA + runs
    # the finish-gate, every real full run is gate-eligible again — see the engine finish-gate PR.)
    gate_eligible = os.path.exists(rm)
    warn_only = (not run_pass) and (not gate_eligible)
    if not warn_only:
        suite_pass = suite_pass and run_pass
    results[name]={"run_root":run,"ticker":d.get("ticker"),"decision":dec,"pass":run_pass,
                   "gate_eligible":gate_eligible,"warn_only":warn_only,
                   "checks":checks,"warn_nonschema_files":extras,
                   "retrospective_advisories":retro}

# J FRAMEWORK SOURCE CONTRACTS (suite-level, run once; protects §24 wiring + the §17 catalyst module
#   + the N1/C1/C2 net-cash-labelling / cyclical-normalisation wiring, in their CORRECT files —
#   the ROCE rule must stay in the moat, never CLAUDE.md §15, or it misfires for banks/REITs)
FRAMEWORK_CONTRACTS={
 "CLAUDE.md":["## 24. Avoid Big Risks","Crooks and integrity","Turnarounds","High debt and the survival test","Serial acquirers","Fast-changing industries","Unaligned owners","normalised operating FCF","gross-liquidity","Language travels with the jurisdiction","a non-English filing is not a data gap"],
 "frameworks/SECTOR_OVERLAYS.md":["SaaS / subscription software","Bank / lender","cRPO","NIM","FFO","AISC","Generic operating company"],
 ".claude/agents/business-model/02_business-identity.md":["Sector Overlay","SECTOR_OVERLAYS.md","generic read"],
 ".claude/agents/business-model/MODULE_RULES.md":["Rejector-Filter Penalties & Caps","Serial acquirers","Fast-changing industry"],
 ".claude/agents/business-model/07_business-quality.md":["Industry rate-of-change","11 quality factors","at a cyclical peak, anchor them","SECTOR_OVERLAYS.md","sector overlay","No sector overlay","RF-BQ-005"],
 ".claude/agents/business-model/99_business-model-synthesis.md":["RF-BQ-005","Filter 5"],
 ".claude/agents/earnings/03_margin-drivers.md":["SECTOR_OVERLAYS.md","sector overlay","No sector overlay"],
 ".claude/agents/business-model/09_moat.md":["Use a through-cycle return"],
 ".claude/agents/earnings/MODULE_RULES.md":["Cycle-Position Rule"],
 ".claude/agents/earnings/06_earnings-quality.md":["Lead with normalised operating FCF"],
 ".claude/agents/valuation/07_scenario-and-fair-value.md":["true through-cycle trough"],
 ".claude/agents/business-model/08_competitive-map.md":["Profitability / return on capital"],
 ".claude/agents/balance-sheet-survival/06_downside-stress-test.md":["Pending acquisition (pro-forma) check"],
 ".claude/agents/balance-sheet-survival/01_capital-structure-and-leverage.md":["state it with its basis (CLAUDE.md §15)","Net debt (strict, §15)"],
 ".claude/agents/valuation/04_intrinsic-dcf.md":["benchmarked against peer-normal AND the company","Working capital scales with revenue"],
 ".claude/agents/business-model/01_disqualifier-scan.md":["Integrity note","Filter 1"],
 ".claude/agents/business-model/11_capital-allocation-governance.md":["Filter 4","opportunity cost"],
 ".claude/agents/management-governance/MODULE_RULES.md":["RF-CAP-004","RF-OWN-004","RF-MGT-004","RF-MGT-005","§24"],
 ".claude/agents/management-governance/01_management-and-track-record.md":["Turnaround","Filter 2","RF-MGT-005"],
 ".claude/agents/management-governance/99_management-governance-synthesis.md":["RF-MGT-005"],
 ".claude/agents/management-governance/04_ownership-and-insider-behavior.md":["RF-OWN-004","Filter 6"],
 ".claude/agents/balance-sheet-survival/MODULE_RULES.md":["Net cash is a strategic asset","Filter 3","Label the cycle position of the EBITDA","the **strict** basis (CLAUDE.md §15)"],
 ".claude/agents/valuation/MODULE_RULES.md":["RF-OWN-004","Filter 6","value trap","benchmarked against BOTH a peer-normal margin"],
 ".claude/agents/synthesizer.md":["Avoid-Big-Risks","§24","DEFER to the catalyst module","Net-cash / leverage headline disclosure","business_type","primary_valuation_method","forecast_type","RF-MGT-005","calibration_feedback","Calibration feedback check"],
 ".claude/agents/catalyst/MODULE_RULES.md":["§17 Catalyst Discipline","Catalyst Category Checklist","No proven catalyst yet"],
 ".claude/agents/catalyst/01_catalyst-calendar.md":["12-Month Catalyst Calendar","Bullish Trigger","Bearish Trigger"],
 ".claude/agents/catalyst/99_catalyst-synthesis.md":["Catalyst strength /100","No proven catalyst yet","depends_on"],
 ".claude/agents/memo-writer.md":["memo.md","colleague","~10"],
 ".claude/commands/research/full.md":["audit_dossier.md","memo.md","memo-writer","post_mortem_decision","RATING-CAP","TERMINAL","10B.3","GATE-EXPECTATIONS","expectations-gap.md","rating_caps","eval_ad_filter_4_6_cap","eval_ae_filter5_cap","eval_af_filter1_integrity_cap","eval_ac_turnaround_cap","headline_checks","eval_ai_headline_reconciliation","eval_ak_red_flag_severity_reconciliation"],
 "scripts/rating_caps.py":["AC_DATE","AD_DATE","AE_DATE","AF_DATE","eval_ac_turnaround_cap","eval_ad_filter_4_6_cap","eval_ae_filter5_cap","eval_af_filter1_integrity_cap","_tag_fired_standalone","HIGH_CONVICTION_DECISIONS"],
 "scripts/headline_checks.py":["AI_DATE","CONF_SPLIT_DATE","eval_ai_headline_reconciliation","_scorecard_section","_hs_cell","_metric_numbers","_reconciles","AK_DATE","eval_ak_red_flag_severity_reconciliation","_module_critical_count","_AK_CRITICAL_PATTERNS","_AK_DENIAL","_AK_AFFIRM"],
 ".claude/agents/module-memo-writer.md":["_memo.md","module synthesis","condenser"],
 "frameworks/MODULE_PIPELINE.md":["Step 4.9","module-memo-writer","_memo.md","_dossier.md"],
 ".claude/commands/research/rerun.md":["module-memo-writer","_dossier.md","10B.3"],
 ".claude/commands/research/track.md":["analyses/tracking","_calls_tracker","review_schedule","ad-hoc","memo_delta_file"],
 ".claude/settings.json":["SessionStart","review_due.py"],
 ".claude/hooks/review_due.py":["review_schedule","research:review-decisions due"],
 "frameworks/DECISION_LEDGER.md":["Memo delta","memo_delta","thesis_delta_verdict","stage_one_comment","rerun_command","_memo_delta.md","business_type","primary_valuation_method","forecast_type","Calibration Feedback Gate","calibration_feedback","calibration_by_module","error_taxonomy_distribution","pre_mortem_check","audit-of-the-auditor","outcome_vs_verdict","false comfort","excess caution"],
 ".claude/commands/research/review-decisions.md":["memo_delta","stage_one_comment","rerun_command","Pool first","_memo_delta","pre_mortem_check","outcome_vs_verdict","7A. Pre-mortem calibration check"],
 ".claude/commands/research/eval.md":["scripts/eval.py"],
 ".claude/commands/research/calibrate.md":["calibration_by_module","calibration_by_forecast_type","owner_module","forecast_type","Phase 6","error_taxonomy_distribution","pre_mortem_calibration","scripts/calibrate.py","Pre-data","withheld","Clopper-Pearson","Selected − Rejected","commit-run.sh"],
 "scripts/calibrate.py":["load_standing_records","clopper_pearson","murphy_decomposition","e_value_hit_rate","effective_n","months_to_significance","reliability_bands","MIN_RESOLVED_FORECASTS","calibration_by_module","calibration_by_forecast_type","error_taxonomy_distribution","pre_mortem_calibration","outcome_distribution","contradicted_breakdown","false_comfort","excess_caution","Pre-data","honesty_statement","benchmark-adjusted","load_feed","market_feed"],
 "scripts/test_calibrate.py":["clopper_pearson","murphy_decomposition","e_value_hit_rate","Pre-data","hit rate","already_significant"],
 "scripts/market_prices.py":["data/_market","close_on","total_return","beta_adjusted_excess","raw_excess_pct","beta_adjusted_excess_pct","available","as_of","date,symbol,close"],
 "frameworks/MARKET_FEED.md":["date,symbol,close","_symbols.json","beta_adjusted_excess","close_on","EXTERNAL_DATA"],
 "frameworks/EXTERNAL_DATA.md":["data/_market","market_prices.py","beta-adjusted","tracking_price","date,symbol,close"],
 "scripts/eval.py":["T_forecast_ledger_quality","FL_DATE","confirmation_trigger","falsification_trigger","eval_t_probability","PROB_DATE","eval_forecast_type","FORECAST_TYPE_ENUM","FTYPE_DATE","W_sector_valuation","SECTOR_DATE","SECTOR_FORBIDDEN","X_verify_floor","VERIFY_FLOOR_DATE","ACCEPTABLE_VERDICTS","Y_data_sufficiency_cap","INSUF_THRESHOLD","DATASUF_CONVICTION_FLOOR","HIGH_CONVICTION_DECISIONS","eval_z_thesis_type_cap","THESIS_TYPE_ENUM","EXTERNAL_TYPES","THESIS_Z_DATE","AA_module_verdict_lock","AA_DATE","BSS_CAP_VERDICT","MG_CAP_VERDICT","eval_aa_module_verdict_lock","extract_synthesis_verdict","AB_bm_disqualifier_lock","AB_DATE","BM_CAP_VERDICT","eval_ab_bm_verdict_lock","AC_turnaround_cap","AC_DATE","TURNAROUND_TYPE","ABOVE_STARTER_AC","eval_ac_turnaround_cap","eval_ad_filter_4_6_cap","AD_DATE","CAP4_TAG","CAP6_TAG","AD_filter_4_6_cap","eval_ae_filter5_cap","AE_DATE","CAP5_TAG","ABOVE_STARTER_AE","AE_filter5_cap","_tag_fired_standalone","eval_af_filter1_integrity_cap","AF_DATE","CAP1_TAG","ABOVE_WATCHLIST_AF","AF_filter1_integrity_cap","eval_ag_calibration_feedback_gate","AG_DATE","AG_STATUSES","_calib_summary_asof","CALIB_SUMMARIES","eval_ah_expectations_gap_gate","AH_DATE","AH_expectations_gap_gate","eval_ai_headline_reconciliation","AI_DATE","_scorecard_section","_hs_cell","_metric_numbers","_reconciles","eval_aj_decision_audit_trail","AJ_DATE","AJ_MIN_ROWS","AJ_REQUIRED_COLS","_decision_audit_section","_decision_audit_header","_decision_audit_rows","_audit_cell_blank","eval_ak_red_flag_severity_reconciliation","AK_DATE","_module_critical_count","_AK_CRITICAL_PATTERNS","_AK_DENIAL","_AK_AFFIRM","AL_pre_mortem_check","PRE_MORTEM_CHECK_DATE","PM_OUTCOMES","eval_am_bear_case_sanity","AM_DATE","eval_an_supersession_integrity","AO_forecast_resolvability","AO_DATE","eval_ao_forecast_resolvability","_ao_earliest_date"],
 ".github/workflows/ci.yml":["eval-contracts","scripts/eval.py"],
}
jchecks=[]
for jf,subs in FRAMEWORK_CONTRACTS.items():
    try: jtxt=open(jf).read()
    except Exception as e:
        jchecks.append({"file":jf,"status":"FAIL","missing":["unreadable: "+str(e)[:60]]}); suite_pass=False; continue
    jmiss=[s for s in subs if s not in jtxt]
    # [review fix] J is a substring presence test; a file gutted to a few anchor-bearing lines would otherwise pass.
    # A non-blank-line floor catches the degenerate "delete the body, keep the anchors" gut (smallest real contract
    # file is 14 non-blank lines; gutting to one line is the demonstrated exploit). Still a presence test, not a
    # semantic verifier — it cannot prove the wiring is correct, only that the file was not hollowed out.
    nbl=sum(1 for ln in jtxt.splitlines() if ln.strip())
    if nbl<6: jmiss=jmiss+[f"file gutted: only {nbl} non-blank line(s)"]
    if jmiss: suite_pass=False
    jchecks.append({"file":jf,"status":("PASS" if not jmiss else "FAIL"),"missing":jmiss})

out={"schema_version":"1.0","generated_at":today,"scope":scope,"n_runs":len(results),
     "suite_pass":suite_pass,"runs":results,"source_contracts_s24":jchecks}
os.makedirs("analyses/eval",exist_ok=True)
of=f"analyses/eval/{today}_eval_report.json"; k=2
while os.path.exists(of): of=f"analyses/eval/{today}_eval_report_v{k}.json"; k+=1
json.dump(out,open(of,"w"),indent=2,ensure_ascii=False)
print("EVAL", "PASS" if suite_pass else "FAIL", f"({len(results)} runs)")
for nm,r in results.items():
    fails=[c["check"] for c in r["checks"] if c["status"]=="FAIL"]
    status = "WARN" if r.get("warn_only") else ("PASS" if r["pass"] else "FAIL")
    note = " — incomplete run (no RUN_METADATA); not gating CI" if r.get("warn_only") else ""
    print(f"  {nm}: {status} ({r['decision']})", ("fails="+",".join(fails)) if fails else "", ("extras="+",".join(r['warn_nonschema_files'])) if r['warn_nonschema_files'] else "", note)
jfails=[j["file"] for j in jchecks if j["status"]=="FAIL"]
print("  framework source contracts (J: §24 + catalyst + tiers):", "PASS" if not jfails else "FAIL "+";".join(jfails))
for j in jchecks:
    if j["status"]=="FAIL": print(f"     FAIL {j['file']} missing={j['missing']}")
retro_runs={nm:r["retrospective_advisories"] for nm,r in results.items() if r.get("retrospective_advisories")}
if retro_runs:
    n=sum(len(v) for v in retro_runs.values())
    print(f"  RETROSPECTIVE ADVISORIES (informational — does not affect PASS/FAIL above): {n} pre-gate finding(s) in {len(retro_runs)} run(s)")
    for nm,adv in retro_runs.items():
        for a in adv:
            print(f"     ADVISORY {nm}: {a['check']} — {a['detail']}")
print("WROTE", of)
sys.exit(0 if suite_pass else 1)   # [review fix] non-zero exit on FAIL so CI / hooks / automation gating on $? see the regression
