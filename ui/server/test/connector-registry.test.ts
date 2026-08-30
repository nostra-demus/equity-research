// connector-registry — discovery, strict v2 manifest validation, honest fallback coverage, and the
// canonical storage/health gate. Run: npx tsx test/connector-registry.test.ts.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import type { FeedHealth } from '../src/feed-health'
import { canonicalJsonText } from '../src/canonical-json'

let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

const {
  canonicalSchemaMatches,
  cadenceIntervalMs,
  builtBySatisfies,
  connectorCurrentStatus,
  connectorFingerprint,
  healthyBuiltBySatisfies,
  honestCoverage,
  listConnectors,
  parseManifest,
  publisherContractFingerprint,
} = await import('../src/connector-registry')
const { feedKey } = await import('../src/feed-health')
import type { ConnectorManifest } from '../src/connector-registry'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))
const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex')
const canonicalJson = canonicalJsonText

// ── discovery: committed reference connectors are live v2 contract fixtures ──
const cons = listConnectors()
check('discovers the committed connectors (>= 2)', cons.length >= 2, `found ${cons.length}`)
const cot = cons.find((c) => c.id === 'cftc-cot-wheat-srw')
check('the CFTC connector is discovered as v2', !!cot && cot.manifest_version === 2)
check('its subjects + cadence + entry parsed', !!cot && cot.subjects.includes('WHEAT') && cot.cadence === 'weekly' && cot.entry === 'fetch.py')
check('its host_allowlist parsed', !!cot && cot.host_allowlist.some((h) => h === 'publicreporting.cftc.gov'))

const referenceRaw: Record<string, any> = JSON.parse(fs.readFileSync(path.join(cot!.dir, 'connector.json'), 'utf8'))
const parsedV2 = (raw: Record<string, any>) => parseManifest('/tmp/strict-v2', raw)

const conditionalSchema = {
  type: 'object',
  allOf: [{
    if: { required: ['observations'], properties: { observations: { minimum: 2 } } },
    then: { required: ['path'] },
    else: { required: ['single'] },
  }],
}
check('canonical schema executor applies allOf plus if/then/else branches',
  canonicalSchemaMatches({ observations: 2, path: 'rows' }, conditionalSchema)
  && !canonicalSchemaMatches({ observations: 2 }, conditionalSchema)
  && canonicalSchemaMatches({ observations: 1, single: true }, conditionalSchema)
  && !canonicalSchemaMatches({ observations: 1 }, conditionalSchema))

const repoRoot = path.resolve(cot!.dir, '..', '..', '..')
const pythonPublisherFingerprint = execFileSync('python3', ['-c', [
  'import sys',
  `sys.path.insert(0, ${JSON.stringify(path.join(repoRoot, '.claude', 'tools'))})`,
  'import run_connectors',
  'print(run_connectors.publisher_contract_fingerprint())',
].join(';')], { encoding: 'utf8' }).trim()
check('Python and TypeScript hash the same ordered shared publisher paths',
  publisherContractFingerprint() === pythonPublisherFingerprint && /^[0-9a-f]{64}$/.test(pythonPublisherFingerprint))

const fingerprintRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'connector-fingerprint-tree-'))
fs.mkdirSync(path.join(fingerprintRoot, 'lib'), { recursive: true })
fs.mkdirSync(path.join(fingerprintRoot, 'a'), { recursive: true })
fs.mkdirSync(path.join(fingerprintRoot, '__pycache__'), { recursive: true })
fs.writeFileSync(path.join(fingerprintRoot, 'fetch.py'), '# root\n')
fs.writeFileSync(path.join(fingerprintRoot, '.contract'), 'hidden but deployed\n')
fs.writeFileSync(path.join(fingerprintRoot, 'lib', 'helper.py'), '# helper v1\n')
fs.writeFileSync(path.join(fingerprintRoot, 'a', 'helper.py'), '# lexical-order edge\n')
fs.writeFileSync(path.join(fingerprintRoot, 'a-file.py'), '# sorts before a/helper by POSIX relative path\n')
fs.writeFileSync(path.join(fingerprintRoot, '__pycache__', 'helper.cpython.pyc'), 'generated\n')
fs.writeFileSync(path.join(fingerprintRoot, 'tracked-helper.pyc'), 'deployed outside cache\n')
const treeHash = connectorFingerprint(fingerprintRoot)
const pythonTreeHash = execFileSync('python3', ['-c', [
  'import sys',
  `sys.path.insert(0, ${JSON.stringify(path.join(repoRoot, '.claude', 'tools'))})`,
  'import run_connectors',
  `print(run_connectors.connector_fingerprint(${JSON.stringify(fingerprintRoot)}))`,
].join(';')], { encoding: 'utf8' }).trim()
check('Python and TypeScript recursively fingerprint the same deployed connector tree',
  treeHash === pythonTreeHash && /^[0-9a-f]{64}$/.test(treeHash), `${treeHash} != ${pythonTreeHash}`)
fs.writeFileSync(path.join(fingerprintRoot, 'lib', 'helper.py'), '# helper v2\n')
check('a nested helper change changes the connector fingerprint', connectorFingerprint(fingerprintRoot) !== treeHash)
fs.writeFileSync(path.join(fingerprintRoot, 'lib', 'helper.py'), '# helper v1\n')
fs.writeFileSync(path.join(fingerprintRoot, '__pycache__', 'new.pyc'), 'more generated bytes\n')
check('generated __pycache__ bytes do not change the deployed fingerprint',
  connectorFingerprint(fingerprintRoot) === treeHash)
fs.writeFileSync(path.join(fingerprintRoot, 'tracked-helper.pyc'), 'changed deployed bytes\n')
check('a sourceless .pyc outside __pycache__ is fingerprinted', connectorFingerprint(fingerprintRoot) !== treeHash)
try {
  fs.symlinkSync(path.join(fingerprintRoot, 'fetch.py'), path.join(fingerprintRoot, 'lib', 'linked.py'))
  check('a nested symlink makes the connector tree unsealable', connectorFingerprint(fingerprintRoot) === '')
} finally {
  fs.rmSync(fingerprintRoot, { recursive: true, force: true })
}

const unicodeFingerprintRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'connector-unicode-fingerprint-tree-'))
try {
  fs.writeFileSync(path.join(unicodeFingerprintRoot, 'fetch.py'), '# root\n')
  fs.writeFileSync(path.join(unicodeFingerprintRoot, '\uE000.txt'), 'private-use code point\n')
  fs.writeFileSync(path.join(unicodeFingerprintRoot, '\u{10000}.txt'), 'supplementary-plane code point\n')
  const tsUnicodeHash = connectorFingerprint(unicodeFingerprintRoot)
  const pythonUnicodeHash = execFileSync('python3', ['-c', [
    'import sys',
    `sys.path.insert(0, ${JSON.stringify(path.join(repoRoot, '.claude', 'tools'))})`,
    'import run_connectors',
    `print(run_connectors.connector_fingerprint(${JSON.stringify(unicodeFingerprintRoot)}))`,
  ].join(';')], { encoding: 'utf8' }).trim()
  check('Python and TypeScript both fail closed on Unicode bundle names whose sort orders diverge',
    tsUnicodeHash === '' && pythonUnicodeHash === '')
} finally {
  fs.rmSync(unicodeFingerprintRoot, { recursive: true, force: true })
}

const symlinkFingerprintTarget = fs.mkdtempSync(path.join(os.tmpdir(), 'connector-root-symlink-target-'))
const symlinkFingerprintRoot = `${symlinkFingerprintTarget}-link`
try {
  fs.writeFileSync(path.join(symlinkFingerprintTarget, 'fetch.py'), '# target bytes\n')
  fs.symlinkSync(symlinkFingerprintTarget, symlinkFingerprintRoot, 'dir')
  const tsSymlinkHash = connectorFingerprint(symlinkFingerprintRoot)
  const pythonSymlinkHash = execFileSync('python3', ['-c', [
    'import sys',
    `sys.path.insert(0, ${JSON.stringify(path.join(repoRoot, '.claude', 'tools'))})`,
    'import run_connectors',
    `print(run_connectors.connector_fingerprint(${JSON.stringify(symlinkFingerprintRoot)}))`,
  ].join(';')], { encoding: 'utf8' }).trim()
  check('Python and TypeScript both reject a symlinked connector bundle root',
    tsSymlinkHash === '' && pythonSymlinkHash === '')
} finally {
  // unlinkSync, not rmSync: the root is a symlink to a DIRECTORY, and rmSync resolves the target and
  // throws EISDIR. unlink removes the link itself and never touches what it points at.
  try { fs.unlinkSync(symlinkFingerprintRoot) } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
  }
  fs.rmSync(symlinkFingerprintTarget, { recursive: true, force: true })
}

// ── cadence intervals ──
check('daily interval = 24h', cadenceIntervalMs('daily') === 24 * 3600_000)
check('weekly interval = 7d', cadenceIntervalMs('weekly') === 7 * 24 * 3600_000)
check('quarterly polling interval = 90d', cadenceIntervalMs('quarterly') === 90 * 24 * 3600_000)
check('semiannual polling interval = 180d', cadenceIntervalMs('semiannual') === 180 * 24 * 3600_000)
check('annual polling interval = 365d', cadenceIntervalMs('annual') === 365 * 24 * 3600_000)
check('event_driven has no clock (null)', cadenceIntervalMs('event_driven') === null)
check('unknown cadence → null', cadenceIntervalMs('hourly') === null)

// ── declaration-only map (not the health-qualified close-the-loop map) ──
const declarationMap = builtBySatisfies(cons)
check('declared satisfies slugs map back to a connector id',
  declarationMap.size >= 1 && [...declarationMap.values()].includes('cftc-cot-wheat-srw'))

// ── v1 parsing stays readable, but production coverage and sufficiency are v2-only ──
const legacy = { id: 'x-y', cadence: 'daily', entry: 'fetch.py', subjects: ['WHEAT'], satisfies: ['s'], host_allowlist: ['h.com'], tier: 5, staleness_sla_days: 10 }
const parsedLegacy = parseManifest('/tmp/x', legacy)!
check('a well-formed legacy manifest still parses for historical readers', !!parsedLegacy)
check('a parsed v1 manifest is never admitted to production coverage', honestCoverage([parsedLegacy]).length === 0)
check('a parsed v1 manifest cannot declare a required need closed', builtBySatisfies([parsedLegacy]).size === 0)
check('a v1 filename/legacy-health path cannot satisfy a required need', healthyBuiltBySatisfies('WHEAT', {
  connectors: [parsedLegacy],
  health: new Map([[feedKey(parsedLegacy.id, 'WHEAT'), {
    connector: parsedLegacy.id, subject: 'WHEAT', state: 'current', outcome: 'current', failStreak: 0,
    lastSweepAt: new Date().toISOString(), message: '', latestAsOf: new Date().toISOString().slice(0, 10),
  } as FeedHealth]]),
  dataDir: os.tmpdir(),
}).size === 0)
check('legacy sla<=0 is rejected rather than producing false freshness',
  parseManifest('/tmp/x', { ...legacy, staleness_sla_days: 0 }) === null)
