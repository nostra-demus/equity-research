// The company-NAME fallback in matchTrackedSubjects. It exists because the wire's enrichment guesses
// companies from the headline and often names one WITHOUT a symbol: Fortune's "Andy Jassy said Amazon
// will spend $220 billion this year" arrived as `Amazon · giant company · US` with ticker null, scored
// 89 and material, and was silently dropped — while the same day's "…Sold $25 Billion in Bonds"
// (`Amazon · AMZN`) routed fine. Run: npx tsx test/bridge-name-match.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { matchTrackedSubjects, normaliseCompanyName, renderEventNote } from '../src/research-bridge'
import { readSubjectNames, wireNameMatching } from '../src/bridge-batch'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-name-'))
const dataDir = path.join(root, 'data')
const analysesDir = path.join(root, 'analyses')
for (const t of ['AMZN', 'NHY']) fs.mkdirSync(path.join(dataDir, t), { recursive: true })
const mkRun = (dir: string, name: string) => {
  fs.mkdirSync(path.join(analysesDir, dir), { recursive: true })
  fs.writeFileSync(path.join(analysesDir, dir, 'decision_record.json'), JSON.stringify({ company_name: name }))
}
mkRun('AMZN_2026-07-10', 'Amazon.com, Inc.')
mkRun('NHY_2026-07-19', 'Norsk Hydro ASA')

const item = (companies: any[]) => ({ event_id: 'EVT-0123456789ab', companies } as any)
const NAMES = readSubjectNames(['AMZN', 'NHY'], analysesDir)

check('reads each subject\'s canonical name from its newest decision record', () => {
  assert.deepEqual(NAMES, { AMZN: 'Amazon.com, Inc.', NHY: 'Norsk Hydro ASA' })
})

check('normalisation strips legal-form suffixes from the END only', () => {
  assert.equal(normaliseCompanyName('Amazon.com, Inc.'), 'amazon')
  assert.equal(normaliseCompanyName('Amazon'), 'amazon')
  assert.equal(normaliseCompanyName('Norsk Hydro ASA'), 'norsk hydro')
  assert.equal(normaliseCompanyName('  NORSK   HYDRO  '), 'norsk hydro')
  // a suffix word INSIDE the name is not stripped, and a name that IS one survives
  assert.equal(normaliseCompanyName('Group 1 Automotive, Inc.'), 'group 1 automotive')
  assert.equal(normaliseCompanyName('Group'), 'group')
})

check('THE REGRESSION: a ticker-less item naming a covered company now matches', () => {
  assert.deepEqual(matchTrackedSubjects(item([{ name: 'Amazon', ticker: null }]), dataDir, NAMES), ['AMZN'])
  assert.deepEqual(matchTrackedSubjects(item([{ name: 'Norsk Hydro', ticker: null }]), dataDir, NAMES), ['NHY'])
})

check('without the alias map, behaviour is EXACTLY as before (ticker-only)', () => {
  assert.deepEqual(matchTrackedSubjects(item([{ name: 'Amazon', ticker: null }]), dataDir), [])
})

check('a real ticker match still wins and is never overridden by names', () => {
  const both = item([{ name: 'Amazon', ticker: 'AMZN' }, { name: 'Norsk Hydro', ticker: null }])
  assert.deepEqual(matchTrackedSubjects(both, dataDir, NAMES), ['AMZN'], 'name pass must not run when a ticker matched')
})

check('an untracked company never matches, however it is named', () => {
  assert.deepEqual(matchTrackedSubjects(item([{ name: 'Wildberries', ticker: null }]), dataDir, NAMES), [])
  assert.deepEqual(matchTrackedSubjects(item([{ name: 'Apple Inc.', ticker: null }]), dataDir, NAMES), [])
})

check('matching is EXACT on the normalised name — never a substring', () => {
  // the whole reason the ticker path refuses suffix-stripping: near-names must not collide
  for (const n of ['Amazon Web Services', 'Amazonas Energia', 'Norsk Hydrogen', 'Amaz']) {
    assert.deepEqual(matchTrackedSubjects(item([{ name: n, ticker: null }]), dataDir, NAMES), [], n)
  }
})

check('an empty or single-character name cannot match', () => {
  assert.deepEqual(matchTrackedSubjects(item([{ name: '', ticker: null }]), dataDir, NAMES), [])
  assert.deepEqual(matchTrackedSubjects(item([{ name: 'A', ticker: null }]), dataDir, NAMES), [])
})

