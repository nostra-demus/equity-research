#!/usr/bin/env python3
"""scripts/sensitivity_math.py — deterministic what-if / sensitivity math for the research chat.

WHY THIS EXISTS
    The cockpit chat should answer "what's Adjusted EBITDA / operating margin if the aluminium price
    moves +$45/mt?" — but a language model must NEVER do that arithmetic itself (CLAUDE.md §20 "bad
    math"; §3 no-source-no-claim). The engine's own sensitivity orb (earnings/07_earnings-sensitivity.md)
    has ALREADY extracted the company-disclosed per-unit coefficient (e.g. NOK 150m Adjusted EBITDA per
    +USD 10/mt), the base level, the confidence, the valid scenario range, and the non-linearity caveats.

    This module makes the WHAT-IF deterministic and PURE, the exact mirror of scripts/valuation_math.py:
    given the recorded coefficient (a `sensitivity_summary.json` sidecar) and a user delta, it computes the
    new level by LINEAR application of the orb's own coefficient — no re-derivation, no model arithmetic.
    The result carries the orb's confidence, source, and range/non-linearity flags forward verbatim, so the
    answer is exactly as reliable as the disclosed figure it scales, and no more.

    HONEST SCOPE: it scales a recorded coefficient linearly and flags when a move leaves the disclosed
    range or where the orb noted a non-linearity. It does NOT invent a coefficient, pick which variable you
    meant, or judge the thesis. An unknown variable is refused, never fabricated.
"""
from __future__ import annotations

import math
import re
from datetime import date
from decimal import Decimal, localcontext
from typing import Optional


def _isnum(v) -> bool:
    # bool is a subclass of int; NaN/inf are floats — reject both, or a malformed sidecar (JSON allows NaN)
    # would produce a nan impact/new_value that the guard would still report as "valid".
    return isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v)


def _num(v, default=None):
    return float(v) if _isnum(v) else default


def _find(sensitivities: list, variable: str) -> Optional[dict]:
    """Match a variable by its `variable` key OR its human `label` (case-insensitive), so the caller can
    pass either the machine key ('lme_aluminium_price') or the label ('LME aluminium price').

    None-safe (a null label never becomes the string "None"), and it REFUSES an ambiguous request: if two
    entries match the key (duplicate variable, or a label colliding with another variable), it returns None
    rather than silently picking the first by array order — the answer must not depend on ordering."""
    key = str(variable or "").strip().lower()
    if not key:
        return None
    matches = [
        s for s in sensitivities
        if isinstance(s, dict)
        and ((s.get("variable") and str(s.get("variable")).strip().lower() == key)
             or (s.get("label") and str(s.get("label")).strip().lower() == key))
    ]
    return matches[0] if len(matches) == 1 else None


def scenario(sidecar: dict, variable: str, delta) -> dict:
    """Apply a `delta` (in the variable's own unit) to one recorded sensitivity, LINEARLY, from the sidecar.

    Returns a dict with the deterministic result, or {"error": ...} if the variable is unknown or the
    inputs are unusable (never a fabricated number). Fields:
      variable, label, unit, delta, coefficient, impact_metric,
      impact            = delta * coefficient  (the change in the base metric, e.g. NOK m Adj. EBITDA)
      base_value, new_value
      base_margin_pct, new_margin_pct, margin_change_bps   (only when a revenue base is recorded)
      within_disclosed_range (bool|None), non_linearity, confidence, basis, source
    """
    if not isinstance(sidecar, dict):
        return {"error": "sensitivity_summary is not an object"}
    sens = sidecar.get("sensitivities")
    if not isinstance(sens, list) or not sens:
        return {"error": "no sensitivities recorded for this run"}
    s = _find(sens, variable)
    if s is None:
        have = ", ".join(sorted(str(x.get("variable")) for x in sens if isinstance(x, dict) and x.get("variable")))
        return {"error": f"no recorded sensitivity for {variable!r} — recorded variables: {have}"}

    mitigation_error = _disclosed_positions_error(s)
    if mitigation_error:
        return {"error": mitigation_error}

    coeff = _num(s.get("coefficient"))
    d = _num(delta)
    base = _num(sidecar.get("base_value"))
    if coeff is None or d is None:
        return {"error": f"non-numeric coefficient ({s.get('coefficient')!r}) or delta ({delta!r})"}

    impact = round(d * coeff, 4)  # change in the base metric (deterministic: delta × recorded coefficient)

    # Which metric does this coefficient actually move? The schema lets a row carry its own impact_metric.
    # If it differs from the sidecar's base metric, `impact` is in a DIFFERENT metric — adding it to base_value
    # (an adjusted-EBITDA level, say) would fabricate a level, so we report the impact but withhold the level
    # and margin rather than compute a wrong number.
    base_metric = sidecar.get("base_metric")
    row_metric = s.get("impact_metric") or base_metric
    same_metric = row_metric == base_metric

    out = {
        "variable": s.get("variable"),
        "label": s.get("label"),
        "unit": s.get("unit"),
        "delta": d,
        "coefficient": coeff,
        "impact_metric": row_metric,
        "impact": impact,
        "base_value": base if same_metric else None,
        "new_value": round(base + impact, 4) if (base is not None and same_metric) else None,
        "confidence": s.get("confidence"),
        "basis": s.get("basis"),
        "source": s.get("source"),
        "non_linearity": s.get("non_linearity"),
    }
    if not same_metric:
        out["metric_note"] = (f"coefficient is on {row_metric}, not the sidecar base metric {base_metric} — "
                              f"the base level and margin are not applied")

    # Margin scenario — ONLY for a profit-level base metric (EBITDA/EBIT/operating profit) with a revenue
    # denominator, and only when the coefficient is on that same metric. A per-share metric (EPS) over revenue
    # is nonsensical, so it is skipped. IMPORTANT basis: we hold revenue CONSTANT (the sidecar records a
    # revenue base, not a revenue sensitivity), so this is the margin implied by the profit move at unchanged
    # revenue — flagged `margin_basis: revenue_constant` and never presented as a fully-modeled margin.
    rev = _num(sidecar.get("revenue_base"))
    bm = str(base_metric or "").lower()
    is_profit_metric = any(k in bm for k in ("ebitda", "ebit", "operating", "profit", "income"))
    per_share = any(k in bm for k in ("eps", "per_share", "per-share"))
    if rev and rev > 0 and base is not None and same_metric and is_profit_metric and not per_share:
        base_margin = base / rev * 100.0
        new_margin = (base + impact) / rev * 100.0
        out["base_margin_pct"] = round(base_margin, 3)
        out["new_margin_pct"] = round(new_margin, 3)
        out["margin_change_bps"] = round((new_margin - base_margin) * 100.0, 1)
        out["margin_basis"] = "revenue_constant"

    # Range flag — a linear scale is only trustworthy within the orb's disclosed band. A ONE-SIDED band
    # (only low, or only high) is still enforced on the side it discloses; None means no band was recorded.
    vr = s.get("valid_range") if isinstance(s.get("valid_range"), dict) else None
    lo = _num(vr.get("low")) if vr else None
    hi = _num(vr.get("high")) if vr else None
    if lo is not None or hi is not None:
        outside = (lo is not None and d < lo) or (hi is not None and d > hi)
        out["within_disclosed_range"] = not outside
        if outside:
            band = f"[{lo if lo is not None else '−inf'}, {hi if hi is not None else '+inf'}]"
            out["range_note"] = (f"delta {d} is outside the orb's disclosed scenario range {band} — "
                                 f"the linear coefficient is not validated this far from base")
    else:
        out["within_disclosed_range"] = None

    out.update(_mitigation(s, impact, out.get("base_value"), rev if (rev and rev > 0 and "margin_change_bps" in out) else None))
    return out


