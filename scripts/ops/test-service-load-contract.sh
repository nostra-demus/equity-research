#!/usr/bin/env bash
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=service-load-contract.sh
source "$HERE/service-load-contract.sh"
# shellcheck source=omniroute-service-contract.sh
source "$HERE/omniroute-service-contract.sh"

failures=0
TEST_TMP="$(mktemp -d)" || exit 1
trap 'rm -rf "$TEST_TMP"' EXIT
PYTHON_BIN="$(command -v python3)"

# The optional OmniRoute sidecar is a security + availability boundary: foreground supervision must stay
# with launchd, and the local model gateway must never drift from loopback. Parse the template structurally so
# formatting changes cannot weaken the assertion.
if "$PYTHON_BIN" -I - "$HERE/com.nostradamus.omniroute.plist" <<'PYOMNIROUTEPLIST'
import plistlib
import sys

with open(sys.argv[1], "rb") as handle:
    contract = plistlib.load(handle)
expected_args = [
    "{{OMNIROUTE_BIN}}",
    "serve",
    "--port",
    "20128",
    "--no-open",
    "--no-tray",
    "--log",
]
env = contract.get("EnvironmentVariables", {})
expected_env_keys = {
    "HOME", "PATH", "DATA_DIR", "OMNIROUTE_SERVER_HOST", "PORT", "DASHBOARD_PORT", "API_PORT",
}
assert contract.get("Label") == "com.nostradamus.omniroute"
assert contract.get("ProgramArguments") == expected_args
assert "--daemon" not in contract.get("ProgramArguments", [])
assert env.get("OMNIROUTE_SERVER_HOST") == "127.0.0.1"
assert env.get("PORT") == env.get("DASHBOARD_PORT") == env.get("API_PORT") == "20128"
assert env.get("HOME") == "{{HOME}}"
assert env.get("PATH") == "{{PLIST_PATH}}"
assert set(env) == expected_env_keys
assert env.get("DATA_DIR") == "{{HOME}}/.omniroute"
assert contract.get("RunAtLoad") is True
assert contract.get("KeepAlive") is True
assert contract.get("Umask") == 63
assert contract.get("ThrottleInterval") == 10
assert contract.get("StandardOutPath") == contract.get("StandardErrorPath")
assert contract.get("StandardOutPath") == "{{HOME}}/Library/Logs/nostradamus-omniroute.log"
PYOMNIROUTEPLIST
then
  echo "  ok  OmniRoute LaunchAgent is foreground-supervised and loopback-only"
else
  echo "  FAIL OmniRoute LaunchAgent contract is invalid"
  failures=$((failures + 1))
fi

# The manual installer never guesses an executable. Normal deploy owns exact provisioning, health, scorer
# proof, private enable, and retry backoff without rerunning unrelated service installation.
if "$PYTHON_BIN" -I - "$HERE/deploy.sh" <<'PYDEPLOYPATH'
import pathlib
import sys

text = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
path_contract = 'export PATH="/opt/homebrew/bin:/usr/local/bin:${PATH:-/usr/bin:/bin:/usr/sbin:/sbin}"'
npm_discovery = 'NPM="$(command -v npm 2>/dev/null || true)"'
assert path_contract in text
assert npm_discovery in text
assert text.index(path_contract) < text.index(npm_discovery)
PYDEPLOYPATH
then
  echo "  ok  deploy runtime exposes Homebrew node/npm/sidecars before tool discovery"
else
  echo "  FAIL deploy runtime can strand npm behind launchd's minimal PATH"
  failures=$((failures + 1))
fi

if grep -Fq 'OMNIROUTE_BIN="$(command -v omniroute 2>/dev/null || true)"' "$HERE/install-services.sh" \
    && grep -Fq 'if [ -n "$OMNIROUTE_BIN" ]; then' "$HERE/install-services.sh" \
    && grep -Fq 'remove_one "$OMNIROUTE_SERVICE"' "$HERE/install-services.sh" \
    && grep -Fq 'NOSTRA_OMNIROUTE_REQUIRED_VERSION=3.8.49' "$HERE/omniroute-service-contract.sh" \
    && grep -Fq 'reconcile_omniroute_launchagent()' "$HERE/deploy.sh" \
    && grep -Fq '"omniroute@$NOSTRA_OMNIROUTE_REQUIRED_VERSION"' "$HERE/deploy.sh" \
    && grep -Fq -- '--only omniroute' "$HERE/deploy.sh" \
    && grep -Fq 'n127.0.0.1:20128' "$HERE/deploy.sh" \
    && grep -Fq 'nostra_omniroute_healthz_healthy' "$HERE/deploy.sh" \
    && grep -Fq 'nostra_omniroute_models_healthy' "$HERE/deploy.sh" \
    && grep -Fq 'NEWS_OMNIROUTE_ENABLED --value "$1"' "$HERE/deploy.sh" \
    && grep -Fq 'NOSTRA_OMNIROUTE_RETRY_SECS:-900' "$HERE/deploy.sh" \
    && grep -Fq 'NOSTRA_OMNIROUTE_REVALIDATE_SECS:-21600' "$HERE/deploy.sh" \
    && grep -Fq 'nostra_run_omniroute_smoke_pair "$PYTHON" "$smoke" "$smoke_result" 105' "$HERE/deploy.sh" \
    && grep -Fq 'ensure-no-log-key --file "$providers_env"' "$HERE/deploy.sh" \
    && grep -Fq 'verify-no-body-log --file "$providers_env"' "$HERE/deploy.sh" \
    && grep -Fq 'omniroute_descriptor_fingerprint' "$HERE/deploy.sh" \
    && grep -Fq 'omniroute-engine-disabled-v1' "$HERE/deploy.sh" \
    && grep -Fq 'omniroute_revert_enable private-env-enable-failed' "$HERE/deploy.sh" \
    && grep -Fq '[ "$is_connector" != 1 ] && [ "$is_omniroute" != 1 ]' "$HERE/install-services.sh" \
    && grep -Fq 'buildOmniRouteProvider' "$HERE/omniroute-smoke.ts" \
    && grep -Fq "provider.baseUrl !== 'http://127.0.0.1:20128/v1'" "$HERE/omniroute-smoke.ts" \
    && grep -Fq 'triageBatch(items' "$HERE/omniroute-smoke.ts" \
    && grep -Fq 'value.get("expectedRows") != 12 or value.get("passes") != 2' "$HERE/deploy.sh"; then
  echo "  ok  OmniRoute provisioning/health/smoke/enable transaction is fail-closed"
else
  echo "  FAIL OmniRoute managed provisioning transaction is incomplete"
  failures=$((failures + 1))
fi

