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
"$PY" - <<'PY' || rc=1
import re, json, os, tempfile, subprocess, sys, shutil
full=open(".claude/commands/research/full.md").read()
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
"$PY" - <<'PY' || rc=1
import re, textwrap, sys
ev=open(".claude/commands/research/eval.md").read()
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
]
for b in BANNED:
    hits=[k for k,t in low.items() if b in t]
    if hits: print(f"  FAIL: drift phrasing returned -> {b!r} in {hits}"); ok=False
# (2) canonical definitions must be present ONCE in MODULE_RULES (the single source of truth)
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

[ $rc -eq 0 ] && echo "ALL SMOKE TESTS PASS" || echo "SMOKE TESTS FAILED"
exit $rc
