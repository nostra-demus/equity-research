// data-needs.ts (readDataNeeds) — the strict-write / tolerant-labelled-read split. Structural defects
// (tier / cadence / need_id / missing series or source name) still DROP; an off-enum
// suggested_source.acquisition alone is KEPT with the closed sentinel 'unrecognized' + a widened audit
// note — dropping the whole card silenced the demand signal the dock exists to surface (the committed
// ALUMINIUM record's two needs are the real-repo regression). Enum fixtures run in a SUBPROCESS against
// a tmpdir repo (REPO_ROOT freezes at config import — wire-manifest.test.ts constraint).
// Run: npx tsx test/data-needs.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readDataNeeds } from '../src/data-needs'
import { dataNeedFingerprint } from '../src/pipeline-store'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const here = path.dirname(fileURLToPath(import.meta.url))
const tmpdirs: string[] = []
const tmp = (prefix: string) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), prefix)); tmpdirs.push(d); return d }

function probeDataNeeds(repo: string, subject = 'AAA', swarm = 'fixswarm', runRoot?: string, publishedRef?: string): any {
  const probe = path.join(repo, `probe-${subject}-${Math.random().toString(16).slice(2)}.ts`)
  const src = path.resolve(here, '..', 'src', 'data-needs')
  fs.writeFileSync(probe, [
    `import { readDataNeeds } from ${JSON.stringify(src)}`,
    `console.log(JSON.stringify(readDataNeeds(${JSON.stringify(swarm)}, ${JSON.stringify(subject)}, ${JSON.stringify(runRoot)})))`,
    '',
  ].join('\n'))
  const tsx = path.join(here, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
  const r = spawnSync(tsx, [probe], {
    encoding: 'utf8',
    env: {
      ...process.env, ENGINE_REPO_ROOT: repo, ENGINE_STATE_DIR: path.join(repo, '.state'),
      // Fixture repositories have no remote. HEAD is their explicit shared-authority seam; production
      // continues to use origin/main and rejects unpushed correction sidecars.
      ENGINE_PUBLISHED_GIT_REF: publishedRef || 'HEAD',
      ENGINE_ACTIVITY_LOG_DISABLED: '1',
    },
  })
  assert.equal(r.status, 0, `probe subprocess failed: ${r.stderr || r.error}`)
  const lines = r.stdout.trim().split('\n')
  return JSON.parse(lines[lines.length - 1])
}

function writeFixtureSwarm(repo: string) {
  const swarmDir = path.join(repo, '.claude', 'agents', 'fixswarm')
  fs.mkdirSync(path.join(swarmDir, 'moda'), { recursive: true })
  fs.writeFileSync(path.join(swarmDir, 'SWARM.md'),
    '---\nid: fixswarm\nrun_root_template: fixswarm/runs/{X}\nplaceholder: X\nruns_root: fixswarm/runs\n---\n\nfixture swarm\n')
  fs.writeFileSync(path.join(swarmDir, 'moda', '01_alpha.md'),
    '---\nname: fixswarm-moda-alpha\nlayer: 1\n---\n\nfixture alpha orb\n')
  fs.writeFileSync(path.join(swarmDir, 'moda', '02_beta.md'),
    '---\nname: fixswarm-moda-beta\nlayer: 1\n---\n\nfixture beta orb\n')
  fs.writeFileSync(path.join(swarmDir, 'moda', '99_moda-synthesis.md'),
    '---\nname: fixswarm-moda-synthesis\nlayer: 99\n---\n\nfixture module synthesis\n')
}

function writeResearchRoster(repo: string) {
  const moduleDir = path.join(repo, '.claude', 'agents', 'moda')
  fs.mkdirSync(moduleDir, { recursive: true })
  fs.writeFileSync(path.join(moduleDir, '01_alpha.md'),
    '---\nname: research-moda-alpha\nlayer: 1\n---\n\nfixture alpha orb\n')
  fs.writeFileSync(path.join(moduleDir, '99_moda-synthesis.md'),
    '---\nname: research-moda-synthesis\nlayer: 99\n---\n\nfixture synthesis\n')
}

// ---- the REAL repo record ----
// #286 corrected the two suggested_source.acquisition values in the committed ALUMINIUM
// decision_record.json to the schema enum (vendor_or_paid_feed -> paid_api, free_public_data ->
// scrape) - both entries now pass through readDataNeeds untouched, with no widened keep-and-label
// note. The off-enum keep-and-label path itself is still exercised by the tmpdir fixture below.
check("real repo: ALUMINIUM's two needs surface with their schema-valid acquisition values", () => {
  const read = readDataNeeds('commodity', 'ALUMINIUM')
  assert.ok(read, 'no ALUMINIUM decision_record read')
  const ids = read!.needs.map((n) => n.need_id).sort()
  assert.deepEqual(ids, ['lme-cotr-fund-positioning', 'shfe-exchange-stock-current'])
  const by = (id: string) => read!.needs.find((n) => n.need_id === id)
  assert.equal(by('lme-cotr-fund-positioning')?.suggested_source.acquisition, 'paid_api')
  assert.equal(by('shfe-exchange-stock-current')?.suggested_source.acquisition, 'scrape')
  const kept = read!.widened.filter((w) => w.includes('kept, labelled unrecognized'))
  assert.equal(kept.length, 0, `expected no keep-and-label notes now both acquisitions are in-enum, got: ${JSON.stringify(read!.widened)}`)
})

// ---- enum semantics against a tmpdir fixture swarm ----
check('fixture: valid passes untouched; off-enum acquisition kept+labelled; tier/cadence/need_id defects still drop', () => {
  const repo = tmp('dataneeds-')
  const swarmDir = path.join(repo, '.claude', 'agents', 'fixswarm')
  fs.mkdirSync(path.join(swarmDir, 'moda'), { recursive: true })
  fs.writeFileSync(path.join(swarmDir, 'SWARM.md'),
    '---\nid: fixswarm\nrun_root_template: fixswarm/runs/{X}\nplaceholder: X\n---\n\nfixture swarm\n')
  fs.writeFileSync(path.join(swarmDir, 'moda', '99_moda-synthesis.md'),
    '---\nname: fixswarm-moda-synthesis\nlayer: 99\n---\n\nfixture module synthesis\n')
  const runDir = path.join(repo, 'fixswarm', 'runs', 'AAA')
  fs.mkdirSync(runDir, { recursive: true })
  const base = {
    series: 'a series', why_it_caps: 'caps', filing_required: false, entry_modules: ['moda'],
    suggested_source: { name: 'Body', acquisition: 'official_api' }, tier: 5, cadence: 'weekly',
  }
  fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify({
    decision_date: '2026-08-13',
    data_needs: [
      { ...base, need_id: 'valid-need' },
      { ...base, need_id: 'twelve-hourly-need', cadence: 'twelve_hourly' },
      { ...base, need_id: 'quarterly-need', cadence: 'quarterly' },
      { ...base, need_id: 'semiannual-need', cadence: 'semiannual' },
      { ...base, need_id: 'annual-need', cadence: 'annual' },
      { ...base, need_id: 'offenum-acq', suggested_source: { name: 'Body', acquisition: 'vendor_or_paid_feed' } },
      { ...base, need_id: 'bad-tier', tier: 3 },
      { ...base, need_id: 'bad-cadence', cadence: 'sometimes' },
      { ...base, need_id: 'BAD ID!' },
    ],
  }))
  const probe = path.join(repo, 'probe.ts')
  const src = path.resolve(here, '..', 'src', 'data-needs')
  fs.writeFileSync(probe, [
    `import { readDataNeeds } from ${JSON.stringify(src)}`,
    `console.log(JSON.stringify(readDataNeeds('fixswarm', 'AAA')))`,
    '',
  ].join('\n'))
  const tsx = path.join(here, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
  const r = spawnSync(tsx, [probe], {
    encoding: 'utf8',
    env: { ...process.env, ENGINE_REPO_ROOT: repo, ENGINE_ACTIVITY_LOG_DISABLED: '1' },
  })
  assert.equal(r.status, 0, `probe subprocess failed: ${r.stderr || r.error}`)
  const lines = r.stdout.trim().split('\n')
  const read = JSON.parse(lines[lines.length - 1])
  assert.ok(read, 'fixture record not read')

  const by = (id: string) => read.needs.find((n: any) => n.need_id === id)
  assert.equal(by('valid-need')?.suggested_source.acquisition, 'official_api', 'a valid enum passes untouched')
  for (const id of ['twelve-hourly-need', 'quarterly-need', 'semiannual-need', 'annual-need']) {
    assert.ok(by(id), `${id} must survive the data-needs reader`)
  }
  assert.equal(by('offenum-acq')?.suggested_source.acquisition, 'unrecognized', 'off-enum acquisition kept + sentinel')
  assert.ok(read.widened.some((w: string) => w.includes("acquisition 'vendor_or_paid_feed'") && w.includes('kept')),
    `widened must audit the raw value: ${JSON.stringify(read.widened)}`)
  assert.equal(by('bad-tier'), undefined, 'off-enum tier still drops')
  assert.equal(by('bad-cadence'), undefined, 'off-enum cadence still drops')
  assert.ok(!read.needs.some((n: any) => n.need_id === 'BAD ID!'), 'bad need_id still drops')
  assert.equal(read.needs.length, 6)
})

check('fixture: v2 preserves frozen routes, marks renamed orbs historical, derives only current modules, and keeps confidence boundaries', () => {
  const repo = tmp('dataneeds-v2-')
  writeFixtureSwarm(repo)
  const runDir = path.join(repo, 'fixswarm', 'runs', 'AAA')
  fs.mkdirSync(runDir, { recursive: true })
  const source = { name: 'Official body', acquisition: 'official_api', access: 'public', licensing_basis: 'Publisher access page; not independently verified' }
  fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify({
    decision_date: '2026-08-14', data_needs_schema_version: '2.0',
    data_needs: [
      {
        need_id: 'first', priority: 1, series: 'First series', why_it_caps: 'Leaves the margin case unresolved.',
        expected_impact: { if_supportive: 'Would support the margin premise.', if_adverse: 'Would weaken the margin premise.' },
        filing_required: false,
        entry_orbs: [{ module: 'moda', agent: 'fixswarm-moda-beta', why: 'Tests margins.', confidence: 1 }],
        suggested_source: { ...source, acquisition: 'scrape' }, tier: 9, cadence: 'monthly',
      },
      {
        need_id: 'second', priority: 2, series: 'Second series', why_it_caps: 'Leaves the adverse case unresolved.',
        expected_impact: { if_supportive: 'Would support the volume premise.', if_adverse: 'Would weaken the volume premise.' },
        filing_required: false,
        entry_orbs: [
          { module: 'moda', agent: 'fixswarm-moda-alpha', why: 'Tests revenue volume.', confidence: 0 },
          { confidence: 0.4, why: 'Same route with changed prose and confidence.', agent: 'fixswarm-moda-alpha', module: 'moda' },
          { module: 'moda', agent: 'invented-agent', why: 'Hallucinated.', confidence: 0.8 },
          { module: 'ghost', agent: 'ghost-agent', why: 'Hallucinated module.', confidence: 0.5 },
          { module: 'moda', agent: 'fixswarm-moda-beta', why: 'Bad confidence.', confidence: 1.01 },
        ],
        suggested_source: source, tier: 5, cadence: 'weekly', next_release: '2026-08-31',
      },
    ],
  }))
  const read = probeDataNeeds(repo)
  assert.equal(read.data_needs_schema_version, '2.0')
  assert.deepEqual(read.needs.map((need: any) => [need.need_id, need.priority]), [['first', 1], ['second', 2]])
  assert.deepEqual(read.needs[1].entry_orbs, [
    { module: 'moda', agent: 'fixswarm-moda-alpha', why: 'Tests revenue volume.', confidence: 0, route_status: 'current' },
    { module: 'moda', agent: 'invented-agent', why: 'Hallucinated.', confidence: 0.8, route_status: 'historical' },
    { module: 'ghost', agent: 'ghost-agent', why: 'Hallucinated module.', confidence: 0.5, route_status: 'historical' },
  ])
  assert.deepEqual(read.needs[1].entry_modules, ['moda'], 'module projection must derive from admitted orbs')
  assert.equal(read.needs[0].entry_orbs[0].confidence, 1)
  assert.equal(read.needs[0].entry_orbs[0].route_status, 'current')
  assert.deepEqual(read.needs[0].suggested_source, { ...source, acquisition: 'scrape' })
  assert.ok(read.widened.some((line: string) => line.includes("invented-agent") && line.includes('historical')))
  assert.ok(read.widened.some((line: string) => line.includes("ghost/ghost-agent") && line.includes('historical')))
  assert.ok(read.widened.filter((line: string) => line.includes("fixswarm-moda-alpha")).length >= 1,
    'the same module/agent route must be de-duplicated even when prose or confidence differ')
})

