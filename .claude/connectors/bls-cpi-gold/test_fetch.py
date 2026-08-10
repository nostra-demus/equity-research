#!/usr/bin/env python3
"""Offline parser tests for the BLS CPI connector."""
from __future__ import annotations

import datetime as dt
import importlib.util
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("bls_cpi_fetch", HERE / "fetch.py")
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def document(start_year: int, end_year: int, end_month: int = 12):
    rows = []
    for year in range(start_year, end_year + 1):
        months = end_month if year == end_year else 12
        for month in range(1, months + 1):
            rows.append({"year": str(year), "period": f"M{month:02d}", "value": str(200 + (year - start_year) * 2 + month / 10)})
    return {"status": "REQUEST_SUCCEEDED", "Results": {"series": [{"seriesID": MODULE.SERIES_ID, "data": rows}]}}


def main() -> int:
    today = dt.date(2026, 8, 11)
    docs = [
        (MODULE.source_url(2016, 2025), document(2016, 2025)),
        (MODULE.source_url(2026, 2026), document(2026, 2026, 7)),
    ]
    as_of, payload, sidecar = MODULE.build(docs, today=today)
    assert as_of == "2026-07-01" and len(payload["observations"]) == 127
    assert payload["historical_replay_policy"] == "retrieval_vintages_only"
    assert sidecar["source_urls"] == [docs[0][0], docs[1][0]]
    duplicate = [docs[0], (docs[1][0], document(2025, 2026, 7))]
    try:
        MODULE.build(duplicate, today=today)
        raise AssertionError("duplicate periods must fail")
    except RuntimeError as error:
        assert "duplicate" in str(error)
    wrong = document(2026, 2026, 7)
    wrong["Results"]["series"][0]["seriesID"] = "WRONG"
    try:
        MODULE.build([(docs[1][0], wrong)], today=today)
        raise AssertionError("wrong series must fail")
    except RuntimeError as error:
        assert "identity" in str(error)
    print("PASS: bls-cpi-gold")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
