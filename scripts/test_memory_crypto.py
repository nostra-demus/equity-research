#!/usr/bin/env python3
"""Cryptographic trust-boundary regressions for permanent-memory Phase 2."""
from __future__ import annotations

import copy
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import memory_crypto as crypto  # noqa: E402
from memory_crypto import (  # noqa: E402
    AESGCMSIVEnvelopeCipher,
    KEY_ENVELOPE_ALGORITHM,
    MemoryCryptoError,
    ed25519_verify,
    load_master_key_file,
    receipt_signature_verifier,
)
from validate_screener_json import Checker  # noqa: E402


def main() -> None:
    # RFC 8032 section 7.1, test vector 1 (empty message).
    public_key = bytes.fromhex(
        "d75a980182b10ab7d54bfed3c964073a"
        "0ee172f3daa62325af021a68f707511a"
    )
    signature = bytes.fromhex(
        "e5564300c360ac729086e2cc806e828a"
        "84877f1eb8e5d974d873e06522490155"
        "5fb8821590a33bacc61e39701cf9b46b"
        "d25bf5f0595bbe24655141438e7a100b"
    )
    assert ed25519_verify(public_key, b"", signature)
    assert not ed25519_verify(public_key, b"changed", signature)
    assert not ed25519_verify(public_key[:-1], b"", signature)
    assert not ed25519_verify(public_key, b"", signature[:-1])
    assert receipt_signature_verifier("ed25519", public_key, b"", signature)
    assert not receipt_signature_verifier("rsa", public_key, b"", signature)

    master_key = bytes(range(32))
    cipher = AESGCMSIVEnvelopeCipher(master_key, key_id="key:phase2-test")
    plaintext = b"licensed source bytes that must remain purgeable"
    aad = b"memory-object/v1\x00licensed\x00sha256:test"
    protected = cipher.encrypt(plaintext, associated_data=aad)
    key_schema = json.loads(
        (ROOT / "frameworks/memory/key-envelope-v1.schema.json").read_text(encoding="utf-8")
    )
    checker = Checker(key_schema)
    checker.check(key_schema, protected.key_envelope, "")
    assert checker.errors == [], checker.errors
    assert protected.key_envelope["algorithm"] == KEY_ENVELOPE_ALGORITHM
    assert "wrapping_nonce" not in protected.key_envelope
    assert protected.ciphertext != plaintext
    assert cipher.decrypt(
        protected.ciphertext, protected.key_envelope, associated_data=aad
    ) == plaintext

    tampered_ciphertext = bytearray(protected.ciphertext)
    tampered_ciphertext[-1] ^= 1
    try:
        cipher.decrypt(bytes(tampered_ciphertext), protected.key_envelope, associated_data=aad)
    except MemoryCryptoError as exc:
        assert "authentication failed" in str(exc)
    else:
        raise AssertionError("tampered ciphertext authenticated")

    tampered_envelope = copy.deepcopy(protected.key_envelope)
    tampered_envelope["wrapped_key"] = (
        tampered_envelope["wrapped_key"][:-1]
        + ("A" if tampered_envelope["wrapped_key"][-1] != "A" else "B")
    )
    try:
        cipher.decrypt(protected.ciphertext, tampered_envelope, associated_data=aad)
    except MemoryCryptoError:
        pass
    else:
        raise AssertionError("tampered wrapped key authenticated")

    tampered_key_id = copy.deepcopy(protected.key_envelope)
    tampered_key_id["dek_id"] = "dek_" + "0" * 32
    try:
        cipher.decrypt(protected.ciphertext, tampered_key_id, associated_data=aad)
    except MemoryCryptoError:
        pass
    else:
        raise AssertionError("tampered data-key identity authenticated")

    for wrong_aad in (b"", b"memory-object/v1\x00public\x00sha256:test"):
        try:
            cipher.decrypt(
                protected.ciphertext, protected.key_envelope, associated_data=wrong_aad
            )
        except MemoryCryptoError:
            pass
        else:
            raise AssertionError("wrong associated data authenticated")

    wrong_key = AESGCMSIVEnvelopeCipher(os.urandom(32), key_id="key:phase2-test")
    try:
        wrong_key.decrypt(protected.ciphertext, protected.key_envelope, associated_data=aad)
    except MemoryCryptoError:
        pass
    else:
        raise AssertionError("wrong master key decrypted protected bytes")

    hostile_shapes = (None, True, 0, "", [], {})
    for field in protected.key_envelope:
        for hostile in hostile_shapes:
            malformed = copy.deepcopy(protected.key_envelope)
            malformed[field] = hostile
            malformed_checker = Checker(key_schema)
            malformed_checker.check(key_schema, malformed, "")
            assert malformed_checker.errors, (field, hostile)
            try:
                cipher.decrypt(protected.ciphertext, malformed, associated_data=aad)
            except MemoryCryptoError:
                pass
            except Exception as exc:
                raise AssertionError(
                    f"malformed {field} raised {type(exc).__name__}"
                ) from exc
            else:
                raise AssertionError(f"malformed {field} value authenticated")
    for malformed in ({}, {**protected.key_envelope, "extra": "field"}, [], None, True):
        malformed_checker = Checker(key_schema)
        malformed_checker.check(key_schema, malformed, "")
        assert malformed_checker.errors, malformed
        try:
            cipher.decrypt(protected.ciphertext, malformed, associated_data=aad)
        except MemoryCryptoError:
            pass
        except Exception as exc:
            raise AssertionError(
                f"malformed envelope raised {type(exc).__name__}"
            ) from exc
        else:
            raise AssertionError("malformed envelope authenticated")

    oversized = copy.deepcopy(protected.key_envelope)
    oversized["content_nonce"] = "A" * 1_000_000
    oversized_checker = Checker(key_schema)
    oversized_checker.check(key_schema, oversized, "")
    assert oversized_checker.errors
    with patch.object(
        crypto.base64,
        "b64decode",
        side_effect=AssertionError("oversized value reached the decoder"),
    ) as decoder:
        try:
            cipher.decrypt(protected.ciphertext, oversized, associated_data=aad)
        except MemoryCryptoError as exc:
            assert "encode exactly 12 bytes" in str(exc)
        else:
            raise AssertionError("oversized nonce was accepted")
        decoder.assert_not_called()

    collision_cipher = AESGCMSIVEnvelopeCipher(master_key, key_id="key:collision-test")
    with patch.object(crypto.os, "urandom", side_effect=lambda size: b"R" * size):
        collision_cipher.encrypt(b"first", associated_data=b"collision-aad")
        try:
            collision_cipher.encrypt(b"second", associated_data=b"collision-aad")
        except MemoryCryptoError as exc:
            assert "repeated a data-encryption key" in str(exc)
        else:
            raise AssertionError("repeated OS-random DEK was accepted")

    nonce_values = iter((b"A" * 32, b"N" * 12, b"B" * 32, b"N" * 12))
    nonce_cipher = AESGCMSIVEnvelopeCipher(master_key, key_id="key:nonce-test")
    with patch.object(crypto.os, "urandom", side_effect=lambda _size: next(nonce_values)):
        nonce_cipher.encrypt(b"first", associated_data=b"nonce-aad")
        try:
            nonce_cipher.encrypt(b"second", associated_data=b"nonce-aad")
        except MemoryCryptoError as exc:
            assert "repeated a content nonce" in str(exc)
        else:
            raise AssertionError("repeated OS-random content nonce was accepted")

    unavailable_cipher = AESGCMSIVEnvelopeCipher(master_key, key_id="key:backend-test")
    with patch.object(
        crypto,
        "AESGCMSIV",
        side_effect=crypto.UnsupportedAlgorithm("GCM-SIV unavailable"),
    ):
        try:
            unavailable_cipher.encrypt(b"data", associated_data=b"backend-aad")
        except MemoryCryptoError as exc:
            assert "backend is unavailable" in str(exc)
        else:
            raise AssertionError("unsupported GCM-SIV backend escaped fail-closed translation")
    with patch.object(
        crypto,
        "aes_key_unwrap",
        side_effect=crypto.UnsupportedAlgorithm("Key Wrap unavailable"),
    ):
        try:
            cipher.decrypt(
                protected.ciphertext,
                protected.key_envelope,
                associated_data=aad,
            )
        except MemoryCryptoError as exc:
            assert "backend is unavailable" in str(exc)
        else:
            raise AssertionError("unsupported Key Wrap backend escaped fail-closed translation")

    with tempfile.TemporaryDirectory(prefix="memory-key-test-") as temporary:
        key_path = Path(temporary) / "master.key"
        key_path.write_bytes(master_key)
        key_path.chmod(0o600)
        assert load_master_key_file(key_path) == master_key
        if os.name != "nt":
            key_path.chmod(0o644)
            try:
                load_master_key_file(key_path)
            except MemoryCryptoError as exc:
                assert "0600" in str(exc)
            else:
                raise AssertionError("permissive master-key file was accepted")
            key_path.chmod(0o600)

            original_key = key_path.read_bytes()
            attacker_key = b"A" * 32
            baseline = os.stat(key_path)
            real_read = os.read
            raced = [False]

            def raced_read(descriptor: int, size: int) -> bytes:
                if raced[0]:
                    return real_read(descriptor, size)
                raced[0] = True
                key_path.write_bytes(attacker_key)
                key_path.chmod(0o600)
                os.utime(
                    key_path,
                    ns=(baseline.st_atime_ns, baseline.st_mtime_ns),
                )
                value = real_read(descriptor, size)
                key_path.write_bytes(original_key)
                key_path.chmod(0o600)
                os.utime(
                    key_path,
                    ns=(baseline.st_atime_ns, baseline.st_mtime_ns),
                )
                return value

            with patch.object(crypto.os, "read", side_effect=raced_read):
                try:
                    load_master_key_file(key_path)
                except MemoryCryptoError as exc:
                    assert "changed during read" in str(exc)
                else:
                    raise AssertionError("in-place key-file race was not detected")
            assert key_path.read_bytes() == original_key

            alias = Path(temporary) / "master.alias"
            os.link(key_path, alias)
            try:
                load_master_key_file(key_path)
            except MemoryCryptoError as exc:
                assert "hard-link" in str(exc)
            else:
                raise AssertionError("hard-linked master-key file was accepted")

    dependency_guard = "\n".join(
        (
            "import sys",
            f"sys.path.insert(0, {str(ROOT / 'scripts')!r})",
            "import memory_crypto as crypto",
            "assert crypto._IMPORT_ERROR is not None",
            "for operation in (",
            "    crypto.require_crypto_backend,",
            "    lambda: crypto.ed25519_verify(b'x' * 32, b'', b'x' * 64),",
            "    lambda: crypto.AESGCMSIVEnvelopeCipher(b'x' * 32, key_id='key:test'),",
            "):",
            "    try:",
            "        operation()",
            "    except crypto.CryptoUnavailableError:",
            "        pass",
            "    else:",
            "        raise AssertionError('crypto operation did not fail closed')",
            "assert crypto.receipt_signature_verifier('rsa', b'', b'', b'') is False",
        )
    )
    guarded = subprocess.run(
        [sys.executable, "-I", "-S", "-c", dependency_guard],
        check=False,
        capture_output=True,
        text=True,
    )
    assert guarded.returncode == 0, (guarded.stdout, guarded.stderr)

    print("test_memory_crypto: PASS")


if __name__ == "__main__":
    main()
