#!/usr/bin/env python3
"""Compile a point-in-time, machine-verifiable commodity profile coverage gate."""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import math
import os
import re
from pathlib import Path
from typing import Any, Callable

from canonical_json import canonical_json_bytes
from connector_contract import load_valid_manifests
from connector_vintages import read_point_in_time
from market_prices import load_feed
from repo_mutation import atomic_write_json


REPO = Path(__file__).resolve().parents[1]
PROFILE_PATH = REPO / "frameworks" / "commodity" / "COMMODITY_PROFILES.md"
STRUCTURED_PROFILE_ROOT = REPO / "frameworks" / "commodity" / "profiles"
CONNECTORS_ROOT = REPO / ".claude" / "connectors"
MARKET_ROOT = REPO / "data" / "_market"
STATE_ROOT = Path(os.environ.get("ENGINE_STATE_DIR", REPO / "ui" / "server" / ".state"))
ROW_RE = re.compile(
    r"^\| `(?P<need>[a-z0-9._-]+)` \| `(?P<series>[a-z0-9._-]+)` \| "
    r"(?P<owner>[a-z0-9._-]+) \| (?P<requirement>.*?) \| (?P<policy>.*?) \|$"
)
STATUSES = {"usable", "missing", "manual", "unavailable", "suspect"}
RESOLVER_KINDS = {"connector", "shared_market", "pulse_quote", "derived"}
QUALITY_KEYS = {
    "path", "min_observations", "min_span_days", "date_field", "max_staleness_days",
    "max_parent_gap_days",
}
FUTURES_PRICE_BASES = {"front_contract", "continuous_back_adjusted", "continuous_ratio_adjusted"}


def _utc(value: str | None) -> dt.datetime:
    if value is None:
        return dt.datetime.now(dt.timezone.utc)
    parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError("decision time must include a timezone")
    return parsed.astimezone(dt.timezone.utc)


def _iso(value: dt.datetime) -> str:
    return value.isoformat(timespec="seconds").replace("+00:00", "Z")


def _parse_instant(value: Any) -> dt.datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        try:
            parsed = dt.datetime.combine(dt.date.fromisoformat(value), dt.time(), dt.timezone.utc)
        except ValueError:
            return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=dt.timezone.utc)
    return parsed.astimezone(dt.timezone.utc)


def profile_rows(profile_path: Path, commodity: str) -> list[dict[str, str]]:
    text = profile_path.read_text(encoding="utf-8")
    section = re.search(
        rf"(?ms)^## {re.escape(commodity)}\s*$\n(.*?)(?=^## \S|\Z)", text,
    )
    if not section:
        raise ValueError(f"profile has no ## {commodity} section")
    marker = "**Required semantic series"
    body = section.group(1)
    if marker not in body:
        raise ValueError(f"{commodity} profile has no required semantic-series table")
    table = body.split(marker, 1)[1]
    rows: list[dict[str, str]] = []
    for line in table.splitlines():
        match = ROW_RE.match(line.strip())
        if match:
            rows.append(match.groupdict())
        elif rows and line.strip() and not line.lstrip().startswith("|"):
            break
    if not rows:
        raise ValueError(f"{commodity} required semantic-series table has no rows")
    needs = [row["need"] for row in rows]
    series = [row["series"] for row in rows]
    if len(needs) != len(set(needs)) or len(series) != len(set(series)):
        raise ValueError(f"{commodity} required semantic-series IDs must be unique")
    return rows


