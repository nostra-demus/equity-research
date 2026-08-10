#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("iau_gold_fetch", os.path.join(HERE, "fetch.py"))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402

page = "<html><body>Ounces in Trust 14,721,625.73 as of Aug 07, 2026 Tonnes in Trust 457.89 as of Aug 07, 2026 Shares Outstanding 782,900,000 as of Aug 07, 2026</body></html>"
start = dt.date(2026, 8, 7) - dt.timedelta(days=599)
rows = []
for i in range(600):
    day = start + dt.timedelta(days=i)
    shares = 782900000 if i == 599 else 700000000 + i
    rows.append(f"<ss:Row><ss:Cell><ss:Data ss:Type='String'>{day.strftime('%b %d, %Y')}</ss:Data></ss:Cell><ss:Cell><ss:Data ss:Type='Number'>{70 + i / 100}</ss:Data></ss:Cell><ss:Cell><ss:Data ss:Type='String'>--</ss:Data></ss:Cell><ss:Cell><ss:Data ss:Type='Number'>{shares}</ss:Data></ss:Cell></ss:Row>")
footer = "<ss:Row/><ss:Row><ss:Cell><ss:Data ss:Type='String'>Issuer legal disclaimer © 2026</ss:Data></ss:Cell></ss:Row>"
xml = "<?xml version='1.0'?><ss:Workbook xmlns:ss='urn:schemas-microsoft-com:office:spreadsheet'><ss:Worksheet ss:Name='Historical'><ss:Table><ss:Row><ss:Cell ss:HRef=\"https://issuer.example/history?a=1&b=2\"><ss:Data ss:Type='String'>As Of</ss:Data></ss:Cell></ss:Row>" + "".join(rows) + footer + "</ss:Table></ss:Worksheet></ss:Workbook>"
as_of, payload, sidecar = mod.build(page, xml)
manifest = json.load(open(os.path.join(HERE, "connector.json"), encoding="utf-8"))
defects = validate_manifest(manifest["id"], HERE, manifest) + validate_staged_output(manifest, "GOLD", payload, sidecar, as_of)
assert not defects, defects
assert as_of == "2026-08-07" and payload["current"]["tonnes_in_trust"] == 457.89
assert len(payload["share_history"]) == 600
decimal_xml = xml.replace(">782900000<", ">782900000.0<")
assert mod.build(page, decimal_xml)[1]["share_history"][-1]["shares_outstanding"] == 782900000
try:
    mod.parse_history(xml.replace(">782900000<", ">782900000.5<"))
except RuntimeError:
    pass
else:
    raise AssertionError("fractional IAU shares did not fail closed")
try:
    mod.parse_history(xml.replace(">782900000<", ">78,29,000<"))
except RuntimeError:
    pass
else:
    raise AssertionError("malformed comma grouping in IAU shares did not fail closed")
single_day_page = page.replace("Aug 07, 2026", "Aug 7, 2026")
assert mod.parse_page(single_day_page)[0] == "2026-08-07"
try:
    mod.parse_page(page.replace("Aug 07, 2026", "Feb 30, 2026"))
except RuntimeError as error:
    assert "invalid date" in str(error), f"Expected invalid calendar-date error, got: {error}"
else:
    raise AssertionError("an impossible issuer-page date did not fail closed")
try:
    mod.parse_history(xml.replace("Aug 07, 2026", "Foo 07, 2026"))
except RuntimeError as error:
    assert "invalid date" in str(error), f"Expected invalid English-month error, got: {error}"
else:
    raise AssertionError("an unknown Historical month did not fail closed")
try:
    mod.build(page.replace("782,900,000", "782,800,000"), xml)
except RuntimeError:
    pass
else:
    raise AssertionError("issuer page/download disagreement did not fail closed")
bad_dated_row = "<ss:Row><ss:Cell><ss:Data ss:Type='String'>Aug 8, 2026</ss:Data></ss:Cell></ss:Row>"
try:
    mod.parse_history(xml.replace(footer, bad_dated_row + footer))
except RuntimeError:
    pass
else:
    raise AssertionError("a truncated dated IAU row did not fail closed")
print("PASS: ishares-iau-gold-holdings")
