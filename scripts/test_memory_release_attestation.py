#!/usr/bin/env python3
"""Fail-closed tests for detached production-evidence attestations."""
from __future__ import annotations

import hashlib
import unittest

try:
    from canonical_json import canonical_json_bytes
    from memory_release_attestation import sign_attestation, verify_attestation
except ImportError:  # pragma: no cover
    from scripts.canonical_json import canonical_json_bytes
    from scripts.memory_release_attestation import sign_attestation, verify_attestation


class ReleaseAttestationTest(unittest.TestCase):
    def test_valid_attestation_verifies(self) -> None:
        payload = {"report_id": "benchmark-1"}
        private_key = bytes.fromhex(
            "9d61b19deffd5a60ba844af492ec2cc4"
            "4449c5697b326919703bac031cae7f60"
        )
        public_key = bytes.fromhex(
            "d75a980182b10ab7d54bfed3c964073a"
            "0ee172f3daa62325af021a68f707511a"
        )
        attestation = sign_attestation(
            payload,
            domain=b"memory-test\0",
            private_key=private_key,
            key_id="benchmark-runner",
        )
        self.assertTrue(
            verify_attestation(
                payload,
                attestation,
                domain=b"memory-test\0",
                public_key=public_key,
                key_id="benchmark-runner",
            )
        )

    def test_noncanonical_base64_fails_closed(self) -> None:
        payload = {"report_id": "benchmark-1"}
        domain = b"memory-test\0"
        message = domain + canonical_json_bytes(payload)
        attestation = {
            "key_id": "benchmark-runner",
            "algorithm": "ed25519",
            "signed_sha256": "sha256:" + hashlib.sha256(message).hexdigest(),
            # Structurally valid, but B introduces non-zero padding bits. The
            # verifier must reject this alternate encoding before signature use.
            "value": "A" * 85 + "B",
        }
        self.assertFalse(
            verify_attestation(
                payload,
                attestation,
                domain=domain,
                public_key=b"A" * 32,
                key_id="benchmark-runner",
            )
        )


if __name__ == "__main__":
    unittest.main()