def structured_profile(
    commodity: str, *, profile_path: Path = PROFILE_PATH,
    structured_root: Path = STRUCTURED_PROFILE_ROOT,
) -> list[dict[str, Any]]:
    path = structured_root / f"{commodity.upper()}.json"
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"structured profile is missing or invalid: {path}") from error
    if not isinstance(raw, dict) or set(raw) != {"schema_version", "commodity", "requirements"}:
        raise ValueError("structured profile must contain exactly schema_version, commodity and requirements")
    if raw.get("schema_version") != 1 or raw.get("commodity") != commodity.upper():
        raise ValueError("structured profile identity mismatch")
    requirements = raw.get("requirements")
    if not isinstance(requirements, list) or not requirements:
        raise ValueError("structured profile requirements must be a non-empty array")
    human = profile_rows(profile_path, commodity.upper())
    expected = [
        (row["need"], row["series"], row["owner"], row["requirement"], row["policy"])
        for row in human
    ]
    actual = []
    seen_needs: set[str] = set()
    seen_series: set[str] = set()
    for index, requirement in enumerate(requirements):
        if not isinstance(requirement, dict) or set(requirement) != {
            "need", "series", "owner", "requirement", "policy", "quality", "resolver",
        }:
            raise ValueError(f"structured profile requirement {index} has an invalid shape")
        quality = requirement.get("quality")
        resolver = requirement.get("resolver")
        if not isinstance(quality, dict) or not isinstance(resolver, dict):
            raise ValueError(f"structured profile requirement {index} needs quality and resolver objects")
        if not set(quality) <= QUALITY_KEYS or "max_staleness_days" not in quality:
            raise ValueError(f"structured profile requirement {index} has unknown or missing quality controls")
        if resolver.get("kind") not in RESOLVER_KINDS:
            raise ValueError(f"structured profile requirement {index} has an unknown resolver kind")
        for field in ("min_observations", "min_span_days", "max_staleness_days", "max_parent_gap_days"):
            value = quality.get(field)
            if value is not None and (not isinstance(value, int) or isinstance(value, bool) or value < 1):
                raise ValueError(f"structured profile requirement {index} has invalid {field}")
        for field in ("path", "date_field"):
            if field in quality and (not isinstance(quality[field], str) or not quality[field].strip()):
                raise ValueError(f"structured profile requirement {index} has invalid {field}")
        if quality.get("min_span_days") is not None and (
            quality.get("min_observations") is None or quality.get("date_field") is None
        ):
            raise ValueError(f"structured profile requirement {index} span control lacks count/date controls")
        kind = resolver["kind"]
        expected_resolver_keys = {
            "connector": {"kind"},
            "shared_market": {"kind", "symbol", "instrument_kind", "price_basis"},
            "pulse_quote": {"kind", "swarm", "symbol", "source"},
            "derived": {"kind", "operation", "left", "right"},
        }[kind]
        if set(resolver) != expected_resolver_keys:
            raise ValueError(f"structured profile requirement {index} has an invalid {kind} resolver shape")
        if kind == "shared_market":
            if any(not isinstance(resolver[field], str) or not resolver[field].strip() for field in expected_resolver_keys - {"kind"}):
                raise ValueError(f"structured profile requirement {index} has invalid shared-market identity")
            if resolver["instrument_kind"] not in {"equity", "benchmark", "sector", "future"}:
                raise ValueError(f"structured profile requirement {index} has invalid instrument kind")
            allowed_bases = FUTURES_PRICE_BASES if resolver["instrument_kind"] == "future" else {"split_adjusted"}
            if resolver["price_basis"] not in allowed_bases:
                raise ValueError(f"structured profile requirement {index} has invalid price basis")
        elif kind == "pulse_quote":
            if any(not isinstance(resolver[field], str) or not resolver[field].strip() for field in expected_resolver_keys - {"kind"}):
                raise ValueError(f"structured profile requirement {index} has invalid pulse identity")
        elif kind == "derived" and resolver.get("operation") != "left_minus_right_pct_of_right":
            raise ValueError(f"structured profile requirement {index} has an invalid derived operation")
        if quality.get("max_parent_gap_days") is not None and kind != "derived":
            raise ValueError(f"structured profile requirement {index} applies parent alignment to a non-derived route")
        need, series = requirement.get("need"), requirement.get("series")
        if not isinstance(need, str) or not isinstance(series, str) or need in seen_needs or series in seen_series:
            raise ValueError("structured profile need and series IDs must be unique strings")
        seen_needs.add(need)
        seen_series.add(series)
        actual.append((need, series, requirement.get("owner"), requirement.get("requirement"), requirement.get("policy")))
    if actual != expected:
        raise ValueError("structured profile does not exactly mirror the canonical markdown profile")
    series_ids = seen_series
    for requirement in requirements:
        resolver = requirement["resolver"]
        if resolver["kind"] == "derived":
            for side in ("left", "right"):
                dependency = resolver.get(side)
                if not isinstance(dependency, dict) or set(dependency) != {"series", "path"}:
                    raise ValueError(f"derived resolver {requirement['series']} has an invalid {side} dependency")
                if dependency["series"] not in series_ids or dependency["series"] == requirement["series"]:
                    raise ValueError(f"derived resolver {requirement['series']} has an invalid dependency")
    return requirements


