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
  local f="$1" e_home e_prod e_state e_path e_npm e_node e_cf e_news
  e_home="$(xesc "$HOME")"; e_prod="$(xesc "$PROD")"; e_state="$(xesc "$STATE_DIR")"; e_path="$(xesc "$PLIST_PATH")"
  e_npm="$(xesc "$NPM_BIN")"; e_node="$(xesc "$NODE_BIN")"; e_cf="$(xesc "$CLOUDFLARED_BIN")"; e_news="$(xesc "$NEWS_ARCHIVE_DIR")"
  sed -i '' \
    -e "s#{{HOME}}#$e_home#g" \
    -e "s#{{ENGINE_REPO_ROOT}}#$e_prod#g" \
    -e "s#{{STATE_DIR}}#$e_state#g" \
    -e "s#{{PLIST_PATH}}#$e_path#g" \
    -e "s#{{NPM_BIN}}#$e_npm#g" \
    -e "s#{{NODE_BIN}}#$e_node#g" \
    -e "s#{{CLOUDFLARED_BIN}}#$e_cf#g" \
    -e "s#{{NEWS_ARCHIVE_DIR}}#$e_news#g" \
    "$f"
  if grep -q '{{' "$f"; then
    echo "ERROR: unrendered placeholder(s) in $(basename "$f"):" >&2; grep -n '{{' "$f" >&2; return 1
  fi
}

install_one() {
  local label="$1" src="$HERE/$1.plist" dst="$AGENTS/$1.plist" i staged key cur
  # SECRETS STAY OUT OF THE REPO: real API keys live only in the INSTALLED plists
  # (~/Library/LaunchAgents), never in these versioned copies. On reinstall, carry EVERY provider key
  # over from the installed plist when the repo copy lacks it (or only has the placeholder) — otherwise
  # a routine reinstall would silently drop keys and turn providers / the news ingester off.
  staged="$(mktemp)" || return 1
  if ! cp "$src" "$staged" || [ ! -s "$staged" ]; then
    echo "  FAIL: missing/empty source plist $src — leaving existing install untouched" >&2; rm -f "$staged"; return 1
  fi
  # render the placeholder tokens to this machine's real paths BEFORE the secret carry + idempotency compare
  render "$staged" || { echo "  FAIL: could not render $label — leaving existing install untouched"; rm -f "$staged"; return 1; }
  if [ -f "$dst" ]; then
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
    # A connector the interactive builder (#298) generates with acquisition `free_key_api`/`paid_api` reads
    # its own credential from a `CONNECTOR_*`-prefixed env var, hand-added to the INSTALLED
    # com.nostradamus.connectors.plist the same way an LLM key is added above — but the key's exact NAME
    # is open-ended (the builder names it per-connector), so it can't be a fixed list like the LLM keys.
    # Sweep every EnvironmentVariables key already in the installed plist and carry forward any that starts
    # with CONNECTOR_ and isn't already in the freshly-rendered copy — otherwise a routine reinstall silently
    # drops it, and that connector fails (and can spuriously trip the repair watchdog) on every sweep after.
    while IFS= read -r ck; do
      [ -z "$ck" ] && continue
      key="$(/usr/libexec/PlistBuddy -c "Print :EnvironmentVariables:$ck" "$dst" 2>/dev/null || true)"
      [ -z "$key" ] && continue
      cur="$(/usr/libexec/PlistBuddy -c "Print :EnvironmentVariables:$ck" "$staged" 2>/dev/null || true)"
      [ -z "$cur" ] && { /usr/libexec/PlistBuddy -c "Add :EnvironmentVariables:$ck string $key" "$staged" 2>/dev/null || true; }
    done < <(/usr/libexec/PlistBuddy -c "Print :EnvironmentVariables" "$dst" 2>/dev/null \
               | grep -E '^[[:space:]]+CONNECTOR_[A-Za-z0-9_]+[[:space:]]*=' \
               | sed -E 's/^[[:space:]]*([A-Za-z0-9_]+)[[:space:]]*=.*/\1/')
  fi
  if loaded "$label" && cmp -s "$staged" "$dst"; then
    rm -f "$staged"
    launchctl kickstart -k "$DOMAIN/$label" 2>/dev/null || true   # current + loaded: restart in place
    echo "  ok (in place): $label"; return
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
  if loaded "$label"; then echo "  ok (reloaded): $label"
  else echo "  WARN: $label did NOT load — re-run this installer"; fi
}

# remove one agent entirely (used when demoting a machine to --role admin)
remove_one() {
  local label="$1"
  if [ -f "$AGENTS/$label.plist" ] || loaded "$label"; then
    launchctl bootout "$DOMAIN/$label" 2>/dev/null || true
    rm -f "$AGENTS/$label.plist" 2>/dev/null || true
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
LABELS=("${BASE[@]}")
[ "$ROLE" = doer ] && LABELS+=("${DOER_ONLY[@]}")
for label in "${LABELS[@]}"; do
  echo "installing $label"
  install_one "$label"
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
    install_one "$NEWS_INGESTER"
  fi
fi

# admin role: strip any doer-only agents this machine may have had, so a doer→admin demotion is clean
# (otherwise a stale tunnel/timer would keep running and fight the real doer).
if [ "$ROLE" = admin ]; then
  for label in "${DOER_ONLY[@]}" "$NEWS_INGESTER"; do remove_one "$label"; done
fi

echo
echo "status (each should show a PID):"
launchctl list | grep -i nostradamus || echo "  (none loaded!)"
echo "logs: ~/Library/Logs/nostradamus-{engine,tunnel,deploy,watchdog,news-archive,caffeinate,housekeeping}.log"
