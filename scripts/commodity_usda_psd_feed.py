#!/usr/bin/env python3
"""Generic fail-closed USDA FAS PSD ZIP feed for commodity balance histories."""
from __future__ import annotations

import argparse
import csv
import io
import json
import math
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path
from typing import Any

from connector_contract import validate_manifest, validate_payload, validate_staged_output
from connector_fetch_support import fetch_bytes, load_manifest, provenance, publish_pair
from connector_http import open_allowed_https, read_bounded_response


HOST = "apps.fas.usda.gov"
METADATA_URL = f"https://{HOST}/psdonline/DatasetHandler.ashx?returnType=CURRENT_DATA_SET"
DOWNLOAD_ROOT = f"https://{HOST}/psdonline/downloads/"
WORLD_URL = f"https://{HOST}/PSDExternalAPIService/svcPSD_AMIS.asmx"
SOAP_ACTION = "http://www.fas.usda.gov/wsfaspsd/getWorldDatabyCommodity"
CSV_HEADER = [
    "Commodity_Code", "Commodity_Description", "Country_Code", "Country_Name",
    "Market_Year", "Calendar_Year", "Month", "Attribute_ID", "Attribute_Description",
    "Unit_ID", "Unit_Description", "Value",
]
CONFIG_KEYS = {
    "config_version", "subject", "commodity_code", "commodity_description",
    "dataset_filename", "zip_member", "provider_slug", "filename_stem", "history_years",
    "attributes", "note",
}
ATTRIBUTE_KEYS = {"id", "description", "target"}
MAX_METADATA_BYTES = 64 * 1024
MAX_ZIP_BYTES = 8 * 1024 * 1024
MAX_CSV_BYTES = 64 * 1024 * 1024
MAX_WORLD_BYTES = 2 * 1024 * 1024


def load_config(fetch_file: str) -> dict[str, Any]:
    path = Path(fetch_file).resolve().parent / "feed.json"
    value = json.loads(path.read_text(encoding="utf-8"))
    if (
        not isinstance(value, dict) or set(value) != CONFIG_KEYS or value.get("config_version") != 1
        or not isinstance(value.get("subject"), str) or not value["subject"]
        or not isinstance(value.get("commodity_code"), str)
        or re.fullmatch(r"\d{7}", value["commodity_code"]) is None
        or not isinstance(value.get("commodity_description"), str) or not value["commodity_description"]
        or not isinstance(value.get("dataset_filename"), str)
        or re.fullmatch(r"[a-z0-9_]+\.zip", value["dataset_filename"]) is None
        or not isinstance(value.get("zip_member"), str)
        or re.fullmatch(r"[a-z0-9_]+\.csv", value["zip_member"]) is None
        or not isinstance(value.get("history_years"), int) or value["history_years"] < 20
        or not all(isinstance(value.get(field), str) and value[field] for field in ("provider_slug", "filename_stem", "note"))
        or not isinstance(value.get("attributes"), list) or not value["attributes"]
    ):
        raise RuntimeError("USDA PSD feed configuration is malformed")
    ids: set[str] = set()
    targets: set[str] = set()
    for attribute in value["attributes"]:
        if (
            not isinstance(attribute, dict) or set(attribute) != ATTRIBUTE_KEYS
            or not isinstance(attribute.get("id"), str) or re.fullmatch(r"\d{3}", attribute["id"]) is None
            or attribute["id"] in ids
            or not isinstance(attribute.get("description"), str) or not attribute["description"]
            or not isinstance(attribute.get("target"), str)
            or re.fullmatch(r"[a-z][a-z0-9_]*", attribute["target"]) is None
            or attribute["target"] in targets
        ):
            raise RuntimeError("USDA PSD attribute configuration is malformed")
        ids.add(attribute["id"]); targets.add(attribute["target"])
    required = {
        "production_thousand_60kg_bags", "arabica_production_thousand_60kg_bags",
        "robusta_production_thousand_60kg_bags", "other_production_thousand_60kg_bags",
        "consumption_thousand_60kg_bags", "ending_stocks_thousand_60kg_bags",
    }
    if targets != required:
        raise RuntimeError("USDA PSD coffee balance requires the exact reviewed metric set")
    return value


def zip_url(config: dict[str, Any]) -> str:
    return DOWNLOAD_ROOT + config["dataset_filename"]


