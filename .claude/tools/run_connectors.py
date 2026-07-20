#!/usr/bin/env python3
"""
run_connectors.py — Self-heal connector runner for the equity-research engine.

WHY THIS EXISTS
  The connector registry (.claude/connectors/<id>/ = connector.json + fetch.py,
  frameworks/EXTERNAL_DATA.md §7) declares durable data feeds, but nothing runs
  them on their declared cadence — the launchd external-ingest timer runs the
  inbox ROUTER, not the fetchers. This runner closes the loop: it discovers
  every connector generically, checks each (connector × subject) pool series
  against the manifest's staleness_sla_days, and re-runs fetch.py only when the
  series is missing or past its SLA. A fresh pool is a no-op sweep.

CONTRACT
  Zero-touch (§26) — connectors are discovered by glob; no connector id is ever
    hardcoded here. A malformed manifest is skipped with a printed reason and
    the sweep continues.
  Staleness from FILENAMES — latest as_of is parsed from the <as_of> slot of
    the manifest's own output_path pattern, never from mtime (a Drive sync
    stamps mtimes; fix F23).
  Fail-closed fetchers — a fetch.py that fails writes nothing by its own
    contract, so the pool simply stays stale and the cockpit Data Library
    (GET /api/pipelines) shows it. Staleness IS the alert; there is no other
    alerting channel to keep in sync.
  Pool gate — a subject whose data/<SUBJECT>/ folder does not exist is skipped
    (skipped_no_pool), never created: pool folders are created by the engine's
    own ticker/commodity flows, not by a background timer.
  Manual feeds — a connector whose manifest sets "manual": true is NEVER auto-invoked
    (its direct path can only fail, e.g. a bot-walled endpoint): the sweep records
    skipped_manual and leaves the series for a hand-staged refresh (fetch.py
    --from-file). The stale filename IS the alert, exactly as a failed fetch is —
    the runner does not hammer a path that cannot succeed.
  Ledger — every (connector × subject) decision appends one NDJSON row to
    <data-root>/_connectors/run_ledger.ndjson (the data/_market-style reserved
    lane). --dry-run writes nothing, ledger included.

USAGE
  python3 run_connectors.py [--data-root data] [--only <connector-id>] [--force] [--dry-run]
  Run from anywhere (the launchd timer com.nostradamus.connectors does, 6-hourly).
"""
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import time
from datetime import date, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
CONNECTORS_ROOT = os.path.join(REPO, ".claude", "connectors")
LEDGER_DIR = "_connectors"                 # reserved lane under the pool root (data/_market precedent)
LEDGER_NAME = "run_ledger.ndjson"
BACKOFF_S = (0, 60, 300)                   # sleep before each attempt; tests override (STABLE_AGE_S idiom)
ATTEMPT_TIMEOUT_S = 300                    # per-attempt fetch timeout; tests override
ASOF_RE = r"(\d{4}-\d{2}-\d{2})"


def _log(msg: str) -> None:
    print(f"[run_connectors] {msg}")


# ---------- discovery + validation (fail-soft per manifest, never crashes the sweep) ----------

def discover(connectors_root: str):
    """Yield (connector_dir, manifest) for every valid manifest; collect (dirname, reason) for the rest."""
    valid, skipped = [], []
    if not os.path.isdir(connectors_root):
        return valid, [(connectors_root, "connectors root missing")]
    for name in sorted(os.listdir(connectors_root)):
        cdir = os.path.join(connectors_root, name)
        mpath = os.path.join(cdir, "connector.json")
        if not os.path.isfile(mpath):
            continue
        try:
            man = json.load(open(mpath, encoding="utf-8"))
        except Exception as e:
            skipped.append((name, f"connector.json does not parse: {e}"))
            continue
        reason = _validate(name, cdir, man)
        if reason:
            skipped.append((name, reason))
        else:
            valid.append((cdir, man))
    return valid, skipped


