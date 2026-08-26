#!/usr/bin/env python3
"""Fail-closed tests for detached production-evidence attestations."""
from __future__ import annotations

import binascii
import unittest
from unittest import mock

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

from memory_release_attestation import sign_attestation, verify_attestation


class ReleaseAttestationTest(unittest.TestCase):
    def test_invalid_base64_fails_closed(self) -> None:
        key = Ed25519PrivateKey.generate()
        private_key = key.private_bytes(
            serialization.Encoding.Raw,
            serialization.PrivateFormat.Raw,
            serialization.NoEncryption(),
        )
        public_key = key.public_key().public_bytes(
            serialization.Encoding.Raw,
            serialization.PublicFormat.Raw,
        )
        payload = {"report_id": "benchmark-1"}
        attestation = sign_attestation(
            payload,
            domain=b"memory-test\0",
            private_key=private_key,
            key_id="benchmark-runner",
        )
        with mock.patch(
            "memory_release_attestation.base64.b64decode",
            side_effect=binascii.Error("invalid base64"),
        ):
            self.assertFalse(
                verify_attestation(
                    payload,
                    attestation,
                    domain=b"memory-test\0",
                    public_key=public_key,
                    key_id="benchmark-runner",
                )
            )


if __name__ == "__main__":
    unittest.main()
