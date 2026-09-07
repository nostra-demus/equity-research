#!/usr/bin/env python3
"""Regressions for the commodity attribution declaration and CLI audit outcomes."""
from __future__ import annotations

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from commodity_driver_attribution import check_text


SCRIPT = Path(__file__).with_name("commodity_driver_attribution.py")
HEADING = "## 1a. Attribution of the recent move (§15 / MODULE_RULES §4a)"
RECONCILED = "RF-COMM-001: driver attribution reconciled — explained 14%, residual 86%"
NOT_ATTEMPTED = "RF-COMM-001: driver attribution not attempted — no sourced sensitivity"


def report(declaration: str) -> str:
    return f"# Macro Drivers — GOLD\n\n{HEADING}\nAttribution discussed above.\n{declaration}\n\n## 2. The driver that matters most now\nRates.\n"


class DeclarationTests(unittest.TestCase):
    def test_reconciled_and_not_attempted(self):
        for declaration in (RECONCILED, NOT_ATTEMPTED):
            with self.subTest(declaration=declaration):
                self.assertEqual(check_text(report(declaration)), [])

    def test_rounding_and_offsetting_contributions(self):
        for explained, residual in ((14.6, 85.9), (14, 85), (14, 87), (0, 100), (125, -25), (-25, 125)):
            with self.subTest(explained=explained, residual=residual):
                self.assertEqual(check_text(report(
                    f"RF-COMM-001: driver attribution reconciled — explained {explained}%, residual {residual}%"
                )), [])

    def test_invalid_arithmetic_and_number_tokens(self):
        for explained, residual in (("14", "50"), ("14", "84.99"), ("14", "87.01"),
                                    ("14", "86.5.2"), ("NaN", "100"), ("inf", "-inf"),
                                    ("9" * 400, "-" + "9" * 400)):
            with self.subTest(explained=explained, residual=residual):
                self.assertTrue(check_text(report(
                    f"RF-COMM-001: driver attribution reconciled — explained {explained}%, residual {residual}%"
                )))

    def test_negation_prefixes_and_trailing_branch_cannot_pass(self):
        for declaration in (
            RECONCILED.replace("attribution reconciled", "attribution not reconciled"),
            RECONCILED.replace("driver attribution", "unverified driver attribution"),
            RECONCILED.replace("driver attribution ", ""),
            RECONCILED + "; not attempted because no sourced sensitivity",
            RECONCILED.replace("86%", "50%") + "; not attempted because no sourced sensitivity",
            NOT_ATTEMPTED.replace("attribution not attempted", "attribution was not attempted"),
            "RF-COMM-001: driver attribution not attempted —",
            "RF-COMM-001: driver attribution not attempted — ---",
        ):
            with self.subTest(declaration=declaration):
                self.assertTrue(check_text(report(declaration)))

    def test_exact_tag_and_standalone_line(self):
        for declaration in (
            RECONCILED.replace("RF-COMM-001", "RF-COMM-0010"),
            RECONCILED.replace("RF-COMM-001", "RF-COMM-001_extra"),
            RECONCILED.replace("RF-COMM-001:", "RF-COMM-001"),
            "For example: " + RECONCILED,
            "| " + RECONCILED + " |",
            "| RF-COMM-001 | reconciled |",
        ):
            with self.subTest(declaration=declaration):
                self.assertTrue(check_text(report(declaration)))

    def test_harmless_markdown_on_standalone_declaration(self):
        for declaration in ("**" + RECONCILED + "**", "- " + RECONCILED,
                            "### **" + RECONCILED + "**", "`" + RECONCILED + "`"):
            with self.subTest(declaration=declaration):
                self.assertEqual(check_text(report(declaration)), [])

    def test_requires_exact_section_identifier_and_level(self):
        for heading in ("## 1ab. Attribution", "## 1a0. Attribution", "## 1. Attribution",
                        "### 1a. Attribution", "# 1a. Attribution", "Attribution"):
            with self.subTest(heading=heading):
                self.assertTrue(check_text(report(RECONCILED).replace(HEADING, heading)))

    def test_other_sections_cannot_supply_declaration(self):
        self.assertTrue(check_text(report("No declaration.") + "\n## 9. Appendix\n" + RECONCILED))
        self.assertTrue(check_text(RECONCILED + "\n" + report("No declaration.")))
        self.assertTrue(check_text(report("No declaration.").replace("## 2.", "# Appendix\n" + RECONCILED + "\n## 2.")))

    def test_duplicate_sections_and_declarations_fail(self):
        for text in (
            report(RECONCILED + "\n" + RECONCILED),
            report(RECONCILED + "\n" + RECONCILED.replace("86%", "50%")),
            report(RECONCILED + "\n" + NOT_ATTEMPTED),
            report(RECONCILED) + "\n" + HEADING + "\n" + NOT_ATTEMPTED,
        ):
            with self.subTest(text=text):
                self.assertTrue(check_text(text))

    def test_declaration_ends_attribution_section(self):
        self.assertTrue(check_text(report(RECONCILED + "\nActually this was not reconciled.")))
        self.assertTrue(check_text(report(RECONCILED + "\n### Qualification\nUnverified.")))

    def test_trailing_thematic_break_is_formatting_only(self):
        for separator in ("---", "***", "___", "- - -", "   * * *   "):
            with self.subTest(separator=separator):
                self.assertEqual(check_text(report(RECONCILED + "\n\n" + separator)), [])
        for qualification in ("--- not reconciled", "- - not verified", "--", "-_-"):
            with self.subTest(qualification=qualification):
                self.assertTrue(check_text(report(RECONCILED + "\n\n" + qualification)))

    def test_fenced_examples_do_not_supply_section_or_tag(self):
        for fence in ("```", "~~~"):
            with self.subTest(fence=fence):
                self.assertTrue(check_text(f"{fence}markdown\n{HEADING}\n{RECONCILED}\n{fence}"))
                self.assertTrue(check_text(report(f"{fence}\n{RECONCILED}\n{fence}")))
                self.assertEqual(check_text(report(f"{fence}\n## 2. Example heading\n{fence}\n{RECONCILED}")), [])


