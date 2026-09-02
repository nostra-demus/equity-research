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
    run(["git", "add", "analyses/base/a.txt", "scripts/validate_data_catalogue.py",
         "frameworks/memory/phase0/catalogue.json"], cwd=seed, env=env)
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


def install_catalogue_fixture(repo, patterns=None):
    """Install the real validator with a small committed catalogue for isolated Git fixtures."""
    scripts = os.path.join(repo, "scripts")
    os.makedirs(scripts, exist_ok=True)
    shutil.copy2(
        os.path.join(REPO_ROOT, "scripts", "validate_data_catalogue.py"),
        os.path.join(scripts, "validate_data_catalogue.py"),
    )
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
        check("uncatalogued staged data exits 5 before commit",
              result.returncode == 5 and before == after and absent.returncode != 0,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("catalogue rejection names the missing artifact and leaves the index clean",
              relative in result.stderr and "DATA-CATALOGUE: FAIL" in result.stderr
              and cached.returncode == 0,
              result.stderr)


def test_catalogue_globs_do_not_cross_path_segments():
    paths = ["watchlist/entries/archive/x.json", "analyses/TEST/module/nested/memo.md"]
    patterns = ["watchlist/entries/*.json", "analyses/*/*/*.md"]
    missing = uncovered_paths(paths, patterns)
    check("catalogue '*' cannot hide a deeper undeclared artifact", missing == paths, str(missing))


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
        run(["git", "add", shared_path, "scripts/validate_data_catalogue.py",
             "frameworks/memory/phase0/catalogue.json"], cwd=seed, env=env)
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
    run(["git", "add", "screener/board/live.json", "base.txt",
         "scripts/validate_data_catalogue.py", "frameworks/memory/phase0/catalogue.json"],
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
        run(["git", "add", "base.txt", "scripts/validate_data_catalogue.py",
             "frameworks/memory/phase0/catalogue.json"], cwd=agent, env=env)
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


if __name__ == "__main__":
    print("== test_commit_run.py ==")
    test_fast_forward_push_from_non_main_branch_with_stale_local_main()
    test_no_op_when_no_matching_pathspec()
    test_uncatalogued_data_is_rejected_before_commit()
    test_catalogue_globs_do_not_cross_path_segments()
    test_git_add_failure_is_not_a_noop()
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
    test_cockpit_publication_delegates_to_supervisor_and_never_trusts_child_manifest()
    test_supervisor_snapshot_stages_fixed_bytes_not_mutable_worktree()
    if _fails:
        print(f"\n{len(_fails)} FAILURE(S): {_fails}")
        sys.exit(1)
    print("\nAll commit-run.sh push tests passed.")
    sys.exit(0)
