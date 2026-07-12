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

_HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("noaa_fetch", os.path.join(_HERE, "fetch.py"))
mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(mod)

ELNINO = """ SEAS  YR   TOTAL   ANOM
  DJF 1950  24.72  -1.53
  MAM 2026  28.08   0.51
  AMJ 2026  28.71   0.98
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
check("latest row is the last valid ONI row",
      latest["season"] == "AMJ" and latest["year"] == 2026 and latest["anom"] == 0.98)
check("as_of derived from the season end-month (AMJ → June), not the fetch clock", asof == "2026-06-01")
check("enso_state el_nino at +0.98", state == "el_nino" and payload["latest"]["enso_state"] == "el_nino")
check("sidecar as_of matches the payload (read from the data)", sidecar["as_of"] == asof)
check("sidecar carries tier 5 + source_type paid_api + a connector_id",
      sidecar["tier"] == 5 and sidecar["source_type"] == "paid_api" and sidecar["connector_id"] == "noaa-cpc-oni")

_, l2, s2, _, _ = mod.build(LANINA)
check("la_nina at -0.72", s2 == "la_nina" and l2["anom"] == -0.72)
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

# manifest consistency — the sidecar's tier/source_type must match the connector.json declaration, and the
# declared tier must be the §4 ceiling paid_api earns (5), so nothing over-claims at write time.
man = json.load(open(os.path.join(_HERE, "connector.json"), encoding="utf-8"))
check("connector.json is valid + tier/source_type agree with the sidecar the fetcher writes",
      man["tier"] == sidecar["tier"] == 5 and man["source_type"] == sidecar["source_type"] == "paid_api")
check("connector.json declares an exact-host allowlist that contains the fetch host",
      isinstance(man.get("host_allowlist"), list) and mod.HOST in man["host_allowlist"])
check("connector.json entry/verify point at this fetcher",
      man.get("entry") == "fetch.py" and man.get("verify", "").startswith("fetch.py"))

print(f"\n{'PASS' if not _fails else 'FAIL'}: noaa-cpc-oni connector — {_fails} failing case(s)")
raise SystemExit(1 if _fails else 0)
