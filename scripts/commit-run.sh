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
# Prints: COMMIT_SHA=<sha>   for the isolated commit that reached shared main, or the detached
#                            validation snapshot when ENGINE_NO_PUSH=1 (paired with NO_PUSH_REF)
#         NOOP=1             when nothing matched the pathspecs (idempotent)
# Exit:   0 ok/noop; 2 usage; 3 unrelated staged changes; 4 committed locally but
#         not pushed (origin moved + unsafe to auto-rebase); 5 add/validation/commit failed.
set -u

MSG="${1:-}"
shift || true
[ "${1:-}" = "--" ] && shift
if [ -z "$MSG" ] || [ "$#" -eq 0 ]; then
  echo "usage: commit-run.sh \"<message>\" -- <pathspec> [<pathspec> ...]" >&2
  exit 2
fi

TOP="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "commit-run: not a git repo" >&2; exit 2; }
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)" || {
  echo "commit-run: cannot resolve helper directory" >&2; exit 2;
}

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
    rm -f -- "$PREWRITE_TMP/staged-paths" "$PREWRITE_TMP/decision_record.json" \
      "$PREWRITE_TMP/publication-paths" "$PREWRITE_TMP/no-push-message"
    rmdir -- "$PREWRITE_TMP" 2>/dev/null || true
  fi
}
trap cleanup_prewrite_tmp EXIT
PREWRITE_TMP="$(mktemp -d "${TMPDIR:-/tmp}/nostra-data-needs-prewrite.XXXXXX")" || {
  unstage_own_paths "$@"
  echo "commit-run: cannot create data-needs validation workspace — nothing was committed or pushed" >&2
  exit 5
}
if ! git -C "$TOP" diff --cached --name-only --diff-filter=ACDMRT -z -- >"$PREWRITE_TMP/staged-paths"; then
  unstage_own_paths "$@"
  echo "commit-run: cannot enumerate staged publications — nothing was committed or pushed" >&2
  exit 5
fi
# This helper is the privileged DATA lane. A caller-controlled pathspec must never turn it into a
# code-branch bypass. Validate the actual staged entries (not the pathspec spelling) so directories and
# Git globs remain usable while `../`, pathspec magic and unrelated code can never ride the App push.
if ! python3 - "$PREWRITE_TMP/staged-paths" <<'PYDATA'
import sys
raw = open(sys.argv[1], 'rb').read()
if not raw or not raw.endswith(b'\0'):
    raise SystemExit(1)
for item in raw[:-1].split(b'\0'):
    try: path = item.decode('utf-8', 'strict')
    except UnicodeDecodeError: raise SystemExit(1)
    parts = path.split('/')
    if (not path or path.startswith('/') or '\\' in path or any(p in ('', '.', '..') for p in parts)
            or parts[0] not in ('analyses', 'screener', 'commodity')):
        raise SystemExit(1)
PYDATA
then
  unstage_own_paths "$@"
  echo "commit-run: refusing — requested commit contains a non-data path" >&2
  exit 5
fi
while IFS= read -r -d '' STAGED_PATH; do
  STAGED_MODE="$(git -C "$TOP" ls-files -s -- "$STAGED_PATH")"
  STAGED_MODE="${STAGED_MODE%% *}"
  # An empty mode is a staged deletion. Every added/changed entry must be a regular blob; never publish a
  # symlink/submodule whose target could redirect a later automatic reader outside the data authority.
  if [ -n "$STAGED_MODE" ] && [ "$STAGED_MODE" != "100644" ] && [ "$STAGED_MODE" != "100755" ]; then
    unstage_own_paths "$@"
    echo "commit-run: staged data publication is not a regular file: $STAGED_PATH — nothing was committed or pushed" >&2
    exit 5
  fi
done <"$PREWRITE_TMP/staged-paths"

