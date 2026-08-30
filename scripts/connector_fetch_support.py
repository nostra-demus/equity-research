#!/usr/bin/env python3
"""Small, dependency-free helpers shared by reviewed file-writing connectors.

The runner remains the only publisher.  Fetchers use this module only to make a
bounded allowlisted request, build the common provenance fields, and write the
two staging files atomically.  Adding it to the publisher-contract fingerprint
means a helper change invalidates every accepted current pointer before reuse.
"""
from __future__ import annotations

import json
import os
import urllib.request
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from connector_http import open_allowed_https, read_bounded_response
from repo_mutation import atomic_write_json


def load_manifest(fetch_file: str) -> dict[str, Any]:
    path = Path(fetch_file).resolve().parent / "connector.json"
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise RuntimeError("connector.json must contain an object")
    return value


def fetch_bytes(
    url: str,
    manifest: dict[str, Any],
    *,
    max_bytes: int,
    timeout: int = 20,
    accept: str | None = None,
) -> bytes:
    if accept not in {None, "*/*", "text/csv"}:
        raise RuntimeError("connector Accept header is outside the reviewed safe values")
    headers = {
        "User-Agent": "NostraResearch/1.0 (+https://github.com/nostra-demus/equity-research)",
        "X-Nostra-Connector": manifest["id"],
    }
    if accept:
        headers["Accept"] = accept
    request = urllib.request.Request(
        url,
        headers=headers,
    )
    with open_allowed_https(request, manifest["host_allowlist"], timeout=timeout) as response:
        if response.status != 200:
            raise RuntimeError(f"HTTP {response.status} from {url}")
        return read_bounded_response(response, max_bytes=max_bytes)


def fetch_bytes_with_query_credential(
    source_url: str,
    manifest: dict[str, Any],
    *,
    query_key: str,
    credential: str,
    max_bytes: int,
    timeout: int = 20,
) -> bytes:
    """Fetch an API that requires query authentication without persisting its secret URL.

    ``source_url`` is the durable credential-free identity. The caller supplies one
    runner-injected secret, and this helper grants only that exact credential-semantic
    query key to the HTTPS boundary. Errors intentionally name the provider rather than
    the request URL because some APIs echo query credentials in request metadata.
    """
    if not isinstance(credential, str) or not credential or credential.strip() != credential:
        raise RuntimeError("connector query credential is missing or malformed")
    from connector_contract import credential_query_key
    if not isinstance(query_key, str) or not credential_query_key(query_key):
        raise RuntimeError("connector query credential key is not credential-semantic")
    parsed = urllib.parse.urlsplit(source_url)
    existing = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
    if any(key == query_key for key, _value in existing):
        raise RuntimeError("durable source URL must not contain the query credential")
    request_url = urllib.parse.urlunsplit((
        parsed.scheme, parsed.netloc, parsed.path,
        urllib.parse.urlencode([*existing, (query_key, credential)]), parsed.fragment,
    ))
    request = urllib.request.Request(
        request_url,
        headers={
            "User-Agent": "NostraResearch/1.0 (+https://github.com/nostra-demus/equity-research)",
            "X-Nostra-Connector": manifest["id"],
        },
    )
    with open_allowed_https(
        request, manifest["host_allowlist"], timeout=timeout,
        credential_query_keys=frozenset({query_key}),
    ) as response:
        if response.status != 200:
            raise RuntimeError(f"HTTP {response.status} from {manifest['provider']}")
        return read_bounded_response(response, max_bytes=max_bytes)


def fetch_bytes_with_header_credential(
    source_url: str,
    manifest: dict[str, Any],
    *,
    header_name: str,
    credential: str,
    max_bytes: int,
    timeout: int = 20,
) -> bytes:
    """Fetch one allowlisted API without putting its header credential in a durable URL."""
    if not isinstance(credential, str) or not credential or credential.strip() != credential:
        raise RuntimeError("connector header credential is missing or malformed")
    if header_name.casefold() != "x-api-key":
        raise RuntimeError("connector header credential name is outside the reviewed safe values")
    request = urllib.request.Request(
        source_url,
        headers={
            "User-Agent": "NostraResearch/1.0 (+https://github.com/nostra-demus/equity-research)",
            "X-Nostra-Connector": manifest["id"],
            header_name: credential,
        },
    )
    with open_allowed_https(request, manifest["host_allowlist"], timeout=timeout) as response:
        if response.status != 200:
            raise RuntimeError(f"HTTP {response.status} from {manifest['provider']}")
        return read_bounded_response(response, max_bytes=max_bytes)


def provenance(
    manifest: dict[str, Any],
    *,
    as_of: str,
    source_url: str,
    note: str,
    source_urls: list[str] | None = None,
) -> dict[str, Any]:
    sidecar: dict[str, Any] = {
        "provider": manifest["provider"],
        "source_type": manifest["source_type"],
        "tier": manifest["tier"],
        "as_of": as_of,
        "received": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source_url": source_url,
        "license": manifest["license"],
        "connector_id": manifest["id"],
        "dataset_id": manifest["dataset_id"],
        "series_id": manifest["series_id"],
        "schema_version": manifest["schema_version"],
        "licensing": manifest["licensing"],
        "note": note,
    }
    if source_urls:
        sidecar["source_urls"] = list(dict.fromkeys(source_urls))
    return sidecar


def publish_pair(
    *,
    data_root: str,
    subject: str,
    provider_slug: str,
    filename: str,
    payload: dict[str, Any],
    sidecar: dict[str, Any],
) -> str:
    directory = os.path.join(data_root, subject, "external", provider_slug)
    path = os.path.join(directory, filename)
    atomic_write_json(path, payload)
    atomic_write_json(path + ".source.json", sidecar)
    return path


def load_json_capture(path: str, *, max_bytes: int) -> dict[str, Any]:
    try:
        with open(path, "rb") as handle:
            raw = handle.read(max_bytes + 1)
    except OSError as error:
        raise RuntimeError(f"cannot read manual capture: {error}") from error
    if len(raw) > max_bytes:
        raise RuntimeError(f"manual capture exceeds the {max_bytes}-byte hard cap")
    try:
        value = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise RuntimeError(f"manual capture is not strict UTF-8 JSON: {error}") from error
    if not isinstance(value, dict):
        raise RuntimeError("manual capture must contain a JSON object")
    return value
