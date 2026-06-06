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
- **B. Decision-record schema** (`DECISION_LEDGER` §5) — parses; all 38 canonical fields present; arrays are arrays, objects are objects; `schema_version` == "1.0".
- **C. Decision enum + basket mapping** — `decision` ∈ the `CLAUDE.md` §18 allowed set; `basket` matches the §3 mapping for that decision; `paper_treatment` matches the mapping (keyword check).
- **D. Missing-price contract** — if `entry_price` is null, `paper_treatment` is a no-trade treatment and `notes` references the missing/indicative price.
- **E. Numeric hygiene** — `expected_return_pct`, `downside_risk_pct`, `risk_reward`, `confidence_score`, `data_sufficiency_score` are number-or-null; scores within 0–100.
- **F. Review-schedule date math** — `review_schedule` has 30d/90d/180d/365d; each is a valid ISO date and equals `decision_date` + N days (recomputed). Catches the date-generation regression class.
- **G. Audit-report schema** (optional, if present) — `verification_report.json` / `pre_mortem.json` / `expectations_gap.json` parse and carry their required keys; a `verification_report` with verdict "Failed" fails the suite (a golden fixture must not be a failed run).
- **H. No stray confirmation blocks** (`MODULE_PIPELINE`) — no `<run>/<module>/*.md` file's last 20 lines contain a line matching `^Agent:\s+\S+\s*$`.
- **I. Decision ↔ thesis consistency** — the `decision_record.decision` string appears in `final_thesis.md` (the JSON matches the memo).
- **J. Framework source contracts** (suite-level, run once) — two bodies of wiring are still present in the framework/agent files. **(i) §24 Avoid-Big-Risks:** `CLAUDE.md` §24 with all six filters; each module's `MODULE_RULES.md` carries its filter caps; the new red-flag IDs (`RF-CAP-004`, `RF-OWN-004`, `RF-MGT-004`) exist; `business-quality` has the 11th factor; the synthesizer carries the §24 gate step and rating cap. **(ii) §17 Catalyst module:** the `catalyst` module (`MODULE_RULES`, `01_catalyst-calendar`, `99_catalyst-synthesis`) exists with its §17 discipline and runs-last `depends_on`, and the synthesizer's §7 defers to it. **(iii) Three output tiers:** the `memo-writer` agent (`.claude/agents/memo-writer.md`) and the `/research:full` wiring (`.claude/commands/research/full.md`) that emit the colleague `memo.md` and the deterministic `audit_dossier.md` alongside `final_thesis.md` are present. **(iv) Review-due scheduler:** the SessionStart hook (`.claude/settings.json` + `.claude/hooks/review_due.py`) that surfaces due decision reviews is present. Guards the §24 implementation, the catalyst module, the three-output wiring, and the scheduler against silent deletion. Independent of any run; a missing anchor fails the suite.
- **K. §24 reflected in post-§24 runs** (forward-looking) — for a run whose `decision_date` is on/after the §24 landing date (`2026-06-03`), `final_thesis.md` must reference the Avoid-Big-Risks roll-up (the Headline Scorecard row or a §24 reference). Runs that predate §24 (the BG/HCG fixtures) are **N/A**, so the suite still passes; the check activates automatically for every new run.
- **L. Three output tiers present in post-landing runs** (forward-looking) — for a run whose `decision_date` is on/after the three-tier landing date (`2026-06-03`), both `memo.md` (the ~10-page colleague memo) and `audit_dossier.md` (the deterministic full-evidence concatenation) must exist beside `final_thesis.md`. Runs that predate the feature (the BG/HCG fixtures) are **N/A**, so the suite still passes; the check activates automatically for every new run.
- **M. Audit completeness (WARN, not FAIL)** — for runs where `confidence_score ≥ 60` AND `decision` is one of {Strong Buy, Buy, Starter Position Only, Avoid, Short Candidate}, warns if `verification_report.json` is absent. These are the decisions with the highest real-money consequence — a long entry, a short, or a definitive rejection — and an un-audited high-confidence call is the single most dangerous failure mode the system can silently produce. N/A for low-confidence runs and for Watchlist/Pair-Trade/Insufficient-Data decisions. Does **not** fail the suite — it is a visibility WARN so analysts know which calls to audit next.
- **N. Pre-mortem completeness (WARN, not FAIL)** — for runs where `confidence_score ≥ 65` AND `decision` is one of {Strong Buy, Buy, Short Candidate}, warns if `pre_mortem.json` is absent. These "betting decisions" are the subset most likely to carry undetected false confidence; a missing adversarial red-team on a ≥65-confidence buy or short is a gap that can lead to a thesis surviving unchallenged. N/A otherwise. Does **not** fail the suite.