# Before moving HEAD, replay the exact staged index as a temporary, unreachable one-parent commit through
# the saved-publication remote CAS and immutable sealed-run policy. The child is only an object snapshot;
# preflight has no ref/push/convergence path. A rejected sealed rewrite is therefore unstaged without
# stranding automatic recovery behind a poisoned local commit.
STAGED_TREE="$(git -C "$TOP" write-tree 2>/dev/null || true)"
PREFLIGHT_SOURCE=""
if [ -n "$STAGED_TREE" ]; then
  PREFLIGHT_SOURCE="$(printf '%s\n' "$MSG" | git -C "$TOP" commit-tree "$STAGED_TREE" -p HEAD 2>/dev/null || true)"
fi
PREFLIGHT_RC=0
if [ -z "$PREFLIGHT_SOURCE" ]; then
  PREFLIGHT_RC=5
else
  _NOSTRA_COMMIT_RUN_PREFLIGHT=1 bash "$SCRIPT_DIR/publish-saved-research.sh" \
    "$MSG" --preflight-source-commit "$PREFLIGHT_SOURCE" -- "$@"
  PREFLIGHT_RC=$?
fi
if [ "$PREFLIGHT_RC" -eq 5 ] || [ "$PREFLIGHT_RC" -eq 2 ]; then
  unstage_own_paths "$@"
  echo "commit-run: shared immutable-history preflight rejected staged publication — nothing was committed or pushed" >&2
  exit 5
fi
if [ "$PREFLIGHT_RC" -ne 0 ]; then
  echo "commit-run: shared immutable-history preflight is temporarily unavailable; preserving the exact local commit for retry" >&2
fi
if [ "$(git -C "$TOP" write-tree 2>/dev/null || true)" != "$STAGED_TREE" ]; then
  unstage_own_paths "$@"
  echo "commit-run: staged publication changed during immutable-history preflight — nothing was committed or pushed" >&2
  exit 5
fi

TERMINAL_RUNNER="$SCRIPT_DIR/../ui/server/node_modules/.bin/tsx"
TERMINAL_VALIDATOR="$SCRIPT_DIR/../ui/server/scripts/validate-terminal-publication.ts"
while IFS= read -r -d '' STAGED_PATH; do
  STAGED_MODE="$(git -C "$TOP" ls-files -s -- "$STAGED_PATH")"
  STAGED_MODE="${STAGED_MODE%% *}"
  if [[ "$STAGED_PATH" =~ ^analyses/[^/]+/decision_record\.json$ ]] && [ -n "$STAGED_MODE" ]; then
    RUN_ROOT="${STAGED_PATH%/decision_record.json}"
    # A paid automatic scoped continuation is already bound to an exact published intake plan. Once its
    # full canonical terminal seal is in this immutable index, re-running today's mutable roster gate can
    # only deadlock recovery after an orb rename. The validator grants this exception solely when the
    # staged transport plan's unstamped bytes and source fingerprint equal the shared source plan. Every
    # ordinary/manual decision—including a sealed-looking tree without that binding—still takes the live
    # creation-time gate below.
    if [ -x "$TERMINAL_RUNNER" ] && [ -f "$TERMINAL_VALIDATOR" ] \
      && "$TERMINAL_RUNNER" "$TERMINAL_VALIDATOR" --repo "$TOP" --automatic-index "$RUN_ROOT" >/dev/null 2>&1; then
      echo "AUTOMATIC_TERMINAL_RECOVERY_VALID=$RUN_ROOT"
      continue
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
  if [[ "$STAGED_PATH" =~ ^analyses/[^/]+/idea_admission\.json$ ]] && [ -n "$STAGED_MODE" ]; then
    RUN_ROOT="${STAGED_PATH%/idea_admission.json}"
    if [ ! -x "$TERMINAL_RUNNER" ] || [ ! -f "$TERMINAL_VALIDATOR" ] \
      || ! "$TERMINAL_RUNNER" "$TERMINAL_VALIDATOR" --repo "$TOP" --index "$RUN_ROOT" >/dev/null 2>&1; then
      unstage_own_paths "$@"
      echo "commit-run: canonical terminal publication rejected staged admission: $RUN_ROOT — nothing was committed or pushed" >&2
      exit 5
    fi
    echo "TERMINAL_PUBLICATION_VALID=$RUN_ROOT"
  fi
