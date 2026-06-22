// The launcher must never write a schema-INVALID input_nature into intake.json. A cockpit "Run the
// checks" on a Reddit row forwards input_nature 'social_discussion' (the `social` tier, approved-domains.ts),
// which is deliberately NOT in the Phase 0.1 intake contract (frameworks/screener/intake.schema.json) —
// reddit.com is on the ingestion firewall but off the Gate-0 promotion list (CLAUDE.md §4/§24). Writing it
// verbatim makes the run schema-invalid instead of cleanly failing Gate 0 as an off-list source.
// Expected values are PINNED to the schema enum (read at test time), never to current code.
// Run: npx tsx test/intake-input-nature.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sanitizeIntakeInputNature } from '../src/launcher'

const here = path.dirname(fileURLToPath(import.meta.url))
const SCHEMA = path.join(here, '..', '..', '..', 'frameworks', 'screener', 'intake.schema.json')
const schemaEnum: string[] = JSON.parse(fs.readFileSync(SCHEMA, 'utf8')).properties.input_nature.enum

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

check("premise: 'social_discussion' is NOT a valid intake input_nature (the bug it would smuggle in)", () => {
  assert.ok(!schemaEnum.includes('social_discussion'), 'schema enum must not contain social_discussion')
})

check("a Reddit 'social_discussion' row is normalized to a schema-valid nature (off-list source preserved separately)", () => {
  // isHuman=false: a Reddit row always carries source_name/source_url (reddit.com), so Gate 0 still
  // rejects it off-list; we only fix the nature label so intake.json validates.
  const out = sanitizeIntakeInputNature('social_discussion', false)
  assert.ok(schemaEnum.includes(out), `sanitized nature "${out}" must be in the schema enum`)
  assert.equal(out, 'news_headline')
})

check('every schema-valid input_nature passes through unchanged', () => {
  for (const v of schemaEnum) {
    assert.equal(sanitizeIntakeInputNature(v, false), v, `valid nature ${v} must pass through`)
    assert.equal(sanitizeIntakeInputNature(v, true), v, `valid nature ${v} must pass through (isHuman)`)
  }
})

check('an unset/unknown nature falls back by isHuman (unchanged behaviour for the non-social paths)', () => {
  assert.equal(sanitizeIntakeInputNature(undefined, true), 'human_prompt')
  assert.equal(sanitizeIntakeInputNature(undefined, false), 'news_headline')
  assert.equal(sanitizeIntakeInputNature('totally_made_up', false), 'news_headline')
})

console.log(`\n${passed} checks passed`)
