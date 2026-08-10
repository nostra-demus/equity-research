#!/usr/bin/env python3
"""Shared HTTPS, DNS, redirect, and connect-time boundary for connectors."""
from __future__ import annotations

import http.client
import ipaddress
import socket
import urllib.parse
import urllib.request
from typing import Any

from connector_contract import (
    connector_https_url_host,
    is_public_connector_address,
    resolve_public_hostname,
)


class URLPolicyError(RuntimeError):
    pass


class ResponseBodyError(URLPolicyError):
    """The remote response body could not be consumed safely."""


class ResponseBodyTooLarge(ResponseBodyError):
    """The remote response body exceeded its connector's explicit hard cap."""


def _content_length(response: Any) -> int | None:
    """Return one unambiguous Content-Length, or fail closed on malformed headers."""
    headers = getattr(response, "headers", None) or getattr(response, "hdrs", None)
    if headers is None:
        return None

    get_all = getattr(headers, "get_all", None)
    if callable(get_all):
        values = get_all("Content-Length") or []
    else:
        get = getattr(headers, "get", None)
        value = get("Content-Length") if callable(get) else None
        values = [] if value is None else [value]

    # A combined value ("10, 10") is still more than one field-value.  Direct
    # connector traffic has no reason to tolerate ambiguity at this boundary.
    parts = [part.strip() for value in values for part in str(value).split(",")]
    if not parts:
        return None
    if len(parts) != 1 or not parts[0].isascii() or not parts[0].isdigit():
        raise ResponseBodyError("connector HTTP response has an ambiguous or invalid Content-Length")
    return int(parts[0])


def read_bounded_response(response: Any, *, max_bytes: int) -> bytes:
    """Read a response body without ever accepting more than ``max_bytes``.

    Content-Length is an early rejection aid, not a trust boundary: every body
    is read with bounded ``read(size)`` calls totalling at most ``max_bytes + 1``
    bytes of returned data.  The extra byte detects oversized chunked, missing-
    length, and under-declared responses without an unbounded ``read()``.
    """
    if isinstance(max_bytes, bool) or not isinstance(max_bytes, int) or max_bytes <= 0:
        raise ValueError("max_bytes must be a positive integer")

    declared = _content_length(response)
    if declared is not None and declared > max_bytes:
        raise ResponseBodyTooLarge(
            f"connector HTTP response declares {declared} bytes, exceeding the {max_bytes}-byte hard cap"
        )

    chunks: list[bytes] = []
    received = 0
    read = getattr(response, "read", None)
    if not callable(read):
        raise ResponseBodyError("connector HTTP response has no readable body")

    while received <= max_bytes:
        remaining = max_bytes + 1 - received
        chunk = read(remaining)
        if not isinstance(chunk, (bytes, bytearray, memoryview)):
            raise ResponseBodyError("connector HTTP response returned a non-bytes body chunk")
        if not chunk:
            break
        raw = bytes(chunk)
        # A conforming file-like object returns at most the requested size.  Do
        # not accept a broken or adversarial implementation that violates it.
        if len(raw) > remaining:
            raise ResponseBodyError("connector HTTP response returned more bytes than requested")
        chunks.append(raw)
        received += len(raw)
        if received > max_bytes:
            raise ResponseBodyTooLarge(
                f"connector HTTP response exceeds the {max_bytes}-byte hard cap"
            )

    if declared is not None and received != declared:
        raise ResponseBodyError(
            f"connector HTTP response length mismatch: declared {declared} bytes, received {received}"
        )
    return b"".join(chunks)


