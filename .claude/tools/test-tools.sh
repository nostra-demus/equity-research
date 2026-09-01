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

echo "== full.md finish-gate: scenario-math PARITY with eval check M (long + short) + idempotent stamp/strip =="
"$PY" - "$DIR/../commands/research/full.md" <<'PY' || rc=1
import re, json, os, tempfile, subprocess, sys, shutil
full=open(sys.argv[1]).read()
m=re.search(r'python3 - "<RUN_ROOT>" <<.PY.\n(.*?)\nPY\n```', full, re.S)
if not m: print("  FAIL: could not extract the finish-gate script from full.md"); sys.exit(1)
d=tempfile.mkdtemp(); gp=os.path.join(d,"gate.py"); open(gp,"w").write(m.group(1))
MARK="PROVISIONAL — the automated finish-gate"
BASE={"decision_date":"2026-07-01","thesis_type":["Company-specific"],"confidence_score":50,"data_sufficiency_score":60,"notes":"x"}
VALID_BODY=("# Thesis\n\nSIGN CHECK: margin-drivers — recovering margin (tailwind), high confidence; "
            "the thesis agrees.\n\nReal body content.\n")
def gate(rec, body=VALID_BODY):
    json.dump(rec, open(os.path.join(d,"decision_record.json"),"w"))
    open(os.path.join(d,"final_thesis.md"),"w").write(body)
    out=subprocess.run([sys.executable,gp,d],capture_output=True,text=True).stdout
    return out, open(os.path.join(d,"final_thesis.md")).read()
ok=True
def expect(name, rec, should_pass):
    global ok
    out,b=gate(dict(rec))
    passed=("GATE: PASS" in out) and (MARK not in b); prov=("PROVISIONAL" in out) and (MARK in b)
    if not (passed if should_pass else prov): ok=False; print(f"  FAIL {name}: out={out.strip()!r}")
# LONG — entry 100, bull/base/bear = 150/125/90 (25/50/25), returns +50/+25/-10: ER=Sum=22.5, pwt=122.5,
#   ER_from_target=22.5, rr=(122.5-100)/(100-90)=2.25, downside=-min(50,25,-10)=+10, MoS=(base 125 -100)/125=+20
LONG={**BASE,"decision":"Buy","entry_price":100,"expected_return_pct":22.5,"risk_reward":2.25,"downside_risk_pct":10,"margin_of_safety_pct":20,
      "scenarios":[{"label":"bull","probability":25,"return_pct":50,"price_target":150},
                   {"label":"base","probability":50,"return_pct":25,"price_target":125},
                   {"label":"bear","probability":25,"return_pct":-10,"price_target":90}]}
expect("long all-correct -> PASS", LONG, True)
expect("long wrong expected_return -> PROVISIONAL", {**LONG,"expected_return_pct":99}, False)
expect("long wrong risk_reward -> PROVISIONAL", {**LONG,"risk_reward":5.0}, False)
expect("long wrong downside (sign flip) -> PROVISIONAL", {**LONG,"downside_risk_pct":-10}, False)
expect("long MISSING downside -> PROVISIONAL (fail-when-omitted)", {k:v for k,v in LONG.items() if k!="downside_risk_pct"}, False)
expect("long wrong margin_of_safety -> PROVISIONAL", {**LONG,"margin_of_safety_pct":50}, False)
# ER-from-target: returns sum to the headline (Sum=15) but the price_targets imply a different ER (pwt=122.5 ->
#   ER_from_target=22.5). rr/downside/MoS are left consistent so ONLY the ER-from-target cross-check fires.
ERT={**BASE,"decision":"Buy","entry_price":100,"expected_return_pct":15,"risk_reward":2.25,"downside_risk_pct":10,"margin_of_safety_pct":20,
     "scenarios":[{"label":"bull","probability":25,"return_pct":30,"price_target":150},
                  {"label":"base","probability":50,"return_pct":20,"price_target":125},
                  {"label":"bear","probability":25,"return_pct":-10,"price_target":90}]}
expect("ER-from-target mismatch (returns vs targets) -> PROVISIONAL", ERT, False)
# partial price_targets (bear omits it) must FAIL all-or-none, not silently skip the target cross-checks
expect("partial price_targets -> PROVISIONAL", {**LONG,"scenarios":[
        {"label":"bull","probability":25,"return_pct":50,"price_target":150},
        {"label":"base","probability":50,"return_pct":25,"price_target":125},
        {"label":"bear","probability":25,"return_pct":-10}]}, False)
