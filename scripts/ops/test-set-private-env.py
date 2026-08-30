#!/usr/bin/env python3
"""Focused tests for fail-closed private provider config and the OmniRoute no-body key contract."""

from __future__ import annotations

import os
import re
import sqlite3
import stat
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SETTER = Path(__file__).with_name("set-private-env.py")


class PrivateEnvTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.config = self.root / "config"
        self.config.mkdir(mode=0o700)
        self.env = self.config / "providers.env"
        self.data = self.root / ".omniroute"
        self.data.mkdir(mode=0o755)
        self.database = self.data / "storage.sqlite"

    def tearDown(self) -> None:
        self.temp.cleanup()

    def run_setter(
        self, action: str, value: str = "1", key: str = "NEWS_OMNIROUTE_ENABLED",
    ) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, "-I", str(SETTER), action, "--file", str(self.env),
             "--key", key, "--value", value],
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=5,
            check=False,
        )

    def run_contract(self, action: str, *extra: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, "-I", str(SETTER), action, "--file", str(self.env), *extra],
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=8,
            check=False,
        )

    def run_secret_setter(
        self, value: str, key: str = "CONNECTOR_NOAA_CDO_API_KEY",
    ) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, "-I", str(SETTER), "set", "--file", str(self.env),
             "--key", key, "--value-stdin"],
            input=value,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=5,
            check=False,
        )

    def create_database(
        self, *, preexpanded_fallbacks: bool = False, include_scopes: bool = True,
    ) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database)
        connection.executescript(
            f"""
            CREATE TABLE api_keys (
              id TEXT PRIMARY KEY, name TEXT NOT NULL, key TEXT NOT NULL UNIQUE,
              machine_id TEXT, allowed_models TEXT DEFAULT '[]', no_log INTEGER NOT NULL DEFAULT 0,
              created_at TEXT NOT NULL, revoked_at TEXT, expires_at TEXT, last_used_at TEXT,
              key_prefix TEXT, ip_allowlist TEXT{', scopes TEXT' if include_scopes else ''}
            );
            CREATE TABLE call_logs (
              id TEXT PRIMARY KEY, timestamp TEXT, api_key_id TEXT, detail_state TEXT,
              artifact_relpath TEXT, artifact_size_bytes INTEGER, artifact_sha256 TEXT,
              has_request_body INTEGER, has_response_body INTEGER, has_pipeline_details INTEGER,
              request_summary TEXT
            );
            CREATE TABLE request_detail_logs (id TEXT, call_log_id TEXT);
            """
        )
        if preexpanded_fallbacks:
            connection.executescript(
                """
                ALTER TABLE api_keys ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;
                ALTER TABLE api_keys ADD COLUMN is_banned INTEGER NOT NULL DEFAULT 0;
                ALTER TABLE api_keys ADD COLUMN key_hash TEXT;
                """
            )
        connection.commit()
        self.database.chmod(0o644)
        return connection

    def write_env(self, text: str, mode: int = 0o600) -> None:
        # This helper writes only synthetic provider settings inside a private TemporaryDirectory fixture.
        self.env.write_text(text, encoding="utf-8")
        self.env.chmod(mode)

    def test_preserves_secrets_and_is_idempotent(self) -> None:
        original_line = "GROQ_API_KEY=must-stay-byte-for-byte-secret"
        self.write_env(f"# provider settings\n{original_line}\nexport NEWS_OMNIROUTE_ENABLED=0\n")

        changed = self.run_setter("set", "1")
        self.assertEqual(changed.returncode, 0, changed.stderr)
        self.assertEqual(changed.stdout, "updated\n")
        payload = self.env.read_text(encoding="utf-8")
        self.assertIn(original_line, payload)
        self.assertIn("# provider settings", payload)
        self.assertEqual(payload.count("NEWS_OMNIROUTE_ENABLED="), 1)
        self.assertIn("NEWS_OMNIROUTE_ENABLED=1\n", payload)
        self.assertEqual(stat.S_IMODE(self.env.stat().st_mode), 0o600)
        self.assertEqual(stat.S_IMODE((self.config / ".providers.env.lock").stat().st_mode), 0o600)
        self.assertEqual(self.run_setter("matches", "1").returncode, 0)

        before = (self.env.stat().st_ino, self.env.read_bytes())
        unchanged = self.run_setter("set", "1")
        self.assertEqual(unchanged.returncode, 0, unchanged.stderr)
        self.assertEqual(unchanged.stdout, "unchanged\n")
        self.assertEqual((self.env.stat().st_ino, self.env.read_bytes()), before)

    def test_creates_private_file_and_replaces_only_flag(self) -> None:
        self.config.chmod(0o755)
        result = self.run_setter("set", "0")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.env.read_text(encoding="utf-8"), "NEWS_OMNIROUTE_ENABLED=0\n")
        self.assertEqual(stat.S_IMODE(self.config.stat().st_mode), 0o700)
        self.assertEqual(stat.S_IMODE(self.env.stat().st_mode), 0o600)
        self.assertEqual(self.run_setter("matches", "0").returncode, 0)
        self.assertEqual(self.run_setter("matches", "1").returncode, 1)

    def test_provider_rollout_flags_use_the_same_private_atomic_setter(self) -> None:
        unrelated = "UNRELATED_PROVIDER_SETTING=must-stay-byte-for-byte"
        self.write_env(
            f"{unrelated}\n"
            "NEWS_OMNIROUTE_ENABLED=1\n"
            "ENGINE_CODEX_ENABLED=0\n",
        )

        parity = self.run_setter("set", "1", "ENGINE_PROVIDER_PARITY_ENABLED")
        self.assertEqual(parity.returncode, 0, parity.stderr)
        self.assertEqual(parity.stdout, "updated\n")
        payload = self.env.read_text(encoding="utf-8")
        self.assertIn(f"{unrelated}\n", payload)
        self.assertIn("NEWS_OMNIROUTE_ENABLED=1\n", payload)
        self.assertIn("ENGINE_PROVIDER_PARITY_ENABLED=1\n", payload)
        self.assertIn("ENGINE_CODEX_ENABLED=0\n", payload)
        self.assertEqual(
            self.run_setter("matches", "1", "ENGINE_PROVIDER_PARITY_ENABLED").returncode, 0,
        )

        codex = self.run_setter("set", "1", "ENGINE_CODEX_ENABLED")
        self.assertEqual(codex.returncode, 0, codex.stderr)
        self.assertIn("ENGINE_CODEX_ENABLED=1\n", self.env.read_text(encoding="utf-8"))

        unknown = self.run_setter("set", "1", "ENGINE_UNREVIEWED_FLAG")
        self.assertEqual(unknown.returncode, 2)
        self.assertNotIn("ENGINE_UNREVIEWED_FLAG", self.env.read_text(encoding="utf-8"))

    def test_connector_secret_is_read_from_stdin_without_echoing_it(self) -> None:
        secret = "private-noaa-token-1234567890"
        self.write_env("EXISTING_PROVIDER_KEY=must-stay-byte-for-byte\n")

        result = self.run_secret_setter(secret + "\n")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout, "updated\n")
        self.assertNotIn(secret, result.stdout + result.stderr)
        payload = self.env.read_text(encoding="utf-8")
        self.assertIn("EXISTING_PROVIDER_KEY=must-stay-byte-for-byte\n", payload)
        self.assertIn(f"CONNECTOR_NOAA_CDO_API_KEY={secret}\n", payload)
        self.assertEqual(stat.S_IMODE(self.env.stat().st_mode), 0o600)

        unchanged = self.run_secret_setter(secret)
        self.assertEqual(unchanged.returncode, 0, unchanged.stderr)
        self.assertEqual(unchanged.stdout, "unchanged\n")

    def test_connector_secret_stdin_rejects_unsafe_inputs_and_names(self) -> None:
        for value in ("", "line-one\nline-two", "x" * (64 * 1024 + 1)):
            result = self.run_secret_setter(value)
            self.assertNotEqual(result.returncode, 0)
            if value:
                self.assertNotIn(value[:100], result.stdout + result.stderr)

        unknown = self.run_secret_setter("secret", "UNREVIEWED_API_KEY")
        self.assertEqual(unknown.returncode, 2)
        self.assertFalse(self.env.exists())

        argv_secret = subprocess.run(
            [sys.executable, "-I", str(SETTER), "set", "--file", str(self.env),
             "--key", "CONNECTOR_NOAA_CDO_API_KEY", "--value", "never-allow-this"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=5,
            check=False,
        )
        self.assertEqual(argv_secret.returncode, 2)
        self.assertNotIn("never-allow-this", argv_secret.stdout + argv_secret.stderr)

    def test_set_collapses_duplicate_flag_but_matches_rejects_ambiguity(self) -> None:
        self.write_env(
            "GROQ_API_KEY=must-remain-secret\n"
            "NEWS_OMNIROUTE_ENABLED=0\nexport NEWS_OMNIROUTE_ENABLED=1\n",
        )
        self.assertEqual(self.run_setter("matches", "1").returncode, 1)
        result = self.run_setter("set", "0")
        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stdout, "updated\n")
        payload = self.env.read_text(encoding="utf-8")
        self.assertEqual(payload.count("NEWS_OMNIROUTE_ENABLED="), 1)
        self.assertIn("NEWS_OMNIROUTE_ENABLED=0\n", payload)
        self.assertIn("GROQ_API_KEY=must-remain-secret\n", payload)

    def test_symlink_hardlink_and_public_file_fail_closed(self) -> None:
        outside = self.root / "outside.env"
        outside.write_text("UNCHANGED=secret\n", encoding="utf-8")
        outside.chmod(0o600)
        self.env.symlink_to(outside)
        result = self.run_setter("set", "1")
        self.assertEqual(result.returncode, 1)
        self.assertEqual(outside.read_text(encoding="utf-8"), "UNCHANGED=secret\n")
        self.env.unlink()

        os.link(outside, self.env)
        result = self.run_setter("set", "1")
        self.assertEqual(result.returncode, 1)
        self.assertEqual(outside.read_text(encoding="utf-8"), "UNCHANGED=secret\n")
        self.env.unlink()

        self.write_env("UNCHANGED=secret\n", mode=0o640)
        before = self.env.read_bytes()
        result = self.run_setter("set", "1")
        self.assertEqual(result.returncode, 1)
        self.assertEqual(self.env.read_bytes(), before)
        self.assertEqual(stat.S_IMODE(self.env.stat().st_mode), 0o640)

    def test_rejects_unbounded_values_and_relative_paths_without_echoing_them(self) -> None:
        result = subprocess.run(
            [sys.executable, "-I", str(SETTER), "set", "--file", "providers.env",
             "--key", "NEWS_OMNIROUTE_ENABLED", "--value", "secret-value"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=5,
            check=False,
        )
        self.assertEqual(result.returncode, 2)
        self.assertNotIn("secret-value", result.stdout + result.stderr)

    def test_descriptor_fingerprint_tracks_only_effective_omniroute_identity(self) -> None:
        self.write_env(
            "GROQ_API_KEY=unrelated-secret\n"
            "NEWS_OMNIROUTE_ENABLED=0\n"
            "NEWS_OMNIROUTE_MODEL=oc/hy3-free\n",
        )
        first = self.run_contract("fingerprint")
        first_state = self.run_contract("state-fingerprint")
        self.assertEqual(first.returncode, 0, first.stderr)
        self.assertEqual(first_state.returncode, 0, first_state.stderr)
        self.assertRegex(first.stdout, r"^[0-9a-f]{64}\n$")

        self.write_env(
            "GROQ_API_KEY=rotated-unrelated-secret\n"
            "NEWS_OMNIROUTE_ENABLED=1\n"
            "NEWS_OMNIROUTE_MODEL=oc/hy3-free\n",
        )
        second = self.run_contract("fingerprint")
        second_state = self.run_contract("state-fingerprint")
        self.assertEqual(first.stdout, second.stdout)
        self.assertNotEqual(first_state.stdout, second_state.stdout)

        self.write_env(
            "GROQ_API_KEY=rotated-unrelated-secret\n"
            "NEWS_OMNIROUTE_ENABLED=1\n"
            "NEWS_OMNIROUTE_MODEL=operator/combo\n",
        )
        self.assertNotEqual(second.stdout, self.run_contract("fingerprint").stdout)
        self.assertEqual(self.run_contract("model").stdout, "operator/combo\n")

        self.write_env(
            "NEWS_OMNIROUTE_MODEL=oc/hy3-free\n"
            "export NEWS_OMNIROUTE_MODEL=operator/combo\n",
        )
        self.assertEqual(self.run_contract("fingerprint").returncode, 1)

    def test_managed_default_model_migrates_without_overwriting_operator_routes(self) -> None:
        # An installation that relied on the implicit old default gets one explicit reviewed default.
        missing = self.run_contract("migrate-default-model")
        self.assertEqual(missing.returncode, 0, missing.stderr)
        self.assertEqual(missing.stdout, "updated\n")
        self.assertIn("NEWS_OMNIROUTE_MODEL=auto/coding:free\n", self.env.read_text(encoding="utf-8"))
        self.assertEqual(self.run_contract("model").stdout, "auto/coding:free\n")
        self.assertEqual(self.run_contract("migrate-default-model").stdout, "unchanged\n")

        # The retired managed value migrates too, while unrelated secrets survive byte-for-byte.
        unrelated = "GROQ_API_KEY=must-remain-secret"
        self.write_env(f"{unrelated}\nNEWS_OMNIROUTE_MODEL=oc/hy3-free\n")
        legacy = self.run_contract("migrate-default-model")
        self.assertEqual(legacy.returncode, 0, legacy.stderr)
        self.assertEqual(legacy.stdout, "updated\n")
        payload = self.env.read_text(encoding="utf-8")
        self.assertIn(f"{unrelated}\n", payload)
        self.assertIn("NEWS_OMNIROUTE_MODEL=auto/coding:free\n", payload)

        # Any other value is operator-owned and is neither rewritten nor republished.
        self.write_env(f"{unrelated}\nNEWS_OMNIROUTE_MODEL=operator/private-combo\n")
        before = (self.env.stat().st_ino, self.env.read_bytes())
        custom = self.run_contract("migrate-default-model")
        self.assertEqual(custom.returncode, 0, custom.stderr)
        self.assertEqual(custom.stdout, "unchanged\n")
        self.assertEqual((self.env.stat().st_ino, self.env.read_bytes()), before)

        # Duplicate authority still fails closed and leaves the file untouched.
        self.write_env(
            "NEWS_OMNIROUTE_MODEL=oc/hy3-free\n"
            "export NEWS_OMNIROUTE_MODEL=operator/private-combo\n",
        )
        before_bytes = self.env.read_bytes()
        ambiguous = self.run_contract("migrate-default-model")
        self.assertEqual(ambiguous.returncode, 1)
        self.assertEqual(self.env.read_bytes(), before_bytes)

    def test_managed_key_is_private_idempotent_and_no_log(self) -> None:
        connection = self.create_database()
        before_columns = {row[1] for row in connection.execute("PRAGMA table_info(api_keys)")}
        self.assertTrue({"is_active", "is_banned", "key_hash"}.isdisjoint(before_columns))
        connection.close()
        result = self.run_contract(
            "ensure-no-log-key", "--database", str(self.database),
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout, "updated\n")
        payload = self.env.read_text(encoding="utf-8")
        raw_key = re.search(r"^NEWS_OMNIROUTE_API_KEY=(.+)$", payload, re.MULTILINE).group(1)
        key_id = re.search(r"^NEWS_OMNIROUTE_API_KEY_ID=(.+)$", payload, re.MULTILINE).group(1)
        self.assertNotIn(raw_key, result.stdout + result.stderr)
        self.assertNotIn(key_id, result.stdout + result.stderr)
        self.assertEqual(stat.S_IMODE(self.data.stat().st_mode), 0o700)
        self.assertEqual(stat.S_IMODE(self.database.stat().st_mode), 0o600)

        connection = sqlite3.connect(self.database)
        columns = {row[1]: row for row in connection.execute("PRAGMA table_info(api_keys)")}
        self.assertEqual(set(columns) - before_columns, {"is_active", "is_banned", "key_hash"})
        self.assertEqual(
            {
                name: (columns[name][2], columns[name][3], columns[name][4], columns[name][5])
                for name in ("is_active", "is_banned", "key_hash")
            },
            {
                "is_active": ("INTEGER", 1, "1", 0),
                "is_banned": ("INTEGER", 1, "0", 0),
                "key_hash": ("TEXT", 0, None, 0),
            },
        )
        row = connection.execute(
            "SELECT id, key, no_log, is_active, is_banned FROM api_keys",
        ).fetchone()
        self.assertEqual(row, (key_id, raw_key, 1, 1, 0))
        connection.close()
        healthy = self.run_contract(
            "no-log-key-healthy", "--database", str(self.database),
        )
        self.assertEqual(healthy.returncode, 0, healthy.stderr)
        unchanged = self.run_contract(
            "ensure-no-log-key", "--database", str(self.database),
        )
        self.assertEqual(unchanged.returncode, 0, unchanged.stderr)
        self.assertEqual(unchanged.stdout, "unchanged\n")

        connection = sqlite3.connect(self.database)
        connection.execute("UPDATE api_keys SET no_log = 0 WHERE id = ?", (key_id,))
        connection.commit()
        connection.close()
        self.assertEqual(self.run_contract(
            "no-log-key-healthy", "--database", str(self.database),
        ).returncode, 1)
        repaired = self.run_contract(
            "ensure-no-log-key", "--database", str(self.database),
        )
        self.assertEqual(repaired.returncode, 0, repaired.stderr)
        self.assertEqual(repaired.stdout, "updated\n")

    def test_preexpanded_fallback_schema_remains_compatible(self) -> None:
        connection = self.create_database(preexpanded_fallbacks=True)
        before = list(connection.execute("PRAGMA table_info(api_keys)"))
        connection.close()
        created = self.run_contract(
            "ensure-no-log-key", "--database", str(self.database),
        )
        self.assertEqual(created.returncode, 0, created.stderr)
        self.assertEqual(created.stdout, "updated\n")
        connection = sqlite3.connect(self.database)
        after = list(connection.execute("PRAGMA table_info(api_keys)"))
        connection.close()
        self.assertEqual(after, before)
        unchanged = self.run_contract(
            "ensure-no-log-key", "--database", str(self.database),
        )
        self.assertEqual(unchanged.returncode, 0, unchanged.stderr)
        self.assertEqual(unchanged.stdout, "unchanged\n")

    def test_unsupported_schema_gets_no_partial_fallbacks_or_environment(self) -> None:
        connection = self.create_database(include_scopes=False)
        before = list(connection.execute("PRAGMA table_info(api_keys)"))
        connection.close()
        result = self.run_contract(
            "ensure-no-log-key", "--database", str(self.database),
        )
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stdout + result.stderr, "")
        self.assertFalse(self.env.exists())
        connection = sqlite3.connect(self.database)
        after = list(connection.execute("PRAGMA table_info(api_keys)"))
        row_count = connection.execute("SELECT count(*) FROM api_keys").fetchone()[0]
        connection.close()
        self.assertEqual(after, before)
        self.assertEqual(row_count, 0)

    def test_incompatible_existing_fallback_gets_no_partial_alter(self) -> None:
        connection = self.create_database()
        connection.execute(
            "ALTER TABLE api_keys ADD COLUMN is_active INTEGER NOT NULL DEFAULT 0",
        )
        connection.commit()
        before = list(connection.execute("PRAGMA table_info(api_keys)"))
        connection.close()
        result = self.run_contract(
            "ensure-no-log-key", "--database", str(self.database),
        )
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stdout + result.stderr, "")
        self.assertFalse(self.env.exists())
        connection = sqlite3.connect(self.database)
        after = list(connection.execute("PRAGMA table_info(api_keys)"))
        connection.close()
        self.assertEqual(after, before)

    def test_database_symlink_and_hardlink_fail_closed(self) -> None:
        connection = self.create_database()
        connection.close()
        outside = self.root / "outside.sqlite"
        self.database.replace(outside)
        original = outside.read_bytes()

        self.database.symlink_to(outside)
        linked = self.run_contract(
            "ensure-no-log-key", "--database", str(self.database),
        )
        self.assertEqual(linked.returncode, 1)
        self.assertFalse(self.env.exists())
        self.assertEqual(outside.read_bytes(), original)
        self.database.unlink()

        os.link(outside, self.database)
        hardlinked = self.run_contract(
            "ensure-no-log-key", "--database", str(self.database),
        )
        self.assertEqual(hardlinked.returncode, 1)
        self.assertFalse(self.env.exists())
        self.assertEqual(outside.read_bytes(), original)

    def test_explicit_unknown_key_is_never_silently_replaced(self) -> None:
        connection = self.create_database()
        before_columns = list(connection.execute("PRAGMA table_info(api_keys)"))
        connection.close()
        self.write_env("NEWS_OMNIROUTE_API_KEY=sk-operator-owned\n")
        before = self.env.read_bytes()
        result = self.run_contract(
            "ensure-no-log-key", "--database", str(self.database),
        )
        self.assertEqual(result.returncode, 1)
        self.assertEqual(self.env.read_bytes(), before)
        self.assertNotIn("sk-operator-owned", result.stdout + result.stderr)
        connection = sqlite3.connect(self.database)
        after_columns = list(connection.execute("PRAGMA table_info(api_keys)"))
        connection.close()
        self.assertEqual(after_columns, before_columns)

    def test_successful_smoke_rows_must_have_no_persisted_body_artifacts(self) -> None:
        connection = self.create_database()
        connection.close()
        self.assertEqual(self.run_contract(
            "ensure-no-log-key", "--database", str(self.database),
        ).returncode, 0)
        payload = self.env.read_text(encoding="utf-8")
        key_id = re.search(r"^NEWS_OMNIROUTE_API_KEY_ID=(.+)$", payload, re.MULTILINE).group(1)
        after = "2026-08-21T10:00:00.000Z"
        connection = sqlite3.connect(self.database)
        connection.execute(
            "INSERT INTO call_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ("safe", "2026-08-21T10:00:00.100Z", key_id, "none", None, None, None, 0, 0, 0, None),
        )
        connection.execute(
            "INSERT INTO call_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            ("safe-2", "2026-08-21T10:00:00.200Z", key_id, "none", None, None, None, 0, 0, 0, None),
        )
        connection.commit()
        connection.close()
        verified = self.run_contract(
            "verify-no-body-log", "--database", str(self.database), "--after", after,
        )
        self.assertEqual(verified.returncode, 0, verified.stderr)

        connection = sqlite3.connect(self.database)
        connection.execute("UPDATE call_logs SET has_request_body = 1 WHERE id = 'safe'")
        connection.commit()
        connection.close()
        self.assertEqual(self.run_contract(
            "verify-no-body-log", "--database", str(self.database), "--after", after,
        ).returncode, 1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
