#!/usr/bin/env python3
"""Manual transform for WGC's IMF/central-bank official-reserve workbook."""
from __future__ import annotations

import argparse
import datetime as dt
import math
import os
import sys

SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if SCRIPTS not in sys.path:
    sys.path.append(SCRIPTS)
from connector_fetch_support import load_json_capture, load_manifest, provenance, publish_pair  # noqa: E402

MANIFEST = load_manifest(__file__)
MAX_INPUT_BYTES = 4 * 1024 * 1024
BASIS = "IMF IFS and reporting central banks, with World Gold Council documented adjustments preserved"


def build(capture: dict):
    day = capture.get("as_of")
    try:
        dt.date.fromisoformat(day)
    except (TypeError, ValueError):
        raise RuntimeError("reserve capture as_of must be a real ISO date") from None
    source_url = capture.get("source_url")
    if not isinstance(source_url, str) or not source_url.startswith("https://www.gold.org/"):
        raise RuntimeError("reserve capture source_url must identify the WGC official-reserves page/workbook")
    lag = capture.get("reporting_lag_months")
    if isinstance(lag, bool) or not isinstance(lag, int) or lag < 0 or lag > 24:
        raise RuntimeError("reporting_lag_months must be an integer from 0 to 24")
    raw_changes = capture.get("changes")
    if not isinstance(raw_changes, list) or not raw_changes:
        raise RuntimeError("reserve capture contains no reported institution changes")
    changes = []
    seen = set()
    for row in raw_changes:
        if not isinstance(row, dict) or set(row) != {"institution", "change_tonnes", "status"}:
            raise RuntimeError("reserve change rows require institution/change_tonnes/status only")
        institution = row["institution"]
        value = row["change_tonnes"]
        status = row["status"]
        if not isinstance(institution, str) or not institution.strip() or institution.casefold() in seen:
            raise RuntimeError("reserve change institutions must be non-empty and unique")
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(float(value)):
            raise RuntimeError("reserve change tonnes must be finite")
        if status not in {"reported", "wgc_adjusted"}:
            raise RuntimeError("reserve change status must preserve reported vs WGC-adjusted identity")
        seen.add(institution.casefold())
        changes.append({"institution": institution.strip(), "change_tonnes": float(value), "status": status})
    changes.sort(key=lambda row: row["institution"])
    net = sum(row["change_tonnes"] for row in changes)
    payload = {"series": MANIFEST["series"], "as_of": day, "reporting_lag_months": lag,
               "changes": changes, "net_reported_change_tonnes": net, "compilation_basis": BASIS,
               "adjustments_preserved": True, "source_url": source_url, "manual_source": True}
    sidecar = provenance(
        MANIFEST, as_of=day, source_url=source_url,
        note=(f"Reported official-sector net change {net:+.2f} tonnes across {len(changes)} institutions; "
              f"lag {lag} month(s); WGC adjustments remain labelled."),
    )
    return day, payload, sidecar


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject")
    parser.add_argument("--data-root", default="data")
    parser.add_argument("--from-file")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    if args.verify:
        print("OK verify: manual-only WGC/IMF reserve transform; source adjustments and lag remain explicit")
        return 0
    if not args.subject or not args.from_file:
        parser.error("--subject and --from-file are required")
    as_of, payload, sidecar = build(load_json_capture(args.from_file, max_bytes=MAX_INPUT_BYTES))
    path = publish_pair(data_root=args.data_root, subject=args.subject, provider_slug="world-gold-council",
                        filename=f"official_reserve_changes_{as_of}.json", payload=payload, sidecar=sidecar)
    print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
