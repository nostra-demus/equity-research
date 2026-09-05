#!/usr/bin/env bash
# Deterministic calibration publisher. This deliberately invokes no Claude/Codex process: the exact
# scoreboard math lives in scripts/calibrate.py, then the two derived outputs use the existing serialized
# research-data commit lane. Called after outcome reviews, by a daily fallback, and by the monthly backstop.
set -uo pipefail

REASON="${1:-scheduled}"
REPO="${ENGINE_REPO_ROOT:-$HOME/nostra-prod}"
LOG="${HOUSEKEEPING_LOG:-$HOME/Library/Logs/nostradamus-housekeeping.log}"

ts()  { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "$(ts) $*" >> "$LOG"; }

case "$REASON" in
  post-review|daily|monthly|manual) ;;
  *) log "CALIBRATE REFUSED unknown trigger '$REASON'"; exit 2 ;;
esac

cd "$REPO" 2>/dev/null || { log "CALIBRATE FATAL cannot cd $REPO"; exit 2; }
GIT_DIR="$(git rev-parse --git-dir 2>/dev/null)" || { log "CALIBRATE FATAL $REPO is not a git worktree"; exit 2; }
case "$GIT_DIR" in /*) ;; *) GIT_DIR="$REPO/$GIT_DIR" ;; esac
LOCK="$GIT_DIR/nostra-calibrate.lock.d"

# One writer across the post-review and scheduled paths. A clean invocation is seconds; a lock older than
# one hour can only be an orphan from a killed process and is reclaimed with rmdir (never recursive delete).
if ! mkdir "$LOCK" 2>/dev/null; then
  # A failed stat probe may emit stdout. Keep platform attempts separate, and never feed unknown or
  # malformed output into arithmetic: empty values become zero and shell expressions can be evaluated.
  if ! lock_epoch="$(stat -c %Y "$LOCK" 2>/dev/null)"; then
    lock_epoch="$(stat -f %m "$LOCK" 2>/dev/null)" || lock_epoch=""
  fi
  case "$lock_epoch" in
    ''|*[!0-9]*) log "CALIBRATE SKIP $REASON — lock age unavailable"; exit 0 ;;
  esac
  # Bound the integer before subtraction to prevent overflow; base 10 accepts padded timestamps.
  [ "${#lock_epoch}" -le 18 ] || { log "CALIBRATE SKIP $REASON — lock age unavailable"; exit 0; }
  lock_age=$(( $(date +%s) - 10#$lock_epoch ))
  if [ "$lock_age" -gt 3600 ]; then
    rmdir "$LOCK" 2>/dev/null || { log "CALIBRATE SKIP $REASON — lock contended"; exit 0; }
    mkdir "$LOCK" 2>/dev/null || { log "CALIBRATE SKIP $REASON — lock contended after reclaim"; exit 0; }
  else
    log "CALIBRATE SKIP $REASON — another deterministic calibration is active"
    exit 0
  fi
fi
trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT

log "CALIBRATE RUN $REASON (deterministic; no model quota)"
OUTPUT="$(python3 scripts/calibrate.py 2>&1)"
RC=$?
printf '%s\n' "$OUTPUT" >> "$LOG"
[ "$RC" -eq 0 ] || { log "CALIBRATE FAIL $REASON — core exit $RC"; exit "$RC"; }

JSON_PATHS="$(printf '%s\n' "$OUTPUT" | sed -n 's/^WROTE \(analyses\/performance\/.*_calibration_summary\.json\)$/\1/p')"
MD_PATHS="$(printf '%s\n' "$OUTPUT" | sed -n 's/^WROTE \(analyses\/performance\/.*_decision_performance_summary\.md\)$/\1/p')"
JSON_COUNT="$(printf '%s\n' "$JSON_PATHS" | awk 'NF { count += 1 } END { print count + 0 }')"
MD_COUNT="$(printf '%s\n' "$MD_PATHS" | awk 'NF { count += 1 } END { print count + 0 }')"
[ "$JSON_COUNT" -eq 1 ] && [ "$MD_COUNT" -eq 1 ] \
  || { log "CALIBRATE FAIL $REASON — deterministic core returned duplicate or missing output paths"; exit 3; }
JSON_PATH="$JSON_PATHS"
MD_PATH="$MD_PATHS"
case "$JSON_PATH:$MD_PATH" in
  analyses/performance/*.json:analyses/performance/*.md) ;;
  *) log "CALIBRATE FAIL $REASON — deterministic core did not return exactly scoped output paths"; exit 3 ;;
esac
[ -f "$JSON_PATH" ] && [ -f "$MD_PATH" ] \
  || { log "CALIBRATE FAIL $REASON — reported output is absent"; exit 3; }

COMMIT_OUTPUT="$(bash scripts/commit-run.sh \
  "Calibrate ledger: all — $(date +%Y-%m-%d) [$REASON]" -- "$JSON_PATH" "$MD_PATH" 2>&1)"
RC=$?
printf '%s\n' "$COMMIT_OUTPUT" >> "$LOG"
[ "$RC" -eq 0 ] || { log "CALIBRATE FAIL $REASON — publication exit $RC"; exit "$RC"; }
log "CALIBRATE DONE $REASON"

# A post-review call is tied to the equity ledger. Daily/monthly/manual are the provider-neutral
# backstops and must also refresh every discovered swarm that declares a deterministic calibrator.
[ "$REASON" = "post-review" ] && exit 0

DISCOVERED="$(python3 - <<'PY'
import pathlib, re
root = pathlib.Path('.claude/agents')
for manifest in sorted(root.glob('*/SWARM.md')):
    text = manifest.read_text(encoding='utf-8').split('---', 2)
    if len(text) < 3:
        continue
    front = text[1]
    values = {}
    for key in ('id', 'calibrator', 'calibration_root'):
        match = re.search(rf'(?m)^{key}:\s*([^#\n]+?)\s*$', front)
        values[key] = match.group(1).strip().strip(chr(34) + chr(39)) if match else ''
    if values['id'] and values['calibrator'] and values['calibration_root']:
        print('\t'.join((values['id'], values['calibrator'], values['calibration_root'])))
