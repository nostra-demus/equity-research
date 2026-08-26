#!/usr/bin/env python3
"""Deterministic production-candidate ranker for the frozen 63-case memory benchmark.

The ranker sees only the held-out question, its declared search roots, and frozen corpus bytes.  It
adds typed repository-path priors and a conservative temporal cutoff to the literal baseline.  It
never accepts answer keys, evidence paths, forbidden paths, or category labels.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Mapping, Sequence

try:
    import memory_baseline as baseline
    from memory_runtime import _atomic_private_write
except ImportError:  # pragma: no cover - package-style imports
    from scripts import memory_baseline as baseline
    from scripts.memory_runtime import _atomic_private_write


DATE = re.compile(r"20\d{2}-\d{2}-\d{2}")
TEMPORAL_PHRASES = (
    "as known", "as of", " at the end", " on 20", "before", "processing time", "decision date",
)


def _cutoff(question: str, search_roots: Sequence[str]) -> str | None:
    normalized = question.casefold()
    dates = DATE.findall(normalized)
    if not dates and ("decision date" in normalized or "processing time" in normalized):
        for root in search_roots:
            dates.extend(DATE.findall(root))
    if not dates or not any(phrase in normalized for phrase in TEMPORAL_PHRASES):
        return None
    return min(dates)


def _post_cutoff(document: baseline.Document, cutoff: str) -> bool:
    path = document.path.casefold()
    path_dates = DATE.findall(path)
    if len(path_dates) > 1 and any(value > cutoff for value in path_dates[1:]):
        return True
    if len(path_dates) == 1 and path_dates[0] > cutoff:
        return True
    mutable_history = (
        "/reviews/" in path or path.endswith("/corrections.json") or "/board/" in path
    )
    return mutable_history and any(value > cutoff for value in DATE.findall(document.lower_text))


def rank_candidate(
    *, question: str, search_roots: Sequence[str], top_k: int, corpus: baseline.Corpus,
) -> list[baseline.RankedDocument]:
    """Rank from runtime inputs only, with deterministic temporal and typed-path policy."""

    normalized_question = question.casefold()
    terms = baseline._query_terms(question)
    bigrams = baseline._query_bigrams(question)
    cutoff = _cutoff(question, search_roots)
    ranked: list[baseline.RankedDocument] = []
    for document in corpus.documents_for(search_roots):
        if cutoff and _post_cutoff(document, cutoff):
            continue
        normalized_path = " ".join(baseline.TOKEN_RE.findall(document.path.casefold()))
        normalized_text = baseline.WHITESPACE_RE.sub(" ", document.lower_text)
        score = 0
        for term in terms:
            path_count = normalized_path.count(term)
            text_count = normalized_text.count(term)
            if path_count:
                score += 16 + min(path_count, 3)
            if text_count:
                score += 5 + min(text_count, 4)
        for bigram in bigrams:
            if bigram in normalized_path:
                score += 12
            if bigram in normalized_text:
                score += 4

        path = document.path.casefold()
        if any(term in normalized_question for term in (
            "decision", "rating", "call", "entry price", "edge score", "scenario", "forecast",
            "listing", "issuer", "instrument", "security",
        )) and path.endswith("/decision_record.json"):
            score += 60
        if any(term in normalized_question for term in (
            "correction", "corrected", "standing", "latest", "revised", "supersed", "errat",
            "fault", "broken",
        )) and path.endswith("/corrections.json"):
            score += 70
        if any(term in normalized_question for term in (
            "review", "result", "post-review", "outcome", "later",
        )) and "/reviews/" in path:
            score += 55
        if any(term in normalized_question for term in (
            "net debt", "leverage", "historical financial", "strict-basis",
        )) and path.endswith("/earnings/01_historical-financials.md"):
            score += 70
        if any(term in normalized_question for term in (
            "revenue driver", "customers", "rpo", "remaining performance obligation",
        )) and path.endswith("/earnings/02_revenue-drivers.md"):
            score += 70
        if any(term in normalized_question for term in (
            "valuation", "base value", "fair value",
        )) and ("valuation_summary" in path or "/valuation/" in path):
            score += 50
        if any(term in normalized_question for term in (
            "signal", "routing", "materiality",
        )) and path.endswith("/signal_payload.json"):
            score += 70
        if score > 0:
            ranked.append(baseline.RankedDocument(path=document.path, score=score))
    ranked.sort(key=lambda item: (-item.score, item.path))
    return ranked[:top_k]


METHOD: Mapping[str, object] = {
    "corpus_manifest_sha256": None,
    "corpus_pinning": "frozen manifest of repository-relative paths to Git blob ids",
    "description": "Deterministic typed-path lexical ranking with conservative question-derived temporal cutoffs.",
    "ranking_inputs": ["question", "search_roots"],
    "scoring_fields_hidden_until_after_ranking": True,
    "text_suffixes": sorted(baseline.TEXT_SUFFIXES),
    "tie_breaker": "repository-relative path ascending",
    "timing_recorded": False,
}


def build_candidate_report() -> dict:
    manifest = baseline.load_corpus_manifest()
    benchmark = baseline.load_benchmark(manifest=manifest)
    method = {**METHOD, "corpus_manifest_sha256": manifest.sha256}
    return baseline.build_report(
        benchmark, corpus=baseline.Corpus(manifest), ranker=rank_candidate, method=method,
        report_version="memory-production-candidate-ranker/v1",
    )


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="memory-phase0-candidate", description=__doc__)
    parser.add_argument("--output")
    args = parser.parse_args(argv)
    report = build_candidate_report()
    if args.output:
        _atomic_private_write(Path(args.output), report)
    else:
        sys.stdout.write(baseline.render_report(report))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


__all__ = ["build_candidate_report", "rank_candidate"]
