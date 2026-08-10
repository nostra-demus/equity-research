#!/usr/bin/env python3
"""Unit test for the optional `data_needs[]` block on the commodity decision_record schema
(frameworks/commodity/decision_record.schema.json).

Pins two things the "surface data-needs → build a connector → re-score" loop depends on:
  1. BACKWARD-COMPAT — a record with NO `data_needs` still validates (the field is optional).
  2. The new shape is genuinely ENFORCED — a well-formed need validates, and each structural guard
     the loop relies on (the §4 tier ceiling excludes filings, the acquisition enum, the need_id slug,
     the required fields incl. filing_required) is caught when violated.

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


def errs(doc: dict) -> list[str]:
    c = MOD.Checker(SCHEMA)
    c.check(SCHEMA, doc, "")
    return c.errors


BASE = {
    "swarm": "commodity", "commodity": "WHEAT", "decision_date": "2026-08-12",
    "action": "Research More", "benchmark": "CBOT SRW (ZW), US¢/bushel",
    "current_price": {"value": 632, "currency": "USc", "unit": "per bushel", "as_of": "2026-08-12"},
    "curve": "contango", "balance": "deficit", "net_macro": "mixed", "positioning": "net short",
    "thesis_summary": "a one-line thesis", "key_risks": ["a risk"],
    "key_levels": {"support": None, "resistance": None, "fair_value_range": None},
    "relative_view": "ranks mid-pack", "confidence": 38, "sources": ["USDA WASDE Jul-2026"],
}

VALID_NEED = {
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


def rec(*needs):
    return {**BASE, "data_needs": list(needs)}


def without(d: dict, key: str) -> dict:
    return {k: v for k, v in d.items() if k != key}


failures = 0


def expect(label: str, ok: bool):
    global failures
    print(f"  {'ok ' if ok else 'FAIL'} {label}")
    if not ok:
        failures += 1


# 1. backward-compat: no data_needs at all → valid
expect("record without data_needs validates (field is optional)", errs(BASE) == [])
# also a real committed shape (empty array) is fine
expect("record with empty data_needs validates", errs({**BASE, "data_needs": []}) == [])

# 2. a well-formed need validates
expect("a well-formed data_need validates", errs(rec(VALID_NEED)) == [])
decision_cadences = SCHEMA["properties"]["data_needs"]["items"]["properties"]["cadence"]["enum"]
connector_cadences = CONNECTOR_SCHEMA["properties"]["release"]["properties"]["cadence"]["enum"]
expect("data-needs and connector manifests expose the same complete cadence vocabulary",
       decision_cadences == connector_cadences)
for cadence in connector_cadences:
    expect(f"data_need accepts connector cadence {cadence}",
           errs(rec({**VALID_NEED, "cadence": cadence})) == [])

# 3. structural guards are enforced (each violation must produce >=1 error)
expect("tier=1 (a filing) is rejected — a connector can never produce a filing",
       len(errs(rec({**VALID_NEED, "tier": 1}))) > 0)
expect("tier=4 rejected (only 5/9/10 allowed)", len(errs(rec({**VALID_NEED, "tier": 4}))) > 0)
expect("missing filing_required is rejected (required)",
       len(errs(rec(without(VALID_NEED, "filing_required")))) > 0)
expect("unknown acquisition method is rejected (enum)",
       len(errs(rec({**VALID_NEED, "suggested_source": {"name": "X", "acquisition": "ftp"}}))) > 0)
expect("bad need_id slug is rejected (pattern)",
       len(errs(rec({**VALID_NEED, "need_id": "Bad ID"}))) > 0)
expect("empty entry_modules is rejected (minItems)",
       len(errs(rec({**VALID_NEED, "entry_modules": []}))) > 0)
expect("bad cadence is rejected (enum)",
       len(errs(rec({**VALID_NEED, "cadence": "hourly"}))) > 0)
expect("suggested_source missing name is rejected (required)",
       len(errs(rec({**VALID_NEED, "suggested_source": {"acquisition": "official_api"}}))) > 0)
# tier=9/10 (a scrape ceiling) is allowed
expect("tier=10 (dated web scrape) is allowed", errs(rec({**VALID_NEED, "tier": 10})) == [])

print(f"\n{'PASS' if not failures else 'FAIL'}: commodity data_needs schema — {failures} failing case(s)")
raise SystemExit(1 if failures else 0)
