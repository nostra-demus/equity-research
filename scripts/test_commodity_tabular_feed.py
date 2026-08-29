#!/usr/bin/env python3
"""Prove the declarative adapter accepts licensed CSV and rejects layout drift."""
from __future__ import annotations

import copy
import datetime as dt
import json
from pathlib import Path

from commodity_tabular_feed import build
from connector_contract import validate_staged_output


REPO = Path(__file__).resolve().parents[1]
connector = REPO / ".claude" / "connectors" / "fred-us-10y-real-yield"
manifest = json.loads((connector / "connector.json").read_text(encoding="utf-8"))
config = json.loads((connector / "feed.json").read_text(encoding="utf-8"))

manual_manifest = copy.deepcopy(manifest)
manual_manifest.update({
    "id": "capital-iq-commodity-test", "dataset_id": "capital-iq.test-series",
    "provider": "S&P Capital IQ Pro", "authority_class": "licensed_vendor",
    "acquisition": "manual", "source_type": "vendor_export",
    "license": "Test entitlement; redistribution prohibited", "manual": True,
    "manual_ingest": {"file_arg": "--from-file"},
    "host_allowlist": ["www.capitaliq.spglobal.com"],
    "licensing": {
        "access": "licensed", "use": "entitlement_required", "redistribution": "prohibited",
        "terms_url": "https://www.capitaliq.spglobal.com/cache/Documents/msa4.pdf",
    },
})
manual_config = copy.deepcopy(config)
manual_config.update({
    "source_url_template": "https://www.capitaliq.spglobal.com/",
    "lookback_days": None,
    "note": "Licensed Capital IQ CSV export under the user's entitlement.",
})

start = dt.date(2023, 1, 1)
rows = ["observation_date,DFII10"] + [
    f"{start + dt.timedelta(days=index)},{2 + index / 10000}" for index in range(800)
]
fixture_url = manual_config["source_url_template"]
as_of, payload, sidecar = build(
    "\n".join(rows).encode(), manual_manifest, manual_config, url=fixture_url,
)
defects = validate_staged_output(
    manual_manifest, "COPPER", payload, sidecar, as_of, manual_ingest=True,
)
assert not defects, defects
assert sidecar["provider"] == "S&P Capital IQ Pro"
assert sidecar["licensing"]["redistribution"] == "prohibited"

try:
    build(b"Date,Value\n2026-01-01,1", manual_manifest, manual_config, url=fixture_url)
except RuntimeError as error:
    assert "header changed" in str(error)
else:
    raise AssertionError("a changed Capital IQ export layout was accepted")
print("PASS: declarative Capital IQ CSV is licensed, typed, and fail-closed")

monthly_manifest = copy.deepcopy(manifest)
monthly_manifest["minimum_history"] = {"observations": 2, "path": "observations"}
monthly_config = copy.deepcopy(config)
monthly_config["columns"][0]["type"] = "month_end"
monthly_config["lookback_days"] = None
monthly_config["source_url_template"] = "https://fred.stlouisfed.org/"
as_of, monthly_payload, _ = build(
    b"observation_date,DFII10\n2024-02,1.0\n2024-04,1.2\n",
    monthly_manifest,
    monthly_config,
    url=monthly_config["source_url_template"],
)
assert as_of == "2024-04-30"
assert monthly_payload["observations"][0]["date"] == "2024-02-29"

try:
    build(
        b"observation_date,DFII10\n2024-02,1.0\n2024-13,1.2\n",
        monthly_manifest,
        monthly_config,
        url=monthly_config["source_url_template"],
    )
except RuntimeError as error:
    assert "real month" in str(error)
else:
    raise AssertionError("an invalid monthly period was accepted")
print("PASS: monthly periods normalize to real month-end dates")