PY
)" || { log "CALIBRATE FAIL $REASON — could not discover swarm calibrators"; exit 3; }

while IFS=$'\t' read -r SWARM CALIBRATOR CALIBRATION_ROOT; do
  [ -n "$SWARM" ] || continue
  case "$CALIBRATOR:$CALIBRATION_ROOT" in
    scripts/*.py:*/*) ;;
    *) log "CALIBRATE FAIL $REASON — unsafe calibrator declaration for $SWARM"; exit 3 ;;
  esac
  SWARM_OUTPUT="$(python3 "$CALIBRATOR" 2>&1)"
  RC=$?
  printf '%s\n' "$SWARM_OUTPUT" >> "$LOG"
  [ "$RC" -eq 0 ] || { log "CALIBRATE FAIL $REASON — $SWARM core exit $RC"; exit "$RC"; }
  SWARM_PATHS=()
  while IFS= read -r WROTE_LINE; do
    case "$WROTE_LINE" in
      "WROTE $CALIBRATION_ROOT/"*)
        SWARM_PATH="${WROTE_LINE#WROTE }"
        case "$SWARM_PATH" in *" "*|*".."*|/*) log "CALIBRATE FAIL $REASON — unsafe $SWARM output"; exit 3 ;; esac
        [ -f "$SWARM_PATH" ] || { log "CALIBRATE FAIL $REASON — absent $SWARM output $SWARM_PATH"; exit 3; }
        SWARM_PATHS+=("$SWARM_PATH")
        ;;
      WROTE*) log "CALIBRATE FAIL $REASON — non-exact or out-of-root WROTE line from $SWARM"; exit 3 ;;
    esac
  done <<< "$SWARM_OUTPUT"
  [ "${#SWARM_PATHS[@]}" -gt 0 ] || { log "CALIBRATE FAIL $REASON — $SWARM reported no exact outputs"; exit 3; }
  SWARM_COMMIT="$(bash scripts/commit-run.sh \
    "Calibrate $SWARM — $(date +%Y-%m-%d) [$REASON]" -- "${SWARM_PATHS[@]}" 2>&1)"
  RC=$?
  printf '%s\n' "$SWARM_COMMIT" >> "$LOG"
  [ "$RC" -eq 0 ] || { log "CALIBRATE FAIL $REASON — $SWARM publication exit $RC"; exit "$RC"; }
  log "CALIBRATE DONE $REASON — $SWARM"
done <<< "$DISCOVERED"
