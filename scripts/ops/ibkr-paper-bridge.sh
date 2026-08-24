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

mkdir -p "$(dirname "$LOCK_DIR")"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then exit 0; fi
trap 'rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT INT TERM

if [ ! -f "$CONFIG_FILE" ] || [ -L "$CONFIG_FILE" ]; then
  echo "paper bridge waiting: private paper.env is missing or unsafe" >&2
  exit 0
fi
config_meta="$(stat -f '%u %Lp' "$CONFIG_FILE" 2>/dev/null || true)"
if [ "$config_meta" != "$(id -u) 600" ]; then
  echo "paper bridge waiting: private paper.env must be owned by this user with mode 600" >&2
  exit 0
fi
if [ ! -x "$DEPLOY" ] || ! "$DEPLOY"; then
  echo "paper bridge waiting: the verified main deployment could not be refreshed" >&2
  exit 0
fi
if [ -z "$NODE_BIN" ] || [ ! -x "$PROD/ui/server/node_modules/.bin/tsx" ]; then
  echo "paper bridge waiting: the deployed Node/tsx runtime is unavailable" >&2
  exit 0
fi

set -a
# shellcheck disable=SC1090
. "$CONFIG_FILE"
set +a
export ENGINE_REPO_ROOT="$PROD"
export ENGINE_STATE_DIR="${ENGINE_STATE_DIR:-$BRIDGE_HOME/Library/Application Support/nostradamus}"

cd "$PROD/ui/server" || exit 0
"$NODE_BIN" --import tsx src/ibkr-paper-bridge-once.ts

