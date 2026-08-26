#!/usr/bin/env python3
"""Discover, stamp, and validate self-describing research memory profiles.

The research roster is the source of membership: immediate agent directories that own a
``MODULE_RULES.md`` and are not a standalone ``SWARM.md`` contribute every ``NN_*.md``
orb.  This keeps the memory runtime zero-touch when a module or specialist is added.
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path


PROFILE_KEYS = (
    "version",
    "task",
    "episodic_scope",
    "semantic_topics",
    "procedure_tags",
    "cross_company",
    "permitted_source_tiers",
    "permitted_classifications",
    "max_context_tokens",
)
PROFILE_START = "memory_profile:"
PROFILE_LINE = re.compile(r"^  ([a-z_]+):(?:\s*(.*))?$")
SAFE_TASK = re.compile(r"^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$")
SAFE_TAG = re.compile(r"^[a-z][a-z0-9-]*$")


class ProfileError(ValueError):
    pass


def research_agent_files(root: Path) -> list[Path]:
    agents = root / ".claude" / "agents"
    if not agents.is_dir():
        return []
    files: list[Path] = []
    for module in sorted(path for path in agents.iterdir() if path.is_dir()):
        if not (module / "MODULE_RULES.md").is_file() or (module / "SWARM.md").exists():
            continue
        files.extend(sorted(module.glob("[0-9][0-9]_*.md")))
    master = agents / "synthesizer.md"
    if master.is_file():
        files.append(master)
    return files


def isolated_agent_files(root: Path) -> list[Path]:
    agents = root / ".claude" / "agents"
    return sorted(path for path in agents.glob("*.md") if path.name != "synthesizer.md")


def _frontmatter(text: str, path: Path) -> tuple[list[str], list[str]]:
    lines = text.splitlines()
    if not lines or lines[0] != "---":
        raise ProfileError(f"{path}: missing YAML frontmatter")
    try:
        end = lines.index("---", 1)
    except ValueError as error:
        raise ProfileError(f"{path}: unterminated YAML frontmatter") from error
    return lines[1:end], lines[end + 1 :]


def _inline_list(
    value: str, path: Path, field: str, pattern: re.Pattern[str] = SAFE_TAG,
) -> list[str]:
    if not value.startswith("[") or not value.endswith("]"):
        raise ProfileError(f"{path}: {field} must be a closed inline list")
    values = [item.strip() for item in value[1:-1].split(",") if item.strip()]
    if not values or any(not pattern.fullmatch(item) for item in values):
        raise ProfileError(f"{path}: {field} has an invalid tag")
    return values


def parse_profile(text: str, path: Path) -> dict[str, object]:
    frontmatter, _ = _frontmatter(text, path)
    starts = [index for index, line in enumerate(frontmatter) if line == PROFILE_START]
    if len(starts) != 1:
        raise ProfileError(f"{path}: requires exactly one memory_profile")
    start = starts[0]
    raw: dict[str, str] = {}
    for line in frontmatter[start + 1 :]:
        if line and not line.startswith(" "):
            break
        match = PROFILE_LINE.fullmatch(line)
        if not match:
            raise ProfileError(f"{path}: memory_profile must use closed scalar/inline-list fields")
        key, value = match.groups()
        if key in raw:
            raise ProfileError(f"{path}: duplicate memory_profile field {key}")
        raw[key] = value
    if set(raw) != set(PROFILE_KEYS):
        missing = sorted(set(PROFILE_KEYS) - set(raw))
        extra = sorted(set(raw) - set(PROFILE_KEYS))
        raise ProfileError(f"{path}: memory_profile fields missing={missing} extra={extra}")
    try:
        version = int(raw["version"])
        budget = int(raw["max_context_tokens"])
    except ValueError as error:
        raise ProfileError(f"{path}: version and max_context_tokens must be integers") from error
    task = raw["task"]
    if version != 1 or not SAFE_TASK.fullmatch(task):
        raise ProfileError(f"{path}: unsupported version or unsafe task")
    if raw["episodic_scope"] != "exact-listing" or raw["cross_company"] != "true":
        raise ProfileError(f"{path}: unsupported episodic scope or cross_company value")
    topics = _inline_list(raw["semantic_topics"], path, "semantic_topics")
    tags = _inline_list(raw["procedure_tags"], path, "procedure_tags")
    tiers = [int(value) for value in _inline_list(
        raw["permitted_source_tiers"], path, "permitted_source_tiers", re.compile(r"^[1-5]$"),
    )]
    classifications = _inline_list(raw["permitted_classifications"], path, "permitted_classifications")
    if tiers != [1, 2, 3, 4, 5] or classifications != ["public", "internal"]:
        raise ProfileError(f"{path}: profile authority must be the reviewed public/internal tier 1-5 scope")
    return {
        "version": version,
        "task": task,
        "episodic_scope": raw["episodic_scope"],
        "semantic_topics": topics,
        "procedure_tags": tags,
        "cross_company": True,
        "permitted_source_tiers": tiers,
        "permitted_classifications": classifications,
        "max_context_tokens": budget,
    }


def expected_profile(path: Path) -> dict[str, object]:
    if path.name == "synthesizer.md":
        return {
            "task": "research.master-synthesis",
            "topics": ["research-synthesis", "calibration"],
            "tags": ["master-synthesis", "adjudication"],
            "budget": 6000,
        }
    module = path.parent.name
    stem = path.stem
    slug = stem[3:]
    return {
        "task": f"{module}.{slug}",
        "topics": [module, slug],
        "tags": [module, slug],
        "budget": 4000 if stem.startswith("99_") else 3000,
    }


def profile_block(path: Path) -> list[str]:
    expected = expected_profile(path)
    return [
        PROFILE_START,
        "  version: 1",
        f"  task: {expected['task']}",
        "  episodic_scope: exact-listing",
        f"  semantic_topics: [{', '.join(expected['topics'])}]",
        f"  procedure_tags: [{', '.join(expected['tags'])}]",
        "  cross_company: true",
        "  permitted_source_tiers: [1, 2, 3, 4, 5]",
        "  permitted_classifications: [public, internal]",
        f"  max_context_tokens: {expected['budget']}",
    ]


def stamp_profile(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    frontmatter, body = _frontmatter(text, path)
    if PROFILE_START in frontmatter:
        return False
    updated = ["---", *frontmatter, *profile_block(path), "---", *body]
    path.write_text("\n".join(updated) + ("\n" if text.endswith("\n") else ""), encoding="utf-8")
    return True


def validate_repository(root: Path) -> list[str]:
    if not (root / ".claude" / "agents").is_dir():
        return [f"{root / '.claude' / 'agents'}: analytical agent directory is missing"]
    errors: list[str] = []
    for path in research_agent_files(root):
        try:
            profile = parse_profile(path.read_text(encoding="utf-8"), path)
            expected = expected_profile(path)
            if profile["task"] != expected["task"]:
                errors.append(f"{path}: task must be {expected['task']}")
            if profile["max_context_tokens"] != expected["budget"]:
                errors.append(f"{path}: max_context_tokens must be {expected['budget']}")
        except (OSError, ProfileError, ValueError) as error:
            errors.append(str(error))
    for path in isolated_agent_files(root):
        try:
            frontmatter, _ = _frontmatter(path.read_text(encoding="utf-8"), path)
            if PROFILE_START in frontmatter:
                errors.append(f"{path}: isolated agent must not declare memory_profile")
            if "memory_isolation: true" not in frontmatter:
                errors.append(f"{path}: isolated agent must declare memory_isolation: true")
        except (OSError, ProfileError) as error:
            errors.append(str(error))
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve()
    if args.apply:
        changed = sum(1 for path in research_agent_files(root) if stamp_profile(path))
        print(f"stamped {changed} analytical memory profiles")
    errors = validate_repository(root)
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    print(f"validated {len(research_agent_files(root))} analytical profiles and "
          f"{len(isolated_agent_files(root))} isolated agents")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