# SHORT — entry 100, bull/base/bear = 60/80/120 (30/40/30), returns +40/+20/-20 (position-signed): ER=Sum=14,
#   pwt=86, worst=max=120, ER_from_target=(100-86)/100=14, rr=(100-86)/(120-100)=0.7, downside=-min(40,20,-20)=+20,
#   MoS=(base 80 -100)/80=-25 (NEGATIVE — an overvalued short, same formula, no branch)
SHORT={**BASE,"decision":"Short Candidate","entry_price":100,"expected_return_pct":14,"risk_reward":0.7,"downside_risk_pct":20,"margin_of_safety_pct":-25,
       "scenarios":[{"label":"bull","probability":30,"return_pct":40,"price_target":60},
                    {"label":"base","probability":40,"return_pct":20,"price_target":80},
                    {"label":"bear","probability":30,"return_pct":-20,"price_target":120}]}
expect("short all-correct (direction-aware, MoS -25) -> PASS", SHORT, True)
# the exact bug once shipped: applying the LONG price formula (price-bear)/price to a short gives -20, not +20
expect("short long-formula downside (-20) -> PROVISIONAL", {**SHORT,"downside_risk_pct":-20}, False)
expect("short wrong risk_reward -> PROVISIONAL", {**SHORT,"risk_reward":2.0}, False)
# MoS is direction-uniform: a short's correct MoS is NEGATIVE; a long-style +25 must be caught
expect("short wrong-sign MoS (+25 not -25) -> PROVISIONAL", {**SHORT,"margin_of_safety_pct":25}, False)
# Codex-review hardening: each fires only its own check.
# risk_reward null-but-derivable (worst target 90 < entry 100 → adverse) must FAIL, not skip
expect("risk_reward omitted (derivable) -> PROVISIONAL", {k:v for k,v in LONG.items() if k!="risk_reward"}, False)
# a present-but-non-numeric price_target (the string "150") must FAIL, not be treated as absent
expect("string price_target -> PROVISIONAL", {**LONG,"scenarios":[
        {"label":"bull","probability":25,"return_pct":50,"price_target":"150"},
        {"label":"base","probability":50,"return_pct":25,"price_target":125},
        {"label":"bear","probability":25,"return_pct":-10,"price_target":90}]}, False)
# a non-numeric margin_of_safety_pct must FAIL
expect("non-numeric MoS ('20%') -> PROVISIONAL", {**LONG,"margin_of_safety_pct":"20%"}, False)
# a numeric MoS with no base-labelled scenario cannot be re-derived → FAIL
expect("MoS present but no 'base' scenario -> PROVISIONAL", {**LONG,"scenarios":[
        {"label":"bull","probability":25,"return_pct":50,"price_target":150},
        {"label":"mid","probability":50,"return_pct":25,"price_target":125},
        {"label":"bear","probability":25,"return_pct":-10,"price_target":90}]}, False)
# idempotency: fail stamps, fix strips, body preserved
o1,b1=gate({**LONG,"expected_return_pct":99}); staged=("PROVISIONAL" in o1) and (MARK in b1)
o2,b2=gate(LONG); stripped=("GATE: PASS" in o2) and (MARK not in b2) and ("Real body content." in b2)
if not (staged and stripped): ok=False; print(f"  FAIL idempotent stamp/strip: staged={staged} stripped={stripped}")
print("  PASS: long+short parity (ER/ER-from-target/risk_reward/downside/MoS); all-or-none + non-numeric targets; risk_reward & downside fail-when-omitted; MoS non-numeric / not-re-derivable / wrong-sign + long-formula-on-short caught; idempotent stamp/strip" if ok else "  -> finish-gate parity test FAILED")
shutil.rmtree(d); sys.exit(0 if ok else 1)
PY

