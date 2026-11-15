#!/usr/bin/env python3
"""Source-bound accounting examples and adversarial variants, not independent investment cases.

Run directly or through the existing sensitivity_math --selftest CI entry. No provider/network calls.
"""
import copy
import json
from pathlib import Path
import subprocess
import sys
import unittest

from sensitivity_math import resolve_additive, validate_additive_sidecar
from sensitivity_summary_checks import check_sensitivity_summary, _LEGACY_ROOT_TYPES, _LEGACY_ROW_TYPES

ROOT = Path(__file__).resolve().parent.parent
FIXTURES = json.loads((ROOT / "scripts/fixtures/sensitivity_additive_cases.json").read_text())["fixtures"]


class AdditiveSensitivityTests(unittest.TestCase):
    def fixture(self, index=0):
        f = copy.deepcopy(FIXTURES[index])
        return f["sidecar"], f["request"]

    def result(self, sidecar, request):
        result = resolve_additive(sidecar, request)
        self.assertEqual(result["kind"], "additive")
        return result

    def reject(self, sidecar, request):
        r = self.result(sidecar, request)
        self.assertNotEqual(r["status"], "computed", r)
        self.assertIsNone(r["remainder"], r)
        return r

    def test_source_cases_and_cli_use_same_authority(self):
        for index, fixture in enumerate(FIXTURES):
            with self.subTest(case=fixture["case_id"]):
                sc, req = self.fixture(index)
                self.assertEqual(validate_additive_sidecar(sc), [])
                self.assertEqual(check_sensitivity_summary(sc, "2026-11-15"), [])
                result = self.result(sc, req)
                expected = fixture["expected"]
                self.assertEqual(result["remainder"], expected["required_remainder"])
                self.assertEqual(result["component_sum"], expected["displayed_sum"])
                self.assertEqual(result["displayed_gap"], expected["displayed_gap"])
                self.assertEqual(result["status"], "computed" if index < 2 else "withheld")
                process = subprocess.run([sys.executable, "-B", str(ROOT / "scripts/sensitivity_math.py"), "--scenario"],
                                         input=json.dumps({"sidecar": sc, **req}), text=True, capture_output=True, check=True)
                self.assertEqual(json.loads(process.stdout), result)
        self.assertIn("-7655", self.result(*self.fixture(1))["symbolic_build"])

    def test_exact_decimal_and_displayed_gap_are_not_tolerances(self):
        sc, req = self.fixture()
        ident = sc["additive_identities"][0]
        for part, amount in zip(ident["components"], [0.1, 0.2, 0.3]):
            part["value"] = amount
        ident["total"]["value"] = 0.6
        r = self.result(sc, req)
        self.assertEqual(r["displayed_gap"], 0)
        self.assertEqual(r["remainder_exact"], "0.3")
        ident["total"]["value"] = 0.6000000001
        self.assertEqual(self.reject(sc, req)["reason"], "unresolved_displayed_gap")

    def test_reconcile_does_not_ignore_target_or_profile(self):
        sc, req = self.fixture(2)
        ident = sc["additive_identities"][0]
        req = {"operation": "additive", "mode": "reconcile", "identity_id": ident["identity_id"],
               "question": "Reconcile " + ident["label"] + " for Q1 2026"}
        self.assertEqual(self.reject(sc, req)["displayed_gap"], 1)
        for field, value in [("target", 9000), ("conditional_profile_id", "profile"), ("remainder_component_ids", [])]:
            self.reject(sc, dict(req, **{field: value}))

    def test_invalid_numbers_sources_contexts_and_coverage(self):
        for bad in [True, None, "1", float("nan"), float("inf"), 10 ** 400]:
            sc, req = self.fixture()
            sc["additive_identities"][0]["components"][0]["value"] = bad
            self.reject(sc, req)
        for field, bad in [("currency", "NOK"), ("scale", "units"), ("basis", "company_adjusted:other"),
                           ("period_start", "2025-07-01"), ("scope", "standalone_entity"),
                           ("accounting_standard", "IFRS"), ("entity", "other entity")]:
            sc, req = self.fixture()
            sc["additive_identities"][0]["components"][0]["context"][field] = bad
            self.reject(sc, req)
        for field in ["source", "coverage"]:
            sc, req = self.fixture()
            sc["additive_identities"][0]["components"][0][field] = "\ufeff" if field == "source" else []
            self.reject(sc, req)
        sc, req = self.fixture()
        ident = sc["additive_identities"][0]
        ident["components"][1]["coverage"] = ident["components"][0]["coverage"]
        self.reject(sc, req)
        sc, req = self.fixture()
        sc["additive_identities"][0]["context"]["period_end"] = "2026-02-30"
        self.reject(sc, req)

    def test_metric_allowlist_and_adjusted_basis_do_not_change_eps_coefficients(self):
        for metric in ["EPS", "per_share", "ebitda_margin", "growth", "return", "yield", "ratio", "adjusted_ebitda"]:
            sc, req = self.fixture()
            ident = sc["additive_identities"][0]
            for ctx in [ident["context"], ident["total"]["context"]] + [p["context"] for p in ident["components"]]:
                ctx["metric"] = metric
            self.reject(sc, req)
        sc, req = self.fixture(2)
        self.assertEqual(self.result(sc, req)["context"]["metric"], "ebitda")
        self.assertEqual(sc["additive_identities"][0]["context"]["metric"], "adjusted_EBITDA")

    def test_duplicate_or_ambiguous_recorded_selection(self):
        for field in ["component_id", "label"]:
            sc, req = self.fixture()
            ident = sc["additive_identities"][0]
            ident["components"][1][field] = ident["components"][0][field].upper()
            self.reject(sc, req)
        sc, req = self.fixture()
        self.reject(sc, dict(req, remainder_component_ids=[{}]))
        sc["additive_identities"].append(copy.deepcopy(sc["additive_identities"][0]))
        self.reject(sc, req)

    def test_question_uniquely_grounds_identity_not_only_metric(self):
        sc, req = self.fixture()
        other = copy.deepcopy(sc["additive_identities"][0])
        other.update(identity_id="alternative", label="Alternative operating income")
        other["components"][0]["value"] += 100
        other["total"]["value"] += 100
        sc["additive_identities"].append(other)
        self.assertEqual(self.reject(sc, req)["reason"], "ambiguous_identity_binding")
        for identity, expected in [(sc["additive_identities"][0], 10303), (other, 10403)]:
            bound = dict(req, identity_id=identity["identity_id"], question="Using the Q3 2026 " + identity["label"] + " identity, how much is North America plus International?")
            self.assertEqual(self.result(sc, bound)["remainder"], expected)
        wrong = dict(bound, identity_id=sc["additive_identities"][0]["identity_id"])
        self.reject(sc, wrong)
        sc, req = self.fixture(1)
        self.reject(sc, dict(req, remainder_component_ids=["other_bets"]))
        sc, req = self.fixture()
        self.reject(sc, dict(req, question=req["question"].replace("North America plus International", "North America")))
        for phrase in ["not North America", "North America except International", "North America and North America"]:
            self.reject(sc, dict(req, question=req["question"].replace("North America plus International", phrase)))
        # One long recorded label and two shorter labels can spell the same requested set differently.
        # A longest-label guess would compute an arbitrary recorded component instead of refusing.
        sc, req = self.fixture(1)
        sc["additive_identities"][0]["components"][0]["label"] = "Google Cloud and Other Bets"
        req["remainder_component_ids"] = ["google_services"]
        req["question"] = req["question"].replace("how much is Google Cloud", "how much is Google Cloud and Other Bets")
        self.reject(sc, req)

    def test_whole_sidecar_rejects_malformed_supplied_legacy(self):
        for bad in [None, {}, [], [True], [{"variable": "input", "coefficient": 1}]]:
            sc, req = self.fixture()
            sc["sensitivities"] = bad
            self.assertEqual(self.reject(sc, req)["reason"], "invalid_legacy")
        sc, req = self.fixture()
        sc["base_value"] = 100
        self.reject(sc, req)

    def test_coexisting_legacy_types_match_unchanged_schema(self):
        schema = json.loads((ROOT / "frameworks/sensitivity_summary.schema.json").read_text())
        self.assertEqual(_LEGACY_ROOT_TYPES, {k: v["type"] for k, v in schema["properties"].items() if k != "additive_identities"})
        self.assertEqual(_LEGACY_ROW_TYPES, {k: v["type"] for k, v in schema["properties"]["sensitivities"]["items"]["properties"].items()})
        legacy = {"base_metric": "EPS", "base_value": 1, "base_period": "Q3 2026",
                  "sensitivities": [{"variable": "input", "coefficient": 0.1, "source": "Software disclosure",
                                     "basis": "unknown", "mitigation_basis": "zero_bound"}]}
        sc, req = self.fixture()
        sc.update(copy.deepcopy(legacy))
        self.assertEqual(self.result(sc, req)["status"], "computed")  # Free-text legacy basis is legal.
        for bad in [None, True, []]:
            changed = copy.deepcopy(sc)
            changed["base_metric"] = bad
            self.assertEqual(self.reject(changed, req)["reason"], "invalid_legacy")
        for key, bad in [("variable", 1), ("variable", True), ("variable", []), ("label", {}), ("unit", 1), ("basis", {}),
                         ("base_value", "10"), ("base_value", True), ("coefficient", 10 ** 400),
                         ("realised_offset_pct", "0"), ("valid_range", {"low": None, "high": 10})]:
            changed = copy.deepcopy(sc)
            changed["sensitivities"][0][key] = bad
            self.reject(changed, req)

    def future(self):
        sc, req = self.fixture()
        profile = sc["additive_identities"][0]["conditional_profiles"][0]
        req.update(target=31000, conditional_profile_id=profile["profile_id"])
        req["question"] = req["question"].rstrip("?") + " if total is 31,000 USD million for Q4 2026 under " + profile["label"] + "?"
        return sc, req, profile

    def test_future_never_inherits_total_or_unknown_residual(self):
        sc, req, profile = self.future()
        self.assertEqual(self.reject(sc, req)["reason"], "unknown_future_residual")
        profile["residual"] = {"value": 0, "assumption": "Assume no new unallocated reconciliation term; not observed."}
        result = self.result(sc, req)
        self.assertEqual(result["remainder"], 13227)
        self.assertTrue(result["conditional_not_forecast"])
        self.assertEqual(result["source_period"]["label"], "Q3 2026")
        self.assertEqual(result["target_period"]["label"], "Q4 2026")
        self.assertEqual(result["assumptions"][-1], profile["residual"]["assumption"])
        for mutation in [dict(req, target=None), {k: v for k, v in req.items() if k != "target"},
                         {k: v for k, v in req.items() if k != "conditional_profile_id"}]:
            self.reject(sc, mutation)
        for changed in ["for Q4 2027", "for Q3 2026", "for next quarter"]:
            self.reject(sc, dict(req, question=req["question"].replace("for Q4 2026", changed)))
        profile["component_holds"] = {}
        self.assertEqual(self.reject(sc, req)["reason"], "missing_hold_assumption")

    def test_target_requires_total_currency_scale_and_unique_role(self):
        sc, req, profile = self.future()
        profile["residual"] = {"value": 0, "assumption": "Explicit test-only zero residual assumption."}
        for phrase in ["31 USD billion", "31 billion", "31000 NOK million", "31000 USD units", "31000", "not 31000 USD million", "31,000 USD million or 32000 USD million", "31,00 USD million"]:
            self.reject(sc, dict(req, question=req["question"].replace("31,000 USD million", phrase)))
        for target in [2027, 17773, 31, True, float("nan")]:
            self.reject(sc, dict(req, target=target))
        self.reject(sc, dict(req, question=req["question"].replace("under Q4 2026 held AWS reference", "under another profile")))

    def test_gap_withholding_keeps_grounded_selection_and_future_provenance(self):
        sc, req = self.fixture(2)
        r = self.reject(sc, req)
        self.assertEqual(r["remainder_component_ids"], ["aluminium_metal"])
        self.assertEqual(len(r["known_components"]), 5)
        ident = sc["additive_identities"][0]
        profile = {"profile_id": "next_reference", "label": "Q2 2026 held references", "target_period_start": "2026-04-01", "target_period_end": "2026-06-30", "target_period_basis": "standalone_flow", "target_period_label": "Q2 2026", "assumption": "Hypothetical reference only.", "component_holds": {p["component_id"]: "Assume held " + p["label"] for p in ident["components"] if p["component_id"] != "aluminium_metal"}, "residual": {"value": 0, "assumption": "Assume no additional outside-component term; not a repair for the displayed gap."}}
        ident["conditional_profiles"] = [profile]
        req.update(target=9000, conditional_profile_id=profile["profile_id"], question=req["question"].rstrip("?") + " if total is 9000 NOK million for Q2 2026 under " + profile["label"] + "?")
        r = self.reject(sc, req)
        self.assertEqual(r["reason"], "unresolved_displayed_gap")
        self.assertEqual(r["source_period"]["label"], "Q1 2026")
        self.assertEqual(r["target_period"]["label"], "Q2 2026")
        self.assertEqual(r["conditional_profile_id"], "next_reference")
        self.assertEqual(len(r["assumptions"]), 7)
        self.assertEqual(r["displayed_gap"], 1)
        self.assertIsNone(r["remainder"])


def run_tests():
    return unittest.TextTestRunner(verbosity=1).run(unittest.defaultTestLoader.loadTestsFromTestCase(AdditiveSensitivityTests)).wasSuccessful()


if __name__ == "__main__":
    raise SystemExit(0 if run_tests() else 1)