check('bad id rejected', parseManifest('/tmp/x', { ...legacy, id: 'Bad Id' }) === null)
check('entry with a path separator rejected', parseManifest('/tmp/x', { ...legacy, entry: '../evil.py' }) === null)
check('empty subjects rejected', parseManifest('/tmp/x', { ...legacy, subjects: [] }) === null)
check('non-object rejected', parseManifest('/tmp/x', null) === null && parseManifest('/tmp/x', [1]) === null)

// ── v2 strict scalar/object types and closed shapes ──
for (const [label, mutate] of [
  ['manifest_version string', (r: any) => { r.manifest_version = '2' }],
  ['schema_version string', (r: any) => { r.schema_version = '1' }],
  ['provider_priority string', (r: any) => { r.provider_priority = '100' }],
  ['tier string', (r: any) => { r.tier = '5' }],
  ['top-level SLA string', (r: any) => { r.staleness_sla_days = '12' }],
  ['release lag string', (r: any) => { r.release.expected_lag_days = '3' }],
] as [string, (raw: any) => void][]) {
  const raw = clone(referenceRaw); mutate(raw)
  check(`v2 rejects ${label} instead of coercing it`, parsedV2(raw) === null)
}
const unknownRoot = clone(referenceRaw); unknownRoot.surprise = true
check('v2 rejects unknown top-level fields', parsedV2(unknownRoot) === null)
const unknownRelease = clone(referenceRaw); unknownRelease.release.surprise = true
check('v2 rejects unknown release fields', parsedV2(unknownRelease) === null)
const seasonalRelease = clone(referenceRaw); seasonalRelease.release.active_months = [4, 5, 6, 7, 8, 9, 10, 11]
check('v2 accepts sorted unique active release months for a calendar cadence',
  parsedV2(seasonalRelease)?.release.active_months?.join(',') === '4,5,6,7,8,9,10,11')
const unsortedSeasonalRelease = clone(seasonalRelease); unsortedSeasonalRelease.release.active_months = [5, 4]
check('v2 rejects unsorted active release months', parsedV2(unsortedSeasonalRelease) === null)
const eventSeasonalRelease = clone(seasonalRelease); eventSeasonalRelease.release.cadence = 'event_driven'
check('v2 rejects active release months for an event-driven connector', parsedV2(eventSeasonalRelease) === null)
const unknownMinimumHistory = clone(referenceRaw); unknownMinimumHistory.minimum_history.surprise = true
check('v2 rejects unknown minimum_history fields', parsedV2(unknownMinimumHistory) === null)
const blankSubject = clone(referenceRaw); blankSubject.subjects.push('')
check('v2 rejects a blank raw subject instead of filtering it out', parsedV2(blankSubject) === null)
const unsafeSubject = clone(referenceRaw); unsafeSubject.subjects.push('../GOLD')
check('v2 rejects an unsafe raw subject', parsedV2(unsafeSubject) === null)
const unsafeManifestInteger = clone(referenceRaw); unsafeManifestInteger.provider_priority = Number.MAX_SAFE_INTEGER + 1
check('v2 rejects an integral manifest value outside the cross-runtime safe range',
  parsedV2(unsafeManifestInteger) === null)
const loneSurrogateManifest = clone(referenceRaw); loneSurrogateManifest.series = '\ud800'
check('v2 rejects a manifest string the cross-runtime canonicalizer cannot encode',
  parsedV2(loneSurrogateManifest) === null)
const lowercaseSubject = clone(referenceRaw); lowercaseSubject.subjects = ['gold']
check('v2 requires the canonical uppercase subject spelling', parsedV2(lowercaseSubject) === null)
const sameManifestCaseAlias = clone(referenceRaw); sameManifestCaseAlias.subjects = ['GOLD', 'gold']
check('v2 rejects a same-manifest subject case collision', parsedV2(sameManifestCaseAlias) === null)
const blankHost = clone(referenceRaw); blankHost.host_allowlist.push('')
check('v2 rejects a blank raw host instead of filtering it out', parsedV2(blankHost) === null)
const unsafeHost = clone(referenceRaw); unsafeHost.host_allowlist.push('https://example.com')
check('v2 rejects a non-bare raw host', parsedV2(unsafeHost) === null)
const specialUseHost = clone(referenceRaw); specialUseHost.host_allowlist = ['feed.localhost']
check('v2 rejects a special-use .localhost host before runtime DNS', parsedV2(specialUseHost) === null)
const duplicateAsOfOutsideBasename = clone(referenceRaw)
duplicateAsOfOutsideBasename.output_path = 'data/<SUBJECT>/external/<as_of>/series_<as_of>.json'
check('v2 requires exactly one <as_of> token across the full output_path', parsedV2(duplicateAsOfOutsideBasename) === null)
const asOfOnlyInDirectory = clone(referenceRaw)
asOfOnlyInDirectory.output_path = 'data/<SUBJECT>/external/<as_of>/series.json'
check('v2 requires the sole <as_of> token to be in the basename', parsedV2(asOfOnlyInDirectory) === null)
const doubleSlashOutput = clone(referenceRaw)
doubleSlashOutput.output_path = 'data/<SUBJECT>/external//series_<as_of>.json'
check('v2 enforces the canonical output_path pattern and rejects empty/double-slash segments',
  parsedV2(doubleSlashOutput) === null)
for (const [label, outputPath] of [
  ['dot segment', 'data/<SUBJECT>/external/cftc/./series_<as_of>.json'],
  ['parent segment', 'data/<SUBJECT>/external/cftc/../series_<as_of>.json'],
  ['backslash alias', 'data/<SUBJECT>/external/cftc\\alias/series_<as_of>.json'],
  ['encoded separator', 'data/<SUBJECT>/external/cftc%2falias/series_<as_of>.json'],
  ['encoded dot alias', 'data/<SUBJECT>/external/cftc/%2e/series_<as_of>.json'],
  ['case-only alias', 'data/<SUBJECT>/external/CFTC/series_<as_of>.json'],
] as const) {
  const aliased = clone(referenceRaw); aliased.output_path = outputPath
  check(`v2 output_path rejects ${label} before collision ownership`, parsedV2(aliased) === null)
}
for (const [label, mutate] of [
  ['duplicate subject', (r: any) => { r.subjects.push(r.subjects[0]) }],
  ['duplicate satisfies id', (r: any) => { r.satisfies.push(r.satisfies[0]) }],
  ['duplicate host', (r: any) => { r.host_allowlist.push(r.host_allowlist[0]) }],
  ['provider priority below schema minimum', (r: any) => { r.provider_priority = 0 }],
  ['release grace below schema minimum', (r: any) => { r.release.grace_days = -1 }],
] as [string, (raw: any) => void][]) {
  const invalid = clone(referenceRaw); mutate(invalid)
  check(`canonical schema rejects ${label} without ghost coverage`, parsedV2(invalid) === null)
}
for (const field of ['manual', 'manual_ingest', 'fallback_for']) {
  const presentNull = clone(referenceRaw); presentNull[field] = null
  check(`v2 rejects present-null optional field ${field}`, parsedV2(presentNull) === null)
}

// ── structured licensing is operational policy, not display text ──
const noLicensing = clone(referenceRaw); delete noLicensing.licensing
check('v2 requires structured licensing', parsedV2(noLicensing) === null)
const unavailable = clone(referenceRaw); unavailable.licensing.use = 'unavailable'
check('licensing use=unavailable is not runnable', parsedV2(unavailable) === null)
const unknownAutomatic = clone(referenceRaw); unknownAutomatic.licensing.access = 'unknown'
check('unknown access is rejected for an automatic connector', parsedV2(unknownAutomatic) === null)
const unentitled = clone(referenceRaw)
unentitled.licensing.access = 'licensed'; unentitled.licensing.use = 'entitlement_required'
check('entitlement-required access needs credentials or manual ingest', parsedV2(unentitled) === null)
const entitled = clone(unentitled); entitled.credential_env = ['CONNECTOR_VENDOR_API_KEY']
check('entitlement-required access with a declared credential parses', !!parsedV2(entitled))
const unprefixedCredential = clone(entitled); unprefixedCredential.credential_env = ['VENDOR_API_KEY']
check('credential names require the CONNECTOR_* namespace', parsedV2(unprefixedCredential) === null)
const insecureTerms = clone(referenceRaw); insecureTerms.licensing.terms_url = 'http://example.com/terms'
check('licensing terms must be an absolute credential-free HTTPS URL', parsedV2(insecureTerms) === null)
const credentialedTerms = clone(referenceRaw); credentialedTerms.licensing.terms_url = 'https://user:secret@example.com/terms'
check('licensing terms reject embedded credentials', parsedV2(credentialedTerms) === null)
const localhostTerms = clone(referenceRaw); localhostTerms.licensing.terms_url = 'https://terms.localhost/licence'
check('licensing terms reject special-use .localhost names', parsedV2(localhostTerms) === null)
const unsafeTermsUrls = [
  ['non-443 origin port', 'https://example.com:444/terms'],
  ['fragment', 'https://example.com/terms#fragment'],
  ['credential-semantic query key', 'https://example.com/terms?api_key=secret'],
  ['literal IP host', 'https://127.0.0.1/terms'],
  ['URL-normalized hostname identity', 'https://%65xample.com/terms'],
] as const
const pythonTermsRejections = JSON.parse(execFileSync('python3', ['-c', [
  'import copy,json,sys',
  'sys.path.insert(0, sys.argv[1] + "/scripts")',
  'import connector_contract',
  'raw=json.loads(sys.argv[3]); urls=json.loads(sys.argv[4]); out=[]',
  'for url in urls:',
  ' candidate=copy.deepcopy(raw); candidate["licensing"]["terms_url"]=url',
  ' out.append(bool(connector_contract.validate_manifest(candidate["id"], sys.argv[2], candidate)))',
  'print(json.dumps(out))',
].join('\n'), repoRoot, cot!.dir, JSON.stringify(referenceRaw), JSON.stringify(unsafeTermsUrls.map(([, url]) => url))], {
  encoding: 'utf8',
})) as boolean[]
for (const [[label, url], pythonRejected] of unsafeTermsUrls.map((item, index) => [item, pythonTermsRejections[index]] as const)) {
  const invalid = clone(referenceRaw); invalid.licensing.terms_url = url
  check(`Python and TypeScript both reject licensing terms with ${label}`,
    pythonRejected === true && parsedV2(invalid) === null)
}
const licensingExtra = clone(referenceRaw); licensingExtra.licensing.note = 'free text'
check('licensing object is closed to unknown fields', parsedV2(licensingExtra) === null)

