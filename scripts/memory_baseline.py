#!/usr/bin/env python3
"""Deterministic Phase 0 folder-and-literal-grep memory baseline.

The ranker deliberately accepts only a question and a list of search roots.  Fixture
answer keys and evidence paths are consumed later, by the evaluator, so they cannot
leak into ranking.  The script has no dependency on a model, an index, or network
access and records neither timings nor generation timestamps.
"""

from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import re
import sys
from collections import Counter
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable, Mapping, Sequence


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BENCHMARK = REPO_ROOT / "frameworks/memory/phase0/benchmark.json"
DEFAULT_REPORT = REPO_ROOT / "frameworks/memory/phase0/baseline-report.json"

TEXT_SUFFIXES = frozenset({".csv", ".json", ".md", ".ndjson", ".txt"})
TOKEN_RE = re.compile(r"[a-z0-9]+")
WHITESPACE_RE = re.compile(r"\s+")
STOP_WORDS = frozenset(
    {
        "a",
        "about",
        "after",
        "all",
        "an",
        "and",
        "are",
        "as",
        "at",
        "be",
        "before",
        "between",
        "by",
        "can",
        "did",
        "do",
        "does",
        "for",
        "from",
        "had",
        "has",
        "have",
        "how",
        "if",
        "in",
        "into",
        "is",
        "it",
        "its",
        "most",
        "of",
        "on",
        "or",
        "our",
        "should",
        "that",
        "the",
        "their",
        "this",
        "to",
        "use",
        "was",
        "were",
        "what",
        "when",
        "where",
        "which",
        "who",
        "why",
        "with",
        "would",
    }
)
REQUIRED_CATEGORIES = frozenset(
    {
        "fact_recall",
        "temporal_cutoff",
        "knowledge_update",
        "contradiction",
        "qualifier",
        "lineage",
        "entity_resolution",
        "abstention",
        "access_control",
    }
)


class FixtureError(ValueError):
    """Raised when a held-out fixture is malformed or points at absent evidence."""


@dataclass(frozen=True)
class Document:
    """A repository-relative text document used by the baseline ranker."""

    path: str
    raw: bytes
    text: str
    lower_text: str


@dataclass(frozen=True)
class RankedDocument:
    """One deterministic ranker result."""

    path: str
    score: int


