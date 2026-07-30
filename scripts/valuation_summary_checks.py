#!/usr/bin/env python3
"""scripts/valuation_summary_checks.py — the integrity guard for the valuation lever sidecar.

WHY THIS EXISTS
    99_valuation-synthesis emits `analyses/<run>/valuation/valuation_summary.json` — the machine-readable
    LEVERS the cockpit Valuation Playground moves (per-scenario metric/multiple, the method football field
    + weights, WACC components, price). That sidecar is §25 DATA: it reaches `main` WITHOUT passing CI, the
    same door the WHEAT `key_levels` and ALUMINIUM enum defects came through. A malformed sidecar, or one
    whose scenario levers DISAGREE with the run's own frozen decision_record.json, would make the Playground
    show levers that disagree with the committed thesis — the exact failure the levers exist to prevent.

    This is the integrity guard. It runs in TWO callers (mirroring scripts/headline_checks.py): eval.py as
    check AP (retrospective, CI) AND the /research:full 10B.1 finish-gate (pre-publish, stamps PROVISIONAL).
    It is SOFT-PRESENCE by design — a run with no sidecar is N/A, never a failure, because some runs
    legitimately cannot emit one (no pool-verified price, no scenario points, a partial run). It is
    STRICT-VALIDITY for any sidecar that DOES exist.

    HONEST SCOPE: this checks structural integrity + non-contradiction with the frozen decision_record. It
    does NOT re-derive the analyst's fair value or re-judge the methods — those are the recorded levers.
"""
from __future__ import annotations

import json
import os
import sys

# scripts/ is on sys.path for both callers (eval.py / the finish-gate import siblings directly).
from valuation_math import blend as _blend, level_from_multiple as _level_from_multiple


def _isnum(v) -> bool:
    # Local (not imported) so the guard never couples to another module's private helper.
    return isinstance(v, (int, float)) and not isinstance(v, bool)


# The load-bearing subset of frameworks/valuation_summary.schema.json, encoded here so the core stays
# PURE (no file read) and unit-testable fixture-free. The schema file remains the authoritative contract.
_REQUIRED = ("schema_version", "ticker", "basis", "scenarios")
_BASIS = ("equity", "ev")
_NET_DEBT_BASIS = ("strict", "broad", "gross-liquidity", None)
_PRICE_STATE = ("pool-verified", "indicative", "none", None)
# A scenario level "contradicts" the frozen thesis only on a MATERIAL gap — a relative tolerance (with a
# small absolute floor) so ordinary rounding on a high-priced level is not a false positive, while a real
# disagreement (e.g. base 999 vs 210) is still caught.
_LEVEL_REL_TOL = 0.005   # 0.5%
_LEVEL_ABS_FLOOR = 0.5


def _tol(target) -> float:
    return max(_LEVEL_ABS_FLOOR, _LEVEL_REL_TOL * abs(float(target)))


# CLAUDE.md §5's own banned-citation list: a bare form of these carries no document/period/section and
# cannot be traced back to the pool, so it is rejected exactly as a missing citation would be — not
# merely as a non-empty string (Codex #362 P2, fresh evidence: "source", "annual report", "company
# filings" and "management said" alone all previously passed as valid §5 citations). Matched only as a
# WHOLE (normalized, trailing-period-stripped, case-insensitive) string, never as a substring — a real
# citation like "FY24 Annual Report (Ind AS), Note 18" is unaffected; only the bare phrase alone is banned.
_BANNED_CITATIONS = frozenset({
    "source", "sources", "annual report", "the annual report", "company filings", "the company filings",
    "filings", "management said", "mgmt said", "industry data", "n/a", "na", "unknown", "tbd", "various",
})


def _cited(x) -> bool:
    """A §5 citation is a non-empty string that is not one of CLAUDE.md's own banned bare phrases —
    used by every internals block, including the scenario metric/multiple tuples: an uncited (or
    vaguely-cited, e.g. just 'source') lever cannot ship."""
    if not (isinstance(x, str) and x.strip()):
        return False
    return x.strip().rstrip(".").lower() not in _BANNED_CITATIONS


def _case_level(s, run_basis, sidecar):
    """The per-share level a scenario's own levers derive, honouring the CASE's basis and bridge.
    Returns (value, error) — value None when it is not derivable. One helper for both call sites: the
    reproduce check and the decision-record contradiction check MUST agree, or the guard contradicts
    itself (an equity multiple bridged as an EV one turns 9.75 into -2.82).

    This is a VALIDATOR: it must return a violation for malformed input, never raise. `scan_committed`
    does not catch exceptions, so one bad sidecar would abort the whole CI sweep instead of failing its
    own row (Gemini #362 r3672...; Codex #362 P2)."""
    fm, mult = s.get("forward_metric"), s.get("multiple")
    if not (_isnum(fm) and _isnum(mult)):
        return None, None
    basis = s.get("basis") if s.get("basis") in ("equity", "ev") else run_basis
    br = s.get("bridge") if isinstance(s.get("bridge"), dict) and basis == "ev" else None
    if br is not None:
        # net debt must be EXPLICIT and numeric (0 when debt-free) — the same §15 rule the derivation
        # chain enforces. A missing/typed-as-string net_debt is a violation, never a silent 0 and never
        # a KeyError/ValueError out of a validator.
        nd = br.get("net_debt")
        if not _isnum(nd):
            return None, "bridge net_debt must be explicit and numeric (0 when debt-free) — unknown net debt is never silently 0 (§15)"
        for key in ("minority", "other"):
            v = br.get(key)
            if v is not None and not _isnum(v):
                # a present-but-nonnumeric optional deduction must not be silently read as 0 — that
                # would price the equity wrong (e.g. minority "7495" as a string) with no violation
                # raised, because the finish gate calls this evaluator directly, not the JSON Schema
                # (Codex #362 P2, fresh evidence beyond the earlier net_debt-only fix).
                return None, f"bridge {key} must be numeric when present (got {v!r}) — a nonnumeric deduction cannot be silently treated as zero"
        sh = br.get("shares") if _isnum(br.get("shares")) else sidecar.get("shares")
        if not (_isnum(sh) and float(sh) > 0):
            return None, "bridge has no positive shares (own or top-level)"
        equity = float(fm) * float(mult) - float(nd) \
            - (float(br.get("minority")) if _isnum(br.get("minority")) else 0.0) \
            + (float(br.get("other")) if _isnum(br.get("other")) else 0.0)
        return equity / float(sh), None
    try:
        return _level_from_multiple(float(fm), float(mult), basis, sidecar.get("shares"), sidecar.get("net_debt")), None
    except Exception as e:
        return None, str(e)


