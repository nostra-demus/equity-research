#!/usr/bin/env bash
# git credential helper that authenticates as the Nostra engine GitHub App.
#
# It is invoked ONLY by scripts/commit-run.sh (the engine's data-push path), wired
# in for that single process via GIT_CONFIG_* env — it is never installed into the
# user's global/repo git config. So interactive/human git keeps its own credentials
# (and is therefore gated for CODE by the `main` ruleset), while the engine pushes
# DATA as the App (the ruleset's sole bypass actor). See §28.
#
# git calls a credential helper as: `helper <action>` with the request on stdin as
# key=value lines terminated by a blank line. We only answer `get`, and only for
# github.com; anything else we ignore so git falls back to its normal helpers.
set -euo pipefail

[ "${1:-}" = "get" ] || exit 0   # ignore store/erase — token is short-lived, nothing to persist

host=""
while IFS='=' read -r k v; do
  [ -z "$k" ] && break           # blank line ends the request
  [ "$k" = "host" ] && host="$v"
done
[ "$host" = "github.com" ] || exit 0   # not our host -> let git use its default creds

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
token="$("$here/gh-app-token.sh")" || exit 0   # mint failed -> stay silent, git falls back

printf 'username=x-access-token\npassword=%s\n' "$token"
