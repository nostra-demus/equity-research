#!/usr/bin/env python3
"""Deterministic eval harness for the equity-research engine.

Checks invariants A-Z, AA-BA, and J (framework-source contracts) against every committed
decision record in analyses/. Called by /research:eval and by CI.

Usage:
    python3 scripts/eval.py [TICKER_OR_RUN | all]

Exit 0 = all checks PASS; 1 = at least one FAIL.
"""
import json, glob, os, re, sys, subprocess, datetime, math, tempfile, ast
from data_need_contract import (
    DATA_NEED_PROMISE_RE as _DATA_NEED_PROMISE_RE,
    DATA_NEED_URL_RE as _DATA_NEED_URL_RE,
    check_live_orb_routes,
    text_leaves as _data_need_text_leaves,
)
from overdue_checks import (
    eval_as_forecast_overdue as _overdue_as_forecast_overdue,
    eval_aw_kill_criteria_overdue as _overdue_aw_kill_criteria_overdue,
)
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

# ── Check AX (versioned data-needs decision guidance) ───────────────────────────────────────────────
# DECISION_LEDGER.md §5. Fresh records explicitly emit v2 even when no active need exists, separating a
# completed empty check from an omitted contract. Older records without the discriminator remain valid.
# Schema-like structural checks live here because the research decision record is a documented ledger
# contract, not a standalone JSON Schema; ranks and promise language are the semantic half no schema can
# express. Priority is decision value, never an expected score lift.
DATA_NEEDS_V2_DATE = "2026-08-14"
DATA_NEED_ACQUISITIONS = {"official_api", "free_key_api", "paid_api", "scrape", "manual"}
DATA_NEED_ACCESS = {"public", "licensed", "restricted", "unknown"}
DATA_NEED_TIERS = {5, 9, 10}
DATA_NEED_CADENCES = {"twelve_hourly", "daily", "weekly", "monthly", "quarterly", "semiannual", "annual", "event_driven"}
_DATA_NEED_ID_RE = re.compile(r"^[a-z0-9][a-z0-9_-]*$")
def eval_ax_data_needs_v2(decision_date, version, data_needs):
    """Return None for a legacy pre-gate record, otherwise a violation list (`[]` = pass).

    Enforces the exact v2 entry/source/orb shapes plus the semantic constraints: max five, unique ids,
    priorities exactly 1..N, no URLs, and no obvious guarantee or numeric/promised conviction lift.
    """
    post_gate = isdate(decision_date) and decision_date >= DATA_NEEDS_V2_DATE
    if version is None:
        if post_gate:
            return [
                f"record dated {decision_date} must carry data_needs_schema_version='2.0' and data_needs "
                "(use [] when no missing observation actively caps the decision)"
            ]
        return None
    if version != "2.0":
        return [f"data_needs_schema_version={version!r}; the only supported discriminator is '2.0'"]
    if not isinstance(data_needs, list):
        return ["data_needs_schema_version='2.0' requires data_needs to be an array (empty is valid)"]

    issues = []
    if len(data_needs) > 5:
        issues.append(f"data_needs has {len(data_needs)} entries; v2 allows at most 5")
    priorities, need_ids = [], []
    need_required = {
        "need_id", "priority", "series", "why_it_caps", "expected_impact", "filing_required",
        "entry_orbs", "suggested_source", "tier", "cadence",
    }
    need_allowed = need_required | {"next_release"}
    impact_keys = {"if_supportive", "if_adverse"}
    orb_keys = {"module", "agent", "why", "confidence"}
    source_keys = {"name", "acquisition", "access", "licensing_basis"}

    def _nonempty_string(value):
        return isinstance(value, str) and bool(value.strip())

    for i, need in enumerate(data_needs):
        prefix = f"data_needs[{i}]"
        if not isinstance(need, dict):
            issues.append(f"{prefix} is not an object")
            continue
        missing = sorted(need_required - set(need))
        extra = sorted(set(need) - need_allowed)
        if missing: issues.append(f"{prefix} missing required fields {missing!r}")
        if extra: issues.append(f"{prefix} has forbidden/extra v2 fields {extra!r}")

        need_id = need.get("need_id")
        if not (_nonempty_string(need_id) and _DATA_NEED_ID_RE.fullmatch(need_id)):
            issues.append(f"{prefix}.need_id={need_id!r} is not a stable lowercase slug")
        else:
            need_ids.append(need_id)
        priority = need.get("priority")
        if not (isinstance(priority, int) and not isinstance(priority, bool) and 1 <= priority <= 5):
            issues.append(f"{prefix}.priority={priority!r} is not an integer rank from 1 to 5")
        else:
            priorities.append(priority)
        for key in ("series", "why_it_caps"):
            if not _nonempty_string(need.get(key)):
                issues.append(f"{prefix}.{key} must be a non-empty string")
        if not isinstance(need.get("filing_required"), bool):
            issues.append(f"{prefix}.filing_required must be boolean")

        impact = need.get("expected_impact")
        if not isinstance(impact, dict):
            issues.append(f"{prefix}.expected_impact must be an exact object")
        else:
            if set(impact) != impact_keys:
                issues.append(f"{prefix}.expected_impact must contain exactly {sorted(impact_keys)!r}")
            for key in impact_keys:
                if not _nonempty_string(impact.get(key)):
                    issues.append(f"{prefix}.expected_impact.{key} must be a non-empty string")

        orbs = need.get("entry_orbs")
        if not isinstance(orbs, list) or not orbs:
            issues.append(f"{prefix}.entry_orbs must be a non-empty array")
        else:
            seen_orbs = set()
            for j, orb in enumerate(orbs):
                op = f"{prefix}.entry_orbs[{j}]"
                if not isinstance(orb, dict):
                    issues.append(f"{op} is not an object")
                    continue
                if set(orb) != orb_keys:
                    issues.append(f"{op} must contain exactly {sorted(orb_keys)!r}")
                for key in ("module", "agent", "why"):
                    if not _nonempty_string(orb.get(key)):
                        issues.append(f"{op}.{key} must be a non-empty string")
                confidence = orb.get("confidence")
                if not (isnum(confidence) and math.isfinite(confidence) and 0 <= confidence <= 1):
                    issues.append(f"{op}.confidence={confidence!r} must be routing confidence on the 0..1 scale")
                try:
                    encoded = json.dumps(orb, sort_keys=True, separators=(",", ":"), allow_nan=False)
                except (TypeError, ValueError):
                    encoded = None
                if encoded is not None:
                    if encoded in seen_orbs: issues.append(f"{op} duplicates another entry_orb")
                    seen_orbs.add(encoded)

        source = need.get("suggested_source")
        if not isinstance(source, dict):
            issues.append(f"{prefix}.suggested_source must be an exact source-hint object")
        else:
            if set(source) != source_keys:
                issues.append(f"{prefix}.suggested_source must contain exactly {sorted(source_keys)!r}")
            for key in ("name", "licensing_basis"):
                if not _nonempty_string(source.get(key)):
                    issues.append(f"{prefix}.suggested_source.{key} must be a non-empty string")
            if source.get("acquisition") not in DATA_NEED_ACQUISITIONS:
                issues.append(f"{prefix}.suggested_source.acquisition={source.get('acquisition')!r} is outside the closed enum")
            if source.get("access") not in DATA_NEED_ACCESS:
                issues.append(f"{prefix}.suggested_source.access={source.get('access')!r} is outside the closed enum")

        tier = need.get("tier")
        if not (isinstance(tier, int) and not isinstance(tier, bool) and tier in DATA_NEED_TIERS):
            issues.append(f"{prefix}.tier={tier!r}; v2 permits only 5, 9, or 10")
        if need.get("cadence") not in DATA_NEED_CADENCES:
            issues.append(f"{prefix}.cadence={need.get('cadence')!r} is outside the connector cadence enum")
        if "next_release" in need:
            next_release=need.get("next_release")
            if not isdate(next_release):
                issues.append(f"{prefix}.next_release={next_release!r} is not a real YYYY-MM-DD date")
            elif isdate(decision_date) and next_release < decision_date:
                issues.append(
                    f"{prefix}.next_release={next_release!r} predates decision_date={decision_date!r}; "
                    "a next release must be on or after the decision date"
                )

        for text_path, value in _data_need_text_leaves(need, prefix):
            if _DATA_NEED_URL_RE.search(value):
                issues.append(f"{text_path} contains a URL; suggested_source is a hint only")
            if _DATA_NEED_PROMISE_RE.search(value):
                issues.append(
                    f"{text_path} guarantees or promises/quantifies a conviction, score, or rating lift; "
                    "state conditional two-sided decision impact instead"
                )

    if len(need_ids) != len(set(need_ids)):
        issues.append("data_needs v2 need_id values must be unique")
    if len(priorities) == len(data_needs):
        expected = list(range(1, len(data_needs) + 1))
        if priorities != expected:
            issues.append(
                f"data_needs priorities are ordered {priorities!r}; array order must be exactly "
                f"{expected!r} so data_needs[0] is priority 1 and the queue is contiguous"
            )
    return issues


def _data_needs_prewrite(record_path, publication_date=None):
    """Creation-time gate: frozen semantics plus today's exact research orb roster.

    Normal `eval.py all` intentionally does not call the live-roster half: an orb renamed next year must
    not retro-fail an immutable decision published today. Full/rerun commands invoke this before sealing.
    """
    try:
        record=json.load(open(record_path,encoding="utf-8"))
    except Exception as error:
        return [f"cannot read decision record: {error}"]
    if not isinstance(record,dict):
        return ["decision record root is not an object"]
    decision_date=record.get("decision_date")
    if not isdate(decision_date):
        return [f"decision_date={decision_date!r} is not a real YYYY-MM-DD date"]
    publish_date=publication_date or today
    if not isdate(publish_date):
        return [f"publication_date={publish_date!r} is not a real YYYY-MM-DD date"]
    # A rerun deliberately preserves the original thesis decision_date. That historical date must not
    # let a newly published record bypass a contract that is live today: immutable replay keys off the
    # authored decision date, while this creation-only gate keys off the actual publication date.
    if publish_date >= DATA_NEEDS_V2_DATE and record.get("data_needs_schema_version") != "2.0":
        return [
            f"publication date {publish_date} is on/after {DATA_NEEDS_V2_DATE}; the new publication must "
            "carry data_needs_schema_version='2.0' and data_needs (use [] when no active gap exists)"
        ]
    issues=eval_ax_data_needs_v2(
        decision_date, record.get("data_needs_schema_version"), record.get("data_needs")
    )
    errors=[] if issues is None else list(issues)
    errors.extend(check_live_orb_routes(record,".claude/agents"))
    return errors


if scope=="--data-needs-prewrite":
    if len(sys.argv)!=3:
        print("usage: python3 scripts/eval.py --data-needs-prewrite <decision_record.json>",file=sys.stderr)
        raise SystemExit(2)
    _prewrite_errors=_data_needs_prewrite(sys.argv[2])
    if _prewrite_errors:
        print("DATA-NEEDS-PREWRITE: FAIL",file=sys.stderr)
        for _error in _prewrite_errors: print(f"  - {_error}",file=sys.stderr)
        raise SystemExit(1)
    print("DATA-NEEDS-PREWRITE: PASS")
    raise SystemExit(0)

# ── Deferred sibling imports (below the --data-needs-prewrite exit above) ──────────────────────
# Everything past this point runs only in the full suite / selftest, never in the lightweight
# `--data-needs-prewrite` path (which exits above). The prewrite is intentionally invoked in a
# minimal environment — commit-run.sh's temp workspace and test_commit_run.py's prewrite fixture
# copy ONLY eval.py + data_need_contract.py + overdue_checks.py — so any heavier sibling import
# (rating_caps, headline_checks, ledger_records, …) MUST live below this line, or the prewrite
# crashes with ModuleNotFoundError before it can validate. Check AY reuses
# ledger_records.resolve_integrity_status (CLAUDE.md §2 — do not reimplement the same
# PROVISIONAL-banner / verification_report-verdict resolution; it is the SAME signal
# /research:calibrate and /research:track already read) and is used only in the main scan loop.
from ledger_records import resolve_integrity_status

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

# ── Check AY (golden-fixture truth-integrity floor) — module-level so `eval.py selftest` can drive it ──
# eval.py's own docstring says it exists "so framework/agent/command changes can't silently regress the
# engine" against the committed runs "(the golden fixtures)" — but until now it never read the ONE signal
# that says a golden fixture might itself be wrong: the finish-gate's own PROVISIONAL banner on
# final_thesis.md (stamped by full.md 10B.1 / rerun.md 8A when scenario math, headline reconciliation, or
# verify-evidence doesn't check out) or a non-Clean/Minor verify-evidence verdict. Checks G/O/X already
# touch the same evidence but only for the Selected/Short CONVICTION baskets (checks O/X: DECISIONS.get in
# ("Selected","Short")) — a Watchlist/Avoid/Insufficient-Data run's live PROVISIONAL banner had zero
# mechanical check anywhere in this suite, so `eval.py all` could print PASS while a third of the committed
# fixture set was unverified-possibly-wrong. `ledger_records.resolve_integrity_status()` already computes
# this exact status for /research:calibrate and /research:track (see its module docstring); this check
# reuses it rather than re-deriving the banner/verdict logic here (CLAUDE.md §2).
#
# Basket-independent by design (unlike X/O) — that is the gap this closes. Date-gated like AI/AK: the
# underlying signal (the banner text, the verify-evidence verdict) already fully existed before this check
# was written, so — mirroring AI/AK's own precedent — a run dated BEFORE AY_DATE that is already
# `provisional` is surfaced only as a retrospective advisory (see the retro block below), never a hard
# FAIL; a run dated on/after AY_DATE gates normally. This makes the check bite going forward without
# retroactively failing CI on pre-existing data a code PR is not the place to remediate (that is a data
# commit under CLAUDE.md §25, not a code change).
AY_DATE="2026-08-15"
def eval_ay_fixture_integrity(decision_date, status):
    """Core of check AY. `status` is ledger_records.resolve_integrity_status(run_dir)["status"] —
    one of 'verified' | 'provisional' | 'unaudited'. Returns 'pass' | 'fail' | 'na'. Side-effect-free +
    module-level so the selftest can drive the date gate without a run fixture."""
    if not (isdate(decision_date) and decision_date>=AY_DATE):
        return "na"
    return "fail" if status=="provisional" else "pass"

# ── Check AZ (verify-evidence Section C3 — named-metric contradiction sweep, CLAUDE.md §3) ──
# CLAUDE.md §3 requires that a directional verdict resting on one metric, while a different metric in
# the engine's own tables points the other way, name that second metric and say why it does not overturn
# the verdict — the exact AMZN worked example the doctrine itself documents (moat "confirmed" off a
# gross-margin decline while EBITDA margin, net margin, cash conversion, and market share were all up).
# verify-evidence.md Section C already reconciles NUMERIC anchors across modules, and Section C2 catches
# a directional claim that drops its qualifier/basis between an upstream sub-agent and the thesis — but
# neither ever swept the run's OWN module tables for a same-family, opposite-direction metric that was
# never named anywhere at all. Section C3 (added alongside this check) closes that hole; this is the
# purely-structural half — it does not grade the sweep's content (that is inherently a judgment call, the
# same way Section A/B/C are), only that a run dated on/after AZ_DATE actually carries the field, so a
# future verify-evidence run cannot silently regress to omitting the section it is now instructed to run.
# Same "additive schema, forward-looking gate" convention as checks T2/W/AX — see those for precedent.
AZ_DATE="2026-08-21"
def eval_az_contradiction_sweep(decision_date, verification_report):
    """Core of check AZ. `verification_report` is the parsed verification_report.json dict, or None if
    no report exists for this run. Returns 'pass' | 'fail' | 'na'. Side-effect-free + module-level so
    the selftest can drive the date gate without a run fixture."""
    if not (isdate(decision_date) and decision_date>=AZ_DATE):
        return "na"
    if verification_report is None:
        return "na"  # report existence itself is gated by check O for conviction runs; not re-litigated here
    if not isinstance(verification_report, dict):
        return "fail"  # a report that parses to a non-dict JSON type can't carry contradiction_checks[] — fail, don't crash
    return "pass" if isinstance(verification_report.get("contradiction_checks"), list) else "fail"

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

# CLAUDE.md §19 requires each forecast_ledger entry to record 8 fields: prediction, probability,
# time_window, evidence_today, confirmation_trigger, falsification_trigger, owner_module, confidence_score.
# Check T (below) has always enforced 4 of them (prediction/confirmation_trigger/falsification_trigger/
# time_window) plus status/probability/forecast_type validity — but never evidence_today, owner_module,
# or confidence_score, even though DECISION_LEDGER.md §6's own example schema carries all three. Nothing
# mechanical stopped a future synthesizer-prompt edit from silently dropping them: the learning loop needs
# owner_module to slice calibration by module (calibrate.py's calibration_by_module) and confidence_score
# to weight/aggregate forecasts by conviction, and review-decisions' luck-vs-skill judgment (DECISION_
# LEDGER.md §10) needs evidence_today to see what was known AT THE TIME, not read back in hindsight.
# owner_module is checked against ROSTER (self-discovered from .claude/agents/*/99_*-synthesis.md, same
# set check AA/AJ use) rather than a hardcoded module list, per CLAUDE.md §26 zero-touch extensibility —
# a new module is absorbed automatically, nothing here needs editing when one is added.
OWNERCONF_DATE="2026-08-06"
def eval_forecast_entry_completeness(entry):
    """Validate a single forecast_ledger entry's owner_module / confidence_score / evidence_today
    fields per CLAUDE.md §19. Returns a list of error strings (empty list = pass). Side-effect-free
    + module-level so the selftest drives all branches fixture-free (every committed fixture already
    carries all three fields in practice, so this can't be exercised via a missing-field golden fixture)."""
    errs=[]
    om=entry.get("owner_module")
    if not str(om or "").strip():
        errs.append("missing or empty: owner_module")
    elif ROSTER and om not in ROSTER:
        errs.append(f"owner_module={om!r} not in module roster {sorted(ROSTER)}")
    cs=entry.get("confidence_score")
    if not (isnum(cs) and 0<=cs<=100):
        errs.append(f"confidence_score={cs!r} must be a number in [0, 100] per CLAUDE.md §19/§12")
    if not str(entry.get("evidence_today") or "").strip():
        errs.append("missing or empty: evidence_today")
    return errs

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
    AQ_DATE, FORENSIC_TAGS, ABOVE_STARTER_AQ, eval_aq_forensic_mosaic_cap,
    BB_DATE, CYCLE_ELEV_TAG, CYCLE_DEPR_TAG, BB_COMPOUND_CAP, eval_bb_sector_cycle_compounding_cap,
)

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
AG_STATUSES = {"not_available","pre_data","checked_no_action","applied"}
def _ag_leading_error_categories(calibration_summary):
    """Categories in the as-of summary's error_taxonomy_distribution with count >= 2 — the same
    threshold calibrate.md's own human-facing narration already uses ("leading tag(s) if any count >= 2").
    Sorted for a deterministic violation message. Non-dict/non-numeric entries are ignored, never crash."""
    dist = (calibration_summary or {}).get("error_taxonomy_distribution")
    if not isinstance(dist, dict): return []
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
        fft=calibration_feedback.get("flagged_forecast_types")
        ftt=calibration_feedback.get("flagged_thesis_types")
        lecf=calibration_feedback.get("leading_error_categories_flagged")
        if not (isnum(hp) and hp==8):
            violations.append(f"status='applied' but haircut_points={hp!r} is not the fixed 8-point constant "
                              f"(DECISION_LEDGER.md §18: 'the fixed constant (8)' — a single, bounded, non-additive haircut)")
        if ftype_gate or ttype_gate or errtax_gate:
            mf_ok=isinstance(mf,list) and len(mf)>0
            fft_ok=isinstance(fft,list) and len(fft)>0
            ftt_ok=ttype_gate and isinstance(ftt,list) and len(ftt)>0
            # A flagged category is only a traceable trigger if it names one the as-of summary's OWN
            # error_taxonomy_distribution is actually leading (count >= 2) right now — flagging an
            # unrelated or stale category must not grant a free pass (Codex r3671892091 — P2). Filtering
            # to str entries first also means a malformed (non-string/unhashable) entry can never satisfy
            # traceability, rather than crashing the gate (see the set()-crash fix below).
            lecf_str=[x for x in lecf if isinstance(x,str)] if isinstance(lecf,list) else []
            lecf_ok=errtax_gate and any(x in lec for x in lecf_str)
            if not (mf_ok or fft_ok or ftt_ok or lecf_ok):
                violations.append(f"status='applied' but none of modules_flagged={mf!r}, "
                                   f"flagged_forecast_types={fft!r}"
                                   + (f", flagged_thesis_types={ftt!r}" if ttype_gate else "")
                                   + (f", leading_error_categories_flagged={lecf!r}" if errtax_gate else "")
                                   + " is a non-empty list — the haircut must be traceable to at least "
                                   "one flagged module, forecast type, thesis type, or leading error-taxonomy category")
        elif not (isinstance(mf,list) and len(mf)>0):
            violations.append(f"status='applied' but modules_flagged={mf!r} is empty/not a list")
    if status=="checked_no_action":
        mf=calibration_feedback.get("modules_flagged")
        fft=calibration_feedback.get("flagged_forecast_types")
        ftt=calibration_feedback.get("flagged_thesis_types")
        lecf=calibration_feedback.get("leading_error_categories_flagged")
        if isinstance(mf,list) and len(mf)>0:
            violations.append(f"status='checked_no_action' but modules_flagged={mf!r} is non-empty")
        if ftype_gate and isinstance(fft,list) and len(fft)>0:
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
            elif len(ftt)>0:
                violations.append(f"status='checked_no_action' but flagged_thesis_types={ftt!r} is non-empty")
        if errtax_gate:
            # Same PRESENCE reasoning as the thesis-type block above, applied to the 4th trigger.
            if not isinstance(lecf, list):
                violations.append(f"status='checked_no_action' but leading_error_categories_flagged={lecf!r} is missing/not a list "
                                  f"— on/after {AG_ERRTAX_DATE} the error-taxonomy slice must prove it ran by recording an "
                                  f"empty list (§18: a clean check must be distinguishable from a silently skipped one)")
            elif len(lecf)>0:
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
    if errtax_gate and status in ("checked_no_action","applied"):
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
    elif status in ("checked_no_action","pre_data","not_available") and isnum(ch) and ch != 0:
        violations.append(f"status={status!r} applies no §18 haircut but confidence_inputs.calibration_haircut="
                          f"{ch!r} != 0 — the scorer cut conviction for a haircut the gate did not record")
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

