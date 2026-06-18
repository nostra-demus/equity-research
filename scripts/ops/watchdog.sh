#!/usr/bin/env bash
# Self-healing watchdog for app.nostra-demus.com. Runs every ~60s under launchd
# (com.nostradamus.watchdog). It covers the failure modes launchd KeepAlive can't:
#   - a non-launchd process squatting :8787 (KeepAlive keeps EADDRINUSE-ing)
#   - the engine "up" but serving BROKEN content (the blank page: HTML returned for the JS bundle)
#   - the cloudflared tunnel being unreachable
# Repairs automatically after 2 consecutive failures (so a single transient blip doesn't flap),
# and logs every check/incident/repair to ~/Library/Logs/nostradamus-watchdog.log ("keep a track").
set -uo pipefail

REPO="${ENGINE_REPO_ROOT:-/Users/chiraagkapil/equity-research}"
PORT=8787
UID_NUM="$(id -u)"
AGENTS_DIR="$HOME/Library/LaunchAgents"
LOG="$HOME/Library/Logs/nostradamus-watchdog.log"
STATE_DIR="$HOME/Library/Application Support/nostradamus"
FAILS="$STATE_DIR/watchdog.fails"
mkdir -p "$STATE_DIR" "$(dirname "$LOG")"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "$(ts) $*" >> "$LOG"; }
get_fails() { cat "$FAILS" 2>/dev/null || echo 0; }
set_fails() { echo "$1" > "$FAILS"; }
# Recover an agent even if it was booted OUT (not just crashed): `kickstart` cannot start an
# unloaded agent, so bootstrap first when it is gone, THEN (re)start. This is exactly what was
# missing when a failed installer left the engine booted-out and the watchdog could not bring it back.
ensure_up() {
  launchctl print "gui/$UID_NUM/$1" >/dev/null 2>&1 \
    || launchctl bootstrap "gui/$UID_NUM" "$AGENTS_DIR/$1.plist" 2>/dev/null || true
  launchctl kickstart -k "gui/$UID_NUM/$1" 2>/dev/null || true
}

# keep the log bounded (~last 1000 lines once it passes 5000)
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG" 2>/dev/null || echo 0)" -gt 5000 ]; then
  tail -n 1000 "$LOG" > "$LOG.tmp" 2>/dev/null && mv "$LOG.tmp" "$LOG"
fi

problem=""; detail=""; pub=""

# 1) engine process/health
if ! curl -fsS --max-time 5 "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1; then
  problem="engine-down"
else
  # 2) CONTENT health — the served bundle must come back as real JS. If it's HTML/404, the SPA is blank.
  ref="$(curl -fsS --max-time 5 "http://127.0.0.1:$PORT/" 2>/dev/null | grep -oE 'assets/index-[A-Za-z0-9_-]+\.js' | head -1)"
  if [ -z "$ref" ]; then
    problem="no-bundle-ref"
  else
    ct="$(curl -fsS -o /dev/null -w '%{http_code}:%{content_type}' --max-time 5 "http://127.0.0.1:$PORT/$ref" 2>/dev/null || echo '000:')"
    case "$ct" in
      200:*javascript*) detail="$ref ok" ;;
      *) problem="bundle-not-js"; detail="$ref -> $ct" ;;
    esac
  fi
fi

# 3) tunnel / public reachability (only checked when the engine is locally healthy)
if [ -z "$problem" ]; then
  pub="$(curl -s -o /dev/null -w '%{http_code}' --max-time 8 "https://app.nostra-demus.com/api/health" 2>/dev/null || echo 000)"
  [ "$pub" = "000" ] && { problem="tunnel-down"; detail="pub=$pub"; }
fi

if [ -n "$problem" ]; then
  n=$(( $(get_fails) + 1 )); set_fails "$n"
  log "FAIL($n) $problem${detail:+ [$detail]}"
  if [ "$n" -ge 2 ]; then
    log "HEAL $problem"
    case "$problem" in
      bundle-not-js|no-bundle-ref)
        log "  rebuilding ui/web (dist looks corrupt/missing)"
        ( cd "$REPO" && /opt/homebrew/bin/npm --prefix ui/web run build ) >> "$LOG" 2>&1 || log "  WARN web build failed"
        lsof -ti:"$PORT" 2>/dev/null | xargs kill -9 2>/dev/null || true
        ensure_up com.nostradamus.engine
        ;;
      engine-down)
        # clear any non-launchd squatter holding the port, then ensure launchd owns it again —
        # bootstrap if the agent was booted OUT, not merely crashed (kickstart alone can't).
        lsof -ti:"$PORT" 2>/dev/null | xargs kill -9 2>/dev/null || true
        ensure_up com.nostradamus.engine
        ;;
      tunnel-down)
        ensure_up com.nostradamus.tunnel
        ;;
    esac
    set_fails 0                  # reset so the repair gets a cycle to take effect before any re-heal
    : > "$STATE_DIR/healing"     # marker: the next healthy check writes an explicit RECOVERED line
  fi
else
  if [ "$(get_fails)" != "0" ] || [ -f "$STATE_DIR/healing" ]; then
    log "RECOVERED${detail:+ [$detail]}"; rm -f "$STATE_DIR/healing"
  fi
  set_fails 0
  # healthy: heartbeat at most ~hourly (and always on first run / fresh log) so the track shows
  # proof-of-life — you can tell at a glance the watchdog is alive — without becoming noise.
  hb_age=999999
  [ -f "$LOG" ] && hb_age=$(( $(date +%s) - $(stat -f %m "$LOG" 2>/dev/null || echo 0) ))
  { [ ! -f "$LOG" ] || [ "$hb_age" -ge 3300 ]; } && log "OK${detail:+ [$detail]} pub=${pub:-?}"
fi

# 4) THE STORY (enrich) read health — defense-in-depth ON TOP OF the engine's own per-cycle heal pass.
# Low-frequency (~30 min) and only when the engine is locally healthy this cycle. A high ON-WIRE degraded
# rate means article reads are regressing in a way the in-engine heal can't fix on its own (LLM keys expired,
# provider chain broken, the heal pass silently not firing) — exactly the "frozen useless story" class of
# bug. Log the incident and attempt an INDEPENDENT heal via the engine API. Never fatal; bounded by the
# timestamp gate so it can't run every 60s.
if [ -z "$problem" ]; then
  eh_age=999999
  [ -f "$STATE_DIR/enrich-health.at" ] && eh_age=$(( $(date +%s) - $(stat -f %m "$STATE_DIR/enrich-health.at" 2>/dev/null || echo 0) ))
  if [ "$eh_age" -ge 1800 ]; then
    touch "$STATE_DIR/enrich-health.at"
    if ! ( cd "$REPO" && ENGINE_STATE_DIR="$REPO/ui/server/.state" /opt/homebrew/bin/npm --prefix ui/server run --silent enrich:health -- --strict ) >/dev/null 2>&1; then
      log "ENRICH-DEGRADED — article reads regressing; attempting independent heal"
      ( cd "$REPO" && ENGINE_STATE_DIR="$REPO/ui/server/.state" /opt/homebrew/bin/npm --prefix ui/server run --silent enrich:health -- --heal ) >> "$LOG" 2>&1 || log "  WARN enrich heal failed"
    fi
  fi
fi

# Always succeed once the checks ran: incidents live in the LOG, not the exit code. Without this a
# healthy run that writes no heartbeat would exit 1 (shell-false &&) and read as "failed" in
# `launchctl list` — misleading for the very command used to confirm the watchdog is alive.
exit 0