# Version proof is executable, exact, and part of the deployment fingerprint. Changing even an otherwise
# valid 3.8.49 launcher must invalidate the identity; banners and other versions are rejected.
EXACT_OMNI="$TEST_TMP/omniroute-exact"
WRONG_OMNI="$TEST_TMP/omniroute-wrong"
NOISY_OMNI="$TEST_TMP/omniroute-noisy"
printf '%s\n' '#!/bin/sh' '[ "$1" = --version ] || exit 2' 'printf "3.8.49\\n"' > "$EXACT_OMNI"
printf '%s\n' '#!/bin/sh' '[ "$1" = --version ] || exit 2' 'printf "3.8.50\\n"' > "$WRONG_OMNI"
printf '%s\n' '#!/bin/sh' '[ "$1" = --version ] || exit 2' 'printf "OmniRoute 3.8.49\\n"' > "$NOISY_OMNI"
chmod +x "$EXACT_OMNI" "$WRONG_OMNI" "$NOISY_OMNI"
first_identity="$(nostra_probe_omniroute_binary "$PYTHON_BIN" "$EXACT_OMNI" 2>/dev/null || true)"
printf '%s\n' '# identity change' >> "$EXACT_OMNI"
second_identity="$(nostra_probe_omniroute_binary "$PYTHON_BIN" "$EXACT_OMNI" 2>/dev/null || true)"
if printf '%s\n' "$first_identity" "$second_identity" | grep -Eqv '^3\.8\.49:[0-9a-f]{64}$' \
    || [ "$first_identity" = "$second_identity" ] \
    || nostra_probe_omniroute_binary "$PYTHON_BIN" "$WRONG_OMNI" >/dev/null 2>&1 \
    || nostra_probe_omniroute_binary "$PYTHON_BIN" "$NOISY_OMNI" >/dev/null 2>&1; then
  echo "  FAIL OmniRoute exact-version/binary-identity proof is weak"
  failures=$((failures + 1))
else
  echo "  ok  OmniRoute exact 3.8.49 proof fingerprints executable identity"
fi

OMNI_HOME="$TEST_TMP/omniroute-home"
OMNI_INSTALLED="$TEST_TMP/omniroute-installed.plist"
mkdir -p "$OMNI_HOME"
"$PYTHON_BIN" -I - "$HERE/com.nostradamus.omniroute.plist" "$OMNI_INSTALLED" \
    "$EXACT_OMNI" "$OMNI_HOME" <<'PYOMNIRENDER'
import os, sys
source, destination, binary, home = sys.argv[1:]
raw = open(source, encoding="utf-8").read()
raw = raw.replace("{{OMNIROUTE_BIN}}", binary).replace("{{HOME}}", home)
raw = raw.replace(
    "{{PLIST_PATH}}",
    f"{home}/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin",
)
open(destination, "w", encoding="utf-8").write(raw)
os.chmod(destination, 0o600)
PYOMNIRENDER
cp "$OMNI_INSTALLED" "$TEST_TMP/omniroute-wrong-port.plist"
cp "$OMNI_INSTALLED" "$TEST_TMP/omniroute-extra-secret.plist"
"$PYTHON_BIN" -I - "$TEST_TMP/omniroute-wrong-port.plist" <<'PYOMNIMUTATE'
import plistlib, sys
path = sys.argv[1]
with open(path, "rb") as handle:
    contract = plistlib.load(handle)
contract["ProgramArguments"][3] = "20129"
with open(path, "wb") as handle:
    plistlib.dump(contract, handle)
PYOMNIMUTATE
"$PYTHON_BIN" -I - "$TEST_TMP/omniroute-extra-secret.plist" <<'PYOMNISECRET'
import plistlib, sys
path = sys.argv[1]
with open(path, "rb") as handle:
    contract = plistlib.load(handle)
contract["EnvironmentVariables"]["GROQ_API_KEY"] = "must-never-carry"
with open(path, "wb") as handle:
    plistlib.dump(contract, handle)
PYOMNISECRET
if nostra_validate_omniroute_plist "$PYTHON_BIN" "$OMNI_INSTALLED" "$EXACT_OMNI" "$OMNI_HOME" \
    && ! nostra_validate_omniroute_plist "$PYTHON_BIN" \
      "$TEST_TMP/omniroute-wrong-port.plist" "$EXACT_OMNI" "$OMNI_HOME" \
    && ! nostra_validate_omniroute_plist "$PYTHON_BIN" \
      "$TEST_TMP/omniroute-extra-secret.plist" "$EXACT_OMNI" "$OMNI_HOME"; then
  echo "  ok  installed OmniRoute plist proof accepts only the exact secret-free machine contract"
else
  echo "  FAIL installed OmniRoute plist proof accepted drift or rejected the exact contract"
  failures=$((failures + 1))
fi

if "$PYTHON_BIN" -I "$HERE/test-set-private-env.py"; then
  echo "  ok  private providers.env updater preserves secrets and fails closed"
else
  echo "  FAIL private providers.env updater contract"
  failures=$((failures + 1))
fi

# Activation/revalidation needs two consecutive complete batches. Exercise the real bounded/sanitized pair
# runner with deterministic pass-pass and pass-fail sequences, and prove it never makes a third call.
PAIR_SMOKE="$TEST_TMP/omniroute-pair-smoke.sh"
PAIR_STATE="$TEST_TMP/omniroute-pair.state"
PAIR_VERDICT="$TEST_TMP/omniroute-pair.verdict"
printf '%s\n' \
  '#!/usr/bin/env bash' \
  'set -uo pipefail' \
  '[ -z "${NEWS_OMNIROUTE_API_KEY:-}" ] || exit 97' \
  'count=0' \
  '[ ! -f "$OMNI_PAIR_STATE" ] || count="$(cat "$OMNI_PAIR_STATE")"' \
  'count=$((count + 1))' \
  'printf "%s\n" "$count" > "$OMNI_PAIR_STATE"' \
  'outcome="$(printf "%s" "$OMNI_PAIR_SEQUENCE" | cut -d, -f"$count")"' \
  'if [ "$outcome" = pass ]; then' \
  '  printf "%s\n" '\''{"ok":true,"rows":12,"expectedRows":12}'\''' \
  '  exit 0' \
  'fi' \
  'printf "%s\n" '\''{"ok":false,"rows":0,"expectedRows":12,"httpStatus":503}'\''' \
  'exit 1' > "$PAIR_SMOKE"
chmod +x "$PAIR_SMOKE"
: > "$PAIR_VERDICT"; chmod 600 "$PAIR_VERDICT"
OMNI_PAIR_STATE="$PAIR_STATE" OMNI_PAIR_SEQUENCE=pass,pass NEWS_OMNIROUTE_API_KEY=must-be-scrubbed \
  nostra_run_omniroute_smoke_pair "$PYTHON_BIN" "$PAIR_SMOKE" "$PAIR_VERDICT" 5
