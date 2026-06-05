#!/usr/bin/env bash
# Self-healing watchdog for app.nostra-demus.com. Runs every ~60s under launchd
# (com.nostradamus.watchdog). It covers the failure modes launchd KeepAlive can't:
#   - a non-launchd process squatting :8787 (KeepAlive keeps EADDRINUSE-ing)
#   - the engine "up" but serving BROKEN content (the blank page: HTML returned for the JS bundle)
#   - the cloudflared tunnel being unreachable
# Repairs automatically after 2 consecutive failures (so a single transient blip doesn't flap),
# and logs every check/incident/repair to ~/Library/Logs/nostradamus-watchdog.log ("keep a track").
set -uo pipefail

REPO="/Users/chiraagkapil/equity-research"
PORT=8787
UID_NUM="$(id -u)"
LOG="$HOME/Library/Logs/nostradamus-watchdog.log"
STATE_DIR="$HOME/Library/Application Support/nostradamus"
FAILS="$STATE_DIR/watchdog.fails"
mkdir -p "$STATE_DIR" "$(dirname "$LOG")"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "$(ts) $*" >> "$LOG"; }
get_fails() { cat "$FAILS" 2>/dev/null || echo 0; }
set_fails() { echo "$1" > "$FAILS"; }

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
        launchctl kickstart -k "gui/$UID_NUM/com.nostradamus.engine" 2>/dev/null || true
        ;;
      engine-down)
        # clear any non-launchd squatter holding the port, then let launchd own it again
        lsof -ti:"$PORT" 2>/dev/null | xargs kill -9 2>/dev/null || true
        launchctl kickstart -k "gui/$UID_NUM/com.nostradamus.engine" 2>/dev/null || true
        ;;
      tunnel-down)
        launchctl kickstart -k "gui/$UID_NUM/com.nostradamus.tunnel" 2>/dev/null || true
        ;;
    esac
    set_fails 0   # reset after a repair so it recovers before any further action
  fi
else
  [ "$(get_fails)" != "0" ] && log "RECOVERED${detail:+ [$detail]}"
  set_fails 0
  # healthy: heartbeat at most ~hourly (and always on first run / fresh log) so the track shows
  # proof-of-life — you can tell at a glance the watchdog is alive — without becoming noise.
  hb_age=999999
  [ -f "$LOG" ] && hb_age=$(( $(date +%s) - $(stat -f %m "$LOG" 2>/dev/null || echo 0) ))
  { [ ! -f "$LOG" ] || [ "$hb_age" -ge 3300 ]; } && log "OK${detail:+ [$detail]} pub=${pub:-?}"
fi