class CliTests(unittest.TestCase):
    def invoke(self, content: str | bytes | None, *args: str) -> subprocess.CompletedProcess[str]:
        with tempfile.TemporaryDirectory(prefix="commodity-attribution-test-") as run_root:
            if content is not None:
                output = Path(run_root) / "macro-positioning" / "01_commodity-macro-drivers.md"
                output.parent.mkdir()
                output.write_bytes(content if isinstance(content, bytes) else content.encode())
            return subprocess.run([sys.executable, str(SCRIPT), run_root, *args], text=True,
                                  capture_output=True, check=False)

    def test_reconciled_stdout_preserves_figures(self):
        result = self.invoke(report(RECONCILED))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.strip(), RECONCILED)
        self.assertEqual(result.stderr, "")

    def test_not_attempted_stdout_preserves_reason(self):
        result = self.invoke(report(NOT_ATTEMPTED))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.strip(), NOT_ATTEMPTED)
        self.assertNotIn("reconciled", result.stdout)

    def test_invalid_report_is_visible_failure(self):
        for content in ("", report(RECONCILED.replace("86%", "50%")), b"\xff"):
            with self.subTest(content=content):
                result = self.invoke(content)
                self.assertEqual(result.returncode, 1)
                self.assertTrue(result.stderr.startswith("GATE-FAIL:"), result.stderr)
                self.assertEqual(result.stdout, "")

    def test_absent_report_is_distinct_from_success(self):
        result = self.invoke(None)
        self.assertEqual(result.returncode, 0)
        self.assertIn("RF-COMM-001: N/A", result.stdout)
        self.assertNotIn("reconciled", result.stdout)

    def test_dispatched_report_is_required(self):
        result = self.invoke(None, "--require-report")
        self.assertEqual(result.returncode, 1)
        self.assertTrue(result.stderr.startswith("GATE-FAIL:"), result.stderr)
        self.assertIn("required macro-drivers report is missing", result.stderr)
        self.assertEqual(result.stdout, "")
        for declaration in (RECONCILED, NOT_ATTEMPTED):
            with self.subTest(declaration=declaration):
                result = self.invoke(report(declaration), "--require-report")
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(result.stdout.strip(), declaration)

    def test_builtin_selftest(self):
        result = subprocess.run([sys.executable, str(SCRIPT), "--selftest"], text=True,
                                capture_output=True, check=False)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("SELFTEST OK", result.stdout)


if __name__ == "__main__":
    unittest.main()
