#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import os
import plistlib
import py_compile
import shutil
import subprocess
import sys
import tempfile


HERE = os.path.dirname(os.path.abspath(__file__))
SPEC = importlib.util.spec_from_file_location(
    "migrate_connector_launchagent", os.path.join(HERE, "migrate-connector-launchagent.py"),
)
MOD = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MOD)
failures = 0


def check(name: str, condition: bool) -> None:
    global failures
    print(f"  {'ok ' if condition else 'FAIL'} {name}")
    if not condition:
        failures += 1


def write_plist(path: str, repo: str, arguments: list[str]) -> None:
    with open(path, "wb") as handle:
        plistlib.dump({
            "Label": "com.nostradamus.connectors",
            "WorkingDirectory": repo,
            "ProgramArguments": arguments,
            "EnvironmentVariables": {
                "HOME": "/fixture/home", "PATH": "/usr/bin",
                "CONNECTOR_TEST_TOKEN": "secret-not-printed",
            },
            "StartInterval": 21600,
        }, handle, sort_keys=False)
    os.chmod(path, 0o600)


with tempfile.TemporaryDirectory() as root:
    helper = os.path.join(root, "migrate-connector-launchagent.py")
    shutil.copy2(os.path.join(HERE, "migrate-connector-launchagent.py"), helper)
    sentinel = os.path.join(root, "poison.executed")
    poison = os.path.join(root, "json.py")
    with open(poison, "w", encoding="utf-8") as handle:
        handle.write(f"open({sentinel!r}, 'w').write('executed')\nraise RuntimeError('poison json')\n")
    os.makedirs(os.path.join(root, "__pycache__"))
    py_compile.compile(poison, cfile=importlib.util.cache_from_source(poison), doraise=True)
    process = subprocess.run([sys.executable, helper, "--help"], capture_output=True, text=True, timeout=30)
    check("LaunchAgent helper re-execs isolated with a fresh cache before plist imports",
          process.returncode == 0 and not os.path.exists(sentinel))


with tempfile.TemporaryDirectory() as root:
    repo = os.path.join(root, "repo")
    os.mkdir(repo)
    runner = os.path.join(repo, ".claude", "tools", "run_connectors.py")
    data = os.path.join(repo, "data")
    old_args = ["/usr/bin/env", "python3", runner, "--data-root", data]
    plist = os.path.join(root, "connector.plist")
    config_dir = os.path.join(root, "connector-config")
    write_plist(plist, repo, old_args)
    changed = MOD.migrate(plist, repo, config_dir)
    migrated = plistlib.load(open(plist, "rb"))
    check("known historical command shape gains isolated Python at the exact position",
          changed and migrated["ProgramArguments"] == [
              "/usr/bin/env", "python3", "-I", runner, "--data-root", data,
          ])
    check("interval and credential source migrate while plist-only connector keys are removed",
          migrated["StartInterval"] == 900
          and migrated["EnvironmentVariables"]["NOSTRA_CONNECTOR_CREDENTIAL_SOURCE"] == "providers_env"
          and migrated["EnvironmentVariables"]["NOSTRA_ENGINE_CONFIG_DIR"] == config_dir
          and "CONNECTOR_TEST_TOKEN" not in migrated["EnvironmentVariables"])
    check("migrated LaunchAgent contract is idempotent", MOD.migrate(plist, repo, config_dir) is False)

    before = open(plist, "rb").read()
    malformed = plistlib.loads(before)
    malformed["ProgramArguments"].insert(2, "-c")
    with open(plist, "wb") as handle:
        plistlib.dump(malformed, handle, sort_keys=False)
    os.chmod(plist, 0o600)
    unknown_before = open(plist, "rb").read()
    try:
        MOD.migrate(plist, repo, config_dir); unknown_rejected = False
    except MOD.LaunchAgentMigrationError:
        unknown_rejected = True
    check("unknown command shapes fail closed without rewriting the installed contract",
          unknown_rejected and open(plist, "rb").read() == unknown_before)

with tempfile.TemporaryDirectory() as root:
    repo = os.path.join(root, "repo")
    os.mkdir(repo)
    real = os.path.join(root, "real.plist")
    linked = os.path.join(root, "linked.plist")
    runner = os.path.join(repo, ".claude", "tools", "run_connectors.py")
    write_plist(real, repo, ["/usr/bin/env", "python3", runner, "--data-root", os.path.join(repo, "data")])
    os.symlink(real, linked)
    try:
        MOD.migrate(linked, repo, os.path.join(root, "config")); symlink_rejected = False
    except MOD.LaunchAgentMigrationError:
        symlink_rejected = True
    check("symlinked staged LaunchAgent is refused", symlink_rejected)

print(f"\n{'PASS' if not failures else 'FAIL'}: connector LaunchAgent migration — {failures} failures")
raise SystemExit(1 if failures else 0)
