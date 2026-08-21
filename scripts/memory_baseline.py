#!/usr/bin/env python3
"""Deterministic Phase 0 folder-and-literal-grep memory baseline.

The ranker deliberately accepts only a question and a list of search roots.  Fixture
answer keys and evidence paths are consumed later, by the evaluator, so they cannot
leak into ranking.  The script has no dependency on a model, an index, or network
access and records neither timings nor generation timestamps.

The corpus itself is frozen.  Every search root named by the benchmark sits inside a
lane the engine publishes to continuously and without CI (CLAUDE.md §25), so a scan of
those folders as they stand today is not a fixture — it is a moving target that turns
`main` red whenever a scheduled review, errata, or rerun lands.  `corpus-manifest.json`
therefore pins the exact file set and the exact bytes (by Git blob id) the baseline
ranks over: worktree bytes are used only while they still hash to the pinned blob, and
the pinned blob is read out of Git otherwise.  Later publishes into the same folders are
simply not part of the corpus, and re-freezing is a deliberate, reviewed act
(`--render-manifest`).
"""

from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import re
import subprocess
import sys
from collections import Counter
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable, Mapping, Sequence


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BENCHMARK = REPO_ROOT / "frameworks/memory/phase0/benchmark.json"
DEFAULT_REPORT = REPO_ROOT / "frameworks/memory/phase0/baseline-report.json"
DEFAULT_CORPUS_MANIFEST = REPO_ROOT / "frameworks/memory/phase0/corpus-manifest.json"
CORPUS_MANIFEST_VERSION = "memory-phase0-corpus-manifest/v1"
BLOB_ID_RE = re.compile(r"[0-9a-f]{40}")

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


def is_nonempty_string_list(value: object) -> bool:
    """Return whether value is a non-empty JSON-style list of non-empty strings."""

    return (
        isinstance(value, list)
        and bool(value)
        and all(isinstance(item, str) and bool(item) for item in value)
    )


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


def _git_blob_id(payload: bytes) -> str:
    """Return the Git object id of payload — the same hash `git hash-object` prints."""

    header = f"blob {len(payload)}\0".encode("ascii")
    return hashlib.sha1(header + payload, usedforsecurity=False).hexdigest()


