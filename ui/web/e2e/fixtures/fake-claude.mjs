#!/usr/bin/env node
process.env.NOSTRA_FIXTURE_PROVIDER = 'claude'
await import('./fake-provider-runtime.mjs')
