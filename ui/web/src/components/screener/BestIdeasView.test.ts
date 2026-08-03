import assert from 'node:assert/strict'
import { leadEmptyMessage } from './BestIdeasView'

const honest = leadEmptyMessage({ status: 'healthy', outcome: 'success_empty', reason: 'No leads passed.' })
assert.equal(honest, 'The provider pass completed successfully and returned no leads.')

const degraded = leadEmptyMessage({ status: 'degraded', outcome: 'success_empty', reason: 'The snapshot store is invalid.' })
assert.equal(degraded, 'The snapshot store is invalid.', 'a degraded pass cannot use honest-empty copy')

const failed = leadEmptyMessage({ status: 'error', outcome: 'failed', reason: 'The provider output was malformed.' })
assert.equal(failed, 'The provider output was malformed.')

console.log('BestIdeasView empty-state truth test passed')
