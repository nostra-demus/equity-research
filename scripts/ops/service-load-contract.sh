#!/usr/bin/env bash
# Shared, source-only result contract for install-services.sh. The caller
# provides loaded <label>; this helper makes a failed bootstrap a failed install
# instead of a warning followed by exit zero.
nostra_validate_connector_plist() {
  local plist_path="$1" repo_root="$2" config_dir="$3" test_sync_dir="${4:-}"
  local python_bin="${PYTHON_BIN:-python3}"
  "$python_bin" -I - "$plist_path" "$repo_root" "$config_dir" "$test_sync_dir" <<'PY'
from __future__ import annotations

import os
import plistlib
import stat
import sys
import time


class ContractError(RuntimeError):
    pass


def identity(info: os.stat_result) -> tuple[int, int, int, int, int]:
    return (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns, info.st_ctime_ns)


def require_safe_metadata(info: os.stat_result) -> None:
    if (
        not stat.S_ISREG(info.st_mode)
        or stat.S_ISLNK(info.st_mode)
        or info.st_uid != os.getuid()
        or info.st_mode & 0o077
        or info.st_size > 1024 * 1024
    ):
        raise ContractError("connector plist must be an owner-only regular file no larger than 1 MiB")


def synchronize_same_size_mutation(test_sync_dir: str) -> None:
    """Deterministic test seam; the production installer never passes this fourth argument."""
    if not test_sync_dir:
        return
    ready = os.path.join(test_sync_dir, "validator-opened")
    proceed = os.path.join(test_sync_dir, "mutation-complete")
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)
    try:
        descriptor = os.open(ready, flags, 0o600)
        try:
            os.write(descriptor, b"ready\n")
        finally:
            os.close(descriptor)
    except OSError as error:
        raise ContractError("cannot establish validator test synchronization") from error
    deadline = time.monotonic() + 5.0
    while not os.path.exists(proceed):
        if time.monotonic() >= deadline:
            raise ContractError("validator test synchronization timed out")
        time.sleep(0.005)


def secure_read(path: str, test_sync_dir: str) -> bytes:
    try:
        before = os.lstat(path)
    except OSError as error:
        raise ContractError("cannot inspect the connector plist") from error
    require_safe_metadata(before)
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    try:
        descriptor = os.open(path, flags)
    except OSError as error:
        raise ContractError("cannot open the connector plist safely") from error
    try:
        opened = os.fstat(descriptor)
        require_safe_metadata(opened)
        if identity(opened) != identity(before):
            raise ContractError("connector plist changed during secure open")
        synchronize_same_size_mutation(test_sync_dir)
        remaining = opened.st_size
        chunks: list[bytes] = []
        while remaining:
            chunk = os.read(descriptor, min(remaining, 64 * 1024))
            if not chunk:
                raise ContractError("short read from connector plist")
            chunks.append(chunk)
            remaining -= len(chunk)
        finished = os.fstat(descriptor)
        require_safe_metadata(finished)
        if identity(finished) != identity(before):
            raise ContractError("connector plist changed during secure read")
    finally:
        os.close(descriptor)
    try:
        after = os.lstat(path)
    except OSError as error:
        raise ContractError("cannot re-check the connector plist") from error
    require_safe_metadata(after)
    if identity(after) != identity(before):
        raise ContractError("connector plist changed during validation")
    return b"".join(chunks)


def require_exact_integer(value: object, expected: int, name: str) -> None:
    if type(value) is not int or value != expected:
        raise ContractError(f"{name} must be the integer {expected}")