The script notes (WARN, not FAIL) any **non-schema artifact** in a run folder (e.g. a stray oversized file) and emits the M/N audit-completeness WARNs. WARNs appear in the per-run output and the report JSON under `warn_checks` but do **not** contribute to `suite_pass`.

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

def isdate(s): 
    try: datetime.date.fromisoformat(s); return True
    except: return False

runs=sorted(glob.glob("analyses/*/decision_record.json"))
if scope not in ("all",""):
    runs=[r for r in runs if scope in r or os.path.basename(os.path.dirname(r)).startswith(scope+"_") or os.path.dirname(r)==scope.rstrip("/")]
results={}; suite_pass=True
for drp in runs:
    run=os.path.dirname(drp); name=os.path.basename(run); checks=[]
    def add(c,ok,detail,na=False):
        checks.append({"check":c,"status":("N/A" if na else ("PASS" if ok else "FAIL")),"detail":detail})
        return ok or na
    # A structural
    ft=os.path.join(run,"final_thesis.md"); rm=os.path.join(run,"RUN_METADATA.md")
    okA = os.path.exists(ft) and os.path.getsize(ft)>1024 and os.path.exists(rm)
    miss99=[os.path.basename(d) for d in glob.glob(os.path.join(run,"*")) if os.path.isdir(d) and not glob.glob(os.path.join(d,"99_*-synthesis.md"))]
    okA = okA and not miss99
    add("A_structural", okA, f"final_thesis>1KB={os.path.exists(ft) and os.path.getsize(ft)>1024}; RUN_METADATA={os.path.exists(rm)}; modules_missing_99={miss99}")
    # B schema
    try: d=json.load(open(drp)); parsed=True
    except Exception as e: d={}; parsed=False; add("B_schema",False,f"JSON parse failed: {e}")
    if parsed:
        missing=[k for k in REQ if k not in d]
        badtype=[k for k in ARRAYS if not isinstance(d.get(k),list)]+[k for k in OBJECTS if not isinstance(d.get(k),dict)]
        okB = parsed and not missing and not badtype and d.get("schema_version")=="1.0"
        add("B_schema", okB, f"missing={missing}; badtype={badtype}; schema_version={d.get('schema_version')}")
    # C decision + basket
    dec=d.get("decision"); bask=d.get("basket"); pt=(d.get("paper_treatment") or "").lower()
    okC = dec in DECISIONS and bask==DECISIONS.get(dec) and any(k in pt for k in PAPER_KW.get(DECISIONS.get(dec,""),["x"]))
    add("C_decision_basket", okC, f"decision={dec!r} basket={bask!r} (expected {DECISIONS.get(dec)!r}); paper_treatment ok={any(k in pt for k in PAPER_KW.get(DECISIONS.get(dec,''),['x']))}")
    # D missing price
    if d.get("entry_price") is None:
        okD = any(k in pt for k in ["no trade"]) or bask in ("Watchlist","Rejected","Insufficient Data","Short","Pair Trade")
        okD = okD and bool(re.search(r"(price|paper trade)", (d.get("notes") or "").lower()))
        add("D_missing_price", okD, f"entry_price null; notes references price/paper-trade={bool(re.search(r'(price|paper trade)', (d.get('notes') or '').lower()))}")
    else:
        add("D_missing_price", True, "entry_price present", na=True)
    # E numeric hygiene
    nums={k:d.get(k) for k in ["expected_return_pct","downside_risk_pct","risk_reward","confidence_score","data_sufficiency_score"]}
    okE=all(v is None or isinstance(v,(int,float)) for v in nums.values()) and all(0<=d.get(k)<=100 for k in ["confidence_score","data_sufficiency_score"] if isinstance(d.get(k),(int,float)))
    add("E_numeric", okE, f"{nums}")
    # F review schedule date math
    sch=d.get("review_schedule") or {}; dd=d.get("decision_date")
    okF=isdate(dd) and all(w in sch for w in ["30d","90d","180d","365d"])
    detailF=[]
    if okF:
        base=datetime.date.fromisoformat(dd)
        for w,days in [("30d",30),("90d",90),("180d",180),("365d",365)]:
            exp=(base+datetime.timedelta(days=days)).isoformat()
            if sch.get(w)!=exp: okF=False; detailF.append(f"{w}={sch.get(w)} exp {exp}")
    add("F_review_dates", okF, "; ".join(detailF) or f"all 30/90/180/365 = decision_date+N from {dd}")
    # G audit reports (optional)
    # resolve the LATEST version of an audit report (convention: base=first, _v2/_v3=newer => authoritative is the highest version)
    def _latest(stem):
        c=glob.glob(os.path.join(run, stem[:-5]+"*.json"))
        return max(c, key=lambda x:(int(re.search(r"_v(\d+)\.json$",x).group(1)) if re.search(r"_v(\d+)\.json$",x) else 1)) if c else None
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
        if re.search(r"(?m)^Agent:\s+\S+\s*$", tail): stray.append(os.path.relpath(mf,run))
    add("H_no_stray_confirmation", not stray, f"stray={stray}")
    # I decision in thesis
    try: thesis=open(ft).read()
    except: thesis=""
    add("I_decision_in_thesis", (dec or "@@") in thesis, f"decision string present in final_thesis.md={(dec or '@@') in thesis}")
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
    # M: audit completeness for high-confidence, actionable decisions (WARN, not FAIL)
    ACTIONABLE_DECS={"Strong Buy","Buy","Starter Position Only","Avoid","Short Candidate"}
    conf_s=d.get("confidence_score")
    m_active = dec in ACTIONABLE_DECS and isinstance(conf_s,(int,float)) and conf_s>=60
    vr_present=bool(_latest("verification_report.json"))
    if not m_active:
        checks.append({"check":"M_verify_completeness","status":"N/A","detail":f"conf={conf_s} dec={dec!r} — below 60 or non-actionable"})
    else:
        checks.append({"check":"M_verify_completeness","status":("PASS" if vr_present else "WARN"),
                       "detail":f"conf={conf_s} dec={dec!r}; verification_report={'present' if vr_present else 'ABSENT — run /research:verify-evidence'}"})
    # N: pre-mortem completeness for betting decisions (conf ≥ 65, Strong Buy / Buy / Short)
    BETTING_DECS={"Strong Buy","Buy","Short Candidate"}
    pm_present=bool(_latest("pre_mortem.json"))
    n_active = dec in BETTING_DECS and isinstance(conf_s,(int,float)) and conf_s>=65
    if not n_active:
        checks.append({"check":"N_premortem_completeness","status":"N/A","detail":f"conf={conf_s} dec={dec!r} — below 65 or non-betting"})
    else:
        checks.append({"check":"N_premortem_completeness","status":("PASS" if pm_present else "WARN"),
                       "detail":f"conf={conf_s} dec={dec!r}; pre_mortem={'present' if pm_present else 'ABSENT — run /research:pre-mortem'}"})
    # WARN non-schema files
    extras=[os.path.basename(x) for x in glob.glob(os.path.join(run,"*")) if os.path.isfile(x) and os.path.basename(x) not in SCHEMA_FILES and not os.path.basename(x).endswith(("_decision_review.json","_calibration_summary.json")) and "review" not in os.path.basename(x) and "_v" not in os.path.basename(x)]
    run_pass=all(c["status"]!="FAIL" for c in checks)
    run_warns=[c["check"] for c in checks if c["status"]=="WARN"]
    suite_pass = suite_pass and run_pass
    results[name]={"run_root":run,"ticker":d.get("ticker"),"decision":dec,"pass":run_pass,
                   "checks":checks,"warn_checks":run_warns,"warn_nonschema_files":extras}