def eval_ap_valuation_summary_integrity(sidecar, decision):
    """Core of check AP. Returns None (no sidecar → N/A, soft presence) or a list of violation strings
    (empty list = pass). Pure + module-level so both callers' selftests drive every branch fixture-free.

    `sidecar`  : the parsed valuation_summary.json (or None if the file is absent/unreadable).
    `decision` : the parsed decision_record.json (or None) — used to assert the sidecar's scenario labels
                 MATCH the frozen thesis and its levels do NOT contradict it (skipped when the run has no
                 decision-record scenarios, e.g. a partial run).
    """
    if sidecar is None:
        return None  # SOFT PRESENCE: absence is never a failure.
    if not isinstance(sidecar, dict):
        return ["valuation_summary.json is not a JSON object"]

    det = []
    for req in _REQUIRED:
        if req not in sidecar:
            det.append(f"missing required key '{req}'")

    basis = sidecar.get("basis")
    if basis not in _BASIS:
        det.append(f"basis {basis!r} not in {_BASIS}")
    if "net_debt_basis" in sidecar and sidecar.get("net_debt_basis") not in _NET_DEBT_BASIS:
        det.append(f"net_debt_basis {sidecar.get('net_debt_basis')!r} not in {_NET_DEBT_BASIS}")
    if "price_state" in sidecar and sidecar.get("price_state") not in _PRICE_STATE:
        det.append(f"price_state {sidecar.get('price_state')!r} not in {_PRICE_STATE}")

    # v1.3 additions (multiple_basis / metric_basis / multiple_kind / secondary_multiples / per-case
    # bridge) are required only of sidecars that DECLARE 1.3 — older runs are grandfathered, exactly like
    # the dated forward-gates in eval.py. A run opts in by emitting the version.
    #
    # A version that does NOT parse is REJECTED, never grandfathered: "v1.3", "1.3-beta" or "garbage"
    # would otherwise read as pre-1.3 and silently bypass every versioned rule — a typo in one field
    # turning off the whole gate (Codex #362 P2). Absence is caught by _REQUIRED above.
    raw_ver = sidecar.get("schema_version")
    ver = None
    if isinstance(raw_ver, str):
        parts = raw_ver.strip().split(".")
        if 1 <= len(parts) <= 4 and all(p.isdigit() for p in parts):
            ver = (int(parts[0]), int(parts[1]) if len(parts) > 1 else 0)
    if raw_ver is not None and ver is None:
        det.append(f"schema_version {raw_ver!r} is not a dotted numeric version (e.g. '1.3') — an unparseable "
                   f"version would silently grandfather every versioned rule")
    v13 = ver is not None and ver >= (1, 3)
    scen = sidecar.get("scenarios")
    if not isinstance(scen, list) or not scen:
        det.append("scenarios must be a non-empty array")
        return det  # nothing downstream is checkable without scenarios

    labels = []
    for i, s in enumerate(scen):
        if not isinstance(s, dict) or "label" not in s:
            det.append(f"scenario[{i}] missing 'label'")
            continue
        if not isinstance(s.get("label"), str):
            # the schema types label as a string and the Playground calls .toLowerCase() on it — a numeric or
            # other non-string label would throw there, so reject it rather than coercing it to a string here.
            det.append(f"scenario[{i}] label {s.get('label')!r} is not a string")
            continue
        labels.append(s.get("label").strip().lower())
        if s.get("probability") is not None:
            # the master synthesizer owns probabilities (decision_record.json); the levers sidecar must not.
            det.append(f"scenario[{i}] ({s.get('label')!r}) carries a probability — the master owns those")
        # When BOTH editable levers are present the Playground recomputes level = forward_metric × multiple
        # (bridged for ev) and IGNORES the supplied `level` — so a level that disagrees with that product
        # ships a baseline the Playground would silently override. Verify the identity here.
        fm, mult, lvl = s.get("forward_metric"), s.get("multiple"), s.get("level")
        br = s.get("bridge") if isinstance(s.get("bridge"), dict) else None
        # A case may declare its OWN basis: EMAAR's base reads on EV/EBITDA while its bear reads 0.96x on
        # BOOK. Treating an equity multiple as an EV one and bridging it is not a rounding error — it turns
        # 9.75 into −2.82. Falls back to the run basis.
        # A MISSPELLED basis ("EV", "Equity") must not fall through to the run-level one: the guard and the
        # browser would both silently apply the wrong arithmetic, and scan_committed never applies the JSON
        # Schema enum that would have caught it (Codex #364 P2). Absent is fine — that IS the fallback.
        if "basis" in s and s.get("basis") is not None and s.get("basis") not in ("equity", "ev"):
            det.append(f"scenario {s.get('label')!r} basis {s.get('basis')!r} is not 'equity' or 'ev' — a "
                       f"misspelled basis would silently fall back to the run's and price the case wrong")
        s_basis = s.get("basis") if s.get("basis") in ("equity", "ev") else basis
        if br is not None and s_basis != "ev":
            det.append(f"scenario {s.get('label')!r} records a `bridge` on an equity-basis case — an equity "
                       f"multiple already gives equity value; there is no EV→equity bridge to apply")
            br = None
        # §15: a per-case net debt that departs from the run-level basis (NHY's cases deduct the
        # cash-quality-adjusted 17,919 while the run declares the broad 13,090) must SAY so wherever it
        # appears. The bridge is a v1.3-only field, so there is nothing to grandfather (Codex #362 P2).
        if br is not None and not _cited(br.get("net_debt_basis")):
            det.append(f"scenario {s.get('label')!r} bridge records a net_debt with no net_debt_basis — a "
                       f"per-case debt figure must name its basis wherever it appears (§15)")
        # The v1.3 labelling rules key off the PRESENCE of each lever, not off a complete pair: a scenario
        # carrying a multiple with no forward_metric would otherwise skip every check below and ship an
        # unlabelled, uncited, underivable lever (Gemini + Codex #362).
        has_fm, has_mult = fm is not None, mult is not None
        if v13 and (has_fm or has_mult) and not (_isnum(fm) and _isnum(mult)):
            # MODULE_RULES §2: every case is a LEVEL built from an explicit forward metric AND an explicit
            # multiple. Half a tuple derives nothing — the Playground could not recompute the case.
            det.append(f"scenario {s.get('label')!r} records only half of the metric×multiple pair "
                       f"(forward_metric={fm!r}, multiple={mult!r}) — a case level needs both (MODULE_RULES §2)")
        # A multiple without its basis is an incomplete citation (§5): "0.96x" means nothing until you
        # know EMAAR's bear reads it on BOOK rather than EV/EBITDA.
        if v13 and has_mult and not _cited(s.get("multiple_basis")):
            det.append(f"scenario {s.get('label')!r} records a multiple but no multiple_basis — a bare multiple is an incomplete citation (§5)")
        if v13 and has_fm and not _cited(s.get("metric_basis")):
            det.append(f"scenario {s.get('label')!r} records forward_metric but no metric_basis (which metric, which period)")
        # The scenario multiple/metric are the Playground's most prominent EDITABLE levers — held to the
        # same §5 bar as dcf_grid, sotp_bridge, peers_internals and derivation (Codex #362 P2).
        if v13 and (has_fm or has_mult) and not _cited(s.get("source")):
            det.append(f"scenario {s.get('label')!r} records forward_metric/multiple with no §5 source citation "
                       f"— an editable lever cannot ship uncited")
        mk = s.get("multiple_kind")
        if v13 and (has_fm or has_mult):
            # REQUIRED, not merely valid-when-present: the schema contract relies on this field to
            # distinguish an applied input from an implied cross-check and drives the Playground's
            # two-way behaviour (whether editing the multiple is a reverse assertion or the case's
            # own genuine input) — a tuple with the kind omitted/null passed the finish gate before
            # this fix (Codex #362 P2, fresh evidence beyond the earlier invalid-value-only check).
            if mk not in ("implied", "applied"):
                det.append(f"scenario {s.get('label')!r} multiple_kind {mk!r} is required ('implied' or "
                           f"'applied') whenever forward_metric/multiple is present (v1.3)")
        elif mk is not None and mk not in ("implied", "applied"):
            det.append(f"scenario {s.get('label')!r} multiple_kind {mk!r} is not 'implied' or 'applied'")
        if _isnum(fm) and _isnum(mult):
            derived, err = _case_level(s, basis, sidecar)
            if err:
                det.append(f"scenario {s.get('label')!r} has forward_metric×multiple but no derivable level ({err})")
            if derived is not None and _isnum(lvl) and abs(float(lvl) - derived) > _tol(derived):
                det.append(f"scenario {s.get('label')!r} level {lvl} != forward_metric×multiple {round(derived, 4)} "
                           f"— the Playground recomputes the latter and would disagree with the recorded level")
        # Secondary multiples are cross-checks the orb quoted for the SAME value — recorded so real analyst
        # content is not discarded, never used in a computation. Validate shape only.
        sec = s.get("secondary_multiples")
        if sec is not None:
            if not (isinstance(sec, list) and all(isinstance(x, dict) and _isnum(x.get("value"))
                    and isinstance(x.get("basis"), str) and x["basis"].strip() for x in sec)):
                det.append(f"scenario {s.get('label')!r} secondary_multiples must be a list of {{value, basis}} with a named basis")
        # v1.2: a recorded derivation chain must REPRODUCE the level (REPRODUCE-or-omit — same rule as the
        # v1.1 method internals). The Playground makes the chain's figures the editable inputs and computes
        # the level from them, so a chain that disagrees ships a baseline the panel would silently contradict.
        deriv = s.get("derivation")
        if deriv is not None:
            if not isinstance(deriv, dict):
                det.append(f"scenario {s.get('label')!r} derivation must be an object")
            elif deriv.get("model") not in ("ev_bridge", "margin_runoff_dcf"):
                det.append(f"scenario {s.get('label')!r} derivation model {deriv.get('model')!r} is not a known model (ev_bridge, margin_runoff_dcf)")
            elif not _isnum(deriv.get("ev")):
                det.append(f"scenario {s.get('label')!r} derivation needs a numeric ev")
            else:
                chain_ev = float(deriv["ev"])
                ok = True
                if not _isnum(lvl):
                    # a chain with no recorded level has nothing to reproduce — unverifiable, so rejected
                    det.append(f"scenario {s.get('label')!r} derivation requires a numeric scenario level to reproduce (REPRODUCE-or-omit)")
                    ok = False
                if not _isnum(deriv.get("net_debt")):
                    det.append(f"scenario {s.get('label')!r} derivation net_debt must be explicit and numeric (0 when debt-free) — unknown net debt is never silently 0 (§15)")
                    ok = False
                if not _cited(deriv.get("source")):
                    det.append(f"scenario {s.get('label')!r} derivation needs a §5 source citation — editable levers cannot ship uncited")
                    ok = False
                for _key in ("minority", "other"):
                    _v = deriv.get(_key)
                    if _v is not None and not _isnum(_v):
                        det.append(f"scenario {s.get('label')!r} derivation {_key} must be numeric when present (got {_v!r})")
                        ok = False
                if ok and deriv.get("model") == "margin_runoff_dcf":
                    # Replay the recorded runoff: revenue_base × margin → −da → ×(1−tax) → +da −capex −dnwc
                    # → TV = FCFF×(1+g)/(wacc−g) → EV = pv_explicit + TV×pv_factor. The replayed EV must
                    # reproduce the RECORDED ev (the orb's own number) — that is the proof the transcribed
                    # constants are the ones the orb actually used, not a rebuilt model.
                    need = [k for k in ("margin", "revenue_base", "wacc", "pv_factor", "pv_explicit") if not _isnum(deriv.get(k))]
                    if need:
                        det.append(f"scenario {s.get('label')!r} margin_runoff_dcf needs numeric {', '.join(need)}")
                        ok = False
                    else:
                        g = float(deriv.get("growth")) if _isnum(deriv.get("growth")) else 0.0
                        wacc = float(deriv["wacc"])
                        if wacc - g <= 0:
                            det.append(f"scenario {s.get('label')!r} margin_runoff_dcf has wacc − growth <= 0 — the perpetuity is undefined")
                            ok = False
                        else:
                            da = float(deriv.get("da")) if _isnum(deriv.get("da")) else 0.0
                            capex = float(deriv.get("capex")) if _isnum(deriv.get("capex")) else 0.0
                            tax = float(deriv.get("tax")) if _isnum(deriv.get("tax")) else 0.0
                            dnwc = float(deriv.get("dnwc")) if _isnum(deriv.get("dnwc")) else 0.0
                            fcff = (float(deriv["revenue_base"]) * float(deriv["margin"]) - da) * (1.0 - tax) + da - capex - dnwc
                            replay_ev = float(deriv["pv_explicit"]) + (fcff * (1.0 + g) / (wacc - g)) * float(deriv["pv_factor"])
                            if abs(replay_ev - chain_ev) > _tol(chain_ev):
                                det.append(f"scenario {s.get('label')!r} margin_runoff_dcf replay gives EV {round(replay_ev, 1)} != recorded ev {chain_ev} "
                                           f"— the replayed chain must reproduce the orb's own EV (REPRODUCE-or-omit)")
                                ok = False
                            else:
                                chain_ev = replay_ev  # the client drives from the replay — check the level against it
                if ok:
                    d_shares = deriv.get("shares") if _isnum(deriv.get("shares")) else sidecar.get("shares")
                    if not (_isnum(d_shares) and float(d_shares) > 0):
                        det.append(f"scenario {s.get('label')!r} derivation has no positive shares (own or top-level) — the per-share step is not computable")
                    else:
                        equity = chain_ev \
                            - (float(deriv.get("net_debt")) if _isnum(deriv.get("net_debt")) else 0.0) \
                            - (float(deriv.get("minority")) if _isnum(deriv.get("minority")) else 0.0) \
                            + (float(deriv.get("other")) if _isnum(deriv.get("other")) else 0.0)
                        chain_ps = equity / float(d_shares)
                        if _isnum(lvl) and abs(chain_ps - float(lvl)) > _tol(lvl):
                            det.append(f"scenario {s.get('label')!r} derivation chain gives {round(chain_ps, 4)} != level {lvl} "
                                       f"— the chain must reproduce the recorded level (REPRODUCE-or-omit)")

    # A per-case bridge on SOME cases only would mean one run mixes an all-in run-level deduction with
    # split per-case terms — the double-counting failure this field exists to prevent.
    _sc = [x for x in scen if isinstance(x, dict)] if isinstance(scen, list) else []
    _ev = [x for x in _sc if (x.get("basis") if x.get("basis") in ("equity", "ev") else basis) == "ev"]
    _with_bridge = [x for x in _ev if isinstance(x.get("bridge"), dict)]
    if _with_bridge and len(_with_bridge) != len(_ev):
        _missing = sorted(str(x.get("label")) for x in _ev if not isinstance(x.get("bridge"), dict))
        det.append(f"some scenarios record their own `bridge` but the EV-basis cases {_missing} do not — a run must not mix per-case bridge terms with the run-level deduction")

    # Distinct labels (a duplicate scenario label is malformed — the Playground keys scenarios by label).
    for lab in sorted({l for l in labels if labels.count(l) > 1}):
        det.append(f"duplicate scenario label {lab!r}")

    # Football field, when it carries any NUMERIC method value, must blend to a finite base point. An
    # all-null methods map is a documented "unavailable" state (schema permits null values) and is NOT a
    # failure — only a field that claims numeric values yet cannot blend (missing/zero weights) is.
    methods, weights = sidecar.get("methods"), sidecar.get("method_weights")
    if isinstance(methods, dict) and any(_isnum(v) for v in methods.values()):
        try:
            b = _blend(methods, weights if isinstance(weights, dict) else {})
            if b.get("base_point") is None:
                det.append("methods carry numeric value(s) but the blend yields no base point "
                           "(no method has BOTH a numeric value and a positive weight)")
        except Exception as e:  # a pure resolver should never raise; if it does, the football field is bad
            det.append(f"blend() raised on methods/method_weights: {e}")

    # ---- v1.1 method internals (P-C sub-levers) — each block, when present, must REPRODUCE its recorded
    # method value: the grid cell at `base` == methods.dcf, the segment re-sum == methods.sotp, the anchor
    # line at applied_multiple == methods.peers. A block that disagrees with its own method value would make
    # the Playground derive a number contradicting the committed football field — worse than no block.
    m_of = (lambda k: methods.get(k) if isinstance(methods, dict) else None)
    grid = sidecar.get("dcf_grid")
    if grid is not None:
        if not isinstance(grid, dict):
            det.append("dcf_grid must be an object or null")
        else:
            w, g, vals = grid.get("wacc"), grid.get("growth"), grid.get("values")
            ok_axes = (isinstance(w, list) and len(w) >= 2 and all(_isnum(x) for x in w) and all(w[i] < w[i+1] for i in range(len(w)-1))
                       and isinstance(g, list) and len(g) >= 2 and all(_isnum(x) for x in g) and all(g[i] < g[i+1] for i in range(len(g)-1)))
            if not _cited(grid.get("source")):
                det.append("dcf_grid needs a §5 source citation — an uncited lever cannot ship")
            if not ok_axes:
                det.append("dcf_grid wacc/growth must be ascending numeric arrays (>= 2 points each)")
            elif not (isinstance(vals, list) and len(vals) == len(g)
                      and all(isinstance(r, list) and len(r) == len(w) and all(_isnum(x) for x in r) for r in vals)):
                det.append(f"dcf_grid values must be a {len(g)}x{len(w)} numeric matrix (values[growthIdx][waccIdx])")
            else:
                base = grid.get("base")
                if not (isinstance(base, dict) and _isnum(base.get("wacc")) and _isnum(base.get("growth"))):
                    # without the recorded base pair there is NO anchor proving the grid reproduces
                    # methods.dcf — the block is unverifiable, so it is rejected, not accepted silently
                    det.append("dcf_grid must record its base {wacc, growth} pair — the reproduce anchor")
                elif not _isnum(m_of("dcf")):
                    det.append("dcf_grid present but methods.dcf is not numeric — internals need the method value they reproduce")
                else:
                    wi = next((i for i, x in enumerate(w) if abs(x - base["wacc"]) < 1e-9), None)
                    gi = next((i for i, x in enumerate(g) if abs(x - base["growth"]) < 1e-9), None)
                    if wi is None or gi is None:
                        det.append(f"dcf_grid base ({base.get('wacc')}, {base.get('growth')}) is not a recorded grid point")
                    elif abs(vals[gi][wi] - float(m_of("dcf"))) > _tol(m_of("dcf")):
                        det.append(f"dcf_grid base cell {vals[gi][wi]} != methods.dcf {m_of('dcf')} — the grid must reproduce the recorded method value")
    segs = sidecar.get("sotp_segments")
    if segs is not None:
        if not (isinstance(segs, list) and segs and all(isinstance(s, dict) and _isnum(s.get("metric")) and _isnum(s.get("multiple")) for s in segs)):
            det.append("sotp_segments must be a non-empty array of {segment, metric, multiple} with numeric metric/multiple")
        else:
            br = sidecar.get("sotp_bridge")
            shares = sidecar.get("shares")
            if not (isinstance(br, dict) and _isnum(br.get("net_debt"))):
                # a re-sum with no recorded bridge silently values the firm as debt-free (§15) — a truly
                # debt-free firm records an explicit 0, never an absent term
                det.append("sotp_segments need a sotp_bridge with a numeric net_debt (explicit 0 when debt-free, §15)")
            elif not _cited(br.get("source")):
                det.append("sotp_bridge needs a §5 source citation — an uncited lever cannot ship")
            elif not (_isnum(shares) and shares > 0):
                det.append("sotp_segments need positive top-level shares for the per-share step")
            elif not _isnum(m_of("sotp")):
                det.append("sotp_segments present but methods.sotp is not numeric — internals need the method value they reproduce")
            elif any(br.get(k) is not None and not _isnum(br.get(k)) for k in ("minority", "other")):
                _bad = [k for k in ("minority", "other") if br.get(k) is not None and not _isnum(br.get(k))]
                det.append(f"sotp_bridge {', '.join(_bad)} must be numeric when present — a nonnumeric deduction cannot be silently treated as zero")
            else:
                total_ev = sum(float(s["metric"]) * float(s["multiple"]) for s in segs)
                equity = total_ev - float(br.get("net_debt")) \
                                  - (float(br.get("minority")) if _isnum(br.get("minority")) else 0.0) \
                                  + (float(br.get("other")) if _isnum(br.get("other")) else 0.0)
                per_share = equity / float(shares)
                if abs(per_share - float(m_of("sotp"))) > _tol(m_of("sotp")):
                    det.append(f"sotp_segments re-sum {round(per_share, 4)} != methods.sotp {m_of('sotp')} — segments+bridge must reproduce the recorded method value")
    pi = sidecar.get("peers_internals")
    if pi is not None:
        if not isinstance(pi, dict):
            det.append("peers_internals must be an object or null")
        else:
            anchors = pi.get("anchors")
            rows_ok = (isinstance(anchors, list) and len(anchors) >= 2
                       and all(isinstance(a, dict) and _isnum(a.get("multiple")) and _isnum(a.get("value")) for a in anchors))
            srt = sorted(anchors, key=lambda a: float(a["multiple"])) if rows_ok else []
            if rows_ok and any(abs(float(srt[i + 1]["multiple"]) - float(srt[i]["multiple"])) < 1e-9 for i in range(len(srt) - 1)):
                rows_ok = False
            if not _cited(pi.get("source")):
                det.append("peers_internals needs a §5 source citation — an uncited lever cannot ship")
            if not rows_ok:
                det.append("peers_internals.anchors must hold >= 2 numeric {multiple, value} rows with distinct multiples")
            elif not _isnum(pi.get("applied_multiple")):
                det.append("peers_internals must record applied_multiple — the reproduce anchor")
            elif not _isnum(m_of("peers")):
                det.append("peers_internals present but methods.peers is not numeric — internals need the method value they reproduce")
            else:
                # piecewise through ALL recorded rows (the client honors every anchor, not just the first
                # two) — evaluate the bracketing segment at applied_multiple, edge segments beyond the span
                ap = float(pi["applied_multiple"])
                seg_i = 0
                for i in range(len(srt) - 1):
                    if ap >= float(srt[i]["multiple"]):
                        seg_i = i
                a0, a1 = srt[seg_i], srt[seg_i + 1]
                slope = (float(a1["value"]) - float(a0["value"])) / (float(a1["multiple"]) - float(a0["multiple"]))
                at_applied = float(a0["value"]) + slope * (ap - float(a0["multiple"]))
                if abs(at_applied - float(m_of("peers"))) > _tol(m_of("peers")):
                    det.append(f"peers_internals line at applied_multiple gives {round(at_applied, 4)} != methods.peers {m_of('peers')} — the anchors must reproduce the recorded method value")

    # Reconcile the sidecar's cases against the frozen decision_record. The rule is DIRECTIONAL, not a set
    # equality, because the two layers legitimately hold different case sets:
    #
    #   the valuation module owns the fair-value LEVELS (MODULE_RULES §2); the master synthesizer owns the
    #   CASE SET and the probabilities (§10, §22) and may add a case the module never produced — TSLA's
    #   `tail_squeeze` is a short-specific risk the valuation module says outright it cannot resolve, only
    #   frame. The sidecar is written by 99_valuation-synthesis BEFORE the master runs, so it can never
    #   know such a case exists. Demanding identical label sets asks for the structurally impossible.
    #
    # So:
    #   ORPHAN LEVERS are a violation. A sidecar case with no counterpart in the thesis lets the analyst
    #   move levers for a case the run does not hold — including the RENAME failure this rule exists to
    #   catch (a sidecar 'bear' against a thesis that says 'bear_structural' is two names for one case, and
    #   the reader cannot tell they are the same).
    #   A THESIS CASE WITH NO LEVERS is not a violation. Nothing is wrong or missing in the sidecar; the
    #   Playground renders it from the frozen level as a judgment cell. It MUST still render it — dropping
    #   it would compute the expected return over probabilities that no longer sum to 100 — but that is the
    #   client's contract (valuationLevers.draftFromResponse), not a data defect.
    #
    # The one completeness floor: the BASE case must carry levers if any case does. The base level anchors
    # the margin of safety and the expected-return centre; a sidecar that omits it gives the analyst levers
    # on the wings while the middle stays frozen.
    dr_scen = decision.get("scenarios") if isinstance(decision, dict) else None
    if isinstance(dr_scen, list) and dr_scen:
        dr_by = {str(s.get("label", "")).strip().lower(): s for s in dr_scen if isinstance(s, dict)}
        sc_set, dr_set = set(labels), set(dr_by)
        for lab in sorted(sc_set - dr_set):
            near = sorted(d for d in dr_set - sc_set if d.startswith(lab) or lab.startswith(d))
            hint = (f" — the thesis calls it {' / '.join(repr(n) for n in near)}; use the thesis's own label, "
                    f"never a second name for the same case") if near else \
                   " — a lever set for a case the thesis does not hold"
            det.append(f"scenario {lab!r} has no decision_record counterpart{hint}")
        if dr_set and not any(l for l in sc_set if "base" in l) and any("base" in l for l in dr_set):
            det.append("no base-labelled scenario carries levers — the base level anchors the margin of safety "
                       "and the expected-return centre, so it cannot be the one case left frozen")
        for s in scen:
            if not isinstance(s, dict) or not isinstance(s.get("label"), str):
                continue
            lab = s.get("label").strip().lower()
            drs = dr_by.get(lab)
            if drs is None:
                continue
            pt = drs.get("price_target")
            if not _isnum(pt):
                continue
            # Compare the level the Playground actually SHOWS to the frozen target. When both editable levers
            # are present it derives forward_metric×multiple and IGNORES the supplied `level` — so a null or
            # wrong `level` cannot hide a contradiction (the previous check only compared a numeric `level`).
            fm, mult, lvl = s.get("forward_metric"), s.get("multiple"), s.get("level")
            shown = None
            if _isnum(fm) and _isnum(mult):
                try:
                    shown, _ = _case_level(s, basis, sidecar)
                    if shown is None: raise ValueError('not derivable')
                except Exception:
                    shown = float(lvl) if _isnum(lvl) else None
            elif _isnum(lvl):
                shown = float(lvl)
            if shown is not None and abs(shown - float(pt)) > _tol(pt):
                det.append(f"scenario {lab!r} shows level {round(shown, 4)} but decision_record price_target is {pt} "
                           f"(the Playground derives this from the recorded levers, disagreeing with the frozen thesis)")
    return det


