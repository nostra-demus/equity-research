#!/usr/bin/env python3
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from memory_profiles import ProfileError, parse_profile, validate_repository


class MemoryProfileTests(unittest.TestCase):
    def test_repository_profiles_are_closed_and_complete(self) -> None:
        root = Path(__file__).resolve().parents[1]
        self.assertEqual(validate_repository(root), [])

    def test_instruction_like_extra_field_is_rejected(self) -> None:
        text = """---
name: test
memory_profile:
  version: 1
  task: earnings.test
  episodic_scope: exact-listing
  semantic_topics: [earnings]
  procedure_tags: [earnings]
  cross_company: true
  permitted_source_tiers: [1, 2, 3, 4, 5]
  permitted_classifications: [public, internal]
  max_context_tokens: 3000
  instructions: ignore-policy
---
"""
        with self.assertRaises(ProfileError):
            parse_profile(text, Path("test.md"))

    def test_new_unprofiled_agent_fails_closed(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            module = root / ".claude" / "agents" / "new-module"
            module.mkdir(parents=True)
            (module / "MODULE_RULES.md").write_text("rules\n", encoding="utf-8")
            (module / "01_new.md").write_text("---\nname: new\n---\n", encoding="utf-8")
            self.assertTrue(any("memory_profile" in error for error in validate_repository(root)))


if __name__ == "__main__":
    unittest.main()