# ── Check AP (valuation-summary lever-sidecar integrity, §25/§28) ──
# Detection logic in scripts/valuation_summary_checks.py — importable + pure (mirrors headline_checks.py),
# so the SAME core is finish-gate-ready. valuation_summary.json is §25 DATA that reaches main WITHOUT CI;
# a malformed sidecar, or one whose scenario levels contradict its own frozen decision_record, would make
# the cockpit Playground show levers that disagree with the committed thesis. Run GLOBALLY below (every
# committed sidecar, including partial no-decision-record runs the per-run loop skips).
from valuation_summary_checks import (
    eval_ap_valuation_summary_integrity, scan_committed, _selftest as _vs_selftest,
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

# ── Check AR (§8 mirror of AM) — a Short Candidate must have a real loss branch for the short ──
AR_DATE = "2026-07-25"
def eval_ar_short_bull_case_sanity(decision_date, decision, scenarios, entry_price):
    """Check AR: the short-side mirror of check AM. A "Short Candidate" decision must carry a genuine
    bull case — the bull-labelled scenario's price_target ABOVE entry_price (a real squeeze/upside branch
    that is a genuine LOSS to the short position). A "bull" scenario that is itself at or below entry (no
    loss to the short) fails §8's strongest-bull-case test applied to the short's own disconfirming
    direction — the exact mirror of the EMAAR_2026-07-03 bear-case defect check AM guards against on the
    long side. Without this, a Short Candidate could ship with an all-downside scenario set that never
    prices the risk of being wrong, silently violating §8's symmetric-disconfirmation requirement for the
    one decision type check AM does not cover. Returns None (pre-gate / not a Short Candidate / no usable
    bull price target) or a list of violations (empty = pass)."""
    if not (isdate(decision_date) and decision_date >= AR_DATE):
        return None
    if decision != "Short Candidate":
        return None
    if not (isinstance(scenarios, list) and isinstance(entry_price, (int, float)) and not isinstance(entry_price, bool) and entry_price > 0):
        return None
    bull = next((s for s in scenarios if isinstance(s, dict) and "bull" in str(s.get("label", "")).lower()), None)
    if not bull or not isinstance(bull.get("price_target"), (int, float)) or isinstance(bull.get("price_target"), bool):
        return None  # no usable bull price target to test
    if bull["price_target"] <= entry_price:
        return [f"Short Candidate but the bull-case price target {bull['price_target']} is not above "
                f"entry_price {entry_price} — no genuine upside/squeeze branch, i.e. no real loss to the "
                f"short (§8 strongest-bull-case; mirror of check AM)"]
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
                           # A regulatory DISCLOSURE settles exactly like the 'filing|filed' already above it
                           # ("no such disclosure by 2026-09-30" is checked the same way as "not filed by …"),
                           # and a COURT/tribunal DOCKET is a public primary record that outranks an 8-K under
                           # §4 — the list was SEC/India-filing-centric and simply had no vocabulary for either,
                           # so a securities-litigation or deal-closing forecast settled on the docket read as
                           # unresolvable. §27: name the local forum, not a US-only one.
                           r"disclos(?:e|ed|es|ure|ures|ing)|docket|court|tribunal|nclt|nclat|"
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

# A falsification that is the DATED NEGATION of an already-resolvable confirmation is fully settleable, and
# used to fail anyway. The canonical shape of a BINARY EVENT forecast is "confirmation: <event> disclosed in
# an 8-K by 2026-09-30" / "falsification: no such disclosure by 2026-09-30" — the scorer reads BOTH fields of
# the SAME entry, so the anaphora ('no such') resolves against its own sibling, and the deadline is explicit.
# Demanding that this half separately restate a number or a document name does not make it more resolvable;
# it pushes authors toward vaguer prose that happens to carry a digit. AO's own comment block already names
# the priority: "a false-positive eval gate blocks valid PRs — worse than letting a weak year-only reference
# pass."
#
# Deliberately NARROW — all three must hold, or the trigger fails exactly as before:
#   (a) the trigger OPENS with / carries a negation,
#   (b) it carries a back-reference marker — 'no such' (anaphoric), an explicit 'within the window/period',
#       or an explicit calendar date (the deadline), and
#   (c) its SIBLING confirmation is itself resolvable (pins a number or names a settleable document).
# The one-sided-vagueness defect this check exists to catch is untouched: a bare "margin does not improve"
# beside a numbered "margin above 12%" confirmation has a negation but NO back-reference marker, so it still
# fails — as its selftest case (_fc_onesided) asserts.
# Separators are `[\s\-_]+`, not a bare `\s+`, so ordinary formatting variation ('time frame' /
# 'time-frame', 'no  such' across a wrapped line) cannot false-NEGATIVE its way into a spurious AO
# failure — the same convention check AU already uses for `\bsign[\s\-_]*check` (Gemini #405).
_AO_NEGATION = re.compile(r"^\W*(?:no|none|neither|not|never)\b|"
                          r"\b(?:does|do|did|is|are|was|were|has|have|had|will|would)[\s\-_]+not\b|"
                          r"\bfails?[\s\-_]+to\b|\bno[\s\-_]+such\b", re.I)
_AO_BACKREF = re.compile(r"\bno[\s\-_]+such\b|"
                         r"\bwithin[\s\-_]+the[\s\-_]+(?:window|period|time[\s\-_]*frame)\b", re.I)

def _ao_is_negated_mirror(trigger, sibling):
    """True when `trigger` is the dated negation of an already-resolvable `sibling` confirmation — see the
    block comment above for why that is settleable and why the test is this narrow."""
    if not trigger or not sibling:
        return False
    if not (_ao_pins_a_number(sibling) or _AO_NAMED_DOC.search(sibling)):
        return False  # (c) nothing resolvable to mirror — both halves vague is the real defect
    if not _AO_NEGATION.search(trigger):
        return False  # (a)
    # (b) an explicit anaphor/window phrase, or a real calendar date acting as the deadline
    return bool(_AO_BACKREF.search(trigger)
                or _AO_ISO_RE.search(trigger) or _AO_MONTH_RE.search(trigger))

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


# ---- check AS: a forecast whose window has ELAPSED but was never resolved ---------------------------
# WHY: check AO proves a forecast is RESOLVABLE at authoring time. Nothing asked whether it was ever
# actually RESOLVED. The AMZN 2026-07-10 record dated its own decisive test to the day — edge_proof: "At
# Q2 2026 earnings (July 31, 2026): ... if AWS margin holds or expands, the hypothesis is wrong and the
# bull case at $247+ is live" — and scheduled a 30-day review for 2026-08-09. The test fired cleanly on
# the day (AWS margin expanded 35.4% -> 39.4%) and the thesis was falsified, but nothing in the engine
# noticed: the ledger still read `open`, and the miss surfaced only because a human saw the stock move.
#
# A forecast the engine cannot notice has come due is not a forecast, it is a note (§19: "a forecast that
# cannot be checked later is not a forecast"). This check is what makes the ledger self-reporting.
#
# ADVISORY, never a hard FAIL — deliberately. Overdue-ness is created by the PASSAGE OF TIME, not by a
# defect in the run: every committed run eventually accumulates elapsed forecasts, and failing the suite
# on the calendar would turn the whole harness red and train readers to ignore it. It reports.
# The harness's own "now". Overridable so a fixture run is reproducible and the selftest needs no clock.
TODAY = os.environ.get("EVAL_TODAY") or datetime.date.today().isoformat()

# Detection logic extracted to scripts/overdue_checks.py (importable, side-effect-free — eval.py
# itself cannot be imported, it runs its whole suite and sys.exit()s at module scope), the same
# closure already done for the §10 scenario-integrity detectors (scenario_integrity_checks.py
# below): the SAME two checks now also run LIVE, in the calls-tracker dashboard and `GET /api/calls`
# (`.claude/commands/research/track.md`, `ui/server/src/outputs.ts`), instead of only ever
# surfacing when someone remembers to run `/research:eval` by hand.
#
# `decision_date` is accepted but unused (dead parameter carried over from before this
# extraction — overdue_checks.py's due-date extraction never reads it) — kept here only so this
# module's existing call sites and selftest fixtures below need no signature change.
def eval_as_forecast_overdue(decision_date, forecast_ledger, today):
    """Check AS: a forecast_ledger entry whose window has ELAPSED with no resolution (§19: "a
    forecast that cannot be checked later is not a forecast"). None = N/A; [] = nothing due."""
    r = _overdue_as_forecast_overdue(forecast_ledger, today)
    return None if r is None else [x["description"] for x in r]

def eval_aw_kill_criteria_overdue(decision_date, kill_criteria, today):
    """Check AW: a kill_criteria entry whose own named monitor event has ELAPSED, never checked
    (§8: disconfirming evidence is "a required test the thesis must survive," not a closing
    caveat). None = N/A; [] = nothing due."""
    r = _overdue_aw_kill_criteria_overdue(kill_criteria, today)
    return None if r is None else [x["description"] for x in r]

# ── Check BA (§17 / HARD GATE 11 — kill-criteria trigger test) ──────────────────────────────────
# Detection logic lives in scripts/scenario_integrity_checks.py (imported below, alongside
# AT/AU/AV/BC) so the SAME function also runs LIVE in the /research:full Step 10B.1 finish-gate —
# previously it was defined here only, so eval.py graded it retrospectively but the live gate could
# never call it. See that module's check-BA comment block for the full doctrine rationale.


# ── Checks AT/AU/AV (§10 scenario span + conjunction disclosure; sign-check presence) ───────────
# Detection logic extracted to scripts/scenario_integrity_checks.py (importable, side-effect-free)
# so the SAME functions also run LIVE in the /research:full Step 10B.1 finish-gate — before a
# violation ships, not only when someone remembers to run this eval harness afterward. See that
# module's docstring for the full doctrine rationale and the AMZN_2026-07-10 case that motivated it.
# Import (not copy): eval.py is the single caller of these functions for retrospective grading;
# scenario_integrity_checks.py is the single source of the detection logic, imported by both callers.
from scenario_integrity_checks import (
    eval_at_scenario_span,
    eval_au_sign_check_recorded,
    eval_av_conjunction_disclosure,
    eval_bc_probability_basis_stated,
    eval_ba_kill_criteria_trigger_test,
    BA_DATE,
)


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
                    # A falsification that is the dated negation of a resolvable confirmation settles fine
                    # (see _ao_is_negated_mirror). Only the falsification side may mirror — a confirmation
                    # that merely negates something is not a positive, checkable claim.
                    if side == "falsification" and _ao_is_negated_mirror(trig, ct):
                        continue
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
    # check AY — basket-independent, unlike X; drive the date gate + all three ledger_records statuses here.
    AY=eval_ay_fixture_integrity
    aycases=[  # (decision_date, status, expect: "pass"|"fail"|"na")
        ("2026-08-15","provisional","fail"),
        ("2026-08-16","provisional","fail"),   # any decision/basket — no HIGH_CONVICTION_DECISIONS gate
        ("2026-08-15","verified","pass"),
        ("2026-08-15","unaudited","pass"),     # no audit ever ran — not itself a defect (CLAUDE.md §11)
        ("2026-08-14","provisional","na"),     # predates AY_DATE — surfaced only as a retrospective advisory
        ("not-a-date","provisional","na"),     # unparseable decision_date
        (None,"provisional","na"),
    ]
    for dt_,st_,exp in aycases:
        got=AY(dt_,st_); ok=(got==exp)
        if not ok: bad+=1
        print(f"  [{'ok' if ok else 'XX'}] AY({dt_!r},{st_!r}) -> {got}"+("" if ok else f"  EXPECTED {exp}"))
    # check AZ — verify-evidence Section C3 schema-presence gate; drive the date gate + report-shape branches.
    AZ=eval_az_contradiction_sweep
    azcases=[  # (decision_date, verification_report-or-None, expect: "pass"|"fail"|"na")
        ("2026-08-21",{"contradiction_checks":[]},"pass"),
        ("2026-08-21",{"contradiction_checks":[{"verdict_word":"confirmed"}]},"pass"),
        ("2026-08-22",{"verdict":"Clean"},"fail"),          # report exists but omits contradiction_checks
        ("2026-08-21",None,"na"),                            # no report — existence itself gated by check O
        ("2026-08-20",{"contradiction_checks":[]},"na"),     # predates AZ_DATE
        ("not-a-date",{"contradiction_checks":[]},"na"),
        (None,{"contradiction_checks":[]},"na"),
        ("2026-08-21",[],"fail"),                            # non-dict report (list) — must fail gracefully, not crash
        ("2026-08-21","not-a-dict","fail"),                  # non-dict report (string) — must fail gracefully, not crash
        ("2026-08-21",False,"fail"),                         # caller's "exists but is not readable JSON" sentinel — never N/A
    ]
    for dt_,rep_,exp in azcases:
        got=AZ(dt_,rep_); ok=(got==exp)
        if not ok: bad+=1
        print(f"  [{'ok' if ok else 'XX'}] AZ({dt_!r},{rep_!r}) -> {got}"+("" if ok else f"  EXPECTED {exp}"))
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
    # check T4 (forecast_ledger owner_module/confidence_score/evidence_today completeness) — every
    # committed fixture already carries all three fields, so the golden suite can't exercise a
    # missing-field branch; the selftest drives the validator directly for full branch coverage.
    T4=eval_forecast_entry_completeness
    t4cases=[  # (entry_dict, expected: [] = ok, list of substrings that must each appear somewhere in errs)
        ({"owner_module":"earnings","confidence_score":65,"evidence_today":"Q1 filing"}, []),
        ({"owner_module":"valuation","confidence_score":0,"evidence_today":"x"}, []),        # 0 is a valid score
        ({"owner_module":"valuation","confidence_score":100,"evidence_today":"x"}, []),      # 100 is valid
        ({"owner_module":"catalyst","confidence_score":45.5,"evidence_today":"x"}, []),      # float ok
        ({"confidence_score":65,"evidence_today":"x"}, ["missing or empty: owner_module"]),
        ({"owner_module":"","confidence_score":65,"evidence_today":"x"}, ["missing or empty: owner_module"]),
        ({"owner_module":"macro","confidence_score":65,"evidence_today":"x"}, ["not in module roster"]),   # not a real module
        ({"owner_module":"Earnings","confidence_score":65,"evidence_today":"x"}, ["not in module roster"]), # case-exact
        ({"owner_module":"earnings","evidence_today":"x"}, ["confidence_score=None"]),
        ({"owner_module":"earnings","confidence_score":None,"evidence_today":"x"}, ["confidence_score=None"]),
        ({"owner_module":"earnings","confidence_score":"high","evidence_today":"x"}, ["confidence_score='high'"]),
        ({"owner_module":"earnings","confidence_score":-5,"evidence_today":"x"}, ["confidence_score=-5"]),
        ({"owner_module":"earnings","confidence_score":101,"evidence_today":"x"}, ["confidence_score=101"]),
        ({"owner_module":"earnings","confidence_score":True,"evidence_today":"x"}, ["confidence_score=True"]),  # bool excluded
        ({"owner_module":"earnings","confidence_score":65}, ["missing or empty: evidence_today"]),
        ({"owner_module":"earnings","confidence_score":65,"evidence_today":""}, ["missing or empty: evidence_today"]),
        ({}, ["missing or empty: owner_module","confidence_score=None","missing or empty: evidence_today"]),  # all three absent
    ]
    t4bad=0
    for entry_,exp in t4cases:
        got=T4(entry_)
        ok=(got==[] if exp==[] else all(any(e in g for g in got) for e in exp))
        if not ok: t4bad+=1
        print(f"  [{'ok' if ok else 'XX'}] T4({entry_!r}) -> {got!r}"+("" if ok else f"  EXPECTED fragments {exp!r}"))
    bad+=t4bad
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
    # check AQ — §13 cross-module forensic-mosaic conviction cap. No committed run reaches AQ_DATE,
    # so drive every branch here: N/A (pre-gate / nothing ran), below-threshold (tags<3 or modules<2),
    # fired (>=3 distinct tags across >=2 modules) at every decision, negation/table-row non-fires, and
    # source-only propagation (specialist fired, synthesis clean).
    AQ=eval_aq_forensic_mosaic_cap
    EQ_SYNTH_1 = "Earnings synthesis.\nRF-EQ-001 (rising accruals divergent from cash earnings)\nCFO has lagged net income for 3 straight years."
    EQ_SYNTH_BOTH = "Earnings synthesis.\nRF-EQ-001 (rising accruals divergent from cash earnings)\nRF-EQ-002 (cash-conversion breakdown)\nCFO/EBITDA at 38%, below the 50% threshold for 2 consecutive years."
    EQ_SYNTH_NEG = "RF-EQ-001 not triggered — accruals track cash earnings closely."
    EQ_SPEC_BOTH = "Earnings-quality specialist.\nRF-EQ-001 (rising accruals divergent from cash earnings)\nRF-EQ-002 (cash-conversion breakdown)"
    OBS_SYNTH_1 = "Balance-sheet-survival synthesis.\nRF-OBS-001 (contingent-liability spike)\nMax litigation exposure 4.2x recognized liability, active."
    OBS_SYNTH_TABLEROW = "| Contingent-liability spike (RF-OBS-001) | N | Solvency strength | max 70 | | | |"
    OBS_SPEC_1 = "Off-balance-sheet specialist.\nRF-OBS-001 (contingent-liability spike)"
    MG_SYNTH_ALL3 = "Management-governance synthesis.\nRF-DISC-001 (commentary contradicting the numbers)\nRF-DISC-002 (recurring \"one-off\" / aggressive non-GAAP add-backs)\nRF-REG-002 (delayed results / material-disclosure timeliness)"
    MG_SYNTH_DISC1 = "RF-DISC-001 (commentary contradicting the numbers)"
    MG_SYNTH_CLEAN = "Management-governance synthesis: clean, no forensic flags."
    EQ_SYNTH_CLEAN = "Earnings synthesis: clean, no forensic flags."
    OBS_SYNTH_CLEAN = "Balance-sheet-survival synthesis: clean, no forensic flags."
    BM_SYNTH_BOTH = "Business-model synthesis.\nRF-DISQ-001 (multiple sub-threshold disqualifier near-misses)\nRF-RFS-001 (aggressive accounting practice pattern)"
    BM_SYNTH_DISQ1 = "RF-DISQ-001 (multiple sub-threshold disqualifier near-misses)"
    BM_SYNTH_NEG = "RF-DISQ-001 not triggered — fewer than 2 disqualifiers in the near-miss band."
    BM_SYNTH_CLEAN = "Business-model synthesis: clean, no forensic flags."
    BM_SPEC_BOTH = "Disqualifier-scan + red-flags-sweep specialists (combined).\nRF-DISQ-001 (multiple sub-threshold disqualifier near-misses)\n\nRF-RFS-001 (aggressive accounting practice pattern)"
    aqcases=[  # (decision, decision_date, module_synth_txt, module_specialist_txt, expect: None|[]|[tags])
        # pre-gate: always None (N/A), regardless of how many tags would otherwise fire
        ("Strong Buy","2026-07-23",{"earnings":EQ_SYNTH_BOTH,"balance-sheet-survival":OBS_SYNTH_1},{},None),
        ("Strong Buy","not-a-date",{"earnings":EQ_SYNTH_BOTH,"balance-sheet-survival":OBS_SYNTH_1},{},None),
        # all three modules absent (empty dicts, or dicts of Nones): N/A
        ("Strong Buy","2026-07-24",{},{},None),
        ("Strong Buy","2026-07-24",
         {"earnings":None,"balance-sheet-survival":None,"management-governance":None},
         {"earnings":None,"balance-sheet-survival":None,"management-governance":None},None),
        # below tag threshold: only 2 distinct tags (both from earnings) → pass regardless of conviction
        ("Strong Buy","2026-07-24",{"earnings":EQ_SYNTH_BOTH},{},[]),
        # below module threshold: 3 distinct tags but all from ONE module (management-governance) → pass
        ("Strong Buy","2026-07-24",{"management-governance":MG_SYNTH_ALL3},{},[]),
        # negation must not count toward the tag total: earnings negated (0), bss fired (1), mg fired (1
        # distinct) → only 2 distinct fired tags across 2 modules, still below the tag threshold → pass
        ("Strong Buy","2026-07-24",
         {"earnings":EQ_SYNTH_NEG,"balance-sheet-survival":OBS_SYNTH_1,"management-governance":MG_SYNTH_DISC1},
         {},[]),
        # table-row mention must not count as fired: earnings 2 tags + bss table-row-only (not counted)
        # → still only 2 distinct fired tags, 1 module → pass
        ("Strong Buy","2026-07-24",{"earnings":EQ_SYNTH_BOTH,"balance-sheet-survival":OBS_SYNTH_TABLEROW},{},[]),
        # THRESHOLD MET: 3 distinct tags (RF-EQ-001, RF-EQ-002, RF-OBS-001) across 2 modules + conviction → fire
        ("Strong Buy","2026-07-24",{"earnings":EQ_SYNTH_BOTH,"balance-sheet-survival":OBS_SYNTH_1},{},
         ["RF-EQ-001","RF-EQ-002","RF-OBS-001"]),
        ("Buy","2026-07-24",{"earnings":EQ_SYNTH_BOTH,"balance-sheet-survival":OBS_SYNTH_1},{},
         ["RF-EQ-001","RF-EQ-002","RF-OBS-001"]),
        # at/below the "Starter Position Only" ceiling → pass even with the mosaic fired
        ("Starter Position Only","2026-07-24",{"earnings":EQ_SYNTH_BOTH,"balance-sheet-survival":OBS_SYNTH_1},{},[]),
        ("Watchlist","2026-07-24",{"earnings":EQ_SYNTH_BOTH,"balance-sheet-survival":OBS_SYNTH_1},{},[]),
        ("Avoid","2026-07-24",{"earnings":EQ_SYNTH_BOTH,"balance-sheet-survival":OBS_SYNTH_1},{},[]),
        ("Insufficient Data — Refuse To Rate","2026-07-24",{"earnings":EQ_SYNTH_BOTH,"balance-sheet-survival":OBS_SYNTH_1},{},[]),
        # Short Candidate intentionally not capped (a forensic short on a credible accounting mosaic is valid)
        ("Short Candidate","2026-07-24",{"earnings":EQ_SYNTH_BOTH,"balance-sheet-survival":OBS_SYNTH_1},{},[]),
        # all 3 modules distinct (5 distinct tags across earnings/bss/mg) + conviction → fire
        ("Strong Buy","2026-07-24",
         {"earnings":EQ_SYNTH_1,"balance-sheet-survival":OBS_SYNTH_1,"management-governance":MG_SYNTH_ALL3},
         {},["RF-EQ-001","RF-OBS-001","RF-DISC-001"]),
        # source-only propagation: all three syntheses clean, but all three specialists fired → still fires
        ("Strong Buy","2026-07-24",
         {"earnings":EQ_SYNTH_CLEAN,"balance-sheet-survival":OBS_SYNTH_CLEAN,"management-governance":MG_SYNTH_CLEAN},
         {"earnings":EQ_SPEC_BOTH,"balance-sheet-survival":OBS_SPEC_1},
         ["RF-EQ-001","RF-EQ-002","RF-OBS-001"]),
        # business-model alone: 2 distinct tags (RF-DISQ-001, RF-RFS-001) but ONE module → below module
        # threshold, pass regardless of conviction (mirrors the earnings-alone case above)
        ("Strong Buy","2026-07-24",{"business-model":BM_SYNTH_BOTH},{},[]),
        # business-model's one tag (RF-DISQ-001) + earnings' two tags (RF-EQ-001/002) = 3 distinct tags
        # across 2 distinct modules + conviction → fire (proves business-model now counts toward the mosaic)
        ("Strong Buy","2026-07-24",
         {"earnings":EQ_SYNTH_BOTH,"business-model":BM_SYNTH_DISQ1},{},
         ["RF-EQ-001","RF-EQ-002","RF-DISQ-001"]),
        # business-model negated (RF-DISQ-001 not triggered) + earnings' two tags → still only 2 distinct
        # fired tags, 1 module → pass (negation must not count, same as the earnings negation case above)
        ("Strong Buy","2026-07-24",
         {"earnings":EQ_SYNTH_BOTH,"business-model":BM_SYNTH_NEG},{},[]),
        # business-model source-only propagation: synthesis clean, but the COMBINED 01_+12_ specialist
        # text fired both tags → business-model alone still only 1 module, so pair with balance-sheet-
        # survival's specialist-only fire to cross the module threshold: 3 distinct tags, 2 modules → fire
        ("Buy","2026-07-24",
         {"business-model":BM_SYNTH_CLEAN,"balance-sheet-survival":OBS_SYNTH_CLEAN},
         {"business-model":BM_SPEC_BOTH,"balance-sheet-survival":OBS_SPEC_1},
         ["RF-DISQ-001","RF-RFS-001","RF-OBS-001"]),
        # clean everywhere + conviction → pass
        ("Strong Buy","2026-07-24",
         {"earnings":EQ_SYNTH_CLEAN,"balance-sheet-survival":OBS_SYNTH_CLEAN,"management-governance":MG_SYNTH_CLEAN},
         {},[]),
    ]
    aqbad=0
    for dec_,dt_,synth_,spec_,exp in aqcases:
        got=AQ(dec_,dt_,synth_,spec_)
        if exp is None:
            ok=(got is None)
        elif isinstance(exp,list) and not exp:
            ok=(isinstance(got,list) and len(got)==0)
        else:
            # AQ returns ONE combined violation string naming every fired tag (unlike AD's per-filter
            # violations) — every expected tag must appear SOMEWHERE among got's string(s), not one
            # violation per tag.
            ok=(isinstance(got,list) and len(got)>=1 and all(any(tag in v for v in got) for tag in exp))
        if not ok: aqbad+=1
        print(f"  [{'ok' if ok else 'XX'}] AQ({dec_!r},{dt_!r},synth_keys={sorted(synth_.keys())!r},spec_keys={sorted(spec_.keys())!r}) -> {got}"
              +("" if ok else f"  EXPECTED exp={exp}"))
    bad+=aqbad
    # check AG — Phase 6 calibration-feedback gate (DECISION_LEDGER.md §18). No committed run reaches
    # AG_DATE, so drive every branch here: no-summary / pre-data / checked / applied, each matched or
    # mismatched against calibration_feedback, plus the malformed-status and applied/checked_no_action
    # internal-consistency branches.
    AG=eval_ag_calibration_feedback_gate
    CS_PREDATA={"verdict":"Pre-data — awaits resolved reviews."}
    CS_REAL={"verdict":"Emerging — 12 resolved forecasts."}
    CS_REAL_ERRTAX={"verdict":"Emerging — 12 resolved forecasts.","error_taxonomy_distribution":{"bad extraction":6,"timing error":2,"missing data":1}}
    # Pre-data OVERALL verdict (module/forecast-type/thesis-type slices below their own floor) but the
    # error-taxonomy tally already has a leading category — the exact early-data scenario Codex flagged
    # (r3671892072 / P1): calibrate.md's own narration says this tally is "never gated by the floor."
    CS_PREDATA_ERRTAX={"verdict":"Pre-data — awaits resolved reviews.","error_taxonomy_distribution":{"bad extraction":5}}
    # A single leading category (only "bad extraction"), used to test that a flagged category NOT among
    # the summary's actual leading categories ("timing error", count 1, below the >=2 floor) is rejected
    # as a traceable trigger rather than accepted at face value.
    CS_REAL_ERRTAX2={"verdict":"Emerging — 12 resolved forecasts.","error_taxonomy_distribution":{"bad extraction":5,"timing error":1}}
    # errtax_gate applies but NO category is currently leading (both counts < 2) — used to test that
    # error_defense_evidence is still required present (as {}), not skipped just because lec is empty.
    CS_REAL_ERRTAX_CLEAN={"verdict":"Emerging — 12 resolved forecasts.","error_taxonomy_distribution":{"bad extraction":1,"timing error":1}}
    CF_NA={"status":"not_available","haircut_points":0,"modules_flagged":[],"rationale":"no calibration summary exists yet"}
    CF_PD={"status":"pre_data","haircut_points":0,"modules_flagged":[],"rationale":"calibration summary is pre-data"}
    CF_CHECKED={"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"rationale":"checked; no module flagged"}
    CF_APPLIED={"status":"applied","haircut_points":8,"modules_flagged":["valuation"],"rationale":"valuation brier=0.31"}
    DEF_EXTRACT="verify-evidence audit (analyses/T_D/verify_evidence/verification_report.json) found 0 unverified Level 4-5 citations across 41 checked claims"
    DEF_TIMING="catalyst-calendar cross-check confirmed every forecast_ledger date falls inside the confirmed 12-month catalyst window"
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
        ("2026-07-06",CS_REAL,{"status":"applied","haircut_points":0,"modules_flagged":["valuation"],"rationale":"x"},["fixed 8-point constant"]),
        # Regression (Codex r3635961174): 'applied' must carry EXACTLY the fixed 8-point haircut, not any
        # positive value — DECISION_LEDGER.md §18 line 699 ("the fixed constant (8)") + line 679 ("a single,
        # fixed 8-point confidence haircut ... one bounded, auditable constant"). A record with hp=1 records a
        # smaller penalty than the doctrine mandates and must fail the gate.
        ("2026-07-06",CS_REAL,{"status":"applied","haircut_points":1,"modules_flagged":["valuation"],"rationale":"x"},["fixed 8-point constant"]),
        ("2026-07-06",CS_REAL,{"status":"applied","haircut_points":8,"modules_flagged":[],"rationale":"x"},["empty/not a list"]),
        ("2026-07-06",CS_REAL,{"status":"checked_no_action","haircut_points":0,"modules_flagged":["valuation"],"rationale":"x"},["non-empty"]),
        # malformed status
        ("2026-07-06",CS_REAL,{"status":"maybe","haircut_points":0,"modules_flagged":[],"rationale":"x"},["not one of"]),
        ("2026-07-06",CS_REAL,{},["not one of"]),
        # forecast-type extension (AG_FTYPE_DATE=2026-07-23): calibration_by_forecast_type must now be
        # able to trigger "applied" on its own, independent of modules_flagged — the exact gap this
        # fix closes (calibrate.py computed this slice since Phase 4; nothing consumed it until now).
        ("2026-07-23",CS_REAL,{"status":"applied","haircut_points":8,"modules_flagged":[],"flagged_forecast_types":["catalyst_or_estimate_revision"],"rationale":"catalyst_or_estimate_revision brier=0.29"},[]),
        ("2026-07-23",CS_REAL,{"status":"applied","haircut_points":8,"modules_flagged":["valuation"],"flagged_forecast_types":[],"rationale":"valuation brier=0.31"},[]),
        ("2026-07-23",CS_REAL,{"status":"applied","haircut_points":8,"modules_flagged":[],"flagged_forecast_types":[],"rationale":"x"},["none of","modules_flagged","flagged_forecast_types","traceable"]),
        ("2026-07-23",CS_REAL,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":["revenue"],"rationale":"x"},["flagged_forecast_types","non-empty"]),
        # pre-fix date: old rule still applies verbatim — a non-empty flagged_forecast_types cannot
        # substitute for modules_flagged before the extension's own rollout date.
        ("2026-07-06",CS_REAL,{"status":"applied","haircut_points":8,"modules_flagged":[],"flagged_forecast_types":["revenue"],"rationale":"x"},["empty/not a list"]),
        # thesis-type extension (AG_TTYPE_DATE=2026-07-27): calibration_by_thesis_type must now be able
        # to trigger "applied" on its own, independent of modules_flagged/flagged_forecast_types — the
        # twin gap this fix closes (calibrate.py never computed this slice at all until now).
        ("2026-07-27",CS_REAL,{"status":"applied","haircut_points":8,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":["Governance turnaround"],"rationale":"Governance turnaround brier=0.30"},[]),
        ("2026-07-27",CS_REAL,{"status":"applied","haircut_points":8,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],"rationale":"x"},["none of","flagged_thesis_types","traceable"]),
        ("2026-07-27",CS_REAL,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":["Governance turnaround"],"rationale":"x"},["flagged_thesis_types","non-empty"]),
        # 'checked_no_action' must PROVE the thesis-type slice ran: a present-and-empty list passes, an
        # ABSENT field fails on/after AG_TTYPE_DATE (DECISION_LEDGER.md §18 "must carry an empty
        # flagged_thesis_types"). Without this, a synthesizer that never ran the slice is indistinguishable
        # from one that ran it clean — the silent skip the whole gate exists to prevent.
        ("2026-07-27",CS_REAL,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],"rationale":"clean on all three slices"},[]),
        ("2026-07-27",CS_REAL,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":[],"rationale":"x"},["flagged_thesis_types","missing/not a list"]),
        ("2026-07-27",CS_REAL,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":None,"rationale":"x"},["flagged_thesis_types","missing/not a list"]),
        # backward-compatible: BEFORE the gate date the absent field is still fine (historical records)
        ("2026-07-26",CS_REAL,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":[],"rationale":"x"},[]),
        # pre-ttype-fix date: a non-empty flagged_thesis_types cannot substitute for modules_flagged /
        # flagged_forecast_types before AG_TTYPE_DATE — the field is simply not consulted yet.
        ("2026-07-23",CS_REAL,{"status":"applied","haircut_points":8,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":["Governance turnaround"],"rationale":"x"},["none of","modules_flagged","flagged_forecast_types","traceable"]),
        # error-taxonomy extension (AG_ERRTAX_DATE=2026-07-29): calibration_by_thesis_type's twin gap, one
        # tier down the stack — error_taxonomy_distribution is a flat, standing tally (no per-run value to
        # match), so the trigger is "every leading category (count >= 2) got a concrete defense or an
        # admitted absence", not a slice lookup. CS_REAL_ERRTAX carries two leading categories.
        ("2026-07-29",CS_REAL_ERRTAX,{"status":"applied","haircut_points":8,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],
          "leading_error_categories_flagged":["bad extraction"],
          "error_defense_evidence":{"bad extraction":"no defense evidence found","timing error":DEF_TIMING},"rationale":"bad extraction: no defense evidence found"},[]),
        # applied but none of the four lists is non-empty (including the new 4th) — still not traceable,
        # even though error_defense_evidence itself is fully consistent (both categories genuinely defended).
        ("2026-07-29",CS_REAL_ERRTAX,{"status":"applied","haircut_points":8,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],
          "leading_error_categories_flagged":[],
          "error_defense_evidence":{"bad extraction":DEF_EXTRACT,"timing error":DEF_TIMING},"rationale":"x"},
          ["none of","leading_error_categories_flagged","traceable"]),
        ("2026-07-29",CS_REAL_ERRTAX,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],
          "leading_error_categories_flagged":["bad extraction"],
          "error_defense_evidence":{"bad extraction":"no defense evidence found","timing error":DEF_TIMING},"rationale":"x"},
          ["leading_error_categories_flagged","non-empty"]),
        # 'checked_no_action' must PROVE the error-taxonomy slice ran, same PRESENCE reasoning as thesis-type.
        ("2026-07-29",CS_REAL_ERRTAX,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],
          "error_defense_evidence":{"bad extraction":DEF_EXTRACT,"timing error":DEF_TIMING},"rationale":"x"},
          ["leading_error_categories_flagged","missing/not a list"]),
        # error_defense_evidence missing entirely while leading categories exist
        ("2026-07-29",CS_REAL_ERRTAX,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],
          "leading_error_categories_flagged":[],"rationale":"x"},
          ["error_defense_evidence","missing/not an object"]),
        # a vague, uncited defense (< 20 chars) is indistinguishable from having none and must be flagged
        ("2026-07-29",CS_REAL_ERRTAX,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],
          "leading_error_categories_flagged":[],
          "error_defense_evidence":{"bad extraction":"n/a","timing error":DEF_TIMING},"rationale":"x"},
          ["not a concrete, non-trivial defense statement"]),
        # an admitted 'no defense evidence found' MUST be flagged — an honest admission left off the flag
        # list would let the haircut trigger be silently dodged.
        ("2026-07-29",CS_REAL_ERRTAX,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],
          "leading_error_categories_flagged":[],
          "error_defense_evidence":{"bad extraction":"no defense evidence found","timing error":DEF_TIMING},"rationale":"x"},
          ["is not in leading_error_categories_flagged","must be flagged"]),
        # the inverse contradiction — flagged as no-defense while the record also claims a real one
        ("2026-07-29",CS_REAL_ERRTAX,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],
          "leading_error_categories_flagged":["bad extraction"],
          "error_defense_evidence":{"bad extraction":DEF_EXTRACT,"timing error":DEF_TIMING},"rationale":"x"},
          ["is not the literal","no defense evidence found"]),
        # the fully clean, correctly-completed case: both leading categories genuinely defended, nothing
        # flagged — proves the gate does not false-positive on a properly done check.
        ("2026-07-29",CS_REAL_ERRTAX,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],
          "leading_error_categories_flagged":[],
          "error_defense_evidence":{"bad extraction":DEF_EXTRACT,"timing error":DEF_TIMING},"rationale":"clean on all four checks"},[]),
        # backward-compatible: BEFORE AG_ERRTAX_DATE, the two new fields may be absent even though the
        # as-of summary already carries leading categories (historical records predate the gate).
        ("2026-07-28",CS_REAL_ERRTAX,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[]},[]),
        # pre-errtax-fix date: a non-empty leading_error_categories_flagged cannot substitute for the other
        # three lists before AG_ERRTAX_DATE — the field is simply not consulted yet.
        ("2026-07-27",CS_REAL_ERRTAX,{"status":"applied","haircut_points":8,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],
          "leading_error_categories_flagged":["bad extraction"],"rationale":"x"},
          ["none of","traceable"]),
        # ── P1 regression (Codex r3671892072): a Pre-data OVERALL verdict must NOT excuse skipping an
        # already-leading error-taxonomy category — calibrate.md's own narration says the tally is "never
        # gated by the floor." Recording status='pre_data' here (the OLD behavior) must now fail.
        ("2026-07-29",CS_PREDATA_ERRTAX,CF_PD,["expected 'checked_no_action' or 'applied'"]),
        # ...but the run can still resolve cleanly: steps 3-5 stay inapplicable (empty, present), while
        # step 6 independently ran and found the one leading category ("bad extraction") defended.
        ("2026-07-29",CS_PREDATA_ERRTAX,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],
          "leading_error_categories_flagged":[],
          "error_defense_evidence":{"bad extraction":DEF_EXTRACT},"rationale":"Pre-data overall, but 'bad extraction' independently defended per step 6"},[]),
        # ...or it can apply the haircut on the errtax trigger alone, even though the overall summary is
        # Pre-data and every other list is empty.
        ("2026-07-29",CS_PREDATA_ERRTAX,{"status":"applied","haircut_points":8,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],
          "leading_error_categories_flagged":["bad extraction"],
          "error_defense_evidence":{"bad extraction":"no defense evidence found"},"rationale":"Pre-data overall; 'bad extraction' admits no defense"},[]),
        # ── P2 (Gemini r3671874640 / Codex r3671892095): error_defense_evidence is required present (an
        # object, {} at minimum) whenever the errtax gate applies at all — not only when lec is non-empty.
        # Omitting it entirely on a clean run (no leading category) must now fail...
        ("2026-07-29",CS_REAL_ERRTAX_CLEAN,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],"rationale":"x"},
          ["error_defense_evidence","missing/not an object"]),
        # ...but an explicit empty object proves the check ran and passes clean.
        ("2026-07-29",CS_REAL_ERRTAX_CLEAN,{"status":"checked_no_action","haircut_points":0,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],
          "leading_error_categories_flagged":[],
          "error_defense_evidence":{},"rationale":"clean — no leading error-taxonomy category yet"},[]),
        # ── P2 (Codex r3671892083): a non-string entry in leading_error_categories_flagged must be
        # reported as a violation, never crash the whole eval run with a set()-on-unhashable TypeError.
        ("2026-07-29",CS_REAL_ERRTAX,{"status":"applied","haircut_points":8,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],
          "leading_error_categories_flagged":[{"category":"bad extraction"}],
          "error_defense_evidence":{"bad extraction":DEF_EXTRACT,"timing error":DEF_TIMING},"rationale":"x"},
          ["non-string"]),
        # ── P2 (Codex r3671892091): a flagged category that is not among the as-of summary's actual
        # leading categories must be rejected — both as its own violation, and as a non-traceable trigger
        # (it must not substitute for defending, or admitting no defense against, a real leading category).
        ("2026-07-29",CS_REAL_ERRTAX2,{"status":"applied","haircut_points":8,"modules_flagged":[],"flagged_forecast_types":[],"flagged_thesis_types":[],
          "leading_error_categories_flagged":["timing error"],
          "error_defense_evidence":{"bad extraction":DEF_EXTRACT},"rationale":"x"},
          ["not among the as-of summary's actual leading categories","none of","traceable"]),
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
    # Cross-record consistency (Codex r3635961178): calibration_feedback.haircut_points must match the
    # confidence_inputs.calibration_haircut the scorer consumed. Driven with an explicit 4th arg so the
    # cases above keep exercising the confidence_inputs-absent path (older runs → no cross-check). Expected
    # values pinned to DECISION_LEDGER.md §18 (applied ⇒ 8, else ⇒ 0) + confidence.py ConfidenceInputs.
    agci_cases=[  # (decision_date, calibration_summary, calibration_feedback, confidence_inputs, expect)
        # applied, but the scorer got 0 → the recorded §18 haircut never cut conviction (the reported bug)
        ("2026-07-06",CS_REAL,CF_APPLIED,{"calibration_haircut":0},["is not the numeric 8"]),
        # applied and the scorer got 8 → consistent, no violation
        ("2026-07-06",CS_REAL,CF_APPLIED,{"calibration_haircut":8},[]),
        # no-action status but the scorer cut 8 anyway → the inverse inconsistency
        ("2026-07-06",CS_REAL,CF_CHECKED,{"calibration_haircut":8},["did not record"]),
        # no-action status with a 0 scorer input → consistent
        ("2026-07-06",CS_REAL,CF_CHECKED,{"calibration_haircut":0},[]),
        # pre_data with a 0 scorer input → consistent (mirrors the committed NHY_2026-07-19 fixture)
        ("2026-07-06",CS_PREDATA,CF_PD,{"calibration_haircut":0},[]),
        # backward-compat: an older run that omits confidence_inputs ENTIRELY → cross-check must NOT fire
        ("2026-07-06",CS_REAL,CF_APPLIED,None,[]),
        # applied + a PRESENT confidence_inputs whose calibration_haircut is null → REJECTED (the scorer
        # would default to 0, leaving conviction uncut; an omitted/null value must not pass — Codex r…)
        ("2026-07-06",CS_REAL,CF_APPLIED,{"calibration_haircut":None},["is not the numeric 8"]),
        # applied + confidence_inputs present but the calibration_haircut key omitted → likewise rejected
        ("2026-07-06",CS_REAL,CF_APPLIED,{"other_input":1},["is not the numeric 8"]),
    ]
    agcibad=0
    for dt_,cs_,cf_,ci_,exp in agci_cases:
        got=AG(dt_,cs_,cf_,ci_)
        if not exp:
            ok=(isinstance(got,list) and len(got)==0)
        else:
            ok=(isinstance(got,list) and len(got)>0 and all(any(s in v for v in got) for s in exp))
        if not ok: agcibad+=1
        print(f"  [{'ok' if ok else 'XX'}] AGci({dt_!r},cf_status={(cf_ or {}).get('status')!r},ci_haircut={(ci_ or {}).get('calibration_haircut') if isinstance(ci_,dict) else ci_!r}) -> {got}"
              +("" if ok else f"  EXPECTED exp={exp}"))
    bad+=agcibad
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
                # The cell renders the FULL sizing_hint.action verbatim, exactly as real runs do
                # (analyses/NHY_2026-07-19), so a truncated cell is caught, not tolerated (Codex r3).
                f"| Understanding /100 | {und} |\n| Conviction /100 | {conv} |\n"
                "| Suggested sizing | monitor only — no position (track opportunity cost) |\n")
    D_TMCV={"expected_return_pct":-4.4,"downside_risk_pct":-81.0,"risk_reward":-0.23,"confidence_score":47,"data_sufficiency_score":68}
    TH_TMCV=_hs_thesis(exp="+4.3% (see §8 Scenario Model)", dr="−19% to −81% depending on Iveco scenario",
                        rr="0.72× upside/downside in base case; binary risk makes this ratio misleading",
                        conf="47", ds="68")
    D_EMAR={"decision":"Buy","expected_return_pct":118.8,"downside_risk_pct":-63.9,"risk_reward":1.9,"confidence_score":52,"data_sufficiency_score":72}
    TH_EMAR=_hs_thesis(exp="+118.8% (probability-weighted; computed — see §14)",
                        dr="+63.9% (bear case AED 20.0 is 64% ABOVE current price AED 12.20 — no loss in bear)",
                        rr="1.9x (reward/bear gap; bear case is above entry, so effective downside is nil)",
                        conf="52", ds="72")
    D_CLEAN={"decision":"Buy","expected_return_pct":-11.5,"downside_risk_pct":-31.0,"risk_reward":-0.37,"confidence_score":46,"data_sufficiency_score":68}
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
        ("2026-07-09", {"decision":"Buy","risk_reward":None,"confidence_score":50}, _hs_thesis(conf="50"), []),  # unset field skipped
        ("2026-07-09", {"decision":"Buy","confidence_score":46.4}, _hs_thesis(conf="46"), []),                    # rounding within tolerance
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
        ("2026-07-11", {"decision":"Watchlist","conviction":62,"analysis_confidence":74,"confidence_score":62,
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
    _SC_R = ("# Thesis\n\n## 2. Headline Scorecard\n\n| Item | Answer |\n|---|---|\n"
             "| Rating | %s |\n| Conviction /100 | 68 |\n| Understanding /100 | 70 |\n"
             # 'Suggested sizing' is a required reader-facing row (synthesizer.md §2), matching _D_R's
             # recorded sizing_hint.action so the Rating-row cases stay isolated to what they test (Codex r3).
             "| Suggested sizing | standard position |\n")
    # Internally CONSISTENT by construction (Codex r-review on the follow-up PR): the earlier fixture used
    # confidence_inputs={}, which ConfidenceInputs() cannot build — so these Rating-row cases were passing
    # only because the re-derivation error was swallowed. Real values, so each case tests the Rating row.
    # scripts/confidence.py: ds=70 + Buy + edge 60 + proof -> conviction 68.0, understanding 70.0.
    _D_R = {"decision":"Buy","conviction":68,"analysis_confidence":70,"confidence_score":68,
            "data_sufficiency_score":70,"edge_score":60,
            "confidence_inputs":{"data_sufficiency":70,"decision":"Buy","edge_score":60,
                                 "edge_proof_present":True},
            "confidence_breakdown":{"base":70,"final":68},
            # scorer-derived for Buy @ conviction 68 — the sizing_hint is reader-facing and is
            # now reconciled against scripts/confidence.py, so a placeholder no longer passes.
            "sizing_hint":{"band":"standard","action":"standard position"}}
    aicases += [
        # Codex: the scorecard's Rating row was never reconciled — check I passes when a Decision: line
        # elsewhere matches, so a contradictory reader-facing Rating slipped through.
        ("2026-07-11", _D_R, _SC_R % "Avoid", ["Headline Scorecard 'Rating'"]),
        ("2026-07-11", _D_R, _SC_R % "Buy", []),                     # matching -> clean
        ("2026-07-11", _D_R, _SC_R % "**Buy**", []),                 # markdown emphasis is the same decision
        ("2026-07-11", _D_R, _SC_R % "Buy — revisit after Q2", []),  # trailing qualifier is still the same decision
        # Codex r4 (P1): a cell that starts with the recorded decision but goes on to NAME a second,
        # different §18 decision is a real contradiction a boundary-only prefix check cannot see — RED on
        # pre-fix code (all three passed clean since each starts with "Buy" followed by a boundary char).
        ("2026-07-11", _D_R, _SC_R % "Buy / Watchlist", ["also names"]),
        ("2026-07-11", _D_R, _SC_R % "Buy (Avoid)", ["also names"]),
        ("2026-07-11", _D_R, _SC_R % "Buy — capped at Watchlist", ["also names"]),
        # ...but a qualifier that merely EXPLAINS the same decision (no second decision word) still passes.
        ("2026-07-11", _D_R, _SC_R % "Buy — capped near-term", []),
        # Codex r5 (P2): "avoid" (and "buy") are ordinary English verbs too, not only §18 decision NAMES —
        # a qualifier that merely USES one in prose must not be mistaken for naming a second rating. RED on
        # the r4 fix's own bare whole-word scan (it flagged "avoid" here as the Avoid decision).
        ("2026-07-11", _D_R, _SC_R % "Buy — avoid chasing after the rally", []),
        # Codex r7 (P2): explicit alternative-conjunctions ("or", "vs", "alternatively") present a second
        # rating just as plainly as a slash — RED on the r5 fix (only slash/parens/cap-phrase were covered).
        ("2026-07-11", _D_R, _SC_R % "Buy or Watchlist", ["also names"]),
        ("2026-07-11", _D_R, _SC_R % "Buy vs Watchlist", ["also names"]),
        ("2026-07-11", _D_R, _SC_R % "Buy, alternatively Watchlist", ["also names"]),
        # Codex r8 (P1): a present Rating row with NO decision of record at all (missing/blank `decision`)
        # was previously skipped entirely — RED on every prior round (the whole Rating block was gated on
        # `isinstance(jdec, str) and jdec.strip()`, so a missing/blank decision just meant "nothing to
        # check", silently passing a run with a reader-facing rating but no recorded decision behind it).
        ("2026-07-11", {**_D_R, "decision":None}, _SC_R % "Buy", ["no decision of record"]),
        ("2026-07-11", {k:v for k,v in _D_R.items() if k != "decision"}, _SC_R % "Buy", ["no decision of record"]),
        # Codex: conviction must be re-derivable from the recorded inputs, not merely well-typed.
        ("2026-07-11", {**_D_R, "decision":"Strong Buy", "conviction":80, "analysis_confidence":80,
                        "confidence_score":80,
                        "confidence_inputs":{"data_sufficiency":20,"decision":"Strong Buy",
                                             "edge_score":0,"edge_proof_present":False}},
         _SC_R % "Strong Buy", ["cannot be re-derived"]),
    ]
    aicases += [
        # r-review: a bare startswith let "Buyback candidate" satisfy decision "Buy".
        ("2026-07-11", _D_R, _SC_R % "Buyback candidate", ["Headline Scorecard 'Rating'"]),
        ("2026-07-11", _D_R, _SC_R % "Buy-and-hold", ["Headline Scorecard 'Rating'"]),
        # r-review: unconstructable scorer inputs must FAIL CLOSED — ConfidenceInputs() raises without
        # data_sufficiency, and swallowing that let a hand-written conviction ship with no basis.
        ("2026-07-11", {**_D_R, "confidence_inputs":{}}, _SC_R % "Buy", ["cannot reconstruct"]),
        # r-review: inputs that contradict the record's own authoritative values are circular.
        ("2026-07-11", {**_D_R, "data_sufficiency_score":30,
                        "confidence_inputs":{"data_sufficiency":100,"decision":"Buy"}},
         _SC_R % "Buy", ["contradicts"]),
        # r-review: a scorer WARNING (an ignored modules_absent key = an unapplied cap) must surface even
        # when the arithmetic itself lands inside the tolerance.
        ("2026-07-11", {**_D_R, "confidence_inputs":{"data_sufficiency":70,"decision":"Buy",
                                                     "edge_score":60,"edge_proof_present":True,
                                                     "modules_absent":["valuaton"]}},
         _SC_R % "Buy", ["flagged the recorded inputs"]),
    ]
    # Codex r2 (P1): the reader-facing 'Suggested sizing' scorecard cell must reconcile with
    # sizing_hint.action (synthesizer.md §2). _SC_SZ carries a Suggested sizing row; _D_R records
    # sizing_hint.action='standard position'. A mismatched cell must FAIL (RED on pre-fix, which only
    # validated the JSON sizing_hint); a matching cell (incl. a trailing gloss) stays clean.
    _SC_SZ = ("# Thesis\n\n## 2. Headline Scorecard\n\n| Item | Answer |\n|---|---|\n"
              "| Rating | Buy |\n| Conviction /100 | 68 |\n| Understanding /100 | 70 |\n"
              "| Suggested sizing | %s |\n")
    # Codex r2 (P2): an underscore-emphasised Rating row (`| __Rating__ | Buy |`) is PRESENT and must be
    # found — pre-fix _hs_cell_exact matched only `*`, so it wrongly reported the row absent.
    _SC_UND = ("# Thesis\n\n## 2. Headline Scorecard\n\n| Item | Answer |\n|---|---|\n"
               "| __Rating__ | Buy |\n| Conviction /100 | 68 |\n| Understanding /100 | 70 |\n"
               "| Suggested sizing | standard position |\n")
    aicases += [
        ("2026-07-11", _D_R, _SC_SZ % "full position candidate", ["Suggested sizing"]),   # mismatch -> FAIL
        ("2026-07-11", _D_R, _SC_SZ % "standard position", []),                           # match -> clean
        ("2026-07-11", _D_R, _SC_SZ % "standard position (2-4% NAV)", []),                # trailing gloss -> clean
        ("2026-07-11", _D_R, _SC_UND, []),                                                # underscore Rating found & matches
        # Codex r3 (P1): an ABSENT 'Suggested sizing' row is a violation — the row is required, so a valid
        # sizing_hint with no reader-facing cell must FAIL (synthesizer.md §2). RED on pre-fix (absent → skip).
        ("2026-07-11", _D_R, _SC_SZ.replace("| Suggested sizing | %s |\n", ""),
         ["Suggested sizing", "required"]),
        # Codex r3 (P1): a cell that is a mere PREFIX of the recorded action ("standard" for "standard
        # position", or "s") is a truncated/materially-different size and must FAIL. RED on pre-fix, whose
        # reverse-prefix `_b.startswith(_a)` accepted any prefix as clean.
        ("2026-07-11", _D_R, _SC_SZ % "standard", ["Suggested sizing"]),
        ("2026-07-11", _D_R, _SC_SZ % "s", ["Suggested sizing"]),
        # Codex r5 (P1): a PRESENT but BLANK cell ("| Suggested sizing | |") must be a violation, same as an
        # absent row — `_hs_cell` returns '' (not None) for a blank cell, so the earlier `is None`-only check
        # let it skip reconciliation entirely. RED on the r3 fix (blank cell → no violation).
        ("2026-07-11", _D_R, _SC_SZ % "", ["Suggested sizing"]),
        # Codex r6 (P1): the cell leads with the FULL recorded action but the permitted trailing gloss goes
        # on to name ANOTHER of the scorer's own possible sizing actions — a genuine contradiction, the
        # sizing twin of the r4 Rating-qualifier fix. RED on the r3 fix (any boundary-delimited suffix passed).
        ("2026-07-11", _D_R, _SC_SZ % "standard position / full position candidate", ["also names"]),
        # ...but a genuine non-contradictory gloss following the full action still passes.
        ("2026-07-11", _D_R, _SC_SZ % "standard position (sized per the model portfolio)", []),
        # Codex r7 (P2): a NEGATED mention of another action ("standard position, not a full position
        # candidate") reinforces the recorded size rather than contradicting it. RED on the r6 fix (any
        # unnegated OR negated mention of another action was flagged the same way).
        ("2026-07-11", _D_R, _SC_SZ % "standard position, not a full position candidate", []),
        # Codex r8 (P1): the negation lookback must be scoped to the SAME clause as the alternative — "not"
        # negates "capped" in the PRECEDING clause here, not the alternative action in the next one, so the
        # full unnegated alternative must still be flagged. RED on the r7 fix (any nearby "not" within a raw
        # character window silently cleared it, regardless of which clause it was actually negating).
        ("2026-07-11", _D_R, _SC_SZ % "standard position, not capped; full position candidate", ["also names"]),
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
    # Zero-count denial (Codex): a cap cell can deny a Critical with a COUNT ("Critical: 0"), not only
    # with the word "no" — it reads identically to a reader and must fire the same way.
    TH_AK_ZERO = _hs_thesis(exp="-16.1%", dr="-38.7%", rr="-0.42x", conf="57", ds="65").replace(
        "| Data sufficiency /100 | 65 |\n",
        "| Data sufficiency /100 | 65 |\n| Rating cap, if any | Critical: 0 — no verdict-lock applies |\n")
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
    akcases += [
        # Codex: a ZERO-COUNT cap cell denies the module's Critical just as "no Critical" does.
        ("2026-07-11", {"red_flags":RF_TWO_CRITICAL,"decision":"Watchlist"}, TH_AK_ZERO,
         {"earnings":MT_EARNINGS_2CRIT}, ["denies a Critical red flag"]),
        # ...but a truthful NONZERO affirmation is not a denial (the affirm guard must survive).
        ("2026-07-11", {"red_flags":RF_TWO_CRITICAL,"decision":"Watchlist"}, TH_AK_CLEAN,
         {"earnings":MT_EARNINGS_2CRIT}, []),
        # Codex: §13/§18 — a Critical flag caps the rating at Watchlist-or-lower. Recording it is not enough.
        ("2026-07-11", {"red_flags":RF_TWO_CRITICAL,"decision":"Buy"}, TH_AK_CLEAN,
         {"earnings":MT_EARNINGS_2CRIT}, ["exceeds the 'Watchlist' cap"]),
        ("2026-07-11", {"red_flags":RF_TWO_CRITICAL,"decision":"Strong Buy"}, TH_AK_CLEAN,
         {"earnings":MT_EARNINGS_2CRIT}, ["exceeds the 'Watchlist' cap"]),
        ("2026-07-11", {"red_flags":RF_TWO_CRITICAL,"decision":"Avoid"}, TH_AK_CLEAN,
         {"earnings":MT_EARNINGS_2CRIT}, []),   # at/below the ceiling -> compliant
    ]
    akcases += [
        # r-review: a negated cap phrase must NOT affirm — "0 critical flags; no cap applies" would
        # otherwise cancel the zero-count denial via the `critical ... cap` alternative.
        ("2026-07-11", {"red_flags":RF_TWO_CRITICAL,"decision":"Watchlist",
                        "rating_cap":"0 critical flags; no cap applies"}, TH_AK_CLEAN,
         {"earnings":MT_EARNINGS_2CRIT}, ["denies a Critical red flag"]),
        # r-review: §13's "unless explicitly resolved by primary evidence" exception must lift the cap.
        # (both Criticals present so the COUNT test is satisfied — this case isolates the CAP exception)
        ("2026-07-11", {"red_flags":[{"id":"RF-ACC-001","severity":"Critical","description":"x","resolved":True},
                                     {"id":"RF-ACC-002","severity":"Critical","description":"y","resolved":True}],
                        "decision":"Buy"}, TH_AK_CLEAN,
         {"earnings":MT_EARNINGS_2CRIT}, []),
        # r2: resolution is evaluated PER FINDING — a blanket rating_cap phrase cannot be attributed to a
        # specific Critical, so it no longer lifts the ceiling on its own (Codex).
        ("2026-07-11", {"red_flags":RF_TWO_CRITICAL,"decision":"Buy",
                        "rating_cap":"Critical finding resolved by the audited FY25 filing; cap lifted"},
         TH_AK_CLEAN, {"earnings":MT_EARNINGS_2CRIT}, ["exceeds the 'Watchlist' cap"]),
        # ...and one resolved Critical does not lift the cap while another stands.
        ("2026-07-11", {"red_flags":[{"id":"RF-ACC-001","severity":"Critical","description":"x","resolved":True},
                                     {"id":"RF-ACC-002","severity":"Critical","description":"y"}],
                        "decision":"Buy"}, TH_AK_CLEAN, {"earnings":MT_EARNINGS_2CRIT},
         ["exceeds the 'Watchlist' cap"]),
        # r2: the ceiling attaches to the FLAG, so it applies with no recognised module count at all.
        ("2026-07-11", {"red_flags":RF_TWO_CRITICAL,"decision":"Strong Buy"}, TH_AK_CLEAN, {},
         ["exceeds the 'Watchlist' cap"]),
        # Codex r2 (P1): a Critical whose status literally reads "not resolved" is NOT resolved — the
        # substring "resolved" must not lift the §13 cap (RED on pre-fix code, which matched it as resolved).
        ("2026-07-11", {"red_flags":[{"id":"RF-ACC-001","severity":"Critical","description":"x",
                                      "status":"not resolved"}],"decision":"Buy"}, TH_AK_CLEAN, {},
         ["exceeds the 'Watchlist' cap"]),
        ("2026-07-11", {"red_flags":[{"id":"RF-ACC-001","severity":"Critical","description":"x",
                                      "resolution":"still unresolved pending the FY25 audit"}],"decision":"Buy"},
         TH_AK_CLEAN, {}, ["exceeds the 'Watchlist' cap"]),
        # ...but genuine resolution wording still lifts it (the negation guard must not over-reject).
        ("2026-07-11", {"red_flags":[{"id":"RF-ACC-001","severity":"Critical","description":"x",
                                      "resolution":"resolved by the audited FY25 filing"}],"decision":"Buy"},
         TH_AK_CLEAN, {}, []),
    ]
    akcases += [
        # Codex r3 (P2): a blanket rating_cap resolution IS accepted when there is exactly ONE Critical —
        # attribution is unambiguous, so "resolved ... cap lifted" names that one flag and lifts the §13
        # cap. RED on pre-fix, which never consulted rating_cap at all → the single Critical stayed
        # unresolved → false "exceeds the 'Watchlist' cap". Pinned to CLAUDE.md §13 (resolved by primary
        # evidence). (The two-Critical version above stays a violation — ambiguous — proving it is scoped.)
        ("2026-07-11", {"red_flags":[{"id":"RF-ACC-001","severity":"Critical","description":"x"}],
                        "decision":"Buy",
                        "rating_cap":"Critical finding resolved by the audited FY25 filing; cap lifted"},
         TH_AK_CLEAN, {}, []),
        # Codex r3 (P2): resolution negation is scoped to its OWN field — a genuine
        # resolution:"resolved by the audited FY25 filing" must NOT be vetoed by historical wording
        # ("formerly unresolved") sitting in a DIFFERENT field (description). RED on pre-fix, which joined
        # the fields and let the cross-field "unresolved" negate the resolution → false "exceeds ... cap".
        ("2026-07-11", {"red_flags":[{"id":"RF-ACC-001","severity":"Critical",
                                      "resolution":"resolved by the audited FY25 filing",
                                      "description":"formerly unresolved; now closed"}],"decision":"Buy"},
         TH_AK_CLEAN, {}, []),
        # Codex r3 (P1): the rating-cap DENIAL check must run against a RECORD-LEVEL Critical even when NO
        # module declared one, BEFORE the "no module declared" early return. A Watchlist with a recorded
        # Critical and rating_cap="no Critical red flag" contradicts its own red_flags. RED on pre-fix,
        # where the denial check sat AFTER `if not declared: return det` → skipped → clean. §13/§18.
        ("2026-07-11", {"red_flags":RF_TWO_CRITICAL,"decision":"Watchlist",
                        "rating_cap":"no Critical red flag"}, TH_AK_CLEAN, {},
         ["denies a Critical red flag"]),
        # Codex r6 (P2): resolution negation must be scoped to its OWN CLAUSE, not merely its own field — a
        # SINGLE free-text field can carry both historical negation and a later genuine resolution
        # ("formerly unresolved; resolved by the audited FY25 filing"). RED on the r3 per-field fix (the
        # unscoped 'unresolved' alternative still vetoed the whole field regardless of clause).
        ("2026-07-11", {"red_flags":[{"id":"RF-ACC-001","severity":"Critical",
                                      "resolution":"formerly unresolved; resolved by the audited FY25 filing"}],
                        "decision":"Buy"}, TH_AK_CLEAN, {}, []),
        # Codex r6 (P2): the record-level Rating-cap DENIAL check (added r3) must not fire when the record's
        # own Critical is already explicitly resolved — a truthful cap describing that state is not a
        # contradiction. RED on the r3 fix (denial check ran unconditionally, ignoring resolution).
        ("2026-07-11", {"red_flags":[{"id":"RF-ACC-001","severity":"Critical","resolved":True}],
                        "decision":"Buy",
                        "rating_cap":"No unresolved Critical flags; cap lifted after the audited FY25 filing"},
         TH_AK_CLEAN, {}, []),
        # Codex r6 (P2): a genuine affirmation's subject ("Critical earnings flags") and predicate ("cap the
        # rating") can sit in ADJACENT clauses separated by a semicolon used only for sentence rhythm, with a
        # correctly-scoped denial about a DIFFERENT module in a third clause. RED on the r2 clause-scoping
        # fix (the ';' exclusion needed to stop "Critical: 0; High flags cap the rating" also discarded this
        # genuine case, so the governance denial fired as if the earnings cap were never affirmed).
        ("2026-07-11", {"red_flags":RF_TWO_CRITICAL,"decision":"Watchlist",
                        "rating_cap":"Critical earnings flags; therefore cap the rating; no Critical governance red flag"},
         TH_AK_CLEAN, {"earnings":MT_EARNINGS_2CRIT}, []),
        # ...but the ORIGINAL false-affirm this scoping guards against must still be rejected: a cap phrase
        # naming a DIFFERENT severity in the adjacent clause is not an affirmation of Critical.
        ("2026-07-11", {"red_flags":RF_TWO_CRITICAL,"decision":"Watchlist",
                        "rating_cap":"Critical: 0; High flags cap the rating"},
         TH_AK_CLEAN, {"earnings":MT_EARNINGS_2CRIT}, ["denies a Critical red flag"]),
        # Codex r7 (P1): the adjacent-clause affirm (r6) must not fire when the PRECEDING clause is ITSELF a
        # zero-count denial — "Critical: 0; Watchlist cap applies for weak edge" must still be treated as
        # denying the Critical. RED on the r6 fix (any clause containing the bare word "critical" — including
        # one that denies it — qualified as the affirmation's subject).
        ("2026-07-11", {"red_flags":[{"id":"RF-ACC-001","severity":"Critical","description":"x"}],
                        "decision":"Buy",
                        "rating_cap":"Critical: 0; Watchlist cap applies for weak edge"},
         TH_AK_CLEAN, {}, ["exceeds the 'Watchlist' cap"]),
        # Codex r7 (P2): resolution excuses a cap that DESCRIBES the resolved state, but not an UNQUALIFIED
        # denial with no resolution wording at all — that still erases the flag's historical existence, which
        # resolving it does not do. RED on the r6 fix (the whole denial check was skipped whenever the
        # record's Critical was resolved, regardless of what the cap text itself said).
        ("2026-07-11", {"red_flags":[{"id":"RF-ACC-001","severity":"Critical","resolved":True}],
                        "decision":"Buy","rating_cap":"no Critical red flag"},
         TH_AK_CLEAN, {}, ["denies a Critical red flag"]),
        # Codex r8 (P2): the resolved-flag denial exemption (r7) used a bare unscoped `_AK_RESOLVED.search`,
        # so "no Critical red flag; resolution pending" was wrongly exempted — "resolution" matched even
        # though the SAME clause says "pending" (negated). Now uses the clause-scoped `_ak_resolved_in`
        # (the same helper `_ak_resolution_stated` uses) so a negated resolution clause doesn't exempt it.
        ("2026-07-11", {"red_flags":[{"id":"RF-ACC-001","severity":"Critical","resolved":True}],
                        "decision":"Buy","rating_cap":"no Critical red flag; resolution pending"},
         TH_AK_CLEAN, {}, ["denies a Critical red flag"]),
        # Codex r8 (P2): a falsy but non-string rating_cap (0, False, [], {}) was skipped by a bare `not txt`
        # before the non-string check could run, silently accepting a malformed field. RED on every prior
        # round (the falsy-skip predates round 3's record-level move).
        ("2026-07-11", {"red_flags":[{"id":"RF-ACC-001","severity":"Critical","description":"x"}],
                        "decision":"Watchlist","rating_cap":0},
         TH_AK_CLEAN, {}, ["is not a string"]),
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

    # check AR — bull-case sanity (§8, mirror of AM). A Short Candidate whose bull price target is at/below entry has no loss branch for the short.
    arbad=0
    _SCEN_SHORT_LOSS=[{"label":"Bull","price_target":22.0},{"label":"Base","price_target":15.0}]      # bull above entry -> real squeeze/loss-to-short
    _SCEN_SHORT_NOLOSS=[{"label":"Bull case","price_target":11.0},{"label":"Base","price_target":9.0}] # bull at/below entry -> no real upside branch
    arcases=[  # (decision_date, decision, scenarios, entry_price, expect)
        ("2026-07-24","Short Candidate",_SCEN_SHORT_NOLOSS,12.2,None),                        # predates AR_DATE → N/A
        ("2026-07-25","Watchlist",_SCEN_SHORT_NOLOSS,12.2,None),                              # not a Short Candidate → N/A
        ("2026-07-25","Short Candidate",_SCEN_SHORT_LOSS,12.2,[]),                            # real upside/squeeze branch → pass
        ("2026-07-25","Short Candidate",_SCEN_SHORT_NOLOSS,12.2,["no genuine upside/squeeze branch"]), # bull not above entry → FAIL
        ("2026-07-25","Short Candidate",[{"label":"Base","price_target":9.0}],12.2,None),     # no bull scenario → N/A
        ("2026-07-25","Short Candidate",_SCEN_SHORT_LOSS,None,None),                          # no entry price → N/A
    ]
    for dt_,dec_,sc_,ep_,exp in arcases:
        got=eval_ar_short_bull_case_sanity(dt_,dec_,sc_,ep_)
        if exp is None: ok=(got is None)
        elif not exp: ok=(isinstance(got,list) and len(got)==0)
        else: ok=(isinstance(got,list) and len(got)>0 and all(any(s in v for v in got) for s in exp))
        if not ok: arbad+=1
        print(f"  [{'ok' if ok else 'XX'}] AR({dt_!r},{dec_!r}) -> {got}"+("" if ok else f"  EXPECTED {exp}"))
    bad+=arbad

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
    # Binary EVENT forecasts — settleable, and pre-fix all six failed. The TSLA_2026-07-25 / UBER_2026-08-06 cases.
    _fc_mirrordate={"confirmation_trigger":"Signed replacement/extension disclosed in an 8-K or 10-Q by 2026-08-30","falsification_trigger":"No such disclosure by 2026-08-30","time_window":"By 2026-08-30"}
    _fc_mirrorwin={"confirmation_trigger":"8-K or 10-Q discloses a newly probable tranche and associated SBC step-up","falsification_trigger":"No new tranche becomes probable within the window","time_window":"By 2026-08-30"}
    _fc_docket={"confirmation_trigger":"Court denies the motion, in whole or material part, per the docket","falsification_trigger":"Court grants the motion (dismissal, with or without prejudice), OR no ruling issued within the window","time_window":"By 2026-08-30"}
    _fc_disclosed={"confirmation_trigger":"Deal closes within H2 2026 and no covenant breach is disclosed","falsification_trigger":"Deal slips past 2026-08-30, is blocked, or a covenant waiver is disclosed within four quarters","time_window":"By 2026-08-30"}
    # The mirror rule must NOT rescue these: a negation with no back-reference marker (r_onesided, unchanged),
    # and a mirror-shaped falsification whose SIBLING confirmation is itself unresolvable (both halves vague).
    _fc_mirrorvague={"confirmation_trigger":"margin improves","falsification_trigger":"No such improvement by 2026-08-30","time_window":"By 2026-08-30"}
    _fc_mirrorconf={"confirmation_trigger":"No such improvement within the window","falsification_trigger":"margin below 12%","time_window":"By 2026-08-30"}
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
        ("2026-07-18",[_fc_mirrordate],[]),                                    # 'No such disclosure by <date>' mirrors a resolvable 8-K confirmation → pass (TSLA fc[1]/fc[6])
        ("2026-07-18",[_fc_mirrorwin],[]),                                     # '…within the window' mirror, no doc noun of its own → pass (TSLA fc[4])
        ("2026-07-18",[_fc_docket],[]),                                        # a court DOCKET is a settleable primary record → pass (TSLA fc[3])
        ("2026-07-18",[_fc_disclosed],[]),                                     # 'is disclosed' settles like 'is filed' → pass (UBER fc[3])
        ("2026-07-18",[_fc_mirrorvague],["not mechanically resolvable"]),      # mirror shape but the SIBLING confirmation is vague → both halves unresolvable → still FAIL
        ("2026-07-18",[_fc_mirrorconf],["the confirmation trigger"]),          # only the FALSIFICATION may mirror — a negated confirmation is not a positive claim → still FAIL
        ("2026-07-18",5,None),                                                 # malformed (non-list) → N/A, never crash
        ("2026-07-18",None,None),                                              # None ledger → N/A
    ]

    # ---- check AS: a forecast whose window ELAPSED and was never resolved (advisory) ----------------
    _as_open   = {"prediction":"Q2 EBIT $23-25B","status":"open","time_window":"Q2 2026 earnings July 31, 2026"}
    _as_done   = dict(_as_open, status="falsified")
    _as_iso    = {"prediction":"x","status":"open","time_window":"resolves 2026-07-22"}
    _as_month  = {"prediction":"x","status":"open","time_window":"FY2026 full year (confirmed Feb 2027 in annual results)"}
    _as_undate = {"prediction":"x","status":"open","time_window":"the medium term"}
    _as_field  = {"prediction":"x","status":"open","resolves_on":"2026-07-01"}
    # regression fixtures for the two review fixes (each is RED on the pre-fix code, GREEN after):
    _as_baddate = {"prediction":"x","status":"open","time_window":"Feb 30, 2026"}          # invalid calendar date
    _as_baddat2 = {"prediction":"x","status":"open","time_window":"results Sep 31, 2026"}  # Sep has 30 days
    _as_unres   = dict(_as_open, status="unresolved")   # 'unresolved' CONTAINS 'resolved' — must NOT be skipped
    _as_avoid   = dict(_as_open, status="avoid")        # 'avoid' CONTAINS 'void' — must NOT be skipped
    _as_disc    = dict(_as_open, status="disclosed")    # 'disclosed' CONTAINS 'closed' — must NOT be skipped
    ascases=[  # (decision_date, ledger, today, expect: None=N/A, []=nothing due, [substr]=due-with)
        ("2026-07-10",[_as_open],"2026-08-01",["came due 2026-07-31"]),   # the AMZN case — one day after its own test
        ("2026-07-10",[_as_open],"2026-07-31",[]),                        # ON the due date it is not yet overdue
        ("2026-07-10",[_as_open],"2026-07-30",[]),                        # before → nothing owed
        ("2026-07-10",[_as_done],"2026-08-01",[]),                        # already falsified → settled, nothing owed
        ("2026-07-10",[_as_iso],"2026-08-01",["came due 2026-07-22"]),    # a bare ISO date in the window
        ("2026-07-10",[_as_month],"2026-03-01",[]),                       # 'Feb 2027' is far future → not due
        ("2026-07-10",[_as_month],"2027-03-01",["came due 2027-02-28"]),  # a bare month closes at its end
        ("2026-07-10",[_as_undate],"2030-01-01",[]),                      # undateable window → never claimed overdue
        ("2026-07-10",[_as_field],"2026-08-01",["came due 2026-07-01"]),  # an explicit resolves_on field wins
        # BUG1 (invalid-date guard): an impossible calendar date must be UNDATEABLE, never returned/flagged.
        # Pre-fix returned '2026-02-30'/'2026-09-31' and flagged them overdue; §5/§19 — a due date must be real.
        ("2026-07-10",[_as_baddate],"2027-01-01",[]),                     # 'Feb 30, 2026' → undateable, nothing owed
        ("2026-07-10",[_as_baddat2],"2027-01-01",[]),                     # 'Sep 31, 2026' → undateable, nothing owed
        # BUG2 (exact-status, not substring): a status that merely CONTAINS a resolved word is NOT resolved.
        # Pre-fix skipped all three (treated settled) and reported nothing due; §19 — an open forecast past
        # its window must still be flagged. Expect it flagged as due.
        ("2026-07-10",[_as_unres],"2026-08-01",["came due 2026-07-31"]),  # 'unresolved' ⊃ 'resolved' — still open
        ("2026-07-10",[_as_avoid],"2026-08-01",["came due 2026-07-31"]),  # 'avoid' ⊃ 'void' — still open
        ("2026-07-10",[_as_disc],"2026-08-01",["came due 2026-07-31"]),   # 'disclosed' ⊃ 'closed' — still open
        ("2026-07-10",[],"2026-08-01",None),                              # empty ledger → N/A
        ("2026-07-10",5,"2026-08-01",None),                               # malformed → N/A, never crash
        ("2026-07-10",[_as_open],"nonsense",None),                        # unusable clock → N/A
    ]
    for _dd,_fl,_td,_want in ascases:
        got=eval_as_forecast_overdue(_dd,_fl,_td)
        if _want is None:
            ok = got is None
        else:
            ok = got is not None and len(got)==len(_want) and all(any(w in g for g in got) for w in _want)
        print(("  [ok] " if ok else "  [BAD] ")+f"AS({_dd!r},today={_td!r}) -> {got!r} (want {_want!r})")
        if not ok: bad+=1

    # ---- check AW: a kill criterion whose own monitor event ELAPSED and was never checked (advisory) ----
    _aw_open      = {"criterion":"c1","monitor":"FY2026 results release (~March 2027)"}
    _aw_iso       = {"criterion":"c2","monitor":"resolves 2026-07-22"}
    _aw_undate    = {"criterion":"c3","monitor":"BaFin Offer Document publication"}
    _aw_str       = "a plain-string kill criterion with no monitor field at all"
    _aw_nomonitor = {"criterion":"c4","meaning":"m"}
    _aw_baddate   = {"criterion":"c5","monitor":"Feb 30, 2026"}
    _aw_via       = {"criterion":"c6","monitor_via":"resolves 2026-07-22"}
    _aw_nocrit    = {"monitor":"resolves 2026-07-22"}  # dateable+elapsed monitor but NO criterion-text field
    awcases=[  # (decision_date, kill_criteria, today, expect: None=N/A, []=nothing due, [substr]=due-with)
        ("2026-07-10",[_aw_open],"2027-04-01",["monitor event (2027-03-28)"]),  # bare month closes at its end
        ("2026-07-10",[_aw_open],"2027-03-01",[]),                              # before the month closes → not due
        ("2026-07-10",[_aw_iso],"2026-08-01",["monitor event (2026-07-22)"]),
        ("2026-07-10",[_aw_iso],"2026-07-22",[]),                               # ON the due date → not yet overdue
        ("2026-07-10",[_aw_via],"2026-08-01",["monitor event (2026-07-22)"]),   # monitor_via is also read
        ("2026-07-10",[_aw_nocrit],"2026-08-01",["never checked: <empty criterion>"]),  # no criterion text → placeholder, never a dangling colon
        ("2026-07-10",[_aw_undate],"2030-01-01",[]),                            # no dateable text → never flagged
        ("2026-07-10",[_aw_str],"2030-01-01",[]),                               # legacy plain-string entry → never flagged
        ("2026-07-10",[_aw_nomonitor],"2030-01-01",[]),                         # dict with no monitor text → never flagged
        ("2026-07-10",[_aw_baddate],"2027-01-01",[]),                           # invalid calendar date → undateable
        ("2026-07-10",[],"2026-08-01",None),                                    # empty → N/A
        ("2026-07-10",5,"2026-08-01",None),                                     # malformed (non-list) → N/A
        ("2026-07-10",[_aw_open],"nonsense",None),                              # unusable clock → N/A
    ]
    for _dd,_kc,_td,_want in awcases:
        got=eval_aw_kill_criteria_overdue(_dd,_kc,_td)
        if _want is None:
            ok = got is None
        else:
            ok = got is not None and len(got)==len(_want) and all(any(w in g for g in got) for w in _want)
        print(("  [ok] " if ok else "  [BAD] ")+f"AW({_dd!r},today={_td!r}) -> {got!r} (want {_want!r})")
        if not ok: bad+=1

    # ---- check BA: HARD GATE 11 kill-criteria trigger-test schema presence ------------------------
    _ba_good  = {"condition":"c1","comparable_basis":"H1 FY26 gross margin vs H1 FY25 gross margin","fired_last_two_periods":False}
    _ba_wouldfire = {"condition":"c2","comparable_basis":"Q4 revenue vs Q4 a year earlier","fired_last_two_periods":True}
    _ba_nocb  = {"condition":"c3","fired_last_two_periods":False}
    _ba_blankcb = {"condition":"c4","comparable_basis":"   ","fired_last_two_periods":False}
    _ba_nofl  = {"condition":"c5","comparable_basis":"H1 FY26 vs H1 FY25"}
    _ba_badfl = {"condition":"c6","comparable_basis":"H1 FY26 vs H1 FY25","fired_last_two_periods":"no"}
    _ba_str   = "a plain-string kill criterion with no structured fields at all"
    bacases=[  # (decision_date, kill_criteria, expect: None=N/A, []=pass, [substr]=fail-with)
        ("2026-08-22",[_ba_good],[]),                                    # both fields present, well-formed → pass
        ("2026-08-22",[_ba_wouldfire],[]),                               # fired_last_two_periods=True is still a valid bool — presence-gate only, not a correctness grader
        ("2026-08-22",[_ba_good,_ba_wouldfire],[]),                      # multiple well-formed rows → pass
        ("2026-08-22",[_ba_nocb],["kill_criteria[0] missing comparable_basis"]),
        ("2026-08-22",[_ba_blankcb],["kill_criteria[0] missing comparable_basis"]),  # whitespace-only doesn't count
        ("2026-08-22",[_ba_nofl],["kill_criteria[0] missing fired_last_two_periods"]),
        ("2026-08-22",[_ba_badfl],["kill_criteria[0] missing fired_last_two_periods"]),  # a string 'no' is not a bool
        ("2026-08-22",[_ba_str],["kill_criteria[0] is a plain string"]),
        ("2026-08-22",[_ba_good,_ba_nofl],["kill_criteria[1] missing fired_last_two_periods"]),  # index tracks the offending row
        ("2026-08-21",[_ba_nocb],None),                                  # predates BA_DATE → N/A
        ("2026-08-22",[],None),                                         # empty kill_criteria → nothing to test
        ("2026-08-22",None,None),                                       # no kill_criteria field → N/A
        ("2026-08-22",5,None),                                          # malformed (non-list) → N/A, T flags it separately
        ("not-a-date",[_ba_nocb],None),                                 # unparseable decision_date → N/A
    ]
    for _dd,_kc,_want in bacases:
        got=eval_ba_kill_criteria_trigger_test(_dd,_kc)
        if _want is None:
            ok = got is None
        else:
            ok = got is not None and len(got)==len(_want) and all(any(w in g for g in got) for w in _want)
        print(("  [ok] " if ok else "  [BAD] ")+f"BA({_dd!r},kc={_kc!r}) -> {got!r} (want {_want!r})")
        if not ok: bad+=1

    # ---- check BB: §16 Sector Cycle Reality Test compounding cap -----------------------------------
    _bb_elev02 = "## 5. Sector Cycle Reality Test\nSector re-rated ~32%.\nRF-VAL-001: own-history band cycle-elevated — sector index re-rated 32% over the window, cited 2026-08-01\n"
    _bb_elev03 = "## 6. Sector Cycle Reality Test\nPeer group re-rated too.\nRF-VAL-001: peer-median anchor cycle-elevated — peer aggregate re-rated 28% over the window, cited 2026-08-01\n"
    _bb_depr02 = "## 5. Sector Cycle Reality Test\nRF-VAL-002: own-history band cycle-depressed — sector index de-rated 30%, cited\n"
    _bb_depr03 = "## 6. Sector Cycle Reality Test\nRF-VAL-002: peer-median anchor cycle-depressed — peer aggregate de-rated 27%, cited\n"
    _bb_na02   = "## 5. Sector Cycle Reality Test\nNot assessable — no sector-level multiple history.\n"
    _bb_cleared02 = "## 5. Sector Cycle Reality Test\nRF-VAL-001 not triggered — sector flat over the window.\n"
    _bb_synth_ok   = "## 1. Valuation Verdict\n- Valuation confidence /100: 50\n"
    _bb_synth_atcap= "## 1. Valuation Verdict\n- Valuation confidence /100: 55\n"
    _bb_synth_over = "## 1. Valuation Verdict\n- Valuation confidence /100: 62\n"
    _bb_synth_noscore = "## 1. Valuation Verdict\n- no score line here\n"
    # A non-whole (55.9) or ranged (55–60) confidence must NOT truncate to a passing 55: it reads as
    # unparseable and fails closed (Codex review P2; CLAUDE.md §11/§12/§15). Expected value pinned to
    # 99_valuation-synthesis.md §1 (Valuation confidence is a whole /100 score) — not to code behaviour.
    _bb_synth_decimal = "## 1. Valuation Verdict\n- Valuation confidence /100: 55.9\n"
    _bb_synth_range   = "## 1. Valuation Verdict\n- Valuation confidence /100: 55–60\n"
    _bb_synth_range_sp= "## 1. Valuation Verdict\n- Valuation confidence /100: 55 - 60\n"
    _bb_synth_range_to= "## 1. Valuation Verdict\n- Valuation confidence /100: 55 to 60\n"
    _bb_synth_range_pct= "## 1. Valuation Verdict\n- Valuation confidence /100: 55%–60%\n"
    _bb_synth_range_or= "## 1. Valuation Verdict\n- Valuation confidence /100: 55 or 60\n"
    _bb_synth_later_cap= ("## 1. Valuation Verdict\n- no score line here\n\n"
                          "## 4. Score Cap Application\nValuation confidence /100: 55\n")
    _bb_synth_duplicate= ("## 1. Valuation Verdict\n- Valuation confidence /100: 50\n"
                          "- Valuation confidence /100: 55\n")
    _bb_synth_na_cap= "## 1. Valuation Verdict\n- Valuation confidence /100: N/A (max 55)\n"
    _bb_synth_negative= "## 1. Valuation Verdict\n- Valuation confidence /100: -5\n"
    _bb_synth_comma_decimal= "## 1. Valuation Verdict\n- Valuation confidence /100: 55,9\n"
    _bb_synth_exponent= "## 1. Valuation Verdict\n- Valuation confidence /100: 55e0\n"
    _bb_synth_single_asterisk = "## 1. Valuation Verdict\n- *Valuation confidence /100:* *55*\n"
    bbcases=[  # (decision_date, mult_txt(02), peer_txt(03), synth_txt(99), expect: None=N/A, []=pass, [substr]=fail-with)
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_ok,[]),                    # same-direction elevated, within cap → pass
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_atcap,[]),                 # exactly at the 55 cap → pass
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_over,["exceeding the max 55"]),  # over cap → FAIL
        ("2026-08-28",_bb_depr02,_bb_depr03,_bb_synth_over,["exceeding the max 55"]),  # same-direction depressed, over cap → FAIL
        ("2026-08-28",_bb_elev02,_bb_depr03,_bb_synth_over,[]),                  # opposite directions → no compounding, pass regardless of score
        ("2026-08-28",_bb_elev02,_bb_na02,_bb_synth_over,[]),                    # only one flagged (other Not assessable) → pass
        ("2026-08-28",_bb_elev02,_bb_cleared02,_bb_synth_over,[]),               # 03's tag line is a cleared/negation status → not fired, no compounding
        ("2026-08-28",_bb_elev02,_bb_elev03,None,["cannot be verified as applied"]),        # trigger fired, 99 absent → FAIL (unverifiable)
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_noscore,["could not be parsed"]),      # trigger fired, score unparseable → FAIL
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_decimal,["could not be parsed"]),      # 55.9 must not truncate to a passing 55 → unparseable → FAIL
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_range,["could not be parsed"]),        # 55–60 range must not truncate to 55 → unparseable → FAIL
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_range_sp,["could not be parsed"]),     # 55 - 60 (spaced range) likewise → FAIL
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_range_to,["could not be parsed"]),     # 55 to 60 (word range) likewise → FAIL
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_range_pct,["could not be parsed"]),    # 55%–60% (percent range) likewise → FAIL
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_range_or,["could not be parsed"]),     # 55 or 60 (worded alternative) likewise → FAIL
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_later_cap,["could not be parsed"]),    # later cap prose cannot replace the missing Verdict score
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_duplicate,["could not be parsed"]),    # conflicting Verdict scores fail closed
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_na_cap,["could not be parsed"]),       # explanatory max is not the stated score
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_negative,["could not be parsed"]),     # signed values cannot lose their sign
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_comma_decimal,["could not be parsed"]),# locale decimal cannot truncate to 55
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_exponent,["could not be parsed"]),     # exponent form is not a whole score token
        ("2026-08-28",_bb_elev02,_bb_elev03,_bb_synth_single_asterisk,[]),                    # ordinary Markdown italics around label/value → parse 55
        ("2026-08-28",_bb_na02,_bb_na02,_bb_synth_over,[]),                      # neither flagged → pass
        ("2026-08-27",_bb_elev02,_bb_elev03,_bb_synth_over,None),                # predates BB_DATE → N/A
        ("2026-08-28",None,None,_bb_synth_over,None),                           # neither 02 nor 03 ran → N/A
        ("2026-08-28",_bb_elev02,None,_bb_synth_over,[]),                       # only 02 ran, no 03 text → can't compound, pass
        ("not-a-date",_bb_elev02,_bb_elev03,_bb_synth_over,None),               # unparseable decision_date → N/A
    ]
    for _dd,_m2,_p3,_sy,_want in bbcases:
        got=eval_bb_sector_cycle_compounding_cap(_dd,_m2,_p3,_sy)
        if _want is None:
            ok = got is None
        else:
            ok = got is not None and len(got)==len(_want) and all(any(w in g for g in got) for w in _want)
        print(("  [ok] " if ok else "  [BAD] ")+f"BB({_dd!r}) -> {got!r} (want {_want!r})")
        if not ok: bad+=1

    for dt_,fl_,exp in aocases:
        got=eval_ao_forecast_resolvability(dt_,fl_)
        if exp is None: ok=(got is None)
        elif not exp: ok=(isinstance(got,list) and len(got)==0)
        else: ok=(isinstance(got,list) and len(got)>0 and all(any(s in v for v in got) for s in exp))
        if not ok: aobad+=1
        _n=len(fl_) if isinstance(fl_,list) else repr(fl_)  # non-list fixtures (malformed-ledger cases) have no len()
        print(f"  [{'ok' if ok else 'XX'}] AO({dt_!r},fl={_n}) -> {got}"+("" if ok else f"  EXPECTED {exp}"))
    bad+=aobad

    # ---- check AT: the scenario set must SPAN (§10) ----
    _sc = lambda *r: [{"label":l,"return_pct":v} for l,v in zip(("bull","base","bear"),r)]
    atcases=[  # (decision_date, scenarios, expect: None=N/A, []=pass, [substr]=fail-with)
        ("2026-07-31",_sc(3.6,-11.9,-38.7),None),                              # predates AT_DATE → N/A
        ("2026-08-01",_sc(3.6,-11.9,-38.7),["BEST case returns only +3.6%"]),  # the REAL AMZN set → FAIL
        ("2026-08-01",_sc(40.0,12.0,-25.0),[]),                                # a real good case → pass
        ("2026-08-01",_sc(5.0,-10.0,-30.0),[]),                                # exactly at the bar → pass
        ("2026-08-01",_sc(4.9,-10.0,-30.0),["only +4.9%"]),                    # just under → FAIL
        ("2026-08-01",_sc(-1.0,-9.0,-30.0),["only -1.0%"]),                    # every case negative → FAIL
        ("2026-08-01",[{"label":"base","return_pct":2.0}],None),               # one case is not a set → N/A
        ("2026-08-01",[{"label":"a"},{"label":"b"}],None),                     # no usable returns → N/A
        ("2026-08-01",None,None),                                               # no scenarios → N/A
        ("2026-08-01","nope",None),                                             # malformed → N/A, never crash
        # [PR#427 review fix] numeric-STRING return_pct coerces the same as the live math block → pass
        ("2026-08-01",[{"label":"bull","return_pct":"40.0"},{"label":"bear","return_pct":"-25.0"}],[]),
        # a present-but-non-coercible return_pct is a data-integrity failure, not a soft N/A
        ("2026-08-01",[{"label":"bull","return_pct":"n/a"},{"label":"bear","return_pct":-25.0}],
         ["non-numeric/non-coercible"]),
        # [PR#427 review fix] NaN/Infinity parse via float() but are never a usable scenario return —
        # NaN would make every comparison False (silently "spanning"); Infinity trivially spans without
        # naming a real value. Both must fail closed as non-coercible, not slip through as numbers.
        ("2026-08-01",[{"label":"bull","return_pct":"NaN"},{"label":"bear","return_pct":-25.0}],
         ["non-numeric/non-coercible"]),
        ("2026-08-01",[{"label":"bull","return_pct":"Infinity"},{"label":"bear","return_pct":-25.0}],
         ["non-numeric/non-coercible"]),
    ]
    for _dd,_scn,_want in atcases:
        got=eval_at_scenario_span(_dd,_scn)
        ok = (got is None) if _want is None else (isinstance(got,list) and len(got)==len(_want) and all(any(w in g for g in got) for w in _want))
        print(f"  [{'ok' if ok else 'XX'}] AT({_dd!r}) -> {str(got)[:64]}")
        if not ok: bad+=1

    # ---- check AU: the sign check must be RECORDED (Step 3b / HARD GATE 7) ----
    aucases=[
        ("2026-07-31","no such line here",None),                                       # pre-gate → N/A
        ("2026-08-01","",None),                                                         # no thesis → N/A
        ("2026-08-01","Sign check: margin-drivers agrees (Headwind, High).",[]),        # recorded → pass
        ("2026-08-01","sign-check against earnings: disagrees, overridden on ...",[]),  # hyphen form → pass
        ("2026-08-01","SIGN CHECK — valuation agrees",[]),                              # caps → pass
        ("2026-08-01","a long thesis that never mentions it",["records no SIGN CHECK"]),# missing → FAIL
        # regression: spacing variants the old `sign[\s\-]?check` MISSED (false FAIL on a recorded gate)
        ("2026-08-01","sign_check: earnings agrees (Tailwind, Med)",[]),                # underscore → pass
        ("2026-08-01","sign  check: margin-drivers agrees",[]),                         # double space → pass
        ("2026-08-01","sign - check: valuation disagrees, overridden",[]),              # space-hyphen-space → pass
        ("2026-08-01","sign-checked against margin-drivers: agrees",[]),               # past tense → pass
        # regression: false POSITIVE the old regex allowed — 'design check' contains 'sign check' but is
        # NOT a recorded sign check; on a HARD gate that let a run with no sign check pass silently.
        ("2026-08-01","our design check of the model passed; no other note",["records no SIGN CHECK"]),
    ]
    for _dd,_tx,_want in aucases:
        got=eval_au_sign_check_recorded(_dd,_tx)
        ok = (got is None) if _want is None else (isinstance(got,list) and len(got)==len(_want) and all(any(w in g for g in got) for w in _want))
        print(f"  [{'ok' if ok else 'XX'}] AU({_dd!r}) -> {str(got)[:56]}")
        if not ok: bad+=1

    # ---- check AV: the §10 conjunction basis must be WRITTEN, and only where required ----
    _av2 = lambda label,conds,jpb: {"label":label,"conditions":conds,"joint_probability_basis":jpb}
    avcases=[  # (decision_date, scenarios, expect: None=N/A, []=pass, [substr]=fail-with)
        ("2026-08-02",[_av2("bull",["a","b"],"shared driver"),_av2("bear",["c"],None)],None),  # predates AV_DATE → N/A
        # the real AMZN-shaped miss: 4 conditions, no basis at all → FAIL (one violation: bull only —
        # bear has 1 condition and no basis, which is compliant)
        ("2026-08-03",[_av2("bull",["aws>=35%","d&a lag","ads rebound","na units"],None),
                        _av2("bear",["aws decel"],None)],
         ["has 4 conditions that must hold simultaneously"]),
        # 2 conditions, a real (non-trivial) basis → pass
        ("2026-08-03",[_av2("bull",["demand exceeds base","margin clears threshold"],
                             "The two conditions share the same volume-led operating-leverage driver."),
                        _av2("bear",["demand misses"],None)], []),
        # 2 conditions, a basis that's present but too short to be a real explanation → FAIL
        ("2026-08-03",[_av2("bull",["a","b"],"linked"),_av2("bear",["c"],None)],
         ["too short to be a real explanation"]),
        # single condition carrying a stray basis (schema reserves the field for 2+) → FAIL
        ("2026-08-03",[_av2("bull",["a","b"],"shared driver, explained fully here"),
                        _av2("bear",["c"],"should not be set")],
         ["still carries a joint_probability_basis"]),
        # single-condition scenarios, no basis anywhere → pass (nothing to justify)
        ("2026-08-03",[_av2("bull",["a"],None),_av2("base",["b"],""),_av2("bear",["c"],None)], []),
        # [PR#427 review fix] conditions=[] is a list (passes the structured filter) but is empty — must
        # FAIL, not silently satisfy neither the >=2 nor the elif branch
        ("2026-08-03",[_av2("bull",[],None),_av2("bear",["a"],None)],
         ["carries an empty conditions[] list"]),
        ("2026-08-03",[{"label":"bull"},{"label":"bear"}],None),           # no structured conditions[] → N/A
        # [PR#427 review fix] PARTIALLY structured: one row carries conditions[], the other omits it —
        # must FAIL (not silently drop the malformed row and pass on whatever survives)
        ("2026-08-03",[_av2("bull",["aws>=35%","d&a lag","ads rebound","na units"],"shared driver"),
                        {"label":"bear"}],
         ["omit a structured"]),
        ("2026-08-03",[_av2("bull",["a","b"],"shared driver"),{"label":"bear","conditions":"not-a-list"}],
         ["omit a structured"]),
        ("2026-08-03",[_av2("bull",["a"],None)],None),                    # one scenario is not a set → N/A
        ("2026-08-03",None,None),                                          # no scenarios → N/A
        ("2026-08-03","nope",None),                                        # malformed → N/A, never crash
    ]
    for _dd,_scn,_want in avcases:
        got=eval_av_conjunction_disclosure(_dd,_scn)
        ok = (got is None) if _want is None else (isinstance(got,list) and len(got)==len(_want) and all(any(w in g for g in got) for w in _want))
        print(f"  [{'ok' if ok else 'XX'}] AV({_dd!r}) -> {str(got)[:64]}")
        if not ok: bad+=1

    # ---- check BC: HARD GATE 13 probability-basis presence/form on scenarios[] + forecast_ledger[] ----
    _bc_scn = lambda label,prob,basis: {"label":label,"probability":prob,"probability_basis":basis}
    _bc_fl  = lambda fid,prob,basis: {"forecast_id":fid,"probability":prob,"probability_basis":basis}
    bccases=[  # (decision_date, scenarios, forecast_ledger, expect: None=N/A, []=pass, [substr]=fail-with)
        ("2026-08-28",[_bc_scn("bull",25,None)],None,None),                          # predates BC_DATE → N/A
        # all three permitted forms → pass
        ("2026-08-29",[_bc_scn("bull",25,"empirical (n=9 over the last 9 reported quarters)"),
                        _bc_scn("base",50,"base rate: sector median beat-rate, Capital IQ"),
                        _bc_scn("bear",25,"judgment")], None, []),
        # missing field → FAIL
        ("2026-08-29",[_bc_scn("bull",25,None)], None, ["missing or empty probability_basis"]),
        ("2026-08-29",[_bc_scn("bull",25,"")], None, ["missing or empty probability_basis"]),
        # small-sample claim mislabeled 'empirical' (the §10 worked example: "two of the last four
        # quarters missed" is judgment with a four-observation prior, not a measured frequency) → FAIL
        ("2026-08-29",[_bc_scn("bear",55,"empirical (n=4 over the last four quarters)")], None,
         ["labels itself 'empirical' from n=4"]),
        # empirical at exactly the n=8 floor → pass
        ("2026-08-29",[_bc_scn("bear",55,"empirical (n=8 over the last 8 quarters)")], None, []),
        # 'base rate' named with no actual reference class following → FAIL
        ("2026-08-29",[_bc_scn("base",50,"base rate")], None, ["no actual reference class/source follows"]),
        # unrecognized free text → FAIL
        ("2026-08-29",[_bc_scn("bull",25,"management is confident")], None,
         ["does not match any of the three HARD GATE 13 forms"]),
        # 'empirical' at/above the n floor but with NO measurement window → FAIL (the advertised form is
        # `empirical (n=X over {window})`; CLAUDE.md §10 requires "the sample size AND the window it was
        # measured over" — a windowless n=X is not a measured frequency the reader can locate)
        ("2026-08-29",[_bc_scn("bull",25,"empirical (n=9)")], None, ["states no measurement window"]),
        # a valid 'judgment' string that also mentions 'base rate' must classify as judgment, not be
        # rejected by the base-rate branch for having too little text after "base rate" (judgment is
        # checked first). Pre-fix, "base rate)" left group(1)=")" and this row FAILED; it must PASS now.
        ("2026-08-29",[_bc_scn("bull",25,"judgment (no base rate)")], None, []),
        # plural "judgments"/"judgements" (US/UK) is still the judgment form → pass
        ("2026-08-29",[_bc_scn("bull",25,"judgements across the peer set")], None, []),
        # forecast_ledger carries the same requirement
        ("2026-08-29", None, [_bc_fl("FC-1",65,"empirical (n=12 over 3 fiscal years)")], []),
        ("2026-08-29", None, [_bc_fl("FC-1",65,None)], ["forecast_ledger 'FC-1': missing or empty"]),
        # a row with probability=None is not probability-bearing → not counted (would otherwise be N/A
        # if it were the only row; paired here with a real row so the case is a real applicability test)
        ("2026-08-29",[_bc_scn("bull",None,None),_bc_scn("base",100,"judgment")], None, []),
        # no probability-bearing row anywhere → N/A
        ("2026-08-29",[], [], None),
        ("2026-08-29", None, None, None),
        ("2026-08-29", "nope", "nope", None),                                        # malformed → N/A, never crash
    ]
    for _dd,_scn,_fl,_want in bccases:
        got=eval_bc_probability_basis_stated(_dd,_scn,_fl)
        ok = (got is None) if _want is None else (isinstance(got,list) and len(got)==len(_want) and all(any(w in g for g in got) for w in _want))
        print(f"  [{'ok' if ok else 'XX'}] BC({_dd!r}) -> {str(got)[:80]}")
        if not ok: bad+=1

    # ---- check AX: versioned, ranked, two-sided data-needs decision guidance ----
    _aw_need = {
        "need_id": "filed-segment-margin",
        "priority": 1,
        "series": "Quarterly filed segment revenue and operating profit",
        "why_it_caps": "the segment margin that drives the bull case is not disclosed",
        "expected_impact": {
            "if_supportive": "a margin above the scenario threshold would strengthen the case, subject to cash conversion",
            "if_adverse": "a margin below the threshold would weaken or reject the bull case",
        },
        "filing_required": True,
        "entry_orbs": [{
            "module": "earnings", "agent": "margin-drivers",
            "why": "this orb owns the segment-margin bridge", "confidence": 0.96,
        }],
        "suggested_source": {
            "name": "Company quarterly exchange filing", "acquisition": "manual", "access": "public",
            "licensing_basis": "official public filing; confirm exchange terms when acquired",
        },
        "tier": 5, "cadence": "quarterly", "next_release": "2026-10-29",
    }
    _aw_second = {**_aw_need, "need_id": "consensus-revision-delta", "priority": 2,
                  "series": "Point-in-time consensus revision history", "filing_required": False}
    axcases = [  # (date, version, needs, expect: None=N/A, []=pass, [substring]=fail-with)
        ("2026-08-13", None, None, None),                              # legacy omission remains valid
        ("2026-08-13", None, [{"legacy": "shape"}], None),           # legacy data_needs not reinterpreted
        ("2026-08-14", None, [], ["must carry data_needs_schema_version"]),
        ("2026-08-14", "2.0", [], []),                                # explicit completed-empty check
        ("2026-08-14", "2.0", [_aw_need], []),
        ("2026-08-14", "2.0", [_aw_need, _aw_second], []),
        ("2026-08-14", "3.0", [], ["only supported discriminator"]),
        ("2026-08-14", "2.0", None, ["requires data_needs to be an array"]),
        ("2026-08-14", "2.0", [{**_aw_need, "priority": 2}], ["array order must be exactly"]),
        ("2026-08-14", "2.0", [_aw_need, {**_aw_second, "priority": 1}], ["array order must be exactly"]),
        ("2026-08-14", "2.0", [_aw_need, {**_aw_second, "priority": 3}], ["array order must be exactly"]),
        ("2026-08-14", "2.0", [_aw_second, _aw_need], ["array order must be exactly"]),
        ("2026-08-14", "2.0", [_aw_need, {**_aw_second, "need_id": _aw_need["need_id"]}], ["need_id values must be unique"]),
        ("2026-08-14", "2.0", [{**_aw_need, "entry_modules": ["earnings"]}], ["forbidden/extra v2 fields"]),
        ("2026-08-14", "2.0", [{**_aw_need, "cap_lifted": "raises confidence"}], ["forbidden/extra v2 fields"]),
        ("2026-08-14", "2.0", [{**_aw_need, "suggested_source": {
            **_aw_need["suggested_source"], "url": "https://example.test/data"}}], ["must contain exactly"]),
        ("2026-08-14", "2.0", [{**_aw_need, "series": "https://example.test/data"}], ["contains a URL"]),
        ("2026-08-14", "2.0", [{**_aw_need, "series": "api.example.gov/data"}], ["contains a URL"]),
        ("2026-08-14", "2.0", [{**_aw_need, "series": "api.provider.dev/data"}], ["contains a URL"]),
        ("2026-08-14", "2.0", [{**_aw_need, "series": "provider.xyz/data"}], ["contains a URL"]),
        ("2026-08-14", "2.0", [{**_aw_need, "series": "ftp://provider.example/data"}], ["contains a URL"]),
        ("2026-08-14", "2.0", [{**_aw_need, "series": "s3://research-bucket/key"}], ["contains a URL"]),
        ("2026-08-14", "2.0", [{**_aw_need, "series": "192.0.2.1/data"}], ["contains a URL"]),
        ("2026-08-14", "2.0", [{**_aw_need, "series": "10.0.0.1:8080/path"}], ["contains a URL"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "this will guarantee a Buy rating"}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "this is guaranteeing a Buy rating"}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "this would upgrade the rating to Buy"}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "this produces 100% confidence"}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "Supportive evidence raises conviction."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "Supportive evidence improves the rating."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "Supportive evidence upgrades the rating to Buy."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "Buy is guaranteed."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This provides 99.9% confidence."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "We can be 100 percent confident."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This implies confidence of 100%."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This would provide 100% confidence in the call."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This ensures an upgrade."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence would strengthen conviction."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence would enhance confidence."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence makes the call certain."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence gives complete confidence."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence implies 1.0 confidence."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence guarantees the conclusion."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence guarantees the thesis."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence guarantees the investment case."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence guarantees the bull case."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence makes the thesis certain."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence makes us fully confident."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence removes all uncertainty."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence would leave no doubt about the call."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence guarantees upside."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence guarantees positive returns."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence guarantees outperformance."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence guarantees the price target."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence guarantees a profit."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence promises alpha."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence guarantees a rally."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence makes gains certain."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence means there is no downside."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence proves the bull case."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence confirms the Buy thesis."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence locks in a Buy."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence forces a Buy."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence compels an upgrade."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence automatically makes it a Buy."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "This evidence means we must Buy."}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "this will lift conviction by 10 points"}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "confidence rises from 40 to 60"}}], ["guarantees or promises"]),
        ("2026-08-14", "2.0", [{**_aw_need, "entry_orbs": [{
            **_aw_need["entry_orbs"][0], "confidence": 96}]}], ["0..1 scale"]),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            "if_supportive": "one-sided only"}}], ["must contain exactly"]),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "OPEC production cap will increase after the policy meeting"}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "rating will improve after debt repayment"}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "The decision depends on certain filed data."}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "Certain evidence required for the rating is unavailable."}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "The action depends on certain production assumptions."}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "The survey reports a 95% confidence interval."}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "The estimate needs a 90 percent confidence interval."}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "Consumer confidence rose by 10%."}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "The supplier guarantees data quality."}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "The exchange guarantees settlement."}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "The vendor guarantees credit rating data completeness."}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "The source promises timely credit rating updates."}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "The provider assures complete rating-history coverage."}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "The supplier guarantees an upgrade to the API."}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "The vendor guarantees return-field completeness."}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "The print confirms the production estimate."}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "why_it_caps": "The regulation forces supplier closure."}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_supportive": "A lower print would strengthen the case, subject to other inputs"}}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "expected_impact": {
            **_aw_need["expected_impact"], "if_adverse": "The adverse result would weaken the balance case"}}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "series": "Official production series, revised monthly"}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "next_release": "2026-08-14"}], []),
        ("2026-08-14", "2.0", [{**_aw_need, "next_release": "2026-08-13"}], ["predates decision_date"]),
        ("2026-08-14", "2.0", [{**_aw_need, "next_release": "2026-02-30"}], ["not a real YYYY-MM-DD"]),
        ("2026-08-14", "2.0", [
            {**_aw_need, "need_id": f"need-{i}", "priority": i} for i in range(1, 7)
        ], ["at most 5"]),
    ]
    for _dd, _version, _needs, _want in axcases:
        got = eval_ax_data_needs_v2(_dd, _version, _needs)
        ok = (got is None) if _want is None else (
            isinstance(got, list) and (not _want and not got or all(any(w in g for g in got) for w in _want))
        )
        print(f"  [{'ok' if ok else 'XX'}] AX({_dd!r},v={_version!r}) -> {str(got)[:72]}")
        if not ok: bad += 1

    # Live roster membership is publication-time only. Normal AX replay remains stable after an orb
    # rename/removal; the dedicated CLI rejects the same stale route before a fresh record is sealed.
    _ax_stale_route={**_aw_need,"entry_orbs":[{**_aw_need["entry_orbs"][0],"agent":"renamed-after-publication"}]}
    got=eval_ax_data_needs_v2("2026-08-14","2.0",[_ax_stale_route])
    ok=(got==[])
    print(f"  [{'ok' if ok else 'XX'}] AX historical replay ignores today's mutable roster")
    if not ok: bad+=1
    with tempfile.TemporaryDirectory(prefix="data-needs-prewrite-") as _temporary:
        _record_path=os.path.join(_temporary,"decision_record.json")
        _prewrite_record={"decision_date":"2026-08-14","data_needs_schema_version":"2.0","data_needs":[_aw_need]}
        with open(_record_path,"w",encoding="utf-8") as _handle: json.dump(_prewrite_record,_handle)
        _valid_cli=subprocess.run(
            [sys.executable,os.path.abspath(__file__),"--data-needs-prewrite",_record_path],
            cwd=os.getcwd(),stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,check=False,
        )
        _bad_date_results=[]
        for _bad_date in (None,"not-a-date","2026-02-30"):
            _bad_record={**_prewrite_record}
            if _bad_date is None: _bad_record.pop("decision_date",None)
            else: _bad_record["decision_date"]=_bad_date
            with open(_record_path,"w",encoding="utf-8") as _handle: json.dump(_bad_record,_handle)
            _bad_date_results.append(subprocess.run(
                [sys.executable,os.path.abspath(__file__),"--data-needs-prewrite",_record_path],
                cwd=os.getcwd(),stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,check=False,
            ))
        _prewrite_record["data_needs"]=[_ax_stale_route]
        _prewrite_record["decision_date"]="2026-08-14"
        with open(_record_path,"w",encoding="utf-8") as _handle: json.dump(_prewrite_record,_handle)
        _invalid_cli=subprocess.run(
            [sys.executable,os.path.abspath(__file__),"--data-needs-prewrite",_record_path],
            cwd=os.getcwd(),stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,check=False,
        )
        _legacy_rerun={"decision_date":"2026-08-13","data_needs":[]}
        with open(_record_path,"w",encoding="utf-8") as _handle: json.dump(_legacy_rerun,_handle)
        _before_rollout=_data_needs_prewrite(_record_path,publication_date="2026-08-13")
        _after_rollout=_data_needs_prewrite(_record_path,publication_date="2026-08-14")
        ok=(_valid_cli.returncode==0 and "DATA-NEEDS-PREWRITE: PASS" in _valid_cli.stdout
            and _invalid_cli.returncode==1 and "live discovered roster" in _invalid_cli.stdout
            and all(result.returncode==1 and "not a real YYYY-MM-DD date" in result.stdout
                    for result in _bad_date_results)
            and _before_rollout==[]
            and any("new publication must carry" in error for error in _after_rollout))
        print(f"  [{'ok' if ok else 'XX'}] AX publication CLI validates date/live route and rollout date for old-folder reruns")
        if not ok: bad+=1

    # Static ship-path order: the live route gate must run after finish-gate writers but before either
    # immutable sealing (full) or commit (rerun). This guards prompt drift without regrading history.
    _full_text=open(".claude/commands/research/full.md",encoding="utf-8").read()
    _rerun_text=open(".claude/commands/research/rerun.md",encoding="utf-8").read()
    _full_gate=_full_text.index('python3 scripts/eval.py --data-needs-prewrite "<RUN_ROOT>/decision_record.json"')
    _rerun_gate=_rerun_text.index('python3 scripts/eval.py --data-needs-prewrite "<RUN_ROOT>/decision_record.json"')
    ok=(_full_text.index("GATE-EXPECTATIONS:") < _full_gate < _full_text.index("### 10B.3A")
        and _rerun_text.index("## 9B.") < _rerun_gate < _rerun_text.index("## 10. Commit"))
    print(f"  [{'ok' if ok else 'XX'}] AX live-route gate is ordered before sealing/commit")
    if not ok: bad+=1

    # AP — valuation-summary lever-sidecar integrity: reuse the module's own fixture-free selftest (DRY),
    # covering soft-presence, structure, blend, and the decision_record non-contradiction check.
    if _vs_selftest() != 0: bad += 1
    print(("SELFTEST PASS" if not bad else f"SELFTEST FAIL ({bad} case(s))")+f" — {len(cases)} check-W + {len(xcases)} check-X + {len(aycases)} check-AY + {len(azcases)} check-AZ + {len(ycases)} check-Y + {len(zcases)} check-Z + {len(t2cases)} check-T2 + {len(t3cases)} check-T3 + {len(t4cases)} check-T4 + {len(aacases)} check-AA + {len(evcases)} AA-extractor + {len(abcases)} check-AB + {len(accases)} check-AC + {len(adcases)} check-AD + {len(aecases)} check-AE + {len(afcases)} check-AF + {len(aqcases)} check-AQ + {len(agcases)+len(agci_cases)} check-AG + {len(ahcases)} check-AH + {len(aicases)} check-AI + {len(ajcases)} check-AJ + {len(akcases)} check-AK + {len(ancases)} check-AN + {len(amcases)} check-AM + {len(arcases)} check-AR + {len(aocases)} check-AO + {len(ascases)} check-AS + {len(awcases)} check-AW + {len(bacases)} check-BA + {len(bbcases)} check-BB + {len(atcases)} check-AT + {len(aucases)} check-AU + {len(avcases)} check-AV + {len(bccases)} check-BC + {len(axcases)} check-AX cases + AP lever-sidecar (module selftest)")
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
            if isdate(ddte) and ddte>=OWNERCONF_DATE:
                for cerr in eval_forecast_entry_completeness(entry):
                    fdet.append(f"forecast_ledger[{i}] {cerr}")
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
    # AY golden-fixture truth-integrity floor (forward-looking; landing 2026-08-15) — basket-independent,
    # unlike X above: reuses ledger_records.resolve_integrity_status(run) so a PROVISIONAL finish-gate
    # banner or an unresolved verify-evidence verdict fails the suite regardless of decision/basket. See
    # the AY_DATE / eval_ay_fixture_integrity comment block near VERIFY_FLOOR_DATE for the full rationale.
    _ay_status = resolve_integrity_status(run)["status"]
    _ayresult = eval_ay_fixture_integrity(ddte, _ay_status)
    if _ayresult=="fail":
        add("AY_fixture_integrity", False, f"truth-integrity status={_ay_status!r} (decision_date {ddte!r}) — this fixture carries the finish-gate's own PROVISIONAL banner or a non-Clean/Minor verify-evidence verdict; resolve (rerun the affected module + downstream synthesis) before it can be treated as a clean golden fixture")
    elif _ayresult=="pass":
        add("AY_fixture_integrity", True, f"truth-integrity status={_ay_status!r}")
    else:
        add("AY_fixture_integrity", True, f"N/A (decision_date {ddte!r} predates AY_DATE {AY_DATE!r}, or invalid) — see retrospective advisory below if status=='provisional'", na=True)
    # AZ verify-evidence Section C3 schema presence (forward-looking; landing 2026-08-21) — basket-independent
    # like AY: any run whose verification_report.json exists must carry contradiction_checks[], so a future
    # verify-evidence run cannot silently omit the §3 named-metric contradiction sweep. See the AZ_DATE /
    # eval_az_contradiction_sweep comment block near AY_DATE for the full rationale.
    _az_vp = _latest("verification_report.json")
    _az_report = None
    _az_unreadable = False
    if _az_vp:
        try:
            _az_report = json.load(open(_az_vp))
        except Exception:
            # An unreadable report is NOT the same as no report. `None` means "this run produced none",
            # which the gate scores N/A — so folding a truncated or corrupt file into it would pass the
            # check while the printed reason claimed no report existed. Hand the gate a value that
            # structurally cannot carry contradiction_checks[], so it fails like any other invalid report.
            _az_report = False
            _az_unreadable = True
    _azresult = eval_az_contradiction_sweep(ddte, _az_report)
    if _azresult=="fail":
        add("AZ_contradiction_sweep", False,
            f"{os.path.basename(_az_vp)} is not readable JSON — Section C3 (the §3 named-metric contradiction sweep) cannot be verified"
            if _az_unreadable else
            f"{os.path.basename(_az_vp)} has no 'contradiction_checks' array — Section C3 (the §3 named-metric contradiction sweep) was not run or was omitted")
    elif _azresult=="pass":
        add("AZ_contradiction_sweep", True, f"contradiction_checks present ({len(_az_report.get('contradiction_checks') or [])} finding(s)) in {os.path.basename(_az_vp)}")
    else:
        add("AZ_contradiction_sweep", True, f"N/A (decision_date {ddte!r} predates AZ_DATE {AZ_DATE!r}, or no verification_report.json)", na=True)
    # BA HARD GATE 11 kill-criteria trigger-test schema presence (forward-looking; landing 2026-08-22).
    # See the BA_DATE / eval_ba_kill_criteria_trigger_test comment block near AW_kill_criteria_overdue
    # for the full rationale. Basket-independent, like AY/AZ: any run whose kill_criteria[] is non-empty
    # must carry comparable_basis + fired_last_two_periods on every row.
    _bar = eval_ba_kill_criteria_trigger_test(ddte, d.get("kill_criteria"))
    if _bar is None:
        add("BA_kill_criteria_trigger_test", True,
            f"N/A (decision_date {ddte!r} predates BA_DATE {BA_DATE!r}, kill_criteria is empty/absent, or malformed)", na=True)
    elif _bar:
        add("BA_kill_criteria_trigger_test", False, "; ".join(_bar))
    else:
        add("BA_kill_criteria_trigger_test", True, f"every kill_criteria row carries comparable_basis and fired_last_two_periods ({len(d.get('kill_criteria') or [])} row(s))")
    # The valuation specialist/synthesis text readers are defined ONCE here, unconditionally, at loop-body
    # scope, so every date-gated cap that consumes them (BB below, then AD/AE/AF/AQ) can call them no
    # matter which gate fires first. They were previously defined inside the AD/AE blocks, which sit
    # textually BELOW this BB block; because BB_DATE > AD_DATE the earlier author assumed "ddte>=AD_DATE
    # ⇒ the AD block already defined them" — but the AD *def* runs later in the SAME iteration, so it had
    # only ever been reached in a PRIOR iteration. A scoped run whose single iteration is dated
    # >= BB_DATE therefore entered BB and called _read_specialist_text before any def ran → NameError
    # (masked in `eval.py all`, where no committed golden run is dated >= BB_DATE so BB is never entered).
    # Both closures capture `run` only, so one loop-body definition per iteration is correct.
    def _read_synth_text(mod_dir):
        ss=glob.glob(os.path.join(run,mod_dir,"99_*-synthesis.md"))
        if not ss: return None
        try: return open(ss[0],encoding="utf-8").read()
        except: return None
    def _read_specialist_text(mod_dir, prefix):
        ss=glob.glob(os.path.join(run,mod_dir,prefix+"*.md"))
        if not ss: return None
        try: return open(ss[0],encoding="utf-8").read()
        except: return None
    # BB §16 Sector Cycle Reality Test compounding cap (forward-looking; landing BB_DATE). See the
    # BB_DATE / eval_bb_sector_cycle_compounding_cap comment block in rating_caps.py for the full
    # rationale. Reads 02_multiples-own-history.md and 03_relative-valuation-peers.md for the
    # standalone RF-VAL-001/RF-VAL-002 tags, and 99_valuation-synthesis.md for the stated Valuation
    # confidence score, via the _read_specialist_text/_read_synth_text closures hoisted just above.
    if isdate(ddte) and ddte>=BB_DATE:
        _v02_txt = _read_specialist_text("valuation", "02_")
        _v03_txt = _read_specialist_text("valuation", "03_")
        _v99_txt = _read_synth_text("valuation")
        _bbr = eval_bb_sector_cycle_compounding_cap(ddte, _v02_txt, _v03_txt, _v99_txt)
        if _bbr is None:
            add("BB_sector_cycle_compounding_cap", True,
                "N/A (neither 02 nor 03 specialist ran)", na=True)
        elif _bbr:
            add("BB_sector_cycle_compounding_cap", False, "; ".join(_bbr))
        else:
            add("BB_sector_cycle_compounding_cap", True,
                "compounding trigger did not fire, or the stated Valuation confidence respects the cap")
    else:
        add("BB_sector_cycle_compounding_cap", True,
            f"N/A (decision_date {ddte!r} predates BB_DATE {BB_DATE!r})", na=True)
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
        # _read_synth_text / _read_specialist_text are hoisted to loop-body scope above the BB block.
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
        # _read_synth_text / _read_specialist_text are hoisted to loop-body scope above the BB block.
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
    # AQ §13 cross-module forensic-mosaic conviction cap (forward-looking; landing AQ_DATE) —
    #   synthesizer.md Pre-Write Gate step 4B. Mechanizes the "3+ independent sub-threshold forensic
    #   signals → compound High accounting-integrity flag" mosaic check, which — unlike its five §24
    #   sibling caps (AC/AD/AE/AF above) — had zero mechanical enforcement until now (flagged as the
    #   next-highest-leverage gap when AG shipped, PR #321). Detection: eight standalone-line tags
    #   across four modules (RF-EQ-001/002 earnings, RF-OBS-001 balance-sheet-survival, RF-DISC-001/002
    #   + RF-REG-002 management-governance, RF-DISQ-001 + RF-RFS-001 business-model); see
    #   scripts/rating_caps.py for the full detection rationale. business-model contributes two tags
    #   from two different specialists (01_disqualifier-scan, 12_red-flags-sweep), so its specialist
    #   text is the concatenation of both.
    #   _read_synth_text / _read_specialist_text are defined in the AD/AE blocks above; AQ_DATE > AF_DATE
    #   > AE_DATE > AD_DATE so both are always available here, and bm_txt_ae (business-model synthesis)
    #   was already read in the AE block — reuse it, avoid a duplicate glob/read.
    if isdate(ddte) and ddte>=AQ_DATE:
        _bm_disq_spec_aq=_read_specialist_text("business-model","01_")
        _bm_rfs_spec_aq=_read_specialist_text("business-model","12_")
        _bm_spec_combined_aq="\n\n".join(t for t in (_bm_disq_spec_aq,_bm_rfs_spec_aq) if t) or None
        _aq_synth={
            "earnings":_read_synth_text("earnings"),
            "balance-sheet-survival":_read_synth_text("balance-sheet-survival"),
            "management-governance":mg_txt_af,  # already read above; same file, avoid a duplicate glob/read
            "business-model":bm_txt_ae,  # already read above; same file, avoid a duplicate glob/read
        }
        _aq_spec={
            "earnings":_read_specialist_text("earnings","06_"),
            "balance-sheet-survival":_read_specialist_text("balance-sheet-survival","05_"),
            "management-governance":_read_specialist_text("management-governance","06_"),
            "business-model":_bm_spec_combined_aq,
        }
        aqresult=eval_aq_forensic_mosaic_cap(dec,ddte,_aq_synth,_aq_spec)
        if aqresult is None:
            add("AQ_forensic_mosaic_cap",True,"none of the four owning modules (earnings, balance-sheet-survival, management-governance, business-model) ran — N/A",na=True)
        elif aqresult:
            add("AQ_forensic_mosaic_cap",False,"; ".join(aqresult))
        else:
            _aq_fired=sorted({tag for tag in FORENSIC_TAGS
                               if _tag_fired_standalone(_aq_synth.get(FORENSIC_TAGS[tag][0]),tag)
                               or _tag_fired_standalone(_aq_spec.get(FORENSIC_TAGS[tag][0]),tag)})
            add("AQ_forensic_mosaic_cap",True,
                f"forensic tags fired: {_aq_fired or 'none'}; decision={dec!r} — §13 forensic-mosaic cap satisfied")
    else:
        add("AQ_forensic_mosaic_cap",True,f"run predates §13 forensic-mosaic gate ({ddte}) — N/A",na=True)
    # AG Phase 6 calibration-feedback gate (forward-looking; landing AG_DATE) — DECISION_LEDGER.md §18.
    #   Closes the loop Phase 4 (/research:calibrate) opened but nothing consumed: verifies the
    #   synthesizer's decision_record.json carries a calibration_feedback object whose status is
    #   consistent with whatever calibration_summary.json existed as of this run's decision_date, so
    #   the gate cannot be silently dropped once real calibration data exists.
    if isdate(ddte) and ddte>=AG_DATE:
        calib_asof_ag=_calib_summary_asof(ddte)
        agresult=eval_ag_calibration_feedback_gate(ddte,calib_asof_ag,d.get("calibration_feedback"),d.get("confidence_inputs"))
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
    # AR bull-case sanity (§8, mirror of AM): a Short Candidate must have a bull price target above entry
    # — a genuine loss branch for the short, so a short thesis cannot ship all-downside and skip §8's
    # symmetric-disconfirmation requirement the way check AM already forbids on the long side.
    _arresult=eval_ar_short_bull_case_sanity(ddte,d.get("decision"),d.get("scenarios"),d.get("entry_price"))
    if _arresult is None:
        add("AR_bull_case_sanity",True,"not a post-gate Short Candidate with a usable bull price target — N/A",na=True)
    elif _arresult:
        add("AR_bull_case_sanity",False,"; ".join(_arresult))
    else:
        add("AR_bull_case_sanity",True,"bull-case price target is above entry_price — a genuine upside/squeeze branch (a real loss to the short)")
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
    # AT scenario SPAN (§10): a set that sums to 100% but whose BEST case sits inside an ordinary weekly
    # move contains no good outcome at all — the expected return then averages over half of reality.
    _atresult=eval_at_scenario_span(ddte,d.get("scenarios"))
    if _atresult is None:
        add("AT_scenario_span",True,"run predates the span gate, or carries no usable scenario returns — N/A",na=True)
    elif _atresult:
        add("AT_scenario_span",False,"; ".join(_atresult))
    else:
        add("AT_scenario_span",True,"the scenario set spans a real good outcome, not only degrees of bad")
    # AU sign check recorded (synthesizer Step 3b / HARD GATE 7): presence, not correctness — the silence
    # is what let a thesis contradict its own module.
    _auresult=eval_au_sign_check_recorded(ddte,thesis)
    if _auresult is None:
        add("AU_sign_check_recorded",True,"run predates the sign-check gate, or no thesis text — N/A",na=True)
    elif _auresult:
        add("AU_sign_check_recorded",False,"; ".join(_auresult))
    else:
        add("AU_sign_check_recorded",True,"the thesis records its sign check against the module owning its driver")
    # AV conjunction disclosure (§10): a scenario requiring 2+ simultaneous conditions must carry a real
    # (non-trivial) joint_probability_basis; a scenario with <2 conditions must not carry one at all.
    _avresult=eval_av_conjunction_disclosure(ddte,d.get("scenarios"))
    if _avresult is None:
        add("AV_conjunction_disclosure",True,"run predates structured-scenario-authority rollout, or scenarios aren't in that shape — N/A",na=True)
    elif _avresult:
        add("AV_conjunction_disclosure",False,"; ".join(_avresult))
    else:
        add("AV_conjunction_disclosure",True,"every scenario's conditions[] / joint_probability_basis pair is schema-consistent (§10)")
    # BC probability-basis presence/form (§10 HARD GATE 13): every probability-bearing scenarios[]/
    # forecast_ledger[] row must state empirical(n=X)/base rate/judgment, and a sub-8-observation sample
    # may not call itself empirical. Same "prose rule, no mechanization" gap check BA closed for HARD
    # GATE 11's kill-criteria triggers.
    _bcresult=eval_bc_probability_basis_stated(ddte,d.get("scenarios"),d.get("forecast_ledger"))
    if _bcresult is None:
        add("BC_probability_basis_stated",True,"run predates the gate, or no scenario/forecast_ledger row carries a probability — N/A",na=True)
    elif _bcresult:
        add("BC_probability_basis_stated",False,"; ".join(_bcresult))
    else:
        add("BC_probability_basis_stated",True,"every probability-bearing row states a valid basis (empirical/base rate/judgment) per HARD GATE 13")
    # AX versioned data-needs guidance (DECISION_LEDGER §5): fresh records prove the check ran even when
    # empty, and any populated queue is exact, ranked by decision value, two-sided, URL-free and makes no
    # promised/numeric conviction lift.
    _axresult=eval_ax_data_needs_v2(ddte,d.get("data_needs_schema_version"),d.get("data_needs"))
    if _axresult is None:
        add("AX_data_needs_v2",True,"record predates the v2 decision-guidance gate and has no discriminator — N/A",na=True)
    elif _axresult:
        add("AX_data_needs_v2",False,"; ".join(_axresult))
    else:
        add("AX_data_needs_v2",True,"v2 data_needs is explicit, exact, ranked 1..N, two-sided, URL-free and carries no promised/numeric conviction lift")
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
    # AY: same pattern as AI/AK — the underlying signal (the finish-gate's own PROVISIONAL banner, the
    # verify-evidence verdict) already fully existed on this run before AY_DATE; only the date gate on the
    # PRIMARY check above is bypassed here, not the status computed by resolve_integrity_status.
    if _ayresult=="na" and _ay_status=="provisional":
        retro.append({"check":"AY_fixture_integrity","status":"FAIL","detail":f"truth-integrity status=provisional (decision_date {ddte!r})",
                      "note":f"retrospective — decision_date {ddte!r} predates AY_DATE ({AY_DATE}); informational only, does not affect pass/gate_eligible/suite_pass; resolve with a data commit (rerun the affected module + downstream synthesis), not a code change"})
    # AS: forecasts whose window has ELAPSED and were never resolved. Advisory by construction — see the
    # function's own note: overdue-ness is made by the calendar, not by a defect in the run.
    _asr=eval_as_forecast_overdue(ddte,d.get("forecast_ledger"),TODAY)
    if _asr:
        retro.append({"check":"AS_forecast_overdue","status":"DUE","detail":"; ".join(_asr),
                      "note":"the ledger owes a resolution — run /research:review-decisions for this ticker "
                             "(§19: a forecast that cannot be checked later is not a forecast); informational "
                             "only, does not affect pass/gate_eligible/suite_pass"})
    # AW: kill criteria whose own named monitor event has ELAPSED, with no outcome review on file.
    # Advisory by construction — same reason as AS: overdue-ness is the calendar, not a defect in the run.
    _awr=eval_aw_kill_criteria_overdue(ddte,d.get("kill_criteria"),TODAY)
    if _awr:
        retro.append({"check":"AW_kill_criteria_overdue","status":"DUE","detail":"; ".join(_awr),
                      "note":"a kill criterion's own named monitor event has passed — run "
                             "/research:review-decisions for this ticker and record it in risk_results "
                             "(§8: disconfirming evidence is a required test, not a closing caveat); "
                             "informational only, does not affect pass/gate_eligible/suite_pass"})
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
 ".claude/agents/business-model/99_business-model-synthesis.md":["RF-BQ-005","Filter 5","RF-DISQ-001","RF-RFS-001","FORENSIC TAG PROPAGATION"],
 ".claude/agents/earnings/03_margin-drivers.md":["SECTOR_OVERLAYS.md","sector overlay","No sector overlay"],
 ".claude/agents/business-model/09_moat.md":["Use a through-cycle return"],
 ".claude/agents/earnings/MODULE_RULES.md":["Cycle-Position Rule"],
 ".claude/agents/earnings/06_earnings-quality.md":["Lead with normalised operating FCF","RF-EQ-001","RF-EQ-002"],
 ".claude/agents/earnings/99_earnings-synthesis.md":["RF-EQ-001","RF-EQ-002","FORENSIC TAG PROPAGATION"],
 ".claude/agents/balance-sheet-survival/05_off-balance-sheet-and-contingencies.md":["RF-OBS-001"],
 ".claude/agents/balance-sheet-survival/99_balance-sheet-survival-synthesis.md":["RF-OBS-001"],
 ".claude/agents/management-governance/06_candor-and-disclosure-quality.md":["RF-DISC-001","RF-DISC-002","RF-REG-002","Standalone tag emission"],
 ".claude/agents/valuation/07_scenario-and-fair-value.md":["true through-cycle trough"],
 ".claude/agents/business-model/08_competitive-map.md":["Profitability / return on capital"],
 ".claude/agents/balance-sheet-survival/06_downside-stress-test.md":["Pending acquisition (pro-forma) check"],
 ".claude/agents/balance-sheet-survival/01_capital-structure-and-leverage.md":["state it with its basis (CLAUDE.md §15)","Net debt (strict, §15)"],
 ".claude/agents/valuation/04_intrinsic-dcf.md":["benchmarked against peer-normal AND the company","Working capital scales with revenue"],
 ".claude/agents/business-model/01_disqualifier-scan.md":["Integrity note","Filter 1","RF-DISQ-001","Near-miss compounding signal"],
 ".claude/agents/business-model/12_red-flags-sweep.md":["RF-RFS-001","Aggressive-accounting tag"],
 ".claude/agents/business-model/11_capital-allocation-governance.md":["Filter 4","opportunity cost"],
 ".claude/agents/management-governance/MODULE_RULES.md":["RF-CAP-004","RF-OWN-004","RF-MGT-004","RF-MGT-005","§24"],
 ".claude/agents/management-governance/01_management-and-track-record.md":["Turnaround","Filter 2","RF-MGT-005"],
 ".claude/agents/management-governance/99_management-governance-synthesis.md":["RF-MGT-005","RF-DISC-001","RF-DISC-002","RF-REG-002","Forensic tag propagation"],
 ".claude/agents/management-governance/04_ownership-and-insider-behavior.md":["RF-OWN-004","Filter 6"],
 ".claude/agents/balance-sheet-survival/MODULE_RULES.md":["Net cash is a strategic asset","Filter 3","Label the cycle position of the EBITDA","the **strict** basis (CLAUDE.md §15)"],
 ".claude/agents/valuation/MODULE_RULES.md":["RF-OWN-004","Filter 6","value trap","benchmarked against BOTH a peer-normal margin"],
 ".claude/agents/synthesizer.md":["Avoid-Big-Risks","§24","DEFER to the catalyst module","Net-cash / leverage headline disclosure","business_type","primary_valuation_method","forecast_type","RF-MGT-005","calibration_feedback","Calibration feedback check","flagged_forecast_types","calibration_by_thesis_type","flagged_thesis_types","leading_error_categories_flagged","error_defense_evidence","no defense evidence found","eval_aq_forensic_mosaic_cap","Cross-module forensic mosaic","eval_ar_short_bull_case_sanity","genuine loss to the short","RF-DISQ-001","RF-RFS-001","data_needs_schema_version","entry_orbs","expected_impact","decision value"],
 ".claude/agents/catalyst/MODULE_RULES.md":["§17 Catalyst Discipline","Catalyst Category Checklist","No proven catalyst yet"],
 ".claude/agents/catalyst/01_catalyst-calendar.md":["12-Month Catalyst Calendar","Bullish Trigger","Bearish Trigger"],
 ".claude/agents/catalyst/99_catalyst-synthesis.md":["Catalyst strength /100","No proven catalyst yet","depends_on"],
 ".claude/agents/memo-writer.md":["memo.md","colleague","~10"],
 ".claude/commands/research/full.md":["audit_dossier.md","memo.md","memo-writer","post_mortem_decision","RATING-CAP","TERMINAL","10B.3","GATE-EXPECTATIONS","expectations-gap.md","rating_caps","eval_ad_filter_4_6_cap","eval_ae_filter5_cap","eval_af_filter1_integrity_cap","eval_ac_turnaround_cap","eval_aq_forensic_mosaic_cap","headline_checks","eval_ai_headline_reconciliation","eval_ak_red_flag_severity_reconciliation","valuation_summary_checks","eval_ap_valuation_summary_integrity","--data-needs-prewrite","before 10B.3A"],
 "scripts/rating_caps.py":["AC_DATE","AD_DATE","AE_DATE","AF_DATE","AQ_DATE","eval_ac_turnaround_cap","eval_ad_filter_4_6_cap","eval_ae_filter5_cap","eval_af_filter1_integrity_cap","eval_aq_forensic_mosaic_cap","_tag_fired_standalone","HIGH_CONVICTION_DECISIONS","FORENSIC_TAGS","MOSAIC_MIN_DISTINCT_TAGS","MOSAIC_MIN_DISTINCT_MODULES"],
 "scripts/headline_checks.py":["AI_DATE","CONF_SPLIT_DATE","eval_ai_headline_reconciliation","_scorecard_section","_hs_cell","_metric_numbers","_reconciles","AK_DATE","eval_ak_red_flag_severity_reconciliation","_module_critical_count","_AK_CRITICAL_PATTERNS","_AK_DENIAL","_AK_AFFIRM"],
 "scripts/valuation_summary_checks.py":["eval_ap_valuation_summary_integrity","scan_committed","_selftest","_REQUIRED","level_from_multiple"],
 ".claude/agents/module-memo-writer.md":["_memo.md","module synthesis","condenser"],
 "frameworks/MODULE_PIPELINE.md":["Step 4.9","module-memo-writer","_memo.md","_dossier.md"],
 ".claude/commands/research/rerun.md":["module-memo-writer","_dossier.md","10B.3","forensic-mosaic","--data-needs-prewrite","Publication-time data-needs route gate"],
 ".claude/commands/research/track.md":["analyses/tracking","_calls_tracker","review_schedule","ad-hoc","memo_delta_file"],
 ".claude/settings.json":["SessionStart","review_due.py"],
 ".claude/hooks/review_due.py":["review_schedule","research:review-decisions due"],
 "frameworks/DECISION_LEDGER.md":["Memo delta","memo_delta","thesis_delta_verdict","stage_one_comment","rerun_command","_memo_delta.md","business_type","primary_valuation_method","forecast_type","Calibration Feedback Gate","calibration_feedback","calibration_by_module","calibration_by_forecast_type","flagged_forecast_types","calibration_by_thesis_type","flagged_thesis_types","error_taxonomy_distribution","leading_error_categories_flagged","error_defense_evidence","AG_ERRTAX_DATE","no defense evidence found","pre_mortem_check","audit-of-the-auditor","outcome_vs_verdict","false comfort","excess caution","data_needs_schema_version","entry_orbs","licensing_basis","decision value"],
 ".claude/commands/research/review-decisions.md":["memo_delta","stage_one_comment","rerun_command","Pool first","_memo_delta","pre_mortem_check","outcome_vs_verdict","7A. Pre-mortem calibration check"],
 ".claude/commands/research/eval.md":["scripts/eval.py"],
 ".claude/commands/research/calibrate.md":["calibration_by_module","calibration_by_forecast_type","owner_module","forecast_type","Phase 6","error_taxonomy_distribution","pre_mortem_calibration","scripts/calibrate.py","Pre-data","withheld","Clopper-Pearson","Selected − Rejected","commit-run.sh"],
 "scripts/calibrate.py":["load_standing_records","clopper_pearson","murphy_decomposition","e_value_hit_rate","effective_n","months_to_significance","reliability_bands","MIN_RESOLVED_FORECASTS","calibration_by_module","calibration_by_forecast_type","calibration_by_thesis_type","_slice_multi","_thesis_type_keys","error_taxonomy_distribution","pre_mortem_calibration","outcome_distribution","contradicted_breakdown","false_comfort","excess_caution","Pre-data","honesty_statement","benchmark-adjusted","load_feed","market_feed"],
 "scripts/test_calibrate.py":["clopper_pearson","murphy_decomposition","e_value_hit_rate","Pre-data","hit rate","already_significant","test_thesis_type_multi_label_slice","test_thesis_type_untagged_fallback_and_ticker_floor"],
 "scripts/market_prices.py":["data/_market","close_on","total_return","beta_adjusted_excess","raw_excess_pct","beta_adjusted_excess_pct","available","as_of","date,symbol,close"],
 "frameworks/MARKET_FEED.md":["date,symbol,close","_symbols.json","beta_adjusted_excess","close_on","EXTERNAL_DATA"],
 "frameworks/EXTERNAL_DATA.md":["data/_market","market_prices.py","beta-adjusted","tracking_price","date,symbol,close"],
 "scripts/eval.py":["T_forecast_ledger_quality","FL_DATE","confirmation_trigger","falsification_trigger","eval_t_probability","PROB_DATE","eval_forecast_type","FORECAST_TYPE_ENUM","FTYPE_DATE","eval_forecast_entry_completeness","OWNERCONF_DATE","owner_module","confidence_score","evidence_today","W_sector_valuation","SECTOR_DATE","SECTOR_FORBIDDEN","X_verify_floor","VERIFY_FLOOR_DATE","ACCEPTABLE_VERDICTS","Y_data_sufficiency_cap","INSUF_THRESHOLD","DATASUF_CONVICTION_FLOOR","HIGH_CONVICTION_DECISIONS","eval_z_thesis_type_cap","THESIS_TYPE_ENUM","EXTERNAL_TYPES","THESIS_Z_DATE","AA_module_verdict_lock","AA_DATE","BSS_CAP_VERDICT","MG_CAP_VERDICT","eval_aa_module_verdict_lock","extract_synthesis_verdict","AB_bm_disqualifier_lock","AB_DATE","BM_CAP_VERDICT","eval_ab_bm_verdict_lock","AC_turnaround_cap","AC_DATE","TURNAROUND_TYPE","ABOVE_STARTER_AC","eval_ac_turnaround_cap","eval_ad_filter_4_6_cap","AD_DATE","CAP4_TAG","CAP6_TAG","AD_filter_4_6_cap","eval_ae_filter5_cap","AE_DATE","CAP5_TAG","ABOVE_STARTER_AE","AE_filter5_cap","_tag_fired_standalone","eval_af_filter1_integrity_cap","AF_DATE","CAP1_TAG","ABOVE_WATCHLIST_AF","AF_filter1_integrity_cap","eval_ag_calibration_feedback_gate","AG_DATE","AG_FTYPE_DATE","AG_TTYPE_DATE","AG_ERRTAX_DATE","AG_STATUSES","_ag_leading_error_categories","_calib_summary_asof","CALIB_SUMMARIES","eval_ah_expectations_gap_gate","AH_DATE","AH_expectations_gap_gate","eval_ai_headline_reconciliation","AI_DATE","_scorecard_section","_hs_cell","_metric_numbers","_reconciles","eval_aj_decision_audit_trail","AJ_DATE","AJ_MIN_ROWS","AJ_REQUIRED_COLS","_decision_audit_section","_decision_audit_header","_decision_audit_rows","_audit_cell_blank","eval_ak_red_flag_severity_reconciliation","AK_DATE","_module_critical_count","_AK_CRITICAL_PATTERNS","_AK_DENIAL","_AK_AFFIRM","AL_pre_mortem_check","PRE_MORTEM_CHECK_DATE","PM_OUTCOMES","eval_am_bear_case_sanity","AM_DATE","eval_an_supersession_integrity","eval_ar_short_bull_case_sanity","AR_DATE","AO_forecast_resolvability","AO_DATE","eval_ao_forecast_resolvability","_ao_earliest_date","eval_ap_valuation_summary_integrity","scan_committed","eval_ay_fixture_integrity","AY_DATE","resolve_integrity_status"],
 "scripts/data_need_contract.py":["DATA_NEED_PROMISE_RE","DATA_NEED_URL_RE","check_live_orb_routes","discover_orb_roster"],

 ".github/workflows/ci.yml":["eval-contracts","scripts/eval.py"],
}
FRAMEWORK_CONTRACTS["scripts/eval.py"] += [
    "eval_ax_data_needs_v2", "DATA_NEEDS_V2_DATE", "AX_data_needs_v2",
    # AZ was the only check in this file not registered here, so the whole thing could be deleted and the
    # suite would still report PASS — the exact hole this self-anchor exists to close.
    "check_az_governance_flag_cap_correspondence", "_az_slice", "_az_table_keys", "_az_row_first_cell", "azfails",
]
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