def _value_at(value: Any, dotted_path: str | None) -> Any:
    if not dotted_path:
        return value
    current = value
    for part in dotted_path.split("."):
        if not isinstance(current, dict) or part not in current:
            return None
        current = current[part]
    return current


def _quality_error(payload: Any, as_of: Any, quality: dict[str, Any], cutoff: dt.datetime) -> str | None:
    observed = _value_at(payload, quality.get("path")) if quality.get("path") else (
        payload.get("points") if isinstance(payload, dict) else None
    )
    minimum = quality.get("min_observations")
    if minimum is not None and (not isinstance(observed, list) or len(observed) < minimum):
        return f"history has fewer than {minimum} required observations"
    if quality.get("min_span_days") is not None:
        points = observed if isinstance(observed, list) else (
            payload.get("points") if isinstance(payload, dict) else None
        )
        date_field = quality.get("date_field", "date")
        dates = [
            _parse_instant(item.get(date_field)) for item in (points if isinstance(points, list) else [])
            if isinstance(item, dict)
        ]
        dates = [value for value in dates if value is not None and value <= cutoff]
        if len(dates) < 2 or (max(dates) - min(dates)).days < quality["min_span_days"]:
            return f"history spans fewer than {quality['min_span_days']} required days"
    as_of_time = _parse_instant(as_of)
    if as_of_time is None or as_of_time > cutoff:
        return "as-of is missing or after the decision time"
    max_staleness = quality.get("max_staleness_days")
    if max_staleness is not None and (cutoff - as_of_time).total_seconds() > max_staleness * 86400:
        return f"as-of is more than {max_staleness} days stale"
    return None


def _resolved(
    *, series_id: str, payload: dict[str, Any], as_of: str, dataset_id: str,
    connector_id: str | None, provider: str, acquisition: str, tier: int,
    identity: dict[str, Any], retrieved_at: str,
) -> dict[str, Any]:
    vintage_id = "sha256:" + hashlib.sha256(canonical_json_bytes(identity)).hexdigest()
    return {
        "payload": payload,
        "vintage": {
            "series_id": series_id, "as_of": as_of, "dataset_id": dataset_id,
            "connector_id": connector_id, "provider": provider, "acquisition": acquisition,
            "tier": tier, "retrieved_at": retrieved_at,
        },
        "vintage_id": vintage_id, "selected_provider": provider,
        "usable": True, "health": "current",
    }


