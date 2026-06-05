#!/usr/bin/env bash
# Install / refresh the launchd supervision that keeps app.nostra-demus.com alive forever:
#   com.nostradamus.engine    — Fastify engine on :8787   (RunAtLoad + KeepAlive)
#   com.nostradamus.tunnel    — cloudflared tunnel run     (RunAtLoad + KeepAlive)
#   com.nostradamus.watchdog  — self-heal, every 60s       (RunAtLoad + StartInterval)
# Idempotent, no sudo (user LaunchAgents).
#
# RELIABILITY (why this is not a naive bootout;bootstrap loop):
#   `launchctl bootout` is ASYNC — an immediate `bootstrap` of the same label can fail with
#   "Input/output error" (errno 5). A naive loop under `set -e` then ABORTS right after the
#   bootout, leaving the service booted-out and DOWN. That exact bug took the engine offline.
#   So here we do NOT `set -e`; if a label is already loaded with an identical plist we just
#   restart it in place (no risky bootout); otherwise we bootout, WAIT until it is really gone,
#   then bootstrap with retries; and we verify each label ends up loaded.
#
# Usage:  bash scripts/ops/install-services.sh
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
AGENTS="$HOME/Library/LaunchAgents"
DOMAIN="gui/$(id -u)"
mkdir -p "$AGENTS" "$HOME/Library/Logs"

loaded() { launchctl print "$DOMAIN/$1" >/dev/null 2>&1; }

install_one() {
  local label="$1" src="$HERE/$1.plist" dst="$AGENTS/$1.plist" i
  if loaded "$label" && cmp -s "$src" "$dst"; then
    launchctl kickstart -k "$DOMAIN/$label" 2>/dev/null || true   # current + loaded: restart in place
    echo "  ok (in place): $label"; return
  fi
  cp "$src" "$dst"
  launchctl bootout "$DOMAIN/$label" 2>/dev/null || true
  for i in $(seq 1 40); do loaded "$label" || break; sleep 0.25; done   # wait out async bootout (<=10s)
  for i in 1 2 3 4 5 6; do
    launchctl bootstrap "$DOMAIN" "$dst" 2>/dev/null && break
    sleep 0.5                                                            # tolerate the errno-5 race
  done
  launchctl kickstart -k "$DOMAIN/$label" 2>/dev/null || true
  if loaded "$label"; then echo "  ok (reloaded): $label"
  else echo "  WARN: $label did NOT load — re-run this installer"; fi
}

for label in com.nostradamus.engine com.nostradamus.tunnel com.nostradamus.watchdog; do
  echo "installing $label"
  install_one "$label"
done

echo
echo "status (each should show a PID):"
launchctl list | grep -i nostradamus || echo "  (none loaded!)"
echo "logs: ~/Library/Logs/nostradamus-{engine,tunnel,watchdog}.log"
