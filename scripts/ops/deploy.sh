#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Auto-deploy watcher for app.nostra-demus.com  (com.nostradamus.deploy, ~every 120s)
#
# Keeps the PRODUCTION checkout fast-forwarded to origin/main and rebuilds/restarts
# ONLY what changed:
#   • ui/web/**     -> rebuild ui/dist  (served instantly by the running engine; no restart)
#   • ui/server/**  -> restart the engine (it runs `tsx src/server.ts` straight from source)
#   • package-lock  -> npm ci in that package first
#   • data/docs only (analyses, screener, *.md) -> nothing to rebuild
#
# The rebuild decision tracks a DEPLOYED MARKER ($OPS/.deployed.sha) — the SHA the built ui/dist + running
# engine were last reconciled to — NOT "did this script perform the merge". This matters because the engine
# commits research data into this same checkout and, when origin has moved, rebases onto origin/main first
# (scripts/commit-run.sh), pulling freshly merged CODE into the tree without this watcher ever running its
# fast-forward path. Keying off the marker means "HEAD == origin/main" no longer hides a stale ui/dist: if
# the built artifacts are behind HEAD, we rebuild the delta regardless of how HEAD advanced.
#
# Safe by construction:
#   • ff-only      — never reset/discard; if HEAD is ahead (an unpushed data commit) it SKIPS
#   • skip-if-conflict — the ff path skips only when an incoming commit overlaps a dirty file, or any
#                     non-data (code/ops) file is dirty; it does NOT block on how recently engine DATA was
#                     written (that jammed it against the 24/7 screener). The marker SYNC path needs no
#                     clean tree — it only rebuilds already-present source into ui/dist
#   • marker-gated — rebuild iff the built artifacts are behind HEAD; advance the marker only on success
#   • single-flight — mkdir lock with a 30-min staleness breaker
#   • always exit 0 — incidents live in the log, not the launchd exit code
# Canonical source: scripts/ops/deploy.sh (installed to ~/.nostra-ops by install-services.sh).
# ─────────────────────────────────────────────────────────────────────────────
set -uo pipefail

PROD="${ENGINE_REPO_ROOT:-/Users/chiraagkapil/nostra-prod}"
UID_NUM="$(id -u)"
NPM=/opt/homebrew/bin/npm
GIT="$(command -v git || echo /usr/bin/git)"
OPS="$HOME/.nostra-ops"
LOG="$HOME/Library/Logs/nostradamus-deploy.log"
LOCKDIR="$OPS/.deploy.lock.d"
MARK="$OPS/.deployed.sha"   # the SHA the built ui/dist + running engine were last reconciled to
FAILMARK="$OPS/.deploy.failed"                       # "<sha> <epoch>" of the last build that failed (backoff)
FAIL_BACKOFF="${DEPLOY_FAIL_BACKOFF_SECS:-1800}"     # don't re-attempt the SAME failing SHA more often than this
HEARTBEAT=3300   # log an "up-to-date" proof-of-life at most ~hourly
mkdir -p "$OPS" "$(dirname "$LOG")"

ts()  { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "$(ts) $*" >> "$LOG"; }

# keep the log bounded
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG" 2>/dev/null || echo 0)" -gt 4000 ]; then
  tail -n 800 "$LOG" > "$LOG.tmp" 2>/dev/null && mv "$LOG.tmp" "$LOG"
fi

# ---- single-flight lock (macOS has no flock) ----
if ! mkdir "$LOCKDIR" 2>/dev/null; then
  age=$(( $(date +%s) - $(stat -f %m "$LOCKDIR" 2>/dev/null || echo 0) ))
  if [ "$age" -gt 1800 ]; then
    rmdir "$LOCKDIR" 2>/dev/null || true
    mkdir "$LOCKDIR" 2>/dev/null || exit 0
    log "WARN broke stale lock (${age}s old)"
  else
    exit 0   # another deploy in progress
  fi
