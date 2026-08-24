#!/bin/bash
# Local-only IBKR Paper companion for a Mac that runs TWS but is not Nostra's public doer.
# The com.nostra.* label is intentionally outside the com.nostradamus.* failover namespace.
set -uo pipefail

BRIDGE_HOME="${HOME:?HOME is required}"
PROD="${ENGINE_REPO_ROOT:-$BRIDGE_HOME/nostra-prod}"
CONFIG_DIR="${NOSTRA_ENGINE_CONFIG_DIR:-$BRIDGE_HOME/.config/nostra-engine}"
CONFIG_FILE="$CONFIG_DIR/paper.env"
LOCK_DIR="$BRIDGE_HOME/Library/Application Support/nostradamus/ibkr-paper-local-bridge/run.lock"
DEPLOY="$BRIDGE_HOME/.nostra-ops/deploy.sh"
NODE_BIN="${NODE_BIN:-$(command -v node 2>/dev/null || true)}"
LOCK_OWNER="$LOCK_DIR/owner"

lock_owner_active() {
  [ -f "$LOCK_OWNER" ] || return 1
  lock_pid="$(sed -n '1p' "$LOCK_OWNER" 2>/dev/null || true)"
  lock_started="$(sed -n '2p' "$LOCK_OWNER" 2>/dev/null || true)"
  lock_script="$(sed -n '3p' "$LOCK_OWNER" 2>/dev/null || true)"
  case "$lock_pid" in ''|*[!0-9]*) return 1 ;; esac
  [ -n "$lock_started" ] && [ -n "$lock_script" ] || return 1
  live_started="$(ps -p "$lock_pid" -o lstart= 2>/dev/null | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || true)"
  live_command="$(ps -p "$lock_pid" -o command= 2>/dev/null || true)"
  [ "$live_started" = "$lock_started" ] || return 1
  case "$live_command" in *"$lock_script"*) return 0 ;; *) return 1 ;; esac
}

release_lock() {
  [ "$(sed -n '1p' "$LOCK_OWNER" 2>/dev/null || true)" = "$$" ] || return 0
  rm -f "$LOCK_OWNER"
  rmdir "$LOCK_DIR" 2>/dev/null || true
}

mkdir -p "$(dirname "$LOCK_DIR")"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  if lock_owner_active; then exit 0; fi
  stale_lock="$LOCK_DIR.stale.$$.$RANDOM"
  if ! mv "$LOCK_DIR" "$stale_lock" 2>/dev/null; then exit 0; fi
  rm -f "$stale_lock/owner"
  rmdir "$stale_lock" 2>/dev/null || true
  if ! mkdir "$LOCK_DIR" 2>/dev/null; then exit 0; fi
fi
umask 077
{
  printf '%s\n' "$$"
  ps -p "$$" -o lstart= | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
  printf '%s\n' "$0"
} > "$LOCK_OWNER"
trap 'exit 1' INT TERM
trap release_lock EXIT

if [ ! -f "$CONFIG_FILE" ] || [ -L "$CONFIG_FILE" ]; then
  echo "paper bridge waiting: private paper.env is missing or unsafe" >&2
  exit 0
fi
config_meta="$(stat -f '%u %Lp' "$CONFIG_FILE" 2>/dev/null \
  || stat -c '%u %a' "$CONFIG_FILE" 2>/dev/null \
  || true)"
if [ "$config_meta" != "$(id -u) 600" ]; then
  echo "paper bridge waiting: private paper.env must be owned by this user with mode 600" >&2
  exit 0
fi
if [ ! -x "$DEPLOY" ] || ! "$DEPLOY"; then
  echo "paper bridge waiting: the verified main deployment could not be refreshed" >&2
  exit 0
fi
if [ -z "$NODE_BIN" ] || [ "${NODE_BIN#/}" = "$NODE_BIN" ] \
  || [ ! -x "$NODE_BIN" ] || [ ! -x "$PROD/ui/server/node_modules/.bin/tsx" ]; then
  echo "paper bridge waiting: the deployed Node/tsx runtime is unavailable" >&2
  exit 0
fi

set -a
# shellcheck disable=SC1090
. "$CONFIG_FILE"
set +a
export ENGINE_REPO_ROOT="$PROD"
export ENGINE_STATE_DIR="${ENGINE_STATE_DIR:-$BRIDGE_HOME/Library/Application Support/nostradamus}"

cd "$PROD/ui/server" || {
  echo "paper bridge error: the deployed server directory is missing or inaccessible" >&2
  exit 1
}
export PATH="$(dirname "$NODE_BIN"):$PATH"
./node_modules/.bin/tsx src/ibkr-paper-bridge-once.ts