def _validate(dirname: str, cdir: str, man) -> str | None:
    if not isinstance(man, dict):
        return "manifest is not an object"
    if man.get("id") != dirname:
        return f"id {man.get('id')!r} != directory name {dirname!r}"
    subjects = man.get("subjects")
    if not (isinstance(subjects, list) and subjects and all(isinstance(s, str) and s for s in subjects)):
        return "subjects must be a non-empty list of strings"
    # Each subject is later joined to data_root to build the fetch path, so a traversal component (`../`,
    # a `/` or `\` separator, a leading dot) in a malformed manifest could steer a write outside the pool.
    # Require a single safe pool identifier — the same shape the server registry admits.
    unsafe = [s for s in subjects if not re.match(r"^[A-Za-z0-9][A-Za-z0-9._-]*$", s) or ".." in s]
    if unsafe:
        return f"subjects must be safe pool identifiers (no path separators or traversal): {unsafe!r}"
    sla = man.get("staleness_sla_days")
    if isinstance(sla, bool) or not isinstance(sla, (int, float)) or not (0 < float(sla) < float("inf")):
        return f"staleness_sla_days {sla!r} must be a finite number > 0"
    out = man.get("output_path")
    if not (isinstance(out, str) and "<SUBJECT>" in out and out.count("<as_of>") == 1
            and "<as_of>" in os.path.basename(out)):
        return f"output_path {out!r} must contain <SUBJECT> and exactly one <as_of> in its basename"
    entry = man.get("entry")
    if not (isinstance(entry, str) and os.path.isfile(os.path.join(cdir, entry))):
        return f"entry {entry!r} missing in the connector directory"
    return None


# ---------- freshness (as_of from FILENAMES, never mtime) ----------

def _series_location(man: dict, data_root: str, subject: str):
    rel = man["output_path"].replace("<SUBJECT>", subject)
    if rel.startswith("data/"):
        rel = rel[len("data/"):]
    rel = os.path.join(data_root, rel)
    pattern = re.compile("^" + re.escape(os.path.basename(rel)).replace(re.escape("<as_of>"), ASOF_RE) + "$")
    return os.path.dirname(rel), pattern


def latest_as_of(man: dict, data_root: str, subject: str):
    provider_dir, pattern = _series_location(man, data_root, subject)
    best = None
    try:
        names = os.listdir(provider_dir)
    except OSError:
        return None
    for n in names:
        m = pattern.match(n)
        if not m:
            continue
        try:
            d = datetime.strptime(m.group(1), "%Y-%m-%d").date()
        except ValueError:
            continue
        if best is None or d > best:
            best = d
    return best


# ---------- execution (retry with backoff; a failed fetch writes nothing by contract) ----------

def run_fetch(cdir: str, man: dict, subject: str, data_root: str):
    """Returns (ok, attempts, exit_code, message)."""
    cmd = [sys.executable, os.path.join(cdir, man["entry"]), "--subject", subject,
           "--data-root", os.path.abspath(data_root)]
    exit_code, message = None, ""
    for attempt, pause in enumerate(BACKOFF_S, start=1):
        if pause:
            time.sleep(pause)
        try:
            p = subprocess.run(cmd, cwd=cdir, capture_output=True, text=True, timeout=ATTEMPT_TIMEOUT_S)
            exit_code = p.returncode
            if p.returncode == 0:
                # whitespace-only stdout is truthy but splitlines() is [] — guard the [-1] (fix: no IndexError)
                lines = (p.stdout or "").strip().splitlines()
                return True, attempt, 0, lines[-1] if lines else ""
            message = (p.stderr or p.stdout or "").strip()[-400:]
        except subprocess.TimeoutExpired:
            exit_code, message = None, f"timeout after {ATTEMPT_TIMEOUT_S}s"
    return False, len(BACKOFF_S), exit_code, message


def _append_ledger(data_root: str, row: dict) -> None:
    ledger_dir = os.path.join(data_root, LEDGER_DIR)
    os.makedirs(ledger_dir, exist_ok=True)
    with open(os.path.join(ledger_dir, LEDGER_NAME), "a", encoding="utf-8") as fh:
        fh.write(json.dumps({**row, "ts": int(time.time())}) + "\n")


# ---------- singleton lock (LOCAL disk — O_EXCL on the FUSE mount is unreliable) ----------