def _git(*arguments: str, stdin: bytes | None = None) -> bytes:
    try:
        completed = subprocess.run(
            ["git", "-C", str(REPO_ROOT), *arguments],
            input=stdin,
            capture_output=True,
            check=True,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        detail = getattr(exc, "stderr", b"") or b""
        raise FixtureError(
            f"git {' '.join(arguments)} failed: {detail.decode('utf-8', errors='replace').strip() or exc}"
        ) from exc
    return completed.stdout


def _blob_payload(relative: str, blob_id: str) -> tuple[bytes, bool]:
    """Read a pinned corpus file.

    Worktree bytes are used while they still hash to the pinned blob; otherwise the
    pinned blob is read out of Git history.  The flag says which one was used.
    """

    candidate = REPO_ROOT / relative
    if candidate.is_file() and not candidate.is_symlink():
        payload = _text_bytes(candidate)
        if _git_blob_id(payload) == blob_id:
            return payload, False
    try:
        payload = _git("cat-file", "blob", blob_id)
    except FixtureError as exc:
        raise FixtureError(
            f"frozen corpus file {relative} no longer matches pinned blob {blob_id} and the "
            f"blob is not readable from Git history: {exc}"
        ) from exc
    if _git_blob_id(payload) != blob_id:
        raise FixtureError(f"frozen corpus blob {blob_id} does not match its content: {relative}")
    return payload, True


def _fixture_bytes(relative: str, manifest: CorpusManifest | None) -> bytes:
    """Read a scored fixture path — pinned bytes when frozen, worktree bytes otherwise."""

    if manifest is not None and relative in manifest.blobs:
        return _blob_payload(relative, manifest.blobs[relative])[0]
    return _text_bytes(_repository_path(relative))


def _committed_blob_ids(blob_ids: Iterable[str]) -> set[str]:
    """Return which blob ids Git can resolve, in one batch call."""

    wanted = sorted(set(blob_ids))
    if not wanted:
        return set()
    stdin = ("\n".join(wanted) + "\n").encode("ascii")
    output = _git("cat-file", "--batch-check=%(objectname) %(objecttype)", stdin=stdin)
    present: set[str] = set()
    for line in output.decode("utf-8", errors="replace").splitlines():
        name, _, kind = line.partition(" ")
        if kind.strip() == "blob":
            present.add(name)
    return present


@dataclass(frozen=True)
class CorpusManifest:
    """The frozen file set and byte content the baseline ranks over.

    `pinned` is False only for an ad-hoc manifest built from whatever is on disk right
    now (`Corpus.over_paths`).  A baseline report may never be built over one of those —
    that is the whole point of the freeze — so `build_report` refuses it.
    """

    as_of: str
    commit: str
    blobs: Mapping[str, str]
    sha256: str
    pinned: bool = True

    @property
    def paths(self) -> tuple[str, ...]:
        return tuple(sorted(self.blobs))


def _normalized_relative(relative: str) -> str:
    return _repository_path(relative, must_exist=False).relative_to(REPO_ROOT).as_posix()


def load_corpus_manifest(path: Path = DEFAULT_CORPUS_MANIFEST) -> CorpusManifest:
    """Load and validate the frozen corpus manifest."""

    raw = _load_json(path)
    errors: list[str] = []
    if raw.get("manifest_version") != CORPUS_MANIFEST_VERSION:
        errors.append(f"manifest_version must be {CORPUS_MANIFEST_VERSION!r}")
    as_of = raw.get("as_of")
    if not isinstance(as_of, str) or not as_of.strip():
        errors.append("as_of must be a non-empty string")
        as_of = ""
    commit = raw.get("commit")
    if not isinstance(commit, str) or BLOB_ID_RE.fullmatch(commit) is None:
        errors.append("commit must be a 40-character Git commit id")
        commit = ""
    files = raw.get("files")
    blobs: dict[str, str] = {}
    if not isinstance(files, dict) or not files:
        errors.append("files must be a non-empty object of repository-relative path to blob id")
    else:
        for relative, blob_id in sorted(files.items()):
            if not isinstance(blob_id, str) or BLOB_ID_RE.fullmatch(blob_id) is None:
                errors.append(f"{relative}: blob id must be 40 hexadecimal characters")
                continue
            try:
                normalized = _normalized_relative(relative)
            except FixtureError as exc:
                errors.append(str(exc))
                continue
            if normalized != relative:
                errors.append(f"{relative}: manifest paths must be normalized ({normalized})")
                continue
            if Path(relative).suffix.casefold() not in TEXT_SUFFIXES:
                errors.append(f"{relative}: manifest carries only text suffixes")
                continue
            blobs[normalized] = blob_id
    if errors:
        preview = "\n".join(f"- {error}" for error in errors)
        raise FixtureError(f"invalid frozen corpus manifest {path}:\n{preview}")
    return CorpusManifest(
        as_of=as_of,
        commit=commit,
        blobs=blobs,
        sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
    )


def validate_corpus_manifest(benchmark: Mapping[str, Any], manifest: CorpusManifest) -> None:
    """Prove the frozen corpus can still carry every scoring anchor the benchmark names."""

    errors: list[str] = []
    for case in benchmark.get("cases", []):
        label = case.get("id", "case")
        for relative in case.get("search_roots", []):
            try:
                covered = _manifest_paths_under(manifest, relative)
            except FixtureError as exc:
                errors.append(f"{label}: {exc}")
                continue
            if not covered:
                errors.append(f"{label}: search root holds no frozen corpus files: {relative}")
        scored_paths = [item["path"] for item in case.get("evidence", []) if "path" in item]
        scored_paths.extend(case.get("forbidden_paths", []))
        for relative in scored_paths:
            if relative not in manifest.blobs:
                errors.append(f"{label}: scored path is outside the frozen corpus: {relative}")
    if errors:
        preview = "\n".join(f"- {error}" for error in sorted(set(errors)))
        raise FixtureError(f"frozen corpus manifest does not cover the benchmark:\n{preview}")


def _manifest_paths_under(manifest: CorpusManifest, relative_root: str) -> list[str]:
    """Select the frozen corpus files under one search root.

    Selection is by the frozen path list, never by scanning the folder, so a later
    publish into the same run folder cannot enter the corpus and move a score.
    """

    root = _normalized_relative(relative_root)
    prefix = f"{root}/"
    return [path for path in manifest.paths if path == root or path.startswith(prefix)]


def live_corpus_paths(search_roots: Iterable[str]) -> dict[str, Path]:
    """Scan the search roots as they stand right now — used to freeze or to report drift."""

    paths: dict[str, Path] = {}
    for relative in search_roots:
        root = _repository_path(relative)
        candidates: Iterable[Path] = (root,) if root.is_file() else root.rglob("*")
        for candidate in candidates:
            if not candidate.is_file() or candidate.is_symlink():
                continue
            if candidate.suffix.casefold() not in TEXT_SUFFIXES:
                continue
            paths[candidate.relative_to(REPO_ROOT).as_posix()] = candidate
    return paths


def benchmark_search_roots(benchmark: Mapping[str, Any]) -> list[str]:
    roots: set[str] = set()
    for case in benchmark["cases"]:
        roots.update(case["search_roots"])
    return sorted(roots)


def render_corpus_manifest(benchmark: Mapping[str, Any]) -> str:
    """Freeze today's corpus: every file under every search root, answers and distractors alike."""

    live = live_corpus_paths(benchmark_search_roots(benchmark))
    files = {relative: _git_blob_id(_text_bytes(path)) for relative, path in sorted(live.items())}
    committed = _committed_blob_ids(files.values())
    uncommitted = sorted(
        relative for relative, blob_id in files.items() if blob_id not in committed
    )
    if uncommitted:
        preview = "\n".join(f"- {relative}" for relative in uncommitted)
        raise FixtureError(
            "cannot freeze a corpus whose bytes are not committed; commit or restore these first:\n"
            + preview
        )
    manifest = {
        "as_of": _git("show", "-s", "--format=%cs", "HEAD").decode("utf-8").strip(),
        "commit": _git("rev-parse", "HEAD").decode("ascii").strip(),
        "files": files,
        "manifest_version": CORPUS_MANIFEST_VERSION,
    }
    return json.dumps(manifest, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


def validate_benchmark(
    benchmark: Mapping[str, Any], *, manifest: CorpusManifest | None = None
) -> None:
    """Validate the corpus and every scoring anchor without running retrieval.

    Anchors are checked against the pinned bytes whenever a manifest is supplied, so a
    later publish that rewrites a live file cannot fail a frozen fixture.
    """

    pinned = frozenset(manifest.blobs) if manifest is not None else frozenset()
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
                    evidence_path = _repository_path(relative, must_exist=relative not in pinned)
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
                text = _fixture_bytes(relative, manifest).decode("utf-8", errors="replace").casefold()
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
                    forbidden_path = _repository_path(relative, must_exist=relative not in pinned)
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


def load_benchmark(
    path: Path = DEFAULT_BENCHMARK, *, manifest: CorpusManifest | None = None
) -> dict[str, Any]:
    benchmark = _load_json(path)
    validate_benchmark(benchmark, manifest=manifest)
    return benchmark


class Corpus:
    """Read-through cache over the frozen corpus manifest."""

    def __init__(self, manifest: CorpusManifest) -> None:
        self.manifest = manifest
        self._documents: dict[str, Document] = {}
        self._restored_from_git: set[str] = set()

    @classmethod
    def over_paths(cls, roots: Sequence[str]) -> "Corpus":
        """An ad-hoc corpus over whatever is under `roots` right now.

        NOT the benchmark corpus — the baseline always ranks the frozen manifest, because
        its search roots are lanes the engine publishes to (CLAUDE.md §25).  This exists
        for tools and tests that need to read arbitrary repository paths through the same
        Document pipeline, and `build_report` refuses a corpus built this way.
        """

        live = live_corpus_paths(roots)
        manifest = CorpusManifest(
            as_of="(ad-hoc)",
            commit="0" * 40,
            blobs={
                relative: _git_blob_id(_text_bytes(path)) for relative, path in sorted(live.items())
            },
            sha256="",
            pinned=False,
        )
        return cls(manifest)

    def _document(self, relative: str) -> Document:
        cached = self._documents.get(relative)
        if cached is not None:
            return cached
        raw, from_git = _blob_payload(relative, self.manifest.blobs[relative])
        if from_git:
            self._restored_from_git.add(relative)
        text = raw.decode("utf-8", errors="replace")
        document = Document(path=relative, raw=raw, text=text, lower_text=text.casefold())
        self._documents[relative] = document
        return document

    def documents_for(self, search_roots: Sequence[str]) -> list[Document]:
        paths: set[str] = set()
        for relative in search_roots:
            _repository_path(relative)  # the root must still exist and stay inside the repo
            paths.update(_manifest_paths_under(self.manifest, relative))
        return [self._document(path) for path in sorted(paths)]

    @property
    def restored_from_git(self) -> tuple[str, ...]:
        """Frozen files whose worktree bytes have since changed (or gone)."""

        return tuple(sorted(self._restored_from_git))

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
    benchmark: Mapping[str, Any],
    *,
    benchmark_path: Path = DEFAULT_BENCHMARK,
    corpus: Corpus | None = None,
) -> dict[str, Any]:
    """Run and score the baseline.  Ranking occurs before any scoring fields are read."""

    if corpus is None:
        corpus = Corpus(load_corpus_manifest())
    if not corpus.manifest.pinned:
        raise FixtureError("the baseline report must be built over the frozen corpus manifest")
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
            "corpus_manifest_sha256": corpus.manifest.sha256,
            "corpus_pinning": "frozen manifest of repository-relative paths to Git blob ids",
            "description": "Frozen-manifest file selection followed by deterministic literal token and adjacent-token grep scoring.",
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


def _valid_corpus_snapshot(value: object) -> bool:
    if not isinstance(value, Mapping) or set(value) != {
        "sha256", "total_bytes", "unique_files_considered"
    }:
        return False
    return (
        isinstance(value.get("sha256"), str)
        and re.fullmatch(r"[0-9a-f]{64}", value["sha256"]) is not None
        and type(value.get("total_bytes")) is int
        and value["total_bytes"] >= 0
        and type(value.get("unique_files_considered")) is int
        and value["unique_files_considered"] > 0
    )


def baseline_results_match(snapshot: Mapping[str, Any], current: Mapping[str, Any]) -> bool:
    """Compare scored results while retaining corpus metadata as a frozen observation.

    The corpus manifest pins the ranked bytes, so this tolerance now covers only a
    deliberate re-freeze: a refreshed manifest that leaves every benchmark row, metric,
    method, and policy result byte-for-byte equivalent needs no scored refresh.  Any scored
    drift still invalidates the snapshot.
    """

    if not _valid_corpus_snapshot(snapshot.get("corpus")):
        return False
    if not _valid_corpus_snapshot(current.get("corpus")):
        return False
    snapshot_results = {key: value for key, value in snapshot.items() if key != "corpus"}
    current_results = {key: value for key, value in current.items() if key != "corpus"}
    return snapshot_results == current_results


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


def _drift_note(benchmark: Mapping[str, Any], corpus: Corpus) -> str:
    """Say how far the live search roots have moved from the frozen corpus.

    Reported, never failed.  Publishing into these folders is exactly what the engine is
    supposed to do (§25); the number is here so a corpus that has aged out of usefulness is
    visible and can be re-frozen on purpose, rather than silently forgotten.
    """

    frozen = set(corpus.manifest.blobs)
    live = set(live_corpus_paths(benchmark_search_roots(benchmark)))
    return (
        f"frozen corpus: {len(frozen)} files pinned at {corpus.manifest.as_of} "
        f"(commit {corpus.manifest.commit[:12]}); live roots now hold {len(live)} files "
        f"({len(live - frozen)} added since the freeze, {len(frozen - live)} gone, "
        f"{len(corpus.restored_from_git)} rewritten and read back from Git)"
    )


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--benchmark", type=Path, default=DEFAULT_BENCHMARK)
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_CORPUS_MANIFEST)
    parser.add_argument(
        "--check",
        action="store_true",
        help="compare scored output with the committed Phase 0 snapshot",
    )
    parser.add_argument("--validate-only", action="store_true", help="validate fixtures and anchors only")
    parser.add_argument(
        "--render-manifest",
        action="store_true",
        help="re-freeze the corpus from the current search roots (deliberate, reviewed refresh)",
    )
    args = parser.parse_args(argv)

    try:
        benchmark_path = args.benchmark.resolve()
        if args.render_manifest:
            # Bootstrap: the corpus being frozen is the one on disk right now, so anchors
            # are checked against the worktree rather than against a manifest.
            sys.stdout.write(render_corpus_manifest(load_benchmark(benchmark_path)))
            return 0
        manifest = load_corpus_manifest(args.manifest.resolve())
        benchmark = load_benchmark(benchmark_path, manifest=manifest)
        validate_corpus_manifest(benchmark, manifest)
        if args.validate_only:
            print(
                f"valid: {len(benchmark['cases'])} benchmark cases; "
                f"{len(manifest.blobs)} frozen corpus files"
            )
            return 0
        corpus = Corpus(manifest)
        current_report = build_report(benchmark, benchmark_path=benchmark_path, corpus=corpus)
        rendered = render_report(current_report)
        if args.check:
            try:
                existing = args.report.read_text(encoding="utf-8")
            except OSError as exc:
                print(f"baseline report is missing or unreadable: {exc}", file=sys.stderr)
                return 1
            try:
                snapshot = json.loads(existing)
            except json.JSONDecodeError as exc:
                print(f"baseline report is invalid JSON: {exc}", file=sys.stderr)
                return 1
            if (
                not isinstance(snapshot, dict)
                or existing != render_report(snapshot)
                or not baseline_results_match(snapshot, current_report)
            ):
                print(
                    "baseline scoring is stale; render scripts/memory_baseline.py and review the result",
                    file=sys.stderr,
                )
                return 1
            if snapshot["corpus"] == current_report["corpus"]:
                prefix = "baseline report is current"
            else:
                prefix = "baseline scoring is current; corpus differs from the frozen snapshot"
            print(f"{prefix}: {_summary(current_report)}")
            print(_drift_note(benchmark, corpus))
            return 0
        sys.stdout.write(rendered)
        return 0
    except FixtureError as exc:
        print(str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
