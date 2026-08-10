#!/usr/bin/env python3
"""Discover and fetch the current USGS MCS Gold mine-production CSV."""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import io
import json
import math
import os
import sys
import urllib.parse

SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if SCRIPTS not in sys.path:
    sys.path.append(SCRIPTS)
from connector_fetch_support import fetch_bytes, load_manifest, provenance, publish_pair  # noqa: E402

MANIFEST = load_manifest(__file__)
HOST = "www.sciencebase.gov"
MAX_METADATA_BYTES = 2 * 1024 * 1024
MAX_CSV_BYTES = 8 * 1024 * 1024


class ReleaseNotFound(RuntimeError):
    """The searched calendar-year release is not published yet."""


def search_url(year: int) -> str:
    query = urllib.parse.urlencode({"q": f"Mineral Commodity Summaries {year} Data Release", "format": "json", "max": "20"})
    return f"https://{HOST}/catalog/items?{query}"


def item_url(item_id: str) -> str:
    return f"https://{HOST}/catalog/item/{item_id}?format=json"


def discover(search: object, year: int) -> tuple[str, str]:
    expected = f"Mineral Commodity Summaries {year} Data Release - Commodity Salient U.S. and World Statistics"
    if not isinstance(search, dict) or not isinstance(search.get("items"), list):
        raise RuntimeError("USGS search response has no items")
    matches = [item for item in search["items"] if isinstance(item, dict) and item.get("title") == expected]
    if not matches:
        raise ReleaseNotFound(f"USGS {year} commodity-statistics release is not published")
    if len(matches) != 1 or not isinstance(matches[0].get("id"), str):
        raise RuntimeError("USGS search returned an ambiguous current commodity-statistics release")
    return matches[0]["id"], expected


def csv_url(metadata: object) -> str:
    if not isinstance(metadata, dict) or not isinstance(metadata.get("files"), list):
        raise RuntimeError("USGS item metadata has no files")
    matches = [entry.get("downloadUri") or entry.get("url") for entry in metadata["files"]
               if isinstance(entry, dict) and str(entry.get("name", "")).endswith("_Commodities_Data.csv")]
    matches = [value for value in matches if isinstance(value, str)]
    if len(matches) != 1 or not matches[0].startswith(f"https://{HOST}/"):
        raise RuntimeError("USGS item does not expose one allowlisted commodities CSV")
    return matches[0]


def _number(value: str) -> float:
    cleaned = value.strip().replace(",", "")
    if cleaned[:1].casefold() == "e":
        cleaned = cleaned[1:]
    try:
        parsed = float(cleaned)
    except ValueError as error:
        raise RuntimeError(f"USGS mine-production value {value!r} is not numeric") from error
    if not math.isfinite(parsed) or parsed < 0:
        raise RuntimeError("USGS mine-production value is invalid")
    return parsed


def build(csv_text: str, *, release_title: str, urls: list[str]):
    reader = csv.DictReader(io.StringIO(csv_text))
    required = {"MCS chapter", "Section", "Commodity", "Country", "Statistics", "Statistics_detail", "Unit", "Year", "Value", "Notes"}
    if not reader.fieldnames or not required.issubset(set(reader.fieldnames)):
        raise RuntimeError("USGS CSV schema changed")
    mine_rows = []
    for row in reader:
        if (row.get("MCS chapter") != "GOLD" or row.get("Commodity") != "Gold"
                or row.get("Section") != "World Mine Production and Reserves:"
                or row.get("Statistics") != "Production" or row.get("Unit") != "metric tons"
                or not str(row.get("Statistics_detail", "")).startswith("Mine production")):
            continue
        try:
            year = int(str(row.get("Year", "")))
        except ValueError as error:
            raise RuntimeError("USGS Gold row has a non-integer year") from error
        mine_rows.append({"country": str(row.get("Country", "")).strip(), "year": year,
                          "mine_production": _number(str(row.get("Value", ""))),
                          "estimated": "estimated" in str(row.get("Notes", "")).casefold()})
    world = [{"year": row["year"], "mine_production": row["mine_production"], "estimated": row["estimated"]}
             for row in mine_rows if row["country"] == "World total"]
    world.sort(key=lambda row: row["year"])
    if len(world) < 2 or len({row["year"] for row in world}) != len(world):
        raise RuntimeError("USGS Gold CSV lacks two unique world-production observations")
    latest_year = world[-1]["year"]
    countries = [row for row in mine_rows if row["year"] == latest_year and row["country"] not in {"World total", ""}]
    countries.sort(key=lambda row: row["country"])
    if len(countries) < 10:
        raise RuntimeError("USGS Gold CSV lacks broad country coverage")
    as_of = f"{latest_year:04d}-12-31"
    payload = {"series": MANIFEST["series"], "as_of": as_of, "release_title": release_title,
               "world": world, "countries_latest": countries, "source_urls": urls}
    sidecar = provenance(MANIFEST, as_of=as_of, source_url=urls[-1], source_urls=urls,
                         note=f"USGS world mine production {world[-1]['mine_production']:,.0f} metric tonnes for {latest_year}; estimate flag preserved.")
    return as_of, payload, sidecar


def fetch_release(year: int):
    search = search_url(year)
    search_json = json.loads(fetch_bytes(search, MANIFEST, max_bytes=MAX_METADATA_BYTES).decode("utf-8"))
    item_id, title = discover(search_json, year)
    item = item_url(item_id)
    metadata = json.loads(fetch_bytes(item, MANIFEST, max_bytes=MAX_METADATA_BYTES).decode("utf-8"))
    data = csv_url(metadata)
    text = fetch_bytes(data, MANIFEST, max_bytes=MAX_CSV_BYTES).decode("cp1252")
    return build(text, release_title=title, urls=[search, item, data])


def fetch_all():
    year = dt.datetime.now(dt.timezone.utc).year
    try:
        return fetch_release(year)
    except ReleaseNotFound:
        return fetch_release(year - 1)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject")
    parser.add_argument("--data-root", default="data")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    as_of, payload, sidecar = fetch_all()
    if args.verify:
        print(f"OK verify: USGS Gold mine supply through {as_of}; {len(payload['countries_latest'])} country rows")
        return 0
    if not args.subject:
        parser.error("--subject is required unless --verify")
    path = publish_pair(data_root=args.data_root, subject=args.subject, provider_slug="usgs",
                        filename=f"mine_supply_{as_of}.json", payload=payload, sidecar=sidecar)
    print(f"wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
