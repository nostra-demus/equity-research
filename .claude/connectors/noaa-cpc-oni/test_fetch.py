#!/usr/bin/env python3
"""Unit test for the NOAA CPC ONI connector — parse/transform + manifest consistency, NO network.

A live NOAA-format change is the realistic failure (a shifted column, a new season code), so the parse is
pinned against fixture ascii. The live endpoint is proven separately by `fetch.py --verify` (kept out of CI
to avoid network flakiness — a dead endpoint is a merge-time manual check, not a flaky gate).
Run: python3 test_fetch.py
"""
from __future__ import annotations

import importlib.util
import json
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("noaa_fetch", os.path.join(_HERE, "fetch.py"))
mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(mod)

ELNINO = """ SEAS  YR   TOTAL   ANOM
  FMA 2026  27.72   0.31
  MAM 2026  28.08   0.51
  AMJ 2026  28.71   0.98
"""
ESTABLISHED_ELNINO = """ SEAS  YR   TOTAL   ANOM
  DJF 2026  27.10   0.50
  JFM 2026  27.30   0.60
  FMA 2026  27.72   0.70
  MAM 2026  28.08   0.80
  AMJ 2026  28.71   0.90
"""
LANINA = """ SEAS  YR   TOTAL   ANOM
  SON 2025  26.16  -0.51
  OND 2025  26.05  -0.72
"""
NEUTRAL = """ SEAS  YR   TOTAL   ANOM
  JFM 2026  26.58  -0.14
"""
MIXED = """ SEAS  YR   TOTAL   ANOM
a garbage line that is not data
  AMJ 2026  28.71   0.98
  XYZ 2099  1.0  2.0
"""

_fails = 0


def check(name: str, cond: bool) -> None:
    global _fails
    print(f"  {'ok ' if cond else 'FAIL'} {name}")
    if not cond:
        _fails += 1


asof, latest, state, payload, sidecar = mod.build(ELNINO)
_CONTRACT_TEXT = " SEAS YR TOTAL ANOM\n" + "\n".join(
    f" {season} {year} 27.00 0.10"
    for year in range(1990, 2020) for season in mod.SEASON_END_MONTH
)
_contract_asof, _, _, _contract_payload, _contract_sidecar = mod.build(_CONTRACT_TEXT)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(_HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402
_manifest = json.load(open(os.path.join(_HERE, "connector.json")))
_contract_defects = validate_manifest(_manifest["id"], _HERE, _manifest) + validate_staged_output(
    _manifest, "WHEAT", _contract_payload, _contract_sidecar, _contract_asof,
)
check("shared v2 manifest/staged-output contract accepts the production transform", not _contract_defects)
check("latest row is the last valid ONI row",
      latest["season"] == "AMJ" and latest["year"] == 2026 and latest["anom"] == 0.98)
check("as_of derived from the season end-month (AMJ → June), not the fetch clock", asof == "2026-06-01")
check("full dated history is retained for regime validation",
      payload["observations"] == payload["recent"] and payload["observations"][-1]["date"] == asof)
check("two warm-threshold seasons remain pending, not an established El Nino episode",
      state == "pending_el_nino"
      and payload["latest"]["anomaly_state"] == "warm_threshold"
      and payload["latest"]["episode_state"] == "pending_el_nino")
check("payload series is manifest-owned (cannot drift from staged validation)", payload["series"] == mod.MANIFEST["series"])
check("sidecar as_of matches the payload (read from the data)", sidecar["as_of"] == asof)
check("sidecar carries tier 5 + source_type official_data + a connector_id",
      sidecar["tier"] == 5 and sidecar["source_type"] == "official_data" and sidecar["connector_id"] == "noaa-cpc-oni")

_, l2, s2, _, _ = mod.build(LANINA)
check("two cool-threshold seasons remain pending, not an established La Nina episode",
      s2 == "pending_la_nina" and l2["anom"] == -0.72)
_, _, established, established_payload, _ = mod.build(ESTABLISHED_ELNINO)
check("five consecutive warm-threshold seasons establish El Nino",
      established == "el_nino" and established_payload["latest"]["episode_state"] == "el_nino")
_, _, s3, _, _ = mod.build(NEUTRAL)
check("neutral between -0.5 and +0.5", s3 == "neutral")

rows, latest_m = mod.parse(MIXED)
check("junk + unknown-season rows skipped; the valid row is kept",
      len(rows) == 1 and rows[0]["season"] == "AMJ")

raised = False
try:
    mod.build(" SEAS  YR   TOTAL   ANOM\n")  # header only → no rows
except Exception:
    raised = True
check("fail-closed: a feed with no parseable rows raises (never a bogus fresh row)", raised)

for broken, label in [
    (ELNINO + "  MJJ 2026 N/A N/A\n", "recognized newest row with unavailable numerics"),
    (" SEAS YR TOTAL ANOM\n  DJF 2026 27.0 0.1\n  MAM 2026 27.1 0.2\n",
     "missing intermediate season"),
    (" SEAS YR TOTAL ANOM\n  MAM 2026 27.0 0.1\n  MAM 2026 27.1 0.2\n",
     "duplicate season"),
]:
    raised = False
    try:
        mod.parse(broken)
    except RuntimeError:
        raised = True
    check(f"fail-closed on {label}", raised)

# manifest consistency — the sidecar's tier/source_type must match the connector.json declaration, and the
# declared tier must be the §4 ceiling official_data earns (5), so nothing over-claims at write time.
man = json.load(open(os.path.join(_HERE, "connector.json"), encoding="utf-8"))
check("connector.json is valid + tier/source_type agree with the sidecar the fetcher writes",
      man["tier"] == sidecar["tier"] == 5 and man["source_type"] == sidecar["source_type"] == "official_data")
check("connector.json declares an exact-host allowlist that contains the fetch host",
      isinstance(man.get("host_allowlist"), list) and mod.HOST in man["host_allowlist"])
check("connector.json entry/verify point at this fetcher",
      man.get("entry") == "fetch.py" and man.get("verify", "").startswith("fetch.py"))
check("observed ONI connector does not claim to satisfy a probabilistic ENSO outlook",
      "enso-probabilities" not in man["satisfies"])

print(f"\n{'PASS' if not _fails else 'FAIL'}: noaa-cpc-oni connector — {_fails} failing case(s)")
raise SystemExit(1 if _fails else 0)