done <"$PREWRITE_TMP/staged-paths"

# Validation / dry-run data must remain inspectable without ever entering the production checkout's
# first-parent history. A commit on HEAD is not "local only": the next ordinary data publication and the
# publication-recovery scanners deliberately replay locally saved data commits after shared main. Build
# the exact validated index as a detached commit, retain it under an explicit never-publish ref, and leave
# HEAD untouched. The trailer is defense in depth: every publisher and recovery scanner rejects it even if
# someone later makes the detached commit reachable from a branch by hand.
if [ "${ENGINE_NO_PUSH:-}" = "1" ]; then
  DRY_PARENT="$(git -C "$TOP" rev-parse HEAD 2>/dev/null || true)"
  DRY_MESSAGE="$PREWRITE_TMP/no-push-message"
  printf '%s\n\nNostradamus-Publication: never\n' "$MSG" >"$DRY_MESSAGE" || {
    unstage_own_paths "$@"
    echo "commit-run: cannot create validation-only commit message — nothing was committed or pushed" >&2
    exit 5
  }
  DRY_SHA=""
  if [ -n "$DRY_PARENT" ]; then
    DRY_SHA="$(git -C "$TOP" commit-tree "$STAGED_TREE" -p "$DRY_PARENT" -F "$DRY_MESSAGE" 2>/dev/null || true)"
  fi
  if [ -z "$DRY_SHA" ] \
    || ! git -C "$TOP" update-ref "refs/nostradamus/no-push/$DRY_SHA" "$DRY_SHA" 2>/dev/null; then
    unstage_own_paths "$@"
    echo "commit-run: cannot retain validation-only data snapshot — nothing was pushed" >&2
    exit 5
  fi
  unstage_own_paths "$@"
  if [ "$(git -C "$TOP" rev-parse HEAD 2>/dev/null || true)" != "$DRY_PARENT" ]; then
    echo "commit-run: validation-only snapshot changed the checkout unexpectedly — nothing was pushed" >&2
    exit 5
  fi
  echo "commit-run: ENGINE_NO_PUSH=1 — detached validation snapshot is $DRY_SHA; HEAD unchanged; NOT publishing" >&2
  echo "COMMIT_SHA=$DRY_SHA"
  echo "NO_PUSH_REF=refs/nostradamus/no-push/$DRY_SHA"
  exit 0
fi

# The index was empty before this invocation and now contains only this run's staged snapshot. Commit
# that snapshot directly: passing pathspecs to `git commit` would read mutable worktree bytes again and
# reopen the validation-to-commit race closed above.
if ! git commit -q -m "$MSG"; then
  unstage_own_paths "$@"
  echo "commit-run: git commit failed — nothing was pushed" >&2
  exit 5
fi
SHA="$(git rev-parse HEAD)"
COMMITTED_TREE="$(git -C "$TOP" rev-parse "$SHA^{tree}" 2>/dev/null || true)"
if [ "$COMMITTED_TREE" != "$STAGED_TREE" ]; then
  # A hook changed the index after all exact-snapshot validation. Rewind only this just-created ref;
  # preserve every worktree byte, then clear the index that was proven empty before this invocation.
  git -C "$TOP" reset --soft "$SHA^" >/dev/null 2>&1 || true
  git -C "$TOP" reset -q HEAD -- . 2>/dev/null || true
  echo "commit-run: commit hook changed the validated staged snapshot — nothing was pushed" >&2
  exit 5
fi

# Never push HEAD. The checkout may be a reviewed code branch with private/unmerged ancestors; making
# this data commit its child does not authorize those ancestors to bypass §28 onto main. Reuse the saved-
# publication CAS: replay only this commit's exact data entries onto the latest origin/main in a synthetic
# one-parent commit. Release this helper's flock first; the publisher reacquires the same lease itself.
REMOTE_HINT="$(git -C "$TOP" rev-parse refs/remotes/origin/main 2>/dev/null || true)"
if [ -z "$REMOTE_HINT" ] || ! python3 - "$TOP" "$SHA" "$REMOTE_HINT" >"$PREWRITE_TMP/publication-paths" <<'PYPENDING'
import subprocess, sys
top, source, remote = sys.argv[1:]
def git(args, raw=False):
    value = subprocess.run(['git', '-C', top, *args], check=True, stdout=subprocess.PIPE,
                           stderr=subprocess.DEVNULL).stdout
    return value if raw else value.decode().strip()
