import assert from 'node:assert/strict'

process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

const { screenerBoard } = await import('../src/screener')
const board = screenerBoard() as any

assert.ok(board && typeof board === 'object')
assert.ok(Array.isArray(board.ideas), 'the deployed board always projects the news-lead lane explicitly')
assert.equal(board.ideas_health?.schema_version, 'ideas-health/v1')
assert.equal(board.qualified_ideas?.schema_version, 'qualified-ideas-board/v1')
assert.equal(board.qualified_ideas?.ranking_policy_version, 'ideas-ranking/calibration-shrinkage-v1')
assert.equal(board.qualified_ideas?.policy_version, 'ideas-policy/precal-v1')
assert.ok(Array.isArray(board.qualified_ideas?.qualified))
assert.ok(Array.isArray(board.qualified_ideas?.needs_research))
assert.ok(Array.isArray(board.qualified_ideas?.does_not_clear))
assert.ok(Array.isArray(board.qualified_ideas?.not_assessable))
assert.ok(['no_artifacts', 'publishing', 'none_clear', 'qualified', 'invalid_artifacts', 'storage_error'].includes(board.qualified_ideas?.health?.outcome))

console.log('ideas board contract: live projection lanes and health schemas passed')