# J FRAMEWORK SOURCE CONTRACTS (suite-level, run once; protects §24 wiring + the §17 catalyst module)
FRAMEWORK_CONTRACTS={
 "CLAUDE.md":["## 24. Avoid Big Risks","Crooks and integrity","Turnarounds","High debt and the survival test","Serial acquirers","Fast-changing industries","Unaligned owners"],
 ".claude/agents/business-model/MODULE_RULES.md":["Rejector-Filter Penalties & Caps","Serial acquirers","Fast-changing industry"],
 ".claude/agents/business-model/07_business-quality.md":["Industry rate-of-change","11 quality factors"],
 ".claude/agents/business-model/01_disqualifier-scan.md":["Integrity note","Filter 1"],
 ".claude/agents/business-model/11_capital-allocation-governance.md":["Filter 4","opportunity cost"],
 ".claude/agents/management-governance/MODULE_RULES.md":["RF-CAP-004","RF-OWN-004","RF-MGT-004","§24"],
 ".claude/agents/management-governance/01_management-and-track-record.md":["Turnaround","Filter 2"],
 ".claude/agents/management-governance/04_ownership-and-insider-behavior.md":["RF-OWN-004","Filter 6"],
 ".claude/agents/balance-sheet-survival/MODULE_RULES.md":["Net cash is a strategic asset","Filter 3"],
 ".claude/agents/valuation/MODULE_RULES.md":["RF-OWN-004","Filter 6","value trap"],
 ".claude/agents/synthesizer.md":["Avoid-Big-Risks","§24","DEFER to the catalyst module"],
 ".claude/agents/catalyst/MODULE_RULES.md":["§17 Catalyst Discipline","Catalyst Category Checklist","No proven catalyst yet"],
 ".claude/agents/catalyst/01_catalyst-calendar.md":["12-Month Catalyst Calendar","Bullish Trigger","Bearish Trigger"],
 ".claude/agents/catalyst/99_catalyst-synthesis.md":["Catalyst strength /100","No proven catalyst yet"],
 ".claude/agents/memo-writer.md":["memo.md","colleague","~10"],
 ".claude/commands/research/full.md":["audit_dossier.md","memo.md","memo-writer"],
 ".claude/settings.json":["SessionStart","review_due.py"],
 ".claude/hooks/review_due.py":["review_schedule","research:review-decisions due"],
}
jchecks=[]
for jf,subs in FRAMEWORK_CONTRACTS.items():
    try: jtxt=open(jf).read()
    except Exception as e:
        jchecks.append({"file":jf,"status":"FAIL","missing":["unreadable: "+str(e)[:60]]}); suite_pass=False; continue
    jmiss=[s for s in subs if s not in jtxt]
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
    warns=r.get("warn_checks",[])
    extras_warn=r.get("warn_nonschema_files",[])
    parts=[f"  {nm}: {'PASS' if r['pass'] else 'FAIL'} ({r['decision']})"]
    if warns: parts.append("WARN="+",".join(warns))
    if fails: parts.append("FAIL="+",".join(fails))
    if extras_warn: parts.append("extras="+",".join(extras_warn))
    print(" ".join(parts))
