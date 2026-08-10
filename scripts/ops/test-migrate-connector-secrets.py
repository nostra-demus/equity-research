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

print(f"\n{'PASS' if not failures else 'FAIL'}: connector secret migration — {failures} failures")
raise SystemExit(1 if failures else 0)
