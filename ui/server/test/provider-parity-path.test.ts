import assert from 'node:assert/strict'
import { PARITY_CANARY_RUN_ROOT_RE, parityCanaryRootBasenameMatches } from '../src/provider-parity-path'

const canonical = 'analyses/provider-parity/2026-08-25/codex/AMZN_2026-08-25'
const retry = `${canonical}__attempt-9a2a6d40`

assert.match(canonical, PARITY_CANARY_RUN_ROOT_RE)
assert.match(retry, PARITY_CANARY_RUN_ROOT_RE)
assert.equal(parityCanaryRootBasenameMatches('AMZN_2026-08-25', 'AMZN', '2026-08-25'), true)
assert.equal(parityCanaryRootBasenameMatches('AMZN_2026-08-25__attempt-9a2a6d40', 'AMZN', '2026-08-25'), true)

for (const invalid of [
  `${canonical}__attempt-2`,
  `${canonical}__attempt-9A2A6D40`,
  `${canonical}__attempt-9a2a6d40/extra`,
  `${canonical}_attempt-9a2a6d40`,
]) assert.doesNotMatch(invalid, PARITY_CANARY_RUN_ROOT_RE)

for (const invalid of [
  'AMZN_2026-08-25__attempt-2',
  'AMZN_2026-08-25__attempt-9A2A6D40',
  'AMZN_2026-08-24__attempt-9a2a6d40',
  'MSFT_2026-08-25__attempt-9a2a6d40',
]) assert.equal(parityCanaryRootBasenameMatches(invalid, 'AMZN', '2026-08-25'), false)

console.log('✓ provider-parity canary retries use a separate immutable attempt root')
