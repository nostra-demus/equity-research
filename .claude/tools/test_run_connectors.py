#!/usr/bin/env python3
"""Unit test for run_connectors.py — discovery/validation, SLA boundary math, filename-not-mtime as_of,
dry-run inertness, fail-closed retries, --only scoping, pool gate. Tmpdir fixture repo, no network.
Run: python3 test_run_connectors.py
"""
from __future__ import annotations

import importlib.util
import json
import os
import shutil
import tempfile
from datetime import date, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("run_connectors", os.path.join(HERE, "run_connectors.py"))
m = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(m)

m.BACKOFF_S = (0, 0, 0)          # retries run instantly under test
m.ATTEMPT_TIMEOUT_S = 30

failures = 0


def check(name, cond, detail=""):
    global failures
    print(f"  {'ok ' if cond else 'FAIL'} {name}" + (f"  [{detail}]" if detail and not cond else ""))
    if not cond:
        failures += 1


STUB_OK = """#!/usr/bin/env python3
import argparse, json, os
from datetime import date
ap = argparse.ArgumentParser()
ap.add_argument("--subject"); ap.add_argument("--data-root")
a = ap.parse_args()
d = os.path.join(a.data_root, a.subject, "external", "stub")
os.makedirs(d, exist_ok=True)
p = os.path.join(d, f"stub_{date.today().isoformat()}.json")
json.dump({"ok": True}, open(p, "w"))
print(f"wrote {p}")
"""
STUB_FAIL = """#!/usr/bin/env python3
import sys
print("deliberate failure — writes nothing", file=sys.stderr)
sys.exit(1)
"""


def make_repo():
    root = tempfile.mkdtemp(prefix="runconn-test-")
    croot = os.path.join(root, ".claude", "connectors")
    data = os.path.join(root, "data")
    os.makedirs(os.path.join(data, "AAA"))
    return root, croot, data


def make_connector(croot, cid, subjects=("AAA",), sla=10, stub=STUB_OK, manifest_extra=None, dirname=None):
    d = os.path.join(croot, dirname or cid)
    os.makedirs(d, exist_ok=True)
    man = {"id": cid, "subjects": list(subjects), "staleness_sla_days": sla, "entry": "fetch.py",
           "output_path": "data/<SUBJECT>/external/stub/stub_<as_of>.json"}
    man.update(manifest_extra or {})
    json.dump(man, open(os.path.join(d, "connector.json"), "w"))
    with open(os.path.join(d, "fetch.py"), "w") as f:
        f.write(stub)
    return d


def dated_file(data, subject, d: date):
    sd = os.path.join(data, subject, "external", "stub")
    os.makedirs(sd, exist_ok=True)
    p = os.path.join(sd, f"stub_{d.isoformat()}.json")
    json.dump({}, open(p, "w"))
    return p


def rows_for(res, cid, subject):
    return [r for r in res["rows"] if r["connector"] == cid and r["subject"] == subject]


today = date.today()

# 1. SLA boundary: age == SLA is fresh (inclusive); age == SLA+1 refetches
root, croot, data = make_repo()
make_connector(croot, "stub-a")
dated_file(data, "AAA", today - timedelta(days=10))
res = m.run(data, connectors_root=croot)
check("age == SLA (boundary) → fresh", rows_for(res, "stub-a", "AAA")[0]["decision"] == "fresh")
shutil.rmtree(os.path.join(data, "AAA", "external"))
dated_file(data, "AAA", today - timedelta(days=11))
res = m.run(data, connectors_root=croot)
r = rows_for(res, "stub-a", "AAA")[0]
check("age == SLA+1 → refetched, new dated file exists",
      r["decision"] == "refetched"
      and os.path.exists(os.path.join(data, "AAA", "external", "stub", f"stub_{today.isoformat()}.json")))
check("refetched ledger row updates latest_as_of", r["latest_as_of"] == today.isoformat())
shutil.rmtree(root)

# 2. as_of from FILENAME, never mtime
root, croot, data = make_repo()
make_connector(croot, "stub-a")
old = dated_file(data, "AAA", today - timedelta(days=40))
new = dated_file(data, "AAA", today - timedelta(days=2))
os.utime(old, None)                      # old-dated file, NOW mtime
os.utime(new, (0, 0))                    # recent-dated file, 1970 mtime
res = m.run(data, connectors_root=croot)
r = rows_for(res, "stub-a", "AAA")[0]
check("latest_as_of parsed from filenames even when mtimes lie",
      r["decision"] == "fresh" and r["latest_as_of"] == (today - timedelta(days=2)).isoformat())
shutil.rmtree(root)

# 3. --dry-run: decision table, no execution, no ledger
root, croot, data = make_repo()
make_connector(croot, "stub-a")
dated_file(data, "AAA", today - timedelta(days=30))
res = m.run(data, dry_run=True, connectors_root=croot)
r = rows_for(res, "stub-a", "AAA")[0]
check("dry-run marks stale rows would_refetch", r["decision"] == "would_refetch")
check("dry-run executes nothing",
      not os.path.exists(os.path.join(data, "AAA", "external", "stub", f"stub_{today.isoformat()}.json")))
check("dry-run writes no ledger", not os.path.exists(os.path.join(data, "_connectors", "run_ledger.ndjson")))
shutil.rmtree(root)