check('a SHORT company name still matches — exactness is the safety, not a length floor', () => {
  // A bigger floor would silently exclude BP, 3M, ABB, AXA, ING, UBS, SAP from the name path forever.
  fs.mkdirSync(path.join(dataDir, 'BP'), { recursive: true })
  mkRun('BP_2026-07-01', 'BP p.l.c.')
  const names = readSubjectNames(['AMZN', 'BP'], analysesDir)
  assert.equal(normaliseCompanyName('BP p.l.c.'), 'bp')
  assert.deepEqual(matchTrackedSubjects(item([{ name: 'BP', ticker: null }]), dataDir, names), ['BP'])
  // and it is still exact — a longer name containing it does not match
  assert.deepEqual(matchTrackedSubjects(item([{ name: 'BP Midstream', ticker: null }]), dataDir, names), [])
})

check('a subject with no run / no decision record simply has no alias', () => {
  fs.mkdirSync(path.join(dataDir, 'ZZNORUN'), { recursive: true })
  const names = readSubjectNames(['AMZN', 'ZZNORUN'], analysesDir)
  assert.equal(names.ZZNORUN, undefined)
  assert.equal(names.AMZN, 'Amazon.com, Inc.')
})

check('readSubjectNames never throws on a missing/unreadable analyses dir', () => {
  assert.deepEqual(readSubjectNames(['AMZN'], path.join(root, 'nope')), {})
  assert.deepEqual(readSubjectNames(['AMZN'], undefined), {})
})

// ---- review fixes (#374) ----------------------------------------------------------------------------

check('a LEADING article is stripped too — "The Coca-Cola Company" matches a wire naming "Coca-Cola"', () => {
  // the suffix pass runs from the END and could never reach it; a large class of names starts with "The"
  assert.equal(normaliseCompanyName('The Coca-Cola Company'), 'coca cola')
  assert.equal(normaliseCompanyName('The Walt Disney Company'), 'walt disney')
  assert.equal(normaliseCompanyName('Coca-Cola'), 'coca cola')
  fs.mkdirSync(path.join(dataDir, 'KO'), { recursive: true })
  mkRun('KO_2026-07-01', 'The Coca-Cola Company')
  const names = readSubjectNames(['KO'], analysesDir)
  assert.deepEqual(matchTrackedSubjects(item([{ name: 'Coca-Cola', ticker: null }]), dataDir, names), ['KO'])
  // a name that is ONLY the article still survives normalisation (never empty)
  assert.equal(normaliseCompanyName('The'), 'the')
})

check('the name path PROVES the pool exists, exactly as the ticker path does', () => {
  // an exported matcher must not hand back a subject bridgeEventToSubject would then reject with
  // "no data/<T>/ pool" — asymmetric strictness between the two paths is a bug waiting for its caller
  const stale = { GHOST: 'Ghost Corp' }
  assert.deepEqual(matchTrackedSubjects(item([{ name: 'Ghost Corp', ticker: null }]), dataDir, stale), [])
})

check('the note quotes the company that MATCHED, not the first ticker-less one', () => {
  // the wire naming several ticker-less companies used to put "Wildberries" on an AMZN note — a false
  // claim in the one line whose entire job is provenance (§5)
  const multi = item([{ name: 'Wildberries', ticker: null }, { name: 'Amazon', ticker: null }])
  assert.equal(wireNameMatching(multi, 'Amazon.com, Inc.'), 'Amazon')
  assert.equal(wireNameMatching(multi, 'Norsk Hydro ASA'), undefined)
  const md = renderEventNote({
    item: { ...multi, headline: 'h', event_id: 'EVT-0123456789ab' } as any,
    ticker: 'AMZN', mode: 'auto', user: 'auto',
    matchedBy: 'name', matchedName: wireNameMatching(multi, 'Amazon.com, Inc.'),
    now: () => new Date('2026-07-31T00:00:00Z'),
  })
  const routed = md.split('\n').find((l) => l.startsWith('- Routed to')) || ''
  assert.ok(routed.includes('named this tracked subject\'s company exactly ("Amazon")'), routed)
  // scoped to the PROVENANCE line: the note's "Companies the wire named" section legitimately lists
  // every company the wire tagged, Wildberries included — it is the routing claim that must be precise
  assert.ok(!routed.includes('Wildberries'), routed)
})

check('a TICKER route still claims the ticker, never the name wording', () => {
  const md = renderEventNote({
    item: item([{ name: 'Amazon', ticker: 'AMZN' }]) as any,
    ticker: 'AMZN', mode: 'auto', user: 'auto', now: () => new Date('2026-07-31T00:00:00Z'),
  })
  assert.ok(md.includes("the wire's extracted ticker matched this tracked subject exactly"), md)
})

const EXPECTED_CHECKS = 15
assert.ok(passed >= EXPECTED_CHECKS,
  `only ${passed} checks ran, expected at least ${EXPECTED_CHECKS} — something above is short-circuiting`)
console.log(`\nbridge-name-match.test.ts: ${passed} checks passed`)
