#!/usr/bin/env python3
"""Fail-closed tests for detached production-evidence attestations."""
from __future__ import annotations

import hashlib
import unittest

try:
    from canonical_json import canonical_json_bytes
    from memory_release_attestation import verify_attestation
except ImportError:  # pragma: no cover
    from scripts.canonical_json import canonical_json_bytes
    from scripts.memory_release_attestation import verify_attestation


class ReleaseAttestationTest(unittest.TestCase):
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
