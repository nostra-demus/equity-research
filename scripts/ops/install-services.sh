#!/usr/bin/env bash
# Install / refresh the launchd supervision that keeps app.nostra-demus.com alive forever.
#
# The plists in this directory are MACHINE-AGNOSTIC TEMPLATES: they carry {{TOKENS}} (e.g. {{HOME}},
# {{ENGINE_REPO_ROOT}}, {{NPM_BIN}}) that this installer renders to the CURRENT machine's real paths at
# install time (see render()). That is why the same repo works on any host / any username / Intel OR
# Apple-Silicon Homebrew — nothing here is hardcoded to one operator's home or /opt/homebrew.
#
# ROLES (--role doer|admin, default doer):
#   base agents  (BOTH roles): engine, deploy, watchdog, caffeinate
#   doer-only agents         : tunnel, news-archive, news-ingester, + the 5 housekeeping timers (hk-*)
#   Exactly ONE machine should be the doer — it owns the public tunnel and runs the autonomous daily
#   jobs. Other machines install with --role admin (full local engine, no tunnel, no duplicate autonomy).
#
#   com.nostradamus.engine       — Fastify engine on :8787, runs from the PROD worktree (RunAtLoad+KeepAlive)  [base]
#   com.nostradamus.deploy       — auto-deploy watcher: main -> live, every 120s          (RunAtLoad+StartInterval) [base]
#   com.nostradamus.watchdog     — self-heal, every 30s                                   (RunAtLoad+StartInterval) [base]
#   com.nostradamus.caffeinate   — keep the Mac awake (no idle sleep) on battery AND AC     (RunAtLoad+KeepAlive)   [base]
#   com.nostradamus.tunnel       — cloudflared tunnel run                                 (RunAtLoad+KeepAlive)   [doer]
#   com.nostradamus.news-archive — news -> Google Drive, every 3h                         (RunAtLoad+StartInterval) [doer]
#   com.nostradamus.hk-*         — daily/monthly housekeeping (review/track/sweep/size/calibrate) [doer]
# Idempotent, no sudo. Engine + news-archive run from PROD; watchdog + deploy + housekeeping shell scripts from ~/.nostra-ops.
#
# RELIABILITY (why this is not a naive bootout;bootstrap loop):
#   `launchctl bootout` is ASYNC — an immediate `bootstrap` of the same label can fail with
#   "Input/output error" (errno 5). A naive loop under `set -e` then ABORTS right after the
#   bootout, leaving the service booted-out and DOWN. That exact bug took the engine offline.
#   So here we do NOT `set -e`; if a label is already loaded with an identical plist we just
#   restart it in place (no risky bootout); otherwise we bootout, WAIT until it is really gone,
#   then bootstrap with retries; and we verify each label ends up loaded.
#
# Usage:
#   bash scripts/ops/install-services.sh                 # role=doer (the always-on host)
#   bash scripts/ops/install-services.sh --role admin    # a secondary machine: engine only, no tunnel/timers
#   ENGINE_REPO_ROOT=/path/to/nostra-prod NEWS_ARCHIVE_DIR="/path/to/Drive/news-archive" bash scripts/ops/install-services.sh
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=service-load-contract.sh
source "$HERE/service-load-contract.sh"
AGENTS="$HOME/Library/LaunchAgents"
DOMAIN="gui/$(id -u)"
mkdir -p "$AGENTS" "$HOME/Library/Logs"

# ── install role ──────────────────────────────────────────────────────────────
ROLE="${NOSTRA_ROLE:-doer}"
while [ $# -gt 0 ]; do
  case "$1" in
    --role) [ $# -ge 2 ] || { echo "ERROR: --role needs a value (doer|admin)" >&2; exit 2; }; ROLE="$2"; shift 2 ;;
    --role=*) ROLE="${1#*=}"; shift ;;
    *) echo "WARN ignoring unknown arg: $1" >&2; shift ;;
  esac
done
case "$ROLE" in doer|admin) ;; *) echo "ERROR: --role must be 'doer' or 'admin' (got '$ROLE')" >&2; exit 2 ;; esac

