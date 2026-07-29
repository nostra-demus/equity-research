#!/usr/bin/env python3
"""Unit test for the CourtListener FTC-v-Amazon docket-entries connector — parse/transform + fail-closed +
manifest consistency, NO network (fixture records mirroring the CL v4 docket-entries response shape). A
CourtListener field rename or a docket-number mismatch is the realistic break; the live endpoint (and the
token precondition) is proven by `fetch.py --verify` at merge time. Run: python3 test_fetch.py
"""
from __future__ import annotations

import importlib.util
import json
import os

_HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("courtlistener_fetch", os.path.join(_HERE, "fetch.py"))
mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(mod)

REC_NEWEST = {
    "id": 458703998,
    "docket": "https://www.courtlistener.com/api/rest/v4/dockets/67828404/",
    "date_created": "2025-11-13T21:49:46Z",
    "date_modified": "2025-11-13T21:54:37Z",
    "date_filed": "2025-11-13",
    "date_filed_is_approximate": False,
    "entry_number": 555,
    "description": "NOTICE Regarding United States Government Cessation; filed by Plaintiff Federal Trade Commission.",
    "recap_documents": [{"id": 1, "document_number": 555}],
}
REC_OLDER = {
    "id": 442436893,
    "docket": 67828404,  # plain int id, the other shape the field may take
    "date_created": "2025-06-11T23:25:38Z",
    "date_modified": "2025-06-11T23:25:38Z",
    "date_filed": "2025-06-11",
    "date_filed_is_approximate": False,
    "entry_number": None,  # some minute orders are unnumbered
    "description": "ORDER on Application for Leave to Appear Pro Hac Vice.",
    "recap_documents": [],
}
RESP = {"count": 2, "next": None, "previous": None, "results": [REC_OLDER, REC_NEWEST]}

_fails = 0


def check(name: str, cond: bool) -> None:
    global _fails
    print(f"  {'ok ' if cond else 'FAIL'} {name}")
    if not cond:
        _fails += 1


as_of, entries, payload, sidecar = mod.build(RESP)
check("as_of is the latest entry's date_filed, read from the data", as_of == "2025-11-13" and sidecar["as_of"] == "2025-11-13")
check("entries sorted newest-first", entries[0]["date_filed"] == "2025-11-13" and entries[1]["date_filed"] == "2025-06-11")
check("entry_number carried through (including None for unnumbered minute orders)",
      entries[0]["entry_number"] == 555 and entries[1]["entry_number"] is None)
check("recap_documents_count computed", entries[0]["recap_documents_count"] == 1 and entries[1]["recap_documents_count"] == 0)
check("URL-shaped and plain-int docket ids both resolve", payload["entries_count"] == 2)
check("docket identity constants present", payload["docket_id"] == 67828404 and payload["docket_number"] == "2:23-cv-01495")
check("sidecar tier 9 + paid_api + connector_id",
      sidecar["tier"] == 9 and sidecar["source_type"] == "paid_api"
      and sidecar["connector_id"] == "courtlistener-ftc-amazon-docket")

for bad, label in [
    ({"count": 0, "results": []}, "empty results"),
    ({"count": 1, "results": [dict(REC_NEWEST, docket="https://www.courtlistener.com/api/rest/v4/dockets/99999999/")]}, "wrong docket"),
    ({"count": 1, "results": [{k: v for k, v in REC_NEWEST.items() if k != "date_filed"}]}, "missing date_filed"),
    ({"not": "a docket-entries response"}, "unexpected top-level shape"),
    ({"results": "not-a-list"}, "results not a list"),
]:
    raised = False
    try:
        mod.build(bad)
    except Exception:
        raised = True
    check(f"fail-closed on {label} (writes nothing)", raised)

# --docket-id resolution helper, both accepted shapes
check("_docket_id_from parses a hyperlinked docket URL", mod._docket_id_from(REC_NEWEST) == 67828404)
check("_docket_id_from accepts a plain int docket id", mod._docket_id_from(REC_OLDER) == 67828404)
check("_docket_id_from returns None on an unrecognized shape", mod._docket_id_from({"docket": None}) is None)

man = json.load(open(os.path.join(_HERE, "connector.json"), encoding="utf-8"))
check("connector.json tier/source_type agree with the sidecar the fetcher writes",
      man["tier"] == sidecar["tier"] == 9 and man["source_type"] == sidecar["source_type"] == "paid_api")
check("connector.json declares an exact-host allowlist containing the fetch host",
      isinstance(man.get("host_allowlist"), list) and mod.HOST in man["host_allowlist"])
check("connector.json id matches directory name and subjects target AMZN",
      man["id"] == os.path.basename(_HERE) and man["subjects"] == ["AMZN"])
check("connector.json acquisition is free_key_api (matches the token-gated fetch contract)",
      man["acquisition"] == "free_key_api")

print(f"\n{'PASS' if not _fails else 'FAIL'}: courtlistener-ftc-amazon-docket connector — {_fails} failing case(s)")
raise SystemExit(1 if _fails else 0)