// ── source hierarchy ceiling, unit contract, release timezone, and manual consistency ──
const brokerTooHigh = clone(referenceRaw); brokerTooHigh.source_type = 'broker_research'; brokerTooHigh.tier = 6
check('broker research cannot claim a tier above its tier-7 ceiling', parsedV2(brokerTooHigh) === null)
const brokerAtCeiling = clone(brokerTooHigh); brokerAtCeiling.tier = 7
check('broker research at tier 7 parses', !!parsedV2(brokerAtCeiling))
const unknownSourceType = clone(referenceRaw); unknownSourceType.source_type = 'new_external_kind'; unknownSourceType.tier = 9
check('unknown source-type vocabulary is rejected rather than assigned an implicit tier', parsedV2(unknownSourceType) === null)
const externalTooHigh = clone(referenceRaw); externalTooHigh.source_type = 'external_other'; externalTooHigh.tier = 8
check('external_other cannot claim a tier above its conservative tier-9 ceiling', parsedV2(externalTooHigh) === null)
const externalAtCeiling = clone(externalTooHigh); externalAtCeiling.tier = 9
check('external_other parses at tier 9', !!parsedV2(externalAtCeiling))

const missingUnit = clone(referenceRaw); delete missingUnit.units['observations[].managed_money_long']
check('every numeric output field requires a unit', parsedV2(missingUnit) === null)
const strayUnit = clone(referenceRaw); strayUnit.units.contract = 'identifier'
check('a unit cannot be attached to a non-numeric closed field', parsedV2(strayUnit) === null)
const nonStringUnit = clone(referenceRaw); nonStringUnit.units['observations[].managed_money_long'] = 1
check('unit values are non-empty strings', parsedV2(nonStringUnit) === null)
const invalidUnitPath = clone(referenceRaw)
invalidUnitPath.output_schema['bad path'] = 'float'; invalidUnitPath.units['bad path'] = 'index'
check('unit paths obey the canonical schema grammar', parsedV2(invalidUnitPath) === null)
const invalidTimezone = clone(referenceRaw); invalidTimezone.release.timezone = 'Mars/Olympus'
check('an invalid IANA release timezone is rejected', parsedV2(invalidTimezone) === null)
const badHistoryPath = clone(referenceRaw); badHistoryPath.minimum_history.path = 'months..month'
check('minimum_history.path rejects empty dotted-path components', parsedV2(badHistoryPath) === null)
const multiWithoutHistoryPath = clone(referenceRaw); multiWithoutHistoryPath.minimum_history = { observations: 2 }
check('minimum_history >1 requires an explicit output-schema array path', parsedV2(multiWithoutHistoryPath) === null)
const multiAtObjectPath = clone(referenceRaw)
multiAtObjectPath.minimum_history = { observations: 2, path: 'managed_money' }
check('minimum_history >1 rejects a path that resolves to a non-array schema node', parsedV2(multiAtObjectPath) === null)
const multiAtArrayPath = clone(referenceRaw)
multiAtArrayPath.output_schema.history = [{ value: 'float' }]
multiAtArrayPath.units['history[].value'] = 'index'
multiAtArrayPath.minimum_history = { observations: 2, path: 'history' }
check('minimum_history >1 accepts a declared path that resolves to an output-schema array',
  parsedV2(multiAtArrayPath) !== null)
const singleAtObjectPath = clone(referenceRaw)
singleAtObjectPath.minimum_history = { observations: 1, path: 'managed_money' }
check('the history path→array condition applies only when observations is greater than one',
  parsedV2(singleAtObjectPath) !== null)
const spacedTerms = clone(referenceRaw); spacedTerms.licensing.terms_url = ' https://example.com/terms '
check('licensing terms URL rejects leading/trailing whitespace', parsedV2(spacedTerms) === null)
for (const [label, schema] of [
  ['unsupported token', { bad: 'number' }],
  ['empty array schema', { bad: [] }],
  ['duplicate enum choice', { bad: 'enum:a|a' }],
] as [string, any][]) {
  const invalidSchema = clone(referenceRaw); invalidSchema.output_schema = schema; invalidSchema.units = {}
  check(`compact output_schema rejects ${label}`, parsedV2(invalidSchema) === null)
}
const nullableEnum = clone(referenceRaw); nullableEnum.output_schema = { state: 'enum:a|b|null' }; nullableEnum.units = {}
nullableEnum.minimum_history = { observations: 1 }
check('compact output_schema accepts an explicitly nullable enum', parsedV2(nullableEnum) !== null)
const independentSla = clone(referenceRaw)
independentSla.release.expected_lag_days = 1; independentSla.release.grace_days = 2
independentSla.release.staleness_sla_days = 99; independentSla.staleness_sla_days = 99
check('v2 rejects both legacy flat and nested SLA compatibility fields', parsedV2(independentSla) === null)

const eventWithLag = clone(referenceRaw)
eventWithLag.release.cadence = 'event_driven'; eventWithLag.release.expected_lag_days = 1
check('event-driven v2 releases reject a nonzero expected lag', parsedV2(eventWithLag) === null)
eventWithLag.release.expected_lag_days = 0
check('event-driven v2 releases express their bounded recheck window only through grace_days',
  parsedV2(eventWithLag) !== null)

const manualValid = clone(referenceRaw)
manualValid.acquisition = 'manual'; manualValid.manual = true; manualValid.manual_ingest = { file_arg: '--input-file' }
check('a consistent manual connector parses', !!parsedV2(manualValid))
const manualWithoutIngest = clone(manualValid); delete manualWithoutIngest.manual_ingest
check('manual=true requires a manual_ingest contract', parsedV2(manualWithoutIngest) === null)
const manualAcquisitionWithoutFlag = clone(referenceRaw); manualAcquisitionWithoutFlag.acquisition = 'manual'
check('acquisition=manual requires manual=true', parsedV2(manualAcquisitionWithoutFlag) === null)
const automaticWithManualFlag = clone(referenceRaw)
automaticWithManualFlag.manual = true; automaticWithManualFlag.manual_ingest = { file_arg: '--input-file' }
check('automatic acquisition cannot set manual=true', parsedV2(automaticWithManualFlag) === null)
const automaticWithManualIngest = clone(referenceRaw); automaticWithManualIngest.manual_ingest = { file_arg: '--input-file' }
check('automatic connector cannot carry manual_ingest', parsedV2(automaticWithManualIngest) === null)

// ── fallback ownership: identity, semantics, priority, and invalid-primary cascade ──
const primaryRaw = clone(referenceRaw)
primaryRaw.id = 'fixture-primary'; primaryRaw.dataset_id = 'fixture.primary'; primaryRaw.series_id = 'fixture.series'
primaryRaw.series = 'Fixture series'; primaryRaw.provider = 'Primary provider'; primaryRaw.subjects = ['WHEAT']
const fallbackRaw = clone(primaryRaw)
fallbackRaw.id = 'fixture-fallback'; fallbackRaw.dataset_id = 'fixture.fallback'; fallbackRaw.provider = 'Fallback provider'
fallbackRaw.provider_priority = 200; fallbackRaw.fallback_for = primaryRaw.id
fallbackRaw.output_path = 'data/<SUBJECT>/external/fixture-fallback/series_<as_of>.json'
const primary = parsedV2(primaryRaw)!
const fallback = parsedV2(fallbackRaw)!
check('a semantically identical, explicitly linked fallback is admitted',
  honestCoverage([primary, fallback]).length === 2)

const credentialOwnerARaw = clone(referenceRaw)
credentialOwnerARaw.id = 'credential-owner-a'; credentialOwnerARaw.dataset_id = 'credential.owner-a'
credentialOwnerARaw.series_id = 'credential.owner-a'; credentialOwnerARaw.credential_env = ['CONNECTOR_SHARED_TOKEN']
const credentialOwnerBRaw = clone(credentialOwnerARaw)
credentialOwnerBRaw.id = 'credential-owner-b'; credentialOwnerBRaw.dataset_id = 'credential.owner-b'
credentialOwnerBRaw.series_id = 'credential.owner-b'; credentialOwnerBRaw.provider = 'Another provider'
credentialOwnerBRaw.host_allowlist = ['another.example.com']
credentialOwnerBRaw.output_path = 'data/<SUBJECT>/external/credential-owner-b/series_<as_of>.json'
check('one credential environment name cannot cross connector/provider trust domains',
  honestCoverage([parsedV2(credentialOwnerARaw)!, parsedV2(credentialOwnerBRaw)!]).length === 0)

const seriesDriftRaw = clone(fallbackRaw); seriesDriftRaw.series = 'Different human series'
check('fallback human-series drift is rejected',
  honestCoverage([primary, parsedV2(seriesDriftRaw)!]).map((c) => c.id).join(',') === primary.id)
const schemaDriftRaw = clone(fallbackRaw); schemaDriftRaw.output_schema.contract = 'date'
check('fallback output-schema drift is rejected',
  honestCoverage([primary, parsedV2(schemaDriftRaw)!]).map((c) => c.id).join(',') === primary.id)
const unitDriftRaw = clone(fallbackRaw)
for (const key of Object.keys(unitDriftRaw.units)) unitDriftRaw.units[key] = 'lots'
check('fallback unit drift is rejected',
  honestCoverage([primary, parsedV2(unitDriftRaw)!]).map((c) => c.id).join(',') === primary.id)
const historyDriftRaw = clone(fallbackRaw); historyDriftRaw.minimum_history = { observations: 1 }
check('fallback minimum-history drift is rejected',
  honestCoverage([primary, parsedV2(historyDriftRaw)!]).map((c) => c.id).join(',') === primary.id)
const projectionCollisionRaw = clone(fallbackRaw); projectionCollisionRaw.output_path = primaryRaw.output_path
check('even same-series fallbacks cannot share a materialized projection path',
  honestCoverage([primary, parsedV2(projectionCollisionRaw)!]).length === 0)
const distinctProjectionA = { ...primary, id: 'projection-a', dataset_id: 'projection.a', series_id: 'projection.a',
  output_path: 'data/<SUBJECT>/external/fixture/series_<as_of>.json' }
const distinctProjectionB = { ...primary, id: 'projection-b', dataset_id: 'projection.b', series_id: 'projection.b',
  output_path: 'data/<SUBJECT>/external/fixture/./series_<as_of>.json' }
const distinctProjectionCase = { ...primary, id: 'projection-case', dataset_id: 'projection.case', series_id: 'projection.case',
  output_path: 'data/<SUBJECT>/external/FIXTURE/series_<as_of>.json' }
check('defence-in-depth collision ownership normalizes dot and case aliases from unchecked callers',
  honestCoverage([distinctProjectionA, distinctProjectionB]).length === 0
  && honestCoverage([distinctProjectionA, distinctProjectionCase]).length === 0)
const sameManifestUncheckedCase = {
  ...primary, id: 'same-case-owner', dataset_id: 'case.same', series_id: 'case.same',
  subjects: ['GOLD', 'gold'], output_path: 'data/<SUBJECT>/external/case-same/series_<as_of>.json',
}
check('same-manifest subject aliases fail closed even when an unchecked caller bypasses v2 parsing',
  honestCoverage([sameManifestUncheckedCase]).length === 0)
const crossCaseUpper = {
  ...primary, id: 'cross-case-upper', dataset_id: 'case.upper', series_id: 'case.upper', subjects: ['GOLD'],
  output_path: 'data/<SUBJECT>/external/case-upper/series_<as_of>.json',
}
const crossCaseLower = {
  ...primary, id: 'cross-case-lower', dataset_id: 'case.lower', series_id: 'case.lower', subjects: ['gold'],
  output_path: 'data/<SUBJECT>/external/case-lower/series_<as_of>.json',
}
check('cross-manifest subject case aliases fail closed before a case-insensitive filesystem can merge them',
  honestCoverage([crossCaseUpper, crossCaseLower]).length === 0)