# ── §9 mitigation assumption — carried onto EVERY modelled number ─────────────────────────────────────────
# CLAUDE.md §9: "A sensitivity or stress scenario that holds management's response at zero ... is a *bound*,
# not a forecast, and must be labelled as one on every line it appears", and where the filings show the
# realised offset, that measured rate runs as a second case beside the bound. The orb's markdown table
# already carries a "Mitigation assumed" column, but before these fields the sidecar did not, so the chat
# re-published a 0%-mitigation linear figure as THE answer — the §3 qualifier falling off one layer up.
MITIGATION_BASES = ("zero_bound", "realised_offset", "disclosed_zero", "not_applicable", "disclosed_positions")
DISCLOSED_POSITIONS_SCOPE = "fixed_existing_positions_no_additional_response"
# Python and JavaScript disagree on \s (notably BOM, NEL and ASCII separators). Use the same explicit
# whitespace set as the new-state JSON schema, so blank metadata cannot pass one boundary but not another.
DISCLOSED_POSITIONS_NONBLANK = r"[^\u0009-\u000D\u001C-\u0020\u0085\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]"


def _disclosed_positions_error(s: dict) -> Optional[str]:
    """One shared consistency check for the new source-position basis, before any scenario arithmetic.

    This validates the declared contract, not the source itself: the reading layer must verify that the
    citation supports the positions, date and coefficient. Existing mitigation states retain their rules.
    """
    if s.get("mitigation_basis") != "disclosed_positions":
        return None
    if s.get("basis") != "company-disclosed":
        return "disclosed_positions requires a company-disclosed coefficient"
    if s.get("mitigation_scope") != DISCLOSED_POSITIONS_SCOPE:
        return f"disclosed_positions requires mitigation_scope {DISCLOSED_POSITIONS_SCOPE}"
    for field in ("embedded_hedges", "source"):
        value = s.get(field)
        if not isinstance(value, str) or not re.search(DISCLOSED_POSITIONS_NONBLANK, value):
            return f"disclosed_positions requires a nonblank {field}"
    stamp = s.get("embedded_hedges_as_of")
    if not isinstance(stamp, str) or not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", stamp):
        return "disclosed_positions requires embedded_hedges_as_of as an ISO calendar date"
    try:
        date.fromisoformat(stamp)
    except ValueError:
        return "disclosed_positions embedded_hedges_as_of is not a real calendar date"
    # Unknown is absent/null, never an invented 0% measurement or a citation to an unavailable offset.
    for field in ("realised_offset_pct", "realised_offset_source"):
        if s.get(field) is not None:
            return f"disclosed_positions requires {field} to be absent or null — the measured offset is unavailable"
    return None


def _pct(v):
    """A percentage in [0, 100], or None."""
    return float(v) if _isnum(v) and 0 <= float(v) <= 100 else None


def _mitigation(s: dict, impact: float, base, rev) -> dict:
    """Label the recorded coefficient's mitigation basis and, where a realised offset is recorded, compute
    the OTHER case beside it (the mitigated case for a gross bound; the gross bound for a net coefficient).

    `mitigation_basis` semantics (what the recorded `coefficient` embeds):
      zero_bound       gross, 0% management response — a BOUND. `realised_offset_pct` (optional) is the offset
                       measured from the filings; when present the realised case is computed beside the bound.
      realised_offset  already NET of the measured `realised_offset_pct` (< 100); the gross bound is shown beside.
      disclosed_zero   0% is the company's own disclosed response (a measurement, not an assumption).
      not_applicable   the variable has no management-response channel (e.g. it IS the response channel).
      disclosed_positions  source positions remain embedded; no gross counterpart or measured offset is
                       available. Zero ADDITIONAL response is an explicit analyst assumption, not gross zero.
    Absent (legacy sidecar) → treated conservatively as an unlabelled zero-mitigation bound (§4)."""
    mb = s.get("mitigation_basis")
    off = _pct(s.get("realised_offset_pct"))
    src = s.get("realised_offset_source") if isinstance(s.get("realised_offset_source"), str) else None
    o = {"mitigation_basis": mb if mb in MITIGATION_BASES else None}

    def _other_case(alt_impact, key):
        o[f"{key}_impact"] = round(alt_impact, 4)
        if base is not None:
            o[f"{key}_new_value"] = round(base + alt_impact, 4)
            if rev:
                o[f"{key}_margin_change_bps"] = round(alt_impact / rev * 1e4, 1)  # (Δ/rev) ×100 pct ×100 bps

    if mb == "disclosed_positions":
        o["is_bound"] = True
        o["mitigation_note"] = (
            "Fixed-existing-positions, zero-ADDITIONAL-response BOUND (§9): source positions at "
            f"{s['embedded_hedges_as_of']} remain included ({s['embedded_hedges']}; {s['source']}). "
            "No additional management response is modelled — an analyst assumption, not a company forecast. "
            "This is not an unhedged gross coefficient or a proven worst-case outcome. "
            "Gross exposure and a measured realised offset are not assessable from the available matched evidence."
        )
    elif mb == "zero_bound":
        o["is_bound"] = True
        if off is not None:
            _other_case(impact * (1 - off / 100.0), "mitigated")
            o["realised_offset_pct"], o["realised_offset_source"] = off, src
            o["mitigation_note"] = (f"Zero-mitigation BOUND (§9): management response held at zero — not a forecast. "
                                    f"At the realised {off:g}% offset measured from the filings ({src or 'source not recorded'}), "
                                    f"the change is {o['mitigated_impact']:+g} instead of {impact:+g}.")
        else:
            o["mitigation_note"] = ("Zero-mitigation BOUND (§9): management response held at zero — not a forecast; "
                                    "a realised offset was not computable from the pool.")
    elif mb == "realised_offset" and off is not None and off < 100:
        o["is_bound"] = False
        o["realised_offset_pct"], o["realised_offset_source"] = off, src
        _other_case(impact / (1 - off / 100.0), "gross_bound")
        o["mitigation_note"] = (f"Net of a realised {off:g}% offset measured from the filings ({src or 'source not recorded'}) (§9). "
                                f"The zero-mitigation bound is {o['gross_bound_impact']:+g}.")
    elif mb == "disclosed_zero":
        o["is_bound"] = False
        o["mitigation_note"] = "0% mitigation is the company's disclosed response, a measurement rather than an assumption (§9)."
    elif mb == "not_applicable":
        o["is_bound"] = False
        o["mitigation_note"] = "No management-response channel applies to this variable (§9)."
    else:
        o["is_bound"] = True
        o["mitigation_note"] = ("Mitigation assumption NOT recorded for this coefficient — treat it as a zero-mitigation "
                                "bound (§9), not a forecast.")
    return o


