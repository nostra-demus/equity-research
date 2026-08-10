#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("usgs_gold_fetch", os.path.join(HERE, "fetch.py"))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402

header = "MCS chapter,Section,Commodity,Country,Statistics,Statistics_detail,Unit,Year,Value,Notes\n"
rows = []
for year, total in ((2024, 3280), (2025, 3300)):
    rows.append(f"GOLD,World Mine Production and Reserves:,Gold,World total,Production,Mine production: rounded,metric tons,{year},{total},Estimated.\n")
for index in range(12):
    rows.append(f"GOLD,World Mine Production and Reserves:,Gold,Country {index},Production,Mine production,metric tons,2025,{100 + index},Estimated.\n")
urls = ["https://www.sciencebase.gov/catalog/items?q=x", "https://www.sciencebase.gov/catalog/item/id?format=json", "https://www.sciencebase.gov/catalog/file/get/id"]
as_of, payload, sidecar = mod.build(header + "".join(rows), release_title="Mineral Commodity Summaries 2026 Data Release - Commodity Salient U.S. and World Statistics", urls=urls)
manifest = json.load(open(os.path.join(HERE, "connector.json"), encoding="utf-8"))
defects = validate_manifest(manifest["id"], HERE, manifest) + validate_staged_output(manifest, "GOLD", payload, sidecar, as_of)
assert not defects, defects
assert as_of == "2025-12-31" and payload["world"][-1]["mine_production"] == 3300
assert len(payload["countries_latest"]) == 12 and all(row["estimated"] for row in payload["countries_latest"])
duplicate_country_rows = rows + [
    "GOLD,World Mine Production and Reserves:,Gold,Country  0,Production,Mine production,metric tons,2025,999,Estimated.\n"
]
try:
    mod.build(header + "".join(duplicate_country_rows), release_title="x", urls=urls)
except RuntimeError as error:
    assert "duplicate country/year" in str(error), f"Expected country/year duplicate error, got: {error}"
else:
    raise AssertionError("normalized duplicate country/year rows could fake country breadth")
marker_rows = rows.copy()
marker_rows[-1] = marker_rows[-1].replace(",Estimated.\n", ",\n").replace(",111,", ",e111,")
_, marker_payload, _ = mod.build(header + "".join(marker_rows), release_title="x", urls=urls)
assert next(row for row in marker_payload["countries_latest"] if row["country"] == "Country 11")["estimated"] is True
item, title = mod.discover({"items": [{"id": "abc", "title": "Mineral Commodity Summaries 2026 Data Release - Commodity Salient U.S. and World Statistics"}]}, 2026)
assert item == "abc" and "2026" in title
try:
    mod.discover({"items": []}, 2026)
except mod.ReleaseNotFound:
    pass
else:
    raise AssertionError("missing annual release did not expose the narrow fallback signal")
try:
    mod.discover({"items": [{"id": "a", "title": title}, {"id": "b", "title": title}]}, 2026)
except RuntimeError as error:
    assert not isinstance(error, mod.ReleaseNotFound)
else:
    raise AssertionError("ambiguous annual releases did not fail closed")
try:
    mod.build(header + rows[0], release_title="x", urls=urls)
except RuntimeError:
    pass
else:
    raise AssertionError("short world history did not fail closed")
print("PASS: usgs-gold-mine-supply")