def _load_json(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise FixtureError(f"cannot read JSON {path}: {exc}") from exc
    if not isinstance(value, dict):
        raise FixtureError(f"expected a JSON object in {path}")
    return value


def _repository_path(relative: str, *, must_exist: bool = True) -> Path:
    if not isinstance(relative, str) or not relative or Path(relative).is_absolute():
        raise FixtureError(f"path must be a non-empty repository-relative string: {relative!r}")
    candidate = (REPO_ROOT / relative).resolve()
    try:
        candidate.relative_to(REPO_ROOT)
    except ValueError as exc:
        raise FixtureError(f"path escapes repository root: {relative!r}") from exc
    if must_exist and not candidate.exists():
        raise FixtureError(f"fixture path does not exist: {relative}")
    return candidate


def _text_bytes(path: Path) -> bytes:
    try:
        return path.read_bytes()
    except OSError as exc:
        raise FixtureError(f"cannot read fixture path {path}: {exc}") from exc


def _under_any_root(path: Path, roots: Sequence[Path]) -> bool:
    for root in roots:
        if path == root:
            return True
        if root.is_dir():
            try:
                path.relative_to(root)
                return True
            except ValueError:
                pass
    return False


def validate_benchmark(benchmark: Mapping[str, Any]) -> None:
    """Validate the corpus and every scoring anchor without running retrieval."""

    errors: list[str] = []
    cases = benchmark.get("cases")
    if not isinstance(cases, list):
        raise FixtureError("benchmark.cases must be a list")
    if not 50 <= len(cases) <= 100:
        errors.append(f"expected 50-100 cases, found {len(cases)}")

    top_k = benchmark.get("top_k")
    if not isinstance(top_k, int) or isinstance(top_k, bool) or not 1 <= top_k <= 20:
        errors.append(f"top_k must be an integer from 1 to 20, found {top_k!r}")

    declared_categories = benchmark.get("required_categories")
    if not isinstance(declared_categories, list) or set(declared_categories) != REQUIRED_CATEGORIES:
        errors.append("required_categories must declare exactly the nine Phase 0 categories")

    protocol = benchmark.get("held_out_protocol")
    if not isinstance(protocol, dict):
        errors.append("held_out_protocol must be an object")
    else:
        if protocol.get("retrieval_inputs") != ["question", "search_roots"]:
            errors.append("held_out_protocol.retrieval_inputs must be question and search_roots only")
        scoring_only = protocol.get("scoring_only")
        required_scoring = {
            "answer_key",
            "evidence",
            "expected_outcome",
            "forbidden_paths",
            "protected_path_globs",
        }
        if not isinstance(scoring_only, list) or not required_scoring.issubset(scoring_only):
            errors.append("held_out_protocol.scoring_only omits a protected scoring field")

    identifiers: set[str] = set()
    questions: set[str] = set()
    category_counts: Counter[str] = Counter()
    for position, case in enumerate(cases, start=1):
        label = f"case {position}"
        if not isinstance(case, dict):
            errors.append(f"{label}: must be an object")
            continue
        case_id = case.get("id")
        if not isinstance(case_id, str) or not case_id:
            errors.append(f"{label}: id must be a non-empty string")
            case_id = label
        elif case_id in identifiers:
            errors.append(f"{case_id}: duplicate id")
        else:
            identifiers.add(case_id)
        label = case_id

        category = case.get("category")
        if category not in REQUIRED_CATEGORIES:
            errors.append(f"{label}: unknown category {category!r}")
        else:
            category_counts[category] += 1

        question = case.get("question")
        if not isinstance(question, str) or not question.strip():
            errors.append(f"{label}: question must be non-empty")
        elif question in questions:
            errors.append(f"{label}: duplicate question")
        else:
            questions.add(question)

        expected = case.get("expected_outcome")
        expected_for_category = (
            "deny" if category == "access_control" else "abstain" if category == "abstention" else "retrieve"
        )
        if expected != expected_for_category:
            errors.append(
                f"{label}: expected_outcome must be {expected_for_category!r} for {category!r}"
            )

        answer = case.get("answer_key")
        if not isinstance(answer, str) or not answer.strip():
            errors.append(f"{label}: answer_key must be non-empty")

        root_values = case.get("search_roots")
        roots: list[Path] = []
        if not isinstance(root_values, list) or not root_values:
            errors.append(f"{label}: search_roots must be a non-empty list")
        else:
            for relative in root_values:
                try:
                    roots.append(_repository_path(relative))
                except FixtureError as exc:
                    errors.append(f"{label}: {exc}")

        evidence = case.get("evidence")
        if not isinstance(evidence, list) or not evidence:
            errors.append(f"{label}: evidence must be a non-empty list")
        else:
            seen_evidence: set[str] = set()
            for item in evidence:
                if not isinstance(item, dict):
                    errors.append(f"{label}: evidence entries must be objects")
                    continue
                relative = item.get("path")
                if not isinstance(relative, str):
                    errors.append(f"{label}: evidence path must be a string")
                    continue
                if relative in seen_evidence:
                    errors.append(f"{label}: duplicate evidence path {relative}")
                seen_evidence.add(relative)
                try:
                    evidence_path = _repository_path(relative)
                except FixtureError as exc:
                    errors.append(f"{label}: {exc}")
                    continue
                if roots and not _under_any_root(evidence_path, roots):
                    errors.append(f"{label}: evidence path is outside search_roots: {relative}")
                anchors = item.get("anchors")
                if not isinstance(anchors, list) or not anchors or not all(
                    isinstance(anchor, str) and anchor for anchor in anchors
                ):
                    errors.append(f"{label}: evidence anchors for {relative} must be non-empty strings")
                    continue
                text = _text_bytes(evidence_path).decode("utf-8", errors="replace").casefold()
                for anchor in anchors:
                    if anchor.casefold() not in text:
                        errors.append(f"{label}: missing anchor {anchor!r} in {relative}")

        evidence_mode = case.get("evidence_mode", "any")
        if evidence_mode not in {"any", "all"}:
            errors.append(f"{label}: evidence_mode must be 'any' or 'all'")
        if evidence_mode == "all" and isinstance(evidence, list) and len(evidence) < 2:
            errors.append(f"{label}: evidence_mode 'all' requires at least two evidence paths")

        forbidden = case.get("forbidden_paths", [])
        if not isinstance(forbidden, list) or not all(isinstance(path, str) for path in forbidden):
            errors.append(f"{label}: forbidden_paths must be a list of strings")
        else:
            for relative in forbidden:
                try:
                    forbidden_path = _repository_path(relative)
                except FixtureError as exc:
                    errors.append(f"{label}: {exc}")
                    continue
                if roots and not _under_any_root(forbidden_path, roots):
                    errors.append(f"{label}: forbidden path is outside search_roots: {relative}")

        protected = case.get("protected_path_globs", [])
        if not isinstance(protected, list) or not all(isinstance(glob, str) and glob for glob in protected):
            errors.append(f"{label}: protected_path_globs must be a list of non-empty strings")

        if category == "temporal_cutoff":
            cutoff = case.get("cutoff")
            if not isinstance(cutoff, str):
                errors.append(f"{label}: temporal_cutoff cases require an ISO-8601 cutoff")
            else:
                try:
                    datetime.fromisoformat(cutoff.replace("Z", "+00:00"))
                except ValueError:
                    errors.append(f"{label}: invalid cutoff {cutoff!r}")
            if not forbidden:
                errors.append(f"{label}: temporal_cutoff cases require forbidden_paths")

    for category in sorted(REQUIRED_CATEGORIES):
        if category_counts[category] < 5:
            errors.append(f"category {category!r} has only {category_counts[category]} cases; need at least 5")

    if errors:
        preview = "\n".join(f"- {error}" for error in errors)
        raise FixtureError(f"invalid memory benchmark:\n{preview}")


def load_benchmark(path: Path = DEFAULT_BENCHMARK) -> dict[str, Any]:
    benchmark = _load_json(path)
    validate_benchmark(benchmark)
    return benchmark


class Corpus:
    """Read-through cache for a deterministic repository-local corpus."""

    def __init__(self) -> None:
        self._documents: dict[str, Document] = {}

    def _document(self, path: Path) -> Document:
        relative = path.relative_to(REPO_ROOT).as_posix()
        cached = self._documents.get(relative)
        if cached is not None:
            return cached
        raw = path.read_bytes()
        text = raw.decode("utf-8", errors="replace")
        document = Document(path=relative, raw=raw, text=text, lower_text=text.casefold())
        self._documents[relative] = document
        return document

    def documents_for(self, search_roots: Sequence[str]) -> list[Document]:
        paths: dict[str, Path] = {}
        for relative in search_roots:
            root = _repository_path(relative)
            candidates: Iterable[Path]
            if root.is_file():
                candidates = (root,)
            else:
                candidates = root.rglob("*")
            for candidate in candidates:
                if not candidate.is_file() or candidate.is_symlink():
                    continue
                if candidate.suffix.casefold() not in TEXT_SUFFIXES:
                    continue
                rel = candidate.relative_to(REPO_ROOT).as_posix()
                paths[rel] = candidate
        return [self._document(paths[path]) for path in sorted(paths)]

    @property
    def documents(self) -> list[Document]:
        return [self._documents[path] for path in sorted(self._documents)]


def _query_terms(question: str) -> tuple[str, ...]:
    all_terms = TOKEN_RE.findall(question.casefold())
    terms = sorted({term for term in all_terms if len(term) >= 2 and term not in STOP_WORDS})
    if terms:
        return tuple(terms)
    return tuple(sorted(set(all_terms)))


def _query_bigrams(question: str) -> tuple[str, ...]:
    terms = [term for term in TOKEN_RE.findall(question.casefold()) if len(term) >= 2]
    return tuple(dict.fromkeys(f"{left} {right}" for left, right in zip(terms, terms[1:])))


def _rank_document(question: str, document: Document) -> int:
    """Score literal term and adjacent-term matches; no fixture fields are accepted."""

    terms = _query_terms(question)
    if not terms:
        return 0
    normalized_path = " ".join(TOKEN_RE.findall(document.path.casefold()))
    normalized_text = WHITESPACE_RE.sub(" ", document.lower_text)
    score = 0
    for term in terms:
        path_occurrences = normalized_path.count(term)
        text_occurrences = normalized_text.count(term)
        if path_occurrences:
            score += 12 + min(path_occurrences, 3)
        if text_occurrences:
            score += 4 + min(text_occurrences, 3)
    for bigram in _query_bigrams(question):
        if bigram in normalized_path:
            score += 8
        if bigram in normalized_text:
            score += 3
    return score


def rank_case(
    *, question: str, search_roots: Sequence[str], top_k: int, corpus: Corpus
) -> list[RankedDocument]:
    """Rank a case using only held-out-protocol retrieval inputs."""

    ranked = [
        RankedDocument(path=document.path, score=score)
        for document in corpus.documents_for(search_roots)
        if (score := _rank_document(question, document)) > 0
    ]
    ranked.sort(key=lambda item: (-item.score, item.path))
    return ranked[:top_k]


def _rate(numerator: int, denominator: int) -> float:
    return round(numerator / denominator, 6) if denominator else 0.0


def _mean(values: Sequence[float]) -> float:
    return round(sum(values) / len(values), 6) if values else 0.0


def _corpus_digest(documents: Sequence[Document]) -> str:
    digest = hashlib.sha256()
    for document in documents:
        digest.update(document.path.encode("utf-8"))
        digest.update(b"\0")
        digest.update(hashlib.sha256(document.raw).hexdigest().encode("ascii"))
        digest.update(b"\n")
    return digest.hexdigest()


def _evaluate_case(case: Mapping[str, Any], ranked: Sequence[RankedDocument]) -> dict[str, Any]:
    retrieved = [item.path for item in ranked]
    positions = {path: position for position, path in enumerate(retrieved, start=1)}
    evidence_paths = [item["path"] for item in case["evidence"]]
    evidence_hits = [path for path in evidence_paths if path in positions]
    evidence_misses = [path for path in evidence_paths if path not in positions]
    if case.get("evidence_mode", "any") == "all":
        complete = len(evidence_hits) == len(evidence_paths)
    else:
        complete = bool(evidence_hits)
    first_rank = min((positions[path] for path in evidence_hits), default=None)
    forbidden_hits = [path for path in case.get("forbidden_paths", []) if path in positions]
    protected_hits = sorted(
        path
        for path in retrieved
        if any(fnmatch.fnmatchcase(path, pattern) for pattern in case.get("protected_path_globs", []))
    )
    return {
        "category": case["category"],
        "complete_evidence_recall": complete,
        "evidence_hits": evidence_hits,
        "evidence_misses": evidence_misses,
        "expected_outcome": case["expected_outcome"],
        "first_evidence_rank": first_rank,
        "forbidden_hits": forbidden_hits,
        "id": case["id"],
        "protected_hits": protected_hits,
        "reciprocal_rank": round(1 / first_rank, 6) if first_rank else 0.0,
    }


def build_report(
    benchmark: Mapping[str, Any], *, benchmark_path: Path = DEFAULT_BENCHMARK
) -> dict[str, Any]:
    """Run and score the baseline.  Ranking occurs before any scoring fields are read."""

    corpus = Corpus()
    top_k = benchmark["top_k"]
    evaluated: list[dict[str, Any]] = []
    for case in benchmark["cases"]:
        ranked = rank_case(
            question=case["question"],
            search_roots=case["search_roots"],
            top_k=top_k,
            corpus=corpus,
        )
        evaluated.append(_evaluate_case(case, ranked))

    categories: dict[str, dict[str, Any]] = {}
    for category in sorted(REQUIRED_CATEGORIES):
        subset = [result for result in evaluated if result["category"] == category]
        evidence_target_count = sum(
            len(case["evidence"])
            for case in benchmark["cases"]
            if case["category"] == category
        )
        evidence_hit_count = sum(len(result["evidence_hits"]) for result in subset)
        categories[category] = {
            "case_count": len(subset),
            "complete_evidence_recall_at_k": _rate(
                sum(bool(result["complete_evidence_recall"]) for result in subset), len(subset)
            ),
            "evidence_path_recall_at_k": _rate(evidence_hit_count, evidence_target_count),
            "mean_reciprocal_rank": _mean([result["reciprocal_rank"] for result in subset]),
        }

    evidence_target_count = sum(len(case["evidence"]) for case in benchmark["cases"])
    evidence_hit_count = sum(len(result["evidence_hits"]) for result in evaluated)
    temporal = [result for result in evaluated if result["category"] == "temporal_cutoff"]
    protected_intrusions = sum(len(result["protected_hits"]) for result in evaluated)
    documents = corpus.documents
    benchmark_bytes = benchmark_path.read_bytes()
    return {
        "benchmark": {
            "as_of": benchmark["as_of"],
            "case_count": len(benchmark["cases"]),
            "sha256": hashlib.sha256(benchmark_bytes).hexdigest(),
            "top_k": top_k,
            "version": benchmark["benchmark_version"],
        },
        "cases": evaluated,
        "category_metrics": categories,
        "corpus": {
            "sha256": _corpus_digest(documents),
            "total_bytes": sum(len(document.raw) for document in documents),
            "unique_files_considered": len(documents),
        },
        "limitations": list(benchmark["assessment_limits"]),
        "method": {
            "description": "Recursive folder scan followed by deterministic literal token and adjacent-token grep scoring.",
            "ranking_inputs": ["question", "search_roots"],
            "scoring_fields_hidden_until_after_ranking": True,
            "text_suffixes": sorted(TEXT_SUFFIXES),
            "tie_breaker": "repository-relative path ascending",
            "timing_recorded": False,
        },
        "metrics": {
            "complete_evidence_recall_at_k": _rate(
                sum(bool(result["complete_evidence_recall"]) for result in evaluated), len(evaluated)
            ),
            "evidence_path_recall_at_k": _rate(evidence_hit_count, evidence_target_count),
            "mean_reciprocal_rank": _mean([result["reciprocal_rank"] for result in evaluated]),
            "protected_path_intrusions": protected_intrusions,
            "temporal_forbidden_path_hits": sum(len(result["forbidden_hits"]) for result in temporal),
            "temporal_leakage_case_rate": _rate(
                sum(bool(result["forbidden_hits"]) for result in temporal), len(temporal)
            ),
        },
        "report_version": "memory-folder-grep-baseline/v1",
    }


def render_report(report: Mapping[str, Any]) -> str:
    return json.dumps(report, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


def _summary(report: Mapping[str, Any]) -> str:
    metrics = report["metrics"]
    return (
        f"{report['benchmark']['case_count']} cases; "
        f"complete recall@{report['benchmark']['top_k']}="
        f"{metrics['complete_evidence_recall_at_k']:.6f}; "
        f"path recall@{report['benchmark']['top_k']}={metrics['evidence_path_recall_at_k']:.6f}; "
        f"MRR={metrics['mean_reciprocal_rank']:.6f}; "
        f"temporal leakage={metrics['temporal_leakage_case_rate']:.6f}; "
        f"protected intrusions={metrics['protected_path_intrusions']}"
    )


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--benchmark", type=Path, default=DEFAULT_BENCHMARK)
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    parser.add_argument("--check", action="store_true", help="compare output with the committed report")
    parser.add_argument("--validate-only", action="store_true", help="validate fixtures and anchors only")
    args = parser.parse_args(argv)

    try:
        benchmark_path = args.benchmark.resolve()
        benchmark = load_benchmark(benchmark_path)
        if args.validate_only:
            print(f"valid: {len(benchmark['cases'])} benchmark cases")
            return 0
        rendered = render_report(build_report(benchmark, benchmark_path=benchmark_path))
        if args.check:
            try:
                existing = args.report.read_text(encoding="utf-8")
            except OSError as exc:
                print(f"baseline report is missing or unreadable: {exc}", file=sys.stderr)
                return 1
            if existing != rendered:
                print(
                    "baseline report is stale; render scripts/memory_baseline.py and review the result",
                    file=sys.stderr,
                )
                return 1
            print(f"baseline report is current: {_summary(json.loads(rendered))}")
            return 0
        sys.stdout.write(rendered)
        return 0
    except FixtureError as exc:
        print(str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
