#!/usr/bin/env bash
# Source-only OmniRoute binary + loopback-health contract shared by install-services.sh and deploy.sh.

NOSTRA_OMNIROUTE_REQUIRED_VERSION=3.8.49

# Print a non-secret, stable identity only when <candidate> is an executable OmniRoute 3.8.49 binary.
# Identity covers the invoked path, resolved target, file metadata/content, and validated version.
nostra_probe_omniroute_binary() {
  local python_bin="$1" candidate="$2"
  [ -n "$candidate" ] || return 1
  "$python_bin" -I - "$candidate" "$NOSTRA_OMNIROUTE_REQUIRED_VERSION" <<'PYOMNIPROBE'
import hashlib
import os
import stat
import subprocess
import sys

candidate, required = sys.argv[1:]
try:
    if not os.path.isabs(candidate) or "\n" in candidate or "\t" in candidate:
        raise OSError
    invoked_before = os.lstat(candidate)
    resolved = os.path.realpath(candidate)
    target_before = os.lstat(resolved)
    if (not stat.S_ISREG(target_before.st_mode) or not os.access(candidate, os.X_OK)
            or not 0 < target_before.st_size <= 16 * 1024 * 1024):
        raise OSError
    descriptor = os.open(resolved, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    opened = os.fstat(descriptor)
    identity = lambda value: (
        value.st_dev, value.st_ino, value.st_size, value.st_mtime_ns,
        value.st_ctime_ns, value.st_mode, value.st_uid, value.st_nlink,
    )
    if identity(target_before) != identity(opened):
        raise OSError
    run = subprocess.run(
        [candidate, "--version"], stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
        text=True, timeout=8, check=False,
    )
    lines = [line.strip() for line in run.stdout.splitlines() if line.strip()]
    if run.returncode != 0 or lines != [required]:
        raise OSError
    digest = hashlib.sha256()
    digest.update(required.encode())
    digest.update(b"\0" + candidate.encode() + b"\0" + resolved.encode() + b"\0")
    digest.update(repr(identity(invoked_before)).encode() + b"\0" + repr(identity(opened)).encode())
    while True:
        block = os.read(descriptor, 1024 * 1024)
        if not block:
            break
        digest.update(block)
    target_after = os.fstat(descriptor)
    invoked_after = os.lstat(candidate)
    named_after = os.lstat(resolved)
    if (os.path.realpath(candidate) != resolved
            or identity(invoked_before) != identity(invoked_after)
            or identity(opened) != identity(target_after)
            or identity(target_after) != identity(named_after)):
        raise OSError
    print(f"{required}:{digest.hexdigest()}")
except (OSError, subprocess.SubprocessError, UnicodeError):
    raise SystemExit(1)
finally:
    if "descriptor" in locals():
        os.close(descriptor)
PYOMNIPROBE
}

# Cheap bounded liveness proof used on every deploy tick, including a marked-healthy fast path. Construct the
# URL here so callers cannot redirect the probe away from literal loopback. Body must be OmniRoute's exact
# three-byte `ok\n` response; a dashboard, proxy error page, or unrelated process on the port is not healthy.
nostra_omniroute_healthz_healthy() {
  local python_bin="$1" port="${2:-20128}"
  "$python_bin" -I - "$port" <<'PYOMNIHEALTHZ'
import sys
import urllib.request

try:
    port = int(sys.argv[1])
    if not 1 <= port <= 65535 or str(port) != sys.argv[1]:
        raise ValueError
    request = urllib.request.Request(f"http://127.0.0.1:{port}/healthz")
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    with opener.open(request, timeout=3) as response:
        raw = response.read(17)
        if response.status != 200 or raw != b"ok\n":
            raise ValueError
except Exception:
    raise SystemExit(1)
PYOMNIHEALTHZ
}

# Bounded catalog proof used only during full reconciliation. Construct the URL from a numeric port so it
# stays literal loopback. Once deploy has provisioned the no-log client key, read it from the same owner-only
# providers file the engine uses; never put the credential in argv, stdout, or the process environment.
nostra_omniroute_models_healthy() {
  local python_bin="$1" expected_model="$2" port="${3:-20128}" providers_env="${4:-}"
  "$python_bin" -I - "$port" "$expected_model" "$providers_env" <<'PYOMNIHEALTH'
import json
import os
import re
import stat
import sys
import urllib.request

port_raw, expected, providers_env = sys.argv[1:]
try:
    port = int(port_raw)
    if not 1 <= port <= 65535 or str(port) != port_raw:
        raise ValueError
except ValueError:
    raise SystemExit(1)
try:
    api_key = "omniroute"
    if providers_env:
        before = os.lstat(providers_env)
        if (stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode)
                or before.st_uid != os.getuid() or before.st_nlink != 1
                or before.st_mode & 0o077 or not 0 < before.st_size <= 1024 * 1024):
            raise OSError
        descriptor = os.open(providers_env, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
        opened = os.fstat(descriptor)
        raw = os.read(descriptor, opened.st_size + 1)
        after = os.fstat(descriptor)
        named = os.lstat(providers_env)
        identity = lambda value: (
            value.st_dev, value.st_ino, value.st_size, value.st_mtime_ns,
            value.st_ctime_ns, value.st_mode, value.st_uid, value.st_nlink,
        )
        if (len(raw) != opened.st_size or identity(before) != identity(opened)
                or identity(opened) != identity(after) or identity(after) != identity(named)):
            raise OSError
        matches = []
        for line in raw.decode("utf-8").splitlines():
            body = line.strip()
            if body.startswith("export "):
                body = body[7:].strip()
            match = re.match(r"^NEWS_OMNIROUTE_API_KEY\s*=(.*)$", body)
            if match:
                matches.append(match.group(1).strip().strip("\"'"))
        if len(matches) != 1 or not matches[0]:
            raise ValueError
        api_key = matches[0]
    url = f"http://127.0.0.1:{port}/v1/models"
    request = urllib.request.Request(url, headers={"Authorization": f"Bearer {api_key}"})
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    with opener.open(request, timeout=5) as response:
        if response.status != 200:
            raise ValueError
        raw = response.read(8 * 1024 * 1024 + 1)
        if len(raw) > 8 * 1024 * 1024:
            raise ValueError
    payload = json.loads(raw)
    rows = payload.get("data") if isinstance(payload, dict) else None
    ids = {row.get("id") for row in rows or [] if isinstance(row, dict)}
    if expected not in ids:
        raise ValueError
except Exception:
    raise SystemExit(1)
finally:
    if "descriptor" in locals():
        os.close(descriptor)
PYOMNIHEALTH
}

# One successful free-model call can be luck. Activation and periodic revalidation therefore require two
# consecutive complete production-contract smokes. Only a tiny sanitized verdict is persisted; raw stdout,
# stderr, prompts, provider replies, and credentials are never copied into deploy logs or status files.
nostra_run_omniroute_smoke_pair() {
  local python_bin="$1" smoke="$2" verdict_file="$3" timeout_seconds="${4:-105}"
  "$python_bin" -I - "$smoke" "$verdict_file" "$timeout_seconds" <<'PYOMNIPAIR'
import json
import os
import signal
import subprocess
import sys
import tempfile

smoke, verdict_file, timeout_raw = sys.argv[1:]

def publish(value):
    payload = (json.dumps(value, separators=(",", ":"), sort_keys=True) + "\n").encode()
    descriptor = os.open(verdict_file, os.O_WRONLY | os.O_TRUNC | getattr(os, "O_NOFOLLOW", 0))
    try:
        os.fchmod(descriptor, 0o600)
        written = 0
        while written < len(payload):
            written += os.write(descriptor, payload[written:])
        os.fsync(descriptor)
    finally:
        os.close(descriptor)

try:
    timeout = int(timeout_raw)
    if not 1 <= timeout <= 105 or str(timeout) != timeout_raw:
        raise ValueError
    environment = {
        key: value for key, value in os.environ.items()
        if not key.startswith("NEWS_OMNIROUTE_")
    }
    for completed in range(2):
        with tempfile.TemporaryFile() as captured:
            try:
                process = subprocess.Popen(
                    ["/bin/bash", smoke], stdin=subprocess.DEVNULL,
                    stdout=captured, stderr=captured, env=environment,
                    start_new_session=True,
                )
                returncode = process.wait(timeout=timeout)
            except subprocess.TimeoutExpired:
                try:
                    os.killpg(process.pid, signal.SIGKILL)
                except (OSError, ProcessLookupError):
                    pass
                process.wait()
                publish({"completed": completed, "httpStatus": None, "ok": False})
                raise SystemExit(1)
            except (OSError, subprocess.SubprocessError):
                publish({"completed": completed, "httpStatus": None, "ok": False})
                raise SystemExit(1)
            captured.seek(0)
            raw = captured.read(1024 * 1024 + 1)
        value = None
        if len(raw) <= 1024 * 1024:
            try:
                lines = raw.decode("utf-8").splitlines()
                value = json.loads(lines[-1]) if lines else None
            except (UnicodeError, ValueError):
                value = None
        if (returncode != 0 or not isinstance(value, dict)
                or value.get("ok") is not True or value.get("rows") != 12
                or value.get("expectedRows") != 12):
            status = value.get("httpStatus") if isinstance(value, dict) else None
            if not isinstance(status, int) or not 100 <= status <= 599:
                status = None
            publish({"completed": completed, "httpStatus": status, "ok": False})
            raise SystemExit(1)
    publish({"expectedRows": 12, "ok": True, "passes": 2, "rows": 12})
except (OSError, ValueError):
    try:
        publish({"completed": 0, "httpStatus": None, "ok": False})
    except OSError:
        pass
    raise SystemExit(1)
PYOMNIPAIR
}

# Validate the owner-only marker and its proof age in one no-follow read. A healthy listener is necessary but
# never sufficient forever: once the bounded age expires, deploy disables the route and runs the smoke pair.
nostra_omniroute_marker_fresh() {
  local python_bin="$1" marker="$2" desired="$3" max_age="$4" now="${5:-$(date +%s)}"
  "$python_bin" -I - "$marker" "$desired" "$max_age" "$now" <<'PYOMNIMARKER'
import os
import stat
import sys

path, desired, max_age_raw, now_raw = sys.argv[1:]
descriptor = None
try:
    max_age = int(max_age_raw)
    now = int(now_raw)
    if str(max_age) != max_age_raw or str(now) != now_raw or not 3600 <= max_age <= 86400:
        raise ValueError
    before = os.lstat(path)
    if (stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode)
            or before.st_uid != os.getuid() or before.st_nlink != 1 or before.st_mode & 0o077
            or not 0 < before.st_size <= 4096):
        raise OSError
    descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    opened = os.fstat(descriptor)
    raw = os.read(descriptor, opened.st_size + 1)
    after = os.fstat(descriptor)
    named = os.lstat(path)
    identity = lambda value: (
        value.st_dev, value.st_ino, value.st_size, value.st_mtime_ns,
        value.st_ctime_ns, value.st_mode, value.st_uid, value.st_nlink,
    )
    if (len(raw) != opened.st_size or identity(before) != identity(opened)
            or identity(opened) != identity(after) or identity(after) != identity(named)):
        raise OSError
    lines = raw.decode("utf-8").splitlines()
    if len(lines) != 2 or lines[0] != desired or not lines[1].isdigit():
        raise ValueError
    proven_at = int(lines[1])
    if proven_at > now + 5 or now - proven_at >= max_age:
        raise ValueError
except (OSError, UnicodeError, ValueError):
    raise SystemExit(1)
finally:
    if descriptor is not None:
        os.close(descriptor)
PYOMNIMARKER
}

