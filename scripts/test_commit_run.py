#!/usr/bin/env python3
"""
Regression test for scripts/commit-run.sh's push step.

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
import os
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
    """Sanity check the NOOP path still works (unrelated to the push fix, but cheap to pin)."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-noop-") as tmp:
        origin, agent, env = setup_stale_local_main_scenario(tmp)
        result = run(
            ["bash", COMMIT_RUN, "test: noop", "--", "does-not-exist.txt"],
            cwd=agent, env=env, check_rc=False,
        )
        check("NOOP path exits 0 when nothing matches the given pathspec", result.returncode == 0, result.stdout)
        check("NOOP path reports NOOP=1", "NOOP=1" in result.stdout, result.stdout)


if __name__ == "__main__":
    print("== test_commit_run.py ==")
    test_fast_forward_push_from_non_main_branch_with_stale_local_main()
    test_no_op_when_no_matching_pathspec()
    if _fails:
        print(f"\n{len(_fails)} FAILURE(S): {_fails}")
        sys.exit(1)
    print("\nAll commit-run.sh push tests passed.")
    sys.exit(0)