class _ResolutionCache:
    """One request-chain's immutable DNS pins, including redirect targets."""

    def __init__(self, host_allowlist: list[str] | tuple[str, ...]):
        self.allowed = frozenset(str(value).lower() for value in host_allowlist)
        self._answers: dict[str, tuple[tuple[Any, ...], ...]] = {}

    def resolve(self, host: str) -> tuple[tuple[Any, ...], ...]:
        normalized = str(host or "").lower()
        if normalized not in self.allowed:
            raise URLPolicyError(f"connector URL host {normalized!r} is outside host_allowlist")
        if normalized not in self._answers:
            try:
                self._answers[normalized] = resolve_public_hostname(normalized, 443)
            except ValueError as exc:
                raise URLPolicyError(f"connector host {normalized!r} failed public DNS policy: {exc}") from exc
        return self._answers[normalized]


def require_allowed_https(
    url: str,
    host_allowlist: list[str] | tuple[str, ...],
    *,
    resolutions: _ResolutionCache | None = None,
) -> str:
    """Validate URL identity and pin its fully-public DNS answer.

    Syntax/allowlist checks deliberately run before DNS so an off-policy URL is
    rejected without querying it.  A successful return always means A/AAAA
    resolution also succeeded and every returned address was globally routable.
    """
    try:
        host = connector_https_url_host(url, host_allowlist)
    except ValueError as exc:
        raise URLPolicyError(f"connector URL violates policy: {exc}") from exc
    (resolutions or _ResolutionCache(host_allowlist)).resolve(host)
    return host


def _normalized_peer_ip(sock: Any) -> str:
    try:
        peer = sock.getpeername()
        raw = str(peer[0]).split("%", 1)[0]
        address = ipaddress.ip_address(raw)
    except Exception as exc:
        raise URLPolicyError(f"could not verify connector HTTPS peer address: {exc}") from exc
    if not is_public_connector_address(address):
        raise URLPolicyError(f"connector HTTPS peer is non-global address {address.compressed!r}")
    return address.compressed


class _PinnedHTTPSConnection(http.client.HTTPSConnection):
    """TLS connection which never re-resolves its allowlisted origin hostname."""

    def __init__(
        self,
        host: str,
        *,
        expected_hostname: str,
        pinned_endpoints: tuple[tuple[Any, ...], ...],
        **kwargs: Any,
    ):
        super().__init__(host, **kwargs)
        if self.host.lower() != expected_hostname or self.port != 443:
            raise URLPolicyError("HTTPS handler origin changed after URL validation")
        self._expected_hostname = expected_hostname
        self._pinned_endpoints = tuple(pinned_endpoints)
        self._pinned_ips = frozenset(
            ipaddress.ip_address(str(endpoint[4][0]).split("%", 1)[0]).compressed
            for endpoint in self._pinned_endpoints
        )
        if not self._pinned_endpoints or not self._pinned_ips:
            raise URLPolicyError("connector HTTPS connection has no pinned public endpoint")

    def _connect_pinned_socket(self):
        last_error: OSError | None = None
        for family, socktype, proto, _canonname, sockaddr in self._pinned_endpoints:
            candidate = socket.socket(family, socktype, proto)
            try:
                if self.timeout is not socket._GLOBAL_DEFAULT_TIMEOUT:  # same contract as create_connection
                    candidate.settimeout(self.timeout)
                if self.source_address:
                    candidate.bind(self.source_address)
                candidate.connect(sockaddr)
                peer = _normalized_peer_ip(candidate)
                if peer not in self._pinned_ips:
                    raise URLPolicyError(
                        f"connector HTTPS peer {peer!r} differs from the pinned DNS answer"
                    )
                candidate.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
                return candidate
            except URLPolicyError:
                candidate.close()
                raise
            except OSError as exc:
                last_error = exc
                candidate.close()
        raise OSError(f"could not connect to any pinned public endpoint: {last_error}")

    def connect(self):
        if self._tunnel_host:
            raise URLPolicyError("connector HTTP proxies/tunnels are disabled at the SSRF boundary")
        raw_socket = self._connect_pinned_socket()
        try:
            # The socket is pinned to an IP, but certificate and SNI validation
            # stay bound to the allowlisted DNS name.
            self.sock = self._context.wrap_socket(
                raw_socket, server_hostname=self._expected_hostname,
            )
            peer = _normalized_peer_ip(self.sock)
            if peer not in self._pinned_ips:
                raise URLPolicyError(
                    f"connector TLS peer {peer!r} differs from the pinned DNS answer"
                )
        except Exception:
            try:
                raw_socket.close()
            finally:
                self.sock = None
            raise


