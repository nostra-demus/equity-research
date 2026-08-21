#!/usr/bin/env bash
# One live OmniRoute request through the scanner's exact production descriptor/prompt/parser contract.
# Prints only a small sanitized verdict; provider response bodies and credentials are never logged.
set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$HERE/../.." && pwd)"
TSX="$REPO/ui/server/node_modules/.bin/tsx"

case "$#:${1:-}" in
  0:) ;;
  1:--test-loopback) ;; # focused mock only; deploy never passes this relaxation
  *) echo "ERROR: usage: $0 [--test-loopback]" >&2; exit 2 ;;
esac

if [ ! -x "$TSX" ]; then
  echo "ERROR: $TSX is missing — run npm ci in $REPO/ui/server first" >&2
  exit 1
fi

cd "$REPO/ui/server" || exit 1
exec "$TSX" "$HERE/omniroute-smoke.ts" "$@"