pair_pass_rc=$?
pair_pass_count="$(cat "$PAIR_STATE" 2>/dev/null || true)"
pair_pass_verdict="$(cat "$PAIR_VERDICT" 2>/dev/null || true)"
printf '0\n' > "$PAIR_STATE"
: > "$PAIR_VERDICT"; chmod 600 "$PAIR_VERDICT"
OMNI_PAIR_STATE="$PAIR_STATE" OMNI_PAIR_SEQUENCE=pass,fail NEWS_OMNIROUTE_API_KEY=must-be-scrubbed \
  nostra_run_omniroute_smoke_pair "$PYTHON_BIN" "$PAIR_SMOKE" "$PAIR_VERDICT" 5
pair_fail_rc=$?
pair_fail_count="$(cat "$PAIR_STATE" 2>/dev/null || true)"
pair_fail_verdict="$(cat "$PAIR_VERDICT" 2>/dev/null || true)"
if [ "$pair_pass_rc" -eq 0 ] && [ "$pair_pass_count" = 2 ] \
    && [ "$pair_fail_rc" -ne 0 ] && [ "$pair_fail_count" = 2 ] \
    && "$PYTHON_BIN" -I - "$pair_pass_verdict" "$pair_fail_verdict" <<'PYOMNIPAIRVERIFY'
import json, sys
passed = json.loads(sys.argv[1])
failed = json.loads(sys.argv[2])
assert passed == {"expectedRows": 12, "ok": True, "passes": 2, "rows": 12}
assert failed == {"completed": 1, "httpStatus": 503, "ok": False}
PYOMNIPAIRVERIFY
then
  echo "  ok  OmniRoute proof requires bounded pass-pass and rejects pass-fail"
else
  echo "  FAIL OmniRoute consecutive-smoke gate is not fail-closed/bounded"
  failures=$((failures + 1))
fi

# A marker is a time-bounded scorer proof, not a permanent healthz waiver. At the exact six-hour boundary it
# must expire and drive the same disable + two-smoke revalidation path.
FRESH_MARKER="$TEST_TMP/omniroute-fresh.marker"
printf '%s\n%s\n' 'desired-contract' 1000 > "$FRESH_MARKER"
chmod 600 "$FRESH_MARKER"
if nostra_omniroute_marker_fresh "$PYTHON_BIN" "$FRESH_MARKER" desired-contract 21600 22599 \
    && ! nostra_omniroute_marker_fresh "$PYTHON_BIN" "$FRESH_MARKER" desired-contract 21600 22600 \
    && ! nostra_omniroute_marker_fresh "$PYTHON_BIN" "$FRESH_MARKER" wrong-contract 21600 1001; then
  echo "  ok  OmniRoute scorer marker expires at the bounded six-hour revalidation interval"
else
  echo "  FAIL OmniRoute scorer marker age/identity contract is weak"
  failures=$((failures + 1))
fi

# Mock only the loopback HTTP peer; execute the real TS smoke and production parser. Each invocation sends
# one 12-headline, non-streaming request and must return every index exactly once.
MOCK_PORT_FILE="$TEST_TMP/omniroute-mock.port"
MOCK_REQUEST_FILE="$TEST_TMP/omniroute-mock.request"
"$PYTHON_BIN" -I - "$MOCK_PORT_FILE" "$MOCK_REQUEST_FILE" <<'PYOMNIMOCK' &
import json
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

port_file, request_file = sys.argv[1:]

class Handler(BaseHTTPRequestHandler):
    def log_message(self, _format, *_args):
        pass

    def do_GET(self):
        if self.path == "/healthz":
            encoded = b"ok\n"
            content_type = "text/plain"
        elif self.path == "/v1/models":
            if self.headers.get("Authorization") != "Bearer contract-test-no-log-key":
                self.send_response(401)
                self.end_headers()
                return
            encoded = json.dumps({"data": [{"id": "oc/hy3-free"}]}).encode()
            content_type = "application/json"
        else:
            self.send_response(404)
            self.end_headers()
            return
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def do_POST(self):
        try:
            size = int(self.headers.get("content-length", "0"))
            body = json.loads(self.rfile.read(size))
            prompt = body.get("messages", [{}, {}])[1].get("content", "")
            model = body.get("model")
            valid = (self.path == "/v1/chat/completions" and model in {"mock-model", "mock-incomplete"}
                     and body.get("stream") is False and body.get("reasoning_effort") == "none"
                     and body.get("max_tokens") == 7000
                     and prompt.startswith("Score these 12 headlines:"))
            if not valid:
                raise ValueError
            row_count = 11 if model == "mock-incomplete" else 12
            rows = [{
                "i": index, "relevance": "material", "materiality_pre_score": 80,
                "event_materiality_label": "high", "event_direction": "neutral",
                "event_types": ["macro_sector"], "issuer_linkage": "macro",
                "why": "Mocked material event for the supervised scorer contract.",
                "companies": [], "size_bucket": "unknown", "headline_en": None,
                "headline_lang": None, "event_region": "GLOBAL",
            } for index in range(row_count)]
            payload = {"usage": {"total_tokens": 1200}, "choices": [{
                "finish_reason": "stop", "message": {"content": json.dumps({"items": rows})},
            }]}
            if row_count == 12:
                open(request_file, "w", encoding="utf-8").write("valid-12\n")
            encoded = json.dumps(payload).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(encoded)))
            self.end_headers()
            self.wfile.write(encoded)
        except Exception:
            self.send_response(400)
            self.end_headers()

server = HTTPServer(("127.0.0.1", 0), Handler)
server.timeout = 15
open(port_file, "w", encoding="ascii").write(str(server.server_port))
for _request in range(4):
    server.handle_request()
server.server_close()
PYOMNIMOCK
mock_server_pid=$!
for _wait in $(seq 1 200); do [ -s "$MOCK_PORT_FILE" ] && break; sleep 0.01; done
mock_port="$(cat "$MOCK_PORT_FILE" 2>/dev/null || true)"
mkdir -p "$TEST_TMP/omniroute-smoke-config" "$TEST_TMP/omniroute-smoke-home"
chmod 700 "$TEST_TMP/omniroute-smoke-config"
printf '%s\n' 'NEWS_OMNIROUTE_API_KEY=contract-test-no-log-key' \
  > "$TEST_TMP/omniroute-smoke-config/providers.env"
