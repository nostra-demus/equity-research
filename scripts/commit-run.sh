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
#         commit-run.sh --retry-push <expected-head-sha>
# Prints: COMMIT_SHA=<sha>   on a successful commit (and push)
#         NOOP=1             when nothing matched the pathspecs (idempotent)
# Exit:   0 ok/noop; 2 usage; 3 unrelated staged changes; 4 committed locally but
#         not pushed (origin moved + unsafe to auto-rebase); 5 add/validation/commit failed.
set -u

RETRY_SHA=""
if [ "${1:-}" = "--retry-push" ]; then
  RETRY_SHA="${2:-}"
  case "$RETRY_SHA" in
    *[!0-9a-f]*|'') echo "commit-run: retry needs a lowercase commit SHA" >&2; exit 2 ;;
  esac
  [ "${#RETRY_SHA}" -eq 40 ] || [ "${#RETRY_SHA}" -eq 64 ] || { echo "commit-run: retry needs a 40/64-char commit SHA" >&2; exit 2; }
  shift 2
  [ "$#" -eq 0 ] || { echo "commit-run: retry mode accepts no pathspecs" >&2; exit 2; }
  MSG=""
else
  MSG="${1:-}"
  shift || true
  [ "${1:-}" = "--" ] && shift
  if [ -z "$MSG" ] || [ "$#" -eq 0 ]; then
    echo "usage: commit-run.sh \"<message>\" -- <pathspec> [<pathspec> ...]" >&2
    exit 2
  fi
fi

# Validation/dry-run authority never includes a remote push. Retry mode used to bypass the ordinary
# ENGINE_NO_PUSH branch below and could unexpectedly publish a prior local-only checkpoint.
if [ -n "$RETRY_SHA" ] && [ "${ENGINE_NO_PUSH:-}" = "1" ]; then
  echo "commit-run: ENGINE_NO_PUSH=1 — retry push refused" >&2
  exit 4
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
if [ -n "$RETRY_SHA" ]; then
  [ "$(git symbolic-ref --quiet HEAD 2>/dev/null)" = "refs/heads/main" ] || {
    echo "commit-run: retry refused outside the production main branch" >&2
    exit 4
  }
  CURRENT_SHA="$(git rev-parse HEAD 2>/dev/null)" || exit 4
  [ "$CURRENT_SHA" = "$RETRY_SHA" ] || {
    echo "commit-run: retry target no longer matches HEAD" >&2
    echo "COMMIT_SHA=$CURRENT_SHA"
    exit 4
  }
  if git fetch -q origin main 2>/dev/null && git merge-base --is-ancestor HEAD origin/main 2>/dev/null; then
    echo "COMMIT_SHA=$CURRENT_SHA"
    exit 0
  fi
  # Continue into the same authenticated, serialized push/rebase path below. No staging or commit is
  # allowed in retry mode; the expected SHA proves exactly which ambiguous local commit is being retried.
  SHA="$CURRENT_SHA"
else
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

# Validate only newly staged terminal decision publications. The normal historical eval deliberately
# replays frozen records without today's live-roster check; this creation-time boundary is the last place
# where a new top-level research decision must prove its data-needs routes still exist. Commodity has a
# separate pre-archive validator with its own orb roster and is deliberately not routed through this gate. Reading
# `:<path>` snapshots the exact index blob, so a concurrent writer cannot swap the worktree file between
# validation and commit. Exact path shapes exclude module outputs, reviews, calibration files, and the
# immutable commodity `decisions/<id>/decision_record.json` archives.
PREWRITE_TMP=""
cleanup_prewrite_tmp() {
  if [ -n "$PREWRITE_TMP" ] && [ -d "$PREWRITE_TMP" ]; then
    rm -f -- "$PREWRITE_TMP/staged-paths" "$PREWRITE_TMP/decision_record.json"
    rmdir -- "$PREWRITE_TMP" 2>/dev/null || true
  fi
}
trap cleanup_prewrite_tmp EXIT
PREWRITE_TMP="$(mktemp -d "${TMPDIR:-/tmp}/nostra-data-needs-prewrite.XXXXXX")" || {
  unstage_own_paths "$@"
  echo "commit-run: cannot create data-needs validation workspace — nothing was committed or pushed" >&2
  exit 5
}
if ! git -C "$TOP" diff --cached --name-only --diff-filter=ACMRT -z -- >"$PREWRITE_TMP/staged-paths"; then
  unstage_own_paths "$@"
  echo "commit-run: cannot enumerate staged publications — nothing was committed or pushed" >&2
  exit 5
