// chat-context: cross-swarm linked-dossier discovery (C-1). The PURE helpers are the core — given a run's
// own text + the OTHER swarms' committed subjects, which committed runs does it reference? This pins:
//  - matchLinkedSubjects: whole-word / case-insensitive / too-short safety, ranking, cap (NHY→ALUMINIUM);
//  - linkCandidatesBySwarm: self/peer exclusion keys on the SWARM, not the subject string (findings 1&2);
//  - isLinkableRun: only a COMPLETED, committed run is linkable (finding 3);
//  - toPosixPath: Windows backslash normalization for the run-root comparison (finding 4).
// Run: npx tsx test/chat-context.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// config reads env at import time; set harmless defaults BEFORE importing the module under test.
process.env.ENGINE_STATE_DIR = process.env.ENGINE_STATE_DIR || fs.mkdtempSync(path.join(os.tmpdir(), 'chatctx-'))
process.env.ENGINE_REPO_ROOT = process.env.ENGINE_REPO_ROOT || process.cwd()
const { matchLinkedSubjects, linkCandidatesBySwarm, isLinkableRun, toPosixPath } = await import('../src/chat-context')
const { runManifest } = await import('../src/outputs')

let passed = 0
const check = (name: string, fn: () => void) => { fn(); passed++ }
const cands = { commodity: ['ALUMINIUM', 'COPPER', 'GOLD', 'WHEAT'] }

// ---- matchLinkedSubjects: the whole-word matcher (no self-exclusion — that is the caller's job now) ----
check('NHY thesis text links ALUMINIUM (case-insensitive, whole-word, counts mentions)', () => {
  const text = 'Norsk Hydro is a vertically integrated aluminium producer; the LME aluminium price dominates earnings.'
  const m = matchLinkedSubjects(text, cands)
  assert.equal(m.length, 1)
  assert.equal(m[0].subject, 'ALUMINIUM')
  assert.equal(m[0].mentions, 2)
})
check('whole-word only — a substring does NOT match', () => {
  // "goldsmith" / "coppersmith" must not match GOLD / COPPER
  assert.equal(matchLinkedSubjects('the goldsmith sells coppersmith wares', cands).length, 0)
})
check('ranked by mention count, capped', () => {
  const text = 'copper copper copper wheat gold gold'
  const m = matchLinkedSubjects(text, { commodity: ['COPPER', 'WHEAT', 'GOLD'] }, 2)
  assert.deepEqual(m.map((x) => x.subject), ['COPPER', 'GOLD']) // copper 3, gold 2, wheat 1 → top 2
})
check('empty text or no candidates → no links', () => {
  assert.equal(matchLinkedSubjects('', cands).length, 0)
  assert.equal(matchLinkedSubjects('aluminium', {}).length, 0)
})
check('too-short subjects are skipped (whole-word false-match risk)', () => {
  assert.equal(matchLinkedSubjects('BG BG reported earnings', { research: ['BG'] }).length, 0)
})
check('a regex-special subject is matched literally, not as a pattern', () => {
  // a subject like "A.B" must be escaped so the "." is a literal dot, not "any char"
  const m = matchLinkedSubjects('the A.B index rose', { s: ['A.B'] })
  assert.equal(m.length, 1)
  assert.equal(matchLinkedSubjects('the AXB index rose', { s: ['A.B'] }).length, 0)
})

