#!/usr/bin/env python3
"""Manual transform for operator-downloaded CME Gold stock/delivery reports."""
from __future__ import annotations

import argparse
import datetime as dt
import math
import os
import re
import sys

SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if SCRIPTS not in sys.path:
    sys.path.append(SCRIPTS)
from connector_fetch_support import load_json_capture, load_manifest, provenance, publish_pair  # noqa: E402

MANIFEST = load_manifest(__file__)
MAX_INPUT_BYTES = 2 * 1024 * 1024


def _nonnegative(capture: dict, key: str) -> float:
    value = capture.get(key)
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(float(value)) or value < 0:
        raise RuntimeError(f"CME capture field {key} must be a finite nonnegative number")
    return float(value)


def build(capture: dict):
    day = capture.get("as_of")
    try:
        dt.date.fromisoformat(day)
    except (TypeError, ValueError):
        raise RuntimeError("CME capture as_of must be a real ISO date") from None
    source_url = capture.get("source_url")
    if not isinstance(source_url, str) or not source_url.startswith("https://www.cmegroup.com/"):
        raise RuntimeError("CME capture source_url must identify an official CME report")
    source_report = capture.get("source_report")
    delivery_contract = capture.get("delivery_contract")
    if not isinstance(source_report, str) or not source_report.strip() or not isinstance(delivery_contract, str) or not delivery_contract.strip():
        raise RuntimeError("CME capture must name the report and delivery contract")
    registered = _nonnegative(capture, "registered_ounces")
    eligible = _nonnegative(capture, "eligible_ounces")
    notices = capture.get("delivery_notices")
    if isinstance(notices, bool) or not isinstance(notices, int) or notices < 0:
        raise RuntimeError("CME delivery_notices must be a nonnegative integer")
    payload = {
        "series": MANIFEST["series"], "as_of": day, "registered_ounces": registered,
        "eligible_ounces": eligible, "total_ounces": registered + eligible,
        "received_ounces": _nonnegative(capture, "received_ounces"),
        "shipped_ounces": _nonnegative(capture, "shipped_ounces"),
        "delivery_notices": notices, "delivery_contract": delivery_contract.strip(),
        "source_report": source_report.strip(), "source_url": source_url, "manual_source": True,
    }
    sidecar = provenance(
        MANIFEST, as_of=day, source_url=source_url,
        note=(f"Operator-downloaded CME report: registered {registered:,.0f} oz, eligible {eligible:,.0f} oz, "
              f"delivery notices {notices}. Manual status remains explicit."),
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
        print("OK verify: manual-only CME transform; no automated retrieval or entitlement bypass")
        return 0
    if not args.subject or not args.from_file:
        parser.error("--subject and --from-file are required")
    as_of, payload, sidecar = build(load_json_capture(args.from_file, max_bytes=MAX_INPUT_BYTES))
    path = publish_pair(data_root=args.data_root, subject=args.subject, provider_slug="cme",
                        filename=f"gold_inventory_deliveries_{as_of}.json", payload=payload, sidecar=sidecar)
    print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
