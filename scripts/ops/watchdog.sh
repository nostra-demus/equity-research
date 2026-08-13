#!/usr/bin/env bash
# Self-healing watchdog for app.nostra-demus.com. Runs every ~60s under launchd
# (com.nostradamus.watchdog). It covers the failure modes launchd KeepAlive can't:
#   - a non-launchd process squatting :8787 (KeepAlive keeps EADDRINUSE-ing)
#   - the engine "up" but serving BROKEN content (the blank page: HTML returned for the JS bundle)
#   - the cloudflared tunnel being unreachable
# Local failures repair after 2 consecutive checks. A public/tunnel failure gets one immediate repair,
# then a convergence cooldown prevents repeated tunnel restarts from extending an edge rollout flap.
# Every check/incident/repair is logged to ~/Library/Logs/nostradamus-watchdog.log ("keep a track").
set -uo pipefail

# Pure decision helper. Keeping this above the source guard lets the test exercise cooldown boundaries
# without running the watchdog (and therefore without touching launchctl or the network).
tunnel_heal_cooldown_remaining() {
  local now_raw="${1:-}" last_raw="${2:-}" cooldown_raw="${3:-}"
  local now last cooldown elapsed
  case "$now_raw" in ''|*[!0-9]*) return 2;; esac
  case "$last_raw" in ''|*[!0-9]*) return 2;; esac
  case "$cooldown_raw" in ''|*[!0-9]*) return 2;; esac
  now=$((10#$now_raw)); last=$((10#$last_raw)); cooldown=$((10#$cooldown_raw))
  elapsed=$((now - last))
  # No prior heal, an expired/disabled cooldown, or a backwards clock step all permit one heal.
  # A heal after a clock step rewrites the timestamp, avoiding an accidentally unbounded suppression.
  if [ "$last" -eq 0 ] || [ "$elapsed" -lt 0 ] || [ "$elapsed" -ge "$cooldown" ]; then
    printf '0\n'
  else
    printf '%s\n' "$((cooldown - elapsed))"
  fi
}

# Safely install/refresh the independent connector supervisor from the immutable reviewed Git object. This
# exists above the source guard so the rollout contract is portable-testable without executing a watchdog
# tick. It never copies mutable working-tree bytes. A pre-upgrade deploy may install this watchdog before it
# knows the helper filename; this closes that one-time bootstrap gap. Every later tick also self-attests the
# installed copy against current production main before execution.
bootstrap_connector_supervisor() {
  local ops="$HOME/.nostra-ops" staged head head_after remote branch git_bin
  git_bin="$(command -v git 2>/dev/null || true)"; git_bin="${git_bin:-/usr/bin/git}"
  branch="$($git_bin -C "$REPO" symbolic-ref --quiet --short HEAD 2>/dev/null || true)"
  head="$($git_bin -C "$REPO" rev-parse HEAD 2>/dev/null || true)"
  remote="$($git_bin -C "$REPO" rev-parse origin/main 2>/dev/null || true)"
  [ "$branch" = main ] && [ -n "$head" ] && [ "$head" = "$remote" ] || return 1
  # Normalize only a real, current-user directory. Descriptor/no-follow checks prevent chmod from following
  # a swapped symlink; mode 0700 keeps the installed executable outside other local users' reach.
  "$PYTHON" -I - "$ops" <<'PYCONNECTOROPSDIR' || return 1
import os, stat, sys
path = sys.argv[1]
try:
    os.mkdir(path, 0o700)
except FileExistsError:
    pass
fd = None
try:
    before = os.lstat(path)
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0))
    opened = os.fstat(fd)
    if (not stat.S_ISDIR(opened.st_mode) or opened.st_uid != os.getuid()
            or (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino)):
        raise OSError
    os.fchmod(fd, 0o700)
finally:
    if fd is not None: os.close(fd)
PYCONNECTOROPSDIR
  staged="$(mktemp "$ops/.connector-supervisor.py.staged.XXXXXX")" || return 1
  # `git show <verified SHA>:<path>` reads the immutable object, not a dirty/racing checkout.
  if ! "$git_bin" -C "$REPO" show "$head:scripts/ops/connector-supervisor.py" > "$staged" \
      || [ ! -s "$staged" ] || ! chmod 700 "$staged" \
      || ! "$PYTHON" -I - "$staged" <<'PYCONNECTORCOMPILE'
