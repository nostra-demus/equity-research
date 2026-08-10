#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import os
import plistlib
import py_compile
import shutil
import stat
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SPEC = importlib.util.spec_from_file_location(
    "migrate_connector_secrets", os.path.join(HERE, "migrate-connector-secrets.py"),
)
MOD = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MOD)

failures = 0


def check(name: str, condition: bool) -> None:
    global failures
    print(f"  {'ok ' if condition else 'FAIL'} {name}")
    if not condition:
        failures += 1


def write_plist(path: str, environment: dict[str, str]) -> None:
    with open(path, "wb") as handle:
        plistlib.dump({"EnvironmentVariables": environment}, handle)
    os.chmod(path, 0o600)


with tempfile.TemporaryDirectory() as root:
    helper = os.path.join(root, "migrate-connector-secrets.py")
    shutil.copy2(os.path.join(HERE, "migrate-connector-secrets.py"), helper)
    sentinel = os.path.join(root, "poison.executed")
    poison = os.path.join(root, "json.py")
    with open(poison, "w", encoding="utf-8") as handle:
        handle.write(f"open({sentinel!r}, 'w').write('executed')\nraise RuntimeError('poison json')\n")
    os.makedirs(os.path.join(root, "__pycache__"))
    py_compile.compile(poison, cfile=importlib.util.cache_from_source(poison), doraise=True)
    process = subprocess.run([sys.executable, helper, "--help"], capture_output=True, text=True, timeout=30)
    check("credential helper re-execs isolated with a fresh cache before secret-bearing imports",
          process.returncode == 0 and not os.path.exists(sentinel))


with tempfile.TemporaryDirectory() as root:
    config = os.path.join(root, "config")
    os.mkdir(config, 0o700)
    plist = os.path.join(root, "connector.plist")
    providers = os.path.join(config, "providers.env")
    write_plist(plist, {
        "PATH": "/usr/bin", "CONNECTOR_ALPHA_TOKEN": "alpha-123", "CONNECTOR_legacy": "legacy-456",
    })
    keys = MOD.migrate(plist, providers)
    text = open(providers, encoding="utf-8").read()
    check("missing provider file receives every exact historical connector key",
          keys == ["CONNECTOR_ALPHA_TOKEN", "CONNECTOR_legacy"]
          and "CONNECTOR_ALPHA_TOKEN=alpha-123" in text and "CONNECTOR_legacy=legacy-456" in text)
    mode = stat.S_IMODE(os.lstat(providers).st_mode)
    check("created providers.env is owner-only", mode == 0o600)
    check("same values are idempotent", MOD.migrate(plist, providers) == keys)

    with open(providers, "w", encoding="utf-8") as handle:
        handle.write("CONNECTOR_ALPHA_TOKEN=different\nCONNECTOR_legacy=legacy-456\n")
    os.chmod(providers, 0o600)
    try:
        MOD.migrate(plist, providers); conflict = False
    except MOD.MigrationError:
        conflict = True
    check("same-name different-value conflict refuses deletion authority", conflict)

    with open(providers, "w", encoding="utf-8") as handle:
        handle.write("CONNECTOR_ALPHA_TOKEN=alpha-123\nCONNECTOR_ALPHA_TOKEN=alpha-123\n")
    os.chmod(providers, 0o600)
    try:
        MOD.migrate(plist, providers); duplicate = False
    except MOD.MigrationError:
        duplicate = True
    check("duplicate provider definitions fail closed", duplicate)

    with open(providers, "w", encoding="utf-8") as handle:
        handle.write("CONNECTOR_ALPHA_TOKEN=alpha-123\nCONNECTOR_legacy=legacy-456\n")
    os.chmod(providers, 0o644)
    try:
        MOD.migrate(plist, providers); loose_mode = False
    except MOD.MigrationError:
        loose_mode = True
    check("group/world-readable providers.env is refused", loose_mode)

with tempfile.TemporaryDirectory() as root:
    real_config = os.path.join(root, "real-config")
    os.mkdir(real_config, 0o700)
    linked_config = os.path.join(root, "linked-config")
    os.symlink(real_config, linked_config)
    plist = os.path.join(root, "connector.plist")
    write_plist(plist, {"CONNECTOR_TEST_TOKEN": "secret"})
    try:
        MOD.migrate(plist, os.path.join(linked_config, "providers.env")); linked = False
    except MOD.MigrationError:
        linked = True
    check("symlinked config directory is refused", linked)

# A same-size in-place rewrite DURING the secure read must fail closed. Comparing only
# (dev, ino, size) accepted it, so the helper could hand back stale or mixed credential bytes as
# "successfully preserved" — after which callers install a keyless plist and may delete the new
# credential's only copy (Codex review on PR #407). Hooking os.read gives a deterministic interleave
# point inside the read window rather than a flaky thread race.
with tempfile.TemporaryDirectory() as root:
    target = os.path.join(root, "connectors.plist")
    original = b"CONNECTOR_TEST_TOKEN=old-secret-value-aaaaaaaaaaaa\n"
    replacement = b"CONNECTOR_TEST_TOKEN=NEW-secret-value-bbbbbbbbbbbb\n"
    assert len(original) == len(replacement)  # same size: only mtime/ctime can reveal the swap
    with open(target, "wb") as handle:
        handle.write(original)
    os.chmod(target, 0o600)
    baseline = os.stat(target)
    real_read = os.read
    mutated = {"done": False}

    def _mutating_read(fd: int, size: int) -> bytes:
        if not mutated["done"]:
            mutated["done"] = True
            with open(target, "r+b", buffering=0) as handle:
                handle.seek(0)
                handle.write(replacement)
            os.utime(target, ns=(baseline.st_atime_ns, baseline.st_mtime_ns + 1_000_000_000))
        return real_read(fd, size)

    os.read = _mutating_read
    try:
        MOD._owner_only_regular(target)
        raced = False
    except MOD.MigrationError as error:
        raced = "changed during" in str(error)
    finally:
        os.read = real_read
    check("same-size in-place rewrite during the secure read is refused", raced)

# A hardlinked plist can be mutated through its other path, so it must never be treated as a
# stable credential source (same integrity boundary as the symlink refusal above).
with tempfile.TemporaryDirectory() as root:
    target = os.path.join(root, "connectors.plist")
    write_plist(target, {"CONNECTOR_TEST_TOKEN": "secret"})
    os.chmod(target, 0o600)
    clean = True
    try:
        MOD._owner_only_regular(target)
    except MOD.MigrationError:
        clean = False
    check("a unique owner-only plist is still readable", clean)

    os.link(target, os.path.join(root, "alias.plist"))  # nlink == 2
    try:
        MOD._owner_only_regular(target)
        hardlinked = False
    except MOD.MigrationError:
        hardlinked = True
    check("hardlinked plist is refused", hardlinked)

print(f"\n{'PASS' if not failures else 'FAIL'}: connector secret migration — {failures} failures")
raise SystemExit(1 if failures else 0)