def list_variables(sidecar: dict) -> list:
    """The variables a run CAN be asked about (so the chat/UI never offers one that isn't recorded)."""
    if not isinstance(sidecar, dict) or not isinstance(sidecar.get("sensitivities"), list):
        return []
    return [{"variable": s.get("variable"), "label": s.get("label"), "unit": s.get("unit"),
             "confidence": s.get("confidence")} for s in sidecar["sensitivities"] if isinstance(s, dict)]


def resolve_scenario(sidecar: dict, variable: str, req: dict) -> dict:
    """Resolve a request to a delta, then run the forward scenario() — the single entry the chat uses so ALL
    the arithmetic (including level→delta and the reverse solve) stays in this one deterministic engine.

    `req` carries exactly ONE intent:
      {"delta": d}            forward move (v1) — the variable moves by d of its own unit.
      {"target_level": L}     the variable is AT level L → delta = L − (its recorded base_value).
      {"target": T}           reverse: solve for the move that makes the base metric equal T.
      {"target_margin": M}    reverse: solve for the move that makes the operating margin equal M% .

    Returns scenario()'s dict plus `mode` ('delta'|'level'|'reverse') and the resolved inputs, or {"error"}.
    Never fabricates: a request the sidecar can't support (no variable base for a level, no revenue base for a
    margin target, mismatched impact/base metrics, zero coefficient) is an explicit error, not a guessed number.
    """
    if not isinstance(sidecar, dict):
        return {"error": "sensitivity_summary is not an object"}
    sens = sidecar.get("sensitivities")
    if not isinstance(sens, list) or not sens:
        return {"error": "no sensitivities recorded for this run"}
    s = _find(sens, variable)
    if s is None:
        have = ", ".join(sorted(str(x.get("variable")) for x in sens if isinstance(x, dict) and x.get("variable")))
        return {"error": f"no recorded sensitivity for {variable!r} — recorded variables: {have}"}

    mitigation_error = _disclosed_positions_error(s)
    if mitigation_error:
        return {"error": mitigation_error}

    coeff = _num(s.get("coefficient"))
    base = _num(sidecar.get("base_value"))       # base level of the base metric (e.g. FY25 Adj EBITDA)
    var_base = _num(s.get("base_value"))          # current level of the variable itself (e.g. 3192 USD/mt)
    rev = _num(sidecar.get("revenue_base"))

    mode, delta, extra = None, None, {}
    if req.get("delta") is not None:
        mode, delta = "delta", _num(req.get("delta"))
    elif req.get("target_level") is not None:
        mode = "level"
        tl = _num(req.get("target_level"))
        if tl is None or var_base is None:
            return {"error": f"cannot use a target level for {variable!r}: no recorded current level to measure from"}
        delta = tl - var_base
        extra = {"target_level": tl, "variable_base": var_base}
    elif req.get("target") is not None or req.get("target_margin") is not None:
        mode = "reverse"
        base_metric = sidecar.get("base_metric")
        impact_metric = s.get("impact_metric") or base_metric
        if impact_metric != base_metric:
            return {"error": f"cannot solve: coefficient is on {impact_metric}, not the base metric {base_metric}"}
        if coeff is None or coeff == 0:
            return {"error": "cannot solve: the recorded coefficient is zero or missing"}
        if base is None:
            return {"error": "cannot solve: the base-metric value is missing"}
        if req.get("target_margin") is not None:
            tm = _num(req.get("target_margin"))
            if tm is None or rev is None or rev <= 0:
                return {"error": "cannot solve for a margin: this run recorded no revenue base"}
            target_value = tm / 100.0 * rev
            extra["target_margin_pct"] = tm
        else:
            target_value = _num(req.get("target"))
            if target_value is None:
                return {"error": "cannot solve: the target value is not numeric"}
        needed = target_value - base
        delta = needed / coeff
        extra.update({
            "target_value": round(target_value, 4),
            "needed_impact": round(needed, 4),
            "solved_variable_level": round(var_base + delta, 4) if var_base is not None else None,
        })
    else:
        return {"error": "request carries no delta, target_level, target, or target_margin"}

    if delta is None:
        return {"error": "could not resolve a numeric move from the request"}
    out = scenario(sidecar, variable, delta)   # one code path — the same linear scale the guard checks
    if "error" in out:
        return out
    out["mode"] = mode
    out["resolved_delta"] = round(delta, 4)
    out.update(extra)
    return out


# ---------------------------------------------------------------------------
# selftest — fixture-free CI gate, grounded in NHY_2026-07-19's real recorded coefficients
# ---------------------------------------------------------------------------
# Additive accounting uses the same authority/CLI as coefficients, but is a different operation. A
# source identity is not a marginal-cost rate. No coefficient or mitigation state is manufactured.
ADDITIVE_METRICS = {"revenue", "net_sales", "operating_income", "ebit", "ebitda", "net_income"}
ADDITIVE_CONTEXT = {"entity", "metric", "basis", "currency", "scale", "period_start", "period_end",
                    "period_basis", "period_label", "scope", "accounting_standard"}
_ADDITIVE_UNKNOWN = {"unknown", "unavailable", "unresolved", "not assessable", "not available", "n/a"}
_LEGACY_FIELDS = {"sensitivities", "base_metric", "base_value", "base_value_source", "base_period",
                  "revenue_base", "revenue_period"}


def _add_key(s):
    return " ".join(s.split()).casefold() if isinstance(s, str) else ""


def _add_text(s):
    return isinstance(s, str) and bool(re.search(DISCLOSED_POSITIONS_NONBLANK, s))


def _add_isnum(v):
    try:
        return _isnum(v)
    except OverflowError:
        return False


def _add_closed(o, required, optional=()):
    return isinstance(o, dict) and set(required) <= set(o) <= set(required) | set(optional)


def _add_dates(start, end):
    try:
        return all(isinstance(s, str) and re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", s)
                   for s in (start, end)) and date.fromisoformat(start) <= date.fromisoformat(end)
    except ValueError:
        return False


def _add_context(ctx):
    if not _add_closed(ctx, ADDITIVE_CONTEXT) or any(not _add_text(v) or _add_key(v) in _ADDITIVE_UNKNOWN
                                                   for v in ctx.values()):
        return None
    c = dict(ctx)
    c["metric"] = c["metric"].strip().casefold()
    adjusted = re.fullmatch(r"company_adjusted:[A-Za-z0-9_.-]+", c["basis"])
    if c["metric"] == "adjusted_ebitda" and adjusted:
        c["metric"] = "ebitda"
    if c["metric"] not in ADDITIVE_METRICS or not (c["basis"] == "reported" or adjusted):
        return None
    if not re.fullmatch(r"[A-Z]{3}", c["currency"]) or c["scale"] not in ("units", "thousands", "millions"):
        return None
    if c["period_basis"] not in ("standalone_flow", "cumulative_flow") or not _add_dates(c["period_start"], c["period_end"]):
        return None
    return c