fi
while IFS= read -r -d '' STAGED_PATH; do
  if [[ "$STAGED_PATH" =~ ^analyses/[^/]+/decision_record\.json$ ]]; then
    STAGED_MODE="$(git -C "$TOP" ls-files -s -- "$STAGED_PATH")"
    STAGED_MODE="${STAGED_MODE%% *}"
    if [ "$STAGED_MODE" != "100644" ] && [ "$STAGED_MODE" != "100755" ]; then
      unstage_own_paths "$@"
      echo "commit-run: staged decision publication is not a regular file: $STAGED_PATH — nothing was committed or pushed" >&2
      exit 5
    fi
    if ! git -C "$TOP" cat-file blob ":$STAGED_PATH" >"$PREWRITE_TMP/decision_record.json"; then
      unstage_own_paths "$@"
      echo "commit-run: cannot read staged decision publication: $STAGED_PATH — nothing was committed or pushed" >&2
      exit 5
    fi
    if ! (cd "$TOP" && python3 scripts/eval.py --data-needs-prewrite "$PREWRITE_TMP/decision_record.json"); then
      unstage_own_paths "$@"
      echo "commit-run: data-needs prewrite rejected staged publication: $STAGED_PATH — nothing was committed or pushed" >&2
      exit 5
    fi
  fi
done <"$PREWRITE_TMP/staged-paths"

# The index was empty before this invocation and now contains only this run's staged snapshot. Commit
# that snapshot directly: passing pathspecs to `git commit` would read mutable worktree bytes again and
# reopen the validation-to-commit race closed above.
if ! git commit -q -m "$MSG"; then
  unstage_own_paths "$@"
  echo "commit-run: git commit failed — nothing was pushed" >&2
  exit 5
fi
SHA="$(git rev-parse HEAD)"
fi

# Validation / dry-run: commit locally but DO NOT push to origin/main. Lets the cheap real validations
# (a single-module run, a master rerun) produce their outputs on the CURRENT branch without touching
# main. Enable by setting ENGINE_NO_PUSH=1 in the run's environment.
if [ -z "$RETRY_SHA" ] && [ "${ENGINE_NO_PUSH:-}" = "1" ]; then
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

# A dirty production checkout must never be autostashed/reset: live screeners can rewrite tracked DATA
# while this helper is publishing another DATA commit. When all tracked dirt is inside the reviewed data
# lane, reconcile the committed snapshot with origin/main through Git's in-memory merge-tree plumbing.
# That leaves every worktree/index byte untouched and makes the local commit a parent of the pushed merge,
# so deploy.sh can still fast-forward the production checkout. Any dirty code/ops path fails closed.
dirty_tracked_paths_are_engine_data() {
  python3 - "$TOP" <<'PYDIRTY'
import subprocess
import sys

try:
    raw = subprocess.check_output(
        ["git", "-C", sys.argv[1], "diff", "--name-only", "-z", "--"],
        stderr=subprocess.DEVNULL,
    )
except (OSError, subprocess.CalledProcessError):
    raise SystemExit(1)

paths = [item for item in raw.split(b"\0") if item]
if not paths:
    raise SystemExit(1)
for encoded in paths:
    try:
        value = encoded.decode("utf-8", "strict")
    except UnicodeError:
        raise SystemExit(1)
    if not (value.startswith("analyses/") or value.startswith("screener/")):
        raise SystemExit(1)
raise SystemExit(0)
PYDIRTY
}

reconcile_with_dirty_data() {
  local attempt remote_sha merge_tree merge_sha
  attempt=1
  while [ "$attempt" -le 3 ]; do
    git fetch -q origin main 2>/dev/null || return 1
    remote_sha="$(git rev-parse origin/main 2>/dev/null)" || return 1
    if git merge-base --is-ancestor "$SHA" "$remote_sha" 2>/dev/null; then
      echo "COMMIT_SHA=$SHA"
      return 0
    fi
    if ! merge_tree="$(git merge-tree --write-tree "$remote_sha" "$SHA" 2>/dev/null)" \
       || ! git cat-file -e "${merge_tree}^{tree}" 2>/dev/null; then
      echo "commit-run: dirty-data reconciliation conflicts with origin/main; commit $SHA remains local — push manually" >&2
      return 1
    fi
    merge_sha="$(printf '%s\n' "Reconcile engine data commit ${SHA:0:12} with origin/main" \
      | git commit-tree "$merge_tree" -p "$remote_sha" -p "$SHA" 2>/dev/null)" || return 1
    if git push -q origin "$merge_sha:main" 2>/dev/null; then
      # Report the engine DATA commit, not the synthetic merge head. Callers prove publication by ancestry,
      # and retry mode remains bound to the exact local HEAD if a later marker-clear step is interrupted.
      echo "COMMIT_SHA=$SHA"
      return 0
    fi
    attempt=$((attempt + 1))
  done
  echo "commit-run: dirty-data reconciliation lost three remote races; commit $SHA remains local — retry later" >&2
  return 1
}

# push rejected — origin/main moved. Rebase only if the worktree is clean. Never autostash.
git fetch -q origin main 2>/dev/null || { echo "commit-run: push + fetch failed; commit $SHA is local — push manually" >&2; echo "COMMIT_SHA=$SHA"; exit 4; }
if ! git diff --quiet; then
  if dirty_tracked_paths_are_engine_data && reconcile_with_dirty_data; then
    exit 0
  fi
  echo "commit-run: push rejected and the worktree has unsafe/conflicting tracked changes — NOT reconciling; commit $SHA is local — push manually" >&2
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