check('fixture: v2 is exact and global priority gaps fail the full set closed', () => {
  const repo = tmp('dataneeds-v2-invalid-')
  writeFixtureSwarm(repo)
  const runDir = path.join(repo, 'fixswarm', 'runs', 'AAA')
  fs.mkdirSync(runDir, { recursive: true })
  const need = (need_id: string, priority: number, sourceExtra = {}) => ({
    need_id, priority, series: `Series ${need_id}`, why_it_caps: 'Leaves a decision branch unresolved.',
    expected_impact: { if_supportive: 'Would support the premise.', if_adverse: 'Would weaken the premise.' },
    filing_required: false,
    entry_orbs: [{ module: 'moda', agent: 'fixswarm-moda-alpha', why: 'Tests the premise.', confidence: 0.7 }],
    suggested_source: {
      name: 'Official body', acquisition: 'official_api', access: 'public', licensing_basis: 'Unknown', ...sourceExtra,
    },
    tier: 5, cadence: 'weekly',
  })
  fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify({
    decision_date: '2026-08-14', data_needs_schema_version: '2.0',
    data_needs: [need('one', 1), need('three', 3, { licensing: 'legacy field is forbidden' })],
  }))
  const read = probeDataNeeds(repo)
  assert.deepEqual(read.needs, [], 'invalid exact source plus priority gap must serve no partial v2 set')
  assert.ok(read.widened.some((line: string) => line.includes('priorities must be unique and contiguous')))
  assert.ok(read.widened.some((line: string) => line.includes('invalid v2 priority, impact, source hint')))

  fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify({
    decision_date: '2026-08-14', data_needs_schema_version: '2.0',
    data_needs: [need('second-authored-first', 2), need('first-authored-second', 1)],
  }))
  const outOfOrder = probeDataNeeds(repo)
  assert.deepEqual(outOfOrder.needs, [], 'out-of-order authored priorities must fail closed, not be repaired')
  assert.ok(outOfOrder.widened.some((line: string) => line.includes('priorities must be unique and contiguous')))
})

