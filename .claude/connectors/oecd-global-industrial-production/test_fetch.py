#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(HERE))), "scripts")
sys.path.insert(0, SCRIPTS)
from commodity_tabular_feed import build, load_config, source_url  # noqa: E402
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402

manifest = json.load(open(os.path.join(HERE, "connector.json"), encoding="utf-8"))
config = load_config(os.path.join(HERE, "fetch.py"))
header = "DATAFLOW,REF_AREA,FREQ,MEASURE,UNIT_MEASURE,ACTIVITY,ADJUSTMENT,TRANSFORMATION,TIME_PERIOD,OBS_VALUE,OBS_STATUS,UNIT_MULT,DECIMALS,BASE_PER"
rows = [header]
for year in range(2014, 2026):
    for month in range(1, 13):
        rows.append(
            f"OECD.SDD.STES:DSD_KEI@DF_KEI(4.0),OECD,M,PRVM,IX,BTE,Y,_Z,{year}-{month:02d},{90 + (year - 2014) + month / 10:.1f},A,0,1,2015"
        )
fixture_url = source_url(config, today=__import__("datetime").date(2026, 8, 30))
as_of, payload, sidecar = build("\n".join(rows).encode(), manifest, config, url=fixture_url)
defects = validate_manifest(manifest["id"], HERE, manifest) + validate_staged_output(
    manifest, "COPPER", payload, sidecar, as_of,
)
assert not defects, defects
assert len(payload["observations"]) == 144
assert payload["observations"][1]["date"] == "2014-02-28"
assert payload["observations"][-1]["date"] == "2025-12-31"
assert payload["reference_area"] == "OECD Total"

for bad in (
    b"TIME_PERIOD,OBS_VALUE,OBS_STATUS,BASE_PER\n2026-01,100,A,2015",
    (header + "\n2026-13,100,A,2015\n").encode(),
    (header + "\n2026-01,-1,A,2015\n").encode(),
):
    try:
        build(bad, manifest, config, url=fixture_url)
    except RuntimeError:
        pass
    else:
        raise AssertionError("malformed OECD feed did not fail closed")
print("PASS: OECD global industrial-production connector")