def _market_sidecars(
    history: dict[str, Any], market_root: Path, cutoff: dt.datetime,
) -> tuple[list[dict[str, Any]] | None, str | None]:
    provider = history.get("provider")
    provider_dir = (market_root / str(provider)).resolve()
    records: list[dict[str, Any]] = []
    named_sources = [history.get("metadata_file"), *history.get("source_files", [])]
    if not isinstance(named_sources[0], str) or not named_sources[0].strip():
        return None, "shared market history names no provider metadata file"
    if any(not isinstance(relative, str) or not relative.strip() for relative in named_sources):
        return None, "shared market history names an invalid source file"
    if len(named_sources) != len(set(named_sources)):
        return None, "shared market history names duplicate source files"
    for relative in named_sources:
        source = (REPO / relative).resolve()
        if source.parent != provider_dir or not source.is_file():
            return None, "shared market source path escapes its provider directory"
        sidecar_path = Path(str(source) + ".source.json")
        try:
            sidecar = json.loads(sidecar_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return None, "shared market source has no valid provenance sidecar"
        received = _parse_instant(sidecar.get("received")) if isinstance(sidecar, dict) else None
        tier = sidecar.get("tier") if isinstance(sidecar, dict) else None
        licensing = sidecar.get("licensing") if isinstance(sidecar, dict) else None
        expected_hash = sidecar.get("content_sha256", sidecar.get("sha256")) if isinstance(sidecar, dict) else None
        actual_hash = hashlib.sha256(source.read_bytes()).hexdigest()
        if (
            not isinstance(sidecar, dict) or sidecar.get("provider") != provider
            or sidecar.get("source_type") not in {"official_data", "vendor_export", "paid_api"}
            or not isinstance(tier, int) or isinstance(tier, bool) or tier > 5
            or received is None or received > cutoff
            or not isinstance(licensing, dict) or licensing.get("use") not in {"allowed", "entitlement_required"}
            or licensing.get("access") not in {"public", "licensed"}
            or expected_hash not in {actual_hash, "sha256:" + actual_hash}
        ):
            return None, "shared market provenance, rights, receipt time or content hash failed"
        records.append({
            "path": relative, "content_sha256": actual_hash, "received": _iso(received),
            "tier": tier, "source_type": sidecar["source_type"], "licensing": licensing,
        })
    if not records:
        return None, "shared market history names no source files"
    return records, None


def _resolve_shared_market(
    requirement: dict[str, Any], cutoff: dt.datetime, market_root: Path,
) -> dict[str, Any]:
    resolver = requirement["resolver"]
    feed = load_feed(str(market_root))
    history = feed.adjusted_history(
        resolver.get("symbol"), provider=resolver.get("provider"),
        instrument_kind=resolver.get("instrument_kind"), price_basis=resolver.get("price_basis"),
    )
    if not isinstance(history, dict):
        return {"usable": False, "status": "unavailable", "reason": "declared shared market history is absent or ambiguous"}
    points = [
        point for point in history.get("points", [])
        if isinstance(point, dict) and (_parse_instant(point.get("date")) or cutoff + dt.timedelta(1)) <= cutoff
    ]
    if not points:
        return {"usable": False, "status": "missing", "reason": "shared market history has no point knowable at decision time"}
    history = {**history, "points": points, "as_of": points[-1]["date"]}
    sidecars, defect = _market_sidecars(history, market_root, cutoff)
    if defect:
        return {"usable": False, "status": "suspect", "reason": defect}
    defect = _quality_error(history, history["as_of"], requirement["quality"], cutoff)
    if defect:
        return {"usable": False, "status": "suspect", "reason": defect}
    provider = str(history["provider"])
    identity = {
        "kind": "shared_market", "series_id": requirement["series"], "provider": provider,
        "symbol": resolver["symbol"], "as_of": history["as_of"], "sources": sidecars,
        "points_sha256": hashlib.sha256(canonical_json_bytes(points)).hexdigest(),
    }
    return _resolved(
        series_id=requirement["series"], payload=history, as_of=history["as_of"],
        dataset_id=f"shared-market.{provider}.{resolver['symbol']}", connector_id=None,
        provider=provider, acquisition="file_drop", tier=max(row["tier"] for row in sidecars or []),
        identity=identity, retrieved_at=max(row["received"] for row in sidecars or []),
    )


def _resolve_pulse(
    requirement: dict[str, Any], commodity: str, cutoff: dt.datetime, state_root: Path,
) -> dict[str, Any]:
    resolver = requirement["resolver"]
    try:
        state = json.loads((state_root / "commodity-pulse.json").read_text(encoding="utf-8"))
        swarm = state[resolver["swarm"]]
        price_at = dt.datetime.fromtimestamp(float(swarm["priceAt"]) / 1000, dt.timezone.utc)
        quote = swarm["prices"][commodity]
    except (OSError, ValueError, OverflowError, TypeError, KeyError, json.JSONDecodeError):
        return {"usable": False, "status": "missing", "reason": "pulse quote snapshot is absent"}
    quote_at = _parse_instant(quote.get("as_of")) if isinstance(quote, dict) else None
    value = quote.get("last") if isinstance(quote, dict) else None
    if (
        not isinstance(quote, dict) or price_at > cutoff or quote_at is None or quote_at > price_at
        or quote.get("symbol") != resolver.get("symbol") or quote.get("source") != resolver.get("source")
        or not isinstance(value, (int, float)) or isinstance(value, bool) or not math.isfinite(value) or value <= 0
    ):
        return {"usable": False, "status": "suspect", "reason": "pulse quote identity, value or point-in-time boundary failed"}
    defect = _quality_error({"value": value}, _iso(quote_at), requirement["quality"], cutoff)
    if defect:
        return {"usable": False, "status": "suspect", "reason": defect}
    payload = {"value": float(value), "unit": quote.get("unit"), "symbol": quote["symbol"], "source": quote["source"]}
    identity = {
        "kind": "pulse_quote", "series_id": requirement["series"], "quote": quote,
        "price_at": _iso(price_at), "swarm": resolver["swarm"],
    }
    return _resolved(
        series_id=requirement["series"], payload=payload, as_of=_iso(quote_at),
        dataset_id=f"pulse.{resolver['source']}.{resolver['symbol']}", connector_id=None,
        provider="CNBC", acquisition="public_quote", tier=10, identity=identity,
        retrieved_at=_iso(price_at),
    )


def _resolve_connector(
    requirement: dict[str, Any], commodity: str, cutoff: dt.datetime,
    manifests: list[dict[str, Any]], connectors_root: Path, data_root: Path,
    reader: Callable[..., dict[str, Any] | None],
) -> dict[str, Any]:
    owners = [
        manifest for manifest in manifests
        if commodity in manifest.get("subjects", []) and requirement["need"] in manifest.get("satisfies", [])
    ]
    if len(owners) > 1:
        return {"usable": False, "status": "suspect", "reason": "more than one connector claims this need"}
    if not owners:
        return {"usable": False, "status": "unavailable", "reason": "no connector claims the profile-owned series"}
    manifest = owners[0]
    if manifest.get("series_id") != requirement["series"]:
        return {"usable": False, "status": "suspect", "reason": "connector series identity conflicts with the profile"}
    if manifest.get("acquisition") == "manual" or manifest.get("manual") is True:
        return {
            "usable": False, "status": "manual", "reason": "manual capture is context-only",
            "manifest": manifest,
        }
    result = reader(
        str(data_root), requirement["series"], commodity, _iso(cutoff),
        connectors_root=str(connectors_root), manifests=manifests,
    )
    if result is None:
        return {"usable": False, "status": "missing", "reason": "no eligible immutable vintage was knowable at decision time", "manifest": manifest}
    vintage = result.get("vintage") if isinstance(result, dict) else None
    if result.get("usable") is not True or result.get("health") != "current" or not isinstance(vintage, dict):
        return {"usable": False, "status": "suspect", "reason": "point-in-time reader rejected the available vintage", "manifest": manifest}
    if vintage.get("acquisition") == "manual" or not isinstance(vintage.get("tier"), int) or vintage.get("tier") > 5:
        return {"usable": False, "status": "manual", "reason": "selected vintage is not eligible primary/provider evidence", "manifest": manifest}
    defect = _quality_error(result.get("payload"), vintage.get("as_of"), requirement["quality"], cutoff)
    if defect:
        return {"usable": False, "status": "suspect", "reason": defect, "manifest": manifest}
    return result


def resolve_profile_series(
    series_id: str, commodity: str, decision_time: str, *,
    profile_path: Path = PROFILE_PATH, structured_root: Path = STRUCTURED_PROFILE_ROOT,
    connectors_root: Path = CONNECTORS_ROOT, data_root: Path = REPO / "data",
    market_root: Path = MARKET_ROOT, state_root: Path = STATE_ROOT,
    reader: Callable[..., dict[str, Any] | None] = read_point_in_time,
    manifests: list[dict[str, Any]] | None = None,
) -> dict[str, Any] | None:
    commodity = commodity.upper()
    cutoff = _utc(decision_time)
    requirements = structured_profile(commodity, profile_path=profile_path, structured_root=structured_root)
    by_series = {row["series"]: row for row in requirements}
    if series_id not in by_series:
        return None
    if manifests is None:
        manifests, defects = load_valid_manifests(str(connectors_root))
        if defects:
            raise ValueError(f"connector discovery failed: {defects[0]}")
    cache: dict[str, dict[str, Any]] = {}
    resolving: set[str] = set()

    def resolve(current_series: str) -> dict[str, Any]:
        if current_series in cache:
            return cache[current_series]
        if current_series in resolving:
            return {"usable": False, "status": "suspect", "reason": "derived resolver cycle"}
        resolving.add(current_series)
        requirement = by_series[current_series]
        kind = requirement["resolver"]["kind"]
        if kind == "connector":
            result = _resolve_connector(requirement, commodity, cutoff, manifests or [], connectors_root, data_root, reader)
        elif kind == "shared_market":
            result = _resolve_shared_market(requirement, cutoff, market_root)
        elif kind == "pulse_quote":
            result = _resolve_pulse(requirement, commodity, cutoff, state_root)
        else:
            resolver = requirement["resolver"]
            left = resolve(resolver["left"]["series"])
            right = resolve(resolver["right"]["series"])
            left_value = _value_at(left.get("payload"), resolver["left"]["path"]) if left.get("usable") is True else None
            right_value = _value_at(right.get("payload"), resolver["right"]["path"]) if right.get("usable") is True else None
            if not all(isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value) for value in (left_value, right_value)):
                result = {"usable": False, "status": "missing", "reason": "derived parents or numeric fields are unresolved"}
            elif resolver.get("operation") != "left_minus_right_pct_of_right" or right_value == 0:
                result = {"usable": False, "status": "suspect", "reason": "unsupported derived operation"}
            elif (
                requirement["quality"].get("max_parent_gap_days") is not None
                and abs((_parse_instant(left["vintage"]["as_of"]) - _parse_instant(right["vintage"]["as_of"])).total_seconds())
                > requirement["quality"]["max_parent_gap_days"] * 86400
            ):
                result = {"usable": False, "status": "suspect", "reason": "derived parent timestamps are not aligned"}
            else:
                parent_vintages = [left["vintage_id"], right["vintage_id"]]
                as_of = min(left["vintage"]["as_of"], right["vintage"]["as_of"])
                payload = {
                    "value": (float(left_value) - float(right_value)) / float(right_value) * 100.0,
                    "unit": "percent", "operation": "left_minus_right_pct_of_right",
                    "parent_vintage_ids": parent_vintages,
                }
                identity = {"kind": "derived", "series_id": current_series, "payload": payload}
                result = _resolved(
                    series_id=current_series, payload=payload, as_of=as_of,
                    dataset_id=f"derived.{current_series}", connector_id=None,
                    provider="Nostra deterministic derivation", acquisition="derived",
                    tier=max(left["vintage"]["tier"], right["vintage"]["tier"]),
                    identity=identity, retrieved_at=max(left["vintage"]["retrieved_at"], right["vintage"]["retrieved_at"]),
                )
        resolving.remove(current_series)
        cache[current_series] = result
        return result

    return resolve(series_id)


