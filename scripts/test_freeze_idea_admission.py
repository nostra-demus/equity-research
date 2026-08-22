#!/usr/bin/env python3
"""Focused regressions for the immutable post-audit idea admission gate."""
from __future__ import annotations

import datetime as dt
import json
import multiprocessing as mp
import os
import shutil
import tempfile

from freeze_idea_admission import digest, freeze, main as freeze_main
from create_idea_projection_manifest import create as create_manifest, file_digest, validate_manifest


def freeze_worker(queue, run_root, repo):
    try:
        queue.put(("ok", freeze(run_root, repo)))
    except Exception as exc:  # pragma: no cover - delivered to the parent assertion
        queue.put(("error", repr(exc)))


def replace_with_negative(run_root, run, ticker):
    original = json.load(open(os.path.join(run, "idea_3_6m.json"), encoding="utf-8"))
    negative = {
        "schema_version": "idea-assessment/v1",
        "assessment_id": f"{ticker}-{run_root.rsplit('_', 1)[-1]}-3-6m",
        "run_root": run_root,
        "created_at": original["created_at"],
        "ticker": ticker,
        "company": f"{ticker} Holdings",
        "status": "not_assessable",
        "gaps": ["No source-bound catalyst."],
        "candidate": None,
    }
    with open(os.path.join(run, "idea_3_6m.json"), "w", encoding="utf-8") as handle:
        json.dump(negative, handle)
    return original, negative


def iso(value):
    return value.astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def rewrite_decision_and_rebind_audits(run, mutate):
    decision_path = os.path.join(run, "decision_record.json")
    decision = json.load(open(decision_path, encoding="utf-8"))
    mutate(decision)
    with open(decision_path, "w", encoding="utf-8") as handle:
        json.dump(decision, handle)
    decision_sha = file_digest(decision_path)
    for name in ("verification_report.json", "pre_mortem.json", "expectations_gap.json"):
        audit_path = os.path.join(run, name)
        audit = json.load(open(audit_path, encoding="utf-8"))
        audit["ticker"] = decision["ticker"]
        audit["decision_record_sha256"] = decision_sha
        with open(audit_path, "w", encoding="utf-8") as handle:
            json.dump(audit, handle)