class _PinnedHTTPSHandler(urllib.request.HTTPSHandler):
    def __init__(self, host_allowlist: list[str] | tuple[str, ...], resolutions: _ResolutionCache):
        super().__init__()
        self.host_allowlist = tuple(host_allowlist)
        self.resolutions = resolutions

    def https_open(self, req: Any):
        if req.has_proxy() or getattr(req, "_tunnel_host", None):
            raise URLPolicyError("connector HTTP proxies/tunnels are disabled at the SSRF boundary")
        hostname = require_allowed_https(
            req.full_url, self.host_allowlist, resolutions=self.resolutions,
        )
        endpoints = self.resolutions.resolve(hostname)

        def connection_factory(host: str, **kwargs: Any):
            return _PinnedHTTPSConnection(
                host,
                expected_hostname=hostname,
                pinned_endpoints=endpoints,
                **kwargs,
            )

        return self.do_open(
            connection_factory, req, context=self._context, check_hostname=self._check_hostname,
        )


class AllowlistRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Resolve/pin an allowed redirect before urllib can send its next request."""

    def __init__(
        self,
        host_allowlist: list[str] | tuple[str, ...],
        resolutions: _ResolutionCache | None = None,
    ):
        super().__init__()
        self.host_allowlist = tuple(host_allowlist)
        self.resolutions = resolutions or _ResolutionCache(host_allowlist)

    def redirect_request(self, req: Any, fp: Any, code: int, msg: str, headers: Any, newurl: str):
        new_host = require_allowed_https(
            newurl, self.host_allowlist, resolutions=self.resolutions,
        )
        old_host = require_allowed_https(
            req.full_url, self.host_allowlist, resolutions=self.resolutions,
        )
        redirected = super().redirect_request(req, fp, code, msg, headers, newurl)
        if redirected is not None and new_host != old_host:
            # Both hosts may be lawful sources for one connector, but that is
            # not permission to forward one host's bearer/API credential to
            # the other.  A credentialed cross-host redirect therefore
            # continues only without secret-bearing headers and will fail
            # closed if the destination actually requires them.
            safe = {"accept", "accept-language", "user-agent"}
            for name in list(redirected.headers):
                if name.lower() not in safe:
                    redirected.remove_header(name)
            for name in list(redirected.unredirected_hdrs):
                if name.lower() not in safe:
                    redirected.remove_header(name)
        return redirected


def open_allowed_https(
    request: urllib.request.Request | str,
    host_allowlist: list[str] | tuple[str, ...],
    *,
    timeout: int = 20,
):
    initial_url = request.full_url if isinstance(request, urllib.request.Request) else str(request)
    if isinstance(request, urllib.request.Request) and (
        request.has_proxy() or getattr(request, "_tunnel_host", None)
    ):
        raise URLPolicyError("connector HTTP proxies/tunnels are disabled at the SSRF boundary")
    resolutions = _ResolutionCache(host_allowlist)
    require_allowed_https(initial_url, host_allowlist, resolutions=resolutions)
    # Disable environment proxies explicitly.  A proxy would re-resolve the
    # hostname and make the connect-time IP pin unenforceable.
    active = urllib.request.build_opener(
        urllib.request.ProxyHandler({}),
        AllowlistRedirectHandler(host_allowlist, resolutions),
        _PinnedHTTPSHandler(host_allowlist, resolutions),
    )
    response = active.open(request, timeout=timeout)
    try:
        require_allowed_https(response.geturl(), host_allowlist, resolutions=resolutions)
    except Exception:
        try:
            response.close()
        finally:
            raise
    return response
