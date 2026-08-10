#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("treasury_gold_fetch", os.path.join(HERE, "fetch.py"))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402


def document(year: int, count: int) -> str:
    entries = []
    for index in range(count):
        month, day = 1 + index // 28, 1 + index % 28
        entries.append(f"""<entry xmlns='http://www.w3.org/2005/Atom'><content><m:properties xmlns:m='http://schemas.microsoft.com/ado/2007/08/dataservices/metadata' xmlns:d='http://schemas.microsoft.com/ado/2007/08/dataservices'><d:NEW_DATE>{year}-{month:02d}-{day:02d}T00:00:00</d:NEW_DATE><d:TC_5YEAR>1.1</d:TC_5YEAR><d:TC_7YEAR>1.2</d:TC_7YEAR><d:TC_10YEAR>1.3</d:TC_10YEAR><d:TC_20YEAR>1.4</d:TC_20YEAR><d:TC_30YEAR>1.5</d:TC_30YEAR></m:properties></content></entry>""")
    return "<feed xmlns='http://www.w3.org/2005/Atom'>" + "".join(entries) + "</feed>"


docs = [(mod.url_for(year), document(year, 250)) for year in (2023, 2024, 2025, 2026)]
as_of, payload, sidecar = mod.build(docs)
manifest = json.load(open(os.path.join(HERE, "connector.json"), encoding="utf-8"))
defects = validate_manifest(manifest["id"], HERE, manifest) + validate_staged_output(manifest, "GOLD", payload, sidecar, as_of)
assert not defects, defects
assert len(payload["observations"]) == 1000 and payload["observations"][-1]["ten_year"] == 1.3
empty_current = docs[:-1] + [(mod.url_for(2026), document(2026, 0))]
empty_as_of, empty_payload, _empty_sidecar = mod.build(empty_current)
assert empty_as_of.startswith("2025-") and len(empty_payload["observations"]) == 750
try:
    mod.build(docs[:2])
except RuntimeError:
    pass
else:
    raise AssertionError("short Treasury history did not fail closed")
try:
    mod.parse_xml(document(2026, 1).replace("<d:TC_10YEAR>1.3</d:TC_10YEAR>", ""))
except RuntimeError:
    pass
else:
    raise AssertionError("missing 10-year field did not fail closed")
try:
    mod.build([(mod.url_for(2026), document(2026, 0))])
except RuntimeError:
    pass
else:
    raise AssertionError("an empty combined Treasury history did not fail closed")
print("PASS: treasury-real-yields-gold")