# ── Production runtime topology ───────────────────────────────────────────────
# The live engine runs from a DEDICATED worktree pinned to main (PROD), NOT this dev tree, so
# development never disturbs production. com.nostradamus.deploy keeps PROD fast-forwarded to
# origin/main and rebuilds ui/dist / restarts the engine on merge. The watchdog + deploy + housekeeping
# SHELL scripts run from ~/.nostra-ops (stable, branch-independent); engine + news-archive run from PROD.
# Bootstrap the PROD worktree ONCE (see scripts/ops/README.md):
#   git worktree add -B main "$HOME/nostra-prod" origin/main
#   (cd "$HOME/nostra-prod/ui/server" && npm ci)
#   (cd "$HOME/nostra-prod/ui/web" && npm ci && npm run build)
#   rsync -a <devtree>/ui/server/.state/ "$HOME/nostra-prod/ui/server/.state/"   # gitignored runtime state
#   rsync -a <devtree>/data/             "$HOME/nostra-prod/data/"               # gitignored research data pool

# ── per-machine values the templates render to (see render()) ─────────────────
PROD="${ENGINE_REPO_ROOT:-$HOME/nostra-prod}"
STATE_DIR="${ENGINE_STATE_DIR:-$PROD/ui/server/.state}"
NEWS_ARCHIVE_DIR="${NEWS_ARCHIVE_DIR:-}"                 # empty ⇒ news-archive no-ops (no cloud archive)
# carry the Drive archive path over from an existing install when the caller didn't pass one, so a routine
# reinstall never silently blanks cloud archiving (unlike API keys, this value isn't in the secret-carry list).
if [ -z "$NEWS_ARCHIVE_DIR" ] && [ -f "$AGENTS/com.nostradamus.news-archive.plist" ]; then
  NEWS_ARCHIVE_DIR="$(/usr/libexec/PlistBuddy -c 'Print :EnvironmentVariables:NEWS_ARCHIVE_DIR' "$AGENTS/com.nostradamus.news-archive.plist" 2>/dev/null || true)"
  [ -n "$NEWS_ARCHIVE_DIR" ] && echo "carried over NEWS_ARCHIVE_DIR from existing install"
fi
# Autonomous news-bridge sweep default (#359, role-scoped). ADMIN machines never get autonomous bridge
# routing — same "no duplicate autonomy" reasoning as the doer-only agents above, applied to this
# in-process opt-in loop too, since the engine plist is BASE (installed on every role) and its
# EnvironmentVariables aren't otherwise role-scoped at all. A brand-new DOER install defaults to
# 'batch'; an EXISTING doer machine's prior explicit choice (the documented off/stream kill-switch)
# is carried over from the installed plist so a routine reinstall never silently resets it back to
# 'batch' — same carry-forward shape as NEWS_ARCHIVE_DIR just above.
if [ "$ROLE" = admin ]; then
  BRIDGE_MODE_VALUE="off"
else
  BRIDGE_MODE_VALUE="batch"
  if [ -f "$AGENTS/com.nostradamus.engine.plist" ]; then
    carried_bridge_mode="$(/usr/libexec/PlistBuddy -c 'Print :EnvironmentVariables:BRIDGE_MODE' "$AGENTS/com.nostradamus.engine.plist" 2>/dev/null || true)"
    if [ -n "$carried_bridge_mode" ]; then
      BRIDGE_MODE_VALUE="$carried_bridge_mode"
      echo "carried over BRIDGE_MODE=$carried_bridge_mode from existing install"
    fi
  fi
fi
# PATH baked into every agent — superset covering Apple-Silicon (/opt/homebrew) AND Intel (/usr/local) brew,
# plus the user's ~/.local/bin (where the Claude CLI often installs).
PLIST_PATH="$HOME/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
# resolve brew binaries to an ABSOLUTE path for launchd (which has a minimal PATH); prefer the caller's
# PATH, then the two brew prefixes. Fall back to the most likely prefix so render never emits an empty path.
resolve_bin() { local n="$1" fallback="$2" p; p="$(command -v "$n" 2>/dev/null || true)"; \
  [ -n "$p" ] || for c in "/opt/homebrew/bin/$n" "/usr/local/bin/$n"; do [ -x "$c" ] && p="$c" && break; done; \
  printf '%s' "${p:-$fallback}"; }
NPM_BIN="$(resolve_bin npm /usr/local/bin/npm)"
# node is launched DIRECTLY by the engine plist (not via `npm start` → tsx) so that launchctl's SIGTERM on
# `kickstart -k` reaches the node process, whose graceful-shutdown handler then drains SSE + closes sockets
# cleanly (npm/tsx do NOT forward the signal — the child would just be SIGKILLed, dropping connections).
NODE_BIN="$(resolve_bin node /usr/local/bin/node)"
PYTHON_BIN="$(resolve_bin python3 /usr/bin/python3)"
CLOUDFLARED_BIN="$(resolve_bin cloudflared /usr/local/bin/cloudflared)"