echo "== eval.md check M: direction-aware risk/reward + downside (short vs long) =="
# check M's scenario-math reconciliation lives in scripts/eval.py, exercised by `eval.py all` on committed run
# fixtures (NOT fixture-free here). The FINISH-GATE PARITY test above tests the full.md Step-10B gate — a CLOSE
# mirror of check M (same ER / ER-from-target / risk_reward / downside / MoS math, long + short) — but it is a
# SEPARATE implementation, so this section does NOT test eval.py's own check M and must not claim to: a regression
# in eval.py's short path would not be caught here. The two are close but not byte-identical (the eval side also
# date-gates the MoS "required-when-derivable" rule). A dedicated fixture-free `eval.py selftest` case for check M
# (extract to a module-level fn like W/X/Y/Z, drive long + short) remains a follow-up.
echo "  SKIP: eval.py check M is covered by 'eval.py all' on committed fixtures; the finish-gate MIRROR (a separate impl) is tested above — this does NOT test eval.py's own check M"

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
  (".claude/agents/balance-sheet-survival/06_downside-stress-test.md","Pending acquisition (pro-forma) check",          "BSS pro-forma post-event leverage step"),
  (".claude/agents/business-model/09_moat.md",                        "Use a through-cycle return",                     "moat through-cycle ROIC enforcement"),
  (".claude/agents/business-model/07_business-quality.md",            "at a cyclical peak, anchor them",                "business-quality peak-return ring-fence"),
  ("CLAUDE.md",                                                       "normalised operating FCF",                       "§15 FCF headline-lead"),
  ("CLAUDE.md",                                                       "gross-liquidity",                                "§15 net-cash basis label"),
  (".claude/agents/synthesizer.md",                                   "Net-cash / leverage headline disclosure",        "synthesizer net-cash headline gate"),
  (".claude/agents/balance-sheet-survival/01_capital-structure-and-leverage.md","state it with its basis (CLAUDE.md §15)","BSS/01 net-cash basis labelling (the source, not just the headline)"),
  (".claude/agents/balance-sheet-survival/MODULE_RULES.md",           "the **strict** basis (CLAUDE.md §15)",           "BSS MODULE_RULES Calculation Standard 3 net-debt strict-basis definition"),
  (".claude/agents/balance-sheet-survival/01_capital-structure-and-leverage.md","Net debt (strict, §15)",                "BSS/01 Section-4 net-debt bridge carries both §15 bases (the canonical anchor)"),
  (".claude/agents/valuation/04_intrinsic-dcf.md",                    "benchmarked against peer-normal AND the company",  "val/04 terminal-margin benchmark self-check"),
  (".claude/agents/valuation/04_intrinsic-dcf.md",                    "Working capital scales with revenue",            "val/04 working-capital-scales-with-revenue (Q1)"),
  (".claude/agents/business-model/08_competitive-map.md",             "Profitability / return on capital",              "competitive-map per-peer return-on-capital (E — the moat's peer anchor)"),
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
# (3) COMPLETENESS — the young-entity/predecessor fallback must appear in EVERY cyclical-normalisation
#     rule, not just some. (Self-review found BSS had the mid-cycle normalisation but NOT the fallback,
#     leaving it unsatisfiable for a <1-cycle demerged entity — the exact motivating case. A per-file
#     presence check can't catch a fallback missing from ONE file in a set; this asserts it across the set.)
for path in [".claude/agents/earnings/MODULE_RULES.md",".claude/agents/valuation/MODULE_RULES.md",
             ".claude/agents/valuation/07_scenario-and-fair-value.md",
             ".claude/agents/balance-sheet-survival/MODULE_RULES.md",".claude/agents/business-model/09_moat.md"]:
    t=(read(path) or "").lower()
    if "young entity" not in t and "predecessor" not in t:
        print(f"  FAIL: cyclical-normalisation rule missing the young-entity/predecessor fallback -> {path}"); ok=False
# (4) vocab — the strict net-debt basis must not be called 'basic' in valuation (a third term for §15's 'strict')
if "broad vs basic" in (read(".claude/agents/valuation/MODULE_RULES.md") or "").lower():
    print("  FAIL: valuation MODULE_RULES uses 'broad vs basic' — harmonise to the §15 strict/broad vocabulary"); ok=False
# (5) CONTRADICTION regression — the old broad-basis 'net cash, state it plainly' instruction (the TMCV
#     ₹8,231-vs-₹2,082 site) must NOT return. This is the only class of bug that a positive presence check
#     CANNOT see (the rule can be present AND contradicted at once); a targeted negative guard is the only
#     deterministic way to catch a contradiction returning — it is whack-a-mole (one phrasing), not a
#     semantic engine, so it complements verify-evidence rather than replacing it.
if "investments > gross debt), state it plainly" in (read(".claude/agents/balance-sheet-survival/01_capital-structure-and-leverage.md") or "").lower():
    print("  FAIL: BSS/01 reintroduced the broad-basis 'net cash, state it plainly' instruction that contradicts §15"); ok=False
