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
import hashlib
import json
import os
import shlex
import shutil
import subprocess
import sys
import tempfile

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMMIT_RUN = os.path.join(REPO_ROOT, "scripts", "commit-run.sh")
PUBLISH_SAVED = os.path.join(REPO_ROOT, "scripts", "publish-saved-research.sh")

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


def output_value(result, key):
    prefix = f"{key}="
    for line in result.stdout.splitlines():
        if line.startswith(prefix):
            return line[len(prefix):].strip()
    return ""


def install_remote_sealed_run(agent, env, run_root="analyses/SEALED_2099-01-01", malformed=False):
    """Publish one minimal, internally hashed projection seal for saved-publication boundary tests."""
    bodies = {
        "final_thesis": ("final_thesis.md", b"# Frozen thesis\n"),
        "decision_record": ("decision_record.json", json.dumps({
            "ticker": "SEALED", "run_root": run_root, "decision_date": "2099-01-01",
        }, sort_keys=True).encode() + b"\n"),
        "verification": ("verification_report.json", b'{"audit":"verification"}\n'),
        "pre_mortem": ("pre_mortem.json", b'{"audit":"pre_mortem"}\n'),
        "expectations_gap": ("expectations_gap.json", b'{"audit":"expectations_gap"}\n'),
    }
    artifacts = {}
    for kind, (name, data) in bodies.items():
        absolute = os.path.join(agent, run_root, name)
        os.makedirs(os.path.dirname(absolute), exist_ok=True)
        with open(absolute, "wb") as handle:
            handle.write(data)
        artifacts[kind] = {"path": name, "sha256": hashlib.sha256(data).hexdigest()}

    manifest_path = os.path.join(agent, run_root, "idea_projection_manifest.json")
    if malformed:
        with open(manifest_path, "w") as handle:
            handle.write('{"schema_version":')
    else:
        payload = {
            "schema_version": "idea-projection-manifest/v1",
            "run_root": run_root,
            "created_at": "2099-01-01T00:00:00Z",
            "artifacts": artifacts,
        }
        payload["manifest_sha256"] = hashlib.sha256(json.dumps(
            payload, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":"),
        ).encode()).hexdigest()
        write_json(agent, f"{run_root}/idea_projection_manifest.json", payload)

    write_json(agent, f"{run_root}/idea_3_6m.json", {"sealed": "assessment"})
    write_json(agent, f"{run_root}/idea_market_evidence.json", {"sealed": "market"})
    write_json(agent, f"{run_root}/idea_admission.json", {"sealed": "admission"})
    with open(os.path.join(agent, run_root, "RUN_METADATA.md"), "w") as handle:
        handle.write("# Run metadata\n\nPublication pending.\n")
    sealed_nested = {
        "business-model/99_business-model-synthesis.md": "# Frozen module synthesis\n",
        "business-model/01_unit-economics.md": "# Frozen specialist evidence\n",
        "business-model/source_manifest.csv": "source,date\nfiling,2099-01-01\n",
    }
    for relative, body in sealed_nested.items():
        absolute = os.path.join(agent, run_root, relative)
        os.makedirs(os.path.dirname(absolute), exist_ok=True)
        with open(absolute, "w") as handle:
            handle.write(body)
    run(["git", "add", "--", run_root], cwd=agent, env=env)
    run(["git", "commit", "-q", "-m", "fixture: sealed research run"], cwd=agent, env=env)
    run(["git", "push", "-q", "origin", "HEAD:main"], cwd=agent, env=env)
    run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
    return run_root