def _add_coverage(value):
    if not isinstance(value, list) or not value or any(not _add_text(x) for x in value):
        return None
    keys = [_add_key(x) for x in value]
    return set(keys) if len(set(keys)) == len(keys) else None


def _add_unique(rows, id_key):
    names = {}
    for i, row in enumerate(rows):
        if not isinstance(row, dict) or any(not _add_text(row.get(k)) for k in (id_key, "label")):
            return False
        for name in (_add_key(row[id_key]), _add_key(row["label"])):
            if name in names and names[name] != i:
                return False
            names[name] = i
    return True


def validate_additive_sidecar(sidecar, run_date=None):
    """Declared shape/basis/coverage only, not source authentication. Unknown future assumptions can be
    retained as data; they withhold a future solve. A supplied broken coefficient collection is never ignored.
    """
    if not isinstance(sidecar, dict):
        return ["invalid_shape: sidecar is not an object"]
    errors = []
    if any(not _add_text(sidecar.get(k)) for k in ("schema_version", "ticker")):
        errors.append("invalid_shape: schema_version and ticker must be nonblank")
    if any(k in sidecar for k in _LEGACY_FIELDS):
        # Reuse the existing guard, not a weaker second copy of its coefficient/source/mitigation rules.
        from sensitivity_summary_checks import _check_legacy_sensitivity_summary, _legacy_schema_type_violations
        legacy_errors = _legacy_schema_type_violations(sidecar)
        if not legacy_errors:
            legacy_errors = _check_legacy_sensitivity_summary(sidecar, run_date)
        errors.extend("invalid_legacy: " + e for e in legacy_errors)
    identities = sidecar.get("additive_identities")
    if not isinstance(identities, list) or not identities or not _add_unique(identities, "identity_id"):
        return errors + ["ambiguous_identity_or_component: additive identities need unique IDs/labels"]
    for ident in identities:
        if not _add_closed(ident, ("identity_id", "label", "context", "total", "components"), ("conditional_profiles",)):
            errors.append("invalid_shape: additive identity has missing/unknown fields")
            continue
        ctx = _add_context(ident["context"])
        if ctx is None:
            errors.append("context_mismatch: unsupported monetary-flow metric or incomplete source context")
            continue
        total, parts = ident["total"], ident["components"]
        if not _add_closed(total, ("value", "source", "context", "coverage")):
            errors.append("invalid_shape: total has missing/unknown fields")
            continue
        coverage = _add_coverage(total["coverage"])
        if coverage is None:
            errors.append("declared_scope_overlap_or_gap: total coverage is blank/duplicated")
        if not _add_isnum(total["value"]) or not _add_text(total["source"]):
            errors.append("missing_source_or_number: total needs a finite signed amount and citation")
        if _add_context(total["context"]) != ctx:
            errors.append("context_mismatch: total context differs from identity")
        if not isinstance(parts, list) or not parts or not _add_unique(parts, "component_id"):
            errors.append("ambiguous_identity_or_component: components need unique IDs/labels")
            continue
        seen = set()
        ids = {p["component_id"] for p in parts}
        for part in parts:
            if not _add_closed(part, ("component_id", "label", "value", "source", "context", "coverage")):
                errors.append("invalid_shape: component has missing/unknown fields")
                continue
            pc = _add_coverage(part["coverage"])
            if pc is None or seen.intersection(pc) or coverage is None or not pc <= coverage:
                errors.append("declared_scope_overlap_or_gap: component coverage overlaps or escapes total")
            if pc:
                seen.update(pc)
            if not _add_isnum(part["value"]) or not _add_text(part["source"]):
                errors.append("missing_source_or_number: every component needs a finite signed amount and citation")
            if _add_context(part["context"]) != ctx:
                errors.append("context_mismatch: component context differs from total")
        if seen != coverage:
            errors.append("declared_scope_overlap_or_gap: components do not cover declared total scope")
        profiles = ident.get("conditional_profiles", [])
        if not isinstance(profiles, list) or not _add_unique(profiles, "profile_id"):
            errors.append("ambiguous_identity_or_component: profiles need unique IDs/labels")
            continue
        for profile in profiles:
            required = ("profile_id", "label", "target_period_start", "target_period_end", "target_period_basis",
                        "target_period_label", "assumption", "component_holds", "residual")
            if not _add_closed(profile, required):
                errors.append("invalid_shape: conditional profile has missing/unknown fields")
                continue
            if not _add_dates(profile["target_period_start"], profile["target_period_end"]) or profile["target_period_basis"] != ctx["period_basis"]:
                errors.append("context_mismatch: profile target dates/basis are invalid")
            if any(not _add_text(profile[k]) for k in ("target_period_label", "assumption")):
                errors.append("invalid_shape: conditional profile needs period label and explicit assumption")
            holds, residual = profile["component_holds"], profile["residual"]
            if not isinstance(holds, dict) or not set(holds) <= ids or any(v is not None and not _add_text(v) for v in holds.values()):
                errors.append("invalid_shape: component holds must name recorded IDs and explicit text or null")
            if not _add_closed(residual, (), ("value", "assumption")) or (residual.get("value") is not None and not _add_isnum(residual["value"])) or (residual.get("assumption") is not None and not _add_text(residual["assumption"])):
                errors.append("invalid_shape: residual must be a finite explicit value or unknown, with assumption text or null")
    return errors


def _add_period(ctx):
    return {"start": ctx["period_start"], "end": ctx["period_end"], "basis": ctx["period_basis"], "label": ctx["period_label"]}


def _add_decimal(value):
    return Decimal(str(value))


def _add_number(value):
    return int(value) if value == value.to_integral_value() else float(value)


def _add_selection(expression, parts):
    """Consume whole recorded labels plus separators. Internal 'and' stays inside a label."""
    solutions = {}
    def consume(text, selected):
        if len(solutions) > 1:
            return
        candidates = [p for p in parts if text == _add_key(p["label"]) or text.startswith(_add_key(p["label"]) + " ")
                      or text.startswith(_add_key(p["label"]) + ",") or text.startswith(_add_key(p["label"]) + "&")]
        for part in candidates:
            if part["component_id"] in selected:
                continue
            chosen = selected + [part["component_id"]]
            rest = text[len(_add_key(part["label"])):].lstrip()
            if not rest:
                solutions[tuple(sorted(chosen))] = chosen
            else:
                sep = re.match(r"^(?:,\s*(?:(?:and|plus)\s+)?|(?:and|plus)\s+|&\s*)", rest)
                if sep and rest[sep.end():]:
                    consume(rest[sep.end():], chosen)
    consume(_add_key(expression), [])
    return next(iter(solutions.values())) if len(solutions) == 1 else None