try:
    plist_path, repo_root, config_dir, test_sync_dir = sys.argv[1:]
    payload = secure_read(plist_path, test_sync_dir)
    try:
        contract = plistlib.loads(payload)
    except Exception as error:
        raise ContractError("connector plist is malformed") from error
    if not isinstance(contract, dict):
        raise ContractError("connector plist root must be a dictionary")
    expected_arguments = [
        "/usr/bin/env",
        "python3",
        "-I",
        f"{repo_root}/.claude/tools/run_connectors.py",
        "--data-root",
        f"{repo_root}/data",
    ]
    if contract.get("Label") != "com.nostradamus.connectors":
        raise ContractError("connector Label is not the production label")
    if contract.get("WorkingDirectory") != repo_root:
        raise ContractError("connector WorkingDirectory does not match the production worktree")
    if contract.get("ProgramArguments") != expected_arguments:
        raise ContractError("connector ProgramArguments do not match the isolated production runner contract")
    if contract.get("MaterializeDatalessFiles") is not True:
        raise ContractError("connector must materialize dataless files")
    if contract.get("RunAtLoad") is not True:
        raise ContractError("connector must run at load")
    require_exact_integer(contract.get("StartInterval"), 900, "StartInterval")
    require_exact_integer(contract.get("ThrottleInterval"), 60, "ThrottleInterval")
    environment = contract.get("EnvironmentVariables")
    if not isinstance(environment, dict):
        raise ContractError("connector EnvironmentVariables must be a dictionary")
    if environment.get("NOSTRA_CONNECTOR_CREDENTIAL_SOURCE") != "providers_env":
        raise ContractError("connector credential source must be providers_env")
    if environment.get("NOSTRA_ENGINE_CONFIG_DIR") != config_dir:
        raise ContractError("connector config directory does not match the installer")
    if not isinstance(environment.get("HOME"), str) or not environment["HOME"].startswith("/"):
        raise ContractError("connector HOME must be an absolute path")
    if not isinstance(environment.get("PATH"), str) or not environment["PATH"]:
        raise ContractError("connector PATH must be non-empty")
    if any(isinstance(key, str) and key.startswith("CONNECTOR_") for key in environment):
        raise ContractError("connector credentials must not be embedded in the LaunchAgent")
    expected_log = os.path.join(environment["HOME"], "Library", "Logs", "nostradamus-connectors.log")
    if contract.get("StandardOutPath") != expected_log or contract.get("StandardErrorPath") != expected_log:
        raise ContractError("connector log paths do not match the rendered HOME")
except (ContractError, ValueError) as error:
    print(f"connector plist contract validation failed: {error}", file=sys.stderr)
    raise SystemExit(1)
PY
}