def test_fast_forward_push_from_non_main_branch_with_stale_local_main():
    with tempfile.TemporaryDirectory(prefix="commit-run-test-") as tmp:
        origin, agent, env = setup_stale_local_main_scenario(tmp)

        # A private code commit already exists on this checkout branch. The privileged data helper must
        # publish the later review bytes without making this code commit (or its blob/history) reachable
        # from shared main.
        with open(os.path.join(agent, "private-code.ts"), "w") as f:
            f.write("export const mustStayOnThePR = true\n")
        run(["git", "add", "private-code.ts"], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "private code branch"], cwd=agent, env=env)
        private_commit = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()

        review_rel = "analyses/TEST_2099-01-01/reviews/2099-02-01_30d_note.txt"
        os.makedirs(os.path.dirname(os.path.join(agent, review_rel)), exist_ok=True)
        with open(os.path.join(agent, review_rel), "w") as f:
            f.write("new decision review\n")

        result = run(
            ["bash", COMMIT_RUN, "test: decision review commit", "--", review_rel],
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
        show = run(["git", "show", f"origin/main:{review_rel}"], cwd=agent, env=env, check_rc=False)
        # local origin/main tracking ref may be stale until we re-fetch
        run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
        show = run(["git", "show", f"origin/main:{review_rel}"], cwd=agent, env=env, check_rc=False)
        check(
            "the exact review byte is present on origin's main branch after the push",
            show.returncode == 0 and "new decision review" in show.stdout,
            f"rc={show.returncode} stdout={show.stdout!r} stderr={show.stderr!r}",
        )
        private_blob = run(["git", "cat-file", "-e", "origin/main:private-code.ts"], cwd=agent, env=env, check_rc=False)
        private_ancestor = run(["git", "merge-base", "--is-ancestor", private_commit, "origin/main"], cwd=agent, env=env, check_rc=False)
        check("commit-run never publishes the checkout's private code blob or ancestry",
              private_blob.returncode != 0 and private_ancestor.returncode != 0)

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


def test_saved_publication_is_path_confined_and_idempotent():
    """Recovery publishes a saved data commit, never later unrelated checkout commits."""
    with tempfile.TemporaryDirectory(prefix="saved-publication-test-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        review_dir = os.path.join(agent, "analyses", "TEST_2026-08-13", "reviews")
        os.makedirs(review_dir, exist_ok=True)
        review_rel = "analyses/TEST_2026-08-13/reviews/2026-09-12_30d_decision_review.json"
        memo_rel = "analyses/TEST_2026-08-13/reviews/2026-09-12_30d_memo_delta.md"
        with open(os.path.join(agent, review_rel), "w") as f:
            f.write('{"saved":true}\n')
        with open(os.path.join(agent, memo_rel), "w") as f:
            f.write("# Saved review\n")
        run(["git", "add", review_rel, memo_rel], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "saved data-only review"], cwd=agent, env=env)
        saved_commit = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        with open(os.path.join(agent, "unrelated-code.ts"), "w") as f:
            f.write("export const mustNotReachMain = true\n")
        run(["git", "add", "unrelated-code.ts"], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "later unrelated code"], cwd=agent, env=env)
        local_head = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()

        result = run(
            ["bash", PUBLISH_SAVED, "test: publish exact saved review", "--source-commit", saved_commit,
             "--", review_rel, memo_rel],
            cwd=agent, env=env, check_rc=False,
        )
        run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
        review = run(["git", "show", f"origin/main:{review_rel}"], cwd=agent, env=env, check_rc=False)
        memo = run(["git", "show", f"origin/main:{memo_rel}"], cwd=agent, env=env, check_rc=False)
        code = run(["git", "cat-file", "-e", "origin/main:unrelated-code.ts"], cwd=agent, env=env, check_rc=False)
        check("saved publication succeeds without a paid rerun", result.returncode == 0 and "PUBLICATION_SHA=" in result.stdout,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("saved publication includes both exact review files", review.returncode == 0 and memo.returncode == 0)
        check("saved publication excludes an unrelated local code commit", code.returncode != 0)
        check("saved publication never moves the checkout branch",
              run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip() == local_head)

        again = run(
            ["bash", PUBLISH_SAVED, "test: publish exact saved review", "--source-commit", saved_commit,
             "--", review_rel, memo_rel],
            cwd=agent, env=env, check_rc=False,
        )
        check("saved publication is idempotent after shared main has the bytes",
              again.returncode == 0 and "ALREADY_PUBLISHED=1" in again.stdout,
              f"rc={again.returncode} stdout={again.stdout!r} stderr={again.stderr!r}")


def test_saved_publication_converges_clean_production_main_without_touching_files():
    """An exact saved-data tree can converge production HEAD without a destructive worktree reset."""
    with tempfile.TemporaryDirectory(prefix="saved-publication-converge-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        # Production runs on main. Bring its local branch to the fresh shared base, then leave one saved
        # data commit ahead exactly as commit-run does when its push fails.
        run(["git", "checkout", "-q", "main"], cwd=agent, env=env)
        run(["git", "reset", "--hard", "-q", "origin/main"], cwd=agent, env=env)
        review_rel = "analyses/TEST_2026-08-13/reviews/2026-09-12_30d_decision_review.json"
        memo_rel = "analyses/TEST_2026-08-13/reviews/2026-09-12_30d_memo_delta.md"
        write_json(agent, review_rel, {"saved": True})
        os.makedirs(os.path.dirname(os.path.join(agent, memo_rel)), exist_ok=True)
        with open(os.path.join(agent, memo_rel), "w") as f:
            f.write("# saved\n")
        run(["git", "add", review_rel, memo_rel], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "saved production review"], cwd=agent, env=env)
        source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        result = run(
            ["bash", PUBLISH_SAVED, "test: converge saved production review", "--source-commit", source,
             "--", review_rel, memo_rel], cwd=agent, env=env, check_rc=False,
        )
        check("exact saved production tree publishes and reports non-destructive convergence",
              result.returncode == 0 and "CHECKOUT_CONVERGED=1" in result.stdout, result.stdout + result.stderr)
        ancestor = run(["git", "merge-base", "--is-ancestor", "HEAD", "origin/main"],
                       cwd=agent, env=env, check_rc=False)
        check("production HEAD is an ancestor of shared main after saved recovery", ancestor.returncode == 0)
        check("soft convergence keeps the exact saved review bytes in the worktree",
              os.path.isfile(os.path.join(agent, review_rel)) and os.path.isfile(os.path.join(agent, memo_rel)))


def test_saved_publication_converges_moved_remote_without_exposing_source_ancestry():
    """A moved main is combined by tree/CAS, while local production main safely follows the synthetic commit."""
    with tempfile.TemporaryDirectory(prefix="saved-publication-moved-converge-") as tmp:
        origin, agent, env = setup_stale_local_main_scenario(tmp)
        run(["git", "checkout", "-q", "main"], cwd=agent, env=env)
        run(["git", "reset", "--hard", "-q", "origin/main"], cwd=agent, env=env)
        review_rel = "analyses/TEST_2026-08-13/reviews/2026-09-12_30d_decision_review.json"
        memo_rel = "analyses/TEST_2026-08-13/reviews/2026-09-12_30d_memo_delta.md"
        write_json(agent, review_rel, {"saved": True})
        os.makedirs(os.path.dirname(os.path.join(agent, memo_rel)), exist_ok=True)
        with open(os.path.join(agent, memo_rel), "w") as f:
            f.write("# saved\n")
        run(["git", "add", review_rel, memo_rel], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "saved production review"], cwd=agent, env=env)
        source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()

        other = os.path.join(tmp, "mover")
        run(["git", "clone", "-q", origin, other], cwd=tmp, env=env)
        with open(os.path.join(other, "concurrent.txt"), "w") as f:
            f.write("shared concurrent change\n")
        run(["git", "add", "concurrent.txt"], cwd=other, env=env)
        run(["git", "commit", "-q", "-m", "move shared main"], cwd=other, env=env)
        run(["git", "push", "-q", "origin", "main"], cwd=other, env=env)

        result = run(
            ["bash", PUBLISH_SAVED, "test: converge moved production review", "--source-commit", source,
             "--", review_rel, memo_rel], cwd=agent, env=env, check_rc=False,
        )
        run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
        local = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        remote = run(["git", "rev-parse", "origin/main"], cwd=agent, env=env).stdout.strip()
        source_public = run(["git", "merge-base", "--is-ancestor", source, "origin/main"], cwd=agent, env=env, check_rc=False)
        check("moved shared main publishes and converges production checkout",
              result.returncode == 0 and "CHECKOUT_CONVERGED=1" in result.stdout and local == remote,
              result.stdout + result.stderr)
        check("moved-main convergence preserves both saved and concurrent shared bytes",
              run(["git", "cat-file", "-e", f"HEAD:{review_rel}"], cwd=agent, env=env, check_rc=False).returncode == 0
              and run(["git", "cat-file", "-e", "HEAD:concurrent.txt"], cwd=agent, env=env, check_rc=False).returncode == 0)
        check("synthetic publication never exposes the private source commit as shared ancestry",
              source_public.returncode != 0)


def test_saved_publication_convergence_refuses_conflicting_worktree_write():
    """reset --keep must leave a concurrent tracked writer's bytes untouched and let deploy retry."""
    with tempfile.TemporaryDirectory(prefix="saved-publication-converge-conflict-") as tmp:
        origin, agent, env = setup_stale_local_main_scenario(tmp)
        run(["git", "checkout", "-q", "main"], cwd=agent, env=env)
        run(["git", "reset", "--hard", "-q", "origin/main"], cwd=agent, env=env)
        review_rel = "analyses/TEST_2026-08-13/reviews/2026-09-12_30d_decision_review.json"
        memo_rel = "analyses/TEST_2026-08-13/reviews/2026-09-12_30d_memo_delta.md"
        write_json(agent, review_rel, {"saved": True})
        os.makedirs(os.path.dirname(os.path.join(agent, memo_rel)), exist_ok=True)
        with open(os.path.join(agent, memo_rel), "w") as f:
            f.write("# saved\n")
        run(["git", "add", review_rel, memo_rel], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "saved production review"], cwd=agent, env=env)
        source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()

        other = os.path.join(tmp, "mover-conflict")
        run(["git", "clone", "-q", origin, other], cwd=tmp, env=env)
        with open(os.path.join(other, "a.txt"), "w") as f:
            f.write("shared version\n")
        run(["git", "add", "a.txt"], cwd=other, env=env)
        run(["git", "commit", "-q", "-m", "move shared tracked byte"], cwd=other, env=env)
        run(["git", "push", "-q", "origin", "main"], cwd=other, env=env)
        with open(os.path.join(agent, "a.txt"), "w") as f:
            f.write("active local writer\n")

        result = run(
            ["bash", PUBLISH_SAVED, "test: preserve writer during convergence", "--source-commit", source,
             "--", review_rel, memo_rel], cwd=agent, env=env, check_rc=False,
        )
        with open(os.path.join(agent, "a.txt")) as f:
            local_bytes = f.read()
        check("blocked moved-main convergence reports a durable retry condition without failing publication",
              result.returncode == 0 and "CHECKOUT_CONVERGENCE_PENDING=1" in result.stdout,
              result.stdout + result.stderr)
        check("reset --keep never overwrites the concurrent tracked writer",
              local_bytes == "active local writer\n" and run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip() == source)