def _add_prefixes(ident, ctx, explicit_only=False):
    metric = ctx["metric"].replace("_", " ")
    descriptions = {_add_key(ident["label"])}
    if not explicit_only:
        descriptions |= {metric, "consolidated " + metric}
        descriptions |= ({"reported " + metric, "consolidated reported " + metric} if ctx["basis"] == "reported" else {"company-adjusted " + metric})
    return {"using " + article + _add_key(ctx["period_label"]) + " " + desc + " identity"
            for article in ("", "the ") for desc in descriptions}


def _add_identity_grounding(sidecar, ident, req):
    """Do not let a model choose between two identities satisfying the same generic metric intro."""
    if not _add_text(req.get("question")):
        return False
    q = _add_key(req["question"]).rstrip("?!. ")
    if req["mode"] == "reconcile":
        return q == "reconcile " + _add_key(ident["label"]) + " for " + _add_key(ident["context"]["period_label"])
    prefix = q.split("how much is ", 1)[0].rstrip(" ,:")
    explicit, generic = [], []
    for candidate in sidecar["additive_identities"]:
        ctx = _add_context(candidate["context"])
        if prefix in _add_prefixes(candidate, ctx, explicit_only=True):
            explicit.append(candidate["identity_id"])
        if prefix in _add_prefixes(candidate, ctx):
            generic.append(candidate["identity_id"])
    matches = explicit or generic
    return len(matches) == 1 and matches[0] == ident["identity_id"]


def _add_ground(ident, req, ctx):
    """Conservative supported question syntax; model IDs/values alone confer no authority."""
    question = req.get("question")
    if not _add_text(question):
        return "question_binding_mismatch", "The original question is required."
    q = _add_key(question).rstrip("?!. ")
    if req["mode"] == "reconcile":
        expected = "reconcile " + _add_key(ident["label"]) + " for " + _add_key(ctx["period_label"])
        if q != expected or any(k in req for k in ("target", "conditional_profile_id", "remainder_component_ids")):
            return "question_binding_mismatch", "Reconcile only the named source-period identity; target/profile fields are not ignored."
        return None
    if q.count("how much is ") != 1:
        return "component_binding_mismatch", "Use 'how much is' followed by exact recorded component labels."
    prefix, tail = q.split("how much is ", 1)
    if prefix.rstrip(" ,:") not in _add_prefixes(ident, ctx):
        return "period_or_identity_binding_mismatch", "Name the recorded source-period identity before the component question."
    suffix = ""
    cut = re.search(r"\s+(?:if total is|for)\s+", tail)
    if cut:
        selection, suffix = tail[:cut.start()], tail[cut.start():].strip()
    else:
        selection = tail
    selected = _add_selection(selection, ident["components"])
    requested = req.get("remainder_component_ids")
    if not selected or not isinstance(requested, list) or any(not isinstance(x, str) for x in requested) or len(set(requested)) != len(requested) or set(selected) != set(requested):
        return "component_binding_mismatch", "The selected remainder components must exactly match the question, without exclusions or substitutions."
    if "target" in req:
        # Explicit TOTAL + exact currency/scale prevents years, component amounts and 31billion→31million.
        num = r"[+\-−]?(?:[0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)(?:\.[0-9]+)?"
        match = re.match(r"^if total is (" + num + r") ([a-z]{3}) (units?|thousands?|millions?)(?= |$)", suffix)
        scales = {"unit": "units", "units": "units", "thousand": "thousands", "thousands": "thousands", "million": "millions", "millions": "millions"}
        if not match or not _add_isnum(req["target"]) or match[2].upper() != ctx["currency"] or scales[match[3]] != ctx["scale"]:
            return "target_binding_mismatch", "State one total in the recorded currency and scale, e.g. 'if total is 31000 USD million'; no conversion is assumed."
        amount = Decimal(match[1].replace(",", "").replace("−", "-"))
        if amount != _add_decimal(req["target"]):
            return "target_binding_mismatch", "The parsed target is not the exact total amount written in the question."
        suffix = suffix[match.end():].strip()
    elif suffix.startswith("if total"):
        return "target_binding_mismatch", "The total clause cannot be silently ignored."
    if "conditional_profile_id" in req:
        profiles = [p for p in ident.get("conditional_profiles", []) if p["profile_id"] == req["conditional_profile_id"]]
        if len(profiles) != 1 or "target" not in req:
            return "period_or_profile_binding_mismatch", "A conditional profile requires an explicit grounded hypothetical total."
        p = profiles[0]
        expected = "for " + _add_key(p["target_period_label"]) + " under " + _add_key(p["label"])
        if suffix != expected:
            return "period_or_profile_binding_mismatch", "Name the exact target period and recorded profile; relative/ambiguous periods are unsupported."
    elif suffix:
        return "period_or_profile_binding_mismatch", "Unsupported target text, period or conditional profile; no historical total is relabelled as future."
    return None