const currentIdentityA = {
  ...primary, id: 'current-case-a', dataset_id: 'current.dataset', series_id: 'current.series',
  output_path: 'data/<SUBJECT>/external/current-a/series_<as_of>.json',
}
const currentIdentityB = {
  ...primary, id: 'current-case-b', dataset_id: 'CURRENT.DATASET', series_id: 'CURRENT.SERIES',
  output_path: 'data/<SUBJECT>/external/current-b/series_<as_of>.json',
}
check('canonical-current identity ownership is casefolded for unchecked manifests',
  honestCoverage([currentIdentityA, currentIdentityB]).length === 0)
const duplicatePriorityRaw = clone(fallbackRaw); duplicatePriorityRaw.provider_priority = primary.provider_priority
check('equal fallback priority makes the entire ambiguous coverage group unusable',
  honestCoverage([primary, parsedV2(duplicatePriorityRaw)!]).length === 0)

const multiPrimaryRaw = clone(primaryRaw); multiPrimaryRaw.subjects = ['WHEAT', 'CORN']
const childRaw = clone(fallbackRaw); childRaw.subjects = ['WHEAT']
const conflictingRaw = clone(primaryRaw)
conflictingRaw.id = 'fixture-conflict'; conflictingRaw.dataset_id = 'fixture.conflict'
conflictingRaw.provider = 'Conflicting provider'; conflictingRaw.subjects = ['CORN']; conflictingRaw.provider_priority = 300
const cascaded = honestCoverage([parsedV2(multiPrimaryRaw)!, parsedV2(childRaw)!, parsedV2(conflictingRaw)!])
check('a fallback is removed when its named primary is invalidated in another subject group',
  !cascaded.some((c) => c.id === childRaw.id))

// ── canonical v2 fixture: linked receipts, atomic current, and exact health ──
interface CanonicalFixture {
  root: string
  dataDir: string
  connector: ConnectorManifest
  currentPath: string
  current: any
  heads: { sequence: number; path: string; metadata_sha256: string; chain_sha256: string }[]
  vintagePaths: string[]
  receiptPaths: string[]
  blobPaths: string[]
  projectionPath: string
  projectionSidecarPath: string
  health: Map<string, FeedHealth>
}
const fixtureRoots: string[] = []
let fixtureNumber = 0
interface FixtureOptions {
  cadence?: string
  releases?: { asOf: string; retrievedAt: string; value: string }[]
  manual?: boolean
}
function writeBytes(file: string, bytes: string | Buffer): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, bytes)
}
function canonicalFixture(options: FixtureOptions = {}): CanonicalFixture {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `connector-registry-v2-${++fixtureNumber}-`))
  fixtureRoots.push(root)
  const dataDir = path.join(root, 'data')
  const connectorDir = path.join(root, 'connector')
  fs.mkdirSync(connectorDir, { recursive: true })
  fs.writeFileSync(path.join(connectorDir, 'fetch.py'), '# fixture transform\n', 'utf8')
  const raw = clone(referenceRaw)
  raw.id = `canonical-${fixtureNumber}`
  raw.dataset_id = `canonical.dataset-${fixtureNumber}`
  raw.series_id = `canonical.series-${fixtureNumber}`
  raw.series = `Canonical fixture ${fixtureNumber}`
  raw.satisfies = ['canonical-need']
  raw.provider = 'Canonical provider'
  raw.output_path = 'data/<SUBJECT>/external/canonical/fixture_<as_of>.json'
  if (options.manual) {
    raw.acquisition = 'manual'
    raw.manual = true
    raw.manual_ingest = { file_arg: '--input-file' }
  }
  if (options.cadence) {
    raw.release.cadence = options.cadence
  }
  raw.release.timezone = 'UTC'
  fs.writeFileSync(path.join(connectorDir, 'connector.json'), `${canonicalJson(raw)}\n`, 'utf8')
  const connector = parseManifest(connectorDir, raw)!
  const fingerprint = connectorFingerprint(connectorDir)
  const releases = options.releases ?? [
    { asOf: '2026-07-01', retrievedAt: '2026-07-05T00:00:00Z', value: '1.25' },
    { asOf: '2026-07-08', retrievedAt: '2026-07-12T00:00:00Z', value: '1.0' },
  ]
  const heads: { sequence: number; path: string; metadata_sha256: string; chain_sha256: string }[] = []
  const vintagePaths: string[] = []
  const receiptPaths: string[] = []
  const blobPaths: string[] = []
  let latestVintage: any = null
  let priorHead: { sequence: number; path: string; metadata_sha256: string; chain_sha256: string } | null = null
  const publisherFingerprint = publisherContractFingerprint()
  for (let index = 0; index < releases.length; index++) {
    const release = releases[index]
    const payloadBytes = `${canonicalJson({
      as_of: release.asOf, fraction: 0.125, scientific: Number(release.value), series: connector.series,
    })}\n`
    const contentSha = sha(payloadBytes)
    const blobRel = `_connectors/blobs/sha256/${contentSha.slice(0, 2)}/${contentSha}.json`
    const blobPath = path.join(dataDir, blobRel)
    writeBytes(blobPath, payloadBytes)
    blobPaths.push(blobPath)
    const stamp = release.retrievedAt.replace(/[-:.]/g, '').replace(
      /(\d{8}T\d{6})(\d*)Z$/,
      (_all, base, fraction) => `${base}${String(fraction).padEnd(6, '0').slice(0, 6)}Z`,
    )
    const vintageRel = `_connectors/vintages/${connector.dataset_id}/${connector.series_id}/WHEAT/`
      + `${stamp}_${contentSha}.json`
    const vintagePath = path.join(dataDir, vintageRel)
    const provenance: any = {
      provider: connector.provider, provider_priority: connector.provider_priority,
      fallback_for: connector.fallback_for, acquisition: connector.acquisition,
      authority_class: connector.authority_class, source_type: connector.source_type,
      tier: connector.tier, license: connector.license, licensing: connector.licensing,
      connector_id: connector.id, dataset_id: connector.dataset_id, series_id: connector.series_id,
      series: connector.series, subject: 'WHEAT', as_of: release.asOf, retrieved_at: release.retrievedAt,
      content_sha256: contentSha, revision_of: null, connector_fingerprint: fingerprint,
      publisher_contract_fingerprint: publisherFingerprint, connector_commit: `commit-${index + 1}`,
      manifest_version: 2, schema_version: connector.schema_version,
      source_url: 'https://publicreporting.cftc.gov/fixture', published_at: release.asOf,
    }
    const manualInput = options.manual ? {
      sha256: 'a'.repeat(64), size_bytes: 123, filename: 'fixture.csv', detected_format: 'csv',
    } : null
    if (manualInput) {
      provenance.manual_input = manualInput
      provenance.acquired_via = 'manual_local_file'
    }
    let vintage: any = {
      manifest_version: connector.manifest_version,
      schema_version: connector.schema_version,
      connector_id: connector.id,
      dataset_id: connector.dataset_id,
      series_id: connector.series_id,
      series: connector.series,
      subject: 'WHEAT',
      provider: connector.provider,
      authority_class: connector.authority_class,
      provider_priority: connector.provider_priority,
      fallback_for: connector.fallback_for,
      acquisition: connector.acquisition,
      source_type: connector.source_type,
      tier: connector.tier,
      license: connector.license,
      release: connector.release,
      licensing: connector.licensing,
      output_schema: connector.output_schema,
      units: connector.units,
      minimum_history: connector.minimum_history,
      as_of: release.asOf,
      retrieved_at: release.retrievedAt,
      content_sha256: contentSha,
      connector_fingerprint: fingerprint,
      publisher_contract_fingerprint: publisherFingerprint,
      connector_commit: `commit-${index + 1}`,
      source_url: provenance.source_url,
      published_at: release.asOf,
      history_kind: index === 0 ? 'first_observed_vintage' : 'true_point_in_time',
      blob_path: blobRel,
      legacy_path: `WHEAT/external/canonical/fixture_${release.asOf}.json`,
      revision_of: null,
      provenance,
      ...(manualInput ? { manual_input: manualInput } : {}),
    }
    const id = `sha256:${sha(canonicalJson(vintage) + '\n')}`
    vintage.vintage_id = id; provenance.vintage_id = id
    const vintageBytes = `${canonicalJson(vintage)}\n`
    writeBytes(vintagePath, vintageBytes)
    vintagePaths.push(vintagePath)
    const sequence = index + 1
    const metadataSha = sha(vintageBytes)
    const headWithoutChain = { sequence, path: vintageRel, metadata_sha256: metadataSha }
    const chainSha = sha(canonicalJson({
      sequence, vintage_path: vintageRel, vintage_metadata_sha256: metadataSha, prior_head: priorHead,
    }) + '\n')
    const head = { ...headWithoutChain, chain_sha256: chainSha }
    heads.push(head)
    const receiptRel = `_connectors/commits/${connector.dataset_id}/${connector.series_id}/WHEAT/${metadataSha}.json`
    const receiptPath = path.join(dataDir, receiptRel)
    writeBytes(receiptPath, `${canonicalJson({
      commit_protocol_version: 1,
      connector_id: connector.id,
      dataset_id: connector.dataset_id,
      series_id: connector.series_id,
      subject: 'WHEAT',
      sequence, vintage_id: id, vintage_path: vintageRel,
      vintage_metadata_sha256: metadataSha,
      content_sha256: contentSha,
      retrieved_at: release.retrievedAt,
      prior_head: priorHead, chain_sha256: chainSha,
    })}\n`)
    receiptPaths.push(receiptPath)
    const markerPath = path.join(dataDir, '_connectors', 'committed_heads', connector.dataset_id,
      connector.series_id, 'WHEAT', `${String(sequence).padStart(20, '0')}.json`)
    writeBytes(markerPath, `${canonicalJson({
      commit_protocol_version: 1, connector_id: connector.id, dataset_id: connector.dataset_id,
      series_id: connector.series_id, subject: 'WHEAT', committed_head: head,
    })}\n`)
    latestVintage = vintage
    priorHead = head
  }
  const latestHead = heads[heads.length - 1]
  const current = {
    ...latestVintage,
    committed_count: heads.length,
    committed_head: latestHead,
    commit_protocol_version: 1,
    commit_receipt_path: `_connectors/commits/${connector.dataset_id}/${connector.series_id}/WHEAT/${latestHead.metadata_sha256}.json`,
  }
  const currentPath = path.join(dataDir, '_connectors', 'current', connector.dataset_id, connector.series_id, 'WHEAT.json')
  writeBytes(currentPath, `${canonicalJson(current)}\n`)
  const projectionPath = path.join(dataDir, current.legacy_path)
  const projectionSidecarPath = `${projectionPath}.source.json`
  writeBytes(projectionPath, fs.readFileSync(blobPaths[blobPaths.length - 1]))
  writeBytes(projectionSidecarPath, `${canonicalJson(current.provenance)}\n`)
  const healthRow: FeedHealth = {
    connector: connector.id, subject: 'WHEAT', state: 'current', decision: 'refetched', outcome: 'current',
    failureKind: null, lastSweepAt: current.retrieved_at, message: '', failStreak: 0, attempts: 1,
    datasetId: connector.dataset_id, seriesId: connector.series_id, provider: connector.provider,
    latestAsOf: current.as_of, retrievedAt: current.retrieved_at, contentSha256: current.content_sha256,
    connectorFingerprint: current.connector_fingerprint,
    publisherContractFingerprint: current.publisher_contract_fingerprint,
    vintageId: current.vintage_id, connectorCommit: current.connector_commit,
  }
  return {
    root, dataDir, connector, currentPath, current, heads, vintagePaths, receiptPaths, blobPaths,
    projectionPath, projectionSidecarPath,
    health: new Map([[feedKey(connector.id, 'WHEAT'), healthRow]]),
  }
}