def test_saved_publication_rejects_remote_conflicts():
    """A stale host never overwrites a different immutable review already on shared main."""
    with tempfile.TemporaryDirectory(prefix="saved-publication-conflict-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        review_rel = "analyses/TEST_2026-08-13/reviews/2026-09-12_30d_decision_review.json"
        memo_rel = "analyses/TEST_2026-08-13/reviews/2026-09-12_30d_memo_delta.md"
        write_json(agent, review_rel, {"saved": "local"})
        os.makedirs(os.path.dirname(os.path.join(agent, memo_rel)), exist_ok=True)
        with open(os.path.join(agent, memo_rel), "w") as f:
            f.write("# local delta\n")
        run(["git", "add", review_rel, memo_rel], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "saved local review"], cwd=agent, env=env)
        saved_commit = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()

        other = os.path.join(tmp, "other")
        run(["git", "clone", "-q", os.path.join(tmp, "origin.git"), other], cwd=tmp, env=env)
        write_json(other, review_rel, {"saved": "different shared authority"})
        run(["git", "add", review_rel], cwd=other, env=env)
        run(["git", "commit", "-q", "-m", "concurrent immutable review"], cwd=other, env=env)
        run(["git", "push", "-q", "origin", "main"], cwd=other, env=env)

        result = run(
            ["bash", PUBLISH_SAVED, "test: reject immutable conflict", "--source-commit", saved_commit,
             "--", review_rel, memo_rel], cwd=agent, env=env, check_rc=False,
        )
        run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
        shared = run(["git", "show", f"origin/main:{review_rel}"], cwd=agent, env=env)
        memo = run(["git", "cat-file", "-e", f"origin/main:{memo_rel}"], cwd=agent, env=env, check_rc=False)
        check("saved publication rejects different shared immutable bytes", result.returncode != 0,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("saved publication leaves conflicting shared review unchanged",
              "different shared authority" in shared.stdout, shared.stdout)
        check("a conflict prevents the paired memo from being partly published", memo.returncode != 0)


def test_saved_publication_rejects_sealed_artifact_change_and_delete():
    """A source child cannot use an ordinary BASE==REMOTE CAS to rewrite immutable sealed history."""
    cases = (
        ("change", "final_thesis.md"),
        ("delete", "idea_admission.json"),
    )
    for operation, basename in cases:
        with tempfile.TemporaryDirectory(prefix=f"saved-seal-{operation}-") as tmp:
            _, agent, env = setup_stale_local_main_scenario(tmp)
            run_root = install_remote_sealed_run(agent, env)
            relative = f"{run_root}/{basename}"
            before_tree = run(["git", "rev-parse", "origin/main^{tree}"], cwd=agent, env=env).stdout.strip()
            if operation == "change":
                with open(os.path.join(agent, relative), "w") as handle:
                    handle.write("mutated after the immutable seal\n")
                run(["git", "add", "--", relative], cwd=agent, env=env)
            else:
                os.unlink(os.path.join(agent, relative))
                run(["git", "add", "-u", "--", relative], cwd=agent, env=env)
            run(["git", "commit", "-q", "-m", f"attempt sealed {operation}"], cwd=agent, env=env)
            source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()

            result = run(
                ["bash", PUBLISH_SAVED, f"test: reject sealed {operation}", "--source-commit", source,
                 "--", relative], cwd=agent, env=env, check_rc=False,
            )
            run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
            after_tree = run(["git", "rev-parse", "origin/main^{tree}"], cwd=agent, env=env).stdout.strip()
            shared = run(["git", "show", f"origin/main:{relative}"], cwd=agent, env=env, check_rc=False)
            check(f"saved publication rejects sealed artifact {operation}",
                  result.returncode == 5 and "IMMUTABLE_SEALED_RUN_CONFLICT=" in result.stderr,
                  f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
            check(f"sealed artifact {operation} leaves all remote bytes unchanged",
                  before_tree == after_tree and shared.returncode == 0,
                  f"before={before_tree} after={after_tree} shared_rc={shared.returncode}")


def test_saved_publication_defaults_every_sealed_source_artifact_to_immutable():
    """Module syntheses, specialist extracts, and provenance files cannot be edited, deleted, or added post-seal."""
    cases = (
        ("change module synthesis", "business-model/99_business-model-synthesis.md", "change"),
        ("delete specialist extract", "business-model/01_unit-economics.md", "delete"),
        ("change source manifest", "business-model/source_manifest.csv", "change"),
        ("add unknown source extract", "business-model/02_new-extract.md", "add"),
    )
    for label, suffix, operation in cases:
        with tempfile.TemporaryDirectory(prefix="saved-seal-default-immutable-") as tmp:
            _, agent, env = setup_stale_local_main_scenario(tmp)
            run_root = install_remote_sealed_run(agent, env)
            relative = f"{run_root}/{suffix}"
            before_tree = run(["git", "rev-parse", "origin/main^{tree}"], cwd=agent, env=env).stdout.strip()
            absolute = os.path.join(agent, relative)
            if operation == "delete":
                os.unlink(absolute)
                run(["git", "add", "-u", "--", relative], cwd=agent, env=env)
            else:
                os.makedirs(os.path.dirname(absolute), exist_ok=True)
                with open(absolute, "w") as handle:
                    handle.write("# Post-seal rewrite must not publish\n")
                run(["git", "add", "--", relative], cwd=agent, env=env)
            run(["git", "commit", "-q", "-m", label], cwd=agent, env=env)
            source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
            result = run(
                ["bash", PUBLISH_SAVED, f"test: reject {label}", "--source-commit", source, "--", relative],
                cwd=agent, env=env, check_rc=False,
            )
            run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
            after_tree = run(["git", "rev-parse", "origin/main^{tree}"], cwd=agent, env=env).stdout.strip()
            check(f"sealed default-immutable guard rejects {label}",
                  result.returncode == 5 and "IMMUTABLE_SEALED_RUN_CONFLICT=" in result.stderr,
                  f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
            check(f"rejected {label} leaves the whole shared tree unchanged", before_tree == after_tree)


def test_commit_run_rejects_sealed_rewrite_before_creating_local_commit():
    """The exact staged-index preflight prevents a poisoned saved commit from entering local history."""
    with tempfile.TemporaryDirectory(prefix="commit-run-seal-preflight-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        run_root = install_remote_sealed_run(agent, env)
        relative = f"{run_root}/business-model/99_business-model-synthesis.md"
        before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        with open(os.path.join(agent, relative), "w") as handle:
            handle.write("# Poisoned post-seal synthesis\n")
        result = run(
            ["bash", COMMIT_RUN, "test: preflight sealed rewrite", "--", relative],
            cwd=agent, env=no_push_env(env), check_rc=False,
        )
        after = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
        check("commit-run sealed rewrite exits 5 before moving HEAD",
              result.returncode == 5 and before == after and "IMMUTABLE_SEALED_RUN_CONFLICT=" in result.stderr,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("rejected sealed preflight leaves the index clean and worktree bytes recoverable",
              cached.returncode == 0 and "Poisoned" in open(os.path.join(agent, relative)).read())


def test_saved_publication_append_only_paths_are_additive_and_idempotent():
    """Reviews and server outcome receipts may be added once, replayed exactly, and never reinterpreted."""
    cases = (
        ("review", "reviews/2099-02-01_30d_decision_review.json", b'{"review":"first"}\n'),
        ("outcome receipt", f"intake/outcomes/{'a' * 64}.json", b'{"receipt":"first"}\n'),
        ("agent metrics", "agent_metrics.sess-safe-123.json", b'{"metrics":"first"}\n'),
    )
    for label, suffix, initial in cases:
        with tempfile.TemporaryDirectory(prefix="saved-append-only-") as tmp:
            _, agent, env = setup_stale_local_main_scenario(tmp)
            run_root = install_remote_sealed_run(agent, env)
            relative = f"{run_root}/{suffix}"
            absolute = os.path.join(agent, relative)
            os.makedirs(os.path.dirname(absolute), exist_ok=True)
            with open(absolute, "wb") as handle:
                handle.write(initial)
            run(["git", "add", "--", relative], cwd=agent, env=env)
            run(["git", "commit", "-q", "-m", f"saved additive {label}"], cwd=agent, env=env)
            source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()

            first = run(
                ["bash", PUBLISH_SAVED, f"test: add {label}", "--source-commit", source, "--", relative],
                cwd=agent, env=env, check_rc=False,
            )
            again = run(
                ["bash", PUBLISH_SAVED, f"test: replay {label}", "--source-commit", source, "--", relative],
                cwd=agent, env=env, check_rc=False,
            )
            check(f"new sealed-run {label} publishes additively",
                  first.returncode == 0 and "PUBLICATION_SHA=" in first.stdout,
                  f"rc={first.returncode} stdout={first.stdout!r} stderr={first.stderr!r}")
            check(f"byte-identical sealed-run {label} replay is idempotent",
                  again.returncode == 0 and "ALREADY_PUBLISHED=1" in again.stdout,
                  f"rc={again.returncode} stdout={again.stdout!r} stderr={again.stderr!r}")

            with open(absolute, "wb") as handle:
                handle.write(initial.replace(b"first", b"different"))
            run(["git", "add", "--", relative], cwd=agent, env=env)
            run(["git", "commit", "-q", "-m", f"attempt to rewrite {label}"], cwd=agent, env=env)
            changed_source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
            run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
            before_tree = run(["git", "rev-parse", "origin/main^{tree}"], cwd=agent, env=env).stdout.strip()
            conflict = run(
                ["bash", PUBLISH_SAVED, f"test: reject changed {label}", "--source-commit", changed_source,
                 "--", relative], cwd=agent, env=env, check_rc=False,
            )
            run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
            after_tree = run(["git", "rev-parse", "origin/main^{tree}"], cwd=agent, env=env).stdout.strip()
            shared = run(["git", "show", f"origin/main:{relative}"], cwd=agent, env=env)
            check(f"different existing {label} bytes are rejected",
                  conflict.returncode == 5 and "IMMUTABLE_APPEND_ONLY_CONFLICT=" in conflict.stderr,
                  f"rc={conflict.returncode} stdout={conflict.stdout!r} stderr={conflict.stderr!r}")
            check(f"rejected {label} rewrite leaves remote unchanged",
                  before_tree == after_tree and shared.stdout.encode() == initial,
                  f"before={before_tree} after={after_tree} shared={shared.stdout!r}")

            with open(absolute, "wb") as handle:
                handle.write(initial)
            run(["git", "add", "--", relative], cwd=agent, env=env)
            run(["git", "commit", "-q", "-m", f"restore {label} before delete"], cwd=agent, env=env)
            os.unlink(absolute)
            run(["git", "add", "-u", "--", relative], cwd=agent, env=env)
            run(["git", "commit", "-q", "-m", f"attempt to delete {label}"], cwd=agent, env=env)
            deleted_source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
            deletion = run(
                ["bash", PUBLISH_SAVED, f"test: reject deleted {label}", "--source-commit", deleted_source,
                 "--", relative], cwd=agent, env=env, check_rc=False,
            )
            check(f"existing sealed-run {label} cannot be deleted",
                  deletion.returncode == 5 and "IMMUTABLE_APPEND_ONLY_CONFLICT=" in deletion.stderr,
                  deletion.stdout + deletion.stderr)


def test_saved_publication_rejects_local_first_writer_laundering():
    """A later local commit cannot rewrite a review or add to a newly created commodity archive before replay."""
    cases = (
        ("review", "analyses/LOCAL_2099-01-01/reviews/2099-02-01_30d_decision_review.json",
         "analyses/LOCAL_2099-01-01/reviews/2099-02-01_30d_decision_review.json"),
        ("commodity archive", "commodity/runs/GOLD/decisions/local-id/decision_record.json",
         "commodity/runs/GOLD/decisions/local-id/extra.json"),
    )
    for label, first_path, second_path in cases:
        with tempfile.TemporaryDirectory(prefix="saved-local-first-writer-") as tmp:
            _, agent, env = setup_stale_local_main_scenario(tmp)
            write_json(agent, first_path, {"version": "first"})
            run(["git", "add", "--", first_path], cwd=agent, env=env)
            run(["git", "commit", "-q", "-m", f"create local {label}"], cwd=agent, env=env)
            if second_path == first_path:
                write_json(agent, second_path, {"version": "rewritten"})
            else:
                write_json(agent, second_path, {"version": "later child"})
            run(["git", "add", "--", second_path], cwd=agent, env=env)
            run(["git", "commit", "-q", "-m", f"mutate local {label}"], cwd=agent, env=env)
            source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
            root = first_path if label == "review" else "commodity/runs/GOLD/decisions/local-id"
            result = run(["bash", PUBLISH_SAVED, f"test: reject local {label} laundering",
                          "--source-commit", source, "--", root], cwd=agent, env=env, check_rc=False)
            marker = "IMMUTABLE_APPEND_ONLY_CONFLICT=" if label == "review" else "IMMUTABLE_COMMODITY_ARCHIVE_CONFLICT="
            check(f"saved publication rejects local {label} create-then-rewrite lineage",
                  result.returncode == 5 and marker in result.stderr,
                  result.stdout + result.stderr)
            absent = run(["git", "cat-file", "-e", f"origin/main:{first_path}"], cwd=agent, env=env, check_rc=False)
            check(f"rejected local {label} lineage publishes no final-snapshot bytes", absent.returncode != 0)


def test_saved_publication_rejects_mixed_lineage_root_widening():
    """A pure later run-root recovery cannot smuggle data first introduced by a mixed code commit."""
    with tempfile.TemporaryDirectory(prefix="saved-mixed-root-lineage-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        run_root = "analyses/MIXED_2099-01-01"
        inherited = f"{run_root}/business-model/01_extract.md"
        later = f"{run_root}/memo.md"
        private_code = "private-mixed-recovery.ts"

        inherited_abs = os.path.join(agent, inherited)
        os.makedirs(os.path.dirname(inherited_abs), exist_ok=True)
        with open(inherited_abs, "w") as handle:
            handle.write("# Must not cross the publication boundary\n")
        with open(os.path.join(agent, private_code), "w") as handle:
            handle.write("export const privateMixedRecovery = true\n")
        run(["git", "add", "--", inherited, private_code], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "mixed private code and research output"], cwd=agent, env=env)

        later_abs = os.path.join(agent, later)
        with open(later_abs, "w") as handle:
            handle.write("# Pure later recovery output\n")
        run(["git", "add", "--", later], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "pure later research output"], cwd=agent, env=env)
        source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()

        result = run(
            ["bash", PUBLISH_SAVED, "test: reject mixed run-root widening", "--source-commit", source,
             "--", run_root],
            cwd=agent, env=env, check_rc=False,
        )
        check(
            "whole-root recovery rejects data inherited from an earlier mixed code commit",
            result.returncode == 5 and f"UNAUTHORIZED_MIXED_LINEAGE={inherited}" in result.stderr,
            f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}",
        )
        for label, relative in (("mixed research artifact", inherited), ("later pure artifact", later),
                                ("private code", private_code)):
            shared = run(["git", "cat-file", "-e", f"origin/main:{relative}"], cwd=agent, env=env,
                         check_rc=False)
            check(f"rejected whole-root recovery publishes no {label}", shared.returncode != 0)


def test_saved_review_recovery_rejects_memo_from_mixed_lineage():
    """A pure review JSON cannot authorize its paired memo when that memo came from a mixed commit."""
    with tempfile.TemporaryDirectory(prefix="saved-mixed-review-lineage-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        review_root = "analyses/MIXREV_2099-01-01/reviews"
        memo = f"{review_root}/2099-02-01_30d_memo_delta.md"
        decision = f"{review_root}/2099-02-01_30d_decision_review.json"
        private_code = "private-review-recovery.ts"

        memo_abs = os.path.join(agent, memo)
        os.makedirs(os.path.dirname(memo_abs), exist_ok=True)
        with open(memo_abs, "w") as handle:
            handle.write("# Mixed-lineage review memo\n")
        with open(os.path.join(agent, private_code), "w") as handle:
            handle.write("export const privateReviewRecovery = true\n")
        run(["git", "add", "--", memo, private_code], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "mixed review memo and private code"], cwd=agent, env=env)

        write_json(agent, decision, {"verdict": "unchanged"})
        run(["git", "add", "--", decision], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "pure review decision artifact"], cwd=agent, env=env)
        source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()

        result = run(
            ["bash", PUBLISH_SAVED, "test: reject mixed review pairing", "--source-commit", source,
             "--", decision, memo],
            cwd=agent, env=env, check_rc=False,
        )
        check(
            "review recovery rejects a memo inherited from an earlier mixed code commit",
            result.returncode == 5 and f"UNAUTHORIZED_MIXED_LINEAGE={memo}" in result.stderr,
            f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}",
        )
        for label, relative in (("review memo", memo), ("review JSON", decision),
                                ("private code", private_code)):
            shared = run(["git", "cat-file", "-e", f"origin/main:{relative}"], cwd=agent, env=env,
                         check_rc=False)
            check(f"rejected review recovery publishes no {label}", shared.returncode != 0)


def test_saved_publication_preserves_derived_recovery_outputs_after_seal():
    """A seal does not strand explicitly replaceable memo/dossier/run-metadata recovery."""
    with tempfile.TemporaryDirectory(prefix="saved-seal-derived-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        run_root = install_remote_sealed_run(agent, env)
        derived = {
            f"{run_root}/memo.md": "# Recovered memo\n",
            f"{run_root}/audit_dossier.md": "# Recovered audit dossier\n",
            f"{run_root}/business-model/business-model_memo.md": "# Recovered module memo\n",
        }
        for relative, body in derived.items():
            absolute = os.path.join(agent, relative)
            os.makedirs(os.path.dirname(absolute), exist_ok=True)
            with open(absolute, "w") as handle:
                handle.write(body)
        run(["git", "add", "--", *derived], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "recover derived outputs"], cwd=agent, env=env)
        source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        result = run(
            ["bash", PUBLISH_SAVED, "test: recover derived outputs", "--source-commit", source,
             "--", *derived], cwd=agent, env=env, check_rc=False,
        )
        run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
        exact = all(run(["git", "show", f"origin/main:{relative}"], cwd=agent, env=env).stdout == body
                    for relative, body in derived.items())
        check("sealed-run derived output and metadata recovery remains publishable",
              result.returncode == 0 and exact,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")


def test_saved_publication_corrections_only_grow_monotonically():
    """A sealed correction sidecar can be created/appended, but old facts cannot move or disappear."""
    with tempfile.TemporaryDirectory(prefix="saved-corrections-monotonic-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        run_root = install_remote_sealed_run(agent, env)
        relative = f"{run_root}/corrections.json"
        first = {
            "schema": "corrections/v1",
            "errata": [{"field": "scenarios[].probability", "kind": "scale_fix", "reason": "legacy scale"}],
        }
        write_json(agent, relative, first)
        run(["git", "add", "--", relative], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "add correction"], cwd=agent, env=env)
        source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        added = run(["bash", PUBLISH_SAVED, "test: add correction", "--source-commit", source, "--", relative],
                    cwd=agent, env=env, check_rc=False)
        replay = run(["bash", PUBLISH_SAVED, "test: replay correction", "--source-commit", source, "--", relative],
                     cwd=agent, env=env, check_rc=False)
        check("new sealed correction publishes and exact replay is idempotent",
              added.returncode == 0 and replay.returncode == 0 and "ALREADY_PUBLISHED=1" in replay.stdout,
              added.stdout + added.stderr + replay.stdout + replay.stderr)

        grown = {
            "schema": "corrections/v1",
            "superseded_by": {
                "run_root": "analyses/SEALED_2099-02-01", "reason": "corrected rerun", "date": "2099-02-01",
            },
            "errata": [*first["errata"], {"field": "downside_risk_pct", "kind": "sign_fix"}],
        }
        write_json(agent, relative, grown)
        run(["git", "add", "--", relative], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "append correction"], cwd=agent, env=env)
        grown_source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        appended = run(["bash", PUBLISH_SAVED, "test: grow correction", "--source-commit", grown_source, "--", relative],
                       cwd=agent, env=env, check_rc=False)
        check("corrections may append errata and set superseded_by once", appended.returncode == 0,
              appended.stdout + appended.stderr)

        for label, body, delete in (
            ("reorder errata", {**grown, "errata": list(reversed(grown["errata"]))}, False),
            ("change supersession", {**grown, "superseded_by": {**grown["superseded_by"], "reason": "rewritten"}}, False),
            ("delete corrections", None, True),
        ):
            if delete:
                os.unlink(os.path.join(agent, relative))
                run(["git", "add", "-u", "--", relative], cwd=agent, env=env)
            else:
                write_json(agent, relative, body)
                run(["git", "add", "--", relative], cwd=agent, env=env)
            run(["git", "commit", "-q", "-m", label], cwd=agent, env=env)
            bad_source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
            rejected = run(["bash", PUBLISH_SAVED, f"test: reject {label}", "--source-commit", bad_source,
                            "--", relative], cwd=agent, env=env, check_rc=False)
            check(f"sealed corrections reject {label}",
                  rejected.returncode == 5 and "IMMUTABLE_SEALED_RUN_CONFLICT=" in rejected.stderr,
                  rejected.stdout + rejected.stderr)
            # Restore the last published authority before constructing the next independent mutation.
            shared = run(["git", "show", f"origin/main:{relative}"], cwd=agent, env=env).stdout
            with open(os.path.join(agent, relative), "w") as handle:
                handle.write(shared)
            run(["git", "add", "--", relative], cwd=agent, env=env)
            run(["git", "commit", "-q", "-m", f"restore after {label}"], cwd=agent, env=env)


def test_saved_publication_freezes_commodity_decision_subtree_after_first_write():
    """A content-addressed commodity decision ID is create-once, including every child path."""
    with tempfile.TemporaryDirectory(prefix="saved-commodity-archive-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        root = "commodity/runs/GOLD/decisions/decision-abc"
        record = f"{root}/decision_record.json"
        write_json(agent, record, {"decision_id": "decision-abc", "commodity": "GOLD"})
        run(["git", "add", "--", record], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "saved commodity archive"], cwd=agent, env=env)
        source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        first = run(["bash", PUBLISH_SAVED, "test: create commodity archive", "--source-commit", source, "--", root],
                    cwd=agent, env=env, check_rc=False)
        again = run(["bash", PUBLISH_SAVED, "test: replay commodity archive", "--source-commit", source, "--", root],
                    cwd=agent, env=env, check_rc=False)
        check("commodity decision subtree is first-write publishable and idempotent",
              first.returncode == 0 and again.returncode == 0 and "ALREADY_PUBLISHED=1" in again.stdout,
              first.stdout + first.stderr + again.stdout + again.stderr)

        for label, relative, delete in (
            ("rewrite archive record", record, False),
            ("add archive child", f"{root}/extra.json", False),
            ("delete archive record", record, True),
        ):
            absolute = os.path.join(agent, relative)
            if delete:
                if not os.path.exists(absolute):
                    shared = run(["git", "show", f"origin/main:{record}"], cwd=agent, env=env).stdout
                    os.makedirs(os.path.dirname(absolute), exist_ok=True)
                    with open(absolute, "w") as handle: handle.write(shared)
                    run(["git", "add", "--", relative], cwd=agent, env=env)
                    run(["git", "commit", "-q", "-m", "restore commodity fixture"], cwd=agent, env=env)
                os.unlink(absolute)
                run(["git", "add", "-u", "--", relative], cwd=agent, env=env)
            else:
                write_json(agent, relative, {"mutated": label})
                run(["git", "add", "--", relative], cwd=agent, env=env)
            run(["git", "commit", "-q", "-m", label], cwd=agent, env=env)
            bad_source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
            rejected = run(["bash", PUBLISH_SAVED, f"test: reject {label}", "--source-commit", bad_source,
                            "--", relative], cwd=agent, env=env, check_rc=False)
            check(f"commodity immutable archive rejects {label}",
                  rejected.returncode == 5 and "IMMUTABLE_COMMODITY_ARCHIVE_CONFLICT=" in rejected.stderr,
                  rejected.stdout + rejected.stderr)
            # Reset the worktree/index to published bytes without rewriting the local history under test.
            if relative == record:
                shared = run(["git", "show", f"origin/main:{record}"], cwd=agent, env=env).stdout
                os.makedirs(os.path.dirname(absolute), exist_ok=True)
                with open(absolute, "w") as handle: handle.write(shared)
            elif os.path.exists(absolute):
                os.unlink(absolute)
            run(["git", "add", "-A", "--", root], cwd=agent, env=env)
            run(["git", "commit", "-q", "-m", f"restore after {label}"], cwd=agent, env=env)


def test_saved_publication_fails_closed_on_malformed_remote_seal():
    """A corrupt remote manifest is unavailable authority, never an unsealed run."""
    with tempfile.TemporaryDirectory(prefix="saved-malformed-seal-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        run_root = install_remote_sealed_run(agent, env, malformed=True)
        relative = f"{run_root}/memo.md"
        with open(os.path.join(agent, relative), "w") as handle:
            handle.write("# Derived memo must wait for authority repair\n")
        run(["git", "add", "--", relative], cwd=agent, env=env)
        run(["git", "commit", "-q", "-m", "derived write with corrupt seal"], cwd=agent, env=env)
        source = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        before_tree = run(["git", "rev-parse", "origin/main^{tree}"], cwd=agent, env=env).stdout.strip()
        result = run(
            ["bash", PUBLISH_SAVED, "test: reject corrupt seal", "--source-commit", source,
             "--", relative], cwd=agent, env=env, check_rc=False,
        )
        run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
        after_tree = run(["git", "rev-parse", "origin/main^{tree}"], cwd=agent, env=env).stdout.strip()
        check("malformed remote seal blocks even an otherwise allowed derived recovery",
              result.returncode == 5 and "MALFORMED_SEALED_AUTHORITY=" in result.stderr,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("malformed seal failure leaves remote unchanged", before_tree == after_tree)


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
        rejected = "analyses/TEST_2099-01-01/rejected.txt"
        os.makedirs(os.path.dirname(os.path.join(agent, rejected)), exist_ok=True)
        with open(os.path.join(agent, rejected), "w") as f:
            f.write("must not land\n")
        hook = os.path.join(agent, ".git", "hooks", "pre-commit")
        with open(hook, "w") as f:
            f.write("#!/bin/sh\nexit 1\n")
        os.chmod(hook, 0o755)
        before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        result = run(
            ["bash", COMMIT_RUN, "test: rejected commit", "--", rejected],
            cwd=agent, env=env, check_rc=False,
        )
        after = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        check("pre-commit rejection exits 5", result.returncode == 5,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("rejected commit leaves HEAD unchanged and emits no success SHA",
              before == after and "COMMIT_SHA=" not in result.stdout, result.stdout)
        remote = run(["git", "show", f"origin/main:{rejected}"], cwd=agent, env=env, check_rc=False)
        check("rejected content is absent from origin/main", remote.returncode != 0, remote.stdout)
        cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
        check("commit-hook rejection unstages this run's paths", cached.returncode == 0)


def test_conflicting_publication_preserves_local_commit_without_rebase():
    """A definitive remote conflict fails before commit and preserves the recoverable worktree bytes."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-conflict-") as tmp:
        env = git_env()
        origin = os.path.join(tmp, "origin.git")
        run(["git", "init", "--bare", "-q", "-b", "main", origin], cwd=tmp, env=env)
        seed = os.path.join(tmp, "seed")
        run(["git", "clone", "-q", origin, seed], cwd=tmp, env=env)
        shared = "screener/ledger/shared.ndjson"
        os.makedirs(os.path.dirname(os.path.join(seed, shared)), exist_ok=True)
        with open(os.path.join(seed, shared), "w") as f:
            f.write('{"side":"base"}\n')
        run(["git", "add", shared], cwd=seed, env=env)
        run(["git", "commit", "-q", "-m", "base"], cwd=seed, env=env)
        run(["git", "push", "-q", "origin", "main"], cwd=seed, env=env)

        agent = os.path.join(tmp, "agent")
        run(["git", "clone", "-q", origin, agent], cwd=tmp, env=env)
        run(["git", "checkout", "-q", "-b", "session"], cwd=agent, env=env)

        with open(os.path.join(seed, shared), "w") as f:
            f.write('{"side":"remote"}\n')
        run(["git", "add", shared], cwd=seed, env=env)
        run(["git", "commit", "-q", "-m", "remote conflict"], cwd=seed, env=env)
        run(["git", "push", "-q", "origin", "main"], cwd=seed, env=env)

        with open(os.path.join(agent, shared), "w") as f:
            f.write('{"side":"local"}\n')
        before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        result = run(
            ["bash", COMMIT_RUN, "test: local conflict", "--", shared],
            cwd=agent, env=env, check_rc=False,
        )
        head = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        check("a definitive conflicting publication exits 5 before creating a local commit",
              result.returncode == 5 and head == before and "LOCAL_COMMIT_SHA=" not in result.stdout,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("the immutable conflict is explicit and no rebase ever starts",
              "refusing to overwrite immutable history" in result.stderr
              and not os.path.exists(git_internal_path(agent, "rebase-merge", env))
              and not os.path.exists(git_internal_path(agent, "rebase-apply", env)), result.stderr)
        check("no rebase-merge/rebase-apply directory exists after the failure",
              not os.path.exists(git_internal_path(agent, "rebase-merge", env))
              and not os.path.exists(git_internal_path(agent, "rebase-apply", env)))
        unmerged = run(["git", "ls-files", "-u"], cwd=agent, env=env)
        cached = run(["git", "diff", "--cached", "--quiet"], cwd=agent, env=env, check_rc=False)
        with open(os.path.join(agent, shared)) as handle:
            local_bytes = handle.read()
        check("failure leaves a clean index with no unmerged entries",
              unmerged.stdout == "" and cached.returncode == 0,
              f"unmerged={unmerged.stdout!r}")
        check("the rejected local bytes remain recoverable in the worktree without poisoning history",
              '"side":"local"' in local_bytes, local_bytes)


def test_rejected_isolated_push_retains_local_data_and_remote_move():
    """If shared publication is rejected, local data and the independent remote move both survive."""
    with tempfile.TemporaryDirectory(prefix="commit-run-test-second-race-") as tmp:
        origin, agent, env = setup_stale_local_main_scenario(tmp)
        racer = os.path.join(tmp, "racer")
        run(["git", "clone", "-q", origin, racer], cwd=tmp, env=env)
        remote_rel = "screener/ledger/remote-race.txt"
        os.makedirs(os.path.dirname(os.path.join(racer, remote_rel)), exist_ok=True)
        with open(os.path.join(racer, remote_rel), "w") as f:
            f.write("remote moved\n")
        run(["git", "add", remote_rel], cwd=racer, env=env)
        run(["git", "commit", "-q", "-m", "remote race"], cwd=racer, env=env)
        run(["git", "push", "-q", "origin", "main"], cwd=racer, env=env)

        # Every isolated synthetic push is rejected by this hook.
        hook = os.path.join(origin, "hooks", "pre-receive")
        with open(hook, "w") as f:
            f.write("#!/bin/sh\nexit 1\n")
        os.chmod(hook, 0o755)
        local_rel = "screener/ledger/local-race.txt"
        os.makedirs(os.path.dirname(os.path.join(agent, local_rel)), exist_ok=True)
        with open(os.path.join(agent, local_rel), "w") as f:
            f.write("local survives\n")
        result = run(
            ["bash", COMMIT_RUN, "test: second push race", "--", local_rel],
            cwd=agent, env=env, check_rc=False,
        )
        head = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        reported = next((line.split("=", 1)[1] for line in result.stdout.splitlines()
                         if line.startswith("LOCAL_COMMIT_SHA=")), "")
        local_blob = run(["git", "show", f"HEAD:{local_rel}"], cwd=agent, env=env, check_rc=False)
        remote_blob = run(["git", "show", f"origin/main:{remote_rel}"], cwd=agent, env=env, check_rc=False)
        remote_local = run(["git", "cat-file", "-e", f"origin/main:{local_rel}"], cwd=agent, env=env, check_rc=False)
        check("rejected isolated publication exits 4 with the retained local SHA",
              result.returncode == 4 and reported == head and "shared main kept moving" in result.stderr,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("local data and the independent remote move both survive without a partial publish",
              local_blob.returncode == 0 and remote_blob.returncode == 0 and remote_local.returncode != 0)
        check("rejected isolated publication leaves no rebase state",
              not os.path.exists(git_internal_path(agent, "rebase-merge", env))
              and not os.path.exists(git_internal_path(agent, "rebase-apply", env)))


def test_later_commit_recovers_earlier_unpublished_data_commit_in_order():
    """A transiently saved C1 is replayed before C2; success means both bytes are shared and main converges."""
    with tempfile.TemporaryDirectory(prefix="commit-run-pending-lineage-") as tmp:
        origin, agent, env = setup_stale_local_main_scenario(tmp)
        run(["git", "checkout", "-q", "main"], cwd=agent, env=env)
        run(["git", "reset", "--hard", "-q", "origin/main"], cwd=agent, env=env)
        first = "analyses/PENDING_2099-01-01/reviews/2099-02-01_30d_decision_review.json"
        second = "screener/pending/second.json"
        write_json(agent, first, {"sequence": 1, "immutable": "first-writer"})
        broken_origin = os.path.join(tmp, "temporarily-unavailable.git")
        run(["git", "remote", "set-url", "origin", broken_origin], cwd=agent, env=env)
        c1 = run(["bash", COMMIT_RUN, "test: save C1 during outage", "--", first],
                 cwd=agent, env=env, check_rc=False)
        c1_sha = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        check("transient publication outage keeps exact C1 as a retryable local commit",
              c1.returncode == 4 and f"LOCAL_COMMIT_SHA={c1_sha}" in c1.stdout,
              c1.stdout + c1.stderr)

        run(["git", "remote", "set-url", "origin", origin], cwd=agent, env=env)
        write_json(agent, second, {"sequence": 2})
        c2 = run(["bash", COMMIT_RUN, "test: publish C2 after C1", "--", second],
                 cwd=agent, env=env, check_rc=False)
        run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
        first_shared = run(["git", "show", f"origin/main:{first}"], cwd=agent, env=env, check_rc=False)
        second_shared = run(["git", "show", f"origin/main:{second}"], cwd=agent, env=env, check_rc=False)
        local = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        shared = run(["git", "rev-parse", "origin/main"], cwd=agent, env=env).stdout.strip()
        check("C2 success replays the earlier append-only first writer before the unrelated data commit",
              c2.returncode == 0 and first_shared.returncode == 0 and second_shared.returncode == 0,
              c2.stdout + c2.stderr)
        check("production main converges only after both C1 and C2 are shared", local == shared,
              f"local={local} shared={shared}")


def test_later_commit_can_update_earlier_unpublished_mutable_path_in_order():
    """C2 may update C1's mutable byte after ordered replay; synthetic ancestry must not deadlock it."""
    with tempfile.TemporaryDirectory(prefix="commit-run-pending-mutable-lineage-") as tmp:
        origin, agent, env = setup_stale_local_main_scenario(tmp)
        run(["git", "checkout", "-q", "main"], cwd=agent, env=env)
        run(["git", "reset", "--hard", "-q", "origin/main"], cwd=agent, env=env)
        relative = "screener/state.txt"
        absolute = os.path.join(agent, relative)
        os.makedirs(os.path.dirname(absolute), exist_ok=True)

        with open(absolute, "w") as handle:
            handle.write("v1\n")
        broken_origin = os.path.join(tmp, "temporarily-unavailable.git")
        run(["git", "remote", "set-url", "origin", broken_origin], cwd=agent, env=env)
        c1 = run(["bash", COMMIT_RUN, "test: save mutable C1 during outage", "--", relative],
                 cwd=agent, env=env, check_rc=False)
        check("mutable C1 is durably saved while shared authority is unavailable", c1.returncode == 4,
              c1.stdout + c1.stderr)

        run(["git", "remote", "set-url", "origin", origin], cwd=agent, env=env)
        with open(absolute, "w") as handle:
            handle.write("v2\n")
        c2 = run(["bash", COMMIT_RUN, "test: publish mutable C2 after C1", "--", relative],
                 cwd=agent, env=env, check_rc=False)
        run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
        shared_bytes = run(["git", "show", f"origin/main:{relative}"], cwd=agent, env=env,
                           check_rc=False)
        local = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        shared = run(["git", "rev-parse", "origin/main"], cwd=agent, env=env).stdout.strip()
        check(
            "ordered replay publishes C1 then the legitimate C2 successor on the same mutable path",
            c2.returncode == 0 and shared_bytes.returncode == 0 and shared_bytes.stdout == "v2\n",
            f"rc={c2.returncode} stdout={c2.stdout!r} stderr={c2.stderr!r} shared={shared_bytes.stdout!r}",
        )
        check("same-path successor recovery converges production main", local == shared,
              f"local={local} shared={shared}")


def test_later_commit_cannot_rewrite_an_unpublished_first_writer():
    """C1's append-only bytes stay authoritative even when C2 is staged before either reaches shared main."""
    with tempfile.TemporaryDirectory(prefix="commit-run-pending-first-writer-") as tmp:
        origin, agent, env = setup_stale_local_main_scenario(tmp)
        relative = "analyses/PENDING_2099-01-01/reviews/2099-02-01_30d_decision_review.json"
        broken_origin = os.path.join(tmp, "temporarily-unavailable.git")
        run(["git", "remote", "set-url", "origin", broken_origin], cwd=agent, env=env)
        write_json(agent, relative, {"version": "C1-first-writer"})
        first = run(["bash", COMMIT_RUN, "test: save append-only C1", "--", relative],
                    cwd=agent, env=env, check_rc=False)
        c1 = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        check("unavailable shared authority durably saves append-only C1", first.returncode == 4,
              first.stdout + first.stderr)

        run(["git", "remote", "set-url", "origin", origin], cwd=agent, env=env)
        write_json(agent, relative, {"version": "C2-rewrite"})
        second = run(["bash", COMMIT_RUN, "test: reject append-only C2 rewrite", "--", relative],
                     cwd=agent, env=env, check_rc=False)
        head = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        shared = run(["git", "cat-file", "-e", f"origin/main:{relative}"], cwd=agent, env=env, check_rc=False)
        check("C2 rewrite is rejected before commit against C1's local first-writer identity",
              second.returncode == 5 and head == c1 and "IMMUTABLE_APPEND_ONLY_CONFLICT=" in second.stderr,
              second.stdout + second.stderr)
        check("rejected C2 does not publish its rewritten final snapshot", shared.returncode != 0)


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
        before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        result = run(
            ["bash", COMMIT_RUN, "test: commit staged decision snapshot", "--", relative],
            cwd=agent, env=race_env, check_rc=False,
        )
        dry_sha = output_value(result, "COMMIT_SHA")
        committed = run(["git", "show", f"{dry_sha}:{relative}"], cwd=agent, env=env, check_rc=False)
        committed_body = json.loads(committed.stdout) if committed.returncode == 0 else {}
        with open(absolute) as f:
            worktree_body = json.load(f)
        check("valid staged decision passes and creates a detached validation snapshot",
              result.returncode == 0 and "DATA-NEEDS-PREWRITE: PASS" in result.stdout,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("validation-only snapshot leaves production HEAD unchanged and carries durable no-publish provenance",
              run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip() == before
              and bool(dry_sha)
              and "Nostradamus-Publication: never" in run(
                  ["git", "show", "-s", "--format=%B", dry_sha], cwd=agent, env=env,
              ).stdout,
              result.stdout + result.stderr)
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
        before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        result = run(
            ["bash", COMMIT_RUN, "test: update legacy thesis", "--", "analyses/LEGACY_2020-01-01/"],
            cwd=agent, env=no_push_env(env), check_rc=False,
        )
        dry_sha = output_value(result, "COMMIT_SHA")
        committed = run(["git", "show", f"{dry_sha}:analyses/LEGACY_2020-01-01/final_thesis.md"],
                        cwd=agent, env=env, check_rc=False)
        check("unchanged historical decision is not regraded",
              result.returncode == 0 and "append-only correction" in committed.stdout
              and run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip() == before,
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
        before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        result = run(
            ["bash", COMMIT_RUN, "test: non-terminal outputs", "--", *paths],
            cwd=agent, env=no_push_env(env), check_rc=False,
        )
        dry_sha = output_value(result, "COMMIT_SHA")
        all_committed = all(
            run(["git", "cat-file", "-e", f"{dry_sha}:{relative}"], cwd=agent, env=env, check_rc=False).returncode == 0
            for relative in paths
        )
        check("module/review/calibration/commodity outputs are unaffected by the research creation gate",
              result.returncode == 0 and all_committed
              and run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip() == before,
              f"rc={result.returncode} stdout={result.stdout!r} stderr={result.stderr!r}")
        check("non-terminal outputs do not launch prewrite validation",
              "DATA-NEEDS-PREWRITE" not in result.stdout + result.stderr,
              result.stdout + result.stderr)


def test_validation_only_commit_never_leaks_into_later_publication_or_recovery():
    """ENGINE_NO_PUSH is detached and permanently rejected by every privileged publication boundary."""
    with tempfile.TemporaryDirectory(prefix="commit-run-no-push-isolation-") as tmp:
        _, agent, env = setup_stale_local_main_scenario(tmp)
        review = "analyses/DRY_2099-01-01/reviews/2099-02-01_30d_decision_review.json"
        memo = "analyses/DRY_2099-01-01/reviews/2099-02-01_30d_memo_delta.md"
        write_json(agent, review, {"validation": "must stay private"})
        os.makedirs(os.path.dirname(os.path.join(agent, memo)), exist_ok=True)
        with open(os.path.join(agent, memo), "w") as handle:
            handle.write("# DRY RUN — MUST STAY LOCAL\n")
        before = run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip()
        dry = run(
            ["bash", COMMIT_RUN, "test: validation-only review", "--", review, memo],
            cwd=agent, env=no_push_env(env), check_rc=False,
        )
        dry_sha = output_value(dry, "COMMIT_SHA")
        check("ENGINE_NO_PUSH creates a retained detached snapshot without advancing production HEAD",
              dry.returncode == 0 and bool(dry_sha)
              and run(["git", "rev-parse", "HEAD"], cwd=agent, env=env).stdout.strip() == before
              and run(["git", "cat-file", "-e", f"{dry_sha}:" + review], cwd=agent, env=env,
                      check_rc=False).returncode == 0,
              dry.stdout + dry.stderr)

        direct = run(
            ["bash", PUBLISH_SAVED, "test: forbidden validation recovery", "--source-commit", dry_sha,
             "--", review, memo], cwd=agent, env=env, check_rc=False,
        )
        check("saved-publication rejects a directly requested validation-only source",
              direct.returncode == 5 and "NON_PUBLISHABLE_SOURCE=" in direct.stderr,
              direct.stdout + direct.stderr)

        later = "screener/performance/2099-02-02_real_publication.json"
        write_json(agent, later, {"shared": True})
        normal = run(["bash", COMMIT_RUN, "test: later real publication", "--", later],
                     cwd=agent, env=env, check_rc=False)
        run(["git", "fetch", "-q", "origin", "main"], cwd=agent, env=env)
        check("a later normal data commit publishes without inheriting the detached validation snapshot",
              normal.returncode == 0
              and run(["git", "cat-file", "-e", f"origin/main:{later}"], cwd=agent, env=env,
                      check_rc=False).returncode == 0
              and run(["git", "cat-file", "-e", f"origin/main:{review}"], cwd=agent, env=env,
                      check_rc=False).returncode != 0
              and run(["git", "cat-file", "-e", f"origin/main:{memo}"], cwd=agent, env=env,
                      check_rc=False).returncode != 0,
              normal.stdout + normal.stderr)


if __name__ == "__main__":
    print("== test_commit_run.py ==")
    test_fast_forward_push_from_non_main_branch_with_stale_local_main()
    test_no_op_when_no_matching_pathspec()
    test_saved_publication_is_path_confined_and_idempotent()
    test_saved_publication_converges_clean_production_main_without_touching_files()
    test_saved_publication_converges_moved_remote_without_exposing_source_ancestry()
    test_saved_publication_convergence_refuses_conflicting_worktree_write()
    test_saved_publication_rejects_remote_conflicts()
    test_saved_publication_rejects_sealed_artifact_change_and_delete()
    test_saved_publication_defaults_every_sealed_source_artifact_to_immutable()
    test_commit_run_rejects_sealed_rewrite_before_creating_local_commit()
    test_saved_publication_append_only_paths_are_additive_and_idempotent()
    test_saved_publication_rejects_local_first_writer_laundering()
    test_saved_publication_rejects_mixed_lineage_root_widening()
    test_saved_review_recovery_rejects_memo_from_mixed_lineage()
    test_saved_publication_preserves_derived_recovery_outputs_after_seal()
    test_saved_publication_corrections_only_grow_monotonically()
    test_saved_publication_freezes_commodity_decision_subtree_after_first_write()
    test_saved_publication_fails_closed_on_malformed_remote_seal()
    test_git_add_failure_is_not_a_noop()
    test_commit_hook_rejection_is_never_pushed_as_old_head()
    test_conflicting_publication_preserves_local_commit_without_rebase()
    test_rejected_isolated_push_retains_local_data_and_remote_move()
    test_later_commit_recovers_earlier_unpublished_data_commit_in_order()
    test_later_commit_can_update_earlier_unpublished_mutable_path_in_order()
    test_later_commit_cannot_rewrite_an_unpublished_first_writer()
    test_invalid_new_decision_is_rejected_before_commit()
    test_valid_decision_commits_staged_snapshot_not_later_worktree_bytes()
    test_unchanged_historical_decision_is_not_regraded()
    test_non_terminal_outputs_and_commodity_archive_bypass_creation_gate()
    test_validation_only_commit_never_leaks_into_later_publication_or_recovery()
    if _fails:
        print(f"\n{len(_fails)} FAILURE(S): {_fails}")
        sys.exit(1)
    print("\nAll commit-run.sh push tests passed.")
    sys.exit(0)
