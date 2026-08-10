#!/usr/bin/env python3
"""CFTC Commitments-of-Traders connector — WHEAT-SRW managed-money positioning.

Fetches the latest Disaggregated Futures-Only COT for CBOT SRW wheat and writes the managed-money
positioning (the ~net-short "squeeze precondition" the wheat thesis leans on) into a subject's external pool
as a typed, §4 tier-5 API pull. A file-writing fetcher per EXTERNAL_DATA.md §7 — zero engine wiring; keyless,
public-domain source (CFTC Socrata). It feeds a RUN's positioning analysis, distinct from the cockpit pulse
chip. Fails CLOSED: a non-200, an empty result, or a shape/contract mismatch writes NOTHING. `as_of` is the
COT report date, read from the data.

Usage:
  python3 fetch.py --verify                # prove the endpoint fetches + parses; write nothing
  python3 fetch.py --subject WHEAT         # write into data/WHEAT/external/cftc/
"""
from __future__ import annotations

import argparse
import json
import math
import os
import re
import sys
import tempfile
import urllib.parse
import urllib.request
from datetime import datetime, timezone

_SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if _SCRIPTS not in sys.path:
    sys.path.append(_SCRIPTS)
from connector_http import open_allowed_https, read_bounded_response  # noqa: E402

HOST = "publicreporting.cftc.gov"        # the ONE host this connector may reach
DATASET = "72hh-3qpy"                    # CFTC Disaggregated Futures-Only COT
CONTRACT = "WHEAT-SRW"
PROVIDER = "cftc"
CONNECTOR_ID = "cftc-cot-wheat-srw"
MAX_RESPONSE_BYTES = 1024 * 1024          # one latest-row JSON response; hard network-body cap
_HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(_HERE, "connector.json"), encoding="utf-8") as _f:
    MANIFEST = json.load(_f)


def _url() -> str:
    q = {"contract_market_name": CONTRACT, "$order": "report_date_as_yyyy_mm_dd DESC", "$limit": "1"}
    return f"https://{HOST}/resource/{DATASET}.json?" + urllib.parse.urlencode(q)


def fetch_json(timeout: int = 20):
    req = urllib.request.Request(_url(), headers={"User-Agent": f"nostradamus-connector/{CONNECTOR_ID}"})
    with open_allowed_https(req, MANIFEST["host_allowlist"], timeout=timeout) as r:
        if r.status != 200:
            raise RuntimeError(f"HTTP {r.status} from {HOST}")
        return json.loads(read_bounded_response(r, max_bytes=MAX_RESPONSE_BYTES).decode("utf-8", "replace"))


def _int(rec: dict, k: str) -> int:
    v = rec.get(k)
    if v is None:
        raise RuntimeError(f"missing field {k!r} (fail closed — CFTC shape may have changed)")
    if isinstance(v, bool):
        raise RuntimeError(f"field {k!r} is not an integer count (fail closed)")
    if isinstance(v, int):
        value = v
    elif isinstance(v, str) and re.fullmatch(r"-?(?:0|[1-9]\d*)", v):
        value = int(v)
    else:
        raise RuntimeError(f"field {k!r} is not a strict integer count: {v!r} (fail closed)")
    if abs(value) > 9_007_199_254_740_991:
        raise RuntimeError(f"field {k!r} exceeds the exact cross-runtime integer range (fail closed)")
    return value


def _float(rec: dict, k: str):
    v = rec.get(k)
    if v is None or isinstance(v, bool):
        raise RuntimeError(f"missing or invalid field {k!r} (fail closed)")
    try:
        value = float(v)
    except (TypeError, ValueError) as exc:
        raise RuntimeError(f"field {k!r} is not numeric (fail closed)") from exc
    if not math.isfinite(value) or value < 0 or value > 100:
        raise RuntimeError(f"field {k!r} is outside 0..100 percent (fail closed)")
    return value


def build(records):
    """Pure transform (records → payload + sidecar). Separated from I/O so it is unit-testable, no network."""
    if not isinstance(records, list) or not records:
        raise RuntimeError("no COT rows returned (fail closed)")
    rec = records[0]
    if rec.get("contract_market_name") != CONTRACT:
        raise RuntimeError(f"unexpected contract {rec.get('contract_market_name')!r} (fail closed)")
    lng = _int(rec, "m_money_positions_long_all")
    shrt = _int(rec, "m_money_positions_short_all")
    net = lng - shrt
    net_chg = _int(rec, "change_in_m_money_long_all") - _int(rec, "change_in_m_money_short_all")
    oi = _int(rec, "open_interest_all")
    asof = str(rec["report_date_as_yyyy_mm_dd"])[:10]
    stance = "net_short" if net < 0 else ("net_long" if net > 0 else "flat")
    payload = {
        "series": "CFTC Disaggregated COT — WHEAT-SRW managed-money positioning",
        "as_of": asof,
        "contract": CONTRACT,
        "managed_money": {
            "long": lng, "short": shrt, "net": net, "stance": stance, "net_change_wow": net_chg,
            "pct_of_oi_long": _float(rec, "pct_of_oi_m_money_long_all"),
            "pct_of_oi_short": _float(rec, "pct_of_oi_m_money_short_all"),
        },
        "open_interest_all": oi,
        "source_url": _url(),
    }
    sidecar = {
        "provider": "CFTC",
        "source_type": "official_data",     # government-published raw data; §4 tier-5 external-data ceiling
        "tier": 5,
        "as_of": asof,
        "received": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source_url": _url(),
        "license": MANIFEST["license"],
        "connector_id": CONNECTOR_ID,
        "dataset_id": MANIFEST["dataset_id"], "series_id": MANIFEST["series_id"],
        "schema_version": MANIFEST["schema_version"],
        "licensing": MANIFEST["licensing"],
        "note": f"Managed money net {net:+,} ({stance}) as of {asof}; OI {oi:,}.",
    }
    return asof, net, stance, payload, sidecar


def _atomic_write_json(path: str, obj) -> None:
    """Write JSON atomically — a crash / disk-full mid-write can't leave a truncated file at `path`
    (write a temp in the same dir, fsync, then os.replace, which is atomic on POSIX)."""
    d = os.path.dirname(path) or "."
    fd, tmp = tempfile.mkstemp(dir=d, suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(obj, f, indent=2)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def main() -> int:
    ap = argparse.ArgumentParser(description="Fetch CFTC WHEAT-SRW COT into a subject's external-data pool.")
    ap.add_argument("--subject", help="the pool subject, e.g. WHEAT (required unless --verify)")
    ap.add_argument("--data-root", default="data", help="pool root (default: data)")
    ap.add_argument("--verify", action="store_true", help="prove the endpoint fetches + parses; write nothing")
    a = ap.parse_args()

    asof, net, stance, payload, sidecar = build(fetch_json())

    if a.verify:
        print(f"OK verify: {HOST}/{DATASET} → 200, WHEAT-SRW managed money net {net:+,} ({stance}), as_of {asof}")
        return 0

    if not a.subject:
        print("error: --subject is required (unless --verify)", file=sys.stderr)
        return 2

    out_dir = os.path.join(a.data_root, a.subject, "external", PROVIDER)
    os.makedirs(out_dir, exist_ok=True)
    data_path = os.path.join(out_dir, f"cot_wheat_srw_{asof}.json")
    _atomic_write_json(data_path, payload)
    _atomic_write_json(data_path + ".source.json", sidecar)
    print(f"wrote {data_path} (managed money net {net:+,}, {stance}, as_of {asof}) + .source.json sidecar (tier 5)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
