#!/usr/bin/env python3
"""Regression cases for the earnings counterpart of the commodity attribution gate."""
import unittest

from rating_caps import eval_be_driver_attribution_residual


class DriverAttributionResidualTests(unittest.TestCase):
    def check_report(self, report, margin=False, date="2026-09-07"):
        return eval_be_driver_attribution_residual(
            date, None if margin else report, report if margin else None,
        )

    def declarations(self):
        yield False, "RF-EARN-001", "revenue decomposition", "pp"
        yield True, "RF-EARN-002", "margin bridge", "bps"

    def test_sanctioned_forms_and_signed_components(self):
        for margin, tag, label, unit in self.declarations():
            for text in [
                f"{tag}: {label} reconciled — explained 3.2{unit}, residual 0.8{unit}, total 4.0{unit}",
                f"{tag}: {label} reconciled – explained -3.2{unit}, residual -0.8{unit}, total -4.0{unit}",
                f"{tag}: {label} not attempted — no disclosed segment sensitivity",
                f"{tag}: {label} not attempted — no components are separable; none disclosed",
                f"### **{tag}: {label} reconciled — explained 3{unit}, residual 1{unit}, total 4{unit}**",
            ]:
                with self.subTest(text=text):
                    self.assertEqual(self.check_report(text, margin), [])

    def test_explicit_failures_cannot_be_read_as_success(self):
        for margin, tag, label, unit in self.declarations():
            for text in [
                f"{tag}: {label} not reconciled — explained 3{unit}, residual 1{unit}, total 4{unit}",
                f"{tag}: {label} reconciled — explained 3{unit}, residual 1{unit}, total 10{unit}; not attempted because no data",
                f"{tag}: {label} not attempted",
                f"{tag}: {label} not attempted —   ",
                f"{tag}: {label} not attempted — ---",
                f"{tag}: an example of {label} reconciled — explained 3{unit}, residual 1{unit}, total 4{unit}",
            ]:
                with self.subTest(text=text):
                    self.assertTrue(self.check_report(text, margin))

    def test_exact_tag_single_declaration_and_expected_units(self):
        for margin, tag, label, unit in self.declarations():
            good = f"{tag}: {label} reconciled — explained 3{unit}, residual 1{unit}, total 4{unit}"
            other_unit = "pp" if margin else "bps"
            for text in [
                good.replace(tag, tag + "0"),
                good + "\n" + good,
                good + "\n" + good.replace("total 4", "total 10"),
                good.replace(f"residual 1{unit}", f"residual 1{other_unit}"),
                good.replace(unit, other_unit),
                good.replace(label, "margin bridge" if not margin else "revenue decomposition"),
                f"| {tag} | reconciled | 3{unit} | 1{unit} | 4{unit} |",
            ]:
                with self.subTest(text=text):
                    self.assertTrue(self.check_report(text, margin))

    def test_nonfinite_values_do_not_bypass_arithmetic(self):
        huge = "9" * 400
        for margin, tag, label, unit in self.declarations():
            text = (f"{tag}: {label} reconciled — explained {huge}{unit}, "
                    f"residual -{huge}{unit}, total 4{unit}")
            self.assertTrue(self.check_report(text, margin))

    def test_rollout_and_absent_specialist_behavior_is_preserved(self):
        self.assertIsNone(self.check_report("bad report", date="2026-09-03"))
        self.assertIsNone(eval_be_driver_attribution_residual("2026-09-07", None, None))
        self.assertTrue(self.check_report(""))


if __name__ == "__main__":
    unittest.main()