chmod 600 "$TEST_TMP/omniroute-smoke-config/providers.env"
if [ -n "$mock_port" ]; then
  if nostra_omniroute_healthz_healthy "$PYTHON_BIN" "$mock_port" \
      && nostra_omniroute_models_healthy "$PYTHON_BIN" oc/hy3-free "$mock_port" \
        "$TEST_TMP/omniroute-smoke-config/providers.env"; then
    mock_health_rc=0
  else
    mock_health_rc=1
  fi
  HOME="$TEST_TMP/omniroute-smoke-home" \
    NOSTRA_ENGINE_CONFIG_DIR="$TEST_TMP/omniroute-smoke-config" \
    NEWS_OMNIROUTE_API_KEY= NEWS_OMNIROUTE_MODEL=mock-model \
    NEWS_OMNIROUTE_BASE_URL="http://127.0.0.1:$mock_port/v1" \
    NEWS_OMNIROUTE_TIMEOUT_MS=5000 \
    /bin/bash "$HERE/omniroute-smoke.sh" --test-loopback \
      >"$TEST_TMP/omniroute-smoke.out" 2>"$TEST_TMP/omniroute-smoke.err"
  mock_smoke_rc=$?
  HOME="$TEST_TMP/omniroute-smoke-home" \
    NOSTRA_ENGINE_CONFIG_DIR="$TEST_TMP/omniroute-smoke-config" \
    NEWS_OMNIROUTE_API_KEY= NEWS_OMNIROUTE_MODEL=mock-incomplete \
    NEWS_OMNIROUTE_BASE_URL="http://127.0.0.1:$mock_port/v1" \
    NEWS_OMNIROUTE_TIMEOUT_MS=5000 \
    /bin/bash "$HERE/omniroute-smoke.sh" --test-loopback \
      >"$TEST_TMP/omniroute-incomplete.out" 2>"$TEST_TMP/omniroute-incomplete.err"
  incomplete_smoke_rc=$?
else
  mock_health_rc=1
  mock_smoke_rc=1
  incomplete_smoke_rc=0
fi
kill "$mock_server_pid" 2>/dev/null || true
wait "$mock_server_pid" 2>/dev/null || true
if [ "$mock_health_rc" -eq 0 ] && [ "$mock_smoke_rc" -eq 0 ] \
    && [ "$incomplete_smoke_rc" -ne 0 ] \
    && [ "$(cat "$MOCK_REQUEST_FILE" 2>/dev/null || true)" = valid-12 ] \
    && "$PYTHON_BIN" -I - "$TEST_TMP/omniroute-smoke.out" \
      "$TEST_TMP/omniroute-incomplete.err" <<'PYOMNIOUT'
import json, sys
value = json.loads(open(sys.argv[1], encoding="utf-8").read().splitlines()[-1])
assert value.get("ok") is True and value.get("rows") == value.get("expectedRows") == 12
incomplete = json.loads(open(sys.argv[2], encoding="utf-8").read().splitlines()[-1])
assert incomplete.get("ok") is False and incomplete.get("rows") == 0
assert incomplete.get("expectedRows") == 12
PYOMNIOUT
then
  echo "  ok  mocked loopback proves health/catalog and accepts only a complete 12-index scorer response"
else
  echo "  FAIL mocked OmniRoute production-size scorer smoke"
  sed 's/^/    /' "$TEST_TMP/omniroute-smoke.out" "$TEST_TMP/omniroute-smoke.err" 2>/dev/null || true
  failures=$((failures + 1))
fi

BAD_HEALTH_PORT_FILE="$TEST_TMP/omniroute-bad-health.port"
"$PYTHON_BIN" -I - "$BAD_HEALTH_PORT_FILE" <<'PYOMNIBADHEALTH' &
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def log_message(self, _format, *_args):
        pass
    def do_GET(self):
        body = b"okay\n"
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

server = HTTPServer(("127.0.0.1", 0), Handler)
server.timeout = 10
open(sys.argv[1], "w", encoding="ascii").write(str(server.server_port))
server.handle_request()
server.server_close()
PYOMNIBADHEALTH
bad_health_pid=$!
for _wait in $(seq 1 200); do [ -s "$BAD_HEALTH_PORT_FILE" ] && break; sleep 0.01; done
bad_health_port="$(cat "$BAD_HEALTH_PORT_FILE" 2>/dev/null || true)"
if [ -n "$bad_health_port" ] \
    && nostra_omniroute_healthz_healthy "$PYTHON_BIN" "$bad_health_port"; then
  bad_health_rc=0
elif [ -n "$bad_health_port" ]; then
  bad_health_rc=1
else
  bad_health_rc=2
fi
kill "$bad_health_pid" 2>/dev/null || true
wait "$bad_health_pid" 2>/dev/null || true
if [ "$bad_health_rc" -eq 1 ]; then
  echo "  ok  healthz rejects a 200 response with non-OmniRoute body"
else
  echo "  FAIL healthz accepted an unrelated 200 listener"
  failures=$((failures + 1))
fi

# The manual selected-need uploader signs its request envelope with a key under ENGINE_STATE_DIR.
# The doer-only ten-minute recovery job must use that exact same private directory; otherwise a server
# crash after staging leaves a valid request that the Mac Pro timer can never authenticate. Keep this
# assertion at the template boundary so a future installer/render refactor cannot silently drop it.
if grep -A8 '<key>EnvironmentVariables</key>' "$HERE/com.nostradamus.external-ingest.plist" \
    | grep -q '<key>ENGINE_STATE_DIR</key>' \
  && grep -q '<string>{{STATE_DIR}}</string>' "$HERE/com.nostradamus.external-ingest.plist"; then
  echo "  ok  external-ingest recovery shares the engine state directory"
else
  echo "  FAIL external-ingest recovery is not bound to ENGINE_STATE_DIR"
  failures=$((failures + 1))
fi

portable_file_size() {
  "$PYTHON_BIN" -I - "$1" <<'PY'
import os
import sys

print(os.lstat(sys.argv[1]).st_size)
PY
}

expect_connector_rejection() {
  local description="$1" plist_path="$2" repo_root="$3" config_dir="$4"
  if nostra_validate_connector_plist "$plist_path" "$repo_root" "$config_dir" \
      >"$TEST_TMP/validation.out" 2>"$TEST_TMP/validation.err"; then
    echo "  FAIL $description was accepted"
    failures=$((failures + 1))
  else
    echo "  ok  $description is rejected"
  fi
}

TEST_REPO="$TEST_TMP/nostra-prod"
TEST_CONFIG="$TEST_TMP/config"
TEST_HOME="$TEST_TMP/home"
mkdir -p "$TEST_REPO" "$TEST_CONFIG" "$TEST_HOME"
chmod 700 "$TEST_CONFIG"
VALID_PLIST="$TEST_TMP/connectors-valid.plist"
"$PYTHON_BIN" -I - "$VALID_PLIST" "$TEST_REPO" "$TEST_CONFIG" "$TEST_HOME" <<'PY'
import os
import plistlib
import sys

destination, repo_root, config_dir, home = sys.argv[1:]
contract = {
    "Label": "com.nostradamus.connectors",
    "EnvironmentVariables": {
        "HOME": home,
        "PATH": "/usr/bin:/bin",
        "NOSTRA_CONNECTOR_CREDENTIAL_SOURCE": "providers_env",
        "NOSTRA_ENGINE_CONFIG_DIR": config_dir,
    },
    "WorkingDirectory": repo_root,
    "ProgramArguments": [
        "/usr/bin/env",
        "python3",
        "-I",
        os.path.join(repo_root, ".claude", "tools", "run_connectors.py"),
        "--data-root",
        os.path.join(repo_root, "data"),
    ],
    "MaterializeDatalessFiles": True,
    "RunAtLoad": True,
    "StartInterval": 900,
    "ThrottleInterval": 60,
    "StandardOutPath": os.path.join(home, "Library", "Logs", "nostradamus-connectors.log"),
    "StandardErrorPath": os.path.join(home, "Library", "Logs", "nostradamus-connectors.log"),
}
with open(destination, "wb") as handle:
    plistlib.dump(contract, handle)
