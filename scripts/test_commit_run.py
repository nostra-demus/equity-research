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
import os
import shlex
import shutil
import subprocess
import sys
import tempfile

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
    with open(os.path.join(seed, "a.txt"), "w") as f:
        f.write("A\n")
    run(["git", "add", "a.txt"], cwd=seed, env=env)
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
    for name in ("eval.py", "data_need_contract.py"):
        shutil.copy2(os.path.join(REPO_ROOT, "scripts", name), os.path.join(scripts, name))
    agents = os.path.join(agent, ".claude", "agents", "fixture-module")
    os.makedirs(agents, exist_ok=True)
    with open(os.path.join(agents, "99_fixture-module-synthesis.md"), "w") as f:
        f.write("# Fixture synthesis\n")


def write_json(repo, relative_path, body):
    absolute = os.path.join(repo, relative_path)
    os.makedirs(os.path.dirname(absolute), exist_ok=True)
    with open(absolute, "w") as f:
        json.dump(body, f)
        f.write("\n")
    return absolute


def no_push_env(env):
    result = dict(env)
    result["ENGINE_NO_PUSH"] = "1"
    return result


def test_fast_forward_push_from_non_main_branch_with_stale_local_main():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-") as tmp:
        origin, agent, env = setup_stale_local_main_scenario(tmp)

        # The actual change under test: write a new file and commit it via commit-run.sh,
        # exactly as /research:review-decisions (or any module) does.
        with open(os.path.join(agent, "review.txt"), "w") as f:
            f.write("new decision review\n")

        result = run(
            ["bash", COMMIT_RUN, "test: decision review commit", "--", "review.txt"],
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
        show = run(["git", "show", "origin/main:review.txt"], cwd=agent, env=env, check_rc=False)
        # local origin/main tracking ref may be stale until we re-fetch
        run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
        show = run(["git", "show", "origin/main:review.txt"], cwd=agent, env=env, check_rc=False)
        check(
            "review.txt is present on origin's main branch after the push",
            show.returncode == 0 and "new decision review" in show.stdout,
            f"rc={show.returncode} stdout={show.stdout!r} stderr={show.stderr!r}",
        )

        # And local `main` is untouched — commit-run.sh must not silently mutate branches it
        # isn't asked to touch.
        local_main_after = run(["git", "rev-parse", "main"], cwd=agent, env=env).stdout.strip()
        with open(os.path.join(agent, "a.txt")) as f:
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
            ["bash", COMMIT_RUN, "test: noop", "--", "a.txt"],
            cwd=agent, env=env, check_rc=False,
        )
        check("NOOP path exits 0 when nothing matches the given pathspec", result.returncode == 0, result.stdout)
        check("NOOP path reports NOOP=1", "NOOP=1" in result.stdout, result.stdout)


