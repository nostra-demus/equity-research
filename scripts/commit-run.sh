#!/usr/bin/env bash
# Serialize ALL engine commits to `main` across concurrent runs.
#
# The cockpit can now run several companies at once, each writing its own
# analyses/<TICKER>_<date>/ folder in the SAME worktree. Their final commits must
# not collide on .git/index.lock or race the push, so every committing command
# routes its git through this one helper. Python applies a kernel flock to a stable
# file inside this worktree's Git directory. We commit ONLY the given git pathspecs and never autostash, so one
# run's commit can't sweep in another run's in-flight files.
#
# Usage:  commit-run.sh "<commit message>" -- <pathspec> [<pathspec> ...]
# Prints: COMMIT_SHA=<sha>   on a successful commit (and push)
#         NOOP=1             when nothing matched the pathspecs (idempotent)
# Exit:   0 ok/noop; 2 usage; 3 unrelated staged changes; 4 committed locally but
#         not pushed (origin moved + unsafe to auto-rebase); 5 add/commit failed.
set -u

MSG="${1:-}"
shift || true
[ "${1:-}" = "--" ] && shift
if [ -z "$MSG" ] || [ "$#" -eq 0 ]; then
  echo "usage: commit-run.sh \"<message>\" -- <pathspec> [<pathspec> ...]" >&2
  exit 2
fi

TOP="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "commit-run: not a git repo" >&2; exit 2; }

# ---- engine push identity: authenticate as the GitHub App, if wired ----
# §28 two-lane contract: the engine publishes research DATA straight to `main` as
# its own App identity (the `main` ruleset's SOLE bypass actor), while every human/
# AI CODE push goes through a PR. When the App is configured locally, route git's
# credentials — for THIS process only — through the App credential helper, so this
# push lands as the engine and not as whatever human account git would otherwise
# use. We never touch global/repo git config, so interactive git is unaffected (and
# therefore stays gated for code). If the App is not configured, we leave git's
# default credentials in place — safe both before the App exists and on dev boxes.
ENGINE_APP_ENV="${NOSTRA_ENGINE_CONFIG_DIR:-$HOME/.config/nostra-engine}/github-app.env"
ENGINE_CRED_HELPER="$TOP/scripts/ops/gh-app-credential.sh"
if [ -f "$ENGINE_APP_ENV" ] && [ -x "$ENGINE_CRED_HELPER" ]; then
  export GIT_CONFIG_COUNT=2
  export GIT_CONFIG_KEY_0="credential.helper" GIT_CONFIG_VALUE_0=""              # reset the helper list…
  export GIT_CONFIG_KEY_1="credential.helper" GIT_CONFIG_VALUE_1="!$ENGINE_CRED_HELPER"  # …to the App only
fi

