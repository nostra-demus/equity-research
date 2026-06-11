#!/usr/bin/env bash
# Smoke tests for the deterministic extractor/resolver tools. Right-sized adversarial
# checks (NOT a framework) — born from the PR#9 review, which found 3 bugs in code that
# had zero test coverage. Run: .claude/tools/test-tools.sh   (exit 0 = all pass)
set -uo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
PY="${DIR}/.venv/bin/python"; [ -x "$PY" ] || PY="python3"
rc=0

echo "== resolve_citations.py: sign-sensitive matching =="
"$PY" - "$DIR/resolve_citations.py" <<'PY' || rc=1
import importlib.util, sys
spec=importlib.util.spec_from_file_location("rc", sys.argv[1]); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
corpus=["v -4.6 x","v 4.6 x","v +4.6 x","v 14.6 x","v -14.6 x"]
def which(val):
    pat=m.token_regex(val); return [l for l in corpus if pat and pat.search(l)]
ok=True
# a cited NEGATIVE figure must verify ONLY against the negative form
if which("-4.6")!=["v -4.6 x"]: print("  FAIL  -4.6 matched", which("-4.6")); ok=False
# a cited UNSIGNED figure must verify against unsigned/positive but NEVER the negative form
if set(which("4.6"))!={"v 4.6 x","v +4.6 x"}: print("  FAIL  4.6 matched", which("4.6")); ok=False
# tolerance preserved: 4.6 still matches 4.60, commas still match
if not m.token_regex("4.6").search("a 4.60 b"): print("  FAIL  4.6 should match 4.60"); ok=False
if not m.token_regex("30711").search("a 30,711 b"): print("  FAIL  30711 should match 30,711"); ok=False
# no coincidental substring: 2442 must not match inside 12442 / -0.092442
if m.token_regex("2442").search("a 12442 b") or m.token_regex("2442").search("a -0.092442 b"):
    print("  FAIL  2442 leaked into a longer number"); ok=False
print("  PASS: sign-sensitive + tolerant + no-substring" if ok else "  -> sign test FAILED")
sys.exit(0 if ok else 1)
PY

echo "== extract_pool.py: reset_dimensions is CALLABLE (not an attribute), imports clean =="
"$PY" - "$DIR/extract_pool.py" <<'PY' || rc=1
import importlib.util, sys, openpyxl
spec=importlib.util.spec_from_file_location("ep", sys.argv[1]); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
wb=openpyxl.Workbook(); ws=wb.active
import io,tempfile,os
b=io.BytesIO(); wb.save(b); b.seek(0)
rws=openpyxl.load_workbook(b, read_only=True).worksheets[0]
ok=callable(getattr(rws,"reset_dimensions",None))
if ok:
    try: rws.reset_dimensions(); print("  PASS: reset_dimensions() callable and runs")
    except Exception as e: print("  FAIL: reset_dimensions() raised", e); ok=False
else:
    print("  FAIL: reset_dimensions is not callable in this openpyxl"); ok=False
sys.exit(0 if ok else 1)
PY

echo "== full.md finish-gate: idempotent rerun cycle (fail -> stamp -> fix -> strip) =="
"$PY" - "$DIR/../commands/research/full.md" <<'PY' || rc=1
import re, json, os, tempfile, subprocess, sys, shutil
full=open(sys.argv[1]).read()
m=re.search(r'python3 - "<RUN_ROOT>" <<.PY.\n(.*?)\nPY\n```', full, re.S)
if not m: print("  FAIL: could not extract the finish-gate script from full.md"); sys.exit(1)
d=tempfile.mkdtemp(); gp=os.path.join(d,"gate.py"); open(gp,"w").write(m.group(1))
dr={"expected_return_pct":99.0,"entry_price":100,
    "scenarios":[{"probability":50,"return_pct":10,"price_target":110},{"probability":50,"return_pct":-10,"price_target":90}],
    "confidence_score":50,"data_sufficiency_score":60,"notes":"x"}
json.dump(dr, open(os.path.join(d,"decision_record.json"),"w"))
open(os.path.join(d,"final_thesis.md"),"w").write("# Thesis\n\nReal body content.\n")
MARK="PROVISIONAL — the automated finish-gate"
r1=subprocess.run([sys.executable,gp,d],capture_output=True,text=True).stdout; b1=open(os.path.join(d,"final_thesis.md")).read()
ok = ("PROVISIONAL" in r1) and (MARK in b1)                                  # fail -> banner stamped
dr["expected_return_pct"]=0.0; json.dump(dr, open(os.path.join(d,"decision_record.json"),"w"))
r2=subprocess.run([sys.executable,gp,d],capture_output=True,text=True).stdout; b2=open(os.path.join(d,"final_thesis.md")).read()
ok = ok and ("PASS" in r2) and (MARK not in b2) and ("Real body content." in b2)  # fixed -> banner stripped, body intact
print("  PASS: stamps on fail, strips on pass, body preserved" if ok else f"  FAIL: r1={r1.strip()!r} r2={r2.strip()!r} banner_after={MARK in b2}")
shutil.rmtree(d); sys.exit(0 if ok else 1)
PY