function pythonPublishedFixture(): { connector: ConnectorManifest; dataDir: string; current: any } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `connector-registry-python-${++fixtureNumber}-`))
  fixtureRoots.push(root)
  const dataDir = path.join(root, 'data')
  const connectorDir = path.join(root, 'connector')
  fs.mkdirSync(connectorDir, { recursive: true })
  fs.writeFileSync(path.join(connectorDir, 'fetch.py'), '# Python publication fixture\n', 'utf8')
  const raw = clone(referenceRaw)
  raw.id = `python-published-${fixtureNumber}`
  raw.dataset_id = `python.published-${fixtureNumber}`
  raw.series_id = `python.published-series-${fixtureNumber}`
  raw.series = `Python published fixture ${fixtureNumber}`
  raw.satisfies = ['python-published-need']
  raw.provider = 'Python fixture provider'
  raw.output_path = 'data/<SUBJECT>/external/python-fixture/series_<as_of>.json'
  raw.output_schema = {
    as_of: 'date', series: 'string', one: 'float', small: 'float', negative_zero: 'float',
  }
  raw.units = { one: 'index', small: 'index', negative_zero: 'index' }
  raw.minimum_history = { observations: 1 }
  raw.release.timezone = 'UTC'
  const manifestPath = path.join(connectorDir, 'connector.json')
  fs.writeFileSync(manifestPath, `${canonicalJson(raw)}\n`, 'utf8')
  const connector = parseManifest(connectorDir, raw)!
  const fingerprint = connectorFingerprint(connectorDir)
  const publisherFingerprint = publisherContractFingerprint()
  execFileSync('python3', ['-c', [
    'import json,sys',
    'from datetime import datetime,timezone',
    `sys.path.insert(0, ${JSON.stringify(path.join(repoRoot, '.claude', 'tools'))})`,
    'import run_connectors',
    'manifest=json.load(open(sys.argv[1]))',
    'manifest["_dir"]=sys.argv[2]',
    'payload={"as_of":"2026-07-08","series":manifest["series"],"one":1.0,"small":1e-6,"negative_zero":-0.0}',
    'sidecar={"source_url":"https://publicreporting.cftc.gov/python-fixture","published_at":"2026-07-08",'
      + '"numeric_proof":{"one":1.0,"small":1e-6,"negative_zero":-0.0}}',
    'outcome,current,error=run_connectors.publish_validated(manifest,"WHEAT",sys.argv[3],'
      + '{"as_of":"2026-07-08","payload":payload,"sidecar":sidecar},'
      + 'datetime(2026,7,12,tzinfo=timezone.utc),connector_hash=sys.argv[4],publisher_hash=sys.argv[5],'
      + 'commit="python-fixture-commit")',
    'assert outcome=="published" and error is None',
  ].join(';'), manifestPath, connectorDir, dataDir, fingerprint, publisherFingerprint])
  const currentPath = path.join(
    dataDir, '_connectors', 'current', connector.dataset_id, connector.series_id, 'WHEAT.json',
  )
  return { connector, dataDir, current: JSON.parse(fs.readFileSync(currentPath, 'utf8')) }
}
function rewriteCurrent(fixture: CanonicalFixture, mutate: (current: any) => void): void {
  const current = clone(fixture.current); mutate(current)
  fs.writeFileSync(fixture.currentPath, `${canonicalJson(current)}\n`, 'utf8')
}

function addSealedReceiptBranch(
  fixture: CanonicalFixture,
  sequence: number,
  priorHead: CanonicalFixture['heads'][number] | null,
  retrievedAt: string,
): void {
  const vintage = clone(fixture.current)
  for (const key of ['committed_count', 'committed_head', 'commit_protocol_version', 'commit_receipt_path']) {
    delete vintage[key]
  }
  vintage.retrieved_at = retrievedAt
  vintage.provenance.retrieved_at = retrievedAt
  delete vintage.vintage_id
  delete vintage.provenance.vintage_id
  const id = `sha256:${sha(canonicalJson(vintage) + '\n')}`
  vintage.vintage_id = id
  vintage.provenance.vintage_id = id
  const vintageBytes = `${canonicalJson(vintage)}\n`
  const metadataSha = sha(vintageBytes)
  const stamp = retrievedAt.replace(/[-:.]/g, '').replace(/(\d{8}T\d{6})(\d*)Z$/, (_all, base, fraction) =>
    `${base}${String(fraction).padEnd(6, '0').slice(0, 6)}Z`)
  const vintageRel = `_connectors/vintages/${fixture.connector.dataset_id}/${fixture.connector.series_id}/WHEAT/`
    + `${stamp}_${vintage.content_sha256}.json`
  writeBytes(path.join(fixture.dataDir, vintageRel), vintageBytes)
  const head = {
    sequence, path: vintageRel, metadata_sha256: metadataSha,
    chain_sha256: sha(canonicalJson({
      sequence, vintage_path: vintageRel, vintage_metadata_sha256: metadataSha, prior_head: priorHead,
    }) + '\n'),
  }
  const receiptRel = `_connectors/commits/${fixture.connector.dataset_id}/${fixture.connector.series_id}/WHEAT/`
    + `${metadataSha}.json`
  writeBytes(path.join(fixture.dataDir, receiptRel), `${canonicalJson({
    commit_protocol_version: 1, connector_id: fixture.connector.id,
    dataset_id: fixture.connector.dataset_id, series_id: fixture.connector.series_id, subject: 'WHEAT',
    sequence, vintage_id: id, vintage_path: vintageRel, vintage_metadata_sha256: metadataSha,
    content_sha256: vintage.content_sha256, retrieved_at: retrievedAt, prior_head: priorHead,
    chain_sha256: head.chain_sha256,
  })}\n`)
}

function resealLatestVintage(
  fixture: CanonicalFixture,
  mutate: (vintage: any) => void,
  rawTransform?: (canonicalBytes: Buffer, vintage: any) => Buffer,
): void {
  const index = fixture.vintagePaths.length - 1
  const priorHead = index > 0 ? fixture.heads[index - 1] : null
  const oldHead = fixture.heads[index]
  const oldReceipt = fixture.receiptPaths[index]
  const vintage = JSON.parse(fs.readFileSync(fixture.vintagePaths[index], 'utf8'))
  mutate(vintage)
  delete vintage.vintage_id
  if (vintage.provenance && typeof vintage.provenance === 'object') delete vintage.provenance.vintage_id
  const id = `sha256:${sha(canonicalJson(vintage) + '\n')}`
  vintage.vintage_id = id
  if (vintage.provenance && typeof vintage.provenance === 'object') vintage.provenance.vintage_id = id
  const canonicalBytes = Buffer.from(`${canonicalJson(vintage)}\n`, 'utf8')
  const vintageBytes = rawTransform ? rawTransform(canonicalBytes, vintage) : canonicalBytes
  fs.writeFileSync(fixture.vintagePaths[index], vintageBytes)
  const metadataSha = sha(vintageBytes)
  const sequence = index + 1
  const head = {
    sequence, path: oldHead.path, metadata_sha256: metadataSha,
    chain_sha256: sha(canonicalJson({
      sequence, vintage_path: oldHead.path, vintage_metadata_sha256: metadataSha, prior_head: priorHead,
    }) + '\n'),
  }
  fs.unlinkSync(oldReceipt)
  const receipt = {
    commit_protocol_version: 1, connector_id: fixture.connector.id,
    dataset_id: fixture.connector.dataset_id, series_id: fixture.connector.series_id, subject: 'WHEAT', sequence,
    vintage_id: id, vintage_path: oldHead.path, vintage_metadata_sha256: metadataSha,
    content_sha256: vintage.content_sha256 ?? fixture.current.content_sha256,
    retrieved_at: vintage.retrieved_at ?? fixture.current.retrieved_at,
    prior_head: priorHead, chain_sha256: head.chain_sha256,
  }
  const receiptPath = path.join(path.dirname(oldReceipt), `${metadataSha}.json`)
  writeBytes(receiptPath, `${canonicalJson(receipt)}\n`)
  const markerPath = path.join(
    fixture.dataDir, '_connectors', 'committed_heads', fixture.connector.dataset_id,
    fixture.connector.series_id, 'WHEAT', `${String(sequence).padStart(20, '0')}.json`,
  )
  writeBytes(markerPath, `${canonicalJson({
    commit_protocol_version: 1, connector_id: fixture.connector.id,
    dataset_id: fixture.connector.dataset_id, series_id: fixture.connector.series_id,
    subject: 'WHEAT', committed_head: head,
  })}\n`)
  const current = {
    ...vintage, committed_count: sequence, committed_head: head, commit_protocol_version: 1,
    commit_receipt_path: `_connectors/commits/${fixture.connector.dataset_id}/`
      + `${fixture.connector.series_id}/WHEAT/${metadataSha}.json`,
  }
  fs.writeFileSync(fixture.currentPath, `${canonicalJson(current)}\n`, 'utf8')
  if (vintage.provenance && typeof vintage.provenance === 'object') {
    fs.writeFileSync(fixture.projectionSidecarPath, `${canonicalJson(vintage.provenance)}\n`, 'utf8')
  }
  fixture.current = current
  fixture.heads[index] = head
  fixture.receiptPaths[index] = receiptPath
}

let relocationNumber = 0
function replaceWithInsideRootSymlink(
  fixture: CanonicalFixture, target: string, kind: 'file' | 'dir' = 'file',
): void {
  const relocated = path.join(
    fixture.dataDir, '_relocated-test-artifacts', `${++relocationNumber}-${path.basename(target)}`,
  )
  fs.mkdirSync(path.dirname(relocated), { recursive: true })
  fs.renameSync(target, relocated)
  fs.symlinkSync(relocated, target, kind)
}

