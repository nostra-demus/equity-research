// connector-registry — discovery + fail-closed manifest validation + cadence intervals. Run:
// npx tsx test/connector-registry.test.ts. Uses the two committed reference connectors as live fixtures,
// plus pure parseManifest edge cases.
let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

const { listConnectors, parseManifest, cadenceIntervalMs, builtBySatisfies } = await import('../src/connector-registry')

// ---- discovery: the committed reference connectors are found + parsed ----
const cons = listConnectors()
check('discovers the committed connectors (>= 2)', cons.length >= 2, `found ${cons.length}`)
const cot = cons.find((c) => c.id === 'cftc-cot-wheat-srw')
check('the CFTC connector is discovered', !!cot)
check('its subjects + cadence + entry parsed', !!cot && cot.subjects.includes('WHEAT') && cot.cadence === 'weekly' && cot.entry === 'fetch.py')
check('its host_allowlist parsed', !!cot && cot.host_allowlist.includes('publicreporting.cftc.gov'))

// ---- cadence intervals ----
check('daily interval = 24h', cadenceIntervalMs('daily') === 24 * 3600_000)
check('weekly interval = 7d', cadenceIntervalMs('weekly') === 7 * 24 * 3600_000)
check('event_driven has no clock (null)', cadenceIntervalMs('event_driven') === null)
check('unknown cadence → null', cadenceIntervalMs('hourly') === null)

// ---- builtBySatisfies: satisfies slug → connector id ----
const map = builtBySatisfies(cons)
check('satisfies slugs map back to a connector id', map.size >= 1 && [...map.values()].includes('cftc-cot-wheat-srw'))

// ---- parseManifest fail-closed edges ----
const good = { id: 'x-y', cadence: 'daily', entry: 'fetch.py', subjects: ['WHEAT'], satisfies: ['s'], host_allowlist: ['h.com'], tier: 5, staleness_sla_days: 10 }
check('a well-formed manifest parses', !!parseManifest('/tmp/x', good))
check('bad id rejected', parseManifest('/tmp/x', { ...good, id: 'Bad Id' }) === null)
check('unknown cadence rejected', parseManifest('/tmp/x', { ...good, cadence: 'hourly' }) === null)
check('entry with a path separator rejected (must be a plain filename)', parseManifest('/tmp/x', { ...good, entry: '../evil.py' }) === null)
check('empty subjects rejected', parseManifest('/tmp/x', { ...good, subjects: [] }) === null)
check('non-object rejected', parseManifest('/tmp/x', null) === null && parseManifest('/tmp/x', [1]) === null)
check('sla<=0 becomes null (no false staleness)', parseManifest('/tmp/x', { ...good, staleness_sla_days: 0 })!.staleness_sla_days === null)

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