def resolve_additive(sidecar, req):
    """Reconcile one bound signed identity or solve a recorded component/group remainder. Pure; no IO,
    source verification, forecast or inferred coefficient. Raw user question is checked here, not trusted
    from model intent. Results are internal backend context, never coefficient/valuation cards.
    """
    out = {"kind": "additive", "status": "invalid", "reason": None, "detail": None,
           "identity_id": req.get("identity_id") if isinstance(req, dict) else None,
           "mode": req.get("mode") if isinstance(req, dict) else None, "context": None,
           "label": None, "source_metric": None, "total": None,
           "conditional_profile_id": None, "conditional_profile_label": None, "assumed_residual": None,
           "source_period": None, "target_period": None, "source_total": None, "chosen_total": None,
           "target_hypothetical": False, "component_sum": None, "component_sum_exact": None,
           "displayed_gap": None, "displayed_gap_exact": None, "reconciliation_state": None,
           "components": [], "known_components": [], "remainder_component_ids": [], "remainder": None,
           "remainder_exact": None, "symbolic_build": None, "sources": [], "assumptions": [],
           "conditional_not_forecast": False, "interpretation": "Accounting identity only; not a forecast or source authentication."}
    def refuse(reason, detail, status="invalid"):
        out.update(status=status, reason=reason, detail=detail)
        return out
    required = ("operation", "question", "identity_id", "mode")
    if not _add_closed(req, required, ("sidecar", "remainder_component_ids", "target", "conditional_profile_id")) or req["operation"] != "additive" or req["mode"] not in ("reconcile", "remainder"):
        return refuse("invalid_shape", "A closed additive request with original question, identity and mode is required.")
    errors = validate_additive_sidecar(sidecar)
    if errors:
        return refuse(errors[0].split(":", 1)[0], "; ".join(errors))
    identities = [i for i in sidecar["additive_identities"] if i["identity_id"] == req["identity_id"]]
    if len(identities) != 1:
        return refuse("unknown_identity", "No exact unique recorded identity matches.")
    ident, ctx = identities[0], _add_context(identities[0]["context"])
    if not _add_identity_grounding(sidecar, ident, req):
        return refuse("ambiguous_identity_binding", "The question must uniquely identify one recorded source-period identity; name its distinguishing label.")
    ground = _add_ground(ident, req, ctx)
    if ground:
        return refuse(*ground)
    parts = ident["components"]
    # Decimal arithmetic retains the represented source amounts; no pp/bps or other hidden tolerance.
    with localcontext() as precision:
        precision.prec = 1000
        total = _add_decimal(ident["total"]["value"])
        summed = sum((_add_decimal(p["value"]) for p in parts), Decimal(0))
        gap = total - summed
        chosen = _add_decimal(req["target"]) if "target" in req else total
        if not all(math.isfinite(float(v)) for v in (summed, gap, chosen)):
            return refuse("invalid_number", "The represented result exceeds finite numeric output.")
        out.update(context=ctx, label=ident["label"], source_metric=ident["context"]["metric"], total=ident["total"],
                   source_period=_add_period(ctx), target_period=_add_period(ctx),
                   source_total=ident["total"]["value"], chosen_total=_add_number(chosen),
                   target_hypothetical="target" in req, component_sum=_add_number(summed), component_sum_exact=str(summed),
                   displayed_gap=_add_number(gap), displayed_gap_exact=str(gap),
                   reconciliation_state="exact_displayed" if gap == 0 else "unresolved_displayed_gap",
                   components=parts, sources=[ident["total"]["source"]] + [p["source"] for p in parts],
                   conditional_not_forecast="target" in req,
                   symbolic_build=" + ".join(f"({p['label']}: {p['value']})" for p in parts) + f" = {summed}; source total {total}; displayed gap {gap}")
        selected = set(req["remainder_component_ids"]) if req["mode"] == "remainder" else set()
        known = [p for p in parts if p["component_id"] not in selected] if selected else []
        out.update(known_components=known, remainder_component_ids=req.get("remainder_component_ids", []))
        profile = None
        if "conditional_profile_id" in req:
            profile = next(p for p in ident["conditional_profiles"] if p["profile_id"] == req["conditional_profile_id"])
            holds, r = profile["component_holds"], profile["residual"]
            out.update(target_period={"start": profile["target_period_start"], "end": profile["target_period_end"], "basis": profile["target_period_basis"], "label": profile["target_period_label"]},
                       conditional_profile_id=profile["profile_id"], conditional_profile_label=profile["label"],
                       assumed_residual=r.get("value"), conditional_not_forecast=True,
                       assumptions=[profile["assumption"]] + [holds[p["component_id"]] for p in known if _add_text(holds.get(p["component_id"]))]
                       + ([r["assumption"]] if _add_text(r.get("assumption")) else []))
        if gap != 0:
            return refuse("unresolved_displayed_gap", "The displayed total differs from signed components; the gap is not allocated or silently rounded away. Reliable remainder withheld.", "withheld")
        if req["mode"] == "reconcile":
            out["status"] = "computed"
            return out
        residual = Decimal(0)
        if profile is not None:
            holds, r = profile["component_holds"], profile["residual"]
            if any(not _add_text(holds.get(p["component_id"])) for p in known):
                return refuse("missing_hold_assumption", "Every held source component needs its explicit target-period assumption.", "withheld")
            if not _add_isnum(r.get("value")) or not _add_text(r.get("assumption")):
                return refuse("unknown_future_residual", "A historical zero gap does not establish the future reconciliation term; explicit value and assumption required.", "withheld")
            residual = _add_decimal(r["value"])
        result = chosen - sum((_add_decimal(p["value"]) for p in known), Decimal(0)) - residual
        if not math.isfinite(float(result)):
            return refuse("invalid_number", "The represented remainder exceeds finite numeric output.")
        out.update(status="computed", remainder=_add_number(result), remainder_exact=str(result),
                   symbolic_build=f"{chosen} - [" + " + ".join(f"({p['label']}: {p['value']})" for p in known) + f"] - ({residual} reconciliation term) = {result}")
        return out


def _approx(a, b, tol=0.05) -> bool:
    return a is not None and b is not None and abs(a - b) <= tol


