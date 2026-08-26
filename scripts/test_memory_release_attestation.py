#!/usr/bin/env python3
"""Fail-closed tests for detached production-evidence attestations."""
from __future__ import annotations

import base64
import unittest

try:
    from memory_release_attestation import sign_attestation, verify_attestation
except ImportError:  # pragma: no cover
    from scripts.memory_release_attestation import sign_attestation, verify_attestation


PRIVATE_KEY = bytes.fromhex(
    "9d61b19deffd5a60ba844af492ec2cc4"
    "4449c5697b326919703bac031cae7f60"
)
PUBLIC_KEY = bytes.fromhex(
    "d75a980182b10ab7d54bfed3c964073a"
    "0ee172f3daa62325af021a68f707511a"
)
BASE64URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"


class ReleaseAttestationTest(unittest.TestCase):
    def test_valid_attestation_verifies(self) -> None:
        payload = {"report_id": "benchmark-1"}
        attestation = sign_attestation(
            payload,
            domain=b"memory-test\0",
            private_key=PRIVATE_KEY,
            key_id="benchmark-runner",
        )
        self.assertTrue(
            verify_attestation(
                payload,
                attestation,
                domain=b"memory-test\0",
                public_key=PUBLIC_KEY,
                key_id="benchmark-runner",
            )
        )

    def test_noncanonical_base64_fails_closed(self) -> None:
        payload = {"report_id": "benchmark-1"}
        domain = b"memory-test\0"
        attestation = sign_attestation(
            payload,
            domain=domain,
            private_key=PRIVATE_KEY,
            key_id="benchmark-runner",
        )
        canonical_value = attestation["value"]
        last_value = BASE64URL_ALPHABET.index(canonical_value[-1])
        self.assertEqual(last_value & 0x0F, 0)
        # Alter only unused padding bits, preserving the decoded signature.
        attestation["value"] = (
            canonical_value[:-1] + BASE64URL_ALPHABET[last_value | 0x01]
        )
        self.assertEqual(
            base64.urlsafe_b64decode(canonical_value + "=="),
            base64.urlsafe_b64decode(attestation["value"] + "=="),
        )
        self.assertFalse(
            verify_attestation(
                payload,
                attestation,
                domain=domain,
                public_key=PUBLIC_KEY,
                key_id="benchmark-runner",
            )
        )


if __name__ == "__main__":
    unittest.main()
