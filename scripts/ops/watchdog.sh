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

# Keep the timer-driven agents alive. They have no HTTP endpoint to probe, so the health checks below
# can't cover them — but if the auto-deploy watcher or the news archiver got booted OUT (a failed
# install, a stray bootout), nothing else would bring them back and deploys would silently stall.
# Bootstrap-if-gone every cycle is cheap (no kickstart, no restart when already loaded), so the
# pipeline that makes "merge to main -> live" work is itself self-healing.
for ag in com.nostradamus.deploy com.nostradamus.news-archive; do
  launchctl print "gui/$UID_NUM/$ag" >/dev/null 2>&1 \
    || { launchctl bootstrap "gui/$UID_NUM" "$AGENTS_DIR/$ag.plist" 2>/dev/null && log "RECOVERED $ag (was booted out)"; }
done

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

# Kill a STRAY second engine on a non-:8787 port (a duplicate node doubling filesystem/LLM load — the
# :8799 incident). Bounded to known stray ports, never :8787 (launchd owns that). Skipped only when the
# engine is locally DOWN this cycle, so we never fight a real engine-down repair.
if [ "$problem" != "engine-down" ]; then
  extra="$(lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null | awk '/node/ && /:(8788|8789|879[0-9])/{print $2}' | sort -u)"
  if [ -n "$extra" ]; then
    log "DUP-ENGINE strays on non-8787 ports pids=$(echo "$extra" | tr '\n' ' ')— killing"
    echo "$extra" | xargs kill -9 2>/dev/null || true
  fi
fi

# 3) tunnel / public reachability (only checked when the engine is locally healthy). Capture the HTTP
#    code, total time, AND the x-engine-status header so we can tell apart three distinct states:
#      - dead tunnel       (code 000, or a Cloudflare 5xx >= 520)        -> re-kick the tunnel
#      - public-offline    (edge serving offline while local /api/health is fast: x-engine-status:offline
#                           or a 503) -> the tunnel dropped or the edge can't reach the origin; re-kick it.
#                           (The OLD check only caught code==000, so this whole class self-healed never.)
#      - slow-but-working  (200, just slow) -> LOG only, never heal (healing a working path = churn).
if [ -z "$problem" ]; then
  hdr="$STATE_DIR/pub.hdr"
  pub_meta="$(curl -s -o /dev/null -D "$hdr" -w '%{http_code} %{time_total}' --max-time 12 "https://app.nostra-demus.com/api/health" 2>/dev/null || echo '000 0')"
  pub="${pub_meta%% *}"; pub_time="${pub_meta##* }"
  pub_engine="$(awk -F': *' 'tolower($1)=="x-engine-status"{gsub(/\r/,"",$2);print tolower($2)}' "$hdr" 2>/dev/null)"
  if [ "$pub" = "000" ] || { [ "$pub" -ge 520 ] 2>/dev/null; }; then
    problem="tunnel-down"; detail="pub=$pub"
  elif [ "$pub_engine" = "offline" ] || [ "$pub" = "503" ]; then
    problem="public-offline"; detail="pub=$pub engine=${pub_engine:-?}"
  else
    awk "BEGIN{exit !(${pub_time:-0} > 8.0)}" 2>/dev/null && log "SLOW pub=$pub ${pub_time}s"
  fi
fi

if [ -n "$problem" ]; then
  n=$(( $(get_fails) + 1 )); set_fails "$n"
  log "FAIL($n) $problem${detail:+ [$detail]}"
  # Tunnel/public failures are unambiguous and cheap to heal idempotently → act on the FIRST fail so the
  # public URL recovers fast. Engine/bundle wait for 2 (a single transient local blip shouldn't trigger a
  # rebuild/restart).
  thresh=2; case "$problem" in tunnel-down|public-offline) thresh=1;; esac
  if [ "$n" -ge "$thresh" ]; then
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
      tunnel-down|public-offline)
        # the local engine is fine but the public path isn't — re-kick the tunnel (the lever we own). The
        # edge Worker is stateless, so if public-offline persists after this the only remaining cause is the
        # edge timeout (a code fix), and it just keeps getting logged each cycle.
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
