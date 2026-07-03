#!/usr/bin/env bash
# ---------------------------------------------------------------------------------------------------
# Unattended housekeeping runner for the always-on ("doer") host. Runs ONE headless Claude slash
# command from the PROD worktree, under a per-run USD budget cap, on a launchd StartCalendarInterval.
#
#   Usage (from a com.nostradamus.hk-*.plist):  housekeeping.sh <slash-command> [args...]
#     e.g.  housekeeping.sh /research:track all
#           housekeeping.sh /research:review-decisions due
#
# The five daily/monthly jobs (see scripts/ops/com.nostradamus.hk-*.plist):
#   /research:review-decisions due   — file due decision-outcome reviews (DUE-gated: skipped when nothing due)
#   /research:track all              — refresh the calls-tracker dashboard   (pure-local, ~free)
#   /screener:sweep                  — scan approved sources into the inbox  (one web pass)
#   /research:size all               — refresh the model paper-portfolio     (pure-local, ~free)
#   /research:calibrate all          — refresh the calibration summary       (pure-local, ~free; monthly)
#
# Safety: single-flight lock per command (an overrun can't stack), a hard timeout, a --max-budget-usd
# cap, --max-turns, bypassPermissions (headless — never hangs on a prompt), the review DUE gate, and it
# ALWAYS exits 0 (incidents live in the log, never mark the launchd job failed → no churn). These jobs
# write ONLY §28 data (analyses/tracking/**, screener/**, analyses/**) and commit via the engine's own
# commit-run.sh data lane, so they ride the same serialized-commit path as the cockpit.
# ---------------------------------------------------------------------------------------------------
set -uo pipefail

CMD="$*"                                                   # the full slash command, e.g. "/research:track all"
[ -n "$CMD" ] || { echo "usage: housekeeping.sh <slash-command> [args...]" >&2; exit 2; }
REPO="${ENGINE_REPO_ROOT:-$HOME/nostra-prod}"
LOG="${HOUSEKEEPING_LOG:-$HOME/Library/Logs/nostradamus-housekeeping.log}"
BUDGET="${HOUSEKEEPING_BUDGET_USD:-8}"                     # per-run HARD cap; tune per plist via EnvironmentVariables
MODEL="${HOUSEKEEPING_MODEL:-sonnet}"
MAXTURNS="${HOUSEKEEPING_MAX_TURNS:-150}"
TIMEOUT="${HOUSEKEEPING_TIMEOUT_SEC:-1800}"               # hard wall-clock kill (30 min) — no job should exceed this
mkdir -p "$(dirname "$LOG")" 2>/dev/null || true

# Authenticate the headless CLI the SAME way the engine does. A launchd-spawned `claude --print` cannot fall
# back to an interactive login, so it needs credentials in its environment: ANTHROPIC_API_KEY or
# CLAUDE_CODE_OAUTH_TOKEN. The engine gets these by loading ~/.config/nostra-engine/providers.env at startup
# (ui/server/src/load-env.ts); mirror that here so housekeeping authenticates identically. If the file is
# absent we still proceed — `claude` may use a stored `claude login` / `setup-token` credential instead.
ENGINE_CONFIG_DIR="${NOSTRA_ENGINE_CONFIG_DIR:-$HOME/.config/nostra-engine}"
[ -f "$ENGINE_CONFIG_DIR/providers.env" ] && { set -a; . "$ENGINE_CONFIG_DIR/providers.env"; set +a; }

ts()  { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "$(ts) $*" >> "$LOG"; }

# keep the log bounded (~last 1500 lines once it passes 6000)
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG" 2>/dev/null || echo 0)" -gt 6000 ]; then
  tail -n 1500 "$LOG" > "$LOG.tmp" 2>/dev/null && mv "$LOG.tmp" "$LOG"
fi

# resolve the Claude CLI to an absolute path (launchd has a minimal PATH) — mirror ui/server/src/config.ts
# resolveClaudeBin(), plus the Intel /usr/local prefix.
resolve_claude_bin() {
  [ -n "${CLAUDE_BIN:-}" ] && { printf '%s' "$CLAUDE_BIN"; return; }
  local c
  for c in "$HOME/.local/bin/claude" /opt/homebrew/bin/claude /usr/local/bin/claude; do
    [ -x "$c" ] && { printf '%s' "$c"; return; }
  done
  printf '%s' claude
}
BIN="$(resolve_claude_bin)"

cd "$REPO" 2>/dev/null || { log "FATAL cannot cd $REPO — is the prod worktree present?"; exit 0; }

# single-flight per command (mkdir lock keyed on the command hash) so a slow run can't overlap its next fire
LOCK="${TMPDIR:-/tmp}/nostra-hk-$(printf '%s' "$CMD" | shasum 2>/dev/null | awk '{print $1}').lock.d"
if ! mkdir "$LOCK" 2>/dev/null; then log "SKIP $CMD — a previous run is still active"; exit 0; fi
trap 'rmdir "$LOCK" 2>/dev/null' EXIT

# DUE gate (review-decisions only): review_due.py prints to stdout ONLY when something is due and ALWAYS
# exits 0 — so gate on stdout being NON-EMPTY, never on the exit code. Skips the paid turn when nothing's due.
case "$CMD" in
  *review-decisions*)
    if [ -z "$(python3 .claude/hooks/review_due.py 2>/dev/null)" ]; then
      log "SKIP review-decisions — review_due reports nothing due"; exit 0
    fi ;;
esac

# assemble flags the installed CLI actually supports (mirrors launcher.ts detectFlags), so a CLI without a
# given flag degrades gracefully instead of erroring out. Build the supported-flag SET once from --help and
# test exact membership (not a substring match — a naive grep for "--" matches every long option).
SUPPORTED="$("$BIN" --help 2>/dev/null | grep -oE -- '--[a-z][a-z0-9-]+' | sort -u || true)"
have() { printf '%s\n' "$SUPPORTED" | grep -qxF -- "$1"; }
ARGS=(--print "$CMD" --output-format stream-json --verbose)
if have '--permission-mode'; then ARGS+=(--permission-mode bypassPermissions)
elif have '--dangerously-skip-permissions'; then ARGS+=(--dangerously-skip-permissions); fi
have '--model'          && ARGS+=(--model "$MODEL")
have '--max-turns'      && ARGS+=(--max-turns "$MAXTURNS")
have '--max-budget-usd' && ARGS+=(--max-budget-usd "$BUDGET")

log "RUN $CMD (budget \$$BUDGET model $MODEL timeout ${TIMEOUT}s)"
"$BIN" "${ARGS[@]}" >> "$LOG" 2>&1 &
CLPID=$!
# hard timeout watcher: TERM then KILL if the run overruns (portable — macOS has no `timeout`)
( sleep "$TIMEOUT"; kill -0 "$CLPID" 2>/dev/null && { echo "$(ts) TIMEOUT ${TIMEOUT}s — killing $CMD" >> "$LOG"; \
    kill -TERM "$CLPID" 2>/dev/null; sleep 5; kill -KILL "$CLPID" 2>/dev/null; } ) &
WPID=$!
wait "$CLPID" 2>/dev/null; rc=$?
kill "$WPID" 2>/dev/null || true; wait "$WPID" 2>/dev/null || true
log "DONE $CMD (exit $rc)"
exit 0
