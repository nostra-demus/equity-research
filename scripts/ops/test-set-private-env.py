#!/usr/bin/env python3
"""Focused tests for the fail-closed OmniRoute private config and no-body key contract."""

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

    def run_setter(self, action: str, value: str = "1") -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, "-I", str(SETTER), action, "--file", str(self.env),
             "--key", "NEWS_OMNIROUTE_ENABLED", "--value", value],
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

    def create_database(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database)
        connection.executescript(
            """
            CREATE TABLE api_keys (
              id TEXT PRIMARY KEY, name TEXT NOT NULL, key TEXT NOT NULL UNIQUE,
              machine_id TEXT, allowed_models TEXT DEFAULT '[]', no_log INTEGER NOT NULL DEFAULT 0,
              created_at TEXT NOT NULL, revoked_at TEXT, expires_at TEXT, key_prefix TEXT,
              key_hash TEXT, scopes TEXT, is_active INTEGER NOT NULL DEFAULT 1,
              is_banned INTEGER NOT NULL DEFAULT 0
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

    def test_managed_key_is_private_idempotent_and_no_log(self) -> None:
        connection = self.create_database()
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

    def test_explicit_unknown_key_is_never_silently_replaced(self) -> None:
        connection = self.create_database()
        connection.close()
        self.write_env("NEWS_OMNIROUTE_API_KEY=sk-operator-owned\n")
        before = self.env.read_bytes()
        result = self.run_contract(
            "ensure-no-log-key", "--database", str(self.database),
        )
        self.assertEqual(result.returncode, 1)
        self.assertEqual(self.env.read_bytes(), before)
        self.assertNotIn("sk-operator-owned", result.stdout + result.stderr)

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
