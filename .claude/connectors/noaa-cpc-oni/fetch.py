#!/usr/bin/env python3
"""NOAA CPC ONI connector — the first real data connector for the "surface a data gap → build a durable
connector → continuous ingest → re-score" loop.

It fetches NOAA's Oceanic Niño Index (ONI) — the canonical ENSO signal (El Niño / La Niña state) that the
commodity dossiers explicitly wait on (e.g. WHEAT: "the Aug-13 NOAA ENSO update") — and writes it into a
subject's external-data pool as a typed, §4 tier-5 API pull.

Design (frameworks/EXTERNAL_DATA.md §7): a fetcher that WRITES FILES needs no engine wiring. Official,
keyless, public-domain source (a US-Government work). One file per pull + its `.source.json` sidecar; the
`as_of` is read from INSIDE the data (the latest season the feed carries), never from the fetch clock.
Fails CLOSED — a non-200, a shape change, or an unparseable feed writes NOTHING (never a bogus fresh row).

Usage:
  python3 fetch.py --verify                         # prove the endpoint fetches + parses; write nothing
  python3 fetch.py --subject WHEAT                  # write into data/WHEAT/external/noaa-cpc/
  python3 fetch.py --subject WHEAT --data-root /tmp/pool
"""
from __future__ import annotations

import argparse
import json
import math
import os
import sys
import tempfile
import urllib.request
from datetime import datetime, timezone

_SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if _SCRIPTS not in sys.path:
    sys.path.append(_SCRIPTS)
from connector_http import open_allowed_https, read_bounded_response  # noqa: E402

HOST = "www.cpc.ncep.noaa.gov"            # the ONE host this connector may reach (its declared allowlist)
URL = f"https://{HOST}/data/indices/oni.ascii.txt"
PROVIDER = "noaa-cpc"
CONNECTOR_ID = "noaa-cpc-oni"
MAX_RESPONSE_BYTES = 2 * 1024 * 1024      # compact ASCII history; hard network-body cap
_HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(_HERE, "connector.json"), encoding="utf-8") as _f:
    MANIFEST = json.load(_f)

# ONI is a centered 3-month running mean, labelled by the 3-letter season; the coverage ends in the LAST
# month of that window. (NDJ spans a year boundary — its January is the following year.)
SEASON_END_MONTH = {"DJF": 2, "JFM": 3, "FMA": 4, "MAM": 5, "AMJ": 6, "MJJ": 7,
                    "JJA": 8, "JAS": 9, "ASO": 10, "SON": 11, "OND": 12, "NDJ": 1}


def fetch_text(timeout: int = 20) -> str:
    req = urllib.request.Request(URL, headers={"User-Agent": f"nostradamus-connector/{CONNECTOR_ID}"})
    with open_allowed_https(req, MANIFEST["host_allowlist"], timeout=timeout) as r:
        if r.status != 200:
            raise RuntimeError(f"HTTP {r.status} from {URL}")
        return read_bounded_response(r, max_bytes=MAX_RESPONSE_BYTES).decode("utf-8", "replace")


def parse(text: str):
    """Parse the ONI ascii into rows [{season, year, sst, anom}]; return (rows, latest). Fails closed."""
    rows = []
    for line in text.splitlines():
        parts = line.split()
        if not parts:
            continue
        if parts[0] in SEASON_END_MONTH and len(parts) != 4:
            raise RuntimeError(f"recognized ONI row has {len(parts)} columns, expected 4 (fail closed)")
        if len(parts) != 4:  # the 'SEAS YR TOTAL ANOM' header + unrelated prose
            continue
        seas, yr, total, anom = parts
        if seas not in SEASON_END_MONTH:
            continue
        try:
            year = int(yr)
            parsed = {
                "season": seas, "year": year, "date": observation_date(seas, year),
                "sst": float(total), "anom": float(anom),
            }
        except ValueError:
            raise RuntimeError(f"recognized ONI row contains a non-numeric value: {line!r} (fail closed)")
        if (not 1900 <= parsed["year"] <= 2200
                or not math.isfinite(parsed["sst"]) or not math.isfinite(parsed["anom"])):
            raise RuntimeError(f"recognized ONI row contains an invalid numeric value: {line!r} (fail closed)")
        rows.append(parsed)
    if not rows:
        raise RuntimeError("no ONI rows parsed — the feed shape may have changed (fail closed, write nothing)")
    coverage_months = [
        (row["year"] + (1 if row["season"] == "NDJ" else 0)) * 12
        + SEASON_END_MONTH[row["season"]]
        for row in rows
    ]
    if any(current != previous + 1 for previous, current in zip(coverage_months, coverage_months[1:])):
        raise RuntimeError("ONI rows are missing, duplicated, or out of monthly season sequence (fail closed)")
    return rows, rows[-1]


