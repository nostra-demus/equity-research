#!/usr/bin/env python3
"""Unit test for the CourtListener FTC-v-Amazon docket-entries connector — parse/transform + fail-closed +
manifest consistency, NO network (fixture records mirroring the CL v4 docket-entries response shape). A
CourtListener field rename or a docket-number mismatch is the realistic break; the live endpoint (and the
token precondition) is proven by `fetch.py --verify` at merge time. Run: python3 test_fetch.py
"""
from __future__ import annotations

import contextlib
import importlib.util
import io
import json
import os
import subprocess
import sys
import urllib.error

_HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("courtlistener_fetch", os.path.join(_HERE, "fetch.py"))
mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(mod)

# These are deliberately synthetic records, not a captured CourtListener
# response. The real docket identity remains because it is the connector's
# target; vendor record IDs, timestamps, descriptions, and document IDs do not.
REC_NEWEST = {
    "id": 100000002,
    "docket": "https://www.courtlistener.com/api/rest/v4/dockets/67828404/",
    "date_created": "2024-02-02T12:00:00Z",
    "date_modified": "2024-02-02T12:05:00Z",
    "date_filed": "2024-02-02",
    "date_filed_is_approximate": False,
    "entry_number": 102,
    "description": "[SYNTHETIC FIXTURE] Notice used only to test docket-entry transformation.",
    "recap_documents": [{"id": 900002, "document_number": 102}],
}
REC_OLDER = {
    "id": 100000001,
    "docket": 67828404,  # plain int id, the other shape the field may take
    "date_created": "2024-01-15T09:00:00Z",
    "date_modified": "2024-01-15T09:00:00Z",
    "date_filed": "2024-01-15",
    "date_filed_is_approximate": False,
    "entry_number": None,  # some minute orders are unnumbered
    "description": "[SYNTHETIC FIXTURE] Unnumbered order used only to test nullable fields.",
    "recap_documents": [],
}
# Newest-first, because that is what `order_by=-date_filed` promises and what the fetcher now REQUIRES.
# (`count` is never read by the fetcher; v4 documents it as a key carrying a URL to obtain the total, so the
# int here is illustrative only — do not "improve" entries_returned by reading data["count"] as a number.)
RESP = {"count": 2, "next": None, "previous": None, "results": [REC_NEWEST, REC_OLDER]}

_fails = 0


def check(name: str, cond: bool) -> None:
    global _fails
    print(f"  {'ok ' if cond else 'FAIL'} {name}")
    if not cond:
        _fails += 1


_prior_token = os.environ.get(mod.TOKEN_ENV)
try:
    os.environ[mod.TOKEN_ENV] = "  token-that-must-not-be-stripped  "
    _edge_token = mod.load_token()
finally:
    if _prior_token is None:
        os.environ.pop(mod.TOKEN_ENV, None)
    else:
        os.environ[mod.TOKEN_ENV] = _prior_token
check("credential edge whitespace is rejected rather than stripped into a different sent token",
      _edge_token is None)


class _TrackedErrorBody:
    def __init__(self, body: bytes):
        self.body = body
        self.offset = 0
        self.read_sizes: list[int] = []
        self.closed = False

    def read(self, size: int) -> bytes:
        self.read_sizes.append(size)
        if size < 0:
            raise AssertionError("the HTTP-error path attempted an unbounded read")
        chunk = self.body[self.offset:self.offset + size]
        self.offset += len(chunk)
        return chunk

    def close(self) -> None:
        self.closed = True


_error_fp = _TrackedErrorBody(b"must-not-be-read")
_oversized_error = urllib.error.HTTPError(
    mod._url(), 413, "Payload Too Large",
    {"Content-Length": str(mod.MAX_ERROR_RESPONSE_BYTES + 1)}, _error_fp,
)
_open_allowed_https = mod.open_allowed_https
try:
    mod.open_allowed_https = lambda *_a, **_k: (_ for _ in ()).throw(_oversized_error)
    mod.fetch_json("test-token-not-sent")
    _error_rejected = False
except RuntimeError as e:
    _error_rejected = "rejected unsafe error response body" in str(e)
finally:
    mod.open_allowed_https = _open_allowed_https
check("HTTP-error diagnostics use the same cap and reject an oversized declared body before reading",
      _error_rejected and not _error_fp.read_sizes and _error_fp.closed)

