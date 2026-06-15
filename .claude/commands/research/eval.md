---
description: Golden-run regression harness — deterministically assert the structural, schema, contract, and math invariants hold across committed research runs (the fixtures), so framework/agent/command changes can't silently regress the engine. Writes a dated eval report.
argument-hint: [RUN_OR_TICKER | all]
allowed-tools: Read, Glob, Bash, Write
---

You are the **regression harness**. The engine grows fast — modules, frameworks, and a widening command surface (verify-evidence, pre-mortem, expectations-gap, review-decisions, calibrate). A system without an eval is a demo: this is the deterministic test suite that proves a change did not break the contracts. You assert that the **committed runs** (the golden fixtures, e.g. BG and HCG) still satisfy the structural, schema, contract, and math invariants.

**You do NOT re-run agents or the pipeline.** LLM outputs are non-deterministic, so re-running and diffing is meaningless. Instead you check that the *already-committed artifacts* satisfy the contracts — a fast, repeatable, deterministic gate to run after any change to an agent, framework, command, or the synthesizer. You are READ-ONLY on all run artifacts; you write only a dated eval report. Grounded in `CLAUDE.md` (§18 decision set, §10 scenario math, §15 hygiene, §24 Avoid-Big-Risks rejector filters), `DECISION_LEDGER.md` (§5 record schema, §8 review schema), and `MODULE_PIPELINE.md` (no stray confirmation blocks). Arguments: `$ARGUMENTS`.

---

## 1. Resolve scope

`$ARGUMENTS`: empty/`all` → every run that has a `decision_record.json` (the fixtures). A path/ticker → just that run. Discover with `Glob analyses/*/decision_record.json`.

## 2. Run the invariant checks (deterministic)

Run the embedded check script below via Bash. It applies, per run, the following invariants — each PASS / FAIL / N/A with detail. **Any FAIL fails the suite** (a regression). Absent *optional* artifacts (audit reports, reviews) are N/A, not FAIL.

