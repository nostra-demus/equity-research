#!/usr/bin/env python3
"""Fail-closed and bounded-response regressions shared by every connector."""
from __future__ import annotations

from connector_http import ResponseBodyError, ResponseBodyTooLarge, read_bounded_response


class TrackedResponse:
    def __init__(self, body: bytes, *, content_length: str | None = None, chunk_size: int | None = None):
        self.headers = {} if content_length is None else {"Content-Length": content_length}
        self.body = body
        self.chunk_size = chunk_size
        self.offset = 0
        self.read_sizes: list[int] = []

    def read(self, size: int) -> bytes:
        self.read_sizes.append(size)
        if size < 0:
            raise AssertionError("bounded reader attempted an unbounded read")
        take = size if self.chunk_size is None else min(size, self.chunk_size)
        chunk = self.body[self.offset:self.offset + take]
        self.offset += len(chunk)
        return chunk


declared = TrackedResponse(b"not-read", content_length="9")
try:
    read_bounded_response(declared, max_bytes=8)
except ResponseBodyTooLarge:
    pass
else:
    raise AssertionError("oversized Content-Length was accepted")
assert not declared.read_sizes

chunked = TrackedResponse(b"nine-byte-trailer", chunk_size=3)
try:
    read_bounded_response(chunked, max_bytes=8)
except ResponseBodyTooLarge:
    pass
else:
    raise AssertionError("oversized chunked response was accepted")
assert chunked.offset == 9 and all(size >= 0 for size in chunked.read_sizes)

partial = TrackedResponse(b"safe", content_length="4", chunk_size=2)
assert read_bounded_response(partial, max_bytes=8) == b"safe"

ambiguous = TrackedResponse(b"not-read", content_length="4, 5")
try:
    read_bounded_response(ambiguous, max_bytes=8)
except ResponseBodyError:
    pass
else:
    raise AssertionError("ambiguous Content-Length was accepted")
assert not ambiguous.read_sizes

print("PASS: connector HTTP responses are bounded and fail closed")