const canonical = canonicalFixture()
const deadline = Date.parse('2026-07-27T00:00:00Z') // Jul-08 as_of + one week + 3d lag + 9d grace
const pythonBlobRoot = execFileSync('python3', ['-c', [
  'import json,os,sys',
  `sys.path.insert(0, ${JSON.stringify(path.join(repoRoot, 'scripts'))})`,
  'from connector_contract import connector_storage_paths',
  'manifest=json.load(open(sys.argv[2]))',
  'root=os.path.realpath(os.path.abspath(sys.argv[1]))',
  'print(os.path.relpath(connector_storage_paths(root, manifest, "WHEAT")["blobs"], root).replace(os.sep,"/"))',
].join(';'), canonical.dataDir, path.join(canonical.connector.dir, 'connector.json')], { encoding: 'utf8' }).trim()
check('the TS fixture and reader use Python publisher\'s exact content-addressed blob namespace',
  pythonBlobRoot === '_connectors/blobs/sha256'
  && canonical.current.blob_path.startsWith(`${pythonBlobRoot}/${canonical.current.content_sha256.slice(0, 2)}/`))
const pythonPublished = pythonPublishedFixture()
const pythonPublishedStatus = connectorCurrentStatus(
  pythonPublished.connector, 'WHEAT', pythonPublished.dataDir, deadline,
)
check('an actual Python publication with 1.0, 1e-6 and -0.0 metadata is usable in the TS reader',
  pythonPublishedStatus?.usable === true && pythonPublishedStatus.projectionIntact === true
  && pythonPublished.current.provenance.numeric_proof.one === 1
  && pythonPublished.current.provenance.numeric_proof.small === 0.000001
  && Object.is(pythonPublished.current.provenance.numeric_proof.negative_zero, 0))
const atDeadline = connectorCurrentStatus(canonical.connector, 'WHEAT', canonical.dataDir, deadline)
check('an untampered two-vintage v2 chain is canonical and usable at its frozen deadline',
  !!atDeadline && atDeadline.asOf === '2026-07-08' && atDeadline.usable)
check('the frozen release deadline is inclusive but expires one second later',
  connectorCurrentStatus(canonical.connector, 'WHEAT', canonical.dataDir, deadline + 1000)?.usable === false)
const beforeRetrieval = Date.parse(canonical.current.retrieved_at) - 1000
const pythonBeforeRetrieval = execFileSync('python3', ['-c', [
  'import json,sys',
  `sys.path.insert(0, ${JSON.stringify(path.join(repoRoot, 'scripts'))})`,
  'from connector_vintages import vintage_is_eligible_at',
  'print("true" if vintage_is_eligible_at(json.load(open(sys.argv[1])), sys.argv[2]) else "false")',
].join(';'), canonical.currentPath, new Date(beforeRetrieval).toISOString()], { encoding: 'utf8' }).trim()
check('Python and TypeScript both reject a vintage before its actual retrieval instant',
  pythonBeforeRetrieval === 'false'
  && connectorCurrentStatus(
    canonical.connector, 'WHEAT', canonical.dataDir, beforeRetrieval,
  )?.usable === false
  && healthyBuiltBySatisfies('WHEAT', {
    connectors: [canonical.connector], health: canonical.health,
    dataDir: canonical.dataDir, nowMs: beforeRetrieval,
  }).size === 0)

const allowedRootAlias = canonicalFixture()
const aliasedDataRoot = path.join(allowedRootAlias.root, 'configured-data-root-link')
fs.symlinkSync(allowedRootAlias.dataDir, aliasedDataRoot, 'dir')
check('the configured data root itself may be a symlink to the resolved mounted pool',
  connectorCurrentStatus(allowedRootAlias.connector, 'WHEAT', aliasedDataRoot, deadline)?.projectionIntact === true)

for (const [label, targetOf] of [
  ['current pointer', (fixture: CanonicalFixture) => fixture.currentPath],
  ['latest vintage', (fixture: CanonicalFixture) => fixture.vintagePaths[fixture.vintagePaths.length - 1]],
  ['latest receipt', (fixture: CanonicalFixture) => fixture.receiptPaths[fixture.receiptPaths.length - 1]],
  ['latest sequence marker', (fixture: CanonicalFixture) => path.join(
    fixture.dataDir, '_connectors', 'committed_heads', fixture.connector.dataset_id,
    fixture.connector.series_id, 'WHEAT', '00000000000000000002.json',
  )],
  ['latest content blob', (fixture: CanonicalFixture) => fixture.blobPaths[fixture.blobPaths.length - 1]],
] as [string, (fixture: CanonicalFixture) => string][]) {
  const relocated = canonicalFixture()
  replaceWithInsideRootSymlink(relocated, targetOf(relocated))
  check(`canonical current rejects a relocated ${label} reached through an inside-root file symlink`,
    connectorCurrentStatus(relocated.connector, 'WHEAT', relocated.dataDir, deadline) === null)
}

for (const [label, targetOf] of [
  ['current pointer', (fixture: CanonicalFixture) => fixture.currentPath],
  ['latest vintage', (fixture: CanonicalFixture) => fixture.vintagePaths[fixture.vintagePaths.length - 1]],
  ['latest receipt', (fixture: CanonicalFixture) => fixture.receiptPaths[fixture.receiptPaths.length - 1]],
  ['latest sequence marker', (fixture: CanonicalFixture) => path.join(
    fixture.dataDir, '_connectors', 'committed_heads', fixture.connector.dataset_id,
    fixture.connector.series_id, 'WHEAT', '00000000000000000002.json',
  )],
  ['latest content blob', (fixture: CanonicalFixture) => fixture.blobPaths[fixture.blobPaths.length - 1]],
] as [string, (fixture: CanonicalFixture) => string][]) {
  const linked = canonicalFixture()
  const target = targetOf(linked)
  const tempLane = path.join(linked.dataDir, '_connectors', '.publication-tmp')
  fs.mkdirSync(tempLane, { recursive: true })
  const alias = path.join(tempLane, `${label.replaceAll(' ', '-')}.immutable.pending`)
  fs.linkSync(target, alias)
  check(`canonical current rejects a multi-link ${label} before its writable alias can be trusted`,
    fs.lstatSync(target).nlink === 2
    && connectorCurrentStatus(linked.connector, 'WHEAT', linked.dataDir, deadline) === null)
}

const mutatingHardlink = canonicalFixture()
const mutatingHardlinkBlob = mutatingHardlink.blobPaths[mutatingHardlink.blobPaths.length - 1]
const mutatingHardlinkLane = path.join(mutatingHardlink.dataDir, '_connectors', '.publication-tmp')
fs.mkdirSync(mutatingHardlinkLane, { recursive: true })
const mutatingHardlinkAlias = path.join(mutatingHardlinkLane, 'crashed-writer.immutable.pending')
fs.linkSync(mutatingHardlinkBlob, mutatingHardlinkAlias)
const hiddenBeforeAliasWrite = connectorCurrentStatus(
  mutatingHardlink.connector, 'WHEAT', mutatingHardlink.dataDir, deadline,
) === null
const changedThroughAlias = fs.readFileSync(mutatingHardlinkAlias)
changedThroughAlias[0] = '!'.charCodeAt(0)
fs.writeFileSync(mutatingHardlinkAlias, changedThroughAlias)
check('writing through a crashed publication alias never changes accepted canonical evidence',
  hiddenBeforeAliasWrite && connectorCurrentStatus(
    mutatingHardlink.connector, 'WHEAT', mutatingHardlink.dataDir, deadline,
  ) === null)

const aliasedCanonicalLane = canonicalFixture()
replaceWithInsideRootSymlink(
  aliasedCanonicalLane, path.dirname(aliasedCanonicalLane.vintagePaths[0]), 'dir',
)
check('canonical current rejects a symlinked immutable-lane parent even when its target remains inside data',
  connectorCurrentStatus(aliasedCanonicalLane.connector, 'WHEAT', aliasedCanonicalLane.dataDir, deadline) === null)

for (const [label, targetOf] of [
  ['projection', (fixture: CanonicalFixture) => fixture.projectionPath],
  ['projection sidecar', (fixture: CanonicalFixture) => fixture.projectionSidecarPath],
] as [string, (fixture: CanonicalFixture) => string][]) {
  const relocated = canonicalFixture()
  replaceWithInsideRootSymlink(relocated, targetOf(relocated))
  const status = connectorCurrentStatus(relocated.connector, 'WHEAT', relocated.dataDir, deadline)
  check(`a relocated ${label} file symlink cannot preserve projection integrity or sufficiency`,
    status?.projectionIntact === false && healthyBuiltBySatisfies('WHEAT', {
      connectors: [relocated.connector], health: relocated.health,
      dataDir: relocated.dataDir, nowMs: deadline,
    }).size === 0)
}

const aliasedProjectionParent = canonicalFixture()
replaceWithInsideRootSymlink(
  aliasedProjectionParent, path.dirname(aliasedProjectionParent.projectionPath), 'dir',
)
const aliasedProjectionStatus = connectorCurrentStatus(
  aliasedProjectionParent.connector, 'WHEAT', aliasedProjectionParent.dataDir, deadline,
)
check('a projection-parent symlink cannot preserve projection integrity or close a required need',
  aliasedProjectionStatus?.projectionIntact === false && healthyBuiltBySatisfies('WHEAT', {
    connectors: [aliasedProjectionParent.connector], health: aliasedProjectionParent.health,
    dataDir: aliasedProjectionParent.dataDir, nowMs: deadline,
  }).size === 0)

const ignoredTemporaryArtifacts = canonicalFixture()
for (const lane of [
  path.dirname(ignoredTemporaryArtifacts.vintagePaths[0]),
  path.dirname(ignoredTemporaryArtifacts.receiptPaths[0]),
  path.join(ignoredTemporaryArtifacts.dataDir, '_connectors', 'committed_heads',
    ignoredTemporaryArtifacts.connector.dataset_id, ignoredTemporaryArtifacts.connector.series_id, 'WHEAT'),
]) writeBytes(path.join(lane, 'orphaned-write.immutable.tmp'), 'interrupted forensic bytes')
check('regular .tmp crash debris in each immutable lane remains forensic and does not poison current',
  connectorCurrentStatus(
    ignoredTemporaryArtifacts.connector, 'WHEAT', ignoredTemporaryArtifacts.dataDir, deadline,
  )?.projectionIntact === true)

const interruptedExtraReceipt = canonicalFixture()
writeBytes(path.join(path.dirname(interruptedExtraReceipt.receiptPaths[0]), `${'e'.repeat(64)}.json`),
  '{"chain_sha256":"')
check('a strict canonical-object prefix from an interrupted extra receipt remains invisible forensic debris',
  connectorCurrentStatus(
    interruptedExtraReceipt.connector, 'WHEAT', interruptedExtraReceipt.dataDir, deadline,
  )?.projectionIntact === true)

const arbitraryExtraReceipt = canonicalFixture()
writeBytes(path.join(path.dirname(arbitraryExtraReceipt.receiptPaths[0]), `${'e'.repeat(64)}.json`),
  ' {"chain_sha256":"')
check('an arbitrary unreadable extra receipt is rejected rather than excused as an interrupted write',
  connectorCurrentStatus(arbitraryExtraReceipt.connector, 'WHEAT', arbitraryExtraReceipt.dataDir, deadline) === null)