# Atomically activate a pre-rendered connector LaunchAgent. The caller owns the staged file until this
# function is called; this function then either installs it successfully or removes/restores every file it
# touched. Crucially, the installed bytes are verified before the currently loaded job is booted out.
nostra_activate_connector_plist() {
  local label="$1" staged="$2" dst="$3" repo_root="$4" config_dir="$5" agents_dir="$6" domain="$7"
  local backup="" had_prior=0 was_loaded=0 restore_ok=1 bootstrap_ok=0 i _wait

  loaded "$label" && was_loaded=1
  if [ -e "$dst" ] || [ -L "$dst" ]; then
    had_prior=1
    backup="$(mktemp "$agents_dir/.${label}.backup.XXXXXX")" || { rm -f "$staged"; return 1; }
    if ! cp "$dst" "$backup" || ! chmod 600 "$backup" || ! plutil -lint "$backup" >/dev/null; then
      echo "  FAIL: could not create a usable connector plist rollback copy — running service left untouched" >&2
      rm -f "$staged" "$backup"
      return 1
    fi
  elif [ "$was_loaded" = 1 ]; then
    echo "  FAIL: connector is loaded without an installed plist; refusing a change that cannot be rolled back" >&2
    rm -f "$staged"
    return 1
  fi

  # staged lives in agents_dir, so this is a same-filesystem atomic replacement rather than a partial copy.
  if ! mv -f "$staged" "$dst"; then
    echo "  FAIL: could not atomically install connector plist — running service left untouched" >&2
    rm -f "$staged" "$backup"
    return 1
  fi
  if ! chmod 600 "$dst" \
    || ! plutil -lint "$dst" >/dev/null \
    || ! nostra_validate_connector_plist "$dst" "$repo_root" "$config_dir"; then
    echo "  FAIL: installed connector plist failed verification before bootout; restoring prior file" >&2
    if [ "$had_prior" = 1 ]; then
      if mv -f "$backup" "$dst"; then
        backup=""
        chmod 600 "$dst" 2>/dev/null || true
      else
        echo "  FAIL: automatic file rollback failed; preserved rollback copy at $backup" >&2
        return 1
      fi
    elif ! rm -f "$dst"; then
      echo "  FAIL: could not remove the rejected connector plist" >&2
    fi
    return 1
  fi

  launchctl bootout "$domain/$label" 2>/dev/null || true
  for i in $(seq 1 40); do loaded "$label" || break; sleep 0.25; done
  if loaded "$label"; then
    # Do not confuse a prior job that ignored/asynchronously outlived bootout with a successfully loaded new
    # contract. The new plist has not been bootstrapped, so put the matching prior file back immediately.
    echo "  FAIL: prior connector did not unload; restoring its plist without activating the replacement" >&2
    if [ "$had_prior" != 1 ] || ! mv -f "$backup" "$dst"; then
      echo "  FAIL: could not restore prior connector plist; rollback copy remains at $backup" >&2
      return 1
    fi
    backup=""
    chmod 600 "$dst" 2>/dev/null || restore_ok=0
    # bootout may finish between the last check and the atomic restore. If so, reload the now-restored prior
    # contract instead of leaving a service that was loaded when the installer began down.
    if [ "$restore_ok" = 1 ] && ! loaded "$label" && [ "$was_loaded" = 1 ]; then
      for i in 1 2 3 4 5 6; do
        if launchctl bootstrap "$domain" "$dst" 2>/dev/null; then bootstrap_ok=1; break; fi
        sleep 0.5
      done
      launchctl kickstart -k "$domain/$label" 2>/dev/null || true
      if [ "$bootstrap_ok" != 1 ] || ! loaded "$label"; then restore_ok=0; fi
    fi
    [ "$restore_ok" = 1 ] && echo "  prior connector install restored" >&2
    return 1
  fi
  for i in 1 2 3 4 5 6; do
    if launchctl bootstrap "$domain" "$dst" 2>/dev/null; then bootstrap_ok=1; break; fi
    sleep 0.5
  done
  if [ "$bootstrap_ok" = 1 ]; then
    launchctl kickstart -k "$domain/$label" 2>/dev/null || true
    if nostra_report_loaded "$label"; then
      if [ -n "$backup" ] && ! rm -f "$backup"; then
        echo "  FAIL: connector loaded but its owner-only rollback copy could not be removed: $backup" >&2
        return 1
      fi
      return 0
    fi
  else
    echo "  FAIL: launchd rejected the connector replacement" >&2
  fi

  echo "  FAIL: connector activation failed; restoring the prior install" >&2
  # A failed bootstrap can still leave a partially registered job. Remove it completely before restoring
  # the old file and (only if it was previously loaded) its old launchd state.
  for i in 1 2 3; do
    launchctl bootout "$domain/$label" 2>/dev/null || true
    for _wait in $(seq 1 40); do loaded "$label" || break; sleep 0.25; done
    loaded "$label" || break
  done
  if loaded "$label"; then
    if [ "$had_prior" = 1 ]; then
      echo "  FAIL: could not unload the rejected connector; rollback copy remains at $backup" >&2
    else
      echo "  FAIL: could not unload the rejected connector; file rollback was not attempted" >&2
    fi
    return 1
  fi
  if [ "$had_prior" = 1 ]; then
    if mv -f "$backup" "$dst"; then
      backup=""
      chmod 600 "$dst" 2>/dev/null || restore_ok=0
    else
      restore_ok=0
      echo "  FAIL: could not restore prior connector plist; rollback copy remains at $backup" >&2
    fi
  elif ! rm -f "$dst"; then
    restore_ok=0
    echo "  FAIL: could not remove failed connector plist" >&2
  fi
  if [ "$restore_ok" = 1 ] && [ "$was_loaded" = 1 ]; then
    for i in 1 2 3 4 5 6; do
      launchctl bootstrap "$domain" "$dst" 2>/dev/null && break
      sleep 0.5
    done
    launchctl kickstart -k "$domain/$label" 2>/dev/null || true
    if ! loaded "$label"; then
      restore_ok=0
      echo "  FAIL: prior connector plist was restored but its service did not reload" >&2
    fi
  fi
  [ "$restore_ok" = 1 ] && echo "  prior connector install restored" >&2
  return 1
}

nostra_report_loaded() {
  local label="$1"
  if loaded "$label"; then
    echo "  ok (reloaded): $label"
    return 0
  fi
  echo "  FAIL: $label did NOT load — re-run this installer" >&2
  return 1
}
