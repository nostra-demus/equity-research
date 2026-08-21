#!/usr/bin/env python3
"""Small fail-closed HTTP client for the cockpit's supervisor publication capability."""
from __future__ import annotations

import http.client
import json
import os
import socket
import stat
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Mapping
from pathlib import Path
from typing import Any


MAX_RESPONSE_BYTES = 1024 * 1024


class SupervisorPublicationError(RuntimeError):
    pass


class _UnixHTTPConnection(http.client.HTTPConnection):
    def __init__(self, socket_path: str, timeout: float) -> None:
        super().__init__("localhost", timeout=timeout)
        self._socket_path = socket_path

    def connect(self) -> None:
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        sock.settimeout(self.timeout)
        try:
            sock.connect(self._socket_path)
        except BaseException:
            sock.close()
            raise
        self.sock = sock


def _validated_endpoint() -> tuple[urllib.parse.ParseResult, str, str | None]:
    endpoint = os.environ.get("NOSTRA_PUBLICATION_ENDPOINT", "")
    token = os.environ.get("NOSTRA_PUBLICATION_TOKEN", "")
    socket_path = os.environ.get("NOSTRA_PUBLICATION_SOCKET") or None
    if not endpoint or not token:
        raise SupervisorPublicationError("no live supervisor publication capability")
    parsed = urllib.parse.urlparse(endpoint)
    if parsed.scheme != "http" or parsed.hostname not in {"127.0.0.1", "::1", "localhost"}:
        raise SupervisorPublicationError("supervisor publication endpoint must be local HTTP")
    if parsed.username or parsed.password or parsed.fragment or parsed.query:
        raise SupervisorPublicationError("supervisor publication endpoint URL is unsafe")
    if parsed.path != "/publication" and socket_path:
        raise SupervisorPublicationError("supervisor publication socket endpoint path is invalid")
    if socket_path:
        candidate = Path(socket_path)
        if not candidate.is_absolute() or candidate.is_symlink():
            raise SupervisorPublicationError("supervisor publication socket path is unsafe")
        try:
            info = candidate.stat()
        except OSError as exc:
            raise SupervisorPublicationError("supervisor publication socket is unavailable") from exc
        if not stat.S_ISSOCK(info.st_mode) or info.st_uid != os.getuid() or info.st_mode & 0o077:
            raise SupervisorPublicationError("supervisor publication socket has unsafe ownership or mode")
        try:
            parent_info = candidate.parent.stat()
        except OSError as exc:
            raise SupervisorPublicationError("supervisor publication socket directory is unavailable") from exc
        if not stat.S_ISDIR(parent_info.st_mode) or parent_info.st_uid != os.getuid() or parent_info.st_mode & 0o077:
            raise SupervisorPublicationError("supervisor publication socket directory has unsafe ownership or mode")
    return parsed, token, socket_path


def post(payload: Mapping[str, Any], *, timeout: float = 120) -> Mapping[str, Any]:
    """POST one bounded request, preferring the exact per-run Unix socket when supplied."""
    parsed, token, socket_path = _validated_endpoint()
    body = json.dumps(dict(payload), separators=(",", ":")).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "Content-Length": str(len(body)),
        "X-Nostra-Publication-Token": token,
        "Connection": "close",
    }
    try:
        if socket_path:
            connection = _UnixHTTPConnection(socket_path, timeout)
            try:
                connection.request("POST", parsed.path or "/publication", body=body, headers=headers)
                response = connection.getresponse()
                raw = response.read(MAX_RESPONSE_BYTES + 1)
                status = response.status
            finally:
                connection.close()
            if status < 200 or status >= 300:
                raise SupervisorPublicationError(
                    f"supervisor rejected publication ({status}): {raw[:1000].decode('utf-8', 'replace')}"
                )
        else:
            request = urllib.request.Request(endpoint_url(parsed), data=body, method="POST", headers=headers)
            try:
                with urllib.request.urlopen(request, timeout=timeout) as response:
                    raw = response.read(MAX_RESPONSE_BYTES + 1)
            except urllib.error.HTTPError as exc:
                detail = exc.read(1000).decode("utf-8", "replace")
                raise SupervisorPublicationError(
                    f"supervisor rejected publication ({exc.code}): {detail}"
                ) from exc
        if len(raw) > MAX_RESPONSE_BYTES:
            raise SupervisorPublicationError("supervisor publication response is too large")
        result = json.loads(raw.decode("utf-8"))
    except SupervisorPublicationError:
        raise
    except (OSError, UnicodeDecodeError, json.JSONDecodeError, http.client.HTTPException) as exc:
        raise SupervisorPublicationError(f"supervisor publication request failed: {exc}") from exc
    if not isinstance(result, Mapping) or result.get("ok") is not True:
        raise SupervisorPublicationError("supervisor returned an invalid publication response")
    return result


def endpoint_url(parsed: urllib.parse.ParseResult) -> str:
    """Re-serialize a validated loopback URL without accepting credentials or fragments."""
    if parsed.username or parsed.password or parsed.fragment or parsed.query:
        raise SupervisorPublicationError("supervisor publication endpoint URL is unsafe")
    return urllib.parse.urlunparse(parsed)