def scan_committed(root="."):
    """Validate every committed analyses/*/valuation/valuation_summary.json. Returns (checked, failures)
    where failures is a list of (run, [violations]). The CI / --all entry point."""
    import glob
    checked, failures = 0, []
    for sc_path in sorted(glob.glob(os.path.join(root, "analyses/*/valuation/valuation_summary.json"))):
        run = os.path.basename(os.path.dirname(os.path.dirname(sc_path)))
        try:
            sidecar = json.load(open(sc_path, encoding="utf-8"))
        except Exception as e:
            failures.append((run, [f"could not parse valuation_summary.json: {e}"]))
            checked += 1
            continue
        dr_path = os.path.join(os.path.dirname(os.path.dirname(sc_path)), "decision_record.json")
        decision = None
        if os.path.exists(dr_path):
            try:
                decision = json.load(open(dr_path, encoding="utf-8"))
            except Exception:
                decision = None  # unreadable DR → skip the contradiction check, still validate structure
        viol = eval_ap_valuation_summary_integrity(sidecar, decision)
        checked += 1
        if viol:
            failures.append((run, viol))
    return checked, failures


def _selftest() -> int:
    fails = []

    def check(name, cond):
        if not cond:
            fails.append(name)

    ok_sidecar = {
        "schema_version": "1.0", "ticker": "T", "basis": "equity",
        "scenarios": [{"label": "bull", "level": 20}, {"label": "base", "level": 15}, {"label": "bear", "level": 10}],
        "methods": {"peers": 16, "dcf": 14}, "method_weights": {"peers": 0.5, "dcf": 0.5},
        "net_debt_basis": "broad", "price_state": "pool-verified",
    }
    dr_match = {"scenarios": [{"label": "bull", "price_target": 20}, {"label": "base", "price_target": 15}, {"label": "bear", "price_target": 10}]}

    # soft presence + happy path
    check("absent → None (soft presence)", eval_ap_valuation_summary_integrity(None, dr_match) is None)
    check("valid sidecar → [] pass", eval_ap_valuation_summary_integrity(ok_sidecar, dr_match) == [])
    check("valid sidecar, no DR → [] pass", eval_ap_valuation_summary_integrity(ok_sidecar, None) == [])

    # structural violations
    check("non-object → violation", eval_ap_valuation_summary_integrity([1, 2], None) == ["valuation_summary.json is not a JSON object"])
    miss = dict(ok_sidecar); del miss["ticker"]
    check("missing key caught", any("ticker" in v for v in eval_ap_valuation_summary_integrity(miss, None)))
    badbasis = dict(ok_sidecar, basis="nav")
    check("bad basis caught", any("basis" in v for v in eval_ap_valuation_summary_integrity(badbasis, None)))
    noscen = dict(ok_sidecar, scenarios=[])
    check("empty scenarios caught", any("non-empty" in v for v in eval_ap_valuation_summary_integrity(noscen, None)))
    prob = dict(ok_sidecar, scenarios=[{"label": "base", "level": 15, "probability": 50}])
    check("probability in sidecar caught", any("probability" in v for v in eval_ap_valuation_summary_integrity(prob, None)))
    dup = dict(ok_sidecar, scenarios=[{"label": "base", "level": 15}, {"label": "Base", "level": 16}])
    check("duplicate label caught", any("duplicate" in v for v in eval_ap_valuation_summary_integrity(dup, None)))

    # football field: a numeric value that cannot blend is caught; an all-null map is NOT (unavailable is valid)
    deadblend = dict(ok_sidecar, methods={"peers": 100}, method_weights={})
    check("numeric method with no blend caught", any("blend" in v for v in eval_ap_valuation_summary_integrity(deadblend, None)))
    allnull = dict(ok_sidecar, methods={"peers": None, "dcf": None}, method_weights={"peers": None, "dcf": None})
    check("all-null football field is valid (unavailable)", eval_ap_valuation_summary_integrity(allnull, None) == [])

    # metric×multiple identity: a level that disagrees with forward_metric×multiple is caught
    lever_ok = dict(ok_sidecar, scenarios=[{"label": "base", "forward_metric": 6, "multiple": 25, "level": 150}])
    check("level == metric×multiple passes", eval_ap_valuation_summary_integrity(lever_ok, None) == [])
    lever_bad = dict(ok_sidecar, scenarios=[{"label": "base", "forward_metric": 10, "multiple": 9, "level": 100}])
    check("level != metric×multiple caught", any("forward_metric" in v and "recomputes" in v for v in eval_ap_valuation_summary_integrity(lever_bad, None)))
    ev_no_bridge = dict(ok_sidecar, basis="ev", shares=None, net_debt=None,
                        scenarios=[{"label": "base", "forward_metric": 100, "multiple": 12, "level": 100}])
    check("ev metric×multiple without bridge caught", any("derivable level" in v for v in eval_ap_valuation_summary_integrity(ev_no_bridge, None)))

    # ---- case reconciliation against the frozen thesis: DIRECTIONAL, not a set equality ----
    # an ORPHAN lever set (a case the thesis does not hold) is a violation
    upside_only = dict(ok_sidecar, scenarios=[{"label": "upside", "level": 150}])
    r = eval_ap_valuation_summary_integrity(upside_only, dr_match)
    check("orphan lever set caught", any("no decision_record counterpart" in v for v in r))
    check("an orphan with no near-name says so plainly",
          any("a lever set for a case the thesis does not hold" in v for v in r))
    # THE case this rule exists for: a RENAME. The sidecar says 'bear', the thesis says 'bear_structural' —
    # two names for one case, which the reader cannot reconcile. Named, with the thesis's own label quoted.
    dr_split = {"scenarios": [
        {"label": "bull", "price_target": 20}, {"label": "base", "price_target": 15},
        {"label": "bear_cyclical", "price_target": 12}, {"label": "bear_structural", "price_target": 10},
        {"label": "tail_squeeze", "price_target": 40},
    ]}
    rn = eval_ap_valuation_summary_integrity(ok_sidecar, dr_split)
    check("a renamed case is caught as an orphan", any("'bear' has no decision_record counterpart" in v for v in rn))
    check("and the message quotes the thesis's own label",
          any("bear_cyclical" in v and "bear_structural" in v and "never a second name" in v for v in rn))
    # a thesis case the module never derived is NOT a defect (the master owns the case set, §10/§22): the
    # sidecar here holds bull/base/bear_structural and the thesis adds bear_cyclical + tail_squeeze
    partial = dict(ok_sidecar, scenarios=[
        {"label": "bull", "level": 20}, {"label": "base", "level": 15}, {"label": "bear_structural", "level": 10}])
    pr = eval_ap_valuation_summary_integrity(partial, dr_split)
    check("a thesis case with no levers is NOT a violation (the master may add cases)", pr == [])
    check("and nothing claims the sidecar is 'missing' it", not any("missing from the sidecar" in v for v in pr))
    # the one completeness floor: the base case cannot be the frozen one
    no_base = dict(ok_sidecar, scenarios=[{"label": "bull", "level": 20}, {"label": "bear", "level": 10}])
    check("a sidecar that leaves the BASE case frozen is caught",
          any("no base-labelled scenario carries levers" in v for v in eval_ap_valuation_summary_integrity(no_base, dr_match)))
    check("no base in the THESIS either → no floor to enforce",
          eval_ap_valuation_summary_integrity(
              dict(ok_sidecar, scenarios=[{"label": "leg_long", "level": 20}, {"label": "leg_short", "level": 10}]),
              {"scenarios": [{"label": "leg_long", "price_target": 20}, {"label": "leg_short", "price_target": 10}]}) == [])

    # THE contradiction check (material gap, not rounding)
    dr_conflict = {"scenarios": [{"label": "bull", "price_target": 20}, {"label": "base", "price_target": 99}, {"label": "bear", "price_target": 10}]}
    check("level contradicting DR caught", any("base" in v and "price_target" in v for v in eval_ap_valuation_summary_integrity(ok_sidecar, dr_conflict)))
    # a NULL supplied level with both levers present must not hide a contradiction — the Playground derives
    # forward_metric×multiple (=90) and ignores the null level; that 90 vs a frozen target of 150 is caught
    null_lever = dict(ok_sidecar, scenarios=[{"label": "base", "forward_metric": 10, "multiple": 9, "level": None}])
    dr_150 = {"scenarios": [{"label": "base", "price_target": 150}]}
    check("null level + levers contradicting DR caught", any("base" in v and "derives" in v for v in eval_ap_valuation_summary_integrity(null_lever, dr_150)))
    # and the same derived level AGREEING with the target does not false-fire (90 vs 90)
    dr_90 = {"scenarios": [{"label": "base", "price_target": 90}]}
    check("null level + levers agreeing → no fire", eval_ap_valuation_summary_integrity(null_lever, dr_90) == [])
    # a non-string scenario label is rejected (the Playground would call .toLowerCase() on it)
    numlabel = dict(ok_sidecar, scenarios=[{"label": 1, "forward_metric": 6, "multiple": 25}])
    check("non-string label caught", any("not a string" in v for v in eval_ap_valuation_summary_integrity(numlabel, None)))
    # a sub-tolerance rounding difference does NOT false-fire
    dr_round = {"scenarios": [{"label": "bull", "price_target": 20.002}, {"label": "base", "price_target": 15.001}, {"label": "bear", "price_target": 10.0}]}
    check("rounding difference does not fire", eval_ap_valuation_summary_integrity(ok_sidecar, dr_round) == [])
    # null DR scenarios (BG/HCG/TMCV shape) must NOT trip any DR-dependent check
    check("null DR scenarios → no fire", eval_ap_valuation_summary_integrity(ok_sidecar, {"scenarios": None}) == [])

    # ---- v1.1 method internals (P-C sub-levers): each block must reproduce its recorded method value ----
    internals = dict(ok_sidecar,
        methods={"dcf": 70, "sotp": 80, "peers": 90}, method_weights={"dcf": 0.4, "sotp": 0.4, "peers": 0.2},
        shares=10, basis="equity",
        dcf_grid={"wacc": [0.07, 0.08], "growth": [0.02, 0.025], "values": [[72, 60], [70, 58]],
                  "base": {"wacc": 0.07, "growth": 0.025}, "source": "04 §7"},
        sotp_segments=[{"segment": "A", "metric": 100, "multiple": 5}, {"segment": "B", "metric": 90, "multiple": 5}],
        sotp_bridge={"net_debt": 100, "minority": 50, "source": "06 §4"},  # (500+450) − 150 = 800 → /10 shares = 80 == methods.sotp
        peers_internals={"median_multiple": 6.25, "applied_multiple": 5.6, "discount_pct": 10, "source": "03 §5",
                         "anchors": [{"multiple": 5.6, "value": 90}, {"multiple": 6.25, "value": 100}]})
    check("v1.1 internals that reproduce their method values → pass", eval_ap_valuation_summary_integrity(internals, None) == [])
    bad_cell = dict(internals, dcf_grid=dict(internals["dcf_grid"], values=[[72, 60], [99, 58]]))
    check("grid base cell != methods.dcf caught", any("reproduce the recorded method value" in v and "dcf" in v for v in eval_ap_valuation_summary_integrity(bad_cell, None)))
    bad_axes = dict(internals, dcf_grid=dict(internals["dcf_grid"], wacc=[0.08, 0.07]))
    check("non-ascending wacc axis caught", any("ascending" in v for v in eval_ap_valuation_summary_integrity(bad_axes, None)))
    bad_sum = dict(internals, sotp_segments=[{"segment": "A", "metric": 100, "multiple": 9}])
    check("sotp re-sum != methods.sotp caught", any("re-sum" in v for v in eval_ap_valuation_summary_integrity(bad_sum, None)))
    bad_sotp_minority = dict(internals, sotp_bridge=dict(internals["sotp_bridge"], minority="50"))
    check("sotp_bridge nonnumeric minority caught, not silently treated as zero",
          any("minority" in v and "must be numeric" in v for v in eval_ap_valuation_summary_integrity(bad_sotp_minority, None)))
    one_anchor = dict(internals, peers_internals={"applied_multiple": 5.6, "anchors": [{"multiple": 5.6, "value": 90}]})
    check("single peers anchor caught", any("anchors" in v for v in eval_ap_valuation_summary_integrity(one_anchor, None)))
    bad_peers = dict(internals, peers_internals=dict(internals["peers_internals"], anchors=[{"multiple": 5.6, "value": 50}, {"multiple": 6.25, "value": 60}]))
    check("peers line != methods.peers caught", any("methods.peers" in v for v in eval_ap_valuation_summary_integrity(bad_peers, None)))

    # ---- review round: reproduce anchors, bridges, and citations are REQUIRED, not optional ----
    no_base = dict(internals, dcf_grid={k: v for k, v in internals["dcf_grid"].items() if k != "base"})
    check("grid without its base pair caught", any("reproduce anchor" in v for v in eval_ap_valuation_summary_integrity(no_base, None)))
    no_src = dict(internals, dcf_grid={k: v for k, v in internals["dcf_grid"].items() if k != "source"})
    check("uncited grid caught", any("source citation" in v for v in eval_ap_valuation_summary_integrity(no_src, None)))
    no_dcf_val = dict(internals, methods={"dcf": None, "sotp": 80, "peers": 90})
    check("grid with null methods.dcf caught (no reproduce target)", any("methods.dcf is not numeric" in v for v in eval_ap_valuation_summary_integrity(no_dcf_val, None)))
    no_bridge = {k: v for k, v in internals.items() if k != "sotp_bridge"}
    check("segments without a bridge caught (silent debt-free, §15)", any("numeric net_debt" in v for v in eval_ap_valuation_summary_integrity(no_bridge, None)))
    nondict_peers = dict(internals, peers_internals=[1, 2])
    check("non-object peers_internals named plainly", any("must be an object" in v for v in eval_ap_valuation_summary_integrity(nondict_peers, None)))
    no_applied = dict(internals, peers_internals={k: v for k, v in internals["peers_internals"].items() if k != "applied_multiple"})
    check("peers without applied_multiple caught", any("applied_multiple" in v for v in eval_ap_valuation_summary_integrity(no_applied, None)))
    # three anchors, applied at the THIRD row — the piecewise line must honor every recorded row
    tri = dict(internals, methods={"dcf": 70, "sotp": 80, "peers": 110}, peers_internals=dict(
        internals["peers_internals"], applied_multiple=7.0,
        anchors=[{"multiple": 5.6, "value": 90}, {"multiple": 6.25, "value": 100}, {"multiple": 7.0, "value": 110}]))
    check("piecewise honors a third anchor (applied at it → its recorded value)", eval_ap_valuation_summary_integrity(tri, None) == [])

    # ---- v1.2 scenario derivation chains: REPRODUCE-or-omit, same rule as the method internals ----
    # the NHY bear chain verbatim: (114095 − 17919 − 7495) / 1965.28 = 45.1238 → level 45.12 (within tol)
    nhy_chain = {"model": "ev_bridge", "ev": 114095, "net_debt": 17919, "minority": 7495, "shares": 1965.28,
                 "stated_drivers": [{"label": "terminal Adj. EBITDA margin", "value": 0.09}], "source": "07 §3"}
    chain_ok = dict(ok_sidecar, scenarios=[{"label": "bull", "level": 20}, {"label": "base", "level": 15},
                                           {"label": "bear", "level": 45.12, "derivation": nhy_chain}])
    dr_chain = {"scenarios": [{"label": "bull", "price_target": 20}, {"label": "base", "price_target": 15}, {"label": "bear", "price_target": 45.12}]}
    check("derivation chain that reproduces its level → pass", eval_ap_valuation_summary_integrity(chain_ok, dr_chain) == [])
    chain_off = dict(chain_ok, scenarios=[{"label": "bear", "level": 45.12, "derivation": dict(nhy_chain, ev=120000)}])
    check("chain not reproducing the level caught", any("REPRODUCE-or-omit" in v for v in eval_ap_valuation_summary_integrity(chain_off, None)))
    chain_model = dict(chain_ok, scenarios=[{"label": "bear", "level": 45.12, "derivation": dict(nhy_chain, model="dcf_rerun")}])
    check("unknown derivation model caught", any("not a known model" in v for v in eval_ap_valuation_summary_integrity(chain_model, None)))
    chain_noshares = dict(chain_ok, scenarios=[{"label": "bear", "level": 45.12, "derivation": dict(nhy_chain, shares=None)}])
    check("chain with no shares (own or top-level) caught", any("per-share step" in v for v in eval_ap_valuation_summary_integrity(chain_noshares, None)))
    # top-level shares as the fallback: same chain, shares moved to the sidecar root → still reproduces
    chain_top = dict(chain_ok, shares=1965.28, scenarios=[{"label": "bear", "level": 45.12, "derivation": dict(nhy_chain, shares=None)}])
    check("chain falls back to top-level shares → pass", eval_ap_valuation_summary_integrity(chain_top, None) == [])
    d_no_lvl = dict(ok_sidecar, scenarios=[{"label": "bear", "level": None, "derivation": nhy_chain}])
    check("derivation with a null level caught", any("numeric scenario level" in v for v in eval_ap_valuation_summary_integrity(d_no_lvl, None)))
    d_no_nd = dict(ok_sidecar, scenarios=[{"label": "bear", "level": 45.12, "derivation": {k: v for k, v in nhy_chain.items() if k != "net_debt"}}])
    check("derivation without explicit net_debt caught (§15)", any("never silently 0" in v for v in eval_ap_valuation_summary_integrity(d_no_nd, None)))
    d_bad_minority = dict(ok_sidecar, scenarios=[{"label": "bear", "level": 45.12, "derivation": dict(nhy_chain, minority="7495")}])
    check("derivation nonnumeric minority caught, not silently treated as zero",
          any("minority must be numeric" in v for v in eval_ap_valuation_summary_integrity(d_bad_minority, None)))
    d_no_src = dict(ok_sidecar, scenarios=[{"label": "bear", "level": 45.12, "derivation": {k: v for k, v in nhy_chain.items() if k != "source"}}])
    check("uncited derivation caught", any("cannot ship uncited" in v for v in eval_ap_valuation_summary_integrity(d_no_src, None)))

    # margin_runoff_dcf: the NHY bear replay verbatim — 228071×0.09 → −11500 → ×0.70 → +11500 −8500
    # → TV ×0.99/0.085 → ×0.72221 + 35712 = 114,095.9 ≈ recorded ev 114095 → level 45.12
    runoff = {"model": "margin_runoff_dcf", "ev": 114095, "margin": 0.09, "growth": -0.01,
              "da": 11500, "capex": 8500, "tax": 0.30, "dnwc": 0,
              "revenue_base": 228071, "wacc": 0.075, "pv_factor": 0.72221, "pv_explicit": 35712,
              "net_debt": 17919, "minority": 7495, "shares": 1965.28, "source": "07 §3"}
    runoff_ok = dict(ok_sidecar, scenarios=[{"label": "bear", "level": 45.12, "derivation": runoff}])
    check("margin_runoff_dcf replay reproduces ev + level → pass", eval_ap_valuation_summary_integrity(runoff_ok, None) == [])
    r_bad_const = dict(runoff_ok, scenarios=[{"label": "bear", "level": 45.12, "derivation": dict(runoff, revenue_base=250000)}])
    check("runoff replay != recorded ev caught (wrong constant)", any("reproduce the orb's own EV" in v for v in eval_ap_valuation_summary_integrity(r_bad_const, None)))
    r_bad_m = dict(runoff_ok, scenarios=[{"label": "bear", "level": 45.12, "derivation": dict(runoff, margin=0.10)}])
    check("runoff with a drifted margin caught", any("reproduce the orb's own EV" in v for v in eval_ap_valuation_summary_integrity(r_bad_m, None)))
    r_miss = dict(runoff_ok, scenarios=[{"label": "bear", "level": 45.12, "derivation": {k: v for k, v in runoff.items() if k != "wacc"}}])
    check("runoff missing a required constant → named", any("needs numeric" in v and "wacc" in v for v in eval_ap_valuation_summary_integrity(r_miss, None)))
    r_denom = dict(runoff_ok, scenarios=[{"label": "bear", "level": 45.12, "derivation": dict(runoff, growth=0.08)}])
    check("runoff wacc − growth <= 0 → named", any("perpetuity is undefined" in v for v in eval_ap_valuation_summary_integrity(r_denom, None)))

    # ---- v1.3 per-scenario multiples: named bases, cross-checks, per-case bridge ----
    # NHY's real shape: ONE metric base, three IMPLIED multiples, a per-case split bridge.
    def _nhy(label, mult, level, **over):
        d = {"label": label, "forward_metric": 28889, "metric_basis": "FY2025 Adj. EBITDA",
             "multiple": mult, "multiple_basis": "EV/FY2025 Adj. EBITDA", "multiple_kind": "implied",
             "source": "07_scenario-and-fair-value.md §2",
             "bridge": {"net_debt": 17919, "net_debt_basis": "cash-quality adjusted (01 canonical)",
                        "minority": 7495, "shares": 1965.28}, "level": level}
        d.update(over); return d
    v13 = {"schema_version": "1.3", "ticker": "NHY", "basis": "ev", "shares": 1965.28,
           "scenarios": [_nhy("bull", 8.21, 107.7), _nhy("base", 6.45, 81.83), _nhy("bear", 3.95, 45.12)]}
    check("v1.3 NHY shape (one metric, three implied multiples, per-case bridge) → pass",
          eval_ap_valuation_summary_integrity(v13, None) == [])
    # the reproduce test still bites: a wrong multiple cannot ship
    bad_mult = dict(v13, scenarios=[_nhy("bull", 9.99, 107.7), _nhy("base", 6.45, 81.83), _nhy("bear", 3.95, 45.12)])
    check("v1.3 multiple that does not reproduce its level caught",
          any("!= forward_metric" in v for v in eval_ap_valuation_summary_integrity(bad_mult, None)))
    # a bare multiple is an incomplete citation (§5)
    no_basis = dict(v13, scenarios=[_nhy("bull", 8.21, 107.7, multiple_basis=None), _nhy("base", 6.45, 81.83), _nhy("bear", 3.95, 45.12)])
    check("v1.3 multiple without its basis caught (§5)",
          any("incomplete citation" in v for v in eval_ap_valuation_summary_integrity(no_basis, None)))
    no_mb = dict(v13, scenarios=[_nhy("bull", 8.21, 107.7, metric_basis="  "), _nhy("base", 6.45, 81.83), _nhy("bear", 3.95, 45.12)])
    check("v1.3 metric without its period caught",
          any("no metric_basis" in v for v in eval_ap_valuation_summary_integrity(no_mb, None)))
    bad_kind = dict(v13, scenarios=[_nhy("bull", 8.21, 107.7, multiple_kind="guessed"), _nhy("base", 6.45, 81.83), _nhy("bear", 3.95, 45.12)])
    check("v1.3 unknown multiple_kind caught",
          any("multiple_kind" in v for v in eval_ap_valuation_summary_integrity(bad_kind, None)))
    # multiple_kind is REQUIRED whenever the v1.3 tuple is present, not merely valid-when-supplied — an
    # omitted/null kind used to pass the finish gate even though the schema relies on it to drive the
    # Playground's two-way behaviour (Codex #362 P2, fresh evidence)
    no_kind = dict(v13, scenarios=[_nhy("bull", 8.21, 107.7, multiple_kind=None), _nhy("base", 6.45, 81.83), _nhy("bear", 3.95, 45.12)])
    check("v1.3 tuple with multiple_kind omitted is caught, not silently passed",
          any("multiple_kind" in v and "required" in v for v in eval_ap_valuation_summary_integrity(no_kind, None)))
    # EMAAR-style secondaries: recorded, shape-validated, never computed with
    sec_ok = dict(v13, scenarios=[_nhy("bull", 8.21, 107.7), _nhy("base", 6.45, 81.83,
                  secondary_multiples=[{"value": 7.0, "basis": "P/E"}, {"value": 1.5, "basis": "P/BV (book)"}]),
                  _nhy("bear", 3.95, 45.12)])
    check("v1.3 secondary multiples recorded → pass (cross-checks, never computed with)",
          eval_ap_valuation_summary_integrity(sec_ok, None) == [])
    sec_bad = dict(v13, scenarios=[_nhy("bull", 8.21, 107.7), _nhy("base", 6.45, 81.83,
                   secondary_multiples=[{"value": 7.0}]), _nhy("bear", 3.95, 45.12)])
    check("v1.3 secondary multiple without a named basis caught",
          any("secondary_multiples" in v for v in eval_ap_valuation_summary_integrity(sec_bad, None)))
    # mixing a per-case bridge with the run-level deduction is the double-counting trap
    mixed = dict(v13, scenarios=[_nhy("bull", 8.21, 107.7), _nhy("base", 6.45, 81.83),
                 {"label": "bear", "forward_metric": 28889, "metric_basis": "FY2025 Adj. EBITDA",
                  "multiple": 3.95, "multiple_basis": "EV/FY2025 Adj. EBITDA", "level": 45.12,
                  "source": "07_scenario-and-fair-value.md §2"}])
    check("v1.3 some-cases-only bridge caught (convention mixing double-counts minority)",
          any("must not mix per-case bridge" in v for v in eval_ap_valuation_summary_integrity(mixed, None)))
    # grandfathering: the SAME shape without a 1.3 declaration is not held to the naming rules
    old = dict(v13, schema_version="1.2", scenarios=[_nhy("bull", 8.21, 107.7, multiple_basis=None, metric_basis=None, source=None),
               _nhy("base", 6.45, 81.83, multiple_basis=None, metric_basis=None, source=None),
               _nhy("bear", 3.95, 45.12, multiple_basis=None, metric_basis=None, source=None)])
    check("pre-1.3 sidecars are grandfathered (naming rules apply only on opt-in)",
          eval_ap_valuation_summary_integrity(old, None) == [])

    # ---- the guard is a VALIDATOR: malformed input becomes a violation, never an exception. scan_committed
    # does not catch, so a raise here would abort the whole CI sweep instead of failing one row.
    for bad_nd, why in ((None, "absent"), ("17,919", "a string"), (True, "a bool")):
        br = {"net_debt_basis": "cash-quality adjusted", "minority": 7495, "shares": 1965.28}
        if bad_nd is not None:
            br["net_debt"] = bad_nd
        nd_bad = dict(v13, scenarios=[_nhy("bull", 8.21, 107.7, bridge=br), _nhy("base", 6.45, 81.83), _nhy("bear", 3.95, 45.12)])
        try:
            out = eval_ap_valuation_summary_integrity(nd_bad, None)
        except Exception as e:  # the failure this test exists to prevent
            out, fails = [], fails + [f"bridge net_debt {why} RAISED {type(e).__name__} instead of reporting"]
        check(f"bridge net_debt {why} → violation, no raise", any("net_debt must be explicit" in v for v in out))
    br_str_shares = dict(v13, scenarios=[_nhy("bull", 8.21, 107.7, bridge={"net_debt": 17919, "net_debt_basis": "adj", "shares": 0}),
                         _nhy("base", 6.45, 81.83), _nhy("bear", 3.95, 45.12)])
    check("bridge with zero shares → violation, no ZeroDivisionError",
          any("no positive shares" in v for v in eval_ap_valuation_summary_integrity(br_str_shares, None)))
    # §15: a per-case debt figure must name its basis wherever it appears
    no_ndb = dict(v13, scenarios=[_nhy("bull", 8.21, 107.7, bridge={"net_debt": 17919, "minority": 7495, "shares": 1965.28}),
                  _nhy("base", 6.45, 81.83), _nhy("bear", 3.95, 45.12)])
    check("v1.3 per-case bridge without a net_debt_basis caught (§15)",
          any("no net_debt_basis" in v for v in eval_ap_valuation_summary_integrity(no_ndb, None)))
    # a present-but-nonnumeric optional deduction (minority/other) must be REPORTED, not silently read
    # as 0 — a generated bridge with "minority": "7495" (a string) used to pass with the deduction
    # dropped from the arithmetic (Codex #362 P2, fresh evidence beyond the net_debt-only fix)
    for bad_key in ("minority", "other"):
        br = {"net_debt": 17919, "net_debt_basis": "cash-quality adjusted", "shares": 1965.28, bad_key: "7495"}
        nonnum_bad = dict(v13, scenarios=[_nhy("bull", 8.21, 107.7, bridge=br), _nhy("base", 6.45, 81.83), _nhy("bear", 3.95, 45.12)])
        out3 = eval_ap_valuation_summary_integrity(nonnum_bad, None)
        check(f"bridge {bad_key} nonnumeric caught, not silently treated as 0",
              any(f"{bad_key} must be numeric" in v for v in out3))

    # ---- the v1.3 labelling rules key off PRESENCE, not off a complete pair (a half tuple used to skip
    # every check below it and ship an unlabelled, uncited, underivable lever).
    half = dict(v13, scenarios=[{"label": "bull", "multiple": 8.21, "level": 107.7},
                _nhy("base", 6.45, 81.83), _nhy("bear", 3.95, 45.12)])
    half_out = eval_ap_valuation_summary_integrity(half, None)
    check("v1.3 half a metric×multiple pair caught (MODULE_RULES §2)", any("only half of the metric" in v for v in half_out))
    check("v1.3 half pair still demands multiple_basis", any("incomplete citation" in v for v in half_out))
    check("v1.3 half pair still demands a source", any("no §5 source" in v for v in half_out))
    kind_only = dict(v13, scenarios=[{"label": "bull", "level": 107.7, "multiple_kind": "guessed"},
                     _nhy("base", 6.45, 81.83), _nhy("bear", 3.95, 45.12)])
    check("multiple_kind is validated even with no multiple present",
          any("multiple_kind" in v for v in eval_ap_valuation_summary_integrity(kind_only, None)))
    no_src = dict(v13, scenarios=[_nhy("bull", 8.21, 107.7, source="  "), _nhy("base", 6.45, 81.83), _nhy("bear", 3.95, 45.12)])
    check("v1.3 scenario levers without a §5 citation caught",
          any("no §5 source" in v for v in eval_ap_valuation_summary_integrity(no_src, None)))
    # CLAUDE.md §5's banned bare citations must be REJECTED, not accepted as "any non-empty string"
    # (Codex #362 P2, fresh evidence) — checked against the scenario source AND the other §5-cited
    # internals blocks (dcf_grid/sotp_bridge/peers_internals), since they all share the one _cited() gate
    for bare in ("source", "Source.", "annual report", "company filings", "management said", "Industry Data"):
        vague_src = dict(v13, scenarios=[_nhy("bull", 8.21, 107.7, source=bare), _nhy("base", 6.45, 81.83), _nhy("bear", 3.95, 45.12)])
        check(f"v1.3 scenario source {bare!r} rejected as a banned bare citation",
              any("no §5 source" in v for v in eval_ap_valuation_summary_integrity(vague_src, None)))
    # a real citation (document + section/date) must NOT be caught by the banned-phrase gate
    check("a real citation is not falsely rejected",
          eval_ap_valuation_summary_integrity(v13, None) == [])
    vague_grid = dict(internals, dcf_grid=dict(internals["dcf_grid"], source="source"))
    check("dcf_grid banned bare source rejected (shared _cited gate)",
          any("source citation" in v for v in eval_ap_valuation_summary_integrity(vague_grid, None)))
    check("pre-1.3 half pairs stay grandfathered",
          eval_ap_valuation_summary_integrity(dict(old, scenarios=[{"label": "bull", "multiple": 8.21, "level": 107.7}]), None) == [])

    # ---- a misspelled per-case basis is REJECTED, never silently fallen back to the run's
    for bad_b in ("EV", "Equity", "eq", 7):
        bout = eval_ap_valuation_summary_integrity(
            dict(v13, scenarios=[_nhy("bull", 8.21, 107.7, basis=bad_b), _nhy("base", 6.45, 81.83), _nhy("bear", 3.95, 45.12)]), None)
        check(f"scenario basis {bad_b!r} rejected", any("is not 'equity' or 'ev'" in v for v in bout))
    check("an ABSENT per-case basis still falls back to the run's (that is the contract)",
          eval_ap_valuation_summary_integrity(dict(v13, basis="ev", scenarios=[
              {k: v for k, v in _nhy("bull", 8.21, 107.7).items() if k != "basis"},
              {k: v for k, v in _nhy("base", 6.45, 81.83).items() if k != "basis"},
              {k: v for k, v in _nhy("bear", 3.95, 45.12).items() if k != "basis"}]), None) == [])

    # ---- an unparseable schema_version is REJECTED, never read as pre-1.3 (a typo would switch the gate off)
    for bad_ver in ("v1.3", "1.3-beta", "garbage", ""):
        vout = eval_ap_valuation_summary_integrity(dict(v13, schema_version=bad_ver), None)
        check(f"schema_version {bad_ver!r} rejected", any("not a dotted numeric version" in v for v in vout))
    check("schema_version '1' parses as 1.0 (pre-1.3, grandfathered)",
          eval_ap_valuation_summary_integrity(dict(old, schema_version="1"), None) == [])
    check("schema_version '1.3.0' parses as 1.3 (rules apply)",
          eval_ap_valuation_summary_integrity(dict(v13, schema_version="1.3.0"), None) == [])

    # ---- v1.3 mixed bases in ONE run — EMAAR's real SHAPE (EV/EBITDA base + P/BV bear). The bear is
    # EMAAR's actual arithmetic (10.16 book/share x 0.96 = 9.75); the base metric is synthetic-but-
    # consistent (its real 15.00 came from a method blend minus a disclosed owner discount, so no single
    # LTM metric reproduces it — which is exactly what `multiple_kind: implied` records).
    emaar = {"schema_version": "1.3", "ticker": "EMAAR", "basis": "ev", "shares": 8838.8, "net_debt": -24969,
             "scenarios": [
                 {"label": "base", "forward_metric": 18122.5, "metric_basis": "normalized EBITDA (synthetic)", "multiple": 6.7,
                  "multiple_basis": "normalized EV/EBITDA", "multiple_kind": "implied", "source": "07 §2",
                  "secondary_multiples": [{"value": 7.0, "basis": "P/E"}, {"value": 1.5, "basis": "P/BV (book)"}],
                  "bridge": {"net_debt": -24969, "net_debt_basis": "strict (net cash)", "minority": 13808, "shares": 8838.8}, "level": 15.00},
                 # the BEAR reads on BOOK — an equity multiple, no bridge, no EV arithmetic
                 {"label": "bear", "basis": "equity", "forward_metric": 10.16, "metric_basis": "book value / share",
                  "multiple": 0.96, "multiple_basis": "P/BV (book)", "multiple_kind": "implied", "source": "07 §3", "level": 9.75},
             ]}
    check("v1.3 mixed bases in one run (EV base + book-value bear) → pass",
          eval_ap_valuation_summary_integrity(emaar, None) == [])
    # the equity case must NOT be bridged — that turns 9.75 into −2.82
    wrong = json.loads(json.dumps(emaar))
    wrong["scenarios"][1]["basis"] = "ev"
    check("an equity multiple mis-declared as ev fails to reproduce (9.75 vs −2.82)",
          any("!= forward_metric" in v for v in eval_ap_valuation_summary_integrity(wrong, None)))
    bridged_equity = json.loads(json.dumps(emaar))
    bridged_equity["scenarios"][1]["bridge"] = {"net_debt": -24969}
    check("a bridge on an equity-basis case caught (no EV→equity bridge to apply)",
          any("equity-basis case" in v for v in eval_ap_valuation_summary_integrity(bridged_equity, None)))
    # all-or-none applies only AMONG ev cases — the book-value bear must not trip it
    check("the all-or-none bridge rule ignores equity-basis cases",
          not any("must not mix" in v for v in eval_ap_valuation_summary_integrity(emaar, None)))

    if fails:
        print("VALUATION SUMMARY CHECKS SELFTEST FAIL:", ", ".join(fails))
        return 1
    print("VALUATION SUMMARY CHECKS SELFTEST PASS — soft-presence + structure + labels + metric×multiple + "
          "blend + decision_record match/non-contradiction, all branches green")
    return 0


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        raise SystemExit(_selftest())
    if "--all" in sys.argv:
        checked, failures = scan_committed(".")
        for run, viol in failures:
            for v in viol:
                print(f"  ✗ {run}: {v}")
        if failures:
            print(f"VALUATION SUMMARY SCAN FAIL — {len(failures)}/{checked} committed sidecar(s) invalid")
            raise SystemExit(1)
        print(f"VALUATION SUMMARY SCAN PASS — {checked} committed sidecar(s) valid + non-contradicting")
        raise SystemExit(0)
    print("usage: valuation_summary_checks.py [--selftest | --all]")
    raise SystemExit(2)