def fixture(
    repo,
    ticker="TEST",
    decision="Buy",
    post_decision=None,
    pre_survives=True,
    pre_verdict="Survives",
    pre_cap="",
    expectations_quality="Strong",
    expectations_exploitable=True,
    expectations_edge=66,
    reconcile_audits=True,
    company_name=None,
):
    now = dt.datetime.now(dt.timezone.utc).replace(microsecond=0)
    run_date = now.date().isoformat()
    run_root = f"analyses/{ticker}_{run_date}"
    run = os.path.join(repo, run_root)
    os.makedirs(run, exist_ok=True)
    start = iso(now + dt.timedelta(days=1))
    end = iso(now + dt.timedelta(days=181))
    quote_at = iso(now - dt.timedelta(hours=1))
    catalyst_start = iso(now + dt.timedelta(days=30))
    catalyst_end = iso(now + dt.timedelta(days=31))
    source_citation = "Quarterly filing and company calendar, current run"
    bridge = {"source_horizon_days": 180, "method": "same_horizon", "convergence_fraction": None, "rationale": "The event payoff is modeled directly over the exact holding window.", "source": "Event model"}
    scenarios = [
        {"scenario_id": "bull", "label": "bull", "probability_pct": 25, "price_target": 140, "source_price_target": 140, "conditions": ["The KPI beats materially"], "source": "Event model"},
        {"scenario_id": "base", "label": "base", "probability_pct": 55, "price_target": 118, "source_price_target": 118, "conditions": ["The KPI meets expectations"], "source": "Event model"},
        {"scenario_id": "bear", "label": "bear", "probability_pct": 20, "price_target": 88, "source_price_target": 88, "conditions": ["The KPI misses expectations"], "source": "Event model"},
    ]
    forecast = {
        "forecast_id": f"FC-{ticker}-RESULTS", "prediction": "Results", "probability": 65,
        "time_window": "Next quarterly results", "evidence_today": source_citation,
        "confirmation_trigger": "The KPI exceeds the frozen estimate by ten percent.",
        "falsification_trigger": "The thesis fails if the filed KPI misses the frozen estimate.",
        "owner_module": "earnings", "confidence_score": 65, "status": "open", "forecast_type": "earnings_eps",
        "window_start": catalyst_start, "window_end": catalyst_end, "status_as_of": iso(now),
        "source_citation": source_citation, "metric": "Filed KPI", "threshold": "Below estimate",
        "causal_steps": ["The company reports the measured KPI.", "The market revises the matching forecast."],
        "stock_bullish_trigger": "The KPI exceeds the frozen estimate by ten percent.",
        "stock_bearish_trigger": "The KPI misses the frozen estimate.",
    }
    edge_proof = "Filed unit economics exceed the frozen market baseline by a measurable margin."
    decision_company = f"{ticker} Holdings" if company_name is None else company_name
    record = {
        "run_root": run_root, "decision_date": run_date, "ticker": ticker, "company_name": decision_company, "exchange": "NYSE", "currency": "USD",
        "decision": decision, "post_mortem_decision": post_decision or decision, "data_sufficiency_score": 82, "edge_score": 66,
        "edge_proof": edge_proof, "rating_cap": None, "red_flags": [],
        "confidence_inputs": {"rating_cap_ceiling": None, "critical_governance_unresolved": False},
        "scenario_horizon_days": 180, "idea_valuation_bridge": bridge,
        "scenarios": [{"scenario_id": row["scenario_id"], "label": row["label"], "probability": row["probability_pct"], "return_pct": None, "price_target": row["source_price_target"], "conditions": row["conditions"], "source": row["source"], "joint_probability_basis": None} for row in scenarios],
        "forecast_ledger": [forecast],
    }
    with open(os.path.join(run, "decision_record.json"), "w", encoding="utf-8") as handle:
        json.dump(record, handle)
    with open(os.path.join(run, "final_thesis.md"), "w", encoding="utf-8") as handle:
        handle.write("# Final thesis\n")
    thesis_sha = file_digest(os.path.join(run, "final_thesis.md"))
    decision_sha = file_digest(os.path.join(run, "decision_record.json"))
    audit_identity = {
        "schema_version": "1.0", "ticker": ticker, "run_root": run_root,
        "final_thesis_path": run_root + "/final_thesis.md",
        "decision_record_path": run_root + "/decision_record.json",
        "final_thesis_sha256": thesis_sha, "decision_record_sha256": decision_sha,
    }
    docs = {
        "verification_report.json": {
            **audit_identity, "verified_at": iso(now), "verifier": "verify-evidence",
            "verdict": "Clean", "integrity_score": 95, "blocking_findings": [],
        },
        "pre_mortem.json": {
            **audit_identity, "performed_at": iso(now), "auditor": "pre-mortem",
            "verdict": pre_verdict, "survives": pre_survives, "original_confidence": 65,
            "confidence_haircut": 0, "recommended_confidence": 65,
            "recommended_rating_cap": pre_cap,
        },
        "expectations_gap.json": {
            **audit_identity, "performed_at": iso(now), "analyst": "expectations-gap",
            "variant_perception_quality": expectations_quality,
            "is_exploitable": expectations_exploitable, "edge_score": expectations_edge,
        },
    }
    for name, value in docs.items():
        with open(os.path.join(run, name), "w", encoding="utf-8") as handle:
            json.dump(value, handle)
    manifest = create_manifest(run_root, repo)
    created = manifest["created_at"]
    evidence = {
        "schema_version": "idea-market-evidence/v1", "symbol": ticker, "available": True, "gaps": [],
        "instrument": {"ticker": ticker, "exchange": "NYSE", "currency": "USD", "asset_type": "equity"},
        "quote": {"price": 100, "as_of": quote_at, "source": "Test adjusted close", "identity_verified": True, "stale": False},
        "liquidity": {
            "verified": True, "as_of": quote_at, "source": "Test close x volume", "lookback_days": 60,
            "observed_sessions": 60, "coverage_pct": 100, "window_start": iso(now - dt.timedelta(days=90)),
            "window_end": quote_at, "median_daily_value_usd": 50_000_000,
            "currency_conversion": {"pair": "USD/USD", "rate_usd_per_currency": 1, "as_of": quote_at, "source": "USD listing currency"},
        },
        "market_risk": {"as_of": quote_at, "source": "Test adjusted closes", "lookback_days": 60, "ordinary_move_pct": 8},
    }
    market_sha = digest(evidence)
    audit_cap_reasons = []
    if pre_survives is not True or pre_cap:
        reason = f"pre-mortem audit: {pre_verdict}"
        if pre_cap:
            reason += f" ({pre_cap})"
        audit_cap_reasons.append(reason)
    if expectations_exploitable is not True or expectations_quality not in {"Moderate", "Strong"}:
        audit_cap_reasons.append(
            "expectations-gap audit found no proven exploitable edge "
            f"(quality={expectations_quality}, is_exploitable={str(expectations_exploitable).lower()})"
        )
    candidate_edge = min(66, expectations_edge) if reconcile_audits else 66
    candidate_hard_cap = bool(audit_cap_reasons) if reconcile_audits else False
    candidate_cap_reason = "; ".join(audit_cap_reasons) if candidate_hard_cap else None
    candidate = {
        "schema_version": "qualified-idea/v1", "policy_version": "ideas-policy/precal-v1",
        "idea_id": f"{ticker}-{run_date}-long-3-6m", "market_evidence_sha256": market_sha,
        "projection_manifest_sha256": manifest["manifest_sha256"], "run_root": run_root, "decision_date": run_date, "created_at": created,
        "instrument": {"ticker": ticker, "company": f"{ticker} Holdings", "exchange": "NYSE", "currency": "USD", "direction": "long", "asset_type": "equity"},
        "horizon": {"start": start, "end": end}, "quote": evidence["quote"], "liquidity": evidence["liquidity"], "market_risk": evidence["market_risk"],
        "research": {
            "decision": decision, "integrity_status": "unaudited", "data_sufficiency_score": 82, "edge_score": candidate_edge,
            "edge_proof": edge_proof,
            "hard_cap_active": candidate_hard_cap, "hard_cap_reason": candidate_cap_reason,
            "unresolved_red_flags": [], "calibration_status": "pre_data",
        },
        "catalyst": {
            "forecast_id": forecast["forecast_id"], "name": forecast["prediction"], "window_start": forecast["window_start"], "window_end": forecast["window_end"],
            "source": forecast["source_citation"], "status_at_admission": "scheduled_unresolved", "status_as_of": forecast["status_as_of"],
            "causal_steps": forecast["causal_steps"], "bullish_trigger": forecast["stock_bullish_trigger"], "bearish_trigger": forecast["stock_bearish_trigger"],
        },
        "falsifier": {"condition": forecast["falsification_trigger"], "metric": forecast["metric"], "threshold": forecast["threshold"], "deadline": forecast["window_end"], "source": forecast["source_citation"]},
        "valuation_bridge": bridge, "scenarios": scenarios,
    }
    assessment = {"schema_version": "idea-assessment/v1", "assessment_id": f"{ticker}-{run_date}-3-6m", "run_root": run_root, "created_at": created, "ticker": ticker, "company": f"{ticker} Holdings", "status": "candidate", "gaps": [], "candidate": candidate}
    docs = {"idea_3_6m.json": assessment, "idea_market_evidence.json": {"schema_version": "idea-market-evidence-snapshot/v1", "captured_at": created, "projection_manifest_sha256": manifest["manifest_sha256"], "evidence": evidence, "evidence_sha256": market_sha}}
    for name, value in docs.items():
        with open(os.path.join(run, name), "w", encoding="utf-8") as handle:
            json.dump(value, handle)
    return run_root, run


