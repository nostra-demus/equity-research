#!/usr/bin/env python3
"""Regression tests for calibrate-local.sh's no-model, exact-path publication boundary."""

from __future__ import annotations

import os
from pathlib import Path
import subprocess
import tempfile


HERE = Path(__file__).resolve().parent
WRAPPER = HERE / "calibrate-local.sh"


def write(path: Path, body: str, mode: int = 0o644) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(body, encoding="utf-8")
    path.chmod(mode)


def run_fixture(calibrate_body: str) -> tuple[subprocess.CompletedProcess[str], str | None]:
    with tempfile.TemporaryDirectory(prefix="calibrate-local-test-") as raw:
        root = Path(raw)
        subprocess.run(["git", "init", "-q", str(root)], check=True)
        write(root / "scripts/calibrate.py", calibrate_body)
        write(root / "scripts/commit-run.sh", """#!/usr/bin/env bash
set -eu
printf '%s\n' "$*" > "$CAPTURE"
""", 0o755)
        capture = root / "captured-args"
        env = os.environ.copy()
        env.update({
            "ENGINE_REPO_ROOT": str(root),
            "HOUSEKEEPING_LOG": str(root / "housekeeping.log"),
            "CAPTURE": str(capture),
            "HOME": str(root / "home"),
        })
        result = subprocess.run(
            ["bash", str(WRAPPER), "manual"], env=env, text=True,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
        )
        return result, capture.read_text(encoding="utf-8").strip() if capture.exists() else None


def main() -> int:
    ok = """#!/usr/bin/env python3
from pathlib import Path
p = Path('analyses/performance')
p.mkdir(parents=True, exist_ok=True)
(p / '2026-08-21_calibration_summary.json').write_text('{}\\n')
(p / '2026-08-21_decision_performance_summary.md').write_text('# calibration\\n')
print('WROTE analyses/performance/2026-08-21_calibration_summary.json')
print('WROTE analyses/performance/2026-08-21_decision_performance_summary.md')
"""
    result, captured = run_fixture(ok)
    expected_tail = (
        "-- analyses/performance/2026-08-21_calibration_summary.json "
        "analyses/performance/2026-08-21_decision_performance_summary.md"
    )
    assert result.returncode == 0, result.stderr
    assert captured and captured.endswith(expected_tail), captured

    hostile = """#!/usr/bin/env python3
print('WROTE /tmp/escaped_calibration_summary.json')
print('WROTE analyses/performance/2026-08-21_decision_performance_summary.md')
"""
    result, captured = run_fixture(hostile)
    assert result.returncode == 3, result.stderr
    assert captured is None, "unsafe output reached commit-run"

    print("test_calibrate_local.py: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
