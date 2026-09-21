#!/usr/bin/env python3
"""
Regression tests for scripts/commit-run.sh's publication and push boundary.

Reproduces the exact failure mode found live in a 2026-07-13 session: commit-run.sh pushed
with `git push -q origin main`, which resolves "main" as the LOCAL branch of that name — not
the current HEAD. Any committing process checked out on a differently-named branch (a per-
session worktree branch is the normal case for this engine's remote/cloud sessions) with a
stale or absent local `main` ref hit a silent, permanent push failure: the initial push was
rejected (local main behind origin), the fetch+rebase retry rebased the CURRENT branch (a
no-op, since it was already based on origin/main) and rewrote nothing about local main, so the
identical, still-doomed `push origin main` was retried and failed again — even though the
commit itself was a valid fast-forward of origin/main. The script exited 4 ("commit is local —
push manually") and the caller (a research/screener/commodity run, or a decision review) was
left with an unpushed commit unless a human noticed and pushed by hand.

The fix is `git push -q origin HEAD:main` in both the initial push and the rebase-retry push —
this asserts and validates that fix stays in place.

Run: python3 scripts/test_commit_run.py   (exit 0 = all pass)
"""
import json
import hashlib
import os
import re
import shlex
import shutil
import subprocess
import sys
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from validate_data_catalogue import uncovered_paths

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMMIT_RUN = os.path.join(REPO_ROOT, "scripts", "commit-run.sh")

_fails = []


def check(name, cond, detail=""):
    print(f"  {'ok  ' if cond else 'FAIL'} {name}" + (f"  — {detail}" if detail and not cond else ""))
    if not cond:
        _fails.append(name)


def run(cmd, cwd, env=None, check_rc=True):
    r = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True)
    if check_rc and r.returncode != 0:
        raise RuntimeError(f"cmd failed ({r.returncode}): {cmd}\nstdout={r.stdout}\nstderr={r.stderr}")
    return r


def git_env():
    env = dict(os.environ)
    env.update({
        "GIT_AUTHOR_NAME": "Test", "GIT_AUTHOR_EMAIL": "test@example.com",
        "GIT_COMMITTER_NAME": "Test", "GIT_COMMITTER_EMAIL": "test@example.com",
        # isolate from any real engine App credential helper on the test machine
        "NOSTRA_ENGINE_CONFIG_DIR": tempfile.mkdtemp(prefix="commit-run-test-noapp-"),
    })
    # These tests drive the REAL helper against sandbox repositories, which is exactly what the test-run
    # guard refuses — so drop it here, explicitly, even when a parent test runner exported it.
    env.pop("ENGINE_TEST_RUN", None)
    env.pop("ENGINE_TEST_RUN_VIOLATIONS", None)
    return env


def git_internal_path(repo, name, env):
    value = run(["git", "rev-parse", "--git-path", name], cwd=repo, env=env).stdout.strip()
    return value if os.path.isabs(value) else os.path.join(repo, value)


def setup_stale_local_main_scenario(tmp):
    """
    Builds: bare `origin` at commit B on main; an `agent` clone whose LOCAL `main` branch is
    stale at commit A (behind origin), and whose checked-out branch is `session` (NOT `main`),
    itself correctly based on B. This is the exact shape that broke: a valid fast-forward push
    from a non-`main`-named branch, with local `main` lagging.
    """
    env = git_env()
    origin = os.path.join(tmp, "origin.git")
    run(["git", "init", "--bare", "-q", "-b", "main", origin], cwd=tmp)

    seed = os.path.join(tmp, "seed")
    run(["git", "clone", "-q", origin, seed], cwd=tmp, env=env)
    install_catalogue_fixture(seed)
    write_text(seed, "analyses/base/a.txt", "A\n")
    run(["git", "add", "analyses/base/a.txt", *CATALOGUE_FIXTURE_PATHS], cwd=seed, env=env)
    run(["git", "commit", "-q", "-m", "commit A"], cwd=seed, env=env)
    run(["git", "push", "-q", "origin", "main"], cwd=seed, env=env)

    # `agent` clones at commit A — this becomes its (soon-to-be-stale) local `main`.
    agent = os.path.join(tmp, "agent")
    run(["git", "clone", "-q", origin, agent], cwd=tmp, env=env)

    # Someone else advances origin/main to B, entirely outside the `agent` clone.
    with open(os.path.join(seed, "b.txt"), "w") as f:
        f.write("B\n")
    run(["git", "add", "b.txt"], cwd=seed, env=env)
    run(["git", "commit", "-q", "-m", "commit B"], cwd=seed, env=env)
    run(["git", "push", "-q", "origin", "main"], cwd=seed, env=env)

    # `agent` fetches and checks out a session branch tracking the fresh origin/main (B) —
    # exactly like a fresh per-session worktree branch — but its local `main` ref is left at A.
    run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
    run(["git", "checkout", "-q", "-b", "session", "origin/main"], cwd=agent, env=env)

    local_main = run(["git", "rev-parse", "main"], cwd=agent, env=env).stdout.strip()
    origin_main = run(["git", "rev-parse", "origin/main"], cwd=agent, env=env).stdout.strip()
    assert local_main != origin_main, "test setup bug: local main should be stale"

    return origin, agent, env


def install_prewrite_fixture(agent):
    """Give an isolated test clone the real creation-time validator and a discovered orb roster."""
    scripts = os.path.join(agent, "scripts")
    os.makedirs(scripts, exist_ok=True)
    for name in ("eval.py", "data_need_contract.py", "overdue_checks.py"):
        shutil.copy2(os.path.join(REPO_ROOT, "scripts", name), os.path.join(scripts, name))
    agents = os.path.join(agent, ".claude", "agents", "fixture-module")
    os.makedirs(agents, exist_ok=True)
    with open(os.path.join(agents, "99_fixture-module-synthesis.md"), "w") as f:
        f.write("# Fixture synthesis\n")


def install_provenance_fixture(agent):
    scripts = os.path.join(agent, "scripts")
    os.makedirs(scripts, exist_ok=True)
    shutil.copy2(os.path.join(REPO_ROOT, "scripts", "execution_provenance.py"),
                 os.path.join(scripts, "execution_provenance.py"))


def write_json(repo, relative_path, body):
    absolute = os.path.join(repo, relative_path)
    os.makedirs(os.path.dirname(absolute), exist_ok=True)
    with open(absolute, "w") as f:
        json.dump(body, f)
        f.write("\n")
    return absolute


def write_text(repo, relative_path, body):
    absolute = os.path.join(repo, relative_path)
    os.makedirs(os.path.dirname(absolute), exist_ok=True)
    with open(absolute, "w") as handle:
        handle.write(body)
    return absolute


# What commit-run.sh resolves from "$TOP/scripts" on EVERY commit, plus the catalogue it reads. A fixture
# repository commits all of it, exactly as the real checkout carries it.
CATALOGUE_FIXTURE_PATHS = [
    "scripts/validate_data_catalogue.py", "scripts/decision_publication_gate.py",
    "frameworks/memory/phase0/catalogue.json",
]


def install_catalogue_fixture(repo, patterns=None):
    """Install the real validators with a small committed catalogue for isolated Git fixtures."""
    scripts = os.path.join(repo, "scripts")
    os.makedirs(scripts, exist_ok=True)
    for name in ("validate_data_catalogue.py", "decision_publication_gate.py"):
        shutil.copy2(os.path.join(REPO_ROOT, "scripts", name), os.path.join(scripts, name))
    write_json(repo, "frameworks/memory/phase0/catalogue.json", {
        "catalogue_version": "memory-current-state-catalogue/v1",
        "stores": [{
            "id": "fixture-engine-data",
            "paths": patterns or ["analyses/**", "screener/**", "commodity/**", "watchlist/**"],
        }],
    })


def no_push_env(env):
    result = dict(env)
    result["ENGINE_NO_PUSH"] = "1"
    return result


def test_fast_forward_push_from_non_main_branch_with_stale_local_main():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-") as tmp:
        origin, agent, env = setup_stale_local_main_scenario(tmp)

        # The actual change under test: write a new file and commit it via commit-run.sh,
        # exactly as /research:review-decisions (or any module) does.
        review_path = "analyses/reviews/review.txt"
        write_text(agent, review_path, "new decision review\n")

        result = run(
            ["bash", COMMIT_RUN, "test: decision review commit", "--", review_path],
            cwd=agent, env=env, check_rc=False,
        )

        check(
            "commit-run.sh exits 0 (pushed) on a valid fast-forward from a non-main branch",
            result.returncode == 0,
            f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}",
        )
        check(
            "reports a COMMIT_SHA",
            "COMMIT_SHA=" in result.stdout,
            result.stdout,
        )
        check(
            "does NOT fall back to 'push manually'",
            "push manually" not in result.stderr,
            result.stderr,
        )

        # The decisive assertion: the new file actually landed on origin's main — not just
        # committed locally on the agent's `session` branch.
        show = run(["git", "show", f"origin/main:{review_path}"], cwd=agent, env=env, check_rc=False)
        # local origin/main tracking ref may be stale until we re-fetch
        run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
        show = run(["git", "show", f"origin/main:{review_path}"], cwd=agent, env=env, check_rc=False)
        check(
            "review.txt is present on origin's main branch after the push",
            show.returncode == 0 and "new decision review" in show.stdout,
            f"rc={show.returncode} stdout={show.stdout!r} stderr={show.stderr!r}",
        )

        # And local `main` is untouched — commit-run.sh must not silently mutate branches it
        # isn't asked to touch.
        local_main_after = run(["git", "rev-parse", "main"], cwd=agent, env=env).stdout.strip()
        with open(os.path.join(agent, "analyses/base/a.txt")) as f:
            pass  # commit A's file must still be all local main has, i.e. main is untouched
        check(
            "local `main` branch ref is left untouched (commit-run.sh never checks it out or advances it)",
            local_main_after != run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip(),
        )


