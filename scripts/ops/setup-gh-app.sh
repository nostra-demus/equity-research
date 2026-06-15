#!/usr/bin/env bash
# One-time local wiring for the engine's GitHub App push identity (§28).
#
# Run this ONCE on the machine that runs the engine, AFTER you have created the
# GitHub App, downloaded its private key, and installed it on the repo (see
# scripts/ops/GH_APP_ENGINE_IDENTITY.md for the browser steps).
#
# It writes the engine's App config under ~/.config/nostra-engine (outside the
# repo, mode 600 — secrets never touch git), then self-tests that the App can mint
# a token and actually has Contents:write on the repo. It does NOT change the
# `main` ruleset — that flip is a separate, deliberate step in the runbook.
#
# Usage:
#   setup-gh-app.sh --app-id <ID> --key <path/to/app.private-key.pem> \
#                   [--installation-id <ID>] [--repo nostra-demus/equity-research]
#
# If --installation-id is omitted it is auto-discovered from the App's installations.
set -euo pipefail

APP_ID="" KEY_SRC="" INSTALL_ID="" REPO="nostra-demus/equity-research"
CFG_DIR="${NOSTRA_ENGINE_CONFIG_DIR:-$HOME/.config/nostra-engine}"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --app-id)          APP_ID="${2:?}"; shift 2 ;;
    --installation-id) INSTALL_ID="${2:?}"; shift 2 ;;
    --key)             KEY_SRC="${2:?}"; shift 2 ;;
    --repo)            REPO="${2:?}"; shift 2 ;;
    --config-dir)      CFG_DIR="${2:?}"; shift 2 ;;
    *) echo "setup-gh-app: unknown arg: $1" >&2; exit 2 ;;
  esac
done
[ -n "$APP_ID" ]  || { echo "setup-gh-app: --app-id is required" >&2; exit 2; }
[ -n "$KEY_SRC" ] || { echo "setup-gh-app: --key is required" >&2; exit 2; }
[ -f "$KEY_SRC" ] || { echo "setup-gh-app: key not found: $KEY_SRC" >&2; exit 2; }

b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }
app_jwt() {  # build a short App JWT for discovery/verification
  local now h p sig
  now="$(date +%s)"
  h="$(printf '{"alg":"RS256","typ":"JWT"}' | b64url)"
  p="$(printf '{"iat":%s,"exp":%s,"iss":"%s"}' "$((now-60))" "$((now+540))" "$APP_ID" | b64url)"
  sig="$(printf '%s' "$h.$p" | openssl dgst -sha256 -sign "$KEY_SRC" -binary | b64url)"
  printf '%s.%s.%s' "$h" "$p" "$sig"
}
api() { curl -fsS -H "Authorization: Bearer $1" -H "Accept: application/vnd.github+json" \
             -H "X-GitHub-Api-Version: 2022-11-28" "${@:2}"; }

JWT="$(app_jwt)"

# ---- discover the installation id for this repo if not provided ----
if [ -z "$INSTALL_ID" ]; then
  echo "setup-gh-app: discovering installation id for $REPO ..." >&2
  INSTALL_ID="$(api "$JWT" "https://api.github.com/repos/$REPO/installation" \
    | python3 -c 'import sys,json; print(json.load(sys.stdin).get("id",""))')"
  [ -n "$INSTALL_ID" ] || { echo "setup-gh-app: could not auto-discover installation id — is the App installed on $REPO?" >&2; exit 1; }
  echo "setup-gh-app: installation id = $INSTALL_ID" >&2
fi

# ---- write config (mode 600, outside the repo) ----
umask 077
mkdir -p "$CFG_DIR"
KEY_DST="$CFG_DIR/app-private-key.pem"
cp "$KEY_SRC" "$KEY_DST"; chmod 600 "$KEY_DST"
cat > "$CFG_DIR/github-app.env" <<EOF
# Nostra engine GitHub App push identity (§28). Written by setup-gh-app.sh.
GH_APP_ID=$APP_ID
GH_APP_INSTALLATION_ID=$INSTALL_ID
GH_APP_PRIVATE_KEY=$KEY_DST
EOF
chmod 600 "$CFG_DIR/github-app.env"
echo "setup-gh-app: wrote $CFG_DIR/github-app.env (+ private key)" >&2

# ---- self-test: mint an installation token and confirm Contents:write on the repo ----
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "setup-gh-app: minting a test installation token ..." >&2
TOKEN="$(NOSTRA_ENGINE_CONFIG_DIR="$CFG_DIR" "$HERE/gh-app-token.sh")" \
  || { echo "setup-gh-app: FAILED to mint a token — check App id / key / installation" >&2; exit 1; }

PERM="$(api "$JWT" "https://api.github.com/app" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin).get("permissions",{}).get("contents",""))')"
SLUG="$(api "$JWT" "https://api.github.com/app" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin).get("slug",""))')"

# token can actually reach the repo over git?
if git ls-remote "https://x-access-token:$TOKEN@github.com/$REPO.git" -h refs/heads/main >/dev/null 2>&1; then
  REMOTE_OK="yes"
else
  REMOTE_OK="NO"
fi

echo
echo "==================== setup-gh-app: RESULT ===================="
echo "  App slug ............. ${SLUG:-?}"
echo "  App id (= ruleset bypass actor_id, actor_type=Integration) ... $APP_ID"
echo "  Installation id ...... $INSTALL_ID"
echo "  Contents permission .. ${PERM:-?}   (must be: write)"
echo "  git auth to $REPO .... $REMOTE_OK"
echo "  Config dir ........... $CFG_DIR"
echo "============================================================="
if [ "$PERM" != "write" ] || [ "$REMOTE_OK" != "yes" ]; then
  echo "setup-gh-app: NOT ready — fix Contents:write / installation before flipping the ruleset." >&2
  exit 1
fi
echo "setup-gh-app: OK. commit-run.sh will now push as the App."
echo "Next: add this App as the ruleset's sole bypass actor (see GH_APP_ENGINE_IDENTITY.md), App id = $APP_ID."