check('fixture: v2 runtime rejects hidden URLs, URI schemes, arbitrary domains, and promised conviction lifts', () => {
  const repo = tmp('dataneeds-v2-language-')
  writeFixtureSwarm(repo)
  const runDir = path.join(repo, 'fixswarm', 'runs', 'AAA')
  fs.mkdirSync(runDir, { recursive: true })
  fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify({
    decision_date: '2026-08-14', data_needs_schema_version: '2.0',
    data_needs: [{
      need_id: 'unsafe-language', priority: 1, series: 'Daily units',
      why_it_caps: 'Getting this will raise conviction by 10 points.',
      expected_impact: { if_supportive: 'Would support the premise.', if_adverse: 'Would weaken the premise.' },
      filing_required: false,
      entry_orbs: [{ module: 'moda', agent: 'fixswarm-moda-alpha', why: 'Read https://hidden.example.com first.', confidence: 0.7 }],
      suggested_source: {
        name: 'Official body', acquisition: 'official_api', access: 'public', licensing_basis: 'Unknown',
      },
      tier: 5, cadence: 'daily',
    }],
  }))
  const read = probeDataNeeds(repo)
  assert.deepEqual(read.needs, [])
  assert.ok(read.widened.some((line: string) => line.includes('contains a URL or promises')))

  for (const hiddenUrl of [
    'Read ftp://files.vendor.test/feed first.', 'Load s3://bucket/key.', 'Try source.vendor.xyz/data.',
    'Try 192.0.2.1/data.', 'Try 10.0.0.1:8080/path.',
  ]) {
    const unsafe = {
      need_id: 'unsafe-url', priority: 1, series: 'Daily units', why_it_caps: 'Leaves supply unresolved.',
      expected_impact: { if_supportive: 'Would support the premise.', if_adverse: 'Would weaken the premise.' },
      filing_required: false,
      entry_orbs: [{ module: 'moda', agent: 'fixswarm-moda-alpha', why: hiddenUrl, confidence: 0.7 }],
      suggested_source: {
        name: 'Official body', acquisition: 'official_api', access: 'public', licensing_basis: 'Unknown',
      },
      tier: 5, cadence: 'daily',
    }
    fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify({
      decision_date: '2026-08-14', data_needs_schema_version: '2.0', data_needs: [unsafe],
    }))
    assert.deepEqual(probeDataNeeds(repo).needs, [], `must reject hidden URL-like value: ${hiddenUrl}`)
  }
})

