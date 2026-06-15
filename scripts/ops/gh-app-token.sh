#!/usr/bin/env bash
# Mint a short-lived GitHub App *installation* access token for the engine's
# data pushes to `main`.
#
# This is the engine's machine identity (CLAUDE.md/AGENTS.md §28): the App is the
# SOLE bypass actor on the `main` ruleset, so research DATA flows straight to main
# while every human/AI CODE push goes through a PR. The token is short-lived
# (~1h) and minted on demand — no long-lived secret in git, ever.
#
# No third-party deps: openssl (RS256 JWT) + curl + python3 (json only).
#
# Config, sourced from $NOSTRA_ENGINE_CONFIG_DIR (default ~/.config/nostra-engine):
#   github-app.env  ->  GH_APP_ID=<numeric app id>
#                       GH_APP_INSTALLATION_ID=<numeric installation id>
#                       GH_APP_PRIVATE_KEY=<path to the .pem>   (optional;
#                                          default: <cfg>/app-private-key.pem)
#   app-private-key.pem  ->  the App's private key (mode 600, never committed)
#
# Prints the installation token on stdout (nothing else). Caches it until ~5 min
# before expiry so repeated pushes don't re-mint. Exit 0 on success; non-zero with
# nothing on stdout on failure (callers then fall back to git's default creds).
set -euo pipefail

CFG_DIR="${NOSTRA_ENGINE_CONFIG_DIR:-$HOME/.config/nostra-engine}"
ENV_FILE="$CFG_DIR/github-app.env"
CACHE_FILE="$CFG_DIR/.token-cache"

[ -f "$ENV_FILE" ] || { echo "gh-app-token: no config at $ENV_FILE" >&2; exit 1; }
# shellcheck disable=SC1090
. "$ENV_FILE"
: "${GH_APP_ID:?gh-app-token: GH_APP_ID unset in $ENV_FILE}"
: "${GH_APP_INSTALLATION_ID:?gh-app-token: GH_APP_INSTALLATION_ID unset in $ENV_FILE}"
GH_APP_PRIVATE_KEY="${GH_APP_PRIVATE_KEY:-$CFG_DIR/app-private-key.pem}"
[ -f "$GH_APP_PRIVATE_KEY" ] || { echo "gh-app-token: private key not found at $GH_APP_PRIVATE_KEY" >&2; exit 1; }

now="$(date +%s)"

# ---- reuse a cached token if it still has > 5 min of life ----
if [ -f "$CACHE_FILE" ]; then
  c_exp="$(awk -F= '/^expires_at=/{print $2}' "$CACHE_FILE" 2>/dev/null || true)"
  c_tok="$(awk -F= '/^token=/{print $2}'      "$CACHE_FILE" 2>/dev/null || true)"
  if [ -n "${c_exp:-}" ] && [ -n "${c_tok:-}" ] && [ "$c_exp" -gt "$((now + 300))" ] 2>/dev/null; then
    printf '%s\n' "$c_tok"
    exit 0
  fi
fi

b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }

# ---- build + sign the App JWT (RS256) ----
header='{"alg":"RS256","typ":"JWT"}'
# iat backdated 60s for clock skew; exp at +9 min (GitHub allows <= 10 min)
payload="$(printf '{"iat":%s,"exp":%s,"iss":"%s"}' "$((now - 60))" "$((now + 540))" "$GH_APP_ID")"
h="$(printf '%s' "$header"  | b64url)"
p="$(printf '%s' "$payload" | b64url)"
sig="$(printf '%s' "$h.$p" | openssl dgst -sha256 -sign "$GH_APP_PRIVATE_KEY" -binary | b64url)"
jwt="$h.$p.$sig"

# ---- exchange the JWT for an installation token ----
resp="$(curl -fsS -X POST \
  -H "Authorization: Bearer $jwt" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/app/installations/$GH_APP_INSTALLATION_ID/access_tokens")" \
  || { echo "gh-app-token: installation-token request failed" >&2; exit 1; }

token="$(printf '%s' "$resp" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("token",""))')"
expat="$(printf '%s' "$resp" | python3 -c 'import sys,json,calendar,time; e=json.load(sys.stdin).get("expires_at",""); print(calendar.timegm(time.strptime(e,"%Y-%m-%dT%H:%M:%SZ")) if e else 0)')"
[ -n "$token" ] || { echo "gh-app-token: no token in response" >&2; exit 1; }

# ---- cache (best effort) and emit ----
umask 077
printf 'token=%s\nexpires_at=%s\n' "$token" "${expat:-0}" > "$CACHE_FILE" 2>/dev/null || true
printf '%s\n' "$token"