# AZ — governance flag/cap correspondence (structural, fixture-free).
#   The management-governance module encodes its severity ladder in FOUR places that must agree:
#   the Red-Flag ID Registry (the trigger), the Transitive-exposure grading rule (the grade floor),
#   the Score Cap Rules (the numeric cap), and agent 99's Score Cap Application table (where the cap
#   is actually applied). A flag whose trigger fires but whose cap row does not exist — or exists in
#   MODULE_RULES but was never mirrored into 99 — is silently unenforced: the module reports the red
#   flag and publishes an uncapped score.
#
#   [review fix] The first version of this check was substantially weaker than its own docstring
#   claimed, and its mutation tests passed only because of how the mutations were chosen:
#     - the cap test was a substring search over the whole Score Cap slice, so an explanatory FOOTER
#       naming RF-NET-003 kept it passing after both cap ROWS were deleted;
#     - the mirror test searched all of 99, so reconciliation prose naming an ID masked a deleted
#       Score Cap Application row;
#     - the emitter glob `[0-9][0-9]_*.md` includes 99 itself, so the mirror assertion made the
#       emitter assertion vacuous;
#     - the enum test was a one-token denylist, so a NEW global-stop spelling passed;
#     - the grading rule was named in the docstring but never parsed at all.
#   All five are now row-aware, section-scoped, allowlist-based, and the grading bands are compared.
#   Scope stays the RF-NET family this contract introduces; the legacy registry carries pre-existing
#   orphans that are out of scope here.
def _az_slice(txt, start_head, end_head, what):
    """Section text between two headings. Raises if either anchor moved — a renamed heading must
    fail loudly, never silently narrow the check's scope to nothing. `what` names the slice in the
    error: str.index raises a bare "substring not found", which on a repo-blocking gate tells the
    person nothing about which heading in which file moved."""
    i = txt.find(start_head)
    if i < 0:
        raise ValueError(f"{what}: start heading '{start_head}' not found")
    j = txt.find(end_head, i)
    if j < 0:
        raise ValueError(f"{what}: end heading '{end_head}' not found after '{start_head}'")
    return txt[i:j]