check('fixture: v2 promise checks are decision-specific and do not reject ordinary domain language', () => {
  const repo = tmp('dataneeds-v2-domain-language-')
  writeFixtureSwarm(repo)
  const runDir = path.join(repo, 'fixswarm', 'runs', 'AAA')
  fs.mkdirSync(runDir, { recursive: true })
  const need = (need_id: string, priority: number, why_it_caps: string) => ({
    need_id, priority, series: `Series ${need_id}`, why_it_caps,
    expected_impact: { if_supportive: 'Would support the supply premise.', if_adverse: 'Would weaken the supply premise.' },
    filing_required: false,
    entry_orbs: [{ module: 'moda', agent: 'fixswarm-moda-alpha', why: 'Tests the supply premise.', confidence: 0.7 }],
    suggested_source: {
      name: 'Official body', acquisition: 'official_api', access: 'public', licensing_basis: 'Unknown',
    },
    tier: 5, cadence: 'weekly',
  })
  for (const safe of [
    'Whether the OPEC production cap will increase remains unresolved.',
    'rating will improve after debt repayment',
    'The decision depends on certain filed data.',
    'Certain evidence required for the rating is unavailable.',
    'The action depends on certain production assumptions.',
    'The survey reports a 95% confidence interval.',
    'The estimate needs a 90 percent confidence interval.',
    'The survey reports a 95% confidence level.',
    'Consumer confidence rose by 10%.',
    'Business confidence rises from 40 to 60.',
    'The supplier guarantees data quality.',
    'The exchange guarantees settlement.',
    'The vendor guarantees credit rating data completeness.',
    'The source promises timely credit rating updates.',
    'The provider assures complete rating-history coverage.',
    'The supplier guarantees an upgrade to the API.',
    'The vendor guarantees return-field completeness.',
    'The print confirms the production estimate.',
    'The regulation forces supplier closure.',
  ]) {
    fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify({
      decision_date: '2026-08-14', data_needs_schema_version: '2.0',
      data_needs: [need('safe-domain-language', 1, safe)],
    }))
    assert.deepEqual(probeDataNeeds(repo).needs.map((n: any) => n.need_id), ['safe-domain-language'],
      `must accept ordinary domain language: ${safe}`)
  }

  for (const unsafe of [
    'Supportive evidence raises conviction.',
    'Supportive evidence improves the rating.',
    'Supportive evidence upgrades the rating to Buy.',
    'Supportive evidence would guarantee a Buy rating.',
    'Supportive evidence would upgrade the rating to Buy.',
    'Buy is guaranteed.',
    'This provides 99.9% confidence.',
    'We can be 100 percent confident.',
    'This implies confidence of 100%.',
    'This would provide 100% confidence in the call.',
    'This ensures an upgrade.',
    'This evidence would strengthen conviction.',
    'This evidence would enhance confidence.',
    'This evidence makes the call certain.',
    'This evidence gives complete confidence.',
    'This evidence implies 1.0 confidence.',
    'This evidence guarantees the conclusion.',
    'This evidence guarantees the thesis.',
    'This evidence guarantees the investment case.',
    'This evidence guarantees the bull case.',
    'This evidence makes the thesis certain.',
    'This evidence makes us fully confident.',
    'This evidence removes all uncertainty.',
    'This evidence would leave no doubt about the call.',
    'This evidence guarantees upside.',
    'This evidence guarantees positive returns.',
    'This evidence guarantees outperformance.',
    'This evidence guarantees the price target.',
    'This evidence guarantees a profit.',
    'This evidence promises alpha.',
    'This evidence guarantees a rally.',
    'This evidence makes gains certain.',
    'This evidence means there is no downside.',
    'This evidence proves the bull case.',
    'This evidence confirms the Buy thesis.',
    'This evidence locks in a Buy.',
    'This evidence forces a Buy.',
    'This evidence compels an upgrade.',
    'This evidence automatically makes it a Buy.',
    'This evidence means we must Buy.',
    'The result would create 100% confidence.',
    'The result would lift conviction by 10 points.',
  ]) {
    fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify({
      decision_date: '2026-08-14', data_needs_schema_version: '2.0', data_needs: [need('unsafe', 1, unsafe)],
    }))
    assert.deepEqual(probeDataNeeds(repo).needs, [], `must reject promised decision language: ${unsafe}`)
  }
})