OPS="$HOME/.nostra-ops"; mkdir -p "$OPS"
# runtime copies of the ops shell scripts that the watchdog/deploy/housekeeping plists point at
for s in watchdog.sh deploy.sh housekeeping.sh; do cp "$HERE/$s" "$OPS/$s" && chmod +x "$OPS/$s"; done
# FAIL FAST if the prod worktree is missing. The engine + news-archive RUN from PROD and deploy keeps it
# fast-forwarded; installing the (RunAtLoad) launchd agents now would just crash-loop against a missing
# tree. Refuse, and tell the operator to create it first (one-time setup above / in the README).
if [ ! -e "$PROD/.git" ]; then
  echo "ERROR: prod worktree $PROD is missing — create it FIRST, then re-run this installer:" >&2
  echo "         git worktree add -B main \"$PROD\" origin/main   (+ npm ci / build / rsync — see README)" >&2
  echo "       Installing the launchd agents against a missing tree would crash-loop the engine." >&2
  exit 1
fi

loaded() { launchctl print "$DOMAIN/$1" >/dev/null 2>&1; }

# Connector v2 reads credentials only from this real owner-only directory/file. Normalize safe, owned paths
# up front; refuse symlinks/foreign ownership rather than following or replacing them. An absent providers.env
# is valid for public connectors and will be created by the migration helper only when an old plist has keys.
CONNECTOR_CONFIG_DIR="${NOSTRA_ENGINE_CONFIG_DIR:-$HOME/.config/nostra-engine}"
case "$CONNECTOR_CONFIG_DIR" in
  /*) ;;
  *) echo "ERROR: NOSTRA_ENGINE_CONFIG_DIR must be an absolute path" >&2; exit 1 ;;
esac
CONNECTOR_PROVIDERS_ENV="$CONNECTOR_CONFIG_DIR/providers.env"
prepare_connector_config() {
  if [ -e "$CONNECTOR_CONFIG_DIR" ] || [ -L "$CONNECTOR_CONFIG_DIR" ]; then
    [ ! -L "$CONNECTOR_CONFIG_DIR" ] && [ -d "$CONNECTOR_CONFIG_DIR" ] && [ -O "$CONNECTOR_CONFIG_DIR" ] \
      || { echo "ERROR: connector config directory must be a real current-user directory: $CONNECTOR_CONFIG_DIR" >&2; return 1; }
  else
    ( umask 077; mkdir -p "$CONNECTOR_CONFIG_DIR" ) \
      || { echo "ERROR: cannot create connector config directory: $CONNECTOR_CONFIG_DIR" >&2; return 1; }
  fi
  chmod 700 "$CONNECTOR_CONFIG_DIR" \
    || { echo "ERROR: cannot set connector config directory mode 0700" >&2; return 1; }
  if [ -e "$CONNECTOR_PROVIDERS_ENV" ] || [ -L "$CONNECTOR_PROVIDERS_ENV" ]; then
    [ ! -L "$CONNECTOR_PROVIDERS_ENV" ] && [ -f "$CONNECTOR_PROVIDERS_ENV" ] && [ -O "$CONNECTOR_PROVIDERS_ENV" ] \
      || { echo "ERROR: providers.env must be a real current-user file" >&2; return 1; }
    chmod 600 "$CONNECTOR_PROVIDERS_ENV" \
      || { echo "ERROR: cannot set providers.env mode 0600" >&2; return 1; }
  fi
}

# render <plist-path> — substitute the {{TOKENS}} in an installed/staged plist with this machine's real
# values, then FAIL LOUD if any token is left unrendered (a typo'd placeholder must not ship a broken plist).
# '#' is the sed delimiter because every value is a filesystem path (contains '/', never '#').
# Escape a value for safe substitution into an XML <string> via sed. Two layers, in order:
#  1) XML entity-escape (& < >) so the rendered plist stays VALID XML for any path (a bare & is illegal),
#  2) sed-RHS escape (backslash, &, and the # delimiter) so the value lands literally in the sed replacement.
# Order matters: XML-escape first (introduces &amp;), then sed-escape the resulting & so sed doesn't treat it
# as the whole-match reference. Realistic paths have none of these, but this makes render bulletproof.
xesc() {
  local s="$1"
  s="${s//&/&amp;}"; s="${s//</&lt;}"; s="${s//>/&gt;}"       # 1) XML entity-escape
  printf '%s' "$s" | sed -e 's/\\/\\\\/g' -e 's/[&#]/\\&/g'   # 2) sed-RHS escape
}
render() {
  local f="$1" e_home e_prod e_state e_path e_npm e_node e_cf e_news e_bridge e_connector_config
  e_home="$(xesc "$HOME")"; e_prod="$(xesc "$PROD")"; e_state="$(xesc "$STATE_DIR")"; e_path="$(xesc "$PLIST_PATH")"
  e_npm="$(xesc "$NPM_BIN")"; e_node="$(xesc "$NODE_BIN")"; e_cf="$(xesc "$CLOUDFLARED_BIN")"; e_news="$(xesc "$NEWS_ARCHIVE_DIR")"
  e_bridge="$(xesc "$BRIDGE_MODE_VALUE")"
  e_connector_config="$(xesc "$CONNECTOR_CONFIG_DIR")"
  sed -i '' \
    -e "s#{{HOME}}#$e_home#g" \
    -e "s#{{ENGINE_REPO_ROOT}}#$e_prod#g" \
    -e "s#{{STATE_DIR}}#$e_state#g" \
    -e "s#{{PLIST_PATH}}#$e_path#g" \
    -e "s#{{NPM_BIN}}#$e_npm#g" \
    -e "s#{{NODE_BIN}}#$e_node#g" \
    -e "s#{{CLOUDFLARED_BIN}}#$e_cf#g" \
    -e "s#{{NEWS_ARCHIVE_DIR}}#$e_news#g" \
    -e "s#{{BRIDGE_MODE}}#$e_bridge#g" \
    -e "s#{{CONNECTOR_CONFIG_DIR}}#$e_connector_config#g" \
    "$f"
  if grep -q '{{' "$f"; then
    echo "ERROR: unrendered placeholder(s) in $(basename "$f"):" >&2; grep -n '{{' "$f" >&2; return 1
  fi
}

install_one() {
  local label="$1" src="$HERE/$1.plist" dst="$AGENTS/$1.plist" i staged key cur ck claim=""
  local is_connector=0
  # SECRETS STAY OUT OF THE REPO. The fixed model-provider keys below live in their relevant INSTALLED
  # plists (~/Library/LaunchAgents) and are carried across reinstalls. Connector credentials are different:
  # every CONNECTOR_* value lives only in ~/.config/nostra-engine/providers.env and is deliberately neither
  # embedded nor carried here, so reinstalling the connector agent removes any historical plist duplicate.
  if [ "$label" = com.nostradamus.connectors ]; then
    is_connector=1
    # The staged connector must live beside its destination: mv(1) is then a same-filesystem atomic replace.
    staged="$(mktemp "$AGENTS/.${label}.staged.XXXXXX")" || return 1
  else
    staged="$(mktemp)" || return 1
  fi
  if ! cp "$src" "$staged" || [ ! -s "$staged" ]; then
    echo "  FAIL: missing/empty source plist $src — leaving existing install untouched" >&2; rm -f "$staged"; return 1
  fi
  # render the placeholder tokens to this machine's real paths BEFORE the secret carry + idempotency compare
  render "$staged" || { echo "  FAIL: could not render $label — leaving existing install untouched"; rm -f "$staged"; return 1; }
  # An older installed connector plist may still be the only credential copy. Preserve every exact key via
  # the same tested atomic helper deploy.sh uses before replacing that plist. Any conflict/unsafe path leaves
  # the existing install untouched. Then, defense in depth, strip connector keys from the new staged template.
  if [ "$is_connector" = 1 ]; then
    if [ -e "$dst" ] || [ -L "$dst" ]; then
      if [ -L "$dst" ] || [ ! -f "$dst" ] || [ ! -O "$dst" ]; then
        echo "  FAIL: installed connector plist must be a real current-user file — leaving existing install untouched" >&2
        rm -f "$staged"
        return 1
      fi
    fi
    while IFS= read -r ck; do
      [ -z "$ck" ] || /usr/libexec/PlistBuddy -c "Delete :EnvironmentVariables:$ck" "$staged" 2>/dev/null || true
    done < <(/usr/libexec/PlistBuddy -c "Print :EnvironmentVariables" "$staged" 2>/dev/null \
               | sed -nE 's/^[[:space:]]*(CONNECTOR_[A-Za-z0-9_]+)[[:space:]]*=.*/\1/p')
  fi
  if [ "$is_connector" != 1 ] && [ -f "$dst" ]; then
    for sk in GROQ_API_KEY GEMINI_API_KEY OPENROUTER_API_KEY NVIDIA_API_KEY CEREBRAS_API_KEY MISTRAL_API_KEY; do
      key="$(/usr/libexec/PlistBuddy -c "Print :EnvironmentVariables:$sk" "$dst" 2>/dev/null || true)"
      { [ -z "$key" ] || [ "$key" = "__SET_YOUR_${sk}__" ]; } && continue   # each provider has its OWN placeholder
      cur="$(/usr/libexec/PlistBuddy -c "Print :EnvironmentVariables:$sk" "$staged" 2>/dev/null || true)"
      if [ -z "$cur" ]; then
        /usr/libexec/PlistBuddy -c "Add :EnvironmentVariables:$sk string $key" "$staged" 2>/dev/null || true
      elif [ "$cur" = "__SET_YOUR_${sk}__" ]; then
        /usr/libexec/PlistBuddy -c "Set :EnvironmentVariables:$sk $key" "$staged" 2>/dev/null || true
      fi
    done
    # Connector credentials deliberately are NOT carried from an installed plist. Their sole persisted
    # source is ~/.config/nostra-engine/providers.env; replacing the old plist removes any historical
    # CONNECTOR_* duplication while the runner loads only names declared by each connector manifest.
  fi
  if [ "$is_connector" = 1 ]; then
    # Validate the fully rendered, post-migration contract before comparing or touching the installed file.
    # plutil catches platform plist defects; the stricter helper also proves the runner/config/secret contract
    # and uses an owner-only, no-follow, race-checked read.
    if ! chmod 600 "$staged" \
      || ! plutil -lint "$staged" >/dev/null \
      || ! nostra_validate_connector_plist "$staged" "$PROD" "$CONNECTOR_CONFIG_DIR"; then
      echo "  FAIL: staged connector plist failed its production contract — leaving existing install untouched" >&2
      rm -f "$staged"
      return 1
    fi
    # Claim the exact installed inode only after the replacement is fully rendered and validated. The
    # public pathname stays absent until activation commits or restores this private same-directory claim.
    if ! claim="$(nostra_claim_connector_plist "$HERE/migrate-connector-secrets.py" \
        "$dst" "$CONNECTOR_PROVIDERS_ENV")" || [ -z "$claim" ] || [ ! -f "$claim" ]; then
      echo "  FAIL: could not claim prior connector file/absence — leaving existing install untouched" >&2
      rm -f "$staged"
      return 1
    fi
  fi
  if loaded "$label" \
    && { { [ "$is_connector" = 1 ] && [ -n "$claim" ] && cmp -s "$staged" "$claim"; } \
         || { [ "$is_connector" != 1 ] && cmp -s "$staged" "$dst"; }; }; then
    rm -f "$staged"
    if [ "$is_connector" = 1 ] \
      && ! nostra_restore_connector_claim "$HERE/migrate-connector-secrets.py" \
        "$claim" "$dst" "$CONNECTOR_PROVIDERS_ENV"; then
      echo "  FAIL: unchanged connector could not restore its exact credential claim: $claim" >&2
      return 1
    fi
    launchctl kickstart -k "$DOMAIN/$label" 2>/dev/null || true   # current + loaded: restart in place
    if [ "$is_connector" = 1 ]; then
      nostra_report_loaded "$label"
      return $?
    fi
    echo "  ok (in place): $label"; return
  fi
  if [ "$is_connector" = 1 ]; then
    nostra_activate_connector_plist "$label" "$staged" "$dst" \
      "$PROD" "$CONNECTOR_CONFIG_DIR" "$AGENTS" "$DOMAIN" \
      "$claim" "$HERE/migrate-connector-secrets.py" "$CONNECTOR_PROVIDERS_ENV"
    return $?
  fi
  cp "$staged" "$dst" && rm -f "$staged"
  chmod 600 "$dst" 2>/dev/null || true
  launchctl bootout "$DOMAIN/$label" 2>/dev/null || true
  for i in $(seq 1 40); do loaded "$label" || break; sleep 0.25; done   # wait out async bootout (<=10s)
  for i in 1 2 3 4 5 6; do
    launchctl bootstrap "$DOMAIN" "$dst" 2>/dev/null && break
    sleep 0.5                                                            # tolerate the errno-5 race
  done
  launchctl kickstart -k "$DOMAIN/$label" 2>/dev/null || true
  nostra_report_loaded "$label"
}