import pathlib, sys
source = pathlib.Path(sys.argv[1]).read_bytes()
compile(source, "connector-supervisor.py", "exec")
PYCONNECTORCOMPILE
  then
    rm -f "$staged" 2>/dev/null || true
    return 1
  fi
  head_after="$($git_bin -C "$REPO" rev-parse HEAD 2>/dev/null || true)"
  remote="$($git_bin -C "$REPO" rev-parse origin/main 2>/dev/null || true)"
  [ "$head_after" = "$head" ] && [ "$remote" = "$head" ] || { rm -f "$staged"; return 1; }
  # Refuse a pre-existing unsafe pathname rather than replacing/normalizing it. A safe identical copy stays
  # in place; a reviewed new object is published by same-directory atomic rename.
  if [ -e "$CONNECTOR_SUPERVISOR" ] || [ -L "$CONNECTOR_SUPERVISOR" ]; then
    "$PYTHON" -I - "$CONNECTOR_SUPERVISOR" <<'PYCONNECTORINSTALLED' \
      || { rm -f "$staged"; return 1; }
import os, stat, sys
value = os.lstat(sys.argv[1])
if (not stat.S_ISREG(value.st_mode) or value.st_uid != os.getuid()
        or value.st_nlink != 1 or value.st_mode & 0o077):
    raise SystemExit(1)
PYCONNECTORINSTALLED
    if cmp -s "$staged" "$CONNECTOR_SUPERVISOR"; then rm -f "$staged"; return 0; fi
  fi
  mv "$staged" "$CONNECTOR_SUPERVISOR" || { rm -f "$staged"; return 1; }
}

if [[ "${BASH_SOURCE[0]}" != "$0" ]]; then
  return 0
fi

REPO="${ENGINE_REPO_ROOT:-$HOME/nostra-prod}"
PORT=8787
TUNNEL_HEAL_COOLDOWN_SECONDS="${WATCHDOG_TUNNEL_HEAL_COOLDOWN_SECONDS:-300}"
case "$TUNNEL_HEAL_COOLDOWN_SECONDS" in
  ''|*[!0-9]*) TUNNEL_HEAL_COOLDOWN_SECONDS=300;;
esac
# resolve npm to an absolute path (launchd has a minimal PATH; brew is /opt/homebrew on Apple-Silicon, /usr/local on Intel)
NPM="$(command -v npm 2>/dev/null || true)"; [ -n "$NPM" ] || for c in /opt/homebrew/bin/npm /usr/local/bin/npm; do [ -x "$c" ] && NPM="$c" && break; done; NPM="${NPM:-/opt/homebrew/bin/npm}"
PYTHON="$(command -v python3 2>/dev/null || true)"; PYTHON="${PYTHON:-/usr/bin/python3}"
UID_NUM="$(id -u)"
AGENTS_DIR="$HOME/Library/LaunchAgents"
LOG="$HOME/Library/Logs/nostradamus-watchdog.log"
STATE_DIR="$HOME/Library/Application Support/nostradamus"
FAILS="$STATE_DIR/watchdog.fails"
TUNNEL_HEAL_AT="$STATE_DIR/tunnel-heal.at"
mkdir -p "$STATE_DIR" "$(dirname "$LOG")"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "$(ts) $*" >> "$LOG"; }
get_fails() { cat "$FAILS" 2>/dev/null || echo 0; }
set_fails() { echo "$1" > "$FAILS"; }
get_tunnel_heal_at() {
  local value
  value="$(cat "$TUNNEL_HEAL_AT" 2>/dev/null || true)"
  case "$value" in ''|*[!0-9]*) echo 0;; *) echo "$value";; esac
}
set_tunnel_heal_at() { echo "$1" > "$TUNNEL_HEAL_AT"; }
# Recover an agent even if it was booted OUT (not just crashed): `kickstart` cannot start an
# unloaded agent, so bootstrap first when it is gone, THEN (re)start. This is exactly what was
# missing when a failed installer left the engine booted-out and the watchdog could not bring it back.
ensure_up() {
  if ! launchctl print "gui/$UID_NUM/$1" >/dev/null 2>&1; then
    launchctl bootstrap "gui/$UID_NUM" "$AGENTS_DIR/$1.plist" 2>/dev/null || return 1
  fi
  launchctl kickstart -k "gui/$UID_NUM/$1" 2>/dev/null
}

connector_note_hourly() {
  local key="$1" message="$2" now last marker remaining
  marker="$STATE_DIR/connector-note-$key.at"
  now="$(date +%s)"
  last="$(cat "$marker" 2>/dev/null || true)"
  case "$last" in ''|*[!0-9]*) last=0;; esac
  remaining="$(tunnel_heal_cooldown_remaining "$now" "$last" 3600 2>/dev/null || echo 0)"
  [ "${remaining:-0}" -eq 0 ] || return 0
  log "$message"
  printf '%s\n' "$now" > "$marker.tmp" 2>/dev/null && mv "$marker.tmp" "$marker" 2>/dev/null || true
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
  [ -f "$AGENTS_DIR/$ag.plist" ] || continue   # news-archive is doer-only; an admin-role host won't have it
  launchctl print "gui/$UID_NUM/$ag" >/dev/null 2>&1 \
    || { launchctl bootstrap "gui/$UID_NUM" "$AGENTS_DIR/$ag.plist" 2>/dev/null && log "RECOVERED $ag (was booted out)"; }