os.chmod(destination, 0o600)
PY

if nostra_validate_connector_plist "$VALID_PLIST" "$TEST_REPO" "$TEST_CONFIG" >/dev/null 2>&1; then
  echo "  ok  valid connector production contract is accepted"
else
  echo "  FAIL valid connector production contract was rejected"
  failures=$((failures + 1))
fi

mutate_plist() {
  local source="$1" destination="$2" mutation="$3"
  "$PYTHON_BIN" -I - "$source" "$destination" "$mutation" <<'PY'
import os
import plistlib
import sys

source, destination, mutation = sys.argv[1:]
with open(source, "rb") as handle:
    contract = plistlib.load(handle)
if mutation == "credential":
    contract["EnvironmentVariables"]["CONNECTOR_TEST_TOKEN"] = "must-not-appear-in-errors"
elif mutation == "no-isolation":
    contract["ProgramArguments"].remove("-I")
elif mutation == "cadence":
    contract["StartInterval"] = 901
elif mutation == "config":
    contract["EnvironmentVariables"]["NOSTRA_ENGINE_CONFIG_DIR"] = "/unexpected/config"
else:
    raise SystemExit(f"unknown mutation: {mutation}")
with open(destination, "wb") as handle:
    plistlib.dump(contract, handle)
os.chmod(destination, 0o600)
PY
}

credential_plist() {
  local source="$1" destination="$2" value="$3"
  "$PYTHON_BIN" -I - "$source" "$destination" "$value" <<'PY'
import os
import plistlib
import sys

source, destination, value = sys.argv[1:]
with open(source, "rb") as handle:
    contract = plistlib.load(handle)
contract["EnvironmentVariables"]["CONNECTOR_TEST_TOKEN"] = value
with open(destination, "wb") as handle:
    plistlib.dump(contract, handle)
os.chmod(destination, 0o600)
PY
}

credential_value() {
  "$PYTHON_BIN" -I - "$1" <<'PY'
import plistlib
import sys

with open(sys.argv[1], "rb") as handle:
    contract = plistlib.load(handle)
print(contract.get("EnvironmentVariables", {}).get("CONNECTOR_TEST_TOKEN", ""))
PY
}

for mutation in credential no-isolation cadence config; do
  MUTATED_PLIST="$TEST_TMP/connectors-$mutation.plist"
  mutate_plist "$VALID_PLIST" "$MUTATED_PLIST" "$mutation"
  expect_connector_rejection "connector $mutation contract defect" "$MUTATED_PLIST" "$TEST_REPO" "$TEST_CONFIG"
  if grep -q 'must-not-appear-in-errors' "$TEST_TMP/validation.err"; then
    echo "  FAIL connector validator leaked a credential value"
    failures=$((failures + 1))
  fi
done

chmod 640 "$VALID_PLIST"
expect_connector_rejection "group-readable connector plist" "$VALID_PLIST" "$TEST_REPO" "$TEST_CONFIG"
chmod 600 "$VALID_PLIST"
ln -s "$VALID_PLIST" "$TEST_TMP/connectors-link.plist"
expect_connector_rejection "symlink connector plist" "$TEST_TMP/connectors-link.plist" "$TEST_REPO" "$TEST_CONFIG"

RACE_PLIST="$TEST_TMP/connectors-same-size-race.plist"
cp "$VALID_PLIST" "$RACE_PLIST"
chmod 600 "$RACE_PLIST"
RACE_SIZE="$(portable_file_size "$RACE_PLIST")"
RACE_SYNC="$TEST_TMP/validator-sync"
mkdir -p "$RACE_SYNC"
nostra_validate_connector_plist "$RACE_PLIST" "$TEST_REPO" "$TEST_CONFIG" "$RACE_SYNC" \
  >"$TEST_TMP/race.out" 2>"$TEST_TMP/race.err" &
RACE_PID=$!
for _wait in $(seq 1 200); do [ -f "$RACE_SYNC/validator-opened" ] && break; sleep 0.01; done
if [ ! -f "$RACE_SYNC/validator-opened" ]; then
  echo "  FAIL same-size mutation test could not synchronize with secure open"
  failures=$((failures + 1))
  kill "$RACE_PID" 2>/dev/null || true
  wait "$RACE_PID" 2>/dev/null || true
else
  "$PYTHON_BIN" -I - "$RACE_PLIST" "$RACE_SYNC/mutation-complete" <<'PY'
import os
import sys

path, completion = sys.argv[1:]
before = os.stat(path)
with open(path, "r+b", buffering=0) as handle:
    payload = handle.read()
    mutated = payload.replace(b"<integer>900</integer>", b"<integer>901</integer>", 1)
    if mutated == payload or len(mutated) != len(payload):
        raise SystemExit("same-size fixture mutation was not possible")
    handle.seek(0)
    handle.write(mutated)
    os.fsync(handle.fileno())
# Force a distinct mtime even on a coarse timestamp filesystem; ctime changes independently as well.
os.utime(path, ns=(before.st_atime_ns, before.st_mtime_ns + 1_000_000_000))
descriptor = os.open(completion, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
os.close(descriptor)
PY
  if wait "$RACE_PID"; then RACE_RESULT=0; else RACE_RESULT=$?; fi
  if [ "$RACE_RESULT" = 0 ]; then
    echo "  FAIL same-size in-place mutation escaped connector validation"
    failures=$((failures + 1))
  elif [ "$(portable_file_size "$RACE_PLIST")" != "$RACE_SIZE" ]; then
    echo "  FAIL timestamp regression did not preserve file size"
    failures=$((failures + 1))
  elif ! grep -Eq 'changed during secure read|changed during validation' "$TEST_TMP/race.err"; then
    echo "  FAIL same-size mutation was rejected for an unexpected reason"
    failures=$((failures + 1))
  else
    echo "  ok  mtime/ctime checks reject a deterministic same-size in-place mutation"
  fi
fi

# The activation helper must restore the old on-disk contract before touching launchd when the atomic
# replacement cannot be verified, and restore both file + loaded state when a valid replacement will not load.
ROLLBACK_AGENTS="$TEST_TMP/LaunchAgents"
mkdir -p "$ROLLBACK_AGENTS"
ROLLBACK_DST="$ROLLBACK_AGENTS/com.nostradamus.connectors.plist"
mutate_plist "$VALID_PLIST" "$ROLLBACK_DST" cadence
ROLLBACK_HASH="$(shasum -a 256 "$ROLLBACK_DST" | awk '{print $1}')"

mock_loaded=1
mock_launchctl_calls=0
mock_bootstrap_attempts=0
loaded() { [ "$mock_loaded" = 1 ]; }
launchctl() {
  mock_launchctl_calls=$((mock_launchctl_calls + 1))
  case "$1" in
    bootout) mock_loaded=0; return 0 ;;
    bootstrap) mock_loaded=1; return 0 ;;
    kickstart) return 0 ;;
    *) return 1 ;;
  esac
}