check('fixture: v2 next_release cannot predate the decision while v1 remains unchanged', () => {
  const repo = tmp('dataneeds-v2-release-date-')
  writeFixtureSwarm(repo)
  const runDir = path.join(repo, 'fixswarm', 'runs', 'AAA')
  fs.mkdirSync(runDir, { recursive: true })
  const v2Need = {
    need_id: 'release', priority: 1, series: 'Release series', why_it_caps: 'Leaves timing unresolved.',
    expected_impact: { if_supportive: 'Would support the premise.', if_adverse: 'Would weaken the premise.' },
    filing_required: false,
    entry_orbs: [{ module: 'moda', agent: 'fixswarm-moda-alpha', why: 'Tests the premise.', confidence: 0.7 }],
    suggested_source: {
      name: 'Official body', acquisition: 'official_api', access: 'public', licensing_basis: 'Unknown',
    },
    tier: 5, cadence: 'weekly', next_release: '2026-08-13',
  }
  fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify({
    decision_date: '2026-08-14', data_needs_schema_version: '2.0', data_needs: [v2Need],
  }))
  assert.deepEqual(probeDataNeeds(repo).needs, [], 'a stale v2 next_release must be rejected')

  const { priority: _priority, expected_impact: _impact, entry_orbs: _orbs, ...legacyShape } = v2Need
  fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify({
    decision_date: '2026-08-13',
    data_needs: [{
      ...legacyShape, entry_modules: ['moda'],
      suggested_source: { name: 'Official body', acquisition: 'official_api', licensing: 'legacy hint' },
      next_release: '2026-08-12',
    }],
  }))
  assert.equal(probeDataNeeds(repo).needs[0].next_release, '2026-08-12', 'legacy date semantics stay unchanged')
})

