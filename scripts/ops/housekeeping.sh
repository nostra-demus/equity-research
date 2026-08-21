#!/usr/bin/env bash
# Retired compatibility shim for the former direct-Claude housekeeping timers.
#
# Paid automatic review/track/sweep/size work must inherit a recorded provider/profile and pass through
# the cockpit launcher (admission, quota pause, cancellation, activity and supervisor publication). A
# launchd shell has neither a source decision identity nor the supervisor capability, so it must never
# choose Claude/Codex on its own. `install-services.sh` removes the old hk-* agents during every full
# install. Keep this shim only so a stale installed plist fails visibly and spends no model quota.
set -uo pipefail

CMD="$*"
[ -n "$CMD" ] || { echo "usage: housekeeping.sh <retired-slash-command> [args...]" >&2; exit 2; }
LOG="${HOUSEKEEPING_LOG:-$HOME/Library/Logs/nostradamus-housekeeping.log}"
mkdir -p "$(dirname "$LOG")" 2>/dev/null || true
ts() { date '+%Y-%m-%d %H:%M:%S'; }

case "$CMD" in
  *review-decisions*) reason="due reviews are owned by the tracked review-dispatch loop" ;;
  /research:track*) reason="cross-run tracking has no single inherited provider; run it from the cockpit" ;;
  /screener:sweep*) reason="a source-less timer has no recorded provider; run a tracked cockpit sweep" ;;
  /research:size*) reason="cross-decision sizing has no single inherited provider; run it from the cockpit" ;;
  *) reason="unrecognized direct model housekeeping command" ;;
esac

echo "$(ts) RETIRED $CMD — $reason; no provider process was started" >> "$LOG"
exit 0
