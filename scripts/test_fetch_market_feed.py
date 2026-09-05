#!/usr/bin/env python3
"""Offline tests for the benchmark feed fetcher — parsing, and the file shape its readers depend on."""
from __future__ import annotations

import csv
import datetime as dt
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import tempfile

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import fetch_market_feed as M  # noqa: E402

FAILURES: list[str] = []


def check(name: str, fn) -> None:
    try:
        fn()
        print(f"  ok   {name}")
    except Exception as exc:  # noqa: BLE001 — a harness reports, it does not raise
        FAILURES.append(name)
        print(f"  FAIL {name}\n       {exc}")


def test_holiday_is_dropped_not_filled() -> None:
    # FRED prints '.' for a day the index did not trade. A holiday is not a zero and not yesterday's
    # close carried forward — filling it would invent a flat day inside every return computed from it.
    rows = M.parse(b"observation_date,SP500\n2026-08-21,7674.37\n2026-08-22,.\n2026-08-24,7652.86\n")
    assert rows == [("2026-08-21", 7674.37), ("2026-08-24", 7652.86)], rows


def test_junk_is_skipped_and_order_forced() -> None:
    raw = b"observation_date,SP500\n2026-08-24,7652.86\nnot-a-date,1\n2026-08-21,7674.37\n2026-08-23,-4\n\n"
    assert M.parse(raw) == [("2026-08-21", 7674.37), ("2026-08-24", 7652.86)]


def test_wrong_shape_is_refused_not_half_read() -> None:
    for raw in (b"", b"date,close\n2026-08-21,1\n", b"observation_date,SP500\n"):
        try:
            M.parse(raw)
        except RuntimeError:
            continue
        raise AssertionError(f"expected a refusal for {raw!r}")


def test_it_writes_the_shape_the_readers_expect() -> None:
    # `date,symbol,close` in data/_market/<provider>/ is the contract market_prices.py documents and the
    # fund book's benchmark comparison reads. A fetcher that writes its own shape is invisible to both.
    with tempfile.TemporaryDirectory() as tmp:
        path = M.write_feed(tmp, [("2026-08-21", 7674.37), ("2026-08-24", 7652.86)])
        assert path.endswith(os.path.join("_market", "fred", "sp500_2026-08-24.csv")), path
        with open(path, encoding="utf-8") as fh:
            rows = list(csv.reader(fh))
        assert rows[0] == ["date", "symbol", "close"], rows[0]
        assert rows[1] == ["2026-08-21", "SP500", "7674.37"], rows[1]
        assert len(rows) == 3, rows
        with open(path + ".source.json", encoding="utf-8") as fh:
            sidecar = json.load(fh)
        assert sidecar["as_of"] == "2026-08-24"
        # SP500 is proprietary to S&P Dow Jones Indices LLC — FRED serves it free to access and use, but
        # reproduction/redistribution is prohibited, so the sidecar must NOT claim public-domain /
        # redistributable rights. Enum values follow frameworks/EXTERNAL_DATA.md §7
        # (redistribution ∈ allowed | derived_only | prohibited | unknown).
        assert sidecar["license"] == "proprietary", sidecar["license"]
        assert sidecar["licensing"]["redistribution"] == "prohibited", sidecar["licensing"]
        assert sidecar["licensing"]["use"] == "allowed", sidecar["licensing"]
        received = dt.datetime.fromisoformat(sidecar["received"].replace("Z", "+00:00"))
        assert sidecar["received"].endswith("Z") and received.tzinfo is not None


def test_the_host_is_pinned() -> None:
    # It reaches the network through the connectors' own SSRF boundary, so it cannot be redirected at
    # an arbitrary host any more than a connector could.
    assert M.SOURCE["host_allowlist"] == ["fred.stlouisfed.org"]
    assert M.SOURCE_URL.startswith("https://fred.stlouisfed.org/")