echo "== eval.md check M: direction-aware risk/reward (short vs long) =="
"$PY" - "$DIR/../commands/research/eval.md" <<'PY' || rc=1
import re, textwrap, sys
ev=open(sys.argv[1]).read()
m=re.search(r'\n(\s*pwt=sum\(p/100\.0\*t for p,t in zip\(probs,tgts\)\).*?if abs\(rr-crr\)>max\([^\n]*\))', ev, re.S)
if not m: print("  FAIL: could not extract the check-M math block from eval.md"); sys.exit(1)
code=compile(textwrap.dedent(m.group(1)),"<checkM>","exec")
DECISIONS={"Short Candidate":"Short","Buy":"Selected"}
def chk(dec,probs,rets,tgts,ep,rr):
    calc_er=sum(p/100.0*r for p,r in zip(probs,rets))
    ns={"probs":probs,"rets":rets,"tgts":tgts,"ep":ep,"dec":dec,"DECISIONS":DECISIONS,
        "calc_er":calc_er,"okM":True,"det":[],"d":{"risk_reward":rr},
        "abs":abs,"sum":sum,"zip":zip,"round":round,"max":max,"min":min,"isinstance":isinstance}
    exec(code, ns)   # single namespace so the genexprs in the block resolve correctly
    return ns["okM"]
ok=True
# a CORRECT short (targets fall = profit; short-signed returns; rr matches) must PASS
if not chk("Short Candidate",[60,40],[30,-15],[70,115],100,0.8): print("  FAIL: correct short flagged"); ok=False
# a short whose returns were computed LONG-side (wrong sign) must be CAUGHT (fail)
if chk("Short Candidate",[60,40],[-30,15],[70,115],100,0.8): print("  FAIL: wrong-sign short NOT caught"); ok=False
# a CORRECT long must still PASS (no regression)
if not chk("Buy",[50,50],[30,-10],[130,90],100,1.0): print("  FAIL: correct long flagged"); ok=False
print("  PASS: correct short passes, wrong-sign short fails, long unaffected" if ok else "  -> check-M test FAILED")
sys.exit(0 if ok else 1)
PY

echo "== valuation canonical-definition regression guard (prompt-lint — weaker than the code tests above; born from the PR#10 review) =="
# Guards the SPECIFIC cross-file drift the PR#10 review found: margin-of-safety re-defined as
# distance-to-bear, and the base case described as a 'range'. NOT a general consistency engine —
# its only job is to stop these exact phrasings from silently returning. The real prevention is the
# DRY collapse (each definition stated once in MODULE_RULES, referenced elsewhere).
"$PY" - "$DIR/../agents/valuation" <<'PY' || rc=1
import glob, os, sys
vdir=sys.argv[1]
files=glob.glob(os.path.join(vdir,"*.md"))
low={os.path.basename(f).lower():open(f,encoding="utf-8").read().lower() for f in files}
ok=True
if not files: print("  FAIL: no valuation md files found at", vdir); ok=False
# (1) old drift phrasings that must NOT reappear anywhere in the valuation module
BANNED=[
  "always present fair value as a **range**",                 # old Calc-Std 11 opener
  "margin of safety is the point",                            # old Core Principle 4 opener
  "margin of safety: distance from current price to the bear",# old 07 step 6 (MoS == bear distance)
  "the margin of safety to the bear case",                    # old 07 description
  "base-case fair value (a range)",                           # base case described as a band
  "fair value {range}/share",                                 # old CHAT verdict templates
  "the fair-value range is a range pulled from",              # old 99 self-check
  "higher = better | downside protection",                    # old MoS score row (== bear distance)
  "a fair-value range",                                       # base case as a range (00/README/banned-row drift)
  "implied value as a range",                                 # 02/03 method output as range-only (no base point)
  "fair-value (or implied) range",                            # old 99 workflow step 2
]
for b in BANNED:
    hits=[k for k,t in low.items() if b in t]
    if hits: print(f"  FAIL: drift phrasing returned -> {b!r} in {hits}"); ok=False
# (2) canonical definitions must be present in MODULE_RULES (the single source of truth)
mr=low.get("module_rules.md","")
NEED=[
  ("/ base-case fair value",        "canonical margin-of-safety denominator"),
  ("/ current price",               "canonical downside-to-bear denominator"),
  ("single canonical no-price cap", "the DRY no-price cap marker"),
]
for n,desc in NEED:
    if n not in mr: print(f"  FAIL: {desc} missing from MODULE_RULES -> {n!r}"); ok=False