for (const invalidAsOf of ['2026-02-30', '0000-02-01']) {
  const invalidCalendar = canonicalFixture({
    releases: [{ asOf: invalidAsOf, retrievedAt: '2026-03-01T00:00:00Z', value: '1' }],
  })
  check(`canonical current rejects impossible/non-ISO calendar date ${invalidAsOf}`,
    connectorCurrentStatus(invalidCalendar.connector, 'WHEAT', invalidCalendar.dataDir, deadline) === null)
}
for (const invalidRetrievedAt of ['2026-07-12T25:00:00Z', '2026-07-12T00:00:00+00:00']) {
  const invalidTimestamp = canonicalFixture({
    releases: [{ asOf: '2026-07-08', retrievedAt: invalidRetrievedAt, value: '1' }],
  })
  check(`canonical current rejects non-canonical UTC retrieval timestamp ${invalidRetrievedAt}`,
    connectorCurrentStatus(invalidTimestamp.connector, 'WHEAT', invalidTimestamp.dataDir, deadline) === null)
}

for (const spec of [
  // Calendar advancement preserves the day where possible and caps it at target month-end.
  { cadence: 'quarterly', asOf: '2026-01-31', retrievedAt: '2026-02-01T00:00:00Z', deadline: '2026-05-12T00:00:00Z' },
  { cadence: 'semiannual', asOf: '2026-08-31', retrievedAt: '2026-09-01T00:00:00Z', deadline: '2027-03-12T00:00:00Z' },
  { cadence: 'annual', asOf: '2024-02-29', retrievedAt: '2024-03-01T00:00:00Z', deadline: '2025-03-12T00:00:00Z' },
]) {
  const calendar = canonicalFixture({
    cadence: spec.cadence,
    releases: [{ asOf: spec.asOf, retrievedAt: spec.retrievedAt, value: '1e-7' }],
  })
  const calendarDeadline = Date.parse(spec.deadline)
  const statusAt = connectorCurrentStatus(calendar.connector, 'WHEAT', calendar.dataDir, calendarDeadline)
  const statusAfter = connectorCurrentStatus(calendar.connector, 'WHEAT', calendar.dataDir, calendarDeadline + 1000)
  check(`${spec.cadence} eligibility uses calendar month-end capping and includes its deadline`,
    !!statusAt?.usable && statusAfter?.usable === false)
}
const canonicalProjectionStatus = connectorCurrentStatus(canonical.connector, 'WHEAT', canonical.dataDir, deadline)
check('cross-runtime canonical numeric bytes keep the projection bound to its sealed blob',
  canonicalProjectionStatus?.projectionIntact === true, JSON.stringify({
    status: canonicalProjectionStatus,
    payloadBytesEqual: fs.readFileSync(canonical.projectionPath).equals(fs.readFileSync(canonical.blobPaths[1])),
    sidecarBytesEqual: fs.readFileSync(canonical.projectionSidecarPath).equals(
      Buffer.from(`${canonicalJson(canonical.current.provenance)}\n`),
    ),
  }))
check('canonical current plus an exactly bound healthy ledger closes the declared need',
  healthyBuiltBySatisfies('WHEAT', {
    connectors: [canonical.connector], health: canonical.health, dataDir: canonical.dataDir, nowMs: deadline,
  }).get('canonical-need') === canonical.connector.id)
check('expired canonical current cannot close a need', healthyBuiltBySatisfies('WHEAT', {
  connectors: [canonical.connector], health: canonical.health, dataDir: canonical.dataDir, nowMs: deadline + 1000,
}).size === 0)

const missingProjection = canonicalFixture()
fs.unlinkSync(missingProjection.projectionPath)
check('a missing materialized projection cannot close a need despite intact canonical storage',
  healthyBuiltBySatisfies('WHEAT', {
    connectors: [missingProjection.connector], health: missingProjection.health,
    dataDir: missingProjection.dataDir, nowMs: deadline,
  }).size === 0
  && connectorCurrentStatus(missingProjection.connector, 'WHEAT', missingProjection.dataDir, deadline)?.projectionIntact === false)
const badProjectionSidecar = canonicalFixture()
fs.writeFileSync(badProjectionSidecar.projectionSidecarPath, '{}\n')
check('a projection sidecar not exactly bound to current provenance cannot close a need',
  healthyBuiltBySatisfies('WHEAT', {
    connectors: [badProjectionSidecar.connector], health: badProjectionSidecar.health,
    dataDir: badProjectionSidecar.dataDir, nowMs: deadline,
  }).size === 0)

const prettyCurrent = canonicalFixture()
fs.writeFileSync(prettyCurrent.currentPath, `${JSON.stringify(prettyCurrent.current, null, 2)}\n`, 'utf8')
check('a noncanonical mutable current projection cannot authenticate immutable history',
  connectorCurrentStatus(prettyCurrent.connector, 'WHEAT', prettyCurrent.dataDir, deadline) === null)
for (const [label, targetOf] of [
  ['payload projection', (fixture: CanonicalFixture) => fixture.projectionPath],
  ['provenance projection', (fixture: CanonicalFixture) => fixture.projectionSidecarPath],
] as [string, (fixture: CanonicalFixture) => string][]) {
  const noncanonicalProjection = canonicalFixture()
  const target = targetOf(noncanonicalProjection)
  fs.writeFileSync(target, `${JSON.stringify(JSON.parse(fs.readFileSync(target, 'utf8')), null, 2)}\n`, 'utf8')
  check(`a pretty-printed ${label} cannot preserve byte-exact projection integrity`,
    connectorCurrentStatus(
      noncanonicalProjection.connector, 'WHEAT', noncanonicalProjection.dataDir, deadline,
    )?.projectionIntact === false)
}

const exactHealth = canonical.health.get(feedKey(canonical.connector.id, 'WHEAT'))!
for (const [field, value] of [
  ['datasetId', 'wrong.dataset'],
  ['seriesId', 'wrong.series'],
  ['provider', 'Wrong provider'],
  ['latestAsOf', '2026-07-07'],
  ['retrievedAt', '2026-07-12T00:00:01Z'],
  ['contentSha256', '0'.repeat(64)],
  ['vintageId', `sha256:${'0'.repeat(64)}`],
  ['connectorFingerprint', '1'.repeat(64)],
  ['publisherContractFingerprint', '2'.repeat(64)],
  ['connectorCommit', 'wrong-deployed-commit'],
] as [keyof FeedHealth, any][]) {
  const badHealth = new Map(canonical.health)
  badHealth.set(feedKey(canonical.connector.id, 'WHEAT'), { ...exactHealth, [field]: value })
  check(`health binding rejects mismatched ${field}`, healthyBuiltBySatisfies('WHEAT', {
    connectors: [canonical.connector], health: badHealth, dataDir: canonical.dataDir, nowMs: deadline,
  }).size === 0)
}
const suspectHealth = new Map(canonical.health)
suspectHealth.set(feedKey(canonical.connector.id, 'WHEAT'), { ...exactHealth, state: 'suspect' })
check('suspect health cannot close a need even with intact storage', healthyBuiltBySatisfies('WHEAT', {
  connectors: [canonical.connector], health: suspectHealth, dataDir: canonical.dataDir, nowMs: deadline,
}).size === 0)
const disagreementSibling = {
  ...canonical.connector,
  id: 'canonical-disagreement-sibling', dataset_id: 'canonical.disagreement-sibling',
  provider: 'Second provider', provider_priority: 200, fallback_for: canonical.connector.id,
  output_path: 'data/<SUBJECT>/external/canonical-sibling/fixture_<as_of>.json',
}
const disagreementHealth = new Map(canonical.health)
disagreementHealth.set(feedKey(disagreementSibling.id, 'WHEAT'), {
  ...exactHealth, connector: disagreementSibling.id, provider: disagreementSibling.provider,
  datasetId: disagreementSibling.dataset_id, state: 'suspect', failureKind: 'provider_disagreement',
})
check('an unresolved provider disagreement blocks every provider for the semantic series',
  healthyBuiltBySatisfies('WHEAT', {
    connectors: [canonical.connector, disagreementSibling], health: disagreementHealth,
    dataDir: canonical.dataDir, nowMs: deadline,
  }).size === 0)

const tamperedVintage = canonicalFixture()
fs.appendFileSync(tamperedVintage.vintagePaths[0], ' ')
check('current health inventories O(n) names but keeps constant record reads and does not open an older vintage',
  connectorCurrentStatus(tamperedVintage.connector, 'WHEAT', tamperedVintage.dataDir, deadline) !== null)
const droppedVintage = canonicalFixture()
fs.unlinkSync(droppedVintage.vintagePaths[0])
check('current health fails closed when an older committed vintage is missing',
  connectorCurrentStatus(droppedVintage.connector, 'WHEAT', droppedVintage.dataDir, deadline) === null)

const droppedMarker = canonicalFixture()
const firstMarkerPath = path.join(droppedMarker.dataDir, '_connectors', 'committed_heads',
  droppedMarker.connector.dataset_id, droppedMarker.connector.series_id, 'WHEAT', '00000000000000000001.json')
fs.unlinkSync(firstMarkerPath)
check('current health fails closed when an older immutable sequence marker is missing',
  connectorCurrentStatus(droppedMarker.connector, 'WHEAT', droppedMarker.dataDir, deadline) === null)

const forensicVintage = canonicalFixture()
const forensicVintagePath = path.join(
  path.dirname(forensicVintage.vintagePaths[1]),
  `20260713T000000000001Z_${'f'.repeat(64)}.json`,
)
fs.writeFileSync(forensicVintagePath, 'preserved crash artifact\n', 'utf8')
check('a publisher-shaped unclaimed vintage without a receipt remains forensic and does not poison current',
  connectorCurrentStatus(forensicVintage.connector, 'WHEAT', forensicVintage.dataDir, deadline) !== null)

const unexpectedVintageName = canonicalFixture()
fs.writeFileSync(path.join(path.dirname(unexpectedVintageName.vintagePaths[1]), 'unclaimed-forensic-vintage.json'),
  'preserved crash artifact\n', 'utf8')
check('an arbitrary vintage filename poisons the lane before the receipt-count fast path',
  connectorCurrentStatus(
    unexpectedVintageName.connector, 'WHEAT', unexpectedVintageName.dataDir, deadline,
  ) === null)

const unexpectedReceiptName = canonicalFixture()
fs.renameSync(
  unexpectedReceiptName.receiptPaths[0],
  path.join(path.dirname(unexpectedReceiptName.receiptPaths[0]), 'renamed-older-receipt.json'),
)
check('a renamed older receipt poisons the lane even when receipt count still equals committed count',
  connectorCurrentStatus(
    unexpectedReceiptName.connector, 'WHEAT', unexpectedReceiptName.dataDir, deadline,
  ) === null)

