#!/bin/bash
# Install the local TWS companion without changing this Mac's Nostra doer/admin/failover role.
set -uo pipefail

BRIDGE_HOME="${HOME:?HOME is required}"
PROD="${ENGINE_REPO_ROOT:-$BRIDGE_HOME/nostra-prod}"
LABEL="com.nostra.ibkr-paper-bridge"
DOMAIN="gui/$(id -u)"
AGENTS="$BRIDGE_HOME/Library/LaunchAgents"
DST="$AGENTS/$LABEL.plist"
LOG="$BRIDGE_HOME/Library/Logs/nostra-ibkr-paper-bridge.log"
CONFIG_FILE="${NOSTRA_ENGINE_CONFIG_DIR:-$BRIDGE_HOME/.config/nostra-engine}/paper.env"

xml_escape() {
  local value="$1"
  value="${value//&/&amp;}"
  value="${value//</&lt;}"
  value="${value//>/&gt;}"
  printf '%s' "$value"
}

if [ "${1:-}" = "--uninstall" ]; then
  launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true
  [ ! -f "$DST" ] || mv "$DST" "$DST.disabled.$(date +%Y%m%d%H%M%S)"
  echo "uninstalled $LABEL (the prior plist, if present, was preserved as .disabled.*)"
  exit 0
fi

for required in "$PROD/scripts/ops/ibkr-paper-bridge.sh" "$PROD/ui/server/src/ibkr-paper-bridge-once.ts"; do
  [ -f "$required" ] || { echo "ERROR: merged bridge file is missing: $required" >&2; exit 1; }
done
[ -f "$CONFIG_FILE" ] && [ ! -L "$CONFIG_FILE" ] \
  || { echo "ERROR: private paper.env is missing or unsafe" >&2; exit 1; }
if config_meta="$(stat -f '%u %A' "$CONFIG_FILE" 2>/dev/null)"; then
  :
else
  config_meta="$(stat -c '%u %a' "$CONFIG_FILE" 2>/dev/null || true)"
fi
[ "$config_meta" = "$(id -u) 600" ] \
  || { echo "ERROR: private paper.env must be owned by this user with mode 600" >&2; exit 1; }
(
  # shellcheck disable=SC1090
  . "$CONFIG_FILE"
  [ "${ENGINE_IBKR_PAPER_EXECUTION:-}" = "1" ] \
    && [ "${ENGINE_IBKR_PAPER_AUTO_SYNC:-}" = "1" ]
) || { echo "ERROR: paper execution and automatic sync must both be enabled" >&2; exit 1; }

mkdir -p "$AGENTS" "$(dirname "$LOG")"
staged="$(mktemp "$AGENTS/.$LABEL.XXXXXX")" || exit 1
trap 'rm -f "$staged" 2>/dev/null || true' EXIT
/bin/cat > "$staged" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$(xml_escape "$LABEL")</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$(xml_escape "$PROD/scripts/ops/ibkr-paper-bridge.sh")</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>HOME</key>
    <string>$(xml_escape "$BRIDGE_HOME")</string>
    <key>ENGINE_REPO_ROOT</key>
    <string>$(xml_escape "$PROD")</string>
    <key>PATH</key>
    <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>StartInterval</key>
  <integer>120</integer>
  <key>ThrottleInterval</key>
  <integer>30</integer>
  <key>MaterializeDatalessFiles</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$(xml_escape "$LOG")</string>
  <key>StandardErrorPath</key>
  <string>$(xml_escape "$LOG")</string>
</dict>
</plist>
EOF
chmod 600 "$staged"
plutil -lint "$staged" >/dev/null || { echo "ERROR: generated bridge plist is invalid" >&2; exit 1; }

if [ -f "$DST" ] && cmp -s "$staged" "$DST" && launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1; then
  launchctl kickstart -k "$DOMAIN/$LABEL"
  echo "restarted $LABEL"
  exit 0
fi

launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true
for _ in {1..40}; do
  launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1 || break
  sleep 0.25
done
mv "$staged" "$DST"
chmod 600 "$DST"
for _ in 1 2 3 4 5 6; do
  launchctl bootstrap "$DOMAIN" "$DST" 2>/dev/null && break
  sleep 0.5
done
launchctl kickstart -k "$DOMAIN/$LABEL" 2>/dev/null || true
launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1 \
  || { echo "ERROR: $LABEL did not load" >&2; exit 1; }
echo "installed $LABEL — paper only, every 120 seconds, public failover untouched"