check('fixture: unknown versions and fresh missing discriminators fail closed; pre-gate v1 stays readable', () => {
  const repo = tmp('dataneeds-version-')
  writeFixtureSwarm(repo)
  const runDir = path.join(repo, 'fixswarm', 'runs', 'AAA')
  fs.mkdirSync(runDir, { recursive: true })
  const legacy = {
    need_id: 'legacy', series: 'Legacy series', why_it_caps: 'caps', filing_required: false,
    entry_modules: ['moda'], suggested_source: { name: 'Body', acquisition: 'official_api', licensing: 'legacy hint' },
    tier: 5, cadence: 'weekly',
  }
  fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify({
    decision_date: '2026-08-14', data_needs_schema_version: '3.0', data_needs: [legacy],
  }))
  assert.equal(probeDataNeeds(repo), null, 'an explicit unknown version must fail closed')

  fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify({
    decision_date: '2026-08-14', data_needs: [legacy],
  }))
  const unpublishedProjection = probeDataNeeds(repo)
  assert.equal(unpublishedProjection.needs[0].need_id, 'legacy',
    'a mutable non-research projection cannot use decision_date alone as publication evidence')

  const publish = (record: Record<string, any>) => {
    fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify(record))
    const archiveDir = path.join(runDir, 'decisions', record.decision_id)
    fs.mkdirSync(archiveDir, { recursive: true })
    fs.writeFileSync(path.join(archiveDir, 'decision_record.json'), JSON.stringify(record))
  }
  const archivedLegacy = {
    decision_id: 'CMD-AAA-2026-08-13-aaaaaaaaaaaa', decision_date: '2026-08-13', data_needs: [legacy],
  }
  publish(archivedLegacy)
  assert.equal(probeDataNeeds(repo).needs[0].need_id, 'legacy',
    'a matching immutable pre-cutoff archive remains readable as v1')

  publish({
    decision_id: 'CMD-AAA-2026-08-14-bbbbbbbbbbbb', decision_date: '2026-08-14', data_needs: [legacy],
  })
  const archivedFreshMissingVersion = probeDataNeeds(repo)
  assert.deepEqual(archivedFreshMissingVersion.needs, [])
  assert.ok(archivedFreshMissingVersion.widened.some((line: string) => line.includes('2.0 is required')),
    'a matching immutable post-cutoff archive missing the v2 discriminator fails closed')

  publish({
    decision_id: 'CMD-AAA-2026-08-13-cccccccccccc', decision_date: '2026-08-13',
    data_needs_schema_version: '2.0',
    data_needs: [{
      need_id: 'explicit-v2', priority: 1, series: 'Explicit v2 series',
      why_it_caps: 'Leaves the relevant premise unresolved.',
      expected_impact: { if_supportive: 'Would support the premise.', if_adverse: 'Would weaken the premise.' },
      filing_required: false,
      entry_orbs: [{ module: 'moda', agent: 'fixswarm-moda-alpha', why: 'Tests the premise.', confidence: 0.7 }],
      suggested_source: { name: 'Official body', acquisition: 'official_api', access: 'public', licensing_basis: 'Publisher access terms' },
      tier: 5, cadence: 'weekly',
    }],
  })
  assert.equal(probeDataNeeds(repo).needs[0].need_id, 'explicit-v2',
    'an explicit v2 discriminator remains authoritative on an old-date rerun')

  const researchDir = path.join(repo, 'analyses', 'AAA_2026-08-14')
  fs.mkdirSync(researchDir, { recursive: true })
  fs.writeFileSync(path.join(researchDir, 'decision_record.json'), JSON.stringify({
    decision_date: '2026-08-13', data_needs: [legacy],
  }))
  const publishedFresh = probeDataNeeds(repo, 'AAA', 'research')
  assert.deepEqual(publishedFresh.needs, [])
  assert.ok(publishedFresh.widened.some((line: string) => line.includes('2.0 is required')))

  fs.rmSync(researchDir, { recursive: true, force: true })
  fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify({ decision_date: '2026-08-13', data_needs: [legacy] }))
  const statePipeline = path.join(repo, '.state', 'pipeline')
  fs.mkdirSync(statePipeline, { recursive: true })
  const sourceId = 'PIPE-20260813-aaaaaaaa'
  fs.writeFileSync(path.join(statePipeline, 'pipeline.ndjson'), [
    {
      pipeline_id: sourceId, kind: 'pipeline_source', subject: 'AAA', swarm: 'fixswarm', need_id: 'legacy',
      run_root: 'fixswarm/runs/AAA', decision_fingerprint: 'sha256:' + 'a'.repeat(64),
      series_hint: 'Legacy series', source_url: 'https://public.example.com/legacy', source_kind: 'api',
      sample: '', note: '', user_id: 'u', submitted_at: '2026-08-13T10:00:00Z',
    },
    {
      pipeline_id: 'PIPE-20260813-bbbbbbbb', kind: 'pipeline_lookup', subject: 'AAA', swarm: 'fixswarm',
      need_id: 'legacy', need_fingerprint: dataNeedFingerprint('legacy', 'Legacy series'),
      run_root: 'fixswarm/runs/AAA', decision_fingerprint: 'sha256:' + 'a'.repeat(64),
      lookup_started_at: '2026-08-13T10:00:00.000Z',
      lookup_status: 'public_link_found', public_url: 'https://public.example.com/legacy', lookup_note: 'found',
      source_pipeline_id: sourceId, user_id: 'u', submitted_at: '2026-08-13T10:01:00Z',
    },
  ].map((row) => JSON.stringify(row)).join('\n') + '\n')
  const old = probeDataNeeds(repo)
  assert.equal(old.data_needs_schema_version, undefined)
  assert.deepEqual(old.needs[0].entry_modules, ['moda'])
  assert.equal(old.needs[0].suggested_source.licensing, 'legacy hint')
  assert.equal(old.needs[0].priority, undefined)
  assert.equal(old.needs[0].source_lookup, undefined,
    'an old lookup that was not scoped to this exact decision fingerprint must not attach')
})