_safe_error_fp = _TrackedErrorBody(b"denied")
_safe_error = urllib.error.HTTPError(
    mod._url(), 401, "Unauthorized", {"Content-Length": "6"}, _safe_error_fp,
)
try:
    mod.open_allowed_https = lambda *_a, **_k: (_ for _ in ()).throw(_safe_error)
    mod.fetch_json("test-token-not-sent")
    _safe_error_reported = False
except RuntimeError as e:
    _safe_error_reported = "HTTP 401" in str(e) and "denied" in str(e)
finally:
    mod.open_allowed_https = _open_allowed_https
check("an in-cap HTTP-error body remains bounded, closed, and available as short diagnostics",
      _safe_error_reported and _safe_error_fp.offset == 6 and _safe_error_fp.closed
      and all(size >= 0 for size in _safe_error_fp.read_sizes))


as_of, entries, payload, sidecar = mod.build(RESP)
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(_HERE))), "scripts"))
from connector_contract import validate_manifest, validate_staged_output  # noqa: E402
_manifest = json.load(open(os.path.join(_HERE, "connector.json")))
_contract_defects = validate_manifest(_manifest["id"], _HERE, _manifest) + validate_staged_output(
    _manifest, "AMZN", payload, sidecar, as_of,
)
check("shared v2 manifest/staged-output contract accepts the production transform", not _contract_defects)
check("as_of is the latest entry's date_filed, read from the data", as_of == "2024-02-02" and sidecar["as_of"] == "2024-02-02")
check("entries sorted newest-first", entries[0]["date_filed"] == "2024-02-02" and entries[1]["date_filed"] == "2024-01-15")
check("entry_number carried through (including None for unnumbered minute orders)",
      entries[0]["entry_number"] == 102 and entries[1]["entry_number"] is None)
check("recap_documents_count computed", entries[0]["recap_documents_count"] == 1 and entries[1]["recap_documents_count"] == 0)
check("redistribution-restricted API fixtures are unmistakably synthetic",
      all(entry["description"].startswith("[SYNTHETIC FIXTURE]") for entry in entries))
check("URL-shaped and plain-int docket ids both resolve", len(entries) == 2)
check("docket identity constants present", payload["docket_id"] == 67828404 and payload["docket_number"] == "2:23-cv-01495")
check("sidecar tier 5 + paid_api + connector_id",
      sidecar["tier"] == 5 and sidecar["source_type"] == "paid_api"
      and sidecar["connector_id"] == "courtlistener-ftc-amazon-docket")

# The count is PAGE-scoped and must be named so. `entries_count` read as the docket's size, but we fetch one
# page of <= MAX_ENTRIES: this docket is past entry 555, so a field promising a docket count while reporting
# 20 would be a false fact (§5). The old assertion (== 2 on a 2-record fixture) was true under BOTH meanings
# and so could never have caught it — hence a fixture bigger than a page here.
check("the payload's count is page-scoped and named for it (no `entries_count`)",
      payload["entries_returned"] == 2 and "entries_count" not in payload)
_BIG = {"count": 999, "next": "https://www.courtlistener.com/api/rest/v4/docket-entries/?cursor=synthetic",
        "results": [dict(REC_NEWEST, id=700000 + i, entry_number=200 - i,
                         date_filed=f"2024-03-{31 - i:02d}") for i in range(mod.MAX_ENTRIES + 5)]}
_, _big_entries, _big_payload, _big_sidecar = mod.build(_BIG)
check("a full page is capped at MAX_ENTRIES and the count reports what was RETURNED, not the docket total",
      len(_big_entries) == mod.MAX_ENTRIES and _big_payload["entries_returned"] == mod.MAX_ENTRIES)
check("the sidecar note says 'most-recent', never implying it is the whole docket",
      "most-recent docket entries" in _big_sidecar["note"] and "999" not in _big_sidecar["note"])

# §5 citation: source_url is a token-gated API URL that 401s for a human, so a human-openable docket URL
# must travel with the data.
check("a human-openable docket_url is carried in payload and sidecar",
      payload["docket_url"] == f"https://{mod.HOST}/docket/67828404/federal-trade-commission-v-amazoncom-inc/"
      and sidecar["docket_url"] == payload["docket_url"])
check("source_url is retained as the API-pull provenance", "/api/rest/v4/docket-entries/" in payload["source_url"])

# The ordering CONTRACT is verified, not silently repaired. If the API ignores `order_by=-date_filed` we may
# be handed the OLDEST page; sorting it locally would publish it as `latest_entries` with a stale `as_of`,
# and nothing downstream could tell because the release window uses that same derived `as_of`.
_ASC = {"count": 2, "results": [REC_OLDER, REC_NEWEST]}   # oldest FIRST — what an ignored order_by looks like
_raised = False
try:
    mod.build(_ASC)
