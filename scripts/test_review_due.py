#!/usr/bin/env python3
"""Regression tests for the portable, cockpit-silent review scheduler hook."""

from __future__ import annotations

import contextlib
import importlib.util
import io
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock


ROOT = Path(__file__).resolve().parents[1]
HOOK = ROOT / ".claude" / "hooks" / "review_due.py"
SPEC = importlib.util.spec_from_file_location("review_due_hook", HOOK)
assert SPEC and SPEC.loader
review_due = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(review_due)


class ReviewDueHookTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.repo = Path(self.tmp.name)
        self.run = self.repo / "analyses" / "TEST_2026-01-01"
        self.run.mkdir(parents=True)
        (self.run / "decision_record.json").write_text(
            json.dumps(
                {
                    "ticker": "TEST",
                    "run_root": "analyses/TEST_2026-01-01",
                    "review_schedule": {"30d": "2000-01-01"},
                }
            ),
            encoding="utf-8",
        )

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def run_hook(self, *, cockpit: bool = False) -> str:
        buf = io.StringIO()
        env = {"NOSTRA_COCKPIT_RUN": "1"} if cockpit else {}
        with (
            mock.patch.object(review_due, "REPO_ROOT", self.repo),
            mock.patch.dict(os.environ, env, clear=True),
            contextlib.redirect_stdout(buf),
        ):
            review_due.main()
        return buf.getvalue()

    def test_finds_due_record_independent_of_process_cwd(self) -> None:
        old_cwd = Path.cwd()
        outside = self.repo / "outside"
        outside.mkdir()
        try:
            os.chdir(outside)
            payload = json.loads(self.run_hook())
        finally:
            os.chdir(old_cwd)
        message = payload["hookSpecificOutput"]["additionalContext"]
        self.assertIn("TEST 30d", message)
        self.assertIn("analyses/TEST_2026-01-01", message)

    def test_cockpit_process_is_silent(self) -> None:
        self.assertEqual(self.run_hook(cockpit=True), "")

    def test_existing_review_makes_hook_silent(self) -> None:
        reviews = self.run / "reviews"
        reviews.mkdir()
        (reviews / "2000-01-01_30d_decision_review.json").write_text("{}\n", encoding="utf-8")
        self.assertEqual(self.run_hook(), "")


if __name__ == "__main__":
    unittest.main()
