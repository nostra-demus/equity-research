process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { learnIdeaAdjustment } from '../src/news/ideas/idea-learning'
import type { SurfacedIdea } from '../src/news/ideas/ideas-store'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-learning-'))
const ideas: SurfacedIdea[] = []
for (let i = 0; i < 5; i++) {
  const sig = `SIG-${i}`
  const dir = path.join(root, 'screener', 'runs', sig)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'signal_payload.json'), JSON.stringify({ routing: 'PROMOTE' }))
  ideas.push({ idea_id: `IDEA-${String(i).padStart(12, '0')}`, promoted_signal_id: sig, direction: 'long', thesis_type: 'company_specific' } as SurfacedIdea)
}
const learned = learnIdeaAdjustment(root, ideas, { direction: 'long', thesisType: 'company_specific' })
assert.equal(learned.resolved, 5)
assert.equal(learned.positive, 5)
assert.equal(learned.adjustment, 4, 'five wins are shrunk rather than treated as certainty')
assert.equal(learned.basis, 'signal_and_human_feedback')

const tooSmall = learnIdeaAdjustment(root, ideas.slice(0, 4), { direction: 'long', thesisType: 'company_specific' })
assert.equal(tooSmall.adjustment, 0)
assert.equal(tooSmall.basis, 'not_enough_outcomes')

console.log('\n1 idea-learning test file passed')