#     Same class, one file up: the module's own Calculation Standard 3 must not return to defining
#     bare "net debt" on the broad basis (gross debt − cash − liquid investments with no basis label) —
#     every BSS agent reads MODULE_RULES first, so an unlabelled broad definition there overrides the
#     BSS/01 fix in practice (found in the PR#11 review).
if "cash & equivalents − liquid short-term investments. state the definition;" in (read(".claude/agents/balance-sheet-survival/MODULE_RULES.md") or "").lower():
    print("  FAIL: BSS MODULE_RULES Calculation Standard 3 reverted to the unlabelled broad net-debt definition that contradicts §15"); ok=False
#     And BSS/01's Section-4 bridge must not return to a single combined "− Cash & liquid investments"
#     row yielding a bare "Net debt" (an unlabelled broad figure as the canonical anchor every downstream
#     solvency agent reuses verbatim — found by the PR#11 adversarial verify).
if "| − cash & liquid investments |" in (read(".claude/agents/balance-sheet-survival/01_capital-structure-and-leverage.md") or "").lower():
    print("  FAIL: BSS/01 Section 4 reverted to the combined cash+investments row that yields an unlabelled broad net debt"); ok=False
print("  PASS: cycle/definition rules in their correct files; ROCE out of §15; young-entity fallback complete; no net-cash contradiction" if ok else "  -> cyclical-normalisation placement guard FAILED")
sys.exit(0 if ok else 1)
PY

echo "== financial-valuation scope + dual-read regression guard (prompt-lint — born from the 2026-08-31 NU valuation diagnostic) =="
"$PY" - "$DIR/../.." <<'PY' || rc=1
import os, sys
root=sys.argv[1]
def read(p):
    with open(os.path.join(root,p),encoding="utf-8") as f: return f.read()
ok=True
present=[
  (".claude/agents/valuation/MODULE_RULES.md", "same valuation object, cash flows, currency, tax basis, and method", "scope-match canonical rule"),
  (".claude/agents/valuation/04_intrinsic-dcf.md", "A CGU / subsidiary impairment rate", "intrinsic-rate scope guard"),
  (".claude/agents/business-model/09_moat.md", "same entity / group scope", "moat rate/return scope guard"),
  (".claude/agents/valuation/03_relative-valuation-peers.md", "P/TBV = P/E × ROTE", "financial dual-read peer check"),
  (".claude/agents/valuation/07_scenario-and-fair-value.md", "peer-set maximum is not a hard ceiling", "scenario peer-ceiling guard"),
  (".claude/agents/valuation/99_valuation-synthesis.md", "never a hand-picked weighted pair", "full-field dispersion cap"),
  (".claude/agents/synthesizer.md", "Never add a consensus or other tail case solely", "no procedural consensus tail"),
]
for path,needle,desc in present:
    if needle not in read(path):
        print(f"  FAIL: {desc} missing from {path} -> {needle!r}"); ok=False
old={
  ".claude/agents/valuation/MODULE_RULES.md": ["usually the best-evidenced cost-of-capital number"],
  ".claude/agents/valuation/04_intrinsic-dcf.md": ["usually the best-evidenced cost-of-capital figure"],
  ".claude/agents/valuation/99_valuation-synthesis.md": ["Methods disagree >40% unreconciled"],
}
for path,needles in old.items():
    text=read(path)
    for needle in needles:
        if needle in text:
            print(f"  FAIL: NU defect instruction returned in {path} -> {needle!r}"); ok=False
print("  PASS: group-rate scope, bank dual-read, peer-ceiling, full-dispersion, and no-tail rules are pinned" if ok else "  -> NU valuation regression guard FAILED")
sys.exit(0 if ok else 1)
PY

echo "== extract_pool.py: data-readiness pre-flight (entity extraction + blocker detection) =="
# Guards the deterministic readiness GATE: entity-from-header (incl. the ALL-CAPS cover-page case
# that is the PV-vs-CV incident), zero-files / mixed-entity blockers, and pure-JSON stdout.
"$PY" - "$DIR/extract_pool.py" <<'PY' || rc=1
import importlib.util, sys, os, tempfile, json
spec=importlib.util.spec_from_file_location("ep", sys.argv[1]); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
ok=True
# entity_from_header — the three header shapes + the all-caps cover page (the incident)
if m.entity_from_header("TATA MOTORS PASSENGER VEHICLES LIMITED\nAnnual Report\n") != "TATA MOTORS PASSENGER VEHICLES LIMITED":
    print("  FAIL: all-caps cover-page entity not extracted (the PV-vs-CV incident case)"); ok=False
