#!/usr/bin/env python3
"""Unit test for the IAI primary-aluminium-production connector — parse/transform + fail-closed + manifest
consistency, NO network (a shape-faithful synthetic ALVIS matrix incl. decoy labels and the undeclared
total column; plus the generic labeled-dataset variants). Tests use synthetic structures only because the
provider permits derived redistribution, not repository publication of captured raw API responses.
Run: python3 test_fetch.py
"""
from __future__ import annotations

import importlib.util
import json
import os
import sys

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
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(_HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402
_manifest = json.load(open(os.path.join(_HERE, "connector.json")))
_contract_defects = validate_manifest(_manifest["id"], _HERE, _manifest) + validate_staged_output(
    _manifest, "ALUMINIUM", payload, sidecar, asof,
)
check("shared v2 manifest/staged-output contract accepts the production transform", not _contract_defects)
check("trailing 13 of 14 months kept, ascending",
      len(payload["months"]) == 13 and payload["months"][0]["month"] == "2025-05"
      and payload["months"][-1]["month"] == "2026-05")
check("as_of = last calendar day of the latest data month", asof == "2026-05-31" and sidecar["as_of"] == asof)
check("world = sum of labeled regions (undeclared total col ignored)",
      latest["world_kt"] == float(sum(REGIONS.values()) + 3100))
check("source payload contains only raw IAI observations, with no analyst cap or calculated latest fields",
      set(latest) == {"month", "china_kt", "world_kt"} and "cap_reference" not in payload)
check("unit + sidecar tier 5 + official_data + connector_id",
      payload["unit"] == "thousand tonnes" and sidecar["tier"] == 5
      and sidecar["source_type"] == "official_data" and sidecar["connector_id"] == "iai-primary-aluminium-production")

# 30-day month as the latest (drop May) — as-of remains the source period's calendar end
asof30, latest30, _, _ = mod.build(_matrix(china={k: v for k, v in CHINA.items() if k != "2026-05"}))
check("30-day month resolves to calendar month-end without manufacturing daily/run-rate fields",
      asof30 == "2026-04-30" and set(latest30) == {"month", "china_kt", "world_kt"})

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
      man["tier"] == sidecar["tier"] == 5 and man["source_type"] == sidecar["source_type"] == "official_data")
check("connector.json preserves both official source hosts for manual provenance validation",
      mod.STATS_HOST in man["host_allowlist"] and mod.API_HOST in man["host_allowlist"])
check("IAI terms are enforced as entitlement-required manual ingest, never an automatic API pull",
      man.get("manual") is True and man.get("acquisition") == "manual"
      and man.get("manual_ingest", {}).get("file_arg") == "--from-file"
      and man["licensing"]["use"] == "entitlement_required")
check("connector.json entry/verify point at fetch.py",
      man["entry"] == "fetch.py" and man["verify"].startswith("fetch.py"))
check("output path follows the manifest template",
      mod._output_path("data", "ALUMINIUM", "2026-05-31").replace(os.sep, "/")
      == "data/ALUMINIUM/external/iai/primary_production_2026-05-31.json")

# A response-wide auxiliary chart cannot donate a Total series to a different
# China chart. Chart scopes remain causal units and economic coherence is hard.
scoped = {"charts": [
    {"label": "China (Estimated)", "data": {"2026-04": 100, "2026-05": 101}},
], "auxiliary": {"charts": [
    {"label": "Total", "data": {"2026-04": 7, "2026-05": 7}},
]}}
for raw, label in [
    (scoped, "unrelated auxiliary Total is not merged across chart scopes"),
    ({"charts": [
        {"label": "World Total", "data": {"2026-04": 90, "2026-05": 90}},
        {"label": "China", "data": {"2026-04": 100, "2026-05": 101}},
    ]}, "world production below China is incoherent"),
]:
    raised = False
    try:
        mod.build(raw)
    except RuntimeError:
        raised = True
    check(f"fail-closed when {label}", raised)

verify = __import__("subprocess").run(
    [sys.executable, os.path.join(_HERE, "fetch.py"), "--verify"],
    capture_output=True, text=True,
)
check("--verify performs no live IAI retrieval and states the manual-only boundary",
      verify.returncode == 0 and "manual-only" in verify.stdout and "disabled" in verify.stdout)

print(f"\n{'PASS' if not _fails else 'FAIL'}: iai-primary-aluminium-production connector — {_fails} failing case(s)")
raise SystemExit(1 if _fails else 0)