fi
# ---- shared git lock (mutual-exclusion with the engine's data commits) ----
# The engine commits research data into THIS prod worktree via scripts/commit-run.sh, which serializes
# every git mutation under a global mkdir lock at ${TMPDIR}/equity-research-git-<sha1(worktree)>.lock.
# deploy's ff-merge mutates the same index/working-tree, so it must take the SAME lock around the merge —
# otherwise the two collide on .git/index.lock and a data commit can be stranded (commit-run exits 4,
# "push manually"). We mirror commit-run's path derivation + owner-file + stale-break EXACTLY so each side
# recognizes (and can stale-break) the other's lock. Bounded wait: if the engine holds it we SKIP this
# cycle and retry in ~120s — the watcher never blocks.
GITLOCK=""
gitlock_acquire() {
  local top repo_id i created host pid age
  top="$("$GIT" -C "$PROD" rev-parse --show-toplevel 2>/dev/null)" || return 1
  repo_id="$(printf '%s' "$top" | shasum | awk '{print $1}')"
  GITLOCK="${TMPDIR:-/tmp}/equity-research-git-${repo_id}.lock"
  for i in $(seq 1 30); do                       # ~15s, then give up and retry next cycle
    if mkdir "$GITLOCK" 2>/dev/null; then
      printf 'pid=%s\nhost=%s\ncreated=%s\n' "$$" "$(hostname)" "$(date +%s)" > "$GITLOCK/owner" 2>/dev/null || true
      return 0
    fi
    if [ -f "$GITLOCK/owner" ]; then             # honor commit-run's stale-break: old AND holder dead on THIS host
      created="$(awk -F= '/^created=/{print $2}' "$GITLOCK/owner" 2>/dev/null)"
      host="$(awk -F= '/^host=/{print $2}' "$GITLOCK/owner" 2>/dev/null)"
      pid="$(awk -F= '/^pid=/{print $2}' "$GITLOCK/owner" 2>/dev/null)"
      age=$(( $(date +%s) - ${created:-0} ))
      if [ "$age" -gt 900 ] && [ "$host" = "$(hostname)" ] && [ -n "${pid:-}" ] && ! kill -0 "$pid" 2>/dev/null; then
        rm -rf "$GITLOCK" 2>/dev/null; continue
      fi
    fi
    sleep 0.5
  done
  GITLOCK=""; return 1
}
gitlock_release() { [ -n "$GITLOCK" ] && rm -rf "$GITLOCK" 2>/dev/null; GITLOCK=""; }

