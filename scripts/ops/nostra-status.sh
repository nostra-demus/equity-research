#!/usr/bin/env bash
# nostra-status.sh — "Who am I, and am I serving app.nostra-demus.com?"
#
# Run this on ANY Mac to get an unambiguous identity + health report. It answers the one
# question that has caused every migration mix-up: IS THIS MACHINE THE LIVE TUNNEL HOST?
# It decides that by fact, not by guess — it compares THIS machine's own public IP to the
# origin IP of the tunnel's live connector. If they match, this machine is serving. Period.
#
# Read-only. Installs nothing, changes nothing (except `--set-role`, which writes one label file).
# Dependency-free: bash, curl, cloudflared, launchctl, git, lsof — all already present.
#
# Usage:
#   bash nostra-status.sh                 # full report
#   bash nostra-status.sh --oneline       # single machine-readable summary line
#   bash nostra-status.sh --set-role NAME # stamp a human label (e.g. PROD-DELHI, DEV-LAPTOP) into ~/.nostra-identity

TUNNEL_DEFAULT="nostradamus-engine"
IDFILE="$HOME/.nostra-identity"
PROD="${ENGINE_REPO_ROOT:-$HOME/nostra-prod}"
CFG_DIR="$HOME/.cloudflared"
ENVF="$HOME/.config/nostra-engine/providers.env"

# colors (fall back to plain if not a tty)
if [ -t 1 ]; then B=$'\033[1m'; G=$'\033[32m'; R=$'\033[31m'; Y=$'\033[33m'; DIM=$'\033[2m'; X=$'\033[0m'; else B=; G=; R=; Y=; DIM=; X=; fi
say()  { printf '%s\n' "$*"; }
hd()   { printf '\n%s%s%s\n' "$B" "$*" "$X"; }
row()  { printf '  %-16s %s\n' "$1" "$2"; }

# ── --set-role: stamp a durable human label ───────────────────────────────────
if [ "${1:-}" = "--set-role" ]; then
  [ -n "${2:-}" ] || { echo "usage: nostra-status.sh --set-role <LABEL>  (e.g. PROD-DELHI)"; exit 2; }
  printf 'role=%s\nset_at=%s\nby=%s\n' "$2" "$(date '+%Y-%m-%d %H:%M %Z')" "$(whoami)@$(hostname -s)" > "$IDFILE"
  echo "stamped $IDFILE → role=$2"; exit 0
fi

# ── gather ────────────────────────────────────────────────────────────────────
HOST=$(scutil --get ComputerName 2>/dev/null || hostname -s)
MODEL=$(sysctl -n hw.model 2>/dev/null)
UARCH=$(uname -m)
NATIVE_ARM=$(sysctl -n hw.optional.arm64 2>/dev/null || echo 0)
TRANSLATED=$(sysctl -n sysctl.proc_translated 2>/dev/null || echo 0)
if [ "$NATIVE_ARM" = 1 ]; then ARCH_STR="arm64 (Apple Silicon)"; [ "$UARCH" = x86_64 ] && ARCH_STR="arm64 native · this shell is x86_64 via Rosetta"; else ARCH_STR="x86_64 (Intel)"; fi
DECLARED=$( [ -f "$IDFILE" ] && grep '^role=' "$IDFILE" | cut -d= -f2 || echo "(unset — run: nostra-status.sh --set-role <LABEL>)")

