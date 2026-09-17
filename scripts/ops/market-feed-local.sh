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

# EVERY EXIT SAYS WHAT HAPPENED, where the engine can read it. Each of the skips below used to leave one
# line in a log nobody opens, so a feed that had not refreshed for weeks looked exactly like one that had:
# an empty benchmark line and no other symptom. This is the same convention the connector supervisor
# already uses (~/.nostra-ops/connector-supervisor.json), so the engine reads it the same way.
STATUS="${MARKET_FEED_STATUS:-$HOME/.nostra-ops/market-feed.json}"
note() { # note <ok|failed|skipped> <detail>
  local at detail raw
  at="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  raw="${2:-}"
  # Bound the detail before it is stored. fetch_market_feed.py echoes provider output (up to its 8 MiB
  # response cap) into its final error line, and /api/health serves refresh.detail back to every caller on
  # every ~20s heartbeat — so a malformed, provider-controlled long CSV row must not become a multi-KiB
  # status file amplified across polls. Truncate the raw text first (before escaping, so a quote/backslash
  # can never be cut mid-escape).
  if [ "${#raw}" -gt 300 ]; then raw="${raw:0:300}..."; fi
  detail="$(printf '%s' "$raw" | tr -d '\000-\037' | sed 's/\\/\\\\/g; s/"/\\"/g')"
  # A status that says "ok" and nothing else is barely better than no status: it cannot be told apart from
  # a run whose output was lost. Every outcome carries words.
  [ -n "$detail" ] || detail="no detail reported"
  mkdir -p "$(dirname "$STATUS")" 2>/dev/null || return 0
  printf '{"at":"%s","outcome":"%s","detail":"%s"}\n' "$at" "$1" "$detail" > "$STATUS.tmp" 2>/dev/null || return 0
  mv -f "$STATUS.tmp" "$STATUS" 2>/dev/null || return 0
}

# These two breadcrumbs fire BEFORE $POOL_ROOT / redact_pool_path exist, and $REPO is a filesystem path that
# carries the owner's account identity (e.g. /Users/<owner>/nostra-prod). /api/health serves refresh.detail
# back to every caller, so the path must never reach the status detail — it stays in the local $LOG only
# (CLAUDE.md §2: private identities never in logs that leave the machine; matches redact_pool_path's reason).
cd "$REPO" 2>/dev/null || { log "MARKET-FEED FATAL cannot cd $REPO"; note failed "cannot reach the engine checkout (see the housekeeping log)"; exit 2; }
GIT_DIR="$(git rev-parse --git-dir 2>/dev/null)" || { log "MARKET-FEED FATAL $REPO is not a git worktree"; note failed "the engine checkout is not a git worktree (see the housekeeping log)"; exit 2; }
case "$GIT_DIR" in /*) ;; *) GIT_DIR="$REPO/$GIT_DIR" ;; esac
LOCK="$GIT_DIR/nostra-market-feed.lock.d"

# One writer at a time. A lock older than an hour can only be an orphan from a killed process and is
# reclaimed with rmdir (never recursive delete) — the fetch itself normally completes in seconds.
if ! mkdir "$LOCK" 2>/dev/null; then
  # A failed stat probe may emit stdout. Keep platform attempts separate, and never feed unknown or
  # malformed output into arithmetic: empty values become zero and shell expressions can be evaluated.
  if ! lock_epoch="$(stat -c %Y "$LOCK" 2>/dev/null)"; then
    lock_epoch="$(stat -f %m "$LOCK" 2>/dev/null)" || lock_epoch=""
  fi
  case "$lock_epoch" in
    ''|*[!0-9]*) log "MARKET-FEED SKIP — lock age unavailable"; note skipped "another refresh holds the lock and its age cannot be read"; exit 0 ;;
  esac
  # Bound the integer before subtraction to prevent overflow; base 10 accepts padded timestamps.
  [ "${#lock_epoch}" -le 18 ] || { log "MARKET-FEED SKIP — lock age unavailable"; note skipped "another refresh holds the lock and its age cannot be read"; exit 0; }
  lock_age=$(( $(date +%s) - 10#$lock_epoch ))
  if [ "$lock_age" -gt 3600 ]; then
    rmdir "$LOCK" 2>/dev/null || { log "MARKET-FEED SKIP — lock contended"; note skipped "another refresh is active"; exit 0; }
    mkdir "$LOCK" 2>/dev/null || { log "MARKET-FEED SKIP — lock contended after reclaim"; note skipped "another refresh is active"; exit 0; }
  else
    log "MARKET-FEED SKIP — another refresh is active"
    note skipped "another refresh is active"
    exit 0
  fi
fi
trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT

# UI/tunnel failover never transfers the permanent pool-writer identity. Recheck it and the live Drive
# projection on each run, including old/stale installed timers; never create an absent local data tree.
#
# THE FENCE STAYS, and writing the feed somewhere else instead would be worse than not writing it. The pool
# lives in Drive, which resolves two writers of one path by keeping BOTH — the "file 2.csv" copies this
# repository already carries. A second machine refreshing the same dated feed file is exactly how that
# happens, and the reader would then take whichever copy it read last. So a machine that is not the
# canonical writer does not write: it says so, which is the part that was missing.
SUPERVISOR="$REPO/scripts/ops/connector-supervisor.py"
if [ ! -f "$SUPERVISOR" ] || [ -L "$SUPERVISOR" ] \
    || ! POOL_ROOT="$(python3 -I "$SUPERVISOR" --pool-writer-root 2>>"$LOG")"; then
  log "MARKET-FEED SKIP — canonical pool writer or Drive projection is unavailable"
  note skipped "this machine is not the canonical pool writer, or the Drive projection is unavailable"
  exit 0
fi
# redact_pool_path <text> — never let $POOL_ROOT leave this machine in a status/detail field. It is a
# Drive-mounted projection path and can carry the owner's Drive account identity, which stays owner-only
# (see scripts/ops/MAC_PRO_RUNBOOK.md). fetch_market_feed.py's own success line ends "-> <full path>", and
# note()'s detail is served straight back out through /api/health to every caller — so redact it before
# it is ever recorded, not after.
redact_pool_path() {
  local text="$1"
  text="${text%% -> *}" # drop the printed "-> /abs/path/under/$POOL_ROOT" suffix
  if [ -n "${POOL_ROOT:-}" ]; then
    text="${text//"$POOL_ROOT"/<pool>}" # defense in depth: strip it wherever else it might appear
  fi
  printf '%s' "$text"
}

log "MARKET-FEED RUN (deterministic; no model quota)"
OUTPUT="$(python3 scripts/fetch_market_feed.py --data-root "$POOL_ROOT" 2>&1)"
RC=$?
printf '%s\n' "$OUTPUT" >> "$LOG"
[ "$RC" -eq 0 ] || {
  log "MARKET-FEED FAIL — exit $RC"
  note failed "$(redact_pool_path "$(printf '%s' "$OUTPUT" | tail -n 1)")"
  exit "$RC"
}
log "MARKET-FEED DONE"
note ok "$(redact_pool_path "$(printf '%s' "$OUTPUT" | tail -n 1)")"
