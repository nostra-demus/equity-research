#!/usr/bin/env bash
# nostra-failover.sh — best-effort automatic failover for the STANDBY node.
#
# Runs every 60s via launchd (com.nostradamus.failover). Watches the shared Cloudflare tunnel;
# if the PRIMARY has been GLOBALLY invisible for K consecutive minutes, it brings this node's
# services up (via install-services.sh) to take over serving app.nostra-demus.com, and stands
# back down the moment the primary reappears. Normal state: dormant — only this monitor runs.
#
# SAFETY — the whole job is to NEVER split-brain (two nodes serving + both committing to main):
#   • FAIL-SAFE: "primary is down" is decided ONLY from Cloudflare's global connector list, and
#     ONLY when the query provably reached Cloudflare (the reply carries the tunnel's ID line).
#     If the query didn't reach Cloudflare (THIS node's internet is down), it does NOTHING —
#     it never takes over on the basis of its own connectivity problems.
#   • HYSTERESIS: the primary must be absent for K FULL minutes (default 10) — longer than any
#     reboot or KeepAlive restart. One reappearance resets the clock.
#   • AUTO-STANDDOWN: as soon as a second connector (the returning primary) appears, this node
#     releases within ~60s. Overlap is bounded to one tick.
#
# LIMITATION: launchd timers don't fire while the Mac is asleep. This node fails over only while
# AWAKE and ONLINE. For true 24/7 failover use an always-on standby, not a laptop.
#
# TEST SAFELY: NOSTRA_FAILOVER_DRYRUN=1 makes activate/standdown LOG what they would do, no exec.
# Pure decision is unit-testable:  nostra-failover.sh --decide <yes|no> <conns> <counter>
#
# Tunables (plist env): NOSTRA_FAILOVER_MINUTES (default 10), NOSTRA_TUNNEL, NOSTRA_FAILOVER_DRYRUN.

set -uo pipefail   # NOT -e: a monitor must never die mid-tick
TUNNEL="${NOSTRA_TUNNEL:-nostradamus-engine}"
K="${NOSTRA_FAILOVER_MINUTES:-10}"
DRYRUN="${NOSTRA_FAILOVER_DRYRUN:-0}"
PROD="${ENGINE_REPO_ROOT:-$HOME/nostra-prod}"
NEWS_ARCHIVE_DIR="${NEWS_ARCHIVE_DIR:-$HOME/Library/CloudStorage/GoogleDrive-ceekay@muns.io/My Drive/equity-research-data/news-archive}"
LA="$HOME/Library/LaunchAgents"
STATE="$HOME/.nostra-ops/failover.state"
LOG="${NOSTRA_FAILOVER_LOG:-$HOME/Library/Logs/nostradamus-failover.log}"
UIDN="$(id -u)"
mkdir -p "$HOME/.nostra-ops" "$(dirname "$LOG")"
log(){ printf '%s %s\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$*" >> "$LOG"; }

# ── pure decision, unit-testable: prints "<ACTION> <newcounter>" ───────────────
decide(){
  local active="$1" conns="$2" counter="$3"
  if [ "$active" = yes ]; then
    if [ "$conns" -ge 2 ]; then echo "STANDDOWN 0"; else echo "STAY 0"; fi
  else
    if [ "$conns" -eq 0 ]; then
      counter=$((counter+1))
      if [ "$counter" -ge "$K" ]; then echo "ACTIVATE $counter"; else echo "WAIT $counter"; fi
    else
      echo "DORMANT 0"
    fi
  fi
}
[ "${1:-}" = "--decide" ] && { decide "$2" "$3" "$4"; exit 0; }

activate(){
  if [ "$DRYRUN" = 1 ]; then log "DRYRUN ACTIVATE — would run install-services.sh"; return; fi
  log "ACTIVATE: primary absent >= ${K} min — taking over via install-services.sh"
  NEWS_ARCHIVE_DIR="$NEWS_ARCHIVE_DIR" bash "$PROD/scripts/ops/install-services.sh" >> "$LOG" 2>&1
  log "ACTIVATE: install-services.sh exit=$?"
}

stand_down(){
  if [ "$DRYRUN" = 1 ]; then log "DRYRUN STANDDOWN — would bootout all services + remove their plists (keep failover)"; return; fi
  log "STANDDOWN: primary is back — releasing"
  # watchdog FIRST (it resurrects booted-out agents), then every other nostradamus service but us.
  launchctl bootout "gui/$UIDN/com.nostradamus.watchdog" 2>/dev/null
  local lbl f
  for lbl in $(launchctl list 2>/dev/null | awk '/com\.nostradamus\./{print $3}' | grep -vE '\.(failover|watchdog)$'); do
    launchctl bootout "gui/$UIDN/$lbl" 2>/dev/null
  done
  # remove their plists so nothing RunAtLoad-revives on reboot — but keep the failover monitor.
  for f in "$LA"/com.nostradamus.*.plist; do
    [ -e "$f" ] || continue
    case "$f" in */com.nostradamus.failover.plist) continue;; esac
    rm -f "$f"
  done
  log "STANDDOWN: done — dormant"
}

# ── one tick ──────────────────────────────────────────────────────────────────
counter=$(cat "$STATE" 2>/dev/null || echo 0); case "$counter" in ''|*[!0-9]*) counter=0;; esac

info=$(cloudflared tunnel info "$TUNNEL" 2>/dev/null || true)
# FAIL-SAFE: trust the reply ONLY if it provably reached Cloudflare (carries the tunnel ID line).
# A network failure yields empty/partial stdout with no ID line → we do nothing.
if ! printf '%s\n' "$info" | grep -qE '^ID:[[:space:]]'; then
  log "tunnel query did not reach Cloudflare — NO ACTION (counter held at $counter)"
  exit 0
fi
conns=$(printf '%s\n' "$info" | grep -cE '^[0-9a-f]{8}-[0-9a-f]{4}-' || true)

active=no; [ -f "$LA/com.nostradamus.tunnel.plist" ] && active=yes

result=$(decide "$active" "$conns" "$counter")
action=${result%% *}; newcounter=${result##* }
echo "$newcounter" > "$STATE"

case "$action" in
  ACTIVATE)  log "decision ACTIVATE (active=$active conns=$conns counter=$newcounter)"; activate ;;
  STANDDOWN) log "decision STANDDOWN (active=$active conns=$conns)"; stand_down ;;
  WAIT)      log "primary absent — waiting ${newcounter}/${K} min (conns=$conns)" ;;
  DORMANT|STAY) : ;;
esac
exit 0