# Validate the installed plist every healthy deploy tick without invoking launchctl or the network.
nostra_validate_omniroute_plist() {
  local python_bin="$1" plist_path="$2" binary="$3" expected_home="${4:-$HOME}"
  "$python_bin" -I - "$plist_path" "$binary" "$expected_home" <<'PYOMNIPLIST'
import os
import plistlib
import stat
import sys

path, binary, home = sys.argv[1:]
descriptor = None
try:
    before = os.lstat(path)
    if (stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode)
            or before.st_uid != os.getuid() or before.st_nlink != 1 or before.st_mode & 0o077
            or not 0 < before.st_size <= 1024 * 1024):
        raise OSError
    descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    opened = os.fstat(descriptor)
    raw = b""
    while len(raw) <= 1024 * 1024:
        block = os.read(descriptor, 64 * 1024)
        if not block:
            break
        raw += block
    after = os.fstat(descriptor)
    named = os.lstat(path)
    identity = lambda value: (
        value.st_dev, value.st_ino, value.st_size, value.st_mtime_ns,
        value.st_ctime_ns, value.st_mode, value.st_uid, value.st_nlink,
    )
    if (len(raw) > 1024 * 1024 or identity(before) != identity(opened)
            or identity(opened) != identity(after) or identity(after) != identity(named)):
        raise OSError
    contract = plistlib.loads(raw)
    args = contract.get("ProgramArguments")
    env = contract.get("EnvironmentVariables", {})
    expected_env_keys = {
        "HOME", "PATH", "DATA_DIR", "OMNIROUTE_SERVER_HOST", "PORT", "DASHBOARD_PORT", "API_PORT",
        "OMNIROUTE_ROTATE_ON_400",
    }
    expected_path = f"{home}/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
    expected_log = f"{home}/Library/Logs/nostradamus-omniroute.log"
    if contract.get("Label") != "com.nostradamus.omniroute" \
            or args != [binary, "serve", "--port", "20128", "--no-open", "--no-tray", "--log"]:
        raise OSError
    if (not isinstance(env, dict) or set(env) != expected_env_keys
            or env.get("HOME") != home or env.get("PATH") != expected_path
            or env.get("DATA_DIR") != f"{home}/.omniroute"
            or env.get("OMNIROUTE_SERVER_HOST") != "127.0.0.1"
            or env.get("PORT") != "20128" or env.get("DASHBOARD_PORT") != "20128"
            or env.get("API_PORT") != "20128" or env.get("OMNIROUTE_ROTATE_ON_400") != "true"
            or contract.get("RunAtLoad") is not True
            or contract.get("KeepAlive") is not True or contract.get("ThrottleInterval") != 10
            or contract.get("Umask") != 63
            or contract.get("StandardOutPath") != expected_log
            or contract.get("StandardErrorPath") != expected_log):
        raise OSError
except (OSError, ValueError, plistlib.InvalidFileException):
    raise SystemExit(1)
finally:
    if descriptor is not None:
        os.close(descriptor)
PYOMNIPLIST
}