INVALID_STAGED="$(mktemp "$ROLLBACK_AGENTS/.com.nostradamus.connectors.staged.XXXXXX")"
mutate_plist "$VALID_PLIST" "$INVALID_STAGED" no-isolation
if nostra_activate_connector_plist com.nostradamus.connectors "$INVALID_STAGED" "$ROLLBACK_DST" \
    "$TEST_REPO" "$TEST_CONFIG" "$ROLLBACK_AGENTS" gui/test >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  echo "  FAIL invalid installed connector contract activated"
  failures=$((failures + 1))
elif [ "$mock_launchctl_calls" != 0 ] \
  || [ "$(shasum -a 256 "$ROLLBACK_DST" | awk '{print $1}')" != "$ROLLBACK_HASH" ] \
  || ! loaded com.nostradamus.connectors; then
  echo "  FAIL pre-bootout connector verification did not preserve prior file/service"
  failures=$((failures + 1))
else
  echo "  ok  failed installed verification rolls back before bootout"
fi

mock_loaded=1
mock_launchctl_calls=0
mock_bootstrap_attempts=0
launchctl() {
  mock_launchctl_calls=$((mock_launchctl_calls + 1))
  case "$1" in
    bootout) return 0 ;; # Simulate launchd accepting bootout while the prior job remains registered.
    bootstrap) mock_bootstrap_attempts=$((mock_bootstrap_attempts + 1)); return 1 ;;
    kickstart) return 0 ;;
    *) return 1 ;;
  esac
}
sleep() { :; }
STICKY_STAGED="$(mktemp "$ROLLBACK_AGENTS/.com.nostradamus.connectors.staged.XXXXXX")"
cp "$VALID_PLIST" "$STICKY_STAGED"
chmod 600 "$STICKY_STAGED"
if nostra_activate_connector_plist com.nostradamus.connectors "$STICKY_STAGED" "$ROLLBACK_DST" \
    "$TEST_REPO" "$TEST_CONFIG" "$ROLLBACK_AGENTS" gui/test >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  STICKY_RESULT=0
else
  STICKY_RESULT=$?
fi
unset -f sleep
if [ "$STICKY_RESULT" = 0 ]; then
  echo "  FAIL connector reported success while prior job ignored bootout"
  failures=$((failures + 1))
elif [ "$(shasum -a 256 "$ROLLBACK_DST" | awk '{print $1}')" != "$ROLLBACK_HASH" ] \
  || ! loaded com.nostradamus.connectors \
  || [ "$mock_bootstrap_attempts" != 0 ]; then
  echo "  FAIL sticky prior connector state was confused with replacement activation"
  failures=$((failures + 1))
else
  echo "  ok  prior job surviving bootout cannot masquerade as replacement success"
fi

mock_loaded=1
mock_launchctl_calls=0
mock_bootstrap_attempts=0
launchctl() {
  mock_launchctl_calls=$((mock_launchctl_calls + 1))
  case "$1" in
    bootout) mock_loaded=0; return 0 ;;
    bootstrap)
      mock_bootstrap_attempts=$((mock_bootstrap_attempts + 1))
      if [ "$mock_bootstrap_attempts" -le 6 ]; then return 1; fi
      mock_loaded=1
      return 0
      ;;
    kickstart) return 0 ;;
    *) return 1 ;;
  esac
}
VALID_STAGED="$(mktemp "$ROLLBACK_AGENTS/.com.nostradamus.connectors.staged.XXXXXX")"
cp "$VALID_PLIST" "$VALID_STAGED"
chmod 600 "$VALID_STAGED"
if nostra_activate_connector_plist com.nostradamus.connectors "$VALID_STAGED" "$ROLLBACK_DST" \
    "$TEST_REPO" "$TEST_CONFIG" "$ROLLBACK_AGENTS" gui/test >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  echo "  FAIL connector activation failure returned success"
  failures=$((failures + 1))
elif [ "$(shasum -a 256 "$ROLLBACK_DST" | awk '{print $1}')" != "$ROLLBACK_HASH" ] \
  || ! loaded com.nostradamus.connectors \
  || [ "$mock_bootstrap_attempts" != 7 ]; then
  echo "  FAIL connector activation failure did not restore prior file/load state"
  failures=$((failures + 1))
elif find "$ROLLBACK_AGENTS" -maxdepth 1 -name '.com.nostradamus.connectors.backup.*' -print -quit | grep -q .; then
  echo "  FAIL successful connector rollback left a backup artifact"
  failures=$((failures + 1))
else
  echo "  ok  failed connector activation restores prior file and loaded state"
fi

# A credential-aware activation owns the exact pre-install inode through a private claim. If another plist
# appears at the public pathname after the claim, activation must not overwrite either credential generation.
CLAIM_COLLISION_AGENTS="$TEST_TMP/LaunchAgents-claim-collision"
mkdir -p "$CLAIM_COLLISION_AGENTS"
CLAIM_COLLISION_DST="$CLAIM_COLLISION_AGENTS/com.nostradamus.connectors.plist"
CLAIM_COLLISION_PROVIDERS="$TEST_CONFIG/claim-collision-providers.env"
credential_plist "$VALID_PLIST" "$CLAIM_COLLISION_DST" old-secret
CLAIM_COLLISION_PATH="$(nostra_claim_connector_plist "$HERE/migrate-connector-secrets.py" \
  "$CLAIM_COLLISION_DST" "$CLAIM_COLLISION_PROVIDERS")"
credential_plist "$VALID_PLIST" "$CLAIM_COLLISION_DST" new-secret
CLAIM_COLLISION_STAGED="$(mktemp "$CLAIM_COLLISION_AGENTS/.com.nostradamus.connectors.staged.XXXXXX")"
cp "$VALID_PLIST" "$CLAIM_COLLISION_STAGED"
chmod 600 "$CLAIM_COLLISION_STAGED"
mock_loaded=1
mock_launchctl_calls=0
launchctl() { mock_launchctl_calls=$((mock_launchctl_calls + 1)); return 1; }
if nostra_activate_connector_plist com.nostradamus.connectors "$CLAIM_COLLISION_STAGED" \
    "$CLAIM_COLLISION_DST" "$TEST_REPO" "$TEST_CONFIG" "$CLAIM_COLLISION_AGENTS" gui/test \
    "$CLAIM_COLLISION_PATH" "$HERE/migrate-connector-secrets.py" "$CLAIM_COLLISION_PROVIDERS" \
    >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  CLAIM_COLLISION_RESULT=0