def _result_row(row: dict[str, Any], result: dict[str, Any]) -> dict[str, Any]:
    status = "usable" if result.get("usable") is True else result.get("status", "suspect")
    if status not in STATUSES:
        raise ValueError(f"unknown coverage status {status}")
    vintage = result.get("vintage") if isinstance(result, dict) else None
    manifest = result.get("manifest") if isinstance(result, dict) else None
    return {
        "need_id": row["need"], "series_id": row["series"], "owner_orb": row["owner"],
        "required_history_freshness": row["requirement"], "lawful_source_policy": row["policy"],
        "status": status, "as_of": vintage.get("as_of") if isinstance(vintage, dict) else None,
        "vintage_id": result.get("vintage_id") if isinstance(result, dict) else None,
        "dataset_id": vintage.get("dataset_id") if isinstance(vintage, dict) else (
            manifest.get("dataset_id") if isinstance(manifest, dict) else None
        ),
        "connector_id": vintage.get("connector_id") if isinstance(vintage, dict) else (
            manifest.get("id") if isinstance(manifest, dict) else None
        ),
        "provider": vintage.get("provider") if isinstance(vintage, dict) else (
            manifest.get("provider") if isinstance(manifest, dict) else None
        ),
        "reason": "point-in-time route satisfied the structured profile" if status == "usable" else result.get("reason", "unresolved"),
    }


