#!/usr/bin/env python3
"""Contract tests for versioned commodity `data_needs[]` decision guidance.

Pins the migration boundary and both validation layers:
  1. BACKWARD-COMPAT — old records without a discriminator keep the v1 shape, including ALUMINIUM.
  2. V2 STRUCTURE — exact ranked/two-sided/orb-routed entries, max five, source hints with no URL.
  3. V2 SEMANTICS — fresh records require the discriminator; ranks are unique/contiguous from 1;
     no entry may promise or quantify a conviction/score/rating lift.

Runs the repo's own dependency-free JSON-Schema checker (scripts/validate_screener_json.py) — no
third-party deps. Invoked from CI. Run: python3 scripts/test_commodity_data_needs.py
"""
from __future__ import annotations

import importlib.util
import json
import os

_REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _load_checker():
    path = os.path.join(_REPO, "scripts", "validate_screener_json.py")
    spec = importlib.util.spec_from_file_location("validate_screener_json", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


MOD = _load_checker()
SCHEMA = json.load(open(os.path.join(_REPO, "frameworks/commodity/decision_record.schema.json"), encoding="utf-8"))
CONNECTOR_SCHEMA = json.load(open(os.path.join(_REPO, "frameworks/connector.schema.json"), encoding="utf-8"))


def schema_errs(doc: dict) -> list[str]:
    c = MOD.Checker(SCHEMA)
    c.check(SCHEMA, doc, "")
    return c.errors


def semantic_errs(doc: dict) -> list[str]:
    return MOD.check_commodity_data_needs_v2(doc, enforce_live_roster=True)


def errs(doc: dict) -> list[str]:
    return schema_errs(doc) + semantic_errs(doc)


BASE = {
    "swarm": "commodity", "commodity": "WHEAT", "decision_date": "2026-08-13",
    "action": "Research More", "benchmark": "CBOT SRW (ZW), US¢/bushel",
    "current_price": {"value": 632, "currency": "USc", "unit": "per bushel", "as_of": "2026-08-12"},
    "curve": "contango", "balance": "deficit", "net_macro": "mixed", "positioning": "net short",
    "thesis_summary": "a one-line thesis", "key_risks": ["a risk"],
    "key_levels": {"support": None, "resistance": None, "fair_value_range": None},
    "relative_view": "ranks mid-pack", "confidence": 38, "sources": ["USDA WASDE Jul-2026"],
}

VALID_V1_NEED = {
    "need_id": "wasde-stocks-to-use",
    "series": "USDA WASDE US wheat ending stocks-to-use",
    "why_it_caps": "the balance verdict rests on the stocks-to-use trend",
    "cap_lifted": "confirms the deficit",
    "filing_required": False,
    "entry_modules": ["supply-demand"],
    "suggested_source": {"name": "USDA FAS PSD Online", "acquisition": "free_key_api", "licensing": "public_domain"},
    "tier": 5,
    "cadence": "event_driven",
    "next_release": "2026-08-12",
}


VALID_V2_NEED = {
    "need_id": "wasde-stocks-to-use",
    "priority": 1,
    "series": "USDA WASDE US wheat ending stocks-to-use",
    "why_it_caps": "the missing monthly print leaves the current balance direction unresolved",
    "expected_impact": {
        "if_supportive": "a lower stocks-to-use print would strengthen the deficit evidence, subject to the other balance inputs",
        "if_adverse": "a higher stocks-to-use print would weaken or reject the deficit read",
    },
    "filing_required": False,
    "entry_orbs": [{
        "module": "supply-demand",
        "agent": "commodity-demand-inventory",
        "why": "this orb owns the physical balance",
        "confidence": 0.93,
    }],
    "suggested_source": {
        "name": "USDA FAS PSD Online",
        "acquisition": "free_key_api",
        "access": "public",
        "licensing_basis": "US government public data; terms still checked at connector approval",
    },
    "tier": 5,
    "cadence": "event_driven",
    "next_release": "2026-09-11",
}


def v1_rec(*needs):
    return {**BASE, "data_needs": list(needs)}


def v2_rec(*needs, decision_date="2026-08-14"):
    return {
        **BASE,
        "decision_date": decision_date,
        "data_needs_schema_version": "2.0",
        "data_needs": list(needs),
    }


def without(d: dict, key: str) -> dict:
    return {k: v for k, v in d.items() if k != key}


failures = 0


def expect(label: str, ok: bool):
    global failures
    print(f"  {'ok ' if ok else 'FAIL'} {label}")
    if not ok:
        failures += 1


# 1. backward-compat: old records can omit the block/discriminator or retain the v1 shape
expect("record without data_needs validates (field is optional)", errs(BASE) == [])
expect("legacy record with empty data_needs validates", errs({**BASE, "data_needs": []}) == [])
expect("legacy v1 need validates without discriminator", errs(v1_rec(VALID_V1_NEED)) == [])
expect("legacy v1 still rejects missing filing_required",
       len(schema_errs(v1_rec(without(VALID_V1_NEED, "filing_required")))) > 0)
expect("legacy v1 still rejects an unknown acquisition enum", len(schema_errs(v1_rec({
    **VALID_V1_NEED,
    "suggested_source": {**VALID_V1_NEED["suggested_source"], "acquisition": "ftp"},
}))) > 0)
expect("legacy v1 still rejects a source hint without its required name", len(schema_errs(v1_rec({
    **VALID_V1_NEED,
    "suggested_source": without(VALID_V1_NEED["suggested_source"], "name"),
}))) > 0)
expect("legacy v1 remains permissive about historical extra fields", schema_errs(v1_rec({
    **VALID_V1_NEED, "historical_note": "preserved for backward compatibility",
})) == [])
expect("legacy v1 source hint remains permissive about historical nested fields", schema_errs(v1_rec({
    **VALID_V1_NEED,
    "suggested_source": {
        **VALID_V1_NEED["suggested_source"],
        "historical_provider_note": "preserved for backward compatibility",
    },
})) == [])
aluminium_path = os.path.join(_REPO, "commodity", "runs", "ALUMINIUM", "decision_record.json")
aluminium = json.load(open(aluminium_path, encoding="utf-8"))
expect("committed ALUMINIUM v1 record stays schema-valid", schema_errs(aluminium) == [])
expect("committed ALUMINIUM v1 record stays semantically valid", semantic_errs(aluminium) == [])
renamed_orb_snapshot = v2_rec({
    **VALID_V2_NEED,
    "entry_orbs": [{**VALID_V2_NEED["entry_orbs"][0], "agent": "renamed-after-publication"}],
})
expect("historical replay does not couple an immutable snapshot to today's live roster",
       MOD.check_commodity_data_needs_v2(renamed_orb_snapshot, enforce_live_roster=False) == [])
expect("publication-time validation still rejects that stale route",
       any("live discovered roster" in error for error in
           MOD.check_commodity_data_needs_v2(renamed_orb_snapshot, enforce_live_roster=True)))


def refs(value):
    if isinstance(value, dict):
        for key, child in value.items():
            if key == "$ref":
                yield child
            yield from refs(child)
    elif isinstance(value, list):
        for child in value:
            yield from refs(child)


expect("commodity decision schema uses internal refs only",
       all(isinstance(ref, str) and ref.startswith("#/") for ref in refs(SCHEMA)))
version_branch = next(branch for branch in SCHEMA["allOf"] if "data_needs_schema_version" in branch.get("if", {}).get("required", []))
expect("discriminator if-branch itself requires data_needs_schema_version",
       version_branch["if"]["required"] == ["data_needs_schema_version"])

# 2. fresh date boundary and a well-formed v2 need
expect("fresh record without discriminator is rejected", len(errs({**BASE, "decision_date": "2026-08-14", "data_needs": []})) > 0)
expect("a newly published rerun cannot use its preserved old decision date to bypass v2",
       any("fresh records must distinguish" in error for error in MOD.check_commodity_data_needs_v2(
           {**BASE, "decision_date": "2026-08-13", "data_needs": []},
           enforce_live_roster=True, publication_date="2026-08-14",
       )))
expect("frozen replay of that genuinely pre-rollout record stays backward-compatible",
       MOD.check_commodity_data_needs_v2(
           {**BASE, "decision_date": "2026-08-13", "data_needs": []},
           enforce_live_roster=False,
       ) == [])
expect("fresh v2 record may explicitly report no active needs", errs(v2_rec()) == [])
expect("well-formed v2 need validates", errs(v2_rec(VALID_V2_NEED)) == [])
decision_cadences = SCHEMA["definitions"]["dataNeedEntryV2"]["properties"]["cadence"]["enum"]
connector_cadences = CONNECTOR_SCHEMA["properties"]["release"]["properties"]["cadence"]["enum"]
expect("data-needs and connector manifests expose the same complete cadence vocabulary",
       decision_cadences == connector_cadences)
for cadence in connector_cadences:
    expect(f"v2 data_need accepts connector cadence {cadence}",
           errs(v2_rec({**VALID_V2_NEED, "cadence": cadence})) == [])

# 3. exact v2 structural guards
expect("tier=1 (a filing) is rejected — a connector can never produce a filing",
       len(errs(v2_rec({**VALID_V2_NEED, "tier": 1}))) > 0)
expect("tier=4 rejected (only 5/9/10 allowed)", len(errs(v2_rec({**VALID_V2_NEED, "tier": 4}))) > 0)
expect("missing filing_required is rejected (required)",
       len(errs(v2_rec(without(VALID_V2_NEED, "filing_required")))) > 0)
expect("unknown acquisition method is rejected (enum)",
       len(errs(v2_rec({**VALID_V2_NEED, "suggested_source": {**VALID_V2_NEED["suggested_source"], "acquisition": "ftp"}}))) > 0)
expect("bad need_id slug is rejected (pattern)",
       len(errs(v2_rec({**VALID_V2_NEED, "need_id": "Bad ID"}))) > 0)
expect("blank series is rejected", len(errs(v2_rec({**VALID_V2_NEED, "series": "   "}))) > 0)
expect("empty entry_orbs is rejected (minItems)",
       len(errs(v2_rec({**VALID_V2_NEED, "entry_orbs": []}))) > 0)
expect("bad cadence is rejected (enum)",
       len(errs(v2_rec({**VALID_V2_NEED, "cadence": "hourly"}))) > 0)
expect("suggested_source missing name is rejected (required)",
       len(errs(v2_rec({**VALID_V2_NEED, "suggested_source": without(VALID_V2_NEED["suggested_source"], "name")}))) > 0)
expect("suggested_source access is required", len(errs(v2_rec({
    **VALID_V2_NEED, "suggested_source": without(VALID_V2_NEED["suggested_source"], "access")
}))) > 0)
expect("v2 rejects legacy suggested_source.licensing", len(errs(v2_rec({
    **VALID_V2_NEED,
    "suggested_source": {**VALID_V2_NEED["suggested_source"], "licensing": "public_domain"},
}))) > 0)
expect("entry_orb confidence uses 0..1, not percent points", len(errs(v2_rec({
    **VALID_V2_NEED,
    "entry_orbs": [{**VALID_V2_NEED["entry_orbs"][0], "confidence": 93}],
}))) > 0)
expect("v2 rejects removed entry_modules", len(errs(v2_rec({**VALID_V2_NEED, "entry_modules": ["supply-demand"]}))) > 0)
expect("v2 rejects removed cap_lifted", len(errs(v2_rec({**VALID_V2_NEED, "cap_lifted": "raises conviction"}))) > 0)
expect("v2 rejects a URL field", len(errs(v2_rec({**VALID_V2_NEED, "url": "https://example.test"}))) > 0)
expect("v2 rejects a URL hidden in a source hint", len(errs(v2_rec({
    **VALID_V2_NEED,
    "suggested_source": {**VALID_V2_NEED["suggested_source"], "name": "https://example.test/data"},
}))) > 0)
expect("v2 rejects a bare-domain URL", len(errs(v2_rec({
    **VALID_V2_NEED,
    "suggested_source": {**VALID_V2_NEED["suggested_source"], "name": "api.example.gov/data"},
}))) > 0)
expect("v2 rejects more than five needs", len(errs(v2_rec(*[
    {**VALID_V2_NEED, "need_id": f"need-{i}", "priority": i} for i in range(1, 7)
]))) > 0)
expect("tier=10 (dated web source) is allowed", errs(v2_rec({**VALID_V2_NEED, "tier": 10})) == [])

# 4. semantic rank and non-promise guards
SECOND = {**VALID_V2_NEED, "need_id": "cftc-positioning", "priority": 2,
          "series": "CFTC wheat managed-money net position"}
expect("two unique contiguous ranks validate", errs(v2_rec(VALID_V2_NEED, SECOND)) == [])
expect("rank list must include priority 1", len(errs(v2_rec({**VALID_V2_NEED, "priority": 2}))) > 0)
expect("duplicate ranks are rejected", len(errs(v2_rec(VALID_V2_NEED, {**SECOND, "priority": 1}))) > 0)
expect("gapped ranks are rejected", len(errs(v2_rec(VALID_V2_NEED, {**SECOND, "priority": 3}))) > 0)
expect("array order itself must be priority 1 then 2", len(errs(v2_rec(SECOND, VALID_V2_NEED))) > 0)
expect("need_id values are unique", len(errs(v2_rec(VALID_V2_NEED, {**SECOND, "need_id": VALID_V2_NEED["need_id"]}))) > 0)
expect("unknown commodity module is rejected against the discovered roster", len(errs(v2_rec({
    **VALID_V2_NEED,
    "entry_orbs": [{**VALID_V2_NEED["entry_orbs"][0], "module": "not-a-live-module"}],
}))) > 0)
expect("unknown commodity agent is rejected against the discovered roster", len(errs(v2_rec({
    **VALID_V2_NEED,
    "entry_orbs": [{**VALID_V2_NEED["entry_orbs"][0], "agent": "not-a-live-agent"}],
}))) > 0)
expect("a live agent paired with the wrong live module is rejected", len(errs(v2_rec({
    **VALID_V2_NEED,
    "entry_orbs": [{**VALID_V2_NEED["entry_orbs"][0], "module": "market-structure"}],
}))) > 0)
expect("obvious guarantee wording is rejected", len(errs(v2_rec({
    **VALID_V2_NEED, "expected_impact": {
        **VALID_V2_NEED["expected_impact"],
        "if_supportive": "this will guarantee a Buy rating",
    }
}))) > 0)
expect("guaranteeing a Buy rating is rejected", len(errs(v2_rec({
    **VALID_V2_NEED, "expected_impact": {
        **VALID_V2_NEED["expected_impact"],
        "if_supportive": "this is guaranteeing a Buy rating",
    }
}))) > 0)
expect("a promised rating upgrade is rejected", len(errs(v2_rec({
    **VALID_V2_NEED, "expected_impact": {
        **VALID_V2_NEED["expected_impact"],
        "if_supportive": "this would upgrade the rating to Buy",
    }
}))) > 0)
expect("100% confidence is rejected", len(errs(v2_rec({
    **VALID_V2_NEED, "expected_impact": {
        **VALID_V2_NEED["expected_impact"],
        "if_supportive": "this produces 100% confidence",
    }
}))) > 0)
for promise in (
    "Supportive evidence raises conviction.",
    "Supportive evidence improves the rating.",
    "Supportive evidence upgrades the rating to Buy.",
    "Buy is guaranteed.",
    "This provides 99.9% confidence.",
    "We can be 100 percent confident.",
    "This implies confidence of 100%.",
    "This would provide 100% confidence in the call.",
    "This produces 99.9% confidence.",
    "This ensures an upgrade.",
    "This evidence would strengthen conviction.",
    "This evidence would enhance confidence.",
    "This evidence makes the call certain.",
    "This evidence gives complete confidence.",
    "This evidence implies 1.0 confidence.",
    "This evidence guarantees the conclusion.",
    "This evidence guarantees the thesis.",
    "This evidence guarantees the investment case.",
    "This evidence guarantees the bull case.",
    "This evidence makes the thesis certain.",
    "This evidence makes us fully confident.",
    "This evidence removes all uncertainty.",
    "This evidence would leave no doubt about the call.",
    "This evidence guarantees upside.",
    "This evidence guarantees positive returns.",
    "This evidence guarantees outperformance.",
    "This evidence guarantees the price target.",
    "This evidence guarantees a profit.",
    "This evidence promises alpha.",
    "This evidence guarantees a rally.",
    "This evidence makes gains certain.",
    "This evidence means there is no downside.",
    "This evidence proves the bull case.",
    "This evidence confirms the Buy thesis.",
    "This evidence locks in a Buy.",
    "This evidence forces a Buy.",
    "This evidence compels an upgrade.",
    "This evidence automatically makes it a Buy.",
    "This evidence means we must Buy.",
):
    expect(f"promised investment outcome is rejected: {promise}", len(errs(v2_rec({
        **VALID_V2_NEED,
        "expected_impact": {**VALID_V2_NEED["expected_impact"], "if_supportive": promise},
    }))) > 0)
expect("numeric conviction lift is rejected", len(errs(v2_rec({
    **VALID_V2_NEED, "expected_impact": {
        **VALID_V2_NEED["expected_impact"],
        "if_supportive": "this will lift conviction by 10 points",
    }
}))) > 0)
expect("numeric confidence change phrased as a range is rejected", len(errs(v2_rec({
    **VALID_V2_NEED, "expected_impact": {
        **VALID_V2_NEED["expected_impact"],
        "if_supportive": "confidence rises from 40 to 60",
    }
}))) > 0)
for urlish in ("api.provider.dev/data", "provider.xyz/data", "ftp://provider.example/data", "s3://research-bucket/key",
               "192.0.2.1/data", "10.0.0.1:8080/path"):
    expect(f"arbitrary URL form is rejected: {urlish}", len(errs(v2_rec({
        **VALID_V2_NEED, "series": urlish,
    }))) > 0)
expect("ordinary production-cap prose is not mistaken for a conviction promise", errs(v2_rec({
    **VALID_V2_NEED, "why_it_caps": "OPEC production cap will increase after the policy meeting",
})) == [])
expect("generic domain rating prose is not mistaken for an investment promise", errs(v2_rec({
    **VALID_V2_NEED, "why_it_caps": "rating will improve after debt repayment",
})) == [])
for ordinary in (
    "The decision depends on certain filed data.",
    "Certain evidence required for the rating is unavailable.",
    "The action depends on certain production assumptions.",
    "The survey reports a 95% confidence interval.",
    "The estimate needs a 90 percent confidence interval.",
    "The survey reports a 95% confidence level.",
    "Consumer confidence rose by 10%.",
    "Business confidence rises from 40 to 60.",
    "The supplier guarantees data quality.",
    "The exchange guarantees settlement.",
    "The vendor guarantees credit rating data completeness.",
    "The source promises timely credit rating updates.",
    "The provider assures complete rating-history coverage.",
    "The supplier guarantees an upgrade to the API.",
    "The vendor guarantees return-field completeness.",
    "The print confirms the production estimate.",
    "The regulation forces supplier closure.",
):
    expect(f"ordinary determiner 'certain' remains valid: {ordinary}", errs(v2_rec({
        **VALID_V2_NEED, "why_it_caps": ordinary,
    })) == [])
expect("canonical supportive conditional remains valid", errs(v2_rec({
    **VALID_V2_NEED,
    "expected_impact": {**VALID_V2_NEED["expected_impact"],
                        "if_supportive": "A lower print would strengthen the case, subject to other inputs"},
})) == [])
expect("canonical adverse conditional remains valid", errs(v2_rec({
    **VALID_V2_NEED,
    "expected_impact": {**VALID_V2_NEED["expected_impact"],
                        "if_adverse": "The adverse result would weaken the balance case"},
})) == [])
expect("ordinary dotted-free source prose remains valid", errs(v2_rec({
    **VALID_V2_NEED, "series": "Official production series, revised monthly",
})) == [])
expect("next_release may equal the decision date", errs(v2_rec({
    **VALID_V2_NEED, "next_release": "2026-08-14",
})) == [])
expect("next_release cannot predate the decision", len(errs(v2_rec({
    **VALID_V2_NEED, "next_release": "2026-08-13",
}))) > 0)
expect("next_release must be a real calendar date", len(errs(v2_rec({
    **VALID_V2_NEED, "next_release": "2026-02-30",
}))) > 0)
expect("ordinary two-sided conditional wording remains valid", errs(v2_rec(VALID_V2_NEED)) == [])

print(f"\n{'PASS' if not failures else 'FAIL'}: commodity data_needs schema — {failures} failing case(s)")
raise SystemExit(1 if failures else 0)