- **A. Structural** — `final_thesis.md` exists and is non-trivial (> 1 KB); `RUN_METADATA.md` exists; `decision_record.json` exists; every module subfolder present has its `99_*-synthesis.md`.
- **B. Decision-record schema** (`DECISION_LEDGER` §5) — parses; all 38 canonical fields present; arrays are arrays, objects are objects; `schema_version` == "1.0". Additive fields (`scenarios`, `post_review_confidence_score`, `confidence_haircut`, `pre_mortem_verdict`) are type-checked **when present** (never required — older records omit them).
- **B2. `decision_date` is a real date** — the `decision_date` *value* parses as an ISO date, not merely that the key exists. A garbage/null date otherwise sends every forward-looking gate (K–S) to a false "predates feature" N/A; this makes it a hard FAIL.
- **C. Decision enum + basket mapping** — `decision` ∈ the `CLAUDE.md` §18 allowed set; `basket` matches the §3 mapping for that decision; `paper_treatment` matches the mapping (keyword check).
- **D. Missing-price contract** — if `entry_price` is null, `paper_treatment` is a no-trade treatment and `notes` actually **addresses** the missing/indicative price (a specific phrase — "indicative", "unverified", "entry price is null", "no paper trade" — not merely any word containing the substring "price").
- **E. Numeric hygiene** — `expected_return_pct`, `downside_risk_pct`, `risk_reward`, `confidence_score`, `data_sufficiency_score` are number-or-null; scores within 0–100.
- **F. Review-schedule date math** — `review_schedule` has 30d/90d/180d/365d; each is a valid ISO date and equals `decision_date` + N days (recomputed). Catches the date-generation regression class.
- **G. Audit-report schema** (optional, if present) — `verification_report.json` / `pre_mortem.json` / `expectations_gap.json` parse and carry their required keys; a `verification_report` with verdict "Failed" fails the suite (a golden fixture must not be a failed run).
- **H. No stray confirmation blocks** (`MODULE_PIPELINE`) — no `<run>/<module>/*.md` file's last 20 lines contain a line matching `^Agent:\s+\S+\s*$`.
- **I. Decision ↔ thesis consistency** — the `decision_record.decision` string appears in `final_thesis.md` **on its "Decision:" line or in the "| Rating |" scorecard cell** (the JSON's headline matches the memo's headline) — not merely anywhere in the prose, which let "Buy" match "Buyback" or "Avoid" match the §24 "Avoid Big Risks" header while the real verdict differed.
- **J. Framework source contracts** (suite-level, run once) — two bodies of wiring are still present in the framework/agent files. **(i) §24 Avoid-Big-Risks:** `CLAUDE.md` §24 with all six filters; each module's `MODULE_RULES.md` carries its filter caps; the new red-flag IDs (`RF-CAP-004`, `RF-OWN-004`, `RF-MGT-004`) exist; `business-quality` has the 11th factor; the synthesizer carries the §24 gate step and rating cap. **(ii) §17 Catalyst module:** the `catalyst` module (`MODULE_RULES`, `01_catalyst-calendar`, `99_catalyst-synthesis`) exists with its §17 discipline and runs-last `depends_on`, and the synthesizer's §7 defers to it. **(iii) Three output tiers:** the `memo-writer` agent (`.claude/agents/memo-writer.md`) and the `/research:full` wiring (`.claude/commands/research/full.md`) that emit the colleague `memo.md` and the deterministic `audit_dossier.md` alongside `final_thesis.md` are present; AND the per-module tier wiring — the `module-memo-writer` agent (`.claude/agents/module-memo-writer.md`), the shared `frameworks/MODULE_PIPELINE.md` Step 4.9 (module memo + module dossier), and the `/research:rerun` refresh — that emit each module's `<module>_memo.md` and `<module>_dossier.md` alongside its `99_*-synthesis.md` are present. **(iv) Review-due scheduler:** the SessionStart hook (`.claude/settings.json` + `.claude/hooks/review_due.py`) that surfaces due decision reviews is present. Guards the §24 implementation, the catalyst module, the three-output wiring, and the scheduler against silent deletion. Independent of any run; a missing anchor fails the suite.
- **K. §24 reflected in post-§24 runs** (forward-looking) — for a run whose `decision_date` is on/after the §24 landing date (`2026-06-03`), `final_thesis.md` must reference the Avoid-Big-Risks roll-up (the Headline Scorecard row or a §24 reference). Runs that predate §24 (the BG/HCG fixtures) are **N/A**, so the suite still passes; the check activates automatically for every new run.
- **L. Three output tiers present in post-landing runs** (forward-looking) — for a run whose `decision_date` is on/after the three-tier landing date (`2026-06-03`), both `memo.md` (the ~10-page colleague memo) and `audit_dossier.md` (the deterministic full-evidence concatenation) must exist beside `final_thesis.md`. Runs that predate the feature (the BG/HCG fixtures) are **N/A**, so the suite still passes; the check activates automatically for every new run.
- **M. Scenario-math reconciliation** (forward-looking; `fix F08/F12`) — for a run dated on/after `2026-06-08`, deterministically **recompute** the §10 identities from `decision_record.scenarios[]`: probabilities sum to 100; `expected_return_pct == Σ(probability × return_pct)` (1.0pp tolerance — catches sign flips); and, when a price anchor and per-case targets exist, the probability-weighted target and `risk_reward` reconcile too. This is the gate that the old check E (numeric *hygiene* only) never performed — the §10 math was previously enforced solely by LLM mental arithmetic. A post-gate run that quantified a return but omitted `scenarios[]` FAILs (the block is required so the math is checkable). Older fixtures lack `scenarios[]` → **N/A**.
- **N. No scratch-reasoning leak** (forward-looking; `fix F12`) — for a run dated on/after `2026-06-08`, `final_thesis.md` must not contain model self-correction text (e.g. "let me recalculate", "recomputing") — a committed thesis once shipped its raw arithmetic-correction scratch in §8. Older fixtures → **N/A**.
- **O. Integrity finish-gate present** (forward-looking; `fix F01`) — for a run dated on/after `2026-06-08` whose decision is in the Selected or Short basket, both `verification_report.json` and `pre_mortem.json` must exist — these are the in-path audits the `/research:full` finish-gate (step 10B) produces before commit; their absence means a conviction thesis shipped without the integrity + red-team pass. Older fixtures, and Watchlist/Avoid/Insufficient runs, → **N/A**.
- **P. Disconfirmation / edge quality** (forward-looking; `fix F39`) — for a run dated on/after `2026-06-08`, the variant perception must be **non-tautological** (`what_market_may_be_missing` ≠ `what_everyone_knows`; an explicitly-empty "no proven edge yet" is allowed per §7) and `kill_criteria` must carry at least one concrete falsification trigger. `kill_criteria` elements may be plain strings **or** objects (`{condition, what_it_means, …}` — the live synthesizer's format); both forms count. Catches a perfunctory bear case / a restated-consensus "edge" that the old field-presence check waved through. Older fixtures → **N/A**.
- **Q. Per-module three tiers present in post-landing runs** (forward-looking) — for a run whose `decision_date` is on/after the module-tiers landing date (`2026-06-08`), every module subfolder that has a `99_*-synthesis.md` must also carry a `*_memo.md` (the module memo) and a `*_dossier.md` (the module dossier) — the module-level equivalent of the run-level three tiers. Runs that predate the feature are **N/A**, so the suite still passes; the check activates automatically for every new run.
- **R. Memo-delta contract** (forward-looking; landing `2026-06-10`) — every review JSON filed on/after the landing date must carry the `DECISION_LEDGER` §8 `memo_delta` block, and any review that carries one must satisfy it: the paired `*_memo_delta*.md` exists on disk at `memo_delta_file` and stays a delta (≤ ~2,500 words — the 2–3-page discipline); `thesis_delta_verdict` is in-enum; every `changed_sections` entry cites an `evidence_source`; and any `rerun_recommended` names impacted module(s) that exist in the discovered agent roster. Pre-landing reviews and runs with no reviews are **N/A**.
- **S. Pre-mortem haircut propagated** (forward-looking; landing `2026-06-12`) — for a run whose `decision_date` is on/after the landing date, if `pre_mortem.json` exists and applied a haircut > 0, the decision_record must carry `post_review_confidence_score == pre_mortem.recommended_confidence` and `confidence_haircut`; `pre_mortem_verdict` must always be set (even at zero haircut). Older fixtures → **N/A**.
- **T. Forecast-ledger entry quality** (forward-looking; landing `2026-06-13` / fix F-FL-1) — for a run dated on/after the landing date with a non-empty `forecast_ledger`, every entry must carry `prediction`, `confirmation_trigger`, `falsification_trigger`, and `time_window` (all non-empty strings), and `status` ∈ {open, confirmed, falsified, expired}. An entry missing a required field cannot be resolved in Phase 3 (`review-decisions`) and breaks Phase 4 calibration (no Brier-score data from that forecast). An empty `[]` is allowed per §19 (when no forecast has enough evidence). Runs that predate the gate, and runs with `forecast_ledger: []`, are **N/A**.
- **U. Post-mortem rating-cap consistency** (forward-looking; `fix F28b`; landing `2026-06-12`) — for a run dated on/after the landing date where `pre_mortem_verdict` is a terminal verdict ("Thesis broken" or "Does not survive — downgrade"), the finish-gate must have written `post_mortem_decision` and `post_mortem_basket`, and `post_mortem_basket` must NOT be "Selected" or "Short" — those verdicts mean the thesis does not hold as a conviction position. Closes the logical-contradiction gap where a "Strong Buy" decision coexists with a "Thesis broken" red-team verdict in the same committed record. The original `decision` / `basket` fields are preserved (the synthesizer's immutable call, required by check I); only the additive post-mortem fields are validated here. Older fixtures, and runs with non-terminal pre-mortem verdicts, → **N/A**.

The script also notes (WARN, not FAIL) any **non-schema artifact** in a run folder (a stray file that is not a known schema / versioned-audit / review artifact) so coverage gaps and strays surface.

```bash
python3 - "$ARGUMENTS" <<'PY'
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
        for _k,_t in [("scenarios",list),("post_review_confidence_score",(int,float)),("confidence_haircut",(int,float))]:
            v=d.get(_k)
            if _k in d and v is not None and not (isinstance(v,_t) and not isinstance(v,bool)): badtype.append(_k)
        if "pre_mortem_verdict" in d and not isinstance(d.get("pre_mortem_verdict"),str): badtype.append("pre_mortem_verdict")
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
        add("T_forecast_ledger_quality",not fdet,
            "; ".join(fdet) or
            (f"all {len(fl)} forecast_ledger entries have required fields + valid status" if fl
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
 ".claude/agents/synthesizer.md":["Avoid-Big-Risks","§24","DEFER to the catalyst module","Net-cash / leverage headline disclosure"],
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
 "frameworks/DECISION_LEDGER.md":["Memo delta","memo_delta","thesis_delta_verdict","stage_one_comment","rerun_command","_memo_delta.md"],
 ".claude/commands/research/review-decisions.md":["memo_delta","stage_one_comment","rerun_command","Pool first","_memo_delta"],
 ".claude/commands/research/eval.md":["T_forecast_ledger_quality","FL_DATE","confirmation_trigger","falsification_trigger"],
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
PY
```

## 3. Verdict, report, git

Read the script's output. Confirm the eval report parses (`python3 -m json.tool`). Print a human summary: overall **PASS/FAIL**, the per-run check matrix, any FAILs with detail, and any non-schema-file WARNs. Then commit straight to `main` (add only `analyses/eval/<DATE>_eval_report*.json`), message `Eval: <PASS|FAIL> — <n_runs> golden runs (<DATE>)`, and push. Report the SHA.

**If the suite FAILs:** report it plainly as a regression — name the run, the failed check, and the detail. Do not soften it; a FAIL means a contract broke and must be fixed before the engine is trusted.

---

## Hard rules

- **Deterministic only.** No agent/pipeline re-runs, no LLM judgment in the checks — pure structural/schema/contract/math assertions, so the result is reproducible and a real regression gate.
- **Read-only on run artifacts;** writes only the dated `analyses/eval/` report.
- **Any FAIL fails the suite.** Optional-artifact absence is N/A, not FAIL. A non-schema stray file is a WARN, not a FAIL.
- Grounded in `CLAUDE.md` §18/§10/§15, `DECISION_LEDGER.md` §5/§8, `MODULE_PIPELINE.md`; spawns no subagents.
