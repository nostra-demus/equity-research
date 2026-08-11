#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import os
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("usda_wasde_fetch", os.path.join(HERE, "fetch.py"))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402

CORE_ATTRIBUTES = ("Beginning Stocks", "Production", "Imports", "Exports", "Ending Stocks")
WORLD_ATTRIBUTES = (*CORE_ATTRIBUTES[:3], "Domestic Total", *CORE_ATTRIBUTES[3:])
US_ATTRIBUTES = (
    "Area Planted", "Area Harvested", "Yield per Harvested Acre", *CORE_ATTRIBUTES,
    "Use, Total",
    "Avg. Farm Price ($/bu)  2/",
)
SOURCE_URL = "https://www.usda.gov/oce/commodity/wasde/wasde0726.xml"


def fixture(subject: str, *, include_world: bool = True, missing_world_attribute: str = "") -> bytes:
    root = ET.Element("Report", {"Name": "wasde"})
    us_title, us_matrix = mod.SUBJECT_TABLES[subject]["us"]
    section = ET.SubElement(root, "us")
    report = ET.SubElement(section, "Report", {"Report_Month": "July 2026", "sub_report_title": us_title})
    matrix = ET.SubElement(report, us_matrix)
    collection = ET.SubElement(matrix, "attribute_group_Collection")
    suffix = us_matrix[-1]
    for attribute_index, attribute in enumerate(US_ATTRIBUTES):
        # Source-shaped US WASDE rows: numbered unit slots are separate from
        # the numbered attribute/value branch inside each row group.
        group = ET.SubElement(collection, "attribute_group")
        unit_branch = ET.SubElement(group, "unit_filler")
        for unit_index, unit in enumerate(("Million Acres", "Bushels", "Million Bushels"), 1):
            ET.SubElement(unit_branch, "Cell", {f"m1_unit_descr{unit_index}": unit})
        attribute_branch = ET.SubElement(group, f"attribute{suffix}", {f"attribute{suffix}": attribute})
        for year_index, year in enumerate(("2024/25", "2025/26 Est.", "2026/27 Proj.")):
            year_group = ET.SubElement(attribute_branch, "year_group", {f"market_year{suffix}": year})
            month = "Jul" if "Proj" in year else ""
            month_group = ET.SubElement(year_group, "month_group", {f"forecast_month{suffix}": month})
            raw_value = str(100 + attribute_index * 10 + year_index)
            if attribute in {"Beginning Stocks", "Production"}:
                raw_value = f"{1_971 + attribute_index * 1_000 + year_index:,}"
            ET.SubElement(month_group, "Cell", {f"cell_value{suffix}": raw_value})
    if include_world:
        world_title, _ = mod.SUBJECT_TABLES[subject]["world"]
        section = ET.SubElement(root, "world")
        report = ET.SubElement(section, "Report", {
            "Report_Month": "July 2026", "sub_report_title": world_title,
            "sub_report_subtitle": "(Million Metric Tons)",
        })
        matrix = ET.SubElement(report, "matrix1", {"region_header1": "2026/27 Proj."})
        for scope_index, scope in enumerate(("World  1/", "Major Exporters  2/")):
            region = ET.SubElement(matrix, "region_group", {"region1": scope})
            world_attributes = list(WORLD_ATTRIBUTES)
            if missing_world_attribute and scope.startswith("World"):
                world_attributes[world_attributes.index(missing_world_attribute)] = "Feed"
            for attribute_index, attribute in enumerate(world_attributes):
                group = ET.SubElement(region, "attribute_group", {"attribute1": attribute})
                ET.SubElement(group, "Cell", {"cell_value1": str(300 + scope_index * 50 + attribute_index)})
    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


manifest = json.load(open(os.path.join(HERE, "connector.json"), encoding="utf-8"))
assert not validate_manifest(manifest["id"], HERE, manifest)
for subject in sorted(mod.SUBJECT_TABLES):
    as_of, payload, sidecar = mod.build(fixture(subject), subject, SOURCE_URL, "2026-07-10")
    defects = validate_staged_output(manifest, subject, payload, sidecar, as_of)
    assert not defects, (subject, defects)
    assert payload["commodity"] == subject and payload["report_month"] == "July 2026"
    assert len(payload["rows"]) == 42
    assert {row["scope"] for row in payload["rows"]} >= {"United States", "World", "Major Exporters"}
    assert {row["estimate_status"] for row in payload["rows"]} == {"actual", "estimate", "projection"}
    assert all(isinstance(row["value"], float) for row in payload["rows"])
    assert all(isinstance(row["forecast_month"], str) for row in payload["rows"])
    us_rows = {row["attribute"]: row for row in payload["rows"] if row["scope"] == "United States"}
    assert us_rows["Area Planted"]["unit"] == "Million Acres"
    assert us_rows["Yield per Harvested Acre"]["unit"] == "Bushels per acre"
    assert us_rows["Beginning Stocks"]["unit"] == "Million Bushels"
    assert us_rows["Beginning Stocks"]["value"] >= 4_000
    assert us_rows["Avg. Farm Price ($/bu)"]["unit"] == "USD per bushel"
    assert {row["unit"] for row in payload["rows"] if row["scope"] != "United States"} == {
        "Million Metric Tons"
    }

for raw, subject in (
    (fixture("WHEAT", include_world=False), "WHEAT"),
    (fixture("CORN", missing_world_attribute="Ending Stocks"), "CORN"),
    (fixture("SOYBEANS", missing_world_attribute="Domestic Total"), "SOYBEANS"),
    (b"<broken", "CORN"),
):
    try:
        mod.build(raw, subject, SOURCE_URL, "2026-07-10")
    except RuntimeError:
        pass
    else:
        raise AssertionError("incomplete/malformed WASDE XML did not fail closed")

assert mod._month_candidates(datetime(2026, 1, 5, tzinfo=timezone.utc)) == [(2026, 0), (2025, 11), (2025, 10)]
assert mod._source_url(2026, 6).endswith("wasde0726.xml")
print("PASS: usda-wasde-grains-balance")