else
  CLAIM_COLLISION_RESULT=$?
fi
if [ "$CLAIM_COLLISION_RESULT" = 0 ] \
  || [ "$mock_launchctl_calls" != 0 ] \
  || [ ! -f "$CLAIM_COLLISION_PATH" ] \
  || [ "$(credential_value "$CLAIM_COLLISION_PATH")" != old-secret ] \
  || [ "$(credential_value "$CLAIM_COLLISION_DST")" != new-secret ] \
  || ! grep -q '^CONNECTOR_TEST_TOKEN=old-secret$' "$CLAIM_COLLISION_PROVIDERS"; then
  echo "  FAIL concurrent connector pathname replacement was clobbered or lost its private claim"
  failures=$((failures + 1))
else
  echo "  ok  claimed activation refuses a concurrent pathname without losing either credential generation"
fi

# A fresh install claims absence with an owned guard. Replacing that guard before publication must retain the
# unexpected file in the private transaction, never overwrite or remove it as though it were ours.
ABSENT_COLLISION_AGENTS="$TEST_TMP/LaunchAgents-absence-collision"
mkdir -p "$ABSENT_COLLISION_AGENTS"
ABSENT_COLLISION_DST="$ABSENT_COLLISION_AGENTS/com.nostradamus.connectors.plist"
ABSENT_COLLISION_PROVIDERS="$TEST_CONFIG/absence-collision-providers.env"
ABSENT_COLLISION_CLAIM="$(nostra_claim_connector_plist "$HERE/migrate-connector-secrets.py" \
  "$ABSENT_COLLISION_DST" "$ABSENT_COLLISION_PROVIDERS")"
credential_plist "$VALID_PLIST" "$ABSENT_COLLISION_DST.new" must-survive
mv -f "$ABSENT_COLLISION_DST.new" "$ABSENT_COLLISION_DST"
ABSENT_COLLISION_STAGED="$(mktemp "$ABSENT_COLLISION_AGENTS/.com.nostradamus.connectors.staged.XXXXXX")"
cp "$VALID_PLIST" "$ABSENT_COLLISION_STAGED"
chmod 600 "$ABSENT_COLLISION_STAGED"
mock_loaded=0
mock_launchctl_calls=0
launchctl() { mock_launchctl_calls=$((mock_launchctl_calls + 1)); return 1; }
if nostra_activate_connector_plist com.nostradamus.connectors "$ABSENT_COLLISION_STAGED" \
    "$ABSENT_COLLISION_DST" "$TEST_REPO" "$TEST_CONFIG" "$ABSENT_COLLISION_AGENTS" gui/test \
    "$ABSENT_COLLISION_CLAIM" "$HERE/migrate-connector-secrets.py" "$ABSENT_COLLISION_PROVIDERS" \
    >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  ABSENT_COLLISION_RESULT=0
else
  ABSENT_COLLISION_RESULT=$?
fi
ABSENT_RETAINED="$(find "$ABSENT_COLLISION_AGENTS" -type f -name public-entry -print -quit 2>/dev/null)"
if [ "$ABSENT_COLLISION_RESULT" = 0 ] || [ "$mock_launchctl_calls" != 0 ] \
  || [ -z "$ABSENT_RETAINED" ] || [ "$(credential_value "$ABSENT_RETAINED")" != must-survive ]; then
  echo "  FAIL initially-absent activation deleted or overwrote an unowned concurrent pathname"
  failures=$((failures + 1))
else
  echo "  ok  initially-absent activation retains an unowned concurrent pathname without launchd changes"
fi

# Ordinary bootstrap failure still restores and reloads the exact claimed prior plist, then removes the
# private claim/anchor transaction artifacts.
CLAIM_ROLLBACK_AGENTS="$TEST_TMP/LaunchAgents-claim-rollback"
mkdir -p "$CLAIM_ROLLBACK_AGENTS"
CLAIM_ROLLBACK_DST="$CLAIM_ROLLBACK_AGENTS/com.nostradamus.connectors.plist"
CLAIM_ROLLBACK_PROVIDERS="$TEST_CONFIG/claim-rollback-providers.env"
credential_plist "$VALID_PLIST" "$CLAIM_ROLLBACK_DST" rollback-secret
CLAIM_ROLLBACK_HASH="$(shasum -a 256 "$CLAIM_ROLLBACK_DST" | awk '{print $1}')"
CLAIM_ROLLBACK_PATH="$(nostra_claim_connector_plist "$HERE/migrate-connector-secrets.py" \
  "$CLAIM_ROLLBACK_DST" "$CLAIM_ROLLBACK_PROVIDERS")"
CLAIM_ROLLBACK_STAGED="$(mktemp "$CLAIM_ROLLBACK_AGENTS/.com.nostradamus.connectors.staged.XXXXXX")"
cp "$VALID_PLIST" "$CLAIM_ROLLBACK_STAGED"
chmod 600 "$CLAIM_ROLLBACK_STAGED"
mock_loaded=1
mock_bootstrap_attempts=0
launchctl() {
  case "$1" in
    bootout) mock_loaded=0; return 0 ;;
    bootstrap)
      mock_bootstrap_attempts=$((mock_bootstrap_attempts + 1))
      if [ "$mock_bootstrap_attempts" -le 6 ]; then return 1; fi
      mock_loaded=1
      return 0
      ;;
    kickstart) return 0 ;;
    *) return 1 ;;
  esac
}
if nostra_activate_connector_plist com.nostradamus.connectors "$CLAIM_ROLLBACK_STAGED" \
    "$CLAIM_ROLLBACK_DST" "$TEST_REPO" "$TEST_CONFIG" "$CLAIM_ROLLBACK_AGENTS" gui/test \
    "$CLAIM_ROLLBACK_PATH" "$HERE/migrate-connector-secrets.py" "$CLAIM_ROLLBACK_PROVIDERS" \
    >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  CLAIM_ROLLBACK_RESULT=0
else
  CLAIM_ROLLBACK_RESULT=$?
fi
if [ "$CLAIM_ROLLBACK_RESULT" = 0 ] \
  || [ "$(shasum -a 256 "$CLAIM_ROLLBACK_DST" | awk '{print $1}')" != "$CLAIM_ROLLBACK_HASH" ] \
  || [ -e "$CLAIM_ROLLBACK_PATH" ] \
  || ! loaded com.nostradamus.connectors \
  || [ "$mock_bootstrap_attempts" != 7 ]; then
  echo "  FAIL claimed connector activation failure did not restore exact prior file/load state"
  failures=$((failures + 1))
else
  echo "  ok  failed claimed activation restores and reloads the exact prior plist"
fi