def observation_date(season: str, year: int) -> str:
    month = SEASON_END_MONTH[season]
    end_year = year + (1 if season == "NDJ" else 0)
    return f"{end_year:04d}-{month:02d}-01"


def as_of_date(latest: dict) -> str:
    return latest["date"]


def anomaly_state(anom: float) -> str:
    if anom >= 0.5:
        return "warm_threshold"
    if anom <= -0.5:
        return "cool_threshold"
    return "neutral"


def episode_state(rows: list[dict], persistence: int = 5) -> str:
    """Classify an episode only after NOAA's five-overlapping-season persistence test."""
    latest = anomaly_state(rows[-1]["anom"])
    if latest == "neutral":
        return "neutral"
    run = 0
    for row in reversed(rows):
        if anomaly_state(row["anom"]) != latest:
            break
        run += 1
    warm = latest == "warm_threshold"
    if run >= persistence:
        return "el_nino" if warm else "la_nina"
    return "pending_el_nino" if warm else "pending_la_nina"


def build(text: str):
    """Pure transform (fetch → payload + sidecar). Separated from I/O so it is unit-testable without network."""
    rows, latest = parse(text)
    asof = as_of_date(latest)
    anomaly = anomaly_state(latest["anom"])
    state = episode_state(rows)
    payload = {
        "series": MANIFEST["series"],
        "as_of": asof,
        "latest": {**latest, "anomaly_state": anomaly, "episode_state": state},
        "recent": rows[-12:],           # ~1 year of seasons for context
        "observations": rows,
        "source_url": URL,
    }
    sidecar = {
        "provider": "NOAA CPC",
        # §4 tier-5 "API pull, dated" bucket. This particular feed is free + public-domain, but the TIER is
        # what governs citation, and tier 5 is its correct ceiling (an official API pull, below any filing).
        "source_type": "official_data",
        "tier": 5,
        "as_of": asof,
        "received": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source_url": URL,
        "license": MANIFEST["license"],
        "connector_id": CONNECTOR_ID,
        "dataset_id": MANIFEST["dataset_id"], "series_id": MANIFEST["series_id"],
        "schema_version": MANIFEST["schema_version"],
        "licensing": MANIFEST["licensing"],
        "note": (
            f"Latest ONI {latest['anom']:+.2f} ({anomaly}); episode state {state}. "
            "El Niño/La Niña requires five consecutive overlapping seasons at or beyond ±0.5."
        ),
    }
    return asof, latest, state, payload, sidecar


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
    ap = argparse.ArgumentParser(description="Fetch NOAA CPC ONI into a subject's external-data pool.")
    ap.add_argument("--subject", help="the pool subject, e.g. WHEAT (required unless --verify)")
    ap.add_argument("--data-root", default="data", help="pool root (default: data)")
    ap.add_argument("--verify", action="store_true", help="prove the endpoint fetches + parses; write nothing")
    a = ap.parse_args()

    asof, latest, state, payload, sidecar = build(fetch_text())

    if a.verify:
        print(f"OK verify: {URL} → 200, latest {latest['season']} {latest['year']} "
              f"ONI {latest['anom']:+.2f} ({state}), as_of {asof}")
        return 0

    if not a.subject:
        print("error: --subject is required (unless --verify)", file=sys.stderr)
        return 2

    out_dir = os.path.join(a.data_root, a.subject, "external", PROVIDER)
    os.makedirs(out_dir, exist_ok=True)
    data_path = os.path.join(out_dir, f"oni_{asof}.json")
    _atomic_write_json(data_path, payload)
    _atomic_write_json(data_path + ".source.json", sidecar)
    print(f"wrote {data_path} (ONI {latest['anom']:+.2f}, {state}, as_of {asof}) + .source.json sidecar (tier 5)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
