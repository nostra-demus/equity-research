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

[ $rc -eq 0 ] && echo "ALL SMOKE TESTS PASS" || echo "SMOKE TESTS FAILED"
exit $rc