def _az_row_first_cell(ln):
    """The first cell of a markdown table row, or None if the line is not one. Shared so every caller
    computes it the SAME way: stripping the line before stripping pipes matters, because an indented
    row leaves the indent as cell 0 and silently exempts itself from whatever the caller was checking."""
    st = ln.strip()
    if not st.startswith("|"):
        return None
    return st.strip("|").split("|")[0]

def _az_table_keys(section, pattern):
    """IDs appearing in the FIRST COLUMN of a markdown table row — not anywhere in the prose."""
    keys = set()
    for ln in section.splitlines():
        first = _az_row_first_cell(ln)
        if first is None:
            continue
        keys.update(re.findall(pattern, first))
    return keys

def check_az_governance_flag_cap_correspondence():
    import glob as _glob
    D = ".claude/agents/management-governance"
    fails = []
    try:
        MR  = open(f"{D}/MODULE_RULES.md", encoding="utf-8").read()
        S99 = open(f"{D}/99_management-governance-synthesis.md", encoding="utf-8").read()
        A07 = open(f"{D}/07_people-integrity-dossiers.md", encoding="utf-8").read()
    except Exception as e:
        return [f"unreadable module file: {str(e)[:80]}"]

    try:
        reg     = _az_slice(MR,  "### Red-Flag ID Registry", "## Stewardship Verdict Categories", "registry")
        caps    = _az_slice(MR,  "## Score Cap Rules", "## Cross-Module Inputs", "caps")
        grading = _az_slice(MR,  "### Transitive-exposure grading", "### Scope-Boundary Register", "grading")
        cap99   = _az_slice(S99, "## 4. Score Cap Application", "## 5. Stewardship Summary", "cap99")
    except ValueError as e:
        return [f"section anchor missing (heading renamed?): {str(e)[:90]}"]

    net_ids = sorted(_az_table_keys(reg, r"RF-NET-\d+"))
    if not net_ids:
        return ["RF-NET family absent from the Red-Flag ID Registry"]

    # (1) every RF-NET trigger has a real cap ROW (first column), not just a prose mention
    cap_keys = _az_table_keys(caps, r"RF-NET-\d+")
    nocap = [i for i in net_ids if i not in cap_keys]
    if nocap:
        fails.append(f"RF-NET ids with a trigger but no Score Cap ROW (silently unenforced): {nocap}")

    # (2) every capped RF-NET id is mirrored as a ROW in 99's Score Cap Application table
    mir_keys = _az_table_keys(cap99, r"RF-NET-\d+")
    unmirrored = [i for i in net_ids if i in cap_keys and i not in mir_keys]
    if unmirrored:
        fails.append(f"cap rows never mirrored as rows in 99's Score Cap Application: {unmirrored}")

    # (3) every RF-NET trigger is emitted by an owning SPECIALIST — 99 is excluded, since it is
    #     already required to carry every mirrored id and would make this assertion vacuous.
    #     Guarded like the three opens above: an unreadable specialist (a stray directory, a non-UTF-8
    #     byte, a broken symlink) must report one finding, not crash the gate for the whole repo.
    try:
        specialists = "".join(open(f, encoding="utf-8").read()
                              for f in sorted(_glob.glob(f"{D}/[0-9][0-9]_*.md"))
                              if not os.path.basename(f).startswith("99_"))
    except Exception as e:
        return fails + [f"unreadable specialist file: {str(e)[:80]}"]
    emitted = set(re.findall(r"RF-[A-Z]+-\d+", specialists))
    for fam, lo, hi in re.findall(r"RF-([A-Z]+)-(\d+)\s*(?:…|\.\.\.|–)\s*(\d+)\b", specialists):
        for n in range(int(lo), int(hi) + 1):
            emitted.add(f"RF-{fam}-{n:03d}")
    unemitted = [i for i in net_ids if i not in emitted]
    if unemitted:
        fails.append(f"RF-NET ids no specialist emits (dead triggers): {unemitted}")

    # (4) termination enum validated against the complete allowlist, not a one-token denylist —
    #     any NEW global-stop spelling must fail, not just the historical one.
    ALLOWED = {"no_new_subjects", "hop_cap", "breadth_budget", "target_gate_failed", "budget_exhausted",
               "sources_unavailable"}
    # Bounded by the TOKEN RUN, not by punctuation. The previous form captured to the first em dash or
    # newline, and the prose immediately after this enum names `disqualifying_finding_established` — the
    # exact token the check exists to ban. Rewrapping that line, or writing ": note" instead of " — note",
    # would have made this gate fail for every PR in the repo. Stop at the first non-token instead.
    m = re.search(r"`termination_rule`\s*∈\s*((?:\s*`[a-z_]+`\s*[·,]?)+)", A07)
    if not m:
        fails.append("07 no longer declares a termination_rule enum")
    else:
        vals = set(re.findall(r"`([a-z_]+)`", m.group(1)))
        extra   = vals - ALLOWED
        missing = ALLOWED - vals
        if extra:
            fails.append(f"termination_rule declares values outside the contract allowlist: {sorted(extra)}")
        if missing:
            fails.append(f"termination_rule is missing contract values: {sorted(missing)}")

    # (5) the grading rule is the fourth representation AZ claims to protect — so parse it. Every
    #     fact term the RF-NET-003 trigger enumerates must ALSO appear in the cap rows AND the
    #     Transitive-exposure grading bands — the doctrine's own claim is that trigger, cap and grade
    #     cover exactly the same two fact sets, so a term missing from ANY one of the three is a drift,
    #     not just a term missing from grading. [review fix] The previous form was a union test —
    #     `(in_trigger or in_caps) and not in_grading` — which only ever required grading to be a
    #     superset of trigger∪caps. Deleting `sanctions` from BOTH RF-NET-003 cap rows while leaving it
    #     in the registry trigger and in grading passed silently: in_trigger=True, in_caps=False,
    #     in_grading=True, and the union test only fires when grading is the odd one out. A trigger
    #     term with no matching cap condition is exactly the "flag fires, cap doesn't cover it" defect
    #     AZ exists to catch — so require presence in all three surfaces, not just trigger-or-caps→grading.
    FACT_TERMS = ["proven fraud", "debarment", "sanctions", "fugitive",
                  "liquidation", "live enforcement", "credible fraud allegation"]
    trigger_row = " ".join(ln for ln in reg.splitlines() if "RF-NET-003" in ln)
    cap_rows    = " ".join(ln for ln in caps.splitlines()
                           if "RF-NET-003" in (_az_row_first_cell(ln) or ""))
    for term in FACT_TERMS:
        in_trigger = term in trigger_row.lower()
        in_caps    = term in cap_rows.lower()
        in_grading = term in grading.lower()
        present = {"trigger": in_trigger, "cap": in_caps, "grading": in_grading}
        missing_from = [k for k, v in present.items() if not v]
        if missing_from and any(present.values()):
            fails.append(f"fact '{term}' present in {[k for k,v in present.items() if v]} but "
                         f"missing from {missing_from} — RF-NET-003 trigger/cap/grade must cover the same facts")

    # (6) band-AWARE grading check. (5) only proves a fact term appears SOMEWHERE in the grading
    #     section, so moving `liquidation` from the Material-equivalent row up into the
    #     Disqualifying-equivalent row still passed (5) even though the grade floor no longer matches
    #     the RF-NET-003 band it fires. Pin each term to its expected band, and to NOT be in the other.
    disq_row = " ".join(ln for ln in grading.splitlines()
                        if "Disqualifying-equivalent" in ln and "Material-equivalent" not in ln).lower()
    mat_row  = " ".join(ln for ln in grading.splitlines()
                        if "Material-equivalent" in ln and "Disqualifying-equivalent" not in ln).lower()
    if not disq_row or not mat_row:
        fails.append("Transitive-exposure grading: could not isolate the Disqualifying- and Material-equivalent band rows")
    else:
        BANDS = {"Disqualifying-equivalent": (disq_row, mat_row,
                                              ["proven fraud", "debarment", "sanctions", "fugitive"]),
                 "Material-equivalent":      (mat_row, disq_row,
                                              ["liquidation", "live enforcement", "credible fraud allegation"])}
        for band, (own, other, terms) in BANDS.items():
            for term in terms:
                if term not in own:
                    fails.append(f"grade band: '{term}' is missing from the {band} row")
                elif term in other:
                    fails.append(f"grade band: '{term}' appears in the wrong band (found outside {band})")

    # (7) mirrored-cap PAYLOAD check. (2) proves an RF-NET id has a ROW in both cap tables; it does not
    #     prove the numbers agree. Changing 99's RF-NET-003 cap from `max 35` to `max 65` — the exact
    #     silent-weakening this whole check exists to stop — kept an RF-NET-003 row in place and passed (2).
    #     Compare the actual max/floor bounds per id between MODULE_RULES and 99, wording-independent.
    def _az_score_of(pre):
        # Which score a `max/floor N` attaches to, normalized across the two tables' vocabularies
        # ("People & network integrity"/"PeopleNetworkIntegrity", "Governance risk"/"GovRisk", ...).
        pre = pre.lower()
        if "integrity" in pre: return "PNI"
        if "candor" in pre: return "CANDOR"
        if "govrisk" in pre or "governance risk" in pre: return "GOV"
        if "confidence" in pre: return "CONF"
        if "rptrisk" in pre or "leakage" in pre: return "RPT"
        if "data quality" in pre or "dataquality" in pre: return "DQ"
        if "audit" in pre: return "AUDIT"
        return "?"
    def _az_trigger_key(cell):
        # A cap row's identity WITHIN its RF id is its TRIGGER text, not its position in the table.
        # The old form keyed only on the literal strings "disqualifying-equivalent"/"material-equivalent",
        # which separated RF-NET-003's two bands and gave all four RF-NET-004 rows the same empty key —
        # so two 004 rows could swap triggers and leave the identical sorted collection of bounds.
        # Reduced to content tokens because the two tables paraphrase each other ("sanctions match" vs
        # "sanctions", "terminable at short notice" vs "short-terminable"), so exact text would false-fail.
        txt = re.sub(r"RF-[A-Z]+-\d+", " ", cell).lower()
        stop = {"the", "and", "for", "its", "not", "any", "all", "with", "that", "while", "from"}
        return frozenset(t for t in re.findall(r"[a-z0-9]+", txt) if len(t) > 2 and t not in stop)
    def _az_cap_rows(section, rf_id):
        # One entry per cap ROW: (trigger key, its sorted score bounds). Moving a cap to the wrong
        # score, changing a number, or swapping two rows' triggers all change the result.
        rows = []
        for ln in section.splitlines():
            first = _az_row_first_cell(ln)
            if first is None or rf_id not in first:
                continue
            bounds = []
            for m in re.finditer(r"(max|floor)\s+(\d+)", ln, re.I):
                # attach to the NEAREST score: the clause since the last ';' or '|', not a fixed
                # window that could reach back past it to an earlier score in the same cell.
                seg = ln[:m.start()]
                clause = seg[max(seg.rfind(";"), seg.rfind("|")) + 1:]
                bounds.append((_az_score_of(clause), m.group(1).lower(), int(m.group(2))))
            rows.append((_az_trigger_key(first), sorted(bounds)))
        return rows
    for i in net_ids:
        if i not in cap_keys or i not in mir_keys:
            continue  # ID-presence gaps already reported by (1)/(2); don't double-report
        mr_rows, n99_rows = _az_cap_rows(caps, i), _az_cap_rows(cap99, i)
        if len(mr_rows) != len(n99_rows):
            fails.append(f"{i}: {len(mr_rows)} cap row(s) in MODULE_RULES vs {len(n99_rows)} in 99 "
                         f"(a trigger condition was added or dropped on one side only)")
            continue
        pool = list(n99_rows)
        for key, bounds in mr_rows:
            # Pair each MODULE_RULES row with the 99 row whose TRIGGER overlaps it most — the tables
            # paraphrase, so identity is nearest-trigger, never exact text.
            j = max(range(len(pool)), key=lambda k: len(key & pool[k][0]))
            k99, b99 = pool.pop(j)
            if not key & k99:
                fails.append(f"{i}: cap row '{' '.join(sorted(key))[:70]}' has no counterpart trigger in 99")
            elif bounds != b99:
                fails.append(f"{i}: cap payload drifts for trigger '{' '.join(sorted(key & k99))[:70]}' — "
                             f"MODULE_RULES {bounds} vs 99 {b99} (score / number disagree, or two rows' "
                             f"triggers were swapped — enforcement silently weakened or misdirected)")

    # (9) registry TRIGGER conditions vs the cap ROWS — (7) only proves the two cap TABLES
    #     (MODULE_RULES vs 99) agree with EACH OTHER; it never checks either against the registry's
    #     own trigger text. [review fix] Removing a named adverse condition from an RF-NET registry
    #     row (e.g. "same marks in live use") while leaving its cap rows in both cap tables untouched
    #     passed every earlier check — (1)/(2) only test ID PRESENCE, (7) only tests MODULE_RULES-caps
    #     vs 99-caps against each other. Pin each id's enumerated conditions and require each to
    #     appear in BOTH the registry trigger row and the cap rows — the same asymmetry (5) closes for
    #     RF-NET-003's fact terms, extended here to RF-NET-004's own condition list.
    COND_TERMS = {
        "RF-NET-004": ["controller-linked", "no identifiable licence", "licence terms",
                       "terminable at short notice", "same marks in live use"],
    }
    for rf_id, terms in COND_TERMS.items():
        trow = " ".join(ln for ln in reg.splitlines()
                        if rf_id in (_az_row_first_cell(ln) or "")).lower()
        crow = " ".join(ln for ln in caps.splitlines()
                        if rf_id in (_az_row_first_cell(ln) or "")).lower()
        for term in terms:
            in_t, in_c = term in trow, term in crow
            if in_t != in_c:
                fails.append(f"{rf_id}: condition '{term}' present in {'the registry trigger' if in_t else 'the cap rows'} "
                             f"but missing from {'the cap rows' if in_t else 'the registry trigger'} — a named adverse "
                             f"condition drifted between the registry row and its cap rows")
    return fails

