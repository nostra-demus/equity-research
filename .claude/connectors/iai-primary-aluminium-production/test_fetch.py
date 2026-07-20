#!/usr/bin/env python3
"""Unit test for the IAI primary-aluminium-production connector — parse/transform + fail-closed + manifest
consistency, NO network (a shape-faithful synthetic ALVIS matrix incl. decoy labels and the undeclared
total column; plus the generic labeled-dataset variants). If a live-captured `test_fixture_alvis.json`
exists beside this test it is ALSO built and sanity-checked (adds coverage, never replaces the synthetic).
Run: python3 test_fetch.py
"""
from __future__ import annotations

import importlib.util
import json
import os

_HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("iai_fetch", os.path.join(_HERE, "fetch.py"))
mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(mod)

_fails = 0


def check(name: str, cond: bool) -> None:
    global _fails
    print(f"  {'ok ' if cond else 'FAIL'} {name}")
    if not cond:
        _fails += 1


CHINA = {
    "2025-04": 2800, "2025-05": 2900, "2025-06": 2905, "2025-07": 2910, "2025-08": 2915,
    "2025-09": 2920, "2025-10": 2925, "2025-11": 2930, "2025-12": 2935, "2026-01": 2940,
    "2026-02": 2700, "2026-03": 2950, "2026-04": 3000, "2026-05": 3100,
}
REGIONS = {  # constant per month; Europe is in its post-2025 combined-only representation
    "Africa": 150, "North America": 330, "Western & Central Europe": 0, "Russia & Eastern Europe": 0,
    "Europe (inc Russia)": 560, "Chinese Taipei": 50, "Taiwan, China": 20,
    "Estimated Unreported to IAI": 80,
}
_MON = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July",
        8: "August", 9: "September", 10: "October", 11: "November", 12: "December"}


def _matrix(china=CHINA, regions=REGIONS, europe_split_value=0):
    cols = [{"id": i + 1, "name": name} for i, name in enumerate(regions)]
    cols.append({"id": 9, "name": "China (Estimated)"})
    name_to_id = {c["name"]: c["id"] for c in cols}
    data = []
    for month, ckt in sorted(china.items()):
        y, mo = int(month[:4]), int(month[5:7])
        row = {str(name_to_id[n]): {"value": float(v)} for n, v in regions.items()}
        if europe_split_value:
            row[str(name_to_id["Western & Central Europe"])] = {"value": float(europe_split_value)}
        row["9"] = {"value": float(ckt)}
        row["11"] = {"value": float(sum(regions.values()) + ckt)}  # undeclared total col, like the live feed
        data.append({"period": {"name": f"{y}  {_MON[mo]}", "from": f"{y}-{mo:02d}-01T00:00:00",
                                "to": f"{y}-{mo:02d}-28T00:00:00"},
                     "data": {"85": row}})
    return {"data": {"publication": {"charts": {"columns": cols, "rows": [{"id": 85, "name": "Data"}],
                                                "data": data}}}}


WORLD_MONTH = sum(REGIONS.values()) + 0  # + china added per month below

asof, latest, payload, sidecar = mod.build(_matrix())
check("trailing 13 of 14 months kept, ascending",
      len(payload["months"]) == 13 and payload["months"][0]["month"] == "2025-05"
      and payload["months"][-1]["month"] == "2026-05")
check("as_of = last calendar day of the latest data month", asof == "2026-05-31" and sidecar["as_of"] == asof)
check("31-day month annualisation exact",
      latest["china_daily_avg_kt"] == 100.0 and latest["china_annualised_run_rate_mt"] == 36.5)
check("world = sum of labeled regions (undeclared total col ignored)",
      latest["world_kt"] == float(sum(REGIONS.values()) + 3100))
check("china share arithmetic",
      latest["china_share_pct"] == round(3100 / (sum(REGIONS.values()) + 3100) * 100, 2))
check("YoY vs the in-window prior-year month",
      latest["china_yoy_pct"] == round((3100 / 2900 - 1) * 100, 2))
check("run-rate vs the 45 Mt analyst-reference cap",
      payload["cap_reference"]["run_rate_vs_cap_pct"] == round(36.5 / 45.0 * 100, 2)
      and "analyst reference" in payload["cap_reference"]["note"])
check("unit + sidecar tier 5 + paid_api + connector_id",
      payload["unit"] == "thousand tonnes" and sidecar["tier"] == 5
      and sidecar["source_type"] == "paid_api" and sidecar["connector_id"] == "iai-primary-aluminium-production")