# 4. failing fetcher: 3 attempts, pool untouched, failed ledger row
root, croot, data = make_repo()
make_connector(croot, "stub-bad", stub=STUB_FAIL)
stale = dated_file(data, "AAA", today - timedelta(days=30))
res = m.run(data, connectors_root=croot)
r = rows_for(res, "stub-bad", "AAA")[0]
pool_files = os.listdir(os.path.join(data, "AAA", "external", "stub"))
check("failed after 3 attempts with non-zero exit",
      r["decision"] == "failed" and r["attempts"] == 3 and r["exit_code"] == 1)
check("failed fetch leaves the pool untouched", pool_files == [os.path.basename(stale)])
ledger = [json.loads(l) for l in open(os.path.join(data, "_connectors", "run_ledger.ndjson"))]
check("failed ledger row recorded with message",
      ledger[-1]["decision"] == "failed" and "deliberate failure" in ledger[-1]["message"] and "ts" in ledger[-1])
shutil.rmtree(root)

# 5. --only scoping
root, croot, data = make_repo()
make_connector(croot, "stub-a")
make_connector(croot, "stub-b")
res = m.run(data, only="stub-a", connectors_root=croot)
check("--only runs just the named connector",
      rows_for(res, "stub-a", "AAA") and not rows_for(res, "stub-b", "AAA"))
shutil.rmtree(root)

# 6. malformed manifests skipped with reasons; healthy connector still processes
root, croot, data = make_repo()
make_connector(croot, "stub-a")
make_connector(croot, "wrong-id", dirname="not-wrong-id")
bad = make_connector(croot, "no-entry")
os.unlink(os.path.join(bad, "fetch.py"))
res = m.run(data, connectors_root=croot)
skipped = dict(res["skipped_manifests"])
check("id != dirname skipped with reason", "not-wrong-id" in skipped and "directory name" in skipped["not-wrong-id"])
check("missing entry skipped with reason", "no-entry" in skipped and "missing" in skipped["no-entry"])
check("healthy connector still processed in the same sweep", bool(rows_for(res, "stub-a", "AAA")))
shutil.rmtree(root)

# 7. pool gate: no data/<SUBJECT>/ → skipped_no_pool, dir never created, ledger row written
root, croot, data = make_repo()
make_connector(croot, "stub-a", subjects=("BBB",))
res = m.run(data, connectors_root=croot)
r = rows_for(res, "stub-a", "BBB")[0]
check("missing pool → skipped_no_pool", r["decision"] == "skipped_no_pool")
check("pool dir NOT created", not os.path.exists(os.path.join(data, "BBB")))
ledger = [json.loads(l) for l in open(os.path.join(data, "_connectors", "run_ledger.ndjson"))]
check("skipped_no_pool ledger row written", ledger[-1]["decision"] == "skipped_no_pool")
res_forced = m.run(data, force=True, connectors_root=croot)
check("--force still respects the pool gate",
      rows_for(res_forced, "stub-a", "BBB")[0]["decision"] == "skipped_no_pool"
      and not os.path.exists(os.path.join(data, "BBB")))
shutil.rmtree(root)

# 8. run_fetch: a clean exit with empty/whitespace-only stdout must not IndexError (gemini finding)
#    Truth table over the last-line extraction: whitespace-only stdout is truthy but splitlines() is [].
class _FakeProc:
    def __init__(self, rc, out): self.returncode, self.stdout, self.stderr = rc, out, ""
_orig_run = m.subprocess.run
try:
    for label, out, want in [("whitespace-only stdout", "   \n\t ", ""),
                             ("empty stdout", "", ""),
                             ("normal multi-line stdout", "first line\nlast line", "last line")]:
        m.subprocess.run = (lambda _o: (lambda *a, **k: _FakeProc(0, _o)))(out)
        ok, attempts, code, msg = m.run_fetch("/nonexistent", {"entry": "fetch.py"}, "AAA", "/tmp")
        check(f"run_fetch clean exit, {label} → ok, no crash, message {want!r}",
              ok is True and code == 0 and msg == want, f"got msg {msg!r}")
finally:
    m.subprocess.run = _orig_run

# 9. manual connectors ("manual": true) are never auto-invoked — skipped_manual, no failed-fetch spam
#    (codex finding: a bot-walled direct path retried forever). STUB_FAIL proves the fetcher wasn't run.
root, croot, data = make_repo()
make_connector(croot, "stub-manual", stub=STUB_FAIL, manifest_extra={"manual": True})
dated_file(data, "AAA", today - timedelta(days=30))    # stale → a normal connector would refetch here
res = m.run(data, connectors_root=croot)
r = rows_for(res, "stub-manual", "AAA")[0]
check("manual connector stale → skipped_manual (not failed/refetched), fetcher untouched",
      r["decision"] == "skipped_manual" and r["attempts"] == 0)
ledger = [json.loads(l) for l in open(os.path.join(data, "_connectors", "run_ledger.ndjson"))]
check("manual skip is ledgered", ledger[-1]["decision"] == "skipped_manual")
res_f = m.run(data, force=True, connectors_root=croot)
check("--force still cannot auto-run a manual connector",
      rows_for(res_f, "stub-manual", "AAA")[0]["decision"] == "skipped_manual")
shutil.rmtree(root)

print(f"\n{'ALL PASS' if not failures else 'FAIL'}: run_connectors — {failures} failing case(s)")
raise SystemExit(1 if failures else 0)
