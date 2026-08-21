#!/usr/bin/env python3
"""Small, fail-closed cryptographic boundary for permanent-memory Phase 2.

The canonical contracts remain plain JSON and never contain private keys.  This
module supplies the two concrete operations those contracts need at runtime:

* Ed25519 verification for detached intake receipts; and
* AES-256-GCM-SIV content encryption plus AES-256 Key Wrap for purgeable
  protected objects.

Each protected object receives a random data-encryption key (DEK).  The DEK is
wrapped by an externally supplied key-encryption key (KEK) and stored separately
from the ciphertext.  Purging the wrapped-DEK record makes any ciphertext that
survives storage reclamation or an object-only backup cryptographically
unreadable.  Backup/key-retention policy still has to delete every copy of the
wrapped key; cryptography cannot compensate for retaining the key elsewhere.
"""
from __future__ import annotations

import base64
import binascii
import hashlib
import hmac
import os
import re
import stat
import threading
from dataclasses import dataclass

try:
    from cryptography.exceptions import InvalidSignature, InvalidTag, UnsupportedAlgorithm
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
    from cryptography.hazmat.primitives.ciphers.aead import AESGCMSIV
    from cryptography.hazmat.primitives.keywrap import (
        InvalidUnwrap,
        aes_key_unwrap,
        aes_key_wrap,
    )
except ImportError as exc:  # pragma: no cover - exercised by the dependency guard test
    InvalidSignature = InvalidTag = InvalidUnwrap = UnsupportedAlgorithm = None  # type: ignore[assignment]
    Ed25519PublicKey = AESGCMSIV = None  # type: ignore[assignment]
    aes_key_unwrap = aes_key_wrap = None  # type: ignore[assignment]
    _IMPORT_ERROR: ImportError | None = exc
else:
    _IMPORT_ERROR = None


KEY_ENVELOPE_SCHEMA = "memory-key-envelope/v1"
KEY_ENVELOPE_ALGORITHM = "aes-256-gcm-siv+a256kw-envelope/v1"
_KEY_ID_RE = re.compile(r"^key:[a-z0-9][a-z0-9._-]{0,127}$")
_SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
_B64URL_RE = re.compile(r"^[A-Za-z0-9_-]+$")


class MemoryCryptoError(ValueError):
    """Raised when cryptographic material or authentication is invalid."""


class CryptoUnavailableError(RuntimeError):
    """Raised when the reviewed cryptographic backend is unavailable."""


def require_crypto_backend() -> None:
    if _IMPORT_ERROR is not None:
        raise CryptoUnavailableError(
            "permanent-memory cryptography is unavailable; install "
            "scripts/requirements-memory.txt"
        ) from _IMPORT_ERROR


def _stable_file_identity(item: os.stat_result) -> tuple[int, ...]:
    """Capture every stable attribute used to detect an in-place key-file race."""

    return (
        item.st_dev,
        item.st_ino,
        item.st_size,
        item.st_mtime_ns,
        item.st_ctime_ns,
        item.st_nlink,
        stat.S_IMODE(item.st_mode),
        getattr(item, "st_uid", -1),
        getattr(item, "st_gid", -1),
    )


def load_master_key_file(path: os.PathLike[str] | str) -> bytes:
    """Read one raw 256-bit KEK from a stable, private, no-follow regular file."""

    candidate = os.fspath(path)
    if not candidate:
        raise MemoryCryptoError("master-key path must not be empty")
    try:
        before = os.lstat(candidate)
    except OSError as exc:
        raise MemoryCryptoError(f"master-key file is unavailable: {exc}") from exc
    if not stat.S_ISREG(before.st_mode) or stat.S_ISLNK(before.st_mode):
        raise MemoryCryptoError("master-key path must be a regular file, not a symlink")
    if before.st_nlink != 1:
        raise MemoryCryptoError("master-key file must not have hard-link aliases")
    if os.name != "nt" and before.st_mode & 0o077:
        raise MemoryCryptoError("master-key file permissions must be owner-only (0600)")
    if hasattr(os, "getuid") and before.st_uid != os.getuid():
        raise MemoryCryptoError("master-key file must be owned by the current user")
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    try:
        descriptor = os.open(candidate, flags)
    except OSError as exc:
        raise MemoryCryptoError(f"master-key file could not be opened safely: {exc}") from exc
    try:
        opened = os.fstat(descriptor)
        if (
            not stat.S_ISREG(opened.st_mode)
            or opened.st_nlink != 1
            or (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino)
        ):
            raise MemoryCryptoError("master-key file identity changed during open")
        chunks: list[bytes] = []
        remaining = 33
        while remaining:
            chunk = os.read(descriptor, remaining)
            if not chunk:
                break
            chunks.append(chunk)
            remaining -= len(chunk)
        raw = b"".join(chunks)
        after_open = os.fstat(descriptor)
    finally:
        os.close(descriptor)
    try:
        named_after = os.lstat(candidate)
    except OSError as exc:
        raise MemoryCryptoError("master-key file changed during read") from exc
    identities = tuple(
        _stable_file_identity(item) for item in (before, opened, after_open, named_after)
    )
    if any(identity != identities[0] for identity in identities[1:]):
        raise MemoryCryptoError("master-key file changed during read")
    if len(raw) != 32:
        raise MemoryCryptoError("master-key file must contain exactly 32 raw bytes")
    return raw


