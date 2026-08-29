#!/usr/bin/env python3
from __future__ import annotations

import datetime as dt
import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(HERE))), "scripts")
sys.path.insert(0, SCRIPTS)
from commodity_tabular_feed import build, load_config  # noqa: E402
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402

manifest = json.load(open(os.path.join(HERE, "connector.json"), encoding="utf-8"))
config = load_config(os.path.join(HERE, "fetch.py"))
start = dt.date(2022, 1, 1)
lines = ["observation_date,DFII10"] + [
    f"{start + dt.timedelta(days=index)},{1 + index / 10000}" for index in range(1200)
]
as_of, payload, sidecar = build("\n".join(lines).encode(), manifest, config)
defects = validate_manifest(manifest["id"], HERE, manifest) + validate_staged_output(
    manifest, "COPPER", payload, sidecar, as_of,
)
assert not defects, defects
assert len(payload["observations"]) == 1200
assert payload["observations"][-1]["percent"] == 1.1199

for bad in (
    b"date,value\n2026-01-01,1",
    ("observation_date,DFII10\n" + "\n".join(
        f"{start + dt.timedelta(days=index)},NaN" for index in range(800)
    )).encode(),
    ("observation_date,DFII10\n" + "\n".join(
        f"{start + dt.timedelta(days=index)},99" for index in range(800)
    )).encode(),
):
    try:
        build(bad, manifest, config)
    except RuntimeError:
        pass
    else:
        raise AssertionError("malformed declarative feed did not fail closed")
print("PASS: fred-us-10y-real-yield declarative feed")
