#!/usr/bin/env bash
# Deterministic S&P 500 benchmark-feed refresh. This deliberately invokes no Claude/Codex process: the
# fetch itself lives in scripts/fetch_market_feed.py, which writes data/_market/fred/sp500_<as_of>.csv
# (+ a provenance sidecar) via the connectors' own SSRF-bounded fetch_bytes. data/ is a symlink into
# Google Drive and is gitignored (frameworks/MARKET_FEED.md) — the feed is a local file drop every
# /research:calibrate and /research:review-decisions run on THIS machine already knows how to read
# (scripts/market_prices.py), so unlike calibrate-local.sh this never calls commit-run.sh.
set -uo pipefail

REPO="${ENGINE_REPO_ROOT:-$HOME/nostra-prod}"
LOG="${HOUSEKEEPING_LOG:-$HOME/Library/Logs/nostradamus-housekeeping.log}"

ts()  { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "$(ts) $*" >> "$LOG"; }

cd "$REPO" 2>/dev/null || { log "MARKET-FEED FATAL cannot cd $REPO"; exit 2; }
GIT_DIR="$(git rev-parse --git-dir 2>/dev/null)" || { log "MARKET-FEED FATAL $REPO is not a git worktree"; exit 2; }
case "$GIT_DIR" in /*) ;; *) GIT_DIR="$REPO/$GIT_DIR" ;; esac
LOCK="$GIT_DIR/nostra-market-feed.lock.d"

# One writer at a time. A lock older than an hour can only be an orphan from a killed process and is
# reclaimed with rmdir (never recursive delete) — the fetch itself normally completes in seconds.
if ! mkdir "$LOCK" 2>/dev/null; then
  # If neither stat variant can read the lock's mtime, fall back to NOW (age 0) — never epoch 0. Defaulting
  # to 0 would compute a huge lock_age and trip the >3600 orphan-reclaim below, rmdir'ing a lock a live
  # writer still holds and allowing two fetchers to run at once. An unknown age must fail CLOSED (skip).
  lock_epoch="$(stat -c %Y "$LOCK" 2>/dev/null || stat -f %m "$LOCK" 2>/dev/null || date +%s)"
  lock_age=$(( $(date +%s) - lock_epoch ))
  if [ "$lock_age" -gt 3600 ]; then
    rmdir "$LOCK" 2>/dev/null || { log "MARKET-FEED SKIP — lock contended"; exit 0; }
    mkdir "$LOCK" 2>/dev/null || { log "MARKET-FEED SKIP — lock contended after reclaim"; exit 0; }
  else
    log "MARKET-FEED SKIP — another refresh is active"
    exit 0
  fi
fi
trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT

# UI/tunnel failover never transfers the permanent pool-writer identity. Recheck it and the live Drive
# projection on each run, including old/stale installed timers; never create an absent local data tree.
SUPERVISOR="$REPO/scripts/ops/connector-supervisor.py"
if [ ! -f "$SUPERVISOR" ] || [ -L "$SUPERVISOR" ] \
    || ! POOL_ROOT="$(python3 -I "$SUPERVISOR" --pool-writer-root 2>>"$LOG")"; then
  log "MARKET-FEED SKIP — canonical pool writer or Drive projection is unavailable"
  exit 0
fi

log "MARKET-FEED RUN (deterministic; no model quota)"
OUTPUT="$(python3 scripts/fetch_market_feed.py --data-root "$POOL_ROOT" 2>&1)"
RC=$?
printf '%s\n' "$OUTPUT" >> "$LOG"
[ "$RC" -eq 0 ] || { log "MARKET-FEED FAIL — exit $RC"; exit "$RC"; }
log "MARKET-FEED DONE"
