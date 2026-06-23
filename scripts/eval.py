#!/usr/bin/env python3
"""Deterministic eval harness for the equity-research engine.

Checks invariants A-Z, AA, and J (framework-source contracts) against every committed
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
    print(("SELFTEST PASS" if not bad else f"SELFTEST FAIL ({bad} case(s))")+f" — {len(cases)} check-W + {len(xcases)} check-X + {len(ycases)} check-Y + {len(zcases)} check-Z + {len(t2cases)} check-T2 + {len(aacases)} check-AA + {len(evcases)} AA-extractor cases")
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
    _numkeys=["expected_return_pct","downside_risk_pct","risk_reward","confidence_score","data_sufficiency_score","post_review_confidence_score","confidence_haircut"]
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
            # a post-gate run that quantified a return MUST ship the machine-readable scenario block
            add("M_scenario_math", d.get("expected_return_pct") is None,
                "scenarios[] missing/empty but expected_return_pct is set — cannot re-derive the math (required post-2026-06-08)")
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
                # price anchor exists, require ALL-or-NONE price targets; a PARTIAL set FAILs instead of dropping them.
                if isnum(ep) and ep and any(have_t) and not all(have_t):
                    okM=False; det.append("some scenarios carry price_target, some don't — cannot reconcile target/risk-reward")
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
                    if isnum(rr) and (worst>ep if short else ep>worst):
                        crr=((ep-pwt)/(worst-ep)) if short else ((pwt-ep)/(ep-worst))
                        if abs(rr-crr)>max(0.15,abs(crr)*0.12): okM=False; det.append(f"risk_reward={rr} != calc={round(crr,2)}")
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
    suite_pass = suite_pass and run_pass
    results[name]={"run_root":run,"ticker":d.get("ticker"),"decision":dec,"pass":run_pass,
                   "checks":checks,"warn_nonschema_files":extras}

# J FRAMEWORK SOURCE CONTRACTS (suite-level, run once; protects §24 wiring + the §17 catalyst module
#   + the N1/C1/C2 net-cash-labelling / cyclical-normalisation wiring, in their CORRECT files —
#   the ROCE rule must stay in the moat, never CLAUDE.md §15, or it misfires for banks/REITs)
FRAMEWORK_CONTRACTS={
 "CLAUDE.md":["## 24. Avoid Big Risks","Crooks and integrity","Turnarounds","High debt and the survival test","Serial acquirers","Fast-changing industries","Unaligned owners","normalised operating FCF","gross-liquidity"],
 "frameworks/SECTOR_OVERLAYS.md":["SaaS / subscription software","Bank / lender","cRPO","NIM","FFO","AISC","Generic operating company"],
 ".claude/agents/business-model/02_business-identity.md":["Sector Overlay","SECTOR_OVERLAYS.md","generic read"],
 ".claude/agents/business-model/MODULE_RULES.md":["Rejector-Filter Penalties & Caps","Serial acquirers","Fast-changing industry"],
 ".claude/agents/business-model/07_business-quality.md":["Industry rate-of-change","11 quality factors","at a cyclical peak, anchor them"],
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
 ".claude/agents/management-governance/MODULE_RULES.md":["RF-CAP-004","RF-OWN-004","RF-MGT-004","§24"],
 ".claude/agents/management-governance/01_management-and-track-record.md":["Turnaround","Filter 2"],
 ".claude/agents/management-governance/04_ownership-and-insider-behavior.md":["RF-OWN-004","Filter 6"],
 ".claude/agents/balance-sheet-survival/MODULE_RULES.md":["Net cash is a strategic asset","Filter 3","Label the cycle position of the EBITDA","the **strict** basis (CLAUDE.md §15)"],
 ".claude/agents/valuation/MODULE_RULES.md":["RF-OWN-004","Filter 6","value trap","benchmarked against BOTH a peer-normal margin"],
 ".claude/agents/synthesizer.md":["Avoid-Big-Risks","§24","DEFER to the catalyst module","Net-cash / leverage headline disclosure","business_type","primary_valuation_method"],
 ".claude/agents/catalyst/MODULE_RULES.md":["§17 Catalyst Discipline","Catalyst Category Checklist","No proven catalyst yet"],
 ".claude/agents/catalyst/01_catalyst-calendar.md":["12-Month Catalyst Calendar","Bullish Trigger","Bearish Trigger"],
 ".claude/agents/catalyst/99_catalyst-synthesis.md":["Catalyst strength /100","No proven catalyst yet","depends_on"],
 ".claude/agents/memo-writer.md":["memo.md","colleague","~10"],
 ".claude/commands/research/full.md":["audit_dossier.md","memo.md","memo-writer","post_mortem_decision","RATING-CAP","TERMINAL"],
 ".claude/agents/module-memo-writer.md":["_memo.md","module synthesis","condenser"],
 "frameworks/MODULE_PIPELINE.md":["Step 4.9","module-memo-writer","_memo.md","_dossier.md"],
 ".claude/commands/research/rerun.md":["module-memo-writer","_dossier.md"],
 ".claude/commands/research/track.md":["analyses/tracking","_calls_tracker","review_schedule","ad-hoc","memo_delta_file"],
 ".claude/settings.json":["SessionStart","review_due.py"],
 ".claude/hooks/review_due.py":["review_schedule","research:review-decisions due"],
 "frameworks/DECISION_LEDGER.md":["Memo delta","memo_delta","thesis_delta_verdict","stage_one_comment","rerun_command","_memo_delta.md","business_type","primary_valuation_method"],
 ".claude/commands/research/review-decisions.md":["memo_delta","stage_one_comment","rerun_command","Pool first","_memo_delta"],
 ".claude/commands/research/eval.md":["scripts/eval.py"],
 "scripts/eval.py":["T_forecast_ledger_quality","FL_DATE","confirmation_trigger","falsification_trigger","eval_t_probability","PROB_DATE","W_sector_valuation","SECTOR_DATE","SECTOR_FORBIDDEN","X_verify_floor","VERIFY_FLOOR_DATE","ACCEPTABLE_VERDICTS","Y_data_sufficiency_cap","INSUF_THRESHOLD","DATASUF_CONVICTION_FLOOR","HIGH_CONVICTION_DECISIONS","eval_z_thesis_type_cap","THESIS_TYPE_ENUM","EXTERNAL_TYPES","THESIS_Z_DATE","AA_module_verdict_lock","AA_DATE","BSS_CAP_VERDICT","MG_CAP_VERDICT","eval_aa_module_verdict_lock","extract_synthesis_verdict"],
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
    print(f"  {nm}: {'PASS' if r['pass'] else 'FAIL'} ({r['decision']})", ("fails="+",".join(fails)) if fails else "", ("WARN extras="+",".join(r['warn_nonschema_files'])) if r['warn_nonschema_files'] else "")
jfails=[j["file"] for j in jchecks if j["status"]=="FAIL"]
print("  framework source contracts (J: §24 + catalyst + tiers):", "PASS" if not jfails else "FAIL "+";".join(jfails))
for j in jchecks:
    if j["status"]=="FAIL": print(f"     FAIL {j['file']} missing={j['missing']}")
print("WROTE", of)
sys.exit(0 if suite_pass else 1)   # [review fix] non-zero exit on FAIL so CI / hooks / automation gating on $? see the regression