# (8) Self-anchor is STRUCTURAL, not a substring search over a list that supplies its own matches.
#     [review fix] FRAMEWORK_CONTRACTS["scripts/eval.py"] (above) lists these same identifiers as
#     plain quoted strings so the general J-check (a substring search of this file's own text) can
#     confirm they exist — but that list literal is itself part of this file's text. Deleting the
#     real `def check_az_governance_flag_cap_correspondence(...):` body, its call, and the
#     `if azfails: suite_pass = False` gate, while leaving the FRAMEWORK_CONTRACTS list entry
#     untouched, still makes the substring search find every anchor string (in the list itself) and
#     report PASS. No anchor TEXT fixes this, because whatever string is chosen would also have to
#     appear in the list to be checked, which places it in the file regardless of whether the real
#     code exists. Parse the actual AST instead: a bare string constant inside a list can never be
#     mistaken for a real FunctionDef, Call, or If node, so this cannot be satisfied by anything
#     other than the real definitions and wiring being present.
def _az_self_anchor_fails():
    try:
        tree = ast.parse(open(__file__, encoding="utf-8").read())
    except Exception as e:
        return [f"AZ self-anchor: could not parse {__file__}: {str(e)[:80]}"]
    fails = []
    funcs = {n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)}
    for fn in ("check_az_governance_flag_cap_correspondence", "_az_slice", "_az_table_keys", "_az_row_first_cell"):
        if fn not in funcs:
            fails.append(f"AZ self-anchor: def {fn}(...) not found by AST parse (structural, not substring)")
    # The call may sit anywhere inside the assigned expression (e.g. `azfails = f() + g()`), not only
    # as the bare top-level value — so walk the RHS subtree for the call rather than requiring it to
    # be n.value itself.
    called = any(
        isinstance(n, ast.Assign)
        and any(isinstance(t, ast.Name) and t.id == "azfails" for t in n.targets)
        and any(
            isinstance(c, ast.Call) and isinstance(c.func, ast.Name)
            and c.func.id == "check_az_governance_flag_cap_correspondence"
            for c in ast.walk(n.value)
        )
        for n in ast.walk(tree)
    )
    if not called:
        fails.append("AZ self-anchor: 'azfails = check_az_governance_flag_cap_correspondence()' not found by AST parse")
    gated = any(
        isinstance(n, ast.If) and isinstance(n.test, ast.Name) and n.test.id == "azfails"
        and any(isinstance(s, ast.Assign)
                and any(isinstance(t, ast.Name) and t.id == "suite_pass" for t in s.targets)
                and isinstance(s.value, ast.Constant) and s.value.value is False
                for s in n.body)
        for n in ast.walk(tree)
    )
    if not gated:
        fails.append("AZ self-anchor: 'if azfails: suite_pass = False' gate not found by AST parse")
    return fails