def test_git_add_failure_is_not_a_noop():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-add-fail-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        result = run(
            ["bash", COMMIT_RUN, "test: bad pathspec", "--", "../outside-repository"],
            cwd=agent, env=env, check_rc=False,
        )
        check("git add failure exits 5 instead of reporting a successful no-op", result.returncode == 5,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("git add failure never emits NOOP or COMMIT_SHA",
              "NOOP=1" not in result.stdout and "COMMIT_SHA=" not in result.stdout, result.stdout)
        cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
        check("git add failure leaves the index empty for the next autonomous run", cached.returncode == 0)


def test_commit_hook_rejection_is_never_pushed_as_old_head():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-commit-fail-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        with open(os.path.join(agent, "rejected.txt"), "w") as f:
            f.write("must not land\n")
        hook = os.path.join(agent, ".git", "hooks", "pre-commit")
        with open(hook, "w") as f:
            f.write("#!/bin/sh\nexit 1\n")
        os.chmod(hook, 0o755)
        before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        result = run(
            ["bash", COMMIT_RUN, "test: rejected commit", "--", "rejected.txt"],
            cwd=agent, env=env, check_rc=False,
        )
        after = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        check("pre-commit rejection exits 5", result.returncode == 5,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("rejected commit leaves HEAD unchanged and emits no success SHA",
              before == after and "COMMIT_SHA=" not in result.stdout, result.stdout)
        remote = run(["git", "show", "origin/main:rejected.txt"], cwd=agent, env=env, check_rc=False)
        check("rejected content is absent from origin/main", remote.returncode != 0, remote.stdout)
        cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
        check("commit-hook rejection unstages this run's paths", cached.returncode == 0)


def test_conflicting_rebase_is_aborted_cleanly():
    """A non-fast-forward with a real content conflict must not leave the shared checkout rebasing."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-conflict-") as tmp:
        env = git_env()
        origin = os.path.join(tmp, "origin.git")
        run(["git", "init", "--bare", "-q", "-b", "main", origin], cwd=tmp, env=env)
        seed = os.path.join(tmp, "seed")
        run(["git", "clone", "-q", origin, seed], cwd=tmp, env=env)
        with open(os.path.join(seed, "shared.ndjson"), "w") as f:
            f.write('{"side":"base"}\n')
        run(["git", "add", "shared.ndjson"], cwd=seed, env=env)
        run(["git", "commit", "-q", "-m", "base"], cwd=seed, env=env)
        run(["git", "push", "-q", "origin", "main"], cwd=seed, env=env)

        agent = os.path.join(tmp, "agent")
        run(["git", "clone", "-q", origin, agent], cwd=tmp, env=env)
        run(["git", "checkout", "-q", "-b", "session"], cwd=agent, env=env)

        with open(os.path.join(seed, "shared.ndjson"), "w") as f:
            f.write('{"side":"remote"}\n')
        run(["git", "add", "shared.ndjson"], cwd=seed, env=env)
        run(["git", "commit", "-q", "-m", "remote conflict"], cwd=seed, env=env)
        run(["git", "push", "-q", "origin", "main"], cwd=seed, env=env)

        with open(os.path.join(agent, "shared.ndjson"), "w") as f:
            f.write('{"side":"local"}\n')
        result = run(
            ["bash", COMMIT_RUN, "test: local conflict", "--", "shared.ndjson"],
            cwd=agent, env=env, check_rc=False,
        )
        head = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        reported = next((line.split("=", 1)[1] for line in result.stdout.splitlines()
                         if line.startswith("COMMIT_SHA=")), "")
        check("a conflicting rebase exits 4 and reports the retained local commit",
              result.returncode == 4 and reported == head,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("conflicting rebase is explicitly reported as safely aborted",
              "safely aborted" in result.stderr, result.stderr)
        check("no rebase-merge/rebase-apply directory survives the failure",
              not os.path.exists(git_internal_path(agent, "rebase-merge", env))
              and not os.path.exists(git_internal_path(agent, "rebase-apply", env)))
        unmerged = run(["git", "ls-files", "-u"], cwd=agent, env=env)
        cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
        local_blob = run(["git", "show", "HEAD:shared.ndjson"], cwd=agent, env=env)
        check("abort restores a clean index with no unmerged entries",
              unmerged.stdout == "" and cached.returncode == 0,
              f"unmerged={unmerged.stdout!r}")
        check("abort restores HEAD to the local commit rather than losing its data",
              '"side":"local"' in local_blob.stdout, local_blob.stdout)


def test_clean_rebase_second_push_race_retains_rebased_commit():
    """If a second remote move beats the retry, keep the cleanly rebased commit and say so."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-second-race-") as tmp:
        origin, agent, env = setup_stale_local_main_scenario(tmp)
        racer = os.path.join(tmp, "racer")
        run(["git", "clone", "-q", origin, racer], cwd=tmp, env=env)
        with open(os.path.join(racer, "remote-race.txt"), "w") as f:
            f.write("remote moved\n")
        run(["git", "add", "remote-race.txt"], cwd=racer, env=env)
        run(["git", "commit", "-q", "-m", "remote race"], cwd=racer, env=env)
        run(["git", "push", "-q", "origin", "main"], cwd=racer, env=env)

        # Both commit-run pushes are rejected by this hook. The first still reaches fetch/rebase,
        # which is clean because the changes are in different files; the second exercises the race.
        hook = os.path.join(origin, "hooks", "pre-receive")
        with open(hook, "w") as f:
            f.write("#!/bin/sh\nexit 1\n")
        os.chmod(hook, 0o755)
        with open(os.path.join(agent, "local-race.txt"), "w") as f:
            f.write("local survives\n")
        result = run(
            ["bash", COMMIT_RUN, "test: second push race", "--", "local-race.txt"],
            cwd=agent, env=env, check_rc=False,
        )
        head = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        reported = next((line.split("=", 1)[1] for line in result.stdout.splitlines()
                         if line.startswith("COMMIT_SHA=")), "")
        ancestor = run(["git", "merge-base", "--is-ancestor", "origin/main", "HEAD"],
                       cwd=agent, env=env, check_rc=False)
        local_blob = run(["git", "show", "HEAD:local-race.txt"], cwd=agent, env=env, check_rc=False)
        remote_blob = run(["git", "show", "HEAD:remote-race.txt"], cwd=agent, env=env, check_rc=False)
        check("clean rebase plus second push rejection exits 4 with the rebased SHA",
              result.returncode == 4 and reported == head and "rebase succeeded" in result.stderr,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("rebased local commit retains both the remote move and this run's data",
              ancestor.returncode == 0 and local_blob.returncode == 0 and remote_blob.returncode == 0)
        check("clean second-push failure leaves no rebase state",
              not os.path.exists(git_internal_path(agent, "rebase-merge", env))
              and not os.path.exists(git_internal_path(agent, "rebase-apply", env)))


def test_retry_push_is_exact_main_only_and_serialized():
    """An ambiguous local commit can be retried without staging another commit or bypassing safety."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-retry-") as tmp:
        env = git_env()
        origin = os.path.join(tmp, "origin.git")
        run(["git", "init", "--bare", "-q", "-b", "main", origin], cwd=tmp, env=env)
        agent = os.path.join(tmp, "agent")
        run(["git", "clone", "-q", origin, agent], cwd=tmp, env=env)
        with open(os.path.join(agent, "base.txt"), "w") as f:
            f.write("base\n")
        run(["git", "add", "base.txt"], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "base"], cwd=agent, env=env)
        run(["git", "push", "-q", "origin", "main"], cwd=agent, env=env)
        with open(os.path.join(agent, "pending.txt"), "w") as f:
            f.write("pending\n")
        run(["git", "add", "pending.txt"], cwd=agent, env=env)
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


if __name__ == "__main__":
    print("== test_commit_run.py ==")
    test_fast_forward_push_from_non_main_branch_with_stale_local_main()
    test_no_op_when_no_matching_pathspec()
    test_git_add_failure_is_not_a_noop()
    test_commit_hook_rejection_is_never_pushed_as_old_head()
    test_conflicting_rebase_is_aborted_cleanly()
    test_clean_rebase_second_push_race_retains_rebased_commit()
    test_retry_push_is_exact_main_only_and_serialized()
    test_invalid_new_decision_is_rejected_before_commit()
    test_valid_decision_commits_staged_snapshot_not_later_worktree_bytes()
    test_unchanged_historical_decision_is_not_regraded()
    test_non_terminal_outputs_and_commodity_archive_bypass_creation_gate()
    if _fails:
        print(f"\n{len(_fails)} FAILURE(S): {_fails}")
        sys.exit(1)
    print("\nAll commit-run.sh push tests passed.")
    sys.exit(0)