// ---- findings 1 & 2: self/peer exclusion keys on (swarm, run identity), NOT the bare subject string ----
check('finding 1 — a research run links the SAME-named commodity dossier (cross-swarm, different swarm)', () => {
  // research GOLD discussing gold MUST link commodity GOLD: the active (research) swarm is excluded, so
  // commodity GOLD stays a candidate and its name equalling the primary subject no longer self-excludes it.
  const subjectsBySwarm = { commodity: ['GOLD', 'COPPER', 'WHEAT'] }
  const candidatesBySwarm = linkCandidatesBySwarm('research', subjectsBySwarm)
  assert.deepEqual(candidatesBySwarm, { commodity: ['GOLD', 'COPPER', 'WHEAT'] })
  const m = matchLinkedSubjects('the gold price dominates earnings for this miner', candidatesBySwarm)
  assert.deepEqual(m.map((x) => x.subject), ['GOLD']) // GOLD kept even though it equals the primary name
})
check('finding 2 — a commodity run does NOT pull its OWN swarm peers (COPPER/WHEAT) it merely compares to', () => {
  // commodity GOLD comparing GOLD vs COPPER vs WHEAT must NOT link COPPER/WHEAT: they are the SAME swarm's
  // subjects, so the active (commodity) swarm is excluded entirely → no same-swarm cross-links.
  const subjectsBySwarm = { commodity: ['GOLD', 'COPPER', 'WHEAT'] }
  const candidatesBySwarm = linkCandidatesBySwarm('commodity', subjectsBySwarm)
  assert.deepEqual(candidatesBySwarm, {}) // its own swarm is the only source of these names → excluded
  const m = matchLinkedSubjects('gold outperformed copper and wheat this quarter', candidatesBySwarm)
  assert.equal(m.length, 0)
})
check('linkCandidatesBySwarm keeps genuinely foreign swarms while dropping only the source swarm', () => {
  const subjectsBySwarm = { commodity: ['GOLD'], screener: ['SIG-1'], research: ['GOLD'] }
  assert.deepEqual(linkCandidatesBySwarm('research', subjectsBySwarm), { commodity: ['GOLD'], screener: ['SIG-1'] })
  assert.deepEqual(linkCandidatesBySwarm('commodity', subjectsBySwarm), { screener: ['SIG-1'], research: ['GOLD'] })
})

// ---- finding 3: only a COMPLETED, committed run is linkable (a bare mid-pipeline folder is NOT) ----
check('isLinkableRun — a folder without a terminal marker is NOT linkable', () => {
  assert.equal(isLinkableRun({ decisionRecord: false, finalThesis: false }), false)
  assert.equal(isLinkableRun({}), false)
})
check('isLinkableRun — a decision_record.json OR final_thesis.md marks a run linkable', () => {
  assert.equal(isLinkableRun({ decisionRecord: true }), true)
  assert.equal(isLinkableRun({ finalThesis: true }), true)
})
check('finding 3 — the completion-marker FILE drives linkability through runManifest', () => {
  // A commodity run folder exists before its pipeline finishes; only writing decision_record.json (the
  // terminal marker) must flip it to linkable. Prove the marker file — not the folder — is the gate.
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'linkrun-'))
  const runRel = 'commodity/runs/GOLD'
  fs.mkdirSync(path.join(root, runRel, 'market-structure'), { recursive: true })
  fs.writeFileSync(path.join(root, runRel, 'market-structure', '99_market-structure-synthesis.md'), '# partial')
  const resolve = (p: string) => path.join(root, p)
  assert.equal(isLinkableRun(runManifest(runRel, resolve)), false) // bare/partial folder mid-pipeline
  fs.writeFileSync(path.join(root, runRel, 'decision_record.json'), '{}')
  assert.equal(isLinkableRun(runManifest(runRel, resolve)), true) // terminal marker present → linkable
})

// ---- finding 4: run-root comparison must survive Windows backslash paths ----
check('toPosixPath — backslashes become forward slashes; forward-slash paths are unchanged', () => {
  assert.equal(toPosixPath('commodity\\runs\\GOLD'), 'commodity/runs/GOLD')
  assert.equal(toPosixPath('commodity/runs/GOLD'), 'commodity/runs/GOLD')
})
check('finding 4 — normalized paths make the equality + prefix logic hold across platforms', () => {
  const winRr = 'commodity\\runs\\GOLD'
  const posixPrimary = 'commodity/runs/GOLD'
  assert.equal(toPosixPath(winRr) === toPosixPath(posixPrimary), true) // rr === primaryRunRoot now holds
  const synthRel = 'commodity/runs/GOLD/market-structure/99_market-structure-synthesis.md'
  assert.equal(synthRel.startsWith(toPosixPath(winRr) + '/'), true) // survivor filter now matches
})

console.log(`chat-context.test.ts: ${passed} assertions passed`)