if "Bunge Global SA" not in m.entity_from_header("SEC\nBunge Global SA\n(Exact name of registrant as specified in its charter)\n"):
    print("  FAIL: SEC registrant not extracted"); ok=False
# India "Name of the Company:" must still extract after the separator-tightening (no test covered it before)
if m.entity_from_header("Name of the Company: Tata Motors Limited\nCIN: L123\n") != "Tata Motors Limited":
    print("  FAIL: India 'Name of the Company:' extraction broke"); ok=False
if m.entity_from_header("Quarterly revenue table 1234\n"):
    print("  FAIL: a non-filing produced a phantom entity"); ok=False
# a trailing parenthetical "(Formerly ...)" must NOT lose the registrant name (the live CRMTEST Tata case)
if m.entity_from_header("2nd Integrated Annual Report 2025-26\nTata Motors Limited (Formerly TML Commercial Vehicles Limited)\n") != "Tata Motors Limited":
    print("  FAIL: a trailing parenthetical broke registrant extraction"); ok=False
# prose + bare-suffix words must be REJECTED (no garbage names like 'fact the very purpose' / 'Company')
if m.entity_from_header("...the name of the Company is in fact the very purpose of our work\n"):
    print("  FAIL: prose was extracted as a (garbage) entity name"); ok=False
if m.entity_from_header("Company\nIndex\nPage 1\n"):
    print("  FAIL: a bare corporate-suffix word ('Company') was extracted as an entity"); ok=False
# CIQ data-export header "{Company} (EXCH:TICKER) > ..." extracts the SUBJECT (lets exports contribute)
if m.entity_from_header("Summary\nTata Motors Limited (NSEI:TMCV) > Credit Health Panel > Summary\n") != "Tata Motors Limited":
    print("  FAIL: CIQ '(EXCH:TICKER)' subject header not extracted"); ok=False
# readiness_summary — empty pool -> zero_files blocker
d0=tempfile.mkdtemp(); r0=m.readiness_summary(d0, tempfile.mkdtemp())
if not any(i["code"]=="zero_files" and i["severity"]=="blocker" for i in r0["issues"]):
    print("  FAIL: empty pool did not raise zero_files blocker"); ok=False
# a SINGLE odd file is NOISE, not a flag (the TMCV2 garbage-extraction fix): 2 majority + 1 odd -> clean
d1=tempfile.mkdtemp()
for fn in ("tata1.html","tata2.html"): open(os.path.join(d1,fn),"w").write("<html><h1>Tata Motors Limited</h1></html>")
open(os.path.join(d1,"odd.html"),"w").write("<html><h1>Reliance Industries Limited</h1></html>")
r1=m.readiness_summary(d1, tempfile.mkdtemp())
if any(i["code"]=="entity_disagreement" for i in r1["issues"]):
    print("  FAIL: a single odd file (1 of 3) should be ignored as noise, not flagged:", [(i['code'],i['severity']) for i in r1["issues"]]); ok=False
# file-aware severity: a company must appear in >=2 files to flag (blocker if unrelated, degrade if related)
def _e(*specs):
    out=[]
    for nm,c in specs:
        for k in range(c): out.append({"file":nm.split()[0]+str(k)+".pdf","entity":nm})
    return out
if m._entity_conflict(_e(("Salesforce, Inc",6),("Tata Motors Limited",2))) != "blocker":
    print("  FAIL: a >=2-file UNRELATED minority should BLOCK (contamination)"); ok=False
if m._entity_conflict(_e(("Tata Motors Limited",10),("Tata Sons Private Limited",1),("BSE Limited NSE Ltd",1))) is not None:
    print("  FAIL: single odd extractions (1 file each) should be ignored as noise (the TMCV2 fix)"); ok=False
if m._entity_conflict(_e(("Tata Motors Limited",5),("Tata Capital Limited",2))) != "degrade":
    print("  FAIL: a >=2-file RELATED minority (share 'tata') should be a degrade, not a wall"); ok=False