done

# Reconcile the complete connector scheduler, not merely an already-installed process.  The independent
# supervisor owns the fail-closed chain role -> stable pool identity -> plist contract -> launchd -> fresh
# post-activation heartbeat.  It takes the deploy lease first and then calls the exact connector-only
# installer, whose own lease is connector-autonomy.lock; this is the one global lock order used by deploy
# and failover too.  A fresh foreign-host heartbeat suppresses all startup, while admin/unsafe/Drive states
# never mutate launchd.  Its closed status wire contains reasons and proof identifiers, never paths/secrets.
CONNECTOR_SUPERVISOR="$HOME/.nostra-ops/connector-supervisor.py"
connector_supervisor_attested=0
bootstrap_connector_supervisor && connector_supervisor_attested=1
if [ "$connector_supervisor_attested" = 1 ]; then
  if ! "$PYTHON" -I "$CONNECTOR_SUPERVISOR"; then
    connector_note_hourly supervisor-failed \
      "CONNECTORS SUPERVISOR unavailable — no unproven service mutation attempted"
  fi
else
  connector_note_hourly supervisor-missing \
    "CONNECTORS SUPERVISOR missing or unsafe — no unproven service mutation attempted"
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
if [ -z "$problem" ] && [ -f "$AGENTS_DIR/com.nostradamus.tunnel.plist" ]; then
  # tunnel is DOER-ONLY: only supervise the public path on a machine that actually owns the tunnel, so an
  # admin-role host never tries to heal a URL it doesn't serve (which would fight the real doer's tunnel).
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
  # Tunnel/public failures get one immediate heal so the public URL recovers fast. Further tunnel heals
  # wait for the persistent cooldown; engine/bundle repairs still wait for 2 local failures.
  thresh=2; case "$problem" in tunnel-down|public-offline) thresh=1;; esac
  if [ "$n" -ge "$thresh" ]; then
    case "$problem" in
      bundle-not-js|no-bundle-ref)
        log "HEAL $problem"
        log "  rebuilding ui/web (dist looks corrupt/missing)"
        ( cd "$REPO" && "$NPM" --prefix ui/web run build ) >> "$LOG" 2>&1 || log "  WARN web build failed"
        lsof -ti:"$PORT" 2>/dev/null | xargs kill -9 2>/dev/null || true
        ensure_up com.nostradamus.engine
        set_fails 0
        : > "$STATE_DIR/healing"
        ;;
      engine-down)
        log "HEAL $problem"
        # clear any non-launchd squatter holding the port, then ensure launchd owns it again —
        # bootstrap if the agent was booted OUT, not merely crashed (kickstart alone can't).
        lsof -ti:"$PORT" 2>/dev/null | xargs kill -9 2>/dev/null || true
        ensure_up com.nostradamus.engine
        set_fails 0
        : > "$STATE_DIR/healing"
        ;;
      tunnel-down|public-offline)
        now="$(date +%s)"
        last_heal="$(get_tunnel_heal_at)"
        cooldown_remaining="$(tunnel_heal_cooldown_remaining "$now" "$last_heal" "$TUNNEL_HEAL_COOLDOWN_SECONDS")"
        if [ "${cooldown_remaining:-0}" -gt 0 ]; then
          log "SUPPRESS HEAL $problem — tunnel convergence cooldown ${cooldown_remaining}s remaining"
          # Tunnel state has its own timestamp. Do not let its persistent failure count make the next
          # one-off local engine/bundle failure skip the existing two-check threshold.
          set_fails 0
        else
          log "HEAL $problem"
          if ensure_up com.nostradamus.tunnel; then
            set_tunnel_heal_at "$now"
            : > "$STATE_DIR/healing"
          else
            # A failed launchctl command did not start convergence. Leave the timestamp untouched so the
            # next watchdog cycle retries instead of suppressing recovery for the whole cooldown.
            log "HEAL-FAILED $problem — tunnel restart command failed; retry remains armed"
          fi
          set_fails 0
        fi
        ;;
    esac
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
    if ! ( cd "$REPO" && ENGINE_STATE_DIR="$REPO/ui/server/.state" "$NPM" --prefix ui/server run --silent enrich:health -- --strict ) >/dev/null 2>&1; then
      log "ENRICH-DEGRADED — article reads regressing; attempting independent heal"
      ( cd "$REPO" && ENGINE_STATE_DIR="$REPO/ui/server/.state" "$NPM" --prefix ui/server run --silent enrich:health -- --heal ) >> "$LOG" 2>&1 || log "  WARN enrich heal failed"
    fi
  fi
fi

# Always succeed once the checks ran: incidents live in the LOG, not the exit code. Without this a
# healthy run that writes no heartbeat would exit 1 (shell-false &&) and read as "failed" in
# `launchctl list` — misleading for the very command used to confirm the watchdog is alive.
exit 0