def _b64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _b64url_decode(value: object, *, field: str, expected_length: int | None = None) -> bytes:
    if not isinstance(value, str) or not value:
        raise MemoryCryptoError(f"{field} must be unpadded base64url")
    if expected_length is not None:
        encoded_length = (expected_length * 4 + 2) // 3
        if len(value) != encoded_length:
            raise MemoryCryptoError(
                f"{field} must encode exactly {expected_length} bytes"
            )
    if _B64URL_RE.fullmatch(value) is None:
        raise MemoryCryptoError(f"{field} must be unpadded base64url")
    try:
        decoded = base64.b64decode(
            value + "=" * (-len(value) % 4), altchars=b"-_", validate=True
        )
    except (binascii.Error, ValueError) as exc:
        raise MemoryCryptoError(f"{field} must be canonical unpadded base64url") from exc
    if _b64url_encode(decoded) != value:
        raise MemoryCryptoError(f"{field} must be canonical unpadded base64url")
    if expected_length is not None and len(decoded) != expected_length:
        raise MemoryCryptoError(f"{field} must decode to {expected_length} bytes")
    return decoded


def ed25519_verify(public_key: bytes, message: bytes, signature: bytes) -> bool:
    """Verify one Ed25519 signature without accepting alternate encodings."""

    require_crypto_backend()
    if not isinstance(public_key, bytes) or len(public_key) != 32:
        return False
    if not isinstance(message, bytes):
        return False
    if not isinstance(signature, bytes) or len(signature) != 64:
        return False
    try:
        Ed25519PublicKey.from_public_bytes(public_key).verify(signature, message)
    except (InvalidSignature, ValueError):
        return False
    return True


def receipt_signature_verifier(
    algorithm: object,
    public_key: bytes,
    message: bytes,
    signature: bytes,
) -> bool:
    """Adapter for ``memory_contract.verify_intake_receipt``'s closed verifier API."""

    if algorithm != "ed25519":
        return False
    return ed25519_verify(public_key, message, signature)


@dataclass(frozen=True)
class EncryptedObject:
    """Ciphertext plus the separately purgeable wrapped-key record."""

    ciphertext: bytes
    key_envelope: dict[str, str]