# focused evidence: name the MAJORITY company + point at the FLAGGED odd files, not a dump (none a substring of another)
ev=m._entity_evidence(_e(("Salesforce, Inc",2))+[{"file":"oddtata_a.pdf","entity":"Tata Motors Limited"},{"file":"oddtata_b.pdf","entity":"Tata Motors Limited"}])
if "Salesforce" not in ev or "oddtata_a.pdf" not in ev or "look out of place" not in ev or "Salesforce0.pdf" in ev:
    print("  FAIL: entity evidence not focused (should name majority + the flagged odd files, not dump the majority files):", ev); ok=False
# NO false disagreement when a transcript merely NAMES a peer (the over-fire fixed in the A.1 audit)
d2=tempfile.mkdtemp()
open(os.path.join(d2,"AR.html"),"w").write("<html><h1>Tata Motors Limited</h1><p>Annual Report 2025</p></html>")
open(os.path.join(d2,"Q3-earnings-call-transcript.html"),"w").write("<html><p>Q3 call. Compared to Ashok Leyland Limited, our share grew.</p></html>")
r2=m.readiness_summary(d2, tempfile.mkdtemp())
if any(i["code"]=="entity_disagreement" for i in r2["issues"]):
    print("  FAIL: a transcript naming a peer raised a FALSE entity_disagreement", [(e['file'],e['entity']) for e in r2['entities']]); ok=False
# CLI stdout must be PURE JSON (extract_pool log lines go to stderr) — guards the redirect regression
import subprocess
out=subprocess.run([sys.executable, sys.argv[1], "--readiness-json", d1, tempfile.mkdtemp()],
                   capture_output=True, text=True).stdout
try:
    json.loads(out)
except Exception as e:
    print(f"  FAIL: --readiness-json stdout is not pure JSON ({e}); first 80 chars: {out[:80]!r}"); ok=False
# a text/CSV-only pool is USABLE (status 'in-place'), NOT a zero_usable_data blocker (the audit fix)
d3=tempfile.mkdtemp(); open(os.path.join(d3,"financials.txt"),"w").write("Revenue 1234\nEBITDA 567\n")
r3=m.readiness_summary(d3, tempfile.mkdtemp())
if r3["usable_count"] != 1 or any(i["code"]=="zero_usable_data" for i in r3["issues"]):
    print("  FAIL: a text-only pool was wrongly flagged unusable", r3["usable_count"], [i["code"] for i in r3["issues"]]); ok=False
# case / punctuation / corporate-suffix variants of ONE name still collapse (same normalized form)
if m._entities_disagree(["Tata Motors Limited","TATA MOTORS LTD.","Tata Motors, Incorporated"]):
    print("  FAIL: case/suffix variants of one name tripped a false entity_disagreement"); ok=False
# but a BUSINESS-UNIT qualifier marks a DIFFERENT entity (the TMCV CV-vs-PV demerger) -> it DOES surface
if not m._entities_disagree(["Tata Motors Limited","Tata Motors Passenger Vehicles Limited"]):
    print("  FAIL: a business-unit divergence (CV vs PV) was wrongly collapsed as the same company"); ok=False
if not m._entities_disagree(["Tata Motors Limited","Reliance Industries Limited"]):
    print("  FAIL: genuinely different companies did NOT disagree"); ok=False
# the FILENAME is read as an entity signal (catches a wrong-entity file whose content hides it)
if m.entity_from_filename("Tata_Motors_Passenger_Vehicles_Limited_-_Form_Annual_Report(Jun-06-2026).pdf") != "Tata Motors Passenger Vehicles Limited":
    print("  FAIL: filename entity signal not extracted"); ok=False
if m.entity_from_filename("Transcript Digest.pdf"):
    print("  FAIL: a cryptic filename produced a phantom entity"); ok=False
# --- punctuation/typo-robust entity key + field-label rejection (the AMZN false-block incident) ---
# punctuation/spacing variants of ONE .com name collapse to a single company (no phantom conflict)
if m._entities_disagree(["Amazon.com, Inc","AMAZON.COM, INC","Amazon com Inc","Amazoncom Inc"]):
    print("  FAIL: punctuation variants of one .com name tripped a false entity_disagreement"); ok=False
if m._entity_conflict(_e(("Amazon.com, Inc",3),("Amazoncom Inc",2))) is not None:
    print("  FAIL: 'Amazon.com, Inc' vs 'Amazoncom Inc' wrongly flagged (same company, punctuation only)"); ok=False
