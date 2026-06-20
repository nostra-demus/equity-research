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
# Safe by construction:
#   • ff-only      — never reset/discard; if HEAD is ahead (an unpushed data commit) it SKIPS
#   • skip-if-dirty — never fights a research/screener run mid-write
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
trap 'gitlock_release; rmdir "$LOCKDIR" 2>/dev/null' EXIT

cd "$PROD" 2>/dev/null || { log "FATAL cannot cd $PROD"; exit 0; }

# ---- fetch (no working-tree mutation, no index lock) ----
# route fetch stderr to a side file so git's gc/maintenance warnings never pollute the deploy log;
# only surface it when the fetch actually fails.
"$GIT" fetch --quiet origin main 2>"$OPS/.fetch.err" || { log "WARN git fetch failed: $(tail -1 "$OPS/.fetch.err" 2>/dev/null)"; exit 0; }

LOCAL="$("$GIT" rev-parse HEAD 2>/dev/null)"
REMOTE="$("$GIT" rev-parse origin/main 2>/dev/null)"
[ -n "$LOCAL" ] && [ -n "$REMOTE" ] || { log "WARN cannot resolve revs"; exit 0; }

if [ "$LOCAL" = "$REMOTE" ]; then
  # up to date — heartbeat at most ~hourly so the log proves the watcher is alive
  hb_age=999999
  [ -f "$LOG" ] && hb_age=$(( $(date +%s) - $(stat -f %m "$LOG" 2>/dev/null || echo 0) ))
  [ "$hb_age" -ge "$HEARTBEAT" ] && log "OK up-to-date ${LOCAL:0:9}"
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
# couldn't push them). Refine it: skip ONLY when the dirty tree looks like a real reason to wait —
#   • a dirty file that is NOT engine-written data (any code/ops/doc/config edit) — never fast-forward
#     over an unreviewed local edit: the ff + rebuild/restart below would bake it into the live deploy,
#     defeating CLAUDE.md §28 (code must go through PR → CI → review). The engine only ever writes the
#     §28 data pathspecs (analyses/**, screener/**, analyses/tracking/**), so anything outside them is
#     unexpected and must keep the conservative skip, OR
#   • a dirty DATA file the incoming fast-forward would ALSO change (a genuine merge collision), OR
#   • a dirty DATA file written within RUN_QUIET_SECS (a run is probably mid-write).
# A stale, non-overlapping, data-ONLY dirty tree is safe to fast-forward over: `git merge --ff-only`
# itself refuses to clobber a locally-modified file, so it stays the backstop if this heuristic is wrong.
RUN_QUIET_SECS="${DEPLOY_RUN_QUIET_SECS:-900}"   # 15 min with no writes ⇒ no run is mid-write
is_data_path() { case "$1" in analyses/tracking/*|analyses/*|screener/*) return 0 ;; *) return 1 ;; esac; }
if ! "$GIT" diff --quiet 2>/dev/null; then
  dirty="$("$GIT" diff --name-only 2>/dev/null)"
  incoming="$("$GIT" diff --name-only HEAD origin/main 2>/dev/null)"
  overlap="$(comm -12 <(printf '%s\n' "$dirty" | sort -u) <(printf '%s\n' "$incoming" | sort -u) 2>/dev/null)"
  recent=0; nondata=0
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    is_data_path "$f" || { nondata=1; break; }
    [ -e "$f" ] || continue
    age=$(( $(date +%s) - $(stat -f %m "$f" 2>/dev/null || echo 0) ))
    [ "$age" -lt "$RUN_QUIET_SECS" ] && { recent=1; break; }
  done <<< "$dirty"
  if [ "$nondata" = 1 ] || [ -n "$overlap" ] || [ "$recent" = 1 ]; then
    gitlock_release
    if   [ "$nondata" = 1 ]; then why="dirty non-data (code/ops) file present — refusing to bake unreviewed local code into a release (§28)"
    elif [ -n "$overlap" ];  then why="incoming ff also changes a dirty file"
    else why="run mid-write (<${RUN_QUIET_SECS}s)"; fi
    log "SKIP working tree dirty — $why — retry next cycle"
    exit 0
  fi
  log "PROCEED tree dirty but all dirty files are stale & non-overlapping engine data — ff is safe (ff-only refuses to clobber)"
fi

CHANGED="$("$GIT" diff --name-only HEAD origin/main 2>/dev/null)"
log "DEPLOY ${LOCAL:0:9} -> ${REMOTE:0:9}"
"$GIT" merge --ff-only origin/main >"$OPS/.merge.out" 2>&1; mrc=$?
gitlock_release   # merge done — release at once so the engine isn't blocked through the rebuild below
# keep the changed-file summary, drop git's gc/maintenance noise
grep -vE 'gc\.log|loose objects|Auto packing|git help gc|Please correct|Automatic cleanup|^warning:|^$' "$OPS/.merge.out" >> "$LOG" 2>/dev/null || true
if [ "$mrc" -ne 0 ]; then
  log "WARN ff-only merge failed (rc=$mrc) — retry next cycle"
  exit 0
fi

web=0; server=0; weblock=0; serverlock=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in
    ui/web/package-lock.json|ui/web/package.json)        weblock=1; web=1 ;;
    ui/server/package-lock.json|ui/server/package.json)  serverlock=1; server=1 ;;
    ui/web/*)     web=1 ;;
    ui/server/*)  server=1 ;;
  esac
done <<< "$CHANGED"

if [ "$web" = 1 ]; then
  if [ "$weblock" = 1 ]; then log "  npm ci ui/web (deps changed)"; ( cd "$PROD/ui/web" && "$NPM" ci ) >>"$LOG" 2>&1 || log "  WARN ui/web npm ci failed"; fi
  log "  rebuild ui/dist"
  if ( cd "$PROD/ui/web" && "$NPM" run build ) >>"$LOG" 2>&1; then log "  ui/dist rebuilt — live"; else log "  WARN ui/web build failed"; fi
fi

if [ "$server" = 1 ]; then
  ci_ok=1
  if [ "$serverlock" = 1 ]; then
    log "  npm ci ui/server (deps changed)"
    # If deps fail to install, DON'T restart: a kickstart would bring the engine up against broken/half-
    # installed node_modules and take the site DOWN. Leaving the running process untouched keeps prod UP
    # on its current (in-memory) version until the lockfile is fixed — strictly safer than restarting blind.
    ( cd "$PROD/ui/server" && "$NPM" ci ) >>"$LOG" 2>&1 || { ci_ok=0; log "  WARN ui/server npm ci failed — NOT restarting; engine stays up on its current deps. Fix it, then: launchctl kickstart -k gui/$UID_NUM/com.nostradamus.engine"; }
  fi
  if [ "$ci_ok" = 1 ]; then
    log "  restart engine (server code changed)"
    launchctl kickstart -k "gui/$UID_NUM/com.nostradamus.engine" 2>>"$LOG" || log "  WARN engine kickstart failed"
  fi
fi

# self-update the installed ops scripts when they change on main (atomic temp+mv; safe mid-run)
case "$CHANGED" in
  *scripts/ops/watchdog.sh*)
    sed 's#^REPO="/Users/chiraagkapil/equity-research"#REPO="${ENGINE_REPO_ROOT:-/Users/chiraagkapil/equity-research}"#' \
      "$PROD/scripts/ops/watchdog.sh" > "$OPS/watchdog.sh.tmp" 2>/dev/null \
      && chmod +x "$OPS/watchdog.sh.tmp" && mv "$OPS/watchdog.sh.tmp" "$OPS/watchdog.sh" && log "  refreshed ops/watchdog.sh" ;;
esac
case "$CHANGED" in
  *scripts/ops/deploy.sh*)
    cp "$PROD/scripts/ops/deploy.sh" "$OPS/deploy.sh.tmp" 2>/dev/null \
      && chmod +x "$OPS/deploy.sh.tmp" && mv "$OPS/deploy.sh.tmp" "$OPS/deploy.sh" && log "  refreshed ops/deploy.sh (self-update)" ;;
esac

[ "$web" = 0 ] && [ "$server" = 0 ] && log "  (data/docs only — no rebuild)"
log "DONE ${REMOTE:0:9}"
exit 0
