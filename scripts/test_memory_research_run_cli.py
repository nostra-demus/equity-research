#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import tempfile
import unittest
from pathlib import Path

from memory_runtime import MemoryRuntimeError
from research_memory_run import ResearchMemoryError
from research_memory_run_cli import (
    load_bound_authorization,
    normalize_agent_draft,
    verify_current_evidence,
)


class ResearchMemoryRunCliTests(unittest.TestCase):
    def test_provider_authorization_path_rejects_symlink_alias(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            state = Path(temporary)
            run_id = "run-1"
            directory = state / "resumes" / run_id / "provider-authorizations"
            directory.mkdir(parents=True)
            target = state / "elsewhere.json"
            target.write_text("{}", encoding="utf-8")
            alias = directory / "provider-authorization_00000000-0000-5000-8000-000000000001.json"
            alias.symlink_to(target)
            with self.assertRaisesRegex(MemoryRuntimeError, "single-link regular file"):
                load_bound_authorization(
                    state, run_id=run_id, path=str(alias),
                    expected_sha256="sha256:" + "0" * 64, receipt={},
                    verifier=lambda _message, _signature: True,
                )

    def test_current_evidence_is_hash_bound_and_confined(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            output = root / "analyses" / "TEST_2026-08-25" / "earnings" / "01.md"
            filing = root / "data" / "TEST" / "filing.txt"
            output.parent.mkdir(parents=True)
            filing.parent.mkdir(parents=True)
            output.write_text("analysis", encoding="utf-8")
            filing.write_text("authoritative filing", encoding="utf-8")
            digest = hashlib.sha256(filing.read_bytes()).hexdigest()
            ref = f"evidence:sha256:{digest}#Note-4"
            path, refs = verify_current_evidence(
                root, ticker="TEST", output="analyses/TEST_2026-08-25/earnings/01.md",
                rows=[{"ref": ref, "path": "data/TEST/filing.txt", "locator": "Note-4"}],
            )
            self.assertEqual(output.resolve(), path)
            self.assertEqual([ref], refs)

            with self.assertRaisesRegex(ResearchMemoryError, "hash-mismatch"):
                verify_current_evidence(
                    root, ticker="TEST", output="analyses/TEST_2026-08-25/earnings/01.md",
                    rows=[{"ref": ref.replace(digest, "0" * 64),
                           "path": "data/TEST/filing.txt", "locator": "Note-4"}],
                )
            outside = root / "outside.txt"
            outside.write_text("not in source pool", encoding="utf-8")
            outside_digest = hashlib.sha256(outside.read_bytes()).hexdigest()
            with self.assertRaisesRegex(ResearchMemoryError, "outside-run"):
                verify_current_evidence(
                    root, ticker="TEST", output="analyses/TEST_2026-08-25/earnings/01.md",
                    rows=[{"ref": f"evidence:sha256:{outside_digest}#x",
                           "path": "outside.txt", "locator": "x"}],
                )

            with self.assertRaisesRegex(ResearchMemoryError, "must-be-closed-draft"):
                normalize_agent_draft(
                    root, ticker="TEST", output="analyses/TEST_2026-08-25/earnings/01.md",
                    draft={"schema": "memory-use/v1", "current_evidence_refs": [ref]},
                )


if __name__ == "__main__":
    unittest.main()