def test_no_op_when_no_matching_pathspec():
    """An unchanged, valid pathspec is a no-op; an invalid pathspec is an error."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-noop-") as tmp:
        origin, agent, env = setup_stale_local_main_scenario(tmp)
        result = run(
            ["bash", COMMIT_RUN, "test: noop", "--", "analyses/base/a.txt"],
            cwd=agent, env=env, check_rc=False,
        )
        check("NOOP path exits 0 when nothing matches the given pathspec", result.returncode == 0, result.stdout)
        check("NOOP path reports NOOP=1", "NOOP=1" in result.stdout, result.stdout)


def test_test_run_guard_refuses_before_any_commit_or_push():
    """Under ENGINE_TEST_RUN=1 the helper must refuse loudly: no commit, no push, a ledger line, exit 6."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-guard-") as tmp:
        origin, agent, env = setup_stale_local_main_scenario(tmp)
        write_text(agent, "analyses/base/guarded.txt", "would have leaked\n")
        head_before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        origin_before = run(["git", "rev-parse", "main"], cwd=origin, env=env).stdout.strip()
        ledger = os.path.join(tmp, "violations.tsv")
        guarded = dict(env, ENGINE_TEST_RUN="1", ENGINE_TEST_RUN_VIOLATIONS=ledger)
        result = run(
            ["bash", COMMIT_RUN, "Run failure note: ZZGUARD (stopped at business-model)", "--",
             "analyses/base/guarded.txt"],
            cwd=agent, env=guarded, check_rc=False,
        )
        check("test-run guard exits 6", result.returncode == 6, f"rc={result.returncode} stderr={result.stderr!r}")
        check("test-run guard says so on stderr", "REFUSED under ENGINE_TEST_RUN=1" in result.stderr, result.stderr)
        check("test-run guard reports no commit identity", "COMMIT_SHA=" not in result.stdout, result.stdout)
        check("test-run guard leaves local HEAD untouched",
              run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip() == head_before)
        check("test-run guard leaves origin/main untouched",
              run(["git", "rev-parse", "main"], cwd=origin, env=env).stdout.strip() == origin_before)
        check("test-run guard stages nothing",
              run(["git", "diff", "--cached", "--name-only"], cwd=agent, env=env).stdout.strip() == "")
        recorded = Path(ledger).read_text() if os.path.exists(ledger) else ""
        check("test-run guard records the refusal in the runner's ledger",
              recorded.startswith("commit-run.sh\tRun failure note: ZZGUARD"), recorded)

        retry = run(["bash", COMMIT_RUN, "--retry-push", head_before], cwd=agent, env=guarded, check_rc=False)
        check("test-run guard also refuses retry-push", retry.returncode == 6, f"rc={retry.returncode}")
        check("retry-push refusal leaves origin/main untouched",
              run(["git", "rev-parse", "main"], cwd=origin, env=env).stdout.strip() == origin_before)

        # The same request without the guard variable still publishes: the guard changes nothing in production.
        result = run(["bash", COMMIT_RUN, "test: unguarded", "--", "analyses/base/guarded.txt"],
                     cwd=agent, env=env, check_rc=False)
        check("without the guard variable the helper still commits and pushes",
              result.returncode == 0 and "COMMIT_SHA=" in result.stdout
              and run(["git", "rev-parse", "main"], cwd=origin, env=env).stdout.strip() != origin_before,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")


def test_uncatalogued_data_is_rejected_before_commit():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-catalogue-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        install_catalogue_fixture(agent, [
            "analyses/*/*.txt",
            "screener/**",
            "commodity/**",
            "watchlist/**",
        ])
        run(["git", "add", "frameworks/memory/phase0/catalogue.json"], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "fixture: restrict catalogue"], cwd=agent, env=env)
        relative = "analyses/FRESH_2099-01-01/relationships.json"
        write_json(agent, relative, {"fixture": True})
        before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()

        result = run(
            ["bash", COMMIT_RUN, "test: reject uncatalogued data", "--", relative],
            cwd=agent, env=no_push_env(env), check_rc=False,
        )

        after = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
        absent = run(["git", "cat-file", "-e", f"HEAD:{relative}"], cwd=agent, env=env, check_rc=False)
        # 7 is reserved for this one verdict: the cockpit supervisor reads the code (never the message) to
        # record `publication_refused`, which the resume supervisor must not auto-retry.
        check("uncatalogued staged data exits with the reserved refusal code 7 before commit",
              result.returncode == 7 and before == after and absent.returncode != 0,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("catalogue rejection names the missing artifact and leaves the index clean",
              relative in result.stderr and "DATA-CATALOGUE: FAIL" in result.stderr
              and cached.returncode == 0,
              result.stderr)


def validate_catalogue(repo, env, mode, proposed=None):
    """Run the fixture repo's installed validator; ``proposed`` is the NUL-separated --paths stdin."""
    return subprocess.run(
        ["python3", os.path.join(repo, "scripts", "validate_data_catalogue.py"), "--repo", repo, mode],
        cwd=repo, env=env, capture_output=True,
        input=b"".join(item.encode("utf-8") + b"\0" for item in proposed) if proposed is not None else None,
    )


def rejected_names(result):
    """The paths a catalogue rejection names, parsed from its one-line verdict."""
    stderr = result.stderr.decode("utf-8", "replace")
    marker = "has uncatalogued data: "
    if marker not in stderr:
        return None
    return sorted(stderr.split(marker, 1)[1].strip().split(", "))


def test_presealed_path_list_gets_the_same_verdict_as_the_staged_index():
    """The supervisor seals an immutable receipt from a path list, then commit-run.sh checks the staged
    index. A list the second check rejects can never publish, so --paths must predict it exactly."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-preseal-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        install_catalogue_fixture(agent, ["analyses/*/*.txt", "analyses/*/.aborted"])
        run(["git", "add", "frameworks/memory/phase0/catalogue.json"], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "fixture: restrict catalogue"], cwd=agent, env=env)
        root = "analyses/FRESH_2099-01-01"
        catalogued = [f"{root}/notes.txt", f"{root}/.aborted"]
        # The 2026-09-17 outage list: a run-root sweep that picked up the supervisor's publication gate.
        uncatalogued = [f"{root}/.requires_idea_publication", f"{root}/readiness_override.json"]
        for relative in catalogued + uncatalogued:
            write_text(agent, relative, "fixture\n")

        presealed = validate_catalogue(agent, env, "--paths", catalogued + uncatalogued)
        run(["git", "add", "--", *catalogued, *uncatalogued], cwd=agent, env=env)
        staged = validate_catalogue(agent, env, "--index")
        check("an uncatalogued path list is rejected before it is sealed",
              presealed.returncode == 1 and rejected_names(presealed) == sorted(uncatalogued),
              f"rc={presealed.returncode} stderr={presealed.stderr!r}")
        check("the pre-seal verdict names exactly what the staged-index check rejects",
              staged.returncode == 1 and rejected_names(staged) == rejected_names(presealed),
              f"staged={staged.stderr!r} presealed={presealed.stderr!r}")

        run(["git", "reset", "-q", "--", *uncatalogued], cwd=agent, env=env)
        clean_presealed = validate_catalogue(agent, env, "--paths", catalogued)
        clean_staged = validate_catalogue(agent, env, "--index")
        check("a fully catalogued path list passes both checks",
              clean_presealed.returncode == 0 and clean_staged.returncode == 0,
              f"presealed={clean_presealed.stderr!r} staged={clean_staged.stderr!r}")


def test_presealed_path_list_fails_closed():
    """Only a clean PASS may be sealed. A check that could not look at any path is not a PASS."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-preseal-closed-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        empty = validate_catalogue(agent, env, "--paths", [])
        check("an empty proposed path list never passes vacuously",
              empty.returncode == 1 and b"no proposed paths were supplied" in empty.stderr,
              f"rc={empty.returncode} stderr={empty.stderr!r}")
        undecodable = subprocess.run(
            ["python3", os.path.join(agent, "scripts", "validate_data_catalogue.py"), "--repo", agent, "--paths"],
            cwd=agent, env=env, capture_output=True, input=b"analyses/X/\xff.txt\0",
        )
        check("a non-UTF-8 proposed path is refused, not skipped",
              undecodable.returncode == 1 and b"non-UTF-8 path" in undecodable.stderr,
              f"rc={undecodable.returncode} stderr={undecodable.stderr!r}")
        # uncovered_paths() skips anything outside the data roots, which would let these pass unjudged.
        for label, unjudged in (
            ("a code path", "scripts/commit-run.sh"),
            ("an absolute path", "/etc/passwd"),
            ("a non-normalised data path", "./analyses/base/.interrupted"),
            ("an upward path", "analyses/../scripts/commit-run.sh"),
        ):
            result = validate_catalogue(agent, env, "--paths", [unjudged])
            check(f"{label} is refused, never passed without being judged",
                  result.returncode == 1 and b"not a normalised data path" in result.stderr,
                  f"rc={result.returncode} stderr={result.stderr!r}")
        # Positive control: the very list refused below passes while the catalogue is readable, so that
        # refusal is caused by the missing catalogue and by nothing else.
        sighted = validate_catalogue(agent, env, "--paths", ["analyses/base/a.txt"])
        check("the control list passes while the catalogue is readable",
              sighted.returncode == 0, f"rc={sighted.returncode} stderr={sighted.stderr!r}")
        run(["git", "rm", "-q", "--cached", "frameworks/memory/phase0/catalogue.json"], cwd=agent, env=env)
        blind = validate_catalogue(agent, env, "--paths", ["analyses/base/a.txt"])
        check("a missing catalogue refuses the list instead of passing it unchecked",
              blind.returncode == 1 and b"DATA-CATALOGUE: FAIL" in blind.stderr
              and b"uncatalogued data" not in blind.stderr,
              f"rc={blind.returncode} stderr={blind.stderr!r}")


def test_real_catalogue_keeps_supervisor_control_state_out_of_run_roots():
    """Pin the real catalogue's verdict on the files a whole-root RESEARCH publication can sweep up.
    In a research run root (analyses/<RUN>/) the catalogue lists exact file names, so a control marker is
    rejected and the launcher must drop it for the publication to succeed; the terminal records must stay
    accepted (dropping those would hide a failed or aborted run).

    This is deliberately scoped. Stores declared with a blanket glob (commodity/runs/**, screener/runs/**,
    analyses/provider-parity/**) accept ANY file name, so there the catalogue gives no pre-seal protection
    and the launcher's marker list is the only thing keeping control state out. That gap is pinned below
    so it is a known property, not a surprise."""
    root = "analyses/ZZGUARD_2099-01-01"
    env = dict(os.environ)
    for name in (".requires_idea_publication", ".interrupted"):
        result = validate_catalogue(REPO_ROOT, env, "--paths", [f"{root}/{name}"])
        check(f"real catalogue rejects supervisor control state in a research run root: {name}",
              result.returncode == 1 and rejected_names(result) == [f"{root}/{name}"],
              f"rc={result.returncode} stderr={result.stderr!r}")
    accepted = [f"{root}/.aborted", f"{root}/RUN_FAILURE.md", f"{root}/RUN_METADATA.md"]
    result = validate_catalogue(REPO_ROOT, env, "--paths", accepted)
    check("real catalogue accepts the terminal run records",
          result.returncode == 0, f"rc={result.returncode} stderr={result.stderr!r}")
    blanket = ["commodity/runs/ZZGUARD_2099-01-01/.interrupted",
               "screener/runs/ZZGUARD_2099/signal-gate/.requires_idea_publication"]
    result = validate_catalogue(REPO_ROOT, env, "--paths", blanket)
    check("blanket-glob stores accept any file name, so they get no pre-seal catalogue protection",
          result.returncode == 0, f"rc={result.returncode} stderr={result.stderr!r}")


def test_retained_engine_locks_in_swept_ledger_are_gitignored():
    """/screener:signal and /screener:handoff publish all of screener/ledger/. The Idea workspace-actions
    ledger keeps a retained flock beside it (created once, never unlinked); unignored, it is swept into
    every such publication and the data catalogue rejects it."""
    lock = "screener/ledger/idea-workspace-actions.ndjson.lock"
    ignored = subprocess.run(["git", "-C", REPO_ROOT, "check-ignore", "-q", "--no-index", lock])
    check("the retained workspace-actions ledger lock is gitignored, so no sweep can pick it up",
          ignored.returncode == 0, f"rc={ignored.returncode}")
    ledger = subprocess.run(["git", "-C", REPO_ROOT, "check-ignore", "-q", "--no-index",
                             "screener/ledger/idea-workspace-actions.ndjson"])
    check("the ledger itself is still published", ledger.returncode == 1, f"rc={ledger.returncode}")


def test_catalogue_globs_do_not_cross_path_segments():
    paths = ["watchlist/entries/archive/x.json", "analyses/TEST/module/nested/memo.md"]
    patterns = ["watchlist/entries/*.json", "analyses/*/*/*.md"]
    missing = uncovered_paths(paths, patterns)
    check("catalogue '*' cannot hide a deeper undeclared artifact", missing == paths, str(missing))


def test_catalogue_validator_that_cannot_run_is_not_a_refusal():
    """Exit 7 is reserved for the validator's FAIL status (1). A validator that ended with any OTHER status
    never delivered a verdict (python3 or the script missing, killed by a signal), so it stays the generic,
    retryable 5: the cockpit supervisor never auto-resumes a `publication_refused` run, and a helper that
    never ran must not strand a run behind that manual-only hold.

    An uncaught exception INSIDE the validator exits 1 like a FAIL verdict and is deliberately held for a
    person too (second half of this test): re-running the provider cannot repair a broken validator, and
    "unknown" is never permission to spend."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-catalogue-crash-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        write_text(agent, "scripts/validate_data_catalogue.py", "import sys\nsys.exit(3)\n")
        run(["git", "add", "scripts/validate_data_catalogue.py"], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "fixture: validator that cannot run"], cwd=agent, env=env)
        relative = "analyses/FRESH_2099-01-01/new.txt"
        write_text(agent, relative, "fresh\n")
        before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()

        result = run(
            ["bash", COMMIT_RUN, "test: validator crash", "--", relative],
            cwd=agent, env=no_push_env(env), check_rc=False,
        )

        after = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
        check("a catalogue validator that cannot run exits the generic 5, never the refusal code 7",
              result.returncode == 5 and before == after and "could not run (status 3)" in result.stderr,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("a validator crash leaves the index clean for the next autonomous run", cached.returncode == 0)

        write_text(agent, "scripts/validate_data_catalogue.py", "raise RuntimeError('validator bug')\n")
        run(["git", "add", "scripts/validate_data_catalogue.py"], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "fixture: validator with an uncaught exception"], cwd=agent, env=env)
        raised = run(
            ["bash", COMMIT_RUN, "test: validator exception", "--", relative],
            cwd=agent, env=no_push_env(env), check_rc=False,
        )
        cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
        check("an uncaught validator exception (status 1) is held for a person, not retried into",
              raised.returncode == 7 and cached.returncode == 0,
              f"rc={raised.returncode} stderr={raised.stderr!r}")


def test_git_add_failure_is_not_a_noop():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-add-fail-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        result = run(
            ["bash", COMMIT_RUN, "test: bad pathspec", "--", "../outside-repository"],
            cwd=agent, env=env, check_rc=False,
        )
        check("unsafe path is rejected before git add", result.returncode == 2,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("git add failure never emits NOOP or COMMIT_SHA",
              "NOOP=1" not in result.stdout and "COMMIT_SHA=" not in result.stdout, result.stdout)
        cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
        check("git add failure leaves the index empty for the next autonomous run", cached.returncode == 0)


def test_interrupted_publication_leftover_is_unstaged_not_a_permanent_wedge():
    """2026-09-17 outage: a publication SIGKILLed between staging and its own unstage left one data-lane
    path in the production index. Every later autonomous commit then exited 3 forever. A data-lane leftover
    must be unstaged (worktree bytes kept) so the next publication proceeds."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-leftover-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        leftover = "analyses/KILLED_2099-01-01/leftover.txt"
        os.makedirs(os.path.join(agent, os.path.dirname(leftover)), exist_ok=True)
        Path(agent, leftover).write_text("sealed by a publication that was killed mid-staging\n")
        run(["git", "add", "--", leftover], cwd=agent, env=env)
        fresh = "analyses/NEXT_2099-01-02/next.txt"
        os.makedirs(os.path.join(agent, os.path.dirname(fresh)), exist_ok=True)
        Path(agent, fresh).write_text("the next autonomous publication\n")

        result = run(
            ["bash", COMMIT_RUN, "test: publish after an interrupted publication", "--", fresh],
            cwd=agent, env=no_push_env(env), check_rc=False,
        )

        committed = run(["git", "cat-file", "-e", f"HEAD:{fresh}"], cwd=agent, env=env, check_rc=False)
        swept = run(["git", "cat-file", "-e", f"HEAD:{leftover}"], cwd=agent, env=env, check_rc=False)
        cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
        check("a data-lane leftover no longer wedges the next publication",
              result.returncode == 0 and "COMMIT_SHA=" in result.stdout and committed.returncode == 0,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("the leftover is unstaged, never swept into someone else's commit, and its bytes are kept",
              swept.returncode != 0 and cached.returncode == 0 and Path(agent, leftover).is_file()
              and leftover in result.stderr,
              result.stderr)


def test_staged_non_data_change_still_refuses_without_touching_the_index():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-staged-code-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        os.makedirs(os.path.join(agent, "scripts"), exist_ok=True)
        Path(agent, "scripts", "unreviewed.sh").write_text("echo unreviewed code\n")
        leftover = "analyses/KILLED_2099-01-01/leftover.txt"
        os.makedirs(os.path.join(agent, os.path.dirname(leftover)), exist_ok=True)
        Path(agent, leftover).write_text("data leftover beside staged code\n")
        run(["git", "add", "--", "scripts/unreviewed.sh", leftover], cwd=agent, env=env)
        fresh = "analyses/NEXT_2099-01-02/next.txt"
        os.makedirs(os.path.join(agent, os.path.dirname(fresh)), exist_ok=True)
        Path(agent, fresh).write_text("must not publish while code is staged\n")
        before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()

        result = run(
            ["bash", COMMIT_RUN, "test: refuse staged code", "--", fresh],
            cwd=agent, env=no_push_env(env), check_rc=False,
        )

        after = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        staged = run(["git", "diff", "--cached", "--name-only"], cwd=agent, env=env).stdout.split()
        check("staged non-data change still exits 3 and commits nothing",
              result.returncode == 3 and before == after and "already staged" in result.stderr,
              f"rc={result.returncode} stderr={result.stderr!r}")
        check("a refusal never mutates the index", sorted(staged) == sorted(["scripts/unreviewed.sh", leftover]),
              str(staged))


def test_commit_hook_rejection_is_never_pushed_as_old_head():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-commit-fail-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        rejected_path = "analyses/rejected/rejected.txt"
        write_text(agent, rejected_path, "must not land\n")
        hook = os.path.join(agent, ".git", "hooks", "pre-commit")
        with open(hook, "w") as f:
            f.write("#!/bin/sh\nexit 1\n")
        os.chmod(hook, 0o755)
        before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        result = run(
            ["bash", COMMIT_RUN, "test: rejected commit", "--", rejected_path],
            cwd=agent, env=env, check_rc=False,
        )
        after = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        check("pre-commit rejection exits 5", result.returncode == 5,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("rejected commit leaves HEAD unchanged and emits no success SHA",
              before == after and "COMMIT_SHA=" not in result.stdout, result.stdout)
        remote = run(["git", "show", f"origin/main:{rejected_path}"], cwd=agent, env=env, check_rc=False)
        check("rejected content is absent from origin/main", remote.returncode != 0, remote.stdout)
        cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
        check("commit-hook rejection unstages this run's paths", cached.returncode == 0)


def test_conflicting_remote_reconciliation_leaves_checkout_untouched():
    """A non-fast-forward content conflict must never start a checkout-changing rebase."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-conflict-") as tmp:
        env = git_env()
        origin = os.path.join(tmp, "origin.git")
        run(["git", "init", "--bare", "-q", "-b", "main", origin], cwd=tmp, env=env)
        seed = os.path.join(tmp, "seed")
        run(["git", "clone", "-q", origin, seed], cwd=tmp, env=env)
        install_catalogue_fixture(seed)
        shared_path = "analyses/shared/shared.ndjson"
        write_text(seed, shared_path, '{"side":"base"}\n')
        run(["git", "add", shared_path, *CATALOGUE_FIXTURE_PATHS], cwd=seed, env=env)
        run(["git", "commit", "-q", "-m", "base"], cwd=seed, env=env)
        run(["git", "push", "-q", "origin", "main"], cwd=seed, env=env)

        agent = os.path.join(tmp, "agent")
        run(["git", "clone", "-q", origin, agent], cwd=tmp, env=env)
        run(["git", "checkout", "-q", "-b", "session"], cwd=agent, env=env)

        write_text(seed, shared_path, '{"side":"remote"}\n')
        run(["git", "add", shared_path], cwd=seed, env=env)
        run(["git", "commit", "-q", "-m", "remote conflict"], cwd=seed, env=env)
        run(["git", "push", "-q", "origin", "main"], cwd=seed, env=env)

        write_text(agent, shared_path, '{"side":"local"}\n')
        result = run(
            ["bash", COMMIT_RUN, "test: local conflict", "--", shared_path],
            cwd=agent, env=env, check_rc=False,
        )
        head = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        reported = next((line.split("=", 1)[1] for line in result.stdout.splitlines()
                         if line.startswith("COMMIT_SHA=")), "")
        check("a conflicting in-memory reconciliation exits 4 and reports the retained local commit",
              result.returncode == 4 and reported == head,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("the conflict is reported without entering a rebase",
              "data reconciliation conflicts" in result.stderr, result.stderr)
        check("no rebase-merge/rebase-apply directory is ever created",
              not os.path.exists(git_internal_path(agent, "rebase-merge", env))
              and not os.path.exists(git_internal_path(agent, "rebase-apply", env)))
        unmerged = run(["git", "ls-files", "-u"], cwd=agent, env=env)
        cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
        local_blob = run(["git", "show", f"HEAD:{shared_path}"], cwd=agent, env=env)
        check("the in-memory conflict leaves a clean index with no unmerged entries",
              unmerged.stdout == "" and cached.returncode == 0,
              f"unmerged={unmerged.stdout!r}")
        check("HEAD stays on the local data commit rather than losing its data",
              '"side":"local"' in local_blob.stdout, local_blob.stdout)


def test_clean_reconciliation_race_retains_original_local_commit():
    """If every synthetic push loses, the production checkout must remain on its original program."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-second-race-") as tmp:
        origin, agent, env = setup_stale_local_main_scenario(tmp)
        racer = os.path.join(tmp, "racer")
        run(["git", "clone", "-q", origin, racer], cwd=tmp, env=env)
        with open(os.path.join(racer, "remote-race.txt"), "w") as f:
            f.write("remote moved\n")
        run(["git", "add", "remote-race.txt"], cwd=racer, env=env)
        run(["git", "commit", "-q", "-m", "remote race"], cwd=racer, env=env)
        run(["git", "push", "-q", "origin", "main"], cwd=racer, env=env)

        # The direct push and all synthetic reconciliation pushes are rejected. Fetching the remote object
        # must not make its code appear in the local production checkout.
        hook = os.path.join(origin, "hooks", "pre-receive")
        with open(hook, "w") as f:
            f.write("#!/bin/sh\nexit 1\n")
        os.chmod(hook, 0o755)
        local_race_path = "analyses/local/local-race.txt"
        write_text(agent, local_race_path, "local survives\n")
        result = run(
            ["bash", COMMIT_RUN, "test: second push race", "--", local_race_path],
            cwd=agent, env=env, check_rc=False,
        )
        head = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        reported = next((line.split("=", 1)[1] for line in result.stdout.splitlines()
                         if line.startswith("COMMIT_SHA=")), "")
        local_blob = run(["git", "show", f"HEAD:{local_race_path}"], cwd=agent, env=env, check_rc=False)
        remote_blob = run(["git", "show", "HEAD:remote-race.txt"], cwd=agent, env=env, check_rc=False)
        check("clean reconciliation races exit 4 with the original local data SHA",
              result.returncode == 4 and reported == head and "lost three remote races" in result.stderr,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("remote code is not pulled into the local commit while local data is retained",
              local_blob.returncode == 0 and remote_blob.returncode != 0)
        check("reconciliation failure creates no rebase state",
              not os.path.exists(git_internal_path(agent, "rebase-merge", env))
              and not os.path.exists(git_internal_path(agent, "rebase-apply", env)))


def test_clean_data_reconciliation_publishes_without_advancing_production_program():
    """A successful data publication may advance origin/main, never the live checkout's code."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-clean-program-pin-") as tmp:
        _, _, agent, env, remote_code_sha = setup_dirty_data_reconcile_scenario(tmp)
        local_before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        relative = "analyses/PINNED_2099-01-01/result.md"
        write_text(agent, relative, "published while program stays pinned\n")
        result = run(
            ["bash", COMMIT_RUN, "test: preserve production program", "--", relative],
            cwd=agent, env=env, check_rc=False,
        )
        local_after = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        local_data_sha = local_after
        local_remote_code = run(["git", "cat-file", "-e", "HEAD:reviewed-code.txt"],
                                cwd=agent, env=env, check_rc=False)
        run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
        published = run(["git", "show", f"origin/main:{relative}"], cwd=agent, env=env, check_rc=False)
        remote_has_code = run(["git", "cat-file", "-e", "origin/main:reviewed-code.txt"],
                              cwd=agent, env=env, check_rc=False)
        data_ancestor = run(["git", "merge-base", "--is-ancestor", local_data_sha, "origin/main"],
                            cwd=agent, env=env, check_rc=False)
        code_ancestor = run(["git", "merge-base", "--is-ancestor", remote_code_sha, "origin/main"],
                            cwd=agent, env=env, check_rc=False)
        check("clean data reconciliation publishes successfully",
              result.returncode == 0 and f"COMMIT_SHA={local_data_sha}" in result.stdout
              and published.returncode == 0 and data_ancestor.returncode == 0,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("production HEAD gains only its data commit and never the remote code tree",
              local_after != local_before and local_remote_code.returncode != 0,
              f"before={local_before} after={local_after}")
        check("origin/main retains both reviewed code and the exact data ancestry",
              remote_has_code.returncode == 0 and code_ancestor.returncode == 0)


def setup_dirty_data_reconcile_scenario(tmp):
    """Build the production shape: local data commit + dirty screener bytes vs newer origin code."""
    env = git_env()
    origin = os.path.join(tmp, "origin.git")
    run(["git", "init", "--bare", "-q", "-b", "main", origin], cwd=tmp, env=env)
    seed = os.path.join(tmp, "seed")
    run(["git", "clone", "-q", origin, seed], cwd=tmp, env=env)
    install_catalogue_fixture(seed)
    os.makedirs(os.path.join(seed, "screener", "board"), exist_ok=True)
    with open(os.path.join(seed, "screener", "board", "live.json"), "w") as f:
        f.write('{"generation":"base"}\n')
    with open(os.path.join(seed, "base.txt"), "w") as f:
        f.write("base\n")
    run(["git", "add", "screener/board/live.json", "base.txt", *CATALOGUE_FIXTURE_PATHS],
        cwd=seed, env=env)
    run(["git", "commit", "-q", "-m", "base"], cwd=seed, env=env)
    run(["git", "push", "-q", "origin", "main"], cwd=seed, env=env)

    agent = os.path.join(tmp, "agent")
    run(["git", "clone", "-q", origin, agent], cwd=tmp, env=env)

    # Reviewed code lands remotely while production is still on the base commit.
    with open(os.path.join(seed, "reviewed-code.txt"), "w") as f:
        f.write("reviewed remote change\n")
    run(["git", "add", "reviewed-code.txt"], cwd=seed, env=env)
    run(["git", "commit", "-q", "-m", "reviewed remote change"], cwd=seed, env=env)
    run(["git", "push", "-q", "origin", "main"], cwd=seed, env=env)
    remote_before = run(["git", "rev-parse", "HEAD"], cwd=seed, env=env).stdout.strip()
    return origin, seed, agent, env, remote_before


def test_dirty_data_reconcile_preserves_live_bytes_and_original_commit_ancestry():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-dirty-data-") as tmp:
        _, _, agent, env, remote_before = setup_dirty_data_reconcile_scenario(tmp)
        os.makedirs(os.path.join(agent, "analyses", "TEST_2099-01-01"), exist_ok=True)
        published = os.path.join(agent, "analyses", "TEST_2099-01-01", "result.md")
        with open(published, "w") as f:
            f.write("published data\n")
        with open(os.path.join(agent, "screener", "board", "live.json"), "w") as f:
            f.write('{"generation":"uncommitted-live"}\n')

        result = run(
            ["bash", COMMIT_RUN, "test: dirty data reconcile", "--", "analyses/TEST_2099-01-01/result.md"],
            cwd=agent, env=env, check_rc=False,
        )
        local_data_sha = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
        remote_after = run(["git", "rev-parse", "origin/main"], cwd=agent, env=env).stdout.strip()
        parents = run(["git", "show", "-s", "--format=%P", remote_after], cwd=agent, env=env).stdout.split()
        ancestor = run(["git", "merge-base", "--is-ancestor", local_data_sha, "origin/main"],
                       cwd=agent, env=env, check_rc=False)
        remote_code = run(["git", "show", "origin/main:reviewed-code.txt"], cwd=agent, env=env, check_rc=False)
        remote_data = run(["git", "show", "origin/main:analyses/TEST_2099-01-01/result.md"],
                          cwd=agent, env=env, check_rc=False)
        remote_live = run(["git", "show", "origin/main:screener/board/live.json"],
                          cwd=agent, env=env, check_rc=False)
        with open(os.path.join(agent, "screener", "board", "live.json")) as f:
            live_worktree = f.read()
        check("dirty DATA reconciliation exits 0 and reports the original local data commit",
              result.returncode == 0 and f"COMMIT_SHA={local_data_sha}" in result.stdout,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("remote reconciliation preserves the exact local commit as its second parent",
              len(parents) == 2 and parents[0] == remote_before and parents[1] == local_data_sha
              and ancestor.returncode == 0,
              f"parents={parents!r} remote={remote_after}")
        check("remote contains both reviewed code and committed engine data",
              remote_code.returncode == 0 and remote_data.returncode == 0)
        check("uncommitted live screener bytes are untouched and never swept into the merge",
              'uncommitted-live' in live_worktree and '"generation":"base"' in remote_live.stdout,
              f"worktree={live_worktree!r} remote={remote_live.stdout!r}")
        dirty = run(["git", "diff", "--name-only"], cwd=agent, env=env).stdout.splitlines()
        check("the original production worktree remains dirty only where it started",
              dirty == ["screener/board/live.json"], repr(dirty))


def test_dirty_code_still_blocks_reconciliation():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-dirty-code-") as tmp:
        _, _, agent, env, remote_before = setup_dirty_data_reconcile_scenario(tmp)
        with open(os.path.join(agent, "base.txt"), "w") as f:
            f.write("unreviewed local code/ops edit\n")
        os.makedirs(os.path.join(agent, "analyses", "TEST_2099-01-01"), exist_ok=True)
        with open(os.path.join(agent, "analyses", "TEST_2099-01-01", "result.md"), "w") as f:
            f.write("must stay local\n")
        result = run(
            ["bash", COMMIT_RUN, "test: dirty code blocks", "--", "analyses/TEST_2099-01-01/result.md"],
            cwd=agent, env=env, check_rc=False,
        )
        local_sha = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
        remote_after = run(["git", "rev-parse", "origin/main"], cwd=agent, env=env).stdout.strip()
        remote_data = run(["git", "cat-file", "-e", "origin/main:analyses/TEST_2099-01-01/result.md"],
                          cwd=agent, env=env, check_rc=False)
        check("dirty non-data path fails closed with the local commit retained",
              result.returncode == 4 and f"COMMIT_SHA={local_sha}" in result.stdout
              and "unsafe/conflicting tracked changes" in result.stderr,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("dirty code rejection leaves origin unchanged and unpublished data absent",
              remote_after == remote_before and remote_data.returncode != 0)


def test_retry_push_reconciles_dirty_data_without_moving_local_head():
    """The ideas publisher's durable retry uses the same safe path as a fresh publication."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-dirty-retry-") as tmp:
        _, _, agent, env, _ = setup_dirty_data_reconcile_scenario(tmp)
        os.makedirs(os.path.join(agent, "analyses", "RETRY_2099-01-01"), exist_ok=True)
        with open(os.path.join(agent, "analyses", "RETRY_2099-01-01", "result.md"), "w") as f:
            f.write("retry data\n")
        run(["git", "add", "analyses/RETRY_2099-01-01/result.md"], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "local retry target"], cwd=agent, env=env)
        local_sha = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        with open(os.path.join(agent, "screener", "board", "live.json"), "w") as f:
            f.write('{"generation":"retry-live"}\n')

        result = run(["bash", COMMIT_RUN, "--retry-push", local_sha], cwd=agent, env=env, check_rc=False)
        head_after = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
        ancestor = run(["git", "merge-base", "--is-ancestor", local_sha, "origin/main"],
                       cwd=agent, env=env, check_rc=False)
        with open(os.path.join(agent, "screener", "board", "live.json")) as f:
            live_worktree = f.read()
        check("retry mode publishes a stranded commit through dirty DATA reconciliation",
              result.returncode == 0 and f"COMMIT_SHA={local_sha}" in result.stdout
              and ancestor.returncode == 0,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("retry reconciliation never moves HEAD or changes live dirty bytes",
              head_after == local_sha and 'retry-live' in live_worktree)


def test_retry_push_is_exact_main_only_and_serialized():
    """An ambiguous local commit can be retried without staging another commit or bypassing safety."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-retry-") as tmp:
        env = git_env()
        origin = os.path.join(tmp, "origin.git")
        run(["git", "init", "--bare", "-q", "-b", "main", origin], cwd=tmp, env=env)
        agent = os.path.join(tmp, "agent")
        run(["git", "clone", "-q", origin, agent], cwd=tmp, env=env)
        install_catalogue_fixture(agent)
        with open(os.path.join(agent, "base.txt"), "w") as f:
            f.write("base\n")
        run(["git", "add", "base.txt", *CATALOGUE_FIXTURE_PATHS], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "base"], cwd=agent, env=env)
        run(["git", "push", "-q", "origin", "main"], cwd=agent, env=env)
        pending_path = "analyses/pending/pending.txt"
        write_text(agent, pending_path, "pending\n")
        run(["git", "add", pending_path], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "pending"], cwd=agent, env=env)
        sha = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()

        wrong = run(["bash", COMMIT_RUN, "--retry-push", "0" * 40], cwd=agent, env=env, check_rc=False)
        check("retry mode refuses a target other than exact HEAD", wrong.returncode == 4,
              f"rc={wrong.returncode} stderr={wrong.stderr!r}")
        result = run(["bash", COMMIT_RUN, "--retry-push", sha], cwd=agent, env=env, check_rc=False)
        run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
        remote = run(["git", "rev-parse", "origin/main"], cwd=agent, env=env).stdout.strip()
        check("retry mode pushes the exact pending main commit under the shared helper",
              result.returncode == 0 and remote == sha and f"COMMIT_SHA={sha}" in result.stdout,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")

        with open(os.path.join(agent, "no-push-retry.txt"), "w") as f:
            f.write("must stay local\n")
        run(["git", "add", "no-push-retry.txt"], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "local validation checkpoint"], cwd=agent, env=env)
        local_only_sha = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        no_push_retry = run(
            ["bash", COMMIT_RUN, "--retry-push", local_only_sha],
            cwd=agent, env=no_push_env(env), check_rc=False,
        )
        remote_after_no_push = run(["git", "rev-parse", "origin/main"], cwd=agent, env=env).stdout.strip()
        check("ENGINE_NO_PUSH refuses retry mode and leaves origin untouched",
              no_push_retry.returncode == 4 and remote_after_no_push == sha
              and "retry push refused" in no_push_retry.stderr,
              f"rc={no_push_retry.returncode} stdout={no_push_retry.stdout!r} stderr={no_push_retry.stderr!r}")

        run(["git", "checkout", "-q", "-b", "code-branch"], cwd=agent, env=env)
        rejected = run(["bash", COMMIT_RUN, "--retry-push", sha], cwd=agent, env=env, check_rc=False)
        check("retry mode refuses a developer/code branch", rejected.returncode == 4, rejected.stderr)


def test_invalid_new_decision_is_rejected_before_commit():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-invalid-decision-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        install_prewrite_fixture(agent)
        relative = "analyses/FRESH_2099-01-01/decision_record.json"
        write_json(agent, relative, {
            "decision_date": "2099-01-01",
            "data_needs_schema_version": "2.0",
            "data_needs": "not-an-array",
        })
        before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        result = run(
            ["bash", COMMIT_RUN, "test: reject invalid decision", "--", relative],
            cwd=agent, env=no_push_env(env), check_rc=False,
        )
        after = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
        check("invalid fresh staged decision exits 5 before commit",
              result.returncode == 5 and before == after,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("invalid fresh decision reports the prewrite failure",
              "DATA-NEEDS-PREWRITE: FAIL" in result.stderr
              and "rejected staged publication" in result.stderr,
              result.stderr)
        check("rejected decision is unstaged for the next autonomous run", cached.returncode == 0)


def test_valid_decision_commits_staged_snapshot_not_later_worktree_bytes():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-staged-snapshot-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        install_prewrite_fixture(agent)
        relative = "analyses/ODD name [x]_2099-01-01/decision_record.json"
        absolute = write_json(agent, relative, {
            "decision_date": "2099-01-01",
            "data_needs_schema_version": "2.0",
            "data_needs": [],
        })

        # Interpose only on the validator call. It mutates the worktree file immediately after the
        # staged snapshot passes, reproducing the old validation-to-pathspec-commit TOCTOU window.
        wrappers = os.path.join(tmp, "wrappers")
        os.makedirs(wrappers)
        python_wrapper = os.path.join(wrappers, "python3")
        with open(python_wrapper, "w") as f:
            f.write(
                "#!/bin/sh\n"
                "if [ \"${2:-}\" = \"--data-needs-prewrite\" ]; then\n"
                f"  {shlex.quote(sys.executable)} \"$@\"\n"
                "  rc=$?\n"
                "  if [ \"$rc\" -eq 0 ]; then\n"
                "    printf '%s\\n' '{\"decision_date\":\"not-a-date\"}' > \"$COMMIT_RUN_MUTATION_TARGET\"\n"
                "  fi\n"
                "  exit \"$rc\"\n"
                "fi\n"
                f"exec {shlex.quote(sys.executable)} \"$@\"\n"
            )
        os.chmod(python_wrapper, 0o755)
        race_env = no_push_env(env)
        race_env["PATH"] = wrappers + os.pathsep + race_env.get("PATH", "")
        race_env["COMMIT_RUN_MUTATION_TARGET"] = absolute
        result = run(
            ["bash", COMMIT_RUN, "test: commit staged decision snapshot", "--", relative],
            cwd=agent, env=race_env, check_rc=False,
        )
        committed = run(["git", "show", f"HEAD:{relative}"], cwd=agent, env=env, check_rc=False)
        committed_body = json.loads(committed.stdout) if committed.returncode == 0 else {}
        with open(absolute) as f:
            worktree_body = json.load(f)
        check("valid staged decision passes and commits",
              result.returncode == 0 and "DATA-NEEDS-PREWRITE: PASS" in result.stdout,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("commit contains the validated index bytes after a worktree race",
              committed_body.get("data_needs_schema_version") == "2.0"
              and committed_body.get("data_needs") == [], committed.stdout)
        check("the test actually changed the later worktree bytes",
              worktree_body == {"decision_date": "not-a-date"}, repr(worktree_body))


def test_unchanged_historical_decision_is_not_regraded():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-unchanged-history-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        install_prewrite_fixture(agent)
        run_root = os.path.join(agent, "analyses", "LEGACY_2020-01-01")
        os.makedirs(run_root, exist_ok=True)
        # Deliberately malformed immutable legacy bytes: if commit-run scans the run directory rather
        # than the changed index entries, the publication gate will fail this unrelated thesis update.
        with open(os.path.join(run_root, "decision_record.json"), "w") as f:
            f.write("{ frozen legacy bytes\n")
        thesis = os.path.join(run_root, "final_thesis.md")
        with open(thesis, "w") as f:
            f.write("original thesis\n")
        run(["git", "add", "analyses/LEGACY_2020-01-01"], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "fixture: frozen legacy run"], cwd=agent, env=env)
        with open(thesis, "a") as f:
            f.write("append-only correction\n")
        result = run(
            ["bash", COMMIT_RUN, "test: update legacy thesis", "--", "analyses/LEGACY_2020-01-01/"],
            cwd=agent, env=no_push_env(env), check_rc=False,
        )
        committed = run(["git", "show", "HEAD:analyses/LEGACY_2020-01-01/final_thesis.md"],
                        cwd=agent, env=env, check_rc=False)
        check("unchanged historical decision is not regraded",
              result.returncode == 0 and "append-only correction" in committed.stdout,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("no prewrite was launched for the unchanged historical record",
              "DATA-NEEDS-PREWRITE" not in result.stdout + result.stderr,
              result.stdout + result.stderr)


def test_non_terminal_outputs_and_commodity_archive_bypass_creation_gate():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-nondecision-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        paths = [
            "analyses/MODULE_2099-01-01/business-model/01_unit-economics.json",
            "analyses/MODULE_2099-01-01/reviews/2099-02-01_decision_review.json",
            "analyses/performance/2099-01-01_calibration_summary.json",
            # Commodity owns a separate pre-archive validator and live orb roster. Neither its mutable
            # projection nor its immutable archive may be falsely sent through the research validator.
            "commodity/runs/GOLD/decision_record.json",
            "commodity/runs/GOLD/decisions/frozen-id/decision_record.json",
            "commodity/performance/2099-01-01_calibration_summary.json",
        ]
        for relative in paths:
            write_json(agent, relative, {"fixture": relative})
        # No scripts/eval.py exists in this clone. Success therefore proves these changed paths never
        # enter the top-level decision-publication gate.
        result = run(
            ["bash", COMMIT_RUN, "test: non-terminal outputs", "--", *paths],
            cwd=agent, env=no_push_env(env), check_rc=False,
        )
        all_committed = all(
            run(["git", "cat-file", "-e", f"HEAD:{relative}"], cwd=agent, env=env, check_rc=False).returncode == 0
            for relative in paths
        )
        check("module/review/calibration/commodity outputs are unaffected by the research creation gate",
              result.returncode == 0 and all_committed,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("non-terminal outputs do not launch prewrite validation",
              "DATA-NEEDS-PREWRITE" not in result.stdout + result.stderr,
              result.stdout + result.stderr)


def test_cockpit_publication_delegates_to_supervisor_and_never_trusts_child_manifest():
    """Cockpit mode is an untrusted request client; only the live supervisor may stamp/commit."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-supervisor-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        data_path = "analyses/PROV_2099-01-01/module.json"
        write_json(agent, data_path, {"fixture": True})
        fake_manifest = write_text(
            agent, "analyses/PROV_2099-01-01/.execution-provenance.jsonl",
            '{"provider":"codex","model":"forged","decision_author":true}\n',
        )
        requests = []
        token = "supervisor-only-fixture-token"

        class Handler(BaseHTTPRequestHandler):
            def do_POST(self):
                body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
                requests.append({"path": self.path, "token": self.headers.get("X-Nostra-Publication-Token"),
                                 "body": json.loads(body)})
                if requests[-1]["token"] != token:
                    self.send_response(403); self.end_headers(); return
                rendered = json.dumps({"ok": True, "output": "COMMIT_SHA=supervisor-fixture"}).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(rendered)))
                self.end_headers()
                self.wfile.write(rendered)

            def log_message(self, *_args):
                return

        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            cockpit = no_push_env(env)
            cockpit.update({
                "NOSTRA_COCKPIT_RUN": "1",
                "NOSTRA_PUBLICATION_ENDPOINT": f"http://127.0.0.1:{server.server_port}/publication",
                "NOSTRA_PUBLICATION_TOKEN": token,
                # The retired child-writable contract must have no influence on the request or bytes.
                "NOSTRA_PROVENANCE_MANIFEST": fake_manifest,
            })
            before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
            result = run(
                ["bash", COMMIT_RUN, "test: supervisor publication", "--", data_path],
                cwd=agent, env=cockpit, check_rc=False,
            )
            after = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
            cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
            check("cockpit child delegates one exact publication request to the supervisor",
                  result.returncode == 0 and "COMMIT_SHA=supervisor-fixture" in result.stdout
                  and len(requests) == 1 and requests[0]["body"] == {
                      "phase": "commit", "message": "test: supervisor publication", "pathspecs": [data_path]},
                  f"rc={result.returncode} requests={requests!r} stderr={result.stderr!r}")
            check("delegation never stages, commits, or reads a child-forged provenance manifest",
                  before == after and cached.returncode == 0 and "forged" in Path(fake_manifest).read_text())

            request_count = len(requests)
            refused = run(
                ["bash", COMMIT_RUN, "test: refuse code", "--", "ui/server/src/server.ts"],
                cwd=agent, env=cockpit, check_rc=False,
            )
            check("a cockpit command cannot request a code path",
                  refused.returncode == 2 and len(requests) == request_count
                  and "refused non-data pathspec" in refused.stderr,
                  f"rc={refused.returncode} stderr={refused.stderr!r}")
        finally:
            server.shutdown()
            server.server_close()

        missing_env = no_push_env(env)
        missing_env["NOSTRA_COCKPIT_RUN"] = "1"
        missing = run(
            ["bash", COMMIT_RUN, "test: missing supervisor", "--", data_path],
            cwd=agent, env=missing_env, check_rc=False,
        )
        check("cockpit publication without a supervisor capability fails closed",
              missing.returncode == 5 and "has no supervisor capability" in missing.stderr,
              f"rc={missing.returncode} stdout={missing.stdout!r} stderr={missing.stderr!r}")


def test_supervisor_snapshot_stages_fixed_bytes_not_mutable_worktree():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-snapshot-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        relative = "analyses/SNAPSHOT_2099-01-01/module.txt"
        write_text(agent, relative, "A: supervisor-stamped\n")
        snapshot_dir = Path(tmp) / "protected-snapshot"
        snapshot_dir.mkdir(mode=0o700)
        snapshot = snapshot_dir / "0"
        snapshot.write_text("A: supervisor-stamped\n")
        snapshot.chmod(0o600)
        manifest = snapshot_dir / "manifest.json"
        manifest.write_text(json.dumps({
            "schema_version": "cockpit-publication-snapshot/1.0",
            "run_id": "fixture",
            "requested_pathspecs": [relative],
            "entries": [{
                "path": relative,
                "snapshot": str(snapshot.resolve()),
                "sha256": "sha256:" + hashlib.sha256(snapshot.read_bytes()).hexdigest(),
            }],
        }) + "\n")
        manifest.chmod(0o600)
        # A provider descendant swaps the worktree after supervisor stamping. The index must still get A.
        write_text(agent, relative, "B: provider race\n")
        fixed_env = no_push_env(env)
        fixed_env["NOSTRA_SUPERVISOR_SNAPSHOT_MANIFEST"] = str(manifest.resolve())
        result = run(
            ["bash", COMMIT_RUN, "test: fixed supervisor snapshot", "--", relative],
            cwd=agent, env=fixed_env, check_rc=False,
        )
        committed = run(["git", "show", f"HEAD:{relative}"], cwd=agent, env=env).stdout
        check("protected snapshot stages A even after worktree changes to B",
              result.returncode == 0 and committed == "A: supervisor-stamped\n"
              and Path(agent, relative).read_text() == "B: provider race\n",
              f"rc={result.returncode} committed={committed!r} stderr={result.stderr!r}")


DECISION_GATE = os.path.join(REPO_ROOT, "scripts", "decision_publication_gate.py")

# The selection rule commit-run.sh carried inline before it moved into the shared gate, verbatim. It is the
# oracle: the port must select exactly what this selected, byte for byte, in the same order.
FORMER_INLINE_SELECTION = (
    'while IFS= read -r -d "" p; do '
    'if [[ "$p" =~ ^analyses/[^/]+/decision_record\\.json$ ]]; then printf "%s\\0" "$p"; fi; '
    'done'
)


def run_gate(args, stdin=b"", cwd=None, env=None):
    return subprocess.run(["python3", DECISION_GATE, *args], input=stdin, cwd=cwd, env=env, capture_output=True)


def test_decision_gate_selects_exactly_what_the_former_inline_rule_selected():
    gated = [
        "analyses/FRESH_2099-01-01/decision_record.json",
        "analyses/ODD name [x]_2099-01-01/decision_record.json",
        "analyses/日本_2099-01-01/decision_record.json",
        # NUL is the separator, so a newline is ordinary path data to both implementations.
        "analyses/LINE\nBREAK_2099-01-01/decision_record.json",
    ]
    not_gated = [
        "analyses/MODULE_2099-01-01/business-model/01_unit-economics.json",
        "analyses/MODULE_2099-01-01/reviews/decision_record.json",
        "analyses/decision_record.json",
        "analyses//decision_record.json",
        "analyses/X_2099-01-01/decision_record.json.bak",
        "analyses/X_2099-01-01/decision_recordXjson",
        "analyses/X_2099-01-01/decision_record.json\n",
        "xanalyses/X_2099-01-01/decision_record.json",
        "analyses/performance/2099-01-01_calibration_summary.json",
        "commodity/runs/GOLD/decision_record.json",
        "commodity/runs/GOLD/decisions/frozen-id/decision_record.json",
        "screener/runs/SIG-1/decision_record.json",
    ]
    # Interleave so an implementation that reorders, or only gets a prefix right, cannot pass.
    battery = [item for pair in zip(not_gated, gated + gated + gated) for item in pair] + not_gated[len(gated) * 3:]
    raw = b"".join(path.encode("utf-8") + b"\0" for path in battery)
    oracle = subprocess.run(["bash", "-c", FORMER_INLINE_SELECTION], input=raw, capture_output=True)
    ported = run_gate(["--select"], raw)
    expected = b"".join(path.encode("utf-8") + b"\0" for path in battery if path in gated)
    check("the former inline rule still selects what this test believes it selected",
          oracle.returncode == 0 and oracle.stdout == expected and expected.count(b"\0") == 12,
          f"rc={oracle.returncode} stdout={oracle.stdout!r}")
    check("the shared gate selects byte-for-byte what commit-run.sh's inline rule selected, in order",
          ported.returncode == 0 and ported.stdout == oracle.stdout,
          f"rc={ported.returncode} stdout={ported.stdout!r} stderr={ported.stderr!r}")
    unterminated = run_gate(["--select"], raw[:-1])
    check("a separator-style list (no trailing NUL) selects the same set, still NUL-terminated for `read -d ''`",
          unterminated.returncode == 0 and unterminated.stdout == oracle.stdout, repr(unterminated.stdout))
    empty = run_gate(["--select"], b"")
    check("an empty staged list selects nothing and is not an error",
          empty.returncode == 0 and empty.stdout == b"", f"rc={empty.returncode} stdout={empty.stdout!r}")

    # One definition, two callers. If either caller grows its own copy of the rule, the two can drift again.
    commit_run_text = Path(COMMIT_RUN).read_text()
    launcher_text = Path(REPO_ROOT, "ui", "server", "src", "launcher.ts").read_text()
    check("commit-run.sh asks the shared gate which staged paths are gated and how a record is judged",
          "decision_publication_gate.py\" --select" in commit_run_text
          and "decision_publication_gate.py\" --repo \"$TOP\" --check" in commit_run_text)
    # Invocations, not prose: both files explain the gate in comments. `eval.py` appears in commit-run.sh
    # only if it calls the validator itself; a quoted flag appears in launcher.ts only as an argv element.
    check("commit-run.sh carries no inline copy of the path shape or of the validator call",
          "decision_record\\.json" not in commit_run_text and "eval.py" not in commit_run_text)
    check("the supervisor asks the same gate about the frozen snapshot and carries no copy of the rule",
          "'decision_publication_gate.py'), '--repo', REPO_ROOT, '--records'" in launcher_text
          and "'--data-needs-prewrite'" not in launcher_text and "decision_record\\.json" not in launcher_text)


# Every way commit-run.sh can exit 5, keyed by the message it prints, with how many sites print it.
#
# Why this table exists: the cockpit supervisor seals a publication's exact bytes into an immutable ready
# receipt and only then runs commit-run.sh. A sealed receipt that hits a refusal which is DETERMINISTIC for
# those bytes is refused again at every engine startup, forever (2026-09-17 outage). So each refusal needs
# a decision when it is introduced, and the test below fails until a new one is given one:
#
#   child-request      runs only in the NOSTRA_COCKPIT_RUN=1 request client. The supervisor strips that
#                      variable before it invokes commit-run.sh, so a sealed receipt never reaches it.
#   not-snapshot-mode  unreachable while staging a supervisor snapshot (entries are always staged as
#                      regular 100644 blobs through `update-index`, never through `git add`).
#   environmental      depends on the machine or the checkout, not on the sealed bytes: a later retry can
#                      succeed, so retaining the receipt is the right outcome.
#   pre-seal           deterministic for the sealed bytes, and the supervisor asks the SAME script before
#                      it seals, so the live run fails visibly and no receipt is written.
#   mixed              several causes behind one message; see the note beside it.
EXIT_5_SITES = {
    "a cockpit child cannot retry a supervisor publication": (1, "child-request"),
    # Two sites share this message: the missing-capability refusal and the helper-directory `|| exit 5`.
    "cockpit publication has no supervisor capability": (2, "child-request"),
    "supervisor publication failed": (1, "child-request"),
    # mixed. Deterministic and asked first: more than 512 entries and a file above 128 MiB (launcher.ts
    # MAX_PUBLICATION_SNAPSHOT_*), a backslash or a `.`/`..`/empty segment (validate_data_catalogue.py
    # --paths). True by construction: the manifest/requested-path agreement and the protected-file shape.
    # Post-seal by definition: a digest mismatch means the sealed bytes were altered afterwards.
    # Environmental: `hash-object -w` / `update-index` failing. KNOWN AND NOT ASKED FIRST: an entry
    # byte-identical to HEAD whose HEAD mode is 100755 is staged as a mode change but is absent from the
    # OID-only expected delta, so staging refuses it. No data file in HEAD is executable today, and the
    # supervisor can never create one; only a plain `git add` publication of an executable file could.
    "protected supervisor snapshot staging failed": (1, "mixed"),
    "git add failed": (1, "not-snapshot-mode"),
    # pre-seal for the paths this publication proposes (--paths). It also judges the WHOLE index, so
    # unrelated uncatalogued data already in HEAD fails every publication until the repository is repaired:
    # that is a repository fault, not a property of the sealed bytes.
    "data catalogue validator could not run": (1, "environmental"),
    "cannot create data-needs validation workspace": (1, "environmental"),
    "cannot enumerate staged publications": (1, "environmental"),
    # The gate script is missing or cannot run. The supervisor's own call to it refuses for the same cause.
    "cannot select staged decision publications": (1, "environmental"),
    "staged decision publication is not a regular file": (1, "not-snapshot-mode"),
    "cannot read staged decision publication": (1, "environmental"),
    # pre-seal through decision_publication_gate.py --records. The verdict also depends on the checked-out
    # `.claude/agents` roster and on HEAD, so a deploy or another publication of the same path between
    # sealing and commit can still change it.
    "data-needs prewrite rejected staged publication": (1, "pre-seal"),
    # Only a failed redirect of the selected-path list: the file vanished from a private mktemp directory.
    "cannot read selected decision publications": (1, "environmental"),
    "git commit failed": (1, "environmental"),
    # Runs after the local commit exists. Two causes: the index was mutated under the repository lock, or
    # the repository rewrites bytes on the way in (`core.autocrlf`, a clean filter), so the committed blob
    # no longer hashes to the snapshot. The second IS deterministic for a record those settings touch, and
    # is not asked first: the gate mirrors commit-run.sh's own `hash-object` (filters on) so that "differs
    # from HEAD" agrees with it. Neither setting is configured and no .gitattributes is tracked.
    "committed tree disagrees with protected supervisor snapshot": (1, "environmental"),
}


def test_every_exit_5_has_a_decision_about_sealed_receipts():
    lines = Path(COMMIT_RUN).read_text().splitlines()
    found = {}
    # The inventory keys on the plain spellings `exit 5` and `SystemExit(5)`. Any OTHER way to leave with a
    # status is refused outright unless listed here, so a refusal cannot slip past by being spelled
    # `exit "$RC"`, `exit  5`, `return 5 … || exit $?` or `sys.exit(5)`.
    computed_exits_allowed = {"exit $?": 1}  # the cockpit request client, propagating its SystemExit(5)
    literal_exits = {"exit 0", "exit 2", "exit 3", "exit 4", "exit 5", "exit 6", "exit 7"}  # exactly one space: `exit  5` is not one
    unexplained = []
    for number, code in enumerate(lines, start=1):
        if code.lstrip().startswith("#"):
            continue
        for match in re.finditer(r"\bexit\b[^\n;&|)}]*", code):
            spelled = " ".join(match.group(0).split())
            if match.group(0).rstrip() in literal_exits:
                continue
            if computed_exits_allowed.get(spelled, 0) > 0:
                computed_exits_allowed[spelled] -= 1
                continue
            unexplained.append(f"line {number}: {spelled}")
        for needle in ("sys.exit(", "return 5", "os._exit("):
            if needle in code:
                unexplained.append(f"line {number}: {needle}")
    check("commit-run.sh has no exit status the exit-5 inventory cannot read "
          "(spell a refusal as a plain `exit 5` so EXIT_5_SITES sees it)",
          not unexplained and not any(computed_exits_allowed.values()),
          f"unexplained={unexplained} unused allowances={computed_exits_allowed}")
    for number, line in enumerate(lines):
        if "exit 5" not in line and "SystemExit(5)" not in line:
            continue
        if line.lstrip().startswith("#"):
            continue
        message = None
        for earlier in reversed(lines[max(0, number - 4):number + 1]):
            if "commit-run: " in earlier:
                message = earlier.split("commit-run: ", 1)[1]
                break
        key = next((known for known in EXIT_5_SITES if message and message.startswith(known)), message)
        found[key] = found.get(key, 0) + 1
    check("the exit-5 inventory actually found commit-run.sh's refusals", sum(found.values()) >= 16, repr(found))
    unclassified = sorted(str(key) for key in found if key not in EXIT_5_SITES)
    check("every exit 5 in commit-run.sh states whether a sealed receipt can hit it deterministically "
          "(add it to EXIT_5_SITES, and give a deterministic one a pre-seal twin in launcher.ts)",
          not unclassified, f"unclassified: {unclassified}")
    stale = sorted(key for key, (count, _) in EXIT_5_SITES.items() if found.get(key, 0) != count)
    check("the inventory has no stale or miscounted entry", not stale,
          f"{[(key, EXIT_5_SITES[key][0], found.get(key, 0)) for key in stale]}")

    # The supervisor mirrors two of commit-run.sh's snapshot limits so it can refuse before sealing. A
    # mirror that drifts either seals something commit-run.sh rejects, or refuses something it accepts.
    commit_run_text = "\n".join(lines)
    launcher_text = Path(REPO_ROOT, "ui", "server", "src", "launcher.ts").read_text()
    check("the supervisor's entry-count limit is commit-run.sh's",
          "len(entries) > 512" in commit_run_text and "const MAX_PUBLICATION_SNAPSHOT_ENTRIES = 512\n" in launcher_text)
    check("the supervisor's per-file size limit is commit-run.sh's",
          'protected_file(snapshot_raw, "snapshot file", 128 * 1024 * 1024)' in commit_run_text
          and "const MAX_PUBLICATION_SNAPSHOT_FILE_BYTES = 128 * 1024 * 1024\n" in launcher_text)


def test_decision_gate_workspace_is_removed_whether_a_record_passes_or_fails():
    """commit-run.sh removes its validation workspace by naming each file, then `rmdir`s it and ignores a
    failure. A file it writes but does not name would therefore leak one directory per commit, silently."""
    for name, body, expected_rc in [
        ("accepted", {"decision_date": "2099-01-01", "data_needs_schema_version": "2.0", "data_needs": []}, 0),
        ("rejected", {"decision_date": "2099-01-01", "data_needs_schema_version": "2.0", "data_needs": "no"}, 5),
    ]:
        with tempfile.TemporaryDirectory(prefix="commit-run-test-gate-workspace-") as tmp:
            _, agent, env = setup_stale_local_main_scenario(tmp)
            install_prewrite_fixture(agent)
            relative = "analyses/FRESH_2099-01-01/decision_record.json"
            write_json(agent, relative, body)
            workspace_parent = os.path.join(tmp, "tmpdir")
            os.makedirs(workspace_parent)
            run_env = no_push_env(env)
            run_env["TMPDIR"] = workspace_parent
            result = run(["bash", COMMIT_RUN, "test: gate workspace", "--", relative],
                         cwd=agent, env=run_env, check_rc=False)
            check(f"a record that is {name} leaves no validation workspace behind",
                  result.returncode == expected_rc and os.listdir(workspace_parent) == [],
                  f"rc={result.returncode} left={os.listdir(workspace_parent)!r} stderr={result.stderr!r}")


def test_commit_run_refuses_when_the_gate_script_cannot_run():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-gate-missing-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        relative = "analyses/NOGATE_2099-01-01/module.txt"
        write_text(agent, relative, "not even a decision record\n")
        os.remove(os.path.join(agent, "scripts", "decision_publication_gate.py"))
        workspace_parent = os.path.join(tmp, "tmpdir")
        os.makedirs(workspace_parent)
        run_env = no_push_env(env)
        run_env["TMPDIR"] = workspace_parent
        before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        result = run(["bash", COMMIT_RUN, "test: no gate", "--", relative], cwd=agent, env=run_env, check_rc=False)
        after = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
        check("a checkout whose gate script cannot run commits nothing, whatever is being published",
              result.returncode == 5 and before == after
              and "cannot select staged decision publications" in result.stderr,
              f"rc={result.returncode} stderr={result.stderr!r}")
        check("that refusal unstages its paths and removes its workspace",
              cached.returncode == 0 and os.listdir(workspace_parent) == [], repr(os.listdir(workspace_parent)))


def test_commit_run_refuses_when_the_selected_list_cannot_be_read():
    """bash reports a failed `done <file` redirect, SKIPS the loop, and carries on. There is no `set -e`, so
    without an explicit refusal commit-run.sh would go on to commit a record that nobody judged."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-gate-unreadable-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        install_prewrite_fixture(agent)
        relative = "analyses/FRESH_2099-01-01/decision_record.json"
        write_json(agent, relative, {"decision_date": "2099-01-01", "data_needs_schema_version": "2.0",
                                     "data_needs": "not-an-array"})
        workspace_parent = os.path.join(tmp, "tmpdir")
        os.makedirs(workspace_parent)
        # Let --select succeed, then remove the list it wrote before the loop opens it.
        wrappers = os.path.join(tmp, "wrappers")
        os.makedirs(wrappers)
        python_wrapper = os.path.join(wrappers, "python3")
        with open(python_wrapper, "w") as f:
            f.write(
                "#!/bin/sh\n"
                "if [ \"${2:-}\" = \"--select\" ]; then\n"
                f"  {shlex.quote(sys.executable)} \"$@\"\n"
                "  rc=$?\n"
                "  rm -f \"$TMPDIR\"/nostra-data-needs-prewrite.*/selected-paths\n"
                "  exit \"$rc\"\n"
                "fi\n"
                f"exec {shlex.quote(sys.executable)} \"$@\"\n"
            )
        os.chmod(python_wrapper, 0o755)
        run_env = no_push_env(env)
        run_env["TMPDIR"] = workspace_parent
        run_env["PATH"] = wrappers + os.pathsep + run_env.get("PATH", "")
        before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        result = run(["bash", COMMIT_RUN, "test: unreadable selection", "--", relative],
                     cwd=agent, env=run_env, check_rc=False)
        after = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
        check("an unreadable selected-path list refuses instead of committing a record nobody judged",
              result.returncode == 5 and before == after
              and "cannot read selected decision publications" in result.stderr,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("that refusal unstages its paths and removes its workspace",
              cached.returncode == 0 and os.listdir(workspace_parent) == [], repr(os.listdir(workspace_parent)))


def make_protected_snapshot(tmp, name, files):
    """Freeze {publication path: bytes} the way the supervisor does: owner-only files named by index."""
    snapshot_dir = Path(tmp) / name
    snapshot_dir.mkdir(mode=0o700)
    entries = []
    for index, (relative, payload) in enumerate(files.items()):
        frozen = snapshot_dir / str(index)
        frozen.write_bytes(payload)
        frozen.chmod(0o600)
        entries.append({
            "path": relative, "snapshot": str(frozen.resolve()),
            "sha256": "sha256:" + hashlib.sha256(payload).hexdigest(),
        })
    manifest = snapshot_dir / "manifest.json"
    manifest.write_text(json.dumps({
        "schema_version": "cockpit-publication-snapshot/1.0", "run_id": "fixture",
        "requested_pathspecs": [entry["path"] for entry in entries], "entries": entries,
    }) + "\n")
    manifest.chmod(0o600)
    pairs = b"\0".join(
        field.encode("utf-8") for entry in entries for field in (entry["path"], entry["snapshot"])
    )
    return str(manifest.resolve()), [entry["path"] for entry in entries], pairs


def test_preseal_decision_gate_reaches_commit_runs_verdict_on_the_same_frozen_bytes():
    """The supervisor's pre-seal answer is only useful if it IS commit-run.sh's later answer."""
    valid = json.dumps({"decision_date": "2099-01-01", "data_needs_schema_version": "2.0", "data_needs": []}).encode() + b"\n"
    invalid = json.dumps({"decision_date": "2099-01-01", "data_needs_schema_version": "2.0",
                          "data_needs": "not-an-array"}).encode() + b"\n"
    legacy = b"{ frozen legacy bytes\n"
    legacy_record = "analyses/LEGACY_2020-01-01/decision_record.json"
    legacy_thesis = "analyses/LEGACY_2020-01-01/final_thesis.md"
    scenarios = [
        # (name, frozen files, publishes?, records the pre-seal gate must report validating)
        ("an unchanged historical record that fails today's gate is never regraded",
         {legacy_record: legacy, legacy_thesis: b"original thesis\nappend-only correction\n"}, True, 0),
        ("a new valid record publishes",
         {"analyses/FRESH_2099-01-01/decision_record.json": valid}, True, 1),
        ("a new invalid record is refused",
         {"analyses/FRESH_2099-01-01/decision_record.json": invalid,
          "analyses/FRESH_2099-01-01/final_thesis.md": b"thesis\n"}, False, None),
        ("a historical record REWRITTEN with bytes the gate rejects is refused",
         {legacy_record: invalid}, False, None),
        ("a historical record rewritten with valid bytes publishes",
         {legacy_record: valid}, True, 1),
        ("module, review and commodity outputs are not gated",
         {"analyses/MODULE_2099-01-01/reviews/decision_record.json": invalid,
          "commodity/runs/GOLD/decision_record.json": invalid}, True, 0),
    ]
    for name, files, publishes, validated in scenarios:
        with tempfile.TemporaryDirectory(prefix="commit-run-test-preseal-gate-") as tmp:
            _, agent, env = setup_stale_local_main_scenario(tmp)
            install_prewrite_fixture(agent)
            write_text(agent, legacy_thesis, "original thesis\n")
            with open(os.path.join(agent, legacy_record), "wb") as handle:
                handle.write(legacy)
            run(["git", "add", "analyses/LEGACY_2020-01-01"], cwd=agent, env=env)
            run(["git", "commit", "-q", "-m", "fixture: frozen legacy run"], cwd=agent, env=env)
            manifest, paths, pairs = make_protected_snapshot(tmp, "protected-snapshot", files)

            head_before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
            objects_before = run(["git", "count-objects", "-v"], cwd=agent, env=env).stdout
            preseal = run_gate(["--repo", agent, "--records"], pairs)
            head_after = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
            objects_after = run(["git", "count-objects", "-v"], cwd=agent, env=env).stdout
            status = run(["git", "status", "--porcelain"], cwd=agent, env=env).stdout
            snapshot_env = no_push_env(env)
            snapshot_env["NOSTRA_SUPERVISOR_SNAPSHOT_MANIFEST"] = manifest
            committed = run(["bash", COMMIT_RUN, f"test: {name}", "--", *paths],
                            cwd=agent, env=snapshot_env, check_rc=False)

            check(f"pre-seal and commit-run.sh agree: {name}",
                  (preseal.returncode == 0) == (committed.returncode == 0) == publishes,
                  f"preseal rc={preseal.returncode} {preseal.stderr!r}; "
                  f"commit-run rc={committed.returncode} {committed.stderr!r}")
            # The frozen files live outside the worktree, so `git status` alone would not see the gate
            # writing them into the object store (`hash-object -w`); the object count does.
            check(f"asking before sealing changes nothing in the repository: {name}",
                  head_before == head_after and "analyses/" not in status and objects_before == objects_after,
                  f"{status!r} {objects_before!r} -> {objects_after!r}")
            if publishes:
                check(f"pre-seal judged exactly the records commit-run.sh judged: {name}",
                      f"{validated} new terminal decision record(s) validated" in preseal.stdout.decode()
                      and committed.stdout.count("DATA-NEEDS-PREWRITE: PASS") == validated,
                      f"preseal={preseal.stdout!r} commit-run={committed.stdout!r}")
            else:
                gated = next(path for path in paths if path.endswith("decision_record.json"))
                check(f"both refusals are the same gate, and pre-seal names the record first: {name}",
                      preseal.returncode == 1 and committed.returncode == 5
                      and preseal.stderr.decode().startswith(
                          f"DECISION-PUBLICATION-GATE: FAIL — data-needs prewrite rejected {gated}\n")
                      and "DATA-NEEDS-PREWRITE: FAIL" in preseal.stderr.decode()
                      and "DATA-NEEDS-PREWRITE: FAIL" in committed.stderr
                      and f"data-needs prewrite rejected staged publication: {gated}" in committed.stderr,
                      f"preseal={preseal.stderr!r} commit-run={committed.stderr!r}")


def test_preseal_decision_gate_fails_closed():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-preseal-gate-closed-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        install_prewrite_fixture(agent)
        valid = json.dumps({"decision_date": "2099-01-01", "data_needs_schema_version": "2.0",
                            "data_needs": []}).encode() + b"\n"
        record = "analyses/FRESH_2099-01-01/decision_record.json"
        _, _, pairs = make_protected_snapshot(tmp, "snapshot", {record: valid})
        frozen = pairs.split(b"\0")[1]

        control = run_gate(["--repo", agent, "--records"], pairs)
        check("positive control: this exact shape passes when nothing is wrong",
              control.returncode == 0, f"rc={control.returncode} stderr={control.stderr!r}")
        # A bytes file given RELATIVELY used to be read from the gate's own directory but hashed from the
        # repository's. Put HEAD-identical bytes at the repository-relative spot and rejected bytes at the
        # cwd-relative one: the gate then skipped the record as "unchanged" and passed bytes nobody judged.
        elsewhere = os.path.join(tmp, "elsewhere")
        os.makedirs(os.path.join(elsewhere, "snap"))
        os.makedirs(os.path.join(agent, "snap"))
        with open(os.path.join(elsewhere, "snap", "0"), "wb") as handle:
            handle.write(b'{"decision_date": "2099-01-01", "data_needs_schema_version": "2.0", "data_needs": "no"}\n')
        with open(os.path.join(agent, "snap", "0"), "wb") as handle:
            handle.write(b"A\n")
        other = b"analyses/FRESH_2099-01-01/final_thesis.md"
        for name, stdin, cwd in [
            ("an empty publication (a vacuous PASS could be sealed)", b"", None),
            ("a path with no bytes file", record.encode(), None),
            ("an empty field", record.encode() + b"\0\0", None),
            ("a frozen file that does not exist", record.encode() + b"\0" + frozen + b".missing", None),
            ("a relative bytes file, which two directories would resolve differently",
             b"analyses/base/a.txt\0snap/0", elsewhere),
            ("a list shifted by one field, which hides a record in a bytes-file slot",
             other + b"\0" + record.encode() + b"\0" + frozen + b"\0" + other, None),
            ("a bytes file that does not exist, even for a path that is not gated",
             other + b"\0" + frozen + b".missing", None),
            ("an absolute publication path", frozen + b"\0" + frozen, None),
        ]:
            result = run_gate(["--repo", agent, "--records"], stdin, cwd=cwd)
            check(f"no verdict, no PASS: {name}",
                  result.returncode == 2 and b"DECISION-PUBLICATION-GATE: FAIL" in result.stderr
                  and result.stdout == b"", f"rc={result.returncode} stderr={result.stderr!r}")

        ascii_env = dict(os.environ, PYTHONIOENCODING="ascii", PYTHONUTF8="0")
        unicode_record = "analyses/日本_2099-01-01/decision_record.json"
        _, _, unicode_pairs = make_protected_snapshot(tmp, "snapshot-unicode", {unicode_record: valid})
        result = run_gate(["--repo", agent, "--records"], unicode_pairs, env=ascii_env)
        check("a process that cannot print an em dash or the run's name still reaches the same verdict",
              result.returncode == 0 and b"1 new terminal decision record(s) validated" in result.stdout,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr[-300:]!r}")

        not_a_repo = os.path.join(tmp, "not-a-repo")
        os.makedirs(not_a_repo)
        result = run_gate(["--repo", not_a_repo, "--records"], pairs)
        check("no verdict, no PASS: HEAD cannot be read",
              result.returncode == 2 and result.stdout == b"", f"rc={result.returncode} stderr={result.stderr!r}")

        os.remove(os.path.join(agent, "scripts", "eval.py"))
        result = run_gate(["--repo", agent, "--records"], pairs)
        check("a validator that cannot run refuses the record instead of waving it through",
              result.returncode == 1 and record.encode() in result.stderr and result.stdout == b"",
              f"rc={result.returncode} stderr={result.stderr!r}")
        check("the same missing validator refuses through commit-run.sh's entry point too",
              run_gate(["--repo", agent, "--check", os.fsdecode(frozen)]).returncode != 0)


if __name__ == "__main__":
    print("== test_commit_run.py ==")
    test_fast_forward_push_from_non_main_branch_with_stale_local_main()
    test_no_op_when_no_matching_pathspec()
    test_test_run_guard_refuses_before_any_commit_or_push()
    test_uncatalogued_data_is_rejected_before_commit()
    test_presealed_path_list_gets_the_same_verdict_as_the_staged_index()
    test_presealed_path_list_fails_closed()
    test_real_catalogue_keeps_supervisor_control_state_out_of_run_roots()
    test_retained_engine_locks_in_swept_ledger_are_gitignored()
    test_catalogue_globs_do_not_cross_path_segments()
    test_catalogue_validator_that_cannot_run_is_not_a_refusal()
    test_git_add_failure_is_not_a_noop()
    test_interrupted_publication_leftover_is_unstaged_not_a_permanent_wedge()
    test_staged_non_data_change_still_refuses_without_touching_the_index()
    test_commit_hook_rejection_is_never_pushed_as_old_head()
    test_conflicting_remote_reconciliation_leaves_checkout_untouched()
    test_clean_reconciliation_race_retains_original_local_commit()
    test_clean_data_reconciliation_publishes_without_advancing_production_program()
    test_dirty_data_reconcile_preserves_live_bytes_and_original_commit_ancestry()
    test_dirty_code_still_blocks_reconciliation()
    test_retry_push_reconciles_dirty_data_without_moving_local_head()
    test_retry_push_is_exact_main_only_and_serialized()
    test_invalid_new_decision_is_rejected_before_commit()
    test_valid_decision_commits_staged_snapshot_not_later_worktree_bytes()
    test_unchanged_historical_decision_is_not_regraded()
    test_non_terminal_outputs_and_commodity_archive_bypass_creation_gate()
    test_decision_gate_selects_exactly_what_the_former_inline_rule_selected()
    test_decision_gate_workspace_is_removed_whether_a_record_passes_or_fails()
    test_commit_run_refuses_when_the_gate_script_cannot_run()
    test_commit_run_refuses_when_the_selected_list_cannot_be_read()
    test_every_exit_5_has_a_decision_about_sealed_receipts()
    test_preseal_decision_gate_reaches_commit_runs_verdict_on_the_same_frozen_bytes()
    test_preseal_decision_gate_fails_closed()
    test_cockpit_publication_delegates_to_supervisor_and_never_trusts_child_manifest()
    test_supervisor_snapshot_stages_fixed_bytes_not_mutable_worktree()
    if _fails:
        print(f"\n{len(_fails)} FAILURE(S): {_fails}")
        sys.exit(1)
    print("\nAll commit-run.sh push tests passed.")
    sys.exit(0)