except RuntimeError as e:
    _raised = "newest-first" in str(e)
check("fail-closed when the API did NOT return newest-first (ordering contract unhonoured)", _raised)
_TIE = {"count": 2, "results": [dict(REC_NEWEST, entry_number=103), dict(REC_NEWEST, entry_number=102)]}
check("same-day entries do NOT trip the ordering guard (non-strict)", mod.build(_TIE)[0] == "2024-02-02")

for bad, label in [
    ({"count": 0, "results": []}, "empty results"),
    ({"count": 1, "results": [dict(REC_NEWEST, docket="https://www.courtlistener.com/api/rest/v4/dockets/99999999/")]}, "wrong docket"),
    ({"count": 2, "results": [
        dict(REC_NEWEST, docket="https://www.courtlistener.com/api/rest/v4/dockets/99999999/"),
        REC_OLDER,
    ]}, "newer off-docket row mixed with an older valid row"),
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

# The CLI's subject guard is argument validation: it must refuse an off-manifest subject with no token
# configured and without touching the network (so it is provable here, and in CI, where no token exists).
_cli = subprocess.run([sys.executable, os.path.join(_HERE, "fetch.py"), "--subject", "TSLA"],
                      capture_output=True, text=True, env={**os.environ, mod.TOKEN_ENV: ""},
                      timeout=30)
check("CLI refuses an off-manifest --subject before the token precondition, no network",
      _cli.returncode == 2 and "not a subject of this connector" in _cli.stderr)
check("...and the fetcher's SUBJECTS mirrors the manifest",
      list(mod.SUBJECTS) == json.load(open(os.path.join(_HERE, "connector.json"), encoding="utf-8"))["subjects"])

# A fetch/transform failure must be REPORTED, not raised at whoever reads the connector ledger. Nothing is
# written either way — the fail-closed contract is the early return — but a traceback is not "instructions".
_io_err, _rc = io.StringIO(), None
mod_fetch_json, mod_load_token = mod.fetch_json, mod.load_token
try:
    mod.fetch_json = lambda *_a, **_k: (_ for _ in ()).throw(RuntimeError("shape changed underfoot"))
    mod.load_token = lambda: "test-token-not-used"
    with contextlib.redirect_stderr(_io_err):
        _rc = mod.main()
except BaseException as e:                       # a traceback escaping main() IS the defect
    _rc = f"raised {type(e).__name__}"
finally:
    mod.fetch_json, mod.load_token = mod_fetch_json, mod_load_token
check("a transform/fetch failure returns a non-zero code with the reason, never a traceback",
      _rc == 3 and "shape changed underfoot" in _io_err.getvalue() and "Traceback" not in _io_err.getvalue())

man = json.load(open(os.path.join(_HERE, "connector.json"), encoding="utf-8"))
check("connector.json tier/source_type agree with the sidecar the fetcher writes",
      man["tier"] == sidecar["tier"] and man["source_type"] == sidecar["source_type"] == "paid_api")
# Pin the tier to the band its source_type earns in frameworks/EXTERNAL_DATA.md ("vendor_export, paid_api →
# 5"). The extract-time clamp only clamps DOWN, so an over-conservative tier is never corrected for us — a
# drift back to 9 would quietly fold a primary US federal court record in below a rating-agency opinion.
check("tier is the paid_api/API-vendor evidence band (5)",
      man["tier"] == sidecar["tier"] == 5)
check("connector.json declares an exact-host allowlist containing the fetch host",
      isinstance(man.get("host_allowlist"), list) and mod.HOST in man["host_allowlist"])
check("connector.json id matches directory name and subjects target AMZN",
      man["id"] == os.path.basename(_HERE) and man["subjects"] == ["AMZN"])
check("connector.json acquisition is free_key_api (matches the token-gated fetch contract)",
      man["acquisition"] == "free_key_api")
check("credential uses the declared launchd-preserved CONNECTOR_ namespace without embedding a value",
      man["credential_env"] == [mod.TOKEN_ENV]
      and mod.TOKEN_ENV == "CONNECTOR_COURTLISTENER_API_TOKEN")

print(f"\n{'PASS' if not _fails else 'FAIL'}: courtlistener-ftc-amazon-docket connector — {_fails} failing case(s)")
raise SystemExit(1 if _fails else 0)
