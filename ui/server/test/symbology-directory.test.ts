// Directory-layer symbology tests (the network-facing half of symbology.ts, driven with a STUBBED fetch
// — no network anywhere). Locks the three review fixes on PR #322:
//   • the TTL cache must NOT pin a transient upstream failure for 6 h (Gemini high r3635665837 / Codex
//     P2 r3635672845) — a recovered lookup must re-fetch;
//   • a failed sibling-enrichment must NOT discard the successfully-fetched primary result (Gemini high
//     r3635665840);
//   • dotted legal forms (S.A., N.V., S.p.A.) must fold like their undotted spelling (Codex P2
//     r3635737332), else the same issuer splits into two groups and never shares aliases.
// Each assertion is red on the pre-fix code and green after. Run: npx tsx test/symbology-directory.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { coreCompanyName, invalidateSymbolCache, searchSymbolsChecked, searchSymbolsEnriched, verifyEquityListing } from '../src/news/symbology'

let passed = 0
async function check(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// A Response-like stub: only the .ok flag and .json() are used by searchSymbols().
type Q = { quoteType: string; symbol: string; longname?: string; shortname?: string; exchDisp?: string }
const resp = (ok: boolean, quotes: Q[] = [], status = ok ? 200 : 503) => ({ ok, status, json: async () => ({ quotes }) }) as any

async function main() {
  // #3 — dotted legal-form normalisation. Expected value pinned to the rule the code documents:
  // legal suffixes strip regardless of dotting, so a dotted spelling folds to the same core identity.
  await check('coreCompanyName folds dotted legal forms like their undotted spelling (S.A. / N.V. / S.p.A.)', () => {
    assert.equal(coreCompanyName('Acme S.A.'), 'acme')
    assert.equal(coreCompanyName('Acme S.A.'), coreCompanyName('Acme SA'))
    assert.equal(coreCompanyName('Koninklijke DSM N.V.'), 'koninklijke dsm')
    assert.equal(coreCompanyName('Davide Campari-Milano S.p.A.'), coreCompanyName('Davide Campari-Milano SpA'))
  })

  // #1 — a transient upstream failure (a non-OK response → searchSymbols returns []) must not be cached
  // for the full TTL, or the recovered endpoint stays locked out. Red-on-old: old code caches the [] and
  // the second lookup serves it; green-on-new: the second lookup re-fetches and returns the group.
  await check('a transient-failure [] is NOT cached — the recovered lookup returns the group', async () => {
    invalidateSymbolCache()
    let mode: 'fail' | 'ok' = 'fail'
    const fetchImpl = (async () => mode === 'fail'
      ? resp(false)
      : resp(true, [
          { quoteType: 'EQUITY', symbol: 'FOO', longname: 'Foo Holdings', exchDisp: 'NYSE' },
          { quoteType: 'EQUITY', symbol: 'FOO.L', longname: 'Foo Holdings', exchDisp: 'LSE' },
        ])) as any
    const first = await searchSymbolsEnriched('foozzz', fetchImpl)
    assert.equal(first.length, 0, 'the failed lookup yields no groups')
    mode = 'ok'
    const second = await searchSymbolsEnriched('foozzz', fetchImpl)
    assert.ok(second.length > 0, 'the recovered lookup must re-fetch (a cached [] would keep it empty)')
    assert.equal(second[0].symbol, 'FOO')
  })

  // #2 — the primary search succeeded (a lone listing), the by-core-name enrichment follow-up throws.
  // Red-on-old: the single outer try/catch discards the primary and returns []; green-on-new: the
  // enrichment failure is swallowed and the primary group survives (just with fewer cross-listing aliases).
  await check('a failed sibling-enrichment keeps the successfully-fetched primary group', async () => {
    invalidateSymbolCache()
    const fetchImpl = (async (url: string) => {
      if (String(url).includes('q=nhydy')) {
        return resp(true, [{ quoteType: 'EQUITY', symbol: 'NHYDY', longname: 'Norsk Hydro ASA', exchDisp: 'OTC' }])
      }
      throw new Error('enrichment upstream down') // the follow-up by core name ("norsk hydro") fails
    }) as any
    const groups = await searchSymbolsEnriched('nhydy', fetchImpl)
    assert.equal(groups.length, 1, 'the primary result is preserved despite the enrichment failure')
    assert.equal(groups[0].symbol, 'NHYDY')
  })

  await check('listing verification never assigns a sibling venue or a colliding base ticker', async () => {
    invalidateSymbolCache()
    const fetchImpl = (async () => resp(true, [
      { quoteType: 'EQUITY', symbol: 'ACME.L', longname: 'Acme UK PLC', exchDisp: 'LSE' },
      { quoteType: 'EQUITY', symbol: 'ACME', longname: 'Different Acme Inc', exchDisp: 'NYSE' },
    ])) as any
    assert.equal(await verifyEquityListing('ACME.L', 'Acme UK', fetchImpl).then((x) => x?.exchange), 'LSE')
    assert.equal(await verifyEquityListing('ACME', 'Acme UK', fetchImpl), null, 'same base/alias cannot borrow the sibling listing venue')
  })

  await check('checked search distinguishes a healthy empty result from directory failure', async () => {
    const empty = await searchSymbolsChecked('nothing', (async () => resp(true, [])) as any)
    assert.deepEqual(empty, { status: 'ok', groups: [] })
    const limited = await searchSymbolsChecked('limited', (async () => resp(false, [], 429)) as any)
    assert.deepEqual(limited, { status: 'unavailable', groups: [], reason: 'http_error', httpStatus: 429 })
    const offline = await searchSymbolsChecked('offline', (async () => { throw new Error('offline') }) as any)
    assert.deepEqual(offline, { status: 'unavailable', groups: [], reason: 'timeout_or_network' })
  })

  await check('checked search makes exactly one raw request and never performs sibling enrichment', async () => {
    invalidateSymbolCache()
    let calls = 0
    const result = await searchSymbolsChecked('NHYDY', (async () => {
      calls++
      return resp(true, [{ quoteType: 'EQUITY', symbol: 'NHYDY', longname: 'Norsk Hydro ASA', exchDisp: 'OTC' }])
    }) as any)
    assert.equal(result.status, 'ok')
    assert.equal(calls, 1)
  })

  await check('checked search reuses a healthy cache result without another raw request', async () => {
    invalidateSymbolCache()
    let calls = 0
    const fetchImpl = (async () => {
      calls++
      return resp(true, [{ quoteType: 'EQUITY', symbol: 'CACHE', longname: 'Cache Holdings', exchDisp: 'NYSE' }])
    }) as any
    assert.equal((await searchSymbolsChecked('CACHE', fetchImpl, { useCache: true })).status, 'ok')
    assert.equal((await searchSymbolsChecked('cache', fetchImpl, { useCache: true })).status, 'ok')
    assert.equal(calls, 1)
  })
}

main().then(() => console.log(`\nsymbology-directory.test.ts: ${passed} passed`))
