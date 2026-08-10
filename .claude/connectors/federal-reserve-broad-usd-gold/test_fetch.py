#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("fred_gold_fetch", os.path.join(HERE, "fetch.py"))
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402

start = dt.date(2024, 1, 1)
lines = ["observation_date,DTWEXBGS"] + [f"{start + dt.timedelta(days=i)},{100 + i / 1000}" for i in range(800)]
as_of, payload, sidecar = mod.build("\n".join(lines))
manifest = json.load(open(os.path.join(HERE, "connector.json"), encoding="utf-8"))
defects = validate_manifest(manifest["id"], HERE, manifest) + validate_staged_output(manifest, "GOLD", payload, sidecar, as_of)
assert not defects, defects
assert len(payload["observations"]) == 800 and payload["observations"][-1]["index"] == 100.799
test_today = dt.date(2026, 8, 10)
assert mod.source_url(test_today).endswith(f"cosd={(test_today - dt.timedelta(days=5 * 366)).isoformat()}")
for bad in ("date,value\n2026-01-01,1", "observation_date,DTWEXBGS\n2026-01-01,NaN"):
    try:
        mod.build(bad)
    except RuntimeError:
        pass
    else:
        raise AssertionError("malformed FRED input did not fail closed")
try:
    mod.build("observation_date,DTWEXBGS\nnot-a-date,")
except RuntimeError:
    pass
else:
    raise AssertionError("a malformed missing-value row did not fail closed")
print("PASS: federal-reserve-broad-usd-gold")
