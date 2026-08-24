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
grep -qx 'ENGINE_IBKR_PAPER_EXECUTION=1' "$CONFIG_FILE" \
  || { echo "ERROR: ENGINE_IBKR_PAPER_EXECUTION=1 is required" >&2; exit 1; }
grep -qx 'ENGINE_IBKR_PAPER_AUTO_SYNC=1' "$CONFIG_FILE" \
  || { echo "ERROR: ENGINE_IBKR_PAPER_AUTO_SYNC=1 is required" >&2; exit 1; }

mkdir -p "$AGENTS" "$(dirname "$LOG")"
staged="$(mktemp "$AGENTS/.$LABEL.XXXXXX")" || exit 1
trap 'rm -f "$staged" 2>/dev/null || true' EXIT
/usr/bin/python3 - "$staged" "$LABEL" "$PROD/scripts/ops/ibkr-paper-bridge.sh" "$PROD" "$BRIDGE_HOME" "$LOG" <<'PY'
import plistlib, sys
dst, label, program, repo, home, log = sys.argv[1:]
payload = {
    'Label': label,
    'ProgramArguments': ['/bin/bash', program],
    'EnvironmentVariables': {
        'HOME': home,
        'ENGINE_REPO_ROOT': repo,
        'PATH': '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    },
    'RunAtLoad': True,
    'StartInterval': 120,
    'ThrottleInterval': 30,
    'MaterializeDatalessFiles': True,
    'StandardOutPath': log,
    'StandardErrorPath': log,
}
with open(dst, 'wb') as handle:
    plistlib.dump(payload, handle, sort_keys=False)
PY
chmod 600 "$staged"
plutil -lint "$staged" >/dev/null || { echo "ERROR: generated bridge plist is invalid" >&2; exit 1; }

if [ -f "$DST" ] && cmp -s "$staged" "$DST" && launchctl print "$DOMAIN/$LABEL" >/dev/null 2>&1; then
  launchctl kickstart -k "$DOMAIN/$LABEL"
  echo "restarted $LABEL"
  exit 0
fi

launchctl bootout "$DOMAIN/$LABEL" 2>/dev/null || true
for _ in $(seq 1 40); do
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