// The receipt's own content_sha256/retrieved_at are the two fields NOT covered by any hash: the vintage
// bytes are pinned by head.metadata_sha256 and the chain hash binds head to prior_head, but neither
// covers what the receipt claims about the blob or the retrieval instant. Only the direct receipt↔vintage
// equality does — so without these two branches, deleting that comparison leaves the suite green while a
// receipt is free to disagree with the evidence it certifies.
const receiptContentDrift = canonicalFixture()
const driftedContentReceipt = JSON.parse(fs.readFileSync(receiptContentDrift.receiptPaths[1], 'utf8'))
driftedContentReceipt.content_sha256 = 'f'.repeat(64)
fs.writeFileSync(receiptContentDrift.receiptPaths[1], `${canonicalJson(driftedContentReceipt)}\n`)
check('a receipt claiming a different content hash than its vintage is rejected',
  connectorCurrentStatus(
    receiptContentDrift.connector, 'WHEAT', receiptContentDrift.dataDir, deadline,
  ) === null)

const receiptRetrievedDrift = canonicalFixture()
const driftedRetrievedReceipt = JSON.parse(fs.readFileSync(receiptRetrievedDrift.receiptPaths[1], 'utf8'))
driftedRetrievedReceipt.retrieved_at = '2026-07-11T00:00:00Z' // a valid instant, but not the vintage's
fs.writeFileSync(receiptRetrievedDrift.receiptPaths[1], `${canonicalJson(driftedRetrievedReceipt)}\n`)
check('a receipt claiming a different retrieval instant than its vintage is rejected',
  connectorCurrentStatus(
    receiptRetrievedDrift.connector, 'WHEAT', receiptRetrievedDrift.dataDir, deadline,
  ) === null)

const rollback = canonicalFixture()
const firstVintage = JSON.parse(fs.readFileSync(rollback.vintagePaths[0], 'utf8'))
const rolledBackCurrent = {
  ...firstVintage, committed_count: 1, committed_head: rollback.heads[0], commit_protocol_version: 1,
  commit_receipt_path: `_connectors/commits/${rollback.connector.dataset_id}/${rollback.connector.series_id}/WHEAT/${rollback.heads[0].metadata_sha256}.json`,
}
fs.writeFileSync(rollback.currentPath, `${canonicalJson(rolledBackCurrent)}\n`)
check('tail rollback is rejected because the next immutable sequence marker exists',
  connectorCurrentStatus(rollback.connector, 'WHEAT', rollback.dataDir, deadline) === null)

const rollbackWithoutLaterMarker = canonicalFixture()
const rollbackFirstVintage = JSON.parse(fs.readFileSync(rollbackWithoutLaterMarker.vintagePaths[0], 'utf8'))
const rollbackFirstCurrent = {
  ...rollbackFirstVintage, committed_count: 1, committed_head: rollbackWithoutLaterMarker.heads[0],
  commit_protocol_version: 1,
  commit_receipt_path: `_connectors/commits/${rollbackWithoutLaterMarker.connector.dataset_id}/${rollbackWithoutLaterMarker.connector.series_id}/WHEAT/${rollbackWithoutLaterMarker.heads[0].metadata_sha256}.json`,
}
fs.writeFileSync(rollbackWithoutLaterMarker.currentPath, `${canonicalJson(rollbackFirstCurrent)}\n`)
const secondMarkerPath = path.join(rollbackWithoutLaterMarker.dataDir, '_connectors', 'committed_heads',
  rollbackWithoutLaterMarker.connector.dataset_id, rollbackWithoutLaterMarker.connector.series_id,
  'WHEAT', '00000000000000000002.json')
fs.unlinkSync(secondMarkerPath)
check('tail rollback is rejected when the later marker is gone but its receipt and vintage survive',
  connectorCurrentStatus(rollbackWithoutLaterMarker.connector, 'WHEAT', rollbackWithoutLaterMarker.dataDir, deadline) === null)

const sameSequenceLoser = canonicalFixture()
addSealedReceiptBranch(sameSequenceLoser, 2, sameSequenceLoser.heads[0], '2026-07-12T00:00:00.000001Z')
check('a fully sealed same-sequence loser remains auditable without poisoning the marker winner',
  connectorCurrentStatus(sameSequenceLoser.connector, 'WHEAT', sameSequenceLoser.dataDir, deadline) !== null)

const unmarkedSuccessor = canonicalFixture()
addSealedReceiptBranch(unmarkedSuccessor, 3, unmarkedSuccessor.heads[1], '2026-07-13T00:00:00.000001Z')
check('an unmarked linked successor receipt is not current before publisher recovery claims its marker',
  connectorCurrentStatus(unmarkedSuccessor.connector, 'WHEAT', unmarkedSuccessor.dataDir, deadline) === null)

for (const field of ['provider_priority', 'content_sha256', 'blob_path', 'connector_fingerprint', 'connector_commit']) {
  const missingIdentity = canonicalFixture()
  resealLatestVintage(missingIdentity, (vintage) => { delete vintage[field] })
  check(`a coherently resealed vintage missing ${field} cannot become current`,
    connectorCurrentStatus(missingIdentity.connector, 'WHEAT', missingIdentity.dataDir, deadline) === null)
}

for (const [field, replacement] of [
  ['provider', 'Another provider'],
  ['content_sha256', 'f'.repeat(64)],
  ['retrieved_at', '2026-07-12T00:00:00.000001Z'],
] as const) {
  const mismatchedProvenance = canonicalFixture()
  resealLatestVintage(mismatchedProvenance, (vintage) => { vintage.provenance[field] = replacement })
  check(`a self-hashed vintage cannot detach provenance ${field} from its frozen identity`,
    connectorCurrentStatus(
      mismatchedProvenance.connector, 'WHEAT', mismatchedProvenance.dataDir, deadline,
    ) === null)
}

const validManualVintage = canonicalFixture({ manual: true })
check('a manual vintage closes only with exact runner-owned local-byte attestation',
  connectorCurrentStatus(validManualVintage.connector, 'WHEAT', validManualVintage.dataDir, deadline) !== null)
const missingManualAttestation = canonicalFixture({ manual: true })
resealLatestVintage(missingManualAttestation, (vintage) => { delete vintage.manual_input })
check('a manual vintage missing its top-level byte attestation is rejected',
  connectorCurrentStatus(
    missingManualAttestation.connector, 'WHEAT', missingManualAttestation.dataDir, deadline,
  ) === null)
const mismatchedManualAttestation = canonicalFixture({ manual: true })
resealLatestVintage(mismatchedManualAttestation, (vintage) => {
  vintage.provenance.manual_input.sha256 = 'b'.repeat(64)
})
check('a manual vintage whose provenance attestation differs from the top-level bytes is rejected',
  connectorCurrentStatus(
    mismatchedManualAttestation.connector, 'WHEAT', mismatchedManualAttestation.dataDir, deadline,
  ) === null)

const prettyPrintedVintage = canonicalFixture()
resealLatestVintage(prettyPrintedVintage, () => {}, (_bytes, vintage) =>
  Buffer.from(`${JSON.stringify(vintage, null, 2)}\n`, 'utf8'))
check('a pretty-printed immutable vintage is rejected even when its recomputed head binds those raw bytes',
  connectorCurrentStatus(
    prettyPrintedVintage.connector, 'WHEAT', prettyPrintedVintage.dataDir, deadline,
  ) === null)
const duplicateKeyVintage = canonicalFixture()
resealLatestVintage(duplicateKeyVintage, () => {}, (bytes) =>
  Buffer.from(bytes.toString('utf8').replace(/^\{/, '{"acquisition":"shadow-value",'), 'utf8'))
check('a duplicate-key immutable vintage is rejected even when its recomputed head binds those raw bytes',
  connectorCurrentStatus(
    duplicateKeyVintage.connector, 'WHEAT', duplicateKeyVintage.dataDir, deadline,
  ) === null)

for (const [label, injected] of [
  ['unsafe integral number', '"unsafe":9007199254740992,'],
  ['non-finite number', '"nonfinite":NaN,'],
  ['lone surrogate', '"lone":"\\ud800",'],
] as const) {
  const invalidCanonicalValue = canonicalFixture()
  const currentBytes = fs.readFileSync(invalidCanonicalValue.currentPath, 'utf8')
  fs.writeFileSync(invalidCanonicalValue.currentPath, currentBytes.replace(/^\{/, `{${injected}`), 'utf8')
  check(`canonical current fails closed on ${label}`,
    connectorCurrentStatus(
      invalidCanonicalValue.connector, 'WHEAT', invalidCanonicalValue.dataDir, deadline,
    ) === null)
}

const fork = canonicalFixture()
const markerPath = path.join(fork.dataDir, '_connectors', 'committed_heads', fork.connector.dataset_id,
  fork.connector.series_id, 'WHEAT', '00000000000000000002.json')
const marker = JSON.parse(fs.readFileSync(markerPath, 'utf8'))
marker.committed_head.chain_sha256 = 'f'.repeat(64)
fs.writeFileSync(markerPath, `${canonicalJson(marker)}\n`)
check('same-sequence marker fork is rejected',
  connectorCurrentStatus(fork.connector, 'WHEAT', fork.dataDir, deadline) === null)

const badHeadReceipt = canonicalFixture()
const headReceipt = JSON.parse(fs.readFileSync(badHeadReceipt.receiptPaths[1], 'utf8'))
headReceipt.chain_sha256 = 'e'.repeat(64)
fs.writeFileSync(badHeadReceipt.receiptPaths[1], `${canonicalJson(headReceipt)}\n`, 'utf8')
check('tampered latest receipt is rejected',
  connectorCurrentStatus(badHeadReceipt.connector, 'WHEAT', badHeadReceipt.dataDir, deadline) === null)
const noncanonicalReceipt = canonicalFixture()
fs.appendFileSync(noncanonicalReceipt.receiptPaths[1], ' ')
check('a noncanonical commit receipt is rejected even when its JSON value is unchanged',
  connectorCurrentStatus(noncanonicalReceipt.connector, 'WHEAT', noncanonicalReceipt.dataDir, deadline) === null)
const noncanonicalMarker = canonicalFixture()
const noncanonicalMarkerPath = path.join(
  noncanonicalMarker.dataDir, '_connectors', 'committed_heads', noncanonicalMarker.connector.dataset_id,
  noncanonicalMarker.connector.series_id, 'WHEAT', '00000000000000000002.json',
)
fs.appendFileSync(noncanonicalMarkerPath, ' ')
check('a noncanonical sequence marker is rejected even when its JSON value is unchanged',
  connectorCurrentStatus(noncanonicalMarker.connector, 'WHEAT', noncanonicalMarker.dataDir, deadline) === null)
const transformDrift = canonicalFixture()
fs.appendFileSync(path.join(transformDrift.connector.dir, 'fetch.py'), '# changed after publish\n')
check('current pointer is rejected after deployed transform fingerprint drift',
  connectorCurrentStatus(transformDrift.connector, 'WHEAT', transformDrift.dataDir, deadline) === null)
const rawBlobDrift = canonicalFixture()
fs.appendFileSync(rawBlobDrift.blobPaths[1], ' ')
check('even whitespace-only raw blob tampering breaks byte-hash verification',
  connectorCurrentStatus(rawBlobDrift.connector, 'WHEAT', rawBlobDrift.dataDir, deadline) === null)

for (const root of fixtureRoots) fs.rmSync(root, { recursive: true, force: true })
console.log(`\nconnector-registry.test.ts: ${passed} passed${process.exitCode ? ' (with failures)' : ''}`)
