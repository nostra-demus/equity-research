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
    poison = os.path.join(root, "plistlib.py")
    with open(poison, "w", encoding="utf-8") as handle:
        handle.write(f"open({sentinel!r}, 'w').write('executed')\nraise RuntimeError('poison json')\n")
    os.makedirs(os.path.join(root, "__pycache__"))
    py_compile.compile(poison, cfile=importlib.util.cache_from_source(poison), doraise=True)
    process = subprocess.run([sys.executable, helper, "--help"], capture_output=True, text=True, timeout=30)
    check("credential helper re-execs isolated with a fresh cache before secret-bearing imports",
          process.returncode == 0 and not os.path.exists(sentinel))
    legacy = subprocess.run(
        [sys.executable, helper, "--plist", "ignored", "--providers-env", "ignored"],
        capture_output=True,
        text=True,
        timeout=30,
    )
    check("legacy non-transaction CLI cannot grant deletion authority", legacy.returncode != 0)


with tempfile.TemporaryDirectory() as root:
    agents = os.path.join(root, "LaunchAgents")
    config = os.path.join(root, "config")
    os.mkdir(agents, 0o700)
    os.mkdir(config, 0o700)
    helper = os.path.join(HERE, "migrate-connector-secrets.py")
    plist = os.path.join(agents, "com.nostradamus.connectors.plist")
    providers = os.path.join(config, "providers.env")
    write_plist(plist, {"CONNECTOR_TEST_TOKEN": "lease-secret"})
    first_owner = subprocess.Popen(
        [sys.executable, "-c", "import time; time.sleep(30)"],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    second_owner = subprocess.Popen(
        [sys.executable, "-c", "import time; time.sleep(30)"],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        first_claim = subprocess.run(
            [
                sys.executable, helper, "claim", "--plist", plist,
                "--providers-env", providers, "--owner-pid", str(first_owner.pid),
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )
        claim_path = first_claim.stdout.strip()
        competing_claim = subprocess.run(
            [
                sys.executable, helper, "claim", "--plist", plist,
                "--providers-env", providers, "--owner-pid", str(second_owner.pid),
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )
        check(
            "a second live lifecycle owner cannot adopt an active credential transaction",
            first_claim.returncode == 0 and os.path.isfile(claim_path)
            and competing_claim.returncode != 0 and "active process" in competing_claim.stderr,
        )
        staged = os.path.join(agents, ".replacement-staged")
        write_plist(staged, {"PATH": "/usr/bin"})
        competing_publish = subprocess.run(
            [
                sys.executable, helper, "publish", "--claim", claim_path,
                "--plist", plist, "--staged", staged,
                "--owner-pid", str(second_owner.pid),
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )
        check(
            "a non-owner cannot mutate another live owner's credential transaction",
            competing_publish.returncode != 0 and "not authorized" in competing_publish.stderr
            and os.path.isfile(staged),
        )
        first_owner.terminate()
        first_owner.wait(timeout=10)
        adopted_claim = subprocess.run(
            [
                sys.executable, helper, "claim", "--plist", plist,
                "--providers-env", providers, "--owner-pid", str(second_owner.pid),
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )
        restored = subprocess.run(
            [
                sys.executable, helper, "restore", "--claim", claim_path,
                "--plist", plist, "--providers-env", providers,
                "--owner-pid", str(second_owner.pid),
            ],
            capture_output=True,
            text=True,
            timeout=30,
        )
        with open(plist, "rb") as handle:
            restored_environment = plistlib.load(handle)["EnvironmentVariables"]
        check(
            "a demonstrably dead lifecycle owner can be adopted and completed",
            adopted_claim.returncode == 0 and adopted_claim.stdout.strip() == claim_path
            and restored.returncode == 0
            and restored_environment.get("CONNECTOR_TEST_TOKEN") == "lease-secret"
            and not os.path.lexists(claim_path),
        )
    finally:
        for owner in (first_owner, second_owner):
            if owner.poll() is None:
                owner.terminate()
            try:
                owner.wait(timeout=10)
            except subprocess.TimeoutExpired:
                owner.kill()
                owner.wait(timeout=10)


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

with tempfile.TemporaryDirectory() as root:
    config = os.path.join(root, "config")
    os.mkdir(config, 0o700)
    plist = os.path.join(root, "connector.plist")
    providers = os.path.join(config, "providers.env")
    write_plist(plist, {"CONNECTOR_TEST_TOKEN": "secret-a"})
    with open(plist, "rb") as handle:
        original = handle.read()
    mutated = original.replace(b"secret-a", b"secret-b", 1)
    check("same-size plist race fixture preserves byte length",
          mutated != original and len(mutated) == len(original))

    real_read = MOD.os.read
    mutation_performed = False

    def racing_read(descriptor: int, size: int) -> bytes:
        global mutation_performed
        chunk = real_read(descriptor, size)
        if not mutation_performed:
            mutation_performed = True
            before = os.lstat(plist)
            with open(plist, "r+b", buffering=0) as handle:
                handle.seek(0)
                handle.write(mutated)
                handle.truncate()
                os.fsync(handle.fileno())
            os.utime(plist, ns=(before.st_atime_ns, before.st_mtime_ns + 1_000_000_000))
        return chunk

    MOD.os.read = racing_read
    try:
        try:
            MOD.migrate(plist, providers)
            race_error = ""
        except MOD.MigrationError as error:
            race_error = str(error)
    finally:
        MOD.os.read = real_read
    check("same-size in-place plist mutation refuses deletion authority",
          "changed during read" in race_error
          and mutation_performed and os.lstat(plist).st_size == len(original)
          and not os.path.exists(providers))

with tempfile.TemporaryDirectory() as root:
    config = os.path.join(root, "config")
    os.mkdir(config, 0o700)
    plist = os.path.join(root, "connector.plist")
    linked_plist = os.path.join(root, "connector-hardlink.plist")
    write_plist(plist, {"CONNECTOR_TEST_TOKEN": "secret"})
    os.link(plist, linked_plist)
    try:
        MOD.migrate(plist, os.path.join(config, "providers.env"))
        hardlinked = False
    except MOD.MigrationError:
        hardlinked = True
    check("hard-linked installed plist is refused", hardlinked)

with tempfile.TemporaryDirectory() as root:
    agents = os.path.join(root, "LaunchAgents")
    config = os.path.join(root, "config")
    os.mkdir(agents, 0o700)
    os.mkdir(config, 0o700)
    plist = os.path.join(agents, "com.nostradamus.connectors.plist")
    providers = os.path.join(config, "providers.env")
    write_plist(plist, {"CONNECTOR_TEST_TOKEN": "old-secret"})
    claim, keys = MOD.claim_and_migrate(plist, providers)
    staged = os.path.join(agents, ".replacement-staged")
    write_plist(staged, {"PATH": "/usr/bin"})
    anchor = MOD.publish_claimed_replacement(claim, plist, staged)
    MOD.commit_claim(claim, plist, providers, "replacement", anchor)
    check("claim/commit retains only the exact published replacement",
          keys == ["CONNECTOR_TEST_TOKEN"] and os.path.isfile(plist)
          and not os.path.lexists(claim) and not os.path.lexists(anchor)
          and "CONNECTOR_TEST_TOKEN=old-secret" in open(providers, encoding="utf-8").read())

with tempfile.TemporaryDirectory() as root:
    agents = os.path.join(root, "LaunchAgents")
    config = os.path.join(root, "config")
    os.mkdir(agents, 0o700)
    os.mkdir(config, 0o700)
    plist = os.path.join(agents, "com.nostradamus.connectors.plist")
    providers = os.path.join(config, "providers.env")
    write_plist(plist, {"CONNECTOR_TEST_TOKEN": "removal-secret"})
    claim, _keys = MOD.claim_and_migrate(plist, providers)
    MOD.commit_claim(claim, plist, providers, "absent")
    check("removal commit releases only the private claim after durable verification",
          not os.path.lexists(plist) and not os.path.lexists(claim)
          and "CONNECTOR_TEST_TOKEN=removal-secret" in open(providers, encoding="utf-8").read())

with tempfile.TemporaryDirectory() as root:
    agents = os.path.join(root, "LaunchAgents")
    config = os.path.join(root, "config")
    os.mkdir(agents, 0o700)
    os.mkdir(config, 0o700)
    plist = os.path.join(agents, "com.nostradamus.connectors.plist")
    providers = os.path.join(config, "providers.env")
    write_plist(plist, {"CONNECTOR_TEST_TOKEN": "rollback-secret"})
    claim, _keys = MOD.claim_and_migrate(plist, providers)
    os.unlink(providers)
    MOD.restore_claim(claim, plist, providers)
    with open(plist, "rb") as handle:
        restored_environment = plistlib.load(handle)["EnvironmentVariables"]
    check("rollback restores the exact credential-bearing plist even if providers.env disappears",
          restored_environment.get("CONNECTOR_TEST_TOKEN") == "rollback-secret"
          and not os.path.lexists(claim) and not os.path.lexists(providers))

with tempfile.TemporaryDirectory() as root:
    agents = os.path.join(root, "LaunchAgents")
    config = os.path.join(root, "config")
    os.mkdir(agents, 0o700)
    os.mkdir(config, 0o700)
    plist = os.path.join(agents, "com.nostradamus.connectors.plist")
    providers = os.path.join(config, "providers.env")
    claim, _keys = MOD.claim_and_migrate(plist, providers)
    check("initial absence is represented by an owned no-clobber guard",
          os.path.basename(claim) == MOD.ABSENT_CLAIM_NAME
          and os.path.isfile(plist) and MOD._same_inode(plist, MOD._guard_path(os.path.dirname(claim))))
    staged = os.path.join(agents, ".replacement-staged")
    write_plist(staged, {"PATH": "/usr/bin"})
    anchor = MOD.publish_claimed_replacement(claim, plist, staged)
    MOD.restore_claim(claim, plist, providers, anchor)
    check("rollback of an initially absent activation removes only its owned replacement",
          not os.path.lexists(plist) and not os.path.lexists(claim))

with tempfile.TemporaryDirectory() as root:
    agents = os.path.join(root, "LaunchAgents")
    config = os.path.join(root, "config")
    os.mkdir(agents, 0o700)
    os.mkdir(config, 0o700)
    plist = os.path.join(agents, "com.nostradamus.connectors.plist")
    providers = os.path.join(config, "providers.env")
    write_plist(plist, {"CONNECTOR_TEST_TOKEN": "old-secret"})
    claim, _keys = MOD.claim_and_migrate(plist, providers)
    staged = os.path.join(agents, ".replacement-staged")
    write_plist(staged, {"PATH": "/usr/bin"})
    anchor = MOD.publish_claimed_replacement(claim, plist, staged)
    surprise = os.path.join(agents, ".surprise")
    write_plist(surprise, {"CONNECTOR_NEW_TOKEN": "new-secret"})
    real_rename = MOD.os.rename
    swap_performed = False

    def swap_before_capture(source: str, destination: str) -> None:
        global swap_performed
        if source == plist and not swap_performed:
            swap_performed = True
            os.replace(surprise, plist)
        real_rename(source, destination)

    MOD.os.rename = swap_before_capture
    try:
        try:
            MOD.commit_claim(claim, plist, providers, "replacement", anchor)
            replacement_swap_refused = False
        except MOD.MigrationError:
            replacement_swap_refused = True
    finally:
        MOD.os.rename = real_rename
    check("replacement commit atomically captures a check/use swap before releasing prior claim",
          swap_performed and replacement_swap_refused and os.path.lexists(claim)
          and os.path.lexists(plist))

with tempfile.TemporaryDirectory() as root:
    agents = os.path.join(root, "LaunchAgents")
    config = os.path.join(root, "config")
    os.mkdir(agents, 0o700)
    os.mkdir(config, 0o700)
    plist = os.path.join(agents, "com.nostradamus.connectors.plist")
    providers = os.path.join(config, "providers.env")
    write_plist(plist, {"CONNECTOR_TEST_TOKEN": "removal-prior"})
    claim, _keys = MOD.claim_and_migrate(plist, providers)
    surprise = os.path.join(agents, ".removal-surprise")
    write_plist(surprise, {"CONNECTOR_NEW_TOKEN": "must-survive"})
    real_rename = MOD.os.rename
    removal_swap_performed = False

    def swap_before_absent_capture(source: str, destination: str) -> None:
        global removal_swap_performed
        if source == plist and not removal_swap_performed:
            removal_swap_performed = True
            os.replace(surprise, plist)
        real_rename(source, destination)

    MOD.os.rename = swap_before_absent_capture
    try:
        try:
            MOD.commit_claim(claim, plist, providers, "absent")
            absent_swap_refused = False
        except MOD.MigrationError:
            absent_swap_refused = True
    finally:
        MOD.os.rename = real_rename
    check("removal commit captures rather than deletes an unowned check/use swap",
          removal_swap_performed and absent_swap_refused and os.path.lexists(claim)
          and os.path.lexists(plist))

with tempfile.TemporaryDirectory() as root:
    agents = os.path.join(root, "LaunchAgents")
    config = os.path.join(root, "config")
    os.mkdir(agents, 0o700)
    os.mkdir(config, 0o700)
    plist = os.path.join(agents, "com.nostradamus.connectors.plist")
    providers = os.path.join(config, "providers.env")
    write_plist(plist, {"CONNECTOR_TEST_TOKEN": "receipt-secret"})
    claim, _keys = MOD.claim_and_migrate(plist, providers)
    staged = os.path.join(agents, ".replacement-staged")
    write_plist(staged, {"PATH": "/usr/bin"})
    anchor = MOD.publish_claimed_replacement(claim, plist, staged)
    real_purge = MOD._purge_committed_transaction

    def simulate_hard_death(*_args: object, **_kwargs: object) -> bool:
        raise MOD.MigrationError("simulated death after atomic commit receipt")

    MOD._purge_committed_transaction = simulate_hard_death
    try:
        MOD.commit_claim(claim, plist, providers, "replacement", anchor)
    finally:
        MOD._purge_committed_transaction = real_purge
    committed_before = [
        entry.path for entry in os.scandir(agents)
        if entry.name.startswith(f".{os.path.basename(plist)}.credential-committed-")
    ]
    next_claim, next_keys = MOD.claim_and_migrate(plist, providers)
    committed_after = [
        entry.path for entry in os.scandir(agents)
        if entry.name.startswith(f".{os.path.basename(plist)}.credential-committed-")
    ]
    check("hard-death committed receipt is reconciled before the next claim",
          len(committed_before) == 1 and not committed_after and next_keys == []
          and os.path.isfile(next_claim)
          and "CONNECTOR_TEST_TOKEN=receipt-secret" in open(providers, encoding="utf-8").read())
    MOD.restore_claim(next_claim, plist, providers)

with tempfile.TemporaryDirectory() as root:
    agents = os.path.join(root, "LaunchAgents")
    config = os.path.join(root, "config")
    os.mkdir(agents, 0o700)
    os.mkdir(config, 0o700)
    plist = os.path.join(agents, "com.nostradamus.connectors.plist")
    providers = os.path.join(config, "providers.env")
    write_plist(plist, {"CONNECTOR_TEST_TOKEN": "unknown-receipt-secret"})
    claim, _keys = MOD.claim_and_migrate(plist, providers)
    unknown = os.path.join(os.path.dirname(claim), "interrupted-replacement.plist")
    write_plist(unknown, {"CONNECTOR_NEW_TOKEN": "must-stay-private"})
    staged = os.path.join(agents, ".replacement-staged")
    write_plist(staged, {"PATH": "/usr/bin"})
    anchor = MOD.publish_claimed_replacement(claim, plist, staged)
    MOD.commit_claim(claim, plist, providers, "replacement", anchor)
    committed = [
        entry.path for entry in os.scandir(agents)
        if entry.name.startswith(f".{os.path.basename(plist)}.credential-committed-")
    ]
    next_claim, _next_keys = MOD.claim_and_migrate(plist, providers)
    retained_unknown = [
        os.path.join(directory, filename)
        for archive in committed
        for directory, _subdirs, files in os.walk(archive)
        for filename in files
        if filename == "interrupted-replacement.plist"
    ]
    with open(next_claim, "rb") as handle:
        next_environment = plistlib.load(handle)["EnvironmentVariables"]
    check("unknown commit residue is retired without wedging the next transaction",
          len(committed) == 1 and os.path.isfile(next_claim) and len(retained_unknown) == 1
          and "CONNECTOR_TEST_TOKEN" not in next_environment)
    MOD.restore_claim(next_claim, plist, providers)

with tempfile.TemporaryDirectory() as root:
    agents = os.path.join(root, "LaunchAgents")
    config = os.path.join(root, "config")
    os.mkdir(agents, 0o700)
    os.mkdir(config, 0o700)
    plist = os.path.join(agents, "com.nostradamus.connectors.plist")
    providers = os.path.join(config, "providers.env")
    write_plist(plist, {"CONNECTOR_TEST_TOKEN": "old-secret"})
    claim, _keys = MOD.claim_and_migrate(plist, providers)
    old_quarantine = os.path.join(os.path.dirname(claim), "interrupted-replacement.plist")
    write_plist(old_quarantine, {"CONNECTOR_NEW_TOKEN": "retained-secret"})
    MOD.restore_claim(claim, plist, providers)
    retained_candidates = [
        os.path.join(entry.path, "transaction", "interrupted-replacement.plist")
        for entry in os.scandir(agents)
        if entry.name.startswith(f".{os.path.basename(plist)}.credential-retained-")
    ]
    retained_quarantine = next((path for path in retained_candidates if os.path.isfile(path)), "")
    with open(retained_quarantine, "rb") as handle:
        retained_environment = plistlib.load(handle)["EnvironmentVariables"]
    check("restore retry never overwrites or deletes a pre-existing quarantine",
          retained_environment.get("CONNECTOR_NEW_TOKEN") == "retained-secret"
          and os.path.isfile(plist) and not os.path.lexists(claim))

with tempfile.TemporaryDirectory() as root:
    agents = os.path.join(root, "LaunchAgents")
    config = os.path.join(root, "config")
    os.mkdir(agents, 0o700)
    os.mkdir(config, 0o700)
    plist = os.path.join(agents, "com.nostradamus.connectors.plist")
    providers = os.path.join(config, "providers.env")
    write_plist(plist, {"CONNECTOR_TEST_TOKEN": "interrupted-restore-secret"})
    claim, _keys = MOD.claim_and_migrate(plist, providers)
    MOD._capture_public(os.path.dirname(claim), plist)
    MOD._restore_prior_state(claim, plist)  # crash seam: prior public restored, active directory not retired
    adopted, adopted_keys = MOD.claim_and_migrate(plist, providers)
    restored_archives = [
        entry.path for entry in os.scandir(agents)
        if entry.name.startswith(f".{os.path.basename(plist)}.credential-restored-")
    ]
    check("retry finishes an interrupted restore before starting the next exact claim",
          len(restored_archives) == 1 and adopted_keys == ["CONNECTOR_TEST_TOKEN"]
          and MOD._same_inode(plist, MOD._guard_path(os.path.dirname(adopted))))
    MOD.restore_claim(adopted, plist, providers)

with tempfile.TemporaryDirectory() as root:
    agents = os.path.join(root, "LaunchAgents")
    config = os.path.join(root, "config")
    os.mkdir(agents, 0o700)
    os.mkdir(config, 0o700)
    plist = os.path.join(agents, "com.nostradamus.connectors.plist")
    providers = os.path.join(config, "providers.env")
    write_plist(plist, {"CONNECTOR_TEST_TOKEN": "orphan-secret"})
    claim, _keys = MOD.claim_and_migrate(plist, providers)
    os.unlink(plist)  # crash after the private claim, before the caller can publish or restore
    adopted, adopted_keys = MOD.claim_and_migrate(plist, providers)
    check("one orphan claim is adopted and re-reserves an absent public pathname",
          adopted == claim and adopted_keys == ["CONNECTOR_TEST_TOKEN"] and os.path.isfile(plist))
    second = tempfile.mkdtemp(
        prefix=f".{os.path.basename(plist)}.credential-claim-", dir=agents,
    )
    os.chmod(second, 0o700)
    try:
        MOD.claim_and_migrate(plist, providers)
        ambiguous_refused = False
    except MOD.MigrationError as error:
        ambiguous_refused = "multiple" in str(error)
    check("multiple orphan claims fail closed", ambiguous_refused)

print(f"\n{'PASS' if not failures else 'FAIL'}: connector secret migration — {failures} failures")
raise SystemExit(1 if failures else 0)