# A §28 DATA path — the only paths the engine ever writes into this checkout (analyses/**, screener/**,
# analyses/tracking/**). Anything else dirty is an unexpected/unreviewed edit and must block a release.
is_data_path() { case "$1" in analyses/tracking/*|analyses/*|screener/*) return 0 ;; *) return 1 ;; esac; }

# has_nondata_dirty — rc 0 if the working tree holds ANY dirty path (modified, staged, OR untracked) that is
# not a §28 data path. Built on `git status --porcelain` rather than `git diff`, because `git diff` is blind
# to UNTRACKED files — and a build compiles the working tree, so an untracked `ui/web/x.ts` would otherwise
# be baked into the live bundle with no PR/CI/review. Gitignored paths (ui/dist, node_modules) don't appear.
has_nondata_dirty() {
  local line path
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    path="${line:3}"          # strip the "XY " porcelain status prefix
    path="${path##* -> }"     # a rename prints "old -> new"; keep the destination
    is_data_path "$path" || return 0
  done < <("$GIT" status --porcelain 2>/dev/null)
  return 1
}

# reconcile_build <changed-file-list> <target-sha> — rebuild ui/dist and/or restart the engine for the
# changed files, self-update the installed ops scripts, then record <target-sha> as the deployed marker.
# <target-sha> is the commit whose source the caller actually built (captured under the git lock), so the
# marker can never record a SHA newer than what was compiled. Shared by BOTH the fast-forward merge path AND
# the "checkout advanced without a deploy merge" sync path, so the built artifacts get rebuilt whenever they
# fall behind HEAD — no matter how HEAD advanced.
reconcile_build() {
  local changed="$1" target="$2" web=0 server=0 weblock=0 serverlock=0 ci_ok=1 failed=0 f fsha fts
  # Circuit breaker: if this EXACT target already failed to build recently, don't hammer it every ~120s.
  # (Without this, a structurally-broken commit on main would hot-loop npm build + engine restarts forever.)
  if [ -f "$FAILMARK" ]; then
    read -r fsha fts < "$FAILMARK" 2>/dev/null || true
    if [ "${fsha:-}" = "$target" ] && [ "$(( $(date +%s) - ${fts:-0} ))" -lt "$FAIL_BACKOFF" ]; then
      log "  SKIP rebuild of ${target:0:9} — a prior build failed <${FAIL_BACKOFF}s ago; backing off"
      return 0
    fi
  fi
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    case "$f" in
      ui/web/package-lock.json|ui/web/package.json)        weblock=1; web=1 ;;
      ui/server/package-lock.json|ui/server/package.json)  serverlock=1; server=1 ;;
      ui/web/*)     web=1 ;;
      ui/server/*)  server=1 ;;
    esac
  done <<< "$changed"

  if [ "$web" = 1 ]; then
    # A failed ui/web `npm ci` must block the build+marker (mirror the server side): building against half-
    # installed deps could emit a broken bundle and then record it as "deployed".
    if [ "$weblock" = 1 ]; then log "  npm ci ui/web (deps changed)"; ( cd "$PROD/ui/web" && "$NPM" ci ) >>"$LOG" 2>&1 || { failed=1; log "  WARN ui/web npm ci failed — skipping build"; }; fi
    if [ "$failed" = 0 ]; then
      log "  rebuild ui/dist"
      if ( cd "$PROD/ui/web" && "$NPM" run build ) >>"$LOG" 2>&1; then log "  ui/dist rebuilt — live"; else log "  WARN ui/web build failed"; failed=1; fi
    fi
  fi

  if [ "$server" = 1 ] && [ "$failed" = 0 ]; then
    ci_ok=1
    if [ "$serverlock" = 1 ]; then
      log "  npm ci ui/server (deps changed)"
      # If deps fail to install, DON'T restart: a kickstart would bring the engine up against broken/half-
      # installed node_modules and take the site DOWN. Leaving the running process untouched keeps prod UP
      # on its current (in-memory) version until the lockfile is fixed — strictly safer than restarting blind.
      ( cd "$PROD/ui/server" && "$NPM" ci ) >>"$LOG" 2>&1 || { ci_ok=0; failed=1; log "  WARN ui/server npm ci failed — NOT restarting; engine stays up on its current deps. Fix it, then: launchctl kickstart -k gui/$UID_NUM/com.nostradamus.engine"; }
    fi
    if [ "$ci_ok" = 1 ]; then
      log "  restart engine (server code changed)"
      launchctl kickstart -k "gui/$UID_NUM/com.nostradamus.engine" 2>>"$LOG" || { log "  WARN engine kickstart failed"; failed=1; }
    fi
  fi

  # self-update the installed ops scripts when they change on main (atomic temp+mv; safe mid-run)
  case "$changed" in
    *scripts/ops/watchdog.sh*)
      sed 's#^REPO="/Users/chiraagkapil/equity-research"#REPO="${ENGINE_REPO_ROOT:-/Users/chiraagkapil/equity-research}"#' \
        "$PROD/scripts/ops/watchdog.sh" > "$OPS/watchdog.sh.tmp" 2>/dev/null \
        && chmod +x "$OPS/watchdog.sh.tmp" && mv "$OPS/watchdog.sh.tmp" "$OPS/watchdog.sh" && log "  refreshed ops/watchdog.sh" ;;
  esac
  case "$changed" in
    *scripts/ops/deploy.sh*)
      cp "$PROD/scripts/ops/deploy.sh" "$OPS/deploy.sh.tmp" 2>/dev/null \
        && chmod +x "$OPS/deploy.sh.tmp" && mv "$OPS/deploy.sh.tmp" "$OPS/deploy.sh" && log "  refreshed ops/deploy.sh (self-update)" ;;
  esac

  [ "$web" = 0 ] && [ "$server" = 0 ] && log "  (data/docs only — no rebuild)"

  # Advance the marker only when every attempted build/restart succeeded (record exactly the SHA we built,
  # written atomically so a crash mid-write can't truncate it). On failure, stamp $FAILMARK so the circuit
  # breaker above can back the same SHA off instead of hot-looping.
  if [ "$failed" = 0 ]; then
    printf '%s\n' "$target" > "$MARK.tmp" 2>/dev/null && mv "$MARK.tmp" "$MARK" 2>/dev/null || log "  WARN could not persist deployed marker"
    rm -f "$FAILMARK" 2>/dev/null || true
  else
    printf '%s %s\n' "$target" "$(date +%s)" > "$FAILMARK.tmp" 2>/dev/null && mv "$FAILMARK.tmp" "$FAILMARK" 2>/dev/null || true
  fi
}
trap 'gitlock_release; rmdir "$LOCKDIR" 2>/dev/null' EXIT

cd "$PROD" 2>/dev/null || { log "FATAL cannot cd $PROD"; exit 0; }

# ---- fetch (no working-tree mutation, no index lock) ----
# route fetch stderr to a side file so git's gc/maintenance warnings never pollute the deploy log;
# only surface it when the fetch actually fails.
"$GIT" fetch --quiet origin main 2>"$OPS/.fetch.err" || { log "WARN git fetch failed: $(tail -1 "$OPS/.fetch.err" 2>/dev/null)"; exit 0; }

LOCAL="$("$GIT" rev-parse HEAD 2>/dev/null)"
REMOTE="$("$GIT" rev-parse origin/main 2>/dev/null)"
[ -n "$LOCAL" ] && [ -n "$REMOTE" ] || { log "WARN cannot resolve revs"; exit 0; }
MARKER="$(cat "$MARK" 2>/dev/null || true)"   # SHA the built ui/dist + running engine were last reconciled to

if [ "$LOCAL" = "$REMOTE" ]; then
  # The checkout is level with origin/main — but that does NOT mean the BUILT artifacts are current.
  # The engine commits research data into THIS worktree and, when origin has moved, rebases onto
  # origin/main before pushing (scripts/commit-run.sh) — which pulls freshly MERGED CODE into the checkout
  # without deploy.sh ever running its fast-forward path. So a code PR can land in the working tree while
  # the old ui/dist is still being served. Reconcile against the deployed marker, not against origin.
  if [ "$MARKER" = "$LOCAL" ]; then
    # built artifacts already match HEAD — heartbeat at most ~hourly so the log proves the watcher is alive
    hb_age=999999
    [ -f "$LOG" ] && hb_age=$(( $(date +%s) - $(stat -f %m "$LOG" 2>/dev/null || echo 0) ))
    [ "$hb_age" -ge "$HEARTBEAT" ] && log "OK up-to-date ${LOCAL:0:9}"
    exit 0
  fi
  if [ -z "$MARKER" ]; then
    # Fresh install — no baseline yet. Adopt HEAD (the running engine + current ui/dist are presumed in sync;
    # the installer rebuilds then seeds this) rather than risk a surprise rebuild/restart; future deltas heal
    # from here. Written atomically.
    printf '%s\n' "$LOCAL" > "$MARK.tmp" 2>/dev/null && mv "$MARK.tmp" "$MARK" 2>/dev/null || true
    log "INIT deployed marker set to ${LOCAL:0:9} (no rebuild — fresh baseline)"
    exit 0
  fi
  force_full=0
  if ! "$GIT" merge-base --is-ancestor "$MARKER" "$LOCAL" 2>/dev/null; then
    # Marker present but NOT an ancestor of HEAD (history rewritten / force-push, or a corrupt marker). We
    # can't trust that the built artifacts match HEAD, so force a FULL rebuild rather than silently adopting a
    # possibly-stale dist — adopting would re-open the very bug this marker exists to close.
    force_full=1
    log "WARN deployed marker ${MARKER:0:9} not an ancestor of HEAD ${LOCAL:0:9} — forcing full rebuild"
  fi
  # Built artifacts are behind the checkout — reconcile. Take the shared git lock so we read a CONSISTENT
  # tree (the engine may be mid-rebase in this same worktree) and stamp exactly what we build; skip if the
  # engine holds it. No fast-forward / run-quiet wait is needed — the source is already committed and a build
  # only writes ui/dist.
  if ! gitlock_acquire; then
    log "SKIP engine git commit in progress (shared lock held) — retry next cycle"
    exit 0
  fi
  # §28: a build compiles the WORKING TREE, so refuse if any non-data (code/ops) file is dirty — tracked OR
  # untracked — otherwise an unreviewed local edit would be baked into the live bundle. Dirty engine DATA is
  # fine (it never affects the build).
  if has_nondata_dirty; then
    gitlock_release
    log "SKIP built behind HEAD but a dirty non-data (code/ops) file is present (incl. untracked) — refusing to bake unreviewed code into a release (§28) — retry next cycle"
    exit 0
  fi
  target="$("$GIT" rev-parse HEAD 2>/dev/null)"
  [ -n "$target" ] || { gitlock_release; log "WARN cannot resolve HEAD under lock — retry next cycle"; exit 0; }
  if [ "$force_full" = 1 ]; then
    CHANGED=$'ui/web/\nui/server/'   # force both a dist rebuild and an engine restart
  else
    CHANGED="$("$GIT" diff --name-only "$MARKER" "$target" 2>/dev/null)"
  fi
  gitlock_release
  log "SYNC built ${MARKER:0:9} behind HEAD ${target:0:9} (checkout advanced outside deploy) — reconciling"
  reconcile_build "$CHANGED" "$target"
  log "DONE ${target:0:9}"
  exit 0
fi

# origin/main must CONTAIN HEAD (pure fast-forward). If HEAD is ahead — a local data commit not
# yet pushed — skip; the next push reconciles. Never reset.
if ! "$GIT" merge-base --is-ancestor HEAD origin/main 2>/dev/null; then
  log "SKIP HEAD not an ancestor of origin/main (unpushed local commit?) local=${LOCAL:0:9} remote=${REMOTE:0:9}"
  exit 0
fi

# take the shared git lock so a concurrent engine data commit can't dirty the tree between this check and
# the merge (or collide on .git/index.lock mid-merge). Skip the cycle if the engine is mid-commit.
if ! gitlock_acquire; then
  log "SKIP engine git commit in progress (shared lock held) — retry next cycle"
  exit 0
fi

# Don't fight an in-flight run — but don't get PERMANENTLY stuck on stale engine-written data either.
# The engine writes TRACKED data (screener board/ledger) into this same worktree, so the old "skip on ANY
# dirty tracked file" guard would jam the deploy forever the moment one such write sat uncommitted (seen
# 2026-06-19: prod stuck 3 commits behind for hours while board/ledger were dirty, because the engine
# couldn't push them). Two checks:
#
# (1) §28 — never fast-forward + rebuild over an unreviewed code/ops edit. The engine only ever writes the
#     §28 data pathspecs (analyses/**, screener/**, analyses/tracking/**), so ANY other dirty path — tracked
#     OR untracked — is an unexpected local edit and must keep the conservative skip. has_nondata_dirty uses
#     `git status --porcelain`, so it sees untracked files too (git diff does not) — closing the hole where
#     an untracked .ts under ui/ would be compiled into the live bundle.
if has_nondata_dirty; then
  gitlock_release
  log "SKIP working tree dirty — non-data (code/ops) file present (incl. untracked) — refusing to bake unreviewed code into a release (§28) — retry next cycle"
  exit 0
fi
# (2) All dirty paths are engine DATA now. The only real hazard to a CODE fast-forward is an incoming
#     commit that ALSO touches a file currently dirty in the tree — a genuine ff conflict. Skip exactly that.
#     A non-overlapping, data-only dirty tree is ALWAYS safe to fast-forward over, EVEN while the engine is
#     actively writing it: `git merge --ff-only` only updates files in the incoming diff (never the dirty
#     data files) and refuses to clobber a locally-modified tracked file as the backstop; and the rebuild
#     compiles ui/web SOURCE, not data — a half-written data file can't reach the bundle.
#
#     We deliberately do NOT also gate on "a dirty data file was written in the last N seconds" (the old
#     RUN_QUIET_SECS guard). The 24/7 screener rewrites TRACKED data (screener/board/*.json,
#     screener/ledger/themes.ndjson) on essentially every cycle, so a dirty data file is PERMANENTLY a few
#     minutes old — that guard never saw its 15-min quiet window and jammed the deploy indefinitely
#     (2026-06-27: the whole globe set + engine PRs sat merged-but-not-live for ~an hour, prod stuck behind
#     main, because board/ledger were continuously dirty). Overlap + ff-only's own refusal-to-clobber are
#     the correct and sufficient guards; recency added no safety a code ff actually needs, only the jam.
if ! "$GIT" diff --quiet 2>/dev/null; then
  dirty="$("$GIT" diff --name-only 2>/dev/null)"
  incoming="$("$GIT" diff --name-only HEAD origin/main 2>/dev/null)"
  overlap="$(comm -12 <(printf '%s\n' "$dirty" | sort -u) <(printf '%s\n' "$incoming" | sort -u) 2>/dev/null)"
  if [ -n "$overlap" ]; then
    gitlock_release
    log "SKIP working tree dirty — incoming ff also changes a dirty file — retry next cycle"
    exit 0
  fi
  log "PROCEED tree dirty but all dirty files are non-overlapping engine data — ff is safe (ff-only refuses to clobber)"
fi

log "DEPLOY ${LOCAL:0:9} -> ${REMOTE:0:9}"
"$GIT" merge --ff-only origin/main >"$OPS/.merge.out" 2>&1; mrc=$?
gitlock_release   # merge done — release at once so the engine isn't blocked through the rebuild below
# keep the changed-file summary, drop git's gc/maintenance noise
grep -vE 'gc\.log|loose objects|Auto packing|git help gc|Please correct|Automatic cleanup|^warning:|^$' "$OPS/.merge.out" >> "$LOG" 2>/dev/null || true
if [ "$mrc" -ne 0 ]; then
  log "WARN ff-only merge failed (rc=$mrc) — retry next cycle"
  exit 0
fi

# Rebuild from the DEPLOYED marker (not merely from the old LOCAL) so any pre-existing dist staleness heals
# in the same pass; fall back to LOCAL when there is no usable marker.
build_base="$LOCAL"
[ -n "$MARKER" ] && "$GIT" merge-base --is-ancestor "$MARKER" "$REMOTE" 2>/dev/null && build_base="$MARKER"
CHANGED="$("$GIT" diff --name-only "$build_base" "$REMOTE" 2>/dev/null)"
reconcile_build "$CHANGED" "$REMOTE"
log "DONE ${REMOTE:0:9}"
exit 0
