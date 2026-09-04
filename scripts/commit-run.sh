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
#         not pushed (origin moved + safe in-memory reconciliation failed); 5 add/validation/commit failed.
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

# The engine identity is a DATA-lane bypass actor. Enforce that boundary here rather than trusting every
# caller/prompt forever. Globs are allowed below an admitted root; absolute/upward/code paths are not.
is_data_pathspec() {
  case "$1" in
    analyses/*|screener/*|commodity/*|watchlist/*) return 0 ;;
    *) return 1 ;;
  esac
}

# A tracked child cannot inspect Git: both provider sandboxes deliberately deny the worktree Git pointer,
# resolved gitdir/common-dir, and credentials. Delegate before *any* git discovery. This branch validates
# only its untrusted data-path request; the supervisor independently derives the exact allowed artifacts.
if [ "${NOSTRA_COCKPIT_RUN:-}" = "1" ]; then
  if [ -n "$RETRY_SHA" ]; then
    echo "commit-run: a cockpit child cannot retry a supervisor publication" >&2
    exit 5
  fi
  for DATA_PATHSPEC in "$@"; do
    case "$DATA_PATHSPEC" in
      /*|../*|*/../*|*/..|..|*\\*|.git|.git/*|-*)
        echo "commit-run: refused unsafe/non-data pathspec: $DATA_PATHSPEC" >&2
        exit 2
        ;;
    esac
    if ! is_data_pathspec "$DATA_PATHSPEC"; then
      echo "commit-run: refused non-data pathspec: $DATA_PATHSPEC" >&2
      exit 2
    fi
  done
  [ -n "${NOSTRA_PUBLICATION_ENDPOINT:-}" ] && [ -n "${NOSTRA_PUBLICATION_TOKEN:-}" ] || {
    echo "commit-run: cockpit publication has no supervisor capability — nothing was committed or pushed" >&2
    exit 5
  }
  PUBLICATION_HELPER_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)" || exit 5
  python3 - "$PUBLICATION_HELPER_DIR" "$MSG" "$@" <<'PYREQUEST'
import json
import sys

helper_dir, message, *paths = sys.argv[1:]
sys.path.insert(0, helper_dir)
from supervisor_publication import SupervisorPublicationError, post

try:
    result = post({"phase": "commit", "message": message, "pathspecs": paths}, timeout=20 * 60)
except SupervisorPublicationError as error:
    print(f"commit-run: supervisor publication failed: {error}", file=sys.stderr)
    raise SystemExit(5)
output = result.get("output")
if output:
    print(output)
else:
    print("NOOP=1")
PYREQUEST
  exit $?
fi

TOP="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "commit-run: not a git repo" >&2; exit 2; }

if [ -z "$RETRY_SHA" ]; then
  for DATA_PATHSPEC in "$@"; do
    case "$DATA_PATHSPEC" in
      /*|../*|*/../*|*/..|..|*\\*|.git|.git/*|-*)
        echo "commit-run: refused unsafe/non-data pathspec: $DATA_PATHSPEC" >&2
        exit 2
        ;;
    esac
    if ! is_data_pathspec "$DATA_PATHSPEC"; then
      echo "commit-run: refused non-data pathspec: $DATA_PATHSPEC" >&2
      exit 2
    fi
  done
fi

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
  # A retry may push more than RETRY_SHA itself when local HEAD has ancestry not present on origin/main.
  # Audit that whole range exactly like a fresh data commit; an expected SHA is not code-review approval.
  AHEAD_PATHS="$(git log --format= --name-only origin/main..HEAD 2>/dev/null)" || {
    echo "commit-run: cannot inspect retry ancestry — nothing was pushed" >&2
    exit 4
  }
  while IFS= read -r AHEAD_PATH; do
    [ -z "$AHEAD_PATH" ] && continue
    if ! is_data_pathspec "$AHEAD_PATH"; then
      echo "commit-run: retry ancestry contains unreviewed non-data path ($AHEAD_PATH) — refusing data-lane push" >&2
      exit 4
    fi
  done <<EOF
$AHEAD_PATHS
EOF
  # Continue into the same authenticated, serialized push/rebase path below. No staging or commit is
  # allowed in retry mode; the expected SHA proves exactly which ambiguous local commit is being retried.
  SHA="$CURRENT_SHA"
else
# the engine never pre-stages; anything already staged means something is wrong, so refuse.
if ! git diff --cached --quiet; then
  echo "commit-run: refusing — unrelated changes are already staged" >&2
  exit 3
fi

# A valid data pathspec is not enough when HEAD itself sits atop an unreviewed code commit: pushing the
# new data commit would push that whole ancestry to main. Audit every commit ahead of origin/main before
# staging. A missing tracking ref is refreshed once; no remote/ref means fail closed for a push-capable run.
if [ "${ENGINE_NO_PUSH:-}" != "1" ]; then
  git fetch -q origin main 2>/dev/null || {
    echo "commit-run: cannot verify origin/main ancestry — nothing was committed or pushed" >&2
    exit 4
  }
  AHEAD_PATHS="$(git log --format= --name-only origin/main..HEAD 2>/dev/null)" || {
    echo "commit-run: cannot inspect HEAD ancestry — nothing was committed or pushed" >&2
    exit 4
  }
  while IFS= read -r AHEAD_PATH; do
    [ -z "$AHEAD_PATH" ] && continue
    if ! is_data_pathspec "$AHEAD_PATH"; then
      echo "commit-run: HEAD contains unreviewed non-data ancestry ($AHEAD_PATH) — refusing data-lane push" >&2
      exit 4
    fi
  done <<EOF
$AHEAD_PATHS
EOF
fi

# The index was proven empty while the repository lease is held, so anything staged below belongs
# to this invocation. If add/commit fails, remove only these pathspecs from the index while keeping
# every worktree byte. Otherwise one rejecting hook can wedge all later autonomous commits forever.
unstage_own_paths() {
  local p
  for p in "$@"; do git reset -q HEAD -- "$p" 2>/dev/null || true; done
}

if [ -n "${NOSTRA_SUPERVISOR_SNAPSHOT_MANIFEST:-}" ]; then
  if ! python3 - "$TOP" "$NOSTRA_SUPERVISOR_SNAPSHOT_MANIFEST" "$@" <<'PYSNAPSHOT'
import hashlib
import json
import os
import pathlib
import stat
import subprocess
import sys

top = pathlib.Path(sys.argv[1]).resolve()
manifest_path = pathlib.Path(sys.argv[2])
requested = sys.argv[3:]

def protected_file(candidate, label, max_bytes):
    path = pathlib.Path(candidate)
    info = path.lstat()
    if (not stat.S_ISREG(info.st_mode) or path.is_symlink() or path.resolve() != path
            or info.st_uid != os.getuid() or info.st_mode & 0o077 or info.st_size > max_bytes):
        raise RuntimeError(f"unsafe {label}")
    return path

manifest_path = protected_file(manifest_path, "snapshot manifest", 1024 * 1024)
parent = manifest_path.parent
parent_info = parent.lstat()
if (not stat.S_ISDIR(parent_info.st_mode) or parent.is_symlink() or parent.resolve() != parent
        or parent_info.st_uid != os.getuid() or parent_info.st_mode & 0o077):
    raise RuntimeError("unsafe snapshot directory")
value = json.loads(manifest_path.read_text(encoding="utf-8"))
entries = value.get("entries")
if (value.get("schema_version") != "cockpit-publication-snapshot/1.0" or not isinstance(entries, list)
        or not entries or len(entries) > 512 or value.get("requested_pathspecs") != requested):
    raise RuntimeError("snapshot manifest contract disagrees with publication request")
if [entry.get("path") for entry in entries] != requested or len(set(requested)) != len(requested):
    raise RuntimeError("snapshot entries are not the exact requested path list")
expected_oids = {}
for entry in entries:
    relative = entry.get("path")
    snapshot_raw = entry.get("snapshot")
    digest = entry.get("sha256")
    if (not isinstance(relative, str) or relative.startswith(("/", "-")) or "\\" in relative
            or ".." in pathlib.PurePosixPath(relative).parts
            or relative.split("/", 1)[0] not in {"analyses", "screener", "commodity", "watchlist"}):
        raise RuntimeError(f"unsafe snapshot data path: {relative!r}")
    snapshot = protected_file(snapshot_raw, "snapshot file", 128 * 1024 * 1024)
    if snapshot.parent != parent or not snapshot.name.isdigit():
        raise RuntimeError("snapshot file escaped its protected directory")
    payload = snapshot.read_bytes()
    actual = "sha256:" + hashlib.sha256(payload).hexdigest()
    if actual != digest:
        raise RuntimeError(f"snapshot digest mismatch: {relative}")
    oid = subprocess.check_output(["git", "-C", str(top), "hash-object", "-w", "--", str(snapshot)], text=True).strip()
    subprocess.run(["git", "-C", str(top), "update-index", "--add", "--cacheinfo", "100644", oid, relative], check=True)
    expected_oids[relative] = oid
staged = subprocess.check_output(
    ["git", "-C", str(top), "diff", "--cached", "--name-only", "-z", "--diff-filter=ACMRT"],
).decode().split("\0")
staged = [item for item in staged if item]
expected_changed = []
for relative, oid in expected_oids.items():
    prior = subprocess.run(
        ["git", "-C", str(top), "rev-parse", f"HEAD:{relative}"], text=True,
        stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
    )
    if prior.returncode != 0 or prior.stdout.strip() != oid:
        expected_changed.append(relative)
    indexed = subprocess.check_output(
        ["git", "-C", str(top), "rev-parse", f":{relative}"], text=True,
    ).strip()
    if indexed != oid:
        raise RuntimeError(f"staged OID differs from protected snapshot: {relative}")
if sorted(staged) != sorted(expected_changed):
    raise RuntimeError("staged path set differs from protected snapshot delta")
PYSNAPSHOT
  then
    unstage_own_paths "$@"
    echo "commit-run: protected supervisor snapshot staging failed — nothing was committed or pushed" >&2
    exit 5
  fi
elif ! git add -- "$@"; then
  unstage_own_paths "$@"
  echo "commit-run: git add failed — nothing was committed or pushed" >&2
  exit 5
fi
if git diff --cached --quiet; then
  echo "NOOP=1"
  exit 0
fi

# A valid data path is not enough: every artifact in the exact proposed Git index must also belong to a
# declared permanent-memory store. This is the same coverage invariant CI checks, moved before commit/push
# so autonomous data cannot turn main red and freeze every reviewed release behind it. The validator reads
# Git objects/index bytes, never mutable worktree files, so concurrent writers cannot race this decision.
if ! python3 "$TOP/scripts/validate_data_catalogue.py" --repo "$TOP" --index; then
  unstage_own_paths "$@"
  echo "commit-run: data catalogue rejected the staged publication — nothing was committed or pushed" >&2
  exit 5
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
PARENT_SHA="$(git rev-parse HEAD)"
if ! git commit -q -m "$MSG"; then
  unstage_own_paths "$@"
  echo "commit-run: git commit failed — nothing was pushed" >&2
  exit 5
fi
SHA="$(git rev-parse HEAD)"
if [ -n "${NOSTRA_SUPERVISOR_SNAPSHOT_MANIFEST:-}" ]; then
  if ! python3 - "$TOP" "$NOSTRA_SUPERVISOR_SNAPSHOT_MANIFEST" "$PARENT_SHA" "$SHA" <<'PYCOMMITVERIFY'
import hashlib, json, pathlib, subprocess, sys
top, manifest_path, parent, commit = sys.argv[1:]
value = json.loads(pathlib.Path(manifest_path).read_text(encoding="utf-8"))
entries = value["entries"]
expected_changed = []
for entry in entries:
    relative, digest = entry["path"], entry["sha256"]
    blob = subprocess.check_output(["git", "-C", top, "show", f"{commit}:{relative}"])
    if "sha256:" + hashlib.sha256(blob).hexdigest() != digest:
        raise RuntimeError(f"committed blob differs from protected snapshot: {relative}")
    prior = subprocess.run(["git", "-C", top, "show", f"{parent}:{relative}"],
                           stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    if prior.returncode != 0 or prior.stdout != blob:
        expected_changed.append(relative)
actual = subprocess.check_output(
    ["git", "-C", top, "diff-tree", "--no-commit-id", "--name-only", "-r", "-z", parent, commit]
).decode().split("\0")
actual = [item for item in actual if item]
if sorted(actual) != sorted(expected_changed):
    raise RuntimeError("commit delta contains paths outside the protected supervisor snapshot")
PYCOMMITVERIFY
  then
    echo "commit-run: committed tree disagrees with protected supervisor snapshot — nothing was pushed" >&2
    exit 5
  fi
fi
fi

# Validation / dry-run: commit locally but DO NOT push to origin/main. Lets the cheap real validations
# (a single-module run, a master rerun) produce their outputs on the CURRENT branch without touching
# main. Enable by setting ENGINE_NO_PUSH=1 in the run's environment.
if [ -z "$RETRY_SHA" ] && [ "${ENGINE_NO_PUSH:-}" = "1" ]; then
  echo "commit-run: ENGINE_NO_PUSH=1 — committed locally ($SHA); NOT pushing to origin/main" >&2
  echo "COMMIT_SHA=$SHA"
  exit 0
fi

# Retry mode can predate the creation-time gate above. Re-check the exact committed tree before every
# push-capable path so an old stranded commit cannot reintroduce uncatalogued artifacts.
if ! python3 "$TOP/scripts/validate_data_catalogue.py" --repo "$TOP" --tree "$SHA"; then
  echo "commit-run: committed data tree is not fully catalogued — nothing was pushed" >&2
  echo "COMMIT_SHA=$SHA"
  exit 4
fi

# Push CURRENT HEAD to remote main — never a bare "origin main", which resolves its source as
# the LOCAL branch literally named main. A committing process is routinely checked out on some
# other ref (a per-session worktree branch, a detached HEAD) whose local `main` — if it exists at
# all — can be arbitrarily stale. `HEAD:main` is the only spelling that means what this script
# actually intends ("land what I just committed on remote main"), independent of which branch is
# checked out or whether a local `main` ref exists or is current.
if git push -q origin "$SHA:main" 2>/dev/null; then
  echo "COMMIT_SHA=$SHA"
  exit 0
fi

# Publishing DATA must never update the production checkout to newer CODE. A normal `git rebase origin/main`
# used to do exactly that after a push race: it made the data commit publishable but silently pulled a newly
# merged PR into the live worktree, where deploy.sh later rebuilt/restarted it without a separate production
# decision. Reconcile every non-fast-forward DATA publication through Git's in-memory merge-tree plumbing
# instead. It leaves every worktree/index/ref byte untouched and makes the exact protected data commit a
# parent of the pushed merge. Dirty code/ops still fails closed; dirty engine data stays byte-for-byte intact.
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
    if not value.startswith(("analyses/", "screener/", "commodity/", "watchlist/")):
        raise SystemExit(1)
raise SystemExit(0)
PYDIRTY
}

reconcile_without_checkout_update() {
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
      echo "commit-run: data reconciliation conflicts with origin/main; commit $SHA remains local — retry later" >&2
      return 1
    fi
    if ! python3 "$TOP/scripts/validate_data_catalogue.py" --repo "$TOP" --tree "$merge_tree"; then
      echo "commit-run: reconciled remote tree contains uncatalogued data; commit $SHA remains local — retry after catalogue repair" >&2
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
  echo "commit-run: data reconciliation lost three remote races; commit $SHA remains local — retry later" >&2
  return 1
}

# Push rejected because origin/main moved. Fetch objects, but never rebase/merge/checkout the production
# worktree. The synthetic remote merge publishes only the already-validated DATA commit and the current
# remote tree, preserving the live program until a separately authorized deployment moves it.
git fetch -q origin main 2>/dev/null || { echo "commit-run: push + fetch failed; commit $SHA is local — push manually" >&2; echo "COMMIT_SHA=$SHA"; exit 4; }
if ! git diff --quiet; then
  if dirty_tracked_paths_are_engine_data && reconcile_without_checkout_update; then
    exit 0
  fi
  echo "commit-run: push rejected and the worktree has unsafe/conflicting tracked changes — NOT reconciling; commit $SHA is local — push manually" >&2
  echo "COMMIT_SHA=$SHA"
  exit 4
fi
if reconcile_without_checkout_update; then
  exit 0
fi
echo "COMMIT_SHA=$SHA"
exit 4