# remove one agent entirely (used when demoting a machine to --role admin)
remove_one() {
  local label="$1" dst="$AGENTS/$1.plist" claim="" i
  # A doer→admin demotion removes the connector agent entirely, so it must
  # preserve any historical plist-only CONNECTOR_* values before deletion just
  # like an in-place doer reinstall does. Refuse the removal on any unsafe path,
  # duplicate, or conflicting value rather than silently deleting the last copy.
  if [ "$label" = com.nostradamus.connectors ]; then
    prepare_connector_config || return 1
    if ! claim="$(nostra_claim_connector_plist "$HERE/migrate-connector-secrets.py" \
        "$dst" "$CONNECTOR_PROVIDERS_ENV")" || [ -z "$claim" ] || [ ! -f "$claim" ]; then
      echo "  FAIL: could not preserve historical connector credentials — connector agent was not removed" >&2
      return 1
    fi
  fi
  if [ -n "$claim" ]; then
    launchctl bootout "$DOMAIN/$label" 2>/dev/null || true
    for i in $(seq 1 40); do loaded "$label" || break; sleep 0.25; done
    if loaded "$label"; then
      if ! nostra_restore_connector_claim "$HERE/migrate-connector-secrets.py" \
          "$claim" "$dst" "$CONNECTOR_PROVIDERS_ENV"; then
        echo "  FAIL: connector stayed loaded and its exact plist remains retained at $claim" >&2
      fi
      echo "  FAIL: connector agent did not unload and was not removed" >&2
      return 1
    fi
    if ! nostra_commit_connector_claim "$HERE/migrate-connector-secrets.py" \
        "$claim" "$dst" "$CONNECTOR_PROVIDERS_ENV" absent; then
      echo "  FAIL: connector pathname changed during removal; exact prior plist remains at $claim" >&2
      return 1
    fi
    echo "  removed (admin role): $label"
  elif [ -f "$dst" ] || loaded "$label"; then
    launchctl bootout "$DOMAIN/$label" 2>/dev/null || true
    rm -f "$dst" 2>/dev/null || true
    echo "  removed (admin role): $label"
  fi
}

