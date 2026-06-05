#!/usr/bin/env bash
# Install / refresh the launchd supervision that keeps app.nostra-demus.com alive forever:
# the engine server (:8787) and the cloudflared tunnel both auto-start at login (RunAtLoad) and
# auto-restart on crash (KeepAlive). Idempotent — safe to re-run. No sudo (user LaunchAgents).
#
# Usage:  bash scripts/ops/install-services.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
AGENTS="$HOME/Library/LaunchAgents"
UID_NUM="$(id -u)"
mkdir -p "$AGENTS" "$HOME/Library/Logs"
for label in com.nostradamus.engine com.nostradamus.tunnel; do
  cp "$HERE/$label.plist" "$AGENTS/$label.plist"
  launchctl bootout "gui/$UID_NUM/$label" 2>/dev/null || true   # unload if already loaded
  launchctl bootstrap "gui/$UID_NUM" "$AGENTS/$label.plist"     # load + RunAtLoad
  launchctl kickstart -k "gui/$UID_NUM/$label"                  # (re)start now
  echo "installed + started: $label"
done
echo
echo "status:"
launchctl list | grep -i nostradamus || true
echo "logs: ~/Library/Logs/nostradamus-engine.log  |  ~/Library/Logs/nostradamus-tunnel.log"