IP4=$(curl -s -4 -m 6 https://api.ipify.org 2>/dev/null); [ -n "$IP4" ] || IP4="(none)"
IP6=$(curl -s -6 -m 6 https://api64.ipify.org 2>/dev/null); case "$IP6" in *:*) ;; *) IP6="(none)";; esac

TUNNEL=$(awk -F': *' '/^tunnel:/{print $2; exit}' "$CFG_DIR/config.yml" 2>/dev/null); [ -n "$TUNNEL" ] || TUNNEL="$TUNNEL_DEFAULT"

# tunnel connectors (needs cert.pem to query the CF API)
TUN_RAW=""; TUN_ERR=""
if [ -f "$CFG_DIR/cert.pem" ]; then
  TUN_ERR_FILE=$(mktemp 2>/dev/null || echo "/tmp/.nostra_tun_err_$$")
  TUN_RAW=$(cloudflared tunnel info "$TUNNEL" 2>"$TUN_ERR_FILE") || TUN_ERR=$(cat "$TUN_ERR_FILE" 2>/dev/null)
  rm -f "$TUN_ERR_FILE"
else
  TUN_ERR="no ~/.cloudflared/cert.pem — cannot query the tunnel"
fi
# connector data lines start with a UUID
CONN_LINES=$(printf '%s\n' "$TUN_RAW" | grep -E '^[0-9a-f]{8}-[0-9a-f]{4}-' || true)
CONN_COUNT=$(printf '%s' "$CONN_LINES" | grep -c . || echo 0)

# Am I one of the live connectors? Match my public IP against each connector's origin IP column.
SERVING=no; LIVE_DESC=""
while IFS= read -r line; do
  [ -n "$line" ] || continue
  read -r _ _ arch _ oip edge <<< "$line"
  mine=""
  { [ "$oip" = "$IP4" ] || [ "$oip" = "$IP6" ]; } && { SERVING=yes; mine=" ${G}← THIS MACHINE${X}"; }
  LIVE_DESC="${LIVE_DESC}    origin ${oip}  ·  ${arch}  ·  edge ${edge}${mine}\n"
done <<EOF
$CONN_LINES
EOF

# nostradamus launchd services
SVC=$(launchctl list 2>/dev/null | grep nostradamus || true)
SVC_COUNT=$(printf '%s' "$SVC" | grep -c . || echo 0)

# engine on :8787 — supervised or manual? Key off the actual launchd service, not ppid:
# a launchd job may run `npm start` (node's parent is npm) and an orphan gets reparented to
# launchd (pid 1), so ppid is unreliable. The real signal: is com.nostradamus.engine loaded?
ENG_LINE=$(lsof -nP -iTCP:8787 -sTCP:LISTEN 2>/dev/null | awk 'NR==2{print $2}')
ENG_SVC_PID=$(launchctl list 2>/dev/null | awk '$3=="com.nostradamus.engine"{print $1}')
ENG_DESC="down"; ENG_MODE="down"
if [ -n "$ENG_LINE" ]; then
  if [ -n "$ENG_SVC_PID" ] && [ "$ENG_SVC_PID" != "-" ]; then
    ENG_DESC="LISTEN · pid $ENG_LINE · ${G}launchd-supervised${X} (service $ENG_SVC_PID)"; ENG_MODE="launchd"
  else
    ENG_DESC="LISTEN · pid $ENG_LINE · ${Y}MANUAL / orphan — no engine service loaded${X}"; ENG_MODE="manual"
  fi
fi
HEALTH=$(curl -s -m 5 -o /dev/null -w '%{http_code}' http://127.0.0.1:8787/api/health 2>/dev/null); [ -n "$HEALTH" ] || HEALTH="(no answer)"

# data pool
POOL_LINK=$(readlink "$PROD/data" 2>/dev/null)
POOL_N=$( { find -L "$PROD/data" -type f 2>/dev/null || true; } | grep -c . || echo 0)
POOL_DESC="$POOL_N files"; [ -n "$POOL_LINK" ] && POOL_DESC="$POOL_N files via Drive symlink"; [ "$POOL_N" -eq 0 ] && POOL_DESC="${R}0 files — DANGLING or unsynced${X}"

# prod worktree
if [ -e "$PROD/.git" ]; then
  BR=$(git -C "$PROD" rev-parse --abbrev-ref HEAD 2>/dev/null)
  SHA=$(git -C "$PROD" rev-parse --short HEAD 2>/dev/null)
  git -C "$PROD" fetch origin --quiet 2>/dev/null || true
  AHEAD=$(git -C "$PROD" rev-list --count "origin/main..HEAD" 2>/dev/null || echo '?')
  BEHIND=$(git -C "$PROD" rev-list --count "HEAD..origin/main" 2>/dev/null || echo '?')
  PROD_DESC="$BR @ $SHA  (ahead $AHEAD / behind $BEHIND origin/main)"
else PROD_DESC="${R}missing ($PROD)${X}"; fi

# secrets (names only, never values)
KEYS=$( [ -f "$ENVF" ] && cut -d= -f1 "$ENVF" | tr '\n' ' ' || echo "${R}none${X}")
CREDS=""
for f in cert.pem config.yml; do [ -f "$CFG_DIR/$f" ] && CREDS="$CREDS $f"; done
ls "$CFG_DIR"/*.json >/dev/null 2>&1 && CREDS="$CREDS <uuid>.json"
[ -n "$CREDS" ] || CREDS="${R}none${X}"

# ── verdict ───────────────────────────────────────────────────────────────────
if [ "$SERVING" = yes ]; then VERDICT="${G}${B}🟢 THIS MACHINE IS PRODUCTION — serving app.nostra-demus.com${X}"
elif [ "$CONN_COUNT" -gt 0 ]; then VERDICT="${R}${B}🔴 THIS MACHINE IS NOT SERVING${X} — the live host is another machine (see connector origin IPs above)"
else VERDICT="${Y}${B}🟡 NO ONE is serving the tunnel${X} (0 connectors) — or creds can't query it"; fi

# ── --oneline ─────────────────────────────────────────────────────────────────
if [ "${1:-}" = "--oneline" ]; then
  tag=$( [ "$SERVING" = yes ] && echo SERVING || echo idle )
  printf '[%s|%s] %s@%s · %s · engine=%s · svc=%s · pool=%s · %s\n' \
    "$DECLARED" "$UARCH" "$(whoami)" "$(hostname -s)" "$tag" "$ENG_MODE" "$SVC_COUNT" "$POOL_N" "${BR:-?}@${SHA:-?}"
  exit 0
fi

# ── report ────────────────────────────────────────────────────────────────────
say "${B}════════ NOSTRA MACHINE IDENTITY ════════${X}  ${DIM}$(date '+%Y-%m-%d %H:%M %Z')${X}"

hd "IDENTITY"
row "hostname"  "$HOST"
row "model"     "$MODEL   ·   $ARCH_STR"
row "user"      "$(whoami)   home $HOME"
row "declared role" "$DECLARED"
row "public IPv4" "$IP4"
row "public IPv6" "$IP6"

hd "ROLE — am I the live production host?"
row "tunnel name" "$TUNNEL"
if [ -n "$TUN_ERR" ]; then row "tunnel query" "${Y}$TUN_ERR${X}"; else row "live connectors" "$CONN_COUNT"; printf '%b' "$LIVE_DESC"; fi
say ""
say "  $VERDICT"

# ── external reachability: is it the SERVER, or is it MY machine's DNS/network? ─────────────────
# The one question a browser error can't answer. We resolve the public host via DoH to 1.1.1.1 (an IP
# literal — needs no working local resolver) and probe Cloudflare's edge with that IP PINNED, bypassing
# this machine's DNS entirely. An unauthenticated probe can't see past Access to the engine (Access
# answers first), so this proves DNS + edge REACHABILITY — exactly what tells a local-DNS blip apart
# from a real outage. Engine health stays with the connector match above and the edge monitor below.
hd "EXTERNAL REACHABILITY  ${DIM}(edge, local DNS bypassed)${X}"
PUBHOST="${NOSTRA_PUBLIC_HOST:-$(awk -F'hostname: *' '/hostname:/{gsub(/[ \t]+$/,"",$2); print $2; exit}' "$CFG_DIR/config.yml" 2>/dev/null)}"
[ -n "$PUBHOST" ] || PUBHOST="app.nostra-demus.com"
row "public host" "$PUBHOST"

EDGE_IPS=$(curl -s -m 8 -H 'accept: application/dns-json' "https://1.1.1.1/dns-query?name=${PUBHOST}&type=A" 2>/dev/null \
  | grep -oE '"data":"[0-9.]+"' | grep -oE '[0-9.]+' | head -4)
LOCAL_ANS=$(dscacheutil -q host -a name "$PUBHOST" 2>/dev/null | grep -c ip_address); [ -n "$LOCAL_ANS" ] || LOCAL_ANS=0

EDGE_CODE=""; EDGE_IP_USED=""; EDGE_REACH=no; EDGE_HEALTHY=no
if [ -n "$EDGE_IPS" ]; then
  for ip in $EDGE_IPS; do
    EDGE_CODE=$(curl -sS -m 12 --resolve "${PUBHOST}:443:${ip}" -o /dev/null -w '%{http_code}' "https://${PUBHOST}/" 2>/dev/null)
    EDGE_IP_USED="$ip"
    [ -n "$EDGE_CODE" ] && [ "$EDGE_CODE" != "000" ] && break
  done
fi

# Scope each verdict to what was ACTUALLY probed. Access sits in front of the origin, so an
# unauthenticated probe that gets a 2xx/3xx confirms only DNS+edge reachability — NOT that the engine
# is up. EDGE_HEALTHY (edge answered, no origin error) is set ONLY on that clean branch, never on 5xx.
if [ -z "$EDGE_IPS" ]; then
  EDGE_VERDICT="${Y}couldn't resolve $PUBHOST via 1.1.1.1 DoH${X} — either DoH/1.1.1.1 is blocked here, or the DNS record itself is gone (NXDOMAIN). Can't tell those apart from here alone."
else
  case "$EDGE_CODE" in
    000|"")               EDGE_VERDICT="${Y}resolved via 1.1.1.1, but the pinned edge IP ${EDGE_IP_USED} didn't answer${X} — this machine's path to Cloudflare's edge is failing (DoH itself worked)" ;;
    50[0-9]|52[0-9]|530)  EDGE_VERDICT="${R}Cloudflare reached, but origin error (HTTP $EDGE_CODE)${X} — tunnel/engine likely DOWN"; EDGE_REACH=yes ;;
    *)                    EDGE_VERDICT="${G}edge reachable${X} — DNS + Cloudflare answer (HTTP $EDGE_CODE via $EDGE_IP_USED); the name works from outside. ${DIM}(Access answers first, so this confirms DNS+edge, not the engine.)${X}"; EDGE_REACH=yes; EDGE_HEALTHY=yes ;;
  esac
fi
row "edge probe" "$EDGE_VERDICT"
row "local DNS" "$( [ "$LOCAL_ANS" -gt 0 ] 2>/dev/null && echo "${G}resolves ($LOCAL_ANS answers)${X}" || echo "${R}FAILS to resolve $PUBHOST from this machine${X}" )"

# money verdict — server-vs-your-network. Only fire when the edge answered CLEANLY (not a 5xx origin
# error) AND this machine can't resolve. Never claim "not an outage" — this probe can't see the engine.
if [ "$EDGE_HEALTHY" = yes ] && [ "$LOCAL_ANS" -eq 0 ] 2>/dev/null; then
  say ""
  say "  ${Y}${B}⚠ The name + edge answer from outside, but YOUR machine can't resolve $PUBHOST → most likely local DNS.${X}"
  say "  ${DIM}(unauthenticated probe can't see past Access — check the connector match / edge monitor above to fully rule out an outage.)${X}"
  say "  ${DIM}fix here:${X} networksetup -setdnsservers Wi-Fi 1.1.1.1 1.0.0.1 ; sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder"
  say "  ${DIM}  (if Tailscale MagicDNS is intercepting:${X} tailscale set --accept-dns=false${DIM})${X}"
fi

# optional: the edge uptime-monitor's authoritative external view (its /__status on workers.dev)
if [ -n "${MONITOR_STATUS_URL:-}" ]; then
  MON=$(curl -s -m 8 "$MONITOR_STATUS_URL" 2>/dev/null | tr -d '\n' | sed 's/  */ /g' | cut -c1-220)
  row "edge monitor" "${MON:-(no answer from $MONITOR_STATUS_URL)}"
fi

# standby failover monitor (present only on a standby node)
FO_STATUS="$HOME/.nostra-ops/failover.status"
if launchctl list 2>/dev/null | grep -q com.nostradamus.failover; then
  hd "STANDBY FAILOVER MONITOR"
  if [ -f "$FO_STATUS" ]; then row "last tick" "$(cat "$FO_STATUS")"; else row "last tick" "(no heartbeat yet)"; fi
  row "meaning" "dormant=watching · WAIT=primary missing, counting · ACTIVATE/STANDDOWN=taking over/releasing"
fi

hd "ENGINE"
row "port 8787"   "$ENG_DESC"
row "origin /api/health" "$HEALTH"
row "my services" "$SVC_COUNT loaded"
[ -n "$SVC" ] && printf '%s\n' "$SVC" | sed 's/^/      /'

hd "REPO & DATA"
row "prod worktree" "$PROD_DESC"
row "data pool"     "$POOL_DESC"

hd "SECRETS (names only)"
row "providers.env" "$KEYS"
row "cloudflared"   "$CREDS"

say ""
say "${DIM}one-liner:${X} $(bash "$0" --oneline 2>/dev/null)"
say ""