# A failure at the irreversible boundary is still an activation failure: unload the replacement, restore
# the exact claim without consulting providers.env, and reload the previously-running service.
COMMIT_FAIL_AGENTS="$TEST_TMP/LaunchAgents-commit-fail"
mkdir -p "$COMMIT_FAIL_AGENTS"
COMMIT_FAIL_DST="$COMMIT_FAIL_AGENTS/com.nostradamus.connectors.plist"
COMMIT_FAIL_PROVIDERS="$TEST_CONFIG/commit-fail-providers.env"
credential_plist "$VALID_PLIST" "$COMMIT_FAIL_DST" commit-rollback-secret
COMMIT_FAIL_HASH="$(shasum -a 256 "$COMMIT_FAIL_DST" | awk '{print $1}')"
COMMIT_FAIL_CLAIM="$(nostra_claim_connector_plist "$HERE/migrate-connector-secrets.py" \
  "$COMMIT_FAIL_DST" "$COMMIT_FAIL_PROVIDERS")"
COMMIT_FAIL_UNKNOWN="$(dirname "$COMMIT_FAIL_CLAIM")/interrupted-replacement.plist"
credential_plist "$VALID_PLIST" "$COMMIT_FAIL_UNKNOWN" retained-after-commit-failure
COMMIT_FAIL_STAGED="$(mktemp "$COMMIT_FAIL_AGENTS/.com.nostradamus.connectors.staged.XXXXXX")"
cp "$VALID_PLIST" "$COMMIT_FAIL_STAGED"
chmod 600 "$COMMIT_FAIL_STAGED"
mock_loaded=1
mock_bootstrap_attempts=0
launchctl() {
  case "$1" in
    bootout) mock_loaded=0; return 0 ;;
    bootstrap)
      mock_bootstrap_attempts=$((mock_bootstrap_attempts + 1))
      mock_loaded=1
      [ "$mock_bootstrap_attempts" = 1 ] && rm -f "$COMMIT_FAIL_PROVIDERS"
      return 0
      ;;
    kickstart) return 0 ;;
    *) return 1 ;;
  esac
}
if nostra_activate_connector_plist com.nostradamus.connectors "$COMMIT_FAIL_STAGED" \
    "$COMMIT_FAIL_DST" "$TEST_REPO" "$TEST_CONFIG" "$COMMIT_FAIL_AGENTS" gui/test \
    "$COMMIT_FAIL_CLAIM" "$HERE/migrate-connector-secrets.py" "$COMMIT_FAIL_PROVIDERS" \
    >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  COMMIT_FAIL_RESULT=0
else
  COMMIT_FAIL_RESULT=$?
fi
COMMIT_FAIL_RETAINED="$(find "$COMMIT_FAIL_AGENTS" -type f \
  -name interrupted-replacement.plist -print -quit 2>/dev/null)"
if [ "$COMMIT_FAIL_RESULT" = 0 ] \
  || [ "$(shasum -a 256 "$COMMIT_FAIL_DST" | awk '{print $1}')" != "$COMMIT_FAIL_HASH" ] \
  || [ -e "$COMMIT_FAIL_CLAIM" ] || [ -e "$COMMIT_FAIL_PROVIDERS" ] \
  || [ -z "$COMMIT_FAIL_RETAINED" ] \
  || [ "$(credential_value "$COMMIT_FAIL_RETAINED")" != retained-after-commit-failure ] \
  || ! loaded com.nostradamus.connectors || [ "$mock_bootstrap_attempts" != 2 ]; then
  echo "  FAIL post-bootstrap commit failure left the replacement active or lost the prior claim"
  sed 's/^/    /' "$TEST_TMP/activate.err" 2>/dev/null || true
  failures=$((failures + 1))
else
  echo "  ok  post-bootstrap commit failure unloads replacement and restores/reloads exact prior claim"
fi

SUCCESS_AGENTS="$TEST_TMP/LaunchAgents-success"
mkdir -p "$SUCCESS_AGENTS"
SUCCESS_DST="$SUCCESS_AGENTS/com.nostradamus.connectors.plist"
SUCCESS_PROVIDERS="$TEST_CONFIG/success-providers.env"
SUCCESS_CLAIM="$(nostra_claim_connector_plist "$HERE/migrate-connector-secrets.py" \
  "$SUCCESS_DST" "$SUCCESS_PROVIDERS")"
SUCCESS_STAGED="$(mktemp "$SUCCESS_AGENTS/.com.nostradamus.connectors.staged.XXXXXX")"
cp "$VALID_PLIST" "$SUCCESS_STAGED"
chmod 600 "$SUCCESS_STAGED"
mock_loaded=0
mock_launchctl_calls=0
launchctl() {
  mock_launchctl_calls=$((mock_launchctl_calls + 1))
  case "$1" in
    bootout) mock_loaded=0; return 0 ;;
    bootstrap) mock_loaded=1; return 0 ;;
    kickstart) return 0 ;;
    *) return 1 ;;
  esac
}
if ! nostra_activate_connector_plist com.nostradamus.connectors "$SUCCESS_STAGED" "$SUCCESS_DST" \
    "$TEST_REPO" "$TEST_CONFIG" "$SUCCESS_AGENTS" gui/test \
    "$SUCCESS_CLAIM" "$HERE/migrate-connector-secrets.py" "$SUCCESS_PROVIDERS" \
    >"$TEST_TMP/activate.out" 2>"$TEST_TMP/activate.err"; then
  echo "  FAIL valid connector contract did not activate"
  failures=$((failures + 1))
elif [ "$(shasum -a 256 "$SUCCESS_DST" | awk '{print $1}')" != "$(shasum -a 256 "$VALID_PLIST" | awk '{print $1}')" ] \
  || [ -e "$SUCCESS_CLAIM" ] || ! loaded com.nostradamus.connectors; then
  echo "  FAIL valid connector activation did not publish/load exact staged bytes"
  failures=$((failures + 1))
elif find "$SUCCESS_AGENTS" -maxdepth 1 \( -name '.com.nostradamus.connectors.backup.*' \
    -o -name '.com.nostradamus.connectors.staged.*' \
    -o -name '.com.nostradamus.connectors.plist.credential-claim-*' \
    -o -name '.com.nostradamus.connectors.plist.credential-committed-*' \) \
    -print -quit | grep -q .; then
  echo "  FAIL valid connector activation left a staging/transaction artifact"
  failures=$((failures + 1))
else
  echo "  ok  valid connector activation atomically publishes and loads"
fi

unset -f launchctl loaded
loaded() { return 1; }
if nostra_report_loaded com.nostradamus.connectors >/dev/null 2>&1; then
  echo "  FAIL failed bootstrap returned success"
  failures=$((failures + 1))
else
  echo "  ok  failed bootstrap returns nonzero"
fi

loaded() { return 0; }
if nostra_report_loaded com.nostradamus.connectors >/dev/null 2>&1; then
  echo "  ok  loaded service returns success"
else
  echo "  FAIL loaded service returned nonzero"
  failures=$((failures + 1))
fi

if [ "$failures" = 0 ]; then
  echo "PASS: service load result contract"
  exit 0
fi
echo "FAIL: service load result contract — $failures failure(s)"
exit 1