def test_scheduled_writer_requires_canonical_pool() -> None:
    # Drive only the real scheduled wrapper and supervisor. Replace the network fetch with a marker:
    # a rejected topology must never reach it or manufacture a local data tree.
    ops_source = Path(__file__).resolve().parent / "ops"
    for case in ("nonwriter", "ready", "admin", "missing", "real", "broken", "wrong",
                 "no_identity", "unsafe_identity", "no_writer", "no_role", "unknown_lock_age"):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp).resolve()
            home, repo, pool = root / "home", root / "repo", root / "pool"
            ops = home / ".nostra-ops"
            for directory in (ops, repo / "scripts" / "ops", pool):
                directory.mkdir(parents=True)
            ops.chmod(0o700)
            for name, value in {
                "connector-writer-host": "other-host" if case == "nonwriter" else socket.gethostname(),
                "pool-root": str(pool), "role": "admin" if case == "admin" else "doer",
            }.items():
                (ops / name).write_text(value + "\n")
                (ops / name).chmod(0o600)
            if case == "no_identity":
                (ops / "pool-root").unlink()
            elif case == "unsafe_identity":
                (ops / "pool-root").chmod(0o666)
            elif case == "no_writer":
                (ops / "connector-writer-host").unlink()
            elif case == "no_role":
                (ops / "role").unlink()
            data = repo / "data"
            if case == "real":
                data.mkdir()
            elif case == "broken":
                data.symlink_to(root / "unmounted")
            elif case == "wrong":
                (root / "other").mkdir()
                data.symlink_to(root / "other")
            elif case != "missing":
                data.symlink_to(pool)
            shutil.copyfile(ops_source / "connector-supervisor.py", repo / "scripts" / "ops" / "connector-supervisor.py")
            (repo / "scripts" / "fetch_market_feed.py").write_text(
                "import json, pathlib, sys\n"
                "pathlib.Path('fetch-ran').write_text(json.dumps(sys.argv[1:]))\n"
            )
            subprocess.run(["git", "init", "-q", str(repo)], check=True)
            env = {k: v for k, v in os.environ.items() if not k.startswith("NOSTRA_")}
            env.update(HOME=str(home), ENGINE_REPO_ROOT=str(repo), HOUSEKEEPING_LOG=str(root / "job.log"))
            if case == "unknown_lock_age":
                (repo / ".git" / "nostra-market-feed.lock.d").mkdir()
                (root / "bin").mkdir()
                (root / "bin" / "stat").write_text("#!/bin/sh\nexit 1\n")
                (root / "bin" / "stat").chmod(0o755)
                env["PATH"] = str(root / "bin") + os.pathsep + env["PATH"]
            result = subprocess.run(["/bin/bash", str(ops_source / "market-feed-local.sh")],
                                    env=env, capture_output=True, text=True, timeout=15)
            assert result.returncode == 0, (case, result.stderr, (root / "job.log").read_text())
            assert (repo / "fetch-ran").exists() == (case == "ready"), case
            if case == "ready":
                assert json.loads((repo / "fetch-ran").read_text()) == ["--data-root", str(pool)]
            if case == "missing":
                assert not data.exists(), "missing Drive projection was created locally"
            if case == "no_identity":
                assert not (ops / "pool-root").exists(), "scheduled run silently seeded pool identity"


def test_failover_fences_market_feed() -> None:
    # Execute the installer's real role-routing tail with service operations simulated. This isolates
    # selection/fencing from OS-specific plist rendering and never touches the host's launchd.
    script = (Path(__file__).resolve().parent / "ops" / "install-services.sh").read_text()
    routing = "BASE=(" + script.split("\nBASE=(", 1)[1]
    prefix = r'''
set -uo pipefail
ROLE=doer ONLY='' INSTALL_CONNECTORS=0 OMNIROUTE_BIN=''
AGENTS="$CASE_ROOT/agents" DOMAIN=gui/test HERE="$CASE_ROOT/source" PROD="$CASE_ROOT/prod"
mkdir -p "$AGENTS" "$HERE"
touch "$HERE/com.nostradamus.news-ingester.plist"
printf '%s\n' __SET_YOUR_GROQ_API_KEY__ > "$HERE/com.nostradamus.news-ingester.plist"
for label in com.nostradamus.connectors com.nostradamus.hk-market-feed; do
  touch "$AGENTS/$label.plist" "$CASE_ROOT/$label.loaded"
done
loaded() { [ -e "$CASE_ROOT/$1.loaded" ]; }
launchctl() {
  if [ "$1" = bootout ]; then
    if [ "$STUCK" != 1 ] || [ "${2##*/}" != com.nostradamus.hk-market-feed ]; then
      rm -f "$CASE_ROOT/${2##*/}.loaded"
    fi
  fi
  return 0
}
sleep() { :; }
install_one() { printf '%s\n' "$1" >> "$CASE_ROOT/installed"; }
remove_one() { :; }
persist_role() { printf '%s\n' "$1" > "$CASE_ROOT/role"; }
'''
    for stuck in (False, True):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            result = subprocess.run(["/bin/bash"], input=prefix + routing, text=True, capture_output=True,
                                    env={**os.environ, "CASE_ROOT": str(root), "STUCK": str(int(stuck))},
                                    timeout=15)
            if stuck:
                assert result.returncode != 0 and not (root / "role").exists(), result.stdout
                assert (root / "com.nostradamus.hk-market-feed.loaded").exists()
                continue
            assert result.returncode == 0, (result.stdout, result.stderr)
            installed = (root / "installed").read_text().splitlines()
            assert "com.nostradamus.tunnel" in installed
            assert (root / "role").read_text() == "doer\n"
            for label in ("com.nostradamus.connectors", "com.nostradamus.hk-market-feed"):
                assert label not in installed, f"failover installs {label}"
                assert not (root / "agents" / f"{label}.plist").exists(), f"stale {label} plist retained"
                assert not (root / f"{label}.loaded").exists(), f"stale {label} still loaded"


