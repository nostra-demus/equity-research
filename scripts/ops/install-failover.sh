#!/usr/bin/env bash
# install-failover.sh — install (or refresh) the standby node's auto-failover monitor.
# Idempotent. Run it via bash so the interactive shell never has to parse it:
#   bash <(git -C ~/equity-research show origin/<branch>:scripts/ops/install-failover.sh)
set -euo pipefail

REPO="${NOSTRA_REPO:-$HOME/equity-research}"
BR="${NOSTRA_BRANCH:-main}"
U="$(id -u)"
PLIST="$HOME/Library/LaunchAgents/com.nostradamus.failover.plist"
SCRIPT="$HOME/.nostra-ops/failover.sh"

echo "installing failover monitor from origin/$BR ..."
git -C "$REPO" fetch origin "$BR" --quiet
mkdir -p "$HOME/.nostra-ops" "$HOME/Library/LaunchAgents" "$HOME/Library/Logs"

git -C "$REPO" show "origin/$BR:scripts/ops/nostra-failover.sh" > "$SCRIPT"
chmod +x "$SCRIPT"
echo "  wrote $SCRIPT ($(wc -c < "$SCRIPT" | tr -d ' ') bytes)"

git -C "$REPO" show "origin/$BR:scripts/ops/com.nostradamus.failover.plist" \
  | sed "s#{{HOME}}#$HOME#g" > "$PLIST"
plutil -lint "$PLIST" >/dev/null || { echo "ERROR: generated plist is invalid"; exit 1; }
echo "  wrote $PLIST (valid)"

launchctl bootout "gui/$U/com.nostradamus.failover" 2>/dev/null || true
launchctl bootstrap "gui/$U" "$PLIST"
echo "  bootstrapped com.nostradamus.failover"

# Wait for the first REAL tick to write a fresh heartbeat. The log is intentionally silent when
# steady (dormant), so we watch the heartbeat file instead — it's always current, never stale.
HB="$HOME/.nostra-ops/failover.status"
before="$(stat -f %m "$HB" 2>/dev/null || echo 0)"
for _ in $(seq 1 75); do
  now="$(stat -f %m "$HB" 2>/dev/null || echo 0)"
  [ "$now" != "$before" ] && break
  sleep 1
done
echo
echo "loaded?"; launchctl list | grep -E 'nostradamus' || echo "  (nothing — check the log)"
echo "live heartbeat (expect decision=DORMANT, connectors=1, dryrun=0):"
echo "  $(cat "$HB" 2>/dev/null || echo '(no heartbeat yet — check ~/Library/Logs/nostradamus-failover.log)')"
echo
echo "done. This node is a DORMANT standby. It will take over only if the primary is"
echo "globally absent for 10 min while this Mac is awake, and stand back down when it returns."