azfails = check_az_governance_flag_cap_correspondence() + _az_self_anchor_fails()
if azfails: suite_pass = False

# AP — valuation-summary lever-sidecar integrity (GLOBAL scan of every committed sidecar, including partial
# no-decision-record runs the per-run loop skips). Soft-presence + strict-validity; a sidecar whose scenario
# levels contradict its own frozen decision_record HARD-FAILs the suite, because the cockpit Playground
# would then show levers that disagree with the committed thesis.
apchecked, apfailures = scan_committed(".")
if apfailures: suite_pass=False

out={"schema_version":"1.0","generated_at":today,"scope":scope,"n_runs":len(results),
     "suite_pass":suite_pass,"runs":results,"source_contracts_s24":jchecks,
     "governance_flag_cap_correspondence":{"pass":not azfails,"failures":azfails},
     "valuation_summary_integrity":{"checked":apchecked,"failures":[{"run":r,"violations":v} for r,v in apfailures]}}
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
print("  governance flag/cap correspondence (AZ: RF-NET trigger ↔ cap ↔ 99 ↔ agent):",
      "PASS" if not azfails else "FAIL " + "; ".join(azfails))
jfails=[j["file"] for j in jchecks if j["status"]=="FAIL"]
print("  framework source contracts (J: §24 + catalyst + tiers):", "PASS" if not jfails else "FAIL "+";".join(jfails))
for j in jchecks:
    if j["status"]=="FAIL": print(f"     FAIL {j['file']} missing={j['missing']}")
print("  valuation summary integrity (AP: lever sidecar ↔ decision_record):", f"PASS ({apchecked} committed sidecar(s))" if not apfailures else "FAIL "+";".join(r for r,_ in apfailures))
for r,v in apfailures:
    print(f"     FAIL {r}: {'; '.join(v)}")
retro_runs={nm:r["retrospective_advisories"] for nm,r in results.items() if r.get("retrospective_advisories")}
if retro_runs:
    n=sum(len(v) for v in retro_runs.values())
    print(f"  RETROSPECTIVE ADVISORIES (informational — does not affect PASS/FAIL above): {n} pre-gate finding(s) in {len(retro_runs)} run(s)")
    for nm,adv in retro_runs.items():
        for a in adv:
            print(f"     ADVISORY {nm}: {a['check']} — {a['detail']}")
print("WROTE", of)
sys.exit(0 if suite_pass else 1)   # [review fix] non-zero exit on FAIL so CI / hooks / automation gating on $? see the regression