def acquire_lock():
    lock = os.path.join(tempfile.gettempdir(), "nostra-connectors.lock")
    try:
        fd = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        try:
            os.write(fd, str(os.getpid()).encode())
        finally:
            os.close(fd)                      # never leak the fd if os.write raises
        return lock
    except FileExistsError:
        try:
            with open(lock) as fh:            # context-managed so the read handle can't leak
                pid = int(fh.read().strip() or "0")
            alive = pid > 0 and _pid_alive(pid)
            stale = time.time() - os.path.getmtime(lock) > 1800
            if not alive or stale:
                os.unlink(lock)  # steal a dead/stale lock and retry once
                return acquire_lock()
        except Exception:
            pass
        return None
    except Exception:
        return lock  # fail OPEN: never block the only runner on a lock hiccup


def _pid_alive(pid):
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


# ---------- sweep ----------

def run(data_root: str, only: str | None = None, force: bool = False, dry_run: bool = False,
        connectors_root: str = CONNECTORS_ROOT):
    valid, skipped = discover(connectors_root)
    for name, reason in skipped:
        _log(f"skip manifest {name}: {reason}")
    today = date.today()
    rows = []
    for cdir, man in valid:
        if only and man["id"] != only:
            continue
        sla = float(man["staleness_sla_days"])
        for subject in man["subjects"]:
            latest = latest_as_of(man, data_root, subject)
            age = (today - latest).days if latest else None
            row = {"connector": man["id"], "subject": subject,
                   "latest_as_of": latest.isoformat() if latest else None,
                   "attempts": 0, "exit_code": None, "message": ""}
            if not os.path.isdir(os.path.join(data_root, subject)):
                row["decision"] = "skipped_no_pool"
            elif latest and age <= sla and not force:
                row["decision"] = "fresh"
            elif man.get("manual") is True:
                row["decision"] = "skipped_manual"   # auto-fetch disabled: a hand-staged --from-file refreshes it
            elif dry_run:
                row["decision"] = "would_refetch"
            else:
                ok, attempts, exit_code, message = run_fetch(cdir, man, subject, data_root)
                refreshed = latest_as_of(man, data_root, subject)
                row.update({"decision": "refetched" if ok else "failed", "attempts": attempts,
                            "exit_code": exit_code, "message": message,
                            "latest_as_of": refreshed.isoformat() if refreshed else row["latest_as_of"]})
            rows.append(row)
            age_s = f"{age}d" if age is not None else "—"
            sla_s = f"{sla:g}d"
            _log(f"{man['id']} × {subject}: latest {row['latest_as_of'] or '—'} (age {age_s}, SLA {sla_s}) "
                 f"→ {row['decision']}" + (f" [{row['message']}]" if row["decision"] == "failed" else ""))
            if not dry_run:
                _append_ledger(data_root, row)
    return {"rows": rows, "skipped_manifests": skipped}


def main() -> int:
    ap = argparse.ArgumentParser(description="SLA-gated self-heal runner for the connector registry.")
    ap.add_argument("--data-root", default=os.path.join(REPO, "data"), help="pool root (default: <repo>/data)")
    ap.add_argument("--only", help="run a single connector id")
    ap.add_argument("--force", action="store_true", help="ignore the SLA gate (still respects the pool gate)")
    ap.add_argument("--dry-run", action="store_true", help="print the freshness/decision table; execute nothing")
    a = ap.parse_args()

    lock = None
    if not a.dry_run:
        lock = acquire_lock()
        if lock is None:
            _log("another runner instance holds the lock — skipping this sweep")
            return 0
    try:
        result = run(a.data_root, only=a.only, force=a.force, dry_run=a.dry_run)
    finally:
        if lock:
            try:
                os.unlink(lock)
            except OSError:
                pass
    failed = sum(1 for r in result["rows"] if r["decision"] == "failed")
    _log(f"sweep done: {len(result['rows'])} decision(s), {failed} failed, "
         f"{len(result['skipped_manifests'])} manifest(s) skipped")
    return 0


if __name__ == "__main__":
    sys.exit(main())
