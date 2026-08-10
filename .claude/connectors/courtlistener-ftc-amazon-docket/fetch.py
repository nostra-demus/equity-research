#!/usr/bin/env python3
"""CourtListener docket-entries connector — FTC v. Amazon.com, Inc. (2:23-cv-01495, W.D. Wash.).

Fetches the latest federal docket entries (motions, orders, scheduling, trial date) for the FTC's core
antitrust suit against Amazon and writes them into the AMZN subject's external pool as a typed, §4 tier-5
API pull, for the management-governance module. A file-writing fetcher per EXTERNAL_DATA.md §7 — zero
engine wiring. Gives a dated aggregator read of the docket index without waiting for news coverage to
summarize a filing; it is not a substitute for the underlying court filing.

Acquisition is free_key_api: CourtListener's REST v4 `docket-entries` endpoint requires a free, self-service
API token (Authorization: Token <token>, obtained at https://www.courtlistener.com/profile/), unlike its
public anonymous search endpoint. The token is never stored in this repo. The fetcher reads only the
CONNECTOR_COURTLISTENER_API_TOKEN environment variable; the production runner securely loads that declared
name from the owner-only providers.env before creating the isolated child (§7, §28). With
no token configured, this fetcher fails closed: it writes nothing and exits non-zero with instructions,
exactly like any other unmet precondition. Fails CLOSED on top of that: a non-200, an empty result, a docket
mismatch, or a shape mismatch also writes NOTHING. `as_of` is the latest entry's filing date, read from the
data.

Usage:
  python3 fetch.py --verify                # prove the endpoint fetches + parses; write nothing
  python3 fetch.py --subject AMZN          # write into data/AMZN/external/courtlistener/
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

_SCRIPTS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), "scripts")
if _SCRIPTS not in sys.path:
    sys.path.append(_SCRIPTS)
from connector_http import ResponseBodyError, open_allowed_https, read_bounded_response  # noqa: E402

HOST = "www.courtlistener.com"           # the ONE host this connector may reach
DOCKET_ID = 67828404                      # FTC v. Amazon.com, Inc., 2:23-cv-01495 (W.D. Wash.)
CASE_NAME = "Federal Trade Commission v. Amazon.com, Inc."
DOCKET_NUMBER = "2:23-cv-01495"
COURT = "W.D. Wash."
DOCKET_URL = f"https://{HOST}/docket/{DOCKET_ID}/federal-trade-commission-v-amazoncom-inc/"
SUBJECTS = ("AMZN",)                      # the pool(s) this series may be written into; mirrors connector.json
PROVIDER = "courtlistener"
CONNECTOR_ID = "courtlistener-ftc-amazon-docket"
MAX_ENTRIES = 20                          # most-recent entries carried in the payload
MAX_RESPONSE_BYTES = 4 * 1024 * 1024      # one capped docket page; hard network-body cap
MAX_ERROR_RESPONSE_BYTES = 64 * 1024      # enough diagnostics without trusting an error server
_HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(_HERE, "connector.json"), encoding="utf-8") as _f:
    MANIFEST = json.load(_f)
TOKEN_ENV = "CONNECTOR_COURTLISTENER_API_TOKEN"


def load_token() -> str | None:
    """Read only the runner-injected credential; never parse secret files here."""
    tok = os.environ.get(TOKEN_ENV)
    return tok if tok and tok == tok.strip() else None


def _url() -> str:
    q = {"docket": str(DOCKET_ID), "order_by": "-date_filed", "page_size": str(MAX_ENTRIES)}
    return f"https://{HOST}/api/rest/v4/docket-entries/?" + urllib.parse.urlencode(q)


def fetch_json(token: str, timeout: int = 20):
    req = urllib.request.Request(
        _url(),
        headers={
            "User-Agent": f"nostradamus-connector/{CONNECTOR_ID}",
            "Authorization": f"Token {token}",
            "Accept": "application/json",
        },
    )
    try:
        with open_allowed_https(req, MANIFEST["host_allowlist"], timeout=timeout) as r:
            if r.status != 200:
                raise RuntimeError(f"HTTP {r.status} from {HOST}")
            body = read_bounded_response(r, max_bytes=MAX_RESPONSE_BYTES)
            return json.loads(body.decode("utf-8", "replace"))
    except urllib.error.HTTPError as e:
        try:
            detail = read_bounded_response(e, max_bytes=MAX_ERROR_RESPONSE_BYTES)
        except ResponseBodyError as body_error:
            raise RuntimeError(
                f"HTTP {e.code} from {HOST}; rejected unsafe error response body: {body_error}"
            ) from e
        finally:
            e.close()
        raise RuntimeError(f"HTTP {e.code} from {HOST}: {detail.decode('utf-8', 'replace')[:300]}") from e


def _docket_id_from(rec: dict):
    """The `docket` field may come back as a plain id or a hyperlinked URL — accept either."""
    v = rec.get("docket")
    if isinstance(v, int):
        return v
    if isinstance(v, str):
        m = re.search(r"/dockets/(\d+)/", v)
        if m:
            return int(m.group(1))
        if v.isdigit():
            return int(v)
    return None


def build(data):
    """Pure transform (API response → payload + sidecar). Separated from I/O so it is unit-testable, no
    network."""
    if not isinstance(data, dict) or not isinstance(data.get("results"), list):
        raise RuntimeError("unexpected response shape (fail closed — CourtListener shape may have changed)")
    results = data["results"]
    if not results:
        raise RuntimeError("no docket entries returned (fail closed)")

    dated = []
    for index, rec in enumerate(results):
        if not isinstance(rec, dict):
            raise RuntimeError(f"docket result {index} is not an object (fail closed)")
        observed_docket = _docket_id_from(rec)
        if observed_docket != DOCKET_ID:
            raise RuntimeError(
                f"docket result {index} belongs to {observed_docket!r}, not {DOCKET_ID} "
                "(fail closed — a filtered endpoint must never mix cases)"
            )
        filed_value = rec.get("date_filed")
        if not isinstance(filed_value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", filed_value):
            raise RuntimeError(f"docket result {index} lacks a canonical date_filed (fail closed)")
        try:
            datetime.strptime(filed_value, "%Y-%m-%d")
        except ValueError as exc:
            raise RuntimeError(f"docket result {index} has an invalid date_filed (fail closed)") from exc
        if not isinstance(rec.get("description"), str):
            raise RuntimeError(f"docket result {index} has no string description (fail closed)")
        if not isinstance(rec.get("recap_documents"), list):
            raise RuntimeError(f"docket result {index} has malformed recap_documents (fail closed)")
        dated.append(rec)

    # VERIFY the ordering contract rather than repairing it locally. We ask for `order_by=-date_filed`, and
    # everything downstream depends on this page being the docket's NEWEST entries: `latest_entries` and
    # `as_of` both assume it. Sorting the page ourselves would hide the one failure that matters — if the API
    # ignores or rejects that ordering, we would receive some OTHER page (plausibly the oldest entries) and
    # then publish it, correctly sorted, as "latest_entries" with a stale `as_of`. Nothing downstream could
    # catch it: the frozen release window is calculated from `as_of`, which is derived from this same data,
    # so a silently-old page reads as a quiet docket. Fail closed unless the API already returned it
    # newest-first. Non-strict, because same-day entries may come back in any relative order.
    filed = [str(r["date_filed"])[:10] for r in dated]
    if any(a < b for a, b in zip(filed, filed[1:])):
        raise RuntimeError(
            "docket entries did not come back newest-first (fail closed — the `order_by=-date_filed` "
            f"contract was not honoured; got {filed[0]}..{filed[-1]}). Refusing to publish a page that may "
            "not be the latest; re-check the endpoint's orderable fields before trusting this series."
        )
    as_of = filed[0]

    entries = []
    for rec in dated[:MAX_ENTRIES]:
        desc = (rec.get("description") or "").strip()
        entries.append({
            "entry_number": rec.get("entry_number"),
            "date_filed": str(rec["date_filed"])[:10],
            "description": desc,
            "recap_documents_count": len(rec.get("recap_documents") or []),
        })

    payload = {
        "series": "CourtListener federal docket entries — FTC v. Amazon.com, Inc. (2:23-cv-01495, W.D. Wash.)",
        "as_of": as_of,
        "docket_id": DOCKET_ID,
        "case_name": CASE_NAME,
        "docket_number": DOCKET_NUMBER,
        "court": COURT,
        # The number of entries IN THIS PAYLOAD, not the docket's total entry count — we fetch a single
        # page of at most MAX_ENTRIES. Named for what it is: the docket runs to entry numbers in the
        # hundreds, so a field called `entries_count` reading 20 would be a false fact under §5, and an
        # analyst would cite it as the size of the docket.
        "entries_returned": len(entries),
        "latest_entries": entries,
        "docket_url": DOCKET_URL,   # human-openable, for citation (§5)
        "source_url": _url(),       # the token-gated API pull this came from (provenance)
    }
    sidecar = {
        "provider": "CourtListener",
        "source_type": "paid_api",
        # Tier 5 — the band `paid_api` earns in frameworks/EXTERNAL_DATA.md ("vendor_export, paid_api → 5"),
        # matching the API/vendor evidence band. `authority_class: court_record_aggregator` remains explicit:
        # this row is CourtListener-derived docket metadata, not the underlying court filing, and must be cited
        # as CourtListener rather than silently promoted to primary evidence.
        "tier": 5,
        "as_of": as_of,
        "received": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "docket_url": DOCKET_URL,
        "source_url": _url(),
        # Both URLs are evidence carried by the payload.  The API URL is the
        # retrieval identity; the human-openable docket URL is the citation
        # route.  Freeze both in the top-level provenance URL set.
        "source_urls": [_url(), DOCKET_URL],
        "license": "public_domain (US federal court record); accessed via CourtListener API under its Terms of Use",
        "connector_id": CONNECTOR_ID,
        "dataset_id": MANIFEST["dataset_id"], "series_id": MANIFEST["series_id"],
        "schema_version": MANIFEST["schema_version"],
        "licensing": MANIFEST["licensing"],
        "note": f"{len(entries)} most-recent docket entries through {as_of}; latest: entry "
                f"{entries[0]['entry_number']} — {entries[0]['description'][:120]}",
    }
    return as_of, entries, payload, sidecar


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
    ap = argparse.ArgumentParser(description="Fetch CourtListener FTC-v-Amazon docket entries into AMZN's external-data pool.")
    ap.add_argument("--subject", help="the pool subject, e.g. AMZN (required unless --verify)")
    ap.add_argument("--data-root", default="data", help="pool root (default: data)")
    ap.add_argument("--verify", action="store_true", help="prove the endpoint fetches + parses; write nothing")
    a = ap.parse_args()

    # Argument validation first — it costs nothing and must not depend on the token being configured.
    # This series is ONE case against ONE issuer, so the subject is not a free parameter: writing it into
    # another company's pool would fold Amazon litigation into that company's evidence base. The staleness
    # runner always passes the manifest's own `subjects`, so this only bites a hand-run — check it anyway.
    if a.subject and a.subject.upper() not in SUBJECTS:
        print(f"error: --subject {a.subject!r} is not a subject of this connector ({', '.join(SUBJECTS)}) — "
              f"this series is one case against one issuer; refusing to write it into another pool.",
              file=sys.stderr)
        return 2

    token = load_token()
    if not token:
        print(
            f"error: no CourtListener API token configured. Fails closed — writes nothing. "
            f"Register a free account and get a token at https://www.courtlistener.com/profile/, "
            f"then set {TOKEN_ENV}; the production runner loads it securely from providers.env.",
            file=sys.stderr,
        )
        return 2

    # A fetch/transform failure must report WHY, not spray a traceback at whoever is reading the ledger.
    # Either way nothing is written — the fail-closed contract is the `return`, not the exception.
    try:
        as_of, entries, payload, sidecar = build(fetch_json(token))
    except RuntimeError as e:
        print(f"error: {e}", file=sys.stderr)
        return 3

    if a.verify:
        print(f"OK verify: {HOST}/api/rest/v4/docket-entries/ → 200, docket {DOCKET_ID} "
              f"({len(entries)} entries fetched, latest as_of {as_of})")
        return 0

    if not a.subject:
        print("error: --subject is required (unless --verify)", file=sys.stderr)
        return 2

    out_dir = os.path.join(a.data_root, a.subject, "external", PROVIDER)
    os.makedirs(out_dir, exist_ok=True)
    data_path = os.path.join(out_dir, f"ftc_v_amazon_docket_{as_of}.json")
    _atomic_write_json(data_path, payload)
    _atomic_write_json(data_path + ".source.json", sidecar)
    print(f"wrote {data_path} ({len(entries)} entries, as_of {as_of}) + .source.json sidecar (tier 5)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
