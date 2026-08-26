#!/usr/bin/env python3
from __future__ import annotations

import io
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path

from memory_procedural_cli import main, parser


class ProceduralCliTests(unittest.TestCase):
    def test_closed_command_surface_includes_governed_lifecycle(self) -> None:
        commands = parser()._subparsers._group_actions[0].choices
        self.assertEqual(
            {
                "candidate-intake", "seed-initial", "review", "evaluate", "promotion-bundle",
                "open-promotion-pr", "activation-request", "execution-receipt",
                "verify-execution", "quarantine-request", "open-deprecation-pr",
                "status-request", "status",
            },
            set(commands),
        )

    def test_seed_and_status_keep_operational_records_outside_git(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            repository = root / "repo"
            repository.mkdir()
            state = root / "runtime"
            output = io.StringIO()
            with redirect_stdout(output):
                code = main([
                    "seed-initial", "--root", str(repository),
                    "--state-root", str(state), "--creator-kind", "service",
                    "--creator-id", "seed-service", "--now", "2026-08-25T12:00:00Z",
                ])
            self.assertEqual(0, code)
            result = json.loads(output.getvalue())
            self.assertEqual(4, result["candidate_count"])
            self.assertTrue(all(Path(path).is_relative_to(state.resolve()) for path in result["paths"]))
            self.assertTrue(all(Path(path).stat().st_mode & 0o077 == 0 for path in result["paths"]))

            output = io.StringIO()
            with redirect_stdout(output):
                code = main([
                    "status", "--root", str(repository), "--state-root", str(state),
                ])
            self.assertEqual(0, code)
            status = json.loads(output.getvalue())
            self.assertEqual(4, status["counts"]["candidates"])


if __name__ == "__main__":
    unittest.main()