def test_deterministic_wrappers_reject_unknown_lock_ages() -> None:
    # A failing stat may print to stdout. Neither those bytes nor an empty/malformed successful
    # response may enter shell arithmetic and reclaim a held lock. Cores are sentinels that fail
    # before any publication; an accepted stale lock must reach them and propagate that exact exit.
    ops_source = Path(__file__).resolve().parent / "ops"
    cases = {
        "noisy_gnu_fresh_bsd": ("printf 'diagnostic\\n'; exit 1", 'printf "%s\\n" "$FRESH_EPOCH"', False),
        "both_noisy_failures": ("printf 'diagnostic\\n'; exit 1", "printf '0\\n'; exit 1", False),
        "both_silent_failures": ("exit 1", "exit 1", False),
        "empty_success": ("exit 0", "exit 1", False),
        "expression_success": ("printf '1+1\\n'", "exit 1", False),
        "malformed_success": ("printf 'not_an_epoch\\n'", "exit 1", False),
        "oversized_success": ("printf '999999999999999999999999999999\\n'", "exit 1", False),
        "fresh_gnu": ('printf "%s\\n" "$FRESH_EPOCH"', "exit 1", False),
        "stale_gnu": ('printf "%s\\n" "$STALE_EPOCH"', "exit 1", True),
        "noisy_gnu_stale_bsd": ("printf 'diagnostic\\n'; exit 1", 'printf "%s\\n" "$STALE_EPOCH"', True),
        "zero_padded_fresh": ('printf "000%s\\n" "$FRESH_EPOCH"', "exit 1", False),
        "zero_padded_stale": ('printf "000%s\\n" "$STALE_EPOCH"', "exit 1", True),
    }
    errors = []
    for wrapper, core, lock_name, args in (
        ("market-feed-local.sh", "fetch_market_feed.py", "nostra-market-feed.lock.d", []),
        ("calibrate-local.sh", "calibrate.py", "nostra-calibrate.lock.d", ["post-review"]),
    ):
        for name, (gnu, bsd, should_run) in cases.items():
            with tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp).resolve()
                repo, home, shim = root / "repo", root / "home", root / "bin"
                for directory in (repo / "scripts" / "ops", home, shim):
                    directory.mkdir(parents=True)
                subprocess.run(["git", "init", "-q", str(repo)], check=True)
                lock = repo / ".git" / lock_name
                lock.mkdir()
                # Only the unrelated eligibility check is simulated. The actual wrapper owns the
                # stat probes, validation, lock removal, re-acquisition and exit propagation.
                (repo / "scripts" / "ops" / "connector-supervisor.py").write_text("print('/unused-test-pool')\n")
                (repo / "scripts" / core).write_text(
                    "from pathlib import Path\nPath('core-ran').touch()\nraise SystemExit(23)\n"
                )
                (shim / "stat").write_text(f'#!/bin/sh\ncase "$1" in\n-c) {gnu};;\n-f) {bsd};;\nesac\n')
                (shim / "stat").chmod(0o755)
                now = int(dt.datetime.now(dt.timezone.utc).timestamp())
                env = {k: v for k, v in os.environ.items() if not k.startswith("NOSTRA_")}
                env.update(HOME=str(home), ENGINE_REPO_ROOT=str(repo), HOUSEKEEPING_LOG=str(root / "job.log"),
                           PATH=str(shim) + os.pathsep + env["PATH"], FRESH_EPOCH=str(now), STALE_EPOCH=str(now - 7200))
                result = subprocess.run(["/bin/bash", str(ops_source / wrapper), *args],
                                        env=env, capture_output=True, text=True, timeout=15)
                ran = (repo / "core-ran").exists()
                if (result.stderr or result.returncode != (23 if should_run else 0) or ran != should_run
                        or lock.exists() != (not should_run)):
                    errors.append(f"{wrapper}/{name}: rc={result.returncode}, core_ran={ran}, "
                                  f"lock_exists={lock.exists()}, stderr={result.stderr.strip()!r}")
    assert not errors, "\n".join(errors)


def main() -> int:
    check("a market holiday is dropped, never filled", test_holiday_is_dropped_not_filled)
    check("junk rows are skipped and the series is sorted", test_junk_is_skipped_and_order_forced)
    check("a wrong-shaped response is refused, not half-read", test_wrong_shape_is_refused_not_half_read)
    check("the feed is written in the shape the readers expect", test_it_writes_the_shape_the_readers_expect)
    check("the source host is pinned to the SSRF allowlist", test_the_host_is_pinned)
    check("scheduled writes require the canonical writer and pool", test_scheduled_writer_requires_canonical_pool)
    check("serving failover fences connectors and the market feed", test_failover_fences_market_feed)
    check("deterministic wrappers fail closed on unknown lock ages", test_deterministic_wrappers_reject_unknown_lock_ages)
    print(f"\n{8 - len(FAILURES)} passed, {len(FAILURES)} failed")
    return 1 if FAILURES else 0


if __name__ == "__main__":
    raise SystemExit(main())