try:
    base = git(['merge-base', source, remote])
    commits = [item for item in git(['rev-list', '--first-parent', '--reverse', f'{base}..{source}']).splitlines() if item]
    publications = []
    for commit in commits:
        message = git(['show', '-s', '--format=%B', commit])
        if any(line == 'Nostradamus-Publication: never' for line in message.splitlines()):
            # Never cross an explicit validation-only ancestor. Skipping it and publishing a later child
            # could still publish bytes derived from that private experiment.
            raise SystemExit(1)
        parents = git(['rev-list', '--parents', '-n', '1', commit]).split()
        if len(parents) != 2: continue
        paths = [item.decode('utf-8', 'strict') for item in git(
            ['diff-tree', '--no-renames', '--no-commit-id', '--name-only', '-r', '-z', parents[1], commit, '--'], True,
        ).split(b'\0') if item]
        # A mixed/code ancestor is never widened into the privileged DATA publication. Its data bytes
        # remain pending for an explicit recovery request; pure data commits can be replayed in order.
        if not paths or any(path.split('/', 1)[0] not in ('analyses', 'screener', 'commodity') for path in paths):
            continue
        publications.append((commit, paths))
    if not publications or publications[-1][0] != source: raise SystemExit(1)
    for commit, paths in publications:
        sys.stdout.buffer.write(commit.encode('ascii') + b'\0' + str(len(paths)).encode('ascii') + b'\0')
        sys.stdout.buffer.write(b''.join(path.encode('utf-8') + b'\0' for path in paths))
except (subprocess.CalledProcessError, UnicodeDecodeError, ValueError):
    raise SystemExit(1)
PYPENDING
then
  echo "commit-run: committed data snapshot cannot be enumerated; local commit $SHA was not published" >&2
  echo "LOCAL_COMMIT_SHA=$SHA"
  exit 4
fi
exec 9>&-
PUBLICATION_FAILED=0
exec 8<"$PREWRITE_TMP/publication-paths"
while IFS= read -r -d '' PENDING_COMMIT <&8; do
  if ! IFS= read -r -d '' PENDING_COUNT <&8 || ! [[ "$PENDING_COUNT" =~ ^[1-9][0-9]*$ ]]; then
    PUBLICATION_FAILED=1
    break
  fi
  PENDING_PATHS=()
  pending_index=0
  while [ "$pending_index" -lt "$PENDING_COUNT" ]; do
    if ! IFS= read -r -d '' PENDING_PATH <&8; then PUBLICATION_FAILED=1; break; fi
    PENDING_PATHS+=("$PENDING_PATH")
    pending_index=$((pending_index + 1))
  done
  [ "$PUBLICATION_FAILED" -eq 0 ] || break
  if ! bash "$SCRIPT_DIR/publish-saved-research.sh" "$MSG" --source-commit "$PENDING_COMMIT" -- "${PENDING_PATHS[@]}"; then
    PUBLICATION_FAILED=1
    break
  fi
done
exec 8<&-
if [ "$PUBLICATION_FAILED" -eq 0 ]; then
  SHARED_SHA="$(git -C "$TOP" rev-parse refs/remotes/origin/main 2>/dev/null || true)"
  if [ -z "$SHARED_SHA" ]; then
    echo "commit-run: isolated publication succeeded but shared authority could not be resolved" >&2
    echo "LOCAL_COMMIT_SHA=$SHA"
    exit 4
  fi
  echo "COMMIT_SHA=$SHARED_SHA"
  exit 0
fi
echo "commit-run: isolated data publication failed; local commit $SHA will retry without publishing the checkout branch" >&2
echo "LOCAL_COMMIT_SHA=$SHA"
exit 4
