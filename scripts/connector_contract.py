#!/usr/bin/env python3
"""Canonical connector-manifest and staged-output validation.

The connector runner, point-in-time reader, and tests all use this module.  It
has no third-party dependencies so the launchd job can run in the system
Python. Production discovery accepts only the explicit version-2
identity/release/history contract. Version-1 normalization exists solely for
explicit historical tests; it is not a migration/runtime path.
"""
from __future__ import annotations

import errno as _errno
import hashlib
import json
import calendar
import ipaddress
import math
import os
import posixpath
import re
import socket
import stat
import time as _time
from datetime import date, datetime, timedelta, timezone
from typing import Any
from urllib.parse import parse_qsl, unquote, urlparse
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from canonical_json import canonical_json_bytes as _cross_runtime_canonical_json_bytes


# ---------- stable reads on a cloud-synced tree ----------
# Connector storage lives at data/_connectors/** — INSIDE the same `data/` tree that is a Google
# Drive for Desktop mirror. Drive (and macOS, via `com.apple.lastuseddate#PS`) writes extended
# attributes onto those files independently of their content, and an xattr write bumps st_ctime_ns
# and nothing else: size, mtime and the inode identity are untouched, the bytes are identical.
#
# A hardened reader that folds st_ctime_ns into a before/after identity tuple therefore rejects
# perfectly good files whenever a sync pass lands inside its read window. That is exactly what took
# out a whole 87-file evidence pool in the extractor (see the matching note in
# .claude/tools/extract_pool.py). These helpers are the shared, canonical treatment so the connector
# readers cannot drift back into the same defect.
#
# What still has to hold — the bytes are a complete, consistent snapshot of the pinned inode — is
# carried by st_size + st_mtime_ns + (dev, ino, nlink): a content write, even an in-place same-size
# byte flip, always bumps mtime. A ctime-ONLY delta is re-verified by re-reading the same pinned
# descriptor and comparing digests, which PROVES the bytes rather than inferring it from a clock.
#
# KNOWN RESIDUAL: a same-uid writer who rewrites same-length bytes mid-read and then restores
# st_mtime_ns to the nanosecond with utimensat() is no longer detectable by metadata — ctime was the
# only stamp that cannot be rolled back, and it is the one a sync client makes unusable. Every other
# case still fails closed, and connector objects are content-addressed: their callers verify the
# returned bytes against the expected sha256, which is the real defence for this class.
def content_identity(info: os.stat_result) -> tuple[int, int, int, int, int]:
    """Stat fields that move if and only if the file's BYTES can have moved (ctime excluded)."""
    return (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns, info.st_nlink)


# Errors a network/cloud-backed filesystem raises transiently while hydrating or re-syncing a file.
# Google Drive hydrating a dehydrated (cloud-only) file surfaces as ETIMEDOUT — "[Errno 60]".
TRANSIENT_READ_ERRNOS = frozenset(
    getattr(_errno, name) for name in
    ("ETIMEDOUT", "EIO", "EINTR", "EAGAIN", "EWOULDBLOCK", "EBUSY", "ENOENT", "ESTALE",
     "ENXIO", "EDEADLK", "ENOTCONN", "EHOSTDOWN")
    if hasattr(_errno, name)
)
STABLE_READ_ATTEMPTS = max(1, int(os.environ.get("CONNECTOR_STABLE_READ_ATTEMPTS") or 4))
STABLE_READ_BACKOFF_S = max(0.0, float(os.environ.get("CONNECTOR_STABLE_READ_BACKOFF_S") or 0.15))
STABLE_READ_BACKOFF_MAX_S = 2.0


def reread_digest_matches(fd: int, size: int, expected_digest: str) -> bool:
    """Re-read the SAME pinned descriptor and confirm the bytes still hash to `expected_digest`.

    Called only when a read finished with its content identity intact but ctime moved. Reading
    through the already-open fd cannot be redirected by a path swap, so this compares the identical
    inode just parsed: equal digests mean a metadata-only touch, not a content change.
    """
    os.lseek(fd, 0, os.SEEK_SET)
    digest = hashlib.sha256()
    remaining = size
    while remaining:
        chunk = os.read(fd, min(remaining, 1024 * 1024))
        if not chunk:
            return False
        digest.update(chunk)
        remaining -= len(chunk)
    return not os.read(fd, 1) and digest.hexdigest() == expected_digest


def stable_read_backoff(attempt: int) -> None:
    """Sleep between stable-read attempts (exponential, capped)."""
    if STABLE_READ_BACKOFF_S:
        _time.sleep(min(STABLE_READ_BACKOFF_S * (2 ** attempt), STABLE_READ_BACKOFF_MAX_S))