# a single-glyph OCR typo ('rn'->'m') fuses into the same company (would otherwise block at >=2 files)
if not m._same_entity(m._entity_key("Amazoncom Inc"), m._entity_key("Amazoncorn Inc")):
    print("  FAIL: _same_entity did not fuse a <=2-edit OCR typo of a long key"); ok=False
if m._entity_conflict(_e(("Amazoncom Inc",5),("Amazoncorn Inc",2))) is not None:
    print("  FAIL: an OCR typo variant ('Amazoncorn') did not fuse into the majority company"); ok=False
# GUARD: the fuzzy fuse must NOT merge genuinely different companies (a false 'same' hides contamination)
if m._same_entity(m._entity_key("Tata Motors Limited"), m._entity_key("Tata Capital Limited")):
    print("  FAIL: _same_entity over-merged two different companies (Tata Motors vs Tata Capital)"); ok=False
if not m._entities_disagree(["Tata Motors Limited","Tata Capital Limited"]):
    print("  FAIL: Tata Motors vs Tata Capital were over-merged into one company"); ok=False
if m._same_entity("apple","ample"):
    print("  FAIL: _same_entity fused two short look-alike words (min-length guard failed)"); ok=False
# two DIFFERENT .com companies STILL BLOCK: their only shared token 'com' is generic, not distinctive
if m._entity_conflict(_e(("Priceline.com Inc",3),("Overstock.com Inc",2))) != "blocker":
    print("  FAIL: two unrelated .com companies sharing only the generic token 'com' should BLOCK"); ok=False
# tearsheet FIELD LABELS are not company names (the CIQ label sweep-up in the incident)
for _label in ("Named by Company","Company Type: Public Company","Country/Region of Incorporation"):
    if m._looks_like_entity(_label):
        print(f"  FAIL: tearsheet field label wrongly accepted as an entity: {_label!r}"); ok=False
# 'Corporation' inside 'Incorporation' must NOT read as a cover-page registrant (leading word boundary)
if m.entity_from_header("Country/Region of Incorporation\nUnited States\n"):
    print("  FAIL: 'incorporation' matched the corporate-suffix cover-page rule (missing word boundary)"); ok=False
print("  PASS: entity (content+filename signals, CIQ-header, prose/suffix/field-label rejected); zero-files blocker + entity conflict (punct-insensitive key + <=2-edit OCR fuse; >=2-file threshold; unrelated=blocker / business-unit-divergence=degrade / 1-off=noise; generic-token guard); no peer over-fire; text-usable; pure-JSON stdout" if ok else "  -> readiness test FAILED")
sys.exit(0 if ok else 1)
PY

echo "== ciq_facts.py + concept_resolve.py: layout-agnostic resolution + source-bound facts =="
"$PY" "$DIR/test_ciq_facts.py" || rc=1

echo "== extract_pool.py: per-format extraction bench (xls/xlsx/pdf/rtf/txt + content-sniff) =="
# The FIRST end-to-end test of the text-extraction layer that feeds every narrative module — proves each
# deterministic reader (xlrd/openpyxl/pdftotext->pypdf/textutil) still extracts and that content beats the
# extension (the CIQ HTML-as-.xls mislabel). Synthetic fixtures under testdata/extract_bench; a missing
# platform reader (textutil/pdf) SKIPS, never false-fails.
"$PY" "$DIR/test_extract_pool.py" || rc=1

echo "== relationship_graph.py: CIQ supplier/customer graph (group vs third party, no invented tickers) =="
# The supply-chain lane's parser. Its failure modes are silent, not loud: a wholly-owned sales subsidiary
# surfaced as a "second-order idea", a ticker invented for an unlisted counterparty, or the export's
# two-year disclosure scope dropped. Synthetic sheets only — no workbook readers needed.
"$PY" "$DIR/test_relationship_graph.py" || rc=1

echo "== ingest_external.py: EXTERNAL-INBOX router (routing, sidecars, dedup, fan-out cap) =="
# The external-data lane's entry point (frameworks/EXTERNAL_DATA.md): files dropped in the Drive inbox
# are matched to ticker pools, copied to data/<T>/external/<provider>/ with provenance sidecars, and
# sha256-deduped. Text fixtures only — no workbook/pdf readers needed.
"$PY" "$DIR/test_ingest_external.py" || rc=1

[ $rc -eq 0 ] && echo "ALL SMOKE TESTS PASS" || echo "SMOKE TESTS FAILED"
exit $rc
