#!/usr/bin/env python3
"""Show implemented feeds and authoritative next-source routes for any commodity profile."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from commodity_profile_coverage import STRUCTURED_PROFILE_ROOT, structured_profile
from connector_contract import load_valid_manifests


REPO = Path(__file__).resolve().parents[1]
CONNECTORS_ROOT = REPO / ".claude" / "connectors"
AUTHORITY_PATH = REPO / "frameworks" / "commodity" / "SOURCE_AUTHORITIES.json"


def load_authorities(path: Path = AUTHORITY_PATH) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"source-authority guide is missing or invalid: {error}") from error
    if (
        not isinstance(value, dict) or set(value) != {
            "schema_version", "purpose", "selection_order", "capital_iq", "rules",
        }
        or value.get("schema_version") != 1
        or not isinstance(value.get("purpose"), str) or not value["purpose"]
        or not isinstance(value.get("selection_order"), list) or not value["selection_order"]
        or not all(isinstance(item, str) and item for item in value["selection_order"])
        or not isinstance(value.get("rules"), list) or not value["rules"]
    ):
        raise ValueError("source-authority guide has an invalid top-level contract")
    seen: set[str] = set()
    for index, rule in enumerate(value["rules"]):
        if (
            not isinstance(rule, dict)
            or set(rule) != {"id", "need_pattern", "preferred_route", "authorities", "capital_iq_fallback"}
            or not isinstance(rule.get("id"), str) or rule["id"] in seen
            or not isinstance(rule.get("preferred_route"), str) or not rule["preferred_route"]
            or not isinstance(rule.get("capital_iq_fallback"), str) or not rule["capital_iq_fallback"]
            or not isinstance(rule.get("authorities"), list) or not rule["authorities"]
        ):
            raise ValueError(f"source-authority rule {index} is malformed")
        seen.add(rule["id"])
        try:
            re.compile(rule["need_pattern"])
        except (TypeError, re.error) as error:
            raise ValueError(f"source-authority rule {rule.get('id')} has invalid regex") from error
        for authority in rule["authorities"]:
            if (
                not isinstance(authority, dict) or set(authority) != {"provider", "url", "access"}
                or authority.get("access") not in {"public", "licensed", "restricted", "mixed"}
                or not isinstance(authority.get("provider"), str) or not authority["provider"]
                or not isinstance(authority.get("url"), str)
                or urlparse(authority["url"]).scheme != "https"
            ):
                raise ValueError(f"source-authority rule {rule['id']} has invalid authority metadata")
    capital_iq = value.get("capital_iq")
    if (
        not isinstance(capital_iq, dict)
        or set(capital_iq) != {"provider", "access", "terms_url", "route", "rule"}
        or capital_iq.get("access") != "licensed"
        or any(
            not isinstance(capital_iq.get(field), str) or not capital_iq[field]
            for field in ("provider", "terms_url", "route", "rule")
        )
        or urlparse(str(capital_iq.get("terms_url"))).scheme != "https"
    ):
        raise ValueError("Capital IQ source policy is malformed")
    return value


def source_rule(need: str, guide: dict[str, Any]) -> dict[str, Any]:
    for rule in guide["rules"]:
        if re.search(rule["need_pattern"], need):
            return rule
    raise ValueError(f"no source-authority rule covers {need}")


def build_plan(
    commodity: str, *, structured_root: Path = STRUCTURED_PROFILE_ROOT,
    connectors_root: Path = CONNECTORS_ROOT, guide_path: Path = AUTHORITY_PATH,
) -> dict[str, Any]:
    commodity = commodity.upper()
    requirements = structured_profile(commodity, structured_root=structured_root)
    manifests, defects = load_valid_manifests(str(connectors_root))
    if defects:
        raise ValueError(f"connector discovery failed: {defects[0]}")
    guide = load_authorities(guide_path)
    rows = []
    for requirement in requirements:
        kind = requirement["resolver"]["kind"]
        claimants = [
            manifest for manifest in manifests
            if commodity in manifest.get("subjects", [])
            and requirement["need"] in manifest.get("satisfies", [])
        ] if kind == "connector" else []
        owners = [
            manifest for manifest in claimants
            if manifest.get("series_id") == requirement["series"]
        ]
        conflicts = [manifest for manifest in claimants if manifest not in owners]
        primary = next((owner for owner in owners if not owner.get("fallback_for")), None)
        if kind != "connector":
            status = "profile_route"
        elif conflicts:
            status = "contract_conflict"
        elif primary is None:
            status = "build_needed"
        elif all(owner.get("acquisition") == "manual" for owner in owners):
            status = "implemented_manual"
        else:
            status = "implemented_automatic"
        rule = source_rule(requirement["need"], guide)
        rows.append({
            "need_id": requirement["need"], "series_id": requirement["series"],
            "owner_orb": requirement["owner"], "resolver_kind": kind, "status": status,
            "required_history_freshness": requirement["requirement"],
            "lawful_source_policy": requirement["policy"],
            "connector_ids": [owner["id"] for owner in owners],
            "conflicting_connector_ids": [owner["id"] for owner in conflicts],
            "primary_connector_id": primary.get("id") if isinstance(primary, dict) else None,
            "source_rule_id": rule["id"], "preferred_route": rule["preferred_route"],
            "authorities": rule["authorities"],
            "capital_iq_fallback": rule["capital_iq_fallback"],
        })
    counts = {status: sum(row["status"] == status for row in rows) for status in (
        "implemented_automatic", "implemented_manual", "build_needed", "contract_conflict",
        "profile_route",
    )}
    return {
        "schema_version": 1, "commodity": commodity, "counts": counts,
        "capital_iq_policy": guide["capital_iq"], "rows": rows,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("commodity", nargs="?", help="profile commodity; omit with --all")
    parser.add_argument("--all", action="store_true", help="plan every structured commodity profile")
    parser.add_argument("--json", action="store_true", help="emit machine-readable JSON")
    parser.add_argument("--gaps-only", action="store_true")
    args = parser.parse_args()
    if args.all == bool(args.commodity):
        parser.error("pass exactly one commodity or --all")
    commodities = (
        [path.stem for path in sorted(STRUCTURED_PROFILE_ROOT.glob("*.json"))]
        if args.all else [args.commodity.upper()]
    )
    try:
        plans = [build_plan(commodity) for commodity in commodities]
    except (OSError, ValueError) as error:
        print(f"FEED-PLAN-FAIL: {error}")
        return 1
    if args.gaps_only:
        for plan in plans:
            plan["rows"] = [
                row for row in plan["rows"]
                if row["status"] in {"build_needed", "contract_conflict"}
            ]
    if args.json:
        print(json.dumps(plans[0] if len(plans) == 1 else plans, indent=2))
        return 0
    for plan in plans:
        counts = plan["counts"]
        print(
            f"{plan['commodity']}: automatic={counts['implemented_automatic']} "
            f"manual={counts['implemented_manual']} gaps={counts['build_needed']} "
            f"conflicts={counts['contract_conflict']} "
            f"profile_routes={counts['profile_route']}"
        )
        for row in plan["rows"]:
            if args.gaps_only or row["status"] in {"build_needed", "contract_conflict"}:
                providers = ", ".join(authority["provider"] for authority in row["authorities"])
                print(f"  {row['need_id']}: {row['preferred_route']} -> {providers}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