ID_RE = re.compile(r"^[a-z0-9][a-z0-9._-]*$")
CONNECTOR_ID_RE = re.compile(r"^[a-z0-9][a-z0-9_-]*$")
SUBJECT_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
ENV_RE = re.compile(r"^CONNECTOR_[A-Z0-9_]+$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
DATETIME_RE = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$")
OUTPUT_PATH_RE = re.compile(
    r"^data/<SUBJECT>/external/(?:[a-z0-9][a-z0-9._-]*/)*"
    r"[a-z0-9][a-z0-9._-]*<as_of>[a-z0-9._-]*\.json$"
)
METHODOLOGY_ONLY_FIELD = "methodology_only"
METHODOLOGY_ONLY_ERROR = "methodology-only WILTW source excluded from runtime evidence"
CALENDAR_CADENCE_MONTHS = {"monthly": 1, "quarterly": 3, "semiannual": 6, "annual": 12}
CADENCES = {
    "twelve_hourly", "daily", "weekly", *CALENDAR_CADENCE_MONTHS, "event_driven",
}
ACQUISITIONS = {"official_api", "free_key_api", "paid_api", "scrape", "manual"}
TIER_CEILING = {
    "alt_data_panel": 5, "vendor_export": 5, "paid_api": 5, "official_data": 5,
    "broker_research": 7, "expert_call": 9, "channel_check": 9,
    "management_meeting": 9, "external_other": 9,
}
SCHEMA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frameworks", "connector.schema.json")
NON_PUBLIC_IPV6_NETWORKS = tuple(
    ipaddress.ip_network(value) for value in (
        "64:ff9b::/96", "64:ff9b:1::/48", "2002::/16",
        "fec0::/10", "3fff::/20", "5f00::/16",
    )
)
ALLOCATED_GLOBAL_UNICAST_IPV6 = ipaddress.ip_network("2000::/3")
MAX_CONNECTOR_URL_LENGTH = 2_000
CREDENTIAL_QUERY_SUFFIXES = (
    "token", "key", "secret", "password", "passwd", "credential",
    "authorization", "signature", "session", "sessionid", "cookie", "jwt",
    "bearer", "ticket", "oauthcode", "authorizationcode", "functionkey",
    "appid", "sas", "auth",
)
PUBLISHER_OWNED_SIDECAR_FIELDS = {
    "vintage_id", "content_sha256", "retrieved_at", "revision_of",
    "connector_fingerprint", "publisher_contract_fingerprint", "connector_commit",
    "acquired_via", "manual_input", "history_kind", "blob_path", "legacy_path",
    "committed_count", "committed_head", "commit_protocol_version", "commit_receipt_path",
    # These are frozen from the reviewed manifest, never asserted by a child
    # transform.  Letting a sidecar preserve a second contradictory copy makes
    # provenance self-inconsistent even when the canonical top level is right.
    "provider_priority", "fallback_for", "acquisition", "authority_class",
    "release", "output_schema", "units", "minimum_history",
}


def _methodology_words(value: Any) -> str:
    """Normalize a source identity while preserving whole-word boundaries."""
    try:
        value = unquote(str(value or ""))
    except Exception:
        value = str(value or "")
    try:
        import unicodedata
        value = unicodedata.normalize("NFKC", value)
    except Exception:
        pass
    return re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()


def _wiltw_identity_reason(value: Any, label: str) -> str | None:
    words = _methodology_words(value)
    if not words:
        return None
    if "wiltw" in words.split() or "what i learned this week" in words:
        return f"WILTW identity found in {label}"
    raw = unquote(str(value or "")).casefold()
    if re.search(r"(?:^|[^a-z0-9])wiltw(?=(?:19|20)\d{2}|[^a-z]|$)", raw):
        return f"WILTW filename family found in {label}"
    return None


def methodology_only_source_reason(name: Any, text: Any = "", provenance: Any = None) -> str | None:
    """Identify the WILTW methodology source without banning research generally."""
    if isinstance(provenance, dict):
        marker = provenance.get(METHODOLOGY_ONLY_FIELD)
        if marker is True or (isinstance(marker, str) and marker.strip().casefold() == "true"):
            return "explicit methodology_only provenance marker"

    candidates: list[tuple[str, Any]] = [("filename", name), ("content", text)]
    if isinstance(provenance, dict):
        for key in ("origin", "routed_from", "source_url", "title", "document_title"):
            value = provenance.get(key)
            if isinstance(value, str):
                candidates.append((f"provenance {key}", value))
        urls = provenance.get("source_urls")
        if isinstance(urls, list):
            candidates.extend(
                ("provenance source_urls", value) for value in urls if isinstance(value, str)
            )
    for label, value in candidates:
        reason = _wiltw_identity_reason(value, label)
        if reason:
            return reason
    return None


def methodology_only_nested_reason(value: Any, label: str = "runtime input") -> str | None:
    """Scan every nested JSON string/marker before canonical publication.

    Connector payloads often carry source identity below a rows/observations
    array.  Restricting the guard to top-level URL/title fields would let a
    renamed report or one of its verbatim assertions cross the canonical
    boundary.  The identity match remains narrow (WILTW / expanded title), so
    lawful primary-provider observations and ordinary research stay valid.
    """
    if isinstance(value, dict):
        marker = value.get(METHODOLOGY_ONLY_FIELD)
        if marker is True or (isinstance(marker, str) and marker.strip().casefold() == "true"):
            return f"explicit methodology_only marker at {label}.{METHODOLOGY_ONLY_FIELD}"
        for key, child in value.items():
            reason = methodology_only_nested_reason(child, f"{label}.{key}")
            if reason:
                return reason
        return None
    if isinstance(value, list):
        for index, child in enumerate(value):
            reason = methodology_only_nested_reason(child, f"{label}[{index}]")
            if reason:
                return reason
        return None
    if isinstance(value, str):
        return _wiltw_identity_reason(value, label)
    return None


def advance_release_period(
    observed: date, cadence: str, active_months: list[int] | None = None,
) -> date | None:
    """Advance an observation date by its declared calendar period.

    Month-based cadences preserve the day of month where possible and cap at
    the target month's end (for example, Jan 31 quarterly -> Apr 30).  The
    caller handles retrieval-clock cadences separately.
    """
    def advance_once(value: date) -> date | None:
        months = CALENDAR_CADENCE_MONTHS.get(cadence)
        if months is not None:
            month_index = value.year * 12 + value.month - 1 + months
            year, zero_month = divmod(month_index, 12)
            month = zero_month + 1
            day = min(value.day, calendar.monthrange(year, month)[1])
            return date(year, month, day)
        if cadence == "weekly":
            return value + timedelta(days=7)
        if cadence == "daily":
            return value + timedelta(days=1)
        return None

    candidate = advance_once(observed)
    if candidate is None or active_months is None:
        return candidate
    if (
        not isinstance(active_months, list) or not active_months
        or any(isinstance(month, bool) or not isinstance(month, int) or not 1 <= month <= 12 for month in active_months)
    ):
        raise ValueError("active_months must contain calendar months 1 through 12")
    allowed = set(active_months)
    for _ in range(370):
        if candidate.month in allowed:
            return candidate
        candidate = advance_once(candidate)
        if candidate is None:
            return None
    raise ValueError("active_months could not produce a bounded next release")


def release_contract_window(
    release: dict[str, Any], observed: date, retrieved_at: str | datetime | None = None,
) -> tuple[datetime, datetime]:
    """Return one manifest release's next due instant and grace deadline."""
    zone = ZoneInfo(str(release["timezone"]))
    cadence = release["cadence"]
    base = datetime(observed.year, observed.month, observed.day, tzinfo=zone)
    retrieved = None
    if retrieved_at:
        try:
            parsed = (
                retrieved_at if isinstance(retrieved_at, datetime)
                else datetime.fromisoformat(str(retrieved_at).replace("Z", "+00:00"))
            )
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            retrieved = parsed.astimezone(zone)
        except (TypeError, ValueError):
            retrieved = None
    next_date = advance_release_period(observed, cadence, release.get("active_months"))
    if next_date is not None:
        next_period = datetime(next_date.year, next_date.month, next_date.day, tzinfo=zone)
    elif cadence == "twelve_hourly":
        next_period = (retrieved or base) + timedelta(hours=12)
    elif cadence == "event_driven":
        next_period = (retrieved or base) + timedelta(days=float(release["grace_days"]))
        return next_period, next_period
    else:
        raise ValueError(f"unsupported connector release cadence: {cadence!r}")
    due = next_period + timedelta(days=float(release["expected_lag_days"]))
    return due, due + timedelta(days=float(release["grace_days"]))


def _canonical_schema() -> dict[str, Any]:
    """Load the checked-in schema used by every v2 validation call."""
    with open(SCHEMA_PATH, encoding="utf-8") as fh:
        schema = json.load(fh)
    if not isinstance(schema, dict) or not isinstance(schema.get("required"), list):
        raise RuntimeError(f"canonical connector schema is malformed: {SCHEMA_PATH}")
    return schema


def _finite_positive(value: Any) -> bool:
    return not isinstance(value, bool) and isinstance(value, (int, float)) and math.isfinite(float(value)) and value > 0


def _history_schema_node(schema: Any, dotted: str | None) -> Any:
    """Resolve a payload-accessible history path without traversing arrays.

    ``minimum_history.path`` is evaluated against the payload by following
    object keys.  Its schema counterpart must therefore follow the same shape:
    an array encountered before the final component is not a valid dotted
    path, while the final node must itself be the observation array when more
    than one observation is required.
    """
    value = schema
    if not dotted:
        return value
    for part in dotted.split("."):
        if not isinstance(value, dict) or part not in value:
            return None
        value = value[part]
    return value


def _canonical_output_path(value: Any) -> bool:
    """Admit one collision-safe POSIX projection spelling.

    Coverage ownership is compared before a filename is materialized.  The
    declaration must therefore already equal its filesystem-normalized form;
    aliases such as ``a/./b``, empty segments, backslashes, encoded separators,
    or case-only variants must never reach that comparison.
    """
    if not isinstance(value, str) or not OUTPUT_PATH_RE.fullmatch(value):
        return False
    if "\\" in value or "%" in value or posixpath.normpath(value) != value:
        return False
    parts = value.split("/")
    return all(part not in {"", ".", ".."} for part in parts)


def _public_dns_hostname(value: str) -> bool:
    """Validate a public-DNS *name* without performing network I/O.

    Registry discovery must remain deterministic/offline.  Automatic fetches
    separately call :func:`resolve_public_hostname` immediately before opening
    a pinned connection, which is where DNS aliases and address scope can be
    validated without making manifest parsing network-dependent.
    """
    host = value.lower()
    if host == "localhost" or host.endswith(".localhost") or host.endswith(".local") or "." not in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return bool(re.fullmatch(
        r"(?=.{1,253}$)(?=.*[a-z])(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+"
        r"[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?",
        host,
    ))


def credential_query_key(value: Any) -> bool:
    """Match credential families independent of provider spelling conventions."""
    compact = re.sub(r"[^a-z0-9]+", "", str(value or "").casefold())
    if not compact:
        return False
    if compact in {
        "key", "sig", "token", "secret", "auth", "oauth", "jwt", "cookie",
        "session", "bearer", "sas",
    }:
        return True
    return compact.endswith(CREDENTIAL_QUERY_SUFFIXES)


def connector_https_url_host(
    raw: Any, host_allowlist: list[str] | tuple[str, ...] | None = None,
    *, credential_query_keys: frozenset[str] = frozenset(),
) -> str:
    """Validate one durable/request URL through the shared Python boundary.

    The raw form is intentionally rejected, rather than silently normalized,
    when whitespace, fragments, excessive length, or credential-semantic query
    keys are present. This keeps persisted provenance and actual HTTP requests
    under exactly the same rule.
    """
    if (not isinstance(raw, str) or not raw or raw.strip() != raw
            or len(raw) > MAX_CONNECTOR_URL_LENGTH
            or any(ord(char) < 0x20 or ord(char) == 0x7f for char in raw)):
        raise ValueError("connector URL has whitespace, control bytes, or invalid length")
    try:
        parsed = urlparse(raw)
        host = (parsed.hostname or "").lower()
        port = parsed.port
    except (TypeError, ValueError) as exc:
        raise ValueError("connector URL is malformed") from exc
    if parsed.scheme.lower() != "https" or not host or parsed.username or parsed.password:
        raise ValueError("connector URL must be absolute HTTPS and credential-free")
    if port not in (None, 443):
        raise ValueError("connector URL must use the standard HTTPS origin port")
    if parsed.fragment:
        raise ValueError("connector URL must not contain a fragment")
    if not _public_dns_hostname(host):
        raise ValueError("connector URL host must be a public-DNS hostname")
    try:
        query_keys = [key for key, _value in parse_qsl(
            parsed.query, keep_blank_values=True, strict_parsing=False,
        )]
    except ValueError as exc:
        raise ValueError("connector URL query is malformed") from exc
    if any(credential_query_key(key) and key not in credential_query_keys for key in query_keys):
        raise ValueError("connector URL query contains a credential-semantic key")
    if any(key in credential_query_keys and not credential_query_key(key) for key in query_keys):
        raise ValueError("declared credential query key is not credential-semantic")
    if host_allowlist is not None:
        allowed = {str(value).lower() for value in host_allowlist}
        if host not in allowed:
            raise ValueError(f"connector URL host {host!r} is outside host_allowlist")
    return host


def no_symlink_path(data_root: str, candidate: str) -> str | None:
    """Return a lexical in-root path only when every existing component is real.

    ``realpath`` containment alone is insufficient: an attacker can point a
    canonical lane or projection parent at another directory *inside* the data
    root, changing the declared identity while still passing containment.
    """
    root = os.path.realpath(os.path.abspath(data_root))
    path = os.path.abspath(candidate)
    try:
        if os.path.commonpath([root, path]) != root:
            return None
    except ValueError:
        return None
    cursor = root
    relative = os.path.relpath(path, root)
    if relative == ".":
        return root
    for component in relative.split(os.sep):
        if component in {"", ".", ".."}:
            return None
        parent = cursor
        cursor = os.path.join(parent, component)
        try:
            entries = os.listdir(parent)
        except FileNotFoundError:
            # Once a lexical ancestor does not exist, all remaining children
            # are new names.  Creation still happens beneath the already
            # checked real prefix.
            continue
        except OSError:
            return None
        if component not in entries:
            # On case-insensitive or normalization-insensitive filesystems,
            # lexists/realpath may accept a caller spelling that is not the
            # stored directory entry.  Reject that alias.  Also reject a
            # case-fold collision deterministically on case-sensitive CI so a
            # canonical lane can never fork by platform.
            if (os.path.lexists(cursor)
                    or any(entry.casefold() == component.casefold() for entry in entries)):
                return None
            continue
        try:
            info = os.lstat(cursor)
        except OSError:
            return None
        if stat.S_ISLNK(info.st_mode):
            return None
    # Existing aliases are already rejected component-by-component. This final
    # equality also catches platform-level redirection not surfaced by islink.
    if os.path.lexists(path) and os.path.realpath(path) != path:
        return None
    return path


def publisher_owned_sidecar_fields(sidecar: Any) -> list[str]:
    """Return child-supplied fields whose values only the publisher may derive."""
    if not isinstance(sidecar, dict):
        return []
    forbidden: list[str] = []
    for key in sidecar:
        text = str(key)
        compact = re.sub(r"[^a-z0-9]+", "", text.casefold())
        hash_alias = (compact in {"hash", "sha256", "checksum", "digest"}
                      or compact.endswith(("sha256", "contenthash", "contentdigest", "checksum")))
        if text in PUBLISHER_OWNED_SIDECAR_FIELDS or hash_alias:
            forbidden.append(text)
    return sorted(forbidden)


def is_public_connector_address(value: Any) -> bool:
    """Return whether an address is safe for automatic connector egress.

    ``ipaddress.is_global`` follows the address registry bundled with the host
    Python.  Older macOS runtimes still report deprecated site-local
    ``fec0::/10`` and newer documentation/reserved allocations ``3fff::/20``
    and ``5f00::/16`` as global. Translation/local-use prefixes and 6to4 can
    embed private IPv4 destinations while still appearing globally routable.
    Keep the connector boundary independent of
    that runtime lag and in parity with the TypeScript dispatcher.
    """
    try:
        address = value if isinstance(value, (ipaddress.IPv4Address, ipaddress.IPv6Address)) \
            else ipaddress.ip_address(str(value).split("%", 1)[0])
    except ValueError:
        return False
    if not address.is_global:
        return False
    if isinstance(address, ipaddress.IPv6Address):
        # ``is_global`` is broader than allocated public unicast on some Python
        # releases: for example ::2, ::127.0.0.1, and 4000::1 may all report
        # global even though they are reserved/unallocated.  Automatic egress
        # accepts only the IANA global-unicast allocation, then applies the
        # stricter special-purpose exclusions above.
        if address not in ALLOCATED_GLOBAL_UNICAST_IPV6:
            return False
        if any(address in network for network in NON_PUBLIC_IPV6_NETWORKS):
            return False
    return True


def resolve_public_hostname(host: str, port: int = 443) -> tuple[tuple[Any, ...], ...]:
    """Resolve one hostname and return only a fully-public A/AAAA endpoint set.

    ``getaddrinfo`` follows CNAME/alias chains.  The whole answer is rejected if
    *any* A or AAAA result is loopback, private, link-local, reserved, multicast,
    unspecified, or otherwise non-global.  Rejecting mixed answers matters: an
    attacker must not be able to publish one harmless public address alongside
    an internal address and wait for the client's connection fallback order.

    Returned ``getaddrinfo`` tuples are the immutable inputs used by the HTTP
    layer's socket connection.  It must not resolve ``host`` again between this
    check and ``connect`` (the DNS-rebinding boundary).
    """
    normalized = str(host or "").strip().lower()
    if normalized != host or not _public_dns_hostname(normalized):
        raise ValueError(f"host {host!r} is not a valid public-DNS hostname")
    if isinstance(port, bool) or not isinstance(port, int) or port != 443:
        raise ValueError("automatic connector resolution requires HTTPS port 443")
    try:
        answers = socket.getaddrinfo(
            normalized, port, socket.AF_UNSPEC, socket.SOCK_STREAM, socket.IPPROTO_TCP,
        )
    except (socket.gaierror, OSError) as exc:
        raise ValueError(f"host {normalized!r} did not resolve: {exc}") from exc
    if not answers:
        raise ValueError(f"host {normalized!r} returned no A/AAAA addresses")

    accepted: list[tuple[Any, ...]] = []
    seen: set[tuple[Any, ...]] = set()
    for answer in answers:
        if not isinstance(answer, tuple) or len(answer) != 5:
            raise ValueError(f"host {normalized!r} returned a malformed DNS endpoint")
        family, socktype, proto, canonname, sockaddr = answer
        if family not in (socket.AF_INET, socket.AF_INET6) or socktype != socket.SOCK_STREAM:
            raise ValueError(f"host {normalized!r} returned a non-A/AAAA stream endpoint")
        if not isinstance(sockaddr, tuple) or len(sockaddr) < 2:
            raise ValueError(f"host {normalized!r} returned a malformed DNS socket address")
        raw_ip = str(sockaddr[0]).split("%", 1)[0]
        try:
            parsed_ip = ipaddress.ip_address(raw_ip)
        except ValueError as exc:
            raise ValueError(f"host {normalized!r} returned a non-IP DNS endpoint") from exc
        if not is_public_connector_address(parsed_ip):
            raise ValueError(
                f"host {normalized!r} resolved to non-global address {parsed_ip.compressed!r}"
            )
        # Normalize the IP string while preserving IPv6 flow/scope tuple fields.
        normalized_sockaddr = (parsed_ip.compressed, *sockaddr[1:])
        endpoint = (family, socktype, proto, canonname, normalized_sockaddr)
        key = (family, socktype, proto, normalized_sockaddr)
        if key not in seen:
            seen.add(key)
            accepted.append(endpoint)
    if not accepted:
        raise ValueError(f"host {normalized!r} returned no usable public A/AAAA addresses")
    return tuple(accepted)


def _validate_json_schema(value: Any, schema: Any, where: str = "$") -> list[str]:
    """Dependency-free validator for every keyword used by connector.schema.json."""
    if not isinstance(schema, dict):
        return []
    errors: list[str] = []
    all_of = schema.get("allOf")
    if isinstance(all_of, list):
        for branch in all_of:
            errors.extend(_validate_json_schema(value, branch, where))
    condition = schema.get("if")
    if isinstance(condition, dict):
        matched = not _validate_json_schema(value, condition, where)
        selected = schema.get("then") if matched else schema.get("else")
        if isinstance(selected, dict):
            errors.extend(_validate_json_schema(value, selected, where))
    if "const" in schema and value != schema["const"]:
        errors.append(f"{where} must equal {schema['const']!r}")
    if "enum" in schema and value not in schema["enum"]:
        errors.append(f"{where} is outside {schema['enum']!r}")
    kind = schema.get("type")
    type_ok = True
    if kind == "object": type_ok = isinstance(value, dict)
    elif kind == "array": type_ok = isinstance(value, list)
    elif kind == "string": type_ok = isinstance(value, str)
    elif kind == "integer": type_ok = isinstance(value, int) and not isinstance(value, bool)
    elif kind == "number": type_ok = isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(float(value))
    if kind and not type_ok:
        return [f"{where} must be {kind}"]
    if isinstance(value, str):
        if len(value) < int(schema.get("minLength", 0)):
            errors.append(f"{where} is shorter than minLength")
        if isinstance(schema.get("pattern"), str) and re.fullmatch(schema["pattern"], value) is None:
            errors.append(f"{where} does not match {schema['pattern']!r}")
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if "minimum" in schema and value < schema["minimum"]:
            errors.append(f"{where} is below minimum {schema['minimum']}")
        if "exclusiveMinimum" in schema and value <= schema["exclusiveMinimum"]:
            errors.append(f"{where} must be > {schema['exclusiveMinimum']}")
    if isinstance(value, list):
        if len(value) < int(schema.get("minItems", 0)):
            errors.append(f"{where} has fewer than minItems")
        if schema.get("uniqueItems"):
            fingerprints = [json.dumps(item, sort_keys=True, ensure_ascii=False) for item in value]
            if len(set(fingerprints)) != len(fingerprints):
                errors.append(f"{where} must contain unique items")
        if isinstance(schema.get("items"), dict):
            for index, item in enumerate(value):
                errors.extend(_validate_json_schema(item, schema["items"], f"{where}[{index}]"))
    if isinstance(value, dict):
        required = schema.get("required", [])
        for key in required if isinstance(required, list) else []:
            if key not in value:
                errors.append(f"{where}.{key} is required")
        prop_names = schema.get("propertyNames")
        if isinstance(prop_names, dict):
            for key in value:
                errors.extend(_validate_json_schema(key, prop_names, f"{where} key {key!r}"))
        properties = schema.get("properties") if isinstance(schema.get("properties"), dict) else {}
        for key, child in value.items():
            if key in properties:
                errors.extend(_validate_json_schema(child, properties[key], f"{where}.{key}"))
            elif schema.get("additionalProperties") is False:
                errors.append(f"{where}.{key} is not allowed")
            elif isinstance(schema.get("additionalProperties"), dict):
                errors.extend(_validate_json_schema(child, schema["additionalProperties"], f"{where}.{key}"))
    return errors


def normalise_manifest(raw: dict[str, Any]) -> dict[str, Any]:
    """Return one operational shape without mutating ``raw``.

    Legacy manifests receive namespaced identities and their flat cadence/SLA
    fields are treated as the release contract.  That keeps zero-touch
    discovery working while ensuring two old connectors can never collide with
    a real v2 semantic series by accident.
    """
    out = dict(raw)
    version = raw.get("manifest_version", 1)
    out["manifest_version"] = version
    out["schema_version"] = raw.get("schema_version", 1)
    cid = raw.get("id", "")
    out["series"] = raw.get("series") or cid
    out["provider"] = raw.get("provider") or "legacy"
    out["license"] = raw.get("license") or "unspecified"
    out["licensing"] = raw.get("licensing") if isinstance(raw.get("licensing"), dict) else {
        "access": "unknown", "use": "unavailable", "redistribution": "unknown", "terms_url": "",
    }
    out["acquisition"] = raw.get("acquisition") or "manual"
    out["source_type"] = raw.get("source_type") or "external_other"
    out["tier"] = raw.get("tier", 9)
    out["satisfies"] = raw.get("satisfies") if isinstance(raw.get("satisfies"), list) else []
    out["output_schema"] = raw.get("output_schema") if raw.get("output_schema") is not None else {}
    out["units"] = raw.get("units") if isinstance(raw.get("units"), dict) else {}
    out["dataset_id"] = raw.get("dataset_id") or f"legacy.{cid}"
    out["series_id"] = raw.get("series_id") or f"legacy.{cid}"
    out["authority_class"] = raw.get("authority_class", "other")
    # `fallback_priority` was used by an early prototype.  Read it only as a
    # legacy alias; v2 has one canonical ordering field: provider_priority.
    out["provider_priority"] = raw.get("provider_priority", raw.get("fallback_priority", 100))
    release = raw.get("release") if isinstance(raw.get("release"), dict) else {}
    if version == 2:
        out["release"] = dict(release)
        out["cadence"] = release.get("cadence")
        out.pop("staleness_sla_days", None)
    else:
        out["cadence"] = raw.get("cadence") or "daily"
        out["staleness_sla_days"] = raw.get("staleness_sla_days")
        out["release"] = {
            "cadence": out["cadence"], "revision_policy": "revisable", "timezone": "UTC",
            "expected_lag_days": 0, "grace_days": raw.get("staleness_sla_days", 0),
        }
    mh = raw.get("minimum_history") if isinstance(raw.get("minimum_history"), dict) else {}
    out["minimum_history"] = {
        "observations": mh.get("observations", 1),
        **({"path": mh["path"]} if "path" in mh else {}),
    }
    out["fallback_for"] = raw.get("fallback_for")
    out["credential_env"] = raw.get("credential_env") if isinstance(raw.get("credential_env"), list) else []
    out["manual_ingest"] = raw.get("manual_ingest") if isinstance(raw.get("manual_ingest"), dict) else None
    return out


def validate_manifest(dirname: str, connector_dir: str, raw: Any) -> list[str]:
    """Validate a manifest.  Returns every defect; an empty list means valid."""
    if not isinstance(raw, dict):
        return ["manifest is not an object"]
    m = normalise_manifest(raw)
    errors: list[str] = []
    if m.get("id") != dirname or not isinstance(m.get("id"), str) or not CONNECTOR_ID_RE.fullmatch(m["id"]):
        errors.append(f"id {m.get('id')!r} must be a safe slug matching directory name {dirname!r}")
    version = m.get("manifest_version")
    if isinstance(version, bool) or not isinstance(version, int) or version not in (1, 2):
        errors.append("manifest_version must be 1 or 2")
    if version == 2:
        # Required fields come from the checked-in JSON Schema rather than a
        # second hand-maintained list.  The runner therefore exercises the
        # canonical artifact on every discovery sweep.
        for field in _canonical_schema()["required"]:
            if field not in raw:
                errors.append(f"v2 manifest missing {field}")
        errors.extend(f"canonical schema: {error}" for error in _validate_json_schema(raw, _canonical_schema()))
    is_v2 = version == 2
    if is_v2:
        try:
            canonical_json_bytes(m)
        except (TypeError, ValueError) as exc:
            errors.append(f"v2 manifest is outside the cross-runtime canonical JSON domain: {exc}")
    if isinstance(m.get("schema_version"), bool) or not isinstance(m.get("schema_version"), int) or m["schema_version"] < 1:
        errors.append("schema_version must be an integer >= 1")
    for field in ("dataset_id", "series_id"):
        value = m.get(field)
        if not isinstance(value, str) or not ID_RE.fullmatch(value):
            errors.append(f"{field} {value!r} must be a stable lowercase id")
    for field in ("series", "provider", "license"):
        if not isinstance(m.get(field), str) or not m[field].strip():
            errors.append(f"{field} must be a non-empty string")
    authority_enum = set(_canonical_schema()["properties"]["authority_class"]["enum"])
    if is_v2 and m.get("authority_class") not in authority_enum:
        errors.append(f"authority_class {m.get('authority_class')!r} is outside the schema enum")
    provider_priority = m.get("provider_priority")
    if isinstance(provider_priority, bool) or not isinstance(provider_priority, int) or provider_priority < 1:
        errors.append("provider_priority must be an integer >= 1")
    subjects = m.get("subjects")
    if not isinstance(subjects, list) or not subjects or not all(
        isinstance(s, str) and SUBJECT_RE.fullmatch(s) and ".." not in s and s == s.upper()
        for s in subjects
    ):
        errors.append("subjects must be a non-empty list of uppercase safe pool identifiers")
    elif len({subject.casefold() for subject in subjects}) != len(subjects):
        errors.append("subjects must not contain case-insensitive duplicates")
    satisfies = m.get("satisfies")
    if not isinstance(satisfies, list) or not all(isinstance(s, str) and ID_RE.fullmatch(s) for s in satisfies):
        errors.append("satisfies must be a list of stable ids")
    if is_v2 and m.get("acquisition") not in ACQUISITIONS:
        errors.append(f"acquisition {m.get('acquisition')!r} is outside the schema enum")
    source_types = set(_canonical_schema()["properties"]["source_type"]["enum"])
    if is_v2 and source_types != set(TIER_CEILING):
        errors.append("canonical source_type enum and tier ceiling keys disagree")
    if is_v2 and m.get("source_type") not in source_types:
        errors.append(f"source_type {m.get('source_type')!r} is outside the schema enum")
    tier = m.get("tier")
    ceiling = TIER_CEILING.get(m.get("source_type"), 9)
    if is_v2 and (isinstance(tier, bool) or not isinstance(tier, int) or tier < ceiling or tier > 10):
        errors.append(f"tier must be an integer from {ceiling} to 10 for source_type {m.get('source_type')!r}")
    hosts = m.get("host_allowlist")
    if (is_v2 or hosts is not None) and (not isinstance(hosts, list) or (is_v2 and not hosts) or not all(
        isinstance(host, str) and host.strip() == host and host
        and "://" not in host and "/" not in host and "@" not in host
        and _public_dns_hostname(host)
        for host in (hosts or [])
    )):
        errors.append("host_allowlist must be a non-empty list of bare hostnames")
    elif len(set(hosts or [])) != len(hosts or []):
        errors.append("host_allowlist must not contain duplicates")
    credential_env = m.get("credential_env")
    if not isinstance(credential_env, list) or not all(isinstance(name, str) and ENV_RE.fullmatch(name) for name in credential_env):
        errors.append("credential_env must be a list of CONNECTOR_* environment-variable names")
    elif len(set(credential_env)) != len(credential_env):
        errors.append("credential_env must not contain duplicates")
    licensing = m.get("licensing")
    if is_v2 and isinstance(licensing, dict):
        terms_url = licensing.get("terms_url")
        try:
            connector_https_url_host(terms_url)
            valid_terms = True
        except ValueError:
            valid_terms = False
        if not valid_terms:
            errors.append("licensing.terms_url must be an absolute credential-free HTTPS URL")
        if licensing.get("use") == "unavailable":
            errors.append("licensing.use unavailable forbids runtime connector use")
        if licensing.get("access") == "unknown" and m.get("manual") is not True:
            errors.append("unknown licensing access must fail closed to a manual connector")
        if (licensing.get("use") == "entitlement_required"
                and not credential_env and m.get("manual") is not True):
            errors.append("entitlement-required licensing needs declared credentials or explicit manual ingest")
    if is_v2 and ((m.get("manual") is True) != (m.get("acquisition") == "manual")):
        errors.append("manual:true and acquisition:manual must be declared together")
    if is_v2 and m.get("manual_ingest") is not None and m.get("manual") is not True:
        errors.append("manual_ingest is allowed only when manual:true")
    if is_v2 and m.get("manual") is True:
        manual_ingest = m.get("manual_ingest")
        if (not isinstance(manual_ingest, dict) or set(manual_ingest) != {"file_arg"}
                or not isinstance(manual_ingest.get("file_arg"), str)
                or not re.fullmatch(r"--[a-z0-9-]+", manual_ingest["file_arg"])):
            errors.append("manual connectors require manual_ingest.file_arg")
    release = m["release"]
    if release.get("cadence") not in CADENCES:
        errors.append(f"release.cadence {release.get('cadence')!r} is outside the schema enum")
    if not is_v2 and not _finite_positive(m.get("staleness_sla_days")):
        errors.append("staleness_sla_days must be a finite number > 0")
    if release.get("revision_policy") not in {"revisable", "append_only"}:
        errors.append("release.revision_policy must be revisable or append_only")
    if not isinstance(release.get("timezone"), str) or not release["timezone"].strip():
        errors.append("release.timezone must be a non-empty IANA timezone name")
    else:
        try:
            ZoneInfo(release["timezone"])
        except (ZoneInfoNotFoundError, ValueError):
            errors.append(f"release.timezone {release['timezone']!r} is not a valid IANA timezone")
    for field in ("expected_lag_days", "grace_days"):
        value = release.get(field)
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(float(value)) or value < 0:
            errors.append(f"release.{field} must be a finite number >= 0")
    active_months = release.get("active_months")
    if active_months is not None and (
        release.get("cadence") not in {"daily", "weekly", *CALENDAR_CADENCE_MONTHS}
        or not isinstance(active_months, list) or not active_months
        or any(isinstance(month, bool) or not isinstance(month, int) or not 1 <= month <= 12 for month in active_months)
        or active_months != sorted(set(active_months))
    ):
        errors.append("release.active_months must be sorted unique months for a calendar cadence")
    if (release.get("cadence") == "event_driven"
            and release.get("expected_lag_days") != 0):
        errors.append("event-driven release.expected_lag_days must be 0")
    history = m["minimum_history"]
    obs = history.get("observations")
    if isinstance(obs, bool) or not isinstance(obs, int) or obs < 1:
        errors.append("minimum_history.observations must be an integer >= 1")
    hp = history.get("path")
    if hp is not None and (not isinstance(hp, str) or not hp or any(not p for p in hp.split("."))):
        errors.append("minimum_history.path must be a non-empty dotted path when present")
    elif isinstance(obs, int) and not isinstance(obs, bool) and obs > 1:
        if not hp:
            errors.append("minimum_history.path is required when observations > 1")
        else:
            history_node = _history_schema_node(m.get("output_schema"), hp)
            if not isinstance(history_node, list) or len(history_node) != 1:
                errors.append(
                    "minimum_history.path must resolve to an observation array in output_schema "
                    "when observations > 1"
                )
    if is_v2:
        errors.extend(validate_schema_contract(m.get("output_schema")))
    errors.extend(validate_unit_contract(m.get("output_schema"), raw.get("units") if is_v2 else m.get("units")))
    out = m.get("output_path")
    if not (_canonical_output_path(out) and out.count("<SUBJECT>") == 1
            and out.count("<as_of>") == 1 and "<as_of>" in posixpath.basename(out)):
        errors.append(
            "output_path must be one canonical lowercase POSIX path under "
            "data/<SUBJECT>/external/ with one <as_of> in a .json basename"
        )
    entry = m.get("entry")
    if is_v2 and (entry != "fetch.py" or m.get("verify") != "fetch.py --verify"):
        errors.append("v2 executable contract requires entry 'fetch.py' and verify 'fetch.py --verify'")
    elif not isinstance(entry, str) or not entry or "/" in entry or "\\" in entry or ".." in entry:
        errors.append("entry must be a plain filename")
    elif not os.path.isfile(os.path.join(connector_dir, entry)):
        errors.append(f"entry {entry!r} missing in the connector directory")
    fallback_for = m.get("fallback_for")
    if fallback_for is not None and (not isinstance(fallback_for, str) or not CONNECTOR_ID_RE.fullmatch(fallback_for) or fallback_for == m.get("id")):
        errors.append("fallback_for must name a different connector id")
    return errors


def _schema_unit_paths(schema: Any, prefix: str = "") -> tuple[set[str], set[str]]:
    """Return numeric leaf paths and open-object paths from compact schemas."""
    numeric: set[str] = set()
    open_objects: set[str] = set()
    if isinstance(schema, str):
        token = schema.strip().split(" ", 1)[0].removesuffix("|null")
        if token in {"int", "float"}:
            numeric.add(prefix)
        elif token == "object":
            open_objects.add(prefix)
    elif isinstance(schema, dict):
        for key, child in schema.items():
            child_path = f"{prefix}.{key}" if prefix else key
            n, o = _schema_unit_paths(child, child_path)
            numeric.update(n); open_objects.update(o)
    elif isinstance(schema, list) and len(schema) == 1:
        n, o = _schema_unit_paths(schema[0], f"{prefix}[]")
        numeric.update(n); open_objects.update(o)
    elif isinstance(schema, (int, float)) and not isinstance(schema, bool):
        numeric.add(prefix)
    return numeric, open_objects


def validate_schema_contract(schema: Any, where: str = "output_schema") -> list[str]:
    """Validate the compact schema notation before a connector can run.

    Without this manifest-time check, a typo such as ``number`` is admitted by
    discovery and then makes every retrieval fail at staging.  Objects are
    closed, a list denotes a homogeneous array and therefore has exactly one
    item schema, and scalar literals are exact invariants.
    """
    if isinstance(schema, str):
        token = schema.strip().split(" ", 1)[0]
        if not token:
            return [f"{where} has an empty schema token"]
        token = token.removesuffix("|null")
        if token.startswith("enum:"):
            options = token[5:].split("|")
            if not options or any(not option for option in options) or len(set(options)) != len(options):
                return [f"{where} has a malformed enum schema token"]
            return []
        if token not in {"string", "date", "datetime", "YYYY-MM", "int", "float", "bool", "object"}:
            return [f"{where} uses unsupported schema token {schema!r}"]
        return []
    if isinstance(schema, dict):
        errors: list[str] = []
        for key, child in schema.items():
            if not isinstance(key, str) or not key:
                errors.append(f"{where} object keys must be non-empty strings")
                continue
            errors.extend(validate_schema_contract(child, f"{where}.{key}"))
        return errors
    if isinstance(schema, list):
        if len(schema) != 1:
            return [f"{where} schema list must contain exactly one item schema"]
        return validate_schema_contract(schema[0], f"{where}[]")
    if schema is None or isinstance(schema, (bool, int)):
        return []
    if isinstance(schema, float):
        return [] if math.isfinite(schema) else [f"{where} literal must be finite"]
    return [f"{where} uses unsupported schema value {schema!r}"]


def validate_unit_contract(schema: Any, units: Any) -> list[str]:
    """Require one stable unit declaration for every numeric output field.

    Paths mirror ``output_schema``; array item paths use ``[]``.  A compact
    schema may deliberately expose a dynamic numeric object as ``object``;
    that requires an explicit ``path.*`` declaration.  This admits genuine
    multi-metric feeds while preventing a newly added numeric field from
    silently inheriting an unrelated unit.
    """
    if not isinstance(units, dict):
        return ["units must be an object keyed by output field path"]
    errors: list[str] = []
    if not all(isinstance(k, str) and k and isinstance(v, str) and v.strip() for k, v in units.items()):
        errors.append("units must map non-empty field paths to non-empty unit strings")
        return errors
    numeric, open_objects = _schema_unit_paths(schema)
    declared = set(units)
    missing = sorted(numeric - declared)
    if missing:
        errors.append("units missing numeric field paths: " + ", ".join(missing))
    allowed = numeric | {f"{path}.*" for path in open_objects if path}
    extras = sorted(declared - allowed)
    if extras:
        errors.append("units declare paths that are not numeric output fields: " + ", ".join(extras))
    return errors


def _actual_numeric_paths(value: Any, prefix: str = "") -> set[str]:
    paths: set[str] = set()
    if isinstance(value, bool) or value is None:
        return paths
    if isinstance(value, (int, float)):
        paths.add(prefix)
    elif isinstance(value, dict):
        for key, child in value.items():
            p = f"{prefix}.{key}" if prefix else str(key)
            paths.update(_actual_numeric_paths(child, p))
    elif isinstance(value, list):
        for child in value:
            paths.update(_actual_numeric_paths(child, f"{prefix}[]"))
    return paths


def _unit_covers(path: str, declared: set[str]) -> bool:
    if path in declared:
        return True
    return any(key.endswith(".*") and (path.startswith(key[:-1])) for key in declared)


def coverage_errors(manifests: list[dict[str, Any]]) -> dict[str, list[str]]:
    """Reject ambiguous subject+series ownership; admit only explicit fallbacks.

    A fallback must name the sole primary, cover the same semantic series and
    subject, and use another provider/dataset.  Thus discovery cannot silently
    let directory order decide which source owns a fact.
    """
    errors: dict[str, list[str]] = {}
    by_id = {m["id"]: m for m in manifests}
    # One environment name has one connector owner. The runner launches connectors against different
    # provider/host trust domains; allowing two manifests to reuse a generic name can send provider A's
    # secret to provider B. Operators may store the same underlying token under two provider-scoped names,
    # but manifest discovery never infers that cross-domain sharing is safe.
    credential_owners: dict[str, list[dict[str, Any]]] = {}
    for m in manifests:
        for name in m.get("credential_env", []):
            credential_owners.setdefault(name, []).append(m)
    for name, owners in credential_owners.items():
        if len(owners) > 1:
            for owner in owners:
                errors.setdefault(owner["id"], []).append(
                    f"credential_env {name!r} must have exactly one connector owner"
                )
    coverage: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for m in manifests:
        for subject in m["subjects"]:
            coverage.setdefault((subject.casefold(), m["series_id"]), []).append(m)
    for (subject, series_id), members in coverage.items():
        primaries = [m for m in members if not m.get("fallback_for")]
        if len(primaries) != 1:
            reason = f"subject+series collision {subject}/{series_id}: expected one primary, found {len(primaries)}"
            for m in members:
                errors.setdefault(m["id"], []).append(reason)
            continue
        primary = primaries[0]
        priority_members: dict[int, list[dict[str, Any]]] = {}
        for member in members:
            priority_members.setdefault(member.get("provider_priority"), []).append(member)
        for priority, peers in priority_members.items():
            if len(peers) > 1:
                for peer in peers:
                    errors.setdefault(peer["id"], []).append(
                        f"duplicate provider_priority {priority} for {subject}/{series_id}"
                    )
        for m in members:
            if m is primary:
                continue
            if m.get("fallback_for") != primary["id"]:
                errors.setdefault(m["id"], []).append(
                    f"fallback_for must name primary {primary['id']!r} for {subject}/{series_id}"
                )
            if m.get("provider_priority", 0) <= primary.get("provider_priority", 0):
                errors.setdefault(m["id"], []).append(
                    "fallback provider_priority must be numerically greater than its primary"
                )
            if m.get("provider") == primary.get("provider") or m.get("dataset_id") == primary.get("dataset_id"):
                errors.setdefault(m["id"], []).append("fallback must use a different provider and dataset_id")
            if (m.get("series") != primary.get("series")
                    or canonical_json_bytes(m.get("output_schema")) != canonical_json_bytes(primary.get("output_schema"))
                    or canonical_json_bytes(m.get("units")) != canonical_json_bytes(primary.get("units"))
                    or canonical_json_bytes(m.get("minimum_history")) != canonical_json_bytes(primary.get("minimum_history"))):
                errors.setdefault(m["id"], []).append(
                    "fallback series, output_schema, units, and minimum_history must exactly match its primary"
                )
    # A declared fallback whose primary is absent or does not share every
    # claimed coverage row is also malformed, even when it is the only member.
    for m in manifests:
        parent_id = m.get("fallback_for")
        if not parent_id:
            continue
        parent = by_id.get(parent_id)
        if not parent:
            errors.setdefault(m["id"], []).append(f"fallback_for primary {parent_id!r} is not discovered")
            continue
        child_subjects = {value.casefold() for value in m["subjects"]}
        parent_subjects = {value.casefold() for value in parent["subjects"]}
        if m["series_id"] != parent["series_id"] or not child_subjects.issubset(parent_subjects):
            errors.setdefault(m["id"], []).append("fallback coverage must be a subset of its primary's subject+series coverage")
    projection_owners: dict[str, list[dict[str, Any]]] = {}
    for m in manifests:
        for subject in m["subjects"]:
            projected = str(m.get("output_path", "")).replace("<SUBJECT>", subject)
            # Defense in depth for callers which assemble manifests without
            # first running validate_manifest (and for case-insensitive
            # deployment filesystems): compare materialized canonical keys.
            collision_key = posixpath.normpath(projected).casefold()
            projection_owners.setdefault(collision_key, []).append(m)
    for projected, owners in projection_owners.items():
        if len(owners) > 1:
            for owner in owners:
                errors.setdefault(owner["id"], []).append(
                    f"projection collision: {projected!r} has multiple connector owners"
                )
    current_owners: dict[str, list[dict[str, Any]]] = {}
    for m in manifests:
        for subject in m["subjects"]:
            current_key = posixpath.join(
                "_connectors", "current", str(m.get("dataset_id", "")),
                str(m.get("series_id", "")), f"{subject}.json",
            ).casefold()
            current_owners.setdefault(current_key, []).append(m)
    for current_key, owners in current_owners.items():
        if len(owners) > 1:
            for owner in owners:
                errors.setdefault(owner["id"], []).append(
                    f"canonical current identity collision: {current_key!r} has multiple connector owners"
                )
    return errors


def _at_path(payload: Any, dotted: str | None) -> Any:
    value = payload
    if not dotted:
        return value
    for part in dotted.split("."):
        if not isinstance(value, dict) or part not in value:
            raise KeyError(dotted)
        value = value[part]
    return value


def _schema_at_path(schema: Any, dotted: str | None) -> Any:
    value = schema
    if not dotted:
        return value
    for part in dotted.split("."):
        if not isinstance(value, dict) or part not in value:
            return None
        value = value[part]
        if isinstance(value, list) and len(value) == 1:
            value = value[0]
    return value


def _history_date_errors(payload: dict[str, Any], schema: Any, history_path: str | None) -> list[str]:
    """Require dated history rows to be unique and monotonic in either direction."""
    try:
        rows = _at_path(payload, history_path)
    except KeyError:
        return []
    row_schema = _schema_at_path(schema, history_path)
    if not isinstance(rows, list) or not isinstance(row_schema, dict):
        return []
    errors: list[str] = []
    for field, spec in row_schema.items():
        if not isinstance(spec, str):
            continue
        token = spec.strip().split(" ", 1)[0].removesuffix("|null")
        if token not in {"date", "datetime", "YYYY-MM"}:
            continue
        values = [row.get(field) for row in rows if isinstance(row, dict)]
        if len(values) != len(rows) or any(not isinstance(value, str) for value in values):
            continue  # the ordinary schema validator reports the structural/type defect
        if len(set(values)) != len(values):
            errors.append(f"minimum history date field {field!r} contains duplicates")
            continue
        if len(values) > 1:
            increasing = all(a < b for a, b in zip(values, values[1:]))
            decreasing = all(a > b for a, b in zip(values, values[1:]))
            if not increasing and not decreasing:
                errors.append(f"minimum history date field {field!r} is not monotonic")
    return errors


def _validate_type(value: Any, spec: str, where: str) -> list[str]:
    token = spec.strip().split(" ", 1)[0]
    allowed_null = token.endswith("|null")
    if allowed_null and value is None:
        return []
    token = token.removesuffix("|null")
    if token.startswith("enum:"):
        allowed = token[5:].split("|")
        return [] if isinstance(value, str) and value in allowed else [f"{where} must be one of {allowed!r}"]
    if token == "string":
        ok = isinstance(value, str)
    elif token == "date":
        ok = isinstance(value, str) and bool(DATE_RE.fullmatch(value))
        if ok:
            try: datetime.strptime(value, "%Y-%m-%d")
            except ValueError: ok = False
    elif token == "datetime":
        ok = isinstance(value, str) and bool(DATETIME_RE.fullmatch(value))
        if ok:
            try:
                parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
                ok = parsed.tzinfo is not None and parsed.utcoffset() == timedelta(0)
            except ValueError:
                ok = False
    elif token == "YYYY-MM":
        ok = isinstance(value, str) and bool(re.fullmatch(r"\d{4}-(?:0[1-9]|1[0-2])", value))
    elif token == "int":
        ok = isinstance(value, int) and not isinstance(value, bool)
    elif token == "float":
        ok = isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(float(value))
    elif token == "bool":
        ok = isinstance(value, bool)
    elif token == "object":
        ok = isinstance(value, dict)
    else:
        return [f"{where} uses unsupported schema token {spec!r}"]
    if not ok:
        return [f"{where} must match {token}"]
    if token == "object":
        return _nonfinite_json_errors(value, where)
    return []


def _provenance_datetime(value: Any) -> datetime | None:
    """Parse a durable provenance date or timezone-aware ISO/RFC3339 time."""
    if not isinstance(value, str) or not value or value.strip() != value:
        return None
    if DATE_RE.fullmatch(value):
        try:
            parsed_date = datetime.strptime(value, "%Y-%m-%d")
        except ValueError:
            return None
        return parsed_date.replace(tzinfo=timezone.utc)
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return None
    return parsed.astimezone(timezone.utc)


def _nonfinite_json_errors(value: Any, where: str = "$") -> list[str]:
    """Reject JSON's non-standard NaN/Infinity extension at every depth."""
    if isinstance(value, float) and not math.isfinite(value):
        return [f"{where} must contain only finite JSON numbers"]
    errors: list[str] = []
    if isinstance(value, dict):
        for key, child in value.items():
            errors.extend(_nonfinite_json_errors(child, f"{where}.{key}"))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            errors.extend(_nonfinite_json_errors(child, f"{where}[{index}]"))
    return errors


def validate_payload(payload: Any, schema: Any, where: str = "$") -> list[str]:
    """Validate the repository's compact output_schema notation."""
    if isinstance(schema, str):
        return _validate_type(payload, schema, where)
    if isinstance(schema, dict):
        if not isinstance(payload, dict):
            return [f"{where} must be an object"]
        errors: list[str] = []
        for key, child in schema.items():
            if key not in payload:
                errors.append(f"{where}.{key} is missing")
            else:
                errors.extend(validate_payload(payload[key], child, f"{where}.{key}"))
        for key in sorted(set(payload) - set(schema)):
            errors.append(f"{where}.{key} is unexpected (explicit object schemas are closed)")
        return errors
    if isinstance(schema, list):
        if len(schema) != 1:
            return [f"{where} schema list must contain exactly one item schema"]
        if not isinstance(payload, list):
            return [f"{where} must be a list"]
        errors: list[str] = []
        for i, item in enumerate(payload):
            errors.extend(validate_payload(item, schema[0], f"{where}[{i}]"))
        return errors
    # A literal in the schema is an exact invariant (used for policy constants).
    return [] if payload == schema else [f"{where} must equal {schema!r}"]


def validate_staged_output(
    manifest: dict[str, Any], subject: str, payload: Any, sidecar: Any, filename_as_of: str,
    *, manual_ingest: bool = False, retrieved_at: datetime | None = None,
) -> list[str]:
    """Validate data, minimum history, identity, and provenance before publish."""
    m = normalise_manifest(manifest)
    errors = validate_payload(payload, m.get("output_schema"))
    if m.get("manifest_version") == 2:
        try:
            canonical_json_bytes(payload)
        except (TypeError, ValueError) as exc:
            errors.append(f"payload is outside the cross-runtime canonical JSON domain: {exc}")
        methodology_reason = methodology_only_nested_reason(
            {"payload": payload, "provenance": sidecar}, "staged connector output",
        )
        if methodology_reason:
            errors.append(
                f"v2 provenance rejects {METHODOLOGY_ONLY_ERROR}: {methodology_reason}"
            )
    if not isinstance(payload, dict):
        return errors
    as_of = payload.get("as_of")
    if as_of != filename_as_of:
        errors.append(f"payload as_of {as_of!r} does not match filename {filename_as_of!r}")
    if payload.get("series") != m.get("series"):
        errors.append("payload series does not match manifest series")
    if retrieved_at is not None and isinstance(as_of, str) and DATE_RE.fullmatch(as_of):
        try:
            retrieved = retrieved_at
            if retrieved.tzinfo is None:
                retrieved = retrieved.replace(tzinfo=timezone.utc)
            local_retrieval_date = retrieved.astimezone(ZoneInfo(m["release"]["timezone"])).date()
            if datetime.strptime(as_of, "%Y-%m-%d").date() > local_retrieval_date:
                errors.append(
                    f"payload as_of {as_of!r} is after retrieval date {local_retrieval_date.isoformat()} "
                    f"in release timezone {m['release']['timezone']}"
                )
        except (KeyError, TypeError, ValueError, ZoneInfoNotFoundError):
            # Manifest validation owns malformed release clocks.
            pass
    declared_units = set(m.get("units", {}))
    uncovered = sorted(p for p in _actual_numeric_paths(payload) if not _unit_covers(p, declared_units))
    if m.get("manifest_version") == 2 and uncovered:
        errors.append("payload has numeric fields without declared units: " + ", ".join(uncovered))
    history = m["minimum_history"]
    try:
        observed = _at_path(payload, history.get("path"))
        if history.get("path") is not None and not isinstance(observed, list):
            errors.append(f"minimum history path {history.get('path')!r} must resolve to an observation list")
            count = 0
        else:
            count = len(observed) if isinstance(observed, list) else 1
        if count < history["observations"]:
            errors.append(f"minimum history not met: {count} < {history['observations']}")
    except KeyError:
        errors.append(f"minimum history path {history.get('path')!r} is missing")
    errors.extend(_history_date_errors(payload, m.get("output_schema"), history.get("path")))
    if not isinstance(sidecar, dict):
        errors.append("provenance sidecar must be an object")
        return errors
    errors.extend(_nonfinite_json_errors(sidecar, "provenance"))
    provenance_times: dict[str, datetime] = {}
    for key in ("received", "published", "published_at"):
        if key not in sidecar:
            continue
        parsed_time = _provenance_datetime(sidecar.get(key))
        if parsed_time is None:
            errors.append(f"sidecar {key} must be a real date or timezone-aware ISO datetime")
        else:
            provenance_times[key] = parsed_time
            if retrieved_at is not None:
                retrieval_utc = retrieved_at if retrieved_at.tzinfo is not None \
                    else retrieved_at.replace(tzinfo=timezone.utc)
                if parsed_time > retrieval_utc.astimezone(timezone.utc):
                    errors.append(f"sidecar {key} cannot be after retrieval time")
    received_time = provenance_times.get("received")
    published_time = provenance_times.get("published_at") or provenance_times.get("published")
    if received_time is not None and published_time is not None and published_time > received_time:
        errors.append("sidecar published time cannot be after received time")
    if m.get("manifest_version") == 2:
        try:
            canonical_json_bytes(sidecar)
        except (TypeError, ValueError) as exc:
            errors.append(f"sidecar is outside the cross-runtime canonical JSON domain: {exc}")
        reserved = publisher_owned_sidecar_fields(sidecar)
        if reserved:
            errors.append(
                "sidecar contains publisher-owned fields: " + ", ".join(reserved)
            )
    expected = {
        "provider": m.get("provider"), "source_type": m.get("source_type"),
        "tier": m.get("tier"), "license": m.get("license"), "as_of": as_of,
        "connector_id": m.get("id"),
    }
    if m.get("manifest_version") == 2:
        expected.update({
            "dataset_id": m.get("dataset_id"), "series_id": m.get("series_id"),
            "schema_version": m.get("schema_version"), "licensing": m.get("licensing"),
        })
    for key, want in expected.items():
        if sidecar.get(key) != want:
            errors.append(f"sidecar {key} {sidecar.get(key)!r} does not match manifest/output {want!r}")
    if m.get("manifest_version") == 2:
        def url_field_kind(key: Any) -> str | None:
            raw_key = str(key or "")
            # Split both camelCase and acronym boundaries before folding so
            # mirrorUrl/sourceURL cannot bypass the *_url policy.
            split = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", raw_key)
            split = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1_\2", split)
            normalized = re.sub(r"[-\s]+", "_", split.casefold())
            if (normalized in {"urls", "url_list", "urls_list"}
                    or normalized.endswith(("_urls", "_url_list", "_urls_list"))):
                return "many"
            if normalized == "url" or normalized.endswith("_url"):
                return "one"
            return None

        def nested_urls(value: Any, label: str) -> list[tuple[str, str]]:
            found: list[tuple[str, str]] = []
            if isinstance(value, dict):
                for key, child in value.items():
                    path = f"{label}.{key}"
                    kind = url_field_kind(key)
                    if kind == "one":
                        if isinstance(child, str) and child:
                            found.append((path, child))
                        else:
                            errors.append(f"{path} must be a non-empty URL string")
                    elif kind == "many":
                        if (not isinstance(child, list) or not child
                                or not all(isinstance(url, str) and url for url in child)):
                            errors.append(f"{path} must be a non-empty list of URL strings")
                        else:
                            found.extend((f"{path}[{index}]", url) for index, url in enumerate(child))
                    else:
                        found.extend(nested_urls(child, path))
                        if isinstance(child, str) and re.match(r"^[A-Za-z][A-Za-z0-9+.-]*://", child):
                            found.append((path, child))
            elif isinstance(value, list):
                for index, child in enumerate(value):
                    found.extend(nested_urls(child, f"{label}[{index}]"))
            return found

        provenance_fields = nested_urls(sidecar, "provenance")
        payload_fields = nested_urls(payload, "payload")
        # A terms URL is licensing metadata, not evidence provenance.  Keep the
        # established requirement for an actual source URL even though every
        # URL-bearing field (including licensing.terms_url) is policy-checked.
        top_source_url = sidecar.get("source_url")
        top_source_urls = sidecar.get("source_urls")
        evidence_source_urls: list[str] = []
        if isinstance(top_source_url, str) and top_source_url:
            evidence_source_urls.append(top_source_url)
        if (isinstance(top_source_urls, list) and top_source_urls
                and all(isinstance(url, str) and url for url in top_source_urls)):
            evidence_source_urls.extend(top_source_urls)
        if not evidence_source_urls:
            errors.append("v2 provenance sidecar must include top-level source_url or source_urls")
        allowed = [host.lower() for host in m.get("host_allowlist", [])]
        for path, url in [*provenance_fields, *payload_fields]:
            try:
                parsed = urlparse(url)
            except ValueError:
                errors.append(f"v2 source URL at {path} is malformed")
                continue
            try:
                connector_https_url_host(
                    url, None if ".licensing." in path else allowed,
                )
            except ValueError as exc:
                errors.append(f"v2 source URL at {path} violates connector URL policy: {exc}")
        payload_urls = {url for _path, url in payload_fields}
        if payload_urls and not payload_urls.issubset(set(evidence_source_urls)):
            errors.append("payload evidence URLs must also appear in the provenance sidecar")
    if subject not in m.get("subjects", []):
        errors.append(f"subject {subject!r} is outside manifest coverage")
    return errors


def canonical_json_bytes(value: Any) -> bytes:
    """Connector immutable-byte contract shared exactly with TypeScript.

    The repository canonicalizer supplies ECMAScript number spelling, UTF-16
    key ordering, safe-integer and Unicode-scalar checks. Connector records add
    one trailing newline, which is therefore also inside every SHA-256.
    """
    return _cross_runtime_canonical_json_bytes(value) + b"\n"


def connector_storage_paths(data_root: str, manifest: dict[str, Any], subject: str) -> dict[str, str]:
    """Canonical v2 storage locations for one connector coverage row."""
    m = normalise_manifest(manifest)
    root = os.path.realpath(os.path.abspath(data_root))
    base = os.path.join(root, "_connectors")
    paths = {
        "base": base,
        "blobs": os.path.join(base, "blobs", "sha256"),
        "vintages": os.path.join(base, "vintages", m["dataset_id"], m["series_id"], subject),
        # Current is provider/dataset scoped.  Two explicit providers for the
        # same semantic series never overwrite each other; the reader chooses
        # the primary or one whole fallback vintage.
        "current": os.path.join(base, "current", m["dataset_id"], m["series_id"], f"{subject}.json"),
    }
    if any(no_symlink_path(root, path) is None for path in paths.values()):
        raise ValueError("canonical connector storage contains a symlinked or escaping component")
    return paths


def load_valid_manifests(
    connectors_root: str, *, allow_legacy: bool = False,
) -> tuple[list[dict[str, Any]], list[tuple[str, str]]]:
    """Filesystem discovery shared by non-runner readers.

    Returns normalised manifests and deterministic skip reasons.  Coverage
    collisions fail closed as a group.
    """
    valid: list[dict[str, Any]] = []
    skipped: list[tuple[str, str]] = []
    try:
        names = sorted(os.listdir(connectors_root))
    except OSError as exc:
        return [], [(connectors_root, f"connectors root unreadable: {exc}")]
    for name in names:
        cdir = os.path.join(connectors_root, name)
        mpath = os.path.join(cdir, "connector.json")
        if not os.path.isfile(mpath):
            continue
        try:
            with open(mpath, encoding="utf-8") as fh:
                raw = json.load(fh)
        except Exception as exc:
            skipped.append((name, f"connector.json does not parse: {exc}"))
            continue
        if not allow_legacy and (not isinstance(raw, dict) or raw.get("manifest_version") != 2):
            skipped.append((name, "production connector discovery requires manifest_version 2"))
            continue
        errors = validate_manifest(name, cdir, raw)
        if errors:
            skipped.append((name, "; ".join(errors)))
        else:
            m = normalise_manifest(raw)
            m["_dir"] = cdir
            valid.append(m)
    # Coverage validity is transitive.  A primary can be invalidated on one of
    # its coverage rows while a narrower fallback looked valid on another row
    # during the same pass.  Recompute after every rejection until fixed-point
    # so no fallback survives without its *still-valid* declared primary.
    while valid:
        collisions = coverage_errors(valid)
        if not collisions:
            break
        bad = set(collisions)
        for cid in sorted(collisions):
            skipped.append((cid, "; ".join(collisions[cid])))
        valid = [m for m in valid if m["id"] not in bad]
    return valid, skipped
