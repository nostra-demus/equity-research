#!/usr/bin/env node
process.env.NOSTRA_FIXTURE_PROVIDER = 'codex'
await import('./fake-provider-runtime.mjs')