check('fixture: research defaults to the standing completed call and an exact historical run overrides it', () => {
  const repo = tmp('dataneeds-selected-run-')
  const moduleDir = path.join(repo, '.claude', 'agents', 'moda')
  fs.mkdirSync(moduleDir, { recursive: true })
  fs.writeFileSync(path.join(moduleDir, '01_alpha.md'),
    '---\nname: research-moda-alpha\nlayer: 1\n---\n\nfixture alpha orb\n')
  fs.writeFileSync(path.join(moduleDir, '99_moda-synthesis.md'),
    '---\nname: research-moda-synthesis\nlayer: 99\n---\n\nfixture module synthesis\n')
  const source = { name: 'Official body', acquisition: 'official_api', access: 'public', licensing_basis: 'Unknown' }
  const record = (need_id: string, series: string, date: string) => ({
    decision_date: date, data_needs_schema_version: '2.0',
    data_needs: [{
      need_id, priority: 1, series, why_it_caps: 'Leaves the premise unresolved.',
      expected_impact: { if_supportive: 'Would support the premise.', if_adverse: 'Would weaken the premise.' },
      filing_required: false,
      entry_orbs: [{ module: 'moda', agent: 'research-moda-alpha', why: 'Tests the premise.', confidence: 0.7 }],
      suggested_source: source, tier: 5, cadence: 'weekly',
    }],
  })
  for (const [date, body] of [
    ['2026-08-12', record('historical', 'Historical series', '2026-08-14')],
    ['2026-08-13', record('standing', 'Standing series', '2026-08-14')],
  ] as const) {
    const dir = path.join(repo, 'analyses', `AAA_${date}`)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'decision_record.json'), JSON.stringify(body))
  }
  // A newer partial module folder must not displace the same standing completed run used by the call UI.
  fs.mkdirSync(path.join(repo, 'analyses', 'AAA_2026-08-14', 'moda'), { recursive: true })
  const standing = probeDataNeeds(repo, 'AAA', 'research')
  assert.equal(standing.run_root, 'analyses/AAA_2026-08-13')
  assert.deepEqual(standing.needs.map((need: any) => need.need_id), ['standing'])

  const historical = probeDataNeeds(repo, 'AAA', 'research', 'analyses/AAA_2026-08-12')
  assert.equal(historical.run_root, 'analyses/AAA_2026-08-12')
  assert.deepEqual(historical.needs.map((need: any) => need.need_id), ['historical'])
  assert.equal(probeDataNeeds(repo, 'AAA', 'research', 'analyses/BBB_2026-08-12'), null,
    'a historical selector naming another subject must fail closed')
  assert.equal(probeDataNeeds(repo, 'AAA', 'research', 'analyses/AAA_2026-08-12/../BBB_2026-08-12'), null,
    'a non-canonical/traversing selector must fail closed')
})

check('fixture: research run and decision symlinks cannot escape or cross an immutable run', () => {
  const repo = tmp('dataneeds-research-symlinks-')
  writeResearchRoster(repo)
  const analyses = path.join(repo, 'analyses')
  fs.mkdirSync(analyses, { recursive: true })
  const record = JSON.stringify({ decision_date: '2026-08-12', data_needs: [] })

  // Even a target which stays under analyses/ and repeats the expected basename is not the selected run
  // inode. Reject the redirect rather than accepting a path-string coincidence.
  const nested = path.join(analyses, 'nested', 'AAA_2026-08-12')
  fs.mkdirSync(nested, { recursive: true })
  fs.writeFileSync(path.join(nested, 'decision_record.json'), record)
  fs.symlinkSync(path.join('nested', 'AAA_2026-08-12'), path.join(analyses, 'AAA_2026-08-12'))
  assert.equal(probeDataNeeds(repo, 'AAA', 'research', 'analyses/AAA_2026-08-12'), null,
    'a same-basename nested run-directory symlink must be rejected')

  const external = tmp('dataneeds-external-decision-')
  fs.writeFileSync(path.join(external, 'decision_record.json'), record)
  const externalRun = path.join(analyses, 'AAA_2026-08-13')
  fs.mkdirSync(externalRun)
  fs.symlinkSync(path.join(external, 'decision_record.json'), path.join(externalRun, 'decision_record.json'))
  assert.equal(probeDataNeeds(repo, 'AAA', 'research', 'analyses/AAA_2026-08-13'), null,
    'an external decision_record symlink must be rejected')

  const otherRun = path.join(analyses, 'BBB_2026-08-14')
  const crossRun = path.join(analyses, 'AAA_2026-08-14')
  fs.mkdirSync(otherRun); fs.mkdirSync(crossRun)
  fs.writeFileSync(path.join(otherRun, 'decision_record.json'), record)
  fs.symlinkSync(path.join('..', 'BBB_2026-08-14', 'decision_record.json'), path.join(crossRun, 'decision_record.json'))
  assert.equal(probeDataNeeds(repo, 'AAA', 'research', 'analyses/AAA_2026-08-14'), null,
    'a decision_record symlink into another run must be rejected')
})

check('fixture: non-research manifest roots and run directories cannot traverse or redirect', () => {
  const repo = tmp('dataneeds-swarm-symlinks-')
  const swarmDir = path.join(repo, '.claude', 'agents', 'fixswarm')
  fs.mkdirSync(path.join(swarmDir, 'moda'), { recursive: true })
  fs.writeFileSync(path.join(swarmDir, 'moda', '99_moda-synthesis.md'),
    '---\nname: fixswarm-moda-synthesis\nlayer: 99\n---\n\nfixture synthesis\n')
  const writeManifest = (runsRoot: string, template: string) => fs.writeFileSync(path.join(swarmDir, 'SWARM.md'),
    `---\nid: fixswarm\nrun_root_template: ${template}\nplaceholder: X\nruns_root: ${runsRoot}\n---\n\nfixture swarm\n`)

  writeManifest('../outside-runs', '../outside-runs/{X}')
  assert.equal(probeDataNeeds(repo), null, 'a traversing runs_root/template must fail closed')

  writeManifest('fixswarm/runs', 'fixswarm/runs/{X}')
  const external = tmp('dataneeds-external-runs-')
  fs.mkdirSync(path.join(external, 'AAA'), { recursive: true })
  fs.mkdirSync(path.join(repo, 'fixswarm'), { recursive: true })
  fs.symlinkSync(external, path.join(repo, 'fixswarm', 'runs'))
  assert.equal(probeDataNeeds(repo), null, 'a declared runs_root symlink must fail closed')

  fs.unlinkSync(path.join(repo, 'fixswarm', 'runs'))
  const runs = path.join(repo, 'fixswarm', 'runs')
  const redirected = path.join(runs, 'nested', 'AAA')
  fs.mkdirSync(redirected, { recursive: true })
  fs.writeFileSync(path.join(redirected, 'decision_record.json'), JSON.stringify({ decision_date: '2026-08-13', data_needs: [] }))
  fs.symlinkSync(path.join('nested', 'AAA'), path.join(runs, 'AAA'))
  assert.equal(probeDataNeeds(repo), null, 'a manifest-selected run-directory symlink must fail closed')
})