def compile_coverage(
    *, commodity: str, decision_time: str, profile_path: Path = PROFILE_PATH,
    structured_root: Path = STRUCTURED_PROFILE_ROOT, connectors_root: Path = CONNECTORS_ROOT,
    data_root: Path = REPO / "data", market_root: Path = MARKET_ROOT, state_root: Path = STATE_ROOT,
    reader: Callable[..., dict[str, Any] | None] = read_point_in_time,
    manifests: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    commodity = commodity.upper()
    cutoff = _iso(_utc(decision_time))
    requirements = structured_profile(commodity, profile_path=profile_path, structured_root=structured_root)
    if manifests is None:
        manifests, defects = load_valid_manifests(str(connectors_root))
        if defects:
            raise ValueError(f"connector discovery failed: {defects[0]}")
    compiled = []
    for requirement in requirements:
        result = resolve_profile_series(
            requirement["series"], commodity, cutoff, profile_path=profile_path,
            structured_root=structured_root, connectors_root=connectors_root, data_root=data_root,
            market_root=market_root, state_root=state_root, reader=reader, manifests=manifests,
        )
        compiled.append(_result_row(requirement, result or {"status": "suspect", "reason": "resolver returned no result"}))
    unresolved = [row["need_id"] for row in compiled if row["status"] != "usable"]
    try:
        profile_identity = profile_path.resolve().relative_to(REPO).as_posix()
    except ValueError:
        profile_identity = profile_path.resolve().as_posix()
    return {
        "schema_version": 1, "commodity": commodity, "decision_time": cutoff,
        "generated_at": _iso(dt.datetime.now(dt.timezone.utc)), "profile_path": profile_identity,
        "required_count": len(compiled), "usable_count": len(compiled) - len(unresolved),
        "complete": not unresolved, "unresolved_need_ids": unresolved, "rows": compiled,
    }


def artifact_sha256(path: Path) -> str:
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("run_root", type=Path)
    parser.add_argument("--decision-time", help="timezone-aware ISO cutoff; defaults to now")
    parser.add_argument("--profile", type=Path, default=PROFILE_PATH)
    parser.add_argument("--structured-profile-root", type=Path, default=STRUCTURED_PROFILE_ROOT)
    parser.add_argument("--connectors-root", type=Path, default=CONNECTORS_ROOT)
    parser.add_argument("--data-root", type=Path, default=REPO / "data")
    parser.add_argument("--market-root", type=Path, default=MARKET_ROOT)
    parser.add_argument("--state-root", type=Path, default=STATE_ROOT)
    args = parser.parse_args()
    try:
        run_root = args.run_root.resolve()
        commodity = run_root.name.upper()
        decision_time = _iso(_utc(args.decision_time))
        artifact = compile_coverage(
            commodity=commodity, decision_time=decision_time, profile_path=args.profile,
            structured_root=args.structured_profile_root, connectors_root=args.connectors_root,
            data_root=args.data_root, market_root=args.market_root, state_root=args.state_root,
        )
        output = run_root / "required_series_coverage.json"
        atomic_write_json(str(output), artifact)
        digest = artifact_sha256(output)
    except (OSError, RuntimeError, ValueError) as error:
        print(f"PROFILE-COVERAGE-FAIL: {error}")
        return 1
    print(
        f"PROFILE-COVERAGE: complete={str(artifact['complete']).lower()} "
        f"usable={artifact['usable_count']}/{artifact['required_count']} "
        f"sha256={digest} path={output}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