print("  PASS: no MoS/range drift; MoS, downside-to-bear, and the no-price cap each defined once" if ok else "  -> valuation regression guard FAILED")
sys.exit(0 if ok else 1)
PY

echo "== cyclical-normalisation + canonical-definition PLACEMENT guard (prompt-lint — born from the 2026-06-10 TMCV optimistic-drift audit) =="
# Guards the C1/C2 fix PLACEMENT: (1) each new rule is present in its CORRECT file; (2) the ROCE
# canonical rule stays in the moat (which branches ROIC vs ROE by business type) and is NEVER
# hoisted into CLAUDE.md §15, where a blanket through-cycle-ROIC rule would force an operating-
# company metric onto banks/REITs (the HIGH-severity error the audit caught). prompt-lint only —
# the semantic risks (duplication, dependency direction, graceful degradation) stay with
# verify-evidence §4C and the layer DAG, NOT grep.
"$PY" - "$DIR/../.." <<'PY' || rc=1
import os, sys
root=sys.argv[1]
def read(p):
    try: return open(os.path.join(root,p),encoding="utf-8").read()
    except FileNotFoundError: return None
ok=True
# (1) positive — each new rule present in its correct file
PRESENT=[
  (".claude/agents/earnings/MODULE_RULES.md",                         "Cycle-Position Rule",                            "earnings cycle-position rule (the source)"),
  (".claude/agents/earnings/02_revenue-drivers.md",                   "cycle position (peak/mid/trough) is stated",     "earnings 02 cycle self-check"),
  (".claude/agents/earnings/03_margin-drivers.md",                    "cycle position (peak/mid/trough) is stated",     "earnings 03 cycle self-check"),
  (".claude/agents/earnings/06_earnings-quality.md",                  "Lead with normalised operating FCF",             "earnings 06 FCF headline-lead"),
  (".claude/agents/valuation/MODULE_RULES.md",                        "benchmarked against BOTH a peer-normal margin",  "valuation terminal-margin peer-normal+prior-trough anchor"),
  (".claude/agents/valuation/07_scenario-and-fair-value.md",          "true through-cycle trough",                      "valuation 07 true-trough bear case"),
  (".claude/agents/balance-sheet-survival/MODULE_RULES.md",           "Label the cycle position of the EBITDA",         "BSS leverage cycle-axis"),
  (".claude/agents/balance-sheet-survival/06_downside-stress-test.md","Pending debt-funded acquisition check",          "BSS pro-forma post-event leverage step"),
  (".claude/agents/business-model/09_moat.md",                        "Use a through-cycle return",                     "moat through-cycle ROIC enforcement"),
  (".claude/agents/business-model/07_business-quality.md",            "at a cyclical peak, anchor them",                "business-quality peak-return ring-fence"),
  ("CLAUDE.md",                                                       "normalised operating FCF",                       "§15 FCF headline-lead"),
  ("CLAUDE.md",                                                       "gross-liquidity",                                "§15 net-cash basis label"),
  (".claude/agents/synthesizer.md",                                   "Net-cash / leverage headline disclosure",        "synthesizer net-cash headline gate"),
  (".claude/agents/balance-sheet-survival/01_capital-structure-and-leverage.md","state it with its basis (CLAUDE.md §15)","BSS/01 net-cash basis labelling (the source, not just the headline)"),
  (".claude/agents/valuation/04_intrinsic-dcf.md",                    "benchmarked against peer-normal AND the company",  "val/04 terminal-margin benchmark self-check"),
]
for path, needle, desc in PRESENT:
    t=read(path)
    if t is None: print(f"  FAIL: file missing -> {path}"); ok=False
    elif needle not in t: print(f"  FAIL: {desc} missing from {path} -> {needle!r}"); ok=False
# (2) negative — the ROCE canonical rule must NOT live in CLAUDE.md (it belongs in the moat;
#     a blanket §15 ROCE-on-invested-capital rule misfires for banks/REITs that use ROE)
claude=(read("CLAUDE.md") or "").lower()
for b in ["gross invested capital","through-cycle return on","canonical figure is a through-cycle"]:
    if b in claude:
        print(f"  FAIL: ROCE-canonical phrasing leaked into CLAUDE.md (financials/REIT misfire risk) -> {b!r}"); ok=False
print("  PASS: cycle/definition rules in their correct files; ROCE rule kept out of §15" if ok else "  -> cyclical-normalisation placement guard FAILED")
sys.exit(0 if ok else 1)
PY

[ $rc -eq 0 ] && echo "ALL SMOKE TESTS PASS" || echo "SMOKE TESTS FAILED"
exit $rc