def _selftest() -> int:
    fails = []

    def check(name, cond):
        if not cond:
            fails.append(name)

    # NHY_2026-07-19 earnings/07_earnings-sensitivity.md, verbatim coefficients:
    #   LME aluminium: +NOK 150m Adj. EBITDA per +USD 10/mt  → 15 NOK m per USD 1/mt (High, disclosed)
    #   USD/NOK:       NOK 4,900m per NOK 1.00 move          (High, disclosed)
    #   base FY2025 Adjusted EBITDA = NOK 28,889m; revenue base ≈ NOK 207,226m (12.4% reported → adj ~13.9%)
    nhy = {
        "ticker": "NHY", "currency": "NOK", "base_metric": "adjusted_ebitda_nok_m",
        "base_value": 28889, "base_period": "FY2025", "revenue_base": 207226,
        "sensitivities": [
            {"variable": "lme_aluminium_price", "label": "LME aluminium price", "unit": "USD/mt",
             "base_value": 3192, "coefficient": 15.0, "confidence": "high", "basis": "company-disclosed",
             "valid_range": {"low": -400, "high": 300}, "source": "FY2025 Annual Report, p.38",
             "non_linearity": "1.5-2mo pricing lag; may not hold far from base"},
            {"variable": "usd_nok", "label": "USD/NOK exchange rate", "unit": "NOK",
             "coefficient": 4900.0, "confidence": "high", "basis": "company-disclosed",
             "valid_range": {"low": -1, "high": 1}, "source": "FY2025 Annual Report, p.38"},
        ],
    }

    # 1. THE headline case: aluminium +$45/mt → +NOK 675m Adj. EBITDA (45 × 15), deterministic
    r = scenario(nhy, "lme_aluminium_price", 45)
    check("alu+45_impact=675", _approx(r["impact"], 675))
    check("alu+45_new=29564", _approx(r["new_value"], 29564))
    check("alu+45_in_range", r["within_disclosed_range"] is True)
    check("alu+45_confidence_high", r["confidence"] == "high")
    check("alu+45_source_carried", "p.38" in (r["source"] or ""))
    # margin: 28889/207226 = 13.940% ; 29564/207226 = 14.266% ; +32.6 bps
    check("alu+45_base_margin≈13.94", _approx(r["base_margin_pct"], 13.94, 0.02))
    check("alu+45_new_margin≈14.27", _approx(r["new_margin_pct"], 14.27, 0.02))
    check("alu+45_margin_bps≈32.6", _approx(r["margin_change_bps"], 32.6, 0.5))

    # 2. match by human label, negative delta, USD/NOK
    check("fx_by_label_-1=-4900", _approx(scenario(nhy, "USD/NOK exchange rate", -1)["impact"], -4900))

    # 3. out-of-disclosed-range is FLAGGED (a +$5000 move is far beyond the +300 band), still computes
    big = scenario(nhy, "lme_aluminium_price", 5000)
    check("alu+5000_flagged_out_of_range", big["within_disclosed_range"] is False and "range_note" in big)
    check("alu+5000_still_deterministic", _approx(big["impact"], 75000))

    # 4. unknown variable → REFUSED, never fabricated
    unk = scenario(nhy, "gold_price", 10)
    check("unknown_var_refused", "error" in unk and "no recorded sensitivity" in unk["error"])
    check("unknown_var_lists_options", "lme_aluminium_price" in unk["error"])

    # 5. defensive: malformed inputs never throw
    check("nonobject_safe", "error" in scenario(None, "x", 1))
    check("nosens_safe", "error" in scenario({"base_value": 1}, "x", 1))
    check("nonnumeric_delta_safe", "error" in scenario(nhy, "usd_nok", "abc"))

    # 6. no revenue base → margin fields are Not assessable (absent), impact still computed
    norev = dict(nhy); norev.pop("revenue_base")
    r2 = scenario(norev, "lme_aluminium_price", 45)
    check("norev_impact_ok", _approx(r2["impact"], 675))
    check("norev_no_margin", "margin_change_bps" not in r2)

    # 7. non-finite inputs are rejected, never returned as nan (JSON allows NaN/Infinity)
    check("nan_coeff_refused", "error" in scenario(dict(nhy, sensitivities=[dict(nhy["sensitivities"][0], coefficient=float("nan"))]), "lme_aluminium_price", 45))
    check("inf_delta_refused", "error" in scenario(nhy, "lme_aluminium_price", float("inf")))

    # 8. an EPS-style base metric gets NO margin (EPS ÷ revenue is nonsensical); the impact still computes
    eps = dict(nhy, base_metric="diluted_eps_nok", base_value=10.0)
    r3 = scenario(eps, "lme_aluminium_price", 45)
    check("eps_impact_ok", _approx(r3["impact"], 675))
    check("eps_no_margin", "margin_change_bps" not in r3)

    # 9. a coefficient on a DIFFERENT metric than the base: impact reported, but level/margin withheld
    diff = dict(nhy, sensitivities=[dict(nhy["sensitivities"][0], impact_metric="revenue_nok_m")])
    r4 = scenario(diff, "lme_aluminium_price", 45)
    check("diff_metric_impact_ok", _approx(r4["impact"], 675))
    check("diff_metric_no_newvalue", r4.get("new_value") is None and "margin_change_bps" not in r4)

    # 10. a ONE-SIDED disclosed band is enforced on the side it discloses
    onelow = dict(nhy, sensitivities=[dict(nhy["sensitivities"][0], valid_range={"low": -400})])
    check("onesided_within", scenario(onelow, "lme_aluminium_price", 50)["within_disclosed_range"] is True)
    check("onesided_below_flagged", scenario(onelow, "lme_aluminium_price", -500)["within_disclosed_range"] is False)

    # 11. duplicate variable → refuse (answer must not depend on array order)
    dup = dict(nhy, sensitivities=[nhy["sensitivities"][0], dict(nhy["sensitivities"][0], coefficient=99.0)])
    check("duplicate_refused", "error" in scenario(dup, "lme_aluminium_price", 45))

    # 12. resolve_scenario — LEVEL: aluminium AT 3000 (base 3192) → delta -192 → impact -2880
    lvl = resolve_scenario(nhy, "lme_aluminium_price", {"target_level": 3000})
    check("level_mode", lvl.get("mode") == "level")
    check("level_delta=-192", _approx(lvl["resolved_delta"], -192))
    check("level_impact=-2880", _approx(lvl["impact"], -2880))
    check("level_target_echoed", _approx(lvl["target_level"], 3000))

    # 13. resolve_scenario — REVERSE: what move takes the margin to 16%? (rev base 207,226 → target EBITDA
    #     33,156 → needed +4,267 → +284.5/mt → solved level ≈ 3,476.5). All from the recorded coefficient.
    rev = resolve_scenario(nhy, "lme_aluminium_price", {"target_margin": 16})
    check("reverse_mode", rev.get("mode") == "reverse")
    check("reverse_target_value≈33156", _approx(rev["target_value"], 33156.16, 0.5))
    check("reverse_delta≈284.5", _approx(rev["resolved_delta"], 284.5, 0.5))
    check("reverse_new_margin=16", _approx(rev["new_margin_pct"], 16.0, 0.05))
    check("reverse_solved_level≈3476.5", _approx(rev["solved_variable_level"], 3476.5, 0.6))

    # 14. reverse REFUSES (no number) when the sidecar can't support it — no revenue base for a margin target
    rev_norev = resolve_scenario(norev, "lme_aluminium_price", {"target_margin": 16})
    check("reverse_refuses_without_revenue", "error" in rev_norev and "impact" not in rev_norev)

    # A revenue coefficient cannot solve an EBITDA target, even when both base values exist.
    for label, request in (("value", {"target": 30000}), ("margin", {"target_margin": 16})):
        refused = resolve_scenario(diff, "lme_aluminium_price", request)
        check(f"reverse_refuses_different_metric_{label}", set(refused) == {"error"})

    compatible_target = resolve_scenario(nhy, "lme_aluminium_price", {"target": 29039})
    check("reverse_same_metric_target", _approx(compatible_target.get("resolved_delta"), 10)
          and _approx(compatible_target.get("new_value"), 29039))
    # Metric mismatch still permits impact-only forward requests, including variable levels.
    for label, request, expected in (("delta", {"delta": 45}, 675),
                                     ("level", {"target_level": 3000}, -2880)):
        impact_only = resolve_scenario(diff, "lme_aluminium_price", request)
        check(f"resolve_different_metric_{label}_impact_only",
              _approx(impact_only.get("impact"), expected) and impact_only.get("new_value") is None
              and "margin_change_bps" not in impact_only)

    # 15. resolve_scenario forward delta stays identical to scenario() (backward compatible)
    fwd = resolve_scenario(nhy, "lme_aluminium_price", {"delta": 45})
    check("resolve_forward_matches", fwd.get("mode") == "delta" and _approx(fwd["impact"], 675))

    # 16. §9 mitigation label travels with every modelled number.
    #   legacy row (no mitigation_basis) → conservatively labelled an unrecorded zero-mitigation bound
    check("legacy_labelled_bound", r.get("is_bound") is True and "NOT recorded" in (r.get("mitigation_note") or ""))
    check("legacy_no_second_case", "mitigated_impact" not in r and "gross_bound_impact" not in r)
    #   gross bound + measured offset → the realised case is computed BESIDE the bound (CLAUDE.md §9 worked
    #   example: 178bps gross vs 110bps realised ≈ 38% offset). 675 × (1 − 0.38) = 418.5; margin +20.2bps.
    zb = dict(nhy, sensitivities=[dict(nhy["sensitivities"][0], mitigation_basis="zero_bound",
                                       realised_offset_pct=38, realised_offset_source="FY2024 AR, Note 5")])
    rz = scenario(zb, "lme_aluminium_price", 45)
    check("zb_bound_impact_unchanged", _approx(rz["impact"], 675))
    check("zb_is_bound", rz["is_bound"] is True and "BOUND" in rz["mitigation_note"])
    check("zb_mitigated=418.5", _approx(rz["mitigated_impact"], 418.5))
    check("zb_mitigated_new=29307.5", _approx(rz["mitigated_new_value"], 29307.5))
    check("zb_mitigated_bps≈20.2", _approx(rz["mitigated_margin_change_bps"], 20.2, 0.1))
    check("zb_offset_source_carried", "Note 5" in rz["mitigation_note"])
    #   gross bound, offset not computable → labelled, no invented second case
    zn = dict(nhy, sensitivities=[dict(nhy["sensitivities"][0], mitigation_basis="zero_bound")])
    rzn = scenario(zn, "lme_aluminium_price", 45)
    check("zb_nooffset_labelled", rzn["is_bound"] is True and "not computable" in rzn["mitigation_note"])
    check("zb_nooffset_no_case", "mitigated_impact" not in rzn)
    #   net coefficient → NOT a bound; the gross bound is shown beside it: 675 / (1 − 0.25) = 900
    ro = dict(nhy, sensitivities=[dict(nhy["sensitivities"][0], mitigation_basis="realised_offset",
                                       realised_offset_pct=25, realised_offset_source="FY2024 AR, Note 5")])
    rro = scenario(ro, "lme_aluminium_price", 45)
    check("ro_not_bound", rro["is_bound"] is False)
    check("ro_gross_bound=900", _approx(rro["gross_bound_impact"], 900))
    #   disclosed zero / not applicable → not a bound, no second case
    dz = scenario(dict(nhy, sensitivities=[dict(nhy["sensitivities"][1], mitigation_basis="disclosed_zero")]), "usd_nok", 1)
    check("dz_not_bound", dz["is_bound"] is False and "disclosed" in dz["mitigation_note"])
    #   realised_offset with no usable offset → falls back to the conservative unrecorded-bound label
    bad = scenario(dict(nhy, sensitivities=[dict(nhy["sensitivities"][0], mitigation_basis="realised_offset")]), "lme_aluminium_price", 45)
    check("ro_without_offset_conservative", bad["is_bound"] is True)
    #   reverse mode carries the label too (the solved move inherits the coefficient's basis)
    check("reverse_carries_label", "mitigation_note" in resolve_scenario(zb, "lme_aluminium_price", {"target_margin": 16}))

    # A position-inclusive source coefficient with no measured gross counterpart is not gross zero response.
    position_row = {"variable": "price", "coefficient": 5, "source": "Unit source, Note 4",
                    "basis": "company-disclosed", "mitigation_basis": "disclosed_positions",
                    "mitigation_scope": DISCLOSED_POSITIONS_SCOPE, "embedded_hedges": "Fixed source positions",
                    "embedded_hedges_as_of": "2025-12-31", "realised_offset_pct": None,
                    "realised_offset_source": None}
    positions = {"base_metric": "adjusted_ebitda_units", "base_value": 100,
                 "sensitivities": [position_row]}
    rp = resolve_scenario(positions, "price", {"delta": 2})
    check("positions_impact_and_level", rp.get("impact") == 10 and rp.get("new_value") == 110)
    check("positions_scope_and_source", rp.get("is_bound") is True
          and all(text in rp.get("mitigation_note", "") for text in
                  ("zero-ADDITIONAL-response", "2025-12-31", "Fixed source positions", "Unit source, Note 4",
                   "not an unhedged gross", "not a company forecast", "not assessable")))
    check("positions_no_invented_counterpart", not any(k.startswith(("gross_bound_", "mitigated_", "realised_offset_")) for k in rp))
    for absent in ((), ("realised_offset_pct",), ("realised_offset_source",),
                   ("realised_offset_pct", "realised_offset_source")):
        row = {k: v for k, v in position_row.items() if k not in absent}
        check(f"positions_unknown_offset_{absent}",
              resolve_scenario(dict(positions, sensitivities=[row]), "price", {"delta": 2}) == rp)
    for field, value in (("source", " "), ("source", "\ufeff"), ("source", "\x85"),
                         ("embedded_hedges", "\x1c"), ("embedded_hedges", None),
                         ("embedded_hedges_as_of", "2025-02-30"), ("embedded_hedges_as_of", "0000-01-01"),
                         ("mitigation_scope", "all_response_zero"), ("basis", "inferred"),
                         ("realised_offset_pct", 0), ("realised_offset_pct", float("nan")),
                         ("realised_offset_source", "")):
        sc = dict(positions, sensitivities=[dict(position_row, **{field: value})])
        check(f"positions_invalid_{field}_{value}", set(scenario(sc, "price", 2)) == {"error"}
              and set(resolve_scenario(sc, "price", {"target": 150})) == {"error"})

    if fails:
        print("SENSITIVITY MATH SELFTEST FAIL:", ", ".join(fails))
        return 1
    # Existing CI already invokes this selftest; the new operation must not be an unrun utility.
    from test_sensitivity_additive import run_tests
    if not run_tests():
        return 1
    print("SENSITIVITY MATH SELFTEST PASS — NHY aluminium +$45/mt = +NOK 675m Adj. EBITDA (+32.6bps), "
          "recorded coefficient scaled linearly; range/confidence/source + §9 mitigation label carried; unknown-variable refused")
    return 0