def _release_date(raw: bytes, config: dict[str, Any]) -> str:
    try:
        document = json.loads(raw.decode("utf-8", "strict"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise RuntimeError("USDA PSD dataset metadata is invalid UTF-8 JSON") from error
    if not isinstance(document, dict) or document.get("DownloadPath") != "/psdonline/downloads/":
        raise RuntimeError("USDA PSD dataset metadata schema changed")
    datasets = document.get("DownloadableDataSets")
    if not isinstance(datasets, list):
        raise RuntimeError("USDA PSD dataset metadata has no download list")
    matches = [item for item in datasets if isinstance(item, dict) and item.get("FileName") == config["dataset_filename"]]
    if len(matches) != 1 or set(matches[0]) != {"FileName", "LastUpdated"}:
        raise RuntimeError("USDA PSD dataset identity is absent or ambiguous")
    try:
        parsed = datetime.strptime(matches[0]["LastUpdated"], "%m/%d/%Y").date()
    except (TypeError, ValueError) as error:
        raise RuntimeError("USDA PSD dataset release date is malformed") from error
    if parsed > date.today():
        raise RuntimeError("USDA PSD dataset release date is in the future")
    return parsed.isoformat()


def _csv_bytes(raw: bytes, config: dict[str, Any]) -> bytes:
    try:
        with zipfile.ZipFile(io.BytesIO(raw)) as archive:
            infos = archive.infolist()
            if len(infos) != 1 or infos[0].filename != config["zip_member"]:
                raise RuntimeError("USDA PSD ZIP member identity changed")
            info = infos[0]
            if (
                info.is_dir() or info.flag_bits & 1 or info.file_size <= 0 or info.file_size > MAX_CSV_BYTES
                or info.compress_type not in {zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED}
            ):
                raise RuntimeError("USDA PSD ZIP member violates the archive safety contract")
            data = archive.read(info)
    except (zipfile.BadZipFile, RuntimeError) as error:
        if isinstance(error, RuntimeError):
            raise
        raise RuntimeError("USDA PSD download is not a valid ZIP archive") from error
    if len(data) != info.file_size:
        raise RuntimeError("USDA PSD ZIP member was truncated")
    return data


def _number(value: str) -> float:
    if re.fullmatch(r"(?:0|[1-9]\d*)\.\d{4}", value) is None:
        raise RuntimeError(f"USDA PSD value is not a canonical nonnegative number: {value!r}")
    result = float(value)
    if not math.isfinite(result):
        raise RuntimeError("USDA PSD value is not finite")
    return result


def _rows(raw_zip: bytes, config: dict[str, Any]) -> list[dict[str, Any]]:
    try:
        text = _csv_bytes(raw_zip, config).decode("utf-8-sig", "strict")
    except UnicodeDecodeError as error:
        raise RuntimeError("USDA PSD CSV is not strict UTF-8") from error
    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames != CSV_HEADER:
        raise RuntimeError("USDA PSD CSV header changed")
    configured = {item["id"]: item for item in config["attributes"]}
    rows: list[dict[str, Any]] = []
    for row_number, row in enumerate(reader, start=2):
        if set(row) != set(CSV_HEADER) or row.get(None):
            raise RuntimeError(f"USDA PSD row {row_number} does not match the CSV schema")
        if row["Commodity_Code"] != config["commodity_code"] or row["Commodity_Description"] != config["commodity_description"]:
            raise RuntimeError("USDA PSD commodity identity changed")
        attribute = configured.get(row["Attribute_ID"])
        if attribute is None:
            continue
        if (
            row["Attribute_Description"] != attribute["description"] or row["Unit_ID"] != "02"
            or row["Unit_Description"] != "(1000 60 KG BAGS)"
            or re.fullmatch(r"[A-Z0-9]{2}", row["Country_Code"]) is None
            or not row["Country_Name"] or row["Country_Name"].strip() != row["Country_Name"]
            or re.fullmatch(r"(?:19|20)\d{2}", row["Market_Year"]) is None
            or re.fullmatch(r"(?:19|20)\d{2}", row["Calendar_Year"]) is None
            or re.fullmatch(r"(?:00|0[1-9]|1[0-2])", row["Month"]) is None
        ):
            raise RuntimeError("USDA PSD balance row identity changed")
        rows.append({
            "area_code": row["Country_Code"], "area_name": row["Country_Name"],
            "area_type": "regional_aggregate" if row["Country_Code"] == "E4" else "country",
            "market_year": int(row["Market_Year"]), "target": attribute["target"],
            "value": _number(row["Value"]),
        })
    if not rows:
        raise RuntimeError("USDA PSD CSV contains no reviewed balance metrics")
    return rows


def _world_rows(raw: bytes, config: dict[str, Any], as_of: str) -> dict[int, dict[str, float]]:
    try:
        root = ET.fromstring(raw.decode("utf-8", "strict"))
    except (UnicodeDecodeError, ET.ParseError) as error:
        raise RuntimeError("USDA PSD world response is invalid UTF-8 XML") from error
    if any(element.tag.rsplit("}", 1)[-1] == "ERROR" for element in root.iter()):
        raise RuntimeError("USDA PSD world service returned an error")
    attributes = {item["id"]: item for item in config["attributes"]}
    result: dict[int, dict[str, float]] = defaultdict(dict)
    release = date.fromisoformat(as_of)
    expected_fields = {
        "Commodity_code", "Commodity_Description", "Country_Code", "Country_Name",
        "Market_Year", "Calendar_Year", "Month", "Attribute_Id", "Attribute_Description",
        "Unit_Id", "Unit_Description", "Value",
    }
    for element in root.iter():
        if element.tag.rsplit("}", 1)[-1] != "Commodity":
            continue
        row = {child.tag.rsplit("}", 1)[-1]: (child.text or "").strip() for child in element}
        if set(row) != expected_fields:
            raise RuntimeError("USDA PSD world row schema changed")
        attribute = attributes.get(row["Attribute_Id"].zfill(3))
        if attribute is None:
            continue
        world_description = (
            "Total Production" if attribute["target"] == "production_thousand_60kg_bags"
            else attribute["description"]
        )
        if (
            row["Commodity_code"] != config["commodity_code"]
            or row["Commodity_Description"] != config["commodity_description"]
            or row["Country_Code"] != "00" or row["Country_Name"] != "WORLD"
            or row["Attribute_Description"] != world_description
            or row["Unit_Id"] != "2" or row["Unit_Description"] != "(1000 60 KG BAGS)"
            or row["Calendar_Year"] != str(release.year) or row["Month"] != f"{release.month:02d}"
            or re.fullmatch(r"(?:19|20)\d{2}", row["Market_Year"]) is None
        ):
            raise RuntimeError("USDA PSD world balance identity changed")
        year = int(row["Market_Year"]); target = attribute["target"]
        if target in result[year]:
            raise RuntimeError("USDA PSD world response contains a duplicate semantic row")
        result[year][target] = _number(row["Value"])
    required = {item["target"] for item in config["attributes"]}
    if len(result) < 20 or any(not required <= set(metrics) for metrics in result.values()):
        raise RuntimeError("USDA PSD world balance history is incomplete")
    return result


def build(
    manifest: dict[str, Any], config: dict[str, Any], metadata_raw: bytes, zip_raw: bytes,
    world_raw: bytes,
) -> tuple[str, dict[str, Any], dict[str, Any]]:
    as_of = _release_date(metadata_raw, config)
    rows = _rows(zip_raw, config)
    world = _world_rows(world_raw, config, as_of)
    grouped: dict[tuple[int, str, str], dict[str, float]] = defaultdict(dict)
    area_types: dict[tuple[int, str, str], str] = {}
    seen: set[tuple[int, str, str, str]] = set()
    for row in rows:
        identity = (row["market_year"], row["area_code"], row["area_name"], row["target"])
        if identity in seen:
            raise RuntimeError("USDA PSD CSV contains a duplicate semantic balance row")
        seen.add(identity)
        grouped[identity[:3]][row["target"]] = row["value"]
        area_types[identity[:3]] = row["area_type"]
    targets = {item["target"] for item in config["attributes"]}
    if any(set(metrics) != targets for metrics in grouped.values()):
        raise RuntimeError("USDA PSD country-year balance metrics are incomplete")
    years = sorted(world)[-config["history_years"]:]
    if len(years) < 20 or years[-1] - years[0] < 19:
        raise RuntimeError("USDA PSD balance history is too short")
    observations: list[dict[str, Any]] = []
    for year in years:
        countries = []
        for (row_year, code, name), metrics in sorted(grouped.items()):
            if row_year != year:
                continue
            production_parts = (
                metrics["arabica_production_thousand_60kg_bags"]
                + metrics["robusta_production_thousand_60kg_bags"]
                + metrics["other_production_thousand_60kg_bags"]
            )
            if abs(metrics["production_thousand_60kg_bags"] - production_parts) > 0.001:
                raise RuntimeError("USDA PSD production does not reconcile to Arabica, Robusta and other")
            countries.append({
                "area_code": code, "area_name": name,
                "area_type": area_types[(row_year, code, name)], **metrics,
            })
        global_metrics = world[year]
        global_production = (
            global_metrics["arabica_production_thousand_60kg_bags"]
            + global_metrics["robusta_production_thousand_60kg_bags"]
            + global_metrics["other_production_thousand_60kg_bags"]
        )
        reported_production = global_metrics["production_thousand_60kg_bags"]
        if abs(reported_production - global_production) > 0.001:
            raise RuntimeError("USDA PSD world production does not reconcile to its coffee types")
        if len(countries) < 20 or global_metrics["consumption_thousand_60kg_bags"] <= 0:
            raise RuntimeError("USDA PSD market year has incomplete country coverage")
        observations.append({
            "date": f"{year:04d}-01-01", "market_year": str(year),
            "global_production_thousand_60kg_bags": reported_production,
            "global_arabica_production_thousand_60kg_bags": global_metrics["arabica_production_thousand_60kg_bags"],
            "global_robusta_production_thousand_60kg_bags": global_metrics["robusta_production_thousand_60kg_bags"],
            "global_other_production_thousand_60kg_bags": global_metrics["other_production_thousand_60kg_bags"],
            "global_consumption_thousand_60kg_bags": global_metrics["consumption_thousand_60kg_bags"],
            "global_ending_stocks_thousand_60kg_bags": global_metrics["ending_stocks_thousand_60kg_bags"],
            "global_stocks_to_use_pct": global_metrics["ending_stocks_thousand_60kg_bags"] / global_metrics["consumption_thousand_60kg_bags"] * 100,
            "countries": countries,
        })
    urls = [METADATA_URL, zip_url(config), WORLD_URL]
    payload = {
        "series": manifest["series"], "as_of": as_of, "commodity": config["commodity_description"],
        "date_basis": "USDA PSD market-year label; country marketing-year start months vary",
        "observations": observations, "source_urls": urls,
    }
    defects = validate_payload(payload, manifest["output_schema"])
    if defects:
        raise RuntimeError("USDA PSD output violates its reviewed schema: " + "; ".join(defects[:5]))
    sidecar = provenance(
        manifest, as_of=as_of, source_url=urls[1], source_urls=urls,
        note=f"{config['note']} {len(observations)} market years; current database snapshot released {as_of}.",
    )
    return as_of, payload, sidecar


def _world_request(manifest: dict[str, Any], config: dict[str, Any]) -> bytes:
    body = (
        '<?xml version="1.0" encoding="utf-8"?>'
        '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
        'xmlns:xsd="http://www.w3.org/2001/XMLSchema" '
        'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'
        '<soap:Body><getWorldDatabyCommodity xmlns="http://www.fas.usda.gov/wsfaspsd/">'
        f'<strCommodityCode>{config["commodity_code"]}</strCommodityCode>'
        '</getWorldDatabyCommodity></soap:Body></soap:Envelope>'
    ).encode("utf-8")
    request = urllib.request.Request(
        WORLD_URL, data=body, method="POST",
        headers={
            "Content-Type": "text/xml; charset=utf-8", "SOAPAction": f'"{SOAP_ACTION}"',
            "User-Agent": "NostraResearch/1.0 (+https://github.com/nostra-demus/equity-research)",
            "X-Nostra-Connector": manifest["id"],
        },
    )
    with open_allowed_https(request, manifest["host_allowlist"], timeout=30) as response:
        if response.status != 200:
            raise RuntimeError(f"HTTP {response.status} from USDA FAS PSD world service")
        return read_bounded_response(response, max_bytes=MAX_WORLD_BYTES)


def fetch(manifest: dict[str, Any], config: dict[str, Any]) -> tuple[bytes, bytes, bytes]:
    metadata = fetch_bytes(METADATA_URL, manifest, max_bytes=MAX_METADATA_BYTES, accept="*/*")
    archive = fetch_bytes(zip_url(config), manifest, max_bytes=MAX_ZIP_BYTES, accept="*/*", timeout=30)
    return metadata, archive, _world_request(manifest, config)


def run(fetch_file: str) -> int:
    manifest = load_manifest(fetch_file); config = load_config(fetch_file)
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject"); parser.add_argument("--data-root", default="data")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    if not args.verify and args.subject != config["subject"]:
        parser.error(f"--subject must be {config['subject']} unless --verify")
    try:
        as_of, payload, sidecar = build(manifest, config, *fetch(manifest, config))
    except RuntimeError as error:
        print(f"FEED-ERROR: {error}", file=sys.stderr); return 1
    if args.verify:
        print(f"OK verify: USDA PSD {config['subject']} {len(payload['observations'])} market years through release {as_of}")
        return 0
    path = publish_pair(
        data_root=args.data_root, subject=args.subject, provider_slug=config["provider_slug"],
        filename=f"{config['filename_stem']}_{as_of}.json", payload=payload, sidecar=sidecar,
    )
    print(f"wrote {path}"); return 0


def self_test(fetch_file: str) -> None:
    manifest = load_manifest(fetch_file); config = load_config(fetch_file)
    release = date.today().strftime("%-m/%-d/%Y")
    metadata = json.dumps({
        "DownloadPath": "/psdonline/downloads/",
        "DownloadableDataSets": [{"FileName": config["dataset_filename"], "LastUpdated": release}],
    }).encode()
    output = io.StringIO(); writer = csv.DictWriter(output, fieldnames=CSV_HEADER, lineterminator="\r\n"); writer.writeheader()
    for year in range(date.today().year - 24, date.today().year + 1):
        for code, name in (("BR", "Brazil"), ("CO", "Colombia"), ("VM", "Vietnam"), ("US", "United States"),
                           ("ET", "Ethiopia"), ("ID", "Indonesia"), ("IN", "India"), ("MX", "Mexico"),
                           ("GT", "Guatemala"), ("HN", "Honduras"), ("PE", "Peru"), ("UG", "Uganda"),
                           ("NI", "Nicaragua"), ("CR", "Costa Rica"), ("KE", "Kenya"), ("TZ", "Tanzania"),
                           ("TH", "Thailand"), ("LA", "Laos"), ("CI", "Cote d'Ivoire"), ("CM", "Cameroon")):
            values = {
                "production_thousand_60kg_bags": 100.0,
                "arabica_production_thousand_60kg_bags": 60.0,
                "robusta_production_thousand_60kg_bags": 40.0,
                "other_production_thousand_60kg_bags": 0.0,
                "consumption_thousand_60kg_bags": 80.0,
                "ending_stocks_thousand_60kg_bags": 20.0,
            }
            for attribute in config["attributes"]:
                writer.writerow({
                    "Commodity_Code": config["commodity_code"], "Commodity_Description": config["commodity_description"],
                    "Country_Code": code, "Country_Name": name, "Market_Year": year,
                    "Calendar_Year": date.today().year, "Month": f"{date.today().month:02d}",
                    "Attribute_ID": attribute["id"], "Attribute_Description": attribute["description"],
                    "Unit_ID": "02", "Unit_Description": "(1000 60 KG BAGS)",
                    "Value": f"{values[attribute['target']]:.4f}",
                })
    archive_io = io.BytesIO()
    with zipfile.ZipFile(archive_io, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr(config["zip_member"], output.getvalue().encode())
    world_root = ET.Element("getWorldDatabyCommodity")
    for year in range(date.today().year - 24, date.today().year + 1):
        values = {
            "production_thousand_60kg_bags": 2000.0,
            "arabica_production_thousand_60kg_bags": 1200.0,
            "robusta_production_thousand_60kg_bags": 800.0,
            "other_production_thousand_60kg_bags": 0.0,
            "consumption_thousand_60kg_bags": 1600.0,
            "ending_stocks_thousand_60kg_bags": 400.0,
        }
        for attribute in config["attributes"]:
            commodity = ET.SubElement(world_root, "Commodity")
            fields = {
                "Commodity_code": config["commodity_code"], "Commodity_Description": config["commodity_description"],
                "Country_Code": "00", "Country_Name": "WORLD", "Market_Year": str(year),
                "Calendar_Year": str(date.today().year), "Month": f"{date.today().month:02d}",
                "Attribute_Id": str(int(attribute["id"])),
                "Attribute_Description": (
                    "Total Production" if attribute["target"] == "production_thousand_60kg_bags"
                    else attribute["description"]
                ),
                "Unit_Id": "2", "Unit_Description": "(1000 60 KG BAGS)",
                "Value": f"{values[attribute['target']]:.4f}",
            }
            for key, value in fields.items():
                ET.SubElement(commodity, key).text = value
    world_fixture = ET.tostring(world_root)
    as_of, payload, sidecar = build(manifest, config, metadata, archive_io.getvalue(), world_fixture)
    defects = validate_manifest(manifest["id"], str(Path(fetch_file).resolve().parent), manifest)
    defects += validate_staged_output(manifest, config["subject"], payload, sidecar, as_of)
    if defects:
        raise AssertionError(defects)
    assert len(payload["observations"]) == 25
    print(f"PASS: {manifest['id']}")