# 30-day month as the latest (drop May) — daily/annualised math again exact
asof30, latest30, _, _ = mod.build(_matrix(china={k: v for k, v in CHINA.items() if k != "2026-05"}))
check("30-day month annualisation exact",
      asof30 == "2026-04-30" and latest30["china_daily_avg_kt"] == 100.0
      and latest30["china_annualised_run_rate_mt"] == 36.5)

# YoY is None when the prior-year month is outside the kept window
short = {k: CHINA[k] for k in ("2026-03", "2026-04", "2026-05")}
_, latest_short, _, _ = mod.build(_matrix(china=short))
check("YoY None when the prior-year month is absent", latest_short["china_yoy_pct"] is None)

# Generic month-keyed variant: a LABELED world total wins over summing
gen = {"charts": [
    {"label": "World Total", "data": {"2026-04": 6000, "2026-05": 6100}},
    {"label": "China (Estimated)", "data": {"2026-04": 3000, "2026-05": 3100}},
]}
_, latest_gen, payload_gen, _ = mod.build(gen)
check("labeled World Total wins (month-keyed generic shape)",
      latest_gen["world_kt"] == 6100.0 and len(payload_gen["months"]) == 2)

# Parallel-array variant + bare "china" label
par = {"series": [
    {"name": "World Total", "values": [800, 810], "months": ["2026-04", "2026-05"]},
    {"name": "china", "values": [400, 410], "months": ["2026-04", "2026-05"]},
]}
_, latest_par, _, _ = mod.build(par)
check("parallel-array shape + bare 'china' label", latest_par["world_kt"] == 810.0 and latest_par["china_kt"] == 410.0)

# Decoys can never be China; ambiguity and structural breaks fail closed
for raw, label in [
    (_matrix(china={}, regions={"Chinese Taipei": 50, "Taiwan, China": 20}), "decoy-only feed (no true China)"),
    ({"charts": [{"label": "World", "data": {"2026-05": 1}}, {"label": "Total", "data": {"2026-05": 1}},
                 {"label": "China", "data": {"2026-05": 1}}]}, "ambiguous world labels"),
    (_matrix(europe_split_value=240), "Europe double-count (combined + split both nonzero)"),
    ({"data": {"publication": {"charts": {"columns": [{"id": 1, "name": "Africa"}], "data": []}}}}, "empty months"),
    ({"charts": [{"label": "China", "data": {"2026-05": "n/a"}}]}, "non-numeric-only values"),
]:
    raised = False
    try:
        mod.build(raw)
    except Exception:
        raised = True
    check(f"fail-closed on {label}", raised)

man = json.load(open(os.path.join(_HERE, "connector.json"), encoding="utf-8"))
check("connector.json tier/source_type agree with the sidecar the fetcher writes",
      man["tier"] == sidecar["tier"] == 5 and man["source_type"] == sidecar["source_type"] == "paid_api")
check("connector.json allowlists BOTH hosts the fetcher reaches",
      mod.STATS_HOST in man["host_allowlist"] and mod.API_HOST in man["host_allowlist"])
check("connector.json entry/verify point at fetch.py",
      man["entry"] == "fetch.py" and man["verify"].startswith("fetch.py"))
check("output path follows the manifest template",
      mod._output_path("data", "ALUMINIUM", "2026-05-31").replace(os.sep, "/")
      == "data/ALUMINIUM/external/iai/primary_production_2026-05-31.json")

# Live-captured fixture (if present) — real-shape invariants on top of the synthetic coverage
_fix = os.path.join(_HERE, "test_fixture_alvis.json")
if os.path.exists(_fix):
    la, ll, lp, _ = mod.build(json.load(open(_fix, encoding="utf-8")))
    check("live fixture: 13 months kept, world ≥ china > 0",
          len(lp["months"]) == 13 and ll["world_kt"] >= ll["china_kt"] > 0)
    check("live fixture: cap math internally consistent",
          lp["cap_reference"]["run_rate_vs_cap_pct"]
          == round(ll["china_annualised_run_rate_mt"] / 45.0 * 100, 2))
else:
    print("  (live fixture test_fixture_alvis.json not present — synthetic coverage only)")

print(f"\n{'PASS' if not _fails else 'FAIL'}: iai-primary-aluminium-production connector — {_fails} failing case(s)")
raise SystemExit(1 if _fails else 0)