if __name__ == "__main__":
    import sys
    if "--selftest" in sys.argv:
        raise SystemExit(_selftest())
    # --scenario: the callable entry the cockpit chat server shells out to (ui/server/src/chat-whatif.ts).
    # Reads ONE request as JSON on stdin — {"sidecar": <parsed sensitivity_summary.json>, "variable": str,
    # "delta": number} — and writes scenario()'s result (or {"error": ...}) as JSON on stdout. The Node side
    # owns path-sandboxing (it reads the sidecar from inside the run tree and passes the parsed object), so
    # this entry never touches the filesystem: same deterministic engine the guard checks, one source of truth.
    if "--scenario" in sys.argv:
        import json
        # ANY failure — malformed stdin, a bad request, or a serialization error — must return a structured
        # error the server can parse, never crash the child (which the server would read as "no answer").
        try:
            req = json.load(sys.stdin)
            if not isinstance(req, dict):
                raise ValueError("scenario request must be a JSON object")
            # resolve_scenario handles all intents (delta / target_level / target / target_margin) through the
            # one forward code path, so level and reverse arithmetic live here, not in the TS caller.
            result = (resolve_additive(req.get("sidecar"), req) if req.get("operation") == "additive"
                      else resolve_scenario(req.get("sidecar") or {}, req.get("variable"), req))
            print(json.dumps(result, allow_nan=False))
        except Exception as e:
            print(json.dumps({"error": f"scenario request failed: {e}"}))
        raise SystemExit(0)
    print("usage: sensitivity_math.py [--selftest | --scenario (JSON request on stdin)]")
    raise SystemExit(2)
