#!/usr/bin/env python3
"""Fetch at least three years of official Treasury real par yields."""
from __future__ import annotations

import argparse
import datetime as dt
import math
import os
import re
import sys
import xml.etree.ElementTree as ET

SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if SCRIPTS not in sys.path:
    sys.path.append(SCRIPTS)
from connector_fetch_support import fetch_bytes, load_manifest, provenance, publish_pair  # noqa: E402

MANIFEST = load_manifest(__file__)
HOST = "home.treasury.gov"
MAX_RESPONSE_BYTES = 8 * 1024 * 1024
ATOM = "{http://www.w3.org/2005/Atom}"
D = "{http://schemas.microsoft.com/ado/2007/08/dataservices}"
M = "{http://schemas.microsoft.com/ado/2007/08/dataservices/metadata}"
FIELDS = {
    "five_year": "TC_5YEAR", "seven_year": "TC_7YEAR", "ten_year": "TC_10YEAR",
    "twenty_year": "TC_20YEAR", "thirty_year": "TC_30YEAR",
}


def url_for(year: int) -> str:
    return (f"https://{HOST}/resource-center/data-chart-center/interest-rates/pages/xml?"
            f"data=daily_treasury_real_yield_curve&field_tdr_date_value={year}")


def _number(text: str | None, label: str) -> float:
    try:
        value = float(text)
    except (TypeError, ValueError) as error:
        raise RuntimeError(f"Treasury field {label} is missing or non-numeric") from error
    if not math.isfinite(value) or value < -10 or value > 20:
        raise RuntimeError(f"Treasury field {label} is outside the plausible percent range")
    return value


def parse_xml(text: str) -> list[dict]:
    try:
        root = ET.fromstring(text)
    except ET.ParseError as error:
        raise RuntimeError(f"malformed Treasury XML: {error}") from error
    rows = []
    for entry in root.findall(f"{ATOM}entry"):
        props = entry.find(f"{ATOM}content/{M}properties")
        if props is None:
            raise RuntimeError("Treasury entry lacks properties")
        date_node = props.find(f"{D}NEW_DATE")
        day = str(date_node.text if date_node is not None else "")[:10]
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", day):
            raise RuntimeError("Treasury entry has an invalid date")
        row = {"date": day}
        for output, source in FIELDS.items():
            node = props.find(f"{D}{source}")
            if node is None or node.attrib.get(f"{M}null") == "true":
                raise RuntimeError(f"Treasury entry lacks {source}")
            row[output] = _number(node.text, source)
        rows.append(row)
    if not rows:
        raise RuntimeError("Treasury XML contains no real-yield observations")
    return rows


def build(documents: list[tuple[str, str]]):
    rows = [row for _url, text in documents for row in parse_xml(text)]
    rows.sort(key=lambda row: row["date"])
    dates = [row["date"] for row in rows]
    if len(rows) < 750 or len(set(dates)) != len(dates):
        raise RuntimeError("Treasury response lacks 750 unique daily observations")
    as_of = dates[-1]
    urls = [url for url, _text in documents]
    payload = {"series": MANIFEST["series"], "as_of": as_of, "observations": rows, "source_urls": urls}
    sidecar = provenance(
        MANIFEST, as_of=as_of, source_url=urls[-1], source_urls=urls,
        note=f"Official 10-year real par yield {rows[-1]['ten_year']:+.2f}% on {as_of}.",
    )
    return as_of, payload, sidecar


def fetch_documents() -> list[tuple[str, str]]:
    year = dt.datetime.now(dt.timezone.utc).year
    documents = []
    for requested in range(year - 3, year + 1):
        url = url_for(requested)
        text = fetch_bytes(url, MANIFEST, max_bytes=MAX_RESPONSE_BYTES).decode("utf-8", "strict")
        documents.append((url, text))
    return documents


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject")
    parser.add_argument("--data-root", default="data")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    as_of, payload, sidecar = build(fetch_documents())
    if args.verify:
        print(f"OK verify: {len(payload['observations'])} Treasury real-yield rows through {as_of}")
        return 0
    if not args.subject:
        parser.error("--subject is required unless --verify")
    path = publish_pair(data_root=args.data_root, subject=args.subject, provider_slug="us-treasury",
                        filename=f"real_yields_{as_of}.json", payload=payload, sidecar=sidecar)
    print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
