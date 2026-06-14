#!/usr/bin/env bash
# Serialize ALL engine commits to `main` across concurrent runs.
#
# The cockpit can now run several companies at once, each writing its own
# analyses/<TICKER>_<date>/ folder in the SAME worktree. Their final commits must
# not collide on .git/index.lock or race the push, so every committing command
# routes its git through this one helper. macOS has no flock, so we use an atomic
# mkdir lock. We commit ONLY the given git pathspecs and never autostash, so one
# run's commit can't sweep in another run's in-flight files.
#
# Usage:  commit-run.sh "<commit message>" -- <pathspec> [<pathspec> ...]
# Prints: COMMIT_SHA=<sha>   on a successful commit (and push)
#         NOOP=1             when nothing matched the pathspecs (idempotent)
# Exit:   0 ok/noop; 2 usage; 3 unrelated staged changes; 4 committed locally but
#         not pushed (origin moved + unsafe to auto-rebase — push manually).
set -u

MSG="${1:-}"
shift || true
[ "${1:-}" = "--" ] && shift
if [ -z "$MSG" ] || [ "$#" -eq 0 ]; then
  echo "usage: commit-run.sh \"<message>\" -- <pathspec> [<pathspec> ...]" >&2
  exit 2
fi

TOP="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "commit-run: not a git repo" >&2; exit 2; }
REPO_ID="$(printf '%s' "$TOP" | shasum | awk '{print $1}')"
LOCK="${TMPDIR:-/tmp}/equity-research-git-${REPO_ID}.lock"
STALE_SECS=900   # generous on purpose — a slow push/rebase is NOT a stale lock
HELD=0
release() { [ "$HELD" = "1" ] && rm -rf "$LOCK" 2>/dev/null; true; }
trap release EXIT INT TERM

# ---- acquire the global git lock (atomic mkdir spinlock, stale-safe) ----
waited=0
while true; do
  if mkdir "$LOCK" 2>/dev/null; then
    printf 'pid=%s\nhost=%s\ncreated=%s\n' "$$" "$(hostname)" "$(date +%s)" > "$LOCK/owner" 2>/dev/null || true
    HELD=1
    break
  fi
  # break the lock only if it is clearly stale: old AND its holder PID is dead on THIS host
  if [ -f "$LOCK/owner" ]; then
    created="$(awk -F= '/^created=/{print $2}' "$LOCK/owner" 2>/dev/null)"
    host="$(awk -F= '/^host=/{print $2}' "$LOCK/owner" 2>/dev/null)"
    pid="$(awk -F= '/^pid=/{print $2}' "$LOCK/owner" 2>/dev/null)"
    age=$(( $(date +%s) - ${created:-0} ))
    if [ "$age" -gt "$STALE_SECS" ] && [ "$host" = "$(hostname)" ] && [ -n "${pid:-}" ] && ! kill -0 "$pid" 2>/dev/null; then
      rm -rf "$LOCK" 2>/dev/null
      continue
    fi
  fi
  sleep 0.5
  waited=$((waited + 1))
  [ "$waited" -gt 1800 ] && { echo "commit-run: timed out (15m) waiting for the git lock" >&2; exit 4; }
done

# ---- commit only these pathspecs, safely ----
# the engine never pre-stages; anything already staged means something is wrong, so refuse.
if ! git diff --cached --quiet; then
  echo "commit-run: refusing — unrelated changes are already staged" >&2
  exit 3
fi

git add -- "$@"
if git diff --cached --quiet; then
  echo "NOOP=1"
  exit 0
fi

git commit -q -m "$MSG" -- "$@"
SHA="$(git rev-parse HEAD)"

# Validation / dry-run: commit locally but DO NOT push to origin/main. Lets the cheap real validations
# (a single-module run, a master rerun) produce their outputs on the CURRENT branch without touching
# main. Enable by setting ENGINE_NO_PUSH=1 in the run's environment.
if [ "${ENGINE_NO_PUSH:-}" = "1" ]; then
  echo "commit-run: ENGINE_NO_PUSH=1 — committed locally ($SHA); NOT pushing to origin/main" >&2
  echo "COMMIT_SHA=$SHA"
  exit 0
fi

if git push -q origin main 2>/dev/null; then
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
if git rebase -q origin/main 2>/dev/null && git push -q origin main 2>/dev/null; then
  echo "COMMIT_SHA=$(git rev-parse HEAD)"
  exit 0
fi
echo "commit-run: rebase/push retry failed; commit is local — push manually" >&2
echo "COMMIT_SHA=$(git rev-parse HEAD)"
exit 4