# ---- acquire the global repository-mutation lock ----
# fd 9 stays open in this shell after the short Python helper exits. flock ownership belongs to that
# shared open-file description, so it survives for the entire commit/push/rebase and is released by the
# kernel on every exit or crash. A persistent file inside .git avoids TMPDIR split-brain and stale locks.
LOCK="$(git -C "$TOP" rev-parse --git-path nostra-engine-mutation.flock 2>/dev/null)"
case "$LOCK" in /*) ;; ?*) LOCK="$TOP/$LOCK" ;; *) echo "commit-run: cannot resolve repository mutation lock" >&2; exit 4 ;; esac
exec 9>>"$LOCK" || { echo "commit-run: cannot open repository mutation lock" >&2; exit 4; }
if ! python3 - 900000 9<&9 <<'PYLOCK'
import fcntl
import sys
import time

deadline = time.monotonic() + int(sys.argv[1]) / 1000
while True:
    try:
        fcntl.flock(9, fcntl.LOCK_EX | fcntl.LOCK_NB)
        break
    except BlockingIOError:
        if time.monotonic() >= deadline:
            raise SystemExit(3)
        time.sleep(0.05)
PYLOCK
then
  exec 9>&-
  echo "commit-run: timed out (15m) waiting for the repository mutation lock" >&2
  exit 4
fi

# ---- commit only these pathspecs, safely ----
# the engine never pre-stages; anything already staged means something is wrong, so refuse.
if ! git diff --cached --quiet; then
  echo "commit-run: refusing — unrelated changes are already staged" >&2
  exit 3
fi

# The index was proven empty while the repository lease is held, so anything staged below belongs
# to this invocation. If add/commit fails, remove only these pathspecs from the index while keeping
# every worktree byte. Otherwise one rejecting hook can wedge all later autonomous commits forever.
unstage_own_paths() {
  local p
  for p in "$@"; do git reset -q HEAD -- "$p" 2>/dev/null || true; done
}

if ! git add -- "$@"; then
  unstage_own_paths "$@"
  echo "commit-run: git add failed — nothing was committed or pushed" >&2
  exit 5
fi
if git diff --cached --quiet; then
  echo "NOOP=1"
  exit 0
fi

if ! git commit -q -m "$MSG" -- "$@"; then
  unstage_own_paths "$@"
  echo "commit-run: git commit failed — nothing was pushed" >&2
  exit 5
fi
SHA="$(git rev-parse HEAD)"

# Validation / dry-run: commit locally but DO NOT push to origin/main. Lets the cheap real validations
# (a single-module run, a master rerun) produce their outputs on the CURRENT branch without touching
# main. Enable by setting ENGINE_NO_PUSH=1 in the run's environment.
if [ "${ENGINE_NO_PUSH:-}" = "1" ]; then
  echo "commit-run: ENGINE_NO_PUSH=1 — committed locally ($SHA); NOT pushing to origin/main" >&2
  echo "COMMIT_SHA=$SHA"
  exit 0
fi

# Push CURRENT HEAD to remote main — never a bare "origin main", which resolves its source as
# the LOCAL branch literally named main. A committing process is routinely checked out on some
# other ref (a per-session worktree branch, a detached HEAD) whose local `main` — if it exists at
# all — can be arbitrarily stale. `HEAD:main` is the only spelling that means what this script
# actually intends ("land what I just committed on remote main"), independent of which branch is
# checked out or whether a local `main` ref exists or is current.
if git push -q origin HEAD:main 2>/dev/null; then
  echo "COMMIT_SHA=$SHA"
  exit 0
fi

# push rejected — origin/main moved. Rebase only if the worktree has no unrelated *tracked*
# modifications (other runs only add untracked files, which a rebase won't touch). Never autostash.
git fetch -q origin main 2>/dev/null || { echo "commit-run: push + fetch failed; commit $SHA is local — push manually" >&2; echo "COMMIT_SHA=$SHA"; exit 4; }
if ! git diff --quiet; then
  echo "commit-run: push rejected and the worktree has uncommitted tracked changes (other runs) — NOT auto-rebasing; commit $SHA is local — push manually" >&2
  echo "COMMIT_SHA=$SHA"
  exit 4
fi
if ! git rebase -q origin/main 2>/dev/null; then
  # A conflicting append-only ledger is plausible. Never leave the shared production checkout in
  # rebase-merge/rebase-apply: abort under the same lease so HEAD/index return to the local commit.
  if ! git rebase --abort >/dev/null 2>&1; then
    echo "commit-run: rebase conflicted and abort failed; checkout needs repair; original commit $SHA" >&2
  else
    echo "commit-run: rebase conflicted and was safely aborted; commit $SHA remains local — push manually" >&2
  fi
  echo "COMMIT_SHA=$(git rev-parse HEAD)"
  exit 4
fi
REBASED_SHA="$(git rev-parse HEAD)"
if git push -q origin HEAD:main 2>/dev/null; then
  echo "COMMIT_SHA=$(git rev-parse HEAD)"
  exit 0
fi
echo "commit-run: rebase succeeded but the push retry lost another remote race; rebased commit $REBASED_SHA remains local — push manually" >&2
echo "COMMIT_SHA=$REBASED_SHA"
exit 4