class AESGCMSIVEnvelopeCipher:
    """Misuse-resistant per-object encryption with an external 256-bit KEK."""

    def __init__(
        self,
        master_key: bytes,
        *,
        key_id: str,
    ) -> None:
        require_crypto_backend()
        if not isinstance(master_key, bytes) or len(master_key) != 32:
            raise MemoryCryptoError("AES-GCM key-encryption key must be exactly 32 bytes")
        if not isinstance(key_id, str) or _KEY_ID_RE.fullmatch(key_id) is None:
            raise MemoryCryptoError("key_id must match key:<lowercase-name>")
        self._master_key = master_key
        self._dek_id_key = hmac.new(
            master_key,
            b"memory-dek-id-key/v1",
            hashlib.sha256,
        ).digest()
        self.key_id = key_id
        self._seen_dek_ids: set[str] = set()
        self._seen_content_nonces: set[bytes] = set()
        self._seen_lock = threading.Lock()

    @staticmethod
    def _validate_aad(associated_data: bytes) -> bytes:
        if not isinstance(associated_data, bytes) or not associated_data:
            raise MemoryCryptoError("associated_data must be non-empty bytes")
        return associated_data

    def _effective_aad(self, associated_data: bytes, data_key_id: str) -> bytes:
        return b"\x00".join(
            (
                associated_data,
                KEY_ENVELOPE_SCHEMA.encode("ascii"),
                KEY_ENVELOPE_ALGORITHM.encode("ascii"),
                self.key_id.encode("ascii"),
                data_key_id.encode("ascii"),
            )
        )

    def _data_key_id(self, data_key: bytes) -> str:
        fingerprint = hmac.new(
            self._dek_id_key,
            b"memory-dek-id/v1\0" + data_key,
            hashlib.sha256,
        ).hexdigest()
        return "dek_" + fingerprint[:32]

    def encrypt(self, plaintext: bytes, *, associated_data: bytes) -> EncryptedObject:
        if not isinstance(plaintext, bytes):
            raise MemoryCryptoError("plaintext must be bytes")
        aad = self._validate_aad(associated_data)
        data_key = os.urandom(32)
        content_nonce = os.urandom(12)
        if (
            not isinstance(data_key, bytes)
            or not isinstance(content_nonce, bytes)
            or len(data_key) != 32
            or len(content_nonce) != 12
        ):
            raise MemoryCryptoError("random source returned an invalid byte count")
        data_key_id_text = self._data_key_id(data_key)
        with self._seen_lock:
            if data_key_id_text in self._seen_dek_ids:
                raise MemoryCryptoError("OS random source repeated a data-encryption key")
            if content_nonce in self._seen_content_nonces:
                raise MemoryCryptoError("OS random source repeated a content nonce")
            self._seen_dek_ids.add(data_key_id_text)
            self._seen_content_nonces.add(content_nonce)
        effective_aad = self._effective_aad(aad, data_key_id_text)
        try:
            ciphertext = AESGCMSIV(data_key).encrypt(
                content_nonce, plaintext, effective_aad
            )
            wrapped_key = aes_key_wrap(self._master_key, data_key)
        except UnsupportedAlgorithm as exc:
            raise MemoryCryptoError(
                "required AES-GCM-SIV or AES Key Wrap backend is unavailable"
            ) from exc
        envelope = {
            "schema": KEY_ENVELOPE_SCHEMA,
            "algorithm": KEY_ENVELOPE_ALGORITHM,
            "kek_id": self.key_id,
            "dek_id": data_key_id_text,
            "aad_sha256": hashlib.sha256(effective_aad).hexdigest(),
            "content_nonce": _b64url_encode(content_nonce),
            "wrapped_key": _b64url_encode(wrapped_key),
        }
        return EncryptedObject(ciphertext=ciphertext, key_envelope=envelope)

    def decrypt(
        self,
        ciphertext: bytes,
        key_envelope: dict[str, str],
        *,
        associated_data: bytes,
    ) -> bytes:
        if not isinstance(ciphertext, bytes):
            raise MemoryCryptoError("ciphertext must be bytes")
        aad = self._validate_aad(associated_data)
        required = {
            "schema", "algorithm", "kek_id", "dek_id", "aad_sha256",
            "content_nonce", "wrapped_key",
        }
        if not isinstance(key_envelope, dict) or set(key_envelope) != required:
            raise MemoryCryptoError("key envelope has unsupported or missing fields")
        if key_envelope.get("schema") != KEY_ENVELOPE_SCHEMA:
            raise MemoryCryptoError("key envelope schema is unsupported")
        if key_envelope.get("algorithm") != KEY_ENVELOPE_ALGORITHM:
            raise MemoryCryptoError("key envelope algorithm is unsupported")
        if key_envelope.get("kek_id") != self.key_id:
            raise MemoryCryptoError("key envelope was wrapped by a different key")
        data_key_id = key_envelope.get("dek_id")
        if not isinstance(data_key_id, str) or re.fullmatch(r"dek_[0-9a-f]{32}", data_key_id) is None:
            raise MemoryCryptoError("key envelope dek_id is invalid")
        aad_sha256 = key_envelope.get("aad_sha256")
        if not isinstance(aad_sha256, str) or _SHA256_RE.fullmatch(aad_sha256) is None:
            raise MemoryCryptoError("key envelope aad_sha256 is invalid")
        effective_aad = self._effective_aad(aad, data_key_id)
        if hashlib.sha256(effective_aad).hexdigest() != aad_sha256:
            raise MemoryCryptoError("key envelope is bound to different associated data")
        content_nonce = _b64url_decode(
            key_envelope.get("content_nonce"), field="content_nonce", expected_length=12
        )
        wrapped_key = _b64url_decode(
            key_envelope.get("wrapped_key"), field="wrapped_key", expected_length=40
        )
        try:
            data_key = aes_key_unwrap(self._master_key, wrapped_key)
            if not hmac.compare_digest(self._data_key_id(data_key), data_key_id):
                raise MemoryCryptoError("wrapped key does not match its keyed DEK identity")
            return AESGCMSIV(data_key).decrypt(content_nonce, ciphertext, effective_aad)
        except UnsupportedAlgorithm as exc:
            raise MemoryCryptoError(
                "required AES-GCM-SIV or AES Key Wrap backend is unavailable"
            ) from exc
        except (InvalidTag, InvalidUnwrap) as exc:
            raise MemoryCryptoError("protected object authentication failed") from exc


__all__ = [
    "AESGCMSIVEnvelopeCipher",
    "AESGCMEnvelopeCipher",
    "CryptoUnavailableError",
    "EncryptedObject",
    "KEY_ENVELOPE_ALGORITHM",
    "KEY_ENVELOPE_SCHEMA",
    "MemoryCryptoError",
    "ed25519_verify",
    "load_master_key_file",
    "receipt_signature_verifier",
    "require_crypto_backend",
]


# Backward-compatible import alias for the pre-freeze Phase 2 prototype name.  The closed
# algorithm identifier and implementation have always been AES-256-GCM-SIV plus AES Key Wrap.
AESGCMEnvelopeCipher = AESGCMSIVEnvelopeCipher
