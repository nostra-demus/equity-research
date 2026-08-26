#!/usr/bin/env python3
"""Detached Ed25519 attestations for production memory release evidence."""
from __future__ import annotations

import base64
import hashlib
import re
from typing import Any, Mapping

try:
    from canonical_json import canonical_json_bytes
    from memory_crypto import ed25519_sign, ed25519_verify
except ImportError:  # pragma: no cover
    from scripts.canonical_json import canonical_json_bytes
    from scripts.memory_crypto import ed25519_sign, ed25519_verify


FIELDS = {"key_id", "algorithm", "signed_sha256", "value"}
SAFE_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$")


class ReleaseAttestationError(ValueError):
    """Release evidence lacks a valid trusted-service attestation."""


def _message(domain: bytes, payload: Mapping[str, Any]) -> bytes:
    if not isinstance(domain, bytes) or not domain or not domain.endswith(b"\0"):
        raise ReleaseAttestationError("release attestation domain is invalid")
    return domain + canonical_json_bytes(payload)


def sign_attestation(
    payload: Mapping[str, Any], *, domain: bytes, private_key: bytes, key_id: str,
) -> dict[str, str]:
    if not isinstance(key_id, str) or SAFE_ID.fullmatch(key_id) is None:
        raise ReleaseAttestationError("release attestation key identity is invalid")
    message = _message(domain, payload)
    signature = ed25519_sign(private_key, message)
    return {
        "key_id": key_id,
        "algorithm": "ed25519",
        "signed_sha256": "sha256:" + hashlib.sha256(message).hexdigest(),
        "value": base64.urlsafe_b64encode(signature).decode("ascii").rstrip("="),
    }


def verify_attestation(
    payload: Mapping[str, Any], attestation: Any, *, domain: bytes,
    public_key: bytes, key_id: str,
) -> bool:
    if (
        not isinstance(attestation, Mapping) or set(attestation) != FIELDS
        or attestation.get("key_id") != key_id or attestation.get("algorithm") != "ed25519"
    ):
        return False
    message = _message(domain, payload)
    if attestation.get("signed_sha256") != "sha256:" + hashlib.sha256(message).hexdigest():
        return False
    encoded = attestation.get("value")
    if not isinstance(encoded, str) or len(encoded) != 86 or re.fullmatch(r"[A-Za-z0-9_-]{86}", encoded) is None:
        return False
    try:
        signature = base64.b64decode(encoded + "==", altchars=b"-_", validate=True)
    except (ValueError, TypeError):
        return False
    return (
        base64.urlsafe_b64encode(signature).decode("ascii").rstrip("=") == encoded
        and ed25519_verify(public_key, message, signature)
    )


__all__ = [
    "ReleaseAttestationError", "sign_attestation", "verify_attestation",
]