jfails=[j["file"] for j in jchecks if j["status"]=="FAIL"]
print("  framework source contracts (J: §24 + catalyst + tiers):", "PASS" if not jfails else "FAIL "+";".join(jfails))
for j in jchecks:
    if j["status"]=="FAIL": print(f"     FAIL {j['file']} missing={j['missing']}")
print("WROTE", of)
PY
```

## 3. Verdict, report, git

Read the script's output. Confirm the eval report parses (`python3 -m json.tool`). Print a human summary: overall **PASS/FAIL**, the per-run check matrix, any FAILs with detail, and any non-schema-file WARNs. Then commit straight to `main` (add only `analyses/eval/<DATE>_eval_report*.json`), message `Eval: <PASS|FAIL> — <n_runs> golden runs (<DATE>)`, and push. Report the SHA.

**If the suite FAILs:** report it plainly as a regression — name the run, the failed check, and the detail. Do not soften it; a FAIL means a contract broke and must be fixed before the engine is trusted.

---

## Hard rules

- **Deterministic only.** No agent/pipeline re-runs, no LLM judgment in the checks — pure structural/schema/contract/math assertions, so the result is reproducible and a real regression gate.
- **Read-only on run artifacts;** writes only the dated `analyses/eval/` report.
- **Any FAIL fails the suite.** Optional-artifact absence is N/A, not FAIL. A non-schema stray file is a WARN, not a FAIL. Checks M and N are WARNs — they surface audit gaps on high-confidence decisions without failing the suite. A WARN does not block merging or signal a regression; it signals "act on this before the next trade."
- Grounded in `CLAUDE.md` §18/§10/§15, `DECISION_LEDGER.md` §5/§8, `MODULE_PIPELINE.md`; spawns no subagents.