BASE=(com.nostradamus.engine com.nostradamus.deploy com.nostradamus.watchdog com.nostradamus.caffeinate)
DOER_ONLY=(com.nostradamus.tunnel com.nostradamus.news-archive com.nostradamus.external-ingest \
           com.nostradamus.connectors \
           com.nostradamus.hk-review com.nostradamus.hk-track com.nostradamus.hk-sweep \
           com.nostradamus.hk-size com.nostradamus.hk-calibrate)
NEWS_INGESTER=com.nostradamus.news-ingester   # doer-only AND opt-in (needs a real GROQ key in its plist)

echo "installing role=$ROLE (prod=$PROD)"
if [ "$ROLE" = doer ]; then
  prepare_connector_config || exit 1
fi
LABELS=("${BASE[@]}")
[ "$ROLE" = doer ] && LABELS+=("${DOER_ONLY[@]}")
install_failed=0
for label in "${LABELS[@]}"; do
  echo "installing $label"
  install_one "$label" || install_failed=1
done

# Optional autonomous news ingester (standalone 24/7 mode) — DOER ONLY, and only once you've put your
# free Groq key into its plist (replacing the placeholder). Until then it's skipped, so a keyless setup is
# unaffected. The cockpit server also runs the ingester in-process when GROQ_API_KEY is set, so this
# standalone service is only needed if you want ingestion to run with the cockpit closed.
if [ "$ROLE" = doer ]; then
  if grep -q "__SET_YOUR_GROQ_API_KEY__" "$HERE/$NEWS_INGESTER.plist"; then
    echo "skipping $NEWS_INGESTER (set your GROQ_API_KEY in its plist to enable)"
  else
    echo "installing $NEWS_INGESTER"
    install_one "$NEWS_INGESTER" || install_failed=1
  fi
fi

# admin role: strip any doer-only agents this machine may have had, so a doer→admin demotion is clean
# (otherwise a stale tunnel/timer would keep running and fight the real doer).
if [ "$ROLE" = admin ]; then
  remove_failed=0
  for label in "${DOER_ONLY[@]}" "$NEWS_INGESTER"; do
    remove_one "$label" || remove_failed=1
  done
  [ "$remove_failed" = 0 ] || exit 1
fi

echo
echo "status (each should show a PID):"
launchctl list | grep -i nostradamus || echo "  (none loaded!)"
echo "logs: ~/Library/Logs/nostradamus-{engine,tunnel,deploy,watchdog,news-archive,caffeinate,housekeeping}.log"
[ "$install_failed" = 0 ] || exit 1