def main():
    repo = tempfile.mkdtemp(prefix="idea-admission-test-")
    try:
        run_root, run = fixture(repo)
        publication_marker = os.path.join(run, ".requires_idea_publication")
        open(publication_marker, "w", encoding="utf-8").close()
        assert freeze_main(["--check-only", run_root]) == 2
        assert not os.path.exists(os.path.join(run, "idea_admission.json")), "the removed preview option must not expose or freeze a semantic result"
        assert os.path.exists(publication_marker), "a failed/non-writing freezer call must retain the completion marker"
        assert freeze(run_root, repo) == 0
        assert not os.path.exists(publication_marker), "a valid atomic admission must release the launcher's completion marker"
        admitted = json.load(open(os.path.join(run, "idea_admission.json"), encoding="utf-8"))
        assert admitted["status"] == "admitted" and admitted["gaps"] == []
        assert admitted["candidate_sha256"] == digest(admitted["candidate"])
        open(publication_marker, "w", encoding="utf-8").close()
        assert freeze(run_root, repo) == 0
        assert not os.path.exists(publication_marker), "idempotent recovery must release a stale completion marker after revalidation"
        assert json.load(open(os.path.join(run, "idea_admission.json"), encoding="utf-8")) == admitted, "recovery may validate but never rewrite the first frozen result"
        original_target = admitted["candidate"]["scenarios"][0]["price_target"]
        assessment_path = os.path.join(run, "idea_3_6m.json")
        changed = json.load(open(assessment_path, encoding="utf-8"))
        changed["candidate"]["scenarios"][0]["price_target"] = 999
        json.dump(changed, open(assessment_path, "w", encoding="utf-8"))
        try:
            freeze(run_root, repo)
            raise AssertionError("a sealed run must not silently accept a changed assessment")
        except ValueError:
            pass
        assert json.load(open(os.path.join(run, "idea_admission.json"), encoding="utf-8"))["candidate"]["scenarios"][0]["price_target"] == original_target

        race_root, race_run = fixture(repo, ticker="RACE")
        ctx = mp.get_context("fork")
        queue = ctx.Queue()
        racers = [ctx.Process(target=freeze_worker, args=(queue, race_root, repo)) for _ in range(2)]
        for process in racers:
            process.start()
        for process in racers:
            process.join(10)
            assert process.exitcode == 0
        results = [queue.get(timeout=2) for _ in racers]
        assert results == [("ok", 0), ("ok", 0)]
        raced = json.load(open(os.path.join(race_run, "idea_admission.json"), encoding="utf-8"))
        assert raced["status"] == "admitted" and raced["admission_sha256"] == digest({key: value for key, value in raced.items() if key != "admission_sha256"})

        bad_root, bad_run = fixture(repo, ticker="BAD", decision="Buy", post_decision="Watchlist")
        bad_record_path = os.path.join(bad_run, "decision_record.json")
        bad_record = json.load(open(bad_record_path, encoding="utf-8"))
        assert freeze(bad_root, repo) == 3
        rejected = json.load(open(os.path.join(bad_run, "idea_admission.json"), encoding="utf-8"))
        assert rejected["status"] == "not_admitted" and any("decision" in gap for gap in rejected["gaps"])
        bad_record["post_mortem_decision"] = "Buy"
        json.dump(bad_record, open(bad_record_path, "w", encoding="utf-8"))
        try:
            freeze(bad_root, repo)
            raise AssertionError("a later repair must invalidate the sealed run rather than backdate admission")
        except ValueError:
            pass

        edge_root, edge_run = fixture(
            repo,
            ticker="NOEDGE",
            expectations_quality="Weak",
            expectations_exploitable=False,
            expectations_edge=30,
            reconcile_audits=False,
        )
        assert freeze(edge_root, repo) == 3
        edge_rejection = json.load(open(os.path.join(edge_run, "idea_admission.json"), encoding="utf-8"))
        assert any("post-audit" in gap or "edge_score" in gap for gap in edge_rejection["gaps"])
        assert edge_rejection["decision_authority"]["edge_score"] == 30
        assert edge_rejection["decision_authority"]["hard_cap_required"] is True

        broken_root, broken_run = fixture(
            repo,
            ticker="BROKEN",
            pre_survives=False,
            pre_verdict="Thesis broken",
            pre_cap="cap at Avoid",
            reconcile_audits=False,
        )
        assert freeze(broken_root, repo) == 3
        broken_rejection = json.load(open(os.path.join(broken_run, "idea_admission.json"), encoding="utf-8"))
        assert "pre-mortem audit: Thesis broken (cap at Avoid)" in broken_rejection["decision_authority"]["rating_cap_reason"]

        negative_root, negative_run = fixture(repo, ticker="NEGATIVE")
        original_assessment, negative = replace_with_negative(negative_root, negative_run, "NEGATIVE")
        assert freeze(negative_root, repo) == 0
        frozen_negative = json.load(open(os.path.join(negative_run, "idea_admission.json"), encoding="utf-8"))
        assert frozen_negative["status"] == "not_applicable"
        assert frozen_negative["assessment_sha256"] == digest(negative)
        manifest = json.load(open(os.path.join(negative_run, "idea_projection_manifest.json"), encoding="utf-8"))
        assert frozen_negative["projection_manifest_sha256"] == manifest["manifest_sha256"]
        assert freeze(negative_root, repo) == 0
        with open(os.path.join(negative_run, "idea_3_6m.json"), "w", encoding="utf-8") as handle:
            json.dump(original_assessment, handle)
        try:
            freeze(negative_root, repo)
            raise AssertionError("a later candidate must not replace or validate against a frozen negative")
        except ValueError:
            pass
        assert json.load(open(os.path.join(negative_run, "idea_admission.json"), encoding="utf-8")) == frozen_negative
        with open(os.path.join(negative_run, "idea_3_6m.json"), "w", encoding="utf-8") as handle:
            json.dump(negative, handle)
        assert freeze(negative_root, repo) == 0

        unnamed_root, unnamed_run = fixture(repo, ticker="NEGUNNAMED", company_name="")
        _, unnamed_negative = replace_with_negative(unnamed_root, unnamed_run, "NEGUNNAMED")
        unnamed_negative["company"] = None
        with open(os.path.join(unnamed_run, "idea_3_6m.json"), "w", encoding="utf-8") as handle:
            json.dump(unnamed_negative, handle)
        assert freeze(unnamed_root, repo) == 0
        assert json.load(open(os.path.join(unnamed_run, "idea_admission.json"), encoding="utf-8"))["status"] == "not_applicable"

        forged_root, forged_run = fixture(repo, ticker="NEGFORGED")
        _, forged_assessment = replace_with_negative(forged_root, forged_run, "NEGFORGED")
        assert freeze(forged_root, repo) == 0
        forged_admission_path = os.path.join(forged_run, "idea_admission.json")
        forged_admission = json.load(open(forged_admission_path, encoding="utf-8"))
        forged_assessment["ticker"] = "OTHER"
        forged_assessment["company"] = "Other Holdings"
        forged_admission["assessment"] = forged_assessment
        forged_admission["assessment_sha256"] = digest(forged_assessment)
        forged_admission["admission_sha256"] = digest({
            key: value for key, value in forged_admission.items() if key != "admission_sha256"
        })
        with open(os.path.join(forged_run, "idea_3_6m.json"), "w", encoding="utf-8") as handle:
            json.dump(forged_assessment, handle)
        with open(forged_admission_path, "w", encoding="utf-8") as handle:
            json.dump(forged_admission, handle)
        try:
            freeze(forged_root, repo)
            raise AssertionError("recomputed digests must not detach a frozen negative from the manifest decision")
        except ValueError:
            pass

        no_manifest_root, no_manifest_run = fixture(repo, ticker="NEGNOSEAL")
        replace_with_negative(no_manifest_root, no_manifest_run, "NEGNOSEAL")
        os.unlink(os.path.join(no_manifest_run, "idea_projection_manifest.json"))
        try:
            freeze(no_manifest_root, repo)
            raise AssertionError("a not-assessable result without a valid projection seal must not freeze")
        except (OSError, ValueError):
            pass
        assert not os.path.exists(os.path.join(no_manifest_run, "idea_admission.json"))

        preliminary_root, preliminary_run = fixture(repo, ticker="NEGPRELIM")
        _, preliminary_negative = replace_with_negative(preliminary_root, preliminary_run, "NEGPRELIM")
        preliminary_manifest = json.load(open(os.path.join(preliminary_run, "idea_projection_manifest.json"), encoding="utf-8"))
        manifest_time = dt.datetime.fromisoformat(preliminary_manifest["created_at"].replace("Z", "+00:00"))
        preliminary_negative["created_at"] = iso(manifest_time - dt.timedelta(seconds=1))
        with open(os.path.join(preliminary_run, "idea_3_6m.json"), "w", encoding="utf-8") as handle:
            json.dump(preliminary_negative, handle)
        try:
            freeze(preliminary_root, repo)
            raise AssertionError("a preliminary pre-manifest timestamp must not freeze as not_applicable")
        except ValueError:
            pass
        assert not os.path.exists(os.path.join(preliminary_run, "idea_admission.json"))

        bad_assessment_root, bad_assessment_run = fixture(repo, ticker="NEGBADASSESS")
        _, bad_assessment = replace_with_negative(bad_assessment_root, bad_assessment_run, "NEGBADASSESS")
        assert freeze(bad_assessment_root, repo) == 0
        bad_assessment["unexpected"] = "schema drift"
        with open(os.path.join(bad_assessment_run, "idea_3_6m.json"), "w", encoding="utf-8") as handle:
            json.dump(bad_assessment, handle)
        try:
            freeze(bad_assessment_root, repo)
            raise AssertionError("a frozen negative must revalidate the current exact assessment schema")
        except ValueError:
            pass
        bad_assessment.pop("unexpected")
        with open(os.path.join(bad_assessment_run, "idea_3_6m.json"), "w", encoding="utf-8") as handle:
            json.dump(bad_assessment, handle)
        assert freeze(bad_assessment_root, repo) == 0
        os.unlink(os.path.join(bad_assessment_run, "idea_3_6m.json"))
        try:
            freeze(bad_assessment_root, repo)
            raise AssertionError("a frozen negative must fail when its current assessment is missing")
        except (OSError, ValueError):
            pass

        bad_manifest_root, bad_manifest_run = fixture(repo, ticker="NEGBADMANIFEST")
        replace_with_negative(bad_manifest_root, bad_manifest_run, "NEGBADMANIFEST")
        assert freeze(bad_manifest_root, repo) == 0
        with open(os.path.join(bad_manifest_run, "final_thesis.md"), "a", encoding="utf-8") as handle:
            handle.write("Tampered after the negative seal.\n")
        try:
            freeze(bad_manifest_root, repo)
            raise AssertionError("a frozen negative must revalidate every projection-manifest input")
        except ValueError:
            pass
        with open(os.path.join(bad_manifest_run, "final_thesis.md"), "w", encoding="utf-8") as handle:
            handle.write("# Final thesis\n")
        assert freeze(bad_manifest_root, repo) == 0
        with open(os.path.join(bad_manifest_run, "idea_projection_manifest.json"), "w", encoding="utf-8") as handle:
            handle.write("{corrupt JSON")
        try:
            freeze(bad_manifest_root, repo)
            raise AssertionError("a frozen negative must fail when its current manifest is corrupt")
        except (ValueError, json.JSONDecodeError):
            pass

        malformed_root, malformed_run = fixture(repo, ticker="MALFORMED")
        os.unlink(os.path.join(malformed_run, "idea_projection_manifest.json"))
        malformed_pm_path = os.path.join(malformed_run, "pre_mortem.json")
        malformed_pm = json.load(open(malformed_pm_path, encoding="utf-8"))
        malformed_pm["survives"] = False
        json.dump(malformed_pm, open(malformed_pm_path, "w", encoding="utf-8"))
        try:
            create_manifest(malformed_root, repo)
            raise AssertionError("an internally inconsistent final audit must not authorize a manifest")
        except ValueError:
            pass

        wrong_ticker_root, wrong_ticker_run = fixture(repo, ticker="WRONGTICKER")
        os.unlink(os.path.join(wrong_ticker_run, "idea_projection_manifest.json"))
        rewrite_decision_and_rebind_audits(wrong_ticker_run, lambda decision: decision.update(ticker="OTHER"))
        try:
            create_manifest(wrong_ticker_root, repo)
            raise AssertionError("a decision ticker detached from the run folder must not receive a manifest")
        except ValueError:
            pass
        assert not os.path.exists(os.path.join(wrong_ticker_run, "idea_projection_manifest.json"))

        wrong_date_root, wrong_date_run = fixture(repo, ticker="WRONGDATE")
        os.unlink(os.path.join(wrong_date_run, "idea_projection_manifest.json"))
        rewrite_decision_and_rebind_audits(wrong_date_run, lambda decision: decision.update(decision_date="2020-01-01"))
        try:
            create_manifest(wrong_date_root, repo)
            raise AssertionError("a decision_date detached from the run folder must not receive a manifest")
        except ValueError:
            pass
        assert not os.path.exists(os.path.join(wrong_date_run, "idea_projection_manifest.json"))

        stale_root, stale_run = fixture(repo, ticker="STALEAUDIT")
        os.unlink(os.path.join(stale_run, "idea_projection_manifest.json"))
        with open(os.path.join(stale_run, "final_thesis.md"), "a", encoding="utf-8") as handle:
            handle.write("Changed after audit.\n")
        try:
            create_manifest(stale_root, repo)
            raise AssertionError("an audit over stale thesis bytes must not authorize a manifest")
        except ValueError:
            pass

        corrupt_root, corrupt_run = fixture(repo, ticker="CORRUPT", decision="Buy")
        assert freeze(corrupt_root, repo) == 0
        corrupt_path = os.path.join(corrupt_run, "idea_admission.json")
        corrupt = json.load(open(corrupt_path, encoding="utf-8"))
        corrupt["candidate"]["scenarios"][0]["price_target"] = 999
        json.dump(corrupt, open(corrupt_path, "w", encoding="utf-8"))
        try:
            freeze(corrupt_root, repo)
            raise AssertionError("a tampered immutable admission must not be accepted as idempotent")
        except ValueError:
            pass

        superseded_root, superseded_run = fixture(repo, ticker="NEWAUDIT", decision="Buy")
        manifest = json.load(open(os.path.join(superseded_run, "idea_projection_manifest.json"), encoding="utf-8"))
        newer_audit = {
            "ticker": "NEWAUDIT", "run_root": superseded_root,
            "final_thesis_path": superseded_root + "/final_thesis.md",
            "decision_record_path": superseded_root + "/decision_record.json",
            "verdict": "Material issues", "integrity_score": 20,
        }
        json.dump(newer_audit, open(os.path.join(superseded_run, "verification_report_v2.json"), "w", encoding="utf-8"))
        assert not validate_manifest(manifest, superseded_run, superseded_root), "a later canonical audit must invalidate the older pin set"
        try:
            freeze(superseded_root, repo)
            raise AssertionError("admission must not ignore a newer audit version")
        except ValueError:
            pass
    finally:
        shutil.rmtree(repo)
    print("test_freeze_idea_admission: PASS")


if __name__ == "__main__":
    main()