check('fixture: research corrections are applied before decision fingerprint and lookup projection', () => {
  const repo = tmp('dataneeds-research-corrections-')
  writeResearchRoster(repo)
  const runRoot = 'analyses/AAA_2026-08-12'
  const runDir = path.join(repo, runRoot)
  fs.mkdirSync(runDir, { recursive: true })
  const record = {
    decision_date: '2026-08-12', probability: 0.5, data_needs_schema_version: '2.0',
    data_needs: [{
      need_id: 'corrected-scope', priority: 1, series: 'Official corrected-scope series',
      why_it_caps: 'Leaves the premise unresolved.',
      expected_impact: { if_supportive: 'Would support the premise.', if_adverse: 'Would weaken the premise.' },
      filing_required: false,
      entry_orbs: [{ module: 'moda', agent: 'research-moda-alpha', why: 'Tests the premise.', confidence: 0.7 }],
      suggested_source: { name: 'Official body', acquisition: 'official_api', access: 'public', licensing_basis: 'Publisher terms' },
      tier: 5, cadence: 'weekly',
    }],
  }
  fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify(record))
  const commitAll = (message: string) => {
    spawnSync('git', ['init', '-q'], { cwd: repo })
    spawnSync('git', ['config', 'user.email', 'data-needs@example.invalid'], { cwd: repo })
    spawnSync('git', ['config', 'user.name', 'Data Needs Test'], { cwd: repo })
    spawnSync('git', ['add', '--', '.'], { cwd: repo })
    const committed = spawnSync('git', ['commit', '-q', '-m', message], { cwd: repo, encoding: 'utf8' })
    assert.equal(committed.status, 0, committed.stderr)
    return spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).stdout.trim()
  }
  let published = commitAll('fixture decision')
  const before = probeDataNeeds(repo, 'AAA', 'research', runRoot, published)
  const statePipeline = path.join(repo, '.state', 'pipeline')
  fs.mkdirSync(statePipeline, { recursive: true })
  const sourceId = 'PIPE-20260813-aaaaaaaa'
  fs.writeFileSync(path.join(statePipeline, 'pipeline.ndjson'), [
    {
      pipeline_id: sourceId, kind: 'pipeline_source', subject: 'AAA', swarm: 'research',
      run_root: runRoot, decision_fingerprint: before.decision_fingerprint, need_id: 'corrected-scope',
      series_hint: 'Official corrected-scope series', source_url: 'https://public.example.com/corrected',
      source_kind: 'api', sample: '', note: '', user_id: 'u', submitted_at: '2026-08-13T10:00:00Z',
    },
    {
      pipeline_id: 'PIPE-20260813-bbbbbbbb', kind: 'pipeline_lookup', subject: 'AAA', swarm: 'research',
      run_root: runRoot, decision_fingerprint: before.decision_fingerprint, need_id: 'corrected-scope',
      need_fingerprint: dataNeedFingerprint('corrected-scope', 'Official corrected-scope series'),
      lookup_started_at: '2026-08-13T10:00:00.000Z', lookup_status: 'public_link_found',
      public_url: 'https://public.example.com/corrected', lookup_note: 'found', source_pipeline_id: sourceId,
      user_id: 'u', submitted_at: '2026-08-13T10:01:00Z',
    },
  ].map((row) => JSON.stringify(row)).join('\n') + '\n')
  assert.equal(probeDataNeeds(repo, 'AAA', 'research', runRoot).needs[0].source_lookup.lookup_status, 'public_link_found')

  fs.writeFileSync(path.join(runDir, 'corrections.json'), JSON.stringify({
    schema: 'corrections/v1', errata: [{ field: 'probability', kind: 'scale_fix' }],
  }))
  published = commitAll('fixture published correction')
  const after = probeDataNeeds(repo, 'AAA', 'research', runRoot, published)
  assert.equal(after.needs[0].need_id, 'corrected-scope')
  assert.notEqual(after.decision_fingerprint, before.decision_fingerprint,
    'the effective corrected decision must receive a new immutable fingerprint')
  assert.equal(after.needs[0].source_lookup, undefined,
    'a lookup scoped to the uncorrected fingerprint must not attach after correction projection')
})

for (const d of tmpdirs) fs.rmSync(d, { recursive: true, force: true })
console.log(`\ndata-needs.test.ts: ${passed} passed`)
